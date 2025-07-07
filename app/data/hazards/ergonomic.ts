// app/data/hazards/ergonomic.ts
import { Hazard } from '../../types/hazards';

const createNewHazard = (base: any): Hazard => {
  return {
    category: 'ERGONOMIC' as any,
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
    ...base
  } as Hazard;
};

export const musculoskeletalDisorders: Hazard = createNewHazard({
  id: 'musculoskeletal_disorders_tms',
  name: 'Troubles musculo-squelettiques (TMS)',
  category: 'ERGONOMIC' as any,
  subcategory: 'repetitive_strain',
  displayName: {
    fr: 'TMS et blessures répétitives',
    en: 'Musculoskeletal disorders (MSDs)'
  },
  description: 'Risque de blessures par mouvements répétitifs et mauvaises postures',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  eliminationMethods: [
    'Automatisation des tâches répétitives',
    'Réorganisation des processus de travail',
    'Élimination des mouvements forcés'
  ],
  
  engineeringControls: [
    'Équipements ergonomiques adaptés',
    'Tables de travail ajustables',
    'Outils à prise ergonomique',
    'Systèmes de manutention assistée'
  ],
  
  administrativeControls: [
    'Rotation des tâches répétitives',
    'Pauses fréquentes programmées',
    'Formation gestes et postures',
    'Échauffement avant travail'
  ],
  
  controlMeasures: [
    'Aménagement postes ergonomiques',
    'Formation techniques de levage',
    'Rotation des tâches répétitives',
    'Pauses et étirements réguliers'
  ],
  
  requiredEquipment: [
    'ergonomic_lifting_belt',
    'adjustable_workstation_table',
    'anti_fatigue_floor_mats',
    'ergonomic_hand_tools'
  ],
  
  emergencyProcedures: [
    'Arrêt immédiat activité douloureuse',
    'Application glace inflammation',
    'Consultation médicale rapide',
    'Évaluation ergonomique poste'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Troubles musculo-squelettiques',
    'Guide CSST - Ergonomie'
  ],
  
  workTypes: ['assembly_line', 'data_entry', 'material_handling'],
  
  isActive: true
});

export const manualHandling: Hazard = createNewHazard({
  id: 'manual_material_handling',
  name: 'Manutention manuelle',
  category: 'ERGONOMIC' as any,
  subcategory: 'lifting',
  displayName: {
    fr: 'Levage et transport manuel',
    en: 'Manual material handling'
  },
  description: 'Risque de blessures au dos par levage et transport de charges',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Techniques de levage sécuritaires',
    'Limitation poids maximal',
    'Équipements d\'aide au levage',
    'Travail en équipe pour charges lourdes'
  ],
  
  requiredEquipment: [
    'mechanical_lifting_device',
    'back_support_belt_ergonomic',
    'lifting_team_coordination_signals',
    'load_weight_limit_signs'
  ],
  
  emergencyProcedures: [
    'Immobilisation en cas douleur dorsale',
    'Évacuation sans mouvement brusque',
    'Évaluation neurologique d\'urgence',
    'Transport médical spécialisé'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Manutention manuelle',
    'Guide prévention mal de dos CSST'
  ],
  
  workTypes: ['warehousing', 'construction', 'healthcare'],
  
  isActive: true
});

export const awkwardPostures: Hazard = createNewHazard({
  id: 'awkward_work_postures',
  name: 'Postures contraignantes',
  category: 'ERGONOMIC' as any,
  subcategory: 'posture',
  displayName: {
    fr: 'Postures de travail difficiles',
    en: 'Awkward work postures'
  },
  description: 'Risque de fatigue musculaire par postures de travail inadéquates',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Aménagement ergonomique des postes',
    'Supports et appuis appropriés',
    'Alternance positions travail',
    'Exercices d\'étirement réguliers'
  ],
  
  requiredEquipment: [
    'ergonomic_chair_adjustable',
    'footrest_adjustable_height',
    'document_holder_adjustable',
    'lumbar_support_cushion'
  ],
  
  emergencyProcedures: [
    'Changement position immédiat',
    'Étirements doux progressifs',
    'Massage zones tendues',
    'Consultation ergothérapeute'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Ergonomie des postes',
    'CSA Z412 - Ergonomie bureau'
  ],
  
  workTypes: ['office_work', 'precision_assembly', 'confined_space_work'],
  
  isActive: true
});

export const vibrationExposure: Hazard = createNewHazard({
  id: 'hand_arm_vibration_syndrome',
  name: 'Exposition aux vibrations',
  category: 'ERGONOMIC' as any,
  subcategory: 'vibration',
  displayName: {
    fr: 'Vibrations main-bras',
    en: 'Hand-arm vibration exposure'
  },
  description: 'Risque de syndrome vibratoire par utilisation d\'outils vibrants',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Limitation temps d\'exposition',
    'Outils anti-vibrations',
    'Pauses fréquentes',
    'Maintien des mains au chaud'
  ],
  
  requiredEquipment: [
    'anti_vibration_gloves',
    'vibration_dampening_tools',
    'vibration_measurement_meter',
    'heated_work_gloves'
  ],
  
  emergencyProcedures: [
    'Arrêt utilisation outils vibrants',
    'Réchauffement mains progressif',
    'Consultation médicale spécialisée',
    'Tests circulation sanguine'
  ] as any,
  
  regulatoryReferences: [
    'ACGIH - Vibrations main-bras',
    'RSST - Exposition vibrations'
  ],
  
  workTypes: ['power_tool_operation', 'construction', 'forestry'],
  
  isActive: true
});

export const ergonomicHazards = [
  musculoskeletalDisorders,
  manualHandling,
  awkwardPostures,
  vibrationExposure
];

export default ergonomicHazards;
