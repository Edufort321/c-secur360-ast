'use client';
// Carte « Sécurité » du dashboard : accidents / passés proches de l'année + compteurs « jours sans … »
// (repartent à 0 sur un événement ; plancher = jour 0 de l'abonnement). Petites PASTILLES de couleur.
// Deux modes : 'card' (relevés en petit + case « épingler en haut ») et 'strip' (bandeau épinglé en haut).
// Données réelles via /api/incidents/safety-board (tenant de session). S'efface en silence si indisponible.
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

type Board = {
  year: number; baseline: string; accidentsYTD: number; nearMissYTD: number;
  daysSinceAccident: number; daysSinceNearMiss: number; lastAccidentDate: string | null; lastNearMissDate: string | null;
};

export function SafetyBoard({ lang = 'fr', variant = 'card', pinned = false, onTogglePin }: {
  lang?: 'fr' | 'en'; variant?: 'card' | 'strip'; pinned?: boolean; onTogglePin?: () => void;
}) {
  const [b, setB] = useState<Board | null>(null);
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  useEffect(() => {
    let active = true;
    fetch('/api/incidents/safety-board', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (active && j?.ok) setB(j); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  if (!b) return null;

  const fmt = (d: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA') : tr('aucun', 'none'));
  const items = [
    { dot: 'bg-emerald-500', value: b.daysSinceAccident, label: tr('jours sans accident', 'days without accident') },
    { dot: 'bg-sky-500', value: b.daysSinceNearMiss, label: tr('jours sans passé proche', 'days without near-miss') },
    { dot: b.accidentsYTD ? 'bg-rose-500' : 'bg-gray-300', value: b.accidentsYTD, label: tr(`accidents en ${b.year}`, `accidents in ${b.year}`) },
    { dot: b.nearMissYTD ? 'bg-amber-500' : 'bg-gray-300', value: b.nearMissYTD, label: tr(`passés proches en ${b.year}`, `near-misses in ${b.year}`) },
  ];

  // BANDEAU épinglé en haut : relevés en ligne, compact.
  if (variant === 'strip') {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100"><ShieldCheck size={15} className="text-emerald-600" /> {tr('Sécurité', 'Safety')}</span>
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${it.dot}`} />
            <span className="text-lg font-extrabold text-gray-900 dark:text-white">{it.value}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{it.label}</span>
          </span>
        ))}
      </div>
    );
  }

  // CARTE : relevés en petit + case à cocher « épingler en haut ».
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600" />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Sécurité', 'Safety')}</span>
        <span className="text-[11px] text-gray-400">{tr(`depuis le jour 0 de l’abonnement (${fmt(b.baseline)})`, `since day 0 of subscription (${fmt(b.baseline)})`)}</span>
        {onTogglePin && (
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <input type="checkbox" checked={pinned} onChange={onTogglePin} className="accent-emerald-600" />
            {tr('Épingler en haut', 'Pin to top')}
          </label>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${it.dot}`} />
            <div className="min-w-0">
              <div className="text-xl font-extrabold leading-none text-gray-900 dark:text-white">{it.value}</div>
              <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
