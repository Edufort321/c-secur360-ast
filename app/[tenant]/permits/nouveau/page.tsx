'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes SSR avec Zustand
const ConfinedSpace = dynamic(
  () => import('@/components/steps/Step4Permits/ConfinedSpace'),
  { ssr: false, loading: () => <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div> }
);

const PROVINCES = [
  { code: 'QC', label: 'Québec' },
  { code: 'ON', label: 'Ontario' },
  { code: 'BC', label: 'Colombie-Britannique' },
  { code: 'AB', label: 'Alberta' },
  { code: 'SK', label: 'Saskatchewan' },
  { code: 'MB', label: 'Manitoba' },
  { code: 'NB', label: 'Nouveau-Brunswick' },
  { code: 'NS', label: 'Nouvelle-Écosse' },
  { code: 'PE', label: 'Î.-P.-É.' },
  { code: 'NL', label: 'T.-N.-L.' },
] as const;

function NouveauPermisInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || 'demo';
  const type = searchParams?.get('type') || 'confined_space';
  const { lang } = useLanguage();
  const [province, setProvince] = useState<typeof PROVINCES[number]['code']>('QC');

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
        {/* Fil d'Ariane + sélecteur province */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> {lang === 'fr' ? 'Retour aux permis' : 'Back to permits'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">
              {lang === 'fr' ? 'Province :' : 'Province:'}
            </label>
            <select
              value={province}
              onChange={e => setProvince(e.target.value as typeof province)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PROVINCES.map(p => (
                <option key={p.code} value={p.code}>{p.code} — {p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <ConfinedSpace
          tenant={tenant}
          language={lang as 'fr' | 'en'}
          selectedProvince={province}
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
