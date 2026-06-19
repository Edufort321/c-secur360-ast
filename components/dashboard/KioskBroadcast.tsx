'use client';
// Mode DIFFUSION EN VEILLE (kiosque) : après N secondes d'inactivité, un plein écran fait défiler en
// BOUCLE les relevés des cartes SÉLECTIONNÉES (Admin › Système › Kiosque), en gros, jusqu'à un mouvement
// (souris/clavier/tactile) ou la fermeture. Les diapos = valeurs RÉELLES fournies par le dashboard.
import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { selectKioskSlides, type KioskSlide } from '@/lib/kioskCards';
import { supabase } from '@/lib/supabase';

export function KioskBroadcast({ enabled, idleSeconds = 60, lang = 'fr', slides = [], selectedKeys, tenant }:
  { enabled: boolean; idleSeconds?: number; lang?: 'fr' | 'en'; slides?: KioskSlide[]; selectedKeys?: string[] | null; tenant?: string }) {
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const idleTimer = useRef<any>(null);

  // VRAI logo : celui du tenant (tenants.logo_url) sinon le logo par défaut /logo.png — jamais un placeholder.
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => {
    if (!tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  // Diapos à diffuser (filtrées par les cartes cochées). Ref = lecture fraîche dans le minuteur (anti-stale).
  const shown = selectKioskSlides(slides, selectedKeys);
  const shownRef = useRef<KioskSlide[]>(shown);
  shownRef.current = shown;

  // Démarre la veille : n'active QUE s'il y a au moins une diapo à montrer.
  const startKiosk = useCallback(() => {
    if (shownRef.current.length) { setIdx(0); setActive(true); }
  }, []);

  // Minuteur d'inactivité (réarmé à chaque activité).
  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      if (active) return; // déjà en veille : l'overlay gère sa propre sortie
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(startKiosk, Math.max(5, idleSeconds) * 1000);
    };
    const evs = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    evs.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { evs.forEach(e => window.removeEventListener(e, reset)); clearTimeout(idleTimer.current); };
  }, [enabled, active, idleSeconds, startKiosk]);

  // Boucle de rotation des diapos (8 s). Borne l'index si la liste rétrécit.
  useEffect(() => {
    if (!active || shown.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % shownRef.current.length), 8000);
    return () => clearInterval(id);
  }, [active, shown.length]);

  // Sortie de veille sur toute activité utilisateur.
  useEffect(() => {
    if (!active) return;
    const exit = () => setActive(false);
    const evs = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    // léger délai pour éviter de fermer instantanément à cause de l'événement qui a déclenché l'affichage
    const t = setTimeout(() => evs.forEach(e => window.addEventListener(e, exit, { passive: true })), 400);
    return () => { clearTimeout(t); evs.forEach(e => window.removeEventListener(e, exit)); };
  }, [active]);

  if (!enabled || !active || !shown.length) return null;
  const s = shown[Math.min(idx, shown.length - 1)];
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <button onClick={() => setActive(false)} className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-white/10" title={tr('Fermer', 'Close')}><X size={22} /></button>
      {logoFailed
        ? <ShieldCheck size={40} className="mb-6 text-emerald-500/70" />
        : <img src={logoUrl || '/logo.png'} alt="" className="mb-8 h-24 w-auto object-contain drop-shadow-lg" onError={() => setLogoFailed(true)} />}
      <div className={`font-black leading-none ${s.accent}`} style={{ fontSize: 'clamp(7rem, 30vw, 24rem)' }}>{s.big}</div>
      <div className="mt-4 text-2xl font-semibold uppercase tracking-[0.3em] text-slate-200 sm:text-3xl">{s.title}</div>
      {s.sub && <div className="mt-2 text-slate-400">{s.sub}</div>}
      <div className="mt-10 flex gap-2">
        {shown.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/30'}`} />)}
      </div>
      <div className="absolute bottom-6 text-xs text-slate-500">{tr('Bougez la souris ou touchez l’écran pour revenir', 'Move the mouse or touch the screen to return')}</div>
    </div>
  );
}
