'use client';
// Tableau « sécurité » du dashboard principal : accidents / passés proches de l'année + compteurs
// « jours sans … » (repartent à 0 sur un événement ; plancher = jour 0 de l'abonnement). Données réelles
// via /api/incidents/safety-board (scopé au tenant de session). S'efface en silence si non disponible.
import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, CalendarCheck2 } from 'lucide-react';

type Board = {
  year: number; baseline: string; accidentsYTD: number; nearMissYTD: number;
  daysSinceAccident: number; daysSinceNearMiss: number; lastAccidentDate: string | null; lastNearMissDate: string | null;
};

export function SafetyBoard({ lang = 'fr' }: { lang?: 'fr' | 'en' }) {
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
  const cards = [
    { key: 'da', icon: CalendarCheck2, big: b.daysSinceAccident, title: tr('Jours sans accident', 'Days without accident'),
      sub: b.lastAccidentDate ? tr(`dernier : ${fmt(b.lastAccidentDate)}`, `last: ${fmt(b.lastAccidentDate)}`) : tr('depuis le début de l’abonnement', 'since subscription start'),
      cls: 'from-emerald-500 to-teal-600' },
    { key: 'dn', icon: CalendarCheck2, big: b.daysSinceNearMiss, title: tr('Jours sans passé proche', 'Days without near-miss'),
      sub: b.lastNearMissDate ? tr(`dernier : ${fmt(b.lastNearMissDate)}`, `last: ${fmt(b.lastNearMissDate)}`) : tr('depuis le début de l’abonnement', 'since subscription start'),
      cls: 'from-sky-500 to-blue-600' },
    { key: 'ay', icon: AlertTriangle, big: b.accidentsYTD, title: tr(`Accidents en ${b.year}`, `Accidents in ${b.year}`),
      sub: tr('année en cours', 'current year'), cls: b.accidentsYTD ? 'from-rose-500 to-red-600' : 'from-gray-400 to-gray-500' },
    { key: 'ny', icon: AlertTriangle, big: b.nearMissYTD, title: tr(`Passés proches en ${b.year}`, `Near-misses in ${b.year}`),
      sub: tr('année en cours', 'current year'), cls: b.nearMissYTD ? 'from-amber-500 to-orange-600' : 'from-gray-400 to-gray-500' },
  ];

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
        <ShieldCheck size={16} className="text-emerald-600" /> {tr('Sécurité', 'Safety')}
        <span className="text-xs font-normal text-gray-400">{tr(`depuis le jour 0 de l’abonnement (${fmt(b.baseline)})`, `since day 0 of subscription (${fmt(b.baseline)})`)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.key} className={`rounded-2xl bg-gradient-to-br ${c.cls} p-4 text-white shadow-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{c.title}</span>
                <Icon size={16} className="opacity-80" />
              </div>
              <div className="mt-1 text-3xl font-extrabold leading-none">{c.big}</div>
              <div className="mt-1 text-[11px] opacity-80">{c.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
