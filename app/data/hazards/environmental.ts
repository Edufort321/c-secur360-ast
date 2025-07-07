// app/data/hazards/environmental.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: any): Hazard => {
  return {
    category: 'ENVIRONMENTAL' as any,
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

// =================== DANGERS ENVIRONNEMENTAUX ===================

export const extremeWeather: Hazard = createNewHazard({
  id: 'extreme_weather_conditions',
  name: 'Conditions météorologiques extrêmes',
  category: 'ENVIRONMENTAL' as any,
  subcategory: 'weather',
  displayName: {
    fr: 'Météo extrême',
    en: 'Extreme weather conditions'
  },
  description: 'Risques liés aux conditions météorologiques dangereuses',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  eliminationMethods: [
    'Report des travaux extérieurs',
    'Travail en intérieur sécurisé',
    'Suspension activités dangereuses'
  ],
  
  engineeringControls: [
    'Abris météorologiques',
    'Systèmes d\'alerte précoce',
    'Protection contre la foudre',
    'Drainage des eaux de surface'
  ],
  
  administrativeControls: [
    'Surveillance météorologique continue',
    'Procédures d\'urgence météo',
    'Formation conditions extrêmes',
    'Planification selon prévisions'
  ],
  
  controlMeasures: [
    'Surveillance météorologique continue',
    'Équipements de protection adaptés',
    'Abris d\'urgence disponibles',
    'Communication d\'urgence maintenue'
  ],
  
  requiredEquipment: [
    'weather_radio_emergency',
    'waterproof_protective_clothing',
    'emergency_shelter_portable',
    'lightning_detection_system'
  ],
  
  emergencyProcedures: [
    'Évacuation vers abris sécurisés',
    'Communication équipes terrain',
    'Surveillance santé travailleurs',
    'Arrêt travaux si nécessaire'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Travail extérieur',
    'Environnement Canada - Alertes météo'
  ],
  
  workTypes: ['outdoor_construction', 'utilities_maintenance', 'emergency_response'],
  
  isActive: true
});

export const uvRadiation: Hazard = createNewHazard({
  id: 'ultraviolet_radiation_exposure',
  name: 'Rayonnement ultraviolet',
  category: 'ENVIRONMENTAL' as any,
  subcategory: 'radiation',
  displayName: {
    fr: 'Exposition aux UV',
    en: 'UV radiation exposure'
  },
  description: 'Risque de cancer de la peau et lésions oculaires par exposition solaire',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Protection solaire intégrale',
    'Planification éviter heures pics',
    'Abris contre rayonnement',
    'Vêtements protection UV'
  ],
  
  requiredEquipment: [
    'uv_protective_clothing_upf50',
    'wide_brim_hat_uv_protection',
    'sunglasses_uv_400_protection',
    'sunscreen_spf_30_plus'
  ],
  
  emergencyProcedures: [
    'Traitement coups de soleil',
    'Hydratation d\'urgence',
    'Refroidissement corporel',
    'Consultation dermatologique'
  ] as any,
  
  regulatoryReferences: [
    'Santé Canada - Protection solaire',
    'RSST - Rayonnement non ionisant'
  ],
  
  workTypes: ['outdoor_work', 'roofing', 'landscaping'],
  
  isActive: true
});

export const wildlifeEncounter: Hazard = createNewHazard({
  id: 'wildlife_animal_encounter',
  name: 'Rencontre avec faune sauvage',
  category: 'ENVIRONMENTAL' as any,
  subcategory: 'wildlife',
  displayName: {
    fr: 'Faune sauvage dangereuse',
    en: 'Dangerous wildlife encounter'
  },
  description: 'Risque d\'attaque ou morsure par animaux sauvages',
  severity: 'high',
  likelihood: 'low',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Formation identification faune',
    'Procédures de dissuasion',
    'Équipements de protection',
    'Communication localisation'
  ],
  
  requiredEquipment: [
    'bear_spray_deterrent',
    'noise_makers_warning',
    'first_aid_kit_animal_bite',
    'satellite_communication_device'
  ],
  
  emergencyProcedures: [
    'Soins morsures d\'urgence',
    'Évacuation médicale rapide',
    'Vaccination antirabique',
    'Signalement incident faune'
  ] as any,
  
  regulatoryReferences: [
    'Ministère Forêts, Faune et Parcs',
    'RSST - Travail en forêt'
  ],
  
  workTypes: ['forestry', 'surveying', 'outdoor_maintenance'],
  
  isActive: true
});

export const floodRisk: Hazard = createNewHazard({
  id: 'flooding_water_hazard',
  name: 'Risque d\'inondation',
  category: 'ENVIRONMENTAL' as any,
  subcategory: 'water',
  displayName: {
    fr: 'Inondation et crue',
    en: 'Flooding and water hazard'
  },
  description: 'Risque de noyade et contamination par montée des eaux',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Surveillance niveaux d\'eau',
    'Évacuation préventive',
    'Équipements de flottaison',
    'Voies d\'évacuation sécurisées'
  ],
  
  requiredEquipment: [
    'personal_flotation_device',
    'waterproof_communication_radio',
    'emergency_beacon_locator',
    'water_rescue_equipment'
  ],
  
  emergencyProcedures: [
    'Évacuation immédiate zone inondée',
    'Secours aquatique spécialisé',
    'Décontamination post-exposition',
    'Surveillance maladies hydriques'
  ] as any,
  
  regulatoryReferences: [
    'Sécurité publique Canada - Inondations',
    'Plan mesures d\'urgence municipal'
  ],
  
  workTypes: ['emergency_response', 'infrastructure_inspection', 'cleanup_operations'],
  
  isActive: true
});

// =================== EXPORT DANGERS ENVIRONNEMENTAUX ===================
export const environmentalHazards = [
  extremeWeather,
  uvRadiation,
  wildlifeEncounter,
  floodRisk
];

export const environmentalHazardsById = environmentalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default environmentalHazards;
