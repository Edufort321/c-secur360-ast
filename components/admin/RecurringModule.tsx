'use client';
// Abonnements récurrents (#35) : registre des contrats récurrents d'un tenant + MRR/ARR + facturation
// (manuelle « Facturer maintenant » ou automatique via cron). Génère des factures standard.
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Repeat, TrendingUp } from 'lucide-react';
import { getRecurring, saveRecurring, deleteRecurring, computeRecurringMetrics, type RecurringSub } from '@/lib/recurring';

type Tr = (f: string, e: string) => string;
const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const blank = (): RecurringSub => ({ client_name: '', plan_name: 'Abonnement', amount: 0, interval: 'monthly', status: 'active', auto_invoice: true, start_date: new Date().toISOString().slice(0, 10) });

export function RecurringModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RecurringSub[]>([]);
  const [edit, setEdit] = useState<RecurringSub | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [billing, setBilling] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  async function load() { setLoading(true); try { setRows(await getRecurring(tenant)); } catch (e: any) { setNotice('Erreur (migration 204 ?) : ' + (e?.message || e)); } setLoading(false); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const { mrr, arr, activeCount } = computeRecurringMetrics(rows);

  async function save() {
    if (!edit?.client_name.trim()) { setNotice(tr('Nom du client requis.', 'Client name required.')); return; }
    try { await saveRecurring(tenant, edit); setEdit(null); setNotice(tr('Abonnement enregistré.', 'Subscription saved.')); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  async function remove(id?: string) { if (!id || !confirm(tr('Supprimer cet abonnement ?', 'Delete this subscription?'))) return; try { await deleteRecurring(tenant, id); await load(); } catch (e: any) { setNotice(e?.message); } }
  async function billNow(s: RecurringSub) {
    if (!s.id || !confirm(tr('Générer une facture maintenant pour cet abonnement ?', 'Generate an invoice now for this subscription?'))) return;
    setBilling(s.id); setNotice(null);
    try { const r = await fetch('/api/recurring/invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, id: s.id }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setNotice(tr('Facture générée ✓ (onglet Factures).', 'Invoice generated ✓ (Invoices tab).')); await load(); }
    catch (e: any) { setNotice(e?.message); } finally { setBilling(null); }
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  const STAT: any = { active: { l: tr('Actif', 'Active'), c: 'bg-emerald-100 text-emerald-700' }, paused: { l: tr('En pause', 'Paused'), c: 'bg-amber-100 text-amber-700' }, cancelled: { l: tr('Annulé', 'Cancelled'), c: 'bg-gray-100 text-gray-500' } };

  return (
    <div className="space-y-4">
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20">{notice}</div>}

      {/* MRR / ARR */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"><div className="text-[11px] font-semibold uppercase text-blue-500">MRR</div><div className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{mny(mrr)}</div><div className="text-[11px] text-gray-400">{tr('revenu mensuel récurrent', 'monthly recurring revenue')}</div></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20"><div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-emerald-500"><TrendingUp size={11} /> ARR</div><div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{mny(arr)}</div><div className="text-[11px] text-gray-400">{tr('revenu annuel récurrent', 'annual recurring revenue')}</div></div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-[11px] font-semibold uppercase text-gray-400">{tr('Actifs', 'Active')}</div><div className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{activeCount}</div><div className="text-[11px] text-gray-400">{tr('abonnements', 'subscriptions')}</div></div>
      </div>

      {canEdit && !edit && <button onClick={() => setEdit(blank())} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={15} /> {tr('Nouvel abonnement', 'New subscription')}</button>}

      {edit && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Client', 'Client')}<input value={edit.client_name} onChange={e => setEdit({ ...edit, client_name: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Plan', 'Plan')}<input value={edit.plan_name} onChange={e => setEdit({ ...edit, plan_name: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Montant (avant taxes)', 'Amount (pre-tax)')}<input type="number" step="0.01" value={edit.amount} onChange={e => setEdit({ ...edit, amount: Number(e.target.value) || 0 })} className={`mt-1 w-full text-right ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Période', 'Interval')}<select value={edit.interval} onChange={e => setEdit({ ...edit, interval: e.target.value as any })} className={`mt-1 w-full ${inp}`}><option value="monthly">{tr('Mensuel', 'Monthly')}</option><option value="annual">{tr('Annuel', 'Annual')}</option></select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Début', 'Start')}<input type="date" value={edit.start_date} onChange={e => setEdit({ ...edit, start_date: e.target.value, next_billing_date: edit.next_billing_date || e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Prochaine facturation', 'Next billing')}<input type="date" value={edit.next_billing_date || ''} onChange={e => setEdit({ ...edit, next_billing_date: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Statut', 'Status')}<select value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as any })} className={`mt-1 w-full ${inp}`}><option value="active">{tr('Actif', 'Active')}</option><option value="paused">{tr('En pause', 'Paused')}</option><option value="cancelled">{tr('Annulé', 'Cancelled')}</option></select></label>
            <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-gray-500"><input type="checkbox" checked={edit.auto_invoice !== false} onChange={e => setEdit({ ...edit, auto_invoice: e.target.checked })} /> {tr('Facturation automatique à l\'échéance', 'Auto-invoice at due date')}</label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEdit(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
            <button onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun abonnement récurrent.', 'No recurring subscription yet.')}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="px-3 py-2">{tr('Client', 'Client')}</th><th>{tr('Plan', 'Plan')}</th><th className="text-right">{tr('Montant', 'Amount')}</th><th>{tr('Période', 'Interval')}</th><th>{tr('Prochaine', 'Next')}</th><th>{tr('Statut', 'Status')}</th><th></th></tr></thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{s.client_name}</td>
                  <td className="text-gray-500">{s.plan_name}</td>
                  <td className="text-right font-semibold">{mny(s.amount)}</td>
                  <td className="text-xs text-gray-500">{s.interval === 'annual' ? tr('annuel', 'annual') : tr('mensuel', 'monthly')}</td>
                  <td className="text-xs text-gray-500">{s.next_billing_date || '—'}{(s.billing_count || 0) > 0 ? ` · ${s.billing_count}×` : ''}</td>
                  <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAT[s.status]?.c}`}>{STAT[s.status]?.l}</span></td>
                  <td className="px-2 text-right">
                    {canEdit && (
                      <span className="flex justify-end gap-2 text-xs">
                        {s.status === 'active' && <button onClick={() => billNow(s)} disabled={billing === s.id} className="font-semibold text-indigo-600 hover:underline disabled:opacity-40">{billing === s.id ? <Loader2 size={12} className="inline animate-spin" /> : tr('Facturer', 'Bill now')}</button>}
                        <button onClick={() => setEdit(s)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                        <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
