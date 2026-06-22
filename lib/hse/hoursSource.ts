// Module HSE — DÉNOMINATEUR D'HEURES auto-alimenté depuis les VRAIES sources du projet (plus de saisie
// manuelle obligatoire). Source autoritaire = feuilles de temps (`timesheets`, accumulées par la paie
// chaque semaine). Le planner (`planner_assignments.hours`) fournit les heures-homme PLANIFIÉES, exposées
// pour comparaison (interconnexion), JAMAIS additionnées au réel (éviter le double comptage).
// Tout scopé par tenant_id (TEXT slug), lectures best-effort (ne casse pas le KPI si une table manque).
import { supabase } from '@/lib/supabase';
import type { HseHours } from '@/lib/hse/data';

// Statuts de feuille de temps qui comptent comme « heures travaillées » (exclut draft/rejected).
const WORKED_STATUSES = ['submitted', 'approved', 'paid'];
const weekEnd = (start: string) => { const d = new Date(start + 'T00:00:00'); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10); };

export type HoursBreakdown = {
  timesheetHours: number;     // heures réelles (feuilles de temps)
  manualHours: number;        // saisies manuelles (semaines non couvertes par les feuilles)
  plannedHours: number;       // heures-homme planifiées (planner) — indicatif
  weeks: number;              // nb de semaines couvertes par les feuilles de temps
  source: 'timesheets' | 'manual' | 'mixed' | 'none';
};

/** Heures réelles par semaine depuis les feuilles de temps (reg + supp + majoré). */
export async function aggregateTimesheetHours(tenant: string): Promise<{ rows: HseHours[]; headcountByWeek: Record<string, Set<string>> }> {
  try {
    const { data } = await supabase.from('timesheets')
      .select('employee_id, period_start, period_end, status, total_regular, total_overtime, total_premium')
      .eq('tenant_id', tenant).in('status', WORKED_STATUSES);
    const byWeek: Record<string, HseHours> = {};
    const headcountByWeek: Record<string, Set<string>> = {};
    for (const t of (data || []) as any[]) {
      const ws = t.period_start as string; if (!ws) continue;
      const h = (Number(t.total_regular) || 0) + (Number(t.total_overtime) || 0) + (Number(t.total_premium) || 0);
      (byWeek[ws] ||= { period_start: ws, period_end: t.period_end || weekEnd(ws), hours: 0, headcount: 0 }).hours += h;
      (headcountByWeek[ws] ||= new Set()).add(String(t.employee_id || ''));
    }
    for (const ws of Object.keys(byWeek)) byWeek[ws].headcount = headcountByWeek[ws].size;
    return { rows: Object.values(byWeek), headcountByWeek };
  } catch { return { rows: [], headcountByWeek: {} }; }
}

/** Heures-homme PLANIFIÉES par mois (planner_assignments.hours). Indicatif — pour comparaison réel/planifié. */
export async function plannedManHours(tenant: string): Promise<{ month: string; hours: number }[]> {
  try {
    const { data } = await supabase.from('planner_assignments').select('assigned_date, hours').eq('tenant_id', tenant);
    const byMonth: Record<string, number> = {};
    for (const a of (data || []) as any[]) { const m = (a.assigned_date || '').slice(0, 7); if (!m) continue; byMonth[m] = (byMonth[m] || 0) + (Number(a.hours) || 0); }
    return Object.entries(byMonth).map(([month, hours]) => ({ month, hours: Math.round(hours * 100) / 100 })).sort((a, b) => a.month.localeCompare(b.month));
  } catch { return []; }
}

// Saisie manuelle au niveau du MOIS (1er → dernier jour) : heures de SOUS-TRAITANTS / ajustement
// faites sur le site, ADDITIONNÉES aux heures auto (employés). Sert à l'édition de l'« Évolution mensuelle ».
const lastDayOfMonth = (ym: string) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).toISOString().slice(0, 10); };
export const isMonthEntry = (h: HseHours) => !!h.period_start && /-01$/.test(h.period_start) && !!h.period_end && h.period_end === lastDayOfMonth(h.period_start.slice(0, 7));
export const monthOverridePeriod = (month: string) => ({ period_start: `${month}-01`, period_end: lastDayOfMonth(month) });
const monthOf = (s?: string) => (s || '').slice(0, 7);

/**
 * Dénominateur KPI : AUTO (feuilles de temps employés) PRIORITAIRE + manuel ADDITIF (sous-traitants /
 * ajustement sur le site, non saisis dans les feuilles de temps). Total mois = auto + manuel.
 * Retourne aussi les heures auto et manuelles PAR MOIS pour l'affichage/édition de l'évolution mensuelle.
 */
export async function resolveKpiHours(tenant: string, manual: HseHours[]): Promise<{ hours: HseHours[]; breakdown: HoursBreakdown; tsByMonth: Record<string, number>; manualByMonth: Record<string, number>; autoWeeks: HseHours[] }> {
  const { rows: ts } = await aggregateTimesheetHours(tenant);
  const hours = [...ts, ...manual];   // additif : employés (auto) + sous-traitants/ajustements (manuel)

  const tsByMonth: Record<string, number> = {}; for (const r of ts) tsByMonth[monthOf(r.period_start)] = (tsByMonth[monthOf(r.period_start)] || 0) + (Number(r.hours) || 0);
  const manualByMonth: Record<string, number> = {}; for (const m of manual) manualByMonth[monthOf(m.period_start)] = (manualByMonth[monthOf(m.period_start)] || 0) + (Number(m.hours) || 0);

  const timesheetHours = ts.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const manualHours = manual.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const planned = await plannedManHours(tenant);
  const plannedHours = planned.reduce((s, r) => s + r.hours, 0);
  const source: HoursBreakdown['source'] = ts.length && manual.length ? 'mixed' : ts.length ? 'timesheets' : manual.length ? 'manual' : 'none';

  // Semaines AUTO (feuilles de temps) triées récentes d'abord — affichées en lecture seule dans la carte.
  const autoWeeks = [...ts].sort((a, b) => String(b.period_start).localeCompare(String(a.period_start)));
  return { hours, breakdown: { timesheetHours: Math.round(timesheetHours * 100) / 100, manualHours: Math.round(manualHours * 100) / 100, plannedHours, weeks: ts.length, source }, tsByMonth, manualByMonth, autoWeeks };
}
