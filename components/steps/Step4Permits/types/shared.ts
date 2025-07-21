// =================== TYPES PARTAGÉS COMPLETS ===================
// Fichier: components/steps/Step4Permits/types/shared.ts
// Types communs utilisés par tous les formulaires de permis

// =================== TYPES DE BASE ===================
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate: Date;
  valid: boolean;
  certificateNumber?: string;
  level?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  role: string;
  company?: string;
}

export interface Location {
  address: string;
  coordinates?: { lat: number; lng: number };
  building?: string;
  floor?: string;
  room?: string;
  specificLocation: string;
  zone?: string;
  sector?: string;
}

// =================== PERSONNEL ===================
export interface PersonnelMember {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  entreprise: string;
  age: number;
  experience: number;
  certifications: Certification[];
  photo?: string;
  statut: 'actif' | 'inactif' | 'formation';
  contactUrgence: {
    nom: string;
    relation: string;
    telephone: string;
  };
  specializations?: string[];
}

export interface ElectricalPersonnel extends PersonnelMember {
  electricalLicense: string;
  qualifiedPerson: boolean;
  arcFlashTraining: boolean;
  cprCertified: boolean;
  lastSafetyTraining: Date;
  voltageRating?: number;
}

// =================== PROCÉDURES ===================
export interface ProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  acceptanceCriteria?: { fr: string[]; en: string[] };
  requiredPersonnel?: string[];
  estimatedTime?: number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  voiceNotes?: string[];
  photos?: string[];
  references?: { fr: string; en: string };
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SafetyProcedure extends ProcedureStep {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiredPPE: string[];
  environmentalConditions?: string[];
  emergencyContacts?: ContactInfo[];
}

// =================== ÉQUIPEMENTS ===================
export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  calibrationDate?: Date;
  nextCalibration?: Date;
  status: 'operational' | 'maintenance' | 'out-of-service' | 'calibration-required';
  location?: string;
  assignedTo?: string;
  specifications?: Record<string, any>;
}

export interface SafetyEquipment extends EquipmentItem {
  safetyRating?: string;
  protectionLevel?: string;
  standards?: string[];
  lastInspection?: Date;
  nextInspection?: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'needs-replacement' | 'defective';
}

export interface PPEItem {
  id: string;
  type: string;
  size?: string;
  condition: 'new' | 'good' | 'fair' | 'replace';
  assignedTo?: string;
  lastInspection?: Date;
  expiryDate?: Date;
  standards?: string[];
  protectionRating?: string;
}

// =================== TESTS ET MESURES ===================
export interface TestResult {
  id: string;
  testType: string;
  testName: string;
  location?: string;
  circuit?: string;
  expectedValue?: number;
  actualValue: number;
  unit: string;
  acceptable: boolean;
  tolerance?: number;
  standard?: string;
  performedBy: string;
  timestamp: Date;
  equipment: string;
  conditions?: string;
  notes?: string;
  retestRequired?: boolean;
}

export interface MeasurementReading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: Date;
  location: string;
  operator: string;
  deviceId: string;
  isValid: boolean;
  notes?: string;
  alarmLimits?: {
    low?: number;
    high?: number;
    critical?: number;
  };
}

export interface CalibrationRecord {
  equipmentId: string;
  calibrationDate: Date;
  nextCalibration: Date;
  calibratedBy: string;
  certificate: string;
  accuracy: string;
  traceable: boolean;
  standard?: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
}

// =================== VALIDATION ET APPROBATIONS ===================
export interface ApprovalLevel {
  id: string;
  role: string;
  required: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  conditions?: string[];
  level: number;
  authority?: string;
}

export interface SignatureData {
  id: string;
  name: string;
  role: string;
  signature: string; // Base64 image
  timestamp: Date;
  title?: string;
  license?: string;
  witness?: boolean;
}

export interface ValidationStep {
  id: string;
  description: string;
  requirement: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  evidence?: string[];
  mandatory: boolean;
}

export interface InspectionRecord {
  id: string;
  inspectionType: string;
  inspectorName: string;
  inspectorLicense?: string;
  inspectionDate: Date;
  location: string;
  findings: InspectionFinding[];
  approved: boolean;
  conditions?: string[];
  certificateNumber?: string;
  nextInspection?: Date;
  notes?: string;
}

export interface InspectionFinding {
  id: string;
  category: string;
  severity: 'info' | 'minor' | 'major' | 'critical';
  description: string;
  location?: string;
  correctionRequired: boolean;
  correctionDeadline?: Date;
  correctedBy?: string;
  correctedAt?: Date;
  photos?: string[];
}

// =================== ÉVALUATIONS DES RISQUES ===================
export interface RiskAssessment {
  id: string;
  riskType: string;
  probability: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  severity: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  mitigationMeasures: string[];
  residualRisk: 'low' | 'medium' | 'high' | 'extreme';
  assessedBy: string;
  assessmentDate: Date;
  reviewDate?: Date;
  approved: boolean;
}

export interface HazardIdentification {
  id: string;
  hazardType: string;
  description: string;
  location: string;
  potentialConsequences: string[];
  affectedPersonnel: string[];
  controlMeasures: ControlMeasure[];
  residualRisk: 'low' | 'medium' | 'high' | 'extreme';
}

export interface ControlMeasure {
  id: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implemented: boolean;
  implementedBy?: string;
  implementedAt?: Date;
  verificationRequired: boolean;
}

// =================== COMMUNICATIONS ===================
export interface CommunicationPlan {
  primary: string;
  backup: string;
  emergencyProtocol: string;
  frequency?: string;
  callSigns?: Record<string, string>;
  testSchedule?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: number;
  available24h: boolean;
  location?: string;
  specializations?: string[];
}

// =================== MONITORING ===================
export interface MonitoringConfig {
  enabled: boolean;
  interval: number; // minutes
  parameters: string[];
  alertThresholds: Record<string, number>;
  devices: MonitoringDevice[];
  autoAlerts: boolean;
}

export interface MonitoringDevice {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  batteryLevel?: number;
  lastReading?: {
    timestamp: Date;
    values: Record<string, number>;
  };
  calibrationDue?: Date;
}

// =================== ALERTES ET NOTIFICATIONS ===================
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'emergency';
  title: { fr: string; en: string };
  message: { fr: string; en: string };
  timestamp: Date;
  source?: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  autoResolve: boolean;
  resolved?: boolean;
  resolvedAt?: Date;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
  vibration: boolean;
  recipients: string[];
}

// =================== DOCUMENTS ET RÉFÉRENCES ===================
export interface DocumentReference {
  id: string;
  type: 'standard' | 'regulation' | 'procedure' | 'drawing' | 'specification';
  title: string;
  version?: string;
  authority?: string;
  url?: string;
  mandatory: boolean;
  language: 'fr' | 'en' | 'both';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  category?: string;
}

// =================== STATUS ET WORKFLOW ===================
export type PermitStatus = 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'expired' | 'suspended' | 'cancelled';

export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  approvals?: ApprovalLevel[];
  conditions?: string[];
}

export interface StatusHistory {
  id: string;
  previousStatus: PermitStatus;
  newStatus: PermitStatus;
  changedBy: string;
  changedAt: Date;
  reason?: string;
  automaticChange: boolean;
}

// =================== CONFIGURATIONS PROVINCIALES ===================
export interface ProvincialRegulation {
  province: string;
  authority: string;
  regulations: DocumentReference[];
  standards: DocumentReference[];
  requiredLicenses: Record<string, string>;
  inspectionRequired: boolean;
  maxDurationDays?: number;
  renewalRequired?: boolean;
  specialRequirements?: string[];
}

// =================== EXPORTS (SANS CONFLIT) ===================
// Note: Tous les types sont déjà exportés individuellement ci-dessus
// Pas besoin de re-export groupé qui causerait des conflits d'export
