'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, AlertTriangle, Layers, Cable, Wind, CheckCircle,
  Menu, X, Save, Download, Printer, Plus, ChevronRight, Home,
  FileText, BarChart3, Trash2, Shovel
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

export interface ExcavationPermit {
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
    depth: number;
    length: number;
    width: number;
    soilClass: string;
    excavationType: string;
  };
  hazards: {
    caveInRisk: boolean;
    undergroundUtilities: boolean;
    locateTicketNumber: string;
    locateDate: string;
    floodingRisk: boolean;
    gasHazard: boolean;
    trafficHazard: boolean;
    adjacentStructures: boolean;
    adjacentStructuresDescription: string;
    contamination: boolean;
    contaminationType: string;
    hazardNotes: string;
  };
  shoring: {
    requiredMethod: string;
    slopeAngle: number;
    benchingRequired: boolean;
    benchingDetails: string;
    shoringType: string;
    shoringDetails: string;
    trenchBoxUsed: boolean;
    trenchBoxModel: string;
    trenchBoxCapacity: string;
    drawingRef: string;
    inspectionRequired: boolean;
    inspectorName: string;
  };
  utilities: {
    utilitiesLocated: boolean;
    locateCompany: string;
    locateTicket: string;
    locateExpiry: string;
    utilities: Array<{
      id: string;
      type: string;
      depth: number;
      horizontalClearance: number;
      status: string;
    }>;
    handDigRequired: boolean;
    handDigDistance: number;
    clearanceNotes: string;
  };
  atmospheric: {
    testRequired: boolean;
    testEquipment: string;
    equipmentCalDate: string;
    readings: Array<{
      id: string;
      time: string;
      oxygen: number;
      lel: number;
      h2s: number;
      co: number;
      location: string;
    }>;
    continuousMonitoring: boolean;
    alarmSettings: string;
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

type Section = 'site' | 'hazards' | 'shoring' | 'utilities' | 'atmospheric' | 'finalization';

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generatePermitNumber(province: ProvinceCode, prefix = 'EXC'): string {
  return `${prefix}-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function computeCompletion(permit: ExcavationPermit): number {
  let score = 0;
  if (permit.siteInfo.workLocation) score++;
  if (permit.siteInfo.depth > 0) score++;
  if (permit.siteInfo.soilClass) score++;
  if (!permit.hazards.undergroundUtilities || permit.hazards.locateTicketNumber) score++;
  if (permit.shoring.requiredMethod) score++;
  if (!permit.atmospheric.testRequired || permit.atmospheric.readings.length > 0) score++;
  return Math.round((score / 6) * 100);
}

function createDefaultPermit(province: ProvinceCode): ExcavationPermit {
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
      depth: 0, length: 0, width: 0, soilClass: '', excavationType: '',
    },
    hazards: {
      caveInRisk: false, undergroundUtilities: false, locateTicketNumber: '', locateDate: '',
      floodingRisk: false, gasHazard: false, trafficHazard: false,
      adjacentStructures: false, adjacentStructuresDescription: '',
      contamination: false, contaminationType: '', hazardNotes: '',
    },
    shoring: {
      requiredMethod: '', slopeAngle: 0, benchingRequired: false, benchingDetails: '',
      shoringType: '', shoringDetails: '', trenchBoxUsed: false, trenchBoxModel: '',
      trenchBoxCapacity: '', drawingRef: '', inspectionRequired: false, inspectorName: '',
    },
    utilities: {
      utilitiesLocated: false, locateCompany: '', locateTicket: '', locateExpiry: '',
      utilities: [], handDigRequired: false, handDigDistance: 0, clearanceNotes: '',
    },
    atmospheric: {
      testRequired: false, testEquipment: '', equipmentCalDate: '',
      readings: [], continuousMonitoring: false, alarmSettings: '',
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
    title: "Permis d'excavation",
    standard: 'CSA S350-M1980 / SST provinciale',
    sections: {
      site: 'Site',
      hazards: 'Dangers',
      shoring: 'Blindage',
      utilities: 'Services',
      atmospheric: 'Atmosphère',
      finalization: 'Finalisation',
    },
    sectionsFull: {
      site: 'Informations du site',
      hazards: 'Identification des dangers',
      shoring: 'Protection et blindage',
      utilities: 'Services souterrains',
      atmospheric: 'Tests atmosphériques',
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
    entryDate: "Date de début",
    duration: 'Durée prévue',
    workerCount: 'Nombre de travailleurs',
    workDescription: 'Description des travaux',
    workDescriptionPh: 'Description des travaux à effectuer…',
    dimensions: "Dimensions de l'excavation",
    depth: 'Profondeur (m)',
    length: 'Longueur (m)',
    width: 'Largeur (m)',
    soilClass: 'Classe de sol',
    soilClasses: [
      'Classe A — Roc dur/roc mou non fissuré',
      'Classe B — Roc fissuré/sol cohésif dur',
      'Classe C — Sol cohésif ferme',
      'Classe D — Sol cohésif mou',
      'Classe E — Sol non cohésif sec',
      'Classe F — Sol submergé',
    ],
    excavationType: "Type d'excavation",
    excavationTypes: ['Tranchée', 'Puits/caisson', 'Fouille à ciel ouvert', 'Caverne/tunnel', 'Autre'],
    regulationCard: 'Réglementation applicable',
    regulationNote: {
      QC: 'Québec : RSST art. 3.15.1 à 3.20.11',
      ON: 'Ontario : O. Reg 213/91 Part VII',
      AB: 'Alberta : OHS Code Part 32',
      BC: 'Colombie-Britannique : OHS Reg Part 20',
      default: 'Consulter la réglementation SST provinciale applicable.',
    },
    // hazards
    caveInCard: "Risques d'effondrement",
    caveInRisk: "Risque d'effondrement identifié",
    utilitiesCard: 'Services souterrains',
    undergroundUtilities: 'Services souterrains présents',
    locateTicketNumber: 'N° de demande de localisation',
    locateDate: 'Date de localisation',
    otherHazardsCard: 'Autres dangers',
    floodingRisk: "Risque d'inondation",
    gasHazard: 'Présence de gaz',
    trafficHazard: 'Danger de circulation',
    adjacentStructures: 'Structures adjacentes',
    adjacentStructuresDesc: 'Description des structures adjacentes',
    contamination: 'Contamination du sol',
    contaminationType: 'Type de contamination',
    hazardNotes: 'Notes sur les dangers',
    hazardNotesPh: 'Observations ou mesures correctives…',
    // shoring
    protectionMethod: 'Méthode de protection requise',
    requiredMethod: 'Méthode sélectionnée',
    methodOptions: [
      'Talutage/éboulement naturel',
      'Talutage à angle',
      'Banquettes/étagères',
      'Blindage/étançonnement',
      'Coffre de fouille',
      'Combinaison',
    ],
    protectionNote: 'Note : une profondeur ≥ 1,2 m nécessite une protection dans la plupart des provinces.',
    slopingCard: 'Talutage',
    slopeAngle: "Angle de talutage (degrés)",
    benchingRequired: 'Banquettes/étagères requises',
    benchingDetails: 'Détails des banquettes',
    shoringCard: 'Blindage / Étançonnement',
    shoringType: 'Type de blindage',
    shoringTypes: ['Hydraulique', 'Pneumatique', 'Bois', 'Métal', 'Vissé'],
    shoringDetails: 'Détails du blindage',
    drawingRef: 'Réf. plan/dessin',
    trenchBoxCard: 'Coffre de fouille (trench box)',
    trenchBoxUsed: 'Coffre de fouille utilisé',
    trenchBoxModel: 'Modèle du coffre',
    trenchBoxCapacity: 'Capacité du coffre',
    inspectionCard: 'Inspection',
    inspectionRequired: 'Inspection par un ingénieur requise',
    inspectorName: "Nom de l'ingénieur/inspecteur",
    inspectionNote: 'Note (QC) : une profondeur > 2 m requiert la supervision d\'un ingénieur.',
    // utilities
    locateCard: 'Localisation des services',
    utilitiesLocated: 'Services localisés',
    locateCompany: 'Entreprise de localisation',
    locateTicket: 'N° de billet de localisation',
    locateExpiry: 'Expiration de la localisation',
    identifiedUtilitiesCard: 'Services identifiés',
    addUtility: 'Ajouter un service',
    utilityType: 'Type',
    utilityTypes: ['Électricité', 'Gaz', 'Eau', 'Égout', 'Télécom', 'Pétrole', 'Fibre'],
    utilityDepth: 'Prof. (m)',
    horizontalClearance: 'Clairance horiz. (m)',
    utilityStatus: 'Statut',
    utilityStatuses: ['Confirmé', 'Présumé', 'Inconnu'],
    handDigCard: 'Excavation manuelle',
    handDigRequired: 'Excavation manuelle requise (zone de clairance)',
    handDigDistance: 'Distance de clairance (m)',
    clearanceNotes: 'Notes de clairance',
    // atmospheric
    testCard: 'Test atmosphérique',
    testRequired: "Test atmosphérique requis (profondeur > 1,5 m)",
    testEquipment: 'Équipement de détection',
    equipmentCalDate: "Date d'étalonnage",
    readingsCard: 'Lectures atmosphériques',
    addReading: 'Ajouter une lecture',
    readingTime: 'Heure',
    oxygen: 'O₂ (%)',
    lel: 'LIE (%)',
    h2s: 'H₂S (ppm)',
    co: 'CO (ppm)',
    location: 'Emplacement',
    continuousCard: 'Surveillance continue',
    continuousMonitoring: 'Surveillance continue requise',
    alarmSettings: 'Réglages des alarmes',
    alarmSettingsPh: "Seuils d'alarme configurés…",
    // finalization
    finalizationTitle: 'Finalisation du permis',
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
    warningCompletion: 'Complétion insuffisante pour activer (minimum 60 %)',
    provinces: { QC: 'Québec', ON: 'Ontario', BC: 'Colombie-Britannique', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba', NB: 'Nouveau-Brunswick', NS: 'Nouvelle-Écosse', PE: 'Î.-P.-É.', NL: 'T.-N.-L.' },
  },
  en: {
    title: 'Excavation Permit',
    standard: 'CSA S350-M1980 / Provincial OHS',
    sections: {
      site: 'Site',
      hazards: 'Hazards',
      shoring: 'Shoring',
      utilities: 'Utilities',
      atmospheric: 'Atmosphere',
      finalization: 'Finalization',
    },
    sectionsFull: {
      site: 'Site information',
      hazards: 'Hazard identification',
      shoring: 'Protection & shoring',
      utilities: 'Underground utilities',
      atmospheric: 'Atmospheric testing',
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
    dimensions: 'Excavation dimensions',
    depth: 'Depth (m)',
    length: 'Length (m)',
    width: 'Width (m)',
    soilClass: 'Soil class',
    soilClasses: [
      'Class A — Hard rock / unfissured soft rock',
      'Class B — Fissured rock / hard cohesive soil',
      'Class C — Firm cohesive soil',
      'Class D — Soft cohesive soil',
      'Class E — Dry non-cohesive soil',
      'Class F — Submerged soil',
    ],
    excavationType: 'Excavation type',
    excavationTypes: ['Trench', 'Shaft/caisson', 'Open-cut excavation', 'Cavern/tunnel', 'Other'],
    regulationCard: 'Applicable regulation',
    regulationNote: {
      QC: 'Quebec: RSST art. 3.15.1 to 3.20.11',
      ON: 'Ontario: O. Reg 213/91 Part VII',
      AB: 'Alberta: OHS Code Part 32',
      BC: 'British Columbia: OHS Reg Part 20',
      default: 'Consult applicable provincial OHS regulation.',
    },
    caveInCard: 'Cave-in risks',
    caveInRisk: 'Cave-in risk identified',
    utilitiesCard: 'Underground utilities',
    undergroundUtilities: 'Underground utilities present',
    locateTicketNumber: 'Locate request number',
    locateDate: 'Locate date',
    otherHazardsCard: 'Other hazards',
    floodingRisk: 'Flooding risk',
    gasHazard: 'Gas presence',
    trafficHazard: 'Traffic hazard',
    adjacentStructures: 'Adjacent structures',
    adjacentStructuresDesc: 'Adjacent structures description',
    contamination: 'Soil contamination',
    contaminationType: 'Contamination type',
    hazardNotes: 'Hazard notes',
    hazardNotesPh: 'Observations or corrective measures…',
    protectionMethod: 'Required protection method',
    requiredMethod: 'Selected method',
    methodOptions: [
      'Natural slope / sloping',
      'Benching',
      'Terracing/stepped',
      'Shoring/bracing',
      'Trench box',
      'Combination',
    ],
    protectionNote: 'Note: a depth ≥ 1.2 m requires protection in most provinces.',
    slopingCard: 'Sloping',
    slopeAngle: 'Slope angle (degrees)',
    benchingRequired: 'Benching required',
    benchingDetails: 'Benching details',
    shoringCard: 'Shoring / Bracing',
    shoringType: 'Shoring type',
    shoringTypes: ['Hydraulic', 'Pneumatic', 'Wood', 'Metal', 'Screw'],
    shoringDetails: 'Shoring details',
    drawingRef: 'Drawing reference',
    trenchBoxCard: 'Trench box',
    trenchBoxUsed: 'Trench box used',
    trenchBoxModel: 'Trench box model',
    trenchBoxCapacity: 'Trench box capacity',
    inspectionCard: 'Inspection',
    inspectionRequired: 'Engineer inspection required',
    inspectorName: 'Engineer/inspector name',
    inspectionNote: 'Note (QC): depth > 2 m requires engineer supervision.',
    locateCard: 'Utility location',
    utilitiesLocated: 'Utilities located',
    locateCompany: 'Locating company',
    locateTicket: 'Locate ticket number',
    locateExpiry: 'Locate expiry',
    identifiedUtilitiesCard: 'Identified utilities',
    addUtility: 'Add utility',
    utilityType: 'Type',
    utilityTypes: ['Electricity', 'Gas', 'Water', 'Sewer', 'Telecom', 'Petroleum', 'Fibre'],
    utilityDepth: 'Depth (m)',
    horizontalClearance: 'Horiz. clearance (m)',
    utilityStatus: 'Status',
    utilityStatuses: ['Confirmed', 'Assumed', 'Unknown'],
    handDigCard: 'Hand digging',
    handDigRequired: 'Hand digging required (clearance zone)',
    handDigDistance: 'Clearance distance (m)',
    clearanceNotes: 'Clearance notes',
    testCard: 'Atmospheric test',
    testRequired: 'Atmospheric test required (depth > 1.5 m)',
    testEquipment: 'Detection equipment',
    equipmentCalDate: 'Calibration date',
    readingsCard: 'Atmospheric readings',
    addReading: 'Add reading',
    readingTime: 'Time',
    oxygen: 'O₂ (%)',
    lel: 'LEL (%)',
    h2s: 'H₂S (ppm)',
    co: 'CO (ppm)',
    location: 'Location',
    continuousCard: 'Continuous monitoring',
    continuousMonitoring: 'Continuous monitoring required',
    alarmSettings: 'Alarm settings',
    alarmSettingsPh: 'Configured alarm thresholds…',
    finalizationTitle: 'Permit finalization',
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
    warningCompletion: 'Insufficient completion to activate (minimum 60%)',
    provinces: { QC: 'Quebec', ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', SK: 'Saskatchewan', MB: 'Manitoba', NB: 'New Brunswick', NS: 'Nova Scotia', PE: 'P.E.I.', NL: 'N.L.' },
  },
} as const;

// ── Shared UI primitives ──────────────────────────────────────────────────
const ACCENT = 'amber-700';

function Card({ title, icon, children, accent = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-amber-700">{icon}</span>
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
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

function NumberInput({ value, onChange, disabled, min = 0, step = 0.1 }: {
  value: number; onChange: (v: number) => void; disabled?: boolean; min?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

function Select({ value, onChange, disabled, options }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    >
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
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-slate-300 accent-amber-600"
      />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function Textarea({ value, onChange, disabled, placeholder = '', rows = 3 }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

// ── Section components ─────────────────────────────────────────────────────
interface SectionProps {
  language: Language;
  permitData: ExcavationPermit;
  readOnly: boolean;
  onUpdate: (data: Partial<ExcavationPermit['siteInfo']> | any) => void;
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
          <Field label={`${t.supervisor} *`}><Input value={si.supervisor} onChange={v => onUpdate({ supervisor: v })} disabled={readOnly} /></Field>
          <Field label={t.entryDate}><Input value={si.entryDate} onChange={v => onUpdate({ entryDate: v })} disabled={readOnly} type="datetime-local" /></Field>
          <Field label={t.duration}><Input value={si.duration} onChange={v => onUpdate({ duration: v })} disabled={readOnly} /></Field>
          <Field label={t.workerCount}><NumberInput value={si.workerCount} onChange={v => onUpdate({ workerCount: v })} disabled={readOnly} min={1} step={1} /></Field>
        </div>
        <Field label={`${t.workDescription} *`}><Textarea value={si.workDescription} onChange={v => onUpdate({ workDescription: v })} disabled={readOnly} placeholder={t.workDescriptionPh} rows={3} /></Field>
      </Card>

      <Card title={t.dimensions} icon={<Shovel className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={`${t.depth} *`}><NumberInput value={si.depth} onChange={v => onUpdate({ depth: v })} disabled={readOnly} /></Field>
          <Field label={t.length}><NumberInput value={si.length} onChange={v => onUpdate({ length: v })} disabled={readOnly} /></Field>
          <Field label={t.width}><NumberInput value={si.width} onChange={v => onUpdate({ width: v })} disabled={readOnly} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t.soilClass} *`}><Select value={si.soilClass} onChange={v => onUpdate({ soilClass: v })} disabled={readOnly} options={[...t.soilClasses]} /></Field>
          <Field label={t.excavationType}><Select value={si.excavationType} onChange={v => onUpdate({ excavationType: v })} disabled={readOnly} options={[...t.excavationTypes]} /></Field>
        </div>
      </Card>

      <Card title={t.regulationCard} icon={<FileText className="w-5 h-5" />}>
        <p className="text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3">{regNote}</p>
      </Card>
    </div>
  );
}

function HazardsSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const h = permitData.hazards;

  return (
    <div>
      <Card title={t.caveInCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <Toggle label={t.caveInRisk} checked={h.caveInRisk} onChange={v => onUpdate({ caveInRisk: v })} disabled={readOnly} />
      </Card>

      <Card title={t.utilitiesCard} icon={<Cable className="w-5 h-5" />}>
        <Toggle label={t.undergroundUtilities} checked={h.undergroundUtilities} onChange={v => onUpdate({ undergroundUtilities: v })} disabled={readOnly} />
        {h.undergroundUtilities && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={`${t.locateTicketNumber} *`}><Input value={h.locateTicketNumber} onChange={v => onUpdate({ locateTicketNumber: v })} disabled={readOnly} /></Field>
            <Field label={t.locateDate}><Input value={h.locateDate} onChange={v => onUpdate({ locateDate: v })} disabled={readOnly} type="date" /></Field>
          </div>
        )}
      </Card>

      <Card title={t.otherHazardsCard} icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle label={t.floodingRisk} checked={h.floodingRisk} onChange={v => onUpdate({ floodingRisk: v })} disabled={readOnly} />
          <Toggle label={t.gasHazard} checked={h.gasHazard} onChange={v => onUpdate({ gasHazard: v })} disabled={readOnly} />
          <Toggle label={t.trafficHazard} checked={h.trafficHazard} onChange={v => onUpdate({ trafficHazard: v })} disabled={readOnly} />
          <Toggle label={t.adjacentStructures} checked={h.adjacentStructures} onChange={v => onUpdate({ adjacentStructures: v })} disabled={readOnly} />
          {h.adjacentStructures && (
            <Field label={t.adjacentStructuresDesc}>
              <Input value={h.adjacentStructuresDescription} onChange={v => onUpdate({ adjacentStructuresDescription: v })} disabled={readOnly} />
            </Field>
          )}
          <Toggle label={t.contamination} checked={h.contamination} onChange={v => onUpdate({ contamination: v })} disabled={readOnly} />
          {h.contamination && (
            <Field label={t.contaminationType}>
              <Input value={h.contaminationType} onChange={v => onUpdate({ contaminationType: v })} disabled={readOnly} />
            </Field>
          )}
        </div>
        <Field label={t.hazardNotes}>
          <Textarea value={h.hazardNotes} onChange={v => onUpdate({ hazardNotes: v })} disabled={readOnly} placeholder={t.hazardNotesPh} />
        </Field>
      </Card>
    </div>
  );
}

function ShoringSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const s = permitData.shoring;

  return (
    <div>
      <Card title={t.protectionMethod} icon={<Layers className="w-5 h-5" />}>
        <Field label={`${t.requiredMethod} *`}>
          <Select value={s.requiredMethod} onChange={v => onUpdate({ requiredMethod: v })} disabled={readOnly} options={[...t.methodOptions]} />
        </Field>
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">{t.protectionNote}</p>
      </Card>

      <Card title={t.slopingCard} icon={<Layers className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.slopeAngle}><NumberInput value={s.slopeAngle} onChange={v => onUpdate({ slopeAngle: v })} disabled={readOnly} min={0} step={1} /></Field>
        </div>
        <Toggle label={t.benchingRequired} checked={s.benchingRequired} onChange={v => onUpdate({ benchingRequired: v })} disabled={readOnly} />
        {s.benchingRequired && (
          <Field label={t.benchingDetails}><Input value={s.benchingDetails} onChange={v => onUpdate({ benchingDetails: v })} disabled={readOnly} /></Field>
        )}
      </Card>

      <Card title={t.shoringCard} icon={<Layers className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.shoringType}><Select value={s.shoringType} onChange={v => onUpdate({ shoringType: v })} disabled={readOnly} options={[...t.shoringTypes]} /></Field>
          <Field label={t.drawingRef}><Input value={s.drawingRef} onChange={v => onUpdate({ drawingRef: v })} disabled={readOnly} /></Field>
        </div>
        <Field label={t.shoringDetails}><Textarea value={s.shoringDetails} onChange={v => onUpdate({ shoringDetails: v })} disabled={readOnly} /></Field>
      </Card>

      <Card title={t.trenchBoxCard} icon={<Layers className="w-5 h-5" />}>
        <Toggle label={t.trenchBoxUsed} checked={s.trenchBoxUsed} onChange={v => onUpdate({ trenchBoxUsed: v })} disabled={readOnly} />
        {s.trenchBoxUsed && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={t.trenchBoxModel}><Input value={s.trenchBoxModel} onChange={v => onUpdate({ trenchBoxModel: v })} disabled={readOnly} /></Field>
            <Field label={t.trenchBoxCapacity}><Input value={s.trenchBoxCapacity} onChange={v => onUpdate({ trenchBoxCapacity: v })} disabled={readOnly} /></Field>
          </div>
        )}
      </Card>

      <Card title={t.inspectionCard} icon={<CheckCircle className="w-5 h-5" />}>
        <Toggle label={t.inspectionRequired} checked={s.inspectionRequired} onChange={v => onUpdate({ inspectionRequired: v })} disabled={readOnly} />
        {s.inspectionRequired && (
          <Field label={t.inspectorName}><Input value={s.inspectorName} onChange={v => onUpdate({ inspectorName: v })} disabled={readOnly} /></Field>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">{t.inspectionNote}</p>
      </Card>
    </div>
  );
}

function UtilitiesSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const u = permitData.utilities;

  const addUtility = () => {
    onUpdate({
      utilities: [...u.utilities, { id: generateId(), type: '', depth: 0, horizontalClearance: 0, status: '' }],
    });
  };

  const removeUtility = (id: string) => {
    onUpdate({ utilities: u.utilities.filter(x => x.id !== id) });
  };

  const updateUtility = (id: string, field: string, value: any) => {
    onUpdate({ utilities: u.utilities.map(x => x.id === id ? { ...x, [field]: value } : x) });
  };

  return (
    <div>
      <Card title={t.locateCard} icon={<Cable className="w-5 h-5" />}>
        <Toggle label={t.utilitiesLocated} checked={u.utilitiesLocated} onChange={v => onUpdate({ utilitiesLocated: v })} disabled={readOnly} />
        {u.utilitiesLocated && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={t.locateCompany}><Input value={u.locateCompany} onChange={v => onUpdate({ locateCompany: v })} disabled={readOnly} /></Field>
            <Field label={t.locateTicket}><Input value={u.locateTicket} onChange={v => onUpdate({ locateTicket: v })} disabled={readOnly} /></Field>
            <Field label={t.locateExpiry}><Input value={u.locateExpiry} onChange={v => onUpdate({ locateExpiry: v })} disabled={readOnly} type="date" /></Field>
          </div>
        )}
      </Card>

      <Card title={t.identifiedUtilitiesCard} icon={<Cable className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 pr-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t.utilityType}</th>
                <th className="text-left py-2 pr-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t.utilityDepth}</th>
                <th className="text-left py-2 pr-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t.horizontalClearance}</th>
                <th className="text-left py-2 pr-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t.utilityStatus}</th>
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {u.utilities.map(util => (
                <tr key={util.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-3">
                    <Select value={util.type} onChange={v => updateUtility(util.id, 'type', v)} disabled={readOnly} options={[...t.utilityTypes]} />
                  </td>
                  <td className="py-2 pr-3">
                    <NumberInput value={util.depth} onChange={v => updateUtility(util.id, 'depth', v)} disabled={readOnly} />
                  </td>
                  <td className="py-2 pr-3">
                    <NumberInput value={util.horizontalClearance} onChange={v => updateUtility(util.id, 'horizontalClearance', v)} disabled={readOnly} />
                  </td>
                  <td className="py-2 pr-3">
                    <Select value={util.status} onChange={v => updateUtility(util.id, 'status', v)} disabled={readOnly} options={[...t.utilityStatuses]} />
                  </td>
                  {!readOnly && (
                    <td className="py-2">
                      <button type="button" onClick={() => removeUtility(util.id)} className="p-1 text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <button type="button" onClick={addUtility}
            className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addUtility}
          </button>
        )}
      </Card>

      <Card title={t.handDigCard} icon={<Shovel className="w-5 h-5" />}>
        <Toggle label={t.handDigRequired} checked={u.handDigRequired} onChange={v => onUpdate({ handDigRequired: v })} disabled={readOnly} />
        {u.handDigRequired && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={t.handDigDistance}><NumberInput value={u.handDigDistance} onChange={v => onUpdate({ handDigDistance: v })} disabled={readOnly} /></Field>
          </div>
        )}
        <Field label={t.clearanceNotes}><Textarea value={u.clearanceNotes} onChange={v => onUpdate({ clearanceNotes: v })} disabled={readOnly} /></Field>
      </Card>
    </div>
  );
}

function AtmosphericSection({ language, permitData, readOnly, onUpdate }: SectionProps) {
  const t = T[language];
  const a = permitData.atmospheric;

  const addReading = () => {
    const now = new Date().toTimeString().slice(0, 5);
    onUpdate({ readings: [...a.readings, { id: generateId(), time: now, oxygen: 20.9, lel: 0, h2s: 0, co: 0, location: '' }] });
  };

  const removeReading = (id: string) => onUpdate({ readings: a.readings.filter(r => r.id !== id) });

  const updateReading = (id: string, field: string, value: any) => {
    onUpdate({ readings: a.readings.map(r => r.id === id ? { ...r, [field]: value } : r) });
  };

  const cellClass = (field: string, value: number) => {
    const danger = (field === 'oxygen' && (value < 19.5 || value > 23.5))
      || (field === 'lel' && value > 10)
      || (field === 'h2s' && value > 10)
      || (field === 'co' && value > 35);
    return danger
      ? 'border border-red-400 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 text-sm w-full focus:ring-2 focus:ring-red-500 outline-none'
      : 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none';
  };

  return (
    <div>
      <Card title={t.testCard} icon={<Wind className="w-5 h-5" />}>
        <Toggle label={t.testRequired} checked={a.testRequired} onChange={v => onUpdate({ testRequired: v })} disabled={readOnly} />
        {a.testRequired && (
          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            <Field label={t.testEquipment}><Input value={a.testEquipment} onChange={v => onUpdate({ testEquipment: v })} disabled={readOnly} /></Field>
            <Field label={t.equipmentCalDate}><Input value={a.equipmentCalDate} onChange={v => onUpdate({ equipmentCalDate: v })} disabled={readOnly} type="date" /></Field>
          </div>
        )}
      </Card>

      <Card title={t.readingsCard} icon={<BarChart3 className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {[t.readingTime, t.oxygen, t.lel, t.h2s, t.co, t.location].map(h => (
                  <th key={h} className="text-left py-2 pr-2 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
                {!readOnly && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {a.readings.map(r => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="py-2 pr-2"><Input value={r.time} onChange={v => updateReading(r.id, 'time', v)} disabled={readOnly} type="time" /></td>
                  <td className="py-2 pr-2"><input type="number" value={r.oxygen} step={0.1} onChange={e => updateReading(r.id, 'oxygen', parseFloat(e.target.value) || 0)} disabled={readOnly} className={cellClass('oxygen', r.oxygen)} /></td>
                  <td className="py-2 pr-2"><input type="number" value={r.lel} step={0.1} onChange={e => updateReading(r.id, 'lel', parseFloat(e.target.value) || 0)} disabled={readOnly} className={cellClass('lel', r.lel)} /></td>
                  <td className="py-2 pr-2"><input type="number" value={r.h2s} step={0.1} onChange={e => updateReading(r.id, 'h2s', parseFloat(e.target.value) || 0)} disabled={readOnly} className={cellClass('h2s', r.h2s)} /></td>
                  <td className="py-2 pr-2"><input type="number" value={r.co} step={1} onChange={e => updateReading(r.id, 'co', parseFloat(e.target.value) || 0)} disabled={readOnly} className={cellClass('co', r.co)} /></td>
                  <td className="py-2 pr-2"><Input value={r.location} onChange={v => updateReading(r.id, 'location', v)} disabled={readOnly} /></td>
                  {!readOnly && (
                    <td className="py-2">
                      <button type="button" onClick={() => removeReading(r.id)} className="p-1 text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <button type="button" onClick={addReading}
            className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors mt-2">
            <Plus className="w-4 h-4" />{t.addReading}
          </button>
        )}
      </Card>

      <Card title={t.continuousCard} icon={<Wind className="w-5 h-5" />}>
        <Toggle label={t.continuousMonitoring} checked={a.continuousMonitoring} onChange={v => onUpdate({ continuousMonitoring: v })} disabled={readOnly} />
        {a.continuousMonitoring && (
          <Field label={t.alarmSettings}>
            <Textarea value={a.alarmSettings} onChange={v => onUpdate({ alarmSettings: v })} disabled={readOnly} placeholder={t.alarmSettingsPh} />
          </Field>
        )}
      </Card>
    </div>
  );
}

function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language; permit: ExcavationPermit; completion: number; readOnly: boolean;
  onUpdate: (updater: (p: ExcavationPermit) => ExcavationPermit) => void; onSave: () => void;
}) {
  const t = T[language];
  const field = (key: string, val: string) => onUpdate(p => ({ ...p, [key]: val }));
  const setStatus = (s: PermitStatus) => onUpdate(p => ({ ...p, status: s }));

  const warnings: string[] = [];
  if (!permit.siteInfo.workLocation) warnings.push(language === 'fr' ? 'Lieu des travaux manquant' : 'Work location missing');
  if (!permit.siteInfo.soilClass) warnings.push(language === 'fr' ? 'Classe de sol non renseignée' : 'Soil class not specified');
  if (!permit.shoring.requiredMethod) warnings.push(language === 'fr' ? 'Méthode de protection non sélectionnée' : 'Protection method not selected');

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
              <div key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
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
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-medium transition-colors">
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
interface ExcavationProps {
  tenant?: string;
  language?: Language;
  province?: ProvinceCode;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: ExcavationPermit) => void;
  onCancel?: () => void;
  initialData?: Partial<ExcavationPermit>;
  readOnly?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Excavation({
  tenant = 'demo',
  language = 'fr',
  province = 'QC',
  selectedProvince,
  enableAutoSave = true,
  onSave,
  onCancel,
  initialData,
  readOnly = false,
}: ExcavationProps) {
  const resolvedProvince: ProvinceCode = (selectedProvince ?? province) as ProvinceCode;
  const t = T[language];

  const [permit, setPermit] = useState<ExcavationPermit>(() => ({
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

  const persistPermit = useCallback(async (data: ExcavationPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'excavation',
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

  const updatePermit = useCallback((updater: (prev: ExcavationPermit) => ExcavationPermit) => {
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
    { id: 'hazards', icon: <AlertTriangle className="w-4 h-4" />, label: t.sections.hazards },
    { id: 'shoring', icon: <Layers className="w-4 h-4" />, label: t.sections.shoring },
    { id: 'utilities', icon: <Cable className="w-4 h-4" />, label: t.sections.utilities },
    { id: 'atmospheric', icon: <Wind className="w-4 h-4" />, label: t.sections.atmospheric },
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
            <Shovel className="w-5 h-5 text-amber-700 shrink-0" />
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
                  ? 'border-amber-700 text-amber-700'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}>
              {s.icon}<span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${completion}%` }} />
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
          {section === 'hazards' && (
            <HazardsSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, hazards: { ...p.hazards, ...data } }))} />
          )}
          {section === 'shoring' && (
            <ShoringSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, shoring: { ...p.shoring, ...data } }))} />
          )}
          {section === 'utilities' && (
            <UtilitiesSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, utilities: { ...p.utilities, ...data } }))} />
          )}
          {section === 'atmospheric' && (
            <AtmosphericSection language={language} permitData={permit} readOnly={readOnly}
              onUpdate={data => updatePermit(p => ({ ...p, atmospheric: { ...p.atmospheric, ...data } }))} />
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
