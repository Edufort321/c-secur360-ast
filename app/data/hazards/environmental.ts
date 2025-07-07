// app/data/hazards/environmental.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
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

export const weatherExposure: Hazard = createNewHazard({
  id: 'severe_weather_exposure',
  name: 'Conditions météorologiques extrêmes',
  category: 'ENVIRONMENTAL' as any,
  subcategory: 'weather',
  description: 'Exposition aux intempéries, foudre, vents violents',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Surveillance météorologique continue',
    'Abris temporaires',
    'Arrêt des travaux si conditions dangereuses',
    'Équipement de protection intempéries'
  ],
  
  requiredEquipment: [
    'insulated_winter_boots',
    'weather_resistant_clothing',
    'emergency_shelter',
    'weather_monitoring_device'
  ],
  
  regulatoryReferences: [
    'RSST - Travail extérieur',
    'Environnement Canada - Alertes météo'
  ],
  
  workTypes: ['emergency_response', 'construction_general', 'outdoor_work'],
  
  isActive: true
});

export const uvRadiation: Hazard = createNewHazard({
  id: 'ultraviolet_radiation',
  name: 'Rayonnement ultraviolet',
  category: 'environmental',
  subcategory: 'radiation',
  description: 'Exposition prolongée aux rayons UV solaires',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Protection solaire (crème FPS 30+)',
    'Vêtements couvrants',
    'Rotation du personnel',
    'Travail aux heures moins ensoleillées'
  ],
  
  requiredEquipment: [
    'uv_protective_clothing',
    'wide_brim_hat',
    'uv_safety_glasses',
    'sunscreen_spf30'
  ],
  
  regulatoryReferences: [
    'Santé Canada - Protection solaire',
    'OMS - Indice UV'
  ],
  
  workTypes: ['construction_general', 'outdoor_work'],
  
  isActive: true
});

export const wildlifeEncounter: Hazard = createNewHazard({
  id: 'wildlife_encounter',
  name: 'Rencontre avec faune sauvage',
  category: 'environmental',
  subcategory: 'wildlife',
  description: 'Risque d\'attaque ou morsure par animaux sauvages',
  severity: 'high',
  likelihood: 'low',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Formation reconnaissance faune locale',
    'Moyens de dissuasion (bruit, éclairage)',
    'Trousse premiers secours spécialisée',
    'Communication d\'urgence'
  ],
  
  requiredEquipment: [
    'wildlife_deterrent_device',
    'emergency_communication_radio',
    'first_aid_kit_wilderness',
    'bear_spray'
  ],
  
  regulatoryReferences: [
    'Faune Québec - Cohabitation',
    'Parcs Canada - Sécurité faune'
  ],
  
  workTypes: ['environmental_cleanup', 'outdoor_work', 'emergency_response'],
  
  isActive: true
});

export const floodRisk: Hazard = createNewHazard({
  id: 'flooding_water_hazard',
  name: 'Risque d\'inondation',
  category: 'environmental',
  subcategory: 'water',
  description: 'Montée rapide des eaux, courants dangereux',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Surveillance niveaux d\'eau',
    'Équipement de flottaison',
    'Plan d\'évacuation d\'urgence',
    'Formation sauvetage aquatique'
  ],
  
  requiredEquipment: [
    'personal_flotation_device',
    'waterproof_communication',
    'emergency_beacon',
    'rescue_rope'
  ],
  
  regulatoryReferences: [
    'Sécurité publique Québec',
    'Transport Canada - Sécurité nautique'
  ],
  
  workTypes: ['emergency_response', 'water_work', 'environmental_cleanup'],
  
  isActive: true
});

// =================== EXPORT DANGERS ENVIRONNEMENTAUX ===================
export const environmentalHazards = [
  weatherExposure,
  uvRadiation,
  wildlifeEncounter,
  floodRisk
];

export const environmentalHazardsById = environmentalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default environmentalHazards;
