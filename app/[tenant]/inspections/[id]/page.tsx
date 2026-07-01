'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ClipboardCheck, CheckCircle, XCircle, AlertTriangle, AlertOctagon,
  Clock, CalendarCheck, ChevronRight, Loader2, Edit2, Plus,
} from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type OverallResult, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ─────────────────────────────────────────────────────────────────

interface CorrectiveAction { note: string; deadline: string; assigned: string; usable: boolean; }
interface NC { id: string; label: string; critical: boolean; withdrawal: boolean; }

interface InspRow {
  id: string;
  inspection_number: string;
  equipment_type: InspectionType;
  equipment_name: string | null;
  equipment_serial: string | null;
  equipment_location: string | null;
  equipment_photo: string | null;
  equipment_photos: string[] | null;
  inspector_name: string | null;
  inspection_date: string | null;
  inspection_frequency: InspectionFrequency | null;
  status: string;
  overall_result: OverallResult | null;
  non_conformities: NC[];
  corrective_actions: Record<string, CorrectiveAction>;
  item_notes: Record<string, string>;
  item_photos: Record<string, string>;
  notes: string | null;
  usable_with_conditions: boolean;
  usable_until_date: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function calcDaysLeft(row: InspRow): { daysLeft: number; nextDueDate: string } | null {
  if (!row.inspection_frequency || !row.inspection_date) return null;
  const days = FREQUENCY_OPTIONS.find(f => f.value === row.inspection_frequency)?.days;
  if (!days) return null;
  const nextDueMs = new Date(row.inspection_date).getTime() + days * 86400_000;
  const nextDueDate = new Date(nextDueMs).toISOString().split('T')[0];
  const daysLeft = Math.round((nextDueMs - Date.now()) / 86400_000);
  return { daysLeft, nextDueDate };
}

// ─── Urgency banner config ──────────────────────────────────────────────────

type Urgency = 'retard' | 'bientot' | 'ok' | 'unknown';

function getUrgency(daysLeft: number | null): Urgency {
  if (daysLeft === null) return 'unknown';
  if (daysLeft < 0) return 'retard';
  const freq = 30; // fallback threshold
  if (daysLeft <= Math.max(1, Math.round(freq * 0.2))) return 'bientot';
  return 'ok';
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function InspectionPublicPage() {
  const params = useParams();
  const tenant  = params.tenant as string;
  const id      = params.id as string;
  const { lang } = useLanguage();

  const [row,      setRow]     = useState<InspRow | null>(null);
  const [loading,  setLoading] = useState(true);
  const [logoUrl,  setLogoUrl] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fr = lang === 'fr';

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('equipment_inspections').select('*').eq('tenant_id', tenant).eq('id', id).maybeSingle()
      .then(({ data }) => { setRow(data as InspRow ?? null); setLoading(false); });
  }, [id, tenant]);

  useEffect(() => {
    if (!supabase || !tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PortalHeader tenant={tenant} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PortalHeader tenant={tenant} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4">
          <ClipboardCheck size={48} className="text-gray-300" />
          <p className="text-lg font-semibold text-gray-600">
            {fr ? 'Inspection introuvable.' : 'Inspection not found.'}
          </p>
          <Link href={`/${tenant}/inspections`}
            className="text-sm text-teal-600 underline">
            {fr ? 'Retour aux inspections' : 'Back to inspections'}
          </Link>
        </div>
      </div>
    );
  }

  const calcResult = calcDaysLeft(row);
  const daysLeft   = calcResult?.daysLeft ?? null;
  const nextDueDate = calcResult?.nextDueDate ?? null;
  const urgency    = getUrgency(daysLeft);
  const result   = row.overall_result;
  const ncs      = row.non_conformities ?? [];
  const typeLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === row.equipment_type)?.label ?? row.equipment_type;
  const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === row.inspection_frequency)?.label;
  const photos    = row.equipment_photos?.length ? row.equipment_photos : row.equipment_photo ? [row.equipment_photo] : [];

  // ── Banner ─────────────────────────────────────────────────────────────
  type Banner = { bg: string; text: string; Icon: React.ElementType; title: string; sub?: string };

  let banner: Banner;
  if (urgency === 'retard') {
    banner = {
      bg: 'bg-red-600',
      text: 'text-white',
      Icon: Clock,
      title: fr
        ? `INSPECTION EN RETARD — ${Math.abs(daysLeft!)} jour${Math.abs(daysLeft!) > 1 ? 's' : ''}`
        : `OVERDUE — ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) > 1 ? 's' : ''}`,
      sub: fr ? 'Une nouvelle inspection est requise immédiatement.' : 'A new inspection is immediately required.',
    };
  } else if (result === 'retrait') {
    banner = {
      bg: 'bg-red-700',
      text: 'text-white',
      Icon: AlertOctagon,
      title: fr ? 'RETRAIT IMMÉDIAT' : 'IMMEDIATE WITHDRAWAL',
      sub: fr ? 'Cet équipement doit être retiré du service.' : 'This equipment must be taken out of service.',
    };
  } else if (result === 'non_conforme') {
    banner = {
      bg: 'bg-orange-500',
      text: 'text-white',
      Icon: XCircle,
      title: fr ? 'NON CONFORME' : 'NON-CONFORMING',
      sub: fr ? 'Des correctifs sont requis.' : 'Corrective actions are required.',
    };
  } else if (result === 'conditionnel') {
    banner = {
      bg: 'bg-amber-400',
      text: 'text-amber-900',
      Icon: AlertTriangle,
      title: fr ? 'CONDITIONNEL' : 'CONDITIONAL',
      sub: fr ? 'Utilisation sous conditions — voir les notes.' : 'Use under conditions — see notes.',
    };
  } else if (result === 'conforme') {
    const nextLabel = nextDueDate
      ? new Date(nextDueDate).toLocaleDateString(fr ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
      : null;
    banner = {
      bg: 'bg-green-600',
      text: 'text-white',
      Icon: CheckCircle,
      title: fr ? 'CONFORME ✓' : 'COMPLIANT ✓',
      sub: nextLabel
        ? (fr ? `Prochaine inspection le ${nextLabel}` : `Next inspection on ${nextLabel}`)
        : undefined,
    };
  } else {
    banner = {
      bg: 'bg-gray-400',
      text: 'text-white',
      Icon: ClipboardCheck,
      title: fr ? 'INSPECTION EN COURS' : 'INSPECTION IN PROGRESS',
    };
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* ── Urgency / result banner ───────────────────────────────────── */}
        <div className={`${banner.bg} ${banner.text} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
          <banner.Icon size={36} className="shrink-0 opacity-90" />
          <div>
            <p className="text-lg font-black tracking-wide leading-tight">{banner.title}</p>
            {banner.sub && <p className="text-sm mt-0.5 opacity-90">{banner.sub}</p>}
          </div>
        </div>

        {/* ── Equipment card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Photos */}
          {photos.length > 0 && (
            <div className={`grid gap-1 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {photos.slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt={`Photo ${i + 1}`}
                  className="w-full h-36 object-cover cursor-pointer"
                  onClick={() => setLightbox(src)} />
              ))}
            </div>
          )}
          <div className="p-5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{typeLabel}</p>
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {row.equipment_name || typeLabel}
                </p>
                {row.equipment_serial && (
                  <p className="text-sm font-mono text-slate-500 mt-0.5">{row.equipment_serial}</p>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400 shrink-0 pt-1">{row.inspection_number}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {row.equipment_location && (
                <span>📍 {row.equipment_location}</span>
              )}
              {row.inspection_date && (
                <span className="flex items-center gap-1">
                  <CalendarCheck size={12} />
                  {new Date(row.inspection_date).toLocaleDateString(fr ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {row.inspector_name && (
                <span>👤 {row.inspector_name}</span>
              )}
              {freqLabel && (
                <span>🔄 {freqLabel}</span>
              )}
            </div>

            {row.usable_with_conditions && row.usable_until_date && (
              <div className="mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 font-medium">
                {fr
                  ? `✓ Utilisation autorisée jusqu'au ${row.usable_until_date}`
                  : `✓ Use authorized until ${row.usable_until_date}`}
              </div>
            )}
          </div>
        </div>

        {/* ── Non-conformités ─────────────────────────────────────────────── */}
        {ncs.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm font-bold text-red-700">
                {fr ? `${ncs.length} non-conformité${ncs.length > 1 ? 's' : ''}` : `${ncs.length} non-conformit${ncs.length > 1 ? 'ies' : 'y'}`}
              </span>
            </div>
            <div className="divide-y divide-red-50">
              {ncs.map(nc => {
                const ca = row.corrective_actions?.[nc.id];
                const note = row.item_notes?.[nc.id];
                const photo = row.item_photos?.[nc.id];
                return (
                  <div key={nc.id} className="px-5 py-4 space-y-2">
                    {/* NC label + severity */}
                    <div className="flex items-start gap-2">
                      {nc.withdrawal
                        ? <AlertOctagon size={15} className="text-red-600 shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-orange-500 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{nc.label}</p>
                        {nc.withdrawal && (
                          <span className="inline-block mt-0.5 text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                            {fr ? 'RETRAIT' : 'WITHDRAWAL'}
                          </span>
                        )}
                        {nc.critical && !nc.withdrawal && (
                          <span className="inline-block mt-0.5 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold border border-orange-200">
                            {fr ? 'CRITIQUE' : 'CRITICAL'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Defect note */}
                    {note && (
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{note}</p>
                    )}

                    {/* Defect photo */}
                    {photo && (
                      <img src={photo} alt="Défaut"
                        className="h-24 rounded-lg object-cover border border-slate-200 cursor-pointer"
                        onClick={() => setLightbox(photo)} />
                    )}

                    {/* Corrective action */}
                    {ca && (ca.note || ca.assigned || ca.deadline) && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 space-y-0.5">
                        {ca.note && (
                          <p className="text-xs text-teal-800">
                            <strong>{fr ? 'Correctif :' : 'Action:'}</strong> {ca.note}
                          </p>
                        )}
                        {ca.assigned && (
                          <p className="text-xs text-teal-700">
                            <strong>{fr ? 'Responsable :' : 'Responsible:'}</strong> {ca.assigned}
                          </p>
                        )}
                        {ca.deadline && (
                          <p className="text-xs text-teal-700">
                            <strong>{fr ? 'Échéance :' : 'Deadline:'}</strong> {ca.deadline}
                          </p>
                        )}
                        {ca.usable && (
                          <p className="text-xs text-teal-700 font-semibold">
                            {fr ? `✓ Utilisation autorisée jusqu'à l'échéance` : '✓ Use authorized until deadline'}
                            {ca.deadline ? ` (${ca.deadline})` : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Notes générales ─────────────────────────────────────────────── */}
        {row.notes && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              {fr ? 'Notes' : 'Notes'}
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{row.notes}</p>
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/${tenant}/inspections/nouveau${row.equipment_serial ? `?serial=${encodeURIComponent(row.equipment_serial)}&type=${row.equipment_type}` : `?type=${row.equipment_type}`}`}
            className="flex items-center justify-center gap-2 py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus size={18} />
            {fr ? 'Nouvelle inspection pour cet équipement' : 'New inspection for this equipment'}
          </Link>
          <Link
            href={`/${tenant}/inspections/${id}/edit`}
            className="flex items-center justify-center gap-2 py-2.5 px-5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Edit2 size={15} />
            {fr ? 'Modifier cette inspection' : 'Edit this inspection'}
          </Link>
          <Link
            href={`/${tenant}/inspections`}
            className="flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={13} className="rotate-180" />
            {fr ? 'Toutes les inspections' : 'All inspections'}
          </Link>
        </div>

        {/* ── Footer branding ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 py-4 opacity-60">
          <img src={logoUrl || '/c-secur360-logo.png'} alt="Logo" className="h-10 w-auto object-contain" />
          <p className="text-xs text-slate-400">c-secur360.ca</p>
        </div>

      </div>

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
