'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings, Lock, CheckSquare, FileText, RefreshCw, CheckCircle,
  Menu, X, Save, Download, Printer, Plus, ChevronRight, Home,
  BarChart3, Trash2, AlertTriangle, Gauge
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ── Supabase (best-effort) ──────────────────────────────────────────────────
const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    : null;

// ── Types ──────────────────────────────────────────────────────────────────
export type Language = 'fr' | 'en';
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface PressurePermit {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  systemInfo: {
    projectNumber: string;
    workLocation: string;
    contractor: string;
    supervisor: string;
    entryDate: string;
    duration: string;
    workerCount: number;
    workDescription: string;
    systemId: string;
    pidRef: string;
    fluidType: string;
    fluidClass: string;
    designPressure: number;
    operatingPressure: number;
    designTemp: number;
    operatingTemp: number;
    pipeClass: string;
    pipeSpec: string;
    isolationClass: string;
  };
  isolation: {
    valveLineup: Array<{
      id: string;
      tagNumber: string;
      description: string;
      location: string;
      requiredPosition: string;
      currentPosition: string;
      isolatedBy: string;
      isolatedAt: string;
      verified: boolean;
    }>;
    blindList: Array<{
      id: string;
      location: string;
      blindNumber: string;
      size: string;
      rating: string;
      installedBy: string;
      installedAt: string;
      verified: boolean;
    }>;
    drainVentPoints: Array<{
      id: string;
      location: string;
      type: string;
      opened: boolean;
      confirmedEmpty: boolean;
    }>;
    isolationComplete: boolean;
    isolationVerifiedBy: string;
    isolationVerifiedAt: string;
  };
  verification: {
    pressureRelieved: boolean;
    pressureMeasured: number;
    gaugeId: string;
    gaugeCalDate: string;
    systemDrained: boolean;
    systemFlushed: boolean;
    flushMedium: string;
    temperatureChecked: boolean;
    temperatureMeasured: number;
    safeToWork: boolean;
    verifiedBy: string;
    verifiedAt: string;
    verificationNotes: string;
  };
  workAuth: {
    authorizedWork: string;
    restrictedWork: string;
    specialConditions: string;
    permitDuration: number;
    maxPressure: number;
    breakInRequired: boolean;
    breakInNotes: string;
  };
  restoration: {
    restorationSteps: Array<{
      id: string;
      step: number;
      description: string;
      responsible: string;
      completed: boolean;
      completedAt: string;
    }>;
    blindsRemoved: boolean;
    valvesRestored: boolean;
    systemPressurized: boolean;
    pressureTestRequired: boolean;
    testMedium: string;
    testPressure: number;
    testDuration: number;
    testPassed: boolean;
    recommissionedBy: string;
    recommissionedAt: string;
  };
  supervisor_name: string;
  supervisor_cert: string;
  permit_valid_from: string;
  permit_valid_to: string;
  permitted_work: string;
  restrictions: string;
  finalization_notes: string;
  validation: { isComplete: boolean; percentage: number };
}

type Section = 'system' | 'isolation' | 'verification' | 'workAuth' | 'restoration' | 'finalization';

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generatePermitNumber(province: ProvinceCode, prefix = 'PR'): string {
  return `${prefix}-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function computeCompletion(permit: PressurePermit): number {
  let score = 0;
  if (permit.systemInfo.workLocation) score++;
  if (permit.systemInfo.systemId || permit.systemInfo.pidRef) score++;
  if (permit.isolation.valveLineup.length > 0) score++;
  if (permit.isolation.isolationComplete) score++;
  if (permit.verification.safeToWork) score++;
  if (permit.workAuth.authorizedWork) score++;
  return Math.round((score / 6) * 100);
}

function createDefaultPermit(province: ProvinceCode): PressurePermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    systemInfo: {
      projectNumber: '', workLocation: '', contractor: '', supervisor: '',
      entryDate: '', duration: '', workerCount: 1, workDescription: '',
      systemId: '', pidRef: '', fluidType: '', fluidClass: '',
      designPressure: 0, operatingPressure: 0, designTemp: 0, operatingTemp: 0,
      pipeClass: '', pipeSpec: '', isolationClass: '',
    },
    isolation: {
      valveLineup: [],
      blindList: [],
      drainVentPoints: [],
      isolationComplete: false,
      isolationVerifiedBy: '',
      isolationVerifiedAt: '',
    },
    verification: {
      pressureRelieved: false, pressureMeasured: 0, gaugeId: '', gaugeCalDate: '',
      systemDrained: false, systemFlushed: false, flushMedium: '',
      temperatureChecked: false, temperatureMeasured: 0,
      safeToWork: false, verifiedBy: '', verifiedAt: '', verificationNotes: '',
    },
    workAuth: {
      authorizedWork: '', restrictedWork: '', specialConditions: '',
      permitDuration: 8, maxPressure: 0, breakInRequired: false, breakInNotes: '',
    },
    restoration: {
      restorationSteps: [],
      blindsRemoved: false, valvesRestored: false, systemPressurized: false,
      pressureTestRequired: false, testMedium: '', testPressure: 0, testDuration: 0, testPassed: false,
      recommissionedBy: '', recommissionedAt: '',
    },
    supervisor_name: '', supervisor_cert: '',
    permit_valid_from: '', permit_valid_to: '',
    permitted_work: '', restrictions: '', finalization_notes: '',
    validation: { isComplete: false, percentage: 0 },
  };
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis travaux sous pression',
    standard: 'ASME B31.3 / Réglementation provinciale appareils sous pression',
    sections: {
      system: 'Système',
      isolation: 'Isolement',
      verification: 'Vérification',
      workAuth: 'Autorisation',
      restoration: 'Remise en service',
      finalization: 'Finalisation',
    },
    sectionsFull: {
      system: 'Informations du système',
      isolation: 'Alignement et isolement',
      verification: 'Vérification avant travaux',
      workAuth: 'Autorisation de travail',
      restoration: 'Remise en service',
      finalization: 'Finalisation & signatures',
    },
    menu: { saveNow: 'Enregistrer maintenant', exportJson: 'Exporter JSON', print: 'Imprimer', newPermit: 'Nouveau permis' },
    save: { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Erreur sauvegarde', unsaved: 'Non enregistré' },
    status: { draft: 'Brouillon', active: 'Actif', completed: 'Complété', cancelled: 'Annulé' },
    back: 'Retour aux permis',
    completion: 'Complétion',
    // system
    projectInfo: 'Informations du projet',
    projectNumber: 'N° de projet',
    workLocation: 'Lieu des travaux',
    workLocationPh: 'Adresse ou description précise',
    contractor: 'Entrepreneur',
    supervisor: 'Superviseur',
    entryDate: 'Date de début',
    duration: 'Durée prévue',
    workerCount: 'Nombre de travailleurs',
    workDescription: 'Description des travaux',
    workDescriptionPh: 'Description des travaux à effectuer…',
    systemIdCard: 'Identification du système',
    systemId: 'ID du système *',
    pidRef: 'Réf. P&ID *',
    fluidType: 'Type de fluide',
    fluidTypes: ['Eau', 'Vapeur', 'Air comprimé', 'Azote', 'Gaz naturel', 'Propane', 'Huile hydraulique', 'Produits pétroliers', 'Acide', 'Autres produits chimiques'],
    fluidClass: 'Classe de fluide',
    fluidClasses: ['Catégorie I (non-toxique/non-flammable)', 'Catégorie II (toxique/flammable <260°C)', 'Catégorie III (hautement dangereux)'],
    designParamsCard: 'Paramètres de conception',
    designPressure: 'Pression de conception (kPa)',
    operatingPressure: 'Pression opérationnelle (kPa)',
    designTemp: 'Température de conception (°C)',
    operatingTemp: 'Température opérationnelle (°C)',
    pipeClass: 'Classe de tuyauterie',
    pipeSpec: 'Spécification de tuyauterie',
    isolationClass: "Classe d'isolement",
    isolationClasses: ['Classe 1 — Double blocage/purge', 'Classe 2 — Blocage simple', 'Classe 3 — Blindage requis'],
    regulationCard: 'Réglementation applicable',
    regulationNote: {
      QC: 'Québec : Loi sur les appareils sous pression (RLRQ c. A-20.01).',
      ON: 'Ontario : Technical Standards and Safety Act, 2000.',
      AB: 'Alberta : Safety Codes Act — Pressure Equipment.',
      BC: 'C.-B. : Boiler, Pressure Vessel and Pressure Piping Act.',
      default: 'Consulter la réglementation provinciale sur les appareils sous pression.',
    },
    // isolation
    valveLineupCard: 'Alignement des vannes',
    addValve: 'Ajouter une vanne',
    tagNumber: 'Tag #',
    description: 'Description',
    location: 'Emplacement',
    requiredPosition: 'Position requise',
    currentPosition: 'Position actuelle',
    positionOptions: ['Ouverte', 'Fermée', 'Régulée'],
    isolatedBy: 'Isolé par',
    isolatedAt: 'À',
    verified: 'Vérifié',
    blindListCard: 'Liste des blindes',
    addBlind: 'Ajouter une blinde',
    blindNumber: 'N° de blinde',
    size: 'Dimension',
    rating: 'Classe',
    installedBy: 'Installé par',
    installedAt: 'À',
    drainVentCard: "Points de purge et d'évent",
    addDrainVent: 'Ajouter un point',
    pointType: 'Type',
    pointTypes: ['Purge', 'Évent', 'Drain'],
    opened: 'Ouvert',
    confirmedEmpty: 'Vide confirmé',
    isolationConfirmCard: "Confirmation d'isolement",
    isolationComplete: 'Isolement complet et vérifié',
    isolationVerifiedBy: 'Vérifié par',
    isolationVerifiedAt: 'Date/heure de vérification',
    // verification
    pressureZeroCard: 'Vérification pression zéro',
    pressureRelieved: 'Pression dépressurisée',
    pressureMeasured: 'Pression mesurée (kPa)',
    gaugeId: 'ID du manomètre',
    gaugeCalDate: "Date d'étalonnage du manomètre",
    pressureWarning: 'ATTENTION : Pression non nulle — vérifier avant de procéder !',
    drainFlushCard: 'Vidange et purge',
    systemDrained: 'Système vidangé',
    systemFlushed: 'Système purgé',
    flushMedium: 'Milieu de purge',
    temperatureCard: 'Température',
    temperatureChecked: 'Température vérifiée',
    temperatureMeasured: 'Température mesurée (°C)',
    tempWarning: 'ATTENTION : Température élevée — attendre le refroidissement.',
    safetyConfirmCard: 'Confirmation de sécurité',
    safeToWork: "SYSTÈME SÉCURITAIRE POUR LES TRAVAUX",
    verifiedBy: 'Vérifié par',
    verifiedAt: 'Date/heure',
    verificationNotes: 'Notes de vérification',
    // workAuth
    authorizedWorkCard: 'Travaux autorisés',
    authorizedWork: 'Description des travaux autorisés *',
    authorizedWorkPh: 'Liste explicite des travaux autorisés…',
    restrictedWorkCard: 'Travaux restreints / exclus',
    restrictedWork: 'Travaux restreints ou exclus',
    restrictedWorkPh: 'Travaux non autorisés dans le cadre de ce permis…',
    specialConditionsCard: 'Conditions spéciales',
    specialConditions: 'Conditions spéciales',
    specialConditionsPh: 'Conditions ou exigences particulières…',
    permitDuration: 'Durée du permis (h)',
    maxPressure: 'Pression maximale autorisée (kPa)',
    breakInRequired: "Bris d'isolement requis",
    breakInNotes: "Notes sur le bris d'isolement",
    // restoration
    restorationStepsCard: 'Étapes de remise en service',
    addStep: 'Ajouter une étape',
    stepNumber: 'Étape',
    stepDescription: 'Description',
    responsible: 'Responsable',
    completed: 'Complété',
    completedAt: 'Complété le',
    finalChecksCard: 'Vérifications finales avant remise en pression',
    blindsRemoved: 'Blindes retirées',
    valvesRestored: 'Vannes restituées',
    systemPressurized: 'Système remis sous pression',
    pressureTestCard: "Test d'étanchéité (si requis)",
    pressureTestRequired: "Test d'étanchéité requis",
    testMedium: 'Milieu de test',
    testMedia: ['Eau', 'Air', 'Azote'],
    testPressure: 'Pression de test (kPa)',
    testDuration: 'Durée du test (min)',
    testPassed: 'Test réussi',
    recommissionCard: 'Remise en service',
    recommissionedBy: 'Remis en service par',
    recommissionedAt: 'Date/heure de remise en service',
    // finalization
    validationCard: 'Validation du permis',
    supervisorCard: 'Signature du superviseur',
    supervisorName: 'Nom du superviseur',
    supervisorNamePh: 'Prénom et nom',
    supervisorCert: 'Certification',
    supervisorCertPh: 'N° de certification',
    validFrom: 'Valide du',
    validTo: 'Valide au',
    permittedWork: 'Travaux autorisés',
    permittedWorkPh: 'Description des travaux permis…',
    restrictionsLabel: 'Restrictions',
    restrictionsPh: 'Conditions ou restrictions particulières…',
    finalizationNotes: 'Notes finales',
    finalizationNotesPh: 'Notes, observations ou conditions particulières…',
    activate: 'Activer le permis',
    close: 'Fermer le permis',
    reopen: 'Rouvrir',
    saveBtn: 'Enregistrer',
    provinces: { QC: 'Québec', ON: 'Ontario', BC: 'Colombie-Britannique', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba', NB: 'Nouveau-Brunswick', NS: 'Nouvelle-Écosse', PE: 'Î.-P.-É.', NL: 'T.-N.-L.' },
  },
  en: {
    title: 'Pressure Work Permit',
    standard: 'ASME B31.3 / Provincial pressure vessel regulations',
    sections: {
      system: 'System',
      isolation: 'Isolation',
      verification: 'Verification',
      workAuth: 'Authorization',
      restoration: 'Restoration',
      finalization: 'Finalization',
    },
    sectionsFull: {
      system: 'System information',
      isolation: 'Valve lineup & isolation',
      verification: 'Pre-work verification',
      workAuth: 'Work authorization',
      restoration: 'System restoration',
      finalization: 'Finalization & signatures',
    },
    menu: { saveNow: 'Save now', exportJson: 'Export JSON', print: 'Print', newPermit: 'New permit' },
    save: { saving: 'Saving…', saved: 'Saved', error: 'Save error', unsaved: 'Unsaved' },
    status: { draft: 'Draft', active: 'Active', completed: 'Completed', cancelled: 'Cancelled' },
    back: 'Back to permits',
    completion: 'Completion',
    projectInfo: 'Project information',
    projectNumber: 'Project number',
    workLocation: 'Work location',
    workLocationPh: 'Address or precise description',
    contractor: 'Contractor',
    supervisor: 'Supervisor',
    entryDate: 'Start date',
    duration: 'Expected duration',
    workerCount: 'Worker count',
    workDescription: 'Work description',
    workDescriptionPh: 'Description of work to be performed…',
    systemIdCard: 'System identification',
    systemId: 'System ID *',
    pidRef: 'P&ID reference *',
    fluidType: 'Fluid type',
    fluidTypes: ['Water', 'Steam', 'Compressed air', 'Nitrogen', 'Natural gas', 'Propane', 'Hydraulic oil', 'Petroleum products', 'Acid', 'Other chemicals'],
    fluidClass: 'Fluid class',
    fluidClasses: ['Category I (non-toxic/non-flammable)', 'Category II (toxic/flammable <260°C)', 'Category III (highly hazardous)'],
    designParamsCard: 'Design parameters',
    designPressure: 'Design pressure (kPa)',
    operatingPressure: 'Operating pressure (kPa)',
    designTemp: 'Design temperature (°C)',
    operatingTemp: 'Operating temperature (°C)',
    pipeClass: 'Pipe class',
    pipeSpec: 'Pipe specification',
    isolationClass: 'Isolation class',
    isolationClasses: ['Class 1 — Double block & bleed', 'Class 2 — Single block', 'Class 3 — Blind required'],
    regulationCard: 'Applicable regulation',
    regulationNote: {
      QC: 'Quebec: An Act respecting pressure vessels (CQLR c. A-20.01).',
      ON: 'Ontario: Technical Standards and Safety Act, 2000.',
      AB: 'Alberta: Safety Codes Act — Pressure Equipment.',
      BC: 'B.C.: Boiler, Pressure Vessel and Pressure Piping Act.',
      default: 'Consult applicable provincial pressure vessel regulation.',
    },
    valveLineupCard: 'Valve lineup',
    addValve: 'Add valve',
    tagNumber: 'Tag #',
    description: 'Description',
    location: 'Location',
    requiredPosition: 'Required position',
    currentPosition: 'Current position',
    positionOptions: ['Open', 'Closed', 'Regulated'],
    isolatedBy: 'Isolated by',
    isolatedAt: 'At',
    verified: 'Verified',
    blindListCard: 'Blind list',
    addBlind: 'Add blind',
    blindNumber: 'Blind number',
    size: 'Size',
    rating: 'Rating',
    installedBy: 'Installed by',
    installedAt: 'At',
    drainVentCard: 'Drain and vent points',
    addDrainVent: 'Add point',
    pointType: 'Type',
    pointTypes: ['Purge', 'Vent', 'Drain'],
    opened: 'Opened',
    confirmedEmpty: 'Confirmed empty',
    isolationConfirmCard: 'Isolation confirmation',
    isolationComplete: 'Isolation complete and verified',
    isolationVerifiedBy: 'Verified by',
    isolationVerifiedAt: 'Verification date/time',
    pressureZeroCard: 'Zero pressure verification',
    pressureRelieved: 'Pressure relieved',
    pressureMeasured: 'Measured pressure (kPa)',
    gaugeId: 'Gauge ID',
    gaugeCalDate: 'Gauge calibration date',
    pressureWarning: 'WARNING: Non-zero pressure — verify before proceeding!',
    drainFlushCard: 'Draining and flushing',
    systemDrained: 'System drained',
    systemFlushed: 'System flushed',
    flushMedium: 'Flush medium',
    temperatureCard: 'Temperature',
    temperatureChecked: 'Temperature checked',
    temperatureMeasured: 'Measured temperature (°C)',
    tempWarning: 'WARNING: Elevated temperature — wait for cooling.',
    safetyConfirmCard: 'Safety confirmation',
    safeToWork: 'SYSTEM SAFE FOR WORK',
    verifiedBy: 'Verified by',
    verifiedAt: 'Date/time',
    verificationNotes: 'Verification notes',
    authorizedWorkCard: 'Authorized work',
    authorizedWork: 'Authorized work description *',
    authorizedWorkPh: 'Explicit list of authorized work…',
    restrictedWorkCard: 'Restricted / excluded work',
    restrictedWork: 'Restricted or excluded work',
    restrictedWorkPh: 'Work not authorized under this permit…',
    specialConditionsCard: 'Special conditions',
    specialConditions: 'Special conditions',
    specialConditionsPh: 'Special conditions or requirements…',
    permitDuration: 'Permit duration (h)',
    maxPressure: 'Maximum authorized pressure (kPa)',
    breakInRequired: 'Break-in isolation required',
    breakInNotes: 'Break-in notes',
    restorationStepsCard: 'Restoration steps',
    addStep: 'Add step',
    stepNumber: 'Step',
    stepDescription: 'Description',
    responsible: 'Responsible',
    completed: 'Completed',
    completedAt: 'Completed at',
    finalChecksCard: 'Final checks before pressurization',
    blindsRemoved: 'Blinds removed',
    valvesRestored: 'Valves restored',
    systemPressurized: 'System re-pressurized',
    pressureTestCard: 'Leak test (if required)',
    pressureTestRequired: 'Pressure/leak test required',
    testMedium: 'Test medium',
    testMedia: ['Water', 'Air', 'Nitrogen'],
    testPressure: 'Test pressure (kPa)',
    testDuration: 'Test duration (min)',
    testPassed: 'Test passed',
    recommissionCard: 'Recommissioning',
    recommissionedBy: 'Recommissioned by',
    recommissionedAt: 'Recommissioning date/time',
    validationCard: 'Permit validation',
    supervisorCard: 'Supervisor signature',
    supervisorName: 'Supervisor name',
    supervisorNamePh: 'First and last name',
    supervisorCert: 'Certification',
    supervisorCertPh: 'Certification number',
    validFrom: 'Valid from',
    validTo: 'Valid to',
    permittedWork: 'Permitted work',
    permittedWorkPh: 'Description of permitted work…',
    restrictionsLabel: 'Restrictions',
    restrictionsPh: 'Special conditions or restrictions…',
    finalizationNotes: 'Final notes',
    finalizationNotesPh: 'Notes, observations or special conditions…',
    activate: 'Activate permit',
    close: 'Close permit',
    reopen: 'Reopen',
    saveBtn: 'Save',
    provinces: { QC: 'Quebec', ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba', NB: 'New Brunswick', NS: 'Nova Scotia', PE: 'P.E.I.', NL: 'N.L.' },
  },
} as const;

// ── Shared UI primitives ──────────────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-red-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, disabled, placeholder = '', type = 'text' }: {
  value: string | number; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function NumberInput({ value, onChange, disabled, min = 0, step = 1 }: {
  value: number; onChange: (v: number) => void; disabled?: boolean; min?: number; step?: number;
}) {
  return (
    <input type="number" value={value} min={min} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)} disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function Select({ value, onChange, disabled, options }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; options: readonly string[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400">
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ label, checked, onChange, disabled, large = false }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; large?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer select-none ${large ? 'p-4 rounded-xl border-2 ' + (checked ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600') : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled}
        className={`rounded border-slate-300 accent-red-600 ${large ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <span className={`text-slate-700 dark:text-slate-300 ${large ? 'text-base font-semibold' : 'text-sm'}`}>{label}</span>
    </label>
  );
}

function Textarea({ value, onChange, disabled, placeholder = '', rows = 3 }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} rows={rows}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function Warning({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span className="font-medium">{message}</span>
    </div>
  );
}

// ── Section components ─────────────────────────────────────────────────────
interface SectionProps {
  language: Language;
  permitData: PressurePermit;
  readOnly: boolean;
  onUpdate: (data: any) => void;
}

function SystemSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const si = permitData.systemInfo;
  const prov = permitData.province;
  const regNote = (t.regulationNote as any)[prov] ?? t.regulationNote.default;

  return (
    <div>
      <Card title={t.projectInfo} icon={<Settings className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.projectNumber}><Input value={si.projectNumber} onChange={v => onUpdate({ projectNumber: v })} disabled={readOnly} /></Field>
          <Field label={`${t.workLocation} *`}><Input value={si.workLocation} onChange={v => onUpdate({ workLocation: v })} disabled={readOnly} placeholder={t.workLocationPh} /></Field>
          <Field label={t.contractor}><Input value={si.contractor} onChange={v => onUpdate({ contractor: v })} disabled={readOnly} /></Field>
          <Field label={t.supervisor}><Input value={si.supervisor} onChange={v => onUpdate({ supervisor: v })} disabled={readOnly} /></Field>
          <Field label={t.entryDate}><Input value={si.entryDate} onChange={v => onUpdate({ entryDate: v })} disabled={readOnly} type="datetime-local" /></Field>
          <Field label={t.duration}><Input value={si.duration} onChange={v => onUpdate({ duration: v })} disabled={readOnly} /></Field>
          <Field label={t.workerCount}><NumberInput value={si.workerCount} onChange={v => onUpdate({ workerCount: v })} disabled={readOnly} min={1} /></Field>
        </div>
        <Field label={t.workDescription}><Textarea value={si.workDescription} onChange={v => onUpdate({ workDescription: v })} disabled={readOnly} placeholder={t.workDescriptionPh} /></Field>
      </Card>

      <Card title={t.systemIdCard} icon={<Gauge className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.systemId}><Input value={si.systemId} onChange={v => onUpdate({ systemId: v })} disabled={readOnly} /></Field>
          <Field label={t.pidRef}><Input value={si.pidRef} onChange={v => onUpdate({ pidRef: v })} disabled={readOnly} /></Field>
          <Field label={t.fluidType}><Select value={si.fluidType} onChange={v => onUpdate({ fluidType: v })} disabled={readOnly} options={t.fluidTypes} /></Field>
          <Field label={t.fluidClass}><Select value={si.fluidClass} onChange={v => onUpdate({ fluidClass: v })} disabled={readOnly} options={t.fluidClasses} /></Field>
        </div>
      </Card>

      <Card title={t.designParamsCard} icon={<Settings className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.designPressure}><NumberInput value={si.designPressure} onChange={v => onUpdate({ designPressure: v })} disabled={readOnly} step={10} /></Field>
          <Field label={t.operatingPressure}><NumberInput value={si.operatingPressure} onChange={v => onUpdate({ operatingPressure: v })} disabled={readOnly} step={10} /></Field>
          <Field label={t.designTemp}><NumberInput value={si.designTemp} onChange={v => onUpdate({ designTemp: v })} disabled={readOnly} min={-200} /></Field>
          <Field label={t.operatingTemp}><NumberInput value={si.operatingTemp} onChange={v => onUpdate({ operatingTemp: v })} disabled={readOnly} min={-200} /></Field>
          <Field label={t.pipeClass}><Input value={si.pipeClass} onChange={v => onUpdate({ pipeClass: v })} disabled={readOnly} /></Field>
          <Field label={t.pipeSpec}><Input value={si.pipeSpec} onChange={v => onUpdate({ pipeSpec: v })} disabled={readOnly} /></Field>
          <div className="sm:col-span-2">
            <Field label={t.isolationClass}><Select value={si.isolationClass} onChange={v => onUpdate({ isolationClass: v })} disabled={readOnly} options={t.isolationClasses} /></Field>
          </div>
        </div>
      </Card>

      <Card title={t.regulationCard} icon={<FileText className="w-5 h-5" />}>
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">{regNote}</p>
      </Card>
    </div>
  );
}

function IsolationSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const iso = permitData.isolation;

  // Valve lineup
  const addValve = () => {
    onUpdate({ valveLineup: [...iso.valveLineup, { id: generateId(), tagNumber: '', description: '', location: '', requiredPosition: '', currentPosition: '', isolatedBy: '', isolatedAt: '', verified: false }] });
  };
  const removeValve = (id: string) => onUpdate({ valveLineup: iso.valveLineup.filter((v: any) => v.id !== id) });
  const updateValve = (id: string, field: string, value: any) => {
    onUpdate({ valveLineup: iso.valveLineup.map((v: any) => v.id === id ? { ...v, [field]: value } : v) });
  };

  // Blind list
  const addBlind = () => {
    onUpdate({ blindList: [...iso.blindList, { id: generateId(), location: '', blindNumber: '', size: '', rating: '', installedBy: '', installedAt: '', verified: false }] });
  };
  const removeBlind = (id: string) => onUpdate({ blindList: iso.blindList.filter((b: any) => b.id !== id) });
  const updateBlind = (id: string, field: string, value: any) => {
    onUpdate({ blindList: iso.blindList.map((b: any) => b.id === id ? { ...b, [field]: value } : b) });
  };

  // Drain/vent
  const addDrainVent = () => {
    onUpdate({ drainVentPoints: [...iso.drainVentPoints, { id: generateId(), location: '', type: '', opened: false, confirmedEmpty: false }] });
  };
  const removeDrainVent = (id: string) => onUpdate({ drainVentPoints: iso.drainVentPoints.filter((d: any) => d.id !== id) });
  const updateDrainVent = (id: string, field: string, value: any) => {
    onUpdate({ drainVentPoints: iso.drainVentPoints.map((d: any) => d.id === id ? { ...d, [field]: value } : d) });
  };

  return (
    <div>
      {/* Valve lineup */}
      <Card title={t.valveLineupCard} icon={<Lock className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {[t.tagNumber, t.description, t.location, t.requiredPosition, t.currentPosition, t.isolatedBy, t.isolatedAt, t.verified].map(h => (
                  <th key={h} className="text-left py-2 pr-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {iso.valveLineup.map((v: any) => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-2 min-w-[80px]"><Input value={v.tagNumber} onChange={val => updateValve(v.id, 'tagNumber', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[120px]"><Input value={v.description} onChange={val => updateValve(v.id, 'description', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[100px]"><Input value={v.location} onChange={val => updateValve(v.id, 'location', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[100px]"><Select value={v.requiredPosition} onChange={val => updateValve(v.id, 'requiredPosition', val)} disabled={readOnly} options={t.positionOptions} /></td>
                  <td className="py-2 pr-2 min-w-[100px]"><Select value={v.currentPosition} onChange={val => updateValve(v.id, 'currentPosition', val)} disabled={readOnly} options={t.positionOptions} /></td>
                  <td className="py-2 pr-2 min-w-[100px]"><Input value={v.isolatedBy} onChange={val => updateValve(v.id, 'isolatedBy', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[130px]"><Input value={v.isolatedAt} onChange={val => updateValve(v.id, 'isolatedAt', val)} disabled={readOnly} type="datetime-local" /></td>
                  <td className="py-2 pr-2 text-center">
                    <input type="checkbox" checked={v.verified} onChange={e => updateValve(v.id, 'verified', e.target.checked)} disabled={readOnly}
                      className="h-4 w-4 rounded border-slate-300 accent-red-600" />
                  </td>
                  {!readOnly && <td className="py-2"><button type="button" onClick={() => removeValve(v.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <button type="button" onClick={addValve}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addValve}
          </button>
        )}
      </Card>

      {/* Blind list */}
      <Card title={t.blindListCard} icon={<Lock className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {[t.location, t.blindNumber, t.size, t.rating, t.installedBy, t.installedAt, t.verified].map(h => (
                  <th key={h} className="text-left py-2 pr-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {iso.blindList.map((b: any) => (
                <tr key={b.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-2 min-w-[100px]"><Input value={b.location} onChange={val => updateBlind(b.id, 'location', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[80px]"><Input value={b.blindNumber} onChange={val => updateBlind(b.id, 'blindNumber', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[80px]"><Input value={b.size} onChange={val => updateBlind(b.id, 'size', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[80px]"><Input value={b.rating} onChange={val => updateBlind(b.id, 'rating', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[100px]"><Input value={b.installedBy} onChange={val => updateBlind(b.id, 'installedBy', val)} disabled={readOnly} /></td>
                  <td className="py-2 pr-2 min-w-[130px]"><Input value={b.installedAt} onChange={val => updateBlind(b.id, 'installedAt', val)} disabled={readOnly} type="datetime-local" /></td>
                  <td className="py-2 pr-2 text-center">
                    <input type="checkbox" checked={b.verified} onChange={e => updateBlind(b.id, 'verified', e.target.checked)} disabled={readOnly}
                      className="h-4 w-4 rounded border-slate-300 accent-red-600" />
                  </td>
                  {!readOnly && <td className="py-2"><button type="button" onClick={() => removeBlind(b.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <button type="button" onClick={addBlind}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addBlind}
          </button>
        )}
      </Card>

      {/* Drain/vent points */}
      <Card title={t.drainVentCard} icon={<Lock className="w-5 h-5" />}>
        <div className="space-y-3">
          {iso.drainVentPoints.map((d: any) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex-1 min-w-[120px]"><Field label={t.location}><Input value={d.location} onChange={val => updateDrainVent(d.id, 'location', val)} disabled={readOnly} /></Field></div>
              <div className="w-32"><Field label={t.pointType}><Select value={d.type} onChange={val => updateDrainVent(d.id, 'type', val)} disabled={readOnly} options={t.pointTypes} /></Field></div>
              <div className="flex items-center gap-4 mt-4">
                <Toggle label={t.opened} checked={d.opened} onChange={val => updateDrainVent(d.id, 'opened', val)} disabled={readOnly} />
                <Toggle label={t.confirmedEmpty} checked={d.confirmedEmpty} onChange={val => updateDrainVent(d.id, 'confirmedEmpty', val)} disabled={readOnly} />
              </div>
              {!readOnly && <button type="button" onClick={() => removeDrainVent(d.id)} className="p-1 text-red-500 hover:text-red-700 mt-4"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        {!readOnly && (
          <button type="button" onClick={addDrainVent}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addDrainVent}
          </button>
        )}
      </Card>

      {/* Isolation confirmation */}
      <Card title={t.isolationConfirmCard} icon={<CheckSquare className="w-5 h-5" />}>
        <Toggle label={t.isolationComplete} checked={iso.isolationComplete} onChange={v => onUpdate({ isolationComplete: v })} disabled={readOnly} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.isolationVerifiedBy}><Input value={iso.isolationVerifiedBy} onChange={v => onUpdate({ isolationVerifiedBy: v })} disabled={readOnly} /></Field>
          <Field label={t.isolationVerifiedAt}><Input value={iso.isolationVerifiedAt} onChange={v => onUpdate({ isolationVerifiedAt: v })} disabled={readOnly} type="datetime-local" /></Field>
        </div>
      </Card>
    </div>
  );
}

function VerificationSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const v = permitData.verification;
  const si = permitData.systemInfo;

  return (
    <div>
      <Card title={t.pressureZeroCard} icon={<Gauge className="w-5 h-5" />}>
        <Toggle label={t.pressureRelieved} checked={v.pressureRelieved} onChange={val => onUpdate({ pressureRelieved: val })} disabled={readOnly} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.pressureMeasured}><NumberInput value={v.pressureMeasured} onChange={val => onUpdate({ pressureMeasured: val })} disabled={readOnly} step={10} /></Field>
          <Field label={t.gaugeId}><Input value={v.gaugeId} onChange={val => onUpdate({ gaugeId: val })} disabled={readOnly} /></Field>
          <Field label={t.gaugeCalDate}><Input value={v.gaugeCalDate} onChange={val => onUpdate({ gaugeCalDate: val })} disabled={readOnly} type="date" /></Field>
        </div>
        {v.pressureMeasured > 0 && <Warning message={t.pressureWarning} />}
      </Card>

      <Card title={t.drainFlushCard} icon={<CheckSquare className="w-5 h-5" />}>
        <Toggle label={t.systemDrained} checked={v.systemDrained} onChange={val => onUpdate({ systemDrained: val })} disabled={readOnly} />
        <Toggle label={t.systemFlushed} checked={v.systemFlushed} onChange={val => onUpdate({ systemFlushed: val })} disabled={readOnly} />
        {v.systemFlushed && (
          <Field label={t.flushMedium}><Input value={v.flushMedium} onChange={val => onUpdate({ flushMedium: val })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.temperatureCard} icon={<Settings className="w-5 h-5" />}>
        <Toggle label={t.temperatureChecked} checked={v.temperatureChecked} onChange={val => onUpdate({ temperatureChecked: val })} disabled={readOnly} />
        {v.temperatureChecked && (
          <Field label={t.temperatureMeasured}><NumberInput value={v.temperatureMeasured} onChange={val => onUpdate({ temperatureMeasured: val })} disabled={readOnly} min={-200} /></Field>
        )}
        {v.temperatureChecked && si.operatingTemp > 0 && v.temperatureMeasured > si.operatingTemp && (
          <Warning message={t.tempWarning} />
        )}
      </Card>

      <Card title={t.safetyConfirmCard} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="mb-4">
          <Toggle label={t.safeToWork} checked={v.safeToWork} onChange={val => onUpdate({ safeToWork: val })} disabled={readOnly} large />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.verifiedBy}><Input value={v.verifiedBy} onChange={val => onUpdate({ verifiedBy: val })} disabled={readOnly} /></Field>
          <Field label={t.verifiedAt}><Input value={v.verifiedAt} onChange={val => onUpdate({ verifiedAt: val })} disabled={readOnly} type="datetime-local" /></Field>
        </div>
        <Field label={t.verificationNotes}><Textarea value={v.verificationNotes} onChange={val => onUpdate({ verificationNotes: val })} disabled={readOnly} rows={3} /></Field>
      </Card>
    </div>
  );
}

function WorkAuthSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const wa = permitData.workAuth;

  return (
    <div>
      <Card title={t.authorizedWorkCard} icon={<FileText className="w-5 h-5" />}>
        <Field label={t.authorizedWork}><Textarea value={wa.authorizedWork} onChange={v => onUpdate({ authorizedWork: v })} disabled={readOnly} placeholder={t.authorizedWorkPh} rows={5} /></Field>
      </Card>

      <Card title={t.restrictedWorkCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <Field label={t.restrictedWork}><Textarea value={wa.restrictedWork} onChange={v => onUpdate({ restrictedWork: v })} disabled={readOnly} placeholder={t.restrictedWorkPh} rows={3} /></Field>
      </Card>

      <Card title={t.specialConditionsCard} icon={<Settings className="w-5 h-5" />}>
        <Field label={t.specialConditions}><Textarea value={wa.specialConditions} onChange={v => onUpdate({ specialConditions: v })} disabled={readOnly} placeholder={t.specialConditionsPh} rows={3} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.permitDuration}><NumberInput value={wa.permitDuration} onChange={v => onUpdate({ permitDuration: v })} disabled={readOnly} min={1} /></Field>
          <Field label={t.maxPressure}><NumberInput value={wa.maxPressure} onChange={v => onUpdate({ maxPressure: v })} disabled={readOnly} step={10} /></Field>
        </div>
        <Toggle label={t.breakInRequired} checked={wa.breakInRequired} onChange={v => onUpdate({ breakInRequired: v })} disabled={readOnly} />
        {wa.breakInRequired && (
          <Field label={t.breakInNotes}><Textarea value={wa.breakInNotes} onChange={v => onUpdate({ breakInNotes: v })} disabled={readOnly} rows={2} /></Field>
        )}
      </Card>
    </div>
  );
}

function RestorationSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const rest = permitData.restoration;

  const addStep = () => {
    const nextStep = rest.restorationSteps.length + 1;
    onUpdate({ restorationSteps: [...rest.restorationSteps, { id: generateId(), step: nextStep, description: '', responsible: '', completed: false, completedAt: '' }] });
  };
  const removeStep = (id: string) => onUpdate({ restorationSteps: rest.restorationSteps.filter((s: any) => s.id !== id) });
  const updateStep = (id: string, field: string, value: any) => {
    onUpdate({ restorationSteps: rest.restorationSteps.map((s: any) => s.id === id ? { ...s, [field]: value } : s) });
  };

  return (
    <div>
      <Card title={t.restorationStepsCard} icon={<RefreshCw className="w-5 h-5" />}>
        <div className="space-y-3">
          {rest.restorationSteps.map((step: any) => (
            <div key={step.id} className="flex flex-wrap items-start gap-3 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 font-bold text-sm shrink-0 mt-1">{step.step}</div>
              <div className="flex-1 min-w-[200px]"><Field label={t.stepDescription}><Input value={step.description} onChange={val => updateStep(step.id, 'description', val)} disabled={readOnly} /></Field></div>
              <div className="w-40"><Field label={t.responsible}><Input value={step.responsible} onChange={val => updateStep(step.id, 'responsible', val)} disabled={readOnly} /></Field></div>
              <div className="flex flex-col gap-2 mt-5">
                <Toggle label={t.completed} checked={step.completed} onChange={val => updateStep(step.id, 'completed', val)} disabled={readOnly} />
                {step.completed && (
                  <input type="datetime-local" value={step.completedAt} onChange={e => updateStep(step.id, 'completedAt', e.target.value)} disabled={readOnly}
                    className="border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none" />
                )}
              </div>
              {!readOnly && <button type="button" onClick={() => removeStep(step.id)} className="p-1 text-red-500 hover:text-red-700 mt-5"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        {!readOnly && (
          <button type="button" onClick={addStep}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addStep}
          </button>
        )}
      </Card>

      <Card title={t.finalChecksCard} icon={<CheckSquare className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle label={t.blindsRemoved} checked={rest.blindsRemoved} onChange={v => onUpdate({ blindsRemoved: v })} disabled={readOnly} />
          <Toggle label={t.valvesRestored} checked={rest.valvesRestored} onChange={v => onUpdate({ valvesRestored: v })} disabled={readOnly} />
          <Toggle label={t.systemPressurized} checked={rest.systemPressurized} onChange={v => onUpdate({ systemPressurized: v })} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.pressureTestCard} icon={<Gauge className="w-5 h-5" />}>
        <Toggle label={t.pressureTestRequired} checked={rest.pressureTestRequired} onChange={v => onUpdate({ pressureTestRequired: v })} disabled={readOnly} />
        {rest.pressureTestRequired && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={t.testMedium}><Select value={rest.testMedium} onChange={v => onUpdate({ testMedium: v })} disabled={readOnly} options={t.testMedia} /></Field>
            <Field label={t.testPressure}><NumberInput value={rest.testPressure} onChange={v => onUpdate({ testPressure: v })} disabled={readOnly} step={10} /></Field>
            <Field label={t.testDuration}><NumberInput value={rest.testDuration} onChange={v => onUpdate({ testDuration: v })} disabled={readOnly} step={5} /></Field>
            <div className="flex items-end pb-2">
              <Toggle label={t.testPassed} checked={rest.testPassed} onChange={v => onUpdate({ testPassed: v })} disabled={readOnly} />
            </div>
          </div>
        )}
      </Card>

      <Card title={t.recommissionCard} icon={<RefreshCw className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.recommissionedBy}><Input value={rest.recommissionedBy} onChange={v => onUpdate({ recommissionedBy: v })} disabled={readOnly} /></Field>
          <Field label={t.recommissionedAt}><Input value={rest.recommissionedAt} onChange={v => onUpdate({ recommissionedAt: v })} disabled={readOnly} type="datetime-local" /></Field>
        </div>
      </Card>
    </div>
  );
}

function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language; permit: PressurePermit; completion: number; readOnly: boolean;
  onUpdate: (updater: (p: PressurePermit) => PressurePermit) => void; onSave: () => void;
}) {
  const t = T[language];
  const field = (key: string, val: string) => onUpdate(p => ({ ...p, [key]: val }));
  const setStatus = (s: PermitStatus) => onUpdate(p => ({ ...p, status: s }));

  const warnings: string[] = [];
  if (!permit.systemInfo.workLocation) warnings.push(language === 'fr' ? 'Lieu des travaux manquant' : 'Work location missing');
  if (!permit.systemInfo.systemId && !permit.systemInfo.pidRef) warnings.push(language === 'fr' ? 'ID système ou réf. P&ID manquants' : 'System ID or P&ID reference missing');
  if (!permit.isolation.isolationComplete) warnings.push(language === 'fr' ? 'Isolement non confirmé' : 'Isolation not confirmed');
  if (!permit.verification.safeToWork) warnings.push(language === 'fr' ? 'Sécurité pour les travaux non confirmée' : 'Safe-to-work not confirmed');

  return (
    <div>
      <Card title={t.validationCard} icon={<BarChart3 className="w-5 h-5" />}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${completion}%` }} />
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 w-12 text-right">{completion}%</span>
        </div>
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t.supervisorCard} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.supervisorName}><Input value={permit.supervisor_name} onChange={v => field('supervisor_name', v)} disabled={readOnly} placeholder={t.supervisorNamePh} /></Field>
          <Field label={t.supervisorCert}><Input value={permit.supervisor_cert} onChange={v => field('supervisor_cert', v)} disabled={readOnly} placeholder={t.supervisorCertPh} /></Field>
          <Field label={t.validFrom}><Input value={permit.permit_valid_from} onChange={v => field('permit_valid_from', v)} disabled={readOnly} type="datetime-local" /></Field>
          <Field label={t.validTo}><Input value={permit.permit_valid_to} onChange={v => field('permit_valid_to', v)} disabled={readOnly} type="datetime-local" /></Field>
        </div>
      </Card>

      <Card title={t.permittedWork} icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <Field label={t.permittedWork}><Textarea value={permit.permitted_work} onChange={v => field('permitted_work', v)} disabled={readOnly} placeholder={t.permittedWorkPh} rows={3} /></Field>
          <Field label={t.restrictionsLabel}><Textarea value={permit.restrictions} onChange={v => field('restrictions', v)} disabled={readOnly} placeholder={t.restrictionsPh} rows={3} /></Field>
          <Field label={t.finalizationNotes}><Textarea value={permit.finalization_notes} onChange={v => field('finalization_notes', v)} disabled={readOnly} placeholder={t.finalizationNotesPh} rows={3} /></Field>
        </div>
      </Card>

      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          {permit.status === 'draft' && (
            <button type="button" onClick={() => { setStatus('active'); onSave(); }} disabled={completion < 60}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="w-4 h-4" />{t.activate}
            </button>
          )}
          {permit.status === 'active' && (
            <button type="button" onClick={() => { setStatus('completed'); onSave(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="w-4 h-4" />{t.close}
            </button>
          )}
          {(permit.status === 'completed' || permit.status === 'cancelled') && (
            <button type="button" onClick={() => setStatus('draft')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
              {t.reopen}
            </button>
          )}
          <button type="button" onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" />{t.saveBtn}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────
interface PressureProps {
  tenant?: string;
  language?: Language;
  province?: ProvinceCode;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: PressurePermit) => void;
  onCancel?: () => void;
  initialData?: Partial<PressurePermit>;
  readOnly?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Pressure({
  tenant = 'demo',
  language = 'fr',
  province = 'QC',
  selectedProvince,
  enableAutoSave = true,
  onSave,
  onCancel,
  initialData,
  readOnly = false,
}: PressureProps) {
  const resolvedProvince: ProvinceCode = (selectedProvince ?? province) as ProvinceCode;
  const t = T[language];

  const [permit, setPermit] = useState<PressurePermit>(() => ({
    ...createDefaultPermit(resolvedProvince),
    ...initialData,
  }));
  const [section, setSection] = useState<Section>('system');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPermit(p => ({ ...p, province: resolvedProvince }));
  }, [resolvedProvince]);

  const persistPermit = useCallback(async (data: PressurePermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'pressure',
          data: payload,
          updated_at: payload.updated_at,
        });
      }
      localStorage.setItem(`permit-${payload.permit_number}`, JSON.stringify(payload));
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToSection = (s: Section) => {
    setSection(s);
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const updatePermit = useCallback((updater: (prev: PressurePermit) => PressurePermit) => {
    setPermit(updater);
  }, []);

  const handleSaveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await persistPermit(permit);
    if (onSave) onSave(permit);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(permit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${permit.permit_number}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const completion = computeCompletion(permit);

  const SECTIONS: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: 'system', icon: <Settings className="w-4 h-4" />, label: t.sections.system },
    { id: 'isolation', icon: <Lock className="w-4 h-4" />, label: t.sections.isolation },
    { id: 'verification', icon: <CheckSquare className="w-4 h-4" />, label: t.sections.verification },
    { id: 'workAuth', icon: <FileText className="w-4 h-4" />, label: t.sections.workAuth },
    { id: 'restoration', icon: <RefreshCw className="w-4 h-4" />, label: t.sections.restoration },
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
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
          )}
          {onCancel && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}

          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="w-5 h-5 text-red-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{t.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{permit.permit_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[permit.status]}`}>
              {t.status[permit.status]}
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-3.5 h-3.5" />{completion}%
            </span>
            <span className={`hidden sm:block text-xs font-medium ${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-blue-500' : saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
              {saveStatus !== 'idle' ? t.save[saveStatus] : ''}
            </span>
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
                  <button type="button" onClick={() => { handleSaveNow(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Save className="w-4 h-4 text-slate-400" />{t.menu.saveNow}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4 text-slate-400" />{t.menu.exportJson}
                  </button>
                  <button type="button" onClick={() => { window.print(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Printer className="w-4 h-4 text-slate-400" />{t.menu.print}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => { setPermit(createDefaultPermit(resolvedProvince)); setSection('system'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Plus className="w-4 h-4 text-slate-400" />{t.menu.newPermit}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs + progress bar */}
        <div className="flex items-center gap-1 px-4 pb-0 lg:px-6 overflow-x-auto scrollbar-none">
          {SECTIONS.map(s => (
            <button key={s.id} type="button" onClick={() => goToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                section === s.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}>
              {s.icon}<span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {section === 'system' && (
            <SystemSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, systemInfo: { ...p.systemInfo, ...data } }))} />
          )}
          {section === 'isolation' && (
            <IsolationSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, isolation: { ...p.isolation, ...data } }))} />
          )}
          {section === 'verification' && (
            <VerificationSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, verification: { ...p.verification, ...data } }))} />
          )}
          {section === 'workAuth' && (
            <WorkAuthSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, workAuth: { ...p.workAuth, ...data } }))} />
          )}
          {section === 'restoration' && (
            <RestorationSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, restoration: { ...p.restoration, ...data } }))} />
          )}
          {section === 'finalization' && (
            <FinalizationSection language={language} permit={permit} completion={completion}
              readOnly={readOnly} onUpdate={updatePermit} onSave={handleSaveNow} />
          )}
        </div>
      </main>
    </div>
  );
}
