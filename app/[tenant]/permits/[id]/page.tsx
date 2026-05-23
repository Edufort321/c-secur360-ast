'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const ConfinedSpace = dynamic(
  () => import('@/components/steps/Step4Permits/ConfinedSpace'),
  { ssr: false, loading: () => <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div> }
);

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || 'demo';
  const id = params?.id as string;

  const [permitData, setPermitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('confined_space_permits')
          .select('data')
          .eq('permit_number', id)
          .single();
        if (error || !data) { setNotFound(true); return; }
        setPermitData(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBack = () => router.push(`/${tenant}/permits`);

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 pb-8 pt-5 lg:px-6">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Retour aux permis
        </button>

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-32 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : notFound ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <AlertTriangle size={32} className="text-amber-400" />
            <p className="font-semibold text-slate-700">Permis introuvable</p>
            <p className="text-sm text-slate-500">Le permis <code className="rounded bg-slate-100 px-1">{id}</code> n&apos;existe pas ou a été supprimé.</p>
            <button onClick={handleBack} className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
              Retour à la liste
            </button>
          </div>
        ) : (
          <ConfinedSpace
            tenant={tenant}
            language="fr"
            selectedProvince={permitData?.province || 'QC'}
            initialData={permitData}
            permitData={permitData}
            enableAutoSave
            onSave={() => handleBack()}
            onCancel={handleBack}
          />
        )}
      </div>
    </div>
  );
}
