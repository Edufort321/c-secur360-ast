// Cron quotidien : digest des échéances de MAINTENANCE (en retard + à venir dans l'horizon) envoyé à
// l'opérateur du tenant (maintenance_reminder_email, repli support_email). Protégé par CRON_SECRET.
// Activé par tenant via company_settings.maintenance_reminders_enabled. Best-effort par tenant.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notify } from '@/lib/notify';
import { getPlannedItems } from '@/lib/maintenancePlanning';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { data: settings } = await supabaseAdmin.from('company_settings')
      .select('tenant_id, maintenance_reminder_email, support_email, maintenance_reminder_days')
      .eq('maintenance_reminders_enabled', true);

    let sent = 0;
    for (const s of (settings || []) as any[]) {
      const tenant = s.tenant_id;
      const email = s.maintenance_reminder_email || s.support_email || null;
      if (!tenant || !email) continue;
      const horizon = Number(s.maintenance_reminder_days) > 0 ? Number(s.maintenance_reminder_days) : 14;

      let items: any[] = [];
      try { items = await getPlannedItems(tenant, supabaseAdmin); } catch { continue; }
      // En retard OU dû dans l'horizon.
      const due = items.filter(it => it.days < 0 || it.days <= horizon);
      if (!due.length) continue;

      const fmt = (it: any) => {
        const when = it.days < 0 ? `en retard de ${Math.abs(it.days)} j` : it.days === 0 ? "aujourd'hui" : `dans ${it.days} j`;
        const who = it.client_name ? ` — ${it.client_name}` : '';
        return `• ${it.title}${it.equipment_name ? ` (${it.equipment_name})` : ''}${who} — ${when} [${it.due_date}]`;
      };
      const overdue = due.filter(it => it.days < 0);
      const soon = due.filter(it => it.days >= 0);
      const body = [
        overdue.length ? `EN RETARD :\n${overdue.map(fmt).join('\n')}` : '',
        soon.length ? `À VENIR (≤ ${horizon} j) :\n${soon.map(fmt).join('\n')}` : '',
        '\nOuvrez le module Maintenance › Tableau de bord pour planifier.',
      ].filter(Boolean).join('\n\n');

      await notify({
        tenant, title: `Maintenance — ${due.length} échéance(s) à planifier`, body,
        severity: overdue.length ? 'critical' : 'warning', category: 'maintenance',
        channels: ['email', 'in_app'], email,
      });
      sent++;
    }
    return NextResponse.json({ ok: true, tenants_notified: sent });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
