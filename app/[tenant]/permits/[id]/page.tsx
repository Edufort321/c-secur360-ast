'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle, FolderKanban } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

function Spinner() {
  return <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div>;
}

const ConfinedSpace = dynamic(() => import('@/components/steps/Step4Permits/ConfinedSpace'), { ssr: false, loading: () => <Spinner /> });
const HotWork      = dynamic(() => import('@/components/steps/Step4Permits/HotWork'),       { ssr: false, loading: () => <Spinner /> });
const Loto         = dynamic(() => import('@/components/steps/Step4Permits/Loto'),          { ssr: false, loading: () => <Spinner /> });
const Electrical   = dynamic(() => import('@/components/steps/Step4Permits/Electrical'),    { ssr: false, loading: () => <Spinner /> });
const HeightWork   = dynamic(() => import('@/components/steps/Step4Permits/HeightWork'),    { ssr: false, loading: () => <Spinner /> });
const Excavation   = dynamic(() => import('@/components/steps/Step4Permits/Excavation'),    { ssr: false, loading: () => <Spinner /> });
const Chemical     = dynamic(() => import('@/components/steps/Step4Permits/Chemical'),      { ssr: false, loading: () => <Spinner /> });
const Pressure     = dynamic(() => import('@/components/steps/Step4Permits/Pressure'),      { ssr: false, loading: () => <Spinner /> });

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const tenant = (params?.tenant as string) || 'demo';
  const id = params?.id as string;

  const [permitData, setPermitData]     = useState<any>(null);
  const [permitType, setPermitType]     = useState<string>('confined_space');
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [linkedProject, setLinkedProject] = useState<{ id: string; title: string; project_number: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // Try confined_space_permits first — TOUJOURS scoper au tenant (RLS permissive USING(true) :
        // le filtre applicatif est la SEULE isolation → sans lui, fuite inter-tenant).
        const { data: cs } = await supabase
          .from('confined_space_permits').select('data').eq('tenant_id', tenant).eq('permit_number', id).maybeSingle();
        if (cs?.data) {
          setPermitData(cs.data);
          setPermitType('confined_space');
          const pNum = cs.data?.taskInfo?.projectNumber || cs.data?.siteInfo?.projectNumber || cs.data?.siteInformation?.projectNumber;
          if (pNum) {
            const { data: proj } = await supabase.from('projects').select('id, title, project_number').eq('tenant_id', tenant).eq('project_number', pNum).maybeSingle();
            if (proj) setLinkedProject(proj);
          }
          return;
        }
        // Try work_permits
        const { data: wp } = await supabase
          .from('work_permits').select('type, data').eq('tenant_id', tenant).eq('permit_number', id).maybeSingle();
        if (wp?.data) {
          setPermitData(wp.data);
          setPermitType(wp.type || 'hot_work');
          const pNum = wp.data?.taskInfo?.projectNumber || wp.data?.siteInfo?.projectNumber;
          if (pNum) {
            const { data: proj } = await supabase.from('projects').select('id, title, project_number').eq('tenant_id', tenant).eq('project_number', pNum).maybeSingle();
            if (proj) setLinkedProject(proj);
          }
          return;
        }
        setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tenant]);

  const handleBack = () => router.push(`/${tenant}/permits`);
  const commonProps = { tenant, language: lang, selectedProvince: permitData?.province || 'QC', initialData: permitData, enableAutoSave: true, onSave: handleBack, onCancel: handleBack };

  function renderPermit() {
    switch (permitType) {
      case 'confined_space': return <ConfinedSpace {...commonProps} permitData={permitData} />;
      case 'hot_work':       return <HotWork       {...commonProps} />;
      case 'loto':           return <Loto          {...commonProps} />;
      case 'electrical':     return <Electrical    {...commonProps} />;
      case 'height_work':    return <HeightWork    {...commonProps} />;
      case 'excavation':     return <Excavation    {...commonProps} />;
      case 'chemical':       return <Chemical      {...commonProps} />;
      case 'pressure':       return <Pressure      {...commonProps} />;
      default:               return <ConfinedSpace {...commonProps} permitData={permitData} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 pb-8 pt-5 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800">
            <ArrowLeft size={16} /> {lang === 'fr' ? 'Retour aux permis' : 'Back to permits'}
          </button>
          {linkedProject && (
            <Link href={`/${tenant}/projects/${linkedProject.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              <FolderKanban size={14} /> {linkedProject.project_number} — {linkedProject.title || 'Projet'}
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-32 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : notFound ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <AlertTriangle size={32} className="text-amber-400" />
            <p className="font-semibold text-slate-700">{lang === 'fr' ? 'Permis introuvable' : 'Permit not found'}</p>
            <p className="text-sm text-slate-500">{lang === 'fr' ? 'Le permis' : 'Permit'} <code className="rounded bg-slate-100 px-1">{id}</code> {lang === 'fr' ? "n'existe pas ou a été supprimé." : "doesn't exist or was deleted."}</p>
            <button onClick={handleBack} className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
              {lang === 'fr' ? 'Retour à la liste' : 'Back to list'}
            </button>
          </div>
        ) : renderPermit()}
      </div>
    </div>
  );
}
