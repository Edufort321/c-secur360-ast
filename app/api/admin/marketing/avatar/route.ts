import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const TENANT = 'cerdia';
// Récupère la vidéo D-ID (URL temporaire) et la persiste dans le bucket 'marketing' + marketing_assets.
// Renvoie { url (stockée si possible, sinon D-ID), source (D-ID), bytes }. Vérifie que le stockage est
// réellement accessible (bucket public) : sinon on garde l'URL D-ID pour que la lecture marche.
async function persistVideo(srcUrl: string, who: string): Promise<{ url: string; source: string; bytes: number; stored: boolean }> {
  let bytes = 0;
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) return { url: srcUrl, source: srcUrl, bytes, stored: false };
    const buf = Buffer.from(await res.arrayBuffer());
    bytes = buf.length;
    if (bytes < 1000) return { url: srcUrl, source: srcUrl, bytes, stored: false }; // téléchargement vide/erreur
    const path = `avatar-videos/${crypto.randomUUID()}.mp4`;
    const up = await supabaseAdmin.storage.from('marketing').upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (up.error) return { url: srcUrl, source: srcUrl, bytes, stored: false }; // bucket absent -> URL D-ID
    const url = supabaseAdmin.storage.from('marketing').getPublicUrl(path).data.publicUrl;
    // Vérifie que l'objet est PUBLIQUEMENT lisible (bucket public). Sinon, on retombe sur l'URL D-ID.
    let publicOk = false;
    try { const head = await fetch(url, { method: 'HEAD' }); publicOk = head.ok; } catch { /* */ }
    const finalUrl = publicOk ? url : srcUrl;
    await supabaseAdmin.from('marketing_assets').insert({ tenant_id: TENANT, kind: 'avatar_video', data: { url: finalUrl, stored_url: url, source: srcUrl, bytes, public: publicOk }, status: 'ready', created_by: who });
    return { url: finalUrl, source: srcUrl, bytes, stored: publicOk };
  } catch { return { url: srcUrl, source: srcUrl, bytes, stored: false }; }
}

// Avatar présentateur (talking head) via D-ID : une PHOTO (déposée dans public/) + un script -> vidéo
// de l'avatar qui parle. Réservé super-admin. Clé D-ID côté serveur (DID_API_KEY).
// Éthique : n'utiliser que l'image d'une personne CONSENTANTE (toi / un employé), jamais un tiers.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const DID = 'https://api.d-id.com';

// Rend un texte plus facile à PRONONCER par la voix de synthèse (TTS). Reformate surtout la marque
// « C-Secur360 » → « C Sécur 360 » (sinon la voix la prononce mal). Filet de sécurité même si l'IA
// ou l'utilisateur a tapé le nom collé.
function ttsFriendly(t: string): string {
  return String(t || '')
    .replace(/\bC[\s.\-]*S[ée]cur[\s.\-]*360\b/gi, 'C Sécur 360')
    .replace(/\bCSecur360\b/gi, 'C Sécur 360');
}

function auth() {
  const key = (process.env.DID_API_KEY || '').trim();
  if (!key) return null;
  // D-ID fournit la clé en clair « API_USER:API_PASSWORD ». L'en-tête Basic exige le base64 de
  // « user:pass ». Si la clé contient ':' (brute), on l'encode ; sinon on la suppose déjà encodée.
  const token = key.includes(':') ? Buffer.from(key).toString('base64') : key;
  return { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' };
}

// POST { image, text, voice? } -> crée la vidéo et attend le résultat (poll). image = nom de fichier
// dans public/ (ex. "presenter.png") OU une URL publique complète.
export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const headers = auth();
  if (!headers) return NextResponse.json({ error: 'Avatar non configuré (DID_API_KEY absente). Crée un compte D-ID et ajoute la clé.' }, { status: 503 });

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const text = String(body.text || '').trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: 'Texte à narrer requis' }, { status: 400 });
  const voice = String(body.voice || 'fr-CA-SylvieNeural');
  const origin = new URL(req.url).origin;
  const img = String(body.image || 'presenter.png');
  const source_url = /^https?:\/\//i.test(img) ? img : `${origin}/${img.replace(/^\/+/, '')}`;

  try {
    // 1) Créer le « talk »
    const create = await fetch(`${DID}/talks`, {
      method: 'POST', headers,
      body: JSON.stringify({
        source_url,
        script: { type: 'text', input: ttsFriendly(text), provider: { type: 'microsoft', voice_id: voice } },
        config: { stitch: true },
      }),
    });
    if (!create.ok) { const e = await create.text(); return NextResponse.json({ error: `D-ID ${create.status}: ${e.slice(0, 240)}` }, { status: 502 }); }
    const created = await create.json();
    const id = created.id;
    if (!id) return NextResponse.json({ error: 'D-ID : pas d\'identifiant retourné' }, { status: 502 });

    // 2) Poll (jusqu'à ~50 s). Si pas prêt, on renvoie l'id pour un poll côté client via GET.
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const st = await fetch(`${DID}/talks/${id}`, { headers });
      if (!st.ok) continue;
      const data = await st.json();
      if (data.status === 'done' && data.result_url) { const me = await getSessionUser(req); const pv = await persistVideo(data.result_url, me?.email || 'admin'); return NextResponse.json({ ok: true, status: 'done', url: pv.url, source: pv.source, bytes: pv.bytes, stored: pv.stored, id }); }
      if (data.status === 'error') return NextResponse.json({ error: 'D-ID : échec du rendu', detail: data.error || null }, { status: 502 });
    }
    return NextResponse.json({ ok: true, status: 'pending', id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur avatar' }, { status: 500 });
  }
}

// GET ?id=... -> statut/URL d'un rendu en cours.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const headers = auth();
  if (!headers) return NextResponse.json({ error: 'DID_API_KEY absente' }, { status: 503 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  try {
    const st = await fetch(`${DID}/talks/${id}`, { headers });
    const data = await st.json();
    if (data.status === 'done' && data.result_url) { const me = await getSessionUser(req); const pv = await persistVideo(data.result_url, me?.email || 'admin'); return NextResponse.json({ ok: true, status: 'done', url: pv.url, source: pv.source, bytes: pv.bytes, stored: pv.stored }); }
    if (data.status === 'error') return NextResponse.json({ ok: false, status: 'error' });
    return NextResponse.json({ ok: true, status: data.status || 'pending' });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
