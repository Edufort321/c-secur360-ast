// Module HSE — indicateurs PROACTIFS (leading) nourris AUTOMATIQUEMENT par les modules existants :
//   • AST/JSA réalisées (ast_forms, status submitted) → metric JSA.
//   • Permis de travail (work_permits + confined_space_permits) → metric WORK_PERMIT (analyse de risque
//     avant travaux = prise de conscience proactive).
// Lecture live (anon, tables opérationnelles) agrégée par mois ; fusionnée avec les saisies manuelles
// (hse_proactive_metric) pour le graphique leading/lagging. Best-effort : ne casse pas si une table manque.
import { supabase } from '@/lib/supabase';
import type { ProactiveLite } from '@/components/hse/HseKpiCharts';

const monthStart = (iso: string) => (iso || '').slice(0, 7) + '-01';

async function countByMonth(table: string, tenant: string, dateCol: string, filter?: (q: any) => any): Promise<Record<string, number>> {
  try {
    let q = supabase.from(table).select(`id, ${dateCol}`).eq('tenant_id', tenant);
    if (filter) q = filter(q);
    const { data } = await q;
    const by: Record<string, number> = {};
    for (const r of (data || []) as any[]) { const d = (r as any)[dateCol]; if (!d) continue; const m = monthStart(String(d)); by[m] = (by[m] || 0) + 1; }
    return by;
  } catch { return {}; }
}

/** Indicateurs proactifs dérivés des autres modules (JSA depuis AST, WORK_PERMIT depuis permis). */
export async function proactiveFeedLive(tenant: string): Promise<ProactiveLite[]> {
  const [jsa, wp, csp] = await Promise.all([
    countByMonth('ast_forms', tenant, 'created_at', q => q.neq('status', 'draft')),
    countByMonth('work_permits', tenant, 'updated_at'),          // work_permits n'a PAS de created_at
    countByMonth('confined_space_permits', tenant, 'created_at'),
  ]);
  const out: ProactiveLite[] = [];
  for (const [m, v] of Object.entries(jsa)) out.push({ metric_code: 'JSA', period_start: m, count_value: v });
  const permitsByMonth: Record<string, number> = { ...wp };
  for (const [m, v] of Object.entries(csp)) permitsByMonth[m] = (permitsByMonth[m] || 0) + v;
  for (const [m, v] of Object.entries(permitsByMonth)) out.push({ metric_code: 'WORK_PERMIT', period_start: m, count_value: v });
  return out;
}
