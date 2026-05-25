'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Loader2, AlertTriangle, CheckCircle, FileText, Users, Shield,
  Wrench, ClipboardList, QrCode,
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
        <span className="text-teal-600">{icon}</span>
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

// ── Public read-only AST view ──────────────────────────────────────────────

export default function ASTPublicView() {
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
          .from('ast_permits')
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
        <Loader2 className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (missing || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
          <h2 className="mb-1 text-lg font-bold text-amber-900">AST introuvable</h2>
          <p className="text-sm text-amber-700">
            Le numéro <code className="rounded bg-amber-100 px-1">{permitNumber}</code> n&apos;existe pas ou n&apos;est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const d = data;
  // L'AST est sauvegardé tel quel (ASTPermit) : les infos générales sont dans
  // d.taskInfo (camelCase). On normalise pour la vue lecture seule.
  const ti = d.taskInfo ?? {};
  const workLocation = ti.workLocation ?? d.work_location;
  const department = ti.department ?? d.department;
  const taskDescription = ti.taskDescription ?? d.task_description;
  const supervisorName = d.supervisor_name || ti.supervisor;
  const supervisorCert = d.supervisor_cert || ti.supervisorCert;
  const equipmentTools: any[] = d.equipment?.tools ?? d.equipmentList ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-teal-700 px-4 py-5 lg:px-8 print:bg-teal-100">
        <div className="mx-auto max-w-3xl flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="text-teal-200" size={18} />
              <span className="text-xs font-semibold text-teal-200 uppercase tracking-widest">
                Analyse de Sécurité au Travail — Lecture seule
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{permitNumber}</h1>
            {taskDescription && (
              <p className="mt-1 text-sm text-teal-100 line-clamp-2">{taskDescription}</p>
            )}
          </div>
          {d.status && <Badge status={d.status} />}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">

        {/* General */}
        <Section title="Informations générales" icon={<FileText size={16} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Numéro" value={permitNumber} />
            <InfoRow label="Province" value={d.province} />
            <InfoRow label="Lieu des travaux" value={workLocation} />
            <InfoRow label="Département" value={department} />
            <InfoRow label="Superviseur" value={supervisorName} />
            <InfoRow label="Certification superviseur" value={supervisorCert} />
            <InfoRow label="Valide du" value={d.permit_valid_from?.replace('T', ' ').slice(0, 16)} />
            <InfoRow label="Valide au" value={d.permit_valid_to?.replace('T', ' ').slice(0, 16)} />
          </div>
          {taskDescription && (
            <div className="pt-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description de la tâche</span>
              <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{taskDescription}</p>
            </div>
          )}
        </Section>

        {/* Job steps */}
        {d.jobSteps?.length > 0 && (
          <Section title={`Étapes de travail (${d.jobSteps.length})`} icon={<ClipboardList size={16} />}>
            <div className="space-y-3">
              {d.jobSteps.map((step: any, i: number) => (
                <div key={step.id ?? i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-slate-800">
                    {i + 1}. {step.description || '—'}
                  </p>
                  {step.hazards?.length > 0 && (
                    <p className="text-xs text-amber-700">
                      <span className="font-medium">Dangers : </span>{step.hazards.join(', ')}
                    </p>
                  )}
                  {step.controls?.length > 0 && (
                    <p className="text-xs text-green-700 mt-0.5">
                      <span className="font-medium">Contrôles : </span>{step.controls.join(', ')}
                    </p>
                  )}
                  <div className="mt-1.5 flex gap-4 text-xs text-slate-500">
                    <span>Risque avant : <strong>{step.riskBeforeProb ?? 0} × {step.riskBeforeSev ?? 0}</strong></span>
                    <span>Risque après : <strong>{step.riskAfterProb ?? 0} × {step.riskAfterSev ?? 0}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* PPE */}
        {d.ppeRequirements?.some((p: any) => p.required) && (
          <Section title="EPI requis" icon={<Shield size={16} />}>
            <div className="flex flex-wrap gap-2">
              {d.ppeRequirements
                .filter((p: any) => p.required)
                .map((p: any) => (
                  <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-800">
                    <CheckCircle size={11} />
                    {p.item}
                    {p.specification ? ` — ${p.specification}` : ''}
                  </span>
                ))}
            </div>
          </Section>
        )}

        {/* Equipment */}
        {equipmentTools.length > 0 && (
          <Section title="Équipements" icon={<Wrench size={16} />}>
            <div className="space-y-2">
              {equipmentTools.map((eq: any, i: number) => (
                <div key={eq.id ?? i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{eq.name || '—'}</span>
                  {eq.condition && (
                    <span className="text-xs font-medium text-slate-500">{eq.condition}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Participants */}
        {d.participants?.length > 0 && (
          <Section title={`Participants (${d.participants.length})`} icon={<Users size={16} />}>
            <div className="space-y-2">
              {d.participants.map((p: any, i: number) => (
                <div key={p.id ?? i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    {p.role && <p className="text-xs text-slate-500">{p.role}</p>}
                  </div>
                  {p.acknowledged && (
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Permitted work / restrictions */}
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
