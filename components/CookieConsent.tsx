'use client';

// Bandeau d'information sur les témoins (Loi 25 / RGPD).
// Le site n'utilise QUE des témoins strictement nécessaires (session, sécurité) — aucun
// traceur publicitaire ni analytique. Le consentement préalable n'est donc PAS requis ;
// ce bandeau remplit l'obligation de TRANSPARENCE (informer + lien vers la politique).
// S'affiche à l'ouverture tant que l'utilisateur n'a pas cliqué « J'ai compris ».

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'cs-cookie-notice-ack';

export function CookieConsent() {
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Affiche seulement si l'utilisateur n'a pas déjà pris connaissance de l'avis.
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* stockage indisponible : on ferme quand même */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={fr ? 'Avis sur les témoins' : 'Cookie notice'}
      className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6 animate-[cs-cookie-in_0.35s_ease-out]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#0B1524] p-5 text-slate-200 shadow-2xl ring-1 ring-black/40 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
            <Cookie size={18} />
          </span>
          <p className="text-sm leading-relaxed">
            {fr ? (
              <>
                Ce site utilise uniquement des <strong>témoins strictement nécessaires</strong>{' '}
                (connexion et sécurité). Aucun traceur publicitaire ni analytique.{' '}
                <Link href="/privacy" className="text-orange-400 underline hover:text-orange-300">
                  Politique de confidentialité
                </Link>
                .
              </>
            ) : (
              <>
                This site uses only <strong>strictly necessary cookies</strong> (login and
                security). No advertising or analytics trackers.{' '}
                <Link href="/privacy" className="text-orange-400 underline hover:text-orange-300">
                  Privacy policy
                </Link>
                .
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          <button
            onClick={acknowledge}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            {fr ? "J'ai compris" : 'Got it'}
          </button>
          <button
            onClick={acknowledge}
            aria-label={fr ? 'Fermer' : 'Close'}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cs-cookie-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CookieConsent;
