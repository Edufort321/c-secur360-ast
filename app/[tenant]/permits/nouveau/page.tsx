'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import {
  ArrowLeft, HardHat, Loader2,
  Wind, Flame, Lock, Zap, ArrowUp, Shovel, FlaskConical, Gauge,
} from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

// ── Dynamic imports (SSR disabled) ──────────────────────────────────────────

const ConfinedSpace = dynamic(
  () => import('@/components/steps/Step4Permits/ConfinedSpace'),
  { ssr: false, loading: () => <Spinner /> }
);
const HotWork = dynamic(
  () => import('@/components/steps/Step4Permits/HotWork'),
  { ssr: false, loading: () => <Spinner /> }
);
const Loto = dynamic(
  () => import('@/components/steps/Step4Permits/Loto'),
  { ssr: false, loading: () => <Spinner /> }
);
const Electrical = dynamic(
  () => import('@/components/steps/Step4Permits/Electrical'),
  { ssr: false, loading: () => <Spinner /> }
);
const HeightWork = dynamic(
  () => import('@/components/steps/Step4Permits/HeightWork'),
  { ssr: false, loading: () => <Spinner /> }
);
const Excavation = dynamic(
  () => import('@/components/steps/Step4Permits/Excavation'),
  { ssr: false, loading: () => <Spinner /> }
);
const Chemical = dynamic(
  () => import('@/components/steps/Step4Permits/Chemical'),
  { ssr: false, loading: () => <Spinner /> }
);
const Pressure = dynamic(
  () => import('@/components/steps/Step4Permits/Pressure'),
  { ssr: false, loading: () => <Spinner /> }
);

function Spinner() {
  return (
    <div className="grid place-items-center py-32 text-slate-400">
      <Loader2 className="animate-spin" />
    </div>
  );
}

// ── Permit type catalogue ────────────────────────────────────────────────────

const PERMIT_TYPES = [
  { key: 'confined_space', labelFr: 'Espace clos',           labelEn: 'Confined Space',        icon: Wind,         color: 'text-cyan-600',   accent: 'bg-cyan-50',   border: 'border-cyan-200',   built: true },
  { key: 'hot_work',       labelFr: 'Travail à chaud',       labelEn: 'Hot Work',               icon: Flame,        color: 'text-orange-600', accent: 'bg-orange-50', border: 'border-orange-200', built: true },
  { key: 'loto',           labelFr: 'LOTO / Cadenassage',    labelEn: 'LOTO / Lockout-Tagout',  icon: Lock,         color: 'text-slate-600',  accent: 'bg-slate-100', border: 'border-slate-200',  built: true },
  { key: 'electrical',     labelFr: 'Travail électrique',    labelEn: 'Electrical Work',        icon: Zap,          color: 'text-yellow-600', accent: 'bg-yellow-50', border: 'border-yellow-200', built: true },
  { key: 'height_work',    labelFr: 'Travail en hauteur',    labelEn: 'Work at Height',         icon: ArrowUp,      color: 'text-blue-600',   accent: 'bg-blue-50',   border: 'border-blue-200',   built: true },
  { key: 'excavation',     labelFr: 'Excavation / Tranchée', labelEn: 'Excavation / Trenching', icon: Shovel,       color: 'text-amber-700',  accent: 'bg-amber-50',  border: 'border-amber-200',  built: true },
  { key: 'chemical',       labelFr: 'Matières dangereuses',  labelEn: 'Hazardous Materials',    icon: FlaskConical, color: 'text-purple-600', accent: 'bg-purple-50', border: 'border-purple-200', built: true },
  { key: 'pressure',       labelFr: 'Tuyauterie / Pression', labelEn: 'Piping / Pressure',      icon: Gauge,        color: 'text-red-600',    accent: 'bg-red-50',    border: 'border-red-200',    built: true },
] as const;

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

type PermitKey = typeof PERMIT_TYPES[number]['key'];
type ProvinceCode = typeof PROVINCES[number]['code'];

// ── Common props passed to every permit component ────────────────────────────

interface PermitProps {
  tenant: string;
  language: 'fr' | 'en';
  selectedProvince: ProvinceCode;
  enableAutoSave: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

// ── Inner page ───────────────────────────────────────────────────────────────

function NouveauPermisInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || 'demo';
  const type = searchParams?.get('type') as PermitKey | null;
  const { lang } = useLanguage();
  const [province, setProvince] = useState<ProvinceCode>('QC');

  const handleSave = (_data: any) => router.push(`/${tenant}/permits`);
  const handleCancel = () => router.push(`/${tenant}/permits`);

  const commonProps: PermitProps = {
    tenant,
    language: lang as 'fr' | 'en',
    selectedProvince: province,
    enableAutoSave: true,
    onSave: handleSave,
    onCancel: handleCancel,
  };

  // ── No type → show picker ────────────────────────────────────────────────

  if (!type) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalHeader tenant={tenant} />
        <div className="w-full px-4 pb-8 pt-5 lg:px-6">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              {lang === 'fr' ? 'Retour aux permis' : 'Back to permits'}
            </button>
          </div>

          <h2 className="mb-1 text-xl font-bold text-slate-900">
            {lang === 'fr' ? 'Choisir le type de permis' : 'Choose permit type'}
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            {lang === 'fr'
              ? 'Sélectionne le type de travail nécessitant un permis.'
              : 'Select the type of work requiring a permit.'}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PERMIT_TYPES.map(pt => {
              const Icon = pt.icon;
              const label = lang === 'fr' ? pt.labelFr : pt.labelEn;
              return (
                <button
                  key={pt.key}
                  onClick={() => router.push(`/${tenant}/permits/nouveau?type=${pt.key}`)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border ${pt.border} bg-white p-5 shadow-sm transition hover:shadow-md hover:border-cyan-400`}
                >
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${pt.accent}`}>
                    <Icon size={24} className={pt.color} />
                  </div>
                  <span className="text-center text-sm font-semibold text-slate-800 leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Permit type forms ────────────────────────────────────────────────────

  // Province selector bar (shown above all permit forms)
  const ProvinceBar = () => (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 lg:px-6">
      <label className="text-sm font-medium text-slate-600">
        {lang === 'fr' ? 'Province :' : 'Province:'}
      </label>
      <select
        value={province}
        onChange={e => setProvince(e.target.value as ProvinceCode)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {PROVINCES.map(p => (
          <option key={p.code} value={p.code}>{p.code} — {p.label}</option>
        ))}
      </select>
    </div>
  );

  if (type === 'confined_space') {
    // Refonte : l'espace clos vit dans son module dédié (registre QR + permis intelligent + moteur
    // atmosphérique). On y redirige depuis le sélecteur « +nouveau ».
    if (typeof window !== 'undefined') router.replace(`/${tenant}/permits/espace-clos`);
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalHeader tenant={tenant} />
        <div className="flex items-center justify-center gap-2 py-24 text-slate-500"><Loader2 className="animate-spin" size={18} /> Ouverture du module Espaces clos…</div>
      </div>
    );
  }

  if (type === 'hot_work') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <HotWork {...commonProps} />
      </>
    );
  }

  if (type === 'loto') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <Loto {...commonProps} />
      </>
    );
  }

  if (type === 'electrical') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <Electrical {...commonProps} />
      </>
    );
  }

  if (type === 'height_work') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <HeightWork {...commonProps} />
      </>
    );
  }

  if (type === 'excavation') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <Excavation {...commonProps} />
      </>
    );
  }

  if (type === 'chemical') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <Chemical {...commonProps} />
      </>
    );
  }

  if (type === 'pressure') {
    return (
      <>
        <PortalHeader tenant={tenant} />
        <ProvinceBar />
        <Pressure {...commonProps} />
      </>
    );
  }

  // Fallback (unknown type)
  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-100">
            <HardHat size={32} className="text-amber-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-amber-900">Type inconnu</h2>
          <p className="mb-6 text-sm text-amber-700">
            Ce type de permis n&apos;existe pas.
          </p>
          <button
            onClick={() => router.push(`/${tenant}/permits/nouveau`)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700"
          >
            <ArrowLeft size={16} /> Retour au choix
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NouveauPermisPage() {
  return (
    <Suspense fallback={
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    }>
      <NouveauPermisInner />
    </Suspense>
  );
}
