'use client';
// Pièces jointes HSE (registres/incidents). Téléversement via route service_role (bucket privé, URLs
// signées) ; LIAISON d'un document DÉJÀ existant (projet…) sans re-téléverser = anti-doublon.
// Les pièces « sensibles » (santé, Loi 25) ne sont visibles/ajoutables qu'avec canHr (RH).
import React, { useEffect, useState } from 'react';
import { Loader2, Paperclip, Upload, Link2, Trash2, FileText, ShieldAlert } from 'lucide-react';
import { findLinkableDocuments, linkExistingDocument, type HseEntity, type LinkableDoc } from '@/lib/hse/attachments';

type Tr = (fr: string, en: string) => string;
export function HseAttachments({ tenant, entityType, entityId, canHr, projectId, tr }: {
  tenant: string; entityType: HseEntity; entityId: string; canHr: boolean; projectId?: string | null; tr: Tr;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sensitive, setSensitive] = useState(false);
  const [linkables, setLinkables] = useState<LinkableDoc[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // Hyperlien externe libre (SharePoint, Drive, site web…) — sans téléverser de fichier.
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/hse/attachments?tenant=${encodeURIComponent(tenant)}&entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`, { credentials: 'include' });
      const j = await r.json(); setItems(r.ok ? (j.items || []) : []);
    } catch { setItems([]); }
    setLoading(false);
  }
  useEffect(() => { if (entityId) load(); /* eslint-disable-next-line */ }, [entityId]);

  async function upload(file: File) {
    setBusy(true); setErr(null);
    const fd = new FormData();
    fd.append('tenant', tenant); fd.append('entityType', entityType); fd.append('entityId', entityId);
    fd.append('sensitive', String(sensitive)); fd.append('file', file);
    const r = await fetch('/api/hse/attachments', { method: 'POST', body: fd, credentials: 'include' });
    if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || tr('Échec du téléversement', 'Upload failed')); }
    else await load();
    setBusy(false);
  }
  async function remove(id: string) {
    if (!confirm(tr('Supprimer cette pièce jointe ?', 'Delete this attachment?'))) return;
    await fetch(`/api/hse/attachments?tenant=${encodeURIComponent(tenant)}&id=${id}`, { method: 'DELETE', credentials: 'include' });
    await load();
  }
  async function openLinkables() {
    setLinkables(await findLinkableDocuments(tenant, { projectId }));
  }
  async function addHyperlink() {
    let url = linkUrl.trim(); if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;   // tolère un lien collé sans schéma
    setBusy(true); setErr(null);
    const { error } = await linkExistingDocument(tenant, { entity_type: entityType, entity_id: entityId, file_name: (linkName.trim() || url), file_url: url, source_module: 'url', source_ref_id: url });
    if (error) setErr(error);
    else { setLinkUrl(''); setLinkName(''); setShowLink(false); await load(); }
    setBusy(false);
  }
  async function link(d: LinkableDoc) {
    setBusy(true);
    await linkExistingDocument(tenant, { entity_type: entityType, entity_id: entityId, file_name: d.file_name, file_url: d.file_url, source_module: d.source_module, source_ref_id: d.source_ref_id });
    setLinkables(null); await load(); setBusy(false);
  }

  const btn = 'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold';
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-900/30">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300"><Paperclip size={13} /> {tr('Pièces jointes', 'Attachments')} ({items.length})</div>
      {err && <div className="mb-2 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:bg-rose-900/20">{err}</div>}
      {loading ? <div className="py-2 text-gray-400"><Loader2 size={14} className="animate-spin" /></div> : (
        <div className="space-y-1">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-xs dark:bg-gray-800">
              <FileText size={13} className="shrink-0 text-gray-400" />
              {a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-blue-600 hover:underline">{a.file_name}</a> : <span className="flex-1 truncate">{a.file_name}</span>}
              {a.sensitive && <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><ShieldAlert size={10} /> {tr('santé', 'health')}</span>}
              {a.source_module === 'url' && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">{tr('lien', 'link')}</span>}
              {a.source_module && a.source_module !== 'upload' && a.source_module !== 'url' && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700">{tr('lié', 'linked')}</span>}
              <button onClick={() => remove(a.id)} className="text-gray-300 hover:text-rose-600"><Trash2 size={13} /></button>
            </div>
          ))}
          {items.length === 0 && <div className="py-1 text-[11px] text-gray-400">{tr('Aucune pièce.', 'No attachment.')}</div>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className={`${btn} cursor-pointer border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10`}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} {tr('Téléverser', 'Upload')}
          <input type="file" className="hidden" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }} />
        </label>
        <button onClick={openLinkables} className={`${btn} border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-600`}><Link2 size={13} /> {tr('Lier un document existant', 'Link existing document')}</button>
        <button onClick={() => setShowLink(v => !v)} className={`${btn} border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-600`}><Link2 size={13} /> {tr('Ajouter un hyperlien', 'Add hyperlink')}</button>
        {canHr && <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><input type="checkbox" checked={sensitive} onChange={e => setSensitive(e.target.checked)} className="accent-amber-600" /> {tr('marquer santé (sensible)', 'mark as health (sensitive)')}</label>}
      </div>
      {showLink && (
        <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
          <label className="text-[11px] font-semibold text-gray-500">{tr('URL du document', 'Document URL')}
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addHyperlink(); }} placeholder="https://…  (SharePoint, Drive, site…)" className="mt-0.5 w-72 rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900" />
          </label>
          <label className="text-[11px] font-semibold text-gray-500">{tr('Nom (optionnel)', 'Name (optional)')}
            <input value={linkName} onChange={e => setLinkName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addHyperlink(); }} placeholder={tr('ex. FDS fournisseur', 'e.g. supplier SDS')} className="mt-0.5 w-44 rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900" />
          </label>
          <button onClick={addHyperlink} disabled={busy || !linkUrl.trim()} className={`${btn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10`}>{busy ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />} {tr('Ajouter', 'Add')}</button>
        </div>
      )}
      {linkables && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('Documents existants (aucune copie créée)', 'Existing documents (no copy created)')}</div>
          {linkables.length === 0 ? <div className="text-[11px] text-gray-400">{tr('Aucun document liable.', 'No linkable document.')}</div> : linkables.map((d, i) => (
            <button key={i} onClick={() => link(d)} className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700">
              <Link2 size={12} className="text-gray-400" /> <span className="flex-1 truncate">{d.file_name}</span> <span className="text-[10px] text-gray-400">{d.context || d.source_module}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HseAttachments;
