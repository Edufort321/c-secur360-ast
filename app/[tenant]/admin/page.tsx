'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Settings, CreditCard, Save, Loader2, Plus, Check, MapPin, Trash2, Car, Building2, Wrench, Clock, DollarSign, Layers, HardHat, ExternalLink, UserCog, Banknote, Gift, Timer, ChevronDown, ChevronRight, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPhoto } from '@/lib/utils/photo';

type Mod = { key: string; name_fr: string; name_en: string; monthly_price: number; sort_order: number; enabled: boolean };
const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

// ─── Hook : détecte le niveau d'accès de l'utilisateur connecté ─────────────
// Cascade de résolution :
//   1. users.role == 'super_admin'  → niveau 8 super_user (tous accès)
//   2. users.role == 'client_admin' → niveau 7 direction (par défaut)
//   3. planner_personnel.niveauAcces (raffinement fin par tenant)
//   4. Fallback super_user en dev si rien trouvé
function useCurrentAccess(tenant: string) {
  const [niveauAcces, setNiveauAcces] = useState<AccessLevel>('super_user');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          // 1. Rôle Supabase Auth — prioritaire
          const { data: u } = await supabase.from('users').select('role').ilike('email', user.email).maybeSingle();
          if (u?.role === 'super_admin') { setNiveauAcces('super_user'); setLoading(false); return; }
          // 2. Raffinement par planner_personnel
          const { data: p } = await supabase.from('planner_personnel').select('niveauAcces').eq('tenant_id', tenant).ilike('email', user.email).maybeSingle();
          if (p?.niveauAcces) setNiveauAcces(p.niveauAcces as AccessLevel);
          else if (u?.role === 'client_admin') setNiveauAcces('direction');
          else if (u?.role === 'user') setNiveauAcces('consultation');
        }
      } catch { /* Supabase indispo → garde super_user */ }
      setLoading(false);
    })();
  }, [tenant]);
  const perms = PERMS[niveauAcces] || PERMS.consultation;
  return { niveauAcces, perms, loading, userEmail };
}

// ─── Niveaux d'accès & matrice de permissions ───────────────────────────────
type AccessLevel = 'consultation' | 'modification' | 'coordination' | 'administration' | 'admin_paie' | 'rh' | 'direction' | 'super_user';

// Cascade numérotée du plus bas (1) au plus haut (8) niveau d'accès
const ACCESS_LEVELS: { value: AccessLevel; tier: number; label_fr: string; label_en: string; emoji: string; desc_fr: string; desc_en: string }[] = [
  { value: 'consultation',   tier: 1, label_fr: 'Consultation',           label_en: 'View only',         emoji: '👁️',  desc_fr: 'Lecture seule des données qui le concernent.',                    desc_en: 'Read-only access to own data.' },
  { value: 'modification',   tier: 2, label_fr: 'Modification',           label_en: 'Edit',              emoji: '✏️',  desc_fr: 'Modifie ses propres informations.',                              desc_en: 'Edit own information.' },
  { value: 'coordination',   tier: 3, label_fr: 'Coordination',           label_en: 'Coordinate',        emoji: '🗓️',  desc_fr: 'Voit la liste des employés et coordonne le planning.',          desc_en: 'View staff list and coordinate planning.' },
  { value: 'administration', tier: 4, label_fr: 'Administration',         label_en: 'Admin',             emoji: '⚙️',  desc_fr: 'Gère les employés, postes et accès. Pas d\'accès aux salaires.', desc_en: 'Manage staff, positions, access. No salary access.' },
  { value: 'admin_paie',     tier: 5, label_fr: 'Admin paie & avantages', label_en: 'Payroll admin',     emoji: '💵',  desc_fr: 'Voit et modifie les salaires/avantages. Mène les évaluations.',  desc_en: 'View/edit salaries/benefits. Run evaluations.' },
  { value: 'rh',             tier: 6, label_fr: 'Ressources humaines',    label_en: 'HR',                emoji: '🤝',  desc_fr: 'Toutes fonctions Admin + Paie. Embauche/évaluation/sanctions.',   desc_en: 'All Admin + Payroll. Hiring/evaluation/discipline.' },
  { value: 'direction',      tier: 7, label_fr: 'Direction',              label_en: 'Management',        emoji: '🏢',  desc_fr: 'Vue exécutive. Accès complet aux KPI, salaires et stratégie.',   desc_en: 'Executive view. Full KPI, salary and strategic access.' },
  { value: 'super_user',     tier: 8, label_fr: 'Super-utilisateur',      label_en: 'Super-user',        emoji: '👑',  desc_fr: 'Accès TOTAL au tenant. Configuration système, migrations, dette.', desc_en: 'TOTAL tenant access. System config, migrations, debt.' },
];

// Matrice des permissions — clé = niveau, valeur = ce qui est accessible
const PERMS: Record<AccessLevel, { viewEmployees: boolean; modifyEmployees: boolean; viewSalary: boolean; editSalary: boolean; evaluate: boolean; coordinate: boolean; viewAuth: boolean; managePostes: boolean; manageAll: boolean }> = {
  consultation:   { viewEmployees: false, modifyEmployees: false, viewSalary: false, editSalary: false, evaluate: false, coordinate: false, viewAuth: false, managePostes: false, manageAll: false },
  modification:   { viewEmployees: false, modifyEmployees: false, viewSalary: false, editSalary: false, evaluate: false, coordinate: false, viewAuth: false, managePostes: false, manageAll: false },
  coordination:   { viewEmployees: true,  modifyEmployees: true,  viewSalary: false, editSalary: false, evaluate: false, coordinate: true,  viewAuth: false, managePostes: true,  manageAll: false },
  administration: { viewEmployees: true,  modifyEmployees: true,  viewSalary: false, editSalary: false, evaluate: false, coordinate: true,  viewAuth: true,  managePostes: true,  manageAll: false },
  admin_paie:     { viewEmployees: true,  modifyEmployees: false, viewSalary: true,  editSalary: true,  evaluate: true,  coordinate: false, viewAuth: false, managePostes: false, manageAll: false },
  rh:             { viewEmployees: true,  modifyEmployees: true,  viewSalary: true,  editSalary: true,  evaluate: true,  coordinate: false, viewAuth: true,  managePostes: true,  manageAll: false },
  direction:      { viewEmployees: true,  modifyEmployees: true,  viewSalary: true,  editSalary: true,  evaluate: true,  coordinate: true,  viewAuth: true,  managePostes: true,  manageAll: true  },
  super_user:     { viewEmployees: true,  modifyEmployees: true,  viewSalary: true,  editSalary: true,  evaluate: true,  coordinate: true,  viewAuth: true,  managePostes: true,  manageAll: true  },
};

function AccessGuideModal({ tr, onClose }: { tr: (f: string, e: string) => string; onClose: () => void }) {
  const sortedLevels = [...ACCESS_LEVELS].sort((a, b) => a.tier - b.tier);
  const cell = (yes: boolean) => yes ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>;
  // Couleurs en classes Tailwind statiques (pas de string interpolation pour purge)
  const tierStyles: Record<number, string> = {
    1: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    2: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40',
    3: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40',
    4: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40',
    5: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
    6: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40',
    7: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
    8: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40',
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">
          <div>
            <h3 className="font-bold text-lg">🔐 {tr('Guide des niveaux d\'accès', 'Access levels guide')}</h3>
            <p className="text-xs text-gray-500">{tr('Cascade du plus bas (1) au plus haut (8) — chaque niveau hérite du précédent + ajoute des droits.', 'Cascade from lowest (1) to highest (8) — each level inherits from the previous + adds more rights.')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {/* Cascade visuelle */}
        <div className="relative pl-8 mb-6">
          {/* Ligne verticale de cascade */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-gray-300 via-blue-300 via-indigo-400 via-amber-400 via-pink-400 via-emerald-400 to-red-500" />
          {sortedLevels.map((lvl, idx) => {
            const p = PERMS[lvl.value];
            return (
              <div key={lvl.value} className="relative mb-3 last:mb-0">
                {/* Pastille numéro */}
                <div className={`absolute -left-7 top-2 grid h-7 w-7 place-items-center rounded-full text-xs font-bold border-2 ${tierStyles[lvl.tier]}`}>
                  {lvl.tier}
                </div>
                {/* Carte du niveau */}
                <div className={`rounded-xl border-2 p-3 ${tierStyles[lvl.tier]}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lvl.emoji}</span>
                      <div>
                        <div className="font-bold text-sm">{tr(lvl.label_fr, lvl.label_en)}</div>
                        <div className="text-[11px] opacity-80">{tr(lvl.desc_fr, lvl.desc_en)}</div>
                      </div>
                    </div>
                    {/* Mini-grille de droits */}
                    <div className="flex gap-2 text-[10px] font-semibold">
                      <span title={tr('Voir employés', 'View staff')}    className="flex items-center gap-0.5">{cell(p.viewEmployees)}👥</span>
                      <span title={tr('Modifier employés', 'Edit staff')} className="flex items-center gap-0.5">{cell(p.modifyEmployees)}✏️</span>
                      <span title={tr('Voir salaire', 'View salary')}     className="flex items-center gap-0.5">{cell(p.viewSalary)}💵</span>
                      <span title={tr('Modifier salaire', 'Edit salary')} className="flex items-center gap-0.5">{cell(p.editSalary)}💰</span>
                      <span title={tr('Évaluer', 'Evaluate')}             className="flex items-center gap-0.5">{cell(p.evaluate)}📊</span>
                      <span title={tr('Coordonner', 'Coordinate')}        className="flex items-center gap-0.5">{cell(p.coordinate)}🗓️</span>
                      <span title={tr('Comptes auth', 'Auth')}            className="flex items-center gap-0.5">{cell(p.viewAuth)}🔑</span>
                    </div>
                  </div>
                </div>
                {/* Flèche vers le bas */}
                {idx < sortedLevels.length - 1 && <div className="absolute -left-5 -bottom-2 text-gray-400 text-xs">▼</div>}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-3">
          <div className="text-xs font-bold mb-1.5">{tr('Légende des icônes', 'Icon legend')} :</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
            <div>👥 {tr('Voir employés', 'View staff')}</div>
            <div>✏️ {tr('Modifier employés', 'Edit staff')}</div>
            <div>💵 {tr('Voir salaire', 'View salary')}</div>
            <div>💰 {tr('Modifier salaire', 'Edit salary')}</div>
            <div>📊 {tr('Évaluer', 'Evaluate')}</div>
            <div>🗓️ {tr('Coordonner', 'Coordinate')}</div>
            <div>🔑 {tr('Comptes auth', 'Auth accounts')}</div>
          </div>
        </div>

        {/* Notes importantes */}
        <div className="space-y-2 text-xs">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-3">
            🔒 <strong className="text-emerald-700 dark:text-emerald-300">{tr('Salaires bloqués', 'Salary blocked')} :</strong>{' '}
            {tr('niveaux 1 à 4 ne voient PAS les salaires. Seuls Admin paie (5), RH (6), Direction (7), Super-utilisateur (8) y ont accès.', 'levels 1–4 do NOT see salaries. Only Payroll admin (5), HR (6), Management (7), Super-user (8) can access them.')}
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/10 p-3">
            👥 <strong className="text-blue-700 dark:text-blue-300">{tr('Liste des employés', 'Staff list')} :</strong>{' '}
            {tr('accessible à partir du niveau 3 (Coordination). Les niveaux 1 et 2 ne voient que leurs propres données.', 'accessible from level 3 (Coordination). Levels 1 and 2 see only their own data.')}
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/10 p-3">
            👑 <strong className="text-red-700 dark:text-red-300">{tr('Direction (7) & Super-utilisateur (8)', 'Management (7) & Super-user (8)')} :</strong>{' '}
            {tr('accès TOTAL incluant configuration système. À attribuer avec parcimonie.', 'TOTAL access including system config. Assign sparingly.')}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutocompleteInput({ value, onChange, suggestions, placeholder, className }: {
  value: string; onChange: (v: string) => void;
  suggestions: string[]; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
  return (
    <div className={`relative ${className || ''}`}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute left-0 bottom-full z-30 mb-0.5 w-full min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg overflow-hidden max-h-40 overflow-y-auto">
          {filtered.map(s => (
            <li key={s}>
              <button type="button" onMouseDown={() => { onChange(s); setOpen(false); }}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  type TabKey = 'sitesdepts' | 'employes' | 'vehicules' | 'ressources' | 'clients' | 'feuilles' | 'paie' | 'abonnement' | 'facturation';
  const [tab, setTab] = useState<TabKey>('sitesdepts');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { perms, niveauAcces, userEmail } = useCurrentAccess(tenant);

  const tabs: { k: TabKey; label: string; icon: any }[] = [
    { k: 'sitesdepts',  label: tr('Sites / Dépts', 'Sites / Depts'),       icon: MapPin },
    { k: 'employes',    label: tr('Employés & Accès', 'Employees & Access'), icon: HardHat },
    { k: 'vehicules',   label: tr('Véhicules', 'Vehicles'),                  icon: Car },
    { k: 'ressources',  label: tr('Ressources', 'Resources'),                icon: Wrench },
    { k: 'clients',     label: tr('Clients', 'Clients'),                     icon: Building2 },
    { k: 'feuilles',    label: tr('Feuilles de temps', 'Timesheets'),        icon: Clock },
    { k: 'paie',        label: tr('Paie & Avantages', 'Pay & Benefits'),     icon: Banknote },
    { k: 'abonnement',  label: tr('Abonnement', 'Subscription'),             icon: CreditCard },
    { k: 'facturation', label: tr('Facturation', 'Billing'),                 icon: Settings },
  ];

  const activeTab = tabs.find(t => t.k === tab);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">{tr('Administration', 'Administration')}</h1>
          {userEmail && (() => {
            const lvl = ACCESS_LEVELS.find(l => l.value === niveauAcces);
            const tierStyles: Record<number, string> = {
              1: 'bg-gray-100 text-gray-700 border-gray-300',
              2: 'bg-blue-100 text-blue-700 border-blue-300',
              3: 'bg-cyan-100 text-cyan-700 border-cyan-300',
              4: 'bg-indigo-100 text-indigo-700 border-indigo-300',
              5: 'bg-amber-100 text-amber-700 border-amber-300',
              6: 'bg-pink-100 text-pink-700 border-pink-300',
              7: 'bg-emerald-100 text-emerald-700 border-emerald-300',
              8: 'bg-red-100 text-red-700 border-red-300',
            };
            return lvl ? (
              <div className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${tierStyles[lvl.tier]}`} title={userEmail}>
                <span className="text-lg">{lvl.emoji}</span>
                <div className="text-left">
                  <div className="text-[10px] uppercase opacity-70 leading-none">{tr('Niveau', 'Tier')} {lvl.tier}</div>
                  <div className="font-bold leading-tight">{tr(lvl.label_fr, lvl.label_en)}</div>
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Mobile: hamburger */}
        <div className="mb-4 sm:hidden">
          <div className="relative">
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <div className="flex items-center gap-2">
                {activeTab && React.createElement(activeTab.icon as any, { size: 16 })}
                {activeTab?.label}
              </div>
              <svg className={`h-5 w-5 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {tabs.map(x => {
                  const Icon = x.icon as any;
                  return (
                    <button key={x.k} onClick={() => { setTab(x.k); setMobileMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
                      <Icon size={15} /> {x.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: onglets */}
        <div className="mb-4 hidden gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex">
          {tabs.map(x => {
            const Icon = x.icon as any;
            return (
              <button key={x.k} onClick={() => setTab(x.k)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                <Icon size={15} /> {x.label}
              </button>
            );
          })}
        </div>

        {tab === 'sitesdepts' && <SitesDepts tenant={tenant} tr={tr} />}
        {tab === 'employes'   && <Employes tenant={tenant} tr={tr} perms={perms} />}
        {tab === 'vehicules'  && <Vehicules tenant={tenant} tr={tr} />}
        {tab === 'ressources' && <Ressources tenant={tenant} tr={tr} />}
        {tab === 'clients'    && <Clients tenant={tenant} tr={tr} />}
        {tab === 'feuilles'   && <FeuillesDeTemps tenant={tenant} tr={tr} />}
        {tab === 'paie'       && <PayeConfig tenant={tenant} tr={tr} />}
        {tab === 'abonnement' && <Abonnement tenant={tenant} tr={tr} lang={lang} />}
        {tab === 'facturation' && <FacturationProjets tenant={tenant} tr={tr} />}
      </div>
    </div>
  );
}

// ============================================================
// FEUILLES DE TEMPS — admin payroll view + export
// ============================================================

function FeuillesDeTemps({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheets').select('*').eq('tenant_id', tenant).order('period_start', { ascending: false });
    setSheets(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const employees = useMemo(() => [...new Set(sheets.map((s: any) => s.employee_name))].sort(), [sheets]);
  const years = useMemo(() => {
    const ys = [...new Set(sheets.map((s: any) => new Date(s.period_start).getFullYear()))].sort((a: any, b: any) => b - a) as number[];
    return ys.length ? ys : [new Date().getFullYear()];
  }, [sheets]);

  const filtered = useMemo(() => sheets.filter((s: any) => {
    if (new Date(s.period_start).getFullYear() !== yearFilter) return false;
    if (empFilter && s.employee_name !== empFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  }), [sheets, yearFilter, empFilter, statusFilter]);

  const totals = useMemo(() => filtered.reduce((acc: any, s: any) => ({
    hrs: acc.hrs + Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium),
    km: acc.km + Number(s.total_km_personal),
    amt: acc.amt + Number(s.total_amount),
    ded: acc.ded + Number(s.vehicle_deduction || 0),
  }), { hrs: 0, km: 0, amt: 0, ded: 0 }), [filtered]);

  function weekNum(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const w1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  }

  function exportCSV() {
    const toExport = filtered.filter((s: any) => s.status === 'approved' || s.status === 'paid');
    if (!toExport.length) { alert(tr('Aucune feuille approuvée dans la sélection.', 'No approved sheet in selection.')); return; }
    const rows = [
      ['Employé', 'Email', 'Période #', 'Période début', 'Période fin', 'Hrs rég', 'Hrs supp', 'Hrs maj', 'Km pers.', 'Montant total', 'Statut'].join(','),
      ...toExport.map((s: any) => [`"${s.employee_name}"`, s.employee_email, `P.${weekNum(s.period_start)}`, s.period_start, s.period_end,
        s.total_regular, s.total_overtime, s.total_premium, s.total_km_personal, s.total_amount, s.status].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `paie_${yearFilter}_${tenant}${empFilter ? `_${empFilter.replace(/\s+/g, '_')}` : ''}.csv`,
    });
    a.click();
  }

  const mny = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });

  const STATUS_CLS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600', submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', paid: 'bg-blue-100 text-blue-700',
  };
  const STATUS_LBL: Record<string, string> = { draft: tr('Brouillon','Draft'), submitted: tr('Soumis','Submitted'), approved: tr('Approuvé','Approved'), rejected: tr('Refusé','Rejected'), paid: tr('Payé','Paid') };

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: tr('Heures totales', 'Total hours'),       value: `${totals.hrs.toFixed(1)} h`, tone: 'text-slate-900 dark:text-white' },
          { label: tr('Km remboursables', 'Reimbursable km'), value: `${totals.km.toFixed(0)} km`, tone: 'text-emerald-600' },
          { label: tr('Déductions véhicule', 'Vehicle ded.'), value: totals.ded > 0 ? `-${mny(totals.ded)}` : '0,00 $', tone: 'text-red-600' },
          { label: tr('Montant total', 'Total amount'),       value: mny(totals.amt),              tone: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className={`text-2xl font-bold ${s.tone}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${yearFilter === y ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              {y}
            </button>
          ))}
        </div>
        {employees.length > 0 && (
          <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="">{tr('Tous les employés', 'All employees')}</option>
            {employees.map(emp => <option key={emp as string} value={emp as string}>{emp as string}</option>)}
          </select>
        )}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">{tr('Tous les statuts', 'All statuses')}</option>
          <option value="draft">{tr('Brouillon', 'Draft')}</option>
          <option value="submitted">{tr('Soumis', 'Submitted')}</option>
          <option value="approved">{tr('Approuvé', 'Approved')}</option>
          <option value="paid">{tr('Payé', 'Paid')}</option>
          <option value="rejected">{tr('Refusé', 'Rejected')}</option>
        </select>
        <div className="ml-auto">
          <button onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            <DollarSign size={15} /> {tr('Export paie CSV', 'Export payroll CSV')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="mobile-cards w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="px-4 py-3">{tr('Employé', 'Employee')}</th>
                <th className="px-4 py-3">{tr('Période', 'Period')}</th>
                <th className="px-4 py-3">{tr('Heures', 'Hours')}</th>
                <th className="px-4 py-3">{tr('Km pers.', 'Pers. km')}</th>
                <th className="px-4 py-3 text-red-600">{tr('Déd. véhicule', 'Vehicle ded.')}</th>
                <th className="px-4 py-3">{tr('Montant', 'Amount')}</th>
                <th className="px-4 py-3">{tr('Statut', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => {
                const hrs = Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium);
                return (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3" data-label={tr('Employé', 'Employee')}>
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-bold dark:bg-gray-600">{(s.employee_name || '?')[0].toUpperCase()}</div>
                        <div>
                          <div className="font-medium">{s.employee_name}</div>
                          <div className="text-xs text-gray-400">{s.employee_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" data-label={tr('Période', 'Period')}>
                      <div className="text-right sm:text-left">
                        <div className="text-xs font-semibold text-violet-500">P.{weekNum(s.period_start)}</div>
                        <div className="text-gray-600 dark:text-gray-300">{fmt(s.period_start)} – {fmt(s.period_end)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium" data-label={tr('Heures', 'Hours')}>{hrs.toFixed(1)} h</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300" data-label={tr('Km pers.', 'Pers. km')}>{Number(s.total_km_personal).toFixed(0)} km</td>
                    <td className="px-4 py-3 font-semibold text-red-600" data-label={tr('Déd. véhicule', 'Vehicle ded.')}>
                      {Number(s.vehicle_deduction || 0) > 0 ? `-${mny(Number(s.vehicle_deduction))}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-violet-700" data-label={tr('Montant', 'Amount')}>{mny(Number(s.total_amount))}</td>
                    <td className="px-4 py-3" data-label={tr('Statut', 'Status')}>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[s.status] || STATUS_CLS.draft}`}>
                        {STATUS_LBL[s.status] || s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{tr('Aucune feuille de temps pour cette sélection.', 'No timesheet for this selection.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FacturationProjets({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'resume' | 'factures'>('resume');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('projects')
      .select('id, project_number, title, client_name, status, po_amount, estimate, actuals, facture')
      .eq('tenant_id', tenant).order('created_at', { ascending: false });
    setRows(data || []); setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const reelOf = (r: any) => Number(r.actuals?.total || 0);
  const sum = (st: string) => rows.filter(r => r.status === st).reduce((s, r) => s + Number(r.po_amount || 0), 0);
  const margeTotale = rows.filter(r => r.status === 'facture').reduce((s, r) => s + (Number(r.po_amount || 0) - reelOf(r)), 0);

  const INV: Record<string, { label: string; cls: string }> = {
    draft:     { label: tr('Brouillon', 'Draft'),   cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    sent:      { label: tr('Envoyée', 'Sent'),      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    paid:      { label: tr('Payée', 'Paid'),        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    cancelled: { label: tr('Annulée', 'Cancelled'), cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' },
  };

  function startEdit(row: any) {
    setEditing(row.id);
    const idx = rows.findIndex(r => r.id === row.id);
    setForm(row.facture || {
      invoice_number: `F-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
      invoice_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft', notes: '',
    });
  }

  async function saveInvoice(projectId: string) {
    setSaving(true); setNotice(null);
    try {
      await supabase.from('projects').update({ facture: form }).eq('id', projectId);
      setRows(p => p.map(r => r.id === projectId ? { ...r, facture: form } : r));
      setEditing(null); setNotice(tr('Facture enregistrée ✓', 'Invoice saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  const fmtDate = (d?: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const inp = 'w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800';

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Commerce CERDIA banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-xs font-bold text-white">CC</div>
        <div>
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Commerce CERDIA</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300">
            {tr('Toutes les factures sont émises par Commerce CERDIA. Aucun lien avec les finances personnelles.', 'All invoices are issued by Commerce CERDIA. No link to personal finances.')}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { k: 'resume',   label: tr('Résumé', 'Summary') },
          { k: 'factures', label: tr('Factures émises', 'Issued invoices') },
        ].map(x => (
          <button key={x.k} onClick={() => setSubTab(x.k as any)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
            {x.label}
          </button>
        ))}
      </div>

      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{notice}</div>}

      {/* ── Résumé ── */}
      {subTab === 'resume' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: tr('Facturé', 'Invoiced'),          value: money(sum('facture')),   tone: 'text-emerald-600' },
              { label: tr('En cours', 'In progress'),      value: money(sum('en-cours')),  tone: 'text-blue-600' },
              { label: tr('Soumissions', 'Quotes'),        value: money(sum('soumission')), tone: 'text-amber-600' },
              { label: tr('Marge (facturé − réel)', 'Margin (invoiced − actual)'), value: money(margeTotale), tone: margeTotale >= 0 ? 'text-emerald-600' : 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 px-4 py-3 font-bold dark:border-gray-700">{tr('Projets', 'Projects')}</div>
            <div className="overflow-x-auto">
              <table className="mobile-cards w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-3 py-2">{tr('Projet', 'Project')}</th><th className="px-3">{tr('Client', 'Client')}</th>
                  <th className="px-3">{tr('Statut projet', 'Project status')}</th><th className="px-3 text-right">{tr('Estimé', 'Est.')}</th>
                  <th className="px-3 text-right">{tr('Réel', 'Actual')}</th><th className="px-3 text-right">{tr('Facturé', 'Invoiced')}</th><th className="px-3 text-right">{tr('Marge', 'Margin')}</th>
                </tr></thead>
                <tbody>
                  {rows.map(r => {
                    const est = Number(r.estimate?.total || 0); const reel = reelOf(r); const fac = Number(r.po_amount || 0); const marge = fac - reel;
                    return (
                      <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2" data-label={tr('Projet', 'Project')}><div className="font-medium">{r.title || r.project_number}</div><div className="text-xs text-gray-400">#{r.project_number}</div></td>
                        <td className="px-3 text-gray-600 dark:text-gray-300" data-label={tr('Client', 'Client')}>{r.client_name || '—'}</td>
                        <td className="px-3" data-label={tr('Statut projet', 'Project status')}><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{r.status || 'soumission'}</span></td>
                        <td className="px-3 text-right" data-label={tr('Estimé', 'Est.')}>{money(est)}</td>
                        <td className="px-3 text-right" data-label={tr('Réel', 'Actual')}>{money(reel)}</td>
                        <td className="px-3 text-right font-medium" data-label={tr('Facturé', 'Invoiced')}>{money(fac)}</td>
                        <td className={`px-3 text-right font-medium ${marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`} data-label={tr('Marge', 'Margin')}>{r.status === 'facture' ? money(marge) : '—'}</td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">{tr('Aucun projet.', 'No project.')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Factures émises ── */}
      {subTab === 'factures' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <div className="font-bold">{tr('Factures émises', 'Issued invoices')}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{tr('Une facture par projet — stockée directement sur le projet.', 'One invoice per project — stored directly on the project.')}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="px-4 py-3">{tr('Projet', 'Project')}</th>
                  <th className="px-4 py-3">{tr('Client', 'Client')}</th>
                  <th className="px-4 py-3">{tr('N° facture', 'Invoice #')}</th>
                  <th className="px-4 py-3">{tr('Date', 'Date')}</th>
                  <th className="px-4 py-3">{tr('Échéance', 'Due')}</th>
                  <th className="px-4 py-3 text-right">{tr('Montant', 'Amount')}</th>
                  <th className="px-4 py-3">{tr('Statut', 'Status')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const inv = r.facture;
                  const st = inv ? (INV[inv.status] || INV.draft) : null;
                  return (
                    <React.Fragment key={r.id}>
                      <tr className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3" data-label={tr('Projet', 'Project')}><div className="font-medium">{r.title || r.project_number}</div><div className="text-xs text-gray-400">#{r.project_number}</div></td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300" data-label={tr('Client', 'Client')}>{r.client_name || '—'}</td>
                        <td className="px-4 py-3 font-mono" data-label={tr('N° facture', 'Invoice #')}>{inv?.invoice_number || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs" data-label={tr('Date', 'Date')}>{fmtDate(inv?.invoice_date)}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs" data-label={tr('Échéance', 'Due')}>{fmtDate(inv?.due_date)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700" data-label={tr('Montant', 'Amount')}>{Number(r.po_amount) > 0 ? money(Number(r.po_amount)) : '—'}</td>
                        <td className="px-4 py-3" data-label={tr('Statut', 'Status')}>
                          {st ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                              : <span className="text-xs text-gray-400 dark:text-gray-500">{tr('Non facturé', 'Not invoiced')}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => editing === r.id ? setEditing(null) : startEdit(r)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            {editing === r.id ? '✕' : (inv ? tr('Modifier', 'Edit') : tr('+ Créer', '+ Create'))}
                          </button>
                        </td>
                      </tr>
                      {editing === r.id && (
                        <tr className="border-t border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('N° facture', 'Invoice #')}</label>
                                <input className={inp} value={form.invoice_number || ''} onChange={e => setForm((f: any) => ({ ...f, invoice_number: e.target.value }))} placeholder="F-2026-001" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Date facture', 'Invoice date')}</label>
                                <input type="date" className={inp} value={form.invoice_date || ''} onChange={e => setForm((f: any) => ({ ...f, invoice_date: e.target.value }))} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Échéance', 'Due date')}</label>
                                <input type="date" className={inp} value={form.due_date || ''} onChange={e => setForm((f: any) => ({ ...f, due_date: e.target.value }))} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Statut', 'Status')}</label>
                                <select className={inp} value={form.status || 'draft'} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}>
                                  <option value="draft">{tr('Brouillon', 'Draft')}</option>
                                  <option value="sent">{tr('Envoyée', 'Sent')}</option>
                                  <option value="paid">{tr('Payée', 'Paid')}</option>
                                  <option value="cancelled">{tr('Annulée', 'Cancelled')}</option>
                                </select>
                              </div>
                              {form.status === 'paid' && (
                                <div>
                                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Date paiement', 'Payment date')}</label>
                                  <input type="date" className={inp} value={form.paid_date || ''} onChange={e => setForm((f: any) => ({ ...f, paid_date: e.target.value }))} />
                                </div>
                              )}
                              <div className="flex items-end">
                                <button onClick={() => saveInvoice(r.id)} disabled={saving}
                                  className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
                                </button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</label>
                              <input className={inp} value={form.notes || ''} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder={tr('Notes internes...', 'Internal notes...')} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">{tr('Aucun projet.', 'No project.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Sites({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('sites').select('id, name, code, type, address, is_active').eq('tenant_id', tenant).order('name');
    setRows((data || []).map((s: any) => ({ ...s, addressText: s.address?.text || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: string, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', code: '', type: 'chantier', addressText: '', is_active: true }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const data: any = { tenant_id: tenant, name: r.name, code: r.code || null, type: r.type || 'site', is_active: r.is_active !== false, address: r.addressText ? { text: r.addressText } : null };
        if (r.id) await supabase.from('sites').update(data).eq('id', r.id);
        else await supabase.from('sites').insert(data);
      }
      setNotice(tr('Sites enregistrés ✓', 'Sites saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }
  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('sites').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div><h2 className="font-bold">{tr('Sites du client', 'Client sites')}</h2><p className="text-xs text-gray-500">{tr('Alimentent le sélecteur « Tous les sites / un site ».', 'Feed the “All sites / one site” selector.')}</p></div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="mobile-cards w-full text-sm">
          <thead><tr className="text-left text-gray-500 dark:text-gray-400"><th className="px-2 py-2">{tr('Nom', 'Name')}</th><th className="px-2">{tr('Code', 'Code')}</th><th className="px-2">{tr('Type', 'Type')}</th><th className="px-2">{tr('Adresse', 'Address')}</th><th className="px-2">{tr('Actif', 'Active')}</th><th></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1" data-label={tr('Nom', 'Name')}><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} /></td>
                <td className="px-2" data-label={tr('Code', 'Code')}><input className={`${inp} w-24`} value={r.code || ''} onChange={e => upd(i, 'code', e.target.value)} /></td>
                <td className="px-2" data-label={tr('Type', 'Type')}>
                  <select className={`${inp} w-28`} value={r.type || 'site'} onChange={e => upd(i, 'type', e.target.value)}>
                    <option value="siege">{tr('Siège', 'HQ')}</option><option value="chantier">{tr('Chantier', 'Job site')}</option><option value="bureau">{tr('Bureau', 'Office')}</option><option value="site">Site</option>
                  </select>
                </td>
                <td className="px-2" data-label={tr('Adresse', 'Address')}><input className={inp} value={r.addressText || ''} onChange={e => upd(i, 'addressText', e.target.value)} /></td>
                <td className="px-2" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-gray-400">{tr('Aucun site. Ajoute le siège et les chantiers.', 'No site. Add HQ and job sites.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Abonnement({ tenant, tr, lang }: { tenant: string; tr: (f: string, e: string) => string; lang: string }) {
  const [mods, setMods] = useState<Mod[]>([]);
  const [cfg, setCfg] = useState({ discount_per_module: 5, discount_cap: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: catalog, error } = await supabase.from('modules').select('*').order('sort_order');
        if (error) throw error;
        const { data: tm } = await supabase.from('tenant_modules').select('module_key, enabled').eq('tenant_id', tenant);
        const enabledSet = new Set((tm || []).filter((x: any) => x.enabled).map((x: any) => x.module_key));
        const { data: bc } = await supabase.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle();
        if (bc) setCfg({ discount_per_module: Number(bc.discount_per_module), discount_cap: Number(bc.discount_cap) });
        if (active) setMods((catalog || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price), enabled: enabledSet.has(m.key) })));
      } catch {
        if (active) setMods([]);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [tenant]);

  const selected = mods.filter(m => m.enabled);
  const subtotal = useMemo(() => selected.reduce((s, m) => s + (m.monthly_price || 0), 0), [mods]);
  const discountPct = Math.min(Math.max(selected.length - 1, 0) * cfg.discount_per_module, cfg.discount_cap);
  const total = subtotal * (1 - discountPct / 100);

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (mods.length === 0) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun module configuré. Contactez votre administrateur.', 'No module configured. Contact your administrator.')}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-bold">{tr('Modules actifs', 'Active modules')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tr('Configuré par votre administrateur C-Secur360.', 'Configured by your C-Secur360 administrator.')}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {tr('Lecture seule', 'Read only')}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {mods.map(m => (
            <div key={m.key} className="flex items-center gap-3 px-4 py-2.5">
              <div className={`grid h-6 w-6 place-items-center rounded border ${m.enabled ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'}`}>
                {m.enabled && <Check size={14} />}
              </div>
              <span className={`flex-1 font-medium ${!m.enabled ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                {lang === 'fr' ? m.name_fr : m.name_en}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {m.monthly_price > 0 ? `${money(m.monthly_price)}/${tr('an', 'yr')}` : tr('Inclus', 'Included')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 font-bold">{tr('Facture annuelle', 'Annual invoice')}</h2>
        <div className="space-y-1 text-sm">
          {selected.map(m => (
            <div key={m.key} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{lang === 'fr' ? m.name_fr : m.name_en}</span>
              <span>{money(m.monthly_price)}</span>
            </div>
          ))}
          {selected.length === 0 && <div className="text-gray-400">{tr('Aucun module actif', 'No active module')}</div>}
        </div>
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>{tr('Sous-total', 'Subtotal')}</span><span>{money(subtotal)}</span></div>
          {discountPct > 0 && (
            <div className="flex justify-between text-emerald-600"><span>{tr('Escompte', 'Discount')} ({discountPct}%)</span><span>− {money(subtotal * discountPct / 100)}</span></div>
          )}
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          {tr('Pour modifier votre abonnement, contactez votre administrateur C-Secur360.', 'To modify your subscription, contact your C-Secur360 administrator.')}
        </p>
      </div>
    </div>
  );
}

function Clients({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type CRow = { id?: string; name: string; contact_name: string; contact_email: string; contact_phone: string; phone: string; email: string; address: string; city: string; province: string; postal_code: string; notes: string; active: boolean };
  const empty = (): CRow => ({ name: '', contact_name: '', contact_email: '', contact_phone: '', phone: '', email: '', address: '', city: '', province: 'QC', postal_code: '', notes: '', active: true });
  const [rows, setRows] = useState<CRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState<CRow>(empty());
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenant).order('name');
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function select(i: number) { setSelected(i); setForm({ ...rows[i] }); }
  function deselect() { setSelected(null); setForm(empty()); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true); setNotice(null);
    try {
      const payload = { tenant_id: tenant, ...form };
      if (form.id) { await supabase.from('clients').update(payload).eq('id', form.id); }
      else { await supabase.from('clients').insert(payload); }
      setNotice(tr('Client enregistré ✓', 'Client saved ✓'));
      deselect(); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    await supabase.from('clients').delete().eq('id', id);
    deselect(); load();
  }

  const provinces = ['QC','ON','BC','AB','SK','MB','NB','NS','PE','NL','NT','YT','NU'];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div><h2 className="font-bold">{tr('Répertoire clients', 'Client directory')}</h2>
          <p className="text-xs text-gray-500">{tr('Prérempli automatiquement lors de la création de projets.', 'Auto-fills when creating projects.')}</p></div>
          <button onClick={() => { deselect(); setForm(empty()); setSelected(-1); }}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={15} /> {tr('Nouveau', 'New')}
          </button>
        </div>
        {loading ? <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((r, i) => (
              <div key={r.id} onClick={() => select(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selected === i ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Building2 size={16} className="text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-sm">{r.name}</div>
                  <div className="truncate text-xs text-gray-500">{[r.contact_name, r.city, r.province].filter(Boolean).join(' · ')}</div>
                </div>
                {!r.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-gray-700">{tr('Inactif', 'Inactive')}</span>}
              </div>
            ))}
            {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">{tr('Aucun client. Crée-en un.', 'No client. Create one.')}</div>}
          </div>
        )}
      </div>

      {/* Fiche client */}
      {selected !== null && (
        <div className="h-fit space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{form.id ? tr('Modifier client', 'Edit client') : tr('Nouveau client', 'New client')}</h2>
            <button onClick={deselect} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {notice && <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Entreprise *', 'Company *')}</label>
            <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hydro-Québec" />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Contact', 'Contact')}</label>
              <input className={inp} value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Tél. direct', 'Direct phone')}</label>
              <input className={inp} value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="514-555-0001" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Courriel contact', 'Contact email')}</label>
              <input type="email" className={inp} value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="jean@exemple.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Tél. bureau', 'Office phone')}</label>
              <input className={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="514-555-0000" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Courriel facturation', 'Billing email')}</label>
            <input type="email" className={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="facturation@exemple.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Adresse', 'Address')}</label>
            <input className={inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 rue Principale" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Ville', 'City')}</label>
              <input className={inp} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Montréal" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Province</label>
              <select className={inp} value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Code postal', 'Postal code')}</label>
            <input className={`${inp} uppercase`} value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value.toUpperCase() }))} placeholder="H1A 2B3" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</label>
            <textarea className={inp} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            {tr('Client actif', 'Active client')}
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !form.name.trim()}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
            </button>
            {form.id && (
              <button onClick={() => del(form.id!)}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type VRegime = 'A_achat' | 'A_bail' | 'A_financement' | 'B_personnel';

type VClass = 'tourisme' | 'utilitaire' | 'specialise';

type VRow = {
  id?: string; regime: VRegime; vehicle_class: VClass; is_sales_employee: boolean;
  unit_number: string; make: string; model: string; year: string; plate: string;
  employee_name: string; assigned_to: string; engine_type: 'thermique' | 'electrique';
  km_rate_override: string; purchase_price: string;
  monthly_lease_cost: string; interest_monthly: string;
  km_at_year_start: string; active: boolean; notes: string;
  photos: string[];
};

// Taux ARC/Revenu Québec 2026 — à mettre à jour chaque année (sources : canada.ca + revenuquebec.ca)
const ARC_2026 = {
  standby_monthly:          0.02,         // 2 %/mois — droit d'usage (federal + QC)
  standby_lease_frac:       2 / 3,        // 2/3 du coût bail — droit d'usage bail
  operating_per_km:         0.34,         // avantage fonctionnement fédéral $/km
  operating_per_km_qc:      0.33,         // avantage fonctionnement Revenu Québec $/km
  operating_sales:          0.31,         // vendeur/loueur d'autos (fédéral)
  operating_sales_qc:       0.30,         // vendeur/loueur d'autos (QC)
  half_method_fraction:     0.50,         // méthode de la moitié
  km_t1_rate:               0.73,         // remb. perso palier 1 (2026)
  km_t2_rate:               0.67,         // remb. perso palier 2 (2026)
  km_t1_threshold:          5000,
  reduced_standby_km_30d:   1667,         // seuil km perso / 30 j (droit d'usage réduit)
  reduced_standby_km_annual: 20004,       // seuil annuel équivalent
  bail_cap:                 1100,         // plafond bail/mois 2026 (hors taxes)
  interest_cap:             300,          // plafond intérêts financement/mois
  cca10_rate:               0.30,         // Cat. 10/10.1 thermique — 30 %/an dégressif
  cca10_cap:                39000,        // plafond coût Cat. 10.1 (2026, hors taxes)
  cca54_rate:               1.00,         // Cat. 54 ZEV — 100 % an 1
  cca54_cap:                61000,        // plafond coût Cat. 54
  perso_km_utilitaire:      1000,         // km perso max/an pour exemption utilitaire
  reimb_delay_days:         45,           // délai remboursement après fin d'année (jours)
} as const;

function calcDPA(prix: number, moteur: 'thermique' | 'electrique', vclass: VClass) {
  if (vclass === 'specialise') return null; // véhicule spécialisé — pas d'avantage imposable
  if (moteur === 'electrique') {
    const base = Math.min(prix, ARC_2026.cca54_cap);
    return { classe: '54', an1: Math.round(base), label: 'Cat. 54 ZEV — 100 % an 1' };
  }
  const base = Math.min(prix, ARC_2026.cca10_cap);
  const cl = prix > ARC_2026.cca10_cap ? '10.1' : '10';
  return { classe: cl, an1: Math.round(base * ARC_2026.cca10_rate * 0.5), label: `Cat. ${cl} — 15 % an 1 (½-année)` };
}

function calcAvantageTotal(prix: number, moisDispo: number, kmPerso: number, kmAffaires: number, isSales: boolean, useHalfMethod: boolean) {
  const totalKm = kmPerso + kmAffaires;
  const businessPct = totalKm > 0 ? kmAffaires / totalKm : 0;
  const standbyNormal = prix * ARC_2026.standby_monthly * moisDispo;

  // Droit d'usage réduit
  const eligible = businessPct > 0.5 && kmPerso <= ARC_2026.reduced_standby_km_30d * moisDispo;
  const reductionFactor = eligible ? Math.min(kmPerso / (ARC_2026.reduced_standby_km_annual * moisDispo / 12), 1) : 1;
  const standbyCharge = Math.round(standbyNormal * reductionFactor);

  // Avantage fonctionnement
  const opRate = isSales ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
  const opStandard = Math.round(kmPerso * opRate);
  const opHalf = Math.round(standbyCharge * ARC_2026.half_method_fraction);
  const operatingBenefit = useHalfMethod && businessPct > 0.5 ? Math.min(opStandard, opHalf) : opStandard;

  return { standbyNormal: Math.round(standbyNormal), standbyCharge, reductionFactor, eligible, operatingBenefit, total: standbyCharge + operatingBenefit, opStandard, opHalf };
}

function standbyNote(vclass: VClass, isSales: boolean) {
  if (vclass === 'specialise') return { exempt: true, note: 'Véhicule spécialisé — probablement exempt (non "automobile" selon LIR)' };
  if (vclass === 'utilitaire') return { exempt: false, note: `Utilitaire — exempt si ≥ 90 % affaires ET km perso ≤ ${ARC_2026.perso_km_utilitaire.toLocaleString('fr-CA')} /an (à vérifier)` };
  const opRate = isSales ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
  return { exempt: false, note: `Tourisme — fonctionnement ${opRate.toFixed(2)} $/km${isSales ? ' (vendeur auto)' : ''}` };
}

function calcBail(monthly: number) {
  const ded = Math.min(monthly, ARC_2026.bail_cap);
  return { ded, annuel: ded * 12, plafonné: monthly > ARC_2026.bail_cap };
}

function calcInteret(monthly: number) {
  const ded = Math.min(monthly, ARC_2026.interest_cap);
  return { ded, annuel: ded * 12, plafonné: monthly > ARC_2026.interest_cap };
}

function SelectUp({ value, onChange, options, className }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  React.useEffect(() => {
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-1 rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-left text-sm outline-none hover:border-blue-400 focus:border-blue-500 dark:border-gray-600 dark:text-gray-200">
        <span className="truncate text-sm">{selected?.label || '—'}</span>
        <svg className={`h-3 w-3 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute bottom-full left-0 z-50 mb-1 max-h-52 w-full min-w-[180px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
          {options.map(o => (
            <li key={o.value}>
              <button type="button"
                onMouseDown={() => { onChange(o.value); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition hover:bg-blue-50 dark:hover:bg-blue-900/30 ${o.value === value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VehicleTable({ regime, label, items, onAdd, upd, del, tr, inp, personnelSuggestions, tenantUsers, onPhotoUpload, tenant }: {
  regime: VRegime; label: string; items: { r: VRow; i: number }[];
  onAdd: () => void; upd: (i: number, k: keyof VRow, v: any) => void;
  del: (i: number) => void; tr: (f: string, e: string) => string; inp: string;
  personnelSuggestions: string[]; tenantUsers: { id: string; name: string; email: string }[];
  onPhotoUpload: (i: number, url: string) => void;
  tenant: string;
}) {
  const isB  = regime === 'B_personnel';
  const isBail = regime === 'A_bail';
  const isFin  = regime === 'A_financement';
  const isAchat = regime === 'A_achat';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm">{label}</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">{items.length}</span>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
          <Plus size={15} /> {tr('Ajouter', 'Add')}
        </button>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="mobile-cards w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('N° unité', 'Unit #')}</th>
              <th className="px-2">{tr('Marque', 'Make')}</th>
              <th className="px-2">{tr('Modèle', 'Model')}</th>
              <th className="px-2">{tr('Année', 'Year')}</th>
              <th className="px-2">{tr('Plaque', 'Plate')}</th>
              <th className="px-2 whitespace-nowrap">{tr('Employé attitré', 'Assigned employee')}</th>
              <th className="px-2 whitespace-nowrap">{tr('Régime', 'Regime')}</th>
              {!isB && (
                <th className="px-2 whitespace-nowrap">
                  {tr('Classe véh.', 'Veh. class')}
                  <div className="font-normal text-[10px] text-gray-400 space-y-0.5 mt-0.5">
                    <div>🚗 {tr('Tourisme', 'Passenger')} — {tr('Camry, RAV4, VUS, EV', 'Camry, RAV4, SUV, EV')}</div>
                    <div>🚛 {tr('Utilitaire ≥ 1T', 'Commercial ≥ 1T')} — {tr('F-250, Sprinter', 'F-250, Sprinter')}</div>
                    <div>🏗️ {tr('Spécialisé', 'Specialized')} — {tr('nacelle, grue', 'boom lift, crane')}</div>
                  </div>
                </th>
              )}
              {(isAchat || isFin) && <th className="px-2 whitespace-nowrap">{tr('Moteur', 'Engine')}</th>}
              {(isAchat || isFin) && (
                <th className="px-2 whitespace-nowrap">{tr('Prix achat $', 'Purchase $')}
                  <div className="font-normal text-[10px] text-gray-400">{tr('DPA + DU/an', 'CCA + SB/yr')}</div>
                </th>
              )}
              {isBail && (
                <th className="px-2 whitespace-nowrap">{tr('Bail $/mois', 'Lease $/mo')}
                  <div className="font-normal text-[10px] text-gray-400">{tr('plaf. 1 050 $', 'cap $1,050')}</div>
                </th>
              )}
              {isFin && (
                <th className="px-2 whitespace-nowrap">{tr('Intérêts $/mois', 'Interest $/mo')}
                  <div className="font-normal text-[10px] text-gray-400">{tr('plaf. 300 $', 'cap $300')}</div>
                </th>
              )}
              {isB && (
                <th className="px-2 whitespace-nowrap">{tr('Taux km $/km', 'Km rate $/km')}
                  <div className="font-normal text-[10px] text-gray-400">{tr('ARC 2026', 'CRA 2026')}</div>
                </th>
              )}
              {!isB && <th className="px-2 whitespace-nowrap">{tr('Km début an', 'Km year start')}</th>}
              <th className="px-2">{tr('Actif', 'Active')}</th>
              <th className="px-2 whitespace-nowrap">{tr('Photos', 'Photos')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ r, i }) => {
              const prix = parseFloat(r.purchase_price);
              const prixOk = !isNaN(prix) && prix > 0;
              const vclass = r.vehicle_class || 'tourisme';
              const dpa = prixOk ? calcDPA(prix, r.engine_type, vclass as VClass) : null;
              const duAn = prixOk && vclass !== 'specialise' ? Math.round(prix * ARC_2026.standby_monthly * 12) : null;
              const sbNote = standbyNote(vclass as VClass, r.is_sales_employee);
              const bail = r.monthly_lease_cost !== '' && !isNaN(parseFloat(r.monthly_lease_cost))
                ? calcBail(parseFloat(r.monthly_lease_cost)) : null;
              const fin = r.interest_monthly !== '' && !isNaN(parseFloat(r.interest_monthly))
                ? calcInteret(parseFloat(r.interest_monthly)) : null;
              return (
                <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700 align-top">
                  <td className="px-2 py-1.5" data-label={tr('N° unité', 'Unit #')}><input className={`${inp} w-24`} value={r.unit_number} onChange={e => upd(i, 'unit_number', e.target.value)} placeholder="S26105" /></td>
                  <td className="px-2 py-1.5" data-label={tr('Marque', 'Make')}><input className={inp} value={r.make} onChange={e => upd(i, 'make', e.target.value)} placeholder="Toyota" /></td>
                  <td className="px-2 py-1.5" data-label={tr('Modèle', 'Model')}><input className={inp} value={r.model} onChange={e => upd(i, 'model', e.target.value)} placeholder="Corolla" /></td>
                  <td className="px-2 py-1.5" data-label={tr('Année', 'Year')}><input className={`${inp} w-16`} value={r.year} onChange={e => upd(i, 'year', e.target.value)} placeholder="2024" /></td>
                  <td className="px-2 py-1.5" data-label={tr('Plaque', 'Plate')}><input className={`${inp} w-24`} value={r.plate} onChange={e => upd(i, 'plate', e.target.value)} placeholder="ABC-123" /></td>
                  <td className="px-2 py-1.5" data-label={tr('Employé attitré', 'Assigned employee')}>
                    <SelectUp
                      value={r.assigned_to}
                      onChange={v => {
                        const emp = tenantUsers.find(u => u.id === v);
                        upd(i, 'assigned_to', v);
                        upd(i, 'employee_name', emp?.name || emp?.email || '');
                      }}
                      className="min-w-[160px]"
                      options={[
                        { value: '', label: `— ${tr(isB ? 'Propriétaire' : 'Aucun', isB ? 'Owner' : 'None')} —` },
                        ...tenantUsers.map(u => ({ value: u.id, label: u.name || u.email })),
                      ]}
                    />
                  </td>

                  {/* Régime — toujours visible, permet de changer sans recréer */}
                  <td className="px-2 py-1.5" data-label={tr('Régime', 'Regime')}>
                    <select className={`${inp} w-40`} value={r.regime} onChange={e => upd(i, 'regime', e.target.value as VRegime)}>
                      <option value="A_achat">{tr('A — Acheté', 'A — Purchased')}</option>
                      <option value="A_bail">{tr('A — Bail', 'A — Lease')}</option>
                      <option value="A_financement">{tr('A — Financement', 'A — Financed')}</option>
                      <option value="B_personnel">{tr('B — Personnel', 'B — Personal')}</option>
                    </select>
                  </td>

                  {/* Classe du véhicule — Régime A seulement */}
                  {!isB && (
                    <td className="px-2 py-1.5 mc-stack" data-label={tr('Classe véh.', 'Veh. class')}>
                      <div className="space-y-0.5">
                        <select className={`${inp} w-36`} value={r.vehicle_class || 'tourisme'} onChange={e => upd(i, 'vehicle_class', e.target.value)}>
                          <option value="tourisme">{tr('Tourisme', 'Passenger')}</option>
                          <option value="utilitaire">{tr('Utilitaire ≥ 1T', 'Commercial ≥ 1T')}</option>
                          <option value="specialise">{tr('Spécialisé', 'Specialized')}</option>
                        </select>
                        {/* Lexique inline */}
                        <div className="text-[10px] text-gray-400 leading-tight">
                          {vclass === 'tourisme' && tr('Ex: Camry, RAV4, Model 3, Civic', 'Ex: Camry, RAV4, Model 3, Civic')}
                          {vclass === 'utilitaire' && tr('Ex: F-250, Ram 2500, Transit, Sprinter', 'Ex: F-250, Ram 2500, Transit, Sprinter')}
                          {vclass === 'specialise' && tr('Ex: nacelle, grue, excavateur, dumper', 'Ex: boom lift, crane, excavator, dumper')}
                        </div>
                        <div className={`text-[10px] leading-tight whitespace-nowrap ${sbNote.exempt ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : vclass === 'utilitaire' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                          {sbNote.note}
                        </div>
                        {vclass === 'tourisme' && (
                          <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer whitespace-nowrap">
                            <input type="checkbox" checked={r.is_sales_employee || false} onChange={e => upd(i, 'is_sales_employee', e.target.checked)} />
                            {tr('Vendeur autos', 'Auto dealer')}
                          </label>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Type moteur — A_achat / A_financement */}
                  {(isAchat || isFin) && (
                    <td className="px-2 py-1.5" data-label={tr('Moteur', 'Engine')}>
                      <select className={`${inp} w-40`} value={r.engine_type} onChange={e => upd(i, 'engine_type', e.target.value as any)}>
                        <option value="thermique">{tr('Thermique (Cat. 10/10.1)', 'ICE (Cl. 10/10.1)')}</option>
                        <option value="electrique">{tr('Électrique/hybride (Cat. 54)', 'EV/PHEV (Cl. 54)')}</option>
                      </select>
                    </td>
                  )}

                  {/* Prix achat — A_achat / A_financement */}
                  {(isAchat || isFin) && (
                    <td className="px-2 py-1.5 mc-stack" data-label={tr('Prix achat $', 'Purchase $')}>
                      <div className="space-y-0.5">
                        <input type="text" inputMode="decimal" className={`${inp} w-28`} value={r.purchase_price}
                          placeholder="45000" onChange={e => upd(i, 'purchase_price', e.target.value)}
                          onBlur={e => { const v = parseFloat(e.target.value.replace(/,/g, '.')); upd(i, 'purchase_price', isNaN(v) ? '' : v.toFixed(2)); }} />
                        {prixOk && vclass === 'specialise' && (
                          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {tr('Spécialisé — avantage DU non applicable', 'Specialized — SB N/A')}
                          </div>
                        )}
                        {dpa && (
                          <div className="leading-tight space-y-0.5">
                            <div className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                              DPA an 1 ≈ {dpa.an1.toLocaleString('fr-CA')} $ — {dpa.label}
                            </div>
                            {duAn != null && (
                              <div className={`text-[10px] font-semibold whitespace-nowrap ${vclass === 'utilitaire' ? 'text-amber-500 dark:text-amber-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {vclass === 'utilitaire'
                                  ? `DU max ≈ ${duAn.toLocaleString('fr-CA')} $ ${tr('(exempt si ≥ 90 % affaires)', '(exempt if ≥ 90% biz)')}`
                                  : `DU/an ≈ ${duAn.toLocaleString('fr-CA')} $ ${tr('(2 %/mois × 12)', '(2%/mo × 12)')}`}
                              </div>
                            )}
                            {/* Simulation réductions employé */}
                            {duAn != null && vclass === 'tourisme' && (
                              <details className="mt-0.5">
                                <summary className="text-[10px] text-blue-600 dark:text-blue-400 cursor-pointer font-semibold">
                                  {tr('▸ Réductions employé disponibles', '▸ Employee reductions available')}
                                </summary>
                                <div className="mt-1 rounded border border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 p-1.5 space-y-0.5 text-[10px] text-blue-800 dark:text-blue-200">
                                  <div className="font-semibold">{tr('Si usage affaires > 50 % :', 'If business use > 50%:')}</div>
                                  <div>① {tr('Droit usage réduit — proportionnel aux km perso (si < 1 667 /mois)', 'Reduced standby — proportional to personal km (if < 1,667/mo)')}</div>
                                  <div>② {tr('Méthode ½ — fonctionnement = min(0,34 $/km perso, DU × 50 %) — élection écrite avant 31 déc.', 'Half-method — operating = min($0.34/km, SB × 50%) — written election before Dec 31')}</div>
                                  <div>③ {tr('Remboursement employé — km perso × taux → déduit de l\'avantage (délai 45 j après fin d\'an)', 'Employee reimb. — personal km × rate → deducted from benefit (45 days after yr-end)')}</div>
                                  <div className="text-[9px] opacity-70">{tr('Combinées : réduction possible 50–70 % de l\'avantage brut', 'Combined: possible 50–70% reduction of gross benefit')}</div>
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                        {!prixOk && <div className="text-[10px] text-gray-400">{tr('→ DPA + DU calculés auto', '→ CCA + SB auto-computed')}</div>}
                      </div>
                    </td>
                  )}

                  {/* Bail mensuel — A_bail */}
                  {isBail && (
                    <td className="px-2 py-1.5 mc-stack" data-label={tr('Bail $/mois', 'Lease $/mo')}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <input type="text" inputMode="decimal" className={`${inp} w-24`} value={r.monthly_lease_cost}
                            placeholder="950" onChange={e => upd(i, 'monthly_lease_cost', e.target.value)}
                            onBlur={e => { const v = parseFloat(e.target.value.replace(/,/g, '.')); upd(i, 'monthly_lease_cost', isNaN(v) ? '' : v.toFixed(2)); }} />
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                        {bail && (
                          <div className="leading-tight space-y-0.5">
                            <div className={`text-[10px] font-semibold whitespace-nowrap ${bail.plafonné ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {tr('Déd.', 'Ded.')}: {bail.ded.toLocaleString('fr-CA')} $/mo
                              {bail.plafonné && <span className="ml-1 opacity-80">{tr('(plaf. 1 050 $)', '(cap $1,050)')}</span>}
                            </div>
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              ≈ {bail.annuel.toLocaleString('fr-CA')} $/an
                            </div>
                          </div>
                        )}
                        {!bail && <div className="text-[10px] text-gray-400">{tr('Plafond ARC: 1 050 $/mois', 'CRA cap: $1,050/mo')}</div>}
                      </div>
                    </td>
                  )}

                  {/* Intérêts — A_financement */}
                  {isFin && (
                    <td className="px-2 py-1.5 mc-stack" data-label={tr('Intérêts $/mois', 'Interest $/mo')}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <input type="text" inputMode="decimal" className={`${inp} w-24`} value={r.interest_monthly}
                            placeholder="280" onChange={e => upd(i, 'interest_monthly', e.target.value)}
                            onBlur={e => { const v = parseFloat(e.target.value.replace(/,/g, '.')); upd(i, 'interest_monthly', isNaN(v) ? '' : v.toFixed(2)); }} />
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                        {fin && (
                          <div className="leading-tight space-y-0.5">
                            <div className={`text-[10px] font-semibold whitespace-nowrap ${fin.plafonné ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {tr('Déd.', 'Ded.')}: {fin.ded.toLocaleString('fr-CA')} $/mo
                              {fin.plafonné && <span className="ml-1 opacity-80">{tr('(plaf. 300 $)', '(cap $300)')}</span>}
                            </div>
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              ≈ {fin.annuel.toLocaleString('fr-CA')} $/an
                            </div>
                          </div>
                        )}
                        {!fin && <div className="text-[10px] text-gray-400">{tr('Plafond ARC: 300 $/mois', 'CRA cap: $300/mo')}</div>}
                      </div>
                    </td>
                  )}

                  {/* Taux km — B_personnel */}
                  {isB && (
                    <td className="px-2 py-1.5 mc-stack" data-label={tr('Taux km $/km', 'Km rate $/km')}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.km_rate_override}
                            placeholder="0.73" onChange={e => upd(i, 'km_rate_override', e.target.value)}
                            onBlur={e => { const v = parseFloat(e.target.value.replace(/,/g, '.')); upd(i, 'km_rate_override', isNaN(v) ? '' : v.toFixed(2)); }} />
                          <span className="text-xs text-gray-400">/km</span>
                          <button type="button" onClick={() => upd(i, 'km_rate_override', '0.73')}
                            className="text-[10px] font-bold text-blue-500 hover:text-blue-700 dark:text-blue-400 transition" title="ARC 2026: 0,73 $/km">
                            ARC↺
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-400 whitespace-nowrap leading-tight">
                          {tr('≤5 000 km: 0,73 $ | +: 0,67 $', '≤5,000 km: $0.73 | +: $0.67')}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Km début année — tous sauf B */}
                  {!isB && (
                    <td className="px-2 py-1.5" data-label={tr('Km début an', 'Km year start')}>
                      <input type="number" min={0} step={1} className={`${inp} w-24`} value={r.km_at_year_start}
                        placeholder="0" onChange={e => upd(i, 'km_at_year_start', e.target.value)} />
                    </td>
                  )}

                  <td className="px-2 py-1.5" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                  <td className="px-2 py-1.5" data-label={tr('Photos', 'Photos')}>
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        title={tr('Ajouter une photo', 'Add photo')}>
                        📷 {r.photos?.length > 0 ? r.photos.length : '+'}
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadPhoto(file, tenant, supabase);
                            onPhotoUpload(i, url);
                          } catch { /* ignore */ }
                          e.target.value = '';
                        }} />
                      </label>
                      {r.photos?.[0] && (
                        <img src={r.photos[0]} alt="" className="h-7 w-7 rounded object-cover border border-gray-200" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={14} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucun véhicule dans ce régime.', 'No vehicle in this regime.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VehiculeSimulateur({ tr }: { tr: (f: string, e: string) => string }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [open, setOpen] = useState(false);
  const [simRegime, setSimRegime] = useState<'bail' | 'achat'>('bail');
  const [bailMensuel, setBailMensuel] = useState('800');
  const [prixAchat, setPrixAchat] = useState('35000');
  const [mois, setMois] = useState('12');
  const [kmPerso, setKmPerso] = useState('10000');
  const [kmAffaires, setKmAffaires] = useState('15000');
  const [isSales, setIsSales] = useState(false);
  const [useHalf, setUseHalf] = useState(true);
  const [txMarginale, setTxMarginale] = useState('43');

  const fmt = (n: number) => n.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' $';

  // Calcul d'un scénario unique (pour tableau de référence)
  function oneScenario(kp: number, ka: number, m: number, isSalesEmp: boolean, half: boolean) {
    const bizPct = (kp + ka) > 0 ? ka / (kp + ka) : 0;
    let sNormal: number;
    if (simRegime === 'bail') {
      const bail = Math.min(parseFloat(bailMensuel) || 0, ARC_2026.bail_cap);
      sNormal = Math.round(ARC_2026.standby_lease_frac * bail * m);
    } else {
      sNormal = Math.round(ARC_2026.standby_monthly * (parseFloat(prixAchat) || 0) * m);
    }
    const kmMax = ARC_2026.reduced_standby_km_30d * m;
    const eligible = bizPct > 0.5 && kp <= kmMax;
    const factor = eligible ? Math.min(kp / (ARC_2026.reduced_standby_km_annual * m / 12), 1) : 1;
    const sCharge = Math.round(sNormal * factor);
    const opRate = isSalesEmp ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
    const opStd = Math.round(kp * opRate);
    const opHalf = Math.round(sCharge * ARC_2026.half_method_fraction);
    const opFinal = (half && bizPct > 0.5) ? Math.min(opStd, opHalf) : opStd;
    const total = sCharge + opFinal;
    const tx = (parseFloat(txMarginale) || 43) / 100;
    return { bizPct, sNormal, sCharge, opFinal, total, impot: Math.round(total * tx), parPaie: Math.round(total * tx / 26), eligible };
  }

  const refScenarios = React.useMemo(() => {
    const m = Math.max(1, Math.min(12, parseInt(mois) || 12));
    return [
      { label: '0 % affaires',          kp: 25000, ka: 0 },
      { label: '30 % affaires',          kp: 17500, ka: 7500 },
      { label: '51 % affaires ★',        kp: 12250, ka: 12750 },
      { label: '60 % affaires',          kp: 10000, ka: 15000 },
      { label: '80 % affaires',          kp: 5000,  ka: 20000 },
      { label: '95 % affaires',          kp: 1250,  ka: 23750 },
      { label: '100 % affaires',         kp: 0,     ka: 25000 },
    ].map(s => ({ ...s, ...oneScenario(s.kp, s.ka, m, isSales, useHalf) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRegime, bailMensuel, prixAchat, mois, isSales, useHalf, txMarginale]);

  const calc = React.useMemo(() => {
    const m = Math.max(1, Math.min(12, parseInt(mois) || 12));
    const kp = Math.max(0, parseInt(kmPerso) || 0);
    const ka = Math.max(0, parseInt(kmAffaires) || 0);
    const totalKm = kp + ka;
    const bizPct = totalKm > 0 ? ka / totalKm : 0;

    // --- Standby ---
    let standbyNormal: number;
    let standbyLabel: string;
    if (simRegime === 'bail') {
      const bail = parseFloat(bailMensuel) || 0;
      const bailDed = Math.min(bail, ARC_2026.bail_cap);
      standbyNormal = Math.round(ARC_2026.standby_lease_frac * bailDed * m);
      standbyLabel = `2/3 × min(${bail.toLocaleString('fr-CA')} $, ${ARC_2026.bail_cap.toLocaleString('fr-CA')} $) × ${m} mois`;
    } else {
      const prix = parseFloat(prixAchat) || 0;
      standbyNormal = Math.round(ARC_2026.standby_monthly * prix * m);
      standbyLabel = `2 % × ${prix.toLocaleString('fr-CA')} $ × ${m} mois`;
    }

    // --- Droit d'usage réduit ---
    const kmPersoMax = ARC_2026.reduced_standby_km_30d * m;
    const eligibleReduit = bizPct > 0.5 && kp <= kmPersoMax;
    const facteurReduction = eligibleReduit ? Math.min(kp / (ARC_2026.reduced_standby_km_annual * m / 12), 1) : 1;
    const standbyReduit = Math.round(standbyNormal * facteurReduction);

    // --- Fonctionnement ---
    const opRate = isSales ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
    const opStandard = Math.round(kp * opRate);
    const opDemiMethode = Math.round(standbyReduit * ARC_2026.half_method_fraction);
    const eligibleDemi = bizPct > 0.5;
    const opFinal = (useHalf && eligibleDemi) ? Math.min(opStandard, opDemiMethode) : opStandard;

    // --- Totaux ---
    const totalBrut = standbyNormal + opStandard;
    const totalReduit = standbyReduit + opFinal;
    const economie = totalBrut - totalReduit;
    const tx = (parseFloat(txMarginale) || 43) / 100;
    const coutImpot = Math.round(totalReduit * tx);
    const coutImpotBrut = Math.round(totalBrut * tx);

    return {
      m, kp, ka, bizPct, standbyNormal, standbyLabel, standbyReduit, facteurReduction,
      eligibleReduit, kmPersoMax, opStandard, opDemiMethode, eligibleDemi, opFinal,
      totalBrut, totalReduit, economie, coutImpot, coutImpotBrut, opRate,
    };
  }, [simRegime, bailMensuel, prixAchat, mois, kmPerso, kmAffaires, isSales, useHalf, txMarginale]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-violet-500" />
          <span className="font-bold text-sm">{tr('Simulateur d\'avantage imposable véhicule', 'Vehicle taxable benefit simulator')}</span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            {tr('ARC 2026', 'CRA 2026')}
          </span>
        </div>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 dark:border-gray-700 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* ── Entrées ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{tr('Paramètres', 'Parameters')}</h3>

              {/* Régime */}
              <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50">
                {[{ k: 'bail', l: tr('Véhicule loué', 'Leased') }, { k: 'achat', l: tr('Véhicule acheté', 'Purchased') }].map(x => (
                  <button key={x.k} onClick={() => setSimRegime(x.k as any)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${simRegime === x.k ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}>
                    {x.l}
                  </button>
                ))}
              </div>

              {simRegime === 'bail' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Coût bail mensuel $', 'Monthly lease cost $')}</label>
                  <input type="text" inputMode="decimal" className={inp} value={bailMensuel} onChange={e => setBailMensuel(e.target.value)} placeholder="800" />
                  <p className="mt-0.5 text-[10px] text-gray-400">{tr(`Plafond ARC 2026 : ${ARC_2026.bail_cap.toLocaleString('fr-CA')} $/mois`, `CRA 2026 cap: $${ARC_2026.bail_cap.toLocaleString('en-CA')}/mo`)}</p>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Prix d\'achat $', 'Purchase price $')}</label>
                  <input type="text" inputMode="decimal" className={inp} value={prixAchat} onChange={e => setPrixAchat(e.target.value)} placeholder="35000" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Mois dispos', 'Months avail.')}</label>
                  <input type="number" min={1} max={12} className={inp} value={mois} onChange={e => setMois(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Km perso/an', 'Personal km/yr')}</label>
                  <input type="text" inputMode="decimal" className={inp} value={kmPerso} onChange={e => setKmPerso(e.target.value)} placeholder="10000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Km affaires/an', 'Business km/yr')}</label>
                  <input type="text" inputMode="decimal" className={inp} value={kmAffaires} onChange={e => setKmAffaires(e.target.value)} placeholder="15000" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={isSales} onChange={e => setIsSales(e.target.checked)} />
                  {tr('Vendeur d\'autos (0,31 $/km)', 'Auto dealer (0.31/km)')}
                </label>
                <label className={`flex items-center gap-2 text-xs cursor-pointer ${!calc.eligibleDemi ? 'opacity-40' : ''}`}>
                  <input type="checkbox" checked={useHalf} onChange={e => setUseHalf(e.target.checked)} disabled={!calc.eligibleDemi} />
                  {tr('Méthode ½ (si éligible)', 'Half-method (if eligible)')}
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Taux marginal imposition %', 'Marginal tax rate %')}</label>
                <input type="number" min={0} max={70} className={inp} value={txMarginale} onChange={e => setTxMarginale(e.target.value)} placeholder="43" />
                <p className="mt-0.5 text-[10px] text-gray-400">{tr('Taux combiné fédéral + provincial estimé', 'Estimated combined federal + provincial rate')}</p>
              </div>
            </div>

            {/* ── Résultats ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{tr('Calcul ARC 2026', 'CRA 2026 Calculation')}</h3>

              {/* Usage affaires */}
              <div className={`rounded-xl border px-3 py-2 text-xs ${calc.bizPct > 0.5 ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'}`}>
                {tr('Usage affaires', 'Business use')}: <strong>{(calc.bizPct * 100).toFixed(0)} %</strong>
                {calc.bizPct > 0.5
                  ? tr(' ✓ > 50 % — réductions applicables', ' ✓ > 50% — reductions available')
                  : tr(' ✗ ≤ 50 % — aucune réduction', ' ✗ ≤ 50% — no reduction')}
              </div>

              {/* Droit d'usage */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30 px-3 py-2 space-y-1 text-xs">
                <div className="font-semibold text-gray-700 dark:text-gray-200">{tr('Droit d\'usage (standby charge)', 'Standby charge')}</div>
                <div className="text-gray-500 font-mono text-[10px]">{calc.standbyLabel} = {fmt(calc.standbyNormal)}</div>
                {calc.eligibleReduit ? (
                  <div className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    {tr('Réduit', 'Reduced')}: {fmt(calc.standbyNormal)} × ({calc.kp.toLocaleString('fr-CA')} / {calc.kmPersoMax.toLocaleString('fr-CA')}) = <span className="text-base">{fmt(calc.standbyReduit)}</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-[10px]">
                    {calc.bizPct <= 0.5
                      ? tr('Réduction N/A — affaires ≤ 50 %', 'Reduction N/A — business ≤ 50%')
                      : tr(`Réduction N/A — km perso (${calc.kp.toLocaleString('fr-CA')}) > seuil (${calc.kmPersoMax.toLocaleString('fr-CA')})`, `Reduction N/A — personal km (${calc.kp.toLocaleString('fr-CA')}) > threshold (${calc.kmPersoMax.toLocaleString('fr-CA')})`)}
                  </div>
                )}
              </div>

              {/* Avantage fonctionnement */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/30 px-3 py-2 space-y-1 text-xs">
                <div className="font-semibold text-gray-700 dark:text-gray-200">{tr('Avantage fonctionnement', 'Operating benefit')}</div>
                <div className="text-gray-500 font-mono text-[10px]">{tr('Standard', 'Standard')}: {calc.kp.toLocaleString('fr-CA')} km × {calc.opRate.toFixed(2)} $ = {fmt(calc.opStandard)}</div>
                {calc.eligibleDemi && (
                  <div className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                    {tr('Méthode ½', 'Half-method')}: {fmt(calc.standbyReduit)} × 50 % = {fmt(calc.opDemiMethode)}
                  </div>
                )}
                <div className={`font-semibold ${useHalf && calc.eligibleDemi && calc.opDemiMethode < calc.opStandard ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {tr('Retenu', 'Used')}: <span className="text-base">{fmt(calc.opFinal)}</span>
                  {useHalf && calc.eligibleDemi && calc.opDemiMethode < calc.opStandard && tr(' (méthode ½ plus avantageuse)', ' (half-method more favorable)')}
                </div>
              </div>

              {/* Totaux */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{tr('Avantage brut (sans réduction)', 'Gross benefit (no reduction)')}</span>
                  <span className="line-through">{fmt(calc.totalBrut)}</span>
                </div>
                {calc.economie > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{tr('Économie par réductions', 'Savings from reductions')}</span>
                    <span>− {fmt(calc.economie)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-100 dark:border-gray-700 pt-2">
                  <span>{tr('Avantage imposable net', 'Net taxable benefit')}</span>
                  <span className="text-violet-700 dark:text-violet-300">{fmt(calc.totalReduit)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-600 dark:text-red-400 font-semibold">
                  <span>{tr('Coût réel en impôt', 'Actual tax cost')} ({txMarginale} %)</span>
                  <span>≈ {fmt(calc.coutImpot)} / an</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{tr('Soit par paie (26×)', 'Per pay (26×)')}</span>
                  <span>≈ {fmt(Math.round(calc.coutImpot / 26))} / paie</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400">{tr('⚠️ Estimation uniquement — à valider par votre comptable. Taux ARC 2026.', '⚠️ Estimate only — validate with your accountant. CRA 2026 rates.')}</p>
            </div>
          </div>

          {/* ── Tableaux de référence par type ── */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {tr('Tableaux de référence ARC 2026 — 25 000 km/an total', 'CRA 2026 Reference Tables — 25,000 km/yr total')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">

              {/* Table 1 — Bail 800$/mois */}
              {(() => {
                const bail = 800; const m = 12; const tx = 0.43;
                const sNorm = Math.round(ARC_2026.standby_lease_frac * Math.min(bail, ARC_2026.bail_cap) * m);
                const kmMax = ARC_2026.reduced_standby_km_30d * m;
                const rows = [
                  { pct:'0 %',   kp:25000, ka:0 },
                  { pct:'30 %',  kp:17500, ka:7500 },
                  { pct:'51 % ★', kp:12250, ka:12750 },
                  { pct:'60 %',  kp:10000, ka:15000 },
                  { pct:'80 %',  kp:5000,  ka:20000 },
                  { pct:'95 %',  kp:1250,  ka:23750 },
                  { pct:'100 %', kp:0,     ka:25000 },
                ].map(r => {
                  const biz = r.ka / (r.kp + r.ka);
                  const elig = biz > 0.5 && r.kp <= kmMax;
                  const sc = elig ? Math.round(sNorm * r.kp / (ARC_2026.reduced_standby_km_annual * m / 12)) : sNorm;
                  const op = elig ? Math.min(Math.round(r.kp * ARC_2026.operating_per_km), Math.round(sc * 0.5)) : Math.round(r.kp * ARC_2026.operating_per_km);
                  const total = sc + op; const impot = Math.round(total * tx);
                  return { ...r, total, impot, parPaie: Math.round(impot / 26), elig };
                });
                return (
                  <div className="overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/30">
                    <div className="bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                      {tr('Régime A — Bail', 'Regime A — Lease')} · {tr('800 $/mois · 12 mois · taux 43 %', '$800/mo · 12 mo · 43% tax')}
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        <th className="px-2 py-1.5 text-left">{tr('% affaires', '% business')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Km perso', 'Personal km')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Avantage', 'Benefit')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Impôt/an', 'Tax/yr')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('/paie', '/pay')}</th>
                      </tr></thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.pct} className={`border-t border-blue-100 dark:border-blue-500/20 ${r.pct.includes('★') ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : ''} ${r.kp === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                            <td className="px-2 py-1 whitespace-nowrap">{r.pct} {r.elig ? '✓' : r.ka === 0 ? '' : '✗'}</td>
                            <td className="px-2 py-1 text-right text-gray-600 dark:text-gray-300">{r.kp.toLocaleString('fr-CA')}</td>
                            <td className="px-2 py-1 text-right">{r.total > 0 ? r.total.toLocaleString('fr-CA') + ' $' : <span className="text-emerald-600 font-bold">0 $</span>}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.impot > 0 ? r.impot.toLocaleString('fr-CA') + ' $' : '—'}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.parPaie > 0 ? r.parPaie.toLocaleString('fr-CA') + ' $' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-[10px] text-blue-700 dark:text-blue-300">
                      ★ = {tr('seuil 50 % — réductions activées | ✓ = droit d\'usage réduit + méthode ½', '50% threshold — reductions activated | ✓ = reduced standby + half-method')}
                    </div>
                  </div>
                );
              })()}

              {/* Table 2 — Acheté 35 000$ */}
              {(() => {
                const prix = 35000; const m = 12; const tx = 0.43;
                const sNorm = Math.round(ARC_2026.standby_monthly * prix * m);
                const kmMax = ARC_2026.reduced_standby_km_30d * m;
                const dpa = Math.round(Math.min(prix, ARC_2026.cca10_cap) * ARC_2026.cca10_rate * 0.5);
                const rows = [
                  { pct:'0 %',   kp:25000, ka:0 },
                  { pct:'30 %',  kp:17500, ka:7500 },
                  { pct:'51 % ★', kp:12250, ka:12750 },
                  { pct:'60 %',  kp:10000, ka:15000 },
                  { pct:'80 %',  kp:5000,  ka:20000 },
                  { pct:'95 %',  kp:1250,  ka:23750 },
                  { pct:'100 %', kp:0,     ka:25000 },
                ].map(r => {
                  const biz = r.ka / (r.kp + r.ka);
                  const elig = biz > 0.5 && r.kp <= kmMax;
                  const sc = elig ? Math.round(sNorm * r.kp / (ARC_2026.reduced_standby_km_annual * m / 12)) : sNorm;
                  const op = elig ? Math.min(Math.round(r.kp * ARC_2026.operating_per_km), Math.round(sc * 0.5)) : Math.round(r.kp * ARC_2026.operating_per_km);
                  const total = sc + op; const impot = Math.round(total * tx);
                  return { ...r, total, impot, parPaie: Math.round(impot / 26), elig };
                });
                return (
                  <div className="overflow-hidden rounded-xl border border-violet-200 dark:border-violet-500/30">
                    <div className="bg-violet-600 px-3 py-2 text-xs font-bold text-white">
                      {tr('Régime A — Acheté', 'Regime A — Purchased')} · {tr('35 000 $ · 12 mois · DPA Cat. 10', '$35,000 · 12 mo · CCA Cl. 10')}
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300">
                        <th className="px-2 py-1.5 text-left">{tr('% affaires', '% business')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Km perso', 'Personal km')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Avantage', 'Benefit')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Impôt/an', 'Tax/yr')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('/paie', '/pay')}</th>
                      </tr></thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.pct} className={`border-t border-violet-100 dark:border-violet-500/20 ${r.pct.includes('★') ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : ''} ${r.kp === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                            <td className="px-2 py-1 whitespace-nowrap">{r.pct} {r.elig ? '✓' : r.ka === 0 ? '' : '✗'}</td>
                            <td className="px-2 py-1 text-right text-gray-600 dark:text-gray-300">{r.kp.toLocaleString('fr-CA')}</td>
                            <td className="px-2 py-1 text-right">{r.total > 0 ? r.total.toLocaleString('fr-CA') + ' $' : <span className="text-emerald-600 font-bold">0 $</span>}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.impot > 0 ? r.impot.toLocaleString('fr-CA') + ' $' : '—'}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.parPaie > 0 ? r.parPaie.toLocaleString('fr-CA') + ' $' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-violet-50 dark:bg-violet-500/10 px-3 py-1.5 text-[10px] text-violet-700 dark:text-violet-300">
                      {tr(`DPA an 1 : ${dpa.toLocaleString('fr-CA')} $ (Cat. 10 — 15 % règle ½-année)`, `CCA yr 1: $${dpa.toLocaleString('en-CA')} (Cl. 10 — 15% half-yr rule)`)}
                    </div>
                  </div>
                );
              })()}

              {/* Table 3 — Financement 35 000$, 280$/mois intérêts */}
              {(() => {
                const prix = 35000; const m = 12; const tx = 0.43; const intMo = 280;
                const sNorm = Math.round(ARC_2026.standby_monthly * prix * m);
                const kmMax = ARC_2026.reduced_standby_km_30d * m;
                const intDed = Math.min(intMo, ARC_2026.interest_cap);
                const intAn = intDed * m;
                const rows = [
                  { pct:'0 %',   kp:25000, ka:0 },
                  { pct:'51 % ★', kp:12250, ka:12750 },
                  { pct:'60 %',  kp:10000, ka:15000 },
                  { pct:'80 %',  kp:5000,  ka:20000 },
                  { pct:'100 %', kp:0,     ka:25000 },
                ].map(r => {
                  const biz = r.ka / (r.kp + r.ka);
                  const elig = biz > 0.5 && r.kp <= kmMax;
                  const sc = elig ? Math.round(sNorm * r.kp / (ARC_2026.reduced_standby_km_annual * m / 12)) : sNorm;
                  const op = elig ? Math.min(Math.round(r.kp * ARC_2026.operating_per_km), Math.round(sc * 0.5)) : Math.round(r.kp * ARC_2026.operating_per_km);
                  const total = sc + op; const impot = Math.round(total * tx);
                  return { ...r, total, impot, parPaie: Math.round(impot / 26), elig };
                });
                return (
                  <div className="overflow-hidden rounded-xl border border-sky-200 dark:border-sky-500/30">
                    <div className="bg-sky-600 px-3 py-2 text-xs font-bold text-white">
                      {tr('Régime A — Financement', 'Regime A — Financed')} · {tr('35 000 $ · intérêts 280 $/mois', '$35,000 · interest $280/mo')}
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        <th className="px-2 py-1.5 text-left">{tr('% affaires', '% business')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Km perso', 'Personal km')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Avantage', 'Benefit')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Impôt/an', 'Tax/yr')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('/paie', '/pay')}</th>
                      </tr></thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.pct} className={`border-t border-sky-100 dark:border-sky-500/20 ${r.pct.includes('★') ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : ''} ${r.kp === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                            <td className="px-2 py-1 whitespace-nowrap">{r.pct} {r.elig ? '✓' : r.ka === 0 ? '' : '✗'}</td>
                            <td className="px-2 py-1 text-right text-gray-600 dark:text-gray-300">{r.kp.toLocaleString('fr-CA')}</td>
                            <td className="px-2 py-1 text-right">{r.total > 0 ? r.total.toLocaleString('fr-CA') + ' $' : <span className="text-emerald-600 font-bold">0 $</span>}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.impot > 0 ? r.impot.toLocaleString('fr-CA') + ' $' : '—'}</td>
                            <td className="px-2 py-1 text-right text-red-600 dark:text-red-400">{r.parPaie > 0 ? r.parPaie.toLocaleString('fr-CA') + ' $' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-sky-50 dark:bg-sky-500/10 px-3 py-1.5 text-[10px] text-sky-700 dark:text-sky-300">
                      {tr(`Intérêts déductibles : ${intDed} $/mois → ${intAn.toLocaleString('fr-CA')} $/an (plafond ARC: ${ARC_2026.interest_cap} $/mois)`, `Deductible interest: $${intDed}/mo → $${intAn.toLocaleString('en-CA')}/yr (CRA cap: $${ARC_2026.interest_cap}/mo)`)}
                    </div>
                  </div>
                );
              })()}

              {/* Table 4 — Régime B Personnel */}
              {(() => {
                const tx = 0.43;
                const rows = [2000, 5000, 8000, 12000, 15000, 20000, 25000].map(ka => {
                  const t1 = Math.min(ka, ARC_2026.km_t1_threshold) * ARC_2026.km_t1_rate;
                  const t2 = Math.max(0, ka - ARC_2026.km_t1_threshold) * ARC_2026.km_t2_rate;
                  const remb = Math.round(t1 + t2);
                  return { ka, remb, parMois: Math.round(remb / 12) };
                });
                return (
                  <div className="overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                    <div className="bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                      {tr('Régime B — Véhicule personnel', 'Regime B — Personal vehicle')} · {tr('Taux ARC 2026 : 0,73 $ / 0,67 $', 'CRA 2026: $0.73 / $0.67')}
                    </div>
                    <table className="w-full text-xs">
                      <thead><tr className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <th className="px-2 py-1.5 text-left">{tr('Km affaires/an', 'Business km/yr')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Remboursement', 'Reimbursement')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('/mois', '/month')}</th>
                        <th className="px-2 py-1.5 text-right">{tr('Imposable ?', 'Taxable?')}</th>
                      </tr></thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.ka} className={`border-t border-emerald-100 dark:border-emerald-500/20 ${r.ka === 5000 ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : ''}`}>
                            <td className="px-2 py-1">{r.ka.toLocaleString('fr-CA')} km{r.ka === 5000 ? ' ★' : ''}</td>
                            <td className="px-2 py-1 text-right font-semibold text-emerald-700 dark:text-emerald-300">{r.remb.toLocaleString('fr-CA')} $</td>
                            <td className="px-2 py-1 text-right text-gray-500">{r.parMois.toLocaleString('fr-CA')} $</td>
                            <td className="px-2 py-1 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{tr('Non ✓', 'No ✓')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                      ★ {tr('Seuil palier 2 : au-delà de 5 000 km, taux passe à 0,67 $/km. Non imposable si ≤ taux ARC et basé sur km seulement.', 'Tier 2 threshold: beyond 5,000 km, rate drops to $0.67/km. Non-taxable if ≤ CRA rate and km-based only.')}
                    </div>
                  </div>
                );
              })()}

            </div>
            <p className="text-[10px] text-gray-400">
              ⚠️ {tr('Hypothèses tableaux : taux marginal 43 %, méthode ½ activée si éligible, 25 000 km/an total (Régimes A). Taux ARC 2026 officiels. À valider par votre comptable.', 'Table assumptions: 43% marginal rate, half-method if eligible, 25,000 km/yr total (Regime A). Official CRA 2026 rates. Validate with your accountant.')}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

function Vehicules({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<VRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [personnelSuggestions, setPersonnelSuggestions] = useState<string[]>([]);
  const [tenantUsers, setTenantUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [activeRegime, setActiveRegime] = useState<VRegime>('A_achat');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const REGIMES: { k: VRegime; label: string; desc: string; color: string; bg: string }[] = [
    { k: 'A_achat',       label: tr('Régime A — Acheté',      'Regime A — Purchased'), desc: tr('Véhicule acheté par l\'employeur. DPA Cat. 10/10.1 (thermique, 30 %/an) ou Cat. 54 (ZEV, 100 % an 1). Avantage imposable : droit d\'usage 2 %/mois + fonctionnement 0,34 $/km perso.', 'Employer-purchased vehicle. CCA Class 10/10.1 (ICE, 30%/yr) or Class 54 (EV, 100% yr 1). Taxable benefit: standby 2%/mo + operating 0.34/km personal.'), color: 'bg-violet-600', bg: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200' },
    { k: 'A_bail',        label: tr('Régime A — Bail',         'Regime A — Lease'),     desc: tr('Véhicule loué par l\'employeur. Bail déductible plafonné à 1 050 $/mois (ARC 2026). Avantage : 2/3 du coût mensuel × mois disponibles.', 'Employer-leased vehicle. Deductible lease capped at $1,050/mo (CRA 2026). Benefit: 2/3 of monthly cost × available months.'), color: 'bg-blue-600', bg: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200' },
    { k: 'A_financement', label: tr('Régime A — Financement',  'Regime A — Financed'),  desc: tr('Véhicule financé par l\'employeur. Intérêts déductibles plafonnés à 300 $/mois (ARC 2026). Avantage droit d\'usage calculé sur le prix d\'achat.', 'Employer-financed vehicle. Deductible interest capped at $300/mo (CRA 2026). Standby benefit calculated on purchase price.'), color: 'bg-sky-600', bg: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200' },
    { k: 'B_personnel',   label: tr('Régime B — Personnel',    'Regime B — Personal'),  desc: tr('Employé utilise son propre véhicule. Remboursement non imposable si ≤ taux ARC (0,73 $/km ≤ 5 000 km; 0,67 $/km au-delà). Aucun avantage imposable si conforme.', 'Employee uses own vehicle. Non-taxable reimbursement if ≤ CRA rate ($0.73/km ≤ 5,000 km; $0.67/km beyond). No taxable benefit if compliant.'), color: 'bg-emerald-600', bg: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' },
  ];

  useEffect(() => {
    supabase.from('planner_personnel').select('id, name, email').eq('tenant_id', tenant).eq('is_active', true).order('name')
      .then(({ data: personnel }) => {
        const list = (personnel || []).map((p: any) => ({ id: p.id, name: p.name?.trim() || '', email: p.email || '' })).filter(p => p.name);
        setPersonnelSuggestions(list.map(p => p.name));
        setTenantUsers(list);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.from('vehicles').select('*').eq('tenant_id', tenant).order('unit_number', { nullsFirst: false });
    if (error) {
      setNotice(tr('Erreur chargement : ', 'Load error: ') + error.message);
      if (!silent) setLoading(false);
      return;
    }
    setRows((data || []).map((v: any) => {
      return {
        ...v,
        regime: (v.regime || 'A_achat') as VRegime,
        vehicle_class: (v.vehicle_class || 'tourisme') as VClass,
        is_sales_employee: v.is_sales_employee || false,
        engine_type: v.engine_type || 'thermique',
        unit_number: v.unit_number || '', year: String(v.year || ''), assigned_to: v.assigned_to || '',
        km_rate_override:   v.km_rate_override    != null ? String(v.km_rate_override)    : '',
        purchase_price:     v.purchase_price      != null ? String(v.purchase_price)      : '',
        monthly_lease_cost: v.monthly_lease_cost  != null ? String(v.monthly_lease_cost)  : '',
        interest_monthly:   v.interest_monthly    != null ? String(v.interest_monthly)    : '',
        km_at_year_start:   v.km_at_year_start    != null ? String(v.km_at_year_start)    : '',
        photos: Array.isArray(v.photos) ? v.photos : [],
      };
    }));
    if (!silent) setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof VRow, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  function addVehicle(regime: VRegime) {
    setRows(p => [...p, {
      regime, vehicle_class: 'tourisme', is_sales_employee: false,
      unit_number: '', make: '', model: '', year: '', plate: '',
      employee_name: '', assigned_to: '', engine_type: 'thermique',
      km_rate_override: regime === 'B_personnel' ? '0.73' : '',
      purchase_price: '', monthly_lease_cost: '', interest_monthly: '',
      km_at_year_start: '', active: true, notes: '', photos: [],
    }]);
  }

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.unit_number?.trim() && !r.make?.trim() && !r.plate?.trim()) continue;
        const payload: any = {
          tenant_id: tenant, regime: r.regime,
          vehicle_class: r.vehicle_class || 'tourisme',
          is_sales_employee: r.is_sales_employee || false,
          unit_number: r.unit_number || '',
          make: r.make || '', model: r.model || '',
          year: r.year ? Number(r.year) : null,
          plate: r.plate || '', employee_name: r.employee_name || '',
          assigned_to: r.assigned_to || null, engine_type: r.engine_type || 'thermique',
          km_rate_override:   r.km_rate_override   !== '' ? Number(r.km_rate_override)                              : null,
          purchase_price:     r.purchase_price     !== '' ? parseFloat(r.purchase_price.replace(/,/g, '.'))         : null,
          monthly_lease_cost: r.monthly_lease_cost !== '' ? parseFloat(r.monthly_lease_cost.replace(/,/g, '.'))    : null,
          interest_monthly:   r.interest_monthly   !== '' ? parseFloat(r.interest_monthly.replace(/,/g, '.'))      : null,
          km_at_year_start: r.km_at_year_start !== '' ? Number(r.km_at_year_start) : 0,
          km_year_start_year: new Date().getFullYear(),
          active: r.active, notes: r.notes || '',
          photos: r.photos || [],
        };
        let vehicleId = r.id;
        if (r.id) {
          const { error } = await supabase.from('vehicles').update(payload).eq('id', r.id);
          if (error) throw error;
        } else {
          const { data: ins, error } = await supabase.from('vehicles').insert(payload).select('id').single();
          if (error) throw error;
          vehicleId = ins.id;
        }
        // Sync vers module inspection (equipment)
        const vName = [r.unit_number, r.make, r.model, r.year].filter(Boolean).join(' ').trim() || 'Véhicule';
        const equipSync: any = {
          tenant_id: tenant, vehicle_id: vehicleId,
          equipment_type: 'vehicle', equipment_name: vName,
          equipment_serial: r.plate || r.unit_number || '',
          equipment_location: r.employee_name || '',
          notes: `Régime: ${r.regime}`,
          equipment_photos: r.photos || [],
        };
        const { data: exEq } = await supabase.from('equipment').select('id').eq('vehicle_id', vehicleId).maybeSingle();
        if (exEq?.id) await supabase.from('equipment').update(equipSync).eq('id', exEq.id);
        else await supabase.from('equipment').insert(equipSync);

        // Sync vers planificateur (planner_equipements)
        const plannerSync: any = {
          tenant_id: tenant, vehicle_id: vehicleId,
          name: vName, type: 'Véhicule',
          serial_number: r.plate || r.unit_number || '',
          is_active: r.active,
        };
        const { data: exPl } = await supabase.from('planner_equipements').select('id').eq('vehicle_id', vehicleId).maybeSingle();
        if (exPl?.id) await supabase.from('planner_equipements').update(plannerSync).eq('id', exPl.id);
        else await supabase.from('planner_equipements').insert(plannerSync);
      }
      setNotice(tr('Véhicules enregistrés ✓', 'Vehicles saved ✓'));
      load(true);
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || e?.details || 'Erreur BD')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('vehicles').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const activeInfo  = REGIMES.find(r => r.k === activeRegime)!;
  const regimeRows  = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.regime === activeRegime);

  return (
    <div className="space-y-4">
      {/* Sélecteur de régime */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {REGIMES.map(reg => (
            <button key={reg.k} onClick={() => setActiveRegime(reg.k)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeRegime === reg.k ? `${reg.color} text-white shadow-sm` : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}>
              {reg.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${activeRegime === reg.k ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                {rows.filter(r => r.regime === reg.k).length}
              </span>
            </button>
          ))}
        </div>
        <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${activeInfo.bg}`}>
          {activeInfo.desc}
          <span className="ml-2 text-xs font-semibold opacity-60">⚠️ {tr('Estimation — à valider par votre comptable', 'Estimate — validate with your accountant')}</span>
        </div>
      </div>

      {/* Barre save + notice */}
      <div className="flex items-center justify-between">
        {notice
          ? <span className={`text-sm font-semibold ${notice.includes('✓') ? 'text-emerald-600' : 'text-red-600'}`}>{notice}</span>
          : <span />}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
        </button>
      </div>

      {/* Simulateur d'avantage imposable */}
      <VehiculeSimulateur tr={tr} />

      {/* Tableau du régime actif */}
      <VehicleTable
        regime={activeRegime} label={activeInfo.label}
        items={regimeRows} onAdd={() => addVehicle(activeRegime)}
        upd={upd} del={del} tr={tr} inp={inp}
        personnelSuggestions={personnelSuggestions}
        tenantUsers={tenantUsers}
        tenant={tenant}
        onPhotoUpload={(i, url) => upd(i, 'photos', [...(rows[i]?.photos || []), url])}
      />
    </div>
  );
}

// ============================================================
// RESSOURCES PLANNER
// ============================================================

function Ressources({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string; initialSubTab?: 'equipements' | 'postes' }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tr('Équipements utilisés par le planificateur. Les postes/rôles se gèrent dans l\'onglet Employés.', 'Equipment used by the planner. Positions/roles are managed in the Employees tab.')}
      </p>
      <EquipementsPlanner tenant={tenant} tr={tr} inp={inp} />
    </div>
  );
}

// ============================================================
// EMPLOYÉS — PersonnelPlanner avec liens vers modules
// ============================================================

// ─── Générateur mot de passe : 5 lettres (prénom/nom) + 3 chiffres + 2 spéciaux ───
function generatePassword(fullName: string): string {
  const specials = ['@', '#', '$', '!', '%', '&', '?', '*', '+', '='];
  const clean = (fullName || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  let letters = '';
  if (parts.length >= 2) {
    const first = parts[0];
    const last  = parts[parts.length - 1];
    letters = (first[0]?.toUpperCase() || 'X') + (first.slice(1, 3).toLowerCase() || 'xx').padEnd(2, 'x') + (last[0]?.toUpperCase() || 'X') + (last[1]?.toLowerCase() || 'x');
  } else {
    const w = parts[0] || 'User';
    letters = (w[0]?.toUpperCase() || 'X') + (w.slice(1, 5).toLowerCase() || 'xxxx').padEnd(4, 'x');
  }
  letters = letters.slice(0, 5);
  const digits = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  const sp1 = specials[Math.floor(Math.random() * specials.length)];
  let sp2 = specials[Math.floor(Math.random() * specials.length)];
  while (sp2 === sp1) sp2 = specials[Math.floor(Math.random() * specials.length)];
  return `${letters}${digits}${sp1}${sp2}`;
}

function suggestEmail(fullName: string, tenant: string): string {
  const clean = (fullName || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const local = parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0];
  return `${local}@${tenant}.ca`;
}

function ComptesAcces({ tenant, tr, canReveal }: { tenant: string; tr: (f: string, e: string) => string; canReveal: boolean }) {
  type Personnel = { id: string; name: string; email: string; niveauAcces?: string; access_password?: string };
  type UserAccount = { id: string; email: string; name: string; role: string; is_active: boolean };
  const inp2 = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [users, setUsers]         = useState<UserAccount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Personnel | null>(null);
  const [form, setForm]           = useState({ email: '', name: '', role: 'user', password: '' });
  const [busy, setBusy]           = useState(false);
  const [notice, setNotice]       = useState<string | null>(null);
  const [showPwd, setShowPwd]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [showPwdFor, setShowPwdFor] = useState<string | null>(null); // ligne dont le mot de passe est révélé

  async function load() {
    setLoading(true);
    // Tente avec access_password (migration 079) ; repli sans si la colonne n'existe pas
    let pers: any[] | null = null;
    const r1 = await supabase.from('planner_personnel').select('id, name, email, niveauAcces, access_password').eq('tenant_id', tenant).order('name');
    if (r1.error) {
      const r2 = await supabase.from('planner_personnel').select('id, name, email, niveauAcces').eq('tenant_id', tenant).order('name');
      pers = r2.data;
    } else pers = r1.data;
    const usersRes = await fetch(`/api/admin/users?tenant=${tenant}`).then(r => r.json()).catch(() => ({ users: [] }));
    setPersonnel((pers || []).filter((p: any) => p.name));
    setUsers(usersRes?.users || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function pickPersonnel(p: Personnel) {
    if (selected?.id === p.id) return; // déjà sélectionné : ne PAS régénérer le mot de passe
    setSelected(p); setNotice(null); setCopied(false);
    const niveauToRole: Record<string, string> = {
      super_user: 'super_admin', direction: 'client_admin',
      rh: 'client_admin', admin_paie: 'client_admin',
      administration: 'client_admin', coordination: 'client_admin',
      modification: 'user', consultation: 'user',
    };
    const existing = users.find(u => (u.email || '').toLowerCase() === (p.email || '').toLowerCase());
    setForm({
      email:    p.email || suggestEmail(p.name, tenant),
      name:     p.name,
      role:     niveauToRole[p.niveauAcces || ''] || 'user',
      // Compte EXISTANT : ne jamais régénérer (garde le mot de passe stocké, sinon vide
      // pour ne pas écraser l'accès). Nouveau compte seulement : génère une proposition.
      password: p.access_password || (existing ? '' : generatePassword(p.name)),
    });
    setShowPwd(false); // masqué par défaut
  }

  function regenerate() {
    setForm(f => ({ ...f, password: generatePassword(form.name || 'User') }));
    setShowPwd(true); setCopied(false);
  }
  function regenEmail() { setForm(f => ({ ...f, email: suggestEmail(f.name, tenant) })); }

  function copyPwd() {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  function copyAll() {
    if (!form.email || !form.password) return;
    navigator.clipboard.writeText(`Courriel : ${form.email}\nMot de passe : ${form.password}\nLien : https://${tenant}.c-secur360.ca`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function createAccount() {
    if (!form.email.trim() || !form.password.trim()) { setNotice(tr('Courriel et mot de passe requis', 'Email and password required')); return; }
    setBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant, ...form }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      // Conserve le mot de passe pour la gestion admin (best-effort, ignoré si colonne 079 absente)
      if (selected?.id) await supabase.from('planner_personnel').update({ access_password: form.password }).eq('id', selected.id);
      setNotice(tr('Compte créé ✓ — copiez les identifiants ci-dessus', 'Account created ✓ — copy credentials above'));
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
  }

  // Met à jour le mot de passe d'un compte EXISTANT (au lieu d'en créer un)
  async function updateAccount() {
    const acc = users.find(u => (u.email || '').toLowerCase() === (form.email || '').toLowerCase());
    if (!acc) return createAccount();
    if (!form.password.trim()) { setNotice(tr('Saisissez un mot de passe pour mettre à jour.', 'Enter a password to update.')); return; }
    setBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: acc.id, password: form.password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      if (selected?.id) await supabase.from('planner_personnel').update({ access_password: form.password }).eq('id', selected.id);
      setNotice(tr('Mot de passe mis à jour ✓', 'Password updated ✓'));
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
  }

  async function toggleActive(u: UserAccount) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, is_active: !u.is_active }) });
    load();
  }

  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  // Changer mot de passe d'un compte existant
  const [pwdEditFor, setPwdEditFor] = useState<UserAccount | null>(null);
  const [pwdEditValue, setPwdEditValue] = useState('');
  const [pwdEditShow, setPwdEditShow] = useState(true);
  const [pwdEditCopied, setPwdEditCopied] = useState(false);
  function startPwdEdit(u: UserAccount) {
    setPwdEditFor(u);
    setPwdEditValue(generatePassword(u.name || u.email.split('@')[0]));
    setPwdEditShow(true);
    setPwdEditCopied(false);
  }
  async function savePwdEdit() {
    if (!pwdEditFor || !pwdEditValue.trim()) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: pwdEditFor.id, password: pwdEditValue }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      // Conserve le nouveau mot de passe pour la gestion admin (best-effort)
      await supabase.from('planner_personnel').update({ access_password: pwdEditValue }).eq('tenant_id', tenant).ilike('email', pwdEditFor.email);
      setNotice(tr(`Mot de passe mis à jour pour ${pwdEditFor.email} ✓`, `Password updated for ${pwdEditFor.email} ✓`));
      // Copie auto dans le presse-papier
      navigator.clipboard.writeText(pwdEditValue).catch(() => {});
      setPwdEditCopied(true);
      setTimeout(() => { setPwdEditFor(null); setPwdEditValue(''); setPwdEditCopied(false); }, 3000);
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
  }

  async function deleteUser(u: UserAccount) {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Erreur');
      }
      setNotice(tr(`Compte supprimé : ${u.email}`, `Account deleted: ${u.email}`));
      setConfirmDel(null);
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const userByEmail: Record<string, UserAccount> = {};
  users.forEach(u => { userByEmail[u.email.toLowerCase()] = u; });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste personnel à gauche */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr('Personnel — création de compte d\'accès', 'Staff — access account creation')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{tr('Sélectionnez un employé pour générer automatiquement courriel + mot de passe.', 'Select an employee to auto-generate email + password.')}</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {personnel.map(p => {
            const existing = userByEmail[(p.email || '').toLowerCase()];
            const revealed = showPwdFor === p.id;
            return (
              <div key={p.id} role="button" tabIndex={0} onClick={() => pickPersonnel(p)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 ${selected?.id === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${existing ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                  {(p.name || '?')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="truncate text-xs text-gray-500">{p.email || tr('Aucun courriel', 'No email')}</div>
                </div>
                {canReveal && p.access_password && (
                  <span className="flex items-center gap-1 text-[11px]" onClick={e => e.stopPropagation()}>
                    <span className="font-mono text-gray-600 dark:text-gray-300 select-all">{revealed ? p.access_password : '••••••'}</span>
                    <button type="button" onClick={() => setShowPwdFor(revealed ? null : p.id)} className="text-gray-400 hover:text-gray-600" title={tr('Afficher / masquer', 'Show / hide')}>{revealed ? '🙈' : '👁'}</button>
                  </span>
                )}
                {p.niveauAcces && <span className="text-[10px] rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-gray-600 dark:text-gray-300">{p.niveauAcces}</span>}
                {existing
                  ? <span className="text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">✓ {tr('compte', 'account')}</span>
                  : <span className="text-[10px] rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-gray-400">{tr('aucun', 'none')}</span>}
              </div>
            );
          })}
          {personnel.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">{tr('Aucun employé. Créez-en dans « Personnel & planification ».', 'No employee. Create one in "Staff & planning".')}</div>}
        </div>
      </div>

      {/* Panneau création */}
      <div className="space-y-4">
        {selected ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-500/30 dark:bg-blue-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm flex items-center gap-1.5">🔑 {tr('Identifiants', 'Credentials')}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <strong>{selected.name}</strong>
              {selected.niveauAcces && <span className="ml-2 text-[10px] rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5">{selected.niveauAcces}</span>}
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                {tr('Courriel', 'Email')}
                <button type="button" onClick={regenEmail} className="text-[10px] text-blue-600 hover:underline">↻ {tr('Auto', 'Auto')}</button>
              </label>
              <input type="email" className={inp2} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="prenom.nom@..." />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Rôle', 'Role')}</label>
              <select className={inp2} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">{tr('Utilisateur', 'User')}</option>
                <option value="client_admin">{tr('Admin client', 'Client admin')}</option>
                <option value="super_admin">{tr('Super admin', 'Super admin')}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                {tr('Mot de passe', 'Password')}
                <span className="text-[10px] text-gray-400 font-normal">{tr('5 lettres + 3 chiffres + 2 spéciaux', '5 letters + 3 digits + 2 specials')}</span>
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input type={showPwd ? 'text' : 'password'} className={`${inp2} pr-9 font-mono tracking-wider`} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">{showPwd ? '🙈' : '👁'}</button>
                </div>
                <button type="button" onClick={regenerate} title={tr('Régénérer', 'Regenerate')} className="shrink-0 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">↻</button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
                  <span className="font-mono text-sm font-bold tracking-widest text-gray-800 dark:text-gray-100 select-all">{form.password}</span>
                  <button type="button" onClick={copyPwd} className={`text-xs font-semibold transition ${copied ? 'text-emerald-600' : 'text-blue-600 hover:underline'}`}>{copied ? tr('Copié ✓', 'Copied ✓') : tr('Copier', 'Copy')}</button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {(() => { const acc = userByEmail[(form.email || '').toLowerCase()]; return (
              <button onClick={acc ? updateAccount : createAccount} disabled={busy} className={`flex-1 inline-flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60 ${acc ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {acc ? tr('Mettre à jour le mot de passe', 'Update password') : tr('Créer le compte', 'Create account')}
              </button>
              ); })()}
              <button onClick={copyAll} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">📋 {tr('Tout', 'All')}</button>
            </div>
            {notice && <p className={`text-xs font-medium ${notice.includes('✓') ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'}`}>{notice}</p>}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center text-sm text-gray-400">
            👈 {tr('Choisissez un employé à gauche pour générer ses identifiants.', 'Pick an employee on the left to generate credentials.')}
          </div>
        )}

        {/* Liste des comptes existants */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">{tr('Comptes existants', 'Existing accounts')} ({users.length})</h3>
            <button onClick={load} className="text-[10px] text-blue-600 hover:underline">↻ {tr('Actualiser', 'Refresh')}</button>
          </div>
          <div className="space-y-1 max-h-[28rem] overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="rounded border border-gray-100 dark:border-gray-700 hover:border-gray-300 transition">
                <div className="flex items-center gap-2 text-xs px-2 py-1.5 group">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${u.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{u.email}</div>
                    {u.name && <div className="truncate text-[10px] text-gray-400">{u.name}</div>}
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">{u.role}</span>
                  <button onClick={() => startPwdEdit(u)} title={tr('Changer mot de passe', 'Change password')}
                    className="text-[11px] rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 font-semibold shrink-0">
                    🔑
                  </button>
                  <button onClick={() => toggleActive(u)} className="text-[10px] text-gray-400 hover:text-blue-600 shrink-0">{u.is_active ? tr('désact.', 'disable') : tr('activer', 'enable')}</button>
                  {confirmDel === u.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => deleteUser(u)} disabled={busy} className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        {busy ? <Loader2 size={10} className="animate-spin" /> : tr('Confirmer', 'Confirm')}
                      </button>
                      <button onClick={() => setConfirmDel(null)} className="text-[10px] text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(u.id)} title={tr('Supprimer', 'Delete')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 shrink-0 p-0.5">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Panneau changement mot de passe inline */}
                {pwdEditFor?.id === u.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-2 bg-blue-50/40 dark:bg-blue-500/5 space-y-2">
                    <p className="text-[10px] text-gray-500">{tr('Nouveau mot de passe (5 lettres + 3 chiffres + 2 spéciaux)', 'New password (5 letters + 3 digits + 2 specials)')}</p>
                    <div className="flex gap-1.5">
                      <input
                        type={pwdEditShow ? 'text' : 'password'}
                        value={pwdEditValue}
                        onChange={e => setPwdEditValue(e.target.value)}
                        className="flex-1 rounded border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-2 py-1 text-xs font-mono tracking-wider"
                      />
                      <button onClick={() => setPwdEditShow(v => !v)} className="rounded border border-gray-300 dark:border-gray-600 px-2 text-xs">{pwdEditShow ? '🙈' : '👁'}</button>
                      <button onClick={() => setPwdEditValue(generatePassword(u.name || u.email.split('@')[0]))} title={tr('Régénérer', 'Regenerate')} className="rounded border border-gray-300 dark:border-gray-600 px-2 text-xs">↻</button>
                      <button onClick={() => { navigator.clipboard.writeText(pwdEditValue); setPwdEditCopied(true); setTimeout(() => setPwdEditCopied(false), 1500); }} className="rounded border border-gray-300 dark:border-gray-600 px-2 text-xs">📋</button>
                    </div>
                    {pwdEditCopied && <p className="text-[10px] text-emerald-600">✓ {tr('Copié dans le presse-papier', 'Copied to clipboard')}</p>}
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => { setPwdEditFor(null); setPwdEditValue(''); }} className="text-[10px] text-gray-400 hover:text-gray-600 px-2">{tr('Annuler', 'Cancel')}</button>
                      <button onClick={savePwdEdit} disabled={busy || !pwdEditValue.trim()} className="rounded bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                        {busy ? <Loader2 size={10} className="animate-spin" /> : tr('Mettre à jour', 'Update')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {users.length === 0 && <p className="text-xs text-gray-400 py-2 text-center">{tr('Aucun compte créé.', 'No accounts.')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeEvaluationModal({ tenant, tr, employee, onClose, onSaved, canEdit }: { tenant: string; tr: (f: string, e: string) => string; employee: { id: string; name: string; role?: string; subclass?: string; hire_date?: string; hire_salary?: number; current_salary?: number; current_grid_id?: string; acquired_skills?: any[]; last_evaluation_date?: string }; onClose: () => void; onSaved: () => void; canEdit: boolean }) {
  const inp2 = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grid, setGrid] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  // États édition
  const [hireDate, setHireDate] = useState(employee.hire_date || '');
  const [hireSalary, setHireSalary] = useState(employee.hire_salary?.toString() || '');
  const [currentSalary, setCurrentSalary] = useState(employee.current_salary?.toString() || '');
  const [colaPct, setColaPct] = useState('2.5');
  const [scores, setScores] = useState<Record<string, number>>({}); // { skillId: note }
  const [objectives, setObjectives] = useState((employee as any).objectives || '');
  const [evaluatedBy, setEvaluatedBy] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [approvedAt, setApprovedAt] = useState<string>(''); // horodatage d'approbation en direct par l'employé
  const [verifiedBy, setVerifiedBy] = useState<string>(''); const [verifiedAt, setVerifiedAt] = useState<string>(''); // vérifié par le gestionnaire
  const [hrBy, setHrBy] = useState<string>(''); const [hrAt, setHrAt] = useState<string>(''); // approbation RH (optionnelle)
  const [notice, setNotice] = useState<string | null>(null);
  // Clic simple = tout sélectionner (la frappe écrase) ; recliquer = éditer.
  const selectOnFocus = (e: React.FocusEvent) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement && (t.type === 'number' || t.type === 'text')) t.select();
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Évaluateur courant + historique des évaluations
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setEvaluatedBy(user?.email || '');
      } catch { /* indispo */ }
      const { data: hist } = await supabase.from('employee_evaluations').select('*').eq('personnel_id', employee.id).order('evaluation_date', { ascending: false });
      setHistory(hist || []);
      // Trouver le poste de l'employé
      const { data: posteRow } = await supabase.from('planner_postes').select('id').eq('tenant_id', tenant).eq('name', employee.role || '').maybeSingle();
      if (posteRow?.id) {
        const { data: g } = await supabase.from('poste_salary_grids').select('*').eq('tenant_id', tenant).eq('poste_id', posteRow.id).maybeSingle();
        if (g) {
          setGrid(g);
          const { data: ts } = await supabase.from('poste_salary_tiers').select('*').eq('grid_id', g.id).order('tier_level');
          setTiers(ts || []);
          if (g.cola_pct) setColaPct(String(g.cola_pct));
        }
        // Charger les notes de l'employé (nouveau format skill_scores, ou ancien acquired_skills)
        const raw = (employee as any).skill_scores;
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
          setScores(raw as Record<string, number>);
        } else if (Array.isArray(employee.acquired_skills)) {
          const acc: Record<string, number> = {};
          employee.acquired_skills.forEach((s: any) => { if (s?.id) acc[s.id] = s.level ?? s.score ?? 0; });
          setScores(acc);
        }
      }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id, tenant]);

  const useGrid = grid?.use_skill_grid !== false;
  const hpy = Number(grid?.hours_per_year) || 2080; // heures/an pour le taux horaire
  // Ancienneté calculée depuis la date d'embauche (conservée même si l'employé change de poste)
  const seniorityLabel = (() => {
    if (!hireDate) return '';
    const start = new Date(hireDate); const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months--;
    if (months < 0 || isNaN(months)) return '';
    const yy = Math.floor(months / 12), mm = months % 12;
    return `${yy} ${tr('an', 'yr')}${yy > 1 ? 's' : ''} ${mm} ${tr('mois', 'mo')}`;
  })();
  const skillForm: SkillForm | undefined = useGrid && grid?.skill_form && Array.isArray(grid.skill_form.types) ? grid.skill_form : undefined;

  // ─── Note globale pondérée + note par type (formulaire de la grille) ───
  const { global: skillScore, byType } = useMemo(() => computeSkillScore(skillForm, scores), [skillForm, scores]);

  // ─── Palier suggéré par la note ───
  // Si des seuils min_score distincts sont configurés → on les utilise.
  // Sinon → interpolation : la note (%) situe l'employé entre le 1er et le dernier
  // palier salarial, et on retient le palier dont le salaire est le plus proche.
  const tierByScoreIdx = useMemo(() => {
    if (!tiers.length) return 0;
    const sorted = [...tiers].sort((a, b) => a.tier_level - b.tier_level);
    const hasThresholds = new Set(sorted.map(t => Number(t.min_score) || 0)).size > 1;
    if (hasThresholds) return tierForScore(sorted, skillScore);
    const base = Number(sorted[0]?.annual_salary) || 0;
    const top = Number(sorted[sorted.length - 1]?.annual_salary) || base;
    const interp = base + (skillScore / 100) * (top - base);
    let nearest = 0, best = Infinity;
    sorted.forEach((t, i) => { const d = Math.abs((Number(t.annual_salary) || 0) - interp); if (d < best) { best = d; nearest = i; } });
    return nearest;
  }, [tiers, skillScore]);

  // ─── Palier où le salaire actuel situe l'employé ───
  const currentTierIdx = useMemo(() => {
    const cs = parseFloat(currentSalary) || parseFloat(hireSalary) || 0;
    if (!tiers.length || !cs) return 0;
    let idx = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (cs >= (tiers[i].annual_salary || 0) * 0.95) idx = i;
    }
    return idx;
  }, [tiers, currentSalary, hireSalary]);

  // ─── Système intelligent : recommandation de positionnement ───
  // Réf. = salaire actuel, ou salaire d'embauche s'il n'y a pas encore de salaire actuel.
  const reco = useMemo(() => {
    const cs = parseFloat(currentSalary) || parseFloat(hireSalary) || 0;       // salaire de référence
    const cola = parseFloat(colaPct) || 0;
    const colaAmt = Math.round(cs * cola / 100);                               // COLA : une seule fois, sur la référence
    if (!useGrid) {
      const newSalary = cs + colaAmt;
      return { cs, cola, colaAmt, target: null as any, targetSalary: cs, skillAdjust: 0, gapVsSalary: 0, verdict: 'aligned' as const, newSalary, totalAmt: colaAmt, totalPct: cs > 0 ? (colaAmt / cs) * 100 : 0 };
    }
    const target = tiers[tierByScoreIdx];                                      // palier suggéré par la note
    const targetSalary = Number(target?.annual_salary) || 0;
    const gapVsSalary = targetSalary - cs;                                     // écart brut (peut être négatif)
    const skillAdjust = Math.max(0, gapVsSalary);                              // ajustement appliqué : JAMAIS de baisse
    let verdict: 'under' | 'over' | 'aligned' = 'aligned';
    if (gapVsSalary > 1) verdict = 'under';                                    // sous-payé → augmentation due
    else if (gapVsSalary < -1) verdict = 'over';                              // au-dessus (aucune baisse imposée)
    const newSalary = cs + skillAdjust + colaAmt;                              // réf + ajustement (≥0) + COLA
    const totalAmt = newSalary - cs;
    const totalPct = cs > 0 ? (totalAmt / cs) * 100 : 0;
    return { cs, cola, colaAmt, target, targetSalary, skillAdjust, gapVsSalary, verdict, newSalary, totalAmt, totalPct };
  }, [currentSalary, hireSalary, colaPct, tiers, tierByScoreIdx, currentTierIdx, useGrid]);

  const setScore = (id: string, v: number) => setScores(p => ({ ...p, [id]: v }));

  // Rouvre une évaluation passée : recharge ses notes + salaire de référence pour
  // refaire la progression / l'ajustement à partir de cet état.
  const reopenEval = (h: any) => {
    if (h.scores && typeof h.scores === 'object' && !Array.isArray(h.scores)) setScores(h.scores);
    if (h.salary_before != null) setCurrentSalary(String(h.salary_before));
    if (h.cola_pct != null) setColaPct(String(h.cola_pct));
    if (h.objectives) setObjectives(h.objectives);
    setApprovedAt(''); setVerifiedAt(''); setHrAt('');
    setNotice(tr(`Évaluation du ${h.evaluation_date} rechargée — ajustez puis enregistrez la nouvelle évaluation.`, `Evaluation from ${h.evaluation_date} reloaded — adjust then save the new one.`));
  };

  async function exportEval() {
    const { data: t } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle();
    const { exportEvaluationPdf } = await import('@/lib/salaryPdf');
    await exportEvaluationPdf({
      tr, dateStr: new Date().toLocaleDateString('fr-CA'), logoUrl: t?.logo_url || undefined,
      employeeName: employee.name, posteName: employee.role || '', evaluatedBy,
      useGrid, globalScore: skillScore, tierName: reco.target?.tier_name || '—', tierMinScore: reco.target?.min_score ?? 0,
      skillForm: skillForm || null, scores, byType,
      salaryBefore: reco.cs, salaryAfter: reco.newSalary, targetSalary: reco.targetSalary, skillAdjust: reco.skillAdjust, colaPct: reco.cola, colaAmt: reco.colaAmt, totalPct: reco.totalPct, hpy,
      objectives, approvedAt, verifiedBy, verifiedAt, hrBy, hrAt,
    });
  }

  async function save() {
    setSaving(true); setNotice(null);
    try {
      // Met à jour l'employé (notes par compétence + salaire + palier justifié)
      const empPayload: any = {
        hire_date: hireDate || null,
        hire_salary: hireSalary ? Number(hireSalary) : null,
        current_salary: currentSalary ? Number(currentSalary) : null,
        current_grid_id: grid?.id || null,
        current_tier_id: tiers[tierByScoreIdx]?.id || null,
        skill_scores: scores,
        objectives: objectives || null,
        last_evaluation_date: new Date().toISOString().slice(0, 10),
      };
      let { error: empErr } = await supabase.from('planner_personnel').update(empPayload).eq('id', employee.id);
      if (empErr && /skill_scores|objectives/i.test(empErr.message || '')) {
        const { skill_scores, objectives: _o, ...fallback } = empPayload; // migrations 075-076 non exécutées
        ({ error: empErr } = await supabase.from('planner_personnel').update(fallback).eq('id', employee.id));
      }
      if (empErr) throw empErr;

      // Crée une entrée d'historique d'évaluation (avec fallback si colonnes 076 absentes)
      const evalPayload: any = {
        tenant_id: tenant,
        personnel_id: employee.id,
        grid_id: grid?.id || null,
        tier_id: tiers[tierByScoreIdx]?.id || null,
        evaluation_date: new Date().toISOString().slice(0, 10),
        salary_before: reco.cs,
        salary_after: reco.newSalary,
        cola_pct: reco.cola,
        cola_amount: reco.colaAmt,
        skill_score: skillScore,
        skill_increase_pct: reco.cs > 0 ? (reco.skillAdjust / reco.cs) * 100 : 0,
        skill_increase_amount: reco.skillAdjust,
        total_increase_pct: reco.totalPct,
        total_increase_amount: reco.totalAmt,
        evaluated_by: evaluatedBy || null,
        objectives: objectives || null,
        approved_at: approvedAt || null,
        approved_by: approvedAt ? employee.name : null,
        approvals: {
          verified: verifiedAt ? { by: verifiedBy, at: verifiedAt } : null,
          employee: approvedAt ? { at: approvedAt } : null,
          hr: hrAt ? { by: hrBy, at: hrAt } : null,
        },
        scores,  // snapshot des notes par compétence (pour rouvrir l'éval)
        status: approvedAt ? 'approved' : 'pending',
      };
      let { error: evErr } = await supabase.from('employee_evaluations').insert(evalPayload);
      if (evErr && /evaluated_by|objectives|approvals|scores/i.test(evErr.message || '')) {
        const { evaluated_by, objectives: _o2, approvals: _ap, scores: _sc, ...evFallback } = evalPayload;
        ({ error: evErr } = await supabase.from('employee_evaluations').insert(evFallback));
      }
      if (evErr) throw evErr;

      setNotice(tr('Évaluation enregistrée ✓', 'Evaluation saved ✓'));
      onSaved();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  const fmt = (n: number) => Math.round(n).toLocaleString('fr-CA') + ' $';

  if (loading) return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60" onClick={onClose}>
      <Loader2 className="animate-spin text-white" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()} onFocus={selectOnFocus}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              📊 {tr('Évaluation & salaire', 'Evaluation & salary')}
              <span className="text-blue-600 dark:text-blue-400">{employee.name}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {employee.role || tr('Aucun poste', 'No position')}
              {employee.subclass && <span className="ml-1 text-cyan-600 dark:text-cyan-400">· {employee.subclass}</span>}
              {evaluatedBy && <span className="ml-2">· {tr('évalué par', 'evaluated by')} {evaluatedBy}</span>}
              {employee.last_evaluation_date && <span className="ml-2">· {tr('dernière éval :', 'last eval:')} {employee.last_evaluation_date}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportEval} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" title={tr('Exporter la fiche d\'évaluation en PDF', 'Export evaluation sheet to PDF')}>
              <ExternalLink size={13} /> {tr('Export PDF', 'Export PDF')}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
        </div>

        {!grid ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {tr('Aucune grille salariale configurée pour ce poste.', 'No salary grid configured for this position.')}
            <p className="mt-2 text-xs text-gray-400">{tr('Configurez la grille dans Postes → Grille salariale.', 'Configure the grid in Positions → Salary grid.')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Section 1 : Embauche & salaires */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">{tr('Embauche', 'Hire')}</h4>
                <label className="text-xs">{tr('Date d\'embauche', 'Hire date')}</label>
                <input type="date" disabled={!canEdit} className={inp2} value={hireDate} onChange={e => setHireDate(e.target.value)} />
                {seniorityLabel && <p className="mt-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">⏳ {tr('Ancienneté', 'Seniority')} : {seniorityLabel}</p>}
                <label className="text-xs mt-2 block">{tr('Salaire à l\'embauche $', 'Hire salary $')}</label>
                <input type="number" disabled={!canEdit} className={inp2} value={hireSalary} onChange={e => setHireSalary(e.target.value)} placeholder="48000" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Taux $/h ≈ {((parseFloat(hireSalary) || 0) / hpy).toFixed(2)} $</p>
                {useGrid && tiers.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer select-none text-[9px] uppercase font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">☰ {tr('Réf. grille — cliquer pour appliquer', 'Grid ref — click to apply')}</summary>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tiers.map((t: any) => (
                        <button key={t.id || t.tier_level} type="button" disabled={!canEdit}
                          onClick={() => { setHireSalary(String(t.annual_salary)); if (!currentSalary) setCurrentSalary(String(t.annual_salary)); }}
                          className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-blue-500/10"
                          title={tr('Appliquer au salaire de départ', 'Apply to starting salary')}>
                          {t.tier_name}: {fmt(Number(t.annual_salary) || 0)} · {((Number(t.annual_salary) || 0) / hpy).toFixed(2)}/h
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-3">
                <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 uppercase mb-2">{tr('Salaire actuel', 'Current salary')}</h4>
                <label className="text-xs">{tr('Salaire $/an', 'Salary $/yr')}</label>
                <input type="number" disabled={!canEdit} className={inp2} value={currentSalary} onChange={e => setCurrentSalary(e.target.value)} placeholder="52000" />
                <p className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400">
                  {tr('Palier actuel : ', 'Current tier: ')}<strong>{tiers[currentTierIdx]?.tier_name || '—'}</strong>
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Taux $/h ≈ {(parseFloat(currentSalary) / (grid.hours_per_year || 2080) || 0).toFixed(2)} $
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/10 p-3">
                <h4 className="font-bold text-xs text-amber-700 dark:text-amber-300 uppercase mb-2">{tr('Ajustement coût de la vie', 'Cost of living')}</h4>
                <label className="text-xs">{tr('% COLA', '% COLA')}</label>
                <input type="number" step={0.1} disabled={!canEdit} className={inp2} value={colaPct} onChange={e => setColaPct(e.target.value)} />
                <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-400">
                  = +{fmt(reco.colaAmt)} {tr('automatique', 'automatic')}
                </p>
              </div>
            </div>

            {/* Section 2 : Évaluation des compétences (note globale en haut) — mode grille seulement */}
            {useGrid && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 dark:border-purple-500/30 dark:bg-purple-500/5 p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                  <Award size={16} /> {tr('Évaluation des compétences', 'Skill evaluation')}
                </h4>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">{tr('Note globale', 'Global score')}</div>
                  <div className={`text-3xl font-bold leading-none ${skillScore >= 80 ? 'text-emerald-600' : skillScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {skillScore.toFixed(0)} %
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3">
                <div className={`h-full transition-all ${skillScore >= 80 ? 'bg-emerald-500' : skillScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${skillScore}%` }} />
              </div>
              {!skillForm || skillForm.types.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">{tr('Aucun formulaire de compétences défini. Configurez-le dans Postes → Grille salariale.', 'No skill form defined. Configure it in Positions → Salary grid.')}</p>
              ) : (
                <div className="space-y-3">
                  {skillForm.types.map(type => {
                    const max = type.mode === 'pct' ? 100 : (type.max || 5);
                    return (
                      <div key={type.id} className="rounded-lg border border-purple-200 bg-white p-2.5 dark:border-purple-500/20 dark:bg-gray-800">
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold">{type.name}
                            <span className="ml-1.5 text-[10px] font-normal text-gray-400">{tr('pond.', 'weight')} {type.weight}% · {type.mode === 'pct' ? '%' : `/${type.max}`}</span>
                          </span>
                          <span className={`text-sm font-bold ${(byType[type.id] || 0) >= 80 ? 'text-emerald-600' : (byType[type.id] || 0) >= 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {(byType[type.id] || 0).toFixed(0)} %
                          </span>
                        </div>
                        {type.skills.length === 0 ? (
                          <p className="text-[10px] italic text-gray-400">{tr('Aucune compétence dans ce type.', 'No skill in this type.')}</p>
                        ) : (
                          <div className="space-y-1.5">
                            {type.skills.map(s => {
                              const v = scores[s.id] || 0;
                              return (
                                <div key={s.id} className="flex flex-col gap-1 text-xs sm:grid sm:grid-cols-12 sm:items-center sm:gap-2">
                                  <div className="font-medium sm:col-span-4 sm:truncate">{s.name || tr('(sans nom)', '(unnamed)')}</div>
                                  <div className="sm:col-span-6">
                                    <input type="range" min={0} max={max} step={type.mode === 'pct' ? 5 : 1} value={Math.min(v, max)} disabled={!canEdit}
                                      onChange={e => setScore(s.id, Number(e.target.value))} className="w-full" />
                                  </div>
                                  <div className="text-right sm:col-span-2">
                                    <span className={`font-bold ${v >= max ? 'text-emerald-600' : v >= max / 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                                      {v}{type.mode === 'pct' ? ' %' : `/${max}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Section 3 : Positionnement intelligent dans la grille */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10 p-4">
              <h4 className="font-bold text-sm flex items-center gap-1.5 text-blue-700 dark:text-blue-300 mb-3">
                <TrendingUp size={16} /> {tr('Positionnement dans la grille', 'Grid positioning')}
              </h4>
              {tiers.length === 0 ? (
                <p className="text-xs text-gray-400">{tr('Aucun palier défini dans la grille.', 'No tier defined in the grid.')}</p>
              ) : (
                <div className="space-y-3">
                  <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    reco.verdict === 'under' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                      : reco.verdict === 'over' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200'}`}>
                    {reco.verdict === 'under' && `⬆️ ${tr('Sous-positionné — sa note justifie un palier supérieur', 'Under-positioned — the score justifies a higher tier')}`}
                    {reco.verdict === 'over' && `⬇️ ${tr('Au-dessus du palier que sa note justifie', 'Above the tier justified by the score')}`}
                    {reco.verdict === 'aligned' && `✓ ${tr('Aligné — le salaire est cohérent avec la note', 'Aligned — salary is consistent with the score')}`}
                  </div>
                  {useGrid && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{tr('Note globale', 'Global score')} : <strong>{skillScore.toFixed(0)} %</strong> → {tr('palier suggéré', 'suggested tier')} <strong className="text-blue-700 dark:text-blue-300">{reco.target?.tier_name || '—'}</strong></span>
                    </div>
                  )}
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-blue-100 text-gray-400 dark:border-blue-500/20">
                      <th className="py-1 text-left font-medium">{tr('Élément', 'Item')}</th>
                      <th className="py-1 text-right font-medium">{tr('Annuel', 'Annual')}</th>
                      <th className="py-1 text-right font-medium">$/h</th>
                    </tr></thead>
                    <tbody>
                      <tr className="border-b border-blue-100 dark:border-blue-500/20">
                        <td className="py-1.5">{tr('Salaire de référence', 'Reference salary')}{useGrid && <span className="text-gray-400"> · {tiers[currentTierIdx]?.tier_name || '—'}</span>}</td>
                        <td className="text-right font-mono">{fmt(reco.cs)}</td>
                        <td className="text-right font-mono">{(reco.cs / hpy).toFixed(2)} $</td>
                      </tr>
                      {useGrid && (
                      <tr className="border-b border-blue-100 text-purple-700 dark:border-blue-500/20 dark:text-purple-300">
                        <td className="py-1.5">+ {tr('Ajustement compétences', 'Skill adjustment')} ({reco.cs > 0 ? ((reco.skillAdjust / reco.cs) * 100).toFixed(1) : '0'} %){reco.gapVsSalary < -1 && <span className="text-[10px] text-amber-600"> · {tr('déjà au-dessus, aucune baisse', 'already above, no decrease')}</span>}</td>
                        <td className="text-right font-mono">+{fmt(reco.skillAdjust)}</td>
                        <td className="text-right font-mono">+{(reco.skillAdjust / hpy).toFixed(2)} $</td>
                      </tr>
                      )}
                      <tr className="border-b border-blue-100 text-amber-700 dark:border-blue-500/20 dark:text-amber-300">
                        <td className="py-1.5">+ {tr('Coût de la vie', 'COLA')} ({reco.cola.toFixed(1)} %)</td>
                        <td className="text-right font-mono">+{fmt(reco.colaAmt)}</td>
                        <td className="text-right font-mono">+{(reco.colaAmt / hpy).toFixed(2)} $</td>
                      </tr>
                      <tr className="border-t-2 border-blue-300 font-bold text-blue-700 dark:border-blue-500/40 dark:text-blue-300">
                        <td className="py-2">= {tr('Total recommandé', 'Recommended total')} ({reco.totalPct >= 0 ? '+' : ''}{reco.totalPct.toFixed(1)} %)</td>
                        <td className="text-right font-mono text-sm">{fmt(reco.newSalary)}</td>
                        <td className="text-right font-mono text-sm">{(reco.newSalary / hpy).toFixed(2)} $</td>
                      </tr>
                    </tbody>
                  </table>
                  {canEdit && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button onClick={() => { const s = String(Math.round(reco.targetSalary)); setHireSalary(s); setCurrentSalary(s); }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        📊 {tr('Placer selon la note (palier)', 'Place by score (tier)')} — {fmt(reco.targetSalary)}
                      </button>
                      <span className="self-center text-[10px] text-gray-400">{tr('ou saisir un taux manuel selon l\'expérience pertinente ci-dessus', 'or enter a manual rate based on relevant experience above')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Objectifs pour la prochaine année */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">🎯 {tr('Objectifs pour la prochaine année', 'Objectives for next year')}</h4>
              <textarea rows={3} disabled={!canEdit} className={`${inp2} resize-y`} value={objectives} onChange={e => setObjectives(e.target.value)} placeholder={tr('Objectifs de développement, compétences à acquérir, projets visés…', 'Development goals, skills to acquire, target projects…')} />
            </div>

            {/* Historique des évaluations */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">📜 {tr('Historique & évolution', 'History & evolution')} <span className="text-xs text-gray-400 font-normal">({history.length})</span></h4>
              {(
                <div className="overflow-x-auto">
                  <table className="mobile-cards w-full text-xs">
                    <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <th className="px-2 py-1.5">{tr('Date', 'Date')}</th>
                      <th className="px-2">{tr('Note', 'Score')}</th>
                      <th className="px-2 text-right">{tr('Salaire avant', 'Salary before')}</th>
                      <th className="px-2 text-right">{tr('Salaire après', 'Salary after')}</th>
                      <th className="px-2 text-right">{tr('Évolution', 'Change')}</th>
                      <th className="px-2">{tr('Évalué par', 'Evaluated by')}</th>
                      <th className="px-2">{tr('Statut', 'Status')}</th>
                      <th className="px-2"></th>
                    </tr></thead>
                    <tbody>
                      {/* Projection en cours (non enregistrée) — évolue en direct */}
                      <tr className="border-t border-blue-100 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-500/5">
                        <td className="px-2 py-1.5 font-semibold text-blue-700 dark:text-blue-300" data-label={tr('Date', 'Date')}>{tr('Projection (live)', 'Projection (live)')}</td>
                        <td className="px-2" data-label={tr('Note', 'Score')}>{skillScore.toFixed(0)} %</td>
                        <td className="px-2 text-right" data-label={tr('Salaire avant', 'Salary before')}>{fmt(reco.cs)}</td>
                        <td className="px-2 text-right font-semibold text-blue-700 dark:text-blue-300" data-label={tr('Salaire après', 'Salary after')}>{fmt(reco.newSalary)}</td>
                        <td className="px-2 text-right font-semibold text-emerald-600" data-label={tr('Évolution', 'Change')}>{reco.totalAmt >= 0 ? '+' : ''}{fmt(reco.totalAmt)} ({reco.totalPct >= 0 ? '+' : ''}{reco.totalPct.toFixed(1)} %)</td>
                        <td className="px-2" data-label={tr('Évalué par', 'Evaluated by')}>{evaluatedBy || '—'}</td>
                        <td className="px-2" data-label={tr('Statut', 'Status')}><span className="italic text-gray-400">{tr('non enregistré', 'unsaved')}</span></td>
                        <td className="px-2"></td>
                      </tr>
                      {history.map((h: any) => {
                        const chg = (Number(h.salary_after) || 0) - (Number(h.salary_before) || 0);
                        return (
                        <tr key={h.id} className="border-t border-gray-50 dark:border-gray-700/50">
                          <td className="px-2 py-1.5" data-label={tr('Date', 'Date')}>{h.evaluation_date}</td>
                          <td className="px-2" data-label={tr('Note', 'Score')}>{h.skill_score != null ? `${Number(h.skill_score).toFixed(0)} %` : '—'}</td>
                          <td className="px-2 text-right" data-label={tr('Salaire avant', 'Salary before')}>{fmt(Number(h.salary_before) || 0)}</td>
                          <td className="px-2 text-right" data-label={tr('Salaire après', 'Salary after')}>{fmt(Number(h.salary_after) || 0)}</td>
                          <td className={`px-2 text-right ${chg >= 0 ? 'text-emerald-600' : 'text-red-600'}`} data-label={tr('Évolution', 'Change')}>{chg >= 0 ? '+' : ''}{fmt(chg)}</td>
                          <td className="px-2" data-label={tr('Évalué par', 'Evaluated by')}>{h.evaluated_by || '—'}</td>
                          <td className="px-2" data-label={tr('Statut', 'Status')}>{h.status}</td>
                          <td className="px-2 text-right sm:text-left">
                            <button onClick={() => reopenEval(h)} className="rounded-lg border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-blue-500/10" title={tr('Rouvrir cette évaluation (recharge les notes)', 'Reopen this evaluation (reloads scores)')}>↻ {tr('Rouvrir', 'Reopen')}</button>
                          </td>
                        </tr>
                      ); })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Vérifications & approbations (multi-niveaux, horodatées) */}
            <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-1 flex items-center gap-1.5 text-sm font-bold">✅ {tr('Vérifications & approbations', 'Verifications & approvals')}</h4>
              {/* 1. Vérifié par le gestionnaire */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="w-44 font-semibold">{tr('Vérifié par (gestionnaire)', 'Verified by (manager)')}</span>
                <input className={`${inp2} min-w-[8rem] flex-1`} value={verifiedBy} disabled={!canEdit || !!verifiedAt} placeholder={tr('Nom du gestionnaire', 'Manager name')} onChange={e => setVerifiedBy(e.target.value)} />
                {verifiedAt
                  ? <span className="text-emerald-700 dark:text-emerald-300">✓ {new Date(verifiedAt).toLocaleString('fr-CA')} <button onClick={() => setVerifiedAt('')} className="ml-1 text-gray-400 hover:text-gray-600">✕</button></span>
                  : <button onClick={() => verifiedBy.trim() && setVerifiedAt(new Date().toISOString())} disabled={!verifiedBy.trim()} className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{tr('Vérifier', 'Verify')}</button>}
              </div>
              {/* 2. Approuvé en direct par l'employé */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="w-44 font-semibold">{tr("Approuvé par l'employé", 'Approved by employee')}</span>
                <span className="min-w-[8rem] flex-1 text-gray-500 dark:text-gray-400">{approvedAt ? `✓ ${new Date(approvedAt).toLocaleString('fr-CA')}` : tr('En direct sur cet écran', 'Live on this screen')}</span>
                {approvedAt
                  ? <button onClick={() => setApprovedAt('')} className="text-gray-400 hover:text-gray-600">{tr('Annuler', 'Undo')}</button>
                  : <button onClick={() => setApprovedAt(new Date().toISOString())} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700">✓ {tr("J'approuve", 'I approve')}</button>}
              </div>
              {/* 3. Approbation RH (optionnelle) */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="w-44 font-semibold">{tr('Approbation RH', 'HR approval')} <span className="font-normal text-gray-400">({tr('optionnel', 'optional')})</span></span>
                <input className={`${inp2} min-w-[8rem] flex-1`} value={hrBy} disabled={!canEdit || !!hrAt} placeholder={tr('Nom RH', 'HR name')} onChange={e => setHrBy(e.target.value)} />
                {hrAt
                  ? <span className="text-emerald-700 dark:text-emerald-300">✓ {new Date(hrAt).toLocaleString('fr-CA')} <button onClick={() => setHrAt('')} className="ml-1 text-gray-400 hover:text-gray-600">✕</button></span>
                  : <button onClick={() => hrBy.trim() && setHrAt(new Date().toISOString())} disabled={!hrBy.trim()} className="rounded-lg bg-purple-600 px-3 py-1.5 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">{tr('Approuver', 'Approve')}</button>}
              </div>
            </div>

            {notice && <div className={`rounded-lg px-3 py-2 text-sm ${notice.includes('✓') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{notice}</div>}

            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">{tr('Fermer', 'Close')}</button>
              {canEdit && (
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer évaluation', 'Save evaluation')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SousClassesPlanner({ tenant, tr, inp, onSubclassesChanged }: { tenant: string; tr: (f: string, e: string) => string; inp: string; onSubclassesChanged?: () => void }) {
  type Row = { id?: string; name: string; code: string; color: string; category: string; description: string; active: boolean; sort_order: number };
  const empty = (): Row => ({ name: '', code: '', color: '#06b6d4', category: 'Métier', description: '', active: true, sort_order: 0 });
  const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#84cc16', '#f97316', '#6366f1'];
  const [rows, setRows] = useState<Row[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('Métier');

  async function load() {
    setLoading(true);
    const [{ data, error }, { data: postes }] = await Promise.all([
      supabase.from('poste_subclasses_catalog').select('*').eq('tenant_id', tenant).order('category').order('name').range(0, 999),
      supabase.from('planner_postes').select('subclass_ids').eq('tenant_id', tenant).range(0, 999),
    ]);
    if (error) setNotice('Erreur chargement : ' + error.message);
    setRows(data || []);
    // Compter combien de postes utilisent chaque sous-classe
    const counts: Record<string, number> = {};
    (postes || []).forEach((p: any) => { (p.subclass_ids || []).forEach((sid: string) => { counts[sid] = (counts[sid] || 0) + 1; }); });
    setUsageCounts(counts);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { ...empty(), color: COLORS[p.length % COLORS.length], sort_order: p.length }]);

  async function save() {
    setSaving(true); setNotice(null);
    console.log('[Sous-classes save] rows complets:', JSON.parse(JSON.stringify(rows)));
    let ok = 0, err = 0; const errs: string[] = [];
    const rowsToSave = rows.filter(r => r.name?.trim());
    if (rowsToSave.length === 0) {
      const reasons = rows.map((r, i) => `[${i}] name="${r.name}" (${typeof r.name})`).join(' · ');
      setNotice(`⚠️ Aucune sous-classe à enregistrer.\nLignes en mémoire : ${rows.length}\n${reasons}`);
      setSaving(false); return;
    }
    for (const r of rowsToSave) {
      const payload = { tenant_id: tenant, name: r.name.trim(), code: r.code?.trim() || null, color: r.color || '#06b6d4', category: r.category || 'Métier', description: r.description || null, active: r.active !== false, sort_order: r.sort_order || 0 };
      console.log('[Sous-classes save] payload:', payload, 'id:', r.id);
      try {
        let result;
        if (r.id) result = await supabase.from('poste_subclasses_catalog').update(payload).eq('id', r.id).select();
        else      result = await supabase.from('poste_subclasses_catalog').insert(payload).select();
        console.log('[Sous-classes save] résultat:', result);
        if (result.error) throw result.error;
        if (!result.data || result.data.length === 0) throw new Error('RLS a bloqué silencieusement (0 ligne retournée)');
        ok++;
      } catch (e: any) {
        const msg = String(e?.message || e?.details || e?.hint || 'erreur');
        console.error('[Sous-classes save] ERREUR:', e);
        err++; errs.push(`${r.name}: ${msg}`);
      }
    }
    setNotice(`✓ ${ok} ${tr('enregistré(s)', 'saved')}${err ? ` · ✗ ${err} ${tr('erreur(s)', 'errors')}` : ''}${errs.length ? `\n${errs.slice(0, 3).join('\n')}` : ''}`);
    await load(); onSubclassesChanged?.(); setSaving(false);
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) {
      if (usageCounts[r.id] > 0 && !confirm(tr(`Cette sous-classe est utilisée par ${usageCounts[r.id]} poste(s). Supprimer quand même ?`, `This sub-class is used by ${usageCounts[r.id]} position(s). Delete anyway?`))) return;
      await supabase.from('poste_subclasses_catalog').delete().eq('id', r.id);
      onSubclassesChanged?.();
    }
    setRows(p => p.filter((_, j) => j !== i));
  }

  function bulkImport() {
    const lines = bulkText.split(/\r?\n|;/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const newRows: Row[] = lines.map((line, idx) => {
      const parts = line.split(/\s*[|,]\s*/);
      return { ...empty(), name: parts[0], code: parts[1] || '', category: bulkCategory, color: COLORS[(rows.length + idx) % COLORS.length], sort_order: rows.length + idx };
    });
    setRows(p => [...p, ...newRows]);
    setBulkText(''); setShowBulk(false);
    setNotice(tr(`${newRows.length} sous-classe(s) ajoutée(s) — cliquez Enregistrer.`, `${newRows.length} sub-class(es) added — click Save.`));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  const byCategory = rows.reduce((acc, r, i) => { (acc[r.category || 'Autre'] = acc[r.category || 'Autre'] || []).push({ r, i }); return acc; }, {} as Record<string, { r: Row; i: number }[]>);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700 flex-wrap gap-2">
        <div>
          <h2 className="font-bold">{tr('Catalogue de sous-classes', 'Sub-classes catalog')} <span className="text-xs font-normal text-gray-400">({rows.length})</span></h2>
          <p className="text-xs text-gray-500">{tr('Créez une sous-classe une fois (ex: « Technique ») et appliquez-la à plusieurs postes.', 'Create a sub-class once (e.g. "Technical") and apply it to multiple positions.')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={() => setShowBulk(true)} className="inline-flex items-center gap-1 rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 dark:border-purple-500/40">📋 {tr('Coller liste', 'Paste list')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-xs text-blue-700 dark:text-blue-300 whitespace-pre-line">{notice}</div>}

      {showBulk && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowBulk(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">📋 {tr('Importer des sous-classes', 'Import sub-classes')}</h3>
            <div className="mb-2">
              <label className="text-xs text-gray-500">{tr('Catégorie pour toutes les lignes', 'Category for all lines')}</label>
              <select className={inp} value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}>
                <option>Métier</option><option>Spécialité</option><option>Domaine</option><option>Certification</option><option>Autre</option>
              </select>
            </div>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={10} autoFocus
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm font-mono"
              placeholder={`Technique\nÉlectrique | EL\nMécanique\nSoudure TIG\nGestion\n…`} />
            <p className="text-[10px] text-gray-400 mt-1">{bulkText.split(/\r?\n|;/).filter(l => l.trim()).length} {tr('ligne(s)', 'lines')}</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => { setShowBulk(false); setBulkText(''); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600">{tr('Annuler', 'Cancel')}</button>
              <button onClick={bulkImport} disabled={!bulkText.trim()} className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">{tr('Ajouter', 'Add')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 space-y-4">
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {cat} <span className="text-gray-400 font-normal">({items.length})</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {items.map(({ r, i }) => {
                const nameEmpty = !r.name?.trim();
                return (
                  <div key={r.id || i} className={`px-3 py-2 ${nameEmpty ? 'bg-red-50/30 dark:bg-red-500/5' : ''}`}>
                    <div className="grid grid-cols-12 gap-2 items-end">
                      {/* Couleur */}
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Coul.', 'Color')}</label>
                        <input type="color" value={r.color} onChange={e => upd(i, 'color', e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-300 p-0.5 dark:border-gray-600" />
                      </div>
                      {/* Nom (PROMINENT) */}
                      <div className="col-span-10 sm:col-span-5">
                        <label className={`block text-[9px] uppercase font-bold mb-0.5 ${nameEmpty ? 'text-red-600' : 'text-gray-500'}`}>
                          {tr('Nom *', 'Name *')} {nameEmpty && `⚠️ ${tr('Obligatoire', 'Required')}`}
                        </label>
                        <input
                          className={`${inp} ${nameEmpty ? 'ring-2 ring-red-400 dark:ring-red-500/60 border-red-300' : ''}`}
                          value={r.name}
                          onChange={e => upd(i, 'name', e.target.value)}
                          placeholder={tr('ex: Technique, Électrique, Soudure TIG…', 'e.g. Technical, Electric, TIG welding…')}
                          autoFocus={!r.id && !r.name}
                        />
                      </div>
                      {/* Code */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Code (court)', 'Code (short)')}</label>
                        <input className={inp} value={r.code} onChange={e => upd(i, 'code', e.target.value)} placeholder="TECH" />
                      </div>
                      {/* Catégorie */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Catégorie', 'Category')}</label>
                        <select className={inp} value={r.category} onChange={e => upd(i, 'category', e.target.value)}>
                          <option>Métier</option><option>Spécialité</option><option>Domaine</option><option>Certification</option><option>Autre</option>
                        </select>
                      </div>
                      {/* Actions */}
                      <div className="col-span-12 flex items-center gap-2 justify-end pb-1 sm:col-span-2">
                        {r.id && usageCounts[r.id] > 0 && (
                          <span className="text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-semibold">
                            {usageCounts[r.id]} {tr('poste(s)', 'post(s)')}
                          </span>
                        )}
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /> {tr('Actif', 'Active')}
                        </label>
                        <button onClick={() => del(i)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-12">
            <p>{tr('Aucune sous-classe. Créez-en pour pouvoir les appliquer aux postes.', 'No sub-class. Create some to apply them to positions.')}</p>
            <p className="mt-1 text-xs">{tr('Ex: Technique, Électrique, Mécanique, Soudure TIG, Gestion…', 'E.g. Technical, Electrical, Mechanical, TIG welding, Management…')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Employes({ tenant, tr, perms }: { tenant: string; tr: (f: string, e: string) => string; perms: typeof PERMS[AccessLevel] }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [subTab, setSubTab] = useState<'personnel' | 'postes' | 'sousclasses' | 'comptes'>('personnel');
  const [sharedPostes, setSharedPostes] = useState<{ id: string; name: string; color?: string; subclass_ids?: string[] }[]>([]);
  const [sharedSubclasses, setSharedSubclasses] = useState<{ id: string; name: string; code?: string; color?: string; category?: string }[]>([]);
  const [postesTick, setPostesTick] = useState(0);

  const reloadPostes = useCallback(async () => {
    const { data } = await supabase.from('planner_postes').select('id, name, color, subclass_ids').eq('tenant_id', tenant).order('name').range(0, 999);
    setSharedPostes((data || []).map((p: any) => ({ ...p, subclass_ids: Array.isArray(p.subclass_ids) ? p.subclass_ids : [] })));
    setPostesTick(t => t + 1);
  }, [tenant]);

  const reloadSubclasses = useCallback(async () => {
    const { data } = await supabase.from('poste_subclasses_catalog').select('id, name, code, color, category').eq('tenant_id', tenant).eq('active', true).order('category').order('name').range(0, 999);
    setSharedSubclasses(data || []);
  }, [tenant]);

  useEffect(() => { reloadPostes(); reloadSubclasses(); }, [reloadPostes, reloadSubclasses]);
  return (
    <div className="space-y-4">
      {/* Module cross-links */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: `/${tenant}/planificateur`, label: tr('Planificateur', 'Planner'), color: 'bg-violet-100 text-violet-700 border-violet-200' },
          { href: `/${tenant}/timesheets`,    label: tr('Feuilles de temps', 'Timesheets'), color: 'bg-blue-100 text-blue-700 border-blue-200' },
          { href: `/${tenant}/todo`,          label: tr('Tâches', 'Tasks'), color: 'bg-amber-100 text-amber-700 border-amber-200' },
        ].map(m => (
          <Link key={m.href} href={m.href}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 ${m.color}`}>
            <ExternalLink size={12} /> {m.label}
          </Link>
        ))}
      </div>
      {/* Sous-onglets */}
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800 flex-wrap">
        {[
          { k: 'personnel',   label: tr('Personnel & planification', 'Staff & planning'), icon: HardHat },
          { k: 'postes',      label: tr('Postes',                    'Positions'),         icon: Layers },
          { k: 'sousclasses', label: tr('Sous-classes',              'Sub-classes'),       icon: Wrench },
          { k: 'comptes',     label: tr('Comptes d\'accès',          'Access accounts'),    icon: UserCog },
        ].map(x => {
          const Icon = x.icon as any;
          return (
            <button key={x.k} onClick={() => setSubTab(x.k as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Icon size={15} /> {x.label}
            </button>
          );
        })}
      </div>
      {subTab === 'personnel'   && <PersonnelPlanner    tenant={tenant} tr={tr} inp={inp} goToPostes={() => setSubTab('postes')} sharedPostes={sharedPostes} sharedSubclasses={sharedSubclasses} postesTick={postesTick} perms={perms} />}
      {subTab === 'postes'      && <PostesPlanner      tenant={tenant} tr={tr} inp={inp} sharedSubclasses={sharedSubclasses} onPostesChanged={reloadPostes} goToSubclasses={() => setSubTab('sousclasses')} perms={perms} />}
      {subTab === 'sousclasses' && <SousClassesPlanner tenant={tenant} tr={tr} inp={inp} onSubclassesChanged={reloadSubclasses} />}
      {subTab === 'comptes'     && <ComptesAcces       tenant={tenant} tr={tr} canReveal={perms.viewSalary} />}
    </div>
  );
}

function PersonnelPlanner({ tenant, tr, inp, goToPostes, sharedPostes, sharedSubclasses, postesTick, perms }: { tenant: string; tr: (f: string, e: string) => string; inp: string; goToPostes: () => void; sharedPostes: { id: string; name: string; color?: string; subclass_ids?: string[] }[]; sharedSubclasses: { id: string; name: string; color?: string; category?: string }[]; postesTick: number; perms: typeof PERMS[AccessLevel] }) {
  type Row = { id?: string; name: string; role: string; subclass: string; phone: string; email: string; is_active: boolean; niveauAcces: string; succursale: string; next_evaluation_date: string };
  const empty = (): Row => ({ name: '', role: '', subclass: '', phone: '', email: '', is_active: true, niveauAcces: 'consultation', succursale: '', next_evaluation_date: '' });
  const [rows, setRows] = useState<Row[]>([]);
  const [siteTree, setSiteTree] = useState<{ id: string; name: string; depts: { id: string; name: string }[] }[]>([]);
  const postes = sharedPostes; // ← utilise les postes partagés par le parent (toujours frais)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [evalEmployee, setEvalEmployee] = useState<any | null>(null);
  // Gestion au volume : recherche par nom, filtre par site, date de réévaluation
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [genDate, setGenDate] = useState('');

  async function load() {
    setLoading(true);
    const [{ data: suc }, persRes] = await Promise.all([
      supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name'),
      supabase.from('planner_personnel').select('id, name, role, subclass, phone, email, is_active, niveauAcces, succursale, next_evaluation_date').eq('tenant_id', tenant).order('name'),
    ]);
    // Repli si la colonne next_evaluation_date n'existe pas encore
    let data: any[] | null = persRes.data;
    if (persRes.error && /next_evaluation_date/i.test(persRes.error.message || '')) {
      const r2 = await supabase.from('planner_personnel').select('id, name, role, subclass, phone, email, is_active, niveauAcces, succursale').eq('tenant_id', tenant).order('name');
      data = r2.data;
    }
    const allSites = (suc || []).filter((r: any) => !r.parent_id);
    const allDepts = (suc || []).filter((r: any) => r.parent_id);
    setSiteTree(allSites.map((s: any) => ({ id: s.id, name: s.name, depts: allDepts.filter((d: any) => d.parent_id === s.id) })));
    setRows((data || []).map((r: any) => ({ ...r, subclass: r.subclass || '', niveauAcces: r.niveauAcces || 'consultation', succursale: r.succursale || '', next_evaluation_date: r.next_evaluation_date || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  // Re-render auto quand les postes changent (postesTick incrémente)
  useEffect(() => { /* trigger re-render via closure */ }, [postesTick]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);
  // Lignes filtrées (index original conservé pour upd/del)
  const filtered = useMemo(() => rows.map((r, i) => ({ r, i })).filter(({ r }) => {
    const suc = r.succursale || '';
    if (siteFilter) {
      if (suc !== siteFilter && !suc.startsWith(siteFilter + ' /')) return false;
      if (deptFilter && suc !== `${siteFilter} / ${deptFilter}`) return false;
    }
    if (search.trim() && !(r.name || '').toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  }), [rows, search, siteFilter, deptFilter]);
  const filterSiteDepts = siteTree.find(s => s.name === siteFilter)?.depts || [];
  // Réévaluation générale : applique la date à toutes les lignes affichées
  const applyGenDate = () => { if (!genDate) return; const ids = new Set(filtered.map(f => f.i)); setRows(p => p.map((r, j) => ids.has(j) ? { ...r, next_evaluation_date: genDate } : r)); };

  async function save() {
    setSaving(true); setNotice(null);
    const debug: string[] = [];
    debug.push(`📋 Total lignes en mémoire : ${rows.length}`);
    const rowsToSave = rows.filter(r => r.name?.trim());
    debug.push(`✏️  Lignes avec nom non vide : ${rowsToSave.length}`);
    if (rowsToSave.length === 0) {
      setNotice(`⚠️ Aucune ligne à enregistrer. ${debug.join(' · ')}`);
      setSaving(false);
      return;
    }
    let ok = 0, err = 0; const errs: string[] = [];
    for (const r of rowsToSave) {
      const base: any = { tenant_id: tenant, name: r.name.trim(), role: r.role || null, phone: r.phone || null, email: r.email || null, is_active: r.is_active !== false };
      if (r.niveauAcces) base.niveauAcces = r.niveauAcces;
      if (r.succursale != null) base.succursale = r.succursale || null;
      if (r.subclass != null) base.subclass = r.subclass || null;
      base.next_evaluation_date = r.next_evaluation_date || null;

      console.log('[Personnel save] payload pour', r.name, ':', base, 'id existant ?', r.id);

      try {
        const exec = (payload: any) => r.id
          ? supabase.from('planner_personnel').update(payload).eq('id', r.id).select()
          : supabase.from('planner_personnel').insert(payload).select();
        let result = await exec(base);
        // Repli si la colonne next_evaluation_date n'existe pas (migration 071/082 non exécutée)
        if (result.error && /next_evaluation_date/i.test(result.error.message || '')) {
          const { next_evaluation_date, ...b2 } = base;
          result = await exec(b2);
        }
        console.log('[Personnel save] résultat pour', r.name, ':', result);
        if (result.error) throw result.error;
        if (!result.data || result.data.length === 0) {
          throw new Error('RLS a bloqué l\'opération (0 ligne retournée — vérifiez les policies)');
        }
        ok++;
      } catch (e: any) {
        const msg = String(e?.message || e?.details || e?.hint || '');
        console.error('[Personnel save] ERREUR pour', r.name, ':', e);
        err++; errs.push(`${r.name}: ${msg || 'erreur inconnue'}`);
      }
    }
    setNotice(`✓ ${ok} enregistré(s)${err ? ` · ✗ ${err} erreur(s)` : ''}${errs.length ? `\n${errs.slice(0, 4).join('\n')}` : ''}`);
    await load();
    setSaving(false);
  }

  // Bouton de diagnostic : insère une ligne test directement
  async function testDirectInsert() {
    setSaving(true); setNotice(null);
    const testRow = { tenant_id: tenant, name: `TEST ${new Date().toISOString().slice(11, 19)}`, is_active: true, niveauAcces: 'consultation' };
    console.log('[TEST] tentative insert :', testRow);
    const { data, error } = await supabase.from('planner_personnel').insert(testRow).select();
    console.log('[TEST] résultat :', { data, error });
    if (error) setNotice(`❌ TEST ÉCHEC : ${error.message}\nCode: ${error.code} · Détails: ${error.details || '—'} · Hint: ${error.hint || '—'}`);
    else if (!data || data.length === 0) setNotice(`❌ TEST BLOQUÉ : RLS a refusé silencieusement (vérifiez les policies de planner_personnel)`);
    else { setNotice(`✓ TEST RÉUSSI : ligne "${testRow.name}" insérée avec id ${data[0].id}`); await load(); }
    setSaving(false);
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_personnel').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Personnel du planificateur', 'Planner staff')}</h2>
          <p className="text-xs text-gray-500">{tr('Employés assignables aux chantiers.', 'Employees assignable to job sites.')} <span className="text-emerald-600 font-semibold">✓ {tr('Synchronisé avec le planificateur', 'Synced with planner')}</span></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowGuide(true)} className="inline-flex items-center gap-1 rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10">🔐 {tr('Guide des accès', 'Access guide')}</button>
          <button onClick={testDirectInsert} disabled={saving} className="inline-flex items-center gap-1 rounded-lg border border-orange-300 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:border-orange-500/40 dark:text-orange-300" title={tr('Diagnostic : insère une ligne de test directement', 'Diagnostic: inserts a test row directly')}>🧪 {tr('Test BD', 'Test DB')}</button>
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {/* Barre de filtres — gestion au volume */}
      <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 px-4 py-2 dark:border-gray-700">
        <div className="min-w-[10rem] flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr('🔍 Rechercher un nom…', '🔍 Search a name…')} className={inp} />
        </div>
        <select value={siteFilter} onChange={e => { setSiteFilter(e.target.value); setDeptFilter(''); }} className={`${inp} w-40`}>
          <option value="">{tr('Tous les sites', 'All sites')}</option>
          {siteTree.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} disabled={!siteFilter || filterSiteDepts.length === 0} className={`${inp} w-40 disabled:opacity-50`}>
          <option value="">{tr('Tous les dépts', 'All depts')}</option>
          {filterSiteDepts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <div className="flex items-end gap-1">
          <div>
            <label className="block text-[9px] uppercase font-bold text-gray-400">{tr('Réévaluation', 'Re-eval')}</label>
            <input type="date" value={genDate} onChange={e => setGenDate(e.target.value)} className={`${inp} w-36`} />
          </div>
          <button type="button" onClick={applyGenDate} disabled={!genDate} className="rounded-lg border border-blue-300 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:text-blue-300" title={tr('Applique la date à tous les employés affichés', 'Apply the date to all shown employees')}>{tr('Appliquer aux affichés', 'Apply to shown')}</button>
        </div>
        <span className="self-center text-[11px] text-gray-400">{filtered.length}/{rows.length}</span>
      </div>
      {/* Notice persistante en bandeau si erreur */}
      {notice && (
        <div className={`mx-4 mt-3 rounded-lg border-2 px-3 py-2 text-sm whitespace-pre-line font-medium ${
          notice.includes('✓') && !notice.includes('✗') && !notice.includes('❌')
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
            : notice.includes('❌') || notice.includes('✗')
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
              : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
        }`}>
          {notice}
        </div>
      )}
      {showGuide && <AccessGuideModal tr={tr} onClose={() => setShowGuide(false)} />}
      {postes.length === 0 && (
        <button type="button" onClick={goToPostes}
          className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20">
          {tr("💡 Créez des postes dans l'onglet « Ressources → Postes » pour les sélectionner ici. Cliquez ici pour y accéder →", '💡 Create positions in the "Resources → Positions" tab to select them here. Click here to go there →')}
        </button>
      )}
      {siteTree.length === 0 && (
        <div className="mx-4 mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          {tr("💡 Créez des sites/départements dans l'onglet « Sites/Dépts » pour assigner le personnel (optionnel).", '💡 Create sites/departments in the "Sites/Depts" tab to assign staff (optional).')}
        </div>
      )}
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="mobile-cards w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Poste / Sous-classe', 'Position / Sub-class')}</th>
            <th className="px-2">{tr('Site / Dépt', 'Site / Dept')}</th>
            {/* Évaluer sera ajouté avant Trash si perms.viewSalary */}
            <th className="px-2">{tr('Téléphone', 'Phone')}</th>
            <th className="px-2">{tr('Courriel', 'Email')}</th>
            <th className="px-2">{tr("Niveau d'accès", 'Access level')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            {perms.viewSalary && <th className="px-2">{tr('Salaire', 'Salary')}</th>}
            <th className="px-2">{tr('Prochaine éval', 'Next eval')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {filtered.map(({ r, i }) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1" data-label={tr('Nom *', 'Name *')}><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Prénom Nom', 'First Last')} /></td>
                <td className="px-2 mc-stack" data-label={tr('Poste / Sous-classe', 'Position / Sub-class')}>
                  {postes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <select className={`${inp} min-w-[130px]`} value={r.role || ''} onChange={e => { upd(i, 'role', e.target.value); upd(i, 'subclass', ''); }}>
                        <option value="">— {tr('Poste', 'Position')} —</option>
                        {postes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                      {(() => {
                        const currentPoste = postes.find(p => p.name === r.role);
                        const ids = currentPoste?.subclass_ids || [];
                        const availableSubs = ids.map(id => sharedSubclasses.find(s => s.id === id)).filter(Boolean) as { id: string; name: string; color?: string }[];
                        if (!r.role) return null;
                        if (availableSubs.length === 0) {
                          return <div className="text-[10px] text-gray-400 italic px-1">{tr('Aucune sous-classe appliquée à ce poste', 'No sub-class applied to this poste')}</div>;
                        }
                        const chosen = availableSubs.find(s => s.name === r.subclass);
                        return (
                          <AutocompleteInput
                            value={r.subclass || ''}
                            onChange={v => upd(i, 'subclass', v)}
                            suggestions={availableSubs.map(s => s.name)}
                            placeholder={tr(`Sous-classe (${availableSubs.length} dispo)`, `Sub-class (${availableSubs.length} avail)`)}
                            className="min-w-[130px]"
                          />
                        );
                      })()}
                    </div>
                  ) : (
                    <input className={`${inp} min-w-[130px]`} value={r.role || ''} onChange={e => upd(i, 'role', e.target.value)} placeholder={tr('Technicien', 'Technician')} />
                  )}
                </td>
                <td className="px-2 mc-stack" data-label={tr('Site / Dépt', 'Site / Dept')}>
                  {siteTree.length > 0 ? (
                    <select className={`${inp} min-w-[160px]`} value={r.succursale || ''} onChange={e => upd(i, 'succursale', e.target.value)}>
                      <option value="">— {tr('Aucun', 'None')} —</option>
                      {siteTree.map(site => (
                        site.depts.length > 0 ? (
                          <optgroup key={site.id} label={site.name}>
                            <option value={site.name}>{site.name} ({tr('site entier', 'whole site')})</option>
                            {site.depts.map(d => <option key={d.id} value={`${site.name} / ${d.name}`}>{d.name}</option>)}
                          </optgroup>
                        ) : (
                          <option key={site.id} value={site.name}>{site.name}</option>
                        )
                      ))}
                    </select>
                  ) : (
                    <input className={`${inp} min-w-[140px]`} value={r.succursale || ''} onChange={e => upd(i, 'succursale', e.target.value)} placeholder={tr('Site libre', 'Free text')} />
                  )}
                </td>
                <td className="px-2" data-label={tr('Téléphone', 'Phone')}><input className={`${inp} w-32`} value={r.phone || ''} onChange={e => upd(i, 'phone', e.target.value)} placeholder="514-555-0000" /></td>
                <td className="px-2" data-label={tr('Courriel', 'Email')}><input type="email" className={inp} value={r.email || ''} onChange={e => upd(i, 'email', e.target.value)} placeholder="nom@exemple.com" /></td>
                <td className="px-2" data-label={tr("Niveau d'accès", 'Access level')}>
                  <select className={`${inp} w-48`} value={r.niveauAcces || 'consultation'} onChange={e => upd(i, 'niveauAcces', e.target.value)}>
                    {ACCESS_LEVELS.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>{tr(lvl.label_fr, lvl.label_en)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 text-center sm:text-center" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                {perms.viewSalary && (
                  <td className="px-2" data-label={tr('Salaire', 'Salary')}>
                    {r.id && r.role
                      ? <button onClick={() => setEvalEmployee(r)} className="inline-flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-300" title={tr('Évaluation + salaire + compétences', 'Evaluation + salary + skills')}>📊 {tr('Évaluer', 'Evaluate')}</button>
                      : <span className="text-[10px] text-gray-400">—</span>}
                  </td>
                )}
                <td className="px-2" data-label={tr('Prochaine éval', 'Next eval')}><input type="date" className={`${inp} w-36`} value={r.next_evaluation_date || ''} onChange={e => upd(i, 'next_evaluation_date', e.target.value)} /></td>
                <td className="px-2 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={perms.viewSalary ? 10 : 9} className="px-2 py-6 text-center text-gray-400">{rows.length === 0 ? tr('Aucun membre du personnel. Ajoute-en un.', 'No staff yet. Add one.') : tr('Aucun résultat pour ce filtre.', 'No result for this filter.')}</td></tr>}
          </tbody>
        </table>
      </div>
      {evalEmployee && (
        <EmployeeEvaluationModal
          tenant={tenant} tr={tr}
          employee={evalEmployee}
          canEdit={perms.editSalary}
          onClose={() => setEvalEmployee(null)}
          onSaved={() => { setEvalEmployee(null); load(); }}
        />
      )}
    </div>
  );
}

function EquipementsPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  type Row = { id?: string; name: string; type: string; serial_number: string; is_active: boolean; succursale: string; photo_url: string };
  const empty = (): Row => ({ name: '', type: '', serial_number: '', is_active: true, succursale: '', photo_url: '' });
  const [rows, setRows] = useState<Row[]>([]);
  const [siteTree, setSiteTree] = useState<{ id: string; name: string; depts: { id: string; name: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  async function load() {
    setLoading(true);
    const { data: suc } = await supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name');
    const allSites = (suc || []).filter((r: any) => !r.parent_id);
    const allDepts = (suc || []).filter((r: any) => r.parent_id);
    setSiteTree(allSites.map((s: any) => ({ id: s.id, name: s.name, depts: allDepts.filter((d: any) => d.parent_id === s.id) })));
    // Tente avec succursale/photo_url (migration 080) ; repli sans
    let data: any[] | null = null;
    const r1 = await supabase.from('planner_equipements').select('id, name, type, serial_number, is_active, succursale, photo_url').eq('tenant_id', tenant).order('name');
    if (r1.error) { const r2 = await supabase.from('planner_equipements').select('id, name, type, serial_number, is_active').eq('tenant_id', tenant).order('name'); data = r2.data; }
    else data = r1.data;
    setRows((data || []).map((r: any) => ({ ...r, succursale: r.succursale || '', photo_url: r.photo_url || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);
  const filtered = useMemo(() => rows.map((r, i) => ({ r, i })).filter(({ r }) => {
    const suc = r.succursale || '';
    if (siteFilter) {
      if (suc !== siteFilter && !suc.startsWith(siteFilter + ' /')) return false;
      if (deptFilter && suc !== `${siteFilter} / ${deptFilter}`) return false;
    }
    if (search.trim() && ![r.name, r.type, r.serial_number].some(v => (v || '').toLowerCase().includes(search.trim().toLowerCase()))) return false;
    return true;
  }), [rows, search, siteFilter, deptFilter]);
  const filterSiteDepts = siteTree.find(s => s.name === siteFilter)?.depts || [];
  async function onPhoto(i: number, file: File) {
    try { const url = await uploadPhoto(file, tenant, supabase); upd(i, 'photo_url', url); } catch { /* ignore */ }
  }

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const strip = (p: any) => { const { succursale, photo_url, ...rest } = p; return rest; };
      const isMissing = (e: any) => /succursale|photo_url/i.test(e?.message || '');
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload: any = { tenant_id: tenant, name: r.name, type: r.type || null, serial_number: r.serial_number || null, is_active: r.is_active !== false, succursale: r.succursale || null, photo_url: r.photo_url || null };
        if (r.id) {
          let { error } = await supabase.from('planner_equipements').update(payload).eq('id', r.id);
          if (error && isMissing(error)) ({ error } = await supabase.from('planner_equipements').update(strip(payload)).eq('id', r.id));
          if (error) throw error;
        } else {
          let { error } = await supabase.from('planner_equipements').insert(payload);
          if (error && isMissing(error)) ({ error } = await supabase.from('planner_equipements').insert(strip(payload)));
          if (error) throw error;
        }
      }
      setNotice(tr('Équipements enregistrés ✓', 'Equipment saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('planner_equipements').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Équipements du planificateur', 'Planner equipment')}</h2>
          <p className="text-xs text-gray-500">{tr('Instruments et outils assignables aux chantiers.', 'Instruments and tools assignable to job sites.')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
        </div>
      </div>
      {/* Filtres — gestion au volume */}
      <div className="flex flex-wrap items-end gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-700">
        <div className="min-w-[10rem] flex-1"><input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr('🔍 Rechercher (nom, type, n° série)…', '🔍 Search (name, type, serial)…')} className={inp} /></div>
        <select value={siteFilter} onChange={e => { setSiteFilter(e.target.value); setDeptFilter(''); }} className={`${inp} w-40`}>
          <option value="">{tr('Tous les sites', 'All sites')}</option>
          {siteTree.map(site => <option key={site.id} value={site.name}>{site.name}</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} disabled={!siteFilter || filterSiteDepts.length === 0} className={`${inp} w-40 disabled:opacity-50`}>
          <option value="">{tr('Tous les dépts', 'All depts')}</option>
          {filterSiteDepts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <span className="self-center text-[11px] text-gray-400">{filtered.length}/{rows.length}</span>
      </div>
      {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
      <div className="overflow-x-auto p-2">
        <table className="mobile-cards w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5">{tr('Nom *', 'Name *')}</th>
            <th className="px-2">{tr('Type', 'Type')}</th>
            <th className="px-2">{tr('N° série / ID', 'Serial / ID')}</th>
            <th className="px-2">{tr('Site / Dépt', 'Site / Dept')}</th>
            <th className="px-2">{tr('Photo', 'Photo')}</th>
            <th className="px-2">{tr('Actif', 'Active')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {filtered.map(({ r, i }) => (
              <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-2 py-1" data-label={tr('Nom *', 'Name *')}><input className={inp} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('Mégohmmètre', 'Megohmmeter')} /></td>
                <td className="px-2" data-label={tr('Type', 'Type')}><input className={inp} value={r.type || ''} onChange={e => upd(i, 'type', e.target.value)} placeholder={tr('Analyseur', 'Analyzer')} /></td>
                <td className="px-2" data-label={tr('N° série / ID', 'Serial / ID')}><input className={`${inp} w-32`} value={r.serial_number || ''} onChange={e => upd(i, 'serial_number', e.target.value)} placeholder="SN-001" /></td>
                <td className="px-2" data-label={tr('Site / Dépt', 'Site / Dept')}>
                  <select className={`${inp} min-w-[150px]`} value={r.succursale || ''} onChange={e => upd(i, 'succursale', e.target.value)}>
                    <option value="">— {tr('Aucun', 'None')} —</option>
                    {siteTree.map(site => (
                      site.depts.length > 0 ? (
                        <optgroup key={site.id} label={site.name}>
                          <option value={site.name}>{site.name} ({tr('site entier', 'whole site')})</option>
                          {site.depts.map(d => <option key={d.id} value={`${site.name} / ${d.name}`}>{d.name}</option>)}
                        </optgroup>
                      ) : <option key={site.id} value={site.name}>{site.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2" data-label={tr('Photo', 'Photo')}>
                  <div className="flex items-center gap-1">
                    <label className="cursor-pointer rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700" title={tr('Ajouter une photo', 'Add photo')}>
                      📷
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onPhoto(i, f); e.target.value = ''; }} />
                    </label>
                    {r.photo_url && <img src={r.photo_url} alt="" className="h-7 w-7 rounded border border-gray-200 object-cover" />}
                  </div>
                </td>
                <td className="px-2 text-center" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.is_active !== false} onChange={e => upd(i, 'is_active', e.target.checked)} /></td>
                <td className="px-2 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-gray-400">{rows.length === 0 ? tr('Aucun équipement. Ajoute-en un.', 'No equipment yet. Add one.') : tr('Aucun résultat pour ce filtre.', 'No result for this filter.')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Types pour grilles salariales ──────────────────────────────────────────
type GridMode = 'percentage' | 'fixed' | 'custom';
type SkillReq = { name: string; level?: string };
// Prime / bonification discrétionnaire — octroyée à la discrétion de la direction
// EN PLUS du palier (unit 'fixed' = $/an, 'pct' = % du salaire annuel du palier).
type DiscretionaryBonus = { label: string; amount: number; unit: 'fixed' | 'pct' };
// ─── Formulaire d'évaluation des compétences (défini sur la grille du poste) ──
// Un type regroupe des compétences, porte une pondération globale (%) et un mode
// de notation : 'note' (échelle 0..max) ou 'pct' (saisie directe en %).
// Chaque compétence porte un poids (% d'impact dans la note de son type).
type SkillItem = { id: string; name: string; weight: number };
type SkillTypeDef = { id: string; name: string; weight: number; mode: 'note' | 'pct'; max: number; skills: SkillItem[] };
type SkillForm = { types: SkillTypeDef[] };
type TierRow = { id?: string; tier_level: number; tier_name: string; annual_salary: number; hourly_rate: number; required_skills: SkillReq[]; min_score?: number; min_months_experience: number; commission_pct?: number | null; notes?: string };
type GridRow = { id?: string; poste_id: string; name: string; mode: GridMode; base_salary: number; annual_increase_pct: number; annual_increase_fixed: number; years_plan: number; cola_pct: number; hours_per_year: number; use_skill_grid?: boolean; commission_enabled?: boolean; commission_pct?: number; commission_basis?: 'gross' | 'net' | 'margin' | 'custom'; commission_threshold?: number; commission_cap?: number | null; discretionary_bonuses?: DiscretionaryBonus[]; skill_form?: SkillForm; notes?: string };

// Génère un identifiant court côté client pour les types/compétences du formulaire.
const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10));

// Note globale pondérée (0..100) à partir du formulaire et des notes par compétence.
function computeSkillScore(form: SkillForm | undefined, scores: Record<string, number>): { global: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  const types = form?.types || [];
  let wSum = 0, wTot = 0;
  for (const t of types) {
    const sk = t.skills || [];
    if (sk.length === 0) { byType[t.id] = 0; continue; }
    // Note du type = moyenne PONDÉRÉE des compétences par leur poids.
    // Si aucun poids n'est défini, on retombe sur une moyenne simple.
    let acc = 0, swTot = 0;
    for (const s of sk) {
      const v = Number(scores[s.id] || 0);
      const ratio = t.mode === 'pct' ? Math.min(v, 100) / 100 : Math.min(v, t.max || 5) / (t.max || 5);
      const sw = Number(s.weight) > 0 ? Number(s.weight) : 1;
      acc += ratio * sw; swTot += sw;
    }
    const typeScore = swTot > 0 ? (acc / swTot) * 100 : 0; // 0..100
    byType[t.id] = typeScore;
    // Fallback : si aucun poids de type n'est défini, moyenne simple entre types.
    const w = Number(t.weight) > 0 ? Number(t.weight) : 1;
    wSum += typeScore * w; wTot += w;
  }
  return { global: wTot > 0 ? wSum / wTot : 0, byType };
}

// Palier atteint = le plus élevé dont le seuil min_score est ≤ note globale.
function tierForScore<T extends { min_score?: number; tier_level: number }>(tiers: T[], score: number): number {
  const sorted = [...tiers].sort((a, b) => a.tier_level - b.tier_level);
  let idx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (score >= (Number(sorted[i].min_score) || 0)) idx = i;
  }
  return idx;
}
type Subclass = { id: string; name: string; code?: string; color?: string; category?: string };
type PosteRow = { id?: string; name: string; code: string; color: string; subclass_ids?: string[] };

// Répartit 100 % équitablement entre les éléments (dernier absorbe l'arrondi).
function evenWeights<T extends { weight: number }>(items: T[]): T[] {
  const n = items.length;
  if (n === 0) return items;
  const base = Math.floor(100 / n);
  return items.map((x, i) => ({ ...x, weight: i === n - 1 ? 100 - base * (n - 1) : base }));
}
// Fixe un élément à `newVal` et redistribue le reste proportionnellement sur les
// autres pour que la somme reste TOUJOURS 100 %.
function rebalanceWeights<T extends { id: string; weight: number }>(items: T[], changedId: string, newVal: number): T[] {
  const v = Math.max(0, Math.min(100, Math.round(newVal)));
  const others = items.filter(x => x.id !== changedId);
  const remaining = 100 - v;
  const sumOthers = others.reduce((s, x) => s + (Number(x.weight) || 0), 0);
  let acc = 0;
  const out = items.map(x => {
    if (x.id === changedId) return { ...x, weight: v };
    const w = sumOthers > 0 ? (Number(x.weight) || 0) / sumOthers * remaining : remaining / others.length;
    return { ...x, weight: Math.round(w) };
  });
  // Corrige l'arrondi sur le premier "autre" pour garantir un total de 100.
  const total = out.reduce((s, x) => s + x.weight, 0);
  if (total !== 100 && others.length) {
    const firstOther = out.find(x => x.id !== changedId);
    if (firstOther) firstOther.weight += 100 - total;
  }
  return out;
}

function computeTiers(grid: GridRow, prev?: TierRow[]): TierRow[] {
  const tiers: TierRow[] = [];
  // Les paliers représentent les salaires de COMPÉTENCE (hors coût de la vie).
  // Le COLA n'est appliqué qu'UNE fois, lors de l'évaluation de l'employé, pour
  // éviter tout double comptage comptable.
  const hpy = grid.hours_per_year || 2080;
  const n = grid.years_plan || 5;
  const defaultNames = ['Entrée / Junior', 'Intermédiaire', 'Senior', 'Expert', 'Principal', 'Lead', 'Architecte'];
  for (let i = 0; i < n; i++) {
    let annual = grid.base_salary || 0;
    if (grid.mode === 'percentage') annual = annual * Math.pow(1 + (grid.annual_increase_pct || 0) / 100, i);
    else if (grid.mode === 'fixed')  annual = annual + i * (grid.annual_increase_fixed || 0);
    const p = prev?.[i]; // préserve les valeurs déjà éditées si on régénère
    tiers.push({
      tier_level: i,
      tier_name: p?.tier_name ?? (defaultNames[i] || `Palier ${i + 1}`),
      annual_salary: Math.round(annual * 100) / 100,
      hourly_rate: Math.round((annual / hpy) * 10000) / 10000,
      required_skills: p?.required_skills ?? [],
      // Seuil de note réparti uniformément par défaut (palier 0 = 0 %, dernier = 100 %)
      min_score: p?.min_score ?? Math.round((i / Math.max(n - 1, 1)) * 100),
      min_months_experience: p?.min_months_experience ?? (i === 0 ? 0 : 12),
      commission_pct: p?.commission_pct,
    });
  }
  return tiers;
}

function PosteSalaryGridPanel({ tenant, poste, tr, onClose, canEdit = true }: { tenant: string; poste: PosteRow; tr: (f: string, e: string) => string; onClose: () => void; canEdit?: boolean }) {
  const inp2 = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [grid, setGrid] = useState<GridRow | null>(null);
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Unité de saisie du salaire de base : annuel ($/an) ou horaire ($/h).
  // La valeur persistée reste toujours base_salary en $/an ; en mode horaire
  // on convertit via hours_per_year. Sélection de tout le contenu au focus.
  const [baseUnit, setBaseUnit] = useState<'annual' | 'hourly'>('annual');
  const [allPostes, setAllPostes] = useState<{ id: string; name: string }[]>([]); // autres postes (pour copier une grille)
  const selectOnFocus = (e: React.FocusEvent) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement && (t.type === 'number' || t.type === 'text')) t.select();
  };

  useEffect(() => {
    supabase.from('planner_postes').select('id, name').eq('tenant_id', tenant).neq('id', poste.id!).order('name')
      .then(({ data }) => setAllPostes((data || []).filter((p: any) => p.name)));
  }, [tenant, poste.id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: g }, { data: t }] = await Promise.all([
        supabase.from('poste_salary_grids').select('*').eq('tenant_id', tenant).eq('poste_id', poste.id!).maybeSingle(),
        supabase.from('poste_salary_tiers').select('*').eq('tenant_id', tenant).order('tier_level'),
      ]);
      const defaultGrid: GridRow = { poste_id: poste.id!, name: 'Grille standard', mode: 'percentage', base_salary: 50000, annual_increase_pct: 3, annual_increase_fixed: 1500, years_plan: 5, cola_pct: 0, hours_per_year: 2080, use_skill_grid: true, commission_enabled: false, commission_pct: 0, commission_basis: 'gross', commission_threshold: 0, commission_cap: null, discretionary_bonuses: [], skill_form: { types: [] } };
      // Normalise le formulaire (poids de compétence par défaut pour les anciennes données)
      const normForm = (sf: any): SkillForm => (sf && Array.isArray(sf.types))
        ? { types: sf.types.map((t: any) => ({ ...t, skills: (t.skills || []).map((s: any) => ({ weight: 1, ...s })) })) }
        : { types: [] };
      if (g) {
        setGrid({ ...defaultGrid, ...g, use_skill_grid: (g as any).use_skill_grid !== false, discretionary_bonuses: (g as any).discretionary_bonuses || [], skill_form: normForm((g as any).skill_form) });
        const ts = (t || []).filter((x: any) => x.grid_id === g.id).map((x: any) => ({ ...x, required_skills: x.required_skills || [] }));
        setTiers(ts.length ? ts : computeTiers({ ...defaultGrid, ...g }));
      } else {
        setGrid(defaultGrid);
        setTiers(computeTiers(defaultGrid));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poste.id, tenant]);

  // Copie la grille + compétences d'un autre poste (applique au poste courant, sans enregistrer).
  async function copyFromPoste(srcId: string) {
    if (!srcId) return;
    const { data: g } = await supabase.from('poste_salary_grids').select('*').eq('tenant_id', tenant).eq('poste_id', srcId).maybeSingle();
    if (!g) { setNotice(tr('Ce poste n\'a pas encore de grille.', 'This position has no grid yet.')); return; }
    const { data: ts } = await supabase.from('poste_salary_tiers').select('*').eq('grid_id', (g as any).id).order('tier_level');
    const sf = (g as any).skill_form;
    setGrid(cur => cur ? {
      ...cur, // conserve id / poste_id / name du poste COURANT
      mode: g.mode, base_salary: g.base_salary, annual_increase_pct: g.annual_increase_pct, annual_increase_fixed: g.annual_increase_fixed,
      years_plan: g.years_plan, cola_pct: g.cola_pct, hours_per_year: g.hours_per_year, use_skill_grid: (g as any).use_skill_grid !== false,
      commission_enabled: g.commission_enabled, commission_pct: g.commission_pct, commission_basis: g.commission_basis, commission_threshold: g.commission_threshold, commission_cap: g.commission_cap,
      discretionary_bonuses: (g as any).discretionary_bonuses || [],
      skill_form: sf && Array.isArray(sf.types) ? sf : { types: [] },
    } : cur);
    setTiers((ts || []).map((t: any) => ({ ...t, id: undefined, grid_id: undefined, required_skills: t.required_skills || [] })));
    setNotice(tr('Grille + compétences copiées — ajustez puis Enregistrer.', 'Grid + skills copied — adjust then Save.'));
  }

  function updGrid<K extends keyof GridRow>(k: K, v: GridRow[K]) {
    setGrid(g => {
      if (!g) return g;
      const ng = { ...g, [k]: v };
      // Recalcul auto si pas en mode custom (en préservant les valeurs éditées)
      if (ng.mode !== 'custom') setTiers(prev => computeTiers(ng, prev));
      return ng;
    });
  }

  function updTier(i: number, k: keyof TierRow, v: any) {
    setTiers(p => p.map((t, j) => {
      if (j !== i) return t;
      const nt = { ...t, [k]: v };
      if (k === 'annual_salary' && grid) nt.hourly_rate = Math.round((Number(v) / (grid.hours_per_year || 2080)) * 10000) / 10000;
      return nt;
    }));
  }

  function addTier() {
    setTiers(p => {
      const last = p[p.length - 1];
      return [...p, { tier_level: p.length, tier_name: `Palier ${p.length + 1}`, annual_salary: last?.annual_salary || 50000, hourly_rate: last?.hourly_rate || 24, required_skills: [], min_score: 100, min_months_experience: 12 }];
    });
  }
  function delTier(i: number) { setTiers(p => p.filter((_, j) => j !== i).map((t, j) => ({ ...t, tier_level: j }))); }

  // Primes discrétionnaires — mutation directe (pas de recalcul des paliers).
  const mutateBonuses = (fn: (b: DiscretionaryBonus[]) => DiscretionaryBonus[]) =>
    setGrid(g => g ? { ...g, discretionary_bonuses: fn(g.discretionary_bonuses || []) } : g);
  const addBonus = () => mutateBonuses(b => [...b, { label: `${tr('Prime', 'Bonus')} ${b.length + 1}`, amount: 0, unit: 'fixed' }]);
  const updBonus = (idx: number, k: keyof DiscretionaryBonus, v: any) => mutateBonuses(b => b.map((x, j) => j === idx ? { ...x, [k]: v } : x));
  const delBonus = (idx: number) => mutateBonuses(b => b.filter((_, j) => j !== idx));

  // Formulaire de compétences (types pondérés) — mutation directe sur la grille.
  const mutateForm = (fn: (f: SkillForm) => SkillForm) =>
    setGrid(g => g ? { ...g, skill_form: fn(g.skill_form || { types: [] }) } : g);
  // Types : poids auto-équilibrés à 100 % (ajout/suppression = réparti équitable ; édition manuelle = redistribution proportionnelle).
  const addSkillType = () => mutateForm(f => ({ types: evenWeights([...f.types, { id: uid(), name: `${tr('Type', 'Type')} ${f.types.length + 1}`, weight: 0, mode: 'note', max: 5, skills: [] }]) }));
  const updSkillType = (id: string, k: keyof SkillTypeDef, v: any) => mutateForm(f =>
    k === 'weight' ? ({ types: rebalanceWeights(f.types, id, Number(v)) }) : ({ types: f.types.map(t => t.id === id ? { ...t, [k]: v } : t) }));
  const delSkillType = (id: string) => mutateForm(f => ({ types: evenWeights(f.types.filter(t => t.id !== id)) }));
  // Compétences : même logique d'auto-équilibrage à l'intérieur de leur type.
  const addSkillItem = (typeId: string) => mutateForm(f => ({ types: f.types.map(t => t.id === typeId ? { ...t, skills: evenWeights([...t.skills, { id: uid(), name: '', weight: 0 }]) } : t) }));
  const updSkillItem = (typeId: string, sid: string, k: keyof SkillItem, v: any) => mutateForm(f => ({ types: f.types.map(t => {
    if (t.id !== typeId) return t;
    return k === 'weight' ? { ...t, skills: rebalanceWeights(t.skills, sid, Number(v)) } : { ...t, skills: t.skills.map(s => s.id === sid ? { ...s, [k]: v } : s) };
  }) }));
  const delSkillItem = (typeId: string, sid: string) => mutateForm(f => ({ types: f.types.map(t => t.id === typeId ? { ...t, skills: evenWeights(t.skills.filter(s => s.id !== sid)) } : t) }));

  // Export PDF de la fiche de poste complète.
  async function exportPdf() {
    if (!grid) return;
    const { data: t } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle();
    const { exportPostePdf } = await import('@/lib/salaryPdf');
    await exportPostePdf({
      tr, dateStr: new Date().toLocaleDateString('fr-CA'), posteName: poste.name, logoUrl: t?.logo_url || undefined,
      grid, tiers: grid.use_skill_grid === false ? [] : tiers,
      skillForm: grid.use_skill_grid === false ? null : (grid.skill_form || { types: [] }),
      bonuses: grid.discretionary_bonuses || [],
    });
  }

  async function save() {
    if (!grid) return;
    setSaving(true); setNotice(null);
    try {
      const gridPayload: any = { tenant_id: tenant, poste_id: poste.id, name: grid.name, mode: grid.mode, base_salary: grid.base_salary, annual_increase_pct: grid.annual_increase_pct, annual_increase_fixed: grid.annual_increase_fixed, years_plan: grid.years_plan, cola_pct: grid.cola_pct, hours_per_year: grid.hours_per_year, use_skill_grid: grid.use_skill_grid !== false, commission_enabled: !!grid.commission_enabled, commission_pct: grid.commission_pct || 0, commission_basis: grid.commission_basis || 'gross', commission_threshold: grid.commission_threshold || 0, commission_cap: grid.commission_cap ?? null, discretionary_bonuses: grid.discretionary_bonuses || [], skill_form: grid.skill_form || { types: [] }, notes: grid.notes || null, updated_at: new Date().toISOString() };
      let gridId = grid.id;
      // Sauvegarde tolérante : si une colonne récente (discretionary_bonuses /
      // skill_form / use_skill_grid, migrations 074-076) n'existe pas encore, on réessaie sans.
      const isMissingCol = (e: any) => /discretionary_bonuses|skill_form|use_skill_grid/i.test(e?.message || '') || e?.code === 'PGRST204';
      const stripNew = (p: any) => { const { discretionary_bonuses, skill_form, use_skill_grid, ...rest } = p; return rest; };
      if (grid.id) {
        let { error } = await supabase.from('poste_salary_grids').update(gridPayload).eq('id', grid.id);
        if (error && isMissingCol(error)) ({ error } = await supabase.from('poste_salary_grids').update(stripNew(gridPayload)).eq('id', grid.id));
        if (error) throw error;
      } else {
        let { data, error } = await supabase.from('poste_salary_grids').insert(gridPayload).select('id').single();
        if (error && isMissingCol(error)) ({ data, error } = await supabase.from('poste_salary_grids').insert(stripNew(gridPayload)).select('id').single());
        if (error) throw error;
        if (!data) throw new Error('Insertion de la grille échouée');
        gridId = data.id;
        setGrid(g => g ? { ...g, id: gridId } : g);
      }
      // Tiers : delete all then re-insert (avec fallback si min_score absent)
      await supabase.from('poste_salary_tiers').delete().eq('grid_id', gridId);
      let skipMinScore = false;
      for (const t of tiers) {
        const base: any = { tenant_id: tenant, grid_id: gridId, tier_level: t.tier_level, tier_name: t.tier_name, annual_salary: t.annual_salary, hourly_rate: t.hourly_rate, required_skills: t.required_skills, min_months_experience: t.min_months_experience, commission_pct: t.commission_pct ?? null, sort_order: t.tier_level, notes: t.notes || null };
        const payload = skipMinScore ? base : { ...base, min_score: t.min_score ?? 0 };
        let { error } = await supabase.from('poste_salary_tiers').insert(payload);
        if (error && /min_score/i.test(error.message || '')) { skipMinScore = true; ({ error } = await supabase.from('poste_salary_tiers').insert(base)); }
        if (error) throw error;
      }
      setNotice(tr('Grille enregistrée ✓', 'Grid saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  if (loading || !grid) return <div className="bg-gray-50 dark:bg-gray-900/40 p-4 text-center"><Loader2 className="inline animate-spin text-gray-400" /></div>;

  const skillTypes = grid.skill_form?.types || [];
  const weightTotal = skillTypes.reduce((s, t) => s + (Number(t.weight) || 0), 0);

  return (
    <div className="bg-blue-50/40 dark:bg-blue-900/10 border-t border-blue-200 dark:border-blue-700" onFocus={selectOnFocus}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded shrink-0" style={{ background: poste.color }} />
            <h3 className="font-bold text-sm">{tr('Grille salariale — ', 'Salary grid — ')}<span className="text-blue-600 dark:text-blue-400">{poste.name}</span></h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && allPostes.length > 0 && (
              <select onChange={e => { copyFromPoste(e.target.value); e.target.value = ''; }} defaultValue="" className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200" title={tr("Copier la grille + compétences d'un autre poste", 'Copy grid + skills from another position')}>
                <option value="">⧉ {tr('Copier de…', 'Copy from…')}</option>
                {allPostes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <button onClick={exportPdf} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" title={tr('Exporter la fiche de poste en PDF', 'Export position sheet to PDF')}>
              <ExternalLink size={14} /> {tr('Export PDF', 'Export PDF')}
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {tr('Enregistrer', 'Save')}
            </button>
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">{tr('Fermer', 'Close')}</button>
          </div>
        </div>
        {notice && <div className={`rounded-lg px-3 py-2 text-sm ${notice.includes('✓') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{notice}</div>}

        {/* Config grille */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Nom de la grille', 'Grid name')}</label>
            <input className={inp2} value={grid.name} onChange={e => updGrid('name', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Mode', 'Mode')}</label>
            <select className={inp2} value={grid.mode} onChange={e => updGrid('mode', e.target.value as GridMode)}>
              <option value="percentage">{tr('% annuel sur plan', '% annual on plan')}</option>
              <option value="fixed">{tr('Augmentation $ fixe', 'Fixed $ increase')}</option>
              <option value="custom">{tr('Personnalisé', 'Custom')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <span>{baseUnit === 'annual' ? tr('Salaire de base $ /an', 'Base salary $/yr') : tr('Salaire de base $ /h', 'Base salary $/hr')}</span>
              <span className="inline-flex overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
                {([['annual', tr('$/an', '$/yr')], ['hourly', tr('$/h', '$/hr')]] as const).map(([u, lbl]) => (
                  <button key={u} type="button" onClick={() => setBaseUnit(u)}
                    className={`px-2 py-0.5 text-[10px] font-bold transition ${baseUnit === u ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                    {lbl}
                  </button>
                ))}
              </span>
            </label>
            {baseUnit === 'annual' ? (
              <input type="number" className={inp2} value={grid.base_salary} onChange={e => updGrid('base_salary', Number(e.target.value))} />
            ) : (
              <>
                <input type="number" step={0.01} className={inp2}
                  value={Math.round((grid.base_salary / (grid.hours_per_year || 2080)) * 100) / 100}
                  onChange={e => updGrid('base_salary', Math.round(Number(e.target.value) * (grid.hours_per_year || 2080)))} />
                <p className="mt-0.5 text-[10px] text-gray-400">≈ {money(grid.base_salary)} /{tr('an', 'yr')} ({grid.hours_per_year || 2080} {tr('h/an', 'h/yr')})</p>
              </>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Plan sur (années)', 'Plan over (years)')}</label>
            <input type="number" min={1} max={15} className={inp2} value={grid.years_plan} onChange={e => updGrid('years_plan', Number(e.target.value))} />
          </div>
          {grid.mode === 'percentage' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('% augmentation/an', '% increase/yr')}</label>
              <div className="flex items-center gap-1">
                <input type="number" step={0.1} className={inp2} value={grid.annual_increase_pct} onChange={e => updGrid('annual_increase_pct', Number(e.target.value))} />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>
          )}
          {grid.mode === 'fixed' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('$ augmentation/an', '$ increase/yr')}</label>
              <input type="number" className={inp2} value={grid.annual_increase_fixed} onChange={e => updGrid('annual_increase_fixed', Number(e.target.value))} />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              {tr('Ajustement coût de la vie %', 'Cost of living %')}
              <span className="ml-1 text-[10px] text-gray-400 font-normal">{tr('(appliqué à tous)', '(applied to all)')}</span>
            </label>
            <input type="number" step={0.1} className={inp2} value={grid.cola_pct} onChange={e => updGrid('cola_pct', Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Heures /an (pour taux $/h)', 'Hours/yr (for hourly)')}</label>
            <input type="number" className={inp2} value={grid.hours_per_year} onChange={e => updGrid('hours_per_year', Number(e.target.value))} />
          </div>
        </div>

        {/* Mode : grille par compétences ou salaire fixe */}
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <span className="text-sm font-semibold">{tr('Grille par compétences', 'Skill-based grid')}</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{tr('Activé : paliers de progression + évaluation des compétences. Désactivé : salaire fixe (base + coût de la vie + primes seulement).', 'On: progression tiers + skill evaluation. Off: fixed salary (base + COLA + bonuses only).')}</p>
          </div>
          <input type="checkbox" disabled={!canEdit} checked={grid.use_skill_grid !== false} onChange={e => updGrid('use_skill_grid', e.target.checked)} className="h-5 w-5 shrink-0" />
        </label>

        {grid.use_skill_grid !== false && (
        /* Tableau des paliers */
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-500" />
              {tr('Paliers de progression', 'Progression tiers')}
              <span className="text-xs text-gray-400 font-normal">({tiers.length})</span>
            </h4>
            {grid.mode === 'custom' && (
              <button onClick={addTier} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                <Plus size={12} /> {tr('Palier', 'Tier')}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="mobile-cards w-full text-xs">
              <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-2 py-1.5 w-8">#</th>
                <th className="px-2">{tr('Palier', 'Tier name')}</th>
                <th className="px-2 text-right">{tr('Salaire annuel $', 'Annual salary $')}</th>
                <th className="px-2 text-right">{tr('Taux $/h', 'Hourly $')}</th>
                <th className="px-2">{tr('Min. mois exp.', 'Min. months exp.')}</th>
                {grid.commission_enabled && <th className="px-2 text-right">{tr('Comm. %', 'Comm. %')}</th>}
                <th className="px-2 text-right">{tr('Note min (%)', 'Min score (%)')}</th>
                {grid.mode === 'custom' && <th></th>}
              </tr></thead>
              <tbody>
                {tiers.map((t, i) => (
                  <tr key={i} className="border-t border-gray-50 dark:border-gray-700/50 align-top">
                    <td className="px-2 py-1.5 font-mono text-gray-400" data-label="#">{t.tier_level}</td>
                    <td className="px-2" data-label={tr('Palier', 'Tier name')}>
                      <input className={`${inp2} text-xs`} value={t.tier_name} onChange={e => updTier(i, 'tier_name', e.target.value)} />
                    </td>
                    <td className="px-2" data-label={tr('Salaire annuel $', 'Annual salary $')}>
                      <input type="number" disabled={grid.mode !== 'custom'} className={`${inp2} text-xs text-right ${grid.mode !== 'custom' ? 'opacity-60' : ''}`} value={t.annual_salary} onChange={e => updTier(i, 'annual_salary', Number(e.target.value))} />
                    </td>
                    <td className="px-2 text-right text-emerald-600 dark:text-emerald-400 font-semibold" data-label={tr('Taux $/h', 'Hourly $')}>{t.hourly_rate.toFixed(2)} $</td>
                    <td className="px-2" data-label={tr('Min. mois exp.', 'Min. months exp.')}>
                      <input type="number" min={0} className={`${inp2} w-16 text-xs text-center`} value={t.min_months_experience} onChange={e => updTier(i, 'min_months_experience', Number(e.target.value))} />
                    </td>
                    {grid.commission_enabled && (
                      <td className="px-2" data-label={tr('Comm. %', 'Comm. %')}>
                        <input type="number" step={0.1} min={0} max={100} className={`${inp2} w-16 text-xs text-right`} value={t.commission_pct ?? ''} placeholder={String(grid.commission_pct || 0)} onChange={e => updTier(i, 'commission_pct', e.target.value === '' ? null : Number(e.target.value))} />
                      </td>
                    )}
                    <td className="px-2 text-right" data-label={tr('Note min (%)', 'Min score (%)')}>
                      <input type="number" min={0} max={100} disabled={!canEdit} className={`${inp2} w-16 text-xs text-right`} value={t.min_score ?? 0} onChange={e => updTier(i, 'min_score', Number(e.target.value))} />
                    </td>
                    {grid.mode === 'custom' && (
                      <td className="px-2 text-right sm:text-left"><button onClick={() => delTier(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Section Primes discrétionnaires */}
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 dark:border-violet-500/30 dark:bg-violet-500/5 p-3">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
                🎁 {tr('Primes discrétionnaires', 'Discretionary bonuses')}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xl">
                {tr("Bonifications optionnelles, octroyées à la discrétion de la direction EN PLUS du palier. Ex. : un employé « Niveau 2 » peut recevoir « Prime 1 ».", "Optional bonuses, granted at management's discretion ON TOP of the tier. E.g. a “Level 2” employee can receive “Bonus 1”.")}
              </p>
            </div>
            {canEdit && (
              <button onClick={addBonus} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-violet-300 px-2.5 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-100 dark:border-violet-500/40 dark:text-violet-300 dark:hover:bg-violet-500/10">
                <Plus size={13} /> {tr('Prime', 'Bonus')}
              </button>
            )}
          </div>
          {(grid.discretionary_bonuses || []).length === 0 ? (
            <p className="text-[11px] italic text-gray-400">{tr('Aucune prime définie. Cliquez « + Prime » pour en ajouter une.', 'No bonus defined. Click "+ Bonus" to add one.')}</p>
          ) : (
            <div className="space-y-2">
              {(grid.discretionary_bonuses || []).map((b, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[8rem] flex-1">
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Nom de la prime', 'Bonus name')}</label>
                    <input className={inp2} value={b.label} disabled={!canEdit} placeholder={tr('Ex : Prime 1, Prime rendement', 'E.g. Bonus 1, Performance')} onChange={e => updBonus(idx, 'label', e.target.value)} />
                  </div>
                  <div className="w-28">
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Montant', 'Amount')}</label>
                    <input type="number" step={b.unit === 'pct' ? 0.1 : 100} min={0} disabled={!canEdit} className={inp2} value={b.amount} onChange={e => updBonus(idx, 'amount', Number(e.target.value))} />
                  </div>
                  <div className="w-28">
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Unité', 'Unit')}</label>
                    <select className={inp2} value={b.unit} disabled={!canEdit} onChange={e => updBonus(idx, 'unit', e.target.value as 'fixed' | 'pct')}>
                      <option value="fixed">{tr('$ /an', '$/yr')}</option>
                      <option value="pct">% {tr('salaire', 'salary')}</option>
                    </select>
                  </div>
                  <div className="pb-1.5 text-[11px] font-semibold text-violet-600 dark:text-violet-300 whitespace-nowrap">
                    {b.unit === 'pct' ? `≈ ${money((grid.base_salary || 0) * (b.amount || 0) / 100)}` : money(b.amount || 0)}
                  </div>
                  {canEdit && (
                    <button onClick={() => delBonus(idx)} className="pb-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Commission sur ventes */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
              💰 {tr('Commission sur ventes', 'Sales commission')}
            </h4>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={!!grid.commission_enabled} onChange={e => updGrid('commission_enabled', e.target.checked)} />
              {tr('Applicable à ce poste', 'Applicable to this position')}
            </label>
          </div>
          {grid.commission_enabled && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('% par défaut', 'Default %')}</label>
                <div className="flex items-center gap-1">
                  <input type="number" step={0.1} min={0} max={100} className={inp2} value={grid.commission_pct || 0} onChange={e => updGrid('commission_pct', Number(e.target.value))} />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Base de calcul', 'Calculation basis')}</label>
                <select className={inp2} value={grid.commission_basis || 'gross'} onChange={e => updGrid('commission_basis', e.target.value as any)}>
                  <option value="gross">{tr('Chiffre d\'affaires (CA brut)', 'Gross revenue')}</option>
                  <option value="net">{tr('Net (après dépenses)', 'Net (after expenses)')}</option>
                  <option value="margin">{tr('Marge bénéficiaire', 'Profit margin')}</option>
                  <option value="custom">{tr('Personnalisée', 'Custom')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Seuil min. $ (optionnel)', 'Min threshold $ (optional)')}</label>
                <input type="number" min={0} className={inp2} value={grid.commission_threshold || 0} onChange={e => updGrid('commission_threshold', Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Plafond annuel $ (optionnel)', 'Annual cap $ (optional)')}</label>
                <input type="number" min={0} className={inp2} value={grid.commission_cap || ''} onChange={e => updGrid('commission_cap', e.target.value ? Number(e.target.value) : null)} placeholder={tr('Aucun', 'None')} />
              </div>
              <div className="md:col-span-2 lg:col-span-4 text-[10px] text-amber-700 dark:text-amber-400 italic">
                💡 {tr('Chaque palier peut avoir son propre % (colonne "Comm. %" du tableau). Si vide, le % par défaut s\'applique.', 'Each tier can have its own % (column "Comm. %" in the table). If empty, the default % applies.')}
              </div>
            </div>
          )}
        </div>

        {/* Section Formulaire d'évaluation des compétences (en bas) */}
        {grid.use_skill_grid !== false && (
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 dark:border-purple-500/30 dark:bg-purple-500/5 p-3">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                <Award size={14} /> {tr("Formulaire d'évaluation des compétences", 'Skill evaluation form')}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-2xl">
                {tr("Chaque type a un % d'impact sur la note globale ; chaque compétence a un % d'impact dans son type. La note globale détermine automatiquement le palier (seuil « Note min »).", "Each type has a % impact on the global score; each skill has a % impact within its type. The global score automatically determines the tier (“Min score” threshold).")}
              </p>
            </div>
            {canEdit && (
              <button onClick={addSkillType} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-purple-300 px-2.5 py-1 text-xs font-semibold text-purple-600 hover:bg-purple-100 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10">
                <Plus size={13} /> {tr('Type', 'Type')}
              </button>
            )}
          </div>

          {skillTypes.length > 0 && (
            <div className={`mb-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${weightTotal === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
              {tr('Somme des pondérations de type', 'Total type weighting')} : {weightTotal}%
              {weightTotal !== 100 && <span className="font-normal">— {tr('devrait totaliser 100 %', 'should total 100%')}</span>}
            </div>
          )}

          {skillTypes.length === 0 ? (
            <p className="text-[11px] italic text-gray-400">{tr('Aucun type. Cliquez « + Type » pour créer le formulaire (ex. Technique, Sécurité, Gestion).', 'No type. Click "+ Type" to build the form (e.g. Technical, Safety, Management).')}</p>
          ) : (
            <div className="space-y-2">
              {skillTypes.map(type => {
                const skillWTotal = (type.skills || []).reduce((acc, x) => acc + (Number(x.weight) || 0), 0);
                return (
                <div key={type.id} className="space-y-2 rounded-lg border border-purple-200 bg-white p-2.5 dark:border-purple-500/20 dark:bg-gray-800">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[9rem] flex-1">
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Type de compétence', 'Skill type')}</label>
                      <input className={inp2} value={type.name} disabled={!canEdit} placeholder={tr('Ex : Technique', 'E.g. Technical')} onChange={e => updSkillType(type.id, 'name', e.target.value)} />
                    </div>
                    <div className="w-28">
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Notation', 'Scoring')}</label>
                      <select className={inp2} value={type.mode} disabled={!canEdit} onChange={e => updSkillType(type.id, 'mode', e.target.value as 'note' | 'pct')}>
                        <option value="note">{tr('Note /N', 'Score /N')}</option>
                        <option value="pct">%</option>
                      </select>
                    </div>
                    {type.mode === 'note' && (
                      <div className="w-20">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Sur', 'Out of')}</label>
                        <input type="number" min={1} max={100} className={inp2} value={type.max} disabled={!canEdit} onChange={e => updSkillType(type.id, 'max', Number(e.target.value) || 5)} />
                      </div>
                    )}
                    <div className="w-24">
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Poids du type', 'Type weight')}</label>
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={100} className={inp2} value={type.weight} disabled={!canEdit} onChange={e => updSkillType(type.id, 'weight', Number(e.target.value))} />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    </div>
                    {canEdit && (
                      <button onClick={() => delSkillType(type.id)} className="pb-1.5 text-gray-400 hover:text-red-600" title={tr('Supprimer le type', 'Delete type')}><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="space-y-1.5 border-l-2 border-purple-200 pl-2.5 dark:border-purple-500/30">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase text-gray-400">
                      <span>{tr('Compétences (poids = % dans le type)', 'Skills (weight = % within type)')}</span>
                      {type.skills.length > 0 && <span className={skillWTotal === 100 ? 'text-emerald-600' : 'text-amber-600'}>Σ {skillWTotal}%</span>}
                    </div>
                    {type.skills.length === 0 && <p className="text-[10px] italic text-gray-400">{tr('Aucune compétence dans ce type.', 'No skill in this type.')}</p>}
                    {type.skills.map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <Award size={11} className="shrink-0 text-purple-400" />
                        <input className={`${inp2} text-xs`} value={s.name} disabled={!canEdit} placeholder={tr('Nom de la compétence', 'Skill name')} onChange={e => updSkillItem(type.id, s.id, 'name', e.target.value)} />
                        <div className="flex w-20 shrink-0 items-center gap-0.5">
                          <input type="number" min={0} max={100} className={`${inp2} text-xs text-right`} value={s.weight ?? 0} disabled={!canEdit} title={tr('% d\'impact dans le type', '% impact within type')} onChange={e => updSkillItem(type.id, s.id, 'weight', Number(e.target.value))} />
                          <span className="text-[10px] text-gray-400">%</span>
                        </div>
                        {canEdit && <button onClick={() => delSkillItem(type.id, s.id)} className="shrink-0 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>}
                      </div>
                    ))}
                    {canEdit && (
                      <button onClick={() => addSkillItem(type.id)} className="inline-flex items-center gap-1 rounded-md border border-dashed border-purple-300 px-2 py-0.5 text-[10px] font-semibold text-purple-600 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10">
                        <Plus size={11} /> {tr('Compétence', 'Skill')}
                      </button>
                    )}
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function PostesPlanner({ tenant, tr, inp, onPostesChanged, sharedSubclasses, goToSubclasses, perms }: { tenant: string; tr: (f: string, e: string) => string; inp: string; onPostesChanged?: () => void; sharedSubclasses: { id: string; name: string; color?: string; category?: string }[]; goToSubclasses: () => void; perms: typeof PERMS[AccessLevel] }) {
  const empty = (): PosteRow => ({ name: '', code: '', color: '#6b7280', subclass_ids: [] });
  const [subPickerFor, setSubPickerFor] = useState<number | null>(null);
  const [subSearch, setSubSearch] = useState('');
  const [rows, setRows] = useState<PosteRow[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Palette de couleurs cyclique pour bulk-create
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('planner_postes').select('id, name, code, color, subclass_ids').eq('tenant_id', tenant).order('name').range(0, 999);
    if (error) setNotice('Erreur chargement : ' + error.message);
    setRows((data || []).map((r: any) => ({ ...r, subclass_ids: Array.isArray(r.subclass_ids) ? r.subclass_ids : [] })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof PosteRow, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, empty()]);
  const addBatch = (n: number) => setRows(p => {
    const start = p.length;
    return [...p, ...Array.from({ length: n }, (_, i) => ({ ...empty(), color: COLORS[(start + i) % COLORS.length], subclass_ids: [] }))];
  });

  async function save() {
    setSaving(true); setNotice(null);
    let okCount = 0, skipCount = 0, errCount = 0;
    const errors: string[] = [];
    const inserted: { tempIdx: number; data: any }[] = [];
    // Traitement séquentiel mais tolérant : un échec n'arrête pas la boucle
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.name?.trim()) { skipCount++; continue; }
      const payload = { tenant_id: tenant, name: r.name.trim(), code: r.code?.trim() || null, color: r.color || '#6b7280', subclass_ids: r.subclass_ids || [] };
      try {
        if (r.id) {
          const { error } = await supabase.from('planner_postes').update(payload).eq('id', r.id);
          if (error) throw error;
          okCount++;
        } else {
          const { data, error } = await supabase.from('planner_postes').insert(payload).select('id').single();
          if (error) throw error;
          okCount++;
          if (data?.id) inserted.push({ tempIdx: i, data });
        }
      } catch (e: any) {
        errCount++;
        errors.push(`${r.name}: ${e?.message || 'erreur'}`);
      }
    }
    const msg = `${okCount} ${tr('enregistré(s)', 'saved')}${skipCount ? `, ${skipCount} ${tr('vide(s) ignoré(s)', 'empty skipped')}` : ''}${errCount ? `, ${errCount} ${tr('erreur(s)', 'errors')}` : ''} ${errCount === 0 ? '✓' : ''}`;
    setNotice(errCount === 0 ? msg : `${msg}\n${errors.slice(0, 3).join(' · ')}${errors.length > 3 ? '…' : ''}`);
    await load();
    onPostesChanged?.();
    setSaving(false);
  }

  async function bulkImport() {
    const lines = bulkText.split(/\r?\n|;/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const newRows: PosteRow[] = lines.map((line, idx) => {
      const parts = line.split(/\s*[|,]\s*/);
      return { name: parts[0], code: parts[1] || '', color: COLORS[(rows.length + idx) % COLORS.length], subclass_ids: [] };
    });
    setRows(p => [...p, ...newRows]);
    setBulkText(''); setShowBulk(false);
    setNotice(tr(`${newRows.length} poste(s) ajouté(s) — cliquez Enregistrer pour sauvegarder.`, `${newRows.length} position(s) added — click Save to persist.`));
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) { await supabase.from('planner_postes').delete().eq('id', r.id); onPostesChanged?.(); }
    setRows(p => p.filter((_, j) => j !== i));
  }

  function toggle(id?: string) {
    if (!id) return;
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Postes / Rôles', 'Positions / Roles')} <span className="text-xs font-normal text-gray-400">({rows.length})</span></h2>
          <p className="text-xs text-gray-500">{tr('Cliquez sur un poste pour configurer sa grille salariale, sous-classes, paliers et compétences.', 'Click a position to configure salary grid, sub-classes, tiers and skills.')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('1 poste', '1 position')}</button>
          <button onClick={() => addBatch(10)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> 10</button>
          <button onClick={() => setShowBulk(true)} className="inline-flex items-center gap-1 rounded-lg border border-purple-300 px-3 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 dark:border-purple-500/40 dark:hover:bg-purple-500/10">📋 {tr('Coller liste', 'Paste list')}</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer tout', 'Save all')}</button>
        </div>
      </div>
      {notice && <div className="px-4 pt-3 text-xs text-blue-700 dark:text-blue-300 whitespace-pre-line">{notice}</div>}

      {/* Modal Import en lot */}
      {showBulk && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowBulk(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">📋 {tr('Importer des postes en lot', 'Bulk import positions')}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {tr('Un poste par ligne. Optionnel : « Nom | CODE » ou « Nom, CODE ».', 'One position per line. Optional: "Name | CODE" or "Name, CODE".')}
            </p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={12}
              autoFocus
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm font-mono"
              placeholder={`Technicien junior\nTechnicien intermédiaire | TECH-INT\nTechnicien senior, TECH-SR\nContremaître\nChef de projet\nIngénieur électrique\n…`}
            />
            <p className="text-[10px] text-gray-400 mt-1">{bulkText.split(/\r?\n|;/).filter(l => l.trim()).length} {tr('ligne(s) détectée(s)', 'line(s) detected')}</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => { setShowBulk(false); setBulkText(''); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">{tr('Annuler', 'Cancel')}</button>
              <button onClick={bulkImport} disabled={!bulkText.trim()} className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"><Plus size={14} /> {tr('Ajouter tous', 'Add all')}</button>
            </div>
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {rows.map((r, i) => {
          const isOpen = !!r.id && expanded.has(r.id);
          const ids = r.subclass_ids || [];
          const subsApplied = ids.map(id => sharedSubclasses.find(s => s.id === id)).filter(Boolean) as Subclass[];
          return (
            <div key={r.id || i} className={`px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${!r.name?.trim() ? 'bg-red-50/30 dark:bg-red-500/5' : ''}`}>
              {/* ▌ LIGNE 1 — INFORMATIONS DU POSTE (avec labels) ▐ */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Coul.', 'Color')}</label>
                  <input type="color" value={r.color || '#6b7280'} onChange={e => upd(i, 'color', e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-300 p-0.5 dark:border-gray-600" />
                </div>
                <div className="col-span-10 sm:col-span-5">
                  <label className={`block text-[9px] uppercase font-bold mb-0.5 ${!r.name?.trim() ? 'text-red-600' : 'text-gray-500'}`}>
                    {tr('Nom du poste *', 'Position name *')} {!r.name?.trim() && `⚠️ ${tr('Obligatoire', 'Required')}`}
                  </label>
                  <input className={`${inp} ${!r.name?.trim() ? 'ring-2 ring-red-400 dark:ring-red-500/60 border-red-300' : ''}`} value={r.name} onChange={e => upd(i, 'name', e.target.value)} placeholder={tr('ex: Technicien senior, Soudeur, Contremaître…', 'e.g. Senior technician, Welder, Foreman…')} autoFocus={!r.id && !r.name} />
                </div>
                <div className="col-span-12 sm:col-span-2">
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">{tr('Code (court)', 'Code (short)')}</label>
                  <input className={inp} value={r.code || ''} onChange={e => upd(i, 'code', e.target.value)} placeholder="TECH-SR" />
                </div>
                <div className="col-span-12 flex items-end justify-end gap-2 pb-0.5 sm:col-span-4">
                  {perms.viewSalary ? (
                    <button onClick={() => toggle(r.id)} disabled={!r.id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${r.id ? (isOpen ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30') : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'}`}
                      title={r.id ? tr('Configurer grille salariale + commission + paliers', 'Configure salary grid + commission + tiers') : tr('Enregistrez d\'abord', 'Save first')}>
                      💰 {tr('Grille salariale', 'Salary grid')} {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : (
                    <button disabled className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed">
                      🔒 {tr('Grille verrouillée', 'Grid locked')}
                    </button>
                  )}
                  <button onClick={() => del(i)} className="text-gray-400 hover:text-red-600 p-1.5"><Trash2 size={15} /></button>
                </div>
              </div>

              {/* ▌ LIGNE 2 — SOUS-CATÉGORIES applicables au poste ▐ */}
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 text-[10px] font-bold uppercase shrink-0">
                    📂 {tr('Sous-catégories', 'Sub-categories')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                  {subsApplied.length === 0 && <span className="text-[11px] text-gray-400 italic">{tr('aucune appliquée', 'none applied')} —</span>}
                  {subsApplied.map(sc => (
                    <span key={sc.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border" style={{ background: (sc.color || '#06b6d4') + '20', color: sc.color || '#0891b2', borderColor: (sc.color || '#06b6d4') + '60' }}>
                      {sc.name}
                      <button onClick={() => upd(i, 'subclass_ids', ids.filter(x => x !== sc.id))} className="opacity-60 hover:opacity-100 hover:text-red-500">×</button>
                    </span>
                  ))}
                  {sharedSubclasses.length > 0 ? (
                    <div className="relative">
                      <button type="button" onClick={() => { setSubPickerFor(subPickerFor === i ? null : i); setSubSearch(''); }}
                        className="rounded-full border border-dashed border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10">
                        + {tr('Ajouter du catalogue', 'Add from catalog')} ({sharedSubclasses.length})
                      </button>
                      {subPickerFor === i && (() => {
                        const available = sharedSubclasses.filter(s => !ids.includes(s.id));
                        const search = subSearch.toLowerCase().trim();
                        const filtered = search ? available.filter(s => s.name.toLowerCase().includes(search) || (s.category || '').toLowerCase().includes(search)) : available;
                        return (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setSubPickerFor(null)} />
                            <div className="absolute z-40 bottom-full right-0 mb-1 w-80 rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800 overflow-hidden">
                              <div className="border-b border-gray-100 dark:border-gray-700 p-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={subSearch}
                                  onChange={e => setSubSearch(e.target.value)}
                                  placeholder={tr('🔍 Rechercher dans le catalogue…', '🔍 Search catalog…')}
                                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-xs outline-none focus:border-cyan-500"
                                />
                                <p className="mt-1 text-[9px] text-gray-400">{filtered.length} {tr('résultat(s) sur', 'result(s) of')} {available.length}</p>
                              </div>
                              <div className="max-h-56 overflow-y-auto p-1">
                                {filtered.map(s => (
                                  <button key={s.id} type="button"
                                    onClick={() => { upd(i, 'subclass_ids', [...ids, s.id]); setSubSearch(''); }}
                                    className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-cyan-50 dark:hover:bg-cyan-900/30 flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full shrink-0 border border-gray-300" style={{ background: s.color }} />
                                    <span className="flex-1 font-medium">{s.name}</span>
                                    {s.category && <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">{s.category}</span>}
                                  </button>
                                ))}
                                {filtered.length === 0 && (
                                  <p className="text-[10px] text-gray-400 px-2 py-3 text-center">
                                    {available.length === 0
                                      ? tr('Toutes les sous-classes sont déjà appliquées.', 'All sub-classes already applied.')
                                      : tr('Aucun résultat. Tapez moins de caractères.', 'No result. Try fewer characters.')}
                                  </p>
                                )}
                              </div>
                              <div className="border-t border-gray-100 dark:border-gray-700 p-1">
                                <button type="button" onClick={() => { setSubPickerFor(null); goToSubclasses(); }}
                                  className="w-full text-center text-[10px] text-purple-600 hover:underline py-1">
                                  ⚙️ {tr('Gérer / créer dans le catalogue', 'Manage / create in catalog')}
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <button onClick={goToSubclasses} className="rounded-full border border-dashed border-amber-300 dark:border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-50">
                      💡 {tr('Catalogue vide → créez des sous-classes', 'Empty catalog → create sub-classes')}
                    </button>
                  )}
                  </div>
                </div>
              </div>

              {isOpen && r.id && perms.viewSalary && (
                <PosteSalaryGridPanel tenant={tenant} poste={r} tr={tr} onClose={() => toggle(r.id)} canEdit={perms.editSalary} />
              )}
            </div>
          );
        })}
        {rows.length === 0 && <div className="px-4 py-6 text-center text-gray-400 text-sm">{tr('Aucun poste. Ajoute-en un.', 'No position yet. Add one.')}</div>}
      </div>
    </div>
  );
}

function SitesDepts({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  type SiteRow = { _key: string; id?: string; initName: string; initCode: string; initAddr: string };
  type DeptRow = { _dKey: string; id?: string; initName: string; initCode: string; initAddr: string; siteKey: string };

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [depts, setDepts] = useState<DeptRow[]>([]);
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [maxSites, setMaxSites] = useState<number>(Infinity); // limite d'abonnement (Infinity = avant migration 078)

  // Direct callback refs — each input registers itself; val() reads DOM value at save time
  const imap = React.useRef(new Map<string, HTMLInputElement>());
  const reg = (k: string) => (el: HTMLInputElement | null) => { if (el) imap.current.set(k, el); else imap.current.delete(k); };
  const val = (k: string) => (imap.current.get(k)?.value ?? '').trim();

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('planner_succursales').select('*').eq('tenant_id', tenant).order('name');
    if (error) { setNotice('Erreur chargement : ' + error.message); setSites([]); setDepts([]); setLoading(false); return; }
    const rows = (data ?? []) as any[];
    setSites(rows.filter(r => !r.parent_id).map(s => ({ _key: s.id, id: s.id, initName: s.name, initCode: s.code || '', initAddr: s.address || '' })));
    setDepts(rows.filter(r =>  r.parent_id).map(d => ({ _dKey: d.id, id: d.id, initName: d.name, initCode: d.code || '', initAddr: d.address || '', siteKey: d.parent_id })));
    setLoadKey(k => k + 1);
    // Limite de sites de l'abonnement (Infinity si la colonne n'existe pas encore)
    const { data: t, error: tErr } = await supabase.from('tenants').select('max_sites').eq('subdomain', tenant).maybeSingle();
    setMaxSites(tErr ? Infinity : (t?.max_sites != null ? Number(t.max_sites) : 1));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const addSite = () => {
    if (sites.length >= maxSites) {
      setNotice(tr(`⚠️ Limite de ${maxSites} site(s) atteinte — veuillez réviser votre abonnement pour ajouter des sites supplémentaires.`, `⚠️ Limit of ${maxSites} site(s) reached — please review your subscription to add more sites.`));
      return;
    }
    const k = Math.random().toString(36).slice(2); setSites(p => [...p, { _key: k, initName: '', initCode: '', initAddr: '' }]);
  };
  const addDept = (sk: string) => { const k = Math.random().toString(36).slice(2); setDepts(p => [...p, { _dKey: k, initName: '', initCode: '', initAddr: '', siteKey: sk }]); };

  async function delSite(siteKey: string) {
    const site = sites.find(s => s._key === siteKey);
    if (site?.id) await supabase.from('planner_succursales').delete().eq('id', site.id);
    setSites(p => p.filter(s => s._key !== siteKey));
    setDepts(p => p.filter(d => d.siteKey !== siteKey));
  }
  async function delDept(dKey: string) {
    const dept = depts.find(d => d._dKey === dKey);
    if (dept?.id) await supabase.from('planner_succursales').delete().eq('id', dept.id);
    setDepts(p => p.filter(d => d._dKey !== dKey));
  }

  async function save() {
    setSaving(true); setNotice(null);
    // Read values straight from DOM via callback-ref Map — immune to onChange/autocomplete issues
    const validSites = sites.filter(s => val(`s:${s._key}:n`));
    if (!validSites.length) {
      setNotice(`⚠️ ${tr(`Aucun site (${sites.length} ligne(s), aucun nom). Clique + Site et tape un nom.`, `Nothing to save (${sites.length} row(s), no name). Click + Site and type a name.`)}`);
      setSaving(false); return;
    }
    let savedSites = 0, savedDepts = 0;
    try {
      for (const site of validSites) {
        const name = val(`s:${site._key}:n`);
        const sPayload = { tenant_id: tenant, name };
        let siteId = site.id;
        if (site.id) {
          const { error } = await supabase.from('planner_succursales').update(sPayload).eq('id', site.id);
          if (error) throw new Error(error.message);
        } else {
          const { data: ins, error } = await supabase.from('planner_succursales').insert(sPayload).select('id').single();
          if (error) throw new Error(error.message);
          siteId = (ins as any).id;
        }
        savedSites++;
        for (const dept of depts.filter(d => d.siteKey === site._key)) {
          const dName = val(`d:${dept._dKey}:n`);
          if (!dName) continue;
          const dPayload = { tenant_id: tenant, name: dName, parent_id: siteId };
          if (dept.id) {
            const { error } = await supabase.from('planner_succursales').update(dPayload).eq('id', dept.id);
            if (error) throw new Error(error.message);
          } else {
            const { error } = await supabase.from('planner_succursales').insert(dPayload);
            if (error) throw new Error(error.message);
          }
          savedDepts++;
        }
      }
      setNotice(`✓ ${savedSites} site(s) + ${savedDepts} département(s) enregistrés`);
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message ?? 'DB')); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tr('Sites et départements de votre organisation. Les sites contiennent des départements.', 'Sites and departments for your organization. Sites contain departments.')}
      </p>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-bold">{tr('Sites / Départements', 'Sites / Departments')}</h2>
            <p className="text-xs text-gray-500">{tr('Hiérarchie : Site → Département', 'Hierarchy: Site → Department')}
              {Number.isFinite(maxSites) && <span className={`ml-2 font-semibold ${sites.length >= maxSites ? 'text-red-600' : 'text-gray-400'}`}>· {sites.length}/{maxSites} {tr('sites', 'sites')}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={addSite} disabled={sites.length >= maxSites} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700" title={sites.length >= maxSites ? tr('Limite d\'abonnement atteinte', 'Subscription limit reached') : ''}><Plus size={15} /> {tr('Site', 'Site')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
        {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sites.map(site => (
            <div key={`${site._key}-${loadKey}`}>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2.5 dark:bg-blue-900/20">
                <Building2 size={15} className="shrink-0 text-blue-500" />
                <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 w-10">{tr('SITE', 'SITE')}</span>
                <input
                  ref={reg(`s:${site._key}:n`)}
                  autoFocus={!site.id}
                  autoComplete="off"
                  className="flex-1 rounded-lg border-2 border-blue-400 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-600 dark:bg-gray-800 dark:text-white"
                  defaultValue={site.initName}
                  placeholder={tr('Nom du site (obligatoire)', 'Site name (required)')}
                />
                <button onClick={() => addDept(site._key)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
                  <Plus size={11} />{tr('Dépt', 'Dept')}
                </button>
                <button onClick={() => delSite(site._key)} className="shrink-0 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              {depts.filter(d => d.siteKey === site._key).map(dept => (
                <div key={`${dept._dKey}-${loadKey}`} className="flex items-center gap-2 border-t border-dashed border-gray-200 bg-white px-4 py-2 pl-12 dark:border-gray-700 dark:bg-gray-800/50">
                  <MapPin size={12} className="shrink-0 text-gray-400" />
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-gray-400 w-10">{tr('DÉPT', 'DEPT')}</span>
                  <input
                    ref={reg(`d:${dept._dKey}:n`)}
                    autoComplete="off"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    defaultValue={dept.initName}
                    placeholder={tr('Nom du département', 'Department name')}
                  />
                  <button onClick={() => delDept(dept._dKey)} className="shrink-0 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          ))}
          {sites.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              {tr('Aucun site. Clique « + Site » pour commencer.', 'No site yet. Click "+ Site" to start.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAIE & AVANTAGES — profils employés, avantages, primes horaires
// ============================================================

function PayeConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [subTab, setSubTab] = useState<'profils' | 'avantages' | 'primes'>('profils');
  return (
    <div className="space-y-4">
      <div className="flex w-fit gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { k: 'profils',   label: tr('Profils employés', 'Employee profiles'), icon: UserCog },
          { k: 'avantages', label: tr('Avantages',         'Allowances'),        icon: Gift },
          { k: 'primes',    label: tr('Primes horaires',   'Hour bonuses'),      icon: Timer },
        ].map(x => {
          const Icon = x.icon as any;
          return (
            <button key={x.k} onClick={() => setSubTab(x.k as any)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${subTab === x.k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Icon size={15} /> {x.label}
            </button>
          );
        })}
      </div>
      {subTab === 'profils'   && <EmployeeProfiles tenant={tenant} tr={tr} />}
      {subTab === 'avantages' && <AllowancesConfig tenant={tenant} tr={tr} />}
      {subTab === 'primes'    && <HourBonusesConfig tenant={tenant} tr={tr} />}
    </div>
  );
}

function EmployeeProfiles({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type EP = { id?: string; employee_id: string; employee_name: string; employee_email: string; hourly_rate: string; ot_multiplier: string; dt_multiplier: string; ot_daily_hrs: string; dt_daily_hrs: string; ot_weekly_hrs: string; active: boolean };
  const [rows, setRows] = useState<EP[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  useEffect(() => {
    (async () => {
      const [{ data: personnel }, { data: profiles }] = await Promise.all([
        supabase.from('planner_personnel').select('id, name, email').eq('tenant_id', tenant).eq('is_active', true).order('name'),
        supabase.from('employee_profiles').select('*').eq('tenant_id', tenant),
      ]);
      const us: { id: string; name: string; email: string }[] = (personnel || []).map((p: any) => ({ id: p.id, name: p.name || '', email: p.email || '' }));
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.employee_id] = p; });
      setRows(us.map(u => {
        const p = profileMap[u.id];
        if (p) return { id: p.id, employee_id: u.id, employee_name: p.employee_name || u.name, employee_email: p.employee_email || u.email, hourly_rate: String(p.hourly_rate || ''), ot_multiplier: String(p.ot_multiplier || '1.50'), dt_multiplier: String(p.dt_multiplier || '2.00'), ot_daily_hrs: String(p.ot_daily_hrs || '8'), dt_daily_hrs: p.dt_daily_hrs != null ? String(p.dt_daily_hrs) : '', ot_weekly_hrs: String(p.ot_weekly_hrs || '40'), active: p.active !== false };
        return { employee_id: u.id, employee_name: u.name, employee_email: u.email, hourly_rate: '', ot_multiplier: '1.50', dt_multiplier: '2.00', ot_daily_hrs: '8', dt_daily_hrs: '', ot_weekly_hrs: '40', active: true };
      }));
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  const upd = (i: number, k: keyof EP, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.employee_id) continue;
        const payload = {
          tenant_id: tenant, employee_id: r.employee_id,
          employee_name: r.employee_name, employee_email: r.employee_email,
          hourly_rate: r.hourly_rate !== '' ? parseFloat(r.hourly_rate) : 0,
          ot_multiplier: parseFloat(r.ot_multiplier) || 1.5,
          dt_multiplier: parseFloat(r.dt_multiplier) || 2.0,
          ot_daily_hrs: r.ot_daily_hrs !== '' ? parseFloat(r.ot_daily_hrs) : 8,
          dt_daily_hrs: r.dt_daily_hrs !== '' ? parseFloat(r.dt_daily_hrs) : null,
          ot_weekly_hrs: r.ot_weekly_hrs !== '' ? parseFloat(r.ot_weekly_hrs) : 40,
          active: r.active, updated_at: new Date().toISOString(),
        };
        if (r.id) await supabase.from('employee_profiles').update(payload).eq('id', r.id);
        else { const { error } = await supabase.from('employee_profiles').insert(payload); if (error) throw error; }
      }
      setNotice(tr('Profils enregistrés ✓', 'Profiles saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Le taux horaire et les multiplicateurs servent au calcul automatique des feuilles de temps. OT = temps supplémentaire (×1,5), DT = double temps (×2).', 'Hourly rate and multipliers are used for automatic timesheet cost calculations. OT = overtime (×1.5), DT = double time (×2).')}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr('Profils de paie', 'Payroll profiles')}</h2>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
          </button>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('Employé', 'Employee')}</th>
              <th className="px-2">{tr('Taux horaire $', 'Hourly rate $')}</th>
              <th className="px-2">{tr('×OT', '×OT')}</th>
              <th className="px-2">{tr('×DT', '×DT')}</th>
              <th className="px-2">{tr('Seuil OT/jour h', 'OT/day h')}</th>
              <th className="px-2">{tr('Seuil DT/jour h', 'DT/day h')}</th>
              <th className="px-2">{tr('Seuil OT/sem h', 'OT/wk h')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.employee_id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1.5" data-label={tr('Employé', 'Employee')}>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{r.employee_name || r.employee_email}</div>
                    <div className="text-xs text-gray-400">{r.employee_email}</div>
                  </td>
                  <td className="px-2" data-label={tr('Taux horaire $', 'Hourly rate $')}>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.hourly_rate} placeholder="25.00"
                        onChange={e => upd(i, 'hourly_rate', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'hourly_rate', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">/h</span>
                    </div>
                  </td>
                  <td className="px-2" data-label={tr('×OT', '×OT')}><input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.ot_multiplier} placeholder="1.50" onChange={e => upd(i, 'ot_multiplier', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('×DT', '×DT')}><input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.dt_multiplier} placeholder="2.00" onChange={e => upd(i, 'dt_multiplier', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Seuil OT/jour h', 'OT/day h')}><input type="number" min={0} step={0.5} className={`${inp} w-14`} value={r.ot_daily_hrs} placeholder="8" onChange={e => upd(i, 'ot_daily_hrs', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Seuil DT/jour h', 'DT/day h')}><input type="number" min={0} step={0.5} className={`${inp} w-14`} value={r.dt_daily_hrs} placeholder={tr('—', '—')} onChange={e => upd(i, 'dt_daily_hrs', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Seuil OT/sem h', 'OT/wk h')}><input type="number" min={0} step={1} className={`${inp} w-14`} value={r.ot_weekly_hrs} placeholder="40" onChange={e => upd(i, 'ot_weekly_hrs', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucun employé actif. Créez-en dans Employés → Personnel & planification.', 'No active employee. Create one in Employees → Staff & planning.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AllowancesConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type Row = { id?: string; name: string; amount: string; is_taxable: boolean; active: boolean; sort_order: number };
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheet_allowances').select('*').eq('tenant_id', tenant).order('sort_order').order('name');
    setRows((data || []).map((r: any) => ({ ...r, amount: String(r.amount || '') })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', amount: '', is_taxable: false, active: true, sort_order: p.length }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim()) continue;
        const payload = { tenant_id: tenant, name: r.name.trim(), amount: parseFloat(r.amount) || 0, is_taxable: r.is_taxable, active: r.active, sort_order: r.sort_order };
        if (r.id) await supabase.from('timesheet_allowances').update(payload).eq('id', r.id);
        else await supabase.from('timesheet_allowances').insert(payload);
      }
      setNotice(tr('Avantages enregistrés ✓', 'Allowances saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('timesheet_allowances').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        {tr("Créez des avantages payés à l'employé (ex: Dîner 35$, Coucher 100$). Ils apparaissent comme cases à cocher sur chaque ligne de feuille de temps.", "Create employee allowances (e.g., Lunch $35, Overnight $100). They appear as checkboxes on each timesheet line.")}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr('Avantages & Allocations', 'Allowances & Benefits')}</h2>
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr("Nom (affiché à l'employé)", 'Name (shown to employee)')}</th>
              <th className="px-2">{tr('Montant $', 'Amount $')}</th>
              <th className="px-2">{tr('Imposable', 'Taxable')}</th>
              <th className="px-2">{tr('Ordre', 'Order')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1" data-label={tr("Nom (affiché à l'employé)", 'Name (shown to employee)')}><input className={`${inp} w-40`} value={r.name} placeholder={tr('Ex: Dîner', 'Ex: Lunch')} onChange={e => upd(i, 'name', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Montant $', 'Amount $')}>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.amount} placeholder="35.00"
                        onChange={e => upd(i, 'amount', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'amount', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">$</span>
                    </div>
                  </td>
                  <td className="px-2 text-center" data-label={tr('Imposable', 'Taxable')}><input type="checkbox" checked={r.is_taxable} onChange={e => upd(i, 'is_taxable', e.target.checked)} /></td>
                  <td className="px-2" data-label={tr('Ordre', 'Order')}><input type="number" min={0} className={`${inp} w-14`} value={r.sort_order} onChange={e => upd(i, 'sort_order', Number(e.target.value))} /></td>
                  <td className="px-2 text-center" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                  <td className="px-2 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucun avantage configuré.', 'No allowance configured.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HourBonusesConfig({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type Row = { id?: string; name: string; trigger_hours: string; bonus_amount: string; is_taxable: boolean; active: boolean; sort_order: number };
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inp = 'rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheet_hour_bonuses').select('*').eq('tenant_id', tenant).order('sort_order').order('trigger_hours');
    setRows((data || []).map((r: any) => ({ ...r, trigger_hours: String(r.trigger_hours || ''), bonus_amount: String(r.bonus_amount || '') })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows(p => [...p, { name: '', trigger_hours: '', bonus_amount: '', is_taxable: true, active: true, sort_order: p.length }]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.name?.trim() || !r.trigger_hours) continue;
        const payload = { tenant_id: tenant, name: r.name.trim(), trigger_hours: parseFloat(r.trigger_hours) || 0, bonus_amount: parseFloat(r.bonus_amount) || 0, is_taxable: r.is_taxable, active: r.active, sort_order: r.sort_order };
        if (r.id) await supabase.from('timesheet_hour_bonuses').update(payload).eq('id', r.id);
        else await supabase.from('timesheet_hour_bonuses').insert(payload);
      }
      setNotice(tr('Primes enregistrées ✓', 'Bonuses saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await supabase.from('timesheet_hour_bonuses').delete().eq('id', r.id);
    setRows(p => p.filter((_, j) => j !== i));
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        {tr("Primes déclenchées quand les heures totales d'une journée atteignent le seuil. Ex: « Prime 5h = 25$ » → versé si ≥ 5h dans la journée.", "Bonuses triggered when daily total hours reach the threshold. E.g., \"5h bonus = $25\" → paid if ≥ 5h in the day.")}
      </div>
      {notice && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="font-bold">{tr("Primes par plage d'heures", 'Hour-based bonuses')}</h2>
          <div className="flex gap-2">
            <button onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('Nom prime', 'Bonus name')}</th>
              <th className="px-2">{tr('Seuil h/jour', 'Daily h threshold')}</th>
              <th className="px-2">{tr('Montant $', 'Amount $')}</th>
              <th className="px-2">{tr('Imposable', 'Taxable')}</th>
              <th className="px-2">{tr('Ordre', 'Order')}</th>
              <th className="px-2">{tr('Actif', 'Active')}</th>
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-2 py-1" data-label={tr('Nom prime', 'Bonus name')}><input className={`${inp} w-36`} value={r.name} placeholder={tr('Ex: Prime 5h', 'Ex: 5h bonus')} onChange={e => upd(i, 'name', e.target.value)} /></td>
                  <td className="px-2" data-label={tr('Seuil h/jour', 'Daily h threshold')}>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-16`} value={r.trigger_hours} placeholder="5" onChange={e => upd(i, 'trigger_hours', e.target.value)} />
                      <span className="text-xs text-gray-400">h</span>
                    </div>
                  </td>
                  <td className="px-2" data-label={tr('Montant $', 'Amount $')}>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="decimal" className={`${inp} w-20`} value={r.bonus_amount} placeholder="25.00"
                        onChange={e => upd(i, 'bonus_amount', e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); upd(i, 'bonus_amount', isNaN(v) ? '' : v.toFixed(2)); }} />
                      <span className="text-xs text-gray-400">$</span>
                    </div>
                  </td>
                  <td className="px-2 text-center" data-label={tr('Imposable', 'Taxable')}><input type="checkbox" checked={r.is_taxable} onChange={e => upd(i, 'is_taxable', e.target.checked)} /></td>
                  <td className="px-2" data-label={tr('Ordre', 'Order')}><input type="number" min={0} className={`${inp} w-14`} value={r.sort_order} onChange={e => upd(i, 'sort_order', Number(e.target.value))} /></td>
                  <td className="px-2 text-center" data-label={tr('Actif', 'Active')}><input type="checkbox" checked={r.active} onChange={e => upd(i, 'active', e.target.checked)} /></td>
                  <td className="px-2 text-right sm:text-left"><button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-sm text-gray-400">{tr('Aucune prime configurée.', 'No bonus configured.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
