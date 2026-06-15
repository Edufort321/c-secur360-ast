'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Save, Loader2, FileText, Clock, DollarSign, Download, Receipt, Trash2, BookOpen, Menu, X } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { ProjectTimesheetSummary } from '@/components/projet/ProjectTimesheetSummary';
import { ConsumeMaterialPanel } from '@/components/projet/ConsumeMaterialPanel';
import { CoutsTab } from '@/components/projet/CoutsTab';
import { FactureTab } from '@/components/projet/FactureTab';
import { computeProjectActuals, type ProjectActuals } from '@/lib/projectActuals';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/lib/entitlements';

type Tab = 'projet' | 'temps' | 'couts' | 'facture';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || 'cerdia';
  const id = params?.id as string;
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [tab, setTab] = useState<Tab>('projet');
  const [tabsOpen, setTabsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingFull, setExportingFull] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [p, setP] = useState<any>(null);
  const [linkedAst,     setLinkedAst]     = useState<any[]>([]);
  const [linkedPermits, setLinkedPermits] = useState<any[]>([]);
  const [linkedReports, setLinkedReports] = useState<any[]>([]);
  const [linkedSoumissions, setLinkedSoumissions] = useState<any[]>([]);
  const [timeRollup, setTimeRollup] = useState<{ reg: number; ot: number; prem: number; total: number; km: number; entries: number; byPerson: { name: string; hrs: number }[] } | null>(null);
  // Interconnexions conditionnées aux modules du tenant : on n'affiche un lien que si le module existe
  // (s'il ne prend pas AST/Permis/Rapports, on ne montre ni la section ni le bouton « Créer »).
  const ent = useEntitlements(tenant);
  const hasMod = (k: string) => !ent || ent.includes(k);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [sellers, setSellers] = useState<{ id: string; name: string }[]>([]);
  const [tsActuals, setTsActuals] = useState<ProjectActuals | null>(null); // coût réel agrégé des feuilles de temps

  useEffect(() => {
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setTenantLogoUrl(data.logo_url); }, () => {});
    supabase.from('planner_personnel').select('id,name').eq('tenant_id', tenant).order('name')
      .then(({ data }) => setSellers((data || []).filter((s: any) => s.name)), () => {});
  }, [tenant]);

  async function exportPdf() {
    if (!p) return;
    setExporting(true);
    try {
      const { exportProjectPdf } = await import('@/lib/pdf/projectPdf');
      await exportProjectPdf({ tab, project: p, tenant, tenantLogoUrl, linkedAst });
    } finally { setExporting(false); }
  }

  async function exportFullReport() {
    if (!p) return;
    setExportingFull(true);
    try {
      const { exportFullReportPdf } = await import('@/lib/pdf/projectPdf');
      await exportFullReportPdf({ project: p, tenant, tenantLogoUrl, linkedAst });
    } finally { setExportingFull(false); }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (error) throw error;
        if (active) setP(data);
      } catch {
        if (active) setP(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Coût réel agrégé (WIP) : calculé CÔTÉ SERVEUR (les salaires/taux ne transitent pas par le
  // navigateur) + persiste projects.actuals. R6 : lien Timesheets -> Coûts. Repli client si la
  // route échoue (ancien comportement).
  useEffect(() => {
    if (!id) { setTsActuals(null); return; }
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/projects/wip?project_id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
        if (r.ok) { const j = await r.json(); if (active) { setTsActuals(j.actuals); return; } }
        throw new Error('wip route failed');
      } catch {
        try { const a = await computeProjectActuals(tenant, id); if (active) setTsActuals(a); } catch { if (active) setTsActuals(null); }
      }
    })();
    return () => { active = false; };
  }, [id, tenant]);

  // AST liés à ce projet (par n° de projet)
  useEffect(() => {
    if (!p?.project_number) { setLinkedAst([]); return; }
    let active = true;
    (async () => {
      const { data } = await supabase.from('ast_permits')
        .select('permit_number, data, updated_at')
        .eq('tenant_id', tenant)
        .order('updated_at', { ascending: false });
      const filtered = (data || []).filter((r: any) => r.data?.taskInfo?.projectNumber === p.project_number)
        .map((r: any) => ({ id: r.permit_number, ast_number: r.permit_number, status: r.data?.status || 'draft', created_at: r.updated_at }));
      if (active) setLinkedAst(filtered);
    })();
    return () => { active = false; };
  }, [p?.project_number, tenant]);

  // Permis liés à ce projet (work_permits + confined_space_permits contenant le n° de projet)
  useEffect(() => {
    if (!p?.project_number) { setLinkedPermits([]); return; }
    let active = true;
    (async () => {
      // work_permits fermée à l'anon (RLS) -> route serveur ; confined_space_permits reste lisible (policy).
      const [wpJson, csRes] = await Promise.all([
        fetch('/api/work-permits', { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        supabase.from('confined_space_permits').select('permit_number, data, updated_at').eq('tenant_id', tenant),
      ]);
      const pn = p.project_number;
      const wp = (((wpJson as any)?.rows) || [])
        .filter((r: any) => r.data?.projectNumber === pn || r.data?.taskInfo?.projectNumber === pn)
        .map((r: any) => ({ permit_number: r.permit_number, type: r.type || 'work', status: r.data?.status || 'draft', updated_at: r.updated_at }));
      const cs = (csRes.data || [])
        .filter((r: any) => r.data?.projectNumber === pn || r.data?.taskInfo?.projectNumber === pn)
        .map((r: any) => ({ permit_number: r.permit_number, type: 'confined_space', status: r.data?.status || 'draft', updated_at: r.updated_at }));
      if (active) setLinkedPermits([...wp, ...cs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    })();
    return () => { active = false; };
  }, [p?.project_number, tenant]);

  // Rapports terrain liés à ce projet (via la route serveur scopée au tenant ; lien par project_id).
  useEffect(() => {
    if (!id) { setLinkedReports([]); return; }
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/rapports/links?kind=for-project&id=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (r.ok) { const j = await r.json(); if (active) setLinkedReports(j.reports || []); }
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [id, tenant]);

  // Soumissions liées à ce projet (soumissions.project_id). Interconnexion Projets↔Soumissions.
  useEffect(() => {
    if (!id) { setLinkedSoumissions([]); return; }
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.from('soumissions').select('id, numero, status, total, created_at').eq('tenant_id', tenant).eq('project_id', id).order('created_at', { ascending: false });
        if (active) setLinkedSoumissions(data || []);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [id, tenant]);

  // Rollup TEMPS RÉEL : heures saisies sur ce projet (feuilles de temps), agrégées par personne.
  // Lien par project_id OU project_number (le punch/feuilles renseignent l'un ou l'autre).
  useEffect(() => {
    if (!id) { setTimeRollup(null); return; }
    let active = true;
    (async () => {
      try {
        const pn = (p as any)?.project_number;
        const orFilter = pn ? `project_id.eq.${id},project_number.eq.${pn}` : `project_id.eq.${id}`;
        const { data: ents } = await supabase.from('timesheet_entries')
          .select('timesheet_id, hrs_regular, hrs_overtime, hrs_premium, km').eq('tenant_id', tenant).or(orFilter);
        if (!active) return;
        const rows = ents || [];
        let reg = 0, ot = 0, prem = 0, km = 0; const byTs: Record<string, number> = {};
        rows.forEach((e: any) => {
          const r = Number(e.hrs_regular) || 0, o = Number(e.hrs_overtime) || 0, pm = Number(e.hrs_premium) || 0;
          reg += r; ot += o; prem += pm; km += Number(e.km) || 0;
          if (e.timesheet_id) byTs[e.timesheet_id] = (byTs[e.timesheet_id] || 0) + r + o + pm;
        });
        let byPerson: { name: string; hrs: number }[] = [];
        const tsIds = Object.keys(byTs);
        if (tsIds.length) {
          const { data: sheets } = await supabase.from('timesheets').select('id, employee_name').in('id', tsIds);
          const nameOf: Record<string, string> = Object.fromEntries((sheets || []).map((s: any) => [s.id, s.employee_name || '—']));
          const agg: Record<string, number> = {};
          tsIds.forEach(tid => { const nm = nameOf[tid] || '—'; agg[nm] = (agg[nm] || 0) + byTs[tid]; });
          byPerson = Object.entries(agg).map(([name, hrs]) => ({ name, hrs })).sort((a, b) => b.hrs - a.hrs);
        }
        if (active) setTimeRollup({ reg, ot, prem, total: reg + ot + prem, km, entries: rows.length, byPerson });
      } catch { if (active) setTimeRollup(null); }
    })();
    return () => { active = false; };
  }, [id, tenant, (p as any)?.project_number]);

  const set = (k: string, v: any) => setP((prev: any) => ({ ...prev, [k]: v }));

  async function save() {
    if (!p) return;
    setSaving(true); setNotice(null);
    const payload = {
      project_number: p.project_number, title: p.title, client_name: p.client_name,
      location: p.location, dossier: p.dossier, submission_number: p.submission_number,
      po_number: p.po_number, po_amount: p.po_amount ? Number(p.po_amount) : null,
      status: p.status, project_type: p.project_type, pricing_mode: p.pricing_mode,
      global_price: p.global_price ? Number(p.global_price) : null,
      date_submission: p.date_submission || null, date_work_start: p.date_work_start || null,
      primary_seller_id: p.primary_seller_id || null,
    };
    try {
      const { error } = await supabase.from('projects').update(payload).eq('id', id).eq('tenant_id', tenant);
      if (error) throw error;
      // Commission de vente : calcul SERVEUR (grilles/feuilles de temps fermées à l'anon).
      if (p.status === 'vente' && p.primary_seller_id) {
        const r = await fetch('/api/hr/commission', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ project: { ...p, id } }) }).then(x => x.json()).catch(() => ({ ok: false, msg: 'erreur' }));
        setNotice(r.ok ? '✓ ' + r.msg : tr('Enregistré ✓ — commission : ', 'Saved ✓ — commission: ') + r.msg);
      } else {
        setNotice(tr('Enregistré ✓', 'Saved ✓'));
      }
    } catch {
      setNotice(tr('Erreur d’enregistrement (DB).', 'Save error (DB).'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!confirm(tr(
      `Supprimer définitivement le projet #${p?.project_number} « ${p?.title || 'Sans titre'} » ? Cette action est irréversible.`,
      `Permanently delete project #${p?.project_number} "${p?.title || 'Untitled'}"? This cannot be undone.`
    ))) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id).eq('tenant_id', tenant);
      if (error) throw error;
      router.push(`/${tenant}/projects`);
    } catch {
      setNotice(tr('Erreur lors de la suppression.', 'Delete error.'));
      setDeleting(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'projet', label: tr('Projet', 'Project'), icon: FileText },
    { key: 'temps', label: tr('Feuille de temps', 'Timesheet'), icon: Clock },
    { key: 'couts', label: tr('Coûts', 'Costs'), icon: DollarSign },
    { key: 'facture', label: tr('Facture', 'Invoice'), icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />

      <div className="w-full px-4 py-6 lg:px-6">
        <BackButton fallback={`/${tenant}/projects`} className="mb-4" />

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
        ) : !p ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">{tr('Projet introuvable.', 'Project not found.')}</div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{p.title || tr('Projet sans titre', 'Untitled project')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">#{p.project_number} · {tenant}</p>
              </div>
              <div className="flex flex-wrap gap-2 self-start">
                <button onClick={deleteProject} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10">
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} {tr('Supprimer', 'Delete')}
                </button>
                <button onClick={exportPdf} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} {tr("Onglet PDF", 'Tab PDF')}
                </button>
                <button onClick={exportFullReport} disabled={exportingFull} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {exportingFull ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />} {tr('Rapport complet', 'Full Report')}
                </button>
                <Link href={`/${tenant}/ast/nouveau?project=${id}`} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <FileText size={18} /> {tr('Créer un AST', 'Create JSA')}
                </Link>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {tr('Enregistrer', 'Save')}
                </button>
              </div>
            </div>

            {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}

            {/* Onglets — mobile hamburger */}
            <div className="mb-4 sm:hidden">
              <button
                type="button"
                onClick={() => setTabsOpen(o => !o)}
                aria-expanded={tabsOpen}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <span className="inline-flex items-center gap-2">
                  {(() => { const cur = tabs.find(t => t.key === tab); const I = cur?.icon || Menu; return <I size={16} />; })()}
                  {tabs.find(t => t.key === tab)?.label}
                </span>
                {tabsOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              {tabsOpen && (
                <div className="mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => { setTab(t.key); setTabsOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                      >
                        <Icon size={16} /> {t.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Onglets — desktop */}
            <div className="mb-4 hidden gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 sm:flex dark:border-gray-700 dark:bg-gray-800">
              {tabs.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Onglet Projet */}
            {tab === 'projet' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label={tr('Numéro de projet', 'Project number')}><input className="inp" value={p.project_number || ''} onChange={e => set('project_number', e.target.value)} /></Field>
                  <Field label={tr('Titre', 'Title')}><input className="inp" value={p.title || ''} onChange={e => set('title', e.target.value)} /></Field>
                  <Field label={tr('Client', 'Client')}><input className="inp" value={p.client_name || ''} onChange={e => set('client_name', e.target.value)} /></Field>
                  <Field label={tr('Lieu', 'Location')}><input className="inp" value={p.location || ''} onChange={e => set('location', e.target.value)} /></Field>
                  <Field label={tr('N° soumission', 'Quote #')}><input className="inp" value={p.submission_number || ''} onChange={e => set('submission_number', e.target.value)} /></Field>
                  <Field label={tr('N° bon de commande', 'PO #')}><input className="inp" value={p.po_number || ''} onChange={e => set('po_number', e.target.value)} /></Field>
                  <Field label={tr('Montant BC ($)', 'PO amount ($)')}><input type="number" className="inp" value={p.po_amount ?? ''} onChange={e => set('po_amount', e.target.value)} /></Field>
                  <Field label={tr('Statut', 'Status')}>
                    <select className="inp" value={p.status || 'soumission'} onChange={e => set('status', e.target.value)}>
                      <option value="soumission">{tr('Soumission', 'Quote')}</option>
                      <option value="vente">{tr('Vente', 'Sale')}</option>
                      <option value="en-cours">{tr('En cours', 'In progress')}</option>
                      <option value="facture">{tr('Facturé', 'Invoiced')}</option>
                    </select>
                  </Field>
                  <Field label={tr('Vendeur (commission)', 'Salesperson (commission)')}>
                    <select className="inp" value={p.primary_seller_id || ''} onChange={e => set('primary_seller_id', e.target.value)}>
                      <option value="">{tr('— Aucun —', '— None —')}</option>
                      {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </Field>
                  <Field label={tr('Type', 'Type')}>
                    <select className="inp" value={p.project_type || 'budgetaire'} onChange={e => set('project_type', e.target.value)}>
                      <option value="budgetaire">{tr('Budgétaire', 'Budget')}</option>
                      <option value="forfaitaire">{tr('Forfaitaire', 'Fixed price')}</option>
                    </select>
                  </Field>
                  <Field label={tr('Mode de prix', 'Pricing mode')}>
                    <select className="inp" value={p.pricing_mode || 'ventile'} onChange={e => set('pricing_mode', e.target.value)}>
                      <option value="ventile">{tr('Ventilé', 'Itemized')}</option>
                      <option value="global">{tr('Global', 'Global')}</option>
                    </select>
                  </Field>
                  {p.pricing_mode === 'global' && (
                    <Field label={tr('Prix global ($)', 'Global price ($)')}><input type="number" className="inp" value={p.global_price ?? ''} onChange={e => set('global_price', e.target.value)} /></Field>
                  )}
                  <Field label={tr('Date soumission', 'Quote date')}><input type="date" className="inp" value={p.date_submission || ''} onChange={e => set('date_submission', e.target.value)} /></Field>
                  <Field label={tr('Début des travaux', 'Work start')}><input type="date" className="inp" value={p.date_work_start || ''} onChange={e => set('date_work_start', e.target.value)} /></Field>
                </div>

                {/* AST liés (si le tenant a le module AST) */}
                {hasMod('ast') && <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold">{tr('AST liés', 'Linked JSAs')} ({linkedAst.length})</h3>
                    <Link href={`/${tenant}/ast/nouveau?project=${id}`} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Créer un AST', 'Create JSA')}</Link>
                  </div>
                  {linkedAst.length === 0 ? (
                    <p className="text-sm text-gray-400">{tr('Aucun AST lié (associé par n° de projet).', 'No linked JSA (matched by project #).')}</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {linkedAst.map(a => (
                        <Link key={a.id} href={`/${tenant}/ast/${a.ast_number || a.id}`}
                          className="flex items-center justify-between py-2 text-sm hover:text-blue-600">
                          <span className="font-medium">{a.ast_number || a.id}</span>
                          <span className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{(a.created_at || '').slice(0, 10)}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{a.status || 'draft'}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>}

                {/* Permis liés (si le tenant a le module Permis) */}
                {hasMod('permits') && <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold">{tr('Permis liés', 'Linked permits')} ({linkedPermits.length})</h3>
                    <Link href={`/${tenant}/permits`} className="text-xs font-semibold text-cyan-600 hover:underline">+ {tr('Aller aux permis', 'Go to permits')}</Link>
                  </div>
                  {linkedPermits.length === 0 ? (
                    <p className="text-sm text-gray-400">{tr('Aucun permis lié (associé par n° de projet).', 'No linked permit (matched by project #).')}</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {linkedPermits.map(pm => (
                        <Link key={pm.permit_number} href={`/${tenant}/permits/${pm.permit_number}`}
                          className="flex items-center justify-between py-2 text-sm hover:text-cyan-600">
                          <span className="font-medium">{pm.permit_number}</span>
                          <span className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">{pm.type}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{pm.status}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>}

                {/* Rapports terrain liés (si le tenant a le module Rapports) */}
                {hasMod('rapports') && <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold">{tr('Rapports terrain liés', 'Linked field reports')} ({linkedReports.length})</h3>
                    <Link href={`/${tenant}/rapports`} className="text-xs font-semibold text-indigo-600 hover:underline">{tr('Aller aux rapports', 'Go to reports')}</Link>
                  </div>
                  {linkedReports.length === 0 ? (
                    <p className="text-sm text-gray-400">{tr('Aucun rapport lié (associez un projet depuis le rapport).', 'No linked report (link a project from the report).')}</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {linkedReports.map(rp => (
                        <Link key={rp.id} href={`/${tenant}/rapports?r=${rp.id}`}
                          className="flex items-center justify-between py-2 text-sm hover:text-indigo-600">
                          <span className="font-medium">{rp.title || rp.num || rp.id}</span>
                          <span className="flex items-center gap-3 text-xs text-gray-500">
                            {rp.num && <span>{rp.num}</span>}
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{rp.status === 'in_progress' ? tr('En cours','In progress') : rp.status === 'review' ? tr('En révision','Review') : rp.status === 'approved' ? tr('Approuvé','Approved') : rp.status === 'sent' ? tr('Envoyé','Sent') : rp.status}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>}

                {/* Soumissions liées (Projets↔Soumissions, par project_id) */}
                {linkedSoumissions.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <h3 className="mb-2 text-sm font-bold">{tr('Soumissions liées', 'Linked quotes')} ({linkedSoumissions.length})</h3>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {linkedSoumissions.map(s => (
                        <Link key={s.id} href={`/${tenant}/soumissions?s=${s.id}`}
                          className="flex items-center justify-between py-2 text-sm hover:text-emerald-600">
                          <span className="font-medium">{s.numero || s.id}</span>
                          <span className="flex items-center gap-3 text-xs text-gray-500">
                            {s.total != null && <span>{Number(s.total).toLocaleString('fr-CA')} $</span>}
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{s.status || 'draft'}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Temps réel sur le projet (feuilles de temps) — alimente le suivi et la facturation */}
                {timeRollup && timeRollup.total > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <h3 className="mb-2 text-sm font-bold">⏱️ {tr('Temps réel sur le projet', 'Actual time on project')}</h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{tr('Total', 'Total')} : {timeRollup.total.toLocaleString('fr-CA')} h</span>
                      <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{tr('Rég.', 'Reg.')} {timeRollup.reg} · {tr('Supp.', 'OT')} {timeRollup.ot} · {tr('Maj.', 'Prem.')} {timeRollup.prem}</span>
                      {timeRollup.km > 0 && <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{timeRollup.km} km</span>}
                    </div>
                    {timeRollup.byPerson.length > 0 && (
                      <div className="mt-2 divide-y divide-gray-100 text-sm dark:divide-gray-700">
                        {timeRollup.byPerson.map(p2 => (
                          <div key={p2.name} className="flex items-center justify-between py-1.5">
                            <span className="text-gray-700 dark:text-gray-200">{p2.name}</span>
                            <span className="text-xs font-semibold text-gray-500">{p2.hrs.toLocaleString('fr-CA')} h</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-gray-400">{tr('Heures saisies sur ce projet (feuilles de temps / poinçons). Base pour la facturation au temps.', 'Hours logged on this project (timesheets / punches). Basis for time-based billing.')}</p>
                  </div>
                )}

                {/* Matériel consommé (lien Inventaire — si le tenant a le module Inventaire) */}
                {hasMod('inventory') && p.project_number && <ConsumeMaterialPanel tenant={tenant} projectNumber={p.project_number} />}
              </div>
            )}

            {tab === 'temps' && (tsActuals ? <ProjectTimesheetSummary actuals={tsActuals} tenant={tenant} /> : <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>)}
            {tab === 'couts' && <CoutsTab estimate={p.estimate} actuals={(tsActuals && tsActuals.count > 0) ? tsActuals : p.actuals} poAmount={p.po_amount} />}
            {tab === 'facture' && <FactureTab tenant={tenant} projectId={id} project={p} liveActuals={tsActuals} />}
          </>
        )}
      </div>

      <style jsx>{`
        .inp { width: 100%; border-radius: 0.6rem; border: 1px solid rgb(209 213 219); background: transparent; padding: 0.5rem 0.7rem; font-size: 0.875rem; outline: none; }
        .inp:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
        :global(.dark) .inp { border-color: rgb(75 85 99); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}
