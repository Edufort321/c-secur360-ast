'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';
import { useModuleEnabled } from '@/lib/modules/useModuleEnabled';

// Module « Rapports terrain » — constructeur de rapports techniques (extraction IA PDF/manuscrit,
// gabarits, annotations, photos, export). Les appels IA passent par /api/rapports/ai (clé serveur).
// Chargé client-only (le composant utilise localStorage/window) -> pas de rendu serveur.
const RapportsApp = dynamic(() => import('@/components/rapports/RapportsApp'), { ssr: false });

export default function RapportsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const access = useModuleEnabled(tenant, 'rapports', true); // activé par défaut, désactivable par tenant

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="px-4 pt-3"><BackButton fallback={`/${tenant}/modules`} /></div>
      {access === 'locked' ? (
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <Lock className="mx-auto text-gray-400" size={40} />
          <h1 className="mt-4 text-xl font-bold">Module non activé</h1>
          <p className="mt-2 text-sm text-gray-500">Le module « Rapports terrain » n&apos;est pas inclus dans votre abonnement.</p>
        </div>
      ) : access === 'loading' ? (
        <div className="py-20 text-center text-gray-400">…</div>
      ) : (
        <RapportsApp />
      )}
    </div>
  );
}
