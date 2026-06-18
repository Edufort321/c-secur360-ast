'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { currentTenantSlug } from "@/lib/tenantSlug";
import {
  Settings, Lock, CheckSquare, Users, CheckCircle, Menu, X, Save, Download,
  Printer, Plus, ChevronRight, AlertTriangle, Home, FileText,
  BarChart3, Trash2, Zap, ClipboardList, ChevronDown, ChevronUp
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

export interface LotoPermit {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  equipment: {
    equipmentId: string;
    equipmentName: string;
    equipmentLocation: string;
    department: string;
    drawingRef: string;
    pidRef: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    energyTypes: string[];
    workDescription: string;
    estimatedDuration: string;
    workerCount: number;
  };
  energySources: Array<{
    id: string;
    type: string;
    description: string;
    isolationPoint: string;
    lockPosition: string;
    residualEnergy: string;
    verified: boolean;
    verifiedBy: string;
  }>;
  procedure: {
    notifyAffected: boolean;
    postSignage: boolean;
    lockboxLocation: string;
    steps: Array<{
      id: string;
      stepNumber: number;
      description: string;
      energyType: string;
      isolationPoint: string;
      responsible: string;
      verified: boolean;
    }>;
  };
  verification: {
    allVerified: boolean;
    verificationNotes: string;
    operationalTestPerformed: boolean;
    testResult: string;
    testNotes: string;
  };
  personnel: {
    coordinator: { name: string; company: string; cert: string };
    workers: Array<{
      id: string;
      name: string;
      company: string;
      lockNumber: string;
      lockColor: string;
      appliedAt: string;
      removedAt: string;
    }>;
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

interface LotoProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<LotoPermit>;
}

type Section = 'equipment' | 'energy' | 'procedure' | 'verification' | 'personnel' | 'finalization';

// ── Helpers ────────────────────────────────────────────────────────────────
function generatePermitNumber(province: ProvinceCode, prefix: string): string {
  return `${prefix}-${province}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── All energy type keys ───────────────────────────────────────────────────
const ENERGY_TYPE_KEYS = [
  'Électrique', 'Pneumatique', 'Hydraulique', 'Mécanique', 'Thermique', 'Chimique', 'Gravitationnel',
];
const ENERGY_TYPE_KEYS_EN = [
  'Electrical', 'Pneumatic', 'Hydraulic', 'Mechanical', 'Thermal', 'Chemical', 'Gravitational',
];

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Permis LOTO — Cadenassage/Étiquetage',
    sections: {
      equipment: 'Équipement',
      energy: 'Énergies',
      procedure: 'Procédure',
      verification: 'Vérification',
      personnel: 'Personnel',
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
    equipment: {
      idCard: 'Identification équipement',
      equipmentId: "Identifiant équipement",
      equipmentIdPh: "EQ-2025-001",
      equipmentName: 'Nom de l\'équipement *',
      equipmentNamePh: 'Compresseur d\'air industriel',
      equipmentLocation: 'Emplacement *',
      equipmentLocationPh: 'Salle mécanique, niveau sous-sol',
      department: 'Département',
      departmentPh: 'Production / Maintenance',
      drawingRef: 'Référence dessin',
      drawingRefPh: 'DWG-2025-042',
      pidRef: 'Référence P&ID',
      pidRefPh: 'PID-042-A',
      manufacturer: 'Fabricant',
      manufacturerPh: 'Atlas Copco',
      model: 'Modèle',
      modelPh: 'GA90',
      serialNumber: 'Numéro de série',
      serialNumberPh: 'SN-20250042',
      energyCard: 'Types d\'énergie présents',
      workerCount: 'Nombre de travailleurs',
      estimatedDuration: 'Durée estimée',
      estimatedDurationPh: '4 heures',
      workDescription: 'Description des travaux',
      workDescriptionPh: 'Décrire les travaux de maintenance à effectuer…',
      csaCard: 'Réglementation CSA Z460',
      csaText: 'CSA Z460-20 — Maîtrise des énergies dangereuses : cadenassage et autres méthodes. Applicable dans toutes les provinces canadiennes. Consulter également la réglementation provinciale en vigueur.',
      energyTypes: [
        'Électrique', 'Pneumatique', 'Hydraulique', 'Mécanique', 'Thermique', 'Chimique', 'Gravitationnel',
      ],
    },
    energy: {
      title: 'Sources d\'énergie',
      addSource: 'Ajouter source',
      noSources: 'Aucune source d\'énergie ajoutée pour ce type',
      description: 'Description',
      descriptionPh: 'Description de la source…',
      isolationPoint: 'Point d\'isolation',
      isolationPointPh: 'Localisation du point d\'isolation',
      lockPosition: 'Position du cadenas',
      lockPositionPh: 'Ouvert / Fermé / Verrouillé',
      residualEnergy: 'Énergie résiduelle',
      residualEnergyPh: 'Méthode de dissipation / vérification',
      verified: 'Vérifié',
      verifiedBy: 'Vérifié par',
      verifiedByPh: 'Nom du vérificateur',
      summaryTitle: 'Sommaire des sources',
      fields: {
        'Électrique': {
          tension: 'Tension (V)',
          courant: 'Courant (A)',
          panneau: 'Panneau électrique',
          disjoncteur: 'Disjoncteur / fusible',
          methode: 'Méthode d\'isolation',
        },
        'Pneumatique': {
          pression: 'Pression (kPa)',
          vanne: 'Vanne principale',
          purge: 'Point de purge',
        },
        'Hydraulique': {
          pression: 'Pression (kPa)',
          vanne: 'Vanne d\'isolement',
          purge: 'Point de purge',
        },
        'Mécanique': {
          mouvement: 'Type de mouvement',
          dispositif: 'Dispositif de blocage',
        },
        'Thermique': {
          temperature: 'Température (°C)',
          fluide: 'Fluide',
          purge: 'Point de purge',
        },
        'Chimique': {
          substance: 'Substance',
          rincage: 'Rinçage requis',
        },
        'Gravitationnel': {
          charge: 'Charge (kg)',
          hauteur: 'Hauteur (m)',
          dispositif: 'Dispositif de soutien',
        },
      },
      mouvementTypes: [
        { value: '', label: '— Sélectionner —' },
        { value: 'rotatif', label: 'Rotatif' },
        { value: 'lineaire', label: 'Linéaire' },
        { value: 'oscillant', label: 'Oscillant' },
      ],
    },
    procedure: {
      prepCard: 'Préparation',
      notifyAffected: 'Personnel affecté notifié',
      postSignage: 'Signalisation posée',
      lockboxLocation: 'Emplacement de la boîte de cadenassage',
      lockboxLocationPh: 'Armoire de cadenassage A-12',
      stepsCard: 'Étapes de cadenassage',
      addStep: 'Ajouter une étape',
      stepNumber: 'Étape',
      stepDescription: 'Description',
      stepDescriptionPh: 'Action à réaliser…',
      energyType: 'Type d\'énergie',
      isolationPoint: 'Point d\'isolation',
      isolationPointPh: 'Localisation',
      responsible: 'Responsable',
      responsiblePh: 'Nom',
      verified: 'Vérifié',
      stepCount: 'étape(s)',
      provinceNote: {
        QC: 'LSST art. 202-208 — Cadenassage obligatoire pour travaux de maintenance.',
        ON: 'OHSA sec. 75.1 — Lock out / tag out obligatoire.',
        AB: 'OHS Code Part 15 — Energy isolation program.',
        BC: 'OHS Reg 10.1-10.14 — Hazardous energy control.',
        SK: 'OHS Regulations Part XIII — Lockout.',
        MB: 'Règlement SST — Cadenassage (art. 43).',
        NB: 'Règlement 91-191 — Contrôle des énergies.',
        NS: 'OHS General Reg, Part 11 — Lockout.',
        PE: 'OHS Act Reg, s. 42 — Lockout.',
        NL: 'OHS Reg, Part X — Lockout.',
      },
      noEnergyTypes: 'Sélectionnez d\'abord les types d\'énergie dans l\'onglet Équipement.',
    },
    verification: {
      zeroEnergyCard: 'Vérification zéro énergie',
      method: 'Méthode de vérification',
      result: 'Résultat',
      resultPh: 'Valeur mesurée ou observation',
      verifiedBy: 'Vérifié par',
      verifiedByPh: 'Nom',
      verified: 'Confirmé',
      allVerifiedBadge: 'Toutes les énergies vérifiées',
      notAllVerifiedBadge: 'Vérification incomplète',
      methodOptions: [
        { value: '', label: '— Sélectionner —' },
        { value: 'visuel', label: 'Visuel' },
        { value: 'instrument', label: 'Test instrument' },
        { value: 'mesure', label: 'Mesure' },
      ],
      testCard: 'Test opérationnel',
      testPerformed: 'Test opérationnel effectué',
      testResult: 'Résultat du test',
      testNotes: 'Notes sur le test',
      testNotesPh: 'Observations sur le test opérationnel…',
      testResultOptions: [
        { value: '', label: '— Sélectionner —' },
        { value: 'succes', label: 'Succès' },
        { value: 'echoue', label: 'Échoué' },
        { value: 'non_requis', label: 'Non requis' },
      ],
      notesCard: 'Notes complémentaires',
      verificationNotes: 'Notes de vérification',
      verificationNotesPh: 'Notes, observations ou conditions particulières…',
      noSources: 'Aucune source d\'énergie définie. Allez à l\'onglet Énergies.',
    },
    personnel: {
      coordinatorCard: 'Responsable LOTO',
      coordName: 'Nom *',
      coordNamePh: 'Prénom et nom',
      coordCompany: 'Entreprise',
      coordCompanyPh: 'Nom de la compagnie',
      coordCert: 'Certification',
      coordCertPh: 'N° de certification LOTO',
      workersCard: 'Personnel avec cadenas',
      addWorker: 'Ajouter un travailleur',
      workerName: 'Nom',
      workerNamePh: 'Prénom et nom',
      workerCompany: 'Entreprise',
      workerCompanyPh: 'Compagnie',
      lockNumber: 'N° cadenas',
      lockNumberPh: 'C-042',
      lockColor: 'Couleur',
      appliedAt: 'Apposé à',
      removedAt: 'Retiré à',
      lockCount: 'cadenas',
      lockColors: [
        { value: 'rouge', label: 'Rouge', hex: '#ef4444' },
        { value: 'jaune', label: 'Jaune', hex: '#eab308' },
        { value: 'bleu', label: 'Bleu', hex: '#3b82f6' },
        { value: 'vert', label: 'Vert', hex: '#22c55e' },
        { value: 'orange', label: 'Orange', hex: '#f97316' },
        { value: 'blanc', label: 'Blanc', hex: '#f1f5f9' },
        { value: 'noir', label: 'Noir', hex: '#1e293b' },
      ],
    },
    finalization: {
      supervisorSignature: 'Signature du responsable LOTO',
      supervisorName: 'Nom du responsable',
      supervisorNamePh: 'Prénom et nom',
      supervisorCert: 'Certification',
      supervisorCertPh: 'N° de certification',
      validFrom: 'Permis valide du',
      validTo: 'Permis valide jusqu\'au',
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
      QC: 'Québec', ON: 'Ontario', BC: 'Colombie-Britannique', AB: 'Alberta',
      SK: 'Saskatchewan', MB: 'Manitoba', NB: 'Nouveau-Brunswick',
      NS: 'Nouvelle-Écosse', PE: 'Î.-P.-É.', NL: 'T.-N.-L.',
    },
  },
  en: {
    title: 'LOTO Permit — Lockout/Tagout',
    sections: {
      equipment: 'Equipment',
      energy: 'Energy',
      procedure: 'Procedure',
      verification: 'Verification',
      personnel: 'Personnel',
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
    equipment: {
      idCard: 'Equipment identification',
      equipmentId: 'Equipment ID',
      equipmentIdPh: 'EQ-2025-001',
      equipmentName: 'Equipment name *',
      equipmentNamePh: 'Industrial air compressor',
      equipmentLocation: 'Location *',
      equipmentLocationPh: 'Mechanical room, basement level',
      department: 'Department',
      departmentPh: 'Production / Maintenance',
      drawingRef: 'Drawing reference',
      drawingRefPh: 'DWG-2025-042',
      pidRef: 'P&ID reference',
      pidRefPh: 'PID-042-A',
      manufacturer: 'Manufacturer',
      manufacturerPh: 'Atlas Copco',
      model: 'Model',
      modelPh: 'GA90',
      serialNumber: 'Serial number',
      serialNumberPh: 'SN-20250042',
      energyCard: 'Energy types present',
      workerCount: 'Number of workers',
      estimatedDuration: 'Estimated duration',
      estimatedDurationPh: '4 hours',
      workDescription: 'Work description',
      workDescriptionPh: 'Describe the maintenance work to be performed…',
      csaCard: 'CSA Z460 Regulations',
      csaText: 'CSA Z460-20 — Control of hazardous energy: lockout and other methods. Applicable across all Canadian provinces. Also consult applicable provincial regulations.',
      energyTypes: [
        'Electrical', 'Pneumatic', 'Hydraulic', 'Mechanical', 'Thermal', 'Chemical', 'Gravitational',
      ],
    },
    energy: {
      title: 'Energy sources',
      addSource: 'Add source',
      noSources: 'No energy sources added for this type',
      description: 'Description',
      descriptionPh: 'Energy source description…',
      isolationPoint: 'Isolation point',
      isolationPointPh: 'Isolation point location',
      lockPosition: 'Lock position',
      lockPositionPh: 'Open / Closed / Locked',
      residualEnergy: 'Residual energy',
      residualEnergyPh: 'Dissipation method / verification',
      verified: 'Verified',
      verifiedBy: 'Verified by',
      verifiedByPh: 'Verifier name',
      summaryTitle: 'Sources summary',
      fields: {
        'Electrical': {
          tension: 'Voltage (V)',
          courant: 'Current (A)',
          panneau: 'Electrical panel',
          disjoncteur: 'Circuit breaker / fuse',
          methode: 'Isolation method',
        },
        'Pneumatic': {
          pression: 'Pressure (kPa)',
          vanne: 'Main valve',
          purge: 'Bleed point',
        },
        'Hydraulic': {
          pression: 'Pressure (kPa)',
          vanne: 'Isolation valve',
          purge: 'Bleed point',
        },
        'Mechanical': {
          mouvement: 'Motion type',
          dispositif: 'Blocking device',
        },
        'Thermal': {
          temperature: 'Temperature (°C)',
          fluide: 'Fluid',
          purge: 'Bleed point',
        },
        'Chemical': {
          substance: 'Substance',
          rincage: 'Flushing required',
        },
        'Gravitational': {
          charge: 'Load (kg)',
          hauteur: 'Height (m)',
          dispositif: 'Support device',
        },
      },
      mouvementTypes: [
        { value: '', label: '— Select —' },
        { value: 'rotatif', label: 'Rotary' },
        { value: 'lineaire', label: 'Linear' },
        { value: 'oscillant', label: 'Oscillating' },
      ],
    },
    procedure: {
      prepCard: 'Preparation',
      notifyAffected: 'Affected personnel notified',
      postSignage: 'Signage posted',
      lockboxLocation: 'Lockbox location',
      lockboxLocationPh: 'Lockout cabinet A-12',
      stepsCard: 'Lockout steps',
      addStep: 'Add step',
      stepNumber: 'Step',
      stepDescription: 'Description',
      stepDescriptionPh: 'Action to perform…',
      energyType: 'Energy type',
      isolationPoint: 'Isolation point',
      isolationPointPh: 'Location',
      responsible: 'Responsible',
      responsiblePh: 'Name',
      verified: 'Verified',
      stepCount: 'step(s)',
      provinceNote: {
        QC: 'LSST art. 202-208 — Mandatory lockout for maintenance work.',
        ON: 'OHSA sec. 75.1 — Lock out / tag out mandatory.',
        AB: 'OHS Code Part 15 — Energy isolation program.',
        BC: 'OHS Reg 10.1-10.14 — Hazardous energy control.',
        SK: 'OHS Regulations Part XIII — Lockout.',
        MB: 'OHS Reg — Lockout (s. 43).',
        NB: 'Reg 91-191 — Energy control.',
        NS: 'OHS General Reg, Part 11 — Lockout.',
        PE: 'OHS Act Reg, s. 42 — Lockout.',
        NL: 'OHS Reg, Part X — Lockout.',
      },
      noEnergyTypes: 'First select energy types in the Equipment tab.',
    },
    verification: {
      zeroEnergyCard: 'Zero energy verification',
      method: 'Verification method',
      result: 'Result',
      resultPh: 'Measured value or observation',
      verifiedBy: 'Verified by',
      verifiedByPh: 'Name',
      verified: 'Confirmed',
      allVerifiedBadge: 'All energies verified',
      notAllVerifiedBadge: 'Verification incomplete',
      methodOptions: [
        { value: '', label: '— Select —' },
        { value: 'visuel', label: 'Visual' },
        { value: 'instrument', label: 'Instrument test' },
        { value: 'mesure', label: 'Measurement' },
      ],
      testCard: 'Operational test',
      testPerformed: 'Operational test performed',
      testResult: 'Test result',
      testNotes: 'Test notes',
      testNotesPh: 'Observations on the operational test…',
      testResultOptions: [
        { value: '', label: '— Select —' },
        { value: 'succes', label: 'Success' },
        { value: 'echoue', label: 'Failed' },
        { value: 'non_requis', label: 'Not required' },
      ],
      notesCard: 'Additional notes',
      verificationNotes: 'Verification notes',
      verificationNotesPh: 'Notes, observations or special conditions…',
      noSources: 'No energy sources defined. Go to the Energy tab.',
    },
    personnel: {
      coordinatorCard: 'LOTO coordinator',
      coordName: 'Name *',
      coordNamePh: 'First and last name',
      coordCompany: 'Company',
      coordCompanyPh: 'Company name',
      coordCert: 'Certification',
      coordCertPh: 'LOTO certification number',
      workersCard: 'Personnel with locks',
      addWorker: 'Add worker',
      workerName: 'Name',
      workerNamePh: 'First and last name',
      workerCompany: 'Company',
      workerCompanyPh: 'Company',
      lockNumber: 'Lock no.',
      lockNumberPh: 'L-042',
      lockColor: 'Color',
      appliedAt: 'Applied at',
      removedAt: 'Removed at',
      lockCount: 'lock(s)',
      lockColors: [
        { value: 'rouge', label: 'Red', hex: '#ef4444' },
        { value: 'jaune', label: 'Yellow', hex: '#eab308' },
        { value: 'bleu', label: 'Blue', hex: '#3b82f6' },
        { value: 'vert', label: 'Green', hex: '#22c55e' },
        { value: 'orange', label: 'Orange', hex: '#f97316' },
        { value: 'blanc', label: 'White', hex: '#f1f5f9' },
        { value: 'noir', label: 'Black', hex: '#1e293b' },
      ],
    },
    finalization: {
      supervisorSignature: 'LOTO coordinator signature',
      supervisorName: 'Coordinator name',
      supervisorNamePh: 'First and last name',
      supervisorCert: 'Certification',
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
      QC: 'Québec', ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta',
      SK: 'Saskatchewan', MB: 'Manitoba', NB: 'New Brunswick',
      NS: 'Nova Scotia', PE: 'P.E.I.', NL: 'N.L.',
    },
  },
} as const;

// ── Default permit ─────────────────────────────────────────────────────────
function createDefaultPermit(province: ProvinceCode): LotoPermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province, 'LOTO'),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    equipment: {
      equipmentId: '', equipmentName: '', equipmentLocation: '', department: '',
      drawingRef: '', pidRef: '', manufacturer: '', model: '', serialNumber: '',
      energyTypes: [], workDescription: '', estimatedDuration: '', workerCount: 1,
    },
    energySources: [],
    procedure: {
      notifyAffected: false, postSignage: false, lockboxLocation: '', steps: [],
    },
    verification: {
      allVerified: false, verificationNotes: '',
      operationalTestPerformed: false, testResult: '', testNotes: '',
    },
    personnel: {
      coordinator: { name: '', company: '', cert: '' },
      workers: [],
    },
    supervisor_name: '', supervisor_cert: '',
    permit_valid_from: '', permit_valid_to: '',
    permitted_work: '', restrictions: '', finalization_notes: '',
    validation: { isComplete: false, percentage: 0 },
  };
}

// ── Completion ─────────────────────────────────────────────────────────────
function computeCompletion(permit: LotoPermit): number {
  let score = 0;
  if (permit.equipment.equipmentName) score++;
  if (permit.energySources.length > 0) score++;
  if (permit.procedure.steps.length > 0) score++;
  if (permit.verification.operationalTestPerformed) score++;
  if (permit.personnel.coordinator.name) score++;
  if (permit.personnel.workers.length > 0) score++;
  return Math.round((score / 6) * 100);
}

// ── Shared UI primitives ───────────────────────────────────────────────────
function Card({ title, icon, children, badge }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-slate-700 dark:text-slate-400">{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">{title}</h3>
        {badge}
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800"
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
        className="h-4 w-4 rounded border-slate-300 accent-slate-700"
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
    />
  );
}

// ── Section: Equipment ─────────────────────────────────────────────────────
function EquipmentSection({ language, permit, readOnly, onUpdate }: {
  language: Language;
  permit: LotoPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
}) {
  const t = T[language];
  const te = t.equipment;
  const eq = permit.equipment;

  const upd = (key: keyof typeof eq, value: any) =>
    onUpdate(p => ({ ...p, equipment: { ...p.equipment, [key]: value } }));

  const toggleEnergyType = (type: string) => {
    const next = eq.energyTypes.includes(type)
      ? eq.energyTypes.filter(e => e !== type)
      : [...eq.energyTypes, type];
    upd('energyTypes', next);
  };

  return (
    <div>
      <Card title={te.idCard} icon={<Settings className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={te.equipmentId}>
            <TextInput value={eq.equipmentId} onChange={v => upd('equipmentId', v)} placeholder={te.equipmentIdPh} disabled={readOnly} />
          </Field>
          <Field label={te.equipmentName}>
            <TextInput value={eq.equipmentName} onChange={v => upd('equipmentName', v)} placeholder={te.equipmentNamePh} disabled={readOnly} />
          </Field>
          <Field label={te.equipmentLocation}>
            <TextInput value={eq.equipmentLocation} onChange={v => upd('equipmentLocation', v)} placeholder={te.equipmentLocationPh} disabled={readOnly} />
          </Field>
          <Field label={te.department}>
            <TextInput value={eq.department} onChange={v => upd('department', v)} placeholder={te.departmentPh} disabled={readOnly} />
          </Field>
          <Field label={te.drawingRef}>
            <TextInput value={eq.drawingRef} onChange={v => upd('drawingRef', v)} placeholder={te.drawingRefPh} disabled={readOnly} />
          </Field>
          <Field label={te.pidRef}>
            <TextInput value={eq.pidRef} onChange={v => upd('pidRef', v)} placeholder={te.pidRefPh} disabled={readOnly} />
          </Field>
          <Field label={te.manufacturer}>
            <TextInput value={eq.manufacturer} onChange={v => upd('manufacturer', v)} placeholder={te.manufacturerPh} disabled={readOnly} />
          </Field>
          <Field label={te.model}>
            <TextInput value={eq.model} onChange={v => upd('model', v)} placeholder={te.modelPh} disabled={readOnly} />
          </Field>
          <Field label={te.serialNumber}>
            <TextInput value={eq.serialNumber} onChange={v => upd('serialNumber', v)} placeholder={te.serialNumberPh} disabled={readOnly} />
          </Field>
        </div>
      </Card>

      <Card title={te.energyCard} icon={<Zap className="w-5 h-5" />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {te.energyTypes.map((type) => (
            <label key={type} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-colors ${
              eq.energyTypes.includes(type)
                ? 'bg-slate-700 border-slate-700 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={eq.energyTypes.includes(type)}
                onChange={() => toggleEnergyType(type)}
                className="h-3.5 w-3.5"
                disabled={readOnly}
              />
              <span className="text-sm font-medium">{type}</span>
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Field label={te.workerCount}>
            <NumberInput value={eq.workerCount} onChange={v => upd('workerCount', v)} min={1} disabled={readOnly} />
          </Field>
          <Field label={te.estimatedDuration}>
            <TextInput value={eq.estimatedDuration} onChange={v => upd('estimatedDuration', v)} placeholder={te.estimatedDurationPh} disabled={readOnly} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={te.workDescription}>
              <Textarea value={eq.workDescription} onChange={v => upd('workDescription', v)} placeholder={te.workDescriptionPh} rows={3} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title={te.csaCard} icon={<FileText className="w-5 h-5" />}>
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          <p className="font-semibold mb-1">CSA Z460-20</p>
          <p>{te.csaText}</p>
        </div>
      </Card>
    </div>
  );
}

// ── Energy source form per type ────────────────────────────────────────────
function EnergySourceForm({ language, energyType, source, readOnly, onChange, onRemove }: {
  language: Language;
  energyType: string;
  source: LotoPermit['energySources'][0];
  readOnly: boolean;
  onChange: (key: string, value: any) => void;
  onRemove: () => void;
}) {
  const t = T[language].energy;
  const fieldsMap = t.fields as Record<string, Record<string, string>>;
  const typeFields = fieldsMap[energyType] ?? {};

  return (
    <div className="bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{energyType}</span>
        {!readOnly && (
          <button type="button" onClick={onRemove} className="p-1 text-red-500 hover:text-red-700 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={t.description}>
            <TextInput value={source.description} onChange={v => onChange('description', v)} placeholder={t.descriptionPh} disabled={readOnly} />
          </Field>
        </div>

        {/* Type-specific fields rendered as free-text for simplicity within the description sub-fields */}
        {Object.entries(typeFields).map(([key, label]) => {
          if (key === 'rincage') {
            return (
              <div key={key} className="flex items-end pb-1">
                <Toggle
                  checked={!!(source as any)[key]}
                  onChange={v => onChange(key, v)}
                  label={label}
                  disabled={readOnly}
                />
              </div>
            );
          }
          if (key === 'mouvement') {
            return (
              <Field key={key} label={label}>
                <SelectInput
                  value={(source as any)[key] ?? ''}
                  onChange={v => onChange(key, v)}
                  options={t.mouvementTypes as any}
                  disabled={readOnly}
                />
              </Field>
            );
          }
          return (
            <Field key={key} label={label}>
              <TextInput
                value={(source as any)[key] ?? ''}
                onChange={v => onChange(key, v)}
                disabled={readOnly}
              />
            </Field>
          );
        })}

        <Field label={t.isolationPoint}>
          <TextInput value={source.isolationPoint} onChange={v => onChange('isolationPoint', v)} placeholder={t.isolationPointPh} disabled={readOnly} />
        </Field>
        <Field label={t.lockPosition}>
          <TextInput value={source.lockPosition} onChange={v => onChange('lockPosition', v)} placeholder={t.lockPositionPh} disabled={readOnly} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t.residualEnergy}>
            <TextInput value={source.residualEnergy} onChange={v => onChange('residualEnergy', v)} placeholder={t.residualEnergyPh} disabled={readOnly} />
          </Field>
        </div>
        <Field label={t.verifiedBy}>
          <TextInput value={source.verifiedBy} onChange={v => onChange('verifiedBy', v)} placeholder={t.verifiedByPh} disabled={readOnly} />
        </Field>
        <div className="flex items-end pb-1">
          <Toggle checked={source.verified} onChange={v => onChange('verified', v)} label={t.verified} disabled={readOnly} />
        </div>
      </div>
    </div>
  );
}

// ── Section: Energy ────────────────────────────────────────────────────────
function EnergySection({ language, permit, readOnly, onUpdate }: {
  language: Language;
  permit: LotoPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
}) {
  const t = T[language].energy;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const addSource = (type: string) => {
    if (readOnly) return;
    const source = {
      id: generateId(), type, description: '', isolationPoint: '', lockPosition: '',
      residualEnergy: '', verified: false, verifiedBy: '',
    };
    onUpdate(p => ({ ...p, energySources: [...p.energySources, source] }));
  };

  const removeSource = (id: string) => {
    onUpdate(p => ({ ...p, energySources: p.energySources.filter(s => s.id !== id) }));
  };

  const updateSource = (id: string, key: string, value: any) => {
    onUpdate(p => ({
      ...p,
      energySources: p.energySources.map(s => s.id === id ? { ...s, [key]: value } : s),
    }));
  };

  const checkedTypes = permit.equipment.energyTypes;

  if (checkedTypes.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <span>{T[language].procedure.noEnergyTypes}</span>
      </div>
    );
  }

  return (
    <div>
      {checkedTypes.map(type => {
        const sources = permit.energySources.filter(s => s.type === type);
        const isCollapsed = collapsed[type];
        return (
          <div key={type} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-400"><Zap className="w-5 h-5" /></span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">{type}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">{sources.length} source(s)</span>
              <button
                type="button"
                onClick={() => setCollapsed(c => ({ ...c, [type]: !c[type] }))}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
            {!isCollapsed && (
              <div className="p-5">
                {sources.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-4">{t.noSources}</p>
                ) : (
                  sources.map(source => (
                    <EnergySourceForm
                      key={source.id}
                      language={language}
                      energyType={type}
                      source={source}
                      readOnly={readOnly}
                      onChange={(key, value) => updateSource(source.id, key, value)}
                      onRemove={() => removeSource(source.id)}
                    />
                  ))
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => addSource(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addSource}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary table */}
      {permit.energySources.length > 0 && (
        <Card title={t.summaryTitle} icon={<ClipboardList className="w-5 h-5" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">{language === 'fr' ? 'Type' : 'Type'}</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">{t.description}</th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">{t.isolationPoint}</th>
                  <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">{t.verified}</th>
                </tr>
              </thead>
              <tbody>
                {permit.energySources.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.type}</td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{s.description || '—'}</td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{s.isolationPoint || '—'}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {s.verified ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Section: Procedure ─────────────────────────────────────────────────────
function ProcedureSection({ language, permit, readOnly, onUpdate }: {
  language: Language;
  permit: LotoPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
}) {
  const t = T[language].procedure;
  const proc = permit.procedure;

  const updProc = (key: keyof typeof proc, value: any) =>
    onUpdate(p => ({ ...p, procedure: { ...p.procedure, [key]: value } }));

  const addStep = () => {
    if (readOnly) return;
    const step = {
      id: generateId(),
      stepNumber: proc.steps.length + 1,
      description: '', energyType: permit.equipment.energyTypes[0] ?? '',
      isolationPoint: '', responsible: '', verified: false,
    };
    updProc('steps', [...proc.steps, step]);
  };

  const removeStep = (id: string) => {
    const updated = proc.steps
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, stepNumber: i + 1 }));
    updProc('steps', updated);
  };

  const updateStep = (id: string, key: string, value: any) => {
    updProc('steps', proc.steps.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const energyTypeOptions = [
    { value: '', label: '—' },
    ...permit.equipment.energyTypes.map(e => ({ value: e, label: e })),
  ];

  const provinceNote = (t.provinceNote as any)[permit.province] ?? '';

  return (
    <div>
      <Card title={t.prepCard} icon={<ClipboardList className="w-5 h-5" />}>
        <div className="space-y-3">
          <Toggle checked={proc.notifyAffected} onChange={v => updProc('notifyAffected', v)} label={t.notifyAffected} disabled={readOnly} />
          <Toggle checked={proc.postSignage} onChange={v => updProc('postSignage', v)} label={t.postSignage} disabled={readOnly} />
          <div className="mt-3">
            <Field label={t.lockboxLocation}>
              <TextInput value={proc.lockboxLocation} onChange={v => updProc('lockboxLocation', v)} placeholder={t.lockboxLocationPh} disabled={readOnly} />
            </Field>
          </div>
        </div>
      </Card>

      <Card
        title={t.stepsCard}
        icon={<ClipboardList className="w-5 h-5" />}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {proc.steps.length} {t.stepCount}
          </span>
        }
      >
        {permit.equipment.energyTypes.length === 0 && (
          <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.noEnergyTypes}</span>
          </div>
        )}

        {proc.steps.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-4">
            {language === 'fr' ? 'Aucune étape ajoutée' : 'No steps added'}
          </p>
        ) : (
          <div className="space-y-3 mb-4">
            {proc.steps.map((step) => (
              <div key={step.id} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold mt-1">
                  {step.stepNumber}
                </div>
                <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label={t.stepDescription}>
                      <TextInput value={step.description} onChange={v => updateStep(step.id, 'description', v)} placeholder={t.stepDescriptionPh} disabled={readOnly} />
                    </Field>
                  </div>
                  <Field label={t.energyType}>
                    <SelectInput value={step.energyType} onChange={v => updateStep(step.id, 'energyType', v)} options={energyTypeOptions} disabled={readOnly} />
                  </Field>
                  <Field label={t.isolationPoint}>
                    <TextInput value={step.isolationPoint} onChange={v => updateStep(step.id, 'isolationPoint', v)} placeholder={t.isolationPointPh} disabled={readOnly} />
                  </Field>
                  <Field label={t.responsible}>
                    <TextInput value={step.responsible} onChange={v => updateStep(step.id, 'responsible', v)} placeholder={t.responsiblePh} disabled={readOnly} />
                  </Field>
                  <div className="flex items-center gap-4">
                    <Toggle checked={step.verified} onChange={v => updateStep(step.id, 'verified', v)} label={t.verified} disabled={readOnly} />
                  </div>
                </div>
                {!readOnly && (
                  <button type="button" onClick={() => removeStep(step.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.addStep}
          </button>
        )}

        {provinceNote && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-0.5">{T[language].provinces[permit.province]}</p>
              <p>{provinceNote}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Section: Verification ──────────────────────────────────────────────────
function VerificationSection({ language, permit, readOnly, onUpdate }: {
  language: Language;
  permit: LotoPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
}) {
  const t = T[language].verification;
  const ver = permit.verification;

  // Local verification state per energy source (stored in energySources.verified + verifiedBy)
  const [verMethods, setVerMethods] = useState<Record<string, string>>({});
  const [verResults, setVerResults] = useState<Record<string, string>>({});

  const updVer = (key: keyof typeof ver, value: any) =>
    onUpdate(p => ({ ...p, verification: { ...p.verification, [key]: value } }));

  const updateSourceVerification = (id: string, field: 'verified' | 'verifiedBy', value: any) => {
    onUpdate(p => ({
      ...p,
      energySources: p.energySources.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const allVerified = permit.energySources.length > 0 && permit.energySources.every(s => s.verified);

  return (
    <div>
      <Card
        title={t.zeroEnergyCard}
        icon={<CheckSquare className="w-5 h-5" />}
        badge={
          permit.energySources.length > 0 ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${allVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {allVerified ? t.allVerifiedBadge : t.notAllVerifiedBadge}
            </span>
          ) : undefined
        }
      >
        {permit.energySources.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t.noSources}</p>
        ) : (
          <div className="space-y-4">
            {permit.energySources.map(source => (
              <div key={source.id} className="bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{source.type}</span>
                    {source.description && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{source.description}</p>
                    )}
                  </div>
                  <Toggle
                    checked={source.verified}
                    onChange={v => updateSourceVerification(source.id, 'verified', v)}
                    label={t.verified}
                    disabled={readOnly}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label={t.method}>
                    <SelectInput
                      value={verMethods[source.id] ?? ''}
                      onChange={v => setVerMethods(m => ({ ...m, [source.id]: v }))}
                      options={t.methodOptions as any}
                      disabled={readOnly}
                    />
                  </Field>
                  <Field label={t.result}>
                    <TextInput
                      value={verResults[source.id] ?? ''}
                      onChange={v => setVerResults(r => ({ ...r, [source.id]: v }))}
                      placeholder={t.resultPh}
                      disabled={readOnly}
                    />
                  </Field>
                  <Field label={t.verifiedBy}>
                    <TextInput
                      value={source.verifiedBy}
                      onChange={v => updateSourceVerification(source.id, 'verifiedBy', v)}
                      placeholder={t.verifiedByPh}
                      disabled={readOnly}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t.testCard} icon={<CheckSquare className="w-5 h-5" />}>
        <div className="space-y-4">
          <Toggle checked={ver.operationalTestPerformed} onChange={v => updVer('operationalTestPerformed', v)} label={t.testPerformed} disabled={readOnly} />
          {ver.operationalTestPerformed && (
            <div className="ml-6 grid gap-4 sm:grid-cols-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <Field label={t.testResult}>
                <SelectInput value={ver.testResult} onChange={v => updVer('testResult', v)} options={t.testResultOptions as any} disabled={readOnly} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.testNotes}>
                  <Textarea value={ver.testNotes} onChange={v => updVer('testNotes', v)} placeholder={t.testNotesPh} rows={3} disabled={readOnly} />
                </Field>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title={t.notesCard} icon={<FileText className="w-5 h-5" />}>
        <Field label={t.verificationNotes}>
          <Textarea value={ver.verificationNotes} onChange={v => updVer('verificationNotes', v)} placeholder={t.verificationNotesPh} rows={4} disabled={readOnly} />
        </Field>
      </Card>
    </div>
  );
}

// ── Section: Personnel ─────────────────────────────────────────────────────
function PersonnelSection({ language, permit, readOnly, onUpdate, personnel = [] }: {
  language: Language;
  permit: LotoPermit;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
  personnel?: EntityOption[];
}) {
  const t = T[language].personnel;
  const coord = permit.personnel.coordinator;
  const workers = permit.personnel.workers;

  const updCoord = (key: keyof typeof coord, value: string) =>
    onUpdate(p => ({ ...p, personnel: { ...p.personnel, coordinator: { ...p.personnel.coordinator, [key]: value } } }));

  const addWorker = () => {
    if (readOnly) return;
    const worker = { id: generateId(), name: '', company: '', lockNumber: '', lockColor: 'rouge', appliedAt: '', removedAt: '' };
    onUpdate(p => ({ ...p, personnel: { ...p.personnel, workers: [...p.personnel.workers, worker] } }));
  };

  const removeWorker = (id: string) => {
    onUpdate(p => ({ ...p, personnel: { ...p.personnel, workers: p.personnel.workers.filter(w => w.id !== id) } }));
  };

  const updateWorker = (id: string, key: string, value: string) => {
    onUpdate(p => ({
      ...p,
      personnel: {
        ...p.personnel,
        workers: p.personnel.workers.map(w => w.id === id ? { ...w, [key]: value } : w),
      },
    }));
  };

  return (
    <div>
      <Card title={t.coordinatorCard} icon={<Users className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t.coordName}>
            <TextInput value={coord.name} onChange={v => updCoord('name', v)} placeholder={t.coordNamePh} disabled={readOnly} />
          </Field>
          <Field label={t.coordCompany}>
            <TextInput value={coord.company} onChange={v => updCoord('company', v)} placeholder={t.coordCompanyPh} disabled={readOnly} />
          </Field>
          <Field label={t.coordCert}>
            <TextInput value={coord.cert} onChange={v => updCoord('cert', v)} placeholder={t.coordCertPh} disabled={readOnly} />
          </Field>
        </div>
      </Card>

      <Card
        title={t.workersCard}
        icon={<Lock className="w-5 h-5" />}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {workers.length} {t.lockCount}
          </span>
        }
      >
        <div className="flex justify-end mb-4">
          {!readOnly && (
            <button
              type="button"
              onClick={addWorker}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addWorker}
            </button>
          )}
        </div>

        {workers.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
            {language === 'fr' ? 'Aucun travailleur ajouté' : 'No workers added'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.workerName}</th>
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.workerCompany}</th>
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.lockNumber}</th>
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.lockColor}</th>
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.appliedAt}</th>
                  <th className="text-left py-2 pr-3 font-medium text-slate-600 dark:text-slate-400">{t.removedAt}</th>
                  {!readOnly && <th className="py-2 w-8" />}
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-2 pr-3">
                      <EntitySearch value={worker.name} readOnly={readOnly} options={personnel} onText={v => updateWorker(worker.id, 'name', v)} onPick={o => updateWorker(worker.id, 'name', o.label)} placeholder={t.workerNamePh} />
                    </td>
                    <td className="py-2 pr-3">
                      <TextInput value={worker.company} onChange={v => updateWorker(worker.id, 'company', v)} placeholder={t.workerCompanyPh} disabled={readOnly} />
                    </td>
                    <td className="py-2 pr-3">
                      <TextInput value={worker.lockNumber} onChange={v => updateWorker(worker.id, 'lockNumber', v)} placeholder={t.lockNumberPh} disabled={readOnly} />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        {worker.lockColor && (
                          <div
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: t.lockColors.find(c => c.value === worker.lockColor)?.hex ?? '#888' }}
                          />
                        )}
                        <select
                          value={worker.lockColor}
                          onChange={e => updateWorker(worker.id, 'lockColor', e.target.value)}
                          disabled={readOnly}
                          className="border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 outline-none disabled:bg-slate-50"
                        >
                          {t.lockColors.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <TextInput type="datetime-local" value={worker.appliedAt} onChange={v => updateWorker(worker.id, 'appliedAt', v)} disabled={readOnly} />
                    </td>
                    <td className="py-2 pr-3">
                      <TextInput type="datetime-local" value={worker.removedAt} onChange={v => updateWorker(worker.id, 'removedAt', v)} disabled={readOnly} />
                    </td>
                    {!readOnly && (
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeWorker(worker.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Section: Finalization ──────────────────────────────────────────────────
function FinalizationSection({ language, permit, completion, readOnly, onUpdate, onSave }: {
  language: Language;
  permit: LotoPermit;
  completion: number;
  readOnly: boolean;
  onUpdate: (updater: (p: LotoPermit) => LotoPermit) => void;
  onSave: () => void;
}) {
  const t = T[language].finalization;

  const field = (key: keyof LotoPermit, val: string) =>
    onUpdate(p => ({ ...p, [key]: val }));

  const setStatus = (status: PermitStatus) =>
    onUpdate(p => ({ ...p, status }));

  const warnings: string[] = [];
  if (!permit.equipment.equipmentName)
    warnings.push(language === 'fr' ? 'Nom de l\'équipement manquant' : 'Equipment name missing');
  if (permit.energySources.length === 0)
    warnings.push(language === 'fr' ? 'Aucune source d\'énergie définie' : 'No energy sources defined');
  if (permit.procedure.steps.length === 0)
    warnings.push(language === 'fr' ? 'Aucune étape de cadenassage' : 'No lockout steps defined');
  if (!permit.personnel.coordinator.name)
    warnings.push(language === 'fr' ? 'Responsable LOTO non défini' : 'LOTO coordinator not defined');

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

// ── Main component ─────────────────────────────────────────────────────────
export default function Loto({
  tenant = 'demo',
  language = 'fr',
  selectedProvince = 'QC',
  enableAutoSave = true,
  onSave,
  onCancel,
  readOnly = false,
  initialData,
}: LotoProps) {
  const t = T[language];

  const [permit, setPermit] = useState<LotoPermit>(() => ({
    ...createDefaultPermit(selectedProvince),
    ...initialData,
  }));

  const dir = useTenantDirectory(tenant);
  const [section, setSection] = useState<Section>('equipment');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Province sync
  useEffect(() => {
    setPermit(p => ({ ...p, province: selectedProvince }));
  }, [selectedProvince]);

  // Persist
  const persistPermit = useCallback(async (data: LotoPermit) => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      if (supabase) {
        await supabase.from('work_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          type: 'loto',
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

  const updatePermit = useCallback((updater: (prev: LotoPermit) => LotoPermit) => {
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
    { id: 'equipment', icon: <Settings className="w-4 h-4" />, label: t.sections.equipment },
    { id: 'energy', icon: <Zap className="w-4 h-4" />, label: t.sections.energy },
    { id: 'procedure', icon: <ClipboardList className="w-4 h-4" />, label: t.sections.procedure },
    { id: 'verification', icon: <CheckSquare className="w-4 h-4" />, label: t.sections.verification },
    { id: 'personnel', icon: <Users className="w-4 h-4" />, label: t.sections.personnel },
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
            <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
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
                    setSection('equipment');
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
                  ? 'border-slate-700 text-slate-700 dark:border-slate-300 dark:text-slate-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 dark:bg-slate-400 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {section === 'equipment' && (
            <EquipmentSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} />
          )}
          {section === 'energy' && (
            <EnergySection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} />
          )}
          {section === 'procedure' && (
            <ProcedureSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} />
          )}
          {section === 'verification' && (
            <VerificationSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} />
          )}
          {section === 'personnel' && (
            <PersonnelSection language={language} permit={permit} readOnly={readOnly} onUpdate={updatePermit} personnel={dir.personnel} />
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
