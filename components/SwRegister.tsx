'use client';

import { useEffect } from 'react';

// Enregistre le SW, capture beforeinstallprompt globalement, et recharge
// automatiquement la page quand une nouvelle version du SW est activée.
export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then(reg => {
      // Vérifie immédiatement si une mise à jour est disponible
      reg.update().catch(() => {});
    }).catch(() => {});

    // Message du SW → nouvelle version activée → rechargement transparent
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SW_UPDATED') {
        // Petit délai pour laisser le SW finir son activation
        setTimeout(() => window.location.reload(), 300);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    // Capture l'event d'installation PWA dès que le navigateur le déclenche
    const onBIP = (e: any) => {
      e.preventDefault();
      (window as any).__pwaInstallEvent = e;
      window.dispatchEvent(new Event('pwa-installable'));
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      window.removeEventListener('beforeinstallprompt', onBIP);
    };
  }, []);

  return null;
}
