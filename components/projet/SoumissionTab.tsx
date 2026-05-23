'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// ===== Modèle de soumission (items détaillés) =====
type LaborLine = { id?: string; desc?: string; nbTech: number; hrsReg: number; hrsSupp: number; hrsMaj: number };
type VoyLine = { id: string; desc: string; nbTech: number; km: number; type: 'camion' | 'remorque' | 'degazeur' };
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

// Défauts à 0 — le tenant configure tous les tarifs dans « Taux & catalogue » (rate_settings)
const DEF_SUB = { h5: 0, h12: 0, h15: 0, nuitee: 0 };
const DEF_KM: Record<string, number> = { camion: 0, remorque: 0, degazeur: 0 };
const DEF_HEB = 0;

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
      setKm({ camion: get('km', 'camion', DEF_KM.camion), remorque: get('km', 'remorque', DEF_KM.remorque), degazeur: get('km', 'degazeur', DEF_KM.degazeur) });
      setHeb(get('hebergement', 'vendant', DEF_HEB));
      setCatalog(c || []);
    })();
    return () => { active = false; };
  }, [tenant]);

  const rateMap = useMemo(() => Object.fromEntries((rates || []).map((r: any) => [r.code, r])), [rates]);
  const codes = (rates || []).map((r: any) => r.code);

  // ===== Formules de calcul =====
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
  const itemSomme = (it: Item) =>
    bureauTotal(it) + chantierTotal(it)
    + it.voyagement.reduce((s, l) => s + voyCost(l), 0)
    + it.subsistance.reduce((s, l) => s + subCost(l), 0)
    + it.hebergement.reduce((s, l) => s + hebCost(l), 0)
    + it.materiaux.reduce((s, l) => s + matCost(l), 0);
  const itemFinal = (it: Item) => (it.prixSoumissionne != null ? it.prixSoumissionne : itemSomme(it));
  const grand = useMemo(() => items.reduce((s, it) => s + itemFinal(it), 0), [items, rateMap, sub, km, heb]);

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
    <tr className="border-t border-gray-100 dark:border-gray-700">
      <td className="px-1 py-0.5">{label ?? <input className="inp w-36" value={l.desc || ''} onChange={e => onCh('desc', e.target.value)} />}</td>
      <td className="px-1"><input type="number" className="inp w-14" value={l.nbTech} onChange={e => onCh('nbTech', +e.target.value)} /></td>
      <td className="px-1"><input type="number" className="inp w-14" value={l.hrsReg} onChange={e => onCh('hrsReg', +e.target.value)} /></td>
      <td className="px-1"><input type="number" className="inp w-14" value={l.hrsSupp} onChange={e => onCh('hrsSupp', +e.target.value)} /></td>
      <td className="px-1"><input type="number" className="inp w-14" value={l.hrsMaj} onChange={e => onCh('hrsMaj', +e.target.value)} /></td>
      <td className="px-1 text-right font-medium">{money(laborCost(l, code))}</td>
      <td className="px-1">{onDel && <button onClick={onDel} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>}</td>
    </tr>
  );
  const laborHead = (
    <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-1 py-1">{tr('Description', 'Description')}</th><th className="px-1">Tech</th><th className="px-1">Rég</th><th className="px-1">Supp</th><th className="px-1">Maj</th><th className="px-1 text-right">$</th><th></th></tr></thead>
  );
  const Section = ({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) => (
    <div>
      <div className="mb-1 flex items-center justify-between"><span className="text-sm font-semibold">{title}</span>{onAdd && <button onClick={onAdd} className="text-xs font-semibold text-blue-600">+ {tr('ligne', 'line')}</button>}</div>
      <div className="overflow-x-auto"><table className="w-full text-sm">{children}</table></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-bold">{tr('Total soumission', 'Quote total')} : <span className="text-blue-600 dark:text-blue-400">{money(grand)}</span></div>
        <div className="flex gap-2">
          <button onClick={addItem} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> Item</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}
      {rates.length === 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun taux — configure « Taux & catalogue ».', 'No rates — set up “Rates & catalog”.')}</div>}
      {items.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">{tr('Aucun item.', 'No item.')}</div>}

      {items.map((it, ii) => {
        const somme = itemSomme(it);
        return (
          <div key={it.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
              <button onClick={() => upd(d => { d[ii].open = !d[ii].open; })} className="text-gray-400">{it.open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
              <input className="inp flex-1 font-semibold" value={it.nom} onChange={e => upd(d => { d[ii].nom = e.target.value; })} />
              <select className="inp w-24" value={it.tauxType} onChange={e => upd(d => { d[ii].tauxType = e.target.value; })}>{codes.map((c: string) => <option key={c} value={c}>{c}</option>)}</select>
              <span className="text-sm font-bold">{money(itemFinal(it))}</span>
              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== ii))} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>

            {it.open && (
              <div className="space-y-5 p-4">
                <Section title={tr("Main-d'œuvre — bureau", 'Labor — office')}>
                  {laborHead}
                  <tbody>
                    {laborRow(it.bureau.prepa, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.prepa as any)[k] = v; }), tr('Préparation', 'Prep'))}
                    {laborRow(it.bureau.gestion, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.gestion as any)[k] = v; }), tr('Gestion', 'Mgmt'))}
                    {laborRow(it.bureau.redaction, it.tauxType, (k, v) => upd(d => { (d[ii].bureau.redaction as any)[k] = v; }), tr('Rédaction', 'Writing'))}
                  </tbody>
                </Section>

                <Section title={tr("Main-d'œuvre — chantier", 'Labor — site')} onAdd={() => upd(d => { d[ii].chantier.push({ id: lid(), desc: '', ...emptyLabor() }); })}>
                  {laborHead}
                  <tbody>
                    {it.chantier.map((l, li) => laborRow(l, it.tauxType, (k, v) => upd(d => { (d[ii].chantier[li] as any)[k] = v; }), undefined, () => upd(d => { d[ii].chantier.splice(li, 1); })))}
                  </tbody>
                </Section>

                <Section title={tr('Voyagement', 'Travel')} onAdd={() => upd(d => { d[ii].voyagement.push({ id: lid(), desc: '', nbTech: 1, km: 0, type: 'camion' }); })}>
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-1 py-1">{tr('Description', 'Description')}</th><th className="px-1">Tech</th><th className="px-1">Km</th><th className="px-1">Type</th><th className="px-1 text-right">$</th><th></th></tr></thead>
                  <tbody>
                    {it.voyagement.map((l, li) => (
                      <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-1 py-0.5"><input className="inp w-36" value={l.desc} onChange={e => upd(d => { d[ii].voyagement[li].desc = e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-14" value={l.nbTech} onChange={e => upd(d => { d[ii].voyagement[li].nbTech = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-16" value={l.km} onChange={e => upd(d => { d[ii].voyagement[li].km = +e.target.value; })} /></td>
                        <td className="px-1"><select className="inp w-24" value={l.type} onChange={e => upd(d => { d[ii].voyagement[li].type = e.target.value as any; })}><option value="camion">Camion</option><option value="remorque">Remorque</option><option value="degazeur">Dégazeur</option></select></td>
                        <td className="px-1 text-right font-medium">{money(voyCost(l))}</td>
                        <td className="px-1"><button onClick={() => upd(d => { d[ii].voyagement.splice(li, 1); })} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </Section>

                <Section title={tr('Subsistance', 'Per diem')} onAdd={() => upd(d => { d[ii].subsistance.push({ id: lid(), desc: '', nbTech: 1, h5: 0, h12: 0, h15: 0, nuitee: 0 }); })}>
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-1 py-1">{tr('Description', 'Description')}</th><th className="px-1">Tech</th><th className="px-1">5h</th><th className="px-1">12h</th><th className="px-1">15h</th><th className="px-1">Nuitée</th><th className="px-1 text-right">$</th><th></th></tr></thead>
                  <tbody>
                    {it.subsistance.map((l, li) => (
                      <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-1 py-0.5"><input className="inp w-32" value={l.desc} onChange={e => upd(d => { d[ii].subsistance[li].desc = e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-14" value={l.nbTech} onChange={e => upd(d => { d[ii].subsistance[li].nbTech = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-12" value={l.h5} onChange={e => upd(d => { d[ii].subsistance[li].h5 = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-12" value={l.h12} onChange={e => upd(d => { d[ii].subsistance[li].h12 = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-12" value={l.h15} onChange={e => upd(d => { d[ii].subsistance[li].h15 = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-12" value={l.nuitee} onChange={e => upd(d => { d[ii].subsistance[li].nuitee = +e.target.value; })} /></td>
                        <td className="px-1 text-right font-medium">{money(subCost(l))}</td>
                        <td className="px-1"><button onClick={() => upd(d => { d[ii].subsistance.splice(li, 1); })} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </Section>

                <Section title={tr('Hébergement', 'Lodging')} onAdd={() => upd(d => { d[ii].hebergement.push({ id: lid(), desc: '', nbTech: 1, nuits: 0 }); })}>
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-1 py-1">{tr('Description', 'Description')}</th><th className="px-1">Tech</th><th className="px-1">{tr('Nuits', 'Nights')}</th><th className="px-1 text-right">$</th><th></th></tr></thead>
                  <tbody>
                    {it.hebergement.map((l, li) => (
                      <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-1 py-0.5"><input className="inp w-40" value={l.desc} onChange={e => upd(d => { d[ii].hebergement[li].desc = e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-14" value={l.nbTech} onChange={e => upd(d => { d[ii].hebergement[li].nbTech = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" className="inp w-16" value={l.nuits} onChange={e => upd(d => { d[ii].hebergement[li].nuits = +e.target.value; })} /></td>
                        <td className="px-1 text-right font-medium">{money(hebCost(l))}</td>
                        <td className="px-1"><button onClick={() => upd(d => { d[ii].hebergement.splice(li, 1); })} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </Section>

                <Section title={tr('Matériaux', 'Materials')} onAdd={() => upd(d => { d[ii].materiaux.push({ id: lid(), desc: '', qte: 1, prixUnitaire: 0 }); })}>
                  <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-1 py-1">{tr('Article (catalogue)', 'Item (catalog)')}</th><th className="px-1">Qté</th><th className="px-1">{tr('Prix', 'Price')}</th><th className="px-1 text-right">$</th><th></th></tr></thead>
                  <tbody>
                    {it.materiaux.map((l, li) => (
                      <tr key={l.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-1 py-0.5">
                          <input className="inp w-48" list={`cat-${it.id}-${li}`} value={l.desc} onChange={e => {
                            const val = e.target.value; const hit = catalog.find((c: any) => c.name === val);
                            upd(d => { d[ii].materiaux[li].desc = val; if (hit) d[ii].materiaux[li].prixUnitaire = Number(hit.sale_price) || 0; });
                          }} />
                          <datalist id={`cat-${it.id}-${li}`}>{catalog.map((c: any) => <option key={c.sku || c.name} value={c.name} />)}</datalist>
                        </td>
                        <td className="px-1"><input type="number" className="inp w-16" value={l.qte} onChange={e => upd(d => { d[ii].materiaux[li].qte = +e.target.value; })} /></td>
                        <td className="px-1"><input type="number" step="0.01" className="inp w-24" value={l.prixUnitaire} onChange={e => upd(d => { d[ii].materiaux[li].prixUnitaire = +e.target.value; })} /></td>
                        <td className="px-1 text-right font-medium">{money(matCost(l))}</td>
                        <td className="px-1"><button onClick={() => upd(d => { d[ii].materiaux.splice(li, 1); })} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </Section>

                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">{tr('Somme calculée', 'Computed sum')} : <strong>{money(somme)}</strong></span>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={it.prixSoumissionne != null} onChange={e => upd(d => { d[ii].prixSoumissionne = e.target.checked ? Math.round(somme * 100) / 100 : null; })} />
                    {tr('Prix soumissionné (override)', 'Quoted price (override)')}
                  </label>
                  {it.prixSoumissionne != null && (
                    <>
                      <input type="number" step="0.01" className="inp w-28" value={it.prixSoumissionne} onChange={e => upd(d => { d[ii].prixSoumissionne = +e.target.value; })} />
                      <span className="text-gray-400">{tr('Marge', 'Margin')}:</span>
                      {[10, 15, 20, 25].map(p => (
                        <button key={p} onClick={() => upd(d => { d[ii].prixSoumissionne = Math.round(somme * (1 + p / 100) * 100) / 100; })} className="rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">+{p}%</button>
                      ))}
                    </>
                  )}
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
