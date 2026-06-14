import { NextRequest, NextResponse } from 'next/server';
import { aiGuard } from '@/lib/aiGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Upload signé pour le studio marketing du TENANT (images, vidéos de fond, clips, rendus). Le navigateur
// téléverse DIRECTEMENT vers Supabase (contourne la limite 4,5 Mo serverless). Chemin préfixé par le
// tenant (isolation). Signature réservée à un utilisateur authentifié du tenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const BUCKET = 'marketing';

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  let body: any = {}; try { body = await req.json(); } catch {}
  const prefix = String(body.prefix || 'misc').replace(/[^a-z0-9_-]/gi, '') || 'misc';
  const ext = String(body.ext || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  const path = `tenants/${tenant.replace(/[^a-z0-9_-]/gi, '')}/${prefix}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    const miss = /not found|bucket/i.test(error?.message || '');
    return NextResponse.json({ error: miss ? 'Bucket « marketing » absent — applique la migration 165.' : (error?.message || 'Signature échouée') }, { status: miss ? 503 : 500 });
  }
  const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, path: data.path, token: data.token, publicUrl });
}
