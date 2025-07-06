// app/data/hazards/electrical.ts
import { HazardData } from './template';

export const electricalShock: HazardData = {
  id: 'ELEC-001',
  code: 'ELEC-001',
  name: 'Choc électrique',
  displayName: {
    fr: 'Choc électrique',
    en: 'Electrical shock'
  },
  description: 'Contact direct ou indirect avec des parties sous tension pouvant causer des blessures graves ou la mort',
  category: 'electrical',
  subcategory: 'contact',
  baseSeverity: 5,
  baseProbability: 3,
  riskLevel: 'critical',
  
  regulations: [
    'RSST Article 185-186',
    'CSA Z462',
    'Code électrique canadien CE',
    'NFPA 70E'
  ],
  standards: [
    'IEEE 1584',
    'ASTM F1506',
    'IEC 61482'
  ],
  complianceRequirements: [
    'Formation électrique qualifiée',
    'Analyse des dangers électriques',
    'Procédures de travail sécuritaires'
  ],
  
  requiredEquipment: [
    'CAS-001', // Casque classe E
    'ELC-001', // Gants isolants
    'ELC-002', // Chaussures diélectriques
    'ELC-003', // Vérificateur absence tension
    'LUN-001'  // Lunettes sécurité
  ],
  recommendedEquipment: [
    'ELC-004', // Tapis isolant
    'ELC-005', // Perche isolante
    'ELC-006'  // Écran de protection
  ],
  
  symptoms: [
    'Brûlures aux points de contact',
    'Douleur musculaire',
    'Perte de conscience',
    'Arrêt cardiaque',
    'Arrêt respiratoire',
    'Paralysie temporaire',
    'Confusion mentale'
  ],
  
  earlyWarningSignals: [
    'Étincelles visibles',
    'Odeur de brûlé',
    'Bruit anormal (grésillements)',
    'Chaleur excessive',
    'Vibrations anormales',
    'Disjoncteurs qui sautent fréquemment'
  ],
  
  aggravatingFactors: [
    'Humidité élevée',
    'Surfaces mouillées',
    'Transpiration excessive',
    'Bijoux métalliques',
    'Équipements endommagés',
    'Isolation défectueuse',
    'Mise à la terre inadéquate'
  ],
  
  environmentalFactors: [
    'Conditions météorologiques défavorables',
    'Température extrême',
    'Présence de vapeur d\'eau',
    'Atmosphère corrosive',
    'Vibrations mécaniques'
  ],
  
  preventionMeasures: [
    'Mise hors tension avant intervention',
    'Vérification absence de tension',
    'Cadenassage/étiquetage (LOTO)',
    'Utilisation EPI appropriés',
    'Formation du personnel',
    'Respect des distances sécuritaires',
    'Inspection des équipements',
    'Maintien des espaces de travail secs'
  ],
  
  emergencyProcedures: [
    'Couper l\'alimentation si sécuritaire',
    'NE PAS toucher la victime directement',
    'Utiliser matériau isolant pour séparer',
    'Appeler les secours (911)',
    'Vérifier les signes vitaux',
    'RCR si nécessaire',
    'Traiter les brûlures',
    'Transport d\'urgence même si conscient'
  ],
  
  specialData: {
    voltageThresholds: {
      safe: 50, // V AC / 120 V DC
      dangerous: 1000,
      highVoltage: 1000
    },
    currentEffects: {
      perception: 1, // mA
      muscularControl: 5,
      pain: 10,
      muscularParalysis: 20,
      respiratoryParalysis: 50,
      ventricularFibrillation: 100
    },
    bodyResistance: {
      dry: 100000, // ohms
      wet: 1000,
      internal: 500
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '2.1.0'
};

export const arcFlash: HazardData = {
  id: 'ELEC-002',
  code: 'ELEC-002',
  name: 'Arc électrique',
  displayName: {
    fr: 'Arc électrique',
    en: 'Arc flash'
  },
  description: 'Décharge électrique dans l\'air entre conducteurs causant chaleur intense, lumière aveuglante et explosion',
  category: 'electrical',
  subcategory: 'arc',
  baseSeverity: 5,
  baseProbability: 2,
  riskLevel: 'critical',
  
  regulations: [
    'CSA Z462 Section 4.3',
    'NFPA 70E Article 130',
    'RSST Article 185'
  ],
  standards: [
    'IEEE 1584-2018',
    'ASTM F1506',
    'ASTM F2178'
  ],
  
  requiredEquipment: [
    'ELC-007', // Vêtements résistants arc
    'ELC-008', // Cagoule arc
    'ELC-001', // Gants isolants avec surgants
    'ELC-002', // Chaussures diélectriques
    'ELC-009'  // Sous-vêtements ignifuges
  ],
  
  symptoms: [
    'Brûlures de 2e et 3e degré',
    'Lésions oculaires permanentes',
    'Perte auditive',
    'Inhalation de vapeurs toxiques',
    'Blessures par explosion',
    'Traumatisme psychologique'
  ],
  
  earlyWarningSignals: [
    'Surcharge du système',
    'Court-circuit imminent',
    'Équipement surchauffé',
    'Isolation dégradée',
    'Contacts défaillants',
    'Maintenance insuffisante'
  ],
  
  aggravatingFactors: [
    'Courant de court-circuit élevé',
    'Temps de coupure long',
    'Distance rapprochée',
    'Espace confiné',
    'Équipement vieillissant',
    'Procédures inadéquates'
  ],
  
  preventionMeasures: [
    'Travail hors tension prioritaire',
    'Analyse d\'arc électrique',
    'EPI résistants à l\'arc appropriés',
    'Outils isolants',
    'Procédures de travail sécuritaires',
    'Formation spécialisée arc électrique',
    'Maintenance préventive',
    'Dispositifs de protection modernes'
  ],
  
  emergencyProcedures: [
    'Évacuation immédiate de la zone',
    'Coupure d\'urgence si possible',
    'Appel secours spécialisés',
    'Premiers soins brûlures',
    'Irrigation yeux si exposition',
    'Surveillance médicale prolongée',
    'Documentation incident',
    'Investigation cause racine'
  ],
  
  specialData: {
    energyLevels: {
      category1: 4,    // cal/cm²
      category2: 8,
      category3: 25,
      category4: 40
    },
    boundaries: {
      arcFlashBoundary: 'calculated', // distance calculée
      limitedApproach: 1.0,          // mètres
      restrictedApproach: 0.3,
      prohibitedApproach: 0.03
    },
    temperature: {
      arc: 19000, // °C (plus chaud que surface soleil)
      copper: 1083 // °C point fusion
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '2.0.0'
};

export const electricalBurns: HazardData = {
  id: 'ELEC-003',
  code: 'ELEC-003',
  name: 'Brûlures électriques',
  description: 'Lésions tissulaires causées par le passage du courant électrique ou l\'exposition à un arc',
  category: 'electrical',
  subcategory: 'thermal',
  baseSeverity: 4,
  baseProbability: 3,
  riskLevel: 'high',
  
  regulations: [
    'RSST Article 185',
    'CSA Z462'
  ],
  
  requiredEquipment: [
    'ELC-001', // Gants isolants
    'ELC-007', // Vêtements résistants
    'LUN-001', // Protection oculaire
    'CAS-001'  // Casque
  ],
  
  symptoms: [
    'Brûlures aux points d\'entrée/sortie',
    'Dommages tissulaires internes',
    'Nécroses',
    'Complications cardiovasculaires',
    'Infections secondaires'
  ],
  
  preventionMeasures: [
    'Isolation électrique appropriée',
    'EPI résistants thermiques',
    'Procédures sécuritaires',
    'Formation personnel'
  ],
  
  emergencyProcedures: [
    'Soins immédiats brûlures',
    'Transport médical urgent',
    'Surveillance complications',
    'Suivi médical prolongé'
  ],
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '1.5.0'
};

export const electromagneticFields: HazardData = {
  id: 'ELEC-004',
  code: 'ELEC-004',
  name: 'Champs électromagnétiques',
  description: 'Exposition aux rayonnements électromagnétiques non-ionisants',
  category: 'electrical',
  subcategory: 'radiation',
  baseSeverity: 2,
  baseProbability: 3,
  riskLevel: 'medium',
  
  regulations: [
    'Santé Canada Code 6',
    'IEEE C95.1',
    'ICNIRP Guidelines'
  ],
  
  requiredEquipment: [
    'EM-001', // Détecteur champs EM
    'VET-006'  // Vêtements protection RF
  ],
  
  symptoms: [
    'Maux de tête',
    'Fatigue',
    'Troubles concentration',
    'Échauffement tissulaire'
  ],
  
  preventionMeasures: [
    'Mesure exposition',
    'Respect limites réglementaires',
    'Blindage si nécessaire',
    'Limitation temps exposition'
  ],
  
  emergencyProcedures: [
    'Éloignement source',
    'Évaluation médicale',
    'Surveillance symptômes'
  ],
  
  specialData: {
    frequencyBands: {
      elf: '0-300 Hz',      // Extremely Low Frequency
      rf: '300 kHz-300 GHz', // Radio Frequency
      microwave: '300 MHz-300 GHz'
    },
    exposureLimits: {
      occupational: 'Selon IEEE C95.1',
      publicGeneral: 'Selon Code 6 SC'
    }
  },
  
  isActive: true,
  lastUpdated: '2024-01-15T10:00:00Z',
  version: '1.3.0'
};

// Export de tous les dangers électriques
export const electricalHazards = {
  shock: electricalShock,
  arcFlash: arcFlash,
  burns: electricalBurns,
  electromagnetic: electromagneticFields
};
