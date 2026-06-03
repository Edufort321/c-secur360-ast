'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Plus, AlertTriangle, Shield, Truck, Building2,
  Activity, Clock, Search, ChevronRight, Download,
} from 'lucide-react';
import IncidentReportForm, { DaySafetyCounter, type IncidentType, type DayCounter } from '../../../components/IncidentReport';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/lib/useRealtime';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface IncidentRow {
  id: string;
  report_number: string;
  incident_type: IncidentType;
  province: string;
  status: 'draft' | 'submitted' | 'closed';
  created_at: string;
  submitted_at: string | null;
  data: { incidentDate?: string; reportedBy?: string; description?: string; address?: string; severityLevel?: number };
}

const TYPE_COLOR: Record<IncidentType, string> = {
  accident:  'bg-red-100 text-red-700 border-red-200',
  near_miss: 'bg-orange-100 text-orange-700 border-orange-200',
  vehicle:   'bg-blue-100 text-blue-700 border-blue-200',
  property:  'bg-purple-100 text-purple-700 border-purple-200',
  medical:   'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const TYPE_ICON: Record<IncidentType, React.ReactNode> = {
  accident:  <AlertTriangle size={16} />,
  near_miss: <Shield size={16} />,
  vehicle:   <Truck size={16} />,
  property:  <Building2 size={16} />,
  medical:   <Activity size={16} />,
};

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-green-100 text-green-700',
  closed:    'bg-slate-100 text-slate-600',
};

const SEVERITY_COLOR: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-lime-100 text-lime-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-red-200 text-red-800',
};

// ── Bilingue (connecte au header FR/EN via useLanguage) ──────────────────────
const T = {
  fr: {
    title: 'Accidents',
    subtitle: 'Declarations, analyses et decompte securitaire',
    nearMiss: 'Passe proche',
    newReport: 'Nouveau rapport',
    daysAccident: 'jours sans accident',
    daysNearMiss: 'jours sans passe proche',
    resetTitle: 'Reinitialiser le compteur',
    resetBodyA: "Ceci enregistre aujourd'hui comme date du dernier ",
    resetBodyB: ' et remet le compteur a zero. Le record precedent sera conserve.',
    accidentWord: 'accident', nearMissWord: 'passe proche',
    cancel: 'Annuler', confirmReset: 'Confirmer la reinitialisation',
    total: 'Total', drafts: 'Brouillons', submitted: 'Soumis', highSev: 'Severite elevee (4-5)',
    all: 'Tous', allSeverities: 'Toutes severites', allStatuses: 'Tous statuts',
    searchPh: 'Rechercher par numero, description...',
    reportsCount: (n: number) => `${n} rapport${n !== 1 ? 's' : ''}`,
    loading: 'Chargement...', noResult: 'Aucun resultat', empty: 'Aucun rapport enregistre',
    createFirst: 'Creer le premier rapport',
    statusLabel: { draft: 'Brouillon', submitted: 'Soumis', closed: 'Ferme' } as Record<string, string>,
    severityLabel: { 1: 'Mineur', 2: 'Faible', 3: 'Modere', 4: 'Grave', 5: 'Critique' } as Record<number, string>,
    typeLabel: { accident: 'Accident de travail', near_miss: 'Passe proche', vehicle: 'Accident de vehicule', property: 'Dommages materiels', medical: 'Maladie professionnelle' } as Record<IncidentType, string>,
    locale: 'fr-CA',
  },
  en: {
    title: 'Accidents',
    subtitle: 'Reports, investigations and safety day count',
    nearMiss: 'Near miss',
    newReport: 'New report',
    daysAccident: 'days without accident',
    daysNearMiss: 'days without near miss',
    resetTitle: 'Reset the counter',
    resetBodyA: 'This records today as the date of the last ',
    resetBodyB: ' and resets the counter to zero. The previous record is kept.',
    accidentWord: 'accident', nearMissWord: 'near miss',
    cancel: 'Cancel', confirmReset: 'Confirm reset',
    total: 'Total', drafts: 'Drafts', submitted: 'Submitted', highSev: 'High severity (4-5)',
    all: 'All', allSeverities: 'All severities', allStatuses: 'All statuses',
    searchPh: 'Search by number, description...',
    reportsCount: (n: number) => `${n} report${n !== 1 ? 's' : ''}`,
    loading: 'Loading...', noResult: 'No result', empty: 'No report recorded',
    createFirst: 'Create the first report',
    statusLabel: { draft: 'Draft', submitted: 'Submitted', closed: 'Closed' } as Record<string, string>,
    severityLabel: { 1: 'Minor', 2: 'Low', 3: 'Moderate', 4: 'Serious', 5: 'Critical' } as Record<number, string>,
    typeLabel: { accident: 'Workplace accident', near_miss: 'Near miss', vehicle: 'Vehicle accident', property: 'Property damage', medical: 'Occupational illness' } as Record<IncidentType, string>,
    locale: 'en-CA',
  },
} as const;

type FilterType = 'all' | IncidentType;

export default function AccidentsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const { lang } = useLanguage();
  const t = T[lang];

  const [reports, setReports] = useState<IncidentRow[]>([]);
  const [counter, setCounter] = useState<DayCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [activeReport, setActiveReport] = useState<string | null | 'new'>(null);
  const [defaultType, setDefaultType] = useState<IncidentType>('accident');
  const [resetConfirm, setResetConfirm] = useState<'accident' | 'near_miss' | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const [{ data: rows }, { data: cnt }] = await Promise.all([
      supabase.from('incident_reports').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }),
      supabase.from('incident_day_counters').select('*').eq('tenant_id', tenant).single(),
    ]);

    setReports((rows as IncidentRow[]) ?? []);
    setCounter(cnt as DayCounter | null);
    setLoading(false);
  }, [tenant]);

  useEffect(() => { load(); }, [load]);
  // Temps reel : recharge a tout changement sur incident_reports
  useRealtime(['incident_reports'], tenant, load);

  async function handleReset(type: 'accident' | 'near_miss') {
    if (!supabase) return;
    const today = new Date().toISOString().split('T')[0];
    const field = type === 'near_miss' ? 'last_near_miss_date' : 'last_accident_date';
    const recordField = type === 'near_miss' ? 'near_miss_record_days' : 'accident_record_days';

    if (counter) {
      const lastDate: string | null = counter[field];
      const prevRecord: number = counter[recordField] ?? 0;
      const daysSince = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 0;
      await supabase!.from('incident_day_counters').update({
        [field]: today,
        [recordField]: Math.max(prevRecord, daysSince),
        updated_at: new Date().toISOString(),
      }).eq('tenant_id', tenant);
    } else {
      await supabase!.from('incident_day_counters').insert({
        tenant_id: tenant,
        [field]: today,
        [recordField]: 0,
        updated_at: new Date().toISOString(),
      });
    }

    setResetConfirm(null);
    load();
  }

  function newReport(type: IncidentType) {
    setDefaultType(type);
    setActiveReport('new');
  }

  const filtered = reports
    .filter(r => {
      if (filter !== 'all' && r.incident_type !== filter) return false;
      if (severityFilter !== 'all' && String(r.data?.severityLevel ?? '') !== severityFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.report_number.toLowerCase().includes(q) ||
        t.typeLabel[r.incident_type].toLowerCase().includes(q) ||
        (r.data?.description ?? '').toLowerCase().includes(q) ||
        (r.data?.reportedBy ?? '').toLowerCase().includes(q)
      );
    })
    // Tri : severite decroissante (critique d'abord), puis date decroissante
    .sort((a, b) =>
      (b.data?.severityLevel ?? 0) - (a.data?.severityLevel ?? 0) ||
      String(b.created_at).localeCompare(String(a.created_at)),
    );

  function exportCsv() {
    const cell = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ['No', 'Type', 'Severite', 'Statut', 'Date incident', 'Declarant', 'Adresse', 'Description'];
    const lines = filtered.map(r => [
      r.report_number,
      t.typeLabel[r.incident_type],
      r.data?.severityLevel ?? '',
      t.statusLabel[r.status],
      r.data?.incidentDate ?? '',
      r.data?.reportedBy ?? '',
      r.data?.address ?? '',
      r.data?.description ?? '',
    ].map(cell).join(','));
    const csv = '﻿' + [headers.map(cell).join(','), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `accidents-${tenant}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtersActive = !!search || filter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />

      {activeReport !== null ? (
        <IncidentReportForm
          tenant={tenant}
          reportId={activeReport === 'new' ? undefined : activeReport}
          defaultType={defaultType}
          onClose={() => { setActiveReport(null); load(); }}
          onSaved={() => {}}
          embedded
        />
      ) : (
        <>
          {/* Sub-header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Retour"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
                  <p className="text-xs text-gray-400">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => newReport('near_miss')}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg font-medium"
                >
                  <Shield size={15} />
                  {t.nearMiss}
                </button>
                <button
                  onClick={() => newReport('accident')}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  <Plus size={15} />
                  {t.newReport}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {/* Day counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DaySafetyCounter
                label={t.daysAccident}
                lastDate={counter?.last_accident_date ?? null}
                recordDays={counter?.accident_record_days ?? 0}
                color="green"
                onReset={() => setResetConfirm('accident')}
              />
              <DaySafetyCounter
                label={t.daysNearMiss}
                lastDate={counter?.last_near_miss_date ?? null}
                recordDays={counter?.near_miss_record_days ?? 0}
                color="orange"
                onReset={() => setResetConfirm('near_miss')}
              />
            </div>

            {/* Reset confirm modal */}
            {resetConfirm && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                  <AlertTriangle className="text-red-500 mb-3" size={32} />
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{t.resetTitle}</h3>
                  <p className="text-sm text-gray-500 mb-5">
                    {t.resetBodyA}{resetConfirm === 'accident' ? t.accidentWord : t.nearMissWord}{t.resetBodyB}
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setResetConfirm(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => handleReset(resetConfirm)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium"
                    >
                      {t.confirmReset}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t.total, value: reports.length, color: 'text-gray-700' },
                { label: t.drafts, value: reports.filter(r => r.status === 'draft').length, color: 'text-yellow-600' },
                { label: t.submitted, value: reports.filter(r => r.status === 'submitted').length, color: 'text-green-600' },
                { label: t.highSev, value: reports.filter(r => (r.data?.severityLevel ?? 0) >= 4).length, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters + search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(['all', 'accident', 'near_miss', 'vehicle', 'property', 'medical'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filter === f ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {f === 'all' ? t.all : t.typeLabel[f]}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t.searchPh}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value as typeof severityFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Severite"
                >
                  <option value="all">{t.allSeverities}</option>
                  {[5, 4, 3, 2, 1].map(n => (
                    <option key={n} value={String(n)}>{n} · {t.severityLabel[n]}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Statut"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="draft">{t.statusLabel.draft}</option>
                  <option value="submitted">{t.statusLabel.submitted}</option>
                  <option value="closed">{t.statusLabel.closed}</option>
                </select>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={filtered.length === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="CSV"
                >
                  <Download size={15} />
                  CSV
                </button>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t.reportsCount(filtered.length)}</span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-sm text-gray-400">{t.loading}</div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertTriangle size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">{filtersActive ? t.noResult : t.empty}</p>
                  {!filtersActive && (
                    <button
                      onClick={() => newReport('accident')}
                      className="mt-4 text-sm text-red-600 hover:underline"
                    >
                      {t.createFirst}
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setActiveReport(r.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLOR[r.incident_type]}`}>
                        {TYPE_ICON[r.incident_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{r.report_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLOR[r.incident_type]}`}>
                            {t.typeLabel[r.incident_type]}
                          </span>
                          {r.data?.severityLevel && SEVERITY_COLOR[r.data.severityLevel] && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLOR[r.data.severityLevel]}`}>
                              {r.data.severityLevel} · {t.severityLabel[r.data.severityLevel]}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>
                            {t.statusLabel[r.status]}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {r.data?.incidentDate ?? ''}{r.data?.address ? ` · ${r.data.address}` : ''}
                          {r.data?.reportedBy ? ` · ${r.data.reportedBy}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 shrink-0">
                        <Clock size={13} />
                        <span className="text-xs">
                          {new Date(r.created_at).toLocaleDateString(t.locale, { month: 'short', day: 'numeric' })}
                        </span>
                        <ChevronRight size={15} className="ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
