import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeFinancialAnalytics } from '@/lib/financialAnalytics';
import { aggregateBalanceSheet } from '@/lib/valuation';

// Snapshot financier pour la VALORISATION (#33) : EBITDA, EBIT, CA, bilan agrégé + détention par
// actionnaire (cap table). Sensible → service_role + niveau direction/super_user + effectiveTenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, new URL(req.url).searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (!canShareholders(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  // Grand livre (en-têtes + lignes + compte) pour l'analytique EBITDA.
  const { data: entries } = await supabaseAdmin
    .from('gl_entries').select('entry_date, posted, gl_lines(debit, credit, gl_accounts(code,name,type))')
    .eq('tenant_id', tenant);
  const a = computeFinancialAnalytics((entries as any[]) || [], { granularity: 'year' });
  // Valorisation sur l'EBITDA du DERNIER exercice (annuel), pas le cumul depuis la création.
  const last = a.periods[a.periods.length - 1];
  const ebitdaAnnual = last ? last.ebitda : a.ebitdaTotal;
  const revenueAnnual = last ? last.revenue : a.revenueTotal;
  const capexAnnual = last ? last.capex : a.capexTotal;
  const ebit = last ? (last.margin + last.interest + last.tax) : (a.marginTotal + a.interestTotal + a.taxTotal); // EBIT annuel

  // Balance de vérification (soldes par compte) + plan comptable → bilan agrégé.
  const [{ data: accounts }, { data: lines }] = await Promise.all([
    supabaseAdmin.from('gl_accounts').select('id, code, type, name').eq('tenant_id', tenant),
    supabaseAdmin.from('gl_lines').select('account_id, debit, credit, gl_entries!inner(posted, tenant_id)').eq('tenant_id', tenant),
  ]);
  const balances: Record<string, { debit: number; credit: number }> = {};
  ((lines as any[]) || []).forEach((l: any) => {
    if (!l.gl_entries?.posted) return;
    const k = l.account_id; if (!balances[k]) balances[k] = { debit: 0, credit: 0 };
    balances[k].debit += Number(l.debit) || 0; balances[k].credit += Number(l.credit) || 0;
  });
  const balanceSheet = aggregateBalanceSheet((accounts as any[]) || [], balances);

  // Détention par actionnaire (cap table).
  const [{ data: txns }, { data: sh }] = await Promise.all([
    supabaseAdmin.from('share_transactions').select('shareholder_id, shares').eq('tenant_id', tenant),
    supabaseAdmin.from('shareholders').select('id, full_name').eq('tenant_id', tenant),
  ]);
  const holdMap: Record<string, number> = {};
  ((txns as any[]) || []).forEach((t: any) => { holdMap[t.shareholder_id] = (holdMap[t.shareholder_id] || 0) + (Number(t.shares) || 0); });
  const nameMap: Record<string, string> = {}; ((sh as any[]) || []).forEach((s: any) => { nameMap[s.id] = s.full_name; });
  const holdings = Object.entries(holdMap).filter(([, n]) => (n as number) !== 0).map(([id, shares]) => ({ id, name: nameMap[id] || '—', shares: shares as number }));
  const sharesOutstanding = holdings.reduce((s, h) => s + h.shares, 0);

  return NextResponse.json({
    revenue: revenueAnnual, ebitda: ebitdaAnnual, ebit, capex: capexAnnual,
    dna: last ? last.dna : a.dnaTotal, interest: last ? last.interest : a.interestTotal, tax: last ? last.tax : a.taxTotal,
    // cumuls depuis la création (contexte) :
    revenueLifetime: a.revenueTotal, ebitdaLifetime: a.ebitdaTotal,
    balanceSheet, holdings, sharesOutstanding,
  });
}
