// Cron quotidien : rappels HSE par courriel (J-7 / J-3 / J-jour / en retard) pour les échéances
// réglementaires et les révisions de registres. Envoie au reminder_email du tenant (notify : email + in-app).
// Protégé par CRON_SECRET. Best-effort par tenant.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notify } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const dayDiff = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const bucket = (d: number) => (d < 0 ? 'en retard' : d === 0 ? "aujourd'hui" : d <= 3 ? `dans ${d} j` : d <= 7 ? `dans ${d} j` : null);

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    // D'abord, marquer les échéances dépassées.
    try { await supabaseAdmin.rpc('hse_mark_overdue_deadlines'); } catch { /* best-effort */ }

    const { data: settings } = await supabaseAdmin.from('hse_tenant_settings').select('tenant_id, reminder_email').not('reminder_email', 'is', null);
    let sent = 0;
    for (const s of (settings || []) as any[]) {
      const tenant = s.tenant_id; const email = s.reminder_email;
      if (!email) continue;
      const horizon = new Date(Date.now() + 7 * 86400000).toISOString();

      const { data: deadlines } = await supabaseAdmin.from('hse_compliance_deadline')
        .select('label_fr, due_at, status').eq('tenant_id', tenant).in('status', ['pending', 'overdue']).lte('due_at', horizon).order('due_at');
      const { data: reviews } = await supabaseAdmin.from('hse_v_register_due').select('title, name_fr, review_due_at').eq('tenant_id', tenant);

      const dLines = (deadlines || []).map((d: any) => { const b = bucket(dayDiff(d.due_at)); return b ? `• ${d.label_fr || 'Échéance'} — ${b}` : null; }).filter(Boolean);
      const rLines = (reviews || []).map((r: any) => { const b = bucket(dayDiff(r.review_due_at)); return b ? `• ${r.title} (${r.name_fr}) — révision ${b}` : null; }).filter(Boolean);
      if (!dLines.length && !rLines.length) continue;

      const body = [
        dLines.length ? `Échéances réglementaires :\n${dLines.join('\n')}` : '',
        rLines.length ? `Révisions de registres :\n${rLines.join('\n')}` : '',
        '\nConnectez-vous au module Santé et sécurité pour agir.',
      ].filter(Boolean).join('\n\n');

      await notify({ tenant, title: `Rappels SST — ${dLines.length + rLines.length} échéance(s) à venir`, body, severity: 'warning', category: 'hse', channels: ['email', 'in_app'], email });
      sent++;
    }
    return NextResponse.json({ ok: true, tenants_notified: sent });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
