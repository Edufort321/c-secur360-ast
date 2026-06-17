'use client';
// Registre des immobilisations (#livre) : biens de l'entreprise (ordinateur, mobilier, équipement…)
// + comptabilisation à l'actif (DR 1500 Immobilisations / CR 1000 Banque ou 2000 Fournisseurs).
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Boxes, Check, Download } from 'lucide-react';
import { getAssets, saveAsset, deleteAsset, assetsBookValue, annualDepreciation, ASSET_CATEGORIES, type CompanyAsset } from '@/lib/assets';
import { downloadCsv, type CsvColumn } from '@/lib/csv';
import { getAccounts, createEntry } from '@/lib/accounting';

type Tr = (f: string, e: string) => string;
const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const blank = (): CompanyAsset => ({ name: '', category: 'Informatique', acquisition_date: new Date().toISOString().slice(0, 10), cost: 0, salvage_value: 0, status: 'active' });

export function AssetsModule({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CompanyAsset[]>([]);
  const [edit, setEdit] = useState<CompanyAsset | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  async function load() { setLoading(true); try { setRows(await getAssets(tenant)); } catch (e: any) { setNotice('Erreur (migration 206 ?) : ' + (e?.message || e)); } setLoading(false); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const bookValue = assetsBookValue(rows);
  const annualDep = rows.filter(a => a.status !== 'disposed').reduce((s, a) => s + annualDepreciation(a), 0);

  async function save() {
    if (!edit?.name.trim()) { setNotice(tr('Nom du bien requis.', 'Asset name required.')); return; }
    try { await saveAsset(tenant, edit); setEdit(null); setNotice(tr('Bien enregistré.', 'Asset saved.')); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  async function remove(id?: string) { if (!id || !confirm(tr('Supprimer ce bien ?', 'Delete this asset?'))) return; try { await deleteAsset(tenant, id); await load(); } catch (e: any) { setNotice(e?.message); } }

  // Comptabilise l'acquisition : DR 1500 Immobilisations / CR 1000 Banque (payé) ou 2000 Fournisseurs (à payer).
  async function post(a: CompanyAsset, paid: boolean) {
    if (!a.id) return; setPosting(a.id); setNotice(null);
    try {
      const accs = await getAccounts(tenant); const m: Record<string, string> = {}; accs.forEach(x => m[x.code] = x.id);
      if (!m['1500'] || !m['1000']) { setNotice(tr('Plan comptable absent — initialisez la comptabilité (migration 085).', 'Chart of accounts missing — initialize accounting (migration 085).')); setPosting(null); return; }
      const creditAcc = paid ? m['1000'] : (m['2000'] || m['1000']);
      const entryId = await createEntry(tenant, {
        entry_date: a.acquisition_date || new Date().toISOString().slice(0, 10),
        description: `Acquisition immobilisation — ${a.name}`, journal_code: paid ? 'BNK' : 'ACH',
        source_type: 'asset', source_id: a.id,
        lines: [{ account_id: m['1500'], debit: Number(a.cost) || 0, credit: 0, description: a.name }, { account_id: creditAcc, debit: 0, credit: Number(a.cost) || 0, description: paid ? 'Banque' : 'Fournisseurs à payer' }],
      });
      await saveAsset(tenant, { ...a, gl_entry_id: entryId });
      setNotice(tr('Bien comptabilisé à l\'actif (1500).', 'Asset posted to the books (1500).')); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); } finally { setPosting(null); }
  }

  function exportCsv() {
    const cols: CsvColumn<CompanyAsset>[] = [
      { key: 'name', label: tr('Bien', 'Asset') },
      { key: 'category', label: tr('Catégorie', 'Category') },
      { key: 'acquisition_date', label: tr('Acquis', 'Acquired'), type: 'date' },
      { key: 'cost', label: tr('Coût', 'Cost'), type: 'money' },
      { key: 'id', label: tr('Valeur comptable', 'Book value'), map: (_v, a) => assetsBookValue([a]), type: 'money' },
      { key: 'id', label: tr('Amort. annuel', 'Annual deprec.'), map: (_v, a) => (a.status === 'disposed' ? 0 : annualDepreciation(a)), type: 'money' },
      { key: 'status', label: tr('Statut', 'Status'), map: v => (v === 'disposed' ? tr('Cédé', 'Disposed') : tr('Actif', 'Active')) },
      { key: 'gl_entry_id', label: tr('Comptabilisé', 'Posted'), map: v => (v ? tr('Oui (1500)', 'Yes (1500)') : tr('Non', 'No')) },
    ];
    downloadCsv(`immobilisations-${new Date().toISOString().slice(0, 10)}.csv`, rows, cols);
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20">{notice}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"><div className="text-[11px] font-semibold uppercase text-blue-500">{tr('Valeur des biens', 'Asset value')}</div><div className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{mny(bookValue)}</div></div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-[11px] font-semibold uppercase text-gray-400">{tr('Amort. annuel', 'Annual deprec.')}</div><div className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{mny(annualDep)}</div></div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-[11px] font-semibold uppercase text-gray-400">{tr('Biens actifs', 'Active assets')}</div><div className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{rows.filter(a => a.status !== 'disposed').length}</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canEdit && !edit && <button onClick={() => setEdit(blank())} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={15} /> {tr('Nouveau bien', 'New asset')}</button>}
        {rows.length > 0 && <button onClick={exportCsv} className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={14} /> {tr('Exporter CSV', 'Export CSV')}</button>}
      </div>

      {edit && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Nom du bien', 'Asset name')}<input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} placeholder={tr('Ex. MacBook Pro 14"', 'e.g. MacBook Pro 14"')} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Catégorie', 'Category')}<select value={edit.category || ''} onChange={e => setEdit({ ...edit, category: e.target.value })} className={`mt-1 w-full ${inp}`}>{ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Date d\'acquisition', 'Acquisition date')}<input type="date" value={edit.acquisition_date} onChange={e => setEdit({ ...edit, acquisition_date: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Coût ($)', 'Cost ($)')}<input type="number" step="0.01" value={edit.cost} onChange={e => setEdit({ ...edit, cost: Number(e.target.value) || 0 })} className={`mt-1 w-full text-right ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Fournisseur', 'Supplier')}<input value={edit.supplier || ''} onChange={e => setEdit({ ...edit, supplier: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('N° de série', 'Serial #')}<input value={edit.serial_number || ''} onChange={e => setEdit({ ...edit, serial_number: e.target.value })} className={`mt-1 w-full ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Durée de vie (ans)', 'Useful life (yrs)')}<input type="number" step="0.5" value={edit.useful_life_years ?? ''} onChange={e => setEdit({ ...edit, useful_life_years: e.target.value === '' ? null : Number(e.target.value) })} placeholder={tr('ex. 5', 'e.g. 5')} className={`mt-1 w-full text-right ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Valeur résiduelle ($)', 'Salvage value ($)')}<input type="number" step="0.01" value={edit.salvage_value || 0} onChange={e => setEdit({ ...edit, salvage_value: Number(e.target.value) || 0 })} className={`mt-1 w-full text-right ${inp}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Statut', 'Status')}<select value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as any })} className={`mt-1 w-full ${inp}`}><option value="active">{tr('Actif', 'Active')}</option><option value="disposed">{tr('Cédé / disposé', 'Disposed')}</option></select></label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEdit(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
            <button onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucun bien enregistré.', 'No asset registered yet.')}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full min-w-[760px] text-sm [&_td]:whitespace-nowrap [&_td]:py-2">
            <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-700"><th className="px-3 py-2">{tr('Bien', 'Asset')}</th><th>{tr('Catégorie', 'Category')}</th><th>{tr('Acquis', 'Acquired')}</th><th className="text-right">{tr('Coût', 'Cost')}</th><th>{tr('Livre', 'Books')}</th><th></th></tr></thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30">
                  <td className="px-3 font-semibold text-gray-800 dark:text-gray-100">{a.name}{a.status === 'disposed' ? ` · ${tr('cédé', 'disposed')}` : ''}</td>
                  <td className="text-gray-500">{a.category || '—'}</td>
                  <td className="text-xs text-gray-500">{a.acquisition_date}</td>
                  <td className="text-right font-semibold">{mny(a.cost)}</td>
                  <td>{a.gl_entry_id ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check size={13} /> 1500</span> : <span className="text-gray-300">{tr('non', 'no')}</span>}</td>
                  <td className="px-2 text-right">
                    {canEdit && (
                      <span className="flex justify-end gap-2 text-xs">
                        {!a.gl_entry_id && <>
                          <button onClick={() => post(a, true)} disabled={posting === a.id} className="font-semibold text-indigo-600 hover:underline disabled:opacity-40" title={tr('DR 1500 / CR Banque', 'DR 1500 / CR Bank')}>{posting === a.id ? <Loader2 size={12} className="inline animate-spin" /> : tr('Comptabiliser (payé)', 'Post (paid)')}</button>
                          <button onClick={() => post(a, false)} disabled={posting === a.id} className="text-gray-500 hover:underline disabled:opacity-40" title={tr('DR 1500 / CR Fournisseurs', 'DR 1500 / CR Payables')}>{tr('(à payer)', '(payable)')}</button>
                        </>}
                        <button onClick={() => setEdit(a)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                        <button onClick={() => remove(a.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
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
