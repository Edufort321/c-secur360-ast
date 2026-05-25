'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Plus, Search, ClipboardCheck, ChevronRight,
  AlertOctagon, AlertTriangle, CheckCircle, Clock, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';
import type { EquipmentRow } from '@/components/EquipmentForm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface LatestInsp {
  equipment_id: string;
  inspection_date: string | null;
  overall_result: OverallResult | null;
}

const RESULT_ICON: Record<OverallResult, { Icon: React.ElementType; color: string }> = {
  conforme:     { Icon: CheckCircle,   color: 'text-green-600'  },
  conditionnel: { Icon: AlertTriangle, color: 'text-yellow-600' },
  non_conforme: { Icon: AlertOctagon,  color: 'text-orange-600' },
  retrait:      { Icon: AlertOctagon,  color: 'text-red-700'    },
  incomplete:   { Icon: Clock,         color: 'text-gray-400'   },
};

export default function NouvelleInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  const tenant = params.tenant as string;

  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [latestMap, setLatestMap] = useState<Record<string, LatestInsp>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!sb) { setLoading(false); return; }
    Promise.all([
      sb.from('equipment').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }),
      sb.from('equipment_inspections')
        .select('equipment_id, inspection_date, overall_result')
        .eq('tenant_id', tenant)
        .eq('status', 'submitted')
        .order('inspection_date', { ascending: false }),
    ]).then(([eqRes, inspRes]) => {
      const eqRows = (eqRes.data ?? []) as EquipmentRow[];
      setEquipment(eqRows);

      // Keep only most-recent inspection per equipment
      const map: Record<string, LatestInsp> = {};
      for (const r of (inspRes.data ?? []) as LatestInsp[]) {
        if (r.equipment_id && !map[r.equipment_id]) map[r.equipment_id] = r;
      }
      setLatestMap(map);
      setLoading(false);
    });
  }, [tenant]);

  const filtered = equipment.filter(eq => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [eq.equipment_name, eq.equipment_serial, eq.equipment_location,
      INSPECTION_TYPE_OPTIONS.find(o => o.value === eq.equipment_type)?.label]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  });

  function daysInfo(eq: EquipmentRow): { label: string; color: string } | null {
    const latest = latestMap[eq.id];
    if (!eq.inspection_frequency || !latest?.inspection_date) return null;
    const days = FREQUENCY_OPTIONS.find(f => f.value === eq.inspection_frequency)?.days;
    if (!days) return null;
    const daysLeft = Math.round((new Date(latest.inspection_date).getTime() + days * 86400_000 - Date.now()) / 86400_000);
    if (daysLeft < 0) return { label: fr ? `En retard de ${Math.abs(daysLeft)}j` : `${Math.abs(daysLeft)}d overdue`, color: 'text-red-600' };
    if (daysLeft <= Math.max(1, Math.round(days * 0.2))) return { label: fr ? `Dans ${daysLeft}j` : `In ${daysLeft}d`, color: 'text-amber-600' };
    return { label: fr ? `Dans ${daysLeft}j` : `In ${daysLeft}d`, color: 'text-teal-600' };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />

      {/* Header */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/${tenant}/inspections`)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            {fr ? 'Retour' : 'Back'}
          </button>
          <h1 className="text-sm font-semibold text-gray-800 flex-1">
            {fr ? 'Nouvelle inspection — sélectionner un équipement' : 'New inspection — select equipment'}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={fr ? 'Rechercher un équipement…' : 'Search equipment…'}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Add new equipment shortcut */}
        <Link
          href={`/${tenant}/equipment/new?redirect=inspect`}
          className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
            <Plus size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-800">{fr ? 'Créer une nouvelle fiche équipement' : 'Create new equipment sheet'}</p>
            <p className="text-xs text-teal-600">{fr ? 'Puis démarrer l\'inspection' : 'Then start inspection'}</p>
          </div>
          <ChevronRight size={16} className="text-teal-400 ml-auto" />
        </Link>

        {/* Equipment list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {fr ? 'Aucun équipement enregistré.' : 'No equipment registered.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(eq => {
              const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === eq.equipment_type)?.label ?? eq.equipment_type;
              const latest = latestMap[eq.id];
              const ri = latest?.overall_result ? RESULT_ICON[latest.overall_result] : null;
              const di = daysInfo(eq);

              return (
                <button
                  key={eq.id}
                  onClick={() => router.push(`/${tenant}/equipment/${eq.id}/inspect`)}
                  className="w-full flex items-center gap-4 px-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-teal-300 hover:bg-teal-50 transition-colors text-left"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={18} className="text-teal-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {eq.equipment_name || typeLabel}
                      </span>
                      {eq.equipment_serial && (
                        <span className="text-xs text-gray-400 font-mono">#{eq.equipment_serial}</span>
                      )}
                      {ri && (
                        <ri.Icon size={14} className={ri.color} />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {typeLabel}
                      {eq.equipment_location ? ` · ${eq.equipment_location}` : ''}
                      {eq.province ? ` · ${eq.province}` : ''}
                    </div>
                    {di && (
                      <div className={`text-xs font-medium mt-0.5 ${di.color}`}>{di.label}</div>
                    )}
                    {!latest && (
                      <div className="text-xs text-gray-400 mt-0.5 italic">
                        {fr ? 'Aucune inspection' : 'No inspection yet'}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg">
                    <ClipboardCheck size={13} />
                    {fr ? 'Inspecter' : 'Inspect'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
