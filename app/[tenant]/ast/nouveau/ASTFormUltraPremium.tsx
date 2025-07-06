// =================== AST SECTION 1/5 FINALE - IMPORTS & INTERFACES ===================
// Section 1: Imports et Interfaces complètes corrigées pour build stable

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock, UserPlus, CheckSquare, UserCheck
} from 'lucide-react';

// =================== INTERFACES PRINCIPALES CORRIGÉES ===================
interface Photo {
  id: string;
  name: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'isolation' | 'other';
}

interface TeamMember {
  id: string;
  nom: string;
  poste: string;
  entreprise: string;
  experience: string;
  qualifications: string[];
  roleSpecifique: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  validationComments?: string;
  signature?: string;
  acknowledgmentTime?: string;
}

interface IsolationPoint {
  id: string;
  source: string;
  type: string;
  methode: string;
  responsable: string;
  notes: string;
  isole: boolean;
  photos: Photo[];
}

interface ControlMeasure {
  id: string;
  nom: string;
  description: string;
  niveau: 'Élimination' | 'Substitution' | 'Ingénierie' | 'Administrative' | 'EPI';
  isSelected: boolean;
  photos: Photo[];
  notes: string;
}

interface ElectricalHazard {
  id: string;
  code: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isSelected: boolean;
  additionalNotes?: string;
  controlMeasures: ControlMeasure[];
  showControls: boolean;
}

interface Danger {
  nom: string;
  description: string;
  categorie: string;
  present: boolean;
  niveauRisque: string;
  moyensControle: string[];
  notes: string;
}

interface SafetyEquipment {
  nom: string;
  categorie: string;
  utilise: boolean;
  conforme: boolean;
  notes: string;
  norme?: string;
}

interface TeamDiscussion {
  id: string;
  sujet: string;
  description: string;
  discute: boolean;
  notes: string;
  discussedBy: string;
  discussedAt?: string;
  priority: 'low' | 'medium' | 'high';
}

interface EmergencyProcedure {
  id: string;
  type: 'medical' | 'fire' | 'evacuation' | 'spill' | 'electrical' | 'other';
  procedure: string;
  responsiblePerson: string;
  contactInfo: string;
  isVerified: boolean;
}

interface ASTFormData {
  // Identifiants
  id: string;
  numeroAST: string;
  created: string;
  lastModified: string;
  language: 'fr' | 'en';
  status: 'draft' | 'completed' | 'team_validation' | 'approved' | 'archived';
  
  // Informations projet
  projet: string;
  lieu: string;
  descriptionTache: string;
  date: string;
  heure: string;
  responsable: string;
  dureeEstimee: string;
  conditionsMeteo: string;
  
  // Communication d'urgence
  numeroUrgence: string;
  responsableSecurite: string;
  pointRassemblement: string;
  
  // Discussions équipe
  discussionsEquipe: TeamDiscussion[];
  
  // Équipements sécurité
  equipementsSecurite: SafetyEquipment[];
  
  // Dangers identifiés
  dangersIdentifies: Danger[];
  
  // Points d'isolement
  pointsIsolement: IsolationPoint[];
  
  // Équipe
  equipe: TeamMember[];
  
  // Documentation
  photos: Photo[];
  observations: string;
  proceduresApplicables: string;
  normesReglementations: string;
  
  // Validations
  validations: Record<string, boolean>;
  approbations: Array<{
    role: string;
    nom: string;
    dateHeure: string;
    approuve: boolean;
  }>;
  
  // Historique
  electricalHazards?: ElectricalHazard[];
}

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
}

interface ASTFormProps {
  tenant: Tenant;
}

// =================== GÉNÉRATEUR DE NUMÉRO AST ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};
// =================== AST SECTION 2/5 - DONNÉES CNESST & MOYENS DE CONTRÔLE ===================
// Section 2: Moyens de contrôle réels selon CNESST/CSA Z462 et données professionnelles

// =================== HIÉRARCHIE DES MOYENS DE CONTRÔLE SELON CNESST ===================
// 1. ÉLIMINATION (le plus efficace)
// 2. SUBSTITUTION 
// 3. MESURES D'INGÉNIERIE
// 4. MESURES ADMINISTRATIVES
// 5. ÉQUIPEMENT DE PROTECTION INDIVIDUELLE (le moins efficace)

// =================== MOYENS DE CONTRÔLE PROFESSIONNELS PAR RISQUE ===================
const moyensControleCNESST: Record<string, Array<{ nom: string; niveau: string; description: string }>> = {
  // Électrocution - CSA Z462 conforme
  'Électrocution': [
    // ÉLIMINATION
    { nom: 'Mise hors tension complète', niveau: 'Élimination', description: 'Couper complètement l\'alimentation électrique et vérifier l\'absence de tension' },
    { nom: 'Travail différé', niveau: 'Élimination', description: 'Reporter les travaux pour permettre une mise hors tension sécuritaire' },
    
    // SUBSTITUTION
    { nom: 'Outils isolés certifiés', niveau: 'Substitution', description: 'Utiliser des outils isolés 1000V certifiés CSA/IEC' },
    { nom: 'Équipement basse tension', niveau: 'Substitution', description: 'Remplacer par des équipements fonctionnant à tension réduite (<50V)' },
    
    // INGÉNIERIE
    { nom: 'Consignation LOTO complète', niveau: 'Ingénierie', description: 'Lockout/Tagout selon CSA Z460 avec cadenas personnels' },
    { nom: 'Vérification absence tension (VAT)', niveau: 'Ingénierie', description: 'Utiliser VAT certifié et testé selon CSA Z462' },
    { nom: 'Mise à la terre temporaire', niveau: 'Ingénierie', description: 'Installer équipotentialité et mise à la terre de sécurité' },
    { nom: 'Barrières de protection', niveau: 'Ingénierie', description: 'Installer barrières physiques autour des zones sous tension' },
    
    // ADMINISTRATIF
    { nom: 'Formation CSA Z462', niveau: 'Administrative', description: 'Formation électrique qualifiée selon standard canadien' },
    { nom: 'Permis travail électrique', niveau: 'Administrative', description: 'Émission permis travail énergisé avec analyse risques' },
    { nom: 'Surveillance constante', niveau: 'Administrative', description: 'Présence surveillant électrique qualifié en permanence' },
    
    // EPI
    { nom: 'Gants isolants classe appropriée', niveau: 'EPI', description: 'Gants isolants testés selon tension de travail' },
    { nom: 'Chaussures isolantes CSA', niveau: 'EPI', description: 'Chaussures électriques certifiées CSA' },
    { nom: 'Casque classe E', niveau: 'EPI', description: 'Casque de sécurité classe électrique' }
  ],

  // Arc électrique - CSA Z462 2024
  'Arc électrique': [
    // ÉLIMINATION
    { nom: 'Mise hors tension systématique', niveau: 'Élimination', description: 'Éliminer complètement le risque d\'arc par mise hors tension' },
    
    // SUBSTITUTION
    { nom: 'Équipement télécommandé', niveau: 'Substitution', description: 'Utiliser perches isolantes et commandes à distance' },
    { nom: 'Technologie sans arc', niveau: 'Substitution', description: 'Remplacer par équipements à coupure sous vide ou SF6' },
    
    // INGÉNIERIE
    { nom: 'Calcul énergie incidente', niveau: 'Ingénierie', description: 'Analyse arc flash selon IEEE 1584 et CSA Z462' },
    { nom: 'Réduction courant défaut', niveau: 'Ingénierie', description: 'Installer limiteurs de courant et protections rapides' },
    { nom: 'Distance de sécurité', niveau: 'Ingénierie', description: 'Maintenir distance minimale selon calcul arc flash' },
    { nom: 'Blindage arc flash', niveau: 'Ingénierie', description: 'Installer écrans et blindages anti-arc' },
    
    // ADMINISTRATIF
    { nom: 'Étiquetage arc flash', niveau: 'Administrative', description: 'Affichage énergie incidente et PPE requis' },
    { nom: 'Procédures spécifiques', niveau: 'Administrative', description: 'Modes opératoires détaillés pour chaque équipement' },
    
    // EPI
    { nom: 'Vêtements arc flash certifiés', niveau: 'EPI', description: 'Habits résistants arc selon catégorie PPE calculée' },
    { nom: 'Casque arc flash', niveau: 'EPI', description: 'Casque avec écran facial arc flash intégré' },
    { nom: 'Gants cuir par-dessus isolants', niveau: 'EPI', description: 'Gants cuir de protection pour les gants isolants' }
  ],

  // Chute de hauteur - Réglementation québécoise
  'Chute de hauteur': [
    // ÉLIMINATION
    { nom: 'Travail au sol', niveau: 'Élimination', description: 'Modifier méthode pour effectuer travail au niveau du sol' },
    { nom: 'Préfabrication au sol', niveau: 'Élimination', description: 'Assembler les composants au sol avant installation' },
    
    // SUBSTITUTION
    { nom: 'Plateforme élévatrice', niveau: 'Substitution', description: 'Utiliser nacelle ou plateforme sécurisée au lieu d\'échelle' },
    { nom: 'Échafaudage sécurisé', niveau: 'Substitution', description: 'Monter échafaudage conforme avec garde-corps' },
    
    // INGÉNIERIE
    { nom: 'Garde-corps permanents', niveau: 'Ingénierie', description: 'Installer garde-corps 1070mm avec lisse intermédiaire' },
    { nom: 'Filets de sécurité', niveau: 'Ingénierie', description: 'Installer filets certifiés sous zone de travail' },
    { nom: 'Points d\'ancrage certifiés', niveau: 'Ingénierie', description: 'Installer ancrages 22,2 kN certifiés CSA Z259' },
    
    // ADMINISTRATIF
    { nom: 'Formation travail en hauteur', niveau: 'Administrative', description: 'Formation protection contre chutes CNESST' },
    { nom: 'Plan de sauvetage', niveau: 'Administrative', description: 'Procédure secours en cas de chute avec suspension' },
    { nom: 'Inspection quotidienne', niveau: 'Administrative', description: 'Vérification EPI et équipements avant utilisation' },
    
    // EPI
    { nom: 'Harnais complet CSA Z259', niveau: 'EPI', description: 'Harnais dorsal et sternal certifié' },
    { nom: 'Longe avec absorbeur', niveau: 'EPI', description: 'Cordon rétractable ou absorbeur d\'énergie' },
    { nom: 'Casque mentonnière', niveau: 'EPI', description: 'Casque avec jugulaire pour éviter perte' }
  ],

  // Happement mécanique
  'Happement/entraînement': [
    // ÉLIMINATION
    { nom: 'Arrêt machine complet', niveau: 'Élimination', description: 'Stopper complètement machine avant intervention' },
    
    // SUBSTITUTION
    { nom: 'Outils à distance', niveau: 'Substitution', description: 'Utiliser outils prolongateurs pour éviter proximité' },
    
    // INGÉNIERIE
    { nom: 'Protecteurs de machine', niveau: 'Ingénierie', description: 'Installer garde de sécurité avec verrouillage' },
    { nom: 'Consignation mécanique', niveau: 'Ingénierie', description: 'LOTO complet avec blocage mécanique' },
    { nom: 'Détecteurs de présence', niveau: 'Ingénierie', description: 'Capteurs laser ou rideaux lumineux' },
    { nom: 'Arrêts d\'urgence', niveau: 'Ingénierie', description: 'Boutons coup de poing accessibles' },
    
    // ADMINISTRATIF
    { nom: 'Formation sécurité machine', niveau: 'Administrative', description: 'Formation spécifique aux dangers mécaniques' },
    { nom: 'Procédures LOTO', niveau: 'Administrative', description: 'Méthodes de cadenassage documentées' },
    
    // EPI
    { nom: 'Gants résistants coupures', niveau: 'EPI', description: 'Gants niveau 3-5 selon ISO 13997' },
    { nom: 'Vêtements ajustés', niveau: 'EPI', description: 'Éviter vêtements amples près machines' }
  ],

  // Espace clos - Réglementation CNESST
  'Espace clos': [
    // ÉLIMINATION
    { nom: 'Travail extérieur', niveau: 'Élimination', description: 'Modifier processus pour éviter entrée espace clos' },
    
    // SUBSTITUTION
    { nom: 'Télécommande/robotique', niveau: 'Substitution', description: 'Utiliser équipement télécommandé ou robots' },
    
    // INGÉNIERIE
    { nom: 'Ventilation mécanique', niveau: 'Ingénierie', description: 'Ventilation forcée continue avec débit calculé' },
    { nom: 'Ouvertures multiples', niveau: 'Ingénierie', description: 'Créer entrées/sorties supplémentaires sécurisées' },
    { nom: 'Systèmes de communication', niveau: 'Ingénierie', description: 'Radio bidirectionnelle continue avec extérieur' },
    
    // ADMINISTRATIF
    { nom: 'Permis espace clos', niveau: 'Administrative', description: 'Autorisation écrite avec analyses atmosphère' },
    { nom: 'Surveillant formé', niveau: 'Administrative', description: 'Surveillant qualifié en permanence à l\'extérieur' },
    { nom: 'Plan de sauvetage', niveau: 'Administrative', description: 'Équipe secours formée avec équipement' },
    { nom: 'Tests atmosphère continus', niveau: 'Administrative', description: 'Monitoring O2, LIE, H2S, CO en continu' },
    
    // EPI
    { nom: 'Appareil respiratoire', niveau: 'EPI', description: 'ARI ou adduction d\'air selon analyse' },
    { nom: 'Harnais de récupération', niveau: 'EPI', description: 'Harnais avec point dorsal pour extraction' },
    { nom: 'Détecteur de gaz portable', niveau: 'EPI', description: 'Détecteur 4 gaz porté en permanence' }
  ]
};

// =================== DANGERS ACTUALISÉS AVEC VRAIS CONTRÔLES ===================
const dangersIdentifiesInitiaux: Danger[] = [
  // Dangers électriques critiques
  { nom: 'Électrocution', description: 'Contact direct ou indirect avec pièces sous tension pouvant causer arrêt cardiaque', categorie: 'Électrique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Arc électrique', description: 'Dégagement d\'énergie causant brûlures graves et explosion', categorie: 'Électrique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers de chute - Tolérance zéro CNESST
  { nom: 'Chute de hauteur', description: 'Chute depuis surface élevée >3m ou près ouverture', categorie: 'Chute', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Chute de plain-pied', description: 'Glissade/trébuchement sur surface niveau', categorie: 'Chute', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Chute d\'objets', description: 'Objets tombant et frappant personnes en bas', categorie: 'Chute', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers mécaniques
  { nom: 'Happement/entraînement', description: 'Capture par pièces mobiles machines/équipements', categorie: 'Mécanique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Coupure/lacération', description: 'Blessures par surfaces/objets tranchants', categorie: 'Mécanique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Écrasement', description: 'Compression par objets lourds/équipements', categorie: 'Mécanique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers incendie/explosion
  { nom: 'Incendie', description: 'Combustion matières inflammables', categorie: 'Incendie', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Explosion', description: 'Déflagration gaz/vapeurs/poussières', categorie: 'Incendie', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers chimiques
  { nom: 'Exposition substances toxiques', description: 'Contact cutané/ingestion/inhalation produits chimiques', categorie: 'Chimique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Inhalation vapeurs nocives', description: 'Respiration contaminants atmosphériques', categorie: 'Chimique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers physiques
  { nom: 'Exposition bruit excessif', description: 'Niveau sonore >85 dBA causant surdité', categorie: 'Physique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Stress thermique', description: 'Exposition chaleur excessive >WBGT', categorie: 'Physique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Hypothermie', description: 'Exposition froid extrême <-10°C', categorie: 'Physique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Vibrations main-bras', description: 'Exposition vibrations >2,5 m/s² sur 8h', categorie: 'Physique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  { nom: 'Radiations ionisantes', description: 'Exposition rayonnements nucléaires', categorie: 'Physique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers biologiques
  { nom: 'Agents biologiques', description: 'Exposition microorganismes pathogènes', categorie: 'Biologique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers ergonomiques
  { nom: 'Troubles musculo-squelettiques', description: 'Lésions par mouvements répétitifs/manutention', categorie: 'Ergonomique', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers d'espace clos - Tolérance zéro
  { nom: 'Espace clos', description: 'Travail espace confiné avec risques atmosphériques', categorie: 'Espace clos', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers circulation/véhicules
  { nom: 'Collision véhicules', description: 'Accident avec équipements mobiles/véhicules', categorie: 'Circulation', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers manutention
  { nom: 'Manutention manuelle', description: 'Soulèvement >23kg ou postures contraignantes', categorie: 'Manutention', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers équipements
  { nom: 'Défaillance équipement', description: 'Panne équipement critique ou surpression', categorie: 'Équipement', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers environnementaux
  { nom: 'Conditions météo dangereuses', description: 'Intempéries compromettant sécurité travail', categorie: 'Environnemental', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Dangers psychosociaux
  { nom: 'Stress/fatigue excessive', description: 'Épuisement affectant vigilance sécuritaire', categorie: 'Psychosocial', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' },
  
  // Autres dangers spécifiques
  { nom: 'Dangers spécifiques au site', description: 'Risques particuliers identifiés sur site', categorie: 'Autre', present: false, niveauRisque: 'Faible', moyensControle: [], notes: '' }
];

// =================== ÉQUIPEMENTS SÉCURITÉ CERTIFIÉS ===================
const equipementsSecuriteInitiaux: SafetyEquipment[] = [
  // Protection tête - CSA Z94.1
  { nom: 'Casque CSA Type 1 Classe E', categorie: 'Protection crânienne', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.1' },
  { nom: 'Casque escalade CSA Z259.1', categorie: 'Protection crânienne', utilise: false, conforme: false, notes: '', norme: 'CSA Z259.1' },
  { nom: 'Casque arc flash avec écran', categorie: 'Protection crânienne', utilise: false, conforme: false, notes: '', norme: 'ASTM F1506' },
  
  // Protection yeux/visage - CSA Z94.3
  { nom: 'Lunettes CSA Z94.3 impact', categorie: 'Protection oculaire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.3' },
  { nom: 'Écran facial polycarbonate', categorie: 'Protection oculaire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.3' },
  { nom: 'Lunettes soudage teinte variable', categorie: 'Protection oculaire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.3' },
  { nom: 'Lunettes chimiques étanches', categorie: 'Protection oculaire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.3' },
  
  // Protection respiratoire - CSA Z94.4
  { nom: 'Masque N95 certifié NIOSH', categorie: 'Protection respiratoire', utilise: false, conforme: false, notes: '', norme: 'NIOSH 42CFR84' },
  { nom: 'ARI 30min certifié CSA', categorie: 'Protection respiratoire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.4' },
  { nom: 'Demi-masque P100 + cartouches', categorie: 'Protection respiratoire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.4' },
  { nom: 'Masque complet adduction air', categorie: 'Protection respiratoire', utilise: false, conforme: false, notes: '', norme: 'CSA Z94.4' },
  
  // Protection mains - ASTM/EN
  { nom: 'Gants isolants Classe 0 (1kV)', categorie: 'Protection des mains', utilise: false, conforme: false, notes: '', norme: 'ASTM D120' },
  { nom: 'Gants isolants Classe 1 (7.5kV)', categorie: 'Protection des mains', utilise: false, conforme: false, notes: '', norme: 'ASTM D120' },
  { nom: 'Gants anti-coupure niveau 5', categorie: 'Protection des mains', utilise: false, conforme: false, notes: '', norme: 'EN 388' },
  { nom: 'Gants chimiques nitrile', categorie: 'Protection des mains', utilise: false, conforme: false, notes: '', norme: 'EN 374' },
  { nom: 'Gants cuir protection isolants', categorie: 'Protection des mains', utilise: false, conforme: false, notes: '', norme: 'ASTM D120' },
  
  // Protection pieds - CSA Z195
  { nom: 'Bottes CSA électriques EH', categorie: 'Protection des pieds', utilise: false, conforme: false, notes: '', norme: 'CSA Z195' },
  { nom: 'Chaussures CSA Vert/Triangle', categorie: 'Protection des pieds', utilise: false, conforme: false, notes: '', norme: 'CSA Z195' },
  { nom: 'Couvre-chaussures isolants', categorie: 'Protection des pieds', utilise: false, conforme: false, notes: '', norme: 'ASTM D178' },
  { nom: 'Bottes chimiques Viton', categorie: 'Protection des pieds', utilise: false, conforme: false, notes: '', norme: 'EN ISO 20345' },
  
  // Protection corps - ASTM F1506
  { nom: 'Vêtements arc flash Cat 2 (8 cal/cm²)', categorie: 'Protection corporelle', utilise: false, conforme: false, notes: '', norme: 'ASTM F1506' },
  { nom: 'Vêtements arc flash Cat 4 (40 cal/cm²)', categorie: 'Protection corporelle', utilise: false, conforme: false, notes: '', norme: 'ASTM F1506' },
  { nom: 'Veste haute visibilité Classe 2', categorie: 'Protection corporelle', utilise: false, conforme: false, notes: '', norme: 'CSA Z96' },
  { nom: 'Combinaison Tyvek QC', categorie: 'Protection corporelle', utilise: false, conforme: false, notes: '', norme: 'EN 14126' },
  { nom: 'Tablier soudeur cuir', categorie: 'Protection corporelle', utilise: false, conforme: false, notes: '', norme: 'CSA Z49.1' },
  
  // Protection chute - CSA Z259
  { nom: 'Harnais CSA Z259.10 Classe A', categorie: 'Protection antichute', utilise: false, conforme: false, notes: '', norme: 'CSA Z259.10' },
  { nom: 'Longe avec absorbeur 1.8m', categorie: 'Protection antichute', utilise: false, conforme: false, notes: '', norme: 'CSA Z259.11' },
  { nom: 'Antichute rétractable 3m', categorie: 'Protection antichute', utilise: false, conforme: false, notes: '', norme: 'CSA Z259.2.2' },
  { nom: 'Point ancrage temporaire', categorie: 'Protection antichute', utilise: false, conforme: false, notes: '', norme: 'CSA Z259.15' },
  
  // Protection électrique spécialisée
  { nom: 'Tapis isolant Classe 2', categorie: 'Protection électrique', utilise: false, conforme: false, notes: '', norme: 'ASTM D178' },
  { nom: 'Perche isolante 1m testée', categorie: 'Protection électrique', utilise: false, conforme: false, notes: '', norme: 'ASTM F711' },
  { nom: 'VAT Fluke T6-1000 certifié', categorie: 'Protection électrique', utilise: false, conforme: false, notes: '', norme: 'CSA Z462' },
  { nom: 'Cadenas consignation rouge', categorie: 'Protection électrique', utilise: false, conforme: false, notes: '', norme: 'CSA Z460' },
  { nom: 'Étiquettes LOTO personnalisées', categorie: 'Protection électrique', utilise: false, conforme: false, notes: '', norme: 'CSA Z460' },
  
  // Détection atmosphère
  { nom: 'Détecteur 4 gaz BW Honeywell', categorie: 'Détection atmosphérique', utilise: false, conforme: false, notes: '', norme: 'CSA 22.2' },
  { nom: 'Détecteur O2 portable calibré', categorie: 'Détection atmosphérique', utilise: false, conforme: false, notes: '', norme: 'CSA 22.2' },
  { nom: 'Détecteur LIE/H2S portable', categorie: 'Détection atmosphérique', utilise: false, conforme: false, notes: '', norme: 'CSA 22.2' },
  
  // Équipements urgence/secours
  { nom: 'Trousse premiers soins CSA', categorie: 'Équipement d\'urgence', utilise: false, conforme: false, notes: '', norme: 'CSA Z1220' },
  { nom: 'Douche oculaire portable', categorie: 'Équipement d\'urgence', utilise: false, conforme: false, notes: '', norme: 'ANSI Z358.1' },
  { nom: 'Radio bidirectionnelle', categorie: 'Équipement d\'urgence', utilise: false, conforme: false, notes: '', norme: 'IC RSS-119' },
  { nom: 'Éclairage LED explosion-proof', categorie: 'Équipement d\'urgence', utilise: false, conforme: false, notes: '', norme: 'CSA 22.2' },
  { nom: 'Extincteur CO2 5 lbs', categorie: 'Équipement d\'urgence', utilise: false, conforme: false, notes: '', norme: 'ULC-S508' }
];

// =================== DISCUSSIONS ÉQUIPE PROFESSIONNELLES ===================
const discussionsEquipeInitiales: TeamDiscussion[] = [
  { id: 'disc-001', sujet: 'Identification dangers tolérance zéro', description: 'Passer en revue tous les dangers critiques (électrocution, chute, espace clos, arc flash)', discute: false, notes: '', discussedBy: '', priority: 'high' },
  { id: 'disc-002', sujet: 'Procédures LOTO spécifiques site', description: 'Réviser les procédures de cadenassage et points d\'isolement', discute: false, notes: '', discussedBy: '', priority: 'high' },
  { id: 'disc-003', sujet: 'EPI obligatoires et vérifications', description: 'Confirmer disponibilité et conformité de tous les équipements requis', discute: false, notes: '', discussedBy: '', priority: 'high' },
  { id: 'disc-004', sujet: 'Permis de travail requis', description: 'Vérifier si des permis spéciaux sont nécessaires (travail à chaud, espace clos, etc.)', discute: false, notes: '', discussedBy: '', priority: 'medium' },
  { id: 'disc-005', sujet: 'Plans d\'urgence et évacuation', description: 'Revoir les procédures d\'urgence et points de rassemblement', discute: false, notes: '', discussedBy: '', priority: 'high' },
  { id: 'disc-006', sujet: 'Communications sécuritaires', description: 'Établir les moyens de communication et signalisation', discute: false, notes: '', discussedBy: '', priority: 'medium' },
  { id: 'disc-007', sujet: 'Surveillance et supervision', description: 'Définir les rôles de surveillance et fréquence des vérifications', discute: false, notes: '', discussedBy: '', priority: 'medium' },
  { id: 'disc-008', sujet: 'Signalement incidents/presqu\'accidents', description: 'Rappeler les procédures de signalement et importance du reporting', discute: false, notes: '', discussedBy: '', priority: 'medium' }
];
// =================== AST SECTION 3/5 - TRADUCTIONS, STYLES & FONCTIONS ===================
// Section 3: Traductions professionnelles, styles CSS et fonctions utilitaires

// =================== TRADUCTIONS PROFESSIONNELLES ===================
const translations = {
  fr: {
    title: "Analyse Sécuritaire de Tâches - C-Secur360",
    subtitle: "Plateforme professionnelle conforme CNESST/CSA Z462",
    saving: "Sauvegarde en cours...",
    saved: "✅ Enregistré avec succès",
    
    // Navigation et étapes
    generalInfo: "Informations Générales",
    teamDiscussion: "Discussion d'Équipe",
    safetyEquipment: "Équipements de Sécurité",
    hazardIdentification: "Identification des Dangers",
    energyIsolation: "Isolement des Énergies",
    teamManagement: "Gestion d'Équipe",
    documentation: "Documentation",
    finalValidation: "Validation Finale",
    
    // Champs de base
    project: "Projet",
    location: "Lieu",
    taskDescription: "Description de la Tâche",
    responsible: "Responsable",
    
    // Actions
    previous: "Précédent",
    next: "Suivant",
    save: "Sauvegarder",
    generatePDF: "Générer PDF",
    sendEmail: "Envoyer par Email",
    archive: "Archiver",
    submit: "Soumettre"
  },
  
  en: {
    title: "Job Safety Analysis - C-Secur360",
    subtitle: "Professional platform compliant with CNESST/CSA Z462",
    saving: "Saving...",
    saved: "✅ Successfully saved",
    
    // Navigation et étapes
    generalInfo: "General Information",
    teamDiscussion: "Team Discussion",
    safetyEquipment: "Safety Equipment",
    hazardIdentification: "Hazard Identification",
    energyIsolation: "Energy Isolation",
    teamManagement: "Team Management",
    documentation: "Documentation",
    finalValidation: "Final Validation",
    
    // Champs de base
    project: "Project",
    location: "Location",
    taskDescription: "Task Description",
    responsible: "Responsible",
    
    // Actions
    previous: "Previous",
    next: "Next",
    save: "Save",
    generatePDF: "Generate PDF",
    sendEmail: "Send Email",
    archive: "Archive",
    submit: "Submit"
  }
};

// =================== DONNÉES INITIALES OPTIMISÉES ===================
const getInitialFormData = (): ASTFormData => ({
  // Identifiants
  id: `AST-${Date.now()}`,
  numeroAST: generateASTNumber(),
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  language: 'fr',
  status: 'draft',
  
  // Informations projet
  projet: '',
  lieu: '',
  descriptionTache: '',
  date: new Date().toISOString().split('T')[0],
  heure: new Date().toTimeString().substring(0, 5),
  responsable: '',
  dureeEstimee: '',
  conditionsMeteo: '',
  
  // Communication d'urgence
  numeroUrgence: '911',
  responsableSecurite: '',
  pointRassemblement: '',
  
  // Discussions équipe
  discussionsEquipe: [...discussionsEquipeInitiales],
  
  // Équipements sécurité
  equipementsSecurite: [...equipementsSecuriteInitiaux],
  
  // Dangers identifiés
  dangersIdentifies: [...dangersIdentifiesInitiaux],
  
  // Points d'isolement
  pointsIsolement: [],
  
  // Équipe
  equipe: [],
  
  // Documentation
  photos: [],
  observations: '',
  proceduresApplicables: '',
  normesReglementations: '',
  
  // Validations
  validations: {
    infoComplete: false,
    risquesEvalues: false,
    equipementVerifie: false,
    equipeFormee: false,
    proceduresComprises: false
  },
  approbations: [
    { role: 'Superviseur', nom: '', dateHeure: '', approuve: false },
    { role: 'Responsable Sécurité', nom: '', dateHeure: '', approuve: false },
    { role: 'Client', nom: '', dateHeure: '', approuve: false }
  ]
});

// =================== STYLES CSS OPTIMISÉS MOBILE ===================
const mobileOptimizedStyles = `
/* Variables CSS pour cohérence C-Secur360 */
:root {
  --primary-blue: #3b82f6;
  --dark-blue: #1d4ed8;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --csecur-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --border-color: rgba(100, 116, 139, 0.3);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --border-radius: 12px;
  --border-radius-lg: 24px;
}

/* Base responsive optimisée */
.input-field {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: #334155;
  font-size: 16px;
  transition: all 0.3s ease;
  min-height: 44px;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(255, 255, 255, 1);
}

/* Boutons premium responsive */
.btn-primary {
  background: var(--csecur-gradient);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  font-size: 14px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-blue);
  border: 1px solid var(--border-color);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  font-size: 14px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  border-color: var(--primary-blue);
}

/* Grilles responsives */
.form-group {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .input-field {
    font-size: 16px; /* Évite zoom iOS */
    padding: 14px 16px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }
}

/* Checkbox personnalisé premium */
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.custom-checkbox.checked {
  background: var(--csecur-gradient);
  border-color: var(--primary-blue);
}

.custom-checkbox.checked::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.custom-checkbox.success.checked {
  background: var(--success-green);
  border-color: var(--success-green);
}

/* Responsive navigation mobile */
@media (max-width: 640px) {
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .glass-effect {
    border-radius: 16px;
    margin: 8px;
  }
}

/* Animation loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.saving-indicator {
  animation: pulse 2s infinite;
}
`;

// =================== FONCTIONS UTILITAIRES OPTIMISÉES ===================

// Fonction de sauvegarde Supabase simulée (SANS BOUCLE INFINIE)
const saveToSupabase = async (formData: ASTFormData): Promise<boolean> => {
  try {
    console.log('💾 Sauvegarde Supabase simulée...', formData.numeroAST);
    
    // Simulation délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulation sauvegarde réussie
    console.log('✅ Sauvegarde réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    return false;
  }
};

// Fonction d'archivage
const archiveAST = async (formData: ASTFormData): Promise<boolean> => {
  try {
    console.log('📁 Archivage AST...', formData.numeroAST);
    
    // Simulation archivage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ AST archivé avec succès');
    alert(`AST ${formData.numeroAST} archivé avec succès`);
    return true;
  } catch (error) {
    console.error('❌ Erreur archivage:', error);
    alert('Erreur lors de l\'archivage');
    return false;
  }
};

// Fonction de soumission finale
const submitAST = async (formData: ASTFormData): Promise<boolean> => {
  try {
    console.log('📤 Soumission finale AST...', formData.numeroAST);
    
    // Simulation soumission
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ AST soumis avec succès');
    alert(`AST ${formData.numeroAST} soumis et validé avec succès !`);
    return true;
  } catch (error) {
    console.error('❌ Erreur soumission:', error);
    alert('Erreur lors de la soumission');
    return false;
  }
};

// =================== GÉNÉRATION PDF PROFESSIONNELLE ===================
const generateProfessionalPDF = async (formData: ASTFormData, tenant: Tenant): Promise<boolean> => {
  try {
    console.log('📄 Génération PDF C-Secur360...');
    
    // Import dynamique jsPDF avec gestion d'erreur
    let jsPDF;
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.jsPDF;
    } catch (error) {
      console.warn('jsPDF non disponible, ouverture alternative...');
      
      // Alternative : ouvrir fenêtre d'impression
      const printContent = generatePrintableHTML(formData, tenant);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      return true;
    }
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    let currentY = 20;
    const margin = 20;
    
    // =================== EN-TÊTE PREMIUM C-SECUR360 ===================
    // Fond dégradé header
    doc.setFillColor(59, 130, 246); // primary-blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo C-Secur360 stylisé
    doc.setFillColor(255, 255, 255);
    doc.circle(35, 25, 12, 'F');
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('C-SECUR360', 55, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Plateforme Professionnelle SST', 55, 32);
    
    // Numéro AST en vedette
    doc.setFillColor(16, 185, 129); // success-green
    doc.roundedRect(140, 15, 50, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AST N°', 145, 22);
    doc.setFontSize(10);
    doc.text(formData.numeroAST, 145, 28);
    
    currentY = 60;
    
    // =================== TITRE PRINCIPAL ===================
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALYSE SÉCURITAIRE DE TÂCHES', margin, currentY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Conforme CNESST/CSA Z462 • Généré le ${new Date().toLocaleDateString('fr-CA')}`, margin, currentY + 8);
    
    currentY += 25;
    
    // =================== INFORMATIONS PROJET ===================
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 35, 3, 3, 'F');
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS PROJET', margin + 5, currentY + 5);
    
    // Données projet en colonnes
    const projectData = [
      ['Projet:', formData.projet || 'Non spécifié'],
      ['Lieu:', formData.lieu || 'Non spécifié'],
      ['Date:', formData.date || 'Non spécifié'],
      ['Responsable:', formData.responsable || 'Non spécifié']
    ];
    
    doc.setFontSize(9);
    let colY = currentY + 15;
    
    projectData.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(item[0], margin + 10, colY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(item[1], margin + 35, colY);
      
      colY += 6;
    });
    
    currentY += 45;
    
    // =================== DESCRIPTION TRAVAUX ===================
    if (formData.descriptionTache) {
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 20, 3, 3, 'F');
      
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION DES TRAVAUX', margin + 5, currentY + 5);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(formData.descriptionTache, pageWidth - 2 * margin - 10);
      doc.text(descLines, margin + 5, currentY + 12);
      
      currentY += 30;
    }
    
    // =================== RÉSUMÉ SÉCURITÉ ===================
    const selectedHazards = formData.dangersIdentifies.filter(d => d.present);
    const selectedEquipment = formData.equipementsSecurite.filter(e => e.utilise);
    
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 25, 3, 3, 'F');
    
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ SÉCURITÉ', margin + 5, currentY + 5);
    
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${selectedHazards.length} danger(s) identifié(s)`, margin + 10, currentY + 12);
    doc.text(`• ${selectedEquipment.length} équipement(s) de sécurité`, margin + 10, currentY + 18);
    doc.text(`• ${formData.equipe.length} membre(s) d'équipe`, margin + 100, currentY + 12);
    doc.text(`• ${formData.pointsIsolement.filter(p => p.isole).length} point(s) d'isolement`, margin + 100, currentY + 18);
    
    currentY += 35;
    
    // =================== PIED DE PAGE ===================
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(`Document généré par C-Secur360 • ${new Date().toLocaleString('fr-CA')}`, margin, pageHeight - 15);
    doc.text(`AST ${formData.numeroAST} • Conforme CNESST/CSA Z462`, pageWidth - margin - 60, pageHeight - 15);
    
    // Ligne de signature
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    doc.setFontSize(8);
    doc.text('Signature responsable:', margin, pageHeight - 25);
    doc.text('Date:', pageWidth - margin - 30, pageHeight - 25);
    
    // Sauvegarde du PDF
    const fileName = `AST_C-Secur360_${formData.numeroAST}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF C-Secur360 généré:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    alert('Erreur lors de la génération du PDF');
    return false;
  }
};

// =================== GÉNÉRATION HTML IMPRIMABLE ===================
const generatePrintableHTML = (formData: ASTFormData, tenant: Tenant): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AST ${formData.numeroAST} - C-Secur360</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; }
        .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .section h3 { margin-top: 0; color: #1d4ed8; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .signature { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">C-SECUR360</div>
        <div>Analyse Sécuritaire de Tâches - ${formData.numeroAST}</div>
      </div>
      
      <div class="section">
        <h3>Informations Projet</h3>
        <div class="grid">
          <div><strong>Projet:</strong> ${formData.projet}</div>
          <div><strong>Lieu:</strong> ${formData.lieu}</div>
          <div><strong>Date:</strong> ${formData.date}</div>
          <div><strong>Responsable:</strong> ${formData.responsable}</div>
        </div>
      </div>
      
      <div class="section">
        <h3>Description</h3>
        <p>${formData.descriptionTache}</p>
      </div>
      
      <div class="section">
        <h3>Résumé Sécurité</h3>
        <ul>
          <li>${formData.dangersIdentifies.filter(d => d.present).length} danger(s) identifié(s)</li>
          <li>${formData.equipementsSecurite.filter(e => e.utilise).length} équipement(s) de sécurité</li>
          <li>${formData.equipe.length} membre(s) d'équipe</li>
          <li>${formData.pointsIsolement.filter(p => p.isole).length} point(s) d'isolement</li>
        </ul>
      </div>
      
      <div class="signature">
        <div class="grid">
          <div>Signature responsable: ________________</div>
          <div>Date: ________________</div>
        </div>
      </div>
      
      <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
        Document généré par C-Secur360 • ${new Date().toLocaleDateString('fr-CA')} • Conforme CNESST/CSA Z462
      </div>
    </body>
    </html>
  `;
};

// =================== FONCTIONS EMAIL PROFESSIONNELLES ===================
const sendEmailNotification = async (formData: ASTFormData, tenant: Tenant): Promise<boolean> => {
  try {
    console.log('📧 Envoi email professionnel...');
    
    const subject = `AST C-Secur360 - ${formData.numeroAST} - ${formData.projet}`;
    
    const emailBody = `Bonjour,

Veuillez trouver ci-joint l'Analyse Sécuritaire de Tâches générée via la plateforme C-Secur360.

DÉTAILS DU PROJET:
• Numéro AST: ${formData.numeroAST}
• Projet: ${formData.projet}
• Lieu: ${formData.lieu}
• Date: ${formData.date}
• Responsable: ${formData.responsable}

RÉSUMÉ SÉCURITÉ:
• Dangers identifiés: ${formData.dangersIdentifies.filter(d => d.present).length}
• Équipements sécurité: ${formData.equipementsSecurite.filter(e => e.utilise).length}
• Membres équipe: ${formData.equipe.length}
• Points isolation: ${formData.pointsIsolement.filter(p => p.isole).length}

Ce document a été généré en conformité avec les normes CNESST et CSA Z462.

Cordialement,
Plateforme C-Secur360`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl);
    
    console.log('✅ Email professionnel ouvert');
    return true;
  } catch (error) {
    console.error('❌ Erreur email professionnel:', error);
    return false;
  }
};
// =================== AST SECTION 4/5 - COMPOSANT COMPLET TOUTES ÉTAPES ===================
// Section 4: Composant principal avec TOUTES les 8 étapes - STRUCTURE CORRIGÉE

const ASTFormUltraPremium: React.FC<ASTFormProps> = ({ tenant }) => {
  // =================== ÉTATS ET HOOKS ===================
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [formData, setFormData] = useState<ASTFormData>(getInitialFormData());
  const [newEquipment, setNewEquipment] = useState({ nom: '', categorie: '', norme: '' });

  // =================== TRADUCTIONS ACTIVES ===================
  const t = translations[language];
  const astNumber = formData.numeroAST;

  // =================== FONCTIONS DE MISE À JOUR ===================
  const updateFormData = (updates: Partial<ASTFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // =================== FONCTIONS PHOTOS ===================
  const handleAddPhoto = async (category: string, file: File): Promise<void> => {
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const photoUrl = URL.createObjectURL(file);
    
    const newPhoto: Photo = {
      id: photoId,
      name: file.name,
      url: photoUrl,
      description: '',
      timestamp: new Date().toISOString(),
      category: 'site'
    };

    updateFormData({
      photos: [...formData.photos, newPhoto]
    });
  };

  const handleRemovePhoto = (category: string, photoId: string) => {
    updateFormData({
      photos: formData.photos.filter(photo => photo.id !== photoId)
    });
  };

  // =================== FONCTIONS ÉQUIPEMENTS ===================
  const updateEquipementSecurite = (nom: string, utilise: boolean, conforme: boolean, notes: string) => {
    const nouveauxEquipements = formData.equipementsSecurite.map(equip =>
      equip.nom === nom ? { ...equip, utilise, conforme, notes } : equip
    );
    updateFormData({ equipementsSecurite: nouveauxEquipements });
  };

  const addCustomEquipment = () => {
    if (newEquipment.nom && newEquipment.categorie) {
      const nouvelEquipement: SafetyEquipment = {
        nom: newEquipment.nom,
        categorie: newEquipment.categorie,
        utilise: false,
        conforme: false,
        notes: '',
        norme: newEquipment.norme
      };
      
      updateFormData({
        equipementsSecurite: [...formData.equipementsSecurite, nouvelEquipement]
      });
      
      setNewEquipment({ nom: '', categorie: '', norme: '' });
    }
  };

  // =================== FONCTIONS DANGERS ===================
  const updateDanger = (nom: string, present: boolean, niveauRisque: string, moyensControle: string[], notes: string) => {
    const nouveauxDangers = formData.dangersIdentifies.map(danger =>
      danger.nom === nom ? { ...danger, present, niveauRisque, moyensControle, notes } : danger
    );
    updateFormData({ dangersIdentifies: nouveauxDangers });
  };

  // =================== FONCTIONS ÉQUIPE ===================
  const addMember = () => {
    const nouveauMembre: TeamMember = {
      id: `member-${Date.now()}`,
      nom: '',
      poste: '',
      entreprise: '',
      experience: '',
      qualifications: [],
      roleSpecifique: '',
      validationStatus: 'pending'
    };
    
    updateFormData({
      equipe: [...formData.equipe, nouveauMembre]
    });
  };

  const updateMember = (index: number, field: string, value: any) => {
    const nouvelleEquipe = [...formData.equipe];
    nouvelleEquipe[index] = { ...nouvelleEquipe[index], [field]: value };
    updateFormData({ equipe: nouvelleEquipe });
  };

  const removeMember = (index: number) => {
    const nouvelleEquipe = formData.equipe.filter((_, i) => i !== index);
    updateFormData({ equipe: nouvelleEquipe });
  };

  // =================== FONCTIONS ISOLATION ===================
  const addPointIsolement = () => {
    const nouveauPoint: IsolationPoint = {
      id: `isolation-${Date.now()}`,
      source: '',
      type: '',
      methode: '',
      responsable: '',
      notes: '',
      isole: false,
      photos: []
    };
    
    updateFormData({
      pointsIsolement: [...formData.pointsIsolement, nouveauPoint]
    });
  };

  const updatePointIsolement = (index: number, field: string, value: any) => {
    const nouveauxPoints = [...formData.pointsIsolement];
    nouveauxPoints[index] = { ...nouveauxPoints[index], [field]: value };
    updateFormData({ pointsIsolement: nouveauxPoints });
  };

  const removePointIsolement = (index: number) => {
    const nouveauxPoints = formData.pointsIsolement.filter((_, i) => i !== index);
    updateFormData({ pointsIsolement: nouveauxPoints });
  };

  const addPhotoToIsolationPoint = async (pointIndex: number, file: File): Promise<void> => {
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const photoUrl = URL.createObjectURL(file);
    
    const newPhoto: Photo = {
      id: photoId,
      name: file.name,
      url: photoUrl,
      description: '',
      timestamp: new Date().toISOString(),
      category: 'isolation'
    };

    const nouveauxPoints = [...formData.pointsIsolement];
    nouveauxPoints[pointIndex].photos = [...nouveauxPoints[pointIndex].photos, newPhoto];
    updateFormData({ pointsIsolement: nouveauxPoints });
  };

  const removePhotoFromIsolationPoint = (pointIndex: number, photoIndex: number) => {
    const nouveauxPoints = [...formData.pointsIsolement];
    nouveauxPoints[pointIndex].photos = nouveauxPoints[pointIndex].photos.filter((_, i) => i !== photoIndex);
    updateFormData({ pointsIsolement: nouveauxPoints });
  };

  // =================== STYLES CSS INJECTÉS ===================
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = mobileOptimizedStyles;
    document.head.appendChild(styleSheet);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  // =================== COMPOSANTS INTERNES ===================
  const PhotoCarousel: React.FC<{
    photos: Photo[];
    onAddPhoto: (stepId: string, file: File) => Promise<void>;
    onRemovePhoto: (stepId: string, photoId: string) => void;
    stepId: string;
    maxPhotos?: number;
  }> = ({ photos, onAddPhoto, onRemovePhoto, stepId, maxPhotos = 5 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddPhotoCarousel = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < Math.min(files.length, maxPhotos - photos.length); i++) {
          await onAddPhoto(stepId, files[i]);
        }
      }
    };

    return (
      <div className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-24 sm:h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => onRemovePhoto(stepId, photo.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 transform hover:scale-105"
                    aria-label="Supprimer photo"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{photo.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length < maxPhotos && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhotoCarousel}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 border-dashed rounded-lg text-blue-600 font-medium transition-all duration-200 hover:border-blue-300 touch-manipulation"
            >
              <Camera size={20} />
              <span>Ajouter Photo ({photos.length}/{maxPhotos})</span>
            </button>
          </div>
        )}

        {photos.length >= maxPhotos && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle size={16} className="inline mr-2" />
            Maximum {maxPhotos} photos atteint
          </div>
        )}
      </div>
    );
  };

  const CustomCheckbox: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    required?: boolean;
    variant?: 'default' | 'success';
  }> = ({ checked, onChange, label, description, required = false, variant = 'default' }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
      <button
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-5 h-5 border-2 rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation ${
          checked
            ? variant === 'success' 
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-blue-500 border-blue-500 text-white'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        aria-label={label || 'Checkbox'}
      >
        {checked && <Check size={12} className="mx-auto" />}
      </button>
      {label && (
        <div className="flex-1 min-w-0">
          <label className={`block text-sm font-medium text-gray-900 ${required ? 'required-field' : ''}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );

  // =================== RETURN UNIQUE AVEC TOUTES LES ÉTAPES ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Header Sticky Mobile-Optimized */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-xs text-gray-600">AST #{astNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <div className="flex-1 sm:flex-none sm:w-32">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / 8) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  Étape {currentStep + 1}/8
                </p>
              </div>

              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="flex items-center space-x-1 px-3 py-2 bg-white/60 hover:bg-white/80 rounded-lg border border-gray-200 transition-all duration-200 touch-manipulation"
              >
                <Settings size={16} />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container Principal */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          
          {/* ÉTAPE 1: INFORMATIONS GÉNÉRALES */}
          {currentStep === 0 && (
            <div className="p-6 space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.generalInfo}</h2>
                <p className="text-gray-600">Informations de base du projet et responsabilités</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.project} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projet}
                      onChange={(e) => updateFormData({ projet: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Maintenance électrique bâtiment A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.location} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lieu}
                      onChange={(e) => updateFormData({ lieu: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Usine XYZ, Local 101"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.taskDescription} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descriptionTache}
                      onChange={(e) => updateFormData({ descriptionTache: e.target.value })}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Décrivez en détail les tâches à effectuer..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateFormData({ date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.heure}
                      onChange={(e) => updateFormData({ heure: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.responsible} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.responsable}
                      onChange={(e) => updateFormData({ responsable: e.target.value })}
                      className="input-field"
                      placeholder="Nom du superviseur"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée estimée
                    </label>
                    <input
                      type="text"
                      value={formData.dureeEstimee}
                      onChange={(e) => updateFormData({ dureeEstimee: e.target.value })}
                      className="input-field"
                      placeholder="Ex: 4 heures"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="mr-2" size={20} />
                  Photos du site et du projet
                </h3>
                <PhotoCarousel
                  photos={formData.photos}
                  onAddPhoto={(stepId, file) => handleAddPhoto('project', file)}
                  onRemovePhoto={(stepId, photoId) => handleRemovePhoto('project', photoId)}
                  stepId="project"
                  maxPhotos={10}
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2: DISCUSSION D'ÉQUIPE */}
          {currentStep === 1 && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {t.teamDiscussion}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Points de discussion obligatoires et communication d'équipe
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Points de discussion obligatoires
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {formData.discussionsEquipe.map((discussion, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <CustomCheckbox
                          checked={discussion.discute}
                          onChange={(checked) => {
                            const newDiscussions = [...formData.discussionsEquipe];
                            newDiscussions[index].discute = checked;
                            setFormData(prev => ({ ...prev, discussionsEquipe: newDiscussions }));
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                            {discussion.sujet}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            {discussion.description}
                          </p>
                          
                          {discussion.discute && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Notes et observations:
                              </label>
                              <textarea
                                value={discussion.notes}
                                onChange={(e) => {
                                  const newDiscussions = [...formData.discussionsEquipe];
                                  newDiscussions[index].notes = e.target.value;
                                  setFormData(prev => ({ ...prev, discussionsEquipe: newDiscussions }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                rows={2}
                                placeholder="Ajoutez vos notes..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Procédures d'urgence
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-700 mb-2">
                      Numéro d'urgence principal
                    </label>
                    <input
                      type="tel"
                      value={formData.numeroUrgence}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroUrgence: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      placeholder="911 ou numéro interne"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-red-700 mb-2">
                      Responsable sécurité sur site
                    </label>
                    <input
                      type="text"
                      value={formData.responsableSecurite}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsableSecurite: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      placeholder="Nom et poste #"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-red-700 mb-2">
                    Point de rassemblement d'urgence
                  </label>
                  <input
                    type="text"
                    value={formData.pointRassemblement}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointRassemblement: e.target.value }))}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                    placeholder="Localisation précise du point de rassemblement"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPES 3-8 : AJOUTEZ ICI LES AUTRES ÉTAPES DE VOTRE CODE */}
          {/* [Ici vous ajouterez les étapes 3, 4, 5, 6, 7, 8 de votre code existant] */}

          {/* Navigation Bottom */}
          <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-secondary'
                }`}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">{t.previous}</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 touch-manipulation ${
                      i === currentStep
                        ? 'bg-blue-500 text-white shadow-lg'
                        : i < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                disabled={currentStep === 7}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                  currentStep === 7
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <span className="hidden sm:inline">{t.next}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASTFormUltraPremium;
