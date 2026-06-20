// Module HSE — ANTI-DUPLICATION : les données DÉJÀ saisies ailleurs nourrissent les registres, sans
// ressaisie. Chaque type de registre peut « importer » des candidats depuis le module source :
//   • LIFTING_CSA (inspection levage) ← table `equipment` (anon, opérationnelle).
//   • TRAINING (formations)           ← `hr_certifications` (verrou RH → route service_role canHr).
// L'import crée des entrées de registre LIÉES (reference = id source) ; les candidats déjà importés
// (même reference) sont ignorés → zéro doublon.
import { supabase } from '@/lib/supabase';
import { saveRegisterEntry, getRegisterEntries, computeReviewDue } from '@/lib/hse/data';

export type FeedCandidate = { reference: string; title: string; data: Record<string, any> };

/** Équipements (anon) → registre d'inspection de levage. */
export async function feedEquipment(tenant: string): Promise<FeedCandidate[]> {
  try {
    const { data } = await supabase.from('equipment').select('id, equipment_name, equipment_serial, equipment_type, equipment_location').eq('tenant_id', tenant).order('equipment_name');
    return (data || []).map((e: any) => ({
      reference: String(e.id),
      title: e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement',
      data: { equipment: e.equipment_name || e.equipment_type || '', serial: e.equipment_serial || '', location: e.equipment_location || '' },
    }));
  } catch { return []; }
}

/** Certifications RH (verrou) → registre des formations. Passe par la route service_role (canHr). */
export async function feedCertifications(tenant: string): Promise<FeedCandidate[]> {
  try {
    const r = await fetch(`/api/hse/register-feed?source=certifications&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.items || []) as FeedCandidate[];
  } catch { return []; }
}

/** Inspections (anomalies / non-conformités) → registre des non-conformités. */
export async function feedNonConformities(tenant: string): Promise<FeedCandidate[]> {
  const out: FeedCandidate[] = [];
  // Formulaires d'inspection (nouvelle génération).
  try {
    const { data } = await supabase.from('inspection_submissions').select('id, equipment_name, overall_result, anomalies_count, submitted_at').eq('tenant_id', tenant).order('submitted_at', { ascending: false }).limit(200);
    for (const s of (data || []) as any[]) {
      if (!(Number(s.anomalies_count) > 0 || s.overall_result === 'non_conforme' || s.overall_result === 'retrait')) continue;
      out.push({ reference: 'insp:' + s.id, title: `${s.equipment_name || 'Inspection'} — ${s.anomalies_count || ''} anomalie(s)`.trim(), data: { category: 'Inspection', severity: s.overall_result || 'non_conforme', action: '', date: (s.submitted_at || '').slice(0, 10) } });
    }
  } catch { /* best-effort */ }
  // Inspections d'équipement (legacy).
  try {
    const { data } = await supabase.from('equipment_inspections').select('id, equipment_type, equipment_serial, overall_result, inspection_date').eq('tenant_id', tenant).in('overall_result', ['non_conforme', 'retrait', 'conditionnel']).order('inspection_date', { ascending: false }).limit(200);
    for (const s of (data || []) as any[]) {
      out.push({ reference: 'eqinsp:' + s.id, title: `${s.equipment_type || 'Équipement'} ${s.equipment_serial || ''} — ${s.overall_result}`.trim(), data: { category: 'Inspection équipement', severity: s.overall_result, action: '', date: (s.inspection_date || '').slice(0, 10) } });
    }
  } catch { /* best-effort */ }
  return out;
}

// Quel registre se nourrit de quelle source.
export const FEED_BY_CODE: Record<string, { labelFr: string; labelEn: string; fetch: (t: string) => Promise<FeedCandidate[]> }> = {
  LIFTING_CSA: { labelFr: 'Importer depuis les équipements', labelEn: 'Import from equipment', fetch: feedEquipment },
  TRAINING: { labelFr: 'Importer depuis les certifications RH', labelEn: 'Import from HR certifications', fetch: feedCertifications },
  NON_CONFORMITY: { labelFr: 'Importer depuis les inspections', labelEn: 'Import from inspections', fetch: feedNonConformities },
};

/** Crée les entrées manquantes (anti-doublon par `reference`). Retourne le nombre importé. */
export async function importFeedCandidates(tenant: string, tenantRegisterId: string, reviewMonths: number | null, candidates: FeedCandidate[]): Promise<number> {
  const existing = await getRegisterEntries(tenant, tenantRegisterId);
  const seen = new Set(existing.map((e: any) => e.reference).filter(Boolean));
  let n = 0;
  for (const c of candidates) {
    if (seen.has(c.reference)) continue;
    const review_due_at = computeReviewDue(c.data?.last_review_at || c.data?.completed_at || null, reviewMonths);
    const { error } = await saveRegisterEntry(tenant, { tenant_register_id: tenantRegisterId, reference: c.reference, title: c.title, data: c.data, review_due_at });
    if (!error) n++;
  }
  return n;
}
