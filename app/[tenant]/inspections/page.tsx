'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ClipboardCheck, Plus, Search, Clock, CheckCircle, XCircle,
  AlertTriangle, AlertOctagon, Loader2, ChevronRight, Trash2,
  LayoutGrid, List, CalendarClock, TrendingUp,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PortalHeader } from '@/components/PortalHeader';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ────────────────────────────────────────────────────────────────────

type InspectionRow = {
  id: string;
  inspection_number: string;
  equipment_type: InspectionType;
  equipment_name: string | null;
  equipment_serial: string | null;
  equipment_location: string | null;
  inspector_name: string | null;
  inspection_date: string | null;
  inspection_frequency: InspectionFrequency | null;
  status: 'draft' | 'submitted' | 'closed';
  overall_result: OverallResult | null;
  created_at: string;
};

type EquipmentGroup = {
  key: string;
  equipmentType: InspectionType;
  equipmentName: string | null;
  equipmentSerial: string | null;
  equipmentLocation: string | null;
  latestRow: InspectionRow;
  allRows: InspectionRow[];
  frequency: InspectionFrequency | null;
  daysLeft: number | null;
  urgency: 'overdue' | 'soon' | 'ok' | 'unknown';
};

// ─── Config ───────────────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<OverallResult, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  conforme:     { label: 'Conforme',      color: 'text-green-700',  bg: 'bg-green-100 border-green-300',   Icon: CheckCircle },
  conditionnel: { label: 'Conditionnel',  color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300', Icon: AlertTriangle },
  non_conforme: { label: 'Non conforme',  color: 'text-red-700',    bg: 'bg-red-100 border-red-300',       Icon: XCircle },
  retrait:      { label: 'RETRAIT',       color: 'text-white',      bg: 'bg-red-600 border-red-700',       Icon: AlertOctagon },
  incomplete:   { label: 'En cours',      color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-300',     Icon: ClipboardCheck },
};

const STATUS_LABEL: Record<string, string> = { draft: 'Brouillon', submitted: 'Soumis', closed: 'Fermé' };
const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  submitted: 'bg-teal-100 text-teal-700',
  closed:    'bg-slate-100 text-slate-600',
};

const URGENCY_CONFIG = {
  overdue: { bar: 'bg-red-500',    text: 'text-red-700',    label: 'EN RETARD',   dot: 'bg-red-500'    },
  soon:    { bar: 'bg-amber-400',  text: 'text-amber-700',  label: 'Bientôt dû',  dot: 'bg-amber-400'  },
  ok:      { bar: 'bg-teal-500',   text: 'text-teal-700',   label: 'À jour',      dot: 'bg-teal-400'   },
  unknown: { bar: 'bg-gray-300',   text: 'text-gray-500',   label: '',            dot: 'bg-gray-300'   },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function equipmentKey(row: InspectionRow): string {
  if (row.equipment_serial?.trim()) return `serial:${row.equipment_serial.trim()}`;
  return `type:${row.equipment_type}:${(row.equipment_name ?? '').trim()}`;
}

function calcUrgency(row: InspectionRow): { daysLeft: number | null; urgency: EquipmentGroup['urgency'] } {
  if (!row.inspection_frequency || !row.inspection_date) return { daysLeft: null, urgency: 'unknown' };
  const freqDays = FREQUENCY_OPTIONS.find(f => f.value === row.inspection_frequency)?.days ?? null;
  if (!freqDays) return { daysLeft: null, urgency: 'unknown' };
  const lastDate = new Date(row.inspection_date);
  const nextDue = new Date(lastDate.getTime() + freqDays * 86400_000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((nextDue.getTime() - today.getTime()) / 86400_000);
  const soonThreshold = Math.max(1, Math.round(freqDays * 0.2));
  const urgency = daysLeft < 0 ? 'overdue' : daysLeft <= soonThreshold ? 'soon' : 'ok';
  return { daysLeft, urgency };
}

function groupByEquipment(rows: InspectionRow[]): EquipmentGroup[] {
  const map = new Map<string, InspectionRow[]>();
  rows.forEach(r => {
    const k = equipmentKey(r);
    map.set(k, [...(map.get(k) ?? []), r]);
  });
  const groups: EquipmentGroup[] = [];
  map.forEach((all, key) => {
    const sorted = [...all].sort((a, b) => {
      const da = a.inspection_date ?? a.created_at;
      const db = b.inspection_date ?? b.created_at;
      return db.localeCompare(da);
    });
    const latest = sorted[0];
    const { daysLeft, urgency } = calcUrgency(latest);
    groups.push({
      key,
      equipmentType: latest.equipment_type,
      equipmentName: latest.equipment_name,
      equipmentSerial: latest.equipment_serial,
      equipmentLocation: latest.equipment_location,
      latestRow: latest,
      allRows: sorted,
      frequency: latest.inspection_frequency,
      daysLeft,
      urgency,
    });
  });
  const order = { overdue: 0, soon: 1, ok: 2, unknown: 3 };
  groups.sort((a, b) => {
    const od = order[a.urgency] - order[b.urgency];
    if (od !== 0) return od;
    if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
    return 0;
  });
  return groups;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: OverallResult | null }) {
  if (!result) return null;
  const cfg = RESULT_CONFIG[result];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ daysLeft, frequency, urgency }: {
  daysLeft: number | null;
  frequency: InspectionFrequency | null;
  urgency: EquipmentGroup['urgency'];
}) {
  if (daysLeft === null || !frequency) return null;
  const freqDays = FREQUENCY_OPTIONS.find(f => f.value === frequency)?.days ?? 0;
  if (!freqDays) return null;
  const elapsed = freqDays - daysLeft;
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / freqDays) * 100)));
  const cfg = URGENCY_CONFIG[urgency];
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${cfg.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`text-xs mt-0.5 font-medium ${cfg.text}`}>
        {daysLeft < 0
          ? `En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}`
          : daysLeft === 0
          ? 'Inspection due aujourd\'hui'
          : `Prochaine inspection dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
        }
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InspectionsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'equipment' | 'list'>('equipment');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('equipment_inspections')
        .select('id, inspection_number, equipment_type, equipment_name, equipment_serial, equipment_location, inspector_name, inspection_date, inspection_frequency, status, overall_result, created_at')
        .eq('tenant_id', tenant)
        .order('created_at', { ascending: false });
      if (active) {
        setRows((data as InspectionRow[]) ?? []);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenant]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Supprimer cette inspection ? Cette action est irréversible.')) return;
    if (!supabase) return;
    setDeletingId(id);
    await supabase.from('equipment_inspections').delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  const filteredRows = useMemo(() => {
    let r = rows;
    if (typeFilter !== 'all') r = r.filter(x => x.equipment_type === typeFilter);
    const q = query.trim().toLowerCase();
    if (!q) return r;
    return r.filter(x =>
      [x.inspection_number, x.equipment_name, x.equipment_serial, x.inspector_name]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [rows, typeFilter, query]);

  const groups = useMemo(() => groupByEquipment(filteredRows), [filteredRows]);

  const stats = useMemo(() => {
    const allGroups = groupByEquipment(rows);
    return {
      equipment:    allGroups.length,
      overdue:      allGroups.filter(g => g.urgency === 'overdue').length,
      soon:         allGroups.filter(g => g.urgency === 'soon').length,
      nonConforme:  rows.filter(r => r.overall_result === 'non_conforme' || r.overall_result === 'retrait').length,
    };
  }, [rows]);

  const presentTypes = useMemo(() =>
    [...new Set(rows.map(r => r.equipment_type))] as InspectionType[]
  , [rows]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">

        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Inspections d&apos;équipements</h1>
              <p className="text-sm text-slate-500">
                Espace <span className="font-medium text-slate-700">{tenant}</span> · listes de vérification CNESST / CSA
              </p>
            </div>
          </div>
          <Link
            href={`/${tenant}/inspections/nouveau`}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Plus size={18} />
            Nouvelle inspection
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Équipements',  v: stats.equipment,   c: 'text-slate-900', Icon: LayoutGrid },
            { k: 'En retard',    v: stats.overdue,     c: 'text-red-600',   Icon: AlertOctagon },
            { k: 'Bientôt dûs',  v: stats.soon,        c: 'text-amber-600', Icon: CalendarClock },
            { k: 'Non conformes', v: stats.nonConforme, c: 'text-red-700',  Icon: XCircle },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <s.Icon size={16} className={s.c} />
              </div>
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Barre de filtres + vue */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* Toggle vue */}
            <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setViewMode('equipment')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition ${viewMode === 'equipment' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={13} /> Équipements
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <List size={13} /> Toutes
              </button>
            </div>

            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher (numéro, nom, série, inspecteur…)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Filtre type */}
          {presentTypes.length > 0 && (
            <div className="flex gap-1 flex-wrap rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setTypeFilter('all')}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${typeFilter === 'all' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Tous les types
              </button>
              {presentTypes.map(t => {
                const opt = INSPECTION_TYPE_OPTIONS.find(o => o.value === t);
                return opt ? (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${typeFilter === t ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {opt.label}
                  </button>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardCheck size={26} />
            </div>
            <p className="font-medium text-slate-700">Aucune inspection</p>
            <p className="max-w-sm text-sm text-slate-500">
              {query || typeFilter !== 'all'
                ? 'Aucun résultat pour ce filtre.'
                : 'Créez votre première inspection.'}
            </p>
            {!query && typeFilter === 'all' && (
              <Link href={`/${tenant}/inspections/nouveau`}
                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700">
                <Plus size={18} /> Nouvelle inspection
              </Link>
            )}
          </div>

        ) : viewMode === 'equipment' ? (
          /* ── Vue équipements ─────────────────────────────── */
          <div className="space-y-3">
            {groups.map(g => {
              const typOpt = INSPECTION_TYPE_OPTIONS.find(o => o.value === g.equipmentType);
              const freqOpt = FREQUENCY_OPTIONS.find(f => f.value === g.frequency);
              const urg = URGENCY_CONFIG[g.urgency];
              const result = g.latestRow.overall_result;

              return (
                <Link
                  key={g.key}
                  href={`/${tenant}/inspections/${g.latestRow.id}`}
                  className="block rounded-2xl border bg-white shadow-sm p-5 hover:bg-slate-50 transition-colors overflow-hidden"
                  style={{ borderColor: g.urgency === 'overdue' ? '#fca5a5' : g.urgency === 'soon' ? '#fcd34d' : '#e2e8f0' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {g.urgency !== 'unknown' && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${urg.dot}`} />
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {g.equipmentName || typOpt?.label || g.equipmentType}
                        </span>
                        {g.equipmentSerial && (
                          <span className="text-xs text-slate-400 font-mono">{g.equipmentSerial}</span>
                        )}
                        {result && <ResultBadge result={result} />}
                        {freqOpt && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {freqOpt.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {typOpt?.label}
                        {g.equipmentLocation ? ` · ${g.equipmentLocation}` : ''}
                        {g.latestRow.inspector_name ? ` · ${g.latestRow.inspector_name}` : ''}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        Dernière inspection : {g.latestRow.inspection_date
                          ? new Date(g.latestRow.inspection_date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'N/A'}
                        {g.allRows.length > 1 && (
                          <span className="ml-2 flex items-center gap-0.5 text-teal-600">
                            <TrendingUp size={11} /> {g.allRows.length} inspections
                          </span>
                        )}
                      </div>
                      <ProgressBar daysLeft={g.daysLeft} frequency={g.frequency} urgency={g.urgency} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        ) : (
          /* ── Vue liste (toutes inspections + suppression) ── */
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredRows.map(r => {
                const opt = INSPECTION_TYPE_OPTIONS.find(o => o.value === r.equipment_type);
                const { daysLeft, urgency } = calcUrgency(r);
                const urg = URGENCY_CONFIG[urgency];
                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                    <Link href={`/${tenant}/inspections/${r.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <ClipboardCheck size={16} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-slate-900">{r.inspection_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                            {STATUS_LABEL[r.status]}
                          </span>
                          {r.overall_result && <ResultBadge result={r.overall_result} />}
                          {daysLeft !== null && (
                            <span className={`text-xs font-medium ${urg.text}`}>
                              {daysLeft < 0 ? `↑ ${Math.abs(daysLeft)}j retard` : `${daysLeft}j restants`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {opt?.label}
                          {r.equipment_name ? ` · ${r.equipment_name}` : ''}
                          {r.equipment_serial ? ` · ${r.equipment_serial}` : ''}
                        </div>
                        {r.inspector_name && (
                          <div className="text-xs text-slate-400">
                            {r.inspector_name}
                            {r.inspection_date ? ` · ${new Date(r.inspection_date).toLocaleDateString('fr-CA')}` : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={e => handleDelete(r.id, e)}
                      disabled={deletingId === r.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === r.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
