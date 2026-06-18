// Planification de maintenance/inspection (phase 2) : agrège les ÉCHÉANCES À VENIR de plusieurs sources
// (feuilles de maintenance + reprises DGA) avec l'équipement et le client, pour un tableau de bord trié
// par date (du plus proche au plus loin) avec filtres dynamiques + notification client.
import { supabase } from '@/lib/supabase';

export type PlanSource = 'maintenance' | 'dga' | 'rapport';
export type PlanStatus = 'overdue' | 'soon' | 'ok';
export type PlannedItem = {
  key: string; source: PlanSource; source_id: string; title: string;
  equipment_id?: string | null; equipment_name?: string | null;
  client_id?: string | null; client_name?: string | null; client_email?: string | null;
  site_id?: string | null;
  due_date: string; days: number; status: PlanStatus;
};

const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (d: string) => Math.round((new Date(d + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime()) / 86400000);
const statusOf = (days: number): PlanStatus => (days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok');

/** Agrège toutes les échéances de maintenance/inspection à venir (ou en retard) du tenant. */
export async function getPlannedItems(tenant: string): Promise<PlannedItem[]> {
  const [sheetsRes, dgaRes, eqRes, clientsRes] = await Promise.all([
    supabase.from('maintenance_sheets').select('id, name, equipment_id, next_due_at').eq('tenant_id', tenant),
    supabase.from('dga_dossiers').select('id, ident, serie, extra').eq('tenant_id', tenant),
    supabase.from('equipment').select('id, equipment_name, equipment_serial, equipment_type, client_id, site_id').eq('tenant_id', tenant),
    supabase.from('clients').select('*').eq('tenant_id', tenant), // '*' : résilient si maintenance_alert_email (230) pas encore là
  ]);
  const eqMap = new Map<string, any>(((eqRes.data as any[]) || []).map(e => [e.id, e]));
  const clMap = new Map<string, any>(((clientsRes.data as any[]) || []).map(c => [c.id, c]));
  const eqName = (e: any) => e ? (e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement') : null;
  const clientFor = (eq: any) => { const c = eq?.client_id ? clMap.get(eq.client_id) : null; return c ? { id: c.id, name: c.name, email: c.maintenance_alert_email || c.email || null } : null; };

  const out: PlannedItem[] = [];
  // 1) Feuilles de maintenance (next_due_at)
  for (const s of ((sheetsRes.data as any[]) || [])) {
    const due = (s.next_due_at || '').slice(0, 10); if (!due) continue;
    const eq = s.equipment_id ? eqMap.get(s.equipment_id) : null; const cl = clientFor(eq);
    const days = daysBetween(due);
    out.push({ key: 'm_' + s.id, source: 'maintenance', source_id: s.id, title: s.name || 'Maintenance préventive', equipment_id: s.equipment_id, equipment_name: eqName(eq), client_id: cl?.id, client_name: cl?.name, client_email: cl?.email, site_id: eq?.site_id, due_date: due, days, status: statusOf(days) });
  }
  // 2) Reprises DGA (extra.next_date_manual / full_next_date)
  for (const d of ((dgaRes.data as any[]) || [])) {
    const ex = d.extra || {};
    const due = (ex.next_date_manual || ex.full_next_date || '').slice(0, 10); if (!due) continue;
    const eq = ex.equipment_id ? eqMap.get(ex.equipment_id) : null; const cl = clientFor(eq);
    const days = daysBetween(due);
    out.push({ key: 'd_' + d.id, source: 'dga', source_id: d.id, title: `Reprise DGA — ${d.ident || d.serie || 'transfo'}`, equipment_id: ex.equipment_id, equipment_name: eqName(eq) || (d.ident || d.serie || null), client_id: cl?.id, client_name: cl?.name, client_email: cl?.email, site_id: eq?.site_id, due_date: due, days, status: statusOf(days) });
  }
  return out.sort((a, b) => a.due_date.localeCompare(b.due_date));
}
