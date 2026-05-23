'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// ===== Types =====
type LaborLine = { id?: string; desc?: string; nbTech: number; hrsReg: number; hrsSupp: number; hrsMaj: number };
type VoyLine = { id: string; desc: string; nbTech: number; km: number; type: string };
type SubLine = { id: string; desc: string; nbTech: number; h5: number; h12: number; h15: number; nuitee: number };
type HebLine = { id: string; desc: string; nbTech: number; nuits: number };
type MatLine = { id: string; desc: string; qte: number; prixUnitaire: number };
type Item = {
  id: string; nom: string; tauxType: string;
  bureau: { prepa: LaborLine; gestion: LaborLine; redaction: LaborLine };
  chantier: LaborLine[]; voyagement: VoyLine[]; subsistance: SubLine[]; hebergement: HebLine[]; materiaux: MatLine[];
  prixSoumissionne: number | null; open?: boolean;
};

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const emptyLabor = (): LaborLine => ({ nbTech: 0, hrsReg: 0, hrsSupp: 0, hrsMaj: 0 });
const newItem = (n: number, tauxType: string): Item => ({
  id: `it_${Date.now()}_${n}`, nom: `Item ${n}`, tauxType,
  bureau: { prepa: emptyLabor(), gestion: emptyLabor(), redaction: emptyLabor() },
  chantier: [], voyagement: [], subsistance: [], hebergement: [], materiaux: [], prixSoumissionne: null, open: true,
});

const DEF_SUB = { h5: 0, h12: 0, h15: 0, nuitee: 0 };
const DEF_KM: Record<string, number> = {};
const DEF_HEB = 0;

// ===== Composant principal =====
export function SoumissionTab({ tenant, projectId, initialEstimate }: { tenant: string; projectId: string; initialEstimate: any }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [rates, setRates] = useState<any[]>([]);
  const [sub, setSub] = useState(DEF_SUB);
  const [km, setKm] = useState<Record<string, number>>(DEF_KM);
  const [heb, setHeb] = useState(DEF_HEB);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>(() => (initialEstimate?.items as Item[]) || []);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: r } = await supabase.from('labor_rates').select('code, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code');
      const { data: s } = await supabase.from('rate_settings').select('category, key, value').eq('tenant_id', tenant);
      const { data: c } = await supabase.from('inv_items').select('sku, name, sale_price').eq('tenant_id', tenant).order('name').limit(500);
      if (!active) return;
      setRates(r || []);
      const get = (cat: string, key: string, def: number) => { const row = (s || []).find((x: any) => x.category === cat && x.key === key); return row ? Number(row.value) : def; };
      setSub({ h5: get('subsistance', 'h5', DEF_SUB.h5), h12: get('subsistance', 'h12', DEF_SUB.h12), h15: get('subsistance', 'h15', DEF_SUB.h15), nuitee: get('subsistance', 'nuitee', DEF_SUB.nuitee) });
      const kmMap: Record<string, number> = {};
      (s || []).filter((x: any) => x.category === 'km').forEach((x: any) => { kmMap[x.key] = Number(x.value) || 0; });
      setKm(kmMap);
      setHeb(get('hebergement', 'vendant', DEF_HEB));
      setCatalog(c || []);
    })();
    return () => { active = false; };
  }, [tenant]);

  const rateMap = useMemo(() => Object.fromEntries((rates || []).map((r: any) => [r.code, r])), [rates]);
  const codes = (rates || []).map((r: any) => r.code);

  // ===== Calculs =====
  const laborCost = (l: LaborLine, code: string) => {
    const r: any = rateMap[code]; if (!r) return 0;
    return (Number(l.nbTech) || 0) * ((Number(l.hrsReg) || 0) * Number(r.rate_regular) + (Number(l.hrsSupp) || 0) * Number(r.rate_overtime) + (Number(l.hrsMaj) || 0) * Number(r.rate_premium));
  };
  const bureauTotal = (it: Item) => laborCost(it.bureau.prepa, it.tauxType) + laborCost(it.bureau.gestion, it.tauxType) + laborCost(it.bureau.redaction, it.tauxType);
  const chantierTotal = (it: Item) => it.chantier.reduce((s, l) => s + laborCost(l, it.tauxType), 0);
  const voyCost = (l: VoyLine) => (Number(l.nbTech) || 0) * (Number(l.km) || 0) * (km[l.type] ?? DEF_KM.camion);
  const subCost = (l: SubLine) => (Number(l.nbTech) || 0) * ((Number(l.h5) || 0) * sub.h5 + (Number(l.h12) || 0) * sub.h12 + (Number(l.h15) || 0) * sub.h15 + (Number(l.nuitee) || 0) * sub.nuitee);
  const hebCost = (l: HebLine) => (Number(l.nbTech) || 0) * (Number(l.nuits) || 0) * heb;
  const matCost = (l: MatLine) => (Number(l.qte) || 0) * (Number(l.prixUnitaire) || 0);

  const itemBreakdown = (it: Item) => ({
    bureau: bureauTotal(it),
    chantier: chantierTotal(it),
    voyagement: it.voyagement.reduce((s, l) => s + voyCost(l), 0),
    subsistance: it.subsistance.reduce((s, l) => s + subCost(l), 0),
    hebergement: it.hebergement.reduce((s, l) => s + hebCost(l), 0),
    materiaux: it.materiaux.reduce((s, l) => s + matCost(l), 0),
  });
  const itemSomme = (it: Item) => { const b = itemBreakdown(it); return b.bureau + b.chantier + b.voyagement + b.subsistance + b.hebergement + b.materiaux; };
  const itemFinal = (it: Item) => (it.prixSoumissionne != null ? it.prixSoumissionne : itemSomme(it));
  const grand = useMemo(() => items.reduce((s, it) => s + itemFinal(it), 0), [items, rateMap, sub, km, heb]);

  // Synthèse par type (somme calculée, pas prix soumissionné)
  const typeTotals = useMemo(() => {
    const acc = { bureau: 0, chantier: 0, voyagement: 0, subsistance: 0, hebergement: 0, materiaux: 0 };
    items.forEach(it => {
      const b = itemBreakdown(it);
      acc.bureau += b.bureau; acc.chantier += b.chantier; acc.voyagement += b.voyagement;
      acc.subsistance += b.subsistance; acc.hebergement += b.hebergement; acc.materiaux += b.materiaux;
    });
    return acc;
  }, [items, rateMap, sub, km, heb]);
  const typeTotalSum = Object.values(typeTotals).reduce((a, b) => a + b, 0);

  // ===== Mutations =====
  const upd = (fn: (draft: Item[]) => void) => setItems(prev => { const c = JSON.parse(JSON.stringify(prev)) as Item[]; fn(c); return c; });
  const addItem = () => setItems(prev => [...prev, newItem(prev.length + 1, codes[0] || 'IT1')]);
  const lid = () => `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const estimate = { items, total: grand, updatedAt: new Date().toISOString() };
      const { error } = await supabase.from('projects').update({ estimate }).eq('id', projectId).eq('tenant_id', tenant);
      if (error) throw error;
      setNotice(tr('Soumission enregistrée ✓', 'Quote saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  // ===== Sous-rendus =====
  const laborRow = (l: LaborLine, code: string, onCh: (k: keyof LaborLine, v: any) => void, label?: string, onDel?: () => void) => (
    <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td className="px-2 py-1">{label
        ? <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
        : <input className="inp w-36" value={l.desc || ''} onChange={e => onCh('desc', e.target.value)} />}
      </td>
      <td className="px-2"><input type="number" min="0" onFocus={e => e.target.select()} className="inp w-14 text-right" value={l.nbTech} onChange={e => onCh('nbTech', +e.target.value)} /></td>
      <td className="px-2"><input type="number" min="0" step="0.5" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.hrsReg} onChange={e => onCh('hrsReg', +e.target.value)} /></td>
      <td className="px-2"><input type="number" min="0" step="0.5" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.hrsSupp} onChange={e => onCh('hrsSupp', +e.target.value)} /></td>
      <td className="px-2"><input type="number" min="0" step="0.5" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.hrsMaj} onChange={e => onCh('hrsMaj', +e.target.value)} /></td>
      <td className="px-2 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(laborCost(l, code))}</td>
      <td className="px-1 text-center">{onDel && <button onClick={onDel} className="rounded p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}</td>
    </tr>
  );

  const laborHead = (
    <thead className="bg-gray-50 dark:bg-gray-700/50">
      <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
        <th className="px-2 py-2">{tr('Description', 'Description')}</th>
        <th className="px-2 py-2 text-right">Tech</th>
        <th className="px-2 py-2 text-right">Rég</th>
        <th className="px-2 py-2 text-right">Supp</th>
        <th className="px-2 py-2 text-right">Maj</th>
        <th className="px-2 py-2 text-right">Montant</th>
        <th></th>
      </tr>
    </thead>
  );

  const SectionHeader = ({ title, amount, onAdd }: { title: string; amount: number; onAdd?: () => void }) => (
    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-700/40">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">{money(amount)}</span>
        {onAdd && <button onClick={onAdd} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:bg-blue-500/20">+ {tr('Ligne', 'Row')}</button>}
      </div>
    </div>
  );

  const SubtotalRow = ({ label, amount }: { label: string; amount: number }) => (
    <tr className="bg-gray-50 dark:bg-gray-700/30">
      <td colSpan={5} className="px-2 py-1 text-right text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</td>
      <td className="px-2 py-1 text-right font-bold tabular-nums text-gray-800 dark:text-gray-100">{money(amount)}</td>
      <td></td>
    </tr>
  );

  return (
    <div className="space-y-5">

      {/* ===== TABLEAU DE BORD ===== */}
      {items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-500/20 dark:bg-gray-800">
          <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="font-bold text-blue-900 dark:text-blue-200">{tr('Synthèse de la soumission', 'Quote Summary')}</h3>
            <span className="ml-auto text-lg font-bold tabular-nums text-blue-700 dark:text-blue-300">{money(grand)}</span>
          </div>

          {/* Totaux par type */}
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-3 lg:grid-cols-6 dark:divide-gray-700">
            {[
              { k: tr("MO Bureau", "Office Labor"), v: typeTotals.bureau, c: 'text-purple-600' },
              { k: tr("MO Chantier", "Site Labor"), v: typeTotals.chantier, c: 'text-blue-600' },
              { k: tr("Voyagement", "Travel"), v: typeTotals.voyagement, c: 'text-amber-600' },
              { k: tr("Subsistance", "Per Diem"), v: typeTotals.subsistance, c: 'text-orange-600' },
              { k: tr("Hébergement", "Lodging"), v: typeTotals.hebergement, c: 'text-pink-600' },
              { k: tr("Matériaux", "Materials"), v: typeTotals.materiaux, c: 'text-emerald-600' },
            ].map(s => (
              <div key={s.k} className="p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.k}</div>
                <div className={`mt-0.5 text-sm font-bold tabular-nums ${s.c}`}>{money(s.v)}</div>
                {typeTotalSum > 0 && <div className="text-xs text-gray-400">{((s.v / typeTotalSum) * 100).toFixed(0)}%</div>}
              </div>
            ))}
          </div>

          {/* Tableau par item */}
          <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-2">{tr('Item', 'Item')}</th>
                  <th className="px-3 py-2 text-right">{tr("MO Bur.", "Office")}</th>
                  <th className="px-3 py-2 text-right">{tr("MO Chan.", "Site")}</th>
                  <th className="px-3 py-2 text-right">{tr("Voy.", "Travel")}</th>
                  <th className="px-3 py-2 text-right">{tr("Sub.", "Per Diem")}</th>
                  <th className="px-3 py-2 text-right">{tr("Héb.", "Lodging")}</th>
                  <th className="px-3 py-2 text-right">{tr("Mat.", "Mat.")}</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-600 dark:text-gray-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const b = itemBreakdown(it);
                  const somme = itemSomme(it);
                  const final = itemFinal(it);
                  return (
                    <tr key={it.id} className={`border-t border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'}`}>
                      <td className="px-3 py-1.5 font-medium text-gray-800 dark:text-gray-100">{it.nom}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.bureau > 0 ? money(b.bureau) : '—'}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.chantier > 0 ? money(b.chantier) : '—'}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.voyagement > 0 ? money(b.voyagement) : '—'}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.subsistance > 0 ? money(b.subsistance) : '—'}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.hebergement > 0 ? money(b.hebergement) : '—'}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{b.materiaux > 0 ? money(b.materiaux) : '—'}</td>
                      <td className="px-3 py-1.5 text-right font-bold tabular-nums text-gray-900 dark:text-white">
                        {money(final)}
                        {it.prixSoumissionne != null && <span className="ml-1 text-xs text-amber-500" title={tr('Prix soumissionné (override)', 'Quoted override')}>*</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-purple-600">{typeTotals.bureau > 0 ? money(typeTotals.bureau) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-blue-600">{typeTotals.chantier > 0 ? money(typeTotals.chantier) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-amber-600">{typeTotals.voyagement > 0 ? money(typeTotals.voyagement) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-orange-600">{typeTotals.subsistance > 0 ? money(typeTotals.subsistance) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-pink-600">{typeTotals.hebergement > 0 ? money(typeTotals.hebergement) : '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-emerald-600">{typeTotals.materiaux > 0 ? money(typeTotals.materiaux) : '—'}</td>
                  <td className="px-3 py-2 text-right text-base font-bold tabular-nums text-gray-900 dark:text-white">{money(grand)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ===== BARRE D'ACTIONS ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-base font-bold text-gray-800 dark:text-gray-100">
          {tr('Total soumission', 'Quote total')} : <span className="text-blue-600 dark:text-blue-400">{money(grand)}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            <Plus size={16} /> Item
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {tr('Enregistrer', 'Save')}
          </button>
        </div>
      </div>

      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}
      {rates.length === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun taux — configure « Taux & catalogue ».', 'No rates — set up "Rates & catalog".')}</div>}

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-600 dark:bg-gray-800">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
            <BarChart3 size={22} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-300">{tr('Aucun item de soumission', 'No quote items')}</p>
          <p className="mt-1 text-sm text-gray-400">{tr('Clique « + Item » pour commencer.', 'Click "+ Item" to start.')}</p>
        </div>
      )}

      {/* ===== ITEMS DÉTAILLÉS ===== */}
      {items.map((it, ii) => {
        const bd = itemBreakdown(it);
        const somme = itemSomme(it);
        return (
          <div key={it.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* En-tête item */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-50 px-4 py-3 dark:bg-gray-700/50">
              <button onClick={() => upd(d => { d[ii].open = !d[ii].open; })} className="rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {it.open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              <input className="inp flex-1 font-semibold text-gray-900 dark:text-white" value={it.nom} onChange={e => upd(d => { d[ii].nom = e.target.value; })} />
              <select className="inp w-24" value={it.tauxType} onChange={e => upd(d => { d[ii].tauxType = e.target.value; })}>
                {codes.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100">{money(itemFinal(it))}</span>
              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== ii))} className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
            </div>

            {it.open && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">

                {/* Main-d'œuvre bureau */}
                <div>
                  <SectionHeader title={tr("MO Bureau", "Office Labor")} amount={bd.bureau} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      {laborHead}
                      <tbody>
                        {laborRow(it.bureau.prepa, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.prepa as any)[k] = v; }), tr('Préparation', 'Prep'))}
                        {laborRow(it.bureau.gestion, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.gestion as any)[k] = v; }), tr('Gestion', 'Mgmt'))}
                        {laborRow(it.bureau.redaction, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.redaction as any)[k] = v; }), tr('Rédaction', 'Writing'))}
                        <SubtotalRow label={tr('Sous-total bureau', 'Office subtotal')} amount={bd.bureau} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Main-d'œuvre chantier */}
                <div>
                  <SectionHeader title={tr("MO Chantier", "Site Labor")} amount={bd.chantier}
                    onAdd={() => upd(d => { d[ii].chantier.push({ id: lid(), desc: '', ...emptyLabor() }); })} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      {laborHead}
                      <tbody>
                        {it.chantier.map((l, li) => laborRow(l, it.tauxType, (k, v) => upd(d => { (d[ii].chantier[li] as any)[k] = v; }), undefined, () => upd(d => { d[ii].chantier.splice(li, 1); })))}
                        {it.chantier.length > 0 && <SubtotalRow label={tr('Sous-total chantier', 'Site subtotal')} amount={bd.chantier} />}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Voyagement */}
                <div>
                  <SectionHeader title={tr("Voyagement", "Travel")} amount={bd.voyagement}
                    onAdd={() => upd(d => { d[ii].voyagement.push({ id: lid(), desc: '', nbTech: 1, km: 0, type: Object.keys(km)[0] || '' }); })} />
                  {it.voyagement.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-2 py-2">{tr('Description', 'Desc.')}</th>
                            <th className="px-2 py-2 text-right">Tech</th>
                            <th className="px-2 py-2 text-right">Km</th>
                            <th className="px-2 py-2">Type</th>
                            <th className="px-2 py-2 text-right">Montant</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {it.voyagement.map((l, li) => (
                            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                              <td className="px-2 py-1"><input className="inp w-36" value={l.desc} onChange={e => upd(d => { d[ii].voyagement[li].desc = e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14 text-right" value={l.nbTech} onChange={e => upd(d => { d[ii].voyagement[li].nbTech = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.km} onChange={e => upd(d => { d[ii].voyagement[li].km = +e.target.value; })} /></td>
                              <td className="px-2">
                                {Object.keys(km).length > 0 ? (
                                  <select className="inp w-40" value={l.type} onChange={e => upd(d => { d[ii].voyagement[li].type = e.target.value; })}>
                                    {Object.entries(km).map(([k, v]) => (
                                      <option key={k} value={k}>{k} — {money(v)}/km</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-xs text-amber-600">{tr('Configurer km dans Taux & catalogue', 'Set km in Rates catalog')}</span>
                                )}
                              </td>
                              <td className="px-2 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(voyCost(l))}</td>
                              <td className="px-1 text-center"><button onClick={() => upd(d => { d[ii].voyagement.splice(li, 1); })} className="rounded p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button></td>
                            </tr>
                          ))}
                          <SubtotalRow label={tr('Sous-total voyagement', 'Travel subtotal')} amount={bd.voyagement} />
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Subsistance */}
                <div>
                  <SectionHeader title={tr("Subsistance", "Per Diem")} amount={bd.subsistance}
                    onAdd={() => upd(d => { d[ii].subsistance.push({ id: lid(), desc: '', nbTech: 1, h5: 0, h12: 0, h15: 0, nuitee: 0 }); })} />
                  {it.subsistance.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-2 py-2">{tr('Description', 'Desc.')}</th><th className="px-2 py-2 text-right">Tech</th>
                            <th className="px-2 py-2 text-right">5h</th><th className="px-2 py-2 text-right">12h</th>
                            <th className="px-2 py-2 text-right">15h</th><th className="px-2 py-2 text-right">Nuitée</th>
                            <th className="px-2 py-2 text-right">Montant</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {it.subsistance.map((l, li) => (
                            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                              <td className="px-2 py-1"><input className="inp w-32" value={l.desc} onChange={e => upd(d => { d[ii].subsistance[li].desc = e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14 text-right" value={l.nbTech} onChange={e => upd(d => { d[ii].subsistance[li].nbTech = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-12 text-right" value={l.h5} onChange={e => upd(d => { d[ii].subsistance[li].h5 = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-12 text-right" value={l.h12} onChange={e => upd(d => { d[ii].subsistance[li].h12 = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-12 text-right" value={l.h15} onChange={e => upd(d => { d[ii].subsistance[li].h15 = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-12 text-right" value={l.nuitee} onChange={e => upd(d => { d[ii].subsistance[li].nuitee = +e.target.value; })} /></td>
                              <td className="px-2 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(subCost(l))}</td>
                              <td className="px-1 text-center"><button onClick={() => upd(d => { d[ii].subsistance.splice(li, 1); })} className="rounded p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button></td>
                            </tr>
                          ))}
                          <SubtotalRow label={tr('Sous-total subsistance', 'Per diem subtotal')} amount={bd.subsistance} />
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Hébergement */}
                <div>
                  <SectionHeader title={tr("Hébergement", "Lodging")} amount={bd.hebergement}
                    onAdd={() => upd(d => { d[ii].hebergement.push({ id: lid(), desc: '', nbTech: 1, nuits: 0 }); })} />
                  {it.hebergement.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-2 py-2">{tr('Description', 'Desc.')}</th>
                            <th className="px-2 py-2 text-right">Tech</th>
                            <th className="px-2 py-2 text-right">{tr('Nuits', 'Nights')}</th>
                            <th className="px-2 py-2 text-right">Montant</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {it.hebergement.map((l, li) => (
                            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                              <td className="px-2 py-1"><input className="inp w-40" value={l.desc} onChange={e => upd(d => { d[ii].hebergement[li].desc = e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-14 text-right" value={l.nbTech} onChange={e => upd(d => { d[ii].hebergement[li].nbTech = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.nuits} onChange={e => upd(d => { d[ii].hebergement[li].nuits = +e.target.value; })} /></td>
                              <td className="px-2 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(hebCost(l))}</td>
                              <td className="px-1 text-center"><button onClick={() => upd(d => { d[ii].hebergement.splice(li, 1); })} className="rounded p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button></td>
                            </tr>
                          ))}
                          <SubtotalRow label={tr('Sous-total hébergement', 'Lodging subtotal')} amount={bd.hebergement} />
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Matériaux */}
                <div>
                  <SectionHeader title={tr("Matériaux", "Materials")} amount={bd.materiaux}
                    onAdd={() => upd(d => { d[ii].materiaux.push({ id: lid(), desc: '', qte: 1, prixUnitaire: 0 }); })} />
                  {it.materiaux.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-2 py-2">{tr('Article (catalogue)', 'Item (catalog)')}</th>
                            <th className="px-2 py-2 text-right">Qté</th>
                            <th className="px-2 py-2 text-right">{tr('Prix unit.', 'Unit price')}</th>
                            <th className="px-2 py-2 text-right">Montant</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {it.materiaux.map((l, li) => (
                            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                              <td className="px-2 py-1">
                                <input className="inp w-48" list={`cat-${it.id}-${li}`} value={l.desc} onChange={e => {
                                  const val = e.target.value; const hit = catalog.find((c: any) => c.name === val);
                                  upd(d => { d[ii].materiaux[li].desc = val; if (hit) d[ii].materiaux[li].prixUnitaire = Number(hit.sale_price) || 0; });
                                }} />
                                <datalist id={`cat-${it.id}-${li}`}>{catalog.map((c: any) => <option key={c.sku || c.name} value={c.name} />)}</datalist>
                              </td>
                              <td className="px-2"><input type="number" onFocus={e => e.target.select()} className="inp w-16 text-right" value={l.qte} onChange={e => upd(d => { d[ii].materiaux[li].qte = +e.target.value; })} /></td>
                              <td className="px-2"><input type="number" step="0.01" onFocus={e => e.target.select()} className="inp w-24 text-right" value={l.prixUnitaire} onChange={e => upd(d => { d[ii].materiaux[li].prixUnitaire = +e.target.value; })} /></td>
                              <td className="px-2 text-right font-semibold tabular-nums text-gray-800 dark:text-gray-100">{money(matCost(l))}</td>
                              <td className="px-1 text-center"><button onClick={() => upd(d => { d[ii].materiaux.splice(li, 1); })} className="rounded p-0.5 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button></td>
                            </tr>
                          ))}
                          <SubtotalRow label={tr('Sous-total matériaux', 'Materials subtotal')} amount={bd.materiaux} />
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Récapitulatif item + Prix soumissionné */}
                <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700/30">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {tr('Somme calculée', 'Computed sum')} : <strong className="text-gray-800 dark:text-gray-100">{money(somme)}</strong>
                    </div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <input type="checkbox" checked={it.prixSoumissionne != null}
                        onChange={e => upd(d => { d[ii].prixSoumissionne = e.target.checked ? Math.round(somme * 100) / 100 : null; })} />
                      {tr('Prix soumissionné (override)', 'Quoted price (override)')}
                    </label>
                    {it.prixSoumissionne != null && (
                      <>
                        <input type="number" step="0.01" className="inp w-32 font-bold" value={it.prixSoumissionne}
                          onChange={e => upd(d => { d[ii].prixSoumissionne = +e.target.value; })} />
                        <div className="flex gap-1">
                          {[10, 15, 20, 25].map(pct => (
                            <button key={pct} onClick={() => upd(d => { d[ii].prixSoumissionne = Math.round(somme * (1 + pct / 100) * 100) / 100; })}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-blue-50 hover:border-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-blue-500/10">
                              +{pct}%
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .inp { border-radius: 0.45rem; border: 1px solid rgb(209 213 219); background: transparent; padding: 0.3rem 0.5rem; font-size: 0.8rem; outline: none; }
        .inp:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 2px rgb(37 99 235 / 0.15); }
        :global(.dark) .inp { border-color: rgb(75 85 99); }
      `}</style>
    </div>
  );
}
