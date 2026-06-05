'use client';

// ============================================================================
// SAISIE D'UN PRÉLÈVEMENT — port fidèle de l'écran « Nouveau prélèvement » du prototype
// (dga-oil-app.jsx ~l.1120) : onglets Gaz dissous / Qualité de l'huile (15 + méthodes ASTM) /
// Furanes (5, ppb). Parsing « <X » (= moitié du seuil). Renvoie gaz + oil_quality (jsonb).
// ============================================================================
import React, { useState } from 'react';
import { GAS_FIELDS, OIL_FIELDS, FURAN_FIELDS, gl, fl, parseNum, type Lang } from '@/lib/dga/fields';
import type { GasInput } from '@/lib/dga/diagnose';
import type { Measure } from '@/lib/dga/dossiers';

const INP = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';

export interface SamplePayload { sample_date: string | null; gas: GasInput; o2: number | null; n2: number | null; oil_quality: Record<string, any>; }

const todayIso = () => new Date().toISOString().slice(0, 10);

export function SampleEntry({ lang, tr, dossierIdent, initial, onSave, onCancel }: {
  lang: Lang; tr: (fr: string, en: string) => string; dossierIdent: string;
  initial?: Measure | null; // si fourni -> mode ÉDITION (pré-rempli)
  onSave: (p: SamplePayload) => void; onCancel: () => void;
}) {
  const isEdit = !!initial?.id;
  const [tab, setTab] = useState<'gas' | 'oil' | 'furan'>('gas');
  const [date, setDate] = useState(initial?.sample_date || todayIso());
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    if (!initial) return {};
    const d: Record<string, string> = {};
    GAS_FIELDS.forEach(g => { const v = (initial as any)[g.key]; if (v != null) d[g.key as string] = String(v); });
    [...OIL_FIELDS, ...FURAN_FIELDS].forEach(f => { const v = initial.oil_quality?.[f.key]; if (v != null && v !== '') d[f.key] = String(v); });
    return d;
  });
  const set = (k: string, v: string) => setDraft(s => ({ ...s, [k]: v }));

  function save() {
    // Gaz : null -> 0 (cohérent avec le prototype).
    const g = (k: string) => { const v = parseNum(draft[k]); return v == null ? 0 : v; };
    const gas: GasInput = { h2: g('h2'), ch4: g('ch4'), c2h6: g('c2h6'), c2h4: g('c2h4'), c2h2: g('c2h2'), co: g('co'), co2: g('co2') };
    const oil_quality: Record<string, any> = {};
    OIL_FIELDS.forEach(f => { const raw = draft[f.key]; if (raw != null && raw !== '') oil_quality[f.key] = f.text ? String(raw).trim() : parseNum(raw); });
    FURAN_FIELDS.forEach(f => { const v = parseNum(draft[f.key]); if (v != null) oil_quality[f.key] = v; });
    onSave({ sample_date: date || null, gas, o2: parseNum(draft['o2']), n2: parseNum(draft['n2']), oil_quality });
  }

  const tabBtn = (id: typeof tab, label: string) => (
    <button onClick={() => setTab(id)} className={`rounded-t-lg border-b-2 px-3 py-1.5 text-sm font-semibold ${tab === id ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{label}</button>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-bold">{isEdit ? tr('Éditer le prélèvement —', 'Edit sample —') : tr('Nouveau prélèvement —', 'New sample —')} {dossierIdent}</h2>
      <label className="mb-3 block w-52"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Date du prélèvement', 'Sampling date')}</span>
        <input type="date" className={INP} value={date} onChange={e => setDate(e.target.value)} /></label>

      <div className="mb-3 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabBtn('gas', tr('Gaz dissous (DGA)', 'Dissolved gas (DGA)'))}
        {tabBtn('oil', tr("Qualité de l'huile", 'Oil quality'))}
        {tabBtn('furan', tr('Furanes (ppb)', 'Furans (ppb)'))}
      </div>

      {tab === 'gas' && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GAS_FIELDS.map(g => (
            <label key={g.u} className="block"><span className="mb-1 block text-[11px] font-semibold" style={{ color: g.color }}>{gl(g.u, lang)}</span>
              <input className={INP} inputMode="decimal" value={draft[g.key as string] ?? ''} onFocus={e => e.currentTarget.select()} onChange={e => set(g.key as string, e.target.value)} placeholder={tr('ppm (ou <1)', 'ppm (or <1)')} /></label>
          ))}
        </div>
      )}
      {tab === 'oil' && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {OIL_FIELDS.map(f => (
            <label key={f.key} className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{fl(f, lang)}<span className="text-gray-400"> · {f.method}</span></span>
              <input className={INP} inputMode={f.text ? 'text' : 'decimal'} value={draft[f.key] ?? ''} onFocus={e => e.currentTarget.select()} onChange={e => set(f.key, e.target.value)} placeholder={f.text ? tr('ex. Pass / Non corrosif', 'e.g. Pass / Non-corrosive') : tr('valeur (ou <X)', 'value (or <X)')} /></label>
          ))}
        </div>
      )}
      {tab === 'furan' && (
        <div>
          <p className="mb-2 text-[11px] text-gray-400">{tr('Furanes par chromatographie (D5837-15). Le 2-FAL sert à estimer le degré de polymérisation (DP) du papier.', 'Furans by chromatography (D5837-15). 2-FAL is used to estimate paper degree of polymerization (DP).')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FURAN_FIELDS.map(f => (
              <label key={f.key} className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{fl(f, lang)} (ppb)</span>
                <input className={INP} inputMode="decimal" value={draft[f.key] ?? ''} onFocus={e => e.currentTarget.select()} onChange={e => set(f.key, e.target.value)} placeholder={tr('ppb (ou <5)', 'ppb (or <5)')} /></label>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400">{tr('« <1 » / « <5 » accepté (traité comme moitié du seuil). Vide = non mesuré.', '"<1" / "<5" accepted (treated as half the threshold). Empty = not measured.')}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={save} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">{isEdit ? tr('Enregistrer les modifications', 'Save changes') : tr('Analyser & enregistrer', 'Analyze & save')}</button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">{tr('Annuler', 'Cancel')}</button>
      </div>
    </div>
  );
}

export default SampleEntry;
