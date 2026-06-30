'use client';
// Panneau d'affichage SÉCURITÉ plein écran (diffusion sur un écran d'atelier/chantier — « X jours sans
// accident »). Gros chiffres lisibles de loin, rafraîchissement auto, bascule plein écran. Données réelles
// via /api/incidents/safety-board (tenant de session).
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Maximize, Minimize, RotateCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

type Board = {
  year: number; baseline: string; accidentsYTD: number; nearMissYTD: number;
  daysSinceAccident: number; daysSinceNearMiss: number; lastAccidentDate: string | null; lastNearMissDate: string | null;
};

export default function SafetyDisplayPage() {
  const { tenant } = useParams() as { tenant: string };
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const [b, setB] = useState<Board | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const [updated, setUpdated] = useState<string>('');

  const load = useCallback(() => {
    // Passer le tenant de la PAGE (sinon, pour un super_admin, l'API retombe sur le tenant de SESSION
    // → « jours sans accident » divergent de l'onglet Accidents qui, lui, passe ?tenant=).
    fetch(`/api/incidents/safety-board?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (j?.ok) { setB(j); setUpdated(new Date().toLocaleTimeString(lang === 'en' ? 'en-CA' : 'fr-CA')); } })
      .catch(() => {});
  }, [lang, tenant]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // rafraîchit toutes les 5 min
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    supabase.from('tenants').select('logo_url, name').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if ((data as any)?.logo_url) setLogo((data as any).logo_url); }, () => {});
  }, [tenant]);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFull = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };

  const fmt = (d: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA') : tr('aucun', 'none'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Barre d'outils (cachée à l'impression / discrète) */}
      <div className="flex items-center justify-between px-6 py-4 print:hidden">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img src={logo} alt="" className="h-10 w-auto" /> : <span className="text-lg font-bold">C-Secur360</span>}
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <button onClick={load} title={tr('Rafraîchir', 'Refresh')} className="rounded-lg p-2 hover:bg-white/10"><RotateCw size={18} /></button>
          <button onClick={toggleFull} title={tr('Plein écran', 'Full screen')} className="rounded-lg p-2 hover:bg-white/10">{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
          <Link href={`/${tenant}/accidents`} title={tr('Retour', 'Back')} className="rounded-lg p-2 hover:bg-white/10"><ArrowLeft size={18} /></Link>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl flex-col items-center justify-center px-6 text-center">
        {!b ? (
          <div className="text-slate-400">{tr('Chargement…', 'Loading…')}</div>
        ) : (
          <>
            {/* Compteur principal : jours sans accident */}
            <div className="text-xl font-semibold uppercase tracking-[0.3em] text-emerald-400">{tr('Jours sans accident', 'Days without accident')}</div>
            <div className="my-2 font-black leading-none text-white" style={{ fontSize: 'clamp(6rem, 26vw, 20rem)' }}>{b.daysSinceAccident}</div>
            <div className="text-sm text-slate-400">{b.lastAccidentDate ? tr(`Dernier accident : ${fmt(b.lastAccidentDate)}`, `Last accident: ${fmt(b.lastAccidentDate)}`) : tr('Aucun accident depuis le début de l’abonnement', 'No accident since subscription start')}</div>

            {/* Bandeau secondaire */}
            <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <Tile color="text-sky-400" value={b.daysSinceNearMiss} label={tr('jours sans passé proche', 'days without near-miss')} />
              <Tile color={b.accidentsYTD ? 'text-rose-400' : 'text-slate-300'} value={b.accidentsYTD} label={tr(`accidents en ${b.year}`, `accidents in ${b.year}`)} />
              <Tile color={b.nearMissYTD ? 'text-amber-400' : 'text-slate-300'} value={b.nearMissYTD} label={tr(`passés proches en ${b.year}`, `near-misses in ${b.year}`)} />
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-4 text-center text-xs text-slate-500 print:hidden">
        {tr('Mise à jour', 'Updated')} {updated} · {tr('rafraîchissement auto 5 min', 'auto-refresh 5 min')}
      </div>
    </div>
  );
}

function Tile({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-5">
      <div className={`text-5xl font-black leading-none ${color}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
