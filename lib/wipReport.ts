// Rapport WIP (travaux en cours) — vue portefeuille des projets ACTIFS : contrat (BC), coût RÉEL chargé
// à date, facturé à date, % d'avancement (coûts), marge projetée et sur/sous-facturation. Best practice
// CFO (savoir où en sont les chantiers actifs MAINTENANT, pas seulement à la clôture).
import { supabase } from '@/lib/supabase';
import { computeProjectActuals } from '@/lib/projectActuals';

export type WipRow = {
  id: string; number: string; title: string;
  contract: number;       // montant facturable (BC / po_amount)
  costToDate: number;     // coût RÉEL chargé à date (projectActuals.costReal)
  billedToDate: number;   // facturé à date (factures sent/paid liées au projet)
  pctComplete: number;    // avancement par les coûts (coût ÷ contrat)
  projectedMargin: number;// contrat − coût à date
  overUnder: number;      // facturé − coût (>0 = sur-facturé / cash positif ; <0 = sous-facturé)
};

export type WipTotals = { contract: number; costToDate: number; billedToDate: number; projectedMargin: number; overUnder: number; count: number };

export async function getWipReport(tenant: string): Promise<{ rows: WipRow[]; totals: WipTotals }> {
  const empty = { rows: [], totals: { contract: 0, costToDate: 0, billedToDate: 0, projectedMargin: 0, overUnder: 0, count: 0 } };
  const { data: projs } = await supabase.from('projects').select('id, project_number, title, po_amount, status').eq('tenant_id', tenant).eq('status', 'en-cours');
  const active = (projs as any[]) || [];
  if (!active.length) return empty;
  const ids = active.map(p => p.id);

  // Facturé à date par projet (factures envoyées/payées liées au projet — migration 212).
  const billed: Record<string, number> = {};
  try {
    const { data: invs } = await supabase.from('commerce_invoices').select('project_id, subtotal, status').eq('tenant_id', tenant).in('project_id', ids).in('status', ['sent', 'paid']);
    for (const iv of ((invs as any[]) || [])) { if (iv.project_id) billed[iv.project_id] = (billed[iv.project_id] || 0) + (Number(iv.subtotal) || 0); }
  } catch { /* lien facture↔projet absent */ }

  const rows: WipRow[] = [];
  for (const p of active.slice(0, 60)) { // borne de sécurité
    const a = await computeProjectActuals(tenant, p.id);
    const contract = Number(p.po_amount) || 0;
    const costToDate = Number((a as any).costReal || a.total || 0);
    const billedToDate = billed[p.id] || 0;
    rows.push({
      id: p.id, number: p.project_number || '', title: p.title || '',
      contract, costToDate, billedToDate,
      pctComplete: contract > 0 ? Math.min(100, Math.round((costToDate / contract) * 100)) : 0,
      projectedMargin: Math.round((contract - costToDate) * 100) / 100,
      overUnder: Math.round((billedToDate - costToDate) * 100) / 100,
    });
  }
  rows.sort((x, y) => y.contract - x.contract);
  const totals = rows.reduce((t, r) => ({
    contract: t.contract + r.contract, costToDate: t.costToDate + r.costToDate, billedToDate: t.billedToDate + r.billedToDate,
    projectedMargin: t.projectedMargin + r.projectedMargin, overUnder: t.overUnder + r.overUnder, count: t.count + 1,
  }), { contract: 0, costToDate: 0, billedToDate: 0, projectedMargin: 0, overUnder: 0, count: 0 });
  return { rows, totals };
}
