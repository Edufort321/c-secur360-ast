'use client';
// Contrôle d'intégrité / réconciliation inter-modules (#43). Lecture seule : croise factures,
// transactions, projets, banque et inventaire avec le grand livre, et signale les écarts à corriger
// AVANT la mise en production. Chaque contrôle indique où aller corriger.
import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck, Download } from 'lucide-react';
import { runReconciliation, type ReconResult } from '@/lib/reconciliation';

type Tr = (f: string, e: string) => string;

const STYLE: Record<string, { icon: any; box: string; dot: string }> = {
  ok:    { icon: CheckCircle2,  box: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20', dot: 'text-emerald-600' },
  warn:  { icon: AlertTriangle, box: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',         dot: 'text-amber-600' },
  info:  { icon: Info,          box: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',             dot: 'text-blue-600' },
  error: { icon: XCircle,       box: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20',             dot: 'text-rose-600' },
};

export function ReconciliationPanel({ tenant, tr, canExport = true }: { tenant: string; tr: Tr; canExport?: boolean }) {
  const [res, setRes] = useState<ReconResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function exportTenant() {
    setExporting(true);
    try {
      const resp = await fetch(`/api/admin/export-tenant?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
      if (!resp.ok) { const j = await resp.json().catch(() => ({})); alert(j.error || `Erreur (${resp.status})`); return; }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `export_${tenant}_${new Date().toISOString().slice(0, 10)}.xlsx`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e: any) { alert('Erreur : ' + (e?.message || e)); }
    finally { setExporting(false); }
  }

  async function run() { setLoading(true); try { setRes(await runReconciliation(tenant)); } catch { setRes(null); } finally { setLoading(false); } }
  useEffect(() => { run(); /* eslint-disable-next-line */ }, [tenant]);

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (!res) return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">{tr('Contrôle indisponible.', 'Check unavailable.')}</div>;

  const order = { error: 0, warn: 1, info: 2, ok: 3 } as Record<string, number>;
  const sorted = [...res.checks].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  const allGood = res.error === 0 && res.warn === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-800 dark:text-gray-100"><ShieldCheck size={18} /> {tr('Contrôle d’intégrité — réconciliation', 'Integrity check — reconciliation')}</h2>
          <p className="text-xs text-gray-500">{tr('Croise factures, transactions, projets, banque et inventaire avec le grand livre. À vérifier avant la mise en production.', 'Cross-checks invoices, transactions, projects, bank and inventory with the ledger. Review before go-live.')}</p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <button onClick={exportTenant} disabled={exporting} title={tr('Exporter toutes les données du tenant (Excel) — sauvegarde', 'Export all tenant data (Excel) — backup')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {tr('Exporter les données', 'Export data')}
            </button>
          )}
          <button onClick={run} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"><RefreshCw size={15} /> {tr('Relancer', 'Re-run')}</button>
        </div>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20"><div className="text-2xl font-extrabold text-emerald-600">{res.ok}</div><div className="text-[11px] font-semibold uppercase text-emerald-500">{tr('Conformes', 'OK')}</div></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-900/20"><div className="text-2xl font-extrabold text-amber-600">{res.warn}</div><div className="text-[11px] font-semibold uppercase text-amber-500">{tr('À surveiller', 'To watch')}</div></div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center dark:border-rose-800 dark:bg-rose-900/20"><div className="text-2xl font-extrabold text-rose-600">{res.error}</div><div className="text-[11px] font-semibold uppercase text-rose-500">{tr('Anomalies', 'Errors')}</div></div>
      </div>

      {allGood && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          ✓ {tr('Tout est cohérent — prêt pour la mise en production.', 'Everything reconciles — ready for go-live.')}
        </div>
      )}

      {/* Contrôles */}
      <div className="space-y-2">
        {sorted.map(c => {
          const st = STYLE[c.status] || STYLE.info; const Icon = st.icon;
          return (
            <div key={c.key} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${st.box}`}>
              <Icon size={18} className={`mt-0.5 shrink-0 ${st.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">{c.label}{c.count != null && <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">{c.count}</span>}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{c.detail}</div>
                {c.hint && <div className="mt-0.5 text-[11px] italic text-gray-500">→ {c.hint}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
