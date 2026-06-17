'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Wrench, LayoutDashboard, ClipboardList, Plus, Trash2, Loader2, Play, Square, AlertTriangle, QrCode, Clock, DollarSign, CheckCircle, CalendarClock } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';
import {
  getEquipmentList, getMaintTemplates, saveMaintTemplate, deleteMaintTemplate, instantiateTemplate,
  getMaintSheets, saveMaintSheet, deleteMaintSheet, getMaintLogs, saveMaintLog,
  getMaintActions, saveMaintAction, setMaintActionStatus, rollupByEquipment, FREQ_DAYS,
  type MaintTemplate, type MaintSheet, type MaintLog, type MaintAction, type MaintEquipment, type MaintLine, type MaintResult,
} from '@/lib/maintenance';
import { supabase } from '@/lib/supabase';
import { Phone, Save } from 'lucide-react';

const newId = () => (globalThis.crypto?.randomUUID?.() || `m${Date.now()}${Math.round(Math.random() * 1e6)}`);
const FREQS = ['quotidien', 'hebdomadaire', 'mensuel', 'semestriel', 'annuel', 'par_quart'];
const mny = (n: number) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} $`;
const hrs = (min: number) => `${(Math.round((Number(min) || 0) / 6) / 10).toLocaleString('fr-CA')} h`;

type Tab = 'dashboard' | 'equipements' | 'gabarits';

export default function MaintenancePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [equipment, setEquipment] = useState<MaintEquipment[]>([]);
  const [templates, setTemplates] = useState<MaintTemplate[]>([]);
  const [sheets, setSheets] = useState<MaintSheet[]>([]);
  const [logs, setLogs] = useState<MaintLog[]>([]);
  const [actions, setActions] = useState<MaintAction[]>([]);

  // Taux horaire de MO pour valoriser le temps de maintenance (chrono → coût). Éditable.
  const [laborRate, setLaborRate] = useState(85);
  // Alertes publiques reçues par scan QR + numéro de support du tenant.
  const [alerts, setAlerts] = useState<any[]>([]);
  const [support, setSupport] = useState<{ phone: string; email: string }>({ phone: '', email: '' });
  const [supportBusy, setSupportBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [eq, tpl, sh, lg, ac] = await Promise.all([
        getEquipmentList(tenant), getMaintTemplates(tenant), getMaintSheets(tenant), getMaintLogs(tenant), getMaintActions(tenant),
      ]);
      setEquipment(eq); setTemplates(tpl); setSheets(sh); setLogs(lg); setActions(ac);
      try {
        const { data: al } = await supabase.from('maintenance_alerts').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(100);
        setAlerts(al || []);
      } catch { /* table absente (migration 215) */ }
      try {
        const { data: cs } = await supabase.from('company_settings').select('support_phone, support_email').eq('tenant_id', tenant).maybeSingle();
        if (cs) setSupport({ phone: (cs as any).support_phone || '', email: (cs as any).support_email || '' });
      } catch { /* ignore */ }
    } catch (e: any) { setNotice(e?.message || 'Erreur de chargement.'); }
    finally { setLoading(false); }
  }
  async function resolveAlert(alertId: string) {
    await supabase.from('maintenance_alerts').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', alertId).eq('tenant_id', tenant);
    load();
  }
  async function saveSupport() {
    setSupportBusy(true); setNotice(null);
    try {
      const { error } = await supabase.from('company_settings').upsert({ tenant_id: tenant, support_phone: support.phone || null, support_email: support.email || null, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
      if (error) throw error;
      setNotice('Numéro de support enregistré ✓');
    } catch (e: any) { setNotice('Erreur (migration 215 ?) : ' + (e?.message || 'DB')); }
    finally { setSupportBusy(false); }
  }
  const newAlerts = useMemo(() => alerts.filter(a => a.status === 'new'), [alerts]);
  useEffect(() => { if (tenant) load(); /* eslint-disable-next-line */ }, [tenant]);

  const rollups = useMemo(() => rollupByEquipment(equipment, sheets, logs, actions), [equipment, sheets, logs, actions]);
  const kpis = useMemo(() => {
    const openActions = actions.filter(a => a.status !== 'done').length;
    const overdue = rollups.filter(r => r.overdue).length;
    const minutes = logs.reduce((s, l) => s + (Number(l.duration_min) || 0), 0);
    const cost = logs.reduce((s, l) => s + (Number(l.labor_cost) || 0) + (Number(l.parts_cost) || 0), 0);
    return { openActions, overdue, minutes, cost };
  }, [actions, rollups, logs]);

  // ── Builder de gabarit ──
  const [tplForm, setTplForm] = useState<MaintTemplate | null>(null);
  const editTpl = (t?: MaintTemplate) => setTplForm(t ? { ...t, lines: t.lines.map(l => ({ ...l })) } : { name: '', frequency: 'mensuel', lines: [{ id: newId(), description: '', allow_anomaly: true }] });
  const tplAddLine = () => setTplForm(f => f ? { ...f, lines: [...f.lines, { id: newId(), description: '', allow_anomaly: true }] } : f);
  const tplUpdLine = (i: number, patch: Partial<MaintLine>) => setTplForm(f => f ? { ...f, lines: f.lines.map((l, j) => j === i ? { ...l, ...patch } : l) } : f);
  const tplDelLine = (i: number) => setTplForm(f => f ? { ...f, lines: f.lines.filter((_, j) => j !== i) } : f);
  async function saveTpl() {
    if (!tplForm || !tplForm.name.trim()) { setNotice('Nom du gabarit requis.'); return; }
    try { await saveMaintTemplate(tenant, tplForm); setTplForm(null); setNotice('Gabarit enregistré.'); await load(); }
    catch (e: any) { setNotice(e?.message || 'Erreur.'); }
  }

  // Dupliquer un gabarit vers une machine
  const [dupTpl, setDupTpl] = useState<MaintTemplate | null>(null);
  const [dupEq, setDupEq] = useState('');
  async function doDuplicate() {
    if (!dupTpl || !dupEq) return;
    try { await instantiateTemplate(tenant, dupTpl, dupEq); setDupTpl(null); setDupEq(''); setNotice('Feuille créée pour la machine.'); await load(); }
    catch (e: any) { setNotice(e?.message || 'Erreur.'); }
  }

  // ── Exécution d'une feuille (chrono + résultats par ligne) ──
  const [exec, setExec] = useState<MaintSheet | null>(null);
  const [execStart, setExecStart] = useState<number | null>(null);
  const [execElapsed, setExecElapsed] = useState(0); // minutes manuelles/chrono
  const [execResults, setExecResults] = useState<Record<string, MaintResult>>({});
  const [partsCost, setPartsCost] = useState(0);
  useEffect(() => {
    if (execStart == null) return;
    const t = setInterval(() => setExecElapsed(Math.round((Date.now() - execStart) / 60000)), 1000);
    return () => clearInterval(t);
  }, [execStart]);
  const openExec = (s: MaintSheet) => { setExec(s); setExecStart(null); setExecElapsed(0); setExecResults({}); setPartsCost(0); };
  async function saveExec() {
    if (!exec) return;
    const minutes = execElapsed;
    const labor = Math.round((minutes / 60) * laborRate * 100) / 100;
    try {
      const logId = await saveMaintLog(tenant, { sheet_id: exec.id, equipment_id: exec.equipment_id, performed_at: new Date().toISOString(), duration_min: minutes, labor_cost: labor, parts_cost: partsCost, results: execResults });
      // Chaque ligne en anomalie crée un correctif (action).
      for (const l of exec.lines) {
        const r = execResults[l.id];
        if (r?.state === 'anomaly') await saveMaintAction(tenant, { equipment_id: exec.equipment_id, sheet_id: exec.id, log_id: logId, description: `${l.description}${r.note ? ' — ' + r.note : ''}`, priority: 'high', status: 'todo', photos: r.photos || [] });
      }
      // Met à jour la dernière date + prochaine échéance de la feuille.
      const freqDays = FREQ_DAYS[exec.frequency || ''] || null;
      const today = new Date(); const next = freqDays ? new Date(today.getTime() + freqDays * 86400000) : null;
      await saveMaintSheet(tenant, { ...exec, last_done_at: today.toISOString().slice(0, 10), next_due_at: next ? next.toISOString().slice(0, 10) : exec.next_due_at });
      setExec(null); setNotice('Maintenance enregistrée.'); await load();
    } catch (e: any) { setNotice(e?.message || 'Erreur.'); }
  }

  async function scheduleAction(a: MaintAction) {
    // Cédulage planner : crée un job planner « correctif » (best-effort) + marque l'action « scheduled ».
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('planner_jobs').insert({ tenant_id: tenant, nom: `Correctif — ${a.description}`.slice(0, 200), type: 'maintenance', statut: 'planifie' }).select('id').single();
      await setMaintActionStatus(tenant, a.id!, 'scheduled', data?.id || undefined);
      setNotice('Correctif cédulé dans le planificateur.'); await load();
    } catch (e: any) { setNotice("Cédulage : impossible de créer le job planner (" + (e?.message || '') + ')'); }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const eqName = (id?: string | null) => equipment.find(e => e.id === id)?.equipment_name || equipment.find(e => e.id === id)?.equipment_serial || '—';

  if (loading) return (<div className="min-h-screen bg-slate-50 dark:bg-gray-900"><PortalHeader tenant={tenant} /><div className="grid place-items-center py-24 text-gray-400"><Loader2 className="animate-spin" /></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <BackButton fallback={`/${tenant}/modules`} className="mb-4" />
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white shadow-sm"><Wrench size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold">Maintenance d'équipement</h1>
            <p className="text-sm text-slate-500">Gabarits, feuilles par machine (QR), correctifs et coûts — {tenant}</p>
          </div>
        </div>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{notice}</div>}

        {/* Onglets */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {([['dashboard', 'Tableau de bord', LayoutDashboard], ['equipements', 'Équipements & feuilles', Wrench], ['gabarits', 'Gabarits', ClipboardList]] as [Tab, string, any][]).map(([k, lbl, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === k ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}><Icon size={15} /> {lbl}</button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Correctifs ouverts', value: String(kpis.openActions), icon: AlertTriangle, color: kpis.openActions ? 'text-red-600' : 'text-emerald-600' },
                { label: 'Maintenances en retard', value: String(kpis.overdue), icon: CalendarClock, color: kpis.overdue ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Temps total', value: hrs(kpis.minutes), icon: Clock, color: 'text-blue-600' },
                { label: 'Coût total', value: mny(kpis.cost), icon: DollarSign, color: 'text-violet-600' },
              ].map(k => { const I = k.icon; return (
                <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</span><I size={15} className="text-slate-300" /></div>
                  <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
                </div>
              ); })}
            </div>

            {/* Alertes publiques reçues par scan QR */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-800 dark:bg-orange-900/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-orange-800 dark:text-orange-200"><AlertTriangle size={15} /> Alertes publiques (scan QR) {newAlerts.length > 0 && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[11px] text-white">{newAlerts.length}</span>}</h3>
              {alerts.length === 0 ? (
                <p className="text-xs text-orange-700/80 dark:text-orange-300/80">Aucune alerte reçue. Activez « Alertes publiques par scan » sur une fiche d'équipement et collez son QR.</p>
              ) : (
                <div className="space-y-1.5">
                  {alerts.slice(0, 12).map(a => (
                    <div key={a.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${a.status === 'resolved' ? 'border-slate-200 bg-white/60 opacity-60 dark:border-gray-700 dark:bg-gray-800/40' : 'border-orange-200 bg-white dark:border-orange-700 dark:bg-gray-800'}`}>
                      <div className="min-w-0 flex-1">
                        <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{a.alert_type}</span>
                        <span className="font-medium">{a.equipment_name || '—'}</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">{a.description}</span>
                        <div className="text-[11px] text-gray-400">{new Date(a.created_at).toLocaleString('fr-CA')}{a.reporter_name ? ` · ${a.reporter_name}` : ''}{a.reporter_phone ? ` · ${a.reporter_phone}` : ''}</div>
                      </div>
                      {a.status !== 'resolved'
                        ? <button onClick={() => resolveAlert(a.id)} className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Résolu</button>
                        : <span className="shrink-0 text-xs font-semibold text-emerald-600">✓ Résolu</span>}
                    </div>
                  ))}
                </div>
              )}
              {/* Numéro de support affiché sur la page publique scannée */}
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-orange-200 pt-3 dark:border-orange-800">
                <label className="text-xs font-semibold text-orange-800 dark:text-orange-200"><span className="mb-1 flex items-center gap-1"><Phone size={12} /> N° de support (affiché au scan)</span>
                  <input value={support.phone} onChange={e => setSupport(s => ({ ...s, phone: e.target.value }))} placeholder="514-555-0123" className="rounded-lg border border-orange-300 bg-white px-2 py-1.5 text-sm dark:border-orange-700 dark:bg-gray-800" />
                </label>
                <label className="text-xs font-semibold text-orange-800 dark:text-orange-200"><span className="mb-1 block">Courriel de support</span>
                  <input value={support.email} onChange={e => setSupport(s => ({ ...s, email: e.target.value }))} placeholder="support@…" className="rounded-lg border border-orange-300 bg-white px-2 py-1.5 text-sm dark:border-orange-700 dark:bg-gray-800" />
                </label>
                <button onClick={saveSupport} disabled={supportBusy} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{supportBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer</button>
              </div>
            </div>

            {/* Correctifs à faire */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-bold">Correctifs à faire</h3>
              {actions.filter(a => a.status !== 'done').length === 0 ? <p className="text-xs text-slate-400">Aucun correctif en attente. 👍</p> : (
                <div className="space-y-1.5">
                  {actions.filter(a => a.status !== 'done').map(a => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-gray-700">
                      <span className="flex-1"><span className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${a.priority === 'critical' ? 'bg-red-100 text-red-700' : a.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{a.priority}</span>{a.description}<span className="ml-2 text-xs text-slate-400">· {eqName(a.equipment_id)}</span></span>
                      <div className="flex items-center gap-2">
                        {a.status === 'scheduled' ? <span className="text-xs font-semibold text-blue-600">cédulé</span> : <button onClick={() => scheduleAction(a)} className="rounded-lg border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">Céduler (planner)</button>}
                        <button onClick={() => setMaintActionStatus(tenant, a.id!, 'done').then(load)} className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"><CheckCircle size={13} className="inline" /> Fait</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coût/temps par équipement (classement) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-bold">Temps & coût par équipement</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-slate-400"><tr><th className="px-2 py-1">Équipement</th><th className="px-2">Interventions</th><th className="px-2 text-right">Temps</th><th className="px-2 text-right">Coût</th><th className="px-2 text-center">Correctifs</th><th className="px-2">Prochaine</th></tr></thead>
                  <tbody>
                    {[...rollups].sort((a, b) => b.cost - a.cost).map(r => (
                      <tr key={r.equipment_id} className="border-t border-slate-100 dark:border-gray-700">
                        <td className="px-2 py-1.5 font-medium">{r.name}</td>
                        <td className="px-2">{r.logs}</td>
                        <td className="px-2 text-right">{hrs(r.minutes)}</td>
                        <td className="px-2 text-right font-semibold">{mny(r.cost)}</td>
                        <td className="px-2 text-center">{r.openActions ? <span className="rounded-full bg-red-100 px-2 text-xs font-bold text-red-700">{r.openActions}</span> : '—'}</td>
                        <td className={`px-2 text-xs ${r.overdue ? 'font-bold text-red-600' : 'text-slate-500'}`}>{r.nextDue || '—'}{r.overdue ? ' ⚠️' : ''}</td>
                      </tr>
                    ))}
                    {rollups.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-slate-400">Aucun équipement. Crée des fiches dans « Inspections d'équipement », puis des feuilles de maintenance ici.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ÉQUIPEMENTS & FEUILLES ── */}
        {tab === 'equipements' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <span className="font-semibold text-slate-500">Taux MO ($/h) :</span>
              <input type="number" value={laborRate} onChange={e => setLaborRate(Number(e.target.value) || 0)} className="w-24 rounded-lg border border-slate-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700" />
              <span className="text-xs text-slate-400">sert à valoriser le temps de maintenance (chrono → coût).</span>
            </div>
            {equipment.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800">Aucun équipement. Crée d'abord des fiches d'équipement (module « Inspections d'équipement »).</div>
            ) : equipment.map(e => {
              const eSheets = sheets.filter(s => s.equipment_id === e.id);
              return (
                <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold">{e.equipment_name || e.equipment_serial || e.equipment_type}</div>
                      <div className="text-xs text-slate-400">{[e.equipment_type, e.equipment_serial, e.equipment_location].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/${tenant}/equipment/${e.id}`} title="Fiche / QR équipement" className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300"><QrCode size={13} className="inline" /> Fiche</a>
                      <select value="" onChange={ev => { const t = templates.find(x => x.id === ev.target.value); if (t) { setDupTpl(t); setDupEq(e.id); } }} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700">
                        <option value="">+ Feuille depuis un gabarit…</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {eSheets.length === 0 ? <p className="text-xs text-slate-400">Aucune feuille de maintenance. Ajoute-en une depuis un gabarit.</p> : (
                    <div className="space-y-1.5">
                      {eSheets.map(s => (
                        <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-gray-700">
                          <span className="flex-1">{s.name || 'Feuille'} <span className="text-xs text-slate-400">· {s.frequency || '—'} · {s.lines.length} ligne(s)</span>{s.next_due_at && <span className={`ml-2 text-xs ${s.next_due_at < new Date().toISOString().slice(0, 10) ? 'font-bold text-red-600' : 'text-slate-400'}`}>échéance {s.next_due_at}</span>}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openExec(s)} className="rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-700"><Play size={12} className="inline" /> Exécuter</button>
                            <button onClick={() => { if (window.confirm('Supprimer cette feuille ?')) deleteMaintSheet(tenant, s.id!).then(load); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── GABARITS ── */}
        {tab === 'gabarits' && (
          <div className="space-y-3">
            <div className="flex justify-end"><button onClick={() => editTpl()} className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"><Plus size={16} /> Nouveau gabarit</button></div>
            {templates.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800">Aucun gabarit. Crée un gabarit (séquence d'entretien) à dupliquer par machine identique.</div> : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map(t => (
                  <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start justify-between"><div className="font-bold">{t.name}</div><button onClick={() => { if (window.confirm('Supprimer ce gabarit ?')) deleteMaintTemplate(tenant, t.id!).then(load); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></div>
                    <div className="text-xs text-slate-400">{t.frequency || '—'} · {t.lines.length} ligne(s)</div>
                    {t.description && <p className="mt-1 text-xs text-slate-500">{t.description}</p>}
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => editTpl(t)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300">Éditer</button>
                      <button onClick={() => setDupTpl(t)} className="rounded-lg border border-orange-300 px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50">Dupliquer → machine</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALE : builder de gabarit */}
      {tplForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setTplForm(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h2 className="mb-3 text-lg font-bold">{tplForm.id ? 'Modifier le gabarit' : 'Nouveau gabarit'}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-500">Nom<input value={tplForm.name} onChange={e => setTplForm(f => f ? { ...f, name: e.target.value } : f)} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" placeholder="Ex. Entretien presse hydraulique" /></label>
              <label className="text-xs font-semibold text-slate-500">Fréquence<select value={tplForm.frequency || ''} onChange={e => setTplForm(f => f ? { ...f, frequency: e.target.value } : f)} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">{FREQS.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
            </div>
            <label className="mt-2 block text-xs font-semibold text-slate-500">Description<input value={tplForm.description || ''} onChange={e => setTplForm(f => f ? { ...f, description: e.target.value } : f)} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" /></label>
            <div className="mt-3 mb-1 flex items-center justify-between"><span className="text-xs font-bold text-slate-600 dark:text-gray-300">Séquence de maintenance</span><button onClick={tplAddLine} className="rounded-lg border border-orange-300 px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50"><Plus size={12} className="inline" /> Ajouter une ligne</button></div>
            <div className="space-y-1.5">
              {tplForm.lines.map((l, i) => (
                <div key={l.id} className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs text-slate-400">{i + 1}.</span>
                  <input value={l.description} onChange={e => tplUpdLine(i, { description: e.target.value })} placeholder="Description de l'opération" className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700" />
                  <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-slate-500"><input type="checkbox" checked={l.allow_anomaly !== false} onChange={e => tplUpdLine(i, { allow_anomaly: e.target.checked })} /> anomalie possible</label>
                  <button onClick={() => tplDelLine(i)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setTplForm(null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300">Annuler</button>
              <button onClick={saveTpl} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : dupliquer gabarit → machine */}
      {dupTpl && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => { setDupTpl(null); setDupEq(''); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-bold">Dupliquer « {dupTpl.name} » sur une machine</h2>
            <select value={dupEq} onChange={e => setDupEq(e.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700">
              <option value="">— Choisir l'équipement —</option>
              {equipment.map(e => <option key={e.id} value={e.id}>{e.equipment_name || e.equipment_serial || e.equipment_type}</option>)}
            </select>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => { setDupTpl(null); setDupEq(''); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300">Annuler</button>
              <button onClick={doDuplicate} disabled={!dupEq} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">Créer la feuille</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : exécution d'une feuille (chrono + résultats) */}
      {exec && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setExec(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h2 className="mb-1 text-lg font-bold">{exec.name || 'Maintenance'} — {eqName(exec.equipment_id)}</h2>
            {/* Chrono / clic punch */}
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-gray-900/40">
              <Clock size={16} className="text-orange-600" />
              <span className="text-lg font-bold tabular-nums">{execElapsed} min</span>
              {execStart == null
                ? <button onClick={() => setExecStart(Date.now() - execElapsed * 60000)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"><Play size={12} className="inline" /> Démarrer</button>
                : <button onClick={() => setExecStart(null)} className="rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"><Square size={12} className="inline" /> Arrêter</button>}
              <input type="number" value={execElapsed} onChange={e => { setExecStart(null); setExecElapsed(Number(e.target.value) || 0); }} className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700" title="Minutes (ajustable)" />
              <span className="ml-auto text-xs text-slate-400">Coût MO ≈ {mny((execElapsed / 60) * laborRate)}</span>
            </div>
            {/* Lignes */}
            <div className="space-y-1.5">
              {exec.lines.map(l => {
                const r = execResults[l.id] || { state: 'ok' as const };
                return (
                  <div key={l.id} className="rounded-lg border border-slate-100 p-2 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex-1 text-sm">{l.description || '(ligne)'}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setExecResults(p => ({ ...p, [l.id]: { ...r, state: 'ok' } }))} className={`rounded px-2 py-1 text-xs font-semibold ${r.state === 'ok' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-gray-700'}`}>OK</button>
                        <button onClick={() => setExecResults(p => ({ ...p, [l.id]: { ...r, state: 'anomaly' } }))} className={`rounded px-2 py-1 text-xs font-semibold ${r.state === 'anomaly' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-gray-700'}`}><AlertTriangle size={12} className="inline" /> Anomalie</button>
                      </div>
                    </div>
                    {r.state === 'anomaly' && (
                      <div className="mt-1.5 space-y-1.5">
                        <input value={r.note || ''} onChange={e => setExecResults(p => ({ ...p, [l.id]: { ...r, note: e.target.value } }))} placeholder="Description de l'anomalie (crée un correctif)" className="w-full rounded-lg border border-red-200 px-2 py-1.5 text-sm dark:border-red-800 dark:bg-gray-700" />
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500">
                          📷 Photo / pièce jointe
                          <input type="file" accept="image/*" className="hidden" onChange={ev => { const f = ev.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => setExecResults(p => ({ ...p, [l.id]: { ...r, photos: [...(r.photos || []), String(rd.result)] } })); rd.readAsDataURL(f); }} />
                        </label>
                        {(r.photos || []).length > 0 && <span className="ml-2 text-xs text-emerald-600">{(r.photos || []).length} pièce(s)</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-500">Coût pièces ($) :</span>
              <input type="number" value={partsCost} onChange={e => setPartsCost(Number(e.target.value) || 0)} className="w-28 rounded-lg border border-slate-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700" />
              <span className="text-xs text-slate-400">(lier bons de commande / inventaire — à venir)</span>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setExec(null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-gray-600 dark:text-gray-300">Annuler</button>
              <button onClick={saveExec} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">Enregistrer la maintenance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
