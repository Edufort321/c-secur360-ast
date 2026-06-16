import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateSecret, totpUri, verifyTotp, generateBackupCodes, hashCode } from '@/lib/totp';

// Gestion du 2FA (TOTP) de l'utilisateur connecté. Opt-in, self-service.
//  GET                       -> { enabled }
//  POST { action:'setup' }   -> génère un secret (non activé) + URI otpauth pour le QR
//  POST { action:'enable', code }  -> vérifie le code contre le secret en attente -> active + codes de secours (1 fois)
//  POST { action:'disable', code } -> vérifie code/secours -> désactive + purge secret/codes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data } = await supabaseAdmin.from('users').select('totp_enabled').eq('id', u.id).maybeSingle();
  return NextResponse.json({ enabled: !!(data as any)?.totp_enabled });
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  if (body.action === 'setup') {
    const secret = generateSecret();
    await supabaseAdmin.from('users').update({ totp_secret: secret, totp_enabled: false }).eq('id', u.id);
    return NextResponse.json({ ok: true, secret, uri: totpUri(secret, u.email || u.id) });
  }

  if (body.action === 'enable') {
    const { data } = await supabaseAdmin.from('users').select('totp_secret, totp_enabled').eq('id', u.id).maybeSingle();
    const secret = (data as any)?.totp_secret;
    if (!secret) return NextResponse.json({ error: 'Commencez par « Configurer ».' }, { status: 400 });
    if (!verifyTotp(secret, String(body.code || ''))) return NextResponse.json({ error: 'Code invalide. Réessayez.' }, { status: 400 });
    const codes = generateBackupCodes();
    await supabaseAdmin.from('users').update({ totp_enabled: true, totp_backup_codes: codes.map(hashCode) }).eq('id', u.id);
    return NextResponse.json({ ok: true, backupCodes: codes }); // affichés UNE seule fois
  }

  if (body.action === 'disable') {
    const { data } = await supabaseAdmin.from('users').select('totp_secret, totp_backup_codes').eq('id', u.id).maybeSingle();
    const secret = (data as any)?.totp_secret; const hashes: string[] = (data as any)?.totp_backup_codes || [];
    const codeOk = secret && verifyTotp(secret, String(body.code || ''));
    const backupOk = hashes.includes(hashCode(String(body.code || '')));
    if (!codeOk && !backupOk) return NextResponse.json({ error: 'Code invalide.' }, { status: 400 });
    await supabaseAdmin.from('users').update({ totp_enabled: false, totp_secret: null, totp_backup_codes: [] }).eq('id', u.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
