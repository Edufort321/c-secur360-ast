'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

type Rate = { id?: string; code: string; label: string; rate_regular: number; rate_overtime: number; rate_premium: number };
type Setting = { id?: string; category: string; key: string; value: number };
type Item = { id?: string; sku: string; name: string; cost_price: number; sale_price: number };

export default function TauxPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [r, s, i] = await Promise.all([
        supabase.from('labor_rates').select('id, code, label, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code'),
        supabase.from('rate_settings').select('id, category, key, value').eq('tenant_id', tenant).order('category'),
        supabase.from('inv_items').select('id, sku, name, cost_price, sale_price').eq('tenant_id', tenant).order('name').limit(200),
      ]);
      setRates((r.data as any) || []);
      setSettings((s.data as any) || []);
      setItems((i.data as any) || []);
    } catch { /* mode dégradé */ }
    finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [tenant]);

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(null), 2500); };

  async function saveRates() {
    setBusy(true);
    try {
      for (const row of rates) {
        if (!row.code?.trim()) continue;
        const data = {
          tenant_id: tenant, code: row.code, label: row.label || null,
          rate_regular: Number(row.rate_regular) || 0, rate_overtime: Number(row.rate_overtime) || 0,
          rate_premium: Number(row.rate_premium) || 0,
        };
        if (row.id) await supabase.from('labor_rates').update(data).eq('id', row.id);
        else await supabase.from('labor_rates').insert(data);
      }
      flash(tr('Taux enregistrés ✓', 'Rates saved ✓')); await loadAll();
    } catch { flash(tr('Erreur DB', 'DB error')); } finally { setBusy(false); }
  }
  async function delRate(idx: number) {
    const row = rates[idx];
    if (row.id) await supabase.from('labor_rates').delete().eq('id', row.id);
    setRates(rates.filter((_, i) => i !== idx));
  }

  async function saveSettings() {
    setBusy(true);
    try {
      for (const row of settings) {
        if (!row.category?.trim() || !row.key?.trim()) continue;
        const data = { tenant_id: tenant, category: row.category, key: row.key, value: Number(row.value) || 0 };
        if (row.id) await supabase.from('rate_settings').update(data).eq('id', row.id);
        else await supabase.from('rate_settings').insert(data);
      }
      flash(tr('Tarifs enregistrés ✓', 'Settings saved ✓')); await loadAll();
    } catch { flash(tr('Erreur DB', 'DB error')); } finally { setBusy(false); }
  }
  async function delSetting(idx: number) {
    const row = settings[idx];
    if (row.id) await supabase.from('rate_settings').delete().eq('id', row.id);
    setSettings(settings.filter((_, i) => i !== idx));
  }

  async function saveItems() {
    setBusy(true);
    try {
      for (const row of items) {
        if (!row.name?.trim()) continue;
        const data = { tenant_id: tenant, sku: row.sku || null, name: row.name, cost_price: Number(row.cost_price) || 0, sale_price: Number(row.sale_price) || 0 };
        if (row.id) await supabase.from('inv_items').update(data).eq('id', row.id);
        else await supabase.from('inv_items').insert(data);
      }
      flash(tr('Catalogue enregistré ✓', 'Catalog saved ✓')); await loadAll();
    } catch { flash(tr('Erreur DB', 'DB error')); } finally { setBusy(false); }
  }
  async function delItem(idx: number) {
    const row = items[idx];
    if (row.id) await supabase.from('inv_items').delete().eq('id', row.id);
    setItems(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/${tenant}/projects`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
              <ArrowLeft size={16} /> {tr('Retour aux projets', 'Back to projects')}
            </Link>
            <h1 className="text-2xl font-bold">{tr('Taux & catalogue', 'Rates & catalog')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tr('Configure ici tes taux, tarifs et catalogue matériel (tout est vide au départ).', 'Configure your rates, fees and materials catalog here (empty at start).')}</p>
          </div>
        </div>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {/* Taux main-d'œuvre */}
            <Section title={tr("Taux de main-d'œuvre", 'Labor rates')} onAdd={() => setRates([...rates, { code: '', label: '', rate_regular: 0, rate_overtime: 0, rate_premium: 0 }])} onSave={saveRates} busy={busy} tr={tr}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400">
                    <Th>{tr('Code', 'Code')}</Th><Th>{tr('Libellé', 'Label')}</Th><Th>{tr('Régulier', 'Regular')}</Th><Th>{tr('Supp.', 'OT')}</Th><Th>{tr('Majoré', 'Premium')}</Th><Th></Th>
                  </tr></thead>
                  <tbody>
                    {rates.map((r, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        <Td><input className="inp w-24" value={r.code} onChange={e => upd(setRates, rates, i, 'code', e.target.value)} /></Td>
                        <Td><input className="inp" value={r.label} onChange={e => upd(setRates, rates, i, 'label', e.target.value)} /></Td>
                        <Td><input type="number" className="inp w-24" value={r.rate_regular} onChange={e => upd(setRates, rates, i, 'rate_regular', e.target.value)} /></Td>
                        <Td><input type="number" className="inp w-24" value={r.rate_overtime} onChange={e => upd(setRates, rates, i, 'rate_overtime', e.target.value)} /></Td>
                        <Td><input type="number" className="inp w-24" value={r.rate_premium} onChange={e => upd(setRates, rates, i, 'rate_premium', e.target.value)} /></Td>
                        <Td><button onClick={() => delRate(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></Td>
                      </tr>
                    ))}
                    {rates.length === 0 && <tr><Td colSpan={6}><span className="text-gray-400">{tr('Aucun taux. Ajoute une ligne.', 'No rate. Add a row.')}</span></Td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Tarifs divers */}
            <Section title={tr('Tarifs divers (subsistance, km, hébergement)', 'Other rates (per diem, km, lodging)')} onAdd={() => setSettings([...settings, { category: 'subsistance', key: '', value: 0 }])} onSave={saveSettings} busy={busy} tr={tr}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><Th>{tr('Catégorie', 'Category')}</Th><Th>{tr('Clé', 'Key')}</Th><Th>{tr('Valeur', 'Value')}</Th><Th></Th></tr></thead>
                  <tbody>
                    {settings.map((s, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        <Td>
                          <select className="inp w-36" value={s.category} onChange={e => upd(setSettings, settings, i, 'category', e.target.value)}>
                            <option value="subsistance">{tr('Subsistance', 'Per diem')}</option>
                            <option value="km">{tr('Kilométrage', 'Mileage')}</option>
                            <option value="hebergement">{tr('Hébergement', 'Lodging')}</option>
                            <option value="surcharge">{tr('Surcharge', 'Surcharge')}</option>
                          </select>
                        </Td>
                        <Td><input className="inp w-32" value={s.key} onChange={e => upd(setSettings, settings, i, 'key', e.target.value)} /></Td>
                        <Td><input type="number" step="0.01" className="inp w-28" value={s.value} onChange={e => upd(setSettings, settings, i, 'value', e.target.value)} /></Td>
                        <Td><button onClick={() => delSetting(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></Td>
                      </tr>
                    ))}
                    {settings.length === 0 && <tr><Td colSpan={4}><span className="text-gray-400">{tr('Aucun tarif.', 'No rates.')}</span></Td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Catalogue matériel */}
            <Section title={tr('Catalogue matériel', 'Materials catalog')} onAdd={() => setItems([...items, { sku: '', name: '', cost_price: 0, sale_price: 0 }])} onSave={saveItems} busy={busy} tr={tr}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><Th>{tr('Code', 'Code')}</Th><Th>{tr('Désignation', 'Name')}</Th><Th>{tr('Coût', 'Cost')}</Th><Th>{tr('Vente', 'Sale')}</Th><Th></Th></tr></thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        <Td><input className="inp w-28" value={it.sku} onChange={e => upd(setItems, items, i, 'sku', e.target.value)} /></Td>
                        <Td><input className="inp" value={it.name} onChange={e => upd(setItems, items, i, 'name', e.target.value)} /></Td>
                        <Td><input type="number" step="0.01" className="inp w-28" value={it.cost_price} onChange={e => upd(setItems, items, i, 'cost_price', e.target.value)} /></Td>
                        <Td><input type="number" step="0.01" className="inp w-28" value={it.sale_price} onChange={e => upd(setItems, items, i, 'sale_price', e.target.value)} /></Td>
                        <Td><button onClick={() => delItem(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></Td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><Td colSpan={5}><span className="text-gray-400">{tr('Catalogue vide.', 'Empty catalog.')}</span></Td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}
      </div>

      <style jsx>{`
        .inp { border-radius: 0.5rem; border: 1px solid rgb(209 213 219); background: transparent; padding: 0.4rem 0.6rem; font-size: 0.85rem; outline: none; }
        .inp:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
        :global(.dark) .inp { border-color: rgb(75 85 99); }
      `}</style>
    </div>
  );
}

function upd<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, arr: T[], i: number, k: string, v: any) {
  const copy = [...arr] as any[]; copy[i] = { ...copy[i], [k]: v }; setter(copy as T[]);
}
function Th({ children }: { children?: React.ReactNode }) { return <th className="px-2 py-2 font-semibold">{children}</th>; }
function Td({ children, colSpan }: { children?: React.ReactNode; colSpan?: number }) { return <td className="px-2 py-2" colSpan={colSpan}>{children}</td>; }

function Section({ title, onAdd, onSave, busy, tr, children }: { title: string; onAdd: () => void; onSave: () => void; busy: boolean; tr: (f: string, e: string) => string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-bold">{title}</h2>
        <div className="flex gap-2">
          <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={onSave} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {children}
    </section>
  );
}
