'use client';
// Paie réelle (#43) — panneau de CALCUL des retenues à la source. Reçoit les lignes du registre de paie
// (PayrollRow : brut, avantages, remboursements) pour les feuilles sélectionnées, appelle le moteur serveur
// (/api/payroll/calculate), affiche brut → RRQ/AE/RQAP/impôts → net + coût employeur, puis permet d'ENREGISTRER
// le run (et de le COMPTABILISER au grand livre). Réglages tenant (fréquence, CNESST, FSS) via la roue dentée.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Calculator, Settings, Save, Download } from 'lucide-react';
import type { PayrollRow } from '@/lib/payroll';

type Tr = (fr: string, en: string) => string;
type CalcLine = {
  personnel_id: string; employee_name: string; gross: number; allowances: number; reimbursable: number;
  qpp: number; ei: number; qpip: number; federal_tax: number; quebec_tax: number; extra_tax: number;
  total_deductions: number; net_pay: number; total_to_pay: number; er_total: number;
  er_qpp: number; er_ei: number; er_qpip: number; er_fss: number; er_cnesst: number; er_wsdrf: number; detail?: any;
};
type CalcTotals = {
  count: number; gross: number; qpp: number; ei: number; qpip: number; federal_tax: number; quebec_tax: number;
  total_deductions: number; net_pay: number; total_to_pay: number; er_total: number; employer_cost: number;
};

const FREQ_LABEL: Record<string, [string, string]> = {
  weekly: ['Hebdomadaire (52)', 'Weekly (52)'], biweekly: ['Aux 2 semaines (26)', 'Bi-weekly (26)'],
  semimonthly: ['Bimensuelle (24)', 'Semi-monthly (24)'], monthly: ['Mensuelle (12)', 'Monthly (12)'],
};

export default function PayrollRunPanel({ tenant, tr, rows }: { tenant: string; tr: Tr; rows: PayrollRow[] }) {
  const [calc, setCalc] = useState<{ lines: CalcLine[]; totals: CalcTotals; frequency: string; year: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [postGl, setPostGl] = useState(true);
  const [msg, setMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Période = min/max des feuilles sélectionnées (éditable).
  const auto = useMemo(() => {
    const starts = rows.map(r => r.periodStart).filter(Boolean).sort();
    const ends = rows.map(r => r.periodEnd).filter(Boolean).sort();
    return { start: starts[0] || '', end: ends[ends.length - 1] || '' };
  }, [rows]);
  const [periodStart, setPeriodStart] = useState(auto.start);
  const [periodEnd, setPeriodEnd] = useState(auto.end);
  const [payDate, setPayDate] = useState('');

  const mny = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

  async function calculate() {
    if (!rows.length) { setMsg(tr('Sélectionnez des feuilles d’abord.', 'Select sheets first.')); return; }
    setBusy(true); setMsg(''); setCalc(null);
    // Agrège par employé (un employé peut avoir plusieurs feuilles dans la période).
    const byEmp = new Map<string, { name: string; gross: number; allowances: number; reimbursable: number }>();
    for (const r of rows) {
      if (!r.employeeId) continue;
      const cur = byEmp.get(r.employeeId) || { name: r.employeeName, gross: 0, allowances: 0, reimbursable: 0 };
      cur.gross += Number(r.gross) || 0; cur.allowances += Number(r.allowances) || 0; cur.reimbursable += Number(r.reimbursable) || 0;
      byEmp.set(r.employeeId, cur);
    }
    const items = [...byEmp.entries()].map(([personnel_id, v]) => ({ personnel_id, name: v.name, gross: v.gross, allowances: v.allowances, reimbursable: v.reimbursable }));
    try {
      const res = await fetch('/api/payroll/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, items }) });
      const j = await res.json();
      if (!res.ok) { setMsg(j.error || tr('Calcul impossible.', 'Calc failed.')); return; }
      setCalc({ lines: j.lines, totals: j.totals, frequency: j.frequency, year: j.year });
    } catch { setMsg(tr('Erreur réseau.', 'Network error.')); }
    finally { setBusy(false); }
  }

  async function saveRun() {
    if (!calc) return;
    if (!periodStart || !periodEnd) { setMsg(tr('Indiquez la période.', 'Set the period.')); return; }
    setSaving(true); setMsg('');
    try {
      const res = await fetch('/api/payroll/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ tenant, run: { period_start: periodStart, period_end: periodEnd, pay_date: payDate || null, frequency: calc.frequency, tax_year: calc.year }, lines: calc.lines, postGl }),
      });
      const j = await res.json();
      if (!res.ok) { setMsg(j.error || tr('Enregistrement impossible.', 'Save failed.')); return; }
      setMsg(j.glWarning ? `✓ ${tr('Paie enregistrée', 'Payroll saved')} — ⚠️ ${j.glWarning}`
        : `✓ ${tr('Paie enregistrée', 'Payroll saved')}${postGl && j.glEntryId ? tr(' et comptabilisée.', ' and posted to GL.') : '.'}`);
    } catch { setMsg(tr('Erreur réseau.', 'Network error.')); }
    finally { setSaving(false); }
  }

  function exportCsv() {
    if (!calc) return;
    const H = ['Employé', 'Brut', 'RRQ', 'AE', 'RQAP', 'Impôt féd.', 'Impôt QC', 'Retenues', 'Net', 'À verser', 'Coût employeur'];
    const esc = (v: any) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const f2 = (v: number) => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);
    const L = [H.join(',')];
    for (const l of calc.lines) L.push([esc(l.employee_name), f2(l.gross), f2(l.qpp), f2(l.ei), f2(l.qpip), f2(l.federal_tax), f2(l.quebec_tax), f2(l.total_deductions), f2(l.net_pay), f2(l.total_to_pay), f2(l.gross + l.er_total)].join(','));
    const t = calc.totals;
    L.push(['TOTAUX', f2(t.gross), f2(t.qpp), f2(t.ei), f2(t.qpip), f2(t.federal_tax), f2(t.quebec_tax), f2(t.total_deductions), f2(t.net_pay), f2(t.total_to_pay), f2(t.employer_cost)].join(','));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + L.join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `paie_reelle_${periodStart}_${periodEnd}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-500/30 dark:bg-gray-800">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><Calculator size={15} className="text-indigo-600" /> {tr('Paie réelle — retenues à la source (QC)', 'Real payroll — source deductions (QC)')}</span>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{rows.length} {tr('feuille(s) sélectionnée(s)', 'sheet(s) selected')}</span>
        <button onClick={() => setShowSettings(true)} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"><Settings size={13} /> {tr('Réglages paie', 'Payroll settings')}</button>
        <button onClick={calculate} disabled={busy || !rows.length} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{busy ? <Loader2 size={13} className="animate-spin" /> : <Calculator size={13} />} {tr('Calculer la paie', 'Calculate payroll')}</button>
      </div>

      {msg && <p className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">{msg}</p>}

      {calc && (
        <>
          <div className="mb-3 flex flex-wrap items-end gap-3 text-xs">
            <label className="flex flex-col gap-0.5"><span className="text-gray-500">{tr('Début période', 'Period start')}</span><input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900" /></label>
            <label className="flex flex-col gap-0.5"><span className="text-gray-500">{tr('Fin période', 'Period end')}</span><input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900" /></label>
            <label className="flex flex-col gap-0.5"><span className="text-gray-500">{tr('Date de paie', 'Pay date')}</span><input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900" /></label>
            <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{tr('Fréquence', 'Frequency')} : {tr(FREQ_LABEL[calc.frequency]?.[0] || calc.frequency, FREQ_LABEL[calc.frequency]?.[1] || calc.frequency)} · {calc.year}</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/40">
                <tr>
                  <th className="px-2 py-2 text-left">{tr('Employé', 'Employee')}</th>
                  <th className="px-2 py-2">{tr('Brut', 'Gross')}</th>
                  <th className="px-2 py-2">RRQ</th><th className="px-2 py-2">AE</th><th className="px-2 py-2">RQAP</th>
                  <th className="px-2 py-2">{tr('Imp. féd.', 'Fed. tax')}</th><th className="px-2 py-2">{tr('Imp. QC', 'QC tax')}</th>
                  <th className="px-2 py-2">{tr('Retenues', 'Deductions')}</th><th className="px-2 py-2 font-bold">{tr('Net', 'Net')}</th>
                  <th className="px-2 py-2">{tr('À verser', 'To pay')}</th><th className="px-2 py-2">{tr('Coût empl.', 'Empl. cost')}</th>
                </tr>
              </thead>
              <tbody>
                {calc.lines.map(l => (
                  <tr key={l.personnel_id} className="border-t border-gray-100 dark:border-gray-700/50">
                    <td className="px-2 py-1.5 text-left font-semibold text-gray-800 dark:text-gray-100">{l.employee_name}</td>
                    <td className="px-2 py-1.5">{mny(l.gross)}</td>
                    <td className="px-2 py-1.5 text-gray-500">{mny(l.qpp)}</td><td className="px-2 py-1.5 text-gray-500">{mny(l.ei)}</td><td className="px-2 py-1.5 text-gray-500">{mny(l.qpip)}</td>
                    <td className="px-2 py-1.5 text-gray-500">{mny(l.federal_tax)}</td><td className="px-2 py-1.5 text-gray-500">{mny(l.quebec_tax)}</td>
                    <td className="px-2 py-1.5 text-rose-600">−{mny(l.total_deductions)}</td><td className="px-2 py-1.5 font-bold text-emerald-700 dark:text-emerald-400">{mny(l.net_pay)}</td>
                    <td className="px-2 py-1.5 font-semibold">{mny(l.total_to_pay)}</td><td className="px-2 py-1.5 text-gray-500">{mny(l.gross + l.er_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-bold text-gray-800 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-100">
                <tr>
                  <td className="px-2 py-2 text-left">{tr('TOTAUX', 'TOTALS')}</td>
                  <td className="px-2 py-2">{mny(calc.totals.gross)}</td>
                  <td className="px-2 py-2">{mny(calc.totals.qpp)}</td><td className="px-2 py-2">{mny(calc.totals.ei)}</td><td className="px-2 py-2">{mny(calc.totals.qpip)}</td>
                  <td className="px-2 py-2">{mny(calc.totals.federal_tax)}</td><td className="px-2 py-2">{mny(calc.totals.quebec_tax)}</td>
                  <td className="px-2 py-2 text-rose-600">−{mny(calc.totals.total_deductions)}</td><td className="px-2 py-2 text-emerald-700 dark:text-emerald-400">{mny(calc.totals.net_pay)}</td>
                  <td className="px-2 py-2">{mny(calc.totals.total_to_pay)}</td><td className="px-2 py-2">{mny(calc.totals.employer_cost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" checked={postGl} onChange={e => setPostGl(e.target.checked)} /> {tr('Comptabiliser au grand livre (DR Salaires / CR Net + retenues)', 'Post to GL (DR Wages / CR Net + remittances)')}</label>
            <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"><Download size={13} /> CSV</button>
            <button onClick={saveRun} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {tr('Enregistrer la paie', 'Save payroll')}</button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">{tr('Méthode des formules (ARC T4127 / Revenu Québec TP-1015.F), abattement du Québec 16,5 %. Référence faisant autorité : WebRAS. Validez les cas particuliers avec votre fiscaliste.', 'Formula method (CRA T4127 / Revenu Québec TP-1015.F), 16.5% Quebec abatement. Authoritative reference: WebRAS. Validate edge cases with your accountant.')}</p>
        </>
      )}

      {showSettings && <PayrollSettingsModal tenant={tenant} tr={tr} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

// ── Modale de réglages de paie (fréquence, année, taux CNESST/FSS/1 %) ───────────
function PayrollSettingsModal({ tenant, tr, onClose }: { tenant: string; tr: Tr; onClose: () => void }) {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  async function load() {
    try {
      const res = await fetch(`/api/payroll/settings?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
      const j = await res.json(); if (res.ok) setS(j.settings);
    } catch { /* défauts */ } finally { setBusy(false); }
  }
  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/payroll/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, settings: s }) });
      if (res.ok) onClose();
    } finally { setSaving(false); }
  }
  const upd = (k: string, v: any) => setS((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{tr('Réglages de paie', 'Payroll settings')}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button></div>
        {busy || !s ? <div className="grid place-items-center py-8 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-2"><span className="text-gray-600 dark:text-gray-300">{tr('Fréquence de paie', 'Pay frequency')}</span>
              <select value={s.pay_frequency} onChange={e => upd('pay_frequency', e.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900">
                {Object.keys(FREQ_LABEL).map(f => <option key={f} value={f}>{tr(FREQ_LABEL[f][0], FREQ_LABEL[f][1])}</option>)}
              </select></label>
            <label className="flex items-center justify-between gap-2"><span className="text-gray-600 dark:text-gray-300">{tr('Année fiscale', 'Tax year')}</span>
              <select value={s.tax_year} onChange={e => upd('tax_year', Number(e.target.value))} className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-900"><option value={2026}>2026</option><option value={2025}>2025</option></select></label>
            {([
              ['cnesst_rate', tr('Taux CNESST (décimal, ex. 0.02 = 2 %)', 'CNESST rate (decimal)')],
              ['fss_rate', tr('Taux FSS — Fonds des services de santé', 'FSS rate')],
              ['wsdrf_rate', tr('Loi du 1 % (formation)', '1% training levy')],
              ['wsdrf_threshold', tr('Seuil masse salariale (loi du 1 %)', 'Payroll threshold (1% levy)')],
            ] as [string, string][]).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between gap-2"><span className="text-gray-600 dark:text-gray-300">{label}</span>
                <input type="number" step="any" value={s[k] ?? ''} onChange={e => upd(k, e.target.value === '' ? '' : Number(e.target.value))} className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 text-right dark:border-gray-600 dark:bg-gray-900" /></label>
            ))}
            <p className="text-[10px] text-gray-400">{tr('CNESST/FSS dépendent de votre classification et de votre masse salariale — confirmez vos taux auprès de la CNESST et de Revenu Québec.', 'CNESST/FSS depend on your classification and total payroll — confirm with CNESST and Revenu Québec.')}</p>
            <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {tr('Enregistrer', 'Save')}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
