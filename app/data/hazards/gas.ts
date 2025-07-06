// app/data/hazards/gas.ts
import { HazardData } from './template';

export const gasLeak: HazardData = {
  id: 'GAZ-001',
  code: 'GAZ-001',
  name: 'Fuite de gaz naturel',
  displayName: {
    fr: 'Fuite de gaz naturel',
    en: 'Natural gas leak'
  },
  description: 'Échappement non contrôlé de gaz naturel dans l\'environnement présentant risques d\'explosion et d\'asphyxie',
  category: 'gas',
  subcategory: 'leak',
  baseSeverity: 4,
  baseProbability: 2,
  riskLevel: 'critical',
  
  regulations: [
    'CSA Z662 - Code du gaz naturel et du propane',
    'RSST Article 280-285',
    'Règlement sur la sécurité des pipelines',
    'Code de sécurité du gaz naturel'
  ],
  standards: [
    'CSA B149.1',
    'CSA B149.2',
    'NFPA 54',
    'API 1160'
  ],
  complianceRequirements: [
    'Détection de gaz obligatoire',
    'Personnel qualifié requis',
    'Procédures d\'urgence documentées',
    'Équipement anti-statique'
  ],
  
  requiredEquipment: [
    'DET-001', // Détecteur 4 gaz
    'DET-002', // Détecteur gaz spécialisé
    'RES-001', // Appareil respiratoire
    'VET-003', // Vêtements anti-statiques
    'MAN-002', // Gants anti-statiques
    'CHA-002', // Chaussures anti-statiques
    'COM-001'  // Communication radio
  ],
  recommendedEquipment: [
    'VENT-001', // Ventilateur anti-déflagrant
    'BAR-001',  // Barrières de sécurité
    'EXT-001'   // Extincteurs appropriés
  ],
  
  symptoms: [
    'Odeur caractéristique (mercaptan)',
    'Maux de tête',
    'Nausées',
    'Vertiges',
    'Somnolence',
    'Asphyxie (forte concentration)',
    'Perte de conscience'
  ],
  
  earlyWarningSignals: [
    'Odeur de gaz persistante',
    'Sifflement ou bruit de fuite',
    'Végétation morte près pipeline',
    'Bulles dans eau/boue',
    'Terre soulevée sans raison',
    'Givrage sur conduites',
    'Détecteur en alarme'
  ],
  
  aggravatingFactors: [
    'Espaces confinés',
    'Ventilation insuffisante',
    'Sources d\'ignition présentes',
    'Accumulation en point bas',
    'Conditions météo défavorables',
    'Équipement défaillant',
    'Corrosion pipeline'
  ],
  
  environmentalFactors: [
    'Direction et vitesse vent',
    'Température ambiante',
    'Pression atmosphérique',
    'Humidité relative',
    'Topographie terrain',
    'Proximité bâtiments'
  ],
  
  preventionMeasures: [
    'Détection continue obligatoire',
    'Ventilation adéquate',
    'Élimination sources ignition',
    'Équipement anti-déflagrant',
    'Formation personnel spécialisée',
    'Inspection régulière équipements',
    'Maintenance préventive',
    'Procédures d\'urgence pratiquées',
    'Zone de sécurité établie'
  ],
  
  emergencyProcedures: [
    'Évacuation immédiate zone danger',
    'Élimination sources ignition',
    'Notification autorités (911, Énergir)',
    'Isolement source si sécuritaire',
    'Ventilation zone si possible',
    'Surveillance atmosphère continue',
    'Établissement périmètre sécurité',
    'Coordination services urgence',
    'Documentation incident',
    'Suivi médical exposés'
  ],
  
  specialData: {
    gasProperties: {
      density: 0.6, // par rapport à l'air
      autoIgnitionTemp: 537, // °C
      flammabilityLimits: {
        lower: 5.0, // % vol
        upper: 15.0
      },
      odorThreshold: 0.0001 // % vol (mercaptan)
    },
    detectionLevels: {
      action: 10, // % LIE
      evacuation: 20,
      lifeThreating: 50
    },
    distances: {
      initialIsolation: 100, // mètres
      protectiveAction: 800,
      ignitionSources: 300
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '2.2.0'
};

export const explosion: HazardData = {
  id: 'GAZ-002',
  code: 'GAZ-002',
  name: 'Explosion de gaz',
  description: 'Combustion rapide explosive d\'un mélange gaz-air dans limites d\'inflammabilité',
  category: 'gas',
  subcategory: 'explosion',
  baseSeverity: 5,
  baseProbability: 1,
  riskLevel: 'critical',
  
  regulations: [
    'CSA Z662',
    'NFPA 497',
    'Code du bâtiment - Zones dangereuses'
  ],
  
  requiredEquipment: [
    'DET-001', // Détection gaz
    'VET-008', // Vêtements ignifuges
    'CAS-002', // Casque anti-déflagrant
    'COM-002'  // Communication intrinsèquement sûre
  ],
  
  symptoms: [
    'Traumatismes par surpression',
    'Brûlures thermiques',
    'Lésions auditives',
    'Blessures par projectiles',
    'Traumatismes multiples'
  ],
  
  preventionMeasures: [
    'Contrôle fuites',
    'Ventilation continue',
    'Détection précoce',
    'Élimination ignition',
    'Classification zones',
    'Équipement certifié'
  ],
  
  emergencyProcedures: [
    'Évacuation massive immédiate',
    'Alerte services secours',
    'Soins traumatismes multiples',
    'Triages des blessés',
    'Investigation post-incident'
  ],
  
  specialData: {
    explosionEffects: {
      overpressure: '1-100 kPa selon distance',
      heatFlux: '4-150 kW/m²',
      fireballDiameter: 'calculé selon quantité',
      safeDistance: 'minimum 300m'
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '1.8.0'
};

export const asphyxiation: HazardData = {
  id: 'GAZ-003',
  code: 'GAZ-003',
  name: 'Asphyxie par gaz',
  description: 'Privation d\'oxygène causée par déplacement air par gaz inertes ou combustibles',
  category: 'gas',
  subcategory: 'asphyxiation',
  baseSeverity: 5,
  baseProbability: 2,
  riskLevel: 'critical',
  
  regulations: [
    'RSST Article 1-3 (espaces clos)',
    'CSA Z1006',
    'NIOSH Publication 87-113'
  ],
  
  requiredEquipment: [
    'DET-003', // Détecteur O2
    'RES-002', // SCBA
    'CHU-004', // Harnais récupération
    'COM-001'  // Communication constante
  ],
  
  symptoms: [
    'Essoufflement',
    'Maux de tête',
    'Confusion',
    'Coordination réduite',
    'Perte conscience',
    'Arrêt cardiaque'
  ],
  
  preventionMeasures: [
    'Surveillance O2 continue',
    'Ventilation forcée',
    'Système d\'alarme',
    'Personnel surveillance',
    'Équipement secours'
  ],
  
  emergencyProcedures: [
    'Sauvetage sans délai',
    'Ventilation assistée',
    'Réanimation si requis',
    'Transport urgence médicale',
    'Oxygénothérapie'
  ],
  
  specialData: {
    oxygenLevels: {
      normal: 20.9, // %
      deficient: 19.5,
      dangerous: 16.0,
      immediateDanger: 12.5,
      unconsciousness: 10.0
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '1.6.0'
};

export const hydrogenSulfide: HazardData = {
  id: 'GAZ-004',
  code: 'GAZ-004',
  name: 'Sulfure d\'hydrogène (H2S)',
  description: 'Exposition au gaz toxique H2S présent naturellement ou produit par décomposition',
  category: 'gas',
  subcategory: 'toxic',
  baseSeverity: 5,
  baseProbability: 2,
  riskLevel: 'critical',
  
  regulations: [
    'RSST Annexe I',
    'ACGIH TLV',
    'NIOSH REL'
  ],
  
  requiredEquipment: [
    'DET-004', // Détecteur H2S
    'RES-002', // SCBA obligatoire
    'VET-009', // Vêtements protection chimique
    'ALAR-001' // Alarme personnelle
  ],
  
  symptoms: [
    'Odeur œuf pourri (faibles doses)',
    'Irritation yeux/gorge',
    'Maux de tête',
    'Nausées',
    'Paralysie olfactive',
    'Œdème pulmonaire',
    'Coma',
    'Décès'
  ],
  
  aggravatingFactors: [
    'Espaces confinés',
    'Activité physique intense',
    'Ventilation insuffisante',
    'Concentrations variables',
    'Perte odorat (>100 ppm)'
  ],
  
  preventionMeasures: [
    'Détection continue H2S',
    'Ventilation mécanique',
    'SCBA obligatoire',
    'Surveillance médicale',
    'Formation spécialisée H2S',
    'Évacuation automatique'
  ],
  
  emergencyProcedures: [
    'Évacuation immédiate',
    'Air frais/oxygène',
    'Décontamination',
    'Soins respiratoires',
    'Transport médical urgent',
    'Surveillance 24-48h'
  ],
  
  specialData: {
    exposureLimits: {
      twa8h: 10,    // ppm ACGIH
      stel15min: 15, // ppm
      ceiling: 20,   // ppm
      idlh: 100     // ppm NIOSH
    },
    toxicEffects: {
      olfactory: 0.025,  // ppm - seuil odeur
      eyeIrritation: 10,
      respiratoryDistress: 50,
      unconsciousness: 500,
      death: 1000
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '2.0.0'
};

// Export de tous les dangers gaziers
export const gasHazards = {
  leak: gasLeak,
  explosion: explosion,
  asphyxiation: asphyxiation,
  h2s: hydrogenSulfide
};
