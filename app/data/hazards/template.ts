// app/data/hazards/template.ts

export interface HazardData {
  id: string;
  code: string;
  name: string;
  displayName?: { fr: string; en: string };
  description: string;
  category: HazardCategory;
  subcategory?: string;
  
  // Classification de risque
  baseSeverity: number; // 1-5
  baseProbability: number; // 1-5
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Réglementations et standards
  regulations: string[];
  standards?: string[];
  complianceRequirements?: string[];
  
  // Équipements requis pour ce danger
  requiredEquipment: string[];
  recommendedEquipment?: string[];
  
  // Signes et symptômes
  symptoms?: string[];
  earlyWarningSignals?: string[];
  
  // Conditions aggravantes
  aggravatingFactors?: string[];
  environmentalFactors?: string[];
  
  // Prévention
  preventionMeasures: string[];
  emergencyProcedures: string[];
  
  // Données spécialisées selon le type
  specialData?: Record<string, any>;
  
  // Métadonnées
  isActive: boolean;
  lastUpdated: string;
  version: string;
}

export type HazardCategory = 
  | 'electrical'
  | 'gas'
  | 'physical'
  | 'biological'
  | 'ergonomic'
  | 'environmental'
  | 'chemical'
  | 'radiation'
  | 'fire-explosion'
  | 'mechanical';

// Template de base pour créer un nouveau danger
export const hazardTemplate: HazardData = {
  id: 'new-hazard',
  code: 'NEW-001',
  name: 'Nouveau Danger',
  description: 'Description du nouveau danger',
  category: 'physical',
  baseSeverity: 3,
  baseProbability: 3,
  riskLevel: 'medium',
  regulations: ['RSST'],
  requiredEquipment: ['CAS-001'], // Casque minimum
  preventionMeasures: ['Formation appropriée', 'Utilisation EPI'],
  emergencyProcedures: ['Premiers secours', 'Évacuation si nécessaire'],
  isActive: true,
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// Fonction helper pour créer un nouveau danger
export const createNewHazard = (overrides: Partial<HazardData>): HazardData => {
  return {
    ...hazardTemplate,
    ...overrides,
    id: overrides.id || `hazard-${Date.now()}`,
    lastUpdated: new Date().toISOString()
  };
};

// Fonction pour calculer le score de risque
export const calculateRiskScore = (severity: number, probability: number): number => {
  return severity * probability;
};

// Fonction pour déterminer le niveau de risque
export const getRiskLevel = (riskScore: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (riskScore >= 20) return 'critical';
  if (riskScore >= 15) return 'high';
  if (riskScore >= 8) return 'medium';
  return 'low';
};

// Mapping des catégories vers des icônes
export const hazardCategoryIcons: Record<HazardCategory, string> = {
  electrical: '⚡',
  gas: '🔥',
  physical: '⚠️',
  biological: '🦠',
  ergonomic: '🏃',
  environmental: '🌡️',
  chemical: '🧪',
  radiation: '☢️',
  'fire-explosion': '💥',
  mechanical: '⚙️'
};

// Couleurs par niveau de risque
export const riskLevelColors = {
  low: '#10b981',      // Vert
  medium: '#f59e0b',   // Orange
  high: '#ef4444',     // Rouge
  critical: '#7c2d12'  // Rouge foncé
};

// Équipements de base par catégorie de danger
export const defaultEquipmentByCategory: Record<HazardCategory, string[]> = {
  electrical: ['CAS-001', 'ELC-001', 'ELC-002', 'ELC-003'],
  gas: ['CAS-001', 'DET-001', 'RES-001', 'VET-003'],
  physical: ['CAS-001', 'LUN-001', 'CHA-001', 'MAN-001'],
  biological: ['RES-002', 'MAN-003', 'VET-005', 'DES-001'],
  ergonomic: ['CHA-001', 'SUP-001', 'COR-001'],
  environmental: ['VET-004', 'LUN-002', 'CRE-001'],
  chemical: ['RES-001', 'MAN-003', 'VET-005', 'DOU-001'],
  radiation: ['DOS-001', 'VET-006', 'DET-003'],
  'fire-explosion': ['VET-007', 'RES-001', 'EXT-001'],
  mechanical: ['CAS-001', 'LUN-001', 'MAN-002', 'AUD-001']
};
