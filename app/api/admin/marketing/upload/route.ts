import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Upload d'un actif marketing (image de modèle/bibliothèque) vers le bucket public 'marketing'.
// Réservé super-admin ; écriture via service_role (la clé anon ne peut pas écrire — sécurité).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'marketing';

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const prefix = String(form.get('prefix') || 'misc').replace(/[^a-z0-9_-]/gi, '') || 'misc';
    if (!file) return NextResponse.json({ error: 'fichier requis' }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'fichier trop volumineux (max 25 Mo)' }, { status: 413 });
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, { contentType: file.type || undefined, upsert: true });
    if (error) {
      const miss = /not found|bucket/i.test(error.message);
      return NextResponse.json({ error: miss ? 'Bucket « marketing » absent — applique la migration 165.' : error.message }, { status: miss ? 503 : 500 });
    }
    const url = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ ok: true, url, path });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur upload' }, { status: 500 }); }
}
