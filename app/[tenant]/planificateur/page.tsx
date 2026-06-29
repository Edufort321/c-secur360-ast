'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const PlannerApp = dynamic(() => import('@/components/planner/App'), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center text-gray-400">Chargement du planificateur…</div>,
});

export default function PlanificateurPage() {
  const params = useParams();
  // ISOLATION : JAMAIS de repli sur 'cerdia' (contamination inter-tenant). Le segment d'URL est la
  // source de vérité ; s'il manque, on ne charge/écrit rien plutôt que de polluer un autre tenant.
  const tenant = (params?.tenant as string) || '';
  return (
    <div className="planner-app">
      {/* Le Poinçon est désormais intégré dans le menu hamburger du planificateur (onglet « Actions »). */}
      <PlannerApp tenant={tenant} />
    </div>
  );
}
