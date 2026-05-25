'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

const ASTPermit = dynamic(
  () => import('@/components/steps/Step4Permits/AST'),
  { ssr: false, loading: () => <Spinner /> },
);

type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

const PROVINCES: { code: ProvinceCode; label: string }[] = [
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
];

function Spinner() {
  return (
    <div className="grid place-items-center py-32 text-slate-400">
      <Loader2 className="animate-spin" />
    </div>
  );
}

function NouvelASTInner() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const tenant = (params?.tenant as string) || 'demo';
  const [province, setProvince] = useState<ProvinceCode>('QC');

  return (
    <>
      <PortalHeader tenant={tenant} />
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 lg:px-6">
        <label className="text-sm font-medium text-slate-600">{lang === 'fr' ? 'Province :' : 'Province:'}</label>
        <select
          value={province}
          onChange={e => setProvince(e.target.value as ProvinceCode)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {PROVINCES.map(p => (
            <option key={p.code} value={p.code}>{p.code} — {p.label}</option>
          ))}
        </select>
      </div>
      <ASTPermit
        tenant={tenant}
        language={lang}
        selectedProvince={province}
        enableAutoSave
        onSave={() => router.push(`/${tenant}/ast`)}
        onCancel={() => router.push(`/${tenant}/ast`)}
      />
    </>
  );
}

export default function NouvelASTPage() {
  return (
    <Suspense fallback={
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    }>
      <NouvelASTInner />
    </Suspense>
  );
}
