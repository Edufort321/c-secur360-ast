// app/data/workTypes/maintenance.ts
import { WorkType } from './template';

export const generalMaintenance: WorkType = {
  id: 'maintenance_general',
  name: 'Maintenance générale',
  category: 'Maintenance',
  description: 'Maintenance préventive et corrective générale',
  icon: '',
  baseHazards: [
    'PHY-001', // Brûlures/coupures
    'MECA-001', // Dangers mécaniques
    'LOTO-001', // Énergies dangereuses
    'CHIM-001', // Produits chimiques
    'BRUIT-001' // Bruit
  ],
  requiredPermits: [
    'maintenance-work',
    'lockout-tagout'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'LUN-001',   // Lunettes sécurité
    'MAN-001',   // Gants travail
    'CHA-001',   // Chaussures sécurité
    'AUD-001',   // Protection auditive
    'LOCK-001'   // Cadenas consignation
  ],
  certifications: [
    'Mécanicien industriel',
    'Cadenassage LOTO',
    'Manipulation produits chimiques',
    'Sécurité machines'
  ],
  minimumTeamSize: 1,
  estimatedDuration: {
    min: 1,
    max: 12
  },
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: false,
    heightWork: false,
    gasDetection: false
  }
};

export const mechanicalMaintenance: WorkType = {
  id: 'maintenance_mechanical',
  name: 'Maintenance mécanique',
  category: 'Maintenance',
  description: 'Maintenance d\'équipements mécaniques et machines',
  icon: '',
  baseHazards: [
    'MECA-001', // Dangers mécaniques
    'LOTO-001', // Énergies dangereuses
    'PHY-004', // Coupures/écrasement
    'HYDR-001', // Systèmes hydrauliques
    'PNEU-001', // Systèmes pneumatiques
    'VIB-001'   // Vibrations
  ],
  requiredPermits: [
    'mechanical-work',
    'lockout-tagout',
    'pressure-vessel'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque sécurité
    'LUN-001',   // Lunettes sécurité
    'MAN-002',   // Gants mécanicien
    'CHA-001',   // Chaussures sécurité
    'LOCK-001',  // Équipement LOTO
    'HYDR-001'   // Outils hydrauliques sécurisés
  ],
  certifications: [
    'Mécanicien industriel avancé',
    'Systèmes hydrauliques',
    'Systèmes pneumatiques',
    'Inspection équipements sous pression'
  ],
  minimumTeamSize: 2, // Sécurité pour gros équipements
  estimatedDuration: {
    min: 2,
    max: 16
  },
  specialProcedures: {
    lockout: true,
    hotWork: true, // Parfois soudage requis
    confinedSpace: true, // Accès intérieur machines
    heightWork: false,
    gasDetection: false
  }
};

export const hvacMaintenance: WorkType = {
  id: 'maintenance_hvac',
  name: 'Maintenance CVCA',
  category: 'Maintenance',
  description: 'Maintenance systèmes chauffage, ventilation et climatisation',
  icon: '',
  baseHazards: [
    'ELEC-001', // Choc électrique
    'REFR-001', // Fluides réfrigérants
    'PHY-003', // Chutes (toitures)
    'CHAL-001', // Stress thermique
    'FROID-001', // Exposition froid
    'CONF-001'  // Espaces confinés
  ],
  requiredPermits: [
    'hvac-work',
    'refrigerant-handling',
    'height-work',
    'confined-space'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'LUN-001',   // Lunettes
    'DET-002',   // Détecteur réfrigérants
    'RES-001',   // Masque respiratoire
    'CHU-001',   // Harnais (toitures)
    'THER-001'   // Vêtements thermiques
  ],
  certifications: [
    'Technicien CVCA certifié',
    'Manipulation réfrigérants',
    'Travail en hauteur',
    'Espaces confinés'
  ],
  minimumTeamSize: 2,
  estimatedDuration: {
    min: 2,
    max: 12
  },
  seasonalRestrictions: [
    'Pic demande été/hiver',
    'Conditions météo extrêmes'
  ],
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: true,
    heightWork: true,
    gasDetection: true // Détection réfrigérants
  }
};

export const plumbingMaintenance: WorkType = {
  id: 'maintenance_plumbing',
  name: 'Maintenance plomberie',
  category: 'Maintenance',
  description: 'Maintenance et réparation systèmes de plomberie',
  icon: '',
  baseHazards: [
    'CHIM-002', // Produits chimiques
    'BIO-001', // Agents biologiques
    'PHY-004', // Coupures
    'CONF-001', // Espaces confinés
    'INOND-001' // Risque inondation
  ],
  requiredPermits: [
    'plumbing-work',
    'confined-space',
    'chemical-work'
  ],
  requiredEquipment: [
    'CAS-001',   // Casque
    'LUN-001',   // Lunettes
    'MAN-003',   // Gants chimiques
    'VET-007',   // Vêtements étanches
    'RES-001',   // Masque
    'DET-001'    // Détecteur gaz
  ],
  certifications: [
    'Plombier certifié',
    'Manipulation produits chimiques',
    'Espaces confinés',
    'Sécurité biologique'
  ],
  minimumTeamSize: 1,
  estimatedDuration: {
    min: 1,
    max: 8
  },
  specialProcedures: {
    lockout: true, // Isolation eau/gaz
    hotWork: true, // Soudage parfois
    confinedSpace: true,
    heightWork: false,
    gasDetection: true
  }
};

export const paintingMaintenance: WorkType = {
  id: 'maintenance_painting',
  name: 'Peinture et finition',
  category: 'Maintenance',
  description: 'Travaux de peinture et finition de surfaces',
  icon: '',
  baseHazards: [
    'CHIM-001', // Vapeurs solvants
    'PHY-003', // Chutes (échafaudages)
    'RESP-001', // Problèmes respiratoires
    'PEAU-001', // Irritation cutanée
    'FEU-001'   // Inflammabilité solvants
  ],
  requiredPermits: [
    'painting-work',
    'chemical-work',
    'height-work'
  ],
  requiredEquipment: [
    'RES-002',   // Masque vapeurs organiques
    'LUN-001',   // Lunettes
    'MAN-003',   // Gants chimiques
    'VET-008',   // Combinaison jetable
    'CHU-001',   // Harnais (hauteur)
    'VENT-001'   // Ventilation forcée
  ],
  certifications: [
    'Peintre industriel',
    'Manipulation solvants',
    'Travail en hauteur',
    'Échafaudages'
  ],
  minimumTeamSize: 1,
  estimatedDuration: {
    min: 2,
    max: 20
  },
  seasonalRestrictions: [
    'Éviter haute humidité',
    'Températures extrêmes'
  ],
  weatherLimitations: {
    temperature: { min: 5, max: 35 },
    windSpeed: { max: 20 }, // Éviter dispersion
    precipitation: true // Interdit sous la pluie
  },
  specialProcedures: {
    lockout: false,
    hotWork: false, // Risque avec solvants
    confinedSpace: false,
    heightWork: true,
    gasDetection: false
  }
};

// Export de tous les types maintenance
export const maintenanceWorkTypes = {
  general: generalMaintenance,
  mechanical: mechanicalMaintenance,
  hvac: hvacMaintenance,
  plumbing: plumbingMaintenance,
  painting: paintingMaintenance
};
