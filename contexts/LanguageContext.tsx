'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'fr' | 'en';

// Dictionnaire (étendu progressivement). t(key) -> chaîne selon la langue.
const DICT: Record<string, { fr: string; en: string }> = {
  platform: { fr: 'Plateforme modulaire', en: 'Modular platform' },
  modules: { fr: 'Modules', en: 'Modules' },
  modules_sub: { fr: 'Tes modules selon ton abonnement. Les modules non inclus peuvent être ajoutés en un clic.', en: 'Your modules based on your subscription. Modules not included can be added in one click.' },
  open: { fr: 'Ouvrir', en: 'Open' },
  enabled: { fr: 'Activé', en: 'Enabled' },
  locked: { fr: 'Verrouillé', en: 'Locked' },
  soon: { fr: 'Bientôt', en: 'Soon' },
  soon_available: { fr: 'Bientôt disponible', en: 'Coming soon' },
  add_to_sub: { fr: "Ajouter à l'abonnement", en: 'Add to subscription' },
  unlock: { fr: 'Débloquer', en: 'Unlock' },
  see_plans: { fr: 'Voir les forfaits', en: 'See plans' },
  // Projets
  projects: { fr: 'Projets', en: 'Projects' },
  new_project: { fr: 'Nouveau projet', en: 'New project' },
  search: { fr: 'Rechercher…', en: 'Search…' },
  total: { fr: 'Total', en: 'Total' },
  no_project: { fr: 'Aucun projet', en: 'No project' },
  create: { fr: 'Créer', en: 'Create' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('cs-lang')) as Lang | null;
    if (saved === 'fr' || saved === 'en') setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('cs-lang', lang);
    // Synchronise le module planner (qui lit 'preferred-language') + notifie dans le même onglet
    localStorage.setItem('preferred-language', lang);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cs-lang-change', { detail: lang }));
  }, [lang]);

  const t = (k: string) => DICT[k]?.[lang] ?? k;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLanguage = () => useContext(LangCtx);
