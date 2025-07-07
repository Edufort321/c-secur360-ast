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
  severity: 'critical',
  probability: 3,
  
  eliminationMethods: [
    'Éviter zones contaminées',
    'Décontamination préalable',
    'Méthodes à distance'
  ],
  
  substitutionOptions: [
    'Échantillonnage vs contact direct',
    'Analyses in-situ',
    'Détection à distance'
  ],
  
  engineeringControls: [
    'Ventilation avec filtration HEPA',
    'Enceintes de biosécurité',
    'Systèmes de décontamination',
    'UV-C stérilisation',
    'Pressure négative'
  ],
  
  administrativeControls: [
    'Évaluation risque biologique',
    'Vaccination appropriée',
    'Surveillance médicale',
    'Protocoles décontamination',
    'Formation biosécurité'
  ],
  
  ppeRequirements: [
    'Combinaison étanche ou respirateur',
    'Gants nitrile doubles',
    'Protection oculaire étanche',
    'Couvre-chaussures jetables'
  ],
  
  requiredEquipment: [
    'biological_safety_suit',
    'hepa_respirator',
    'disinfection_kit',
    'biohazard_containers'
  ],
  
  recommendedEquipment: [
    'uv_sterilizer',
    'biological_indicator_tests',
    'autoclave_portable'
  ],
  
  regulations: {
    csa: ['CSA Z317.10'],
    rsst: ['Règlement agents biologiques'],
    other: ['Loi sur la quarantaine', 'Agence de santé publique Canada']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 20,
      unit: 'km/h',
      description: 'Dispersion aérosols biologiques'
    },
    {
      condition: 'temperature',
      operator: '>',
      value: 35,
      unit: '°C',
      description: 'Stress thermique avec EPI complet'
    }
  ],
  
  requiredTraining: [
    'Biosécurité niveau approprié',
    'Procédures décontamination',
    'Gestion déchets biomédicaux',
    'Premiers secours infectieux'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Avant chaque exposition',
  
  emergencyProcedures: [
    'Décontamination immédiate',
    'Isolement personne exposée',
    'Notification autorités sanitaires',
    'Surveillance médicale prolongée',
    'Traitement prophylactique si indiqué'
  ],
  
  firstAidMeasures: [
    'Décontamination externe complète',
    'Rinçage abondant plaies',
    'Surveillance signes infection',
    'Prélèvements pour analyses'
  ],
  
  tags: ['biosecurite', 'vaccination', 'decontamination', 'surveillance_medicale']
});

export const moldFungalSpores: Hazard = createNewHazard({
  id: 'mold_fungal_contamination',
  name: 'Moisissures et spores',
  category: 'biological',
  subcategory: 'fungal',
  displayName: {
    fr: 'Contamination moisissures et spores',
    en: 'Mold and fungal spore contamination'
  },
  description: 'Risque d\'allergies, asthme ou infections par inhalation de spores',
  severity: 3,
  probability: 4,
  
  eliminationMethods: [
    'Décontamination préalable',
    'Assèchement complet',
    'Évitement zones humides'
  ],
  
  substitutionOptions: [
    'Méthodes sèches vs humides',
    'Biocides appropriés',
    'Encapsulation vs enlèvement'
  ],
  
  engineeringControls: [
    'Ventilation d\'extraction',
    'Contrôle humidité <60%',
    'Filtration air HEPA',
    'Enceintes sous pression négative'
  ],
  
  administrativeControls: [
    'Évaluation contamination préalable',
    'Limitation temps exposition',
    'Surveillance symptômes',
    'Rotation personnel sensible'
  ],
  
  ppeRequirements: [
    'Respirateur N95 minimum',
    'Gants jetables',
    'Vêtements jetables',
    'Protection oculaire'
  ],
  
  requiredEquipment: [
    'n95_respirator',
    'moisture_meter',
    'hepa_vacuum',
    'mold_test_kit'
  ],
  
  regulations: {
    csa: ['CSA Z317.13'],
    rsst: ['Qualité air intérieur'],
    other: ['Guidelines santé Canada']
  },
  
  weatherRestrictions: [
    {
      condition: 'humidity',
      operator: '>',
      value: 70,
      unit: '%',
      description: 'Favorise croissance moisissures'
    }
  ],
  
  requiredTraining: [
    'Reconnaissance moisissures',
    'Techniques décontamination',
    'Protection respiratoire'
  ],
  
  emergencyProcedures: [
    'Évacuation zone contaminée',
    'Décontamination personnelle',
    'Surveillance détresse respiratoire'
  ],
  
  tags: ['moisissures', 'allergies', 'humidite', 'n95_minimum']
});

export const animalWaste: Hazard = createNewHazard({
  id: 'animal_waste_pathogens',
  name: 'Déjections animales',
  category: 'biological',
  subcategory: 'animal_derived',
  displayName: {
    fr: 'Pathogènes déjections animales',
    en: 'Animal waste pathogens'
  },
  description: 'Risque d\'infections gastro-intestinales et parasitaires',
  severity: 3,
  probability: 3,
  
  eliminationMethods: [
    'Nettoyage préalable zones',
    'Évitement contact direct',
    'Désinfection professionnelle'
  ],
  
  engineeringControls: [
    'Ventilation zones confinées',
    'Barrières physiques',
    'Systèmes de lavage'
  ],
  
  administrativeControls: [
    'Vaccination hépatite A/B',
    'Hygiène stricte',
    'Surveillance médicale',
    'Protocoles décontamination'
  ],
  
  ppeRequirements: [
    'Gants nitrile résistants',
    'Combinaison jetable',
    'Bottes étanches',
    'Protection respiratoire'
  ],
  
  requiredEquipment: [
    'waterproof_gloves',
    'disposable_coveralls',
    'rubber_boots',
    'disinfectant_solution'
  ],
  
  regulations: {
    csa: ['CSA Z317.10'],
    rsst: ['Hygiène workplace'],
    other: ['Santé publique provinciale']
  },
  
  requiredTraining: [
    'Hygiène et assainissement',
    'Prévention infections',
    'Premiers secours gastro'
  ],
  
  emergencyProcedures: [
    'Décontamination immédiate',
    'Lavage antiseptique prolongé',
    'Surveillance symptômes gastro'
  ],
  
  tags: ['dejections', 'gastro', 'vaccination', 'hygiene_stricte']
});

export const bloodBornePathogens: Hazard = createNewHazard({
  id: 'bloodborne_pathogen_exposure',
  name: 'Pathogènes sanguins',
  category: 'biological',
  subcategory: 'bloodborne',
  displayName: {
    fr: 'Exposition pathogènes sanguins',
    en: 'Bloodborne pathogen exposure'
  },
  description: 'Risque de transmission VIH, hépatites B/C par contact sanguin',
  severity: 5,
  probability: 2,
  
  eliminationMethods: [
    'Éviter zones contaminées',
    'Nettoyage professionnel préalable',
    'Méthodes sans contact'
  ],
  
  engineeringControls: [
    'Dispositifs sécurisés piquants',
    'Contenants objets tranchants',
    'Systèmes sans aiguilles',
    'Barrières protection'
  ],
  
  administrativeControls: [
    'Vaccination hépatite B obligatoire',
    'Protocoles exposition',
    'Surveillance médicale post-exposition',
    'Formation pathogènes sanguins'
  ],
  
  ppeRequirements: [
    'Gants résistants perforation',
    'Protection oculaire étanche',
    'Masque chirurgical minimum',
    'Vêtements imperméables'
  ],
  
  requiredEquipment: [
    'puncture_resistant_gloves',
    'sharps_container',
    'cpr_face_shield',
    'bloodborne_spill_kit'
  ],
  
  regulations: {
    csa: ['CSA Z317.10'],
    rsst: ['Exposition sang/liquides'],
    other: ['Santé Canada - Pathogènes sanguins']
  },
  
  requiredTraining: [
    'Pathogènes sanguins',
    'Précautions universelles',
    'Gestion expositions',
    'Décontamination urgente'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  
  emergencyProcedures: [
    'Premiers soins plaie immédiat',
    'Lavage antiseptique prolongé',
    'Notification médicale urgente',
    'Prophylaxie post-exposition',
    'Suivi sérologique 6-12 mois'
  ],
  
  firstAidMeasures: [
    'Saignement plaie favorisé',
    'Lavage savon 10+ minutes',
    'Rinçage oculaire si contact',
    'Prélèvement source si possible'
  ],
  
  tags: ['pathogenes_sanguins', 'vih_hepatites', 'vaccination_obligatoire', 'suivi_medical']
});

// =================== EXPORT DANGERS BIOLOGIQUES ===================
export const biologicalHazards = [
  infectiousAgents,
  moldFungalSpores,
  animalWaste,
  bloodBornePathogens
];

export const biologicalHazardsById = biologicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default biologicalHazards;
