'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { SoumissionsModule } from '@/components/soumissions/SoumissionsModule';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SoumissionsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/${tenant}/projects`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400">
              <ArrowLeft size={16} /> {tr('Retour aux projets', 'Back to projects')}
            </Link>
            <h1 className="text-2xl font-bold">{tr('Soumissions', 'Quotes')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tr("Créez et suivez vos soumissions. À l'acceptation, la soumission devient un projet (n° S → P).", 'Create and track quotes. On acceptance, a quote becomes a project (# S → P).')}
            </p>
          </div>
          <Link href={`/${tenant}/admin?tab=soumissions`} className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            <BookOpen size={16} /> {tr('Catalogue de taux (Admin)', 'Rate catalogue (Admin)')}
          </Link>
        </div>

        <SoumissionsModule tenant={tenant} tr={tr} canEdit allowed={['liste', 'stats']} />
      </div>
    </div>
  );
}
