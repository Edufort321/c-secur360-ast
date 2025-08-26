// app/data/equipment/emergency.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'EMERGENCY' as any,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== PREMIERS SECOURS ===================

export const firstAidKit = createNewEquipment({
  id: 'first_aid_kit_type_a',
  name: 'Trousse de premiers secours Type A',
  category: 'EMERGENCY' as any,
  subcategory: 'first_aid',
  description: 'Trousse complète pour premiers secours en milieu industriel',
  
  displayName: {
    fr: 'Trousse de premiers secours Type A',
    en: 'First Aid Kit Type A'
  },

  specifications: {
    model: 'FAK-A-50',
    manufacturer: 'Medique',
    partNumber: '740001',
    capacity: '50 personnes',
    dimensions: '32 x 22 x 12 cm',
    weight: 2.5,
    material: 'Plastique ABS résistant',
    mounting: 'Murale avec fixations'
  },

  contents: [
    'Pansements adhésifs assortis (50)',
    'Compresses stériles 10x10cm (20)',
    'Bandages triangulaires (6)',
    'Rouleaux de gaze 7.5cm (4)',
    'Sparadrap médical (2 rouleaux)',
    'Ciseaux médicaux (1)',
    'Pince à échardes (1)',
    'Gants latex sans poudre (10 paires)',
    'Masque de réanimation (1)',
    'Couverture de survie (2)',
    'Solution saline (4 x 15ml)',
    'Thermomètre digital (1)',
    'Analgésiques (20 comprimés)',
    'Guide des premiers secours'
  ] as any,

  safetyFeatures: [
    'Fermeture étanche',
    'Compartiments organisés',
    'Liste d\'inventaire incluse',
    'Instructions multilingues',
    'Indicateur d\'expiration'
  ] as any,

  maintenanceRequirements: [
    'Vérification mensuelle du contenu',
    'Remplacement des produits expirés',
    'Réapprovisionnement après utilisation',
    'Nettoyage du boîtier (trimestriel)',
    'Formation du personnel responsable'
  ] as any,

  certifications: ['CSA Z1220', 'ANSI Z308.1'] as any,
  
  usageInstructions: [
    'Vérifier la formation aux premiers secours',
    'Évaluer la situation avant d\'intervenir',
    'Porter des gants de protection',
    'Suivre les procédures d\'urgence',
    'Signaler l\'utilisation au responsable'
  ] as any,

  storageConditions: 'Lieu accessible, sec, température 15-25°C',
  
  inspectionCriteria: [
    'Présence de tous les éléments',
    'État des dates d\'expiration',
    'Intégrité des emballages stériles',
    'Fonctionnement des fermetures',
    'Lisibilité des instructions'
  ] as any
});

// =================== EXTINCTEURS ===================

export const fireExtinguisherABC = createNewEquipment({
  id: 'fire_extinguisher_abc_5kg',
  name: 'Extincteur poudre ABC 5kg',
  category: 'EMERGENCY' as any,
  subcategory: 'fire_safety',
  description: 'Extincteur à poudre polyvalente pour feux A, B et C',
  
  displayName: {
    fr: 'Extincteur poudre ABC 5kg',
    en: 'ABC Dry Powder Fire Extinguisher 5kg'
  },

  specifications: {
    model: 'ABC-5',
    manufacturer: 'Amerex',
    partNumber: 'B500',
    agent: 'Poudre polyvalente ABC',
    capacity: '5 kg',
    range: '4-6 mètres',
    dischargeTime: '13-15 secondes',
    operatingPressure: '1.4 MPa',
    testPressure: '2.1 MPa'
  },

  fireClasses: [
    'Classe A - Combustibles solides',
    'Classe B - Liquides inflammables',
    'Classe C - Gaz inflammables'
  ] as any,

  safetyFeatures: [
    'Manomètre de contrôle',
    'Goupille de sécurité',
    'Poignée ergonomique',
    'Instructions pictographiques',
    'Étiquette d\'identification'
  ] as any,

  maintenanceRequirements: [
    'Inspection visuelle mensuelle',
    'Vérification annuelle par technicien',
    'Test hydrostatique (12 ans)',
    'Rechargement après usage',
    'Remplacement selon durée de vie'
  ] as any,

  certifications: ['ULC', 'UL', 'CE'] as any,
  
  usageInstructions: [
    'Retirer la goupille de sécurité',
    'Viser la base des flammes',
    'Presser la poignée fermement',
    'Balayer de gauche à droite',
    'Évacuer si inefficace'
  ] as any,

  storageConditions: 'Support mural, accessible, température -40 à +60°C',
  
  inspectionCriteria: [
    'Position de l\'aiguille du manomètre',
    'État de la goupille et scellé',
    'Absence de corrosion ou dommages',
    'Lisibilité des instructions',
    'Accessibilité et signalisation'
  ] as any
});

// =================== ÉQUIPEMENT D'ÉVACUATION ===================

export const emergencyEyewash = createNewEquipment({
  id: 'emergency_eyewash_plumbed',
  name: 'Lave-œil d\'urgence raccordé',
  category: 'EMERGENCY' as any,
  subcategory: 'decontamination',
  description: 'Station de lavage oculaire d\'urgence raccordée au réseau',
  
  displayName: {
    fr: 'Lave-œil d\'urgence raccordé',
    en: 'Plumbed Emergency Eyewash'
  },

  specifications: {
    model: 'EW-200',
    manufacturer: 'Haws',
    partNumber: '7360B',
    flowRate: '11.4 L/min minimum',
    activationType: 'Poussoir inox',
    drainConnection: '32mm',
    waterConnection: '15mm',
    height: '109 cm'
  },

  safetyFeatures: [
    'Activation par poussoir large',
    'Diffuseurs anti-projection',
    'Débit régulé automatiquement',
    'Température d\'eau tempérée',
    'Signalisation haute visibilité'
  ] as any,

  maintenanceRequirements: [
    'Test de fonctionnement hebdomadaire',
    'Rinçage préventif (30 secondes)',
    'Nettoyage des diffuseurs (mensuel)',
    'Vérification du débit (annuel)',
    'Inspection de la plomberie'
  ] as any,

  certifications: ['ANSI Z358.1', 'CSA Z358.1'] as any,
  
  usageInstructions: [
    'Activer immédiatement après exposition',
    'Rincer 15 minutes minimum',
    'Garder les paupières ouvertes',
    'Retirer lentilles de contact',
    'Consulter un médecin après rinçage'
  ] as any,

  installationRequirements: [
    'Accès libre dans un rayon de 10 mètres',
    'Temps d\'accès maximum 10 secondes',
    'Hauteur du sol libre (2.1m minimum)',
    'Éclairage adéquat',
    'Signalisation claire'
  ] as any,

  storageConditions: 'Installation permanente, protection contre le gel',
  
  inspectionCriteria: [
    'Débit d\'eau conforme (11.4 L/min)',
    'Température d\'eau (15-37°C)',
    'Fonctionnement du poussoir',
    'État des diffuseurs',
    'Accessibilité dégagée'
  ] as any
});

// =================== ÉQUIPEMENT DE COMMUNICATION ===================

export const emergencyPhone = createNewEquipment({
  id: 'emergency_phone_weatherproof',
  name: 'Téléphone d\'urgence étanche',
  category: 'EMERGENCY' as any,
  subcategory: 'communication',
  description: 'Téléphone d\'urgence résistant aux intempéries avec appel direct',
  
  displayName: {
    fr: 'Téléphone d\'urgence étanche',
    en: 'Weatherproof Emergency Phone'
  },

  specifications: {
    model: 'EP-2000',
    manufacturer: 'Viking Electronics',
    partNumber: 'E-2000-IP',
    protocol: 'VoIP/SIP',
    housing: 'Aluminium moulé',
    protection: 'IP65',
    temperature: '-40°C à +70°C',
    powerSource: 'PoE ou 12-24V DC'
  },

  safetyFeatures: [
    'Appel automatique préprogrammé',
    'Bouton d\'urgence lumineux',
    'Haut-parleur haute puissance',
    'Microphone antibruit',
    'Voyant d\'état LED',
    'Résistant aux vandalismes'
  ] as any,

  maintenanceRequirements: [
    'Test de fonctionnement mensuel',
    'Vérification de la connexion réseau',
    'Nettoyage du boîtier',
    'Inspection des joints d\'étanchéité',
    'Mise à jour du firmware'
  ] as any,

  certifications: ['FCC', 'CE', 'UL', 'IP65'] as any,
  
  usageInstructions: [
    'Appuyer sur le bouton d\'urgence',
    'Parler clairement dans le microphone',
    'Attendre la réponse du centre d\'appels',
    'Décrire la nature de l\'urgence',
    'Rester en ligne selon instructions'
  ] as any,

  installationRequirements: [
    'Hauteur 1.2-1.5m du sol',
    'Éclairage suffisant',
    'Protection contre les dommages',
    'Signalisation visible',
    'Connexion réseau stable'
  ] as any,

  storageConditions: 'Installation permanente extérieure/intérieure',
  
  inspectionCriteria: [
    'Qualité de la communication',
    'Fonctionnement du bouton d\'urgence',
    'État du voyant LED',
    'Intégrité du boîtier',
    'Connexion réseau active'
  ] as any
});

// =================== EXPORT DES ÉQUIPEMENTS D'URGENCE ===================

export const emergencyEquipment = [
  firstAidKit,
  fireExtinguisherABC,
  emergencyEyewash,
  emergencyPhone
];

export default emergencyEquipment;
