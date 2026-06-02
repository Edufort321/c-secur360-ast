import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/lib/apiAuth';

// GET /api/admin/users?tenant=cerdia  → liste des profils du tenant
// Tolérant : le schéma réel peut utiliser tenant_id (snake) ou tenantId (Prisma). On essaie les deux.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const tenant = new URL(req.url).searchParams.get('tenant');
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  // Sélectionne large (id/email/name/role) ; is_active peut ne pas exister selon le schéma.
  let res: any = await supabaseAdmin.from('users').select('id, email, name, role, is_active').eq('tenant_id', tenant).order('email');
  if (res.error) {
    // is_active absent ? réessaie sans, puis bascule sur tenantId si tenant_id n'existe pas.
    res = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenant_id', tenant).order('email');
    if (res.error) res = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenantId', tenant).order('email');
  }
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  // Repli : si tenant_id existe mais n'a rien donné (lignes créées avec tenantId seulement), tente tenantId.
  if ((res.data || []).length === 0) {
    const alt = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenantId', tenant).order('email');
    if (!alt.error && (alt.data || []).length) res = alt as any;
  }
  return NextResponse.json({ users: (res.data || []).map((u: any) => ({ is_active: true, ...u })) });
}

// POST /api/admin/users  { tenant, email, name, role, password } → crée un profil
// Insert résilient : retire automatiquement toute colonne absente du schéma réel
// (tenant_id vs tenantId, is_active, first_login) pour que la création n'échoue jamais
// à cause d'une colonne manquante (sinon le compte n'est jamais créé -> login impossible).
const USER_OPTIONAL_COLS = ['tenant_id', 'tenantId', 'is_active', 'first_login', 'name', 'created_at', 'updated_at', 'createdAt', 'updatedAt'];
export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  try {
    const { tenant, email, name, role, password } = await req.json();
    if (!tenant || !email || !password) return NextResponse.json({ error: 'tenant, email et mot de passe requis' }, { status: 400 });
    const hash = await hashPassword(password);
    const nowIso = new Date().toISOString();
    const payload: any = {
      id: randomUUID(),
      email: String(email).toLowerCase().trim(),
      name: name || null,
      password: hash,
      role: role || 'user',
      tenantId: tenant,
      tenant_id: tenant,
      is_active: true,
      first_login: true,
      // Fournis les deux conventions de timestamps : Prisma updatedAt n'a pas de défaut DB
      // (un INSERT qui l'omet viole NOT NULL). Les colonnes absentes seront retirées au besoin.
      created_at: nowIso,
      updated_at: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    let lastErr: any = null;
    for (let attempt = 0; attempt < USER_OPTIONAL_COLS.length + 1; attempt++) {
      const { error } = await supabaseAdmin.from('users').insert(payload);
      if (!error) { lastErr = null; break; }
      lastErr = error;
      const msg = error.message || ''; const code = (error as any).code || '';
      const isMissingCol = code === 'PGRST204' || /schema cache|could not find|does not exist|column/i.test(msg);
      const m = msg.match(/'([a-zA-Z_]+)' column/i) || msg.match(/column ["']?([a-zA-Z_]+)["']?/i) || msg.match(/the '([a-zA-Z_]+)' column/i);
      const col = m?.[1];
      if (isMissingCol && col && USER_OPTIONAL_COLS.includes(col) && payload[col] !== undefined) { delete payload[col]; continue; }
      break; // erreur non liée à une colonne optionnelle (ex. doublon email)
    }
    if (lastErr) throw lastErr;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}

// PATCH /api/admin/users  { id, name, email, role, is_active, password? } → modifie un profil
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  try {
    const { id, name, email, role, is_active, password } = await req.json();
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const updates: any = {};
    if (name !== undefined) updates.name = name || null;
    if (email !== undefined) updates.email = String(email).toLowerCase().trim();
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (password) updates.password = await hashPassword(password);
    const { error } = await supabaseAdmin.from('users').update(updates).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=... → supprime un profil
export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    await supabaseAdmin.from('auth_sessions').delete().eq('user_id', id);
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
