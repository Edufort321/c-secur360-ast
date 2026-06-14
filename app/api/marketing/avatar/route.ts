import { NextRequest, NextResponse } from 'next/server';
import { aiGuard } from '@/lib/aiGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Avatar parlant (D-ID) pour le TENANT — utilise SA PROPRE clé D-ID (BYOK, tenant_secrets) : le tenant
// gère/paie sa conso vidéo, le quota plateforme n'est jamais touché. Persiste dans le bucket + assets
// (tenant). La vidéo réelle (caméra) + slides reste gratuite et n'utilise pas cette route.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
const DID = 'https://api.d-id.com';
const BUCKET = 'marketing';

function ttsFriendly(t: string): string {
  return String(t || '').replace(/\bC[\s.\-]*S[ée]cur[\s.\-]*360\b/gi, 'C Sécur 360').replace(/\bCSecur360\b/gi, 'C Sécur 360').replace(/\bAST\b/g, 'A S T').replace(/\bDGA\b/g, 'D G A').replace(/\bCNESST\b/g, 'C N E S S T');
}
function didHeaders(key: string) {
  const token = key.includes(':') ? Buffer.from(key).toString('base64') : key;
  return { Authorization: `Basic ${token}`, 'Content-Type': 'application/json' };
}
async function persistVideo(tenant: string, srcUrl: string): Promise<string> {
  try {
    const res = await fetch(srcUrl); if (!res.ok) return srcUrl;
    const buf = Buffer.from(await res.arrayBuffer()); if (buf.length < 1000) return srcUrl;
    const path = `tenants/${tenant}/avatar-videos/${crypto.randomUUID()}.mp4`;
    const up = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (up.error) return srcUrl;
    const url = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    let publicOk = false; try { const bk = await supabaseAdmin.storage.getBucket(BUCKET); publicOk = !!(bk.data as any)?.public; } catch {}
    const finalUrl = publicOk ? url : srcUrl;
    await supabaseAdmin.from('marketing_assets').insert({ tenant_id: tenant, kind: 'avatar_video', data: { url: finalUrl, source: srcUrl }, status: 'ready' });
    return finalUrl;
  } catch { return srcUrl; }
}

async function tenantKey(tenant: string): Promise<string | null> {
  const { data } = await supabaseAdmin.from('tenant_secrets').select('did_api_key').eq('tenant_id', tenant).maybeSingle();
  return (data?.did_api_key || '').trim() || null;
}

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const tenant = String((guard.user as any)?.tenant_id || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const key = await tenantKey(tenant);
  if (!key) return NextResponse.json({ error: 'Aucune clé D-ID configurée. Ajoute ta clé D-ID dans le module Marketing (Vidéo IA) pour générer un avatar parlant.', needKey: true }, { status: 400 });
  const headers = didHeaders(key);

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const text = String(body.text || '').trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: 'Texte à narrer requis' }, { status: 400 });
  if (!body.image || !/^https?:\/\//i.test(String(body.image))) return NextResponse.json({ error: 'Image d’avatar (URL) requise — ajoute un avatar dans la médiathèque.' }, { status: 400 });
  const voice = String(body.voice || 'fr-CA-SylvieNeural');
  const delayMs = Math.max(0, Math.min(5000, Number(body.delayMs) || 0));
  const spoken = ttsFriendly(text);
  const script: any = delayMs > 0
    ? { type: 'text', ssml: true, input: `<break time="${delayMs}ms"/>${spoken.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`, provider: { type: 'microsoft', voice_id: voice } }
    : { type: 'text', input: spoken, provider: { type: 'microsoft', voice_id: voice } };

  try {
    const create = await fetch(`${DID}/talks`, { method: 'POST', headers, body: JSON.stringify({ source_url: String(body.image), script, config: { stitch: true } }) });
    if (!create.ok) { const e = await create.text(); return NextResponse.json({ error: `D-ID ${create.status}: ${e.slice(0, 240)}` }, { status: 502 }); }
    const created = await create.json(); const id = created.id;
    if (!id) return NextResponse.json({ error: 'D-ID : pas d’identifiant' }, { status: 502 });
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const st = await fetch(`${DID}/talks/${id}`, { headers }); if (!st.ok) continue;
      const data = await st.json();
      if (data.status === 'done' && data.result_url) { const url = await persistVideo(tenant, data.result_url); return NextResponse.json({ ok: true, status: 'done', url, id }); }
      if (data.status === 'error') return NextResponse.json({ error: 'D-ID : échec du rendu', detail: data.error || null }, { status: 502 });
    }
    return NextResponse.json({ ok: true, status: 'pending', id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur avatar' }, { status: 500 });
  }
}
