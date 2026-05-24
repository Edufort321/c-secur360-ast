'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, HardHat, Loader2 } from 'lucide-react';
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

  const handleSave = (_data: any) => router.push(`/${tenant}/permits`);
  const handleCancel = () => router.push(`/${tenant}/permits`);

  if (type !== 'confined_space') {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalHeader tenant={tenant} />
        <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
          <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-100">
              <HardHat size={32} className="text-amber-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-amber-900">En construction</h2>
            <p className="mb-6 text-sm text-amber-700">
              Ce type de permis sera disponible prochainement.<br />
              Seul le permis <strong>Espace clos</strong> est actif pour le moment.
            </p>
            <button
              onClick={() => router.push(`/${tenant}/permits`)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700"
            >
              <ArrowLeft size={16} /> Retour aux permis
            </button>
          </div>
        </div>
      </div>
    );
  }

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
