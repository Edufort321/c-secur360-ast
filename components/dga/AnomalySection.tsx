'use client';

// ============================================================================
// RAPPORT D'ANOMALIE — section de la fiche : anomalies / recommandations avec
// photos custom, statut (à corriger ↔ corrigé), archivage. Sélectionnable à l'export.
// ============================================================================
import React, { useState } from 'react';
import type { Anomaly } from '@/lib/dga/dossiers';
import type { Lang } from '@/lib/dga/fields';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
const INP = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';

// Compression d'image avant stockage (max ~1000px, JPEG 0.7).
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

const rid = () => 'an_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function AnomalySection({ anomalies, onChange, lang, tr, setNotice }: {
  anomalies: Anomaly[]; onChange: (next: Anomaly[]) => void; lang: Lang;
  tr: (fr: string, en: string) => string; setNotice: (s: string | null) => void;
}) {
  void lang;
  const [showArchived, setShowArchived] = useState(false);
  const visible = anomalies.filter(a => showArchived || !a.archived);
  const update = (id: string, patch: Partial<Anomaly>) => onChange(anomalies.map(a => (a.id === id ? { ...a, ...patch } : a)));
  const add = () => onChange([...anomalies, { id: rid(), kind: 'anomalie', status: 'a_corriger', title: '', desc: '', photos: [], created_at: new Date().toISOString() }]);
  const remove = (id: string) => { if (confirm(tr('Supprimer cette entrée ?', 'Delete this entry?'))) onChange(anomalies.filter(a => a.id !== id)); };
  async function addPhotos(id: string, files: FileList | null) {
    if (!files) return;
    const a = anomalies.find(x => x.id === id); if (!a) return;
    const photos = [...(a.photos || [])];
    for (const f of Array.from(files)) {
      try { const data = await compressImage(f); photos.push({ id: rid(), data, name: f.name }); }
      catch { setNotice(tr('Image trop volumineuse.', 'Image too large.')); }
    }
    update(id, { photos });
  }
  const delPhoto = (id: string, pid: string) => { const a = anomalies.find(x => x.id === id); if (a) update(id, { photos: (a.photos || []).filter(p => p.id !== pid) }); };

  const archivedCount = anomalies.filter(a => a.archived).length;

  return (
    <section className={CARD}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">⚠️ {tr("Rapport d'anomalie", 'Anomaly report')}</h3>
        <div className="flex items-center gap-2">
          {archivedCount > 0 && (
            <label className="flex cursor-pointer items-center gap-1 text-[11px] text-gray-500">
              <input type="checkbox" className="accent-rose-600" checked={showArchived} onChange={() => setShowArchived(v => !v)} />
              {tr('Voir archivées', 'Show archived')} ({archivedCount})
            </label>
          )}
          <button onClick={add} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">+ {tr('Ajouter', 'Add')}</button>
        </div>
      </div>

      {visible.length === 0
        ? <p className="py-3 text-center text-xs text-gray-400">{tr('Aucune anomalie ni recommandation.', 'No anomaly or recommendation.')}</p>
        : <div className="space-y-3">
          {visible.map(a => {
            const isAnom = a.kind === 'anomalie';
            const done = a.status === 'corrige';
            return (
              <div key={a.id} className={`rounded-xl border p-3 ${a.archived ? 'border-dashed border-gray-300 opacity-70 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`} style={!a.archived ? { borderLeft: `4px solid ${isAnom ? '#e63946' : '#277da1'}` } : undefined}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select className="rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-xs font-semibold dark:border-gray-600" value={a.kind} onChange={e => update(a.id, { kind: e.target.value as Anomaly['kind'] })}>
                    <option value="anomalie">🔧 {tr('Anomalie', 'Anomaly')}</option>
                    <option value="reco">💡 {tr('Recommandation', 'Recommendation')}</option>
                  </select>
                  <button onClick={() => update(a.id, { status: done ? 'a_corriger' : 'corrige' })}
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={done ? { background: '#dcfce7', color: '#15803d' } : { background: '#fef3c7', color: '#b45309' }}>
                    {done ? '✓ ' + tr('Corrigé', 'Corrected') : '⛏ ' + tr('À corriger', 'To fix')}
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => update(a.id, { archived: !a.archived })} className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                      {a.archived ? '↺ ' + tr('Désarchiver', 'Unarchive') : '🗄 ' + tr('Archiver', 'Archive')}
                    </button>
                    <button onClick={() => remove(a.id)} className="text-gray-300 hover:text-red-500">🗑</button>
                  </div>
                </div>
                <input className={INP + ' mb-2 font-semibold'} value={a.title || ''} placeholder={tr('Titre (ex. Fuite au radiateur nord)', 'Title (e.g. Leak on north radiator)')} onChange={e => update(a.id, { title: e.target.value })} />
                <textarea className={INP} rows={2} value={a.desc || ''} placeholder={tr('Description / action…', 'Description / action…')} onChange={e => update(a.id, { desc: e.target.value })} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(a.photos || []).map(ph => (
                    <div key={ph.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ph.data} alt={ph.name || ''} className="h-16 w-16 rounded-lg object-cover" />
                      <button className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-[10px] text-white" onClick={() => delPhoto(a.id, ph.id)}>×</button>
                    </div>
                  ))}
                  <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-rose-400 dark:border-gray-600">
                    <span className="text-xl">+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => { addPhotos(a.id, e.target.files); e.currentTarget.value = ''; }} />
                  </label>
                </div>
              </div>
            );
          })}
        </div>}
    </section>
  );
}

export default AnomalySection;
