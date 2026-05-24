'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Check, CalendarClock, AlertTriangle, CheckCircle2, Ban, BadgeCheck, Trash2, CreditCard, Plus, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { computeSubState } from '@/lib/subscription';

type Mod = { key: string; name_fr: string; monthly_price: number; sort_order: number; enabled: boolean };
type Tx  = { id: string; type: string; amount: number; status: string; description: string | null; reference: string | null; period_start: string | null; period_end: string | null; created_by: string | null; created_at: string };
const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });

const TX_TYPE: Record<string, { label: string; cls: string }> = {
  payment:    { label: 'Paiement',      cls: 'bg-emerald-100 text-emerald-700' },
  refund:     { label: 'Remboursement', cls: 'bg-amber-100 text-amber-700' },
  credit:     { label: 'Crédit',        cls: 'bg-blue-100 text-blue-700' },
  adjustment: { label: 'Ajustement',    cls: 'bg-purple-100 text-purple-700' },
};
const TX_STATUS: Record<string, string> = {
  completed:  'text-emerald-600',
  pending:    'text-amber-600',
  failed:     'text-red-600',
  cancelled:  'text-gray-400',
};

export default function TenantManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [mods, setMods] = useState<Mod[]>([]);
  const [cfg, setCfg] = useState({ discount_per_module: 5, discount_cap: 30 });
  const [sub, setSub] = useState<any>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [txForm, setTxForm] = useState({ open: false, type: 'payment', amount: '', description: '', reference: '', period_start: '', period_end: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedJson, setSavedJson] = useState('');
  const profileKey = (t: any) => JSON.stringify({
    c: t?.companyName ?? '', s: t?.subdomain ?? '', d: t?.domain ?? '', b: t?.billing_email ?? '',
    p: t?.plan ?? '', a: t?.isActive !== false, ar: t?.archived === true,
    ep: t?.erp_provider ?? '', eu: t?.erp_base_url ?? '', ec: t?.erp_company_id ?? '',
    l: t?.logo_url ?? '',
  });

  async function load() {
    setLoading(true);
    try {
      const { data: t } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle();
      setTenant(t); setSavedJson(profileKey(t));
      const { data: catalog } = await supabase.from('modules').select('key, name_fr, monthly_price, sort_order').order('sort_order');
      const { data: tm } = await supabase.from('tenant_modules').select('module_key, enabled').eq('tenant_id', id);
      const enabledSet = new Set((tm || []).filter((x: any) => x.enabled).map((x: any) => x.module_key));
      setMods((catalog || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price), enabled: enabledSet.has(m.key) })));
      const { data: bc } = await supabase.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle();
      if (bc) setCfg({ discount_per_module: Number(bc.discount_per_module), discount_cap: Number(bc.discount_cap) });
      const { data: s } = await supabase.from('tenant_subscriptions').select('*').eq('tenant_id', id).maybeSingle();
      setSub(s);
      const { data: t } = await supabase.from('tenant_transactions').select('*').eq('tenant_id', id).order('created_at', { ascending: false });
      setTxs(t || []);
    } catch { /* dégradé */ } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const selected = mods.filter(m => m.enabled);
  const subtotal = useMemo(() => selected.reduce((s, m) => s + (m.monthly_price || 0), 0), [mods]);
  const discountPct = Math.min(Math.max(selected.length - 1, 0) * cfg.discount_per_module, cfg.discount_cap);
  const total = subtotal * (1 - discountPct / 100);
  const subState = useMemo(() => computeSubState(sub), [sub]);
  const dirty = !!tenant && profileKey(tenant) !== savedJson;

  async function saveModules() {
    setSaving(true); setNotice(null);
    try {
      for (const m of mods) {
        await supabase.from('tenant_modules').upsert({ tenant_id: id, module_key: m.key, enabled: m.enabled, source: 'manual' }, { onConflict: 'tenant_id,module_key' });
      }
      // mémorise le montant sur l'abonnement
      await supabase.from('tenant_subscriptions').upsert({ tenant_id: id, amount: total }, { onConflict: 'tenant_id' });
      setNotice('Modules enregistrés ✓'); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB') + ' — exécute les migrations 011/012/014.'); } finally { setSaving(false); }
  }

  async function markPaid() {
    const now = new Date();
    const next = new Date(); next.setFullYear(next.getFullYear() + 1);
    await supabase.from('tenant_subscriptions').upsert({
      tenant_id: id, status: 'active', last_payment_at: now.toISOString(),
      next_billing_date: next.toISOString().slice(0, 10),
    }, { onConflict: 'tenant_id' });
    // Logger la transaction
    await supabase.from('tenant_transactions').insert({
      tenant_id: id, type: 'payment', amount: total, status: 'completed',
      description: 'Paiement annuel', period_start: now.toISOString().slice(0, 10),
      period_end: next.toISOString().slice(0, 10),
    });
    setNotice('Paiement enregistré ✓ (prochaine facturation +1 an)'); load();
  }

  async function addTransaction() {
    const amt = parseFloat(txForm.amount);
    if (!amt || isNaN(amt)) { setNotice('Montant invalide.'); return; }
    setSaving(true);
    const { error } = await supabase.from('tenant_transactions').insert({
      tenant_id: id, type: txForm.type, amount: amt, status: 'completed',
      description: txForm.description || null, reference: txForm.reference || null,
      period_start: txForm.period_start || null, period_end: txForm.period_end || null,
    });
    if (error) { setNotice('Erreur : ' + error.message + ' — migration 031 exécutée ?'); }
    else { setNotice('Transaction ajoutée ✓'); setTxForm(f => ({ ...f, open: false, amount: '', description: '', reference: '', period_start: '', period_end: '' })); load(); }
    setSaving(false);
  }

  async function deleteTx(txId: string) {
    if (!confirm('Supprimer cette transaction ?')) return;
    await supabase.from('tenant_transactions').delete().eq('id', txId);
    load();
  }

  async function toggleBillable(v: boolean) {
    setSub((s: any) => ({ ...(s || {}), billable: v }));
    const { error } = await supabase.from('tenant_subscriptions').upsert({ tenant_id: id, billable: v }, { onConflict: 'tenant_id' });
    if (error) { setNotice('Erreur : ' + error.message + ' — exécute la migration 014 (colonne billable).'); setSub((s: any) => ({ ...(s || {}), billable: !v })); }
    else setNotice(v ? 'Facturable activé ✓' : 'Exclu du revenu ✓ (rafraîchis le tableau de bord)');
  }

  async function saveProfile() {
    setSaving(true); setNotice(null);
    try {
      const { error } = await supabase.from('tenants').update({
        companyName: tenant.companyName,
        subdomain: (tenant.subdomain || '').toLowerCase(),
        domain: tenant.domain || null,
        plan: tenant.plan || 'basic',
        isActive: tenant.isActive !== false,
        archived: tenant.archived === true,
        billing_email: tenant.billing_email || null,
        erp_provider: tenant.erp_provider || null,
        erp_base_url: tenant.erp_base_url || null,
        erp_company_id: tenant.erp_company_id || null,
        logo_url: tenant.logo_url || null,
      }).eq('id', id);
      if (error) throw error;
      setNotice('Profil enregistré ✓');
    } catch { setNotice('Erreur DB (migration 013 exécutée ?)'); } finally { setSaving(false); }
  }

  async function deleteTenant() {
    if (!confirm(`Supprimer définitivement « ${tenant?.companyName || id} » ? Action irréversible.`)) return;
    try {
      const r = await fetch(`/api/admin/tenants?id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      router.push('/admin/dashboard');
    } catch (e: any) { setNotice('Suppression : ' + (e.message || 'erreur')); }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const badge = {
    active: { label: 'Actif', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    reminder: { label: 'Rappel (refacturation proche)', cls: 'bg-blue-100 text-blue-700', icon: CalendarClock },
    grace: { label: 'En grâce (échéance dépassée)', cls: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    blocked: { label: 'Bloqué (impayé)', cls: 'bg-red-100 text-red-700', icon: Ban },
    none: { label: 'Aucun abonnement', cls: 'bg-gray-100 text-gray-600', icon: CalendarClock },
  }[subState.status];
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader subtitle="Gestion d'un client" />
      <div className="w-full px-4 py-6 lg:px-6">
        <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
          <ArrowLeft size={16} /> Retour aux clients
        </Link>

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>
        ) : !tenant ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">Client introuvable.</div>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{tenant.companyName || tenant.id}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">/{tenant.subdomain || tenant.id}</p>
            </div>
            {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}

            {/* Profil éditable */}
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Profil du client</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${dirty ? 'text-amber-600' : 'text-emerald-600'}`}>{dirty ? '● Modifié' : '✓ À jour'}</span>
                  {id !== 'cerdia' && (
                    <button onClick={deleteTenant} className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-500/10"><Trash2 size={15} /> Supprimer</button>
                  )}
                  <button onClick={saveProfile} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Nom</span><input className={inputCls} value={tenant.companyName || ''} onChange={e => setTenant((t: any) => ({ ...t, companyName: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Sous-domaine</span><input className={inputCls} value={tenant.subdomain || ''} onChange={e => setTenant((t: any) => ({ ...t, subdomain: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Domaine</span><input className={inputCls} placeholder="cerdia.ai" value={tenant.domain || ''} onChange={e => setTenant((t: any) => ({ ...t, domain: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Courriel facturation</span><input className={inputCls} value={tenant.billing_email || ''} onChange={e => setTenant((t: any) => ({ ...t, billing_email: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Plan</span><input className={inputCls} value={tenant.plan || ''} onChange={e => setTenant((t: any) => ({ ...t, plan: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Statut</span>
                  <select className={inputCls} value={tenant.archived ? 'arch' : (tenant.isActive === false ? '0' : '1')} onChange={e => { const v = e.target.value; setTenant((t: any) => ({ ...t, isActive: v === '1', archived: v === 'arch' })); }}>
                    <option value="1">Actif</option><option value="0">Suspendu</option><option value="arch">Archivé</option>
                  </select>
                </label>
                <div className="mt-1 border-t border-gray-100 pt-2 text-xs font-bold uppercase tracking-wide text-gray-400 sm:col-span-2 lg:col-span-3 dark:border-gray-700">Connexion ERP</div>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Fournisseur ERP</span>
                  <select className={inputCls} value={tenant.erp_provider || ''} onChange={e => setTenant((t: any) => ({ ...t, erp_provider: e.target.value }))}>
                    <option value="">Aucun</option><option value="sap">SAP</option><option value="odoo">Odoo</option><option value="quickbooks">QuickBooks</option><option value="dynamics">MS Dynamics</option><option value="sage">Sage</option><option value="acomba">Acomba</option><option value="custom">Autre / API</option>
                  </select>
                </label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">URL de base ERP</span><input className={inputCls} placeholder="https://erp.exemple.com/api" value={tenant.erp_base_url || ''} onChange={e => setTenant((t: any) => ({ ...t, erp_base_url: e.target.value }))} /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">ID société / base</span><input className={inputCls} value={tenant.erp_company_id || ''} onChange={e => setTenant((t: any) => ({ ...t, erp_company_id: e.target.value }))} /></label>
                <p className="text-xs text-gray-400 sm:col-span-2 lg:col-span-3">🔒 Clé/API ERP : stockage sécurisé côté serveur (à brancher) — non saisie ici.</p>
                <div className="mt-1 border-t border-gray-100 pt-2 text-xs font-bold uppercase tracking-wide text-gray-400 sm:col-span-2 lg:col-span-3 dark:border-gray-700">Logo du client</div>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">URL du logo (remplace le logo C-Secur360 dans l'en-tête)</span>
                  <input className={inputCls} placeholder="https://exemple.com/logo.png" value={tenant.logo_url || ''} onChange={e => setTenant((t: any) => ({ ...t, logo_url: e.target.value }))} />
                </label>
                {tenant.logo_url && (
                  <div className="flex items-center gap-3">
                    <img src={tenant.logo_url} alt="Aperçu logo" className="h-10 w-auto rounded border border-gray-200 bg-white p-1 dark:border-gray-600" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span className="text-xs text-gray-400">Aperçu</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 sm:col-span-2 lg:col-span-3">Migration requise : <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;</code></p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Modules */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                  <h2 className="font-bold">Modules de ce client</h2>
                  <button onClick={saveModules} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer</button>
                </div>
                {mods.length === 0 ? (
                  <div className="p-6 text-sm text-amber-700">Catalogue vide — exécute la migration 011.</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mods.map((m, i) => (
                      <div key={m.key} className="flex items-center gap-3 px-4 py-2.5">
                        <button onClick={() => setMods(p => p.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                          className={`grid h-6 w-6 place-items-center rounded border ${m.enabled ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {m.enabled && <Check size={14} />}
                        </button>
                        <span className="flex-1 font-medium">{m.name_fr}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{money(m.monthly_price)}/an</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Facture + Abonnement */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-3 font-bold">Facture annuelle</h2>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Sous-total</span><span>{money(subtotal)}</span></div>
                    <div className="flex justify-between text-emerald-600"><span>Escompte ({discountPct}%)</span><span>− {money(subtotal * discountPct / 100)}</span></div>
                    <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">{cfg.discount_per_module}% par module additionnel (max {cfg.discount_cap}%).</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-3 font-bold">Abonnement</h2>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}><BadgeIcon size={14} /> {badge.label}</span>
                  <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between"><span>Prochaine facturation</span><span>{subState.nextBilling || '—'}</span></div>
                    {subState.daysUntilBilling !== null && <div className="flex justify-between"><span>Jours restants</span><span>{subState.daysUntilBilling}</span></div>}
                    {subState.graceEndsAt && <div className="flex justify-between"><span>Fin de grâce</span><span>{subState.graceEndsAt}</span></div>}
                    <div className="flex justify-between text-gray-400"><span>Rappel</span><span>60 j avant · grâce 30 j</span></div>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input type="checkbox" checked={sub?.billable !== false} onChange={e => toggleBillable(e.target.checked)} />
                    Facturable (compté dans le revenu)
                  </label>
                  <button onClick={markPaid} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <BadgeCheck size={16} /> Marquer comme payé (+1 an)
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-2 font-bold">Facturation</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Émise par <strong>Commerce CERDIA</strong> via <span className="font-mono">cerdia.ai</span>.</p>
                  <div className="mt-2 flex justify-between text-sm"><span className="text-gray-500">Total annuel</span><span className="font-bold">{money(total)}</span></div>
                  <a href="https://www.cerdia.ai/commerce/admin" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Ouvrir la facturation (Commerce CERDIA) →</a>
                  <p className="mt-1 text-xs text-gray-400">Redirection vers la plateforme de facturation Commerce CERDIA (à brancher).</p>
                </div>
              </div>
            </div>

            {/* Section Transactions */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-bold"><CreditCard size={16} /> Transactions</h2>
                <button onClick={() => setTxForm(f => ({ ...f, open: !f.open }))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Plus size={14} /> Ajouter
                </button>
              </div>

              {/* Formulaire ajout */}
              {txForm.open && (
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">Type</span>
                      <select value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                        <option value="payment">Paiement</option>
                        <option value="refund">Remboursement</option>
                        <option value="credit">Crédit</option>
                        <option value="adjustment">Ajustement</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">Montant ($)</span>
                      <input type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">Description</span>
                      <input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Paiement annuel…" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">Réf. / N° facture</span>
                      <input value={txForm.reference} onChange={e => setTxForm(f => ({ ...f, reference: e.target.value }))} className={inputCls} placeholder="INV-2026-001" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">Période début</span>
                      <input type="date" value={txForm.period_start} onChange={e => setTxForm(f => ({ ...f, period_start: e.target.value }))} className={inputCls} />
                    </label>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={addTransaction} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />} Enregistrer
                    </button>
                    <button onClick={() => setTxForm(f => ({ ...f, open: false }))} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Annuler</button>
                  </div>
                </div>
              )}

              {/* Liste */}
              {txs.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">Aucune transaction enregistrée.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700">
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Réf.</th>
                        <th className="px-4 py-2">Période</th>
                        <th className="px-4 py-2 text-right">Montant</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {txs.map(tx => {
                        const ttype = TX_TYPE[tx.type] || TX_TYPE.payment;
                        return (
                          <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmtDate(tx.created_at)}</td>
                            <td className="px-4 py-2.5"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${ttype.cls}`}>{ttype.label}</span></td>
                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-200">{tx.description || '—'}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{tx.reference || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">
                              {tx.period_start ? `${fmtDate(tx.period_start)}${tx.period_end ? ' → ' + fmtDate(tx.period_end) : ''}` : '—'}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap ${TX_STATUS[tx.status] || ''}`}>
                              {tx.type === 'refund' || tx.type === 'credit' ? '−' : ''}{money(Number(tx.amount))}
                            </td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => deleteTx(tx.id)} className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
