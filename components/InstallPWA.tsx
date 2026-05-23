'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Bouton d'installation PWA de la plateforme (s'affiche quand l'app est installable).
export function InstallPWA() {
  const { lang } = useLanguage();
  const [deferred, setDeferred] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onBIP = (e: any) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setDeferred(null); setHidden(true); };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (hidden || !deferred) return null;

  return (
    <button
      onClick={async () => { deferred.prompt(); try { await deferred.userChoice; } catch {} setDeferred(null); }}
      className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
    >
      <Download size={16} /> {lang === 'fr' ? "Installer l'application" : 'Install the app'}
    </button>
  );
}

export default InstallPWA;
