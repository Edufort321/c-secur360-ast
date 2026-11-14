// app/data/workTypes/electrical.ts
import { WorkType } from './template';

export const electricalMaintenance: WorkType = {
  id: 'electrical_maintenance',
  name: 'Maintenance électrique',
  category: 'Électricité',
  description: 'Maintenance préventive et corrective sur installations électriques',
  icon: '',
  baseHazards: [
    'ELEC-001', // Choc électrique
    'ELEC-002', // Arc électrique
    'ELEC-003', // Brûlures électriques
    'PHY-003',  // Chutes de hauteur
    'PHY-001'   // Brûlures thermiques
  ],
  requiredPermits: [
    'electrical-work',
    'lockout-tagout'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque classe E
    'ELC-001',   // Gants diélectriques
    'ELC-002',   // Chaussures diélectriques
    'ELC-003',   // Vérificateur absence tension
    'LUN-001'    // Lunettes sécurité
  ],
  certifications: [
    'Qualification électrique',
    'Formation CSA Z462',
    'Cadenassage LOTO',
    'Travail en hauteur (si applicable)'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 2,
    max: 12
  },
  weatherLimitations: {
    temperature: { min: -30, max: 40 },
    windSpeed: { max: 60 },
    precipitation: true // Pas de travail électrique sous la pluie
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const electricalInstallation: WorkType = {
  id: 'electrical_installation',
  name: 'Installation électrique',
  category: 'Électricité',
  description: 'Installation de nouveaux équipements et circuits électriques',
  icon: '',
  baseHazards: [
    'ELEC-001', // Choc électrique
    'ELEC-002', // Arc électrique
    'PHY-003',  // Chutes de hauteur
    'PHY-004',  // Coupures/lacérations
    'PHY-005'   // Heurt par objets
  ],
  requiredPermits: [
    'electrical-work',
    'construction',
    'municipal-permit'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque classe E
    'ELC-001',   // Gants diélectriques
    'ELC-002',   // Chaussures diélectriques
    'ELC-003',   // VAT
    'CHU-001',   // Harnais (si hauteur)
    'MAN-001'    // Gants travail
  ],
  certifications: [
    'Maître électricien',
    'Formation CSA Z462',
    'Travail en hauteur',
    'Utilisation échafaudages'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 4,
    max: 40
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

export const electricalInspection: WorkType = {
  id: 'electrical_inspection',
  name: 'Inspection électrique',
  category: 'Électricité',
  description: 'Inspection et tests d\'équipements électriques',
  icon: '',
  baseHazards: [
    'ELEC-001', // Choc électrique
    'ELEC-002', // Arc électrique
    'ENV-001'   // Espaces confinés (parfois)
  ],
  requiredPermits: [
    'electrical-inspection',
    'confined-space' // Si applicable
  ],
  requiredEquipment: [
    'CAS-001',   // Casque classe E
    'ELC-001',   // Gants diélectriques
    'ELC-003',   // VAT
    'DET-001',   // Détecteur gaz (si confiné)
    'LUN-001'    // Lunettes
  ],
  certifications: [
    'Inspecteur électrique qualifié',
    'Formation CSA Z462',
    'Espaces confinés (si applicable)'
  ],
  minimumTeamSize: 1,
  estimatedDuration: {
    min: 1,
    max: 8
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: true, // Parfois requis
    heightWork: false,
    gasDetection: true
  }
};

// Export de tous les types électriques
export const electricalWorkTypes = {
  maintenance: electricalMaintenance,
  installation: electricalInstallation,
  inspection: electricalInspection
};
