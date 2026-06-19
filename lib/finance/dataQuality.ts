// Détecteur de COMPLÉTUDE comptable — évalue si une période a assez de données pour des ratios FIABLES.
// Le moteur de calcul est correct ; ce module ne touche PAS au calcul : il ajoute une couche de
// détection + présentation (honnêteté quand la base est incomplète, ex. démo sans côté coûts). Fonction PURE.

export type DataQuality = {
  hasCOGS: boolean;
  hasPayroll: boolean;
  hasOpex: boolean;
  expenseRatio: number;   // charges totales / revenus
  isReliable: boolean;    // les marges/EBITDA sont-ils représentatifs ?
  missing: string[];      // ce qui manque (pour la checklist)
  warning: string | null; // message de bannière (null si fiable)
};

export function assessDataQuality(
  m: { revenue: number; cogs: number; payroll: number; opex: number; depreciation: number },
  lang: 'fr' | 'en' = 'fr',
): DataQuality {
  const EN = lang === 'en';
  const hasCOGS = (m.cogs || 0) > 0;
  const hasPayroll = (m.payroll || 0) > 0;
  const hasOpex = (m.opex || 0) > 0;
  const totalExpenses = (m.cogs || 0) + (m.payroll || 0) + (m.opex || 0) + (m.depreciation || 0);
  const expenseRatio = m.revenue > 0 ? totalExpenses / m.revenue : 0;

  const missing: string[] = [];
  // On ne signale les manques que s'il y a un CA (sinon « rien saisi » est l'état normal de départ).
  if (m.revenue > 0) {
    if (!hasPayroll) missing.push(EN ? 'No payroll entries booked' : 'Aucune écriture de paie comptabilisée');
    if (!hasCOGS) missing.push(EN ? 'No cost of goods (COGS) booked' : 'Aucun coût de revient (COGS) comptabilisé');
    if (expenseRatio < 0.05) missing.push(EN ? 'Expenses near zero (< 5% of revenue)' : 'Charges quasi nulles (< 5 % du CA)');
  }

  // Fiable = il y a de la paie ET des charges ≥ 5 % du CA (une vraie entreprise a des charges >> 5 %).
  const isReliable = m.revenue <= 0 ? true : (hasPayroll && expenseRatio >= 0.05);

  return {
    hasCOGS, hasPayroll, hasOpex, expenseRatio, isReliable, missing,
    warning: isReliable ? null : (EN
      ? 'Incomplete accounting data: the margins and EBITDA shown are not representative until expenses (payroll, cost of goods) are booked.'
      : "Données comptables incomplètes : les marges et l'EBITDA affichés ne sont pas représentatifs tant que les charges (paie, coûts de revient) ne sont pas comptabilisées."),
  };
}
