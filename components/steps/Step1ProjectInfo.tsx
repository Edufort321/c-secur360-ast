"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye, 
  Thermometer, Activity, Volume2, FileText, Phone, Plus, Trash2,
  User, UserCheck, Timer, LogIn, LogOut, Edit3, Copy, 
  ChevronLeft, ChevronRight, X, Calendar, Zap
} from 'lucide-react';

// =================== DÉTECTION MOBILE ET STYLES ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isMobile ? '8px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '16px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: isMobile ? '10px' : '12px',
    width: '100%',
    fontSize: isMobile ? '16px' : '14px',
    outline: 'none'
  },
  button: {
    padding: isMobile ? '10px 16px' : '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '14px',
    touchAction: 'manipulation',
    minHeight: '44px'
  },
  buttonPrimary: {
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: 'white'
  },
  buttonSuccess: {
    background: 'linear-gradient(to right, #059669, #047857)',
    color: 'white'
  },
  buttonDanger: {
    background: 'linear-gradient(to right, #dc2626, #b91c1c)',
    color: 'white'
  },
  tab: {
    padding: isMobile ? '8px 12px' : '12px 16px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '12px' : '14px',
    marginRight: isMobile ? '4px' : '8px',
    minWidth: isMobile ? '50px' : 'auto',
    textAlign: 'center' as const,
    touchAction: 'manipulation'
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderBottom: '2px solid #60a5fa'
  },
  tabInactive: {
    backgroundColor: '#374151',
    color: '#d1d5db'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '12px' : '16px'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: isMobile ? '12px' : '16px'
  },
  readingCard: {
    padding: isMobile ? '12px' : '16px',
    borderRadius: '8px',
    borderLeft: '4px solid'
  },
  readingSafe: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderLeftColor: '#10b981'
  },
  readingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderLeftColor: '#f59e0b'
  },
  readingDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderLeftColor: '#ef4444'
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px'
  },
  statusSafe: {
    backgroundColor: '#10b981'
  },
  statusWarning: {
    backgroundColor: '#f59e0b'
  },
  statusDanger: {
    backgroundColor: '#ef4444',
    animation: 'pulse 2s infinite'
  },
  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '24px',
    animation: 'pulse 2s infinite'
  },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: '500',
    marginBottom: '6px'
  },
  title: {
    fontSize: isMobile ? '24px' : '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
    lineHeight: 1.2
  },
  subtitle: {
    color: '#9ca3af',
    marginBottom: isMobile ? '16px' : '24px',
    fontSize: isMobile ? '14px' : '16px'
  },
  cardTitle: {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: isMobile ? '12px' : '16px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px'
  },
  mobileHeader: {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#111827',
    zIndex: 10,
    paddingBottom: '8px',
    borderBottom: '1px solid #374151'
  },
  mobileButtonGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    marginBottom: '16px'
  }
};

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  formData?: any;
  onDataChange?: (section: string, data: any) => void;
  province?: ProvinceCode;
  language?: 'fr' | 'en';
  tenant?: string;
  errors?: any;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

interface AtmosphericReading {
  id: string;
  timestamp: string;
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature?: number;
  humidity?: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  taken_by: string;
  notes?: string;
}

interface PersonnelEntry {
  id: string;
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor';
  company: string;
  phone: string;
  age: number;
  employee_id: string;
  certification: string;
  certification_expiry: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  formation_espace_clos: boolean;
  formation_sauvetage: boolean;
  formation_premiers_soins: boolean;
  formation_superviseur?: boolean;
  training_declaration: boolean;
  age_declaration: boolean;
  signature?: string;
  signature_timestamp?: string;
  entry_time?: string;
  exit_time?: string;
  is_inside: boolean;
  entry_exit_history: Array<{
    type: 'entry' | 'exit';
    timestamp: string;
    authorized_by: string;
  }>;
}

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation';
  taken_by: string;
  gps_location?: { 
    lat: number; 
    lng: number; 
    accuracy?: number;
    address?: string;
  };
  file_size?: number;
  file_name?: string;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
}

interface AtmosphericLimits {
  oxygen: {
    min: number;
    max: number;
    critical_low: number;
    critical_high: number;
  };
  lel: {
    max: number;
    critical: number;
  };
  h2s: {
    max: number;
    critical: number;
  };
  co: {
    max: number;
    critical: number;
  };
}

interface RegulationData {
  name: string;
  authority: string;
  authority_phone: string;
  code: string;
  url?: string;
  atmospheric_testing: {
    frequency_minutes: number;
    continuous_monitoring_required?: boolean;
    documentation_required?: boolean;
    limits: AtmosphericLimits;
  };
  personnel_requirements: {
    min_age: number;
    attendant_required: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
  emergency_contacts: EmergencyContact[];
}

// =================== RÉGLEMENTATIONS CANADIENNES 2023 ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData> = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    authority_phone: '1-844-838-0808',
    code: 'RSST Art. 296.1-317 (Modifié 25 juillet 2023)',
    url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013',
    atmospheric_testing: {
      frequency_minutes: 30,
      continuous_monitoring_required: true,
      documentation_required: true,
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 5, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel_requirements: {
      min_age: 18,
      attendant_required: true,
      bidirectional_communication_required: true,
      rescue_plan_required: true,
      competent_person_required: true,
      max_work_period_hours: 8
    },
    emergency_contacts: [
      { name: '911', role: 'Urgences générales', phone: '911', available_24h: true },
      { name: 'CNESST Urgence', role: 'Accidents du travail', phone: '1-844-838-0808', available_24h: true },
      { name: 'Centre Anti-Poison QC', role: 'Intoxications', phone: '1-800-463-5060', available_24h: true },
      { name: 'Info-Excavation', role: 'Localisation services', phone: '1-800-663-9228', available_24h: false }
    ]
  },
  ON: {
    name: 'Ontario',
    authority: 'Ministry of Labour',
    authority_phone: '1-877-202-0008',
    code: 'O. Reg. 632/05 sous la Loi sur la santé et la sécurité au travail',
    url: 'https://www.ontario.ca/laws/regulation/632',
    atmospheric_testing: {
      frequency_minutes: 10,
      continuous_monitoring_required: true,
      documentation_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel_requirements: {
      min_age: 18,
      attendant_required: true,
      bidirectional_communication_required: true,
      rescue_plan_required: true,
      competent_person_required: true,
      max_work_period_hours: 8
    },
    emergency_contacts: [
      { name: '911', role: 'Emergency Services', phone: '911', available_24h: true },
      { name: 'MOL Emergency', role: 'Workplace Accidents', phone: '1-877-202-0008', available_24h: true },
      { name: 'Ontario One Call', role: 'Utility Location', phone: '1-800-400-2255', available_24h: false }
    ]
  },
  BC: {
    name: 'British Columbia',
    authority: 'WorkSafeBC',
    authority_phone: '1-888-621-7233',
    code: 'Occupational Health and Safety Regulation - Part 9',
    url: 'https://www.worksafebc.com/en/law-policy/occupational-health-safety/searchable-ohs-regulation/ohs-regulation/part-09-confined-spaces',
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      documentation_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel_requirements: {
      min_age: 18,
      attendant_required: true,
      bidirectional_communication_required: true,
      rescue_plan_required: true,
      competent_person_required: true,
      max_work_period_hours: 8
    },
    emergency_contacts: [
      { name: '911', role: 'Emergency Services', phone: '911', available_24h: true },
      { name: 'WorkSafeBC Emergency', role: 'Workplace Accidents', phone: '1-888-621-7233', available_24h: true },
      { name: 'BC One Call', role: 'Utility Location', phone: '1-800-474-6886', available_24h: false }
    ]
  },
  AB: {
    name: 'Alberta',
    authority: 'Alberta Occupational Health and Safety',
    authority_phone: '1-866-415-8690',
    code: 'Occupational Health and Safety Code - Part 46',
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    },
    personnel_requirements: { min_age: 18, attendant_required: true, rescue_plan_required: true },
    emergency_contacts: [
      { name: '911', role: 'Emergency', phone: '911', available_24h: true }, 
      { name: 'Alberta OHS', role: 'Workplace Safety', phone: '1-866-415-8690', available_24h: true }
    ]
  },
  SK: { 
    name: 'Saskatchewan', 
    authority: 'Saskatchewan Employment Standards', 
    authority_phone: '1-800-567-7233', 
    code: 'Part XVIII', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  },
  MB: { 
    name: 'Manitoba', 
    authority: 'Workplace Safety & Health', 
    authority_phone: '1-855-957-7233', 
    code: 'Part 13', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  },
  NB: { 
    name: 'New Brunswick', 
    authority: 'WorkSafeNB', 
    authority_phone: '1-800-222-9775', 
    code: 'Reg 91-191', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  },
  NS: { 
    name: 'Nova Scotia', 
    authority: 'Labour Standards', 
    authority_phone: '1-800-952-2687', 
    code: 'OHS Regulations', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  },
  PE: { 
    name: 'Prince Edward Island', 
    authority: 'WCB PEI', 
    authority_phone: '1-800-237-5049', 
    code: 'OHS Regulations', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  },
  NL: { 
    name: 'Newfoundland and Labrador', 
    authority: 'Workplace Health, Safety & Compensation Commission', 
    authority_phone: '1-800-563-9000', 
    code: 'OHS Regulations', 
    atmospheric_testing: { 
      frequency_minutes: 30, 
      limits: { 
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 }, 
        lel: { max: 10, critical: 25 }, 
        h2s: { max: 10, critical: 20 }, 
        co: { max: 35, critical: 200 } 
      } 
    }, 
    personnel_requirements: { min_age: 18, attendant_required: true }, 
    emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] 
  }
};

// =================== TRADUCTIONS COMPLÈTES ===================
const getTexts = (language: 'fr' | 'en') => ({
  fr: {
    title: "Permis d'Entrée en Espace Clos",
    subtitle: "Conforme aux réglementations canadiennes 2023",
    permitNumber: "Numéro de Permis",
    siteIdentification: "Identification du Site",
    atmosphericTesting: "Tests Atmosphériques",
    personnelManagement: "Gestion du Personnel",
    photoDocumentation: "Documentation Photos",
    emergencyContacts: "Contacts d'Urgence",
    rescuePlan: "Plan de Sauvetage",
    savePermit: "💾 Sauvegarder",
    submitPermit: "✅ Soumettre",
    cancel: "❌ Annuler",
    emergencyEvacuation: "🚨 ÉVACUATION",
    addEntrant: "➕ Ajouter Entrant",
    addAttendant: "👁️ Ajouter Surveillant",
    addSupervisor: "👨‍💼 Ajouter Superviseur",
    takePhoto: "📸 Prendre Photo",
    addManualReading: "📊 Ajouter Mesure",
    retestRequired: "⏰ RETEST OBLIGATOIRE",
    valuesOutOfLimits: "⚠️ VALEURS HORS LIMITES",
    criticalValues: "🚨 VALEURS CRITIQUES",
    entryTime: "Heure d'entrée",
    exitTime: "Heure de sortie",
    inside: "À L'INTÉRIEUR",
    outside: "À L'EXTÉRIEUR"
  },
  en: {
    title: "Confined Space Entry Permit",
    subtitle: "Compliant with Canadian Regulations 2023",
    permitNumber: "Permit Number",
    siteIdentification: "Site Identification", 
    atmosphericTesting: "Atmospheric Testing",
    personnelManagement: "Personnel Management",
    photoDocumentation: "Photo Documentation",
    emergencyContacts: "Emergency Contacts",
    rescuePlan: "Rescue Plan",
    savePermit: "💾 Save",
    submitPermit: "✅ Submit",
    cancel: "❌ Cancel",
    emergencyEvacuation: "🚨 EVACUATION",
    addEntrant: "➕ Add Entrant",
    addAttendant: "👁️ Add Attendant", 
    addSupervisor: "👨‍💼 Add Supervisor",
    takePhoto: "📸 Take Photo",
    addManualReading: "📊 Add Reading",
    retestRequired: "⏰ RETEST REQUIRED",
    valuesOutOfLimits: "⚠️ VALUES OUT OF LIMITS",
    criticalValues: "🚨 CRITICAL VALUES",
    entryTime: "Entry Time",
    exitTime: "Exit Time",
    inside: "INSIDE",
    outside: "OUTSIDE"
  }
})[language];

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpacePermit: React.FC<ConfinedSpacePermitProps> = ({
  formData,
  onDataChange,
  province = 'QC',
  language = 'fr',
  tenant,
  errors,
  onSave,
  onSubmit,
  onCancel,
  initialData
}) => {
  const texts = getTexts(language);
  const regulations = PROVINCIAL_REGULATIONS[province];
  
  // États principaux
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province);
  const [permitData, setPermitData] = useState({
    permit_number: formData?.permitData?.permit_number || initialData?.permit_number || `CS-${selectedProvince}-${Date.now().toString().slice(-6)}`,
    issue_date: formData?.permitData?.issue_date || new Date().toISOString().split('T')[0],
    issue_time: formData?.permitData?.issue_time || new Date().toTimeString().slice(0, 5),
    expiry_date: formData?.permitData?.expiry_date || initialData?.expiry_date || '',
    expiry_time: formData?.permitData?.expiry_time || initialData?.expiry_time || '',
    site_name: formData?.permitData?.site_name || initialData?.site_name || '',
    site_address: formData?.permitData?.site_address || initialData?.site_address || '',
    space_location: formData?.permitData?.space_location || initialData?.space_location || '',
    space_description: formData?.permitData?.space_description || initialData?.space_description || '',
    work_description: formData?.permitData?.work_description || initialData?.work_description || '',
    rescue_plan: formData?.permitData?.rescue_plan || initialData?.rescue_plan || '',
    special_conditions: formData?.permitData?.special_conditions || initialData?.special_conditions || '',
    final_authorization: false
  });
  
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>(formData?.personnel || initialData?.personnel || []);
  const [atmosphericReadings, setAtmosphericReadings] = useState<AtmosphericReading[]>(formData?.atmospheric_readings || initialData?.atmospheric_readings || []);
  const [photos, setPhotos] = useState<PhotoRecord[]>(formData?.photos || initialData?.photos || []);
  
  // États contrôles et timers
  const [retestTimer, setRetestTimer] = useState(0);
  const [retestActive, setRetestActive] = useState(false);
  const [lastDangerReading, setLastDangerReading] = useState<AtmosphericReading | null>(null);
  
  // États saisie manuelle
  const [manualReading, setManualReading] = useState({ 
    oxygen: '', 
    lel: '', 
    h2s: '', 
    co: '', 
    temperature: '', 
    humidity: '',
    notes: ''
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('site');

  // États pour les photos
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoRecord[]>(formData?.capturedPhotos || initialData?.photos || []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Références pour les photos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonction pour mettre à jour les données du parent
  const updateParentData = (section: string, data: any) => {
    if (onDataChange) {
      onDataChange(section, data);
    }
  };

  // Fonction pour mettre à jour permitData et synchroniser avec le parent
  const updatePermitData = (updates: any) => {
    const newPermitData = { ...permitData, ...updates };
    setPermitData(newPermitData);
    updateParentData('permitData', newPermitData);
  };

  // Mise à jour du numéro de permis lors du changement de province
  useEffect(() => {
    const newPermitNumber = `CS-${selectedProvince}-${Date.now().toString().slice(-6)}`;
    updatePermitData({ permit_number: newPermitNumber });
  }, [selectedProvince]);

  // Validation des limites atmosphériques
  const validateAtmosphericValue = (type: keyof AtmosphericLimits, value: number): 'safe' | 'warning' | 'danger' => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    const limits = currentRegulations.atmospheric_testing.limits[type];
    
    if (type === 'oxygen') {
      const oxygenLimits = limits as AtmosphericLimits['oxygen'];
      if (value <= oxygenLimits.critical_low || value >= oxygenLimits.critical_high) return 'danger';
      if (value < oxygenLimits.min || value > oxygenLimits.max) return 'warning';
    } else {
      const gasLimits = limits as AtmosphericLimits['lel'] | AtmosphericLimits['h2s'] | AtmosphericLimits['co'];
      if (value >= gasLimits.critical) return 'danger';
      if (value > gasLimits.max) return 'warning';
    }
    
    return 'safe';
  };

  // Timer de retest automatique (15 minutes)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (retestActive && retestTimer > 0) {
      interval = setInterval(() => {
        setRetestTimer(prev => {
          if (prev <= 1) {
            setRetestActive(false);
            alert('🚨 RETEST OBLIGATOIRE: 15 minutes écoulées. Effectuez immédiatement de nouveaux tests atmosphériques!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [retestActive, retestTimer]);

  // Déclenchement automatique du timer de retest
  useEffect(() => {
    const latestReading = atmosphericReadings[atmosphericReadings.length - 1];
    if (latestReading && latestReading.status === 'danger') {
      setLastDangerReading(latestReading);
      setRetestTimer(15 * 60); // 15 minutes en secondes
      setRetestActive(true);
    }
  }, [atmosphericReadings]);

  // Ajout de lecture manuelle avec validation
  const addManualReading = () => {
    if (!manualReading.oxygen || !manualReading.lel || !manualReading.h2s || !manualReading.co) {
      alert('⚠️ Veuillez saisir toutes les valeurs obligatoires (O₂, LEL, H₂S, CO)');
      return;
    }

    const oxygen = parseFloat(manualReading.oxygen);
    const lel = parseFloat(manualReading.lel);
    const h2s = parseFloat(manualReading.h2s);
    const co = parseFloat(manualReading.co);

    if (oxygen < 0 || oxygen > 30 || lel < 0 || lel > 100 || h2s < 0 || h2s > 1000 || co < 0 || co > 1000) {
      alert('⚠️ Valeurs hors plage acceptable. Vérifiez vos mesures.');
      return;
    }

    const oxygenStatus = validateAtmosphericValue('oxygen', oxygen);
    const lelStatus = validateAtmosphericValue('lel', lel);
    const h2sStatus = validateAtmosphericValue('h2s', h2s);
    const coStatus = validateAtmosphericValue('co', co);

    const statuses = [oxygenStatus, lelStatus, h2sStatus, coStatus];
    const overallStatus: 'safe' | 'warning' | 'danger' = statuses.includes('danger') ? 'danger' :
      statuses.includes('warning') ? 'warning' : 'safe';

    const newReading: AtmosphericReading = {
      id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      oxygen,
      lel,
      h2s,
      co,
      temperature: manualReading.temperature ? parseFloat(manualReading.temperature) : undefined,
      humidity: manualReading.humidity ? parseFloat(manualReading.humidity) : undefined,
      status: overallStatus,
      taken_by: 'Opérateur Manuel',
      notes: manualReading.notes || undefined
    };

    setAtmosphericReadings(prev => {
      const newReadings = [...prev, newReading];
      updateParentData('atmospheric_readings', newReadings);
      return newReadings;
    });

    setManualReading({ 
      oxygen: '', 
      lel: '', 
      h2s: '', 
      co: '', 
      temperature: '', 
      humidity: '',
      notes: ''
    });

    if (overallStatus === 'danger') {
      alert('🚨 DANGER CRITIQUE: Les valeurs atmosphériques sont dangereuses! Évacuation immédiate requise!');
    } else if (overallStatus === 'warning') {
      alert('⚠️ ATTENTION: Certaines valeurs sont hors limites acceptables. Surveillance renforcée requise.');
    }
  };

  // Format du timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // =================== GESTION PHOTOS ===================
  const handlePhotoCapture = async (category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation') => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment';
        fileInputRef.current.multiple = true;
        fileInputRef.current.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            files.forEach(file => processPhoto(file, category));
          }
        };
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  };

  const processPhoto = async (file: File, category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation') => {
    try {
      const photoUrl = URL.createObjectURL(file);
      const newPhoto: PhotoRecord = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
        category,
        timestamp: new Date().toISOString(),
        taken_by: 'Opérateur',
        gps_location: await getCurrentLocation(),
        file_size: file.size,
        file_name: file.name
      };
      
      setCapturedPhotos(prev => {
        const newPhotos = [...prev, newPhoto];
        updateParentData('capturedPhotos', newPhotos);
        return newPhotos;
      });
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number; accuracy?: number; address?: string } | undefined> => {
    try {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                address: 'Localisation GPS'
              });
            },
            () => resolve(undefined)
          );
        });
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
    return undefined;
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      before: language === 'fr' ? 'Avant intervention' : 'Before work',
      during: language === 'fr' ? 'Pendant intervention' : 'During work', 
      after: language === 'fr' ? 'Après intervention' : 'After work',
      equipment: language === 'fr' ? 'Équipement' : 'Equipment',
      hazard: language === 'fr' ? 'Danger identifié' : 'Identified hazard',
      documentation: language === 'fr' ? 'Documentation' : 'Documentation'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      before: '#059669',
      during: '#d97706', 
      after: '#0891b2',
      equipment: '#7c3aed',
      hazard: '#dc2626',
      documentation: '#6366f1'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => {
      const newPhotos = prev.filter(photo => photo.id !== photoId);
      updateParentData('capturedPhotos', newPhotos);
      return newPhotos;
    });
  };

  // =================== CARROUSEL PHOTOS ===================
  const PhotoCarousel = ({ photos, onAddPhoto }: {
    photos: PhotoRecord[];
    onAddPhoto: () => void;
  }) => {
    const totalSlides = photos.length + 1;

    const nextSlide = () => setCurrentPhotoIndex((currentPhotoIndex + 1) % totalSlides);
    const prevSlide = () => setCurrentPhotoIndex(currentPhotoIndex === 0 ? totalSlides - 1 : currentPhotoIndex - 1);
    const goToSlide = (index: number) => setCurrentPhotoIndex(index);

    return (
      <div style={{
        position: 'relative',
        marginTop: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '250px' : '300px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            transition: 'transform 0.3s ease',
            height: '100%',
            transform: `translateX(-${currentPhotoIndex * 100}%)`
          }}>
            {photos.map((photo: PhotoRecord, index: number) => (
              <div key={photo.id} style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                  color: 'white',
                  padding: '20px 16px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600' }}>
                      {getCategoryLabel(photo.category)}
                    </h4>
                    <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>
                      {new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                    {photo.gps_location && (
                      <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.7 }}>
                        📍 {photo.gps_location.address}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getCategoryColor(photo.category),
                      color: 'white'
                    }}>
                      {getCategoryLabel(photo.category)}
                    </span>
                    <button 
                      onClick={() => deletePhoto(photo.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.8)',
                        border: '1px solid #ef4444',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        minHeight: '28px'
                      }}
                      title={language === 'fr' ? "Supprimer cette photo" : "Delete this photo"}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{
              minWidth: '100%',
              height: '100%',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '2px dashed rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
            onClick={onAddPhoto}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.2)';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.background = 'rgba(59, 130, 246, 0.1)';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                color: '#60a5fa'
              }}>
                <Camera style={{ width: '24px', height: '24px' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#60a5fa' }}>
                {language === 'fr' ? 'Ajouter une photo' : 'Add photo'}
              </h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textAlign: 'center', color: '#94a3b8' }}>
                {language === 'fr' ? 'Documentez cette étape avec une photo' : 'Document this step with a photo'}
              </p>
            </div>
          </div>
          
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                disabled={totalSlides <= 1}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.9)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.7)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px' }} />
              </button>
              <button 
                onClick={nextSlide}
                disabled={totalSlides <= 1}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.9)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.7)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px' }} />
              </button>
            </>
          )}
          
          {totalSlides > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div 
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index === currentPhotoIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: index === currentPhotoIndex ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Validation globale du permis
  const isPermitValid = () => {
    const hasEntrants = personnel.filter(p => p.role === 'entrant').length > 0;
    const hasAttendants = personnel.filter(p => p.role === 'attendant').length > 0;
    const allSignedOff = personnel.every(p => p.signature);
    const hasRecentReading = atmosphericReadings.length > 0 && 
      new Date().getTime() - new Date(atmosphericReadings[atmosphericReadings.length - 1].timestamp).getTime() < 30 * 60 * 1000;
    const lastReadingSafe = atmosphericReadings.length > 0 && 
      atmosphericReadings[atmosphericReadings.length - 1].status === 'safe';

    return hasEntrants && hasAttendants && allSignedOff && hasRecentReading && lastReadingSafe && 
           permitData.site_name && permitData.space_description && permitData.work_description;
  };

  // Rendu des onglets optimisé mobile
  const renderTabs = () => (
    <div style={{
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingBottom: '8px'
    }} className="mobile-tabs">
      <div style={{ 
        display: 'flex', 
        gap: isMobile ? '4px' : '8px', 
        marginBottom: '16px', 
        borderBottom: '1px solid #374151',
        paddingBottom: '8px',
        minWidth: isMobile ? '400px' : 'auto'
      }}>
        {[
          { id: 'site', label: isMobile ? '🏢' : '🏢 Site', fullLabel: 'Site', icon: <Home style={{ width: '16px', height: '16px' }} /> },
          { id: 'atmospheric', label: isMobile ? '🌬️' : '🌬️ Atmosphère', fullLabel: 'Atmosphère', icon: <Wind style={{ width: '16px', height: '16px' }} /> },
          { id: 'personnel', label: isMobile ? '👥' : '👥 Personnel', fullLabel: 'Personnel', icon: <Users style={{ width: '16px', height: '16px' }} /> },
          { id: 'emergency', label: isMobile ? '🚨' : '🚨 Urgence', fullLabel: 'Urgence', icon: <Phone style={{ width: '16px', height: '16px' }} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
              flexShrink: 0,
              whiteSpace: 'nowrap' as const
            }}
            title={isMobile ? tab.fullLabel : undefined}
          >
            {isMobile ? tab.label : (
              <>
                {tab.icon}
                {tab.label}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Rendu section site optimisé mobile
  const renderSiteSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div>
            <h2 style={styles.title}>{texts.title}</h2>
            <p style={styles.subtitle}>{texts.subtitle}</p>
            {!isMobile && (
              <div style={{ fontSize: '14px', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Shield style={{ width: '16px', height: '16px' }} />
                  📍 Province: {PROVINCIAL_REGULATIONS[selectedProvince].name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Réglementation: {PROVINCIAL_REGULATIONS[selectedProvince].code}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority} - {PROVINCIAL_REGULATIONS[selectedProvince].authority_phone}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>N° Permis</label>
                <div style={{
                  ...styles.input,
                  fontFamily: 'monospace',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 'bold'
                }}>
                  {permitData.permit_number}
                </div>
              </div>
              <div>
                <label style={styles.label}>Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode)}
                  style={styles.input}
                >
                  {Object.entries(PROVINCIAL_REGULATIONS).map(([code, reg]) => (
                    <option key={code} value={code}>
                      {reg.name} ({code})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => updatePermitData({ issue_date: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => updatePermitData({ issue_time: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Date d'expiration</label>
                <input
                  type="date"
                  value={permitData.expiry_date}
                  onChange={(e) => updatePermitData({ expiry_date: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'expiration</label>
                <input
                  type="time"
                  value={permitData.expiry_time}
                  onChange={(e) => updatePermitData({ expiry_time: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <MapPin style={{ width: '20px', height: '20px' }} />
          {texts.siteIdentification}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Nom du site *</label>
              <input
                type="text"
                placeholder="Ex: Usine Pétrochimique Nord"
                value={permitData.site_name}
                onChange={(e) => updatePermitData({ site_name: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Adresse complète</label>
              <input
                type="text"
                placeholder="Ex: 123 Rue Industrielle, Ville, Province"
                value={permitData.site_address}
                onChange={(e) => updatePermitData({ site_address: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>
          
          <div>
            <label style={styles.label}>Localisation précise de l'espace clos *</label>
            <input
              type="text"
              placeholder="Ex: Réservoir T-101, Niveau sous-sol, Section B"
              value={permitData.space_location}
              onChange={(e) => updatePermitData({ space_location: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>Description de l'espace clos *</label>
            <textarea
              placeholder="Ex: Réservoir cylindrique de 5m de diamètre et 8m de hauteur"
              value={permitData.space_description}
              onChange={(e) => updatePermitData({ space_description: e.target.value })}
              style={{ ...styles.input, height: isMobile ? '60px' : '80px', resize: 'vertical' }}
              required
            />
          </div>
          
          {/* Section Photos intégrée */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            border: '1px solid #4b5563'
          }}>
            <h4 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: 'white',
              marginBottom: isMobile ? '12px' : '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Camera style={{ width: '20px', height: '20px' }} />
              📸 Documentation Photos ({capturedPhotos.length})
            </h4>
            
            {capturedPhotos.length > 0 ? (
              <PhotoCarousel 
                photos={capturedPhotos}
                onAddPhoto={() => handlePhotoCapture('before')}
              />
            ) : (
              <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                padding: isMobile ? '32px 16px' : '48px 24px',
                textAlign: 'center',
                border: '2px dashed #6b7280'
              }}>
                <Camera style={{ 
                  width: isMobile ? '48px' : '64px', 
                  height: isMobile ? '48px' : '64px', 
                  margin: '0 auto 16px', 
                  color: '#6b7280' 
                }} />
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '16px' : '18px', 
                  marginBottom: '8px' 
                }}>
                  Aucune photo documentée
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  Ajoutez des photos pour documenter l'espace clos avant, pendant et après l'intervention
                </p>
                
                {/* Boutons d'action photos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <button 
                    onClick={() => handlePhotoCapture('before')}
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      justifyContent: 'center'
                    }}
                  >
                    <Camera style={{ width: '16px', height: '16px' }} />
                    📸 Prendre Photo
                  </button>
                  <button 
                    onClick={() => handlePhotoCapture('before')}
                    style={{
                      ...styles.button,
                      backgroundColor: '#4b5563',
                      color: 'white',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload style={{ width: '16px', height: '16px' }} />
                    📁 Choisir Fichier
                  </button>
                </div>
                
                {/* Catégories de photos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  {[
                    { label: '📋 Avant', color: '#059669', category: 'before' },
                    { label: '⚠️ Pendant', color: '#d97706', category: 'during' },
                    { label: '✅ Après', color: '#0891b2', category: 'after' },
                    { label: '🔧 Équipement', color: '#7c3aed', category: 'equipment' }
                  ].map((categoryItem, index) => (
                    <button
                      key={index}
                      onClick={() => handlePhotoCapture(categoryItem.category as any)}
                      style={{
                        backgroundColor: 'rgba(75, 85, 99, 0.3)',
                        padding: '8px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: `1px solid ${categoryItem.color}30`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = `${categoryItem.color}20`;
                        (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}50`;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(75, 85, 99, 0.3)';
                        (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}30`;
                      }}
                    >
                      <span style={{
                        fontSize: '12px',
                        color: categoryItem.color,
                        fontWeight: '500'
                      }}>
                        {categoryItem.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label style={styles.label}>Description des travaux à effectuer *</label>
            <textarea
              placeholder="Ex: Inspection visuelle, nettoyage des parois, réparation"
              value={permitData.work_description}
              onChange={(e) => updatePermitData({ work_description: e.target.value })}
              style={{ ...styles.input, height: isMobile ? '60px' : '80px', resize: 'vertical' }}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu section atmosphérique optimisé mobile
  const renderAtmosphericSection = () => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Shield style={{ width: '20px', height: '20px' }} />
            Limites - {currentRegulations.name}
            <span style={{
              fontSize: isMobile ? '12px' : '14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              {currentRegulations.atmospheric_testing.frequency_minutes} min
            </span>
          </h3>
          
          <div style={styles.grid4}>
            {Object.entries(currentRegulations.atmospheric_testing.limits).map(([gas, limits]) => (
              <div key={gas} style={{
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                borderRadius: '8px',
                padding: isMobile ? '12px' : '16px',
                border: '1px solid #4b5563'
              }}>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                  {gas === 'oxygen' ? '🫁 O₂' : 
                   gas === 'lel' ? '🔥 LEL' : 
                   gas === 'h2s' ? '☠️ H₂S' : 
                   '💨 CO'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: isMobile ? '12px' : '14px' }}>
                  {gas === 'oxygen' ? (
                    <>
                      <div style={{ color: '#86efac' }}>✅ {(limits as AtmosphericLimits['oxygen']).min}-{(limits as AtmosphericLimits['oxygen']).max}%</div>
                      <div style={{ color: '#fca5a5' }}>🚨 ≤{(limits as AtmosphericLimits['oxygen']).critical_low}% ou ≥{(limits as AtmosphericLimits['oxygen']).critical_high}%</div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: '#86efac' }}>✅ ≤{(limits as AtmosphericLimits['lel']).max} {gas === 'lel' ? '%' : 'ppm'}</div>
                      <div style={{ color: '#fca5a5' }}>🚨 ≥{(limits as AtmosphericLimits['lel']).critical} {gas === 'lel' ? '%' : 'ppm'}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {retestActive && (
          <div style={styles.emergencyCard}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '12px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#f87171' }} />
                <div>
                  <h3 style={{ color: '#fecaca', fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>⏰ RETEST OBLIGATOIRE</h3>
                  <p style={{ color: '#fca5a5', fontSize: isMobile ? '12px' : '14px' }}>Valeurs critiques détectées - Nouveau test requis</p>
                </div>
              </div>
              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#f87171' }}>{formatTime(retestTimer)}</div>
                <div style={{ color: '#fca5a5', fontSize: '14px' }}>Temps restant</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Activity style={{ width: '20px', height: '20px' }} />
            Nouvelle Mesure
          </h3>
          
          <div style={styles.grid4}>
            <div>
              <label style={styles.label}>O₂ (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                placeholder="20.9"
                value={manualReading.oxygen}
                onChange={(e) => setManualReading(prev => ({ ...prev, oxygen: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>LEL (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0"
                value={manualReading.lel}
                onChange={(e) => setManualReading(prev => ({ ...prev, lel: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>H₂S (ppm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="0"
                value={manualReading.h2s}
                onChange={(e) => setManualReading(prev => ({ ...prev, h2s: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>CO (ppm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="0"
                value={manualReading.co}
                onChange={(e) => setManualReading(prev => ({ ...prev, co: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: '16px', 
            marginTop: '16px' 
          }}>
            <div>
              <label style={styles.label}>Température (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="20"
                value={manualReading.temperature}
                onChange={(e) => setManualReading(prev => ({ ...prev, temperature: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Humidité (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="50"
                value={manualReading.humidity}
                onChange={(e) => setManualReading(prev => ({ ...prev, humidity: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={addManualReading}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess,
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                {isMobile ? 'Ajouter' : texts.addManualReading}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Notes (optionnel)</label>
            <textarea
              placeholder="Observations, conditions particulières..."
              value={manualReading.notes}
              onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
              style={{ ...styles.input, height: '60px', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <FileText style={{ width: '20px', height: '20px' }} />
            Historique ({atmosphericReadings.length})
          </h3>
          
          {atmosphericReadings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '24px' : '32px', color: '#9ca3af' }}>
              <Activity style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', margin: '0 auto 16px', color: '#4b5563' }} />
              <p style={{ fontSize: isMobile ? '16px' : '18px', marginBottom: '8px' }}>Aucune mesure enregistrée</p>
              <p style={{ fontSize: '14px' }}>Effectuez votre première mesure atmosphérique ci-dessus.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              maxHeight: isMobile ? '300px' : '400px', 
              overflowY: 'auto' 
            }}>
              {atmosphericReadings.slice().reverse().map((reading) => {
                const readingStyle = reading.status === 'danger' ? styles.readingDanger :
                                   reading.status === 'warning' ? styles.readingWarning :
                                   styles.readingSafe;
                
                return (
                  <div
                    key={reading.id}
                    style={{
                      ...styles.readingCard,
                      ...readingStyle
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '8px',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '8px' : '0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          ...styles.statusIndicator,
                          ...(reading.status === 'danger' ? styles.statusDanger :
                             reading.status === 'warning' ? styles.statusWarning :
                             styles.statusSafe)
                        }}></div>
                        <span style={{
                          fontWeight: '600',
                          color: reading.status === 'danger' ? '#fca5a5' :
                                reading.status === 'warning' ? '#fde047' :
                                '#86efac',
                          fontSize: isMobile ? '14px' : '16px'
                        }}>
                          {reading.status === 'danger' ? '🚨 DANGER' :
                           reading.status === 'warning' ? '⚠️ ATTENTION' :
                           '✅ SÉCURITAIRE'}
                        </span>
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: isMobile ? '12px' : '14px', textAlign: isMobile ? 'center' : 'right' }}>
                        {new Date(reading.timestamp).toLocaleString('fr-CA')} - {reading.taken_by}
                      </div>
                    </div>
                    
                    <div style={styles.grid4}>
                      <div>
                        <span style={{ color: '#9ca3af' }}>O₂:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '500',
                          color: validateAtmosphericValue('oxygen', reading.oxygen) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('oxygen', reading.oxygen) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.oxygen}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>LEL:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '500',
                          color: validateAtmosphericValue('lel', reading.lel) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('lel', reading.lel) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.lel}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>H₂S:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '500',
                          color: validateAtmosphericValue('h2s', reading.h2s) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('h2s', reading.h2s) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.h2s} ppm
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>CO:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '500',
                          color: validateAtmosphericValue('co', reading.co) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('co', reading.co) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.co} ppm
                        </span>
                      </div>
                    </div>
                    
                    {(reading.temperature || reading.humidity || reading.notes) && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #4b5563',
                        fontSize: '14px',
                        color: '#d1d5db'
                      }}>
                        {reading.temperature && <span>🌡️ {reading.temperature}°C </span>}
                        {reading.humidity && <span>💧 {reading.humidity}% </span>}
                        {reading.notes && <div style={{ marginTop: '4px' }}>📝 {reading.notes}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu section contacts d'urgence optimisé mobile
  const renderEmergencySection = () => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Phone style={{ width: '20px', height: '20px' }} />
            {texts.emergencyContacts} - {currentRegulations.name}
          </h3>
          
          <div style={styles.grid2}>
            {currentRegulations.emergency_contacts.map((contact, index) => (
              <div key={index} style={{
                ...styles.readingCard,
                ...(contact.name === '911' ? styles.readingDanger : styles.readingSafe)
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '0'
                }}>
                  <h4 style={{ fontWeight: '600', color: 'white', fontSize: isMobile ? '16px' : '18px' }}>{contact.name}</h4>
                  {contact.available_24h && (
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>24h/7j</span>
                  )}
                </div>
                <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '8px', textAlign: isMobile ? 'center' : 'left' }}>{contact.role}</p>
                <a href={`tel:${contact.phone}`} style={{
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                  fontSize: isMobile ? '16px' : '18px',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '24px',
            padding: isMobile ? '12px' : '16px',
            backgroundColor: 'rgba(220, 38, 38, 0.3)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px'
          }}>
            <h4 style={{
              color: '#fecaca',
              fontWeight: '600',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px' }} />
              Procédure d'Évacuation d'Urgence
            </h4>
            <ol style={{ color: '#fecaca', fontSize: isMobile ? '12px' : '14px', marginLeft: '16px' }}>
              <li style={{ marginBottom: '4px' }}>1. <strong>ARRÊT IMMÉDIAT</strong> de tous les travaux</li>
              <li style={{ marginBottom: '4px' }}>2. <strong>ÉVACUATION</strong> immédiate de tous les entrants</li>
              <li style={{ marginBottom: '4px' }}>3. <strong>APPEL</strong> au 911 et contacts d'urgence</li>
              <li style={{ marginBottom: '4px' }}>4. <strong>INTERDICTION</strong> de re-entrée jusqu'à autorisation</li>
              <li style={{ marginBottom: '4px' }}>5. <strong>RAPPORT</strong> d'incident obligatoire</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Input caché pour capture photo */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        multiple
        style={{ display: 'none' }} 
      />
      
      {/* En-tête mobile sticky */}
      <div style={isMobile ? styles.mobileHeader : { marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '0'
        }}>
          <div>
            <h1 style={styles.title}>{texts.title}</h1>
            <p style={styles.subtitle}>{texts.subtitle}</p>
            <div style={{ fontSize: '14px', color: '#93c5fd', marginTop: '8px' }}>
              <span style={{
                fontFamily: 'monospace',
                backgroundColor: '#1f2937',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #4b5563',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {permitData.permit_number}
              </span>
            </div>
          </div>
          <div style={{
            padding: isMobile ? '12px' : '16px',
            borderRadius: '8px',
            fontWeight: '600',
            backgroundColor: isPermitValid() ? '#059669' : '#d97706',
            color: 'white',
            fontSize: isMobile ? '12px' : '14px',
            textAlign: 'center'
          }}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        </div>
        
        {/* Boutons d'action optimisés mobile */}
        <div style={styles.mobileButtonGrid}>
          <button style={{
            ...styles.button,
            ...styles.buttonDanger,
            justifyContent: 'center'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            {isMobile ? '🚨 ÉVACUATION' : texts.emergencyEvacuation}
          </button>
          <button
            onClick={() => onSave?.({})}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              justifyContent: 'center'
            }}
          >
            <Save style={{ width: '20px', height: '20px' }} />
            {texts.savePermit}
          </button>
          {isPermitValid() && (
            <button
              onClick={() => onSubmit?.({})}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                justifyContent: 'center',
                gridColumn: isMobile ? 'span 2' : 'auto'
              }}
            >
              <CheckCircle style={{ width: '20px', height: '20px' }} />
              {texts.submitPermit}
            </button>
          )}
        </div>
      </div>

      {renderTabs()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '32px' }}>
        {activeTab === 'site' && renderSiteSection()}
        {activeTab === 'atmospheric' && renderAtmosphericSection()}
        {activeTab === 'personnel' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Users style={{ width: '20px', height: '20px' }} />
              {texts.personnelManagement}
            </h3>
            <div style={{ textAlign: 'center', padding: isMobile ? '32px 16px' : '48px' }}>
              <Users style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', margin: '0 auto 16px', color: '#4b5563' }} />
              <p style={{ color: '#9ca3af', fontSize: isMobile ? '16px' : '18px', marginBottom: '8px' }}>Section Personnel en cours de développement</p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Fonctionnalités: signatures électroniques, horodatage entrée/sortie, validation formations.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'emergency' && renderEmergencySection()}
      </div>

      {/* Styles CSS pour les animations et optimisations mobile */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .tab-button:hover {
          background-color: #4b5563;
          color: white;
        }
        
        /* Optimisations tactiles */
        button, input, select, textarea {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        }
        
        /* Scrollbar mobile pour les onglets */
        .mobile-tabs::-webkit-scrollbar {
          display: none;
        }
        
        /* Amélioration de la lisibilité sur mobile */
        @media (max-width: 767px) {
          body {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          /* Empêche le zoom lors du focus sur les inputs sur iOS */
          input[type="text"], input[type="number"], input[type="email"], 
          input[type="tel"], input[type="url"], input[type="password"], 
          textarea, select {
            font-size: 16px !important;
          }
        }
        
        /* Optimisation pour les écrans très petits */
        @media (max-width: 320px) {
          .mobile-tabs {
            padding-left: 4px;
            padding-right: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfinedSpacePermit;
