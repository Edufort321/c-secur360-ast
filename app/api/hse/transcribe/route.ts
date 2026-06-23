import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';

// Transcription IA d'un enregistrement de causerie (audio/vidéo du bucket public hse-meetings).
// STT = OpenAI Whisper (gpt-4o-transcribe / whisper-1) — Anthropic ne transcrit pas l'audio. Gated sur
// OPENAI_API_KEY : si absente, on renvoie 501 avec un message clair (à configurer dans Vercel).
// Accès : tier ≥ 4 (administration), tenant de session. L'URL doit pointer le bucket hse-meetings.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant || null);
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (tierFromLevel(await effectiveLevelFor(acc, tenant)) < 4) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const url = String(body.url || '');
  if (!url || !url.includes('/hse-meetings/')) return NextResponse.json({ error: 'URL de média invalide' }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'Transcription IA non configurée — ajoutez OPENAI_API_KEY dans Vercel.', code: 'no_key' }, { status: 501 });

  try {
    const media = await fetch(url);
    if (!media.ok) return NextResponse.json({ error: 'Média introuvable' }, { status: 404 });
    const blob = await media.blob();
    // Limite de taille Whisper = 25 Mo.
    if (blob.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux pour la transcription (max 25 Mo).' }, { status: 413 });

    const form = new FormData();
    const name = url.split('/').pop() || 'audio.webm';
    form.append('file', blob, name);
    form.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1');
    if (body.lang) form.append('language', String(body.lang) === 'en' ? 'en' : 'fr');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json({ error: j?.error?.message || `STT HTTP ${r.status}` }, { status: 502 });
    return NextResponse.json({ transcript: j.text || '' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur de transcription' }, { status: 500 });
  }
}
