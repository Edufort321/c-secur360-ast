import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { audit } from '@/lib/audit';

// Loi 25 — Droit d'accès / portabilité : la personne connectée télécharge SES renseignements
// personnels dans un format structuré (JSON). Aucune donnée d'un autre utilisateur n'est incluse.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const out: Record<string, any> = {
    _meta: {
      generated_at: new Date().toISOString(),
      cadre: 'Export fourni en vertu de la Loi 25 (Québec) — droit d’accès et de portabilité.',
      personne: { id: me.id, email: me.email, role: me.role, tenant: me.tenant_id },
    },
  };

  // Compte (sans le mot de passe).
  try {
    const { data } = await supabaseAdmin.from('users').select('*').eq('id', me.id).maybeSingle();
    if (data) { const { password, ...safe } = data as any; out.compte = safe; }
  } catch { /* ignore */ }

  // Sessions actives (métadonnées : IP / appareil / expiration) — sans le token.
  try {
    const { data } = await supabaseAdmin.from('auth_sessions').select('created_at, expires_at, ip_address, user_agent').eq('user_id', me.id);
    if (data) out.sessions = data;
  } catch { /* ignore */ }

  // Fiche personnel liée à mon courriel (planificateur / RH), si présente.
  try {
    if (me.email) {
      const { data } = await supabaseAdmin.from('planner_personnel').select('*').eq('tenant_id', me.tenant_id).ilike('email', me.email);
      if (data && data.length) out.personnel = data;
    }
  } catch { /* ignore */ }

  // Journal d'audit me concernant (best-effort).
  try {
    if (me.email) {
      const { data } = await supabaseAdmin.from('system_audit_logs').select('created_at, action, resource').eq('user_email', me.email).order('created_at', { ascending: false }).limit(500);
      if (data && data.length) out.journal_activite = data;
    }
  } catch { /* ignore */ }

  // Demandes de confidentialité déjà déposées.
  try {
    const { data } = await supabaseAdmin.from('privacy_requests').select('kind, status, created_at, due_at, resolution_note').eq('email', me.email);
    if (data && data.length) out.demandes_confidentialite = data;
  } catch { /* ignore */ }

  try { await audit('account', 'data_export', { userId: me.id, email: me.email }); } catch { /* ignore */ }

  const body = JSON.stringify(out, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="mes-donnees-${me.email || me.id}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
