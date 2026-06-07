'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FolderKanban, Plus, Search, Building2, MapPin, Calendar,
  FileText, X, DollarSign, Hash, Loader2, Download, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';

type Client = { id: string; name: string; contact_name: string; contact_phone: string; email: string; address: string; city: string; province: string };

type Project = {
  id: string;
  tenant_id: string;
  project_number: string;
  title?: string | null;
  client_name?: string | null;
  location?: string | null;
  status?: string | null;
  project_type?: string | null;
  po_amount?: number | null;
  date_submission?: string | null;
  date_work_start?: string | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  soumission: { label: 'Soumission', cls: 'bg-amber-100 text-amber-700' },
  vente: { label: 'Vente', cls: 'bg-violet-100 text-violet-700' },
  'en-cours': { label: 'En cours', cls: 'bg-blue-100 text-blue-700' },
  facture: { label: 'Facturé', cls: 'bg-emerald-100 text-emerald-700' },
};

const emptyForm = {
  project_number: '', title: '', client_name: '', location: '',
  status: 'soumission', project_type: 'budgetaire',
  po_amount: '', date_submission: '', date_work_start: '',
  primary_seller_id: '',
};

export default function ProjectsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [projects, setProjects] = useState<Project[]>([]);
  const [astCounts, setAstCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pView, setPView] = useState<'grid' | 'gallery'>('grid'); // grille (défaut) / galerie
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [notice, setNotice] = useState<string | null>(null);

  // Client search
  const [clients, setClients] = useState<Client[]>([]);
  const [clientQuery, setClientQuery] = useState('');
  const [showClientDrop, setShowClientDrop] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);
  // Vendeurs (personnel) pour l'attribution de commission
  const [sellers, setSellers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    supabase.from('clients').select('id,name,contact_name,contact_phone,email,address,city,province').eq('tenant_id', tenant).eq('active', true).order('name')
      .then(({ data }) => setClients(data || []));
    supabase.from('planner_personnel').select('id,name,email').eq('tenant_id', tenant).order('name')
      .then(({ data }) => setSellers((data || []).filter((p: any) => p.name)));
  }, [tenant]);

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return clients.slice(0, 8);
    return clients.filter(c => [c.name, c.contact_name, c.city].some(v => v?.toLowerCase().includes(q))).slice(0, 8);
  }, [clients, clientQuery]);

  function pickClient(c: Client) {
    setForm(f => ({
      ...f,
      client_name: c.name,
      location: c.city ? `${c.city}${c.province ? ', ' + c.province : ''}` : f.location,
    }));
    setClientQuery(c.name);
    setShowClientDrop(false);
  }

  useEffect(() => {
    function close(e: MouseEvent) { if (clientRef.current && !clientRef.current.contains(e.target as Node)) setShowClientDrop(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setTenantLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  async function exportPdf() {
    setExporting(true);
    try {
      const { exportProjectListPdf } = await import('@/lib/pdf/projectPdf');
      await exportProjectListPdf({ projects, tenant, tenantLogoUrl });
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('projects').select('*')
          .eq('tenant_id', tenant)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (error) throw error;
        setProjects(data || []);
        const { data: asts } = await supabase.from('ast_permits').select('data').eq('tenant_id', tenant);
        const counts: Record<string, number> = {};
        (asts || []).forEach((a: any) => { const pn = a.data?.taskInfo?.projectNumber; if (pn) counts[pn] = (counts[pn] || 0) + 1; });
        if (active) setAstCounts(counts);
      } catch {
        // mode local (pas de DB / clé placeholder) : on démarre à vide
        if (active) setProjects([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p =>
      [p.project_number, p.title, p.client_name, p.location]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [projects, query]);

  const stats = useMemo(() => ({
    total: projects.length,
    soumission: projects.filter(p => p.status === 'soumission').length,
    encours: projects.filter(p => p.status === 'en-cours').length,
    facture: projects.filter(p => p.status === 'facture').length,
  }), [projects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_number.trim()) return;
    setSaving(true);
    setNotice(null);

    const optimistic: Project = {
      id: `local-${Date.now()}`,
      tenant_id: tenant,
      project_number: form.project_number.trim(),
      title: form.title || null,
      client_name: form.client_name || null,
      location: form.location || null,
      status: form.status,
      project_type: form.project_type,
      po_amount: form.po_amount ? Number(form.po_amount) : null,
      date_submission: form.date_submission || null,
      date_work_start: form.date_work_start || null,
      primary_seller_id: form.primary_seller_id || null,
    } as any;
    setProjects(prev => [optimistic, ...prev]);

    // Best-effort DB (fonctionnera avec la vraie clé Supabase)
    try {
      const { id, ...insert } = optimistic;
      const { data, error } = await supabase.from('projects').insert(insert).select().single();
      if (error) throw error;
      if (data) {
        setProjects(prev => prev.map(p => (p.id === optimistic.id ? data : p)));
        // Commission de vente : si le projet est créé directement en « vente »
        if (data.status === 'vente' && data.primary_seller_id) {
          const { syncProjectCommission } = await import('@/lib/commission');
          const r = await syncProjectCommission(supabase, tenant, data);
          if (r.ok) setNotice('✓ ' + r.msg);
        }
      }
    } catch {
      setNotice("Aperçu local (DB non connectée) — fournir la clé Supabase pour persister.");
    } finally {
      setSaving(false);
      setShowForm(false);
      setForm({ ...emptyForm });
      setClientQuery('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">
        <BackButton fallback={`/${tenant}/modules`} className="mb-4" />
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FolderKanban size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Projets</h1>
              <p className="text-sm text-slate-500">
                Espace <span className="font-medium text-slate-700">{tenant}</span> · moteur central (devis → job → AST → temps → facture)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/${tenant}/projects/soumissions`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700">
              <FileText size={18} /> Soumissions
            </Link>
            <button
              onClick={exportPdf}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Exporter PDF
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} /> Nouveau projet
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Total', v: stats.total, c: 'text-slate-900' },
            { k: 'Soumissions', v: stats.soumission, c: 'text-amber-600' },
            { k: 'En cours', v: stats.encours, c: 'text-blue-600' },
            { k: 'Facturés', v: stats.facture, c: 'text-emerald-600' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher (numéro, titre, client, lieu)…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            {notice}
          </div>
        )}

        {/* Barre : compteur + bascule Grille / Galerie */}
        {!loading && filtered.length > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">{filtered.length} {filtered.length > 1 ? 'projets' : 'projet'}</span>
            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 text-xs">
              <button onClick={() => setPView('grid')} className={`rounded-md px-2 py-1 font-semibold ${pView === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Grille</button>
              <button onClick={() => setPView('gallery')} className={`rounded-md px-2 py-1 font-semibold ${pView === 'gallery' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Galerie</button>
            </div>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderKanban size={26} />
            </div>
            <p className="font-medium text-slate-700">Aucun projet</p>
            <p className="max-w-sm text-sm text-slate-500">
              Crée ton premier projet — il génère un numéro qui circulera vers le planificateur, l'AST, les feuilles de temps et la facturation.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} /> Nouveau projet
            </button>
          </div>
        ) : (
          <div className={`grid gap-3 ${pView === 'gallery' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {filtered.map(p => {
              const st = STATUS[p.status || 'soumission'] || STATUS.soumission;
              return (
                <Link key={p.id} href={`/${tenant}/projects/${p.id}`} className={`block rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${pView === 'gallery' ? 'p-5' : 'p-4'}`}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      <Hash size={13} /> {p.project_number}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  </div>
                  <h3 className="mb-2 line-clamp-1 font-semibold text-slate-900">{p.title || 'Sans titre'}</h3>
                  <div className="space-y-1 text-sm text-slate-500">
                    {p.client_name && <div className="flex items-center gap-1.5"><Building2 size={14} /> {p.client_name}</div>}
                    {p.location && <div className="flex items-center gap-1.5"><MapPin size={14} /> {p.location}</div>}
                    {p.date_work_start && <div className="flex items-center gap-1.5"><Calendar size={14} /> {p.date_work_start}</div>}
                    {p.po_amount != null && <div className="flex items-center gap-1.5"><DollarSign size={14} /> {Number(p.po_amount).toLocaleString('fr-CA')} $</div>}
                    {p.project_number && (astCounts[p.project_number] || 0) > 0 && <div className="flex items-center gap-1.5"><FileText size={14} /> {astCounts[p.project_number]} AST</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-900"><FileText size={18} /> Nouveau projet</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Numéro de projet *">
                  <input required value={form.project_number} onChange={e => setForm(f => ({ ...f, project_number: e.target.value }))} className="inp" placeholder="PRJ-2026-001" />
                </Field>
                <Field label="Titre">
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="inp" placeholder="Inspection transfo…" />
                </Field>
                <Field label="Client">
                  <div ref={clientRef} className="relative">
                    <div className="relative">
                      <input
                        value={clientQuery}
                        onChange={e => { setClientQuery(e.target.value); setForm(f => ({ ...f, client_name: e.target.value })); setShowClientDrop(true); }}
                        onFocus={() => setShowClientDrop(true)}
                        className="inp w-full pr-6"
                        placeholder="Rechercher client…"
                      />
                      <ChevronDown size={13} className="pointer-events-none absolute right-2 top-2.5 text-slate-400" />
                    </div>
                    {showClientDrop && filteredClients.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {filteredClients.map(c => (
                          <button key={c.id} type="button" onMouseDown={() => pickClient(c)}
                            className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-50">
                            <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                            <span className="text-xs text-slate-400">{[c.contact_name, c.city].filter(Boolean).join(' · ')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Lieu">
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="inp" placeholder="Sherbrooke" />
                </Field>
                <Field label="Statut">
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="inp">
                    <option value="soumission">Soumission</option>
                    <option value="vente">Vente</option>
                    <option value="en-cours">En cours</option>
                    <option value="facture">Facturé</option>
                  </select>
                </Field>
                <Field label="Vendeur (commission)">
                  <select value={form.primary_seller_id} onChange={e => setForm(f => ({ ...f, primary_seller_id: e.target.value }))} className="inp">
                    <option value="">— Aucun —</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select value={form.project_type} onChange={e => setForm(f => ({ ...f, project_type: e.target.value }))} className="inp">
                    <option value="budgetaire">Budgétaire</option>
                    <option value="forfaitaire">Forfaitaire</option>
                  </select>
                </Field>
                <Field label="Montant BC ($)">
                  <input type="number" value={form.po_amount} onChange={e => setForm(f => ({ ...f, po_amount: e.target.value }))} className="inp" placeholder="0" />
                </Field>
                <Field label="Début des travaux">
                  <input type="date" value={form.date_work_start} onChange={e => setForm(f => ({ ...f, date_work_start: e.target.value }))} className="inp" />
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving && <Loader2 size={16} className="animate-spin" />} Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .inp {
          width: 100%;
          border-radius: 0.6rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.5rem 0.7rem;
          font-size: 0.875rem;
          outline: none;
        }
        .inp:focus { border-color: rgb(37 99 235); box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
