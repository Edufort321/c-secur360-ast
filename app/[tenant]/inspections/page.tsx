'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ClipboardCheck, Plus, Search, Clock, CheckCircle, XCircle,
  AlertTriangle, AlertOctagon, Loader2, ChevronRight, Wrench,
  CalendarClock, TrendingUp, QrCode, SlidersHorizontal, Edit2, History,
  FileDown, X, ChevronDown,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { PortalHeader } from '@/components/PortalHeader';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';
import type { EquipmentRow } from '@/components/EquipmentForm';
import type { ExportOptions } from '@/lib/utils/exportInspectionsPDF';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ────────────────────────────────────────────────────────────────────

type LatestInsp = {
  id: string;
  equipment_id: string;
  inspection_number: string;
  inspection_date: string | null;
  overall_result: OverallResult | null;
  inspector_name: string | null;
  status: 'draft' | 'submitted' | 'closed';
  inspection_count: number;
};

type EquipmentCard = {
  equipment: EquipmentRow;
  latest: LatestInsp | null;
  daysLeft: number | null;
  urgency: 'overdue' | 'soon' | 'ok' | 'unknown';
  inspectionCount: number;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<OverallResult, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  conforme:     { label: 'Conforme',      color: 'text-green-700',  bg: 'bg-green-100 border-green-300',   Icon: CheckCircle },
  conditionnel: { label: 'Conditionnel',  color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300', Icon: AlertTriangle },
  non_conforme: { label: 'Non conforme',  color: 'text-red-700',    bg: 'bg-red-100 border-red-300',       Icon: XCircle },
  retrait:      { label: 'RETRAIT',       color: 'text-white',      bg: 'bg-red-600 border-red-700',       Icon: AlertOctagon },
  incomplete:   { label: 'En cours',      color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-300',     Icon: ClipboardCheck },
};

const URGENCY_BAR: Record<string, string> = {
  overdue: 'bg-red-500', soon: 'bg-amber-400', ok: 'bg-teal-500', unknown: 'bg-gray-200',
};
const URGENCY_TEXT: Record<string, string> = {
  overdue: 'text-red-600', soon: 'text-amber-600', ok: 'text-teal-600', unknown: 'text-gray-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcUrgency(eq: EquipmentRow, lastDate: string | null) {
  if (!eq.inspection_frequency || !lastDate) return { daysLeft: null, urgency: 'unknown' as const };
  const days = FREQUENCY_OPTIONS.find(f => f.value === eq.inspection_frequency)?.days;
  if (!days) return { daysLeft: null, urgency: 'unknown' as const };
  const daysLeft = Math.round((new Date(lastDate).getTime() + days * 86400_000 - Date.now()) / 86400_000);
  const soon = Math.max(1, Math.round(days * 0.2));
  const urgency = daysLeft < 0 ? 'overdue' : daysLeft <= soon ? 'soon' : 'ok';
  return { daysLeft, urgency } as { daysLeft: number; urgency: 'overdue' | 'soon' | 'ok' };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InspectionsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [cards,       setCards]       = useState<EquipmentCard[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [query,       setQuery]       = useState('');
  const [typeFilter,    setTypeFilter]    = useState<InspectionType | 'all'>('all');
  const [showFilters,   setShowFilters]   = useState(false);
  const [lightbox,      setLightbox]      = useState<string | null>(null);
  const [showExport,    setShowExport]    = useState(false);
  const [exportFilter,  setExportFilter]  = useState<InspectionType | 'all'>('all');
  const [exporting,     setExporting]     = useState(false);

  async function handleExport() {
    if (!supabase || exporting) return;
    setExporting(true);
    try {
      const { exportInspectionsPDF } = await import('@/lib/utils/exportInspectionsPDF');
      const toExport = exportFilter === 'all'
        ? cards
        : cards.filter(c => c.equipment.equipment_type === exportFilter);
      const exportTypeLabel = exportFilter === 'all'
        ? "Tous les types"
        : INSPECTION_TYPE_OPTIONS.find(o => o.value === exportFilter)?.label ?? exportFilter;
      const exportStats = {
        total:       toExport.length,
        overdue:     toExport.filter(c => c.urgency === 'overdue').length,
        soon:        toExport.filter(c => c.urgency === 'soon').length,
        nonConforme: toExport.filter(c => c.latest?.overall_result === 'non_conforme' || c.latest?.overall_result === 'retrait').length,
      };
      const { data: tn } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle();
      await exportInspectionsPDF({
        tenant,
        typeFilter:  exportFilter,
        typeLabel:   exportTypeLabel,
        cards:       toExport,
        supabase,
        stats:       exportStats,
        logoUrl:     tn?.logo_url || undefined,
      } as ExportOptions);
      setShowExport(false);
    } catch (err) {
      console.error('Export PDF failed:', err);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    (async () => {
      // 1. Tous les équipements du tenant
      const { data: eqs } = await supabase
        .from('equipment')
        .select('*')
        .eq('tenant_id', tenant)
        .order('updated_at', { ascending: false });

      if (!active) return;
      if (!eqs || eqs.length === 0) { setCards([]); setLoading(false); return; }

      // 2. Dernière inspection + compteur par equipment_id
      const ids = (eqs as EquipmentRow[]).map(e => e.id);
      const { data: insps } = await supabase
        .from('equipment_inspections')
        .select('id, equipment_id, inspection_number, inspection_date, overall_result, inspector_name, status')
        .in('equipment_id', ids)
        .eq('tenant_id', tenant)
        .order('inspection_date', { ascending: false });

      if (!active) return;

      // Map: equipmentId → latest inspection + count
      const latestMap: Record<string, LatestInsp> = {};
      const countMap: Record<string, number> = {};
      for (const r of (insps ?? []) as any[]) {
        countMap[r.equipment_id] = (countMap[r.equipment_id] ?? 0) + 1;
        if (!latestMap[r.equipment_id]) latestMap[r.equipment_id] = { ...r, inspection_count: 0 };
      }

      const built: EquipmentCard[] = (eqs as EquipmentRow[]).map(eq => {
        const latest = latestMap[eq.id] ?? null;
        const { daysLeft, urgency } = calcUrgency(eq, latest?.inspection_date ?? null);
        return { equipment: eq, latest, daysLeft, urgency, inspectionCount: countMap[eq.id] ?? 0 };
      });

      // Sort: overdue → soon → ok → unknown; then daysLeft asc
      const order: Record<string, number> = { overdue: 0, soon: 1, ok: 2, unknown: 3 };
      built.sort((a, b) => {
        const od = order[a.urgency] - order[b.urgency];
        if (od !== 0) return od;
        if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
        return 0;
      });

      if (active) { setCards(built); setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant]);

  const filtered = useMemo(() => {
    let list = cards;
    if (typeFilter !== 'all') list = list.filter(c => c.equipment.equipment_type === typeFilter);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c =>
      [c.equipment.equipment_name, c.equipment.equipment_serial,
       c.equipment.equipment_location, c.latest?.inspector_name,
       INSPECTION_TYPE_OPTIONS.find(o => o.value === c.equipment.equipment_type)?.label]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [cards, typeFilter, query]);

  const stats = useMemo(() => ({
    total:       cards.length,
    overdue:     cards.filter(c => c.urgency === 'overdue').length,
    soon:        cards.filter(c => c.urgency === 'soon').length,
    nonConforme: cards.filter(c => c.latest?.overall_result === 'non_conforme' || c.latest?.overall_result === 'retrait').length,
  }), [cards]);

  const presentTypes = useMemo(() =>
    [...new Set(cards.map(c => c.equipment.equipment_type))] as InspectionType[]
  , [cards]);

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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setExportFilter(typeFilter); setShowExport(true); }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <FileDown size={16} />
              Exporter PDF
            </button>
            <Link
              href={`/${tenant}/equipment/new`}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-4 py-2.5 font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
            >
              <Wrench size={16} />
              Nouvelle fiche
            </Link>
            <Link
              href={`/${tenant}/inspections/nouveau`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <Plus size={18} />
              Nouvelle inspection
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Équipements',   v: stats.total,       c: 'text-slate-900', Icon: Wrench },
            { k: 'En retard',     v: stats.overdue,     c: 'text-red-600',   Icon: AlertOctagon },
            { k: 'Bientôt dûs',   v: stats.soon,        c: 'text-amber-600', Icon: CalendarClock },
            { k: 'Non conformes', v: stats.nonConforme, c: 'text-red-700',   Icon: XCircle },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <s.Icon size={16} className={s.c} />
              <div className={`text-2xl font-bold mt-1 ${s.c}`}>{s.v}</div>
              <div className="text-sm text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Barre recherche + bouton filtres */}
        <div className="mb-4 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher (nom, série, emplacement…)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          {presentTypes.length > 0 && (
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition ${showFilters || typeFilter !== 'all' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal size={15} />
              {typeFilter !== 'all'
                ? INSPECTION_TYPE_OPTIONS.find(o => o.value === typeFilter)?.label ?? 'Filtre'
                : 'Filtres'}
            </button>
          )}
        </div>

        {/* Chips de type — panneau dépliable */}
        {showFilters && presentTypes.length > 0 && (
          <div className="mb-4 flex gap-1 flex-wrap rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <button
              onClick={() => { setTypeFilter('all'); setShowFilters(false); }}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${typeFilter === 'all' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Tous les types
            </button>
            {presentTypes.map(t => {
              const opt = INSPECTION_TYPE_OPTIONS.find(o => o.value === t);
              return opt ? (
                <button key={t} onClick={() => { setTypeFilter(t); setShowFilters(false); }}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${typeFilter === t ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {opt.label}
                </button>
              ) : null;
            })}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 className="animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Wrench size={26} />
            </div>
            <p className="font-medium text-slate-700">
              {query || typeFilter !== 'all' ? 'Aucun résultat pour ce filtre.' : 'Aucun équipement enregistré.'}
            </p>
            {!query && typeFilter === 'all' && (
              <Link href={`/${tenant}/equipment/new`}
                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700">
                <Plus size={18} /> Créer une fiche équipement
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(({ equipment: eq, latest, daysLeft, urgency, inspectionCount }) => {
              const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === eq.equipment_type)?.label ?? eq.equipment_type;
              const resultCfg = latest?.overall_result ? RESULT_CONFIG[latest.overall_result] : null;

              return (
                <div key={eq.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden"
                  style={{ borderColor: urgency === 'overdue' ? '#fca5a5' : urgency === 'soon' ? '#fcd34d' : '#e2e8f0' }}>
                  {/* Barre urgence */}
                  <div className={`h-1 ${URGENCY_BAR[urgency]}`} />

                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Photo — cliquable lightbox */}
                    {eq.equipment_photos?.[0] ? (
                      <button onClick={() => setLightbox(eq.equipment_photos[0])} className="shrink-0">
                        <img src={eq.equipment_photos[0]} alt=""
                          className="h-12 w-12 rounded-xl object-cover border border-gray-100" />
                      </button>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Wrench size={18} className="text-teal-500" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900">
                          {eq.equipment_name || typeLabel}
                        </span>
                        {eq.equipment_serial && (
                          <span className="text-xs text-slate-400 font-mono">#{eq.equipment_serial}</span>
                        )}
                        {resultCfg ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${resultCfg.bg} ${resultCfg.color}`}>
                            <resultCfg.Icon size={11} />{resultCfg.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <Clock size={10} /> Non inspecté
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500">
                        {typeLabel}
                        {eq.equipment_location ? ` · ${eq.equipment_location}` : ''}
                        {latest?.inspector_name ? ` · ${latest.inspector_name}` : ''}
                        {latest?.inspection_date ? ` · ${new Date(latest.inspection_date).toLocaleDateString('fr-CA')}` : ''}
                      </div>

                      {daysLeft !== null && (
                        <div className={`text-xs font-medium mt-0.5 ${URGENCY_TEXT[urgency]}`}>
                          {daysLeft < 0
                            ? `En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}`
                            : daysLeft === 0 ? 'Inspection due aujourd\'hui'
                            : `Prochaine dans ${daysLeft} j.`}
                        </div>
                      )}

                      {inspectionCount > 0 && (
                        <div className="text-xs text-teal-600 mt-0.5 flex items-center gap-1">
                          <TrendingUp size={11} /> {inspectionCount} inspection{inspectionCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {/* Inspecter */}
                      <Link href={`/${tenant}/equipment/${eq.id}/inspect`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg">
                        <Plus size={12} /> Inspecter
                      </Link>
                      {/* Modifier la fiche équipement */}
                      <Link href={`/${tenant}/equipment/${eq.id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg">
                        <Edit2 size={11} /> Modifier
                      </Link>
                      {latest && (<>
                        {/* QR — ouvre la dernière inspection sur l'onglet QR */}
                        <Link href={`/${tenant}/inspections/${latest.id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium rounded-lg">
                          <QrCode size={11} /> QR
                        </Link>
                        {/* Historique — page publique de l'équipement avec liste des inspections */}
                        <Link href={`/${tenant}/equipment/${eq.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium rounded-lg">
                          <History size={11} /> Historique
                        </Link>
                      </>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Modal export PDF */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowExport(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <FileDown size={18} className="text-teal-600" />
                Exporter en PDF
              </h2>
              <button onClick={() => setShowExport(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Filtre type */}
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Type d&apos;équipement
            </label>
            <div className="relative mb-4">
              <select
                value={exportFilter}
                onChange={e => setExportFilter(e.target.value as InspectionType | 'all')}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">Tous les types ({cards.length} équipements)</option>
                {presentTypes.map(t => {
                  const opt = INSPECTION_TYPE_OPTIONS.find(o => o.value === t);
                  const count = cards.filter(c => c.equipment.equipment_type === t).length;
                  return opt ? (
                    <option key={t} value={t}>{opt.label} ({count})</option>
                  ) : null;
                })}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Résumé */}
            <div className="mb-5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
              {(() => {
                const count = exportFilter === 'all'
                  ? cards.length
                  : cards.filter(c => c.equipment.equipment_type === exportFilter).length;
                return (
                  <span>
                    <span className="font-semibold text-slate-900">{count}</span> fiche{count > 1 ? 's' : ''} avec historique complet des inspections
                  </span>
                );
              })()}
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {exporting
                ? <><Loader2 size={16} className="animate-spin" /> Génération en cours…</>
                : <><FileDown size={16} /> Télécharger le PDF</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
