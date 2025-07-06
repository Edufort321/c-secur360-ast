// app/types/clients.ts

// =================== TYPES CLIENTS ===================
export interface ClientConfiguration {
  id: string;
  name: string;
  displayName?: string;
  logo: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  
  // Protocoles d'urgence
  emergencyProtocol: {
    fr: string;
    en: string;
  };
  
  // Documents et permis requis
  requiredDocuments: string[];
  requiredCertifications: string[];
  
  // Dangers spécifiques au client
  customHazards: string[];
  excludedHazards?: string[]; // Dangers à ne pas inclure
  
  // Informations de contact
  contactInfo: {
    emergency: string;
    supervisor: string;
    dispatch: string;
    safety?: string;
    technical?: string;
  };
  
  // Types de travaux autorisés
  workTypes: string[];
  restrictedWorkTypes?: string[];
  
  // Équipements obligatoires
  mandatoryEquipment: string[];
  recommendedEquipment?: string[];
  
  // Procédures spéciales
  specialProcedures?: {
    lockout: boolean;
    hotWork: boolean;
    confinedSpace: boolean;
    heightWork: boolean;
    gasDetection: boolean;
    rfSafety?: boolean;
    radiationSafety?: boolean;
  };
  
  // Restrictions et exigences
  restrictions?: {
    weather?: WeatherRestrictions;
    seasonal?: SeasonalRestrictions;
    timeOfDay?: TimeRestrictions;
    geographic?: GeographicRestrictions;
  };
  
  // Configurations spécifiques
  settings?: {
    minimumTeamSize?: number;
    maxRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
    requireSupervisorApproval?: boolean;
    autoArchiveDays?: number;
    language?: 'fr' | 'en' | 'both';
  };
  
  // Intégrations
  integrations?: {
    erp?: string;
    cms?: string;
    notification?: NotificationSettings;
    api?: ApiSettings;
  };
  
  // Métadonnées
  industry: string;
  region: string;
  timezone: string;
  isActive: boolean;
  createdDate: string;
  lastUpdated: string;
}

export interface WeatherRestrictions {
  temperature: {
    min: number;
    max: number;
  };
  windSpeed: {
    max: number;
  };
  precipitation: boolean; // true = arrêt sous la pluie
  visibility: {
    min: number; // km
  };
  lightning: boolean; // true = arrêt lors d'orages
  uvIndex?: {
    max: number;
  };
}

export interface SeasonalRestrictions {
  winterLimitations?: string[];
  summerLimitations?: string[];
  springLimitations?: string[];
  fallLimitations?: string[];
}

export interface TimeRestrictions {
  dayHours?: {
    start: string; // "07:00"
    end: string;   // "18:00"
  };
  nightWork?: {
    allowed: boolean;
    restrictions?: string[];
  };
  weekendWork?: {
    allowed: boolean;
    restrictions?: string[];
  };
  holidayWork?: {
    allowed: boolean;
    restrictions?: string[];
  };
}

export interface GeographicRestrictions {
  excludedZones?: string[];
  specialZones?: {
    zoneId: string;
    requirements: string[];
  }[];
  proximityRestrictions?: {
    schools?: number; // distance en mètres
    hospitals?: number;
    airports?: number;
    powerLines?: number;
  };
}

export interface NotificationSettings {
  email?: {
    enabled: boolean;
    templates?: Record<string, string>;
    recipients?: string[];
  };
  sms?: {
    enabled: boolean;
    provider?: string;
    numbers?: string[];
  };
  webhook?: {
    enabled: boolean;
    url?: string;
    events?: string[];
  };
  teams?: {
    enabled: boolean;
    webhookUrl?: string;
  };
  slack?: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
}

export interface ApiSettings {
  baseUrl?: string;
  apiKey?: string;
  version?: string;
  endpoints?: {
    ast?: string;
    team?: string;
    equipment?: string;
    notifications?: string;
  };
  rateLimit?: {
    requests: number;
    period: number; // en secondes
  };
}

// =================== TYPES UTILITAIRES CLIENTS ===================
export interface ClientStats {
  totalAST: number;
  activeAST: number;
  completedAST: number;
  archivedAST: number;
  averageCompletionTime: number; // en heures
  safetyIncidents: number;
  nearMisses: number;
  complianceScore: number; // 0-100
  lastActivity: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  role: 'primary' | 'emergency' | 'technical' | 'billing' | 'safety';
  isActive: boolean;
  permissions: string[];
}

export interface ClientLocation {
  id: string;
  clientId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'headquarters' | 'branch' | 'site' | 'warehouse' | 'facility';
  specialRequirements?: string[];
  emergencyInfo?: {
    evacuationPlan?: string;
    assemblyPoint?: string;
    emergencyContacts?: string[];
  };
  isActive: boolean;
}

export interface ClientBranding {
  clientId: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    text?: string;
    background?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
  customCss?: string;
  emailTemplate?: string;
  reportTemplate?: string;
}

export interface ClientTarification {
  clientId: string;
  model: 'fixed' | 'per-ast' | 'subscription' | 'custom';
  rates?: {
    baseRate?: number;
    perAST?: number;
    perUser?: number;
    premium?: number;
  };
  billing: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    currency: string;
    paymentMethod: string;
  };
  discounts?: {
    volume?: number;
    longTerm?: number;
    earlyBird?: number;
  };
}

// =================== TYPES DE DONNÉES SPÉCIALISÉES ===================
export interface HydroQuebecData {
  sectorId: string;
  voltageLevel: 'BT' | 'MT' | 'HT' | 'THT';
  lineNumber?: string;
  substationCode?: string;
  protectionZone?: string;
  specialAuthorizations?: string[];
}

export interface EnergirData {
  pipelineId: string;
  pressureLevel: 'BP' | 'MP' | 'HP';
  gasType: 'natural' | 'propane' | 'other';
  odorization: boolean;
  flowRate?: number;
  emergencyValveLocation?: string;
}

export interface TelecomData {
  networkType: '2G' | '3G' | '4G' | '5G' | 'fiber' | 'copper';
  frequency?: string;
  powerLevel?: number;
  rfExposureLimit?: number;
  antennaHeight?: number;
  coverageZone?: string;
}

// =================== TYPES D'EXPORT ===================
export type ClientId = string;
export type ClientIndustry = 'energy' | 'telecom' | 'construction' | 'manufacturing' | 'mining' | 'oil-gas' | 'transportation' | 'government' | 'other';
export type ClientSize = 'small' | 'medium' | 'large' | 'enterprise';
export type ClientRegion = 'quebec' | 'ontario' | 'alberta' | 'bc' | 'maritimes' | 'territories' | 'national' | 'international';

// =================== INTERFACES D'UTILISATION ===================
export interface ClientRegistry {
  [clientId: string]: ClientConfiguration;
}

export interface ClientService {
  getById: (id: string) => ClientConfiguration | null;
  getAll: () => ClientConfiguration[];
  getByIndustry: (industry: ClientIndustry) => ClientConfiguration[];
  add: (client: ClientConfiguration) => void;
  update: (id: string, updates: Partial<ClientConfiguration>) => void;
  remove: (id: string) => void;
  search: (query: string) => ClientConfiguration[];
}

export interface ClientValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
}

export interface ClientPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreateAST: boolean;
  canApproveAST: boolean;
  canArchiveAST: boolean;
  specialPermissions?: string[];
}
