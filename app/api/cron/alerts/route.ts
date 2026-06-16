import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeFinancialAnalytics } from '@/lib/financialAnalytics';
import { aggregateBalanceSheet, altmanZScore } from '@/lib/valuation';
import { notify, type Channel } from '@/lib/notify';

// CRON : évalue les règles de seuils financiers de chaque tenant et déclenche les alertes
// (in-app / courriel / SMS). Protégé par CRON_SECRET. Throttle : 1 déclenchement / 20 h par règle.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const mny = (n: number) => `${Math.round(n).toLocaleString('fr-CA')} $`;

async function computeMetrics(tenant: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: entries }, { data: accounts }, { data: lines }, { data: invoices }] = await Promise.all([
    supabaseAdmin.from('gl_entries').select('entry_date, posted, gl_lines(debit, credit, gl_accounts(code,name,type))').eq('tenant_id', tenant),
    supabaseAdmin.from('gl_accounts').select('id, code, type, name').eq('tenant_id', tenant),
    supabaseAdmin.from('gl_lines').select('account_id, debit, credit, gl_entries!inner(posted, tenant_id)').eq('tenant_id', tenant),
    supabaseAdmin.from('commerce_invoices').select('total, status, due_date').eq('tenant_id', tenant).eq('status', 'sent'),
  ]);
  const a = computeFinancialAnalytics((entries as any[]) || [], { granularity: 'year' });
  const last = a.periods[a.periods.length - 1];
  const balances: Record<string, { debit: number; credit: number }> = {};
  ((lines as any[]) || []).forEach((l: any) => { if (!l.gl_entries?.posted) return; const k = l.account_id; if (!balances[k]) balances[k] = { debit: 0, credit: 0 }; balances[k].debit += Number(l.debit) || 0; balances[k].credit += Number(l.credit) || 0; });
  const bs = aggregateBalanceSheet((accounts as any[]) || [], balances);
  const ebit = last ? (last.margin + last.interest + last.tax) : (a.marginTotal + a.interestTotal + a.taxTotal);
  const altman = altmanZScore(bs, ebit);
  const arOverdue = ((invoices as any[]) || []).filter((i: any) => i.due_date && i.due_date < today).reduce((s: number, i: any) => s + (Number(i.total) || 0), 0);
  return { cash: bs.cash, marginPct: a.marginPct, ebitda: last ? last.ebitda : a.ebitdaTotal, altmanZ: altman.z, arOverdue };
}

// Retourne un message si la règle est franchie, sinon null.
function evaluate(rule: any, m: Awaited<ReturnType<typeof computeMetrics>>): { title: string; body: string; severity: 'warning' | 'critical' } | null {
  const t = Number(rule.threshold) || 0;
  switch (rule.metric) {
    case 'cash_below': return m.cash < t ? { title: '⚠️ Trésorerie sous le seuil', body: `Trésorerie ${mny(m.cash)} < seuil ${mny(t)}.`, severity: 'critical' } : null;
    case 'margin_pct_below': return m.marginPct < t ? { title: '⚠️ Marge sous le seuil', body: `Marge ${m.marginPct.toFixed(1)} % < seuil ${t} %.`, severity: 'warning' } : null;
    case 'ar_overdue_above': return m.arOverdue > t ? { title: '⚠️ Comptes à recevoir en retard', body: `En retard ${mny(m.arOverdue)} > seuil ${mny(t)}.`, severity: 'warning' } : null;
    case 'ebitda_below': return m.ebitda < t ? { title: '⚠️ EBITDA sous le seuil', body: `EBITDA ${mny(m.ebitda)} < seuil ${mny(t)}.`, severity: 'warning' } : null;
    case 'altman_below': return m.altmanZ < t ? { title: '🚨 Risque de détresse (Altman Z″)', body: `Z″ ${m.altmanZ.toFixed(2)} < seuil ${t}. Surveiller / agir.`, severity: 'critical' } : null;
    default: return null;
  }
}

async function run(): Promise<{ tenants: number; fired: number }> {
  const { data: rules } = await supabaseAdmin.from('alert_rules').select('*').eq('enabled', true);
  const byTenant: Record<string, any[]> = {};
  ((rules as any[]) || []).forEach((r: any) => { (byTenant[r.tenant_id] ||= []).push(r); });
  const cutoff = Date.now() - 20 * 3600 * 1000; // throttle 20 h
  let fired = 0;
  for (const tenant of Object.keys(byTenant)) {
    let m; try { m = await computeMetrics(tenant); } catch { continue; }
    for (const rule of byTenant[tenant]) {
      if (rule.last_fired_at && new Date(rule.last_fired_at).getTime() > cutoff) continue;
      const hit = evaluate(rule, m); if (!hit) continue;
      await notify({ tenant, title: hit.title, body: hit.body, severity: hit.severity, category: 'finance', link: `/${tenant}/admin?tab=etat-financier`, channels: (rule.channels || ['in_app']) as Channel[], email: rule.recipient_email, phone: rule.recipient_phone });
      await supabaseAdmin.from('alert_rules').update({ last_fired_at: new Date().toISOString() }).eq('id', rule.id);
      fired++;
    }
  }
  return { tenants: Object.keys(byTenant).length, fired };
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try { const r = await run(); return NextResponse.json({ ok: true, ...r }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
