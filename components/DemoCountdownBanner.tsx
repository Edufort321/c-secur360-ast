'use client';

import { useEffect, useState } from 'react';

// Bandeau de compte à rebours affiché sur l'espace /demo. Lit l'échéance posée par DemoStartButton
// (localStorage 'demoExpiresAt'). À 0 : message "Démo terminée" + lien vers les forfaits.
// Ne s'affiche que sur les pages /demo et seulement si une session démo a été démarrée.
export function DemoCountdownBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [onDemo, setOnDemo] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOnDemo(window.location.pathname.startsWith('/demo'));
    const tick = () => {
      const exp = Number(localStorage.getItem('demoExpiresAt') || 0);
      if (!exp) { setRemaining(null); return; }
      setRemaining(Math.max(0, Math.floor((exp - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!onDemo || remaining === null) return null;

  if (remaining <= 0) {
    return (
      <div className="fixed inset-x-0 top-0 z-[80] flex flex-wrap items-center justify-center gap-3 bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
        <span>⏱️ Démo terminée.</span>
        <a href="/#pricing" className="rounded-lg bg-white px-3 py-1 text-amber-700 hover:bg-amber-50">Voir les forfaits</a>
        <a href="mailto:eric.dufort@cerdia.ai?subject=Abonnement C-Secur360" className="rounded-lg border border-white/60 px-3 py-1 hover:bg-amber-700">S'abonner</a>
      </div>
    );
  }

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  return (
    <div className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-blue-600/95 px-4 py-1.5 text-xs font-semibold text-white">
      🧪 Mode démo — temps restant : {mm}:{ss}
      <a href="/#pricing" className="ml-2 underline hover:no-underline">Forfaits</a>
    </div>
  );
}
