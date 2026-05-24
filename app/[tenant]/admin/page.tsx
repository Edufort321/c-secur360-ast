'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, CreditCard, Users, Save, Loader2, Plus, Check, MapPin, Trash2, Car, Building2, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

type Mod = { key: string; name_fr: string; name_en: string; monthly_price: number; sort_order: number; enabled: boolean };
const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export default function AdminPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const [tab, setTab] = useState<'sites' | 'clients' | 'vehicules' | 'profils' | 'ressources' | 'abonnement' | 'facturation'>('sites');

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <h1 className="mb-4 text-2xl font-bold">{tr('Administration', 'Administration')}</h1>
        {(() => {
          const tabs = [
            { k: 'sites',       label: tr('Sites', 'Sites'),              icon: MapPin },
            { k: 'clients',     label: tr('Clients', 'Clients'),          icon: Building2 },
            { k: 'vehicules',   label: tr('Véhicules', 'Vehicles'),       icon: Car },
            { k: 'profils',     label: tr('Employés', 'Employees'),       icon: Users },
            { k: 'ressources',  label: tr('Ressources', 'Resources'),     icon: Wrench },
            { k: 'abonnement',  label: tr('Abonnement', 'Subscription'),  icon: CreditCard },
            { k: 'facturation', label: tr('Facturation', 'Billing'),      icon: Settings },
          ];
          return (
            <>
              {/* Mobile : sélecteur */}
              <div className="mb-4 sm:hidden">
                <select value={tab} onChange={e => setTab(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {tabs.map(x => <option key={x.k} value={x.k}>{x.label}</option>)}
                </select>
              </div>
              {/* Desktop : onglets */}
              <div className="mb-4 hidden gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800 sm:flex">
                {tabs.map(x => {
                  const Icon = x.icon as any;
                  return (
                    <button key={x.k} onClick={() => setTab(x.k as any)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                      <Icon size={16} /> {x.label}
                    </button>
                  );
                })}
              </div>
            </>
          );
        })()}

        {tab === 'sites' && <Sites tenant={tenant} tr={tr} />}
        {tab === 'clients' && <Clients tenant={tenant} tr={tr} />}
        {tab === 'vehicules' && <Vehicules tenant={tenant} tr={tr} />}
        {tab === 'abonnement' && <Abonnement tenant={tenant} tr={tr} lang={lang} />}
        {tab === 'profils' && <Profils tenant={tenant} tr={tr} />}
        {tab === 'ressources' && <Ressources tenant={tenant} tr={tr} />}
        {tab === 'facturation' && <FacturationProjets tenant={tenant} tr={tr} />}
      </div>
    </div>
  );
}

function FacturationProjets({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('id, project_number, title, client_name, status, po_amount, estimate, actuals').eq('tenant_id', tenant).order('created_at', { ascending: false });
      setRows(data || []); setLoading(false);
    })();
  }, [tenant]);

  const sum = (st: string) => rows.filter(r => r.status === st).reduce((s, r) => s + Number(r.po_amount || 0), 0);
  const totalFacture = sum('facture');
  const totalEnCours = sum('en-cours');
  const totalSoumission = sum('soumission');
  const reelOf = (r: any) => Number(r.actuals?.total || 0);
  const margeTotale = rows.filter(r => r.status === 'facture').reduce((s, r) => s + (Number(r.po_amount || 0) - reelOf(r)), 0);

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone || ''}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{tr('Comptabilité de la facturation des projets (données réelles). La facturation est émise par Commerce CERDIA.', 'Project billing accounting (real data). Invoicing is issued by Commerce CERDIA.')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={tr('Facturé', 'Invoiced')} value={money(totalFacture)} tone="text-emerald-600" />
        <Stat label={tr('En cours', 'In progress')} value={money(totalEnCours)} tone="text-blue-600" />
        <Stat label={tr('Soumissions', 'Quotes')} value={money(totalSoumission)} tone="text-amber-600" />
        <Stat label={tr('Marge (facturé − réel)', 'Margin (invoiced − actual)')} value={money(margeTotale)} tone={margeTotale >= 0 ? 'text-emerald-600' : 'text-red-600'} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 px-4 py-3 font-bold dark:border-gray-700">{tr('Projets', 'Projects')}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-3 py-2">{tr('Projet', 'Project')}</th><th className="px-3">{tr('Client', 'Client')}</th><th className="px-3">{tr('Statut', 'Status')}</th><th className="px-3 text-right">{tr('Estimé', 'Estimated')}</th><th className="px-3 text-right">{tr('Réel', 'Actual')}</th><th className="px-3 text-right">{tr('Facturé', 'Invoiced')}</th><th className="px-3 text-right">{tr('Marge', 'Margin')}</th></tr></thead>
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
              {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">{tr('Aucun projet.', 'No project.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
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

function Vehicules({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type VRow = {
    id?: string; type: 'company' | 'personal'; name: string;
    make: string; model: string; year: string; plate: string;
    employee_name: string; km_rate_override: string; active: boolean; notes: string;
  };
  const [rows, setRows] = useState<VRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('vehicles').select('*').eq('tenant_id', tenant).order('type').order('name');
    setRows((data || []).map((v: any) => ({ ...v, year: String(v.year || ''), km_rate_override: v.km_rate_override != null ? String(v.km_rate_override) : '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof VRow, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  const addCompany  = () => setRows(p => [...p, { type: 'company',  name: '', make: '', model: '', year: '', plate: '', employee_name: '', km_rate_override: '', active: true, notes: '' }]);
  const addPersonal = () => setRows(p => [...p, { type: 'personal', name: '', make: '', model: '', year: '', plate: '', employee_name: '', km_rate_override: '', active: true, notes: '' }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.make?.trim() && !r.name?.trim()) continue;
        const payload: any = {
          tenant_id: tenant, type: r.type,
          name: r.name || `${r.make} ${r.model} ${r.year}`.trim(),
          make: r.make, model: r.model,
          year: r.year ? Number(r.year) : null,
          plate: r.plate, employee_name: r.employee_name,
          km_rate_override: r.km_rate_override !== '' ? Number(r.km_rate_override) : null,
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

  const VehicleTable = ({ label, badge, items, onAdd }: { label: string; badge: string; items: { r: VRow; i: number }[]; onAdd: () => void }) => (
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
            <th className="px-2 py-1.5">{tr('Marque', 'Make')}</th>
            <th className="px-2">{tr('Modèle', 'Model')}</th>
            <th className="px-2">{tr('Année', 'Year')}</th>
            <th className="px-2">{tr('Plaque', 'Plate')}</th>
            <th className="px-2">{tr('Employé / Propriétaire', 'Employee / Owner')}</th>
            <th className="px-2">{tr('Taux km $', 'Km rate $')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {items.map(({ r, i }) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.make} onChange={e => upd(i, 'make', e.target.value)} placeholder="Toyota" /></td>
                <td className="px-2"><input className={inp} value={r.model} onChange={e => upd(i, 'model', e.target.value)} placeholder="Corolla" /></td>
                <td className="px-2"><input className={`${inp} w-16`} value={r.year} onChange={e => upd(i, 'year', e.target.value)} placeholder="2022" /></td>
                <td className="px-2"><input className={`${inp} w-24`} value={r.plate} onChange={e => upd(i, 'plate', e.target.value)} placeholder="ABC-123" /></td>
                <td className="px-2"><input className={inp} value={r.employee_name} onChange={e => upd(i, 'employee_name', e.target.value)} placeholder={r.type === 'personal' ? tr('Nom employé', 'Employee name') : tr('Assigné à', 'Assigned to')} /></td>
                <td className="px-2">
                  <div className="flex items-center gap-1">
                    <input type="number" step="0.01" className={`${inp} w-20`} value={r.km_rate_override} onChange={e => upd(i, 'km_rate_override', e.target.value)} placeholder={tr('Global', 'Global')} />
                    <span className="text-xs text-gray-400">/km</span>
                  </div>
                </td>
                <td className="px-2"><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="px-2 py-5 text-center text-gray-400 text-sm">{tr('Aucun véhicule.', 'No vehicle.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

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
        items={companyRows}
        onAdd={addCompany}
      />
      <VehicleTable
        label={tr('Véhicules personnels autorisés', 'Authorized personal vehicles')}
        badge={tr(`${personalRows.length} véhicule(s)`, `${personalRows.length} vehicle(s)`)}
        items={personalRows}
        onAdd={addPersonal}
      />
    </div>
  );
}

function Profils({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', name: '', role: 'user', password: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="border-b border-gray-100 px-4 py-3 font-bold dark:border-gray-700">{tr('Profils du tenant', 'Tenant profiles')}</div>
        {loading ? <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-blue-600">{(u.email || '?')[0].toUpperCase()}</div>
                <div className="flex-1"><div className="font-medium">{u.name || u.email}</div><div className="text-xs text-gray-500">{u.email}</div></div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{u.role}</span>
              </div>
            ))}
            {users.length === 0 && <div className="px-4 py-6 text-sm text-gray-400">{tr('Aucun profil.', 'No profile.')}</div>}
          </div>
        )}
      </div>
      <form onSubmit={create} className="h-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="font-bold">{tr('Nouveau profil', 'New profile')}</h2>
        <input required type="email" placeholder={tr('Courriel', 'Email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="inp2" />
        <input placeholder={tr('Nom', 'Name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="inp2" />
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="inp2">
          <option value="user">{tr('Utilisateur', 'User')}</option>
          <option value="client_admin">{tr('Admin client', 'Client admin')}</option>
          <option value="super_admin">{tr('Super admin', 'Super admin')}</option>
        </select>
        <input required type="text" placeholder={tr('Mot de passe initial', 'Initial password')} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="inp2" />
        <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {tr('Créer', 'Create')}</button>
        {notice && <p className="text-sm text-gray-600 dark:text-gray-300">{notice}</p>}
      </form>
      <style jsx>{`
        .inp2 { width: 100%; border-radius: 0.6rem; border: 1px solid rgb(209 213 219); background: transparent; padding: 0.5rem 0.7rem; font-size: 0.875rem; outline: none; }
        .inp2:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
        :global(.dark) .inp2 { border-color: rgb(75 85 99); }
      `}</style>
    </div>
  );
}

// ============================================================
// RESSOURCES PLANNER
// ============================================================

function Ressources({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [subTab, setSubTab] = useState<'personnel' | 'equipements' | 'postes' | 'succursales'>('personnel');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tr('Personnel et équipements utilisés par le planificateur. Ces données sont synchronisées en temps réel.', 'Staff and equipment used by the planner. This data is synced in real time.')}
      </p>
      <div className="flex gap-1 overflow-x-auto">
        {[
          { k: 'personnel',   label: tr('Personnel', 'Staff') },
          { k: 'equipements', label: tr('Équipements', 'Equipment') },
          { k: 'postes',      label: tr('Postes', 'Positions') },
          { k: 'succursales', label: tr('Succursales', 'Branches') },
        ].map(x => (
          <button key={x.k} onClick={() => setSubTab(x.k as any)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
            {x.label}
          </button>
        ))}
      </div>
      {subTab === 'personnel'   && <PersonnelPlanner   tenant={tenant} tr={tr} inp={inp} />}
      {subTab === 'equipements' && <EquipementsPlanner tenant={tenant} tr={tr} inp={inp} />}
      {subTab === 'postes'      && <PostesPlanner      tenant={tenant} tr={tr} inp={inp} />}
      {subTab === 'succursales' && <SuccursalesPlanner tenant={tenant} tr={tr} inp={inp} />}
    </div>
  );
}

function PersonnelPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; role: string; phone: string; email: string; is_active: boolean };
  const empty = (): Row => ({ name: '', role: '', phone: '', email: '', is_active: true });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('planner_personnel').select('id, name, role, phone, email, is_active').eq('tenant_id', tenant).order('name');
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
        const payload = { tenant_id: tenant, name: r.name, role: r.role || null, phone: r.phone || null, email: r.email || null, is_active: r.is_active !== false };
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
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Rôle / Poste', 'Role / Position')}</th>
            <th className="px-2">{tr('Téléphone', 'Phone')}</th>
            <th className="px-2">{tr('Courriel', 'Email')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Prénom Nom', 'First Last')} /></td>
                <td className="px-2"><input className={inp} value={r.role || ''} onChange={e => upd(i, 'role', e.target.value)} placeholder={tr('Technicien', 'Technician')} /></td>
                <td className="px-2"><input className={`${inp} w-32`} value={r.phone || ''} onChange={e => upd(i, 'phone', e.target.value)} placeholder="514-555-0000" /></td>
                <td className="px-2"><input type="email" className={inp} value={r.email || ''} onChange={e => upd(i, 'email', e.target.value)} placeholder="nom@exemple.com" /></td>
                <td className="px-2 text-center"><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-gray-400">{tr('Aucun membre du personnel. Ajoute-en un.', 'No staff yet. Add one.')}</td></tr>}
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

function SuccursalesPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; code: string; address: string };
  const empty = (): Row => ({ name: '', code: '', address: '' });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('planner_succursales').select('id, name, code, address').eq('tenant_id', tenant).order('name');
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
        const payload = { tenant_id: tenant, name: r.name, code: r.code || null, address: r.address || null };
        if (r.id) await supabase.from('planner_succursales').update(payload).eq('id', r.id);
        else await supabase.from('planner_succursales').insert(payload);
      }
      setNotice(tr('Succursales enregistrées ✓', 'Branches saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_succursales').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Succursales / Bureaux', 'Branches / Offices')}</h2>
          <p className="text-xs text-gray-500">{tr('Bureaux régionaux utilisés pour regrouper le personnel.', 'Regional offices used to group staff.')}</p>
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
            <th className="px-2">{tr('Adresse', 'Address')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1"><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Bureau Sherbrooke', 'Sherbrooke Office')} /></td>
                <td className="px-2"><input className={`${inp} w-24`} value={r.code || ''} onChange={e => upd(i, 'code', e.target.value)} placeholder="SHE" /></td>
                <td className="px-2"><input className={inp} value={r.address || ''} onChange={e => upd(i, 'address', e.target.value)} placeholder="123 rue Principale" /></td>
                <td className="px-2"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-2 py-6 text-center text-gray-400">{tr('Aucune succursale. Ajoute-en une.', 'No branch yet. Add one.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
