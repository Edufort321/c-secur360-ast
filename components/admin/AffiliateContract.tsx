'use client';

// Apercu + edition du contrat d'affiliation co-vendeur d'un tenant (#51).
// - Champs : vendeur (nom/courriel), % commission, % inflation ; date de creation du tenant (auto, lecture seule).
// - Bloc de clauses legales editable (regenerable depuis les valeurs courantes).
// - Ligne de signature : nom + titre + bouton « Signer » (horodate signed_at, passe status='signe').
// - Bouton Imprimer/PDF (jsPDF, deja present dans le projet).
import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, FileSignature, Printer, RefreshCw, PenLine, CheckCircle2, Ban } from 'lucide-react';
import {
  getContract, saveContract, defaultClauses, type AffiliateContract,
} from '@/lib/affiliateContract';

const fmtDateLong = (d?: string | null) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }) : '—';

export function AffiliateContract({ tenantId, tenantName, onClose }: { tenantId: string; tenantName?: string; onClose: () => void }) {
  const [c, setC] = useState<AffiliateContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getContract(tenantId);
        if (alive) setC(data);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Erreur de chargement');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tenantId]);

  const set = (patch: Partial<AffiliateContract>) => setC(prev => (prev ? { ...prev, ...patch } : prev));

  async function save(extra?: Partial<AffiliateContract>) {
    if (!c) return;
    setSaving(true); setNotice(null); setError(null);
    try {
      const saved = await saveContract({ ...c, ...extra });
      setC(saved);
      setNotice('Contrat enregistre ✓');
    } catch (e: any) {
      setError(e?.message || "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  function regenerateClauses() {
    if (!c) return;
    set({ clauses: defaultClauses(c) });
    setNotice('Texte regenere a partir des valeurs courantes — pensez a enregistrer.');
  }

  async function sign() {
    if (!c) return;
    if (!c.signataire_name?.trim()) { setError('Indiquez le nom du signataire avant de signer.'); return; }
    await save({ signed_at: new Date().toISOString(), status: 'signe' });
  }

  async function unlock() {
    if (!c) return;
    if (!confirm('Deverrouiller ce contrat pour le modifier ? Il repassera au statut Brouillon (la signature actuelle sera retiree).')) return;
    await save({ status: 'brouillon', signed_at: null });
  }

  async function terminate() {
    if (!c) return;
    if (!confirm('Resilier ce contrat d affiliation ? Les commissions dues pour les periodes anterieures demeurent payables.')) return;
    await save({ status: 'resilie' });
  }

  async function exportPdf() {
    if (!c) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 48;
    let y = 56;
    const ensure = (h: number) => { if (y + h > H - 56) { doc.addPage(); y = 56; } };

    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20);
    doc.text("CONTRAT D'AFFILIATION — CO-VENDEUR", M, y); y += 22;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(70);
    const meta = [
      `Client : ${tenantName || c.tenant_id}`,
      `Vendeur : ${c.vendor_name || '—'}${c.vendor_email ? ` (${c.vendor_email})` : ''}`,
      `Commission : ${c.commission_pct} %${Number(c.inflation_pct) > 0 ? ` — indexee inflation ${c.inflation_pct} %` : ''}`,
      `Recurrence : ${c.recurrence} — debut : ${fmtDateLong(c.start_date)}`,
    ];
    for (const line of meta) { ensure(14); doc.text(line, M, y); y += 14; }
    y += 8;
    doc.setDrawColor(210); doc.line(M, y, W - M, y); y += 16;

    doc.setFontSize(10.5); doc.setTextColor(40);
    const paragraphs = (c.clauses || defaultClauses(c)).split('\n');
    for (const para of paragraphs) {
      if (para.trim() === '') { y += 7; continue; }
      const wrapped = doc.splitTextToSize(para, W - 2 * M) as string[];
      for (const ln of wrapped) { ensure(14); doc.text(ln, M, y); y += 14; }
    }

    // Bloc signature
    y += 18; ensure(80);
    doc.setDrawColor(180); doc.line(M, y, M + 240, y); y += 13;
    doc.setFontSize(10); doc.setTextColor(60);
    doc.text(`${c.signataire_name || ''}${c.signataire_title ? ', ' + c.signataire_title : ''}`, M, y); y += 14;
    doc.text(c.signed_at ? `Signe le ${fmtDateTime(c.signed_at)}` : 'Non signe', M, y);

    doc.save(`contrat-affiliation-${c.tenant_id}.pdf`);
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const signed = c?.status === 'signe';
  const terminated = c?.status === 'resilie';
  const locked = signed || terminated;   // contrat non editable (signe ou resilie) tant qu'on ne le deverrouille pas

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* En-tete */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-900 px-5 py-4 text-white dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileSignature size={18} />
            <div>
              <h2 className="font-bold leading-tight">Contrat d'affiliation</h2>
              <p className="text-xs text-gray-300">{tenantName || tenantId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {c && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                signed ? 'bg-emerald-500/20 text-emerald-300' : c.status === 'resilie' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-200'}`}>
                {signed && <CheckCircle2 size={12} />}
                {signed ? 'Signe' : c.status === 'resilie' ? 'Resilie' : 'Brouillon'}
              </span>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-300 hover:bg-white/10 hover:text-white"><X size={18} /></button>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
          ) : !c ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Contrat indisponible.'}</div>
          ) : (
            <>
              {notice && <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}
              {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

              {/* Parametres */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Vendeur (co-vendeur)</span>
                  <input className={inputCls} value={c.vendor_name} onChange={e => set({ vendor_name: e.target.value })} placeholder="Nom du vendeur" disabled={locked} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Courriel du vendeur</span>
                  <input className={inputCls} value={c.vendor_email} onChange={e => set({ vendor_email: e.target.value })} placeholder="vendeur@exemple.com" disabled={locked} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Commission (%)</span>
                  <input type="number" step="0.01" min={0} className={inputCls} value={c.commission_pct}
                    onFocus={e => e.target.select()} onChange={e => set({ commission_pct: e.target.value === '' ? 0 : Number(e.target.value) })} disabled={locked} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Inflation / indexation (%)</span>
                  <input type="number" step="0.01" min={0} className={inputCls} value={c.inflation_pct}
                    onFocus={e => e.target.select()} onChange={e => set({ inflation_pct: e.target.value === '' ? 0 : Number(e.target.value) })} disabled={locked} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Recurrence</span>
                  <input className={inputCls} value={c.recurrence} onChange={e => set({ recurrence: e.target.value })} placeholder="annuelle" disabled={locked} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Date de debut (creation du client)</span>
                  <input className={`${inputCls} text-gray-500`} value={fmtDateLong(c.start_date)} readOnly title="Inscrite automatiquement depuis la creation du client" />
                </label>
              </div>

              {/* Clauses */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Clauses legales</span>
                  <button onClick={regenerateClauses} disabled={locked}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <RefreshCw size={12} /> Regenerer le texte
                  </button>
                </div>
                <textarea
                  className="h-64 w-full resize-y rounded-lg border border-gray-300 bg-transparent px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-blue-500 dark:border-gray-600"
                  value={c.clauses} onChange={e => set({ clauses: e.target.value })} disabled={locked}
                />
              </div>

              {/* Signature */}
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200"><PenLine size={15} /> Signature</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom du signataire</span>
                    <input className={inputCls} value={c.signataire_name} onChange={e => set({ signataire_name: e.target.value })} placeholder="Nom complet" disabled={locked} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Titre / fonction</span>
                    <input className={inputCls} value={c.signataire_title} onChange={e => set({ signataire_title: e.target.value })} placeholder="ex. Directeur" disabled={locked} />
                  </label>
                </div>
                {signed ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={15} /> Signe le {fmtDateTime(c.signed_at)}
                  </p>
                ) : terminated ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                    <Ban size={15} /> Contrat resilie{c.signed_at ? ` (signe le ${fmtDateTime(c.signed_at)})` : ''}
                  </p>
                ) : (
                  <button onClick={sign} disabled={saving}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />} Signer le contrat
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pied : actions */}
        {c && !loading && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-700">
            <button onClick={exportPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <Printer size={15} /> Imprimer / PDF
            </button>
            {signed && (
              <button onClick={terminate} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10">
                <Ban size={15} /> Resilier
              </button>
            )}
            {locked ? (
              <button onClick={unlock} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Deverrouiller
              </button>
            ) : (
              <button onClick={() => save()} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AffiliateContract;
