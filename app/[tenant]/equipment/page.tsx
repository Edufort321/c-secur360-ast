'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, Search, CheckCircle, XCircle, AlertTriangle, AlertOctagon,
  Clock, ClipboardCheck, ChevronRight, Edit2, QrCode, Loader2,
} from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';
import type { EquipmentRow } from '@/components/EquipmentForm';
import { getSitesTree, type SiteNode } from '@/lib/sites';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────

interface LatestInsp {
  id: string;
  equipment_id: string;
  inspection_number: string;
  inspection_date: string | null;
  overall_result: OverallResult | null;
  inspector_name: string | null;
  status: string;
}

type Urgency = 'overdue' | 'soon' | 'ok' | 'unknown';

interface EquipmentCard {
  equipment: EquipmentRow;
  latest: LatestInsp | null;
  daysLeft: number | null;
  urgency: Urgency;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const RESULT_ICON: Record<OverallResult, { Icon: React.ElementType; color: string }> = {
  conforme:     { Icon: CheckCircle,   color: 'text-green-600'  },
  conditionnel: { Icon: AlertTriangle, color: 'text-yellow-600' },
  non_conforme: { Icon: XCircle,       color: 'text-orange-600' },
  retrait:      { Icon: AlertOctagon,  color: 'text-red-700'    },
  incomplete:   { Icon: Clock,         color: 'text-gray-400'   },
};

const RESULT_LABEL_FR: Record<OverallResult, string> = {
  conforme: 'Conforme', conditionnel: 'Conditionnel', non_conforme: 'Non conforme',
  retrait: 'RETRAIT', incomplete: 'En cours',
};
const RESULT_LABEL_EN: Record<OverallResult, string> = {
  conforme: 'Compliant', conditionnel: 'Conditional', non_conforme: 'Non-conforming',
  retrait: 'WITHDRAWAL', incomplete: 'In progress',
};

const URGENCY_DOT: Record<Urgency, string> = {
  overdue: 'bg-red-500', soon: 'bg-amber-400', ok: 'bg-teal-500', unknown: 'bg-gray-300',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcUrgency(eq: EquipmentRow, lastDate: string | null): { daysLeft: number | null; urgency: Urgency } {
  if (!eq.inspection_frequency || !lastDate) return { daysLeft: null, urgency: 'unknown' };
  const days = FREQUENCY_OPTIONS.find(f => f.value === eq.inspection_frequency)?.days;
  if (!days) return { daysLeft: null, urgency: 'unknown' };
  const nextMs = new Date(lastDate).getTime() + days * 86400_000;
  const daysLeft = Math.round((nextMs - Date.now()) / 86400_000);
  const soonThresh = Math.max(1, Math.round(days * 0.2));
  return {
    daysLeft,
    urgency: daysLeft < 0 ? 'overdue' : daysLeft <= soonThresh ? 'soon' : 'ok',
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EquipmentListPage() {
  const { tenant } = useParams() as { tenant: string };
  const { lang } = useLanguage();
  const fr = lang === 'fr';

  const [cards,   setCards]   = useState<EquipmentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sites,   setSites]   = useState<SiteNode[]>([]);
  const [siteFilter, setSiteFilter] = useState('');

  useEffect(() => { if (tenant) getSitesTree(tenant).then(setSites); }, [tenant]);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const { data: eqs } = await sb.from('equipment').select('*').eq('tenant_id', tenant).order('updated_at', { ascending: false });
      if (!eqs || eqs.length === 0) { setCards([]); setLoading(false); return; }

      const ids = eqs.map((e: EquipmentRow) => e.id);
      const { data: insps } = await sb
        .from('equipment_inspections')
        .select('id, equipment_id, inspection_number, inspection_date, overall_result, inspector_name, status')
        .in('equipment_id', ids)
        .eq('tenant_id', tenant)
        .order('inspection_date', { ascending: false });

      const latestMap: Record<string, LatestInsp> = {};
      for (const row of (insps ?? []) as LatestInsp[]) {
        if (!latestMap[row.equipment_id]) latestMap[row.equipment_id] = row;
      }

      const built: EquipmentCard[] = (eqs as EquipmentRow[]).map(eq => {
        const latest = latestMap[eq.id] ?? null;
        const { daysLeft, urgency } = calcUrgency(eq, latest?.inspection_date ?? null);
        return { equipment: eq, latest, daysLeft, urgency };
      });

      const order: Record<Urgency, number> = { overdue: 0, soon: 1, ok: 2, unknown: 3 };
      built.sort((a, b) => {
        const od = order[a.urgency] - order[b.urgency];
        if (od !== 0) return od;
        if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
        return 0;
      });

      setCards(built);
      setLoading(false);
    })();
  }, [tenant]);

  const filtered = cards.filter(c => {
    if (siteFilter && c.equipment.site_id !== siteFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.equipment.equipment_name ?? '').toLowerCase().includes(q) ||
      (c.equipment.equipment_serial ?? '').toLowerCase().includes(q) ||
      (c.equipment.equipment_location ?? '').toLowerCase().includes(q) ||
      c.equipment.equipment_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />

      {/* Toolbar */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher un équipement…' : 'Search equipment…'}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          {sites.length > 0 && (
            <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}
              className="shrink-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400">
              <option value="">{fr ? 'Tous les sites' : 'All sites'}</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <Link href={`/${tenant}/equipment/new`}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shrink-0">
            <Plus size={15} />
            {fr ? 'Ajouter' : 'Add'}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <ClipboardCheck size={48} className="mx-auto text-gray-200" />
            <p className="text-gray-400 text-sm">
              {search ? (fr ? 'Aucun résultat.' : 'No results.') : (fr ? 'Aucun équipement enregistré.' : 'No equipment registered.')}
            </p>
            {!search && (
              <Link href={`/${tenant}/equipment/new`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg">
                <Plus size={14} /> {fr ? 'Ajouter un équipement' : 'Add equipment'}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ equipment: eq, latest, daysLeft, urgency }) => {
              const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === eq.equipment_type)?.label ?? eq.equipment_type;
              const resultCfg = latest?.overall_result ? RESULT_ICON[latest.overall_result] : RESULT_ICON.incomplete;
              const resultLabel = latest?.overall_result
                ? (fr ? RESULT_LABEL_FR[latest.overall_result] : RESULT_LABEL_EN[latest.overall_result])
                : (fr ? 'Non inspecté' : 'Not inspected');

              return (
                <div key={eq.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Urgency bar */}
                  <div className={`h-1 ${URGENCY_DOT[urgency]}`} />

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{typeLabel}</p>
                        {eq.equipment_name && <p className="text-xs text-gray-600 truncate">{eq.equipment_name}</p>}
                        {eq.equipment_serial && <p className="text-xs text-gray-400">#{eq.equipment_serial}</p>}
                        {eq.equipment_location && <p className="text-xs text-gray-400 truncate">{eq.equipment_location}</p>}
                      </div>
                      {eq.equipment_photos?.[0] && (
                        <img src={eq.equipment_photos[0]} alt="" className="h-12 w-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                      )}
                    </div>

                    {/* Result badge */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <resultCfg.Icon size={14} className={resultCfg.color} />
                      <span className="text-xs font-medium text-gray-700">{resultLabel}</span>
                      {latest?.inspection_date && <span className="text-xs text-gray-400">· {latest.inspection_date}</span>}
                    </div>

                    {/* Urgency */}
                    {daysLeft !== null && (
                      <div className={`text-xs font-medium mb-3 ${
                        urgency === 'overdue' ? 'text-red-600' : urgency === 'soon' ? 'text-amber-600' : 'text-teal-600'
                      }`}>
                        {daysLeft < 0
                          ? (fr ? `En retard de ${Math.abs(daysLeft)}j` : `${Math.abs(daysLeft)}d overdue`)
                          : daysLeft === 0
                            ? (fr ? 'Inspection aujourd\'hui' : 'Inspection today')
                            : (fr ? `Dans ${daysLeft} jour(s)` : `In ${daysLeft} day(s)`)
                        }
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link href={`/${tenant}/equipment/${eq.id}`}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600">
                        <QrCode size={12} /> {fr ? 'Voir' : 'View'}
                      </Link>
                      <Link href={`/${tenant}/equipment/${eq.id}/inspect`}
                        className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium ml-auto">
                        <Plus size={12} /> {fr ? 'Inspecter' : 'Inspect'}
                      </Link>
                      <Link href={`/${tenant}/equipment/${eq.id}/edit`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                        <Edit2 size={12} /> {fr ? 'Modifier' : 'Edit'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
