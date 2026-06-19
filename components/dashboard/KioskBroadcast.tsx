'use client';
// Mode DIFFUSION EN VEILLE (kiosque) : après N secondes d'inactivité, un plein écran fait défiler en
// BOUCLE les relevés des cartes SÉLECTIONNÉES (Admin › Système › Kiosque), en gros, jusqu'à un mouvement
// (souris/clavier/tactile) ou la fermeture. Les diapos = valeurs RÉELLES fournies par le dashboard.
import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { selectKioskSlides, type KioskSlide } from '@/lib/kioskCards';
import { supabase } from '@/lib/supabase';
import { getKioskBg } from '@/lib/pdfStyle';

export function KioskBroadcast({ enabled, idleSeconds = 60, lang = 'fr', slides = [], selectedKeys, tenant }:
  { enabled: boolean; idleSeconds?: number; lang?: 'fr' | 'en'; slides?: KioskSlide[]; selectedKeys?: string[] | null; tenant?: string }) {
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const idleTimer = useRef<any>(null);

  // VRAI logo : celui du tenant (tenants.logo_url) sinon le logo par défaut /logo.png — jamais un placeholder.
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  // Couleur de fond réglable (Admin › Système › Modèles PDF) ; null = dégradé ardoise par défaut.
  const [bg, setBg] = useState<string | null>(null);
  useEffect(() => {
    if (!tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
    getKioskBg(tenant).then(setBg, () => {});
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
    <div className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center text-white ${bg ? '' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'}`} style={bg ? { backgroundColor: bg } : undefined}>
      <button onClick={() => setActive(false)} className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-white/10" title={tr('Fermer', 'Close')}><X size={22} /></button>
      {logoFailed
        ? <ShieldCheck size={40} className="mb-6 text-emerald-500/70" />
        : <img src={logoUrl || '/logo.png'} alt="" className="mb-6 h-20 w-auto object-contain drop-shadow-lg" onError={() => setLogoFailed(true)} />}
      {s.stats && s.stats.length > 1 ? (
        <>
          <div className="mb-6 text-2xl font-semibold uppercase tracking-[0.3em] text-slate-200 sm:text-3xl">{s.title}</div>
          <div className={`grid w-full max-w-5xl gap-x-10 gap-y-8 px-6 ${s.stats.length >= 4 ? 'grid-cols-2' : s.stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {s.stats.map((st, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`font-black leading-none ${st.accent || 'text-white'}`} style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}>{st.value}</div>
                <div className="mt-2 text-center text-base font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-lg">{st.label}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={`font-black leading-none ${s.accent}`} style={{ fontSize: 'clamp(7rem, 30vw, 24rem)' }}>{s.big}</div>
          <div className="mt-4 text-2xl font-semibold uppercase tracking-[0.3em] text-slate-200 sm:text-3xl">{s.title}</div>
          {s.sub && <div className="mt-2 text-slate-400">{s.sub}</div>}
        </>
      )}
      <div className="mt-10 flex gap-2">
        {shown.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/30'}`} />)}
      </div>
      <div className="absolute bottom-6 text-xs text-slate-500">{tr('Bougez la souris ou touchez l’écran pour revenir', 'Move the mouse or touch the screen to return')}</div>
    </div>
  );
}
