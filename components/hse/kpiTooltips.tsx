'use client';
// Infobulles réutilisables pour les graphiques KPI HSE. Style uniforme (arrondi, bordure, fond clair/sombre,
// text-xs). Règle d'or : ne JAMAIS afficher un taux « 0 » trompeur quand il n'y a aucune heure déclarée.
import React from 'react';

const box =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800';

/**
 * Infobulle du graphique de tendance (taux normalisés).
 * Liste chaque série visible (pastille couleur + valeur), montre les heures (cumul glissant) et, si les
 * heures = 0, affiche « — » + « Aucune heure déclarée » À LA PLACE des taux à 0 (jamais un 0 trompeur).
 */
export function RateTooltip({ active, payload, label, lang = 'fr', rollingLabel }: any) {
  if (!active || !payload || !payload.length) return null;
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const datum = payload[0]?.payload || {};
  const hours = Number(datum.hours) || 0;
  const noHours = hours <= 0;
  const rateSeries = payload.filter((p: any) => p.dataKey !== 'hours');

  return (
    <div className={box}>
      <div className="mb-1 font-semibold text-gray-700 dark:text-gray-100">
        {label}
        {rollingLabel ? <span className="font-normal text-gray-400"> · {rollingLabel}</span> : null}
      </div>
      {noHours ? (
        <div className="text-gray-400">— {tr('Aucune heure déclarée', 'No hours reported')}</div>
      ) : (
        <>
          {rateSeries.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-gray-600 dark:text-gray-300">{p.name}</span>
              </span>
              <b className="tabular-nums text-gray-800 dark:text-gray-100">{Number(p.value).toFixed(2)}</b>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-gray-100 pt-1 dark:border-gray-700">
            <span className="text-gray-500">{tr('Heures (12 m glissants)', 'Hours (rolling 12m)')}</span>
            <b className="tabular-nums text-gray-700 dark:text-gray-200">{hours.toLocaleString()}</b>
          </div>
        </>
      )}
      {datum.confidence_level != null && (
        <div className="mt-1 text-[10px] text-gray-400">
          {tr('Confiance', 'Confidence')}: {String(datum.confidence_level)}
        </div>
      )}
    </div>
  );
}

/** Infobulle simple pour les graphiques en barres (libellé + nombre entier). */
export function CountTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const name = p?.payload?.label ?? label;
  return (
    <div className={box}>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
        <span className="text-gray-600 dark:text-gray-300">{name}</span>
        <b className="ml-2 tabular-nums text-gray-800 dark:text-gray-100">{Math.round(Number(p.value) || 0)}</b>
      </span>
    </div>
  );
}
