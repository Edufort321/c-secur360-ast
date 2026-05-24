'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Loader2, AlertTriangle, CheckCircle, FileText, Users, Wind,
  MapPin, Shield, QrCode, BarChart3,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

// ── Read-only display helpers ──────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-700',
    active:    'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    draft: 'Brouillon', active: 'Actif', completed: 'Complété', cancelled: 'Annulé',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? map.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}

function ReadingRow({ label, value, unit, limit }: { label: string; value?: number | null; unit: string; limit?: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{label}</span>
      <div className="text-right">
        <span className="font-semibold text-slate-800">{value} {unit}</span>
        {limit && <span className="ml-2 text-xs text-slate-400">({limit})</span>}
      </div>
    </div>
  );
}

// ── Public read-only ConfinedSpace view ────────────────────────────────────

export default function ConfinedSpacePublicView() {
  const params = useParams();
  const tenant = params?.tenant as string;
  const permitNumber = params?.permitNumber as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!permitNumber) return;
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from('confined_space_permits')
          .select('data')
          .eq('permit_number', permitNumber)
          .eq('tenant_id', tenant)
          .single();
        if (error || !row) { setMissing(true); return; }
        setData(row.data);
      } catch {
        setMissing(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [permitNumber, tenant]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (missing || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
          <h2 className="mb-1 text-lg font-bold text-amber-900">Permis introuvable</h2>
          <p className="text-sm text-amber-700">
            Le numéro <code className="rounded bg-amber-100 px-1">{permitNumber}</code> n&apos;existe pas ou n&apos;est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const d = data;
  const si = d.siteInformation ?? {};
  const atm = d.atmosphericTesting ?? {};
  const reg = d.entryRegistry ?? {};
  const rescue = d.rescuePlan ?? {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-700 px-4 py-5 lg:px-8 print:bg-blue-100">
        <div className="mx-auto max-w-3xl flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wind className="text-blue-200" size={18} />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                Permis Espace Clos — Lecture seule
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{permitNumber}</h1>
            {si.spaceName && (
              <p className="mt-1 text-sm text-blue-100">{si.spaceName}</p>
            )}
          </div>
          {d.status && <Badge status={d.status} />}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">

        {/* Site information */}
        <Section title="Informations du site" icon={<MapPin size={16} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Numéro de permis" value={permitNumber} />
            <InfoRow label="Province" value={d.province} />
            <InfoRow label="Nom de l'espace" value={si.spaceName} />
            <InfoRow label="Localisation" value={si.location} />
            <InfoRow label="Type d'espace" value={si.spaceType} />
            <InfoRow label="Superviseur" value={d.supervisor_name} />
            <InfoRow label="Certification" value={d.supervisor_cert} />
            <InfoRow label="Valide du" value={d.permit_valid_from?.replace('T', ' ').slice(0, 16)} />
            <InfoRow label="Valide au" value={d.permit_valid_to?.replace('T', ' ').slice(0, 16)} />
          </div>
          {si.workDescription && (
            <div className="pt-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description des travaux</span>
              <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{si.workDescription}</p>
            </div>
          )}
        </Section>

        {/* Atmospheric testing */}
        {atm.readings?.length > 0 && (
          <Section title={`Tests atmosphériques (${atm.readings.length} lectures)`} icon={<Wind size={16} />}>
            {atm.equipment?.deviceModel && (
              <p className="text-xs text-slate-500 mb-3">
                Appareil : <strong>{atm.equipment.deviceModel}</strong>
                {atm.equipment.calibrationDate ? ` — Calibré le ${atm.equipment.calibrationDate}` : ''}
              </p>
            )}
            <div className="space-y-2">
              {atm.readings.map((r: any, i: number) => (
                <div key={r.id ?? i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700 mb-2">
                    Lecture {i + 1} — {r.time ?? ''}
                    {r.tester ? ` — ${r.tester}` : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {r.o2 != null && (
                      <div className={`rounded px-2 py-1 text-center ${r.o2 >= 19.5 && r.o2 <= 23 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{r.o2}%</div>
                        <div className="text-slate-500">O₂</div>
                      </div>
                    )}
                    {r.lel != null && (
                      <div className={`rounded px-2 py-1 text-center ${r.lel < 10 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{r.lel}%</div>
                        <div className="text-slate-500">LIE</div>
                      </div>
                    )}
                    {r.co != null && (
                      <div className={`rounded px-2 py-1 text-center ${r.co < 25 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{r.co} ppm</div>
                        <div className="text-slate-500">CO</div>
                      </div>
                    )}
                    {r.h2s != null && (
                      <div className={`rounded px-2 py-1 text-center ${r.h2s < 1 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="font-bold">{r.h2s} ppm</div>
                        <div className="text-slate-500">H₂S</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Entry registry */}
        {reg.personnel?.length > 0 && (
          <Section title={`Registre d'entrée (${reg.personnel.length} personnes)`} icon={<Users size={16} />}>
            <div className="space-y-2">
              {reg.personnel.map((p: any, i: number) => (
                <div key={p.id ?? i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    {p.role && <p className="text-xs text-slate-500">{p.role}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {p.entryTime && <span>Entrée : {p.entryTime}</span>}
                    {p.exitTime && <span>Sortie : {p.exitTime}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Rescue plan */}
        {(rescue.evacuationProcedure || rescue.emergencyContacts?.length > 0) && (
          <Section title="Plan de sauvetage" icon={<Shield size={16} />}>
            {rescue.evacuationProcedure && (
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Procédure d&apos;évacuation</span>
                <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{rescue.evacuationProcedure}</p>
              </div>
            )}
            {rescue.emergencyContacts?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contacts d&apos;urgence</span>
                <div className="mt-1 space-y-1">
                  {rescue.emergencyContacts.map((c: any, i: number) => (
                    <p key={i} className="text-sm text-slate-800">
                      {c.name} {c.phone ? `— ${c.phone}` : ''} {c.role ? `(${c.role})` : ''}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Permitted work & notes */}
        {(d.permitted_work || d.restrictions || d.finalization_notes) && (
          <Section title="Travaux autorisés & notes" icon={<FileText size={16} />}>
            <InfoRow label="Travaux autorisés" value={d.permitted_work} />
            <InfoRow label="Restrictions" value={d.restrictions} />
            <InfoRow label="Notes finales" value={d.finalization_notes} />
          </Section>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
          <QrCode size={14} className="shrink-0 text-slate-400" />
          <span>Vue publique en lecture seule — {permitNumber}</span>
        </div>
      </div>
    </div>
  );
}
