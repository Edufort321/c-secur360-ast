// app/data/hazards/biological.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'BIOLOGICAL' as any,
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

// =================== DANGERS BIOLOGIQUES ===================

export const infectiousAgents: Hazard = createNewHazard({
  id: 'infectious_biological_agents',
  name: 'Agents infectieux',
  category: 'BIOLOGICAL' as any,
  subcategory: 'infectious',
  displayName: {
    fr: 'Agents biologiques infectieux',
    en: 'Infectious biological agents'
  },
  description: 'Risque d\'infection par exposition à des micro-organismes pathogènes',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Élimination de la source de contamination',
    'Substitution par des agents moins dangereux'
  ],
  
  engineeringControls: [
    'Enceintes de confinement biologique',
    'Système de ventilation HEPA',
    'Surfaces facilement décontaminables',
    'Équipements de stérilisation'
  ],
  
  administrativeControls: [
    'Procédures de biosécurité strictes',
    'Formation sur les risques biologiques',
    'Surveillance médicale des travailleurs',
    'Protocoles de décontamination'
  ],
  
  controlMeasures: [
    'Utilisation d\'équipements de protection individuelle',
    'Vaccination préventive si disponible',
    'Décontamination régulière des surfaces',
    'Élimination sécuritaire des déchets biologiques'
  ],
  
  requiredEquipment: [
    'full_face_respirator_p100',
    'disposable_coveralls_tyvek',
    'nitrile_gloves_double_layer',
    'eye_protection_chemical_splash'
  ],
  
  emergencyProcedures: [
    'Décontamination immédiate',
    'Isolement personne exposée',
    'Notification autorités sanitaires',
    'Surveillance médicale prolongée'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Agents biologiques',
    'Loi sur la santé et sécurité du travail',
    'Règlement sur la qualité de l\'environnement de travail'
  ],
  
  workTypes: ['laboratory_work', 'healthcare', 'waste_management', 'emergency_response'],
  
  isActive: true
});

export const bloodbornePathogens: Hazard = createNewHazard({
  id: 'bloodborne_pathogens_exposure',
  name: 'Agents pathogènes à transmission sanguine',
  category: 'BIOLOGICAL' as any,
  subcategory: 'bloodborne',
  displayName: {
    fr: 'Pathogènes transmissibles par le sang',
    en: 'Bloodborne pathogens'
  },
  description: 'Risque de transmission d\'infections par contact avec le sang ou fluides corporels',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Précautions universelles',
    'Utilisation d\'équipements de protection',
    'Élimination sécuritaire des objets tranchants',
    'Décontamination immédiate des surfaces'
  ],
  
  requiredEquipment: [
    'nitrile_gloves_medical_grade',
    'face_shield_disposable',
    'protective_gown_fluid_resistant',
    'sharps_disposal_container'
  ],
  
  emergencyProcedures: [
    'Lavage immédiat en cas d\'exposition',
    'Notification superviseur immédiate',
    'Consultation médicale urgente',
    'Tests de dépistage appropriés'
  ] as any,
  
  regulatoryReferences: [
    'CSST - Agents biologiques',
    'Règlement sur la santé et sécurité dans les établissements de santé'
  ],
  
  workTypes: ['healthcare', 'emergency_response', 'laboratory_work'],
  
  isActive: true
});

export const mold: Hazard = createNewHazard({
  id: 'mold_spores_exposure',
  name: 'Exposition aux moisissures',
  category: 'BIOLOGICAL' as any,
  subcategory: 'fungal',
  displayName: {
    fr: 'Moisissures et spores fongiques',
    en: 'Mold and fungal spores'
  },
  description: 'Risque d\'allergies respiratoires et infections par inhalation de spores',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Contrôle de l\'humidité',
    'Ventilation adéquate',
    'Élimination des sources d\'humidité',
    'Nettoyage avec produits antifongiques'
  ],
  
  requiredEquipment: [
    'n95_respirator_disposable',
    'safety_goggles_vented',
    'disposable_gloves_nitrile',
    'protective_coveralls_disposable'
  ],
  
  emergencyProcedures: [
    'Évacuation zone contaminée',
    'Décontamination équipements',
    'Consultation médicale si symptômes',
    'Nettoyage professionnel requis'
  ] as any,
  
  regulatoryReferences: [
    'Guides INSPQ - Moisissures',
    'RSST - Qualité de l\'air intérieur'
  ],
  
  workTypes: ['construction', 'maintenance', 'environmental_cleanup'],
  
  isActive: true
});

export const animalExposure: Hazard = createNewHazard({
  id: 'animal_exposure_zoonotic',
  name: 'Exposition aux animaux (zoonoses)',
  category: 'BIOLOGICAL' as any,
  subcategory: 'zoonotic',
  displayName: {
    fr: 'Maladies zoonotiques',
    en: 'Zoonotic diseases'
  },
  description: 'Risque de transmission de maladies animales à l\'humain',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Vaccination des animaux',
    'Équipements de protection lors manipulation',
    'Hygiène des mains rigoureuse',
    'Surveillance santé des animaux'
  ],
  
  requiredEquipment: [
    'leather_gloves_animal_handling',
    'protective_clothing_washable',
    'eye_protection_impact_resistant',
    'first_aid_kit_animal_bite'
  ],
  
  emergencyProcedures: [
    'Nettoyage immédiat des morsures',
    'Consultation médicale urgente',
    'Signalement incident animal',
    'Quarantaine animal si nécessaire'
  ] as any,
  
  regulatoryReferences: [
    'Loi sur la protection sanitaire des animaux',
    'MAPAQ - Réglementation vétérinaire'
  ],
  
  workTypes: ['veterinary_work', 'agriculture', 'animal_research'],
  
  isActive: true
});

// =================== EXPORT DANGERS BIOLOGIQUES ===================
export const biologicalHazards = [
  infectiousAgents,
  bloodbornePathogens,
  mold,
  animalExposure
];

export const biologicalHazardsById = biologicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default biologicalHazards;
