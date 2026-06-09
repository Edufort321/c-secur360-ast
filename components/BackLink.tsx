'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Bouton « Retour » autonome (sans dépendance LanguageContext), utilisable sur les pages publiques
// et admin. router.back() vers la page précédente ; repli sur `fallback` s'il n'y a pas d'historique.
export function BackLink({ fallback = '/', label = 'Retour', className = '' }: { fallback?: string; label?: string; className?: string }) {
  const router = useRouter();
  const onClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  };
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 ${className}`}>
      <ArrowLeft size={16} /> {label}
    </button>
  );
}
