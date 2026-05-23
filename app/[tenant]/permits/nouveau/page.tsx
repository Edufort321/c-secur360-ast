'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes SSR avec Zustand
const ConfinedSpace = dynamic(
  () => import('@/components/steps/Step4Permits/ConfinedSpace'),
  { ssr: false, loading: () => <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div> }
);

function NouveauPermisInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || 'demo';
  const type = searchParams?.get('type') || 'confined_space';

  const handleSave = (data: any) => {
    router.push(`/${tenant}/permits`);
  };

  const handleCancel = () => {
    router.push(`/${tenant}/permits`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 pb-8 pt-5 lg:px-6">
        {/* Fil d'Ariane */}
        <button
          onClick={handleCancel}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Retour aux permis
        </button>

        <ConfinedSpace
          tenant={tenant}
          language="fr"
          selectedProvince="QC"
          enableAutoSave
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function NouveauPermisPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-slate-400" /></div>}>
      <NouveauPermisInner />
    </Suspense>
  );
}
