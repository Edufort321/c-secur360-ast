'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  CheckCircle, XCircle, AlertTriangle, AlertOctagon,
  Clock, ClipboardCheck, Plus, ChevronRight, Loader2, Edit2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';
import type { EquipmentRow } from '@/components/EquipmentForm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────

interface InspRow {
  id: string;
  inspection_number: string;
  inspection_date: string | null;
  overall_result: OverallResult | null;
  inspector_name: string | null;
  status: string;
  non_conformities: { id: string; label: string; critical: boolean; withdrawal: boolean }[];
  corrective_actions: Record<string, { note: string; deadline: string; assigned: string; usable: boolean }>;
  item_notes: Record<string, string>;
  notes: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcNext(eq: EquipmentRow, lastDate: string | null): { daysLeft: number; label: string } | null {
  if (!eq.inspection_frequency || !lastDate) return null;
  const days = FREQUENCY_OPTIONS.find(f => f.value === eq.inspection_frequency)?.days;
  if (!days) return null;
  const nextMs = new Date(lastDate).getTime() + days * 86400_000;
  const daysLeft = Math.round((nextMs - Date.now()) / 86400_000);
  const label = new Date(nextMs).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  return { daysLeft, label };
}

const RESULT_CONFIG = {
  conforme:     { bg: 'bg-green-600',  text: 'text-white', Icon: CheckCircle,   titleFr: 'CONFORME ✓',         titleEn: 'COMPLIANT ✓' },
  conditionnel: { bg: 'bg-yellow-500', text: 'text-white', Icon: AlertTriangle, titleFr: 'CONDITIONNEL',       titleEn: 'CONDITIONAL' },
  non_conforme: { bg: 'bg-orange-600', text: 'text-white', Icon: XCircle,       titleFr: 'NON CONFORME',       titleEn: 'NON-CONFORMING' },
  retrait:      { bg: 'bg-red-700',    text: 'text-white', Icon: AlertOctagon,  titleFr: 'RETRAIT IMMÉDIAT ⚠', titleEn: 'IMMEDIATE WITHDRAWAL ⚠' },
  incomplete:   { bg: 'bg-gray-400',   text: 'text-white', Icon: Clock,         titleFr: 'EN COURS',           titleEn: 'IN PROGRESS' },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EquipmentPublicPage() {
  const { tenant, id } = useParams() as { tenant: string; id: string };
  const { lang } = useLanguage();
  const fr = lang === 'fr';

  const [equipment,  setEquipment]  = useState<EquipmentRow | null>(null);
  const [inspections, setInspections] = useState<InspRow[]>([]);
  const [logoUrl,    setLogoUrl]    = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [lightbox,   setLightbox]   = useState<string | null>(null);
  const [isTenant,   setIsTenant]   = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user?.tenantId === tenant) setIsTenant(true); })
      .catch(() => {});
  }, [tenant]);

  useEffect(() => {
    if (!sb) return;
    Promise.all([
      sb.from('equipment').select('*').eq('id', id).maybeSingle(),
      sb.from('equipment_inspections')
        .select('id, inspection_number, inspection_date, overall_result, inspector_name, status, non_conformities, corrective_actions, item_notes, notes')
        .eq('equipment_id', id)
        .order('inspection_date', { ascending: false })
        .limit(20),
      sb.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle(),
    ]).then(([eqRes, insRes, logoRes]) => {
      setEquipment(eqRes.data as EquipmentRow ?? null);
      setInspections((insRes.data ?? []) as InspRow[]);
      if (logoRes.data?.logo_url) setLogoUrl(logoRes.data.logo_url);
      setLoading(false);
    });
  }, [id, tenant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{fr ? 'Équipement introuvable.' : 'Equipment not found.'}</p>
      </div>
    );
  }

  const latest = inspections[0] ?? null;
  const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === equipment.equipment_type)?.label ?? equipment.equipment_type;
  const next = calcNext(equipment, latest?.inspection_date ?? null);
  const resultCfg = latest?.overall_result ? RESULT_CONFIG[latest.overall_result] : RESULT_CONFIG.incomplete;
  const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === equipment.inspection_frequency)?.[fr ? 'label' : 'labelEn'] ?? '';

  const ncs = latest?.non_conformities ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Public header */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/${tenant}/inspections`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white shrink-0">
            <ChevronRight size={14} className="rotate-180" />
            {fr ? 'Liste' : 'List'}
          </Link>
          <img src={logoUrl || '/c-secur360-logo.png'} alt="Logo" className="h-8 w-auto object-contain" />
        </div>
        <Link href={`/${tenant}/equipment/${id}/inspect`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shrink-0">
          <Plus size={14} />
          {fr ? 'Inspecter' : 'Inspect'}
        </Link>
      </header>

      {/* Status banner */}
      <div className={`${resultCfg.bg} ${resultCfg.text} px-4 py-4 text-center`}>
        <div className="flex items-center justify-center gap-2 text-xl font-extrabold tracking-wide">
          <resultCfg.Icon size={22} />
          {fr ? resultCfg.titleFr : resultCfg.titleEn}
        </div>
        {next && (
          <p className="mt-1 text-sm opacity-90">
            {next.daysLeft < 0
              ? (fr ? `En retard de ${Math.abs(next.daysLeft)} jour(s)` : `${Math.abs(next.daysLeft)} day(s) overdue`)
              : next.daysLeft === 0
                ? (fr ? 'Prochaine inspection aujourd\'hui' : 'Next inspection today')
                : (fr ? `Prochaine inspection le ${next.label}` : `Next inspection on ${next.label}`)
            }
          </p>
        )}
        {!latest && <p className="mt-1 text-sm opacity-80">{fr ? 'Aucune inspection enregistrée' : 'No inspection recorded'}</p>}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Equipment info card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardCheck size={15} className="text-teal-600" />
              {fr ? 'Fiche équipement' : 'Equipment sheet'}
            </span>
            {isTenant && (
              <Link href={`/${tenant}/equipment/${id}/edit`}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800">
                <Edit2 size={12} /> {fr ? 'Modifier' : 'Edit'}
              </Link>
            )}
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{typeLabel}{equipment.equipment_name ? ` — ${equipment.equipment_name}` : ''}</p>
                {equipment.equipment_serial && <p className="text-xs text-gray-500">#{equipment.equipment_serial}</p>}
                {equipment.equipment_location && <p className="text-xs text-gray-400">{equipment.equipment_location}</p>}
              </div>
              {freqLabel && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">{freqLabel}</span>
              )}
            </div>
            {equipment.equipment_photos && equipment.equipment_photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {equipment.equipment_photos.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover border border-gray-200 cursor-pointer"
                    onClick={() => setLightbox(src)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last inspection NCs */}
        {ncs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-100">
              <span className="text-sm font-semibold text-red-700">
                {fr ? `Non-conformités (${ncs.length})` : `Non-conformities (${ncs.length})`}
              </span>
              {latest?.inspection_date && (
                <span className="ml-2 text-xs text-red-400">· {latest.inspection_date}</span>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {ncs.map(nc => {
                const ca = latest?.corrective_actions?.[nc.id];
                return (
                  <div key={nc.id} className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      {nc.withdrawal
                        ? <AlertOctagon size={14} className="text-red-600 mt-0.5 shrink-0" />
                        : nc.critical
                          ? <XCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                          : <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{nc.label}</p>
                        {latest?.item_notes?.[nc.id] && (
                          <p className="text-xs text-gray-500 mt-0.5 italic">"{latest.item_notes[nc.id]}"</p>
                        )}
                        {ca?.note && (
                          <p className="text-xs text-teal-700 mt-1 font-medium">
                            {fr ? 'Action : ' : 'Action: '}{ca.note}
                            {ca.deadline && ` · ${fr ? 'Échéance' : 'Due'}: ${ca.deadline}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inspection history */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {fr ? 'Historique des inspections' : 'Inspection history'}
            </span>
            <Link href={`/${tenant}/equipment/${id}/inspect`}
              className="text-xs text-teal-600 hover:text-teal-800 font-medium">
              + {fr ? 'Nouvelle' : 'New'}
            </Link>
          </div>

          {inspections.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              {fr ? 'Aucune inspection pour cet équipement.' : 'No inspections for this equipment.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inspections.map(row => {
                const cfg = row.overall_result ? RESULT_CONFIG[row.overall_result] : RESULT_CONFIG.incomplete;
                return (
                  <Link key={row.id} href={`/${tenant}/inspections/${row.id}/edit`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <cfg.Icon size={15} className={row.overall_result === 'conforme' ? 'text-green-600' : row.overall_result === 'retrait' ? 'text-red-700' : 'text-yellow-600'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{row.inspection_number}</span>
                        {row.overall_result && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.text}`}>
                            {fr ? RESULT_CONFIG[row.overall_result]?.titleFr : RESULT_CONFIG[row.overall_result]?.titleEn}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {row.inspection_date && <span>{row.inspection_date}</span>}
                        {row.inspector_name && <span> · {row.inspector_name}</span>}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-200 mt-8">
        <img src={logoUrl || '/c-secur360-logo.png'} alt="Logo" className="h-8 mx-auto mb-1 opacity-60" />
        c-secur360.ca
      </footer>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
