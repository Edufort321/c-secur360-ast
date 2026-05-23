// app/data/equipment/hearing-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'HEARING_PROTECTION' as any,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== BOUCHONS D'OREILLES ===================

export const disposableEarplugs = createNewEquipment({
  id: 'disposable_earplugs_foam',
  name: 'Bouchons d\'oreilles jetables en mousse',
  category: 'HEARING_PROTECTION' as any,
  subcategory: 'earplugs',
  description: 'Bouchons en mousse polyuréthane à usage unique',
  
  displayName: {
    fr: 'Bouchons d\'oreilles jetables en mousse',
    en: 'Disposable Foam Earplugs'
  },

  specifications: {
    model: '1100',
    manufacturer: '3M',
    partNumber: '3101001',
    material: 'Mousse polyuréthane',
    nrr: '29 dB',
    snr: '28 dB',
    color: 'Orange fluorescent',
    shape: 'Cylindrique effilé',
    packaging: 'Paire sous emballage individuel'
  },

  protectionLevels: {
    low: '85-90 dB',
    medium: '90-95 dB',
    high: '95-105 dB',
    extreme: '105+ dB'
  } as any,

  safetyFeatures: [
    'Mousse à expansion lente',
    'Surface lisse et hygiénique',
    'Forme ergonomique',
    'Couleur haute visibilité',
    'Sans latex ni silicone'
  ] as any,

  maintenanceRequirements: [
    'Usage unique - ne pas réutiliser',
    'Remplacer si souillés',
    'Stockage dans emballage d\'origine',
    'Vérifier la date d\'expiration',
    'Maintenir les mains propres'
  ] as any,

  compatibleWith: [
    'hard_hat_standard',
    'safety_glasses_basic',
    'dust_mask_n95'
  ] as any,

  certifications: ['ANSI S3.19', 'CE EN 352-2', 'CSA Z94.2'] as any,
  
  usageInstructions: [
    'Se laver les mains avant manipulation',
    'Rouler le bouchon entre les doigts',
    'Tirer l\'oreille vers le haut et l\'arrière',
    'Insérer rapidement et maintenir 30 secondes',
    'Jeter après utilisation'
  ] as any,

  storageConditions: 'Lieu sec, température ambiante, emballage scellé',
  
  inspectionCriteria: [
    'Intégrité de la mousse',
    'Absence de déformation',
    'Couleur uniforme',
    'Emballage non endommagé',
    'Date d\'expiration valide'
  ] as any
});

// =================== BOUCHONS RÉUTILISABLES ===================

export const reusableEarplugs = createNewEquipment({
  id: 'reusable_earplugs_silicone',
  name: 'Bouchons d\'oreilles réutilisables en silicone',
  category: 'HEARING_PROTECTION' as any,
  subcategory: 'earplugs',
  description: 'Bouchons réutilisables en silicone avec cordon',
  
  displayName: {
    fr: 'Bouchons d\'oreilles réutilisables en silicone',
    en: 'Reusable Silicone Earplugs'
  },

  specifications: {
    model: '1271',
    manufacturer: '3M',
    partNumber: '3121271',
    material: 'Silicone thermoplastique',
    nrr: '25 dB',
    snr: '24 dB',
    color: 'Bleu et jaune',
    cordLength: '70 cm',
    washable: true
  },

  protectionLevels: {
    low: '85-90 dB',
    medium: '90-95 dB',
    high: '95-100 dB'
  } as any,

  safetyFeatures: [
    'Matériau hypoallergénique',
    'Forme prémodelée',
    'Cordon de sécurité détachable',
    'Surface lavable',
    'Résistant aux produits chimiques'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage quotidien à l\'eau savonneuse',
    'Séchage complet avant stockage',
    'Inspection régulière de l\'usure',
    'Remplacement selon recommandations',
    'Stockage dans étui de protection'
  ] as any,

  compatibleWith: [
    'hard_hat_with_accessories',
    'safety_glasses_wraparound',
    'face_shield_clear'
  ] as any,

  certifications: ['ANSI S3.19', 'CE EN 352-2', 'CSA Z94.2'] as any,
  
  usageInstructions: [
    'Nettoyer avant première utilisation',
    'Insérer en tournant légèrement',
    'Ajuster pour un bon joint étanche',
    'Retirer en tournant doucement',
    'Nettoyer après chaque utilisation'
  ] as any,

  storageConditions: 'Étui de protection propre et sec',
  
  inspectionCriteria: [
    'Élasticité du matériau',
    'Absence de fissures ou déchirures',
    'État du cordon de sécurité',
    'Propreté et hygiène',
    'Capacité d\'étanchéité'
  ] as any
});

// =================== CASQUES ANTI-BRUIT ===================

export const noiseCancellingHeadset = createNewEquipment({
  id: 'noise_cancelling_headset_class5',
  name: 'Casque anti-bruit classe 5',
  category: 'HEARING_PROTECTION' as any,
  subcategory: 'headsets',
  description: 'Casque serre-tête avec atténuation maximale',
  
  displayName: {
    fr: 'Casque anti-bruit classe 5',
    en: 'Class 5 Noise Cancelling Headset'
  },

  specifications: {
    model: 'X5A',
    manufacturer: '3M Peltor',
    partNumber: 'X5A',
    nrr: '31 dB',
    snr: '37 dB',
    weight: '280g',
    headbandPadding: 'Mousse et liquide',
    cupMaterial: 'ABS résistant aux chocs',
    sealingRings: 'Mousse et liquide'
  },

  protectionLevels: {
    medium: '90-95 dB',
    high: '95-105 dB',
    extreme: '105-115 dB',
    maximum: '115+ dB'
  } as any,

  safetyFeatures: [
    'Double protection (mousse + liquide)',
    'Serre-tête ajustable',
    'Coussinets remplaçables',
    'Structure robuste',
    'Certification haute protection'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage régulier des coussinets',
    'Remplacement des coussinets usés',
    'Vérification de l\'ajustement',
    'Inspection de l\'intégrité structurelle',
    'Stockage dans un lieu propre'
  ] as any,

  compatibleWith: [
    'hard_hat_peltor_compatible',
    'communication_headset',
    'face_shield_integrated'
  ] as any,

  certifications: ['ANSI S3.19', 'CE EN 352-1', 'CSA Z94.2'] as any,
  
  usageInstructions: [
    'Ajuster le serre-tête correctement',
    'Positionner les coquilles sur les oreilles',
    'Vérifier l\'étanchéité du joint',
    'S\'assurer du confort pour usage prolongé',
    'Nettoyer après utilisation'
  ] as any,

  storageConditions: 'Support de rangement, éviter la déformation',
  
  inspectionCriteria: [
    'État des coussinets d\'étanchéité',
    'Fonctionnement de l\'ajustement',
    'Intégrité des coquilles',
    'Absence de fissures',
    'Maintien de l\'atténuation'
  ] as any
});

// =================== CASQUES AVEC COMMUNICATION ===================

export const communicationHeadset = createNewEquipment({
  id: 'communication_headset_bluetooth',
  name: 'Casque anti-bruit avec communication',
  category: 'HEARING_PROTECTION' as any,
  subcategory: 'communication',
  description: 'Casque avec protection auditive et communication intégrée',
  
  displayName: {
    fr: 'Casque anti-bruit avec communication',
    en: 'Communication Headset with Hearing Protection'
  },

  specifications: {
    model: 'WS Alert XPI',
    manufacturer: '3M Peltor',
    partNumber: 'MRX21A3WS6',
    nrr: '25 dB',
    batteryLife: '70 heures',
    connectivity: 'Bluetooth 4.2',
    frequency: '2.4 GHz ISM',
    range: '300 mètres',
    weight: '420g'
  },

  features: [
    'Protection auditive active',
    'Communication bidirectionnelle',
    'Suppression du bruit ambiant',
    'Batterie rechargeable Li-ion',
    'Résistant aux intempéries IP65',
    'Application mobile de configuration'
  ] as any,

  safetyFeatures: [
    'Limitation automatique du volume',
    'Protection contre les pics sonores',
    'Indicateur de batterie faible',
    'Mode urgence prioritaire',
    'Isolation des fréquences dangereuses'
  ] as any,

  maintenanceRequirements: [
    'Charge quotidienne de la batterie',
    'Nettoyage des microphones',
    'Mise à jour du firmware',
    'Calibration annuelle',
    'Remplacement des coussinets'
  ] as any,

  compatibleWith: [
    'hard_hat_peltor_mount',
    'radio_communication_system',
    'smartphone_apps'
  ] as any,

  certifications: ['ANSI S3.19', 'CE EN 352-1', 'FCC', 'IC'] as any,
  
  usageInstructions: [
    'Charger avant première utilisation',
    'Appairage Bluetooth avec appareil',
    'Ajuster les paramètres via app',
    'Tester la communication avant usage',
    'Surveiller le niveau de batterie'
  ] as any,

  storageConditions: 'Station de charge, température 5-35°C',
  
  inspectionCriteria: [
    'Fonctionnement de la communication',
    'Niveau de charge de la batterie',
    'Qualité audio microphone/haut-parleur',
    'État des joints d\'étanchéité',
    'Connectivité Bluetooth stable'
  ] as any
});

// =================== EXPORT DES PROTECTIONS AUDITIVES ===================

export const hearingProtectionEquipment = [
  disposableEarplugs,
  reusableEarplugs,
  noiseCancellingHeadset,
  communicationHeadset
];

export default hearingProtectionEquipment;
