'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
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
  const tenant  = (params?.tenant as string) || 'demo';
  const id      = params?.id as string;

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

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
      } catch {
        setMissing(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tenant]);

  const handleBack = () => router.push(`/${tenant}/ast`);

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
      <ASTPermit
        tenant={tenant}
        language={data?.language ?? 'fr'}
        selectedProvince={data?.province ?? 'QC'}
        enableAutoSave
        initialData={data}
        onSave={handleBack}
        onCancel={handleBack}
      />
    </>
  );
}
