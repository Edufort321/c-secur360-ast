'use client';

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let reg: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(r => {
        reg = r;
        reg.update().catch(() => {});
      })
      .catch(() => {});

    // Rechargement fiable quand le nouveau SW prend le contrôle
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Vérifie une mise à jour à chaque retour en avant-plan (app PWA minimisée)
    const onVisible = () => {
      if (document.visibilityState === 'visible') reg?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);

    // Capture l'event d'installation PWA
    const onBIP = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallEvent = e;
      window.dispatchEvent(new Event('pwa-installable'));
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('beforeinstallprompt', onBIP);
    };
  }, []);

  return null;
}
