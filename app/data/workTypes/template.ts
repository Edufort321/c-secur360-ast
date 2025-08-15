// app/data/workTypes/template.ts

export interface WorkType {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  baseHazards: string[]; // IDs des dangers de base
  requiredPermits: string[]; // Permis obligatoires
  requiredEquipment: string[]; // Équipements obligatoires
  certifications: string[]; // Certifications requises
  minimumTeamSize: number;
  estimatedDuration: {
    min: number; // en heures
    max: number; // en heures
  };
  seasonalRestrictions?: string[]; // Restrictions saisonnières
  weatherLimitations?: {
    temperature: { min: number; max: number };
    windSpeed: { max: number };
    precipitation: boolean; // true = pas de travail sous la pluie
  };
  specialProcedures?: {
    lockout: boolean;
    hotWork: boolean;
    confinedSpace: boolean;
    heightWork: boolean;
    gasDetection: boolean;
  };
}

// Template de base pour créer un nouveau type de travail
export const workTypeTemplate: WorkType = {
  id: 'nouveau-travail',
  name: 'Nouveau Type de Travail',
  category: 'Général',
  description: 'Description du type de travail',
  icon: '🔧',
  baseHazards: ['PHY-001'], // Au minimum un danger physique de base
  requiredPermits: ['general'],
  requiredEquipment: ['CAS-001', 'LUN-001'], // Casque et lunettes minimum
  certifications: ['Formation SST de base'],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 1,
    max: 8
  },
  specialProcedures: {
    lockout: false,
    hotWork: false,
    confinedSpace: false,
    heightWork: false,
    gasDetection: false
  }
};

// Fonction helper pour créer un nouveau type de travail
export const createNewWorkType = (overrides: Partial<WorkType>): WorkType => {
  return {
    ...workTypeTemplate,
    ...overrides
  };
};
