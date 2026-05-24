'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, ArrowUp, AlertTriangle, Shield, Wrench, Phone,
  CheckCircle, Menu, X, Save, Download, Printer, Plus,
  ChevronRight, Home, FileText, BarChart3, Trash2,
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

interface AnchorPoint {
  id: string;
  location: string;
  capacity: string;
  type: string;
  inspected: boolean;
}

interface HeightWorkPermit {
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
    workHeight: number;
    structureType: string;
    accessMethod: string;
  };
  hazards: {
    hazardTypes: string[];
    fallDistance: number;
    clearanceBelow: number;
    obstructionsBelow: boolean;
    adjacentHazards: string;
    weatherConditions: string;
    windSpeed: number;
    wetSurfaces: boolean;
    hazardNotes: string;
  };
  fallProtection: {
    systemType: string;
    harnessType: string;
    harnessInspected: boolean;
    harnessInspectedBy: string;
    harnessInspectedDate: string;
    anchorPoints: AnchorPoint[];
    connectingDevice: string;
    lanyardType: string;
    retractableLength: number;
    totalFallDistance: number;
    clearanceCalculated: boolean;
    horizontalLifeline: boolean;
    verticalLifeline: boolean;
    guardRail: boolean;
    safetyNet: boolean;
    notes: string;
  };
  equipment: {
    liftType: string;
    liftModel: string;
    maxHeight: number;
    maxCapacity: number;
    preUseInspection: boolean;
    inspectionDate: string;
    inspectedBy: string;
    defectsFound: boolean;
    defectsDescription: string;
    safeForUse: boolean;
  };
  rescue: {
    rescuePlan: string;
    rescueEquipment: string[];
    rescuePersonnel: string;
    emergencyContact: string;
    emergencyPhone: string;
    hospitalName: string;
    hospitalAddress: string;
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

type Section = 'site' | 'hazards' | 'fallProtection' | 'equipment' | 'rescue' | 'finalization';

interface HeightWorkProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<HeightWorkPermit>;
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis Travail en Hauteur',
    standard: 'CSA Z259',
    back: 'Retour aux permis',
    sections: {
      site: 'Site',
      hazards: 'Dangers',
      fallProtection: 'Protection',
      equipment: 'Équipement',
      rescue: 'Sauvetage',
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
    add: 'Ajouter',
    remove: 'Supprimer',
    yes: 'Oui',
    no: 'Non',
    // site
    site: {
      cardProject: 'Informations du projet',
      cardHeight: 'Détails du travail en hauteur',
      cardReg: 'Réglementation CSA Z259',
      projectNumber: 'Numéro de projet',
      workLocation: 'Lieu des travaux *',
      contractor: 'Entrepreneur',
      supervisor: 'Superviseur *',
      entryDate: "Date d'entrée",
      duration: 'Durée prévue',
      workerCount: 'Nombre de travailleurs',
      workDescription: 'Description des travaux *',
      workHeight: 'Hauteur de travail (m) *',
      structureType: 'Type de structure',
      accessMethod: "Méthode d'accès",
      regNote: 'Ces travaux doivent respecter la norme CSA Z259 et la réglementation provinciale applicable.',
      regQC: 'QC : RSST, articles 323 à 350 — Protection contre les chutes',
      regON: 'ON : O. Reg 213/91 — Construction Projects',
      regAB: 'AB : OHS Code, Part 9 — Fall Protection',
      regBC: 'BC : OHS Regulation, sections 11.1 à 11.6',
      structureTypes: {
        flat: 'Toit plat',
        slope: 'Toit en pente',
        scaffold: 'Échafaudage',
        lift: 'Plateforme élévatrice',
        ladder: 'Échelle',
        tower: 'Pylône',
        walkway: 'Passerelle',
        other: 'Autre',
      },
      accessMethods: {
        ladder: 'Échelle',
        stairs: 'Escalier',
        platform: 'Plateforme',
        mewp: 'PEMP',
        rope: 'Corde',
        other: 'Autre',
      },
    },
    // hazards
    haz: {
      cardTypes: 'Types de dangers en hauteur',
      cardFall: 'Paramètres de chute',
      cardEnv: 'Conditions environnementales',
      hazardTypes: [
        'Bord libre (leading edge)',
        'Trou / ouverture',
        'Toit en pente',
        'Échafaudage',
        'Nacelle / PEMP',
        'Corde / système de câbles',
        'Fragilité surface de travail',
      ],
      fallDistance: 'Distance de chute potentielle (m) *',
      clearanceBelow: 'Dégagement sous le travailleur (m)',
      obstructionsBelow: 'Obstructions en dessous',
      obstructionsDesc: 'Décrivez les obstructions',
      weatherConditions: 'Conditions météorologiques',
      windSpeed: 'Vitesse du vent (km/h)',
      wetSurfaces: 'Surfaces mouillées / glissantes',
      adjacentHazards: 'Dangers adjacents',
      adjacentHazardsPh: 'Lignes électriques, équipements mobiles, ouvertures…',
      hazardNotes: 'Notes sur les dangers',
      hazardNotesPh: 'Observations ou conditions particulières…',
      weather: {
        sunny: 'Ensoleillé',
        cloudy: 'Nuageux',
        rain: 'Pluie',
        snow: 'Neige',
        ice: 'Glace',
        wind: 'Vent fort',
      },
    },
    // fall protection
    fp: {
      cardSystem: 'Système de protection contre les chutes',
      cardHarness: 'Harnais (CSA Z259.10)',
      cardAnchors: "Points d'ancrage (CSA Z259.15)",
      cardConnecting: 'Équipement de connexion',
      cardCollective: 'Systèmes collectifs',
      systemType: 'Type de système *',
      systemTypes: {
        harnessLifeline: 'Harnais + ligne de vie',
        harnessLanyard: 'Harnais + longe autobloquante',
        guardrail: 'Garde-corps',
        safetyNet: 'Filet de sécurité',
        mewp: 'PEMP (nacelle)',
        horizontalLifeline: 'Ligne de vie horizontale',
        restraint: 'Système de retenue',
        rope: 'Système à corde',
      },
      harnessType: 'Type de harnais',
      harnessInspected: 'Harnais inspecté avant utilisation',
      harnessInspectedBy: 'Inspecté par',
      harnessInspectedDate: "Date d'inspection",
      harnessTypes: {
        classA: 'CSA Classe A — Travail général',
        classB: "CSA Classe B — Harnais de sécurité pour travailleurs de l'industrie",
        classD: 'CSA Classe D — Contrôle de la descente',
        classE: 'CSA Classe E — Harnais de siège',
        classAB: 'CSA Classe AB',
        classAE: 'CSA Classe AE',
      },
      anchorLocation: 'Emplacement',
      anchorCapacity: 'Capacité (kN)',
      anchorType: 'Type',
      anchorInspected: 'Inspecté',
      addAnchor: "Ajouter un point d'ancrage",
      anchorTypes: {
        fixed: 'Fixe',
        gantry: 'Portique',
        post: 'Poteau',
        structure: 'Structure',
      },
      connectingDevice: 'Dispositif de connexion',
      lanyardType: 'Type de longe',
      retractableLength: 'Longueur ligne autorétractable (m)',
      totalFallDistance: 'Distance de chute totale (m)',
      clearanceCalc: 'Dégagement calculé et suffisant',
      horizontalLifeline: 'Ligne de vie horizontale',
      verticalLifeline: 'Ligne de vie verticale',
      guardRail: 'Garde-corps',
      safetyNet: 'Filet de sécurité',
      notes: 'Notes protection',
      notesPh: 'Observations, configurations, conditions…',
      connectingDevices: {
        lanyard: 'Longe',
        shockLanyard: "Longe à absorption d'énergie",
        srl: 'Ligne de vie autorétractable',
        positioning: 'Corde de positionnement',
      },
    },
    // equipment
    eq: {
      cardLift: 'Équipement de levage / accès',
      cardInspection: 'Inspection pré-utilisation (CSA B354)',
      liftType: "Type d'équipement",
      liftTypes: {
        scissor: 'PEMP ciseaux',
        articulated: 'PEMP articulé',
        vertical: 'PEMP vertical',
        tubular: 'Échafaudage tubulaire',
        tower: "Tour d'accès",
        suspended: 'Plateforme suspendue',
        none: 'Aucun',
      },
      liftModel: 'Modèle / numéro de série',
      maxHeight: 'Hauteur maximale (m)',
      maxCapacity: 'Capacité maximale (kg)',
      preUseInspection: 'Inspection pré-utilisation effectuée',
      inspectionDate: "Date d'inspection",
      inspectedBy: 'Inspecté par',
      defectsFound: 'Défauts identifiés',
      defectsDescription: 'Description des défauts',
      safeForUse: "Équipement sécuritaire pour l'utilisation",
    },
    // rescue
    res: {
      cardPlan: 'Plan de sauvetage en hauteur',
      cardEquipment: 'Équipement de sauvetage',
      cardContacts: "Contacts d'urgence",
      rescuePlan: 'Plan de sauvetage *',
      rescuePlanPh: "Décrire comment le travailleur sera récupéré en cas d'incapacité en hauteur…",
      rescueEquipment: [
        'Trépied + treuil',
        'Ligne de sauvetage dédiée',
        'Brancardage vertical',
        'Civière / couverture',
        'Défibrillateur (DEA)',
      ],
      rescuePersonnel: 'Personnel de sauvetage désigné',
      emergencyContact: "Nom du contact d'urgence",
      emergencyPhone: "Téléphone d'urgence",
      hospitalName: 'Hôpital le plus proche',
      hospitalAddress: 'Adresse',
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
      noHeight: 'Hauteur de travail non renseignée',
      noHazards: 'Aucun type de danger sélectionné',
      noSystem: 'Type de système de protection non sélectionné',
      noHarnessInspect: 'Inspection du harnais non confirmée',
      noRescuePlan: 'Plan de sauvetage manquant',
    },
  },
  en: {
    title: 'Working at Height Permit',
    standard: 'CSA Z259',
    back: 'Back to permits',
    sections: {
      site: 'Site',
      hazards: 'Hazards',
      fallProtection: 'Protection',
      equipment: 'Equipment',
      rescue: 'Rescue',
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
    add: 'Add',
    remove: 'Remove',
    yes: 'Yes',
    no: 'No',
    site: {
      cardProject: 'Project information',
      cardHeight: 'Height work details',
      cardReg: 'CSA Z259 Regulation',
      projectNumber: 'Project number',
      workLocation: 'Work location *',
      contractor: 'Contractor',
      supervisor: 'Supervisor *',
      entryDate: 'Entry date',
      duration: 'Planned duration',
      workerCount: 'Worker count',
      workDescription: 'Work description *',
      workHeight: 'Work height (m) *',
      structureType: 'Structure type',
      accessMethod: 'Access method',
      regNote: 'This work must comply with CSA Z259 and applicable provincial regulations.',
      regQC: 'QC: RSST, sections 323–350 — Fall Protection',
      regON: 'ON: O. Reg 213/91 — Construction Projects',
      regAB: 'AB: OHS Code, Part 9 — Fall Protection',
      regBC: 'BC: OHS Regulation, sections 11.1–11.6',
      structureTypes: {
        flat: 'Flat roof',
        slope: 'Sloped roof',
        scaffold: 'Scaffold',
        lift: 'Elevated platform',
        ladder: 'Ladder',
        tower: 'Tower/pylon',
        walkway: 'Walkway',
        other: 'Other',
      },
      accessMethods: {
        ladder: 'Ladder',
        stairs: 'Stairs',
        platform: 'Platform',
        mewp: 'MEWP',
        rope: 'Rope',
        other: 'Other',
      },
    },
    haz: {
      cardTypes: 'Types of height hazards',
      cardFall: 'Fall parameters',
      cardEnv: 'Environmental conditions',
      hazardTypes: [
        'Leading edge',
        'Hole / opening',
        'Sloped roof',
        'Scaffold',
        'Aerial lift / MEWP',
        'Rope / cable system',
        'Fragile working surface',
      ],
      fallDistance: 'Potential fall distance (m) *',
      clearanceBelow: 'Clearance below worker (m)',
      obstructionsBelow: 'Obstructions below',
      obstructionsDesc: 'Describe obstructions',
      weatherConditions: 'Weather conditions',
      windSpeed: 'Wind speed (km/h)',
      wetSurfaces: 'Wet / slippery surfaces',
      adjacentHazards: 'Adjacent hazards',
      adjacentHazardsPh: 'Power lines, mobile equipment, openings…',
      hazardNotes: 'Hazard notes',
      hazardNotesPh: 'Observations or special conditions…',
      weather: {
        sunny: 'Sunny',
        cloudy: 'Cloudy',
        rain: 'Rain',
        snow: 'Snow',
        ice: 'Ice',
        wind: 'High winds',
      },
    },
    fp: {
      cardSystem: 'Fall protection system',
      cardHarness: 'Harness (CSA Z259.10)',
      cardAnchors: 'Anchor points (CSA Z259.15)',
      cardConnecting: 'Connecting equipment',
      cardCollective: 'Collective systems',
      systemType: 'System type *',
      systemTypes: {
        harnessLifeline: 'Harness + lifeline',
        harnessLanyard: 'Harness + self-retracting lanyard',
        guardrail: 'Guardrail',
        safetyNet: 'Safety net',
        mewp: 'MEWP (aerial lift)',
        horizontalLifeline: 'Horizontal lifeline',
        restraint: 'Restraint system',
        rope: 'Rope system',
      },
      harnessType: 'Harness type',
      harnessInspected: 'Harness inspected before use',
      harnessInspectedBy: 'Inspected by',
      harnessInspectedDate: 'Inspection date',
      harnessTypes: {
        classA: 'CSA Class A — General work',
        classB: 'CSA Class B — Industrial safety harness',
        classD: 'CSA Class D — Descent control',
        classE: 'CSA Class E — Seat harness',
        classAB: 'CSA Class AB',
        classAE: 'CSA Class AE',
      },
      anchorLocation: 'Location',
      anchorCapacity: 'Capacity (kN)',
      anchorType: 'Type',
      anchorInspected: 'Inspected',
      addAnchor: 'Add anchor point',
      anchorTypes: {
        fixed: 'Fixed',
        gantry: 'Gantry',
        post: 'Post',
        structure: 'Structure',
      },
      connectingDevice: 'Connecting device',
      lanyardType: 'Lanyard type',
      retractableLength: 'Self-retracting lifeline length (m)',
      totalFallDistance: 'Total fall distance (m)',
      clearanceCalc: 'Clearance calculated and sufficient',
      horizontalLifeline: 'Horizontal lifeline',
      verticalLifeline: 'Vertical lifeline',
      guardRail: 'Guardrail',
      safetyNet: 'Safety net',
      notes: 'Protection notes',
      notesPh: 'Observations, configurations, conditions…',
      connectingDevices: {
        lanyard: 'Lanyard',
        shockLanyard: 'Energy-absorbing lanyard',
        srl: 'Self-retracting lifeline',
        positioning: 'Positioning lanyard',
      },
    },
    eq: {
      cardLift: 'Lifting / access equipment',
      cardInspection: 'Pre-use inspection (CSA B354)',
      liftType: 'Equipment type',
      liftTypes: {
        scissor: 'Scissor lift',
        articulated: 'Articulated boom lift',
        vertical: 'Vertical lift',
        tubular: 'Tube scaffold',
        tower: 'Access tower',
        suspended: 'Suspended platform',
        none: 'None',
      },
      liftModel: 'Model / serial number',
      maxHeight: 'Maximum height (m)',
      maxCapacity: 'Maximum capacity (kg)',
      preUseInspection: 'Pre-use inspection completed',
      inspectionDate: 'Inspection date',
      inspectedBy: 'Inspected by',
      defectsFound: 'Defects identified',
      defectsDescription: 'Defect description',
      safeForUse: 'Equipment safe for use',
    },
    res: {
      cardPlan: 'Height rescue plan',
      cardEquipment: 'Rescue equipment',
      cardContacts: 'Emergency contacts',
      rescuePlan: 'Rescue plan *',
      rescuePlanPh: 'Describe how an incapacitated worker will be retrieved from height…',
      rescueEquipment: [
        'Tripod + winch',
        'Dedicated rescue lifeline',
        'Vertical stretcher',
        'Stretcher / blanket',
        'AED / defibrillator',
      ],
      rescuePersonnel: 'Designated rescue personnel',
      emergencyContact: 'Emergency contact name',
      emergencyPhone: 'Emergency phone',
      hospitalName: 'Nearest hospital',
      hospitalAddress: 'Address',
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
      noHeight: 'Work height not specified',
      noHazards: 'No hazard types selected',
      noSystem: 'Fall protection system type not selected',
      noHarnessInspect: 'Harness inspection not confirmed',
      noRescuePlan: 'Rescue plan missing',
    },
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generatePermitNumber(province: ProvinceCode): string {
  return `HT-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function createDefaultPermit(province: ProvinceCode): HeightWorkPermit {
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
      workHeight: 0, structureType: '', accessMethod: '',
    },
    hazards: {
      hazardTypes: [], fallDistance: 0, clearanceBelow: 0, obstructionsBelow: false,
      adjacentHazards: '', weatherConditions: '', windSpeed: 0, wetSurfaces: false, hazardNotes: '',
    },
    fallProtection: {
      systemType: '', harnessType: '', harnessInspected: false,
      harnessInspectedBy: '', harnessInspectedDate: '', anchorPoints: [],
      connectingDevice: '', lanyardType: '', retractableLength: 0,
      totalFallDistance: 0, clearanceCalculated: false,
      horizontalLifeline: false, verticalLifeline: false, guardRail: false, safetyNet: false,
      notes: '',
    },
    equipment: {
      liftType: '', liftModel: '', maxHeight: 0, maxCapacity: 0,
      preUseInspection: false, inspectionDate: '', inspectedBy: '',
      defectsFound: false, defectsDescription: '', safeForUse: false,
    },
    rescue: {
      rescuePlan: '', rescueEquipment: [], rescuePersonnel: '',
      emergencyContact: '', emergencyPhone: '', hospitalName: '', hospitalAddress: '',
    },
    supervisor_name: '', supervisor_cert: '', permit_valid_from: '', permit_valid_to: '',
    permitted_work: '', restrictions: '', finalization_notes: '',
    validation: { isComplete: false, percentage: 0 },
  };
}

function computeCompletion(permit: HeightWorkPermit): number {
  let score = 0;
  if (permit.siteInfo.workLocation) score++;
  if (permit.siteInfo.workHeight > 0) score++;
  if (permit.hazards.hazardTypes.length > 0) score++;
  if (permit.fallProtection.systemType) score++;
  if (permit.fallProtection.harnessInspected) score++;
  if (permit.rescue.rescuePlan) score++;
  return Math.round((score / 6) * 100);
}

// ── Shared sub-components ──────────────────────────────────────────────────
function Card({ title, icon, accent = 'text-blue-600', children }: {
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
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'} disabled:opacity-50`}
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
        className="w-4 h-4 accent-blue-500 rounded disabled:opacity-50"
      />
      <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
    </label>
  );
}

// ── Section: Site ──────────────────────────────────────────────────────────
function SiteSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: HeightWorkPermit; readOnly: boolean;
  onUpdate: (patch: Partial<HeightWorkPermit['siteInfo']>) => void;
}) {
  const t = T[language];
  const ts = t.site;
  const si = permitData.siteInfo;
  const prov = permitData.province;

  const structureOptions = Object.entries(ts.structureTypes).map(([k, v]) => ({ value: k, label: v }));
  const accessOptions = Object.entries(ts.accessMethods).map(([k, v]) => ({ value: k, label: v }));

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
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>

      <Card title={ts.cardHeight} icon={<ArrowUp className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField label={ts.workHeight} value={si.workHeight || ''} type="number" onChange={v => onUpdate({ workHeight: Number(v) })} disabled={readOnly} />
          <SelectField label={ts.structureType} value={si.structureType} onChange={v => onUpdate({ structureType: v })} options={structureOptions} disabled={readOnly} />
          <SelectField label={ts.accessMethod} value={si.accessMethod} onChange={v => onUpdate({ accessMethod: v })} options={accessOptions} disabled={readOnly} />
        </div>
      </Card>

      <Card title={ts.cardReg} icon={<FileText className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-medium text-blue-700 dark:text-blue-400">{t.standard}</p>
          <p>{ts.regNote}</p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
            <strong>{prov}:</strong> {provincialReg[prov] ?? ts.regNote}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Hazards ───────────────────────────────────────────────────────
function HazardsSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: HeightWorkPermit; readOnly: boolean;
  onUpdate: (patch: Partial<HeightWorkPermit['hazards']>) => void;
}) {
  const t = T[language];
  const th = t.haz;
  const haz = permitData.hazards;

  const toggleHazardType = (type: string) => {
    const types = haz.hazardTypes.includes(type)
      ? haz.hazardTypes.filter(x => x !== type)
      : [...haz.hazardTypes, type];
    onUpdate({ hazardTypes: types });
  };

  const weatherOptions = Object.entries(th.weather).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div>
      <Card title={th.cardTypes} icon={<AlertTriangle className="w-5 h-5" />} accent="text-amber-500">
        <div className="grid gap-2 sm:grid-cols-2">
          {th.hazardTypes.map(type => (
            <Checkbox
              key={type}
              label={type}
              checked={haz.hazardTypes.includes(type)}
              onChange={() => !readOnly && toggleHazardType(type)}
              disabled={readOnly}
            />
          ))}
        </div>
      </Card>

      <Card title={th.cardFall} icon={<ArrowUp className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={th.fallDistance} value={haz.fallDistance || ''} type="number" onChange={v => onUpdate({ fallDistance: Number(v) })} disabled={readOnly} />
          <InputField label={th.clearanceBelow} value={haz.clearanceBelow || ''} type="number" onChange={v => onUpdate({ clearanceBelow: Number(v) })} disabled={readOnly} />
        </div>
        <Toggle label={th.obstructionsBelow} checked={haz.obstructionsBelow} onChange={v => onUpdate({ obstructionsBelow: v })} disabled={readOnly} />
        {haz.obstructionsBelow && (
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{th.obstructionsDesc}</label>
            <textarea
              value={haz.adjacentHazards}
              onChange={e => onUpdate({ adjacentHazards: e.target.value })}
              rows={2}
              disabled={readOnly}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
            />
          </div>
        )}
      </Card>

      <Card title={th.cardEnv} icon={<AlertTriangle className="w-5 h-5" />} accent="text-slate-500">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={th.weatherConditions} value={haz.weatherConditions} onChange={v => onUpdate({ weatherConditions: v })} options={weatherOptions} disabled={readOnly} />
          <InputField label={th.windSpeed} value={haz.windSpeed || ''} type="number" onChange={v => onUpdate({ windSpeed: Number(v) })} disabled={readOnly} />
        </div>
        <Toggle label={th.wetSurfaces} checked={haz.wetSurfaces} onChange={v => onUpdate({ wetSurfaces: v })} disabled={readOnly} />
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{th.adjacentHazards}</label>
          <textarea
            value={haz.adjacentHazards}
            onChange={e => onUpdate({ adjacentHazards: e.target.value })}
            placeholder={th.adjacentHazardsPh}
            rows={2}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{th.hazardNotes}</label>
          <textarea
            value={haz.hazardNotes}
            onChange={e => onUpdate({ hazardNotes: e.target.value })}
            placeholder={th.hazardNotesPh}
            rows={2}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>
    </div>
  );
}

// ── Section: Fall Protection ───────────────────────────────────────────────
function FallProtectionSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: HeightWorkPermit; readOnly: boolean;
  onUpdate: (patch: Partial<HeightWorkPermit['fallProtection']>) => void;
}) {
  const t = T[language];
  const tf = t.fp;
  const fp = permitData.fallProtection;

  const systemOptions = Object.entries(tf.systemTypes).map(([k, v]) => ({ value: k, label: v }));
  const harnessOptions = Object.entries(tf.harnessTypes).map(([k, v]) => ({ value: k, label: v }));
  const connectOptions = Object.entries(tf.connectingDevices).map(([k, v]) => ({ value: k, label: v }));
  const anchorTypeOptions = Object.entries(tf.anchorTypes).map(([k, v]) => ({ value: k, label: v }));

  const addAnchor = () => {
    const newAnchor: AnchorPoint = { id: generateId(), location: '', capacity: '', type: '', inspected: false };
    onUpdate({ anchorPoints: [...fp.anchorPoints, newAnchor] });
  };

  const updateAnchor = (id: string, patch: Partial<AnchorPoint>) => {
    onUpdate({ anchorPoints: fp.anchorPoints.map(a => a.id === id ? { ...a, ...patch } : a) });
  };

  const removeAnchor = (id: string) => {
    onUpdate({ anchorPoints: fp.anchorPoints.filter(a => a.id !== id) });
  };

  return (
    <div>
      <Card title={tf.cardSystem} icon={<Shield className="w-5 h-5" />}>
        <SelectField label={tf.systemType} value={fp.systemType} onChange={v => onUpdate({ systemType: v })} options={systemOptions} disabled={readOnly} />
      </Card>

      <Card title={tf.cardHarness} icon={<Shield className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-3">
          <SelectField label={tf.harnessType} value={fp.harnessType} onChange={v => onUpdate({ harnessType: v })} options={harnessOptions} disabled={readOnly} />
          <Toggle label={tf.harnessInspected} checked={fp.harnessInspected} onChange={v => onUpdate({ harnessInspected: v })} disabled={readOnly} />
          {fp.harnessInspected && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={tf.harnessInspectedBy} value={fp.harnessInspectedBy} onChange={v => onUpdate({ harnessInspectedBy: v })} disabled={readOnly} />
              <InputField label={tf.harnessInspectedDate} value={fp.harnessInspectedDate} type="date" onChange={v => onUpdate({ harnessInspectedDate: v })} disabled={readOnly} />
            </div>
          )}
        </div>
      </Card>

      <Card title={tf.cardAnchors} icon={<ArrowUp className="w-5 h-5" />}>
        {fp.anchorPoints.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">
            {language === 'fr' ? "Aucun point d'ancrage défini." : 'No anchor points defined.'}
          </p>
        )}
        <div className="space-y-4">
          {fp.anchorPoints.map(anchor => (
            <div key={anchor.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {language === 'fr' ? "Point d'ancrage" : 'Anchor point'}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeAnchor(anchor.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label={tf.anchorLocation} value={anchor.location} onChange={v => updateAnchor(anchor.id, { location: v })} disabled={readOnly} />
                <InputField label={tf.anchorCapacity} value={anchor.capacity} type="number" onChange={v => updateAnchor(anchor.id, { capacity: v })} disabled={readOnly} />
                <SelectField label={tf.anchorType} value={anchor.type} onChange={v => updateAnchor(anchor.id, { type: v })} options={anchorTypeOptions} disabled={readOnly} />
                <div className="flex items-end pb-1">
                  <Checkbox label={tf.anchorInspected} checked={anchor.inspected} onChange={v => updateAnchor(anchor.id, { inspected: v })} disabled={readOnly} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addAnchor}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {tf.addAnchor}
          </button>
        )}
      </Card>

      <Card title={tf.cardConnecting} icon={<Shield className="w-5 h-5" />} accent="text-slate-500">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={tf.connectingDevice} value={fp.connectingDevice} onChange={v => onUpdate({ connectingDevice: v })} options={connectOptions} disabled={readOnly} />
          <InputField label={tf.lanyardType} value={fp.lanyardType} onChange={v => onUpdate({ lanyardType: v })} disabled={readOnly} />
          <InputField label={tf.retractableLength} value={fp.retractableLength || ''} type="number" onChange={v => onUpdate({ retractableLength: Number(v) })} disabled={readOnly} />
          <InputField label={tf.totalFallDistance} value={fp.totalFallDistance || ''} type="number" onChange={v => onUpdate({ totalFallDistance: Number(v) })} disabled={readOnly} />
        </div>
        <Toggle label={tf.clearanceCalc} checked={fp.clearanceCalculated} onChange={v => onUpdate({ clearanceCalculated: v })} disabled={readOnly} />
        {fp.totalFallDistance > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
            {language === 'fr'
              ? `Distance de chute totale : ${fp.totalFallDistance} m (hauteur harnais + longe + décélération)`
              : `Total fall distance: ${fp.totalFallDistance} m (harness height + lanyard + deceleration)`}
          </div>
        )}
      </Card>

      <Card title={tf.cardCollective} icon={<Shield className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-3">
          <Toggle label={tf.horizontalLifeline} checked={fp.horizontalLifeline} onChange={v => onUpdate({ horizontalLifeline: v })} disabled={readOnly} />
          <Toggle label={tf.verticalLifeline} checked={fp.verticalLifeline} onChange={v => onUpdate({ verticalLifeline: v })} disabled={readOnly} />
          <Toggle label={tf.guardRail} checked={fp.guardRail} onChange={v => onUpdate({ guardRail: v })} disabled={readOnly} />
          <Toggle label={tf.safetyNet} checked={fp.safetyNet} onChange={v => onUpdate({ safetyNet: v })} disabled={readOnly} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{tf.notes}</label>
          <textarea
            value={fp.notes}
            onChange={e => onUpdate({ notes: e.target.value })}
            placeholder={tf.notesPh}
            rows={3}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>
    </div>
  );
}

// ── Section: Equipment ─────────────────────────────────────────────────────
function EquipmentSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: HeightWorkPermit; readOnly: boolean;
  onUpdate: (patch: Partial<HeightWorkPermit['equipment']>) => void;
}) {
  const t = T[language];
  const te = t.eq;
  const eq = permitData.equipment;

  const liftOptions = Object.entries(te.liftTypes).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div>
      <Card title={te.cardLift} icon={<Wrench className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={te.liftType} value={eq.liftType} onChange={v => onUpdate({ liftType: v })} options={liftOptions} disabled={readOnly} />
          <InputField label={te.liftModel} value={eq.liftModel} onChange={v => onUpdate({ liftModel: v })} disabled={readOnly} />
          <InputField label={te.maxHeight} value={eq.maxHeight || ''} type="number" onChange={v => onUpdate({ maxHeight: Number(v) })} disabled={readOnly} />
          <InputField label={te.maxCapacity} value={eq.maxCapacity || ''} type="number" onChange={v => onUpdate({ maxCapacity: Number(v) })} disabled={readOnly} />
        </div>
      </Card>

      <Card title={te.cardInspection} icon={<CheckCircle className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-3">
          <Toggle label={te.preUseInspection} checked={eq.preUseInspection} onChange={v => onUpdate({ preUseInspection: v })} disabled={readOnly} />
          {eq.preUseInspection && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={te.inspectionDate} value={eq.inspectionDate} type="date" onChange={v => onUpdate({ inspectionDate: v })} disabled={readOnly} />
              <InputField label={te.inspectedBy} value={eq.inspectedBy} onChange={v => onUpdate({ inspectedBy: v })} disabled={readOnly} />
            </div>
          )}
          <Toggle label={te.defectsFound} checked={eq.defectsFound} onChange={v => onUpdate({ defectsFound: v })} disabled={readOnly} />
          {eq.defectsFound && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{te.defectsDescription}</label>
              <textarea
                value={eq.defectsDescription}
                onChange={e => onUpdate({ defectsDescription: e.target.value })}
                rows={3}
                disabled={readOnly}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
              />
            </div>
          )}
          <Toggle label={te.safeForUse} checked={eq.safeForUse} onChange={v => onUpdate({ safeForUse: v })} disabled={readOnly} />
        </div>
      </Card>
    </div>
  );
}

// ── Section: Rescue ────────────────────────────────────────────────────────
function RescueSection({ language, permitData, readOnly, onUpdate }: {
  language: Language; permitData: HeightWorkPermit; readOnly: boolean;
  onUpdate: (patch: Partial<HeightWorkPermit['rescue']>) => void;
}) {
  const t = T[language];
  const tr = t.res;
  const rescue = permitData.rescue;

  const toggleEquipment = (item: string) => {
    const eq = rescue.rescueEquipment.includes(item)
      ? rescue.rescueEquipment.filter(e => e !== item)
      : [...rescue.rescueEquipment, item];
    onUpdate({ rescueEquipment: eq });
  };

  return (
    <div>
      <Card title={tr.cardPlan} icon={<Phone className="w-5 h-5" />}>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{tr.rescuePlan}</label>
          <textarea
            value={rescue.rescuePlan}
            onChange={e => onUpdate({ rescuePlan: e.target.value })}
            placeholder={tr.rescuePlanPh}
            rows={5}
            disabled={readOnly}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
          />
        </div>
      </Card>

      <Card title={tr.cardEquipment} icon={<Shield className="w-5 h-5" />} accent="text-slate-500">
        <div className="space-y-2">
          {tr.rescueEquipment.map(item => (
            <Checkbox
              key={item}
              label={item}
              checked={rescue.rescueEquipment.includes(item)}
              onChange={() => !readOnly && toggleEquipment(item)}
              disabled={readOnly}
            />
          ))}
        </div>
      </Card>

      <Card title={tr.cardContacts} icon={<Phone className="w-5 h-5" />} accent="text-slate-500">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label={tr.rescuePersonnel} value={rescue.rescuePersonnel} onChange={v => onUpdate({ rescuePersonnel: v })} disabled={readOnly} />
          <InputField label={tr.emergencyContact} value={rescue.emergencyContact} onChange={v => onUpdate({ emergencyContact: v })} disabled={readOnly} />
          <InputField label={tr.emergencyPhone} value={rescue.emergencyPhone} type="tel" onChange={v => onUpdate({ emergencyPhone: v })} disabled={readOnly} />
          <InputField label={tr.hospitalName} value={rescue.hospitalName} onChange={v => onUpdate({ hospitalName: v })} disabled={readOnly} />
          <div className="sm:col-span-2">
            <InputField label={tr.hospitalAddress} value={rescue.hospitalAddress} onChange={v => onUpdate({ hospitalAddress: v })} disabled={readOnly} />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Finalization ──────────────────────────────────────────────────
function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language; permit: HeightWorkPermit; completion: number;
  readOnly: boolean; onUpdate: (updater: (p: HeightWorkPermit) => HeightWorkPermit) => void; onSave: () => void;
}) {
  const t = T[language];
  const tf = t.fin;
  const tw = t.warnings;

  const field = (key: keyof HeightWorkPermit, val: string) =>
    onUpdate(p => ({ ...p, [key]: val }));

  const setStatus = (status: PermitStatus) =>
    onUpdate(p => ({ ...p, status }));

  const warnings: string[] = [];
  if (!permit.siteInfo.workLocation) warnings.push(tw.noLocation);
  if (!permit.siteInfo.workHeight) warnings.push(tw.noHeight);
  if (permit.hazards.hazardTypes.length === 0) warnings.push(tw.noHazards);
  if (!permit.fallProtection.systemType) warnings.push(tw.noSystem);
  if (!permit.fallProtection.harnessInspected) warnings.push(tw.noHarnessInspect);
  if (!permit.rescue.rescuePlan) warnings.push(tw.noRescuePlan);

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
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
export default function HeightWork({
  tenant = 'demo',
  language = 'fr',
  selectedProvince = 'QC',
  enableAutoSave = true,
  onSave,
  onCancel,
  readOnly = false,
  initialData,
}: HeightWorkProps) {
  const t = T[language];

  const [permit, setPermit] = useState<HeightWorkPermit>(() => ({
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
  const persistPermit = useCallback(async (data: HeightWorkPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'height_work',
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

  const updatePermit = useCallback((updater: (prev: HeightWorkPermit) => HeightWorkPermit) => {
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
    { id: 'hazards', icon: <AlertTriangle className="w-4 h-4" />, label: t.sections.hazards },
    { id: 'fallProtection', icon: <Shield className="w-4 h-4" />, label: t.sections.fallProtection },
    { id: 'equipment', icon: <Wrench className="w-4 h-4" />, label: t.sections.equipment },
    { id: 'rescue', icon: <Phone className="w-4 h-4" />, label: t.sections.rescue },
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
            <ArrowUp className="w-5 h-5 text-blue-600 shrink-0" />
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
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

          {section === 'hazards' && (
            <HazardsSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, hazards: { ...p.hazards, ...patch } }))}
            />
          )}

          {section === 'fallProtection' && (
            <FallProtectionSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, fallProtection: { ...p.fallProtection, ...patch } }))}
            />
          )}

          {section === 'equipment' && (
            <EquipmentSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, equipment: { ...p.equipment, ...patch } }))}
            />
          )}

          {section === 'rescue' && (
            <RescueSection
              language={language}
              permitData={permit}
              readOnly={readOnly}
              onUpdate={patch => updatePermit(p => ({ ...p, rescue: { ...p.rescue, ...patch } }))}
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
