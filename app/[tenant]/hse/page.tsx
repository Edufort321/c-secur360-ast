'use client';
// Module HSE (Santé & sécurité) — registres réglementaires + incidents/échéances + KPI (LTIFR/TRIR).
// Données : lib/hse/data ; calculs purs : lib/hse/kpi. Juridictions CANADIENNES (fédéral + provinces/territoires), bilingue FR/EN.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertTriangle, ClipboardList, Settings, Plus, Check, Download, Trash2, Lock, Paperclip } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getFrameworks, getRegisterTypes, getHseSettings, saveHseSettings, getTenantRegisters, toggleTenantRegister,
  getRegisterEntries, saveRegisterEntry, deleteRegisterEntry, computeReviewDue, getIncidents, saveIncident,
  getOpenDeadlines, getDeadlinesForIncident, completeDeadline, getHoursWorked, saveHoursWorked, getRegistersDue,
  getProactiveMetrics, getInterconnectStats,
  type HseFramework, type HseRegisterType, type HseSettings, type HseTenantRegister, type HseIncident, type HseDeadline, type HseHours, type HseProactive, type HseInterconnect,
} from '@/lib/hse/data';
import { computeMonthlyKpi, computeAggregateKpi, formatDeadlineDelay } from '@/lib/hse/kpi';
import { resolveKpiHours, type HoursBreakdown } from '@/lib/hse/hoursSource';
import { HseKpiCharts } from '@/components/hse/HseKpiCharts';
import { HseAttachments } from '@/components/hse/HseAttachments';

type Tab = 'kpi' | 'incidents' | 'registers' | 'config';
const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

// Types d'événement (doivent matcher hse_deadline_rule.event_code du seed).
const EVENT_CODES: { code: string; fr: string; en: string }[] = [
  { code: 'NEAR_MISS', fr: 'Passé proche', en: 'Near-miss' },
  { code: 'RECORDABLE', fr: 'Accident enregistrable', en: 'Recordable injury' },
  { code: 'OVER_7_DAY', fr: 'Incapacité > 7 jours', en: 'Over-7-day incapacitation' },
  { code: 'SPECIFIED_INJURY', fr: 'Blessure spécifiée / grave', en: 'Specified / serious injury' },
  { code: 'MULTI_WORKER_INJURY', fr: 'Blessures à plusieurs travailleurs', en: 'Multiple-worker injuries' },
  { code: 'FATALITY', fr: 'Décès', en: 'Fatality' },
  { code: 'OCC_DISEASE', fr: 'Maladie professionnelle', en: 'Occupational disease' },
  { code: 'DANGEROUS_OCCURRENCE', fr: 'Événement dangereux', en: 'Dangerous occurrence' },
  { code: 'NON_WORKER_HOSPITAL', fr: 'Hospitalisation non-travailleur', en: 'Non-worker hospitalized' },
  { code: 'MATERIAL_DAMAGE', fr: 'Dommages matériels importants', en: 'Significant material damage' },
];

export default function HsePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const EN = lang === 'en';
  const [tab, setTab] = useState<Tab>('kpi');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // ── Verrou d'accès (lot 1) : HSE = niveau ADMIN (tier ≥ 4) ; infos santé sensibles = RH (tier ≥ 6).
  const HSE_VIEW_TIER = 4;   // administration
  const HSE_HR_TIER = 6;     // rh (canHr) — registres santé / champs médicaux / pièces sensibles
  const [tier, setTier] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/me/access?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null)).then(j => setTier(Number(j?.tier) || 0)).catch(() => setTier(0));
  }, [tenant]);
  const canView = tier != null && tier >= HSE_VIEW_TIER;
  const canHr = (tier ?? 0) >= HSE_HR_TIER;

  const [settings, setSettings] = useState<HseSettings | null>(null);
  const [frameworks, setFrameworks] = useState<HseFramework[]>([]);
  const [regTypes, setRegTypes] = useState<HseRegisterType[]>([]);
  const [tenantRegs, setTenantRegs] = useState<HseTenantRegister[]>([]);
  const [incidents, setIncidents] = useState<HseIncident[]>([]);
  const [deadlines, setDeadlines] = useState<HseDeadline[]>([]);
  const [hours, setHours] = useState<HseHours[]>([]);          // saisies manuelles (hse_hours_worked)
  const [autoHours, setAutoHours] = useState<HseHours[]>([]);  // dénominateur résolu (feuilles de temps + manuel)
  const [breakdown, setBreakdown] = useState<HoursBreakdown | null>(null);
  const [proactive, setProactive] = useState<HseProactive[]>([]);
  const [interconnect, setInterconnect] = useState<HseInterconnect | null>(null);
  const [registersDue, setRegistersDue] = useState<any[]>([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, fw, rt, treg, inc, dl, hr, rd, pro] = await Promise.all([
        getHseSettings(tenant), getFrameworks(), getRegisterTypes(), getTenantRegisters(tenant),
        getIncidents(tenant), getOpenDeadlines(tenant), getHoursWorked(tenant), getRegistersDue(tenant),
        getProactiveMetrics(tenant),
      ]);
      setSettings(s); setFrameworks(fw); setRegTypes(rt); setTenantRegs(treg);
      setIncidents(inc); setDeadlines(dl); setHours(hr); setRegistersDue(rd); setProactive(pro);
      // Dénominateur AUTO : feuilles de temps (réel) priorisées, manuel comble les semaines non couvertes.
      const resolved = await resolveKpiHours(tenant, hr);
      setAutoHours(resolved.hours); setBreakdown(resolved.breakdown);
      setInterconnect(await getInterconnectStats(tenant, resolved.breakdown.plannedHours));
    } catch (e: any) { setNotice(tr('Module non initialisé — appliquez les migrations 248/249.', 'Module not initialized — apply migrations 248/249.')); }
    setLoading(false);
  }
  // Ne charge les données HSE que si l'accès est suffisant (tier ≥ administration).
  useEffect(() => { if (canView) loadAll(); else if (tier != null) setLoading(false); /* eslint-disable-next-line */ }, [tenant, canView]);

  const rateBase = settings?.rate_base_hours || 200000;
  const kpiRows = useMemo(() => computeMonthlyKpi(incidents as any, autoHours as any, rateBase), [incidents, autoHours, rateBase]);
  const agg = useMemo(() => computeAggregateKpi(kpiRows, rateBase), [kpiRows, rateBase]);
  const mny = (n: number) => (Number(n) || 0).toLocaleString(EN ? 'en-CA' : 'fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const TABS: { k: Tab; label: string; icon: any }[] = [
    { k: 'kpi', label: tr('Tableau de bord', 'Dashboard'), icon: ShieldCheck },
    { k: 'incidents', label: tr('Incidents & échéances', 'Incidents & deadlines'), icon: AlertTriangle },
    { k: 'registers', label: tr('Registres', 'Registers'), icon: ClipboardList },
    { k: 'config', label: tr('Configuration', 'Configuration'), icon: Settings },
  ];
  const card = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PortalHeader tenant={tenant} />
      {tier == null ? (
        <div className="grid place-items-center py-32 text-gray-400"><Loader2 className="animate-spin" /></div>
      ) : !canView ? (
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gray-900 text-white dark:bg-gray-700"><Lock size={26} /></div>
          <h1 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{tr('Accès réservé', 'Restricted access')}</h1>
          <p className="text-sm text-gray-500">{tr('Le module Santé et sécurité (registres réglementaires & KPI) est réservé au niveau administration (ou supérieur). Les renseignements de santé sensibles ne sont visibles qu’aux profils RH.', 'The Health & Safety module (regulatory registers & KPIs) is restricted to the administration level (or above). Sensitive health information is visible only to HR profiles.')}</p>
          <p className="mt-2 text-xs text-gray-400">{tr('Demandez à un administrateur de votre organisation de relever votre niveau d’accès.', 'Ask an administrator in your organization to raise your access level.')}</p>
        </div>
      ) : (
      <div className="mx-auto max-w-6xl px-4 py-5">
        <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">{tr('Santé et sécurité — HSE', 'Health & Safety — HSE')}</h1>
        <p className="mb-4 text-sm text-gray-500">{tr('Registres réglementaires, échéances (normes canadiennes — fédéral + provinces/territoires) et KPI (LTIFR/TRIR). Indicatif — à valider par une personne qualifiée.', 'Regulatory registers, deadlines (Canadian standards — federal + provinces/territories) and KPIs (LTIFR/TRIR). Indicative — validate with a qualified person.')}</p>

        <div className="mb-4 flex w-fit flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {TABS.map(t => { const I = t.icon; return (
            <button key={t.k} onClick={() => setTab(t.k)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === t.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}><I size={15} /> {t.label}</button>
          ); })}
        </div>
        {notice && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">{notice}</div>}

        {loading ? <div className="grid place-items-center py-20 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <>
            {tab === 'kpi' && <KpiTab tr={tr} EN={EN} card={card} agg={agg} kpiRows={kpiRows} rateBase={rateBase} deadlines={deadlines} registersDue={registersDue} hours={hours} incidents={incidents} proactive={proactive} breakdown={breakdown} interconnect={interconnect} tenant={tenant} onHours={async (h: HseHours) => { const r = await saveHoursWorked(tenant, h); if (r.error) { setNotice(tr('Heures non enregistrées : ' + r.error, 'Hours not saved: ' + r.error)); return; } await loadAll(); }} settings={settings} />}
            {tab === 'incidents' && <IncidentsTab tr={tr} card={card} tenant={tenant} incidents={incidents} deadlines={deadlines} configured={!!settings?.framework_id} canHr={canHr} onSaved={async () => { setIncidents(await getIncidents(tenant)); setDeadlines(await getOpenDeadlines(tenant)); }} onComplete={async (id: string) => { await completeDeadline(tenant, id); setDeadlines(await getOpenDeadlines(tenant)); }} />}
            {tab === 'registers' && <RegistersTab tr={tr} card={card} tenant={tenant} regTypes={regTypes} tenantRegs={tenantRegs} canHr={canHr} />}
            {tab === 'config' && <ConfigTab tr={tr} card={card} tenant={tenant} frameworks={frameworks} regTypes={regTypes} tenantRegs={tenantRegs} settings={settings} onSaved={loadAll} setNotice={setNotice} />}
          </>
        )}
      </div>
      )}
    </div>
  );
}

// ── KPI ────────────────────────────────────────────────────────────────────────────────────────────
function KpiTab({ tr, EN, card, agg, kpiRows, rateBase, deadlines, registersDue, hours, incidents, proactive, breakdown, interconnect, tenant, onHours, settings }: any) {
  const [h, setH] = useState({ period_start: '', period_end: '', hours: '' });
  const Stat = ({ v, l, c }: any) => <div className={card}><div className="text-[11px] font-semibold uppercase text-gray-400">{l}</div><div className={`text-2xl font-extrabold ${c}`}>{v}</div></div>;

  // Jours sans accident avec arrêt (indicateur d'affichage chantier).
  const lastLti = (incidents || []).filter((i: any) => i.is_lost_time).map((i: any) => new Date(i.occurred_at).getTime()).sort((a: number, b: number) => b - a)[0];
  const daysSinceLti = lastLti ? Math.floor((Date.now() - lastLti) / 86400000) : null;

  // Qualité de données : mois avec incidents mais 0 heure (taux faussés).
  const monthsNoHours = (kpiRows || []).filter((r: any) => r.hours <= 0 && (r.recordableCount > 0 || r.nearMissCount > 0 || r.ltiCount > 0)).map((r: any) => r.month);

  const srcLabel: Record<string, string> = {
    timesheets: tr('Feuilles de temps (auto)', 'Timesheets (auto)'),
    manual: tr('Saisie manuelle', 'Manual entry'),
    mixed: tr('Feuilles de temps + manuel', 'Timesheets + manual'),
    none: tr('Aucune source', 'No source'),
  };
  async function exportPdf() {
    const { exportHseScorecard } = await import('@/lib/hse/scorecardPdf');
    await exportHseScorecard({ tenant, lang: EN ? 'en' : 'fr', agg, rows: kpiRows, rateBase }).catch(() => {});
  }
  return (
    <div className="space-y-4">
      {!settings?.framework_id && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10">{tr('Configurez d’abord le cadre réglementaire (onglet Configuration).', 'Configure the regulatory framework first (Configuration tab).')}</div>}

      {/* Compteur jours sans accident avec arrêt (affichage chantier) */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-transparent">
        <div className="flex items-end justify-between">
          <div><div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{tr('Jours sans accident avec arrêt', 'Days without a lost-time injury')}</div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{daysSinceLti == null ? '—' : daysSinceLti}</div></div>
          <div className="text-right text-[11px] text-gray-400">{daysSinceLti == null ? tr('Aucun accident avec arrêt enregistré.', 'No lost-time injury on record.') : tr('Depuis le dernier LTI.', 'Since the last LTI.')}</div>
        </div>
      </div>

      {monthsNoHours.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">⚠️ {tr('Qualité des données : mois avec incidents mais 0 heure travaillée (taux faussés)', 'Data quality: month(s) with incidents but 0 hours (rates skewed)')} — {monthsNoHours.join(', ')}.</div>}

      <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{tr('KPI cumulés', 'Aggregate KPIs')} <span className="text-xs font-normal text-gray-400">({tr('base', 'base')} {rateBase.toLocaleString()} h)</span></h2>
        {kpiRows.length > 0 && <button onClick={exportPdf} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"><Download size={14} /> {tr('Scorecard PDF', 'Scorecard PDF')}</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat l="LTIFR / TF1" v={agg.ltifr} c="text-rose-600" />
        <Stat l="TRIR / TF2" v={agg.trir} c="text-amber-600" />
        <Stat l={tr('Taux de gravité', 'Severity rate')} v={agg.severityRate} c="text-orange-600" />
        <Stat l={tr('Passés proches', 'Near-misses')} v={agg.nearMissCount} c="text-sky-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat l={tr('Heures travaillées', 'Hours worked')} v={agg.hours.toLocaleString()} c="text-gray-700 dark:text-gray-200" />
        <Stat l={tr('Accidents avec arrêt', 'Lost-time injuries')} v={agg.ltiCount} c="text-rose-600" />
        <Stat l={tr('Enregistrables', 'Recordables')} v={agg.recordableCount} c="text-amber-600" />
        <Stat l={tr('Jours perdus', 'Lost days')} v={agg.lostDays} c="text-orange-600" />
      </div>

      {/* Graphiques KPI (meilleures pratiques : tendances + pyramide Heinrich + leading/lagging) */}
      <HseKpiCharts rows={kpiRows} incidents={incidents} proactive={proactive} targets={{ ltifr: settings?.target_ltifr ?? null, trir: settings?.target_trir ?? null, severityRate: settings?.target_severity ?? null }} lang={EN ? 'en' : 'fr'} />

      {/* Interconnexions (contexte d'exposition issu des autres modules) */}
      {interconnect && (
        <div className={card}>
          <h3 className="mb-2 text-sm font-bold">{tr('Interconnexions (exposition)', 'Interconnections (exposure)')}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
            <div><div className="text-xl font-extrabold text-gray-700 dark:text-gray-200">{(breakdown?.timesheetHours || 0).toLocaleString()}</div><div className="text-[11px] text-gray-400">{tr('Heures réelles (feuilles de temps)', 'Real hours (timesheets)')}</div></div>
            <div><div className="text-xl font-extrabold text-indigo-600">{(interconnect.plannedHours || 0).toLocaleString()}</div><div className="text-[11px] text-gray-400">{tr('Heures-homme planifiées (planner)', 'Planned man-hours (planner)')}</div></div>
            <div><div className="text-xl font-extrabold text-sky-600">{interconnect.astCount}</div><div className="text-[11px] text-gray-400">{tr('AST (Santé et sécurité)', 'JSA forms')}</div></div>
            <div><div className="text-xl font-extrabold text-amber-600">{interconnect.permitCount}</div><div className="text-[11px] text-gray-400">{tr('Permis de travail', 'Work permits')}</div></div>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">{tr('Le dénominateur des taux utilise les heures RÉELLES (feuilles de temps). Le planifié et les compteurs AST/permis sont indicatifs (jamais additionnés au réel).', 'Rate denominator uses REAL hours (timesheets). Planned and AST/permit counts are indicative (never added to actuals).')}</p>
        </div>
      )}

      {kpiRows.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <h3 className="mb-2 text-sm font-bold">{tr('Évolution mensuelle', 'Monthly trend')}</h3>
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Mois', 'Month')}</th><th className="text-right">{tr('Heures', 'Hours')}</th><th className="text-right">LTIFR</th><th className="text-right">TRIR</th><th className="text-right">{tr('Gravité', 'Severity')}</th></tr></thead>
            <tbody>{kpiRows.map((r: any) => <tr key={r.month} className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1 font-semibold">{r.month}</td><td className="text-right tabular-nums text-gray-500">{r.hours.toLocaleString()}</td><td className="text-right tabular-nums font-semibold text-rose-600">{r.ltifr}</td><td className="text-right tabular-nums font-semibold text-amber-600">{r.trir}</td><td className="text-right tabular-nums text-orange-600">{r.severityRate}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {/* Heures travaillées (dénominateur) — AUTO depuis les feuilles de temps */}
      <div className={card}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">{tr('Heures travaillées (dénominateur des taux)', 'Hours worked (rate denominator)')}</h3>
          {breakdown && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{tr('Source', 'Source')} : {srcLabel[breakdown.source]} · {breakdown.weeks} {tr('semaine(s)', 'week(s)')}</span>}
        </div>
        <p className="mb-2 text-[11px] text-gray-500">{tr('Généré automatiquement depuis les feuilles de temps (cumul paie hebdo). La saisie ci-dessous est un complément manuel pour les semaines NON couvertes par les feuilles de temps.', 'Auto-generated from timesheets (weekly payroll roll-up). The entry below is a manual top-up for weeks NOT covered by timesheets.')}</p>
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-gray-500">{tr('Semaine du', 'Week of')}<input type="date" value={h.period_start} onChange={e => setH({ ...h, period_start: e.target.value, period_end: e.target.value })} className="mt-1 block rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Heures', 'Hours')}<input type="number" value={h.hours} onChange={e => setH({ ...h, hours: e.target.value })} className="mt-1 block w-28 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <button onClick={async () => { if (!h.period_start || !h.hours) return; await onHours({ period_start: h.period_start, period_end: h.period_end || h.period_start, hours: Number(h.hours) }); setH({ period_start: '', period_end: '', hours: '' }); }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">{tr('Ajouter', 'Add')}</button>
        </div>
        <p className="text-[11px] text-gray-400">{tr('Total cumulé', 'Cumulative total')} : {hours.reduce((s: number, x: any) => s + (Number(x.hours) || 0), 0).toLocaleString()} h</p>
      </div>

      {/* Rappels */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={card}>
          <h3 className="mb-2 text-sm font-bold">{tr('Échéances réglementaires ouvertes', 'Open regulatory deadlines')} ({deadlines.length})</h3>
          {deadlines.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune.', 'None.')}</p> : deadlines.slice(0, 8).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between border-t border-gray-50 py-1.5 text-sm dark:border-gray-700/50">
              <span>{EN ? d.label_en : d.label_fr}</span>
              <span className={`text-xs font-semibold ${d.status === 'overdue' ? 'text-rose-600' : 'text-amber-600'}`}>{new Date(d.due_at).toLocaleDateString(EN ? 'en-CA' : 'fr-CA')}</span>
            </div>
          ))}
        </div>
        <div className={card}>
          <h3 className="mb-2 text-sm font-bold">{tr('Registres à réviser (≤ 30 j)', 'Registers due (≤ 30 d)')} ({registersDue.length})</h3>
          {registersDue.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucun.', 'None.')}</p> : registersDue.slice(0, 8).map((r: any) => (
            <div key={r.id} className="flex items-center justify-between border-t border-gray-50 py-1.5 text-sm dark:border-gray-700/50">
              <span>{r.title} <span className="text-xs text-gray-400">({EN ? r.name_en : r.name_fr})</span></span>
              <span className="text-xs font-semibold text-amber-600">{r.review_due_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── INCIDENTS ────────────────────────────────────────────────────────────────────────────────────────
function IncidentsTab({ tr, card, tenant, incidents, deadlines, configured, canHr, onSaved, onComplete }: any) {
  const blank = (): HseIncident => ({ occurred_at: nowLocal(), event_code: 'NEAR_MISS', is_lost_time: false, lost_days: 0 });
  const [f, setF] = useState<HseIncident | null>(null);
  const [openInc, setOpenInc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gen, setGen] = useState<HseDeadline[] | null>(null);
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  async function submit() {
    if (!f) return; setBusy(true); setGen(null);
    const r = await saveIncident(tenant, { ...f, occurred_at: new Date(f.occurred_at).toISOString() });
    if (r.id) { const dl = await getDeadlinesForIncident(tenant, r.id); setGen(dl); await onSaved(); setF(null); }
    setBusy(false);
  }
  return (
    <div className="space-y-4">
      {!configured && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20">{tr('Sans cadre réglementaire configuré, aucune échéance ne sera générée automatiquement.', 'Without a configured framework, no deadline will be auto-generated.')}</div>}
      {gen && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20">{gen.length ? tr(`${gen.length} obligation(s) générée(s) automatiquement.`, `${gen.length} obligation(s) auto-generated.`) : tr('Aucune obligation réglementaire pour ce type/seuil.', 'No regulatory obligation for this type/threshold.')}</div>}

      {!f ? <button onClick={() => setF(blank())} className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"><Plus size={15} /> {tr('Déclarer un incident', 'Report an incident')}</button> : (
        <div className={card}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Date/heure', 'Date/time')}<input type="datetime-local" value={f.occurred_at} onChange={e => setF({ ...f, occurred_at: e.target.value })} className={inp} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Type d’événement', 'Event type')}<select value={f.event_code} onChange={e => setF({ ...f, event_code: e.target.value })} className={inp}>{EVENT_CODES.map(c => <option key={c.code} value={c.code}>{tr(c.fr, c.en)}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Lieu', 'Location')}<input value={f.location_text || ''} onChange={e => setF({ ...f, location_text: e.target.value })} className={inp} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Partie du corps', 'Body part')}<input value={f.body_part || ''} onChange={e => setF({ ...f, body_part: e.target.value })} className={inp} /></label>
            <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-gray-500"><input type="checkbox" checked={!!f.is_lost_time} onChange={e => setF({ ...f, is_lost_time: e.target.checked })} /> {tr('Avec arrêt de travail (LTI)', 'Lost-time injury (LTI)')}</label>
            <label className="text-xs font-semibold text-gray-500">{tr('Jours perdus', 'Lost days')}<input type="number" value={f.lost_days || 0} onChange={e => setF({ ...f, lost_days: Number(e.target.value) || 0 })} className={inp} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Dommages matériels ($)', 'Material damage ($)')}<input type="number" value={f.material_damage_amount ?? ''} onChange={e => setF({ ...f, material_damage_amount: e.target.value === '' ? null : Number(e.target.value) })} className={inp} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Description', 'Description')}<textarea value={f.description || ''} onChange={e => setF({ ...f, description: e.target.value })} rows={2} className={inp} /></label>
          </div>
          <div className="mt-3 flex justify-end gap-2"><button onClick={() => setF(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button><button onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : null} {tr('Enregistrer', 'Save')}</button></div>
        </div>
      )}

      <div className={card}>
        <h3 className="mb-2 text-sm font-bold">{tr('Échéances à traiter', 'Deadlines to action')} ({deadlines.length})</h3>
        {deadlines.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune échéance ouverte.', 'No open deadline.')}</p> : deadlines.map((d: any) => (
          <div key={d.id} className="flex items-center justify-between border-t border-gray-50 py-2 text-sm dark:border-gray-700/50">
            <span>{tr(d.label_fr, d.label_en)} · <span className={d.status === 'overdue' ? 'font-bold text-rose-600' : 'text-amber-600'}>{new Date(d.due_at).toLocaleString(tr('fr-CA', 'en-CA'))}{d.status === 'overdue' ? ` ⚠ ${tr('en retard', 'overdue')}` : ''}</span></span>
            <button onClick={() => onComplete(d.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"><Check size={13} /> {tr('Fait', 'Done')}</button>
          </div>
        ))}
      </div>

      <div className={`${card} overflow-x-auto`}>
        <h3 className="mb-2 text-sm font-bold">{tr('Incidents', 'Incidents')} ({incidents.length})</h3>
        {incidents.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucun incident.', 'No incident.')}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Date', 'Date')}</th><th>{tr('Type', 'Type')}</th><th>{tr('Lieu', 'Location')}</th><th className="text-right">{tr('Jours perdus', 'Lost days')}</th><th></th></tr></thead>
            <tbody>{incidents.map((i: any) => (
              <React.Fragment key={i.id}>
                <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1">{new Date(i.occurred_at).toLocaleDateString(tr('fr-CA', 'en-CA'))}</td><td>{tr(EVENT_CODES.find(c => c.code === i.event_code)?.fr || i.event_code, EVENT_CODES.find(c => c.code === i.event_code)?.en || i.event_code)}{i.is_lost_time ? ' · LTI' : ''}</td><td className="text-gray-500">{i.location_text || '—'}</td><td className="text-right tabular-nums">{i.lost_days || 0}</td><td className="text-right"><button onClick={() => setOpenInc(openInc === i.id ? null : i.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"><Paperclip size={12} /> {tr('Pièces', 'Files')}</button></td></tr>
                {openInc === i.id && <tr><td colSpan={5} className="pb-2"><HseAttachments tenant={tenant} entityType="incident" entityId={i.id} canHr={canHr} projectId={i.project_id} tr={tr} /></td></tr>}
              </React.Fragment>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── REGISTRES (form builder via field_schema) ────────────────────────────────────────────────────────
function RegistersTab({ tr, card, tenant, regTypes, tenantRegs, canHr }: any) {
  const enabled = tenantRegs.filter((t: any) => t.is_enabled);
  const enabledTypes = enabled.map((t: any) => ({ treg: t, type: regTypes.find((rt: any) => rt.id === t.register_type_id) })).filter((x: any) => x.type);
  const [sel, setSel] = useState<string>('');
  const cur = enabledTypes.find((x: any) => x.treg.id === sel) || enabledTypes[0];
  const [entries, setEntries] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (cur) getRegisterEntries(tenant, cur.treg.id).then(setEntries); }, [cur?.treg?.id, tenant]);
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  if (!enabledTypes.length) return <div className={card}><p className="text-sm text-gray-400">{tr('Aucun registre activé. Activez-en dans l’onglet Configuration.', 'No register enabled. Enable some in Configuration.')}</p></div>;
  const reviewMonths = cur ? (cur.treg.review_months_override ?? cur.type.default_review_months) : null;
  async function save() {
    if (!edit || !cur) return; setBusy(true);
    const review_due_at = computeReviewDue(edit.last_review_at, reviewMonths);
    await saveRegisterEntry(tenant, { ...edit, tenant_register_id: cur.treg.id, review_due_at });
    setEntries(await getRegisterEntries(tenant, cur.treg.id)); setEdit(null); setBusy(false);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={cur?.treg.id} onChange={e => { setSel(e.target.value); setEdit(null); }} className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          {enabledTypes.map((x: any) => <option key={x.treg.id} value={x.treg.id}>{tr(x.type.name_fr, x.type.name_en)}</option>)}
        </select>
        <button onClick={() => setEdit({ title: '', data: {}, last_review_at: today() })} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Nouvelle entrée', 'New entry')}</button>
      </div>

      {edit && cur && (
        <div className={card}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-500">{tr('Titre', 'Title')}<input value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} className={inp} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Référence', 'Reference')}<input value={edit.reference || ''} onChange={e => setEdit({ ...edit, reference: e.target.value })} className={inp} /></label>
            {(cur.type.field_schema || []).map((fld: any) => (
              <label key={fld.key} className="text-xs font-semibold text-gray-500">{tr(fld.label_fr || fld.key, fld.label_en || fld.key)}
                <input type={fld.type === 'date' ? 'date' : fld.type === 'number' ? 'number' : 'text'} value={edit.data?.[fld.key] || ''} onChange={e => setEdit({ ...edit, data: { ...edit.data, [fld.key]: e.target.value } })} className={inp} />
              </label>
            ))}
            <label className="text-xs font-semibold text-gray-500">{tr('Dernière révision', 'Last review')}<input type="date" value={edit.last_review_at || ''} onChange={e => setEdit({ ...edit, last_review_at: e.target.value })} className={inp} /></label>
            {reviewMonths ? <div className="pt-5 text-xs text-gray-400">{tr('Prochaine révision', 'Next review')} : {computeReviewDue(edit.last_review_at, reviewMonths) || '—'} ({reviewMonths} {tr('mois', 'months')})</div> : null}
          </div>
          <div className="mt-3 flex justify-end gap-2"><button onClick={() => setEdit(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button><button onClick={save} disabled={busy || !edit.title} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{tr('Enregistrer', 'Save')}</button></div>
          {edit.id ? <div className="mt-3"><HseAttachments tenant={tenant} entityType="register_entry" entityId={edit.id} canHr={canHr} tr={tr} /></div>
            : <p className="mt-2 text-[11px] text-gray-400">{tr('Enregistrez l’entrée pour y joindre des documents (FDS, certificat, rapport…).', 'Save the entry to attach documents (SDS, certificate, report…).')}</p>}
        </div>
      )}

      <div className={`${card} overflow-x-auto`}>
        {entries.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune entrée.', 'No entry.')}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Titre', 'Title')}</th><th>{tr('Référence', 'Reference')}</th><th>{tr('Révision due', 'Review due')}</th><th></th></tr></thead>
            <tbody>{entries.map((en: any) => <tr key={en.id} className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1.5 font-semibold">{en.title}</td><td className="text-gray-500">{en.reference || '—'}</td><td className={en.review_due_at && en.review_due_at <= today() ? 'font-bold text-rose-600' : 'text-gray-500'}>{en.review_due_at || '—'}</td><td className="text-right"><div className="inline-flex items-center gap-2"><button onClick={() => setEdit(en)} className="text-blue-500 hover:underline text-xs font-semibold">{tr('Ouvrir / joindre', 'Open / attach')}</button><button onClick={async () => { if (confirm(tr('Supprimer ?', 'Delete?'))) { await deleteRegisterEntry(tenant, en.id); setEntries(await getRegisterEntries(tenant, cur.treg.id)); } }} className="text-gray-300 hover:text-rose-500"><Trash2 size={13} /></button></div></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── CONFIG (onboarding) ──────────────────────────────────────────────────────────────────────────────
function ConfigTab({ tr, card, tenant, frameworks, regTypes, tenantRegs, settings, onSaved, setNotice }: any) {
  const [fwId, setFwId] = useState(settings?.framework_id || '');
  const [rateBase, setRateBase] = useState(settings?.rate_base_hours || 200000);
  const [locale, setLocale] = useState(settings?.default_locale || 'fr');
  const [busy, setBusy] = useState(false);
  // §0 — le <select> Cadre DOIT refléter la valeur sauvegardée même si settings arrive après le montage.
  useEffect(() => { setFwId(settings?.framework_id || ''); setRateBase(settings?.rate_base_hours || 200000); setLocale(settings?.default_locale || 'fr'); }, [settings]);
  const enabledSet = new Set(tenantRegs.filter((t: any) => t.is_enabled).map((t: any) => t.register_type_id));
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  // Juridictions canadiennes : base de normalisation = 200 000 h (100 travailleurs × 2 000 h), standard CSA/CNESST.
  function onFw(id: string) { setFwId(id); if (frameworks.find((x: any) => x.id === id)) setRateBase(200000); }
  async function save() {
    setBusy(true);
    const { error } = await saveHseSettings(tenant, { framework_id: fwId || null, rate_base_hours: Number(rateBase), default_locale: locale });
    setNotice(error ? 'Erreur : ' + error : tr('Configuration enregistrée ✓', 'Configuration saved ✓'));
    setBusy(false); onSaved();
  }
  return (
    <div className="space-y-4">
      <div className={card}>
        <h3 className="mb-2 text-sm font-bold">{tr('Cadre réglementaire & KPI', 'Regulatory framework & KPIs')}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold text-gray-500">{tr('Cadre', 'Framework')}<select value={fwId} onChange={e => onFw(e.target.value)} className={inp}><option value="">{tr('— Choisir —', '— Pick —')}</option>{frameworks.map((f: any) => <option key={f.id} value={f.id}>{tr(f.name_fr, f.name_en)}</option>)}</select></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Base de normalisation (h)', 'Rate base (h)')}<select value={rateBase} onChange={e => setRateBase(Number(e.target.value))} className={inp}><option value={200000}>200 000 ({tr('Canada — 100 trav. × 2 000 h', 'Canada — 100 wkrs × 2,000 h')})</option><option value={1000000}>1 000 000</option></select></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Langue par défaut', 'Default language')}<select value={locale} onChange={e => setLocale(e.target.value)} className={inp}><option value="fr">Français</option><option value="en">English</option></select></label>
        </div>
        <div className="mt-3 flex justify-end"><button onClick={save} disabled={busy} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? '…' : tr('Enregistrer', 'Save')}</button></div>
      </div>

      <div className={card}>
        <h3 className="mb-2 text-sm font-bold">{tr('Registres à activer', 'Registers to enable')}</h3>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {regTypes.map((rt: any) => (
            <label key={rt.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700/60">
              <input type="checkbox" defaultChecked={enabledSet.has(rt.id)} onChange={async e => { await toggleTenantRegister(tenant, rt.id, e.target.checked); onSaved(); }} className="accent-blue-600" />
              <span className="text-gray-700 dark:text-gray-200">{tr(rt.name_fr, rt.name_en)}</span>
              {rt.default_review_months ? <span className="ml-auto text-[10px] text-gray-400">{tr('révision', 'review')} {rt.default_review_months} {tr('mois', 'mo')}</span> : null}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
