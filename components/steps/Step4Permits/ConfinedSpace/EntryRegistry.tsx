// EntryRegistry.tsx - Section 1 (Imports et Types)

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, Users, 
  PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock, History, 
  UserPlus, UserMinus, AlertTriangle, FileText, PenTool as Signature 
} from 'lucide-react';

// =================== TYPES PROVINCIAUX ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

// =================== INTERFACES PRINCIPALES ===================
interface RegulationData {
  name: string;
  authority: string;
  authority_phone: string;
  code: string;
  url?: string;
  atmospheric_testing?: {
    frequency_minutes?: number;
    continuous_monitoring_required?: boolean;
    documentation_required?: boolean;
  };
  personnel_requirements?: {
    min_age?: number;
    attendant_required?: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
}

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

// =================== INTERFACE SAFETY MANAGER ===================
interface SafetyManager {
  hasPersonnelInside: () => boolean;
  triggerEvacuation: (reason: string, details: string[]) => void;
  getActiveEntrants: () => Person[];
  notifyTestFailure: (levelIndex: number, failures: string[]) => void;
}

// =================== PROPS PRINCIPALES ===================
interface EntryRegistryProps {
  // Props principales héritées de commonProps
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
  
  // Props spécifiques à EntryRegistry
  atmosphericReadings: any[];
  
  // Props optionnelles pour compatibilité
  data?: any;
  onChange?: (data: any) => void;
  regulations?: RegulationData;
}
// EntryRegistry.tsx - Section 2 (Composant Principal et États)

const EntryRegistry: React.FC<EntryRegistryProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles,
  updateParentData,
  atmosphericReadings,
  // Props optionnelles pour compatibilité
  data,
  onChange,
  regulations
}) => {
  // Utiliser les props correctes selon ce qui est disponible
  const actualData = data || permitData;
  const actualOnChange = onChange || ((newData: any) => updatePermitData(newData));
  const actualRegulations = regulations || PROVINCIAL_REGULATIONS[selectedProvince];
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
  const [selectedCategory, setSelectedCategory] = useState('');

  // =================== REFS ===================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // =================== SAFETY MANAGER ===================
  const safetyManager: SafetyManager = {
    hasPersonnelInside: () => {
      return personnel.some(person => 
        person.entry_sessions.some(session => session.status === 'active')
      );
    },

    getActiveEntrants: () => {
      return personnel.filter(person => 
        person.entry_sessions.some(session => session.status === 'active')
      );
    },

    triggerEvacuation: (reason: string, details: string[]) => {
      // Marquer tous les entrants actifs comme sortis d'urgence
      const updatedPersonnel = personnel.map(person => {
        if (person.entry_sessions.some(session => session.status === 'active')) {
          const activeSessions = person.entry_sessions.map(session => {
            if (session.status === 'active') {
              return {
                ...session,
                exit_time: new Date().toISOString(),
                type: 'exit' as const,
                status: 'completed' as const,
                notes: `ÉVACUATION D'URGENCE: ${reason}`,
                duration: session.entry_time ? 
                  Math.floor((Date.now() - new Date(session.entry_time).getTime()) / 1000) : 0
              };
            }
            return session;
          });
          
          return {
            ...person,
            entry_sessions: activeSessions,
            is_active: false
          };
        }
        return person;
      });

      setPersonnel(updatedPersonnel);
      
      // Notification d'évacuation
      showNotification(
        `🚨 ÉVACUATION D'URGENCE DÉCLENCHÉE: ${reason}`,
        'error'
      );

      // Son d'alarme d'évacuation
      playAlarmSound('evacuation');
    },

    notifyTestFailure: (levelIndex: number, failures: string[]) => {
      const activeCount = safetyManager.getActiveEntrants().length;
      if (activeCount > 0) {
        safetyManager.triggerEvacuation(
          `Test atmosphérique échoué niveau ${levelIndex + 1}`,
          failures
        );
      }
    }
  };

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
  };

  const editPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonData({
      name: person.name,
      role: person.role,
      company: person.company,
      training: { ...person.training },
      training_expiry: person.training_expiry || '',
      electronic_signature: person.electronic_signature || '',
      formation_confirmed: person.formation_confirmed || false
    });
    setShowPersonModal(true);
  };

  const updatePerson = () => {
    if (!editingPerson) return;

    const trainingRequirements = getTrainingRequirements(selectedProvince);
    const training: Record<string, boolean> = {};
    trainingRequirements.forEach(req => {
      training[req.id] = personData.training[req.id] || false;
    });

    const updatedPerson: Person = {
      ...editingPerson,
      name: personData.name,
      company: personData.company,
      training,
      last_updated: new Date().toISOString(),
      electronic_signature: personData.electronic_signature,
      training_expiry: personData.training_expiry,
      formation_confirmed: personData.formation_confirmed
    };

    setPersonnel(prev => prev.map(p => p.id === editingPerson.id ? updatedPerson : p));
    resetPersonForm();
    setEditingPerson(null);
    setShowPersonModal(false);
    
    showNotification(`✅ ${updatedPerson.name} mis à jour`, 'info');
  };

  const removePerson = (id: string) => {
    const person = personnel.find(p => p.id === id);
    if (!person) return;

    const hasActiveSession = person.entry_sessions.some(session => session.status === 'active');
    if (hasActiveSession) {
      showNotification('⚠️ Impossible de supprimer une personne avec une session active', 'warning');
      return;
    }

    setPersonnel(prev => prev.filter(p => p.id !== id));
    showNotification(`🗑️ ${person.name} supprimé du registre`, 'info');
  };

  const togglePersonStatus = (id: string) => {
    const person = personnel.find(p => p.id === id);
    if (!person) return;

    if (person.role === 'surveillant') {
      const activeEntrants = getActiveEntrants();
      if (person.is_active && activeEntrants.length > 0) {
        showNotification('⚠️ Impossible de désactiver le surveillant avec des entrants à l\'intérieur', 'warning');
        return;
      }

      if (!person.is_active) {
        const existingSurveillant = personnel.find(p => p.role === 'surveillant' && p.is_active && p.id !== id);
        if (existingSurveillant) {
          showNotification('⚠️ Un autre surveillant est déjà actif', 'warning');
          return;
        }
      }
    }

    const updatedPerson = {
      ...person,
      is_active: !person.is_active,
      last_updated: new Date().toISOString()
    };

    setPersonnel(prev => prev.map(p => p.id === id ? updatedPerson : p));
    
    showNotification(
      `${updatedPerson.is_active ? '✅ Activé' : '⏸️ Désactivé'}: ${person.name}`,
      'info'
    );
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

  // =================== GESTION ENTRÉES/SORTIES ===================
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
  // EntryRegistry.tsx - Section 3 (Gestion Équipements et Conformité)

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
  };

  const editEquipment = (eq: Equipment) => {
    setEditingEquipment(eq);
    setEquipmentData({
      name: eq.name,
      category: eq.category,
      type: eq.type,
      location: eq.location,
      requires_calibration: eq.requires_calibration,
      calibration_date: eq.calibration_date || '',
      next_calibration: eq.next_calibration || '',
      notes: eq.notes || ''
    });
    setShowEquipmentModal(true);
  };

  const updateEquipment = () => {
    if (!editingEquipment) return;

    const updatedEquipment: Equipment = {
      ...editingEquipment,
      name: equipmentData.name,
      category: equipmentData.category,
      type: equipmentData.type,
      location: equipmentData.location,
      requires_calibration: equipmentData.requires_calibration,
      calibration_date: equipmentData.calibration_date || undefined,
      next_calibration: equipmentData.next_calibration || undefined,
      notes: equipmentData.notes
    };

    setEquipment(prev => prev.map(eq => eq.id === editingEquipment.id ? updatedEquipment : eq));
    resetEquipmentForm();
    setEditingEquipment(null);
    setShowEquipmentModal(false);
    
    showNotification(`✅ ${updatedEquipment.name} mis à jour`, 'info');
  };

  const removeEquipment = (id: string) => {
    const eq = equipment.find(e => e.id === id);
    if (!eq) return;

    if (eq.status === 'in_use') {
      showNotification('⚠️ Impossible de supprimer un équipement en cours d\'utilisation', 'warning');
      return;
    }

    setEquipment(prev => prev.filter(e => e.id !== id));
    showNotification(`🗑️ ${eq.name} supprimé`, 'info');
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

  const selectPresetEquipment = (categoryKey: string, itemName: string) => {
    const category = (EQUIPMENT_CATEGORIES as any)[categoryKey];
    const item = category?.items.find((i: any) => i.name === itemName);
    
    if (item) {
      setEquipmentData(prev => ({
        ...prev,
        name: item.name,
        category: category.name,
        type: categoryKey,
        requires_calibration: item.requires_calibration
      }));
      setShowPresetEquipment(false);
    }
  };

  // =================== SYSTÈME SORTIE/RETOUR ÉQUIPEMENTS ===================
  const checkoutEquipment = (equipmentId: string, assignedTo: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    const surveillant = getCurrentSurveillant();
    const assignedPerson = personnel.find(p => p.id === assignedTo);

    if (!eq || !surveillant || !assignedPerson) {
      showNotification('⚠️ Surveillant et personne assignée requis', 'warning');
      return;
    }

    if (eq.status !== 'available') {
      showNotification(`⚠️ ${eq.name} n'est pas disponible (${eq.status})`, 'warning');
      return;
    }

    // Vérifier calibration si requise
    if (eq.requires_calibration && eq.next_calibration) {
      const nextCalibration = new Date(eq.next_calibration);
      if (nextCalibration < new Date()) {
        showNotification(`⚠️ ${eq.name} nécessite une calibration avant utilisation`, 'warning');
        return;
      }
    }

    const newSession: EquipmentSession = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type: 'checkout',
      checkout_time: new Date().toISOString(),
      assigned_to: assignedTo,
      surveillant_id: surveillant.id,
      status: 'active'
    };

    const updatedEquipment = {
      ...eq,
      status: 'in_use' as const,
      assigned_to: assignedTo,
      usage_sessions: [...eq.usage_sessions, newSession],
      usage_count: eq.usage_count + 1
    };

    setEquipment(prev => prev.map(e => e.id === equipmentId ? updatedEquipment : e));
    
    showNotification(`📤 SORTI: ${eq.name} assigné à ${assignedPerson.name}`, 'info');
    playAlarmSound('warning');
  };

  const returnEquipment = (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    const surveillant = getCurrentSurveillant();

    if (!eq || !surveillant) {
      showNotification('⚠️ Surveillant requis pour retourner l\'équipement', 'warning');
      return;
    }

    const activeSessionIndex = eq.usage_sessions.findIndex(session => session.status === 'active');
    if (activeSessionIndex === -1) {
      showNotification('⚠️ Aucune session active trouvée pour cet équipement', 'warning');
      return;
    }

    const activeSession = eq.usage_sessions[activeSessionIndex];
    const checkoutTime = activeSession.checkout_time ? new Date(activeSession.checkout_time).getTime() : Date.now();
    const duration = Math.floor((Date.now() - checkoutTime) / 1000);

    const completedSession: EquipmentSession = {
      ...activeSession,
      type: 'return',
      return_time: new Date().toISOString(),
      duration,
      status: 'completed'
    };

    const updatedSessions = [...eq.usage_sessions];
    updatedSessions[activeSessionIndex] = completedSession;

    const updatedEquipment = {
      ...eq,
      status: 'available' as const,
      assigned_to: undefined,
      usage_sessions: updatedSessions,
      total_usage_time: eq.total_usage_time + duration
    };

    setEquipment(prev => prev.map(e => e.id === equipmentId ? updatedEquipment : e));
    
    const assignedPerson = personnel.find(p => p.id === activeSession.assigned_to);
    const durationText = formatDuration(duration);
    showNotification(`📥 RETOURNÉ: ${eq.name} (${assignedPerson?.name}) - Durée: ${durationText}`, 'info');
    playAlarmSound('warning');
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

  // =================== VALIDATION ÉQUIPEMENTS CRITIQUES ===================
  const validateCriticalEquipment = () => {
    const rescueEquipment = equipment.filter(eq => {
      const categoryData = Object.values(EQUIPMENT_CATEGORIES).find(cat => cat.name === eq.category);
      return categoryData?.items.some(item => item.name === eq.name && item.is_rescue);
    });

    const atmosphericEquipment = equipment.filter(eq => {
      const categoryData = Object.values(EQUIPMENT_CATEGORIES).find(cat => cat.name === eq.category);
      return categoryData?.items.some(item => item.name === eq.name && item.is_atmospheric);
    });

    const communicationEquipment = equipment.filter(eq => eq.category.includes('Communication'));
    const ventilationEquipment = equipment.filter(eq => eq.category.includes('Ventilation'));

    // Vérifier calibration des équipements critiques
    const expiredCalibrations = equipment.filter(eq => 
      eq.requires_calibration && 
      eq.next_calibration && 
      new Date(eq.next_calibration) < new Date()
    );

    return {
      hasRescueEquipment: rescueEquipment.length > 0,
      hasAtmosphericEquipment: atmosphericEquipment.length > 0,
      hasCommunicationEquipment: communicationEquipment.length > 0,
      hasVentilationEquipment: ventilationEquipment.length > 0,
      allCalibrationsValid: expiredCalibrations.length === 0,
      expiredCalibrations
    };
  };

  // =================== GESTION RETOURS FORCÉS ===================
  const forceReturnAllEquipment = (reason: string) => {
    const equipmentInUse = equipment.filter(eq => eq.status === 'in_use');
    
    equipmentInUse.forEach(eq => {
      returnEquipment(eq.id);
    });

    if (equipmentInUse.length > 0) {
      showNotification(`📥 ${equipmentInUse.length} équipement(s) retourné(s) automatiquement: ${reason}`, 'warning');
    }
  };

  // =================== SIGNATURE NUMÉRIQUE ===================
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

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
        // Redessiner le background avec logo
        drawSignatureBackground(ctx, canvas.width, canvas.height);
      }
    }
    setSignatureData('');
  };

  const drawSignatureBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background gris pâle
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Bordure
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    
    // Logo C-Secure en background (simulé avec texte)
    ctx.fillStyle = '#e9ecef';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C-SECURE', width / 2, height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Signature numérique', width / 2, height / 2 + 10);
    
    // Reset pour la signature
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const initializeSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawSignatureBackground(ctx, canvas.width, canvas.height);
      }
    }
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

  // =================== EFFETS ===================
  useEffect(() => {
    // Demander permission pour notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Initialiser le canvas de signature quand le modal s'ouvre
    if (showSignatureModal) {
      setTimeout(() => initializeSignatureCanvas(), 100);
    }
  }, [showSignatureModal]);

  // Surveiller changements de surveillant pour retours forcés
  useEffect(() => {
    const currentSurveillant = getCurrentSurveillant();
    if (!currentSurveillant) {
      forceReturnAllEquipment('Aucun surveillant actif');
    }
  }, [personnel]);

  // Mise à jour des données parent
  useEffect(() => {
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

    if (actualOnChange) {
      actualOnChange(registryData);
    }
    if (updateParentData) {
      updateParentData('registry', registryData);
    }
  }, [personnel, equipment, compliance_check, actualOnChange, updateParentData]);
  // EntryRegistry.tsx - Section 4 (Rendu JSX - Dashboard et Personnel)

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Registre d'Entrée - Espace Clos
            </h1>
            <p className="mt-2 opacity-90">
              Province: {selectedProvince} | Réglementation: {regulations.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {getPersonnelStats().activeEntrants}
            </div>
            <div className="text-sm opacity-90">Personnel à l'intérieur</div>
          </div>
        </div>
      </div>

      {/* Dashboard - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Personnel Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personnel Total</p>
              <p className="text-2xl font-bold text-gray-900">{getPersonnelStats().totalPersonnel}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${getCurrentSurveillant() ? 'text-green-600' : 'text-red-600'}`}>
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {getCurrentSurveillant() ? 'Surveillant actif' : 'Aucun surveillant'}
              </span>
            </div>
          </div>
        </div>

        {/* Équipements Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipements</p>
              <p className="text-2xl font-bold text-gray-900">{getEquipmentStats().totalEquipment}</p>
            </div>
            <Wrench className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">En cours:</span>
              <span className="font-medium text-orange-600">{getEquipmentStats().inUse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disponibles:</span>
              <span className="font-medium text-green-600">{getEquipmentStats().available}</span>
            </div>
          </div>
        </div>

        {/* Conformité */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conformité</p>
              <p className="text-2xl font-bold text-gray-900">{getCompliancePercentage()}%</p>
            </div>
            <CheckCircle className={`w-8 h-8 ${isFullyCompliant() ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFullyCompliant() ? 'bg-green-600' : 'bg-orange-600'
                }`}
                style={{ width: `${getCompliancePercentage()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isFullyCompliant() ? 'Conforme ✅' : 'Vérifications requises ⚠️'}
            </p>
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertes</p>
              <p className="text-2xl font-bold text-gray-900">{getEquipmentStats().needsCalibration}</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${getEquipmentStats().needsCalibration > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              {getEquipmentStats().needsCalibration > 0 
                ? 'Calibrations expirées' 
                : 'Aucune alerte active'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Validation et Conformité du Permis */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            Validation et Conformité du Permis
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vérifications requises avant autorisation d'entrée (cochables par le surveillant uniquement)
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(compliance_check).map(([key, value]) => (
              <div 
                key={key}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  value 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => updateComplianceCheck(key as keyof ComplianceCheck, !value)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    value 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {value && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${value ? 'text-green-800' : 'text-gray-700'}`}>
                      {getComplianceLabel(key as keyof ComplianceCheck)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {value ? '✓ Vérifié' : 'Cliquez pour cocher'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            isFullyCompliant() 
              ? 'border-green-300 bg-green-50' 
              : 'border-orange-300 bg-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isFullyCompliant() ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                )}
                <div>
                  <p className={`font-semibold ${isFullyCompliant() ? 'text-green-800' : 'text-orange-800'}`}>
                    Statut Global: {isFullyCompliant() ? 'CONFORME ✅' : 'NON CONFORME ⚠️'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getCompliancePercentage()}% des vérifications complétées
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${isFullyCompliant() ? 'text-green-600' : 'text-orange-600'}`}>
                  {getCompliancePercentage()}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Personnel */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Gestion du Personnel
            </h2>
            <button
              onClick={() => setShowPersonModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Ajouter Personnel
            </button>
          </div>
        </div>

        <div className="p-6">
          {personnel.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aucun personnel enregistré</h3>
              <p className="text-gray-500">Commencez par ajouter un surveillant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {personnel.map((person) => {
                const isInside = person.entry_sessions.some(session => session.status === 'active');
                const activeSessions = person.entry_sessions.filter(session => session.status === 'active');
                const totalSessions = person.entry_sessions.length;

                return (
                  <div
                    key={person.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      person.role === 'surveillant' 
                        ? 'border-blue-200 bg-blue-50'
                        : isInside 
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          person.role === 'surveillant' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          {person.role === 'surveillant' ? (
                            <Eye className="w-6 h-6 text-blue-600" />
                          ) : (
                            <UserCheck className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              person.role === 'surveillant'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {person.role === 'surveillant' ? 'Surveillant' : 'Entrant'}
                            </span>
                            
                            {person.is_active && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Actif
                              </span>
                            )}
                            
                            {isInside && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                                À l'intérieur
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>📍 {person.company}</span>
                            <span>📊 {totalSessions} session(s)</span>
                            {person.training_expiry && (
                              <span>📅 Expire: {new Date(person.training_expiry).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Boutons Entrée/Sortie pour entrants */}
                        {person.role === 'entrant' && (
                          <>
                            {!isInside ? (
                              <button
                                onClick={() => markEntry(person.id)}
                                disabled={!getCurrentSurveillant()}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                              >
                                <LogIn className="w-4 h-4" />
                                Marquer Entrée
                              </button>
                            ) : (
                              <button
                                onClick={() => markExit(person.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                Marquer Sortie
                              </button>
                            )}
                          </>
                        )}

                        {/* Bouton Toggle Status */}
                        <button
                          onClick={() => togglePersonStatus(person.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            person.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {person.is_active ? (
                            <>
                              <UserMinus className="w-4 h-4" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Activer
                            </>
                          )}
                        </button>

                        {/* Bouton Modifier */}
                        <button
                          onClick={() => editPerson(person)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Modifier
                        </button>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => removePerson(person.id)}
                          disabled={isInside}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:bg-gray-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Historique des sessions (si présent) */}
                    {person.entry_sessions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Historique des entrées/sorties
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {person.entry_sessions.slice(-3).reverse().map((session, index) => (
                            <div key={session.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                              <div className="flex items-center space-x-2">
                                {session.status === 'active' ? (
                                  <div className="flex items-center text-green-600">
                                    <LogIn className="w-4 h-4 mr-1" />
                                    <span>Entrée en cours</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-gray-600">
                                    <LogOut className="w-4 h-4 mr-1" />
                                    <span>Session complétée</span>
                                  </div>
                                )}
                                <span className="text-gray-500">
                                  {new Date(session.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {session.duration && (
                                <span className="text-gray-600 font-medium">
                                  {formatDuration(session.duration)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      // EntryRegistry.tsx - Section 5 (Équipements, Modals et Fin)

      {/* Section Équipements */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-green-600" />
              Gestion des Équipements
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPresetEquipment(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Équipement Prédéfini
              </button>
              <button
                onClick={() => setShowEquipmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Équipement Personnalisé
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {equipment.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aucun équipement enregistré</h3>
              <p className="text-gray-500">Ajoutez des équipements pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {equipment.map((eq) => {
                const isInUse = eq.status === 'in_use';
                const needsCalibration = eq.requires_calibration && eq.next_calibration && 
                  new Date(eq.next_calibration) < new Date();
                const assignedPerson = personnel.find(p => p.id === eq.assigned_to);
                const activeSession = eq.usage_sessions.find(session => session.status === 'active');

                return (
                  <div
                    key={eq.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      needsCalibration
                        ? 'border-red-200 bg-red-50'
                        : isInUse
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          needsCalibration
                            ? 'bg-red-100'
                            : isInUse
                              ? 'bg-orange-100'
                              : 'bg-green-100'
                        }`}>
                          <Wrench className={`w-6 h-6 ${
                            needsCalibration
                              ? 'text-red-600'
                              : isInUse
                                ? 'text-orange-600'
                                : 'text-green-600'
                          }`} />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{eq.name}</h3>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              eq.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : eq.status === 'in_use'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {eq.status === 'available' ? '🟢 Disponible' : 
                               eq.status === 'in_use' ? '🟡 En utilisation' : '🔴 Maintenance'}
                            </span>

                            {eq.requires_calibration && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                needsCalibration
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                📅 {needsCalibration ? 'Calibration expirée' : 'Calibré'}
                              </span>
                            )}

                            {/* Badges pour équipements critiques */}
                            {(() => {
                              const categoryData = Object.values(EQUIPMENT_CATEGORIES).find(cat => cat.name === eq.category);
                              const itemData = categoryData?.items.find(item => item.name === eq.name);
                              
                              return (
                                <>
                                  {itemData?.is_rescue && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      🆘 Sauvetage
                                    </span>
                                  )}
                                  {itemData?.is_atmospheric && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      🌬️ Atmosphérique
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>📂 {eq.category}</span>
                            <span>📍 {eq.location}</span>
                            <span>📊 {eq.usage_count} utilisation(s)</span>
                            <span>⏱️ {formatDuration(eq.total_usage_time)}</span>
                            {isInUse && assignedPerson && (
                              <span className="text-orange-600 font-medium">
                                👤 Assigné à: {assignedPerson.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Boutons Sortie/Retour */}
                        {!isInUse ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={selectedPersonId || ''}
                              onChange={(e) => setSelectedPersonId(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              disabled={personnel.length === 0}
                            >
                              <option value="">Assigner à...</option>
                              {personnel.filter(p => p.is_active).map(person => (
                                <option key={person.id} value={person.id}>
                                  {person.name} ({person.role})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                if (selectedPersonId) {
                                  checkoutEquipment(eq.id, selectedPersonId);
                                  setSelectedPersonId(null);
                                }
                              }}
                              disabled={Boolean(!selectedPersonId || needsCalibration)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sortir Équipement
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => returnEquipment(eq.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <LogIn className="w-4 h-4" />
                            Retourner Équipement
                          </button>
                        )}

                        {/* Bouton Modifier */}
                        <button
                          onClick={() => editEquipment(eq)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Modifier
                        </button>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => removeEquipment(eq.id)}
                          disabled={isInUse}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:bg-gray-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Historique des sessions d'utilisation */}
                    {eq.usage_sessions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Historique d'utilisation
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {eq.usage_sessions.slice(-3).reverse().map((session) => {
                            const assignedPerson = personnel.find(p => p.id === session.assigned_to);
                            return (
                              <div key={session.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                <div className="flex items-center space-x-2">
                                  {session.status === 'active' ? (
                                    <div className="flex items-center text-orange-600">
                                      <LogOut className="w-4 h-4 mr-1" />
                                      <span>En cours d'utilisation</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-600">
                                      <LogIn className="w-4 h-4 mr-1" />
                                      <span>Session terminée</span>
                                    </div>
                                  )}
                                  <span className="text-gray-500">
                                    {assignedPerson?.name || 'Utilisateur inconnu'}
                                  </span>
                                  <span className="text-gray-400">
                                    {new Date(session.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                {session.duration && (
                                  <span className="text-gray-600 font-medium">
                                    {formatDuration(session.duration)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout/Modification Personnel */}
      {showPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingPerson ? 'Modifier Personnel' : 'Ajouter Personnel'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={personData.name}
                    onChange={(e) => setPersonData(prev => ({...prev, name: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Nom et prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={personData.role}
                    onChange={(e) => setPersonData(prev => ({...prev, role: e.target.value as 'surveillant' | 'entrant'}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={!!editingPerson}
                  >
                    <option value="entrant">Entrant</option>
                    <option value="surveillant">Surveillant</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={personData.company}
                    onChange={(e) => setPersonData(prev => ({...prev, company: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration formation
                  </label>
                  <input
                    type="date"
                    value={personData.training_expiry}
                    onChange={(e) => setPersonData((prev: any) => ({...prev, training_expiry: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Formations requises */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Formations requises pour {selectedProvince}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getTrainingRequirements(selectedProvince).map((req) => (
                    <div key={req.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={req.id}
                        checked={personData.training[req.id] || false}
                        onChange={(e) => setPersonData((prev: any) => ({
                          ...prev,
                          training: {
                            ...prev.training,
                            [req.id]: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={req.id} className="text-sm text-gray-700">
                        <div className="font-medium">{req.name}</div>
                        <div className="text-xs text-gray-500">{req.authority}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature électronique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature électronique
                </label>
                <input
                  type="text"
                  value={personData.electronic_signature}
                  onChange={(e) => setPersonData((prev: any) => ({...prev, electronic_signature: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Nom pour signature électronique"
                />
              </div>

              {/* Confirmation formation */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="formation_confirmed"
                  checked={personData.formation_confirmed}
                  onChange={(e) => setPersonData((prev: any) => ({...prev, formation_confirmed: e.target.checked}))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="formation_confirmed" className="text-sm text-gray-700">
                  Je confirme que toutes les formations sont valides et à jour
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={editingPerson ? updatePerson : addPerson}
                disabled={!personData.name || !personData.company || !personData.formation_confirmed}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {editingPerson ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowPersonModal(false);
                  setEditingPerson(null);
                  resetPersonForm();
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Signature Numérique */}
      {showSignatureModal && selectedPersonId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Signature className="w-5 h-5" />
                Signature Numérique C-Secure
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Signez directement sur l'écran pour authentifier votre identité
              </p>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={300}
                  className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                
                {/* Logo C-Secure en arrière-plan (sera ajouté par CSS) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-400">C-SECURE</div>
                    <div className="text-sm text-gray-400">Signature numérique authentifiée</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <div>Personne: <span className="font-medium">{personnel.find(p => p.id === selectedPersonId)?.name}</span></div>
                  <div>Date: <span className="font-medium">{new Date().toLocaleString()}</span></div>
                </div>
                
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Effacer
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => saveSignature(selectedPersonId)}
                disabled={!signatureData}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Enregistrer Signature
              </button>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedPersonId(null);
                  clearSignature();
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Équipements Prédéfinis */}
      {showPresetEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Équipements Prédéfinis</h3>
              <p className="text-sm text-gray-600 mt-1">Sélectionnez un équipement dans notre catalogue</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(EQUIPMENT_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => selectPresetEquipment(categoryKey, item.name)}
                          className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="flex gap-1 mt-1">
                            {item.requires_calibration && (
                              <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">📅</span>
                            )}
                            {item.is_rescue && (
                              <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs">🆘</span>
                            )}
                            {item.is_atmospheric && (
                              <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">🌬️</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPresetEquipment(false)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification Équipement */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingEquipment ? 'Modifier Équipement' : 'Ajouter Équipement'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'équipement *
                  </label>
                  <input
                    type="text"
                    value={equipmentData.name}
                    onChange={(e) => setEquipmentData(prev => ({...prev, name: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Nom de l'équipement"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={equipmentData.category}
                    onChange={(e) => setEquipmentData(prev => ({...prev, category: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Catégorie"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <input
                    type="text"
                    value={equipmentData.type}
                    onChange={(e) => setEquipmentData(prev => ({...prev, type: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Type d'équipement"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={equipmentData.location}
                    onChange={(e) => setEquipmentData(prev => ({...prev, location: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Emplacement"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requires_calibration"
                  checked={equipmentData.requires_calibration}
                  onChange={(e) => setEquipmentData(prev => ({...prev, requires_calibration: e.target.checked}))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="requires_calibration" className="text-sm text-gray-700">
                  Cet équipement nécessite une calibration
                </label>
              </div>

              {equipmentData.requires_calibration && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de calibration
                    </label>
                    <input
                      type="date"
                      value={equipmentData.calibration_date}
                      onChange={(e) => setEquipmentData(prev => ({...prev, calibration_date: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prochaine calibration
                    </label>
                    <input
                      type="date"
                      value={equipmentData.next_calibration}
                      onChange={(e) => setEquipmentData(prev => ({...prev, next_calibration: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={equipmentData.notes}
                  onChange={(e) => setEquipmentData(prev => ({...prev, notes: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Notes supplémentaires..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={editingEquipment ? updateEquipment : addEquipment}
                disabled={!equipmentData.name}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {editingEquipment ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowEquipmentModal(false);
                  setEditingEquipment(null);
                  resetEquipmentForm();
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryRegistry;
