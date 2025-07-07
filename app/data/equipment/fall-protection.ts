// app/data/equipment/fall-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise la nouvelle interface
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: Partial<SafetyEquipment>): SafetyEquipment => {
  return {
    // Valeurs par défaut
    certifications: [],
    standards: [],
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    workTypes: [],
    hazardTypes: [],
    supplier: 'Supplier TBD',
    cost: 0,
    currency: 'CAD',
    lifespan: '1 year',
    inspectionFrequency: 'monthly',
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== PROTECTION CONTRE LES CHUTES ===================

export const fullBodyHarness: SafetyEquipment = createNewEquipment({
  id: 'full_body_harness_3d',
  name: 'Harnais complet 3 points d\'ancrage',
  category: 'fall-protection',
  subcategory: 'body_harness',
  description: 'Harnais polyvalent arrêt/positionnement',
  
  specifications: {
    attachmentPoints: '3 points D (dorsal, sternal, latéraux)',
    material: 'Polyester résistant UV',
    buckles: 'Boucles auto-verrouillantes',
    padding: 'Rembourrage épaules et cuisses',
    capacity: 'Utilisateur 140kg max',
    sizes: 'S/M/L/XL/XXL',
    adjustability: 'Réglages multiples',
    webbing: 'Sangles 44mm largeur',
    weight: 1.2  // ⭐ CORRIGÉ : ~1.2 kg
  },
  
  certifications: ['CSA Z259.10', 'ANSI Z359.11', 'EN 361'],
  standards: ['CSA Z259.10', 'EN 361'],
  
  supplier: '3M DBI-SALA',
  cost: 165,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['work_at_height', 'construction_general'],
  hazardTypes: ['falls', 'suspension_trauma'],
  
  isActive: true
});

export const shockAbsorbingLanyard: SafetyEquipment = createNewEquipment({
  id: 'shock_absorbing_lanyard_6ft',
  name: 'Longe avec absorbeur de choc 6 pieds',
  category: 'fall-protection',
  subcategory: 'shock_lanyard',
  description: 'Arrêt de chute avec réduction forces',
  
  specifications: {
    length: '6 pieds (1.8m)',
    shockAbsorber: 'Déchirure contrôlée tissu',
    arresting: 'Force max 8kN (1800 lbs)',
    webbing: 'Polyester 25mm haute ténacité',
    connectors: 'Mousquetons verrouillables',
    capacity: 'Utilisateur 140kg max',
    deployment: 'Déploiement max 1.2m',
    indicators: 'Indicateur d\'impact',
    weight: 0.8  // ⭐ CORRIGÉ : ~800g = 0.8 kg
  },
  
  certifications: ['CSA Z259.11', 'ANSI Z359.13', 'EN 355'],
  standards: ['CSA Z259.11', 'EN 355'],
  
  supplier: 'Miller',
  cost: 85,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['work_at_height', 'tower_climbing'],
  hazardTypes: ['falls', 'impact_forces'],
  
  isActive: true
});

export const anchorPoint: SafetyEquipment = createNewEquipment({
  id: 'temporary_anchor_point_beam',
  name: 'Point d\'ancrage temporaire poutre',
  category: 'fall-protection',
  subcategory: 'anchor_point',
  description: 'Ancrage réutilisable pour poutrelles',
  
  specifications: {
    beamRange: 'Poutrelles 76-305mm',
    material: 'Acier galvanisé',
    capacity: '23kN (5000 lbs)',
    installation: 'Sans perçage ni soudure',
    certification: 'Point unique/multiple',
    weight: 2.3,  // ⭐ CORRIGÉ : 2.3 kg
    corrosion: 'Galvanisation à chaud',
    markings: 'Marquage capacité permanent'
  },
  
  certifications: ['CSA Z259.15', 'ANSI Z359.18', 'EN 795 Classe B'],
  standards: ['CSA Z259.15', 'EN 795'],
  
  supplier: 'Guardian Fall',
  cost: 245,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  
  workTypes: ['work_at_height', 'construction_general'],
  hazardTypes: ['falls', 'anchor_failure'],
  
  isActive: true
});

export const verticalLifeline: SafetyEquipment = createNewEquipment({
  id: 'vertical_lifeline_30ft',
  name: 'Ligne de vie verticale 30 pieds',
  category: 'fall-protection',
  subcategory: 'lifeline_system',
  description: 'Système ligne de vie auto-rétractable',
  
  specifications: {
    cableLength: '30 pieds (9m)',
    cableType: 'Câble acier galvanisé 3.2mm',
    mechanism: 'Enrouleur centrifuge',
    arrestingDistance: 'Max 0.6m en chute',
    swivel: 'Émerillon anti-torsion',
    housing: 'Boîtier aluminium étanche',
    capacity: 'Utilisateur 140kg max',
    indicators: 'Témoin de chute',
    weight: 4.5  // ⭐ CORRIGÉ : ~4.5 kg
  },
  
  certifications: ['CSA Z259.2.2', 'ANSI Z359.14', 'EN 360'],
  standards: ['CSA Z259.2.2', 'EN 360'],
  
  supplier: 'Protecta',
  cost: 485,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'monthly',
  
  workTypes: ['work_at_height', 'tower_climbing'],
  hazardTypes: ['falls', 'pendulum_swing'],
  
  isActive: true
});

export const rescueKit: SafetyEquipment = createNewEquipment({
  id: 'fall_rescue_kit_descent',
  name: 'Trousse de sauvetage descente',
  category: 'fall-protection',
  subcategory: 'rescue_equipment',
  description: 'Équipement évacuation travailleur suspendu',
  
  specifications: {
    descendingDevice: 'Descendeur auto-freiné',
    rope: 'Corde statique 11mm x 60m',
    capacity: 'Charge 280kg (2 personnes)',
    deployment: 'Déploiement rapide urgence',
    controls: 'Vitesse contrôlée descente',
    storage: 'Sac de transport étanche',
    components: 'Mousquetons, poulies, sangles',
    training: 'Formation requise',
    weight: 8.5  // ⭐ CORRIGÉ : ~8.5 kg (kit complet)
  },
  
  certifications: ['CSA Z259.1', 'NFPA 1983', 'EN 341 Classe A'],
  standards: ['CSA Z259.1', 'NFPA 1983'],
  
  supplier: 'Petzl',
  cost: 850,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'annually',
  
  workTypes: ['work_at_height', 'emergency_response'],
  hazardTypes: ['falls', 'suspension_trauma', 'rescue_delays'],
  
  isActive: true
});

// =================== EXPORT PROTECTION CHUTES ===================
export const fallProtectionEquipment = [
  fullBodyHarness,
  shockAbsorbingLanyard,
  anchorPoint,
  verticalLifeline,
  rescueKit
];

export const fallProtectionById = fallProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default fallProtectionEquipment;
