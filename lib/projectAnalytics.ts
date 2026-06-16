// Analytique ERP des projets (vue dirigeant). Fonctions PURES : calculent les KPIs / classements à partir
// de la liste des projets. Aucune dépendance réseau — réutilisable côté dashboard global et par projet.

export type ProjectLike = {
  id?: string;
  project_number?: string | null;
  title?: string | null;
  client_name?: string | null;
  status?: string | null;
  po_amount?: number | null;
  estimate?: { total?: number | null } | null;
  actuals?: { total?: number | null } | null;
  date_submission?: string | null;
  date_work_start?: string | null;
  created_at?: string | null;
};

export type ProjectMetric = {
  id: string; number: string; title: string; client: string; status: string;
  contract: number;   // valeur du contrat : montant BC, sinon total soumission
  cost: number;       // coût réel (feuilles de temps) si disponible
  margin: number;     // contract − cost
  marginPct: number;  // margin / contract (0 si contract = 0)
  hasFinancials: boolean; // contrat ET coût connus → marge fiable
  profitable: boolean;
};

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
// Statuts « gagnés » (devenus des projets) vs « en soumission » (devis ouvert).
const WON = new Set(['vente', 'en-cours', 'facture']);

export function projectMetric(p: ProjectLike): ProjectMetric {
  const contract = n(p.po_amount) || n(p.estimate?.total);
  const cost = n(p.actuals?.total);
  const margin = contract - cost;
  const hasFinancials = contract > 0 && cost > 0;
  return {
    id: String(p.id || ''), number: p.project_number || '—', title: p.title || '—', client: p.client_name || '—',
    status: p.status || 'sans-soumission',
    contract, cost, margin, marginPct: contract > 0 ? (margin / contract) * 100 : 0,
    hasFinancials, profitable: hasFinancials ? margin >= 0 : true,
  };
}

export type ProjectAnalytics = {
  count: number;
  byStatus: Record<string, number>;
  quotedCount: number;     // soumissions ouvertes
  wonCount: number;        // vente + en-cours + facturé
  conversionPct: number;   // won / (won + soumissions ouvertes)
  contractTotal: number;   // valeur totale des contrats
  wipValue: number;        // valeur des projets « en cours » (work in progress)
  invoicedValue: number;   // valeur des projets facturés
  costTotal: number;       // coûts réels (là où connus)
  marginTotal: number;     // marge totale (projets avec finances)
  avgMarginPct: number;    // marge % moyenne pondérée par le contrat
  financedCount: number;   // nb de projets avec marge fiable
  metrics: ProjectMetric[];        // tous, triés par marge décroissante
  best: ProjectMetric[];           // top profitables (avec finances)
  worst: ProjectMetric[];          // pires (marge la plus faible / négative)
  unprofitable: ProjectMetric[];   // marge négative (avec finances)
};

export function computeProjectAnalytics(projects: ProjectLike[]): ProjectAnalytics {
  const list = projects || [];
  const metrics = list.map(projectMetric);
  const byStatus: Record<string, number> = {};
  for (const p of list) { const s = p.status || 'sans-soumission'; byStatus[s] = (byStatus[s] || 0) + 1; }

  const quotedCount = byStatus['soumission'] || 0;
  const wonCount = (byStatus['vente'] || 0) + (byStatus['en-cours'] || 0) + (byStatus['facture'] || 0);
  const conversionDen = wonCount + quotedCount;

  const contractTotal = metrics.reduce((s, m) => s + m.contract, 0);
  const wipValue = metrics.filter(m => m.status === 'en-cours').reduce((s, m) => s + m.contract, 0);
  const invoicedValue = metrics.filter(m => m.status === 'facture').reduce((s, m) => s + m.contract, 0);
  const costTotal = metrics.reduce((s, m) => s + m.cost, 0);

  const withFin = metrics.filter(m => m.hasFinancials);
  const marginTotal = withFin.reduce((s, m) => s + m.margin, 0);
  const finContract = withFin.reduce((s, m) => s + m.contract, 0);
  const avgMarginPct = finContract > 0 ? (marginTotal / finContract) * 100 : 0;

  const sorted = [...metrics].sort((a, b) => b.margin - a.margin);
  const finSorted = [...withFin].sort((a, b) => b.marginPct - a.marginPct);

  return {
    count: list.length, byStatus, quotedCount, wonCount,
    conversionPct: conversionDen > 0 ? (wonCount / conversionDen) * 100 : 0,
    contractTotal, wipValue, invoicedValue, costTotal,
    marginTotal, avgMarginPct, financedCount: withFin.length,
    metrics: sorted,
    best: finSorted.slice(0, 5),
    worst: finSorted.slice(-5).reverse(),
    unprofitable: withFin.filter(m => m.margin < 0).sort((a, b) => a.margin - b.margin),
  };
}

export const STATUS_ORDER = ['sans-soumission', 'soumission', 'vente', 'en-cours', 'facture'] as const;
export const STATUS_LABEL: Record<string, string> = {
  'sans-soumission': 'Sans soumission', soumission: 'Soumission', vente: 'Vente', 'en-cours': 'En cours', facture: 'Facturé',
};
export const STATUS_HEX: Record<string, string> = {
  'sans-soumission': '#94a3b8', soumission: '#f59e0b', vente: '#8b5cf6', 'en-cours': '#3b82f6', facture: '#10b981',
};
