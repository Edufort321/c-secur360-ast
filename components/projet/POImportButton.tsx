'use client';
// Import IA d'un BON DE COMMANDE sur un projet : téléverse le BC (PDF/image), l'IA extrait n° de BC,
// montant, dates, titre + profil client (adresse, facturation, contacts). On PRÉ-REMPLIT le projet
// (via onApply), on COMPLÈTE la fiche client (sans écraser), et on enregistre le BC en pièce jointe.
import React, { useRef, useState } from 'react';
import { Loader2, Sparkles, FileUp } from 'lucide-react';
import { applyPoClientProfile } from '@/lib/poImport';
import { uploadProjectAttachment } from '@/lib/projectAttachments';

type Tr = (fr: string, en: string) => string;
type Extracted = {
  po_number: string; po_amount: number; po_date: string; title: string; work_start: string; work_end: string;
  client_name: string; client: any; contacts: any[];
};

const fileToDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target?.result as string); r.onerror = rej; r.readAsDataURL(f); });

export function POImportButton({ tenant, projectId, project, tr, onApply }: {
  tenant: string; projectId?: string | null; project?: any; tr: Tr;
  onApply: (fields: Record<string, any>) => void; // le parent fusionne dans le projet (po_number, po_amount, dates, titre, client)
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [ex, setEx] = useState<Extracted | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(f: File | null | undefined) {
    if (!f) return;
    setBusy(true); setMsg(null); setEx(null); setFile(f);
    try {
      const dataUrl = await fileToDataUrl(f);
      const resp = await fetch('/api/projects/extract-po', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileBase64: dataUrl, file_name: f.name, media_type: f.type }) });
      const j = await resp.json();
      if (!resp.ok || j.error) { setMsg(j.error || tr('Lecture du bon de commande échouée.', 'PO read failed.')); return; }
      setEx(j as Extracted);
    } catch (e: any) { setMsg('Erreur : ' + (e?.message || e)); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function apply() {
    if (!ex) return;
    setBusy(true); setMsg(null);
    try {
      // 1) Mettre à jour / compléter le client (sans écraser) + récupérer son id.
      const res = await applyPoClientProfile(tenant, {
        clientId: project?.end_client_id || null, clientName: ex.client_name || project?.client_name || null,
        client: ex.client || {}, contacts: ex.contacts || [],
      });
      // 2) Pré-remplir le projet (le parent enregistre).
      onApply({
        po_number: ex.po_number || undefined,
        po_amount: ex.po_amount || undefined,
        title: (!project?.title && ex.title) ? ex.title : undefined,
        client_name: ex.client_name || undefined,
        date_submission: ex.po_date || undefined,
        date_work_start: ex.work_start || undefined,
        end_client_id: res.clientId || undefined,
      });
      // 3) Enregistrer le BC en pièce jointe (type bon_commande).
      let attached = false;
      if (projectId && file) { const r = await uploadProjectAttachment(tenant, projectId, file, 'bon_commande'); attached = !r.error; }
      const parts = [tr('Projet pré-rempli', 'Project pre-filled')];
      if (res.created) parts.push(tr('client créé', 'client created'));
      else if (res.updated) parts.push(tr('fiche client complétée', 'client profile completed'));
      if (res.contactsAdded) parts.push(`${res.contactsAdded} ${tr('contact(s) ajouté(s)', 'contact(s) added')}`);
      if (attached) parts.push(tr('BC joint', 'PO attached'));
      setMsg('✓ ' + parts.join(' · ') + '. ' + tr('Vérifiez et enregistrez.', 'Review and save.'));
      setEx(null); setFile(null);
    } catch (e: any) { setMsg('Erreur : ' + (e?.message || e)); }
    finally { setBusy(false); }
  }

  const v = (s?: string) => s && String(s).trim() ? s : '—';
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-500/30 dark:bg-violet-900/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold text-violet-800 dark:text-violet-200">{tr('Bon de commande — import IA', 'Purchase order — AI import')}</div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />} {tr('Importer le BC (PDF/image)', 'Import PO (PDF/image)')}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
      </div>
      <p className="mt-1 text-[11px] text-violet-700/80 dark:text-violet-300/80">{tr('L\'IA lit le bon de commande, pré-remplit le projet (n°, montant, dates) et complète la fiche client (adresse de facturation, contacts). Le BC est joint au projet.', 'AI reads the PO, pre-fills the project (#, amount, dates) and completes the client profile (billing address, contacts). The PO is attached to the project.')}</p>
      {msg && <div className="mt-2 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs text-violet-700 dark:border-violet-500/30 dark:bg-gray-800 dark:text-violet-300">{msg}</div>}

      {ex && (
        <div className="mt-2 rounded-lg border border-violet-200 bg-white p-3 text-xs dark:border-violet-500/30 dark:bg-gray-800">
          <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            <div><span className="text-gray-400">{tr('N° BC', 'PO #')} :</span> <b>{v(ex.po_number)}</b></div>
            <div><span className="text-gray-400">{tr('Montant', 'Amount')} :</span> <b>{ex.po_amount ? `${ex.po_amount.toLocaleString('fr-CA')} $` : '—'}</b></div>
            <div><span className="text-gray-400">{tr('Date', 'Date')} :</span> <b>{v(ex.po_date)}</b></div>
            <div className="sm:col-span-2"><span className="text-gray-400">{tr('Titre', 'Title')} :</span> <b>{v(ex.title)}</b></div>
            <div><span className="text-gray-400">{tr('Début', 'Start')} :</span> <b>{v(ex.work_start)}</b></div>
            <div className="sm:col-span-3"><span className="text-gray-400">{tr('Client', 'Client')} :</span> <b>{v(ex.client_name)}</b> {ex.client?.billing_address ? `· ${tr('facturation', 'billing')}: ${ex.client.billing_address}` : ''}</div>
            {ex.contacts?.length > 0 && <div className="sm:col-span-3"><span className="text-gray-400">{tr('Contacts', 'Contacts')} :</span> {ex.contacts.map((c: any) => c.name || c.email).filter(Boolean).join(', ')}</div>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setEx(null); setFile(null); }} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>
            <button type="button" onClick={apply} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {tr('Appliquer au projet + client', 'Apply to project + client')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
