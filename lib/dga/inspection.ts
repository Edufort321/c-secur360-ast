// ============================================================================
// INSPECTION DE ROUTINE — transformateur à l'huile.
// Checklist standard par catégories (Conforme / Anomalie / N/A par point), avec champs de
// mesure (températures, Ω, kg) et sélecteurs (options). Repris de la liste fournie par Eric.
// ============================================================================

export type InspStatus = 'conforme' | 'anomalie' | 'na' | '';

export interface InspInput {
  key: string; label: string; en: string;
  kind: 'number' | 'text' | 'bool' | 'select';
  unit?: string;
  choices?: { value: string; label: string; en: string }[];
}
export interface InspItem {
  key: string; label: string; en: string;
  optionOnly?: boolean;      // pas de Conforme/Anomalie — sélection/valeur seulement
  inputs?: InspInput[];
}
export interface InspCategory { id: string; label: string; en: string; items: InspItem[]; }

// Résultat saisi pour un point : statut + valeurs des champs + note libre.
export interface InspResult { status: InspStatus; inputs?: Record<string, any>; note?: string; }

const reArme: InspInput = { key: 'rearme', label: 'Réarmé', en: 'Reset', kind: 'bool' };

export const INSPECTION_CHECKLIST: InspCategory[] = [
  {
    id: 'general', label: 'Général', en: 'General', items: [
      { key: 'gen_condition', label: 'Condition générale', en: 'General condition' },
      { key: 'gen_proprete', label: 'Propreté', en: 'Cleanliness' },
      { key: 'gen_plans', label: 'Installation conforme aux plans et devis', en: 'Installation per drawings and specs' },
      { key: 'gen_physique', label: 'État physique et mécanique', en: 'Physical and mechanical condition' },
      { key: 'gen_plaque', label: 'Plaque signalétique selon spécifications', en: 'Nameplate per specifications' },
      { key: 'gen_rouille', label: "Absence d'apparence de rouille", en: 'No appearance of rust' },
      { key: 'gen_suintement', label: 'Absence de suintement de liquide isolant', en: 'No insulating-liquid weeping' },
      { key: 'gen_expedition', label: "Matériel d'expédition retiré", en: 'Shipping material removed' },
    ],
  },
  {
    id: 'protections', label: 'Protections', en: 'Protections', items: [
      { key: 'prot_niveau_ind', label: 'Indicateur de niveau de liquide isolant', en: 'Insulating-liquid level indicator' },
      { key: 'prot_niveau', label: 'Niveau de liquide isolant selon température du liquide', en: 'Liquid level vs liquid temperature' },
      { key: 'prot_pression', label: 'Indicateur de pression / régulateur', en: 'Pressure indicator / regulator' },
      { key: 'prot_buchholz', label: "Relais d'accumulation de gaz", en: 'Gas accumulation relay (Buchholz)' },
      { key: 'prot_pression_soudaine', label: 'Relais de pression soudaine', en: 'Sudden pressure relay' },
      { key: 'prot_parafoudres', label: 'Parafoudres', en: 'Surge arresters' },
      {
        key: 'prot_temp_liquide', label: 'Indicateur de temp. (liquide)', en: 'Temperature indicator (liquid)',
        inputs: [
          { key: 'tactuel', label: 'T° actuel', en: 'Current T°', kind: 'number', unit: '°C' },
          { key: 'tmax', label: 'T° max', en: 'Max T°', kind: 'number', unit: '°C' },
          reArme,
        ],
      },
      {
        key: 'prot_temp_enroulements', label: 'Indicateur de temp. (enroulements)', en: 'Temperature indicator (windings)',
        inputs: [
          { key: 'tactuel', label: 'T° actuel', en: 'Current T°', kind: 'number', unit: '°C' },
          { key: 'tmax', label: 'T° max', en: 'Max T°', kind: 'number', unit: '°C' },
          reArme,
        ],
      },
      {
        key: 'prot_surpression', label: 'Type dispositif de surpression', en: 'Overpressure device type', optionOnly: true,
        inputs: [{ key: 'type', label: 'Type', en: 'Type', kind: 'select', choices: [
          { value: 'tuyau', label: "Tuyau/fenêtre d'explosion", en: 'Explosion pipe/window' },
          { value: 'detendeur', label: 'Détendeur de surpression', en: 'Pressure relief device' },
        ] }],
      },
    ],
  },
  {
    id: 'oltc', label: 'Changeur de prises', en: 'Tap changer', items: [
      { key: 'oltc_fuite', label: 'Absence de fuite de liquide isolant', en: 'No insulating-liquid leak' },
      { key: 'oltc_suintement', label: 'Absence de suintement de liquide isolant', en: 'No insulating-liquid weeping' },
      { key: 'oltc_cadenasse', label: 'Cadenassé', en: 'Locked out' },
      {
        key: 'oltc_fonctionnel', label: 'Fonctionnel', en: 'Functional',
        inputs: [{ key: 'contourne', label: 'Contourné', en: 'Bypassed', kind: 'select', choices: [
          { value: 'oui', label: 'Oui', en: 'Yes' }, { value: 'non', label: 'Non', en: 'No' },
        ] }],
      },
    ],
  },
  {
    id: 'tank', label: 'Cuve et refroidisseurs', en: 'Tank and coolers', items: [
      { key: 'tank_refroidisseurs', label: 'État des refroidisseurs', en: 'Coolers condition' },
      { key: 'tank_expansion', label: "Réservoir d'expansion", en: 'Expansion tank' },
      { key: 'tank_valve_ech', label: "État de la valve d'échantillonnage", en: 'Sampling valve condition' },
      { key: 'tank_mat', label: 'Mise à la terre', en: 'Grounding' },
      { key: 'tank_rouille', label: "Absence d'apparence de rouille", en: 'No appearance of rust' },
      { key: 'tank_fuite', label: 'Absence de fuite de liquide isolant', en: 'No insulating-liquid leak' },
      { key: 'tank_suintement', label: 'Absence de suintement de liquide isolant', en: 'No insulating-liquid weeping' },
      { key: 'tank_ventilateurs_rot', label: 'Rotation libre des ventilateurs', en: 'Free fan rotation' },
      { key: 'tank_dessiccateur', label: "État du dessiccateur d'air", en: 'Air dryer (desiccant) condition', inputs: [{ key: 'kg', label: 'Quantité', en: 'Amount', kind: 'number', unit: 'kg' }] },
      { key: 'tank_mat_mesure', label: 'Résistance de mise à la terre mesurée', en: 'Measured grounding resistance', inputs: [{ key: 'ohm', label: 'Résistance', en: 'Resistance', kind: 'number', unit: 'Ω' }] },
      {
        key: 'tank_ventilateurs_mode', label: 'État des ventilateurs', en: 'Fans state', optionOnly: true,
        inputs: [{ key: 'mode', label: 'Mode', en: 'Mode', kind: 'select', choices: [
          { value: 'auto', label: 'Auto', en: 'Auto' }, { value: 'hors', label: 'Hors', en: 'Off' }, { value: 'manuel', label: 'Manuel', en: 'Manual' },
        ] }],
      },
      {
        key: 'tank_type_refroidisseurs', label: 'Type de refroidisseurs', en: 'Cooler type', optionOnly: true,
        inputs: [{ key: 'type', label: 'Type', en: 'Type', kind: 'select', choices: [
          { value: 'radiateurs', label: 'Radiateurs', en: 'Radiators' }, { value: 'echangeur', label: 'Échangeur', en: 'Heat exchanger' },
        ] }],
      },
      {
        key: 'tank_valves', label: 'Position des valves', en: 'Valve positions',
        inputs: [{ key: 'position', label: 'Position', en: 'Position', kind: 'select', choices: [
          { value: 'ouvert', label: 'Ouvert', en: 'Open' }, { value: 'ferme', label: 'Fermé', en: 'Closed' },
        ] }],
      },
    ],
  },
  {
    id: 'bushings', label: 'Traversées', en: 'Bushings', items: [
      { key: 'bush_isolateurs', label: 'État des isolateurs', en: 'Insulators condition' },
      { key: 'bush_fuite', label: 'Absence de fuite de liquide isolant', en: 'No insulating-liquid leak' },
      { key: 'bush_suintement', label: 'Absence de suintement de liquide isolant', en: 'No insulating-liquid weeping' },
      { key: 'bush_flexibilite', label: 'Flexibilité des raccords', en: 'Connector flexibility' },
      { key: 'bush_tension', label: 'Tension non excessive sur les plages de raccord', en: 'No excessive tension on connection pads' },
      { key: 'bush_contacts', label: 'Surface de contacts', en: 'Contact surfaces' },
      { key: 'bush_niveau_huile', label: "Niveau d'huile", en: 'Oil level' },
      { key: 'bush_serrage', label: 'Serrage des connexions', en: 'Connection tightness' },
    ],
  },
  {
    id: 'cabinet', label: 'Cabinet de contrôle', en: 'Control cabinet', items: [
      { key: 'cab_proprete', label: 'Propreté', en: 'Cleanliness' },
      { key: 'cab_etancheite', label: 'Étanchéité', en: 'Sealing' },
      { key: 'cab_aerateur', label: 'Aérateur', en: 'Ventilator' },
      { key: 'cab_borniers', label: 'Serrage des borniers', en: 'Terminal block tightness' },
      { key: 'cab_chauffage', label: 'Chauffage et thermostat', en: 'Heater and thermostat' },
      { key: 'cab_rouille', label: "Absence d'apparence de rouille", en: 'No appearance of rust' },
      { key: 'cab_etat', label: 'État du cabinet de contrôle', en: 'Control cabinet condition' },
      { key: 'cab_mat', label: 'Mise à la terre', en: 'Grounding' },
      { key: 'cab_drainage', label: 'Drainage', en: 'Drainage' },
    ],
  },
];

export const il = (o: { label: string; en?: string }, lang: 'fr' | 'en' = 'fr') => (lang === 'en' && o.en ? o.en : o.label);

// Tous les points "vérifiables" (hors optionOnly) — utile pour les compteurs.
export function checkableItems(): InspItem[] {
  return INSPECTION_CHECKLIST.flatMap(c => c.items).filter(i => !i.optionOnly);
}
