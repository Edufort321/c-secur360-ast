// Essai de 24 h de la démo C-Secur360 depuis le site public (Eric 2026-11-16) : la personne entre ses coordonnées, la DÉMO
// (demo.c-secur360.ca, op « essai_public ») crée son accès de 24 h, puis Gestion (gestion.cerdia.ai) lui envoie le lien par courriel
// depuis info@cerdia.ai. Le lien ne passe JAMAIS par le navigateur : cette route ne renvoie que { ok, fin }.
// Appel serveur à serveur signé : X-Cerdia-Signature: t=<unix>,v1=<HMAC-SHA256 hex de "t.corps"> (format docs/PONT_APPS de Gestion).
// Variables : DEMO_PORTAIL_SECRET (même valeur côté démo), DEMO_URL (défaut https://demo.c-secur360.ca).
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

const COURRIEL = /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i;
// Anti-abus léger en mémoire (par instance) : 5 demandes / 10 min par IP, 3 / jour par courriel.
const IP: Map<string, number[]> = (globalThis as any).__essaiIp || new Map(); (globalThis as any).__essaiIp = IP;
const MEL: Map<string, number[]> = (globalThis as any).__essaiMel || new Map(); (globalThis as any).__essaiMel = MEL;
function trop(m: Map<string, number[]>, cle: string, max: number, fenetre: number) {
  const t = Date.now(); const l = (m.get(cle) || []).filter((x) => t - x < fenetre); l.push(t); m.set(cle, l); return l.length > max;
}
const net = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

export async function POST(req: NextRequest) {
  let b: any = {};
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, erreur: 'format' }, { status: 400 }); }
  const langue = b.langue === 'en' ? 'en' : 'fr';
  const corps = {
    op: 'essai_public', source: 'portail', langue,
    courriel: net(b.courriel, 160).toLowerCase(), prenom: net(b.prenom, 60), nom: net(b.nom, 80),
    entreprise: net(b.entreprise, 120), besoin: net(b.besoin, 1000) || undefined, consentement: b.consentement === true,
  };
  if (!COURRIEL.test(corps.courriel) || !corps.prenom || !corps.entreprise) return NextResponse.json({ ok: false, erreur: 'champs' }, { status: 422 });
  if (!corps.consentement) return NextResponse.json({ ok: false, erreur: 'consentement' }, { status: 422 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnu';
  if (trop(IP, ip, 5, 10 * 60e3) || trop(MEL, corps.courriel, 3, 24 * 3600e3)) return NextResponse.json({ ok: false, erreur: 'trop' }, { status: 429 });

  const secret = process.env.DEMO_PORTAIL_SECRET;
  if (!secret) return NextResponse.json({ ok: false, erreur: 'non_configure' }, { status: 503 });
  const brut = JSON.stringify(corps), t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', secret).update(`${t}.${brut}`).digest('hex');
  try {
    const r = await fetch(`${process.env.DEMO_URL || 'https://demo.c-secur360.ca'}/api/demo-acces`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cerdia-Signature': `t=${t},v1=${sig}` }, body: brut,
      signal: AbortSignal.timeout(15000),
    });
    const j: any = await r.json().catch(() => ({}));
    if (r.ok && j.ok) return NextResponse.json({ ok: true, fin: j.fin || null });
    if (r.status === 409) return NextResponse.json({ ok: false, erreur: 'deja_utilise' }, { status: 409 });
    if (r.status === 422) return NextResponse.json({ ok: false, erreur: 'champs' }, { status: 422 });
    console.error('[essai démo] réponse', r.status, String(j.erreur || '').slice(0, 120));
    return NextResponse.json({ ok: false, erreur: 'indisponible' }, { status: 502 });
  } catch (e) {
    console.error('[essai démo] appel', String(e).slice(0, 120));
    return NextResponse.json({ ok: false, erreur: 'indisponible' }, { status: 502 });
  }
}
