'use client';

import { useParams } from 'next/navigation';
import { Hammer } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

// Page provisoire unifiée pour un module activé mais pas encore construit.
export function ModulePlaceholder({ titleFr, titleEn }: { titleFr: string; titleEn: string }) {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="grid place-items-center px-4 py-20">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white">
            <Hammer size={26} />
          </div>
          <h1 className="text-xl font-bold">{lang === 'fr' ? titleFr : titleEn}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {lang === 'fr'
              ? 'Module activé — en cours de construction.'
              : 'Module enabled — under construction.'}
          </p>
        </div>
      </div>
    </div>
  );
}
