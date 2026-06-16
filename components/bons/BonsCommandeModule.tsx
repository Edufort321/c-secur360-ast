'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Trash2, Plus, Send, PackageCheck, Download, FileText, ScanLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { siteInitials, getActiveCatalogue, type CatalogueTaux } from '@/lib/soumissions';
import { PROVINCES } from '@/lib/invoicing';
import { exportBonCommandePdf } from '@/lib/pdf/bonCommandePdf';
import { readDraft, clearDraft, useAutoDraft } from '@/lib/useDraft';
import {
  getBonsCommande, saveBonCommande, deleteBonCommande, genBonNumero, computeBonTotal,
  scanItemsACommander, setJobsApproStatut, receiveToInventory, bonStatusLabel,
  computeReceptionStatus, lineReception,
  type BonCommande, type BonCommandeLigne, type BonCommandeStatus, type ItemACommander,
} from '@/lib/bonsCommande';

export function BonsCommandeModule({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [bons, setBons] = useState<BonCommande[]>([]);
  const [projects, setProjects] = useState<{ id: string; label: string }[]>([]);
  const [cat, setCat] = useState<CatalogueTaux | null>(null);
  const [sitePrefix, setSitePrefix] = useState('XX');
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [form, setForm] = useState<BonCommande | null>(null);
  const [numDraft, setNumDraft] = useState<Record<string, string>>({});
  const [showScan, setShowScan] = useState(false);
  const [scanItems, setScanItems] = useState<ItemACommander[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSel, setScanSel] = useState<Record<number, boolean>>({});
  const [recScan, setRecScan] = useState(false); // import IA du bordereau de réception en cours
  const [pdfBusy, setPdfBusy] = useState(false);
  const [tenantLogo, setTenantLogo] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<{ name: string; contact_name?: string; province?: string }[]>([]);
  const recFileRef = useRef<HTMLInputElement | null>(null);
  const projectLabelOf = (id?: string | null) => projects.find(p => p.id === id)?.label || null;
  // Brouillon auto-sauvegardé du bon en cours d'édition (anti-perte si on quitte la page).
  const draftKey = `bc.${tenant}.${form?.id || 'new'}`;
  useAutoDraft(draftKey, form, view === 'edit' && !!form);

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  const numFR = (s: string) => { const n = Number(String(s).replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';
  const numInput = (id: string, value: number, onValue: (n: number) => void, className: string) => (
    <input type="text" inputMode="decimal" className={className}
      value={numDraft[id] ?? String(value ?? 0)}
      onFocus={e => { setNumDraft(d => ({ ...d, [id]: String(value ?? 0) })); (e.target as HTMLInputElement).select(); }}
      onChange={e => { const raw = e.target.value; setNumDraft(d => ({ ...d, [id]: raw })); onValue(numFR(raw)); }}
      onBlur={() => setNumDraft(d => { const n = { ...d }; delete n[id]; return n; })} />
  );

  async function load() {
    setLoading(true);
    try { setBons(await getBonsCommande(tenant)); } catch { setBons([]); }
    try { setCat(await getActiveCatalogue(tenant)); } catch { /* pas de catalogue */ }
    try {
      const { data } = await supabase.from('projects').select('id, title, project_number').eq('tenant_id', tenant).order('created_at', { ascending: false });
      setProjects((data || []).map((p: any) => ({ id: p.id, label: `${p.project_number ? p.project_number + ' — ' : ''}${p.title || p.id}` })));
    } catch { setProjects([]); }
    try { const { data: t } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle(); setTenantLogo(t?.logo_url || null); } catch { /* logo défaut */ }
    try { const { data: sup } = await supabase.from('suppliers').select('name, contact_name, province').eq('tenant_id', tenant).order('name'); setSuppliers((sup as any[]) || []); } catch { /* répertoire fournisseurs absent */ }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: p } = await supabase.from('planner_personnel').select('succursale').eq('tenant_id', tenant).ilike('email', user.email).maybeSingle();
        setSitePrefix(siteInitials(p?.succursale || tenant));
      } else setSitePrefix(siteInitials(tenant));
    } catch { setSitePrefix(siteInitials(tenant)); }
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenant]);

  const blankLigne = (): BonCommandeLigne => ({ designation: '', quantite: 1, unite: 'u.', cout_unitaire: 0, recu: 0, taxable: true });

  async function nouveau() {
    const numero = await genBonNumero(tenant, sitePrefix);
    const draft = readDraft<BonCommande>(`bc.${tenant}.new`);
    if (draft && (draft.supplier || (draft.items || []).some(l => l.designation)) && window.confirm(tr('Un brouillon non enregistré a été retrouvé. Le restaurer ?', 'An unsaved draft was found. Restore it?'))) {
      setForm(draft); setView('edit'); setNotice(tr('Brouillon restauré.', 'Draft restored.')); return;
    }
    clearDraft(`bc.${tenant}.new`);
    setForm({ numero, supplier: '', supplier_contact: '', project_id: null, status: 'brouillon', items: [blankLigne()], province: 'QC', expected_date: null, notes: '' });
    setView('edit'); setNotice(null);
  }
  function editer(b: BonCommande) {
    const draft = b.id ? readDraft<BonCommande>(`bc.${tenant}.${b.id}`) : null;
    if (draft && window.confirm(tr('Des modifications non enregistrées ont été retrouvées pour ce bon. Les restaurer ?', 'Unsaved changes were found for this order. Restore them?'))) {
      setForm({ ...draft, id: b.id }); setView('edit'); setNotice(tr('Brouillon restauré.', 'Draft restored.')); return;
    }
    setForm({ ...b, items: (b.items || []).map(l => ({ ...l })) }); setView('edit'); setNotice(null);
  }

  const updLigne = (i: number, patch: Partial<BonCommandeLigne>) => setForm(f => f ? { ...f, items: f.items.map((l, j) => j === i ? { ...l, ...patch } : l) } : f);
  const addLigne = () => setForm(f => f ? { ...f, items: [...f.items, blankLigne()] } : f);
  const delLigne = (i: number) => setForm(f => f ? { ...f, items: f.items.filter((_, j) => j !== i) } : f);

  // Sélection d'un article du catalogue (datalist) -> remplit code + coût
  const onDesignation = (i: number, val: string) => {
    const mat = (cat?.materials || []).find(m => m.name === val);
    if (mat) updLigne(i, { designation: val, code: mat.sku || '', cout_unitaire: Number(mat.cost_price) || 0 });
    else updLigne(i, { designation: val });
  };

  async function save() {
    if (!form) return;
    setNotice(null);
    // Le statut suit l'état de réception des lignes (reçu/partiel) sans rétrograder un envoi/brouillon.
    const toSave = { ...form, status: computeReceptionStatus(form.items, form.status) };
    try { await saveBonCommande(tenant, toSave); clearDraft(draftKey); setNotice(tr('Bon de commande enregistré.', 'Purchase order saved.')); setView('list'); setForm(null); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }

  async function envoyer() {
    if (!form) return;
    setNotice(null);
    try {
      const updated = { ...form, status: 'envoye' as BonCommandeStatus };
      await saveBonCommande(tenant, updated);
      // Lien planificateur : marquer les items source comme « commandé »
      const refs = (form.items || []).filter(l => l.source_job_id != null && l.source_index != null).map(l => ({ job_id: l.source_job_id!, index: l.source_index! }));
      let n = 0; if (refs.length) n = await setJobsApproStatut(tenant, refs, 'commande');
      setNotice(tr(`Bon envoyé.${n ? ` ${n} item(s) de mandat marqués « commandé ».` : ''}`, `Order sent.${n ? ` ${n} job item(s) marked "ordered".` : ''}`));
      setForm(updated); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }

  // Valide la réception selon les quantités RÉELLEMENT saisies (réception partielle permise) ;
  // ne pousse à l'inventaire que le delta non encore comptabilisé. `tout=true` => reçoit tout.
  async function recevoir(tout = false) {
    if (!form) return;
    const items = form.items.map(l => ({ ...l, recu: tout ? (Number(l.quantite) || 0) : (Number(l.recu) || 0) }));
    if (!items.some(l => (Number(l.recu) || 0) > (Number(l.recu_synced) || 0))) {
      setNotice(tr('Aucune quantité reçue à comptabiliser. Saisissez les quantités reçues (ou importez le bordereau) puis réessayez.', 'No received quantity to record. Enter received quantities (or import the slip) then retry.'));
      return;
    }
    const msg = tout
      ? tr('Marquer TOUT comme reçu et ajouter les quantités à l\'inventaire ?', 'Mark ALL as received and add quantities to inventory?')
      : tr('Comptabiliser les quantités reçues saisies et les ajouter à l\'inventaire ?', 'Record the entered received quantities and add them to inventory?');
    if (!window.confirm(msg)) return;
    setNotice(null);
    try {
      const res = await receiveToInventory(tenant, { ...form, items }); // met à jour recu_synced (delta only)
      const status = computeReceptionStatus(items, form.status);
      const received = { ...form, status, items };
      await saveBonCommande(tenant, received);
      const refs = items.filter(l => l.source_job_id != null && l.source_index != null).map(l => ({ job_id: l.source_job_id!, index: l.source_index! }));
      if (refs.length) await setJobsApproStatut(tenant, refs, status === 'recu' ? 'recu' : 'commande');
      setNotice(tr(`${bonStatusLabel(status)} — ${res.synced} article(s) ajoutés à l'inventaire${res.errors ? ` (${res.errors} en erreur)` : ''}.`, `${bonStatusLabel(status, false)} — ${res.synced} item(s) added to inventory${res.errors ? ` (${res.errors} errors)` : ''}.`));
      setForm(received); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }

  async function openScan() {
    setShowScan(true); setScanLoading(true); setScanSel({});
    try { setScanItems(await scanItemsACommander(tenant)); } catch { setScanItems([]); }
    setScanLoading(false);
  }
  function importScan() {
    if (!form) return;
    const chosen = scanItems.filter((_, i) => scanSel[i]);
    if (!chosen.length) { setShowScan(false); return; }
    const lignes: BonCommandeLigne[] = chosen.map(it => ({
      designation: it.text, code: it.code || '', quantite: it.quantite || 1, unite: it.unite || 'u.',
      cout_unitaire: it.cout_unitaire || 0, recu: 0, taxable: true, source_job_id: it.job_id, source_index: it.index,
    }));
    // Si le bon n'a qu'une ligne vide, on la remplace
    setForm(f => {
      if (!f) return f;
      const base = (f.items.length === 1 && !f.items[0].designation) ? [] : f.items;
      const firstProj = f.project_id || chosen.find(c => c.project_id)?.project_id || null;
      return { ...f, project_id: firstProj, items: [...base, ...lignes] };
    });
    setShowScan(false);
  }

  // ── Import IA du bordereau de réception (image / PDF / Excel) ───────────────
  async function onReceptionFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ''; // permet de re-sélectionner le même fichier
    if (!file || !form) return;
    if (file.size > 12 * 1024 * 1024) { setNotice(tr('Fichier trop volumineux (max 12 Mo).', 'File too large (max 12 MB).')); return; }
    setRecScan(true); setNotice(tr('Lecture du bordereau par l\'IA…', 'AI reading the reception slip…'));
    try {
      const dataUrl: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = rej; r.readAsDataURL(file); });
      const resp = await fetch('/api/bons-commande/scan-reception', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ fileBase64: dataUrl, media_type: file.type, file_name: file.name, lines: form.items.map(l => ({ code: l.code, designation: l.designation, quantite: l.quantite, unite: l.unite })) }),
      });
      const jr = await resp.json().catch(() => ({}));
      if (!resp.ok || jr.error) throw new Error(jr.error || `HTTP ${resp.status}`);
      const matches: any[] = Array.isArray(jr.matches) ? jr.matches : [];
      const extras: any[] = Array.isArray(jr.extras) ? jr.extras : [];
      setForm(f => {
        if (!f) return f;
        const items = f.items.map(l => ({ ...l }));
        let applied = 0;
        for (const m of matches) {
          const idx = Number(m.index);
          const qte = Number(m.quantite_recue) || 0;
          if (Number.isInteger(idx) && idx >= 0 && idx < items.length && qte > 0) { items[idx].recu = qte; applied++; }
        }
        // Articles reçus non commandés -> ajoutés en lignes (qté commandée 0, reçu = qté), à valider.
        for (const ex of extras) {
          const qte = Number(ex.quantite_recue) || 0; if (qte <= 0) continue;
          items.push({ designation: `${ex.designation || tr('Article reçu', 'Received item')} ${tr('(non commandé)', '(not ordered)')}`, code: ex.code || '', quantite: 0, unite: 'u.', cout_unitaire: 0, recu: qte, taxable: true });
        }
        const status = computeReceptionStatus(items, f.status);
        setNotice(tr(`Bordereau lu : ${applied} ligne(s) rapprochée(s)${extras.length ? `, ${extras.length} article(s) non commandé(s) ajouté(s)` : ''}. Vérifiez les quantités puis « Recevoir ».`, `Slip read: ${applied} line(s) matched${extras.length ? `, ${extras.length} non-ordered item(s) added` : ''}. Verify quantities then "Receive".`));
        return { ...f, items, status };
      });
    } catch (err: any) {
      setNotice(tr('Échec de lecture du bordereau : ', 'Reception slip read failed: ') + (err?.message || ''));
    } finally { setRecScan(false); }
  }

  async function exportPdf() {
    if (!form) return;
    setPdfBusy(true);
    try { await exportBonCommandePdf({ bon: form, tenant, tenantLogoUrl: tenantLogo, projectLabel: projectLabelOf(form.project_id) }); }
    catch (e: any) { setNotice(tr('Erreur PDF : ', 'PDF error: ') + (e?.message || '')); }
    finally { setPdfBusy(false); }
  }

  const totals = form ? computeBonTotal(form.items || [], form.province || 'QC') : { subtotal: 0, taxes: 0, total: 0 };
  const statusBadge = (s: BonCommandeStatus) => {
    const cls: Record<BonCommandeStatus, string> = {
      brouillon: 'bg-gray-100 text-gray-700', envoye: 'bg-blue-100 text-blue-700', partiel: 'bg-amber-100 text-amber-700',
      recu: 'bg-green-100 text-green-700', annule: 'bg-red-100 text-red-700',
    };
    return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls[s]}`}>{bonStatusLabel(s)}</span>;
  };

  if (loading) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> {tr('Chargement…', 'Loading…')}</div>;

  return (
    <div className="space-y-4">
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{notice}</div>}

      {view === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{tr('Bons de commande', 'Purchase orders')}</h2>
            {canEdit && <button onClick={nouveau} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} /> {tr('Nouveau', 'New')}</button>}
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-900/40">
                <tr><th className="px-3 py-2">{tr('Numéro', 'Number')}</th><th className="px-3 py-2">{tr('Fournisseur', 'Supplier')}</th><th className="px-3 py-2">{tr('Projet', 'Project')}</th><th className="px-3 py-2">{tr('Statut', 'Status')}</th><th className="px-3 py-2 text-right">{tr('Total', 'Total')}</th><th className="px-3 py-2"></th></tr>
              </thead>
              <tbody>
                {bons.map(b => (
                  <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-800/40">
                    <td className="px-3 py-2 font-mono">{b.numero}</td>
                    <td className="px-3 py-2">{b.supplier || '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{projectLabelOf(b.project_id) || '—'}</td>
                    <td className="px-3 py-2">{statusBadge(b.status)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{mny(b.total || 0)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => editer(b)} className="text-blue-600 hover:underline">{tr('Ouvrir', 'Open')}</button>
                      {canEdit && <button onClick={async () => { if (window.confirm(tr('Supprimer ce bon ?', 'Delete this order?')) && b.id) { await deleteBonCommande(tenant, b.id); clearDraft(`bc.${tenant}.${b.id}`); await load(); } }} className="ml-3 text-red-500 hover:text-red-700"><Trash2 size={14} className="inline" /></button>}
                    </td>
                  </tr>
                ))}
                {bons.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">{tr('Aucun bon de commande.', 'No purchase orders.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'edit' && form && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button onClick={() => { setView('list'); setForm(null); }} className="text-sm text-gray-500 hover:underline">← {tr('Retour', 'Back')}</button>
              <h2 className="text-lg font-bold font-mono">{form.numero}</h2>
              {statusBadge(form.status)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={exportPdf} disabled={pdfBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">{pdfBusy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />} {tr('PDF', 'PDF')}</button>
              {canEdit && (
                <>
                  <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"><Download size={15} /> {tr('Enregistrer', 'Save')}</button>
                  {form.status === 'brouillon' && <button onClick={envoyer} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Send size={15} /> {tr('Envoyer', 'Send')}</button>}
                  {form.status !== 'brouillon' && (
                    <>
                      <input ref={recFileRef} type="file" accept="image/*,application/pdf,.xls,.xlsx,.csv" className="hidden" onChange={onReceptionFile} />
                      <button onClick={() => recFileRef.current?.click()} disabled={recScan} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50">{recScan ? <Loader2 size={15} className="animate-spin" /> : <ScanLine size={15} />} {tr('Bordereau (IA)', 'Slip (AI)')}</button>
                      <button onClick={() => recevoir(false)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"><PackageCheck size={15} /> {tr('Valider la réception', 'Confirm receipt')}</button>
                      {form.status !== 'recu' && <button onClick={() => recevoir(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-green-400 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">{tr('Tout recevoir', 'Receive all')}</button>}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* En-tête */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Fournisseur', 'Supplier')}</span>
              <input value={form.supplier || ''} list="bc-suppliers" onChange={e => { const v = e.target.value; const m = suppliers.find(s => s.name === v); setForm(f => f ? { ...f, supplier: v, supplier_contact: m?.contact_name || f.supplier_contact, province: m?.province || f.province } : f); }} className={`mt-1 w-full ${inputCls}`} placeholder={tr('Choisir / saisir…', 'Pick / type…')} />
              <datalist id="bc-suppliers">{suppliers.map((s, i) => <option key={i} value={s.name} />)}</datalist></label>
            <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Contact fournisseur', 'Supplier contact')}</span>
              <input value={form.supplier_contact || ''} onChange={e => setForm(f => f ? { ...f, supplier_contact: e.target.value } : f)} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Projet (optionnel)', 'Project (optional)')}</span>
              <select value={form.project_id || ''} onChange={e => setForm(f => f ? { ...f, project_id: e.target.value || null } : f)} className={`mt-1 w-full ${inputCls}`}>
                <option value="">—</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Province', 'Province')}</span>
                <select value={form.province || 'QC'} onChange={e => setForm(f => f ? { ...f, province: e.target.value } : f)} className={`mt-1 w-full ${inputCls}`}>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select></label>
              <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Date prévue', 'Expected')}</span>
                <input type="date" value={form.expected_date || ''} onChange={e => setForm(f => f ? { ...f, expected_date: e.target.value || null } : f)} className={`mt-1 w-full ${inputCls}`} /></label>
            </div>
          </div>

          {/* Datalist catalogue */}
          <datalist id="bc-materials">
            {(cat?.materials || []).map((m, mi) => <option key={mi} value={m.name}>{m.sku ? `${m.sku} — ` : ''}{mny(m.cost_price ?? 0)}</option>)}
          </datalist>

          {/* Lignes */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-700">
              <span className="text-sm font-semibold">{tr('Articles', 'Items')}</span>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button onClick={openScan} className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">🛒 {tr('Importer « À commander » (mandats)', 'Import "to order" (jobs)')}</button>
                  <button onClick={addLigne} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Ligne', 'Line')}</button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-gray-400">
                  <tr>
                    <th className="px-2 py-1">{tr('Code', 'Code')}</th><th className="px-2 py-1">{tr('Désignation', 'Designation')}</th>
                    <th className="px-2 py-1 text-right">{tr('Qté', 'Qty')}</th><th className="px-2 py-1">{tr('Unité', 'Unit')}</th>
                    <th className="px-2 py-1 text-right">{tr('Coût unit.', 'Unit cost')}</th><th className="px-2 py-1 text-right">{tr('Reçu', 'Received')}</th>
                    <th className="px-2 py-1 text-center">{tr('Tax', 'Tax')}</th><th className="px-2 py-1 text-right">{tr('Montant', 'Amount')}</th><th className="px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((l, i) => (
                    <tr key={i} className="border-t border-gray-50 dark:border-gray-700/50">
                      <td className="px-2 py-1"><input value={l.code || ''} onChange={e => updLigne(i, { code: e.target.value })} className={`w-24 ${inputCls}`} /></td>
                      <td className="px-2 py-1"><input value={l.designation} list="bc-materials" onChange={e => onDesignation(i, e.target.value)} placeholder={tr('Choisir / saisir…', 'Pick / type…')} className={`w-full min-w-[10rem] ${inputCls}`} /></td>
                      <td className="px-2 py-1">{numInput(`q_${i}`, l.quantite, v => updLigne(i, { quantite: v }), `w-16 text-right ${inputCls}`)}</td>
                      <td className="px-2 py-1"><input value={l.unite || ''} onChange={e => updLigne(i, { unite: e.target.value })} className={`w-14 ${inputCls}`} /></td>
                      <td className="px-2 py-1">{numInput(`c_${i}`, l.cout_unitaire, v => updLigne(i, { cout_unitaire: v }), `w-24 text-right ${inputCls}`)}</td>
                      <td className="px-2 py-1">
                        {(() => {
                          const st = lineReception(l);
                          const ring = st === 'over' ? 'border-red-400' : st === 'partial' ? 'border-amber-400' : st === 'complete' ? 'border-green-400' : 'border-gray-200 dark:border-gray-700';
                          const dot = st === 'over' ? '⚠️' : st === 'partial' ? '⏳' : st === 'complete' ? '✓' : '';
                          const title = st === 'over' ? tr('Surplus reçu vs commandé', 'Over-received vs ordered') : st === 'partial' ? tr('Partiellement reçu', 'Partially received') : st === 'complete' ? tr('Reçu au complet', 'Fully received') : tr('Rien reçu', 'Nothing received');
                          return (
                            <div className="flex items-center justify-end gap-1" title={title}>
                              {numInput(`r_${i}`, l.recu ?? 0, v => updLigne(i, { recu: v }), `w-14 text-right ${inputCls} ${ring}`)}
                              <span className="w-3 text-xs">{dot}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-1 text-center"><input type="checkbox" checked={l.taxable !== false} onChange={e => updLigne(i, { taxable: e.target.checked })} /></td>
                      <td className="px-2 py-1 text-right font-medium">{mny((Number(l.quantite) || 0) * (Number(l.cout_unitaire) || 0))}</td>
                      <td className="px-2 py-1 text-right">{canEdit && <button onClick={() => delLigne(i)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="flex flex-col items-end gap-0.5 text-sm">
            <div>{tr('Sous-total', 'Subtotal')} : <span className="font-semibold">{mny(totals.subtotal)}</span></div>
            <div>{tr('Taxes', 'Taxes')} : <span className="font-semibold">{mny(totals.taxes)}</span></div>
            <div className="text-lg font-bold">{tr('Total', 'Total')} : {mny(totals.total)}</div>
          </div>

          <label className="block"><span className="text-xs font-semibold text-gray-500">{tr('Notes', 'Notes')}</span>
            <textarea value={form.notes || ''} onChange={e => setForm(f => f ? { ...f, notes: e.target.value } : f)} rows={2} className={`mt-1 w-full ${inputCls}`} /></label>
        </div>
      )}

      {/* Modale import « À commander » */}
      {showScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowScan(false)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-bold">{tr('Items « à commander » des mandats', 'Job items "to order"')}</h3>
            {scanLoading ? <div className="flex items-center gap-2 py-6 text-gray-500"><Loader2 className="animate-spin" size={16} /> {tr('Analyse…', 'Scanning…')}</div> : (
              scanItems.length === 0 ? <p className="py-6 text-center text-gray-400">{tr('Aucun item « à commander » dans les mandats.', 'No "to order" items in jobs.')}</p> : (
                <div className="space-y-1">
                  {scanItems.map((it, i) => (
                    <label key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                      <input type="checkbox" checked={!!scanSel[i]} onChange={e => setScanSel(s => ({ ...s, [i]: e.target.checked }))} />
                      <span className="flex-1">{it.text || tr('(sans nom)', '(no name)')}</span>
                      <span className="text-xs text-gray-400">{it.quantite} {it.unite}</span>
                      <span className="text-xs text-gray-400">· {it.job_nom}</span>
                    </label>
                  ))}
                </div>
              )
            )}
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setShowScan(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600">{tr('Annuler', 'Cancel')}</button>
              <button onClick={importScan} disabled={scanItems.length === 0} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{tr('Ajouter la sélection', 'Add selection')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
