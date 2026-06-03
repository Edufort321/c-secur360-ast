'use client';

// Tableau de bord des paiements de commission d'affiliation a venir (#63).
// Liste les commissions dues (echeance + client affilie + vendeur + montant), avec total et retards.
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Wallet, AlertTriangle, CalendarClock, FileSignature } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { listCommissions, type AffiliateCommission } from '@/lib/affiliateCommissions';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<'pending' | 'all'>('pending');

  async function load(s: 'pending' | 'all') {
    setLoading(true); setError(null);
    try {
      setRows(await listCommissions(s === 'pending' ? 'pending' : undefined));
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(scope); }, [scope]);

  const today = todayISO();
  const pending = rows.filter(r => r.status === 'pending');
  const totalUpcoming = useMemo(() => pending.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);
  const overdue = pending.filter(r => r.due_date && r.due_date < today);
  const totalOverdue = useMemo(() => overdue.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);

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
          <Link href="/admin/affiliate-contracts" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            <FileSignature size={15} /> Contrats d'affiliation
          </Link>
        </div>

        {/* Cartes de synthese */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600"><CalendarClock size={13} /> A venir</p>
            <p className="mt-1 text-2xl font-extrabold">{money(totalUpcoming)}</p>
            <p className="text-xs text-gray-400">{pending.length} commission(s) en attente</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600"><AlertTriangle size={13} /> En retard</p>
            <p className="mt-1 text-2xl font-extrabold text-red-600">{money(totalOverdue)}</p>
            <p className="text-xs text-gray-400">{overdue.length} echeance(s) depassee(s)</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Affichage</p>
            <div className="mt-2 inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm dark:border-gray-600">
              <button onClick={() => setScope('pending')} className={`px-3 py-1.5 font-semibold ${scope === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>A venir</button>
              <button onClick={() => setScope('all')} className={`px-3 py-1.5 font-semibold ${scope === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>Toutes</button>
            </div>
          </div>
        </div>

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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
