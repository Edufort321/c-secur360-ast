'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// L'écran « Multi-Sites » autonome affichait des données fictives (mock) et faisait doublon avec la
// vraie gestion des sites/succursales de l'Administration. On redirige vers l'admin (source réelle).
export default function SitesRedirect() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || '';
  useEffect(() => { if (tenant) router.replace(`/${tenant}/admin`); }, [tenant, router]);
  return <div className="grid min-h-screen place-items-center text-gray-400">Redirection vers l'administration…</div>;
}
