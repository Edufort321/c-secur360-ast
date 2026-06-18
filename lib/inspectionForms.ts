// Formulaires d'inspection customisables (module Maintenance/Inspection, phase 1).
// Gabarits réutilisables (sections + items typés) — à la façon des rapports chantier. CRUD via le
// client anon (RLS permissive par tenant, migration 225). Servira aussi au scan QR public (phase 3).
import { supabase } from '@/lib/supabase';

export type FormItemType = 'pass_fail' | 'checkbox' | 'text' | 'number' | 'select' | 'date' | 'photo';

export const ITEM_TYPES: { value: FormItemType; fr: string; en: string }[] = [
  { value: 'pass_fail', fr: 'Conforme / Non conforme / S.O.', en: 'Pass / Fail / N/A' },
  { value: 'checkbox', fr: 'Case à cocher (oui/non)', en: 'Checkbox (yes/no)' },
  { value: 'text', fr: 'Texte', en: 'Text' },
  { value: 'number', fr: 'Nombre / mesure', en: 'Number / measure' },
  { value: 'select', fr: 'Liste de choix', en: 'Dropdown' },
  { value: 'date', fr: 'Date', en: 'Date' },
  { value: 'photo', fr: 'Photo', en: 'Photo' },
];

export type FormItem = {
  id: string;
  label: string;
  type: FormItemType;
  options?: string[];     // pour 'select'
  critical?: boolean;     // non-conformité = défaut critique
  withdrawal?: boolean;   // non-conformité = retrait de service immédiat
  required?: boolean;
  help?: string;
};
export type FormSection = { id: string; title: string; items: FormItem[] };
export type InspectionFormTemplate = {
  id?: string; tenant_id?: string;
  name: string; category?: string; description?: string;
  sections: FormSection[];
  active?: boolean; created_at?: string; updated_at?: string;
};

export const newId = () => (globalThis.crypto?.randomUUID?.() || `f${Date.now()}${Math.round(Math.random() * 1e6)}`);

export function emptyTemplate(): InspectionFormTemplate {
  return { name: '', category: '', description: '', sections: [{ id: newId(), title: 'Section 1', items: [] }], active: true };
}

export async function getInspectionTemplates(tenant: string): Promise<InspectionFormTemplate[]> {
  const { data, error } = await supabase.from('inspection_form_templates')
    .select('*').eq('tenant_id', tenant).order('updated_at', { ascending: false });
  if (error) return [];
  return (data as any[]) || [];
}

export async function saveInspectionTemplate(tenant: string, tpl: InspectionFormTemplate): Promise<{ id?: string; error?: string }> {
  const row: any = {
    tenant_id: tenant,
    name: (tpl.name || '').trim() || 'Formulaire',
    category: tpl.category?.trim() || null,
    description: tpl.description?.trim() || null,
    sections: tpl.sections || [],
    active: tpl.active !== false,
    updated_at: new Date().toISOString(),
  };
  if (tpl.id) {
    const { error } = await supabase.from('inspection_form_templates').update(row).eq('id', tpl.id).eq('tenant_id', tenant);
    return { id: tpl.id, error: error?.message };
  }
  const { data, error } = await supabase.from('inspection_form_templates').insert(row).select('id').single();
  return { id: (data as any)?.id, error: error?.message };
}

export async function deleteInspectionTemplate(tenant: string, id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('inspection_form_templates').delete().eq('id', id).eq('tenant_id', tenant);
  return { error: error?.message };
}

/** Compte total d'items d'un gabarit (pour l'affichage en liste). */
export function countItems(tpl: InspectionFormTemplate): number {
  return (tpl.sections || []).reduce((n, s) => n + (s.items?.length || 0), 0);
}

// ── FEUILLES D'INSPECTION remplies (migration 226) ──────────────────────────────
export type InspectionAnswer = { value?: any; anomaly?: boolean; detail?: string; photos?: string[] };
export type OverallResult = 'conforme' | 'conditionnel' | 'non_conforme' | 'retrait';

export type InspectionSubmission = {
  id?: string; tenant_id?: string;
  template_id?: string; template_name?: string; template_snapshot?: InspectionFormTemplate;
  equipment_id?: string | null; equipment_name?: string | null; client_id?: string | null;
  title?: string | null; inspector_name?: string | null; status?: 'draft' | 'submitted';
  answers: Record<string, InspectionAnswer>;
  overall_result?: OverallResult; anomalies_count?: number; notes?: string;
  created_at?: string; submitted_at?: string | null;
};

export const RESULT_META: Record<OverallResult, { fr: string; en: string; color: string }> = {
  conforme: { fr: 'Conforme', en: 'Pass', color: 'emerald' },
  conditionnel: { fr: 'Conditionnel', en: 'Conditional', color: 'amber' },
  non_conforme: { fr: 'Non conforme', en: 'Fail', color: 'rose' },
  retrait: { fr: 'Retrait de service', en: 'Out of service', color: 'red' },
};

/** Un item est-il en ÉCHEC d'après sa réponse ? (non-conforme pour pass_fail, « non » pour checkbox). */
function isFail(item: FormItem, ans?: InspectionAnswer): boolean {
  if (!ans) return false;
  if (item.type === 'pass_fail') return ans.value === 'non_conforme';
  if (item.type === 'checkbox') return ans.value === false;
  return !!ans.anomaly; // autres types : anomalie déclarée explicitement
}

/** Calcule le résultat global + le nombre d'anomalies (précédence retrait > non_conforme > conditionnel). */
export function computeResult(tpl: InspectionFormTemplate, answers: Record<string, InspectionAnswer>): { result: OverallResult; anomalies: number } {
  let anomalies = 0, withdrawal = false, critical = false, minor = false;
  for (const s of tpl.sections || []) for (const it of s.items || []) {
    if (isFail(it, answers[it.id])) {
      anomalies++;
      if (it.withdrawal) withdrawal = true; else if (it.critical) critical = true; else minor = true;
    }
  }
  const result: OverallResult = withdrawal ? 'retrait' : critical ? 'non_conforme' : minor ? 'conditionnel' : 'conforme';
  return { result, anomalies };
}

export async function getSubmissions(tenant: string, opts?: { equipmentId?: string; limit?: number }): Promise<InspectionSubmission[]> {
  let q = supabase.from('inspection_submissions').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(opts?.limit || 200);
  if (opts?.equipmentId) q = q.eq('equipment_id', opts.equipmentId);
  const { data, error } = await q;
  if (error) return [];
  return (data as any[]) || [];
}

export async function saveSubmission(tenant: string, sub: InspectionSubmission): Promise<{ id?: string; error?: string }> {
  const row: any = {
    tenant_id: tenant,
    template_id: sub.template_id || null, template_name: sub.template_name || null, template_snapshot: sub.template_snapshot || null,
    equipment_id: sub.equipment_id || null, equipment_name: sub.equipment_name || null, client_id: sub.client_id || null,
    title: sub.title || null, inspector_name: sub.inspector_name || null,
    status: sub.status || 'submitted', answers: sub.answers || {},
    overall_result: sub.overall_result || null, anomalies_count: sub.anomalies_count || 0, notes: sub.notes || null,
    submitted_at: (sub.status === 'submitted') ? new Date().toISOString() : null,
  };
  if (sub.id) {
    const { error } = await supabase.from('inspection_submissions').update(row).eq('id', sub.id).eq('tenant_id', tenant);
    return { id: sub.id, error: error?.message };
  }
  const { data, error } = await supabase.from('inspection_submissions').insert(row).select('id').single();
  return { id: (data as any)?.id, error: error?.message };
}

/**
 * Interconnexion inspection → MAINTENANCE : crée une action corrective (maintenance_actions) par point
 * en ÉCHEC d'une feuille rattachée à un équipement. Retrait de service → priorité « critical » (alerte).
 * Renvoie le nombre d'actions créées. Best-effort (n'empêche pas l'enregistrement de la feuille).
 */
export async function createMaintActionsFromSubmission(tenant: string, sub: InspectionSubmission): Promise<number> {
  if (!sub.equipment_id) return 0;
  const tpl = sub.template_snapshot; const answers = sub.answers || {};
  const rows: any[] = [];
  for (const s of tpl?.sections || []) for (const it of s.items || []) {
    const a = answers[it.id]; if (!a) continue;
    const fail = (it.type === 'pass_fail' && a.value === 'non_conforme') || (it.type === 'checkbox' && a.value === false);
    if (!fail) continue;
    rows.push({
      tenant_id: tenant, equipment_id: sub.equipment_id,
      description: `[Inspection ${sub.template_name || ''}] ${it.label}${a.detail ? ' — ' + a.detail : ''}${it.withdrawal ? ' (RETRAIT DE SERVICE)' : ''}`.slice(0, 500),
      priority: it.withdrawal ? 'critical' : it.critical ? 'high' : 'normal',
      status: 'todo',
      photos: Array.isArray(a.photos) ? a.photos : [],
    });
  }
  if (!rows.length) return 0;
  try { const { error } = await supabase.from('maintenance_actions').insert(rows); return error ? 0 : rows.length; }
  catch { return 0; }
}

// ── GABARITS PRÉ-MONTÉS (check-lists SST courantes, conforme/non-conforme/S.O.) ──────────────
type StarterItem = { label: string; type?: FormItemType; critical?: boolean; withdrawal?: boolean; options?: string[] };
type Starter = { name: string; category: string; sections: { title: string; items: StarterItem[] }[] };

export const STARTER_TEMPLATES: Starter[] = [
  {
    name: 'Inspection — Chariot élévateur', category: 'Levage / manutention',
    sections: [
      { title: 'Avant démarrage (visuel)', items: [
        { label: 'Pneus / roues (état, pression)' }, { label: 'Fuites visibles (huile, hydraulique, liquide)' , critical: true },
        { label: 'Fourches et tablier (fissures, déformation)', critical: true, withdrawal: true }, { label: 'Chaînes de levage et boyaux hydrauliques', critical: true },
        { label: 'Plaque de capacité présente et lisible' }, { label: 'Protège-conducteur (FOPS) et dosseret de charge' },
      ] },
      { title: 'Fonctionnel (moteur en marche)', items: [
        { label: 'Freins de service et frein de stationnement', critical: true, withdrawal: true }, { label: 'Direction' , critical: true },
        { label: 'Avertisseur sonore (klaxon)' }, { label: 'Alarme de recul et gyrophare' }, { label: 'Phares et feux' },
        { label: 'Levage / inclinaison / déplacement latéral' }, { label: 'Ceinture de sécurité fonctionnelle', critical: true },
        { label: 'Niveau de charge batterie / carburant', type: 'number' },
      ] },
    ],
  },
  {
    name: 'Inspection — Échelle / escabeau', category: 'Travail en hauteur',
    sections: [{ title: 'Vérification', items: [
      { label: 'Montants et barreaux (fissures, pliures)', critical: true, withdrawal: true }, { label: 'Patins antidérapants présents et en bon état' },
      { label: 'Étiquette de capacité / classe lisible' }, { label: 'Verrous / araignée d’escabeau fonctionnels', critical: true },
      { label: 'Propreté (huile, graisse sur barreaux)' }, { label: 'Aucune réparation improvisée', critical: true },
    ] }],
  },
  {
    name: 'Inspection — Harnais antichute', category: 'Protection antichute',
    sections: [{ title: 'Harnais et composants', items: [
      { label: 'Sangles (coupures, brûlures, effilochage)', critical: true, withdrawal: true }, { label: 'Coutures (intégrité)', critical: true, withdrawal: true },
      { label: 'Boucles et D d’accrochage (corrosion, déformation)', critical: true }, { label: 'Indicateur de chute non déployé', critical: true, withdrawal: true },
      { label: 'Absorbeur d’énergie intact', critical: true }, { label: 'Date de fabrication / durée de vie respectée' }, { label: 'Étiquette lisible' },
    ] }],
  },
  {
    name: 'Inspection — Extincteur portatif', category: 'Protection incendie',
    sections: [{ title: 'Mensuelle', items: [
      { label: 'Accessible et bien situé (non obstrué)' }, { label: 'Goupille et scellé en place' },
      { label: 'Manomètre dans la zone verte', critical: true }, { label: 'Boyau / buse en bon état' },
      { label: 'Aucune corrosion / dommage au cylindre', critical: true }, { label: 'Étiquette d’entretien à jour (date)', type: 'date' },
    ] }],
  },
  {
    name: 'Inspection — Véhicule léger / camion', category: 'Véhicule',
    sections: [
      { title: 'Extérieur', items: [
        { label: 'Pneus (usure, pression)' }, { label: 'Feux, clignotants, freins (lumières)' }, { label: 'Pare-brise et essuie-glaces' },
        { label: 'Carrosserie / fuites sous le véhicule' }, { label: 'Plaque et vignette valides' },
      ] },
      { title: 'Intérieur / sécurité', items: [
        { label: 'Ceintures de sécurité', critical: true }, { label: 'Freins (test)', critical: true, withdrawal: true }, { label: 'Klaxon et avertisseur de recul' },
        { label: 'Trousse de premiers soins et extincteur' }, { label: 'Niveau de carburant', type: 'number' }, { label: 'Odomètre (km)', type: 'number' },
      ] },
    ],
  },
];

/** Convertit un gabarit pré-monté en formulaire éditable (avec identifiants frais). */
export function starterToTemplate(s: Starter): InspectionFormTemplate {
  return {
    name: s.name, category: s.category, description: '', active: true,
    sections: s.sections.map(sec => ({
      id: newId(), title: sec.title,
      items: sec.items.map(it => ({ id: newId(), label: it.label, type: it.type || 'pass_fail', critical: it.critical, withdrawal: it.withdrawal, options: it.options })),
    })),
  };
}
