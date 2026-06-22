'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Wrench, LayoutDashboard, ClipboardList, Building2, Settings, AlertTriangle, Loader2, CheckCircle, Phone, Save, Package, FileText, CalendarClock } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import ClientTree from '@/components/maintenance/ClientTree';
import PlanningBoard from '@/components/maintenance/PlanningBoard';
import ProjectChainPanel from '@/components/maintenance/ProjectChainPanel';
import { supabase } from '@/lib/supabase';
import { getServiceClients, getServiceEquipment, getLastInspections, type SClient, type SEquip, type LastInsp } from '@/lib/serviceTree';
import { RESULT_META } from '@/lib/inspectionForms';
// Onglet « Rapport de Maintenance » = MÊME moteur que Rapport terrain (gabarits + rapports + import IA +
// brouillons + transfert/partage), scopé doc_type='maintenance'. Client-only (localStorage/window).
const RapportsApp = dynamic<{ docType?: string }>(() => import('@/components/rapports/RapportsApp') as any, { ssr: false });

// Module Maintenance — flux unique et LÉGER : on part d'un GABARIT (modèle « Rapport d'inspection »),
// on l'assigne à un ÉQUIPEMENT (avec QR + récurrence), on lance une inspection, et le TABLEAU DE BORD
// regroupe l'état + la planification. L'ancien système de feuilles chrono (lib/maintenance) a été retiré.
type Tab = 'dashboard' | 'gabarits' | 'clients' | 'systeme';

export default function MaintenancePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [chainProject, setChainProject] = useState<string | null>(null);

  // Données de tableau de bord (lecture seule, sources canoniques des autres modules).
  const [equipment, setEquipment] = useState<SEquip[]>([]);
  const [clients, setClients] = useState<SClient[]>([]);
  const [last, setLast] = useState<Record<string, LastInsp>>({});
  const [rapports, setRapports] = useState<any[]>([]);

  // Système : alertes publiques (scan QR) + numéro de support du tenant.
  const [alerts, setAlerts] = useState<any[]>([]);
  const [support, setSupport] = useState<{ phone: string; email: string }>({ phone: '', email: '' });
  const [supportBusy, setSupportBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [eq, cl, li] = await Promise.all([getServiceEquipment(tenant), getServiceClients(tenant), getLastInspections(tenant)]);
      setEquipment(eq); setClients(cl); setLast(li);
      // Maintenances récentes = rapports docType='maintenance' (moteur unique).
      try {
        const r = await fetch(`/api/rapports/data?kind=reports&docType=maintenance&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
        const j = await r.json().catch(() => ({}));
        setRapports(Array.isArray(j.items) ? j.items : []);
      } catch { setRapports([]); }
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
  useEffect(() => { if (tenant) load(); /* eslint-disable-next-line */ }, [tenant]);

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

  // KPIs du tableau de bord (basés sur les inspections du moteur unique, plus de chrono).
  const kpis = useMemo(() => {
    const inspected = equipment.filter(e => last[e.id]).length;
    const never = equipment.length - inspected;
    const anomalies = Object.values(last).filter(li => li.result && /non|fail|rose|red/i.test(String(li.result))).length;
    return { equip: equipment.length, clients: clients.length, never, anomalies };
  }, [equipment, clients, last]);

  if (loading) return (<div className="min-h-screen bg-slate-50 dark:bg-gray-900"><PortalHeader tenant={tenant} /><div className="grid place-items-center py-24 text-gray-400"><Loader2 className="animate-spin" /></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white shadow-sm"><Wrench size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold">Maintenance d'équipement</h1>
            <p className="text-sm text-slate-500">Gabarit → client → inspection → tableau de bord — {tenant}</p>
          </div>
        </div>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">{notice}</div>}

        {/* Onglets (4) : Tableau de bord · Gabarits (Rapport de Maintenance) · Clients · Système */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {([['dashboard', 'Tableau de bord', LayoutDashboard], ['gabarits', 'Rapport de Maintenance', ClipboardList], ['clients', 'Clients & équipements', Building2], ['systeme', 'Système', Settings]] as [Tab, string, any][]).map(([k, lbl, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === k ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}><Icon size={15} /> {lbl}</button>
          ))}
        </div>

        {/* ── RAPPORT DE MAINTENANCE : moteur COMPLET du Rapport terrain (gabarits identiques, import IA,
              brouillons, transfert/partage), scopé doc_type='maintenance'. ── */}
        {tab === 'gabarits' && <RapportsApp docType="maintenance" />}

        {/* ── CLIENTS & ÉQUIPEMENTS (rattachement sur sélection + lancer une inspection) ── */}
        {tab === 'clients' && <ClientTree tenant={tenant} tr={(fr) => fr} />}

        {/* ── SYSTÈME : alertes publiques (scan QR) + n° de support ── */}
        {tab === 'systeme' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-800 dark:bg-orange-900/20">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-orange-800 dark:text-orange-200"><AlertTriangle size={15} /> Alertes publiques (scan QR) {newAlerts.length > 0 && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[11px] text-white">{newAlerts.length}</span>}</h3>
              {alerts.length === 0 ? (
                <p className="text-xs text-orange-700/80 dark:text-orange-300/80">Aucune alerte reçue. Activez « Alertes publiques par scan » sur une fiche d'équipement et collez son QR.</p>
              ) : (
                <div className="space-y-1.5">
                  {alerts.slice(0, 50).map(a => (
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
          </div>
        )}

        {/* ── TABLEAU DE BORD (KPIs + planification fusionnée + maintenances récentes) ── */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Équipements', value: String(kpis.equip), icon: Package, color: 'text-blue-600' },
                { label: 'Clients', value: String(kpis.clients), icon: Building2, color: 'text-slate-700 dark:text-slate-200' },
                { label: 'Jamais inspectés', value: String(kpis.never), icon: AlertTriangle, color: kpis.never ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Anomalies (dernières)', value: String(kpis.anomalies), icon: AlertTriangle, color: kpis.anomalies ? 'text-red-600' : 'text-emerald-600' },
              ].map(k => { const I = k.icon; return (
                <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</span><I size={15} className="text-slate-300" /></div>
                  <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
                </div>
              ); })}
            </div>

            {/* Planification fusionnée (échéances à venir, filtres, prévenir le client) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><CalendarClock size={16} className="text-orange-600" /> Planification — échéances à venir</h3>
              <PlanningBoard tenant={tenant} tr={(fr) => fr} />
            </div>

            {/* Maintenances récentes (rapports docType='maintenance') */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><FileText size={16} className="text-orange-600" /> Maintenances récentes</h3>
              {rapports.length === 0 ? (
                <p className="text-xs text-slate-400">Aucune maintenance enregistrée. Crée un gabarit (onglet « Rapport de Maintenance »), assigne-le à un client puis lance une inspection.</p>
              ) : (
                <div className="space-y-1.5">
                  {rapports.slice(0, 20).map(r => {
                    const rm = (r.data?.overall_result || r.data?.result) ? RESULT_META[(r.data.overall_result || r.data.result) as keyof typeof RESULT_META] : null;
                    const pid = r.project_id || r.data?.link?.projectId || null;
                    return (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-gray-700">
                        <span className="min-w-0 flex-1 truncate">{r.title || r.num || 'Maintenance'}<span className="ml-2 text-xs text-slate-400">{r.updated_at ? new Date(r.updated_at).toLocaleDateString('fr-CA') : ''}{r.author_email ? ` · ${r.author_email}` : ''}</span></span>
                        <span className="flex items-center gap-2">
                          {rm && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-gray-700">{rm.fr}</span>}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === 'sent' || r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status || 'in_progress'}</span>
                          {pid && <button onClick={() => setChainProject(pid)} className="rounded-lg border border-orange-300 px-2 py-0.5 text-[10px] font-semibold text-orange-600 hover:bg-orange-50">Soumission ↔ réel</button>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panneau de chaîne soumission ↔ temps réel ↔ facturation */}
      {chainProject && <ProjectChainPanel tenant={tenant} projectId={chainProject} tr={(fr) => fr} onClose={() => setChainProject(null)} />}
    </div>
  );
}
