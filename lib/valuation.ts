// Valorisation d'entreprise + table de capitalisation + alerte de crise (Altman Z) — #33.
// Fonctions PURES (aucune dépendance réseau). Le but : présenter une vente d'actions / une entrée
// d'investisseur de façon crédible, et alerter AVANT la détresse financière.

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ── Bilan agrégé (depuis la balance de vérification : plan comptable + soldes) ──
export type BalanceSheet = {
  totalAssets: number; currentAssets: number; fixedAssets: number;
  totalLiabilities: number; currentLiabilities: number;
  equity: number; retainedEarnings: number; cash: number;
};

// Agrège un bilan depuis les comptes + soldes (net = débit − crédit). Conventions :
// actif/charge normal au débit ; passif/capitaux/produit normal au crédit. Actif courant = 1000-1499.
export function aggregateBalanceSheet(
  accounts: { id: string; code?: string; type?: string; name?: string }[],
  balances: Record<string, { debit: number; credit: number }>,
): BalanceSheet {
  let totalAssets = 0, currentAssets = 0, fixedAssets = 0, totalLiabilities = 0, currentLiabilities = 0, equity = 0, retainedEarnings = 0, cash = 0;
  for (const a of accounts || []) {
    const b = balances[a.id]; if (!b) continue;
    const code = String(a.code || ''); const codeNum = parseInt(code, 10) || 0;
    const debitNet = n(b.debit) - n(b.credit);
    const creditNet = n(b.credit) - n(b.debit);
    if (a.type === 'asset') {
      totalAssets += debitNet;
      if (codeNum < 1500) currentAssets += debitNet; else fixedAssets += debitNet;
      if (codeNum < 1100 || /banque|caisse|encaisse|bank|cash/i.test(a.name || '')) cash += debitNet;
    } else if (a.type === 'liability') {
      totalLiabilities += creditNet;
      if (codeNum < 2400) currentLiabilities += creditNet;
    } else if (a.type === 'equity') {
      equity += creditNet;
      if (code === '3200' || code === '3000') retainedEarnings += creditNet;
    }
  }
  return { totalAssets, currentAssets, fixedAssets, totalLiabilities, currentLiabilities, equity, retainedEarnings, cash };
}

// ── Valorisation par multiple d'EBITDA ──
export type Valuation = {
  ebitda: number; multiple: number; enterpriseValue: number; netDebt: number;
  equityValue: number; sharesOutstanding: number; pricePerShare: number;
};
// EV = EBITDA × multiple ; valeur des capitaux propres = EV − dette nette ; prix/action = / actions.
// Dette nette par défaut = −trésorerie (pas de compte d'emprunt dédié au plan par défaut) → ajustable.
export function computeValuation(ebitda: number, multiple: number, sharesOutstanding: number, netDebt = 0): Valuation {
  const ev = n(ebitda) * n(multiple);
  const equityValue = ev - n(netDebt);
  const shares = n(sharesOutstanding);
  return { ebitda: n(ebitda), multiple: n(multiple), enterpriseValue: ev, netDebt: n(netDebt), equityValue, sharesOutstanding: shares, pricePerShare: shares > 0 ? equityValue / shares : 0 };
}

// ── Simulation d'une ronde de financement (dilution) ──
export type DilutionRow = { id: string; name?: string; shares: number; pctBefore: number; pctAfter: number };
export type RoundSim = {
  preMoney: number; investment: number; postMoney: number; pricePerShare: number;
  newShares: number; sharesBefore: number; sharesAfter: number; newInvestorPct: number;
  rows: DilutionRow[];
};
// preMoney : valeur avant la ronde ; investment : montant injecté. Prix = preMoney / actions existantes.
export function simulateRound(preMoney: number, investment: number, holdings: { id: string; name?: string; shares: number }[]): RoundSim {
  const sharesBefore = (holdings || []).reduce((s, h) => s + n(h.shares), 0);
  const pre = n(preMoney); const inv = n(investment);
  const pricePerShare = sharesBefore > 0 ? pre / sharesBefore : 0;
  const newShares = pricePerShare > 0 ? inv / pricePerShare : 0;
  const sharesAfter = sharesBefore + newShares;
  const postMoney = pre + inv;
  const rows: DilutionRow[] = (holdings || []).map(h => ({
    id: h.id, name: h.name, shares: n(h.shares),
    pctBefore: sharesBefore > 0 ? (n(h.shares) / sharesBefore) * 100 : 0,
    pctAfter: sharesAfter > 0 ? (n(h.shares) / sharesAfter) * 100 : 0,
  }));
  return { preMoney: pre, investment: inv, postMoney, pricePerShare, newShares, sharesBefore, sharesAfter, newInvestorPct: sharesAfter > 0 ? (newShares / sharesAfter) * 100 : 0, rows };
}

// ── Alerte de crise : Altman Z'' (PME privée, non manufacturière) ──
export type AltmanResult = {
  z: number; zone: 'safe' | 'grey' | 'distress'; label: string;
  x1: number; x2: number; x3: number; x4: number;
};
// Z'' = 6.56·X1 + 3.26·X2 + 6.72·X3 + 1.05·X4. Zones : >2.6 sain ; 1.1–2.6 zone grise ; <1.1 détresse.
// X1 fonds de roulement/actif ; X2 BNR/actif ; X3 EBIT/actif ; X4 capitaux propres/passif.
export function altmanZScore(bs: BalanceSheet, ebit: number): AltmanResult {
  const ta = bs.totalAssets || 0; const tl = bs.totalLiabilities || 0;
  const x1 = ta !== 0 ? (bs.currentAssets - bs.currentLiabilities) / ta : 0;
  const x2 = ta !== 0 ? bs.retainedEarnings / ta : 0;
  const x3 = ta !== 0 ? n(ebit) / ta : 0;
  const x4 = tl !== 0 ? bs.equity / tl : (bs.equity > 0 ? 4 : 0); // pas de dette → très solide
  const z = 6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4;
  const zone: AltmanResult['zone'] = z > 2.6 ? 'safe' : z >= 1.1 ? 'grey' : 'distress';
  const label = zone === 'safe' ? 'Sain' : zone === 'grey' ? 'Zone grise — surveiller' : 'Détresse — agir';
  return { z, zone, label, x1, x2, x3, x4 };
}
