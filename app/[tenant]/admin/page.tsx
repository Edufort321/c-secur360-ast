'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Settings, CreditCard, Save, Loader2, Plus, Check, MapPin, Trash2, Car, Building2, Wrench, Clock, DollarSign, Layers, HardHat, ExternalLink, UserCog, Banknote, Gift, Timer, ChevronDown, ChevronRight, Award, TrendingUp, BookOpen, Receipt, ShoppingCart, Paperclip, FileText, ClipboardList, Download, Upload, Zap } from 'lucide-react';
import { listRecurringTasks, saveRecurringTask, deleteRecurringTask, type RecurringTask } from '@/lib/recurringTasks';
import { getCatalogueConditions, DEFAULT_EMPLOYEE_FACTOR, type CatalogueCondition, type GridCondition } from '@/lib/catalogueConditions';
import { supabase } from '@/lib/supabase';
import { SoumissionsModule } from '@/components/soumissions/SoumissionsModule';
import { BonsCommandeModule } from '@/components/bons/BonsCommandeModule';
import { FinancialDashboard } from '@/components/finance/FinancialDashboard';
import { ShareholdersModule } from '@/components/admin/ShareholdersModule';
import { AuditLog } from '@/components/admin/AuditLog';
import { AlertsModule } from '@/components/admin/AlertsModule';
import { SuppliersManager } from '@/components/admin/SuppliersManager';
import { ProductsCatalog } from '@/components/admin/ProductsCatalog';
import { Package, PieChart, ShieldCheck, Bell } from 'lucide-react';
import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';
import { RHDossiers } from '@/components/admin/RHDossiers';
import { CongeTypesManager } from '@/components/admin/CongeTypesManager';
import { ErpSharing } from '@/components/admin/ErpSharing';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPhoto } from '@/lib/utils/photo';
import { ARC_2026 } from '@/lib/constants/arc';
import { seedAccountingDefaults, getAccounts, getTaxCodes, getLedger, getTrialBalance, createEntry, reverseEntry, getPeriods, upsertPeriod, setPeriodStatus, ACCOUNT_TYPE_LABELS, type GLAccount, type GLTaxCode, type GLPeriod } from '@/lib/accounting';
import { syncPayrollEntries, syncAllToLedger, postTransactionPurchase, postTransactionRevenue, postTransactionPayment, postTransactionNow } from '@/lib/accountingAuto';
import { getArAging, getApAging, AGING_BUCKETS, AGING_LABELS, type AgingReport } from '@/lib/agingReports';
import { exportJournalCsv as exportAcctJournalCsv, exportTrialBalanceCsv as exportAcctTrialBalanceCsv } from '@/lib/accountantExport';
import { getTransactions, getTransactionItems, saveTransaction, setTransactionStatus, setTransactionReviewed, deleteTransaction, nextTransactionNumber, computeTransactionTotals, uploadReceipt, type Transaction, type TransactionItem } from '@/lib/transactions';
import { getTreasuryAccounts, createTreasuryAccount, setTreasuryActive, TREASURY_KIND_LABELS, type TreasuryAccount, type TreasuryKind } from '@/lib/treasuryAccounts';
import { getAttachments, addAttachment, deleteAttachment, type TxnAttachment } from '@/lib/transactionAttachments';
import { FISCAL_CATEGORIES, fiscalByCode, ensureFiscalAccounts } from '@/lib/fiscalCategories';
import { parseBankCsv, getBankLines, insertBankLines, updateBankLine, deleteBankLine, autoMatchBankLines, type BankLine } from '@/lib/bankReconciliation';
import { useRealtime } from '@/lib/useRealtime';
import { readDraft, writeDraft, clearDraft, useAutoDraft } from '@/lib/useDraft';
import { getTenantPermissions, canViewAdminTab, type PermMap } from '@/lib/permissions';
import { tsLabel, tsCls, isPayrollProcessable } from '@/lib/timesheetStatus';
import { getInvoices, getInvoiceItems, getCompanySettings, saveCompanySettings, saveInvoice, setInvoiceStatus, nextInvoiceNumber, computeInvoiceTotals, TAX_BY_PROVINCE, PROVINCES, type Invoice, type InvoiceItem, type CompanySettings } from '@/lib/invoicing';
import { exportInvoicePdf } from '@/lib/invoicePdf';
import { createPortal } from 'react-dom';
import { InvoicePrintReport, INV_PRINT_CSS } from '@/components/admin/InvoicePrintReport';
import { exportTrialBalanceCsv, exportTrialBalancePdf, exportLedgerCsv, exportLedgerPdf, exportStatementsCsv, exportStatementsPdf } from '@/lib/accountingExports';
import { getTaxSummary, getTaxRemittance, declarationPeriod, getVehicleBenefits, getT4RL1Base, exportTaxSummaryCsv, exportTaxSummaryPdf, exportVehicleBenefitsCsv, exportVehicleBenefitsPdf, exportT4RL1Csv, exportT4RL1Pdf, type TaxSummary, type TaxRemittance, type VehicleBenefit, type EmployeeFiscal } from '@/lib/fiscalReports';

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
        // Identité via la session serveur (cookie) — on ne lit PLUS la table `users` côté client
        // (fermée à l'anon pour empêcher la fuite de courriels/rôles).
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const me = res.ok ? (await res.json())?.user : null;
        if (me?.email) {
          setUserEmail(me.email);
          if (me.role === 'super_admin') { setNiveauAcces('super_user'); setLoading(false); return; }
          // Raffinement par planner_personnel (niveau d'accès du poste).
          const { data: p } = await supabase.from('planner_personnel').select('niveauAcces').eq('tenant_id', tenant).ilike('email', me.email).maybeSingle();
          if (p?.niveauAcces) setNiveauAcces(p.niveauAcces as AccessLevel);
          else if (me.role === 'client_admin') setNiveauAcces('direction');
          else if (me.role === 'user') setNiveauAcces('consultation');
        }
      } catch { /* session indispo → garde le défaut */ }
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
  const tenant = (params?.tenant as string) || ''; // ISOLATION : jamais de repli 'cerdia' (contamination)
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  type TabKey = 'sitesdepts' | 'employes' | 'permissions' | 'vehicules' | 'logbook' | 'ressources' | 'clients' | 'fournisseurs' | 'produits' | 'feuilles' | 'paie' | 'rh' | 'abonnement' | 'facturation' | 'factures' | 'soumissions' | 'bons-commande' | 'transactions' | 'comptabilite' | 'fiscal' | 'etat-financier' | 'actionnaires' | 'alertes' | 'audit' | 'integrations';
  const TAB_KEYS: TabKey[] = ['sitesdepts', 'employes', 'permissions', 'vehicules', 'logbook', 'ressources', 'clients', 'fournisseurs', 'produits', 'feuilles', 'paie', 'rh', 'abonnement', 'facturation', 'factures', 'soumissions', 'bons-commande', 'transactions', 'comptabilite', 'fiscal', 'etat-financier', 'actionnaires', 'alertes', 'audit', 'integrations'];
  const [tab, setTabState] = useState<TabKey>('sitesdepts');
  // Mémorise le dernier onglet ouvert (par tenant) — évite de « repartir » sur Sites/Dépts à chaque retour.
  const setTab = (k: TabKey) => {
    setTabState(k);
    try { if (typeof window !== 'undefined' && tenant) localStorage.setItem(`csecur360.admin.tab.${tenant}`, k); } catch { /* ignore */ }
  };
  // Onglet initial : ?tab=... (lien direct) prioritaire, sinon dernier onglet mémorisé pour ce tenant.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('tab');
    if (q && (TAB_KEYS as string[]).includes(q)) { setTabState(q as TabKey); return; }
    if (!tenant) return;
    try {
      const saved = localStorage.getItem(`csecur360.admin.tab.${tenant}`);
      if (saved && (TAB_KEYS as string[]).includes(saved)) setTabState(saved as TabKey);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Facturation depuis un PROJET : ?invoiceProject=<id> (lien « Facturer » de la page projet) → ouvre une facture préremplie.
  const [initialInvoiceProject] = useState<string | null>(() => { if (typeof window === 'undefined') return null; return new URLSearchParams(window.location.search).get('invoiceProject'); });
  const { perms, niveauAcces, userEmail } = useCurrentAccess(tenant);
  // Structure d'accès par onglet (configurable par tenant, table tenant_permissions). {} avant chargement = défauts.
  const [tabPerms, setTabPerms] = useState<PermMap>({});
  useEffect(() => { if (tenant) getTenantPermissions(tenant).then(setTabPerms).catch(() => {}); }, [tenant]);

  // #57 : chaque onglet peut exiger une permission (matrice PERMS). Sans `need`, l'onglet est
  // toujours visible. Les onglets sensibles (finance/paie/abonnement/RH) sont masqués si le
  // niveau d'accès ne l'autorise pas (direction/super_user conservent tout).
  // Onglets regroupés par GROUPE LOGIQUE (nav à deux niveaux : groupe → onglets du groupe).
  type GroupKey = 'org' | 'ops' | 'ventes' | 'finance' | 'systeme';
  const allTabs: { k: TabKey; label: string; icon: any; group: GroupKey; need?: (p: typeof perms) => boolean }[] = [
    { k: 'sitesdepts',  label: tr('Sites / Dépts', 'Sites / Depts'),       icon: MapPin, group: 'org' },
    { k: 'employes',    label: tr('Employés & Accès', 'Employees & Access'), icon: HardHat, group: 'org', need: p => p.viewEmployees },
    { k: 'permissions', label: tr('Permissions', 'Permissions'),             icon: Settings, group: 'org' },
    { k: 'rh',          label: tr('RH', 'HR'),                               icon: UserCog, group: 'org', need: p => p.viewSalary || p.manageAll },
    { k: 'paie',        label: tr('Paie & Avantages', 'Pay & Benefits'),     icon: Banknote, group: 'org', need: p => p.viewSalary },
    { k: 'vehicules',   label: tr('Véhicules', 'Vehicles'),                  icon: Car, group: 'ops' },
    { k: 'logbook',     label: tr('Carnet de bord', 'Logbook'),              icon: BookOpen, group: 'ops' },
    { k: 'ressources',  label: tr('Ressources', 'Resources'),                icon: Wrench, group: 'ops' },
    { k: 'feuilles',    label: tr('Feuilles de temps', 'Timesheets'),        icon: Clock, group: 'ops' },
    { k: 'clients',     label: tr('Clients', 'Clients'),                     icon: Building2, group: 'ventes' },
    { k: 'fournisseurs', label: tr('Fournisseurs', 'Suppliers'),             icon: Building2, group: 'ventes' },
    { k: 'produits',    label: tr('Produits', 'Products'),                   icon: Package, group: 'ventes' },
    { k: 'soumissions', label: tr('Catalogue de taux', 'Rate catalogue'),       icon: FileText, group: 'ventes' },
    { k: 'bons-commande', label: tr('Bons de commande', 'Purchase orders'),    icon: ClipboardList, group: 'ventes' },
    { k: 'etat-financier', label: tr('État financier', 'Financial state'),     icon: TrendingUp, group: 'finance', need: p => p.viewSalary },
    { k: 'factures',    label: tr('Factures', 'Invoices'),                    icon: Receipt, group: 'finance', need: p => p.viewSalary },
    { k: 'facturation', label: tr('Facturation', 'Billing'),                 icon: Settings, group: 'finance', need: p => p.manageAll },
    { k: 'transactions', label: tr('Transactions', 'Transactions'),           icon: ShoppingCart, group: 'finance', need: p => p.viewSalary },
    { k: 'comptabilite', label: tr('Comptabilité', 'Accounting'),            icon: Layers, group: 'finance', need: p => p.viewSalary },
    { k: 'fiscal',      label: tr('Rapports fiscaux', 'Tax reports'),         icon: FileText, group: 'finance', need: p => p.viewSalary },
    { k: 'actionnaires', label: tr('Actionnaires', 'Shareholders'),          icon: PieChart, group: 'finance', need: p => p.manageAll },
    { k: 'alertes',     label: tr('Alertes', 'Alerts'),                      icon: Bell, group: 'systeme', need: p => p.manageAll },
    { k: 'audit',       label: tr('Journal d\'audit', 'Audit log'),          icon: ShieldCheck, group: 'systeme', need: p => p.manageAll },
    { k: 'abonnement',  label: tr('Abonnement', 'Subscription'),             icon: CreditCard, group: 'systeme', need: p => p.manageAll },
    { k: 'integrations', label: tr('Intégration ERP / API', 'ERP / API'),     icon: ExternalLink, group: 'systeme', need: p => p.manageAll },
  ];
  const GROUPS: { k: GroupKey; label: string; icon: any }[] = [
    { k: 'org',     label: tr('Organisation & RH', 'Organization & HR'), icon: UserCog },
    { k: 'ops',     label: tr('Opérations', 'Operations'),               icon: Wrench },
    { k: 'ventes',  label: tr('Ventes & Achats', 'Sales & Purchasing'),  icon: Building2 },
    { k: 'finance', label: tr('Finances', 'Finance'),                    icon: Layers },
    { k: 'systeme', label: tr('Système', 'System'),                      icon: Settings },
  ];
  // Accès par onglet : structure configurable (tenant_permissions) ; défauts = ancien gating `need`.
  const tabs = allTabs.filter(t => canViewAdminTab(tabPerms, t.k, niveauAcces));

  const activeTab = tabs.find(t => t.k === tab);
  const activeGroup: GroupKey = activeTab?.group || 'org';
  const visibleGroups = GROUPS.filter(g => tabs.some(t => t.group === g.k));
  const groupTabs = tabs.filter(t => t.group === activeGroup);

  // Si l'onglet courant n'est pas (ou plus) accessible au niveau de l'utilisateur, basculer sur le 1er visible.
  const visibleKeys = tabs.map(t => t.k).join(',');
  useEffect(() => {
    if (tabs.length && !tabs.some(t => t.k === tab)) setTab(tabs[0].k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKeys]);

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

        {/* Mobile / demi-écran (< 1024px) : menu hamburger */}
        <div className="mb-4 lg:hidden">
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
              <div className="absolute z-50 mt-1 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {visibleGroups.map(g => (
                  <div key={g.k}>
                    <div className="bg-gray-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:bg-gray-900/40">{g.label}</div>
                    {tabs.filter(t => t.group === g.k).map(x => {
                      const Icon = x.icon as any;
                      return (
                        <button key={x.k} onClick={() => { setTab(x.k); setMobileMenuOpen(false); }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
                          <Icon size={15} /> {x.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop (>= 1024px) : nav à DEUX niveaux — groupes logiques puis onglets du groupe actif */}
        <div className="mb-4 hidden lg:block">
          <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {visibleGroups.map(g => {
              const GI = g.icon as any;
              const on = g.k === activeGroup;
              return (
                <button key={g.k} onClick={() => { const first = tabs.find(t => t.group === g.k); if (first) setTab(first.k); }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${on ? 'bg-gray-900 text-white dark:bg-gray-700' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  <GI size={15} /> {g.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {groupTabs.map(x => {
              const Icon = x.icon as any;
              return (
                <button key={x.k} onClick={() => setTab(x.k)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === x.k ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                  <Icon size={15} /> {x.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'sitesdepts' && <SitesDepts tenant={tenant} tr={tr} />}
        {tab === 'employes'   && <Employes tenant={tenant} tr={tr} perms={perms} />}
        {tab === 'vehicules'  && <Vehicules tenant={tenant} tr={tr} />}
        {tab === 'ressources' && <Ressources tenant={tenant} tr={tr} />}
        {tab === 'clients'    && <Clients tenant={tenant} tr={tr} />}
        {tab === 'fournisseurs' && <SuppliersManager tenant={tenant} tr={tr} />}
        {tab === 'produits'   && <ProductsCatalog tenant={tenant} tr={tr} />}
        {tab === 'feuilles'   && <FeuillesDeTemps tenant={tenant} tr={tr} />}
        {tab === 'paie'       && <PayeConfig tenant={tenant} tr={tr} />}
        {tab === 'logbook'    && <LogbookModule tenant={tenant} tr={tr} />}
        {tab === 'factures'   && <InvoicingModule tenant={tenant} tr={tr} canEdit={!!perms.viewSalary} initialProject={initialInvoiceProject} />}
        {tab === 'transactions' && <TransactionsModule tenant={tenant} tr={tr} canEdit={!!perms.viewSalary} />}
        {tab === 'soumissions' && <SoumissionsModule tenant={tenant} tr={tr} canEdit={!!perms.viewSalary} allowed={['catalogue']} />}
        {tab === 'bons-commande' && <BonsCommandeModule tenant={tenant} tr={tr} canEdit={!!perms.viewSalary} />}
        {tab === 'permissions' && <PermissionsMatrix tenant={tenant} tr={tr} canEdit={!!perms.manageAll || niveauAcces === 'super_user'} />}
        {tab === 'comptabilite' && <AccountingModule tenant={tenant} tr={tr} canEdit={!!perms.viewSalary} />}
        {tab === 'fiscal'     && <FiscalReportsModule tenant={tenant} tr={tr} />}
        {tab === 'etat-financier' && <FinancialDashboard tenant={tenant} tr={tr} />}
        {tab === 'actionnaires' && <ShareholdersModule tenant={tenant} tr={tr} canEdit={!!perms.manageAll} />}
        {tab === 'alertes' && <AlertsModule tenant={tenant} tr={tr} canEdit={!!perms.manageAll} />}
        {tab === 'audit' && <AuditLog tenant={tenant} tr={tr} />}
        {tab === 'integrations' && <ErpSharing tenant={tenant} tr={tr} canEdit={!!perms.manageAll || niveauAcces === 'super_user' || niveauAcces === 'direction'} />}
        {tab === 'rh'         && <RHHub tenant={tenant} tr={tr} />}
        {tab === 'abonnement' && <Abonnement tenant={tenant} tr={tr} lang={lang} />}
        {tab === 'facturation' && <FacturationProjets tenant={tenant} tr={tr} />}
      </div>
    </div>
  );
}

// ============================================================
// FEUILLES DE TEMPS — admin payroll view + export
// ============================================================

// Année ISO d'une semaine (le jeudi de la semaine détermine l'année) — cohérent avec la numérotation
// des semaines : une semaine peut commencer en déc. (année civile N-1) et appartenir à l'année ISO N.
function isoYearOf(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  return d.getFullYear();
}

function FeuillesDeTemps({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('timesheets').select('*').eq('tenant_id', tenant).order('period_start', { ascending: false });
    setSheets(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  // Réactif : si un employé soumet / un superviseur valide, la table paie se met à jour en direct.
  useRealtime(['timesheets'], tenant, () => load()); // eslint-disable-line

  const employees = useMemo(() => [...new Set(sheets.map((s: any) => s.employee_name))].sort(), [sheets]);
  const years = useMemo(() => {
    const ys = [...new Set(sheets.map((s: any) => isoYearOf(s.period_start)))].sort((a: any, b: any) => b - a) as number[];
    return ys.length ? ys : [new Date().getFullYear()];
  }, [sheets]);

  const filtered = useMemo(() => sheets.filter((s: any) => {
    if (isoYearOf(s.period_start) !== yearFilter) return false;
    if (empFilter && s.employee_name !== empFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  }), [sheets, yearFilter, empFilter, statusFilter]);

  // Transitions paie : validée → vérifiée → payée. Mise à jour DB + horodatage de traçabilité.
  async function setStatus(id: string, status: 'verified' | 'paid' | 'approved') {
    const patch: any = { status };
    if (status === 'verified') patch.verified_at = new Date().toISOString();
    if (status === 'paid') { patch.paid_at = new Date().toISOString(); }
    const { error } = await supabase.from('timesheets').update(patch).eq('id', id).eq('tenant_id', tenant);
    if (error) { alert(tr('Erreur : ', 'Error: ') + error.message); return; }
    load();
  }
  // « Traiter la paie » : marque PAYÉES toutes les feuilles validées/vérifiées de la sélection courante.
  async function processPayroll() {
    const ids = filtered.filter((s: any) => isPayrollProcessable(s.status)).map((s: any) => s.id);
    if (!ids.length) { alert(tr('Aucune feuille validée/vérifiée à payer dans la sélection.', 'No approved/verified sheet to pay in selection.')); return; }
    if (!confirm(tr(`Marquer ${ids.length} feuille(s) comme PAYÉES ? (paie traitée)`, `Mark ${ids.length} sheet(s) as PAID? (payroll processed)`))) return;
    setBusy(true);
    try {
      const { error } = await supabase.from('timesheets').update({ status: 'paid', paid_at: new Date().toISOString() }).in('id', ids).eq('tenant_id', tenant);
      if (error) throw error;
      load();
    } catch (e: any) { alert(tr('Erreur : ', 'Error: ') + (e?.message || 'DB')); }
    finally { setBusy(false); }
  }
  const payableCount = useMemo(() => filtered.filter((s: any) => isPayrollProcessable(s.status)).length, [filtered]);

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
    const toExport = filtered.filter((s: any) => s.status === 'approved' || s.status === 'verified' || s.status === 'paid' || s.status === 'exported');
    if (!toExport.length) { alert(tr('Aucune feuille validée/payée dans la sélection.', 'No approved/paid sheet in selection.')); return; }
    const rows = [
      [tr('Employé', 'Employee'), 'Email', tr('Période #', 'Period #'), tr('Période début', 'Period start'), tr('Période fin', 'Period end'), tr('Hrs rég', 'Reg hrs'), tr('Hrs supp', 'OT hrs'), tr('Hrs maj', 'DT hrs'), tr('Km pers.', 'Personal km'), tr('Déduction véhicule', 'Vehicle deduction'), tr('Montant total', 'Total amount'), tr('Statut', 'Status')].join(','),
      ...toExport.map((s: any) => [`"${s.employee_name}"`, s.employee_email, `P.${weekNum(s.period_start)}`, s.period_start, s.period_end,
        s.total_regular, s.total_overtime, s.total_premium, s.total_km_personal, Number(s.vehicle_deduction || 0), s.total_amount, s.status].join(',')),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })),
      download: `paie_${yearFilter}_${tenant}${empFilter ? `_${empFilter.replace(/\s+/g, '_')}` : ''}.csv`,
    });
    a.click();
  }

  const mny = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
  const en = false; // labels FR par défaut dans cet onglet (tr() gère déjà le reste)

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
          <option value="draft">{tr('En cours', 'In progress')}</option>
          <option value="submitted">{tr('Soumise', 'Submitted')}</option>
          <option value="approved">{tr('Validée', 'Approved')}</option>
          <option value="verified">{tr('Vérifiée', 'Verified')}</option>
          <option value="paid">{tr('Payée', 'Paid')}</option>
          <option value="rejected">{tr('Refusée', 'Rejected')}</option>
        </select>
        <div className="ml-auto flex gap-2">
          <button onClick={processPayroll} disabled={busy || payableCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            title={tr('Marquer payées les feuilles validées/vérifiées de la sélection', 'Mark approved/verified sheets as paid')}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Banknote size={15} />} {tr('Traiter la paie', 'Process payroll')}{payableCount > 0 ? ` (${payableCount})` : ''}
          </button>
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tsCls(s.status)}`}>
                          {tsLabel(s.status)}
                        </span>
                        {s.status === 'submitted' && (
                          <button onClick={() => setStatus(s.id, 'approved')} className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">{tr('Valider', 'Approve')}</button>
                        )}
                        {s.status === 'approved' && (
                          <button onClick={() => setStatus(s.id, 'verified')} className="rounded-lg border border-teal-300 px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50">{tr('Vérifier', 'Verify')}</button>
                        )}
                        {(s.status === 'approved' || s.status === 'verified') && (
                          <button onClick={() => setStatus(s.id, 'paid')} className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700">{tr('Payer', 'Pay')}</button>
                        )}
                      </div>
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
  const [aiTierCents, setAiTierCents] = useState(0); // forfait Assistant IA payé (cents)
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
        // Forfait Assistant IA (facturé en sus du total modules) — table ai_budgets.
        try { const { data: ab } = await supabase.from('ai_budgets').select('tier_cents').eq('tenant_id', tenant).maybeSingle(); if (ab && active) setAiTierCents(Number(ab.tier_cents) || 0); } catch { /* migration 131 absente */ }
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
  const aiAnnual = aiTierCents / 100; // forfait IA, facturé en sus (hors escompte modules)
  const total = subtotal * (1 - discountPct / 100) + aiAnnual;

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (mods.length === 0) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{tr('Aucun module configuré. Contactez votre administrateur.', 'No module configured. Contact your administrator.')}</div>;

  return (
    <div className="space-y-4">
      <AiPlanPanel tenant={tenant} tr={tr} />
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
          {aiAnnual > 0 && (
            <div className="flex justify-between text-purple-600"><span>{tr('Forfait Assistant IA', 'AI Assistant plan')}</span><span>+ {money(aiAnnual)}</span></div>
          )}
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <p className="mt-3 text-xs text-gray-400 leading-relaxed">
          {tr('Pour modifier votre abonnement, contactez votre administrateur C-Secur360.', 'To modify your subscription, contact your C-Secur360 administrator.')}
        </p>
      </div>
    </div>
    </div>
  );
}

// Panneau FORFAIT IA (app-wide, par tenant) : solde, date de renouvellement, alertes 60j/15j, blocage.
function AiPlanPanel({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [b, setB] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [wanted, setWanted] = useState<string>('');
  const [requested, setRequested] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => { let a = true; (async () => {
    try { const r = await fetch(`/api/inventory/ai-budget?tenant=${encodeURIComponent(tenant)}`); if (r.ok && a) { const j = await r.json(); setB(j); setRequested(!!j.renewalRequested); } } catch { /* ignore */ }
    try { const { data } = await supabase.from('ai_plans').select('id, name_fr, price_cents, active, sort_order').eq('active', true).order('sort_order'); if (a && data) setPlans(data); } catch { /* migration 132 */ }
  })(); return () => { a = false; }; }, [tenant]);
  if (!b || b.unlimited) return null; // aucun forfait configure -> rien a afficher
  const c2 = (cents: number) => '$' + ((Number(cents) || 0) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // VUE CLIENT — jamais le budget interne (×70 %) ni la marge. Le forfait s'utilise jusqu'a
  // epuisement (PAS de date). Le client voit son forfait + % restant + demande de renouvellement.
  const remPct = typeof b.remainingPct === 'number' ? b.remainingPct : Math.max(0, 100 - (b.budgetCents > 0 ? Math.round((b.usedCents / b.budgetCents) * 100) : 0));
  const pct = 100 - remPct;
  const exhausted = b.exhausted;
  const low = b.lowBalance && !exhausted; // <=10% restant
  const modPct = (cents: number) => b.budgetCents > 0 ? Math.round((Number(cents) / b.budgetCents) * 100) : 0;
  const mods = Object.entries(b.perModule || {}).filter(([, c]) => modPct(c as number) >= 1);

  const requestRenewal = async () => {
    setSending(true);
    const chosen = plans.find(p => p.id === wanted);
    try { await fetch('/api/inventory/ai-budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant, requestedTierCents: chosen?.price_cents }) }); setRequested(true); } catch { /* ignore */ }
    const subject = `Demande d'ajustement de forfait IA — ${tenant}`;
    const body = `Bonjour,\n\nLe client « ${tenant} » demande ${exhausted ? 'un renouvellement' : 'un ajustement'} de son forfait Assistant IA (jetons).\n${chosen ? `Forfait souhaité : ${chosen.name_fr} — ${Math.round(chosen.price_cents / 100)} $/an.\n` : ''}\nMerci de procéder à l'ajustement du forfait de jetons.\n`;
    window.location.href = `mailto:info@cerdia.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSending(false);
  };

  return (
    <div className={`rounded-2xl border-2 p-5 ${exhausted ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : low ? 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20' : 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Zap size={18} className={exhausted ? 'text-red-600' : 'text-purple-600'} /><h2 className="font-bold">{tr('Assistants IA — jetons', 'AI assistants — tokens')}</h2></div>
        <span className={`text-lg font-extrabold ${exhausted ? 'text-red-700 dark:text-red-300' : 'text-purple-700 dark:text-purple-300'}`}>
          {exhausted ? tr('Épuisé', 'Exhausted') : `${remPct}% ${tr('restant', 'left')}`}
        </span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${exhausted ? 'bg-red-500' : low ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${remPct}%` }} />
      </div>
      <div className="mt-2 text-sm">
        <span className="text-gray-500">{tr('Forfait', 'Plan')} :</span> <b>{c2(b.tierCents)}</b>
        <span className="mx-2 text-gray-300">|</span>
        <span className="text-gray-500">{tr('Consommé', 'Used')} :</span> <b>{pct}%</b>
        <span className="ml-2 text-gray-400">{tr('(s\'utilise jusqu\'à épuisement, sans date)', '(used until depleted, no end date)')}</span>
      </div>
      {mods.length > 0 && <div className="mt-1 text-[11px] text-gray-500">{tr('Par module', 'Per module')} : {mods.map(([m, c]) => `${m} ${modPct(c as number)}%`).join(' · ')}</div>}
      {exhausted && <p className="mt-2 text-sm font-bold text-red-700 dark:text-red-300">⛔ {tr('Forfait de jetons IA épuisé — demandez un renouvellement pour réactiver les assistants.', 'AI token plan exhausted — request a renewal to reactivate the assistants.')}</p>}
      {low && <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">🟠 {tr('Forfait presque épuisé (≤ 10 %).', 'Plan almost depleted (≤ 10%).')}</p>}

      {/* Demande de renouvellement / ajout de forfait -> courriel pré-rempli + drapeau côté admin */}
      <div className="mt-3 border-t border-purple-200/60 pt-3 dark:border-purple-800/60">
        {requested ? (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✅ {tr('Demande envoyée — en attente de l\'ajustement par C-Secur360.', 'Request sent — awaiting adjustment by C-Secur360.')}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {plans.length > 0 && (
              <select value={wanted} onChange={e => setWanted(e.target.value)} className="rounded-lg border border-purple-300 bg-transparent px-2 py-1.5 text-sm dark:border-purple-700">
                <option value="">{tr('Forfait souhaité…', 'Desired plan…')}</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name_fr} — {Math.round(p.price_cents / 100)} $/an</option>)}
              </select>
            )}
            <button onClick={requestRenewal} disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
              <CreditCard size={15} /> {tr('Demander un renouvellement', 'Request a renewal')}
            </button>
          </div>
        )}
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
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid'); // grille (défaut) ou galerie
  const [counts, setCounts] = useState<Record<string, { sites: number; contacts: number }>>({});
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenant).order('name');
    setRows(data || []);
    setLoading(false);
    // Mini-dashboard par client : nb de sites + nb de contacts (best-effort, migration 133).
    try {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('client_sites').select('client_id').eq('tenant_id', tenant),
        supabase.from('client_contacts').select('client_id').eq('tenant_id', tenant),
      ]);
      const map: Record<string, { sites: number; contacts: number }> = {};
      (s || []).forEach((r: any) => { const k = String(r.client_id); (map[k] ||= { sites: 0, contacts: 0 }).sites++; });
      (c || []).forEach((r: any) => { const k = String(r.client_id); (map[k] ||= { sites: 0, contacts: 0 }).contacts++; });
      setCounts(map);
    } catch { setCounts({}); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  function select(i: number) { setSelected(i); setForm({ ...rows[i] }); }
  function deselect() { setSelected(null); setForm(empty()); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true); setNotice(null);
    // Insert/update resilient : on lit l'erreur (une requete Supabase ne throw pas) et on retire
    // automatiquement toute colonne absente du schema reel (table `clients` creee par 010 sans
    // les colonnes plates) pour que l'enregistrement n'echoue jamais silencieusement.
    const full: any = { tenant_id: tenant, ...form };
    delete full.id;
    const attempt = (p: any) => form.id
      ? supabase.from('clients').update(p).eq('id', form.id)
      : supabase.from('clients').insert(p);
    let res: any = await attempt(full);
    let guard = 0;
    while (res.error && guard < 15) {
      const msg = res.error.message || '';
      const m = msg.match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
      const col = m ? (m[1] || m[2] || m[3]) : null;
      if (col && col in full && col !== 'name' && col !== 'tenant_id') { delete full[col]; res = await attempt(full); guard++; }
      else break;
    }
    if (res.error) { setNotice('Erreur : ' + res.error.message); setSaving(false); return; }
    setNotice(tr('Client enregistré ✓', 'Client saved ✓'));
    deselect(); load(); setSaving(false);
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div><h2 className="font-bold">{tr('Répertoire clients', 'Client directory')} <span className="text-xs font-normal text-gray-400">({rows.length})</span></h2>
          <p className="text-xs text-gray-500">{tr('Prérempli automatiquement lors de la création de projets.', 'Auto-fills when creating projects.')}</p></div>
          <div className="flex items-center gap-2">
            {/* Bascule Grille / Galerie */}
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-600">
              <button onClick={() => setViewMode('grid')} className={`rounded-md px-2 py-1 font-semibold ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Grille', 'Grid')}</button>
              <button onClick={() => setViewMode('gallery')} className={`rounded-md px-2 py-1 font-semibold ${viewMode === 'gallery' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Galerie', 'Gallery')}</button>
            </div>
            <button onClick={() => { deselect(); setForm(empty()); setSelected(-1); }}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
              <Plus size={15} /> {tr('Nouveau', 'New')}
            </button>
          </div>
        </div>
        {loading ? <div className="grid place-items-center py-12 text-gray-400"><Loader2 className="animate-spin" /></div> : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">{tr('Aucun client. Crée-en un.', 'No client. Create one.')}</div>
        ) : (
          <div className={`p-3 ${viewMode === 'gallery' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'grid grid-cols-2 gap-2 sm:grid-cols-3'}`}>
            {rows.map((r, i) => {
              const ct = counts[String(r.id)] || { sites: 0, contacts: 0 };
              const sel = selected === i;
              if (viewMode === 'gallery') {
                return (
                  <button key={r.id} onClick={() => select(i)} type="button"
                    className={`rounded-xl border-2 p-3 text-left transition hover:shadow-md ${sel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700"><Building2 size={16} className="text-slate-500" /></div>
                      <div className="min-w-0 flex-1"><div className="truncate font-bold">{r.name}</div>{!r.active && <span className="text-[10px] text-gray-400">{tr('Inactif', 'Inactive')}</span>}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20"><div className="text-lg font-bold text-blue-700 dark:text-blue-300">{ct.sites}</div><div className="text-[10px] text-blue-600/80 dark:text-blue-400">{tr('site(s)', 'site(s)')}</div></div>
                      <div className="rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-900/20"><div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{ct.contacts}</div><div className="text-[10px] text-emerald-600/80 dark:text-emerald-400">{tr('contact(s)', 'contact(s)')}</div></div>
                    </div>
                  </button>
                );
              }
              return (
                <button key={r.id} onClick={() => select(i)} type="button"
                  className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left transition hover:shadow-sm ${sel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
                  <div className="flex items-center gap-2">
                    <Building2 size={15} className="shrink-0 text-slate-400" />
                    <span className="truncate text-sm font-semibold">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"><MapPin size={10} className="inline" /> {ct.sites}</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">👤 {ct.contacts}</span>
                    {!r.active && <span className="text-gray-400">· {tr('Inactif', 'Inactive')}</span>}
                  </div>
                </button>
              );
            })}
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
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Nom du client *', 'Client name *')}</label>
            <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ArcelorMittal" autoFocus />
            <p className="mt-1 text-[11px] text-gray-400">{tr("Enregistre le client, puis ajoute ses sites (adresse + facturation par site) et leurs contacts ci-dessous.", 'Save the client, then add its sites (address + per-site billing) and their contacts below.')}</p>
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

          {/* Cascade : Sites (adresses) -> Contacts. Disponible une fois le client enregistré. */}
          {form.id
            ? <ClientCascade tenant={tenant} clientId={form.id} tr={tr} inp={inp} />
            : <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{tr('Enregistre le client pour ajouter ses sites et contacts.', 'Save the client to add its sites and contacts.')}</p>}
        </div>
      )}
    </div>
  );
}

// Cascade Client -> SITES (un nom, plusieurs adresses) -> CONTACTS (personnes par site).
// Ex. ArcelorMittal / Complexe Ouest / Marcel Dionne. Tables client_sites + client_contacts (133).
function ClientCascade({ tenant, clientId, tr, inp }: { tenant: string; clientId: string; tr: (f: string, e: string) => string; inp: string }) {
  // Un SITE porte : son adresse d'exécution, son adresse de FACTURATION (peut différer par site),
  // et ses CONTACTS. La facturation est donc PAR SITE (pas une section globale).
  type Site = { id?: string; name: string; address: string; city: string; province: string; postal_code: string; billing_address: string; billing_city: string; billing_province: string; billing_postal_code: string; active: boolean };
  type Contact = { id?: string; site_id: string | null; name: string; title: string; email: string; phone: string; mobile: string; is_primary: boolean; active: boolean };
  const provinces = ['QC','ON','BC','AB','SK','MB','NB','NS','PE','NL','NT','YT','NU'];
  const [sites, setSites] = useState<Site[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [openSite, setOpenSite] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState<Site | null>(null);
  const [contactForm, setContactForm] = useState<Contact | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('client_sites').select('*').eq('tenant_id', tenant).eq('client_id', clientId).order('name'),
      supabase.from('client_contacts').select('*').eq('tenant_id', tenant).eq('client_id', clientId).order('name'),
    ]);
    setSites(s || []); setContacts(c || []);
  }
  useEffect(() => { load(); setOpenSite(null); setSiteForm(null); setContactForm(null); /* eslint-disable-next-line */ }, [clientId, tenant]);

  async function saveSite() {
    if (!siteForm || !siteForm.name.trim()) return;
    setErr(null);
    const p: any = { tenant_id: tenant, client_id: clientId, name: siteForm.name, address: siteForm.address, city: siteForm.city, province: siteForm.province, postal_code: siteForm.postal_code, billing_address: siteForm.billing_address, billing_city: siteForm.billing_city, billing_province: siteForm.billing_province, billing_postal_code: siteForm.billing_postal_code, active: siteForm.active };
    const res = siteForm.id ? await supabase.from('client_sites').update(p).eq('id', siteForm.id) : await supabase.from('client_sites').insert(p);
    if (res.error) { setErr(res.error.message); return; }
    setSiteForm(null); load();
  }
  async function delSite(id: string) {
    await supabase.from('client_contacts').delete().eq('site_id', id);
    await supabase.from('client_sites').delete().eq('id', id);
    if (openSite === id) setOpenSite(null);
    load();
  }
  async function saveContact() {
    if (!contactForm || !contactForm.name.trim()) return;
    setErr(null);
    const p: any = { tenant_id: tenant, client_id: clientId, site_id: contactForm.site_id, name: contactForm.name, title: contactForm.title, email: contactForm.email, phone: contactForm.phone, mobile: contactForm.mobile, is_primary: contactForm.is_primary, active: contactForm.active };
    const res = contactForm.id ? await supabase.from('client_contacts').update(p).eq('id', contactForm.id) : await supabase.from('client_contacts').insert(p);
    if (res.error) { setErr(res.error.message); return; }
    setContactForm(null); load();
  }
  async function delContact(id: string) { await supabase.from('client_contacts').delete().eq('id', id); load(); }

  const emptySite = (): Site => ({ name: '', address: '', city: '', province: 'QC', postal_code: '', billing_address: '', billing_city: '', billing_province: 'QC', billing_postal_code: '', active: true });
  const emptyContact = (siteId: string | null): Contact => ({ site_id: siteId, name: '', title: '', email: '', phone: '', mobile: '', is_primary: false, active: true });
  const lbl = 'mb-1 block text-[11px] font-semibold text-gray-500';

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold"><MapPin size={15} className="text-blue-500" /> {sites.length > 1 ? tr('Sites du client', 'Client sites') : tr('Site du client', 'Client site')} <span className="text-xs font-normal text-gray-400">({sites.length})</span></h3>
        <button onClick={() => setSiteForm(emptySite())} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-800"><Plus size={13} /> {sites.length === 0 ? tr('Ajouter le site', 'Add site') : tr('Ajouter un site (expansion)', 'Add site (expansion)')}</button>
      </div>
      {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20">{err}</div>}

      {siteForm && (
        <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
          <div><label className={lbl}>{tr('Nom du site *', 'Site name *')}</label><input className={inp} value={siteForm.name} onChange={e => setSiteForm(s => s && ({ ...s, name: e.target.value }))} placeholder="Complexe Ouest" /></div>
          <div><label className={lbl}>{tr('Adresse', 'Address')}</label><input className={inp} value={siteForm.address} onChange={e => setSiteForm(s => s && ({ ...s, address: e.target.value }))} placeholder="1 rue de l'Aciérie" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2"><label className={lbl}>{tr('Ville', 'City')}</label><input className={inp} value={siteForm.city} onChange={e => setSiteForm(s => s && ({ ...s, city: e.target.value }))} /></div>
            <div><label className={lbl}>Prov.</label><select className={inp} value={siteForm.province} onChange={e => setSiteForm(s => s && ({ ...s, province: e.target.value }))}>{provinces.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div><label className={lbl}>{tr('Code postal', 'Postal code')}</label><input className={`${inp} uppercase`} value={siteForm.postal_code} onChange={e => setSiteForm(s => s && ({ ...s, postal_code: e.target.value.toUpperCase() }))} placeholder="H1A 2B3" /></div>

          {/* Adresse de FACTURATION de CE site (peut différer). Laisser vide = facturer à l'adresse du site. */}
          <div className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2 dark:border-emerald-800 dark:bg-emerald-900/10">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300"><CreditCard size={12} /> {tr('Adresse de facturation (si différente du site)', 'Billing address (if different from site)')}</div>
            <div><label className={lbl}>{tr('Adresse', 'Address')}</label><input className={inp} value={siteForm.billing_address} onChange={e => setSiteForm(s => s && ({ ...s, billing_address: e.target.value }))} placeholder={tr('Vide = même que le site', 'Empty = same as site')} /></div>
            <div className="mt-1 grid grid-cols-4 gap-2">
              <div className="col-span-2"><label className={lbl}>{tr('Ville', 'City')}</label><input className={inp} value={siteForm.billing_city} onChange={e => setSiteForm(s => s && ({ ...s, billing_city: e.target.value }))} /></div>
              <div><label className={lbl}>Prov.</label><select className={inp} value={siteForm.billing_province} onChange={e => setSiteForm(s => s && ({ ...s, billing_province: e.target.value }))}>{provinces.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div><label className={lbl}>{tr('C. postal', 'Postal')}</label><input className={`${inp} uppercase`} value={siteForm.billing_postal_code} onChange={e => setSiteForm(s => s && ({ ...s, billing_postal_code: e.target.value.toUpperCase() }))} /></div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={saveSite} disabled={!siteForm.name.trim()} className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{tr('Enregistrer le site', 'Save site')}</button>
            <button onClick={() => setSiteForm(null)} className="rounded-lg border border-gray-300 px-3 text-xs dark:border-gray-600">{tr('Annuler', 'Cancel')}</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sites.map((s, si) => {
          const sc = contacts.filter(c => c.site_id === s.id);
          const open = openSite === s.id;
          return (
            <div key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 px-3 py-2">
                <button onClick={() => setOpenSite(open ? null : (s.id || null))} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  {open ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{s.name}</span>
                      {sites.length === 1
                        ? <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tr('Site unique', 'Single site')}</span>
                        : si === 0 && <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tr('Principal', 'Main')}</span>}
                    </div>
                    <div className="truncate text-xs text-gray-500">{[s.address, s.city, s.province].filter(Boolean).join(', ') || tr('Aucune adresse', 'No address')} · {sc.length} {tr('contact(s)', 'contact(s)')}</div>
                    {s.billing_address && <div className="truncate text-[11px] text-emerald-600 dark:text-emerald-400">💳 {tr('Facturation', 'Billing')} : {[s.billing_address, s.billing_city, s.billing_province].filter(Boolean).join(', ')}</div>}
                  </div>
                </button>
                <button onClick={() => setSiteForm({ ...s })} className="text-gray-400 hover:text-blue-600" title={tr('Modifier', 'Edit')}><Settings size={14} /></button>
                <button onClick={() => delSite(s.id!)} className="text-gray-400 hover:text-red-600" title={tr('Supprimer', 'Delete')}><Trash2 size={14} /></button>
              </div>

              {open && (
                <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30">
                  {sc.map(c => (
                    <div key={c.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 dark:bg-gray-800">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.name} {c.is_primary && <span className="ml-1 rounded bg-emerald-100 px-1 text-[10px] text-emerald-700">{tr('Principal', 'Primary')}</span>}</div>
                        <div className="truncate text-xs text-gray-500">{[c.title, c.phone || c.mobile, c.email].filter(Boolean).join(' · ')}</div>
                      </div>
                      <button onClick={() => setContactForm({ ...c })} className="text-gray-400 hover:text-blue-600"><Settings size={13} /></button>
                      <button onClick={() => delContact(c.id!)} className="text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  {contactForm && contactForm.site_id === s.id ? (
                    <div className="space-y-2 rounded-lg border border-emerald-200 bg-white p-2 dark:border-emerald-800 dark:bg-gray-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className={lbl}>{tr('Nom *', 'Name *')}</label><input className={inp} value={contactForm.name} onChange={e => setContactForm(c => c && ({ ...c, name: e.target.value }))} placeholder="Marcel Dionne" /></div>
                        <div><label className={lbl}>{tr('Fonction', 'Title')}</label><input className={inp} value={contactForm.title} onChange={e => setContactForm(c => c && ({ ...c, title: e.target.value }))} placeholder={tr('Contremaître', 'Foreman')} /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div><label className={lbl}>{tr('Tél.', 'Phone')}</label><input className={inp} value={contactForm.phone} onChange={e => setContactForm(c => c && ({ ...c, phone: e.target.value }))} /></div>
                        <div><label className={lbl}>{tr('Cell.', 'Mobile')}</label><input className={inp} value={contactForm.mobile} onChange={e => setContactForm(c => c && ({ ...c, mobile: e.target.value }))} /></div>
                        <div><label className={lbl}>{tr('Courriel', 'Email')}</label><input className={inp} value={contactForm.email} onChange={e => setContactForm(c => c && ({ ...c, email: e.target.value }))} /></div>
                      </div>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={contactForm.is_primary} onChange={e => setContactForm(c => c && ({ ...c, is_primary: e.target.checked }))} /> {tr('Contact principal du site', 'Primary site contact')}</label>
                      <div className="flex gap-2">
                        <button onClick={saveContact} disabled={!contactForm.name.trim()} className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{tr('Enregistrer le contact', 'Save contact')}</button>
                        <button onClick={() => setContactForm(null)} className="rounded-lg border border-gray-300 px-3 text-xs dark:border-gray-600">{tr('Annuler', 'Cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setContactForm(emptyContact(s.id || null))} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"><Plus size={13} /> {tr('Ajouter un contact', 'Add a contact')}</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {sites.length === 0 && !siteForm && <p className="text-center text-xs text-gray-400">{tr('Ajoute le site du client (adresse + contacts). Tu pourras en ajouter d’autres si le client a des expansions.', 'Add the client site (address + contacts). You can add more if the client expands.')}</p>}
      </div>
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

// Taux ARC/Revenu Québec 2026 — centralisés dans lib/constants/arc.ts (cohérence avec les feuilles de temps)

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
  personnelSuggestions: string[]; tenantUsers: { id: string; name: string; email: string; is_active?: boolean }[];
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
                        ...tenantUsers.map(u => ({ value: u.id, label: (u.name || u.email) + (u.is_active === false ? ` (${tr('inactif', 'inactive')})` : '') })),
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
                  <div className="overflow-x-auto rounded-xl border border-blue-200 dark:border-blue-500/30">
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
                  <div className="overflow-x-auto rounded-xl border border-violet-200 dark:border-violet-500/30">
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
                  <div className="overflow-x-auto rounded-xl border border-emerald-200 dark:border-emerald-500/30">
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
  const [tenantUsers, setTenantUsers] = useState<{ id: string; name: string; email: string; is_active?: boolean }[]>([]);
  const [activeRegime, setActiveRegime] = useState<VRegime>('A_achat');
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const REGIMES: { k: VRegime; label: string; desc: string; color: string; bg: string }[] = [
    { k: 'A_achat',       label: tr('Régime A — Acheté',      'Regime A — Purchased'), desc: tr('Véhicule acheté par l\'employeur. DPA Cat. 10/10.1 (thermique, 30 %/an) ou Cat. 54 (ZEV, 100 % an 1). Avantage imposable : droit d\'usage 2 %/mois + fonctionnement 0,34 $/km perso.', 'Employer-purchased vehicle. CCA Class 10/10.1 (ICE, 30%/yr) or Class 54 (EV, 100% yr 1). Taxable benefit: standby 2%/mo + operating 0.34/km personal.'), color: 'bg-violet-600', bg: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200' },
    { k: 'A_bail',        label: tr('Régime A — Bail',         'Regime A — Lease'),     desc: tr('Véhicule loué par l\'employeur. Bail déductible plafonné à 1 050 $/mois (ARC 2026). Avantage : 2/3 du coût mensuel × mois disponibles.', 'Employer-leased vehicle. Deductible lease capped at $1,050/mo (CRA 2026). Benefit: 2/3 of monthly cost × available months.'), color: 'bg-blue-600', bg: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200' },
    { k: 'A_financement', label: tr('Régime A — Financement',  'Regime A — Financed'),  desc: tr('Véhicule financé par l\'employeur. Intérêts déductibles plafonnés à 300 $/mois (ARC 2026). Avantage droit d\'usage calculé sur le prix d\'achat.', 'Employer-financed vehicle. Deductible interest capped at $300/mo (CRA 2026). Standby benefit calculated on purchase price.'), color: 'bg-sky-600', bg: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200' },
    { k: 'B_personnel',   label: tr('Régime B — Personnel',    'Regime B — Personal'),  desc: tr('Employé utilise son propre véhicule. Remboursement non imposable si ≤ taux ARC (0,73 $/km ≤ 5 000 km; 0,67 $/km au-delà). Aucun avantage imposable si conforme.', 'Employee uses own vehicle. Non-taxable reimbursement if ≤ CRA rate ($0.73/km ≤ 5,000 km; $0.67/km beyond). No taxable benefit if compliant.'), color: 'bg-emerald-600', bg: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200' },
  ];

  useEffect(() => {
    // TOUS les employés (pas seulement is_active) — un véhicule peut être attitré à n'importe qui ;
    // on garde aussi ceux sans nom (repli courriel) pour ne pas en « perdre » dans la liste.
    supabase.from('planner_personnel').select('id, name, email, is_active').eq('tenant_id', tenant).order('name')
      .then(({ data: personnel }) => {
        const list = (personnel || []).map((p: any) => ({ id: p.id, name: p.name?.trim() || '', email: p.email || '', is_active: p.is_active !== false })).filter(p => p.name || p.email);
        setPersonnelSuggestions(list.filter(p => p.name).map(p => p.name));
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

  const upd = (i: number, k: keyof VRow, v: any) => {
    setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
    // Les véhicules sont groupés par régime (onglets). Changer le régime d'une ligne la déplacerait
    // hors de l'onglet courant -> on SUIT la ligne vers son nouvel onglet (sinon elle « s'éjecte »).
    if (k === 'regime') setActiveRegime(v as VRegime);
  };

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
          plate: r.plate || '', plate_number: r.plate || '', employee_name: r.employee_name || '',
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
  type UserAccount = { id: string; email: string; name: string; role: string; is_active: boolean; site_id?: string | null };
  const inp2 = 'w-full rounded-lg border border-gray-300 bg-transparent px-2.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600';

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [users, setUsers]         = useState<UserAccount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Personnel | null>(null);
  const [form, setForm]           = useState({ email: '', name: '', role: 'user', password: '', site_id: '' });
  const [sites, setSites]         = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy]           = useState(false);
  const [notice, setNotice]       = useState<string | null>(null);
  const [showPwd, setShowPwd]     = useState(true); // visible par défaut : champ clairement éditable (l'admin doit lire/communiquer le mot de passe)
  const [copied, setCopied]       = useState(false);
  const [showPwdFor, setShowPwdFor] = useState<string | null>(null); // ligne dont le mot de passe est révélé

  // Repli local : si la colonne access_password (migration 079) n'existe pas encore, on conserve
  // le mot de passe d'accès localement pour qu'il reste affiché dans la fiche et NE soit PAS régénéré.
  const pwdKey = (id: string) => `acc_pwd_${tenant}_${id}`;
  const readLocalPwd = (id?: string) => { if (!id || typeof window === 'undefined') return ''; try { return window.localStorage.getItem(pwdKey(id)) || ''; } catch { return ''; } };
  const writeLocalPwd = (id?: string, pwd?: string) => { if (!id || typeof window === 'undefined') return; try { if (pwd) window.localStorage.setItem(pwdKey(id), pwd); } catch { /* quota */ } };

  async function load() {
    setLoading(true);
    // Liste d'accès via la route SERVEUR (access_password fermé à l'anon).
    let pers: any[] | null = null;
    const accRes = await fetch(`/api/hr/personnel?access=1&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
    pers = (accRes as any).personnel || [];
    const usersRes = await fetch(`/api/admin/users?tenant=${tenant}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ users: [] }));
    // Fusionne le repli local pour les fiches dont access_password n'est pas (ou plus) en base.
    const merged = (pers || []).filter((p: any) => p.name).map((p: any) => ({ ...p, access_password: p.access_password || readLocalPwd(p.id) }));
    setPersonnel(merged);
    setUsers(usersRes?.users || []);
    try {
      const { data: sg } = await supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name');
      setSites(((sg as any[]) || []).filter(r => !r.parent_id).map(r => ({ id: r.id, name: r.name })));
    } catch { /* sites indisponibles */ }
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
    // Garde TOUJOURS le mot de passe stocké (base ou repli local). S'il n'y en a pas et que
    // c'est un nouveau compte, on génère UNE proposition et on la fige aussitôt (repli local)
    // pour qu'elle NE change PAS au prochain retour sur la page.
    const stored = p.access_password || readLocalPwd(p.id);
    let pwd = stored || '';
    if (!pwd && !existing) { pwd = generatePassword(p.name); writeLocalPwd(p.id, pwd); }
    setForm({
      email:    p.email || suggestEmail(p.name, tenant),
      name:     p.name,
      role:     niveauToRole[p.niveauAcces || ''] || 'user',
      password: pwd,
      site_id:  existing?.site_id || '',
    });
    setShowPwd(true); // visible : le champ reste clairement éditable
  }

  function regenerate() {
    const np = generatePassword(form.name || 'User');
    setForm(f => ({ ...f, password: np }));
    if (selected?.id) writeLocalPwd(selected.id, np); // fige la nouvelle valeur (stable au retour)
    setShowPwd(true); setCopied(false);
  }

  // Enregistre le mot de passe dans la fiche de l'employé (sans forcément (re)créer le compte d'accès).
  async function savePwdToFiche() {
    if (!selected?.id) return;
    if (!form.password.trim()) { setNotice(tr('Saisissez ou générez un mot de passe.', 'Enter or generate a password.')); return; }
    setBusy(true); setNotice(null);
    try {
      await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'access', tenant,id: selected.id, password: form.password }) });
      writeLocalPwd(selected.id, form.password);
      setSelected(s => s ? { ...s, access_password: form.password } : s);
      setPersonnel(list => list.map(p => p.id === selected.id ? { ...p, access_password: form.password } : p));
      setNotice(tr('Mot de passe enregistré dans la fiche ✓', 'Password saved to the record ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
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
      // Synchronise le courriel (si la fiche n'en avait pas) + le mot de passe dans la fiche,
      // sinon le badge « ✓ compte » ne correspond pas (courriel fiche vide ≠ courriel du compte).
      if (selected?.id) {
        await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'access', tenant,id: selected.id, password: form.password, email: form.email }) });
        writeLocalPwd(selected.id, form.password);
      }
      setSelected(s => s ? { ...s, access_password: form.password, email: form.email } : s);
      setNotice(tr('Compte créé ✓ — courriel et mot de passe enregistrés dans la fiche.', 'Account created ✓ — email and password saved to the record.'));
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
      const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: acc.id, password: form.password, site_id: form.site_id || null }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      if (selected?.id) { await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'access', tenant,id: selected.id, password: form.password, email: form.email }) }); writeLocalPwd(selected.id, form.password); }
      setSelected(s => s ? { ...s, access_password: form.password, email: form.email } : s);
      setNotice(tr('Mot de passe mis à jour ✓ — enregistré dans la fiche.', 'Password updated ✓ — saved to the record.'));
      load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setBusy(false); }
  }

  async function toggleActive(u: UserAccount) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, is_active: !u.is_active }) });
    load();
  }

  // Assigne un site à un compte directement depuis la liste (atterrissage par défaut de l'utilisateur).
  async function setUserSite(u: UserAccount, siteId: string) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, site_id: siteId || null }) });
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
      // Conserve le nouveau mot de passe dans la fiche (base + repli local par id du personnel).
      await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'access', tenant,email_match: pwdEditFor.email, password: pwdEditValue }) });
      const matchPers = personnel.find(p => (p.email || '').toLowerCase() === (pwdEditFor.email || '').toLowerCase());
      if (matchPers?.id) writeLocalPwd(matchPers.id, pwdEditValue);
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

            {sites.length > 0 && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{tr('Site assigné (atterrissage par défaut)', 'Assigned site (default landing)')}</label>
                <select className={inp2} value={form.site_id} onChange={e => setForm(f => ({ ...f, site_id: e.target.value }))}>
                  <option value="">{tr('Aucun — voit tous les sites', 'None — sees all sites')}</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                {tr('Mot de passe', 'Password')}
                <span className="text-[10px] text-gray-400 font-normal">{tr('Personnalisable — tapez le vôtre ou ↻ pour générer', 'Custom — type your own or ↻ to generate')}</span>
              </label>
              {/* Un SEUL champ éditable (aperçu/copie intégrés) — évite la confusion d'un doublon en lecture seule. */}
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder={tr('Tapez un mot de passe ou cliquez ↻', 'Type a password or click ↻')} className={`${inp2} pr-9 font-mono text-base tracking-wider`} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPwd(v => !v)} title={showPwd ? tr('Masquer', 'Hide') : tr('Afficher', 'Show')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">{showPwd ? '🙈' : '👁'}</button>
                </div>
                <button type="button" onClick={copyPwd} title={tr('Copier', 'Copy')} className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10' : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{copied ? '✓' : '📋'}</button>
                <button type="button" onClick={regenerate} title={tr('Régénérer', 'Regenerate')} className="shrink-0 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">↻</button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {(() => { const acc = userByEmail[(form.email || '').toLowerCase()]; return (
              <button onClick={acc ? updateAccount : createAccount} disabled={busy} className={`flex-1 inline-flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60 ${acc ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {acc ? tr('Mettre à jour l’accès', 'Update access') : tr('Créer l’accès (connexion)', 'Create access (login)')}
              </button>
              ); })()}
              <button onClick={savePwdToFiche} disabled={busy} title={tr('Enregistre le mot de passe dans la fiche seulement — NE crée PAS le compte de connexion', 'Saves the password to the record only — does NOT create the login account')}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                💾 {tr('Fiche', 'Record')}
              </button>
              <button onClick={copyAll} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">📋 {tr('Tout', 'All')}</button>
            </div>
            <p className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">
              {(() => { const acc = userByEmail[(form.email || '').toLowerCase()]; return acc
                ? tr('✓ Ce compte de connexion existe. « Mettre à jour l’accès » change son mot de passe.', '✓ This login account exists. "Update access" changes its password.')
                : tr('⚠ Aucun compte de connexion pour ce courriel. Cliquez « Créer l’accès » pour qu’il puisse se connecter — « Fiche » ne fait qu’enregistrer le mot de passe affiché.', '⚠ No login account for this email. Click "Create access" so they can log in — "Record" only saves the displayed password.'); })()}
            </p>
            <div className="hidden">
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
                  {sites.length > 0 && (
                    <select value={u.site_id || ''} onChange={e => setUserSite(u, e.target.value)} title={tr('Site assigné', 'Assigned site')}
                      className="shrink-0 rounded-full border border-gray-200 dark:border-gray-600 bg-transparent px-1.5 py-0.5 text-[10px] text-gray-600 dark:text-gray-300 outline-none max-w-[110px]">
                      <option value="">{tr('Tous les sites', 'All sites')}</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  <button onClick={() => startPwdEdit(u)} title={tr('Changer mot de passe', 'Change password')}
                    className="text-[11px] rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 font-semibold shrink-0">
                    🔑
                  </button>
                  <button onClick={() => toggleActive(u)} title={u.is_active ? tr('Suspendre le compte (connexion bloquée)', 'Suspend account (login blocked)') : tr('Réactiver le compte', 'Reactivate account')}
                    className={`text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${u.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                    {u.is_active ? tr('Suspendre', 'Suspend') : tr('Réactiver', 'Reactivate')}
                  </button>
                  {confirmDel === u.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => deleteUser(u)} disabled={busy} className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        {busy ? <Loader2 size={10} className="animate-spin" /> : tr('Confirmer', 'Confirm')}
                      </button>
                      <button onClick={() => setConfirmDel(null)} className="text-[10px] text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(u.id)} title={tr('Supprimer le compte', 'Delete account')}
                      className="shrink-0 rounded-full bg-red-50 p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400">
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

function EmployeeEvaluationModal({ tenant, tr, employee, onClose, onSaved, canEdit }: { tenant: string; tr: (f: string, e: string) => string; employee: { id: string; name: string; email?: string; role?: string; subclass?: string; hire_date?: string; hire_salary?: number; current_salary?: number; current_grid_id?: string; acquired_skills?: any[]; last_evaluation_date?: string }; onClose: () => void; onSaved: () => void; canEdit: boolean }) {
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
      const { data: hist, error: histErr } = await supabase.from('employee_evaluations').select('*').eq('personnel_id', employee.id).order('evaluation_date', { ascending: false });
      if (histErr) setNotice(tr('Historique indisponible — exécutez les migrations 076 et 083 dans Supabase.', 'History unavailable — run migrations 076 and 083 in Supabase.'));
      setHistory(hist || []);
      // Pré-charge les notes (curseurs) depuis la DERNIÈRE évaluation enregistrée -> les curseurs
      // restent au même point que la dernière fois (sinon ils repartaient à zéro).
      const lastEval: any = (hist || [])[0];
      const empScores = (employee as any).skill_scores;
      if (empScores && typeof empScores === 'object' && !Array.isArray(empScores) && Object.keys(empScores).length > 0) {
        setScores(empScores as Record<string, number>);
      } else if (lastEval?.scores && typeof lastEval.scores === 'object' && !Array.isArray(lastEval.scores)) {
        setScores(lastEval.scores as Record<string, number>);
      } else if (Array.isArray(employee.acquired_skills)) {
        const acc: Record<string, number> = {};
        employee.acquired_skills.forEach((s: any) => { if (s?.id) acc[s.id] = s.level ?? s.score ?? 0; });
        setScores(acc);
      }
      // Reprend aussi le salaire de référence de la dernière éval (sinon curseur salaire bouge).
      if (lastEval?.salary_after != null && !employee.current_salary) setCurrentSalary(String(lastEval.salary_after));
      // Trouver le poste de l'employé
      const { data: posteRow } = await supabase.from('planner_postes').select('id').eq('tenant_id', tenant).eq('name', employee.role || '').maybeSingle();
      if (posteRow?.id) {
        // Grille salariale via la route SERVEUR protégée (table fermée à l'anon).
        const sg = await fetch(`/api/hr/salary-grid?posteId=${posteRow.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
        const g = (sg as any).grid;
        if (g) {
          setGrid(g);
          setTiers((sg as any).tiers || []);
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
      // Écriture SALAIRE/ÉVALUATION via la route SERVEUR (colonnes salariales fermées à l'anon ;
      // fallback colonnes récentes géré côté serveur). Niveau requis : canHr.
      const evalRes = await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'eval', tenant,id: employee.id, payload: empPayload }) });
      const evalJson = await evalRes.json().catch(() => ({}));
      if (!evalRes.ok || evalJson.error) throw new Error(evalJson.error || 'DB');

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

      // Propage le salaire de l'évaluation -> profil de paie (taux horaire).
      // Le profil de paie est clé sur planner_personnel.id (= employee.id ici).
      try {
        const hourly = reco.newSalary > 0 && hpy > 0 ? Math.round((reco.newSalary / hpy) * 10000) / 10000 : null;
        if (hourly != null) {
          const { data: ep } = await supabase.from('employee_profiles').select('id').eq('tenant_id', tenant).eq('employee_id', employee.id).maybeSingle();
          if (ep?.id) await supabase.from('employee_profiles').update({ hourly_rate: hourly }).eq('id', ep.id);
          else await supabase.from('employee_profiles').insert({ tenant_id: tenant, employee_id: employee.id, employee_name: employee.name, employee_email: (employee as any).email || '', hourly_rate: hourly, ot_multiplier: 1.5, dt_multiplier: 2.0, ot_daily_hrs: 8, ot_weekly_hrs: 40, active: true });
        }
      } catch { /* paie facultative — n'empêche pas l'enregistrement de l'éval */ }

      setNotice(tr('Évaluation enregistrée ✓ (taux horaire de paie mis à jour)', 'Evaluation saved ✓ (payroll hourly rate updated)'));
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
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{tr('Taux', 'Rate')} $/h ≈ {((parseFloat(hireSalary) || 0) / hpy).toFixed(2)} $</p>
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
                  {tr('Taux', 'Rate')} $/h ≈ {(parseFloat(currentSalary) / (grid.hours_per_year || 2080) || 0).toFixed(2)} $
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
                {([['Métier', 'Trade'], ['Spécialité', 'Specialty'], ['Domaine', 'Field'], ['Certification', 'Certification'], ['Autre', 'Other']] as [string, string][]).map(([v, en]) => <option key={v} value={v}>{tr(v, en)}</option>)}
              </select>
            </div>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={10} autoFocus
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm font-mono"
              placeholder={tr(`Technique\nÉlectrique | EL\nMécanique\nSoudure TIG\nGestion\n…`, `Technical\nElectrical | EL\nMechanical\nTIG welding\nManagement\n…`)} />
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
                          {([['Métier', 'Trade'], ['Spécialité', 'Specialty'], ['Domaine', 'Field'], ['Certification', 'Certification'], ['Autre', 'Other']] as [string, string][]).map(([v, en]) => <option key={v} value={v}>{tr(v, en)}</option>)}
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
  const [subTab, setSubTab] = useState<'personnel' | 'postes' | 'sousclasses' | 'comptes' | 'taches'>('personnel');
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
          { k: 'taches',      label: tr('Tâches récurrentes',        'Recurring tasks'),    icon: Timer },
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
      {subTab === 'taches'      && <RecurringTasksPlanner tenant={tenant} tr={tr} inp={inp} />}
    </div>
  );
}

// Catalogue de tâches récurrentes du tenant (bureau/atelier/soumission/administration…).
// Sert à associer une ligne de feuille de temps ou une tâche planifiée quand ce n'est pas un projet.
function RecurringTasksPlanner({ tenant, tr, inp }: { tenant: string; tr: (f: string, e: string) => string; inp: string }) {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<RecurringTask>({ name: '', code: '', billable: false, active: true });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => { setLoading(true); setTasks(await listRecurringTasks(tenant, false)); setLoading(false); }, [tenant]);
  useEffect(() => { reload(); }, [reload]);

  async function add() {
    if (!draft.name.trim()) return;
    setBusy(true);
    const res = await saveRecurringTask(tenant, { ...draft, sort_order: tasks.length });
    setBusy(false);
    if (res.error) { setMsg(res.error); return; }
    setDraft({ name: '', code: '', billable: false, active: true }); setMsg(null); reload();
  }
  async function patch(t: RecurringTask, p: Partial<RecurringTask>) { await saveRecurringTask(tenant, { ...t, ...p }); reload(); }
  async function remove(id?: string) { if (!id) return; if (!confirm(tr('Supprimer cette tâche ?', 'Delete this task?'))) return; await deleteRecurringTask(id); reload(); }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{tr("Définissez vos tâches récurrentes (ex. bureau, atelier, soumission, administration). Elles servent à associer une ligne de feuille de temps ou une tâche planifiée quand ce n'est pas un projet.", 'Define your recurring tasks (e.g. office, shop, quote, admin). They tag a timesheet line or a planned task when it is not a project.')}</p>
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Nom', 'Name')}</label><input className={`${inp} w-48`} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder={tr('ex. Atelier', 'e.g. Shop')} /></div>
        <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Code', 'Code')}</label><input className={`${inp} w-24`} value={draft.code} onChange={e => setDraft(d => ({ ...d, code: e.target.value }))} placeholder="ATL" /></div>
        <label className="flex items-center gap-1.5 pb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300"><input type="checkbox" checked={!!draft.billable} onChange={e => setDraft(d => ({ ...d, billable: e.target.checked }))} />{tr('Facturable', 'Billable')}</label>
        <button onClick={add} disabled={busy || !draft.name.trim()} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
        {msg && <span className="pb-1.5 text-xs text-red-600">{msg}</span>}
      </div>
      {loading ? <div className="py-8 text-center text-gray-400"><Loader2 className="mx-auto animate-spin" /></div> : tasks.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune tâche récurrente.', 'No recurring task yet.')}</div> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800"><tr><th className="px-3 py-2 text-left">{tr('Nom', 'Name')}</th><th className="px-3 py-2 text-left">{tr('Code', 'Code')}</th><th className="px-3 py-2">{tr('Facturable', 'Billable')}</th><th className="px-3 py-2">{tr('Actif', 'Active')}</th><th className="px-3 py-2"></th></tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2"><input className={`${inp} w-44`} value={t.name} onChange={e => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, name: e.target.value } : x))} onBlur={e => patch(t, { name: e.target.value })} /></td>
                  <td className="px-3 py-2"><input className={`${inp} w-20`} value={t.code || ''} onChange={e => setTasks(ts => ts.map(x => x.id === t.id ? { ...x, code: e.target.value } : x))} onBlur={e => patch(t, { code: e.target.value })} /></td>
                  <td className="px-3 py-2 text-center"><input type="checkbox" checked={!!t.billable} onChange={e => patch(t, { billable: e.target.checked })} /></td>
                  <td className="px-3 py-2 text-center"><input type="checkbox" checked={t.active !== false} onChange={e => patch(t, { active: e.target.checked })} /></td>
                  <td className="px-3 py-2 text-right"><button onClick={() => remove(t.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PersonnelPlanner({ tenant, tr, inp, goToPostes, sharedPostes, sharedSubclasses, postesTick, perms }: { tenant: string; tr: (f: string, e: string) => string; inp: string; goToPostes: () => void; sharedPostes: { id: string; name: string; color?: string; subclass_ids?: string[] }[]; sharedSubclasses: { id: string; name: string; color?: string; category?: string }[]; postesTick: number; perms: typeof PERMS[AccessLevel] }) {
  type Row = { id?: string; name: string; role: string; subclass: string; phone: string; email: string; is_active: boolean; niveauAcces: string; succursale: string; hire_date: string; next_evaluation_date: string };
  const empty = (): Row => ({ name: '', role: '', subclass: '', phone: '', email: '', is_active: true, niveauAcces: 'consultation', succursale: '', hire_date: '', next_evaluation_date: '' });
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
  // Anti-perte : auto-brouillon local des lignes non enregistrées (ajouts/édits avant « Enregistrer »).
  const draftKey = `personnel.${tenant}`;
  const cleanSig = React.useRef('');     // signature des lignes telles qu'en base (état « propre »)
  const [pendingDraft, setPendingDraft] = useState<Row[] | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: suc }, persRes] = await Promise.all([
      supabase.from('planner_succursales').select('id, name, parent_id').eq('tenant_id', tenant).order('name'),
      supabase.from('planner_personnel').select('id, name, role, subclass, phone, email, is_active, niveauAcces, succursale, hire_date, next_evaluation_date').eq('tenant_id', tenant).order('name'),
    ]);
    // Repli si une colonne récente (next_evaluation_date / hire_date) n'existe pas encore sur ce projet
    let data: any[] | null = persRes.data;
    if (persRes.error && /(next_evaluation_date|hire_date)/i.test(persRes.error.message || '')) {
      const r2 = await supabase.from('planner_personnel').select('id, name, role, subclass, phone, email, is_active, niveauAcces, succursale').eq('tenant_id', tenant).order('name');
      data = r2.data;
    }
    const allSites = (suc || []).filter((r: any) => !r.parent_id);
    const allDepts = (suc || []).filter((r: any) => r.parent_id);
    setSiteTree(allSites.map((s: any) => ({ id: s.id, name: s.name, depts: allDepts.filter((d: any) => d.parent_id === s.id) })));
    const mapped = (data || []).map((r: any) => ({ ...r, subclass: r.subclass || '', niveauAcces: r.niveauAcces || 'consultation', succursale: r.succursale || '', hire_date: r.hire_date || '', next_evaluation_date: r.next_evaluation_date || '' }));
    setRows(mapped);
    cleanSig.current = JSON.stringify(mapped);  // état « propre » de référence
    // Brouillon d'une session précédente (lignes non enregistrées) ? On propose de le restaurer.
    const d = readDraft<Row[]>(draftKey);
    if (d && Array.isArray(d) && JSON.stringify(d) !== cleanSig.current) setPendingDraft(d); else setPendingDraft(null);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  // Re-render auto quand les postes changent (postesTick incrémente)
  useEffect(() => { /* trigger re-render via closure */ }, [postesTick]);
  // Auto-brouillon : dès que les lignes diffèrent de l'état en base, on persiste localement (debounce) ; sinon on purge.
  useEffect(() => {
    if (loading) return;
    const id = setTimeout(() => {
      const sig = JSON.stringify(rows);
      if (sig !== cleanSig.current) writeDraft(draftKey, rows); else clearDraft(draftKey);
    }, 800);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);

  const upd = (i: number, k: keyof Row, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  // Le nouvel employé hérite du site/dépt filtré en cours — sinon (succursale vide) il serait masqué
  // par le filtre actif et « Ajouter » paraîtrait ne rien faire quand on cible un site précis.
  const add = () => setRows(p => [...p, { ...empty(), succursale: siteFilter ? (deptFilter ? `${siteFilter} / ${deptFilter}` : siteFilter) : '' }]);
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
      base.hire_date = r.hire_date || null;
      base.next_evaluation_date = r.next_evaluation_date || null;

      console.log('[Personnel save] payload pour', r.name, ':', base, 'id existant ?', r.id);

      try {
        // Écriture via la route SERVEUR (canAuth) — niveauAcces non modifiable via la clé anon
        // (fermeture de l'élévation de privilèges). Fallback de colonnes géré côté serveur.
        const resp = r.id
          ? await fetch('/api/hr/personnel', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'profile', tenant,id: r.id, patch: base }) })
          : await fetch('/api/hr/personnel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, row:base }) });
        const jr = await resp.json().catch(() => ({}));
        if (!resp.ok || jr.error) throw new Error(jr.error || 'DB');
        ok++;
      } catch (e: any) {
        const msg = String(e?.message || e?.details || e?.hint || '');
        console.error('[Personnel save] ERREUR pour', r.name, ':', e);
        err++; errs.push(`${r.name}: ${msg || 'erreur inconnue'}`);
      }
    }
    setNotice(`✓ ${ok} enregistré(s)${err ? ` · ✗ ${err} erreur(s)` : ''}${errs.length ? `\n${errs.slice(0, 4).join('\n')}` : ''}`);
    if (!err) clearDraft(draftKey); // tout enregistré → plus de brouillon en attente
    await load();
    setSaving(false);
  }

  // Bouton de diagnostic : insère une ligne test directement
  async function testDirectInsert() {
    setSaving(true); setNotice(null);
    const testRow = { name: `TEST ${new Date().toISOString().slice(11, 19)}`, is_active: true, niveauAcces: 'consultation' };
    const resp = await fetch('/api/hr/personnel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, row:testRow }) });
    const j = await resp.json().catch(() => ({}));
    if (!resp.ok || j.error) setNotice(`❌ TEST ÉCHEC : ${j.error || resp.status}`);
    else if (!j.row) setNotice(`❌ TEST BLOQUÉ`);
    else { setNotice(`✓ TEST RÉUSSI : ligne "${testRow.name}" insérée avec id ${j.row.id}`); await load(); }
    setSaving(false);
  }

  async function del(i: number) {
    const r = rows[i];
    if (r.id) await fetch(`/api/hr/personnel?id=${r.id}&tenant=${encodeURIComponent(tenant)}`, { method: 'DELETE', credentials: 'include' });
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
      {/* Brouillon non enregistré retrouvé (session précédente) — proposer la restauration. */}
      {pendingDraft && (
        <div className="mx-4 mt-3 flex flex-wrap items-center gap-2 rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="flex-1">💾 {tr('Des modifications non enregistrées ont été retrouvées (vous aviez quitté sans enregistrer).', 'Unsaved changes were found (you left without saving).')}</span>
          <button type="button" onClick={() => { setRows(pendingDraft); setPendingDraft(null); }} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">{tr('Restaurer', 'Restore')}</button>
          <button type="button" onClick={() => { clearDraft(draftKey); setPendingDraft(null); }} className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-500/40">{tr('Ignorer', 'Dismiss')}</button>
        </div>
      )}
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
            <th className="px-2">{tr('Embauche', 'Hired')}</th>
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
                <td className="px-2" data-label={tr('Embauche', 'Hired')}><input type="date" className={`${inp} w-36`} value={r.hire_date || ''} onChange={e => upd(i, 'hire_date', e.target.value)} title={tr("Date d'embauche", 'Hire date')} /></td>
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

  // Export Excel (xlsx chargé à la demande pour ne pas alourdir le bundle admin).
  async function exportXlsx() {
    const XLSX = await import('xlsx');
    const data = (rows.length ? rows : [empty()]).map(r => ({
      'Nom': r.name, 'Type': r.type, 'No de serie': r.serial_number,
      'Actif': r.is_active !== false ? 'Oui' : 'Non', 'Site/Dept': r.succursale, 'Photo URL': r.photo_url,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 24 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipements');
    XLSX.writeFile(wb, `Equipements_${tenant}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
  // Import Excel : fusionne dans la liste (mise à jour par n° série/nom, sinon ajout). « Enregistrer » persiste.
  async function importXlsx(file: File) {
    setNotice(null);
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(ws);
      const pick = (o: any, keys: string[]) => { for (const k of keys) { const kk = Object.keys(o).find(x => x.trim().toLowerCase() === k); if (kk != null && o[kk] != null) return String(o[kk]).trim(); } return ''; };
      const imported: Row[] = json.map(o => ({
        name: pick(o, ['nom', 'name', 'équipement', 'equipement']),
        type: pick(o, ['type']),
        serial_number: pick(o, ['no de serie', 'n° série', 'no serie', 'serial', 'serial_number', 'numero de serie']),
        is_active: !/^(non|no|false|0|inactif)/i.test(pick(o, ['actif', 'active', 'is_active']) || 'oui'),
        succursale: pick(o, ['site/dept', 'site', 'succursale', 'site / dept']),
        photo_url: pick(o, ['photo url', 'photo_url', 'photo']),
      })).filter(r => r.name.trim());
      if (!imported.length) { setNotice(tr('Aucune ligne valide (colonne « Nom » requise).', 'No valid rows (column "Nom" required).')); return; }
      setRows(prev => {
        const next = [...prev];
        for (const imp of imported) {
          const idx = next.findIndex(r =>
            (imp.serial_number && r.serial_number && r.serial_number.toLowerCase() === imp.serial_number.toLowerCase()) ||
            (r.name.toLowerCase() === imp.name.toLowerCase() && (r.serial_number || '').toLowerCase() === (imp.serial_number || '').toLowerCase()));
          if (idx >= 0) next[idx] = { ...next[idx], ...imp };
          else next.push(imp);
        }
        return next;
      });
      setNotice(tr(`${imported.length} équipement(s) importé(s) — cliquez « Enregistrer » pour sauvegarder.`, `${imported.length} item(s) imported — click "Save" to persist.`));
    } catch (e: any) { setNotice('Erreur import : ' + (e?.message || e)); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div>
          <h2 className="font-bold">{tr('Équipements du planificateur', 'Planner equipment')}</h2>
          <p className="text-xs text-gray-500">{tr('Instruments et outils assignables aux chantiers.', 'Instruments and tools assignable to job sites.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportXlsx} title={tr('Exporter la liste en Excel', 'Export the list to Excel')} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"><Download size={15} /> {tr('Exporter', 'Export')}</button>
          <label title={tr('Importer depuis un fichier Excel (colonnes : Nom, Type, No de serie, Actif, Site/Dept)', 'Import from an Excel file')} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            <Upload size={15} /> {tr('Importer Excel', 'Import Excel')}
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importXlsx(f); e.currentTarget.value = ''; }} />
          </label>
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
type GridRow = { id?: string; poste_id: string; name: string; mode: GridMode; base_salary: number; annual_increase_pct: number; annual_increase_fixed: number; years_plan: number; cola_pct: number; hours_per_year: number; use_skill_grid?: boolean; commission_enabled?: boolean; commission_pct?: number; commission_basis?: 'gross' | 'net' | 'margin' | 'custom'; commission_threshold?: number; commission_cap?: number | null; discretionary_bonuses?: DiscretionaryBonus[]; grid_conditions?: GridCondition[]; skill_form?: SkillForm; notes?: string };

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

  // Conditions/frais du catalogue des taux (prix vendant) — pour la section « Frais applicables ».
  const [catConditions, setCatConditions] = useState<CatalogueCondition[]>([]);
  useEffect(() => { getCatalogueConditions(tenant).then(setCatConditions).catch(() => {}); }, [tenant]);
  // Récupère la config (applies + prix employé) d'une condition pour ce poste (défaut : non, vendant×0,8).
  const condOf = (key: string): GridCondition | undefined => (grid?.grid_conditions || []).find(c => c.key === key);
  const setCond = (cc: CatalogueCondition, patch: Partial<GridCondition>) => {
    setGrid(g => {
      if (!g) return g;
      const list = [...(g.grid_conditions || [])];
      const i = list.findIndex(c => c.key === cc.key);
      const base: GridCondition = i >= 0 ? list[i] : { key: cc.key, label: cc.label, sell_price: cc.sell_price, employee_price: Math.round(cc.sell_price * DEFAULT_EMPLOYEE_FACTOR * 100) / 100, applies: false };
      const next = { ...base, label: cc.label, sell_price: cc.sell_price, ...patch };
      if (i >= 0) list[i] = next; else list.push(next);
      return { ...g, grid_conditions: list };
    });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Grille salariale via la route SERVEUR protégée (données sensibles fermées à l'anon).
      const sg = await fetch(`/api/hr/salary-grid?posteId=${poste.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
      const g = (sg as any).grid;
      const gridTiers = (sg as any).tiers || [];
      const defaultGrid: GridRow = { poste_id: poste.id!, name: 'Grille standard', mode: 'percentage', base_salary: 50000, annual_increase_pct: 3, annual_increase_fixed: 1500, years_plan: 5, cola_pct: 0, hours_per_year: 2080, use_skill_grid: true, commission_enabled: false, commission_pct: 0, commission_basis: 'gross', commission_threshold: 0, commission_cap: null, discretionary_bonuses: [], grid_conditions: [], skill_form: { types: [] } };
      // Normalise le formulaire (poids de compétence par défaut pour les anciennes données)
      const normForm = (sf: any): SkillForm => (sf && Array.isArray(sf.types))
        ? { types: sf.types.map((t: any) => ({ ...t, skills: (t.skills || []).map((s: any) => ({ weight: 1, ...s })) })) }
        : { types: [] };
      if (g) {
        setGrid({ ...defaultGrid, ...g, use_skill_grid: (g as any).use_skill_grid !== false, discretionary_bonuses: (g as any).discretionary_bonuses || [], grid_conditions: (g as any).grid_conditions || [], skill_form: normForm((g as any).skill_form) });
        const ts = (gridTiers || []).map((x: any) => ({ ...x, required_skills: x.required_skills || [] }));
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
    const sg = await fetch(`/api/hr/salary-grid?posteId=${srcId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
    const g = (sg as any).grid;
    if (!g) { setNotice(tr('Ce poste n\'a pas encore de grille.', 'This position has no grid yet.')); return; }
    const ts = (sg as any).tiers || [];
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
      // Enregistrement via la route SERVEUR protégée (toute la logique tolérante aux colonnes
      // récentes est désormais côté serveur ; la table salariale est fermée à l'anon).
      const res = await fetch('/api/hr/salary-grid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ posteId: poste.id, grid, tiers }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.error) throw new Error(j.error || 'DB');
      if (j.gridId && !grid.id) setGrid(g => g ? { ...g, id: j.gridId } : g);
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

        {/* Section Frais / conditions (subsistance, hébergement…) du catalogue — prix vendant vs employé */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5 p-3">
          <h4 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            🧾 {tr('Frais / conditions applicables', 'Applicable allowances')}
          </h4>
          <p className="mb-2 text-[11px] text-gray-500">{tr("Du catalogue des taux (prix vendant). Cochez ce qui s'applique à ce poste ; le « prix employé » par défaut = vendant −20 %, éditable. Le prix vendant sert à la facturation du projet.", 'From the rate catalog (selling price). Check what applies to this position; default employee price = selling −20%, editable. Selling price feeds project billing.')}</p>
          {catConditions.length === 0 ? (
            <div className="text-[11px] text-gray-400">{tr('Aucune condition (subsistance/hébergement) dans le catalogue des taux. Ajoutez-les dans le catalogue.', 'No conditions in the rate catalog yet.')}</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <table className="w-full text-xs">
                <thead className="bg-emerald-100/50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"><tr>
                  <th className="px-2 py-1.5 text-left">{tr('Applique', 'Applies')}</th>
                  <th className="px-2 py-1.5 text-left">{tr('Condition', 'Condition')}</th>
                  <th className="px-2 py-1.5 text-right">{tr('Prix vendant', 'Selling')}</th>
                  <th className="px-2 py-1.5 text-right">{tr('Prix employé', 'Employee')}</th>
                </tr></thead>
                <tbody>
                  {catConditions.map(cc => { const c = condOf(cc.key); const applies = !!c?.applies; const empPrice = c?.employee_price ?? Math.round(cc.sell_price * DEFAULT_EMPLOYEE_FACTOR * 100) / 100; return (
                    <tr key={cc.key} className="border-t border-emerald-50 dark:border-emerald-500/10">
                      <td className="px-2 py-1.5"><input type="checkbox" disabled={!canEdit} checked={applies} onChange={e => setCond(cc, { applies: e.target.checked })} /></td>
                      <td className="px-2 py-1.5 font-medium text-gray-700 dark:text-gray-200">{cc.label}</td>
                      <td className="px-2 py-1.5 text-right text-gray-500">{money(cc.sell_price)}</td>
                      <td className="px-2 py-1.5 text-right"><input type="number" step="0.01" disabled={!canEdit || !applies} value={empPrice} onFocus={selectOnFocus} onChange={e => setCond(cc, { employee_price: Number(e.target.value) })} className={`${inp2} inline-block w-24 text-right`} /></td>
                    </tr>
                  ); })}
                </tbody>
              </table>
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
              placeholder={tr(`Technicien junior\nTechnicien intermédiaire | TECH-INT\nTechnicien senior, TECH-SR\nContremaître\nChef de projet\nIngénieur électrique\n…`, `Junior technician\nIntermediate technician | TECH-INT\nSenior technician, TECH-SR\nForeman\nProject manager\nElectrical engineer\n…`)}
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
              <span className="ml-2 font-semibold text-gray-400">· {depts.length} {tr('département(s)', 'department(s)')}</span>
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
  type EP = { id?: string; employee_id: string; employee_name: string; employee_email: string; hourly_rate: string; ot_multiplier: string; dt_multiplier: string; ot_daily_hrs: string; dt_daily_hrs: string; ot_weekly_hrs: string; ot_enabled: boolean; dt_enabled: boolean; active: boolean };
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
        if (p) return { id: p.id, employee_id: u.id, employee_name: p.employee_name || u.name, employee_email: p.employee_email || u.email, hourly_rate: String(p.hourly_rate || ''), ot_multiplier: String(p.ot_multiplier || '1.50'), dt_multiplier: String(p.dt_multiplier || '2.00'), ot_daily_hrs: String(p.ot_daily_hrs || '8'), dt_daily_hrs: p.dt_daily_hrs != null ? String(p.dt_daily_hrs) : '', ot_weekly_hrs: String(p.ot_weekly_hrs || '40'), ot_enabled: p.ot_enabled !== false, dt_enabled: p.dt_enabled !== false, active: p.active !== false };
        return { employee_id: u.id, employee_name: u.name, employee_email: u.email, hourly_rate: '', ot_multiplier: '1.50', dt_multiplier: '2.00', ot_daily_hrs: '8', dt_daily_hrs: '', ot_weekly_hrs: '40', ot_enabled: true, dt_enabled: true, active: true };
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
          ot_enabled: r.ot_enabled, dt_enabled: r.dt_enabled,
          active: r.active, updated_at: new Date().toISOString(),
        };
        const writeProfile = async (pl: any) => {
          if (r.id) return supabase.from('employee_profiles').update(pl).eq('id', r.id);
          return supabase.from('employee_profiles').insert(pl);
        };
        let { error } = await writeProfile(payload);
        if (error && /ot_enabled|dt_enabled/i.test(error.message || '')) {
          const { ot_enabled, dt_enabled, ...fb } = payload; // migration 104 non exécutée
          ({ error } = await writeProfile(fb));
        }
        if (error) throw error;
      }
      setNotice(tr('Profils enregistrés ✓', 'Profiles saved ✓'));
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-12"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Le taux horaire (lecture seule) provient du formulaire « Évaluation & salaire » (Employés & accès) : salaire annuel ÷ heures/an de la grille. Pour le changer, faites/ajustez l’évaluation. Les multiplicateurs OT (×1,5) / DT (×2) servent au calcul des feuilles de temps.', 'The hourly rate (read-only) comes from the "Evaluation & salary" form (Employees & access): annual salary ÷ grid hours/year. To change it, run/adjust the evaluation. OT (×1.5) / DT (×2) multipliers feed timesheet calculations.')}
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
                    {/* Lecture seule : le taux provient du formulaire Évaluation & salaire (source unique). */}
                    <div className="flex items-center gap-1" title={tr('Défini via Employés & accès → Évaluation & salaire', 'Set via Employees & access → Evaluation & salary')}>
                      <span className={`w-20 rounded-lg border border-dashed border-gray-300 px-2 py-1 text-sm font-semibold dark:border-gray-600 ${r.hourly_rate ? 'text-gray-800 dark:text-gray-100' : 'text-amber-500'}`}>
                        {r.hourly_rate ? `${r.hourly_rate} $` : tr('— éval.', '— eval.')}
                      </span>
                      <span className="text-xs text-gray-400">/h</span>
                    </div>
                  </td>
                  <td className="px-2" data-label={tr('×OT', '×OT')}>
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" checked={r.ot_enabled} onChange={e => upd(i, 'ot_enabled', e.target.checked)} title={tr('Activer le temps supplémentaire', 'Enable overtime')} />
                      <input type="text" inputMode="decimal" disabled={!r.ot_enabled} className={`${inp} w-16 ${!r.ot_enabled ? 'opacity-40' : ''}`} value={r.ot_multiplier} placeholder="1.50" onChange={e => upd(i, 'ot_multiplier', e.target.value)} />
                    </div>
                  </td>
                  <td className="px-2" data-label={tr('×DT', '×DT')}>
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" checked={r.dt_enabled} onChange={e => upd(i, 'dt_enabled', e.target.checked)} title={tr('Activer le temps double', 'Enable double time')} />
                      <input type="text" inputMode="decimal" disabled={!r.dt_enabled} className={`${inp} w-16 ${!r.dt_enabled ? 'opacity-40' : ''}`} value={r.dt_multiplier} placeholder="2.00" onChange={e => upd(i, 'dt_multiplier', e.target.value)} />
                    </div>
                  </td>
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

// ============================================================
// RESSOURCES HUMAINES — hub 360 : Dossiers (agrege existant + manquant) + Communications
// ============================================================
function RHHub({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [sub, setSub] = useState<'dossiers' | 'comms' | 'conges'>('dossiers');
  const subTab = (k: 'dossiers' | 'comms' | 'conges', label: string) => (
    <button onClick={() => setSub(k)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${sub === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}>{label}</button>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {subTab('dossiers', tr('Dossiers 360', '360 files'))}
        {subTab('comms', tr('Communications RH', 'HR communications'))}
        {subTab('conges', tr('Types de congé', 'Leave types'))}
      </div>
      {sub === 'dossiers' ? <RHDossiers tenant={tenant} tr={tr} />
        : sub === 'conges' ? <CongeTypesManager tenant={tenant} tr={tr} canEdit />
        : <RHModule tenant={tenant} tr={tr} />}
    </div>
  );
}

function RHModule({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  type Item = { id?: string; type: 'message' | 'document' | 'link'; title: string; content: string; url: string; active: boolean; sort_order: number };
  const inp = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600';
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('hr_items').select('*').eq('tenant_id', tenant).order('sort_order').order('created_at');
    if (error) setNotice(tr('Table RH absente — exécutez la migration 084.', 'HR table missing — run migration 084.'));
    setRows((data || []).map((r: any) => ({ ...r, content: r.content || '', url: r.url || '' })));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const upd = (i: number, k: keyof Item, v: any) => setRows(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = (type: Item['type']) => setRows(p => [...p, { type, title: '', content: '', url: '', active: true, sort_order: p.length }]);
  async function del(i: number) { const r = rows[i]; if (r.id) await supabase.from('hr_items').delete().eq('id', r.id); setRows(p => p.filter((_, j) => j !== i)); }
  async function onUpload(i: number, file: File) { try { const url = await uploadPhoto(file, tenant, supabase); upd(i, 'url', url); } catch { setNotice(tr('Échec du téléversement', 'Upload failed')); } }
  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const r of rows) {
        if (!r.title.trim()) continue;
        const payload = { tenant_id: tenant, type: r.type, title: r.title.trim(), content: r.content || null, url: r.url || null, active: r.active !== false, sort_order: r.sort_order, updated_at: new Date().toISOString() };
        if (r.id) await supabase.from('hr_items').update(payload).eq('id', r.id);
        else await supabase.from('hr_items').insert(payload);
      }
      setNotice(tr('Éléments RH enregistrés ✓', 'HR items saved ✓')); load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); } finally { setSaving(false); }
  }

  const TYPES = [
    { k: 'message' as const, label: tr('Message corpo', 'Corp message'), icon: '📣' },
    { k: 'document' as const, label: tr('Document', 'Document'), icon: '📄' },
    { k: 'link' as const, label: tr('Hyperlien', 'Hyperlink'), icon: '🔗' },
  ];

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold">{tr('Ressources humaines — communications', 'Human resources — communications')}</h2>
            <p className="text-xs text-gray-500">{tr('Messages corporatifs, documents et liens partagés au personnel.', 'Corporate messages, documents and links shared with staff.')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => <button key={t.k} onClick={() => add(t.k)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"><Plus size={13} /> {t.icon} {t.label}</button>)}
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button>
          </div>
        </div>
        {notice && <div className="mb-2 whitespace-pre-line rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">{notice}</div>}
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">{tr('Aucun élément. Ajoutez un message, un document ou un lien.', 'No item. Add a message, document or link.')}</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => {
              const t = TYPES.find(x => x.k === r.type) || TYPES[0];
              return (
                <div key={r.id || i} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-lg">{t.icon}</span>
                    <select className={`${inp} w-40`} value={r.type} onChange={e => upd(i, 'type', e.target.value)}>
                      {TYPES.map(x => <option key={x.k} value={x.k}>{x.label}</option>)}
                    </select>
                    <input className={`${inp} min-w-[10rem] flex-1`} value={r.title} placeholder={tr('Titre', 'Title')} onChange={e => upd(i, 'title', e.target.value)} />
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.active !== false} onChange={e => upd(i, 'active', e.target.checked)} /> {tr('Actif', 'Active')}</label>
                    <button onClick={() => del(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                  {r.type === 'message' && (
                    <textarea rows={3} className={`${inp} resize-y`} value={r.content} placeholder={tr('Message à communiquer au personnel…', 'Message to communicate to staff…')} onChange={e => upd(i, 'content', e.target.value)} />
                  )}
                  {r.type === 'link' && (
                    <input className={inp} value={r.url} placeholder="https://…" onChange={e => upd(i, 'url', e.target.value)} />
                  )}
                  {r.type === 'document' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input className={`${inp} min-w-[12rem] flex-1`} value={r.url} placeholder={tr('URL du document ou téléverser →', 'Document URL or upload →')} onChange={e => upd(i, 'url', e.target.value)} />
                      <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">📤 {tr('Téléverser', 'Upload')}<input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(i, f); e.target.value = ''; }} /></label>
                      {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{tr('Voir', 'View')}</a>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CARNET DE BORD — consultation des relevés véhicule (saisis via feuilles de temps)
// ============================================================
function LogbookModule({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [empFilter, setEmpFilter] = useState('');
  const km = (n: any) => `${Math.round(Number(n) || 0).toLocaleString('fr-CA')} km`;

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('vehicle_logbook').select('*').eq('tenant_id', tenant).order('week_start', { ascending: false });
    if (error) setNotice(tr('Carnet de bord indisponible (migration 030 requise).', 'Logbook unavailable (migration 030 required).'));
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  const years = useMemo(() => { const ys = [...new Set(rows.map((r: any) => new Date(r.week_start).getFullYear()))].sort((a: any, b: any) => b - a) as number[]; return ys.length ? ys : [new Date().getFullYear()]; }, [rows]);
  const employees = useMemo(() => [...new Set(rows.map((r: any) => r.employee_name).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter((r: any) => new Date(r.week_start).getFullYear() === year && (!empFilter || r.employee_name === empFilter)), [rows, year, empFilter]);

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-bold">{tr('Carnet de bord — véhicules', 'Logbook — vehicles')}</h2>
            <p className="text-xs text-gray-500 max-w-2xl">{tr('Relevés saisis par les conducteurs dans leurs feuilles de temps (odomètre + km affaires ; perso = différence). Base des rapports fiscaux (TP-41 à venir).', 'Entries filled by drivers in their timesheets (odometer + business km; personal = difference). Basis for tax reports (TP-41 to come).')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              {years.map(y => <button key={y} onClick={() => setYear(y)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${year === y ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{y}</button>)}
            </div>
            {employees.length > 0 && (
              <select value={empFilter} onChange={e => setEmpFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                <option value="">{tr('Tous les conducteurs', 'All drivers')}</option>
                {employees.map(e => <option key={e as string} value={e as string}>{e as string}</option>)}
              </select>
            )}
          </div>
        </div>
        {notice && <div className="px-4 pt-3 text-sm text-blue-700 dark:text-blue-300">{notice}</div>}
        <div className="overflow-x-auto p-2">
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-2 py-1.5">{tr('Semaine', 'Week')}</th>
              <th className="px-2">{tr('Conducteur', 'Driver')}</th>
              <th className="px-2">{tr('Véhicule', 'Vehicle')}</th>
              <th className="px-2 text-right">{tr('Odo début', 'Odo start')}</th>
              <th className="px-2 text-right">{tr('Odo fin', 'Odo end')}</th>
              <th className="px-2 text-right">{tr('Km total', 'Total km')}</th>
              <th className="px-2 text-right">{tr('Km affaires', 'Business km')}</th>
              <th className="px-2 text-right">{tr('Km perso', 'Personal km')}</th>
            </tr></thead>
            <tbody>
              {filtered.map((r: any) => {
                const total = Number(r.km_total ?? (Number(r.odometer_end) - Number(r.odometer_start))) || 0;
                const perso = Number(r.km_personal) || 0;
                const job = Number(r.km_professional ?? (total - perso)) || 0;
                return (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-2 py-1.5" data-label={tr('Semaine', 'Week')}>{r.week_start}</td>
                    <td className="px-2" data-label={tr('Conducteur', 'Driver')}>{r.employee_name || r.employee_id || '—'}</td>
                    <td className="px-2" data-label={tr('Véhicule', 'Vehicle')}>{r.vehicle_name || '—'}</td>
                    <td className="px-2 text-right" data-label={tr('Odo début', 'Odo start')}>{km(r.odometer_start)}</td>
                    <td className="px-2 text-right" data-label={tr('Odo fin', 'Odo end')}>{Number(r.odometer_end) > 0 ? km(r.odometer_end) : '—'}</td>
                    <td className="px-2 text-right font-medium" data-label={tr('Km total', 'Total km')}>{km(total)}</td>
                    <td className="px-2 text-right text-emerald-600" data-label={tr('Km affaires', 'Business km')}>{km(job)}</td>
                    <td className="px-2 text-right text-amber-600" data-label={tr('Km perso', 'Personal km')}>{km(perso)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-2 py-8 text-center text-gray-400">{tr('Aucun relevé pour cette sélection.', 'No entry for this selection.')}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPTABILITÉ — grand livre en partie double (plan comptable, écritures, taxes)
// ============================================================
function AccountingModule({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [taxCodes, setTaxCodes] = useState<GLTaxCode[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [bal, setBal] = useState<Record<string, { debit: number; credit: number }>>({});
  const [loading, setLoading] = useState(true);
  const [migMissing, setMigMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sub, setSub] = useState<'plan' | 'ledger' | 'balance' | 'statements' | 'periods' | 'aging' | 'new'>('plan');
  const [periods, setPeriods] = useState<GLPeriod[]>([]);
  const reloadPeriods = () => getPeriods(tenant).then(setPeriods).catch(() => {});
  const [arAging, setArAging] = useState<AgingReport | null>(null);
  const [apAging, setApAging] = useState<AgingReport | null>(null);
  const reloadAging = () => Promise.all([getArAging(tenant), getApAging(tenant)]).then(([ar, ap]) => { setArAging(ar); setApAging(ap); }).catch(() => {});
  // « Transmettre au comptable » : lien read-only (migration 184)
  const [acctLink, setAcctLink] = useState<{ url: string; last_used_at?: string | null } | null>(null);
  const [acctBusy, setAcctBusy] = useState(false);
  const reloadAcctLink = () => fetch(`/api/accounting/accountant-link?tenant=${encodeURIComponent(tenant)}`).then(r => r.ok ? r.json() : null).then(d => setAcctLink(d?.link || null)).catch(() => {});
  async function genAcctLink() {
    setAcctBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/accounting/accountant-link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tenant }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Erreur');
      await reloadAcctLink();
      try { await navigator.clipboard.writeText(d.url); setNotice(tr('Lien comptable généré et copié.', 'Accountant link generated and copied.')); } catch { setNotice(tr('Lien comptable généré.', 'Accountant link generated.')); }
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setAcctBusy(false);
  }
  async function revokeAcctLink() {
    setAcctBusy(true); setNotice(null);
    try { await fetch(`/api/accounting/accountant-link?tenant=${encodeURIComponent(tenant)}`, { method: 'DELETE' }); setAcctLink(null); setNotice(tr('Lien comptable révoqué.', 'Accountant link revoked.')); }
    catch (e: any) { setNotice(e?.message); }
    setAcctBusy(false);
  }

  // Saisie d'écriture
  const [neDate, setNeDate] = useState(new Date().toISOString().slice(0, 10));
  const [neDesc, setNeDesc] = useState('');
  const [neRef, setNeRef] = useState('');
  const [neJournal, setNeJournal] = useState('OD');
  const [neLines, setNeLines] = useState<{ account_id: string; debit: string; credit: string }[]>([{ account_id: '', debit: '', credit: '' }, { account_id: '', debit: '', credit: '' }]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

  async function load() {
    setLoading(true); setMigMissing(false);
    try {
      const [acc, tc, led, tb] = await Promise.all([getAccounts(tenant), getTaxCodes(tenant), getLedger(tenant), getTrialBalance(tenant)]);
      setAccounts(acc); setTaxCodes(tc); setLedger(led); setBal(tb);
      reloadPeriods(); reloadAging(); reloadAcctLink();
    } catch { setMigMissing(true); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  // #59 Temps réel : rafraîchit silencieusement le grand livre quand une écriture change (migration 127).
  useRealtime(['gl_entries'], tenant, () => {
    Promise.all([getAccounts(tenant), getTaxCodes(tenant), getLedger(tenant), getTrialBalance(tenant)])
      .then(([acc, tc, led, tb]) => { setAccounts(acc); setTaxCodes(tc); setLedger(led); setBal(tb); })
      .catch(() => { /* noop */ });
  });

  async function init() {
    setNotice(null);
    try { await seedAccountingDefaults(tenant); setNotice(tr('Plan comptable initialisé.', 'Chart of accounts initialized.')); await load(); }
    catch { setNotice(tr('Échec — exécutez d\'abord la migration 085 dans Supabase.', 'Failed — run migration 085 in Supabase first.')); }
  }

  const neDebit = neLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const neCredit = neLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(neDebit - neCredit) < 0.005 && neDebit > 0;

  async function saveEntry() {
    setSaving(true); setNotice(null);
    try {
      await createEntry(tenant, {
        entry_date: neDate, description: neDesc, reference: neRef, journal_code: neJournal,
        lines: neLines.map(l => ({ account_id: l.account_id, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })).filter(l => l.account_id && (l.debit > 0 || l.credit > 0)),
      });
      setNotice(tr('Écriture enregistrée.', 'Entry saved.'));
      setNeLines([{ account_id: '', debit: '', credit: '' }, { account_id: '', debit: '', credit: '' }]);
      setNeDesc(''); setNeRef('');
      await load(); setSub('ledger');
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSaving(false);
  }

  async function doReverse(id: string) {
    setNotice(null);
    try { await reverseEntry(tenant, id); setNotice(tr('Contre-passation enregistrée.', 'Reversal posted.')); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }

  async function syncPay() {
    setSyncing(true); setNotice(null);
    try {
      const r = await syncPayrollEntries(tenant);
      setNotice(tr(`Paie synchronisée : ${r.created} écriture(s) créée(s), ${r.skipped} déjà présente(s).`, `Payroll synced: ${r.created} created, ${r.skipped} already posted.`));
      await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSyncing(false);
  }
  // Centralisation : poste TOUT ce qui manque au grand livre (paie + ventes + encaissements + achats
  // + paiements fournisseurs), idempotent. « Tout remonte vers Comptabilité » en un clic.
  async function syncAll() {
    setSyncing(true); setNotice(null);
    try {
      const r = await syncAllToLedger(tenant);
      setNotice(tr(
        `Grand livre synchronisé : ${r.payroll} paie, ${r.sales} vente(s), ${r.salePayments} encaissement(s), ${r.purchases} achat(s), ${r.purchasePayments} paiement(s) fournisseur, ${r.expenses} dépense(s) feuille de temps.`,
        `Ledger synced: ${r.payroll} payroll, ${r.sales} sale(s), ${r.salePayments} receipt(s), ${r.purchases} purchase(s), ${r.purchasePayments} vendor payment(s), ${r.expenses} timesheet expense(s).`));
      await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSyncing(false);
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;

  if (migMissing) return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      <p className="font-semibold">{tr('Module comptable non initialisé', 'Accounting module not initialized')}</p>
      <p className="mt-1 text-sm">{tr('Exécutez la migration 085 (085_accounting_core.sql) dans le SQL Editor de Supabase, puis rechargez.', 'Run migration 085 (085_accounting_core.sql) in Supabase SQL Editor, then reload.')}</p>
    </div>
  );

  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {([['plan', tr('Plan comptable', 'Chart of accounts')], ['ledger', tr('Grand livre', 'General ledger')], ['balance', tr('Balance', 'Trial balance')], ['statements', tr('États', 'Statements')], ['aging', tr('Âge des comptes', 'Aging')], ['periods', tr('Périodes', 'Periods')], ['new', tr('Écriture de correction', 'Adjusting entry')]] as const).map(([k, lbl]) => (
            (k !== 'new' || canEdit) && <button key={k} onClick={() => setSub(k as any)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sub === k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{lbl}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accounts.length > 0 && (sub === 'ledger' || sub === 'balance' || sub === 'statements') && (
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
              <span className="text-gray-400">{tr('Exporter', 'Export')}</span>
              <button onClick={() => { try { sub === 'ledger' ? exportLedgerCsv(ledger) : sub === 'balance' ? exportTrialBalanceCsv(accounts, bal) : exportStatementsCsv(accounts, bal); } catch (e: any) { setNotice(e?.message); } }} className="rounded-lg px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">CSV</button>
              <button onClick={async () => { try { sub === 'ledger' ? await exportLedgerPdf(tenant, ledger) : sub === 'balance' ? await exportTrialBalancePdf(tenant, accounts, bal) : await exportStatementsPdf(tenant, accounts, bal); } catch (e: any) { setNotice(e?.message); } }} className="rounded-lg px-2 py-1 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">PDF</button>
            </div>
          )}
          {accounts.length > 0 && canEdit && (
            <div className="flex flex-wrap gap-2">
              <button onClick={syncAll} disabled={syncing} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40" title={tr('Poste au grand livre tout ce qui manque : paie, ventes, encaissements, achats, paiements (idempotent).', 'Post all missing entries to the ledger (idempotent).')}>
                {syncing ? <Loader2 size={15} className="inline animate-spin" /> : `🔄 ${tr('Synchroniser tout vers le grand livre', 'Sync everything to the ledger')}`}
              </button>
              <button onClick={syncPay} disabled={syncing} className="rounded-xl border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 dark:border-indigo-700 dark:text-indigo-300">
                {tr('Paie seulement', 'Payroll only')}
              </button>
            </div>
          )}
          {accounts.length === 0 && canEdit && (
            <button onClick={init} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{tr('Initialiser le plan comptable', 'Initialize chart of accounts')}</button>
          )}
        </div>
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">
          {tr('Aucun compte. Initialisez le plan comptable pour démarrer la comptabilité.', 'No account. Initialize the chart of accounts to start.')}
        </div>
      ) : sub === 'plan' ? (
        <div className="space-y-4">
          {(['asset', 'liability', 'equity', 'revenue', 'expense'] as const).map(type => {
            const accs = accounts.filter(a => a.type === type);
            if (!accs.length) return null;
            return (
              <div key={type} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr(...ACCOUNT_TYPE_LABELS[type])}</div>
                <table className="mobile-cards w-full text-sm">
                  <tbody>
                    {accs.map(a => (
                      <tr key={a.id} className="border-t border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-1.5 font-mono text-gray-500" data-label="Code" style={{ width: 90 }}>{a.code}</td>
                        <td className="px-4 py-1.5" data-label={tr('Compte', 'Account')}>{a.name}</td>
                        <td className="px-4 py-1.5 text-right text-xs text-gray-400" data-label={tr('Sens', 'Side')}>{a.normal_balance === 'debit' ? tr('Débit', 'Debit') : tr('Crédit', 'Credit')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          {taxCodes.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Codes de taxe', 'Tax codes')}</div>
              <table className="mobile-cards w-full text-sm"><tbody>
                {taxCodes.map(t => (
                  <tr key={t.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-1.5 font-mono text-gray-500" data-label="Code">{t.code}</td>
                    <td className="px-4 py-1.5" data-label={tr('Taxe', 'Tax')}>{t.name}</td>
                    <td className="px-4 py-1.5 text-right" data-label={tr('Taux', 'Rate')}>{(Number(t.rate) * 100).toFixed(3)} %</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}
        </div>
      ) : sub === 'ledger' ? (
        <div className="space-y-3">
          {ledger.length === 0 && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune écriture. Les écritures seront générées par les ventes, la paie et les saisies manuelles.', 'No entry yet. Entries will come from sales, payroll and manual postings.')}</div>}
          {ledger.map((e: any) => {
            const tot = (e.gl_lines || []).reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0);
            return (
              <div key={e.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                  <div className="text-sm">
                    <span className="font-mono text-gray-500">{e.entry_date}</span>
                    <span className="ml-2 font-semibold">{e.description || tr('(sans description)', '(no description)')}</span>
                    {e.reference && <span className="ml-2 text-xs text-gray-400">{tr('réf.', 'ref.')} {e.reference}</span>}
                    {e.reversed_by_id && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700">{tr('contre-passée', 'reversed')}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{mny(tot)}</span>
                    {canEdit && e.posted && !e.reversed_by_id && e.source_type !== 'reversal' && (
                      <button onClick={() => doReverse(e.id)} className="text-xs text-red-500 hover:underline">{tr('Contre-passer', 'Reverse')}</button>
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {(e.gl_lines || []).map((l: any) => (
                      <tr key={l.id} className="border-t border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-1 font-mono text-xs text-gray-400" style={{ width: 80 }}>{l.gl_accounts?.code}</td>
                        <td className="px-4 py-1">{l.gl_accounts?.name}</td>
                        <td className="px-4 py-1 text-right text-gray-700 dark:text-gray-300" style={{ width: 120 }}>{Number(l.debit) > 0 ? mny(l.debit) : ''}</td>
                        <td className="px-4 py-1 text-right text-gray-700 dark:text-gray-300" style={{ width: 120 }}>{Number(l.credit) > 0 ? mny(l.credit) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : sub === 'balance' ? (
        (() => {
          const lines = accounts
            .map(a => ({ a, d: bal[a.id]?.debit || 0, c: bal[a.id]?.credit || 0 }))
            .filter(r => r.d !== 0 || r.c !== 0)
            .map(r => { const net = r.d - r.c; return { ...r, debitCol: net > 0 ? net : 0, creditCol: net < 0 ? -net : 0 }; });
          const totD = lines.reduce((s, r) => s + r.debitCol, 0);
          const totC = lines.reduce((s, r) => s + r.creditCol, 0);
          return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Balance de vérification', 'Trial balance')}</div>
              {lines.length === 0 ? (
                <div className="p-8 text-center text-gray-500">{tr('Aucun mouvement comptable validé.', 'No posted movement yet.')}</div>
              ) : (
                <table className="mobile-cards w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-2">{tr('Compte', 'Account')}</th>
                    <th className="px-4 text-right">{tr('Débit', 'Debit')}</th>
                    <th className="px-4 text-right">{tr('Crédit', 'Credit')}</th>
                  </tr></thead>
                  <tbody>
                    {lines.map(r => (
                      <tr key={r.a.id} className="border-t border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-1.5" data-label={tr('Compte', 'Account')}><span className="font-mono text-xs text-gray-400">{r.a.code}</span> {r.a.name}</td>
                        <td className="px-4 py-1.5 text-right" data-label={tr('Débit', 'Debit')}>{r.debitCol > 0 ? mny(r.debitCol) : ''}</td>
                        <td className="px-4 py-1.5 text-right" data-label={tr('Crédit', 'Credit')}>{r.creditCol > 0 ? mny(r.creditCol) : ''}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600">
                      <td className="px-4 py-2">{tr('Total', 'Total')}</td>
                      <td className="px-4 py-2 text-right">{mny(totD)}</td>
                      <td className="px-4 py-2 text-right">{mny(totC)}</td>
                    </tr>
                    <tr><td colSpan={3} className={`px-4 py-2 text-right text-xs font-semibold ${Math.abs(totD - totC) < 0.005 ? 'text-emerald-600' : 'text-red-500'}`}>{Math.abs(totD - totC) < 0.005 ? tr('✓ Balance équilibrée', '✓ Balanced') : tr('⚠ Écart détecté', '⚠ Out of balance')}</td></tr>
                  </tbody>
                </table>
              )}
            </div>
          );
        })()
      ) : sub === 'statements' ? (
        (() => {
          const byType = (t: string) => accounts.filter(a => a.type === t).map(a => {
            const b = bal[a.id] || { debit: 0, credit: 0 };
            const amt = (t === 'asset' || t === 'expense') ? b.debit - b.credit : b.credit - b.debit;
            return { a, amt };
          }).filter(r => Math.abs(r.amt) > 0.005);
          const sum = (rows: { amt: number }[]) => rows.reduce((s, r) => s + r.amt, 0);
          const revenue = byType('revenue'), expense = byType('expense');
          const totRev = sum(revenue), totExp = sum(expense), netIncome = totRev - totExp;
          const asset = byType('asset'), liability = byType('liability'), equity = byType('equity');
          const totAsset = sum(asset), totLiab = sum(liability), totEq = sum(equity);
          const Section = ({ title, rows, total, totalLabel }: { title: string; rows: { a: GLAccount; amt: number }[]; total: number; totalLabel: string }) => (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{title}</div>
              <table className="w-full text-sm"><tbody>
                {rows.length === 0 && <tr><td className="px-4 py-2 text-gray-400">—</td></tr>}
                {rows.map(r => (
                  <tr key={r.a.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-1.5"><span className="font-mono text-xs text-gray-400">{r.a.code}</span> {r.a.name}</td>
                    <td className="px-4 py-1.5 text-right">{mny(r.amt)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600"><td className="px-4 py-2">{totalLabel}</td><td className="px-4 py-2 text-right">{mny(total)}</td></tr>
              </tbody></table>
            </div>
          );
          return (
            <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500">{tr('État des résultats', 'Income statement')}</h3>
                <Section title={tr('Produits', 'Revenue')} rows={revenue} total={totRev} totalLabel={tr('Total des produits', 'Total revenue')} />
                <Section title={tr('Charges', 'Expenses')} rows={expense} total={totExp} totalLabel={tr('Total des charges', 'Total expenses')} />
                <div className={`rounded-2xl border p-4 text-center font-bold ${netIncome >= 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20'}`}>
                  {tr('Résultat net', 'Net income')} : {mny(netIncome)}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500">{tr('Bilan', 'Balance sheet')}</h3>
                <Section title={tr('Actif', 'Assets')} rows={asset} total={totAsset} totalLabel={tr('Total de l\'actif', 'Total assets')} />
                <Section title={tr('Passif', 'Liabilities')} rows={liability} total={totLiab} totalLabel={tr('Total du passif', 'Total liabilities')} />
                <Section title={tr('Capitaux propres', 'Equity')} rows={equity} total={totEq} totalLabel={tr('Total des capitaux', 'Total equity')} />
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex justify-between"><span>{tr('Passif + Capitaux + Résultat net', 'Liabilities + Equity + Net income')}</span><b>{mny(totLiab + totEq + netIncome)}</b></div>
                  <div className={`mt-1 text-right text-xs font-semibold ${Math.abs(totAsset - (totLiab + totEq + netIncome)) < 0.01 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {Math.abs(totAsset - (totLiab + totEq + netIncome)) < 0.01 ? tr('✓ Bilan équilibré', '✓ Balanced') : tr('⚠ Écart avec l\'actif', '⚠ Does not match assets')}
                  </div>
                </div>
              </div>
            </div>
            {/* Transmettre au comptable — exports + lien read-only (migration 184) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-1 text-sm font-bold">📤 {tr('Transmettre au comptable', 'Send to accountant')}</h3>
              <p className="mb-3 text-xs text-gray-500">{tr('Export du grand livre validé (format standard importable) ou accès LECTURE SEULE en direct via un lien sécurisé. Aucune écriture, aucune autre donnée.', 'Export the posted ledger (standard importable format) or live READ-ONLY access via a secure link. No write access, no other data.')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={async () => { try { await exportAcctJournalCsv(tenant); } catch (e: any) { setNotice(e?.message); } }} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">{tr('Journal d’écritures (CSV)', 'Journal entries (CSV)')}</button>
                <button onClick={async () => { try { await exportAcctTrialBalanceCsv(tenant); } catch (e: any) { setNotice(e?.message); } }} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">{tr('Balance de vérification (CSV)', 'Trial balance (CSV)')}</button>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                {acctLink ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500">{tr('Lien comptable actif', 'Active accountant link')}{acctLink.last_used_at ? ` · ${tr('dernier accès', 'last access')} ${String(acctLink.last_used_at).slice(0, 10)}` : ` · ${tr('jamais utilisé', 'never used')}`}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input readOnly value={acctLink.url} onFocus={e => e.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 font-mono text-xs dark:border-gray-700 dark:bg-gray-900/40" />
                      <button onClick={() => { navigator.clipboard?.writeText(acctLink.url); setNotice(tr('Lien copié.', 'Link copied.')); }} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600">{tr('Copier', 'Copy')}</button>
                      <a href={`${acctLink.url}&report=journal&format=csv`} className="rounded-lg border border-emerald-300 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300">{tr('Tester (CSV)', 'Test (CSV)')}</a>
                      {canEdit && <button onClick={revokeAcctLink} disabled={acctBusy} className="rounded-lg border border-rose-300 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-800 dark:text-rose-300">{tr('Révoquer', 'Revoke')}</button>}
                    </div>
                    <p className="text-xs text-gray-400">{tr('Le comptable ajoute &report=journal|trial et &format=csv|json. Régénérer invalide l’ancien lien.', 'The accountant appends &report=journal|trial and &format=csv|json. Regenerating invalidates the old link.')}</p>
                  </div>
                ) : (
                  canEdit && <button onClick={genAcctLink} disabled={acctBusy} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{acctBusy ? <Loader2 size={13} className="inline animate-spin" /> : tr('Générer un lien comptable read-only', 'Generate read-only accountant link')}</button>
                )}
              </div>
            </div>
            </div>
          );
        })()
      ) : sub === 'aging' ? (
        <div className="space-y-6">
          {([['AR', tr('Comptes à RECEVOIR (clients)', 'Accounts RECEIVABLE (clients)'), arAging, 'emerald'], ['AP', tr('Comptes à PAYER (fournisseurs)', 'Accounts PAYABLE (vendors)'), apAging, 'rose']] as const).map(([key, title, rep, color]) => (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300">{title}</h3>
                {rep && <span className={`text-sm font-bold ${color === 'emerald' ? 'text-emerald-600' : 'text-rose-600'}`}>{mny(rep.grand_total)}</span>}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-700">
                    <th className="px-4 py-2">{key === 'AR' ? tr('Client', 'Client') : tr('Fournisseur', 'Vendor')}</th>
                    {AGING_BUCKETS.map(b => <th key={b} className="px-3 text-right">{tr(AGING_LABELS[b][0], AGING_LABELS[b][1])}</th>)}
                    <th className="px-4 text-right">{tr('Total', 'Total')}</th>
                  </tr></thead>
                  <tbody>
                    {(rep?.parties || []).map(p => (
                      <tr key={p.party} className="border-t border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-2 font-semibold">{p.party}</td>
                        {AGING_BUCKETS.map(b => <td key={b} className={`px-3 text-right ${b !== 'current' && p.buckets[b] > 0 ? 'text-amber-600' : 'text-gray-500'} ${b === 'd90_plus' && p.buckets[b] > 0 ? 'font-bold text-rose-600' : ''}`}>{p.buckets[b] ? mny(p.buckets[b]) : '—'}</td>)}
                        <td className="px-4 text-right font-bold">{mny(p.total)}</td>
                      </tr>
                    ))}
                    {rep && rep.parties.length > 0 && (
                      <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold dark:border-gray-600 dark:bg-gray-900/30">
                        <td className="px-4 py-2">{tr('Total', 'Total')}</td>
                        {AGING_BUCKETS.map(b => <td key={b} className="px-3 text-right">{rep.totals[b] ? mny(rep.totals[b]) : '—'}</td>)}
                        <td className="px-4 text-right">{mny(rep.grand_total)}</td>
                      </tr>
                    )}
                    {(!rep || rep.parties.length === 0) && <tr><td colSpan={AGING_BUCKETS.length + 2} className="px-4 py-6 text-center text-gray-400">{tr('Aucun solde en cours.', 'No outstanding balance.')}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">{tr('Tranches calculées depuis la date d’échéance (ou la date du document si aucune échéance) jusqu’à aujourd’hui. AR = factures émises non payées ; AP = achats « à terme » non payés.', 'Buckets computed from the due date (or document date if none) to today. AR = issued unpaid invoices; AP = unpaid on-account purchases.')}</p>
        </div>
      ) : sub === 'periods' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-bold">🔒 {tr('Verrouillage de période (anti back-dating)', 'Period lock (anti back-dating)')}</h3>
            <p className="mb-3 text-xs text-gray-500">{tr('Une période FERMÉE empêche toute écriture datée dedans — contrôle au niveau base de données (migration 183). Rouvrez-la pour corriger.', 'A CLOSED period blocks any entry dated within it — enforced at the database level (migration 183). Reopen to correct.')}</p>
            {canEdit && (() => {
              const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() + 1; const p2 = (n: number) => String(n).padStart(2, '0');
              const eom = new Date(y, m, 0).getDate();
              const closeRange = async (name: string, start: string, end: string) => {
                await upsertPeriod(tenant, { name, start_date: start, end_date: end });
                const ps = await getPeriods(tenant); const per = ps.find(x => x.name === name);
                if (per) { const { error } = await setPeriodStatus(tenant, per.id, 'closed'); if (error) { setNotice(error.message); return; } }
                reloadPeriods(); setNotice(tr(`Période ${name} fermée.`, `Period ${name} closed.`));
              };
              return (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => closeRange(`${y}-${p2(m)}`, `${y}-${p2(m)}-01`, `${y}-${p2(m)}-${p2(eom)}`)} className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">{tr(`Fermer le mois ${y}-${p2(m)}`, `Close month ${y}-${p2(m)}`)}</button>
                  <button onClick={() => closeRange(`${y}`, `${y}-01-01`, `${y}-12-31`)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">{tr(`Fermer l'année ${y}`, `Close year ${y}`)}</button>
                </div>
              );
            })()}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700"><th className="px-4 py-2">{tr('Période', 'Period')}</th><th className="px-3">{tr('Du', 'From')}</th><th className="px-3">{tr('Au', 'To')}</th><th className="px-3">{tr('Statut', 'Status')}</th><th className="px-3"></th></tr></thead>
              <tbody>
                {periods.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2 font-semibold">{p.name}</td>
                    <td className="px-3 text-gray-500">{p.start_date}</td>
                    <td className="px-3 text-gray-500">{p.end_date}</td>
                    <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'closed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'}`}>{p.status === 'closed' ? `🔒 ${tr('Fermée', 'Closed')}` : tr('Ouverte', 'Open')}</span></td>
                    <td className="px-3 text-right">{canEdit && <button onClick={async () => { const { error } = await setPeriodStatus(tenant, p.id, p.status === 'closed' ? 'open' : 'closed'); if (error) { setNotice(error.message); return; } reloadPeriods(); }} className="text-xs font-semibold text-blue-600 hover:underline">{p.status === 'closed' ? tr('Rouvrir', 'Reopen') : tr('Fermer', 'Close')}</button>}</td>
                  </tr>
                ))}
                {periods.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{tr('Aucune période. Ferme un mois ou une année pour verrouiller la comptabilité.', 'No period. Close a month or year to lock the books.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Écriture de correction / ajustement (la saisie NORMALE passe par Transactions, comptabilisées auto)
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            ⚠️ {tr('Cet écran sert UNIQUEMENT aux écritures de correction / ajustement (vérification comptable). La saisie normale (revenus, dépenses, achats) passe par le module ', 'This screen is ONLY for correcting/adjusting entries (accounting review). Normal entry (revenue, expenses, purchases) goes through the ')}<b>{tr('Transactions', 'Transactions')}</b>{tr(' — tout y est comptabilisé automatiquement au grand livre.', ' module — everything is auto-posted to the ledger there.')}
          </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-xs font-semibold text-gray-500">{tr('Date', 'Date')}<input type="date" value={neDate} onChange={e => setNeDate(e.target.value)} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Description', 'Description')}<input value={neDesc} onChange={e => setNeDesc(e.target.value)} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Référence', 'Reference')}<input value={neRef} onChange={e => setNeRef(e.target.value)} className={`mt-1 w-full ${inputCls}`} /></label>
          </div>
          <div className="mt-3 space-y-2">
            {neLines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <select value={l.account_id} onChange={e => setNeLines(p => p.map((x, j) => j === i ? { ...x, account_id: e.target.value } : x))} className={`col-span-6 ${inputCls}`}>
                  <option value="">{tr('— compte —', '— account —')}</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
                </select>
                <input type="number" placeholder={tr('Débit', 'Debit')} value={l.debit} onFocus={e => e.target.select()} onChange={e => setNeLines(p => p.map((x, j) => j === i ? { ...x, debit: e.target.value, credit: '' } : x))} className={`col-span-3 text-right ${inputCls}`} />
                <input type="number" placeholder={tr('Crédit', 'Credit')} value={l.credit} onFocus={e => e.target.select()} onChange={e => setNeLines(p => p.map((x, j) => j === i ? { ...x, credit: e.target.value, debit: '' } : x))} className={`col-span-3 text-right ${inputCls}`} />
              </div>
            ))}
            <button onClick={() => setNeLines(p => [...p, { account_id: '', debit: '', credit: '' }])} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Ajouter une ligne', 'Add line')}</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
            <div className="text-sm">
              <span className="text-gray-500">{tr('Débits', 'Debits')} : <b>{mny(neDebit)}</b></span>
              <span className="ml-4 text-gray-500">{tr('Crédits', 'Credits')} : <b>{mny(neCredit)}</b></span>
              <span className={`ml-4 font-semibold ${balanced ? 'text-emerald-600' : 'text-red-500'}`}>{balanced ? tr('Équilibré', 'Balanced') : tr('Déséquilibré', 'Unbalanced')}</span>
            </div>
            <button onClick={saveEntry} disabled={!balanced || saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">
              {saving ? <Loader2 size={15} className="inline animate-spin" /> : tr('Enregistrer l\'écriture de correction', 'Post adjusting entry')}
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FACTURE DE COMMERCE — facturation client multi-province + écriture de vente
// ============================================================
function InvoicingModule({ tenant, tr, canEdit, initialProject }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean; initialProject?: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const [view, setView] = useState<'list' | 'edit' | 'settings'>('list');
  const [invView, setInvView] = useState<'grid' | 'gallery'>('grid'); // liste factures : grille (défaut) / galerie
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({});
  const [loading, setLoading] = useState(true);
  const [migMissing, setMigMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const blankItem = (): InvoiceItem => ({ description: '', quantity: 1, unit_price: 0, subtotal: 0, taxable: true });
  const [hdr, setHdr] = useState<Invoice>({ invoice_number: '', status: 'draft', issue_date: today, province: 'QC', subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0 });
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([blankItem()]);
  const [saving, setSaving] = useState(false);
  // Stripe Connect (encaissement en ligne par le tenant). On ne stocke jamais de clé — uniquement le statut.
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; chargesEnabled: boolean } | null>(null);
  const [stripeBusy, setStripeBusy] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  useEffect(() => { fetch(`/api/stripe/connect/onboard?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(j => j && setStripeStatus(j)).catch(() => {}); }, [tenant]);
  async function connectStripe() {
    setStripeBusy(true); setNotice(null);
    try {
      const r = await fetch('/api/stripe/connect/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant }) });
      const j = await r.json();
      if (!r.ok || !j.url) { setNotice(j.error || tr('Stripe non configuré.', 'Stripe not configured.')); }
      else window.location.href = j.url; // redirige vers l'onboarding Express hébergé par Stripe
    } catch { setNotice(tr('Erreur réseau.', 'Network error.')); }
    setStripeBusy(false);
  }
  async function payInvoice(inv: Invoice) {
    if (!inv.id) return; setPayingId(inv.id); setNotice(null);
    try {
      const r = await fetch('/api/stripe/connect/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, invoiceId: inv.id }) });
      const j = await r.json();
      if (!r.ok || !j.url) { setNotice(j.error || tr('Paiement indisponible.', 'Payment unavailable.')); }
      else { try { await navigator.clipboard.writeText(j.url); } catch { /* noop */ } window.open(j.url, '_blank'); setNotice(tr('Lien de paiement ouvert (et copié).', 'Payment link opened (and copied).')); }
    } catch { setNotice(tr('Erreur réseau.', 'Network error.')); }
    setPayingId(null);
  }
  // Export PRO (HTML imprimable, même présentation que Soumission/DGA) + projets pour facturation projet.
  const [invMounted, setInvMounted] = useState(false);
  useEffect(() => { setInvMounted(true); }, []);
  const [projList, setProjList] = useState<{ id: string; label: string; po_amount?: number | null; client_name?: string | null }[]>([]);
  useEffect(() => { supabase.from('projects').select('id, title, project_number, client_name, po_amount').eq('tenant_id', tenant).order('created_at', { ascending: false }).then(({ data }) => setProjList((data || []).map((p: any) => ({ id: p.id, label: `${p.project_number ? p.project_number + ' — ' : ''}${p.title || p.id}`, po_amount: p.po_amount, client_name: p.client_name }))), () => {}); }, [tenant]);
  // Produits numériques (catalogue) — ajout en ligne de facture (porte item_id + classe pour le bilan par classe).
  const [prodList, setProdList] = useState<{ id: string; name: string; sale_price?: number; product_class?: string | null }[]>([]);
  useEffect(() => { supabase.from('items').select('id, name, sale_price, product_class').eq('tenant_id', tenant).eq('article_type', 'digital').order('name').then(({ data }) => setProdList((data as any[]) || []), () => {}); }, [tenant]);
  function addProductLine(pid: string) {
    const p = prodList.find(x => x.id === pid); if (!p) return;
    setItems(its => [...its.filter(i => i.description.trim() || (Number(i.unit_price) || 0) > 0), { description: p.name, quantity: 1, unit_price: Number(p.sale_price) || 0, subtotal: Number(p.sale_price) || 0, taxable: true, item_id: p.id, product_class: p.product_class || null }]);
  }
  function doInvPrint() {
    const prev = document.title; document.title = `Facture-${hdr.invoice_number || ''}`;
    const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    setTimeout(() => window.print(), 150);
  }
  // Préremplir une facture depuis un projet (client + ligne au montant du BC).
  function fillFromProject(pid: string) {
    const p = projList.find(x => x.id === pid); if (!p) return;
    setClientName(p.client_name || clientName);
    setHdr(h => ({ ...h, client_snapshot: { ...(h.client_snapshot || {}), name: p.client_name || h.client_snapshot?.name, projet: p.label } }));
    if (p.po_amount && p.po_amount > 0) setItems([{ description: `Travaux — ${p.label}`, quantity: 1, unit_price: Number(p.po_amount), subtotal: Number(p.po_amount), taxable: true }]);
  }
  // Lien « Facturer » de la page projet (?invoiceProject=) : ouvre une facture préremplie une seule fois, dès que les projets sont chargés.
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (!initialProject || prefilled || !projList.length) return;
    if (!projList.find(p => p.id === initialProject)) return;
    setPrefilled(true);
    (async () => { await newInvoice(); fillFromProject(initialProject); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProject, projList]);

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

  async function load() {
    setLoading(true); setMigMissing(false);
    try { const [inv, st] = await Promise.all([getInvoices(tenant), getCompanySettings(tenant)]); setInvoices(inv); setSettings(st || {}); }
    catch { setMigMissing(true); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  // #59 Temps réel : rafraîchit silencieusement la liste des factures (commerce_invoices, publié en 109).
  useRealtime(['commerce_invoices'], tenant, () => { getInvoices(tenant).then(setInvoices).catch(() => { /* noop */ }); });

  const totals = computeInvoiceTotals(items, hdr.province);
  const taxInfo = TAX_BY_PROVINCE[hdr.province] || TAX_BY_PROVINCE.QC;

  async function newInvoice() {
    const num = await nextInvoiceNumber(tenant, settings.invoice_prefix || 'F');
    setHdr({ invoice_number: num, status: 'draft', issue_date: today, province: settings.province || 'QC', subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0, payment_terms: settings.default_terms });
    setClientName(''); setItems([blankItem()]); setView('edit');
  }
  function editInvoice(inv: Invoice) {
    setHdr(inv); setClientName(inv.client_snapshot?.name || '');
    getInvoiceItems(tenant, inv.id!).then(its => setItems(its.length ? its : [blankItem()]));
    setView('edit');
  }
  async function save() {
    setSaving(true); setNotice(null);
    try { await saveInvoice(tenant, { ...hdr, client_snapshot: { name: clientName } }, items.filter(i => i.description.trim())); setNotice(tr('Facture enregistrée.', 'Invoice saved.')); await load(); setView('list'); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSaving(false);
  }
  async function changeStatus(inv: Invoice, status: Invoice['status']) {
    try { await setInvoiceStatus(tenant, inv.id!, status); await load(); } catch (e: any) { setNotice(e?.message); }
  }
  async function markPaid(inv: Invoice) {
    setNotice(null);
    try {
      const accs = await getAccounts(tenant); const m: Record<string, string> = {}; accs.forEach(a => m[a.code] = a.id);
      if (!inv.gl_entry_id && m['1100'] && m['4000']) await postSale(inv); // comptabilise la vente si pas déjà fait
      if (m['1000'] && m['1100']) {
        const { data: ex } = await supabase.from('gl_entries').select('id').eq('tenant_id', tenant).eq('source_type', 'invoice_payment').eq('source_id', inv.id).limit(1);
        if (!ex || !ex.length) {
          await createEntry(tenant, {
            entry_date: new Date().toISOString().slice(0, 10), description: `Encaissement — facture ${inv.invoice_number}`,
            reference: inv.invoice_number, journal_code: 'BNK', source_type: 'invoice_payment', source_id: inv.id,
            lines: [{ account_id: m['1000'], debit: Number(inv.total) || 0, credit: 0, description: 'Banque' }, { account_id: m['1100'], debit: 0, credit: Number(inv.total) || 0, description: 'Clients' }],
          });
        }
      }
      await setInvoiceStatus(tenant, inv.id!, 'paid');
      setNotice(tr('Facture payée — encaissement comptabilisé.', 'Invoice paid — payment posted.')); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function postSale(inv: Invoice) {
    setNotice(null);
    if (inv.gl_entry_id) { setNotice(tr('Déjà comptabilisée.', 'Already posted.')); return; }
    try {
      const accs = await getAccounts(tenant); const m: Record<string, string> = {}; accs.forEach(a => m[a.code] = a.id);
      if (!m['1100'] || !m['4000']) { setNotice(tr('Initialisez d\'abord le plan comptable (onglet Comptabilité).', 'Initialize the chart of accounts first.')); return; }
      const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
        { account_id: m['1100'], debit: Number(inv.total) || 0, credit: 0, description: 'Clients' },
        { account_id: m['4000'], debit: 0, credit: Number(inv.subtotal) || 0, description: 'Ventes et services' },
      ];
      const taxFed = (Number(inv.gst_amount) || 0) + (Number(inv.pst_amount) || 0);
      if (taxFed > 0 && m['2100']) lines.push({ account_id: m['2100'], debit: 0, credit: taxFed, description: 'TPS/TVH/PST à payer' });
      if ((Number(inv.qst_amount) || 0) > 0 && m['2110']) lines.push({ account_id: m['2110'], debit: 0, credit: Number(inv.qst_amount), description: 'TVQ à payer' });
      const entryId = await createEntry(tenant, { entry_date: inv.issue_date, description: `Vente — facture ${inv.invoice_number}`, reference: inv.invoice_number, journal_code: 'VEN', source_type: 'invoice', source_id: inv.id, lines });
      await supabase.from('commerce_invoices').update({ gl_entry_id: entryId, status: inv.status === 'draft' ? 'sent' : inv.status }).eq('id', inv.id);
      setNotice(tr('Vente comptabilisée au grand livre.', 'Sale posted to ledger.')); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (migMissing) return (<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('Module facturation non initialisé', 'Invoicing module not initialized')}</p><p className="mt-1 text-sm">{tr('Exécutez la migration 086 dans Supabase, puis rechargez.', 'Run migration 086 in Supabase, then reload.')}</p></div>);

  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';
  const STATUS_LABEL: Record<string, string> = { draft: tr('Brouillon', 'Draft'), sent: tr('Envoyée', 'Sent'), paid: tr('Payée', 'Paid'), cancelled: tr('Annulée', 'Cancelled') };
  const STATUS_COLOR: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700', paid: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button onClick={() => setView('list')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view !== 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}>{tr('Factures', 'Invoices')}</button>
          <button onClick={() => setView('settings')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'}`}>{tr('Paramètres', 'Settings')}</button>
        </div>
        {view === 'list' && canEdit && <button onClick={newInvoice} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ {tr('Nouvelle facture', 'New invoice')}</button>}
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

      {view === 'settings' ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-2">
            {([['legal_name', tr('Raison sociale', 'Legal name')], ['address', tr('Adresse', 'Address')], ['city', tr('Ville', 'City')], ['postal_code', tr('Code postal', 'Postal code')], ['phone', tr('Téléphone', 'Phone')], ['email', 'Courriel'], ['website', tr('Site web', 'Website')], ['gst_number', tr('N° TPS/TVH', 'GST/HST #')], ['qst_number', tr('N° TVQ', 'QST #')], ['invoice_prefix', tr('Préfixe facture', 'Invoice prefix')], ['default_terms', tr('Conditions par défaut', 'Default terms')], ['bank_details', tr('Coordonnées de paiement', 'Payment details')]] as const).map(([k, lbl]) => (
              <label key={k} className="text-xs font-semibold text-gray-500">{lbl}<input value={(settings as any)[k] || ''} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            ))}
            <label className="text-xs font-semibold text-gray-500">{tr('Province', 'Province')}<select value={settings.province || 'QC'} onChange={e => setSettings(s => ({ ...s, province: e.target.value }))} className={`mt-1 w-full ${inputCls}`}>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
          </div>
          {canEdit && <button onClick={async () => { try { await saveCompanySettings(tenant, settings); setNotice(tr('Paramètres enregistrés.', 'Settings saved.')); } catch (e: any) { setNotice(e?.message); } }} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{tr('Enregistrer', 'Save')}</button>}
        </div>
      ) : view === 'edit' ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-xs font-semibold text-gray-500">{tr('N° facture', 'Invoice #')}<input value={hdr.invoice_number} onChange={e => setHdr(h => ({ ...h, invoice_number: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Client', 'Client')}<input value={clientName} onChange={e => setClientName(e.target.value)} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Province', 'Province')}<select value={hdr.province} onChange={e => setHdr(h => ({ ...h, province: e.target.value }))} className={`mt-1 w-full ${inputCls}`}>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Date', 'Date')}<input type="date" value={hdr.issue_date} onChange={e => setHdr(h => ({ ...h, issue_date: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Échéance', 'Due date')}<input type="date" value={hdr.due_date || ''} onChange={e => setHdr(h => ({ ...h, due_date: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Conditions', 'Terms')}<input value={hdr.payment_terms || ''} onChange={e => setHdr(h => ({ ...h, payment_terms: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
          </div>
          <div className="mt-4 space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <input placeholder={tr('Description', 'Description')} value={it.description} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={`col-span-5 ${inputCls}`} />
                <input type="number" placeholder={tr('Qté', 'Qty')} value={it.quantity} onFocus={e => e.target.select()} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} className={`col-span-2 text-right ${inputCls}`} />
                <input type="number" placeholder={tr('Prix', 'Price')} value={it.unit_price} onFocus={e => e.target.select()} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, unit_price: Number(e.target.value) } : x))} className={`col-span-2 text-right ${inputCls}`} />
                <select value={it.tax_category || (it.taxable === false ? 'exempt' : 'standard')} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, tax_category: e.target.value as any, taxable: e.target.value === 'standard' } : x))} className="col-span-2 rounded border border-gray-300 px-1 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700" title={tr('Catégorie de taxe', 'Tax category')}>
                  <option value="standard">{tr('Taxable', 'Taxable')}</option>
                  <option value="zero_rated">{tr('Détaxé 0 %', 'Zero-rated')}</option>
                  <option value="exempt">{tr('Exonéré', 'Exempt')}</option>
                </select>
                <button onClick={() => setItems(p => p.filter((_, j) => j !== i))} className="col-span-1 text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setItems(p => [...p, blankItem()])} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Ajouter une ligne', 'Add line')}</button>
              {prodList.length > 0 && (
                <select onChange={e => { if (e.target.value) addProductLine(e.target.value); e.currentTarget.value = ''; }} className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700">
                  <option value="">+ {tr('Ajouter un produit (catalogue)', 'Add a product (catalogue)')}</option>
                  {prodList.map(p => <option key={p.id} value={p.id}>{p.name}{p.product_class ? ` · ${p.product_class}` : ''}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-col items-end gap-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
            <div>{tr('Sous-total', 'Subtotal')} : <b>{mny(totals.subtotal)}</b></div>
            {totals.gst_amount > 0 && <div>TPS ({(taxInfo.gst * 100).toFixed(0)} %) : {mny(totals.gst_amount)}</div>}
            {totals.qst_amount > 0 && <div>TVQ ({(taxInfo.qst * 100).toFixed(3)} %) : {mny(totals.qst_amount)}</div>}
            {totals.pst_amount > 0 && <div>{taxInfo.pstLabel} ({(taxInfo.pst * 100).toFixed(0)} %) : {mny(totals.pst_amount)}</div>}
            <div className="text-base font-bold">{tr('Total', 'Total')} : {mny(totals.total)}</div>
          </div>
          {/* Facturation depuis un PROJET : préremplit client + ligne au montant du BC */}
          {projList.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-900/20">
              <span className="font-semibold text-blue-700 dark:text-blue-300">{tr('Facturer un projet', 'Invoice a project')} :</span>
              <select onChange={e => { if (e.target.value) fillFromProject(e.target.value); e.currentTarget.value = ''; }} className="rounded-lg border border-blue-200 px-2 py-1 dark:border-blue-800 dark:bg-gray-700">
                <option value="">{tr('— Choisir un projet (préremplir) —', '— Pick a project (prefill) —')}</option>
                {projList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          )}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button onClick={() => setView('list')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
            <button onClick={doInvPrint} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">📄 {tr('Exporter (PDF — facture)', 'Export (PDF — invoice)')}</button>
            {canEdit && <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{saving ? <Loader2 size={15} className="inline animate-spin" /> : tr('Enregistrer', 'Save')}</button>}
          </div>
          {/* Facture imprimable (portail body) — même présentation pro que Soumission/DGA */}
          <style>{INV_PRINT_CSS}</style>
          {invMounted && createPortal(
            <InvoicePrintReport invoice={{ ...hdr, ...totals, client_snapshot: { ...(hdr.client_snapshot || {}), name: clientName } } as Invoice} items={items} settings={settings} logo={settings.logo_url || '/logo.png'} clientName={clientName} />,
            document.body)}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">{invoices.length} {tr('facture(s)', 'invoice(s)')}</span>
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-600">
              <button onClick={() => setInvView('grid')} className={`rounded-md px-2 py-1 font-semibold ${invView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Grille', 'Grid')}</button>
              <button onClick={() => setInvView('gallery')} className={`rounded-md px-2 py-1 font-semibold ${invView === 'gallery' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{tr('Galerie', 'Gallery')}</button>
            </div>
          </div>
          {/* Encaissement en ligne (Stripe Connect) : statut + bouton de connexion */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-800 dark:bg-indigo-900/20">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">💳 {tr('Encaissement en ligne', 'Online payments')} :</span>
              {!stripeStatus?.connected ? (
                <>
                  <span className="text-indigo-600 dark:text-indigo-300">{tr('non connecté', 'not connected')}</span>
                  <button onClick={connectStripe} disabled={stripeBusy} className="rounded-lg bg-indigo-600 px-3 py-1 font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">{stripeBusy ? <Loader2 size={12} className="inline animate-spin" /> : tr('Connecter Stripe', 'Connect Stripe')}</button>
                </>
              ) : stripeStatus.chargesEnabled ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><Check size={13} /> {tr('Stripe actif — paiements activés', 'Stripe active — payments enabled')}</span>
              ) : (
                <>
                  <span className="font-semibold text-amber-600">{tr('Stripe connecté — vérification en cours', 'Stripe connected — verification pending')}</span>
                  <button onClick={connectStripe} disabled={stripeBusy} className="rounded-lg border border-indigo-300 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300">{tr('Compléter', 'Complete')}</button>
                </>
              )}
            </div>
          )}
          {/* Comptes à recevoir : factures transmises non payées (+ en retard) + encaissé */}
          {invoices.length > 0 && (() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const ar = invoices.filter(i => i.status === 'sent');
            const arTotal = ar.reduce((s, i) => s + (Number(i.total) || 0), 0);
            const overdue = ar.filter(i => i.due_date && i.due_date < todayStr);
            const overdueTotal = overdue.reduce((s, i) => s + (Number(i.total) || 0), 0);
            const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.total) || 0), 0);
            return (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{tr('À recevoir', 'Receivable')} : {mny(arTotal)} ({ar.length})</span>
                {overdue.length > 0 && <span className="rounded-lg bg-rose-50 px-3 py-1.5 font-semibold text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">⚠ {tr('En retard', 'Overdue')} : {mny(overdueTotal)} ({overdue.length})</span>}
                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{tr('Encaissé', 'Collected')} : {mny(paidTotal)}</span>
              </div>
            );
          })()}
          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">{tr('Aucune facture.', 'No invoice yet.')}</div>
          ) : (
            <div className={invView === 'gallery' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'}>
              {invoices.map(inv => (
                <div key={inv.id} className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${invView === 'gallery' ? 'p-4' : 'p-3'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-gray-400">{inv.invoice_number} · {inv.issue_date}</div>
                      <div className="truncate font-bold text-gray-900 dark:text-white">{inv.client_snapshot?.name || '—'}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[11px] text-gray-400">{inv.gl_entry_id ? <span className="inline-flex items-center gap-1 text-emerald-600"><Check size={12} /> GL</span> : tr('Non comptabilisée', 'Not posted')}</span>
                    <span className={`font-extrabold text-gray-900 dark:text-white ${invView === 'gallery' ? 'text-2xl' : 'text-lg'}`}>{mny(inv.total)}</span>
                  </div>
                  {canEdit && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-gray-100 pt-2 text-xs dark:border-gray-700">
                      <button onClick={() => editInvoice(inv)} className="font-semibold text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                      <button onClick={() => exportInvoicePdf(tenant, inv).catch((e: any) => setNotice(e?.message || 'PDF erreur'))} className="text-gray-600 hover:underline dark:text-gray-300">PDF</button>
                      {inv.id && <button onClick={async () => {
                        try {
                          const r = await fetch('/api/documents/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ docType: 'invoice', docId: inv.id, docNumber: inv.invoice_number, tenant }) });
                          const j = await r.json();
                          if (!r.ok) { setNotice(j.error || 'Erreur (migration 180 ?)'); return; }
                          try { await navigator.clipboard.writeText(j.url); setNotice(tr('Lien client copié : ', 'Client link copied: ') + j.url); } catch { window.prompt(tr('Lien client :', 'Client link:'), j.url); }
                        } catch { setNotice(tr('Erreur réseau.', 'Network error.')); }
                      }} className="text-emerald-600 hover:underline">✍️ {tr('Transmettre', 'Send')}</button>}
                      {!inv.gl_entry_id && <button onClick={() => postSale(inv)} className="text-indigo-600 hover:underline">{tr('Comptabiliser', 'Post')}</button>}
                      {inv.status !== 'paid' && stripeStatus?.chargesEnabled && <button onClick={() => payInvoice(inv)} disabled={payingId === inv.id} className="font-semibold text-indigo-600 hover:underline disabled:opacity-40">{payingId === inv.id ? <Loader2 size={12} className="inline animate-spin" /> : `💳 ${tr('Payer', 'Pay')}`}</button>}
                      {inv.status !== 'paid' && <button onClick={() => markPaid(inv)} className="ml-auto text-emerald-600 hover:underline">{tr('Payée', 'Paid')}</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRANSACTIONS — depenses / achats fournisseurs + ecriture d'achat -> GL
// ============================================================
function TransactionsModule({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [view, setView] = useState<'list' | 'edit' | 'bank' | 'accounts'>('list');
  const [txns, setTxns] = useState<Transaction[]>([]);
  // Comptes de trésorerie (banque / carte de crédit) — migration 185
  const [treasury, setTreasury] = useState<TreasuryAccount[]>([]);
  const [newAcct, setNewAcct] = useState<{ name: string; kind: TreasuryKind; last4: string; institution: string }>({ name: '', kind: 'bank', last4: '', institution: '' });
  const reloadTreasury = () => getTreasuryAccounts(tenant).then(setTreasury).catch(() => {});
  // Rapprochement bancaire (#35)
  const [bankLines, setBankLines] = useState<BankLine[]>([]);
  const [importText, setImportText] = useState('');
  const [bankBusy, setBankBusy] = useState(false);
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [migMissing, setMigMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const blankItem = (code = '5300'): TransactionItem => ({ description: '', account_code: code, amount: 0, taxable: true });
  const [hdr, setHdr] = useState<Transaction>({ transaction_number: '', vendor_name: '', txn_type: 'expense', txn_date: today, province: 'QC', payment_method: 'cash', status: 'draft', subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0 });
  const [items, setItems] = useState<TransactionItem[]>([blankItem()]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Pièces jointes MULTIPLES (migration 187) — déjà persistées (avec id) ou en attente (sans id, sur une nouvelle transaction).
  const [attachments, setAttachments] = useState<TxnAttachment[]>([]);
  // Vérification IA (assistant comptable/fiscal)
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState<{ ok?: boolean; summary?: string; issues?: { severity: string; field?: string; message: string; suggestion?: string }[] } | null>(null);
  // Import par LOT : plusieurs reçus -> IA -> crée toutes les transactions
  const [batch, setBatch] = useState<{ busy: boolean; done: number; total: number; created: number; failed: number } | null>(null);
  // Filtres de la liste (#35 contrôle) : type, statut, recherche texte (n° / tiers).
  const [fType, setFType] = useState<'all' | 'revenue' | 'expense'>('all');
  const [fStatus, setFStatus] = useState<'all' | 'draft' | 'posted' | 'paid' | 'cancelled'>('all');
  const [fSearch, setFSearch] = useState('');

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  const isRevenue = hdr.txn_type === 'revenue';
  // Comptes proposés selon le type : revenus (produits) vs dépenses (charges/actif).
  const expenseAccounts = accounts.filter(a => a.type === 'expense' || a.type === 'asset');
  const revenueAccounts = accounts.filter(a => a.type === 'revenue');
  const lineAccounts = isRevenue ? revenueAccounts : expenseAccounts;
  const defaultAcct = isRevenue ? '4000' : '5300';

  // Tableau de bord (#35) : agrégats lecture seule, séparés revenus / dépenses.
  // revenue/expense = totaux par type ; gst/qst = taxes payées récupérables (CTI/RTI) sur les dépenses ;
  // payable = dû aux fournisseurs (dépense à crédit non payée).
  const summary = txns.reduce((a, t) => {
    const tot = Number(t.total) || 0;
    if (t.txn_type === 'revenue') { a.revenue += tot; a.revCount++; }
    else {
      a.expense += tot; a.expCount++;
      a.gst += Number(t.gst_amount) || 0;
      a.qst += Number(t.qst_amount) || 0;
      if (t.status !== 'paid' && t.status !== 'cancelled' && t.payment_method === 'on_account') a.payable += tot;
    }
    return a;
  }, { revenue: 0, expense: 0, revCount: 0, expCount: 0, gst: 0, qst: 0, payable: 0 });
  const summaryCount = summary.revCount + summary.expCount;

  // Liste filtrée (type / statut / recherche n° ou tiers).
  const fq = fSearch.trim().toLowerCase();
  const filteredTxns = txns.filter(t => {
    if (fType !== 'all' && (t.txn_type || 'expense') !== fType) return false;
    if (fStatus !== 'all' && t.status !== fStatus) return false;
    if (fq && !`${t.transaction_number || ''} ${t.vendor_name || ''}`.toLowerCase().includes(fq)) return false;
    return true;
  });

  // Export CSV des transactions filtrées (separateur ';' + BOM UTF-8 pour Excel FR ; pour
  // le comptable / rapprochement bancaire). Cote client, aucune dependance.
  function exportCsv() {
    const acctName = (id?: string | null) => { const a = treasury.find(x => x.id === id); return a ? `${a.name}${a.last4 ? ' ••' + a.last4 : ''}` : ''; };
    const head = ['No', 'Type', 'Date', 'Tiers', 'Province', 'Paiement', 'Compte', 'Sous-total', 'TPS', 'TVQ', 'PST', 'Total', 'Statut', 'GL', 'Piece jointe (URL)'];
    const rows = filteredTxns.map(t => [
      t.transaction_number || '', t.txn_type === 'revenue' ? 'Revenu' : 'Depense', t.txn_date || '',
      t.vendor_name || '', t.province || '', t.payment_method === 'on_account' ? 'A credit' : 'Comptant', acctName(t.treasury_account_id),
      Number(t.subtotal) || 0, Number(t.gst_amount) || 0, Number(t.qst_amount) || 0, Number(t.pst_amount) || 0,
      Number(t.total) || 0, t.status, t.gl_entry_id ? 'oui' : 'non', t.receipt_url || '',
    ]);
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${tenant}-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function load() {
    setLoading(true); setMigMissing(false);
    try {
      await ensureFiscalAccounts(tenant).catch(() => {}); // provisionne les comptes des classes fiscales
      const [tx, acc] = await Promise.all([getTransactions(tenant), getAccounts(tenant)]);
      setTxns(tx); setAccounts(acc); reloadTreasury();
    }
    catch { setMigMissing(true); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  // #59 Temps réel : rafraîchit silencieusement (sans spinner) sur changement des transactions
  // ou des lignes bancaires (collaboratif multi-utilisateur). Migrations 109 + 126 (publication).
  useRealtime(['commerce_transactions', 'bank_statement_lines'], tenant, () => {
    getTransactions(tenant).then(setTxns).catch(() => { /* noop */ });
    if (view === 'bank') getBankLines(tenant).then(setBankLines).catch(() => { /* noop */ });
  });

  const totals = computeTransactionTotals(items, hdr.province);
  const taxInfo = TAX_BY_PROVINCE[hdr.province] || TAX_BY_PROVINCE.QC;

  // Anti-perte : auto-brouillon local de la transaction en cours (en-tête + lignes).
  const txnDraftKey = `txn.${tenant}.${hdr.id || 'new'}`;
  useAutoDraft(txnDraftKey, { hdr, items }, view === 'edit');

  async function newTxn(kind: 'expense' | 'revenue' = 'expense') {
    const d = readDraft<{ hdr: Transaction; items: TransactionItem[] }>(`txn.${tenant}.new`);
    if (d?.hdr && (d.hdr.vendor_name || (d.items || []).some(i => i.description?.trim() || (Number(i.amount) || 0) > 0)) && window.confirm(tr('Une transaction non enregistrée a été retrouvée. La restaurer ?', 'An unsaved transaction was found. Restore it?'))) {
      setHdr(d.hdr); setItems(d.items?.length ? d.items : [blankItem()]); setAttachments([]); setAiResult(null); setView('edit'); return;
    }
    clearDraft(`txn.${tenant}.new`);
    const num = await nextTransactionNumber(tenant, kind === 'revenue' ? 'V' : 'A');
    setHdr({ transaction_number: num, vendor_name: '', txn_type: kind, txn_date: today, province: 'QC', payment_method: 'cash', status: 'draft', subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0 });
    setItems([blankItem(kind === 'revenue' ? '4000' : '5300')]); setAttachments([]); setAiResult(null); setView('edit');
  }
  function editTxn(t: Transaction) {
    const d = t.id ? readDraft<{ hdr: Transaction; items: TransactionItem[] }>(`txn.${tenant}.${t.id}`) : null;
    setAiResult(null);
    getAttachments(tenant, t.id!).then(setAttachments).catch(() => setAttachments([]));
    if (d?.hdr && window.confirm(tr('Des modifications non enregistrées ont été retrouvées pour cette transaction. Les restaurer ?', 'Unsaved changes were found for this transaction. Restore them?'))) {
      setHdr({ ...d.hdr, id: t.id }); setItems(d.items?.length ? d.items : [blankItem()]); setView('edit'); return;
    }
    setHdr(t);
    getTransactionItems(tenant, t.id!).then(its => setItems(its.length ? its : [blankItem()]));
    setView('edit');
  }
  async function save() {
    setSaving(true); setNotice(null);
    try {
      // Enregistrer = VÉRIFIER : on lève le drapeau « à vérifier » (puis on comptabilise plus bas).
      const id = await saveTransaction(tenant, { ...hdr, needs_review: false }, items.filter(i => i.description.trim() || (Number(i.amount) || 0) > 0));
      // Persiste les pièces jointes EN ATTENTE (ajoutées sur une nouvelle transaction, donc sans id).
      for (const a of attachments.filter(x => !x.id)) { await addAttachment(tenant, id, a).catch(() => {}); }
      // « Tout remonte vers comptabilité » (exercice) : on COMPTABILISE immédiatement au grand livre,
      // avec un retour CLAIR (succès vs raison de l'échec — fini le silence).
      await setTransactionStatus(tenant, id, 'posted').catch(() => {});
      const pr = await postTransactionNow(tenant, id);
      clearDraft(txnDraftKey); clearDraft(`txn.${tenant}.new`); // brouillon comptabilisé → purge
      setNotice(pr.ok
        ? tr('Transaction enregistrée et comptabilisée au grand livre.', 'Transaction saved and posted to the ledger.')
        : `${tr('Transaction enregistrée, mais NON comptabilisée :', 'Saved, but NOT posted:')} ${pr.reason}`);
      await load(); setView('list');
    }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setSaving(false);
  }
  async function onReceipt(file: File) {
    setUploading(true); setNotice(null);
    try { const url = await uploadReceipt(tenant, file); setHdr(h => ({ ...h, receipt_url: url })); setNotice(tr('Reçu joint.', 'Receipt attached.')); }
    catch (e: any) { setNotice(e?.message || tr('Erreur téléversement.', 'Upload error.')); }
    setUploading(false);
  }
  // Pièces jointes MULTIPLES : téléverse + lie (immédiat si la transaction est déjà sauvegardée, sinon en attente).
  async function addAttach(file: File) {
    setUploading(true); setNotice(null);
    try {
      const url = await uploadReceipt(tenant, file);
      const att: TxnAttachment = { file_name: file.name, file_url: url, file_type: file.type || null, file_size: file.size || null };
      if (hdr.id) { const r = await addAttachment(tenant, hdr.id, att); setAttachments(p => [...p, { ...att, id: r.id, transaction_id: hdr.id }]); }
      else setAttachments(p => [...p, att]);
    } catch (e: any) { setNotice(e?.message || tr('Erreur téléversement.', 'Upload error.')); }
    setUploading(false);
  }
  async function removeAttach(att: TxnAttachment, idx: number) {
    if (att.id) await deleteAttachment(tenant, att.id).catch(() => {});
    setAttachments(p => p.filter((_, i) => i !== idx));
  }
  // « Vérifier IA » : envoie la transaction (en-tête + lignes) à l'assistant comptable/fiscal.
  async function verifyAI() {
    setAiChecking(true); setAiResult(null); setNotice(null);
    try {
      const payload = {
        txn_type: hdr.txn_type, province: hdr.province, payment_method: hdr.payment_method,
        vendor_name: hdr.vendor_name, has_receipt: !!hdr.receipt_url,
        subtotal: totals.subtotal, gst_amount: totals.gst_amount, qst_amount: totals.qst_amount, pst_amount: totals.pst_amount, total: totals.total,
        lines: items.map(i => ({ description: i.description, account_code: i.account_code, account_name: lineAccounts.find(a => a.code === i.account_code)?.name, amount: i.amount, tax_category: i.tax_category || (i.taxable === false ? 'exempt' : 'standard') })),
      };
      const r = await fetch('/api/transactions/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ transaction: payload }) });
      const j = await r.json();
      // Rapprochement déterministe REVENU <-> FACTURE : ce paiement correspond-il à un projet facturé ?
      const extra: { severity: string; field?: string; message: string; suggestion?: string }[] = [];
      try {
        if (hdr.txn_type === 'revenue' && totals.total > 0) {
          const invs = await getInvoices(tenant);
          const tol = Math.max(1, totals.total * 0.02);
          for (const iv of invs.filter(v => v.status !== 'cancelled' && Math.abs((Number(v.total) || 0) - totals.total) <= tol).slice(0, 3)) {
            const cl = (iv.client_snapshot as any)?.name || (iv.client_snapshot as any)?.legal_name || '';
            extra.push({ severity: 'info', field: tr('Rapprochement facture', 'Invoice match'), message: tr(`Montant proche de la facture ${iv.invoice_number}${cl ? ` (${cl})` : ''} — paiement d’un projet facturé ?`, `Amount close to invoice ${iv.invoice_number}${cl ? ` (${cl})` : ''} — payment of an invoiced project?`), suggestion: iv.status === 'paid' ? tr('Facture déjà payée.', 'Invoice already paid.') : tr('Si c’est l’encaissement, marquez la facture payée.', 'If this is the receipt, mark the invoice paid.') });
          }
        }
      } catch { /* pas de facture -> ignore */ }
      if (!r.ok) { setNotice(j?.error || tr('Vérification IA indisponible.', 'AI check unavailable.')); if (extra.length) setAiResult({ ok: false, issues: extra }); }
      else { const base = j.result || { ok: true, issues: [] }; setAiResult({ ...base, issues: [...(base.issues || []), ...extra] }); }
    } catch (e: any) { setNotice(e?.message || tr('Erreur IA.', 'AI error.')); }
    setAiChecking(false);
  }
  // Import par LOT : on pousse PLUSIEURS reçus à l'IA et on crée+comptabilise une transaction par reçu.
  // Crée UNE transaction « à vérifier » à partir des champs extraits par l'IA (image/PDF/ligne Excel).
  async function createTxnFromExtracted(x: any, receiptUrl: string | null) {
    const gst = Number(x.gst) || 0, qst = Number(x.qst) || 0, pst = Number(x.pst) || 0;
    const sub = Number(x.subtotal) || (Number(x.total) ? Number(x.total) - gst - qst - pst : 0) || 0;
    if (Math.abs(sub) < 0.005 && !(Number(x.total) > 0)) return false;
    const taxed = gst > 0 || qst > 0;
    const isRev = x.type === 'revenue';
    const num = await nextTransactionNumber(tenant, isRev ? 'V' : 'A');
    const header: Transaction = { transaction_number: num, vendor_name: x.vendor || '', txn_type: isRev ? 'revenue' : 'expense', txn_date: x.date || today, province: 'QC', payment_method: 'cash', status: 'draft', needs_review: true, subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0, receipt_url: receiptUrl };
    const its: TransactionItem[] = [{ description: x.description || x.category_hint || tr('Achat', 'Purchase'), account_code: isRev ? '4000' : '5300', amount: Math.round(sub * 100) / 100, taxable: taxed, tax_category: taxed ? 'standard' : 'exempt' }];
    await saveTransaction(tenant, header, its);
    return true;
  }
  async function batchScanCreate(files: File[]) {
    if (!files.length) return;
    setBatch({ busy: true, done: 0, total: files.length, created: 0, failed: 0 });
    let created = 0, failed = 0; let lastErr = '';
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl: string = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result || '')); rd.onerror = rej; rd.readAsDataURL(file); });
        const resp = await fetch('/api/transactions/scan-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ imageBase64: dataUrl, media_type: file.type, file_name: file.name }) });
        const j = await resp.json().catch(() => ({}));
        if (!resp.ok) { failed++; lastErr = j.error || `HTTP ${resp.status}`; setBatch(b => b && { ...b, done: i + 1, failed }); continue; }
        const url = await uploadReceipt(tenant, file).catch(() => null); // pièce source (reçu / relevé)
        if (Array.isArray(j.extractedList)) {            // Excel/CSV -> N transactions (une par ligne)
          for (const x of j.extractedList) { try { if (await createTxnFromExtracted(x, url)) created++; } catch (e: any) { failed++; lastErr = e?.message || lastErr; } }
        } else if (j.extracted) {                        // image/PDF -> 1 transaction
          try { if (await createTxnFromExtracted(j.extracted, url)) created++; else failed++; } catch (e: any) { failed++; lastErr = e?.message || lastErr; }
        } else { failed++; lastErr = tr('Réponse IA vide', 'Empty AI response'); }
      } catch (e: any) { failed++; lastErr = e?.message || lastErr; }
      setBatch(b => b && { ...b, done: i + 1, created, failed });
    }
    setBatch(b => b && { ...b, busy: false });
    setNotice(tr(`${created} transaction(s) créée(s) — ⏳ À VÉRIFIER (vérifiez puis comptabilisez)${failed ? `, ${failed} échec(s)${lastErr ? ` — ${lastErr}` : ''}` : ''}.`, `${created} transaction(s) created — ⏳ TO REVIEW (verify then post)${failed ? `, ${failed} failed${lastErr ? ` — ${lastErr}` : ''}` : ''}.`));
    // Ne PAS forcer le filtre sur « Brouillon » : ça masquait les autres transactions (revenus, comptabilisées).
    // Les nouvelles lignes sont déjà badgées « À vérifier » ; on garde le filtre courant.
    await load();
  }
  // « Scanner le reçu (IA) » : OCR de la pièce jointe -> pré-remplit + joint le reçu (contrôle comptable).
  async function scanReceiptAI(file: File) {
    setAiChecking(true); setNotice(tr('Lecture du reçu par l’IA…', 'AI reading the receipt…'));
    try {
      const dataUrl: string = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result || '')); rd.onerror = rej; rd.readAsDataURL(file); });
      const resp = await fetch('/api/transactions/scan-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ imageBase64: dataUrl, media_type: file.type, file_name: file.name }) });
      const j = await resp.json();
      if (!resp.ok) { setNotice(j?.error || tr('Scan indisponible.', 'Scan unavailable.')); setAiChecking(false); return; }
      // Excel/CSV = liste : on remplit avec la 1re ligne et on invite à l'import par lot pour toutes.
      if (Array.isArray(j.extractedList)) {
        if (!j.extractedList.length) { setNotice(tr('Aucune ligne détectée.', 'No line detected.')); setAiChecking(false); return; }
        if (j.extractedList.length > 1) setNotice(tr(`${j.extractedList.length} lignes détectées — utilisez « Import lot (IA) » pour toutes les créer.`, `${j.extractedList.length} lines detected — use “Batch import (AI)” to create them all.`));
      }
      const x = j.extracted || (Array.isArray(j.extractedList) ? j.extractedList[0] : {}) || {};
      const gst = Number(x.gst) || 0, qst = Number(x.qst) || 0, pst = Number(x.pst) || 0;
      const sub = Number(x.subtotal) || (Number(x.total) ? Number(x.total) - gst - qst - pst : 0) || Number(x.total) || 0;
      const taxed = gst > 0 || qst > 0;
      const isRev = x.type === 'revenue';
      setHdr(h => ({ ...h, vendor_name: x.vendor || h.vendor_name, txn_date: x.date || h.txn_date, txn_type: isRev ? 'revenue' : (h.txn_type || 'expense') }));
      setItems([{ description: x.description || x.category_hint || tr('Achat', 'Purchase'), account_code: isRev ? '4000' : '5300', amount: Math.round(sub * 100) / 100, taxable: taxed, tax_category: taxed ? 'standard' : 'exempt' }]);
      // Joint aussi le reçu scanné (pièce justificative liée).
      uploadReceipt(tenant, file).then(url => setHdr(h => ({ ...h, receipt_url: url }))).catch(() => {});
      setNotice(tr(`Reçu lu (fiabilité : ${x.confidence || '?'}) — vérifiez les champs pré-remplis, puis « Vérifier IA ».`, `Receipt read (confidence: ${x.confidence || '?'}) — review the pre-filled fields, then “AI check”.`));
    } catch (e: any) { setNotice(e?.message || tr('Erreur scan.', 'Scan error.')); }
    setAiChecking(false);
  }
  async function postPurchase(t: Transaction) {
    setNotice(null);
    if (t.gl_entry_id) { setNotice(tr('Déjà comptabilisée.', 'Already posted.')); return; }
    try {
      const its = await getTransactionItems(tenant, t.id!);
      const m: Record<string, string> = {}; accounts.forEach(a => m[a.code] = a.id);
      // Route REVENU -> vente / DÉPENSE -> achat. Sans plan comptable -> message d'init.
      const r = t.txn_type === 'revenue'
        ? await postTransactionRevenue(tenant, t, its, m)
        : await postTransactionPurchase(tenant, t, its, m);
      if (r === 'no-accounts') { setNotice(tr('Initialisez d\'abord le plan comptable (onglet Comptabilité).', 'Initialize the chart of accounts first.')); return; }
      setNotice(r === 'created' ? tr('Comptabilisé au grand livre.', 'Posted to ledger.') : tr('Déjà comptabilisée.', 'Already posted.'));
      await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function payTxn(t: Transaction) {
    setNotice(null);
    try {
      const m: Record<string, string> = {}; accounts.forEach(a => m[a.code] = a.id);
      if (!t.gl_entry_id) await postPurchase(t); // comptabilise l'achat si pas deja fait
      const r = await postTransactionPayment(tenant, t, m);
      if (r === 'no-accounts') { setNotice(tr('Plan comptable non initialisé.', 'Chart of accounts not initialized.')); return; }
      await setTransactionStatus(tenant, t.id!, 'paid');
      setNotice(tr('Paiement comptabilisé.', 'Payment posted.')); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  // Vérifie une transaction pré-remplie par l'IA : lève le drapeau « à vérifier » PUIS comptabilise.
  async function verifyTxn(t: Transaction) {
    setNotice(null);
    try { await setTransactionReviewed(tenant, t.id!); await postPurchase({ ...t, needs_review: false }); setNotice(tr('Vérifiée et comptabilisée.', 'Verified and posted.')); await load(); }
    catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  // Marque une transaction PAYÉE (encaissée/réglée). Pour une dépense à crédit, comptabilise le paiement.
  async function markPaid(t: Transaction) {
    setNotice(null);
    try {
      if (!t.gl_entry_id) await postPurchase(t);
      await setTransactionStatus(tenant, t.id!, 'paid');
      setNotice(tr('Marquée payée.', 'Marked paid.')); await load();
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
  }
  async function removeTxn(t: Transaction) {
    if (t.gl_entry_id) { setNotice(tr('Transaction comptabilisée : contre-passez l\'écriture dans le grand livre avant de supprimer.', 'Posted transaction: reverse the entry in the ledger before deleting.')); return; }
    try { await deleteTransaction(tenant, t.id!); await load(); } catch (e: any) { setNotice(e?.message); }
  }

  // ── Rapprochement bancaire (#35) ──────────────────────────────────────────
  async function openBank() {
    setView('bank'); setNotice(null); setBankBusy(true);
    try { setBankLines(await getBankLines(tenant)); }
    catch { setNotice(tr('Exécutez la migration 123, puis rechargez.', 'Run migration 123, then reload.')); }
    setBankBusy(false);
  }
  async function doImportBank() {
    const parsed = parseBankCsv(importText);
    if (!parsed.length) { setNotice(tr('Aucune ligne détectée dans le CSV.', 'No line detected in the CSV.')); return; }
    setBankBusy(true); setNotice(null);
    try {
      await insertBankLines(tenant, parsed); setImportText('');
      setBankLines(await getBankLines(tenant));
      setNotice(`${parsed.length} ${tr('lignes importées.', 'lines imported.')}`);
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setBankBusy(false);
  }
  async function matchBankLine(id: string, transactionId: string) {
    const patch = { matched_transaction_id: transactionId || null, reconciled: !!transactionId };
    setBankLines(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    try { await updateBankLine(tenant, id, patch); } catch (e: any) { setNotice(e?.message); }
  }
  async function toggleReconciled(id: string, reconciled: boolean) {
    setBankLines(prev => prev.map(b => b.id === id ? { ...b, reconciled } : b));
    try { await updateBankLine(tenant, id, { reconciled }); } catch (e: any) { setNotice(e?.message); }
  }
  async function removeBankLine(id: string) {
    setBankLines(prev => prev.filter(b => b.id !== id));
    try { await deleteBankLine(tenant, id); } catch (e: any) { setNotice(e?.message); }
  }
  async function doAutoMatch() {
    setBankBusy(true); setNotice(null);
    try {
      const r = await autoMatchBankLines(tenant, { apply: true });
      setBankLines(await getBankLines(tenant));
      const amb = r.suggestions.length;
      setNotice(`${r.applied} ${tr('ligne(s) rapprochée(s) automatiquement', 'line(s) auto-reconciled')}${amb ? ` · ${amb} ${tr('ambiguë(s) à valider manuellement', 'ambiguous to confirm manually')}` : ''}.`);
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setBankBusy(false);
  }
  // IA sur le relevé bancaire : crée des transactions « à vérifier » à partir des lignes NON rapprochées
  // (l'IA catégorise chaque ligne : fournisseur, compte, revenu/dépense selon le signe).
  async function doBankAI() {
    const lines = bankLines.filter(b => !b.reconciled && !b.matched_transaction_id);
    if (!lines.length) { setNotice(tr('Aucune ligne non rapprochée.', 'No unreconciled line.')); return; }
    setBankBusy(true); setNotice(tr('L’IA catégorise les lignes bancaires…', 'AI categorizing bank lines…'));
    try {
      const csv = 'date,description,montant\n' + lines.map(b => `${b.stmt_date},"${String(b.description || '').replace(/"/g, '""')}",${b.amount}`).join('\n');
      const b64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(csv))) : '';
      const resp = await fetch('/api/transactions/scan-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fileBase64: b64, media_type: 'text/csv', file_name: 'releve.csv' }) });
      const j = await resp.json();
      if (!resp.ok) { setNotice(j?.error || tr('IA indisponible.', 'AI unavailable.')); setBankBusy(false); return; }
      const itemsX: any[] = Array.isArray(j.extractedList) ? j.extractedList : [];
      let created = 0;
      for (const x of itemsX) { try { if (await createTxnFromExtracted(x, null)) created++; } catch { /* skip */ } }
      // Marque les lignes traitées comme rapprochées (transactions créées à vérifier).
      for (const b of lines) { try { await updateBankLine(tenant, b.id!, { reconciled: true }); } catch { /* noop */ } }
      setBankLines(await getBankLines(tenant));
      setNotice(tr(`${created} transaction(s) créée(s) depuis le relevé — ⏳ À VÉRIFIER.`, `${created} transaction(s) created from the statement — ⏳ TO REVIEW.`));
    } catch (e: any) { setNotice(e?.message || tr('Erreur.', 'Error.')); }
    setBankBusy(false);
  }

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (migMissing) return (<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('Module transactions non initialisé', 'Transactions module not initialized')}</p><p className="mt-1 text-sm">{tr('Exécutez la migration 087 dans Supabase, puis rechargez.', 'Run migration 087 in Supabase, then reload.')}</p></div>);

  const inputCls = 'rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800';
  const STATUS_LABEL: Record<string, string> = { draft: tr('Brouillon', 'Draft'), posted: tr('Comptabilisée', 'Posted'), paid: tr('Payée', 'Paid'), cancelled: tr('Annulée', 'Cancelled') };
  const STATUS_COLOR: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', posted: 'bg-blue-100 text-blue-700', paid: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-gray-500">{tr('Transactions (revenus & dépenses)', 'Transactions (revenue & expenses)')}</h2>
        {view === 'list' && canEdit && <div className="flex flex-wrap gap-2">
          <button onClick={() => newTxn('revenue')} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ {tr('Revenu', 'Revenue')}</button>
          <button onClick={() => newTxn('expense')} className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">+ {tr('Dépense', 'Expense')}</button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300" title={tr('Plusieurs reçus -> l’IA crée et comptabilise toutes les transactions', 'Many receipts -> AI creates and posts all transactions')}>
            {batch?.busy ? <Loader2 size={14} className="animate-spin" /> : '📷'} {tr('Import lot (IA)', 'Batch import (AI)')}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,.xls,.xlsx,.csv" multiple className="hidden" disabled={batch?.busy} onChange={e => { const fs = Array.from(e.target.files || []); e.currentTarget.value = ''; if (fs.length) batchScanCreate(fs); }} />
          </label>
          <button onClick={() => { setView('accounts'); setNotice(null); }} className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">🏦 {tr('Mes comptes', 'My accounts')}</button>
          <button onClick={openBank} className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">{tr('Rapprochement bancaire', 'Bank reconciliation')}</button>
        </div>}
        {(view === 'bank' || view === 'accounts') && <button onClick={() => { setView('list'); setNotice(null); }} className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">← {tr('Retour aux transactions', 'Back to transactions')}</button>}
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}
      {batch?.busy && <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300">📷 {tr('Lecture IA des reçus', 'AI reading receipts')} : {batch.done}/{batch.total} · {batch.created} {tr('créée(s)', 'created')}{batch.failed ? `, ${batch.failed} ${tr('échec(s)', 'failed')}` : ''}</div>}

      {view === 'edit' ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isRevenue ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isRevenue ? tr('Revenu', 'Revenue') : tr('Dépense', 'Expense')}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-xs font-semibold text-gray-500">{tr('N°', '#')}<input value={hdr.transaction_number} onChange={e => setHdr(h => ({ ...h, transaction_number: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{isRevenue ? tr('Client', 'Client') : tr('Fournisseur', 'Vendor')}<input value={hdr.vendor_name || ''} onChange={e => setHdr(h => ({ ...h, vendor_name: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Date', 'Date')}<input type="date" value={hdr.txn_date} onChange={e => setHdr(h => ({ ...h, txn_date: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Province', 'Province')}<select value={hdr.province} onChange={e => setHdr(h => ({ ...h, province: e.target.value }))} className={`mt-1 w-full ${inputCls}`}>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
            <label className="text-xs font-semibold text-gray-500">{tr('Paiement', 'Payment')}<select value={hdr.payment_method} onChange={e => setHdr(h => ({ ...h, payment_method: e.target.value as Transaction['payment_method'] }))} className={`mt-1 w-full ${inputCls}`}><option value="cash">{tr('Comptant / banque / carte', 'Cash / bank / card')}</option><option value="on_account">{isRevenue ? tr('À recevoir (client)', 'Receivable (client)') : tr('À crédit (fournisseur)', 'On account (vendor)')}</option></select></label>
            {hdr.payment_method === 'cash' && (
              <label className="text-xs font-semibold text-gray-500">{tr('Compte', 'Account')}
                <div className="mt-1 flex items-center gap-1">
                  <select value={hdr.treasury_account_id || ''} onChange={e => setHdr(h => ({ ...h, treasury_account_id: e.target.value || null }))} className={`w-full ${inputCls}`}>
                    <option value="">{tr('— Banque par défaut —', '— Default bank —')}</option>
                    {treasury.filter(a => a.active !== false).map(a => <option key={a.id} value={a.id}>{TREASURY_KIND_LABELS[a.kind][0] === 'Carte de crédit' ? '💳' : a.kind === 'cash' ? '💵' : '🏦'} {a.name}{a.last4 ? ` ••${a.last4}` : ''}</option>)}
                  </select>
                  <button type="button" onClick={() => setView('accounts')} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-600" title={tr('Gérer mes comptes', 'Manage my accounts')}>＋</button>
                </div>
              </label>
            )}
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Notes', 'Notes')}<input value={hdr.notes || ''} onChange={e => setHdr(h => ({ ...h, notes: e.target.value }))} className={`mt-1 w-full ${inputCls}`} /></label>
          </div>
          <div className="mt-4 space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <input placeholder={tr('Description', 'Description')} value={it.description} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={`col-span-4 ${inputCls}`} />
                {/* Classe fiscale GUIDÉE : choisit le compte GL + la catégorie de taxe. */}
                <select value={fiscalByCode(it.account_code)?.key || ''} onChange={e => { const c = FISCAL_CATEGORIES.find(x => x.key === e.target.value); if (c) setItems(p => p.map((x, j) => j === i ? { ...x, account_code: c.glCode, tax_category: c.tax, taxable: c.tax === 'standard' } : x)); }} className={`col-span-4 ${inputCls}`} title={tr('Catégorie (classe fiscale)', 'Category (fiscal class)')}>
                  <option value="">{it.account_code ? `${it.account_code}${lineAccounts.find(a => a.code === it.account_code)?.name ? ' · ' + lineAccounts.find(a => a.code === it.account_code)!.name : ''}` : tr('— Catégorie —', '— Category —')}</option>
                  {Array.from(new Set(FISCAL_CATEGORIES.filter(c => c.kind === (isRevenue ? 'revenue' : 'expense')).map(c => c.group))).map(g => (
                    <optgroup key={g} label={g}>
                      {FISCAL_CATEGORIES.filter(c => c.kind === (isRevenue ? 'revenue' : 'expense') && c.group === g).map(c => <option key={c.key} value={c.key}>{tr(c.fr, c.en)}</option>)}
                    </optgroup>
                  ))}
                </select>
                <input type="number" placeholder={tr('Montant', 'Amount')} value={it.amount} onFocus={e => e.target.select()} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, amount: Number(e.target.value) } : x))} className={`col-span-2 text-right ${inputCls}`} />
                <select value={it.tax_category || (it.taxable === false ? 'exempt' : 'standard')} onChange={e => setItems(p => p.map((x, j) => j === i ? { ...x, tax_category: e.target.value as any, taxable: e.target.value === 'standard' } : x))} className="col-span-1 rounded border border-gray-300 px-1 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700" title={tr('Catégorie de taxe', 'Tax category')}>
                  <option value="standard">{tr('Taxable', 'Taxable')}</option>
                  <option value="zero_rated">{tr('Détaxé', 'Zero-r.')}</option>
                  <option value="exempt">{tr('Exonéré', 'Exempt')}</option>
                </select>
                <button onClick={() => setItems(p => p.filter((_, j) => j !== i))} className="col-span-1 text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
            <button onClick={() => setItems(p => [...p, blankItem(defaultAcct)])} className="text-xs font-semibold text-blue-600 hover:underline">+ {tr('Ajouter une ligne', 'Add line')}</button>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
            <div className="flex items-center gap-3 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                <Paperclip size={14} /> {uploading ? <Loader2 size={13} className="inline animate-spin" /> : tr('Joindre un reçu', 'Attach receipt')}
                <input type="file" accept="image/*,application/pdf,.xls,.xlsx,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onReceipt(f); }} />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300" title={tr('L’IA lit le reçu et pré-remplit la transaction (et le joint)', 'AI reads the receipt and pre-fills the transaction (and attaches it)')}>
                📷 {aiChecking ? <Loader2 size={13} className="inline animate-spin" /> : tr('Scanner le reçu (IA)', 'Scan receipt (AI)')}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,.xls,.xlsx,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) scanReceiptAI(f); }} />
              </label>
              {hdr.receipt_url && <a href={hdr.receipt_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{tr('Voir le reçu', 'View receipt')}</a>}
              <button onClick={verifyAI} disabled={aiChecking} className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-40 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300" title={tr('L’IA vérifie la cohérence comptable/fiscale et propose des corrections', 'AI checks accounting/tax coherence and suggests fixes')}>{aiChecking ? <Loader2 size={13} className="animate-spin" /> : '✨'} {tr('Vérifier IA', 'AI check')}</button>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm">
              <div>{tr('Sous-total', 'Subtotal')} : <b>{mny(totals.subtotal)}</b></div>
              {totals.gst_amount > 0 && <div>TPS ({(taxInfo.gst * 100).toFixed(0)} %) : {mny(totals.gst_amount)}</div>}
              {totals.qst_amount > 0 && <div>TVQ ({(taxInfo.qst * 100).toFixed(3)} %) : {mny(totals.qst_amount)}</div>}
              {totals.pst_amount > 0 && <div>{taxInfo.pstLabel} ({(taxInfo.pst * 100).toFixed(0)} %) : {mny(totals.pst_amount)}</div>}
              <div className="text-base font-bold">{tr('Total', 'Total')} : {mny(totals.total)}</div>
            </div>
          </div>
          {/* Pièces jointes MULTIPLES (reçus, factures, justificatifs) */}
          <div className="mt-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">📎 {tr('Pièces jointes', 'Attachments')} ({attachments.length})</span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">
                {uploading ? <Loader2 size={13} className="inline animate-spin" /> : <Paperclip size={13} />} {tr('Ajouter une pièce', 'Add a file')}
                <input type="file" accept="image/*,application/pdf,.xls,.xlsx,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) addAttach(f); e.currentTarget.value = ''; }} />
              </label>
            </div>
            {attachments.length === 0
              ? <div className="text-xs text-gray-400">{tr('Aucune pièce jointe. Le reçu principal et les pièces ajoutées ici accompagnent l’écriture au grand livre.', 'No attachment. The main receipt and files added here accompany the ledger entry.')}</div>
              : <ul className="space-y-1">{attachments.map((a, i) => (
                  <li key={a.id || i} className="flex items-center gap-2 text-xs">
                    <a href={a.file_url} target="_blank" rel="noreferrer" className="flex-1 truncate text-blue-600 hover:underline">📄 {a.file_name}</a>
                    <button onClick={() => removeAttach(a, i)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  </li>
                ))}</ul>}
          </div>
          {/* Résultat de la vérification IA */}
          {aiResult && (
            <div className={`mt-3 rounded-xl border p-3 text-sm ${aiResult.ok && !(aiResult.issues || []).length ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100'}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold">✨ {tr('Vérification IA', 'AI check')}{aiResult.summary ? ` — ${aiResult.summary}` : ''}</span>
                <button onClick={() => setAiResult(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {(!aiResult.issues || aiResult.issues.length === 0)
                ? <div>{tr('✓ Aucune incohérence détectée.', '✓ No issue detected.')}</div>
                : <ul className="space-y-1">{aiResult.issues.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span>{it.severity === 'error' ? '🔴' : it.severity === 'warning' ? '🟠' : 'ℹ️'}</span>
                      <span><b>{it.field ? `${it.field} : ` : ''}</b>{it.message}{it.suggestion ? <em className="block text-xs opacity-80">→ {it.suggestion}</em> : null}</span>
                    </li>
                  ))}</ul>}
            </div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setView('list')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold dark:border-gray-700">{tr('Annuler', 'Cancel')}</button>
            {canEdit && <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{saving ? <Loader2 size={15} className="inline animate-spin" /> : tr('Enregistrer', 'Save')}</button>}
          </div>
        </div>
      ) : view === 'accounts' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-1 text-sm font-bold">🏦 {tr('Mes comptes (banque, carte de crédit, caisse)', 'My accounts (bank, credit card, cash)')}</h3>
            <p className="mb-3 text-xs text-gray-500">{tr('Créez vos comptes réels et assignez-les à vos transactions : chaque compte a son propre compte au grand livre (suivi du solde). Achat sur carte = passif carte ; sortie d’argent = actif banque.', 'Create your real accounts and assign them to transactions: each has its own ledger account (balance tracking). Card purchase = card liability; cash out = bank asset.')}</p>
            {canEdit && (
              <div className="grid gap-2 sm:grid-cols-5">
                <input value={newAcct.name} onChange={e => setNewAcct(a => ({ ...a, name: e.target.value }))} placeholder={tr('Nom (ex. RBC chèque)', 'Name (e.g. RBC chequing)')} className={`sm:col-span-2 ${inputCls}`} />
                <select value={newAcct.kind} onChange={e => setNewAcct(a => ({ ...a, kind: e.target.value as TreasuryKind }))} className={inputCls}>
                  {(Object.keys(TREASURY_KIND_LABELS) as TreasuryKind[]).map(k => <option key={k} value={k}>{tr(TREASURY_KIND_LABELS[k][0], TREASURY_KIND_LABELS[k][1])}</option>)}
                </select>
                <input value={newAcct.last4} onChange={e => setNewAcct(a => ({ ...a, last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder={tr('4 derniers', 'Last 4')} className={inputCls} />
                <button onClick={async () => { if (!newAcct.name.trim()) { setNotice(tr('Nom requis.', 'Name required.')); return; } const r = await createTreasuryAccount(tenant, newAcct); if (r.error) { setNotice(r.error); return; } setNewAcct({ name: '', kind: 'bank', last4: '', institution: '' }); reloadTreasury(); setNotice(tr('Compte créé.', 'Account created.')); }} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ {tr('Ajouter', 'Add')}</button>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-700"><th className="px-4 py-2">{tr('Compte', 'Account')}</th><th className="px-3">{tr('Type', 'Type')}</th><th className="px-3">{tr('N°', '#')}</th><th className="px-3">{tr('Statut', 'Status')}</th><th className="px-3"></th></tr></thead>
              <tbody>
                {treasury.map(a => (
                  <tr key={a.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2 font-semibold">{a.kind === 'credit_card' ? '💳' : a.kind === 'cash' ? '💵' : '🏦'} {a.name}</td>
                    <td className="px-3 text-gray-500">{tr(TREASURY_KIND_LABELS[a.kind][0], TREASURY_KIND_LABELS[a.kind][1])}</td>
                    <td className="px-3 text-gray-500">{a.last4 ? `••${a.last4}` : '—'}</td>
                    <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{a.active !== false ? tr('Actif', 'Active') : tr('Inactif', 'Inactive')}</span></td>
                    <td className="px-3 text-right">{canEdit && <button onClick={async () => { await setTreasuryActive(tenant, a.id!, a.active === false); reloadTreasury(); }} className="text-xs font-semibold text-blue-600 hover:underline">{a.active !== false ? tr('Désactiver', 'Deactivate') : tr('Réactiver', 'Reactivate')}</button>}</td>
                  </tr>
                ))}
                {treasury.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{tr('Aucun compte. Ajoutez votre compte bancaire ou votre carte de crédit ci-dessus.', 'No account. Add your bank account or credit card above.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : view === 'bank' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{tr('Importer un relevé bancaire (CSV)', 'Import a bank statement (CSV)')}</div>
            <p className="mb-2 text-xs text-gray-400">{tr('Colonnes détectées automatiquement : date, description, montant (ou débit/crédit). Collez le CSV ou choisissez un fichier.', 'Columns auto-detected: date, description, amount (or debit/credit). Paste the CSV or pick a file.')}</p>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={4} placeholder={tr('Collez ici les lignes CSV…', 'Paste CSV lines here…')} className={`w-full font-mono text-xs ${inputCls}`} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                {tr('Choisir un fichier CSV', 'Pick a CSV file')}
                <input type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImportText(await f.text()); }} />
              </label>
              <button onClick={doImportBank} disabled={bankBusy || !importText.trim()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">{bankBusy ? <Loader2 size={15} className="inline animate-spin" /> : tr('Importer', 'Import')}</button>
              {bankLines.some(b => !b.reconciled) && <button onClick={doAutoMatch} disabled={bankBusy} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" title={tr('Apparie par montant (± 0,02 $) et date (± 5 j) — applique seulement les correspondances uniques', 'Match by amount (± $0.02) and date (± 5 d) — applies only unique matches')}>✨ {tr('Auto-rapprocher', 'Auto-match')}</button>}
              {bankLines.some(b => !b.reconciled && !b.matched_transaction_id) && <button onClick={doBankAI} disabled={bankBusy} className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-40 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300" title={tr('L’IA crée des transactions « à vérifier » à partir des lignes non rapprochées', 'AI creates “to review” transactions from unmatched lines')}>📷 {tr('Transactions du relevé (IA)', 'Statement → transactions (AI)')}</button>}
              {importText.trim() && <span className="text-xs text-gray-400">{parseBankCsv(importText).length} {tr('lignes détectées', 'lines detected')}</span>}
            </div>
          </div>
          {bankLines.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-lg font-bold text-gray-800 dark:text-gray-100">{bankLines.length}</div><div className="text-xs text-gray-500">{tr('Lignes', 'Lines')}</div></div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-lg font-bold text-emerald-600">{bankLines.filter(b => b.reconciled).length}</div><div className="text-xs text-gray-500">{tr('Rapprochées', 'Reconciled')}</div></div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"><div className="text-lg font-bold text-amber-600">{bankLines.filter(b => !b.reconciled).length}</div><div className="text-xs text-gray-500">{tr('À rapprocher', 'To reconcile')}</div></div>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="mobile-cards w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-4 py-2">{tr('Date', 'Date')}</th><th className="px-4">{tr('Description', 'Description')}</th>
                <th className="px-4 text-right">{tr('Montant', 'Amount')}</th><th className="px-4">{tr('Transaction rapprochée', 'Matched transaction')}</th><th className="px-4">{tr('Rappr.', 'Recon.')}</th><th className="px-4"></th>
              </tr></thead>
              <tbody>
                {bankLines.map(b => (
                  <tr key={b.id} className="border-t border-gray-50 dark:border-gray-700/50">
                    <td className="px-4 py-2" data-label={tr('Date', 'Date')}>{b.stmt_date}</td>
                    <td className="px-4 py-2" data-label={tr('Description', 'Description')}>{b.description}</td>
                    <td className={`px-4 py-2 text-right font-medium ${b.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`} data-label={tr('Montant', 'Amount')}>{mny(b.amount)}</td>
                    <td className="px-4 py-2" data-label={tr('Transaction rapprochée', 'Matched transaction')}>
                      <select value={b.matched_transaction_id || ''} onChange={e => matchBankLine(b.id!, e.target.value)} className={inputCls}>
                        <option value="">{tr('— Aucune —', '— None —')}</option>
                        {txns.map(t => <option key={t.id} value={t.id}>{t.transaction_number} · {mny(t.total)}{t.vendor_name ? ` · ${t.vendor_name}` : ''}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2" data-label={tr('Rappr.', 'Recon.')}><input type="checkbox" checked={!!b.reconciled} onChange={e => toggleReconciled(b.id!, e.target.checked)} /></td>
                    <td className="px-4 py-2 text-right" data-label=""><button onClick={() => removeBankLine(b.id!)} className="text-xs text-red-500 hover:underline">{tr('Suppr.', 'Del.')}</button></td>
                  </tr>
                ))}
                {bankLines.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{bankBusy ? '…' : tr('Aucune ligne bancaire importée.', 'No bank line imported.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
        {summaryCount > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-lg font-bold text-emerald-600">{mny(summary.revenue)}</div>
              <div className="text-xs text-gray-500">{tr('Revenus', 'Revenue')} · {summary.revCount}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-lg font-bold text-rose-600">{mny(summary.expense)}</div>
              <div className="text-xs text-gray-500">{tr('Dépenses', 'Expenses')} · {summary.expCount}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className={`text-lg font-bold ${summary.revenue - summary.expense >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-rose-600'}`}>{mny(summary.revenue - summary.expense)}</div>
              <div className="text-xs text-gray-500">{tr('Net (revenus − dépenses)', 'Net (revenue − expenses)')}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-lg font-bold text-blue-600">{mny(summary.gst + summary.qst)}</div>
              <div className="text-xs text-gray-500">{tr('Taxes récup. (CTI/RTI)', 'Recoverable taxes')} · TPS {mny(summary.gst)} · TVQ {mny(summary.qst)}{summary.payable > 0 ? ` · ${tr('Dû fourn.', 'Owed')} ${mny(summary.payable)}` : ''}</div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <select value={fType} onChange={e => setFType(e.target.value as 'all' | 'revenue' | 'expense')} className={inputCls}>
            <option value="all">{tr('Tous les types', 'All types')}</option>
            <option value="revenue">{tr('Revenus', 'Revenue')}</option>
            <option value="expense">{tr('Dépenses', 'Expenses')}</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value as 'all' | 'draft' | 'posted' | 'paid' | 'cancelled')} className={inputCls}>
            <option value="all">{tr('Tous les statuts', 'All statuses')}</option>
            <option value="draft">{STATUS_LABEL.draft}</option>
            <option value="posted">{STATUS_LABEL.posted}</option>
            <option value="paid">{STATUS_LABEL.paid}</option>
            <option value="cancelled">{STATUS_LABEL.cancelled}</option>
          </select>
          <input value={fSearch} onChange={e => setFSearch(e.target.value)} placeholder={tr('Rechercher n° ou tiers…', 'Search # or party…')} className={`min-w-[160px] flex-1 ${inputCls}`} />
          {(fType !== 'all' || fStatus !== 'all' || fSearch) && <button onClick={() => { setFType('all'); setFStatus('all'); setFSearch(''); }} className="text-xs font-semibold text-gray-500 hover:underline">{tr('Réinitialiser', 'Reset')}</button>}
          <span className="text-xs text-gray-400">{filteredTxns.length}/{txns.length}</span>
          <button onClick={exportCsv} disabled={filteredTxns.length === 0} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300">{tr('Exporter CSV', 'Export CSV')}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-2">{tr('N°', '#')}</th><th className="px-4">{tr('Type', 'Type')}</th><th className="px-4">{tr('Date', 'Date')}</th><th className="px-4">{tr('Tiers', 'Party')}</th>
              <th className="px-4 text-right">{tr('Total', 'Total')}</th><th className="px-4">{tr('Statut', 'Status')}</th><th className="px-4">GL</th><th className="px-4"></th>
            </tr></thead>
            <tbody>
              {filteredTxns.map(t => (
                <tr key={t.id} className="border-t border-gray-50 dark:border-gray-700/50">
                  <td className="px-4 py-2 font-mono text-xs" data-label="N°">{t.transaction_number}</td>
                  <td className="px-4 py-2" data-label={tr('Type', 'Type')}><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.txn_type === 'revenue' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{t.txn_type === 'revenue' ? tr('Revenu', 'Revenue') : tr('Dépense', 'Expense')}</span></td>
                  <td className="px-4 py-2" data-label={tr('Date', 'Date')}>{t.txn_date}</td>
                  <td className="px-4 py-2" data-label={tr('Tiers', 'Party')}>{t.vendor_name || '—'}{t.receipt_url && <a href={t.receipt_url} target="_blank" rel="noreferrer" className="ml-2 inline-block align-middle text-gray-400 hover:text-blue-600"><Paperclip size={13} /></a>}</td>
                  <td className="px-4 py-2 text-right font-medium" data-label={tr('Total', 'Total')}>{mny(t.total)}</td>
                  <td className="px-4 py-2" data-label={tr('Statut', 'Status')}>
                    {(t as any).needs_review
                      ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">⏳ {tr('À vérifier', 'To review')}</span>
                      : <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[t.status]}`}>{STATUS_LABEL[t.status]}</span>}
                  </td>
                  <td className="px-4 py-2" data-label="GL">{t.gl_entry_id ? <Check size={15} className="text-emerald-600" /> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-2 text-right" data-label="">
                    {canEdit && <div className="flex flex-wrap justify-end gap-2 text-xs">
                      <button onClick={() => editTxn(t)} className="text-blue-600 hover:underline">{tr('Éditer', 'Edit')}</button>
                      {(t as any).needs_review && <button onClick={() => verifyTxn(t)} className="font-semibold text-amber-700 hover:underline">{tr('✓ Vérifier', '✓ Verify')}</button>}
                      {!t.gl_entry_id && !(t as any).needs_review && <button onClick={() => postPurchase(t)} className="text-indigo-600 hover:underline">{tr('Comptabiliser', 'Post')}</button>}
                      {t.gl_entry_id && t.status !== 'paid' && <button onClick={() => markPaid(t)} className="text-emerald-600 hover:underline">{tr('Payé', 'Paid')}</button>}
                      {!t.gl_entry_id && <button onClick={() => removeTxn(t)} className="text-red-500 hover:underline">{tr('Suppr.', 'Del.')}</button>}
                    </div>}
                  </td>
                </tr>
              ))}
              {filteredTxns.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">{txns.length === 0 ? tr('Aucune transaction.', 'No transaction yet.') : tr('Aucun résultat pour ces filtres.', 'No result for these filters.')}</td></tr>}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// RAPPORTS FISCAUX (Phase 5) — TPS/TVQ, avantage auto (TP-41.C), base T4/RL-1
// ============================================================
function FiscalReportsModule({ tenant, tr }: { tenant: string; tr: (f: string, e: string) => string }) {
  const [sub, setSub] = useState<'taxes' | 'vehicle' | 't4rl1'>('taxes');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tax, setTax] = useState<TaxSummary | null>(null);
  const [veh, setVeh] = useState<VehicleBenefit[]>([]);
  const [emp, setEmp] = useState<EmployeeFiscal[]>([]);
  // Remise TPS/TVQ par période de déclaration (mensuel/trimestriel/annuel) — Revenu Québec.
  const [freq, setFreq] = useState<'annuel' | 'trimestriel' | 'mensuel'>('annuel');
  const [periodIdx, setPeriodIdx] = useState(1);
  const [remit, setRemit] = useState<TaxRemittance | null>(null);
  const [loading, setLoading] = useState(true);
  const [migMissing, setMigMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

  async function load() {
    setLoading(true); setMigMissing(false);
    try {
      const [t, v, e] = await Promise.all([getTaxSummary(tenant, year), getVehicleBenefits(tenant, year), getT4RL1Base(tenant, year)]);
      setTax(t); setVeh(v); setEmp(e);
    } catch { setMigMissing(true); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant, year]);

  // Charge la remise de la période sélectionnée (annuel = année complète).
  useEffect(() => {
    if (freq === 'annuel') { setRemit(null); return; }
    let active = true;
    const p = declarationPeriod(freq, year, periodIdx);
    getTaxRemittance(tenant, p.start, p.end, freq).then(r => { if (active) setRemit(r); }).catch(() => { if (active) setRemit(null); });
    return () => { active = false; };
  }, [tenant, year, freq, periodIdx]);

  const years = (() => { const y = new Date().getFullYear(); return [y + 1, y, y - 1, y - 2, y - 3]; })();
  const period = declarationPeriod(freq, year, periodIdx);
  const taxView: TaxSummary | null = freq === 'annuel' ? tax : remit;

  if (loading) return <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400 dark:border-gray-700 dark:bg-gray-800"><Loader2 className="animate-spin" /></div>;
  if (migMissing) return (<div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"><p className="font-semibold">{tr('Rapports fiscaux indisponibles', 'Tax reports unavailable')}</p><p className="mt-1 text-sm">{tr('Exécutez les migrations 085 à 088 dans Supabase, puis rechargez.', 'Run migrations 085-088 in Supabase, then reload.')}</p></div>);

  const csv = () => { try { sub === 'taxes' ? (taxView && exportTaxSummaryCsv(taxView)) : sub === 'vehicle' ? exportVehicleBenefitsCsv(veh, year) : exportT4RL1Csv(emp, year); } catch (e: any) { setNotice(e?.message); } };
  const pdf = async () => { try { sub === 'taxes' ? (taxView && await exportTaxSummaryPdf(tenant, taxView)) : sub === 'vehicle' ? await exportVehicleBenefitsPdf(tenant, veh, year) : await exportT4RL1Pdf(tenant, emp, year); } catch (e: any) { setNotice(e?.message); } };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {([['taxes', tr('TPS / TVQ', 'GST / QST')], ['vehicle', tr('Avantage auto', 'Vehicle benefit')], ['t4rl1', tr('T4 / RL-1', 'T4 / RL-1')]] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setSub(k as any)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sub === k ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{lbl}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {sub === 'taxes' && (
            <>
              <select value={freq} onChange={e => { setFreq(e.target.value as any); setPeriodIdx(1); }} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" title={tr('Période de déclaration TPS/TVQ', 'GST/QST filing period')}>
                <option value="annuel">{tr('Annuel', 'Annual')}</option>
                <option value="trimestriel">{tr('Trimestriel', 'Quarterly')}</option>
                <option value="mensuel">{tr('Mensuel', 'Monthly')}</option>
              </select>
              {freq !== 'annuel' && (
                <select value={periodIdx} onChange={e => setPeriodIdx(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                  {(freq === 'mensuel' ? Array.from({ length: 12 }, (_, i) => i + 1) : [1, 2, 3, 4]).map(i => <option key={i} value={i}>{declarationPeriod(freq, year, i).label}</option>)}
                </select>
              )}
            </>
          )}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
            <span className="text-gray-400">{tr('Exporter', 'Export')}</span>
            <button onClick={csv} className="rounded-lg px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">CSV</button>
            <button onClick={pdf} className="rounded-lg px-2 py-1 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">PDF</button>
          </div>
        </div>
      </div>
      {notice && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{notice}</div>}

      {sub === 'taxes' && taxView && (
        <div className="grid gap-4 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{tr('Période de déclaration', 'Filing period')} : {freq === 'annuel' ? String(year) : `${period.label} (${period.start} → ${period.end})`}</p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('TPS / TVH', 'GST / HST')}</div>
            <table className="w-full text-sm"><tbody>
              <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="px-4 py-2">{tr('Taxe perçue (à payer)', 'Collected (payable)')}</td><td className="px-4 py-2 text-right">{mny(taxView.gstCollected)}</td></tr>
              <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="px-4 py-2">{tr('CTI à récupérer', 'ITC recoverable')}</td><td className="px-4 py-2 text-right">{mny(taxView.gstItc)}</td></tr>
              <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600"><td className="px-4 py-2">{tr('Net à remettre', 'Net to remit')}</td><td className="px-4 py-2 text-right">{mny(taxView.gstNet)}</td></tr>
            </tbody></table>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('TVQ', 'QST')}</div>
            <table className="w-full text-sm"><tbody>
              <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="px-4 py-2">{tr('Taxe perçue (à payer)', 'Collected (payable)')}</td><td className="px-4 py-2 text-right">{mny(taxView.qstCollected)}</td></tr>
              <tr className="border-t border-gray-50 dark:border-gray-700/50"><td className="px-4 py-2">{tr('RTI à récupérer', 'ITR recoverable')}</td><td className="px-4 py-2 text-right">{mny(taxView.qstItc)}</td></tr>
              <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600"><td className="px-4 py-2">{tr('Net à remettre', 'Net to remit')}</td><td className="px-4 py-2 text-right">{mny(taxView.qstNet)}</td></tr>
            </tbody></table>
          </div>
          <p className="sm:col-span-2 text-xs text-gray-400">{tr('Comptes 2100/2110 (taxe perçue) et 1200/1210 (CTI/RTI) du grand livre, période sélectionnée. Déclaration obligatoire même si le net est 0.', 'Ledger accounts 2100/2110 (collected) and 1200/1210 (ITC/ITR), selected period. A return is required even if net is 0.')}</p>
        </div>
      )}

      {sub === 'vehicle' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Avantage automobile — TP-41.C (report RL-1 case W / T4 code 34)', 'Vehicle benefit — TP-41.C (RL-1 box W / T4 code 34)')}</div>
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-2">{tr('Unité', 'Unit')}</th><th className="px-4">{tr('Employé', 'Employee')}</th>
              <th className="px-4 text-right">{tr('Km perso', 'Personal km')}</th><th className="px-4 text-right">{tr('Droit usage', 'Standby')}</th>
              <th className="px-4 text-right">{tr('Fonctionnement', 'Operating')}</th><th className="px-4 text-right">{tr('Avantage', 'Benefit')}</th>
            </tr></thead>
            <tbody>
              {veh.map((v, i) => (
                <tr key={i} className="border-t border-gray-50 dark:border-gray-700/50">
                  <td className="px-4 py-2 font-mono text-xs" data-label={tr('Unité', 'Unit')}>{v.unit_number}</td>
                  <td className="px-4 py-2" data-label={tr('Employé', 'Employee')}>{v.employee_name || '—'}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Km perso', 'Personal km')}>{v.kmPerso.toLocaleString('fr-CA')}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Droit usage', 'Standby')}>{mny(v.standby)}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Fonctionnement', 'Operating')}>{mny(v.operating)}</td>
                  <td className="px-4 py-2 text-right font-semibold" data-label={tr('Avantage', 'Benefit')}>{mny(v.total)}</td>
                </tr>
              ))}
              {veh.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{tr('Aucun véhicule employeur avec avantage imposable pour cette année.', 'No employer vehicle with taxable benefit for this year.')}</td></tr>}
              {veh.length > 0 && <tr className="border-t-2 border-gray-200 font-bold dark:border-gray-600"><td className="px-4 py-2" colSpan={5}>{tr('Total des avantages', 'Total benefits')}</td><td className="px-4 py-2 text-right">{mny(veh.reduce((s, v) => s + v.total, 0))}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {sub === 't4rl1' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-900/40">{tr('Base T4 / RL-1 par employé', 'T4 / RL-1 base per employee')}</div>
          <table className="mobile-cards w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-2">{tr('Employé', 'Employee')}</th>
              <th className="px-4 text-right">{tr('Revenu emploi', 'Employment')}</th><th className="px-4 text-right">{tr('Commissions', 'Commissions')}</th>
              <th className="px-4 text-right">{tr('Avantage auto', 'Vehicle benefit')}</th><th className="px-4 text-right">{tr('Ret. féd.', 'Fed. ded.')}</th><th className="px-4 text-right">{tr('Ret. QC', 'QC ded.')}</th>
            </tr></thead>
            <tbody>
              {emp.map((e, i) => (
                <tr key={i} className="border-t border-gray-50 dark:border-gray-700/50">
                  <td className="px-4 py-2" data-label={tr('Employé', 'Employee')}>{e.employee_name || e.employee_email || '—'}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Revenu emploi', 'Employment')}>{mny(e.employmentIncome)}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Commissions', 'Commissions')}>{mny(e.commissions)}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Avantage auto', 'Vehicle benefit')}>{mny(e.vehicleBenefit)}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Ret. féd.', 'Fed. ded.')}>{mny(e.federalDeductions)}</td>
                  <td className="px-4 py-2 text-right" data-label={tr('Ret. QC', 'QC ded.')}>{mny(e.quebecDeductions)}</td>
                </tr>
              ))}
              {emp.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{tr('Aucune feuille de temps approuvée/payée pour cette année.', 'No approved/paid timesheet for this year.')}</td></tr>}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400">{tr('Revenu d\'emploi = montants versés ; avantage auto reporté du calcul TP-41.C. Transmission XML obligatoire dès le 6e feuillet (schémas ARC et RQ distincts).', 'Employment income = amounts paid; vehicle benefit from TP-41.C calc. XML filing required from the 6th slip (separate CRA/RQ schemas).')}</p>
        </div>
      )}
    </div>
  );
}
