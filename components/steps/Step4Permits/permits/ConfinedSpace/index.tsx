"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye, 
  Thermometer, Activity, Volume2, FileText, Phone, Plus, Trash2,
  User, UserCheck, Timer, LogIn, LogOut, Edit3, Copy, 
  ChevronLeft, ChevronRight, X, Calendar, Zap, Wrench
} from 'lucide-react';

// =================== SECTION 1: DÉTECTION MOBILE ET STYLES ===================
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
  tab: {
    padding: isMobile ? '10px 12px' : '12px 20px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '14px',
    marginRight: isMobile ? '4px' : '8px',
    minWidth: isMobile ? '60px' : 'auto',
    textAlign: 'center' as const,
    touchAction: 'manipulation',
    whiteSpace: 'nowrap' as const
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderBottom: '3px solid #60a5fa',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  tabInactive: {
    backgroundColor: '#374151',
    color: '#d1d5db',
    border: '1px solid #4b5563'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  readingCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease'
  },
  readingSafe: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  readingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  readingDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
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
  title: {
    fontSize: isMobile ? '20px' : '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isMobile ? '4px' : '8px',
    lineHeight: 1.2
  },
  subtitle: {
    color: '#9ca3af',
    marginBottom: isMobile ? '8px' : '24px',
    fontSize: isMobile ? '12px' : '16px'
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
  mobileHeader: {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#111827',
    zIndex: 100,
    paddingBottom: isMobile ? '8px' : '12px',
    borderBottom: '1px solid #374151',
    marginBottom: isMobile ? '8px' : '16px',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  mobileButtonGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '6px' : '16px',
    marginTop: isMobile ? '8px' : '16px',
    width: '100%'
  }
};

// =================== SECTION 2: TYPES ET RÉGLEMENTATIONS ===================
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

// RÉGLEMENTATIONS CANADIENNES 2023
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

// TRADUCTIONS COMPLÈTES
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

// =================== SECTION 3: COMPOSANT PRINCIPAL ET ÉTATS ===================
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
    final_authorization: false,
    rescue_plan_type: formData?.permitData?.rescue_plan_type || initialData?.rescue_plan_type || '',
    rescue_plan_responsible: formData?.permitData?.rescue_plan_responsible || initialData?.rescue_plan_responsible || '',
    rescue_team_phone: formData?.permitData?.rescue_team_phone || initialData?.rescue_team_phone || '',
    rescue_response_time: formData?.permitData?.rescue_response_time || initialData?.rescue_response_time || '',
    rescue_equipment: formData?.permitData?.rescue_equipment || initialData?.rescue_equipment || {},
    rescue_training: formData?.permitData?.rescue_training || initialData?.rescue_training || {},
    rescue_steps: formData?.permitData?.rescue_steps || initialData?.rescue_steps || [],
    ventilation_required: formData?.permitData?.ventilation_required || initialData?.ventilation_required || false,
    ventilation_type: formData?.permitData?.ventilation_type || initialData?.ventilation_type || '',
    ventilation_flow_rate: formData?.permitData?.ventilation_flow_rate || initialData?.ventilation_flow_rate || '',
    ventilation_equipment: formData?.permitData?.ventilation_equipment || initialData?.ventilation_equipment || {},
    alarm_system_type: formData?.permitData?.alarm_system_type || initialData?.alarm_system_type || '',
    ventilation_monitoring: formData?.permitData?.ventilation_monitoring || initialData?.ventilation_monitoring || '',
    air_quality_continuous: formData?.permitData?.air_quality_continuous || initialData?.air_quality_continuous || false,
    air_inlet_location: formData?.permitData?.air_inlet_location || initialData?.air_inlet_location || '',
    air_outlet_location: formData?.permitData?.air_outlet_location || initialData?.air_outlet_location || '',
    air_exhaust_location: formData?.permitData?.air_exhaust_location || initialData?.air_exhaust_location || '',
    ventilation_system_validated: formData?.permitData?.ventilation_system_validated || initialData?.ventilation_system_validated || false,
    last_drill_date: formData?.permitData?.last_drill_date || initialData?.last_drill_date || '',
    drill_results: formData?.permitData?.drill_results || initialData?.drill_results || '',
    drill_notes: formData?.permitData?.drill_notes || initialData?.drill_notes || '',
    rescue_plan_validated: formData?.permitData?.rescue_plan_validated || initialData?.rescue_plan_validated || false,
    supervisor_name: formData?.permitData?.supervisor_name || initialData?.supervisor_name || '',
    supervisor_company: formData?.permitData?.supervisor_company || initialData?.supervisor_company || '',
    supervisor_signature_date: formData?.permitData?.supervisor_signature_date || initialData?.supervisor_signature_date || new Date().toISOString().split('T')[0],
    supervisor_signature_time: formData?.permitData?.supervisor_signature_time || initialData?.supervisor_signature_time || new Date().toTimeString().slice(0, 5),
    supervisor_signature: formData?.permitData?.supervisor_signature || initialData?.supervisor_signature || '',
    supervisor_signature_timestamp: formData?.permitData?.supervisor_signature_timestamp || initialData?.supervisor_signature_timestamp || '',
    supervisor_signature_time_precise: formData?.permitData?.supervisor_signature_time_precise || initialData?.supervisor_signature_time_precise || '',
    supervisor_certified: formData?.permitData?.supervisor_certified || initialData?.supervisor_certified || false,
    attendants: formData?.permitData?.attendants || initialData?.attendants || [],
    entrants: formData?.permitData?.entrants || initialData?.entrants || [],
    equipment_checklist: formData?.permitData?.equipment_checklist || initialData?.equipment_checklist || [],
    mandatory_equipment: formData?.permitData?.mandatory_equipment || initialData?.mandatory_equipment || {}
  });
  
  const [atmosphericReadings, setAtmosphericReadings] = useState<AtmosphericReading[]>(formData?.atmospheric_readings || initialData?.atmospheric_readings || []);
  
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

  // GESTION PHOTOS
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
      
      setCurrentPhotoIndex(capturedPhotos.length);
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

  // =================== SECTION 5: RENDU SITE, PERSONNEL ET COMPOSANT FINAL ===================
  
  // Rendu section site
  const renderSiteSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div>
            <h2 style={styles.title}>{texts.title}</h2>
            <p style={styles.subtitle}>{texts.subtitle}</p>
            {!isMobile && (
              <div style={{ fontSize: '14px', color: '#93c5fd', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield style={{ width: '16px', height: '16px' }} />
                  📍 Province: {PROVINCIAL_REGULATIONS[selectedProvince].name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Réglementation: {PROVINCIAL_REGULATIONS[selectedProvince].code}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>N° Permis</label>
                <div style={{
                  ...styles.input,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: isMobile ? '15px' : '17px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #374151, #4b5563)',
                  border: '1px solid #60a5fa',
                  color: '#e2e8f0'
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
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              style={{ ...styles.input, height: isMobile ? '80px' : '100px', resize: 'vertical' }}
              required
            />
          </div>
          
          {/* Section Photos Carrousel Intégrée */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            border: '2px solid #4b5563',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h4 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: 'white',
              marginBottom: isMobile ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Camera style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
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
                borderRadius: '12px',
                padding: isMobile ? '40px 20px' : '56px 32px',
                textAlign: 'center',
                border: '2px dashed #6b7280',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <Camera style={{ 
                    width: isMobile ? '56px' : '72px', 
                    height: isMobile ? '56px' : '72px', 
                    margin: '0 auto 20px', 
                    color: '#6b7280',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                  }} />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: isMobile ? '18px' : '20px', 
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    Aucune photo documentée
                  </p>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: isMobile ? '14px' : '15px',
                    marginBottom: '24px',
                    lineHeight: 1.5,
                    maxWidth: '320px',
                    margin: '0 auto 24px'
                  }}>
                    Ajoutez des photos pour documenter l'espace clos avant, pendant et après l'intervention
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <button 
                      onClick={() => handlePhotoCapture('before')}
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        justifyContent: 'center',
                        fontSize: isMobile ? '15px' : '16px'
                      }}
                    >
                      <Camera style={{ width: '18px', height: '18px' }} />
                      📸 Prendre Photo
                    </button>
                    <button 
                      onClick={() => handlePhotoCapture('before')}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        justifyContent: 'center',
                        fontSize: isMobile ? '15px' : '16px'
                      }}
                    >
                      <Upload style={{ width: '18px', height: '18px' }} />
                      📁 Choisir Fichier
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: '12px'
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
                          backgroundColor: 'rgba(75, 85, 99, 0.4)',
                          padding: isMobile ? '12px 8px' : '14px 12px',
                          borderRadius: '10px',
                          textAlign: 'center',
                          border: `1px solid ${categoryItem.color}40`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: isMobile ? '13px' : '14px'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = `${categoryItem.color}25`;
                          (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}60`;
                          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(75, 85, 99, 0.4)';
                          (e.target as HTMLButtonElement).style.borderColor = `${categoryItem.color}40`;
                          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <span style={{
                          color: categoryItem.color,
                          fontWeight: '600'
                        }}>
                          {categoryItem.label}
                        </span>
                      </button>
                    ))}
                  </div>
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
              style={{ ...styles.input, height: isMobile ? '80px' : '100px', resize: 'vertical' }}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu section personnel (version simplifiée pour respecter la limite de longueur)
  const renderPersonnelSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <UserCheck style={{ width: '20px', height: '20px' }} />
          👨‍💼 Superviseur d'Entrée (Obligatoire)
        </h3>
        
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Nom complet du superviseur *</label>
            <input
              type="text"
              placeholder="Ex: Jean Tremblay"
              value={permitData.supervisor_name || ''}
              onChange={(e) => updatePermitData({ supervisor_name: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>Compagnie/Organisation *</label>
            <input
              type="text"
              placeholder="Ex: Entreprises ABC Inc."
              value={permitData.supervisor_company || ''}
              onChange={(e) => updatePermitData({ supervisor_company: e.target.value })}
              style={styles.input}
              required
            />
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <label style={styles.label}>Certification et Signature Électronique *</label>
          <div style={{
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '24px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            transition: 'all 0.3s ease'
          }}>
            {!permitData.supervisor_signature ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}>
                  <input
                    type="checkbox"
                    id="supervisor_certification"
                    checked={permitData.supervisor_certified || false}
                    onChange={(e) => updatePermitData({ supervisor_certified: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <label 
                    htmlFor="supervisor_certification"
                    style={{
                      color: '#d1d5db',
                      fontSize: isMobile ? '14px' : '15px',
                      lineHeight: 1.6,
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '500'
                    }}
                  >
                    <strong>Je certifie :</strong> Posséder les qualifications requises et autoriser l'entrée dans cet espace clos.
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!permitData.supervisor_certified) {
                      alert('⚠️ Vous devez d\'abord cocher la case de certification avant de signer.');
                      return;
                    }
                    const name = prompt('Veuillez taper votre nom complet pour signer électroniquement:');
                    if (name && name.trim()) {
                      const now = new Date();
                      updatePermitData({ 
                        supervisor_signature: name.trim(),
                        supervisor_signature_timestamp: now.toISOString(),
                        supervisor_signature_time_precise: now.toLocaleString('fr-CA')
                      });
                    }
                  }}
                  disabled={!permitData.supervisor_certified}
                  style={{
                    ...styles.button,
                    ...(permitData.supervisor_certified ? styles.buttonPrimary : styles.buttonSecondary),
                    justifyContent: 'center',
                    fontSize: isMobile ? '15px' : '16px',
                    cursor: permitData.supervisor_certified ? 'pointer' : 'not-allowed',
                    opacity: permitData.supervisor_certified ? 1 : 0.5
                  }}
                >
                  <PenTool style={{ width: '18px', height: '18px' }} />
                  {permitData.supervisor_certified ? 'Signer Électroniquement' : 'Certification Requise'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: '#10b981', 
                  margin: '0 auto 12px'
                }} />
                <div style={{ 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontFamily: 'cursive', 
                  color: '#10b981', 
                  marginBottom: '12px',
                  fontWeight: '700'
                }}>
                  {permitData.supervisor_signature}
                </div>
                <div style={{ 
                  color: '#86efac', 
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '600'
                }}>
                  ✅ SUPERVISEUR CERTIFIÉ ET AUTORISÉ
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // =================== COMPOSANT PRINCIPAL FINAL ===================
  return (
    <div style={styles.container}>
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        multiple
        style={{ display: 'none' }} 
      />
      
      <div style={isMobile ? styles.mobileHeader : { marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between', 
          marginBottom: isMobile ? '12px' : '20px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '8px' : '0'
        }}>
          <div style={{ width: '100%' }}>
            <h1 style={styles.title}>{texts.title}</h1>
            <p style={styles.subtitle}>{texts.subtitle}</p>
            <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: isMobile ? '4px' : '12px' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                backgroundColor: '#1f2937',
                padding: isMobile ? '4px 8px' : '6px 12px',
                borderRadius: '4px',
                border: '1px solid #4b5563',
                fontSize: isMobile ? '11px' : '15px',
                color: '#e2e8f0'
              }}>
                {permitData.permit_number}
              </span>
            </div>
          </div>
          {!isMobile && (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              fontWeight: '700',
              backgroundColor: isPermitValid() ? '#059669' : '#d97706',
              color: 'white',
              fontSize: '16px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: '140px'
            }}>
              {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
            </div>
          )}
        </div>
        
        {isMobile && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontWeight: '600',
            backgroundColor: isPermitValid() ? '#059669' : '#d97706',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '8px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        )}
        
        <div style={styles.mobileButtonGrid}>
          <button style={{
            ...styles.button,
            ...styles.buttonDanger
          }}>
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            {isMobile ? 'ÉVACUATION' : texts.emergencyEvacuation}
          </button>
          <button
            onClick={() => onSave?.({})}
            style={{
              ...styles.button,
              ...styles.buttonPrimary
            }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            Sauvegarder
          </button>
          {isPermitValid() && (
            <button
              onClick={() => onSubmit?.({})}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                gridColumn: isMobile ? 'span 2' : 'auto'
              }}
            >
              <CheckCircle style={{ width: '16px', height: '16px' }} />
              {isMobile ? 'Soumettre' : texts.submitPermit}
            </button>
          )}
        </div>
      </div>

      {renderTabs()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '32px', width: '100%' }}>
        {activeTab === 'site' && renderSiteSection()}
        {activeTab === 'atmospheric' && renderAtmosphericSection()}
        {activeTab === 'personnel' && renderPersonnelSection()}
        {activeTab === 'emergency' && renderEmergencySection()}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          transform: translateY(-1px);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        button, input, select, textarea {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3);
          touch-action: manipulation;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.8);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        
        @media (max-width: 767px) {
          body {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          * {
            box-sizing: border-box;
          }
          
          input[type="text"], input[type="number"], input[type="email"], 
          input[type="tel"], input[type="url"], input[type="password"], 
          input[type="date"], input[type="time"],
          textarea, select {
            font-size: 16px !important;
            transform: none !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          
          .container {
            padding: 4px !important;
            overflow-x: hidden !important;
          }
          
          .card {
            margin-bottom: 8px !important;
            padding: 12px !important;
          }
          
          .mobile-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .mobile-tabs::-webkit-scrollbar {
            display: none;
          }
        }
        
        @media (max-width: 320px) {
          .container {
            padding: 4px !important;
          }
        }
        
        @media (prefers-reduced-motion: no-preference) {
          * {
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfinedSpacePermit;
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
      
      if (currentPhotoIndex >= newPhotos.length + 1) {
        setCurrentPhotoIndex(Math.max(0, newPhotos.length));
      }
      return newPhotos;
    });
  };

  // CARROUSEL PHOTOS OPTIMISÉ MOBILE
  const PhotoCarousel = ({ photos, onAddPhoto }: {
    photos: PhotoRecord[];
    onAddPhoto: () => void;
  }) => {
    const totalSlides = photos.length + 1; // +1 pour la slide "Ajouter"

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
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '280px' : '350px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            height: '100%',
            transform: `translateX(-${currentPhotoIndex * 100}%)`
          }}>
            {/* Photos existantes */}
            {photos.map((photo: PhotoRecord, index: number) => (
              <div key={photo.id} style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a'
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
                {/* Overlay avec métadonnées */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))',
                  color: 'white',
                  padding: isMobile ? '24px 16px 16px' : '32px 24px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <h4 style={{ 
                      margin: '0 0 6px', 
                      fontSize: isMobile ? '15px' : '16px', 
                      fontWeight: '700',
                      color: '#ffffff'
                    }}>
                      {getCategoryLabel(photo.category)}
                    </h4>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: isMobile ? '12px' : '13px', 
                      opacity: 0.8,
                      color: '#e2e8f0'
                    }}>
                      📅 {new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                    {photo.gps_location && (
                      <p style={{ 
                        margin: '0', 
                        fontSize: isMobile ? '11px' : '12px', 
                        opacity: 0.7,
                        color: '#cbd5e1'
                      }}>
                        📍 {photo.gps_location.address}
                      </p>
                    )}
                    {photo.file_size && (
                      <p style={{ 
                        margin: '4px 0 0', 
                        fontSize: '11px', 
                        opacity: 0.6,
                        color: '#94a3b8'
                      }}>
                        📁 {(photo.file_size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span style={{
                      fontSize: isMobile ? '11px' : '12px',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: getCategoryColor(photo.category),
                      color: 'white',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {getCategoryLabel(photo.category)}
                    </span>
                    <button 
                      onClick={() => deletePhoto(photo.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: '1px solid #ef4444',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        minHeight: '32px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      title={language === 'fr' ? "Supprimer cette photo" : "Delete this photo"}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(220, 38, 38, 1)';
                        (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.9)';
                        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slide "Ajouter photo" */}
            <div style={{
              minWidth: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
              border: '2px dashed rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '16px' : '20px',
              position: 'relative'
            }}
            onClick={onAddPhoto}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))';
              (e.target as HTMLDivElement).style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}>
              <div style={{
                width: isMobile ? '56px' : '64px',
                height: isMobile ? '56px' : '64px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}>
                <Camera style={{ 
                  width: isMobile ? '28px' : '32px', 
                  height: isMobile ? '28px' : '32px',
                  color: '#60a5fa'
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: isMobile ? '18px' : '20px', 
                  fontWeight: '700', 
                  color: '#60a5fa'
                }}>
                  {language === 'fr' ? 'Ajouter une photo' : 'Add photo'}
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '14px' : '15px', 
                  opacity: 0.8, 
                  textAlign: 'center', 
                  color: '#94a3b8',
                  maxWidth: '240px'
                }}>
                  {language === 'fr' ? 'Documentez cette étape avec une photo' : 'Document this step with a photo'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Boutons navigation */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.95)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
              </button>
              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.95)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.8)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
              </button>
            </>
          )}
          
          {/* Indicateurs de position */}
          {totalSlides > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
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
                    width: index === currentPhotoIndex ? '24px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: index === currentPhotoIndex ? 
                      'linear-gradient(135deg, #3b82f6, #6366f1)' : 
                      'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: index === currentPhotoIndex ? 
                      '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Compteur de photos */}
        {photos.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10
          }}>
            {currentPhotoIndex + 1} / {totalSlides}
          </div>
        )}
      </div>
    );
  };

  // Validation globale du permis
  const isPermitValid = () => {
    const hasRecentReading = atmosphericReadings.length > 0 && 
      new Date().getTime() - new Date(atmosphericReadings[atmosphericReadings.length - 1].timestamp).getTime() < 30 * 60 * 1000;
    const lastReadingSafe = atmosphericReadings.length > 0 && 
      atmosphericReadings[atmosphericReadings.length - 1].status === 'safe';
    const hasRescuePlan = permitData.rescue_plan_validated && permitData.rescue_plan_type && permitData.rescue_plan_responsible;
    const hasVentilationSystem = !permitData.ventilation_required || (permitData.ventilation_required && permitData.ventilation_system_validated);
    const hasSupervisorSignature = permitData.supervisor_signature && permitData.supervisor_certified;
    const hasAttendantSignatures = (permitData.attendants || []).length > 0 && 
      (permitData.attendants || []).every((att: any) => att.signature && att.certified);

    return hasRecentReading && lastReadingSafe && hasRescuePlan && hasVentilationSystem &&
           permitData.site_name && permitData.space_description && permitData.work_description &&
           hasSupervisorSignature && hasAttendantSignatures;
  };

  // =================== SECTION 4: FONCTIONS DE RENDU DES SECTIONS ===================
  
  // Rendu section atmosphérique
  const renderAtmosphericSection = () => {
    const currentRegulations = PROVINCIAL_REGULATIONS[selectedProvince];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Shield style={{ width: '20px', height: '20px' }} />
            Limites - {currentRegulations.name}
            <span style={{
              fontSize: isMobile ? '12px' : '14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontWeight: '700'
            }}>
              ⏱️ {currentRegulations.atmospheric_testing.frequency_minutes} min
            </span>
          </h3>
          
          <div style={styles.grid4}>
            {Object.entries(currentRegulations.atmospheric_testing.limits).map(([gas, limits]) => (
              <div key={gas} style={{
                backgroundColor: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid #4b5563',
                transition: 'all 0.2s ease'
              }}>
                <h4 style={{ 
                  fontWeight: '700', 
                  color: 'white', 
                  marginBottom: '12px', 
                  fontSize: isMobile ? '15px' : '17px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {gas === 'oxygen' ? '🫁 O₂' : 
                   gas === 'lel' ? '🔥 LEL' : 
                   gas === 'h2s' ? '☠️ H₂S' : 
                   '💨 CO'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: isMobile ? '13px' : '14px' }}>
                  {gas === 'oxygen' ? (
                    <>
                      <div style={{ color: '#86efac', fontWeight: '600' }}>
                        ✅ {(limits as AtmosphericLimits['oxygen']).min}-{(limits as AtmosphericLimits['oxygen']).max}%
                      </div>
                      <div style={{ color: '#fca5a5', fontWeight: '600' }}>
                        🚨 ≤{(limits as AtmosphericLimits['oxygen']).critical_low}% ou ≥{(limits as AtmosphericLimits['oxygen']).critical_high}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: '#86efac', fontWeight: '600' }}>
                        ✅ ≤{(limits as AtmosphericLimits['lel']).max} {gas === 'lel' ? '%' : 'ppm'}
                      </div>
                      <div style={{ color: '#fca5a5', fontWeight: '600' }}>
                        🚨 ≥{(limits as AtmosphericLimits['lel']).critical} {gas === 'lel' ? '%' : 'ppm'}
                      </div>
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
              gap: isMobile ? '16px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <AlertTriangle style={{ width: '36px', height: '36px', color: '#f87171' }} />
                <div>
                  <h3 style={{ color: '#fecaca', fontWeight: 'bold', fontSize: isMobile ? '18px' : '20px' }}>
                    ⏰ RETEST OBLIGATOIRE
                  </h3>
                  <p style={{ color: '#fca5a5', fontSize: isMobile ? '14px' : '16px' }}>
                    Valeurs critiques détectées - Nouveau test requis
                  </p>
                </div>
              </div>
              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <div style={{ 
                  fontSize: isMobile ? '28px' : '36px', 
                  fontWeight: 'bold', 
                  color: '#f87171',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {formatTime(retestTimer)}
                </div>
                <div style={{ color: '#fca5a5', fontSize: '16px' }}>Temps restant</div>
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
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: '20px', 
            marginTop: '20px' 
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
                  justifyContent: 'center',
                  fontSize: isMobile ? '15px' : '16px'
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                {isMobile ? 'Ajouter' : texts.addManualReading}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <label style={styles.label}>Notes (optionnel)</label>
            <textarea
              placeholder="Observations, conditions particulières..."
              value={manualReading.notes}
              onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <FileText style={{ width: '20px', height: '20px' }} />
            Historique des Mesures ({atmosphericReadings.length})
          </h3>
          
          {atmosphericReadings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '32px 20px' : '48px 32px', 
              color: '#9ca3af',
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
              borderRadius: '12px',
              border: '1px solid #374151'
            }}>
              <Activity style={{ 
                width: isMobile ? '56px' : '72px', 
                height: isMobile ? '56px' : '72px', 
                margin: '0 auto 20px', 
                color: '#4b5563'
              }} />
              <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
                Aucune mesure enregistrée
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
                Effectuez votre première mesure atmosphérique ci-dessus pour commencer la surveillance.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              maxHeight: isMobile ? '400px' : '500px', 
              overflowY: 'auto',
              paddingRight: '8px'
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
                      marginBottom: '12px',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '12px' : '0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          ...styles.statusIndicator,
                          ...(reading.status === 'danger' ? styles.statusDanger :
                             reading.status === 'warning' ? styles.statusWarning :
                             styles.statusSafe)
                        }}></div>
                        <span style={{
                          fontWeight: '700',
                          color: reading.status === 'danger' ? '#fca5a5' :
                                reading.status === 'warning' ? '#fde047' :
                                '#86efac',
                          fontSize: isMobile ? '15px' : '17px'
                        }}>
                          {reading.status === 'danger' ? '🚨 DANGER' :
                           reading.status === 'warning' ? '⚠️ ATTENTION' :
                           '✅ SÉCURITAIRE'}
                        </span>
                      </div>
                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: isMobile ? '13px' : '14px', 
                        textAlign: isMobile ? 'center' : 'right'
                      }}>
                        📅 {new Date(reading.timestamp).toLocaleString('fr-CA')}
                        <br />
                        👤 {reading.taken_by}
                      </div>
                    </div>
                    
                    <div style={styles.grid4}>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>O₂:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          fontSize: '15px',
                          color: validateAtmosphericValue('oxygen', reading.oxygen) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('oxygen', reading.oxygen) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.oxygen}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>LEL:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          fontSize: '15px',
                          color: validateAtmosphericValue('lel', reading.lel) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('lel', reading.lel) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.lel}%
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>H₂S:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          fontSize: '15px',
                          color: validateAtmosphericValue('h2s', reading.h2s) === 'danger' ? '#fca5a5' :
                                validateAtmosphericValue('h2s', reading.h2s) === 'warning' ? '#fde047' :
                                '#86efac'
                        }}>
                          {reading.h2s} ppm
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>CO:</span>
                        <span style={{
                          marginLeft: '8px',
                          fontWeight: '600',
                          fontSize: '15px',
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
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #4b5563',
                        fontSize: '14px',
                        color: '#d1d5db'
                      }}>
                        {reading.temperature && <span>🌡️ {reading.temperature}°C </span>}
                        {reading.humidity && <span>💧 {reading.humidity}% </span>}
                        {reading.notes && <div style={{ marginTop: '6px' }}>📝 {reading.notes}</div>}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Phone style={{ width: '20px', height: '20px' }} />
            {texts.emergencyContacts} - {currentRegulations.name}
          </h3>
          
          <div style={styles.grid2}>
            {currentRegulations.emergency_contacts.map((contact, index) => (
              <div key={index} style={{
                ...styles.readingCard,
                ...(contact.name === '911' ? styles.readingDanger : styles.readingSafe),
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => window.open(`tel:${contact.phone}`, '_self')}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLDivElement).style.transform = 'translateY(0)';
                (e.target as HTMLDivElement).style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '12px' : '0'
                }}>
                  <h4 style={{ 
                    fontWeight: '700', 
                    color: 'white', 
                    fontSize: isMobile ? '17px' : '19px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {contact.name === '911' ? '🚨' : '📞'} {contact.name}
                  </h4>
                  {contact.available_24h && (
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontWeight: '600'
                    }}>24h/7j</span>
                  )}
                </div>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '15px', 
                  marginBottom: '12px', 
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  {contact.role}
                </p>
                <div style={{
                  color: '#60a5fa',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: isMobile ? '17px' : '19px',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: isMobile ? 'center' : 'left',
                  fontWeight: '700',
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  {contact.phone}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '32px',
            padding: isMobile ? '20px' : '24px',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
          }}>
            <h4 style={{
              color: '#fecaca',
              fontWeight: '700',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: isMobile ? '16px' : '18px'
            }}>
              <AlertTriangle style={{ width: '24px', height: '24px' }} />
              🚨 Procédure d'Évacuation d'Urgence
            </h4>
            <ol style={{ 
              color: '#fecaca', 
              fontSize: isMobile ? '14px' : '15px', 
              marginLeft: '20px',
              lineHeight: 1.6
            }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>1. ARRÊT IMMÉDIAT</strong> de tous les travaux
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>2. ÉVACUATION</strong> immédiate de tous les entrants
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>3. APPEL</strong> au 911 et contacts d'urgence
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>4. INTERDICTION</strong> de re-entrée jusqu'à autorisation
              </li>
              <li>
                <strong>5. RAPPORT</strong> d'incident obligatoire
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des onglets
  const renderTabs = () => (
    <div style={{
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingBottom: '8px'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: isMobile ? '4px' : '12px', 
        marginBottom: isMobile ? '12px' : '20px', 
        borderBottom: '1px solid #374151',
        paddingBottom: isMobile ? '8px' : '12px',
        minWidth: isMobile ? '100%' : 'auto',
        overflowX: isMobile ? 'auto' : 'visible',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
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
              padding: isMobile ? '6px 10px' : '12px 20px',
              fontSize: isMobile ? '12px' : '14px',
              minWidth: isMobile ? '50px' : 'auto'
            }}
            title={isMobile ? tab.fullLabel : undefined}
          >
            {isMobile ? tab.label : (
              <>
                {tab.icon}
                {tab.label.split(' ')[1]}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
