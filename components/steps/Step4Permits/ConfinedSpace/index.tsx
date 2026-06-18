'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Wind, Users, Shield, CheckCircle, Menu, X, Save, Download,
  Printer, History, Plus, ChevronRight, AlertTriangle, Clock, Home,
  FileText, BarChart3, QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import { ProvinceCode, ConfinedSpacePermit, generatePermitNumber, generateId } from './SafetyManager';
import SiteInformation from './SiteInformation';
import { useTenantDirectory } from '@/lib/useTenantDirectory';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import RescuePlan from './RescuePlan';

// ── Supabase (best-effort) ──────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Types ──────────────────────────────────────────────────────────────────
export type Language = 'fr' | 'en';

interface ConfinedSpaceProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  province?: ProvinceCode;           // legacy alias
  enableAutoSave?: boolean;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;    // legacy alias
  onCancel?: () => void;
  initialData?: Partial<ConfinedSpacePermit>;
  permitData?: any;                  // legacy — used as initialData
  readOnly?: boolean;
  // Accept but ignore ASTForm props to avoid TS errors
  formData?: any;
  updatePermitData?: any;
  PROVINCIAL_REGULATIONS?: any;
  atmosphericReadings?: any[];
  isMobile?: boolean;
  styles?: any;
  updateParentData?: any;
  errors?: any;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: any;
  initialPermits?: any[];
  regulations?: any;
  showAdvancedFeatures?: boolean;
  customValidators?: any[];
  onValidationChange?: any;
  theme?: string;
}

type Section = 'site' | 'atmospheric' | 'registry' | 'rescue' | 'finalization';

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis Espace Clos',
    sections: {
      site: 'Site',
      atmospheric: 'Atmosphère',
      registry: 'Registre',
      rescue: 'Sauvetage',
      finalization: 'Finalisation',
    },
    sectionsFull: {
      site: 'Informations du site',
      atmospheric: 'Tests atmosphériques',
      registry: "Registre d'entrée",
      rescue: 'Plan de sauvetage',
      finalization: 'Finalisation & signatures',
    },
    menu: {
      saveNow: 'Enregistrer maintenant',
      exportJson: 'Exporter JSON',
      exportCsv: 'Exporter registre (CSV)',
      print: 'Imprimer',
      newPermit: 'Nouveau permis',
      history: 'Historique',
    },
    save: {
      saving: 'Enregistrement…',
      saved: 'Enregistré',
      error: 'Erreur sauvegarde',
      unsaved: 'Non enregistré',
    },
    timer: {
      activeEntrants: 'Entrant(s) actif(s)',
      elapsed: 'Temps écoulé',
    },
    status: {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Complété',
      cancelled: 'Annulé',
    },
    finalization: {
      title: 'Finalisation du permis',
      supervisorSignature: 'Signature du superviseur',
      supervisorName: 'Nom du superviseur',
      supervisorNamePh: 'Prénom et nom',
      supervisorCert: 'Certification superviseur',
      supervisorCertPh: 'N° de certification',
      entryDate: "Date et heure d'entrée",
      expiryDate: "Date et heure d'expiration",
      notes: 'Notes finales',
      notesPlaceholder: 'Notes, observations ou conditions particulières…',
      close: 'Fermer le permis',
      activate: 'Activer le permis',
      reopen: 'Rouvrir',
      validation: 'Validation du permis',
      progress: 'Progression',
      sections: 'sections complètes',
      warnings: 'Avertissements',
      errors: 'Erreurs',
      signAndActivate: 'Signer et activer',
      signAndClose: 'Signer et fermer',
      permittedWork: 'Travaux autorisés',
      permittedWorkPh: 'Description des travaux permis…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Conditions ou restrictions particulières…',
    },
    provinces: {
      QC: 'Québec',
      ON: 'Ontario',
      BC: 'Colombie-Britannique',
      AB: 'Alberta',
      SK: 'Saskatchewan',
      MB: 'Manitoba',
      NB: 'Nouveau-Brunswick',
      NS: 'Nouvelle-Écosse',
      PE: 'Î.-P.-É.',
      NL: 'T.-N.-L.',
    },
    back: 'Retour aux permis',
    permit: 'Permis',
    completion: 'Complétion',
  },
  en: {
    title: 'Confined Space Permit',
    sections: {
      site: 'Site',
      atmospheric: 'Atmosphere',
      registry: 'Registry',
      rescue: 'Rescue',
      finalization: 'Finalization',
    },
    sectionsFull: {
      site: 'Site information',
      atmospheric: 'Atmospheric testing',
      registry: 'Entry registry',
      rescue: 'Rescue plan',
      finalization: 'Finalization & signatures',
    },
    menu: {
      saveNow: 'Save now',
      exportJson: 'Export JSON',
      exportCsv: 'Export registry (CSV)',
      print: 'Print',
      newPermit: 'New permit',
      history: 'History',
    },
    save: {
      saving: 'Saving…',
      saved: 'Saved',
      error: 'Save error',
      unsaved: 'Unsaved',
    },
    timer: {
      activeEntrants: 'Active entrant(s)',
      elapsed: 'Elapsed time',
    },
    status: {
      draft: 'Draft',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    finalization: {
      title: 'Permit finalization',
      supervisorSignature: 'Supervisor signature',
      supervisorName: 'Supervisor name',
      supervisorNamePh: 'First and last name',
      supervisorCert: 'Supervisor certification',
      supervisorCertPh: 'Certification number',
      entryDate: 'Entry date and time',
      expiryDate: 'Expiry date and time',
      notes: 'Final notes',
      notesPlaceholder: 'Notes, observations or special conditions…',
      close: 'Close permit',
      activate: 'Activate permit',
      reopen: 'Reopen',
      validation: 'Permit validation',
      progress: 'Progress',
      sections: 'complete sections',
      warnings: 'Warnings',
      errors: 'Errors',
      signAndActivate: 'Sign and activate',
      signAndClose: 'Sign and close',
      permittedWork: 'Permitted work',
      permittedWorkPh: 'Description of permitted work…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Special conditions or restrictions…',
    },
    provinces: {
      QC: 'Québec',
      ON: 'Ontario',
      BC: 'British Columbia',
      AB: 'Alberta',
      SK: 'Saskatchewan',
      MB: 'Manitoba',
      NB: 'New Brunswick',
      NS: 'Nova Scotia',
      PE: 'P.E.I.',
      NL: 'N.L.',
    },
    back: 'Back to permits',
    permit: 'Permit',
    completion: 'Completion',
  },
} as const;

// ── Default permit ─────────────────────────────────────────────────────────
function createDefaultPermit(province: ProvinceCode): ConfinedSpacePermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    last_modified: now,
    issue_date: now.slice(0, 16),
    siteInformation: {
      projectNumber: '', workLocation: '', contractor: '', supervisor: '',
      entryDate: '', duration: '', workerCount: 1, workDescription: '',
      spaceType: '', csaClass: '', entryMethod: '', accessType: '',
      spaceLocation: '', spaceDescription: '',
      dimensions: { length: 0, width: 0, height: 0, diameter: 0, volume: 0, spaceShape: 'rectangular' },
      unitSystem: 'metric', entryPoints: [],
      atmosphericHazards: [], physicalHazards: [],
      environmentalConditions: { ventilationRequired: false, ventilationType: '', lightingConditions: '', temperatureRange: '', moistureLevel: '', noiseLevel: '', weatherConditions: '' },
      spaceContent: { contents: '', residues: '', previousUse: '', lastEntry: '', cleaningStatus: '' },
      safetyMeasures: { emergencyEgress: '', communicationMethod: '', monitoringEquipment: [], ventilationEquipment: [], emergencyEquipment: [] },
      spacePhotos: [],
    },
    atmosphericTesting: {
      equipment: { deviceModel: '', serialNumber: '', calibrationDate: '', nextCalibration: '' },
      readings: [],
      continuousMonitoring: false,
      alarmSettings: { oxygen: { min: 19.5, max: 23.5 }, combustibleGas: { max: 10 }, hydrogenSulfide: { max: 10 }, carbonMonoxide: { max: 35 } },
      lastUpdated: now,
    },
    entryRegistry: {
      personnel: [], entryLog: [], activeEntrants: [], maxOccupancy: 2,
      communicationProtocol: { type: 'radio', checkInterval: 15 },
      lastUpdated: now,
    },
    rescuePlan: {
      emergencyContacts: [], rescueTeam: [], evacuationProcedure: '',
      rescueEquipment: [],
      hospitalInfo: { name: '', address: '', phone: '', distance: 0 },
      communicationPlan: '', lastUpdated: now,
    },
    validation: { isComplete: false, percentage: 0, errors: [], lastValidated: now },
    auditTrail: [],
    attachments: [],
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function computeCompletion(permit: ConfinedSpacePermit): number {
  let score = 0;
  const si = permit.siteInformation;
  if (si.workLocation) score++;
  if (si.supervisor) score++;
  if (si.spaceType) score++;
  if (si.workDescription) score++;
  if (permit.atmosphericTesting.readings.length > 0) score++;
  if (permit.atmosphericTesting.equipment.deviceModel) score++;
  if (permit.entryRegistry.personnel.length > 0) score++;
  if (permit.rescuePlan.emergencyContacts.length > 0) score++;
  if (permit.rescuePlan.evacuationProcedure) score++;
  return Math.round((score / 9) * 100);
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ConfinedSpace({
  tenant = 'demo',
  language = 'fr',
  selectedProvince,
  province = 'QC',
  enableAutoSave = true,
  onSave,
  onSubmit,
  onCancel,
  initialData,
  permitData: legacyPermitData,
  readOnly = false,
}: ConfinedSpaceProps) {
  const resolvedProvince: ProvinceCode = (selectedProvince ?? province) as ProvinceCode;
  const resolvedOnSave = onSave ?? onSubmit;
  const t = T[language];
  const dir = useTenantDirectory(tenant);

  const [permit, setPermit] = useState<ConfinedSpacePermit>(() => ({
    ...createDefaultPermit(resolvedProvince),
    ...(legacyPermitData ?? {}),
    ...initialData,
  }));
  const [activeProvince, setActiveProvince] = useState<ProvinceCode>(resolvedProvince);
  const [section, setSection] = useState<Section>('site');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Province prop sync
  useEffect(() => {
    setActiveProvince(resolvedProvince);
    setPermit(p => ({ ...p, province: resolvedProvince }));
  }, [resolvedProvince]);

  // Active entrants timer
  const activeEntrantCount = permit.entryRegistry.activeEntrants.length;
  const firstEntryTime = permit.entryRegistry.entryLog
    .filter(e => e.action === 'entry')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]?.timestamp;

  useEffect(() => {
    if (activeEntrantCount > 0 && firstEntryTime) {
      elapsedRef.current = setInterval(() => {
        setElapsedMs(Date.now() - new Date(firstEntryTime).getTime());
      }, 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setElapsedMs(0);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [activeEntrantCount, firstEntryTime]);

  // Auto-save with debounce
  const persistPermit = useCallback(async (data: ConfinedSpacePermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        const { error } = await supabase.from('confined_space_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          data: payload,
          updated_at: payload.updated_at,
        });
        if (error) { setSaveStatus('error'); return; }
      }
      localStorage.setItem(`cs-permit-${payload.permit_number}`, JSON.stringify(payload));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }, [tenant]);

  useEffect(() => {
    if (!enableAutoSave) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('idle');
    saveTimer.current = setTimeout(() => persistPermit(permit), 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [permit, enableAutoSave, persistPermit]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Section change — scroll content to top
  const goToSection = (s: Section) => {
    setSection(s);
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  // Permit update callback (passed to child sections)
  const updatePermit = useCallback((updater: (prev: ConfinedSpacePermit) => ConfinedSpacePermit) => {
    setPermit(updater);
  }, []);

  // Export JSON
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(permit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${permit.permit_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export registry CSV
  const exportCsv = () => {
    const headers = language === 'fr'
      ? ['Nom', 'Rôle', 'Entreprise', 'Entrée', 'Sortie', 'Statut']
      : ['Name', 'Role', 'Company', 'Entry', 'Exit', 'Status'];
    const rows = permit.entryRegistry.personnel.map(p => [
      p.name, p.role, p.company ?? '', p.entryTime ?? '', p.exitTime ?? '', p.status ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${permit.permit_number}-registry.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await persistPermit(permit);
    if (resolvedOnSave) resolvedOnSave(permit);
  };

  const completion = computeCompletion(permit);
  const isOvertime = elapsedMs > 4 * 3600 * 1000;

  const SECTIONS: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: 'site', icon: <MapPin className="w-4 h-4" />, label: t.sections.site },
    { id: 'atmospheric', icon: <Wind className="w-4 h-4" />, label: t.sections.atmospheric },
    { id: 'registry', icon: <Users className="w-4 h-4" />, label: t.sections.registry },
    { id: 'rescue', icon: <Shield className="w-4 h-4" />, label: t.sections.rescue },
    { id: 'finalization', icon: <CheckCircle className="w-4 h-4" />, label: t.sections.finalization },
  ];

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">

        {/* Row 1: breadcrumb + permit info + menu */}
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
          )}
          {onCancel && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}

          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{t.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{permit.permit_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Status badge */}
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[permit.status]}`}>
              {t.status[permit.status]}
            </span>

            {/* Completion */}
            <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-3.5 h-3.5" />
              {completion}%
            </span>

            {/* Active entrants timer */}
            {activeEntrantCount > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOvertime ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{activeEntrantCount} — {formatElapsed(elapsedMs)}</span>
              </div>
            )}

            {/* Save status */}
            <span className={`hidden sm:block text-xs font-medium ${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-blue-500' : saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
              {saveStatus !== 'idle' ? t.save[saveStatus] : ''}
            </span>

            {/* Hamburger menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
                  <button type="button" onClick={() => { handleSaveNow(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Save className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {t.menu.saveNow}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {t.menu.exportJson}
                  </button>
                  <button type="button" onClick={() => { exportCsv(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {t.menu.exportCsv}
                  </button>
                  <button type="button" onClick={() => { window.print(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Printer className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {t.menu.print}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => {
                    const newPermit = createDefaultPermit(activeProvince);
                    setPermit(newPermit);
                    setSection('site');
                    setMenuOpen(false);
                  }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    {t.menu.newPermit}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: tabs + progress bar */}
        <div className="flex items-center gap-1 px-4 pb-0 lg:px-6 overflow-x-auto scrollbar-none">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                section === s.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          {/* Progress bar slot */}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">

          {section === 'site' && (
            <SiteInformation
              language={language}
              permitData={permit}
              selectedProvince={activeProvince}
              readOnly={readOnly}
              personnel={dir.personnel}
              projects={dir.projects}
              suppliers={dir.suppliers}
              onUpdate={(data) => updatePermit(p => ({ ...p, siteInformation: { ...p.siteInformation, ...data } }))}
            />
          )}

          {section === 'atmospheric' && (
            <AtmosphericTesting
              language={language}
              permitData={permit}
              selectedProvince={activeProvince}
              readOnly={readOnly}
              onUpdate={(data) => updatePermit(p => ({ ...p, atmosphericTesting: { ...p.atmosphericTesting, ...data } }))}
            />
          )}

          {section === 'registry' && (
            <EntryRegistry
              language={language}
              permitData={permit}
              selectedProvince={activeProvince}
              readOnly={readOnly}
              onUpdate={(data) => updatePermit(p => ({ ...p, entryRegistry: { ...p.entryRegistry, ...data } }))}
            />
          )}

          {section === 'rescue' && (
            <RescuePlan
              language={language}
              permitData={permit}
              selectedProvince={activeProvince}
              readOnly={readOnly}
              onUpdate={(data) => updatePermit(p => ({ ...p, rescuePlan: { ...p.rescuePlan, ...data } }))}
            />
          )}

          {section === 'finalization' && (
            <FinalizationSection
              language={language}
              permit={permit}
              completion={completion}
              readOnly={readOnly}
              tenant={tenant}
              onUpdate={updatePermit}
              onSave={handleSaveNow}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Finalization section (inline, no extra file needed) ────────────────────
interface FinalizationProps {
  language: Language;
  permit: ConfinedSpacePermit;
  completion: number;
  readOnly: boolean;
  tenant: string;
  onUpdate: (updater: (p: ConfinedSpacePermit) => ConfinedSpacePermit) => void;
  onSave: () => void;
}

function FinalizationSection({ language, permit, completion, readOnly, tenant, onUpdate, onSave }: FinalizationProps) {
  const t = T[language].finalization;
  const statusT = T[language].status;

  const field = (key: string, val: string) =>
    onUpdate(p => ({ ...p, [key]: val }));

  const setStatus = (status: 'draft' | 'active' | 'completed' | 'cancelled') =>
    onUpdate(p => ({ ...p, status }));

  const Card = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const Input = ({ label, value, onChange, type = 'text', placeholder = '' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
      />
    </div>
  );

  const warnings: string[] = [];
  if (!permit.atmosphericTesting.equipment.deviceModel)
    warnings.push(language === 'fr' ? 'Équipement atmosphérique non renseigné' : 'Atmospheric equipment not specified');
  if (permit.entryRegistry.personnel.length === 0)
    warnings.push(language === 'fr' ? 'Aucun personnel enregistré' : 'No personnel registered');
  if (!permit.rescuePlan.evacuationProcedure)
    warnings.push(language === 'fr' ? 'Procédure évacuation manquante' : 'Evacuation procedure missing');

  return (
    <div>
      {/* Progress */}
      <Card title={t.validation} icon={<BarChart3 className="w-5 h-5" />}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 w-12 text-right">{completion}%</span>
        </div>
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Supervisor signature */}
      <Card title={t.supervisorSignature} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t.supervisorName}
            value={(permit as any).supervisor_name ?? ''}
            onChange={v => field('supervisor_name', v)}
            placeholder={t.supervisorNamePh}
          />
          <Input
            label={t.supervisorCert}
            value={(permit as any).supervisor_cert ?? ''}
            onChange={v => field('supervisor_cert', v)}
            placeholder={t.supervisorCertPh}
          />
          <Input
            label={t.entryDate}
            type="datetime-local"
            value={(permit as any).permit_valid_from ?? ''}
            onChange={v => field('permit_valid_from', v)}
          />
          <Input
            label={t.expiryDate}
            type="datetime-local"
            value={(permit as any).permit_valid_to ?? ''}
            onChange={v => field('permit_valid_to', v)}
          />
        </div>
      </Card>

      {/* Permitted work */}
      <Card title={t.permittedWork} icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.permittedWork}</label>
            <textarea
              value={(permit as any).permitted_work ?? ''}
              onChange={e => field('permitted_work', e.target.value)}
              placeholder={t.permittedWorkPh}
              rows={3}
              disabled={readOnly}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.restrictions}</label>
            <textarea
              value={(permit as any).restrictions ?? ''}
              onChange={e => field('restrictions', e.target.value)}
              placeholder={t.restrictionsPh}
              rows={3}
              disabled={readOnly}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t.notes}</label>
            <textarea
              value={(permit as any).finalization_notes ?? ''}
              onChange={e => field('finalization_notes', e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={3}
              disabled={readOnly}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          {permit.status === 'draft' && (
            <button
              type="button"
              onClick={() => { setStatus('active'); onSave(); }}
              disabled={completion < 60}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {t.signAndActivate}
            </button>
          )}
          {permit.status === 'active' && (
            <button
              type="button"
              onClick={() => { setStatus('completed'); onSave(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {t.signAndClose}
            </button>
          )}
          {(permit.status === 'completed' || permit.status === 'cancelled') && (
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t.reopen}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {language === 'fr' ? 'Enregistrer' : 'Save'}
          </button>
        </div>
      )}

      {/* QR Code card */}
      <CSQRCard permitNumber={permit.permit_number} tenant={tenant} language={language} />
    </div>
  );
}

// ── QR Code card for ConfinedSpace ─────────────────────────────────────────
function CSQRCard({ permitNumber, tenant, language }: {
  permitNumber: string; tenant: string; language: Language;
}) {
  const [origin, setOrigin] = React.useState('');
  React.useEffect(() => { setOrigin(window.location.origin); }, []);

  const url = `${origin}/${tenant}/permits/view/${permitNumber}`;
  if (!origin) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-6 print:mt-4">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-blue-600"><QrCode className="w-5 h-5" /></span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">
          {language === 'fr' ? 'Code QR — Vue publique & enregistrement' : 'QR Code — Public view & entry registration'}
        </h3>
      </div>
      <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm shrink-0">
          <QRCodeSVG value={url} size={140} level="M" includeMargin={false} />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {language === 'fr'
              ? "Affichez ce code à l'entrée de l'espace. Les travailleurs peuvent scanner pour consulter le permis et enregistrer leur entrée ou sortie — aucune connexion requise."
              : "Post this code at the space entrance. Workers can scan to view the permit and register their entry or exit — no login required."}
          </p>
          <code className="mt-1 block rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 break-all select-all">
            {url}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(url)}
            className="self-start mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors print:hidden"
          >
            {language === 'fr' ? 'Copier le lien' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  );
}
