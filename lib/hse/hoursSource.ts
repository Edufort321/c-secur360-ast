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

/**
 * Dénominateur KPI résolu : feuilles de temps EN PRIORITÉ par semaine ; les saisies manuelles
 * (hse_hours_worked) ne comblent QUE les semaines non couvertes (pas de double comptage).
 */
export async function resolveKpiHours(tenant: string, manual: HseHours[]): Promise<{ hours: HseHours[]; breakdown: HoursBreakdown }> {
  const { rows: ts } = await aggregateTimesheetHours(tenant);
  const tsWeeks = new Set(ts.map(r => r.period_start));
  const manualKept = manual.filter(m => !tsWeeks.has(m.period_start));   // manuel seulement hors semaines couvertes
  const hours = [...ts, ...manualKept];

  const timesheetHours = ts.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const manualHours = manualKept.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const planned = await plannedManHours(tenant);
  const plannedHours = planned.reduce((s, r) => s + r.hours, 0);
  const source: HoursBreakdown['source'] = ts.length && manualKept.length ? 'mixed' : ts.length ? 'timesheets' : manualKept.length ? 'manual' : 'none';

  return { hours, breakdown: { timesheetHours: Math.round(timesheetHours * 100) / 100, manualHours: Math.round(manualHours * 100) / 100, plannedHours, weeks: ts.length, source } };
}
