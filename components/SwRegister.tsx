'use client';

import { useEffect } from 'react';

// Enregistre le service worker globalement (requis pour éligibilité PWA)
export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
