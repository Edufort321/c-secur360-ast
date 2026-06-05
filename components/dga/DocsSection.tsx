'use client';

// ============================================================================
// DOCUMENTS — documentation technique + rapports d'essais du transformateur.
// Chaque entrée = PDF importé (base64) OU hyperlien. Stockés dans dga_dossiers.docs (jsonb).
// ============================================================================
import React, { useState } from 'react';
import type { DgaDoc } from '@/lib/dga/dossiers';
import type { Lang } from '@/lib/dga/fields';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
const INP = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';
const BTN = 'rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700';

const rid = () => 'doc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const MAX_MB = 8;
const toB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error('read')); r.readAsDataURL(f); });

export function DocsSection({ docs, onChange, lang, tr, setNotice }: {
  docs: DgaDoc[]; onChange: (next: DgaDoc[]) => void; lang: Lang;
  tr: (fr: string, en: string) => string; setNotice: (s: string | null) => void;
}) {
  void lang;
  const [linkForm, setLinkForm] = useState<{ cat: 'tech' | 'essais'; name: string; url: string } | null>(null);

  async function addFiles(cat: 'tech' | 'essais', files: FileList | null) {
    if (!files) return;
    const next = [...docs];
    for (const f of Array.from(files)) {
      if (f.size > MAX_MB * 1024 * 1024) { setNotice(tr(`« ${f.name} » dépasse ${MAX_MB} Mo — utilise plutôt un hyperlien.`, `"${f.name}" exceeds ${MAX_MB} MB — use a hyperlink instead.`)); continue; }
      try { const data = await toB64(f); next.push({ id: rid(), category: cat, kind: 'file', name: f.name, data, mime: f.type, created_at: new Date().toISOString() }); }
      catch { setNotice(tr('Lecture du fichier impossible.', 'Could not read the file.')); }
    }
    onChange(next);
  }
  function addLink() {
    if (!linkForm) return;
    const url = linkForm.url.trim(); if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    onChange([...docs, { id: rid(), category: linkForm.cat, kind: 'link', name: linkForm.name.trim() || href, url: href, created_at: new Date().toISOString() }]);
    setLinkForm(null);
  }
  function remove(id: string) { if (confirm(tr('Supprimer ce document ?', 'Delete this document?'))) onChange(docs.filter(d => d.id !== id)); }

  const CATS: { id: 'tech' | 'essais'; label: string }[] = [
    { id: 'tech', label: tr('Documentation technique', 'Technical documentation') },
    { id: 'essais', label: tr("Rapports d'essais", 'Test reports') },
  ];

  return (
    <section className={CARD}>
      <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">📄 {tr('Documents', 'Documents')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {CATS.map(cat => {
          const items = docs.filter(d => d.category === cat.id);
          return (
            <div key={cat.id}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">{cat.label}</span>
                <div className="flex gap-1.5">
                  <label className={BTN + ' cursor-pointer'}>📄 {tr('PDF', 'PDF')}
                    <input type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={e => { addFiles(cat.id, e.target.files); e.currentTarget.value = ''; }} />
                  </label>
                  <button className={BTN} onClick={() => setLinkForm({ cat: cat.id, name: '', url: '' })}>🔗 {tr('Lien', 'Link')}</button>
                </div>
              </div>

              {linkForm && linkForm.cat === cat.id && (
                <div className="mb-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  <input className={INP + ' mb-1'} placeholder={tr('Nom (optionnel)', 'Name (optional)')} value={linkForm.name} onChange={e => setLinkForm({ ...linkForm, name: e.target.value })} />
                  <input className={INP} placeholder="https://…" value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') addLink(); }} />
                  <div className="mt-1.5 flex gap-1.5">
                    <button className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white" onClick={addLink}>{tr('Ajouter', 'Add')}</button>
                    <button className={BTN} onClick={() => setLinkForm(null)}>{tr('Annuler', 'Cancel')}</button>
                  </div>
                </div>
              )}

              {items.length === 0
                ? <p className="text-[11px] text-gray-400">{tr('Aucun document.', 'No document.')}</p>
                : <ul className="space-y-1">
                  {items.map(d => (
                    <li key={d.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1 text-xs dark:border-gray-700/60">
                      <span>{d.kind === 'file' ? '📄' : '🔗'}</span>
                      <a href={d.kind === 'file' ? d.data : d.url} download={d.kind === 'file' ? d.name : undefined} target="_blank" rel="noopener noreferrer"
                        className="flex-1 truncate font-medium text-blue-600 hover:underline dark:text-blue-400" title={d.name}>{d.name}</a>
                      <button className="text-gray-300 hover:text-red-500" onClick={() => remove(d.id)}>🗑</button>
                    </li>
                  ))}
                </ul>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DocsSection;
