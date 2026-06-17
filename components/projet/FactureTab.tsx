'use client';

/**
 * FactureTab — onglet Facture du détail projet.
 *
 * Deux modes selon le type de projet :
 *   - forfaitaire : base = total soumission + extras manuels
 *   - budgétaire  : base = feuille de temps (coût réel) + extras manuels
 *
 * Flux : Brouillon → Approuvé (n° unique généré) → PDF exporté
 * Le numéro de facture est auto-généré à l'approbation si non saisi.
 */

import React, { useEffect, useState } from 'react';
import { BadgeCheck, Download, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProjectActuals } from '@/lib/projectActuals';

const money = (n: number) =>
  `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

const TPS = 0.05;
const TVQ = 0.09975;

interface Extra { id: string; desc: string; amount: number }
interface FactureData {
  invoice_number: string;
  invoice_date: string;
  mode: 'soumission' | 'temps';
  extras: Extra[];
  surcharge_km_billable: boolean;  // inclure la surcharge carburant km dans la facture
  expenses_billable: boolean;      // inclure les dépenses refacturables des feuilles de temps
  materiel_billable: boolean;      // inclure le matériel consommé (inventaire) au PRIX VENDANT
  tps: boolean;
  tvq: boolean;
  notes: string;
  approved: boolean;
  approved_at: string | null;
  commerce_invoice_id?: string | null; // lien vers la facture centrale (Facturation) créée à l'approbation
}

const defaultFacture = (projectType?: string): FactureData => ({
  invoice_number: '',
  invoice_date: new Date().toISOString().slice(0, 10),
  mode: projectType === 'forfaitaire' ? 'soumission' : 'temps',
  extras: [],
  surcharge_km_billable: true,
  expenses_billable: true,
  materiel_billable: true,
  tps: true,
  tvq: true,
  notes: '',
  approved: false,
  approved_at: null,
});

function genInvoiceNumber(tenant: string, projectNumber: string): string {
  const yy = new Date().getFullYear().toString().slice(2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `FAC-${yy}${mm}-${(tenant || 'X').slice(0, 3).toUpperCase()}-${rand}`;
}

export function FactureTab({
  tenant, projectId, project, liveActuals,
}: {
  tenant: string;
  projectId: string;
  project: any;
  liveActuals?: ProjectActuals | null;
}) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [facture, setFacture] = useState<FactureData>(() => defaultFacture(project?.project_type));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Charger la facture existante
  useEffect(() => {
    if (project?.facture) {
      setFacture(f => ({
        ...defaultFacture(project.project_type),
        ...project.facture,
      }));
    }
  }, [project?.facture, project?.project_type]);

  const set = <K extends keyof FactureData>(k: K, v: FactureData[K]) =>
    setFacture(f => ({ ...f, [k]: v }));

  // ── Surcharge carburant depuis les actuals (feuille de temps) ──────────
  const kmSurchargeFromActuals = Number(project?.actuals?.totalSurcharge || 0);
  const kmSurchargePct = Number(project?.actuals?.surchargePct || 0);
  const kmFuelPrice = Number(project?.actuals?.fuelPrice || 0);
  const surchargeKmAmount = facture.surcharge_km_billable ? kmSurchargeFromActuals : 0;

  // ── Calcul de la base ────────────────────────────────────────────────────
  // Mode « temps » : on privilégie le rollup LIVE des feuilles de temps (coût réel agrégé en direct)
  // et on retombe sur l'actuals stocké du projet si le live n'est pas disponible.
  const hasLive = !!liveActuals && liveActuals.count > 0;
  const baseFromSoumission = Number(project?.estimate?.total || 0);
  const baseFromTemps = hasLive ? Number(liveActuals!.total || 0) : Number(project?.actuals?.total || 0);
  const base = facture.mode === 'soumission' ? baseFromSoumission : baseFromTemps;

  // Dépenses refacturables pointées sur le projet (feuilles de temps) — seulement en mode « temps ».
  const expensesBillableAmount = (facture.mode === 'temps' && hasLive && facture.expenses_billable)
    ? Number(liveActuals!.expensesBillable || 0) : 0;

  // Matériel consommé depuis l'inventaire, facturé au PRIX VENDANT (imputable au projet).
  const materielBillableAmount = (hasLive && facture.materiel_billable) ? Number((liveActuals as any).materielBillable || 0) : 0;
  // Articles consommés SANS prix vendant à jour -> à afficher EN ROUGE (manque à facturer).
  const materielMissing: { name: string; qty: number }[] = (hasLive ? ((liveActuals as any).materielMissingPrice || []) : []);

  const extrasTotal = facture.extras.reduce((s, e) => s + Number(e.amount || 0), 0);
  const subtotal = base + extrasTotal + surchargeKmAmount + expensesBillableAmount + materielBillableAmount;
  const tpsMnt = facture.tps ? subtotal * TPS : 0;
  const tvqMnt = facture.tvq ? subtotal * TVQ : 0;
  const total = subtotal + tpsMnt + tvqMnt;

  const isForfaitaire = project?.project_type === 'forfaitaire';

  // ── Extras ───────────────────────────────────────────────────────────────
  const addExtra = () =>
    set('extras', [...facture.extras, { id: `ex_${Date.now()}`, desc: '', amount: 0 }]);
  const updExtra = (i: number, k: keyof Extra, v: any) =>
    set('extras', facture.extras.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const delExtra = (i: number) =>
    set('extras', facture.extras.filter((_, j) => j !== i));

  // ── Approbation ──────────────────────────────────────────────────────────
  // À l'approbation : (1) n° séquentiel unique généré côté serveur (suit la séquence de la Facturation
  // centrale, plus de N° aléatoire), (2) la facture REMONTE vers « Facturation » au statut « Traité »
  // et le revenu est constaté au grand livre (pont syncProjectInvoice). L'encaissement se fait ensuite
  // dans Facturation (bouton « Payée ») — y compris en associant un paiement bancaire.
  async function approve() {
    setSaving(true); setNotice(null);
    try {
      const { nextInvoiceNumber, syncProjectInvoice, getCompanySettings } = await import('@/lib/invoicing');
      let invoiceNum = facture.invoice_number.trim();
      if (!invoiceNum) {
        try { const s = await getCompanySettings(tenant); invoiceNum = await nextInvoiceNumber(tenant, s?.invoice_prefix || 'F'); }
        catch { invoiceNum = genInvoiceNumber(tenant, project?.project_number || ''); }
      }
      // Lignes de la facture centrale (mêmes montants que l'écran) : base + surcharge + dépenses + extras.
      const taxed = facture.tps || facture.tvq;
      const cat = taxed ? 'standard' as const : 'exempt' as const;
      const mkItem = (description: string, amount: number) => ({ description, quantity: 1, unit_price: amount, subtotal: amount, taxable: taxed, tax_category: cat });
      const items = [
        mkItem(facture.mode === 'soumission' ? 'Soumission approuvée' : 'Feuille de temps (coût réel)', base),
        ...(surchargeKmAmount > 0 ? [mkItem(`Surcharge carburant km (${kmSurchargePct}%)`, surchargeKmAmount)] : []),
        ...(expensesBillableAmount > 0 ? [mkItem(tr('Dépenses refacturables', 'Billable expenses'), expensesBillableAmount)] : []),
        ...(materielBillableAmount > 0 ? [mkItem(tr('Matériel (inventaire)', 'Material (inventory)'), materielBillableAmount)] : []),
        ...facture.extras.filter(e => Number(e.amount) !== 0).map(e => mkItem(e.desc || 'Extra', Number(e.amount) || 0)),
      ].filter(it => it.unit_price !== 0);

      let commerceId = facture.commerce_invoice_id || null;
      if (subtotal > 0) {
        commerceId = await syncProjectInvoice(tenant, {
          id: commerceId, invoice_number: invoiceNum, issue_date: facture.invoice_date,
          province: project?.province || 'QC', client_name: project?.client_name || null,
          notes: facture.notes || null, items, project_id: projectId, project_number: project?.project_number || null,
        });
      }
      const updated: FactureData = { ...facture, invoice_number: invoiceNum, approved: true, approved_at: new Date().toISOString(), commerce_invoice_id: commerceId };
      setFacture(updated);
      await persistFacture(updated);
      setNotice(`✓ ${tr('Facture', 'Invoice')} N° ${invoiceNum} — ${tr('visible dans Facturation (statut « Traité ») et remontée en comptabilité.', 'now in Invoicing (status “Processed”) and posted to accounting.')}`);
    } catch (e: any) {
      setNotice('Erreur : ' + (e?.message || tr('échec de l\'approbation.', 'approval failed.')));
    } finally { setSaving(false); }
  }

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  async function persistFacture(f: FactureData) {
    const { error } = await supabase
      .from('projects').update({ facture: f })
      .eq('id', projectId).eq('tenant_id', tenant);
    if (error) throw error;
  }

  async function save() {
    setSaving(true); setNotice(null);
    try {
      await persistFacture(facture);
      setNotice(tr('Facture enregistrée ✓', 'Invoice saved ✓'));
    } catch (e: any) {
      setNotice('Erreur : ' + (e?.message || 'DB — migration: ALTER TABLE projects ADD COLUMN IF NOT EXISTS facture JSONB;'));
    } finally { setSaving(false); }
  }

  // ── Export PDF ─────────────────────────────────────────────────────────
  async function exportPdf() {
    setExporting(true);
    try {
      const { exportProjectPdf } = await import('@/lib/pdf/projectPdf');
      // Le générateur PDF calcule base = actuals.total + extras. On injecte la base LIVE et on
      // ajoute la surcharge km + les dépenses refacturables comme lignes (extras) pour que le PDF
      // corresponde exactement à l'écran (total identique, détail visible).
      const pdfExtras = [
        ...facture.extras,
        ...(surchargeKmAmount > 0 ? [{ id: 'km_surcharge', desc: `Surcharge carburant km (${kmSurchargePct}%)`, amount: surchargeKmAmount }] : []),
        ...(expensesBillableAmount > 0 ? [{ id: 'ts_expenses', desc: tr('Dépenses refacturables', 'Billable expenses'), amount: expensesBillableAmount }] : []),
        ...(materielBillableAmount > 0 ? [{ id: 'materiel_inv', desc: tr('Matériel (inventaire)', 'Material (inventory)'), amount: materielBillableAmount }] : []),
      ];
      const pdfProject = {
        ...project,
        actuals: facture.mode === 'temps' ? { ...(project?.actuals || {}), total: baseFromTemps } : project?.actuals,
        facture: { ...facture, extras: pdfExtras },
      };
      await exportProjectPdf({ tab: 'facture', project: pdfProject, tenant });
    } finally { setExporting(false); }
  }

  const inputCls = 'w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  return (
    <div className="space-y-4">

      {/* ── Statut d'approbation ─────────────────────────────────────────── */}
      {facture.approved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <BadgeCheck size={20} className="text-emerald-600" />
          <div>
            <div className="font-semibold text-emerald-700 dark:text-emerald-300">
              {tr('Facture traitée', 'Invoice processed')} — N° {facture.invoice_number}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              {tr('Visible dans Facturation (statut « Traité »). Encaissez-la depuis Facturation pour passer à « Payée ».', 'Visible in Invoicing (status “Processed”). Mark it paid from Invoicing.')}
            </div>
            {facture.approved_at && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                {new Date(facture.approved_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Paramètres ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-bold text-gray-900 dark:text-gray-100">Paramètres de facturation</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">N° facture</span>
            <input className={inputCls} value={facture.invoice_number} onChange={e => set('invoice_number', e.target.value)}
              placeholder={tr('Auto-généré à l\'approbation', 'Auto at approval')}
              disabled={facture.approved} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Date facture</span>
            <input type="date" className={inputCls} value={facture.invoice_date} onChange={e => set('invoice_date', e.target.value)}
              disabled={facture.approved} />
          </label>

          {/* Mode de facturation */}
          <div className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
              Base de facturation
              {isForfaitaire && <span className="ml-1 rounded bg-blue-100 px-1 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">Forfaitaire</span>}
            </span>
            <div className="flex overflow-hidden rounded-xl border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => set('mode', 'soumission')}
                disabled={facture.approved}
                className={`flex-1 py-2 text-xs font-semibold transition ${facture.mode === 'soumission' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              >
                Soumission
              </button>
              <button
                onClick={() => set('mode', 'temps')}
                disabled={facture.approved}
                className={`flex-1 py-2 text-xs font-semibold transition ${facture.mode === 'temps' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              >
                Feuille de temps
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 self-end">
            {kmSurchargeFromActuals > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                <input type="checkbox" checked={facture.surcharge_km_billable} onChange={e => set('surcharge_km_billable', e.target.checked)} disabled={facture.approved} />
                Surcharge carburant km ({kmSurchargePct}%)
              </label>
            )}
            {facture.mode === 'temps' && hasLive && Number(liveActuals!.expensesBillable || 0) > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <input type="checkbox" checked={facture.expenses_billable} onChange={e => set('expenses_billable', e.target.checked)} disabled={facture.approved} />
                {tr('Dépenses refacturables', 'Billable expenses')} ({money(Number(liveActuals!.expensesBillable || 0))})
              </label>
            )}
            {hasLive && Number((liveActuals as any).materielBillable || 0) > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                <input type="checkbox" checked={facture.materiel_billable} onChange={e => set('materiel_billable', e.target.checked)} disabled={facture.approved} />
                {tr('Matériel inventaire (prix vendant)', 'Inventory material (selling price)')} ({money(Number((liveActuals as any).materielBillable || 0))})
              </label>
            )}
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={facture.tps} onChange={e => set('tps', e.target.checked)} disabled={facture.approved} />
              TPS (5%)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={facture.tvq} onChange={e => set('tvq', e.target.checked)} disabled={facture.approved} />
              TVQ (9,975%)
            </label>
          </div>
        </div>
      </div>

      {/* ── Aperçu des montants ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Lignes de facturation</h3>
          {!facture.approved && (
            <button onClick={addExtra}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <Plus size={15} /> Extra
            </button>
          )}
        </div>

        {/* Ligne de base */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">
                {facture.mode === 'soumission' ? 'Soumission approuvée' : 'Feuille de temps'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {facture.mode === 'soumission'
                  ? (baseFromSoumission === 0 ? 'Aucune soumission enregistrée' : 'Total de la soumission (onglet Soumission)')
                  : (baseFromTemps === 0 ? 'Aucune feuille de temps enregistrée' : 'Coût réel (onglet Feuille de temps)')}
              </div>
            </div>
            <span className="font-bold tabular-nums text-gray-900 dark:text-white">{money(base)}</span>
          </div>

          {/* Surcharge carburant km */}
          {surchargeKmAmount > 0 && (
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold text-orange-700 dark:text-orange-300">
                  Surcharge carburant km ({kmSurchargePct}%)
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Prix carburant : {kmFuelPrice.toFixed(2)} $/L — date des travaux
                </div>
              </div>
              <span className="font-bold tabular-nums text-orange-700 dark:text-orange-300">{money(surchargeKmAmount)}</span>
            </div>
          )}

          {/* Dépenses refacturables (feuilles de temps) */}
          {expensesBillableAmount > 0 && (
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {tr('Dépenses refacturables', 'Billable expenses')}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  {tr('Pointées sur le projet (feuilles de temps)', 'Logged on the project (timesheets)')}
                </div>
              </div>
              <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{money(expensesBillableAmount)}</span>
            </div>
          )}

          {/* Matériel consommé (inventaire) au PRIX VENDANT — imputable au projet */}
          {materielBillableAmount > 0 && (
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold text-cyan-700 dark:text-cyan-300">{tr('Matériel (inventaire)', 'Material (inventory)')}</div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400">{tr('Consommé sur le projet, facturé au prix vendant', 'Consumed on the project, billed at selling price')}</div>
              </div>
              <span className="font-bold tabular-nums text-cyan-700 dark:text-cyan-300">{money(materielBillableAmount)}</span>
            </div>
          )}

          {/* DRAPEAU ROUGE : matériel consommé sans prix vendant à jour -> manque à facturer */}
          {materielMissing.length > 0 && (
            <div className="my-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              <div className="font-bold">⚠ {tr('Prix vendant manquant ou non à jour', 'Selling price missing or out of date')}</div>
              <div>{tr('Ce matériel consommé n’est PAS facturé (mettez le prix vendant à jour dans l’inventaire) :', 'This consumed material is NOT billed (update the selling price in inventory):')}</div>
              <ul className="mt-0.5 list-disc pl-4">
                {materielMissing.slice(0, 8).map((m, i) => <li key={i}>{m.name} × {m.qty}</li>)}
                {materielMissing.length > 8 && <li>+{materielMissing.length - 8}…</li>}
              </ul>
            </div>
          )}

          {/* Extras */}
          {facture.extras.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 py-2">
              <div className="flex-1">
                {facture.approved
                  ? <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{ex.desc || 'Extra'}</span>
                  : <input className="w-full rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-sm outline-none focus:border-blue-500 dark:border-gray-600"
                      value={ex.desc} onChange={e => updExtra(i, 'desc', e.target.value)}
                      placeholder="Description de l'extra…" />}
              </div>
              <div className="w-32">
                {facture.approved
                  ? <span className="block text-right font-bold tabular-nums text-gray-900 dark:text-white">{money(Number(ex.amount))}</span>
                  : <input type="number" step="0.01"
                      className="w-full rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-right text-sm outline-none focus:border-blue-500 dark:border-gray-600"
                      value={ex.amount} onChange={e => updExtra(i, 'amount', +e.target.value)} />}
              </div>
              {!facture.approved && (
                <button onClick={() => delExtra(i)} className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
              )}
            </div>
          ))}

          {/* Sous-total */}
          {facture.extras.length > 0 && (
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Sous-total</span>
              <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(subtotal)}</span>
            </div>
          )}

          {/* Taxes */}
          {facture.tps && (
            <div className="flex justify-between py-2 text-sm text-gray-600 dark:text-gray-300">
              <span>TPS (5%)</span><span className="tabular-nums">{money(tpsMnt)}</span>
            </div>
          )}
          {facture.tvq && (
            <div className="flex justify-between py-2 text-sm text-gray-600 dark:text-gray-300">
              <span>TVQ (9,975%)</span><span className="tabular-nums">{money(tvqMnt)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between py-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
            <span className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">{money(total)}</span>
          </div>
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Notes / conditions de paiement
          </span>
          <textarea rows={3} className={inputCls} value={facture.notes} onChange={e => set('notes', e.target.value)}
            disabled={facture.approved}
            placeholder="Ex. : Paiement à 30 jours, virement bancaire…" />
        </label>
      </div>

      {notice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          {notice}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {!facture.approved && (
          <>
            <button onClick={save} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-semibold hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-700">
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} Enregistrer brouillon
            </button>
            <button onClick={approve} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              <BadgeCheck size={17} /> Approuver &amp; générer N°
            </button>
          </>
        )}
        <button onClick={exportPdf} disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {exporting ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />} Exporter PDF
        </button>
        {facture.approved && (
          <button onClick={() => { set('approved', false); set('approved_at', null); }}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10">
            Rouvrir en brouillon
          </button>
        )}
      </div>

    </div>
  );
}
