'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Plus, Shield, AlertTriangle, Clock, Search, ChevronRight,
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
  data: { incidentDate?: string; reportedBy?: string; description?: string; address?: string };
}

const STATUS_LABEL = { draft: 'Brouillon', submitted: 'Soumis', closed: 'Fermé' };
const STATUS_COLOR = {
  draft:     'bg-gray-100 text-gray-600',
  submitted: 'bg-green-100 text-green-700',
  closed:    'bg-slate-100 text-slate-600',
};

export default function NearMissPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [reports, setReports] = useState<IncidentRow[]>([]);
  const [counter, setCounter] = useState<DayCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeReport, setActiveReport] = useState<string | null | 'new'>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const [{ data: rows }, { data: cnt }] = await Promise.all([
      supabase.from('incident_reports').select('*')
        .eq('tenant_id', tenant)
        .eq('incident_type', 'near_miss')
        .order('created_at', { ascending: false }),
      supabase.from('incident_day_counters').select('*').eq('tenant_id', tenant).single(),
    ]);
    setReports((rows as IncidentRow[]) ?? []);
    setCounter(cnt as DayCounter | null);
    setLoading(false);
  }, [tenant]);

  useEffect(() => { load(); }, [load]);

  async function handleReset() {
    if (!supabase) return;
    const today = new Date().toISOString().split('T')[0];
    if (counter) {
      const lastDate = counter.last_near_miss_date;
      const prevRecord = counter.near_miss_record_days ?? 0;
      const daysSince = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 0;
      await supabase.from('incident_day_counters').update({
        last_near_miss_date: today,
        near_miss_record_days: Math.max(prevRecord, daysSince),
        updated_at: new Date().toISOString(),
      }).eq('tenant_id', tenant);
    } else {
      await supabase.from('incident_day_counters').insert({
        tenant_id: tenant,
        last_near_miss_date: today,
        near_miss_record_days: 0,
        updated_at: new Date().toISOString(),
      });
    }
    setResetConfirm(false);
    load();
  }

  if (activeReport !== null) {
    return (
      <IncidentReportForm
        tenant={tenant}
        reportId={activeReport === 'new' ? undefined : activeReport}
        defaultType="near_miss"
        onClose={() => { setActiveReport(null); load(); }}
        onSaved={() => {}}
      />
    );
  }

  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.report_number.toLowerCase().includes(q) ||
      (r.data?.description ?? '').toLowerCase().includes(q) ||
      (r.data?.reportedBy ?? '').toLowerCase().includes(q)
    );
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
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield size={22} className="text-orange-500" />
                Passés proches
              </h1>
              <p className="text-xs text-gray-400">Signalement d'événements sans blessure</p>
            </div>
          </div>
          <button
            onClick={() => setActiveReport('new')}
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
          >
            <Plus size={15} />
            Nouveau signalement
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Day counter */}
        <div className="max-w-xs">
          <DaySafetyCounter
            label="jours sans passé proche"
            lastDate={counter?.last_near_miss_date ?? null}
            recordDays={counter?.near_miss_record_days ?? 0}
            color="orange"
            onReset={() => setResetConfirm(true)}
          />
        </div>

        {/* Infobox */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
          <Shield size={18} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-sm text-orange-800">
            <strong>Pourquoi signaler les passés proches ?</strong>
            <p className="mt-1 text-xs text-orange-700">
              Pour chaque accident grave, on estime qu'il y a 29 incidents mineurs et 300 situations dangereuses non signalées (Triangle de Heinrich). Signaler les passés proches permet de corriger les risques <em>avant</em> qu'un accident survienne.
            </p>
          </div>
        </div>

        {/* Reset confirm */}
        {resetConfirm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <Shield className="text-orange-500 mb-3" size={32} />
              <h3 className="text-base font-semibold text-gray-900 mb-2">Réinitialiser le compteur</h3>
              <p className="text-sm text-gray-500 mb-5">
                Ceci enregistre aujourd'hui comme date du dernier passé proche et remet le compteur à zéro. Le record précédent sera conservé.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setResetConfirm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">
                  Annuler
                </button>
                <button onClick={handleReset} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg font-medium">
                  Confirmer
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

        {/* Search + list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Shield size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">
                {search ? 'Aucun résultat' : 'Aucun signalement enregistré'}
              </p>
              {!search && (
                <button
                  onClick={() => setActiveReport('new')}
                  className="mt-4 text-sm text-orange-600 hover:underline"
                >
                  Créer le premier signalement
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-orange-100 text-orange-600">
                    <Shield size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{r.report_number}</span>
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
