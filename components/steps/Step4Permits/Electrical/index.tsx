'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Zap, Lock, Shield, CheckCircle, Menu, X, Save, Download,
  Printer, Plus, ChevronRight, AlertTriangle, Home, FileText, BarChart3,
  Trash2,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ── Supabase (best-effort) ─────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Types ──────────────────────────────────────────────────────────────────
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type Language = 'fr' | 'en';

interface IsolationStep {
  id: string;
  step: number;
  description: string;
  isolationPoint: string;
  responsible: string;
  verified: boolean;
}

interface ElectricalPermit {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  siteInfo: {
    projectNumber: string;
    workLocation: string;
    contractor: string;
    supervisor: string;
    entryDate: string;
    duration: string;
    workerCount: number;
    workDescription: string;
    equipmentId: string;
    equipmentName: string;
    panelId: string;
    voltage: number;
    current: number;
    systemType: string;
    drawingRef: string;
  };
  arcFlash: {
    arcFlashLabelPresent: boolean;
    incidentEnergy: number;
    workingDistance: number;
    ppeCategory: string;
    arcFlashBoundary: number;
    limitedApproach: number;
    restrictedApproach: number;
    arcFlashNotes: string;
    assessmentDate: string;
    assessedBy: string;
  };
  isolation: {
    deEnergizationRequired: boolean;
    steps: IsolationStep[];
    lotoRef: string;
    tagoutOnly: boolean;
    energizedWorkJustification: string;
    zeroEnergyVerified: boolean;
    verifiedBy: string;
    verifiedAt: string;
  };
  ppe: {
    arcFlashSuit: boolean;
    suitCalRating: number;
    faceShield: boolean;
    shieldCalRating: number;
    insulatingGloves: boolean;
    gloveVoltageClass: string;
    safetyGlasses: boolean;
    hardHat: boolean;
    hardHatClass: string;
    safetyBoots: boolean;
    arcFlashHood: boolean;
    cottonUnderwear: boolean;
    tools: string[];
    additionalPPE: string;
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

type Section = 'site' | 'arcFlash' | 'isolation' | 'ppe' | 'finalization';

interface ElectricalProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<ElectricalPermit>;
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis Travaux Électriques',
    standard: 'CSA Z462 / NFPA 70E',
    back: 'Retour aux permis',
    sections: {
      site: 'Site',
      arcFlash: 'Arc Flash',
      isolation: 'Isolation',
      ppe: 'EPI',
      finalization: 'Finalisation',
    },
    menu: {
      saveNow: 'Enregistrer maintenant',
      exportJson: 'Exporter JSON',
      print: 'Imprimer',
      newPermit: 'Nouveau permis',
    },
    save: {
      saving: 'Enregistrement…',
      saved: 'Enregistré',
      error: 'Erreur sauvegarde',
      idle: '',
    },
    status: {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Complété',
      cancelled: 'Annulé',
    },
    completion: 'Complétion',
    add: 'Ajouter',
    remove: 'Supprimer',
    yes: 'Oui',
    no: 'Non',
    // site
    site: {
      cardProject: 'Informations du projet',
      cardEquipment: 'Identification équipement',
      cardReg: 'Réglementation applicable',
      projectNumber: 'Numéro de projet',
      workLocation: 'Lieu des travaux *',
      contractor: 'Entrepreneur',
      supervisor: 'Superviseur *',
      entryDate: "Date d'entrée",
      duration: 'Durée prévue',
      workerCount: 'Nombre de travailleurs',
      workDescription: 'Description des travaux *',
      equipmentId: "ID de l'équipement",
      equipmentName: "Nom de l'équipement *",
      panelId: 'ID du panneau',
      voltage: 'Tension (V) *',
      current: 'Courant (A)',
      systemType: 'Type de système',
      drawingRef: 'Référence dessin',
      regNote: 'Ces travaux sont régis par la norme CSA Z462 et NFPA 70E. Respectez la réglementation provinciale applicable.',
      regQC: 'QC : Code de sécurité pour les travaux de construction (CSTC)',
      regON: 'ON : O. Reg 851, art. 188 — Règlement sur les établissements industriels',
      regBC: 'BC : Occupational Health and Safety Regulation, Part 19',
      regAB: 'AB : OHS Code, Part 18 — Hazardous Work Permit',
      systemTypes: {
        ac1: 'AC monophasé',
        ac3: 'AC triphasé',
        dc: 'DC',
        lv: 'Basse tension (<50 V)',
        hv: 'Haute tension (>1000 V)',
      },
    },
    // arc flash
    af: {
      cardLabel: 'Étiquette arc flash',
      cardEval: 'Évaluation arc flash (CSA Z462)',
      cardEnergized: 'Travail sous tension justifié',
      cardDetails: 'Détails évaluation',
      labelPresent: "Étiquette arc flash présente sur l'équipement",
      incidentEnergy: "Énergie incidente (cal/cm²)",
      workingDistance: 'Distance de travail (mm)',
      ppeCategory: 'Catégorie EPI',
      arcFlashBoundary: 'Limite arc flash (m)',
      limitedApproach: 'Limite approche limitée (m)',
      restrictedApproach: 'Limite approche restreinte (m)',
      energizedJust: 'Justification travail sous tension',
      energizedJustPh: "Pourquoi le travail sous tension est nécessaire et ne peut être évité…",
      assessmentDate: "Date d'évaluation",
      assessedBy: 'Évalué par',
      notes: 'Notes arc flash',
      notesPh: 'Observations, conditions particulières…',
      cats: {
        cat1: 'Cat. 1 — 4 cal/cm² (chemise arc flash)',
        cat2: 'Cat. 2 — 8 cal/cm² (combinaison arc flash)',
        cat3: 'Cat. 3 — 25 cal/cm² (combinaison lourde)',
        cat4: 'Cat. 4 — 40 cal/cm² (protection maximale)',
        unknown: 'Indéterminé',
      },
      catDesc: {
        cat1: 'Chemise et pantalon arc flash, écran facial 4 cal/cm²',
        cat2: 'Combinaison arc flash ou vêtements superposés, gants isolants',
        cat3: 'Combinaison arc flash lourde, cagoule, gants Classe 2',
        cat4: 'Combinaison multi-couche arc flash, cagoule, gants Classe 3/4',
        unknown: 'Effectuer une analyse arc flash avant de procéder',
      },
    },
    // isolation
    iso: {
      cardDe: 'Mise hors tension',
      cardSteps: 'Étapes de mise hors tension',
      cardZero: 'Vérification zéro énergie',
      deRequired: 'Mise hors tension requise',
      tagoutOnly: 'Cadenassage par étiquette seulement (sans cadenas)',
      lotoRef: 'Référence procédure LOTO',
      stepNum: 'Étape',
      stepDesc: 'Description',
      stepPoint: "Point d'isolation",
      stepResp: 'Responsable',
      stepVerified: 'Vérifié',
      addStep: 'Ajouter une étape',
      zeroVerified: 'Zéro énergie vérifié',
      verifiedBy: 'Vérifié par',
      verifiedAt: 'Vérifié le',
    },
    // ppe
    ppe: {
      cardArcFlash: 'EPI Arc Flash requis',
      cardBasic: 'EPI de base',
      cardTools: 'Outils isolants requis',
      arcFlashSuit: 'Combinaison arc flash',
      suitCal: 'Cote cal/cm² de la combinaison',
      faceShield: 'Écran facial arc flash',
      shieldCal: "Cote cal/cm² de l'écran",
      insulatingGloves: 'Gants isolants',
      gloveClass: 'Classe des gants isolants',
      arcFlashHood: 'Cagoule arc flash',
      cottonUnderwear: 'Sous-vêtements en coton',
      safetyGlasses: 'Lunettes de sécurité',
      hardHat: 'Casque de sécurité',
      hardHatClass: 'Classe du casque',
      safetyBoots: 'Bottes de sécurité',
      additionalPPE: 'EPI additionnels',
      additionalPPEPh: 'Autres équipements de protection individuelle requis…',
      toolsList: 'Liste des outils',
      gloveClasses: {
        '00': 'Classe 00 — 500 V',
        '0': 'Classe 0 — 1 000 V',
        '1': 'Classe 1 — 7 500 V',
        '2': 'Classe 2 — 17 000 V',
        '3': 'Classe 3 — 26 500 V',
        '4': 'Classe 4 — 36 000 V',
      },
      hardHatClasses: {
        E: 'Classe E — 20 000 V',
        B: 'Classe B — 2 200 V',
        C: 'Classe C — Non diélectrique',
      },
      tools: [
        'Tournevis isolant',
        'Clés isolantes',
        'Pinces isolantes',
        'Voltmètre',
        'Pince ampèremétrique',
        'Détecteur de tension',
      ],
    },
    // finalization
    fin: {
      validation: 'Validation du permis',
      supervisorSignature: 'Signature du superviseur',
      supervisorName: 'Nom du superviseur',
      supervisorNamePh: 'Prénom et nom',
      supervisorCert: 'Certification superviseur',
      supervisorCertPh: 'N° de certification',
      validFrom: 'Permis valide du',
      validTo: "Permis valide jusqu'au",
      permittedWork: 'Travaux autorisés',
      permittedWorkPh: 'Description des travaux permis…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Conditions ou restrictions particulières…',
      notes: 'Notes finales',
      notesPh: 'Observations ou conditions spéciales…',
      signAndActivate: 'Signer et activer',
      signAndClose: 'Signer et fermer',
      save: 'Enregistrer',
      reopen: 'Rouvrir',
    },
    warnings: {
      noLocation: 'Lieu des travaux non renseigné',
      noEquipment: 'Équipement non identifié',
      noVoltage: 'Tension non renseignée',
      noPPECat: 'Catégorie EPI non déterminée',
      noIsoSteps: "Aucune étape d'isolation définie",
      noZeroVerify: 'Vérification zéro énergie manquante',
    },
  },
  en: {
    title: 'Electrical Work Permit',
    standard: 'CSA Z462 / NFPA 70E',
    back: 'Back to permits',
    sections: {
      site: 'Site',
      arcFlash: 'Arc Flash',
      isolation: 'Isolation',
      ppe: 'PPE',
      finalization: 'Finalization',
    },
    menu: {
      saveNow: 'Save now',
      exportJson: 'Export JSON',
      print: 'Print',
      newPermit: 'New permit',
    },
    save: {
      saving: 'Saving…',
      saved: 'Saved',
      error: 'Save error',
      idle: '',
    },
    status: {
      draft: 'Draft',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    completion: 'Completion',
    add: 'Add',
    remove: 'Remove',
    yes: 'Yes',
    no: 'No',
    site: {
      cardProject: 'Project information',
      cardEquipment: 'Equipment identification',
      cardReg: 'Applicable regulation',
      projectNumber: 'Project number',
      workLocation: 'Work location *',
      contractor: 'Contractor',
      supervisor: 'Supervisor *',
      entryDate: 'Entry date',
      duration: 'Planned duration',
      workerCount: 'Worker count',
      workDescription: 'Work description *',
      equipmentId: 'Equipment ID',
      equipmentName: 'Equipment name *',
      panelId: 'Panel ID',
      voltage: 'Voltage (V) *',
      current: 'Current (A)',
      systemType: 'System type',
      drawingRef: 'Drawing reference',
      regNote: 'This work is governed by CSA Z462 and NFPA 70E. Comply with applicable provincial regulations.',
      regQC: 'QC: Construction Safety Code (CSTC)',
      regON: 'ON: O. Reg 851, s.188 — Industrial Establishments Regulation',
      regBC: 'BC: Occupational Health and Safety Regulation, Part 19',
      regAB: 'AB: OHS Code, Part 18 — Hazardous Work Permit',
      systemTypes: {
        ac1: 'Single-phase AC',
        ac3: 'Three-phase AC',
        dc: 'DC',
        lv: 'Low voltage (<50 V)',
        hv: 'High voltage (>1000 V)',
      },
    },
    af: {
      cardLabel: 'Arc flash label',
      cardEval: 'Arc flash assessment (CSA Z462)',
      cardEnergized: 'Energized work justification',
      cardDetails: 'Assessment details',
      labelPresent: 'Arc flash label present on equipment',
      incidentEnergy: 'Incident energy (cal/cm²)',
      workingDistance: 'Working distance (mm)',
      ppeCategory: 'PPE category',
      arcFlashBoundary: 'Arc flash boundary (m)',
      limitedApproach: 'Limited approach boundary (m)',
      restrictedApproach: 'Restricted approach boundary (m)',
      energizedJust: 'Energized work justification',
      energizedJustPh: 'Why energized work is required and cannot be avoided…',
      assessmentDate: 'Assessment date',
      assessedBy: 'Assessed by',
      notes: 'Arc flash notes',
      notesPh: 'Observations, special conditions…',
      cats: {
        cat1: 'Cat. 1 — 4 cal/cm² (arc flash shirt)',
        cat2: 'Cat. 2 — 8 cal/cm² (arc flash suit)',
        cat3: 'Cat. 3 — 25 cal/cm² (heavyweight suit)',
        cat4: 'Cat. 4 — 40 cal/cm² (max protection)',
        unknown: 'Undetermined',
      },
      catDesc: {
        cat1: 'Arc flash shirt and pants, 4 cal/cm² face shield',
        cat2: 'Arc flash suit or layered clothing, insulating gloves',
        cat3: 'Heavyweight arc flash suit, hood, Class 2 gloves',
        cat4: 'Multi-layer arc flash suit, hood, Class 3/4 gloves',
        unknown: 'Perform arc flash analysis before proceeding',
      },
    },
    iso: {
      cardDe: 'De-energization',
      cardSteps: 'De-energization steps',
      cardZero: 'Zero energy verification',
      deRequired: 'De-energization required',
      tagoutOnly: 'Tagout only (no lockout)',
      lotoRef: 'LOTO procedure reference',
      stepNum: 'Step',
      stepDesc: 'Description',
      stepPoint: 'Isolation point',
      stepResp: 'Responsible',
      stepVerified: 'Verified',
      addStep: 'Add step',
      zeroVerified: 'Zero energy verified',
      verifiedBy: 'Verified by',
      verifiedAt: 'Verified at',
    },
    ppe: {
      cardArcFlash: 'Required arc flash PPE',
      cardBasic: 'Basic PPE',
      cardTools: 'Required insulated tools',
      arcFlashSuit: 'Arc flash suit',
      suitCal: 'Suit cal/cm² rating',
      faceShield: 'Arc flash face shield',
      shieldCal: 'Shield cal/cm² rating',
      insulatingGloves: 'Insulating gloves',
      gloveClass: 'Insulating glove class',
      arcFlashHood: 'Arc flash hood',
      cottonUnderwear: 'Cotton underwear',
      safetyGlasses: 'Safety glasses',
      hardHat: 'Hard hat',
      hardHatClass: 'Hard hat class',
      safetyBoots: 'Safety boots',
      additionalPPE: 'Additional PPE',
      additionalPPEPh: 'Other required personal protective equipment…',
      toolsList: 'Tool list',
      gloveClasses: {
        '00': 'Class 00 — 500 V',
        '0': 'Class 0 — 1,000 V',
        '1': 'Class 1 — 7,500 V',
        '2': 'Class 2 — 17,000 V',
        '3': 'Class 3 — 26,500 V',
        '4': 'Class 4 — 36,000 V',
      },
      hardHatClasses: {
        E: 'Class E — 20,000 V',
        B: 'Class B — 2,200 V',
        C: 'Class C — Non-dielectric',
      },
      tools: [
        'Insulated screwdrivers',
        'Insulated wrenches',
        'Insulated pliers',
        'Voltmeter',
        'Clamp meter',
        'Voltage detector',
      ],
    },
    fin: {
      validation: 'Permit validation',
      supervisorSignature: 'Supervisor signature',
      supervisorName: 'Supervisor name',
      supervisorNamePh: 'First and last name',
      supervisorCert: 'Supervisor certification',
      supervisorCertPh: 'Certification number',
      validFrom: 'Permit valid from',
      validTo: 'Permit valid to',
      permittedWork: 'Permitted work',
      permittedWorkPh: 'Description of permitted work…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Special conditions or restrictions…',
      notes: 'Final notes',
      notesPh: 'Observations or special conditions…',
      signAndActivate: 'Sign and activate',
      signAndClose: 'Sign and close',
      save: 'Save',
      reopen: 'Reopen',
    },
    warnings: {
      noLocation: 'Work location not specified',
      noEquipment: 'Equipment not identified',
      noVoltage: 'Voltage not specified',
      noPPECat: 'PPE category not determined',
      noIsoSteps: 'No isolation steps defined',
      noZeroVerify: 'Zero energy verification missing',
    },
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generatePermitNumber(province: ProvinceCode): string {
  return `EL-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function createDefaultPermit(province: ProvinceCode): ElectricalPermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    siteInfo: {
      projectNumber: '', workLocation: '', contractor: '', supervisor: '',
      entryDate: '', duration: '', workerCount: 1, workDescription: '',
      equipmentId: '', equipmentName: '', panelId: '', voltage: 0, current: 0,
      systemType: '', drawingRef: '',
    },
    arcFlash: {
      arcFlashLabelPresent: false, incidentEnergy: 0, workingDistance: 0,
      ppeCategory: '', arcFlashBoundary: 0, limitedApproach: 0, restrictedApproach: 0,
      arcFlashNotes: '', assessmentDate: '', assessedBy: '',
    },
    isolation: {
      deEnergizationRequired: true, steps: [], lotoRef: '', tagoutOnly: false,
      energizedWorkJustification: '', zeroEnergyVerified: false, verifiedBy: '', verifiedAt: '',
    },
    ppe: {
      arcFlashSuit: false, suitCalRating: 0, faceShield: false, shieldCalRating: 0,
      insulatingGloves: false, gloveVoltageClass: '', safetyGlasses: false,
      hardHat: false, hardHatClass: '', safetyBoots: false,
      arcFlashHood: false, cottonUnderwear: false, tools: [], additionalPPE: '',
    },
    supervisor_name: '', supervisor_cert: '', permit_valid_from: '', permit_valid_to: '',
    permitted_work: '', restrictions: '', finalization_notes: '',
    validation: { isComplete: false, percentage: 0 },
  };
}

function computeCompletion(permit: ElectricalPermit): number {
  let score = 0;
  if (permit.siteInfo.workLocation) score++;
  if (permit.siteInfo.equipmentName) score++;
  if (permit.siteInfo.voltage > 0) score++;
  if (permit.arcFlash.ppeCategory) score++;
  if (permit.isolation.steps.length > 0) score++;
  if (permit.isolation.zeroEnergyVerified || !permit.isolation.deEnergizationRequired) score++;
  return Math.round((score / 6) * 100);
}

// ── Shared sub-components (used across sections) ───────────────────────────
function Card({ title, icon, accent = 'text-yellow-600', children }: {
  title: string; icon: React.ReactNode; accent?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className={accent}>{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', disabled = false }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
      >
        <option value="">—</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled = false }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-yellow-500' : 'bg-slate-300 dark:bg-slate-600'} disabled:opacity-50`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function Checkbox({ label, checked, onChange, disabled = false }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-yellow-500 rounded disabled:opacity-50"
      />
      <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
    </label>
  );
}

// ── Section: Site ──────────────────────────────────────────────────────────
function SiteSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: ElectricalPermit; readOnly: boolean;
  onUpdate: (patch: Partial<ElectricalPermit['siteInfo']>) => void;
}) {
  const t = T[language];
  const ts = t.site;
  const si = permitData.siteInfo;
  const prov = permitData.province;

  const systemTypeOptions = Object.entries(ts.systemTypes).map(([k, v]) => ({ value: k, label: v }));

  const provincialReg: Record<ProvinceCode, string> = {
    QC: ts.regQC, ON: ts.regON, BC: ts.regBC, AB: ts.regAB,
    SK: ts.regNote, MB: ts.regNote, NB: ts.regNote, NS: ts.regNote, PE: ts.regNote, NL: ts.regNote,
  };

  return (
    <div>
      <Card title={ts.cardProject} icon={<MapPin className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={ts.projectNumber} value={si.projectNumber} onChange={v => onUpdate({ projectNumber: v })} disabled={readOnly} />
          <InputField label={ts.workLocation} value={si.workLocation} onChange={v => onUpdate({ workLocation: v })} disabled={readOnly} />
          <InputField label={ts.contractor} value={si.contractor} onChange={v => onUpdate({ contractor: v })} disabled={readOnly} />
          <InputField label={ts.supervisor} value={si.supervisor} onChange={v => onUpdate({ supervisor: v })} disabled={readOnly} />
          <InputField label={ts.entryDate} value={si.entryDate} type="datetime-local" onChange={v => onUpdate({ entryDate: v })} disabled={readOnly} />
          <InputField label={ts.duration} value={si.duration} onChange={v => onUpdate({ duration: v })} placeholder="ex: 4h" disabled={readOnly} />
          <InputField label={ts.workerCount} value={si.workerCount} type="number" onChange={v => onUpdate({ workerCount: Number(v) })} disabled={readOnly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{ts.workDescription}</label>
          <textarea
            value={si.workDescription}
            onChange={e => onUpdate({ workDescription: e.target.value })}
            rows={3}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>

      <Card title={ts.cardEquipment} icon={<Zap className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={ts.equipmentId} value={si.equipmentId} onChange={v => onUpdate({ equipmentId: v })} disabled={readOnly} />
          <InputField label={ts.equipmentName} value={si.equipmentName} onChange={v => onUpdate({ equipmentName: v })} disabled={readOnly} />
          <InputField label={ts.panelId} value={si.panelId} onChange={v => onUpdate({ panelId: v })} disabled={readOnly} />
          <InputField label={ts.voltage} value={si.voltage || ''} type="number" onChange={v => onUpdate({ voltage: Number(v) })} disabled={readOnly} />
          <InputField label={ts.current} value={si.current || ''} type="number" onChange={v => onUpdate({ current: Number(v) })} disabled={readOnly} />
          <SelectField label={ts.systemType} value={si.systemType} onChange={v => onUpdate({ systemType: v })} options={systemTypeOptions} disabled={readOnly} />
          <InputField label={ts.drawingRef} value={si.drawingRef} onChange={v => onUpdate({ drawingRef: v })} disabled={readOnly} />
        </div>
      </Card>

      <Card title={ts.cardReg} icon={<FileText className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-medium text-yellow-700 dark:text-yellow-400">{t.standard}</p>
          <p>{ts.regNote}</p>
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
            <strong>{prov}:</strong> {provincialReg[prov] ?? ts.regNote}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Arc Flash ─────────────────────────────────────────────────────
function ArcFlashSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: ElectricalPermit; readOnly: boolean;
  onUpdate: (patch: Partial<ElectricalPermit['arcFlash']>) => void;
}) {
  const t = T[language];
  const ta = t.af;
  const af = permitData.arcFlash;

  const ppeCatOptions = [
    { value: 'cat1', label: ta.cats.cat1 },
    { value: 'cat2', label: ta.cats.cat2 },
    { value: 'cat3', label: ta.cats.cat3 },
    { value: 'cat4', label: ta.cats.cat4 },
    { value: 'unknown', label: ta.cats.unknown },
  ];

  const catColors: Record<string, string> = {
    cat1: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
    cat2: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
    cat3: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
    cat4: 'bg-rose-100 dark:bg-rose-900/30 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-300',
    unknown: 'bg-slate-50 dark:bg-slate-700/30 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
  };

  const catDescMap: Record<string, string> = {
    cat1: ta.catDesc.cat1, cat2: ta.catDesc.cat2,
    cat3: ta.catDesc.cat3, cat4: ta.catDesc.cat4, unknown: ta.catDesc.unknown,
  };

  return (
    <div>
      <Card title={ta.cardLabel} icon={<Zap className="w-5 h-5" />}>
        <Toggle
          label={ta.labelPresent}
          checked={af.arcFlashLabelPresent}
          onChange={v => onUpdate({ arcFlashLabelPresent: v })}
          disabled={readOnly}
        />
        {af.arcFlashLabelPresent && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
            {language === 'fr'
              ? "Étiquette présente — utilisez les données de l'étiquette pour compléter l'évaluation ci-dessous."
              : 'Label present — use label data to complete the assessment below.'}
          </div>
        )}
      </Card>

      <Card title={ta.cardEval} icon={<Zap className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={ta.incidentEnergy} value={af.incidentEnergy || ''} type="number" onChange={v => onUpdate({ incidentEnergy: Number(v) })} disabled={readOnly} />
          <InputField label={ta.workingDistance} value={af.workingDistance || ''} type="number" onChange={v => onUpdate({ workingDistance: Number(v) })} disabled={readOnly} />
        </div>
        <SelectField label={ta.ppeCategory} value={af.ppeCategory} onChange={v => onUpdate({ ppeCategory: v })} options={ppeCatOptions} disabled={readOnly} />
        {af.ppeCategory && catDescMap[af.ppeCategory] && (
          <div className={`mt-1 p-3 rounded-lg border text-sm font-medium ${catColors[af.ppeCategory] ?? ''}`}>
            {catDescMap[af.ppeCategory]}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <InputField label={ta.arcFlashBoundary} value={af.arcFlashBoundary || ''} type="number" onChange={v => onUpdate({ arcFlashBoundary: Number(v) })} disabled={readOnly} />
          <InputField label={ta.limitedApproach} value={af.limitedApproach || ''} type="number" onChange={v => onUpdate({ limitedApproach: Number(v) })} disabled={readOnly} />
          <InputField label={ta.restrictedApproach} value={af.restrictedApproach || ''} type="number" onChange={v => onUpdate({ restrictedApproach: Number(v) })} disabled={readOnly} />
        </div>
      </Card>

      {!permitData.isolation.deEnergizationRequired && (
        <Card title={ta.cardEnergized} icon={<AlertTriangle className="w-5 h-5" />} accent="text-amber-500">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{ta.energizedJust}</label>
            <textarea
              value={af.arcFlashNotes}
              onChange={e => onUpdate({ arcFlashNotes: e.target.value })}
              placeholder={ta.energizedJustPh}
              rows={3}
              disabled={readOnly}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
            />
          </div>
        </Card>
      )}

      <Card title={ta.cardDetails} icon={<FileText className="w-5 h-5" />} accent="text-slate-500">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={ta.assessmentDate} value={af.assessmentDate} type="date" onChange={v => onUpdate({ assessmentDate: v })} disabled={readOnly} />
          <InputField label={ta.assessedBy} value={af.assessedBy} onChange={v => onUpdate({ assessedBy: v })} disabled={readOnly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{ta.notes}</label>
          <textarea
            value={af.arcFlashNotes}
            onChange={e => onUpdate({ arcFlashNotes: e.target.value })}
            placeholder={ta.notesPh}
            rows={3}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>
    </div>
  );
}

// ── Section: Isolation ─────────────────────────────────────────────────────
function IsolationSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: ElectricalPermit; readOnly: boolean;
  onUpdate: (patch: Partial<ElectricalPermit['isolation']>) => void;
}) {
  const t = T[language];
  const ti = t.iso;
  const iso = permitData.isolation;

  const addStep = () => {
    const newStep: IsolationStep = {
      id: generateId(),
      step: iso.steps.length + 1,
      description: '',
      isolationPoint: '',
      responsible: '',
      verified: false,
    };
    onUpdate({ steps: [...iso.steps, newStep] });
  };

  const updateStep = (id: string, patch: Partial<IsolationStep>) => {
    onUpdate({ steps: iso.steps.map(s => s.id === id ? { ...s, ...patch } : s) });
  };

  const removeStep = (id: string) => {
    const filtered = iso.steps.filter(s => s.id !== id).map((s, i) => ({ ...s, step: i + 1 }));
    onUpdate({ steps: filtered });
  };

  return (
    <div>
      <Card title={ti.cardDe} icon={<Lock className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle label={ti.deRequired} checked={iso.deEnergizationRequired} onChange={v => onUpdate({ deEnergizationRequired: v })} disabled={readOnly} />
          <Toggle label={ti.tagoutOnly} checked={iso.tagoutOnly} onChange={v => onUpdate({ tagoutOnly: v })} disabled={readOnly} />
          <InputField label={ti.lotoRef} value={iso.lotoRef} onChange={v => onUpdate({ lotoRef: v })} disabled={readOnly} />
          {!iso.deEnergizationRequired && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {language === 'fr'
                    ? "Travail sous tension — une justification est requise dans l'onglet Arc Flash."
                    : 'Energized work — justification required in the Arc Flash tab.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title={ti.cardSteps} icon={<Lock className="w-5 h-5" />}>
        {iso.steps.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            {language === 'fr' ? 'Aucune étape définie.' : 'No steps defined.'}
          </p>
        )}
        <div className="space-y-4">
          {iso.steps.map(step => (
            <div key={step.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {ti.stepNum} {step.step}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    aria-label={t.remove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label={ti.stepDesc} value={step.description} onChange={v => updateStep(step.id, { description: v })} disabled={readOnly} />
                <InputField label={ti.stepPoint} value={step.isolationPoint} onChange={v => updateStep(step.id, { isolationPoint: v })} disabled={readOnly} />
                <InputField label={ti.stepResp} value={step.responsible} onChange={v => updateStep(step.id, { responsible: v })} disabled={readOnly} />
                <div className="flex items-end pb-1">
                  <Checkbox label={ti.stepVerified} checked={step.verified} onChange={v => updateStep(step.id, { verified: v })} disabled={readOnly} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addStep}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {ti.addStep}
          </button>
        )}
      </Card>

      <Card title={ti.cardZero} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle label={ti.zeroVerified} checked={iso.zeroEnergyVerified} onChange={v => onUpdate({ zeroEnergyVerified: v })} disabled={readOnly} />
          {iso.zeroEnergyVerified && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={ti.verifiedBy} value={iso.verifiedBy} onChange={v => onUpdate({ verifiedBy: v })} disabled={readOnly} />
              <InputField label={ti.verifiedAt} value={iso.verifiedAt} type="datetime-local" onChange={v => onUpdate({ verifiedAt: v })} disabled={readOnly} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Section: PPE ───────────────────────────────────────────────────────────
function PPESection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: ElectricalPermit; readOnly: boolean;
  onUpdate: (patch: Partial<ElectricalPermit['ppe']>) => void;
}) {
  const t = T[language];
  const tp = t.ppe;
  const ppe = permitData.ppe;

  const gloveOptions = Object.entries(tp.gloveClasses).map(([k, v]) => ({ value: k, label: v }));
  const hardHatOptions = Object.entries(tp.hardHatClasses).map(([k, v]) => ({ value: k, label: v }));

  const toggleTool = (tool: string) => {
    const tools = ppe.tools.includes(tool)
      ? ppe.tools.filter(t => t !== tool)
      : [...ppe.tools, tool];
    onUpdate({ tools });
  };

  // Use the correct tool names from the current language
  const toolNames = tp.tools;

  return (
    <div>
      <Card title={tp.cardArcFlash} icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle label={tp.arcFlashSuit} checked={ppe.arcFlashSuit} onChange={v => onUpdate({ arcFlashSuit: v })} disabled={readOnly} />
          {ppe.arcFlashSuit && (
            <InputField label={tp.suitCal} value={ppe.suitCalRating || ''} type="number" onChange={v => onUpdate({ suitCalRating: Number(v) })} disabled={readOnly} />
          )}
          <Toggle label={tp.faceShield} checked={ppe.faceShield} onChange={v => onUpdate({ faceShield: v })} disabled={readOnly} />
          {ppe.faceShield && (
            <InputField label={tp.shieldCal} value={ppe.shieldCalRating || ''} type="number" onChange={v => onUpdate({ shieldCalRating: Number(v) })} disabled={readOnly} />
          )}
          <Toggle label={tp.insulatingGloves} checked={ppe.insulatingGloves} onChange={v => onUpdate({ insulatingGloves: v })} disabled={readOnly} />
          {ppe.insulatingGloves && (
            <SelectField label={tp.gloveClass} value={ppe.gloveVoltageClass} onChange={v => onUpdate({ gloveVoltageClass: v })} options={gloveOptions} disabled={readOnly} />
          )}
          <Toggle label={tp.arcFlashHood} checked={ppe.arcFlashHood} onChange={v => onUpdate({ arcFlashHood: v })} disabled={readOnly} />
          <Toggle label={tp.cottonUnderwear} checked={ppe.cottonUnderwear} onChange={v => onUpdate({ cottonUnderwear: v })} disabled={readOnly} />
        </div>
      </Card>

      <Card title={tp.cardBasic} icon={<Shield className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-3">
          <Toggle label={tp.safetyGlasses} checked={ppe.safetyGlasses} onChange={v => onUpdate({ safetyGlasses: v })} disabled={readOnly} />
          <Toggle label={tp.hardHat} checked={ppe.hardHat} onChange={v => onUpdate({ hardHat: v })} disabled={readOnly} />
          {ppe.hardHat && (
            <SelectField label={tp.hardHatClass} value={ppe.hardHatClass} onChange={v => onUpdate({ hardHatClass: v })} options={hardHatOptions} disabled={readOnly} />
          )}
          <Toggle label={tp.safetyBoots} checked={ppe.safetyBoots} onChange={v => onUpdate({ safetyBoots: v })} disabled={readOnly} />
        </div>
      </Card>

      <Card title={tp.cardTools} icon={<Zap className="w-5 h-5" />}>
        <div className="space-y-2 mb-4">
          {toolNames.map(tool => (
            <Checkbox
              key={tool}
              label={tool}
              checked={ppe.tools.includes(tool)}
              onChange={() => !readOnly && toggleTool(tool)}
              disabled={readOnly}
            />
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{tp.additionalPPE}</label>
          <textarea
            value={ppe.additionalPPE}
            onChange={e => onUpdate({ additionalPPE: e.target.value })}
            placeholder={tp.additionalPPEPh}
            rows={3}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>
    </div>
  );
}

// ── Section: Finalization ──────────────────────────────────────────────────
function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language; permit: ElectricalPermit; completion: number;
  readOnly: boolean; onUpdate: (updater: (p: ElectricalPermit) => ElectricalPermit) => void; onSave: () => void;
}) {
  const t = T[language];
  const tf = t.fin;
  const tw = t.warnings;

  const field = (key: keyof ElectricalPermit, val: string) =>
    onUpdate(p => ({ ...p, [key]: val }));

  const setStatus = (status: PermitStatus) =>
    onUpdate(p => ({ ...p, status }));

  const warnings: string[] = [];
  if (!permit.siteInfo.workLocation) warnings.push(tw.noLocation);
  if (!permit.siteInfo.equipmentName) warnings.push(tw.noEquipment);
  if (!permit.siteInfo.voltage) warnings.push(tw.noVoltage);
  if (!permit.arcFlash.ppeCategory) warnings.push(tw.noPPECat);
  if (permit.isolation.steps.length === 0) warnings.push(tw.noIsoSteps);
  if (permit.isolation.deEnergizationRequired && !permit.isolation.zeroEnergyVerified) warnings.push(tw.noZeroVerify);

  return (
    <div>
      <Card title={tf.validation} icon={<BarChart3 className="w-5 h-5" />}>
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

      <Card title={tf.supervisorSignature} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={tf.supervisorName} value={permit.supervisor_name} onChange={v => field('supervisor_name', v)} placeholder={tf.supervisorNamePh} disabled={readOnly} />
          <InputField label={tf.supervisorCert} value={permit.supervisor_cert} onChange={v => field('supervisor_cert', v)} placeholder={tf.supervisorCertPh} disabled={readOnly} />
          <InputField label={tf.validFrom} value={permit.permit_valid_from} type="datetime-local" onChange={v => field('permit_valid_from', v)} disabled={readOnly} />
          <InputField label={tf.validTo} value={permit.permit_valid_to} type="datetime-local" onChange={v => field('permit_valid_to', v)} disabled={readOnly} />
        </div>
      </Card>

      <Card title={tf.permittedWork} icon={<FileText className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-4">
          {([
            { key: 'permitted_work' as const, label: tf.permittedWork, ph: tf.permittedWorkPh },
            { key: 'restrictions' as const, label: tf.restrictions, ph: tf.restrictionsPh },
            { key: 'finalization_notes' as const, label: tf.notes, ph: tf.notesPh },
          ] as const).map(({ key, label, ph }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
              <textarea
                value={permit[key]}
                onChange={e => field(key, e.target.value)}
                placeholder={ph}
                rows={3}
                disabled={readOnly}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-yellow-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
              />
            </div>
          ))}
        </div>
      </Card>

      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          {permit.status === 'draft' && (
            <button
              type="button"
              onClick={() => { setStatus('active'); onSave(); }}
              disabled={completion < 60}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {tf.signAndActivate}
            </button>
          )}
          {permit.status === 'active' && (
            <button
              type="button"
              onClick={() => { setStatus('completed'); onSave(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {tf.signAndClose}
            </button>
          )}
          {(permit.status === 'completed' || permit.status === 'cancelled') && (
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {tf.reopen}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {tf.save}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Electrical({
  tenant = 'demo',
  language = 'fr',
  selectedProvince = 'QC',
  enableAutoSave = true,
  onSave,
  onCancel,
  readOnly = false,
  initialData,
}: ElectricalProps) {
  const t = T[language];

  const [permit, setPermit] = useState<ElectricalPermit>(() => ({
    ...createDefaultPermit(selectedProvince),
    ...initialData,
  }));
  const [section, setSection] = useState<Section>('site');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync province
  useEffect(() => {
    setPermit(p => ({ ...p, province: selectedProvince }));
  }, [selectedProvince]);

  // Auto-save
  const persistPermit = useCallback(async (data: ElectricalPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'electrical',
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
    saveTimer.current = setTimeout(() => persistPermit(permit), 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [permit, enableAutoSave, persistPermit]);

  // Close menu on outside click
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

  const updatePermit = useCallback((updater: (prev: ElectricalPermit) => ElectricalPermit) => {
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
    a.href = url;
    a.download = `${permit.permit_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completion = computeCompletion(permit);

  const SECTIONS: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: 'site', icon: <MapPin className="w-4 h-4" />, label: t.sections.site },
    { id: 'arcFlash', icon: <Zap className="w-4 h-4" />, label: t.sections.arcFlash },
    { id: 'isolation', icon: <Lock className="w-4 h-4" />, label: t.sections.isolation },
    { id: 'ppe', icon: <Shield className="w-4 h-4" />, label: t.sections.ppe },
    { id: 'finalization', icon: <CheckCircle className="w-4 h-4" />, label: t.sections.finalization },
  ];

  const statusColors: Record<PermitStatus, string> = {
    draft: 'bg-slate-100 text-slate-600',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">

        {/* Row 1 */}
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
            <Zap className="w-5 h-5 text-yellow-600 shrink-0" />
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
              <BarChart3 className="w-3.5 h-3.5" />
              {completion}%
            </span>
            <span className={`hidden sm:block text-xs font-medium ${saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'saving' ? 'text-blue-500' : saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
              {saveStatus !== 'idle' ? t.save[saveStatus] : ''}
            </span>

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
                    <Save className="w-4 h-4 text-slate-400" />
                    {t.menu.saveNow}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => { exportJson(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4 text-slate-400" />
                    {t.menu.exportJson}
                  </button>
                  <button type="button" onClick={() => { window.print(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Printer className="w-4 h-4 text-slate-400" />
                    {t.menu.print}
                  </button>
                  <hr className="my-1 border-slate-100 dark:border-slate-700" />
                  <button type="button" onClick={() => {
                    setPermit(createDefaultPermit(selectedProvince));
                    setSection('site');
                    setMenuOpen(false);
                  }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Plus className="w-4 h-4 text-slate-400" />
                    {t.menu.newPermit}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: tabs + progress */}
        <div className="flex items-center gap-1 px-4 pb-0 lg:px-6 overflow-x-auto scrollbar-none">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                section === s.id
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">

          {section === 'site' && (
            <SiteSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, siteInfo: { ...p.siteInfo, ...patch } }))}
            />
          )}

          {section === 'arcFlash' && (
            <ArcFlashSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, arcFlash: { ...p.arcFlash, ...patch } }))}
            />
          )}

          {section === 'isolation' && (
            <IsolationSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, isolation: { ...p.isolation, ...patch } }))}
            />
          )}

          {section === 'ppe' && (
            <PPESection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, ppe: { ...p.ppe, ...patch } }))}
            />
          )}

          {section === 'finalization' && (
            <FinalizationSection
              language={language}
              permit={permit}
              completion={completion}
              readOnly={readOnly}
              onUpdate={updatePermit}
              onSave={handleSaveNow}
            />
          )}
        </div>
      </main>
    </div>
  );
}
