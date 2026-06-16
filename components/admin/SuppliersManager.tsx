'use client';

// Répertoire FOURNISSEURS (achats) — pendant du répertoire clients. Table `suppliers` (migration 193).
// Alimente les bons de commande (sélection du fournisseur) et la comptabilité fournisseurs.
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, Truck, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SRow = { id?: string; name: string; contact_name: string; email: string; phone: string; address: string; city: string; province: string; postal_code: string; account_no: string; payment_terms: string; notes: string; active: boolean };
const empty = (): SRow => ({ name: '', contact_name: '', email: '', phone: '', address: '', city: '', province: 'QC', postal_code: '', account_no: '', payment_terms: '', notes: '', active: true });
const PROVINCES = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'YT', 'NU'];

export function SuppliersManager({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<SRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState<SRow>(empty());
  const [q, setQ] = useState('');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*').eq('tenant_id', tenant).order('name');
    if (error) setNotice('Erreur (migration 193 appliquée ?) : ' + error.message);
    setRows((data as SRow[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function select(i: number) { setSelected(i); setForm({ ...rows[i] }); }
  function deselect() { setSelected(null); setForm(empty()); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true); setNotice(null);
    const full: any = { tenant_id: tenant, ...form, updated_at: new Date().toISOString() };
    delete full.id;
    const attempt = (p: any) => form.id ? supabase.from('suppliers').update(p).eq('id', form.id) : supabase.from('suppliers').insert(p);
    let res: any = await attempt(full); let guard = 0;
    while (res.error && guard < 15) {
      const m = (res.error.message || '').match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
      const col = m ? (m[1] || m[2] || m[3]) : null;
      if (col && col in full && col !== 'name' && col !== 'tenant_id') { delete full[col]; res = await attempt(full); guard++; } else break;
    }
    if (res.error) { setNotice('Erreur : ' + res.error.message); setSaving(false); return; }
    setNotice(tr('Fournisseur enregistré ✓', 'Supplier saved ✓')); deselect(); load(); setSaving(false);
  }
  async function del(id: string) { if (!window.confirm(tr('Supprimer ce fournisseur ?', 'Delete this supplier?'))) return; await supabase.from('suppliers').delete().eq('id', id); deselect(); load(); }

  const filtered = rows.map((r, i) => ({ r, i })).filter(({ r }) => !q.trim() || [r.name, r.contact_name, r.city, r.email].some(v => (v || '').toLowerCase().includes(q.trim().toLowerCase())));

  if (loading) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> {tr('Chargement…', 'Loading…')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div><h2 className="flex items-center gap-1.5 font-bold"><Truck size={16} /> {tr('Répertoire fournisseurs', 'Supplier directory')} <span className="text-xs font-normal text-gray-400">({rows.length})</span></h2>
            <p className="text-xs text-gray-500">{tr('Sélectionnable dans les bons de commande et la comptabilité fournisseurs.', 'Selectable in purchase orders and accounts payable.')}</p></div>
          <button onClick={deselect} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Nouveau', 'New')}</button>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-700">
          <Search size={15} className="text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={tr('Rechercher (nom, contact, ville)…', 'Search (name, contact, city)…')} className="w-full bg-transparent text-sm outline-none" />
        </div>
        {notice && <div className="px-4 pt-2 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {filtered.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">{tr('Aucun fournisseur.', 'No supplier.')}</p> : filtered.map(({ r, i }) => (
            <button key={r.id || i} onClick={() => select(i)} className={`flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 ${selected === i ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <div className="min-w-0">
                <div className="truncate font-semibold text-gray-900 dark:text-gray-100">{r.name}{r.active === false ? <span className="ml-2 text-[10px] text-gray-400">({tr('inactif', 'inactive')})</span> : ''}</div>
                <div className="truncate text-xs text-gray-500">{[r.contact_name, r.city, r.email].filter(Boolean).join(' · ')}</div>
              </div>
              {r.payment_terms && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{r.payment_terms}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 font-bold">{selected === null ? tr('Nouveau fournisseur', 'New supplier') : tr('Modifier', 'Edit')}</h3>
        <div className="space-y-2">
          <label className="block text-xs text-gray-500">{tr('Nom *', 'Name *')}<input className={`mt-1 ${inp}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-gray-500">{tr('Contact', 'Contact')}<input className={`mt-1 ${inp}`} value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Téléphone', 'Phone')}<input className={`mt-1 ${inp}`} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500 col-span-2">{tr('Courriel', 'Email')}<input type="email" className={`mt-1 ${inp}`} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500 col-span-2">{tr('Adresse', 'Address')}<input className={`mt-1 ${inp}`} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Ville', 'City')}<input className={`mt-1 ${inp}`} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500">{tr('Province', 'Province')}<select className={`mt-1 ${inp}`} value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
            <label className="block text-xs text-gray-500">{tr('Code postal', 'Postal code')}<input className={`mt-1 ${inp}`} value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500">{tr('N° de compte', 'Account #')}<input className={`mt-1 ${inp}`} value={form.account_no} onChange={e => setForm(f => ({ ...f, account_no: e.target.value }))} /></label>
            <label className="block text-xs text-gray-500 col-span-2">{tr('Conditions de paiement', 'Payment terms')}<input className={`mt-1 ${inp}`} value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} placeholder={tr('ex. net 30', 'e.g. net 30')} /></label>
          </div>
          <label className="block text-xs text-gray-500">{tr('Notes', 'Notes')}<textarea rows={2} className={`mt-1 ${inp}`} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> {tr('Actif', 'Active')}</label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} disabled={saving || !form.name.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}</button>
          {form.id && <button onClick={() => del(form.id!)} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={14} className="inline" /> {tr('Supprimer', 'Delete')}</button>}
          {selected !== null && <button onClick={deselect} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>}
        </div>
      </div>
    </div>
  );
}
