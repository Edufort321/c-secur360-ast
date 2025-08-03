"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, Users, 
  PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock, History, 
  UserPlus, UserMinus, AlertTriangle, FileText, PenTool as Signature,
  Volume2, Activity
} from 'lucide-react';

// Import SafetyManager et styles unifiés
import { useSafetyManager, ConfinedSpaceComponentProps } from './SafetyManager';
import { styles } from './styles';

// =================== DÉTECTION MOBILE ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// =================== TYPES PROVINCIAUX ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

// =================== INTERFACES PERSONNEL ===================
interface Person {
  id: string;
  name: string;
  role: 'surveillant' | 'entrant';
  company: string;
  training: Record<string, boolean>;
  equipment_assigned: string[];
  entry_sessions: EntrySession[];
  is_active: boolean;
  last_updated: string;
  signature?: string;
  signature_timestamp?: string;
  electronic_signature?: string;
  training_expiry?: string;
  formation_confirmed?: boolean;
}

interface EntrySession {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit';
  entry_time?: string;
  exit_time?: string;
  duration?: number;
  surveillant_id: string;
  notes?: string;
  status: 'active' | 'completed';
}

// =================== INTERFACES ÉQUIPEMENTS ===================
interface Equipment {
  id: string;
  name: string;
  category: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance';
  location: string;
  requires_calibration: boolean;
  calibration_date?: string;
  next_calibration?: string;
  assigned_to?: string;
  usage_sessions: EquipmentSession[];
  total_usage_time: number;
  usage_count: number;
  notes?: string;
}

interface EquipmentSession {
  id: string;
  timestamp: string;
  type: 'checkout' | 'return';
  checkout_time?: string;
  return_time?: string;
  duration?: number;
  assigned_to: string;
  surveillant_id: string;
  notes?: string;
  status: 'active' | 'completed';
}

// =================== INTERFACES CONFORMITÉ ===================
interface ComplianceCheck {
  atmospheric_tests_done: boolean;
  rescue_equipment_present: boolean;
  communication_equipment_present: boolean;
  ventilation_equipment_present: boolean;
  emergency_procedures_reviewed: boolean;
  personnel_training_verified: boolean;
  equipment_calibration_current: boolean;
  rescue_plan_accessible: boolean;
}

// =================== FORMATIONS PAR PROVINCE ===================
interface TrainingRequirement {
  id: string;
  name: string;
  authority: string;
  required: boolean;
  description: string;
}

const getTrainingRequirements = (province: ProvinceCode): TrainingRequirement[] => {
  const requirements: Record<ProvinceCode, TrainingRequirement[]> = {
    QC: [
      { id: 'confined_space', name: 'Formation espaces clos', authority: 'CNESST', required: true, description: 'Formation obligatoire sur la sécurité en espaces clos' },
      { id: 'h2s_alive', name: 'H2S Alive', authority: 'CNESST', required: true, description: 'Formation sur les dangers du sulfure d\'hydrogène' },
      { id: 'first_aid', name: 'Premiers soins', authority: 'Croix-Rouge', required: true, description: 'Formation en premiers soins et RCR' },
      { id: 'rescue', name: 'Sauvetage espaces clos', authority: 'CNESST', required: true, description: 'Formation sur les techniques de sauvetage' }
    ],
    ON: [
      { id: 'confined_space', name: 'Confined Space Training', authority: 'MOL', required: true, description: 'Mandatory confined space safety training' },
      { id: 'h2s_alive', name: 'H2S Alive', authority: 'MOL', required: true, description: 'Hydrogen sulfide awareness training' },
      { id: 'first_aid', name: 'First Aid/CPR', authority: 'Red Cross', required: true, description: 'First aid and CPR training' },
      { id: 'rescue', name: 'Confined Space Rescue', authority: 'MOL', required: true, description: 'Rescue procedures training' }
    ],
    BC: [
      { id: 'confined_space', name: 'Confined Space Entry', authority: 'WorkSafeBC', required: true, description: 'Confined space entry training' },
      { id: 'h2s_alive', name: 'H2S Safety', authority: 'WorkSafeBC', required: true, description: 'Hydrogen sulfide safety training' },
      { id: 'first_aid', name: 'Standard First Aid', authority: 'WorkSafeBC', required: true, description: 'Standard first aid training' },
      { id: 'rescue', name: 'Emergency Response', authority: 'WorkSafeBC', required: true, description: 'Emergency response training' }
    ],
    AB: [
      { id: 'confined_space', name: 'Confined Space Entry', authority: 'Alberta OHS', required: true, description: 'Confined space safety training' },
      { id: 'h2s_alive', name: 'H2S Alive', authority: 'Alberta OHS', required: true, description: 'H2S awareness and safety' },
      { id: 'first_aid', name: 'First Aid', authority: 'Alberta OHS', required: true, description: 'First aid and emergency care' },
      { id: 'rescue', name: 'Rescue Training', authority: 'Alberta OHS', required: true, description: 'Confined space rescue training' }
    ],
    SK: [
      { id: 'confined_space', name: 'Confined Space Training', authority: 'Saskatchewan OHS', required: true, description: 'Confined space safety training' },
      { id: 'h2s_alive', name: 'H2S Training', authority: 'Saskatchewan OHS', required: true, description: 'Hydrogen sulfide training' },
      { id: 'first_aid', name: 'First Aid/CPR', authority: 'Saskatchewan OHS', required: true, description: 'First aid training' },
      { id: 'rescue', name: 'Emergency Response', authority: 'Saskatchewan OHS', required: true, description: 'Emergency response procedures' }
    ],
    MB: [
      { id: 'confined_space', name: 'Confined Space Safety', authority: 'Manitoba Workplace Safety & Health', required: true, description: 'Confined space safety training' },
      { id: 'h2s_alive', name: 'H2S Safety', authority: 'Manitoba Workplace Safety & Health', required: true, description: 'Hydrogen sulfide safety' },
      { id: 'first_aid', name: 'First Aid', authority: 'Manitoba Workplace Safety & Health', required: true, description: 'First aid training' },
      { id: 'rescue', name: 'Rescue Procedures', authority: 'Manitoba Workplace Safety & Health', required: true, description: 'Rescue training' }
    ],
    NB: [
      { id: 'confined_space', name: 'Confined Space Training', authority: 'WorkSafeNB', required: true, description: 'Confined space safety training' },
      { id: 'h2s_alive', name: 'H2S Training', authority: 'WorkSafeNB', required: true, description: 'Hydrogen sulfide training' },
      { id: 'first_aid', name: 'First Aid/CPR', authority: 'WorkSafeNB', required: true, description: 'First aid and CPR' },
      { id: 'rescue', name: 'Emergency Response', authority: 'WorkSafeNB', required: true, description: 'Emergency response training' }
    ],
    NS: [
      { id: 'confined_space', name: 'Confined Space Entry', authority: 'Nova Scotia Labour Standards', required: true, description: 'Confined space entry training' },
      { id: 'h2s_alive', name: 'H2S Safety', authority: 'Nova Scotia Labour Standards', required: true, description: 'H2S safety training' },
      { id: 'first_aid', name: 'First Aid', authority: 'Nova Scotia Labour Standards', required: true, description: 'First aid training' },
      { id: 'rescue', name: 'Rescue Training', authority: 'Nova Scotia Labour Standards', required: true, description: 'Rescue procedures' }
    ],
    PE: [
      { id: 'confined_space', name: 'Confined Space Safety', authority: 'PEI Occupational Health & Safety', required: true, description: 'Confined space safety' },
      { id: 'h2s_alive', name: 'H2S Training', authority: 'PEI Occupational Health & Safety', required: true, description: 'Hydrogen sulfide training' },
      { id: 'first_aid', name: 'First Aid/CPR', authority: 'PEI Occupational Health & Safety', required: true, description: 'First aid and CPR' },
      { id: 'rescue', name: 'Emergency Response', authority: 'PEI Occupational Health & Safety', required: true, description: 'Emergency response' }
    ],
    NL: [
      { id: 'confined_space', name: 'Confined Space Training', authority: 'Newfoundland & Labrador OHS', required: true, description: 'Confined space training' },
      { id: 'h2s_alive', name: 'H2S Safety', authority: 'Newfoundland & Labrador OHS', required: true, description: 'H2S safety training' },
      { id: 'first_aid', name: 'First Aid', authority: 'Newfoundland & Labrador OHS', required: true, description: 'First aid training' },
      { id: 'rescue', name: 'Rescue Procedures', authority: 'Newfoundland & Labrador OHS', required: true, description: 'Rescue training' }
    ]
  };

  return requirements[province] || requirements.QC;
};

// =================== ÉQUIPEMENTS PRÉDÉFINIS ===================
interface EquipmentCategory {
  name: string;
  items: Array<{
    name: string;
    requires_calibration: boolean;
    is_rescue: boolean;
    is_atmospheric: boolean;
  }>;
}

const EQUIPMENT_CATEGORIES: Record<string, EquipmentCategory> = {
  detection: {
    name: "📱 Détection et Monitoring",
    items: [
      { name: "Détecteur 4 gaz portable", requires_calibration: true, is_rescue: false, is_atmospheric: true },
      { name: "Détecteur d'oxygène", requires_calibration: true, is_rescue: false, is_atmospheric: true },
      { name: "Manomètre de pression", requires_calibration: true, is_rescue: false, is_atmospheric: false },
      { name: "Détecteur de CO", requires_calibration: true, is_rescue: false, is_atmospheric: true },
      { name: "Détecteur H2S", requires_calibration: true, is_rescue: false, is_atmospheric: true }
    ]
  },
  safety: {
    name: "🦺 Équipement de Sécurité",
    items: [
      { name: "Harnais de sécurité", requires_calibration: false, is_rescue: true, is_atmospheric: false },
      { name: "Casque de protection", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Gants de protection", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Chaussures de sécurité", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Lunettes de protection", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  respiratory: {
    name: "😷 Protection Respiratoire",
    items: [
      { name: "Appareil respiratoire autonome (ARA)", requires_calibration: true, is_rescue: true, is_atmospheric: false },
      { name: "Masque à cartouche", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Ligne d'air comprimé", requires_calibration: true, is_rescue: true, is_atmospheric: false },
      { name: "Masque complet", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  rescue: {
    name: "🆘 Équipement de Sauvetage",
    items: [
      { name: "Treuil de sauvetage", requires_calibration: true, is_rescue: true, is_atmospheric: false },
      { name: "Civière d'évacuation", requires_calibration: false, is_rescue: true, is_atmospheric: false },
      { name: "Corde et mousquetons", requires_calibration: false, is_rescue: true, is_atmospheric: false },
      { name: "Système de hissage", requires_calibration: true, is_rescue: true, is_atmospheric: false },
      { name: "Bouée de sauvetage", requires_calibration: false, is_rescue: true, is_atmospheric: false }
    ]
  },
  communication: {
    name: "📻 Communication",
    items: [
      { name: "Radio bidirectionnelle", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Téléphone d'urgence", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Système d'alarme", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Sifflet d'urgence", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  ventilation: {
    name: "💨 Ventilation",
    items: [
      { name: "Ventilateur portable", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Extracteur d'air", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Soufflante industrielle", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Tuyau de ventilation", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  lighting: {
    name: "💡 Éclairage",
    items: [
      { name: "Lampe frontale LED", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Projecteur portable", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Éclairage de secours", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Lampe antidéflagrante", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  tools: {
    name: "🔧 Outils",
    items: [
      { name: "Clé ajustable", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Tournevis isolé", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Pince multiprise", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Marteau antidéflagrant", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Niveau à bulle", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  },
  electrical: {
    name: "⚡ Équipement Électrique",
    items: [
      { name: "Multimètre", requires_calibration: true, is_rescue: false, is_atmospheric: false },
      { name: "Testeur de tension", requires_calibration: true, is_rescue: false, is_atmospheric: false },
      { name: "Rallonge étanche", requires_calibration: false, is_rescue: false, is_atmospheric: false },
      { name: "Disjoncteur portable", requires_calibration: false, is_rescue: false, is_atmospheric: false }
    ]
  }
};

// =================== COMPOSANT PRINCIPAL - DÉBUT ===================
const EntryRegistry: React.FC<ConfinedSpaceComponentProps> = ({
  language = 'fr',
  selectedProvince = 'QC', 
  regulations = { name: 'CNESST', authority: 'CNESST', authority_phone: '', code: '' },
  safetyManager
}) => {
  // =================== SAFETY MANAGER INTEGRATION ===================
  const currentPermit = safetyManager?.currentPermit || {};

  // =================== ÉTATS PRINCIPAUX ===================
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [compliance_check, setComplianceCheck] = useState<ComplianceCheck>({
    atmospheric_tests_done: false,
    rescue_equipment_present: false,
    communication_equipment_present: false,
    ventilation_equipment_present: false,
    emergency_procedures_reviewed: false,
    personnel_training_verified: false,
    equipment_calibration_current: false,
    rescue_plan_accessible: false
  });

  // =================== ÉTATS MODALS ===================
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // =================== ÉTATS FORMULAIRES ===================
  const [personData, setPersonData] = useState({
    name: '',
    role: 'entrant' as 'surveillant' | 'entrant',
    company: '',
    training: {} as Record<string, boolean>,
    training_expiry: '',
    electronic_signature: '',
    formation_confirmed: false
  });

  const [equipmentData, setEquipmentData] = useState({
    name: '',
    category: '',
    type: '',
    location: '',
    requires_calibration: false,
    calibration_date: '',
    next_calibration: '',
    notes: ''
  });

  // =================== ÉTATS UI ===================
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [showPresetEquipment, setShowPresetEquipment] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

  // =================== REFS ===================
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Registre d'Entrée - Espace Clos",
      personnel: "Gestion du Personnel",
      equipment: "Gestion des Équipements",
      compliance: "Validation et Conformité du Permis",
      addPerson: "Ajouter Personnel",
      addEquipment: "Ajouter Équipement",
      surveillant: "Surveillant",
      entrant: "Entrant",
      active: "Actif",
      inside: "À l'intérieur",
      available: "Disponible",
      inUse: "En utilisation",
      maintenance: "Maintenance",
      calibrated: "Calibré",
      expired: "Expiré",
      markEntry: "Marquer Entrée",
      markExit: "Marquer Sortie",
      checkout: "Sortir Équipement",
      return: "Retourner Équipement",
      edit: "Modifier",
      delete: "Supprimer",
      activate: "Activer",
      deactivate: "Désactiver",
      compliant: "CONFORME",
      nonCompliant: "NON CONFORME",
      noPersonnel: "Aucun personnel enregistré",
      noEquipment: "Aucun équipement enregistré",
      startWithSupervisor: "Commencez par ajouter un surveillant",
      addEquipmentFirst: "Ajoutez des équipements pour commencer"
    },
    en: {
      title: "Entry Registry - Confined Space",
      personnel: "Personnel Management",
      equipment: "Equipment Management", 
      compliance: "Permit Validation and Compliance",
      addPerson: "Add Personnel",
      addEquipment: "Add Equipment",
      surveillant: "Attendant",
      entrant: "Entrant",
      active: "Active",
      inside: "Inside",
      available: "Available",
      inUse: "In Use",
      maintenance: "Maintenance",
      calibrated: "Calibrated",
      expired: "Expired",
      markEntry: "Mark Entry",
      markExit: "Mark Exit",
      checkout: "Checkout Equipment",
      return: "Return Equipment",
      edit: "Edit",
      delete: "Delete",
      activate: "Activate",
      deactivate: "Deactivate",
      compliant: "COMPLIANT",
      nonCompliant: "NON-COMPLIANT",
      noPersonnel: "No personnel registered",
      noEquipment: "No equipment registered",
      startWithSupervisor: "Start by adding an attendant",
      addEquipmentFirst: "Add equipment to get started"
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const showNotification = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Registre d'Entrée - ${type.toUpperCase()}`, {
        body: message,
        icon: type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️'
      });
    }
  };

  const playAlarmSound = (type: 'warning' | 'evacuation' = 'warning') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'evacuation') {
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
      } else {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      if (type === 'evacuation') {
        setTimeout(() => playAlarmSound('evacuation'), 600);
        setTimeout(() => playAlarmSound('evacuation'), 1200);
      }
    } catch (error) {
      console.warn('Cannot play alarm sound:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // =================== GESTION PERSONNEL ===================
  const getCurrentSurveillant = (): Person | null => {
    return personnel.find(person => person.role === 'surveillant' && person.is_active) || null;
  };

  const getActiveEntrants = (): Person[] => {
    return personnel.filter(person => 
      person.entry_sessions.some(session => session.status === 'active')
    );
  };

  const addPerson = () => {
    const surveillant = getCurrentSurveillant();
    
    if (personData.role === 'surveillant') {
      const existingSurveillant = personnel.find(p => p.role === 'surveillant' && p.is_active);
      if (existingSurveillant) {
        showNotification('⚠️ Un surveillant est déjà actif. Désactivez-le d\'abord.', 'warning');
        return;
      }
    }

    if (personData.role === 'entrant' && !surveillant) {
      showNotification('⚠️ Un surveillant doit être présent avant d\'ajouter des entrants.', 'warning');
      return;
    }

    const trainingRequirements = getTrainingRequirements(selectedProvince);
    const training: Record<string, boolean> = {};
    trainingRequirements.forEach(req => {
      training[req.id] = personData.training[req.id] || false;
    });

    const newPerson: Person = {
      id: generateId(),
      name: personData.name,
      role: personData.role,
      company: personData.company,
      training,
      equipment_assigned: [],
      entry_sessions: [],
      is_active: personData.role === 'surveillant',
      last_updated: new Date().toISOString(),
      electronic_signature: personData.electronic_signature,
      training_expiry: personData.training_expiry,
      formation_confirmed: personData.formation_confirmed
    };

    setPersonnel(prev => [...prev, newPerson]);
    resetPersonForm();
    setShowPersonModal(false);
    
    showNotification(`✅ ${personData.role === 'surveillant' ? 'Surveillant' : 'Entrant'} ajouté: ${personData.name}`, 'info');

    // Mise à jour SafetyManager
    if (safetyManager) {
      safetyManager.updateEntryRegistry({ personnel: [...personnel, newPerson] });
    }
  };

  const markEntry = (personId: string) => {
    const person = personnel.find(p => p.id === personId);
    const surveillant = getCurrentSurveillant();

    if (!person || !surveillant) {
      showNotification('⚠️ Surveillant requis pour autoriser les entrées', 'warning');
      return;
    }

    const hasActiveSession = person.entry_sessions.some(session => session.status === 'active');
    if (hasActiveSession) {
      showNotification('⚠️ Cette personne est déjà à l\'intérieur', 'warning');
      return;
    }

    const newSession: EntrySession = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type: 'entry',
      entry_time: new Date().toISOString(),
      surveillant_id: surveillant.id,
      status: 'active'
    };

    const updatedPerson = {
      ...person,
      entry_sessions: [...person.entry_sessions, newSession],
      last_updated: new Date().toISOString()
    };

    setPersonnel(prev => prev.map(p => p.id === personId ? updatedPerson : p));
    
    showNotification(`➡️ ENTRÉE: ${person.name} dans l'espace clos`, 'info');
    playAlarmSound('warning');

    // Mise à jour SafetyManager
    if (safetyManager) {
      safetyManager.recordEntryExit(personId, 'entry');
    }
  };

  const markExit = (personId: string) => {
    const person = personnel.find(p => p.id === personId);
    const surveillant = getCurrentSurveillant();

    if (!person || !surveillant) {
      showNotification('⚠️ Surveillant requis pour autoriser les sorties', 'warning');
      return;
    }

    const activeSessionIndex = person.entry_sessions.findIndex(session => session.status === 'active');
    if (activeSessionIndex === -1) {
      showNotification('⚠️ Aucune session active trouvée pour cette personne', 'warning');
      return;
    }

    const activeSession = person.entry_sessions[activeSessionIndex];
    const entryTime = activeSession.entry_time ? new Date(activeSession.entry_time).getTime() : Date.now();
    const duration = Math.floor((Date.now() - entryTime) / 1000);

    const completedSession: EntrySession = {
      ...activeSession,
      type: 'exit',
      exit_time: new Date().toISOString(),
      duration,
      status: 'completed'
    };

    const updatedSessions = [...person.entry_sessions];
    updatedSessions[activeSessionIndex] = completedSession;

    const updatedPerson = {
      ...person,
      entry_sessions: updatedSessions,
      last_updated: new Date().toISOString()
    };

    setPersonnel(prev => prev.map(p => p.id === personId ? updatedPerson : p));
    
    const durationText = formatDuration(duration);
    showNotification(`⬅️ SORTIE: ${person.name} (Durée: ${durationText})`, 'info');
    playAlarmSound('warning');

    // Mise à jour SafetyManager
    if (safetyManager) {
      safetyManager.recordEntryExit(personId, 'exit');
    }
  };

  const resetPersonForm = () => {
    setPersonData({
      name: '',
      role: 'entrant',
      company: '',
      training: {},
      training_expiry: '',
      electronic_signature: '',
      formation_confirmed: false
    });
  };

  // =================== GESTION ÉQUIPEMENTS ===================
  const addEquipment = () => {
    const newEquipment: Equipment = {
      id: generateId(),
      name: equipmentData.name,
      category: equipmentData.category,
      type: equipmentData.type,
      status: 'available',
      location: equipmentData.location,
      requires_calibration: equipmentData.requires_calibration,
      calibration_date: equipmentData.calibration_date || undefined,
      next_calibration: equipmentData.next_calibration || undefined,
      usage_sessions: [],
      total_usage_time: 0,
      usage_count: 0,
      notes: equipmentData.notes
    };

    setEquipment(prev => [...prev, newEquipment]);
    resetEquipmentForm();
    setShowEquipmentModal(false);
    
    showNotification(`✅ Équipement ajouté: ${equipmentData.name}`, 'info');

    // Mise à jour SafetyManager
    if (safetyManager) {
      safetyManager.updateEntryRegistry({ equipment: [...equipment, newEquipment] });
    }
  };

  const resetEquipmentForm = () => {
    setEquipmentData({
      name: '',
      category: '',
      type: '',
      location: '',
      requires_calibration: false,
      calibration_date: '',
      next_calibration: '',
      notes: ''
    });
  };

  // =================== VALIDATION CONFORMITÉ ===================
  const updateComplianceCheck = (key: keyof ComplianceCheck, value: boolean) => {
    const surveillant = getCurrentSurveillant();
    if (!surveillant) {
      showNotification('⚠️ Un surveillant doit être présent pour effectuer les vérifications', 'warning');
      return;
    }

    setComplianceCheck(prev => ({
      ...prev,
      [key]: value
    }));

    showNotification(
      `${value ? '✅ Vérifié' : '❌ Non vérifié'}: ${getComplianceLabel(key)}`,
      value ? 'info' : 'warning'
    );

    // Mise à jour SafetyManager
    if (safetyManager) {
      safetyManager.updateEntryRegistry({ compliance_check: { ...compliance_check, [key]: value } });
    }
  };

  const getComplianceLabel = (key: keyof ComplianceCheck): string => {
    const labels: Record<keyof ComplianceCheck, string> = {
      atmospheric_tests_done: 'Tests atmosphériques effectués',
      rescue_equipment_present: 'Équipement de sauvetage présent',
      communication_equipment_present: 'Équipement de communication présent',
      ventilation_equipment_present: 'Équipement de ventilation présent',
      emergency_procedures_reviewed: 'Procédures d\'urgence révisées',
      personnel_training_verified: 'Formation du personnel vérifiée',
      equipment_calibration_current: 'Calibration des équipements à jour',
      rescue_plan_accessible: 'Plan de sauvetage accessible'
    };
    return labels[key] || key;
  };

  const isFullyCompliant = (): boolean => {
    return Object.values(compliance_check).every(value => value === true);
  };

  const getCompliancePercentage = (): number => {
    const total = Object.keys(compliance_check).length;
    const completed = Object.values(compliance_check).filter(value => value === true).length;
    return Math.round((completed / total) * 100);
  };

  // =================== STATISTIQUES ===================
  const getPersonnelStats = () => {
    const totalPersonnel = personnel.length;
    const activeEntrants = getActiveEntrants().length;
    const surveillantActive = getCurrentSurveillant() !== null;
    const totalSessions = personnel.reduce((sum, person) => sum + person.entry_sessions.length, 0);

    return {
      totalPersonnel,
      activeEntrants,
      surveillantActive,
      totalSessions
    };
  };

  const getEquipmentStats = () => {
    const totalEquipment = equipment.length;
    const inUse = equipment.filter(eq => eq.status === 'in_use').length;
    const needsCalibration = equipment.filter(eq => 
      eq.requires_calibration && eq.next_calibration && new Date(eq.next_calibration) < new Date()
    ).length;
    const totalUsageSessions = equipment.reduce((sum, eq) => sum + eq.usage_sessions.length, 0);

    return {
      totalEquipment,
      inUse,
      available: totalEquipment - inUse,
      needsCalibration,
      totalUsageSessions
    };
  };

  // =================== EFFETS ===================
  useEffect(() => {
    // Demander permission pour notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mise à jour automatique du SafetyManager
  useEffect(() => {
    if (safetyManager) {
      const registryData = {
        personnel,
        equipment,
        compliance_check,
        stats: {
          personnel: getPersonnelStats(),
          equipment: getEquipmentStats(),
          compliance: {
            percentage: getCompliancePercentage(),
            isFullyCompliant: isFullyCompliant()
          }
        }
      };
      
      safetyManager.updateEntryRegistry(registryData);
    }
  }, [personnel, equipment, compliance_check, safetyManager]);

// =================== SUITE DANS LA PARTIE 2 ===================
  // =================== SIGNATURE NUMÉRIQUE ===================
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSignatureBackground(ctx, canvas.width, canvas.height);
      }
    }
    setSignatureData('');
  };

  const drawSignatureBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C-SECURE', width / 2, height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Signature numérique', width / 2, height / 2 + 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const saveSignature = (personId: string) => {
    if (!signatureData) {
      showNotification('⚠️ Veuillez signer avant de sauvegarder', 'warning');
      return;
    }

    const person = personnel.find(p => p.id === personId);
    if (!person) return;

    const updatedPerson = {
      ...person,
      signature: signatureData,
      signature_timestamp: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    setPersonnel(prev => prev.map(p => p.id === personId ? updatedPerson : p));
    setShowSignatureModal(false);
    setSelectedPersonId(null);
    clearSignature();
    
    showNotification(`✅ Signature enregistrée pour ${person.name}`, 'info');
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Header principal */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937, #374151)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '20px' : '24px',
        border: '1px solid #4b5563',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '20px' : '28px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Shield style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: '#60a5fa' }} />
              {texts.title}
            </h1>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '14px' : '16px',
              margin: 0
            }}>
              🌍 Province: {selectedProvince} | ⚖️ Réglementation: {regulations[selectedProvince]?.name || 'CNESST'}
            </p>
          </div>
          <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
            <div style={{ 
              fontSize: isMobile ? '32px' : '48px', 
              fontWeight: 'bold',
              color: getPersonnelStats().activeEntrants > 0 ? '#10b981' : '#6b7280',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {getPersonnelStats().activeEntrants}
            </div>
            <div style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600'
            }}>
              👥 Personnel à l'intérieur
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard - Statistiques */}
      <div style={styles.grid4}>
        {/* Personnel Stats */}
        <div style={styles.statCard}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                margin: '0 0 4px 0'
              }}>
                👥 Personnel Total
              </p>
              <p style={{ 
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {getPersonnelStats().totalPersonnel}
              </p>
            </div>
            <Users style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#60a5fa'
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: getCurrentSurveillant() ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            border: `1px solid ${getCurrentSurveillant() ? '#10b981' : '#ef4444'}`
          }}>
            <Eye style={{ 
              width: '16px', 
              height: '16px', 
              marginRight: '8px',
              color: getCurrentSurveillant() ? '#10b981' : '#ef4444'
            }} />
            <span style={{ 
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '600',
              color: getCurrentSurveillant() ? '#86efac' : '#fca5a5'
            }}>
              {getCurrentSurveillant() ? '✅ Surveillant actif' : '❌ Aucun surveillant'}
            </span>
          </div>
        </div>

        {/* Équipements Stats */}
        <div style={styles.statCard}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                margin: '0 0 4px 0'
              }}>
                🔧 Équipements
              </p>
              <p style={{ 
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {getEquipmentStats().totalEquipment}
              </p>
            </div>
            <Wrench style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#10b981'
            }} />
          </div>
          <div style={{ fontSize: isMobile ? '11px' : '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#9ca3af' }}>📤 En cours:</span>
              <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                {getEquipmentStats().inUse}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#9ca3af' }}>✅ Disponibles:</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>
                {getEquipmentStats().available}
              </span>
            </div>
          </div>
        </div>

        {/* Conformité */}
        <div style={styles.statCard}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                margin: '0 0 4px 0'
              }}>
                ✅ Conformité
              </p>
              <p style={{ 
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                color: isFullyCompliant() ? '#10b981' : '#f59e0b',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {getCompliancePercentage()}%
              </p>
            </div>
            <CheckCircle style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: isFullyCompliant() ? '#10b981' : '#f59e0b'
            }} />
          </div>
          <div>
            <div style={{
              width: '100%',
              backgroundColor: '#374151',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: isFullyCompliant() ? '#10b981' : '#f59e0b',
                width: `${getCompliancePercentage()}%`,
                transition: 'width 0.3s ease',
                borderRadius: '8px'
              }} />
            </div>
            <p style={{ 
              fontSize: isMobile ? '10px' : '11px',
              color: isFullyCompliant() ? '#86efac' : '#fde047',
              margin: 0,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {isFullyCompliant() ? '🎉 Conforme' : '⚠️ Vérifications requises'}
            </p>
          </div>
        </div>

        {/* Alertes */}
        <div style={styles.statCard}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                margin: '0 0 4px 0'
              }}>
                🚨 Alertes
              </p>
              <p style={{ 
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                color: getEquipmentStats().needsCalibration > 0 ? '#ef4444' : '#6b7280',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {getEquipmentStats().needsCalibration}
              </p>
            </div>
            <AlertTriangle style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: getEquipmentStats().needsCalibration > 0 ? '#ef4444' : '#6b7280'
            }} />
          </div>
          <p style={{ 
            fontSize: isMobile ? '10px' : '11px',
            color: '#9ca3af',
            margin: 0,
            textAlign: 'center'
          }}>
            {getEquipmentStats().needsCalibration > 0 
              ? '📅 Calibrations expirées' 
              : '✅ Aucune alerte active'
            }
          </p>
        </div>
      </div>

      {/* Section Conformité */}
      <div style={styles.card}>
        <div style={{
          borderBottom: '1px solid #4b5563',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={styles.cardTitle}>
            <CheckCircle style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
            {texts.compliance}
          </h2>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: isMobile ? '13px' : '15px',
            margin: 0,
            lineHeight: 1.5
          }}>
            ⚖️ Vérifications requises avant autorisation d'entrée
          </p>
        </div>
        
        <div style={styles.grid2}>
          {Object.entries(compliance_check).map(([key, value]) => (
            <div 
              key={key}
              style={{
                padding: isMobile ? '16px' : '20px',
                borderRadius: '12px',
                border: `2px solid ${value ? '#10b981' : '#4b5563'}`,
                backgroundColor: value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(75, 85, 99, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => updateComplianceCheck(key as keyof ComplianceCheck, !value)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: `2px solid ${value ? '#10b981' : '#6b7280'}`,
                  backgroundColor: value ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {value && <CheckCircle style={{ width: '16px', height: '16px', color: 'white' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    color: value ? '#86efac' : '#d1d5db',
                    margin: '0 0 4px 0',
                    fontSize: isMobile ? '14px' : '15px'
                  }}>
                    {getComplianceLabel(key as keyof ComplianceCheck)}
                  </p>
                  <p style={{ 
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#9ca3af',
                    margin: 0
                  }}>
                    {value ? '✅ Vérifié' : '👆 Cliquez pour cocher'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '24px',
          padding: isMobile ? '20px' : '24px',
          borderRadius: '12px',
          border: `2px solid ${isFullyCompliant() ? '#10b981' : '#f59e0b'}`,
          backgroundColor: isFullyCompliant() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {isFullyCompliant() ? (
                <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
              ) : (
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
              )}
              <div>
                <p style={{
                  fontWeight: 'bold',
                  color: isFullyCompliant() ? '#86efac' : '#fde047',
                  margin: '0 0 4px 0',
                  fontSize: isMobile ? '16px' : '18px'
                }}>
                  🎯 Statut: {isFullyCompliant() ? texts.compliant + ' ✅' : texts.nonCompliant + ' ⚠️'}
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '13px' : '14px',
                  margin: 0
                }}>
                  📊 {getCompliancePercentage()}% des vérifications complétées
                </p>
              </div>
            </div>
            <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
              <div style={{
                fontSize: isMobile ? '28px' : '36px',
                fontWeight: 'bold',
                color: isFullyCompliant() ? '#10b981' : '#f59e0b',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {getCompliancePercentage()}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Personnel */}
      <div style={styles.card}>
        <div style={{
          borderBottom: '1px solid #4b5563',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <h2 style={styles.cardTitle}>
              <UserCheck style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              👥 {texts.personnel} ({personnel.length})
            </h2>
            <button
              onClick={() => setShowPersonModal(true)}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                ...styles.buttonSmall
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              {texts.addPerson}
            </button>
          </div>
        </div>

        {personnel.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 20px' : '60px 40px',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <UserCheck style={{ 
              width: isMobile ? '64px' : '80px', 
              height: isMobile ? '64px' : '80px', 
              color: '#6b7280',
              margin: '0 auto 20px'
            }} />
            <h3 style={{ 
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              color: '#d1d5db',
              marginBottom: '12px'
            }}>
              {texts.noPersonnel}
            </h3>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: 1.5
            }}>
              👨‍💼 {texts.startWithSupervisor}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {personnel.map((person) => {
              const isInside = person.entry_sessions.some(session => session.status === 'active');
              const isAttendant = person.role === 'surveillant';
              
              return (
                <div key={person.id} style={{
                  ...styles.personCard,
                  ...(isAttendant ? styles.personCardSurveillant : 
                      isInside ? styles.personCardInside : styles.personCardEntrant)
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '16px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: isAttendant ? 'rgba(59, 130, 246, 0.2)' : 
                                        isInside ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                      }}>
                        {isAttendant ? (
                          <Eye style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                        ) : (
                          <UserCheck style={{ 
                            width: '24px', 
                            height: '24px', 
                            color: isInside ? '#10b981' : '#9ca3af'
                          }} />
                        )}
                      </div>
                      
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <h3 style={{ 
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0
                          }}>
                            {person.name}
                          </h3>
                          
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: isAttendant ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                            color: isAttendant ? '#93c5fd' : '#d1d5db',
                            border: `1px solid ${isAttendant ? '#3b82f6' : '#6b7280'}`
                          }}>
                            {isAttendant ? '👁️ SURVEILLANT' : '👤 ENTRANT'}
                          </span>
                          
                          {person.is_active && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#86efac',
                              border: '1px solid #10b981'
                            }}>
                              ✅ ACTIF
                            </span>
                          )}
                          
                          {isInside && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: 'rgba(245, 158, 11, 0.2)',
                              color: '#fde047',
                              border: '1px solid #f59e0b',
                              animation: 'pulse 2s infinite'
                            }}>
                              🚪 À L'INTÉRIEUR
                            </span>
                          )}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px', 
                          marginTop: '8px',
                          fontSize: isMobile ? '12px' : '13px',
                          color: '#9ca3af',
                          flexWrap: 'wrap'
                        }}>
                          <span>🏢 {person.company}</span>
                          <span>📊 Sessions: {person.entry_sessions.length}</span>
                          {person.training_expiry && (
                            <span>📅 Formation: {new Date(person.training_expiry).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Boutons Entrée/Sortie pour entrants */}
                      {!isAttendant && (
                        !isInside ? (
                          <button
                            onClick={() => markEntry(person.id)}
                            disabled={!getCurrentSurveillant()}
                            style={{
                              ...styles.button,
                              ...styles.buttonSuccess,
                              ...styles.buttonSmall,
                              opacity: !getCurrentSurveillant() ? 0.5 : 1
                            }}
                          >
                            <LogIn style={{ width: '16px', height: '16px' }} />
                            {texts.markEntry}
                          </button>
                        ) : (
                          <button
                            onClick={() => markExit(person.id)}
                            style={{
                              ...styles.button,
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              ...styles.buttonSmall
                            }}
                          >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            {texts.markExit}
                          </button>
                        )
                      )}

                      {/* Bouton Signature pour surveillants */}
                      {isAttendant && (
                        <button
                          onClick={() => {
                            setSelectedPersonId(person.id);
                            setShowSignatureModal(true);
                          }}
                          style={{
                            ...styles.button,
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            ...styles.buttonSmall
                          }}
                        >
                          <Signature style={{ width: '16px', height: '16px' }} />
                          {person.signature ? 'Nouvelle Signature' : 'Signer'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Historique des sessions */}
                  {person.entry_sessions.length > 0 && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #4b5563'
                    }}>
                      <h4 style={{ 
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        color: '#d1d5db',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <History style={{ width: '16px', height: '16px' }} />
                        📋 Dernières sessions
                      </h4>
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}>
                        {person.entry_sessions.slice(-3).reverse().map((session) => (
                          <div 
                            key={session.id} 
                            style={{ 
                              padding: '8px 12px',
                              backgroundColor: session.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                              borderRadius: '8px',
                              border: `1px solid ${session.status === 'active' ? '#10b981' : '#374151'}`,
                              fontSize: isMobile ? '11px' : '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {session.status === 'active' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#86efac' }}>
                                    <LogIn style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                                    <span style={{ fontWeight: '600' }}>🟢 EN COURS</span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    <LogOut style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                                    <span style={{ fontWeight: '600' }}>✅ TERMINÉE</span>
                                  </div>
                                )}
                              </div>
                              <span style={{ color: '#6b7280' }}>
                                📅 {new Date(session.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {session.duration && (
                              <div style={{ marginTop: '4px', textAlign: 'right' }}>
                                <span style={{ 
                                  color: '#fde047', 
                                  fontWeight: '600',
                                  fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                  ⏱️ {formatDuration(session.duration)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature status */}
                  {person.signature && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid #10b981'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        <span style={{ color: '#86efac', fontSize: '12px', fontWeight: '600' }}>
                          ✍️ Signature enregistrée le {person.signature_timestamp ? 
                            new Date(person.signature_timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Ajout Personnel */}
      {showPersonModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '16px' : '20px'
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #374151',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #374151'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                {editingPerson ? '✏️ Modifier Personnel' : '➕ Ajouter Personnel'}
              </h3>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Nom complet *</label>
                  <input
                    type="text"
                    value={personData.name}
                    onChange={(e) => setPersonData(prev => ({...prev, name: e.target.value}))}
                    style={styles.input}
                    placeholder="Nom et prénom"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Rôle *</label>
                  <select
                    value={personData.role}
                    onChange={(e) => setPersonData(prev => ({...prev, role: e.target.value as 'surveillant' | 'entrant'}))}
                    style={styles.input}
                    disabled={!!editingPerson}
                  >
                    <option value="entrant">👤 Entrant</option>
                    <option value="surveillant">👁️ Surveillant</option>
                  </select>
                </div>
                
                <div>
                  <label style={styles.label}>Entreprise *</label>
                  <input
                    type="text"
                    value={personData.company}
                    onChange={(e) => setPersonData(prev => ({...prev, company: e.target.value}))}
                    style={styles.input}
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Date d'expiration formation</label>
                  <input
                    type="date"
                    value={personData.training_expiry}
                    onChange={(e) => setPersonData(prev => ({...prev, training_expiry: e.target.value}))}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Formations requises */}
              <div>
                <label style={{ ...styles.label, marginBottom: '12px' }}>
                  📚 Formations requises pour {selectedProvince}
                </label>
                <div style={styles.grid2}>
                  {getTrainingRequirements(selectedProvince).map((req) => (
                    <div key={req.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: 'rgba(17, 24, 39, 0.5)',
                      borderRadius: '8px',
                      border: '1px solid #374151'
                    }}>
                      <input
                        type="checkbox"
                        id={req.id}
                        checked={personData.training[req.id] || false}
                        onChange={(e) => setPersonData(prev => ({
                          ...prev,
                          training: {
                            ...prev.training,
                            [req.id]: e.target.checked
                          }
                        }))}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#3b82f6'
                        }}
                      />
                      <label htmlFor={req.id} style={{ flex: 1, cursor: 'pointer' }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: 'white',
                          fontSize: '14px',
                          marginBottom: '2px'
                        }}>
                          {req.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#9ca3af'
                        }}>
                          {req.authority}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation formation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid #3b82f6'
              }}>
                <input
                  type="checkbox"
                  id="formation_confirmed"
                  checked={personData.formation_confirmed}
                  onChange={(e) => setPersonData(prev => ({...prev, formation_confirmed: e.target.checked}))}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label 
                  htmlFor="formation_confirmed"
                  style={{
                    color: '#93c5fd',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  ✅ Je confirme que toutes les formations sont valides et à jour *
                </label>
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              borderTop: '1px solid #374151',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={editingPerson ? updatePerson : addPerson}
                disabled={!personData.name || !personData.company || !personData.formation_confirmed}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  flex: 1,
                  opacity: (!personData.name || !personData.company || !personData.formation_confirmed) ? 0.5 : 1
                }}
              >
                {editingPerson ? '💾 Mettre à jour' : '➕ Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowPersonModal(false);
                  setEditingPerson(null);
                  resetPersonForm();
                }}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  flex: 1
                }}
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Signature Numérique */}
      {showSignatureModal && selectedPersonId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: isMobile ? '16px' : '20px'
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            border: '1px solid #374151',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #374151'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Signature style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                ✍️ Signature Numérique C-Secure
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                margin: 0
              }}>
                🖱️ Signez directement sur l'écran pour authentifier votre identité
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  style={{
                    border: '2px solid #4b5563',
                    borderRadius: '12px',
                    cursor: 'crosshair',
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto',
                    backgroundColor: '#374151'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              
              <div style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#9ca3af',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <div>👤 Personne: <span style={{ fontWeight: '600', color: 'white' }}>
                    {personnel.find(p => p.id === selectedPersonId)?.name}
                  </span></div>
                  <div>📅 Date: <span style={{ fontWeight: '600', color: 'white' }}>
                    {new Date().toLocaleString()}
                  </span></div>
                </div>
                
                <button
                  onClick={clearSignature}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    ...styles.buttonSmall
                  }}
                >
                  🗑️ Effacer
                </button>
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              borderTop: '1px solid #374151',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => saveSignature(selectedPersonId)}
                disabled={!signatureData}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  flex: 1,
                  opacity: !signatureData ? 0.5 : 1
                }}
              >
                💾 Enregistrer Signature
              </button>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedPersonId(null);
                  clearSignature();
                }}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  flex: 1
                }}
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EntryRegistry);
