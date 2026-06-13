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

    // 2. Transcode webm -> mp4 compatible réseaux sociaux (TikTok/Meta) :
    //    - frame rate CONSTANT 30 fps (le webm de MediaRecorder est à cadence variable -> erreur de
    //      décodage sinon) ; profil H.264 high@4.1 + yuv420p (largement supporté) ;
    //    - dimensions paires forcées ; audio AAC stéréo 44,1 kHz ; faststart (lecture progressive).
    await runFfmpeg(ffmpegPath as string, [
      '-y', '-fflags', '+genpts', '-i', inPath,
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
      '-profile:v', 'high', '-level', '4.1', '-vsync', 'cfr', '-g', '60',
      '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      outPath,
    ]);

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

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    proc.stderr.on('data', d => { err += d.toString(); if (err.length > 8000) err = err.slice(-8000); });
    proc.on('error', reject);
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(err.split('\n').slice(-4).join(' ').trim() || `ffmpeg code ${code}`)));
  });
}
