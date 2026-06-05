'use client';

// ============================================================================
// INSPECTION DE ROUTINE — transformateur à l'huile. Checklist par catégories
// (Conforme / Anomalie / N/A), champs de mesure, aide technique IA (correctifs).
// Les points en ANOMALIE sont reversés dans la section Anomalies. Rappel de routine -> dashboard.
// ============================================================================
import React, { useState } from 'react';
import { INSPECTION_CHECKLIST, il, type InspResult } from '@/lib/dga/inspection';
import { addMonths } from '@/lib/dga/catalog';
import type { Inspection, Anomaly, Dossier } from '@/lib/dga/dossiers';
import type { Lang } from '@/lib/dga/fields';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
const INP = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
const rid = () => 'insp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const todayIso = () => new Date().toISOString().slice(0, 10);

// Compression d'image avant stockage (max ~1000px, JPEG 0.7) — pour les photos d'anomalie.
function compressImage(file: File, maxDim = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = reader.result as string;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

const REMINDER_OPTIONS = [
  { months: 0, fr: 'Aucun rappel', en: 'No reminder' },
  { months: 6, fr: '6 mois', en: '6 months' },
  { months: 12, fr: '12 mois', en: '12 months' },
  { months: 24, fr: '24 mois', en: '24 months' },
];

export function InspectionSection({ dossier, inspections, lang, tr, onChange, onCreateAnomalies, onSetReminder, setNotice }: {
  dossier: Dossier; inspections: Inspection[]; lang: Lang; tr: (fr: string, en: string) => string;
  onChange: (next: Inspection[]) => void;
  onCreateAnomalies: (anomalies: Anomaly[]) => void;
  onSetReminder: (nextDate: string | null) => void;
  setNotice: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [inspector, setInspector] = useState('');
  const [reminderMonths, setReminderMonths] = useState(12);
  const [results, setResults] = useState<Record<string, InspResult>>({});
  const [advice, setAdvice] = useState<{ fr?: string; en?: string } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const setStatus = (key: string, status: InspResult['status']) => setResults(p => ({ ...p, [key]: { ...(p[key] || {}), status } }));
  const setInput = (key: string, ik: string, v: any) => setResults(p => ({ ...p, [key]: { ...(p[key] || { status: '' }), inputs: { ...(p[key]?.inputs || {}), [ik]: v } } }));
  const setNote = (key: string, note: string) => setResults(p => ({ ...p, [key]: { ...(p[key] || { status: '' }), note } }));

  // Photos par point (stockées sous inputs.__photos pour ne pas changer le type InspResult).
  const itemPhotos = (key: string): { id: string; data: string; name?: string }[] => results[key]?.inputs?.__photos || [];
  const setItemPhotos = (key: string, photos: any[]) => setResults(p => ({ ...p, [key]: { ...(p[key] || { status: 'anomalie' }), inputs: { ...(p[key]?.inputs || {}), __photos: photos } } }));
  async function addItemPhotos(key: string, files: FileList | null) {
    if (!files) return;
    const next = [...itemPhotos(key)];
    for (const f of Array.from(files)) {
      try { const data = await compressImage(f); next.push({ id: rid(), data, name: f.name }); }
      catch { setNotice(tr('Image trop volumineuse.', 'Image too large.')); }
    }
    setItemPhotos(key, next);
  }
  const delItemPhoto = (key: string, pid: string) => setItemPhotos(key, itemPhotos(key).filter(ph => ph.id !== pid));

  // Liste des anomalies courantes (points status=anomalie) avec libellé + catégorie + photos.
  const anomalyList = () => {
    const out: { key: string; label: string; category: string; note?: string; photos: any[] }[] = [];
    INSPECTION_CHECKLIST.forEach(cat => cat.items.forEach(it => {
      if (results[it.key]?.status === 'anomalie') out.push({ key: it.key, label: il(it, lang), category: il(cat, lang), note: results[it.key]?.note, photos: itemPhotos(it.key) });
    }));
    return out;
  };

  async function runAI() {
    const anomalies = anomalyList();
    if (!anomalies.length) { setNotice(tr('Aucune anomalie cochée à analyser.', 'No anomaly checked to analyze.')); return; }
    setAiBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/dga/inspect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier, anomalies }) });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || 'IA');
      const a = j.advice || {};
      const fr = [a.summaryFr, ...(a.actionsFr || []).map((x: string) => '• ' + x)].filter(Boolean).join('\n');
      const en = [a.summaryEn, ...(a.actionsEn || []).map((x: string) => '• ' + x)].filter(Boolean).join('\n');
      setAdvice({ fr, en });
    } catch (e: any) { setNotice(tr('Aide IA impossible : ', 'AI help failed: ') + (e?.message || e)); }
    finally { setAiBusy(false); }
  }

  function save() {
    const anomalies = anomalyList();
    const insp: Inspection = {
      id: rid(), date, inspector: inspector.trim(), results,
      advice: advice || undefined, anomalyCount: anomalies.length, created_at: new Date().toISOString(),
    };
    onChange([insp, ...inspections]);
    // Reverser les anomalies cochées dans la section Anomalies.
    if (anomalies.length) {
      const adviceText = advice ? (lang === 'en' ? advice.en : advice.fr) : '';
      onCreateAnomalies(anomalies.map(an => ({
        id: 'an_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        kind: 'anomalie', status: 'a_corriger',
        title: an.label,
        desc: tr(`Inspection ${date} — ${an.category}`, `Inspection ${date} — ${an.category}`) + (an.note ? `\n${an.note}` : '') + (adviceText ? `\n\n${tr('Aide IA :', 'AI advice:')} ${adviceText}` : ''),
        photos: an.photos || [], created_at: new Date().toISOString(),
      } as Anomaly)));
    }
    // Rappel de routine -> dashboard.
    onSetReminder(reminderMonths > 0 ? addMonths(date, reminderMonths) : null);
    setNotice(tr(`Inspection enregistrée (${anomalies.length} anomalie(s) reversée(s)).`, `Inspection saved (${anomalies.length} anomaly(ies) added).`));
    // Reset formulaire.
    setResults({}); setAdvice(null); setInspector(''); setOpen(false);
  }

  const StatusBtns = ({ k }: { k: string }) => {
    const st = results[k]?.status || '';
    const btn = (val: InspResult['status'], label: string, on: string) => (
      <button type="button" onClick={() => setStatus(k, st === val ? '' : val)}
        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${st === val ? on : 'border border-gray-300 text-gray-500 dark:border-gray-600'}`}>{label}</button>
    );
    return (
      <div className="flex gap-1">
        {btn('conforme', 'C', 'bg-emerald-600 text-white')}
        {btn('anomalie', 'A', 'bg-red-600 text-white')}
        {btn('na', 'N/A', 'bg-gray-400 text-white')}
      </div>
    );
  };

  return (
    <section className={CARD}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">🛠️ {tr('Inspection de routine', 'Routine inspection')}</h3>
        <button onClick={() => setOpen(o => !o)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">{open ? tr('Fermer', 'Close') : '+ ' + tr('Nouvelle inspection', 'New inspection')}</button>
      </div>

      {/* Historique */}
      {inspections.length > 0 && (
        <div className="mb-3 space-y-1">
          {inspections.slice(0, 6).map(ins => (
            <div key={ins.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-2 py-1 text-xs dark:border-gray-700/60">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{ins.date || '—'}</span>
              {ins.inspector && <span className="text-gray-500">· {ins.inspector}</span>}
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${ins.anomalyCount ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {ins.anomalyCount ? `${ins.anomalyCount} ${tr('anomalie(s)', 'anomaly(ies)')}` : tr('Conforme', 'Compliant')}
              </span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr("Date d'inspection", 'Inspection date')}</span>
              <input type="date" className={INP} value={date} onChange={e => setDate(e.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Inspecteur', 'Inspector')}</span>
              <input className={INP} value={inspector} onChange={e => setInspector(e.target.value)} placeholder={tr('Nom', 'Name')} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Rappel de routine', 'Routine reminder')}</span>
              <select className={INP} value={reminderMonths} onChange={e => setReminderMonths(Number(e.target.value))}>
                {REMINDER_OPTIONS.map(o => <option key={o.months} value={o.months}>{lang === 'en' ? o.en : o.fr}</option>)}
              </select></label>
          </div>
          <p className="text-[11px] text-gray-400">{tr('C = Conforme · A = Anomalie · N/A = non applicable. Les points « A » sont ajoutés à la section Anomalies.', 'C = Compliant · A = Anomaly · N/A = not applicable. "A" items are added to the Anomalies section.')}</p>

          {INSPECTION_CHECKLIST.map(cat => (
            <div key={cat.id}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">{il(cat, lang)}</div>
              <div className="space-y-1.5">
                {cat.items.map(it => {
                  const st = results[it.key]?.status || '';
                  return (
                    <div key={it.key} className="rounded-lg border border-gray-100 p-2 dark:border-gray-700/60">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-200">{il(it, lang)}</span>
                        {!it.optionOnly && <StatusBtns k={it.key} />}
                      </div>
                      {/* Champs spéciaux (mesures / options) */}
                      {it.inputs && it.inputs.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {it.inputs.map(inp => {
                            const v = results[it.key]?.inputs?.[inp.key] ?? '';
                            if (inp.kind === 'bool') return (
                              <label key={inp.key} className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                <input type="checkbox" className="accent-rose-600" checked={!!v} onChange={e => setInput(it.key, inp.key, e.target.checked)} /> {il(inp, lang)}
                              </label>
                            );
                            if (inp.kind === 'select') return (
                              <select key={inp.key} className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-[11px] dark:border-gray-600" value={v} onChange={e => setInput(it.key, inp.key, e.target.value)}>
                                <option value="">{il(inp, lang)}…</option>
                                {inp.choices?.map(c => <option key={c.value} value={c.value}>{lang === 'en' ? c.en : c.label}</option>)}
                              </select>
                            );
                            return (
                              <span key={inp.key} className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                {il(inp, lang)}
                                <input type={inp.kind === 'number' ? 'number' : 'text'} className="w-20 rounded-md border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600" value={v} onChange={e => setInput(it.key, inp.key, e.target.value)} />
                                {inp.unit && <span className="text-gray-400">{inp.unit}</span>}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {st === 'anomalie' && (
                        <div className="mt-1.5 space-y-1.5">
                          <input className={INP} value={results[it.key]?.note || ''} onChange={e => setNote(it.key, e.target.value)} placeholder={tr('Détail de l’anomalie (optionnel)', 'Anomaly detail (optional)')} />
                          <div className="flex flex-wrap items-center gap-2">
                            {itemPhotos(it.key).map(ph => (
                              <div key={ph.id} className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ph.data} alt={ph.name || ''} className="h-14 w-14 rounded-lg object-cover" />
                                <button type="button" className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-[10px] text-white" onClick={() => delItemPhoto(it.key, ph.id)}>×</button>
                              </div>
                            ))}
                            <label className="grid h-14 w-14 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-rose-400 dark:border-gray-600" title={tr('Ajouter une photo', 'Add a photo')}>
                              <span className="text-lg">📷</span>
                              <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => { addItemPhotos(it.key, e.target.files); e.currentTarget.value = ''; }} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Aide technique IA */}
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/30 dark:bg-violet-500/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-violet-800 dark:text-violet-300">🤖 {tr('Aide technique IA — correctifs', 'AI technical aid — corrective actions')}</span>
              <button onClick={runAI} disabled={aiBusy} className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{aiBusy ? tr('Analyse…', 'Analyzing…') : '✨ ' + tr('Analyser les anomalies', 'Analyze anomalies')}</button>
            </div>
            {advice && <p className="mt-2 whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-200">{lang === 'en' ? advice.en : advice.fr}</p>}
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">💾 {tr("Enregistrer l'inspection", 'Save inspection')}</button>
            <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600">{tr('Annuler', 'Cancel')}</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default InspectionSection;
