import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionUser, ADMIN_COOKIE, adminDashboardToken, checkSyncSecret } from '@/lib/apiAuth';

// Annuaire LÉGER du personnel + STATUT DE FORMATION (depuis le module RH : hr_certifications), pour
// pré-remplir les entrants/surveillants d'un permis espace clos et afficher si la formation est à jour.
// Ne renvoie AUCUNE donnée sensible (ni salaire, ni mot de passe). Lecture service_role gardée par
// session/appartenance au tenant (comme /api/tenant/members).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const tenant = new URL(req.url).searchParams.get('tenant');
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });

  const adminTok = adminDashboardToken();
  const hasAdminCookie = !!adminTok && req.cookies.get(ADMIN_COOKIE)?.value === adminTok;
  let allowed = hasAdminCookie || checkSyncSecret(req);
  if (!allowed) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    allowed = user.role === 'super_admin' || user.tenant_id === tenant;
    if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Personnel (roster) + certifications/formations.
  const [{ data: pers }, { data: certs }] = await Promise.all([
    supabaseAdmin.from('planner_personnel').select('id, name, email, role').eq('tenant_id', tenant).order('name'),
    supabaseAdmin.from('hr_certifications').select('personnel_id, name, expiry_date').eq('tenant_id', tenant),
  ]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = new Date(today.getTime() + 30 * 86400000);
  const byPers: Record<string, { name: string; expiry_date: string | null; status: 'ok' | 'expiring' | 'expired' }[]> = {};
  for (const c of (certs || [])) {
    const exp = c.expiry_date ? new Date(c.expiry_date) : null;
    const status: 'ok' | 'expiring' | 'expired' = !exp ? 'ok' : (exp < today ? 'expired' : (exp <= soon ? 'expiring' : 'ok'));
    (byPers[c.personnel_id] ||= []).push({ name: c.name, expiry_date: c.expiry_date, status });
  }

  const people = (pers || []).filter((p: any) => p.name).map((p: any) => {
    const list = byPers[p.id] || [];
    const expired = list.filter(c => c.status === 'expired');
    const expiring = list.filter(c => c.status === 'expiring');
    const formation_status: 'none' | 'expired' | 'expiring' | 'ok' = list.length === 0 ? 'none' : (expired.length ? 'expired' : (expiring.length ? 'expiring' : 'ok'));
    return { id: p.id, name: p.name, role: p.role || '', certifications: list, formation_status, expired: expired.map(c => c.name), expiring: expiring.map(c => c.name) };
  });

  return NextResponse.json({ people });
}
