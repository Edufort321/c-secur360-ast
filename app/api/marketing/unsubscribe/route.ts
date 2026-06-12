import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyUnsubToken } from '@/lib/marketingToken';

// Désabonnement PUBLIC (lien dans chaque courriel — obligation LCAP, à honorer sous 10 j ouvrables).
// Aucune authentification : le jeton HMAC prouve la demande. Enregistre dans le registre + bloque le
// prospect. Conserve la preuve. tenant = 'cerdia' (marketing plateforme).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const TENANT = 'cerdia';

async function doUnsub(email: string) {
  await supabaseAdmin.from('marketing_unsubscribes').upsert(
    { tenant_id: TENANT, email, reason: 'unsubscribe', source: 'lien-courriel' },
    { onConflict: 'tenant_id,email' });
  await supabaseAdmin.from('marketing_prospects').update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('tenant_id', TENANT).eq('email', email);
}

function page(title: string, msg: string, ok: boolean) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="font-family:system-ui,sans-serif;background:#f1f5f9;margin:0;padding:0">
    <div style="max-width:480px;margin:64px auto;background:#fff;border-radius:14px;padding:36px 28px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.06)">
      <div style="font-size:40px">${ok ? '✓' : '⚠'}</div>
      <h1 style="font-size:20px;color:#0f172a;margin:12px 0 8px">${title}</h1>
      <p style="color:#475569;font-size:14px;line-height:1.6">${msg}</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">C-Secur360 · Sécurité industrielle</p>
    </div>
  </body></html>`;
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || '';
  const email = verifyUnsubToken(token);
  if (!email) return new NextResponse(page('Lien invalide', "Ce lien de désabonnement est invalide ou expiré. Écrivez-nous pour être retiré de la liste.", false), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  try { await doUnsub(email); } catch { /* enregistré best-effort */ }
  return new NextResponse(page('Désabonnement confirmé', `<strong>${email}</strong> a été retiré de nos communications marketing. Vous ne recevrez plus de courriels de prospection.`, true), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// POST {token} — variante programmatique (ex. bouton « confirmer »).
export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { /* */ }
  const email = verifyUnsubToken(body.token || '');
  if (!email) return NextResponse.json({ error: 'jeton invalide' }, { status: 400 });
  try { await doUnsub(email); return NextResponse.json({ ok: true }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'erreur' }, { status: 500 }); }
}
