'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { currentTenantSlug } from "@/lib/tenantSlug";
import {
  MapPin, FlaskConical, Shield, Phone, CheckCircle,
  Menu, X, Save, Download, Printer, Plus, ChevronRight, Home,
  FileText, BarChart3, Trash2, AlertTriangle, TrendingDown
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

export interface ChemicalPermit {
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
    facilityType: string;
    storageArea: string;
  };
  substances: Array<{
    id: string;
    name: string;
    casNumber: string;
    unNumber: string;
    whmisClass: string;
    physicalState: string;
    quantity: number;
    unit: string;
    sdsRef: string;
    sdsDate: string;
    tlv: string;
    stel: string;
    idlh: string;
    flashPoint: string;
    autoIgnition: string;
    explosive: boolean;
    flammable: boolean;
    toxic: boolean;
    corrosive: boolean;
  }>;
  exposureControl: {
    engineeringControls: string[];
    adminControls: string[];
    ventilationType: string;
    airMonitoringRequired: boolean;
    airMonitoringFrequency: string;
    exposureLimit: string;
    whmisTraining: boolean;
    whmisTrainingDate: string;
  };
  ppe: {
    respiratory: string;
    respiratorType: string;
    respiratorCartridge: string;
    fitTestDate: string;
    gloves: string;
    gloveMaterial: string;
    gloveThickness: string;
    protectiveSuit: string;
    suitType: string;
    eyeFace: string[];
    footProtection: string;
    additionalPPE: string;
  };
  emergency: {
    spillProcedure: string;
    spillKit: boolean;
    spillKitLocation: string;
    firstAidMeasures: string;
    eyewashStation: boolean;
    eyewashLocation: string;
    emergencyContact: string;
    emergencyPhone: string;
    poisonControlPhone: string;
    hospitalName: string;
    hospitalAddress: string;
    evacuationZone: number;
    evacuationProcedure: string;
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

type Section = 'site' | 'substances' | 'exposureControl' | 'ppe' | 'emergency' | 'finalization';

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generatePermitNumber(province: ProvinceCode, prefix = 'CH'): string {
  return `${prefix}-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function computeCompletion(permit: ChemicalPermit): number {
  let score = 0;
  if (permit.siteInfo.workLocation) score++;
  if (permit.substances.length > 0) score++;
  if (permit.exposureControl.engineeringControls.length > 0) score++;
  if (permit.ppe.respiratory) score++;
  if (permit.emergency.spillProcedure) score++;
  if (permit.emergency.emergencyPhone) score++;
  return Math.round((score / 6) * 100);
}

function createDefaultPermit(province: ProvinceCode): ChemicalPermit {
  const now = new Date().toISOString();
  const poisonPhone = province === 'QC' ? '1-800-463-5060' : province === 'ON' ? '1-800-268-9017' : '';
  return {
    permit_number: generatePermitNumber(province),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    siteInfo: {
      projectNumber: '', workLocation: '', contractor: '', supervisor: '',
      entryDate: '', duration: '', workerCount: 1, workDescription: '',
      facilityType: '', storageArea: '',
    },
    substances: [],
    exposureControl: {
      engineeringControls: [], adminControls: [], ventilationType: '',
      airMonitoringRequired: false, airMonitoringFrequency: '',
      exposureLimit: '', whmisTraining: false, whmisTrainingDate: '',
    },
    ppe: {
      respiratory: '', respiratorType: '', respiratorCartridge: '', fitTestDate: '',
      gloves: '', gloveMaterial: '', gloveThickness: '',
      protectiveSuit: '', suitType: '',
      eyeFace: [], footProtection: '', additionalPPE: '',
    },
    emergency: {
      spillProcedure: '', spillKit: false, spillKitLocation: '',
      firstAidMeasures: '', eyewashStation: false, eyewashLocation: '',
      emergencyContact: '', emergencyPhone: '', poisonControlPhone: poisonPhone,
      hospitalName: '', hospitalAddress: '', evacuationZone: 0, evacuationProcedure: '',
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
    title: 'Permis travaux produits chimiques',
    standard: 'SIMDUT 2015 / TMD',
    sections: {
      site: 'Site',
      substances: 'Substances',
      exposureControl: 'Contrôles',
      ppe: 'EPI',
      emergency: 'Urgence',
      finalization: 'Finalisation',
    },
    sectionsFull: {
      site: 'Informations du site',
      substances: 'Substances dangereuses',
      exposureControl: "Contrôle de l'exposition",
      ppe: 'Équipements de protection individuelle',
      emergency: "Procédures d'urgence",
      finalization: 'Finalisation & signatures',
    },
    menu: { saveNow: 'Enregistrer maintenant', exportJson: 'Exporter JSON', print: 'Imprimer', newPermit: 'Nouveau permis' },
    save: { saving: 'Enregistrement…', saved: 'Enregistré', error: 'Erreur sauvegarde', unsaved: 'Non enregistré' },
    status: { draft: 'Brouillon', active: 'Actif', completed: 'Complété', cancelled: 'Annulé' },
    back: 'Retour aux permis',
    completion: 'Complétion',
    // site
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
    workDescriptionPh: 'Description des travaux…',
    facilityType: "Type d'installation",
    facilityTypes: ['Industrie lourde', 'Industrie légère', 'Laboratoire', 'Construction', 'Traitement des eaux', 'Pétrochimie', 'Agriculture', 'Transport'],
    storageArea: 'Zone de stockage',
    regulationCard: 'Réglementation SIMDUT 2015 / TMD',
    regulationNote: {
      QC: 'Québec : LSST et RSST — obligation FDS sur les lieux.',
      ON: 'Ontario : Occupational Health and Safety Act — WHMIS 2015.',
      AB: 'Alberta : OHS Code — WHMIS 2015.',
      BC: 'C.-B. : WorkSafeBC OHS Regulation — WHMIS 2015.',
      default: 'Consulter la réglementation SIMDUT 2015 provinciale applicable.',
    },
    // substances
    substancesCard: 'Substances dangereuses',
    addSubstance: 'Ajouter une substance',
    substanceName: 'Nom de la substance *',
    casNumber: 'N° CAS',
    unNumber: 'N° ONU',
    physicalState: 'État physique',
    physicalStates: ['Solide', 'Liquide', 'Gaz', 'Aérosol', 'Cryogénique'],
    whmisClass: 'Classe SIMDUT *',
    whmisClasses: [
      'Classe 1 Explosif',
      'Classe 2 Gaz',
      'Classe 3 Liquide inflammable',
      'Classe 4 Solide inflammable',
      'Classe 5 Oxydant',
      'Classe 6 Toxique/infectieux',
      'Classe 7 Radioactif',
      'Classe 8 Corrosif',
      'Classe 9 Autre',
    ],
    quantity: 'Quantité',
    unit: 'Unité',
    units: ['kg', 'L', 'g', 'mL', 't', 'm³'],
    sdsRef: 'Réf. FDS',
    sdsDate: 'Date FDS',
    tlv: 'VLE/TLV-TWA',
    stel: 'VECD/STEL',
    idlh: 'DIVS/IDLH',
    flashPoint: "Point d'éclair",
    autoIgnition: 'Température d\'auto-inflammation',
    hazardProps: 'Propriétés de danger',
    explosive: 'Explosif',
    flammable: 'Inflammable',
    toxic: 'Toxique',
    corrosive: 'Corrosif',
    sdsNote: 'Rappel : toutes les FDS doivent être accessibles sur le lieu de travail.',
    sdsNoteCard: 'Fiches de données de sécurité (FDS)',
    // exposure control
    engControlsCard: 'Contrôles techniques',
    engControlOptions: ['Hotte aspirante', 'Ventilation locale aspirante', 'Enceinte fermée', 'Dilution/ventilation générale', 'Substitution', 'Isolation du procédé'],
    adminControlsCard: 'Contrôles administratifs',
    adminControlOptions: ['Rotation des travailleurs', "Limitation du temps d'exposition", 'Procédures de travail sécuritaires', 'Formation SIMDUT', 'Surveillance médicale'],
    airMonitoringRequired: 'Surveillance de l\'air requise',
    airMonitoringFrequency: 'Fréquence de surveillance',
    trainingCard: 'Formation',
    whmisTraining: 'Formation SIMDUT complétée',
    whmisTrainingDate: 'Date de la formation',
    // ppe
    respiratoryCard: 'Protection respiratoire',
    respiratory: 'Protection respiratoire requise',
    respiratoryOptions: ['Non requise', 'Masque filtrant N95', 'Demi-masque filtrant', 'Masque complet filtrant', 'APVR (air fourni)', 'Cagoule ventilée'],
    respiratorCartridge: 'Type de cartouche',
    fitTestDate: "Date du test d'ajustement",
    glovesCard: 'Protection des mains',
    gloves: 'Gants requis',
    gloveOptions: ['Non requises', 'Nitrile', 'Néoprène', 'Viton', 'Caoutchouc naturel', 'PVC', 'Vinyle'],
    gloveMaterial: 'Matériau',
    gloveThickness: 'Épaisseur (mm)',
    suitCard: 'Protection du corps',
    protectiveSuit: 'Combinaison de protection',
    suitOptions: ['Non requis', 'Salopette Tyvek', 'Combinaison Tychem', 'Combinaison HAZMAT Niveau A', 'Combinaison HAZMAT Niveau B', 'Combinaison HAZMAT Niveau C', 'Combinaison HAZMAT Niveau D'],
    eyeFootCard: 'Yeux / Visage + Pieds',
    eyeFaceOptions: ['Lunettes de sécurité', 'Lunettes étanches', 'Écran facial', 'Combinaison oculaire+faciale'],
    footProtection: 'Protection des pieds',
    footOptions: ['Bottines de sécurité standards', 'Bottes résistantes aux produits chimiques', 'Bottes imperméables'],
    additionalPPE: 'EPI supplémentaire',
    // emergency
    spillCard: 'Procédure en cas de déversement',
    spillProcedure: 'Procédure de déversement *',
    spillProcedurePh: 'Étapes à suivre en cas de déversement…',
    spillKit: 'Trousse d\'intervention disponible',
    spillKitLocation: 'Emplacement de la trousse',
    firstAidCard: 'Premiers soins',
    firstAidMeasures: 'Mesures de premiers soins',
    firstAidPh: 'Mesures de premiers soins (section 4 de la FDS)…',
    eyewashStation: 'Station de rinçage oculaire disponible',
    eyewashLocation: 'Emplacement de la station',
    contactsCard: "Contacts d'urgence",
    emergencyContact: "Nom du responsable d'urgence",
    emergencyPhone: "Téléphone d'urgence *",
    poisonControlPhone: 'Centre anti-poison',
    hospitalName: "Nom de l'hôpital",
    hospitalAddress: "Adresse de l'hôpital",
    evacuationCard: "Zone d'évacuation",
    evacuationZone: "Rayon d'évacuation (m)",
    evacuationProcedure: "Procédure d'évacuation",
    evacuationPh: "Étapes d'évacuation…",
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
    title: 'Chemical Work Permit',
    standard: 'WHMIS 2015 / TDG',
    sections: {
      site: 'Site',
      substances: 'Substances',
      exposureControl: 'Controls',
      ppe: 'PPE',
      emergency: 'Emergency',
      finalization: 'Finalization',
    },
    sectionsFull: {
      site: 'Site information',
      substances: 'Hazardous substances',
      exposureControl: 'Exposure control',
      ppe: 'Personal protective equipment',
      emergency: 'Emergency procedures',
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
    workDescriptionPh: 'Description of work…',
    facilityType: 'Facility type',
    facilityTypes: ['Heavy industry', 'Light industry', 'Laboratory', 'Construction', 'Water treatment', 'Petrochemical', 'Agriculture', 'Transportation'],
    storageArea: 'Storage area',
    regulationCard: 'WHMIS 2015 / TDG Regulation',
    regulationNote: {
      QC: 'Quebec: LSST and RSST — SDS required on-site.',
      ON: 'Ontario: Occupational Health and Safety Act — WHMIS 2015.',
      AB: 'Alberta: OHS Code — WHMIS 2015.',
      BC: 'B.C.: WorkSafeBC OHS Regulation — WHMIS 2015.',
      default: 'Consult applicable provincial WHMIS 2015 regulation.',
    },
    substancesCard: 'Hazardous substances',
    addSubstance: 'Add substance',
    substanceName: 'Substance name *',
    casNumber: 'CAS number',
    unNumber: 'UN number',
    physicalState: 'Physical state',
    physicalStates: ['Solid', 'Liquid', 'Gas', 'Aerosol', 'Cryogenic'],
    whmisClass: 'WHMIS class *',
    whmisClasses: [
      'Class 1 Explosive',
      'Class 2 Gas',
      'Class 3 Flammable liquid',
      'Class 4 Flammable solid',
      'Class 5 Oxidizer',
      'Class 6 Toxic/infectious',
      'Class 7 Radioactive',
      'Class 8 Corrosive',
      'Class 9 Other',
    ],
    quantity: 'Quantity',
    unit: 'Unit',
    units: ['kg', 'L', 'g', 'mL', 't', 'm³'],
    sdsRef: 'SDS ref.',
    sdsDate: 'SDS date',
    tlv: 'TLV-TWA',
    stel: 'STEL',
    idlh: 'IDLH',
    flashPoint: 'Flash point',
    autoIgnition: 'Auto-ignition temperature',
    hazardProps: 'Hazard properties',
    explosive: 'Explosive',
    flammable: 'Flammable',
    toxic: 'Toxic',
    corrosive: 'Corrosive',
    sdsNote: 'Reminder: all SDS must be accessible at the worksite.',
    sdsNoteCard: 'Safety Data Sheets (SDS)',
    engControlsCard: 'Engineering controls',
    engControlOptions: ['Fume hood', 'Local exhaust ventilation', 'Enclosed process', 'Dilution/general ventilation', 'Substitution', 'Process isolation'],
    adminControlsCard: 'Administrative controls',
    adminControlOptions: ['Worker rotation', 'Exposure time limitation', 'Safe work procedures', 'WHMIS training', 'Medical surveillance'],
    airMonitoringRequired: 'Air monitoring required',
    airMonitoringFrequency: 'Monitoring frequency',
    trainingCard: 'Training',
    whmisTraining: 'WHMIS training completed',
    whmisTrainingDate: 'Training date',
    respiratoryCard: 'Respiratory protection',
    respiratory: 'Respiratory protection required',
    respiratoryOptions: ['Not required', 'N95 filtering facepiece', 'Half-face respirator', 'Full-face respirator', 'SCBA / SAR', 'Powered air-purifying respirator'],
    respiratorCartridge: 'Cartridge type',
    fitTestDate: 'Fit test date',
    glovesCard: 'Hand protection',
    gloves: 'Gloves required',
    gloveOptions: ['Not required', 'Nitrile', 'Neoprene', 'Viton', 'Natural rubber', 'PVC', 'Vinyl'],
    gloveMaterial: 'Material',
    gloveThickness: 'Thickness (mm)',
    suitCard: 'Body protection',
    protectiveSuit: 'Protective suit',
    suitOptions: ['Not required', 'Tyvek coverall', 'Tychem suit', 'HAZMAT Level A suit', 'HAZMAT Level B suit', 'HAZMAT Level C suit', 'HAZMAT Level D suit'],
    eyeFootCard: 'Eyes / Face + Feet',
    eyeFaceOptions: ['Safety glasses', 'Splash goggles', 'Face shield', 'Combined eye+face protection'],
    footProtection: 'Foot protection',
    footOptions: ['Standard safety boots', 'Chemical-resistant boots', 'Waterproof boots'],
    additionalPPE: 'Additional PPE',
    spillCard: 'Spill procedure',
    spillProcedure: 'Spill procedure *',
    spillProcedurePh: 'Steps to follow in case of spill…',
    spillKit: 'Spill kit available',
    spillKitLocation: 'Spill kit location',
    firstAidCard: 'First aid',
    firstAidMeasures: 'First aid measures',
    firstAidPh: 'First aid measures (SDS Section 4)…',
    eyewashStation: 'Eyewash station available',
    eyewashLocation: 'Eyewash station location',
    contactsCard: 'Emergency contacts',
    emergencyContact: 'Emergency coordinator name',
    emergencyPhone: 'Emergency phone *',
    poisonControlPhone: 'Poison control centre',
    hospitalName: 'Hospital name',
    hospitalAddress: 'Hospital address',
    evacuationCard: 'Evacuation zone',
    evacuationZone: 'Evacuation radius (m)',
    evacuationProcedure: 'Evacuation procedure',
    evacuationPh: 'Evacuation steps…',
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
        <span className="text-purple-600">{icon}</span>
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function NumberInput({ value, onChange, disabled, min = 0, step = 1 }: {
  value: number; onChange: (v: number) => void; disabled?: boolean; min?: number; step?: number;
}) {
  return (
    <input type="number" value={value} min={min} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)} disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function Select({ value, onChange, disabled, options }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; options: readonly string[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400">
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ label, checked, onChange, disabled }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled}
        className="h-4 w-4 rounded border-slate-300 accent-purple-600" />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function Textarea({ value, onChange, disabled, placeholder = '', rows = 3 }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} rows={rows}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400" />
  );
}

function MultiCheck({ options, selected, onChange, disabled }: {
  options: readonly string[]; selected: string[]; onChange: (v: string[]) => void; disabled?: boolean;
}) {
  const toggle = (opt: string) => {
    const next = selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt];
    onChange(next);
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 accent-purple-600" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── Section components ─────────────────────────────────────────────────────
interface SectionProps {
  language: Language;
  permitData: ChemicalPermit;
  readOnly: boolean;
  onUpdate: (data: any) => void;
}

function SiteSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const si = permitData.siteInfo;
  const prov = permitData.province;
  const regNote = (t.regulationNote as any)[prov] ?? t.regulationNote.default;

  return (
    <div>
      <Card title={t.projectInfo} icon={<MapPin className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.projectNumber}><Input value={si.projectNumber} onChange={v => onUpdate({ projectNumber: v })} disabled={readOnly} /></Field>
          <Field label={`${t.workLocation} *`}><Input value={si.workLocation} onChange={v => onUpdate({ workLocation: v })} disabled={readOnly} placeholder={t.workLocationPh} /></Field>
          <Field label={t.contractor}><Input value={si.contractor} onChange={v => onUpdate({ contractor: v })} disabled={readOnly} /></Field>
          <Field label={t.supervisor}><Input value={si.supervisor} onChange={v => onUpdate({ supervisor: v })} disabled={readOnly} /></Field>
          <Field label={t.entryDate}><Input value={si.entryDate} onChange={v => onUpdate({ entryDate: v })} disabled={readOnly} type="datetime-local" /></Field>
          <Field label={t.duration}><Input value={si.duration} onChange={v => onUpdate({ duration: v })} disabled={readOnly} /></Field>
          <Field label={t.workerCount}><NumberInput value={si.workerCount} onChange={v => onUpdate({ workerCount: v })} disabled={readOnly} min={1} /></Field>
          <Field label={t.facilityType}><Select value={si.facilityType} onChange={v => onUpdate({ facilityType: v })} disabled={readOnly} options={t.facilityTypes} /></Field>
        </div>
        <Field label={t.workDescription}><Textarea value={si.workDescription} onChange={v => onUpdate({ workDescription: v })} disabled={readOnly} placeholder={t.workDescriptionPh} /></Field>
        <Field label={t.storageArea}><Input value={si.storageArea} onChange={v => onUpdate({ storageArea: v })} disabled={readOnly} /></Field>
      </Card>

      <Card title={t.regulationCard} icon={<FileText className="w-5 h-5" />}>
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 py-3">{regNote}</p>
      </Card>
    </div>
  );
}

function SubstancesSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const substances = permitData.substances;

  const addSubstance = () => {
    onUpdate([...substances, {
      id: generateId(), name: '', casNumber: '', unNumber: '', whmisClass: '',
      physicalState: '', quantity: 0, unit: 'kg', sdsRef: '', sdsDate: '',
      tlv: '', stel: '', idlh: '', flashPoint: '', autoIgnition: '',
      explosive: false, flammable: false, toxic: false, corrosive: false,
    }]);
  };

  const removeSubstance = (id: string) => onUpdate(substances.filter((s: any) => s.id !== id));

  const updateSubstance = (id: string, field: string, value: any) => {
    onUpdate(substances.map((s: any) => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div>
      {substances.map((sub: any, idx: number) => (
        <Card key={sub.id} title={`${language === 'fr' ? 'Substance' : 'Substance'} ${idx + 1}${sub.name ? ` — ${sub.name}` : ''}`} icon={<FlaskConical className="w-5 h-5" />}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <Field label={t.substanceName}><Input value={sub.name} onChange={v => updateSubstance(sub.id, 'name', v)} disabled={readOnly} /></Field>
            </div>
            <Field label={t.casNumber}><Input value={sub.casNumber} onChange={v => updateSubstance(sub.id, 'casNumber', v)} disabled={readOnly} /></Field>
            <Field label={t.unNumber}><Input value={sub.unNumber} onChange={v => updateSubstance(sub.id, 'unNumber', v)} disabled={readOnly} /></Field>
            <Field label={t.physicalState}><Select value={sub.physicalState} onChange={v => updateSubstance(sub.id, 'physicalState', v)} disabled={readOnly} options={t.physicalStates} /></Field>
            <div className="sm:col-span-2">
              <Field label={t.whmisClass}><Select value={sub.whmisClass} onChange={v => updateSubstance(sub.id, 'whmisClass', v)} disabled={readOnly} options={t.whmisClasses} /></Field>
            </div>
            <div className="flex gap-3">
              <div className="flex-1"><Field label={t.quantity}><NumberInput value={sub.quantity} onChange={v => updateSubstance(sub.id, 'quantity', v)} disabled={readOnly} step={0.1} /></Field></div>
              <div className="w-24"><Field label={t.unit}><Select value={sub.unit} onChange={v => updateSubstance(sub.id, 'unit', v)} disabled={readOnly} options={t.units} /></Field></div>
            </div>
            <Field label={t.sdsRef}><Input value={sub.sdsRef} onChange={v => updateSubstance(sub.id, 'sdsRef', v)} disabled={readOnly} /></Field>
            <Field label={t.sdsDate}><Input value={sub.sdsDate} onChange={v => updateSubstance(sub.id, 'sdsDate', v)} disabled={readOnly} type="date" /></Field>
            <Field label={t.tlv}><Input value={sub.tlv} onChange={v => updateSubstance(sub.id, 'tlv', v)} disabled={readOnly} /></Field>
            <Field label={t.stel}><Input value={sub.stel} onChange={v => updateSubstance(sub.id, 'stel', v)} disabled={readOnly} /></Field>
            <Field label={t.idlh}><Input value={sub.idlh} onChange={v => updateSubstance(sub.id, 'idlh', v)} disabled={readOnly} /></Field>
            <Field label={t.flashPoint}><Input value={sub.flashPoint} onChange={v => updateSubstance(sub.id, 'flashPoint', v)} disabled={readOnly} /></Field>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.hazardProps}</p>
            <div className="flex flex-wrap gap-4">
              {(['explosive', 'flammable', 'toxic', 'corrosive'] as const).map(prop => (
                <label key={prop} className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={sub[prop]} onChange={e => updateSubstance(sub.id, prop, e.target.checked)} disabled={readOnly}
                    className="h-4 w-4 rounded border-slate-300 accent-purple-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t[prop]}</span>
                </label>
              ))}
            </div>
          </div>
          {!readOnly && (
            <button type="button" onClick={() => removeSubstance(sub.id)}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
              <Trash2 className="w-4 h-4" />{language === 'fr' ? 'Retirer cette substance' : 'Remove substance'}
            </button>
          )}
        </Card>
      ))}

      {!readOnly && (
        <button type="button" onClick={addSubstance}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors mb-6">
          <Plus className="w-4 h-4" />{t.addSubstance}
        </button>
      )}

      <Card title={t.sdsNoteCard} icon={<FileText className="w-5 h-5" />}>
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 py-3">{t.sdsNote}</p>
      </Card>
    </div>
  );
}

function ExposureControlSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const ec = permitData.exposureControl;

  return (
    <div>
      <Card title={t.engControlsCard} icon={<TrendingDown className="w-5 h-5" />}>
        <MultiCheck options={t.engControlOptions} selected={ec.engineeringControls} onChange={v => onUpdate({ engineeringControls: v })} disabled={readOnly} />
      </Card>

      <Card title={t.adminControlsCard} icon={<TrendingDown className="w-5 h-5" />}>
        <MultiCheck options={t.adminControlOptions} selected={ec.adminControls} onChange={v => onUpdate({ adminControls: v })} disabled={readOnly} />
        <Toggle label={t.airMonitoringRequired} checked={ec.airMonitoringRequired} onChange={v => onUpdate({ airMonitoringRequired: v })} disabled={readOnly} />
        {ec.airMonitoringRequired && (
          <Field label={t.airMonitoringFrequency}><Input value={ec.airMonitoringFrequency} onChange={v => onUpdate({ airMonitoringFrequency: v })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.trainingCard} icon={<CheckCircle className="w-5 h-5" />}>
        <Toggle label={t.whmisTraining} checked={ec.whmisTraining} onChange={v => onUpdate({ whmisTraining: v })} disabled={readOnly} />
        {ec.whmisTraining && (
          <Field label={t.whmisTrainingDate}><Input value={ec.whmisTrainingDate} onChange={v => onUpdate({ whmisTrainingDate: v })} disabled={readOnly} type="date" /></Field>
        )}
      </Card>
    </div>
  );
}

function PPESection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const ppe = permitData.ppe;
  const needsCartridge = ppe.respiratory && ppe.respiratory !== t.respiratoryOptions[0] && ppe.respiratory !== '';

  return (
    <div>
      <Card title={t.respiratoryCard} icon={<Shield className="w-5 h-5" />}>
        <Field label={t.respiratory}>
          <Select value={ppe.respiratory} onChange={v => onUpdate({ respiratory: v })} disabled={readOnly} options={t.respiratoryOptions} />
        </Field>
        {needsCartridge && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.respiratorCartridge}><Input value={ppe.respiratorCartridge} onChange={v => onUpdate({ respiratorCartridge: v })} disabled={readOnly} /></Field>
            <Field label={t.fitTestDate}><Input value={ppe.fitTestDate} onChange={v => onUpdate({ fitTestDate: v })} disabled={readOnly} type="date" /></Field>
          </div>
        )}
      </Card>

      <Card title={t.glovesCard} icon={<Shield className="w-5 h-5" />}>
        <Field label={t.gloves}><Select value={ppe.gloves} onChange={v => onUpdate({ gloves: v })} disabled={readOnly} options={t.gloveOptions} /></Field>
        {ppe.gloves && ppe.gloves !== t.gloveOptions[0] && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.gloveMaterial}><Input value={ppe.gloveMaterial} onChange={v => onUpdate({ gloveMaterial: v })} disabled={readOnly} /></Field>
            <Field label={t.gloveThickness}><Input value={ppe.gloveThickness} onChange={v => onUpdate({ gloveThickness: v })} disabled={readOnly} /></Field>
          </div>
        )}
      </Card>

      <Card title={t.suitCard} icon={<Shield className="w-5 h-5" />}>
        <Field label={t.protectiveSuit}><Select value={ppe.protectiveSuit} onChange={v => onUpdate({ protectiveSuit: v })} disabled={readOnly} options={t.suitOptions} /></Field>
        {ppe.protectiveSuit && ppe.protectiveSuit !== t.suitOptions[0] && (
          <Field label={language === 'fr' ? 'Détails du type' : 'Type details'}><Input value={ppe.suitType} onChange={v => onUpdate({ suitType: v })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.eyeFootCard} icon={<Shield className="w-5 h-5" />}>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{language === 'fr' ? 'Protection yeux/visage' : 'Eye/face protection'}</p>
          <MultiCheck options={t.eyeFaceOptions} selected={ppe.eyeFace} onChange={v => onUpdate({ eyeFace: v })} disabled={readOnly} />
        </div>
        <Field label={t.footProtection}><Select value={ppe.footProtection} onChange={v => onUpdate({ footProtection: v })} disabled={readOnly} options={t.footOptions} /></Field>
        <Field label={t.additionalPPE}><Textarea value={ppe.additionalPPE} onChange={v => onUpdate({ additionalPPE: v })} disabled={readOnly} /></Field>
      </Card>
    </div>
  );
}

function EmergencySection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const em = permitData.emergency;

  return (
    <div>
      <Card title={t.spillCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <Field label={t.spillProcedure}><Textarea value={em.spillProcedure} onChange={v => onUpdate({ spillProcedure: v })} disabled={readOnly} placeholder={t.spillProcedurePh} rows={4} /></Field>
        <Toggle label={t.spillKit} checked={em.spillKit} onChange={v => onUpdate({ spillKit: v })} disabled={readOnly} />
        {em.spillKit && (
          <Field label={t.spillKitLocation}><Input value={em.spillKitLocation} onChange={v => onUpdate({ spillKitLocation: v })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.firstAidCard} icon={<Shield className="w-5 h-5" />}>
        <Field label={t.firstAidMeasures}><Textarea value={em.firstAidMeasures} onChange={v => onUpdate({ firstAidMeasures: v })} disabled={readOnly} placeholder={t.firstAidPh} rows={3} /></Field>
        <Toggle label={t.eyewashStation} checked={em.eyewashStation} onChange={v => onUpdate({ eyewashStation: v })} disabled={readOnly} />
        {em.eyewashStation && (
          <Field label={t.eyewashLocation}><Input value={em.eyewashLocation} onChange={v => onUpdate({ eyewashLocation: v })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.contactsCard} icon={<Phone className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.emergencyContact}><Input value={em.emergencyContact} onChange={v => onUpdate({ emergencyContact: v })} disabled={readOnly} /></Field>
          <Field label={t.emergencyPhone}><Input value={em.emergencyPhone} onChange={v => onUpdate({ emergencyPhone: v })} disabled={readOnly} type="tel" /></Field>
          <Field label={t.poisonControlPhone}><Input value={em.poisonControlPhone} onChange={v => onUpdate({ poisonControlPhone: v })} disabled={readOnly} type="tel" /></Field>
          <Field label={t.hospitalName}><Input value={em.hospitalName} onChange={v => onUpdate({ hospitalName: v })} disabled={readOnly} /></Field>
          <div className="sm:col-span-2">
            <Field label={t.hospitalAddress}><Input value={em.hospitalAddress} onChange={v => onUpdate({ hospitalAddress: v })} disabled={readOnly} /></Field>
          </div>
        </div>
      </Card>

      <Card title={t.evacuationCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <Field label={t.evacuationZone}><NumberInput value={em.evacuationZone} onChange={v => onUpdate({ evacuationZone: v })} disabled={readOnly} /></Field>
        <Field label={t.evacuationProcedure}><Textarea value={em.evacuationProcedure} onChange={v => onUpdate({ evacuationProcedure: v })} disabled={readOnly} placeholder={t.evacuationPh} rows={3} /></Field>
      </Card>
    </div>
  );
}

function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language; permit: ChemicalPermit; completion: number; readOnly: boolean;
  onUpdate: (updater: (p: ChemicalPermit) => ChemicalPermit) => void; onSave: () => void;
}) {
  const t = T[language];
  const field = (key: string, val: string) => onUpdate(p => ({ ...p, [key]: val }));
  const setStatus = (s: PermitStatus) => onUpdate(p => ({ ...p, status: s }));

  const warnings: string[] = [];
  if (!permit.siteInfo.workLocation) warnings.push(language === 'fr' ? 'Lieu des travaux manquant' : 'Work location missing');
  if (permit.substances.length === 0) warnings.push(language === 'fr' ? 'Aucune substance renseignée' : 'No substances listed');
  if (!permit.emergency.emergencyPhone) warnings.push(language === 'fr' ? "Téléphone d'urgence manquant" : 'Emergency phone missing');

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
              <div key={i} className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
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
interface ChemicalProps {
  tenant?: string;
  language?: Language;
  province?: ProvinceCode;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: ChemicalPermit) => void;
  onCancel?: () => void;
  initialData?: Partial<ChemicalPermit>;
  readOnly?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Chemical({
  tenant = 'demo',
  language = 'fr',
  province = 'QC',
  selectedProvince,
  enableAutoSave = true,
  onSave,
  onCancel,
  initialData,
  readOnly = false,
}: ChemicalProps) {
  const resolvedProvince: ProvinceCode = (selectedProvince ?? province) as ProvinceCode;
  const t = T[language];

  const [permit, setPermit] = useState<ChemicalPermit>(() => ({
    ...createDefaultPermit(resolvedProvince),
    ...initialData,
  }));
  const [section, setSection] = useState<Section>('site');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPermit(p => ({ ...p, province: resolvedProvince }));
  }, [resolvedProvince]);

  const persistPermit = useCallback(async (data: ChemicalPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'chemical',
          data: payload,
          updated_at: payload.updated_at,
        });
      }
      localStorage.setItem(`${currentTenantSlug()}::permit-${payload.permit_number}`, JSON.stringify(payload));
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

  const updatePermit = useCallback((updater: (prev: ChemicalPermit) => ChemicalPermit) => {
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
    { id: 'site', icon: <MapPin className="w-4 h-4" />, label: t.sections.site },
    { id: 'substances', icon: <FlaskConical className="w-4 h-4" />, label: t.sections.substances },
    { id: 'exposureControl', icon: <TrendingDown className="w-4 h-4" />, label: t.sections.exposureControl },
    { id: 'ppe', icon: <Shield className="w-4 h-4" />, label: t.sections.ppe },
    { id: 'emergency', icon: <Phone className="w-4 h-4" />, label: t.sections.emergency },
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
            <FlaskConical className="w-5 h-5 text-purple-600 shrink-0" />
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
                  <button type="button" onClick={() => { setPermit(createDefaultPermit(resolvedProvince)); setSection('site'); setMenuOpen(false); }}
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
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}>
              {s.icon}<span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {section === 'site' && (
            <SiteSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, siteInfo: { ...p.siteInfo, ...data } }))} />
          )}
          {section === 'substances' && (
            <SubstancesSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, substances: data }))} />
          )}
          {section === 'exposureControl' && (
            <ExposureControlSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, exposureControl: { ...p.exposureControl, ...data } }))} />
          )}
          {section === 'ppe' && (
            <PPESection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, ppe: { ...p.ppe, ...data } }))} />
          )}
          {section === 'emergency' && (
            <EmergencySection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, emergency: { ...p.emergency, ...data } }))} />
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
