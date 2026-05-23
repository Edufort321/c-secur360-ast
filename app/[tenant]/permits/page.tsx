'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileCheck, Plus, Search, MapPin, Calendar, User,
  Clock, CheckCircle, AlertTriangle, XCircle, Loader2,
  Flame, Zap, Shovel, Wind, FlaskConical, BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';

// =================== TYPES ===================

type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

type PermitRow = {
  permit_number: string;
  updated_at: string;
  data: {
    status?: PermitStatus;
    province?: string;
    permit_valid_from?: string;
    permit_valid_to?: string;
    siteInformation?: {
      workLocation?: string;
      contractor?: string;
      supervisor?: string;
      entryDate?: string;
    };
    validation?: { percentage?: number; isComplete?: boolean };
  };
};

// =================== CONSTANTES ===================

const STATUS: Record<PermitStatus, { label: string; cls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-600',    icon: Clock },
  active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  completed: { label: 'Complété',   cls: 'bg-blue-100 text-blue-700',      icon: CheckCircle },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',        icon: XCircle },
};

const PERMIT_TYPES = [
  { key: 'confined_space', labelFr: 'Espace clos',       icon: Wind,        color: 'text-cyan-600',   accent: 'bg-cyan-50' },
  { key: 'hot_work',       labelFr: 'Travail à chaud',    icon: Flame,       color: 'text-orange-600', accent: 'bg-orange-50' },
  { key: 'electrical',     labelFr: 'Électrique',          icon: Zap,         color: 'text-yellow-600', accent: 'bg-yellow-50' },
  { key: 'excavation',     labelFr: 'Excavation',          icon: Shovel,      color: 'bg-amber-600',    accent: 'bg-amber-50' },
  { key: 'chemical',       labelFr: 'Produits chimiques',  icon: FlaskConical,color: 'text-purple-600', accent: 'bg-purple-50' },
];

export default function PermitsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [permits, setPermits] = useState<PermitRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [filter, setFilter]     = useState<PermitStatus | 'all'>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('confined_space_permits')
          .select('permit_number, data, updated_at')
          .eq('tenant_id', tenant)
          .order('updated_at', { ascending: false });
        if (!active) return;
        if (error) throw error;
        setPermits(data || []);
      } catch {
        if (active) setPermits([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  const filtered = useMemo(() => {
    let rows = permits;
    if (filter !== 'all') rows = rows.filter(p => (p.data?.status || 'draft') === filter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(p => {
      const si = p.data?.siteInformation || {};
      return [p.permit_number, si.workLocation, si.contractor, si.supervisor]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
    });
  }, [permits, filter, query]);

  const stats = useMemo(() => ({
    total:     permits.length,
    active:    permits.filter(p => p.data?.status === 'active').length,
    draft:     permits.filter(p => !p.data?.status || p.data.status === 'draft').length,
    completed: permits.filter(p => p.data?.status === 'completed').length,
  }), [permits]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-600 text-white shadow-sm">
              <FileCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Permis de travail</h1>
              <p className="text-sm text-slate-500">
                Espace <span className="font-medium text-slate-700">{tenant}</span> · permis, espaces clos, conditions de sécurité
              </p>
            </div>
          </div>
          <Link
            href={`/${tenant}/permits/nouveau`}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          >
            <Plus size={18} /> Nouveau permis
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Total',     v: stats.total,     c: 'text-slate-900' },
            { k: 'Actifs',    v: stats.active,    c: 'text-emerald-600' },
            { k: 'Brouillons',v: stats.draft,     c: 'text-slate-500' },
            { k: 'Complétés', v: stats.completed, c: 'text-blue-600' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Types de permis */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PERMIT_TYPES.map(pt => {
            const Icon = pt.icon;
            return (
              <Link
                key={pt.key}
                href={`/${tenant}/permits/nouveau?type=${pt.key}`}
                className={`flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300`}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${pt.accent}`}>
                  <Icon size={20} className={pt.color} />
                </div>
                <span className="text-center text-xs font-semibold text-slate-700">{pt.labelFr}</span>
              </Link>
            );
          })}
        </div>

        {/* Filtres statut + Recherche */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['all', 'active', 'draft', 'completed', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === s
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'Tous' : STATUS[s]?.label}
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (numéro, lieu, entrepreneur…)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <FileCheck size={26} />
            </div>
            <p className="font-medium text-slate-700">Aucun permis</p>
            <p className="max-w-sm text-sm text-slate-500">
              Crée ton premier permis de travail — espace clos, travail à chaud, électrique, excavation ou produits chimiques.
            </p>
            <Link
              href={`/${tenant}/permits/nouveau`}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700"
            >
              <Plus size={18} /> Nouveau permis
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => {
              const si = p.data?.siteInformation || {};
              const status = (p.data?.status || 'draft') as PermitStatus;
              const st = STATUS[status] || STATUS.draft;
              const StatusIcon = st.icon;
              const pct = p.data?.validation?.percentage ?? 0;

              return (
                <Link
                  key={p.permit_number}
                  href={`/${tenant}/permits/${p.permit_number}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-semibold text-slate-600">
                      {p.permit_number}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                      <StatusIcon size={12} /> {st.label}
                    </span>
                  </div>

                  <div className="mb-3 space-y-1 text-sm text-slate-600">
                    {si.workLocation && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="line-clamp-1">{si.workLocation}</span>
                      </div>
                    )}
                    {si.contractor && (
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="line-clamp-1">{si.contractor}</span>
                      </div>
                    )}
                    {si.entryDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {si.entryDate}
                      </div>
                    )}
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><BarChart3 size={12} /> Complétude</span>
                      <span className="font-semibold">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
