'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { PortalHeader } from '@/components/PortalHeader';

const PlannerApp = dynamic(() => import('@/components/planner/App'), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center text-gray-400">Chargement du planificateur…</div>,
});

export default function PlanificateurPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  return (
    <>
      <PortalHeader tenant={tenant} />
      <div className="planner-app">
        <PlannerApp tenant={tenant} />
      </div>
    </>
  );
}
