// Contrats d'affiliation co-vendeur (#51) — types, texte legal par defaut, et acces via l'API admin.
// Ce module est importable cote CLIENT comme cote SERVEUR : aucune dependance server-only.
// Les appels reseau (getContract / saveContract) passent par /api/admin/affiliate-contract,
// garde par requireAdmin (service-role applique cote serveur). La table : tenant_affiliate_contracts (migration 120).

export type AffiliateContractStatus = 'brouillon' | 'signe' | 'resilie';

export interface AffiliateContract {
  id?: string;
  tenant_id: string;
  vendor_name: string;
  vendor_email: string;
  commission_pct: number;      // % de commission au vendeur (defaut 20)
  inflation_pct: number;       // indexation annuelle (0 = non indexee)
  recurrence: string;          // defaut 'annuelle'
  start_date: string | null;   // date de creation du tenant (AAAA-MM-JJ)
  clauses: string;             // texte legal complet
  signataire_name: string;
  signataire_title: string;
  signed_at: string | null;    // horodatage ISO de la signature
  status: AffiliateContractStatus;
  created_at?: string;
  updated_at?: string;
}

const pct = (n: number | undefined) => `${(Number(n) || 0).toLocaleString('fr-CA', { maximumFractionDigits: 2 })} %`;
const fmtDateLong = (d?: string | null) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '____________';

/** Texte legal par defaut du contrat d'affiliation co-vendeur (clauses standard, droit du Quebec / Canada). */
export function defaultClauses(c: Partial<AffiliateContract>): string {
  const vendor = (c.vendor_name || '').trim() || 'le Vendeur';
  const commission = pct(c.commission_pct ?? 20);
  const indexation = Number(c.inflation_pct) > 0
    ? `indexee annuellement selon l'inflation (${pct(c.inflation_pct)})`
    : "non indexee a l'inflation, sauf entente ecrite contraire";
  const recurrence = (c.recurrence || '').trim() || 'annuelle';
  const start = fmtDateLong(c.start_date);
  return [
    `CONTRAT D'AFFILIATION — CO-VENDEUR`,
    ``,
    `Entre Commerce CERDIA (cerdia.ai), ci-apres designee « CERDIA », et ${vendor}, ci-apres designe « le Vendeur ».`,
    ``,
    `1. OBJET. Le present contrat etablit le partenariat d'affiliation par lequel CERDIA s'engage a verser au Vendeur une commission de ${commission} sur les revenus nets percus par CERDIA pour le compte client (tenant) associe au present contrat, en contrepartie de la mise en relation et de l'accompagnement du Vendeur.`,
    ``,
    `2. COMMISSION ET INDEXATION. La commission de ${commission} est ${indexation}. Elle est calculee sur les revenus d'abonnement et de services effectivement factures et encaisses pour le compte client vise.`,
    ``,
    `3. RECURRENCE ET DUREE. La commission est versee sur une base ${recurrence}, a la date anniversaire de la creation du compte client (${start}). Le present contrat demeure en vigueur tant que le compte client demeure actif et que les services lui sont rendus.`,
    ``,
    `4. RENOUVELLEMENT. Le contrat se renouvelle automatiquement a chaque echeance ${recurrence}, sauf avis ecrit contraire transmis par l'une des parties au moins trente (30) jours avant l'echeance.`,
    ``,
    `5. RESILIATION. Chacune des parties peut resilier le present contrat moyennant un preavis ecrit de trente (30) jours. Les commissions dues pour les periodes anterieures a la prise d'effet de la resiliation demeurent payables au Vendeur.`,
    ``,
    `6. MODALITES DE PAIEMENT. Les commissions sont payables par CERDIA au Vendeur dans les trente (30) jours suivant l'encaissement effectif des sommes facturees au compte client, par virement ou tout autre moyen convenu entre les parties.`,
    ``,
    `7. CONFIDENTIALITE. Le Vendeur s'engage a garder confidentielles toutes les informations commerciales, financieres et techniques obtenues dans le cadre du present contrat, pendant toute sa duree et apres sa terminaison.`,
    ``,
    `8. NON-SOLLICITATION. Pendant la duree du contrat et pour une periode de douze (12) mois suivant sa terminaison, le Vendeur s'engage a ne pas solliciter ni detourner les clients de CERDIA references dans le cadre du present partenariat.`,
    ``,
    `9. JURIDICTION. Le present contrat est regi par les lois de la province de Quebec et les lois du Canada qui y sont applicables. Tout litige releve de la competence exclusive des tribunaux du district judiciaire competent au Quebec.`,
  ].join('\n');
}

/** Contrat par defaut (brouillon) pour un tenant qui n'a pas encore de contrat enregistre. */
export function defaultContract(
  tenantId: string,
  opts: { vendor_name?: string; vendor_email?: string; commission_pct?: number; start_date?: string | null } = {},
): AffiliateContract {
  const base: AffiliateContract = {
    tenant_id: tenantId,
    vendor_name: opts.vendor_name || '',
    vendor_email: opts.vendor_email || '',
    commission_pct: opts.commission_pct ?? 20,
    inflation_pct: 0,
    recurrence: 'annuelle',
    start_date: opts.start_date ?? null,
    clauses: '',
    signataire_name: '',
    signataire_title: '',
    signed_at: null,
    status: 'brouillon',
  };
  base.clauses = defaultClauses(base);
  return base;
}

export interface AffiliateContractRow extends AffiliateContract {
  tenant_name?: string;        // nom du client (joint cote serveur)
}

/** Liste tous les contrats d'affiliation enregistres (vue d'ensemble super-admin). */
export async function listContracts(): Promise<AffiliateContractRow[]> {
  const res = await fetch('/api/admin/affiliate-contract', { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement des contrats');
  return res.json();
}

/** Charge le contrat d'affiliation d'un tenant (ou un brouillon prerempli si aucun n'existe). */
export async function getContract(tenantId: string): Promise<AffiliateContract> {
  const res = await fetch(`/api/admin/affiliate-contract?tenantId=${encodeURIComponent(tenantId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement du contrat');
  return res.json();
}

/** Enregistre (cree ou met a jour) le contrat d'affiliation d'un tenant. */
export async function saveContract(c: AffiliateContract): Promise<AffiliateContract> {
  const res = await fetch('/api/admin/affiliate-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Erreur d'enregistrement du contrat");
  return res.json();
}
