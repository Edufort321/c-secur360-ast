import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Accès SERVEUR aux GRILLES SALARIALES (poste_salary_grids / poste_salary_tiers) — données
// sensibles (salaires, commissions). Service role + vérification de niveau (admin_paie/rh/
// direction/super_user) + tenant de SESSION (anti-fuite inter-tenant).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (!acc.tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  // Scopé au tenant de SESSION ; on applique l'accès restreint sur ce tenant (cohérence).
  if (!canHr(await effectiveLevelFor(acc, acc.tenant))) return { err: NextResponse.json({ error: 'Accès refusé (salaires)' }, { status: 403 }) };
  return { acc };
}

// GET ?me=1 -> { approvalMax, commissionPct } de MA propre grille (auth simple ; pas l'accès
// aux salaires d'autrui). Sert à l'autorisation d'approbation et au taux de commission personnel.
async function myGrid(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  try {
    const { data: p } = await supabaseAdmin.from('planner_personnel').select('current_grid_id').eq('tenant_id', acc.tenant).ilike('email', acc.email).maybeSingle();
    if (!(p as any)?.current_grid_id) return NextResponse.json({ ok: true, approvalMax: null, commissionPct: null });
    const { data: grid } = await supabaseAdmin.from('poste_salary_grids').select('approval_max_amount, commission_pct').eq('id', (p as any).current_grid_id).eq('tenant_id', acc.tenant).maybeSingle();
    return NextResponse.json({ ok: true, approvalMax: (grid as any)?.approval_max_amount ?? null, commissionPct: (grid as any)?.commission_pct ?? null });
  } catch { return NextResponse.json({ ok: true, approvalMax: null, commissionPct: null }); }
}

// GET ?gridConditions=personnelId -> primes/conditions (discretionary_bonuses) de la grille de cet
// employé, pour la saisie de feuille de temps (auth simple ; scopé au tenant de session).
async function gridConditions(req: NextRequest, personnelId: string) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  try {
    const { data: pers } = await supabaseAdmin.from('planner_personnel').select('current_grid_id').eq('tenant_id', acc.tenant).eq('id', personnelId).maybeSingle();
    if (!(pers as any)?.current_grid_id) return NextResponse.json({ ok: true, bonuses: [], conditions: [] });
    const gid = (pers as any).current_grid_id;
    const { data: grid } = await supabaseAdmin.from('poste_salary_grids').select('discretionary_bonuses').eq('id', gid).eq('tenant_id', acc.tenant).maybeSingle();
    const bonuses = Array.isArray((grid as any)?.discretionary_bonuses) ? (grid as any).discretionary_bonuses : [];
    // Conditions/frais applicables (prix employé) — séparé pour rester résilient si colonne absente (migration 159).
    let conditions: any[] = [];
    try { const { data: gc } = await supabaseAdmin.from('poste_salary_grids').select('grid_conditions').eq('id', gid).maybeSingle(); conditions = Array.isArray((gc as any)?.grid_conditions) ? (gc as any).grid_conditions.filter((c: any) => c?.applies) : []; } catch { /* colonne absente */ }
    return NextResponse.json({ ok: true, bonuses, conditions });
  } catch { return NextResponse.json({ ok: true, bonuses: [], conditions: [] }); }
}

// GET ?posteId=X -> { grid, tiers } de ce poste (tenant de session).
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  if (sp.get('me')) return myGrid(req);
  const gc = sp.get('gridConditions'); if (gc) return gridConditions(req, gc);
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  const posteId = new URL(req.url).searchParams.get('posteId');
  if (!posteId) return NextResponse.json({ error: 'posteId requis' }, { status: 400 });
  const { data: grid } = await supabaseAdmin.from('poste_salary_grids').select('*').eq('tenant_id', tenant).eq('poste_id', posteId).maybeSingle();
  let tiers: any[] = [];
  if (grid) { const { data: t } = await supabaseAdmin.from('poste_salary_tiers').select('*').eq('grid_id', (grid as any).id).order('tier_level'); tiers = t || []; }
  return NextResponse.json({ ok: true, grid: grid || null, tiers });
}

// POST { posteId, grid, tiers } -> enregistre (upsert grille + remplace tiers). Logique tolérante
// aux colonnes récentes (discretionary_bonuses / skill_form / use_skill_grid / min_score) reprise
// fidèlement de l'éditeur client.
export async function POST(req: NextRequest) {
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const poste_id = body.posteId;
  const grid = body.grid || {};
  const tiers: any[] = Array.isArray(body.tiers) ? body.tiers : [];
  if (!poste_id) return NextResponse.json({ error: 'posteId requis' }, { status: 400 });

  try {
    const gridPayload: any = {
      tenant_id: tenant, poste_id, name: grid.name, mode: grid.mode, base_salary: grid.base_salary,
      annual_increase_pct: grid.annual_increase_pct, annual_increase_fixed: grid.annual_increase_fixed,
      years_plan: grid.years_plan, cola_pct: grid.cola_pct, hours_per_year: grid.hours_per_year,
      use_skill_grid: grid.use_skill_grid !== false, commission_enabled: !!grid.commission_enabled,
      commission_pct: grid.commission_pct || 0, commission_basis: grid.commission_basis || 'gross',
      commission_threshold: grid.commission_threshold || 0, commission_cap: grid.commission_cap ?? null,
      discretionary_bonuses: grid.discretionary_bonuses || [], skill_form: grid.skill_form || { types: [] },
      grid_conditions: grid.grid_conditions || [],
      notes: grid.notes || null, updated_at: new Date().toISOString(),
    };
    const isMissingCol = (e: any) => /discretionary_bonuses|skill_form|use_skill_grid|grid_conditions/i.test(e?.message || '') || e?.code === 'PGRST204';
    const stripNew = (p: any) => { const { discretionary_bonuses, skill_form, use_skill_grid, grid_conditions, ...rest } = p; return rest; };

    let gridId = grid.id as string | undefined;
    if (gridId) {
      let { error } = await supabaseAdmin.from('poste_salary_grids').update(gridPayload).eq('id', gridId).eq('tenant_id', tenant);
      if (error && isMissingCol(error)) ({ error } = await supabaseAdmin.from('poste_salary_grids').update(stripNew(gridPayload)).eq('id', gridId).eq('tenant_id', tenant));
      if (error) throw error;
    } else {
      let { data, error } = await supabaseAdmin.from('poste_salary_grids').insert(gridPayload).select('id').single();
      if (error && isMissingCol(error)) ({ data, error } = await supabaseAdmin.from('poste_salary_grids').insert(stripNew(gridPayload)).select('id').single());
      if (error) throw error;
      gridId = (data as any)?.id;
    }
    if (!gridId) throw new Error('Grille non enregistrée');

    await supabaseAdmin.from('poste_salary_tiers').delete().eq('grid_id', gridId);
    let skipMinScore = false;
    for (const t of tiers) {
      const base: any = { tenant_id: tenant, grid_id: gridId, tier_level: t.tier_level, tier_name: t.tier_name, annual_salary: t.annual_salary, hourly_rate: t.hourly_rate, required_skills: t.required_skills, min_months_experience: t.min_months_experience, commission_pct: t.commission_pct ?? null, sort_order: t.tier_level, notes: t.notes || null };
      const payload = skipMinScore ? base : { ...base, min_score: t.min_score ?? 0 };
      let { error } = await supabaseAdmin.from('poste_salary_tiers').insert(payload);
      if (error && /min_score/i.test(error.message || '')) { skipMinScore = true; ({ error } = await supabaseAdmin.from('poste_salary_tiers').insert(base)); }
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, gridId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur enregistrement' }, { status: 400 });
  }
}
