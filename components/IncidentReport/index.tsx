'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { EntitySearch } from '@/components/ui/EntitySearch';
import {
  FileText, MapPin, User, Heart, AlignLeft, Truck, Search,
  CheckSquare, Scale, PenLine, ArrowLeft, Save, Send, Plus,
  Trash2, ChevronDown, ChevronUp, AlertTriangle, Shield,
  RotateCcw, CheckCircle, Clock, Car, Building2, Activity, Printer, ClipboardCheck,
} from 'lucide-react';
import { useLanguage, type Lang } from '@/contexts/LanguageContext';
import {
  listActionsByIncident, createIncidentAction, updateIncidentAction, deleteIncidentAction,
  isActionOverdue, ACTION_STATUSES, ACTION_PRIORITIES,
  type IncidentAction, type IncidentActionStatus,
} from '@/lib/incidentActions';
import { BODY_REGION_LABELS } from '@/lib/hse/bodyRegions';
import BodyMap, { BODY_REGIONS, FACE_REGIONS, HAND_L_REGIONS, HAND_R_REGIONS, FOOT_L_REGIONS, FOOT_R_REGIONS } from './BodyMap';

// Libellé d'une zone corporelle (id → nom) pour l'export PDF — construit depuis les régions de BodyMap.
const BODY_LABELS: Record<string, { fr: string; en: string }> = {};
for (const r of [...BODY_REGIONS, ...FACE_REGIONS, ...HAND_L_REGIONS, ...HAND_R_REGIONS, ...FOOT_L_REGIONS, ...FOOT_R_REGIONS]) BODY_LABELS[r.id] = { fr: r.labelFr, en: r.labelEn };
const bodyLabel = (id: string, lang: 'fr' | 'en') => BODY_LABELS[id]?.[lang] || id;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BodyModel = dynamic<{
  data?: { name: string; muscles: string[] }[];
  bodyColor?: string;
  highlightedColors?: string[];
  onClick?: (exercise: { muscle: string; data: any }) => void;
  style?: React.CSSProperties;
  type?: string;
}>(
  () => import('react-body-highlighter').then(m => ({ default: (m as any).default ?? m })),
  { ssr: false, loading: () => <div className="w-40 h-64 bg-gray-100 rounded-xl animate-pulse mx-auto" /> }
);

// ── Types ────────────────────────────────────────────────────────────────────

export type IncidentType = 'accident' | 'near_miss' | 'vehicle' | 'property' | 'medical';
export type IncidentStatus = 'draft' | 'submitted' | 'closed';
export type Province = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';

interface InjuredPerson {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  employeeId: string;
  phone: string;
  bodyRegions: string[];
  injuryType: string;
  injuryDescription: string;
  medicalTreatment: 'none' | 'first_aid' | 'clinic' | 'hospital' | 'emergency';
  lostTime: boolean;
  lostTimeDays: number;
  returnToWorkDate: string;
  restricted?: boolean;   // travail restreint / mutation → compte dans le DART rate (réglementaire)
  fatality?: boolean;     // décès → classification réglementaire FATALITY (avis immédiat)
}

interface WitnessInfo {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  phone: string;
  statement: string;
}

interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface IncidentReportData {
  incidentType: IncidentType;
  province: Province;
  severityLevel: number; // GRAVITÉ seule (1=mineur .. 5=critique), indépendante du type (accident vs presque-accident = champ incidentType)
  incidentDate: string;
  incidentTime: string;
  reportedDate: string;
  reportedBy: string;
  reportedByTitle: string;
  reportedByPhone: string;
  address: string;
  department: string;
  exactLocation: string;
  weatherConditions: string;
  lighting: string;
  injuredPersons: InjuredPerson[];
  witnesses: WitnessInfo[];
  description: string;
  immediateAction: string;
  workType: string;
  contributingFactors: string[];
  vehicleInvolved: boolean;
  vehicle: {
    vehicleId: string;
    licensePlate: string;
    make: string;
    model: string;
    year: string;
    kmAtIncident: string;
    collisionType: string;
    otherVehicle: boolean;
    otherVehicleDesc: string;
    policeReport: boolean;
    policeReportNumber: string;
    damageDescription: string;
  };
  propertyDamageInvolved: boolean;
  propertyDamage: {
    description: string;
    estimatedCost: string;
    location: string;
  };
  whyAnalysis: Array<{ question: string; answer: string }>;
  immediateCauses: string;          // #81 causes immediates
  basicCauses: string;              // #81 causes fondamentales / sous-jacentes
  rootCause: string;
  photos: Array<{ url: string; name: string }>;   // #81 pieces jointes (Storage)
  investigatorName: string;         // #81 signature enqueteur
  investigatorSignedAt: string;     // horodatage ISO
  invSupervisorName: string;        // #81 signature superviseur d'enquete
  invSupervisorSignedAt: string;
  correctiveActions: CorrectiveAction[];
  regulatoryNotified: boolean;
  regulatoryNotifiedDate: string;
  regulatoryReferenceNumber: string;
  supervisorName: string;
  supervisorDate: string;
  supervisorSigned: boolean;
  hseReviewerName: string;
  hseReviewerDate: string;
  hseReviewerSigned: boolean;
  managementName: string;
  managementDate: string;
  managementSigned: boolean;
}

export interface IncidentReportFormProps {
  tenant: string;
  reportId?: string;
  defaultType?: IncidentType;
  defaultProvince?: Province;
  onClose?: () => void;
  onSaved?: (id: string) => void;
  embedded?: boolean;
  siteId?: string | null; // site courant (sélecteur global) -> rattache le rapport au site
  astPermitNumber?: string | null; // AST des travaux liés (interconnexion Accidents↔AST)
}

export interface DayCounter {
  tenant_id: string;
  last_accident_date: string | null;
  last_near_miss_date: string | null;
  accident_record_days: number;
  near_miss_record_days: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

// Libellés FR pour toutes les zones : noms librairie + zones overlay custom
// BODY_REGION_LABELS est désormais partagé : voir lib/hse/bodyRegions.ts (réutilisé par le beigne HSE).

const PROVINCE_INFO: Record<Province, {
  name: string; authority: string; deadline: string; form: string; requirements: string[]; territory?: boolean;
}> = {
  QC: {
    name: 'Québec', authority: 'CNESST',
    deadline: '48h (lésion avec arrêt) / 4h (blessure grave ou décès)',
    form: 'Avis de lésion professionnelle + Rapport d\'enquête d\'accident',
    requirements: [
      'Déclaration obligatoire à la CNESST pour toute lésion professionnelle (art. 267 LSST)',
      'Rapport d\'enquête requis dans les 15 jours suivant l\'accident',
      'Conserver les lieux pour enquête en cas d\'accident grave',
      'Offrir assignation temporaire dès que possible',
    ],
  },
  ON: {
    name: 'Ontario', authority: 'WSIB',
    deadline: '3 jours ouvrables (Form 7)',
    form: 'WSIB Form 7 — Employer\'s Report of Injury/Disease',
    requirements: [
      'Form 7 à soumettre dans les 3 jours ouvrables suivant la connaissance de la blessure',
      'Blessure critique ou décès : aviser le ministère du Travail dans 1 jour ouvrable',
      'Plan de retour au travail requis pour absences >7 jours',
      'Conformité à la Loi sur la sécurité professionnelle et l\'assurance contre les accidents du travail (LSPAAT)',
    ],
  },
  BC: {
    name: 'Colombie-Britannique', authority: 'WorkSafeBC',
    deadline: '3 jours (rapport employeur) / immédiat (blessure grave)',
    form: 'Form 7 — Employer\'s Report of Injury or Occupational Disease',
    requirements: [
      'Rapport à WorkSafeBC dans les 3 jours pour tout traitement médical requis',
      'Blessure grave ou décès : avis verbal immédiat à WorkSafeBC',
      'Enquête d\'incident dans les 24h pour incidents graves',
      'Conformité à la Workers Compensation Act',
    ],
  },
  AB: {
    name: 'Alberta', authority: 'WCB Alberta',
    deadline: '72 heures',
    form: 'C040 — Employer\'s Report of Injury/Illness',
    requirements: [
      'Rapport au WCB dans les 72h suivant la connaissance de la blessure',
      'Blessure grave ou décès : notifier OHS dans les 24h',
      'Décès au travail : notifier OHS immédiatement',
      'Conformité à l\'Occupational Health and Safety Act (OHSA)',
    ],
  },
  SK: {
    name: 'Saskatchewan', authority: 'WCB Saskatchewan',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Initial Report',
    requirements: [
      'Rapport dans les 5 jours ouvrables suivant la blessure',
      'Blessures graves : notifier OHS immédiatement',
      'Conformité à The Workers\' Compensation Act, 2013',
    ],
  },
  MB: {
    name: 'Manitoba', authority: 'WCB Manitoba',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Report of Injury',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Décès ou blessure critique : aviser la Division STST dans les 24h',
      'Conformité à The Workers Compensation Act',
    ],
  },
  NB: {
    name: 'Nouveau-Brunswick', authority: 'WorkSafeNB',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident',
    requirements: [
      'Rapport dans les 3 jours ouvrables',
      'Blessure grave : notification immédiate',
      'Conformité à la Loi sur l\'indemnisation des accidents du travail',
    ],
  },
  NS: {
    name: 'Nouvelle-Écosse', authority: 'WCB Nova Scotia',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Injury Report',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Blessure grave : notification immédiate à NS Labour Standards',
      'Conformité à la Workers\' Compensation Act',
    ],
  },
  PE: {
    name: 'Île-du-Prince-Édouard', authority: 'WCB PEI',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Report of Injury',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Conformité à la Workers Compensation Act de l\'Î.-P.-É.',
    ],
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador', authority: 'WorkplaceNL',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Injury/Illness',
    requirements: [
      'Rapport dans les 3 jours ouvrables',
      'Blessure grave : notification immédiate',
      'Conformité à la Workplace Health, Safety and Compensation Act',
    ],
  },
  YT: {
    name: 'Yukon', authority: 'YWCHSB (Yukon Workers\' Compensation Health and Safety Board)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Injury or Occupational Disease',
    territory: true,
    requirements: [
      'Rapport à la YWCHSB dans les 3 jours ouvrables suivant la blessure',
      'Blessure grave ou décès : notification immédiate',
      'Conformité à la Workers\' Compensation Act (Yukon)',
      'Enquête d\'incident requise pour tout accident grave',
    ],
  },
  NT: {
    name: 'Territoires du Nord-Ouest', authority: 'WSCC (Workers\' Safety and Compensation Commission)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident/Injury (Form W1)',
    territory: true,
    requirements: [
      'Rapport à la WSCC dans les 3 jours ouvrables',
      'Blessure grave : aviser OHS dans les 24h (Sécurité au travail et indemnisation des travailleurs)',
      'Conformité à la Safety Act (T.N.-O.)',
      'Formulaire W1 à compléter pour toute blessure nécessitant des soins médicaux',
    ],
  },
  NU: {
    name: 'Nunavut', authority: 'WSCC (Workers\' Safety and Compensation Commission)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident/Injury (Form W1)',
    territory: true,
    requirements: [
      'Rapport à la WSCC dans les 3 jours ouvrables',
      'Blessure grave : aviser OHS dans les 24h',
      'Conformité à la Safety Act (Nunavut)',
      'Même commission que les T.N.-O. (WSCC) — wscc.nu.ca',
    ],
  },
};

const CONTRIBUTING_FACTORS = [
  'Comportement / acte dangereux',
  'Défaillance d\'équipement / outil',
  'Conditions environnementales',
  'Procédure absente ou non suivie',
  'Formation insuffisante',
  'Équipement de protection manquant',
  'Éclairage insuffisant',
  'Fatigue / stress',
  'Pression de temps',
  'Communication déficiente',
  'Entretien préventif insuffisant',
  'Autre',
];

const INJURY_TYPES = [
  'Fracture', 'Entorse / Foulure', 'Lacération / Coupure', 'Contusion',
  'Brûlure thermique', 'Brûlure chimique', 'Choc électrique', 'Commotion cérébrale',
  'Dislocation', 'Hernie', 'Intoxication / Empoisonnement', 'Corps étranger',
  'Écrasement', 'Amputation', 'Égratignure / Abrasion', 'Autre',
];

const WEATHER_CONDITIONS = [
  'Clair / ensoleillé', 'Nuageux', 'Pluie', 'Neige', 'Verglas',
  'Brouillard', 'Vent fort', 'Chaleur extrême', 'Froid extrême', 'Intérieur',
];

const COLLISION_TYPES = [
  'Collision frontale', 'Collision arrière', 'Collision latérale',
  'Renversement / tonneau', 'Collision avec piéton', 'Collision avec objet fixe',
  'Dommages au stationnement', 'Autre',
];

type SectionId = 'general' | 'location' | 'persons' | 'body' | 'description' | 'vehicle' | 'analysis' | 'actions' | 'capa' | 'compliance' | 'approval';

// Qui est RESPONSABLE de remplir chaque section (clarté du flux de déclaration).
const SECTION_ROLE: Record<SectionId, { fr: string; en: string }> = {
  general: { fr: 'Déclarant / superviseur — qui déclare, quand et où.', en: 'Reporter / supervisor — who reports, when and where.' },
  location: { fr: 'Déclarant — lieu exact, conditions.', en: 'Reporter — exact location, conditions.' },
  persons: { fr: 'Renseignements fournis par le(s) blessé(s) (données de santé confidentielles — Loi 25).', en: 'Provided by the injured person(s) (confidential health data — Law 25).' },
  body: { fr: 'Blessé / secouriste — zones touchées sur le schéma.', en: 'Injured person / first-aider — affected areas on the diagram.' },
  description: { fr: 'Déclarant ou témoin — déroulement et action immédiate.', en: 'Reporter or witness — sequence and immediate action.' },
  vehicle: { fr: 'Déclarant — détails du véhicule impliqué.', en: 'Reporter — involved vehicle details.' },
  analysis: { fr: 'Enquêteur / responsable SST — causes et 5 pourquoi.', en: 'Investigator / HSE lead — causes and 5-whys.' },
  actions: { fr: 'Responsable SST / superviseur — actions correctives + responsables.', en: 'HSE lead / supervisor — corrective actions + owners.' },
  capa: { fr: 'Responsable SST — suivi des actions correctives/préventives.', en: 'HSE lead — corrective/preventive action follow-up.' },
  compliance: { fr: 'Responsable SST — déclaration à l’autorité (CNESST/…).', en: 'HSE lead — notification to authority (CNESST/…).' },
  approval: { fr: 'Superviseur, réviseur SST et direction — signatures d’approbation.', en: 'Supervisor, HSE reviewer and management — approval signatures.' },
};

// ── i18n (connecte au header FR/EN via useLanguage) ──────────────────────────
// Les valeurs stockees restent en FR (canoniques) ; on traduit seulement l'AFFICHAGE.
const EN_LABEL: Record<string, string> = {
  // Types d'incident
  'Accident de travail': 'Workplace accident',
  'Passé proche': 'Near miss',
  'Passé proche (sans blessure)': 'Near miss (no injury)',
  'Accident de véhicule': 'Vehicle accident',
  'Dommages matériels': 'Property damage',
  'Maladie professionnelle': 'Occupational illness',
  // Traitement medical
  'Aucun traitement': 'No treatment',
  'Premiers soins sur place': 'On-site first aid',
  'Clinique / médecin': 'Clinic / physician',
  'Hospitalisation': 'Hospitalization',
  'Urgence / ambulance': 'Emergency / ambulance',
  // Statut action corrective
  'En attente': 'Pending',
  'En cours': 'In progress',
  'Complété': 'Completed',
  // Eclairage
  'Bon éclairage': 'Good lighting',
  'Éclairage insuffisant': 'Insufficient lighting',
  'Absence de lumière': 'No light',
  'Lumière naturelle seulement': 'Natural light only',
  'Éblouissement': 'Glare',
  // Facteurs contributifs
  'Comportement / acte dangereux': 'Unsafe behavior / act',
  "Défaillance d'équipement / outil": 'Equipment / tool failure',
  'Conditions environnementales': 'Environmental conditions',
  'Procédure absente ou non suivie': 'Missing or unfollowed procedure',
  'Formation insuffisante': 'Insufficient training',
  'Équipement de protection manquant': 'Missing protective equipment',
  'Fatigue / stress': 'Fatigue / stress',
  'Pression de temps': 'Time pressure',
  'Communication déficiente': 'Poor communication',
  'Entretien préventif insuffisant': 'Insufficient preventive maintenance',
  'Autre': 'Other',
  // Types de blessure
  'Fracture': 'Fracture', 'Entorse / Foulure': 'Sprain / Strain', 'Lacération / Coupure': 'Laceration / Cut', 'Contusion': 'Contusion',
  'Brûlure thermique': 'Thermal burn', 'Brûlure chimique': 'Chemical burn', 'Choc électrique': 'Electric shock', 'Commotion cérébrale': 'Concussion',
  'Dislocation': 'Dislocation', 'Hernie': 'Hernia', 'Intoxication / Empoisonnement': 'Intoxication / Poisoning', 'Corps étranger': 'Foreign body',
  'Écrasement': 'Crush injury', 'Amputation': 'Amputation', 'Égratignure / Abrasion': 'Scratch / Abrasion',
  // Meteo
  'Clair / ensoleillé': 'Clear / sunny', 'Nuageux': 'Cloudy', 'Pluie': 'Rain', 'Neige': 'Snow', 'Verglas': 'Black ice',
  'Brouillard': 'Fog', 'Vent fort': 'Strong wind', 'Chaleur extrême': 'Extreme heat', 'Froid extrême': 'Extreme cold', 'Intérieur': 'Indoor',
  // Types de collision
  'Collision frontale': 'Head-on collision', 'Collision arrière': 'Rear-end collision', 'Collision latérale': 'Side collision',
  'Renversement / tonneau': 'Rollover', 'Collision avec piéton': 'Pedestrian collision', 'Collision avec objet fixe': 'Collision with fixed object',
  'Dommages au stationnement': 'Parking damage',
  // Questions des 5 Pourquoi (stockees dans le rapport)
  "Pourquoi l'incident s'est-il produit ?": 'Why did the incident occur?',
  "Pourquoi cette cause existe-t-elle ?": 'Why does this cause exist?',
  'Pourquoi cette cause fondamentale ?': 'Why this fundamental cause?',
  'Pourquoi ce facteur systémique ?': 'Why this systemic factor?',
  'Cause racine ultime ?': 'Ultimate root cause?',
};

// Traduit une valeur FR canonique pour l'affichage selon la langue.
const tl = (lang: Lang, fr: string) => (lang === 'en' ? (EN_LABEL[fr] ?? fr) : fr);

const TR = {
  fr: {
    back: 'Retour', draft: 'Brouillon', submittedRO: 'Soumis — lecture seule', closed: 'Fermé',
    saving: 'Enregistrement…', saved: 'Enregistré', save: 'Sauvegarder', submit: 'Soumettre',
    confirmSubmit: 'Soumettre verrouille le rapport, le COMPILE dans les KPI SST et remet le compteur « jours sans accident » à 0. Pour ne pas affecter les statistiques, utilisez « Sauvegarder » (brouillon). Soumettre maintenant ?', yes: 'Soumettre', cancel: 'Annuler',
    nav: { general: 'Général', location: 'Lieu', persons: 'Blessés', body: 'Schéma corporel', description: 'Description', vehicle: 'Véhicule', analysis: 'Analyse', actions: 'Actions', capa: 'Suivi CAPA', compliance: 'Réglementation', approval: 'Approbation' },
    g: {
      title: 'Informations générales', type: "Type d'incident", province: 'Province / territoire', severity: 'Sévérité',
      dateIncident: "Date de l'incident", timeIncident: "Heure de l'incident", dateReport: 'Date du rapport',
      responsible: 'Responsable du rapport', name: 'Nom', namePh: 'Prénom Nom', titlePost: 'Titre / Poste', titlePostPh: 'Contremaître, HSE...', phone: 'Téléphone',
      sev: ['1 — Mineur', '2 — Faible', '3 — Modéré', '4 — Grave', '5 — Critique'],
      declDelay: 'Délai de déclaration', requiredForm: 'Formulaire requis',
    },
    loc: { title: "Lieu de l'incident", address: 'Adresse complète', addressPh: '123, rue Principale, Ville, QC', dept: 'Département / Unité', deptPh: 'Atelier, Chantier A, Bureau...', exact: 'Emplacement précis', exactPh: 'Escalier nord, zone de chargement...', weather: 'Conditions météo', lighting: 'Éclairage' },
    p: {
      injured: 'Personnes blessées', add: 'Ajouter', noneNear: 'Aucune blessure (passé proche)', noneInjured: 'Aucune personne blessée enregistrée', injuredN: 'Blessé',
      fullName: 'Nom complet', jobTitle: 'Titre / Poste', employer: 'Employeur', empId: '# Employé', phone: 'Téléphone', injuryType: 'Type de blessure', treatment: 'Traitement médical',
      injuryDesc: 'Description de la blessure', injuryDescPh: 'Décrire la nature et la localisation de la blessure…', lostTime: 'Perte de temps', daysPh: 'Jours', daysAbsence: "jours d'absence", restricted: 'Travail restreint / mutation', fatality: 'Décès',
      witnesses: 'Témoins', noWitness: 'Aucun témoin enregistré', witnessN: 'Témoin', wName: 'Nom', wPost: 'Poste', statement: 'Déclaration', statementPh: 'Déclaration du témoin…',
    },
    b: { title: 'Schéma corporel', none: "Aucune personne blessée — ajoutez une personne dans l'onglet «Blessés» pour localiser les blessures.", clickA: 'Cliquer sur les zones blessées pour ', injuredN: 'Blessé' },
    d: { title: "Description de l'événement", workType: "Type de travail effectué au moment de l'incident", workTypePh: 'Entretien, installation, conduite, manutention…', narration: "Narration de l'incident", narrationPh: "Décrire chronologiquement et précisément les événements. Inclure ce qui s'est passé, comment et où…", immediate: 'Actions immédiates prises', immediatePh: "Premiers secours, évacuation, mise hors service de l'équipement, appel d'urgence…", factors: 'Facteurs contributifs' },
    v: { vehTitle: 'Véhicule impliqué', yes: 'Oui', no: 'Non', plate: "Plaque d'immatriculation", make: 'Marque', model: 'Modèle', year: 'Année', km: 'Kilométrage au moment', collisionType: 'Type de collision', otherVeh: 'Autre véhicule impliqué', policeReport: 'Rapport de police', otherVehDesc: "Description de l'autre véhicule", policeNum: 'Numéro du rapport de police', damageDesc: 'Description des dommages', propTitle: 'Dommages matériels', propLoc: 'Localisation des dommages', estCost: 'Coût estimé ($)' },
    an: { fiveWhy: 'Méthode des 5 Pourquoi', fiveWhyHelp: 'Remonter la chaîne causale jusqu\'à la cause racine en répondant à chaque «Pourquoi».', answerPh: 'Réponse…', rootTitle: 'Cause racine identifiée', rootPh: "Suite à l'analyse des 5 Pourquoi, la cause racine est…",
      enqTitle: 'Enquête causale', causesTitle: 'Causes', immediate: 'Causes immédiates', immediatePh: 'Conditions/actes ayant directement mené à l\'incident…', basic: 'Causes fondamentales', basicPh: 'Causes sous-jacentes / systémiques (gestion, formation, procédures)…',
      photos: 'Pièces jointes (photos)', addPhoto: 'Ajouter des photos', uploading: 'Téléversement…', photoErr: 'Échec du téléversement (bucket incident-photos requis).',
      sigTitle: "Signatures d'enquête", investigator: 'Enquêteur', invSup: 'Superviseur', sign: 'Signer', signedOn: 'Signé le', notSigned: 'Non signé', clearSig: 'Effacer' },
    ac: { title: 'Actions correctives', add: 'Ajouter', none: 'Aucune action corrective enregistrée', actionN: 'Action', describePh: "Décrire l'action corrective…", responsible: 'Responsable', dueDate: 'Échéance', status: 'Statut', remove: 'Retirer' },
    c: { notifTitle: 'Notification réglementaire', declDelay: 'Délai de déclaration', formLabel: 'Formulaire', notifiedYes: 'Autorité notifiée', notifiedNo: 'Autorité non encore notifiée', notifDate: 'Date de notification', refNum: 'Numéro de référence', refNumPh: 'Ex : CNESST-2026-XXXXX' },
    ap: { title: 'Approbation', supervisor: 'Superviseur immédiat', hse: 'Responsable HSE', mgmt: 'Direction', approved: 'Approuvé', pending: 'En attente', name: 'Nom', date: 'Date' },
    pr: { btn: 'Imprimer / PDF', docTitle: "Rapport d'incident", generated: 'Document généré le', reqTitle: 'Exigences réglementaires', notifiedOn: 'Autorité notifiée le', refLabel: 'Référence', signatures: 'Signatures', signedOn: 'Signé le', notSigned: 'Non signé', none: '—', popupBlocked: 'Veuillez autoriser les fenetres contextuelles pour imprimer.' },
    cp: {
      title: 'Actions correctives (CAPA)', help: 'Actions suivies (responsable, échéance, statut) liées à cet incident.',
      saveFirst: "Enregistrez d'abord le rapport pour ajouter des actions de suivi.",
      add: 'Ajouter une action', none: 'Aucune action de suivi', descPh: "Décrire l'action…",
      description: 'Description', assignee: 'Responsable', assigneePh: 'Prénom Nom', dueDate: 'Échéance',
      priority: 'Priorité', status: 'Statut', save: 'Ajouter', cancel: 'Annuler', overdue: 'En retard',
      statusLabel: { a_faire: 'A faire', en_cours: 'En cours', fait: 'Fait', verifie: 'Verifie' } as Record<string, string>,
      priorityLabel: { basse: 'Basse', normale: 'Normale', haute: 'Haute', critique: 'Critique' } as Record<string, string>,
    },
  },
  en: {
    back: 'Back', draft: 'Draft', submittedRO: 'Submitted — read only', closed: 'Closed',
    saving: 'Saving…', saved: 'Saved', save: 'Save', submit: 'Submit',
    confirmSubmit: 'Submitting locks the report, COMPILES it into the HSE KPIs and resets the “days without accident” counter to 0. To avoid affecting statistics, use “Save” (draft). Submit now?', yes: 'Submit', cancel: 'Cancel',
    nav: { general: 'General', location: 'Location', persons: 'Injured', body: 'Body diagram', description: 'Description', vehicle: 'Vehicle', analysis: 'Analysis', actions: 'Actions', capa: 'CAPA tracking', compliance: 'Regulations', approval: 'Approval' },
    g: {
      title: 'General information', type: 'Incident type', province: 'Province / territory', severity: 'Severity',
      dateIncident: 'Incident date', timeIncident: 'Incident time', dateReport: 'Report date',
      responsible: 'Report author', name: 'Name', namePh: 'First Last', titlePost: 'Title / Position', titlePostPh: 'Foreman, HSE...', phone: 'Phone',
      sev: ['1 — Minor', '2 — Low', '3 — Moderate', '4 — Serious', '5 — Critical'],
      declDelay: 'Reporting deadline', requiredForm: 'Required form',
    },
    loc: { title: 'Incident location', address: 'Full address', addressPh: '123 Main St, City, QC', dept: 'Department / Unit', deptPh: 'Shop, Site A, Office...', exact: 'Exact location', exactPh: 'North stairwell, loading area...', weather: 'Weather conditions', lighting: 'Lighting' },
    p: {
      injured: 'Injured persons', add: 'Add', noneNear: 'No injury (near miss)', noneInjured: 'No injured person recorded', injuredN: 'Injured',
      fullName: 'Full name', jobTitle: 'Title / Position', employer: 'Employer', empId: 'Employee #', phone: 'Phone', injuryType: 'Injury type', treatment: 'Medical treatment',
      injuryDesc: 'Injury description', injuryDescPh: 'Describe the nature and location of the injury…', lostTime: 'Lost time', daysPh: 'Days', daysAbsence: 'days off', restricted: 'Restricted work / transfer', fatality: 'Fatality',
      witnesses: 'Witnesses', noWitness: 'No witness recorded', witnessN: 'Witness', wName: 'Name', wPost: 'Position', statement: 'Statement', statementPh: 'Witness statement…',
    },
    b: { title: 'Body diagram', none: 'No injured person — add a person in the "Injured" tab to locate injuries.', clickA: 'Click the injured zones for ', injuredN: 'Injured' },
    d: { title: 'Event description', workType: 'Type of work performed at the time of the incident', workTypePh: 'Maintenance, installation, driving, handling…', narration: 'Incident narrative', narrationPh: 'Describe the events chronologically and precisely. Include what happened, how and where…', immediate: 'Immediate actions taken', immediatePh: 'First aid, evacuation, equipment lockout, emergency call…', factors: 'Contributing factors' },
    v: { vehTitle: 'Vehicle involved', yes: 'Yes', no: 'No', plate: 'License plate', make: 'Make', model: 'Model', year: 'Year', km: 'Mileage at time', collisionType: 'Collision type', otherVeh: 'Other vehicle involved', policeReport: 'Police report', otherVehDesc: 'Other vehicle description', policeNum: 'Police report number', damageDesc: 'Damage description', propTitle: 'Property damage', propLoc: 'Damage location', estCost: 'Estimated cost ($)' },
    an: { fiveWhy: '5 Whys method', fiveWhyHelp: 'Trace the causal chain to the root cause by answering each "Why".', answerPh: 'Answer…', rootTitle: 'Identified root cause', rootPh: 'Following the 5 Whys analysis, the root cause is…',
      enqTitle: 'Causal investigation', causesTitle: 'Causes', immediate: 'Immediate causes', immediatePh: 'Conditions/acts that directly led to the incident…', basic: 'Basic causes', basicPh: 'Underlying / systemic causes (management, training, procedures)…',
      photos: 'Attachments (photos)', addPhoto: 'Add photos', uploading: 'Uploading…', photoErr: 'Upload failed (incident-photos bucket required).',
      sigTitle: 'Investigation signatures', investigator: 'Investigator', invSup: 'Supervisor', sign: 'Sign', signedOn: 'Signed on', notSigned: 'Not signed', clearSig: 'Clear' },
    ac: { title: 'Corrective actions', add: 'Add', none: 'No corrective action recorded', actionN: 'Action', describePh: 'Describe the corrective action…', responsible: 'Responsible', dueDate: 'Due date', status: 'Status', remove: 'Remove' },
    c: { notifTitle: 'Regulatory notification', declDelay: 'Reporting deadline', formLabel: 'Form', notifiedYes: 'Authority notified', notifiedNo: 'Authority not yet notified', notifDate: 'Notification date', refNum: 'Reference number', refNumPh: 'e.g. CNESST-2026-XXXXX' },
    ap: { title: 'Approval', supervisor: 'Immediate supervisor', hse: 'HSE manager', mgmt: 'Management', approved: 'Approved', pending: 'Pending', name: 'Name', date: 'Date' },
    pr: { btn: 'Print / PDF', docTitle: 'Incident report', generated: 'Document generated on', reqTitle: 'Regulatory requirements', notifiedOn: 'Authority notified on', refLabel: 'Reference', signatures: 'Signatures', signedOn: 'Signed on', notSigned: 'Not signed', none: '—', popupBlocked: 'Please allow pop-ups to print.' },
    cp: {
      title: 'Corrective actions (CAPA)', help: 'Tracked actions (assignee, due date, status) linked to this incident.',
      saveFirst: 'Save the report first to add tracked actions.',
      add: 'Add action', none: 'No tracked action', descPh: 'Describe the action…',
      description: 'Description', assignee: 'Assignee', assigneePh: 'First Last', dueDate: 'Due date',
      priority: 'Priority', status: 'Status', save: 'Add', cancel: 'Cancel', overdue: 'Overdue',
      statusLabel: { a_faire: 'To do', en_cours: 'In progress', fait: 'Done', verifie: 'Verified' } as Record<string, string>,
      priorityLabel: { basse: 'Low', normale: 'Normal', haute: 'High', critique: 'Critical' } as Record<string, string>,
    },
  },
} as const;

const TREATMENT_LABEL: Record<string, string> = {
  none: 'Aucun traitement', first_aid: 'Premiers soins sur place', clinic: 'Clinique / médecin',
  hospital: 'Hospitalisation', emergency: 'Urgence / ambulance',
};
const ACTION_STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', in_progress: 'En cours', completed: 'Complété',
};

// ── #71 Export reglementaire : document imprimable (print -> PDF navigateur) ──
function buildPrintHtml(report: IncidentReportData, reportNumber: string, lang: Lang, generatedOn: string): string {
  const t = TR[lang];
  const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  const none = t.pr.none;
  const v = (s: unknown) => { const e = esc(s); return e || none; };
  const typeLabel = report.incidentType === 'near_miss' ? tl(lang, 'Passé proche')
    : tl(lang, { accident: 'Accident de travail', vehicle: 'Accident de véhicule', property: 'Dommages matériels', medical: 'Maladie professionnelle' }[report.incidentType] ?? report.incidentType);
  const sev = t.g.sev[(report.severityLevel || 3) - 1] ?? String(report.severityLevel ?? '');
  const row = (label: string, value: unknown) => `<div class="row"><span class="lbl">${esc(label)}</span><span class="val">${v(value)}</span></div>`;
  const sec = (title: string, body: string) => body ? `<section><h2>${esc(title)}</h2>${body}</section>` : '';

  // Personnes blessees
  const persons = (report.injuredPersons ?? []).map((p, i) => `
    <div class="card"><div class="card-h">${esc(t.p.injuredN)} #${i + 1} — ${v(p.name)}</div>
      ${row(t.p.jobTitle, p.jobTitle)}${row(t.p.employer, p.company)}${row(t.p.empId, p.employeeId)}${row(t.p.phone, p.phone)}
      ${row(t.p.injuryType, p.injuryType ? tl(lang, p.injuryType) : '')}${row(t.p.treatment, TREATMENT_LABEL[p.medicalTreatment] ? tl(lang, TREATMENT_LABEL[p.medicalTreatment]) : '')}
      ${row(t.p.injuryDesc, p.injuryDescription)}${p.lostTime ? row(t.p.lostTime, `${p.lostTimeDays} ${t.p.daysAbsence}`) : ''}${p.restricted ? row(t.p.restricted, '✔') : ''}${p.fatality ? row(t.p.fatality, '✔') : ''}
      ${p.bodyRegions?.length ? row(lang === 'fr' ? 'Zones blessées' : 'Injured areas', p.bodyRegions.map(id => bodyLabel(id, lang)).join(', ')) : ''}
    </div>`).join('');

  // Temoins
  const witnesses = (report.witnesses ?? []).map((w, i) => `
    <div class="card"><div class="card-h">${esc(t.p.witnessN)} #${i + 1} — ${v(w.name)}</div>
      ${row(t.p.wPost, w.jobTitle)}${row(t.p.phone, w.phone)}${row(t.p.statement, w.statement)}
    </div>`).join('');

  // 5 pourquoi + cause racine
  const whys = (report.whyAnalysis ?? []).filter(w => w.answer).map((w, i) => `${row(`${i + 1}. ${tl(lang, w.question)}`, w.answer)}`).join('');

  // Actions correctives
  const actions = (report.correctiveActions ?? []).map((a, i) => `
    <div class="card"><div class="card-h">${esc(t.ac.actionN)} #${i + 1}</div>
      ${row(t.ac.title, a.description)}${row(t.ac.responsible, a.responsible)}${row(t.ac.dueDate, a.dueDate)}
      ${row(t.ac.status, ACTION_STATUS_LABEL[a.status] ? tl(lang, ACTION_STATUS_LABEL[a.status]) : a.status)}
    </div>`).join('');

  // Reglementation (PROVINCE_INFO)
  const info = PROVINCE_INFO[report.province];
  const reqs = info ? `
    ${row(info.authority, info.name)}${row(t.c.declDelay, info.deadline)}${row(t.c.formLabel, info.form)}
    <div class="row"><span class="lbl">${esc(t.pr.reqTitle)}</span><span class="val"><ul>${info.requirements.map(r => `<li>${esc(r)}</li>`).join('')}</ul></span></div>
    ${report.regulatoryNotified ? row(t.pr.notifiedOn, report.regulatoryNotifiedDate) + row(t.pr.refLabel, report.regulatoryReferenceNumber) : row(t.c.notifTitle, t.c.notifiedNo)}` : '';

  // Signatures
  const sig = (label: string, name: unknown, date: unknown, signed: boolean) =>
    `<div class="sig"><div class="sig-l">${esc(label)}</div><div class="sig-n">${v(name)}</div><div class="sig-d">${signed ? `${esc(t.pr.signedOn)} ${v(date)}` : esc(t.pr.notSigned)}</div></div>`;
  const signatures = `<div class="sigs">
    ${sig(t.ap.supervisor, report.supervisorName, report.supervisorDate, report.supervisorSigned)}
    ${sig(t.ap.hse, report.hseReviewerName, report.hseReviewerDate, report.hseReviewerSigned)}
    ${sig(t.ap.mgmt, report.managementName, report.managementDate, report.managementSigned)}
  </div>`;

  const vehicleSec = report.vehicleInvolved ? sec(t.v.vehTitle,
    row(t.v.plate, report.vehicle.licensePlate) + row(t.v.make, report.vehicle.make) + row(t.v.model, report.vehicle.model) +
    row(t.v.year, report.vehicle.year) + row(t.v.km, report.vehicle.kmAtIncident) +
    row(t.v.collisionType, report.vehicle.collisionType ? tl(lang, report.vehicle.collisionType) : '') + row(t.v.damageDesc, report.vehicle.damageDescription)) : '';
  const propSec = report.propertyDamageInvolved ? sec(t.v.propTitle,
    row(t.v.propLoc, report.propertyDamage.location) + row(t.v.estCost, report.propertyDamage.estimatedCost) + row(t.v.damageDesc, report.propertyDamage.description)) : '';

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <title>${esc(t.pr.docTitle)} ${esc(reportNumber)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.45; margin: 0; }
    .doc-h { border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-bottom: 14px; }
    .doc-h h1 { font-size: 20px; margin: 0 0 4px; color: #111827; }
    .doc-h .meta { font-size: 12px; color: #6b7280; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #fee2e2; color: #b91c1c; font-weight: 600; font-size: 11px; margin-left: 6px; }
    section { margin: 12px 0; page-break-inside: avoid; }
    section > h2 { font-size: 13px; color: #dc2626; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: .03em; }
    .row { display: flex; gap: 10px; padding: 2px 0; }
    .row .lbl { width: 38%; color: #6b7280; }
    .row .val { width: 62%; font-weight: 500; }
    .row .val ul { margin: 0; padding-left: 16px; }
    .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; margin: 6px 0; page-break-inside: avoid; }
    .card-h { font-weight: 600; margin-bottom: 4px; }
    .sigs { display: flex; gap: 14px; margin-top: 6px; }
    .sig { flex: 1; border-top: 1px solid #9ca3af; padding-top: 4px; }
    .sig-l { color: #6b7280; font-size: 11px; } .sig-n { font-weight: 600; min-height: 16px; } .sig-d { font-size: 11px; color: #6b7280; }
    .foot { margin-top: 16px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; }
    .logo { height: 34px; width: auto; margin-bottom: 6px; }
    .photos { display: flex; flex-wrap: wrap; gap: 8px; }
    .ph { width: 31%; margin: 0; page-break-inside: avoid; }
    .ph img { width: 100%; height: auto; max-height: 180px; object-fit: cover; border: 1px solid #e5e7eb; border-radius: 4px; }
    .ph figcaption { font-size: 10px; color: #6b7280; margin-top: 2px; }
    @media print { .noprint { display: none; } }
  </style></head><body>
  <div class="doc-h">
    <img class="logo" src="/c-secur360-logo.png" alt="logo" onerror="this.style.display='none'"/>
    <h1>${esc(t.pr.docTitle)} — ${esc(typeLabel)}<span class="badge">${esc(reportNumber)}</span></h1>
    <div class="meta">${esc(t.g.severity)}: ${esc(sev)} · ${esc(t.g.dateIncident)}: ${v(report.incidentDate)} ${esc(report.incidentTime || '')}</div>
  </div>
  ${sec(t.g.title, row(t.g.type, typeLabel) + row(t.g.province, report.province) + row(t.g.dateReport, report.reportedDate) + row(t.g.responsible, report.reportedBy) + row(t.g.titlePost, report.reportedByTitle) + row(t.g.phone, report.reportedByPhone))}
  ${sec(t.loc.title, row(t.loc.address, report.address) + row(t.loc.dept, report.department) + row(t.loc.exact, report.exactLocation) + row(t.loc.weather, report.weatherConditions ? tl(lang, report.weatherConditions) : '') + row(t.loc.lighting, report.lighting ? tl(lang, report.lighting) : ''))}
  ${persons ? sec(t.p.injured, persons) : ''}
  ${witnesses ? sec(t.p.witnesses, witnesses) : ''}
  ${sec(t.d.title, row(t.d.workType, report.workType) + row(t.d.narration, report.description) + row(t.d.immediate, report.immediateAction) + (report.contributingFactors?.length ? row(t.d.factors, report.contributingFactors.map(f => tl(lang, f)).join(', ')) : ''))}
  ${vehicleSec}
  ${propSec}
  ${(report.immediateCauses || report.basicCauses || whys || report.rootCause) ? sec(t.an.enqTitle,
    (report.immediateCauses ? row(t.an.immediate, report.immediateCauses) : '') +
    (report.basicCauses ? row(t.an.basic, report.basicCauses) : '') +
    whys + (report.rootCause ? row(t.an.rootTitle, report.rootCause) : '')) : ''}
  ${(report.photos?.length) ? sec(t.an.photos, `<div class="photos">${report.photos.map(p => `<figure class="ph"><img src="${esc(p.url)}" alt="${esc(p.name)}"/><figcaption>${esc(p.name)}</figcaption></figure>`).join('')}</div>`) : ''}
  ${actions ? sec(t.ac.title, actions) : ''}
  ${reqs ? sec(t.c.notifTitle, reqs) : ''}
  ${sec(t.an.sigTitle, `<div class="sigs">${sig(t.an.investigator, report.investigatorName, report.investigatorSignedAt, !!report.investigatorSignedAt)}${sig(t.an.invSup, report.invSupervisorName, report.invSupervisorSignedAt, !!report.invSupervisorSignedAt)}</div>`)}
  ${sec(t.pr.signatures, signatures)}
  <div class="foot">${esc(t.pr.generated)} ${esc(generatedOn)} · ${esc(t.pr.docTitle)} ${esc(reportNumber)}</div>
  <script>window.onload=function(){window.focus();window.print();}</script>
  </body></html>`;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  readOnly?: boolean; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      // Champ numerique : selection au clic pour ecraser directement (un 0 par defaut ne bloque pas la saisie).
      onFocus={type === 'number' ? e => e.currentTarget.select() : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'} ${className}`}
    />
  );
}

function SelectInput({ value, onChange, options, readOnly }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  readOnly?: boolean;
}) {
  const { lang } = useLanguage();
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white disabled:bg-gray-50"
    >
      <option value="">{lang === 'en' ? '— Select —' : '— Sélectionner —'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, readOnly, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  readOnly?: boolean; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-y ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'}`}
    />
  );
}

function Toggle({ checked, onChange, label, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
        checked ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'
      } ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-red-300'}`}
    >
      <div className={`w-8 h-4 rounded-full transition-colors relative ${checked ? 'bg-red-500' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
      {label}
    </button>
  );
}

// ── Body Diagram (react-body-highlighter + overlay SVG) ──

const OVERLAY_IDS = new Set([
  'left-eye', 'right-eye',
  'left-hand', 'right-hand', 'left-hand-back', 'right-hand-back',
  'left-foot', 'right-foot', 'left-foot-back', 'right-foot-back',
  'knees', 'left-knee', 'right-knee', 'left-knee-back', 'right-knee-back',
  // Muscles bilatéraux — intercept par overlay gauche/droite indépendant
  'left-biceps', 'right-biceps',
  'left-triceps', 'right-triceps',
  'left-forearm', 'right-forearm',
  'left-front-deltoid', 'right-front-deltoid',
  'left-back-deltoid', 'right-back-deltoid',
  'left-quad', 'right-quad',
  'left-calf', 'right-calf',
  'left-hamstring', 'right-hamstring',
  'left-gluteal', 'right-gluteal',
]);

function BodyDiagram({ selected, onChange, readOnly }: {
  selected: string[];
  onChange: (sel: string[]) => void;
  readOnly: boolean;
}) {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');

  const on = (id: string) => selected.includes(id);

  // IDs bilatéraux legacy que le clic librairie ne doit jamais ajouter directement
  // (ils sont gérés via les rects overlay bop() qui rajoutent left-/right- indépendamment)
  const BILATERAL_BLOCKED = new Set([
    'biceps', 'triceps', 'forearm',
    'front-deltoids', 'back-deltoids',
    'quadriceps', 'calves', 'hamstring', 'gluteal',
  ]);

  const toggle = (id: string) => {
    if (readOnly) return;
    if (BILATERAL_BLOCKED.has(id)) return;
    onChange(on(id) ? selected.filter(m => m !== id) : [...selected, id]);
  };

  // Clic sur un genou individuel : retire le bilatéral 'knees' si présent
  const clickKnee = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const clean = selected.filter(m => m !== 'knees');
    onChange(clean.includes(id) ? clean.filter(m => m !== id) : [...clean, id]);
  };

  const modelData = selected
    .filter(id => !OVERLAY_IDS.has(id))
    .map(m => ({ name: m, muscles: [m] }));

  // Attributs overlay standard
  const op = (id: string) => ({
    fill: on(id) ? '#ef4444' : '#c8d3db',
    stroke: on(id) ? '#b91c1c' : '#8fa0ad',
    strokeWidth: 0.7,
    style: { cursor: readOnly ? 'default' : 'pointer', transition: 'fill 0.15s', pointerEvents: 'all' as React.CSSProperties['pointerEvents'] },
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); toggle(id); },
  });

  // Attributs overlay genou (tient compte de l'ancien bilatéral 'knees')
  const kop = (id: string) => {
    const sel = on(id) || on('knees');
    return {
      fill: sel ? '#ef4444' : '#c8d3db',
      stroke: sel ? '#b91c1c' : '#8fa0ad',
      strokeWidth: 0.7,
      style: { cursor: readOnly ? 'default' : 'pointer', transition: 'fill 0.15s', pointerEvents: 'all' as React.CSSProperties['pointerEvents'] },
      onClick: clickKnee(id),
    };
  };

  // Overlay muscle bilatéral : transparent si non sélectionné, rouge si sélectionné.
  // legacyId = ID librairie bilatéral (rétrocompat données existantes)
  const bop = (id: string, legacyId: string) => {
    const sel = on(id) || on(legacyId);
    return {
      fill: sel ? '#ef4444' : 'transparent',
      stroke: sel ? '#b91c1c' : 'none',
      strokeWidth: 0.7,
      style: { cursor: readOnly ? 'default' : 'pointer', transition: 'fill 0.15s', pointerEvents: 'all' as React.CSSProperties['pointerEvents'] },
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        if (readOnly) return;
        const clean = selected.filter(m => m !== legacyId);
        onChange(clean.includes(id) ? clean.filter(m => m !== id) : [...clean, id]);
      },
    };
  };

  // Container : librairie 320 px + pieds ~24 px ; viewBox = (320+24)/1.6 = 215
  const W = 160, H_LIB = 320, H_TOTAL = 344, VB_H = 215;

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-4">
        {(['anterior', 'posterior'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              view === v ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}>
            {v === 'anterior' ? 'Vue avant' : 'Vue arrière'}
          </button>
        ))}
      </div>

      <div className="relative select-none" style={{ width: W, height: H_TOTAL }}>
        <div style={{ width: W, height: H_LIB }}>
          <BodyModel
            data={modelData}
            bodyColor="#c8d3db"
            highlightedColors={['#ef4444', '#dc2626', '#b91c1c']}
            onClick={readOnly ? undefined : ({ muscle }: { muscle: string; data: any }) => toggle(muscle)}
            style={{ width: W, height: H_LIB }}
            type={view}
          />
        </div>

        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={W} height={H_TOTAL} viewBox={`0 0 100 ${VB_H}`}>

          {/* ── Muscles bilatéraux vue avant ── */}
          {view === 'anterior' && (
            <>
              <rect x="11" y="37" width="16" height="23" rx="3" {...bop('left-front-deltoid', 'front-deltoids')}><title>{BODY_REGION_LABELS['left-front-deltoid']}</title></rect>
              <rect x="73" y="37" width="16" height="23" rx="3" {...bop('right-front-deltoid', 'front-deltoids')}><title>{BODY_REGION_LABELS['right-front-deltoid']}</title></rect>
              <rect x="4" y="60" width="14" height="24" rx="3" {...bop('left-biceps', 'biceps')}><title>{BODY_REGION_LABELS['left-biceps']}</title></rect>
              <rect x="82" y="60" width="14" height="24" rx="3" {...bop('right-biceps', 'biceps')}><title>{BODY_REGION_LABELS['right-biceps']}</title></rect>
              <rect x="0" y="84" width="10" height="17" rx="2" {...bop('left-forearm', 'forearm')}><title>{BODY_REGION_LABELS['left-forearm']}</title></rect>
              <rect x="90" y="84" width="10" height="17" rx="2" {...bop('right-forearm', 'forearm')}><title>{BODY_REGION_LABELS['right-forearm']}</title></rect>
              <rect x="22" y="115" width="17" height="37" rx="3" {...bop('left-quad', 'quadriceps')}><title>{BODY_REGION_LABELS['left-quad']}</title></rect>
              <rect x="61" y="115" width="17" height="37" rx="3" {...bop('right-quad', 'quadriceps')}><title>{BODY_REGION_LABELS['right-quad']}</title></rect>
              <rect x="20" y="157" width="20" height="38" rx="3" {...bop('left-calf', 'calves')}><title>{BODY_REGION_LABELS['left-calf']}</title></rect>
              <rect x="60" y="157" width="20" height="38" rx="3" {...bop('right-calf', 'calves')}><title>{BODY_REGION_LABELS['right-calf']}</title></rect>
            </>
          )}

          {/* ── Muscles bilatéraux vue arrière ── */}
          {view === 'posterior' && (
            <>
              <rect x="11" y="37" width="16" height="23" rx="3" {...bop('left-back-deltoid', 'back-deltoids')}><title>{BODY_REGION_LABELS['left-back-deltoid']}</title></rect>
              <rect x="73" y="37" width="16" height="23" rx="3" {...bop('right-back-deltoid', 'back-deltoids')}><title>{BODY_REGION_LABELS['right-back-deltoid']}</title></rect>
              <rect x="4" y="60" width="13" height="24" rx="3" {...bop('left-triceps', 'triceps')}><title>{BODY_REGION_LABELS['left-triceps']}</title></rect>
              <rect x="83" y="60" width="13" height="24" rx="3" {...bop('right-triceps', 'triceps')}><title>{BODY_REGION_LABELS['right-triceps']}</title></rect>
              <rect x="0" y="84" width="10" height="24" rx="2" {...bop('left-forearm', 'forearm')}><title>{BODY_REGION_LABELS['left-forearm']}</title></rect>
              <rect x="90" y="84" width="10" height="24" rx="2" {...bop('right-forearm', 'forearm')}><title>{BODY_REGION_LABELS['right-forearm']}</title></rect>
              <rect x="28" y="92" width="20" height="24" rx="3" {...bop('left-gluteal', 'gluteal')}><title>{BODY_REGION_LABELS['left-gluteal']}</title></rect>
              <rect x="52" y="92" width="20" height="24" rx="3" {...bop('right-gluteal', 'gluteal')}><title>{BODY_REGION_LABELS['right-gluteal']}</title></rect>
              <rect x="22" y="115" width="17" height="37" rx="3" {...bop('left-hamstring', 'hamstring')}><title>{BODY_REGION_LABELS['left-hamstring']}</title></rect>
              <rect x="62" y="115" width="17" height="37" rx="3" {...bop('right-hamstring', 'hamstring')}><title>{BODY_REGION_LABELS['right-hamstring']}</title></rect>
              <rect x="18" y="155" width="22" height="42" rx="3" {...bop('left-calf', 'calves')}><title>{BODY_REGION_LABELS['left-calf']}</title></rect>
              <rect x="60" y="155" width="22" height="42" rx="3" {...bop('right-calf', 'calves')}><title>{BODY_REGION_LABELS['right-calf']}</title></rect>
            </>
          )}

          {/* ── Yeux (vue avant, cliquables) — tête de la librairie : x≈40-59, y≈0-25 ── */}
          {view === 'anterior' && (['left-eye', 'right-eye'] as const).map((id, i) => {
            const cx = i === 0 ? 44 : 56;
            return (
              <g key={id}
                onClick={readOnly ? undefined : (e) => { e.stopPropagation(); toggle(id); }}
                style={{ cursor: readOnly ? 'default' : 'pointer', pointerEvents: 'all' }}>
                <title>{BODY_REGION_LABELS[id]}</title>
                <ellipse cx={cx} cy="11" rx="2.8" ry="1.8"
                  fill={on(id) ? '#ef4444' : '#f0f5f7'}
                  stroke={on(id) ? '#b91c1c' : '#8fa0ad'} strokeWidth="0.5"
                  style={{ transition: 'fill 0.15s' }} />
                <ellipse cx={cx} cy="11" rx="1.4" ry="1.1"
                  fill={on(id) ? '#b91c1c' : '#2c4a5e'}
                  style={{ pointerEvents: 'none', transition: 'fill 0.15s' }} />
              </g>
            );
          })}

          {/* ── Genoux vue avant — polygones calqués sur la librairie (coordonnées exactes) ── */}
          {view === 'anterior' && (
            <>
              <polygon
                points="33.9,140 34.7,143.3 35.5,147.3 36.3,151 35.1,156.7 29.8,156.7 27.3,152.7 27.3,147.3 30.2,144.1"
                {...kop('left-knee')}>
                <title>{BODY_REGION_LABELS['left-knee']}</title>
              </polygon>
              <polygon
                points="65.7,140 72.2,147.8 72.2,152.2 69.8,157.1 64.9,156.7 62.9,151"
                {...kop('right-knee')}>
                <title>{BODY_REGION_LABELS['right-knee']}</title>
              </polygon>
            </>
          )}

          {/* ── Genoux vue arrière ── */}
          {view === 'posterior' && (
            <>
              <polygon
                points="34.5,153.2 31.1,159.1 33.6,166.4 37.4,162.6"
                {...kop('left-knee-back')}>
                <title>{BODY_REGION_LABELS['left-knee-back']}</title>
              </polygon>
              <polygon
                points="66.4,153.6 63,163 66.8,166.4 69.4,159.1"
                {...kop('right-knee-back')}>
                <title>{BODY_REGION_LABELS['right-knee-back']}</title>
              </polygon>
            </>
          )}

          {/* ── Mains ── */}
          {view === 'anterior' && (
            <>
              <ellipse cx="4" cy="109" rx="4" ry="8" {...op('left-hand')}>
                <title>{BODY_REGION_LABELS['left-hand']}</title>
              </ellipse>
              <ellipse cx="96" cy="109" rx="4" ry="8" {...op('right-hand')}>
                <title>{BODY_REGION_LABELS['right-hand']}</title>
              </ellipse>
            </>
          )}
          {view === 'posterior' && (
            <>
              <ellipse cx="4" cy="116" rx="4" ry="8" {...op('left-hand-back')}>
                <title>{BODY_REGION_LABELS['left-hand-back']}</title>
              </ellipse>
              <ellipse cx="96" cy="116" rx="4" ry="8" {...op('right-hand-back')}>
                <title>{BODY_REGION_LABELS['right-hand-back']}</title>
              </ellipse>
            </>
          )}

          {/* ── Pieds ── */}
          {view === 'anterior' && (
            <>
              <path d="M 30,196 L 23,197 Q 13,198 8,205 Q 14,208 21,206 Q 27,203 30,196 Z"
                strokeLinejoin="round" {...op('left-foot')}>
                <title>{BODY_REGION_LABELS['left-foot']}</title>
              </path>
              <path d="M 70,196 L 77,197 Q 87,198 92,205 Q 86,208 79,206 Q 73,203 70,196 Z"
                strokeLinejoin="round" {...op('right-foot')}>
                <title>{BODY_REGION_LABELS['right-foot']}</title>
              </path>
            </>
          )}
          {view === 'posterior' && (
            <>
              <path d="M 30,198 L 23,199 Q 13,200 8,207 Q 14,210 21,208 Q 27,205 30,198 Z"
                strokeLinejoin="round" {...op('left-foot-back')}>
                <title>{BODY_REGION_LABELS['left-foot-back']}</title>
              </path>
              <path d="M 70,198 L 77,199 Q 87,200 92,207 Q 86,210 79,208 Q 73,205 70,198 Z"
                strokeLinejoin="round" {...op('right-foot-back')}>
                <title>{BODY_REGION_LABELS['right-foot-back']}</title>
              </path>
            </>
          )}
        </svg>
      </div>

      {!readOnly && selected.length === 0 && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Cliquer sur les zones blessées du schéma
        </p>
      )}

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-xs">
          {selected.map(id => (
            <span key={id}
              className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs border border-red-200 font-medium">
              {BODY_REGION_LABELS[id] || id}
              {!readOnly && (
                <button onClick={() => onChange(selected.filter(m => m !== id))}
                  className="hover:text-red-900 font-bold text-sm leading-none ml-0.5">×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Day Safety Counter (exported for use in list page) ────────────────────────

export function DaySafetyCounter({ label, lastDate, recordDays, onReset, readOnly, color = 'green' }: {
  label: string;
  lastDate: string | null;
  recordDays: number;
  onReset: () => void;
  readOnly?: boolean;
  color?: 'green' | 'orange';
}) {
  const days = lastDate
    ? Math.max(0, Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000))
    : 0;
  const isRecord = days > 0 && days >= recordDays && recordDays > 0;
  const colorCls = color === 'green' ? 'text-green-600' : 'text-orange-500';
  const bgCls = color === 'green' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50';

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className={`rounded-xl border p-5 flex flex-col items-center text-center ${bgCls}`}>
      <div className={`text-6xl font-black leading-none mb-1 ${colorCls}`}>{days}</div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      {isRecord && (
        <div className="text-xs font-bold text-yellow-600 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full mb-1">
          NOUVEAU RECORD !
        </div>
      )}
      <div className="text-xs text-gray-500 mb-3">
        Record : {Math.max(days, recordDays)} j
        {lastDate && <> &nbsp;·&nbsp; Dernier : {fmt(lastDate)}</>}
      </div>
      {!readOnly && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-300 px-3 py-1 rounded-lg transition-colors"
        >
          <RotateCcw size={12} />
          Réinitialiser
        </button>
      )}
    </div>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────

function emptyPerson(): InjuredPerson {
  return {
    id: crypto.randomUUID(),
    name: '', jobTitle: '', company: '', employeeId: '', phone: '',
    bodyRegions: [], injuryType: '', injuryDescription: '',
    medicalTreatment: 'none', lostTime: false, lostTimeDays: 0, returnToWorkDate: '', restricted: false, fatality: false,
  };
}

function emptyWitness(): WitnessInfo {
  return { id: crypto.randomUUID(), name: '', jobTitle: '', company: '', phone: '', statement: '' };
}

function emptyAction(): CorrectiveAction {
  return { id: crypto.randomUUID(), description: '', responsible: '', dueDate: '', status: 'pending' };
}

function emptyReport(defaultType: IncidentType = 'accident', defaultProvince: Province = 'QC'): IncidentReportData {
  const today = new Date().toISOString().split('T')[0];
  return {
    incidentType: defaultType,
    province: defaultProvince,
    severityLevel:
      defaultType === 'accident' || defaultType === 'medical' ? 5
        : defaultType === 'vehicle' || defaultType === 'property' ? 4
          : defaultType === 'near_miss' ? 2 : 3,
    incidentDate: today,
    incidentTime: '',
    reportedDate: today,
    reportedBy: '',
    reportedByTitle: '',
    reportedByPhone: '',
    address: '',
    department: '',
    exactLocation: '',
    weatherConditions: '',
    lighting: '',
    injuredPersons: [],
    witnesses: [],
    description: '',
    immediateAction: '',
    workType: '',
    contributingFactors: [],
    vehicleInvolved: false,
    vehicle: {
      vehicleId: '', licensePlate: '', make: '', model: '', year: '',
      kmAtIncident: '', collisionType: '', otherVehicle: false, otherVehicleDesc: '',
      policeReport: false, policeReportNumber: '', damageDescription: '',
    },
    propertyDamageInvolved: false,
    propertyDamage: { description: '', estimatedCost: '', location: '' },
    whyAnalysis: [
      { question: 'Pourquoi l\'incident s\'est-il produit ?', answer: '' },
      { question: 'Pourquoi cette cause existe-t-elle ?', answer: '' },
      { question: 'Pourquoi cette cause fondamentale ?', answer: '' },
      { question: 'Pourquoi ce facteur systémique ?', answer: '' },
      { question: 'Cause racine ultime ?', answer: '' },
    ],
    immediateCauses: '',
    basicCauses: '',
    rootCause: '',
    photos: [],
    investigatorName: '',
    investigatorSignedAt: '',
    invSupervisorName: '',
    invSupervisorSignedAt: '',
    correctiveActions: [],
    regulatoryNotified: false,
    regulatoryNotifiedDate: '',
    regulatoryReferenceNumber: '',
    supervisorName: '', supervisorDate: '', supervisorSigned: false,
    hseReviewerName: '', hseReviewerDate: '', hseReviewerSigned: false,
    managementName: '', managementDate: '', managementSigned: false,
  };
}

function genReportNumber(type: IncidentType) {
  const prefix = type === 'near_miss' ? 'PP' : type === 'accident' ? 'AT' : type === 'vehicle' ? 'VH' : 'INC';
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${seq}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IncidentReportForm({
  tenant,
  reportId,
  defaultType = 'accident',
  defaultProvince = 'QC',
  onClose,
  onSaved,
  embedded = false,
  siteId = null,
  astPermitNumber = null,
}: IncidentReportFormProps) {
  const { lang } = useLanguage();
  const tr = TR[lang];
  const [section, setSection] = useState<SectionId>('general');
  const [report, setReport] = useState<IncidentReportData>(emptyReport(defaultType, defaultProvince));
  const [dbId, setDbId] = useState<string | null>(reportId ?? null);
  const [reportNumber, setReportNumber] = useState(genReportNumber(defaultType));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<IncidentStatus>('draft');
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const readOnly = status === 'submitted' || status === 'closed';

  // Interconnexion Accidents↔Personnel : liste du personnel du tenant pour rattacher l'incident (personnel_id).
  const [personnelList, setPersonnelList] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [personnelId, setPersonnelId] = useState<string | null>(null);
  // Véhicules du tenant — pour la recherche dynamique dans la section Véhicule (sous-traitant = saisie libre).
  const [vehicleList, setVehicleList] = useState<{ id: string; name: string; make?: string; model?: string; plate?: string }[]>([]);
  useEffect(() => {
    fetch(`/api/permits/espace-clos/people?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { people: [] }))
      .then(j => setPersonnelList((j.people || []).map((p: any) => ({ id: p.id, name: p.name, role: p.role || '' }))))
      .catch(() => {});
    if (supabase) supabase.from('vehicles').select('id, name, make, model, license_plate').eq('tenant_id', tenant).eq('active', true).order('name')
      .then(({ data }) => setVehicleList((data || []).map((v: any) => ({ id: v.id, name: v.name || [v.make, v.model].filter(Boolean).join(' '), make: v.make, model: v.model, plate: v.license_plate }))), () => {});
  }, [tenant]);

  useEffect(() => {
    if (reportId) loadReport(reportId);
  }, [reportId]);

  // Nouveau rapport : pre-remplir le declarant avec l'utilisateur connecte (/api/auth/me).
  // reporter_name doit etre rempli pour que le panneau d'anomalies attribue le signalement.
  useEffect(() => {
    if (reportId) return; // edition : ne pas ecraser le declarant existant
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return;
        const { user } = await res.json();
        if (active && user?.name) {
          setReport(prev => (prev.reportedBy ? prev : { ...prev, reportedBy: user.name }));
        }
      } catch { /* non bloquant */ }
    })();
    return () => { active = false; };
  }, [reportId]);

  async function loadReport(id: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setDbId(data.id);
      setReportNumber(data.report_number);
      setStatus(data.status);
      setPersonnelId((data as any).personnel_id ?? null); // pré-remplit le rattachement personnel à l'édition
      // Fusionne avec les defauts pour que les rapports anterieurs aient les champs #81 (photos, causes, signatures).
      setReport({ ...emptyReport(data.incident_type, data.province), ...(data.data as Partial<IncidentReportData>) });
    }
  }

  function updateReport(updater: (prev: IncidentReportData) => IncidentReportData) {
    setReport(prev => {
      const next = updater(prev);
      scheduleAutoSave(next);
      return next;
    });
  }

  function scheduleAutoSave(data: IncidentReportData) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(data, false), 2000);
  }

  async function doSave(data: IncidentReportData, submit: boolean) {
    if (!supabase) return null;
    setSaving(true);
    const now = new Date().toISOString();
    const payload = {
      tenant_id: tenant,
      report_number: reportNumber,
      incident_type: data.incidentType,
      province: data.province,
      status: submit ? 'submitted' : status,
      site_id: siteId ?? null,
      ast_permit_number: astPermitNumber ?? null,
      personnel_id: personnelId ?? null,
      data,
      updated_at: now,
      ...(submit ? { submitted_at: now } : {}),
    };

    let id = dbId;
    // Écriture via route SERVEUR (tables fermées à l'anon) — tenant forcé à la session.
    try {
      const res = await fetch('/api/incidents/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'save', item: { id: id || undefined, ...payload } }),
      });
      const j: any = res.ok ? await res.json() : {};
      if (!id && j.id) { id = j.id; setDbId(id); onSaved?.(id!); }
    } catch { /* hors-ligne : on tentera plus tard */ }

    if (submit && id) {
      await resetDayCounter(data.incidentType);
      setStatus('submitted');
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return id;
  }

  async function resetDayCounter(type: IncidentType) {
    // Remise à zéro du compteur via la route SERVEUR (logique read-modify-write côté serveur).
    try {
      await fetch('/api/incidents/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'reset', incidentType: type }),
      });
    } catch { /* ignore */ }
  }

  const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'general',     label: tr.nav.general,     icon: <FileText size={16} /> },
    { id: 'location',    label: tr.nav.location,    icon: <MapPin size={16} /> },
    { id: 'persons',     label: tr.nav.persons,     icon: <User size={16} /> },
    { id: 'body',        label: tr.nav.body,        icon: <Heart size={16} /> },
    { id: 'description', label: tr.nav.description, icon: <AlignLeft size={16} /> },
    { id: 'vehicle',     label: tr.nav.vehicle,     icon: <Truck size={16} /> },
    { id: 'analysis',    label: tr.nav.analysis,    icon: <Search size={16} /> },
    { id: 'actions',     label: tr.nav.actions,     icon: <CheckSquare size={16} /> },
    { id: 'capa',        label: tr.nav.capa,        icon: <ClipboardCheck size={16} /> },
    { id: 'compliance',  label: tr.nav.compliance,  icon: <Scale size={16} /> },
    { id: 'approval',    label: tr.nav.approval,    icon: <PenLine size={16} /> },
  ];

  function renderSection() {
    switch (section) {
      case 'general':     return <GeneralSection     report={report} onChange={updateReport} readOnly={readOnly} personnelList={personnelList} personnelId={personnelId} setPersonnelId={setPersonnelId} />;
      case 'location':    return <LocationSection    report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'persons':     return <PersonsSection     report={report} onChange={updateReport} readOnly={readOnly} personnelList={personnelList} />;
      case 'body':        return <BodySection        report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'description': return <DescriptionSection report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'vehicle':     return <VehicleSection     report={report} onChange={updateReport} readOnly={readOnly} vehicleList={vehicleList} />;
      case 'analysis':    return <AnalysisSection    report={report} onChange={updateReport} readOnly={readOnly} tenant={tenant} reportNumber={reportNumber} lang={lang} />;
      case 'actions':     return <ActionsSection     report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'capa':        return <CapaPanel          tenant={tenant} incidentId={dbId} lang={lang} readOnly={readOnly} />;
      case 'compliance':  return <ComplianceSection  report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'approval':    return <ApprovalSection    report={report} onChange={updateReport} readOnly={readOnly} personnelList={personnelList} />;
    }
  }

  const typeLabels: Record<IncidentType, string> = {
    accident:  tl(lang, 'Accident de travail'),
    near_miss: tl(lang, 'Passé proche'),
    vehicle:   tl(lang, 'Accident de véhicule'),
    property:  tl(lang, 'Dommages matériels'),
    medical:   tl(lang, 'Maladie professionnelle'),
  };

  const typeColors: Record<IncidentType, string> = {
    accident:  'bg-red-100 text-red-700 border-red-200',
    near_miss: 'bg-orange-100 text-orange-700 border-orange-200',
    vehicle:   'bg-blue-100 text-blue-700 border-blue-200',
    property:  'bg-purple-100 text-purple-700 border-purple-200',
    medical:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  // Rapport PDF PRO (jsPDF) — même socle que le DGA / rapport terrain (logo, couleur de marque, pieds de
  // page). Couvre tout le rapport (blessés + zones, témoins, véhicule, 5-pourquoi, photos, CAPA, signatures).
  async function printReport() {
    const typeLabel = report.incidentType === 'near_miss' ? (lang === 'fr' ? 'Passé proche' : 'Near miss')
      : ({ accident: ['Accident de travail', 'Workplace accident'], vehicle: ['Accident de véhicule', 'Vehicle accident'], property: ['Dommages matériels', 'Property damage'], medical: ['Maladie professionnelle', 'Occupational illness'] }[report.incidentType] || ['Incident', 'Incident'])[lang === 'fr' ? 0 : 1];
    try {
      const { generateIncidentReportPdf } = await import('./reportPdf');
      await generateIncidentReportPdf({ report, reportNumber, lang, typeLabel, tenant, logoUrl: null });
    } catch (e: any) {
      alert((lang === 'fr' ? 'Échec de la génération du PDF : ' : 'PDF generation failed: ') + (e?.message || ''));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 sticky z-20 ${embedded ? 'top-20' : 'top-0'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onClose && (
              <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} />
                {tr.back}
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {typeLabels[report.incidentType]}
                </h1>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[report.incidentType]}`}>
                  {report.incidentType === 'near_miss' ? tl(lang, 'Passé proche') : report.incidentType.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{reportNumber}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {status === 'draft' && tr.draft}
                {status === 'submitted' && tr.submittedRO}
                {status === 'closed' && tr.closed}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />{tr.saving}</span>}
            {saved && !saving && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />{tr.saved}</span>}

            <button
              onClick={printReport}
              title={tr.pr.btn}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:border-gray-400 text-gray-600"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">{tr.pr.btn}</span>
            </button>

            {!readOnly && (
              <>
                <button
                  onClick={() => doSave(report, false)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:border-gray-400 text-gray-600"
                >
                  <Save size={15} />
                  {tr.save}
                </button>

                {!submitConfirm ? (
                  <button
                    onClick={() => setSubmitConfirm(true)}
                    className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    <Send size={15} />
                    {tr.submit}
                  </button>
                ) : (
                  <div className="flex max-w-md items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
                    <div>
                      <p className="text-xs leading-snug text-red-700">{tr.confirmSubmit}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          onClick={() => { doSave(report, true); setSubmitConfirm(false); }}
                          className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          {tr.yes}
                        </button>
                        <button onClick={() => setSubmitConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700">{tr.cancel}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sidebar (desktop) / barre d'onglets horizontale defilante (mobile) */}
        <div className="md:w-48 md:shrink-0">
          <nav className={`flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:sticky ${embedded ? 'md:top-36' : 'md:top-20'}`}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left whitespace-nowrap transition-colors ${
                  section === s.id
                    ? 'bg-red-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
            <span className="font-semibold whitespace-nowrap">{lang === 'fr' ? 'À remplir par :' : 'To be completed by:'}</span>
            <span>{lang === 'fr' ? SECTION_ROLE[section].fr : SECTION_ROLE[section].en}</span>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

// ── Section Components ────────────────────────────────────────────────────────

function GeneralSection({ report, onChange, readOnly, personnelList, personnelId, setPersonnelId }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
  personnelList: { id: string; name: string }[];
  personnelId: string | null;
  setPersonnelId: (v: string | null) => void;
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const incidentTypes = [
    { value: 'accident',  label: tl(lang, 'Accident de travail') },
    { value: 'near_miss', label: tl(lang, 'Passé proche (sans blessure)') },
    { value: 'vehicle',   label: tl(lang, 'Accident de véhicule') },
    { value: 'property',  label: tl(lang, 'Dommages matériels') },
    { value: 'medical',   label: tl(lang, 'Maladie professionnelle') },
  ];

  const provinces: { value: Province; label: string; group?: string }[] = [
    // ─ Provinces
    { value: 'QC', label: 'Québec (CNESST)' },
    { value: 'ON', label: 'Ontario (WSIB)' },
    { value: 'BC', label: 'Colombie-Britannique (WorkSafeBC)' },
    { value: 'AB', label: 'Alberta (WCB)' },
    { value: 'SK', label: 'Saskatchewan (WCB-SK)' },
    { value: 'MB', label: 'Manitoba (WCB-MB)' },
    { value: 'NB', label: 'Nouveau-Brunswick (WorkSafeNB)' },
    { value: 'NS', label: 'Nouvelle-Écosse (WCB-NS)' },
    { value: 'PE', label: 'Île-du-Prince-Édouard (WCB-PEI)' },
    { value: 'NL', label: 'Terre-Neuve-et-Labrador (WorkplaceNL)' },
    // ─ Territoires
    { value: 'YT', label: 'Yukon (YWCHSB)' },
    { value: 'NT', label: 'Territoires du Nord-Ouest (WSCC)' },
    { value: 'NU', label: 'Nunavut (WSCC)' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-red-500" />
          {t.g.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label={t.g.type} required>
            <SelectInput
              value={report.incidentType}
              onChange={v => up('incidentType', v as IncidentType)}
              options={incidentTypes}
              readOnly={readOnly}
            />
          </Field>
          <Field label={t.g.province} required>
            <SelectInput
              value={report.province}
              onChange={v => up('province', v as Province)}
              options={provinces}
              readOnly={readOnly}
            />
          </Field>
          <Field label={t.g.severity} required>
            <SelectInput
              value={String(report.severityLevel ?? 3)}
              onChange={v => up('severityLevel', Number(v))}
              options={[
                { value: '1', label: t.g.sev[0] },
                { value: '2', label: t.g.sev[1] },
                { value: '3', label: t.g.sev[2] },
                { value: '4', label: t.g.sev[3] },
                { value: '5', label: t.g.sev[4] },
              ]}
              readOnly={readOnly}
            />
          </Field>
          <Field label={t.g.dateIncident} required>
            <TextInput type="date" value={report.incidentDate} onChange={v => up('incidentDate', v)} readOnly={readOnly} />
          </Field>
          <Field label={t.g.timeIncident}>
            <TextInput type="time" value={report.incidentTime} onChange={v => up('incidentTime', v)} readOnly={readOnly} />
          </Field>
          <Field label={t.g.dateReport}>
            <TextInput type="date" value={report.reportedDate} onChange={v => up('reportedDate', v)} readOnly={readOnly} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">{t.g.responsible}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          {personnelList.length > 0 && (
            <Field label={lang === 'en' ? 'Staff member (links the file)' : 'Personne (personnel — relie au dossier)'}>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
                value={personnelId || ''}
                disabled={readOnly}
                onChange={e => { const pid = e.target.value || null; setPersonnelId(pid); const p = personnelList.find(x => x.id === pid) as any; if (p) { up('reportedBy', p.name); if (p.role) up('reportedByTitle', p.role); } }}
              >
                <option value="">{lang === 'en' ? '— none —' : '— aucun —'}</option>
                {personnelList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          )}
          <Field label={t.g.name} required>
            <TextInput value={report.reportedBy} onChange={v => up('reportedBy', v)} placeholder={t.g.namePh} readOnly={readOnly} />
          </Field>
          <Field label={t.g.titlePost}>
            <TextInput value={report.reportedByTitle} onChange={v => up('reportedByTitle', v)} placeholder={t.g.titlePostPh} readOnly={readOnly} />
          </Field>
          <Field label={t.g.phone}>
            <TextInput value={report.reportedByPhone} onChange={v => up('reportedByPhone', v)} placeholder="514-xxx-xxxx" readOnly={readOnly} />
          </Field>
        </div>
      </Card>

      {/* Province callout */}
      {report.province && PROVINCE_INFO[report.province] && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-blue-800 mb-1">
                {PROVINCE_INFO[report.province].authority} — {t.g.declDelay} : {PROVINCE_INFO[report.province].deadline}
              </div>
              <div className="text-xs text-blue-700">{t.g.requiredForm} : {PROVINCE_INFO[report.province].form}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const weatherOpts = WEATHER_CONDITIONS.map(w => ({ value: w, label: tl(lang, w) }));
  const lightingOpts = [
    'Bon éclairage', 'Éclairage insuffisant', 'Absence de lumière',
    'Lumière naturelle seulement', 'Éblouissement',
  ].map(o => ({ value: o, label: tl(lang, o) }));

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={18} className="text-red-500" />
        {t.loc.title}
      </h2>
      <div className="space-y-0">
        <Field label={t.loc.address} required>
          <TextInput value={report.address} onChange={v => up('address', v)} placeholder={t.loc.addressPh} readOnly={readOnly} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label={t.loc.dept}>
            <TextInput value={report.department} onChange={v => up('department', v)} placeholder={t.loc.deptPh} readOnly={readOnly} />
          </Field>
          <Field label={t.loc.exact}>
            <TextInput value={report.exactLocation} onChange={v => up('exactLocation', v)} placeholder={t.loc.exactPh} readOnly={readOnly} />
          </Field>
          <Field label={t.loc.weather}>
            <SelectInput value={report.weatherConditions} onChange={v => up('weatherConditions', v)} options={weatherOpts} readOnly={readOnly} />
          </Field>
          <Field label={t.loc.lighting}>
            <SelectInput value={report.lighting} onChange={v => up('lighting', v)} options={lightingOpts} readOnly={readOnly} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function PersonsSection({ report, onChange, readOnly, personnelList }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
  personnelList: { id: string; name: string; role?: string }[];
}) {
  function updatePerson(id: string, updater: (p: InjuredPerson) => InjuredPerson) {
    onChange(r => ({
      ...r,
      injuredPersons: r.injuredPersons.map(p => p.id === id ? updater(p) : p),
    }));
  }

  function addPerson() {
    onChange(r => ({ ...r, injuredPersons: [...r.injuredPersons, emptyPerson()] }));
  }

  function removePerson(id: string) {
    onChange(r => ({ ...r, injuredPersons: r.injuredPersons.filter(p => p.id !== id) }));
  }

  function updateWitness(id: string, updater: (w: WitnessInfo) => WitnessInfo) {
    onChange(r => ({
      ...r,
      witnesses: r.witnesses.map(w => w.id === id ? updater(w) : w),
    }));
  }

  const { lang } = useLanguage();
  const t = TR[lang];
  const treatmentOpts = [
    { value: 'none',       label: tl(lang, 'Aucun traitement') },
    { value: 'first_aid',  label: tl(lang, 'Premiers soins sur place') },
    { value: 'clinic',     label: tl(lang, 'Clinique / médecin') },
    { value: 'hospital',   label: tl(lang, 'Hospitalisation') },
    { value: 'emergency',  label: tl(lang, 'Urgence / ambulance') },
  ];

  const injuryOpts = INJURY_TYPES.map(iv => ({ value: iv, label: tl(lang, iv) }));

  return (
    <div className="space-y-4">
      {/* Injured persons */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <User size={18} className="text-red-500" />
            {t.p.injured}
          </h2>
          {!readOnly && (
            <button onClick={addPerson} className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg">
              <Plus size={14} />
              {t.p.add}
            </button>
          )}
        </div>

        {report.injuredPersons.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            {report.incidentType === 'near_miss' ? t.p.noneNear : t.p.noneInjured}
          </p>
        )}

        {report.injuredPersons.map((person, idx) => (
          <div key={person.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">{t.p.injuredN} #{idx + 1}</span>
              {!readOnly && (
                <button onClick={() => removePerson(person.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Field label={t.p.fullName} required>
                <EntitySearch value={person.name} placeholder={t.g.namePh} readOnly={readOnly}
                  options={personnelList.map(pl => ({ id: pl.id, label: pl.name, sub: pl.role }))}
                  onText={v => updatePerson(person.id, p => ({ ...p, name: v }))}
                  onPick={o => updatePerson(person.id, p => ({ ...p, name: o.label, jobTitle: o.sub || p.jobTitle || '' }))} />
                <p className="mt-0.5 text-[11px] text-gray-400">{lang === 'fr' ? 'Cherchez dans le personnel, ou saisissez librement (sous-traitant, visiteur…).' : 'Search staff, or type freely (subcontractor, visitor…).'}</p>
              </Field>
              <Field label={t.p.jobTitle}>
                <TextInput value={person.jobTitle} onChange={v => updatePerson(person.id, p => ({ ...p, jobTitle: v }))} readOnly={readOnly} />
              </Field>
              <Field label={t.p.employer}>
                <TextInput value={person.company} onChange={v => updatePerson(person.id, p => ({ ...p, company: v }))} readOnly={readOnly} />
              </Field>
              <Field label={t.p.empId}>
                <TextInput value={person.employeeId} onChange={v => updatePerson(person.id, p => ({ ...p, employeeId: v }))} readOnly={readOnly} />
              </Field>
              <Field label={t.p.phone}>
                <TextInput value={person.phone} onChange={v => updatePerson(person.id, p => ({ ...p, phone: v }))} readOnly={readOnly} />
              </Field>
              <Field label={t.p.injuryType}>
                <SelectInput value={person.injuryType} onChange={v => updatePerson(person.id, p => ({ ...p, injuryType: v }))} options={injuryOpts} readOnly={readOnly} />
              </Field>
              <Field label={t.p.treatment}>
                <SelectInput value={person.medicalTreatment} onChange={v => updatePerson(person.id, p => ({ ...p, medicalTreatment: v as InjuredPerson['medicalTreatment'] }))} options={treatmentOpts} readOnly={readOnly} />
              </Field>
            </div>
            <Field label={t.p.injuryDesc}>
              <Textarea value={person.injuryDescription} onChange={v => updatePerson(person.id, p => ({ ...p, injuryDescription: v }))} placeholder={t.p.injuryDescPh} readOnly={readOnly} rows={2} />
            </Field>
            <div className="flex items-center gap-4 mt-2">
              <Toggle
                checked={person.lostTime}
                onChange={v => updatePerson(person.id, p => ({ ...p, lostTime: v }))}
                label={t.p.lostTime}
                disabled={readOnly}
              />
              {person.lostTime && (
                <div className="flex items-center gap-2">
                  <TextInput
                    type="number"
                    value={String(person.lostTimeDays)}
                    onChange={v => updatePerson(person.id, p => ({ ...p, lostTimeDays: parseInt(v) || 0 }))}
                    placeholder={t.p.daysPh}
                    readOnly={readOnly}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500">{t.p.daysAbsence}</span>
                  <TextInput
                    type="date"
                    value={person.returnToWorkDate}
                    onChange={v => updatePerson(person.id, p => ({ ...p, returnToWorkDate: v }))}
                    readOnly={readOnly}
                    className="w-36"
                  />
                </div>
              )}
              <Toggle
                checked={!!person.restricted}
                onChange={v => updatePerson(person.id, p => ({ ...p, restricted: v }))}
                label={t.p.restricted}
                disabled={readOnly}
              />
              <Toggle
                checked={!!person.fatality}
                onChange={v => updatePerson(person.id, p => ({ ...p, fatality: v }))}
                label={t.p.fatality}
                disabled={readOnly}
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Witnesses */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">{t.p.witnesses}</h2>
          {!readOnly && (
            <button
              onClick={() => onChange(r => ({ ...r, witnesses: [...r.witnesses, emptyWitness()] }))}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
            >
              <Plus size={14} />
              {t.p.add}
            </button>
          )}
        </div>
        {report.witnesses.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">{t.p.noWitness}</p>
        )}
        {report.witnesses.map((w, idx) => (
          <div key={w.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">{t.p.witnessN} #{idx + 1}</span>
              {!readOnly && (
                <button onClick={() => onChange(r => ({ ...r, witnesses: r.witnesses.filter(x => x.id !== w.id) }))} className="text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 mb-2">
              <Field label={t.p.wName}>
                <EntitySearch value={w.name} readOnly={readOnly}
                  options={personnelList.map(pl => ({ id: pl.id, label: pl.name, sub: pl.role }))}
                  onText={v => updateWitness(w.id, x => ({ ...x, name: v }))}
                  onPick={o => updateWitness(w.id, x => ({ ...x, name: o.label, jobTitle: o.sub || x.jobTitle || '' }))} />
              </Field>
              <Field label={t.p.wPost}>
                <TextInput value={w.jobTitle} onChange={v => updateWitness(w.id, x => ({ ...x, jobTitle: v }))} readOnly={readOnly} />
              </Field>
              <Field label={t.p.phone}>
                <TextInput value={w.phone} onChange={v => updateWitness(w.id, x => ({ ...x, phone: v }))} readOnly={readOnly} />
              </Field>
            </div>
            <Field label={t.p.statement}>
              <Textarea value={w.statement} onChange={v => updateWitness(w.id, x => ({ ...x, statement: v }))} placeholder={t.p.statementPh} readOnly={readOnly} rows={2} />
            </Field>
          </div>
        ))}
      </Card>
    </div>
  );
}

function BodySection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const [personIdx, setPersonIdx] = useState(0);

  if (report.injuredPersons.length === 0) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Heart size={18} className="text-red-500" />
          {t.b.title}
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">
          {t.b.none}
        </p>
      </Card>
    );
  }

  const safeIdx = Math.min(personIdx, report.injuredPersons.length - 1);
  const person = report.injuredPersons[safeIdx];

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Heart size={18} className="text-red-500" />
        {t.b.title}
      </h2>

      {report.injuredPersons.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {report.injuredPersons.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPersonIdx(i)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                personIdx === i ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 hover:border-red-300'
              }`}
            >
              {p.name || `${t.b.injuredN} #${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-600 mb-4 text-center">
          {t.b.clickA}<strong>{person.name || `${t.b.injuredN} #${safeIdx + 1}`}</strong>
        </p>
        <div className={readOnly ? 'pointer-events-none' : ''}>
          <BodyMap
            value={person.bodyRegions}
            locale={lang}
            onChange={(ids: string[]) => onChange(r => ({
              ...r,
              injuredPersons: r.injuredPersons.map((p, i) =>
                i === safeIdx ? { ...p, bodyRegions: ids } : p
              ),
            }))}
          />
        </div>
      </div>
    </Card>
  );
}

function DescriptionSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  function toggleFactor(f: string) {
    onChange(r => ({
      ...r,
      contributingFactors: r.contributingFactors.includes(f)
        ? r.contributingFactors.filter(x => x !== f)
        : [...r.contributingFactors, f],
    }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlignLeft size={18} className="text-red-500" />
          {t.d.title}
        </h2>
        <Field label={t.d.workType}>
          <TextInput value={report.workType} onChange={v => up('workType', v)} placeholder={t.d.workTypePh} readOnly={readOnly} />
        </Field>
        <Field label={t.d.narration} required>
          <Textarea
            value={report.description}
            onChange={v => up('description', v)}
            placeholder={t.d.narrationPh}
            readOnly={readOnly}
            rows={6}
          />
        </Field>
        <Field label={t.d.immediate}>
          <Textarea
            value={report.immediateAction}
            onChange={v => up('immediateAction', v)}
            placeholder={t.d.immediatePh}
            readOnly={readOnly}
            rows={3}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3">{t.d.factors}</h2>
        <div className="flex flex-wrap gap-2">
          {CONTRIBUTING_FACTORS.map(f => {
            const active = report.contributingFactors.includes(f);
            return (
              <button
                key={f}
                onClick={() => !readOnly && toggleFactor(f)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  active ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {tl(lang, f)}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function VehicleSection({ report, onChange, readOnly, vehicleList }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
  vehicleList: { id: string; name: string; make?: string; model?: string; plate?: string }[];
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const [vehQ, setVehQ] = useState('');
  const upV = <K extends keyof IncidentReportData['vehicle']>(k: K, v: IncidentReportData['vehicle'][K]) =>
    onChange(r => ({ ...r, vehicle: { ...r.vehicle, [k]: v } }));
  const upP = <K extends keyof IncidentReportData['propertyDamage']>(k: K, v: IncidentReportData['propertyDamage'][K]) =>
    onChange(r => ({ ...r, propertyDamage: { ...r.propertyDamage, [k]: v } }));

  const collisionOpts = COLLISION_TYPES.map(c => ({ value: c, label: tl(lang, c) }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Truck size={18} className="text-red-500" />
          <h2 className="text-base font-semibold text-gray-800">{t.v.vehTitle}</h2>
          <Toggle
            checked={report.vehicleInvolved}
            onChange={v => onChange(r => ({ ...r, vehicleInvolved: v }))}
            label={report.vehicleInvolved ? t.v.yes : t.v.no}
            disabled={readOnly}
          />
        </div>

        {report.vehicleInvolved && (
          <div className="space-y-0">
            {/* Recherche dynamique d'un véhicule du parc — saisie libre permise (véhicule tiers/sous-traitant). */}
            {!readOnly && vehicleList.length > 0 && (
              <Field label={lang === 'fr' ? 'Rechercher un véhicule du parc' : 'Search a fleet vehicle'}>
                <EntitySearch value={vehQ} placeholder={lang === 'fr' ? 'Nom, marque, plaque…' : 'Name, make, plate…'}
                  options={vehicleList.map(v => ({ id: v.id, label: v.name || [v.make, v.model].filter(Boolean).join(' '), sub: [v.plate, v.make, v.model].filter(Boolean).join(' · ') }))}
                  onText={setVehQ}
                  onPick={o => { const v = vehicleList.find(x => x.id === o.id); if (v) { setVehQ(v.name); onChange(r => ({ ...r, vehicle: { ...r.vehicle, vehicleId: v.id, make: v.make || r.vehicle.make, model: v.model || r.vehicle.model, licensePlate: v.plate || r.vehicle.licensePlate } })); } }} />
                <p className="mt-0.5 text-[11px] text-gray-400">{lang === 'fr' ? 'Ou laissez vide et saisissez un véhicule tiers ci-dessous.' : 'Or leave empty and enter a third-party vehicle below.'}</p>
              </Field>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
              <Field label={t.v.plate}>
                <TextInput value={report.vehicle.licensePlate} onChange={v => upV('licensePlate', v)} readOnly={readOnly} />
              </Field>
              <Field label={t.v.make}>
                <TextInput value={report.vehicle.make} onChange={v => upV('make', v)} readOnly={readOnly} />
              </Field>
              <Field label={t.v.model}>
                <TextInput value={report.vehicle.model} onChange={v => upV('model', v)} readOnly={readOnly} />
              </Field>
              <Field label={t.v.year}>
                <TextInput value={report.vehicle.year} onChange={v => upV('year', v)} readOnly={readOnly} />
              </Field>
              <Field label={t.v.km}>
                <TextInput value={report.vehicle.kmAtIncident} onChange={v => upV('kmAtIncident', v)} placeholder="km" readOnly={readOnly} />
              </Field>
              <Field label={t.v.collisionType}>
                <SelectInput value={report.vehicle.collisionType} onChange={v => upV('collisionType', v)} options={collisionOpts} readOnly={readOnly} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 mb-3">
              <Toggle checked={report.vehicle.otherVehicle} onChange={v => upV('otherVehicle', v)} label={t.v.otherVeh} disabled={readOnly} />
              <Toggle checked={report.vehicle.policeReport} onChange={v => upV('policeReport', v)} label={t.v.policeReport} disabled={readOnly} />
            </div>
            {report.vehicle.otherVehicle && (
              <Field label={t.v.otherVehDesc}>
                <TextInput value={report.vehicle.otherVehicleDesc} onChange={v => upV('otherVehicleDesc', v)} readOnly={readOnly} />
              </Field>
            )}
            {report.vehicle.policeReport && (
              <Field label={t.v.policeNum}>
                <TextInput value={report.vehicle.policeReportNumber} onChange={v => upV('policeReportNumber', v)} readOnly={readOnly} />
              </Field>
            )}
            <Field label={t.v.damageDesc}>
              <Textarea value={report.vehicle.damageDescription} onChange={v => upV('damageDescription', v)} readOnly={readOnly} rows={3} />
            </Field>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={18} className="text-red-500" />
          <h2 className="text-base font-semibold text-gray-800">{t.v.propTitle}</h2>
          <Toggle
            checked={report.propertyDamageInvolved}
            onChange={v => onChange(r => ({ ...r, propertyDamageInvolved: v }))}
            label={report.propertyDamageInvolved ? t.v.yes : t.v.no}
            disabled={readOnly}
          />
        </div>

        {report.propertyDamageInvolved && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Field label={t.v.propLoc}>
              <TextInput value={report.propertyDamage.location} onChange={v => upP('location', v)} readOnly={readOnly} />
            </Field>
            <Field label={t.v.estCost}>
              <TextInput value={report.propertyDamage.estimatedCost} onChange={v => upP('estimatedCost', v)} placeholder="0.00" readOnly={readOnly} />
            </Field>
            <div className="md:col-span-2">
              <Field label={t.v.damageDesc}>
                <Textarea value={report.propertyDamage.description} onChange={v => upP('description', v)} readOnly={readOnly} rows={3} />
              </Field>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function AnalysisSection({ report, onChange, readOnly, tenant, reportNumber, lang }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
  tenant: string;
  reportNumber: string;
  lang: Lang;
}) {
  const t = TR[lang];
  const [uploading, setUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState(false);
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  function updateWhy(idx: number, answer: string) {
    onChange(r => {
      const newWhy = [...r.whyAnalysis];
      newWhy[idx] = { ...newWhy[idx], answer };
      return { ...r, whyAnalysis: newWhy };
    });
  }

  async function onPhotos(files: FileList | null) {
    if (!files || !files.length || !supabase) return;
    setUploading(true); setPhotoErr(false);
    const added: { url: string; name: string }[] = [];
    for (const file of Array.from(files)) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${tenant}/${reportNumber}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from('incident-photos').upload(path, file, { upsert: false });
      if (error) { setPhotoErr(true); continue; }
      const { data } = supabase.storage.from('incident-photos').getPublicUrl(path);
      added.push({ url: data.publicUrl, name: file.name });
    }
    if (added.length) onChange(r => ({ ...r, photos: [...(r.photos ?? []), ...added] }));
    setUploading(false);
  }
  const removePhoto = (url: string) => onChange(r => ({ ...r, photos: (r.photos ?? []).filter(p => p.url !== url) }));

  const InvSig = ({ label, nameKey, dateKey }: { label: string; nameKey: keyof IncidentReportData; dateKey: keyof IncidentReportData }) => {
    const signedAt = report[dateKey] as string;
    return (
      <div className={`border rounded-lg p-3 ${signedAt ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <TextInput value={report[nameKey] as string} onChange={v => up(nameKey, v)} placeholder={t.g.namePh} readOnly={readOnly} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {signedAt ? `${t.an.signedOn} ${new Date(signedAt).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA')}` : t.an.notSigned}
          </span>
          {!readOnly && (signedAt
            ? <button onClick={() => up(dateKey, '')} className="text-xs text-gray-500 hover:text-red-600">{t.an.clearSig}</button>
            : <button onClick={() => up(dateKey, new Date().toISOString())} disabled={!(report[nameKey] as string)}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg font-medium disabled:opacity-40">{t.an.sign}</button>)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Causes immediates / fondamentales */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Search size={18} className="text-red-500" />
          {t.an.enqTitle} — {t.an.causesTitle}
        </h2>
        <Field label={t.an.immediate}>
          <Textarea value={report.immediateCauses} onChange={v => up('immediateCauses', v)} placeholder={t.an.immediatePh} readOnly={readOnly} rows={2} />
        </Field>
        <Field label={t.an.basic}>
          <Textarea value={report.basicCauses} onChange={v => up('basicCauses', v)} placeholder={t.an.basicPh} readOnly={readOnly} rows={2} />
        </Field>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Search size={18} className="text-red-500" />
          {t.an.fiveWhy}
        </h2>
        <p className="text-xs text-gray-500 mb-4">{t.an.fiveWhyHelp}</p>

        {report.whyAnalysis.map((why, idx) => (
          <div key={idx} className="mb-3">
            <div className="flex items-start gap-2">
              <div className={`mt-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                why.answer ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">{tl(lang, why.question)}</div>
                <Textarea
                  value={why.answer}
                  onChange={v => updateWhy(idx, v)}
                  placeholder={t.an.answerPh}
                  readOnly={readOnly}
                  rows={2}
                />
              </div>
            </div>
            {idx < report.whyAnalysis.length - 1 && (
              <div className="ml-9 text-gray-300 text-lg leading-none my-1">↓</div>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3">{t.an.rootTitle}</h2>
        <Textarea
          value={report.rootCause}
          onChange={v => up('rootCause', v)}
          placeholder={t.an.rootPh}
          readOnly={readOnly}
          rows={3}
        />
      </Card>

      {/* Pieces jointes photos (Storage) */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">{t.an.photos}</h2>
          {!readOnly && (
            <label className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer">
              <Plus size={14} />{uploading ? t.an.uploading : t.an.addPhoto}
              <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
                onChange={e => { onPhotos(e.target.files); e.target.value = ''; }} />
            </label>
          )}
        </div>
        {photoErr && <p className="text-xs text-red-600 mb-2">{t.an.photoErr}</p>}
        {(report.photos ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t.pr.none}</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(report.photos ?? []).map(p => (
              <div key={p.url} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                {!readOnly && (
                  <button onClick={() => removePhoto(p.url)} title={p.name}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-red-500 hover:text-red-700 shadow">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Signatures d'enquete */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <PenLine size={18} className="text-red-500" />
          {t.an.sigTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {InvSig({ label: t.an.investigator, nameKey: 'investigatorName', dateKey: 'investigatorSignedAt' })}
          {InvSig({ label: t.an.invSup, nameKey: 'invSupervisorName', dateKey: 'invSupervisorSignedAt' })}
        </div>
      </Card>
    </div>
  );
}

function ActionsSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  function updateAction(id: string, updater: (a: CorrectiveAction) => CorrectiveAction) {
    onChange(r => ({
      ...r,
      correctiveActions: r.correctiveActions.map(a => a.id === id ? updater(a) : a),
    }));
  }

  const { lang } = useLanguage();
  const t = TR[lang];
  const statusOpts = [
    { value: 'pending',     label: tl(lang, 'En attente') },
    { value: 'in_progress', label: tl(lang, 'En cours') },
    { value: 'completed',   label: tl(lang, 'Complété') },
  ];

  const statusColors: Record<string, string> = {
    pending:     'bg-gray-100 text-gray-600',
    in_progress: 'bg-orange-100 text-orange-700',
    completed:   'bg-green-100 text-green-700',
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare size={18} className="text-red-500" />
          {t.ac.title}
        </h2>
        {!readOnly && (
          <button
            onClick={() => onChange(r => ({ ...r, correctiveActions: [...r.correctiveActions, emptyAction()] }))}
            className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} />
            {t.ac.add}
          </button>
        )}
      </div>

      {report.correctiveActions.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">{t.ac.none}</p>
      )}

      {report.correctiveActions.map((action, idx) => (
        <div key={action.id} className="border border-gray-200 rounded-lg p-3 mb-2 grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">{t.ac.actionN} #{idx + 1}</div>
            <Textarea
              value={action.description}
              onChange={v => updateAction(action.id, a => ({ ...a, description: v }))}
              placeholder={t.ac.describePh}
              readOnly={readOnly}
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">{t.ac.responsible}</div>
            <TextInput value={action.responsible} onChange={v => updateAction(action.id, a => ({ ...a, responsible: v }))} readOnly={readOnly} />
            <div className="text-xs text-gray-500 mb-1 mt-2">{t.ac.dueDate}</div>
            <TextInput type="date" value={action.dueDate} onChange={v => updateAction(action.id, a => ({ ...a, dueDate: v }))} readOnly={readOnly} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500">{t.ac.status}</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusColors[action.status]}`}>
              {statusOpts.find(s => s.value === action.status)?.label}
            </div>
            {!readOnly && (
              <select
                value={action.status}
                onChange={e => updateAction(action.id, a => ({ ...a, status: e.target.value as CorrectiveAction['status'] }))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {!readOnly && (
              <button
                onClick={() => onChange(r => ({ ...r, correctiveActions: r.correctiveActions.filter(a => a.id !== action.id) }))}
                className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 size={12} />
                {t.ac.remove}
              </button>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}

function ComplianceSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const info = PROVINCE_INFO[report.province];

  return (
    <div className="space-y-4">
      {info && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <Scale size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-red-800 mb-2">
                {info.authority} — {info.name}
              </div>
              <div className="text-xs font-semibold text-red-700 mb-1">
                {t.c.declDelay} : {info.deadline}
              </div>
              <div className="text-xs text-red-700 mb-2">
                {t.c.formLabel} : {info.form}
              </div>
              <ul className="space-y-1">
                {info.requirements.map((r, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Scale size={18} className="text-red-500" />
          {t.c.notifTitle}
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <Toggle
            checked={report.regulatoryNotified}
            onChange={v => up('regulatoryNotified', v)}
            label={report.regulatoryNotified ? t.c.notifiedYes : t.c.notifiedNo}
            disabled={readOnly}
          />
        </div>
        {report.regulatoryNotified && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Field label={t.c.notifDate}>
              <TextInput type="date" value={report.regulatoryNotifiedDate} onChange={v => up('regulatoryNotifiedDate', v)} readOnly={readOnly} />
            </Field>
            <Field label={t.c.refNum}>
              <TextInput value={report.regulatoryReferenceNumber} onChange={v => up('regulatoryReferenceNumber', v)} placeholder={t.c.refNumPh} readOnly={readOnly} />
            </Field>
          </div>
        )}
      </Card>
    </div>
  );
}

function ApprovalSection({ report, onChange, readOnly, personnelList = [] }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
  personnelList?: { id: string; name: string; role?: string }[];
}) {
  const { lang } = useLanguage();
  const t = TR[lang];
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  interface Signatory {
    nameKey: keyof IncidentReportData;
    dateKey: keyof IncidentReportData;
    signedKey: keyof IncidentReportData;
    label: string;
  }

  const signatories: Signatory[] = [
    { nameKey: 'supervisorName', dateKey: 'supervisorDate', signedKey: 'supervisorSigned', label: t.ap.supervisor },
    { nameKey: 'hseReviewerName', dateKey: 'hseReviewerDate', signedKey: 'hseReviewerSigned', label: t.ap.hse },
    { nameKey: 'managementName', dateKey: 'managementDate', signedKey: 'managementSigned', label: t.ap.mgmt },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <PenLine size={18} className="text-red-500" />
        {t.ap.title}
      </h2>

      <div className="space-y-4">
        {signatories.map(s => {
          const signed = report[s.signedKey] as boolean;
          return (
            <div key={s.nameKey} className={`border rounded-xl p-4 transition-colors ${signed ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
                <div className="flex items-center gap-2">
                  {signed && <CheckCircle size={16} className="text-green-600" />}
                  <Toggle
                    checked={signed}
                    onChange={v => up(s.signedKey, v)}
                    label={signed ? t.ap.approved : t.ap.pending}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Field label={t.ap.name}>
                  <EntitySearch value={report[s.nameKey] as string} onText={v => up(s.nameKey, v)} onPick={o => up(s.nameKey, o.label)} readOnly={readOnly}
                    options={(personnelList || []).map(p => ({ id: p.id, label: p.name, sub: p.role || '' }))} />
                </Field>
                <Field label={t.ap.date}>
                  <TextInput type="date" value={report[s.dateKey] as string} onChange={v => up(s.dateKey, v)} readOnly={readOnly} />
                </Field>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── #80 CAPA : panneau d'actions correctives suivies, lie a l'incident ───────
const CAPA_STATUS_COLOR: Record<IncidentActionStatus, string> = {
  a_faire: 'bg-gray-100 text-gray-600', en_cours: 'bg-blue-100 text-blue-700',
  fait: 'bg-green-100 text-green-700', verifie: 'bg-emerald-100 text-emerald-700',
};
const CAPA_PRIORITY_COLOR: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-500', normale: 'bg-slate-100 text-slate-600',
  haute: 'bg-orange-100 text-orange-700', critique: 'bg-red-100 text-red-700',
};

function CapaPanel({ tenant, incidentId, lang, readOnly }: {
  tenant: string; incidentId: string | null; lang: Lang; readOnly: boolean;
}) {
  const t = TR[lang].cp;
  const [actions, setActions] = useState<IncidentAction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ description: '', assignee: '', due_date: '', priority: 'normale', status: 'a_faire' });

  const load = useCallback(async () => {
    if (!incidentId) { setActions([]); return; }
    setActions(await listActionsByIncident(tenant, incidentId));
  }, [tenant, incidentId]);

  useEffect(() => { load(); }, [load]);

  async function addAction() {
    if (!incidentId || !draft.description.trim()) return;
    await createIncidentAction({
      tenant_id: tenant, incident_id: incidentId,
      description: draft.description.trim(), assignee: draft.assignee.trim() || null,
      due_date: draft.due_date || null,
      priority: draft.priority as IncidentAction['priority'], status: draft.status as IncidentActionStatus,
    });
    setDraft({ description: '', assignee: '', due_date: '', priority: 'normale', status: 'a_faire' });
    setShowForm(false);
    load();
  }
  async function setStatus(id: string, status: IncidentActionStatus) {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    await updateIncidentAction(tenant, id, { status });
  }
  async function remove(id: string) {
    setActions(prev => prev.filter(a => a.id !== id));
    await deleteIncidentAction(tenant, id);
  }

  if (!incidentId) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-red-500" />
          {t.title}
        </h2>
        <p className="text-sm text-gray-400 py-6 text-center">{t.saveFirst}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-red-500" />
          {t.title}
        </h2>
        {!readOnly && (
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg">
            <Plus size={14} />{t.add}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">{t.help}</p>

      {showForm && !readOnly && (
        <div className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3 bg-gray-50">
          <Field label={t.description} required>
            <Textarea value={draft.description} onChange={v => setDraft(d => ({ ...d, description: v }))} placeholder={t.descPh} rows={2} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Field label={t.assignee}>
              <TextInput value={draft.assignee} onChange={v => setDraft(d => ({ ...d, assignee: v }))} placeholder={t.assigneePh} />
            </Field>
            <Field label={t.dueDate}>
              <TextInput type="date" value={draft.due_date} onChange={v => setDraft(d => ({ ...d, due_date: v }))} />
            </Field>
            <Field label={t.priority}>
              <SelectInput value={draft.priority} onChange={v => setDraft(d => ({ ...d, priority: v }))}
                options={ACTION_PRIORITIES.map(p => ({ value: p, label: t.priorityLabel[p] }))} />
            </Field>
            <Field label={t.status}>
              <SelectInput value={draft.status} onChange={v => setDraft(d => ({ ...d, status: v }))}
                options={ACTION_STATUSES.map(s => ({ value: s, label: t.statusLabel[s] }))} />
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={addAction} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">{t.save}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">{t.cancel}</button>
          </div>
        </div>
      )}

      {actions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{t.none}</p>
      ) : (
        <div className="space-y-2">
          {actions.map(a => {
            const overdue = isActionOverdue(a);
            return (
              <div key={a.id} className="border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CAPA_PRIORITY_COLOR[a.priority] ?? 'bg-slate-100 text-slate-600'}`}>{t.priorityLabel[a.priority] ?? a.priority}</span>
                    {overdue && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle size={11} />{t.overdue}</span>}
                  </div>
                  <p className="text-sm text-gray-900 break-words">{a.description}</p>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>{t.assignee}: {a.assignee || '—'}</span>
                    {a.due_date && <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}><Clock size={12} />{t.dueDate}: {a.due_date}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select value={a.status} onChange={e => setStatus(a.id, e.target.value as IncidentActionStatus)}
                    disabled={readOnly}
                    className={`text-xs px-2 py-1 rounded-lg border-0 font-medium ${CAPA_STATUS_COLOR[a.status]}`} aria-label={t.status}>
                    {ACTION_STATUSES.map(s => <option key={s} value={s}>{t.statusLabel[s]}</option>)}
                  </select>
                  {!readOnly && <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-600" aria-label="Supprimer"><Trash2 size={15} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
