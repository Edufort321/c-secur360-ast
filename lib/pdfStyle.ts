// Modèles d'export PDF unifiés (#55). Socle de marque commun = style DGA/letterhead. Réglages de mise en
// page (couleurs, épaisseur des filets/bandes, tailles de police, affichage du filet) : un STYLE PAR
// DÉFAUT unifié (appliqué partout) + des OVERRIDES par module (« personnalisable par export »). Config par
// tenant : company_settings.pdf_styles (JSONB). Les exporteurs appellent pdfStyleFor(tenant, module).
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

export const DEFAULT_ACCENT = '#3c3c3c';
// Réglages de mise en page d'un export (tous optionnels -> héritent du défaut puis du socle DGA).
export type PdfStyleKnobs = {
  accent?: string;        // couleur d'accent (filet/titre)
  accent2?: string;       // couleur secondaire (sous-titre / totaux)
  ruleWidth?: number;     // épaisseur du filet / bande d'en-tête (0,5–4 pt)
  titleSize?: number;     // taille du titre (pt)
  subtitleSize?: number;  // taille du sous-titre (pt)
  showRule?: boolean;     // afficher le filet sous l'en-tête
};
export type PdfStyles = {
  brand_color?: string;   // couleur du HEADER principal du site
  unified?: boolean;      // true = tous les modules suivent le style « default »
  default?: PdfStyleKnobs;
  modules?: Partial<Record<PdfModuleKey, PdfStyleKnobs>>;
};

// Valeurs du socle DGA (si rien n'est réglé).
export const BASE_KNOBS: Required<PdfStyleKnobs> = { accent: DEFAULT_ACCENT, accent2: '#787878', ruleWidth: 0.6, titleSize: 14, subtitleSize: 11, showRule: true };

export type ResolvedPdfStyle = { accent: [number, number, number]; accent2: [number, number, number]; ruleWidth: number; titleSize: number; subtitleSize: number; showRule: boolean };

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

/** Fusionne socle DGA ← style par défaut ← override module (sauf si « unifié »). */
export function resolveKnobs(styles: PdfStyles, moduleKey: PdfModuleKey): Required<PdfStyleKnobs> {
  const d = styles.default || {};
  const m = styles.unified ? {} : (styles.modules?.[moduleKey] || {});
  const pick = <K extends keyof PdfStyleKnobs>(k: K): Required<PdfStyleKnobs>[K] =>
    (m[k] ?? d[k] ?? BASE_KNOBS[k]) as Required<PdfStyleKnobs>[K];
  return { accent: pick('accent'), accent2: pick('accent2'), ruleWidth: pick('ruleWidth'), titleSize: pick('titleSize'), subtitleSize: pick('subtitleSize'), showRule: pick('showRule') };
}

/** Style résolu (RGB + tailles) à appliquer à l'en-tête PDF d'un module. Best-effort. */
export async function pdfStyleFor(tenant: string, moduleKey: PdfModuleKey): Promise<ResolvedPdfStyle> {
  try {
    const k = resolveKnobs(await getPdfStyles(tenant), moduleKey);
    return { accent: hexToRgb(k.accent), accent2: hexToRgb(k.accent2), ruleWidth: Number(k.ruleWidth) || 0.6, titleSize: Number(k.titleSize) || 14, subtitleSize: Number(k.subtitleSize) || 11, showRule: k.showRule !== false };
  } catch {
    return { accent: hexToRgb(DEFAULT_ACCENT), accent2: [120, 120, 120], ruleWidth: 0.6, titleSize: 14, subtitleSize: 11, showRule: true };
  }
}

/** Rétro-compat : accent seul. */
export async function pdfAccentFor(tenant: string, moduleKey: PdfModuleKey): Promise<[number, number, number]> {
  return (await pdfStyleFor(tenant, moduleKey)).accent;
}
