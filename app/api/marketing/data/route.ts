import { NextRequest, NextResponse } from 'next/server';
import { aiGuard } from '@/lib/aiGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Actifs du studio marketing du TENANT (scopés tenant_id de la session) : avatars, images, vidéos de
// fond, clips/vidéos d'avatar, montages. Réutilise la table marketing_assets (tenant_id).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const { data } = await supabaseAdmin.from('marketing_assets')
    .select('id, kind, data, created_at').eq('tenant_id', tenant)
    .in('kind', ['avatar_model', 'library_image', 'avatar_video', 'bg_video', 'composition_video'])
    .order('created_at', { ascending: false });
  const rows = data || [];
  return NextResponse.json({
    ok: true,
    avatars: rows.filter((a: any) => a.kind === 'avatar_model'),
    library: rows.filter((a: any) => a.kind === 'library_image'),
    videos: rows.filter((a: any) => a.kind === 'avatar_video'),
    bgVideos: rows.filter((a: any) => a.kind === 'bg_video'),
    compositions: rows.filter((a: any) => a.kind === 'composition_video'),
  });
}

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  if (body.action === 'save-asset') {
    const { error } = await supabaseAdmin.from('marketing_assets').insert({ tenant_id: tenant, kind: body.kind || 'library_image', data: body.data || {} });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'delete-asset') {
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    await supabaseAdmin.from('marketing_assets').delete().eq('tenant_id', tenant).eq('id', body.id);
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'update-asset') {
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const { data: cur } = await supabaseAdmin.from('marketing_assets').select('data').eq('tenant_id', tenant).eq('id', body.id).maybeSingle();
    const merged = { ...((cur as any)?.data || {}), ...(body.patch || {}) };
    await supabaseAdmin.from('marketing_assets').update({ data: merged }).eq('tenant_id', tenant).eq('id', body.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
