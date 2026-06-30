// Palette KPI HSE — SOURCE UNIQUE DE VÉRITÉ pour les couleurs des graphiques.
// « Une couleur = une signification PARTOUT » : ambre = enregistrable dans CHAQUE graphique, etc.
// Sécurité daltonisme : LTIFR bleu vs TRIR ambre (forte différence de teinte) — ne JAMAIS s'appuyer
// uniquement sur l'opposition rouge/vert. Valeurs hex = palette Tailwind (cohérence avec le reste de l'app).

// Couleurs par SÉRIE de KPI (graphique de tendance + leading/lagging).
export const KPI_COLORS = {
  ltifr: '#2563eb',    // bleu franc (blue-600)
  trir: '#f59e0b',     // ambre (amber-500)
  dart: '#fb7185',     // rose/rouge atténué (rose-400)
  severity: '#7c3aed', // violet (violet-600)
  hours: '#94a3b8',    // gris neutre (slate-400)
  target: '#9ca3af',   // gris (gray-400) — lignes-cibles
  proactive: '#16a34a',// vert (green-600) — indicateurs proactifs
} as const;

// Couleurs SÉMANTIQUES partagées par tous les graphiques d'incidents (pyramide + par type).
export const SEVERITY_COLORS = {
  serious: '#dc2626',   // grave / avec arrêt (red-600)
  lostTime: '#dc2626',  // synonyme — avec arrêt
  recordable: '#f59e0b',// enregistrable / mineur (amber-500)
  minor: '#f59e0b',     // synonyme — mineur
  nearMiss: '#3b82f6',  // passé proche (blue-500)
  fatality: '#7f1d1d',  // décès (red-900)
  slate: '#64748b',     // dommages matériels (slate-500)
  default: '#ef4444',   // repli (red-500)
} as const;

// event_code → clé sémantique. Familles : rouge (grave), ambre (enregistrable), bleu (passé proche),
// ardoise (matériel). Tout code inconnu retombe sur `default`.
const EVENT_SEVERITY: Record<string, keyof typeof SEVERITY_COLORS> = {
  FATALITY: 'fatality',
  SPECIFIED_INJURY: 'serious',
  MULTI_WORKER_INJURY: 'serious',
  OVER_7_DAY: 'serious',
  RECORDABLE: 'recordable',
  OCC_DISEASE: 'recordable',
  NEAR_MISS: 'nearMiss',
  MATERIAL_DAMAGE: 'slate',
};

/** Couleur d'un type d'incident à partir de son event_code (mappe sur SEVERITY_COLORS). */
export function eventColor(code: string): string {
  const key = EVENT_SEVERITY[code];
  return key ? SEVERITY_COLORS[key] : SEVERITY_COLORS.default;
}
