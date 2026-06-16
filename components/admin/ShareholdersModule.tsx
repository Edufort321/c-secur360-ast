'use client';
// Actionnaires, cap table et dividendes (#32). Données sensibles : tout passe par les routes
// serveur (lib/shareholders). L'info bancaire n'est révélée qu'à la demande (bouton « Révéler »).
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Eye, Lock, PieChart as PieIcon, Users, Coins } from 'lucide-react';
import {
  getShareholders, saveShareholder, deleteShareholder, revealBanking, saveBanking,
  getShares, saveShareClass, saveShareTxn, deleteShareTxn,
  getDividends, declareDividend, payDividend, cancelDividend,
  maskAccount, type Shareholder, type ShareholderBanking, type ShareClass, type ShareTransaction,
  type DividendDeclaration, type DividendPayment,
} from '@/lib/shareholders';

type Tr = (f: string, e: string) => string;
const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const num = (n: number, d = 0) => (Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: d, maximumFractionDigits: d });

export function ShareholdersModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [view, setView] = useState<'registre' | 'captable' | 'dividendes'>('registre');
  const [notice, setNotice] = useState<string | null>(null);
  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {([['registre', tr('Registre', 'Registry'), Users], ['captable', tr('Cap table', 'Cap table'), PieIcon], ['dividendes', tr('Dividendes', 'Dividends'), Coins]] as const).map(([k, lbl, Icon]) => (
            <button key={k} onClick={() => { setView(k as any); setNotice(null); }} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${view === k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}><Icon size={14} /> {lbl}</button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"><Lock size={11} /> {tr('Données confidentielles', 'Confidential data')}</span>
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

      {view === 'registre' && <Registre tenant={tenant} tr={tr} canEdit={canEdit} inputCls={inputCls} setNotice={setNotice} />}
      {view === 'captable' && <CapTable tenant={tenant} tr={tr} canEdit={canEdit} inputCls={inputCls} setNotice={setNotice} />}
      {view === 'dividendes' && <Dividendes tenant={tenant} tr={tr} canEdit={canEdit} inputCls={inputCls} setNotice={setNotice} />}
    </div>
  );
}

type SubProps = { tenant: string; tr: Tr; canEdit: boolean; inputCls: string; setNotice: (s: string | null) => void };

// ── Registre des actionnaires (+ info bancaire confidentielle) ──
function Registre({ tenant, tr, canEdit, inputCls, setNotice }: SubProps) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Shareholder[]>([]);
  const [edit, setEdit] = useState<Shareholder | null>(null);
  const [bankFor, setBankFor] = useState<Shareholder | null>(null);

  async function load() { setLoading(true); try { const r = await getShareholders(tenant); setList(r.shareholders || []); } catch (e: any) { setNotice(e?.message); } setLoading(false); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  async function save() {
    if (!edit) return;
    try { await saveShareholder(tenant, edit); setEdit(null); setNotice(tr('Actionnaire enregistré.', 'Shareholder saved.')); await load(); }
    catch (e: any) { setNotice(e?.message); }
  }
  async function remove(id?: string) {
    if (!id || !confirm(tr('Supprimer cet actionnaire ?', 'Delete this shareholder?'))) return;
    try { await deleteShareholder(tenant, id); await load(); } catch (e: any) { setNotice(e?.message); }
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-3">
      {canEdit && !edit && <button onClick={() => setEdit({ full_name: '', holder_type: 'individual', is_active: true })} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={15} /> {tr('Nouvel actionnaire', 'New shareholder')}</button>}

      {edit && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Nom complet', 'Full name')}<input value={edit.full_name} onChange={e => setEdit({ ...edit, full_name: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Type', 'Type')}<select value={edit.holder_type} onChange={e => setEdit({ ...edit, holder_type: e.target.value as any })} className={`mt-1 w-full ${inputCls}`}><option value="individual">{tr('Particulier', 'Individual')}</option><option value="corporation">{tr('Société', 'Corporation')}</option><option value="trust">{tr('Fiducie', 'Trust')}</option></select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Courriel personnel', 'Personal email')}<input value={edit.email || ''} onChange={e => setEdit({ ...edit, email: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Téléphone', 'Phone')}<input value={edit.phone || ''} onChange={e => setEdit({ ...edit, phone: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Adresse', 'Address')}<input value={edit.address || ''} onChange={e => setEdit({ ...edit, address: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('NAS / N° entreprise', 'SIN / Business #')}<input value={edit.tax_id || ''} onChange={e => setEdit({ ...edit, tax_id: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-gray-500"><input type="checkbox" checked={edit.is_active !== false} onChange={e => setEdit({ ...edit, is_active: e.target.checked })} /> {tr('Actif', 'Active')}</label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEdit(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
            <button onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun actionnaire.', 'No shareholder yet.')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(s => (
            <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-bold text-gray-900 dark:text-white">{s.full_name}</div>
                  <div className="truncate text-xs text-gray-400">{s.email || '—'}</div>
                </div>
                {s.is_active === false && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{tr('Inactif', 'Inactive')}</span>}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">{num(s.shares_total || 0)} {tr('actions', 'shares')}</span>
                <span className={`inline-flex items-center gap-1 ${s.banking_on_file ? 'text-emerald-600' : 'text-gray-400'}`}><Lock size={11} /> {s.banking_on_file ? tr('Banque au dossier', 'Banking on file') : tr('Pas de banque', 'No banking')}</span>
              </div>
              {canEdit && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-gray-100 pt-2 text-xs dark:border-gray-700">
                  <button onClick={() => setEdit(s)} className="font-semibold text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                  <button onClick={() => setBankFor(s)} className="font-semibold text-indigo-600 hover:underline">{tr('Info bancaire', 'Banking info')}</button>
                  <button onClick={() => remove(s.id)} className="ml-auto text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {bankFor && <BankingEditor tenant={tenant} tr={tr} inputCls={inputCls} shareholder={bankFor} onClose={() => setBankFor(null)} setNotice={setNotice} onSaved={load} />}
    </div>
  );
}

// Éditeur d'info bancaire — révélation explicite (les champs ne sont chargés que sur demande).
function BankingEditor({ tenant, tr, inputCls, shareholder, onClose, setNotice, onSaved }: { tenant: string; tr: Tr; inputCls: string; shareholder: Shareholder; onClose: () => void; setNotice: (s: string | null) => void; onSaved: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [b, setB] = useState<ShareholderBanking>({ payment_method: 'eft' });
  const [busy, setBusy] = useState(false);

  async function reveal() {
    setBusy(true);
    try { const r = await revealBanking(tenant, shareholder.id!); if (r.banking) setB(r.banking); setRevealed(true); }
    catch (e: any) { setNotice(e?.message); }
    setBusy(false);
  }
  async function save() {
    setBusy(true);
    try { await saveBanking(tenant, shareholder.id!, b); setNotice(tr('Information bancaire enregistrée.', 'Banking info saved.')); onSaved(); onClose(); }
    catch (e: any) { setNotice(e?.message); }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><Lock size={15} className="text-indigo-600" /> {tr('Versement des dividendes', 'Dividend payout')} — {shareholder.full_name}</div>
        <p className="mt-1 text-xs text-amber-600">{tr('Confidentiel. Saisi côté serveur uniquement, jamais affiché dans les listes.', 'Confidential. Server-side only, never shown in lists.')}</p>
        {!revealed ? (
          <button onClick={reveal} disabled={busy} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">{busy ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} {tr('Révéler / saisir', 'Reveal / enter')}</button>
        ) : (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-semibold text-gray-500">{tr('Mode de paiement', 'Payment method')}<select value={b.payment_method} onChange={e => setB({ ...b, payment_method: e.target.value as any })} className={`mt-1 w-full ${inputCls}`}><option value="eft">{tr('Virement (EFT)', 'EFT transfer')}</option><option value="cheque">{tr('Chèque', 'Cheque')}</option><option value="other">{tr('Autre', 'Other')}</option></select></label>
            <label className="block text-xs font-semibold text-gray-500">{tr('Titulaire du compte', 'Account holder')}<input value={b.account_holder || ''} onChange={e => setB({ ...b, account_holder: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-xs font-semibold text-gray-500">{tr('Institution', 'Institution')}<input value={b.bank_institution || ''} onChange={e => setB({ ...b, bank_institution: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
              <label className="block text-xs font-semibold text-gray-500">{tr('Transit', 'Transit')}<input value={b.bank_transit || ''} onChange={e => setB({ ...b, bank_transit: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
              <label className="block text-xs font-semibold text-gray-500">{tr('Compte', 'Account')}<input value={b.bank_account || ''} onChange={e => setB({ ...b, bank_account: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            </div>
            <button onClick={save} disabled={busy} className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{busy ? <Loader2 size={14} className="inline animate-spin" /> : tr('Enregistrer', 'Save')}</button>
          </div>
        )}
        <button onClick={onClose} className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Fermer', 'Close')}</button>
      </div>
    </div>
  );
}

// ── Cap table : catégories + mouvements + répartition ──
function CapTable({ tenant, tr, canEdit, inputCls, setNotice }: SubProps) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ShareClass[]>([]);
  const [txns, setTxns] = useState<ShareTransaction[]>([]);
  const [holders, setHolders] = useState<Shareholder[]>([]);
  const [newClass, setNewClass] = useState<ShareClass>({ name: '', votes_per_share: 1, is_voting: true });
  const today = new Date().toISOString().slice(0, 10);
  const [txn, setTxn] = useState<ShareTransaction>({ shareholder_id: '', txn_date: today, txn_type: 'issuance', shares: 0, price_per_share: 0, amount: 0 });

  async function load() {
    setLoading(true);
    try { const [s, sh] = await Promise.all([getShares(tenant), getShareholders(tenant)]); setClasses(s.classes || []); setTxns(s.transactions || []); setHolders(sh.shareholders || []); }
    catch (e: any) { setNotice(e?.message); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const holdMap: Record<string, number> = {};
  txns.forEach(t => { holdMap[t.shareholder_id] = (holdMap[t.shareholder_id] || 0) + (Number(t.shares) || 0); });
  const totalShares = Object.values(holdMap).reduce((s, n) => s + n, 0);
  const nameOf = (id: string) => holders.find(h => h.id === id)?.full_name || '—';

  async function addClass() {
    if (!newClass.name.trim()) return;
    try { await saveShareClass(tenant, newClass); setNewClass({ name: '', votes_per_share: 1, is_voting: true }); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  async function addTxn() {
    if (!txn.shareholder_id || !txn.shares) { setNotice(tr('Choisir un actionnaire et un nombre d\'actions.', 'Pick a shareholder and share count.')); return; }
    try { await saveShareTxn(tenant, txn); setTxn({ shareholder_id: '', txn_date: today, txn_type: 'issuance', shares: 0, price_per_share: 0, amount: 0 }); setNotice(tr('Mouvement enregistré.', 'Transaction saved.')); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  async function removeTxn(id?: string) { if (!id) return; try { await deleteShareTxn(tenant, id); await load(); } catch (e: any) { setNotice(e?.message); } }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Répartition (ownership) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{tr('Répartition du capital', 'Ownership breakdown')} — {num(totalShares)} {tr('actions émises', 'shares issued')}</div>
        {totalShares === 0 ? <div className="text-sm text-gray-400">{tr('Aucune action émise.', 'No shares issued.')}</div> : (
          <div className="space-y-1.5">
            {Object.entries(holdMap).filter(([, n]) => n !== 0).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
              const pct = totalShares ? (n / totalShares) * 100 : 0;
              return (
                <div key={id} className="flex items-center gap-2 text-sm">
                  <span className="w-40 shrink-0 truncate text-gray-700 dark:text-gray-200">{nameOf(id)}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  <span className="w-28 shrink-0 text-right text-xs text-gray-500">{num(n)} · {pct.toFixed(1)} %</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Catégories d'actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{tr('Catégories d\'actions', 'Share classes')}</div>
        <div className="flex flex-wrap gap-2">
          {classes.map(c => <span key={c.id} className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">{c.name} · {num(c.votes_per_share || 0)} {tr('voix', 'votes')}{c.is_voting ? '' : ` (${tr('sans droit de vote', 'non-voting')})`}</span>)}
          {classes.length === 0 && <span className="text-sm text-gray-400">{tr('Aucune catégorie.', 'No class.')}</span>}
        </div>
        {canEdit && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Nom', 'Name')}<input value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} placeholder={tr('Catégorie A', 'Class A')} className={`mt-1 ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Voix/action', 'Votes/share')}<input type="number" value={newClass.votes_per_share} onChange={e => setNewClass({ ...newClass, votes_per_share: Number(e.target.value) })} className={`mt-1 w-24 ${inputCls}`} /></label>
            <label className="flex items-center gap-1 pb-2 text-xs font-semibold text-gray-500"><input type="checkbox" checked={newClass.is_voting !== false} onChange={e => setNewClass({ ...newClass, is_voting: e.target.checked })} /> {tr('Votante', 'Voting')}</label>
            <button onClick={addClass} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Ajouter', 'Add')}</button>
          </div>
        )}
      </div>

      {/* Mouvements */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{tr('Mouvements d\'actions', 'Share transactions')}</div>
        {canEdit && (
          <div className="mb-3 grid gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/40 sm:grid-cols-7">
            <select value={txn.shareholder_id} onChange={e => setTxn({ ...txn, shareholder_id: e.target.value })} className={`sm:col-span-2 ${inputCls}`}><option value="">{tr('Actionnaire…', 'Shareholder…')}</option>{holders.map(h => <option key={h.id} value={h.id}>{h.full_name}</option>)}</select>
            <select value={txn.txn_type} onChange={e => setTxn({ ...txn, txn_type: e.target.value as any })} className={inputCls}><option value="issuance">{tr('Émission', 'Issuance')}</option><option value="transfer_in">{tr('Entrée', 'Transfer in')}</option><option value="transfer_out">{tr('Sortie', 'Transfer out')}</option><option value="buyback">{tr('Rachat', 'Buyback')}</option></select>
            <input type="date" value={txn.txn_date} onChange={e => setTxn({ ...txn, txn_date: e.target.value })} className={inputCls} />
            <input type="number" placeholder={tr('Actions', 'Shares')} value={txn.shares || ''} onChange={e => setTxn({ ...txn, shares: Number(e.target.value) })} className={`text-right ${inputCls}`} title={tr('Négatif pour une sortie/rachat', 'Negative for transfer out/buyback')} />
            <input type="number" placeholder={tr('$ apport', '$ contribution')} value={txn.amount || ''} onChange={e => setTxn({ ...txn, amount: Number(e.target.value) })} className={`text-right ${inputCls}`} title={tr('Apport en espèces (écriture au capital)', 'Cash contribution (capital entry)')} />
            <button onClick={addTxn} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{tr('Ajouter', 'Add')}</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Date', 'Date')}</th><th>{tr('Actionnaire', 'Shareholder')}</th><th>{tr('Type', 'Type')}</th><th className="text-right">{tr('Actions', 'Shares')}</th><th className="text-right">{tr('Apport', 'Contribution')}</th><th></th></tr></thead>
            <tbody>
              {txns.length === 0 ? <tr><td colSpan={6} className="py-4 text-center text-gray-400">{tr('Aucun mouvement.', 'No transaction.')}</td></tr> :
                txns.slice().reverse().map(t => (
                  <tr key={t.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-1.5 text-gray-500">{t.txn_date}</td>
                    <td>{nameOf(t.shareholder_id)}</td>
                    <td className="text-xs text-gray-500">{({ issuance: tr('Émission', 'Issuance'), transfer_in: tr('Entrée', 'In'), transfer_out: tr('Sortie', 'Out'), buyback: tr('Rachat', 'Buyback') } as any)[t.txn_type || 'issuance']}</td>
                    <td className={`text-right font-semibold ${(Number(t.shares) || 0) < 0 ? 'text-rose-600' : 'text-gray-800 dark:text-gray-100'}`}>{num(t.shares)}</td>
                    <td className="text-right text-gray-500">{(Number(t.amount) || 0) > 0 ? mny(t.amount!) : '—'}{t.gl_entry_id ? ' ✓' : ''}</td>
                    <td className="text-right">{canEdit && <button onClick={() => removeTxn(t.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Dividendes : déclaration + versement ──
function Dividendes({ tenant, tr, canEdit, inputCls, setNotice }: SubProps) {
  const [loading, setLoading] = useState(true);
  const [decls, setDecls] = useState<DividendDeclaration[]>([]);
  const [pays, setPays] = useState<DividendPayment[]>([]);
  const [classes, setClasses] = useState<ShareClass[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<DividendDeclaration>({ declaration_date: today, dividend_type: 'eligible', total_amount: 0, per_share: 0 });
  const [busy, setBusy] = useState(false);
  const [expand, setExpand] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { const [d, s] = await Promise.all([getDividends(tenant), getShares(tenant)]); setDecls(d.declarations || []); setPays(d.payments || []); setClasses(s.classes || []); }
    catch (e: any) { setNotice(e?.message); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  async function declare() {
    if ((Number(form.total_amount) || 0) <= 0 && (Number(form.per_share) || 0) <= 0) { setNotice(tr('Indiquer un montant total OU un montant par action.', 'Enter a total OR a per-share amount.')); return; }
    setBusy(true);
    try { const r: any = await declareDividend(tenant, form); setForm({ declaration_date: today, dividend_type: 'eligible', total_amount: 0, per_share: 0 }); setNotice(tr(`Dividende déclaré : ${r.count} actionnaire(s), ${mny(r.total)}.`, `Dividend declared: ${r.count} shareholder(s), ${mny(r.total)}.`)); await load(); }
    catch (e: any) { setNotice(e?.message); }
    setBusy(false);
  }
  async function pay(id?: string) { if (!id || !confirm(tr('Confirmer le versement (écriture bancaire) ?', 'Confirm payout (bank entry)?'))) return; try { await payDividend(tenant, id); setNotice(tr('Dividende versé.', 'Dividend paid.')); await load(); } catch (e: any) { setNotice(e?.message); } }
  async function cancelDecl(id?: string) { if (!id || !confirm(tr('Annuler cette déclaration ?', 'Cancel this declaration?'))) return; try { await cancelDividend(tenant, id); await load(); } catch (e: any) { setNotice(e?.message); } }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-sm font-bold text-gray-900 dark:text-white">{tr('Déclarer un dividende', 'Declare a dividend')}</div>
          <div className="grid gap-2 sm:grid-cols-6">
            <label className="text-xs font-semibold text-gray-500">{tr('Date', 'Date')}<input type="date" value={form.declaration_date} onChange={e => setForm({ ...form, declaration_date: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Paiement', 'Payment')}<input type="date" value={form.payment_date || ''} onChange={e => setForm({ ...form, payment_date: e.target.value })} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Catégorie', 'Class')}<select value={form.share_class_id || ''} onChange={e => setForm({ ...form, share_class_id: e.target.value || null })} className={`mt-1 w-full ${inputCls}`}><option value="">{tr('Toutes', 'All')}</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Type fiscal', 'Tax type')}<select value={form.dividend_type} onChange={e => setForm({ ...form, dividend_type: e.target.value as any })} className={`mt-1 w-full ${inputCls}`}><option value="eligible">{tr('Déterminé', 'Eligible')}</option><option value="non_eligible">{tr('Ordinaire', 'Non-eligible')}</option><option value="capital">{tr('Capital', 'Capital')}</option></select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Montant total', 'Total amount')}<input type="number" value={form.total_amount || ''} onChange={e => setForm({ ...form, total_amount: Number(e.target.value), per_share: 0 })} className={`mt-1 w-full text-right ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('OU $/action', 'OR $/share')}<input type="number" value={form.per_share || ''} onChange={e => setForm({ ...form, per_share: Number(e.target.value), total_amount: 0 })} className={`mt-1 w-full text-right ${inputCls}`} /></label>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{tr('Réparti au prorata des actions détenues. Écriture : DR Dividendes déclarés / CR Dividendes à payer.', 'Pro-rated by holdings. Entry: DR Declared dividends / CR Dividends payable.')}</span>
            <button onClick={declare} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40">{busy ? <Loader2 size={14} className="inline animate-spin" /> : tr('Déclarer', 'Declare')}</button>
          </div>
        </div>
      )}

      {decls.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune déclaration.', 'No declaration yet.')}</div>
      ) : decls.map(d => {
        const dp = pays.filter(p => p.declaration_id === d.id);
        const STAT: any = { declared: { l: tr('Déclaré', 'Declared'), c: 'bg-amber-100 text-amber-700' }, paid: { l: tr('Versé', 'Paid'), c: 'bg-emerald-100 text-emerald-700' }, cancelled: { l: tr('Annulé', 'Cancelled'), c: 'bg-gray-100 text-gray-500' } };
        return (
          <div key={d.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2"><span className="font-bold text-gray-900 dark:text-white">{mny(d.total_amount || 0)}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STAT[d.status || 'declared'].c}`}>{STAT[d.status || 'declared'].l}</span></div>
                <div className="text-xs text-gray-400">{d.declaration_date} · {num(d.per_share || 0, 4)} $/action · {({ eligible: tr('Déterminé', 'Eligible'), non_eligible: tr('Ordinaire', 'Non-elig.'), capital: tr('Capital', 'Capital') } as any)[d.dividend_type || 'eligible']}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button onClick={() => setExpand(expand === d.id ? null : (d.id || null))} className="font-semibold text-blue-600 hover:underline">{dp.length} {tr('versement(s)', 'payment(s)')}</button>
                {canEdit && d.status === 'declared' && <><button onClick={() => pay(d.id)} className="rounded-lg bg-emerald-600 px-2 py-1 font-semibold text-white hover:bg-emerald-700">{tr('Verser', 'Pay')}</button><button onClick={() => cancelDecl(d.id)} className="text-gray-400 hover:text-red-500">{tr('Annuler', 'Cancel')}</button></>}
              </div>
            </div>
            {expand === d.id && (
              <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-700">
                <table className="w-full text-sm"><tbody>
                  {dp.map(p => <tr key={p.id} className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1 text-gray-700 dark:text-gray-200">{p.shareholder_name}</td><td className="text-right text-gray-500">{num(p.shares || 0)} {tr('act.', 'sh.')}</td><td className="text-right font-semibold">{mny(p.amount || 0)}</td><td className="text-right text-xs text-gray-400">{p.status === 'paid' ? `✓ ${p.paid_date || ''}` : tr('en attente', 'pending')}</td></tr>)}
                </tbody></table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
