'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Lock, ArrowRight, Sparkles, X, Clock, Loader2, LayoutGrid, List, ShieldCheck,
} from 'lucide-react';
import { MODULES, type ModuleKey } from '@/lib/modules/registry';
import { PortalHeader } from '@/components/PortalHeader';
import { AnomaliesPanel } from '@/components/dashboard/AnomaliesPanel';
import { KioskBroadcast } from '@/components/dashboard/KioskBroadcast';
import { buildKioskSlides } from '@/lib/kioskCards';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';
import { useEntitlements } from '@/lib/entitlements';
import { getTenantPermissions, canViewModule, type PermMap } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';
import { effectiveNextDate, worstCondition } from '@/lib/dga/fields';
import { dueStatusByDate } from '@/lib/dga/catalog';

const ENABLED_BY_TENANT: Record<string, ModuleKey[]> = {
  cerdia: ['admin', 'projects', 'ast', 'permits', 'accidents', 'near_miss', 'planner', 'inventory', 'inspections', 'maintenance', 'timesheets', 'logbook', 'todo', 'dga', 'conges', 'rapports'],
};

const money = (n: number) => `${Math.round(n).toLocaleString('fr-CA')} $`;

export default function ModulesPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const { lang, t } = useLanguage();
  const { siteId } = useSite();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [upsell, setUpsell] = useState<string | null>(null);
  // Widgets ÉPINGLÉS en haut du dashboard (case à cocher dans chaque widget) — persisté par tenant.
  const [pins, setPins] = useState<Record<string, boolean>>({});
  useEffect(() => { try { const s = localStorage.getItem(`dashPins_${tenant}`); if (s) setPins(JSON.parse(s)); } catch { /* ignore */ } }, [tenant]);
  const togglePin = (k: string) => setPins(p => { const n = { ...p, [k]: !p[k] }; try { localStorage.setItem(`dashPins_${tenant}`, JSON.stringify(n)); } catch { /* ignore */ } return n; });
  // Mode diffusion en veille (kiosque) — réglage tenant (Admin › Système). Lecture best-effort (migration 219).
  const [kiosk, setKiosk] = useState<{ on: boolean; idle: number; cards: string[] | null }>({ on: false, idle: 60, cards: null });
  useEffect(() => {
    if (!tenant) return;
    // Champs 219 (toujours présents) — read fiable pour ne pas désactiver le kiosque si 224 absente.
    supabase.from('company_settings').select('kiosk_broadcast, kiosk_idle_seconds').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { if (data) setKiosk(k => ({ ...k, on: !!(data as any).kiosk_broadcast, idle: Number((data as any).kiosk_idle_seconds) || 60 })); }, () => {});
    // Cartes sélectionnées (migration 224) — best-effort : son absence ne casse pas la lecture ci-dessus.
    supabase.from('company_settings').select('kiosk_cards').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { if (data && Array.isArray((data as any).kiosk_cards)) setKiosk(k => ({ ...k, cards: (data as any).kiosk_cards })); }, () => {});
  }, [tenant]);
  // Relevés sécurité (jours sans accident…) injectés dans la carte « Accidents & Presque-acc. ».
  const [safety, setSafety] = useState<any>(null);
  useEffect(() => {
    fetch('/api/incidents/safety-board', { credentials: 'include' }).then(r => (r.ok ? r.json() : null)).then(j => { if (j?.ok) setSafety(j); }).catch(() => {});
  }, [tenant]);
  // Pastilles sécurité (réutilisé carte + bandeau épinglé).
  const safetyDots = (b: any) => ([
    { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', v: b.daysSinceAccident, l: tr('j. sans accident', 'd. without accident') },
    { dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', v: b.daysSinceNearMiss, l: tr('j. sans passé proche', 'd. without near-miss') },
    { dot: b.accidentsYTD ? 'bg-rose-500' : 'bg-gray-300', text: b.accidentsYTD ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400', v: b.accidentsYTD, l: tr('acc. ' + b.year, 'acc. ' + b.year) },
    { dot: b.nearMissYTD ? 'bg-amber-500' : 'bg-gray-300', text: b.nearMissYTD ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400', v: b.nearMissYTD, l: tr('p.proches ' + b.year, 'near ' + b.year) },
  ]);

  const [proj, setProj] = useState({ soumission: 0, encours: 0, facture: 0, amount: 0 });
  const [ast, setAst] = useState({ total: 0, draft: 0, in_progress: 0, completed: 0, approved: 0 });
  const [permit, setPermit] = useState({ total: 0, active: 0, confined: 0, work: 0 });
  const [evt, setEvt] = useState({ quasi: 0, accident: 0, year: 0, total: 0 });
  const [plan, setPlan] = useState({ actifs: 0, aVenir: 0, occ: 0, occCount: 0, roster: 0 });
  const [invCount, setInvCount] = useState(0);
  const [invStats, setInvStats] = useState({ low: 0, value: 0 });
  const [userCount, setUserCount] = useState(0);
  const [todoStats, setTodoStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const [logbookStats, setLogbookStats] = useState({ vehicles: 0, kmWeek: 0, kmYear: 0 });
  const [dgaStats, setDgaStats] = useState({ all: 0, overdue: 0, soon: 0, ok: 0, critical: 0, inspDue: 0, todo: 0 });
  const [inspStats, setInspStats] = useState({ total: 0, nonConf: 0 });
  const [tsStats, setTsStats] = useState({ total: 0, pending: 0, approved: 0, paid: 0 });
  const [maintStats, setMaintStats] = useState({ sheets: 0, due: 0, alerts: 0 });
  // Rapports terrain : cache localStorage NAMESPACÉ par tenant ({tenant}::rpt_reports_v1) —
  // compté côté client. Doit rester aligné avec __rptNS() de RapportsApp.jsx (anti-fuite inter-tenant).
  const [rapStats, setRapStats] = useState({ total: 0, in_progress: 0, review: 0, approved: 0, sent: 0 });
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(`${tenant}::rpt_reports_v1`) : null;
      const list: any[] = raw ? JSON.parse(raw) : [];
      const norm = (s: string) => (s === 'draft' ? 'in_progress' : s === 'final' ? 'approved' : s);
      const c = { total: list.length, in_progress: 0, review: 0, approved: 0, sent: 0 } as any;
      list.forEach(r => { const s = norm(r?.status || 'in_progress'); if (c[s] != null) c[s]++; });
      setRapStats(c);
    } catch { /* pas de données */ }
  }, [tenant]);

  // Modules activés : tenant hardcodé (cerdia) → liste fixe, sinon Supabase tenant_modules, sinon tout.
  const entitlements = useEntitlements(tenant);
  const baseKeys = ENABLED_BY_TENANT[tenant]
    ?? ((entitlements && entitlements.length > 0)
      ? entitlements
      : MODULES.map(m => m.key));

  // Accès par NIVEAU (matrice de permissions) : on masque les modules sous le seuil « Voir » de la
  // personne. SÛR : on ne filtre QUE si le niveau est connu (sinon on n'enlève rien -> aucun blocage
  // accidentel). Le tenant gère les seuils dans Admin > Accès.
  const [myLevel, setMyLevel] = useState<string | null>(null);
  const [perms, setPerms] = useState<PermMap | null>(null);
  useEffect(() => {
    fetch('/api/me/access').then(r => r.ok ? r.json() : null).then(d => setMyLevel(d?.level ?? null)).catch(() => {});
    getTenantPermissions(tenant).then(setPerms).catch(() => {});
  }, [tenant]);
  const enabledKeys = (perms && myLevel)
    ? baseKeys.filter(k => canViewModule(perms, k, myLevel))
    : baseKeys;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let pq = supabase.from('projects').select('status, po_amount').eq('tenant_id', tenant);
        if (siteId !== 'all') pq = pq.eq('site_id', siteId);
        const { data: projects } = await pq;
        const pr = { soumission: 0, encours: 0, facture: 0, amount: 0 };
        (projects || []).forEach((p: any) => {
          if (p.status === 'en-cours') pr.encours += 1;
          else if (p.status === 'facture') pr.facture += 1;
          else pr.soumission += 1;
          pr.amount += Number(p.po_amount || 0);
        });

        const { data: asts } = await supabase.from('ast_permits').select('data').eq('tenant_id', tenant);
        const a = { total: 0, draft: 0, active: 0, completed: 0, cancelled: 0 } as any;
        (asts || []).forEach((x: any) => { a.total += 1; const s = x.data?.status || 'draft'; if (a[s] !== undefined) a[s] += 1; });

        const [{ data: permits }, { count: workCount }] = await Promise.all([
          supabase.from('confined_space_permits').select('status').eq('tenant_id', tenant),
          supabase.from('work_permits').select('permit_number', { count: 'exact', head: true }).eq('tenant_id', tenant),
        ]);
        const pm = { total: 0, active: 0, confined: 0, work: workCount || 0 };
        (permits || []).forEach((x: any) => { pm.confined += 1; if (x.status === 'active') pm.active += 1; });
        pm.total = pm.confined + pm.work;

        // near_miss_events fermée à l'anon -> route serveur scopée à la session.
        const events: any[] = await fetch('/api/incidents/summary?kind=nearmiss', { credentials: 'include' }).then(r => r.ok ? r.json() : {}).then((j: any) => (j?.nearMiss || [])).catch(() => []);
        const e = { quasi: 0, accident: 0, year: 0, total: 0 };
        const Y = new Date().getFullYear();
        (events || []).forEach((x: any) => {
          e.total += 1;
          if ((x.severity_level || 0) >= 4) e.accident += 1; else e.quasi += 1;
          if (x.incident_date && new Date(x.incident_date).getFullYear() === Y) e.year += 1;
        });

        // Source de vérité = planner_jobs (statut français). + % d'occupation du JOUR (personnes
        // assignées à des mandats actifs aujourd'hui ÷ effectif du roster).
        const todayStr = new Date().toISOString().slice(0, 10);
        const [{ data: jobs }, { count: rosterCount }] = await Promise.all([
          supabase.from('planner_jobs').select('statut, status, dateDebut, dateFin, start_date, end_date, personnel, personnelAssigne, nombrePersonnelRequis').eq('tenant_id', tenant),
          supabase.from('planner_personnel').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant),
        ]);
        const yearEnd = todayStr.slice(0, 4) + '-12-31';
        const pl = { actifs: 0, aVenir: 0, occ: 0, occCount: 0, roster: 0 };
        const occupied = new Set<string>(); let occFallback = 0;
        (jobs || []).forEach((j: any) => {
          const st = String(j.statut || j.status || '').toLowerCase().replace(/_/g, '-');
          const termine = st === 'termine' || st === 'completed' || st === 'done' || st === 'annule' || st === 'cancelled';
          // Dates en JOUR (10 car.) : colonnes parfois au format datetime (« 2026-06-09T00:00:00Z »).
          const start = String(j.dateDebut || j.start_date || '').slice(0, 10);
          const end = String(j.dateFin || j.end_date || start || '').slice(0, 10) || start;
          if (termine || !start) return;
          // (1) RÉEL en cours aujourd'hui : la date du jour tombe dans la plage du mandat.
          const activeToday = start <= todayStr && todayStr <= (end || start);
          // (2) PLANIFIÉ à venir (cette année) : se termine aujourd'hui ou plus tard, commence avant la fin d'année.
          const upcoming = (end || start) >= todayStr && start <= yearEnd;
          if (activeToday) pl.actifs += 1;
          if (upcoming) pl.aVenir += 1;
          // (3) Taux d'occupation RÉEL du jour : personnes réellement affectées aux mandats actifs aujourd'hui.
          if (activeToday) {
            // Le champ d'affectation réel est `personnel` (liste d'ids) ; `personnelAssigne` est souvent vide.
            const people = (Array.isArray(j.personnel) && j.personnel.length) ? j.personnel
              : (Array.isArray(j.personnelAssigne) ? j.personnelAssigne : []);
            if (people.length) people.forEach((id: any) => occupied.add(String(id)));
            else occFallback += Number(j.nombrePersonnelRequis) || 0;
          }
        });
        const roster = rosterCount || 0;
        const occCount = Math.min(occupied.size + occFallback, roster || (occupied.size + occFallback));
        pl.roster = roster;
        pl.occCount = occCount;
        pl.occ = roster > 0 ? Math.round(occCount / roster * 100) : 0;

        // Inventaire : la source de vérité du module est le snapshot inventory_state (jsonb),
        // pas l'ancienne table inv_items. Repli sur la table items si le snapshot est absent.
        let ic = 0; const inv = { low: 0, value: 0 };
        const { data: invState } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
        if (Array.isArray(invState?.data?.items)) {
          const items = invState!.data.items;
          ic = items.length;
          // Mêmes champs/logique que le module Inventaire (DashboardView/App.jsx) : quantity / minQuantity / costPrice.
          for (const it of items as any[]) {
            const qty = Number(it.quantity) || 0;
            const min = Number(it.minQuantity) || 0;
            const cost = Number(it.costPrice) || 0;
            if (qty <= min) inv.low += 1;           // stock bas = quantité ≤ minimum (même règle que le module)
            inv.value += cost * qty;                 // valeur au coût
          }
        } else { const { count: itemsCount } = await supabase.from('items').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant); ic = itemsCount ?? 0; }
        // « Utilisateurs » = effectif réel (roster planner_personnel). Déjà chargé plus haut (rosterCount) -> on réutilise (perf : 1 requête en moins).
        const uc = rosterCount;

        const { data: todos } = await supabase.from('todo_tasks').select('status').eq('tenant_id', tenant);
        const td = { total: 0, todo: 0, in_progress: 0, done: 0 };
        (todos || []).forEach((x: any) => {
          if (x.status !== 'archived') { td.total += 1; if (x.status === 'todo') td.todo += 1; else if (x.status === 'in_progress') td.in_progress += 1; else if (x.status === 'done') td.done += 1; }
        });

        const weekStart = (() => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); return d.toISOString().slice(0, 10); })();
        const yearStart = `${new Date().getFullYear()}-01-01`;
        // Perf : les 3 requêtes véhicules/logbook sont indépendantes -> en parallèle (1 vague au lieu de 3).
        const [{ data: lbWeek }, { data: lbYear }, { count: vCount }] = await Promise.all([
          supabase.from('vehicle_logbook').select('km_total').eq('tenant_id', tenant).eq('week_start', weekStart),
          supabase.from('vehicle_logbook').select('km_total').eq('tenant_id', tenant).gte('week_start', yearStart),
          supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant).eq('active', true),
        ]);
        const lb = {
          vehicles: vCount || 0,
          kmWeek: (lbWeek || []).reduce((s: number, r: any) => s + Number(r.km_total || 0), 0),
          kmYear: (lbYear || []).reduce((s: number, r: any) => s + Number(r.km_total || 0), 0),
        };

        // DGA — mêmes compteurs qu'à l'ouverture du module + niveau critique (cond > 3) + inspections dues.
        const dga = { all: 0, overdue: 0, soon: 0, ok: 0, critical: 0, inspDue: 0, todo: 0 };
        try {
          const [{ data: dgaD }, { data: dgaM }] = await Promise.all([
            supabase.from('dga_dossiers').select('id, extra, treated').eq('tenant_id', tenant),
            supabase.from('dga_measures').select('dossier_id, sample_date, h2, ch4, c2h2, c2h4, c2h6, co, tdcg, condition').eq('tenant_id', tenant).order('sample_date', { ascending: true }),
          ]);
          const lastBy: Record<string, any> = {};
          (dgaM || []).forEach((m: any) => { if (m.dossier_id) lastBy[m.dossier_id] = m; });
          const today = new Date().toISOString().slice(0, 10);
          (dgaD || []).forEach((d: any) => {
            dga.all += 1;
            const last = lastBy[d.id];
            const st = dueStatusByDate(effectiveNextDate(d.extra, last)).code;
            if (st === 'overdue') dga.overdue += 1; else if (st === 'soon') dga.soon += 1; else if (st === 'ok') dga.ok += 1;
            // OLTC exclu du compteur critique : ses gaz d'arc de commutation sont normaux (seuils de cuve non applicables).
            if (last && !d.extra?.is_oltc && worstCondition(last) >= 3) dga.critical += 1; // niveau 4 (Condition 4)
            if (d.extra?.next_inspection && d.extra.next_inspection <= today) dga.inspDue += 1; // inspection de routine due
            if (d.treated === false) dga.todo += 1; // nouveaux résultats à traiter (drapeau manuel)
          });
        } catch { /* dégradé */ }

        // Inspections d'équipement — même table que le module (equipment_inspections).
        const insp = { total: 0, nonConf: 0 };
        try {
          const { data: inspData } = await supabase.from('equipment_inspections').select('overall_result').eq('tenant_id', tenant);
          (inspData || []).forEach((x: any) => { insp.total += 1; if (['non_conforme', 'retrait', 'conditionnel'].includes(x.overall_result)) insp.nonConf += 1; });
        } catch { /* table absente */ }

        // Feuilles de temps — table timesheets ; 'submitted' = en attente d'approbation.
        const ts = { total: 0, pending: 0, approved: 0, paid: 0 };
        try {
          const { data: tsData } = await supabase.from('timesheets').select('status').eq('tenant_id', tenant);
          (tsData || []).forEach((x: any) => { ts.total += 1; if (x.status === 'submitted') ts.pending += 1; else if (x.status === 'approved') ts.approved += 1; else if (x.status === 'paid') ts.paid += 1; });
        } catch { /* table absente */ }

        // Maintenance (GMAO) — fiches d'équipement (maintenance_sheets) + actions dues + alertes publiques.
        const maint = { sheets: 0, due: 0, alerts: 0 };
        try {
          const today2 = new Date().toISOString().slice(0, 10);
          const { data: mSheets } = await supabase.from('maintenance_sheets').select('next_due_at').eq('tenant_id', tenant);
          (mSheets || []).forEach((s: any) => { maint.sheets += 1; if (s.next_due_at && String(s.next_due_at).slice(0, 10) <= today2) maint.due += 1; });
          const { data: mActions } = await supabase.from('maintenance_actions').select('status, due_date').eq('tenant_id', tenant).neq('status', 'done');
          (mActions || []).forEach((a2: any) => { if (a2.due_date && String(a2.due_date).slice(0, 10) <= today2) maint.due += 1; });
        } catch { /* table absente (migration 191) */ }
        try { const { count } = await supabase.from('maintenance_alerts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant).eq('status', 'new'); maint.alerts = count || 0; } catch { /* migration 215 */ }

        if (active) { setProj(pr); setAst(a); setPermit(pm); setEvt(e); setPlan(pl); setInvCount(ic || 0); setInvStats({ low: inv.low, value: Math.round(inv.value) }); setUserCount(uc || 0); setTodoStats(td); setLogbookStats(lb); setDgaStats(dga); setInspStats(insp); setTsStats(ts); setMaintStats(maint); }
      } catch { /* dégradé */ } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant, siteId]);

  // Définition uniforme des cartes (1 carte par module activé)
  type Card = { key: string; title: string; href?: string; big: string; sub: string; available: boolean };
  const cards: Card[] = [];
  const has = (k: ModuleKey) => enabledKeys.includes(k);
  if (has('admin')) cards.push({ key: 'admin', title: tr('Administration', 'Administration'), href: `/${tenant}/admin`, big: String(userCount), sub: tr('utilisateurs', 'users'), available: true });
  if (has('projects')) cards.push({ key: 'projects', title: t('projects'), href: `/${tenant}/projects`, big: String(proj.soumission + proj.encours + proj.facture), sub: `${proj.soumission} ${tr('soum.', 'quotes')} · ${proj.encours} ${tr('cours', 'active')} · ${proj.facture} ${tr('fact.', 'inv.')} · ${money(proj.amount)}`, available: true });
  if (has('planner')) cards.push({ key: 'planner', title: tr('Planificateur', 'Scheduler'), href: `/${tenant}/planificateur`, big: String(plan.actifs), sub: `${tr('en cours auj.', 'active today')} · ${plan.aVenir} ${tr('à venir', 'upcoming')} · ${plan.roster > 0 ? `${plan.occCount}/${plan.roster} ${tr('occupés auj.', 'busy today')} (${plan.occ}%)` : `${plan.occ}% ${tr('occupé auj.', 'busy today')}`}`, available: true });
  if (has('ast')) cards.push({ key: 'ast', title: tr('Santé et sécurité', 'Health & Safety'), href: `/${tenant}/ast`, big: String(ast.total), sub: `${ast.draft} ${tr('brouillon', 'draft')} · ${ast.in_progress} ${tr('cours', 'wip')} · ${ast.completed} ${tr('terminé', 'done')} · ${ast.approved} ${tr('approuvé', 'appr.')}` , available: true });
  if (has('permits')) cards.push({ key: 'permits', title: tr('Permis', 'Permits'), href: `/${tenant}/permits`, big: String(permit.total), sub: `${permit.active} ${tr('actifs', 'active')} · ${permit.work} ${tr('travail', 'work')} · ${permit.confined} ${tr('espace clos', 'confined')} · ${permit.total} ${tr('total', 'total')}`, available: true });
  if (has('accidents') || has('near_miss')) cards.push({ key: 'events', title: tr('Accidents & Presque-acc.', 'Accidents & Near-miss'), href: `/${tenant}/near-miss`, big: String(evt.total), sub: `${evt.quasi} ${tr('quasi', 'near')} · ${evt.accident} ${tr('acc.', 'acc.')} · ${evt.year} ${tr('cette année', 'this yr')}`, available: true });
  if (has('inventory')) cards.push({ key: 'inventory', title: tr('Inventaire', 'Inventory'), href: `/${tenant}/inventory`, big: String(invCount), sub: `${invCount} ${tr('articles', 'items')} · ${invStats.low} ${tr('stock bas', 'low stock')} · ${money(invStats.value)} ${tr('valeur', 'value')}`, available: true });
  if (has('inspections')) cards.push({ key: 'inspections', title: tr("Inspections", 'Inspections'), href: `/${tenant}/inspections`, big: String(inspStats.total), sub: `${inspStats.total} ${tr('total', 'total')} · ${inspStats.nonConf} ${tr('non conf.', 'non-conf.')} · ${Math.max(0, inspStats.total - inspStats.nonConf)} ${tr('conformes', 'conform')}`, available: true });
  if (has('maintenance')) cards.push({ key: 'maintenance', title: tr("Maintenance d'équipement", 'Equipment maintenance'), href: `/${tenant}/maintenance`, big: String(maintStats.sheets), sub: `${maintStats.sheets} ${tr('fiches', 'sheets')} · ${maintStats.due} ${tr('due(s)', 'due')} · ${maintStats.alerts} ${tr('alerte(s)', 'alert(s)')}`, available: true });
  if (has('timesheets')) cards.push({ key: 'timesheets', title: tr('Feuille de temps', 'Timesheets'), href: `/${tenant}/timesheets`, big: String(tsStats.total), sub: `${tsStats.pending} ${tr('à approuver', 'to approve')} · ${tsStats.approved} ${tr('approuvées', 'approved')} · ${tsStats.paid} ${tr('payées', 'paid')} · ${tsStats.total} ${tr('total', 'total')}`, available: true });
  if (has('logbook')) cards.push({ key: 'logbook', title: tr('Logbook véhicules', 'Vehicle logbook'), href: `/${tenant}/logbook`, big: `${Math.round(logbookStats.kmWeek).toLocaleString('fr-CA')} km`, sub: `${logbookStats.vehicles} ${tr('véhicules actifs', 'active vehicles')} · ${Math.round(logbookStats.kmYear).toLocaleString('fr-CA')} km ${tr('cette année', 'this year')}`, available: true });
  if (has('todo')) cards.push({ key: 'todo', title: 'To-Do', href: `/${tenant}/todo`, big: String(todoStats.total), sub: `${todoStats.todo} ${tr('à faire', 'to do')} · ${todoStats.in_progress} ${tr('en cours', 'wip')} · ${todoStats.done} ${tr('terminé', 'done')}`, available: true });
  if (has('dga')) cards.push({ key: 'dga', title: tr('Diagnostic DGA', 'DGA Diagnostic'), href: `/${tenant}/dga`, big: String(dgaStats.all), sub: `${dgaStats.todo ? `⚠ ${dgaStats.todo} ${tr('à traiter', 'to treat')} · ` : ''}${dgaStats.overdue} ${tr('en retard', 'overdue')} · ${dgaStats.soon} ${tr('bientôt', 'soon')} · ${dgaStats.ok} ${tr('à jour', 'ok')} · ${dgaStats.critical} ${tr('niv. > 3', 'lvl > 3')}${dgaStats.inspDue ? ` · ${dgaStats.inspDue} ${tr('insp. dues', 'insp. due')}` : ''}`, available: true });
  if (has('rapports')) cards.push({ key: 'rapports', title: tr('Rapports terrain', 'Field reports'), href: `/${tenant}/rapports`, big: String(rapStats.total), sub: `${rapStats.in_progress} ${tr('en cours', 'wip')} · ${rapStats.review} ${tr('révision', 'review')} · ${rapStats.approved} ${tr('approuvé', 'appr.')} · ${rapStats.sent} ${tr('envoyé', 'sent')}`, available: true });

  const iconFor = (k: string) => (MODULES.find(m => m.key === k || (k === 'events' && m.key === 'accidents'))?.icon) || LayoutGrid;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <KioskBroadcast enabled={kiosk.on} idleSeconds={kiosk.idle} selectedKeys={kiosk.cards} lang={lang === 'en' ? 'en' : 'fr'} tenant={tenant}
        slides={buildKioskSlides({ lang: lang === 'en' ? 'en' : 'fr', safety, proj, ast, permit, plan, invCount, invStats, dgaStats, inspStats, tsStats, maintStats })} />
      <PortalHeader tenant={tenant} />

      <div className="px-4 pt-3 lg:px-6">
        <Link href={`/${tenant}/guide`} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300">
          📖 Guide / Mode d&apos;emploi des modules
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 px-4 py-6 md:flex-row lg:px-6">
        {/* Sidebar */}
        <aside className="hidden shrink-0 md:block md:w-64 md:sticky md:top-[60px] md:self-start md:h-[calc(100vh-60px)]">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 px-4 py-3 text-sm font-bold dark:border-gray-700">{t('modules')}</div>
            <nav className="flex-1 overflow-y-auto p-2">
              {MODULES.map(m => {
                const Icon = m.icon;
                const enabled = enabledKeys.includes(m.key);
                const soon = enabled && m.status === 'soon';
                const open = enabled && m.status === 'available';
                const inner = (
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className={`grid h-8 w-8 place-items-center rounded-lg text-white ${enabled ? 'bg-gray-900 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}><Icon size={16} /></div>
                    <span className="flex-1 truncate font-medium">{lang === 'fr' ? m.labelFr : m.labelEn}</span>
                    {open && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    {soon && <Clock size={14} className="text-amber-500" />}
                    {!enabled && <Lock size={14} className="text-gray-400" />}
                  </div>
                );
                if (open) return <Link key={m.key} href={`/${tenant}/${m.basePath}`}>{inner}</Link>;
                if (!enabled) return <button key={m.key} className="block w-full text-left" onClick={() => setUpsell(lang === 'fr' ? m.labelFr : m.labelEn)}>{inner}</button>;
                return <div key={m.key} className="cursor-default opacity-70">{inner}</div>;
              })}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">{tr('Tableau de bord', 'Dashboard')}</h1>
            <div className="flex items-center gap-2">
              {/* Sélecteur de vue */}
              <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                <button onClick={() => setView('grid')} title={tr('Galerie', 'Gallery')} className={`p-2 ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setView('list')} title={tr('Liste', 'List')} className={`p-2 ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Vue d'ensemble des non-conformités/anomalies (coordination+ ou si nom dans le formulaire) */}
          {/* Bandeau des CARTES ÉPINGLÉES (case à cocher sur chaque carte de module) */}
          {cards.filter(c => pins[c.key]).length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {cards.filter(c => pins[c.key]).map(c => (
                c.key === 'events' && safety ? (
                  // Sécurité épinglé : WIDGET PLEINE LARGEUR avec GROSSES PASTILLES de couleur.
                  <div key={c.key} className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100"><ShieldCheck size={16} className="text-emerald-600" /> {c.title}</div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {safetyDots(safety).map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`grid h-24 w-24 place-items-center rounded-full text-white shadow-lg ${d.dot}`}>
                            <span className="text-4xl font-black leading-none">{d.v}</span>
                          </div>
                          <div className="text-center text-xs font-semibold text-gray-600 dark:text-gray-300">{d.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={c.key} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-2xl font-extrabold leading-none">{c.big}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{c.title}</div>
                      <div className="max-w-[240px] truncate text-[11px] text-gray-400">{c.sub}</div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
          <AiTokenAlert tenant={tenant} tr={tr} />
          <div className="mb-4"><AnomaliesPanel tenant={tenant} /></div>

          {loading ? (
            <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map(c => {
                const Icon = iconFor(c.key);
                const inner = (
                  <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{c.title}</span>
                      <div className="flex items-center gap-1.5">
                        {/* Case « épingler » : seulement sur la carte Accidents/Presque-acc. */}
                        {c.key === 'events' && <input type="checkbox" checked={!!pins[c.key]} title={tr('Épingler le tableau Sécurité en haut', 'Pin the Safety board on top')}
                          onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); togglePin(c.key); }}
                          className="cursor-pointer accent-emerald-600" />}
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white dark:bg-blue-600"><Icon size={16} /></div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">{c.big}</div>
                    {/* Carte Accidents : on N'affiche PAS le sous-titre redondant (acc./année) — les pastilles ci-dessous le couvrent. */}
                    {c.key !== 'events' && <div className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{c.sub}</div>}
                    {c.key === 'events' && safety && (
                      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gray-100 pt-2 dark:border-gray-700">
                        {safetyDots(safety).map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${d.dot}`} /><b className={d.text}>{d.v}</b> <span className="truncate">{d.l}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
                return c.href ? <Link key={c.key} href={c.href} className="block">{inner}</Link> : <div key={c.key}>{inner}</div>;
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              {cards.map((c, i) => {
                const Icon = iconFor(c.key);
                const inner = (
                  <div className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${i ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                    {c.key === 'events'
                      ? <input type="checkbox" checked={!!pins[c.key]} title={tr('Épingler le tableau Sécurité en haut', 'Pin the Safety board on top')}
                          onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); togglePin(c.key); }}
                          className="cursor-pointer accent-emerald-600" />
                      : <span className="w-[13px] shrink-0" />}
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-900 text-white dark:bg-blue-600"><Icon size={16} /></div>
                    <div className="w-40 shrink-0 font-semibold">{c.title}</div>
                    <div className="w-14 shrink-0 text-2xl font-bold">{c.big}</div>
                    <div className="flex flex-1 flex-wrap items-center gap-1.5">
                      {(c.key === 'events' && safety ? safetyDots(safety).map(d => `${d.v} ${d.l}`) : String(c.sub || '').split('·').map(s => s.trim()).filter(Boolean)).map((part, j) => (
                        <span key={j} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">{part}</span>
                      ))}
                    </div>
                    {c.href && <ArrowRight size={16} className="text-gray-400" />}
                  </div>
                );
                return c.href ? <Link key={c.key} href={c.href} className="block">{inner}</Link> : <div key={c.key}>{inner}</div>;
              })}
            </div>
          )}
        </main>
      </div>

      {upsell && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setUpsell(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-blue-600" /> {t('unlock')} {upsell}</h2>
              <button onClick={() => setUpsell(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {lang === 'fr' ? <>Le module <strong>{upsell}</strong> n'est pas inclus. Ajoute-le pour l'activer.</> : <>The <strong>{upsell}</strong> module is not included. Add it to enable it.</>}
            </p>
            <Link href={`/${tenant}/pricing`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">{t('see_plans')} <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Bandeau forfait IA (jetons) : alerte le client quand il reste <=10% ou est epuise. Le forfait
// s'utilise jusqu'a epuisement (pas de date) ; le renouvellement se demande dans Admin -> Abonnement.
function AiTokenAlert({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [b, setB] = useState<any>(null);
  useEffect(() => { let a = true; (async () => { try { const r = await fetch(`/api/inventory/ai-budget?tenant=${encodeURIComponent(tenant)}`); if (r.ok && a) setB(await r.json()); } catch { /* ignore */ } })(); return () => { a = false; }; }, [tenant]);
  if (!b || b.unlimited || (!b.lowBalance && !b.exhausted)) return null;
  const exhausted = b.exhausted;
  return (
    <div className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${exhausted ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300' : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300'}`}>
      <span className="font-semibold">
        {exhausted
          ? tr('⛔ Forfait de jetons IA épuisé — les assistants IA sont en pause.', '⛔ AI token plan exhausted — AI assistants are paused.')
          : tr(`🟠 Forfait IA presque épuisé (${b.remainingPct}% restant).`, `🟠 AI plan almost depleted (${b.remainingPct}% left).`)}
      </span>
      <Link href={`/${tenant}/admin`} className="shrink-0 rounded-lg bg-current/10 px-3 py-1 font-semibold underline">
        {tr('Demander un renouvellement', 'Request a renewal')}
      </Link>
    </div>
  );
}
