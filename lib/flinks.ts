// Agrégateur bancaire FLINKS (Canada) — client SERVEUR, env-gated. Récupère les opérations d'une
// connexion (LoginId obtenu via le widget Connect) et les normalise pour bank_statement_lines.
// Aucune donnée d'identifiant bancaire stockée : seul le LoginId (jeton de l'agrégateur) transite.
import { createHash } from 'crypto';

const INSTANCE = process.env.FLINKS_INSTANCE || '';
const CUSTOMER = process.env.FLINKS_CUSTOMER_ID || '';
const API_KEY = process.env.FLINKS_API_KEY || '';

export function flinksConfigured(): boolean { return !!(INSTANCE && CUSTOMER); }

/** URL du widget Connect (iframe) à présenter à l'utilisateur pour authentifier sa banque. */
export function flinksConnectUrl(): string {
  if (!flinksConfigured()) return '';
  return `https://${INSTANCE}-iframe.private.fin.ag/v2/?customerId=${CUSTOMER}`;
}

export type FlinksLine = { external_id: string; stmt_date: string; description: string; amount: number };

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const isoDate = (s: any) => { const v = String(s || ''); const m = v.match(/\d{4}-\d{2}-\d{2}/); return m ? m[0] : (v ? new Date(v).toISOString().slice(0, 10) : ''); };

/** Appelle Flinks GetAccountsDetail pour un LoginId et normalise toutes les opérations. */
export async function flinksGetTransactions(loginId: string): Promise<{ institution?: string; accountMask?: string; lines: FlinksLine[] }> {
  if (!flinksConfigured()) throw new Error('Flinks non configuré (FLINKS_INSTANCE / FLINKS_CUSTOMER_ID).');
  const url = `https://${INSTANCE}-api.private.fin.ag/v3/${CUSTOMER}/BankingServices/GetAccountsDetail`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}) },
    body: JSON.stringify({ LoginId: loginId, MostRecentCached: true, WithAccountIdentity: false }),
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Flinks ${resp.status}: ${e.slice(0, 200)}`); }
  const j: any = await resp.json();
  const accounts: any[] = j.Accounts || j.accounts || [];
  const lines: FlinksLine[] = [];
  let institution = j.Institution || j.institution; let accountMask: string | undefined;
  for (const acc of accounts) {
    accountMask = accountMask || acc.AccountNumber || acc.accountNumber || (acc.Title || '').slice(-4);
    const txns: any[] = acc.Transactions || acc.transactions || [];
    for (const t of txns) {
      const debit = Number(t.Debit ?? t.debit ?? 0) || 0;
      const credit = Number(t.Credit ?? t.credit ?? 0) || 0;
      // Montant signé : crédit (entrée) + / débit (sortie) − ; certains flux donnent un seul champ Amount.
      let amount = credit - debit;
      if (!debit && !credit && (t.Amount ?? t.amount) != null) amount = Number(t.Amount ?? t.amount) || 0;
      const stmt_date = isoDate(t.Date || t.date || t.PostedDate);
      const description = String(t.Description || t.description || t.Title || '').slice(0, 300);
      // Identifiant externe stable pour dédoublonner : id Flinks si présent, sinon empreinte.
      const ext = t.Id || t.id || t.TransactionId || createHash('sha1').update(`${loginId}|${stmt_date}|${description}|${r2(amount)}`).digest('hex').slice(0, 24);
      if (!stmt_date && !amount) continue;
      lines.push({ external_id: String(ext), stmt_date, description, amount: r2(amount) });
    }
  }
  return { institution, accountMask, lines };
}
