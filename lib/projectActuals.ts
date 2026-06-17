import { supabase } from '@/lib/supabase';

// Coût réel d'un projet agrégé AUTOMATIQUEMENT depuis les feuilles de temps pointées
// (timesheet_entries.project_id), au taux de chaque employé (employee_profiles).
// Lien intermodule R6 : Timesheets -> Coûts du projet (plus de double-saisie manuelle).

export type ProjectActualEntry = {
  date: string; employee: string; projectNumber: string;
  hrsReg: number; hrsSupp: number; hrsMaj: number; km: number; materiel: number; allowances: number; cost: number;
};
export type ProjectActualExpense = {
  id: string; date: string; category: string; description: string; supplier: string; total: number; reimbursable: boolean;
};
export type ProjectActuals = {
  total: number; labor: number; km: number; materiel: number; allowances: number;
  expensesBillable: number; // dépenses refacturables (reimbursable) — entrent dans la facture
  expensesTotal: number;    // toutes les dépenses pointées sur le projet (coût)
  hours: { reg: number; supp: number; maj: number };
  entries: ProjectActualEntry[];
  expenseEntries: ProjectActualExpense[];
  count: number;
  source: 'timesheets';
};

const EMPTY: ProjectActuals = { total: 0, labor: 0, km: 0, materiel: 0, allowances: 0, expensesBillable: 0, expensesTotal: 0, hours: { reg: 0, supp: 0, maj: 0 }, entries: [], expenseEntries: [], count: 0, source: 'timesheets' };

const sumAllowances = (a: any): number =>
  Array.isArray(a) ? a.reduce((s, x) => s + (Number(x?.amount) || 0), 0) : 0;

export async function computeProjectActuals(tenant: string, projectId: string): Promise<ProjectActuals> {
  if (!projectId) return EMPTY;
  // Le poinçon (ou une feuille) peut renseigner SOIT project_id (UUID), SOIT seulement project_number
  // (si la tâche planifiée n'a pas de project_id). On agrège donc sur project_id OU project_number.
  let projectNumber = '';
  try { const { data: p } = await supabase.from('projects').select('project_number').eq('id', projectId).maybeSingle(); projectNumber = (p?.project_number || '').trim(); } catch { /* ignore */ }
  // 1. Lignes de temps pointées sur ce projet (par id ou par numéro)
  const orFilter = projectNumber ? `project_id.eq.${projectId},project_number.eq.${projectNumber}` : `project_id.eq.${projectId}`;
  const { data: ents } = await supabase
    .from('timesheet_entries')
    .select('timesheet_id, date, project_number, hrs_regular, hrs_overtime, hrs_premium, km, materiel, allowances')
    .eq('tenant_id', tenant)
    .or(orFilter);
  const entries = ents || [];

  // 1b. Dépenses pointées sur ce projet (timesheet_expenses.project_id) — refacturables → facture.
  let expenseEntries: ProjectActualExpense[] = [];
  let expensesBillable = 0, expensesTotal = 0;
  try {
    const { data: exps } = await supabase
      .from('timesheet_expenses')
      .select('id, date, category, description, supplier, total, reimbursable, project_id')
      .eq('project_id', projectId);
    for (const x of (exps || []) as any[]) {
      const t = Number(x.total) || 0;
      const reimb = x.reimbursable !== false;
      expensesTotal += t;
      if (reimb) expensesBillable += t;
      expenseEntries.push({ id: String(x.id), date: x.date || '', category: x.category || 'autre', description: x.description || '', supplier: x.supplier || '', total: t, reimbursable: reimb });
    }
    expenseEntries.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch { /* table/colonne absente — ignore */ }

  if (entries.length === 0 && expenseEntries.length === 0) return EMPTY;

  // 2. Feuilles -> employé
  const tsIds = [...new Set(entries.map((e: any) => e.timesheet_id).filter(Boolean))];
  const { data: sheets } = await supabase
    .from('timesheets')
    .select('id, employee_id, employee_name')
    .eq('tenant_id', tenant)
    .in('id', tsIds.length ? tsIds : ['__none__']);
  const sheetMap: Record<string, any> = Object.fromEntries((sheets || []).map((s: any) => [s.id, s]));

  // 3. Taux horaires par employé
  const empIds = [...new Set((sheets || []).map((s: any) => s.employee_id).filter(Boolean))];
  const { data: profs } = await supabase
    .from('employee_profiles')
    .select('employee_id, hourly_rate, ot_multiplier, dt_multiplier')
    .eq('tenant_id', tenant)
    .in('employee_id', empIds.length ? empIds : ['__none__']);
  const profMap: Record<string, any> = Object.fromEntries((profs || []).map((p: any) => [p.employee_id, p]));

  // 4. Taux kilométrique (1re entrée 'km' du barème)
  const { data: kmRows } = await supabase.from('rate_settings').select('value').eq('tenant_id', tenant).eq('category', 'km').limit(1);
  const kmRate = kmRows && kmRows[0] ? Number(kmRows[0].value) || 0 : 0;

  const out: ProjectActuals = { ...EMPTY, entries: [], expenseEntries, expensesBillable, expensesTotal };
  for (const e of entries as any[]) {
    const sheet = sheetMap[e.timesheet_id] || {};
    const prof = profMap[sheet.employee_id] || {};
    const rate = Number(prof.hourly_rate) || 0;
    const ot = Number(prof.ot_multiplier) || 1.5;
    const dt = Number(prof.dt_multiplier) || 2;
    const reg = Number(e.hrs_regular) || 0;
    const supp = Number(e.hrs_overtime) || 0;
    const maj = Number(e.hrs_premium) || 0;
    const km = Number(e.km) || 0;
    const materiel = Number(e.materiel) || 0;
    const allw = sumAllowances(e.allowances);
    const labor = reg * rate + supp * rate * ot + maj * rate * dt;
    const kmCost = km * kmRate;
    const cost = labor + kmCost + materiel + allw;

    out.labor += labor;
    out.km += kmCost;
    out.materiel += materiel;
    out.allowances += allw;
    out.hours.reg += reg; out.hours.supp += supp; out.hours.maj += maj;
    out.entries.push({
      date: e.date || '', employee: sheet.employee_name || '—', projectNumber: e.project_number || '',
      hrsReg: reg, hrsSupp: supp, hrsMaj: maj, km, materiel, allowances: allw, cost,
    });
  }
  out.count = out.entries.length + out.expenseEntries.length;
  // Coût de main-d'œuvre (sert de base « Feuille de temps » à la facture, hors dépenses refacturables ajoutées à part).
  out.total = out.labor + out.km + out.materiel + out.allowances;
  out.entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}
