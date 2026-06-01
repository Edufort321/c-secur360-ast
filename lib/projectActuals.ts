import { supabase } from '@/lib/supabase';

// Coût réel d'un projet agrégé AUTOMATIQUEMENT depuis les feuilles de temps pointées
// (timesheet_entries.project_id), au taux de chaque employé (employee_profiles).
// Lien intermodule R6 : Timesheets -> Coûts du projet (plus de double-saisie manuelle).

export type ProjectActualEntry = {
  date: string; employee: string; projectNumber: string;
  hrsReg: number; hrsSupp: number; hrsMaj: number; km: number; materiel: number; allowances: number; cost: number;
};
export type ProjectActuals = {
  total: number; labor: number; km: number; materiel: number; allowances: number;
  hours: { reg: number; supp: number; maj: number };
  entries: ProjectActualEntry[];
  count: number;
  source: 'timesheets';
};

const EMPTY: ProjectActuals = { total: 0, labor: 0, km: 0, materiel: 0, allowances: 0, hours: { reg: 0, supp: 0, maj: 0 }, entries: [], count: 0, source: 'timesheets' };

const sumAllowances = (a: any): number =>
  Array.isArray(a) ? a.reduce((s, x) => s + (Number(x?.amount) || 0), 0) : 0;

export async function computeProjectActuals(tenant: string, projectId: string): Promise<ProjectActuals> {
  if (!projectId) return EMPTY;
  // 1. Lignes de temps pointées sur ce projet
  const { data: ents } = await supabase
    .from('timesheet_entries')
    .select('timesheet_id, date, project_number, hrs_regular, hrs_overtime, hrs_premium, km, materiel, allowances')
    .eq('project_id', projectId);
  const entries = ents || [];
  if (entries.length === 0) return EMPTY;

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

  const out: ProjectActuals = { ...EMPTY, entries: [] };
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
  out.count = out.entries.length;
  out.total = out.labor + out.km + out.materiel + out.allowances;
  out.entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}
