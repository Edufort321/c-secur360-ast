import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) || 'csecur360';
  const pathOverride = formData.get('path') as string | null;

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = pathOverride || `uploads/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return NextResponse.json({ url: publicUrl });
}
