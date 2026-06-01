'use client';

// « Taux & catalogue » a été déplacé au niveau Admin (toutes les fonctions de tarification
// sont désormais centralisées dans l'administration). Cette route redirige pour compatibilité.
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TauxRedirect() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || 'cerdia';
  useEffect(() => { router.replace(`/${tenant}/admin/taux`); }, [tenant, router]);
  return null;
}
