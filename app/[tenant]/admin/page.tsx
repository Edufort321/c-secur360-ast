'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, CreditCard, Users, Save, Loader2, Plus, Check, MapPin, Trash2 } from 'lucide-react';
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
  const [tab, setTab] = useState<'sites' | 'profils' | 'abonnement' | 'facturation'>('sites');

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <h1 className="mb-4 text-2xl font-bold">{tr('Administration', 'Administration')}</h1>
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {[
            { k: 'sites', label: tr('Sites', 'Sites'), icon: MapPin },
            { k: 'profils', label: tr('Employés', 'Employees'), icon: Users },
            { k: 'abonnement', label: tr('Abonnement', 'Subscription'), icon: CreditCard },
            { k: 'facturation', label: tr('Facturation', 'Billing'), icon: Settings },
          ].map(x => {
            const Icon = x.icon as any;
            return (
              <button key={x.k} onClick={() => setTab(x.k as any)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                <Icon size={16} /> {x.label}
              </button>
            );
          })}
        </div>

        {tab === 'sites' && <Sites tenant={tenant} tr={tr} />}
        {tab === 'abonnement' && <Abonnement tenant={tenant} tr={tr} lang={lang} />}
        {tab === 'profils' && <Profils tenant={tenant} tr={tr} />}
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
