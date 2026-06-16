import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notify } from '@/lib/notify';

// CRON : relances automatiques (dunning) des factures « envoyées » échues. Pour chaque tenant
// (dunning activé), relance à des paliers de retard (jours) : notif in-app au tenant + courriel au
// client avec un lien de consultation. Throttle 20 h. Protégé par CRON_SECRET.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const money = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
function newToken() {
  const u = () => (globalThis.crypto?.randomUUID?.() || '').replace(/-/g, '');
  return (u() + u()).slice(0, 48);
}
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.c-secur360.ca').replace(/\/$/, '');

async function run(todayMs: number): Promise<{ tenants: number; reminders: number }> {
  const today = new Date(todayMs).toISOString().slice(0, 10);
  // Factures transmises, échues, non payées.
  const { data: invoices } = await supabaseAdmin.from('commerce_invoices')
    .select('id, tenant_id, invoice_number, total, due_date, client_snapshot, reminder_count, last_reminder_at, status')
    .eq('status', 'sent').not('due_date', 'is', null).lt('due_date', today);
  const byTenant: Record<string, any[]> = {};
  ((invoices as any[]) || []).forEach(i => { (byTenant[i.tenant_id] ||= []).push(i); });

  const cutoff = todayMs - 20 * 3600 * 1000; // throttle 20 h
  let reminders = 0;
  for (const tenant of Object.keys(byTenant)) {
    const { data: cs } = await supabaseAdmin.from('company_settings').select('dunning_enabled, dunning_days, email').eq('tenant_id', tenant).maybeSingle();
    if ((cs as any) && (cs as any).dunning_enabled === false) continue; // dunning désactivé
    const days: number[] = Array.isArray((cs as any)?.dunning_days) ? (cs as any).dunning_days.map(Number).filter((n: number) => n >= 0).sort((a: number, b: number) => a - b) : [1, 7, 15, 30];

    for (const inv of byTenant[tenant]) {
      const overdue = Math.floor((todayMs - new Date(inv.due_date).getTime()) / 86400000);
      const reached = days.filter(d => overdue >= d).length;       // nb de paliers franchis
      if (reached <= (Number(inv.reminder_count) || 0)) continue;   // déjà relancé à ce palier
      if (inv.last_reminder_at && new Date(inv.last_reminder_at).getTime() > cutoff) continue; // throttle

      const clientName = inv.client_snapshot?.name || '—';
      const clientEmail = inv.client_snapshot?.email || null;
      const sev: 'warning' | 'critical' = reached >= 3 ? 'critical' : 'warning';
      // Notif in-app au tenant.
      await notify({
        tenant, title: `Facture ${inv.invoice_number} en retard de ${overdue} j`,
        body: `${clientName} — ${money(inv.total)} (relance ${reached})`, severity: sev,
        category: 'facture', link: `/${tenant}/admin?tab=factures`, channels: ['in_app'],
      });
      // Courriel de rappel au client (avec lien de consultation public), si courriel connu.
      if (clientEmail) {
        const token = newToken();
        await supabaseAdmin.from('document_shares').insert({ tenant_id: tenant, token, doc_type: 'invoice', doc_id: inv.id, doc_number: inv.invoice_number, created_by: 'dunning', expires_at: null });
        const url = `${APP_URL}/approbation/${token}`;
        await notify({
          tenant, channels: ['email'], email: clientEmail,
          title: `Rappel — facture ${inv.invoice_number}`,
          body: `Bonjour,\n\nLa facture ${inv.invoice_number} d'un montant de ${money(inv.total)} est échue depuis ${overdue} jour(s).\nVous pouvez la consulter ici : ${url}\n\nMerci.`,
        });
      }
      await supabaseAdmin.from('commerce_invoices').update({ reminder_count: reached, last_reminder_at: new Date(todayMs).toISOString() }).eq('id', inv.id);
      reminders++;
    }
  }
  return { tenants: Object.keys(byTenant).length, reminders };
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try { const r = await run(Date.now()); return NextResponse.json({ ok: true, ...r }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
