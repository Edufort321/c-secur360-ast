'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Module fusionné : les passés proches sont désormais gérés dans le module « Accidents et
// incidents » (même source de données, incident_type='near_miss'). On redirige pour éviter le
// doublon et conserver les liens existants.
export default function NearMissRedirect() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || ''; // ISOLATION : pas de repli 'demo' (contamination inter-tenant)
  useEffect(() => { if (tenant) router.replace(`/${tenant}/accidents`); }, [tenant, router]);
  return <div className="grid min-h-screen place-items-center text-gray-400">Redirection vers Accidents et incidents…</div>;
}
