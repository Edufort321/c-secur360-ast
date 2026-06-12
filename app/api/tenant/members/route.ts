// Annuaire LIGHT des utilisateurs d'un tenant (id/nom/courriel) pour les champs de saisie
// (ex. « Inspecteur » d'une inspection d'équipement). Lecture via service_role SERVEUR uniquement.
// Sécurité : accessible seulement à un membre AUTHENTIFIÉ du tenant demandé (session auth_token),
// à un super_admin, ou via le cookie dashboard / secret de sync. La clé anon ne lit jamais `users`.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionUser, ADMIN_COOKIE, adminDashboardToken, checkSyncSecret } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tenant = new URL(req.url).searchParams.get('tenant');
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });

  // Garde : cookie dashboard / secret de sync / super_admin / membre du tenant demandé.
  const adminTok = adminDashboardToken();
  const hasAdminCookie = !!adminTok && req.cookies.get(ADMIN_COOKIE)?.value === adminTok;
  let allowed = hasAdminCookie || checkSyncSecret(req);
  if (!allowed) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    allowed = user.role === 'super_admin' || user.tenant_id === tenant;
    if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Sélection tolérante au schéma (tenant_id vs tenantId, is_active optionnel) — comme /api/admin/users.
  let res: any = await supabaseAdmin.from('users').select('id, email, name, role, is_active').eq('tenant_id', tenant).order('name');
  if (res.error) {
    res = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenant_id', tenant).order('name');
    if (res.error) res = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenantId', tenant).order('name');
  }
  let rows: any[] = res.data || [];
  if (!res.error && rows.length === 0) {
    const alt = await supabaseAdmin.from('users').select('id, email, name, role').eq('tenantId', tenant).order('name');
    if (!alt.error) rows = alt.data || [];
  }

  const members = rows
    .filter(u => u.is_active !== false)
    .map(u => ({ id: u.id, name: (u.name || '').trim() || (u.email || '').split('@')[0], email: u.email || '', role: u.role || '' }))
    .filter(u => u.name || u.email);
  return NextResponse.json({ members });
}
