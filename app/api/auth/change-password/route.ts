import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Changement de mot de passe par l'utilisateur CONNECTÉ (1re connexion ou en tout temps).
// Vérifie le mot de passe actuel, pose le nouveau (hashé) et lève le drapeau first_login.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const current = String(body.currentPassword || '');
  const next = String(body.newPassword || '');
  if (next.length < 6) return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });

  const { data: row } = await supabaseAdmin.from('users').select('id, password').eq('id', u.id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  const ok = await verifyPassword(current, row.password);
  if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });

  const hash = await hashPassword(next);
  // Met à jour le mot de passe + lève first_login (résilient si la colonne n'existe pas).
  let { error } = await supabaseAdmin.from('users').update({ password: hash, first_login: false }).eq('id', u.id);
  if (error && /first_login/i.test(error.message || '')) ({ error } = await supabaseAdmin.from('users').update({ password: hash }).eq('id', u.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
