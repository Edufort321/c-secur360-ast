// PONT C-Secur360 → CERDIA GESTION (gestion.cerdia.ai ; contrat : C:\CERDIA\cerdia-gestion\docs\PONT_APPS.md). Eric 2026-11-17 : « la démo n'aura
// jamais de données financières ; mes apps se branchent à Gestion » — ici, la VRAIE app C-Secur360 envoie ce qui touche la comptabilité de
// Commerce CERDIA inc. :
//   • abonnement : le forfait de chaque client (tenant facturable) — montant, cycle, début, statut → abonnement VENDU dans Gestion ;
//   • commission : les commissions des vendeurs, regroupées par vendeur et par mois (cumul T4A dans Gestion).
// Signé : X-Cerdia-Signature t=<unix>,v1=HMAC-SHA256(PONT_SECRET_CSECUR360, "t.corps"). Idempotent : l'id porte une empreinte du contenu, un
// renvoi identique répond « deja ». Serveur seulement (service_role) ; rien ne part sans le secret.
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const GESTION = (process.env.GESTION_URL || 'https://gestion.cerdia.ai').replace(/\/$/, '');
const empreinte = (o: unknown) => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 12);
const jour = (x: unknown) => (x ? String(x).slice(0, 10) : null);

type Ev = { id: string; type: 'abonnement' | 'commission'; version: 1; societe: 'COMMERCE'; client?: { code: string; nom: string }; emis_le: string; donnees: Record<string, unknown> };

/** Événements à transmettre, construits depuis la base de C-Secur360. */
export async function evenementsPourGestion(): Promise<Ev[]> {
  const evs: Ev[] = [], maintenant = new Date().toISOString();
  const [{ data: subs }, { data: tenants }, { data: coms }, { data: vendors }] = await Promise.all([
    supabaseAdmin.from('tenant_subscriptions').select('tenant_id,status,cycle,start_date,next_billing_date,amount,billable'),
    supabaseAdmin.from('tenants').select('id,company_name'),
    supabaseAdmin.from('vendor_commissions').select('id,vendor_id,tenant_id,amount,status,paid_at,period_start,created_at'),
    supabaseAdmin.from('vendors').select('id,name,email'),
  ]);
  const nomDe = new Map<string, string>(((tenants ?? []) as { id: string; company_name: string | null }[]).map((t) => [t.id, t.company_name || t.id]));
  for (const s of (subs ?? []) as { tenant_id: string; status: string | null; cycle: string | null; start_date: string | null; amount: number | null; billable: boolean | null }[]) {
    const facturable = s.billable !== false && Number(s.amount) > 0;
    if (!facturable) continue;   // client non facturable (démo, interne) : rien à la comptabilité
    const donnees = { plan: 'forfait C-Secur360', debut: jour(s.start_date), montant_periode: facturable ? Number(s.amount) : 0,
      periodicite: /month|mens/i.test(String(s.cycle)) ? 'mois' : /quarter|trim/i.test(String(s.cycle)) ? 'trimestre' : 'an',
      statut: !facturable ? 'termine' : s.status === 'blocked' ? 'pause' : 'actif', devise: 'CAD', taxable: true };
    evs.push({ id: `cs360-abo-${s.tenant_id}-${empreinte(donnees)}`, type: 'abonnement', version: 1, societe: 'COMMERCE',
      client: { code: `cs360:${s.tenant_id}`, nom: nomDe.get(s.tenant_id) || s.tenant_id }, emis_le: maintenant, donnees });
  }
  // commissions : une ligne par vendeur et par mois (Gestion les garde par vendeur_courriel + période)
  const vDe = new Map<string, { name: string; email: string | null }>(((vendors ?? []) as { id: string; name: string; email: string | null }[]).map((v) => [v.id, v]));
  const groupes = new Map<string, { vendeur: string; courriel: string; periode: string; montant: number; factures: string[]; payees: string[]; total: number }>();
  for (const c of (coms ?? []) as { vendor_id: string; tenant_id: string; amount: number; status: string; paid_at: string | null; period_start: string | null; created_at: string }[]) {
    if (c.status === 'cancelled') continue;
    const v = vDe.get(c.vendor_id), courriel = (v?.email || `vendeur-${c.vendor_id}@sans-courriel.invalid`).toLowerCase(), periode = String(c.period_start || c.created_at).slice(0, 7);
    const k = `${courriel}|${periode}`, g = groupes.get(k) ?? { vendeur: v?.name || 'Vendeur', courriel, periode, montant: 0, factures: [], payees: [], total: 0 };
    g.montant = Math.round((g.montant + Number(c.amount)) * 100) / 100; g.factures.push(`cs360:${c.tenant_id}`); g.total++;
    if (c.status === 'paid' && c.paid_at) g.payees.push(String(c.paid_at).slice(0, 10)); groupes.set(k, g);
  }
  for (const g of groupes.values()) {
    const donnees = { vendeur: g.vendeur, vendeur_courriel: g.courriel, periode: g.periode, base_avant_taxes: 0, taux: 0.2, montant: g.montant, factures: g.factures,
      payee_le: g.payees.length === g.total ? g.payees.sort().at(-1) : null };
    evs.push({ id: `cs360-com-${empreinte([g.courriel, g.periode])}-${empreinte(donnees)}`, type: 'commission', version: 1, societe: 'COMMERCE', emis_le: maintenant, donnees });
  }
  return evs;
}

/** Envoie les événements à Gestion par lots de 100. essai = true : Gestion vérifie sans rien écrire. */
export async function envoyerAGestion(essai = false) {
  const secret = process.env.PONT_SECRET_CSECUR360 || '';
  if (secret.length < 32) return { ok: false, erreur: 'PONT_SECRET_CSECUR360 absent' };
  const evs = await evenementsPourGestion(), reponses: unknown[] = [];
  for (let i = 0; i < evs.length; i += 100) {
    const corps = JSON.stringify({ evenements: evs.slice(i, i + 100) }), t = Math.floor(Date.now() / 1000);
    const sig = crypto.createHmac('sha256', secret).update(`${t}.${corps}`).digest('hex');
    const r = await fetch(`${GESTION}/api/pont/csecur360${essai ? '?essai=1' : ''}`, { method: 'POST', body: corps, signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json', 'X-Cerdia-Signature': `t=${t},v1=${sig}` } }).catch(() => null);
    reponses.push(r ? { statut: r.status, ...(await r.json().catch(() => ({}))) } : { statut: 0, erreur: 'réseau' });
  }
  return { ok: true, essai, evenements: evs.length, abonnements: evs.filter((e) => e.type === 'abonnement').length, commissions: evs.filter((e) => e.type === 'commission').length, reponses };
}
