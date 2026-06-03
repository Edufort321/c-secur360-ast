'use client';

// Tableau de bord des paiements de commission d'affiliation (#63 + #69).
// Liste les commissions (echeance + client affilie + vendeur + montant), totaux du/a venir/paye,
// action « Marquer paye » (#69) qui enregistre un paiement et passe l'echeance a paye.
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Wallet, AlertTriangle, CalendarClock, FileSignature, BadgeCheck, CheckCircle2, X, Download, BellRing } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { listCommissions, commissionReminders, type AffiliateCommission } from '@/lib/affiliateCommissions';
import { listPayments, markCommissionPaid, summarizePayments, paymentsToExpenses, COMMISSION_EXPENSE_ACCOUNT, type AffiliateCommissionPayment } from '@/lib/affiliatePayments';

const money = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const fmtDate = (d?: string | null) => d ? new Date(d + (String(d).length === 10 ? 'T00:00:00' : '')).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const todayISO = () => new Date().toISOString().slice(0, 10);

const STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  paid:      { label: 'Payee',      cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulee',    cls: 'bg-gray-100 text-gray-500' },
};

export default function CommissionsDashboardPage() {
  const [rows, setRows] = useState<AffiliateCommission[]>([]);
  const [payments, setPayments] = useState<AffiliateCommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<'pending' | 'all'>('pending');
  const [payRow, setPayRow] = useState<AffiliateCommission | null>(null);
  const [payForm, setPayForm] = useState({ method: 'virement', reference: '' });
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load(s: 'pending' | 'all') {
    setLoading(true); setError(null);
    try {
      const [comms, pays] = await Promise.all([
        listCommissions(s === 'pending' ? 'pending' : undefined),
        listPayments(),
      ]);
      setRows(comms); setPayments(pays);
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(scope); }, [scope]);

  const today = todayISO();
  const pending = rows.filter(r => r.status === 'pending');
  const totals = useMemo(() => summarizePayments(rows, payments, today), [rows, payments, today]);
  const reminders = useMemo(() => commissionReminders(rows, { today }), [rows, today]);
  const overdueCount = reminders.filter(r => r.bucket === 'overdue').length;

  // Lien comptabilite (#69) : expose les paiements regles comme depenses (compte 5050), en lecture seule.
  function exportExpensesCSV() {
    const expenses = paymentsToExpenses(payments);
    if (!expenses.length) { setNotice('Aucun paiement regle a exporter.'); return; }
    const headers = ['Date', 'Description', 'Reference', 'Code', 'Compte', 'Montant'];
    const rows = expenses.map(e => [e.date, e.description, e.reference, e.account_code, e.account_name, String(e.amount)]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,﻿${encodeURIComponent(csv)}`;
    a.download = `depenses-commissions-affiliation.csv`;
    a.click();
  }

  async function confirmPay() {
    if (!payRow) return;
    setPaying(true); setError(null);
    try {
      await markCommissionPaid(payRow.id, { method: payForm.method, reference: payForm.reference || undefined });
      setNotice(`Paiement enregistre pour ${payRow.tenant_name} ✓`);
      setPayRow(null); setPayForm({ method: 'virement', reference: '' });
      await load(scope);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du paiement');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader subtitle="Commissions d'affiliation" />
      <div className="w-full px-4 py-6 lg:px-6">
        <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><Wallet size={22} /> Paiements de commission a venir</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Commissions dues aux co-vendeurs — echeance et client affilie.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-gray-600">
              <button onClick={() => setScope('pending')} className={`px-3 py-1.5 font-semibold ${scope === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>A venir</button>
              <button onClick={() => setScope('all')} className={`px-3 py-1.5 font-semibold ${scope === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Toutes</button>
            </div>
            <button onClick={exportExpensesCSV} title={`Exporter les paiements regles comme depenses (compte ${COMMISSION_EXPENSE_ACCOUNT.code})`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <Download size={15} /> Depenses (CSV)
            </button>
            <Link href="/admin/affiliate-contracts" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <FileSignature size={15} /> Contrats
            </Link>
          </div>
        </div>

        {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{notice}</div>}

        {/* Cartes de synthese : du / a venir / paye */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600"><AlertTriangle size={13} /> Du (echu)</p>
            <p className="mt-1 text-2xl font-extrabold text-red-600">{money(totals.due)}</p>
            <p className="text-xs text-gray-400">echeances atteintes, non payees</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600"><CalendarClock size={13} /> A venir</p>
            <p className="mt-1 text-2xl font-extrabold">{money(totals.upcoming)}</p>
            <p className="text-xs text-gray-400">{pending.length} commission(s) en attente</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600"><CheckCircle2 size={13} /> Paye</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">{money(totals.paid)}</p>
            <p className="text-xs text-gray-400">{payments.filter(p => p.status === 'paid').length} paiement(s) regle(s)</p>
          </div>
        </div>

        {/* Rappels d'echeance (#70) : retards + echeances proches (<= 30 j) */}
        {!loading && reminders.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-2.5 dark:border-amber-500/30">
              <BellRing size={16} className="text-amber-600" />
              <h2 className="text-sm font-bold text-amber-800 dark:text-amber-200">Rappels d'echeance</h2>
              <span className="text-xs text-amber-700 dark:text-amber-300">
                {overdueCount > 0 && <>{overdueCount} en retard · </>}{reminders.length - overdueCount} a echeance proche (30 j)
              </span>
            </div>
            <ul className="divide-y divide-amber-100 dark:divide-amber-500/20">
              {reminders.slice(0, 8).map(r => (
                <li key={r.commission.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                  <span className="text-gray-700 dark:text-gray-200">
                    <strong>{r.commission.tenant_name}</strong>
                    <span className="text-gray-400"> · {r.commission.vendor_name || '—'}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${r.bucket === 'overdue' ? 'text-red-600' : 'text-amber-700 dark:text-amber-300'}`}>
                      {r.bucket === 'overdue' ? `En retard de ${Math.abs(r.daysUntil)} j` : `Dans ${r.daysUntil} j`} · {fmtDate(r.commission.due_date)}
                    </span>
                    <span className="font-semibold">{money(Number(r.commission.amount))}</span>
                    <button onClick={() => setPayRow(r.commission)}
                      className="rounded-lg border border-emerald-300 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                      Payer
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            {reminders.length > 8 && <p className="px-4 py-2 text-xs text-amber-700 dark:text-amber-300">+ {reminders.length - 8} autre(s) echeance(s) — voir le tableau ci-dessous.</p>}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              Aucune commission {scope === 'pending' ? 'a venir' : 'enregistree'}.
              <br /><span className="text-xs">(Les commissions sont generees au renouvellement annuel d'un client avec vendeur assigne.)</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                    <th className="px-4 py-2">Echeance</th>
                    <th className="px-4 py-2">Client affilie</th>
                    <th className="px-4 py-2">Vendeur</th>
                    <th className="px-4 py-2">Periode</th>
                    <th className="px-4 py-2 text-right">Montant</th>
                    <th className="px-4 py-2 text-center">Statut</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const st = STATUS[r.status] || STATUS.pending;
                    const isOverdue = r.status === 'pending' && r.due_date && r.due_date < today;
                    return (
                      <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                        <td className={`px-4 py-2.5 whitespace-nowrap font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                          {isOverdue && <AlertTriangle size={12} className="mr-1 inline" />}{fmtDate(r.due_date)}
                        </td>
                        <td className="px-4 py-2.5">{r.tenant_name}</td>
                        <td className="px-4 py-2.5">
                          {r.vendor_id ? (
                            <Link href={`/admin/vendors/${r.vendor_id}`} className="font-medium text-blue-600 hover:underline">{r.vendor_name || '—'}</Link>
                          ) : (r.vendor_name || '—')}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">
                          {r.period_start ? `${fmtDate(r.period_start)} → ${fmtDate(r.period_end)}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">{money(Number(r.amount))}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {r.status === 'pending' && (
                            <button onClick={() => setPayRow(r)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                              <BadgeCheck size={13} /> Marquer paye
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Lien comptabilite : les paiements regles sont exposables comme depenses sur le compte {COMMISSION_EXPENSE_ACCOUNT.code} « {COMMISSION_EXPENSE_ACCOUNT.name} » (export CSV ci-dessus). Lecture seule — n'affecte pas les ecritures du grand livre.
        </p>
      </div>

      {/* Modal : marquer une commission payee */}
      {payRow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onMouseDown={() => !paying && setPayRow(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-900 px-5 py-4 text-white dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-bold"><BadgeCheck size={18} /> Marquer comme paye</h2>
              <button onClick={() => !paying && setPayRow(null)} className="rounded-lg p-1.5 text-gray-300 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {payRow.tenant_name} · {payRow.vendor_name || '—'} · <strong>{money(Number(payRow.amount))}</strong>
              </p>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Methode</span>
                <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600">
                  <option value="virement">Virement</option>
                  <option value="cheque">Cheque</option>
                  <option value="comptant">Comptant</option>
                  <option value="autre">Autre</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Reference (optionnel)</span>
                <input value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="N° de virement / cheque" className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-700">
              <button onClick={() => setPayRow(null)} disabled={paying} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300">Annuler</button>
              <button onClick={confirmPay} disabled={paying}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {paying ? <Loader2 size={15} className="animate-spin" /> : <BadgeCheck size={15} />} Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
