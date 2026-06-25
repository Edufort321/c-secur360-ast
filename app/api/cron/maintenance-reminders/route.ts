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
    // Réglages par tenant (digest opérateur) + clients opt-in (digest client).
    const { data: settings } = await supabaseAdmin.from('company_settings')
      .select('tenant_id, maintenance_reminder_email, support_email, maintenance_reminder_days, maintenance_reminders_enabled');
    const { data: optClients } = await supabaseAdmin.from('clients')
      .select('id, tenant_id, name, maintenance_alert_email, email')
      .eq('maintenance_auto_notify', true);

    const cfg = new Map<string, any>(((settings || []) as any[]).map(s => [s.tenant_id, s]));
    const clientsByTenant = new Map<string, any[]>();
    for (const c of ((optClients || []) as any[])) { const a = clientsByTenant.get(c.tenant_id) || []; a.push(c); clientsByTenant.set(c.tenant_id, a); }

    // Tenants à traiter = digest opérateur activé OU au moins un client opt-in.
    const tenants = new Set<string>();
    for (const s of ((settings || []) as any[])) if (s.maintenance_reminders_enabled) tenants.add(s.tenant_id);
    for (const t of clientsByTenant.keys()) tenants.add(t);

    const fmt = (it: any, withClient = true) => {
      const when = it.days < 0 ? `en retard de ${Math.abs(it.days)} j` : it.days === 0 ? "aujourd'hui" : `dans ${it.days} j`;
      const who = withClient && it.client_name ? ` — ${it.client_name}` : '';
      return `• ${it.title}${it.equipment_name ? ` (${it.equipment_name})` : ''}${who} — ${when} [${it.due_date}]`;
    };

    let opsSent = 0, clientsSent = 0;
    for (const tenant of tenants) {
      const s = cfg.get(tenant) || {};
      const horizon = Number(s.maintenance_reminder_days) > 0 ? Number(s.maintenance_reminder_days) : 14;
      let items: any[] = [];
      try { items = await getPlannedItems(tenant, supabaseAdmin); } catch { continue; }
      const due = items.filter(it => it.days < 0 || it.days <= horizon);
      if (!due.length) continue;

      // 1) Digest OPÉRATEUR (si activé).
      const opEmail = s.maintenance_reminders_enabled ? (s.maintenance_reminder_email || s.support_email || null) : null;
      if (opEmail) {
        const overdue = due.filter(it => it.days < 0);
        const soon = due.filter(it => it.days >= 0);
        const body = [
          overdue.length ? `EN RETARD :\n${overdue.map(it => fmt(it)).join('\n')}` : '',
          soon.length ? `À VENIR (≤ ${horizon} j) :\n${soon.map(it => fmt(it)).join('\n')}` : '',
          '\nOuvrez le module Maintenance › Tableau de bord pour planifier.',
        ].filter(Boolean).join('\n\n');
        await notify({ tenant, title: `Maintenance — ${due.length} échéance(s) à planifier`, body, severity: overdue.length ? 'critical' : 'warning', category: 'maintenance', channels: ['email', 'in_app'], email: opEmail });
        opsSent++;
      }

      // 2) Digest CLIENT (opt-in) — uniquement SES échéances.
      for (const c of (clientsByTenant.get(tenant) || [])) {
        const to = c.maintenance_alert_email || c.email || null;
        if (!to) continue;
        const mine = due.filter(it => it.client_id === c.id);
        if (!mine.length) continue;
        const body = `Bonjour${c.name ? ' ' + c.name : ''},\n\nUn entretien préventif de vos équipements est bientôt à planifier :\n\n${mine.map(it => fmt(it, false)).join('\n')}\n\nNotre équipe communiquera avec vous pour fixer une date. Merci.`;
        await notify({ tenant, title: 'Maintenance à planifier — C-Secur360', body, severity: 'info', category: 'maintenance', channels: ['email'], email: to });
        clientsSent++;
      }
    }
    return NextResponse.json({ ok: true, operators_notified: opsSent, clients_notified: clientsSent });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
