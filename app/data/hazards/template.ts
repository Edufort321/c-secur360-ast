// app/data/hazards/template.ts
import { Hazard } from '../../types/hazards';

// =================== FONCTION HELPER ===================
export const createNewHazard = (base: any): Hazard => {
  return {
    // Valeurs par défaut
    category: 'GENERAL' as any,
    severity: 'medium',
    likelihood: 'medium',
    riskLevel: 'medium',
    controlMeasures: [],
    requiredEquipment: [],
    regulatoryReferences: [],
    workTypes: [],
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    // Merge avec les propriétés passées
    ...base
  } as Hazard;
};

// =================== FONCTIONS UTILITAIRES ===================
export const getHazardSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getHazardSeverityLabel = (severity: string): string => {
  switch (severity) {
    case 'low': return 'Faible';
    case 'medium': return 'Moyen';
    case 'high': return 'Élevé';
    case 'critical': return 'Critique';
    default: return 'Non défini';
  }
};

export const calculateRiskLevel = (severity: string, likelihood: string): string => {
  const severityValue = { low: 1, medium: 2, high: 3, critical: 4 }[severity] || 2;
  const likelihoodValue = { low: 1, medium: 2, high: 3, critical: 4 }[likelihood] || 2;
  
  const riskScore = severityValue * likelihoodValue;
  
  if (riskScore <= 2) return 'low';
  if (riskScore <= 6) return 'medium';
  if (riskScore <= 12) return 'high';
  return 'critical';
};

export const validateHazardData = (hazard: any): boolean => {
  return !!(
    hazard.id &&
    hazard.name &&
    hazard.description &&
    hazard.category
  );
};

// =================== EXPORT DES TYPES ===================
export type { Hazard } from '../../types/hazards';
