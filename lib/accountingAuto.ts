// Génération automatique d'écritures comptables depuis les événements métier.
// Approche idempotente par (source_type, source_id) : ré-exécutable sans doublon.
// Phase 2 : paie (feuilles de temps). Les ventes/factures arriveront avec le module Facture.
import { supabase } from '@/lib/supabase';
import { getAccounts, createEntry, seedAccountingDefaults } from '@/lib/accounting';

async function accountMap(tenant: string): Promise<Record<string, string>> {
  const accs = await getAccounts(tenant);
  const m: Record<string, string> = {};
  for (const a of accs) m[a.code] = a.id;
  return m;
}

/** Carte des comptes en s'assurant que le plan comptable EXISTE : si absent, on l'initialise (idempotent)
 *  pour que la comptabilisation « juste marche » sans étape manuelle. Si la migration 085 manque, renvoie
 *  une carte vide et l'appelant affiche un message. */
async function ensureAccountMap(tenant: string): Promise<Record<string, string>> {
  let m = await accountMap(tenant);
  if (!m['1000'] || !m['4000']) {
    try { await seedAccountingDefaults(tenant); m = await accountMap(tenant); } catch { /* migration 085 absente */ }
  }
  return m;
}

/** Compte GL (id) du compte de trésorerie assigné à la transaction (banque/carte de crédit), ou null. */
async function treasuryGlAccountId(txn: any): Promise<string | null> {
  if (!txn?.treasury_account_id) return null;
  try {
    const { data } = await supabase.from('treasury_accounts').select('gl_account_id').eq('id', txn.treasury_account_id).maybeSingle();
    return (data as any)?.gl_account_id || null;
  } catch { return null; } // table absente (migration 185) -> repli sur 1000
}

async function entryExists(tenant: string, sourceType: string, sourceId: string): Promise<boolean> {
  const { data } = await supabase.from('gl_entries').select('id')
    .eq('tenant_id', tenant).eq('source_type', sourceType).eq('source_id', sourceId).limit(1);
  return !!(data && data.length);
}

/**
 * Écriture de paie pour une feuille de temps.
 *   DR 5000 Salaires et avantages   = net + déduction véhicule − commissions + retenues à la source
 *   DR 5050 Commissions             = commissions
 *   CR 2300 Salaires à payer        = montant net versé
 *   CR 2200 Retenues fédéral        = federal_deductions (RPC/AE/impôt fédéral)
 *   CR 2210 Retenues Québec         = quebec_deductions (RRQ/RQAP/impôt QC/FSS)
 *   CR 5200 Frais de véhicules      = déduction véhicule (usage perso retenu)
 * Les retenues sont prises sur la feuille (federal_deductions / quebec_deductions, migration 088) ;
 * si elles sont à 0, l'écriture est identique au comportement antérieur.
 */
export async function postTimesheetPayroll(
  tenant: string, ts: any, accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'empty' | 'no-accounts'> {
  const total = Number(ts.total_amount) || 0;
  if (total <= 0) return 'empty';
  if (await entryExists(tenant, 'timesheet', ts.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['5000'] || !m['2300']) return 'no-accounts';

  const ded = Number(ts.vehicle_deduction) || 0;
  const comm = Number(ts.total_commissions) || 0;
  const fedDed = Number(ts.federal_deductions) || 0;
  const qcDed = Number(ts.quebec_deductions) || 0;
  const salaries = total + ded - comm + fedDed + qcDed;

  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: m['5000'], debit: salaries, credit: 0, description: 'Salaires et avantages' },
  ];
  if (comm > 0 && m['5050']) lines.push({ account_id: m['5050'], debit: comm, credit: 0, description: 'Commissions sur ventes' });
  lines.push({ account_id: m['2300'], debit: 0, credit: total, description: 'Net à payer' });
  if (fedDed > 0 && m['2200']) lines.push({ account_id: m['2200'], debit: 0, credit: fedDed, description: 'Retenues a la source - federal (RPC/AE/impot)' });
  if (qcDed > 0 && m['2210']) lines.push({ account_id: m['2210'], debit: 0, credit: qcDed, description: 'Retenues a la source - Quebec (RRQ/RQAP/impot/FSS)' });
  if (ded > 0 && m['5200']) lines.push({ account_id: m['5200'], debit: 0, credit: ded, description: 'Déduction véhicule (usage personnel)' });

  await createEntry(tenant, {
    entry_date: ts.period_end || ts.period_start || new Date().toISOString().slice(0, 10),
    description: `Paie — ${ts.employee_name || ts.employee_email || ''} (${ts.period_start || ''} → ${ts.period_end || ''})`,
    reference: ts.id ? `TS-${String(ts.id).slice(0, 8)}` : undefined,
    journal_code: 'PAY', source_type: 'timesheet', source_id: ts.id,
    lines,
  });
  return 'created';
}

/**
 * DÉPENSE saisie dans une FEUILLE DE TEMPS (remboursable ou par carte) -> grand livre.
 *   DR <charge 5300>          = sous-total
 *   DR 1200 TPS à récupérer   = gst (CTI)
 *   DR 1210 TVQ à récupérer   = qst (RTI)
 *   CR 2300 (remboursable -> à payer à l'employé via la paie) | CR 1000 (non remboursable -> banque/carte) = total
 * Idempotent par (source_type='timesheet_expense', source_id). La dépense remonte déjà au PROJET
 * via project_id (rollup WIP) ; ici on la fait remonter à la COMPTABILITÉ.
 */
export async function postTimesheetExpense(tenant: string, exp: any, accMap?: Record<string, string>): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (!exp?.id) return 'skipped';
  if (await entryExists(tenant, 'timesheet_expense', exp.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['5300'] || !m['2300']) return 'no-accounts';
  const sub = Number(exp.subtotal) || 0;
  const gst = Number(exp.gst) || 0, qst = Number(exp.qst) || 0;
  const total = Number(exp.total) || (sub + gst + qst);
  if (total <= 0) return 'skipped';
  const creditAcc = exp.reimbursable ? m['2300'] : (m['1000'] || m['2300']); // à rembourser à l'employé OU banque/carte
  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: m['5300'], debit: sub, credit: 0, description: exp.description || exp.category || 'Dépense (feuille de temps)' },
  ];
  if (gst > 0 && m['1200']) lines.push({ account_id: m['1200'], debit: gst, credit: 0, description: 'TPS a recuperer (CTI)' });
  if (qst > 0 && m['1210']) lines.push({ account_id: m['1210'], debit: qst, credit: 0, description: 'TVQ a recuperer (RTI)' });
  lines.push({ account_id: creditAcc, debit: 0, credit: total, description: exp.reimbursable ? 'A rembourser a l employe' : 'Banque / carte' });
  await createEntry(tenant, {
    entry_date: exp.date || new Date().toISOString().slice(0, 10),
    description: `Dépense feuille de temps — ${exp.supplier || exp.category || ''}`,
    reference: `EXP-${String(exp.id).slice(0, 8)}`, journal_code: 'ACH', source_type: 'timesheet_expense', source_id: exp.id, lines,
  });
  return 'created';
}

/**
 * Écriture d'achat pour une transaction (dépense / achat fournisseur).
 *   DR <comptes de charge>          = montants nets ventilés par ligne
 *   DR 5300 (taxe non récupérable)  = PST/RST (hors Québec) capitalisée en charge
 *   DR 1200 TPS/TVH à récupérer     = gst_amount (CTI)
 *   DR 1210 TVQ à récupérer         = qst_amount (RTI)
 *   CR 1000 Banque (comptant) | CR 2000 Fournisseurs (à crédit) = total
 * Idempotent par (source_type='transaction', source_id). Met à jour gl_entry_id + statut 'posted'.
 */
// Multi-devise : convertit les lignes GL vers la devise de BASE (× fx_rate) et rééquilibre au cent près.
// fx_rate = 1 (défaut) → lignes inchangées (aucune régression sur l'existant).
function applyFx<T extends { debit: number; credit: number }>(lines: T[], fxRate: any): T[] {
  const fx = Number(fxRate) || 1;
  if (fx === 1) return lines;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const scaled = lines.map(l => ({ ...l, debit: r2((l.debit || 0) * fx), credit: r2((l.credit || 0) * fx) }));
  const diff = r2(scaled.reduce((s, l) => s + l.debit, 0) - scaled.reduce((s, l) => s + l.credit, 0));
  if (Math.abs(diff) >= 0.01) {
    if (diff > 0) { const i = scaled.findIndex(l => l.credit > 0); if (i >= 0) scaled[i].credit = r2(scaled[i].credit + diff); }
    else { const i = scaled.findIndex(l => l.debit > 0); if (i >= 0) scaled[i].debit = r2(scaled[i].debit + diff); }
  }
  return scaled;
}
const fxNote = (txn: any) => { const fx = Number(txn?.fx_rate) || 1; return fx !== 1 ? ` (${txn.currency} @ ${fx})` : ''; };

export async function postTransactionPurchase(
  tenant: string, txn: any, items: any[], accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (txn.gl_entry_id) return 'skipped';
  if (await entryExists(tenant, 'transaction', txn.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  // Compte de CRÉDIT selon le règlement :
  //  - 'reimbursement' (dépense payée par un employé/personne) -> 2300 « à rembourser à l'employé »
  //  - 'investment' (apport : la personne paie comme un investissement dans l'entreprise) -> 3100 Capital
  //  - 'shares_payment' (l'entreprise RÈGLE en émettant des actions/parts — aucun décaissement) -> 3100 Capital-actions
  //  - sinon : à crédit -> Fournisseurs (2000) ; comptant -> trésorerie assignée (banque/carte) sinon 1000.
  const kind = txn.settlement_kind || 'standard';
  const treasury = txn.payment_method === 'on_account' ? null : await treasuryGlAccountId(txn);
  let payAcc = txn.payment_method === 'on_account' ? m['2000'] : (treasury || m['1000']);
  let payLabel = txn.payment_method === 'on_account' ? 'Fournisseurs a payer' : 'Banque';
  if (kind === 'reimbursement' && m['2300']) { payAcc = m['2300']; payLabel = 'A rembourser a l employe'; }
  else if (kind === 'investment' && m['3100']) { payAcc = m['3100']; payLabel = 'Apport au capital'; }
  else if (kind === 'shares_payment' && m['3100']) { payAcc = m['3100']; payLabel = 'Reglement en actions/parts (capital-actions)'; }
  if (!payAcc || !m['5300']) return 'no-accounts';

  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [];
  for (const it of (items || [])) {
    const amt = Number(it.amount) || 0;
    if (amt <= 0) continue;
    const acc = m[it.account_code] || m['5300'];
    lines.push({ account_id: acc, debit: amt, credit: 0, description: it.description || 'Charge' });
  }
  const pst = Number(txn.pst_amount) || 0;
  if (pst > 0) lines.push({ account_id: m['5300'], debit: pst, credit: 0, description: 'Taxe provinciale non recuperable (PST/RST)' });
  const gst = Number(txn.gst_amount) || 0;
  if (gst > 0 && m['1200']) lines.push({ account_id: m['1200'], debit: gst, credit: 0, description: 'TPS/TVH a recuperer (CTI)' });
  const qst = Number(txn.qst_amount) || 0;
  if (qst > 0 && m['1210']) lines.push({ account_id: m['1210'], debit: qst, credit: 0, description: 'TVQ a recuperer (RTI)' });
  const total = Number(txn.total) || 0;
  lines.push({ account_id: payAcc, debit: 0, credit: total, description: payLabel });

  const entryId = await createEntry(tenant, {
    entry_date: txn.txn_date || new Date().toISOString().slice(0, 10),
    description: `Achat — ${txn.vendor_name || txn.transaction_number || ''}${fxNote(txn)}`,
    reference: txn.transaction_number || undefined,
    journal_code: 'ACH', source_type: 'transaction', source_id: txn.id, lines: applyFx(lines, txn.fx_rate),
  });
  await supabase.from('commerce_transactions').update({ gl_entry_id: entryId, status: txn.status === 'draft' ? 'posted' : txn.status }).eq('id', txn.id);
  return 'created';
}

/**
 * Paiement d'un achat à crédit : solde le compte fournisseurs.
 *   DR 2000 Fournisseurs   = total
 *   CR 1000 Banque         = total
 * Idempotent par (source_type='transaction_payment', source_id).
 */
export async function postTransactionPayment(
  tenant: string, txn: any, accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (await entryExists(tenant, 'transaction_payment', txn.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['2000'] || !m['1000']) return 'no-accounts';
  const total = Number(txn.total) || 0;
  if (total <= 0) return 'skipped';
  await createEntry(tenant, {
    entry_date: new Date().toISOString().slice(0, 10),
    description: `Paiement fournisseur — ${txn.vendor_name || txn.transaction_number || ''}`,
    reference: txn.transaction_number || undefined,
    journal_code: 'BNK', source_type: 'transaction_payment', source_id: txn.id,
    lines: [
      { account_id: m['2000'], debit: total, credit: 0, description: 'Fournisseurs a payer' },
      { account_id: m['1000'], debit: 0, credit: total, description: 'Banque' },
    ],
  });
  return 'created';
}

/**
 * Vente d'une facture (DR 1100 Clients / CR 4000 Ventes + taxes à payer). Idempotent ('invoice').
 * Même logique que le bouton « Comptabiliser » du module Facture, en lib (réutilisable par la synchro).
 */
export async function postInvoiceSale(tenant: string, inv: any, accMap?: Record<string, string>): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (inv.gl_entry_id) return 'skipped';
  if (await entryExists(tenant, 'invoice', inv.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['1100'] || !m['4000']) return 'no-accounts';
  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: m['1100'], debit: Number(inv.total) || 0, credit: 0, description: 'Clients' },
    { account_id: m['4000'], debit: 0, credit: Number(inv.subtotal) || 0, description: 'Ventes et services' },
  ];
  const taxFed = (Number(inv.gst_amount) || 0) + (Number(inv.pst_amount) || 0);
  if (taxFed > 0 && m['2100']) lines.push({ account_id: m['2100'], debit: 0, credit: taxFed, description: 'TPS/TVH/PST a payer' });
  if ((Number(inv.qst_amount) || 0) > 0 && m['2110']) lines.push({ account_id: m['2110'], debit: 0, credit: Number(inv.qst_amount), description: 'TVQ a payer' });
  const entryId = await createEntry(tenant, { entry_date: inv.issue_date || new Date().toISOString().slice(0, 10), description: `Vente — facture ${inv.invoice_number}`, reference: inv.invoice_number, journal_code: 'VEN', source_type: 'invoice', source_id: inv.id, lines });
  await supabase.from('commerce_invoices').update({ gl_entry_id: entryId }).eq('id', inv.id);
  return 'created';
}

/** Encaissement d'une facture payée (DR 1000 Banque / CR 1100 Clients). Idempotent ('invoice_payment'). */
export async function postInvoicePayment(tenant: string, inv: any, accMap?: Record<string, string>): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (await entryExists(tenant, 'invoice_payment', inv.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['1000'] || !m['1100']) return 'no-accounts';
  const total = Number(inv.total) || 0; if (total <= 0) return 'skipped';
  await createEntry(tenant, {
    entry_date: inv.paid_date || new Date().toISOString().slice(0, 10), description: `Encaissement — facture ${inv.invoice_number}`,
    reference: inv.invoice_number, journal_code: 'BNK', source_type: 'invoice_payment', source_id: inv.id,
    lines: [{ account_id: m['1000'], debit: total, credit: 0, description: 'Banque' }, { account_id: m['1100'], debit: 0, credit: total, description: 'Clients' }],
  });
  return 'created';
}

/**
 * Vente/revenu saisi comme TRANSACTION (et non facture). DR 1000 Banque (comptant) | 1100 Clients
 * (à recevoir) ; CR 4000 Ventes + taxes PERÇUES (2100/2110). Idempotent ('transaction'). Met à jour
 * gl_entry_id + statut 'posted'. Pendant des achats `postTransactionPurchase`, mais côté revenu.
 */
export async function postTransactionRevenue(
  tenant: string, txn: any, items: any[], accMap?: Record<string, string>,
): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (txn.gl_entry_id) return 'skipped';
  if (await entryExists(tenant, 'transaction', txn.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  // Encaissé comptant -> compte de trésorerie ASSIGNÉ (banque), sinon 1000 ; à recevoir -> Clients (AR).
  const treasury = txn.payment_method === 'on_account' ? null : await treasuryGlAccountId(txn);
  const recvAcc = txn.payment_method === 'on_account' ? m['1100'] : (treasury || m['1000']);
  if (!recvAcc || !m['4000']) return 'no-accounts';
  const total = Number(txn.total) || 0;
  if (total <= 0) return 'skipped';
  // AVANCE D'INVESTISSEUR : ce N'EST PAS un revenu → DR Banque / CR 2400 (dette à rembourser), sans taxes.
  if (txn.settlement_kind === 'investor_advance' && m['2400']) {
    const entryId = await createEntry(tenant, {
      entry_date: txn.txn_date || new Date().toISOString().slice(0, 10),
      description: `Avance investisseur — ${txn.vendor_name || txn.transaction_number || ''}`,
      reference: txn.transaction_number || undefined, journal_code: 'OD', source_type: 'transaction', source_id: txn.id,
      lines: [{ account_id: recvAcc, debit: total, credit: 0, description: 'Banque' }, { account_id: m['2400'], debit: 0, credit: total, description: 'Avance/dû à l investisseur (a rembourser)' }],
    });
    await supabase.from('commerce_transactions').update({ gl_entry_id: entryId, status: txn.status === 'draft' ? 'posted' : txn.status }).eq('id', txn.id);
    return 'created';
  }
  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: recvAcc, debit: total, credit: 0, description: txn.payment_method === 'on_account' ? 'Clients' : 'Banque' },
    { account_id: m['4000'], debit: 0, credit: Number(txn.subtotal) || 0, description: 'Ventes et services' },
  ];
  const taxFed = (Number(txn.gst_amount) || 0) + (Number(txn.pst_amount) || 0);
  if (taxFed > 0 && m['2100']) lines.push({ account_id: m['2100'], debit: 0, credit: taxFed, description: 'TPS/TVH/PST a payer' });
  if ((Number(txn.qst_amount) || 0) > 0 && m['2110']) lines.push({ account_id: m['2110'], debit: 0, credit: Number(txn.qst_amount), description: 'TVQ a payer' });
  const entryId = await createEntry(tenant, {
    entry_date: txn.txn_date || new Date().toISOString().slice(0, 10),
    description: `Revenu — ${txn.vendor_name || txn.transaction_number || ''}${fxNote(txn)}`,
    reference: txn.transaction_number || undefined, journal_code: 'VEN', source_type: 'transaction', source_id: txn.id, lines: applyFx(lines, txn.fx_rate),
  });
  await supabase.from('commerce_transactions').update({ gl_entry_id: entryId, status: txn.status === 'draft' ? 'posted' : txn.status }).eq('id', txn.id);
  return 'created';
}

/** Comptabilise MAINTENANT une transaction et renvoie un statut CLAIR (plus de silence). Auto-initialise
 *  le plan comptable. Utilisé par le bouton Enregistrer pour dire à l'utilisateur si ça a remonté ou non. */
export async function postTransactionNow(tenant: string, transactionId: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const { data: txn } = await supabase.from('commerce_transactions').select('*').eq('tenant_id', tenant).eq('id', transactionId).maybeSingle();
    if (!txn) return { ok: false, reason: 'Transaction introuvable.' };
    if (txn.needs_review) return { ok: false, reason: 'À vérifier avant comptabilisation (transaction pré-remplie par l’IA).' };
    if (txn.gl_entry_id) return { ok: true };
    const m = await ensureAccountMap(tenant);
    if (!m['1000'] || !m['4000']) return { ok: false, reason: 'Plan comptable non initialisé — exécutez la migration 085 dans Supabase (tables gl_* + seed), puis réessayez.' };
    const { data: its } = await supabase.from('commerce_transaction_items').select('*').eq('transaction_id', txn.id);
    const isRev = (txn.txn_type || 'expense') === 'revenue';
    const r = isRev ? await postTransactionRevenue(tenant, txn, its || [], m) : await postTransactionPurchase(tenant, txn, its || [], m);
    if (r === 'no-accounts') return { ok: false, reason: 'Plan comptable non initialisé (comptes 1000/4000 manquants).' };
    return { ok: true };
  } catch (e: any) { return { ok: false, reason: e?.message || 'Erreur de comptabilisation.' }; }
}

// ── POSTAGE ÉVÉNEMENTIEL (comptabilité d'EXERCICE / accrual) ─────────────────────────────────────
// Déclenché automatiquement au changement de statut (depuis setInvoiceStatus / setTransactionStatus),
// pour que « tout se centralise vers Comptabilité » sans clic. EXERCICE : le revenu est constaté à
// l'ÉMISSION de la facture (DR Clients / CR Ventes), l'encaissement solde le compte Clients ; la charge
// est constatée à la COMPTABILISATION de l'achat, le paiement solde le compte Fournisseurs.
// BEST-EFFORT & idempotent : si le plan comptable n'est pas prêt, on n'empêche JAMAIS le changement de
// statut (la « Synchroniser tout » reste le filet de rattrapage). Tout est avalé silencieusement.

/** Auto-poste une facture selon son nouveau statut (exercice). 'sent'/'paid' -> vente ; 'paid' -> encaissement. */
export async function autoPostInvoiceStatus(tenant: string, invoiceId: string, status: string): Promise<void> {
  try {
    if (status !== 'sent' && status !== 'paid') return; // brouillon/annulée : rien (contre-passation = manuelle)
    const { data: inv } = await supabase.from('commerce_invoices').select('*').eq('tenant_id', tenant).eq('id', invoiceId).maybeSingle();
    if (!inv) return;
    const m = await accountMap(tenant);
    if (!m['1100'] || !m['4000']) return; // plan comptable absent -> filet = bouton Synchroniser
    await postInvoiceSale(tenant, inv, m);                       // constatation du revenu (idempotent)
    if (status === 'paid') await postInvoicePayment(tenant, inv, m); // encaissement (idempotent)
  } catch { /* best-effort : ne bloque jamais le changement de statut */ }
}

/** Auto-poste une transaction selon son statut (exercice). REVENU -> vente ; DÉPENSE -> achat ;
 *  'paid' à crédit (dépense) -> paiement fournisseur. Idempotent, best-effort. */
export async function autoPostTransactionStatus(tenant: string, transactionId: string, status: string): Promise<void> {
  try {
    if (status !== 'posted' && status !== 'paid') return;
    const { data: txn } = await supabase.from('commerce_transactions').select('*').eq('tenant_id', tenant).eq('id', transactionId).maybeSingle();
    if (!txn || txn.needs_review) return; // « à vérifier » (pré-rempli IA) -> pas de postage avant confirmation
    const isRev = (txn.txn_type || 'expense') === 'revenue';
    const m = await ensureAccountMap(tenant); // auto-initialise le plan comptable si absent
    if (!m['1000'] || !m['4000']) return; // migration 085 absente -> filet = bouton Synchroniser
    if (!txn.gl_entry_id) {
      const { data: its } = await supabase.from('commerce_transaction_items').select('*').eq('transaction_id', txn.id);
      if (isRev) await postTransactionRevenue(tenant, txn, its || [], m);   // constatation du revenu
      else await postTransactionPurchase(tenant, txn, its || [], m);        // constatation de la charge
    }
    if (status === 'paid' && !isRev && txn.payment_method === 'on_account') await postTransactionPayment(tenant, txn, m);
  } catch { /* best-effort */ }
}

/**
 * SYNCHRONISATION GLOBALE vers le grand livre — tout remonte vers Comptabilité en un clic.
 * Poste les écritures MANQUANTES (idempotent) pour : paie (approuvées/payées), ventes de factures
 * (transmises/payées) + encaissements (payées), achats de transactions (comptabilisés/payés) +
 * paiements fournisseurs (payés à crédit). Politique INCHANGÉE (poste ce que les boutons postent déjà).
 */
export async function syncAllToLedger(tenant: string): Promise<{ payroll: number; sales: number; salePayments: number; purchases: number; purchasePayments: number; expenses: number }> {
  const m = await ensureAccountMap(tenant); // initialise le plan comptable si absent
  if (!m['5000'] || !m['2300']) throw new Error('Plan comptable non initialisé — exécutez la migration 085 dans Supabase, puis réessayez.');
  const pay = await syncPayrollEntries(tenant);
  let sales = 0, salePayments = 0, purchases = 0, purchasePayments = 0, expenses = 0;

  // Dépenses des feuilles de temps APPROUVÉES/PAYÉES -> grand livre (en plus du rollup projet).
  try {
    const { data: sheets } = await supabase.from('timesheets').select('id').eq('tenant_id', tenant).in('status', ['approved', 'paid']);
    const ids = (sheets || []).map((s: any) => s.id);
    if (ids.length) {
      const { data: exps } = await supabase.from('timesheet_expenses').select('*').in('timesheet_id', ids);
      for (const e of (exps || [])) if ((await postTimesheetExpense(tenant, e, m)) === 'created') expenses++;
    }
  } catch { /* table timesheet_expenses absente -> ignore */ }

  const { data: invs } = await supabase.from('commerce_invoices').select('*').eq('tenant_id', tenant).in('status', ['sent', 'paid']);
  for (const inv of (invs || [])) {
    if ((await postInvoiceSale(tenant, inv, m)) === 'created') sales++;
    if (inv.status === 'paid' && (await postInvoicePayment(tenant, inv, m)) === 'created') salePayments++;
  }

  // Transactions : on poste TOUT ce qui n'est pas annulé (brouillons inclus) — la saisie d'une
  // transaction VAUT comptabilisation (la « nouvelle écriture » manuelle ne sert qu'aux corrections).
  const { data: txns } = await supabase.from('commerce_transactions').select('*').eq('tenant_id', tenant).neq('status', 'cancelled');
  for (const txn of (txns || [])) {
    if (txn.needs_review) continue; // « à vérifier » (pré-rempli IA) -> pas comptabilisé par la synchro
    const isRev = (txn.txn_type || 'expense') === 'revenue';
    if (!txn.gl_entry_id) {
      const { data: its } = await supabase.from('commerce_transaction_items').select('*').eq('transaction_id', txn.id);
      const r = isRev ? await postTransactionRevenue(tenant, txn, its || [], m) : await postTransactionPurchase(tenant, txn, its || [], m);
      if (r === 'created') { if (isRev) sales++; else purchases++; }
    }
    if (txn.status === 'paid' && !isRev && txn.payment_method === 'on_account' && (await postTransactionPayment(tenant, txn, m)) === 'created') purchasePayments++;
  }
  return { payroll: pay.created, sales, salePayments, purchases, purchasePayments, expenses };
}

/** Génère les écritures de paie manquantes pour toutes les feuilles approuvées/payées. */
export async function syncPayrollEntries(tenant: string): Promise<{ created: number; skipped: number; empty: number }> {
  const { data, error } = await supabase.from('timesheets').select('*')
    .eq('tenant_id', tenant).in('status', ['approved', 'paid']);
  if (error) throw error;
  const m = await accountMap(tenant);
  if (!m['5000'] || !m['2300']) throw new Error('Plan comptable non initialisé (exécutez la migration 085 puis initialisez).');

  let created = 0, skipped = 0, empty = 0;
  for (const ts of (data || [])) {
    const r = await postTimesheetPayroll(tenant, ts, m);
    if (r === 'created') created++;
    else if (r === 'skipped') skipped++;
    else empty++;
  }
  return { created, skipped, empty };
}
