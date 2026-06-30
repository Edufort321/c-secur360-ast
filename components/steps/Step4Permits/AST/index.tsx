'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { currentTenantSlug } from "@/lib/tenantSlug";
import {
  ClipboardList, List, Shield, Wrench, Users, CheckCircle,
  Menu, X, Save, Download, Printer, Plus, ChevronRight,
  AlertTriangle, Home, FileText, BarChart3, Trash2,
  ChevronUp, ChevronDown, AlertCircle, QrCode, Lock, Zap,
  Camera, UserCheck, UserX, BookMarked, Star, Search, Pencil, Check, Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import { useSite } from '@/contexts/SiteContext';
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

export interface JobStep {
  id: string;
  stepNumber: number;
  description: string;
  hazards: string[];
  hazardNotes: string;
  controls: string[];
  controlNotes: string;
  riskBefore: number;
  riskAfter: number;
  riskBeforeProb: number;
  riskBeforeSev: number;
  riskAfterProb: number;
  riskAfterSev: number;
  responsible: string;
  verified: boolean;
}

export interface PPEItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  specification: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  company: string;
  acknowledged: boolean;
  acknowledgedAt: string;
}

// Document du client joint à l'AST (AST client, fiche LOTO, autre) — photo ou fichier.
export interface ClientDoc {
  id: string;
  category: 'ast' | 'loto' | 'other';
  name: string;
  mime: string;
  data: string; // dataURL base64 (image ou PDF)
}

export type LOTOPhotoState = 'before' | 'during' | 'after' | 'verification';

export interface LOTOPhoto {
  id: string;
  url: string; // base64 data URL
  timestamp: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  description: string;
  lockState: LOTOPhotoState;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  company: string;
  badgeNumber: string;
  certifications: string[];
  emergencyContact: string;
  emergencyPhone: string;
  present: boolean;
  checkedInAt: string;
  checkedOutAt: string;
}

export type ASTModel = 'simple' | 'complet';

export interface ASTPermit {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  model: ASTModel;
  created_at: string;
  updated_at: string;

  taskInfo: {
    projectNumber: string;
    projectName: string;
    workLocation: string;
    department: string;
    contractor: string;
    supervisor: string;
    supervisorCert: string;
    taskDate: string;
    estimatedDuration: string;
    workerCount: number;
    taskDescription: string;
    taskType: string;
    equipmentInvolved: string;
    specialConditions: string;
    regulatoryRef: string;
  };

  jobSteps: JobStep[];

  ppeRequirements: PPEItem[];
  ppeNotes: string;

  equipment: {
    tools: Array<{ id: string; name: string; condition: 'bon' | 'acceptable' | 'mauvais' | 'remplacé'; inspectedBy: string; notes: string }>;
    vehicles: Array<{ id: string; type: string; license: string; inspected: boolean }>;
    specialEquipment: string;
    energySources: string[];
    lotoRequired: boolean;
    lotoRef: string;
  };

  participants: Participant[];
  clientDocs: ClientDoc[];
  supervisorSigName: string;
  supervisorSigCert: string;
  supervisorSigDate: string;
  supervisorSigNotes: string;
  // Verdict du superviseur responsable : '' (non statue) | approved (vert) | corrective (orange, visible a l'audit) | nonconform (rouge)
  supervisorSigStatus?: '' | 'approved' | 'corrective' | 'nonconform';
  // Non-conformité/correctif : pièces jointes OBLIGATOIRES (photo/document) — data URL dans le JSON de l'AST.
  supervisorSigAttachments?: { name: string; type: string; url: string }[];

  supervisor_name: string;
  supervisor_cert: string;
  permit_valid_from: string;
  permit_valid_to: string;
  permitted_work: string;
  restrictions: string;
  finalization_notes: string;

  workers: Worker[];
  workerNotes: string;

  loto: {
    required: boolean;
    ref: string;
    templateName: string;
    energySources: Array<{
      id: string;
      type: string;
      description: string;
      magnitude: string;
      location: string;
      isolationMethod: string;
      verifiedBy: string;
      verified: boolean;
      photos: LOTOPhoto[];
    }>;
    locks: Array<{
      id: string;
      lockId: string;
      owner: string;
      placedAt: string;
      removedAt: string;
    }>;
    verificationDone: boolean;
    verificationBy: string;
    verificationDate: string;
    reenergizationAuthBy: string;
    reenergizationAuthDate: string;
    notes: string;
  };

  validation: { isComplete: boolean; percentage: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function generatePermitNumber(type: string, province: ProvinceCode, tenant?: string): string {
  const code = Date.now().toString(36).toUpperCase().slice(-4);
  // Avec tenant : TYPE-{TENANT}-{AAAA-MM-JJ}-{CODE}  (ex: AST-QC-2026-05-25-VVTJ)
  if (tenant) {
    const tenantCode = tenant.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || String(province);
    const now = new Date();
    const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `${type}-${tenantCode}-${datePart}-${code}`;
  }
  // Sans tenant (autres modules de permis) : format historique inchangé.
  return `${type}-${province}-${new Date().getFullYear()}-${code}`;
}

export function computeCompletion(ast: ASTPermit): number {
  let score = 0;
  if (ast.taskInfo.workLocation) score++;
  if (ast.taskInfo.supervisor) score++;
  if (ast.taskInfo.taskDescription) score++;
  if (ast.jobSteps.length > 0) score += 2;
  if (ast.jobSteps.some(s => s.hazards.length > 0)) score++;
  if (ast.jobSteps.length === 0 || ast.jobSteps.every(s => s.controls.length > 0 || s.hazards.length === 0)) score++;
  if (ast.ppeRequirements.some(p => p.required)) score++;
  if (ast.participants.length > 0) score++;
  if (ast.participants.length > 0 && ast.participants.every(p => p.acknowledged)) score++;
  // Score MAX = 10 (jobSteps vaut 2). Diviseur = 10 (était 9 → plafonnait à 111 %). Garde-fou 0–100.
  return Math.max(0, Math.min(100, Math.round((score / 10) * 100)));
}

function getRiskColor(score: number): string {
  if (score <= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if (score <= 8) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
  if (score <= 16) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
}

function getRiskLabel(score: number, lang: Language): string {
  if (score <= 4) return lang === 'fr' ? 'Faible' : 'Low';
  if (score <= 8) return lang === 'fr' ? 'Moyen' : 'Medium';
  if (score <= 16) return lang === 'fr' ? 'Élevé' : 'High';
  return lang === 'fr' ? 'Critique' : 'Critical';
}

function getRiskCellColor(score: number): string {
  if (score <= 4) return 'bg-green-400';
  if (score <= 8) return 'bg-yellow-400';
  if (score <= 16) return 'bg-orange-400';
  return 'bg-red-500';
}

// ── Contrôles pré-remplis par danger (modèle complet) ─────────────────────
const HAZARD_CONTROLS: Record<string, string[]> = {
  'Chute de plain-pied': [
    'Dégager les zones de passage',
    'Signalisation au sol (ruban, cônes)',
    'Revêtement antidérapant appliqué',
    'Chaussures de sécurité CSA Z195 obligatoires',
    'Éclairage adéquat assuré',
  ],
  'Chute de hauteur': [
    'Garde-corps / rampe de sécurité installés',
    'Plate-forme de travail sécurisée',
    'Harnais de sécurité + longe certifiés',
    'Harnais + ligne de vie antichute',
    'Ancrage certifié (≥22 kN)',
    'Filet de sécurité horizontal',
    'Permis de travail en hauteur en vigueur',
    'Inspection du harnais avant utilisation',
  ],
  'Objet tombant': [
    'Zone balisée et évacuée en dessous',
    'Filet de protection horizontal',
    'Tablier / planche de pied sur échafaudage',
    'Casque de sécurité CSA Z94.1 obligatoire',
    'Coordination des opérations par niveaux',
    'Attache de sécurité sur tous les outils',
  ],
  'Pincement/écrasement': [
    'Protecteurs de machines en place et verrouillés',
    'Procédure de démarrage/arrêt sécuritaire',
    'Cadenassage (LOTO) si applicable',
    'Formation spécifique à l\'équipement',
    'Zone de dégagement maintenue libre',
    'Gants anti-vibration si requis',
  ],
  'Coupure/lacération': [
    'Gants résistants aux coupures (EN 388)',
    'Protège-bras si requis',
    'Couteau de sécurité à lame rétractable',
    'Formation à l\'utilisation sécuritaire des outils',
    'Rangement sécuritaire des outils tranchants',
  ],
  'Brûlure thermique': [
    'Gants de soudage / thermiques appropriés',
    'Vêtements ignifuges (FR)',
    'Écran facial anti-chaleur',
    'Distance de sécurité respectée',
    'Signalisation « surface chaude »',
    'Extincteur à portée de main',
  ],
  'Brûlure chimique': [
    'Gants chimiques appropriés au produit',
    'Combinaison de protection chimique',
    'Lunettes étanches / écran facial',
    'Douche de décontamination à moins de 10 secondes',
    'Fiche de données de sécurité (FDS) consultée et affichée',
    'Ventilation locale par aspiration',
  ],
  'Choc électrique': [
    'Cadenassage (LOTO) appliqué',
    'Vérification absence d\'énergie (VAE) effectuée',
    'Isolation électrique (nappe, tapis, gants de la bonne classe)',
    'Distance d\'approche sécuritaire respectée',
    'Protection contre arc flash (EPI arc flash si requis)',
    'Travaux effectués hors tension si possible',
    'Permis de travail électrique en vigueur',
  ],
  'Exposition gaz/vapeurs': [
    'Ventilation mécanique forcée (apport + extraction)',
    'Ventilation locale par aspiration à la source',
    'Détecteur de gaz multi-critères (O₂, LEL, H₂S, CO)',
    'Masque filtrant adapté au contaminant',
    'Appareil respiratoire autonome (ARA) si requis',
    'Fiche de données de sécurité (FDS) consultée',
    'Surveillance continue de l\'atmosphère de travail',
  ],
  'Bruit excessif': [
    'Bouchons auriculaires CSA Z94.2 (NRR approprié)',
    'Coquilles anti-bruit si >100 dB(A)',
    'Rotation des travailleurs exposés',
    'Réduction à la source (capot acoustique, isolation)',
    'Limite de temps d\'exposition respectée (RSST)',
    'Zone calme de repos à proximité',
  ],
  'Vibrations': [
    'Gants anti-vibration homologués',
    'Limitation du temps d\'exposition quotidien',
    'Rotation des travailleurs',
    'Maintenance préventive des équipements vibrants',
    'Outils anti-vibration si disponibles',
  ],
  'Contrainte thermique': [
    'Pauses régulières en zone tempérée',
    'Hydratation fréquente (eau, électrolytes)',
    'Surveillance mutuelle par binôme',
    'Vêtements adaptés aux conditions (chaud/froid)',
    'Rotation des équipes selon indice WBGT / facteur vent-froid',
    'Suivi de la condition physique des travailleurs',
  ],
  'Manutention manuelle': [
    'Aide mécanique (chariot, transpalette, grue)',
    'Charge maximale individuelle respectée (23 kg — RSST)',
    'Formation aux techniques de levage sécuritaire',
    'Fractionnement des charges si possible',
    'Travail en équipe pour charges lourdes',
  ],
  'Collision véhicule': [
    'Périmètre piétons/véhicules balisé et respecté',
    'Vêtements haute visibilité CSA Z96',
    'Signalisation et guides de circulation en place',
    'Vitesse limitée sur le site (affichée)',
    'Contact radio entre conducteurs et piétons',
    'Plan de circulation affiché et communiqué',
  ],
  'Espace clos': [
    'Analyse atmosphérique obligatoire (O₂ 19,5–23 %, LEL <10 %, H₂S <10 ppm)',
    'Ventilation mécanique forcée (apport + extraction)',
    'Surveillance permanente par vigie qualifiée',
    'Équipe de sauvetage en place avant toute entrée',
    'Communication radio / vocale continue',
    'Appareil respiratoire autonome (ARA) de sauvetage prêt',
    'Permis d\'entrée en espace clos en vigueur',
    'Procédure d\'évacuation d\'urgence affichée',
  ],
  'Explosif/incendie': [
    'Permis de travail à chaud en vigueur',
    'Surveillance anti-incendie 30 min après la fin des travaux',
    'Extincteur à portée de main (type approprié au risque)',
    'Surface dégagée de matières combustibles (min. 3 m)',
    'Protection des ouvertures et surfaces à proximité',
    'Vêtements ignifuges / EPI arc flash si requis',
    'Détecteur gaz / explosimètre vérifié avant début',
  ],
  'Projection de fragments': [
    'Lunettes de sécurité ou écran facial',
    'Zone d\'exclusion balisée autour du périmètre',
    'Protège-corps ou blindage si requis',
    'Inspection de l\'outillage avant utilisation',
    'Procédure de changement d\'outil sécuritaire',
  ],
  'Pression / Équipement sous pression': [
    'Dépressurisation avant toute intervention (LOTO)',
    'Inspection de l\'équipement avant utilisation (CSA B51)',
    'Vérification manomètre / soupape de sécurité',
    'Formation spécifique aux équipements sous pression',
    'EPI résistant à la pression (lunettes, gants)',
    'Zone d\'exclusion pendant les tests de pression',
  ],
  'Contact substance dangereuse (SIMDUT)': [
    'Fiche de données de sécurité (FDS) consultée et affichée',
    'Formation SIMDUT/GHS à jour',
    'EPI approprié selon FDS (gants, lunettes, masque)',
    'Ventilation locale ou générale adéquate',
    'Douche de décontamination accessible',
    'Contenants étiquetés selon SIMDUT 2015',
  ],
  'Arc électrique / Flash': [
    'Analyse du risque d\'arc électrique (IEEE 1584 / NFPA 70E)',
    'EPI arc flash (vêtement ATPV approprié, écran facial)',
    'Travaux hors tension si possible',
    'Barricade et signalisation de zone dangereuse',
    'Formation travaux sous tension (NFPA 70E)',
    'Permis de travail électrique spécial arc flash',
  ],
  'Travaux sous tension': [
    'Permis de travail sous tension émis et approuvé',
    'Deux électriciens qualifiés présents',
    'Outils isolés et testés',
    'EPI arc flash complet (vêtement, gants, écran)',
    'Isolation des parties adjacentes sous tension',
    'Plan d\'urgence électrique affiché',
  ],
  'Stress musculosquelettique (TMS)': [
    'Évaluation ergonomique du poste de travail',
    'Aide mécanique (chariot, bras articulé)',
    'Rotation des travailleurs toutes les 1-2 heures',
    'Formation aux techniques de levage sécuritaire',
    'Pauses de récupération régulières',
    'Charge individuelle ≤ 23 kg (RSST)',
  ],
  'Collision — engin de chantier': [
    'Plan de circulation séparant piétons et engins',
    'Vêtements haute visibilité CSA Z96 obligatoires',
    'Signaleur (signaler) lors des manœuvres',
    'Klaxon / sirène de recul sur tous les engins',
    'Vitesse limitée sur site (≤ 15 km/h)',
    'Zone d\'exclusion autour des engins en opération',
  ],
  'Excavation / Effondrement de tranchée': [
    'Vérification de la stabilité des parois avant entrée',
    'Étaiement, blindage ou talutage des parois (RSST)',
    'Inspection quotidienne par une personne compétente',
    'Localisation des services souterrains (Info-Excavation)',
    'Échelle d\'accès à ≤ 8 m de tout travailleur',
    'Zone d\'exclusion = profondeur + 1 m autour de l\'excavation',
  ],
  'Atmosphère explosive (ATEX)': [
    'Classification de zone ATEX (zone 0/1/2 gaz ou 20/21/22 poussière)',
    'Équipements certifiés ATEX (Ex-proof)',
    'Détecteur de gaz / explosimètre continu',
    'Mise à la terre antistatique des équipements',
    'Permis de travail spécial zone ATEX',
    'Interdiction de fumer / flamme nue / téléphone standard',
  ],
  'Ligne de tir / Dynamitage': [
    'Permis d\'utilisation d\'explosifs (LSST / loi C-15.1)',
    'Boutefeu certifié présent en tout temps',
    'Périmètre de sécurité établi et balisé (signaleur en place)',
    'Vérification des ratés selon procédure',
    'Communication radio avec tous les postes avant mise à feu',
    'Plan de tir approuvé et affiché',
    'Interdiction de réentrée avant délai réglementaire (gaz)',
  ],
  'Agents biologiques (virus, bactéries, moisissures)': [
    'EPI adapté au risque (masque N95/P100, gants nitrile, lunettes)',
    'Formation SIMDUT bio et procédures de décontamination',
    'Douche de décontamination accessible',
    'Vaccination à jour si applicable (tétanos, hépatite B)',
    'Procédure de collecte et d\'élimination des déchets bio',
    'Ventilation par pression négative si confinement requis',
  ],
  'Travail isolé / sans surveillance': [
    'Procédure de travail isolé documentée (RSST art. 2.10.7)',
    'Système de check-in régulier (radio, téléphone, app)',
    'Plan d\'urgence connu du travailleur et du superviseur',
    'Équipement de communication fonctionnel et chargé',
    'Registre de présence et d\'heure de retour',
    'Formation aux premiers soins pour le travailleur isolé',
  ],
  'Agression / Violence': [
    'Procédure de prévention de la violence au travail (LSST)',
    'Formation de reconnaissance des comportements à risque',
    'Système d\'alarme ou bouton panique disponible',
    'Travail en équipe ou sous surveillance si risque élevé',
    'Plan d\'intervention d\'urgence connu de tous',
  ],
  'Conditions météorologiques extrêmes': [
    'Consultation météo avant et pendant les travaux',
    'Vêtements adaptés (imperméable, anti-froid, anti-UV)',
    'Pauses à l\'abri selon indice WBGT ou facteur vent-froid',
    'Hydratation renforcée (chaleur) — eau chaude (froid)',
    'Arrêt des travaux si foudre à ≤ 30 km (règle 30/30)',
    'Protection UV (crème, chapeau) si travaux en plein soleil',
  ],
  'Travail près de l\'eau / Noyade': [
    'VFI (veste de flottaison individuelle) homologuée obligatoire',
    'Bouée de sauvetage avec corde à ≤ 3 m du point de travail',
    'Garde-corps ou ligne de vie au-dessus de l\'eau',
    'Formation aux procédures de récupération en eau froide',
    'Communication continue avec une personne à terre',
    'Embarcation de sauvetage disponible si plan d\'eau important',
  ],
};

// ── Default PPE list ───────────────────────────────────────────────────────
function defaultPPE(): PPEItem[] {
  const items: Omit<PPEItem, 'id'>[] = [
    { category: 'Tête', item: 'Casque de sécurité', required: false, specification: 'CSA Z94.1' },
    { category: 'Tête', item: 'Cagoule/capuchon', required: false, specification: '' },
    { category: 'Yeux/Visage', item: 'Lunettes de sécurité', required: false, specification: 'CSA Z94.3' },
    { category: 'Yeux/Visage', item: 'Lunettes étanches', required: false, specification: 'CSA Z94.3' },
    { category: 'Yeux/Visage', item: 'Écran facial', required: false, specification: '' },
    { category: 'Yeux/Visage', item: 'Filtre de soudage', required: false, specification: '' },
    { category: 'Ouïe', item: 'Bouchons auriculaires', required: false, specification: 'CSA Z94.2' },
    { category: 'Ouïe', item: 'Coquilles anti-bruit', required: false, specification: 'CSA Z94.2' },
    { category: 'Respiratoire', item: 'Masque N95/P100', required: false, specification: 'NIOSH' },
    { category: 'Respiratoire', item: 'Demi-masque filtrant', required: false, specification: 'CSA Z94.4' },
    { category: 'Respiratoire', item: 'Masque complet', required: false, specification: 'CSA Z94.4' },
    { category: 'Respiratoire', item: 'Appareil respiratoire autonome', required: false, specification: 'NFPA 1981' },
    { category: 'Mains', item: 'Gants résistants aux coupures', required: false, specification: 'EN 388' },
    { category: 'Mains', item: 'Gants isolants', required: false, specification: 'ASTM D120' },
    { category: 'Mains', item: 'Gants chimiques', required: false, specification: '' },
    { category: 'Mains', item: 'Gants de soudage', required: false, specification: '' },
    { category: 'Pieds', item: 'Chaussures de sécurité', required: false, specification: 'CSA Z195' },
    { category: 'Pieds', item: 'Bottes imperméables', required: false, specification: '' },
    { category: 'Pieds', item: 'Bottes chimiques', required: false, specification: '' },
    { category: 'Corps', item: 'Vêtements haute visibilité', required: false, specification: 'CSA Z96' },
    { category: 'Corps', item: 'Vêtements ignifuges', required: false, specification: '' },
    { category: 'Corps', item: 'Combinaison Tyvek', required: false, specification: '' },
    { category: 'Chute', item: 'Harnais complet', required: false, specification: 'CSA Z259.10' },
    { category: 'Chute', item: 'Longe/dispositif antichute', required: false, specification: 'CSA Z259.11' },
    { category: 'Chute', item: 'Ligne de vie', required: false, specification: 'CSA Z259.2' },
  ];
  return items.map(i => ({ ...i, id: generateId() }));
}

// ── Default permit ─────────────────────────────────────────────────────────
function createDefaultPermit(province: ProvinceCode, tenant?: string): ASTPermit {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber('AST', province, tenant),
    status: 'draft',
    province,
    model: 'simple',
    created_at: now,
    updated_at: now,
    taskInfo: {
      projectNumber: '', projectName: '', workLocation: '', department: '',
      contractor: '', supervisor: '', supervisorCert: '',
      taskDate: now.slice(0, 10), estimatedDuration: '', workerCount: 1,
      taskDescription: '', taskType: '', equipmentInvolved: '',
      specialConditions: '', regulatoryRef: '',
    },
    jobSteps: [],
    ppeRequirements: defaultPPE(),
    ppeNotes: '',
    equipment: {
      tools: [], vehicles: [], specialEquipment: '',
      energySources: [], lotoRequired: false, lotoRef: '',
    },
    participants: [],
    clientDocs: [],
    workers: [],
    workerNotes: '',
    supervisorSigName: '', supervisorSigCert: '', supervisorSigDate: '', supervisorSigNotes: '', supervisorSigStatus: '',
    supervisor_name: '', supervisor_cert: '',
    permit_valid_from: '', permit_valid_to: '',
    permitted_work: '', restrictions: '', finalization_notes: '',
    loto: {
      required: false, ref: '', templateName: '',
      energySources: [], locks: [],
      verificationDone: false, verificationBy: '', verificationDate: '',
      reenergizationAuthBy: '', reenergizationAuthDate: '', notes: '',
    },
    validation: { isComplete: false, percentage: 0 },
  };
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Analyse Sécurité Travail',
    back: 'Retour à AST tableau de bord',
    permit: 'Permis',
    completion: 'Complétion',
    sections: {
      task: 'Tâche',
      steps: 'Étapes',
      ppe: 'EPI',
      equipment: 'Équipement',
      participants: 'Participants',
      finalization: 'Finalisation',
    },
    menu: {
      saveNow: 'Enregistrer maintenant',
      exportJson: 'Exporter JSON',
      print: 'Imprimer',
      newPermit: 'Nouvel AST',
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
    task: {
      cardGeneral: 'Informations générales',
      cardDescription: 'Description de la tâche',
      cardRegulatory: 'Références réglementaires',
      projectNumber: 'N° de projet',
      projectName: 'Nom du projet',
      workLocation: 'Lieu des travaux *',
      department: 'Département',
      contractor: 'Entrepreneur',
      supervisor: 'Superviseur *',
      supervisorCert: 'Certif. superviseur',
      taskDate: 'Date des travaux',
      estimatedDuration: 'Durée estimée',
      workerCount: 'Nb de travailleurs',
      taskType: 'Type de tâche',
      equipmentInvolved: 'Équipements impliqués',
      taskDescription: 'Description de la tâche *',
      specialConditions: 'Conditions particulières',
      regulatoryRef: 'Références réglementaires',
      regulatoryRefPh: 'Ex: CSA Z432, RSST art. 2, procédure interne XYZ-001',
      taskTypes: {
        maintenance: 'Maintenance',
        construction: 'Construction/Installation',
        inspection: 'Inspection',
        nettoyage: 'Nettoyage/Décontamination',
        demarrage: 'Démarrage/Arrêt',
        reparation: "Réparation d'urgence",
        formation: 'Formation/Exercice',
        autre: 'Autre',
      },
      provinceNote: {
        QC: 'Réglements applicables : RSST, LSST (CNESST)',
        ON: 'Applicable regulations: Occupational Health and Safety Act (OHSA)',
        AB: 'Applicable regulations: OHS Act (Alberta)',
        BC: 'Applicable regulations: Workers Compensation Act (WorkSafeBC)',
        SK: 'Applicable regulations: Saskatchewan Employment Act, OHS Regulations',
        MB: 'Applicable regulations: Workplace Safety and Health Act (Manitoba)',
        NB: 'Applicable regulations: Occupational Health and Safety Act (NB)',
        NS: 'Applicable regulations: Occupational Health and Safety Act (Nova Scotia)',
        PE: 'Applicable regulations: Occupational Health and Safety Act (PEI)',
        NL: 'Applicable regulations: Occupational Health and Safety Act (NL)',
      },
    },
    steps: {
      cardTitle: 'Étapes du travail — Analyse des dangers',
      instructions: "Pour chaque étape du travail, identifier les dangers et les mesures préventives selon la hiérarchie des contrôles.",
      addStep: 'Ajouter une étape',
      stepLabel: 'Étape',
      description: 'Description de l\'étape *',
      descriptionPh: 'Que fait-on lors de cette étape?',
      hazards: 'Dangers identifiés',
      hazardNotes: 'Notes sur les dangers',
      hazardNotesPh: 'Description libre des dangers…',
      controls: 'Mesures préventives',
      controlNotes: 'Notes sur les mesures',
      controlNotesPh: 'Description libre des mesures préventives…',
      riskBefore: 'Risque avant mesures',
      riskAfter: 'Risque résiduel',
      probability: 'Probabilité',
      severity: 'Gravité',
      responsible: 'Responsable',
      responsiblePh: 'Nom du responsable',
      verified: 'Vérifié superviseur',
      noSteps: 'Aucune étape définie. Cliquez sur "Ajouter une étape" pour commencer.',
      summary: (steps: number, hazards: number, controls: number) =>
        `${steps} étape(s) | ${hazards} danger(s) identifié(s) | ${controls} mesure(s) préventive(s)`,
      riskMatrix: 'Matrice de risque',
      probLabels: ['', 'Très improbable', 'Improbable', 'Possible', 'Probable', 'Très probable'],
      sevLabels: ['', 'Négligeable', 'Mineur', 'Modéré', 'Sévère', 'Catastrophique'],
      hazardOptions: [
        // Chutes
        'Chute de plain-pied', 'Chute de hauteur', 'Objet tombant',
        // Mécanique
        'Pincement/écrasement', 'Coupure/lacération', 'Projection de fragments',
        'Pression / Équipement sous pression',
        // Thermique / Chimique
        'Brûlure thermique', 'Brûlure chimique', 'Exposition gaz/vapeurs',
        'Contact substance dangereuse (SIMDUT)',
        // Électrique
        'Choc électrique', 'Arc électrique / Flash', 'Travaux sous tension',
        // Ergonomie
        'Bruit excessif', 'Vibrations', 'Contrainte thermique', 'Manutention manuelle',
        'Stress musculosquelettique (TMS)',
        // Circulation / Espaces
        'Collision véhicule', 'Collision — engin de chantier',
        'Espace clos', 'Excavation / Effondrement de tranchée',
        // Incendie / Explosion
        'Explosif/incendie', 'Atmosphère explosive (ATEX)', 'Ligne de tir / Dynamitage',
        // Biologique / Psychosocial
        'Agents biologiques (virus, bactéries, moisissures)',
        'Travail isolé / sans surveillance',
        'Agression / Violence',
        // Intempéries
        'Conditions météorologiques extrêmes', 'Travail près de l\'eau / Noyade',
        'Autre',
      ],
      hazardGroups: [
        { label: 'Chutes',                   options: ['Chute de plain-pied', 'Chute de hauteur', 'Objet tombant'] },
        { label: 'Mécanique',                options: ['Pincement/écrasement', 'Coupure/lacération', 'Projection de fragments', 'Pression / Équipement sous pression'] },
        { label: 'Thermique / Chimique',     options: ['Brûlure thermique', 'Brûlure chimique', 'Exposition gaz/vapeurs', 'Contact substance dangereuse (SIMDUT)'] },
        { label: 'Électrique',               options: ['Choc électrique', 'Arc électrique / Flash', 'Travaux sous tension'] },
        { label: 'Ergonomie',                options: ['Bruit excessif', 'Vibrations', 'Contrainte thermique', 'Manutention manuelle', 'Stress musculosquelettique (TMS)'] },
        { label: 'Circulation / Espaces',    options: ['Collision véhicule', 'Collision — engin de chantier', 'Espace clos', 'Excavation / Effondrement de tranchée'] },
        { label: 'Incendie / Explosion',     options: ['Explosif/incendie', 'Atmosphère explosive (ATEX)', 'Ligne de tir / Dynamitage'] },
        { label: 'Biologique / Psychosocial', options: ['Agents biologiques (virus, bactéries, moisissures)', 'Travail isolé / sans surveillance', 'Agression / Violence'] },
        { label: 'Intempéries / Milieu',     options: ['Conditions météorologiques extrêmes', 'Travail près de l\'eau / Noyade'] },
        { label: 'Autre',                    options: ['Autre'] },
      ],
      controlOptions: [
        // Hiérarchie des contrôles
        'Élimination du danger', 'Substitution', 'Contrôle technique',
        'Contrôle administratif', 'EPI requis',
        // Travail en hauteur / chute
        'Garde-corps / rampe de sécurité', 'Filet de sécurité',
        'Plate-forme de travail sécurisée', 'Harnais de sécurité + longe',
        'Harnais + ligne de vie antichute', 'Ancrage certifié',
        // LOTO / Énergie
        'Cadenassage (LOTO)', "Vérification absence d'énergie", 'Blocage mécanique',
        "Permis de travail sur l'énergie",
        // Espace clos
        "Analyse atmosphérique continue (O₂, LEL, H₂S)", 'Ventilation mécanique forcée',
        'Surveillance par vigie en permanence', 'Équipe de sauvetage en place',
        'Communication radio/vocale régulière',
        // Chimique / respiratoire
        "Ventilation locale par aspiration à la source", 'Masque filtrant approprié',
        'Appareil respiratoire autonome (ARA)', 'Combinaison de protection chimique',
        'Douche de décontamination à proximité',
        // Électrique
        "Mise à la terre et court-circuit", 'Isolation électrique (nappe/tapis)',
        "Distance de sécurité d'approche respectée", 'Équipement Classe II ou mieux',
        // Levage / manutention
        'Inspection pré-utilisation de l\'équipement de levage',
        'Plan de levage approuvé', 'Zone de levage balisée et évacuée',
        'Matériel de manutention mécanique utilisé',
        // Feu / chaud
        'Permis de travail à chaud en vigueur', 'Surveillance anti-incendie (30 min post)',
        'Extincteur à portée de main', 'Surface dégagée de matières combustibles',
        // Général
        "Signalisation et périmètre de sécurité", 'Procédure de travail sécuritaire écrite',
        'Formation spécifique vérifiée', 'Supervision continue par responsable désigné',
        "Inspection avant utilisation", "Plan d'urgence et évacuation affiché",
        'Outillage et équipements en bon état certifié',
      ],
    },
    ppe: {
      cardTitle: 'Équipement de protection individuel requis',
      cardNotes: 'Notes EPI',
      notesLabel: 'Exigences particulières ou spécifications additionnelles',
      notesPh: 'Exigences additionnelles, spécifications particulières…',
      required: 'Requis',
      specification: 'Spécification',
      requiredCount: (n: number) => `${n} EPI requis`,
    },
    equipment: {
      cardTools: 'Outils et équipements',
      cardVehicles: 'Véhicules/Équipements motorisés',
      cardEnergy: "Sources d'énergie et LOTO",
      toolName: 'Nom de l\'outil/équipement',
      toolCondition: 'État',
      toolInspectedBy: 'Inspecté par',
      toolNotes: 'Notes',
      addTool: 'Ajouter un outil',
      vehicleType: 'Type de véhicule',
      vehicleLicense: 'Plaque/matricule',
      vehicleInspected: 'Inspecté',
      addVehicle: 'Ajouter un véhicule',
      specialEquipment: 'Équipements spéciaux',
      specialEquipmentPh: 'Équipements spéciaux ou non-standard…',
      energySources: "Sources d'énergie présentes",
      lotoRequired: 'Permis LOTO requis',
      lotoRef: 'Référence procédure LOTO',
      lotoRefPh: 'N° ou référence de la procédure LOTO…',
      lotoWarning: 'Un permis LOTO séparé est requis pour ces travaux.',
      conditions: {
        bon: 'Bon état',
        acceptable: 'Acceptable',
        mauvais: 'À remplacer',
        remplacé: 'Remplacé',
      },
      energyOptions: ['Électrique', 'Mécanique', 'Pneumatique', 'Hydraulique', 'Thermique', 'Chimique', 'Gravitationnel'],
    },
    participants: {
      cardPersonnel: 'Personnel',
      cardSupervisor: 'Superviseur responsable',
      name: 'Nom',
      role: 'Rôle',
      company: 'Entreprise',
      acknowledged: 'Prise de connaissance',
      acknowledgedAt: 'Date/heure',
      addParticipant: 'Ajouter un participant',
      totalCount: (total: number, ack: number) => `${total} participant(s) — ${ack} prise(s) de connaissance`,
      ackStatement: "Je déclare avoir lu, compris et accepté les mesures préventives décrites dans cette AST. Je m'engage à respecter ces mesures lors de l'exécution des travaux.",
      supervisorName: 'Nom du superviseur',
      supervisorCert: 'Certification',
      supervisorDate: 'Date/heure de signature',
      supervisorNotes: 'Notes du superviseur',
      roles: {
        travailleur: 'Travailleur',
        superviseur: 'Superviseur',
        visiteur: 'Visiteur',
        sous_traitant: 'Sous-traitant',
        secouriste: 'Secouriste',
      },
    },
    finalization: {
      cardValidation: "Validation de l'AST",
      cardApproval: 'Approbation superviseur',
      cardWork: 'Travaux autorisés',
      supervisorName: 'Nom du superviseur',
      supervisorNamePh: 'Prénom et nom',
      supervisorCert: 'Certification',
      supervisorCertPh: 'N° de certification',
      validFrom: 'Valide du',
      validTo: 'Valide jusqu\'au',
      permittedWork: 'Travaux autorisés',
      permittedWorkPh: 'Description des travaux autorisés…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Conditions ou restrictions particulières…',
      finalNotes: 'Notes finales',
      finalNotesPh: 'Notes, observations ou conditions particulières…',
      activate: 'Approuver et activer',
      complete: 'Compléter et archiver',
      save: 'Enregistrer',
      reopen: 'Rouvrir',
      warnings: {
        noSteps: 'Aucune étape de travail définie',
        noPPE: 'Aucun EPI requis sélectionné',
        noParticipants: 'Aucun participant enregistré',
        criticalRisk: (n: number) => `${n} étape(s) avec risque résiduel critique`,
        notAcknowledged: (n: number) => `${n} participant(s) n'ont pas confirmé la lecture`,
      },
    },
    add: 'Ajouter',
    remove: 'Supprimer',
    moveUp: 'Monter',
    moveDown: 'Descendre',
  },
  en: {
    title: 'Job Safety Analysis',
    back: 'Back to AST dashboard',
    permit: 'Permit',
    completion: 'Completion',
    sections: {
      task: 'Task',
      steps: 'Steps',
      ppe: 'PPE',
      equipment: 'Equipment',
      participants: 'Participants',
      finalization: 'Finalization',
    },
    menu: {
      saveNow: 'Save now',
      exportJson: 'Export JSON',
      print: 'Print',
      newPermit: 'New JSA',
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
    task: {
      cardGeneral: 'General information',
      cardDescription: 'Task description',
      cardRegulatory: 'Regulatory references',
      projectNumber: 'Project #',
      projectName: 'Project name',
      workLocation: 'Work location *',
      department: 'Department',
      contractor: 'Contractor',
      supervisor: 'Supervisor *',
      supervisorCert: 'Supervisor cert.',
      taskDate: 'Task date',
      estimatedDuration: 'Estimated duration',
      workerCount: 'Worker count',
      taskType: 'Task type',
      equipmentInvolved: 'Equipment involved',
      taskDescription: 'Task description *',
      specialConditions: 'Special conditions',
      regulatoryRef: 'Regulatory references',
      regulatoryRefPh: 'E.g.: CSA Z432, OHSA s.25, internal procedure XYZ-001',
      taskTypes: {
        maintenance: 'Maintenance',
        construction: 'Construction/Installation',
        inspection: 'Inspection',
        nettoyage: 'Cleaning/Decontamination',
        demarrage: 'Start-up/Shut-down',
        reparation: 'Emergency repair',
        formation: 'Training/Drill',
        autre: 'Other',
      },
      provinceNote: {
        QC: 'Applicable regulations: RSST, LSST (CNESST)',
        ON: 'Applicable regulations: Occupational Health and Safety Act (OHSA)',
        AB: 'Applicable regulations: OHS Act (Alberta)',
        BC: 'Applicable regulations: Workers Compensation Act (WorkSafeBC)',
        SK: 'Applicable regulations: Saskatchewan Employment Act, OHS Regulations',
        MB: 'Applicable regulations: Workplace Safety and Health Act (Manitoba)',
        NB: 'Applicable regulations: Occupational Health and Safety Act (NB)',
        NS: 'Applicable regulations: Occupational Health and Safety Act (Nova Scotia)',
        PE: 'Applicable regulations: Occupational Health and Safety Act (PEI)',
        NL: 'Applicable regulations: Occupational Health and Safety Act (NL)',
      },
    },
    steps: {
      cardTitle: 'Work steps — Hazard analysis',
      instructions: 'For each work step, identify hazards and preventive measures following the hierarchy of controls.',
      addStep: 'Add a step',
      stepLabel: 'Step',
      description: 'Step description *',
      descriptionPh: 'What is done in this step?',
      hazards: 'Identified hazards',
      hazardNotes: 'Hazard notes',
      hazardNotesPh: 'Free-text hazard description…',
      controls: 'Control measures',
      controlNotes: 'Control notes',
      controlNotesPh: 'Free-text control description…',
      riskBefore: 'Risk before controls',
      riskAfter: 'Residual risk',
      probability: 'Probability',
      severity: 'Severity',
      responsible: 'Responsible',
      responsiblePh: 'Name of responsible person',
      verified: 'Supervisor verified',
      noSteps: 'No steps defined. Click "Add a step" to begin.',
      summary: (steps: number, hazards: number, controls: number) =>
        `${steps} step(s) | ${hazards} hazard(s) identified | ${controls} control measure(s)`,
      riskMatrix: 'Risk matrix',
      probLabels: ['', 'Very unlikely', 'Unlikely', 'Possible', 'Likely', 'Very likely'],
      sevLabels: ['', 'Negligible', 'Minor', 'Moderate', 'Severe', 'Catastrophic'],
      hazardOptions: [
        'Slip/trip on same level', 'Fall from height', 'Falling object',
        'Pinching/crushing', 'Cut/laceration', 'Fragment/object projection',
        'Pressure / Pressurized equipment',
        'Thermal burn', 'Chemical burn', 'Gas/vapour exposure',
        'Hazardous substance contact (WHMIS)',
        'Electric shock', 'Electrical arc flash', 'Live electrical work',
        'Excessive noise', 'Vibration', 'Thermal stress', 'Manual handling',
        'Musculoskeletal disorder (MSD)',
        'Vehicle collision', 'Mobile equipment collision',
        'Confined space', 'Excavation / Trench collapse',
        'Explosion/fire', 'Explosive atmosphere (ATEX)', 'Blasting / Firing line',
        'Biological agents (virus, bacteria, mould)',
        'Working alone / unsupervised',
        'Assault / Violence',
        'Extreme weather conditions', 'Work near water / Drowning',
        'Other',
      ],
      hazardGroups: [
        { label: 'Falls',                    options: ['Slip/trip on same level', 'Fall from height', 'Falling object'] },
        { label: 'Mechanical',               options: ['Pinching/crushing', 'Cut/laceration', 'Fragment/object projection', 'Pressure / Pressurized equipment'] },
        { label: 'Thermal / Chemical',       options: ['Thermal burn', 'Chemical burn', 'Gas/vapour exposure', 'Hazardous substance contact (WHMIS)'] },
        { label: 'Electrical',               options: ['Electric shock', 'Electrical arc flash', 'Live electrical work'] },
        { label: 'Ergonomics',               options: ['Excessive noise', 'Vibration', 'Thermal stress', 'Manual handling', 'Musculoskeletal disorder (MSD)'] },
        { label: 'Traffic / Spaces',         options: ['Vehicle collision', 'Mobile equipment collision', 'Confined space', 'Excavation / Trench collapse'] },
        { label: 'Fire / Explosion',         options: ['Explosion/fire', 'Explosive atmosphere (ATEX)', 'Blasting / Firing line'] },
        { label: 'Biological / Psychosocial', options: ['Biological agents (virus, bacteria, mould)', 'Working alone / unsupervised', 'Assault / Violence'] },
        { label: 'Weather / Environment',    options: ['Extreme weather conditions', 'Work near water / Drowning'] },
        { label: 'Other',                    options: ['Other'] },
      ],
      controlOptions: [
        'Élimination du danger', 'Substitution', 'Contrôle technique',
        'Contrôle administratif', 'EPI requis',
        'Garde-corps / rampe de sécurité', 'Filet de sécurité',
        'Plate-forme de travail sécurisée', 'Harnais de sécurité + longe',
        'Harnais + ligne de vie antichute', 'Ancrage certifié',
        'Cadenassage (LOTO)', "Vérification absence d'énergie", 'Blocage mécanique',
        "Permis de travail sur l'énergie",
        "Analyse atmosphérique continue (O₂, LEL, H₂S)", 'Ventilation mécanique forcée',
        'Surveillance par vigie en permanence', 'Équipe de sauvetage en place',
        'Communication radio/vocale régulière',
        "Ventilation locale par aspiration à la source", 'Masque filtrant approprié',
        'Appareil respiratoire autonome (ARA)', 'Combinaison de protection chimique',
        'Douche de décontamination à proximité',
        "Mise à la terre et court-circuit", 'Isolation électrique (nappe/tapis)',
        "Distance de sécurité d'approche respectée", 'Équipement Classe II ou mieux',
        "Inspection pré-utilisation de l'équipement de levage",
        'Plan de levage approuvé', 'Zone de levage balisée et évacuée',
        'Matériel de manutention mécanique utilisé',
        'Permis de travail à chaud en vigueur', 'Surveillance anti-incendie (30 min post)',
        'Extincteur à portée de main', 'Surface dégagée de matières combustibles',
        "Signalisation et périmètre de sécurité", 'Procédure de travail sécuritaire écrite',
        'Formation spécifique vérifiée', 'Supervision continue par responsable désigné',
        "Inspection avant utilisation", "Plan d'urgence et évacuation affiché",
        'Outillage et équipements en bon état certifié',
      ],
    },
    ppe: {
      cardTitle: 'Required personal protective equipment',
      cardNotes: 'PPE notes',
      notesLabel: 'Special requirements or additional specifications',
      notesPh: 'Additional requirements, special specifications…',
      required: 'Required',
      specification: 'Specification',
      requiredCount: (n: number) => `${n} PPE required`,
    },
    equipment: {
      cardTools: 'Tools and equipment',
      cardVehicles: 'Vehicles/Motorized equipment',
      cardEnergy: 'Energy sources and LOTO',
      toolName: 'Tool/equipment name',
      toolCondition: 'Condition',
      toolInspectedBy: 'Inspected by',
      toolNotes: 'Notes',
      addTool: 'Add a tool',
      vehicleType: 'Vehicle type',
      vehicleLicense: 'License/serial',
      vehicleInspected: 'Inspected',
      addVehicle: 'Add a vehicle',
      specialEquipment: 'Special equipment',
      specialEquipmentPh: 'Special or non-standard equipment…',
      energySources: 'Energy sources present',
      lotoRequired: 'LOTO permit required',
      lotoRef: 'LOTO procedure reference',
      lotoRefPh: 'LOTO procedure number or reference…',
      lotoWarning: 'A separate LOTO permit is required for this work.',
      conditions: {
        bon: 'Good condition',
        acceptable: 'Acceptable',
        mauvais: 'Replace needed',
        remplacé: 'Replaced',
      },
      energyOptions: ['Electrical', 'Mechanical', 'Pneumatic', 'Hydraulic', 'Thermal', 'Chemical', 'Gravitational'],
    },
    participants: {
      cardPersonnel: 'Personnel',
      cardSupervisor: 'Responsible supervisor',
      name: 'Name',
      role: 'Role',
      company: 'Company',
      acknowledged: 'Acknowledgement',
      acknowledgedAt: 'Date/time',
      addParticipant: 'Add a participant',
      totalCount: (total: number, ack: number) => `${total} participant(s) — ${ack} acknowledgement(s)`,
      ackStatement: 'I declare that I have read, understood and accepted the preventive measures described in this JSA. I commit to following these measures during the work.',
      supervisorName: 'Supervisor name',
      supervisorCert: 'Certification',
      supervisorDate: 'Signature date/time',
      supervisorNotes: 'Supervisor notes',
      roles: {
        travailleur: 'Worker',
        superviseur: 'Supervisor',
        visiteur: 'Visitor',
        sous_traitant: 'Subcontractor',
        secouriste: 'First-aider',
      },
    },
    finalization: {
      cardValidation: 'JSA validation',
      cardApproval: 'Supervisor approval',
      cardWork: 'Authorized work',
      supervisorName: 'Supervisor name',
      supervisorNamePh: 'First and last name',
      supervisorCert: 'Certification',
      supervisorCertPh: 'Certification number',
      validFrom: 'Valid from',
      validTo: 'Valid to',
      permittedWork: 'Authorized work',
      permittedWorkPh: 'Description of authorized work…',
      restrictions: 'Restrictions',
      restrictionsPh: 'Special conditions or restrictions…',
      finalNotes: 'Final notes',
      finalNotesPh: 'Notes, observations or special conditions…',
      activate: 'Approve and activate',
      complete: 'Complete and archive',
      save: 'Save',
      reopen: 'Reopen',
      warnings: {
        noSteps: 'No work steps defined',
        noPPE: 'No PPE items selected as required',
        noParticipants: 'No participants registered',
        criticalRisk: (n: number) => `${n} step(s) with critical residual risk`,
        notAcknowledged: (n: number) => `${n} participant(s) have not confirmed acknowledgement`,
      },
    },
    add: 'Add',
    remove: 'Remove',
    moveUp: 'Move up',
    moveDown: 'Move down',
  },
} as const;

// ── Shared sub-components ──────────────────────────────────────────────────
function Card({ title, icon, accent = 'text-teal-600', badge, children }: {
  title: string; icon: React.ReactNode; accent?: string; badge?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className={accent}>{icon}</span>
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

function TextInput({ value, onChange, placeholder = '', disabled = false, type = 'text', selectOnFocus = false }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; type?: string; selectOnFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value as string}
      onChange={e => onChange(e.target.value)}
      onFocus={selectOnFocus ? (e => e.target.select()) : undefined}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
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
      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800"
    >
      <option value="">—</option>
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
        className="h-4 w-4 rounded border-slate-300 accent-teal-600"
        disabled={disabled}
      />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder = '', rows = 3, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none resize-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
      />
    </div>
  );
}

// ── TagSelector ────────────────────────────────────────────────────────────
function TagSelector({ label, options, selected, onChange, disabled = false, allowCustom = false, customPlaceholder = 'Ajouter…' }: {
  label: string; options: string[]; selected: string[];
  onChange: (v: string[]) => void; disabled?: boolean;
  allowCustom?: boolean; customPlaceholder?: string;
}) {
  const [input, setInput] = useState('');

  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    const val = input.trim();
    if (!val || selected.includes(val)) { setInput(''); return; }
    onChange([...selected, val]);
    setInput('');
  };

  const allOptions = [...options, ...selected.filter(s => !options.includes(s))];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {allOptions.map(opt => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selected.includes(opt)
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600'
            } disabled:opacity-50 disabled:cursor-default`}
          >
            {opt}
          </button>
        ))}
      </div>
      {allowCustom && !disabled && (
        <div className="flex gap-1.5 mt-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder={customPlaceholder}
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none"
          />
          <button type="button" onClick={addCustom} disabled={!input.trim()}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── HazardDropdown — liste déroulante par catégorie ───────────────────────
function HazardDropdown({ label, options, groups, selected, onChange, disabled = false, language = 'fr', customPlaceholder }: {
  label: string;
  options: string[];
  groups?: { label: string; options: string[] }[];
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  language?: Language;
  customPlaceholder?: string;
}) {
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val || selected.includes(val)) { setCustomInput(''); return; }
    onChange([...selected, val]);
    setCustomInput('');
  };

  const allKnown = new Set(options);
  const customSelected = selected.filter(s => !allKnown.has(s));

  // Couleurs par catégorie (index)
  const groupColors = [
    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40',
    'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30',
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>

      {/* Badges sélectionnés */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(opt => (
            <span key={opt}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {opt}
              {!disabled && (
                <button type="button" onClick={() => toggle(opt)}
                  className="ml-0.5 hover:text-red-900 dark:hover:text-red-100 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Bouton ouverture */}
      {!disabled && (
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:border-red-400 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors"
          >
            <Menu className="w-4 h-4" />
            {selected.length === 0
              ? tr('Sélectionner les dangers…', 'Select hazards…')
              : tr(`Modifier (${selected.length} sélectionné${selected.length > 1 ? 's' : ''})`, `Edit (${selected.length} selected)`)}
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-1.5 z-40 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
              {/* En-tête */}
              <div className="sticky top-0 z-10 px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {tr('Dangers identifiés', 'Identified hazards')}
                </span>
                {selected.length > 0 && (
                  <button type="button" onClick={() => onChange([])}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors">
                    {tr('Tout effacer', 'Clear all')}
                  </button>
                )}
              </div>

              {/* Groupes */}
              {groups ? (
                <div className="py-1">
                  {groups.map((group, gi) => (
                    <div key={group.label}>
                      {/* En-tête de groupe */}
                      <div className={`flex items-center gap-2 px-3 py-1.5 mt-1 ${groupColors[gi % groupColors.length]}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{group.label}</span>
                        {group.options.some(o => selected.includes(o)) && (
                          <span className="ml-auto text-[10px] font-semibold">
                            {group.options.filter(o => selected.includes(o)).length} ✓
                          </span>
                        )}
                      </div>
                      {/* Options du groupe */}
                      {group.options.map(opt => (
                        <label key={opt}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${selected.includes(opt) ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={() => toggle(opt)}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-red-500"
                          />
                          <span className={`text-sm ${selected.includes(opt) ? 'text-red-700 dark:text-red-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                  {/* Options custom déjà sélectionnées */}
                  {customSelected.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 mt-1 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tr('Personnalisé', 'Custom')}</span>
                      </div>
                      {customSelected.map(opt => (
                        <label key={opt}
                          className="flex items-center gap-3 px-4 py-2 cursor-pointer bg-red-50 dark:bg-red-900/10">
                          <input type="checkbox" checked onChange={() => toggle(opt)}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-red-500" />
                          <span className="text-sm text-red-700 dark:text-red-300 font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Fallback liste plate
                <div className="py-1">
                  {options.map(opt => (
                    <label key={opt}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${selected.includes(opt) ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                      <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 accent-red-500" />
                      <span className={`text-sm ${selected.includes(opt) ? 'text-red-700 dark:text-red-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Ajout custom */}
              <div className="sticky bottom-0 border-t border-slate-100 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-800">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                    placeholder={customPlaceholder ?? tr('Danger personnalisé…', 'Custom hazard…')}
                    className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                  <button type="button" onClick={addCustom} disabled={!customInput.trim()}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lecture seule — custom */}
      {disabled && customSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customSelected.map(opt => (
            <span key={opt} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Contrôles contextuels (modèle complet) ────────────────────────────────
// ── Store des moyens de contrôle "standard" du tenant (tenant_ast_options) ──
interface TenantControl { id: string; label: string; hazard: string | null }
interface TenantControlsApi {
  byHazard: (hazard: string) => TenantControl[];
  add: (hazard: string, label: string) => void;
  update: (id: string, label: string) => void;
  remove: (id: string) => void;
}
const TenantControlsCtx = React.createContext<TenantControlsApi | null>(null);

// Boîte de contrôles pour UN danger : suggestions statiques + standards du tenant
// (modifiables/supprimables) + ligne "ajouter un moyen de contrôle".
function HazardControlBox({ hazard, staticControls, tenantControls, selected, disabled, language, onToggle, onReplace }: {
  hazard: string; staticControls: string[]; tenantControls: TenantControl[];
  selected: string[]; disabled: boolean; language: Language;
  onToggle: (ctrl: string) => void; onReplace: (oldC: string, newC: string) => void;
}) {
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  const tc = useContext(TenantControlsCtx);
  const [adding, setAdding] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const exists = (label: string) =>
    staticControls.includes(label) || tenantControls.some(c => c.label === label);

  const addControl = () => {
    const v = adding.trim();
    if (!v) return;
    if (!selected.includes(v)) onToggle(v);          // coche pour cette étape
    if (!exists(v)) tc?.add(hazard, v);              // devient un standard du tenant
    setAdding('');
  };

  const saveEdit = (c: TenantControl) => {
    const v = editVal.trim();
    if (!v || v === c.label) { setEditingId(null); return; }
    tc?.update(c.id, v);
    if (selected.includes(c.label)) onReplace(c.label, v);
    setEditingId(null);
  };

  const rowCls = (on: boolean) =>
    `flex items-start gap-2.5 rounded px-2 py-1.5 transition-colors ${on ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-800">
        <AlertTriangle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">{hazard}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {/* Suggestions statiques */}
        {staticControls.map(ctrl => (
          <label key={ctrl} className={`cursor-pointer ${rowCls(selected.includes(ctrl))}`}>
            <input type="checkbox" checked={selected.includes(ctrl)} onChange={() => onToggle(ctrl)} disabled={disabled}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600" />
            <span className={`text-xs leading-relaxed ${selected.includes(ctrl) ? 'text-teal-800 dark:text-teal-300 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{ctrl}</span>
          </label>
        ))}

        {/* Standards du tenant (modifiables / supprimables) */}
        {tenantControls.map(c => (
          editingId === c.id ? (
            <div key={c.id} className="flex items-center gap-1.5">
              <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEdit(c); } if (e.key === 'Escape') setEditingId(null); }}
                className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none" />
              <button type="button" onClick={() => saveEdit(c)} className="p-1 text-teal-600 hover:text-teal-700" title={tr('Enregistrer', 'Save')}><Check className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:text-slate-600" title={tr('Annuler', 'Cancel')}><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div key={c.id} className={rowCls(selected.includes(c.label))}>
              <input type="checkbox" checked={selected.includes(c.label)} onChange={() => onToggle(c.label)} disabled={disabled}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600" />
              <span className={`flex-1 text-xs leading-relaxed ${selected.includes(c.label) ? 'text-teal-800 dark:text-teal-300 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                {c.label}
                <span className="ml-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">{tr('standard', 'standard')}</span>
              </span>
              {!disabled && (
                <span className="flex items-center gap-0.5 shrink-0">
                  <button type="button" onClick={() => { setEditingId(c.id); setEditVal(c.label); }} className="p-1 text-slate-400 hover:text-teal-600" title={tr('Modifier', 'Edit')}><Pencil className="w-3 h-3" /></button>
                  <button type="button" onClick={() => tc?.remove(c.id)} className="p-1 text-slate-400 hover:text-red-600" title={tr('Supprimer', 'Remove')}><Trash2 className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )
        ))}

        {staticControls.length === 0 && tenantControls.length === 0 && (
          <p className="px-2 text-xs italic text-slate-400 dark:text-slate-500">
            {tr('Aucune mesure suggérée — ajoutez-en une ci-dessous.', 'No suggested measure — add one below.')}
          </p>
        )}

        {/* Ligne : ajouter un moyen de contrôle pour ce danger */}
        {!disabled && (
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={adding}
              onChange={e => setAdding(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addControl(); } }}
              placeholder={tr('Ajouter un moyen de contrôle…', 'Add a control measure…')}
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 outline-none"
            />
            <button type="button" onClick={addControl} disabled={!adding.trim()}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ContextualControls({ hazards, controls, onChange, disabled, language = 'fr' }: {
  hazards: string[]; controls: string[];
  onChange: (v: string[]) => void; disabled: boolean; language?: Language;
}) {
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;
  const tc = useContext(TenantControlsCtx);

  const toggle = (ctrl: string) => {
    if (disabled) return;
    onChange(controls.includes(ctrl) ? controls.filter(c => c !== ctrl) : [...controls, ctrl]);
  };
  const replace = (oldC: string, newC: string) => onChange(controls.map(c => (c === oldC ? newC : c)));

  // Contrôles déjà cochés qui ne correspondent à aucune suggestion (statique ou tenant)
  const allSuggested = new Set(
    hazards.flatMap(h => [...(HAZARD_CONTROLS[h] ?? []), ...((tc?.byHazard(h) ?? []).map(c => c.label))]),
  );
  const orphanControls = controls.filter(c => !allSuggested.has(c));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
        {tr('Mesures de contrôle de danger', 'Hazard control measures')}
      </label>

      {hazards.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          {tr("Sélectionnez d'abord les dangers identifiés pour afficher les mesures suggérées.", 'Select identified hazards above to display suggested control measures.')}
        </p>
      )}

      {/* Une boîte par danger sélectionné (avec ajout/édition de moyens de contrôle) */}
      {hazards.map(hazard => (
        <HazardControlBox
          key={hazard}
          hazard={hazard}
          staticControls={HAZARD_CONTROLS[hazard] ?? []}
          tenantControls={tc?.byHazard(hazard) ?? []}
          selected={controls}
          disabled={disabled}
          language={language}
          onToggle={toggle}
          onReplace={replace}
        />
      ))}

      {/* Contrôles libres déjà ajoutés sans danger associé */}
      {orphanControls.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{tr('Autres contrôles', 'Other controls')}</span>
          </div>
          <div className="p-3 space-y-1.5">
            {orphanControls.map(ctrl => (
              <label key={ctrl} className="flex items-start gap-2.5 cursor-pointer rounded px-2 py-1.5 bg-teal-50 dark:bg-teal-900/20">
                <input type="checkbox" checked onChange={() => toggle(ctrl)} disabled={disabled}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600" />
                <span className="text-xs leading-relaxed text-teal-800 dark:text-teal-300 font-medium">{ctrl}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {controls.length > 0 && (
        <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
          {language === 'fr'
            ? `${controls.length} mesure${controls.length > 1 ? 's' : ''} de contrôle sélectionnée${controls.length > 1 ? 's' : ''}`
            : `${controls.length} control measure${controls.length > 1 ? 's' : ''} selected`}
        </div>
      )}
    </div>
  );
}

// ── Risk mini-matrix ───────────────────────────────────────────────────────
function RiskMatrix({ prob, sev, lang }: { prob: number; sev: number; lang: Language }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-8 h-6" />
            {[1, 2, 3, 4, 5].map(s => (
              <th key={s} className={`w-8 h-6 text-center font-medium text-slate-500 dark:text-slate-400 ${sev === s ? 'font-bold text-slate-800 dark:text-slate-100' : ''}`}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map(p => (
            <tr key={p}>
              <td className={`w-8 h-6 text-center font-medium text-slate-500 dark:text-slate-400 ${prob === p ? 'font-bold text-slate-800 dark:text-slate-100' : ''}`}>{p}</td>
              {[1, 2, 3, 4, 5].map(s => {
                const score = p * s;
                const isActive = p === prob && s === sev;
                return (
                  <td key={s} className={`w-8 h-6 text-center rounded ${getRiskCellColor(score)} ${isActive ? 'ring-2 ring-slate-800 dark:ring-white font-bold' : ''} opacity-80 text-[10px] text-white font-semibold`}>
                    {score}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        {lang === 'fr' ? '↕ Probabilité × → Gravité' : '↕ Probability × → Severity'}
      </div>
    </div>
  );
}

// ── Section: Task ──────────────────────────────────────────────────────────
function TaskSection({ ast, onChange, language, readOnly, personnel = [], projects = [], suppliers = [] }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean; personnel?: EntityOption[]; projects?: EntityOption[]; suppliers?: EntityOption[];
}) {
  const t = T[language].task;
  const ti = ast.taskInfo;
  const model = ast.model ?? 'simple';

  const set = (key: keyof ASTPermit['taskInfo'], val: string | number) =>
    onChange(p => ({ ...p, taskInfo: { ...p.taskInfo, [key]: val } }));

  // Sélection d'un projet (module Projet) → auto-remplit les champs existants (nom, lieu) depuis la table
  // projects. Les valeurs vides du projet ne remplacent rien. Saisie libre toujours possible (onText).
  async function pickProject(o: EntityOption) {
    set('projectNumber', o.label);
    if (!o.id || !supabase) return;
    try {
      const { data } = await supabase.from('projects').select('project_number, title, location, client_name').eq('id', o.id).maybeSingle();
      const d: any = data; if (!d) return;
      onChange(p => ({ ...p, taskInfo: { ...p.taskInfo,
        projectNumber: d.project_number || p.taskInfo.projectNumber,
        projectName: d.title || p.taskInfo.projectName,
        workLocation: d.location || p.taskInfo.workLocation,
      } }));
    } catch { /* best-effort */ }
  }

  const taskTypeOptions = Object.entries(t.taskTypes).map(([k, v]) => ({ value: k, label: v }));

  return (
    <div>
      {/* Sélecteur de modèle */}
      {!readOnly && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {language === 'fr' ? 'Modèle d\'AST' : 'JSA Model'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange(p => ({ ...p, model: 'simple' }))}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${model === 'simple' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-teal-300'}`}
            >
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {language === 'fr' ? 'Simple' : 'Simple'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'fr'
                  ? 'Sélection rapide des dangers et mesures — idéal pour tâches courantes'
                  : 'Quick hazard and control selection — ideal for routine tasks'}
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange(p => ({ ...p, model: 'complet' }))}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${model === 'complet' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-teal-300'}`}
            >
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {language === 'fr' ? 'Complet ✦' : 'Complete ✦'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'fr'
                  ? 'Mesures de contrôle pré-remplies par danger + onglet Énergie/LOTO — conformité maximale'
                  : 'Pre-filled control measures per hazard + Energy/LOTO tab — maximum compliance'}
              </div>
            </button>
          </div>
        </div>
      )}
      {readOnly && model === 'complet' && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          ✦ {language === 'fr' ? 'Modèle complet' : 'Complete model'}
        </div>
      )}

      <Card title={t.cardGeneral} icon={<ClipboardList className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t.projectNumber}>
            <EntitySearch value={ti.projectNumber} readOnly={readOnly} options={projects} onText={v => set('projectNumber', v)} onPick={pickProject} />
          </Field>
          <Field label={t.projectName}>
            <TextInput value={ti.projectName} onChange={v => set('projectName', v)} disabled={readOnly} />
          </Field>
          <Field label={t.workLocation}>
            <TextInput value={ti.workLocation} onChange={v => set('workLocation', v)} disabled={readOnly} />
          </Field>
          <Field label={t.department}>
            <TextInput value={ti.department} onChange={v => set('department', v)} disabled={readOnly} />
          </Field>
          <Field label={t.contractor}>
            <EntitySearch value={ti.contractor} readOnly={readOnly} options={suppliers} onText={v => set('contractor', v)} onPick={o => set('contractor', o.label)} />
          </Field>
          <Field label={t.supervisor}>
            <EntitySearch value={ti.supervisor} readOnly={readOnly} options={personnel} onText={v => set('supervisor', v)} onPick={o => set('supervisor', o.label)} />
          </Field>
          <Field label={t.supervisorCert}>
            <TextInput value={ti.supervisorCert} onChange={v => set('supervisorCert', v)} disabled={readOnly} />
          </Field>
          <Field label={t.taskDate}>
            <TextInput type="date" value={ti.taskDate} onChange={v => set('taskDate', v)} disabled={readOnly} />
          </Field>
          <Field label={t.estimatedDuration}>
            <TextInput value={ti.estimatedDuration} onChange={v => set('estimatedDuration', v)} placeholder={language === 'fr' ? 'Ex: 4 heures' : 'E.g.: 4 hours'} disabled={readOnly} />
          </Field>
          <Field label={t.workerCount}>
            <TextInput type="number" value={ti.workerCount} onChange={v => set('workerCount', v === '' ? 0 : (parseInt(v) || 0))} disabled={readOnly} selectOnFocus />
          </Field>
          <Field label={t.taskType}>
            <SelectInput value={ti.taskType} onChange={v => set('taskType', v)} options={taskTypeOptions} disabled={readOnly} />
          </Field>
        </div>
        <div className="mt-4">
          <Textarea label={t.equipmentInvolved} value={ti.equipmentInvolved} onChange={v => set('equipmentInvolved', v)} rows={2} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.cardDescription} icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <Textarea label={t.taskDescription} value={ti.taskDescription} onChange={v => set('taskDescription', v)} rows={4} disabled={readOnly} />
          <Textarea label={t.specialConditions} value={ti.specialConditions} onChange={v => set('specialConditions', v)} rows={2} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.cardRegulatory} icon={<AlertCircle className="w-5 h-5" />}>
        <div className="space-y-4">
          <Field label={t.regulatoryRef}>
            <TextInput value={ti.regulatoryRef} onChange={v => set('regulatoryRef', v)} placeholder={t.regulatoryRefPh} disabled={readOnly} />
          </Field>
          <div className="flex items-start gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg px-4 py-3 text-sm text-teal-800 dark:text-teal-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.provinceNote[ast.province] ?? t.provinceNote.QC}</span>
          </div>
        </div>
      </Card>

      <ClientDocsCard ast={ast} onChange={onChange} language={language} readOnly={readOnly} />
    </div>
  );
}

// ── Documents du client (AST / fiche LOTO) — photo ou fichier ──────────────
function ClientDocsCard({ ast, onChange, language, readOnly }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean;
}) {
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  const docs = ast.clientDocs ?? [];

  const add = async (category: ClientDoc['category'], files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: ClientDoc[] = [];
    for (const f of Array.from(files)) {
      try {
        const data = await readFileAsDataUrl(f);
        added.push({ id: generateId(), category, name: f.name, mime: f.type, data });
      } catch { /* fichier ignoré */ }
    }
    if (added.length) onChange(p => ({ ...p, clientDocs: [...(p.clientDocs ?? []), ...added] }));
  };
  const remove = (id: string) => onChange(p => ({ ...p, clientDocs: (p.clientDocs ?? []).filter(d => d.id !== id) }));

  const groups: { cat: ClientDoc['category']; label: string }[] = [
    { cat: 'ast', label: tr('AST du client', 'Client JSA') },
    { cat: 'loto', label: tr('Fiche LOTO du client', 'Client LOTO sheet') },
  ];

  const inputCls = 'hidden';
  const btnCls = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-colors';

  return (
    <Card title={tr('Documents du client', 'Client documents')} icon={<FileText className="w-5 h-5" />}>
      <div className="space-y-5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {tr("Joignez l'AST ou la fiche de verrouillage (LOTO) du client — par photo ou téléversement de document (image ou PDF).",
              'Attach the client JSA or lockout (LOTO) sheet — by photo or document upload (image or PDF).')}
        </p>

        {groups.map(g => {
          const items = docs.filter(d => d.category === g.cat);
          return (
            <div key={g.cat} className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {g.label}
              </div>
              <div className="p-3 space-y-2">
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {items.map(d => (
                      <div key={d.id} className="relative w-24">
                        <a href={d.data} target="_blank" rel="noreferrer" className="block">
                          {d.mime.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.data} alt={d.name} className="h-24 w-24 rounded-lg border border-slate-200 dark:border-slate-600 object-cover" />
                          ) : (
                            <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-1 text-center">
                              <FileText className="h-6 w-6 text-slate-400" />
                              <span className="line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">{d.name}</span>
                            </div>
                          )}
                        </a>
                        {!readOnly && (
                          <button type="button" onClick={() => remove(d.id)}
                            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!readOnly && (
                  <div className="flex flex-wrap gap-2">
                    <label className={btnCls}>
                      <Camera className="w-3.5 h-3.5" /> {tr('Prendre une photo', 'Take a photo')}
                      <input type="file" accept="image/*" capture="environment" className={inputCls}
                        onChange={e => { add(g.cat, e.target.files); e.currentTarget.value = ''; }} />
                    </label>
                    <label className={btnCls}>
                      <Plus className="w-3.5 h-3.5" /> {tr('Téléverser un document', 'Upload a document')}
                      <input type="file" accept="image/*,application/pdf" multiple className={inputCls}
                        onChange={e => { add(g.cat, e.target.files); e.currentTarget.value = ''; }} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Section: Steps ─────────────────────────────────────────────────────────
function StepsSection({ ast, onChange, language, readOnly, tenant }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean; tenant: string;
}) {
  const t = T[language].steps;
  const steps = ast.jobSteps;
  const model = ast.model ?? 'simple';

  const totalHazards = steps.reduce((acc, s) => acc + s.hazards.length, 0);
  const totalControls = steps.reduce((acc, s) => acc + s.controls.length, 0);

  // Moyens de contrôle "standard" du tenant (persistés dans tenant_ast_options).
  const [tenantControls, setTenantControls] = useState<TenantControl[]>([]);
  useEffect(() => {
    if (!tenant || !supabase) return;
    let cancelled = false;
    supabase.from('tenant_ast_options').select('id, label, hazard').eq('tenant_id', tenant).eq('category', 'control')
      .then(({ data }: { data: TenantControl[] | null }) => { if (!cancelled && data) setTenantControls(data); }, () => {});
    return () => { cancelled = true; };
  }, [tenant]);

  const tcApi: TenantControlsApi = {
    byHazard: (h) => tenantControls.filter(c => c.hazard === h),
    add: async (hazard, label) => {
      if (tenantControls.some(c => c.hazard === hazard && c.label === label)) return;
      const tempId = generateId();
      setTenantControls(prev => [...prev, { id: tempId, label, hazard }]);
      if (supabase && tenant) {
        try {
          const { data } = await supabase.from('tenant_ast_options')
            .insert({ tenant_id: tenant, category: 'control', label, hazard, permanent: true })
            .select('id').single();
          if (data?.id) setTenantControls(prev => prev.map(c => (c.id === tempId ? { ...c, id: data.id } : c)));
        } catch { /* conservé localement même si la persistance échoue */ }
      }
    },
    update: async (id, label) => {
      setTenantControls(prev => prev.map(c => (c.id === id ? { ...c, label } : c)));
      if (supabase) { try { await supabase.from('tenant_ast_options').update({ label }).eq('id', id); } catch { /* noop */ } }
    },
    remove: async (id) => {
      setTenantControls(prev => prev.filter(c => c.id !== id));
      if (supabase) { try { await supabase.from('tenant_ast_options').delete().eq('id', id); } catch { /* noop */ } }
    },
  };

  const addStep = () => {
    onChange(p => ({
      ...p,
      jobSteps: [...p.jobSteps, {
        id: generateId(),
        stepNumber: p.jobSteps.length + 1,
        description: '', hazards: [], hazardNotes: '',
        controls: [], controlNotes: '',
        riskBefore: 0, riskAfter: 0,
        riskBeforeProb: 1, riskBeforeSev: 1,
        riskAfterProb: 1, riskAfterSev: 1,
        responsible: '', verified: false,
      }],
    }));
  };

  const updateStep = (id: string, updater: (s: JobStep) => JobStep) => {
    onChange(p => ({
      ...p,
      jobSteps: p.jobSteps.map(s => s.id === id ? updater(s) : s),
    }));
  };

  const removeStep = (id: string) => {
    onChange(p => ({
      ...p,
      jobSteps: p.jobSteps.filter(s => s.id !== id).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    }));
  };

  const moveStep = (id: string, dir: 'up' | 'down') => {
    onChange(p => {
      const arr = [...p.jobSteps];
      const idx = arr.findIndex(s => s.id === id);
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return p;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...p, jobSteps: arr.map((s, i) => ({ ...s, stepNumber: i + 1 })) };
    });
  };

  const probOptions = t.probLabels.slice(1).map((l, i) => ({ value: String(i + 1), label: `${i + 1} — ${l}` }));
  const sevOptions = t.sevLabels.slice(1).map((l, i) => ({ value: String(i + 1), label: `${i + 1} — ${l}` }));

  return (
    <TenantControlsCtx.Provider value={tcApi}>
    <div>
      <Card
        title={t.cardTitle}
        icon={<List className="w-5 h-5" />}
        badge={
          steps.length > 0 ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.summary(steps.length, totalHazards, totalControls)}
            </span>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
            {t.instructions}
          </div>

          {steps.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400 dark:text-slate-500">
              {t.noSteps}
            </div>
          )}

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                idx={idx}
                total={steps.length}
                language={language}
                readOnly={readOnly}
                t={t}
                probOptions={probOptions}
                sevOptions={sevOptions}
                model={model}
                onUpdate={(updater) => updateStep(step.id, updater)}
                onRemove={() => removeStep(step.id)}
                onMoveUp={() => moveStep(step.id, 'up')}
                onMoveDown={() => moveStep(step.id, 'down')}
              />
            ))}
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addStep}
            </button>
          )}
        </div>
      </Card>
    </div>
    </TenantControlsCtx.Provider>
  );
}

// ── Individual step card ───────────────────────────────────────────────────
function StepCard({ step, idx, total, language, readOnly, t, probOptions, sevOptions, model, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  step: JobStep; idx: number; total: number; language: Language; readOnly: boolean;
  t: typeof T['fr']['steps'] | typeof T['en']['steps'];
  probOptions: { value: string; label: string }[];
  sevOptions: { value: string; label: string }[];
  model: ASTModel;
  onUpdate: (updater: (s: JobStep) => JobStep) => void;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const riskBefore = step.riskBeforeProb * step.riskBeforeSev;
  const riskAfter = step.riskAfterProb * step.riskAfterSev;

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold shrink-0">
          {step.stepNumber}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate min-w-0">
          {step.description || (language === 'fr' ? 'Nouvelle étape…' : 'New step…')}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {riskBefore > 0 && (
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(riskBefore)}`}>
              {riskBefore} → {riskAfter > 0 ? riskAfter : '?'}
            </span>
          )}
          {!readOnly && (
            <>
              <button type="button" onClick={onMoveUp} disabled={idx === 0}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors" title={language === 'fr' ? 'Monter' : 'Move up'}>
                <ChevronUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={onMoveDown} disabled={idx === total - 1}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors" title={language === 'fr' ? 'Descendre' : 'Move down'}>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={onRemove}
                className="p-1 text-red-400 hover:text-red-600 transition-colors" title={language === 'fr' ? 'Supprimer' : 'Remove'}>
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button type="button" onClick={() => setExpanded(v => !v)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <Textarea
            label={t.description}
            value={step.description}
            onChange={v => onUpdate(s => ({ ...s, description: v }))}
            placeholder={t.descriptionPh}
            rows={2}
            disabled={readOnly}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <HazardDropdown
                label={t.hazards}
                options={t.hazardOptions as unknown as string[]}
                groups={((t as typeof T['fr']['steps']).hazardGroups ?? (t as typeof T['en']['steps']).hazardGroups) as unknown as { label: string; options: string[] }[]}
                selected={step.hazards}
                onChange={v => onUpdate(s => ({ ...s, hazards: v }))}
                disabled={readOnly}
                language={language}
                customPlaceholder={language === 'fr' ? 'Danger personnalisé…' : 'Custom hazard…'}
              />
              <Textarea label={t.hazardNotes} value={step.hazardNotes} onChange={v => onUpdate(s => ({ ...s, hazardNotes: v }))} placeholder={t.hazardNotesPh} rows={2} disabled={readOnly} />
            </div>

            <div className="space-y-2">
              <ContextualControls
                hazards={step.hazards}
                controls={step.controls}
                onChange={v => onUpdate(s => ({ ...s, controls: v }))}
                disabled={readOnly}
                language={language}
              />
              <Textarea label={t.controlNotes} value={step.controlNotes} onChange={v => onUpdate(s => ({ ...s, controlNotes: v }))} placeholder={t.controlNotesPh} rows={2} disabled={readOnly} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t.riskBefore}</span>
                {riskBefore > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRiskColor(riskBefore)}`}>
                    {riskBefore} — {getRiskLabel(riskBefore, language)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label={t.probability}>
                  <SelectInput value={String(step.riskBeforeProb)} onChange={v => onUpdate(s => ({ ...s, riskBeforeProb: parseInt(v) || 1, riskBefore: (parseInt(v) || 1) * s.riskBeforeSev }))} options={probOptions} disabled={readOnly} />
                </Field>
                <Field label={t.severity}>
                  <SelectInput value={String(step.riskBeforeSev)} onChange={v => onUpdate(s => ({ ...s, riskBeforeSev: parseInt(v) || 1, riskBefore: s.riskBeforeProb * (parseInt(v) || 1) }))} options={sevOptions} disabled={readOnly} />
                </Field>
              </div>
              <RiskMatrix prob={step.riskBeforeProb} sev={step.riskBeforeSev} lang={language} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t.riskAfter}</span>
                {riskAfter > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRiskColor(riskAfter)}`}>
                    {riskAfter} — {getRiskLabel(riskAfter, language)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label={t.probability}>
                  <SelectInput value={String(step.riskAfterProb)} onChange={v => onUpdate(s => ({ ...s, riskAfterProb: parseInt(v) || 1, riskAfter: (parseInt(v) || 1) * s.riskAfterSev }))} options={probOptions} disabled={readOnly} />
                </Field>
                <Field label={t.severity}>
                  <SelectInput value={String(step.riskAfterSev)} onChange={v => onUpdate(s => ({ ...s, riskAfterSev: parseInt(v) || 1, riskAfter: s.riskAfterProb * (parseInt(v) || 1) }))} options={sevOptions} disabled={readOnly} />
                </Field>
              </div>
              <RiskMatrix prob={step.riskAfterProb} sev={step.riskAfterSev} lang={language} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.responsible}>
              <TextInput value={step.responsible} onChange={v => onUpdate(s => ({ ...s, responsible: v }))} placeholder={t.responsiblePh} disabled={readOnly} />
            </Field>
            <div className="pt-5">
              <Toggle
                label={t.verified}
                checked={step.verified}
                onChange={v => onUpdate(s => ({ ...s, verified: v }))}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section: PPE ───────────────────────────────────────────────────────────
function PPESection({ ast, onChange, language, readOnly, tenant }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean; tenant?: string;
}) {
  const t = T[language].ppe;
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;
  const items = ast.ppeRequirements;
  const requiredCount = items.filter(i => i.required).length;
  const categories = Array.from(new Set(items.map(i => i.category)));

  // Options EPI custom du tenant
  const [customInput, setCustomInput] = useState('');
  const [customPermanent, setCustomPermanent] = useState(true);
  const [savingCustom, setSavingCustom] = useState(false);

  const updateItem = (id: string, updater: (item: PPEItem) => PPEItem) => {
    onChange(p => ({
      ...p,
      ppeRequirements: p.ppeRequirements.map(i => i.id === id ? updater(i) : i),
    }));
  };

  const removeCustomItem = (id: string) =>
    onChange(p => ({ ...p, ppeRequirements: p.ppeRequirements.filter(i => i.id !== id) }));

  const addCustomPPE = async () => {
    const label = customInput.trim();
    if (!label) return;
    const newItem: PPEItem = { id: generateId(), category: tr('Personnalisé', 'Custom'), item: label, required: true, specification: '' };
    onChange(p => ({ ...p, ppeRequirements: [...p.ppeRequirements, newItem] }));
    // Sauvegarder en permanent si demandé
    if (customPermanent && supabase && tenant) {
      setSavingCustom(true);
      await supabase.from('tenant_ast_options').insert({ tenant_id: tenant, category: 'ppe', label, permanent: true });
      setSavingCustom(false);
    }
    setCustomInput('');
  };

  const customCategory = tr('Personnalisé', 'Custom');

  return (
    <div>
      <Card
        title={t.cardTitle}
        icon={<Shield className="w-5 h-5" />}
        badge={
          requiredCount > 0 ? (
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
              {t.requiredCount(requiredCount)}
            </span>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">{cat}</h4>
              <div className="space-y-2">
                {items.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.required ? 'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                    <div className="flex items-center pt-0.5">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={e => updateItem(item.id, i => ({ ...i, required: e.target.checked }))}
                        disabled={readOnly}
                        className="w-4 h-4 accent-teal-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${item.required ? 'text-teal-800 dark:text-teal-200' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.item}
                        </span>
                        {item.required && <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">{t.required}</span>}
                      </div>
                      {item.required && (
                        <input
                          type="text"
                          value={item.specification}
                          onChange={e => updateItem(item.id, i => ({ ...i, specification: e.target.value }))}
                          placeholder={t.specification}
                          disabled={readOnly}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50"
                        />
                      )}
                    </div>
                    {cat === customCategory && !readOnly && (
                      <button type="button" onClick={() => removeCustomItem(item.id)} className="p-1 text-red-400 hover:text-red-600 mt-0.5 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Ajout EPI custom */}
          {!readOnly && (
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tr('Ajouter un EPI personnalisé', 'Add custom PPE')}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomPPE(); } }}
                  placeholder={tr('Ex: Combinaison anti-arc, Bottes diélectriques…', 'E.g.: Arc-flash suit, Dielectric boots…')}
                  className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button type="button" onClick={addCustomPPE} disabled={!customInput.trim() || savingCustom}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={customPermanent} onChange={e => setCustomPermanent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-600" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {tr('Sauvegarder comme option permanente pour ce tenant', 'Save as permanent option for this tenant')}
                </span>
                <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </label>
            </div>
          )}
        </div>
      </Card>

      <Card title={t.cardNotes} icon={<FileText className="w-5 h-5" />}>
        <Textarea
          label={t.notesLabel}
          value={ast.ppeNotes}
          onChange={v => onChange(p => ({ ...p, ppeNotes: v }))}
          placeholder={t.notesPh}
          rows={3}
          disabled={readOnly}
        />
      </Card>
    </div>
  );
}

// ── Section: Equipment ─────────────────────────────────────────────────────
// Liste pré-remplie de véhicules / équipements industriels (suggestions non
// restrictives : saisie libre toujours possible). Alignée sur les types
// d'inspection d'équipement (aerial=nacelle, forklift, scaffold, ladder…).
const INDUSTRIAL_VEHICLES: Record<Language, string[]> = {
  fr: [
    'Nacelle élévatrice', 'Plateforme à ciseaux', 'Chariot élévateur', 'Chariot télescopique',
    'Camion-nacelle', 'Échafaudage roulant', 'Échelle', 'Grue mobile', 'Mini-excavatrice',
    'Rétrocaveuse', 'Chargeuse', 'Génératrice', 'Compresseur', 'Camion-flèche', 'Tracteur',
  ],
  en: [
    'Aerial lift', 'Scissor lift', 'Forklift', 'Telehandler', 'Bucket truck',
    'Rolling scaffold', 'Ladder', 'Mobile crane', 'Mini excavator', 'Backhoe',
    'Loader', 'Generator', 'Compressor', 'Boom truck', 'Tractor',
  ],
};

function EquipmentSection({ ast, onChange, language, readOnly }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean;
}) {
  const t = T[language].equipment;
  const eq = ast.equipment;

  const setEq = (updater: (e: ASTPermit['equipment']) => ASTPermit['equipment']) =>
    onChange(p => ({ ...p, equipment: updater(p.equipment) }));

  const conditionOptions = Object.entries(t.conditions).map(([k, v]) => ({ value: k, label: v }));

  const addTool = () => setEq(e => ({ ...e, tools: [...e.tools, { id: generateId(), name: '', condition: 'bon', inspectedBy: '', notes: '' }] }));
  const removeTool = (id: string) => setEq(e => ({ ...e, tools: e.tools.filter(tool => tool.id !== id) }));
  const updateTool = (id: string, key: string, val: string) => setEq(e => ({
    ...e, tools: e.tools.map(tool => tool.id === id ? { ...tool, [key]: val } : tool),
  }));

  const addVehicle = () => setEq(e => ({ ...e, vehicles: [...e.vehicles, { id: generateId(), type: '', license: '', inspected: false }] }));
  const removeVehicle = (id: string) => setEq(e => ({ ...e, vehicles: e.vehicles.filter(v => v.id !== id) }));
  const updateVehicle = (id: string, key: string, val: string | boolean) => setEq(e => ({
    ...e, vehicles: e.vehicles.map(v => v.id === id ? { ...v, [key]: val } : v),
  }));

  const toggleEnergy = (source: string) => setEq(e => ({
    ...e, energySources: e.energySources.includes(source) ? e.energySources.filter(x => x !== source) : [...e.energySources, source],
  }));

  return (
    <div>
      <Card title={t.cardTools} icon={<Wrench className="w-5 h-5" />}>
        <div className="space-y-4">
          {eq.tools.length > 0 && (
            <div className="space-y-3">
              {eq.tools.map(tool => (
                <div key={tool.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.toolName}>
                      <input type="text" value={tool.name} onChange={e => updateTool(tool.id, 'name', e.target.value)} disabled={readOnly}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                    </Field>
                    <Field label={t.toolCondition}>
                      <select value={tool.condition} onChange={e => updateTool(tool.id, 'condition', e.target.value)} disabled={readOnly}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50">
                        {conditionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                    <Field label={t.toolInspectedBy}>
                      <input type="text" value={tool.inspectedBy} onChange={e => updateTool(tool.id, 'inspectedBy', e.target.value)} disabled={readOnly}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                    </Field>
                    <Field label={t.toolNotes}>
                      <input type="text" value={tool.notes} onChange={e => updateTool(tool.id, 'notes', e.target.value)} disabled={readOnly}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                    </Field>
                  </div>
                  {!readOnly && (
                    <div className="flex justify-end border-t border-slate-100 dark:border-slate-700 pt-3">
                      <button type="button" onClick={() => removeTool(tool.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!readOnly && (
            <button type="button" onClick={addTool}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> {t.addTool}
            </button>
          )}
          <Textarea label={t.specialEquipment} value={eq.specialEquipment} onChange={v => setEq(e => ({ ...e, specialEquipment: v }))} placeholder={t.specialEquipmentPh} rows={2} disabled={readOnly} />
        </div>
      </Card>

      <Card title={t.cardVehicles} icon={<Wrench className="w-5 h-5" />}>
        <div className="space-y-4">
          <datalist id="ast-industrial-vehicles">
            {INDUSTRIAL_VEHICLES[language].map(v => <option key={v} value={v} />)}
          </datalist>
          {eq.vehicles.length > 0 && (
            <div className="space-y-3">
              {eq.vehicles.map(v => (
                <div key={v.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.vehicleType}>
                      <input type="text" list="ast-industrial-vehicles" value={v.type} onChange={e => updateVehicle(v.id, 'type', e.target.value)} disabled={readOnly}
                        placeholder={language === 'fr' ? 'ex. Nacelle élévatrice' : 'e.g. Aerial lift'}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                    </Field>
                    <Field label={t.vehicleLicense}>
                      <input type="text" value={v.license} onChange={e => updateVehicle(v.id, 'license', e.target.value)} disabled={readOnly}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                    </Field>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <input type="checkbox" checked={v.inspected} onChange={e => updateVehicle(v.id, 'inspected', e.target.checked)} disabled={readOnly}
                        className="w-4 h-4 accent-teal-600" />
                      {t.vehicleInspected}
                    </label>
                    {!readOnly && (
                      <button type="button" onClick={() => removeVehicle(v.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!readOnly && (
            <button type="button" onClick={addVehicle}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> {t.addVehicle}
            </button>
          )}
        </div>
      </Card>

      <Card title={t.cardEnergy} icon={<AlertTriangle className="w-5 h-5" />} accent="text-amber-500">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t.energySources}</label>
            <div className="flex flex-wrap gap-2">
              {t.energyOptions.map(src => (
                <button
                  key={src}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleEnergy(src)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    eq.energySources.includes(src)
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-orange-400'
                  } disabled:opacity-50 disabled:cursor-default`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <Toggle
            label={t.lotoRequired}
            checked={eq.lotoRequired}
            onChange={v => setEq(ex => ({ ...ex, lotoRequired: v }))}
            disabled={readOnly}
          />

          {eq.lotoRequired && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t.lotoWarning}</span>
              </div>
              <Field label={t.lotoRef}>
                <TextInput value={eq.lotoRef} onChange={v => setEq(ex => ({ ...ex, lotoRef: v }))} placeholder={t.lotoRefPh} disabled={readOnly} />
              </Field>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Employé admin (source: onglet "Employés" de app/[tenant]/admin) ─────────
interface AdminEmployee { id: string; name: string | null; email: string; role?: string }

// Combobox nom de participant : recherche intelligente parmi les employés du
// tenant, avec saisie manuelle libre si aucun employé ne correspond.
function EmployeeNameInput({ value, employees, onChange, onSelectEmployee, disabled, language, className }: {
  value: string; employees: AdminEmployee[]; onChange: (name: string) => void;
  onSelectEmployee?: (e: AdminEmployee) => void;
  disabled?: boolean; language: Language; className: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    const base = q
      ? employees.filter(e => (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q))
      : employees;
    return base.slice(0, 50);
  }, [value, employees]);

  // Position en `fixed` calculée depuis l'input : la liste échappe ainsi au
  // conteneur `overflow` du tableau (qui la masquait auparavant).
  const updateRect = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updateRect();
    const onScroll = () => updateRect();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [open]);

  useEffect(() => {
    const h = (ev: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(ev.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); updateRect(); }}
          disabled={disabled}
          placeholder={tr('Rechercher un employé ou saisir…', 'Search an employee or type…')}
          className={`${className} pl-7`}
        />
      </div>
      {open && !disabled && matches.length > 0 && rect && (
        <ul
          style={{ position: 'fixed', top: rect.top, left: rect.left, width: rect.width, zIndex: 60 }}
          className="max-h-56 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl"
        >
          {matches.map(e => (
            <li key={e.id}>
              <button
                type="button"
                onMouseDown={ev => ev.preventDefault()}
                onClick={() => { onChange(e.name || e.email); onSelectEmployee?.(e); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-900/30"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-600 text-[10px] font-bold text-white shrink-0">
                  {((e.name || e.email || '?')[0] || '?').toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{e.name || e.email}</span>
                  {e.name && <span className="block truncate text-xs text-slate-400">{e.email}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Section: Participants ──────────────────────────────────────────────────
function ParticipantsSection({ ast, onChange, language, readOnly, tenant }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean; tenant: string;
}) {
  const t = T[language].participants;
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  const participants = ast.participants;
  const acknowledgedCount = participants.filter(p => p.acknowledged).length;
  // Cartes dépliées pour modification (un participant finalisé se replie sur son nom).
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const setEditing = (id: string, on: boolean) => setEditingIds(prev => {
    const next = new Set(prev);
    if (on) next.add(id); else next.delete(id);
    return next;
  });
  const [supEditing, setSupEditing] = useState(false);

  // Employés du tenant (rafraîchis à chaque ouverture de la section : tout
  // employé créé dans l'admin devient immédiatement recherchable).
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  useEffect(() => {
    if (!tenant) return;
    let cancelled = false;
    fetch(`/api/admin/users?tenant=${encodeURIComponent(tenant)}`)
      .then(r => (r.ok ? r.json() : { users: [] }))
      .then(d => { if (!cancelled) setEmployees((d.users || []).filter((u: AdminEmployee & { is_active?: boolean }) => u.is_active !== false)); })
      .catch(() => { /* recherche désactivée si l'API échoue — saisie manuelle reste possible */ });
    return () => { cancelled = true; };
  }, [tenant]);

  // Nom d'entreprise du tenant : pré-remplit le champ "Entreprise" des participants.
  const [tenantName, setTenantName] = useState('');
  useEffect(() => {
    if (!tenant || !supabase) return;
    let cancelled = false;
    supabase.from('tenants').select('companyName, name').eq('id', tenant).maybeSingle()
      .then(({ data }: { data: { companyName?: string; name?: string } | null }) => { if (!cancelled && data) setTenantName(data.companyName || data.name || ''); }, () => {});
    return () => { cancelled = true; };
  }, [tenant]);
  const defaultCompany = tenantName || tenant;

  const roleOptions = Object.entries(t.roles).map(([k, v]) => ({ value: k, label: v }));

  const addParticipant = () => onChange(p => ({
    ...p,
    participants: [...p.participants, { id: generateId(), name: '', role: 'travailleur', company: '', acknowledged: false, acknowledgedAt: '' }],
  }));

  const removeParticipant = (id: string) => onChange(p => ({
    ...p, participants: p.participants.filter(x => x.id !== id),
  }));

  const updateParticipant = (id: string, updater: (x: Participant) => Participant) => onChange(p => ({
    ...p, participants: p.participants.map(x => x.id === id ? updater(x) : x),
  }));

  const toggleAcknowledged = (id: string, val: boolean) => updateParticipant(id, x => ({
    ...x, acknowledged: val, acknowledgedAt: val ? new Date().toISOString() : '',
  }));

  return (
    <div>
      <Card
        title={t.cardPersonnel}
        icon={<Users className="w-5 h-5" />}
        badge={
          participants.length > 0 ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.totalCount(participants.length, acknowledgedCount)}
            </span>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg px-4 py-3">
            <p className="text-sm text-teal-800 dark:text-teal-300 italic">{t.ackStatement}</p>
          </div>

          {participants.length > 0 && (
            <div className="space-y-3">
              {participants.map(par => {
                const roleLabel = (t.roles as Record<string, string>)[par.role] || par.role;
                const collapsed = par.acknowledged && !editingIds.has(par.id);
                const canFinalize = par.name.trim().length > 0;

                // Vue repliee : prise de connaissance finalisee -> on ne voit que le nom.
                if (collapsed) {
                  return (
                    <div key={par.id} className="flex items-center justify-between gap-3 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{par.name || tr('(sans nom)', '(no name)')}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {roleLabel}
                            {par.acknowledgedAt ? ` · ${new Date(par.acknowledgedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}` : ''}
                          </div>
                        </div>
                      </div>
                      {!readOnly && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => setEditing(par.id, true)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            {tr('Modifier', 'Edit')}
                          </button>
                          <button type="button" onClick={() => removeParticipant(par.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Vue depliee : meme presentation en cartes que l'approbation superviseur.
                return (
                  <div key={par.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t.name}>
                        <EmployeeNameInput
                          value={par.name}
                          employees={employees}
                          disabled={readOnly}
                          language={language}
                          onChange={name => updateParticipant(par.id, x => ({ ...x, name }))}
                          onSelectEmployee={() => updateParticipant(par.id, x => ({ ...x, company: defaultCompany }))}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50"
                        />
                      </Field>
                      <Field label={t.role}>
                        <select value={par.role} onChange={e => updateParticipant(par.id, x => ({ ...x, role: e.target.value }))} disabled={readOnly}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50">
                          {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </Field>
                      <Field label={t.company}>
                        <TextInput value={par.company} onChange={v => updateParticipant(par.id, x => ({ ...x, company: v }))} disabled={readOnly} />
                      </Field>
                    </div>
                    {!readOnly && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <button
                          type="button"
                          disabled={!canFinalize}
                          title={!canFinalize ? tr('Saisissez le nom pour finaliser', 'Enter the name to finalize') : ''}
                          onClick={() => { toggleAcknowledged(par.id, true); setEditing(par.id, false); }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {tr('Finaliser la prise de connaissance', 'Finalize acknowledgement')}
                        </button>
                        <button type="button" onClick={() => removeParticipant(par.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!readOnly && (
            <button type="button" onClick={addParticipant}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> {t.addParticipant}
            </button>
          )}
        </div>
      </Card>

      {(() => {
        const status = ast.supervisorSigStatus || '';
        const STATUS: Record<string, { label: string; dot: string; box: string; text: string }> = {
          approved:   { label: tr('Approuvé — conforme', 'Approved — compliant'),        dot: 'bg-green-500',  box: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-300' },
          corrective: { label: tr('Correctif requis (audit)', 'Corrective required (audit)'), dot: 'bg-orange-500', box: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' },
          nonconform: { label: tr('Non-conformité', 'Non-compliance'),                   dot: 'bg-red-500',    box: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',           text: 'text-red-700 dark:text-red-300' },
        };
        const cur = STATUS[status];
        const collapsed = !!status && ast.supervisorSigName.trim().length > 0 && !supEditing;
        const setStatus = (s: '' | 'approved' | 'corrective' | 'nonconform') => onChange(p => ({
          ...p, supervisorSigStatus: s, supervisorSigDate: s && !p.supervisorSigDate ? new Date().toISOString().slice(0, 16) : p.supervisorSigDate,
          // Non-conformité : pré-remplit un texte explicatif de BASE à compléter (gain de temps + cadre).
          supervisorSigNotes: ((s === 'corrective' || s === 'nonconform') && !p.supervisorSigNotes.trim())
            ? tr('Zone de travail mal nettoyée — préciser la non-conformité observée et le correctif requis…', 'Work area poorly cleaned — describe the observed non-compliance and required corrective action…')
            : p.supervisorSigNotes,
        }));

        // Vue repliee (mobile-friendly) : on ne voit que le nom + la pastille de verdict.
        if (collapsed && cur) {
          return (
            <Card title={t.cardSupervisor} icon={<CheckCircle className="w-5 h-5" />}>
              <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${cur.box}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${cur.dot}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{ast.supervisorSigName}</div>
                    <div className={`text-xs font-medium truncate ${cur.text}`}>{cur.label}</div>
                  </div>
                </div>
                {!readOnly && (
                  <button type="button" onClick={() => setSupEditing(true)}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    {tr('Modifier', 'Edit')}
                  </button>
                )}
              </div>
            </Card>
          );
        }

        // Vue depliee : memes champs + 3 boutons de verdict (vert / orange / rouge).
        return (
          <Card title={t.cardSupervisor} icon={<CheckCircle className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.supervisorName}>
                  <EmployeeNameInput value={ast.supervisorSigName} employees={employees} disabled={readOnly} language={language}
                    onChange={name => onChange(p => ({ ...p, supervisorSigName: name }))}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-slate-50" />
                </Field>
                <Field label={t.supervisorCert}>
                  <TextInput value={ast.supervisorSigCert} onChange={v => onChange(p => ({ ...p, supervisorSigCert: v }))} disabled={readOnly} />
                </Field>
                <Field label={t.supervisorDate}>
                  <TextInput type="datetime-local" value={ast.supervisorSigDate} onChange={v => onChange(p => ({ ...p, supervisorSigDate: v }))} disabled={readOnly} />
                </Field>
                <div className="sm:col-span-2">
                  <Textarea label={t.supervisorNotes} value={ast.supervisorSigNotes} onChange={v => onChange(p => ({ ...p, supervisorSigNotes: v }))} rows={2} disabled={readOnly} />
                </div>
              </div>
              {!readOnly && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{tr('Verdict du superviseur', 'Supervisor verdict')}</div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ['approved',   tr('Approuver', 'Approve'),        'bg-green-600 hover:bg-green-700',   'border-green-300 text-green-700 dark:text-green-300'],
                      ['corrective', tr('Correctif', 'Corrective'),     'bg-orange-500 hover:bg-orange-600', 'border-orange-300 text-orange-700 dark:text-orange-300'],
                      ['nonconform', tr('Non-conformité', 'Non-compliant'), 'bg-red-600 hover:bg-red-700',  'border-red-300 text-red-700 dark:text-red-300'],
                    ] as [string, string, string, string][]).map(([key, label, onCls, offCls]) => {
                      const active = status === key;
                      return (
                        <button key={key} type="button"
                          disabled={ast.supervisorSigName.trim().length === 0}
                          title={ast.supervisorSigName.trim().length === 0 ? tr('Saisissez le nom du superviseur', 'Enter the supervisor name') : ''}
                          onClick={() => { setStatus(key as any); setSupEditing(false); }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? `${onCls} text-white` : `bg-white dark:bg-slate-800 border ${offCls} hover:bg-slate-50 dark:hover:bg-slate-700`}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${key === 'approved' ? 'bg-green-500' : key === 'corrective' ? 'bg-orange-500' : 'bg-red-500'} ${active ? 'ring-2 ring-white/70' : ''}`} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {/* RÈGLE : non-conformité/correctif -> explication (notes ci-dessus) + pièce justificative OBLIGATOIRES */}
                  {(status === 'corrective' || status === 'nonconform') && (
                    <div className="mt-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                      <div className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">{tr('Non-conformité — OBLIGATOIRE : explication (notes ci-dessus) + pièce justificative (photo/document).', 'Non-compliance — REQUIRED: explanation (notes above) + supporting file (photo/document).')}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(ast.supervisorSigAttachments || []).map((a, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800">
                            {a.type?.startsWith('image/') ? <img src={a.url} alt={a.name} className="h-8 w-8 rounded object-cover" /> : <span>📄</span>}
                            <span className="max-w-[8rem] truncate">{a.name}</span>
                            <button type="button" onClick={() => onChange(p => ({ ...p, supervisorSigAttachments: (p.supervisorSigAttachments || []).filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-red-500">✕</button>
                          </span>
                        ))}
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:bg-slate-800 dark:text-red-300">
                          📎 {tr('Ajouter photo/document', 'Add photo/document')}
                          <input type="file" accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 4_000_000) { alert(tr('Fichier trop volumineux (max 4 Mo).', 'File too large (max 4MB).')); return; } const rd = new FileReader(); rd.onload = () => onChange(p => ({ ...p, supervisorSigAttachments: [...(p.supervisorSigAttachments || []), { name: f.name, type: f.type, url: String(rd.result || '') }] })); rd.readAsDataURL(f); (e.currentTarget as HTMLInputElement).value = ''; }} />
                        </label>
                      </div>
                      {(!ast.supervisorSigNotes.trim() || !(ast.supervisorSigAttachments || []).length) && (
                        <div className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">⚠ {tr('Ajoutez une explication ET au moins une pièce (photo/document) avant de finaliser.', 'Add an explanation AND at least one file before finalizing.')}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })()}
    </div>
  );
}

// ── Génération PDF de l'AST (document professionnel, champs remplis seulement) ─
// Rend une fiche AST sur le document courant (en haut de la page courante).
async function renderAstSection(
  doc: { [k: string]: any }, autoTable: (doc: any, opts: any) => void,
  ast: ASTPermit, language: Language, logoDataUrl?: string | null, tenant?: string,
) {
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  // Couleur d'accent depuis Admin › Modèles PDF (module 'ast') — unifie les couleurs comme DGA. Repli
  // sobre (encre foncée / gris) si non personnalisé. Best-effort.
  let adminAccent: [number, number, number] | null = null;
  if (tenant) {
    try {
      const { getPdfStyles, resolveKnobs, hexToRgb, DEFAULT_ACCENT } = await import('@/lib/pdfStyle');
      const k = resolveKnobs(await getPdfStyles(tenant), 'ast');
      if (k.accent && k.accent.toLowerCase() !== DEFAULT_ACCENT.toLowerCase()) adminAccent = hexToRgb(k.accent);
    } catch { /* défaut sobre */ }
  }
  const NAVY: [number, number, number] = adminAccent || [17, 24, 39]; // titres/en-tête (accent admin sinon encre)
  // Séparateurs de table TOUJOURS gris clair (sobriété DGA) ; l'accent ne teinte que titres + filet d'en-tête.
  const RULE: [number, number, number] = [214, 217, 222];
  const HEAD_BG: [number, number, number] = [243, 244, 246];
  const INK: [number, number, number] = [31, 41, 55];
  const BODY: [number, number, number] = [55, 65, 81];
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const HEADER_H = 30;

  // Précharge le logo (dimensions connues) pour pouvoir le dessiner dans l'en-tête
  // répété (didDrawPage est synchrone).
  let logo: { dataUrl: string; fmt: string; w: number; h: number } | null = null;
  if (logoDataUrl) {
    try {
      const fmt = logoDataUrl.includes('image/jpeg') || logoDataUrl.includes('image/jpg') ? 'JPEG'
        : logoDataUrl.includes('image/webp') ? 'WEBP' : 'PNG';
      const im = new Image();
      im.src = logoDataUrl;
      await new Promise<void>(res => { im.onload = () => res(); im.onerror = () => res(); });
      const h = 13;
      const w = im.naturalWidth && im.naturalHeight ? Math.min((im.naturalWidth / im.naturalHeight) * h, 42) : 24;
      logo = { dataUrl: logoDataUrl, fmt, w, h };
    } catch { /* logo optionnel */ }
  }

  // En-tête répété sur CHAQUE page : logo + titre + numéro + filet navy.
  const drawHeader = () => {
    if (logo) { try { doc.addImage(logo.dataUrl, logo.fmt, margin, 6, logo.w, logo.h); } catch { /* noop */ } }
    const tx = logo ? margin + logo.w + 6 : margin;
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(tr('Analyse Sécurité au Travail', 'Job Safety Analysis'), tx, 12);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(ast.permit_number, tx, 18);
    // Métadonnées à DROITE (façon DGA) : date de génération + statut.
    doc.setFontSize(8); doc.setTextColor(110); doc.setFont('helvetica', 'normal');
    doc.text(`${tr('Généré le', 'Generated')} ${new Date().toISOString().slice(0, 10)}`, pageW - margin, 12, { align: 'right' });
    const hr = adminAccent || RULE; doc.setDrawColor(hr[0], hr[1], hr[2]); doc.setLineWidth(adminAccent ? 0.6 : 0.4);
    doc.line(margin, HEADER_H - 4, pageW - margin, HEADER_H - 4);
    doc.setTextColor(0, 0, 0);
  };

  const tableMargin = { top: HEADER_H, left: margin, right: margin };
  let y = HEADER_H;
  // Wrapper de table aux défauts DGA : en-tête clair (texte foncé gras), filet gris fin, lignes alternées
  // discrètes. Remplace les bandeaux navy pleins de l'ancienne version.
  const AT = (opts: any) => autoTable(doc, {
    ...opts,
    theme: 'grid',
    headStyles: { fillColor: HEAD_BG, textColor: INK, fontStyle: 'bold', lineColor: RULE, lineWidth: 0.3, ...(opts.headStyles || {}) },
    bodyStyles: { textColor: BODY, ...(opts.bodyStyles || {}) },
    styles: { lineColor: RULE, lineWidth: 0.3, ...(opts.styles || {}) },
    alternateRowStyles: { fillColor: [249, 250, 251], ...(opts.alternateRowStyles || {}) },
  });

  const ti = ast.taskInfo;
  const infoRows = ([
    [tr('Province', 'Province'), ast.province],
    [tr('N° de projet', 'Project No.'), ti.projectNumber],
    [tr('Nom du projet', 'Project name'), ti.projectName],
    [tr('Lieu des travaux', 'Work location'), ti.workLocation],
    [tr('Département', 'Department'), ti.department],
    [tr('Entrepreneur', 'Contractor'), ti.contractor],
    [tr('Superviseur', 'Supervisor'), ti.supervisor],
    [tr('Certification superviseur', 'Supervisor certification'), ti.supervisorCert],
    [tr('Date', 'Date'), ti.taskDate],
    [tr('Durée estimée', 'Estimated duration'), ti.estimatedDuration],
    [tr('Nombre de travailleurs', 'Worker count'), ti.workerCount ? String(ti.workerCount) : ''],
    [tr('Type de tâche', 'Task type'), ti.taskType],
    [tr('Équipements impliqués', 'Equipment involved'), ti.equipmentInvolved],
    [tr('Description de la tâche', 'Task description'), ti.taskDescription],
    [tr('Conditions spéciales', 'Special conditions'), ti.specialConditions],
    [tr('Référence réglementaire', 'Regulatory reference'), ti.regulatoryRef],
  ] as [string, string | undefined][]).filter(([, v]) => v && String(v).trim());

  AT({
    startY: HEADER_H,
    head: [[tr('Informations générales', 'General information'), '']],
    body: infoRows.map(([k, v]) => [k, String(v)]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
    margin: tableMargin,
    didDrawPage: drawHeader,
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Énergie & cadenassage (LOTO) — TOUT ce qui est saisi ────────────────────
  const loto: any = ast.loto || {};
  const eq: any = ast.equipment || {};
  const energy: any[] = Array.isArray(loto.energySources) ? loto.energySources : [];
  const locks: any[] = Array.isArray(loto.locks) ? loto.locks : [];
  const eqEnergyStr: string[] = Array.isArray(eq.energySources) ? eq.energySources.filter(Boolean) : [];
  const lotoMeta = ([
    [tr('Cadenassage requis', 'Lockout required'), (loto.required || eq.lotoRequired) ? tr('Oui', 'Yes') : (loto.required === false ? tr('Non', 'No') : '')],
    [tr('Référence procédure LOTO', 'LOTO procedure reference'), loto.ref || eq.lotoRef],
    [tr('Gabarit LOTO', 'LOTO template'), loto.templateName],
    [tr('Sources d’énergie (liste)', 'Energy sources (list)'), eqEnergyStr.join(', ')],
    [tr('Vérification d’absence d’énergie', 'Zero-energy verification'), loto.verificationDone ? tr('Effectuée', 'Done') : ''],
    [tr('Vérifiée par', 'Verified by'), loto.verificationBy],
    [tr('Date de vérification', 'Verification date'), loto.verificationDate],
    [tr('Réénergisation autorisée par', 'Re-energization authorized by'), loto.reenergizationAuthBy],
    [tr('Date de réénergisation', 'Re-energization date'), loto.reenergizationAuthDate],
    [tr('Notes LOTO', 'LOTO notes'), loto.notes],
  ] as [string, string | undefined][]).filter(([, v]) => v && String(v).trim());
  if (lotoMeta.length || energy.length || locks.length) {
    if (y > pageH - 40) { doc.addPage(); drawHeader(); y = HEADER_H + 4; }
    if (lotoMeta.length) {
      AT({
        startY: y,
        head: [[tr('Sources d’énergie et cadenassage (LOTO)', 'Energy sources and lockout (LOTO)'), '']],
        body: lotoMeta.map(([k, v]) => [k, String(v)]),
        theme: 'striped', styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }, margin: tableMargin, didDrawPage: drawHeader,
      });
      y = doc.lastAutoTable.finalY + 4;
    }
    if (energy.length) {
      AT({
        startY: y,
        head: [[tr('Type', 'Type'), tr('Description', 'Description'), tr('Ampleur', 'Magnitude'), tr('Emplacement', 'Location'), tr('Méthode d’isolement', 'Isolation method'), tr('Vérifié par', 'Verified by'), '✓']],
        body: energy.map(s => [s.type || '—', s.description || '—', s.magnitude || '—', s.location || '—', s.isolationMethod || '—', s.verifiedBy || '—', s.verified ? '✓' : '—']),
        theme: 'grid', styles: { fontSize: 7.5, cellPadding: 1.5, valign: 'top' },
        columnStyles: { 6: { halign: 'center', cellWidth: 8 } }, margin: tableMargin, didDrawPage: drawHeader,
      });
      y = doc.lastAutoTable.finalY + 4;
    }
    if (locks.length) {
      AT({
        startY: y,
        head: [[tr('Cadenas (ID)', 'Lock (ID)'), tr('Propriétaire', 'Owner'), tr('Posé le', 'Placed'), tr('Retiré le', 'Removed')]],
        body: locks.map(l => [l.lockId || '—', l.owner || '—', l.placedAt || '—', l.removedAt || '—']),
        theme: 'striped', styles: { fontSize: 8, cellPadding: 1.5 }, margin: tableMargin, didDrawPage: drawHeader,
      });
      y = doc.lastAutoTable.finalY + 6;
    }
  }

  // Étapes : chaque danger sur sa ligne avec ses moyens de contrôle (puces).
  if (ast.jobSteps.length > 0) {
    const body: any[] = [];
    ast.jobSteps.forEach((s, idx) => {
      const used = new Set<string>();
      const rows: { hazard: string; controls: string }[] = [];
      (s.hazards || []).forEach(h => {
        const known = HAZARD_CONTROLS[h] || [];
        const ctrls = (s.controls || []).filter(c => known.includes(c));
        ctrls.forEach(c => used.add(c));
        rows.push({ hazard: h, controls: ctrls.length ? ctrls.map(c => `• ${c}`).join('\n') : '—' });
      });
      const others = (s.controls || []).filter(c => !used.has(c));
      if (others.length) rows.push({ hazard: tr('Autres mesures', 'Other measures'), controls: others.map(c => `• ${c}`).join('\n') });
      if (rows.length === 0) rows.push({ hazard: '—', controls: '—' });
      const risk = `${s.riskBeforeProb * s.riskBeforeSev} → ${s.riskAfterProb * s.riskAfterSev}`;
      rows.forEach((r, ri) => {
        const row: any[] = [];
        if (ri === 0) row.push({ content: `${idx + 1}. ${s.description || '—'}`, rowSpan: rows.length, styles: { fontStyle: 'bold', valign: 'top' } });
        row.push(r.hazard, r.controls);
        if (ri === 0) row.push({ content: risk, rowSpan: rows.length, styles: { halign: 'center', valign: 'middle' } });
        body.push(row);
      });
    });
    AT({
      startY: y,
      head: [[tr('Étape', 'Step'), tr('Danger', 'Hazard'), tr('Moyens de contrôle', 'Control measures'), tr('Risque', 'Risk')]],
      body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 38 }, 3: { cellWidth: 18, halign: 'center' } },
      margin: tableMargin,
      didDrawPage: drawHeader,
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // EPI requis
  const ppe = ast.ppeRequirements.filter(p => p.required);
  if (ppe.length > 0) {
    AT({
      startY: y,
      head: [[tr('EPI requis', 'Required PPE'), tr('Spécification', 'Specification')]],
      body: ppe.map(p => [p.item, p.specification || '—']),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2 },
      margin: tableMargin,
      didDrawPage: drawHeader,
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // Notes EPI / travailleurs (texte libre saisi).
  const noteBlock = (label: string, val?: string) => {
    if (!val || !String(val).trim()) return;
    if (y > pageH - 24) { doc.addPage(); drawHeader(); y = HEADER_H + 4; }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(label, margin, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.splitTextToSize(String(val), pageW - 2 * margin).forEach((ln: string) => { if (y > pageH - 16) { doc.addPage(); drawHeader(); y = HEADER_H + 4; } doc.text(ln, margin, y); y += 5; });
    y += 3;
  };
  noteBlock(tr('Notes EPI :', 'PPE notes:'), ast.ppeNotes);

  // Outils & équipements
  const tools: any[] = Array.isArray(eq.tools) ? eq.tools.filter((t: any) => t.name || t.inspectedBy || t.notes) : [];
  const vehicles: any[] = Array.isArray(eq.vehicles) ? eq.vehicles.filter((v: any) => v.type || v.license) : [];
  if (tools.length || vehicles.length || (eq.specialEquipment && String(eq.specialEquipment).trim())) {
    if (y > pageH - 40) { doc.addPage(); drawHeader(); y = HEADER_H + 4; }
    if (tools.length) {
      AT({
        startY: y,
        head: [[tr('Outil / équipement', 'Tool / equipment'), tr('État', 'Condition'), tr('Inspecté par', 'Inspected by'), tr('Notes', 'Notes')]],
        body: tools.map(t => [t.name || '—', t.condition || '—', t.inspectedBy || '—', t.notes || '—']),
        theme: 'striped', styles: { fontSize: 8, cellPadding: 1.5 }, margin: tableMargin, didDrawPage: drawHeader,
      });
      y = doc.lastAutoTable.finalY + 4;
    }
    if (vehicles.length) {
      AT({
        startY: y,
        head: [[tr('Véhicule / engin', 'Vehicle / machine'), tr('Plaque / n°', 'Plate / no.'), tr('Inspecté', 'Inspected')]],
        body: vehicles.map(v => [v.type || '—', v.license || '—', v.inspected ? tr('Oui', 'Yes') : tr('Non', 'No')]),
        theme: 'striped', styles: { fontSize: 8, cellPadding: 1.5 }, margin: tableMargin, didDrawPage: drawHeader,
      });
      y = doc.lastAutoTable.finalY + 4;
    }
    if (eq.specialEquipment && String(eq.specialEquipment).trim()) {
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(tr('Équipement spécial :', 'Special equipment:'), margin, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.splitTextToSize(String(eq.specialEquipment), pageW - 2 * margin).forEach((ln: string) => { if (y > pageH - 16) { doc.addPage(); drawHeader(); y = HEADER_H + 4; } doc.text(ln, margin, y); y += 5; });
    }
    y += 4;
  }

  // Travailleurs présents
  const workers: any[] = Array.isArray(ast.workers) ? ast.workers.filter((w: any) => w.name) : [];
  if (workers.length) {
    if (y > pageH - 40) { doc.addPage(); drawHeader(); y = HEADER_H + 4; }
    AT({
      startY: y,
      head: [[tr('Travailleur', 'Worker'), tr('Rôle', 'Role'), tr('Entreprise', 'Company'), tr('Badge', 'Badge'), tr('Contact urgence', 'Emergency contact'), tr('Présent', 'Present')]],
      body: workers.map(w => [w.name || '—', w.role || '—', w.company || '—', w.badgeNumber || '—', [w.emergencyContact, w.emergencyPhone].filter(Boolean).join(' · ') || '—', w.present ? tr('Oui', 'Yes') : tr('Non', 'No')]),
      theme: 'striped', styles: { fontSize: 7.5, cellPadding: 1.5 }, margin: tableMargin, didDrawPage: drawHeader,
    });
    y = doc.lastAutoTable.finalY + 4;
  }
  noteBlock(tr('Notes travailleurs :', 'Worker notes:'), ast.workerNotes);

  // Participants
  if (ast.participants.length > 0) {
    AT({
      startY: y,
      head: [[tr('Participant', 'Participant'), tr('Rôle', 'Role'), tr('Entreprise', 'Company'), tr('Prise de connaissance', 'Acknowledged')]],
      body: ast.participants.map(p => [
        p.name || '—',
        p.role || '—',
        p.company || '—',
        p.acknowledged ? (p.acknowledgedAt ? new Date(p.acknowledgedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : tr('Oui', 'Yes')) : tr('Non', 'No'),
      ]),
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      margin: tableMargin,
      didDrawPage: drawHeader,
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // Approbation — Superviseur / Responsable des travaux (page finalisation)
  if (y > pageH - 55) { doc.addPage(); drawHeader(); y = HEADER_H + 4; }
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(tr('Approbation — Superviseur / Responsable des travaux', 'Approval — Supervisor / Work manager'), margin, y);
  y += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  const verdictLabel = ast.supervisorSigStatus === 'approved' ? tr('Approuvé — conforme', 'Approved — compliant')
    : ast.supervisorSigStatus === 'corrective' ? tr('Correctif requis (audit)', 'Corrective required (audit)')
    : ast.supervisorSigStatus === 'nonconform' ? tr('Non-conformité', 'Non-compliance') : '';
  ([
    [tr('Superviseur', 'Supervisor'), ast.supervisor_name || ast.supervisorSigName],
    [tr('Certification', 'Certification'), ast.supervisor_cert || ast.supervisorSigCert],
    [tr('Verdict', 'Verdict'), verdictLabel],
    [tr('Travaux autorisés', 'Permitted work'), ast.permitted_work],
    [tr('Restrictions', 'Restrictions'), ast.restrictions],
    [tr('Valide du', 'Valid from'), ast.permit_valid_from?.replace('T', ' ').slice(0, 16)],
    [tr('Valide au', 'Valid to'), ast.permit_valid_to?.replace('T', ' ').slice(0, 16)],
    [tr('Notes du superviseur', 'Supervisor notes'), ast.supervisorSigNotes],
    [tr('Notes de finalisation', 'Finalization notes'), ast.finalization_notes],
  ] as [string, string | undefined][]).filter(([, v]) => v && String(v).trim()).forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold'); doc.text(`${k} : `, margin, y);
    const kw = doc.getTextWidth(`${k} : `);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(v), pageW - 2 * margin - kw);
    doc.text(lines[0] || '', margin + kw, y); y += 6;
    for (let i = 1; i < lines.length; i++) { if (y > pageH - 16) { doc.addPage(); drawHeader(); y = HEADER_H + 4; } doc.text(lines[i], margin, y); y += 6; }
  });
  y += 6;
  doc.text(tr('Signature : _______________________________', 'Signature: _______________________________'), margin, y);
  y += 9;
  doc.text(tr('Date : ____________________', 'Date: ____________________'), margin, y);
}

async function generateAstPdf(ast: ASTPermit, language: Language, logoDataUrl?: string | null, tenant?: string) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF('p', 'mm', 'a4');
  await renderAstSection(doc as { [k: string]: any }, autoTable as unknown as (d: any, o: any) => void, ast, language, logoDataUrl, tenant);
  doc.save(`${ast.permit_number}.pdf`);
}

// Export en lot : plusieurs AST dans un seul PDF (une fiche par page).
export async function generateAstsPdf(asts: ASTPermit[], language: Language, logoDataUrl?: string | null, tenant?: string) {
  if (asts.length === 0) return;
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF('p', 'mm', 'a4');
  for (let i = 0; i < asts.length; i++) {
    if (i > 0) doc.addPage();
    await renderAstSection(doc as { [k: string]: any }, autoTable as unknown as (d: any, o: any) => void, asts[i], language, logoDataUrl, tenant);
  }
  doc.save(asts.length === 1 ? `${asts[0].permit_number}.pdf` : `AST-export-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Section: Finalization ──────────────────────────────────────────────────
function FinalizationSection({ ast, completion, language, readOnly, onChange, onSave, onApplyStatus, tenant }: {
  ast: ASTPermit; completion: number; language: Language; readOnly: boolean;
  onChange: (updater: (p: ASTPermit) => ASTPermit) => void; onSave: () => void;
  onApplyStatus: (status: PermitStatus, navigate?: boolean) => void; tenant: string;
}) {
  const t = T[language].finalization;
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  const [pdfBusy, setPdfBusy] = useState(false);
  const { personnel } = useTenantDirectory(tenant);   // recherche dynamique du personnel (approbateur)

  // BLOCAGE STRICT : une non-conformité/correctif signalé(e) exige explication (≥10 car.) + pièce jointe.
  const ncOpen = ast.supervisorSigStatus === 'corrective' || ast.supervisorSigStatus === 'nonconform';
  const ncBlocked = ncOpen && (ast.supervisorSigNotes.trim().length < 10 || !(ast.supervisorSigAttachments || []).length);

  // Logo pour le PDF : celui du tenant (tenants.logo_url) sinon C-Secur par défaut.
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let url = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '';
      if (supabase && tenant) {
        try {
          const { data } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle();
          if (data?.logo_url) url = data.logo_url as string;
        } catch { /* défaut */ }
      }
      if (!url) return;
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(blob);
        });
        if (!cancelled) setLogoDataUrl(dataUrl);
      } catch { /* logo optionnel */ }
    })();
    return () => { cancelled = true; };
  }, [tenant]);

  const downloadPdf = async () => {
    setPdfBusy(true);
    try { await generateAstPdf(ast, language, logoDataUrl, tenant); }
    catch { alert(tr('Échec de la génération du PDF.', 'PDF generation failed.')); }
    finally { setPdfBusy(false); }
  };

  const field = (key: keyof ASTPermit, val: string) =>
    onChange(p => ({ ...p, [key]: val }));

  const warnings: string[] = [];
  if (ast.jobSteps.length === 0) warnings.push(t.warnings.noSteps);
  if (!ast.ppeRequirements.some(p => p.required)) warnings.push(t.warnings.noPPE);
  if (ast.participants.length === 0) warnings.push(t.warnings.noParticipants);
  const criticalSteps = ast.jobSteps.filter(s => (s.riskAfterProb * s.riskAfterSev) >= 17).length;
  if (criticalSteps > 0) warnings.push(t.warnings.criticalRisk(criticalSteps));
  const notAck = ast.participants.filter(p => !p.acknowledged).length;
  if (notAck > 0) warnings.push(t.warnings.notAcknowledged(notAck));

  return (
    <div>
      <Card title={t.cardValidation} icon={<BarChart3 className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 w-14 text-right">{completion}%</span>
          </div>
          {warnings.length > 0 ? (
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{language === 'fr' ? 'Aucun avertissement — AST complète.' : 'No warnings — JSA complete.'}</span>
            </div>
          )}
        </div>
      </Card>

      <Card title={t.cardApproval} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.supervisorName}>
            <EntitySearch value={ast.supervisor_name} readOnly={readOnly} options={personnel} onText={v => field('supervisor_name', v)} onPick={o => field('supervisor_name', o.label)} placeholder={t.supervisorNamePh} />
          </Field>
          <Field label={t.supervisorCert}>
            <TextInput value={ast.supervisor_cert} onChange={v => field('supervisor_cert', v)} placeholder={t.supervisorCertPh} disabled={readOnly} />
          </Field>
          <Field label={t.validFrom}>
            <TextInput type="datetime-local" value={ast.permit_valid_from} onChange={v => field('permit_valid_from', v)} disabled={readOnly} />
          </Field>
          <Field label={t.validTo}>
            <TextInput type="datetime-local" value={ast.permit_valid_to} onChange={v => field('permit_valid_to', v)} disabled={readOnly} />
          </Field>
        </div>
      </Card>

      <Card title={t.cardWork} icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <Textarea label={t.permittedWork} value={ast.permitted_work} onChange={v => field('permitted_work', v)} placeholder={t.permittedWorkPh} rows={3} disabled={readOnly} />
          <Textarea label={t.restrictions} value={ast.restrictions} onChange={v => field('restrictions', v)} placeholder={t.restrictionsPh} rows={3} disabled={readOnly} />
          <Textarea label={t.finalNotes} value={ast.finalization_notes} onChange={v => field('finalization_notes', v)} placeholder={t.finalNotesPh} rows={3} disabled={readOnly} />
        </div>
      </Card>

      {/* Statut courant + définition */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{tr('Statut', 'Status')} :</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          ast.status === 'active' ? 'bg-green-100 text-green-700' :
          ast.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          ast.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {ast.status === 'active' ? tr('Actif (approuvé)', 'Active (approved)') :
           ast.status === 'completed' ? tr('Complété', 'Completed') :
           ast.status === 'cancelled' ? tr('Annulé', 'Cancelled') : tr('Brouillon', 'Draft')}
        </span>
        <span className="text-xs text-slate-400">
          {ast.status === 'active' ? tr('— approuvé, travaux en cours', '— approved, work in progress') :
           ast.status === 'completed' ? tr('— travaux terminés', '— work completed') :
           ast.status === 'cancelled' ? tr('— AST annulé', '— JSA cancelled') :
           tr('— en rédaction, non approuvé', '— in progress, not approved')}
        </span>
      </div>

      {/* BLOCAGE STRICT : non-conformité signalée sans explication + pièce → finalisation impossible. */}
      {ncBlocked && !readOnly && (
        <div className="mb-4 rounded-lg border-2 border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
          🚫 {tr('Non-conformité signalée : impossible de finaliser tant qu’une EXPLICATION (≥ 10 caractères) ET au moins une PIÈCE (photo/document) ne sont pas fournies (section Superviseur).', 'Non-compliance reported: cannot finalize until an EXPLANATION (≥ 10 chars) AND at least one FILE (photo/document) are provided (Supervisor section).')}
        </div>
      )}
      {!readOnly && (
        <div className="flex flex-wrap gap-3 mb-6">
          {(ast.status === 'draft' || ast.status === 'cancelled') && (
            <button
              type="button"
              onClick={() => onApplyStatus('active')}
              disabled={completion < 60 || ncBlocked}
              title={ncBlocked ? tr('Non-conformité : explication + pièce obligatoires', 'Non-compliance: explanation + file required') : completion < 60 ? tr('Complétez au moins 60% pour approuver', 'Complete at least 60% to approve') : ''}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {tr('Approuver / Activer', 'Approve / Activate')}
            </button>
          )}
          {ast.status === 'active' && (
            <button
              type="button"
              onClick={() => onApplyStatus('completed')}
              disabled={ncBlocked}
              title={ncBlocked ? tr('Non-conformité : explication + pièce obligatoires', 'Non-compliance: explanation + file required') : ''}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {t.complete}
            </button>
          )}
          {(ast.status === 'completed' || ast.status === 'active' || ast.status === 'cancelled') && (
            <button
              type="button"
              onClick={() => onApplyStatus('draft', false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {tr('Repasser en brouillon', 'Back to draft')}
            </button>
          )}
          {ast.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => { if (window.confirm(tr("Annuler cet AST ?", 'Cancel this JSA?'))) onApplyStatus('cancelled', false); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              {tr('Annuler l\'AST', 'Cancel JSA')}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        </div>
      )}

      {/* Export PDF — pour transmettre l'AST complété (champs remplis seulement) */}
      <div className="mb-6 flex flex-col items-start gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:flex-row sm:items-center print:hidden">
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{tr('Exporter en PDF', 'Export to PDF')}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{tr('Téléchargez le PDF pour le transmettre (seuls les champs remplis apparaissent).', 'Download the PDF to share it (only filled fields appear).')}</div>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={pdfBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
        >
          {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {tr('Télécharger PDF', 'Download PDF')}
        </button>
      </div>

      <TeamShareLink permitNumber={ast.permit_number} tenant={tenant} language={language} />
      <QRCard permitNumber={ast.permit_number} tenant={tenant} type="ast" language={language} />
    </div>
  );
}

// ── Lien à partager à l'équipe (prise de connaissance) ─────────────────────
function TeamShareLink({ permitNumber, tenant, language }: {
  permitNumber: string; tenant: string; language: Language;
}) {
  const tr = (fr: string, en: string) => (language === 'fr' ? fr : en);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const url = origin ? `${origin}/${tenant}/ast/view/${permitNumber}` : '';
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };
  if (!origin) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-800 shadow-sm overflow-hidden mb-6 print:hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-teal-100 dark:border-teal-800">
        <span className="text-teal-600"><Users className="w-5 h-5" /></span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">
          {tr("Partager à l'équipe", 'Share with the team')}
        </h3>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {tr(
            "Transmettez ce lien quand l'AST est prêt ou après une révision (ex. changement de verrouillage). Chaque membre l'ouvre, va dans la section Participants et coche sa prise de connaissance — aucune connexion requise.",
            'Share this link when the JSA is ready or after a revision (e.g. lockout change). Each member opens it, goes to the Participants section and checks their acknowledgment — no login required.',
          )}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <code className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 break-all select-all">
            {url}
          </code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {copied ? <><Check className="w-4 h-4" /> {tr('Copié', 'Copied')}</> : tr('Copier le lien', 'Copy link')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QR Code card ───────────────────────────────────────────────────────────
function QRCard({ permitNumber, tenant, type, language }: {
  permitNumber: string; tenant: string; type: 'ast' | 'confined_space'; language: Language;
}) {
  const [origin, setOrigin] = React.useState('');
  React.useEffect(() => { setOrigin(window.location.origin); }, []);

  const url = type === 'ast'
    ? `${origin}/${tenant}/ast/view/${permitNumber}`
    : `${origin}/${tenant}/permits/view/${permitNumber}`;

  if (!origin) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6 print:mt-4">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-teal-600"><QrCode className="w-5 h-5" /></span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">
          {language === 'fr' ? 'Code QR — Accès lecture seule' : 'QR Code — Read-only access'}
        </h3>
      </div>
      <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm shrink-0">
          <QRCodeSVG value={url} size={140} level="M" includeMargin={false} />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {language === 'fr'
              ? "Scannez ce code avec n'importe quel téléphone pour consulter ce permis en lecture seule — aucune connexion requise."
              : "Scan this code with any phone to view this permit in read-only mode — no login required."}
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

// ── Utilitaire photos ──────────────────────────────────────────────────────
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Composant galerie photo ────────────────────────────────────────────────
function PhotoCapture({ photos, onChange, readOnly, language, label }: {
  photos: LOTOPhoto[];
  onChange: (photos: LOTOPhoto[]) => void;
  readOnly: boolean;
  language: Language;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const added: LOTOPhoto[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await readFileAsDataUrl(file);
        // Tentative de géolocalisation (best-effort)
        let gpsLatitude: number | undefined;
        let gpsLongitude: number | undefined;
        if (navigator.geolocation) {
          await new Promise<void>(res => {
            navigator.geolocation.getCurrentPosition(
              pos => { gpsLatitude = pos.coords.latitude; gpsLongitude = pos.coords.longitude; res(); },
              () => res(),
              { timeout: 3000, maximumAge: 60000 }
            );
          });
        }
        added.push({ id: generateId(), url, timestamp: new Date().toISOString(), description: '', lockState: 'before', gpsLatitude, gpsLongitude });
      } catch { /* ignore */ }
    }
    if (added.length > 0) onChange([...photos, ...added]);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative group w-20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-600" />
            {photo.gpsLatitude && (
              <span className="absolute bottom-5 left-0.5 text-[9px] bg-black/50 text-white rounded px-0.5">GPS</span>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange(photos.filter(p => p.id !== photo.id))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full hidden group-hover:flex items-center justify-center shadow transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <p className="text-[9px] text-slate-400 mt-0.5 truncate text-center">
              {new Date(photo.timestamp).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 hover:border-teal-400 hover:text-teal-500 dark:hover:border-teal-500 transition-colors shrink-0"
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{tr('Photo', 'Photo')}</span>
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

// ── Section: Gestion des travailleurs (modèle complet) ────────────────────
function WorkersSection({ ast, onChange, language, readOnly }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  language: Language; readOnly: boolean;
}) {
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;
  const workers = ast.workers ?? [];
  const present = workers.filter(w => w.checkedInAt && !w.checkedOutAt).length;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addWorker = () => {
    const id = generateId();
    onChange(p => ({
      ...p,
      workers: [...(p.workers ?? []), {
        id, name: '', role: 'travailleur', company: '', badgeNumber: '',
        certifications: [], emergencyContact: '', emergencyPhone: '',
        present: false, checkedInAt: '', checkedOutAt: '',
      }],
    }));
    setExpandedId(id);
  };

  const removeWorker = (id: string) =>
    onChange(p => ({ ...p, workers: (p.workers ?? []).filter(w => w.id !== id) }));

  const updateWorker = (id: string, key: keyof Worker, val: unknown) =>
    onChange(p => ({ ...p, workers: (p.workers ?? []).map(w => w.id === id ? { ...w, [key]: val } : w) }));

  const checkIn = (id: string) => updateWorker(id, 'checkedInAt', new Date().toISOString());
  const checkOut = (id: string) => updateWorker(id, 'checkedOutAt', new Date().toISOString());

  const roleOptions = [
    { value: 'travailleur', label: tr('Travailleur', 'Worker') },
    { value: 'superviseur', label: tr('Superviseur', 'Supervisor') },
    { value: 'sous_traitant', label: tr('Sous-traitant', 'Subcontractor') },
    { value: 'visiteur', label: tr('Visiteur', 'Visitor') },
    { value: 'secouriste', label: tr('Secouriste', 'First aider') },
  ];

  return (
    <div>
      <Card
        title={tr('Gestion des travailleurs', 'Worker management')}
        icon={<Users className="w-5 h-5" />}
        badge={workers.length > 0 ? (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${present > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
            {present} / {workers.length} {tr('présent(s)', 'present')}
          </span>
        ) : undefined}
      >
        <div className="space-y-3">
          {workers.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-400 dark:text-slate-500 italic">
              {tr('Aucun travailleur enregistré.', 'No workers registered.')}
            </p>
          )}

          {workers.map((w, i) => {
            const isCheckedIn = !!w.checkedInAt && !w.checkedOutAt;
            const isExpanded = expandedId === w.id;
            return (
              <div key={w.id} className={`rounded-xl border overflow-hidden transition-colors ${isCheckedIn ? 'border-green-300 dark:border-green-700' : 'border-slate-200 dark:border-slate-600'}`}>
                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-3 ${isCheckedIn ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {w.name || tr('(Sans nom)', '(No name)')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {roleOptions.find(r => r.value === w.role)?.label ?? w.role}
                      {w.badgeNumber && ` · #${w.badgeNumber}`}
                      {w.company && ` · ${w.company}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Check-in / check-out */}
                    {!readOnly && !w.checkedInAt && (
                      <button type="button" onClick={() => checkIn(w.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                        <UserCheck className="w-3.5 h-3.5" />
                        {tr('Check-in', 'Check-in')}
                      </button>
                    )}
                    {!readOnly && w.checkedInAt && !w.checkedOutAt && (
                      <button type="button" onClick={() => checkOut(w.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">
                        <UserX className="w-3.5 h-3.5" />
                        {tr('Check-out', 'Check-out')}
                      </button>
                    )}
                    {w.checkedInAt && !w.checkedOutAt && (
                      <span className="text-[10px] text-green-600 font-semibold">✓ {tr('Présent', 'Present')}</span>
                    )}
                    {w.checkedOutAt && (
                      <span className="text-[10px] text-slate-500">{tr('Sorti', 'Checked out')}</span>
                    )}
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : w.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {!readOnly && (
                      <button type="button" onClick={() => removeWorker(w.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Détails expandés */}
                {isExpanded && (
                  <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 border-t border-slate-100 dark:border-slate-700">
                    <Field label={tr('Nom complet', 'Full name')}>
                      <TextInput value={w.name} onChange={v => updateWorker(w.id, 'name', v)}
                        placeholder={tr('Prénom et nom', 'First and last name')} disabled={readOnly} />
                    </Field>
                    <Field label={tr('Rôle', 'Role')}>
                      <SelectInput value={w.role} onChange={v => updateWorker(w.id, 'role', v)}
                        options={roleOptions} disabled={readOnly} />
                    </Field>
                    <Field label={tr('Entreprise', 'Company')}>
                      <TextInput value={w.company} onChange={v => updateWorker(w.id, 'company', v)} disabled={readOnly} />
                    </Field>
                    <Field label={tr('N° badge', 'Badge #')}>
                      <TextInput value={w.badgeNumber} onChange={v => updateWorker(w.id, 'badgeNumber', v)}
                        placeholder="EMP-042" disabled={readOnly} />
                    </Field>
                    <Field label={tr('Contact urgence', 'Emergency contact')}>
                      <TextInput value={w.emergencyContact} onChange={v => updateWorker(w.id, 'emergencyContact', v)}
                        placeholder={tr('Nom', 'Name')} disabled={readOnly} />
                    </Field>
                    <Field label={tr('Tél. urgence', 'Emergency phone')}>
                      <TextInput value={w.emergencyPhone} onChange={v => updateWorker(w.id, 'emergencyPhone', v)}
                        placeholder="514-555-0000" disabled={readOnly} />
                    </Field>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <TagSelector
                        label={tr('Certifications / formations', 'Certifications / training')}
                        options={['RCR/DEA', tr('Espace clos — Entrant', 'Confined space — Entrant'), tr('Espace clos — Superviseur', 'Confined space — Supervisor'), 'SIMDUT/GHS', 'CADENASSAGE (LOTO)', tr('Travail en hauteur', 'Work at height'), tr('Chariots élévateurs', 'Forklift'), tr('Grue/Levage', 'Crane/Rigging'), tr('Électricien qualifié', 'Qualified electrician'), tr('Travail à chaud', 'Hot work')]}
                        selected={w.certifications}
                        onChange={v => updateWorker(w.id, 'certifications', v)}
                        disabled={readOnly}
                        allowCustom
                        customPlaceholder={tr('Autre certification…', 'Other certification…')}
                      />
                    </div>
                    {/* Horaires check-in/out */}
                    {(w.checkedInAt || w.checkedOutAt) && (
                      <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                        {w.checkedInAt && (
                          <div>
                            <span className="font-medium text-green-600">{tr('Check-in : ', 'Check-in: ')}</span>
                            {new Date(w.checkedInAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                          </div>
                        )}
                        {w.checkedOutAt && (
                          <div>
                            <span className="font-medium text-amber-600">{tr('Check-out : ', 'Check-out: ')}</span>
                            {new Date(w.checkedOutAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                          </div>
                        )}
                      </div>
                    )}
                    {/* QR Code identifiant */}
                    {w.name && (
                      <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white p-2 shadow-sm shrink-0">
                          <QRCodeSVG
                            value={JSON.stringify({ name: w.name, badge: w.badgeNumber, company: w.company, permit: ast.permit_number })}
                            size={96}
                            level="M"
                          />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <p className="font-medium text-slate-700 dark:text-slate-200">{tr('QR identifiant', 'ID QR code')}</p>
                          <p className="mt-0.5">{tr('Scannez pour identifier ce travailleur sur le site.', 'Scan to identify this worker on site.')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!readOnly && (
            <button type="button" onClick={addWorker}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> {tr('Ajouter un travailleur', 'Add a worker')}
            </button>
          )}
        </div>
      </Card>

      <Card title={tr('Notes — gestion des travailleurs', 'Worker management notes')} icon={<FileText className="w-5 h-5" />}>
        <Textarea
          label={tr('Observations, consignes particulières…', 'Observations, special instructions…')}
          value={ast.workerNotes ?? ''}
          onChange={v => onChange(p => ({ ...p, workerNotes: v }))}
          rows={3}
          disabled={readOnly}
        />
      </Card>
    </div>
  );
}

// ── Section: Énergie / LOTO (modèle complet) ──────────────────────────────
function LotoSection({ ast, onChange, readOnly, language, tenant }: {
  ast: ASTPermit; onChange: (updater: (p: ASTPermit) => ASTPermit) => void;
  readOnly: boolean; language: Language; tenant: string;
}) {
  const tr = (fr: string, en: string) => language === 'fr' ? fr : en;
  const loto = ast.loto ?? {
    required: false, ref: '', templateName: '', energySources: [], locks: [],
    verificationDone: false, verificationBy: '', verificationDate: '',
    reenergizationAuthBy: '', reenergizationAuthDate: '', notes: '',
  };

  // ── Gabarits LOTO ─────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string; energy_sources: typeof loto.energySources }>>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (!supabase || !tenant) return;
    supabase.from('tenant_loto_templates').select('id,name,description,energy_sources').eq('tenant_id', tenant)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setTemplates(data as typeof templates); });
  }, [tenant]);

  const saveTemplate = async () => {
    const name = templateName.trim();
    if (!name || !supabase) return;
    setSavingTemplate(true);
    const sourcesWithoutPhotos = loto.energySources.map(s => ({ ...s, photos: [] }));
    const { data } = await supabase.from('tenant_loto_templates').insert({
      tenant_id: tenant, name, description: templateDesc.trim(),
      energy_sources: sourcesWithoutPhotos,
    }).select('id,name,description,energy_sources').single();
    if (data) setTemplates(prev => [data as typeof templates[0], ...prev]);
    setSavingTemplate(false);
    setTemplateName('');
    setTemplateDesc('');
    setShowSaveForm(false);
  };

  const loadTemplate = (tpl: typeof templates[0]) => {
    const sources = (tpl.energy_sources ?? []).map((s: typeof loto.energySources[0]) => ({
      ...s, id: generateId(), photos: [],
    }));
    onChange(p => ({ ...p, loto: { ...p.loto, energySources: sources, templateName: tpl.name } }));
    setShowTemplates(false);
  };

  const deleteTemplate = async (id: string) => {
    if (!supabase) return;
    await supabase.from('tenant_loto_templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // ── Sources d'énergie ─────────────────────────────────────────────────────
  const setL = (key: keyof typeof loto, val: unknown) =>
    onChange(p => ({ ...p, loto: { ...p.loto, [key]: val } }));

  const addSource = () => setL('energySources', [...loto.energySources, {
    id: generateId(), type: tr('Électrique', 'Electrical'), description: '', magnitude: '',
    location: '', isolationMethod: '', verifiedBy: '', verified: false, photos: [],
  }]);
  const updateSource = (id: string, field: string, val: unknown) =>
    setL('energySources', loto.energySources.map(s => s.id === id ? { ...s, [field]: val } : s));
  const removeSource = (id: string) =>
    setL('energySources', loto.energySources.filter(s => s.id !== id));

  const addLock = () => setL('locks', [...loto.locks, {
    id: generateId(), lockId: '', owner: '', placedAt: new Date().toISOString().slice(0, 16), removedAt: '',
  }]);
  const updateLock = (id: string, field: string, val: string) =>
    setL('locks', loto.locks.map(l => l.id === id ? { ...l, [field]: val } : l));
  const removeLock = (id: string) =>
    setL('locks', loto.locks.filter(l => l.id !== id));

  const energyTypes = [
    tr('Électrique', 'Electrical'), tr('Mécanique', 'Mechanical'),
    tr('Pneumatique', 'Pneumatic'), tr('Hydraulique', 'Hydraulic'),
    tr('Thermique', 'Thermal'), tr('Chimique', 'Chemical'),
    tr('Gravitationnel', 'Gravitational'), tr('Rayonnement', 'Radiation'),
  ];

  const photoLabels: Record<LOTOPhotoState, string> = {
    before: tr('Avant isolation', 'Before isolation'),
    during: tr('Pendant isolation', 'During isolation'),
    after: tr('Après isolation', 'After isolation'),
    verification: tr("Vérification absence d'énergie", 'Zero energy verification'),
  };

  return (
    <div className="space-y-0">
      {/* ── Gabarits LOTO ─────────────────────────────────────────────────── */}
      <Card title={tr('Gabarits LOTO', 'LOTO Templates')} icon={<BookMarked className="w-5 h-5" />}>
        <div className="space-y-3">
          {loto.templateName && (
            <div className="flex items-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 px-3 py-2 text-sm">
              <Star className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="text-teal-700 dark:text-teal-300 font-medium">{tr('Gabarit chargé : ', 'Template loaded: ')}</span>
              <span className="text-teal-600 dark:text-teal-400">{loto.templateName}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!readOnly && (
              <button type="button" onClick={() => { setShowTemplates(v => !v); setShowSaveForm(false); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm transition-colors">
                <BookMarked className="w-4 h-4" />
                {tr('Charger un gabarit', 'Load a template')} ({templates.length})
              </button>
            )}
            {!readOnly && loto.energySources.length > 0 && (
              <button type="button" onClick={() => { setShowSaveForm(v => !v); setShowTemplates(false); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors">
                <Save className="w-4 h-4" />
                {tr('Sauvegarder comme gabarit', 'Save as template')}
              </button>
            )}
          </div>

          {/* Formulaire sauvegarde */}
          {showSaveForm && !readOnly && (
            <div className="rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/10 p-4 space-y-3">
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                {tr('Sauvegarder la procédure LOTO', 'Save LOTO procedure')}
              </p>
              <Field label={tr('Nom du gabarit *', 'Template name *')}>
                <TextInput value={templateName} onChange={setTemplateName}
                  placeholder={tr('Ex: Presse hydraulique P-42', 'E.g.: Hydraulic press P-42')} />
              </Field>
              <Field label={tr('Description', 'Description')}>
                <TextInput value={templateDesc} onChange={setTemplateDesc}
                  placeholder={tr('Brève description de l\'équipement ou de la procédure', 'Brief equipment or procedure description')} />
              </Field>
              <div className="flex gap-2">
                <button type="button" onClick={saveTemplate} disabled={!templateName.trim() || savingTemplate}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {savingTemplate ? tr('Sauvegarde…', 'Saving…') : tr('Sauvegarder', 'Save')}
                </button>
                <button type="button" onClick={() => setShowSaveForm(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                  {tr('Annuler', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Liste des gabarits */}
          {showTemplates && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
              {templates.length === 0 ? (
                <p className="text-center py-6 text-sm text-slate-400 italic">
                  {tr('Aucun gabarit sauvegardé pour ce tenant.', 'No templates saved for this tenant.')}
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{tpl.name}</p>
                        {tpl.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tpl.description}</p>}
                        <p className="text-xs text-slate-400">{tpl.energy_sources?.length ?? 0} {tr('source(s) d\'énergie', 'energy source(s)')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => loadTemplate(tpl)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors">
                          {tr('Charger', 'Load')}
                        </button>
                        {!readOnly && (
                          <button type="button" onClick={() => deleteTemplate(tpl.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── Cadenassage toggle ─────────────────────────────────────────────── */}
      <Card title={tr('Cadenassage / LOTO', 'Lockout / Tagout (LOTO)')} icon={<Lock className="w-5 h-5" />}>
        <div className="space-y-4">
          <Toggle checked={loto.required} onChange={v => setL('required', v)}
            label={tr('Cadenassage (LOTO) requis pour ces travaux', 'Lockout/Tagout (LOTO) required for this work')} disabled={readOnly} />
          {loto.required && (
            <Field label={tr('Référence procédure LOTO', 'LOTO procedure reference')}>
              <TextInput value={loto.ref} onChange={v => setL('ref', v)}
                placeholder={tr('N° ou référence de la procédure LOTO…', 'LOTO procedure number or reference…')} disabled={readOnly} />
            </Field>
          )}
          {loto.required && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{tr(
                'Un permis de cadenassage distinct doit être émis conformément à la procédure LOTO du site avant le début des travaux.',
                'A separate lockout permit must be issued in accordance with the site LOTO procedure before work begins.'
              )}</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Sources d'énergie ──────────────────────────────────────────────── */}
      <Card title={tr("Sources d'énergie identifiées", 'Identified energy sources')} icon={<Zap className="w-5 h-5" />}>
        <div className="space-y-4">
          {loto.energySources.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-400 dark:text-slate-500 italic">
              {tr("Aucune source d'énergie identifiée.", 'No energy sources identified.')}
            </p>
          )}
          {loto.energySources.map((src, i) => (
            <div key={src.id} className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
              {/* En-tête source */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{src.type}{src.description ? ` — ${src.description}` : ''}</span>
                <div className="flex items-center gap-2">
                  {(src.photos?.length ?? 0) > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      <Camera className="w-3.5 h-3.5 inline mr-0.5" />{src.photos.length}
                    </span>
                  )}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={src.verified}
                      onChange={e => updateSource(src.id, 'verified', e.target.checked)}
                      disabled={readOnly} className="h-3.5 w-3.5 accent-teal-600" />
                    <span className={src.verified ? 'text-teal-600 font-semibold' : 'text-slate-500'}>
                      {tr('Isolée ✓', 'Isolated ✓')}
                    </span>
                  </label>
                  {!readOnly && <button type="button" onClick={() => removeSource(src.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>

              {/* Champs */}
              <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label={tr("Type d'énergie", 'Energy type')}>
                  <SelectInput value={src.type} onChange={v => updateSource(src.id, 'type', v)}
                    options={energyTypes.map(t => ({ value: t, label: t }))} disabled={readOnly} />
                </Field>
                <Field label={tr('Description / équipement', 'Description / equipment')}>
                  <TextInput value={src.description} onChange={v => updateSource(src.id, 'description', v)}
                    placeholder={tr('Ex: Moteur convoyeur M-01', 'E.g.: Conveyor motor M-01')} disabled={readOnly} />
                </Field>
                <Field label={tr('Magnitude (V, kPa, kN…)', 'Magnitude (V, kPa, kN…)')}>
                  <TextInput value={src.magnitude} onChange={v => updateSource(src.id, 'magnitude', v)}
                    placeholder="480 V, 700 kPa…" disabled={readOnly} />
                </Field>
                <Field label={tr("Emplacement / point d'isolation", 'Location / isolation point')}>
                  <TextInput value={src.location} onChange={v => updateSource(src.id, 'location', v)}
                    placeholder={tr('Ex: Panneau P-12, salle électrique A', 'E.g.: Panel P-12, electrical room A')} disabled={readOnly} />
                </Field>
                <Field label={tr("Méthode d'isolation", 'Isolation method')}>
                  <TextInput value={src.isolationMethod} onChange={v => updateSource(src.id, 'isolationMethod', v)}
                    placeholder={tr('Ex: Disjoncteur D-12 verrouillé', 'E.g.: Breaker D-12 locked out')} disabled={readOnly} />
                </Field>
                <Field label={tr('Vérifiée par', 'Verified by')}>
                  <TextInput value={src.verifiedBy} onChange={v => updateSource(src.id, 'verifiedBy', v)}
                    placeholder={tr('Nom de la personne', 'Person name')} disabled={readOnly} />
                </Field>
              </div>

              {/* Photos par état d'isolation */}
              <div className="border-t border-slate-100 dark:border-slate-700 px-4 pb-4 pt-3 space-y-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  {tr('Photos de documentation', 'Documentation photos')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['before', 'during', 'after', 'verification'] as LOTOPhotoState[]).map(state => {
                    const statePhotos = (src.photos ?? []).filter(p => p.lockState === state);
                    return (
                      <div key={state} className="space-y-1.5">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{photoLabels[state]}</p>
                        <PhotoCapture
                          photos={statePhotos}
                          onChange={newPhotos => {
                            const otherPhotos = (src.photos ?? []).filter(p => p.lockState !== state);
                            const tagged = newPhotos.map(p => ({ ...p, lockState: state }));
                            updateSource(src.id, 'photos', [...otherPhotos, ...tagged]);
                          }}
                          readOnly={readOnly}
                          language={language}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {!readOnly && (
            <button type="button" onClick={addSource}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> {tr("Ajouter une source d'énergie", 'Add an energy source')}
            </button>
          )}
        </div>
      </Card>

      {/* ── Registre cadenas ───────────────────────────────────────────────── */}
      <Card title={tr('Registre des cadenas', 'Lock register')} icon={<Lock className="w-5 h-5" />}>
        <div className="space-y-3">
          {loto.locks.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-400 dark:text-slate-500 italic">
              {tr('Aucun cadenas enregistré.', 'No locks registered.')}
            </p>
          )}
          {loto.locks.map((lk, i) => (
            <div key={lk.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold shrink-0">{i + 1}</span>
              <Field label={tr('N° cadenas', 'Lock #')}>
                <TextInput value={lk.lockId} onChange={v => updateLock(lk.id, 'lockId', v)} placeholder="L-042" disabled={readOnly} />
              </Field>
              <Field label={tr('Propriétaire', 'Owner')}>
                <TextInput value={lk.owner} onChange={v => updateLock(lk.id, 'owner', v)}
                  placeholder={tr('Nom et prénom', 'First and last name')} disabled={readOnly} />
              </Field>
              <Field label={tr('Posé le', 'Placed at')}>
                <TextInput type="datetime-local" value={lk.placedAt} onChange={v => updateLock(lk.id, 'placedAt', v)} disabled={readOnly} />
              </Field>
              <Field label={tr('Retiré le', 'Removed at')}>
                <TextInput type="datetime-local" value={lk.removedAt} onChange={v => updateLock(lk.id, 'removedAt', v)} disabled={readOnly} />
              </Field>
              {!readOnly && <button type="button" onClick={() => removeLock(lk.id)} className="mt-4 p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
          {!readOnly && (
            <button type="button" onClick={addLock}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> {tr('Ajouter un cadenas', 'Add a lock')}
            </button>
          )}
        </div>
      </Card>

      {/* ── Vérification et re-énergisation ────────────────────────────────── */}
      <Card title={tr('Vérification et re-énergisation', 'Verification and re-energization')} icon={<CheckCircle className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {tr("Vérification absence d'énergie", 'Zero energy verification')}
              </div>
              <Toggle checked={loto.verificationDone} onChange={v => setL('verificationDone', v)}
                label={tr("Vérification effectuée — absence d'énergie confirmée", 'Verification done — zero energy confirmed')}
                disabled={readOnly} />
              <Field label={tr('Vérifiée par', 'Verified by')}>
                <TextInput value={loto.verificationBy} onChange={v => setL('verificationBy', v)}
                  placeholder={tr('Nom', 'Name')} disabled={readOnly} />
              </Field>
              <Field label={tr('Date / heure', 'Date / time')}>
                <TextInput type="datetime-local" value={loto.verificationDate} onChange={v => setL('verificationDate', v)} disabled={readOnly} />
              </Field>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {tr('Autorisation re-énergisation', 'Re-energization authorization')}
              </div>
              <Field label={tr('Autorisée par', 'Authorized by')}>
                <TextInput value={loto.reenergizationAuthBy} onChange={v => setL('reenergizationAuthBy', v)}
                  placeholder={tr('Nom du superviseur', 'Supervisor name')} disabled={readOnly} />
              </Field>
              <Field label={tr('Date / heure', 'Date / time')}>
                <TextInput type="datetime-local" value={loto.reenergizationAuthDate} onChange={v => setL('reenergizationAuthDate', v)} disabled={readOnly} />
              </Field>
            </div>
          </div>
          <Textarea label={tr('Notes LOTO', 'LOTO notes')} value={loto.notes} onChange={v => setL('notes', v)}
            placeholder={tr('Observations, conditions particulières, dérogations approuvées…', 'Observations, special conditions, approved deviations…')}
            rows={3} disabled={readOnly} />
        </div>
      </Card>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────
interface ASTPermitProps {
  tenant?: string;
  language?: Language;
  selectedProvince?: ProvinceCode;
  province?: ProvinceCode;
  enableAutoSave?: boolean;
  onSave?: (data: ASTPermit) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<ASTPermit>;
}

type SectionId = 'task' | 'energy' | 'steps' | 'ppe' | 'equipment' | 'workers' | 'participants' | 'finalization';

// ── Main component ─────────────────────────────────────────────────────────
export default function ASTPermit({
  tenant = 'demo',
  language = 'fr',
  selectedProvince,
  province = 'QC',
  enableAutoSave = true,
  onSave,
  onCancel,
  readOnly = false,
  initialData,
}: ASTPermitProps) {
  const resolvedProvince: ProvinceCode = (selectedProvince ?? province) as ProvinceCode;
  const t = T[language];
  const { siteId: currentSiteId } = useSite(); // site global courant -> rattachement de l'AST

  const [ast, setAst] = useState<ASTPermit>(() => ({
    ...createDefaultPermit(resolvedProvince, tenant),
    ...initialData,
  }));

  const dir = useTenantDirectory(tenant);
  const [section, setSection] = useState<SectionId>('task');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const menuRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAst(p => ({ ...p, province: resolvedProvince }));
  }, [resolvedProvince]);

  const persistAst = useCallback(async (data: ASTPermit): Promise<boolean> => {
    setSaveStatus('saving');
    try {
      const payload = { ...data, updated_at: new Date().toISOString() };
      // % de remplissage CALCULÉ et PERSISTÉ à chaque sauvegarde (avant, validation.percentage restait à 0
      // → toutes les stats du tableau de bord AST « remplissage moyen / remplis à 100 % / barres » à 0 %).
      const pct = computeCompletion(payload);
      payload.validation = { percentage: pct, isComplete: pct >= 100 };
      if (supabase) {
        const { error } = await supabase.from('ast_permits').upsert({
          permit_number: payload.permit_number,
          tenant_id: tenant,
          site_id: currentSiteId && currentSiteId !== 'all' ? currentSiteId : null,
          data: payload,
          updated_at: payload.updated_at,
        });
        if (error) { setSaveStatus('error'); return false; }
      }
      localStorage.setItem(`${currentTenantSlug()}::ast-permit-${payload.permit_number}`, JSON.stringify(payload));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return true;
    } catch {
      setSaveStatus('error');
      return false;
    }
  }, [tenant, currentSiteId]);

  useEffect(() => {
    if (!enableAutoSave) return;
    // Ne pas créer de brouillon vide : n'enregistrer automatiquement que si l'AST
    // contient au moins une information réelle (évite les AST fantômes au simple accès).
    const ti = ast.taskInfo;
    const hasContent = !!(
      ti.workLocation?.trim() || ti.taskDescription?.trim() || ti.projectNumber?.trim() ||
      ti.supervisor?.trim() || ti.contractor?.trim() || ti.projectName?.trim() ||
      ast.jobSteps.some(s => s.description?.trim() || s.hazards.length > 0 || s.controls.length > 0) ||
      ast.participants.some(p => p.name?.trim()) ||
      (ast.equipment?.tools?.length ?? 0) > 0 ||
      (ast.workers?.length ?? 0) > 0
    );
    if (!hasContent) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistAst(ast), 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [ast, enableAutoSave, persistAst]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToSection = (s: SectionId) => {
    setSection(s);
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const updateAst = useCallback((updater: (p: ASTPermit) => ASTPermit) => {
    setAst(updater);
  }, []);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(ast, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ast.permit_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const ok = await persistAst(ast);
    if (ok && onSave) onSave(ast);
  };

  // Change le statut ET persiste immédiatement la nouvelle valeur.
  // Ne navigue PAS si la sauvegarde a échoué (évite de perdre le changement).
  const applyStatus = async (status: PermitStatus, navigate = true) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const next: ASTPermit = { ...ast, status, updated_at: new Date().toISOString() };
    setAst(next);
    const ok = await persistAst(next);
    if (!ok) return; // save failed — stay on page, error shown in header
    if (navigate && onSave) onSave(next);
  };

  const completion = computeCompletion(ast);

  const isComplet = (ast.model ?? 'simple') === 'complet';
  const SECTIONS: { id: SectionId; icon: React.ReactNode; label: string }[] = [
    { id: 'task', icon: <ClipboardList className="w-4 h-4" />, label: t.sections.task },
    ...(isComplet ? [{ id: 'energy' as SectionId, icon: <Lock className="w-4 h-4" />, label: language === 'fr' ? 'Énergie / LOTO' : 'Energy / LOTO' }] : []),
    { id: 'steps', icon: <List className="w-4 h-4" />, label: t.sections.steps },
    { id: 'ppe', icon: <Shield className="w-4 h-4" />, label: t.sections.ppe },
    { id: 'equipment', icon: <Wrench className="w-4 h-4" />, label: t.sections.equipment },
    { id: 'participants', icon: <Users className="w-4 h-4" />, label: t.sections.participants },
    { id: 'finalization', icon: <CheckCircle className="w-4 h-4" />, label: t.sections.finalization },
  ];

  const statusColors: Record<PermitStatus, string> = {
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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
            <ClipboardList className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{t.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ast.permit_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ast.status]}`}>
              {t.status[ast.status]}
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-3.5 h-3.5" />
              {completion}%
            </span>
            <span className={`hidden sm:block text-xs font-medium transition-colors ${
              saveStatus === 'saved' ? 'text-green-600' :
              saveStatus === 'saving' ? 'text-blue-500' :
              saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'
            }`}>
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
                    setAst(createDefaultPermit(resolvedProvince, tenant));
                    setSection('task');
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
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto hidden md:flex items-center gap-2 pb-2 shrink-0">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {section === 'task' && (
            <TaskSection ast={ast} onChange={updateAst} language={language} readOnly={readOnly} personnel={dir.personnel} projects={dir.projects} suppliers={dir.suppliers} />
          )}
          {section === 'energy' && (
            <LotoSection ast={ast} onChange={updateAst} readOnly={readOnly} language={language} tenant={tenant} />
          )}
          {section === 'steps' && (
            <StepsSection ast={ast} onChange={updateAst} language={language} readOnly={readOnly} tenant={tenant} />
          )}
          {section === 'ppe' && (
            <PPESection ast={ast} onChange={updateAst} language={language} readOnly={readOnly} tenant={tenant} />
          )}
          {section === 'equipment' && (
            <EquipmentSection ast={ast} onChange={updateAst} language={language} readOnly={readOnly} />
          )}
          {section === 'participants' && (
            <ParticipantsSection ast={ast} onChange={updateAst} language={language} readOnly={readOnly} tenant={tenant} />
          )}
          {section === 'finalization' && (
            <FinalizationSection
              ast={ast}
              completion={completion}
              language={language}
              readOnly={readOnly}
              onChange={updateAst}
              onSave={handleSaveNow}
              onApplyStatus={applyStatus}
              tenant={tenant}
            />
          )}
        </div>
      </main>
    </div>
  );
}
