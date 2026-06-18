'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';

// Module Inventaire porté (app Vite) — monté client-only pour éviter tout souci SSR.
// On affiche le PortalHeader unifié de l'hôte au-dessus (le header interne de l'inventaire a été retiré).
const InventoryRoot = dynamic(() => import('@/components/inventory/Root'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center text-gray-400">Chargement de l’inventaire…</div>
  ),
});

export default function InventoryPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || ''; // ISOLATION : jamais de repli 'cerdia' (contamination)
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PortalHeader tenant={tenant} subtitle="Inventaire" />
      <InventoryRoot />
    </div>
  );
}
