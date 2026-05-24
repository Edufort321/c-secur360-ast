'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Plus, AlertTriangle, Shield, Truck, Building2,
  Activity, Clock, Filter, Search, ChevronRight,
} from 'lucide-react';
import IncidentReportForm, { DaySafetyCounter, type IncidentType, type DayCounter } from '../../../components/IncidentReport';

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
  data: { incidentDate?: string; reportedBy?: string; description?: string; address?: string };
}

const TYPE_LABEL: Record<IncidentType, string> = {
  accident:  'Accident de travail',
  near_miss: 'Passé proche',
  vehicle:   'Accident de véhicule',
  property:  'Dommages matériels',
  medical:   'Maladie professionnelle',
};

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

const STATUS_LABEL = { draft: 'Brouillon', submitted: 'Soumis', closed: 'Fermé' };
const STATUS_COLOR = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-green-100 text-green-700',
  closed:    'bg-slate-100 text-slate-600',
};

type FilterType = 'all' | IncidentType;

export default function AccidentsPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [reports, setReports] = useState<IncidentRow[]>([]);
  const [counter, setCounter] = useState<DayCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
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

  function openReport(id: string) {
    setActiveReport(id);
  }

  if (activeReport !== null) {
    return (
      <IncidentReportForm
        tenant={tenant}
        reportId={activeReport === 'new' ? undefined : activeReport}
        defaultType={defaultType}
        onClose={() => { setActiveReport(null); load(); }}
        onSaved={() => {}}
      />
    );
  }

  const filtered = reports.filter(r => {
    if (filter !== 'all' && r.incident_type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.report_number.toLowerCase().includes(q) ||
        TYPE_LABEL[r.incident_type].toLowerCase().includes(q) ||
        (r.data?.description ?? '').toLowerCase().includes(q) ||
        (r.data?.reportedBy ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/${tenant}/dashboard`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Incidents & Accidents</h1>
              <p className="text-xs text-gray-400">Déclarations, analyses et décompte sécuritaire</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => newReport('near_miss')}
              className="flex items-center gap-1.5 text-sm px-3 py-2 border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg font-medium"
            >
              <Shield size={15} />
              Passé proche
            </button>
            <button
              onClick={() => newReport('accident')}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              <Plus size={15} />
              Nouveau rapport
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Day counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DaySafetyCounter
            label="jours sans accident"
            lastDate={counter?.last_accident_date ?? null}
            recordDays={counter?.accident_record_days ?? 0}
            color="green"
            onReset={() => setResetConfirm('accident')}
          />
          <DaySafetyCounter
            label="jours sans passé proche"
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
              <h3 className="text-base font-semibold text-gray-900 mb-2">Réinitialiser le compteur</h3>
              <p className="text-sm text-gray-500 mb-5">
                Ceci enregistre aujourd'hui comme date du dernier {resetConfirm === 'accident' ? 'accident' : 'passé proche'} et remet le compteur à zéro. Le record précédent sera conservé.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setResetConfirm(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">
                  Annuler
                </button>
                <button
                  onClick={() => handleReset(resetConfirm)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium"
                >
                  Confirmer la réinitialisation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: reports.length, color: 'text-gray-700' },
            { label: 'Brouillons', value: reports.filter(r => r.status === 'draft').length, color: 'text-yellow-600' },
            { label: 'Soumis', value: reports.filter(r => r.status === 'submitted').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 mb-3">
            {(['all', 'accident', 'near_miss', 'vehicle', 'property', 'medical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === f ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {f === 'all' ? 'Tous' : TYPE_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par numéro, description…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {filtered.length} rapport{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <AlertTriangle size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">
                {search || filter !== 'all' ? 'Aucun résultat' : 'Aucun rapport enregistré'}
              </p>
              {!search && filter === 'all' && (
                <button
                  onClick={() => newReport('accident')}
                  className="mt-4 text-sm text-red-600 hover:underline"
                >
                  Créer le premier rapport
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(r => (
                <button
                  key={r.id}
                  onClick={() => openReport(r.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLOR[r.incident_type]}`}>
                    {TYPE_ICON[r.incident_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{r.report_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLOR[r.incident_type]}`}>
                        {TYPE_LABEL[r.incident_type]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
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
                      {new Date(r.created_at).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                    </span>
                    <ChevronRight size={15} className="ml-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
