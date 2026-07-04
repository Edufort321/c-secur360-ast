'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// L'écran « Analytics consolidés » autonome affichait des KPI fictifs (mock). Les vraies analyses
// existent dans leurs modules (Projets, Finance, KPI HSE). On redirige vers le tableau de bord des modules.
export default function AnalyticsRedirect() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || '';
  useEffect(() => { if (tenant) router.replace(`/${tenant}/modules`); }, [tenant, router]);
  return <div className="grid min-h-screen place-items-center text-gray-400">Redirection…</div>;
}
