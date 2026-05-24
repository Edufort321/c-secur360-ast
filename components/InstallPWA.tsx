'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Share } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function InstallPWA() {
  const { lang } = useLanguage();
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [gone, setGone] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already installed as standalone — hide everything
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    if (standalone) { setGone(true); return; }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (!ios) {
      // Android / Desktop: read from global captured event (SwRegister)
      if ((window as any).__pwaInstallEvent) setCanInstall(true);
      const onInstallable = () => setCanInstall(true);
      const onInstalled = () => { setCanInstall(false); setGone(true); (window as any).__pwaInstallEvent = null; };
      window.addEventListener('pwa-installable', onInstallable);
      window.addEventListener('appinstalled', onInstalled);
      return () => {
        window.removeEventListener('pwa-installable', onInstallable);
        window.removeEventListener('appinstalled', onInstalled);
      };
    }
  }, []);

  // Close iOS tooltip on outside click
  useEffect(() => {
    if (!showTip) return;
    const onClickOutside = (e: MouseEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) setShowTip(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showTip]);

  if (gone) return null;

  // iOS: button always visible (no API to check eligibility) — show Share instructions
  if (isIOS) {
    return (
      <div className="relative" ref={tipRef}>
        <button
          onClick={() => setShowTip(v => !v)}
          title={lang === 'fr' ? "Installer l'app" : 'Install app'}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-600/20 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 sm:px-3 sm:text-sm"
        >
          <Download size={15} />
          <span className="hidden sm:inline">{lang === 'fr' ? "Installer" : 'Install'}</span>
        </button>
        {showTip && (
          <div className="fixed right-4 top-16 z-50 w-72 rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-2xl">
            <button onClick={() => setShowTip(false)} className="absolute right-3 top-3 text-gray-400 hover:text-white">✕</button>
            <p className="mb-2 font-semibold text-white">
              {lang === 'fr' ? "Ajouter à l'écran d'accueil" : 'Add to Home Screen'}
            </p>
            <div className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
              <Share size={30} className="mt-0.5 shrink-0 text-blue-400" />
              <p>
                {lang === 'fr'
                  ? 'Dans Safari, appuyez sur le bouton Partager en bas, puis « Sur l\'écran d\'accueil ».'
                  : 'In Safari, tap the Share button at the bottom, then "Add to Home Screen".'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Android / Desktop: show only when install prompt is available
  if (!canInstall) return null;
  return (
    <button
      onClick={async () => {
        const e = (window as any).__pwaInstallEvent;
        if (!e) return;
        e.prompt();
        try { await e.userChoice; } catch {}
        (window as any).__pwaInstallEvent = null;
        setCanInstall(false);
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-600/20 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 sm:px-3 sm:text-sm"
    >
      <Download size={15} />
      <span className="hidden sm:inline">{lang === 'fr' ? "Installer l'app" : 'Install app'}</span>
    </button>
  );
}

export default InstallPWA;
