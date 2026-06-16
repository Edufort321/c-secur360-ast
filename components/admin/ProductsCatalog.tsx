'use client';

// Catalogue de PRODUITS NUMÉRIQUES (vente) — ex. modules, logiciels, services illimités.
// Fiche : nom, code, classe, prix de vente, coût, photo, description. Alimente soumissions/factures ;
// les ventes se ventilent par CLASSE dans le bilan financier. Stocké dans `items` (article_type='digital').
import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, Save, Package, Search, Tag } from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, getProductSales, type DigitalProduct } from '@/lib/products';

const empty = (): DigitalProduct => ({ name: '', code: '', description: '', product_class: '', sale_price: 0, cost_price: 0, unit: 'u.', photo_url: '', is_unlimited: true });
const money = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function ProductsCatalog({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<DigitalProduct>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const [sales, setSales] = useState<Record<string, { units: number; revenue: number }>>({});
  async function load() {
    setLoading(true);
    try { setRows(await getProducts(tenant)); } catch (e: any) { setNotice('Erreur (migration 194 appliquée ?) : ' + (e?.message || e)); }
    getProductSales(tenant).then(setSales).catch(() => {});
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function edit(p: DigitalProduct) { setForm({ ...p }); setEditingId(p.id || null); }
  function reset() { setForm(empty()); setEditingId(null); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true); setNotice(null);
    try { await saveProduct(tenant, form); setNotice(tr('Produit enregistré ✓', 'Product saved ✓')); reset(); await load(); }
    catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }
  async function del(id: string) { if (!window.confirm(tr('Supprimer ce produit ?', 'Delete this product?'))) return; await deleteProduct(tenant, id); if (editingId === id) reset(); await load(); }

  function onPhoto(file?: File) { if (!file) return; const r = new FileReader(); r.onload = () => setForm(f => ({ ...f, photo_url: String(r.result) })); r.readAsDataURL(file); }

  const classes = useMemo(() => Array.from(new Set(rows.map(r => r.product_class).filter(Boolean))) as string[], [rows]);
  const filtered = rows.filter(r => !q.trim() || [r.name, r.code, r.product_class].some(v => (v || '').toLowerCase().includes(q.trim().toLowerCase())));

  if (loading) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> {tr('Chargement…', 'Loading…')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div><h2 className="flex items-center gap-1.5 font-bold"><Package size={16} /> {tr('Catalogue de produits numériques', 'Digital product catalogue')} <span className="text-xs font-normal text-gray-400">({rows.length})</span></h2>
            <p className="text-xs text-gray-500">{tr('Produits illimités (modules, logiciels, services). Ajoutables en soumission/facture ; revenus ventilés par classe.', 'Unlimited products (modules, software, services). Addable to quotes/invoices; revenue split by class.')}</p></div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Nouveau', 'New')}</button>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-700"><Search size={15} className="text-gray-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder={tr('Rechercher (nom, code, classe)…', 'Search…')} className="w-full bg-transparent text-sm outline-none" /></div>
        {notice && <div className="px-4 pt-2 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40"><tr><th className="px-3 py-2">{tr('Produit', 'Product')}</th><th className="px-3 py-2">{tr('Classe', 'Class')}</th><th className="px-3 py-2 text-right">{tr('Prix', 'Price')}</th><th className="px-3 py-2 text-right">{tr('Ventes', 'Sales')}</th><th className="px-3 py-2"></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">{tr('Aucun produit. Crée ta première fiche produit.', 'No product. Create your first product sheet.')}</td></tr> : filtered.map(p => (
                <tr key={p.id} className={`border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/40 ${editingId === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {p.photo_url ? <img src={p.photo_url} alt="" className="h-8 w-8 rounded object-cover" /> : <div className="grid h-8 w-8 place-items-center rounded bg-gray-100 text-gray-300 dark:bg-gray-700"><Package size={15} /></div>}
                      <div><div className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</div><div className="text-xs text-gray-400">{p.code || '—'}{p.is_unlimited !== false ? ` · ${tr('illimité', 'unlimited')}` : ''}</div></div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{p.product_class ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"><Tag size={11} /> {p.product_class}</span> : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(p.sale_price || 0)}</td>
                  <td className="px-3 py-2 text-right text-xs">{(() => { const sv = sales[p.id || '']; return sv && sv.units > 0 ? <span className="font-semibold text-emerald-700 dark:text-emerald-300">{sv.units} × · {money(sv.revenue)}</span> : <span className="text-gray-400">—</span>; })()}</td>
                  <td className="px-3 py-2 text-right"><button onClick={() => edit(p)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button><button onClick={() => p.id && del(p.id)} className="ml-3 text-red-500 hover:text-red-700"><Trash2 size={14} className="inline" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche produit */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 font-bold">{editingId ? tr('Modifier le produit', 'Edit product') : tr('Nouvelle fiche produit', 'New product sheet')}</h3>
        <div className="space-y-2">
          <label className="block text-xs text-gray-500">{tr('Nom *', 'Name *')}<input className={`mt-1 ${inp}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={tr('Ex. Module Planificateur', 'e.g. Scheduler module')} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-gray-500">{tr('Code', 'Code')}<input className={`mt-1 ${inp}`} value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Classe', 'Class')}<input className={`mt-1 ${inp}`} list="prod-classes" value={form.product_class || ''} onChange={e => setForm(f => ({ ...f, product_class: e.target.value }))} placeholder={tr('Module / Service / Logiciel', 'Module / Service / Software')} /><datalist id="prod-classes">{classes.map((c, i) => <option key={i} value={c} />)}</datalist></label>
            <label className="block text-xs text-gray-500">{tr('Prix de vente ($)', 'Sale price ($)')}<input type="number" step="0.01" className={`mt-1 ${inp}`} value={form.sale_price || 0} onChange={e => setForm(f => ({ ...f, sale_price: Number(e.target.value) || 0 }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Coût ($, optionnel)', 'Cost ($, optional)')}<input type="number" step="0.01" className={`mt-1 ${inp}`} value={form.cost_price || 0} onChange={e => setForm(f => ({ ...f, cost_price: Number(e.target.value) || 0 }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Unité', 'Unit')}<input className={`mt-1 ${inp}`} value={form.unit || ''} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder={tr('u. / mois / licence', 'u. / month / license')} /></label>
          </div>
          <label className="block text-xs text-gray-500">{tr('Description', 'Description')}<textarea rows={2} className={`mt-1 ${inp}`} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" checked={form.is_unlimited !== false} onChange={e => setForm(f => ({ ...f, is_unlimited: e.target.checked }))} /> {tr('Illimité (produit numérique, sans stock)', 'Unlimited (digital product, no stock)')}</label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">📷 {tr('Photo', 'Photo')}<input type="file" accept="image/*" className="hidden" onChange={e => { onPhoto(e.target.files?.[0]); e.currentTarget.value = ''; }} /></label>
            {form.photo_url && <img src={form.photo_url} alt="" className="h-10 w-10 rounded object-cover" />}
            {form.photo_url && <button onClick={() => setForm(f => ({ ...f, photo_url: '' }))} className="text-xs text-red-500 hover:underline">{tr('Retirer', 'Remove')}</button>}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} disabled={saving || !form.name.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}</button>
          {editingId && <button onClick={reset} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>}
        </div>
      </div>
    </div>
  );
}
