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

// =================== STYLES CSS INTÉGRÉS ===================
const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: window.innerWidth < 768 ? '12px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  // Styles pour carousel photos
  carousel: {
    position: 'relative',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '16px'
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: window.innerWidth < 768 ? '200px' : '300px',
    overflow: 'hidden'
  },
  carouselSlide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out'
  },
  carouselSlideActive: {
    opacity: 1
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  carouselPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: '#9ca3af'
  },
  carouselControls: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px'
  },
  carouselDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  carouselDotActive: {
    backgroundColor: '#3b82f6',
    transform: 'scale(1.2)'
  },
  carouselNav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    color: 'white',
    padding: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  carouselNavLeft: {
    left: '16px'
  },
  carouselNavRight: {
    right: '16px'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '12px',
    marginTop: '16px'
  },
  photoThumbnail: {
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  photoThumbnailActive: {
    borderColor: '#3b82f6'
  },
  photoInfo: {
    backgroundColor: '#374151',
    padding: '12px',
    fontSize: '14px'
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #374151',
    marginBottom: '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: '12px',
    width: '100%',
    fontSize: '14px',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px'
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
    padding: '12px 16px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px'
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
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
    gap: '16px'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '16px'
  },
  readingCard: {
    padding: '16px',
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
    padding: '24px',
    animation: 'pulse 2s infinite'
  },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  title: {
    fontSize: window.innerWidth < 768 ? '24px' : '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#9ca3af',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }
};

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  province?: ProvinceCode;
  language?: 'fr' | 'en';
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
    savePermit: "💾 Sauvegarder Permis",
    submitPermit: "✅ Soumettre pour Approbation",
    cancel: "❌ Annuler",
    emergencyEvacuation: "🚨 ÉVACUATION D'URGENCE",
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
    savePermit: "💾 Save Permit",
    submitPermit: "✅ Submit for Approval",
    cancel: "❌ Cancel",
    emergencyEvacuation: "🚨 EMERGENCY EVACUATION",
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
  province = 'QC',
  language = 'fr',
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
    permit_number: initialData?.permit_number || `CS-${selectedProvince}-${Date.now().toString().slice(-6)}`,
    issue_date: new Date().toISOString().split('T')[0],
    issue_time: new Date().toTimeString().slice(0, 5),
    expiry_date: initialData?.expiry_date || '',
    expiry_time: initialData?.expiry_time || '',
    site_name: initialData?.site_name || '',
    site_address: initialData?.site_address || '',
    space_location: initialData?.space_location || '',
    space_description: initialData?.space_description || '',
    work_description: initialData?.work_description || '',
    rescue_plan: initialData?.rescue_plan || '',
    special_conditions: initialData?.special_conditions || '',
    final_authorization: false
  });
  
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>(initialData?.personnel || []);
  const [atmosphericReadings, setAtmosphericReadings] = useState<AtmosphericReading[]>(initialData?.atmospheric_readings || []);
  const [photos, setPhotos] = useState<PhotoRecord[]>(initialData?.photos || []);
  
  // États contrôles et timers
  const [permitTimer, setPermitTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [retestTimer, setRetestTimer] = useState(0);
  const [retestActive, setRetestActive] = useState(false);
  const [lastDangerReading, setLastDangerReading] = useState<AtmosphericReading | null>(null);
  
  // Timer réglementaire (30 minutes pour QC)
  const [regulatoryTimer, setRegulatoryTimer] = useState(0);
  const [regulatoryTimerActive, setRegulatoryTimerActive] = useState(false);
  
  // Audio pour alarmes
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialiser le contexte audio
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      setAudioContext(new AudioContext());
    }
  }, []);

  // Fonction pour jouer une alarme sonore
  const playAlarmSound = (type: 'warning' | 'critical' | 'regulatory') => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Différentes fréquences selon le type d'alarme
    const frequencies = {
      warning: [800, 1000], // Bip-bip modéré
      critical: [1200, 800, 1200], // Triple bip urgent
      regulatory: [600, 800] // Bip doux pour rappel réglementaire
    };
    
    const beeps = frequencies[type];
    let currentTime = audioContext.currentTime;
    
    beeps.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      // Volume et durée selon le type
      const volume = type === 'critical' ? 0.3 : type === 'warning' ? 0.2 : 0.15;
      const duration = type === 'critical' ? 0.2 : 0.15;
      
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
      
      osc.start(currentTime);
      osc.stop(currentTime + duration);
      
      currentTime += duration + 0.1; // Pause entre les bips
    });
  };
  
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

  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('site');

  // Mise à jour du numéro de permis lors du changement de province
  useEffect(() => {
    setPermitData(prev => ({
      ...prev,
      permit_number: `CS-${selectedProvince}-${Date.now().toString().slice(-6)}`
    }));
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

  // Timer de retest automatique (15 minutes) avec alarmes
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (retestActive && retestTimer > 0) {
      interval = setInterval(() => {
        setRetestTimer(prev => {
          // Alarmes aux moments critiques
          if (prev === 300) { // 5 minutes restantes
            playAlarmSound('warning');
            alert('⚠️ ATTENTION: Plus que 5 minutes avant retest obligatoire!');
          } else if (prev === 60) { // 1 minute restante
            playAlarmSound('critical');
            alert('🚨 URGENT: Plus que 1 minute avant retest obligatoire!');
          } else if (prev <= 1) {
            playAlarmSound('critical');
            setRetestActive(false);
            alert('🚨 RETEST OBLIGATOIRE: 15 minutes écoulées. Effectuez immédiatement de nouveaux tests atmosphériques!');
            return 0;
          } else if (prev <= 30 && prev % 10 === 0) {
            // Bips réguliers dans les 30 dernières secondes
            playAlarmSound('warning');
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [retestActive, retestTimer, audioContext]);

  // Timer réglementaire automatique (30 minutes pour tests périodiques)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (regulatoryTimerActive && regulatoryTimer > 0) {
      interval = setInterval(() => {
        setRegulatoryTimer(prev => {
          // Alarmes de rappel réglementaire
          if (prev === 300) { // 5 minutes avant échéance
            playAlarmSound('regulatory');
            alert(`⏰ RAPPEL: Test atmosphérique réglementaire requis dans 5 minutes (${PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} min écoulées)`);
          } else if (prev === 60) { // 1 minute avant échéance
            playAlarmSound('warning');
            alert('⚠️ ATTENTION: Test atmosphérique réglementaire requis dans 1 minute!');
          } else if (prev <= 1) {
            playAlarmSound('critical');
            setRegulatoryTimerActive(false);
            alert(`🚨 TEST RÉGLEMENTAIRE REQUIS: ${PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} minutes écoulées. Effectuez un nouveau test atmosphérique!`);
            return 0;
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [regulatoryTimerActive, regulatoryTimer, selectedProvince, audioContext]);

  // Déclenchement automatique des timers
  useEffect(() => {
    const latestReading = atmosphericReadings[atmosphericReadings.length - 1];
    if (latestReading && latestReading.status === 'danger') {
      setLastDangerReading(latestReading);
      setRetestTimer(15 * 60); // 15 minutes en secondes
      setRetestActive(true);
      playAlarmSound('critical');
      alert('🚨 DANGER CRITIQUE DÉTECTÉ! Timer de retest de 15 minutes activé. Surveillance audio active.');
    }
    
    // Démarrer le timer réglementaire après chaque mesure
    if (latestReading) {
      const frequencyMinutes = PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes;
      setRegulatoryTimer(frequencyMinutes * 60); // Convertir en secondes
      setRegulatoryTimerActive(true);
    }
  }, [atmosphericReadings, selectedProvince, audioContext]);

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

    setAtmosphericReadings(prev => [...prev, newReading]);

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
      playAlarmSound('critical');
      alert('🚨 DANGER CRITIQUE: Les valeurs atmosphériques sont dangereuses! Évacuation immédiate requise!');
    } else if (overallStatus === 'warning') {
      playAlarmSound('warning');
      alert('⚠️ ATTENTION: Certaines valeurs sont hors limites acceptables. Surveillance renforcée requise.');
    } else {
      playAlarmSound('regulatory');
    }
  };

  // Format du timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Rendu des onglets
  const renderTabs = () => (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: window.innerWidth < 768 ? '4px' : '8px', 
      marginBottom: '32px', 
      borderBottom: '1px solid #374151',
      overflowX: 'auto',
      paddingBottom: '8px'
    }}>
      {[
        { id: 'site', label: window.innerWidth < 768 ? '🏢' : '🏢 Site', icon: <Home style={{ width: '16px', height: '16px' }} /> },
        { id: 'atmospheric', label: window.innerWidth < 768 ? '🌬️' : '🌬️ Atmosphère', icon: <Wind style={{ width: '16px', height: '16px' }} /> },
        { id: 'personnel', label: window.innerWidth < 768 ? '👥' : '👥 Personnel', icon: <Users style={{ width: '16px', height: '16px' }} /> },
        { id: 'photos', label: window.innerWidth < 768 ? '📸' : '📸 Photos', icon: <Camera style={{ width: '16px', height: '16px' }} /> },
        { id: 'emergency', label: window.innerWidth < 768 ? '🚨' : '🚨 Urgence', icon: <Phone style={{ width: '16px', height: '16px' }} /> }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
            fontSize: window.innerWidth < 768 ? '12px' : '14px',
            padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
            minWidth: window.innerWidth < 768 ? '50px' : 'auto'
          }}
        >
          {window.innerWidth < 768 ? tab.label : (
            <>
              {tab.icon}
              {tab.label}
            </>
          )}
        </button>
      ))}
    </div>
  );

  // Rendu section site
  const renderSiteSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div>
            <h2 style={styles.title}>{texts.title}</h2>
            <p style={styles.subtitle}>{texts.subtitle}</p>
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
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>N° Permis</label>
                <div style={{
                  ...styles.input,
                  fontFamily: 'monospace',
                  fontSize: '18px',
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
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_date: e.target.value }))}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_time: e.target.value }))}
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
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Heure d'expiration</label>
                <input
                  type="time"
                  value={permitData.expiry_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_time: e.target.value }))}
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
                onChange={(e) => setPermitData(prev => ({ ...prev, site_name: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Adresse complète</label>
              <input
                type="text"
                placeholder="Ex: 123 Rue Industrielle, Ville, Province, Code postal"
                value={permitData.site_address}
                onChange={(e) => setPermitData(prev => ({ ...prev, site_address: e.target.value }))}
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
              onChange={(e) => setPermitData(prev => ({ ...prev, space_location: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>Description de l'espace clos *</label>
            <textarea
              placeholder="Ex: Réservoir cylindrique de 5m de diamètre et 8m de hauteur, utilisé pour stockage de produits chimiques"
              value={permitData.space_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, space_description: e.target.value }))}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              required
            />
          </div>
          
          {/* Section Photos intégrée directement */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Camera style={{ width: '20px', height: '20px' }} />
              📸 Documentation Photos ({capturedPhotos.length})
            </h3>
            
            {/* Contrôles de capture */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={startCamera}
                  disabled={isCapturing}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    fontSize: '14px'
                  }}
                >
                  <Camera style={{ width: '16px', height: '16px' }} />
                  {isCapturing ? 'Caméra Active' : '📷 Prendre Photo'}
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    fontSize: '14px'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  📁 Choisir Fichier
                </button>
                
                {isCapturing && (
                  <button
                    onClick={stopCamera}
                    style={{
                      ...styles.button,
                      ...styles.buttonDanger,
                      fontSize: '14px'
                    }}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                    Annuler
                  </button>
                )}
              </div>
              
              {/* Input fichier caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Interface caméra */}
            {isCapturing && (
              <div style={{
                backgroundColor: '#000',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  playsInline
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  {(['before', 'during', 'after', 'equipment', 'hazard', 'documentation'] as const).map(category => (
                    <button
                      key={category}
                      onClick={() => capturePhoto(category)}
                      style={{
                        ...styles.button,
                        ...styles.buttonSuccess,
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                    >
                      {category === 'before' ? '📋' :
                       category === 'during' ? '⚠️' :
                       category === 'after' ? '✅' :
                       category === 'equipment' ? '🔧' :
                       category === 'hazard' ? '⚠️' : '📄'} {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Canvas caché pour capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {capturedPhotos.length === 0 ? (
              <div style={styles.carouselPlaceholder}>
                <Camera style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
                <p style={{ marginBottom: '8px', fontSize: '16px' }}>Aucune photo documentée</p>
                <p style={{ fontSize: '14px' }}>Capturez des photos pour documenter l'intervention</p>
              </div>
            ) : (
              <>
                <div style={styles.carousel}>
                  <div style={styles.carouselContainer}>
                    {capturedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        style={{
                          ...styles.carouselSlide,
                          ...(index === selectedPhoto ? styles.carouselSlideActive : {})
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          style={styles.carouselImage}
                        />
                      </div>
                    ))}
                    
                    {/* Navigation gauche/droite */}
                    {capturedPhotos.length > 1 && (
                      <>
                        <button
                          style={{ ...styles.carouselNav, ...styles.carouselNavLeft }}
                          onClick={() => setSelectedPhoto(prev => prev === 0 ? capturedPhotos.length - 1 : prev - 1)}
                        >
                          <ChevronLeft style={{ width: '20px', height: '20px' }} />
                        </button>
                        <button
                          style={{ ...styles.carouselNav, ...styles.carouselNavRight }}
                          onClick={() => setSelectedPhoto(prev => prev === capturedPhotos.length - 1 ? 0 : prev + 1)}
                        >
                          <ChevronRight style={{ width: '20px', height: '20px' }} />
                        </button>
                      </>
                    )}
                    
                    {/* Points de navigation */}
                    {capturedPhotos.length > 1 && (
                      <div style={styles.carouselControls}>
                        {capturedPhotos.map((_, index) => (
                          <button
                            key={index}
                            style={{
                              ...styles.carouselDot,
                              ...(index === selectedPhoto ? styles.carouselDotActive : {})
                            }}
                            onClick={() => setSelectedPhoto(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Informations de la photo courante avec édition */}
                  {capturedPhotos[selectedPhoto] && (
                    <div style={styles.photoInfo}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={capturedPhotos[selectedPhoto]?.caption || ''}
                            onChange={(e) => updatePhotoCaption(capturedPhotos[selectedPhoto].id, e.target.value)}
                            style={{
                              ...styles.input,
                              fontSize: '14px',
                              marginBottom: '8px',
                              backgroundColor: '#4b5563'
                            }}
                            placeholder="Description de la photo..."
                          />
                          <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <span>📅 {new Date(capturedPhotos[selectedPhoto]?.timestamp).toLocaleString('fr-CA')}</span>
                            <span>👤 {capturedPhotos[selectedPhoto]?.taken_by}</span>
                            <span>📍 {capturedPhotos[selectedPhoto]?.gps_location?.address}</span>
                            <span>💾 {Math.round((capturedPhotos[selectedPhoto]?.file_size || 0) / 1024)} KB</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                          <select
                            value={capturedPhotos[selectedPhoto]?.category || 'documentation'}
                            onChange={(e) => updatePhotoCategory(capturedPhotos[selectedPhoto].id, e.target.value as PhotoRecord['category'])}
                            style={{
                              ...styles.input,
                              fontSize: '12px',
                              padding: '4px 8px',
                              minWidth: '100px'
                            }}
                          >
                            <option value="before">📋 Avant</option>
                            <option value="during">⚠️ Pendant</option>
                            <option value="after">✅ Après</option>
                            <option value="equipment">🔧 Équipement</option>
                            <option value="hazard">⚠️ Danger</option>
                            <option value="documentation">📄 Documentation</option>
                          </select>
                          <button
                            onClick={() => deletePhoto(capturedPhotos[selectedPhoto].id)}
                            style={{
                              ...styles.button,
                              ...styles.buttonDanger,
                              padding: '4px 8px',
                              fontSize: '12px'
                            }}
                          >
                            <Trash2 style={{ width: '12px', height: '12px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Miniatures */}
                <div style={styles.photoGrid}>
                  {capturedPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      style={{
                        ...styles.photoThumbnail,
                        ...(index === selectedPhoto ? styles.photoThumbnailActive : {}),
                        position: 'relative'
                      }}
                      onClick={() => setSelectedPhoto(index)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontSize: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      }}>
                        {photo.category === 'before' ? '📋' :
                         photo.category === 'during' ? '⚠️' :
                         photo.category === 'after' ? '✅' :
                         photo.category === 'equipment' ? '🔧' :
                         photo.category === 'hazard' ? '⚠️' : '📄'}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div>
            <label style={styles.label}>Description des travaux à effectuer *</label>
            <textarea
              placeholder="Ex: Inspection visuelle, nettoyage des parois, réparation de soudures, maintenance préventive"
              value={permitData.work_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, work_description: e.target.value }))}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu section atmosphérique
  const renderAtmosphericSection = () => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Shield style={{ width: '20px', height: '20px' }} />
            Limites Réglementaires - {currentRegulations.name}
            <span style={{
              fontSize: '14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px'
            }}>
              Tests aux {currentRegulations.atmospheric_testing.frequency_minutes} min
            </span>
          </h3>
          
          <div style={styles.grid4}>
            {Object.entries(currentRegulations.atmospheric_testing.limits).map(([gas, limits]) => (
              <div key={gas} style={{
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #4b5563'
              }}>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  {gas === 'oxygen' ? '🫁 O₂' : 
                   gas === 'lel' ? '🔥 LEL' : 
                   gas === 'h2s' ? '☠️ H₂S' : 
                   '💨 CO'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle style={{ width: '32px', height: '32px', color: '#f87171' }} />
                <div>
                  <h3 style={{ color: '#fecaca', fontWeight: 'bold', fontSize: '18px' }}>⏰ RETEST OBLIGATOIRE</h3>
                  <p style={{ color: '#fca5a5' }}>Valeurs critiques détectées - Nouveau test requis</p>
                  <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '4px' }}>
                    🔊 Alarmes sonores actives • Alertes à 5 min, 1 min et expiration
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f87171' }}>{formatTime(retestTimer)}</div>
                <div style={{ color: '#fca5a5', fontSize: '14px' }}>Temps restant</div>
              </div>
            </div>
          </div>
        )}

        {regulatoryTimerActive && !retestActive && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                <div>
                  <h4 style={{ color: '#bfdbfe', fontWeight: '600', fontSize: '16px' }}>
                    ⏰ Prochain Test Réglementaire - {PROVINCIAL_REGULATIONS[selectedProvince].name}
                  </h4>
                  <p style={{ color: '#93c5fd', fontSize: '14px' }}>
                    Tests requis aux {PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} minutes
                  </p>
                  <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '4px' }}>
                    🔊 Rappels sonores à 5 min et 1 min
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>{formatTime(regulatoryTimer)}</div>
                <div style={{ color: '#93c5fd', fontSize: '12px' }}>Temps restant</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Activity style={{ width: '20px', height: '20px' }} />
            Nouvelle Mesure Atmosphérique
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
          
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
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
                {texts.addManualReading}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Notes (optionnel)</label>
            <textarea
              placeholder="Observations, conditions particulières, appareil utilisé..."
              value={manualReading.notes}
              onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
              style={{ ...styles.input, height: '60px', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <FileText style={{ width: '20px', height: '20px' }} />
            Historique des Mesures ({atmosphericReadings.length})
          </h3>
          
          {atmosphericReadings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
              <Activity style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#4b5563' }} />
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Aucune mesure enregistrée</p>
              <p style={{ fontSize: '14px' }}>Effectuez votre première mesure atmosphérique ci-dessus.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
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
                                '#86efac'
                        }}>
                          {reading.status === 'danger' ? '🚨 DANGER' :
                           reading.status === 'warning' ? '⚠️ ATTENTION' :
                           '✅ SÉCURITAIRE'}
                        </span>
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '14px' }}>
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

  // Rendu section contacts d'urgence
  const renderEmergencySection = () => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: '600', color: 'white' }}>{contact.name}</h4>
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
                <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>{contact.role}</p>
                <a href={`tel:${contact.phone}`} style={{
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  textDecoration: 'none'
                }}>
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '24px',
            padding: '16px',
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
              gap: '8px'
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px' }} />
              Procédure d'Évacuation d'Urgence
            </h4>
            <ol style={{ color: '#fecaca', fontSize: '14px', marginLeft: '16px' }}>
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
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: window.innerWidth < 768 ? '16px' : '0'
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
                border: '1px solid #4b5563'
              }}>
                {permitData.permit_number}
              </span>
            </div>
          </div>
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            fontWeight: '600',
            backgroundColor: isPermitValid() ? '#059669' : '#d97706',
            color: 'white'
          }}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: window.innerWidth < 768 ? '8px' : '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button style={{
            ...styles.button,
            ...styles.buttonDanger,
            fontSize: window.innerWidth < 768 ? '12px' : '14px',
            padding: window.innerWidth < 768 ? '8px 12px' : '12px 24px'
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            {texts.emergencyEvacuation}
          </button>
          <button
            onClick={() => onSave?.({})}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              fontSize: window.innerWidth < 768 ? '12px' : '14px',
              padding: window.innerWidth < 768 ? '8px 12px' : '12px 24px'
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
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                padding: window.innerWidth < 768 ? '8px 12px' : '12px 24px'
              }}
            >
              <CheckCircle style={{ width: '20px', height: '20px' }} />
              {texts.submitPermit}
            </button>
          )}
        </div>
      </div>

      {renderTabs()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {activeTab === 'site' && renderSiteSection()}
        {activeTab === 'atmospheric' && renderAtmosphericSection()}
        {activeTab === 'personnel' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Users style={{ width: '20px', height: '20px' }} />
              {texts.personnelManagement}
            </h3>
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Users style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#4b5563' }} />
              <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '8px' }}>Section Personnel en cours de développement</p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Fonctionnalités: signatures électroniques, horodatage entrée/sortie, validation formations.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'photos' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Camera style={{ width: '20px', height: '20px' }} />
              {texts.photoDocumentation}
            </h3>
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Camera style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#4b5563' }} />
              <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '8px' }}>Photos intégrées dans la section Site</p>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Utilisez la section Site pour capturer et gérer vos photos de documentation.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'emergency' && renderEmergencySection()}
      </div>

      {/* Styles CSS pour les animations */}
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
        
        .tab-button:hover {
          background-color: #4b5563;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ConfinedSpacePermit;
