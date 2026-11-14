// app/data/workTypes/gas.ts
import { WorkType } from './template';

export const gasMaintenance: WorkType = {
  id: 'gas_maintenance',
  name: 'Maintenance gazière',
  category: 'Gaz & Pipeline',
  description: 'Maintenance sur réseaux de distribution de gaz naturel',
  icon: '',
  baseHazards: [
    'GAZ-001', // Fuite de gaz
    'GAZ-002', // Explosion
    'GAZ-003', // Asphyxie
    'FEU-001', // Incendie
    'PHY-006', // Excavation/effondrement
    'CHIM-001' // Exposition toxique
  ],
  requiredPermits: [
    'gas-work',
    'excavation',
    'hot-work',
    'confined-space'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'DET-001',   // Détecteur 4 gaz
    'DET-002',   // Détecteur gaz spécialisé
    'RES-001',   // Masque respiratoire
    'MAN-002',   // Gants anti-statiques
    'CHA-002',   // Chaussures anti-statiques
    'VET-003'    // Vêtements anti-statiques
  ],
  certifications: [
    'Technicien gazier qualifié',
    'Formation CSA Z662',
    'Détection de gaz',
    'Espaces confinés',
    'Sauvetage d\'urgence'
  ],
  minimumTeamSize: 3, // Minimum 3 pour surveillance gaz
  estimatedDuration: {
    min: 3,
    max: 16
  },
  seasonalRestrictions: [
    'Restrictions hivernales pour excavation'
  ],
  weatherLimitations: {
    temperature: { min: -35, max: 45 },
    windSpeed: { max: 40 }, // Important pour dispersion gaz
    precipitation: false // Possible sous la pluie avec précautions
  },
  specialProcedures: {
    lockout: true,
    hotWork: true,
    confinedSpace: true,
    heightWork: false,
    gasDetection: true
  }
};

export const pipelineInspection: WorkType = {
  id: 'pipeline_inspection',
  name: 'Inspection pipeline',
  category: 'Gaz & Pipeline',
  description: 'Inspection et contrôle d\'intégrité des pipelines',
  icon: '',
  baseHazards: [
    'GAZ-001', // Fuite de gaz
    'GAZ-003', // Asphyxie
    'ENV-001', // Espace confiné
    'PHY-006'  // Excavation
  ],
  requiredPermits: [
    'pipeline-inspection',
    'confined-space',
    'excavation'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'DET-001',   // Détecteur 4 gaz
    'RES-002',   // SCBA si requis
    'CHU-001',   // Harnais récupération
    'COM-001'    // Communication radio
  ],
  certifications: [
    'Inspecteur pipeline certifié',
    'Espaces confinés',
    'Sauvetage technique',
    'Utilisation équipements NDT'
  ],
  minimumTeamSize: 3,
  estimatedDuration: {
    min: 4,
    max: 12
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: true,
    heightWork: false,
    gasDetection: true
  }
};

export const gasInstallation: WorkType = {
  id: 'gas_installation',
  name: 'Installation gazière',
  category: 'Gaz & Pipeline',
  description: 'Installation de nouveaux équipements et raccordements gaz',
  icon: '',
  baseHazards: [
    'GAZ-001', // Fuite de gaz
    'GAZ-002', // Explosion
    'PHY-006', // Excavation/effondrement
    'PHY-007', // Équipements lourds
    'ELEC-004' // Services souterrains
  ],
  requiredPermits: [
    'gas-installation',
    'excavation',
    'construction',
    'municipal-permit'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'DET-001',   // Détecteur gaz
    'VIS-001',   // Veste haute visibilité
    'CHA-001',   // Chaussures sécurité
    'MAN-002',   // Gants spécialisés
    'EQU-001'    // Équipement excavation
  ],
  certifications: [
    'Installateur gaz certifié',
    'Opérateur équipement lourd',
    'Info-Excavation',
    'Soudage gaz (si applicable)'
  ],
  minimumTeamSize: 3,
  estimatedDuration: {
    min: 6,
    max: 40
  },
  specialProcedures: {
    lockout: true,
    hotWork: true,
    confinedSpace: false,
    heightWork: false,
    gasDetection: true
  }
};

// Export de tous les types gaziers
export const gasWorkTypes = {
  maintenance: gasMaintenance,
  inspection: pipelineInspection,
  installation: gasInstallation
};
