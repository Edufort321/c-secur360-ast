'use client';
// Arborescence CLIENT → ÉQUIPEMENTS à vérifier (module Maintenance, phase 2). Une compagnie de service
// voit tous ses clients (admin OU custom) avec les équipements rattachés et l'état de leur dernière
// inspection ; rattache/déplace un équipement, crée un client custom, et lance une inspection depuis l'arbre.
import { useEffect, useState } from 'react';
import { Loader2, Plus, ChevronRight, ChevronDown, ClipboardCheck, Building2, X } from 'lucide-react';
import {
  getServiceClients, createServiceClient, getServiceEquipment, setEquipmentClient, getLastInspections,
  type SClient, type SEquip, type LastInsp,
} from '@/lib/serviceTree';
import { getInspectionTemplates, RESULT_META, countItems, type InspectionFormTemplate } from '@/lib/inspectionForms';
import InspectionFill from '@/components/maintenance/InspectionFill';

type Tr = (fr: string, en: string) => string;
const resBadge = (c?: string) => (({ emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700', red: 'bg-red-600 text-white' } as Record<string, string>)[c || ''] || 'bg-gray-100 text-gray-500');

export default function ClientTree({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [clients, setClients] = useState<SClient[]>([]);
  const [equip, setEquip] = useState<SEquip[]>([]);
  const [last, setLast] = useState<Record<string, LastInsp>>({});
  const [templates, setTemplates] = useState<InspectionFormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [newClient, setNewClient] = useState('');
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState<{ equipmentId: string; clientId: string | null } | null>(null);
  const [fill, setFill] = useState<{ template: InspectionFormTemplate; equipmentId: string; clientId: string | null } | null>(null);

  async function reload() {
    setLoading(true);
    const [c, e, l] = await Promise.all([getServiceClients(tenant), getServiceEquipment(tenant), getLastInspections(tenant)]);
    setClients(c); setEquip(e); setLast(l); setLoading(false);
  }
  useEffect(() => {
    reload();
    getInspectionTemplates(tenant).then(t => setTemplates(t.filter(x => x.active !== false)), () => {});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [tenant]);

  const equipOptions = equip.map(e => ({ id: e.id, name: e.name }));
  const byClient = (cid: string) => equip.filter(e => e.client_id === cid);
  const unassigned = equip.filter(e => !e.client_id);
  const toggle = (id: string) => setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function addClient() {
    if (!newClient.trim()) return;
    setBusy(true); const r = await createServiceClient(tenant, newClient); setBusy(false);
    if (!r.error) { setNewClient(''); reload(); } else alert(r.error);
  }
  async function moveEquip(equipmentId: string, clientId: string | null) {
    await setEquipmentClient(tenant, equipmentId, clientId); reload();
  }

  if (fill) {
    return <InspectionFill tenant={tenant} tr={tr} template={fill.template} equipmentOptions={equipOptions}
      presetEquipmentId={fill.equipmentId} clientId={fill.clientId}
      onClose={() => setFill(null)} onSaved={() => { setFill(null); reload(); }} />;
  }

  // Ligne d'équipement (réutilisée par client + non-assignés)
  const EquipRow = (e: SEquip) => {
    const li = last[e.id];
    const rm = li?.result ? RESULT_META[li.result as keyof typeof RESULT_META] : null;
    return (
      <div key={e.id} className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-3 py-2 dark:border-gray-700/50">
        <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-100">{e.name}{e.serial ? <span className="text-gray-400"> · {e.serial}</span> : ''}</span>
        {rm ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${resBadge(rm.color)}`}>{tr(rm.fr, rm.en)}{li?.date ? ` · ${li.date}` : ''}</span>
          : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:bg-gray-700">{tr('jamais inspecté', 'never inspected')}</span>}
        <select value={e.client_id || ''} onChange={ev => moveEquip(e.id, ev.target.value || null)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900" title={tr('Rattacher à un client', 'Assign to client')}>
          <option value="">{tr('— non assigné —', '— unassigned —')}</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setPicker({ equipmentId: e.id, clientId: e.client_id || null })} disabled={!templates.length} title={!templates.length ? tr('Créez d’abord un formulaire', 'Create a form first') : ''} className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><ClipboardCheck size={13} /> {tr('Inspecter', 'Inspect')}</button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <Building2 size={16} className="text-orange-600" />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Clients & équipements à vérifier', 'Clients & equipment to inspect')}</span>
        <div className="ml-auto flex items-center gap-2">
          <input value={newClient} onChange={e => setNewClient(e.target.value)} onKeyDown={e => e.key === 'Enter' && addClient()} placeholder={tr('Nouveau client (custom)', 'New client (custom)')} className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <button onClick={addClient} disabled={busy || !newClient.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">{busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {tr('Client', 'Client')}</button>
        </div>
      </div>

      {loading ? <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div> : (
        <div className="space-y-2">
          {clients.map(c => {
            const items = byClient(c.id); const isOpen = open.has(c.id);
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <button onClick={() => toggle(c.id)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <Building2 size={15} className="text-slate-500" />
                  <span className="font-bold text-gray-800 dark:text-gray-100">{c.name}</span>
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-700">{items.length} {tr('équip.', 'equip.')}</span>
                </button>
                {isOpen && (items.length ? items.map(EquipRow) : <div className="px-3 py-3 text-xs text-gray-400">{tr('Aucun équipement. Rattachez-en via la liste « non assignés » ci-dessous.', 'No equipment. Assign some from the "unassigned" list below.')}</div>)}
              </div>
            );
          })}
          {clients.length === 0 && <p className="text-sm text-gray-400">{tr('Aucun client. Ajoutez vos clients (ou importez-les dans l’admin) puis rattachez les équipements.', 'No client. Add your clients (or import them in admin) then assign equipment.')}</p>}

          {/* Équipements non assignés */}
          <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
            <div className="px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300">{tr('Équipements non assignés', 'Unassigned equipment')} <span className="ml-1 text-gray-400">({unassigned.length})</span></div>
            {unassigned.map(EquipRow)}
            {unassigned.length === 0 && <div className="px-3 pb-3 text-xs text-gray-400">{tr('Tous les équipements sont rattachés à un client.', 'All equipment is assigned to a client.')}</div>}
          </div>
        </div>
      )}

      {/* Sélecteur de formulaire avant l'inspection */}
      {picker && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={() => setPicker(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{tr('Choisir le formulaire', 'Choose the form')}</h3><button onClick={() => setPicker(null)} className="text-gray-400 hover:text-gray-700">✕</button></div>
            <div className="space-y-2">
              {templates.map(t => (
                <button key={t.id} onClick={() => { setFill({ template: t, equipmentId: picker.equipmentId, clientId: picker.clientId }); setPicker(null); }} className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/10">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{t.name}</span>
                  <span className="text-[11px] text-gray-400">{countItems(t)} {tr('points', 'items')}</span>
                </button>
              ))}
              {templates.length === 0 && <p className="text-xs text-gray-400">{tr('Aucun formulaire actif. Créez-en un dans « Formulaires d’inspection ».', 'No active form. Create one in "Inspection forms".')}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
