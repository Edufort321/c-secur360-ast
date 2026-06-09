import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Listes LÉGÈRES pour le panneau « Lier » du module Rapports : projets et événements (planner)
// du tenant de SESSION. Champs minimaux seulement (pas de fuite de données métier complètes).
// Sert aussi de cible quand on crée une soumission depuis un rapport (catalogue + vendeurs).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const kind = new URL(req.url).searchParams.get('kind') || 'all';

  const out: any = { ok: true };

  if (kind === 'projects' || kind === 'all') {
    const { data } = await supabaseAdmin.from('projects')
      .select('id, project_number, title, client_name, location, status')
      .eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(500);
    out.projects = (data || []).map((p: any) => ({
      id: p.id, number: p.project_number || '', title: p.title || '',
      client: p.client_name || '', location: p.location || '', status: p.status || '',
    }));
  }

  if (kind === 'jobs' || kind === 'all') {
    // planner_jobs : schéma mixte (colonnes scalaires + camelCase formulaire). On prend large.
    const { data } = await supabaseAdmin.from('planner_jobs')
      .select('id, job_number, numeroJob, title, nom, client, dateDebut, start_date, statut, status, projectId, project_id')
      .eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(500);
    out.jobs = (data || []).map((j: any) => ({
      id: j.id,
      number: j.numeroJob || j.job_number || '',
      title: j.nom || j.title || '',
      client: j.client || '',
      date: j.dateDebut || j.start_date || '',
      status: j.statut || j.status || '',
      projectId: j.projectId || j.project_id || '',
    }));
  }

  return NextResponse.json(out);
}
