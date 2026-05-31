// Accès démo limité + capture de lead (server-only). Notification propriétaire par SMS (Twilio).
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createTwilioClient } from '@/lib/twilio-safe';

const TOTAL_CAP_SECONDS = 4 * 60 * 60; // 4 h de chrono total pour la démo
const SESSION_SECONDS = TOTAL_CAP_SECONDS; // chrono unique de 4 h (reprise possible tant qu'il reste du temps)
const MAX_STARTS = 5;                  // reprises autorisées tant que le total de 4 h n'est pas atteint

export type DemoStartResult = {
  ok: boolean;
  status: 'active' | 'locked' | 'converted' | 'invalid';
  remainingSeconds?: number;
  message: string;
};

const isEmail = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

/** Démarre (ou reprend) une session démo pour un courriel, en appliquant les quotas. */
export async function startDemo(name: string, emailRaw: string): Promise<DemoStartResult> {
  const email = (emailRaw || '').trim().toLowerCase();
  if (!isEmail(email)) return { ok: false, status: 'invalid', message: 'Courriel invalide.' };
  const now = new Date();

  let { data: row } = await supabaseAdmin.from('demo_sessions').select('*').eq('email', email).maybeSingle();
  if (!row) {
    const { data } = await supabaseAdmin.from('demo_sessions')
      .insert({ email, name: name || null, first_seen: now.toISOString(), total_seconds: 0, attempts: 0, status: 'active' })
      .select('*').single();
    row = data;
  }
  if (!row) return { ok: false, status: 'invalid', message: 'Erreur, réessayez.' };

  if (row.status === 'converted') {
    return { ok: false, status: 'converted', message: 'Ce courriel est déjà abonné — connectez-vous à votre portail.' };
  }

  // Session encore active -> on renvoie le temps restant (pas de nouvelle tentative consommée).
  const activeUntil = row.session_expires_at ? new Date(row.session_expires_at) : null;
  if (activeUntil && activeUntil > now) {
    notifyOwner(name || row.name, email).catch(() => {});
    return { ok: true, status: 'active', remainingSeconds: Math.floor((activeUntil.getTime() - now.getTime()) / 1000), message: 'Session démo déjà active.' };
  }

  // Plafonds : total 4 h OU nombre de démarrages.
  const total = row.total_seconds || 0;
  const attempts = row.attempts || 0;
  if (total >= TOTAL_CAP_SECONDS || attempts >= MAX_STARTS) {
    await supabaseAdmin.from('demo_sessions').update({ status: 'locked', session_expires_at: null, updated_at: now.toISOString() }).eq('email', email);
    return { ok: false, status: 'locked', message: 'Limite de la démo atteinte. Découvrez nos forfaits d\'abonnement pour continuer.' };
  }

  const sessionLen = Math.min(SESSION_SECONDS, TOTAL_CAP_SECONDS - total);
  const expires = new Date(now.getTime() + sessionLen * 1000);
  await supabaseAdmin.from('demo_sessions').update({
    name: name || row.name,
    last_start: now.toISOString(),
    session_expires_at: expires.toISOString(),
    total_seconds: total + sessionLen,
    attempts: attempts + 1,
    status: 'active',
    updated_at: now.toISOString(),
  }).eq('email', email);

  notifyOwner(name || row.name, email).catch(() => {});
  return { ok: true, status: 'active', remainingSeconds: sessionLen, message: 'Démo activée.' };
}

/** SMS de notification au propriétaire (OWNER_MOBILE) via Twilio. Non bloquant. */
async function notifyOwner(name: string | null | undefined, email: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const owner = process.env.OWNER_MOBILE;
  if (!sid || !token || !owner) return;
  const client = createTwilioClient(sid, token);
  if (!client) return;
  const opts: any = { body: `C-Secur360 demo : ${name || 'visiteur'} (${email}) a demarre une session.`, to: owner };
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) opts.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  else opts.from = process.env.TWILIO_PHONE_NUMBER;
  await client.messages.create(opts);
}
