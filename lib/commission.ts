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

export async function syncProjectCommission(supabase: any, tenant: string, project: any): Promise<CommissionResult> {
  try {
    if (project?.status !== 'vente') return { ok: false, msg: 'statut non « vente »' };
    if (!project.primary_seller_id) return { ok: false, msg: 'aucun vendeur assigné' };

    // Vendeur
    const { data: seller } = await supabase.from('planner_personnel')
      .select('id, name, email, current_grid_id').eq('id', project.primary_seller_id).maybeSingle();
    if (!seller?.email) return { ok: false, msg: 'vendeur sans courriel' };

    // Grille salariale du vendeur (via le palier/grille assigné)
    let grid: any = null;
    if (seller.current_grid_id) {
      ({ data: grid } = await supabase.from('poste_salary_grids').select('*').eq('id', seller.current_grid_id).maybeSingle());
    }
    if (!grid || !grid.commission_enabled) return { ok: false, msg: 'commission non activée pour le poste du vendeur' };

    // Base de calcul selon la configuration de la grille
    const po = Number(project.po_amount) || 0;
    const sale = Number(project.sale_amount) || po;
    const margin = Number(project.margin_amount) || 0;
    const basis = grid.commission_basis === 'margin' ? margin : grid.commission_basis === 'net' ? sale : po;
    const threshold = Number(grid.commission_threshold) || 0;
    if (basis < threshold) return { ok: false, msg: `montant (${basis}) sous le seuil (${threshold})` };
    let amount = basis * (Number(grid.commission_pct) || 0) / 100;
    const cap = grid.commission_cap != null ? Number(grid.commission_cap) : null;
    if (cap != null && cap > 0) amount = Math.min(amount, cap);
    amount = Math.round(amount * 100) / 100;
    if (amount <= 0) return { ok: false, msg: 'commission nulle (vérifier le % de la grille)' };

    // Semaine de conclusion (date de début des travaux, sinon aujourd'hui)
    const week = weekStartOf(project.date_work_start || undefined);
    const weekEnd = addDays(week, 6);

    // Feuille de temps du vendeur pour la semaine (créée si absente)
    let { data: sheet } = await supabase.from('timesheets')
      .select('id, commission_details')
      .eq('tenant_id', tenant).ilike('employee_email', seller.email).eq('period_start', week).maybeSingle();
    if (!sheet) {
      const { data: created, error } = await supabase.from('timesheets').insert({
        tenant_id: tenant, employee_id: '', employee_email: seller.email, employee_name: seller.name,
        period_start: week, period_end: weekEnd, status: 'draft',
        total_commissions: 0, commission_details: [],
      }).select('id, commission_details').single();
      if (error) return { ok: false, msg: 'création feuille : ' + error.message };
      sheet = created;
    }
    if (!sheet) return { ok: false, msg: 'feuille de temps introuvable' };

    // Détail des commissions : remplace l'entrée du même projet (anti-doublon)
    const details = Array.isArray(sheet.commission_details)
      ? sheet.commission_details.filter((d: any) => d.project_id !== project.id) : [];
    details.push({ project_id: project.id, project_number: project.project_number, title: project.title || '', amount });
    const totalComm = Math.round(details.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0) * 100) / 100;

    const { error: upErr } = await supabase.from('timesheets')
      .update({ total_commissions: totalComm, commission_details: details, updated_at: new Date().toISOString() })
      .eq('id', sheet.id);
    if (upErr) return { ok: false, msg: 'maj feuille : ' + upErr.message };

    // Historique project_commissions (remplace l'entrée existante du projet/vendeur)
    await supabase.from('project_commissions').delete().eq('project_id', project.id).eq('personnel_id', seller.id);
    await supabase.from('project_commissions').insert({
      tenant_id: tenant, project_id: project.id, personnel_id: seller.id,
      commission_pct: Number(grid.commission_pct) || 0, basis: grid.commission_basis || 'gross',
      basis_amount: basis, commission_amount: amount, role: 'vendeur', share_pct: 100,
      status: 'pending', week_start: week, timesheet_id: sheet.id,
    });

    return { ok: true, msg: `Commission de ${amount.toLocaleString('fr-CA')} $ ajoutée à la feuille du ${week} de ${seller.name}` };
  } catch (e: any) {
    return { ok: false, msg: e?.message || 'erreur commission' };
  }
}
