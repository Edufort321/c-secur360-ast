import crypto from 'crypto';

// Jeton de désabonnement signé (HMAC) — permet un lien PUBLIC « se désabonner » non forgeable,
// sans exposer de session. Conforme LCAP : mécanisme de retrait fonctionnel dans chaque courriel.
function secret(): string {
  return process.env.MARKETING_UNSUB_SECRET || process.env.ADMIN_DASHBOARD_PASSWORD || 'csecur-marketing-unsub';
}
const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const fromB64url = (s: string) => Buffer.from(s, 'base64url').toString('utf8');
function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url').slice(0, 24);
}

export function unsubToken(email: string): string {
  const p = b64url(String(email).toLowerCase().trim());
  return `${p}.${sign(p)}`;
}

export function verifyUnsubToken(token: string): string | null {
  const [p, sig] = String(token || '').split('.');
  if (!p || !sig) return null;
  if (sign(p) !== sig) return null;
  try { return fromB64url(p); } catch { return null; }
}
