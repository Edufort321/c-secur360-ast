// app/data/hazards/electrical.ts
import { Hazard } from '../../types/hazards';

const createNewHazard = (base: any): Hazard => {
  return {
    category: 'ELECTRICAL' as any,
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

export const electricalShock: Hazard = createNewHazard({
  id: 'electrical_shock_electrocution',
  name: 'Choc électrique',
  category: 'ELECTRICAL' as any,
  subcategory: 'shock',
  displayName: {
    fr: 'Électrocution et choc électrique',
    en: 'Electrical shock and electrocution'
  },
  description: 'Risque de choc électrique pouvant causer blessures graves ou décès',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Mise hors tension complète',
    'Isolation électrique totale',
    'Suppression des sources électriques'
  ],
  
  engineeringControls: [
    'Disjoncteurs différentiels (DDFT)',
    'Mise à la terre adéquate',
    'Isolation double des équipements',
    'Barrières physiques de protection'
  ],
  
  administrativeControls: [
    'Procédures de cadenassage/étiquetage',
    'Formation sécurité électrique',
    'Vérification avant travaux',
    'Supervision travaux électriques'
  ],
  
  controlMeasures: [
    'Cadenassage/étiquetage (LOTO)',
    'Vérification absence de tension',
    'Équipements de protection isolants',
    'Distance sécuritaire maintenue'
  ],
  
  requiredEquipment: [
    'insulated_gloves_class_2',
    'dielectric_boots_class_75',
    'voltage_detector_non_contact',
    'insulated_tools_1000v'
  ],
  
  emergencyProcedures: [
    'Coupure alimentation électrique',
    'Réanimation cardio-respiratoire',
    'Transport médical d\'urgence',
    'Surveillance cardiaque continue'
  ] as any,
  
  regulatoryReferences: [
    'CSA Z462 - Sécurité en milieu électrique',
    'Code canadien de l\'électricité',
    'RSST - Installations électriques'
  ],
  
  workTypes: ['electrical_work', 'maintenance', 'construction'],
  
  isActive: true
});

export const arcFlash: Hazard = createNewHazard({
  id: 'electrical_arc_flash',
  name: 'Arc électrique',
  category: 'ELECTRICAL' as any,
  subcategory: 'arc_flash',
  displayName: {
    fr: 'Explosion d\'arc électrique',
    en: 'Electrical arc flash'
  },
  description: 'Risque de brûlures graves par explosion d\'arc électrique',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'high',
  
  controlMeasures: [
    'Analyse des risques d\'arc',
    'Équipements de protection arc',
    'Distance d\'approche limitée',
    'Outils isolés appropriés'
  ],
  
  requiredEquipment: [
    'arc_rated_suit_40_cal',
    'arc_rated_face_shield',
    'arc_rated_gloves_leather',
    'arc_rated_hard_hat'
  ],
  
  emergencyProcedures: [
    'Traitement brûlures d\'urgence',
    'Refroidissement brûlures eau froide',
    'Transport centre grands brûlés',
    'Surveillance voies respiratoires'
  ] as any,
  
  regulatoryReferences: [
    'CSA Z462 - Protection arc électrique',
    'NFPA 70E - Sécurité électrique'
  ],
  
  workTypes: ['electrical_maintenance', 'switchgear_operation', 'testing'],
  
  isActive: true
});

export const electricalFire: Hazard = createNewHazard({
  id: 'electrical_fire_ignition',
  name: 'Incendie électrique',
  category: 'ELECTRICAL' as any,
  subcategory: 'fire',
  displayName: {
    fr: 'Incendie d\'origine électrique',
    en: 'Electrical fire'
  },
  description: 'Risque d\'incendie causé par défaillance électrique',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Maintenance préventive équipements',
    'Protection contre les surcharges',
    'Détection précoce de surchauffe',
    'Extincteurs classe C disponibles'
  ],
  
  requiredEquipment: [
    'class_c_fire_extinguisher',
    'infrared_thermometer',
    'electrical_safety_tester',
    'smoke_detection_system'
  ],
  
  emergencyProcedures: [
    'Coupure alimentation électrique',
    'Utilisation extincteur classe C',
    'Évacuation zone dangereuse',
    'Appel services d\'urgence'
  ] as any,
  
  regulatoryReferences: [
    'Code de prévention des incendies',
    'CSA Z462 - Prévention incendies électriques'
  ],
  
  workTypes: ['electrical_installation', 'maintenance', 'inspection'],
  
  isActive: true
});

export const staticElectricity: Hazard = createNewHazard({
  id: 'static_electricity_discharge',
  name: 'Électricité statique',
  category: 'ELECTRICAL' as any,
  subcategory: 'static',
  displayName: {
    fr: 'Décharge électrostatique',
    en: 'Static electricity discharge'
  },
  description: 'Risque d\'inflammation par décharge électrostatique',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Mise à la terre équipements',
    'Humidification de l\'air',
    'Chaussures antistatiques',
    'Bracelets de mise à la terre'
  ],
  
  requiredEquipment: [
    'anti_static_wrist_strap',
    'conductive_footwear',
    'grounding_equipment',
    'humidity_control_system'
  ],
  
  emergencyProcedures: [
    'Évacuation zone d\'inflammation',
    'Extinction incendie appropriée',
    'Vérification absence gaz inflammables',
    'Inspection dommages équipements'
  ] as any,
  
  regulatoryReferences: [
    'NFPA 77 - Électricité statique',
    'CSA Z460 - Contrôle électricité statique'
  ],
  
  workTypes: ['chemical_handling', 'powder_processing', 'electronics'],
  
  isActive: true
});

export const electricalHazards = [
  electricalShock,
  arcFlash,
  electricalFire,
  staticElectricity
];

export default electricalHazards;
