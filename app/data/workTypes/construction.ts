// app/data/workTypes/construction.ts
import { WorkType } from './template';

export const generalConstruction: WorkType = {
  id: 'construction_general',
  name: 'Construction générale',
  category: 'Construction',
  description: 'Travaux de construction et rénovation générale',
  icon: '🏗️',
  baseHazards: [
    'PHY-003', // Chutes de hauteur
    'PHY-005', // Heurt par objets
    'PHY-004', // Coupures/lacérations
    'PHY-007', // Équipements lourds
    'BRUIT-001', // Bruit excessif
    'DUST-001'   // Poussières
  ],
  requiredPermits: [
    'construction',
    'municipal-permit',
    'height-work'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'LUN-001',   // Lunettes sécurité
    'VIS-001',   // Veste haute visibilité
    'CHA-001',   // Chaussures sécurité
    'MAN-001',   // Gants travail
    'AUD-001',   // Protection auditive
    'CHU-001'    // Harnais (si hauteur)
  ],
  certifications: [
    'Formation construction',
    'Travail en hauteur',
    'Utilisation échafaudages',
    'Opération équipement lourd'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 4,
    max: 200 // Projets peuvent être longs
  },
  seasonalRestrictions: [
    'Restrictions hivernales pour béton',
    'Conditions météo extrêmes'
  ],
  weatherLimitations: {
    temperature: { min: -25, max: 35 },
    windSpeed: { max: 50 },
    precipitation: true // Souvent arrêté sous la pluie
  },
  specialProcedures: {
    lockout: false,
    hotWork: false,
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const excavation: WorkType = {
  id: 'excavation',
  name: 'Excavation',
  category: 'Construction',
  description: 'Travaux d\'excavation et terrassement',
  icon: '⛏️',
  baseHazards: [
    'PHY-006', // Effondrement/cave-in
    'PHY-005', // Heurt par objets
    'PHY-007', // Équipements lourds
    'ELEC-004', // Services souterrains
    'GAZ-001', // Lignes de gaz
    'ENV-002'  // Contamination sol
  ],
  requiredPermits: [
    'excavation',
    'info-excavation',
    'environmental-clearance'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'VIS-001',   // Veste haute visibilité
    'CHA-001',   // Chaussures sécurité
    'DET-001',   // Détecteur gaz
    'EQU-002',   // Équipement excavation
    'COM-001'    // Communication radio
  ],
  certifications: [
    'Opérateur excavatrice',
    'Info-Excavation certifié',
    'Sécurité excavation',
    'Protection services souterrains'
  ],
  minimumTeamSize: 3, // Opérateur + surveillant + aide
  estimatedDuration: {
    min: 4,
    max: 80
  },
  specialProcedures: {
    lockout: true, // Pour équipements
    hotWork: false,
    confinedSpace: true, // Parfois dans tranchées
    heightWork: false,
    gasDetection: true // Détection obligatoire
  }
};

export const roofing: WorkType = {
  id: 'roofing',
  name: 'Couverture',
  category: 'Construction',
  description: 'Travaux de toiture et couverture',
  icon: '🏠',
  baseHazards: [
    'PHY-003', // Chutes de hauteur
    'METEO-001', // Exposition météo
    'CHAL-001', // Stress thermique
    'PHY-004', // Coupures/lacérations
    'GLISS-001' // Surfaces glissantes
  ],
  requiredPermits: [
    'height-work',
    'roofing-permit'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'CHU-001',   // Harnais complet
    'CHU-002',   // Longe absorption
    'CHU-003',   // Point ancrage
    'CHA-003',   // Chaussures antidérapantes
    'VET-004',   // Vêtements protection solaire
    'LUN-002'    // Lunettes solaires
  ],
  certifications: [
    'Travail en hauteur avancé',
    'Couvreur certifié',
    'Montage échafaudages',
    'Secours en hauteur'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 6,
    max: 120
  },
  seasonalRestrictions: [
    'Éviter mois d\'hiver',
    'Conditions givrantes dangereuses'
  ],
  weatherLimitations: {
    temperature: { min: -10, max: 30 }, // Limites strictes
    windSpeed: { max: 30 }, // Très important en hauteur
    precipitation: true // Interdit sous la pluie
  },
  specialProcedures: {
    lockout: false,
    hotWork: true, // Soudage parfois requis
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const demolition: WorkType = {
  id: 'demolition',
  name: 'Démolition',
  category: 'Construction',
  description: 'Travaux de démolition et déconstruction',
  icon: '🔨',
  baseHazards: [
    'PHY-005', // Heurt par objets
    'PHY-003', // Chutes de hauteur
    'BRUIT-001', // Bruit excessif
    'DUST-001', // Poussières
    'VIB-001', // Vibrations
    'STRUCT-001', // Effondrement structural
    'AMIANT-001' // Amiante (bâtiments anciens)
  ],
  requiredPermits: [
    'demolition',
    'environmental-assessment',
    'asbestos-survey',
    'noise-permit'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'RES-003',   // Masque P100
    'LUN-001',   // Lunettes sécurité
    'AUD-002',   // Protection auditive renforcée
    'VIS-001',   // Veste haute visibilité
    'CHA-001',   // Chaussures sécurité
    'VET-005'    // Vêtements jetables (amiante)
  ],
  certifications: [
    'Opérateur démolition',
    'Travailleur amiante',
    'Sécurité démolition',
    'Manipulation matières dangereuses'
  ],
  minimumTeamSize: 3,
  estimatedDuration: {
    min: 8,
    max: 160
  },
  specialProcedures: {
    lockout: true,
    hotWork: true, // Découpage
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

// Export de tous les types construction
export const constructionWorkTypes = {
  general: generalConstruction,
  excavation: excavation,
  roofing: roofing,
  demolition: demolition
};
