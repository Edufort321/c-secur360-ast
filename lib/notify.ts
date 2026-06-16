// Livraison d'alertes/notifications multi-canal — SERVEUR (service_role). In-app + courriel (Resend)
// + SMS (Twilio REST). Best-effort par canal : un canal qui échoue ne bloque pas les autres.
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type Channel = 'in_app' | 'email' | 'sms';
export type NotifyInput = {
  tenant: string; userId?: string | null;
  title: string; body?: string; severity?: 'info' | 'warning' | 'critical';
  category?: string; link?: string;
  channels?: Channel[]; email?: string | null; phone?: string | null;
};

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log(`[ALERTE EMAIL] ${to}: ${subject}`); return; }
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@csecur360.com', to, subject,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px"><h2 style="color:#1e293b;margin:0 0 8px">${subject}</h2><p style="color:#475569;white-space:pre-wrap">${text}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/><p style="color:#cbd5e1;font-size:12px">C-Secur360 · Alerte automatique</p></div>`,
    }),
  });
}

async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER, msid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!sid || !token || (!from && !msid)) { console.log(`[ALERTE SMS] ${to}: ${body}`); return; }
  const params = new URLSearchParams({ To: to, Body: body });
  if (msid) params.set('MessagingServiceSid', msid); else if (from) params.set('From', from);
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}` },
    body: params.toString(),
  });
}

/** Crée une notification in-app et/ou envoie courriel/SMS selon les canaux demandés. Best-effort. */
export async function notify(n: NotifyInput): Promise<void> {
  const channels = n.channels && n.channels.length ? n.channels : ['in_app'];
  if (channels.includes('in_app')) {
    try {
      await supabaseAdmin.from('notifications').insert({
        tenant_id: n.tenant, user_id: n.userId || null, title: n.title, body: n.body || null,
        severity: n.severity || 'info', category: n.category || null, link: n.link || null,
      });
    } catch { /* best-effort */ }
  }
  if (channels.includes('email') && n.email) { try { await sendEmail(n.email, n.title, n.body || n.title); } catch { /* best-effort */ } }
  if (channels.includes('sms') && n.phone) { try { await sendSms(n.phone, `${n.title}${n.body ? ' — ' + n.body : ''}`); } catch { /* best-effort */ } }
}
