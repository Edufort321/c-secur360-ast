// Anti-abus du chatbot PUBLIC (visiteurs anonymes) — borne la facture IA.
// Rate-limit par IP + plafond global quotidien. En mémoire (par instance) : suffisant comme
// première barrière ; pour une garantie inter-instances, basculer vers un store partagé (Redis/DB).

const IP_LIMIT = 12;            // messages / heure / IP
const IP_WINDOW_MS = 60 * 60 * 1000;
const GLOBAL_DAILY_LIMIT = 600; // requêtes / jour, toutes IP confondues

type Bucket = { count: number; reset: number };
const ipMap: Map<string, Bucket> = (globalThis as any).__pubChatIp || new Map();
(globalThis as any).__pubChatIp = ipMap;
let globalDay: Bucket = (globalThis as any).__pubChatGlobal || { count: 0, reset: 0 };

export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
}

export function checkPublicQuota(ip: string): { ok: boolean; reason?: 'global' | 'ip' } {
  const now = Date.now();
  // Plafond global quotidien (protège contre une attaque distribuée).
  if (now > globalDay.reset) globalDay = { count: 0, reset: now + 24 * 60 * 60 * 1000 };
  (globalThis as any).__pubChatGlobal = globalDay;
  if (globalDay.count >= GLOBAL_DAILY_LIMIT) return { ok: false, reason: 'global' };

  // Rate-limit par IP.
  const b = ipMap.get(ip);
  if (!b || now > b.reset) {
    ipMap.set(ip, { count: 1, reset: now + IP_WINDOW_MS });
  } else {
    if (b.count >= IP_LIMIT) return { ok: false, reason: 'ip' };
    b.count++;
  }
  globalDay.count++;
  return { ok: true };
}
