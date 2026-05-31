import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/apiAuth';

// Securite (#15) : auth admin + validation MIME/taille + chemin assaini (anti path-traversal).
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const bucket = ((formData.get('bucket') as string) || 'csecur360').replace(/[^a-z0-9_-]/gi, '');
  const pathOverride = formData.get('path') as string | null;

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
  if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: `Type non autorisé : ${file.type}` }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 413 });

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  // Assainir un chemin fourni (retirer .. et / de tete) sinon en generer un sur.
  const cleanOverride = pathOverride ? pathOverride.replace(/\.\.+/g, '').replace(/^\/+/, '').replace(/[^a-zA-Z0-9._/-]/g, '') : '';
  const filePath = cleanOverride || `uploads/${Date.now()}-${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return NextResponse.json({ url: publicUrl });
}
