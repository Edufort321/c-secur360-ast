import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';

// Avatar présentateur (talking head) via D-ID : une PHOTO (déposée dans public/) + un script -> vidéo
// de l'avatar qui parle. Réservé super-admin. Clé D-ID côté serveur (DID_API_KEY).
// Éthique : n'utiliser que l'image d'une personne CONSENTANTE (toi / un employé), jamais un tiers.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const DID = 'https://api.d-id.com';

function auth() {
  const key = process.env.DID_API_KEY;
  return key ? { Authorization: `Basic ${key}`, 'Content-Type': 'application/json' } : null;
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
        script: { type: 'text', input: text, provider: { type: 'microsoft', voice_id: voice } },
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
      if (data.status === 'done' && data.result_url) return NextResponse.json({ ok: true, status: 'done', url: data.result_url, id });
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
    if (data.status === 'done' && data.result_url) return NextResponse.json({ ok: true, status: 'done', url: data.result_url });
    if (data.status === 'error') return NextResponse.json({ ok: false, status: 'error' });
    return NextResponse.json({ ok: true, status: data.status || 'pending' });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 }); }
}
