import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Convertit une vidéo .webm DÉJÀ STOCKÉE (bucket public « marketing ») en .mp4 (H.264/AAC), puis
// ré-uploade le .mp4 dans le même bucket et renvoie son URL publique. On passe une URL (pas le fichier)
// pour ne PAS heurter la limite de 4,5 Mo du corps des fonctions serverless Vercel.
// Réservé super-admin ; tout passe par service_role (la clé anon n'écrit jamais — sécurité).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'marketing';

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;

  let url: string;
  try { ({ url } = await req.json()); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  if (!url || typeof url !== 'string') return NextResponse.json({ error: 'url (.webm) requise' }, { status: 400 });

  // Sécurité : on n'accepte que des URLs du stockage Supabase du projet (pas d'URL arbitraire = SSRF).
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supaUrl || !url.startsWith(supaUrl)) {
    return NextResponse.json({ error: 'URL non autorisée (doit pointer vers le stockage du projet).' }, { status: 400 });
  }
  if (!ffmpegPath) return NextResponse.json({ error: 'ffmpeg indisponible sur le serveur.' }, { status: 503 });

  const tmp = os.tmpdir();
  const stamp = crypto.randomUUID();
  const inPath = path.join(tmp, `mkt-${stamp}.webm`);
  const outPath = path.join(tmp, `mkt-${stamp}.mp4`);

  try {
    // 1. Télécharge le webm source.
    const resp = await fetch(url);
    if (!resp.ok) return NextResponse.json({ error: `Téléchargement source: ${resp.status}` }, { status: 502 });
    const srcBuf = Buffer.from(await resp.arrayBuffer());
    if (srcBuf.length > 80 * 1024 * 1024) return NextResponse.json({ error: 'Vidéo trop volumineuse (max 80 Mo).' }, { status: 413 });
    await fs.writeFile(inPath, srcBuf);

    // 2. Détecte si la source a une piste AUDIO. TikTok refuse (« décodage impossible ») une vidéo SANS
    //    audio (cas d'un montage de slides sans avatar) — alors que Facebook l'accepte. On ajoute donc
    //    une piste audio SILENCIEUSE quand il n'y en a pas, pour garantir un flux audio dans le MP4.
    const hasAudio = await probeHasAudio(ffmpegPath as string, inPath);

    // Transcode -> mp4 strictement compatible réseaux sociaux (TikTok/Meta) :
    //  - H.264 High@4.0, yuv420p, SAR 1:1, métadonnées couleur bt709 (validateurs stricts) ;
    //  - frame rate CONSTANT 30 fps ; faststart ; audio AAC stéréo 44,1 kHz (réelle ou silencieuse).
    const vf = 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30,setsar=1,format=yuv420p';
    const common = [
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
      '-profile:v', 'high', '-level', '4.0', '-vsync', 'cfr', '-g', '60',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
    ];
    const args = hasAudio
      ? ['-y', '-fflags', '+genpts', '-i', inPath, '-vf', vf, ...common, '-map', '0:v:0', '-map', '0:a:0', outPath]
      : ['-y', '-fflags', '+genpts', '-i', inPath, '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
         '-vf', vf, ...common, '-map', '0:v:0', '-map', '1:a:0', '-shortest', outPath];
    await runFfmpeg(ffmpegPath as string, args);

    // 3. Valide la sortie (un mp4 tronqué/vide = échec ffmpeg silencieux) puis ré-uploade.
    const mp4 = await fs.readFile(outPath);
    if (mp4.length < 1024) return NextResponse.json({ error: 'Conversion vide (ffmpeg n\'a rien produit).' }, { status: 500 });
    const dest = `composition/${stamp}.mp4`;
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(dest, mp4, { contentType: 'video/mp4', upsert: true });
    if (error) {
      const miss = /not found|bucket/i.test(error.message);
      return NextResponse.json({ error: miss ? 'Bucket « marketing » absent — applique la migration 165.' : error.message }, { status: miss ? 503 : 500 });
    }
    const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
    return NextResponse.json({ ok: true, url: publicUrl, path: dest });
  } catch (e: any) {
    return NextResponse.json({ error: 'Conversion échouée : ' + (e?.message || String(e)) }, { status: 500 });
  } finally {
    fs.unlink(inPath).catch(() => {});
    fs.unlink(outPath).catch(() => {});
  }
}

// Détecte une piste audio en lisant la sortie d'analyse de ffmpeg (« Stream ... Audio: »).
function probeHasAudio(bin: string, input: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(bin, ['-i', input, '-hide_banner'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    proc.stderr.on('data', d => { err += d.toString(); });
    proc.on('error', () => resolve(false));
    proc.on('close', () => resolve(/Stream #\d+:\d+.*: Audio:/i.test(err)));
  });
}

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    proc.stderr.on('data', d => { err += d.toString(); if (err.length > 8000) err = err.slice(-8000); });
    proc.on('error', reject);
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(err.split('\n').slice(-4).join(' ').trim() || `ffmpeg code ${code}`)));
  });
}
