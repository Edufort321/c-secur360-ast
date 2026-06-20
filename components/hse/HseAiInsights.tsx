'use client';
// Analyse IA des tendances SST (à la demande). Appelle /api/hse/insights (agrégats anonymisés → Claude).
// Affiche points chauds, patterns, risques émergents et recommandations préventives priorisées.
import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

const PRIO: Record<string, string> = {
  haute: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  moyenne: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  basse: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
};

export function HseAiInsights({ tenant, lang = 'fr', card }: { tenant: string; lang?: 'fr' | 'en'; card?: string }) {
  const EN = lang === 'en';
  const tr = (fr: string, en: string) => (EN ? en : fr);
  const cls = card || 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
  const [loading, setLoading] = useState(false);
  const [ins, setIns] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true); setMsg(null); setIns(null);
    try {
      const r = await fetch(`/api/hse/insights?tenant=${encodeURIComponent(tenant)}`, { method: 'POST', credentials: 'include' });
      const j = await r.json();
      if (!r.ok) { setMsg(j.error || tr('Échec de l’analyse.', 'Analysis failed.')); }
      else if (j.error === 'insufficient') { setMsg(j.message || tr('Pas assez de données.', 'Not enough data.')); }
      else setIns(j.insights);
    } catch { setMsg(tr('Erreur réseau.', 'Network error.')); }
    setLoading(false);
  }

  return (
    <div className={`${cls} lg:col-span-2`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100"><Sparkles size={16} className="text-violet-500" /> {tr('Analyse IA des tendances SST', 'AI safety trend analysis')}</div>
        <button onClick={run} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {loading ? tr('Analyse…', 'Analyzing…') : tr('Analyser', 'Analyze')}
        </button>
      </div>

      {msg && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">{msg}</div>}
      {!ins && !msg && !loading && <p className="text-xs text-gray-400">{tr('Lance une analyse des incidents (agrégats anonymisés — aucune donnée nominative envoyée).', 'Run an analysis of incidents (anonymized aggregates — no personal data sent).')}</p>}

      {ins && (
        <div className="space-y-3 text-sm">
          {Array.isArray(ins.hotspots) && ins.hotspots.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500"><AlertTriangle size={13} className="text-rose-500" /> {tr('Points chauds', 'Hotspots')}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {ins.hotspots.map((h: any, i: number) => (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/40">
                    <div className="flex items-center justify-between"><span className="font-semibold text-gray-800 dark:text-gray-100">{h.label}</span>{h.count != null && <span className="rounded bg-rose-100 px-1.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{h.count}</span>}</div>
                    <div className="text-[12px] text-gray-500">{h.insight}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(ins.patterns) && ins.patterns.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500"><TrendingUp size={13} className="text-blue-500" /> {tr('Tendances', 'Patterns')}</div>
              <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-gray-600 dark:text-gray-300">{ins.patterns.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {Array.isArray(ins.risques_emergents) && ins.risques_emergents.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500"><ShieldAlert size={13} className="text-amber-500" /> {tr('Risques émergents', 'Emerging risks')}</div>
              <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-gray-600 dark:text-gray-300">{ins.risques_emergents.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {Array.isArray(ins.recommandations) && ins.recommandations.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-bold uppercase text-gray-500">{tr('Recommandations préventives', 'Preventive recommendations')}</div>
              <div className="space-y-1.5">
                {ins.recommandations.map((r: any, i: number) => (
                  <div key={i} className="rounded-lg border border-gray-100 p-2 dark:border-gray-700">
                    <div className="flex items-center gap-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${PRIO[String(r.priorite || '').toLowerCase()] || PRIO.basse}`}>{r.priorite || '—'}</span><span className="font-semibold text-gray-800 dark:text-gray-100">{r.titre}</span></div>
                    {r.justification && <div className="mt-0.5 text-[12px] text-gray-500">{r.justification}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {ins.synthese && <div className="rounded-lg bg-violet-50 px-3 py-2 text-[12px] text-violet-800 dark:bg-violet-500/10 dark:text-violet-200">{ins.synthese}</div>}
        </div>
      )}
    </div>
  );
}

export default HseAiInsights;
