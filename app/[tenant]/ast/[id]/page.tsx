'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowLeft, FolderKanban } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntitlements } from '@/lib/entitlements';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const ASTPermit = dynamic(
  () => import('@/components/steps/Step4Permits/AST'),
  { ssr: false, loading: () => <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div> },
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
);

export default function ASTDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const { lang } = useLanguage();
  const tenant  = (params?.tenant as string) || ''; // ISOLATION : pas de repli 'demo' (contamination inter-tenant)
  const id      = params?.id as string;
  const ent = useEntitlements(tenant);
  const hasIncidents = !ent || ent.includes('accidents') || ent.includes('near_miss');

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [linkedProject, setLinkedProject] = useState<{ id: string; title: string; project_number: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from('ast_permits')
          .select('data')
          .eq('permit_number', id)
          .eq('tenant_id', tenant)
          .single();
        if (error || !row) { setMissing(true); return; }
        setData(row.data);
        const pNum = row.data?.taskInfo?.projectNumber || row.data?.projectNumber;
        if (pNum) {
          const { data: proj } = await supabase.from('projects').select('id, title, project_number').eq('tenant_id', tenant).eq('project_number', pNum).maybeSingle();
          if (proj) setLinkedProject(proj);
        }
      } catch {
        setMissing(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tenant]);

  const handleBack = () => { router.push(`/${tenant}/ast`); router.refresh(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalHeader tenant={tenant} />
        <div className="grid place-items-center py-32 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  if (missing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalHeader tenant={tenant} />
        <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
          <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
            <h2 className="mb-1 text-lg font-bold text-amber-900">AST introuvable</h2>
            <p className="mb-6 text-sm text-amber-700">
              Le numéro <code className="rounded bg-amber-100 px-1">{id}</code> n&apos;existe pas ou a été supprimé.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700"
            >
              <ArrowLeft size={16} /> Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PortalHeader tenant={tenant} />
      <div className="mx-auto max-w-5xl px-4 pt-3 flex flex-wrap items-center gap-2">
        {linkedProject && (
          <Link href={`/${tenant}/projects/${linkedProject.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            <FolderKanban size={14} /> {linkedProject.project_number} — {linkedProject.title || 'Projet'}
          </Link>
        )}
        {hasIncidents && (
          <Link href={`/${tenant}/accidents?ast=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100">
            <AlertTriangle size={14} /> {lang === 'en' ? 'Report an incident' : 'Déclarer un incident'}
          </Link>
        )}
      </div>
      <ASTPermit
        tenant={tenant}
        language={lang}
        selectedProvince={data?.province ?? 'QC'}
        enableAutoSave
        initialData={data}
        onSave={handleBack}
        onCancel={handleBack}
      />
    </>
  );
}
