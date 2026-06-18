// Notification CLIENT « travaux de maintenance à planifier » (phase 2/3, mode MANUEL).
// L'adresse est résolue CÔTÉ SERVEUR depuis clientId (jamais fournie par le client → anti-abus).
// Courriel via Resend (comme lib/notify). Auth requise + tenant de session (super_admin = tenant demandé).
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log(`[MAINTENANCE NOTIFY] ${to}: ${subject}\n${text}`); return true; } // pas de clé = log (dev)
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@csecur360.com', to, subject,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px"><h2 style="color:#1e293b;margin:0 0 8px">${esc(subject)}</h2><p style="color:#475569;white-space:pre-wrap">${esc(text)}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/><p style="color:#94a3b8;font-size:12px">C-Secur360 · Planification de maintenance</p></div>`,
    }),
  });
  return r.ok;
}

// POST { tenant, clientId, summary } -> envoie au client (adresse résolue serveur). { ok, to } | { error }
export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const reqTenant = String(body.tenant || '').trim();
  const tenant = u.role === 'super_admin' ? (reqTenant || u.tenant_id) : u.tenant_id;
  if (reqTenant && u.role !== 'super_admin' && reqTenant !== u.tenant_id) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const clientId = String(body.clientId || '');
  if (!clientId) return NextResponse.json({ error: 'clientId requis' }, { status: 400 });

  const { data: cl } = await supabaseAdmin.from('clients').select('*').eq('tenant_id', tenant).eq('id', clientId).maybeSingle();
  if (!cl) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  const to = (cl as any).maintenance_alert_email || (cl as any).email || '';
  if (!to) return NextResponse.json({ error: 'Aucune adresse courriel pour ce client (ajoutez une adresse d’alerte).' }, { status: 422 });

  const summary = String(body.summary || '').slice(0, 4000);
  const text = `Bonjour${(cl as any).name ? ' ' + (cl as any).name : ''},\n\nUn entretien préventif de vos équipements est bientôt à planifier. Notre équipe communiquera avec vous pour fixer une date.\n\n${summary}\n\nMerci.`;
  const ok = await sendEmail(to, 'Maintenance à planifier — C-Secur360', text);
  if (!ok) return NextResponse.json({ error: 'Envoi du courriel échoué.' }, { status: 502 });
  return NextResponse.json({ ok: true, to });
}
