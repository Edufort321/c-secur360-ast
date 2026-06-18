'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Flame, Shield, CheckCircle, Menu, X, Save, Download,
  Printer, Plus, ChevronRight, AlertTriangle, Home, FileText,
  BarChart3, Trash2, Users
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { EntitySearch, type EntityOption } from '@/components/ui/EntitySearch';
import { useTenantDirectory } from '@/lib/useTenantDirectory';

// ── Supabase (best-effort) ─────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Types ──────────────────────────────────────────────────────────────────
export type Language = 'fr' | 'en';
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface HotWorkPermit {
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
    hotWorkType: string;
    equipmentType: string;
    equipmentModel: string;
    operatorCert: string;
  };
  hazards: {
    combustibles: string[];
    combustibleDistance: number;
    isolationDescription: string;
    gasPresent: boolean;
    gasTested: boolean;
    lelPercentage: number;
    ventilationRequired: boolean;
    floorDrainsNearby: boolean;
    confinedSpaceNearby: boolean;
    overheadHazards: boolean;
    hazardNotes: string;
  };
  precautions: {
    fireWatchRequired: boolean;
    fireWatchDuration: number;
    fireWatchPerson: string;
    extinguisherLocation: string;
    extinguisherType: string;
    extinguisherInspected: boolean;
    protectiveBlankets: boolean;
    screens: boolean;
    sprinklersProtected: boolean;
    ventilationType: string;
    ventilationNotes: string;
  };
  authorization: {
    authorizedBy: string;
    authorizationDate: string;
    permitValidFrom: string;
    permitValidTo: string;
    authorizedArea: string;
    workers: Array<{ id: string; name: string; certification: string; company: string }>;
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

interface HotWorkProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<HotWorkPermit>;
}

type Section = 'site' | 'hazards' | 'precautions' | 'authorization' | 'finalization';

// ── Helpers ────────────────────────────────────────────────────────────────
function generatePermitNumber(province: ProvinceCode, prefix: string): string {
  return `${prefix}-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis Travaux à Chaud',
    sections: {
      site: 'Site',
      hazards: 'Dangers',
      precautions: 'Précautions',
      authorization: 'Autorisation',
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
      unsaved: 'Non enregistré',
    },
    status: {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Complété',
      cancelled: 'Annulé',
    },
    back: 'Retour aux permis',
    // Site section
    site: {
      projectInfo: 'Informations du projet',
      projectNumber: 'Numéro de projet',
      projectNumberPh: 'PRJ-2025-001',
      workLocation: 'Lieu des travaux *',
      workLocationPh: 'Bâtiment A, salle des chaudières',
      contractor: 'Entrepreneur',
      contractorPh: 'Nom de la compagnie',
      supervisor: 'Superviseur *',
      supervisorPh: 'Prénom et nom',
      entryDate: 'Date de début',
      duration: 'Durée prévue',
      durationPh: '4 heures',
      workerCount: 'Nombre de travailleurs',
      workDescription: 'Description des travaux',
      workDescriptionPh: 'Décrire les travaux à effectuer…',
      hotWorkType: 'Type de travail à chaud',
      hotWorkCard: 'Type de travail à chaud',
      equipmentType: "Type d'équipement",
      equipmentTypePh: 'Poste à souder TIG',
      equipmentModel: "Modèle d'équipement",
      equipmentModelPh: 'Miller TIG 200',
      operatorCert: "Certification de l'opérateur",
      operatorCertPh: 'CWB N° 12345',
      regCard: 'Réglementation provinciale',
      hotWorkTypes: [
        { value: '', label: '— Sélectionner —' },
        { value: 'soudage_electrique', label: 'Soudage électrique' },
        { value: 'soudage_oxygaz', label: 'Soudage oxygaz' },
        { value: 'coupe_oxygaz', label: 'Coupe oxygaz' },
        { value: 'meulage', label: 'Meulage' },
        { value: 'brasage', label: 'Brasage' },
        { value: 'soudage_thermite', label: 'Soudage thermite' },
        { value: 'autre', label: 'Autre' },
      ],
    },
    hazards: {
      combustiblesCard: 'Matières combustibles/inflammables (rayon 11 m)',
      combustibleItems: [
        { value: 'bois_carton', label: 'Bois / carton / papier' },
        { value: 'carburants_huiles', label: 'Carburants / huiles' },
        { value: 'peintures_solvants', label: 'Peintures / solvants' },
        { value: 'plastiques_caoutchouc', label: 'Plastiques / caoutchouc' },
        { value: 'gaz_combustibles', label: 'Gaz combustibles' },
        { value: 'poussieres', label: 'Poussières combustibles' },
        { value: 'produits_chimiques', label: 'Produits chimiques' },
      ],
      combustibleDistance: 'Distance des matières combustibles (m)',
      isolationDescription: "Description des mesures d'isolation",
      isolationDescriptionPh: 'Écrans, couvertures ignifugées, retrait des matières…',
      atmosphereCard: 'Atmosphère',
      gasPresent: 'Gaz ou vapeurs inflammables présents',
      gasTested: 'Atmosphère testée (détecteur de gaz)',
      lelPercentage: 'LEL mesuré (%)',
      ventilationRequired: 'Ventilation requise',
      adjacentCard: 'Dangers adjacents',
      floorDrainsNearby: 'Drains de plancher à proximité',
      confinedSpaceNearby: 'Espace clos à proximité',
      overheadHazards: 'Dangers en hauteur',
      hazardNotes: 'Notes sur les dangers',
      hazardNotesPh: 'Observations sur les conditions de danger…',
    },
    precautions: {
      fireWatchCard: 'Surveillance incendie',
      fireWatchRequired: 'Surveillance incendie requise',
      fireWatchDuration: 'Durée de surveillance post-travaux (heures)',
      fireWatchPerson: 'Responsable de la surveillance',
      fireWatchPersonPh: 'Prénom et nom',
      fireWatchNote: 'Minimum 30 minutes de surveillance après la fin des travaux à chaud.',
      extCard: 'Extinction incendie',
      extLocation: "Emplacement de l'extincteur",
      extLocationPh: 'À 5 m au nord-est du poste de soudage',
      extType: "Type d'extincteur",
      extInspected: 'Extincteur inspecté',
      extTypes: [
        { value: '', label: '— Sélectionner —' },
        { value: 'eau', label: 'Eau (classe A)' },
        { value: 'mousse', label: 'Mousse (classe A/B)' },
        { value: 'poudre', label: 'Poudre ABC' },
        { value: 'co2', label: 'CO₂ (classe B/C)' },
        { value: 'halotron', label: 'Halotron (propre)' },
      ],
      physicalCard: 'Protection physique',
      protectiveBlankets: 'Couvertures de protection ignifugées',
      screens: 'Écrans de protection',
      sprinklersProtected: 'Gicleurs protégés',
      ventCard: 'Ventilation',
      ventType: 'Type de ventilation',
      ventNotes: 'Notes sur la ventilation',
      ventNotesPh: 'Précisions sur les mesures de ventilation…',
      ventTypes: [
        { value: '', label: '— Sélectionner —' },
        { value: 'naturelle', label: 'Naturelle' },
        { value: 'mecanique_forcee', label: 'Mécanique forcée' },
        { value: 'aspiration_locale', label: 'Aspiration locale' },
        { value: 'mixte', label: 'Mixte' },
      ],
    },
    authorization: {
      authCard: 'Autorisation',
      authorizedBy: 'Autorisé par *',
      authorizedByPh: 'Prénom et nom du responsable SST',
      authDate: "Date d'autorisation",
      validFrom: 'Permis valide du',
      validTo: "Permis valide jusqu'au",
      authorizedArea: 'Zone autorisée',
      authorizedAreaPh: 'Périmètre exact des travaux autorisés…',
      workersCard: 'Travailleurs autorisés',
      addWorker: 'Ajouter un travailleur',
      workerName: 'Nom',
      workerNamePh: 'Prénom et nom',
      workerCert: 'Certification',
      workerCertPh: 'N° de certification',
      workerCompany: 'Entreprise',
      workerCompanyPh: 'Nom de la compagnie',
      workerCount: 'travailleur(s)',
    },
    finalization: {
      title: 'Finalisation du permis',
      supervisorSignature: 'Signature du superviseur',
      supervisorName: 'Nom du superviseur',
      supervisorNamePh: 'Prénom et nom',
      supervisorCert: 'Certification superviseur',
      supervisorCertPh: 'N° de certification',
      validFrom: 'Permis valide du',
      validTo: "Permis valide jusqu'au",
      validation: 'Validation du permis',
      permittedWork: 'Travaux autorisés',
      permittedWorkPh: 'Description des travaux permis…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Conditions ou restrictions particulières…',
      notes: 'Notes finales',
      notesPh: 'Notes, observations ou conditions particulières…',
      signAndActivate: 'Signer et activer',
      signAndClose: 'Signer et fermer',
      reopen: 'Rouvrir',
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
  },
  en: {
    title: 'Hot Work Permit',
    sections: {
      site: 'Site',
      hazards: 'Hazards',
      precautions: 'Precautions',
      authorization: 'Authorization',
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
      unsaved: 'Unsaved',
    },
    status: {
      draft: 'Draft',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    back: 'Back to permits',
    site: {
      projectInfo: 'Project information',
      projectNumber: 'Project number',
      projectNumberPh: 'PRJ-2025-001',
      workLocation: 'Work location *',
      workLocationPh: 'Building A, boiler room',
      contractor: 'Contractor',
      contractorPh: 'Company name',
      supervisor: 'Supervisor *',
      supervisorPh: 'First and last name',
      entryDate: 'Start date',
      duration: 'Estimated duration',
      durationPh: '4 hours',
      workerCount: 'Number of workers',
      workDescription: 'Work description',
      workDescriptionPh: 'Describe the work to be performed…',
      hotWorkType: 'Hot work type',
      hotWorkCard: 'Hot work type',
      equipmentType: 'Equipment type',
      equipmentTypePh: 'TIG welder',
      equipmentModel: 'Equipment model',
      equipmentModelPh: 'Miller TIG 200',
      operatorCert: 'Operator certification',
      operatorCertPh: 'CWB No. 12345',
      regCard: 'Provincial regulations',
      hotWorkTypes: [
        { value: '', label: '— Select —' },
        { value: 'soudage_electrique', label: 'Electric welding' },
        { value: 'soudage_oxygaz', label: 'Oxy-gas welding' },
        { value: 'coupe_oxygaz', label: 'Oxy-gas cutting' },
        { value: 'meulage', label: 'Grinding' },
        { value: 'brasage', label: 'Brazing' },
        { value: 'soudage_thermite', label: 'Thermite welding' },
        { value: 'autre', label: 'Other' },
      ],
    },
    hazards: {
      combustiblesCard: 'Combustible/flammable materials (11 m radius)',
      combustibleItems: [
        { value: 'bois_carton', label: 'Wood / cardboard / paper' },
        { value: 'carburants_huiles', label: 'Fuels / oils' },
        { value: 'peintures_solvants', label: 'Paints / solvents' },
        { value: 'plastiques_caoutchouc', label: 'Plastics / rubber' },
        { value: 'gaz_combustibles', label: 'Combustible gases' },
        { value: 'poussieres', label: 'Combustible dusts' },
        { value: 'produits_chimiques', label: 'Chemical products' },
      ],
      combustibleDistance: 'Distance to combustibles (m)',
      isolationDescription: 'Isolation measures description',
      isolationDescriptionPh: 'Screens, fire blankets, removal of materials…',
      atmosphereCard: 'Atmosphere',
      gasPresent: 'Flammable gas or vapours present',
      gasTested: 'Atmosphere tested (gas detector)',
      lelPercentage: 'Measured LEL (%)',
      ventilationRequired: 'Ventilation required',
      adjacentCard: 'Adjacent hazards',
      floorDrainsNearby: 'Floor drains nearby',
      confinedSpaceNearby: 'Confined space nearby',
      overheadHazards: 'Overhead hazards',
      hazardNotes: 'Hazard notes',
      hazardNotesPh: 'Observations on hazard conditions…',
    },
    precautions: {
      fireWatchCard: 'Fire watch',
      fireWatchRequired: 'Fire watch required',
      fireWatchDuration: 'Post-work watch duration (hours)',
      fireWatchPerson: 'Fire watch person',
      fireWatchPersonPh: 'First and last name',
      fireWatchNote: 'Minimum 30 minutes of fire watch after hot work is completed.',
      extCard: 'Fire extinguisher',
      extLocation: 'Extinguisher location',
      extLocationPh: '5 m northeast of welding station',
      extType: 'Extinguisher type',
      extInspected: 'Extinguisher inspected',
      extTypes: [
        { value: '', label: '— Select —' },
        { value: 'eau', label: 'Water (class A)' },
        { value: 'mousse', label: 'Foam (class A/B)' },
        { value: 'poudre', label: 'ABC dry powder' },
        { value: 'co2', label: 'CO₂ (class B/C)' },
        { value: 'halotron', label: 'Halotron (clean agent)' },
      ],
      physicalCard: 'Physical protection',
      protectiveBlankets: 'Fire-resistant protective blankets',
      screens: 'Protective screens',
      sprinklersProtected: 'Sprinklers protected',
      ventCard: 'Ventilation',
      ventType: 'Ventilation type',
      ventNotes: 'Ventilation notes',
      ventNotesPh: 'Details on ventilation measures…',
      ventTypes: [
        { value: '', label: '— Select —' },
        { value: 'naturelle', label: 'Natural' },
        { value: 'mecanique_forcee', label: 'Forced mechanical' },
        { value: 'aspiration_locale', label: 'Local exhaust' },
        { value: 'mixte', label: 'Mixed' },
      ],
    },
    authorization: {
      authCard: 'Authorization',
      authorizedBy: 'Authorized by *',
      authorizedByPh: 'HSE officer first and last name',
      authDate: 'Authorization date',
      validFrom: 'Permit valid from',
      validTo: 'Permit valid to',
      authorizedArea: 'Authorized area',
      authorizedAreaPh: 'Exact perimeter of authorized work…',
      workersCard: 'Authorized workers',
      addWorker: 'Add worker',
      workerName: 'Name',
      workerNamePh: 'First and last name',
      workerCert: 'Certification',
      workerCertPh: 'Certification number',
      workerCompany: 'Company',
      workerCompanyPh: 'Company name',
      workerCount: 'worker(s)',
    },
    finalization: {
      title: 'Permit finalization',
      supervisorSignature: 'Supervisor signature',
      supervisorName: 'Supervisor name',
      supervisorNamePh: 'First and last name',
      supervisorCert: 'Supervisor certification',
      supervisorCertPh: 'Certification number',
      validFrom: 'Permit valid from',
      validTo: 'Permit valid to',
      validation: 'Permit validation',
      permittedWork: 'Permitted work',
      permittedWorkPh: 'Description of permitted work…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Special conditions or restrictions…',
      notes: 'Final notes',
      notesPh: 'Notes, observations or special conditions…',
      signAndActivate: 'Sign and activate',
      signAndClose: 'Sign and close',
      reopen: 'Reopen',
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
  },
} as const;

// ── Provincial regulations ─────────────────────────────────────────────────
const PROVINCIAL_REGS: Record<ProvinceCode, { fr: string; en: string }> = {
  QC: {
    fr: 'RSST, art. 311 — Travaux à chaud dans espaces clos / section chalumeau. LSST, art. 51.',
    en: 'RSST, art. 311 — Hot work in confined spaces / torch section. LSST, art. 51.',
  },
  ON: {
    fr: 'O. Reg. 851, Section 67 — Travaux à chaud en milieu de travail.',
    en: 'O. Reg. 851, Section 67 — Hot work in workplaces.',
  },
  BC: {
    fr: 'OHS Regulation Part 12.6 — Travaux à chaud.',
    en: 'OHS Regulation Part 12.6 — Hot work.',
  },
  AB: {
    fr: 'OHS Code Part 10 — Travaux à chaud et contrôle des ignitions.',
    en: 'OHS Code Part 10 — Hot work and ignition control.',
  },
  SK: {
    fr: 'OHS Regulations, Part VI — Travaux à chaud.',
    en: 'OHS Regulations, Part VI — Hot work.',
  },
  MB: {
    fr: 'Règlement sur la sécurité et la santé au travail, art. 43.',
    en: 'Workplace Safety and Health Regulation, s. 43.',
  },
  NB: {
    fr: 'Règlement général 91-191, art. 55 — Travaux à chaud.',
    en: 'General Regulation 91-191, s. 55 — Hot work.',
  },
  NS: {
    fr: 'OHS General Regulations, Part 15 — Soudage et coupage.',
    en: 'OHS General Regulations, Part 15 — Welding and cutting.',
  },
  PE: {
    fr: 'OHS Act Regulations, Section 44 — Travaux à chaud.',
    en: 'OHS Act Regulations, Section 44 — Hot work.',
  },
  NL: {
    fr: 'OHS Regulations, Part XIV — Soudage et coupage à chaud.',
    en: 'OHS Regulations, Part XIV — Welding and hot cutting.',
  },
};

// ── Default permit ─────────────────────────────────────────────────────────
function createDefaultPermit(province: ProvinceCode): HotWorkPermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province, 'HW'),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    siteInfo: {
      projectNumber: '',
      workLocation: '',
      contractor: '',
      supervisor: '',
      entryDate: '',
      duration: '',
      workerCount: 1,
      workDescription: '',
      hotWorkType: '',
      equipmentType: '',
      equipmentModel: '',
      operatorCert: '',
    },
    hazards: {
      combustibles: [],
      combustibleDistance: 11,
      isolationDescription: '',
      gasPresent: false,
      gasTested: false,
      lelPercentage: 0,
      ventilationRequired: false,
      floorDrainsNearby: false,
      confinedSpaceNearby: false,
      overheadHazards: false,
      hazardNotes: '',
    },
    precautions: {
      fireWatchRequired: true,
      fireWatchDuration: 0.5,
      fireWatchPerson: '',
      extinguisherLocation: '',
      extinguisherType: '',
      extinguisherInspected: false,
      protectiveBlankets: false,
      screens: false,
      sprinklersProtected: false,
      ventilationType: '',
      ventilationNotes: '',
    },
    authorization: {
      authorizedBy: '',
      authorizationDate: '',
      permitValidFrom: '',
      permitValidTo: '',
      authorizedArea: '',
      workers: [],
    },
    supervisor_name: '',
    supervisor_cert: '',
    permit_valid_from: '',
    permit_valid_to: '',
    permitted_work: '',
    restrictions: '',
    finalization_notes: '',
    validation: { isComplete: false, percentage: 0 },
  };
}

// ── Completion ─────────────────────────────────────────────────────────────
function computeCompletion(permit: HotWorkPermit): number {
  let score = 0;
  if (permit.siteInfo.workLocation) score++;
  if (permit.siteInfo.supervisor) score++;
  if (permit.siteInfo.hotWorkType) score++;
  if (permit.hazards.combustibles.length > 0) score++;
  if (!permit.precautions.fireWatchRequired || permit.precautions.fireWatchPerson) score++;
  if (permit.authorization.authorizedBy) score++;
  return Math.round((score / 6) * 100);
}

// ── Shared Card + Input primitives ─────────────────────────────────────────
function Card({ title, icon, children, accent = 'orange' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string;
}) {
  const iconColor = accent === 'orange' ? 'text-orange-600' : 'text-slate-700';
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className={iconColor}>{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
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

function TextInput({ value, onChange, placeholder = '', disabled = false, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

function NumberInput({ value, onChange, disabled = false, min }: {
  value: number; onChange: (v: number) => void; disabled?: boolean; min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      disabled={disabled}
      min={min}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

function SelectInput({ value, onChange, options, disabled = false }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label, disabled = false }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-orange-600"
        disabled={disabled}
      />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function Textarea({ value, onChange, placeholder = '', rows = 3, disabled = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

// ── Section: Site ──────────────────────────────────────────────────────────
function SiteSection({ language, permit, readOnly, onUpdate, personnel, projects }: {
  language: Language;
  permit: HotWorkPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: HotWorkPermit) => HotWorkPermit) => void;
  personnel: EntityOption[];
  projects: EntityOption[];
}) {
  const t = T[language];
  const ts = t.site;
  const si = permit.siteInfo;

  const upd = (key: keyof typeof si, value: any) =>
    onUpdate(p => ({ ...p, siteInfo: { ...p.siteInfo, [key]: value } }));

  const reg = PROVINCIAL_REGS[permit.province];

  return (
    <div>
      <Card title={ts.projectInfo} icon={<MapPin className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={ts.projectNumber}>
            <EntitySearch value={si.projectNumber} placeholder={ts.projectNumberPh} readOnly={readOnly}
              options={projects} onText={v => upd('projectNumber', v)} onPick={o => upd('projectNumber', o.label)} />
          </Field>
          <Field label={ts.workLocation}>
            <TextInput value={si.workLocation} onChange={v => upd('workLocation', v)} placeholder={ts.workLocationPh} disabled={readOnly} />
          </Field>
          <Field label={ts.contractor}>
            <TextInput value={si.contractor} onChange={v => upd('contractor', v)} placeholder={ts.contractorPh} disabled={readOnly} />
          </Field>
          <Field label={ts.supervisor}>
            <EntitySearch value={si.supervisor} placeholder={ts.supervisorPh} readOnly={readOnly}
              options={personnel} onText={v => upd('supervisor', v)} onPick={o => upd('supervisor', o.label)} />
          </Field>
          <Field label={ts.entryDate}>
            <TextInput type="date" value={si.entryDate} onChange={v => upd('entryDate', v)} disabled={readOnly} />
          </Field>
          <Field label={ts.duration}>
            <TextInput value={si.duration} onChange={v => upd('duration', v)} placeholder={ts.durationPh} disabled={readOnly} />
          </Field>
          <Field label={ts.workerCount}>
            <NumberInput value={si.workerCount} onChange={v => upd('workerCount', v)} min={1} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={ts.workDescription}>
              <Textarea value={si.workDescription} onChange={v => upd('workDescription', v)} placeholder={ts.workDescriptionPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={ts.hotWorkCard} icon={<Flame className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={ts.hotWorkType}>
              <SelectInput value={si.hotWorkType} onChange={v => upd('hotWorkType', v)} options={ts.hotWorkTypes as any} disabled={readOnly} />
            </Field>
          </div>
          <Field label={ts.equipmentType}>
            <TextInput value={si.equipmentType} onChange={v => upd('equipmentType', v)} placeholder={ts.equipmentTypePh} disabled={readOnly} />
          </Field>
          <Field label={ts.equipmentModel}>
            <TextInput value={si.equipmentModel} onChange={v => upd('equipmentModel', v)} placeholder={ts.equipmentModelPh} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={ts.operatorCert}>
              <TextInput value={si.operatorCert} onChange={v => upd('operatorCert', v)} placeholder={ts.operatorCertPh} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={ts.regCard} icon={<FileText className="w-5 h-5" />}>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg px-4 py-3 text-sm text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <p className="font-semibold mb-1">{t.provinces[permit.province]}</p>
          <p>{language === 'fr' ? reg.fr : reg.en}</p>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Hazards ───────────────────────────────────────────────────────
function HazardsSection({ language, permit, readOnly, onUpdate }: {
  language: Language;
  permit: HotWorkPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: HotWorkPermit) => HotWorkPermit) => void;
}) {
  const t = T[language].hazards;
  const h = permit.hazards;

  const upd = (key: keyof typeof h, value: any) =>
    onUpdate(p => ({ ...p, hazards: { ...p.hazards, [key]: value } }));

  const toggleCombustible = (val: string) => {
    const next = h.combustibles.includes(val)
      ? h.combustibles.filter(c => c !== val)
      : [...h.combustibles, val];
    upd('combustibles', next);
  };

  return (
    <div>
      <Card title={t.combustiblesCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-3 mb-4">
          {t.combustibleItems.map(item => (
            <Toggle
              key={item.value}
              checked={h.combustibles.includes(item.value)}
              onChange={() => toggleCombustible(item.value)}
              label={item.label}
              disabled={readOnly}
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Field label={t.combustibleDistance}>
            <NumberInput value={h.combustibleDistance} onChange={v => upd('combustibleDistance', v)} min={0} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.isolationDescription}>
              <Textarea value={h.isolationDescription} onChange={v => upd('isolationDescription', v)} placeholder={t.isolationDescriptionPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={t.atmosphereCard} icon={<Wind className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle checked={h.gasPresent} onChange={v => upd('gasPresent', v)} label={t.gasPresent} disabled={readOnly} />
          {h.gasPresent && (
            <div className="ml-6 mt-2 grid gap-4 sm:grid-cols-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <Toggle checked={h.gasTested} onChange={v => upd('gasTested', v)} label={t.gasTested} disabled={readOnly} />
              <Field label={t.lelPercentage}>
                <NumberInput value={h.lelPercentage} onChange={v => upd('lelPercentage', v)} min={0} disabled={readOnly} />
              </Field>
            </div>
          )}
          <Toggle checked={h.ventilationRequired} onChange={v => upd('ventilationRequired', v)} label={t.ventilationRequired} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.adjacentCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle checked={h.floorDrainsNearby} onChange={v => upd('floorDrainsNearby', v)} label={t.floorDrainsNearby} disabled={readOnly} />
          <Toggle checked={h.confinedSpaceNearby} onChange={v => upd('confinedSpaceNearby', v)} label={t.confinedSpaceNearby} disabled={readOnly} />
          <Toggle checked={h.overheadHazards} onChange={v => upd('overheadHazards', v)} label={t.overheadHazards} disabled={readOnly} />
          <div className="mt-3">
            <Field label={t.hazardNotes}>
              <Textarea value={h.hazardNotes} onChange={v => upd('hazardNotes', v)} placeholder={t.hazardNotesPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Precautions ───────────────────────────────────────────────────
function PrecautionsSection({ language, permit, readOnly, onUpdate, personnel }: {
  language: Language;
  permit: HotWorkPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: HotWorkPermit) => HotWorkPermit) => void;
  personnel: EntityOption[];
}) {
  const t = T[language].precautions;
  const pr = permit.precautions;

  const upd = (key: keyof typeof pr, value: any) =>
    onUpdate(p => ({ ...p, precautions: { ...p.precautions, [key]: value } }));

  return (
    <div>
      <Card title={t.fireWatchCard} icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle checked={pr.fireWatchRequired} onChange={v => upd('fireWatchRequired', v)} label={t.fireWatchRequired} disabled={readOnly} />
          {pr.fireWatchRequired && (
            <div className="ml-6 mt-2 grid gap-4 sm:grid-cols-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <Field label={t.fireWatchDuration}>
                <NumberInput value={pr.fireWatchDuration} onChange={v => upd('fireWatchDuration', v)} min={0.5} disabled={readOnly} />
              </Field>
              <Field label={t.fireWatchPerson}>
                <EntitySearch value={pr.fireWatchPerson} placeholder={t.fireWatchPersonPh} readOnly={readOnly}
                  options={personnel} onText={v => upd('fireWatchPerson', v)} onPick={o => upd('fireWatchPerson', o.label)} />
              </Field>
              <div className="sm:col-span-2">
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{t.fireWatchNote}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title={t.extCard} icon={<Shield className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t.extLocation}>
              <TextInput value={pr.extinguisherLocation} onChange={v => upd('extinguisherLocation', v)} placeholder={t.extLocationPh} disabled={readOnly} />
            </Field>
          </div>
          <Field label={t.extType}>
            <SelectInput value={pr.extinguisherType} onChange={v => upd('extinguisherType', v)} options={t.extTypes as any} disabled={readOnly} />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle checked={pr.extinguisherInspected} onChange={v => upd('extinguisherInspected', v)} label={t.extInspected} disabled={readOnly} />
          </div>
        </div>
      </Card>

      <Card title={t.physicalCard} icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle checked={pr.protectiveBlankets} onChange={v => upd('protectiveBlankets', v)} label={t.protectiveBlankets} disabled={readOnly} />
          <Toggle checked={pr.screens} onChange={v => upd('screens', v)} label={t.screens} disabled={readOnly} />
          <Toggle checked={pr.sprinklersProtected} onChange={v => upd('sprinklersProtected', v)} label={t.sprinklersProtected} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.ventCard} icon={<Wind className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.ventType}>
            <SelectInput value={pr.ventilationType} onChange={v => upd('ventilationType', v)} options={t.ventTypes as any} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.ventNotes}>
              <Textarea value={pr.ventilationNotes} onChange={v => upd('ventilationNotes', v)} placeholder={t.ventNotesPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Section: Authorization ─────────────────────────────────────────────────
function AuthorizationSection({ language, permit, readOnly, onUpdate, personnel }: {
  language: Language;
  permit: HotWorkPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: HotWorkPermit) => HotWorkPermit) => void;
  personnel: EntityOption[];
}) {
  const t = T[language].authorization;
  const auth = permit.authorization;

  const upd = (key: keyof typeof auth, value: any) =>
    onUpdate(p => ({ ...p, authorization: { ...p.authorization, [key]: value } }));

  const addWorker = () => {
    if (readOnly) return;
    const worker = { id: generateId(), name: '', certification: '', company: '' };
    upd('workers', [...auth.workers, worker]);
  };

  const removeWorker = (id: string) => {
    upd('workers', auth.workers.filter(w => w.id !== id));
  };

  const updateWorker = (id: string, key: string, value: string) => {
    upd('workers', auth.workers.map(w => w.id === id ? { ...w, [key]: value } : w));
  };

  return (
    <div>
      <Card title={t.authCard} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t.authorizedBy}>
              <EntitySearch value={auth.authorizedBy} placeholder={t.authorizedByPh} readOnly={readOnly}
                options={personnel} onText={v => upd('authorizedBy', v)} onPick={o => upd('authorizedBy', o.label)} />
            </Field>
          </div>
          <Field label={t.authDate}>
            <TextInput type="date" value={auth.authorizationDate} onChange={v => upd('authorizationDate', v)} disabled={readOnly} />
          </Field>
          <div />
          <Field label={t.validFrom}>
            <TextInput type="datetime-local" value={auth.permitValidFrom} onChange={v => upd('permitValidFrom', v)} disabled={readOnly} />
          </Field>
          <Field label={t.validTo}>
            <TextInput type="datetime-local" value={auth.permitValidTo} onChange={v => upd('permitValidTo', v)} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.authorizedArea}>
              <Textarea value={auth.authorizedArea} onChange={v => upd('authorizedArea', v)} placeholder={t.authorizedAreaPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={t.workersCard} icon={<Users className="w-5 h-5" />}>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            {auth.workers.length} {t.workerCount}
          </span>
          {!readOnly && (
            <button
              type="button"
              onClick={addWorker}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-300 hover:border-orange-400 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addWorker}
            </button>
          )}
        </div>

        {auth.workers.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
            {language === 'fr' ? 'Aucun travailleur ajouté' : 'No workers added'}
          </p>
        ) : (
          <div className="space-y-3">
            {auth.workers.map((worker, idx) => (
              <div key={worker.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                <Field label={`${t.workerName} ${idx + 1}`}>
                  <EntitySearch value={worker.name} placeholder={t.workerNamePh} readOnly={readOnly}
                    options={personnel} onText={v => updateWorker(worker.id, 'name', v)} onPick={o => updateWorker(worker.id, 'name', o.label)} />
                </Field>
                <Field label={t.workerCert}>
                  <TextInput value={worker.certification} onChange={v => updateWorker(worker.id, 'certification', v)} placeholder={t.workerCertPh} disabled={readOnly} />
                </Field>
                <Field label={t.workerCompany}>
                  <TextInput value={worker.company} onChange={v => updateWorker(worker.id, 'company', v)} placeholder={t.workerCompanyPh} disabled={readOnly} />
                </Field>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeWorker(worker.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Section: Finalization ──────────────────────────────────────────────────
function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language;
  permit: HotWorkPermit;
  completion: number;
  readOnly: boolean;
  onUpdate: (updater: (p: HotWorkPermit) => HotWorkPermit) => void;
  onSave: () => void;
}) {
  const t = T[language].finalization;

  const field = (key: keyof HotWorkPermit, val: string) =>
    onUpdate(p => ({ ...p, [key]: val }));

  const setStatus = (status: PermitStatus) =>
    onUpdate(p => ({ ...p, status }));

  const warnings: string[] = [];
  if (!permit.siteInfo.hotWorkType)
    warnings.push(language === 'fr' ? 'Type de travail à chaud non sélectionné' : 'Hot work type not selected');
  if (permit.hazards.combustibles.length === 0)
    warnings.push(language === 'fr' ? 'Aucune matière combustible évaluée' : 'No combustible materials evaluated');
  if (!permit.authorization.authorizedBy)
    warnings.push(language === 'fr' ? 'Autorisation manquante' : 'Authorization missing');
  if (permit.precautions.fireWatchRequired && !permit.precautions.fireWatchPerson)
    warnings.push(language === 'fr' ? 'Responsable de surveillance incendie manquant' : 'Fire watch person missing');

  return (
    <div>
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
              <div key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t.supervisorSignature} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.supervisorName}>
            <TextInput value={permit.supervisor_name} onChange={v => field('supervisor_name', v)} placeholder={t.supervisorNamePh} disabled={readOnly} />
          </Field>
          <Field label={t.supervisorCert}>
            <TextInput value={permit.supervisor_cert} onChange={v => field('supervisor_cert', v)} placeholder={t.supervisorCertPh} disabled={readOnly} />
          </Field>
          <Field label={t.validFrom}>
            <TextInput type="datetime-local" value={permit.permit_valid_from} onChange={v => field('permit_valid_from', v)} disabled={readOnly} />
          </Field>
          <Field label={t.validTo}>
            <TextInput type="datetime-local" value={permit.permit_valid_to} onChange={v => field('permit_valid_to', v)} disabled={readOnly} />
          </Field>
        </div>
      </Card>

      <Card title={t.permittedWork} icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <Field label={t.permittedWork}>
            <Textarea value={permit.permitted_work} onChange={v => field('permitted_work', v)} placeholder={t.permittedWorkPh} rows={3} disabled={readOnly} />
          </Field>
          <Field label={t.restrictions}>
            <Textarea value={permit.restrictions} onChange={v => field('restrictions', v)} placeholder={t.restrictionsPh} rows={3} disabled={readOnly} />
          </Field>
          <Field label={t.notes}>
            <Textarea value={permit.finalization_notes} onChange={v => field('finalization_notes', v)} placeholder={t.notesPh} rows={3} disabled={readOnly} />
          </Field>
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
    </div>
  );
}

// ── Wind icon ──────────────────────────────────────────────────────────────
function Wind(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HotWork({
  tenant = 'demo',
  language = 'fr',
  selectedProvince = 'QC',
  enableAutoSave = true,
  onSave,
  onCancel,
  readOnly = false,
  initialData,
}: HotWorkProps) {
  const t = T[language];

  const [permit, setPermit] = useState<HotWorkPermit>(() => ({
    ...createDefaultPermit(selectedProvince),
    ...initialData,
  }));

  const dir = useTenantDirectory(tenant);
  const [section, setSection] = useState<Section>('site');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Province sync
  useEffect(() => {
    setPermit(p => ({ ...p, province: selectedProvince }));
  }, [selectedProvince]);

  // Persist to Supabase + localStorage
  const persistPermit = useCallback(async (data: HotWorkPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'hot_work',
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

  // Auto-save debounce 2s
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

  const goToSection = (s: Section) => {
    setSection(s);
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const updatePermit = useCallback((updater: (prev: HotWorkPermit) => HotWorkPermit) => {
    setPermit(updater);
  }, []);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(permit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${permit.permit_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await persistPermit(permit);
    if (onSave) onSave(permit);
  };

  const completion = computeCompletion(permit);

  const SECTIONS: { id: Section; icon: React.ReactNode; label: string }[] = [
    { id: 'site', icon: <MapPin className="w-4 h-4" />, label: t.sections.site },
    { id: 'hazards', icon: <AlertTriangle className="w-4 h-4" />, label: t.sections.hazards },
    { id: 'precautions', icon: <Shield className="w-4 h-4" />, label: t.sections.precautions },
    { id: 'authorization', icon: <CheckCircle className="w-4 h-4" />, label: t.sections.authorization },
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

      {/* ── Header ─────────────────────────────────────────────────────── */}
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
            <Flame className="w-5 h-5 text-orange-600 shrink-0" />
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
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {section === 'site' && (
            <SiteSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} personnel={dir.personnel} projects={dir.projects} />
          )}
          {section === 'hazards' && (
            <HazardsSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} />
          )}
          {section === 'precautions' && (
            <PrecautionsSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} personnel={dir.personnel} />
          )}
          {section === 'authorization' && (
            <AuthorizationSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} personnel={dir.personnel} />
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
