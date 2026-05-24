'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ClipboardList, Plus, Search, MapPin, User, Calendar,
  Clock, CheckCircle, XCircle, Loader2, BarChart3,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PortalHeader } from '@/components/PortalHeader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

type ASTRow = {
  permit_number: string;
  updated_at: string;
  data: {
    status?: PermitStatus;
    province?: string;
    taskInfo?: {
      workLocation?: string;
      supervisor?: string;
      taskDate?: string;
      taskDescription?: string;
      projectNumber?: string;
      contractor?: string;
    };
    validation?: { percentage?: number };
  };
};

const STATUS: Record<PermitStatus, { label: string; cls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-600',    icon: Clock },
  active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  completed: { label: 'Complété',   cls: 'bg-blue-100 text-blue-700',      icon: CheckCircle },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',        icon: XCircle },
};

export default function ASTListPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [rows, setRows]     = useState<ASTRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<PermitStatus | 'all'>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('ast_permits')
          .select('permit_number, data, updated_at')
          .eq('tenant_id', tenant)
          .order('updated_at', { ascending: false });
        if (active) setRows((data ?? []) as ASTRow[]);
      } catch {
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter !== 'all') list = list.filter(r => (r.data?.status || 'draft') === filter);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(r =>
      [
        r.permit_number,
        r.data?.taskInfo?.workLocation,
        r.data?.taskInfo?.supervisor,
        r.data?.taskInfo?.projectNumber,
        r.data?.taskInfo?.contractor,
        r.data?.taskInfo?.taskDescription,
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [rows, filter, query]);

  const stats = useMemo(() => ({
    total:     rows.length,
    active:    rows.filter(r => r.data?.status === 'active').length,
    draft:     rows.filter(r => !r.data?.status || r.data.status === 'draft').length,
    completed: rows.filter(r => r.data?.status === 'completed').length,
  }), [rows]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analyses Sécurité au Travail</h1>
              <p className="text-sm text-slate-500">
                Espace <span className="font-medium text-slate-700">{tenant}</span>
              </p>
            </div>
          </div>
          <Link
            href={`/${tenant}/ast/nouveau`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Plus size={18} /> Nouvel AST
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Total',      v: stats.total,     c: 'text-slate-900' },
            { k: 'Actifs',     v: stats.active,    c: 'text-emerald-600' },
            { k: 'Brouillons', v: stats.draft,     c: 'text-slate-500' },
            { k: 'Complétés',  v: stats.completed, c: 'text-blue-600' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
            {(['all', 'active', 'draft', 'completed', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === s ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'Tous statuts' : STATUS[s]?.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (numéro, lieu, superviseur, projet…)"
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
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-400">
              <ClipboardList size={26} />
            </div>
            <p className="font-medium text-slate-700">Aucun AST</p>
            <p className="max-w-sm text-sm text-slate-500">
              Crée ta première Analyse Sécurité au Travail pour identifier les dangers et mesures préventives.
            </p>
            <Link
              href={`/${tenant}/ast/nouveau`}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
            >
              <Plus size={18} /> Nouvel AST
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(r => {
              const ti     = r.data?.taskInfo;
              const status = (r.data?.status || 'draft') as PermitStatus;
              const st     = STATUS[status] || STATUS.draft;
              const StatusIcon = st.icon;
              const pct    = r.data?.validation?.percentage ?? 0;
              const date   = ti?.taskDate
                ? new Date(ti.taskDate).toLocaleDateString('fr-CA')
                : new Date(r.updated_at).toLocaleDateString('fr-CA');

              return (
                <Link
                  key={r.permit_number}
                  href={`/${tenant}/ast/${r.permit_number}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50">
                        <ClipboardList size={17} className="text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {r.permit_number}
                        </p>
                        {r.data?.province && (
                          <p className="text-xs text-slate-400">{r.data.province}</p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                      <StatusIcon size={10} />
                      {st.label}
                    </span>
                  </div>

                  {/* Location / description */}
                  {(ti?.workLocation || ti?.taskDescription) && (
                    <div className="mb-2 flex items-start gap-1.5 text-sm text-slate-700">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-1 font-medium">
                        {ti.workLocation || ti.taskDescription}
                      </span>
                    </div>
                  )}

                  {/* Supervisor / date row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {ti?.supervisor && (
                      <span className="flex items-center gap-1">
                        <User size={11} /> {ti.supervisor}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {date}
                    </span>
                    {ti?.projectNumber && (
                      <span className="flex items-center gap-1">
                        # {ti.projectNumber}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {pct > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="flex items-center gap-0.5 text-xs text-slate-400">
                        <BarChart3 size={10} /> {pct}%
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
