import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateInvoiceForSubscription } from '@/lib/recurringServer';
import { notify } from '@/lib/notify';

// CRON : facture automatiquement les abonnements récurrents ACTIFS échus (next_billing_date <= today,
// auto_invoice = true) → crée une facture + avance l'échéance + notifie le tenant. Protégé par CRON_SECRET.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function run(todayMs: number): Promise<{ billed: number }> {
  const today = new Date(todayMs).toISOString().slice(0, 10);
  const { data: subs } = await supabaseAdmin.from('recurring_subscriptions')
    .select('*').eq('status', 'active').eq('auto_invoice', true).not('next_billing_date', 'is', null).lte('next_billing_date', today);
  let billed = 0;
  for (const sub of (subs as any[]) || []) {
    try {
      const invId = await generateInvoiceForSubscription(sub.tenant_id, sub, todayMs);
      await notify({ tenant: sub.tenant_id, title: `Facture récurrente émise — ${sub.client_name}`, body: `${sub.plan_name} : ${(Number(sub.amount) || 0).toLocaleString('fr-CA')} $`, category: 'facture', link: `/${sub.tenant_id}/admin?tab=factures`, channels: ['in_app'] });
      if (invId) billed++;
    } catch { /* on continue les autres abonnements */ }
  }
  return { billed };
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try { const r = await run(Date.now()); return NextResponse.json({ ok: true, ...r }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
