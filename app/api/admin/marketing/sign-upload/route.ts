import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Génère une URL d'upload SIGNÉE (jeton à usage unique) pour un chemin précis du bucket « marketing ».
// Le navigateur téléverse ensuite le fichier DIRECTEMENT vers Supabase avec ce jeton -> contourne la
// limite de 4,5 Mo du corps des fonctions serverless Vercel (indispensable pour images HD et vidéos).
// Sécurité : signature réservée super-admin (requireAdmin) ; la clé anon n'obtient PAS d'écriture large,
// seulement l'autorisation d'écrire CE chemin via le jeton.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BUCKET = 'marketing';

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  let body: any = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const prefix = String(body.prefix || 'misc').replace(/[^a-z0-9_-]/gi, '') || 'misc';
  const ext = String(body.ext || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    const miss = /not found|bucket/i.test(error?.message || '');
    return NextResponse.json({ error: miss ? 'Bucket « marketing » absent — applique la migration 165.' : (error?.message || 'Signature échouée') }, { status: miss ? 503 : 500 });
  }
  const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, path: data.path, token: data.token, publicUrl });
}
