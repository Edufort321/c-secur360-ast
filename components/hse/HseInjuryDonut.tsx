'use client';
// Beigne « Blessures par partie du corps » (tableau de bord HSE). Source = incident_reports (module
// Accidents) via /api/hse/injury-stats (service_role, tier≥4, comptages agrégés — Loi 25). Filtre la
// période : semaine / mois / année en cours, ou tout. Regroupe les ~50 zones du schéma corporel en ~12 régions.
import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { bodyRegionGroup, BODY_GROUP_LABELS, type BodyGroup } from '@/lib/hse/bodyRegions';

type Period = 'week' | 'month' | 'year' | 'all';

// Fenêtre [from,to] (AAAA-MM-JJ) pour la période choisie, relative à aujourd'hui.
function periodWindow(p: Period): { from?: string; to?: string } {
  if (p === 'all') return {};
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (p === 'year') return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  if (p === 'month') { const y = now.getFullYear(), m = now.getMonth(); return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) }; }
  // semaine ISO (lundi → dimanche)
  const day = (now.getDay() + 6) % 7; // 0 = lundi
  const mon = new Date(now); mon.setDate(now.getDate() - day);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { from: iso(mon), to: iso(sun) };
}

export function HseInjuryDonut({ tenant, lang = 'fr', card }: { tenant: string; lang?: 'fr' | 'en'; card?: string }) {
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const cls = card || 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  const [period, setPeriod] = useState<Period>('year');
  const [byRegion, setByRegion] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { from, to } = periodWindow(period);
      const qs = new URLSearchParams({ tenant });
      if (from) qs.set('from', from); if (to) qs.set('to', to);
      try {
        const r = await fetch(`/api/hse/injury-stats?${qs.toString()}`, { credentials: 'include' });
        const j = r.ok ? await r.json() : {};
        if (alive) { setByRegion(j.byRegion || {}); setTotal(Number(j.totalInjuries) || 0); }
      } catch { if (alive) { setByRegion({}); setTotal(0); } }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [tenant, period]);

  // Regroupe les zones brutes en régions lisibles + trie décroissant.
  const data = useMemo(() => {
    const g: Record<string, number> = {};
    for (const [k, v] of Object.entries(byRegion)) { const grp = bodyRegionGroup(k); g[grp] = (g[grp] || 0) + (Number(v) || 0); }
    return (Object.entries(g) as [BodyGroup, number][])
      .map(([grp, value]) => ({ grp, name: tr(BODY_GROUP_LABELS[grp].fr, BODY_GROUP_LABELS[grp].en), value, color: BODY_GROUP_LABELS[grp].color }))
      .sort((a, b) => b.value - a.value);
  }, [byRegion, EN]);

  const totalRegions = data.reduce((s, d) => s + d.value, 0);
  const PERIODS: { k: Period; fr: string; en: string }[] = [
    { k: 'week', fr: 'Semaine', en: 'Week' }, { k: 'month', fr: 'Mois', en: 'Month' },
    { k: 'year', fr: 'Année', en: 'Year' }, { k: 'all', fr: 'Tout', en: 'All' },
  ];

  return (
    <div className={cls}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Blessures par partie du corps', 'Injuries by body part')}</div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
          {PERIODS.map(p => (
            <button key={p.k} onClick={() => setPeriod(p.k)} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${period === p.k ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{tr(p.fr, p.en)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid h-56 place-items-center text-sm text-gray-400">…</div>
      ) : totalRegions === 0 ? (
        <div className="grid h-56 place-items-center text-center text-sm text-gray-400">{tr('Aucune blessure enregistrée sur la période.', 'No injury recorded for this period.')}</div>
      ) : (
        <div className="grid items-center gap-3 sm:grid-cols-2">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={1} stroke="none">
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v}`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{totalRegions}</div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400">{tr('localisations', 'locations')}</div>
            </div>
          </div>
          <div className="space-y-1">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
                <span className="flex-1 truncate text-gray-600 dark:text-gray-300">{d.name}</span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">{d.value}</span>
                <span className="w-9 text-right tabular-nums text-gray-400">{Math.round((d.value / totalRegions) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 text-[11px] text-gray-400">{tr(`${total} blessé(s) sur la période · une blessure peut toucher plusieurs régions.`, `${total} injured on the period · one injury can affect several regions.`)}</div>
    </div>
  );
}

export default HseInjuryDonut;
