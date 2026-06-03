'use client';

// Fiche vendeur (#63) : profil + clients affilies avec leur contrat actif + commissions du vendeur.
// + Historique des paiements et action « Marquer paye » (#69). Reutilise AffiliateContract.
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, UserCheck, Mail, Phone, FileSignature, CheckCircle2, FileText, Ban, Wallet, BadgeCheck, Receipt } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { getVendorFiche, type VendorFiche, isContractActive } from '@/lib/affiliateCommissions';
import { listPayments, markCommissionPaid, summarizePayments, type AffiliateCommissionPayment } from '@/lib/affiliatePayments';
import { AffiliateContract } from '@/components/admin/AffiliateContract';

const money = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const fmtDate = (d?: string | null) => d ? new Date(d + (String(d).length === 10 ? 'T00:00:00' : '')).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function contractBadge(status?: string) {
  if (status === 'signe') return { label: 'Contrat actif', cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 };
  if (status === 'resilie') return { label: 'Resilie', cls: 'bg-red-100 text-red-700', Icon: Ban };
  if (status === 'brouillon') return { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700', Icon: FileText };
  return { label: 'Aucun contrat', cls: 'bg-gray-100 text-gray-500', Icon: FileText };
}

export default function VendorFichePage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<VendorFiche | null>(null);
  const [payments, setPayments] = useState<AffiliateCommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<{ tenantId: string; tenantName?: string } | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [fiche, pays] = await Promise.all([getVendorFiche(id), listPayments({ vendorId: id })]);
      setData(fiche); setPayments(pays);
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { if (id) load(); /* eslint-disable-next-line */ }, [id]);

  const vendor = data?.vendor;
  const clients = data?.clients || [];
  const commissions = data?.commissions || [];
  const activeCount = clients.filter(c => isContractActive(c.contract)).length;
  const totals = useMemo(() => summarizePayments(commissions, payments), [commissions, payments]);

  async function pay(commissionId: string, label: string) {
    setPayingId(commissionId); setError(null);
    try {
      await markCommissionPaid(commissionId, { method: 'virement' });
      setNotice(`Paiement enregistre (${label}) ✓`);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du paiement');
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader subtitle="Fiche vendeur" />
      <div className="w-full px-4 py-6 lg:px-6">
        <Link href="/admin/commissions" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
          <ArrowLeft size={16} /> Retour aux commissions
        </Link>

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
        ) : !vendor ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">Vendeur introuvable.</div>
        ) : (
          <>
            {/* En-tete vendeur */}
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold"><UserCheck size={22} /> {vendor.name}</h1>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {vendor.email && <span className="inline-flex items-center gap-1"><Mail size={13} /> {vendor.email}</span>}
                    {vendor.phone && <span className="inline-flex items-center gap-1"><Phone size={13} /> {vendor.phone}</span>}
                    <span>Commission : <strong>{Math.round(Number(vendor.commission_rate ?? 0) * 100)} %</strong></span>
                    {vendor.is_active === false && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">Inactif</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-xl border border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                    <p className="text-xs text-gray-400">Contrats actifs</p>
                    <p className="text-xl font-extrabold text-emerald-600">{activeCount}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                    <p className="text-xs text-gray-400">Du (echu)</p>
                    <p className="text-xl font-extrabold text-red-600">{money(totals.due)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                    <p className="text-xs text-gray-400">A venir</p>
                    <p className="text-xl font-extrabold text-blue-600">{money(totals.upcoming)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                    <p className="text-xs text-gray-400">Paye</p>
                    <p className="text-xl font-extrabold text-emerald-600">{money(totals.paid)}</p>
                  </div>
                </div>
              </div>
              {notice && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{notice}</div>}
            </div>

            {/* Clients affilies + contrat */}
            <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-bold"><FileSignature size={16} /> Clients affilies & contrats</h2>
              </div>
              {clients.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Aucun client assigne a ce vendeur.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                        <th className="px-4 py-2">Client</th>
                        <th className="px-4 py-2 text-right">Commission</th>
                        <th className="px-4 py-2">Debut</th>
                        <th className="px-4 py-2 text-center">Contrat</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(c => {
                        const b = contractBadge(c.contract?.status);
                        return (
                          <tr key={c.tenant_id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-2.5 font-medium">{c.tenant_name}</td>
                            <td className="px-4 py-2.5 text-right">{c.contract ? `${Number(c.contract.commission_pct) || 0} %` : '—'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">{fmtDate(c.contract?.start_date || c.created_at)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${b.cls}`}><b.Icon size={12} /> {b.label}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button onClick={() => setOpen({ tenantId: c.tenant_id, tenantName: c.tenant_name })}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                                <FileSignature size={13} /> {c.contract ? 'Voir le contrat' : 'Creer un contrat'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Commissions du vendeur */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-bold"><Wallet size={16} /> Commissions</h2>
              </div>
              {commissions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Aucune commission enregistree.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                        <th className="px-4 py-2">Echeance</th>
                        <th className="px-4 py-2">Client</th>
                        <th className="px-4 py-2">Periode</th>
                        <th className="px-4 py-2 text-right">Montant</th>
                        <th className="px-4 py-2 text-center">Statut</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map(c => (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(c.due_date)}</td>
                          <td className="px-4 py-2.5">{c.tenant_name}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">{c.period_start ? `${fmtDate(c.period_start)} → ${fmtDate(c.period_end)}` : '—'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{money(Number(c.amount))}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              c.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.status === 'paid' ? 'Payee' : c.status === 'pending' ? 'En attente' : 'Annulee'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {c.status === 'pending' && (
                              <button onClick={() => pay(c.id, c.tenant_name)} disabled={payingId === c.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                                {payingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />} Marquer paye
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historique des paiements */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-bold"><Receipt size={16} /> Historique des paiements</h2>
              </div>
              {payments.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Aucun paiement enregistre.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                        <th className="px-4 py-2">Paye le</th>
                        <th className="px-4 py-2">Client</th>
                        <th className="px-4 py-2">Methode</th>
                        <th className="px-4 py-2">Reference</th>
                        <th className="px-4 py-2 text-right">Montant</th>
                        <th className="px-4 py-2 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(p.paid_at)}</td>
                          <td className="px-4 py-2.5">{p.tenant_name || '—'}</td>
                          <td className="px-4 py-2.5 capitalize">{p.method || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{p.reference || '—'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{money(Number(p.amount))}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.status === 'paid' ? 'Paye' : 'Annule'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {open && (
        <AffiliateContract
          tenantId={open.tenantId}
          tenantName={open.tenantName}
          onClose={() => { setOpen(null); load(); }}
        />
      )}
    </div>
  );
}
