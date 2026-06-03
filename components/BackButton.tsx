'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BackButtonProps {
  /** Route used when there is no browser history to go back to. */
  fallback?: string;
  /** Extra classes (e.g. spacing) merged with the base style. */
  className?: string;
}

/**
 * Bouton Retour uniformise (tache #49). A placer SOUS le PortalHeader d'une page
 * (ne chevauche jamais le logo). Comportement : router.back() vers la page
 * precedente ; s'il n'y a pas d'historique, repli sur router.push(fallback).
 */
export function BackButton({ fallback, className = '' }: BackButtonProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const label = lang === 'en' ? 'Back' : 'Retour';

  const handleBack = () => {
    const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
    if (hasHistory) {
      router.back();
    } else if (fallback) {
      router.push(fallback);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 ${className}`}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}

export default BackButton;
