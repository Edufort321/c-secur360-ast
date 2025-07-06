// app/data/workTypes/telecom.ts
import { WorkType } from './template';

export const telecomInstallation: WorkType = {
  id: 'telecom_installation',
  name: 'Installation télécom',
  category: 'Télécommunications',
  description: 'Installation d\'équipements de télécommunication',
  icon: '📡',
  baseHazards: [
    'PHY-003', // Chutes de hauteur
    'ELEC-001', // Choc électrique
    'EM-001', // Champs électromagnétiques
    'METEO-001', // Exposition météo
    'PHY-004' // Coupures/lacérations
  ],
  requiredPermits: [
    'telecom-permit',
    'height-work',
    'rf-safety'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'CHU-001',   // Harnais hauteur
    'LUN-001',   // Lunettes sécurité
    'EM-001',    // Détecteur champs EM
    'COM-001',   // Radio communication
    'CHA-001'    // Chaussures sécurité
  ],
  certifications: [
    'Installateur télécom certifié',
    'Travail en hauteur',
    'Sécurité RF/hyperfréquences',
    'Escalade structures'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 4,
    max: 24
  },
  weatherLimitations: {
    temperature: { min: -30, max: 40 },
    windSpeed: { max: 40 }, // Important pour antennes
    precipitation: true // Éviter par temps de pluie
  },
  specialProcedures: {
    lockout: true, // Équipements électriques
    hotWork: false,
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const fiberOptic: WorkType = {
  id: 'fiber_optic',
  name: 'Fibre optique',
  category: 'Télécommunications',
  description: 'Installation et maintenance de fibre optique',
  icon: '💡',
  baseHazards: [
    'OPT-001', // Rayonnement laser
    'PHY-004', // Coupures/lacérations
    'CHIM-002', // Produits chimiques (nettoyage)
    'PHY-003', // Chutes (accès)
    'CONF-001' // Espaces confinés (conduits)
  ],
  requiredPermits: [
    'fiber-optic-work',
    'confined-space',
    'excavation'
  ],
  requiredEquipment: [
    'OPT-001',   // Lunettes laser
    'MAN-004',   // Gants anti-coupure fibre
    'LUN-001',   // Lunettes sécurité
    'RES-001',   // Masque particules
    'CAS-001',   // Casque
    'DET-001'    // Détecteur gaz (si confiné)
  ],
  certifications: [
    'Technicien fibre optique',
    'Sécurité laser',
    'Espaces confinés',
    'Soudure fibre optique'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 2,
    max: 16
  },
  specialProcedures: {
    lockout: false,
    hotWork: false,
    confinedSpace: true, // Parfois dans conduits
    heightWork: false,
    gasDetection: true // Si espaces confinés
  }
};

export const antennaWork: WorkType = {
  id: 'antenna_work',
  name: 'Travaux d\'antennes',
  category: 'Télécommunications',
  description: 'Installation et maintenance d\'antennes de télécommunication',
  icon: '📶',
  baseHazards: [
    'PHY-003', // Chutes de hauteur
    'EM-001', // Rayonnement RF intense
    'METEO-001', // Exposition météo extrême
    'ELEC-001', // Choc électrique
    'FOUDRE-001' // Risque foudre
  ],
  requiredPermits: [
    'antenna-work',
    'height-work',
    'rf-exposure-control'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'CHU-001',   // Harnais spécialisé
    'CHU-004',   // Équipement rescue
    'EM-001',    // Moniteur RF
    'FOUD-001',  // Détecteur foudre
    'COM-002',   // Radio urgence
    'VET-006'    // Vêtements RF
  ],
  certifications: [
    'Grimpeur antennes certifié',
    'Sécurité hyperfréquences',
    'Secours en hauteur',
    'Travail sur tours'
  ],
  minimumTeamSize: 3, // Grimpeur + surveillant + secours
  estimatedDuration: {
    min: 4,
    max: 12
  },
  seasonalRestrictions: [
    'Éviter saison orages',
    'Conditions givrantes extrêmes'
  ],
  weatherLimitations: {
    temperature: { min: -35, max: 35 },
    windSpeed: { max: 25 }, // Très strict pour tours
    precipitation: true // Interdit par temps d\'orage
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const cableInstallation: WorkType = {
  id: 'cable_installation',
  name: 'Installation câblage',
  category: 'Télécommunications',
  description: 'Installation de câblage et infrastructure télécom',
  icon: '🔌',
  baseHazards: [
    'ELEC-001', // Choc électrique
    'PHY-003', // Chutes (échelles)
    'PHY-004', // Coupures
    'CONF-001', // Espaces confinés
    'ERGO-001' // Troubles musculo-squelettiques
  ],
  requiredPermits: [
    'electrical-work',
    'confined-space',
    'building-access'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'LUN-001',   // Lunettes
    'MAN-001',   // Gants électriciens
    'CHA-002',   // Chaussures diélectriques
    'TOOL-001',  // Outils isolés
    'DET-001'    // Détecteur gaz
  ],
  certifications: [
    'Électricien télécom',
    'Espaces confinés',
    'Câblage structuré',
    'Normes télécommunications'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 3,
    max: 20
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: true,
    heightWork: false,
    gasDetection: true
  }
};

// Export de tous les types télécom
export const telecomWorkTypes = {
  installation: telecomInstallation,
  fiberOptic: fiberOptic,
  antenna: antennaWork,
  cable: cableInstallation
};
