import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Renvoie l'utilisateur courant depuis le cookie auth_token + table users.
// Le middleware skippe toutes les routes /api/, donc on lit le cookie manuellement.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const { data: session } = await supabaseAdmin
    .from('auth_sessions')
    .select('users!inner(id, email, name, role, tenant_id)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!session?.users) return NextResponse.json({ user: null }, { status: 401 });

  const u = session.users as any;
  return NextResponse.json({
    user: { id: u.id, email: u.email, name: u.name, role: u.role, tenantId: u.tenant_id },
  });
}
