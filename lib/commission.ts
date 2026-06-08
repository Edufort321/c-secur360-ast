// Commission de vente : quand un projet passe au statut 'vente' avec un vendeur,
// calcule la commission selon la grille salariale du vendeur et la reporte sur sa
// feuille de temps de la semaine de conclusion.

// Lundi (début de semaine) de la date donnée — format YYYY-MM-DD.
export function weekStartOf(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export type CommissionResult = { ok: boolean; msg: string };

// Crédite la commission d'UN vendeur sur SA PART (sharePct %) du projet, à SON % de grille.
async function creditSeller(supabase: any, tenant: string, project: any, sellerId: string, sharePct: number): Promise<{ ok: boolean; msg: string; amount: number }> {
  const { data: seller } = await supabase.from('planner_personnel')
    .select('id, name, email, current_grid_id').eq('id', sellerId).maybeSingle();
  if (!seller?.email) return { ok: false, msg: 'vendeur sans courriel', amount: 0 };
  let grid: any = null;
  if (seller.current_grid_id) ({ data: grid } = await supabase.from('poste_salary_grids').select('*').eq('id', seller.current_grid_id).maybeSingle());
  if (!grid || !grid.commission_enabled) return { ok: false, msg: `${seller.name} : commission non activée pour son poste`, amount: 0 };

  const po = Number(project.po_amount) || 0;
  const sale = Number(project.sale_amount) || po;
  const margin = Number(project.margin_amount) || 0;
  const fullBasis = grid.commission_basis === 'margin' ? margin : grid.commission_basis === 'net' ? sale : po;
  const share = Math.max(0, Math.min(100, Number(sharePct) || 0)) / 100;
  const basis = fullBasis * share; // base AU PRORATA de la part du vendeur
  const threshold = Number(grid.commission_threshold) || 0;
  if (fullBasis < threshold) return { ok: false, msg: `${seller.name} : montant sous le seuil`, amount: 0 };
  let amount = basis * (Number(grid.commission_pct) || 0) / 100;
  const cap = grid.commission_cap != null ? Number(grid.commission_cap) : null;
  if (cap != null && cap > 0) amount = Math.min(amount, cap);
  amount = Math.round(amount * 100) / 100;
  if (amount <= 0) return { ok: false, msg: `${seller.name} : commission nulle`, amount: 0 };

  const week = weekStartOf(project.date_work_start || undefined);
  const weekEnd = addDays(week, 6);
  let { data: sheet } = await supabase.from('timesheets').select('id, commission_details')
    .eq('tenant_id', tenant).ilike('employee_email', seller.email).eq('period_start', week).maybeSingle();
  if (!sheet) {
    const { data: created, error } = await supabase.from('timesheets').insert({
      tenant_id: tenant, employee_id: '', employee_email: seller.email, employee_name: seller.name,
      period_start: week, period_end: weekEnd, status: 'draft', total_commissions: 0, commission_details: [],
    }).select('id, commission_details').single();
    if (error) return { ok: false, msg: 'création feuille : ' + error.message, amount: 0 };
    sheet = created;
  }
  const details = Array.isArray(sheet.commission_details) ? sheet.commission_details.filter((d: any) => d.project_id !== project.id) : [];
  details.push({ project_id: project.id, project_number: project.project_number, title: project.title || '', amount, share_pct: Math.round(share * 100) });
  const totalComm = Math.round(details.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0) * 100) / 100;
  await supabase.from('timesheets').update({ total_commissions: totalComm, commission_details: details, updated_at: new Date().toISOString() }).eq('id', sheet.id);

  await supabase.from('project_commissions').delete().eq('project_id', project.id).eq('personnel_id', seller.id);
  await supabase.from('project_commissions').insert({
    tenant_id: tenant, project_id: project.id, personnel_id: seller.id,
    commission_pct: Number(grid.commission_pct) || 0, basis: grid.commission_basis || 'gross',
    basis_amount: basis, commission_amount: amount, role: 'vendeur', share_pct: Math.round(share * 100),
    status: 'pending', week_start: week, timesheet_id: sheet.id,
  });
  return { ok: true, msg: `${seller.name} : ${amount.toLocaleString('fr-CA')} $ (${Math.round(share * 100)} %)`, amount };
}

export async function syncProjectCommission(supabase: any, tenant: string, project: any): Promise<CommissionResult> {
  try {
    if (project?.status !== 'vente') return { ok: false, msg: 'statut non « vente »' };
    // Liste des vendeurs + parts : sellers_split [{seller_id, pct}] si présent, sinon le vendeur principal à 100 %.
    let sellers: { seller_id: string; pct: number }[] = Array.isArray(project.sellers_split) ? project.sellers_split.filter((x: any) => x?.seller_id) : [];
    if (!sellers.length && project.primary_seller_id) sellers = [{ seller_id: project.primary_seller_id, pct: 100 }];
    if (!sellers.length) return { ok: false, msg: 'aucun vendeur assigné' };

    // Nettoie les commissions des vendeurs qui ne sont plus dans la liste (révision du partage).
    try {
      const keep = sellers.map(s => s.seller_id);
      const { data: existing } = await supabase.from('project_commissions').select('personnel_id').eq('project_id', project.id);
      for (const r of (existing || [])) if (!keep.includes(r.personnel_id)) await supabase.from('project_commissions').delete().eq('project_id', project.id).eq('personnel_id', r.personnel_id);
    } catch { /* best-effort */ }

    const msgs: string[] = [];
    for (const s of sellers) { const r = await creditSeller(supabase, tenant, project, s.seller_id, Number(s.pct) || 0); msgs.push(r.msg); }
    return { ok: true, msg: msgs.join(' · ') };
  } catch (e: any) {
    return { ok: false, msg: e?.message || 'erreur commission' };
  }
}
