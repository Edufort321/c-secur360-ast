// Actionnaires, cap table et dividendes (#32). Données SENSIBLES → 100 % via routes serveur
// (service_role + niveau direction/super_user). L'info bancaire n'est jamais renvoyée en clair
// dans les listes (masquée), seulement révélée à la demande au plus haut niveau.

export type HolderType = 'individual' | 'corporation' | 'trust';
export type Shareholder = {
  id?: string; tenant_id?: string; full_name: string; email?: string | null; phone?: string | null;
  address?: string | null; holder_type?: HolderType; tax_id?: string | null; is_active?: boolean;
  notes?: string | null; created_at?: string; updated_at?: string;
  // agrégats calculés côté serveur (lecture seule)
  shares_total?: number; banking_on_file?: boolean;
};
export type ShareholderBanking = {
  shareholder_id?: string; payment_method?: 'eft' | 'cheque' | 'other';
  bank_institution?: string | null; bank_transit?: string | null; bank_account?: string | null;
  iban?: string | null; swift?: string | null; account_holder?: string | null;
};
export type ShareClass = {
  id?: string; tenant_id?: string; name: string; votes_per_share?: number; is_voting?: boolean;
  par_value?: number; liquidation_pref?: number; sort_order?: number;
};
export type ShareTxnType = 'issuance' | 'transfer_in' | 'transfer_out' | 'buyback';
export type ShareTransaction = {
  id?: string; tenant_id?: string; shareholder_id: string; share_class_id?: string | null;
  txn_date: string; txn_type?: ShareTxnType; shares: number; price_per_share?: number;
  amount?: number; gl_entry_id?: string | null; notes?: string | null; created_at?: string;
};
export type DividendType = 'eligible' | 'non_eligible' | 'capital';
export type DividendDeclaration = {
  id?: string; tenant_id?: string; declaration_date: string; record_date?: string | null;
  payment_date?: string | null; share_class_id?: string | null; dividend_type?: DividendType;
  total_amount?: number; per_share?: number; status?: 'declared' | 'paid' | 'cancelled';
  gl_entry_id?: string | null; notes?: string | null;
};
export type DividendPayment = {
  id?: string; declaration_id?: string; shareholder_id: string; shares?: number; amount?: number;
  status?: 'pending' | 'paid'; paid_date?: string | null; gl_entry_id?: string | null;
  // jointure d'affichage
  shareholder_name?: string;
};

const J = { 'Content-Type': 'application/json' };
async function call<T = any>(url: string, method: string, tenant: string, body?: any): Promise<T> {
  const r = await fetch(url, { method, headers: J, credentials: 'include', body: JSON.stringify({ tenant, ...(body || {}) }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Erreur ${r.status}`);
  return j as T;
}
async function get<T = any>(url: string, tenant: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ tenant, ...params }).toString();
  const r = await fetch(`${url}?${qs}`, { credentials: 'include' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Erreur ${r.status}`);
  return j as T;
}

// ── Actionnaires ──
export const getShareholders = (tenant: string) => get<{ shareholders: Shareholder[]; classes: ShareClass[] }>('/api/shareholders', tenant);
export const saveShareholder = (tenant: string, s: Shareholder) => call<{ id: string }>('/api/shareholders', 'POST', tenant, { shareholder: s });
export const deleteShareholder = (tenant: string, id: string) => call('/api/shareholders', 'DELETE', tenant, { id });
// Bancaire : révélation (plus haut niveau) + enregistrement.
export const revealBanking = (tenant: string, id: string) => get<{ banking: ShareholderBanking | null }>('/api/shareholders/banking', tenant, { id });
export const saveBanking = (tenant: string, id: string, b: ShareholderBanking) => call('/api/shareholders/banking', 'POST', tenant, { id, banking: b });

// ── Cap table ──
export const getShares = (tenant: string) => get<{ transactions: ShareTransaction[]; classes: ShareClass[]; holdings: { shareholder_id: string; shares: number }[] }>('/api/shares', tenant);
export const saveShareClass = (tenant: string, c: ShareClass) => call<{ id: string }>('/api/shares', 'POST', tenant, { kind: 'class', shareClass: c });
export const saveShareTxn = (tenant: string, t: ShareTransaction) => call<{ id: string }>('/api/shares', 'POST', tenant, { kind: 'txn', transaction: t });
export const deleteShareTxn = (tenant: string, id: string) => call('/api/shares', 'DELETE', tenant, { id });

// ── Dividendes ──
export const getDividends = (tenant: string) => get<{ declarations: DividendDeclaration[]; payments: DividendPayment[] }>('/api/dividends', tenant);
// Déclare un dividende + répartit par actionnaire au prorata des actions détenues + poste au GL.
export const declareDividend = (tenant: string, d: DividendDeclaration) => call<{ id: string }>('/api/dividends', 'POST', tenant, { kind: 'declare', declaration: d });
export const payDividend = (tenant: string, declarationId: string) => call('/api/dividends', 'POST', tenant, { kind: 'pay', declarationId });
export const cancelDividend = (tenant: string, declarationId: string) => call('/api/dividends', 'POST', tenant, { kind: 'cancel', declarationId });

// Masque un n° de compte pour l'affichage (•••• 1234).
export const maskAccount = (v?: string | null) => { const s = String(v || ''); return s.length > 4 ? `•••• ${s.slice(-4)}` : (s ? '••••' : ''); };
