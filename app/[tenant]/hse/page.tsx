'use client';
// Module HSE (Santé & sécurité) — registres réglementaires + incidents/échéances + KPI (LTIFR/TRIR).
// Données : lib/hse/data ; calculs purs : lib/hse/kpi. Juridictions CANADIENNES (fédéral + provinces/territoires), bilingue FR/EN.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertTriangle, ClipboardList, Settings, Plus, Check, Download, Trash2, Lock, Paperclip, History, MessageSquare } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import AccidentsPanel from '@/components/AccidentsPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getFrameworks, getRegisterTypes, getHseSettings, saveHseSettings, getTenantRegisters, toggleTenantRegister,
  getRegisterEntries, saveRegisterEntry, deleteRegisterEntry, computeReviewDue, getIncidents, saveIncident,
  getOpenDeadlines, getDeadlinesForIncident, completeDeadline, getHoursWorked, saveHoursWorked, deleteHoursWorked, getRegistersDue,
  getProactiveMetrics, getInterconnectStats, getAuditLog, type HseAuditRow,
  type HseFramework, type HseRegisterType, type HseSettings, type HseTenantRegister, type HseIncident, type HseDeadline, type HseHours, type HseProactive, type HseInterconnect,
} from '@/lib/hse/data';
import { computeMonthlyKpi, computeAggregateKpi, formatDeadlineDelay } from '@/lib/hse/kpi';
import { resolveKpiHours, monthOverridePeriod, type HoursBreakdown } from '@/lib/hse/hoursSource';
import { proactiveFeedLive } from '@/lib/hse/proactiveFeed';
import { getSafetyMeetings, deleteSafetyMeeting, type HseSafetyMeeting } from '@/lib/hse/safetyMeetings';
import CauserieEditor, { blankMeeting } from '@/components/hse/CauserieEditor';
import { HseKpiCharts } from '@/components/hse/HseKpiCharts';
import { HseInjuryDonut } from '@/components/hse/HseInjuryDonut';
import { HseAiInsights } from '@/components/hse/HseAiInsights';
import { HseAttachments } from '@/components/hse/HseAttachments';
import { IncidentWorkflow } from '@/components/hse/IncidentWorkflow';
import { FEED_BY_CODE, importFeedCandidates, feedSimdut } from '@/lib/hse/registerFeeds';
import { downloadCsv } from '@/lib/csv';

const INCIDENT_STATUS: Record<string, { fr: string; en: string; cls: string }> = {
  open: { fr: 'Ouvert', en: 'Open', cls: 'bg-rose-100 text-rose-700' },
  investigation: { fr: 'Enquête', en: 'Investigation', cls: 'bg-amber-100 text-amber-700' },
  capa: { fr: 'Actions', en: 'Actions', cls: 'bg-blue-100 text-blue-700' },
  closed: { fr: 'Clôturé', en: 'Closed', cls: 'bg-emerald-100 text-emerald-700' },
};

type Tab = 'kpi' | 'incidents' | 'registers' | 'meetings' | 'config' | 'audit';
const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

// Types d'événement (doivent matcher hse_deadline_rule.event_code du seed).
const EVENT_CODES: { code: string; fr: string; en: string }[] = [
  { code: 'NEAR_MISS', fr: 'Passé proche', en: 'Near-miss' },
  { code: 'FIRST_AID', fr: 'Premiers soins (sans arrêt)', en: 'First aid (no lost time)' },
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
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('kpi');
  // Deep-link ?tab=incidents (ex. redirection depuis /accidents ou « Déclarer un incident » d'un AST).
  useEffect(() => { const q = searchParams.get('tab'); if (q && ['kpi', 'incidents', 'registers', 'meetings', 'config', 'audit'].includes(q)) setTab(q as Tab); }, [searchParams]);
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
  // Identité courante (estampille « qui » du journal d'audit / complétion des échéances).
  const [userEmail, setUserEmail] = useState<string>('');
  useEffect(() => { fetch('/api/auth/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(j => setUserEmail(j?.email || j?.user?.email || '')).catch(() => {}); }, []);

  const [settings, setSettings] = useState<HseSettings | null>(null);
  const [frameworks, setFrameworks] = useState<HseFramework[]>([]);
  const [regTypes, setRegTypes] = useState<HseRegisterType[]>([]);
  const [tenantRegs, setTenantRegs] = useState<HseTenantRegister[]>([]);
  const [incidents, setIncidents] = useState<HseIncident[]>([]);
  const [deadlines, setDeadlines] = useState<HseDeadline[]>([]);
  const [hours, setHours] = useState<HseHours[]>([]);          // saisies manuelles (hse_hours_worked)
  const [autoHours, setAutoHours] = useState<HseHours[]>([]);  // dénominateur résolu (feuilles de temps + manuel)
  const [autoWeeks, setAutoWeeks] = useState<HseHours[]>([]);  // semaines AUTO (paie) en lecture seule
  const [breakdown, setBreakdown] = useState<HoursBreakdown | null>(null);
  const [tsByMonth, setTsByMonth] = useState<Record<string, number>>({});
  const [manualByMonth, setManualByMonth] = useState<Record<string, number>>({});
  const [proactive, setProactive] = useState<HseProactive[]>([]);
  const [interconnect, setInterconnect] = useState<HseInterconnect | null>(null);
  const [registersDue, setRegistersDue] = useState<any[]>([]);
  const [accidentFeed, setAccidentFeed] = useState<any[]>([]);  // incidents du module Accidents (KPI auto)
  const [tenantStart, setTenantStart] = useState<string | null>(null); // plancher du compteur jours-sans-accident

  async function loadAll() {
    setLoading(true);
    try {
      // Synchro miroirs : reflète les rapports du module Accidents (incident_reports) dans hse_incident
      // (classés en code réglementaire) AVANT de lire les incidents → KPI + échéances + compteur nourris.
      try { const sm = await fetch(`/api/hse/sync-mirrors?tenant=${encodeURIComponent(tenant)}`, { method: 'POST', credentials: 'include' }); const sj = await sm.json().catch(() => ({})); if (sm.ok) setTenantStart(sj.tenantStart || null); } catch {}
      const [s, fw, rt, treg, inc, dl, hr, rd, pro] = await Promise.all([
        getHseSettings(tenant), getFrameworks(), getRegisterTypes(), getTenantRegisters(tenant),
        getIncidents(tenant), getOpenDeadlines(tenant), getHoursWorked(tenant), getRegistersDue(tenant),
        getProactiveMetrics(tenant),
      ]);
      setSettings(s); setFrameworks(fw); setRegTypes(rt); setTenantRegs(treg);
      // Indicateurs proactifs auto (AST→JSA, permis→WORK_PERMIT) fusionnés avec les saisies manuelles.
      const proFeed = await proactiveFeedLive(tenant);
      setIncidents(inc); setDeadlines(dl); setHours(hr); setRegistersDue(rd); setProactive([...(pro as any), ...proFeed] as any);
      // Dénominateur AUTO : feuilles de temps (réel) priorisées, manuel comble les semaines non couvertes.
      const resolved = await resolveKpiHours(tenant, hr);
      setAutoHours(resolved.hours); setBreakdown(resolved.breakdown); setTsByMonth(resolved.tsByMonth); setManualByMonth(resolved.manualByMonth); setAutoWeeks(resolved.autoWeeks);
      setInterconnect(await getInterconnectStats(tenant, resolved.breakdown.plannedHours));
      // Feed KPI : incidents du module Accidents (incident_reports) — sans ressaisie.
      try { const af = await fetch(`/api/hse/incident-feed?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }); const aj = await af.json(); setAccidentFeed(af.ok ? (aj.items || []) : []); } catch { setAccidentFeed([]); }
    } catch (e: any) { setNotice(tr('Module non initialisé — appliquez les migrations 248/249.', 'Module not initialized — apply migrations 248/249.')); }
    setLoading(false);
  }
  // Rechargement LÉGER après une saisie d'heures : ne refait QUE les heures (évite de tout recharger —
  // incidents, miroirs, beigne, feeds — ce qui faisait « skipper » les graphiques à chaque saisie).
  async function reloadHours() {
    const hr = await getHoursWorked(tenant);
    setHours(hr);
    const resolved = await resolveKpiHours(tenant, hr);
    setAutoHours(resolved.hours); setBreakdown(resolved.breakdown); setTsByMonth(resolved.tsByMonth); setManualByMonth(resolved.manualByMonth);
  }
  // Ne charge les données HSE que si l'accès est suffisant (tier ≥ administration).
  useEffect(() => { if (canView) loadAll(); else if (tier != null) setLoading(false); /* eslint-disable-next-line */ }, [tenant, canView]);
  // Un incident soumis dans l'onglet Accidents doit REMONTER au tableau de bord sans recharger la page :
  // à l'ouverture du tableau de bord, on re-synchronise les miroirs puis on rafraîchit incidents + feed.
  useEffect(() => {
    if (tab !== 'kpi' || !canView) return;
    let active = true;
    (async () => {
      try { await fetch(`/api/hse/sync-mirrors?tenant=${encodeURIComponent(tenant)}`, { method: 'POST', credentials: 'include' }); } catch {}
      try { const inc = await getIncidents(tenant); if (active) setIncidents(inc); } catch {}
      try { const af = await fetch(`/api/hse/incident-feed?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }); const aj = await af.json(); if (active && af.ok) setAccidentFeed(aj.items || []); } catch {}
    })();
    return () => { active = false; };
    /* eslint-disable-next-line */
  }, [tab]);

  const rateBase = settings?.rate_base_hours || 200000;
  // KPI = incidents HSE natifs + incidents importés du module Accidents (anti-ressaisie).
  // Source unique = hse_incident (miroirs des rapports Accidents + saisies natives). Le feed brut
  // (incident-feed) ne sert plus que de TRANSITION : on écarte tout rapport déjà reflété par un miroir
  // (via source_report_id) pour ne JAMAIS compter deux fois. Une fois le backfill fait, le miroir gagne
  // (classification réglementaire fine vs RECORDABLE générique du feed).
  const kpiIncidents = useMemo(() => {
    const mirroredIds = new Set((incidents || []).map((i: any) => i.source_report_id).filter(Boolean));
    const feed = (accidentFeed || []).filter((a: any) => !mirroredIds.has(a.id));
    return [...incidents, ...feed];
  }, [incidents, accidentFeed]);
  const kpiRows = useMemo(() => computeMonthlyKpi(kpiIncidents as any, autoHours as any, rateBase), [kpiIncidents, autoHours, rateBase]);
  const agg = useMemo(() => computeAggregateKpi(kpiRows, rateBase), [kpiRows, rateBase]);
  const mny = (n: number) => (Number(n) || 0).toLocaleString(EN ? 'en-CA' : 'fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const TABS: { k: Tab; label: string; icon: any }[] = [
    { k: 'kpi', label: tr('Tableau de bord', 'Dashboard'), icon: ShieldCheck },
    { k: 'incidents', label: tr('Incidents & accidents', 'Incidents & accidents'), icon: AlertTriangle },
    { k: 'registers', label: tr('Registres', 'Registers'), icon: ClipboardList },
    { k: 'meetings', label: tr('Causeries & obs.', 'Talks & obs.'), icon: MessageSquare },
    { k: 'config', label: tr('Configuration', 'Configuration'), icon: Settings },
    { k: 'audit', label: tr('Journal d’audit', 'Audit log'), icon: History },
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
      <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6">
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
            {tab === 'kpi' && <KpiTab tr={tr} EN={EN} card={card} agg={agg} kpiRows={kpiRows} rateBase={rateBase} deadlines={deadlines} registersDue={registersDue} hours={hours} incidents={kpiIncidents} accidentsCount={accidentFeed.length} tenantStart={tenantStart} canHr={canHr} proactive={proactive} breakdown={breakdown} interconnect={interconnect} tsByMonth={tsByMonth} manualByMonth={manualByMonth} autoWeeks={autoWeeks} tenant={tenant} onHours={async (h: HseHours) => { const r = await saveHoursWorked(tenant, h); if (r.error) { setNotice(tr('Heures non enregistrées : ' + r.error, 'Hours not saved: ' + r.error)); return; } await reloadHours(); }} onMonthlyHours={async (month: string, val: number) => {
                // Remplace le total MANUEL du mois : retire les lignes manuelles existantes de ce mois, puis
                // pose une seule ligne-mois (ou rien si 0). Évite l'accumulation à chaque édition.
                for (const x of (hours as any[]).filter(x => x.id && String(x.period_start).slice(0, 7) === month)) await deleteHoursWorked(tenant, x.id);
                if (val > 0) { const r = await saveHoursWorked(tenant, { ...monthOverridePeriod(month), hours: val }); if (r.error) { setNotice(tr('Heures non enregistrées : ' + r.error, 'Hours not saved: ' + r.error)); return; } }
                await reloadHours();
              }} onDeleteHours={async (id: string) => { await deleteHoursWorked(tenant, id); await reloadHours(); }} settings={settings} />}
            {tab === 'incidents' && <IncidentsTab tr={tr} card={card} tenant={tenant} incidents={incidents} deadlines={deadlines} configured={!!settings?.framework_id} canHr={canHr} userEmail={userEmail} onSaved={async () => { setIncidents(await getIncidents(tenant)); setDeadlines(await getOpenDeadlines(tenant)); }} onComplete={async (id: string) => { await completeDeadline(tenant, id, userEmail); setDeadlines(await getOpenDeadlines(tenant)); }} />}
            {tab === 'registers' && <RegistersTab tr={tr} card={card} tenant={tenant} regTypes={regTypes} tenantRegs={tenantRegs} canHr={canHr} userEmail={userEmail} />}
            {tab === 'meetings' && <MeetingsTab tr={tr} card={card} tenant={tenant} userEmail={userEmail} lang={lang} />}
            {tab === 'config' && <ConfigTab tr={tr} card={card} tenant={tenant} frameworks={frameworks} regTypes={regTypes} tenantRegs={tenantRegs} settings={settings} onSaved={loadAll} setNotice={setNotice} />}
            {tab === 'audit' && <AuditTab tr={tr} card={card} tenant={tenant} EN={EN} />}
          </>
        )}
      </div>
      )}
    </div>
  );
}

// Bandeau de CONFORMITÉ WHMIS : produits chimiques de l'inventaire sans FDS (obligation légale).
function FdsComplianceBanner({ tr, tenant }: any) {
  const [n, setN] = useState(0);
  useEffect(() => { let a = true; feedSimdut(tenant).then(c => { if (a) setN(c.filter((x: any) => x.data?.fds_missing).length); }).catch(() => {}); return () => { a = false; }; }, [tenant]);
  if (!n) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
      ⚠ <b>{n}</b> {tr(`produit(s) chimique(s) sans FDS`, `chemical product(s) without an SDS`)} — {tr('obligation WHMIS/SIMDUT. Importez-les dans le registre SIMDUT (onglet Registres) et ajoutez la fiche.', 'WHMIS requirement. Import them into the WHMIS register (Registers tab) and add the SDS.')}
    </div>
  );
}

// Bandeau de CONFORMITÉ FORMATIONS : certifications expirées / à renouveler (≤ 30 j). Données RH → seulement
// si canHr. Source = route service_role register-feed (certifications + documents RH).
function TrainingExpiryBanner({ tr, tenant, canHr }: any) {
  const [s, setS] = useState<{ expired: number; soon: number }>({ expired: 0, soon: 0 });
  useEffect(() => {
    if (!canHr) return; let a = true;
    (async () => {
      try {
        const r = await fetch(`/api/hse/register-feed?source=certifications&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
        if (!r.ok) return; const j = await r.json();
        const now = Date.now(); const horizon = now + 30 * 86400000; let expired = 0, soon = 0;
        for (const it of (j.items || [])) { const d = it?.data?.expires_at; if (!d) continue; const t = new Date(d).getTime(); if (isNaN(t)) continue; if (t < now) expired++; else if (t <= horizon) soon++; }
        if (a) setS({ expired, soon });
      } catch { /* best-effort */ }
    })();
    return () => { a = false; };
  }, [tenant, canHr]);
  if (!canHr || (!s.expired && !s.soon)) return null;
  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
      🎓 {s.expired > 0 && <><b>{s.expired}</b> {tr('formation(s) expirée(s)', 'expired training record(s)')}{s.soon > 0 ? ' · ' : ' '}</>}{s.soon > 0 && <><b>{s.soon}</b> {tr('à renouveler (≤ 30 j)', 'to renew (≤ 30 d)')} </>}— {tr('voir le registre des formations.', 'see the training register.')}
    </div>
  );
}

// ── KPI ────────────────────────────────────────────────────────────────────────────────────────────
function KpiTab({ tr, EN, card, agg, kpiRows, rateBase, deadlines, registersDue, hours, incidents, accidentsCount, tenantStart, canHr, proactive, breakdown, interconnect, tsByMonth = {}, manualByMonth = {}, autoWeeks = [], tenant, onHours, onMonthlyHours, onDeleteHours, settings }: any) {
  const [h, setH] = useState({ period_start: '', period_end: '', hours: '', note: '' });
  const Stat = ({ v, l, c }: any) => <div className={card}><div className="text-[11px] font-semibold uppercase text-gray-400">{l}</div><div className={`text-2xl font-extrabold ${c}`}>{v}</div></div>;

  // Jours sans accident avec arrêt (affichage chantier). Source = miroirs Accidents (vraies données).
  // Sans LTI enregistré, on affiche la séquence DEPUIS LE DÉBUT du tenant (plancher), comme le dashboard.
  const startMs = tenantStart ? new Date(tenantStart).getTime() : null;
  const nowMs = Date.now();
  // Âge du tenant = plafond ABSOLU d'un compteur « jours sans … » (impossible d'avoir plus de jours sans
  // accident que de jours d'existence). Une date d'incident incohérente (future ou antérieure à la
  // création du tenant) ne doit JAMAIS gonfler ni fausser le compteur.
  const ageDays = startMs != null ? Math.max(0, Math.floor((nowMs - startMs) / 86400000)) : null;
  const ltiTimes = (incidents || []).filter((i: any) => i.is_lost_time)
    .map((i: any) => new Date(i.occurred_at).getTime())
    .filter((t: number) => !isNaN(t))
    // borne chaque date entre [création du tenant, aujourd'hui] → pas de date aberrante.
    .map((t: number) => Math.min(nowMs, startMs != null ? Math.max(startMs, t) : t));
  const lastLti = ltiTimes.length ? Math.max(...ltiTimes) : null;
  let daysSinceLti: number | null = lastLti != null ? Math.max(0, Math.floor((nowMs - lastLti) / 86400000)) : ageDays;
  if (daysSinceLti != null && ageDays != null) daysSinceLti = Math.min(daysSinceLti, ageDays);   // plafond = âge tenant
  const ltiStreakFromStart = lastLti == null && startMs != null;

  // Qualité de données : mois avec incidents mais 0 heure (taux faussés).
  const monthsNoHours = (kpiRows || []).filter((r: any) => r.hours <= 0 && (r.recordableCount > 0 || r.nearMissCount > 0 || r.ltiCount > 0)).map((r: any) => r.month);

  const srcLabel: Record<string, string> = {
    timesheets: tr('Feuilles de temps (auto)', 'Timesheets (auto)'),
    manual: tr('Saisie manuelle', 'Manual entry'),
    mixed: tr('Feuilles de temps + manuel', 'Timesheets + manual'),
    none: tr('Aucune source', 'No source'),
  };

  // Filtre de période (12 mois glissants / année courante / tout) appliqué aux KPI affichés.
  const [period, setPeriod] = useState<'rolling12' | 'year' | 'all'>('rolling12');
  const cutoff = period === 'rolling12' ? new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 7)
    : period === 'year' ? new Date().toISOString().slice(0, 4) + '-01' : '0000-00';
  const viewRows = useMemo(() => (kpiRows || []).filter((r: any) => r.month >= cutoff), [kpiRows, cutoff]);
  const vagg = useMemo(() => computeAggregateKpi(viewRows as any, rateBase), [viewRows, rateBase]);
  function exportCsv() {
    downloadCsv(`hse-kpi-${tenant}`, viewRows, [
      { key: 'month', label: tr('Mois', 'Month') },
      { key: 'hours', label: tr('Heures', 'Hours'), type: 'number' },
      { key: 'ltiCount', label: 'LTI', type: 'number' }, { key: 'recordableCount', label: tr('Enregistrables', 'Recordables'), type: 'number' },
      { key: 'nearMissCount', label: tr('Presque-accidents', 'Near-misses'), type: 'number' }, { key: 'lostDays', label: tr('Jours perdus', 'Lost days'), type: 'number' },
      { key: 'ltifr', label: 'LTIFR', type: 'number' }, { key: 'trir', label: 'TRIR', type: 'number' }, { key: 'severityRate', label: tr('Gravité', 'Severity'), type: 'number' },
    ]);
  }
  async function exportPdf() {
    const { exportHseScorecard } = await import('@/lib/hse/scorecardPdf');
    await exportHseScorecard({ tenant, lang: EN ? 'en' : 'fr', agg: vagg, rows: viewRows, rateBase }).catch(() => {});
  }
  return (
    <div className="space-y-4">
      {!settings?.framework_id && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10">{tr('Configurez d’abord le cadre réglementaire (onglet Configuration).', 'Configure the regulatory framework first (Configuration tab).')}</div>}
      <FdsComplianceBanner tr={tr} tenant={tenant} />
      <TrainingExpiryBanner tr={tr} tenant={tenant} canHr={canHr} />

      {/* Compteur jours sans accident avec arrêt (affichage chantier) */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-transparent">
        <div className="flex items-end justify-between">
          <div><div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{tr('Jours sans accident avec arrêt', 'Days without a lost-time injury')}</div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{daysSinceLti == null ? '—' : daysSinceLti}</div></div>
          <div className="text-right text-[11px] text-gray-400">{daysSinceLti == null ? tr('Aucune donnée.', 'No data.') : ltiStreakFromStart ? tr('Aucun accident avec arrêt — depuis le début.', 'No lost-time injury — since inception.') : tr('Depuis le dernier accident avec arrêt.', 'Since the last lost-time injury.')}</div>
        </div>
      </div>

      {monthsNoHours.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">⚠️ {tr('Qualité des données : mois avec incidents mais 0 heure travaillée (taux faussés)', 'Data quality: month(s) with incidents but 0 hours (rates skewed)')} — {monthsNoHours.join(', ')}.</div>}
      {accidentsCount > 0 && <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">{tr(`KPI alimenté automatiquement : ${accidentsCount} incident(s) repris du module Accidents (aucune ressaisie).`, `KPI auto-fed: ${accidentsCount} incident(s) from the Accidents module (no re-entry).`)}</div>}

      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{tr('KPI cumulés', 'Aggregate KPIs')} <span className="text-xs font-normal text-gray-400">({tr('base', 'base')} {rateBase.toLocaleString()} h)</span></h2>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value as any)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold dark:border-gray-700 dark:bg-gray-800">
            <option value="rolling12">{tr('12 mois glissants', 'Rolling 12 months')}</option>
            <option value="year">{tr('Année courante', 'Current year')}</option>
            <option value="all">{tr('Tout', 'All')}</option>
          </select>
          {viewRows.length > 0 && <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={14} /> CSV</button>}
          {viewRows.length > 0 && <button onClick={exportPdf} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"><Download size={14} /> {tr('Scorecard PDF', 'Scorecard PDF')}</button>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat l="LTIFR / TF1" v={vagg.ltifr} c="text-rose-600" />
        <Stat l="TRIR / TF2" v={vagg.trir} c="text-amber-600" />
        <Stat l={tr('Taux DART', 'DART rate')} v={vagg.dartRate} c="text-rose-500" />
        <Stat l={tr('Taux de gravité', 'Severity rate')} v={vagg.severityRate} c="text-orange-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat l={tr('Heures travaillées', 'Hours worked')} v={vagg.hours.toLocaleString()} c="text-gray-700 dark:text-gray-200" />
        <Stat l={tr('Accidents avec arrêt', 'Lost-time injuries')} v={vagg.ltiCount} c="text-rose-600" />
        <Stat l={tr('Enregistrables', 'Recordables')} v={vagg.recordableCount} c="text-amber-600" />
        <Stat l={tr('Passés proches', 'Near-misses')} v={vagg.nearMissCount} c="text-sky-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat l={tr('Cas DART', 'DART cases')} v={vagg.dartCount} c="text-rose-500" />
        <Stat l={tr('Jours perdus', 'Lost days')} v={vagg.lostDays} c="text-orange-600" />
        <Stat l={tr('Décès', 'Fatalities')} v={vagg.fatalityCount} c={vagg.fatalityCount > 0 ? 'text-red-800' : 'text-gray-700 dark:text-gray-200'} />
        <Stat l={tr('Incidents (total)', 'Incidents (total)')} v={(incidents || []).length} c="text-gray-700 dark:text-gray-200" />
      </div>

      {/* Répartition par classification réglementaire — TOUS les incidents (incl. premiers soins) sont
          répertoriés ici, même ceux qui n'entrent pas dans LTIFR/TRIR. */}
      {(() => {
        const counts = new Map<string, number>();
        for (const i of (incidents || [])) { const c = i.event_code || 'AUTRE'; counts.set(c, (counts.get(c) || 0) + 1); }
        const ordered = EVENT_CODES.filter(c => counts.get(c.code)).map(c => ({ ...c, n: counts.get(c.code)! }));
        for (const [code, n] of counts) if (!EVENT_CODES.find(c => c.code === code)) ordered.push({ code, fr: code, en: code, n });
        if (!ordered.length) return null;
        return (
          <div className={card}>
            <h3 className="mb-3 text-sm font-bold">{tr('Répartition par classification', 'Breakdown by classification')} <span className="text-xs font-normal text-gray-400">({(incidents || []).length} {tr('au total', 'total')})</span></h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {ordered.map(c => (
                <div key={c.code} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700/50">
                  <span className="truncate text-xs text-gray-600 dark:text-gray-300">{tr(c.fr, c.en)}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">{c.n}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Beigne : blessures par partie du corps (filtre semaine/mois/année). Données santé agrégées (Loi 25). */}
      <HseInjuryDonut tenant={tenant} lang={EN ? 'en' : 'fr'} card={card} />

      {/* Graphiques KPI (meilleures pratiques : tendances + pyramide Heinrich + leading/lagging) */}
      <HseKpiCharts rows={viewRows} incidents={incidents} proactive={proactive} targets={{ ltifr: settings?.target_ltifr ?? null, trir: settings?.target_trir ?? null, severityRate: settings?.target_severity ?? null }} lang={EN ? 'en' : 'fr'} />

      {/* Analyse IA des tendances (à la demande, agrégats anonymisés — Loi 25). */}
      <HseAiInsights tenant={tenant} lang={EN ? 'en' : 'fr'} card={card} />

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

      {viewRows.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <h3 className="mb-1 text-sm font-bold">{tr('Évolution mensuelle', 'Monthly trend')}</h3>
          <p className="mb-2 text-[11px] text-gray-400">{tr('Heures AUTO = feuilles de temps (employés), prioritaires. La colonne « Manuel » s’édite (heures de sous-traitants / ajustement faits sur le site) et s’AJOUTE à l’auto.', 'AUTO hours = timesheets (employees), priority. The “Manual” column is editable (subcontractor / on-site adjustment hours) and ADDS to auto.')}</p>
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Mois', 'Month')}</th><th className="text-right">{tr('Auto', 'Auto')}</th><th className="text-right">{tr('Manuel (+)', 'Manual (+)')}</th><th className="text-right">{tr('Total', 'Total')}</th><th className="text-right">LTIFR</th><th className="text-right">TRIR</th><th className="text-right">{tr('Gravité', 'Severity')}</th></tr></thead>
            <tbody>{viewRows.map((r: any) => { const a = Math.round(Number(tsByMonth[r.month]) || 0); const m = Math.round(Number(manualByMonth[r.month]) || 0); return (
              <tr key={r.month} className="border-t border-gray-50 dark:border-gray-700/50">
                <td className="py-1 font-semibold">{r.month}</td>
                <td className="text-right tabular-nums text-gray-500">{a.toLocaleString()}</td>
                <td className="text-right">
                  <input key={`${r.month}:${m}`} type="number" min={0} defaultValue={m || ''} placeholder="0"
                    onBlur={e => { const v = Math.max(0, Number(e.target.value) || 0); if (v !== m) onMonthlyHours(r.month, v); }}
                    className="w-20 rounded border border-gray-200 px-1.5 py-0.5 text-right text-xs dark:border-gray-700 dark:bg-gray-900" />
                </td>
                <td className="text-right tabular-nums font-semibold">{Math.round(Number(r.hours) || 0).toLocaleString()}</td>
                <td className="text-right tabular-nums font-semibold text-rose-600">{r.ltifr}</td>
                <td className="text-right tabular-nums font-semibold text-amber-600">{r.trir}</td>
                <td className="text-right tabular-nums text-orange-600">{r.severityRate}</td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      )}

      {/* Heures travaillées (dénominateur) — AUTO depuis les feuilles de temps */}
      <div className={card}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">{tr('Heures travaillées (dénominateur des taux)', 'Hours worked (rate denominator)')}</h3>
          {breakdown && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{tr('Source', 'Source')} : {srcLabel[breakdown.source]} · {breakdown.weeks} {tr('semaine(s)', 'week(s)')}</span>}
        </div>
        <p className="mb-2 text-[11px] text-gray-500">{tr('AUTO depuis les feuilles de temps de TOUS les employés du tenant (prioritaire). La saisie manuelle ci-dessous (ou la colonne « Manuel » du tableau mensuel) S’AJOUTE à l’auto — pour les heures de SOUS-TRAITANTS sur le site ou un ajustement, non saisies dans les feuilles de temps.', 'AUTO from ALL tenant employees’ timesheets (priority). The manual entry below (or the “Manual” column in the monthly table) ADDS to auto — for SUBCONTRACTOR on-site hours or an adjustment not captured in timesheets.')}</p>
        <div className="mb-2 flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-gray-500">{tr('Semaine du', 'Week of')}<input type="date" value={h.period_start} onChange={e => setH({ ...h, period_start: e.target.value, period_end: e.target.value })} className="mt-1 block rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Heures', 'Hours')}<input type="number" value={h.hours} onChange={e => setH({ ...h, hours: e.target.value })} className="mt-1 block w-24 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <label className="flex-1 text-xs font-semibold text-gray-500">{tr('Note', 'Note')}<input type="text" value={h.note} onChange={e => setH({ ...h, note: e.target.value })} placeholder={tr('Ex. Temps effectué par un sous-traitant', 'E.g. Time worked by a subcontractor')} className="mt-1 block w-full min-w-[180px] rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <button onClick={async () => {
            const n = Number(h.hours);
            if (!h.period_start) return;
            if (!isFinite(n) || n <= 0) { alert(tr('Heures invalides : saisir un nombre positif.', 'Invalid hours: enter a positive number.')); return; }
            if (n > 100000) { alert(tr('Valeur aberrante (> 100 000 h pour une semaine).', 'Aberrant value (> 100,000 h for one week).')); return; }
            await onHours({ period_start: h.period_start, period_end: h.period_end || h.period_start, hours: n, note: h.note || null }); setH({ period_start: '', period_end: '', hours: '', note: '' });
          }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">{tr('Ajouter', 'Add')}</button>
        </div>

        {/* Semaines AUTO (paie) — lecture seule, une ligne par semaine */}
        {autoWeeks.length > 0 && (
          <div className="mb-2 overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{tr('Auto (paie) — total par semaine', 'Auto (payroll) — total by week')}</div>
            <table className="w-full text-xs"><thead><tr className="text-left text-gray-400"><th className="px-2 py-1">{tr('Semaine', 'Week')}</th><th className="px-2 text-right">{tr('Heures', 'Hours')}</th></tr></thead>
              <tbody>{autoWeeks.slice(0, 16).map((w: any, i: number) => (
                <tr key={`auto-${w.period_start}-${i}`} className="border-t border-gray-50 dark:border-gray-700/50">
                  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{w.period_start}{w.period_end && w.period_end !== w.period_start ? ` → ${w.period_end}` : ''}</td>
                  <td className="px-2 text-right tabular-nums">{Math.round(Number(w.hours) || 0).toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
            {autoWeeks.length > 16 && <div className="px-2 py-1 text-[11px] text-gray-400">… {autoWeeks.length - 16} {tr('semaine(s) de plus', 'more week(s)')}</div>}
          </div>
        )}

        {/* Lignes MANUELLES — éditables (heures + note) / supprimables */}
        {hours.length > 0 && (
          <div className="mb-2 overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{tr('Manuel (sous-traitants / ajustements)', 'Manual (subcontractors / adjustments)')}</div>
            <table className="w-full text-xs"><thead><tr className="text-left text-gray-400"><th className="px-2 py-1">{tr('Période', 'Period')}</th><th className="px-2 text-right">{tr('Heures', 'Hours')}</th><th className="px-2">{tr('Note', 'Note')}</th><th></th></tr></thead>
              <tbody>{[...hours].sort((a: any, b: any) => String(b.period_start).localeCompare(String(a.period_start))).map((x: any) => (
                <tr key={x.id || x.period_start} className="border-t border-gray-50 dark:border-gray-700/50">
                  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{x.period_start}{x.period_end && x.period_end !== x.period_start ? ` → ${x.period_end}` : ''}</td>
                  <td className="px-2 text-right">
                    <input key={`${x.id}:${x.hours}`} type="number" min={0} defaultValue={x.hours}
                      onBlur={e => { const v = Math.max(0, Number(e.target.value) || 0); if (v !== Number(x.hours)) onHours({ period_start: x.period_start, period_end: x.period_end || x.period_start, hours: v, note: x.note ?? null }); }}
                      className="w-20 rounded border border-gray-200 px-1.5 py-0.5 text-right dark:border-gray-700 dark:bg-gray-900" />
                  </td>
                  <td className="px-2">
                    <input key={`${x.id}:note`} type="text" defaultValue={x.note || ''} placeholder={tr('Ex. Sous-traitant', 'E.g. Subcontractor')}
                      onBlur={e => { const nv = e.target.value.trim(); if (nv !== (x.note || '')) onHours({ period_start: x.period_start, period_end: x.period_end || x.period_start, hours: Number(x.hours) || 0, note: nv || null }); }}
                      className="w-full min-w-[160px] rounded border border-gray-200 px-1.5 py-0.5 dark:border-gray-700 dark:bg-gray-900" />
                  </td>
                  <td className="px-2 text-right"><button onClick={() => { if (x.id && confirm(tr('Supprimer cette ligne ?', 'Delete this line?'))) onDeleteHours(x.id); }} className="text-gray-300 hover:text-rose-500"><Trash2 size={13} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-gray-400">{tr('Total manuel cumulé', 'Manual cumulative total')} : {hours.reduce((s: number, x: any) => s + (Number(x.hours) || 0), 0).toLocaleString()} h</p>
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
function IncidentsTab({ tr, card, tenant, incidents, deadlines, configured, canHr, userEmail, onSaved, onComplete }: any) {
  const [openInc, setOpenInc] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      {!configured && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20">{tr('Sans cadre réglementaire configuré (onglet Configuration), aucune échéance ne sera générée automatiquement à la soumission d’un rapport.', 'Without a configured framework (Configuration tab), no deadline will be auto-generated when a report is submitted.')}</div>}

      {/* Module Accidents/Incidents complet (déclaration riche : blessés, témoins, véhicule, schéma corporel,
          5-pourquoi, photos, signatures, CAPA). À la soumission, l'événement est classé en code réglementaire
          et nourrit AUTOMATIQUEMENT les échéances + le KPI ci-dessous (zéro ressaisie). */}
      <AccidentsPanel tenant={tenant} />

      {/* Couche réglementaire HSE : échéances CNESST auto-générées à partir des rapports soumis. */}
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
        <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold">{tr('Suivi réglementaire des incidents', 'Regulatory incident follow-up')} ({incidents.length}) <span className="font-normal text-gray-400">— {tr('classés auto. + enquête/causes/CAPA/pièces', 'auto-classified + investigation/causes/CAPA/files')}</span></h3>
          {incidents.length > 0 && <button onClick={() => downloadCsv(`hse-incidents-${tenant}`, incidents, [
            { key: 'occurred_at', label: tr('Date', 'Date'), type: 'date' }, { key: 'event_code', label: tr('Type', 'Type') }, { key: 'status', label: tr('Statut', 'Status') },
            { key: 'location_text', label: tr('Lieu', 'Location') }, { key: 'is_lost_time', label: 'LTI', map: (v: any) => (v ? 'Oui' : 'Non') }, { key: 'lost_days', label: tr('Jours perdus', 'Lost days'), type: 'number' },
            { key: 'root_cause', label: tr('Cause racine', 'Root cause') }, { key: 'created_by', label: tr('Déclaré par', 'Reported by') },
          ])} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={13} /> CSV</button>}
        </div>
        {incidents.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucun incident.', 'No incident.')}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Date', 'Date')}</th><th>{tr('Type', 'Type')}</th><th>{tr('Lieu', 'Location')}</th><th className="text-right">{tr('Jours perdus', 'Lost days')}</th><th></th></tr></thead>
            <tbody>{incidents.map((i: any) => (
              <React.Fragment key={i.id}>
                <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1">{new Date(i.occurred_at).toLocaleDateString(tr('fr-CA', 'en-CA'))}</td><td>{tr(EVENT_CODES.find(c => c.code === i.event_code)?.fr || i.event_code, EVENT_CODES.find(c => c.code === i.event_code)?.en || i.event_code)}{i.is_lost_time ? ' · LTI' : ''} <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${(INCIDENT_STATUS[i.status || 'open'] || INCIDENT_STATUS.open).cls}`}>{tr((INCIDENT_STATUS[i.status || 'open'] || INCIDENT_STATUS.open).fr, (INCIDENT_STATUS[i.status || 'open'] || INCIDENT_STATUS.open).en)}</span></td><td className="text-gray-500">{i.location_text || '—'}</td><td className="text-right tabular-nums">{i.lost_days || 0}</td><td className="text-right"><button onClick={() => setOpenInc(openInc === i.id ? null : i.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"><Paperclip size={12} /> {tr('Pièces', 'Files')}</button></td></tr>
                {openInc === i.id && <tr><td colSpan={5} className="space-y-2 pb-2"><IncidentWorkflow tenant={tenant} incident={i} tr={tr} onChanged={onSaved} userEmail={userEmail} /><HseAttachments tenant={tenant} entityType="incident" entityId={i.id} canHr={canHr} projectId={i.project_id} tr={tr} /></td></tr>}
              </React.Fragment>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── CAUSERIES (TBM) & OBSERVATIONS (BBS) — indicateurs leading ────────────────────────────────────────
function MeetingsTab({ tr, card, tenant, userEmail, lang }: any) {
  const [rows, setRows] = useState<HseSafetyMeeting[]>([]);
  const [edit, setEdit] = useState<HseSafetyMeeting | null>(null);   // causerie en édition (null = liste)
  const load = async () => setRows(await getSafetyMeetings(tenant));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  const kindLabel = (k: string) => (k === 'observation' ? tr('Observation', 'Observation') : tr('Causerie (TBM)', 'Toolbox (TBM)'));
  const mediaCount = (m: any) => (Array.isArray(m.media) ? m.media.length : 0);
  const partCount = (m: any) => (Array.isArray(m.participants) && m.participants.length ? m.participants.length : (m.attendees ? String(m.attendees).split(',').filter((s: string) => s.trim()).length : 0));

  if (edit) {
    return (
      <CauserieEditor tenant={tenant} value={edit} userEmail={userEmail} lang={lang === 'en' ? 'en' : 'fr'}
        onSaved={async () => { setEdit(null); await load(); }} onCancel={() => setEdit(null)} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10">{tr('Les causeries et observations nourrissent automatiquement les indicateurs proactifs (leading) du tableau de bord. Ajoutez autant de participants et de points que nécessaire, et enregistrez la séance (vocal/vidéo) ou liez un enregistrement Teams.', 'Toolbox talks and observations automatically feed the dashboard proactive (leading) indicators. Add as many attendees and topics as needed, and record the session (voice/video) or link a Teams recording.')}</div>

      <button onClick={() => setEdit(blankMeeting())} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Nouvelle causerie', 'New talk')}</button>

      <div className={`${card} overflow-x-auto`}>
        <h3 className="mb-2 text-sm font-bold">{tr('Historique', 'History')} ({rows.length})</h3>
        {rows.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune causerie ni observation.', 'No talk or observation yet.')}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Date', 'Date')}</th><th>{tr('Type', 'Type')}</th><th>{tr('Lieu', 'Location')}</th><th>{tr('Sujet', 'Topic')}</th><th>{tr('Particip.', 'Attend.')}</th><th>{tr('Médias', 'Media')}</th><th></th></tr></thead>
            <tbody>{rows.map((m: any) => (
              <tr key={m.id} className="cursor-pointer border-t border-gray-50 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30" onClick={() => setEdit(m)}>
                <td className="py-1">{(m.meeting_date || '').slice(0, 10)}</td>
                <td><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${m.kind === 'observation' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{kindLabel(m.kind)}</span></td>
                <td className="text-gray-500">{m.location || '—'}</td><td className="text-gray-500">{m.topic || '—'}</td>
                <td className="text-gray-500">{partCount(m) || '—'}</td>
                <td className="text-gray-500">{mediaCount(m) > 0 ? `🎬 ${mediaCount(m)}` : '—'}</td>
                <td className="text-right" onClick={e => e.stopPropagation()}><button onClick={async () => { await deleteSafetyMeeting(tenant, m.id); await load(); }} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── REGISTRES (form builder via field_schema) ────────────────────────────────────────────────────────
function RegistersTab({ tr, card, tenant, regTypes, tenantRegs, canHr, userEmail }: any) {
  const enabled = tenantRegs.filter((t: any) => t.is_enabled);
  const enabledTypes = enabled.map((t: any) => ({ treg: t, type: regTypes.find((rt: any) => rt.id === t.register_type_id) })).filter((x: any) => x.type);
  const [sel, setSel] = useState<string>('');
  const cur = enabledTypes.find((x: any) => x.treg.id === sel) || enabledTypes[0];
  const [entries, setEntries] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const shown = entries.filter((e: any) => !search || `${e.title} ${e.reference || ''}`.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { if (cur) getRegisterEntries(tenant, cur.treg.id).then(setEntries); }, [cur?.treg?.id, tenant]);
  const feed = cur ? FEED_BY_CODE[cur.type.code] : null;
  async function runImport() {
    if (!cur || !feed) return; setBusy(true); setImportMsg(null);
    const months = cur.treg.review_months_override ?? cur.type.default_review_months;
    const cands = await feed.fetch(tenant);
    const n = await importFeedCandidates(tenant, cur.treg.id, months, cands);
    setEntries(await getRegisterEntries(tenant, cur.treg.id));
    setImportMsg(tr(`${n} entrée(s) importée(s) · ${cands.length - n} déjà présente(s)`, `${n} entry(ies) imported · ${cands.length - n} already present`));
    setBusy(false);
  }
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  if (!enabledTypes.length) return <div className={card}><p className="text-sm text-gray-400">{tr('Aucun registre activé. Activez-en dans l’onglet Configuration.', 'No register enabled. Enable some in Configuration.')}</p></div>;
  const reviewMonths = cur ? (cur.treg.review_months_override ?? cur.type.default_review_months) : null;
  async function save() {
    if (!edit || !cur) return; setBusy(true);
    const review_due_at = computeReviewDue(edit.last_review_at, reviewMonths);
    await saveRegisterEntry(tenant, { ...edit, tenant_register_id: cur.treg.id, review_due_at, created_by: userEmail });
    setEntries(await getRegisterEntries(tenant, cur.treg.id)); setEdit(null); setBusy(false);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={cur?.treg.id} onChange={e => { setSel(e.target.value); setEdit(null); }} className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          {enabledTypes.map((x: any) => <option key={x.treg.id} value={x.treg.id}>{tr(x.type.name_fr, x.type.name_en)}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr('Rechercher…', 'Search…')} className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <button onClick={() => setEdit({ title: '', data: {}, last_review_at: today() })} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Nouvelle entrée', 'New entry')}</button>
        {feed && <button onClick={runImport} disabled={busy} className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {tr(feed.labelFr, feed.labelEn)}</button>}
        {entries.length > 0 && <button onClick={() => downloadCsv(`hse-registre-${cur?.type?.code || ''}-${tenant}`, entries, [{ key: 'title', label: tr('Titre', 'Title') }, { key: 'reference', label: tr('Référence', 'Reference') }, { key: 'last_review_at', label: tr('Dernière révision', 'Last review'), type: 'date' }, { key: 'review_due_at', label: tr('Révision due', 'Review due'), type: 'date' }, { key: 'status', label: tr('Statut', 'Status') }])} className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/40"><Download size={15} /> CSV</button>}
      </div>
      {importMsg && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{importMsg} — {tr('aucun doublon (clé = id source).', 'no duplicate (key = source id).')}</div>}

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
        {shown.length === 0 ? <p className="text-sm text-gray-400">{entries.length ? tr('Aucun résultat.', 'No result.') : tr('Aucune entrée.', 'No entry.')}</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Titre', 'Title')}</th><th>{tr('Référence', 'Reference')}</th><th>{tr('Révision due', 'Review due')}</th><th></th></tr></thead>
            <tbody>{shown.map((en: any) => { const due = en.review_due_at; const over = due && due <= today(); const soon = due && !over && due <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10); return <tr key={en.id} className="border-t border-gray-50 dark:border-gray-700/50"><td className="py-1.5 font-semibold">{en.title}</td><td className="text-gray-500">{en.reference || '—'}</td><td>{due ? <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${over ? 'bg-rose-100 text-rose-700' : soon ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>{due}{over ? ' ⚠' : ''}</span> : <span className="text-gray-400">—</span>}</td><td className="text-right"><div className="inline-flex items-center gap-2"><button onClick={() => setEdit(en)} className="text-blue-500 hover:underline text-xs font-semibold">{tr('Ouvrir / joindre', 'Open / attach')}</button><button onClick={async () => { if (confirm(tr('Supprimer ?', 'Delete?'))) { await deleteRegisterEntry(tenant, en.id); setEntries(await getRegisterEntries(tenant, cur.treg.id)); } }} className="text-gray-300 hover:text-rose-500"><Trash2 size={13} /></button></div></td></tr>; })}</tbody>
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
  const [reminderEmail, setReminderEmail] = useState(settings?.reminder_email || '');
  const [tgt, setTgt] = useState({ ltifr: settings?.target_ltifr ?? '', trir: settings?.target_trir ?? '', severity: settings?.target_severity ?? '' });
  const [busy, setBusy] = useState(false);
  // §0 — le <select> Cadre DOIT refléter la valeur sauvegardée même si settings arrive après le montage.
  useEffect(() => { setFwId(settings?.framework_id || ''); setRateBase(settings?.rate_base_hours || 200000); setLocale(settings?.default_locale || 'fr'); setReminderEmail(settings?.reminder_email || ''); setTgt({ ltifr: settings?.target_ltifr ?? '', trir: settings?.target_trir ?? '', severity: settings?.target_severity ?? '' }); }, [settings]);
  const enabledSet = new Set(tenantRegs.filter((t: any) => t.is_enabled).map((t: any) => t.register_type_id));
  const inp = 'mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
  // Juridictions canadiennes : base de normalisation = 200 000 h (100 travailleurs × 2 000 h), standard CSA/CNESST.
  function onFw(id: string) { setFwId(id); if (frameworks.find((x: any) => x.id === id)) setRateBase(200000); }
  async function save() {
    setBusy(true);
    const num = (v: any) => (v === '' || v == null ? null : Number(v));
    const { error } = await saveHseSettings(tenant, { framework_id: fwId || null, rate_base_hours: Number(rateBase), default_locale: locale, reminder_email: reminderEmail || null, target_ltifr: num(tgt.ltifr), target_trir: num(tgt.trir), target_severity: num(tgt.severity) });
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
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="text-xs font-semibold text-gray-500 sm:col-span-1">{tr('Courriel des rappels', 'Reminders email')}<input type="email" value={reminderEmail} onChange={e => setReminderEmail(e.target.value)} placeholder="sst@…" className={inp} /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Cible LTIFR', 'LTIFR target')}<input type="number" step="0.01" value={tgt.ltifr} onChange={e => setTgt({ ...tgt, ltifr: e.target.value })} className={inp} /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Cible TRIR', 'TRIR target')}<input type="number" step="0.01" value={tgt.trir} onChange={e => setTgt({ ...tgt, trir: e.target.value })} className={inp} /></label>
          <label className="text-xs font-semibold text-gray-500">{tr('Cible gravité', 'Severity target')}<input type="number" step="0.01" value={tgt.severity} onChange={e => setTgt({ ...tgt, severity: e.target.value })} className={inp} /></label>
        </div>
        <p className="mt-1 text-[11px] text-gray-400">{tr('Rappels quotidiens J-7 / J-3 / jour J / en retard (échéances + révisions). Les cibles s’affichent en lignes-repères sur les graphiques.', 'Daily reminders D-7 / D-3 / D-day / overdue (deadlines + reviews). Targets show as reference lines on charts.')}</p>
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

// ── JOURNAL D'AUDIT (immuable) ───────────────────────────────────────────────────────────────────────
function AuditTab({ tr, card, tenant, EN }: any) {
  const [rows, setRows] = useState<HseAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAuditLog(tenant).then(r => { setRows(r); setLoading(false); }); }, [tenant]);
  const TABLE_LBL: Record<string, { fr: string; en: string }> = {
    hse_incident: { fr: 'Incident', en: 'Incident' }, hse_register_entry: { fr: 'Registre', en: 'Register' },
    hse_compliance_deadline: { fr: 'Échéance', en: 'Deadline' }, hse_corrective_action: { fr: 'Action (CAPA)', en: 'Action (CAPA)' },
    hse_attachment: { fr: 'Pièce jointe', en: 'Attachment' },
  };
  const OP_LBL: Record<string, { fr: string; en: string; cls: string }> = {
    INSERT: { fr: 'Création', en: 'Created', cls: 'text-emerald-600' }, UPDATE: { fr: 'Modification', en: 'Updated', cls: 'text-amber-600' }, DELETE: { fr: 'Suppression', en: 'Deleted', cls: 'text-rose-600' },
  };
  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;
  return (
    <div className={`${card} overflow-x-auto`}>
      <h3 className="mb-1 text-sm font-bold">{tr('Journal d’audit (immuable)', 'Audit log (immutable)')}</h3>
      <p className="mb-3 text-[11px] text-gray-400">{tr('Traçabilité SST : qui a créé / modifié / clôturé quoi et quand. Alimenté automatiquement, non modifiable.', 'OHS traceability: who created / modified / closed what and when. Auto-populated, tamper-proof.')}</p>
      {rows.length === 0 ? <p className="text-sm text-gray-400">{tr('Aucune entrée pour le moment.', 'No entry yet.')}</p> : (
        <table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400"><th className="py-1">{tr('Date/heure', 'Date/time')}</th><th>{tr('Objet', 'Object')}</th><th>{tr('Action', 'Action')}</th><th>{tr('Détail', 'Detail')}</th><th>{tr('Par', 'By')}</th></tr></thead>
          <tbody>{rows.map(r => { const op = OP_LBL[r.operation] || { fr: r.operation, en: r.operation, cls: '' }; return (
            <tr key={r.id} className="border-t border-gray-50 dark:border-gray-700/50">
              <td className="py-1 whitespace-nowrap text-gray-500">{new Date(r.at).toLocaleString(EN ? 'en-CA' : 'fr-CA')}</td>
              <td>{tr(TABLE_LBL[r.table_name]?.fr || r.table_name, TABLE_LBL[r.table_name]?.en || r.table_name)}</td>
              <td className={`font-semibold ${op.cls}`}>{tr(op.fr, op.en)}</td>
              <td className="max-w-[240px] truncate text-gray-500">{r.summary?.label || '—'}{r.summary?.status ? ` · ${r.summary.status}` : ''}</td>
              <td className="text-gray-500">{r.actor || '—'}</td>
            </tr>
          ); })}</tbody>
        </table>
      )}
    </div>
  );
}
