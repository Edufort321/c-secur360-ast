'use client';
// Mode DIFFUSION EN VEILLE (kiosque) : après N secondes d'inactivité, un plein écran fait défiler en
// BOUCLE les relevés de chaque widget, en gros, jusqu'à un mouvement (souris/clavier/tactile) ou la
// fermeture. Activé par tenant dans Admin › Système. Données réelles via /api/incidents/safety-board.
import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, X } from 'lucide-react';

type Slide = { big: string | number; title: string; sub?: string; accent: string };

export function KioskBroadcast({ enabled, idleSeconds = 60, lang = 'fr' }: { enabled: boolean; idleSeconds?: number; lang?: 'fr' | 'en' }) {
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const [active, setActive] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const idleTimer = useRef<any>(null);

  // Construit les diapos depuis les widgets (sécurité pour l'instant ; extensible).
  const buildSlides = useCallback(async () => {
    const out: Slide[] = [];
    try {
      const r = await fetch('/api/incidents/safety-board', { credentials: 'include' });
      const j = r.ok ? await r.json() : null;
      if (j?.ok) {
        out.push({ big: j.daysSinceAccident, title: tr('JOURS SANS ACCIDENT', 'DAYS WITHOUT ACCIDENT'), sub: tr('Sécurité d’abord', 'Safety first'), accent: 'text-emerald-400' });
        out.push({ big: j.daysSinceNearMiss, title: tr('JOURS SANS PASSÉ PROCHE', 'DAYS WITHOUT NEAR-MISS'), accent: 'text-sky-400' });
        out.push({ big: j.accidentsYTD, title: tr(`ACCIDENTS EN ${j.year}`, `ACCIDENTS IN ${j.year}`), accent: j.accidentsYTD ? 'text-rose-400' : 'text-emerald-400' });
        out.push({ big: j.nearMissYTD, title: tr(`PASSÉS PROCHES EN ${j.year}`, `NEAR-MISSES IN ${j.year}`), accent: j.nearMissYTD ? 'text-amber-400' : 'text-emerald-400' });
      }
    } catch { /* ignore */ }
    return out;
  }, [lang]);

  // Démarre la veille : charge les diapos puis affiche.
  const startKiosk = useCallback(async () => {
    const s = await buildSlides();
    if (s.length) { setSlides(s); setIdx(0); setActive(true); }
  }, [buildSlides]);

  // Minuteur d'inactivité (réarmé à chaque activité).
  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      if (active) return; // déjà en veille : l'overlay gère sa propre sortie
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(startKiosk, idleSeconds * 1000);
    };
    const evs = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    evs.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { evs.forEach(e => window.removeEventListener(e, reset)); clearTimeout(idleTimer.current); };
  }, [enabled, active, idleSeconds, startKiosk]);

  // Boucle de rotation des diapos.
  useEffect(() => {
    if (!active || slides.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % slides.length), 8000);
    return () => clearInterval(id);
  }, [active, slides.length]);

  // Sortie de veille sur toute activité utilisateur.
  useEffect(() => {
    if (!active) return;
    const exit = () => setActive(false);
    const evs = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    // léger délai pour éviter de fermer instantanément à cause de l'événement qui a déclenché l'affichage
    const t = setTimeout(() => evs.forEach(e => window.addEventListener(e, exit, { passive: true })), 400);
    return () => { clearTimeout(t); evs.forEach(e => window.removeEventListener(e, exit)); };
  }, [active]);

  if (!enabled || !active || !slides.length) return null;
  const s = slides[idx];
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <button onClick={() => setActive(false)} className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-white/10" title={tr('Fermer', 'Close')}><X size={22} /></button>
      <ShieldCheck size={40} className="mb-6 text-emerald-500/70" />
      <div className={`font-black leading-none ${s.accent}`} style={{ fontSize: 'clamp(7rem, 30vw, 24rem)' }}>{s.big}</div>
      <div className="mt-4 text-2xl font-semibold uppercase tracking-[0.3em] text-slate-200 sm:text-3xl">{s.title}</div>
      {s.sub && <div className="mt-2 text-slate-400">{s.sub}</div>}
      <div className="mt-10 flex gap-2">
        {slides.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/30'}`} />)}
      </div>
      <div className="absolute bottom-6 text-xs text-slate-500">{tr('Bougez la souris ou touchez l’écran pour revenir', 'Move the mouse or touch the screen to return')}</div>
    </div>
  );
}
