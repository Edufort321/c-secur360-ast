'use client';
// Abonnements récurrents (#35) : registre des contrats récurrents d'un tenant + MRR/ARR + facturation
// (manuelle « Facturer maintenant » ou automatique via cron) + RÉCONCILIATION avec les transactions :
//  - recherche client DYNAMIQUE (liste du tenant, saisie libre permise) ;
//  - classe de revenu (ventilation état financier) ;
//  - ligne ROUGE quand l'échéance est dépassée ;
//  - « Marquer payé » : enregistre le paiement + preuve et ÉCRIT AUTO une transaction de revenu (/api/recurring/pay).
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, TrendingUp, Download, CheckCircle2, History, Upload } from 'lucide-react';
import { getRecurring, saveRecurring, deleteRecurring, computeRecurringMetrics, isOverdue, type RecurringSub } from '@/lib/recurring';
import { uploadReceipt } from '@/lib/transactions';
import { supabase } from '@/lib/supabase';
import { EntitySearch, type EntityOption } from '@/components/ui/EntitySearch';
import { downloadCsv, type CsvColumn } from '@/lib/csv';

type Tr = (f: string, e: string) => string;
const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): RecurringSub => ({ client_name: '', plan_name: 'Abonnement', amount: 0, interval: 'monthly', status: 'active', auto_invoice: true, start_date: today() });

export function RecurringModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RecurringSub[]>([]);
  const [edit, setEdit] = useState<RecurringSub | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [billing, setBilling] = useState<string | null>(null);
  const [pay, setPay] = useState<RecurringSub | null>(null);      // abonnement en cours de « Marquer payé »
  const [hist, setHist] = useState<RecurringSub | null>(null);    // abonnement dont on affiche l'historique
  const [clients, setClients] = useState<EntityOption[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const inp = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  async function load() { setLoading(true); try { setRows(await getRecurring(tenant)); } catch (e: any) { setNotice('Erreur (migration 204 ?) : ' + (e?.message || e)); } setLoading(false); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  useEffect(() => {
    supabase.from('clients').select('id, name, city').eq('tenant_id', tenant).order('name').then(({ data }) => setClients((data || []).map((c: any) => ({ id: c.id, label: c.name, sub: c.city || undefined }))), () => {});
    supabase.from('revenue_classes').select('name').eq('tenant_id', tenant).eq('active', true).order('sort_order').then(({ data }) => setClassNames((data || []).map((c: any) => c.name).filter(Boolean)), () => {});
  }, [tenant]);

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

  function exportCsv() {
    const lbl: any = { active: tr('Actif', 'Active'), paused: tr('En pause', 'Paused'), cancelled: tr('Annulé', 'Cancelled') };
    const cols: CsvColumn<RecurringSub>[] = [
      { key: 'client_name', label: tr('Client', 'Client') },
      { key: 'plan_name', label: tr('Plan', 'Plan') },
      { key: 'amount', label: tr('Montant (avant taxes)', 'Amount (pre-tax)'), type: 'money' },
      { key: 'interval', label: tr('Période', 'Interval'), map: v => (v === 'annual' ? tr('Annuel', 'Annual') : tr('Mensuel', 'Monthly')) },
      { key: 'revenue_category', label: tr('Classe de revenu', 'Revenue class') },
      { key: 'start_date', label: tr('Début', 'Start'), type: 'date' },
      { key: 'next_billing_date', label: tr('Prochaine facturation', 'Next billing'), type: 'date' },
      { key: 'last_paid_at', label: tr('Dernier paiement', 'Last paid'), type: 'date' },
      { key: 'billing_count', label: tr('Nb facturations', 'Billing count'), type: 'number' },
      { key: 'status', label: tr('Statut', 'Status'), map: v => lbl[v as string] || v },
    ];
    downloadCsv(`abonnements-${today()}.csv`, rows, cols);
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  const STAT: any = { active: { l: tr('Actif', 'Active'), c: 'bg-emerald-100 text-emerald-700' }, paused: { l: tr('En pause', 'Paused'), c: 'bg-amber-100 text-amber-700' }, cancelled: { l: tr('Annulé', 'Cancelled'), c: 'bg-gray-100 text-gray-500' } };
  const t0 = today();

  return (
    <div className="space-y-4">
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20">{notice}</div>}

      {/* MRR / ARR */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"><div className="text-[11px] font-semibold uppercase text-blue-500">MRR</div><div className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{mny(mrr)}</div><div className="text-[11px] text-gray-400">{tr('revenu mensuel récurrent', 'monthly recurring revenue')}</div></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20"><div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase text-emerald-500"><TrendingUp size={11} /> ARR</div><div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{mny(arr)}</div><div className="text-[11px] text-gray-400">{tr('revenu annuel récurrent', 'annual recurring revenue')}</div></div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-[11px] font-semibold uppercase text-gray-400">{tr('Actifs', 'Active')}</div><div className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{activeCount}</div><div className="text-[11px] text-gray-400">{tr('abonnements', 'subscriptions')}</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canEdit && !edit && <button onClick={() => setEdit(blank())} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={15} /> {tr('Nouvel abonnement', 'New subscription')}</button>}
        {rows.length > 0 && <button onClick={exportCsv} className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={14} /> {tr('Exporter CSV', 'Export CSV')}</button>}
      </div>

      {edit && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Client', 'Client')}
              <div className="mt-1"><EntitySearch value={edit.client_name} options={clients} placeholder={tr('Rechercher un client…', 'Search a client…')}
                onText={v => setEdit({ ...edit, client_name: v, client_id: null })}
                onPick={(o: EntityOption) => setEdit({ ...edit, client_name: o.label, client_id: o.id })}
                className={`w-full ${inp}`} /></div>
            </label>
            <label className="text-xs font-semibold text-gray-500">{tr('Plan', 'Plan')}<input value={edit.plan_name} onChange={e => setEdit({ ...edit, plan_name: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Montant (avant taxes)', 'Amount (pre-tax)')}<input type="number" step="0.01" value={edit.amount} onChange={e => setEdit({ ...edit, amount: Number(e.target.value) || 0 })} className={`mt-1 w-full text-right ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Période', 'Interval')}<select value={edit.interval} onChange={e => setEdit({ ...edit, interval: e.target.value as any })} className={`mt-1 w-full ${inp}`}><option value="monthly">{tr('Mensuel', 'Monthly')}</option><option value="annual">{tr('Annuel', 'Annual')}</option></select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Classe de revenu', 'Revenue class')}
              <input list="recurring-rev-classes" value={edit.revenue_category || ''} onChange={e => setEdit({ ...edit, revenue_category: e.target.value })} placeholder={tr('(ventilation état financier)', '(financial-statement breakdown)')} className={`mt-1 w-full ${inp}`} />
              <datalist id="recurring-rev-classes">{classNames.map(c => <option key={c} value={c} />)}</datalist>
            </label>
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
            <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="px-3 py-2">{tr('Client', 'Client')}</th><th>{tr('Plan', 'Plan')}</th><th className="text-right">{tr('Montant', 'Amount')}</th><th>{tr('Période', 'Interval')}</th><th>{tr('Classe', 'Class')}</th><th>{tr('Prochaine', 'Next')}</th><th>{tr('Statut', 'Status')}</th><th></th></tr></thead>
            <tbody>
              {rows.map(s => {
                const overdue = isOverdue(s, t0);
                return (
                  <tr key={s.id} className={`border-b border-gray-50 dark:border-gray-700/50 ${overdue ? 'bg-rose-50 dark:bg-rose-900/10' : ''}`}>
                    <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{s.client_name}</td>
                    <td className="text-gray-500">{s.plan_name}</td>
                    <td className="text-right font-semibold">{mny(s.amount)}</td>
                    <td className="text-xs text-gray-500">{s.interval === 'annual' ? tr('annuel', 'annual') : tr('mensuel', 'monthly')}</td>
                    <td className="text-xs text-gray-500">{s.revenue_category || '—'}</td>
                    <td className={`text-xs ${overdue ? 'font-bold text-rose-600' : 'text-gray-500'}`}>{s.next_billing_date || '—'}{overdue ? ' ⚠' : ''}{(s.billing_count || 0) > 0 ? ` · ${s.billing_count}×` : ''}</td>
                    <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAT[s.status]?.c}`}>{STAT[s.status]?.l}</span></td>
                    <td className="px-2 text-right">
                      <span className="flex items-center justify-end gap-2 text-xs">
                        {(s.history?.length || 0) > 0 && <button onClick={() => setHist(s)} title={tr('Historique des paiements', 'Payment history')} className="text-gray-400 hover:text-gray-700"><History size={13} /></button>}
                        {canEdit && s.status === 'active' && <button onClick={() => setPay({ ...s })} className={`inline-flex items-center gap-1 font-semibold ${overdue ? 'text-rose-600' : 'text-emerald-600'} hover:underline`}><CheckCircle2 size={13} /> {tr('Marquer payé', 'Mark paid')}</button>}
                        {canEdit && s.status === 'active' && <button onClick={() => billNow(s)} disabled={billing === s.id} className="font-semibold text-indigo-600 hover:underline disabled:opacity-40">{billing === s.id ? <Loader2 size={12} className="inline animate-spin" /> : tr('Facturer', 'Bill now')}</button>}
                        {canEdit && <button onClick={() => setEdit(s)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>}
                        {canEdit && <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pay && <PayModal tenant={tenant} tr={tr} sub={pay} onClose={() => setPay(null)} onDone={(msg) => { setPay(null); setNotice(msg); load(); }} />}
      {hist && <HistoryModal tr={tr} sub={hist} onClose={() => setHist(null)} />}
    </div>
  );
}

// ── « Marquer payé » : enregistre le paiement + preuve et écrit AUTO une transaction de revenu. ──────
function PayModal({ tenant, tr, sub, onClose, onDone }: { tenant: string; tr: Tr; sub: RecurringSub; onClose: () => void; onDone: (msg: string) => void }) {
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState(Number(sub.amount) || 0);
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [createTxn, setCreateTxn] = useState(true);
  const [taxable, setTaxable] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true); setErr(null);
    try { setProofUrl(await uploadReceipt(tenant, f)); } catch (x: any) { setErr(tr('Échec du téléversement : ', 'Upload failed: ') + (x?.message || '')); } finally { setUploading(false); }
  }
  async function submit() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/recurring/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, id: sub.id, date, amount, proof_url: proofUrl || null, note: note || null, createTransaction: createTxn, taxable }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      onDone(createTxn && j.transactionId ? tr('Paiement enregistré ✓ — transaction de revenu créée et comptabilisée.', 'Payment recorded ✓ — revenue transaction created and posted.') : tr('Paiement enregistré ✓.', 'Payment recorded ✓.'));
    } catch (x: any) { setErr(x?.message || 'Erreur'); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        <div className="mb-1 text-base font-bold text-gray-800 dark:text-gray-100">{tr('Marquer payé', 'Mark paid')}</div>
        <div className="mb-4 text-xs text-gray-500">{sub.client_name} · {sub.plan_name}{sub.revenue_category ? ` · ${sub.revenue_category}` : ''}</div>
        {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{err}</div>}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-gray-500">{tr('Date du paiement', 'Payment date')}<input type="date" value={date} onChange={e => setDate(e.target.value)} className={`mt-1 w-full ${inp}`} /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Montant (avant taxes)', 'Amount (pre-tax)')}<input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} className={`mt-1 w-full text-right ${inp}`} /></label>
        </div>
        <label className="mt-3 block text-xs font-semibold text-gray-500">{tr('Note (optionnel)', 'Note (optional)')}<input value={note} onChange={e => setNote(e.target.value)} className={`mt-1 w-full ${inp}`} /></label>
        <div className="mt-3">
          <div className="text-xs font-semibold text-gray-500">{tr('Preuve de paiement', 'Proof of payment')}</div>
          <div className="mt-1 flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {tr('Téléverser', 'Upload')}
              <input type="file" className="hidden" onChange={onFile} accept="image/*,.pdf" />
            </label>
            {proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-blue-600 hover:underline">{tr('Pièce jointe ✓', 'Attachment ✓')}</a>}
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"><input type="checkbox" checked={createTxn} onChange={e => setCreateTxn(e.target.checked)} /> {tr('Écrire automatiquement une transaction de revenu (comptabilisée)', 'Auto-write a revenue transaction (posted)')}</label>
        {createTxn && <label className="mt-2 flex items-center gap-2 text-xs text-gray-500"><input type="checkbox" checked={taxable} onChange={e => setTaxable(e.target.checked)} /> {tr('Taxable (TPS/TVQ)', 'Taxable (GST/QST)')}</label>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
          <button onClick={submit} disabled={busy || uploading} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} {tr('Confirmer le paiement', 'Confirm payment')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Historique des paiements d'un abonnement. ───────────────────────────────────────────────────────
function HistoryModal({ tr, sub, onClose }: { tr: Tr; sub: RecurringSub; onClose: () => void }) {
  const h = [...(sub.history || [])].reverse();
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        <div className="mb-3 text-base font-bold text-gray-800 dark:text-gray-100">{tr('Historique des paiements', 'Payment history')} — {sub.client_name}</div>
        {h.length === 0 ? <div className="py-6 text-center text-sm text-gray-400">{tr('Aucun paiement enregistré.', 'No payment recorded.')}</div> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="py-1">{tr('Date', 'Date')}</th><th className="text-right">{tr('Montant', 'Amount')}</th><th>{tr('Preuve', 'Proof')}</th><th>{tr('Note', 'Note')}</th></tr></thead>
            <tbody>
              {h.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-1.5">{p.date}</td>
                  <td className="text-right font-semibold">{mny(p.amount)}</td>
                  <td>{p.proof_url ? <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{tr('Voir', 'View')}</a> : '—'}{p.transaction_id ? ' · txn ✓' : ''}</td>
                  <td className="text-gray-500">{p.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-4 flex justify-end"><button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Fermer', 'Close')}</button></div>
      </div>
    </div>
  );
}
