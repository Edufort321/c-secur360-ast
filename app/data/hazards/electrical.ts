// app/data/hazards/electrical.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS ÉLECTRIQUES ===================

export const electricShock: Hazard = createNewHazard({
  id: 'electrical_shock',
  name: 'Choc électrique',
  category: 'electrical',
  subcategory: 'direct_contact',
  displayName: {
    fr: 'Choc électrique',
    en: 'Electric shock'
  },
  description: 'Risque de choc électrique par contact direct ou indirect avec des parties sous tension',
  severity: 5,
  probability: 3,
  
  eliminationMethods: [
    'Mise hors tension complète',
    'Consignation LOTO',
    'Vérification absence de tension'
  ],
  
  substitutionOptions: [
    'Utilisation d\'outils isolés',
    'Équipements basse tension (<50V)',
    'Systèmes pneumatiques ou hydrauliques'
  ],
  
  engineeringControls: [
    'Barrières physiques',
    'Garde-corps isolants',
    'Écrans de protection',
    'Dispositifs différentiels (DDR)',
    'Disjoncteurs de protection'
  ],
  
  administrativeControls: [
    'Procédures de consignation',
    'Permis de travail électrique',
    'Formation qualification électrique',
    'Supervision par personne qualifiée',
    'Vérification des équipements'
  ],
  
  ppeRequirements: [
    'Gants isolants classe appropriée',
    'Chaussures de sécurité isolantes',
    'Casque isolant',
    'Vêtements ignifuges',
    'Écran facial arc électrique'
  ],
  
  requiredEquipment: [
    'ppe_electrical_gloves',
    'ppe_insulated_shoes',
    'ppe_arc_flash_suit',
    'electrical_tester',
    'lockout_kit'
  ],
  
  recommendedEquipment: [
    'insulated_tools',
    'grounding_equipment',
    'electrical_mats'
  ],
  
  regulations: {
    csa: ['CSA Z462', 'CSA Z432'],
    rsst: ['Section V - Électricité', 'Art. 185-196'],
    other: ['Code électrique canadien', 'IEEE 1584']
  },
  
  weatherRestrictions: [
    {
      condition: 'precipitation',
      operator: '>',
      value: 0,
      unit: 'mm/h',
      description: 'Interdiction par temps humide'
    },
    {
      condition: 'humidity',
      operator: '>',
      value: 85,
      unit: '%',
      description: 'Humidité excessive'
    }
  ],
  
  requiredTraining: [
    'Qualification électrique',
    'Sécurité électrique CSA Z462',
    'Premiers secours RCR'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Avant chaque intervention',
  
  emergencyProcedures: [
    'Couper alimentation immédiatement',
    'Ne pas toucher la victime si sous tension',
    'Appeler 911',
    'RCR si nécessaire',
    'Position latérale de sécurité'
  ],
  
  firstAidMeasures: [
    'Évaluer conscience et respiration',
    'Traiter les brûlures',
    'Surveiller signes de choc',
    'Évacuation médicale si contact HT'
  ],
  
  tags: ['haute_tension', 'basse_tension', 'qualification_requise', 'loto']
});

export const arcFlash: Hazard = createNewHazard({
  id: 'arc_flash',
  name: 'Arc électrique',
  category: 'electrical',
  subcategory: 'arc_flash',
  displayName: {
    fr: 'Arc électrique / Arc flash',
    en: 'Arc flash'
  },
  description: 'Risque d\'arc électrique avec libération d\'énergie thermique et lumineuse intense',
  severity: 5,
  probability: 2,
  
  eliminationMethods: [
    'Mise hors tension',
    'Consignation complète',
    'Travail sur installation froide'
  ],
  
  engineeringControls: [
    'Équipements arc-résistants',
    'Dispositifs de protection rapide',
    'Relais de protection différentielle',
    'Limiteurs de courant'
  ],
  
  administrativeControls: [
    'Étude d\'arc flash',
    'Calcul énergie incidente',
    'Détermination catégorie EPI',
    'Distance de sécurité',
    'Procédures spécifiques'
  ],
  
  ppeRequirements: [
    'Costume arc électrique complet',
    'Cagoule arc flash',
    'Gants isolants + surgants',
    'Chaussures cuir pleine fleur'
  ],
  
  requiredEquipment: [
    'ppe_arc_flash_suit_cat4',
    'ppe_arc_hood',
    'ppe_electrical_gloves_class4',
    'arc_flash_calculator'
  ],
  
  regulations: {
    csa: ['CSA Z462', 'CSA Z463'],
    rsst: ['Section V'],
    other: ['NFPA 70E', 'IEEE 1584']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 25,
      unit: 'km/h',
      description: 'Vent fort - risque propagation'
    }
  ],
  
  requiredTraining: [
    'Formation arc électrique CSA Z462',
    'Qualification électrique avancée',
    'Analyse des risques'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  
  emergencyProcedures: [
    'Évacuer zone immédiatement',
    'Couper alimentation si possible',
    'Appeler pompiers et ambulance',
    'Refroidir brûlures avec eau',
    'Ne pas retirer vêtements collés'
  ],
  
  tags: ['arc_flash', 'haute_energie', 'brulures', 'qualification_avancee']
});

export const liveWork: Hazard = createNewHazard({
  id: 'live_electrical_work',
  name: 'Travail sous tension',
  category: 'electrical',
  subcategory: 'live_work',
  displayName: {
    fr: 'Travail sous tension',
    en: 'Live electrical work'
  },
  description: 'Travaux sur équipements électriques restant sous tension',
  severity: 5,
  probability: 4,
  
  eliminationMethods: [
    'Planifier arrêt programmé',
    'Consignation complète',
    'Reports des travaux'
  ],
  
  substitutionOptions: [
    'Méthodes à distance',
    'Outils isolés longue portée',
    'Robotique'
  ],
  
  engineeringControls: [
    'Perches isolantes',
    'Plateformes isolées',
    'Barrières de protection',
    'Équipements spécialisés TST'
  ],
  
  administrativeControls: [
    'Justification écrite obligatoire',
    'Autorisation direction',
    'Plan de travail détaillé',
    'Équipe qualifiée TST',
    'Surveillance continue'
  ],
  
  ppeRequirements: [
    'Équipement TST complet',
    'Gants isolants testés',
    'Vêtements isolants',
    'Casque classe E',
    'Chaussures isolantes testées'
  ],
  
  requiredEquipment: [
    'live_work_tools',
    'insulation_tester',
    'ppe_live_work_kit',
    'grounding_equipment'
  ],
  
  regulations: {
    csa: ['CSA Z462 - Annexe O'],
    rsst: ['Art. 189-191'],
    other: ['Norme TST entreprise']
  },
  
  weatherRestrictions: [
    {
      condition: 'precipitation',
      operator: '>',
      value: 0,
      unit: 'mm',
      description: 'Aucune précipitation tolérée'
    },
    {
      condition: 'wind',
      operator: '>',
      value: 20,
      unit: 'km/h',
      description: 'Limite vent pour TST extérieur'
    }
  ],
  
  timeRestrictions: {
    startTime: '08:00',
    endTime: '16:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reason: 'Support médical et technique disponible'
  },
  
  requiredTraining: [
    'Certification TST',
    'Formation spécialisée métier',
    'Mise à jour annuelle',
    'Simulation pratique'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Continue pendant travaux',
  
  emergencyProcedures: [
    'Signal d\'arrêt immédiat',
    'Évacuation zone sécurisée',
    'Coupure alimentation si possible',
    'Intervention équipe secours'
  ],
  
  tags: ['tst', 'haute_qualification', 'autorisation_speciale', 'surveillance_continue']
});

// =================== EXPORT DANGERS ÉLECTRIQUES ===================
export const electricalHazards = [
  electricShock,
  arcFlash,
  liveWork,
  // Plus de dangers électriques peuvent être ajoutés ici
];

export const electricalHazardsById = electricalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default electricalHazards;
