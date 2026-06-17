'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileCheck, Plus, Search, MapPin, Calendar, User,
  Clock, CheckCircle, XCircle, Loader2, BarChart3,
  Wind, Flame, Lock, Zap, ArrowUp, Shovel, FlaskConical, Gauge, Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { downloadCsv, type CsvColumn } from '@/lib/csv';

// ── Types ─────────────────────────────────────────────────────────────────────

type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

type PermitRow = {
  permit_number: string;
  updated_at: string;
  permitType: string;   // 'confined_space' | 'hot_work' | 'loto' | etc.
  href?: string;        // lien dédié (ex. espace clos -> module dédié) sinon /permits/{permit_number}
  data: {
    status?: PermitStatus;
    province?: string;
    // ConfinedSpace uses siteInformation; all others use siteInfo
    siteInformation?: { workLocation?: string; contractor?: string; supervisor?: string; entryDate?: string };
    siteInfo?:        { workLocation?: string; contractor?: string; supervisor?: string; entryDate?: string };
    // LOTO uses equipment.equipmentName as title
    equipment?: { equipmentName?: string; equipmentLocation?: string };
    // AST uses taskInfo
    taskInfo?: { workLocation?: string; contractor?: string; supervisor?: string; taskDate?: string };
    validation?: { percentage?: number; isComplete?: boolean };
  };
};

// ── Permit type catalogue ─────────────────────────────────────────────────────

const PERMIT_META: Record<string, { labelFr: string; icon: React.ElementType; color: string; accent: string }> = {
  confined_space: { labelFr: 'Espace clos',           icon: Wind,         color: 'text-cyan-600',   accent: 'bg-cyan-50'   },
  hot_work:       { labelFr: 'Travail à chaud',       icon: Flame,        color: 'text-orange-600', accent: 'bg-orange-50' },
  loto:           { labelFr: 'LOTO',                  icon: Lock,         color: 'text-slate-600',  accent: 'bg-slate-100' },
  electrical:     { labelFr: 'Travail électrique',    icon: Zap,          color: 'text-yellow-600', accent: 'bg-yellow-50' },
  height_work:    { labelFr: 'Travail en hauteur',    icon: ArrowUp,      color: 'text-blue-600',   accent: 'bg-blue-50'   },
  excavation:     { labelFr: 'Excavation',            icon: Shovel,       color: 'text-amber-700',  accent: 'bg-amber-50'  },
  chemical:       { labelFr: 'Matières dangereuses',  icon: FlaskConical, color: 'text-purple-600', accent: 'bg-purple-50' },
  pressure:       { labelFr: 'Tuyauterie/Pression',   icon: Gauge,        color: 'text-red-600',    accent: 'bg-red-50'    },
};

const STATUS: Record<PermitStatus, { label: string; cls: string; icon: React.ElementType }> = {
  draft:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-600',    icon: Clock },
  active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  completed: { label: 'Complété',   cls: 'bg-blue-100 text-blue-700',      icon: CheckCircle },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',        icon: XCircle },
};

// Extracts a display-friendly location/title from any permit shape
function getPermitLocation(row: PermitRow): string {
  return (
    row.data?.siteInformation?.workLocation ||
    row.data?.siteInfo?.workLocation ||
    row.data?.taskInfo?.workLocation ||
    row.data?.equipment?.equipmentLocation ||
    ''
  );
}
function getPermitContractor(row: PermitRow): string {
  return (
    row.data?.siteInformation?.contractor ||
    row.data?.siteInfo?.contractor ||
    row.data?.taskInfo?.contractor ||
    ''
  );
}
function getPermitDate(row: PermitRow): string {
  return (
    row.data?.siteInformation?.entryDate ||
    row.data?.siteInfo?.entryDate ||
    row.data?.taskInfo?.taskDate ||
    ''
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PermitsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [permits, setPermits]   = useState<PermitRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [filter, setFilter]     = useState<PermitStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Permis : ancienne table espace clos (legacy) + work_permits + NOUVEAU registre d'espaces clos.
        const [csRes, wpRes, ecRes] = await Promise.all([
          supabase
            .from('confined_space_permits')
            .select('permit_number, data, updated_at')
            .eq('tenant_id', tenant)
            .order('updated_at', { ascending: false }),
          supabase
            .from('work_permits')
            .select('permit_number, type, data, updated_at')
            .eq('tenant_id', tenant)
            .order('updated_at', { ascending: false }),
          supabase
            .from('confined_spaces')
            .select('id, space_code, name, location, risk_level, status, updated_at')
            .eq('tenant_id', tenant)
            .eq('status', 'active')
            .order('updated_at', { ascending: false }),
        ]);

        if (!active) return;

        const csRows: PermitRow[] = (csRes.data || []).map((r: any) => ({
          ...r,
          permitType: 'confined_space',
        }));

        const wpRows: PermitRow[] = (wpRes.data || []).map((r: any) => ({
          permit_number: r.permit_number,
          updated_at: r.updated_at,
          permitType: r.type || 'unknown',
          data: r.data,
        }));

        // Nouveau registre d'espaces clos -> carte liée au module dédié.
        const ecRows: PermitRow[] = (ecRes.data || []).map((r: any) => ({
          permit_number: r.space_code || r.name || r.id,
          updated_at: r.updated_at,
          permitType: 'confined_space',
          href: `/${tenant}/permits/espace-clos/${r.id}`,
          data: { status: 'active', siteInformation: { workLocation: r.location } },
        }));

        // Merge and sort by updated_at desc
        const merged = [...ecRows, ...csRows, ...wpRows].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        setPermits(merged);
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
    if (typeFilter !== 'all') rows = rows.filter(p => p.permitType === typeFilter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(p =>
      [p.permit_number, getPermitLocation(p), getPermitContractor(p), p.permitType]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [permits, filter, typeFilter, query]);

  const stats = useMemo(() => ({
    total:     permits.length,
    active:    permits.filter(p => p.data?.status === 'active').length,
    draft:     permits.filter(p => !p.data?.status || p.data.status === 'draft').length,
    completed: permits.filter(p => p.data?.status === 'completed').length,
  }), [permits]);

  // Unique permit types present in the current list
  const presentTypes = useMemo(() =>
    [...new Set(permits.map(p => p.permitType))], [permits]
  );

  // Export CSV de la liste filtrée des permis (socle lib/csv : Excel-FR, colonnes typées).
  function exportPermitsCsv() {
    const statusLabel: Record<string, string> = { draft: 'Brouillon', active: 'Actif', completed: 'Complété', cancelled: 'Annulé' };
    const rows = filtered.map(p => ({
      number: p.permit_number,
      type: PERMIT_META[p.permitType]?.labelFr || p.permitType,
      status: statusLabel[p.data?.status || 'draft'] || (p.data?.status || ''),
      location: getPermitLocation(p),
      contractor: getPermitContractor(p),
      date: getPermitDate(p),
      province: p.data?.province || '',
      completion: p.data?.validation?.percentage != null ? p.data.validation.percentage : '',
      updated: p.updated_at || '',
    }));
    const cols: CsvColumn[] = [
      { key: 'number', label: 'Numéro' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Statut' },
      { key: 'location', label: 'Lieu des travaux' },
      { key: 'contractor', label: 'Entrepreneur' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'province', label: 'Province' },
      { key: 'completion', label: 'Complétion (%)', type: 'number' },
      { key: 'updated', label: 'Mis à jour', type: 'date' },
    ];
    downloadCsv(`permis-${new Date().toISOString().slice(0, 10)}.csv`, rows, cols);
  }

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
                Espace <span className="font-medium text-slate-700">{tenant}</span> · tous types de permis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <button
                onClick={exportPermitsCsv}
                title="Exporter la liste filtrée en CSV (Excel)"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              >
                <Download size={18} /> Exporter CSV
              </button>
            )}
            <Link
              href={`/${tenant}/permits/nouveau`}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-cyan-700"
            >
              <Plus size={18} /> Nouveau permis
            </Link>
          </div>
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
          {/* Status + type filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {(['all', 'active', 'draft', 'completed', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === s ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s === 'all' ? 'Tous statuts' : STATUS[s]?.label}
                </button>
              ))}
            </div>

            {/* Type filter (only show if >1 type present) */}
            {presentTypes.length > 1 && (
              <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    typeFilter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tous types
                </button>
                {presentTypes.map(t => {
                  const meta = PERMIT_META[t];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        typeFilter === t ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={11} /> {meta.labelFr}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (numéro, lieu, entrepreneur, type…)"
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
              Crée ton premier permis — espace clos, travail à chaud, LOTO, électrique, hauteur, excavation, chimique ou pression.
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
              const location   = getPermitLocation(p);
              const contractor = getPermitContractor(p);
              const date       = getPermitDate(p);
              const status     = (p.data?.status || 'draft') as PermitStatus;
              const st         = STATUS[status] || STATUS.draft;
              const StatusIcon = st.icon;
              const pct        = p.data?.validation?.percentage ?? 0;
              const meta       = PERMIT_META[p.permitType];
              const TypeIcon   = meta?.icon ?? FileCheck;

              return (
                <Link
                  key={p.href || p.permit_number}
                  href={p.href || `/${tenant}/permits/${p.permit_number}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Header row */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {meta && (
                        <span className={`grid h-6 w-6 place-items-center rounded-lg ${meta.accent}`}>
                          <TypeIcon size={12} className={meta.color} />
                        </span>
                      )}
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {p.permit_number}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                      <StatusIcon size={12} /> {st.label}
                    </span>
                  </div>

                  {/* Permit type label */}
                  {meta && (
                    <div className={`mb-2 inline-block text-xs font-semibold ${meta.color}`}>
                      {meta.labelFr}
                    </div>
                  )}

                  {/* Details */}
                  <div className="mb-3 space-y-1 text-sm text-slate-600">
                    {location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}
                    {contractor && (
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="line-clamp-1">{contractor}</span>
                      </div>
                    )}
                    {date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {date.length > 10 ? date.slice(0, 10) : date}
                      </div>
                    )}
                  </div>

                  {/* Completion bar */}
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
