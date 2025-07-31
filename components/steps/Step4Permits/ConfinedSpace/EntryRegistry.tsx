"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, Users, 
  PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock, History, 
  UserPlus, UserMinus, AlertTriangle, FileText, PenTool as Signature,
  Volume2, Activity
} from 'lucide-react';

// =================== DÉTECTION MOBILE ET STYLES IDENTIQUES AU CODE ORIGINAL ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '6px' : '8px',
    padding: isMobile ? '10px 12px' : '14px',
    width: '100%',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'textfield' as const
  },
  button: {
    padding: isMobile ? '8px 12px' : '14px 24px',
    borderRadius: isMobile ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    boxSizing: 'border-box' as const,
    width: '100%',
    justifyContent: 'center' as const
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  buttonSmall: {
    padding: isMobile ? '6px 10px' : '8px 12px',
    fontSize: isMobile ? '13px' : '14px',
    minHeight: 'auto',
    width: 'auto'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  statusIndicator: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    marginRight: '8px',
    flexShrink: 0
  },
  statusSafe: {
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
  },
  statusWarning: {
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)'
  },
  statusDanger: {
    backgroundColor: '#ef4444',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
  },
  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
  },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: isMobile ? '13px' : '15px',
    fontWeight: '500',
    marginBottom: isMobile ? '4px' : '8px'
  },
  cardTitle: {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: isMobile ? '12px' : '20px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '12px'
  },
  statCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #4b5563',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const
  },
  personCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease',
    marginBottom: '16px'
  },
  personCardSurveillant: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderLeftColor: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  personCardEntrant: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderLeftColor: '#6b7280',
    border: '1px solid rgba(107, 114, 128, 0.3)'
  },
  personCardInside: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  equipmentCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease',
    marginBottom: '16px'
  },
  equipmentAvailable: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  equipmentInUse: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  equipmentDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  }
};

// =================== TYPES PROVINCIAUX ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

// =================== INTERFACES RÉGLEMENTAIRES ===================
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
// =================== COMPOSANT PRINCIPAL ===================
const EntryRegistry: React.FC<EntryRegistryProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles: propStyles,
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
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, width, height);
    
    // Bordure
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    
    // Logo C-Secure en background (simulé avec texte)
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C-SECURE', width / 2, height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('Signature numérique', width / 2, height / 2 + 10);
    
    // Reset pour la signature
    ctx.strokeStyle = '#ffffff';
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
  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Header principal avec style sombre */}
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
              🌍 Province: {selectedProvince} | ⚖️ Réglementation: {actualRegulations.name}
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

      {/* Dashboard - Statistiques avec style sombre */}
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

      {/* Section Validation et Conformité du Permis avec style sombre */}
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
            ⚖️ Vérifications requises avant autorisation d'entrée (cochables par le surveillant uniquement)
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
                  🎯 Statut Global: {isFullyCompliant() ? texts.compliant + ' ✅' : texts.nonCompliant + ' ⚠️'}
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

      {/* Section Surveillant d'Espace Clos avec alerte */}
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
              <Eye style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              👁️ Surveillant d'Espace Clos (Signature Légale Obligatoire)
            </h2>
            <button
              onClick={() => {
                setPersonData(prev => ({ ...prev, role: 'surveillant' }));
                setShowPersonModal(true);
              }}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...styles.buttonSmall
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              Ajouter Surveillant
            </button>
          </div>
        </div>

        {/* Alerte si aucun surveillant */}
        {!getCurrentSurveillant() && (
          <div style={{
            ...styles.emergencyCard,
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <AlertTriangle style={{ width: '32px', height: '32px', color: '#fca5a5' }} />
              <div>
                <h3 style={{ 
                  color: '#fca5a5', 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '16px' : '18px',
                  marginBottom: '8px'
                }}>
                  ⚠️ AUCUN SURVEILLANT ACTIF
                </h3>
                <p style={{ 
                  color: '#fca5a5', 
                  fontSize: isMobile ? '13px' : '14px',
                  margin: 0
                }}>
                  Un surveillant doit signer légalement et être en service avant que des entrants puissent accéder à l'espace clos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des surveillants */}
        {personnel.filter(p => p.role === 'surveillant').length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 20px' : '60px 40px',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Eye style={{ 
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
              Aucun surveillant enregistré
            </h3>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: 1.5
            }}>
              👨‍💼 Un surveillant doit signer légalement et être en service avant que des entrants puissent accéder à l'espace clos.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {personnel.filter(p => p.role === 'surveillant').map((person) => {
              const totalSessions = person.entry_sessions.length;
              const todaySessions = person.entry_sessions.filter(session => 
                new Date(session.timestamp).toDateString() === new Date().toDateString()
              );

              return (
                <div key={person.id} style={{ ...styles.personCard, ...styles.personCardSurveillant }}>
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
                        backgroundColor: 'rgba(59, 130, 246, 0.2)'
                      }}>
                        <Eye style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
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
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#93c5fd',
                            border: '1px solid #3b82f6'
                          }}>
                            👁️ SURVEILLANT
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
                              ✅ EN SERVICE
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
                          <span>📊 Surveillances aujourd'hui: {todaySessions.length}</span>
                          {person.training_expiry && (
                            <span>📅 Formation expire: {new Date(person.training_expiry).toLocaleDateString()}</span>
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
                      {/* Bouton Signature */}
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
                        {person.signature ? 'Nouvelle Signature' : 'Signer Légalement'}
                      </button>

                      {/* Bouton Toggle Status */}
                      <button
                        onClick={() => togglePersonStatus(person.id)}
                        style={{
                          ...styles.button,
                          backgroundColor: person.is_active ? '#dc2626' : '#059669',
                          color: 'white',
                          ...styles.buttonSmall
                        }}
                      >
                        {person.is_active ? (
                          <>
                            <UserMinus style={{ width: '16px', height: '16px' }} />
                            Mettre Hors Service
                          </>
                        ) : (
                          <>
                            <UserPlus style={{ width: '16px', height: '16px' }} />
                            Mettre En Service
                          </>
                        )}
                      </button>

                      {/* Bouton Modifier */}
                      <button
                        onClick={() => editPerson(person)}
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          ...styles.buttonSmall
                        }}
                      >
                        <Edit3 style={{ width: '16px', height: '16px' }} />
                        Modifier
                      </button>
                    </div>
                  </div>

                  {/* Historique journalier du surveillant */}
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
                      📋 Historique de Surveillance - {new Date().toLocaleDateString()}
                    </h4>
                    
                    {todaySessions.length === 0 ? (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(17, 24, 39, 0.3)',
                        borderRadius: '8px',
                        border: '1px solid #374151'
                      }}>
                        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                          📊 Aucune surveillance enregistrée aujourd'hui
                        </p>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {todaySessions.reverse().map((session, index) => (
                          <div 
                            key={session.id} 
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'rgba(17, 24, 39, 0.5)',
                              borderRadius: '8px',
                              border: '1px solid #374151',
                              fontSize: isMobile ? '11px' : '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                                <span style={{ color: '#93c5fd', fontWeight: '600' }}>
                                  Surveillance #{index + 1}
                                </span>
                              </div>
                              <span style={{ color: '#6b7280' }}>
                                📅 {new Date(session.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div style={{ color: '#d1d5db', fontSize: '11px' }}>
                              🎯 Supervision des entrées/sorties et surveillance générale de l'espace clos
                            </div>
                          </div>
                        ))}
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
                            ✍️ Signature légale enregistrée le {person.signature_timestamp ? 
                              new Date(person.signature_timestamp).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section Personnel Entrant avec Surveillance Multiple */}
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
            <div>
              <h2 style={styles.cardTitle}>
                <UserCheck style={{ width: '24px', height: '24px', color: '#10b981' }} />
                👤 Personnel Entrant avec Surveillance Multiple ({getActiveEntrants().length})
              </h2>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '13px',
                margin: 0
              }}>
                🔒 Nécessite un surveillant actif pour toute entrée/sortie
              </p>
            </div>
            <button
              onClick={() => {
                setPersonData(prev => ({ ...prev, role: 'entrant' }));
                setShowPersonModal(true);
              }}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                ...styles.buttonSmall
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              Ajouter Entrant
            </button>
          </div>
        </div>

        {/* Liste des entrants */}
        {personnel.filter(p => p.role === 'entrant').length === 0 ? (
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
              Aucun entrant enregistré
            </h3>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: 1.5
            }}>
              👥 Ajoutez des entrants ci-dessus pour commencer le registre d'entrée avec surveillance.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {personnel.filter(p => p.role === 'entrant').map((person) => {
              const isInside = person.entry_sessions.some(session => session.status === 'active');
              const todaySessions = person.entry_sessions.filter(session => 
                new Date(session.timestamp).toDateString() === new Date().toDateString()
              );
              const totalTimeToday = todaySessions
                .filter(s => s.duration)
                .reduce((sum, s) => sum + (s.duration || 0), 0);

              const cardStyle = isInside ? styles.personCardInside : styles.personCardEntrant;

              return (
                <div key={person.id} style={{ ...styles.personCard, ...cardStyle }}>
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
                        backgroundColor: isInside ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                      }}>
                        <UserCheck style={{ 
                          width: '24px', 
                          height: '24px', 
                          color: isInside ? '#10b981' : '#9ca3af'
                        }} />
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
                            backgroundColor: 'rgba(107, 114, 128, 0.2)',
                            color: '#d1d5db',
                            border: '1px solid #6b7280'
                          }}>
                            👤 ENTRANT
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
                          <span>📊 Entrées aujourd'hui: {todaySessions.length}</span>
                          <span>⏱️ Temps total: {formatDuration(totalTimeToday)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Boutons Entrée/Sortie */}
                      {!isInside ? (
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
                          Marquer Entrée
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
                          Marquer Sortie
                        </button>
                      )}

                      {/* Bouton Toggle Status */}
                      <button
                        onClick={() => togglePersonStatus(person.id)}
                        style={{
                          ...styles.button,
                          backgroundColor: person.is_active ? '#dc2626' : '#059669',
                          color: 'white',
                          ...styles.buttonSmall
                        }}
                      >
                        {person.is_active ? (
                          <>
                            <UserMinus style={{ width: '16px', height: '16px' }} />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <UserPlus style={{ width: '16px', height: '16px' }} />
                            Activer
                          </>
                        )}
                      </button>

                      {/* Bouton Modifier */}
                      <button
                        onClick={() => editPerson(person)}
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          ...styles.buttonSmall
                        }}
                      >
                        <Edit3 style={{ width: '16px', height: '16px' }} />
                        Modifier
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => removePerson(person.id)}
                        disabled={isInside}
                        style={{
                          ...styles.button,
                          ...styles.buttonDanger,
                          ...styles.buttonSmall,
                          opacity: isInside ? 0.5 : 1
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Historique journalier de l'entrant */}
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
                      📋 Historique Journalier - {new Date().toLocaleDateString()}
                    </h4>
                    
                    {todaySessions.length === 0 ? (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(17, 24, 39, 0.3)',
                        borderRadius: '8px',
                        border: '1px solid #374151'
                      }}>
                        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                          📊 Aucune entrée enregistrée aujourd'hui
                        </p>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {todaySessions.reverse().map((session) => (
                          <div 
                            key={session.id} 
                            style={{ 
                              padding: '12px',
                              backgroundColor: session.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                              borderRadius: '8px',
                              border: `1px solid ${session.status === 'active' ? '#10b981' : '#374151'}`,
                              fontSize: isMobile ? '11px' : '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#d1d5db', fontSize: '11px' }}>
                                👁️ Supervisé par {personnel.find(p => p.id === session.surveillant_id)?.name || 'Surveillant'}
                              </span>
                              {session.duration && (
                                <span style={{ 
                                  color: '#fde047', 
                                  fontWeight: '600',
                                  fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                  ⏱️ {formatDuration(session.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Résumé journalier */}
                    {todaySessions.length > 0 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid #3b82f6'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#93c5fd', fontSize: '12px', fontWeight: '600' }}>
                            📊 Résumé du jour: {todaySessions.length} entrée(s)
                          </span>
                          <span style={{ 
                            color: '#60a5fa', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}>
                            ⏱️ Total: {formatDuration(totalTimeToday)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Section Équipements avec style sombre */}
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
              <Wrench style={{ width: '24px', height: '24px', color: '#10b981' }} />
              {texts.equipment}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowPresetEquipment(true)}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess,
                  ...styles.buttonSmall
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                📋 Équipement Prédéfini
              </button>
              <button
                onClick={() => setShowEquipmentModal(true)}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...styles.buttonSmall
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                🔧 Équipement Personnalisé
              </button>
            </div>
          </div>
        </div>

        {equipment.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 20px' : '60px 40px',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Wrench style={{ 
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
              {texts.noEquipment}
            </h3>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: 1.5
            }}>
              🔧 {texts.addEquipmentFirst}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            maxHeight: isMobile ? '500px' : '600px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {equipment.map((eq) => {
              const isInUse = eq.status === 'in_use';
              const needsCalibration = eq.requires_calibration && eq.next_calibration && 
                new Date(eq.next_calibration) < new Date();
              const assignedPerson = personnel.find(p => p.id === eq.assigned_to);
              
              const cardStyle = needsCalibration
                ? styles.equipmentDanger
                : isInUse
                  ? styles.equipmentInUse
                  : styles.equipmentAvailable;

              return (
                <div key={eq.id} style={{ ...styles.equipmentCard, ...cardStyle }}>
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
                        backgroundColor: needsCalibration
                          ? 'rgba(239, 68, 68, 0.2)'
                          : isInUse
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(16, 185, 129, 0.2)'
                      }}>
                        <Wrench style={{ 
                          width: '24px', 
                          height: '24px', 
                          color: needsCalibration
                            ? '#ef4444'
                            : isInUse
                              ? '#f59e0b'
                              : '#10b981'
                        }} />
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
                            {eq.name}
                          </h3>
                          
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: eq.status === 'available'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : eq.status === 'in_use'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                            color: eq.status === 'available' ? '#86efac' : 
                                   eq.status === 'in_use' ? '#fde047' : '#fca5a5',
                            border: `1px solid ${eq.status === 'available' ? '#10b981' : 
                                                 eq.status === 'in_use' ? '#f59e0b' : '#ef4444'}`
                          }}>
                            {eq.status === 'available' ? '🟢 ' + texts.available : 
                             eq.status === 'in_use' ? '🟡 ' + texts.inUse : '🔴 ' + texts.maintenance}
                          </span>

                          {eq.requires_calibration && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: needsCalibration
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                              color: needsCalibration ? '#fca5a5' : '#93c5fd',
                              border: `1px solid ${needsCalibration ? '#ef4444' : '#3b82f6'}`
                            }}>
                              📅 {needsCalibration ? 'Calibration expirée' : texts.calibrated}
                            </span>
                          )}

                          {/* Badges pour équipements critiques */}
                          {(() => {
                            const categoryData = Object.values(EQUIPMENT_CATEGORIES).find(cat => cat.name === eq.category);
                            const itemData = categoryData?.items.find(item => item.name === eq.name);
                            
                            return (
                              <>
                                {itemData?.is_rescue && (
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    color: '#fca5a5',
                                    border: '1px solid #ef4444'
                                  }}>
                                    🆘 Sauvetage
                                  </span>
                                )}
                                {itemData?.is_atmospheric && (
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    color: '#93c5fd',
                                    border: '1px solid #3b82f6'
                                  }}>
                                    🌬️ Atmosphérique
                                  </span>
                                )}
                              </>
                            );
                          })()}
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
                          <span>📂 {eq.category}</span>
                          <span>📍 {eq.location}</span>
                          <span>📊 {eq.usage_count} utilisation(s)</span>
                          <span>⏱️ {formatDuration(eq.total_usage_time)}</span>
                          {isInUse && assignedPerson && (
                            <span style={{ color: '#fde047', fontWeight: '600' }}>
                              👤 Assigné à: {assignedPerson.name}
                            </span>
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
                      {/* Boutons Sortie/Retour */}
                      {!isInUse ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <select
                            value={selectedPersonId || ''}
                            onChange={(e) => setSelectedPersonId(e.target.value)}
                            style={{
                              ...styles.input,
                              width: 'auto',
                              minWidth: '120px',
                              padding: '8px 12px',
                              fontSize: '13px'
                            }}
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
                            style={{
                              ...styles.button,
                              ...styles.buttonSuccess,
                              ...styles.buttonSmall,
                              opacity: (!selectedPersonId || needsCalibration) ? 0.5 : 1
                            }}
                          >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            {texts.checkout}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => returnEquipment(eq.id)}
                          style={{
                            ...styles.button,
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            ...styles.buttonSmall
                          }}
                        >
                          <LogIn style={{ width: '16px', height: '16px' }} />
                          {texts.return}
                        </button>
                      )}

                      {/* Bouton Modifier */}
                      <button
                        onClick={() => editEquipment(eq)}
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          ...styles.buttonSmall
                        }}
                      >
                        <Edit3 style={{ width: '16px', height: '16px' }} />
                        {texts.edit}
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => removeEquipment(eq.id)}
                        disabled={isInUse}
                        style={{
                          ...styles.button,
                          ...styles.buttonDanger,
                          ...styles.buttonSmall,
                          opacity: isInUse ? 0.5 : 1
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                        {texts.delete}
                      </button>
                    </div>
                  </div>

                  {/* Historique des sessions d'utilisation */}
                  {eq.usage_sessions.length > 0 && (
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
                        🔧 Historique d'utilisation
                      </h4>
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}>
                        {eq.usage_sessions.slice(-3).reverse().map((session) => {
                          const assignedPerson = personnel.find(p => p.id === session.assigned_to);
                          return (
                            <div 
                              key={session.id} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                fontSize: isMobile ? '11px' : '12px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {session.status === 'active' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#fde047' }}>
                                    <LogOut style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                                    <span>🟡 En cours d'utilisation</span>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                                    <LogIn style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                                    <span>✅ Session terminée</span>
                                  </div>
                                )}
                                <span style={{ color: '#6b7280' }}>
                                  👤 {assignedPerson?.name || 'Utilisateur inconnu'}
                                </span>
                                <span style={{ color: '#6b7280' }}>
                                  📅 {new Date(session.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {session.duration && (
                                <span style={{ 
                                  color: '#d1d5db', 
                                  fontWeight: '600',
                                  fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                  ⏱️ {formatDuration(session.duration)}
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

      {/* Modal Ajout/Modification Personnel avec style sombre */}
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

              {/* Signature électronique */}
              <div>
                <label style={styles.label}>✍️ Signature électronique</label>
                <input
                  type="text"
                  value={personData.electronic_signature}
                  onChange={(e) => setPersonData(prev => ({...prev, electronic_signature: e.target.value}))}
                  style={styles.input}
                  placeholder="Nom pour signature électronique"
                />
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

      {/* Modal Signature Numérique avec style sombre */}
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
                
                {/* Logo C-Secure overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.1
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: '#9ca3af',
                      marginBottom: '8px'
                    }}>
                      C-SECURE
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af'
                    }}>
                      Signature numérique authentifiée
                    </div>
                  </div>
                </div>
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

      {/* Modal Équipements Prédéfinis avec style sombre */}
      {showPresetEquipment && (
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
            maxWidth: '900px',
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
                margin: '0 0 8px 0'
              }}>
                📋 Équipements Prédéfinis
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                margin: 0
              }}>
                🔧 Sélectionnez un équipement dans notre catalogue
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(EQUIPMENT_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey} style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h4 style={{
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '16px',
                      fontSize: '16px'
                    }}>
                      {category.name}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {category.items.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => selectPresetEquipment(categoryKey, item.name)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(55, 65, 81, 0.5)',
                            border: '1px solid #4b5563',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '14px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.5)';
                            e.currentTarget.style.borderColor = '#6b7280';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                            e.currentTarget.style.borderColor = '#4b5563';
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {item.requires_calibration && (
                              <span style={{
                                padding: '2px 6px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                📅
                              </span>
                            )}
                            {item.is_rescue && (
                              <span style={{
                                padding: '2px 6px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                🆘
                              </span>
                            )}
                            {item.is_atmospheric && (
                              <span style={{
                                padding: '2px 6px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                🌬️
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              borderTop: '1px solid #374151'
            }}>
              <button
                onClick={() => setShowPresetEquipment(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary
                }}
              >
                ❌ Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification Équipement avec style sombre */}
      {showEquipmentModal && (
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
                {editingEquipment ? '✏️ Modifier Équipement' : '🔧 Ajouter Équipement'}
              </h3>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Nom de l'équipement *</label>
                  <input
                    type="text"
                    value={equipmentData.name}
                    onChange={(e) => setEquipmentData(prev => ({...prev, name: e.target.value}))}
                    style={styles.input}
                    placeholder="Nom de l'équipement"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Catégorie</label>
                  <input
                    type="text"
                    value={equipmentData.category}
                    onChange={(e) => setEquipmentData(prev => ({...prev, category: e.target.value}))}
                    style={styles.input}
                    placeholder="Catégorie"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Type</label>
                  <input
                    type="text"
                    value={equipmentData.type}
                    onChange={(e) => setEquipmentData(prev => ({...prev, type: e.target.value}))}
                    style={styles.input}
                    placeholder="Type d'équipement"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Localisation</label>
                  <input
                    type="text"
                    value={equipmentData.location}
                    onChange={(e) => setEquipmentData(prev => ({...prev, location: e.target.value}))}
                    style={styles.input}
                    placeholder="Emplacement"
                  />
                </div>
              </div>

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
                  id="requires_calibration"
                  checked={equipmentData.requires_calibration}
                  onChange={(e) => setEquipmentData(prev => ({...prev, requires_calibration: e.target.checked}))}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label 
                  htmlFor="requires_calibration" 
                  style={{
                    color: '#93c5fd',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📅 Cet équipement nécessite une calibration
                </label>
              </div>

              {equipmentData.requires_calibration && (
                <div style={styles.grid2}>
                  <div>
                    <label style={styles.label}>Date de calibration</label>
                    <input
                      type="date"
                      value={equipmentData.calibration_date}
                      onChange={(e) => setEquipmentData(prev => ({...prev, calibration_date: e.target.value}))}
                      style={styles.input}
                    />
                  </div>
                  
                  <div>
                    <label style={styles.label}>Prochaine calibration</label>
                    <input
                      type="date"
                      value={equipmentData.next_calibration}
                      onChange={(e) => setEquipmentData(prev => ({...prev, next_calibration: e.target.value}))}
                      style={styles.input}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={styles.label}>Notes</label>
                <textarea
                  value={equipmentData.notes}
                  onChange={(e) => setEquipmentData(prev => ({...prev, notes: e.target.value}))}
                  style={{
                    ...styles.input,
                    height: '80px',
                    resize: 'vertical' as const
                  }}
                  placeholder="Notes supplémentaires..."
                />
              </div>
            </div>
            
            <div style={{
              padding: '24px',
              borderTop: '1px solid #374151',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={editingEquipment ? updateEquipment : addEquipment}
                disabled={!equipmentData.name}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  flex: 1,
                  opacity: !equipmentData.name ? 0.5 : 1
                }}
              >
                {editingEquipment ? '💾 Mettre à jour' : '➕ Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowEquipmentModal(false);
                  setEditingEquipment(null);
                  resetEquipmentForm();
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

export default EntryRegistry;
