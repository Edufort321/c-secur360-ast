'use client';
// Tableau de bord PLANIFICATION (phase 2) : échéances de maintenance/inspection À VENIR triées du plus
// proche au plus loin, filtres dynamiques (période, source, statut, client), KPI dûs/en retard, et bouton
// « Prévenir le client » (courriel manuel — adresse résolue serveur). Sources : maintenance + DGA.
import { useEffect, useMemo, useState } from 'react';
import { Loader2, CalendarClock, AlertTriangle, Clock, Mail, RefreshCw, CheckCircle2, ClipboardCheck, X } from 'lucide-react';
import { getPlannedItems, type PlannedItem } from '@/lib/maintenancePlanning';
import { markSheetDone, getServiceEquipment, type SEquip } from '@/lib/serviceTree';
import { getGabarits, type Gabarit } from '@/lib/maintGabarits';
import MaintInspectFill from '@/components/maintenance/MaintInspectFill';

type Tr = (fr: string, en: string) => string;
const INP = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900';
const PERIODS = [7, 30, 90, 180, 365, 0]; // 0 = toutes

export default function PlanningBoard({ tenant, tr }: { tenant: string; tr: Tr }) {
  const [items, setItems] = useState<PlannedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(90);
  const [source, setSource] = useState<'all' | 'maintenance' | 'dga'>('all');
  const [status, setStatus] = useState<'all' | 'overdue' | 'soon'>('all');
  const [clientId, setClientId] = useState('');
  const [notifying, setNotifying] = useState<string | null>(null);
  const [doneBusy, setDoneBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  // Inspection depuis la planification (même flux que l'arbre : équipement → gabarit → MaintInspectFill).
  const [equipMap, setEquipMap] = useState<Record<string, SEquip>>({});
  const [gabarits, setGabarits] = useState<Gabarit[]>([]);
  const [picker, setPicker] = useState<SEquip | null>(null);
  const [fill, setFill] = useState<{ gabarit: Gabarit; equipment: SEquip } | null>(null);

  async function reload() { setLoading(true); try { setItems(await getPlannedItems(tenant)); } catch { setItems([]); } setLoading(false); }
  useEffect(() => {
    reload();
    getServiceEquipment(tenant).then(list => setEquipMap(Object.fromEntries(list.map(e => [e.id, e])))).catch(() => {});
    getGabarits(tenant).then(setGabarits, () => {});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [tenant]);

  const clients = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach(i => { if (i.client_id) m.set(i.client_id, i.client_name || i.client_id); });
    return [...m.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filtered = useMemo(() => items.filter(i =>
    (period === 0 || i.days <= period) &&
    (source === 'all' || i.source === source) &&
    (status === 'all' || i.status === status) &&
    (!clientId || i.client_id === clientId)
  ), [items, period, source, status, clientId]);

  const kpi = useMemo(() => ({
    total: items.length,
    overdue: items.filter(i => i.status === 'overdue').length,
    soon: items.filter(i => i.status === 'soon').length,
  }), [items]);

  async function notifyClient(it: PlannedItem) {
    if (!it.client_id) { setMsg(tr('Cet équipement n’est rattaché à aucun client.', 'This equipment has no client.')); return; }
    setNotifying(it.client_id); setMsg('');
    // Résumé = toutes les échéances visibles de ce client.
    const lines = filtered.filter(x => x.client_id === it.client_id)
      .map(x => `• ${x.title}${x.equipment_name ? ' — ' + x.equipment_name : ''} : ${x.due_date}${x.status === 'overdue' ? ' (EN RETARD)' : ''}`).join('\n');
    try {
      const r = await fetch('/api/maintenance/notify-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, clientId: it.client_id, summary: lines }) });
      const j = await r.json();
      setMsg(r.ok ? `✓ ${tr('Client prévenu', 'Client notified')} (${j.to})` : (j.error || tr('Envoi impossible.', 'Send failed.')));
    } catch { setMsg(tr('Erreur réseau.', 'Network error.')); }
    finally { setNotifying(null); }
  }

  async function markDone(it: PlannedItem) {
    if (it.source !== 'maintenance') return;
    setDoneBusy(it.key); setMsg('');
    const r = await markSheetDone(tenant, it.source_id);
    setDoneBusy(null);
    if (r.error) { setMsg(r.error); return; }
    setMsg(tr('✓ Échéance marquée faite — prochaine recalculée.', '✓ Marked done — next date recalculated.'));
    reload();
  }

  const badge = (s: string) => s === 'overdue' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : s === 'soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  const periodLabel = (p: number) => p === 0 ? tr('Toutes', 'All') : p === 7 ? '7 j' : p === 30 ? '30 j' : p === 90 ? '3 mois' : p === 180 ? '6 mois' : '1 an';

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: tr('Échéances suivies', 'Tracked due items'), v: kpi.total, I: CalendarClock, c: 'text-gray-800 dark:text-gray-100' },
          { l: tr('En retard', 'Overdue'), v: kpi.overdue, I: AlertTriangle, c: 'text-rose-600' },
          { l: tr('Bientôt (≤30 j)', 'Soon (≤30 d)'), v: kpi.soon, I: Clock, c: 'text-amber-600' },
        ].map((k, i) => { const I = k.I; return (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{k.l}</span><I size={15} className="text-gray-300" /></div>
            <div className={`text-2xl font-extrabold ${k.c}`}>{k.v}</div>
          </div>
        ); })}
      </div>

      {/* Filtres dynamiques */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <span className="text-xs font-semibold text-gray-500">{tr('Période', 'Period')}</span>
        <div className="flex gap-1">{PERIODS.map(p => <button key={p} onClick={() => setPeriod(p)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${period === p ? 'bg-orange-600 text-white' : 'border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}>{periodLabel(p)}</button>)}</div>
        <select value={source} onChange={e => setSource(e.target.value as any)} className={INP}><option value="all">{tr('Toutes sources', 'All sources')}</option><option value="maintenance">{tr('Maintenance', 'Maintenance')}</option><option value="dga">{tr('DGA', 'DGA')}</option></select>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className={INP}><option value="all">{tr('Tous statuts', 'All statuses')}</option><option value="overdue">{tr('En retard', 'Overdue')}</option><option value="soon">{tr('Bientôt', 'Soon')}</option></select>
        {clients.length > 0 && <select value={clientId} onChange={e => setClientId(e.target.value)} className={INP}><option value="">{tr('Tous clients', 'All clients')}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
        <button onClick={reload} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"><RefreshCw size={13} /> {tr('Actualiser', 'Refresh')}</button>
      </div>

      {msg && <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">{msg}</p>}

      {loading ? <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>
        : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune échéance dans ce filtre. Définissez des feuilles de maintenance (échéance) ou des reprises DGA.', 'No due item in this filter.')}</div>
          : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40"><tr>
                  <th className="px-3 py-2">{tr('Échéance', 'Due')}</th><th className="px-3 py-2">{tr('Dans', 'In')}</th><th className="px-3 py-2">{tr('Objet', 'Item')}</th><th className="px-3 py-2">{tr('Équipement', 'Equipment')}</th><th className="px-3 py-2">{tr('Client', 'Client')}</th><th className="px-3 py-2">Source</th><th className="px-3 py-2 text-right"></th>
                </tr></thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i.key} className="border-t border-gray-100 dark:border-gray-700/50">
                      <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{i.due_date}</td>
                      <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge(i.status)}`}>{i.days < 0 ? `${-i.days} j ${tr('retard', 'late')}` : `${i.days} j`}</span></td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{i.title}</td>
                      <td className="px-3 py-2 text-gray-500">{i.equipment_name || '—'}</td>
                      <td className="px-3 py-2 text-gray-500">{i.client_name || '—'}</td>
                      <td className="px-3 py-2 text-gray-400">{i.source === 'dga' ? 'DGA' : tr('Maint.', 'Maint.')}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {i.source === 'maintenance' && i.equipment_id && equipMap[i.equipment_id] && <button onClick={() => setPicker(equipMap[i.equipment_id!])} disabled={!gabarits.length} title={!gabarits.length ? tr('Créez d’abord un gabarit', 'Create a template first') : tr('Lancer une inspection', 'Start inspection')} className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><ClipboardCheck size={12} /> {tr('Inspecter', 'Inspect')}</button>}
                          {i.source === 'maintenance' && <button onClick={() => markDone(i)} disabled={doneBusy === i.key} title={tr('Marquer comme effectuée (recalcule la prochaine échéance)', 'Mark done (recomputes next due)')} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-300">{doneBusy === i.key ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} {tr('Fait', 'Done')}</button>}
                          {i.client_id && <button onClick={() => notifyClient(i)} disabled={notifying === i.client_id} title={tr('Prévenir le client (courriel)', 'Notify client (email)')} className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:text-blue-300">{notifying === i.client_id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />} {tr('Prévenir', 'Notify')}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      <p className="text-[11px] text-gray-400">{tr('Trié du plus proche au plus loin. « Inspecter » remplit un gabarit (avance l’échéance). « Fait » avance l’échéance récurrente. « Prévenir » envoie un courriel au client. Un digest automatique quotidien est disponible (Système › Notifications).', 'Sorted nearest first. "Inspect" fills a template (advances the due date). "Done" advances the recurring due date. "Notify" emails the client. A daily auto digest is available (System › Notifications).')}</p>

      {/* Sélecteur de GABARIT avant l'inspection (depuis la planification) */}
      {picker && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4" onClick={() => setPicker(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-white">{tr('Choisir le gabarit', 'Choose the template')}</h3><button onClick={() => setPicker(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
            <p className="mb-2 text-xs text-gray-500">{picker.name}</p>
            <div className="space-y-2">
              {gabarits.map(g => (
                <button key={g.id} onClick={() => { setFill({ gabarit: g, equipment: picker }); setPicker(null); }} className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/10">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{g.name}</span>
                  <span className="text-[11px] text-gray-400">{g.blocks.length} {tr('bloc(s)', 'block(s)')}</span>
                </button>
              ))}
              {gabarits.length === 0 && <p className="text-xs text-gray-400">{tr('Aucun gabarit. Créez-en un dans l’onglet « Rapport de Maintenance ».', 'No template. Create one in the "Maintenance Report" tab.')}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Remplissage de l'inspection — avance l'échéance à la sauvegarde (upsertEquipmentSchedule interne) */}
      {fill && <MaintInspectFill tenant={tenant} tr={tr} gabarit={fill.gabarit} equipment={fill.equipment} clientId={fill.equipment.client_id}
        onClose={() => setFill(null)} onSaved={() => { setFill(null); reload(); }} />}
    </div>
  );
}
