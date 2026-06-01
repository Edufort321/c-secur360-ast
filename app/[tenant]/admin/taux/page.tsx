'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Loader2, ShieldCheck, ChevronUp, ChevronDown, Fuel, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

type Rate = { id?: string; code: string; label: string; rate_regular: number; rate_overtime: number; rate_premium: number };
type Setting = { id?: string; category: string; key: string; value: number };
type Item = { id?: string; sku: string; name: string; cost_price: number; sale_price: number };
type ApprovalLevel = {
  id?: string;
  sort_order: number;
  level_name: string;
  max_amount: number;
  approver_label: string;
  color: string;
};
type SurchargeTier = {
  id?: string;
  sort_order: number;
  price_min: number;
  price_max: number | null;   // null = illimité
  surcharge_pct: number;
  applies_to: string;
};

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
  const [approvals, setApprovals] = useState<ApprovalLevel[]>([]);
  const [tiers, setTiers] = useState<SurchargeTier[]>([]);
  const [fuelPrice, setFuelPrice] = useState('');
  const [fetchingFuel, setFetchingFuel] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [r, s, i, a, t, fp] = await Promise.all([
        supabase.from('labor_rates').select('id, code, label, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code'),
        supabase.from('rate_settings').select('id, category, key, value').eq('tenant_id', tenant).order('category'),
        supabase.from('inv_items').select('id, sku, name, cost_price, sale_price').eq('tenant_id', tenant).order('name').limit(200),
        supabase.from('approval_levels').select('*').eq('tenant_id', tenant).order('sort_order'),
        supabase.from('surcharge_fuel_tiers').select('*').eq('tenant_id', tenant).order('sort_order'),
        supabase.from('rate_settings').select('value').eq('tenant_id', tenant).eq('category', 'surcharge_fuel').eq('key', 'prix_litre').maybeSingle(),
      ]);
      setRates((r.data as any) || []);
      setSettings((s.data as any) || []);
      setItems((i.data as any) || []);
      if (a.error) {
        flash(tr('Niveaux d\'approbation : migration 023+024 requise dans Supabase SQL Editor', 'Approval levels: run migration 023+024 in Supabase SQL Editor'));
        setApprovals([]);
      } else {
        setApprovals((a.data as any) || []);
      }
      setTiers((t.data as any) || []);
      if (fp.data?.value) setFuelPrice(String(fp.data.value));
    } catch { /* mode dégradé — pas de connexion DB */ }
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

  // ── Surcharge carburant ────────────────────────────────────────────────
  function addTier() {
    const last = tiers[tiers.length - 1];
    setTiers([...tiers, {
      sort_order: tiers.length,
      price_min: last ? (last.price_max ?? last.price_min + 0.20) : 0,
      price_max: null,
      surcharge_pct: 0,
      applies_to: 'km',
    }]);
  }

  async function saveTiers() {
    setBusy(true);
    try {
      const sorted = tiers.map((t, i) => ({ ...t, sort_order: i }));
      for (const row of sorted) {
        const data = {
          tenant_id: tenant, sort_order: row.sort_order,
          price_min: Number(row.price_min) || 0,
          price_max: row.price_max != null ? Number(row.price_max) : null,
          surcharge_pct: Number(row.surcharge_pct) || 0,
          applies_to: row.applies_to || 'km',
        };
        if (row.id) await supabase.from('surcharge_fuel_tiers').update(data).eq('id', row.id);
        else await supabase.from('surcharge_fuel_tiers').insert(data);
      }
      // Sauvegarder le prix courant
      const price = Number(fuelPrice) || 0;
      const { data: existing } = await supabase.from('rate_settings')
        .select('id').eq('tenant_id', tenant).eq('category', 'surcharge_fuel').eq('key', 'prix_litre').maybeSingle();
      if (existing?.id) {
        await supabase.from('rate_settings').update({ value: price }).eq('id', existing.id);
      } else {
        await supabase.from('rate_settings').insert({ tenant_id: tenant, category: 'surcharge_fuel', key: 'prix_litre', value: price });
      }
      flash(tr('Barème enregistré ✓', 'Surcharge tiers saved ✓'));
      await loadAll();
    } catch { flash(tr('Erreur DB — migration 025 requise', 'DB error — run migration 025')); }
    finally { setBusy(false); }
  }

  async function delTier(idx: number) {
    const row = tiers[idx];
    if (row.id) await supabase.from('surcharge_fuel_tiers').delete().eq('id', row.id);
    setTiers(tiers.filter((_, i) => i !== idx));
  }

  function updTier(idx: number, k: keyof SurchargeTier, v: any) {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [k]: v } : t));
  }

  async function fetchFuelPrice() {
    setFetchingFuel(true);
    try {
      const res = await fetch('/api/energie-prix');
      const data = await res.json();
      if (data.price) {
        setFuelPrice(data.price.toFixed(2));
        flash(tr(`Prix récupéré : ${data.price.toFixed(2)} $/L (${data.region})`, `Price fetched: ${data.price.toFixed(2)} $/L (${data.region})`));
      } else {
        flash(tr(`Impossible de récupérer automatiquement (${data.error}) — entrez manuellement`, `Auto-fetch failed (${data.error}) — enter manually`));
      }
    } catch { flash(tr('Erreur réseau — entrez le prix manuellement', 'Network error — enter price manually')); }
    finally { setFetchingFuel(false); }
  }

  function activeTier(price: number): SurchargeTier | null {
    const sorted = [...tiers].sort((a, b) => a.price_min - b.price_min);
    for (const t of sorted) {
      if (price >= t.price_min && (t.price_max == null || price < t.price_max)) return t;
    }
    return null;
  }

  // ── Niveaux d'approbation ───────────────────────────────────────────────
  function addApproval() {
    const next: ApprovalLevel = {
      sort_order: approvals.length,
      level_name: '',
      max_amount: 0,
      approver_label: '',
      color: 'blue',
    };
    setApprovals([...approvals, next]);
  }

  async function saveApprovals() {
    setBusy(true);
    try {
      // Re-assign sort_order by position
      const sorted = approvals.map((a, i) => ({ ...a, sort_order: i }));
      for (const row of sorted) {
        if (!row.level_name?.trim()) continue;
        const data = {
          tenant_id: tenant,
          sort_order: row.sort_order,
          level_name: row.level_name,
          max_amount: Number(row.max_amount) || 0,
          approver_label: row.approver_label || '',
          color: row.color || 'blue',
        };
        if (row.id) {
          await supabase.from('approval_levels').update(data).eq('id', row.id);
        } else {
          await supabase.from('approval_levels').insert(data);
        }
      }
      flash(tr('Niveaux enregistrés ✓', 'Levels saved ✓'));
      await loadAll();
    } catch (e: any) {
      flash(tr('Erreur DB — vérifier que la migration 023 a été appliquée dans Supabase', 'DB error — check migration 023 was applied in Supabase'));
    } finally { setBusy(false); }
  }

  async function delApproval(idx: number) {
    const row = approvals[idx];
    if (row.id) await supabase.from('approval_levels').delete().eq('id', row.id);
    setApprovals(approvals.filter((_, i) => i !== idx));
  }

  function moveApproval(idx: number, dir: -1 | 1) {
    const arr = [...approvals];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setApprovals(arr);
  }

  function updApproval(idx: number, k: keyof ApprovalLevel, v: any) {
    setApprovals(prev => prev.map((a, i) => i === idx ? { ...a, [k]: v } : a));
  }

  // Calcule quel niveau s'applique à un montant donné
  function levelForAmount(amount: number): ApprovalLevel | null {
    const sorted = [...approvals].sort((a, b) => a.max_amount - b.max_amount);
    for (const lvl of sorted) {
      if (lvl.max_amount === 0 || amount <= lvl.max_amount) return lvl;
    }
    return sorted[sorted.length - 1] || null;
  }

  const COLOR_OPTS = [
    { value: 'green',  label: 'Vert',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'blue',   label: 'Bleu',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'amber',  label: 'Ambre',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'red',    label: 'Rouge',  cls: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'purple', label: 'Mauve',  cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  ];
  const colorCls = (c: string) => COLOR_OPTS.find(o => o.value === c)?.cls || 'bg-gray-100 text-gray-700 border-gray-200';

  const [previewAmount, setPreviewAmount] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/${tenant}/admin`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
              <ArrowLeft size={16} /> {tr('Retour à l\'administration', 'Back to admin')}
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
                        <Td><input type="number" onFocus={e => e.target.select()} className="inp w-24" value={r.rate_regular} onChange={e => upd(setRates, rates, i, 'rate_regular', e.target.value)} /></Td>
                        <Td><input type="number" onFocus={e => e.target.select()} className="inp w-24" value={r.rate_overtime} onChange={e => upd(setRates, rates, i, 'rate_overtime', e.target.value)} /></Td>
                        <Td><input type="number" onFocus={e => e.target.select()} className="inp w-24" value={r.rate_premium} onChange={e => upd(setRates, rates, i, 'rate_premium', e.target.value)} /></Td>
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
                        <Td>
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-24" value={s.value} onChange={e => upd(setSettings, settings, i, 'value', e.target.value)} />
                            <span className="text-xs text-gray-400">$</span>
                          </div>
                        </Td>
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
                        <Td><input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-28" value={it.cost_price} onChange={e => upd(setItems, items, i, 'cost_price', e.target.value)} /></Td>
                        <Td><input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-28" value={it.sale_price} onChange={e => upd(setItems, items, i, 'sale_price', e.target.value)} /></Td>
                        <Td><button onClick={() => delItem(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></Td>
                      </tr>
                    ))}
                    {items.length === 0 && <tr><Td colSpan={5}><span className="text-gray-400">{tr('Catalogue vide.', 'Empty catalog.')}</span></Td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── Surcharge carburant ── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Fuel size={20} className="text-orange-500" />
                  <h2 className="font-bold">{tr('Surcharge carburant (km)', 'Fuel Surcharge (km)')}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={addTier} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <Plus size={15} /> {tr('Palier', 'Tier')}
                  </button>
                  <button onClick={saveTiers} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
                  </button>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {tr(
                  'Définit un pourcentage de surcharge sur les coûts de kilométrage selon le prix du litre d\'essence. Appliqué automatiquement dans la feuille de temps et la facture selon la date des travaux.',
                  'Defines a km cost surcharge percentage based on the fuel price per litre. Applied automatically in timesheets and invoices by work date.'
                )}
              </p>

              {/* Prix courant */}
              <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-500/10">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {tr('Prix courant du litre ($/L)', 'Current fuel price ($/L)')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" step="0.01" min="0"
                      onFocus={e => e.target.select()}
                      className="inp w-28"
                      value={fuelPrice}
                      onChange={e => setFuelPrice(e.target.value)}
                      placeholder="1.65"
                    />
                    <span className="text-sm text-gray-400">$/L</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchFuelPrice}
                    disabled={fetchingFuel}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-60 dark:border-orange-500/30 dark:bg-gray-800 dark:text-orange-300"
                  >
                    {fetchingFuel ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    {tr('Actualiser (NRCan)', 'Refresh (NRCan)')}
                  </button>
                  <a
                    href="https://www.regie-energie.qc.ca/energie/petroliers-gaziers/prix-des-produits-petroliers/"
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <ExternalLink size={14} /> Régie de l'énergie
                  </a>
                </div>
                {fuelPrice && (() => {
                  const price = Number(fuelPrice);
                  const active = activeTier(price);
                  if (!active) return <div className="text-sm text-gray-400">{tr('Aucun palier correspondant', 'No matching tier')}</div>;
                  return (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-1.5 text-sm dark:bg-orange-500/20">
                      <span className="font-semibold text-orange-700 dark:text-orange-300">{active.surcharge_pct}% surcharge</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        {tr('applicable pour', 'applicable for')} {price.toFixed(2)} $/L
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Barème */}
              {tiers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400 dark:border-gray-600">
                  {tr('Aucun palier — ajoute des tranches de prix litre.', 'No tiers — add fuel price ranges.')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                        <th className="px-3 py-2">{tr('Prix min ($/L)', 'Min price ($/L)')}</th>
                        <th className="px-3 py-2">{tr('Prix max ($/L)', 'Max price ($/L)')}</th>
                        <th className="px-3 py-2">{tr('Surcharge %', 'Surcharge %')}</th>
                        <th className="px-3 py-2">{tr('Appliqué à', 'Applies to')}</th>
                        <th className="px-3 py-2">{tr('Actif', 'Active')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((t, i) => {
                        const price = Number(fuelPrice);
                        const isActive = price > 0 && price >= t.price_min && (t.price_max == null || price < t.price_max);
                        return (
                          <tr key={i} className={`border-t border-gray-100 dark:border-gray-700 ${isActive ? 'bg-orange-50 dark:bg-orange-500/10' : ''}`}>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-1">
                                <input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-20" value={t.price_min} onChange={e => updTier(i, 'price_min', +e.target.value)} />
                                <span className="text-xs text-gray-400">$</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-1">
                                <input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-20" value={t.price_max ?? ''} onChange={e => updTier(i, 'price_max', e.target.value === '' ? null : +e.target.value)} placeholder={tr('Illimité', 'Unlimited')} />
                                <span className="text-xs text-gray-400">$</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-1">
                                <input type="number" step="0.1" min="0" max="100" onFocus={e => e.target.select()} className="inp w-16" value={t.surcharge_pct} onChange={e => updTier(i, 'surcharge_pct', +e.target.value)} />
                                <span className="text-xs text-gray-400">%</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">km</td>
                            <td className="px-3 py-1.5">
                              {isActive && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">● {tr('Actif', 'Active')}</span>}
                            </td>
                            <td className="px-2">
                              <button onClick={() => delTier(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Niveaux d'approbation des soumissions ── */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-blue-600" />
                  <h2 className="font-bold">{tr("Niveaux d'approbation des soumissions", 'Quote Approval Levels')}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={addApproval} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <Plus size={15} /> {tr('Ajouter', 'Add')}
                  </button>
                  <button onClick={saveApprovals} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
                  </button>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {tr(
                  'Définit qui peut approuver une soumission selon son montant. Les niveaux sont évalués du plus bas au plus élevé — le premier niveau dont le montant max est ≥ au montant de la soumission s\'applique. Un montant max de 0 signifie « illimité ».',
                  'Defines who can approve a quote by amount. Levels are evaluated lowest to highest — the first level whose max ≥ quote amount applies. Max amount 0 means unlimited.'
                )}
              </p>

              {/* Grille des niveaux */}
              {approvals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-600">
                  {tr('Aucun niveau configuré — ajoute au moins un niveau.', 'No levels configured — add at least one level.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((a, i) => (
                    <div key={i} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${colorCls(a.color)} dark:bg-opacity-10`}>
                      {/* Ordre */}
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveApproval(i, -1)} disabled={i === 0} className="rounded p-0.5 hover:bg-white/40 disabled:opacity-30"><ChevronUp size={14} /></button>
                        <button onClick={() => moveApproval(i, 1)} disabled={i === approvals.length - 1} className="rounded p-0.5 hover:bg-white/40 disabled:opacity-30"><ChevronDown size={14} /></button>
                      </div>

                      {/* Niveau n° */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-bold">
                        {i + 1}
                      </div>

                      {/* Nom du niveau */}
                      <label className="block">
                        <span className="mb-0.5 block text-xs font-semibold opacity-70">{tr('Nom du niveau', 'Level name')}</span>
                        <input className="inp-approval w-36" value={a.level_name} onChange={e => updApproval(i, 'level_name', e.target.value)} placeholder={tr('Ex. Directeur', 'e.g. Director')} />
                      </label>

                      {/* Rôle / titre approbateur */}
                      <label className="block">
                        <span className="mb-0.5 block text-xs font-semibold opacity-70">{tr('Rôle approbateur', 'Approver role')}</span>
                        <input className="inp-approval w-36" value={a.approver_label} onChange={e => updApproval(i, 'approver_label', e.target.value)} placeholder={tr('Ex. Chargé de projet', 'e.g. Project Manager')} />
                      </label>

                      {/* Montant max */}
                      <label className="block">
                        <span className="mb-0.5 block text-xs font-semibold opacity-70">{tr('Montant max ($)', 'Max amount ($)')}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" step="500" min="0" className="inp-approval w-28 text-right" value={a.max_amount}
                            onChange={e => updApproval(i, 'max_amount', +e.target.value)} />
                          {a.max_amount === 0 && <span className="text-xs font-semibold opacity-70">{tr('Illimité', 'Unlimited')}</span>}
                        </div>
                      </label>

                      {/* Couleur */}
                      <label className="block">
                        <span className="mb-0.5 block text-xs font-semibold opacity-70">{tr('Couleur', 'Color')}</span>
                        <select className="inp-approval w-24" value={a.color} onChange={e => updApproval(i, 'color', e.target.value)}>
                          {COLOR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </label>

                      <button onClick={() => delApproval(i)} className="ml-auto rounded-lg p-1.5 hover:bg-white/40"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Visualisation matricielle */}
              {approvals.length > 0 && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
                  <h3 className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-200">{tr('Matrice d\'approbation', 'Approval Matrix')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-gray-500">
                          <th className="px-2 py-1.5">{tr('Plage de montant', 'Amount Range')}</th>
                          <th className="px-2 py-1.5">{tr('Niveau requis', 'Required Level')}</th>
                          <th className="px-2 py-1.5">{tr('Approbateur', 'Approver')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...approvals]
                          .sort((a, b) => a.max_amount === 0 ? 1 : b.max_amount === 0 ? -1 : a.max_amount - b.max_amount)
                          .map((lvl, i, arr) => {
                            const prev = i === 0 ? 0 : (arr[i - 1].max_amount + 1);
                            const range = lvl.max_amount === 0
                              ? `${prev.toLocaleString('fr-CA')} $ et plus`
                              : `${prev.toLocaleString('fr-CA')} $ – ${lvl.max_amount.toLocaleString('fr-CA')} $`;
                            return (
                              <tr key={lvl.level_name + i} className="border-t border-gray-200 dark:border-gray-600">
                                <td className="px-2 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">{range}</td>
                                <td className="px-2 py-2">
                                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorCls(lvl.color)}`}>
                                    {lvl.level_name || '—'}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-gray-600 dark:text-gray-300">{lvl.approver_label || '—'}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Testeur de montant */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{tr('Tester un montant', 'Test an amount')} :</span>
                    <input type="number" step="100" min="0" value={previewAmount}
                      onChange={e => setPreviewAmount(e.target.value)}
                      placeholder="25 000"
                      className="w-32 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800" />
                    {previewAmount && Number(previewAmount) >= 0 && (() => {
                      const lvl = levelForAmount(Number(previewAmount));
                      if (!lvl) return <span className="text-xs text-gray-400">{tr('Aucun niveau applicable', 'No level applies')}</span>;
                      return (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colorCls(lvl.color)}`}>
                          <ShieldCheck size={13} /> {lvl.level_name} — {lvl.approver_label || tr('Approbateur non défini', 'Approver undefined')}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

            </section>

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
