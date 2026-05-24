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

const ConfinedSpace = dynamic(
  () => import('@/components/steps/Step4Permits/ConfinedSpace'),
  { ssr: false, loading: () => <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div> }
);

const PERMIT_TYPES = [
  { key: 'confined_space', labelFr: 'Espace clos',           labelEn: 'Confined Space',       icon: Wind,         color: 'text-cyan-600',   accent: 'bg-cyan-50',   border: 'border-cyan-200',   built: true  },
  { key: 'hot_work',       labelFr: 'Travail à chaud',       labelEn: 'Hot Work',              icon: Flame,        color: 'text-orange-600', accent: 'bg-orange-50', border: 'border-orange-200', built: false },
  { key: 'loto',           labelFr: 'LOTO / Cadenassage',    labelEn: 'LOTO / Lockout',        icon: Lock,         color: 'text-slate-600',  accent: 'bg-slate-100', border: 'border-slate-200',  built: false },
  { key: 'electrical',     labelFr: 'Travail électrique',    labelEn: 'Electrical Work',       icon: Zap,          color: 'text-yellow-600', accent: 'bg-yellow-50', border: 'border-yellow-200', built: false },
  { key: 'height_work',    labelFr: 'Travail en hauteur',    labelEn: 'Work at Height',        icon: ArrowUp,      color: 'text-blue-600',   accent: 'bg-blue-50',   border: 'border-blue-200',   built: false },
  { key: 'excavation',     labelFr: 'Excavation / Tranchée', labelEn: 'Excavation / Trenching',icon: Shovel,       color: 'text-amber-700',  accent: 'bg-amber-50',  border: 'border-amber-200',  built: false },
  { key: 'chemical',       labelFr: 'Matières dangereuses',  labelEn: 'Hazardous Materials',   icon: FlaskConical, color: 'text-purple-600', accent: 'bg-purple-50', border: 'border-purple-200', built: false },
  { key: 'pressure',       labelFr: 'Tuyauterie / Pression', labelEn: 'Piping / Pressure',     icon: Gauge,        color: 'text-red-600',    accent: 'bg-red-50',    border: 'border-red-200',    built: false },
];

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
  const type = searchParams?.get('type');
  const { lang } = useLanguage();
  const [province, setProvince] = useState<typeof PROVINCES[number]['code']>('QC');

  const handleSave = (_data: any) => router.push(`/${tenant}/permits`);
  const handleCancel = () => router.push(`/${tenant}/permits`);

  // ── No type selected: show picker ──────────────────────────────────────
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
              <ArrowLeft size={16} /> {lang === 'fr' ? 'Retour aux permis' : 'Back to permits'}
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

              if (pt.built) {
                return (
                  <button
                    key={pt.key}
                    onClick={() => router.push(`/${tenant}/permits/nouveau?type=${pt.key}`)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border ${pt.border} bg-white p-5 shadow-sm transition hover:shadow-md hover:border-cyan-400 text-left`}
                  >
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${pt.accent}`}>
                      <Icon size={24} className={pt.color} />
                    </div>
                    <span className="text-center text-sm font-semibold text-slate-800 leading-tight">{label}</span>
                  </button>
                );
              }

              return (
                <div
                  key={pt.key}
                  className="relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-50 cursor-not-allowed select-none"
                >
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${pt.accent}`}>
                    <Icon size={24} className={pt.color} />
                  </div>
                  <span className="text-center text-sm font-semibold text-slate-500 leading-tight">{label}</span>
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    🚧
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Unsupported type ────────────────────────────────────────────────────
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

  // ── Confined space form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 pb-8 pt-5 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/${tenant}/permits/nouveau`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> {lang === 'fr' ? 'Choisir le type' : 'Choose type'}
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
          onCancel={() => router.push(`/${tenant}/permits/nouveau`)}
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
