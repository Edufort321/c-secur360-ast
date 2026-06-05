'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Lock, ArrowRight, Sparkles, X, Clock, Loader2, LayoutGrid, List,
} from 'lucide-react';
import { MODULES, type ModuleKey } from '@/lib/modules/registry';
import { PortalHeader } from '@/components/PortalHeader';
import { AnomaliesPanel } from '@/components/dashboard/AnomaliesPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';
import { useEntitlements } from '@/lib/entitlements';
import { supabase } from '@/lib/supabase';
import { effectiveNextDate, worstCondition } from '@/lib/dga/fields';
import { dueStatusByDate } from '@/lib/dga/catalog';

const ENABLED_BY_TENANT: Record<string, ModuleKey[]> = {
  cerdia: ['admin', 'projects', 'ast', 'permits', 'accidents', 'near_miss', 'planner', 'inventory', 'inspections', 'timesheets', 'logbook', 'todo', 'dga'],
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

  const [proj, setProj] = useState({ soumission: 0, encours: 0, facture: 0, amount: 0 });
  const [ast, setAst] = useState({ total: 0, draft: 0, in_progress: 0, completed: 0, approved: 0 });
  const [permit, setPermit] = useState({ total: 0, active: 0 });
  const [evt, setEvt] = useState({ quasi: 0, accident: 0, year: 0, total: 0 });
  const [plan, setPlan] = useState({ en_cours: 0, planifies: 0 });
  const [invCount, setInvCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [todoStats, setTodoStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const [logbookStats, setLogbookStats] = useState({ vehicles: 0, kmWeek: 0, kmYear: 0 });
  const [dgaStats, setDgaStats] = useState({ all: 0, overdue: 0, soon: 0, ok: 0, critical: 0, inspDue: 0 });

  // Modules activés : tenant hardcodé (cerdia) → liste fixe, sinon Supabase tenant_modules, sinon tout.
  const entitlements = useEntitlements(tenant);
  const enabledKeys = ENABLED_BY_TENANT[tenant]
    ?? ((entitlements && entitlements.length > 0)
      ? entitlements
      : MODULES.map(m => m.key));

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

        const { data: permits } = await supabase.from('confined_space_permits').select('status').eq('tenant_id', tenant);
        const pm = { total: 0, active: 0 };
        (permits || []).forEach((x: any) => { pm.total += 1; if (x.status === 'active') pm.active += 1; });

        const { data: events } = await supabase.from('near_miss_events').select('severity_level, incident_date').eq('tenant_id', tenant);
        const e = { quasi: 0, accident: 0, year: 0, total: 0 };
        const Y = new Date().getFullYear();
        (events || []).forEach((x: any) => {
          e.total += 1;
          if ((x.severity_level || 0) >= 4) e.accident += 1; else e.quasi += 1;
          if (x.incident_date && new Date(x.incident_date).getFullYear() === Y) e.year += 1;
        });

        const { data: assigns } = await supabase.from('planned_assignments').select('status').eq('tenant_id', tenant);
        const pl = { en_cours: 0, planifies: 0 };
        (assigns || []).forEach((x: any) => { if (x.status === 'in_progress') pl.en_cours += 1; if (x.status === 'planned') pl.planifies += 1; });

        // Inventaire : la source de vérité du module est le snapshot inventory_state (jsonb),
        // pas l'ancienne table inv_items. Repli sur la table items si le snapshot est absent.
        let ic = 0;
        const { data: invState } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
        if (Array.isArray(invState?.data?.items)) ic = invState!.data.items.length;
        else { const { count: itemsCount } = await supabase.from('items').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant); ic = itemsCount ?? 0; }
        // « Utilisateurs » = effectif réel (roster planner_personnel), pas seulement les comptes d'accès (table users).
        const { count: uc } = await supabase.from('planner_personnel').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant);

        const { data: todos } = await supabase.from('todo_tasks').select('status').eq('tenant_id', tenant);
        const td = { total: 0, todo: 0, in_progress: 0, done: 0 };
        (todos || []).forEach((x: any) => {
          if (x.status !== 'archived') { td.total += 1; if (x.status === 'todo') td.todo += 1; else if (x.status === 'in_progress') td.in_progress += 1; else if (x.status === 'done') td.done += 1; }
        });

        const weekStart = (() => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); return d.toISOString().slice(0, 10); })();
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const { data: lbWeek } = await supabase.from('vehicle_logbook').select('km_total').eq('tenant_id', tenant).eq('week_start', weekStart);
        const { data: lbYear } = await supabase.from('vehicle_logbook').select('km_total').eq('tenant_id', tenant).gte('week_start', yearStart);
        const { count: vCount } = await supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant).eq('active', true);
        const lb = {
          vehicles: vCount || 0,
          kmWeek: (lbWeek || []).reduce((s: number, r: any) => s + Number(r.km_total || 0), 0),
          kmYear: (lbYear || []).reduce((s: number, r: any) => s + Number(r.km_total || 0), 0),
        };

        // DGA — mêmes compteurs qu'à l'ouverture du module + niveau critique (cond > 3) + inspections dues.
        const dga = { all: 0, overdue: 0, soon: 0, ok: 0, critical: 0, inspDue: 0 };
        try {
          const { data: dgaD } = await supabase.from('dga_dossiers').select('id, extra').eq('tenant_id', tenant);
          const { data: dgaM } = await supabase.from('dga_measures').select('dossier_id, sample_date, h2, ch4, c2h2, c2h4, c2h6, co, tdcg, condition').eq('tenant_id', tenant).order('sample_date', { ascending: true });
          const lastBy: Record<string, any> = {};
          (dgaM || []).forEach((m: any) => { if (m.dossier_id) lastBy[m.dossier_id] = m; });
          const today = new Date().toISOString().slice(0, 10);
          (dgaD || []).forEach((d: any) => {
            dga.all += 1;
            const last = lastBy[d.id];
            const st = dueStatusByDate(effectiveNextDate(d.extra, last)).code;
            if (st === 'overdue') dga.overdue += 1; else if (st === 'soon') dga.soon += 1; else if (st === 'ok') dga.ok += 1;
            if (last && worstCondition(last) >= 3) dga.critical += 1; // niveau 4 (Condition 4)
            if (d.extra?.next_inspection && d.extra.next_inspection <= today) dga.inspDue += 1; // inspection de routine due
          });
        } catch { /* dégradé */ }

        if (active) { setProj(pr); setAst(a); setPermit(pm); setEvt(e); setPlan(pl); setInvCount(ic || 0); setUserCount(uc || 0); setTodoStats(td); setLogbookStats(lb); setDgaStats(dga); }
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
  if (has('planner')) cards.push({ key: 'planner', title: tr('Planificateur', 'Scheduler'), href: `/${tenant}/planificateur`, big: String(plan.en_cours), sub: `${tr('jobs en cours', 'jobs wip')} · ${plan.planifies} ${tr('planifiés', 'planned')}`, available: true });
  if (has('ast')) cards.push({ key: 'ast', title: tr('AST / Sécurité', 'JSA / Safety'), href: `/${tenant}/ast`, big: String(ast.total), sub: `${ast.draft} ${tr('brouillon', 'draft')} · ${ast.in_progress} ${tr('cours', 'wip')} · ${ast.completed} ${tr('terminé', 'done')} · ${ast.approved} ${tr('approuvé', 'appr.')}` , available: true });
  if (has('permits')) cards.push({ key: 'permits', title: tr('Permis', 'Permits'), href: `/${tenant}/permits`, big: String(permit.total), sub: `${permit.active} ${tr('actifs', 'active')}`, available: true });
  if (has('accidents') || has('near_miss')) cards.push({ key: 'events', title: tr('Accidents & Presque-acc.', 'Accidents & Near-miss'), href: `/${tenant}/near-miss`, big: String(evt.total), sub: `${evt.quasi} ${tr('quasi', 'near')} · ${evt.accident} ${tr('acc.', 'acc.')} · ${evt.year} ${tr('cette année', 'this yr')}`, available: true });
  if (has('inventory')) cards.push({ key: 'inventory', title: tr('Inventaire', 'Inventory'), href: `/${tenant}/inventory`, big: String(invCount), sub: tr('articles', 'items'), available: true });
  if (has('inspections')) cards.push({ key: 'inspections', title: tr("Inspections", 'Inspections'), href: `/${tenant}/inspections`, big: '—', sub: tr('à venir', 'soon'), available: true });
  if (has('timesheets')) cards.push({ key: 'timesheets', title: tr('Feuille de temps', 'Timesheets'), href: `/${tenant}/timesheets`, big: '—', sub: tr('paie · à venir', 'payroll · soon'), available: true });
  if (has('logbook')) cards.push({ key: 'logbook', title: tr('Logbook véhicules', 'Vehicle logbook'), href: `/${tenant}/logbook`, big: `${Math.round(logbookStats.kmWeek).toLocaleString('fr-CA')} km`, sub: `${logbookStats.vehicles} ${tr('véhicules actifs', 'active vehicles')} · ${Math.round(logbookStats.kmYear).toLocaleString('fr-CA')} km ${tr('cette année', 'this year')}`, available: true });
  if (has('todo')) cards.push({ key: 'todo', title: 'To-Do', href: `/${tenant}/todo`, big: String(todoStats.total), sub: `${todoStats.todo} ${tr('à faire', 'to do')} · ${todoStats.in_progress} ${tr('en cours', 'wip')} · ${todoStats.done} ${tr('terminé', 'done')}`, available: true });
  if (has('dga')) cards.push({ key: 'dga', title: tr('Diagnostic DGA', 'DGA Diagnostic'), href: `/${tenant}/dga`, big: String(dgaStats.all), sub: `${dgaStats.overdue} ${tr('en retard', 'overdue')} · ${dgaStats.soon} ${tr('bientôt', 'soon')} · ${dgaStats.ok} ${tr('à jour', 'ok')} · ${dgaStats.critical} ${tr('niv. > 3', 'lvl > 3')}${dgaStats.inspDue ? ` · ${dgaStats.inspDue} ${tr('insp. dues', 'insp. due')}` : ''}`, available: true });

  const iconFor = (k: string) => (MODULES.find(m => m.key === k || (k === 'events' && m.key === 'accidents'))?.icon) || LayoutGrid;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />

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
          <div className="mb-4"><AnomaliesPanel tenant={tenant} /></div>

          {loading ? (
            <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map(c => {
                const Icon = iconFor(c.key);
                const inner = (
                  <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{c.title}</span>
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white dark:bg-blue-600"><Icon size={16} /></div>
                    </div>
                    <div className="text-3xl font-bold">{c.big}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{c.sub}</div>
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
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-900 text-white dark:bg-blue-600"><Icon size={16} /></div>
                    <div className="w-40 shrink-0 font-semibold">{c.title}</div>
                    <div className="w-14 shrink-0 text-2xl font-bold">{c.big}</div>
                    <div className="flex-1 truncate text-sm text-gray-500 dark:text-gray-400">{c.sub}</div>
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
