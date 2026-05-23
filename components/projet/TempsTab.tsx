'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

type Entry = { id: string; date: string; desc: string; rateCode: string; hrsReg: number; hrsSupp: number; hrsMaj: number; km: number; materiel: number };
type SurchargeTier = { price_min: number; price_max: number | null; surcharge_pct: number };
const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function TempsTab({ tenant, projectId, initialActuals }: { tenant: string; projectId: string; initialActuals: any }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [rates, setRates] = useState<any[]>([]);
  const [kmRates, setKmRates] = useState<Record<string, number>>({});
  const [surchargeTiers, setSurchargeTiers] = useState<SurchargeTier[]>([]);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(() => (initialActuals?.entries as Entry[]) || []);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: r } = await supabase.from('labor_rates').select('code, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code');
      const { data: s } = await supabase.from('rate_settings').select('category, key, value').eq('tenant_id', tenant);
      const { data: t } = await supabase.from('surcharge_fuel_tiers').select('price_min, price_max, surcharge_pct').eq('tenant_id', tenant).order('sort_order');
      if (!active) return;
      setRates(r || []);
      const kmMap: Record<string, number> = {};
      (s || []).filter((x: any) => x.category === 'km').forEach((x: any) => { kmMap[x.key] = Number(x.value) || 0; });
      setKmRates(kmMap);
      const fp = (s || []).find((x: any) => x.category === 'surcharge_fuel' && x.key === 'prix_litre');
      setFuelPrice(fp ? Number(fp.value) : 0);
      setSurchargeTiers((t || []) as SurchargeTier[]);
    })();
    return () => { active = false; };
  }, [tenant]);

  const kmRate = useMemo(() => Object.values(kmRates)[0] || 0, [kmRates]);

  function surchargePctForPrice(price: number): number {
    if (!price || !surchargeTiers.length) return 0;
    const tier = surchargeTiers.find(t => price >= t.price_min && (t.price_max == null || price < t.price_max));
    return tier ? Number(tier.surcharge_pct) : 0;
  }

  const activeSurchargePct = useMemo(() => surchargePctForPrice(fuelPrice), [fuelPrice, surchargeTiers]);

  const rateMap = useMemo(() => Object.fromEntries((rates || []).map((r: any) => [r.code, r])), [rates]);
  const laborCost = (e: Entry) => {
    const r = rateMap[e.rateCode]; if (!r) return 0;
    return (Number(e.hrsReg) || 0) * Number(r.rate_regular) + (Number(e.hrsSupp) || 0) * Number(r.rate_overtime) + (Number(e.hrsMaj) || 0) * Number(r.rate_premium);
  };
  const kmCost = (e: Entry) => (Number(e.km) || 0) * kmRate;
  const kmSurcharge = (e: Entry) => kmCost(e) * activeSurchargePct / 100;
  const rowCost = (e: Entry) => laborCost(e) + kmCost(e) + kmSurcharge(e) + (Number(e.materiel) || 0);
  const totalKm = useMemo(() => entries.reduce((s, e) => s + kmCost(e), 0), [entries, kmRate]);
  const totalSurcharge = useMemo(() => entries.reduce((s, e) => s + kmSurcharge(e), 0), [entries, kmRate, activeSurchargePct]);
  const total = useMemo(() => entries.reduce((s, e) => s + rowCost(e), 0), [entries, rateMap, kmRate, activeSurchargePct]);

  const upd = (i: number, k: keyof Entry, v: any) => setEntries(p => p.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const add = () => setEntries(p => [...p, { id: `t_${Date.now()}`, date: new Date().toISOString().slice(0, 10), desc: '', rateCode: rates[0]?.code || '', hrsReg: 0, hrsSupp: 0, hrsMaj: 0, km: 0, materiel: 0 }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const actuals = { entries, total, totalKm, totalSurcharge, fuelPrice, surchargePct: activeSurchargePct, updatedAt: new Date().toISOString() };
      const { error } = await supabase.from('projects').update({ actuals }).eq('id', projectId).eq('tenant_id', tenant);
      if (error) throw error;
      setNotice(tr('Feuille de temps enregistrée ✓', 'Timesheet saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB') + ' — migration 015 exécutée ?'); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{tr('Coût réel', 'Actual cost')} : <span className="text-blue-600 dark:text-blue-400">{money(total)}</span></div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Entrée', 'Entry')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}
      {rates.length === 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun taux — configure « Taux & catalogue ».', 'No rates — set up “Rates & catalog”.')}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="px-2 py-2">{tr('Date', 'Date')}</th><th className="px-2">{tr('Description', 'Description')}</th><th className="px-2">{tr('Taux', 'Rate')}</th>
            <th className="px-2">Rég</th><th className="px-2">Supp</th><th className="px-2">Maj</th><th className="px-2">Km</th><th className="px-2">{tr('Matériel $', 'Materials $')}</th>
            <th className="px-2 text-right">$</th><th></th>
          </tr></thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input type="date" className="inp w-32" value={e.date} onChange={ev => upd(i, 'date', ev.target.value)} /></td>
                <td className="px-2"><input className="inp w-40" value={e.desc} onChange={ev => upd(i, 'desc', ev.target.value)} /></td>
                <td className="px-2"><select className="inp w-20" value={e.rateCode} onChange={ev => upd(i, 'rateCode', ev.target.value)}>{rates.map((r: any) => <option key={r.code} value={r.code}>{r.code}</option>)}</select></td>
                <td className="px-2"><input type="number" className="inp w-14" value={e.hrsReg} onChange={ev => upd(i, 'hrsReg', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" className="inp w-14" value={e.hrsSupp} onChange={ev => upd(i, 'hrsSupp', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" className="inp w-14" value={e.hrsMaj} onChange={ev => upd(i, 'hrsMaj', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" className="inp w-16" value={e.km} onChange={ev => upd(i, 'km', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" step="0.01" className="inp w-24" value={e.materiel} onChange={ev => upd(i, 'materiel', +ev.target.value)} /></td>
                <td className="px-2 text-right font-medium">{money(rowCost(e))}</td>
                <td className="px-2"><button onClick={() => setEntries(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={10} className="px-2 py-6 text-center text-gray-400">{tr('Aucune entrée. Ajoute une journée travaillée.', 'No entry. Add a worked day.')}</td></tr>}
          </tbody>
          {entries.length > 0 && activeSurchargePct > 0 && (
            <tfoot className="border-t-2 border-gray-200 text-sm dark:border-gray-600">
              <tr className="bg-orange-50 dark:bg-orange-500/10">
                <td colSpan={7} className="px-2 py-1.5 text-right text-xs font-semibold text-orange-700 dark:text-orange-300">
                  {tr(`Surcharge carburant ${activeSurchargePct}% sur km (${fuelPrice.toFixed(2)} $/L)`, `Fuel surcharge ${activeSurchargePct}% on km (${fuelPrice.toFixed(2)} $/L)`)}
                </td>
                <td className="px-2 py-1.5 text-right font-bold tabular-nums text-orange-700 dark:text-orange-300">{money(totalSurcharge)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {activeSurchargePct > 0 && entries.some(e => e.km > 0) && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
          <strong>Surcharge carburant :</strong> {activeSurchargePct}% sur {money(totalKm)} km = <strong>{money(totalSurcharge)}</strong>
          {tr(` — prix courant ${fuelPrice.toFixed(2)} $/L`, ` — current price ${fuelPrice.toFixed(2)} $/L`)}
        </div>
      )}

      <style jsx>{`
        .inp { border-radius: 0.45rem; border: 1px solid rgb(209 213 219); background: transparent; padding: 0.3rem 0.5rem; font-size: 0.8rem; outline: none; }
        .inp:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 2px rgb(37 99 235 / 0.15); }
        :global(.dark) .inp { border-color: rgb(75 85 99); }
      `}</style>
    </div>
  );
}
