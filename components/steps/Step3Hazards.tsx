"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, Search, Filter, CheckCircle, Shield, Eye, 
  Zap, Wrench, Wind, Thermometer, Volume2, Activity,
  Plus, BarChart3, Star
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step3HazardsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Hazard {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  selected: boolean;
  controlMeasures: ControlMeasure[];
}

interface ControlMeasure {
  id: string;
  name: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  priority: number;
  implemented: boolean;
  responsible?: string;
  deadline?: string;
  notes?: string;
  standards?: Standard[];
}

interface Standard {
  id: string;
  name: string;
  fullName: string;
  url?: string;
  section?: string;
  description: string;
  mandatory: boolean;
}

// =================== DANGERS PRÉDÉFINIS COMPLETS ===================
const hazardsList: Hazard[] = [
  // ÉLECTRIQUES
  {
    id: 'elec-shock',
    name: 'Électrocution / Électrisation',
    category: 'Électrique',
    description: 'Contact direct ou indirect avec parties sous tension',
    riskLevel: 'critical',
    legislation: 'CSA Z462, RSST Art. 185',
    icon: '⚡',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-elec-1', 
        name: 'Consignation LOTO complète', 
        category: 'elimination', 
        description: 'Isolation complète des sources d\'énergie', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z460', name: 'CSA Z460', fullName: 'Maîtrise des énergies dangereuses', url: 'https://www.csagroup.org/store/product/CSA%20Z460-20/', section: 'Art. 5.2', description: 'Procédures de consignation', mandatory: true },
          { id: 'rsst-185', name: 'RSST Art. 185', fullName: 'Règlement SST - Travaux électriques', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 185-190', description: 'Obligations consignation électrique', mandatory: true }
        ]
      },
      { 
        id: 'cm-elec-2', 
        name: 'Vérification absence de tension (VAT)', 
        category: 'engineering', 
        description: 'Test avec voltmètre certifié', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z462', name: 'CSA Z462', fullName: 'Sécurité en milieu de travail - Énergie électrique', url: 'https://www.csagroup.org/store/product/CSA%20Z462-21/', section: 'Art. 6.3', description: 'Procédures de vérification', mandatory: true },
          { id: 'ieee-1048', name: 'IEEE 1048', fullName: 'Guide for Protective Grounding', url: 'https://standards.ieee.org/ieee/1048/', section: 'Section 4', description: 'Tests de vérification', mandatory: false }
        ]
      },
      { 
        id: 'cm-elec-3', 
        name: 'Gants isolants classe appropriée', 
        category: 'ppe', 
        description: 'Gants diélectriques testés', 
        priority: 3, 
        implemented: false,
        standards: [
          { id: 'astm-d120', name: 'ASTM D120', fullName: 'Rubber Insulating Gloves', url: 'https://www.astm.org/d0120-20.html', section: 'Table 1', description: 'Classification des gants isolants', mandatory: true },
          { id: 'csa-z94.4', name: 'CSA Z94.4', fullName: 'Sélection, utilisation et entretien des protecteurs oculaires et faciaux', url: 'https://www.csagroup.org/store/product/CSA%20Z94.4-18/', section: 'Section 5', description: 'EPI électrique', mandatory: true }
        ]
      },
      { 
        id: 'cm-elec-4', 
        name: 'Formation électrique qualifiée', 
        category: 'administrative', 
        description: 'Personnel certifié travaux électriques', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'cnesst-guide', name: 'Guide CNESST', fullName: 'Guide de prévention - Travaux électriques', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/travaux-electriques', section: 'Section 3', description: 'Formation requise', mandatory: true },
          { id: 'nfpa-70e', name: 'NFPA 70E', fullName: 'Electrical Safety in the Workplace', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70E', section: 'Art. 110.2', description: 'Formation sécurité électrique', mandatory: false }
        ]
      },
      { 
        id: 'cm-elec-5', 
        name: 'Double vérification par témoin', 
        category: 'administrative', 
        description: 'Validation croisée des procédures', 
        priority: 3, 
        implemented: false,
        standards: [
          { id: 'rsst-185', name: 'RSST Art. 185', fullName: 'Règlement SST - Travaux électriques', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 185.1', description: 'Vérification obligatoire', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'arc-flash',
    name: 'Arc électrique',
    category: 'Électrique',
    description: 'Arc électrique lors de manœuvres sous tension',
    riskLevel: 'critical',
    legislation: 'CSA Z462, NFPA 70E',
    icon: '🔥',
    selected: false,
    controlMeasures: [
      { id: 'cm-arc-1', name: 'Analyse d\'arc électrique', category: 'engineering', description: 'Calcul énergie incidente', priority: 1, implemented: false },
      { id: 'cm-arc-2', name: 'Vêtements résistants à l\'arc', category: 'ppe', description: 'Habit arc-flash certifié', priority: 1, implemented: false },
      { id: 'cm-arc-3', name: 'Distance de sécurité respectée', category: 'administrative', description: 'Périmètre de protection', priority: 2, implemented: false },
      { id: 'cm-arc-4', name: 'Procédures de manœuvre sécuritaires', category: 'administrative', description: 'Protocoles standardisés', priority: 2, implemented: false }
    ]
  },
  {
    id: 'overhead-lines',
    name: 'Lignes électriques aériennes',
    category: 'Électrique',
    description: 'Contact avec lignes électriques extérieures',
    riskLevel: 'critical',
    legislation: 'RSST Art. 185-190',
    icon: '🌩️',
    selected: false,
    controlMeasures: [
      { id: 'cm-lines-1', name: 'Distance de sécurité minimale', category: 'administrative', description: 'Respecter zones de protection', priority: 1, implemented: false },
      { id: 'cm-lines-2', name: 'Surveillance dédiée', category: 'administrative', description: 'Signaleur spécialisé', priority: 1, implemented: false },
      { id: 'cm-lines-3', name: 'Isolation/mise hors tension', category: 'elimination', description: 'Coordination avec utilités', priority: 1, implemented: false },
      { id: 'cm-lines-4', name: 'Équipements non conducteurs', category: 'engineering', description: 'Matériaux diélectriques', priority: 2, implemented: false }
    ]
  },

  // MÉCANIQUES
  {
    id: 'moving-parts',
    name: 'Pièces mobiles',
    category: 'Mécanique',
    description: 'Écrasement, coincement par pièces mobiles',
    riskLevel: 'high',
    legislation: 'RSST Art. 182-184',
    icon: '⚙️',
    selected: false,
    controlMeasures: [
      { id: 'cm-mech-1', name: 'Arrêt complet des équipements', category: 'elimination', description: 'Immobilisation totale', priority: 1, implemented: false },
      { id: 'cm-mech-2', name: 'Consignation mécanique', category: 'elimination', description: 'Blocage physique', priority: 1, implemented: false },
      { id: 'cm-mech-3', name: 'Protecteurs mécaniques', category: 'engineering', description: 'Barrières physiques', priority: 2, implemented: false },
      { id: 'cm-mech-4', name: 'Détecteurs de présence', category: 'engineering', description: 'Capteurs de sécurité', priority: 3, implemented: false },
      { id: 'cm-mech-5', name: 'Formation LOTO mécanique', category: 'administrative', description: 'Procédures de consignation', priority: 2, implemented: false }
    ]
  },
  {
    id: 'pressure',
    name: 'Systèmes sous pression',
    category: 'Mécanique',
    description: 'Explosion, projection due à la pression',
    riskLevel: 'high',
    legislation: 'CSA B51',
    icon: '💨',
    selected: false,
    controlMeasures: [
      { id: 'cm-press-1', name: 'Dépressurisation complète', category: 'elimination', description: 'Évacuation totale pression', priority: 1, implemented: false },
      { id: 'cm-press-2', name: 'Soupapes de sécurité', category: 'engineering', description: 'Protection surpression', priority: 2, implemented: false },
      { id: 'cm-press-3', name: 'Manomètres de contrôle', category: 'engineering', description: 'Surveillance continue', priority: 3, implemented: false },
      { id: 'cm-press-4', name: 'Procédures de purge', category: 'administrative', description: 'Protocoles standardisés', priority: 2, implemented: false }
    ]
  },
  {
    id: 'lifting-equipment',
    name: 'Équipements de levage',
    category: 'Mécanique',
    description: 'Chute de charge, basculement d\'équipement',
    riskLevel: 'high',
    legislation: 'RSST Art. 260-290, CSA B335',
    icon: '🏗️',
    selected: false,
    controlMeasures: [
      { id: 'cm-lift-1', name: 'Inspection quotidienne', category: 'administrative', description: 'Vérification pré-utilisation', priority: 1, implemented: false },
      { id: 'cm-lift-2', name: 'Certification des équipements', category: 'administrative', description: 'Inspection annuelle certifiée', priority: 1, implemented: false },
      { id: 'cm-lift-3', name: 'Formation opérateurs', category: 'administrative', description: 'Certification spécialisée', priority: 2, implemented: false },
      { id: 'cm-lift-4', name: 'Plan de levage', category: 'administrative', description: 'Procédures documentées', priority: 2, implemented: false },
      { id: 'cm-lift-5', name: 'Signaleur qualifié', category: 'administrative', description: 'Communication sécuritaire', priority: 2, implemented: false }
    ]
  },

  // PHYSIQUES
  {
    id: 'falls',
    name: 'Chutes de hauteur',
    category: 'Physique',
    description: 'Chutes de plus de 3 mètres',
    riskLevel: 'critical',
    legislation: 'RSST Art. 347, CSA Z259',
    icon: '🪂',
    selected: false,
    controlMeasures: [
      { id: 'cm-fall-1', name: 'Garde-corps permanents', category: 'engineering', description: 'Barrières de protection', priority: 1, implemented: false },
      { id: 'cm-fall-2', name: 'Harnais de sécurité', category: 'ppe', description: 'Système antichute', priority: 1, implemented: false },
      { id: 'cm-fall-3', name: 'Filets de sécurité', category: 'engineering', description: 'Protection collective', priority: 2, implemented: false },
      { id: 'cm-fall-4', name: 'Points d\'ancrage certifiés', category: 'engineering', description: 'Ancrages structuraux', priority: 1, implemented: false },
      { id: 'cm-fall-5', name: 'Formation travail en hauteur', category: 'administrative', description: 'Certification hauteur', priority: 2, implemented: false }
    ]
  },
  {
    id: 'scaffolding',
    name: 'Échafaudages',
    category: 'Physique',
    description: 'Effondrement, instabilité des échafaudages',
    riskLevel: 'high',
    legislation: 'RSST Art. 347-350, CSA S269.2',
    icon: '🚧',
    selected: false,
    controlMeasures: [
      { id: 'cm-scaf-1', name: 'Montage par personne compétente', category: 'administrative', description: 'Certification échafaudage', priority: 1, implemented: false },
      { id: 'cm-scaf-2', name: 'Inspection quotidienne', category: 'administrative', description: 'Vérification stabilité', priority: 1, implemented: false },
      { id: 'cm-scaf-3', name: 'Ancrage adéquat', category: 'engineering', description: 'Fixation structure', priority: 1, implemented: false },
      { id: 'cm-scaf-4', name: 'Protection périmètre', category: 'engineering', description: 'Garde-corps complets', priority: 2, implemented: false },
      { id: 'cm-scaf-5', name: 'Étiquetage sécurité', category: 'administrative', description: 'Statut utilisation', priority: 3, implemented: false }
    ]
  },
  {
    id: 'struck-objects',
    name: 'Objets qui tombent',
    category: 'Physique',
    description: 'Impact d\'objets en chute libre',
    riskLevel: 'high',
    legislation: 'RSST Art. 338',
    icon: '⬇️',
    selected: false,
    controlMeasures: [
      { id: 'cm-obj-1', name: 'Casque de protection', category: 'ppe', description: 'Protection crânienne', priority: 1, implemented: false },
      { id: 'cm-obj-2', name: 'Périmètre de sécurité', category: 'administrative', description: 'Zone d\'exclusion', priority: 1, implemented: false },
      { id: 'cm-obj-3', name: 'Filets de protection', category: 'engineering', description: 'Barrières anti-chute', priority: 2, implemented: false },
      { id: 'cm-obj-4', name: 'Inspection outillage', category: 'administrative', description: 'Vérification fixation', priority: 2, implemented: false }
    ]
  },

  // ESPACES CLOS (Ajout CNESST prioritaire)
  {
    id: 'confined-spaces',
    name: 'Espaces clos',
    category: 'Physique',
    description: 'Atmosphères dangereuses, englouti ssement',
    riskLevel: 'critical',
    legislation: 'RSST Art. 302-317',
    icon: '🕳️',
    selected: false,
    controlMeasures: [
      { id: 'cm-conf-1', name: 'Permis d\'entrée', category: 'administrative', description: 'Autorisation documentée', priority: 1, implemented: false },
      { id: 'cm-conf-2', name: 'Test atmosphérique', category: 'engineering', description: 'Détection 4 gaz minimum', priority: 1, implemented: false },
      { id: 'cm-conf-3', name: 'Ventilation forcée', category: 'engineering', description: 'Renouvellement d\'air', priority: 1, implemented: false },
      { id: 'cm-conf-4', name: 'Surveillance continue', category: 'administrative', description: 'Surveillant extérieur', priority: 1, implemented: false },
      { id: 'cm-conf-5', name: 'Équipe de sauvetage', category: 'administrative', description: 'Plan d\'urgence', priority: 1, implemented: false },
      { id: 'cm-conf-6', name: 'Communication continue', category: 'engineering', description: 'Liaison radio/visuelle', priority: 2, implemented: false },
      { id: 'cm-conf-7', name: 'Harnais et treuil', category: 'ppe', description: 'Système de récupération', priority: 2, implemented: false }
    ]
  },

  // CHIMIQUES
  {
    id: 'toxic-vapors',
    name: 'Vapeurs toxiques',
    category: 'Chimique',
    description: 'Inhalation de substances dangereuses',
    riskLevel: 'high',
    legislation: 'RSST Art. 44, SIMDUT',
    icon: '☠️',
    selected: false,
    controlMeasures: [
      { id: 'cm-chem-1', name: 'Ventilation mécanique', category: 'engineering', description: 'Extraction d\'air', priority: 1, implemented: false },
      { id: 'cm-chem-2', name: 'Appareil respiratoire', category: 'ppe', description: 'Protection respiratoire', priority: 1, implemented: false },
      { id: 'cm-chem-3', name: 'Détection de gaz', category: 'engineering', description: 'Surveillance atmosphère', priority: 2, implemented: false },
      { id: 'cm-chem-4', name: 'Fiches de données sécurité', category: 'administrative', description: 'Information produits', priority: 3, implemented: false }
    ]
  },
  {
    id: 'chemical-burns',
    name: 'Brûlures chimiques',
    category: 'Chimique',
    description: 'Contact avec substances corrosives',
    riskLevel: 'medium',
    legislation: 'SIMDUT 2015',
    icon: '🧪',
    selected: false,
    controlMeasures: [
      { id: 'cm-burn-1', name: 'Gants chimiques', category: 'ppe', description: 'Protection cutanée', priority: 1, implemented: false },
      { id: 'cm-burn-2', name: 'Douche d\'urgence', category: 'engineering', description: 'Rinçage immédiat', priority: 1, implemented: false },
      { id: 'cm-burn-3', name: 'Lunettes de protection', category: 'ppe', description: 'Protection oculaire', priority: 2, implemented: false },
      { id: 'cm-burn-4', name: 'Protocole d\'urgence', category: 'administrative', description: 'Procédures d\'accident', priority: 2, implemented: false }
    ]
  },
  {
    id: 'asbestos',
    name: 'Amiante',
    category: 'Chimique',
    description: 'Exposition aux fibres d\'amiante',
    riskLevel: 'critical',
    legislation: 'RSST Art. 30-52',
    icon: '🫁',
    selected: false,
    controlMeasures: [
      { id: 'cm-asb-1', name: 'Caractérisation préalable', category: 'engineering', description: 'Identification matériaux', priority: 1, implemented: false },
      { id: 'cm-asb-2', name: 'Confinement zone', category: 'engineering', description: 'Isolation étanche', priority: 1, implemented: false },
      { id: 'cm-asb-3', name: 'Ventilation à pression négative', category: 'engineering', description: 'Extraction sécurisée', priority: 1, implemented: false },
      { id: 'cm-asb-4', name: 'Combinaison jetable', category: 'ppe', description: 'Vêtements étanches', priority: 1, implemented: false },
      { id: 'cm-asb-5', name: 'Respirateur P100', category: 'ppe', description: 'Protection respiratoire', priority: 1, implemented: false },
      { id: 'cm-asb-6', name: 'Décontamination', category: 'administrative', description: 'Procédures sortie', priority: 1, implemented: false }
    ]
  },

  // ERGONOMIQUES
  {
    id: 'manual-handling',
    name: 'Manutention manuelle',
    category: 'Ergonomique',
    description: 'Troubles musculo-squelettiques',
    riskLevel: 'medium',
    legislation: 'RSST Art. 166',
    icon: '🏋️',
    selected: false,
    controlMeasures: [
      { id: 'cm-man-1', name: 'Équipements d\'aide', category: 'engineering', description: 'Outils de levage', priority: 1, implemented: false },
      { id: 'cm-man-2', name: 'Techniques de levage', category: 'administrative', description: 'Formation postures', priority: 2, implemented: false },
      { id: 'cm-man-3', name: 'Rotation des tâches', category: 'administrative', description: 'Limitation exposition', priority: 3, implemented: false },
      { id: 'cm-man-4', name: 'Limites de poids', category: 'administrative', description: 'Restrictions charges', priority: 2, implemented: false }
    ]
  },
  {
    id: 'repetitive-work',
    name: 'Travail répétitif',
    category: 'Ergonomique',
    description: 'Mouvements répétitifs, postures contraignantes',
    riskLevel: 'medium',
    legislation: 'Guide CNESST TMS',
    icon: '🔄',
    selected: false,
    controlMeasures: [
      { id: 'cm-rep-1', name: 'Rotation des postes', category: 'administrative', description: 'Alternance des tâches', priority: 1, implemented: false },
      { id: 'cm-rep-2', name: 'Pauses actives', category: 'administrative', description: 'Récupération régulière', priority: 2, implemented: false },
      { id: 'cm-rep-3', name: 'Amélioration ergonomique', category: 'engineering', description: 'Adaptation postes', priority: 2, implemented: false },
      { id: 'cm-rep-4', name: 'Formation postures', category: 'administrative', description: 'Sensibilisation TMS', priority: 3, implemented: false }
    ]
  },

  // ENVIRONNEMENTAUX
  {
    id: 'extreme-weather',
    name: 'Conditions météo extrêmes',
    category: 'Environnemental',
    description: 'Exposition aux intempéries',
    riskLevel: 'medium',
    legislation: 'Guide CNESST',
    icon: '🌪️',
    selected: false,
    controlMeasures: [
      { id: 'cm-weather-1', name: 'Surveillance météorologique', category: 'administrative', description: 'Veille conditions', priority: 1, implemented: false },
      { id: 'cm-weather-2', name: 'Vêtements adaptés', category: 'ppe', description: 'Protection climatique', priority: 2, implemented: false },
      { id: 'cm-weather-3', name: 'Abris temporaires', category: 'engineering', description: 'Protection physique', priority: 3, implemented: false },
      { id: 'cm-weather-4', name: 'Arrêt travaux si nécessaire', category: 'administrative', description: 'Protocole suspension', priority: 1, implemented: false }
    ]
  },
  {
    id: 'heat-stress',
    name: 'Stress thermique',
    category: 'Environnemental',
    description: 'Coups de chaleur, épuisement',
    riskLevel: 'high',
    legislation: 'Guide CNESST Coup de chaleur',
    icon: '🌡️',
    selected: false,
    controlMeasures: [
      { id: 'cm-heat-1', name: 'Surveillance température', category: 'engineering', description: 'Mesure WBGT', priority: 1, implemented: false },
      { id: 'cm-heat-2', name: 'Hydratation fréquente', category: 'administrative', description: 'Pauses boisson', priority: 1, implemented: false },
      { id: 'cm-heat-3', name: 'Zones d\'ombre/climatisées', category: 'engineering', description: 'Repos au frais', priority: 2, implemented: false },
      { id: 'cm-heat-4', name: 'Vêtements légers/respirants', category: 'ppe', description: 'Adaptation vestimentaire', priority: 3, implemented: false },
      { id: 'cm-heat-5', name: 'Rotation équipes', category: 'administrative', description: 'Limitation exposition', priority: 2, implemented: false }
    ]
  },
  {
    id: 'noise',
    name: 'Exposition au bruit',
    category: 'Environnemental',
    description: 'Dommages auditifs',
    riskLevel: 'medium',
    legislation: 'RSST Art. 141-151',
    icon: '🔊',
    selected: false,
    controlMeasures: [
      { id: 'cm-noise-1', name: 'Protection auditive', category: 'ppe', description: 'Bouchons/casques', priority: 1, implemented: false },
      { id: 'cm-noise-2', name: 'Mesure sonométrique', category: 'engineering', description: 'Évaluation exposition', priority: 2, implemented: false },
      { id: 'cm-noise-3', name: 'Rotation équipes', category: 'administrative', description: 'Limitation temps', priority: 3, implemented: false },
      { id: 'cm-noise-4', name: 'Encoffrement machines', category: 'engineering', description: 'Réduction à la source', priority: 2, implemented: false }
    ]
  },
  {
    id: 'spills',
    name: 'Déversements',
    category: 'Environnemental',
    description: 'Déversement de fluides (huile, carburant, produits chimiques)',
    riskLevel: 'high',
    legislation: 'RSST Art. 44, LQE, SIMDUT',
    icon: '🛢️',
    selected: false,
    controlMeasures: [
      { id: 'cm-spill-1', name: 'Rétention primaire', category: 'engineering', description: 'Bacs de rétention, plateformes étanches', priority: 1, implemented: false },
      { id: 'cm-spill-2', name: 'Kit de déversement', category: 'engineering', description: 'Absorbants, barrières, contenants', priority: 1, implemented: false },
      { id: 'cm-spill-3', name: 'Plan d\'intervention déversement', category: 'administrative', description: 'Procédures d\'urgence documentées', priority: 2, implemented: false },
      { id: 'cm-spill-4', name: 'Formation intervention déversement', category: 'administrative', description: 'Personnel formé aux procédures', priority: 2, implemented: false },
      { id: 'cm-spill-5', name: 'Inspection contenants', category: 'administrative', description: 'Vérification étanchéité régulière', priority: 3, implemented: false },
      { id: 'cm-spill-6', name: 'Substitution produits moins dangereux', category: 'substitution', description: 'Remplacement par alternatives', priority: 2, implemented: false },
      { id: 'cm-spill-7', name: 'Surveillance environnementale', category: 'engineering', description: 'Détecteurs, monitoring', priority: 3, implemented: false },
      { id: 'cm-spill-8', name: 'EPI protection chimique', category: 'ppe', description: 'Gants, bottes, vêtements étanches', priority: 3, implemented: false }
    ]
  },
  {
    id: 'environmental-contamination',
    name: 'Contamination environnementale',
    category: 'Environnemental',
    description: 'Pollution sol, eau, air par substances dangereuses',
    riskLevel: 'high',
    legislation: 'LQE, LCPE, Règlements municipaux',
    icon: '🌍',
    selected: false,
    controlMeasures: [
      { id: 'cm-env-1', name: 'Caractérisation environnementale', category: 'engineering', description: 'Analyse sol/eau existante', priority: 1, implemented: false },
      { id: 'cm-env-2', name: 'Confinement zones contaminées', category: 'engineering', description: 'Isolation physique', priority: 1, implemented: false },
      { id: 'cm-env-3', name: 'Gestion déchets dangereux', category: 'administrative', description: 'Collecte et élimination sécuritaires', priority: 2, implemented: false },
      { id: 'cm-env-4', name: 'Permis environnementaux', category: 'administrative', description: 'Autorisations gouvernementales', priority: 1, implemented: false },
      { id: 'cm-env-5', name: 'Monitoring environnemental', category: 'engineering', description: 'Surveillance continue qualité', priority: 2, implemented: false },
      { id: 'cm-env-6', name: 'Plan de restauration', category: 'administrative', description: 'Procédures de remise en état', priority: 3, implemented: false }
    ]
  },

  // RISQUES PSYCHOSOCIAUX (Ajout important CNESST)
  {
    id: 'workplace-violence',
    name: 'Violence au travail',
    category: 'Psychosocial',
    description: 'Violence physique ou psychologique',
    riskLevel: 'high',
    legislation: 'LSST Art. 2.1, RSST',
    icon: '⚠️',
    selected: false,
    controlMeasures: [
      { id: 'cm-viol-1', name: 'Politique tolérance zéro', category: 'administrative', description: 'Cadre disciplinaire clair', priority: 1, implemented: false },
      { id: 'cm-viol-2', name: 'Formation sensibilisation', category: 'administrative', description: 'Prévention violence', priority: 2, implemented: false },
      { id: 'cm-viol-3', name: 'Procédures de signalement', category: 'administrative', description: 'Canaux sécurisés', priority: 2, implemented: false },
      { id: 'cm-viol-4', name: 'Support aux victimes', category: 'administrative', description: 'Aide psychologique', priority: 2, implemented: false },
      { id: 'cm-viol-5', name: 'Aménagement sécuritaire', category: 'engineering', description: 'Environnement protégé', priority: 3, implemented: false }
    ]
  },
  {
    id: 'harassment',
    name: 'Harcèlement psychologique',
    category: 'Psychosocial',
    description: 'Conduites vexatoires répétées',
    riskLevel: 'medium',
    legislation: 'Loi sur les normes du travail',
    icon: '😰',
    selected: false,
    controlMeasures: [
      { id: 'cm-har-1', name: 'Politique anti-harcèlement', category: 'administrative', description: 'Cadre préventif', priority: 1, implemented: false },
      { id: 'cm-har-2', name: 'Formation gestionnaires', category: 'administrative', description: 'Détection et intervention', priority: 2, implemented: false },
      { id: 'cm-har-3', name: 'Enquête indépendante', category: 'administrative', description: 'Investigation impartiale', priority: 2, implemented: false },
      { id: 'cm-har-4', name: 'Mesures correctives', category: 'administrative', description: 'Actions disciplinaires', priority: 2, implemented: false }
    ]
  },

  // INCENDIE/EXPLOSION (Ajout important)
  {
    id: 'fire-explosion',
    name: 'Incendie/Explosion',
    category: 'Incendie',
    description: 'Feu, explosion de matières inflammables',
    riskLevel: 'critical',
    legislation: 'Code de construction, NFPA',
    icon: '🔥',
    selected: false,
    controlMeasures: [
      { id: 'cm-fire-1', name: 'Permis de travail à chaud', category: 'administrative', description: 'Autorisation soudage/coupage', priority: 1, implemented: false },
      { id: 'cm-fire-2', name: 'Surveillance incendie', category: 'administrative', description: 'Garde-feu spécialisé', priority: 1, implemented: false },
      { id: 'cm-fire-3', name: 'Extinction à portée', category: 'engineering', description: 'Extincteurs appropriés', priority: 1, implemented: false },
      { id: 'cm-fire-4', name: 'Ventilation explosion', category: 'engineering', description: 'Évacuation vapeurs', priority: 2, implemented: false },
      { id: 'cm-fire-5', name: 'Zone dégagée', category: 'administrative', description: 'Élimination combustibles', priority: 2, implemented: false }
    ]
  },

  // CIRCULATION/TRANSPORT (Ajout important chantiers)
  {
    id: 'vehicle-traffic',
    name: 'Circulation véhiculaire',
    category: 'Transport',
    description: 'Collision avec véhicules, engins',
    riskLevel: 'high',
    legislation: 'RSST Art. 320-340, Code sécurité routière',
    icon: '🚛',
    selected: false,
    controlMeasures: [
      { id: 'cm-traf-1', name: 'Signalisation temporaire', category: 'engineering', description: 'Cônes, panneaux, feux', priority: 1, implemented: false },
      { id: 'cm-traf-2', name: 'Vêtements haute visibilité', category: 'ppe', description: 'Gilets rétroréfléchissants', priority: 1, implemented: false },
      { id: 'cm-traf-3', name: 'Séparation zones', category: 'engineering', description: 'Barrières physiques', priority: 2, implemented: false },
      { id: 'cm-traf-4', name: 'Signaleur certifié', category: 'administrative', description: 'Contrôle circulation', priority: 2, implemented: false },
      { id: 'cm-traf-5', name: 'Plan de circulation', category: 'administrative', description: 'Procédures documentées', priority: 3, implemented: false }
    ]
  }
];

const Step3Hazards: React.FC<Step3HazardsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hazards, setHazards] = useState<Hazard[]>(() => {
    if (formData.hazards?.list && formData.hazards.list.length > 0) {
      return formData.hazards.list;
    }
    return hazardsList;
  });

  // Filtrage des dangers
  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch = hazard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hazard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques
  const categories = Array.from(new Set(hazards.map(h => h.category)));
  
  // Dangers sélectionnés
  const selectedHazards = hazards.filter(h => h.selected);

  // =================== HANDLERS ===================
  const handleHazardToggle = (hazardId: string) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? { ...hazard, selected: !hazard.selected }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const handleControlMeasureToggle = (hazardId: string, controlId: string) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? {
            ...hazard,
            controlMeasures: hazard.controlMeasures.map(control =>
              control.id === controlId
                ? { ...control, implemented: !control.implemented }
                : control
            )
          }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const updateControlMeasure = (hazardId: string, controlId: string, field: keyof ControlMeasure, value: any) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? {
            ...hazard,
            controlMeasures: hazard.controlMeasures.map(control =>
              control.id === controlId
                ? { ...control, [field]: value }
                : control
            )
          }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const updateFormData = (updatedHazards: Hazard[]) => {
    const selectedList = updatedHazards.filter(h => h.selected);
    const totalControls = selectedList.reduce((sum, h) => sum + h.controlMeasures.length, 0);
    const implementedControls = selectedList.reduce((sum, h) => 
      sum + h.controlMeasures.filter(c => c.implemented).length, 0
    );

    const hazardsData = {
      list: updatedHazards,
      selected: selectedList,
      stats: {
        totalHazards: selectedList.length,
        totalControls,
        implementedControls,
        implementationRate: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
        criticalHazards: selectedList.filter(h => h.riskLevel === 'critical').length,
        highRiskHazards: selectedList.filter(h => h.riskLevel === 'high').length
      }
    };
    
    onDataChange('hazards', hazardsData);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return '🔴 Critique';
      case 'high': return '🟠 Élevé';
      case 'medium': return '🟡 Moyen';
      case 'low': return '🟢 Faible';
      default: return '⚪ Indéterminé';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Électrique': return '⚡';
      case 'Mécanique': return '⚙️';
      case 'Physique': return '🏗️';
      case 'Chimique': return '🧪';
      case 'Ergonomique': return '🏋️';
      case 'Environnemental': return '🌪️';
      case 'Psychosocial': return '🧠';
      case 'Incendie': return '🔥';
      case 'Transport': return '🚛';
      default: return '⚠️';
    }
  };

  const getControlCategoryColor = (category: string) => {
    switch (category) {
      case 'elimination': return 'red';
      case 'substitution': return 'orange';
      case 'engineering': return 'blue';
      case 'administrative': return 'purple';
      case 'ppe': return 'green';
      default: return 'gray';
    }
  };

  const getControlCategoryLabel = (category: string) => {
    switch (category) {
      case 'elimination': return '❌ Élimination';
      case 'substitution': return '🔄 Substitution';
      case 'engineering': return '🔧 Ingénierie';
      case 'administrative': return '📋 Administrative';
      case 'ppe': return '🛡️ EPI';
      default: return '❓ Autre';
    }
  };

  // Debug
  console.log('Total hazards:', hazards.length);
  console.log('Filtered hazards:', filteredHazards.length);
  console.log('Selected hazards:', selectedHazards.length);

  return (
    <>
      {/* CSS pour Step 3 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step3-container { padding: 0; }
          .summary-header { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .summary-title { color: #f59e0b; font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-value { font-size: 20px; font-weight: 800; color: #f59e0b; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #d97706; font-weight: 500; }
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #f59e0b; background: rgba(15, 23, 42, 0.9); }
          .category-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
          .category-select:focus { outline: none; border-color: #f59e0b; }
          .hazards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
          .hazard-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; transition: all 0.3s ease; cursor: pointer; position: relative; }
          .hazard-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.5); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.15); }
          .hazard-card.selected { border-color: #f59e0b; background: rgba(251, 191, 36, 0.1); }
          .hazard-card.critical::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 16px 0 0 16px; }
          .hazard-card.high::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #f97316; border-radius: 16px 0 0 16px; }
          .hazard-card.medium::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #eab308; border-radius: 16px 0 0 16px; }
          .hazard-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
          .hazard-icon { font-size: 28px; width: 40px; text-align: center; }
          .hazard-content { flex: 1; }
          .hazard-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
          .hazard-category { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .hazard-description { color: #cbd5e1; font-size: 13px; line-height: 1.4; }
          .hazard-checkbox { width: 24px; height: 24px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 6px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .hazard-checkbox.checked { background: #f59e0b; border-color: #f59e0b; color: white; }
          .hazard-details { margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
          .risk-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
          .legislation-info { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 500; }
          .controls-section { margin-top: 20px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 16px; }
          .controls-header { color: #f59e0b; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .controls-grid { display: grid; gap: 8px; }
          .control-item { display: flex; align-items: flex-start; gap: 12px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 8px; transition: all 0.3s ease; }
          .control-item:hover { background: rgba(30, 41, 59, 0.8); }
          .control-checkbox { width: 18px; height: 18px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 4px; background: rgba(15, 23, 42, 0.8); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; margin-top: 2px; }
          .control-checkbox.checked { background: #22c55e; border-color: #22c55e; color: white; }
          .control-content { flex: 1; }
          .control-name { color: #ffffff; font-size: 13px; font-weight: 500; margin-bottom: 2px; }
          .control-description { color: #94a3b8; font-size: 11px; line-height: 1.3; margin-bottom: 4px; }
          .control-meta { display: flex; gap: 8px; align-items: center; }
          .control-category { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 500; }
          .priority-indicator { width: 12px; height: 12px; border-radius: 50%; }
          .priority-1 { background: #ef4444; }
          .priority-2 { background: #f97316; }
          .priority-3 { background: #eab308; }
          .control-standards { margin-top: 8px; padding: 8px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2); }
          .standards-label { color: #60a5fa; font-size: 10px; font-weight: 600; margin-bottom: 6px; }
          .standards-list { display: flex; flex-wrap: wrap; gap: 4px; }
          .standard-item { position: relative; }
          .standard-link { text-decoration: none; display: block; transition: all 0.2s ease; }
          .standard-link:hover { transform: translateY(-1px); }
          .standard-badge { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; padding: 3px 6px; display: inline-flex; align-items: center; gap: 2px; cursor: pointer; transition: all 0.2s ease; }
          .standard-badge:hover { background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.5); }
          .standard-name { color: #60a5fa; font-size: 9px; font-weight: 600; }
          .mandatory-indicator { color: #ef4444; font-size: 8px; font-weight: 700; }
          .standard-section { color: #94a3b8; font-size: 8px; text-align: center; margin-top: 1px; }
          .standard-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.9); color: white; padding: 8px; border-radius: 6px; font-size: 10px; white-space: nowrap; max-width: 200px; white-space: normal; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
          .standard-item:hover .standard-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-8px); }
          .control-input { padding: 4px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 4px; color: #ffffff; font-size: 11px; }
          .control-input:focus { outline: none; border-color: #f59e0b; }
          .no-results { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .error-section { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-top: 24px; }
          .error-header { display: flex; align-items: center; gap: 8px; color: #f87171; margin-bottom: 8px; font-weight: 600; }
          .error-list { margin: 0; padding-left: 20px; color: #fca5a5; }
          @media (max-width: 768px) {
            .hazards-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .summary-stats { grid-template-columns: repeat(2, 1fr); }
            .control-inputs { grid-template-columns: 1fr; }
          }
        `
      }} />

      <div className="step3-container">
        {/* En-tête avec résumé */}
        <div className="summary-header">
          <div className="summary-title">
            <AlertTriangle size={24} />
            ⚠️ Identification des Dangers & Risques
          </div>
          <p style={{ color: '#d97706', margin: '0 0 8px', fontSize: '14px' }}>
            Sélectionnez les dangers potentiels et définissez les moyens de contrôle requis
          </p>
          
          {selectedHazards.length > 0 && (
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.length}</div>
                <div className="stat-label">Dangers identifiés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.filter(h => h.riskLevel === 'critical' || h.riskLevel === 'high').length}</div>
                <div className="stat-label">Risques élevés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0)}
                </div>
                <div className="stat-label">Contrôles implantés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0) > 0 
                    ? Math.round((selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0) / 
                        selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0)) * 100)
                    : 0}%
                </div>
                <div className="stat-label">Taux d'implantation</div>
              </div>
            </div>
          )}
        </div>

        {/* Section de recherche */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un danger..."
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Toutes catégories ({hazards.length})</option>
              {categories.map(category => {
                const count = hazards.filter(h => h.category === category).length;
                return (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Grille des dangers */}
        <div className="hazards-grid">
          {filteredHazards.map(hazard => {
            const isSelected = hazard.selected;
            
            return (
              <div 
                key={hazard.id} 
                className={`hazard-card ${isSelected ? 'selected' : ''} ${hazard.riskLevel}`}
              >
                {/* Header avec sélection */}
                <div className="hazard-header" onClick={() => handleHazardToggle(hazard.id)}>
                  <div className="hazard-icon">{hazard.icon}</div>
                  <div className="hazard-content">
                    <h3 className="hazard-name">{hazard.name}</h3>
                    <div className="hazard-category">{getCategoryIcon(hazard.category)} {hazard.category}</div>
                    <div className="hazard-description">{hazard.description}</div>
                  </div>
                  <div className={`hazard-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Détails du danger */}
                <div className="hazard-details">
                  <div 
                    className="risk-badge"
                    style={{ 
                      background: `rgba(${getRiskColor(hazard.riskLevel) === 'red' ? '239, 68, 68' : 
                                          getRiskColor(hazard.riskLevel) === 'orange' ? '249, 115, 22' :
                                          getRiskColor(hazard.riskLevel) === 'yellow' ? '234, 179, 8' : '34, 197, 94'}, 0.2)`,
                      color: getRiskColor(hazard.riskLevel) === 'red' ? '#f87171' : 
                             getRiskColor(hazard.riskLevel) === 'orange' ? '#fb923c' :
                             getRiskColor(hazard.riskLevel) === 'yellow' ? '#facc15' : '#4ade80'
                    }}
                  >
                    {getRiskLabel(hazard.riskLevel)}
                  </div>
                  <div className="legislation-info">{hazard.legislation}</div>
                </div>

                {/* Section moyens de contrôle (si sélectionné) */}
                {isSelected && (
                  <div className="controls-section">
                    <div className="controls-header">
                      <Shield size={16} />
                      Moyens de contrôle ({hazard.controlMeasures.filter(c => c.implemented).length}/{hazard.controlMeasures.length})
                    </div>
                    
                    <div className="controls-grid">
                      {hazard.controlMeasures
                        .sort((a, b) => a.priority - b.priority)
                        .map(control => (
                          <div key={control.id} className="control-item">
                            <div 
                              className={`control-checkbox ${control.implemented ? 'checked' : ''}`}
                              onClick={() => handleControlMeasureToggle(hazard.id, control.id)}
                            >
                              {control.implemented && <CheckCircle size={12} />}
                            </div>
                            
                            <div className="control-content">
                              <div className="control-name">{control.name}</div>
                              <div className="control-description">{control.description}</div>
                              
                              <div className="control-meta">
                                <div 
                                  className="control-category"
                                  style={{ 
                                    background: `rgba(${getControlCategoryColor(control.category) === 'red' ? '239, 68, 68' : 
                                                        getControlCategoryColor(control.category) === 'orange' ? '249, 115, 22' :
                                                        getControlCategoryColor(control.category) === 'blue' ? '59, 130, 246' :
                                                        getControlCategoryColor(control.category) === 'purple' ? '147, 51, 234' :
                                                        getControlCategoryColor(control.category) === 'green' ? '34, 197, 94' : '107, 114, 128'}, 0.2)`,
                                    color: getControlCategoryColor(control.category) === 'red' ? '#f87171' : 
                                           getControlCategoryColor(control.category) === 'orange' ? '#fb923c' :
                                           getControlCategoryColor(control.category) === 'blue' ? '#60a5fa' :
                                           getControlCategoryColor(control.category) === 'purple' ? '#a78bfa' :
                                           getControlCategoryColor(control.category) === 'green' ? '#4ade80' : '#9ca3af'
                                  }}
                                >
                                  {getControlCategoryLabel(control.category)}
                                </div>
                                <div 
                                  className={`priority-indicator priority-${control.priority}`}
                                  title={`Priorité ${control.priority}`}
                                />
                              </div>

                              {/* Standards/Normes associées */}
                              {control.standards && control.standards.length > 0 && (
                                <div className="control-standards">
                                  <div className="standards-label">📋 Normes & Références :</div>
                                  <div className="standards-list">
                                    {control.standards.map((standard, index) => (
                                      <div key={standard.id} className="standard-item">
                                        <a
                                          href={standard.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="standard-link"
                                          title={`${standard.fullName} - ${standard.description}`}
                                        >
                                          <div className="standard-badge">
                                            <span className="standard-name">{standard.name}</span>
                                            {standard.mandatory && <span className="mandatory-indicator">*</span>}
                                          </div>
                                          <div className="standard-section">{standard.section}</div>
                                        </a>
                                        <div className="standard-tooltip">
                                          <strong>{standard.fullName}</strong><br/>
                                          {standard.description}<br/>
                                          <em>{standard.mandatory ? 'Obligatoire' : 'Recommandé'}</em>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Inputs additionnels si contrôle sélectionné */}
                              {control.implemented && (
                                <div className="control-inputs">
                                  <input
                                    type="text"
                                    value={control.responsible || ''}
                                    onChange={(e) => updateControlMeasure(hazard.id, control.id, 'responsible', e.target.value)}
                                    placeholder="Responsable..."
                                    className="control-input"
                                  />
                                  <input
                                    type="date"
                                    value={control.deadline || ''}
                                    onChange={(e) => updateControlMeasure(hazard.id, control.id, 'deadline', e.target.value)}
                                    className="control-input"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredHazards.length === 0 && (
          <div className="no-results">
            <AlertTriangle size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun danger trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus de dangers</p>
          </div>
        )}

        {/* Validation d'erreurs */}
        {errors?.hazards && (
          <div className="error-section">
            <div className="error-header">
              <AlertTriangle size={20} />
              Erreurs de validation :
            </div>
            <ul className="error-list">
              {errors.hazards.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step3Hazards;
