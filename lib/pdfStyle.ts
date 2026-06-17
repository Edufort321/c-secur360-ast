// Modèles d'export PDF unifiés (#55). Socle de marque commun = style DGA/letterhead ; seule la COULEUR
// D'ACCENT varie par module (en-tête/titre). Config par tenant : company_settings.pdf_styles (JSONB).
// Les exporteurs appellent pdfAccentFor(tenant, moduleKey) pour teinter l'en-tête (défaut = gris DGA).
import { supabase } from '@/lib/supabase';

export type PdfModuleKey = 'soumission' | 'facture' | 'paie' | 'projet' | 'dga' | 'rapports' | 'feuille_temps' | 'inspection' | 'bon_commande';
export const PDF_MODULES: { key: PdfModuleKey; fr: string; en: string }[] = [
  { key: 'soumission', fr: 'Soumission', en: 'Quote' },
  { key: 'facture', fr: 'Facture', en: 'Invoice' },
  { key: 'paie', fr: 'Registre de paie', en: 'Payroll register' },
  { key: 'feuille_temps', fr: 'Feuille de temps', en: 'Timesheet' },
  { key: 'projet', fr: 'Rapport de projet', en: 'Project report' },
  { key: 'bon_commande', fr: 'Bon de commande', en: 'Purchase order' },
  { key: 'dga', fr: 'Diagnostic DGA', en: 'DGA diagnostic' },
  { key: 'rapports', fr: 'Rapport terrain', en: 'Field report' },
  { key: 'inspection', fr: 'Inspection', en: 'Inspection' },
];

// Accent par défaut = gris ardoise sobre (identique à la palette DGA/letterhead).
export const DEFAULT_ACCENT = '#3c3c3c';
export type PdfStyles = {
  modules?: Partial<Record<PdfModuleKey, { accent?: string }>>;
  brand_color?: string; // couleur du HEADER principal du site (pour s'accorder au logo du tenant)
};

/** Convertit un #RRGGBB en triplet [r,g,b] (défaut gris DGA si invalide). */
export function hexToRgb(hex?: string | null): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return [60, 60, 60];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export async function getPdfStyles(tenant: string): Promise<PdfStyles> {
  try {
    const { data } = await supabase.from('company_settings').select('pdf_styles').eq('tenant_id', tenant).maybeSingle();
    const v = (data as any)?.pdf_styles;
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export async function savePdfStyles(tenant: string, styles: PdfStyles): Promise<{ error?: any }> {
  const { error } = await supabase.from('company_settings').upsert({ tenant_id: tenant, pdf_styles: styles, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  return { error };
}

/** Accent (triplet RGB) à appliquer à l'en-tête PDF d'un module donné. Best-effort, défaut gris DGA. */
export async function pdfAccentFor(tenant: string, moduleKey: PdfModuleKey): Promise<[number, number, number]> {
  try {
    const styles = await getPdfStyles(tenant);
    const hex = styles.modules?.[moduleKey]?.accent || DEFAULT_ACCENT;
    return hexToRgb(hex);
  } catch { return hexToRgb(DEFAULT_ACCENT); }
}
