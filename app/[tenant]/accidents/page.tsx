'use client';
// Le module Accidents/Incidents a été FUSIONNÉ dans Santé-sécurité (HSE) → onglet « Incidents & accidents ».
// Cette page redirige vers /hse en conservant le paramètre ?ast (déclaration d'incident liée à un AST).
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AccidentsRedirect() {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const ast = sp.get('ast');
    const qs = new URLSearchParams({ tab: 'incidents' });
    if (ast) qs.set('ast', ast);
    router.replace(`/${tenant}/hse?${qs.toString()}`);
  }, [tenant, router, sp]);
  return <div className="grid min-h-screen place-items-center text-gray-400"><Loader2 className="animate-spin" /></div>;
}
