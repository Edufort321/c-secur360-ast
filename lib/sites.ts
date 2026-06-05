// Source UNIQUE des sites/départements : la hiérarchie gérée par l'admin (« Sites/Départements »)
// dans planner_succursales (type 'site' | 'departement', parent_id). Les modules (inspection,
// inventaire, DGA…) consomment cette liste au lieu de saisir des emplacements en texte libre.
import { supabase } from '@/lib/supabase';

export interface SiteDept { id: string; name: string; code?: string | null }
export interface SiteNode extends SiteDept { departments: SiteDept[] }

export async function getSitesTree(tenant: string): Promise<SiteNode[]> {
  const { data, error } = await supabase
    .from('planner_succursales')
    .select('id, name, code, type, parent_id')
    .eq('tenant_id', tenant)
    .order('name');
  if (error || !data) return [];
  const rows = data as any[];
  const sites = rows.filter(r => !r.parent_id); // sites = racines (type 'site')
  return sites.map(s => ({
    id: s.id, name: s.name, code: s.code,
    departments: rows.filter(r => r.parent_id === s.id).map(d => ({ id: d.id, name: d.name, code: d.code })),
  }));
}

// Libellé lisible d'un site/département à partir des IDs (pour affichage hors formulaire).
export function siteLabel(tree: SiteNode[], siteId?: string | null, deptId?: string | null): string {
  const s = tree.find(x => x.id === siteId);
  if (!s) return '';
  const d = deptId ? s.departments.find(x => x.id === deptId) : null;
  return d ? `${s.name} · ${d.name}` : s.name;
}
