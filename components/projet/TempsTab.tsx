'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Car, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

type Entry = {
  id: string; date: string; desc: string; rateCode: string;
  hrsReg: number; hrsSupp: number; hrsMaj: number;
  km: number; materiel: number;
  vehicle_id: string; vehicle_name: string; vehicle_type: 'company' | 'personal' | '';
};

type Vehicle = { id: string; name: string; make: string; model: string; type: 'company' | 'personal'; km_rate_override: number | null };
type SurchargeTier = { price_min: number; price_max: number | null; surcharge_pct: number };

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function TempsTab({ tenant, projectId, initialActuals }: { tenant: string; projectId: string; initialActuals: any }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [rates, setRates] = useState<any[]>([]);
  const [kmRates, setKmRates] = useState<Record<string, number>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [surchargeTiers, setSurchargeTiers] = useState<SurchargeTier[]>([]);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(() => {
    return ((initialActuals?.entries as any[]) || []).map((e: any) => ({
      ...e,
      vehicle_id: e.vehicle_id || '',
      vehicle_name: e.vehicle_name || '',
      vehicle_type: e.vehicle_type || '',
    }));
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: r }, { data: s }, { data: t }, { data: v }] = await Promise.all([
        supabase.from('labor_rates').select('code, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code'),
        supabase.from('rate_settings').select('category, key, value').eq('tenant_id', tenant),
        supabase.from('surcharge_fuel_tiers').select('price_min, price_max, surcharge_pct').eq('tenant_id', tenant).order('sort_order'),
        supabase.from('vehicles').select('id, name, make, model, type, km_rate_override').eq('tenant_id', tenant).eq('active', true).order('type').order('name'),
      ]);
      if (!active) return;
      setRates(r || []);
      const kmMap: Record<string, number> = {};
      (s || []).filter((x: any) => x.category === 'km').forEach((x: any) => { kmMap[x.key] = Number(x.value) || 0; });
      setKmRates(kmMap);
      const fp = (s || []).find((x: any) => x.category === 'surcharge_fuel' && x.key === 'prix_litre');
      setFuelPrice(fp ? Number(fp.value) : 0);
      setSurchargeTiers((t || []) as SurchargeTier[]);
      setVehicles((v || []) as Vehicle[]);
    })();
    return () => { active = false; };
  }, [tenant]);

  const globalKmRate = useMemo(() => Object.values(kmRates)[0] || 0, [kmRates]);

  function surchargePctForPrice(price: number): number {
    if (!price || !surchargeTiers.length) return 0;
    const tier = surchargeTiers.find(t => price >= t.price_min && (t.price_max == null || price < t.price_max));
    return tier ? Number(tier.surcharge_pct) : 0;
  }

  const activeSurchargePct = useMemo(() => surchargePctForPrice(fuelPrice), [fuelPrice, surchargeTiers]);
  const rateMap = useMemo(() => Object.fromEntries((rates || []).map((r: any) => [r.code, r])), [rates]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), [vehicles]);

  function effectiveKmRate(e: Entry): number {
    if (e.vehicle_type === 'company') return 0; // véhicule entreprise = pas de remboursement employé
    const v = vehicleMap[e.vehicle_id];
    if (v?.km_rate_override != null) return Number(v.km_rate_override);
    return globalKmRate;
  }

  const laborCost = (e: Entry) => {
    const r = rateMap[e.rateCode]; if (!r) return 0;
    return (Number(e.hrsReg) || 0) * Number(r.rate_regular)
      + (Number(e.hrsSupp) || 0) * Number(r.rate_overtime)
      + (Number(e.hrsMaj) || 0) * Number(r.rate_premium);
  };
  const kmCost = (e: Entry) => (Number(e.km) || 0) * effectiveKmRate(e);
  const kmSurcharge = (e: Entry) => kmCost(e) * activeSurchargePct / 100;
  const rowCost = (e: Entry) => laborCost(e) + kmCost(e) + kmSurcharge(e) + (Number(e.materiel) || 0);

  const totalKm       = useMemo(() => entries.reduce((s, e) => s + kmCost(e), 0), [entries, globalKmRate, vehicleMap]);
  const totalSurcharge= useMemo(() => entries.reduce((s, e) => s + kmSurcharge(e), 0), [entries, globalKmRate, vehicleMap, activeSurchargePct]);
  const total         = useMemo(() => entries.reduce((s, e) => s + rowCost(e), 0), [entries, rateMap, globalKmRate, vehicleMap, activeSurchargePct]);

  // Stats véhicules
  const kmCompany  = useMemo(() => entries.filter(e => e.vehicle_type === 'company').reduce((s, e) => s + (Number(e.km) || 0), 0), [entries]);
  const kmPersonal = useMemo(() => entries.filter(e => e.vehicle_type === 'personal').reduce((s, e) => s + (Number(e.km) || 0), 0), [entries]);

  const upd = (i: number, k: keyof Entry, v: any) => setEntries(p => p.map((e, j) => j === i ? { ...e, [k]: v } : e));

  function updVehicle(i: number, vehicleId: string) {
    const v = vehicleMap[vehicleId];
    setEntries(p => p.map((e, j) => j === i ? {
      ...e,
      vehicle_id: vehicleId,
      vehicle_name: v ? `${v.make} ${v.model}`.trim() || v.name : '',
      vehicle_type: v ? v.type : '',
    } : e));
  }

  const add = () => setEntries(p => [...p, {
    id: `t_${Date.now()}`, date: new Date().toISOString().slice(0, 10), desc: '',
    rateCode: rates[0]?.code || '', hrsReg: 0, hrsSupp: 0, hrsMaj: 0, km: 0, materiel: 0,
    vehicle_id: '', vehicle_name: '', vehicle_type: '',
  }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const actuals = { entries, total, totalKm, totalSurcharge, kmCompany, kmPersonal, fuelPrice, surchargePct: activeSurchargePct, updatedAt: new Date().toISOString() };
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
      {rates.length === 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun taux — configure « Taux & catalogue ».', 'No rates — set up "Rates & catalog".')}</div>}

      {/* Résumé km véhicules */}
      {(kmCompany > 0 || kmPersonal > 0) && (
        <div className="flex flex-wrap gap-3">
          {kmCompany > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <Building2 size={13} /> {tr('Véhicule entreprise', 'Company vehicle')} : {kmCompany} km {tr('(coût interne)', '(internal cost)')}
            </div>
          )}
          {kmPersonal > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Car size={13} /> {tr('Véhicule personnel', 'Personal vehicle')} : {kmPersonal} km → {money(totalKm)} {tr('remboursé', 'reimbursed')}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <th className="px-2 py-2">{tr('Date', 'Date')}</th>
              <th className="px-2">{tr('Description', 'Description')}</th>
              <th className="px-2">{tr('Taux', 'Rate')}</th>
              <th className="px-2">Rég</th><th className="px-2">Supp</th><th className="px-2">Maj</th>
              <th className="px-2">Km</th>
              <th className="px-2">{tr('Véhicule', 'Vehicle')}</th>
              <th className="px-2">{tr('Matériel $', 'Materials $')}</th>
              <th className="px-2 text-right">$</th><th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input type="date" className="inp w-32" value={e.date} onChange={ev => upd(i, 'date', ev.target.value)} /></td>
                <td className="px-2"><input className="inp w-36" value={e.desc} onChange={ev => upd(i, 'desc', ev.target.value)} /></td>
                <td className="px-2"><select className="inp w-20" value={e.rateCode} onChange={ev => upd(i, 'rateCode', ev.target.value)}>{rates.map((r: any) => <option key={r.code} value={r.code}>{r.code}</option>)}</select></td>
                <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14" value={e.hrsReg} onChange={ev => upd(i, 'hrsReg', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14" value={e.hrsSupp} onChange={ev => upd(i, 'hrsSupp', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14" value={e.hrsMaj} onChange={ev => upd(i, 'hrsMaj', +ev.target.value)} /></td>
                <td className="px-2"><input type="number" onFocus={ev => ev.target.select()} className="inp w-16" value={e.km} onChange={ev => upd(i, 'km', +ev.target.value)} /></td>
                <td className="px-2">
                  <div className="flex items-center gap-1">
                    <select
                      className="inp w-36"
                      value={e.vehicle_id}
                      onChange={ev => updVehicle(i, ev.target.value)}
                    >
                      <option value="">— {tr('Aucun', 'None')} —</option>
                      {vehicles.filter(v => v.type === 'company').length > 0 && (
                        <optgroup label={tr('Entreprise', 'Company')}>
                          {vehicles.filter(v => v.type === 'company').map(v => (
                            <option key={v.id} value={v.id}>{v.name || `${v.make} ${v.model}`.trim()}</option>
                          ))}
                        </optgroup>
                      )}
                      {vehicles.filter(v => v.type === 'personal').length > 0 && (
                        <optgroup label={tr('Personnel autorisé', 'Authorized personal')}>
                          {vehicles.filter(v => v.type === 'personal').map(v => (
                            <option key={v.id} value={v.id}>{v.name || `${v.make} ${v.model}`.trim()}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {e.vehicle_type === 'company' && <Building2 size={13} className="shrink-0 text-blue-500" title={tr('Entreprise — pas de remboursement', 'Company — no reimbursement')} />}
                    {e.vehicle_type === 'personal' && <Car size={13} className="shrink-0 text-emerald-600" title={tr('Personnel — remboursement km', 'Personal — km reimbursement')} />}
                  </div>
                </td>
                <td className="px-2"><input type="number" step="0.01" onFocus={ev => ev.target.select()} className="inp w-24" value={e.materiel} onChange={ev => upd(i, 'materiel', +ev.target.value)} /></td>
                <td className="px-2 text-right font-medium">
                  {e.vehicle_type === 'company' && e.km > 0
                    ? <span className="text-blue-600">{money(rowCost(e))}<span className="ml-1 text-xs text-gray-400">(ent.)</span></span>
                    : money(rowCost(e))
                  }
                </td>
                <td className="px-2"><button onClick={() => setEntries(p => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={11} className="px-2 py-6 text-center text-gray-400">{tr('Aucune entrée. Ajoute une journée travaillée.', 'No entry. Add a worked day.')}</td></tr>}
          </tbody>
          {entries.length > 0 && activeSurchargePct > 0 && (
            <tfoot className="border-t-2 border-gray-200 text-sm dark:border-gray-600">
              <tr className="bg-orange-50 dark:bg-orange-500/10">
                <td colSpan={8} className="px-2 py-1.5 text-right text-xs font-semibold text-orange-700 dark:text-orange-300">
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
