'use client';

import { useEffect } from 'react';

// Capture beforeinstallprompt globally so InstallPWA can access it from any page.
export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onBIP = (e: any) => {
      e.preventDefault();
      (window as any).__pwaInstallEvent = e;
      window.dispatchEvent(new Event('pwa-installable'));
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);
  return null;
}
