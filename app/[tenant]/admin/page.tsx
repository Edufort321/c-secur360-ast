'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Settings, CreditCard, Save, Loader2, Plus, Check, MapPin, Trash2, Car, Building2, Wrench, Clock, DollarSign, Layers, HardHat, KeyRound, ExternalLink, Eye, EyeOff, X, UserCog, Banknote, Gift, Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

type Mod = { key: string; name_fr: string; name_en: string; monthly_price: number; sort_order: number; enabled: boolean };
const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

function AutocompleteInput({ value, onChange, suggestions, placeholder, className }: {
  value: string; onChange: (v: string) => void;
  suggestions: string[]; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
  return (
    <div className={`relative ${className || ''}`}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 top-full z-30 mt-0.5 w-full min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg overflow-hidden max-h-40 overflow-y-auto">
          {filtered.map(s => (
            <li key={s}>
              <button type="button" onMouseDown={() => { onChange(s); setOpen(false); }}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  type TabKey = 'sitesdepts' | 'employes' | 'vehicules' | 'ressources' | 'clients' | 'feuilles' | 'paie' | 'abonnement' | 'facturation';
  const [tab, setTab] = useState<TabKey>('sitesdepts');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { k: TabKey; label: string; icon: any }[] = [
    { k: 'sitesdepts',  label: tr('Sites / Dépts', 'Sites / Depts'),       icon: MapPin },
    { k: 'employes',    label: tr('Employés & Accès', 'Employees & Access'), icon: HardHat },
    { k: 'vehicules',   label: tr('Véhicules', 'Vehicles'),                  icon: Car },
    { k: 'ressources',  label: tr('Ressources', 'Resources'),                icon: Wrench },
    { k: 'clients',     label: tr('Clients', 'Clients'),                     icon: Building2 },
    { k: 'feuilles',    label: tr('Feuilles de temps', 'Timesheets'),        icon: Clock },
    { k: 'paie',        label: tr('Paie & Avantages', 'Pay & Benefits'),     icon: Banknote },
    { k: 'abonnement',  label: tr('Abonnement', 'Subscription'),             icon: CreditCard },
    { k: 'facturation', label: tr('Facturation', 'Billing'),                 icon: Settings },
  ];

  const activeTab = tabs.find(t => t.k === tab);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <h1 className="mb-4 text-2xl font-bold">{tr('Administration', 'Administration')}</h1>

        {/* Mobile: hamburger */}
        <div className="mb-4 sm:hidden">
          <div className="relative">
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <div className="flex items-center gap-2">
                {activeTab && React.createElement(activeTab.icon as any, { size: 16 })}
                {activeTab?.label}
              </div>
              <svg className={`h-5 w-5 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {tabs.map(x => {
                  const Icon = x.icon as any;
                  return (
                    <button key={x.k} onClick={() => { setTab(x.k); setMobileMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
                      <Icon size={15} /> {x.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: onglets */}
        <div className="mb-4 hidden gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex">
          {tabs.map(x => {
            const Icon = x.icon as any;
            return (
              <button key={x.k} onClick={() => setTab(x.k)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                <Icon size={15} /> {x.label}
              </button>
            );
          })}
        </div>

        {tab === 'sitesdepts' && <SitesDepts tenant={tenant} tr={tr} />}
        {tab === 'employes'   && <Employes tenant={tenant} tr={tr} />}
        {tab === 'vehicules'  && <Vehicules tenant={tenant} tr={tr} />}
        {tab === 'ressources' && <Ressources tenant={tenant} tr={tr} />}
        {tab === 'clients'    && <Clients tenant={tenant} tr={tr} />}
        {tab === 'feuilles'   && <FeuillesDeTemps tenant={tenant} tr={tr} />}
        {tab === 'paie'       && <PayeConfig tenant={tenant} tr={tr} />}
        {tab === 'abonnement' && <Abonnement tenant={tenant} tr={tr} lang={lang} />}
        {tab === 'facturation' && <FacturationProjets tenant={tenant} tr={tr} />}
      </div>
    </div>
  );
}

// ============================================================
// FEUILLES DE TEMPS — admin payroll view + export
// ============================================================

function FeuillesDeTemps({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheets').select('*').eq('tenant_id', tenant).order('period_start', { ascending: false });
    setSheets(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const employees = useMemo(() => [...new Set(sheets.map((s: any) => s.employee_name))].sort(), [sheets]);
  const years = useMemo(() => {
    const ys = [...new Set(sheets.map((s: any) => new Date(s.period_start).getFullYear()))].sort((a: any, b: any) => b - a) as number[];
    return ys.length ? ys : [new Date().getFullYear()];
  }, [sheets]);

  const filtered = useMemo(() => sheets.filter((s: any) => {
    if (new Date(s.period_start).getFullYear() !== yearFilter) return false;
    if (empFilter && s.employee_name !== empFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  }), [sheets, yearFilter, empFilter, statusFilter]);

  const totals = useMemo(() => filtered.reduce((acc: any, s: any) => ({
    hrs: acc.hrs + Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium),
    km: acc.km + Number(s.total_km_personal),
    amt: acc.amt + Number(s.total_amount),
    ded: acc.ded + Number(s.vehicle_deduction || 0),
  }), { hrs: 0, km: 0, amt: 0, ded: 0 }), [filtered]);

  function weekNum(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  }

  function exportCSV() {
    const toExport = filtered.filter((s: any) => s.status === 'approved' || s.status === 'paid');
    if (!toExport.length) { alert(tr('Aucune feuille approuvée dans la sélection.', 'No approved sheet in selection.')); return; }
    const rows = [
      ['Employé', 'Email', 'Période #', 'Période début', 'Période fin', 'Hrs rég', 'Hrs supp', 'Hrs maj', 'Km pers.', 'Montant total', 'Statut'].join(','),
      ...toExport.map((s: any) => [`"${s.employee_name}"`, s.employee_email, `P.${weekNum(s.period_start)}`, s.period_start, s.period_end,
        s.total_regular, s.total_overtime, s.total_premium, s.total_km_personal, s.total_amount, s.status].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `paie_${yearFilter}_${tenant}${empFilter ? `_${empFilter.replace(/\s+/g, '_')}` : ''}.csv`,
    });
    a.click();
  }

  const mny = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });

  const STATUS_CLS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600', submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', paid: 'bg-blue-100 text-blue-700',
  };
  const STATUS_LBL: Record<string, string> = { draft: tr('Brouillon','Draft'), submitted: tr('Soumis','Submitted'), approved: tr('Approuvé','Approved'), rejected: tr('Refusé','Rejected'), paid: tr('Payé','Paid') };

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: tr('Heures totales', 'Total hours'),       value: `${totals.hrs.toFixed(1)} h`, tone: 'text-slate-900 dark:text-white' },
          { label: tr('Km remboursables', 'Reimbursable km'), value: `${totals.km.toFixed(0)} km`, tone: 'text-emerald-600' },
          { label: tr('Déductions véhicule', 'Vehicle ded.'), value: totals.ded > 0 ? `-${mny(totals.ded)}` : '0,00 $', tone: 'text-red-600' },
          { label: tr('Montant total', 'Total amount'),       value: mny(totals.amt),              tone: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${yearFilter === y ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              {y}
            </button>
          ))}
        </div>
        {employees.length > 0 && (
          <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="">{tr('Tous les employés', 'All employees')}</option>
            {employees.map(emp => <option key={emp as string} value={emp as string}>{emp as string}</option>)}
          </select>
        )}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">{tr('Tous les statuts', 'All statuses')}</option>
          <option value="draft">{tr('Brouillon', 'Draft')}</option>
          <option value="submitted">{tr('Soumis', 'Submitted')}</option>
          <option value="approved">{tr('Approuvé', 'Approved')}</option>
          <option value="paid">{tr('Payé', 'Paid')}</option>
          <option value="rejected">{tr('Refusé', 'Rejected')}</option>
        </select>
        <div className="ml-auto">
          <button onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            <DollarSign size={15} /> {tr('Export paie CSV', 'Export payroll CSV')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="px-4 py-3">{tr('Employé', 'Employee')}</th>
                <th className="px-4 py-3">{tr('Période', 'Period')}</th>
                <th className="px-4 py-3">{tr('Heures', 'Hours')}</th>
                <th className="px-4 py-3">{tr('Km pers.', 'Pers. km')}</th>
                <th className="px-4 py-3 text-red-600">{tr('Déd. véhicule', 'Vehicle ded.')}</th>
                <th className="px-4 py-3">{tr('Montant', 'Amount')}</th>
                <th className="px-4 py-3">{tr('Statut', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => {
                const hrs = Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium);
                return (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold dark:bg-gray-600">{(s.employee_name || '?')[0].toUpperCase()}</div>
                        <div>
                          <div className="font-medium">{s.employee_name}</div>
                          <div className="text-xs text-gray-400">{s.employee_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-violet-500">P.{weekNum(s.period_start)}</div>
                      <div className="text-gray-600 dark:text-gray-300">{fmt(s.period_start)} – {fmt(s.period_end)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{hrs.toFixed(1)} h</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{Number(s.total_km_personal).toFixed(0)} km</td>
                    <td className="px-4 py-3 font-semibold text-red-600">
                      {Number(s.vehicle_deduction || 0) > 0 ? `-${mny(Number(s.vehicle_deduction))}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-violet-700">{mny(Number(s.total_amount))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[s.status] || STATUS_CLS.draft}`}>
                        {STATUS_LBL[s.status] || s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{tr('Aucune feuille de temps pour cette sélection.', 'No timesheet for this selection.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FacturationProjets({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'resume' | 'factures'>('resume');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('projects')
      .select('id, project_number, title, client_name, status, po_amount, estimate, actuals, facture')
      .eq('tenant_id', tenant).order('created_at', { ascending: false });
    setRows(data || []); setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const reelOf = (r: any) => Number(r.actuals?.total || 0);
  const sum = (st: string) => rows.filter(r => r.status === st).reduce((s, r) => s + Number(r.po_amount || 0), 0);
  const margeTotale = rows.filter(r => r.status === 'facture').reduce((s, r) => s + (Number(r.po_amount || 0) - reelOf(r)), 0);

  const INV: Record<string, { label: string; cls: string }> = {
    draft:     { label: tr('Brouillon', 'Draft'),   cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    sent:      { label: tr('Envoyée', 'Sent'),      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    paid:      { label: tr('Payée', 'Paid'),        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    cancelled: { label: tr('Annulée', 'Cancelled'), cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' },
  };

  function startEdit(row: any) {
    setEditing(row.id);
    const idx = rows.findIndex(r => r.id === row.id);
    setForm(row.facture || {
      invoice_number: `F-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
      invoice_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft', notes: '',
    });
  }

  async function saveInvoice(projectId: string) {
    setSaving(true); setNotice(null);
    try {
      await supabase.from('projects').update({ facture: form }).eq('id', projectId);
      setRows(p => p.map(r => r.id === projectId ? { ...r, facture: form } : r));
      setEditing(null); setNotice(tr('Facture enregistrée ✓', 'Invoice saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  const fmtDate = (d?: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const inp = 'w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800';

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Commerce CERDIA banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-xs font-bold text-white">CC</div>
        <div>
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Commerce CERDIA</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300">
            {tr('Toutes les factures sont émises par Commerce CERDIA. Aucun lien avec les finances personnelles.', 'All invoices are issued by Commerce CERDIA. No link to personal finances.')}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { k: 'resume',   label: tr('Résumé', 'Summary') },
          { k: 'factures', label: tr('Factures émises', 'Issued invoices') },
        ].map(x => (
          <button key={x.k} onClick={() => setSubTab(x.k as any)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
            {x.label}
          </button>
        ))}
      </div>

      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{notice}</div>}

      {/* ── Résumé ── */}
      {subTab === 'resume' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: tr('Facturé', 'Invoiced'),          value: money(sum('facture')),   tone: 'text-emerald-600' },
              { label: tr('En cours', 'In progress'),      value: money(sum('en-cours')),  tone: 'text-blue-600' },
              { label: tr('Soumissions', 'Quotes'),        value: money(sum('soumission')), tone: 'text-amber-600' },
              { label: tr('Marge (facturé − réel)', 'Margin (invoiced − actual)'), value: money(margeTotale), tone: margeTotale >= 0 ? 'text-emerald-600' : 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 px-4 py-3 font-bold dark:border-gray-700">{tr('Projets', 'Projects')}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2">{tr('Projet', 'Project')}</th><th className="px-3">{tr('Client', 'Client')}</th>
                  <th className="px-3">{tr('Statut projet', 'Project status')}</th><th className="px-3 text-right">{tr('Estimé', 'Est.')}</th>
                  <th className="px-3 text-right">{tr('Réel', 'Actual')}</th><th className="px-3 text-right">{tr('Facturé', 'Invoiced')}</th><th className="px-3 text-right">{tr('Marge', 'Margin')}</th>
                </tr></thead>
                <tbody>
                  {rows.map(r => {
                    const est = Number(r.estimate?.total || 0); const reel = reelOf(r); const fac = Number(r.po_amount || 0); const marge = fac - reel;
                    return (
                      <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2"><div className="font-medium">{r.title || r.project_number}</div><div className="text-xs text-gray-400">#{r.project_number}</div></td>
                        <td className="px-3 text-gray-600 dark:text-gray-300">{r.client_name || '—'}</td>
                        <td className="px-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{r.status || 'soumission'}</span></td>
                        <td className="px-3 text-right">{money(est)}</td>
                        <td className="px-3 text-right">{money(reel)}</td>
                        <td className="px-3 text-right font-medium">{money(fac)}</td>
                        <td className={`px-3 text-right font-medium ${marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{r.status === 'facture' ? money(marge) : '—'}</td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">{tr('Aucun projet.', 'No project.')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Factures émises ── */}
      {subTab === 'factures' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <div className="font-bold">{tr('Factures émises', 'Issued invoices')}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{tr('Une facture par projet — stockée directement sur le projet.', 'One invoice per project — stored directly on the project.')}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="px-4 py-3">{tr('Projet', 'Project')}</th>
                  <th className="px-4 py-3">{tr('Client', 'Client')}</th>
                  <th className="px-4 py-3">{tr('N° facture', 'Invoice #')}</th>
                  <th className="px-4 py-3">{tr('Date', 'Date')}</th>
                  <th className="px-4 py-3">{tr('Échéance', 'Due')}</th>
                  <th className="px-4 py-3 text-right">{tr('Montant', 'Amount')}</th>
                  <th className="px-4 py-3">{tr('Statut', 'Status')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const inv = r.facture;
                  const st = inv ? (INV[inv.status] || INV.draft) : null;
                  return (
                    <React.Fragment key={r.id}>
                      <tr className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3"><div className="font-medium">{r.title || r.project_number}</div><div className="text-xs text-gray-400">#{r.project_number}</div></td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.client_name || '—'}</td>
                        <td className="px-4 py-3 font-mono">{inv?.invoice_number || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{fmtDate(inv?.invoice_date)}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{fmtDate(inv?.due_date)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">{Number(r.po_amount) > 0 ? money(Number(r.po_amount)) : '—'}</td>
                        <td className="px-4 py-3">
                          {st ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                              : <span className="text-xs text-gray-400 dark:text-gray-500">{tr('Non facturé', 'Not invoiced')}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => editing === r.id ? setEditing(null) : startEdit(r)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            {editing === r.id ? '✕' : (inv ? tr('Modifier', 'Edit') : tr('+ Créer', '+ Create'))}
                          </button>
                        </td>
                      </tr>
                      {editing === r.id && (
                        <tr className="border-t border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('N° facture', 'Invoice #')}</label>
                                <input className={inp} value={form.invoice_number || ''} onChange={e => setForm((f: any) => ({ ...f, invoice_number: e.target.value }))} placeholder="F-2026-001" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Date facture', 'Invoice date')}</label>
                                <input type="date" className={inp} value={form.invoice_date || ''} onChange={e => setForm((f: any) => ({ ...f, invoice_date: e.target.value }))} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Échéance', 'Due date')}</label>
                                <input type="date" className={inp} value={form.due_date || ''} onChange={e => setForm((f: any) => ({ ...f, due_date: e.target.value }))} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Statut', 'Status')}</label>
                                <select className={inp} value={form.status || 'draft'} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}>
                                  <option value="draft">{tr('Brouillon', 'Draft')}</option>
                                  <option value="sent">{tr('Envoyée', 'Sent')}</option>
                                  <option value="paid">{tr('Payée', 'Paid')}</option>
                                  <option value="cancelled">{tr('Annulée', 'Cancelled')}</option>
                                </select>
                              </div>
                              {form.status === 'paid' && (
                                <div>
                                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Date paiement', 'Payment date')}</label>
                                  <input type="date" className={inp} value={form.paid_date || ''} onChange={e => setForm((f: any) => ({ ...f, paid_date: e.target.value }))} />
                                </div>
                              )}
                              <div className="flex items-end">
                                <button onClick={() => saveInvoice(r.id)} disabled={saving}
                                  className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</label>
                              <input className={inp} value={form.notes || ''} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder={tr('Notes internes...', 'Internal notes...')} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">{tr('Aucun projet.', 'No project.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Sites({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('sites').select('id, name, code, type, address, is_active').eq('tenant_id', tenant).order('name');
    setRows((data || []).map((s: any) => ({ ...s, addressText: s.address?.text || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: string, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', code: '', type: 'chantier', addressText: '', is_active: true }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const data: any = { tenant_id: tenant, name: r.name, code: r.code || null, type: r.type || 'site', is_active: r.is_active !== false, address: r.addressText ? { text: r.addressText } : null };
        if (r.id) await supabase.from('sites').update(data).eq('id', r.id);
        else await supabase.from('sites').insert(data);
      }
      setNotice(tr('Sites enregistrés ✓', 'Sites saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }
  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('sites').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div><h2 className="font-bold">{tr('Sites du client', 'Client sites')}</h2><p className="text-xs text-gray-500">{tr('Alimentent le sélecteur « Tous les sites / un site ».', 'Feed the “All sites / one site” selector.')}</p></div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-2 py-2">{tr('Nom', 'Name')}</th><th className="px-2">{tr('Code', 'Code')}</th><th className="px-2">{tr('Type', 'Type')}</th><th className="px-2">{tr('Adresse', 'Address')}</th><th className="px-2">{tr('Actif', 'Active')}</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} /></td>
                <td className="px-2"><input className={`${inp} w-24`} value={r.code || ''} onChange={e => upd(i, 'code', e.target.value)} /></td>
                <td className="px-2">
                  <select className={`${inp} w-28`} value={r.type || 'site'} onChange={e => upd(i, 'type', e.target.value)}>
                    <option value="siege">{tr('Siège', 'HQ')}</option><option value="chantier">{tr('Chantier', 'Job site')}</option><option value="bureau">{tr('Bureau', 'Office')}</option><option value="site">Site</option>
                  </select>
                </td>
                <td className="px-2"><input className={inp} value={r.addressText || ''} onChange={e => upd(i, 'addressText', e.target.value)} /></td>
                <td className="px-2"><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-gray-400">{tr('Aucun site. Ajoute le siège et les chantiers.', 'No site. Add HQ and job sites.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Abonnement({ tenant, tr, lang }: { tenant: string; tr: (f: string, e: string) => string; lang: string }) {
  const [mods, setMods] = useState<Mod[]>([]);
  const [cfg, setCfg] = useState({ discount_per_module: 5, discount_cap: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: catalog, error } = await supabase.from('modules').select('*').order('sort_order');
        if (error) throw error;
        const { data: tm } = await supabase.from('tenant_modules').select('module_key, enabled').eq('tenant_id', tenant);
        const enabledSet = new Set((tm || []).filter((x: any) => x.enabled).map((x: any) => x.module_key));
        const { data: bc } = await supabase.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle();
        if (bc) setCfg({ discount_per_module: Number(bc.discount_per_module), discount_cap: Number(bc.discount_cap) });
        if (active) setMods((catalog || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price), enabled: enabledSet.has(m.key) })));
      } catch {
        if (active) setMods([]);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant]);

  const selected = mods.filter(m => m.enabled);
  const subtotal = useMemo(() => selected.reduce((s, m) => s + (m.monthly_price || 0), 0), [mods]);
  const discountPct = Math.min(Math.max(selected.length - 1, 0) * cfg.discount_per_module, cfg.discount_cap);
  const total = subtotal * (1 - discountPct / 100);

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (mods.length === 0) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun module configuré. Contactez votre administrateur.', 'No module configured. Contact your administrator.')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-bold">{tr('Modules actifs', 'Active modules')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tr('Configuré par votre administrateur C-Secur360.', 'Configured by your C-Secur360 administrator.')}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {tr('Lecture seule', 'Read only')}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {mods.map(m => (
            <div key={m.key} className="flex items-center gap-3 px-4 py-2.5">
              <div className={`grid h-6 w-6 place-items-center rounded border ${m.enabled ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'}`}>
                {m.enabled && <Check size={14} />}
              </div>
              <span className={`flex-1 font-medium ${!m.enabled ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                {lang === 'fr' ? m.name_fr : m.name_en}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {m.monthly_price > 0 ? `${money(m.monthly_price)}/${tr('an', 'yr')}` : tr('Inclus', 'Included')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 font-bold">{tr('Facture annuelle', 'Annual invoice')}</h2>
        <div className="space-y-1 text-sm">
          {selected.map(m => (
            <div key={m.key} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{lang === 'fr' ? m.name_fr : m.name_en}</span>
              <span>{money(m.monthly_price)}</span>
            </div>
          ))}
          {selected.length === 0 && <div className="text-gray-400">{tr('Aucun module actif', 'No active module')}</div>}
        </div>
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>{tr('Sous-total', 'Subtotal')}</span><span>{money(subtotal)}</span></div>
          {discountPct > 0 && (
            <div className="flex justify-between text-emerald-600"><span>{tr('Escompte', 'Discount')} ({discountPct}%)</span><span>− {money(subtotal * discountPct / 100)}</span></div>
          )}
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          {tr('Pour modifier votre abonnement, contactez votre administrateur C-Secur360.', 'To modify your subscription, contact your C-Secur360 administrator.')}
        </p>
      </div>
    </div>
  );
}

function Clients({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type CRow = { id?: string; name: string; contact_name: string; contact_email: string; contact_phone: string; phone: string; email: string; address: string; city: string; province: string; postal_code: string; notes: string; active: boolean };
  const empty = (): CRow => ({ name: '', contact_name: '', contact_email: '', contact_phone: '', phone: '', email: '', address: '', city: '', province: 'QC', postal_code: '', notes: '', active: true });
  const [rows, setRows] = useState<CRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState<CRow>(empty());
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenant).order('name');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function select(i: number) { setSelected(i); setForm({ ...rows[i] }); }
  function deselect() { setSelected(null); setForm(empty()); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true); setNotice(null);
    try {
      const payload = { tenant_id: tenant, ...form };
      if (form.id) { await supabase.from('clients').update(payload).eq('id', form.id); }
      else { await supabase.from('clients').insert(payload); }
      setNotice(tr('Client enregistré ✓', 'Client saved ✓'));
      deselect(); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    await supabase.from('clients').delete().eq('id', id);
    deselect(); load();
  }

  const provinces = ['QC','ON','BC','AB','SK','MB','NB','NS','PE','NL','NT','YT','NU'];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div><h2 className="font-bold">{tr('Répertoire clients', 'Client directory')}</h2>
          <p className="text-xs text-gray-500">{tr('Prérempli automatiquement lors de la création de projets.', 'Auto-fills when creating projects.')}</p></div>
          <button onClick={() => { deselect(); setForm(empty()); setSelected(-1); }}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={15} /> {tr('Nouveau', 'New')}
          </button>
        </div>
        {loading ? <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((r, i) => (
              <div key={r.id} onClick={() => select(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selected === i ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Building2 size={16} className="text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-sm">{r.name}</div>
                  <div className="truncate text-xs text-gray-500">{[r.contact_name, r.city, r.province].filter(Boolean).join(' · ')}</div>
                </div>
                {!r.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-gray-700">{tr('Inactif', 'Inactive')}</span>}
              </div>
            ))}
            {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">{tr('Aucun client. Crée-en un.', 'No client. Create one.')}</div>}
          </div>
        )}
      </div>

      {/* Fiche client */}
      {selected !== null && (
        <div className="h-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{form.id ? tr('Modifier client', 'Edit client') : tr('Nouveau client', 'New client')}</h2>
            <button onClick={deselect} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {notice && <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Entreprise *', 'Company *')}</label>
            <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hydro-Québec" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Contact', 'Contact')}</label>
              <input className={inp} value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Tél. direct', 'Direct phone')}</label>
              <input className={inp} value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="514-555-0001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Courriel contact', 'Contact email')}</label>
              <input type="email" className={inp} value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="jean@exemple.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Tél. bureau', 'Office phone')}</label>
              <input className={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="514-555-0000" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Courriel facturation', 'Billing email')}</label>
            <input type="email" className={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="facturation@exemple.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Adresse', 'Address')}</label>
            <input className={inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 rue Principale" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Ville', 'City')}</label>
              <input className={inp} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Montréal" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Province</label>
              <select className={inp} value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Code postal', 'Postal code')}</label>
            <input className={`${inp} uppercase`} value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value.toUpperCase() }))} placeholder="H1A 2B3" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</label>
            <textarea className={inp} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            {tr('Client actif', 'Active client')}
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !form.name.trim()}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
            </button>
            {form.id && (
              <button onClick={() => del(form.id!)}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type VRow = {
  id?: string; type: 'company' | 'personal'; unit_number: string; name: string;
  make: string; model: string; year: string; plate: string;
  employee_name: string; assigned_to: string;
  km_rate_override: string; purchase_price: string; km_at_year_start: string;
  active: boolean; notes: string;
};

function VehicleTable({ label, badge, items, onAdd, upd, del, tr, inp, personnelSuggestions, tenantUsers }: {
  label: string; badge: string; items: { r: VRow; i: number }[]; onAdd: () => void;
  upd: (i: number, k: keyof VRow, v: any) => void;
  del: (i: number) => void;
  tr: (f: string, e: string) => string;
  inp: string;
  personnelSuggestions: string[];
  tenantUsers: { id: string; name: string; email: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{label}</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">{badge}</span>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
          <Plus size={15} /> {tr('Ajouter', 'Add')}
        </button>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('N° unité', 'Unit #')}</th>
            <th className="px-2 py-1.5">{tr('Marque', 'Make')}</th>
            <th className="px-2">{tr('Modèle', 'Model')}</th>
            <th className="px-2">{tr('Année', 'Year')}</th>
            <th className="px-2">{tr('Plaque', 'Plate')}</th>
            <th className="px-2">{tr('Employé / Propriétaire', 'Employee / Owner')}</th>
            <th className="px-2 whitespace-nowrap">{tr('Compte attitré', 'Assigned account')}</th>
            <th className="px-2">{tr('Taux km $', 'Km rate $')}</th>
            <th className="px-2 whitespace-nowrap">{tr('Prix achat $', 'Purchase $')}</th>
            <th className="px-2 whitespace-nowrap">{tr('Km début année', 'Km year start')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {items.map(({ r, i }) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={`${inp} w-24`} value={r.unit_number} onChange={e => upd(i, 'unit_number', e.target.value)} placeholder="S26105" /></td>
                <td className="px-2 py-1"><input className={inp} value={r.make} onChange={e => upd(i, 'make', e.target.value)} placeholder="Toyota" /></td>
                <td className="px-2"><input className={inp} value={r.model} onChange={e => upd(i, 'model', e.target.value)} placeholder="Corolla" /></td>
                <td className="px-2"><input className={`${inp} w-16`} value={r.year} onChange={e => upd(i, 'year', e.target.value)} placeholder="2022" /></td>
                <td className="px-2"><input className={`${inp} w-24`} value={r.plate} onChange={e => upd(i, 'plate', e.target.value)} placeholder="ABC-123" /></td>
                <td className="px-2">
                  <AutocompleteInput
                    value={r.employee_name}
                    onChange={v => upd(i, 'employee_name', v)}
                    suggestions={personnelSuggestions}
                    placeholder={r.type === 'personal' ? tr('Nom employé', 'Employee name') : tr('Nom affiché', 'Display name')}
                  />
                </td>
                <td className="px-2">
                  <select
                    value={r.assigned_to}
                    onChange={e => upd(i, 'assigned_to', e.target.value)}
                    className={`${inp} min-w-[140px]`}
                  >
                    <option value="">— {tr('Aucun', 'None')} —</option>
                    {tenantUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      className={`${inp} w-20`}
                      value={r.km_rate_override}
                      placeholder={tr('Global', 'Global')}
                      onChange={e => upd(i, 'km_rate_override', e.target.value)}
                      onBlur={e => {
                        const v = parseFloat(e.target.value.replace(/,/g, '.'));
                        upd(i, 'km_rate_override', isNaN(v) ? '' : v.toFixed(2));
                      }}
                    />
                    <span className="text-xs text-gray-400">/km</span>
                  </div>
                </td>
                <td className="px-2">
                  <input type="text" inputMode="decimal" className={`${inp} w-24`} value={r.purchase_price}
                    placeholder="35000" onChange={e => upd(i, 'purchase_price', e.target.value)}
                    onBlur={e => { const v = parseFloat(e.target.value.replace(/,/g, '.')); upd(i, 'purchase_price', isNaN(v) ? '' : v.toFixed(2)); }} />
                </td>
                <td className="px-2">
                  <input type="number" min={0} step={1} className={`${inp} w-24`} value={r.km_at_year_start}
                    placeholder="0" onChange={e => upd(i, 'km_at_year_start', e.target.value)} />
                </td>
                <td className="px-2"><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={12} className="px-2 py-5 text-center text-gray-400 text-sm">{tr('Aucun véhicule.', 'No vehicle.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Vehicules({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<VRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [personnelSuggestions, setPersonnelSuggestions] = useState<string[]>([]);
  const [tenantUsers, setTenantUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  useEffect(() => {
    Promise.all([
      supabase.from('planner_personnel').select('name').eq('tenant_id', tenant),
      fetch(`/api/admin/users?tenant=${tenant}`).then(r => r.json()),
    ]).then(([{ data: personnel }, usersRes]) => {
      if (personnel) setPersonnelSuggestions(personnel.map((p: any) => p.name?.trim()).filter(Boolean));
      if (usersRes?.users) setTenantUsers(usersRes.users.map((u: any) => ({ id: u.id, name: u.name || '', email: u.email || '' })));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('vehicles').select('*').eq('tenant_id', tenant).order('type').order('name');
    setRows((data || []).map((v: any) => ({ ...v, unit_number: v.unit_number || '', year: String(v.year || ''), assigned_to: v.assigned_to || '', km_rate_override: v.km_rate_override != null ? String(v.km_rate_override) : '', purchase_price: v.purchase_price != null ? String(v.purchase_price) : '', km_at_year_start: v.km_at_year_start != null ? String(v.km_at_year_start) : '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof VRow, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  const addCompany  = () => setRows(p => [...p, { type: 'company',  unit_number: '', name: '', make: '', model: '', year: '', plate: '', employee_name: '', assigned_to: '', km_rate_override: '', purchase_price: '', km_at_year_start: '', active: true, notes: '' }]);
  const addPersonal = () => setRows(p => [...p, { type: 'personal', unit_number: '', name: '', make: '', model: '', year: '', plate: '', employee_name: '', assigned_to: '', km_rate_override: '', purchase_price: '', km_at_year_start: '', active: true, notes: '' }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.make?.trim() && !r.name?.trim()) continue;
        const payload: any = {
          tenant_id: tenant, type: r.type,
          unit_number: r.unit_number || '',
          name: r.name || `${r.make} ${r.model} ${r.year}`.trim(),
          make: r.make, model: r.model,
          year: r.year ? Number(r.year) : null,
          plate: r.plate, employee_name: r.employee_name,
          assigned_to: r.assigned_to || null,
          km_rate_override: r.km_rate_override !== '' ? Number(r.km_rate_override) : null,
          purchase_price: r.purchase_price !== '' ? parseFloat(r.purchase_price.replace(/,/g, '.')) : null,
          km_at_year_start: r.km_at_year_start !== '' ? Number(r.km_at_year_start) : 0,
          km_year_start_year: new Date().getFullYear(),
          active: r.active, notes: r.notes,
        };
        if (r.id) await supabase.from('vehicles').update(payload).eq('id', r.id);
        else await supabase.from('vehicles').insert(payload);
      }
      setNotice(tr('Véhicules enregistrés ✓', 'Vehicles saved ✓'));
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('vehicles').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const companyRows  = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.type === 'company');
  const personalRows = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.type === 'personal');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tr('Véhicules d\'entreprise fournis + personnels autorisés. Utilisés dans les feuilles de temps pour calculer les remboursements km.', 'Company vehicles provided + authorized personal vehicles. Used in timesheets to calculate km reimbursements.')}
        </p>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
        </button>
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{notice}</div>}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <strong>{tr('Véhicule entreprise', 'Company vehicle')} :</strong> {tr('fourni par l\'employeur — 0 $ de remboursement à l\'employé dans la feuille de temps.', 'provided by employer — $0 reimbursement to employee in timesheet.')}<br />
        <strong>{tr('Véhicule personnel autorisé', 'Authorized personal vehicle')} :</strong> {tr('employé utilise son véhicule — remboursé au taux km configuré.', 'employee uses own vehicle — reimbursed at configured km rate.')}
      </div>

      <VehicleTable
        label={tr('Véhicules entreprise', 'Company vehicles')}
        badge={tr(`${companyRows.length} véhicule(s)`, `${companyRows.length} vehicle(s)`)}
        items={companyRows} onAdd={addCompany}
        upd={upd} del={del} tr={tr} inp={inp}
        personnelSuggestions={personnelSuggestions}
        tenantUsers={tenantUsers}
      />
      <VehicleTable
        label={tr('Véhicules personnels autorisés', 'Authorized personal vehicles')}
        badge={tr(`${personalRows.length} véhicule(s)`, `${personalRows.length} vehicle(s)`)}
        items={personalRows} onAdd={addPersonal}
        upd={upd} del={del} tr={tr} inp={inp}
        personnelSuggestions={personnelSuggestions}
        tenantUsers={tenantUsers}
      />
    </div>
  );
}

function generatePassword(name: string): string {
  const specials = ['@', '#', '$', '!', '%', '&', '?', '*', '+', '='];
  // 4 lettres tirées du nom (diacritiques retirés, maj sur la 1re)
  const clean = (name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '');
  const letters = clean.length >= 4
    ? clean[0].toUpperCase() + clean.slice(1, 4).toLowerCase()
    : (clean[0]?.toUpperCase() || 'X') + clean.slice(1).toLowerCase().padEnd(3, 'x');
  // 3 chiffres aléatoires
  const digits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  // 2 caractères spéciaux aléatoires distincts
  const sp1 = specials[Math.floor(Math.random() * specials.length)];
  let sp2 = specials[Math.floor(Math.random() * specials.length)];
  while (sp2 === sp1) sp2 = specials[Math.floor(Math.random() * specials.length)];
  return `${letters}${digits}${sp1}${sp2}`;
}

function Profils({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', name: '', role: 'user', password: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', is_active: true, newPassword: '' });
  const [editBusy, setEditBusy] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function genPwd(name: string) {
    const pwd = generatePassword(name || form.name);
    setForm(f => ({ ...f, password: pwd }));
    setShowPwd(true);
  }

  function copyPwd() {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function load() {
    setLoading(true);
    try { const r = await fetch(`/api/admin/users?tenant=${tenant}`); const d = await r.json(); setUsers(d.users || []); }
    catch { setUsers([]); } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant, ...form }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setNotice(tr('Profil créé ✓', 'Profile created ✓')); setForm({ email: '', name: '', role: 'user', password: '' }); load();
    } catch (e: any) { setNotice(e.message || tr('Erreur', 'Error')); } finally { setBusy(false); }
  }

  function openEdit(u: any) {
    setEditing(u);
    setEditForm({ name: u.name || '', email: u.email || '', role: u.role || 'user', is_active: u.is_active !== false, newPassword: '' });
    setEditNotice(null);
    setShowEditPwd(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); setEditBusy(true); setEditNotice(null);
    try {
      const body: any = { id: editing.id, name: editForm.name, email: editForm.email, role: editForm.role, is_active: editForm.is_active };
      if (editForm.newPassword) body.password = editForm.newPassword;
      const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setEditNotice(tr('Enregistré ✓', 'Saved ✓')); load();
    } catch (e: any) { setEditNotice(e.message || tr('Erreur', 'Error')); } finally { setEditBusy(false); }
  }

  async function deleteUser(id: string) {
    const r = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (r.ok) { setEditing(null); setConfirmDelete(null); load(); }
  }

  const inp2 = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-gray-600';

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="border-b border-gray-100 px-4 py-3 font-bold dark:border-gray-700">{tr('Comptes du tenant', 'Tenant accounts')}</div>
        {loading ? <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map(u => (
              <div key={u.id} onClick={() => openEdit(u)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/40 ${editing?.id === u.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${u.is_active !== false ? 'bg-gray-900 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {(u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{u.name || u.email}</div>
                  <div className="truncate text-xs text-gray-500">{u.email}</div>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{u.role}</span>
                {u.is_active === false && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">{tr('Archivé', 'Archived')}</span>}
              </div>
            ))}
            {users.length === 0 && <div className="px-4 py-6 text-sm text-gray-400">{tr('Aucun profil.', 'No profile.')}</div>}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Edit panel */}
        {editing && (
          <form onSubmit={saveEdit} className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-500/30 dark:bg-blue-500/5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">{tr('Modifier le compte', 'Edit account')}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            {editNotice && <p className={`text-xs font-medium ${editNotice.includes('✓') ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>{editNotice}</p>}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Nom', 'Name')}</label>
              <input className={inp2} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Courriel', 'Email')}</label>
              <input type="email" className={inp2} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Rôle', 'Role')}</label>
              <select className={inp2} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">{tr('Utilisateur', 'User')}</option>
                <option value="client_admin">{tr('Admin client', 'Client admin')}</option>
                <option value="super_admin">{tr('Super admin', 'Super admin')}</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
              {tr('Compte actif', 'Active account')}
            </label>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Nouveau mot de passe (optionnel)', 'New password (optional)')}</label>
              <div className="relative">
                <input
                  type={showEditPwd ? 'text' : 'password'}
                  className={`${inp2} pr-14`}
                  value={editForm.newPassword}
                  onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder={tr('Laisser vide = inchangé', 'Leave empty = unchanged')}
                />
                <button type="button" onClick={() => setShowEditPwd(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showEditPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={editBusy}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {editBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
              </button>
              {confirmDelete === editing.id ? (
                <button type="button" onClick={() => deleteUser(editing.id)}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  {tr('Confirmer', 'Confirm')}
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(editing.id)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Create form */}
        <form onSubmit={create} className="h-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-bold">{tr('Nouveau compte', 'New account')}</h2>
          <input required type="email" placeholder={tr('Courriel', 'Email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp2} />
          <input
            placeholder={tr('Nom', 'Name')} value={form.name}
            onChange={e => {
              const name = e.target.value;
              setForm(f => ({ ...f, name }));
              if (name.trim().length >= 2) genPwd(name);
            }}
            className={inp2}
          />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp2}>
            <option value="user">{tr('Utilisateur', 'User')}</option>
            <option value="client_admin">{tr('Admin client', 'Client admin')}</option>
            <option value="super_admin">{tr('Super admin', 'Super admin')}</option>
          </select>
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  placeholder={tr('Mot de passe initial', 'Initial password')}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`${inp2} pr-14`}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={() => genPwd(form.name)} title={tr('Générer', 'Generate')}
                className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                ↻
              </button>
            </div>
            {form.password && (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-3 py-2">
                <span className="font-mono text-sm font-bold tracking-widest text-gray-800 dark:text-gray-100 select-all">{form.password}</span>
                <button type="button" onClick={copyPwd}
                  className={`ml-3 shrink-0 text-xs font-semibold px-2 py-0.5 rounded transition ${copied ? 'text-green-600' : 'text-blue-600 hover:underline'}`}>
                  {copied ? tr('Copié ✓', 'Copied ✓') : tr('Copier', 'Copy')}
                </button>
              </div>
            )}
          </div>
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {tr('Créer', 'Create')}
          </button>
          {notice && <p className={`text-sm ${notice.includes('✓') ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>{notice}</p>}
        </form>
      </div>
    </div>
  );
}

// ============================================================
// RESSOURCES PLANNER
// ============================================================

function Ressources({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [subTab, setSubTab] = useState<'equipements' | 'postes'>('equipements');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tr('Équipements et postes utilisés par le planificateur.', 'Equipment and positions used by the planner.')}
      </p>
      <div className="flex gap-1 overflow-x-auto">
        {[
          { k: 'equipements', label: tr('Équipements', 'Equipment') },
          { k: 'postes',      label: tr('Postes', 'Positions') },
        ].map(x => (
          <button key={x.k} onClick={() => setSubTab(x.k as any)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
            {x.label}
          </button>
        ))}
      </div>
      {subTab === 'equipements' && <EquipementsPlanner tenant={tenant} tr={tr} inp={inp} />}
      {subTab === 'postes'      && <PostesPlanner      tenant={tenant} tr={tr} inp={inp} />}
    </div>
  );
}

// ============================================================
// EMPLOYÉS — PersonnelPlanner avec liens vers modules
// ============================================================

function Employes({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [subTab, setSubTab] = useState<'personnel' | 'comptes'>('personnel');
  return (
    <div className="space-y-4">
      {/* Module cross-links */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: `/${tenant}/planificateur`, label: tr('Planificateur', 'Planner'), color: 'bg-violet-100 text-violet-700 border-violet-200' },
          { href: `/${tenant}/timesheets`,    label: tr('Feuilles de temps', 'Timesheets'), color: 'bg-blue-100 text-blue-700 border-blue-200' },
          { href: `/${tenant}/todo`,          label: tr('Tâches', 'Tasks'), color: 'bg-amber-100 text-amber-700 border-amber-200' },
        ].map(m => (
          <Link key={m.href} href={m.href}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 ${m.color}`}>
            <ExternalLink size={12} /> {m.label}
          </Link>
        ))}
      </div>
      {/* Sub-tabs: Personnel planificateur + Comptes d'accès */}
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { k: 'personnel', label: tr('Personnel & planification', 'Staff & planning'), icon: HardHat },
          { k: 'comptes',   label: tr('Comptes & accès',           'Accounts & access'), icon: KeyRound },
        ].map(x => {
          const Icon = x.icon as any;
          return (
            <button key={x.k} onClick={() => setSubTab(x.k as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Icon size={15} /> {x.label}
            </button>
          );
        })}
      </div>
      {subTab === 'personnel' && <PersonnelPlanner tenant={tenant} tr={tr} inp={inp} />}
      {subTab === 'comptes'   && <Profils tenant={tenant} tr={tr} />}
    </div>
  );
}

function PersonnelPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; role: string; phone: string; email: string; is_active: boolean; niveauAcces: string; succursale: string };
  const empty = (): Row => ({ name: '', role: '', phone: '', email: '', is_active: true, niveauAcces: 'consultation', succursale: '' });
  const [rows, setRows] = useState<Row[]>([]);
  const [siteTree, setSiteTree] = useState<{ id: string; name: string; depts: { id: string; name: string }[] }[]>([]);
  const [postes, setPostes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: suc }, { data: pos }, { data }] = await Promise.all([
      supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name'),
      supabase.from('planner_postes').select('id, name').eq('tenant_id', tenant).order('name'),
      supabase.from('planner_personnel').select('id, name, role, phone, email, is_active, niveauAcces, succursale').eq('tenant_id', tenant).order('name'),
    ]);
    const allSites = (suc || []).filter((r: any) => !r.parent_id);
    const allDepts = (suc || []).filter((r: any) => r.parent_id);
    setSiteTree(allSites.map((s: any) => ({ id: s.id, name: s.name, depts: allDepts.filter((d: any) => d.parent_id === s.id) })));
    setPostes(pos || []);
    setRows((data || []).map((r: any) => ({ ...r, niveauAcces: r.niveauAcces || 'consultation', succursale: r.succursale || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload = { tenant_id: tenant, name: r.name, role: r.role || null, phone: r.phone || null, email: r.email || null, is_active: r.is_active !== false, niveauAcces: r.niveauAcces || 'consultation', succursale: r.succursale || null };
        if (r.id) await supabase.from('planner_personnel').update(payload).eq('id', r.id);
        else await supabase.from('planner_personnel').insert(payload);
      }
      setNotice(tr('Personnel enregistré ✓', 'Staff saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_personnel').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Personnel du planificateur', 'Planner staff')}</h2>
          <p className="text-xs text-gray-500">{tr('Employés assignables aux chantiers.', 'Employees assignable to job sites.')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {postes.length === 0 && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {tr("💡 Créez des postes dans l'onglet « Ressources → Postes » pour les sélectionner ici.", '💡 Create positions in the "Resources → Positions" tab to select them here.')}
        </div>
      )}
      {siteTree.length === 0 && (
        <div className="mx-4 mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          {tr("💡 Créez des sites/départements dans l'onglet « Sites/Dépts » pour assigner le personnel (optionnel).", '💡 Create sites/departments in the "Sites/Depts" tab to assign staff (optional).')}
        </div>
      )}
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Poste', 'Position')}</th>
            <th className="px-2">{tr('Site / Dépt', 'Site / Dept')}</th>
            <th className="px-2">{tr('Téléphone', 'Phone')}</th>
            <th className="px-2">{tr('Courriel', 'Email')}</th>
            <th className="px-2">{tr("Niveau d'accès", 'Access level')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Prénom Nom', 'First Last')} /></td>
                <td className="px-2">
                  {postes.length > 0 ? (
                    <select className={`${inp} min-w-[130px]`} value={r.role || ''} onChange={e => upd(i, 'role', e.target.value)}>
                      <option value="">— {tr('Poste', 'Position')} —</option>
                      {postes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input className={`${inp} min-w-[130px]`} value={r.role || ''} onChange={e => upd(i, 'role', e.target.value)} placeholder={tr('Technicien', 'Technician')} />
                  )}
                </td>
                <td className="px-2">
                  {siteTree.length > 0 ? (
                    <select className={`${inp} min-w-[160px]`} value={r.succursale || ''} onChange={e => upd(i, 'succursale', e.target.value)}>
                      <option value="">— {tr('Aucun', 'None')} —</option>
                      {siteTree.map(site => (
                        site.depts.length > 0 ? (
                          <optgroup key={site.id} label={site.name}>
                            <option value={site.name}>{site.name} ({tr('site entier', 'whole site')})</option>
                            {site.depts.map(d => <option key={d.id} value={`${site.name} / ${d.name}`}>{d.name}</option>)}
                          </optgroup>
                        ) : (
                          <option key={site.id} value={site.name}>{site.name}</option>
                        )
                      ))}
                    </select>
                  ) : (
                    <input className={`${inp} min-w-[140px]`} value={r.succursale || ''} onChange={e => upd(i, 'succursale', e.target.value)} placeholder={tr('Site libre', 'Free text')} />
                  )}
                </td>
                <td className="px-2"><input className={`${inp} w-32`} value={r.phone || ''} onChange={e => upd(i, 'phone', e.target.value)} placeholder="514-555-0000" /></td>
                <td className="px-2"><input type="email" className={inp} value={r.email || ''} onChange={e => upd(i, 'email', e.target.value)} placeholder="nom@exemple.com" /></td>
                <td className="px-2">
                  <select className={`${inp} w-36`} value={r.niveauAcces || 'consultation'} onChange={e => upd(i, 'niveauAcces', e.target.value)}>
                    <option value="consultation">{tr('Consultation', 'View only')}</option>
                    <option value="modification">{tr('Modification', 'Edit')}</option>
                    <option value="coordination">{tr('Coordination', 'Coordinate')}</option>
                    <option value="administration">{tr('Administration', 'Admin')}</option>
                  </select>
                </td>
                <td className="px-2 text-center"><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-gray-400">{tr('Aucun membre du personnel. Ajoute-en un.', 'No staff yet. Add one.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EquipementsPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; type: string; serial_number: string; is_active: boolean };
  const empty = (): Row => ({ name: '', type: '', serial_number: '', is_active: true });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('planner_equipements').select('id, name, type, serial_number, is_active').eq('tenant_id', tenant).order('name');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload = { tenant_id: tenant, name: r.name, type: r.type || null, serial_number: r.serial_number || null, is_active: r.is_active !== false };
        if (r.id) await supabase.from('planner_equipements').update(payload).eq('id', r.id);
        else await supabase.from('planner_equipements').insert(payload);
      }
      setNotice(tr('Équipements enregistrés ✓', 'Equipment saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_equipements').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Équipements du planificateur', 'Planner equipment')}</h2>
          <p className="text-xs text-gray-500">{tr('Instruments et outils assignables aux chantiers.', 'Instruments and tools assignable to job sites.')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Type', 'Type')}</th>
            <th className="px-2">{tr('N° série', 'Serial #')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Mégohmmètre', 'Megohmmeter')} /></td>
                <td className="px-2"><input className={inp} value={r.type || ''} onChange={e => upd(i, 'type', e.target.value)} placeholder={tr('Analyseur', 'Analyzer')} /></td>
                <td className="px-2"><input className={`${inp} w-32`} value={r.serial_number || ''} onChange={e => upd(i, 'serial_number', e.target.value)} placeholder="SN-001" /></td>
                <td className="px-2 text-center"><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-gray-400">{tr('Aucun équipement. Ajoute-en un.', 'No equipment yet. Add one.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostesPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; code: string; color: string };
  const empty = (): Row => ({ name: '', code: '', color: '#6b7280' });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('planner_postes').select('id, name, code, color').eq('tenant_id', tenant).order('name');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload = { tenant_id: tenant, name: r.name, code: r.code || null, color: r.color || '#6b7280' };
        if (r.id) await supabase.from('planner_postes').update(payload).eq('id', r.id);
        else await supabase.from('planner_postes').insert(payload);
      }
      setNotice(tr('Postes enregistrés ✓', 'Positions saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_postes').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Postes / Rôles', 'Positions / Roles')}</h2>
          <p className="text-xs text-gray-500">{tr('Types de postes disponibles dans le calendrier.', 'Position types available in the calendar.')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Code', 'Code')}</th>
            <th className="px-2">{tr('Couleur', 'Color')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Technicien senior', 'Senior technician')} /></td>
                <td className="px-2"><input className={`${inp} w-24`} value={r.code || ''} onChange={e => upd(i, 'code', e.target.value)} placeholder="TECH-SR" /></td>
                <td className="px-2">
                  <div className="flex items-center gap-2">
                    <input type="color" value={r.color || '#6b7280'} onChange={e => upd(i, 'color', e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-300 p-0.5 dark:border-gray-600" />
                    <span className="text-xs text-gray-500">{r.color || '#6b7280'}</span>
                  </div>
                </td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-2 py-6 text-center text-gray-400">{tr('Aucun poste. Ajoute-en un.', 'No position yet. Add one.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SitesDepts({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  // Two flat independent states — avoids nested-state update bugs
  type SiteRow = { _key: string; id?: string; name: string; code: string; address: string };
  type DeptRow = { id?: string; name: string; code: string; address: string; siteKey: string };

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [depts, setDepts] = useState<DeptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('planner_succursales').select('*').eq('tenant_id', tenant).order('name');
    if (error) { setNotice('Erreur chargement : ' + error.message); setSites([]); setDepts([]); setLoading(false); return; }
    if (!data) { setSites([]); setDepts([]); setLoading(false); return; }
    const siteData = (data as any[]).filter(r => !r.parent_id);
    const deptData = (data as any[]).filter(r => r.parent_id);
    setSites(siteData.map(s => ({ _key: s.id, id: s.id, name: s.name, code: s.code || '', address: s.address || '' })));
    setDepts(deptData.map(d => ({ id: d.id, name: d.name, code: d.code || '', address: d.address || '', siteKey: d.parent_id })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const addSite = () => { const k = Math.random().toString(36).slice(2); setSites(p => [...p, { _key: k, name: '', code: '', address: '' }]); };
  const addDept = (siteKey: string) => setDepts(p => [...p, { name: '', code: '', address: '', siteKey }]);
  const updSite = (siteKey: string, f: keyof SiteRow, v: string) => setSites(p => p.map(s => s._key === siteKey ? { ...s, [f]: v } : s));
  const updDept = (dIdx: number, f: keyof Omit<DeptRow, 'siteKey'>, v: string) => setDepts(p => p.map((d, i) => i === dIdx ? { ...d, [f]: v } : d));

  async function delSite(siteKey: string) {
    const site = sites.find(s => s._key === siteKey);
    if (site?.id) await supabase.from('planner_succursales').delete().eq('id', site.id);
    setSites(p => p.filter(s => s._key !== siteKey));
    setDepts(p => p.filter(d => d.siteKey !== siteKey));
  }
  async function delDept(dIdx: number) {
    const dept = depts[dIdx];
    if (dept?.id) await supabase.from('planner_succursales').delete().eq('id', dept.id);
    setDepts(p => p.filter((_, i) => i !== dIdx));
  }

  async function save() {
    setSaving(true); setNotice(null);
    if (!sites.some(s => s.name?.trim())) {
      setNotice(`⚠️ ${tr('Aucun site à sauvegarder. Clique + Site et tape un nom.', 'Nothing to save. Click + Site and type a name.')}`);
      setSaving(false); return;
    }
    let savedSites = 0, savedDepts = 0;
    try {
      for (const site of sites) {
        if (!site.name?.trim()) continue;
        const sPayload = { tenant_id: tenant, name: site.name, code: site.code || null, address: site.address || null };
        let siteId = site.id;
        if (site.id) {
          const { error: ue } = await supabase.from('planner_succursales').update(sPayload).eq('id', site.id);
          if (ue) throw new Error(ue.message);
        } else {
          const { data: ins, error: ie } = await supabase.from('planner_succursales').insert(sPayload).select('id').single();
          if (ie) throw new Error(ie.message);
          siteId = (ins as any)?.id;
        }
        savedSites++;
        for (let dIdx = 0; dIdx < depts.length; dIdx++) {
          const dept = depts[dIdx];
          if (dept.siteKey !== site._key || !dept.name?.trim()) continue;
          const dPayload = { tenant_id: tenant, name: dept.name, code: dept.code || null, address: dept.address || null, parent_id: siteId };
          if (dept.id) {
            const { error: de } = await supabase.from('planner_succursales').update(dPayload).eq('id', dept.id);
            if (de) throw new Error(de.message);
          } else {
            const { error: de } = await supabase.from('planner_succursales').insert(dPayload);
            if (de) throw new Error(de.message);
          }
          savedDepts++;
        }
      }
      setNotice(`${savedSites} site(s) + ${savedDepts} département(s) enregistrés ✓`); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tr('Sites et départements de votre organisation. Les sites contiennent des départements.', 'Sites and departments for your organization. Sites contain departments.')}
      </p>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-bold">{tr('Sites / Départements', 'Sites / Departments')}</h2>
            <p className="text-xs text-gray-500">{tr('Hiérarchie : Site → Département', 'Hierarchy: Site → Department')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addSite} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Site', 'Site')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
        {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sites.map(site => (
            <div key={site._key}>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 dark:bg-gray-700/40">
                <Building2 size={14} className="shrink-0 text-blue-500" />
                <input autoComplete="off" className={`${inp} flex-1`} value={site.name} onChange={e => updSite(site._key, 'name', e.target.value)} placeholder={tr('Ex: Bureau Sherbrooke', 'Ex: Sherbrooke Office')} />
                <input autoComplete="off" className={`${inp} w-20`} value={site.code} onChange={e => updSite(site._key, 'code', e.target.value)} placeholder="SHE" />
                <input autoComplete="off" className={`${inp} flex-1`} value={site.address} onChange={e => updSite(site._key, 'address', e.target.value)} placeholder={tr('Adresse (optionnel)', 'Address (optional)')} />
                <button onClick={() => addDept(site._key)} className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Plus size={11} />{tr('Dépt', 'Dept')}
                </button>
                <button onClick={() => delSite(site._key)} className="shrink-0 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              {depts.map((dept, dIdx) => dept.siteKey !== site._key ? null : (
                <div key={dept.id || `d-${dIdx}`} className="flex items-center gap-2 px-3 py-1.5 pl-9">
                  <MapPin size={12} className="shrink-0 text-gray-400" />
                  <input autoComplete="off" className={`${inp} flex-1`} value={dept.name} onChange={e => updDept(dIdx, 'name', e.target.value)} placeholder={tr('Ex: Secteur Nord', 'Ex: North Sector')} />
                  <input autoComplete="off" className={`${inp} w-20`} value={dept.code} onChange={e => updDept(dIdx, 'code', e.target.value)} placeholder="SEC-N" />
                  <input autoComplete="off" className={`${inp} flex-1`} value={dept.address} onChange={e => updDept(dIdx, 'address', e.target.value)} placeholder={tr('Adresse (optionnel)', 'Address (optional)')} />
                  <div className="w-[68px] shrink-0" />
                  <button onClick={() => delDept(dIdx)} className="shrink-0 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          ))}
          {sites.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              {tr('Aucun site. Clique « + Site » pour commencer.', 'No site yet. Click "+ Site" to start.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAIE & AVANTAGES — profils employés, avantages, primes horaires
// ============================================================

function PayeConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [subTab, setSubTab] = useState<'profils' | 'avantages' | 'primes'>('profils');
  return (
    <div className="space-y-4">
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { k: 'profils',   label: tr('Profils employés', 'Employee profiles'), icon: UserCog },
          { k: 'avantages', label: tr('Avantages',         'Allowances'),        icon: Gift },
          { k: 'primes',    label: tr('Primes horaires',   'Hour bonuses'),      icon: Timer },
        ].map(x => {
          const Icon = x.icon as any;
          return (
            <button key={x.k} onClick={() => setSubTab(x.k as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Icon size={15} /> {x.label}
            </button>
          );
        })}
      </div>
      {subTab === 'profils'   && <EmployeeProfiles tenant={tenant} tr={tr} />}
      {subTab === 'avantages' && <AllowancesConfig tenant={tenant} tr={tr} />}
      {subTab === 'primes'    && <HourBonusesConfig tenant={tenant} tr={tr} />}
    </div>
  );
}

function EmployeeProfiles({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type EP = { id?: string; employee_id: string; employee_name: string; employee_email: string; hourly_rate: string; ot_multiplier: string; dt_multiplier: string; ot_daily_hrs: string; dt_daily_hrs: string; ot_weekly_hrs: string; active: boolean };
  const [rows, setRows] = useState<EP[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  useEffect(() => {
    (async () => {
      const [usersRes, { data: profiles }] = await Promise.all([
        fetch(`/api/admin/users?tenant=${tenant}`).then(r => r.json()),
        supabase.from('employee_profiles').select('*').eq('tenant_id', tenant),
      ]);
      const us: { id: string; name: string; email: string }[] = (usersRes?.users || []).map((u: any) => ({ id: u.id, name: u.name || '', email: u.email || '' }));
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.employee_id] = p; });
      setRows(us.map(u => {
        const p = profileMap[u.id];
        if (p) return { id: p.id, employee_id: u.id, employee_name: p.employee_name || u.name, employee_email: p.employee_email || u.email, hourly_rate: String(p.hourly_rate || ''), ot_multiplier: String(p.ot_multiplier || '1.50'), dt_multiplier: String(p.dt_multiplier || '2.00'), ot_daily_hrs: String(p.ot_daily_hrs || '8'), dt_daily_hrs: p.dt_daily_hrs != null ? String(p.dt_daily_hrs) : '', ot_weekly_hrs: String(p.ot_weekly_hrs || '40'), active: p.active !== false };
        return { employee_id: u.id, employee_name: u.name, employee_email: u.email, hourly_rate: '', ot_multiplier: '1.50', dt_multiplier: '2.00', ot_daily_hrs: '8', dt_daily_hrs: '', ot_weekly_hrs: '40', active: true };
      }));
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const upd = (i: number, k: keyof EP, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.employee_id) continue;
        const payload = {
          tenant_id: tenant, employee_id: r.employee_id,
          employee_name: r.employee_name, employee_email: r.employee_email,
          hourly_rate: r.hourly_rate !== '' ? parseFloat(r.hourly_rate) : 0,
          ot_multiplier: parseFloat(r.ot_multiplier) || 1.5,
          dt_multiplier: parseFloat(r.dt_multiplier) || 2.0,
          ot_daily_hrs: r.ot_daily_hrs !== '' ? parseFloat(r.ot_daily_hrs) : 8,
          dt_daily_hrs: r.dt_daily_hrs !== '' ? parseFloat(r.dt_daily_hrs) : null,
          ot_weekly_hrs: r.ot_weekly_hrs !== '' ? parseFloat(r.ot_weekly_hrs) : 40,
          active: r.active, updated_at: new Date().toISOString(),
        };
        if (r.id) await supabase.from('employee_profiles').update(payload).eq('id', r.id);
        else { const { error } = await supabase.from('employee_profiles').insert(payload); if (error) throw error; }
      }
      setNotice(tr('Profils enregistrés ✓', 'Profiles saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Le taux horaire et les multiplicateurs servent au calcul automatique des feuilles de temps. OT = temps supplémentaire (×1,5), DT = double temps (×2).', 'Hourly rate and multipliers are used for automatic timesheet cost calculations. OT = overtime (×1.5), DT = double time (×2).')}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr('Profils de paie', 'Payroll profiles')}</h2>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
          </button>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('Employé', 'Employee')}</th>
              <th className="px-2">{tr('Taux horaire $', 'Hourly rate $')}</th>
              <th className="px-2">{tr('×OT', '×OT')}</th>
              <th className="px-2">{tr('×DT', '×DT')}</th>
              <th className="px-2">{tr('Seuil OT/jour h', 'OT/day h')}</th>
              <th className="px-2">{tr('Seuil DT/jour h', 'DT/day h')}</th>
              <th className="px-2">{tr('Seuil OT/sem h', 'OT/wk h')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.employee_id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1.5">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{r.employee_name || r.employee_email}</div>
                    <div className="text-xs text-gray-400">{r.employee_email}</div>
                  </td>
                  <td className="px-2">
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.hourly_rate} placeholder="25.00"
                        onChange={e => upd(i, 'hourly_rate', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'hourly_rate', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">/h</span>
                    </div>
                  </td>
                  <td className="px-2"><input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.ot_multiplier} placeholder="1.50" onChange={e => upd(i, 'ot_multiplier', e.target.value)} /></td>
                  <td className="px-2"><input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.dt_multiplier} placeholder="2.00" onChange={e => upd(i, 'dt_multiplier', e.target.value)} /></td>
                  <td className="px-2"><input type="number" min={0} step={0.5} className={`${inp} w-14`} value={r.ot_daily_hrs} placeholder="8" onChange={e => upd(i, 'ot_daily_hrs', e.target.value)} /></td>
                  <td className="px-2"><input type="number" min={0} step={0.5} className={`${inp} w-14`} value={r.dt_daily_hrs} placeholder={tr('—', '—')} onChange={e => upd(i, 'dt_daily_hrs', e.target.value)} /></td>
                  <td className="px-2"><input type="number" min={0} step={1} className={`${inp} w-14`} value={r.ot_weekly_hrs} placeholder="40" onChange={e => upd(i, 'ot_weekly_hrs', e.target.value)} /></td>
                  <td className="px-2"><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucun utilisateur trouvé.', 'No user found.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AllowancesConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type Row = { id?: string; name: string; amount: string; is_taxable: boolean; active: boolean; sort_order: number };
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheet_allowances').select('*').eq('tenant_id', tenant).order('sort_order').order('name');
    setRows((data || []).map((r: any) => ({ ...r, amount: String(r.amount || '') })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', amount: '', is_taxable: false, active: true, sort_order: p.length }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload = { tenant_id: tenant, name: r.name.trim(), amount: parseFloat(r.amount) || 0, is_taxable: r.is_taxable, active: r.active, sort_order: r.sort_order };
        if (r.id) await supabase.from('timesheet_allowances').update(payload).eq('id', r.id);
        else await supabase.from('timesheet_allowances').insert(payload);
      }
      setNotice(tr('Avantages enregistrés ✓', 'Allowances saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('timesheet_allowances').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        {tr("Créez des avantages payés à l'employé (ex: Dîner 35$, Coucher 100$). Ils apparaissent comme cases à cocher sur chaque ligne de feuille de temps.", "Create employee allowances (e.g., Lunch $35, Overnight $100). They appear as checkboxes on each timesheet line.")}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr('Avantages & Allocations', 'Allowances & Benefits')}</h2>
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr("Nom (affiché à l'employé)", 'Name (shown to employee)')}</th>
              <th className="px-2">{tr('Montant $', 'Amount $')}</th>
              <th className="px-2">{tr('Imposable', 'Taxable')}</th>
              <th className="px-2">{tr('Ordre', 'Order')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1"><input className={`${inp} w-40`} value={r.name} placeholder={tr('Ex: Dîner', 'Ex: Lunch')} onChange={e => upd(i, 'name', e.target.value)} /></td>
                  <td className="px-2">
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.amount} placeholder="35.00"
                        onChange={e => upd(i, 'amount', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'amount', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">$</span>
                    </div>
                  </td>
                  <td className="px-2 text-center"><input type="checkbox" checked={r.is_taxable} onChange={e => upd(i, 'is_taxable', e.target.checked)} /></td>
                  <td className="px-2"><input type="number" min={0} className={`${inp} w-14`} value={r.sort_order} onChange={e => upd(i, 'sort_order', Number(e.target.value))} /></td>
                  <td className="px-2 text-center"><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                  <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucun avantage configuré.', 'No allowance configured.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HourBonusesConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type Row = { id?: string; name: string; trigger_hours: string; bonus_amount: string; is_taxable: boolean; active: boolean; sort_order: number };
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheet_hour_bonuses').select('*').eq('tenant_id', tenant).order('sort_order').order('trigger_hours');
    setRows((data || []).map((r: any) => ({ ...r, trigger_hours: String(r.trigger_hours || ''), bonus_amount: String(r.bonus_amount || '') })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', trigger_hours: '', bonus_amount: '', is_taxable: true, active: true, sort_order: p.length }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim() || !r.trigger_hours) continue;
        const payload = { tenant_id: tenant, name: r.name.trim(), trigger_hours: parseFloat(r.trigger_hours) || 0, bonus_amount: parseFloat(r.bonus_amount) || 0, is_taxable: r.is_taxable, active: r.active, sort_order: r.sort_order };
        if (r.id) await supabase.from('timesheet_hour_bonuses').update(payload).eq('id', r.id);
        else await supabase.from('timesheet_hour_bonuses').insert(payload);
      }
      setNotice(tr('Primes enregistrées ✓', 'Bonuses saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('timesheet_hour_bonuses').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        {tr("Primes déclenchées quand les heures totales d'une journée atteignent le seuil. Ex: « Prime 5h = 25$ » → versé si ≥ 5h dans la journée.", "Bonuses triggered when daily total hours reach the threshold. E.g., \"5h bonus = $25\" → paid if ≥ 5h in the day.")}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr("Primes par plage d'heures", 'Hour-based bonuses')}</h2>
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('Nom prime', 'Bonus name')}</th>
              <th className="px-2">{tr('Seuil h/jour', 'Daily h threshold')}</th>
              <th className="px-2">{tr('Montant $', 'Amount $')}</th>
              <th className="px-2">{tr('Imposable', 'Taxable')}</th>
              <th className="px-2">{tr('Ordre', 'Order')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1"><input className={`${inp} w-36`} value={r.name} placeholder={tr('Ex: Prime 5h', 'Ex: 5h bonus')} onChange={e => upd(i, 'name', e.target.value)} /></td>
                  <td className="px-2">
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.trigger_hours} placeholder="5" onChange={e => upd(i, 'trigger_hours', e.target.value)} />
                      <span className="text-xs text-gray-400">h</span>
                    </div>
                  </td>
                  <td className="px-2">
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.bonus_amount} placeholder="25.00"
                        onChange={e => upd(i, 'bonus_amount', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'bonus_amount', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">$</span>
                    </div>
                  </td>
                  <td className="px-2 text-center"><input type="checkbox" checked={r.is_taxable} onChange={e => upd(i, 'is_taxable', e.target.checked)} /></td>
                  <td className="px-2"><input type="number" min={0} className={`${inp} w-14`} value={r.sort_order} onChange={e => upd(i, 'sort_order', Number(e.target.value))} /></td>
                  <td className="px-2 text-center"><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                  <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucune prime configurée.', 'No bonus configured.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
