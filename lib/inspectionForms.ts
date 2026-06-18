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
