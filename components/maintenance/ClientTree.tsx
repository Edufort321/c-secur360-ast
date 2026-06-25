'use client';
// Arborescence CLIENT → ÉQUIPEMENTS (module Maintenance). Une compagnie de service voit ses clients
// (admin OU custom) avec les équipements rattachés et l'état de leur dernière inspection. On CRÉE des
// équipements (nom, # série, marque, modèle, récurrence, alertes QR), on imprime leur QR (multi-format,
// comme l'inventaire), on rattache/déplace, et on lance une INSPECTION depuis un GABARIT existant.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, ChevronRight, ChevronDown, ClipboardCheck, Building2, X, QrCode, Pencil, Trash2, Bell, MapPin, Tag, Download, History } from 'lucide-react';
import {
  getServiceClients, createServiceClient, getServiceEquipment, setEquipmentClient, getLastInspections, getClientProjectCounts,
  createServiceEquipment, updateServiceEquipment, deleteServiceEquipment, getSiteNames, getEquipmentHistory,
  type SClient, type SEquip, type LastInsp, type EquipInput, type HistItem,
} from '@/lib/serviceTree';
import { getSitesTree, type SiteNode } from '@/lib/sites';
import { RESULT_META } from '@/lib/inspectionForms';
import { getGabarits, type Gabarit } from '@/lib/maintGabarits';
import MaintInspectFill from '@/components/maintenance/MaintInspectFill';
import EquipmentQrPrint from '@/components/maintenance/EquipmentQrPrint';
import ImportEquipmentPanel from '@/components/maintenance/ImportEquipmentPanel';

type Tr = (fr: string, en: string) => string;
const resBadge = (c?: string) => (({ emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', rose: 'bg-rose-100 text-rose-700', red: 'bg-red-600 text-white' } as Record<string, string>)[c || ''] || 'bg-gray-100 text-gray-500');
const FREQS = ['', 'quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'semestriel', 'annuel'];
const INP = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900';

// Niveaux de regroupement disponibles SOUS le client (ordre fixe ; activables/désactivables).
type LevelId = 'site' | 'location' | 'type';
const NONE = '—';

type EquipDraft = EquipInput & { id?: string };

export default function ClientTree({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [clients, setClients] = useState<SClient[]>([]);
  const [equip, setEquip] = useState<SEquip[]>([]);
  const [last, setLast] = useState<Record<string, LastInsp>>({});
  const [projCounts, setProjCounts] = useState<Record<string, number>>({});
  const [gabarits, setGabarits] = useState<Gabarit[]>([]);
  const [siteNames, setSiteNames] = useState<Record<string, string>>({});
  const [sites, setSites] = useState<SiteNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [newClient, setNewClient] = useState('');
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState<{ equipment: SEquip } | null>(null);
  const [fill, setFill] = useState<{ gabarit: Gabarit; equipment: SEquip } | null>(null);
  const [equipForm, setEquipForm] = useState<EquipDraft | null>(null);
  const [qrPrint, setQrPrint] = useState<SEquip[] | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [hist, setHist] = useState<{ equipment: SEquip; items: HistItem[] | null } | null>(null);
  // Niveaux de regroupement actifs SOUS chaque client (ordre fixe Site → Emplacement → Type).
  const [levels, setLevels] = useState<Set<LevelId>>(new Set<LevelId>(['site', 'location', 'type']));
  const activeLevels = useMemo<LevelId[]>(() => (['site', 'location', 'type'] as LevelId[]).filter(l => levels.has(l)), [levels]);
  const toggleLevel = (l: LevelId) => setLevels(p => { const n = new Set(p); n.has(l) ? n.delete(l) : n.add(l); return n; });

  // Valeur d'un niveau pour un équipement (clé de regroupement).
  const levelValue = (e: SEquip, l: LevelId): string => {
    if (l === 'site') return e.site_id ? (siteNames[e.site_id] || tr('Site inconnu', 'Unknown site')) : NONE;
    if (l === 'location') return (e.location || '').trim() || NONE;
    return (e.type || '').trim() || NONE;
  };

  async function reload() {
    setLoading(true);
    const [c, e, l, pc, sn, st] = await Promise.all([
      getServiceClients(tenant), getServiceEquipment(tenant), getLastInspections(tenant),
      getClientProjectCounts(tenant), getSiteNames(tenant), getSitesTree(tenant),
    ]);
    setClients(c); setEquip(e); setLast(l); setProjCounts(pc); setSiteNames(sn); setSites(st); setLoading(false);
  }
  useEffect(() => {
    reload();
    getGabarits(tenant).then(setGabarits, () => {});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [tenant]);

  const byClient = (cid: string) => equip.filter(e => e.client_id === cid);
  const unassigned = useMemo(() => equip.filter(e => !e.client_id), [equip]);
  const toggle = (id: string) => setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function addClient() {
    if (!newClient.trim()) return;
    setBusy(true); const r = await createServiceClient(tenant, newClient); setBusy(false);
    if (!r.error) { setNewClient(''); reload(); } else alert(r.error);
  }
  async function moveEquip(equipmentId: string, clientId: string | null) {
    await setEquipmentClient(tenant, equipmentId, clientId); reload();
  }
  async function saveEquip() {
    if (!equipForm) return;
    if (!(equipForm.name || '').trim() && !(equipForm.serial || '').trim()) { alert(tr('Nom ou # série requis.', 'Name or serial required.')); return; }
    setBusy(true);
    const r = equipForm.id ? await updateServiceEquipment(tenant, equipForm.id, equipForm) : await createServiceEquipment(tenant, equipForm);
    setBusy(false);
    if (r.error) { alert(r.error); return; }
    setEquipForm(null); reload();
  }
  async function removeEquip(e: SEquip) {
    if (!window.confirm(tr(`Supprimer « ${e.name} » ?`, `Delete "${e.name}"?`))) return;
    await deleteServiceEquipment(tenant, e.id); reload();
  }
  async function openHist(e: SEquip) {
    setHist({ equipment: e, items: null });
    const items = await getEquipmentHistory(tenant, e.id);
    setHist({ equipment: e, items });
  }

  if (fill) {
    return <MaintInspectFill tenant={tenant} tr={tr} gabarit={fill.gabarit} equipment={fill.equipment} clientId={fill.equipment.client_id}
      onClose={() => setFill(null)} onSaved={() => { setFill(null); reload(); }} />;
  }

  const freqLabel = (f?: string | null) => f ? f : null;

  // Ligne d'équipement (réutilisée par client + non-assignés)
  const EquipRow = (e: SEquip) => {
    const li = last[e.id];
    const rm = li?.result ? RESULT_META[li.result as keyof typeof RESULT_META] : null;
    return (
      <div key={e.id} className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-3 py-2 dark:border-gray-700/50">
        <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-100">
          {e.name}{e.serial ? <span className="text-gray-400"> · {e.serial}</span> : ''}
          {(e.brand || e.model) ? <span className="text-gray-400"> · {[e.brand, e.model].filter(Boolean).join(' ')}</span> : ''}
          {e.source === 'dga' && <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" title={tr('Relié à un dossier DGA — ses rapports remontent ici', 'Linked to a DGA dossier — its reports surface here')}>DGA</span>}
          {e.source === 'vehicle' && <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" title={tr('Importé de la flotte de véhicules', 'Imported from the vehicle fleet')}>VÉH</span>}
          {e.source === 'rapport' && <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" title={tr('Importé d’un rapport terrain', 'Imported from a field report')}>RT</span>}
          {e.public_alerts && <Bell size={12} className="ml-1 inline text-orange-500" />}
        </span>
        {freqLabel(e.frequency) && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-gray-700">{e.frequency}</span>}
        {rm ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${resBadge(rm.color)}`}>{tr(rm.fr, rm.en)}{li?.date ? ` · ${li.date}` : ''}</span>
          : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:bg-gray-700">{tr('jamais inspecté', 'never inspected')}</span>}
        <select value={e.client_id || ''} onChange={ev => moveEquip(e.id, ev.target.value || null)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-900" title={tr('Rattacher à un client', 'Assign to client')}>
          <option value="">{tr('— non assigné —', '— unassigned —')}</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => openHist(e)} title={tr('Historique (inspections + DGA)', 'History (inspections + DGA)')} className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-600"><History size={14} /></button>
        <button onClick={() => setQrPrint([e])} title={tr('Imprimer le QR', 'Print QR')} className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-600"><QrCode size={14} /></button>
        <button onClick={() => setEquipForm({ id: e.id, type: e.type || '', name: e.name, serial: e.serial || '', brand: e.brand || '', model: e.model || '', location: e.location || '', frequency: e.frequency || '', public_alerts: !!e.public_alerts, client_id: e.client_id, site_id: e.site_id })} title={tr('Modifier', 'Edit')} className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-600"><Pencil size={14} /></button>
        <button onClick={() => removeEquip(e)} title={tr('Supprimer', 'Delete')} className="rounded-lg border border-gray-300 p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:border-gray-600"><Trash2 size={14} /></button>
        <button onClick={() => setPicker({ equipment: e })} disabled={!gabarits.length} title={!gabarits.length ? tr('Créez d’abord un gabarit', 'Create a template first') : ''} className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><ClipboardCheck size={13} /> {tr('Inspecter', 'Inspect')}</button>
      </div>
    );
  };

  // Rendu récursif : groupe `list` selon `levelsToUse[depth]`, chaque groupe repliable ; feuille = EquipRow.
  const GroupedEquip = ({ list, levelsToUse, pathKey, depth }: { list: SEquip[]; levelsToUse: LevelId[]; pathKey: string; depth: number }): JSX.Element => {
    if (depth >= levelsToUse.length) return <div style={{ paddingLeft: depth ? 6 : 0 }}>{list.map(EquipRow)}</div>;
    const lvl = levelsToUse[depth];
    const groups = new Map<string, SEquip[]>();
    for (const e of list) { const k = levelValue(e, lvl); const arr = groups.get(k); if (arr) arr.push(e); else groups.set(k, [e]); }
    const keys = Array.from(groups.keys()).sort((a, b) => (a === NONE ? 1 : b === NONE ? -1 : a.localeCompare(b)));
    const Icon = lvl === 'site' ? Building2 : lvl === 'location' ? MapPin : Tag;
    const emptyLabel = lvl === 'site' ? tr('Sans site', 'No site') : lvl === 'location' ? tr('Sans emplacement', 'No location') : tr('Sans type', 'No type');
    return (
      <div>
        {keys.map(k => {
          const gk = `${pathKey}>${lvl}:${k}`;
          const isOpen = open.has(gk);
          const sub = groups.get(k)!;
          return (
            <div key={gk} className="border-t border-gray-100 dark:border-gray-700/50">
              <button onClick={() => toggle(gk)} className="flex w-full items-center gap-2 py-1.5 pr-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30" style={{ paddingLeft: 12 + depth * 16 }}>
                {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                <Icon size={13} className="text-slate-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{k === NONE ? emptyLabel : k}</span>
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-700">{sub.length}</span>
              </button>
              {isOpen && <GroupedEquip list={sub} levelsToUse={levelsToUse} pathKey={gk} depth={depth + 1} />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <Building2 size={16} className="text-orange-600" />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Clients & équipements', 'Clients & equipment')}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"><Download size={13} /> {tr('Importer des équipements', 'Import equipment')}</button>
          <button onClick={() => setEquipForm({ type: '', name: '', serial: '', brand: '', model: '', location: '', frequency: '', public_alerts: false, client_id: null, site_id: null })} className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"><Plus size={13} /> {tr('Nouvel équipement', 'New equipment')}</button>
          {equip.length > 0 && <button onClick={() => setQrPrint(equip)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"><QrCode size={13} /> {tr('Imprimer tous les QR', 'Print all QR')}</button>}
          <input value={newClient} onChange={e => setNewClient(e.target.value)} onKeyDown={e => e.key === 'Enter' && addClient()} placeholder={tr('Nouveau client', 'New client')} className={INP} />
          <button onClick={addClient} disabled={busy || !newClient.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">{busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {tr('Client', 'Client')}</button>
        </div>
      </div>

      {/* Regrouper l'arborescence sous chaque client : Site → Emplacement → Type (activable/désactivable). */}
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
        <span className="font-semibold text-gray-500">{tr('Regrouper par :', 'Group by:')}</span>
        {([['site', tr('Site', 'Site'), Building2], ['location', tr('Emplacement', 'Location'), MapPin], ['type', tr('Type', 'Type'), Tag]] as [LevelId, string, any][]).map(([id, lbl, Icon]) => {
          const on = levels.has(id);
          return (
            <button key={id} onClick={() => toggleLevel(id)} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold transition ${on ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-300' : 'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800'}`}>
              <Icon size={12} /> {lbl}
            </button>
          );
        })}
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
                  <span className="ml-auto flex items-center gap-1.5">
                    {projCounts[c.id] > 0 && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{projCounts[c.id]} {tr('projet(s)', 'project(s)')}</span>}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-gray-700">{items.length} {tr('équip.', 'equip.')}</span>
                  </span>
                </button>
                {isOpen && (items.length ? <GroupedEquip list={items} levelsToUse={activeLevels} pathKey={c.id} depth={0} /> : <div className="px-3 py-3 text-xs text-gray-400">{tr('Aucun équipement. Crée-en un (« Nouvel équipement »), rattache-en depuis « non assignés » ou importe depuis un autre module.', 'No equipment. Create one, assign from "unassigned" or import from another module.')}</div>)}
              </div>
            );
          })}
          {clients.length === 0 && <p className="text-sm text-gray-400">{tr('Aucun client. Ajoutez vos clients (ou importez-les dans l’admin) puis rattachez les équipements.', 'No client. Add your clients then assign equipment.')}</p>}

          {/* Équipements non assignés */}
          <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
            <div className="px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300">{tr('Équipements non assignés', 'Unassigned equipment')} <span className="ml-1 text-gray-400">({unassigned.length})</span></div>
            {unassigned.map(EquipRow)}
            {unassigned.length === 0 && <div className="px-3 pb-3 text-xs text-gray-400">{tr('Tous les équipements sont rattachés à un client.', 'All equipment is assigned to a client.')}</div>}
          </div>
        </div>
      )}

      {/* Sélecteur de GABARIT avant l'inspection */}
      {picker && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={() => setPicker(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{tr('Choisir le gabarit', 'Choose the template')}</h3><button onClick={() => setPicker(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
            <p className="mb-2 text-xs text-gray-500">{picker.equipment.name}</p>
            <div className="space-y-2">
              {gabarits.map(g => (
                <button key={g.id} onClick={() => { setFill({ gabarit: g, equipment: picker.equipment }); setPicker(null); }} className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/10">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{g.name}</span>
                  <span className="text-[11px] text-gray-400">{g.blocks.length} {tr('bloc(s)', 'block(s)')}</span>
                </button>
              ))}
              {gabarits.length === 0 && <p className="text-xs text-gray-400">{tr('Aucun gabarit. Créez-en un dans l’onglet « Gabarits ».', 'No template. Create one in the "Templates" tab.')}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modale CRÉATION / ÉDITION d'équipement */}
      {equipForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={() => setEquipForm(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{equipForm.id ? tr('Modifier l’équipement', 'Edit equipment') : tr('Nouvel équipement', 'New equipment')}</h3><button onClick={() => setEquipForm(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-500">{tr('Nom de la fiche', 'Equipment name')}<input value={equipForm.name || ''} onChange={e => setEquipForm({ ...equipForm, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" placeholder="Ex. Chariot élévateur #2" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('# série', 'Serial #')}<input value={equipForm.serial || ''} onChange={e => setEquipForm({ ...equipForm, serial: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Marque', 'Brand')}<input value={equipForm.brand || ''} onChange={e => setEquipForm({ ...equipForm, brand: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Modèle', 'Model')}<input value={equipForm.model || ''} onChange={e => setEquipForm({ ...equipForm, model: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Type / catégorie', 'Type / category')}<input value={equipForm.type || ''} onChange={e => setEquipForm({ ...equipForm, type: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" placeholder="Ex. Levage" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Emplacement', 'Location')}<input value={equipForm.location || ''} onChange={e => setEquipForm({ ...equipForm, location: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
              <label className="text-xs font-semibold text-gray-500">{tr('Récurrence de maintenance', 'Maintenance recurrence')}
                <select value={equipForm.frequency || ''} onChange={e => setEquipForm({ ...equipForm, frequency: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                  {FREQS.map(f => <option key={f} value={f}>{f || tr('— aucune —', '— none —')}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-500">{tr('Client', 'Client')}
                <select value={equipForm.client_id || ''} onChange={e => setEquipForm({ ...equipForm, client_id: e.target.value || null })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                  <option value="">{tr('— non assigné —', '— unassigned —')}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-500">{tr('Site / département', 'Site / department')}
                <select value={equipForm.site_id || ''} onChange={e => setEquipForm({ ...equipForm, site_id: e.target.value || null })} className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
                  <option value="">{tr('— aucun —', '— none —')}</option>
                  {sites.map(s => [
                    <option key={s.id} value={s.id}>{s.name}</option>,
                    ...s.departments.map(d => <option key={d.id} value={d.id}>{`  · ${d.name}`}</option>),
                  ])}
                </select>
              </label>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={!!equipForm.public_alerts} onChange={e => setEquipForm({ ...equipForm, public_alerts: e.target.checked })} />
              <Bell size={14} className="text-orange-500" /> {tr('Alertes publiques (scan QR) — permet à un externe de signaler un bris', 'Public alerts (QR scan) — lets an external report a breakdown')}
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEquipForm(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300">{tr('Annuler', 'Cancel')}</button>
              <button onClick={saveEquip} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {tr('Enregistrer', 'Save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Impression QR (multi-format, comme l'inventaire) */}
      {qrPrint && <EquipmentQrPrint tenant={tenant} items={qrPrint} tr={tr} onClose={() => setQrPrint(null)} />}

      {/* Hub d'import SÉLECTIF d'équipements depuis d'autres modules (DGA, Rapport terrain, inspections legacy) */}
      {importOpen && <ImportEquipmentPanel tenant={tenant} tr={tr} clients={clients} sites={sites} existing={equip}
        onClose={() => setImportOpen(false)} onImported={() => { setImportOpen(false); reload(); }} />}

      {/* Historique UNIFIÉ d'un équipement (inspections maintenance/legacy + mesures DGA) */}
      {hist && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={() => setHist(null)}>
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white"><History size={17} className="text-orange-600" /> {tr('Historique', 'History')} — {hist.equipment.name}</h3>
              <button onClick={() => setHist(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {hist.items === null ? (
                <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div>
              ) : hist.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">{tr('Aucun historique. Lance une inspection ou relie un dossier DGA.', 'No history. Run an inspection or link a DGA dossier.')}</p>
              ) : (
                <div className="space-y-1.5">
                  {hist.items.map((h, i) => {
                    const rm = h.result ? RESULT_META[h.result as keyof typeof RESULT_META] : null;
                    const kindLabel = h.kind === 'dga' ? 'DGA' : h.kind === 'maintenance' ? tr('Maintenance', 'Maintenance') : tr('Inspection', 'Inspection');
                    const kindColor = h.kind === 'dga' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
                    return (
                      <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${kindColor}`}>{kindLabel}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{h.title}</span>
                        {h.detail && <span className="text-xs text-gray-400">· {h.detail}</span>}
                        <span className="ml-auto flex items-center gap-2">
                          {rm && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${resBadge(rm.color)}`}>{tr(rm.fr, rm.en)}</span>}
                          <span className="text-xs text-gray-400">{h.date || '—'}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
