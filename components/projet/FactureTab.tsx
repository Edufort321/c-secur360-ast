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
  tps: boolean;
  tvq: boolean;
  notes: string;
  approved: boolean;
  approved_at: string | null;
}

const defaultFacture = (projectType?: string): FactureData => ({
  invoice_number: '',
  invoice_date: new Date().toISOString().slice(0, 10),
  mode: projectType === 'forfaitaire' ? 'soumission' : 'temps',
  extras: [],
  surcharge_km_billable: true,
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
  tenant, projectId, project,
}: {
  tenant: string;
  projectId: string;
  project: any;
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
  const baseFromSoumission = Number(project?.estimate?.total || 0);
  const baseFromTemps = Number(project?.actuals?.total || 0);
  const base = facture.mode === 'soumission' ? baseFromSoumission : baseFromTemps;

  const extrasTotal = facture.extras.reduce((s, e) => s + Number(e.amount || 0), 0);
  const subtotal = base + extrasTotal + surchargeKmAmount;
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
  async function approve() {
    const invoiceNum = facture.invoice_number.trim() ||
      genInvoiceNumber(tenant, project?.project_number || '');
    const updated: FactureData = {
      ...facture,
      invoice_number: invoiceNum,
      approved: true,
      approved_at: new Date().toISOString(),
    };
    setFacture(updated);
    await persistFacture(updated);
    setNotice(`✓ Facture approuvée — N° ${invoiceNum}`);
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
      await exportProjectPdf({ tab: 'facture', project: { ...project, facture }, tenant });
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
              Facture approuvée — N° {facture.invoice_number}
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
