import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/auth';

// GET /api/admin/users?tenant=cerdia  → liste des profils du tenant
export async function GET(req: NextRequest) {
  const tenant = new URL(req.url).searchParams.get('tenant');
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from('users').select('id, email, name, role, is_active').eq('tenant_id', tenant).order('email');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

// POST /api/admin/users  { tenant, email, name, role, password } → crée un profil
export async function POST(req: NextRequest) {
  try {
    const { tenant, email, name, role, password } = await req.json();
    if (!tenant || !email || !password) return NextResponse.json({ error: 'tenant, email et mot de passe requis' }, { status: 400 });
    const hash = await hashPassword(password);
    const { error } = await supabaseAdmin.from('users').insert({
      id: randomUUID(),
      email: String(email).toLowerCase().trim(),
      name: name || null,
      password: hash,
      role: role || 'user',
      tenantId: tenant,
      tenant_id: tenant,
      is_active: true,
      first_login: true,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
