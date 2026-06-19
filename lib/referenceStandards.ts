// Normes de référence centralisées (#admin) — seuils saisis en arrière-plan, lus partout par les moteurs.
// Stocké dans company_settings.reference_standards (jsonb, par tenant). Best-effort (migration 250).
import { supabase } from '@/lib/supabase';

export type ReferenceStandards = {
  // Percentiles de sévérité DGA : par gaz → { _default | <segment> : {p90,p95} }. Remplace les placeholders.
  dga_percentiles?: Record<string, Record<string, { p90: number; p95: number }>>;
  _meta?: { validated_by?: string; validated_at?: string; note?: string };
  [k: string]: any;
};

export async function getReferenceStandards(tenant: string): Promise<ReferenceStandards> {
  try {
    const { data } = await supabase.from('company_settings').select('reference_standards').eq('tenant_id', tenant).maybeSingle();
    const v = (data as any)?.reference_standards;
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export async function saveReferenceStandards(tenant: string, rs: ReferenceStandards): Promise<{ error?: string }> {
  const { error } = await supabase.from('company_settings').upsert(
    { tenant_id: tenant, reference_standards: rs, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  return { error: error?.message };
}
