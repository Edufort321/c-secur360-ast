// Référentiel PARTAGÉ des parties du corps (zones du schéma corporel react-body-highlighter + overlay).
// Utilisé par le formulaire d'accident (composant IncidentReport) ET le beigne « blessures par partie du
// corps » du tableau de bord HSE. Une seule source de vérité (pas de doublon).

export const BODY_REGION_LABELS: Record<string, string> = {
  // ── Noms retournés par react-body-highlighter ──
  'head': 'Tête / Crâne', 'neck': 'Cou', 'chest': 'Poitrine / Thorax', 'abs': 'Abdominaux', 'obliques': 'Obliques',
  'biceps': 'Biceps', 'triceps': 'Triceps', 'forearm': 'Avant-bras', 'front-deltoids': 'Deltoïdes avant', 'back-deltoids': 'Deltoïdes arrière',
  'trapezius': 'Trapèze', 'upper-back': 'Haut du dos', 'lower-back': 'Bas du dos', 'abductors': 'Abducteurs', 'adductor': 'Adducteur',
  'quadriceps': 'Quadriceps', 'hamstring': 'Ischio-jambiers', 'knees': 'Genoux', 'calves': 'Mollets', 'gluteal': 'Fessiers',
  'left-soleus': 'Soléaire gauche', 'right-soleus': 'Soléaire droit',
  // ── Zones overlay (yeux, mains, pieds — gauche/droite distincts) ──
  'left-eye': 'Œil gauche', 'right-eye': 'Œil droit', 'left-hand': 'Main gauche', 'right-hand': 'Main droite',
  'left-hand-back': 'Main gauche (arrière)', 'right-hand-back': 'Main droite (arrière)', 'left-foot': 'Pied gauche', 'right-foot': 'Pied droit',
  'left-foot-back': 'Pied gauche (arrière)', 'right-foot-back': 'Pied droit (arrière)',
  // ── Noms hérités du SVG custom (rétrocompat données existantes) ──
  'left-shoulder': 'Épaule gauche', 'right-shoulder': 'Épaule droite', 'abdomen': 'Abdomen', 'left-hip': 'Hanche gauche', 'right-hip': 'Hanche droite',
  'left-arm': 'Bras gauche', 'right-arm': 'Bras droit', 'left-forearm': 'Avant-bras gauche', 'right-forearm': 'Avant-bras droit',
  'left-thigh': 'Cuisse gauche', 'right-thigh': 'Cuisse droite', 'left-knee': 'Genou gauche', 'right-knee': 'Genou droit',
  'left-lower-leg': 'Jambe gauche', 'right-lower-leg': 'Jambe droite',
  // ── Vue arrière (rétrocompat données SVG custom) ──
  'head-back': 'Tête (arrière)', 'neck-back': 'Cou (arrière)', 'left-trapezius': 'Épaule / Trapèze gauche', 'right-trapezius': 'Épaule / Trapèze droit',
  'left-buttock': 'Fessier gauche', 'right-buttock': 'Fessier droit', 'left-arm-back': 'Bras gauche (arrière)', 'right-arm-back': 'Bras droit (arrière)',
  'left-forearm-back': 'Avant-bras gauche (arrière)', 'right-forearm-back': 'Avant-bras droit (arrière)', 'left-hamstring': 'Cuisse gauche (arrière)', 'right-hamstring': 'Cuisse droite (arrière)',
  'left-knee-back': 'Genou gauche (arrière)', 'right-knee-back': 'Genou droit (arrière)', 'left-calf': 'Mollet gauche', 'right-calf': 'Mollet droit',
  // ── Nouveaux IDs bilatéraux indépendants (overlay) ──
  'left-biceps': 'Biceps gauche', 'right-biceps': 'Biceps droit', 'left-triceps': 'Triceps gauche', 'right-triceps': 'Triceps droit',
  'left-quad': 'Quadriceps gauche', 'right-quad': 'Quadriceps droit', 'left-front-deltoid': 'Deltoïde avant gauche', 'right-front-deltoid': 'Deltoïde avant droit',
  'left-back-deltoid': 'Deltoïde arrière gauche', 'right-back-deltoid': 'Deltoïde arrière droit', 'left-gluteal': 'Fessier gauche', 'right-gluteal': 'Fessier droit',
};

// Regroupement en ~12 RÉGIONS lisibles pour le beigne (toutes les zones gauche/droite/avant/arrière fondues).
export type BodyGroup = 'head' | 'eyes' | 'neck' | 'shoulders' | 'back' | 'trunk' | 'arms' | 'hands' | 'hips' | 'legs' | 'knees' | 'feet' | 'other';

export const BODY_GROUP_LABELS: Record<BodyGroup, { fr: string; en: string; color: string }> = {
  head: { fr: 'Tête / Crâne', en: 'Head / Skull', color: '#ef4444' },
  eyes: { fr: 'Yeux', en: 'Eyes', color: '#f97316' },
  neck: { fr: 'Cou', en: 'Neck', color: '#f59e0b' },
  shoulders: { fr: 'Épaules', en: 'Shoulders', color: '#eab308' },
  back: { fr: 'Dos', en: 'Back', color: '#84cc16' },
  trunk: { fr: 'Tronc / Thorax', en: 'Trunk / Torso', color: '#22c55e' },
  arms: { fr: 'Bras', en: 'Arms', color: '#14b8a6' },
  hands: { fr: 'Mains / doigts', en: 'Hands / fingers', color: '#06b6d4' },
  hips: { fr: 'Hanches / bassin', en: 'Hips / pelvis', color: '#3b82f6' },
  legs: { fr: 'Jambes', en: 'Legs', color: '#6366f1' },
  knees: { fr: 'Genoux', en: 'Knees', color: '#8b5cf6' },
  feet: { fr: 'Pieds', en: 'Feet', color: '#a855f7' },
  other: { fr: 'Autre / non précisé', en: 'Other / unspecified', color: '#94a3b8' },
};

/** Fond une zone (clé brute) dans sa région agrégée. L'ordre des tests est important (ex. « hand-back » → mains). */
export function bodyRegionGroup(key: string): BodyGroup {
  const k = String(key || '').toLowerCase();
  if (k.includes('eye')) return 'eyes';
  // Tête / visage : crâne, oreille, sourcil, nez, narine, bouche, menton, mâchoire, lèvre, front.
  if (k.includes('head') || k.includes('skull') || k.includes('forehead') || k.includes('ear') || k.includes('brow') || k.includes('nose') || k.includes('nostril') || k.includes('mouth') || k.includes('chin') || k.includes('jaw') || k.includes('lip')) return 'head';
  if (k.includes('neck')) return 'neck';                                  // 'neck-face' → cou (avant les mains/pieds)
  if (k.includes('hand') || k.includes('finger') || k.includes('thumb') || k.includes('palm') || k.includes('wrist')) return 'hands';
  if (k.includes('foot') || k.includes('toe') || k.includes('ankle') || k.includes('heel') || k.includes('sole') || k.includes('instep')) return 'feet';
  if (k.includes('knee')) return 'knees';
  if (k.includes('deltoid') || k.includes('shoulder') || k.includes('trapez')) return 'shoulders';
  if (k.includes('biceps') || k.includes('triceps') || k.includes('forearm') || k.includes('arm')) return 'arms';
  if (k.includes('chest') || k.includes('abs') || k.includes('oblique') || k.includes('abdom') || k.includes('thorax') || k.includes('rib')) return 'trunk';
  if (k.includes('hip') || k.includes('glut') || k.includes('buttock') || k.includes('pelvi')) return 'hips';
  if (k.includes('quad') || k.includes('hamstring') || k.includes('calf') || k.includes('calves') || k.includes('soleus') || k.includes('thigh') || k.includes('leg') || k.includes('abductor') || k.includes('adductor')) return 'legs';
  if (k.includes('back')) return 'back';
  return 'other';
}
