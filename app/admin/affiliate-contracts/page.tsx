'use client';

// Vue d'ensemble super-admin des contrats d'affiliation co-vendeur (#51).
// Liste tous les contrats enregistres ; clic sur une ligne -> ouvre l'apercu/edition (composant partage).
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileSignature, CheckCircle2, Ban, FileText, Wallet } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { listContracts, type AffiliateContractRow } from '@/lib/affiliateContract';
import { AffiliateContract } from '@/components/admin/AffiliateContract';

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const STATUS: Record<string, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  signe:     { label: 'Signe',     cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  resilie:   { label: 'Resilie',   cls: 'bg-red-100 text-red-700',         Icon: Ban },
  brouillon: { label: 'Brouillon', cls: 'bg-amber-100 text-amber-700',     Icon: FileText },
};

export default function AffiliateContractsPage() {
  const [rows, setRows] = useState<AffiliateContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<{ tenantId: string; tenantName?: string } | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      setRows(await listContracts());
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const signedCount = rows.filter(r => r.status === 'signe').length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader subtitle="Contrats d'affiliation" />
      <div className="w-full px-4 py-6 lg:px-6">
        <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><FileSignature size={22} /> Contrats d'affiliation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ententes co-vendeur par client — commission, indexation, signature.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/commissions" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
              <Wallet size={15} /> Commissions a venir
            </Link>
            {!loading && <span className="text-sm text-gray-500 dark:text-gray-400">{rows.length} contrat(s) · {signedCount} signe(s)</span>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              Aucun contrat enregistre. Ouvrez un client puis « Contrat d'affiliation » pour en creer un.
              <br /><span className="text-xs">(Si la liste reste vide, executez la migration 120 dans Supabase.)</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                    <th className="px-4 py-2">Client</th>
                    <th className="px-4 py-2">Vendeur</th>
                    <th className="px-4 py-2 text-right">Commission</th>
                    <th className="px-4 py-2 text-right">Indexation</th>
                    <th className="px-4 py-2">Debut</th>
                    <th className="px-4 py-2 text-center">Statut</th>
                    <th className="px-4 py-2">Signe le</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const st = STATUS[r.status] || STATUS.brouillon;
                    return (
                      <tr key={r.id || r.tenant_id}
                        onClick={() => setOpen({ tenantId: r.tenant_id, tenantName: r.tenant_name })}
                        className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-2.5 font-medium">{r.tenant_name || r.tenant_id}</td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{r.vendor_name || '—'}</td>
                        <td className="px-4 py-2.5 text-right">{(Number(r.commission_pct) || 0)} %</td>
                        <td className="px-4 py-2.5 text-right text-gray-500">{Number(r.inflation_pct) > 0 ? `${r.inflation_pct} %` : '—'}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">{fmtDate(r.start_date)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                            <st.Icon size={12} /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-400">{fmtDate(r.signed_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
