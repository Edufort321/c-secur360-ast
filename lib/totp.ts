// TOTP (RFC 6238) — second facteur d'authentification, implémenté avec le crypto natif de Node
// (aucune dépendance). Sert à l'enrôlement (QR otpauth) et à la vérification à la connexion.
import { createHmac, randomBytes, createHash } from 'crypto';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = '';
  for (const b of buf) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function base32Decode(s: string): Buffer {
  const clean = (s || '').toUpperCase().replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0; const out: number[] = [];
  for (const c of clean) { const idx = B32.indexOf(c); if (idx < 0) continue; value = (value << 5) | idx; bits += 5; if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; } }
  return Buffer.from(out);
}

/** Génère un secret TOTP (base32, ~32 caractères). */
export function generateSecret(): string { return base32Encode(randomBytes(20)); }

/** URI otpauth:// à encoder en QR pour les applications d'authentification. */
export function totpUri(secret: string, label: string, issuer = 'C-Secur360'): string {
  const lbl = encodeURIComponent(`${issuer}:${label}`);
  return `otpauth://totp/${lbl}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

function codeAtCounter(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  // compteur 64 bits big-endian (les 32 bits hauts restent 0 jusqu'en ~2106).
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const off = hmac[hmac.length - 1] & 0xf;
  const bin = ((hmac[off] & 0x7f) << 24) | ((hmac[off + 1] & 0xff) << 16) | ((hmac[off + 2] & 0xff) << 8) | (hmac[off + 3] & 0xff);
  return String(bin % 1_000_000).padStart(6, '0');
}

/** Vérifie un code à 6 chiffres avec une fenêtre de tolérance (± `window` × 30 s). */
export function verifyTotp(secret: string, token: string, window = 1, nowMs = Date.now()): boolean {
  const t = (token || '').replace(/\D/g, '');
  if (t.length !== 6 || !secret) return false;
  const counter = Math.floor(nowMs / 1000 / 30);
  for (let w = -window; w <= window; w++) { if (codeAtCounter(secret, counter + w) === t) return true; }
  return false;
}

// ── Codes de secours (usage unique) — stockés HACHÉS (sha256). ──
export function generateBackupCodes(n = 8): string[] {
  return Array.from({ length: n }, () => randomBytes(5).toString('hex').toUpperCase().replace(/(.{4})/g, '$1-').replace(/-$/, ''));
}
export function hashCode(code: string): string { return createHash('sha256').update((code || '').replace(/[\s-]/g, '').toUpperCase()).digest('hex'); }
/** Retourne true si `code` correspond à un hash de la liste (et lequel, pour le retirer). */
export function matchBackupCode(code: string, hashes: string[]): string | null {
  const h = hashCode(code);
  return (hashes || []).includes(h) ? h : null;
}
