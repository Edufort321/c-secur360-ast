'use client';
// Pièces jointes d'un PROJET : documents reçus du client (bon de commande, contrat, devis signé…).
// Upload multi-fichiers avec type, liste avec lien d'ouverture + suppression. Réutilise lib/projectAttachments.
import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Upload, Loader2, Trash2, FileText, ExternalLink } from 'lucide-react';
import {
  getProjectAttachments, uploadProjectAttachment, deleteProjectAttachment,
  PROJECT_ATTACHMENT_TYPES, type ProjectAttachment, type ProjectAttachmentType,
} from '@/lib/projectAttachments';

type Tr = (fr: string, en: string) => string;

function fmtSize(n?: number | null) {
  if (!n) return '';
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export function ProjectAttachments({ tenant, projectId, tr, canEdit = true }: { tenant: string; projectId: string; tr: Tr; canEdit?: boolean }) {
  const [rows, setRows] = useState<ProjectAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<ProjectAttachmentType>('bon_commande');
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => getProjectAttachments(tenant, projectId).then(r => { setRows(r); setLoading(false); });
  useEffect(() => { setLoading(true); reload(); /* eslint-disable-next-line */ }, [tenant, projectId]);

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true); setErr(null);
    try {
      for (const f of Array.from(files)) {
        const { error } = await uploadProjectAttachment(tenant, projectId, f, type);
        if (error) setErr((error as any).message || tr('Erreur de téléversement.', 'Upload error.'));
      }
      await reload();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm(tr('Supprimer cette pièce jointe ?', 'Delete this attachment?'))) return;
    await deleteProjectAttachment(tenant, id);
    await reload();
  }

  const typeLabel = (v?: string) => PROJECT_ATTACHMENT_TYPES.find(t => t.value === v)?.[tr('fr', 'en') as 'fr' | 'en'] || v || '';

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-bold"><Paperclip size={15} /> {tr('Pièces jointes (client)', 'Attachments (client)')} ({rows.length})</h3>
        {canEdit && (
          <div className="flex items-center gap-2">
            <select value={type} onChange={e => setType(e.target.value as ProjectAttachmentType)} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800" title={tr('Type de document', 'Document type')}>
              {PROJECT_ATTACHMENT_TYPES.map(t => <option key={t.value} value={t.value}>{tr(t.fr, t.en)}</option>)}
            </select>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {tr('Ajouter', 'Add')}
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.xls,.xlsx,image/*,application/pdf" onChange={e => onFiles(e.target.files)} />
          </div>
        )}
      </div>
      <p className="mb-2 text-[11px] text-gray-400">{tr('Bon de commande, contrat, devis signé, plans, courriels… reçus du client (PDF, image, Word, Excel — 25 Mo max).', 'Purchase order, contract, signed quote, drawings, emails… received from the client (PDF, image, Word, Excel — 25 MB max).')}</p>
      {err && <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{err}</div>}

      {loading ? (
        <div className="grid place-items-center py-6 text-gray-400"><Loader2 size={18} className="animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400 dark:border-gray-700">{tr('Aucune pièce jointe.', 'No attachment.')}</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-2 text-gray-700 hover:text-blue-600 dark:text-gray-200">
                <FileText size={15} className="shrink-0 text-gray-400" />
                <span className="truncate font-medium">{r.file_name}</span>
                <ExternalLink size={12} className="shrink-0 text-gray-300" />
              </a>
              <div className="flex shrink-0 items-center gap-2 text-xs text-gray-400">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{typeLabel(r.attachment_type)}</span>
                {r.file_size ? <span className="hidden sm:inline">{fmtSize(r.file_size)}</span> : null}
                {r.created_at && <span className="hidden sm:inline">{String(r.created_at).slice(0, 10)}</span>}
                {canEdit && <button type="button" onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500" title={tr('Supprimer', 'Delete')}><Trash2 size={15} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
