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

// =================== DÉTECTION MOBILE ET STYLES ===================
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

// =================== ÉQUIPEMENTS PRÉDÉFINIS ===================
const PREDEFINED_EQUIPMENT = [
  // Détection et Mesure
  { id: 'gas_detector_4', name: '📊 Détecteur multi-gaz (O₂, LEL, H₂S, CO)', required: true, category: 'detection' },
  { id: 'gas_detector_single_o2', name: '🫁 Détecteur oxygène (O₂)', required: false, category: 'detection' },
  { id: 'gas_detector_single_lel', name: '🔥 Détecteur limite inférieure d\'explosivité (LEL)', required: false, category: 'detection' },
  { id: 'gas_detector_h2s', name: '☠️ Détecteur sulfure d\'hydrogène (H₂S)', required: false, category: 'detection' },
  { id: 'gas_detector_co', name: '💨 Détecteur monoxyde de carbone (CO)', required: false, category: 'detection' },
  { id: 'noise_meter', name: '🔊 Sonomètre / Détecteur de bruit', required: false, category: 'detection' },
  { id: 'thermometer', name: '🌡️ Thermomètre infrarouge', required: false, category: 'detection' },
  
  // Protection Individuelle
  { id: 'harness_class_e', name: '🦺 Harnais de sécurité classe E', required: true, category: 'protection' },
  { id: 'helmet', name: '⛑️ Casque de sécurité', required: true, category: 'protection' },
  { id: 'safety_boots', name: '👢 Bottes de sécurité antidérapantes', required: true, category: 'protection' },
  { id: 'gloves_chemical', name: '🧤 Gants résistants aux produits chimiques', required: false, category: 'protection' },
  { id: 'coverall', name: '👕 Combinaison de protection', required: false, category: 'protection' },
  { id: 'eye_protection', name: '🥽 Protection oculaire étanche', required: false, category: 'protection' },
  
  // Sauvetage et Urgence
  { id: 'lifeline_mechanical', name: '⛓️ Ligne de vie et dispositif de récupération mécanique', required: true, category: 'rescue' },
  { id: 'scba', name: '🫁 Appareil respiratoire autonome (ARA)', required: true, category: 'rescue' },
  { id: 'scsr', name: '😷 Appareil de protection respiratoire d\'évacuation', required: false, category: 'rescue' },
  { id: 'first_aid_kit', name: '🏥 Trousse de premiers soins RCR', required: true, category: 'rescue' },
  { id: 'defibrillator', name: '⚡ Défibrillateur externe automatisé (DEA)', required: false, category: 'rescue' },
  { id: 'stretcher', name: '🛏️ Civière de sauvetage', required: false, category: 'rescue' },
  { id: 'tripod', name: '📐 Trépied de sauvetage avec palan', required: false, category: 'rescue' },
  
  // Ventilation et Air
  { id: 'ventilation_forced', name: '💨 Système de ventilation mécanique forcée', required: true, category: 'ventilation' },
  { id: 'blower_exhaust', name: '🌪️ Ventilateur extracteur portable', required: false, category: 'ventilation' },
  { id: 'blower_supply', name: '🌀 Ventilateur de soufflage d\'air frais', required: false, category: 'ventilation' },
  { id: 'air_hose', name: '🔗 Boyau d\'air comprimé', required: false, category: 'ventilation' },
  { id: 'air_purifier', name: '🌬️ Purificateur d\'air portable', required: false, category: 'ventilation' },
  
  // Communication
  { id: 'radio_bidirectional', name: '📻 Équipement communication bidirectionnelle', required: true, category: 'communication' },
  { id: 'intercom', name: '🎤 Système d\'interphone filaire', required: false, category: 'communication' },
  { id: 'emergency_whistle', name: '🔔 Sifflet d\'urgence', required: false, category: 'communication' },
  { id: 'alarm_system', name: '🚨 Système d\'alarme de défaillance', required: false, category: 'communication' },
  
  // Éclairage et Outils
  { id: 'lighting_intrinsic', name: '💡 Éclairage intrinsèquement sécuritaire', required: true, category: 'tools' },
  { id: 'flashlight_explosion_proof', name: '🔦 Lampe de poche antidéflagrante', required: false, category: 'tools' },
  { id: 'tools_non_sparking', name: '🔧 Outils antinéincelles (bronze/laiton)', required: false, category: 'tools' },
  { id: 'grounding_equipment', name: '⚡ Équipement de mise à la terre', required: false, category: 'tools' },
  { id: 'lockout_tagout', name: '🔒 Équipement cadenassage (LOTO)', required: false, category: 'tools' },
  { id: 'barricade_tape', name: '🚧 Ruban de signalisation et barrières', required: false, category: 'tools' },
  { id: 'eye_wash_portable', name: '👁️ Station de rinçage oculaire portable', required: false, category: 'tools' },
  { id: 'emergency_shower', name: '🚿 Douche de sécurité portable', required: false, category: 'tools' }
];

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
    final_authorization: false,
    // Nouvelles propriétés pour le plan de sauvetage
    rescue_plan_type: formData?.permitData?.rescue_plan_type || initialData?.rescue_plan_type || '',
    rescue_plan_responsible: formData?.permitData?.rescue_plan_responsible || initialData?.rescue_plan_responsible || '',
    rescue_team_phone: formData?.permitData?.rescue_team_phone || initialData?.rescue_team_phone || '',
    rescue_response_time: formData?.permitData?.rescue_response_time || initialData?.rescue_response_time || '',
    rescue_equipment: formData?.permitData?.rescue_equipment || initialData?.rescue_equipment || {},
    rescue_training: formData?.permitData?.rescue_training || initialData?.rescue_training || {},
    rescue_steps: formData?.permitData?.rescue_steps || initialData?.rescue_steps || [],
    // Nouvelles propriétés pour la ventilation
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
    // Nouvelles propriétés pour la section personnel
    supervisor_name: formData?.permitData?.supervisor_name || initialData?.supervisor_name || '',
    supervisor_company: formData?.permitData?.supervisor_company || initialData?.supervisor_company || '',
    supervisor_signature_date: formData?.permitData?.supervisor_signature_date || initialData?.supervisor_signature_date || new Date().toISOString().split('T')[0],
    supervisor_signature_time: formData?.permitData?.supervisor_signature_time || initialData?.supervisor_signature_time || new Date().toTimeString().slice(0, 5),
    supervisor_signature: formData?.permitData?.supervisor_signature || initialData?.supervisor_signature || '',
    supervisor_signature_timestamp: formData?.permitData?.supervisor_signature_timestamp || initialData?.supervisor_signature_timestamp || '',
    supervisor_signature_time_precise: formData?.permitData?.supervisor_signature_time_precise || initialData?.supervisor_signature_time_precise || '',
    supervisor_certified: formData?.permitData?.supervisor_certified || initialData?.supervisor_certified || false,
    // Arrays pour les équipes
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

  // États pour les photos - Version optimisée Step1
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

  // =================== GESTION PHOTOS - VERSION STEP1 INTÉGRÉE ===================
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
      
      // Reset to show the new photo
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
        });
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
    return undefined;
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      before: '#059669',
      during: '#d97706', 
      after: '#0891b2',
      equipment: '#7c3aed',
      hazard: '#dc2626',
      documentation: '#6366f1',
      // Nouvelles catégories d'équipements
      detection: '#f59e0b',
      protection: '#10b981',
      rescue: '#ef4444',
      ventilation: '#06b6d4',
      communication: '#8b5cf6',
      tools: '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const getCategoryLabel = (category: string): string => {
    // Labels pour photos
    if (['before', 'during', 'after', 'equipment', 'hazard', 'documentation'].includes(category)) {
      const photoLabels = {
        before: language === 'fr' ? 'Avant intervention' : 'Before work',
        during: language === 'fr' ? 'Pendant intervention' : 'During work', 
        after: language === 'fr' ? 'Après intervention' : 'After work',
        equipment: language === 'fr' ? 'Équipement' : 'Equipment',
        hazard: language === 'fr' ? 'Danger identifié' : 'Identified hazard',
        documentation: language === 'fr' ? 'Documentation' : 'Documentation'
      };
      return photoLabels[category as keyof typeof photoLabels] || category;
    }
    
    // Labels pour équipements
    const equipmentLabels = {
      detection: 'Détection',
      protection: 'Protection',
      rescue: 'Sauvetage',
      ventilation: 'Ventilation',
      communication: 'Communication',
      tools: 'Outils',
      custom: 'Personnalisé'
    };
    return equipmentLabels[category as keyof typeof equipmentLabels] || category;
  };

  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => {
      const newPhotos = prev.filter(photo => photo.id !== photoId);
      updateParentData('capturedPhotos', newPhotos);
      
      // Adjust current index if needed
      if (currentPhotoIndex >= newPhotos.length + 1) {
        setCurrentPhotoIndex(Math.max(0, newPhotos.length));
      }
      return newPhotos;
    });
  };

  // =================== CARROUSEL PHOTOS OPTIMISÉ MOBILE ===================
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

  // Rendu section atmosphérique optimisé mobile
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

  // Rendu section contacts d'urgence optimisé mobile
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

  // Rendu des onglets optimisé mobile
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

  // Rendu section site optimisé mobile
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
                {/* Background pattern */}
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
                  
                  {/* Boutons d'action photos */}
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
                  
                  {/* Catégories de photos */}
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
          
          {/* Section Ventilation à Air Forcé */}
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px',
            border: '2px solid #4b5563',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            marginTop: '20px'
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
              <Wind style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              💨 Ventilation à Air Forcé (Art. 302 RSST)
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              border: '1px solid rgba(107, 114, 128, 0.3)'
            }}>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '15px',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
                fontWeight: '600'
              }}>
                ⚠️ <strong>OBLIGATION RÉGLEMENTAIRE</strong> : L'espace clos doit être ventilé par des moyens mécaniques pour maintenir une atmosphère conforme (O₂: 19,5-23%, LEL ≤10%, contaminants ≤VEMP).
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
                margin: 0,
                fontStyle: 'italic'
              }}>
                🔧 <strong>Système d'alarme obligatoire</strong> : Un système d'avertissement doit informer immédiatement en cas de défaillance des appareils de ventilation.
              </p>
            </div>
            
            {/* Exigence de ventilation */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id="ventilation_required"
                  checked={permitData.ventilation_required || false}
                  onChange={(e) => updatePermitData({ ventilation_required: e.target.checked })}
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label 
                  htmlFor="ventilation_required"
                  style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🌪️ <strong>VENTILATION MÉCANIQUE REQUISE</strong> : La ventilation naturelle est insuffisante pour cet espace clos
                </label>
              </div>
            </div>
            
            {permitData.ventilation_required && (
              <>
                {/* Type de ventilation et débit */}
                <div style={styles.grid2}>
                  <div>
                    <label style={{ ...styles.label, color: '#9ca3af' }}>Type de ventilation mécanique *</label>
                    <select
                      value={permitData.ventilation_type || ''}
                      onChange={(e) => updatePermitData({ ventilation_type: e.target.value })}
                      style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                      required
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="forced_air_supply">💨 Soufflage d'air forcé</option>
                      <option value="extraction_ventilation">🌪️ Ventilation par extraction</option>
                      <option value="combined_system">🔄 Système combiné (soufflage + extraction)</option>
                      <option value="local_extraction">🎯 Aspiration locale à la source</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ ...styles.label, color: '#9ca3af' }}>Débit d'air requis *</label>
                    <select
                      value={permitData.ventilation_flow_rate || ''}
                      onChange={(e) => updatePermitData({ ventilation_flow_rate: e.target.value })}
                      style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                      required
                    >
                      <option value="">Sélectionner le débit</option>
                      <option value="low_flow">📊 Faible (≤500 CFM)</option>
                      <option value="medium_flow">📈 Moyen (500-1500 CFM)</option>
                      <option value="high_flow">📊 Élevé (1500-3000 CFM)</option>
                      <option value="very_high_flow">🚀 Très élevé (≥3000 CFM)</option>
                      <option value="calculated">🧮 Calculé selon volume</option>
                    </select>
                  </div>
                </div>
                
                {/* Validation système de ventilation */}
                <div style={{ 
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid #10b981'
                }}>
                  <input
                    type="checkbox"
                    id="ventilation_system_validated"
                    checked={permitData.ventilation_system_validated || false}
                    onChange={(e) => updatePermitData({ ventilation_system_validated: e.target.checked })}
                    style={{
                      width: '24px',
                      height: '24px',
                      accentColor: '#10b981'
                    }}
                    required={permitData.ventilation_required}
                  />
                  <label 
                    htmlFor="ventilation_system_validated"
                    style={{
                      color: '#86efac',
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    ✅ <strong>VALIDATION VENTILATION</strong> : Je certifie que le système de ventilation mécanique est opérationnel avec alarme de défaillance fonctionnelle. {permitData.ventilation_required && '*'}
                  </label>
                </div>
              </>
            )}
          </div>
          
          {/* Section Plan de Sauvetage */}
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
              <Shield style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
              🚨 Plan de Sauvetage Obligatoire (Art. 309 RSST)
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '20px',
              border: '1px solid rgba(107, 114, 128, 0.3)'
            }}>
              <p style={{ 
                color: '#d1d5db', 
                fontSize: '15px',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
                fontWeight: '600'
              }}>
                ⚠️ <strong>OBLIGATION LÉGALE</strong> : Un plan de sauvetage personnalisé avec personnel et équipements requis doit être disponible sur place pour intervention rapide (réglementation 25 juillet 2023).
              </p>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '14px',
                margin: 0,
                fontStyle: 'italic'
              }}>
                📊 <strong>Statistique critique</strong> : Plus de 60% des victimes d'accidents fatals en espace clos sont des personnes ayant tenté un sauvetage sans formation adéquate.
              </p>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={{ ...styles.label, color: '#fecaca' }}>Type de plan de sauvetage *</label>
                <select
                  value={permitData.rescue_plan_type || ''}
                  onChange={(e) => updatePermitData({ rescue_plan_type: e.target.value })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                  required
                >
                  <option value="">Sélectionner le type de sauvetage</option>
                  <option value="internal_team">Équipe de sauvetage interne</option>
                  <option value="external_specialist">Firme spécialisée externe</option>
                  <option value="fire_department">Service incendie municipal</option>
                  <option value="contractor">Contracteur externe</option>
                </select>
              </div>
              <div>
                <label style={{ ...styles.label, color: '#fecaca' }}>Responsable du plan *</label>
                <input
                  type="text"
                  placeholder="Nom et titre du responsable"
                  value={permitData.rescue_plan_responsible || ''}
                  onChange={(e) => updatePermitData({ rescue_plan_responsible: e.target.value })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                  required
                />
              </div>
            </div>
            
            <div style={styles.grid2}>
              <div>
                <label style={{ ...styles.label, color: '#fecaca' }}>Téléphone d'urgence équipe *</label>
                <input
                  type="tel"
                  placeholder="Ex: 1-800-XXX-XXXX"
                  value={permitData.rescue_team_phone || ''}
                  onChange={(e) => updatePermitData({ rescue_team_phone: e.target.value })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                  required
                />
              </div>
              <div>
                <label style={{ ...styles.label, color: '#fecaca' }}>Temps de réponse maximum</label>
                <select
                  value={permitData.rescue_response_time || ''}
                  onChange={(e) => updatePermitData({ rescue_response_time: e.target.value })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                >
                  <option value="">Sélectionner</option>
                  <option value="immediate">Immédiat (sur place)</option>
                  <option value="2_minutes">2 minutes</option>
                  <option value="5_minutes">5 minutes</option>
                  <option value="10_minutes">10 minutes</option>
                  <option value="15_minutes">15 minutes</option>
                </select>
              </div>
            </div>
            
            {/* Équipements de sauvetage obligatoires */}
            <div style={{ marginTop: '20px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#d1d5db',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Wrench style={{ width: '20px', height: '20px' }} />
                Équipements de Sauvetage Requis
              </h5>
              
              <div style={styles.grid2}>
                {[
                  { id: 'harness_class_e', label: '🦺 Harnais classe E et ligne de vie', required: true },
                  { id: 'mechanical_recovery', label: '⛓️ Dispositif de récupération mécanique', required: true },
                  { id: 'scba_equipment', label: '🫁 Appareil respiratoire autonome (ARA)', required: true },
                  { id: 'first_aid_kit', label: '🏥 Trousse premiers soins et RCR', required: true },
                  { id: 'atmospheric_monitor', label: '📊 Détecteur multi-gaz portable', required: true },
                  { id: 'communication_device', label: '📻 Équipement communication bidirectionnel', required: true },
                  { id: 'ventilation_equipment', label: '💨 Équipement de ventilation d\'urgence', required: false },
                  { id: 'lighting_equipment', label: '💡 Éclairage d\'urgence étanche', required: false }
                ].map((equipment, index) => (
                  <div key={equipment.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(107, 114, 128, 0.2)'
                  }}>
                    <input
                      type="checkbox"
                      id={equipment.id}
                      checked={permitData.rescue_equipment?.[equipment.id] || false}
                      onChange={(e) => updatePermitData({ 
                        rescue_equipment: { 
                          ...permitData.rescue_equipment, 
                          [equipment.id]: e.target.checked 
                        }
                      })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#10b981'
                      }}
                    />
                    <label 
                      htmlFor={equipment.id}
                      style={{
                        color: equipment.required ? '#d1d5db' : '#9ca3af',
                        fontSize: '14px',
                        fontWeight: equipment.required ? '600' : '500',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {equipment.label}
                      {equipment.required && <span style={{ color: '#f87171' }}> *</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Procédures de sauvetage avec système d'étapes dynamiques */}
            <div style={{ marginTop: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <label style={{ ...styles.label, color: '#9ca3af', margin: 0 }}>
                  Procédures détaillées de sauvetage *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentSteps = permitData.rescue_steps || [];
                    const newStep = {
                      id: Date.now(),
                      step: currentSteps.length + 1,
                      description: ''
                    };
                    updatePermitData({ 
                      rescue_steps: [...currentSteps, newStep]
                    });
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: 'auto',
                    padding: '8px 12px',
                    fontSize: '14px',
                    minHeight: 'auto'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Ajouter étape
                </button>
              </div>
              
              {/* Affichage des étapes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(permitData.rescue_steps || []).length === 0 ? (
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    border: '2px dashed #6b7280',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
                      Aucune étape définie. Cliquez sur "Ajouter étape" pour commencer.
                    </p>
                  </div>
                ) : (
                  (permitData.rescue_steps || []).map((step: any, index: number) => (
                    <div key={step.id} style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'flex-start',
                      gap: isMobile ? '12px' : '12px',
                      padding: isMobile ? '16px' : '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      border: '1px solid rgba(107, 114, 128, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                      {/* En-tête avec numéro et bouton supprimer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        ...(isMobile ? { width: '100%' } : { flexDirection: 'column' })
                      }}>
                        <div style={{
                          minWidth: isMobile ? '40px' : '32px',
                          height: isMobile ? '40px' : '32px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: isMobile ? '16px' : '14px',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                          ...(isMobile ? {} : { marginBottom: '8px' })
                        }}>
                          {step.step}
                        </div>
                        
                        {isMobile && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              color: '#9ca3af',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              Étape {step.step}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSteps = (permitData.rescue_steps || [])
                                  .filter((s: any) => s.id !== step.id)
                                  .map((s: any, idx: number) => ({ ...s, step: idx + 1 }));
                                updatePermitData({ rescue_steps: updatedSteps });
                              }}
                              style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '40px',
                                minHeight: '40px',
                                color: 'white',
                                transition: 'all 0.2s ease'
                              }}
                              title="Supprimer cette étape"
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(220, 38, 38, 1)';
                                (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
                                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                              }}
                            >
                              <Trash2 style={{ width: '18px', height: '18px' }} />
                            </button>
                          </div>
                        )}
                        
                        {!isMobile && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSteps = (permitData.rescue_steps || [])
                                .filter((s: any) => s.id !== step.id)
                                .map((s: any, idx: number) => ({ ...s, step: idx + 1 }));
                              updatePermitData({ rescue_steps: updatedSteps });
                            }}
                            style={{
                              backgroundColor: 'rgba(220, 38, 38, 0.8)',
                              border: '1px solid #ef4444',
                              borderRadius: '6px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '32px',
                              minHeight: '32px',
                              color: 'white'
                            }}
                            title="Supprimer cette étape"
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                      
                      {/* Zone de texte optimisée */}
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {isMobile && (
                          <label style={{
                            color: '#9ca3af',
                            fontSize: '13px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Description de l'action
                          </label>
                        )}
                        <textarea
                          placeholder={isMobile 
                            ? `Décrire l'action à effectuer pour l'étape ${step.step}...` 
                            : `Étape ${step.step}: Décrire l'action à effectuer...`
                          }
                          value={step.description}
                          onChange={(e) => {
                            const updatedSteps = (permitData.rescue_steps || []).map((s: any) =>
                              s.id === step.id ? { ...s, description: e.target.value } : s
                            );
                            updatePermitData({ rescue_steps: updatedSteps });
                          }}
                          style={{
                            ...styles.input,
                            height: isMobile ? '80px' : '60px',
                            resize: 'vertical',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid #6b7280',
                            fontSize: isMobile ? '16px' : '14px',
                            lineHeight: '1.5',
                            padding: isMobile ? '12px' : '10px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => {
                            (e.target as HTMLTextAreaElement).style.borderColor = '#3b82f6';
                            (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            (e.target as HTMLTextAreaElement).style.borderColor = '#6b7280';
                            (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                          }}
                        />
                        {/* Compteur de caractères pour mobile */}
                        {isMobile && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            <span>
                              {step.description ? `${step.description.length} caractères` : 'Aucun texte'}
                            </span>
                            {step.description && step.description.length < 20 && (
                              <span style={{ color: '#f59e0b' }}>
                                ⚠️ Description courte
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Formation équipe de sauvetage */}
            <div style={{ marginTop: '20px' }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#d1d5db',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users style={{ width: '20px', height: '20px' }} />
                Formation Équipe de Sauvetage
              </h5>
              
              <div style={styles.grid2}>
                {[
                  { id: 'confined_space_rescue', label: '🚨 Sauvetage en espace clos', required: true },
                  { id: 'first_aid_cpr', label: '🏥 Premiers soins et RCR', required: true },
                  { id: 'respiratory_protection', label: '🫁 Protection respiratoire', required: true },
                  { id: 'vertical_rescue', label: '🧗 Sauvetage vertical', required: false },
                  { id: 'hazmat_awareness', label: '☢️ Sensibilisation matières dangereuses', required: false },
                  { id: 'fire_safety', label: '🔥 Sécurité incendie', required: false }
                ].map((training, index) => (
                  <div key={training.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(107, 114, 128, 0.2)'
                  }}>
                    <input
                      type="checkbox"
                      id={training.id}
                      checked={permitData.rescue_training?.[training.id] || false}
                      onChange={(e) => updatePermitData({ 
                        rescue_training: { 
                          ...permitData.rescue_training, 
                          [training.id]: e.target.checked 
                        }
                      })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#10b981'
                      }}
                    />
                    <label 
                      htmlFor={training.id}
                      style={{
                        color: training.required ? '#93c5fd' : '#d1d5db',
                        fontSize: '14px',
                        fontWeight: training.required ? '600' : '500',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {training.label}
                      {training.required && <span style={{ color: '#60a5fa' }}> *</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Test du plan de sauvetage */}
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '2px dashed #fca5a5'
            }}>
              <h5 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#d1d5db',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock style={{ width: '20px', height: '20px' }} />
                📋 Test et Validation du Plan
              </h5>
              
              <div style={styles.grid2}>
                <div>
                  <label style={{ ...styles.label, color: '#9ca3af' }}>Date dernier exercice</label>
                  <input
                    type="date"
                    value={permitData.last_drill_date || ''}
                    onChange={(e) => updatePermitData({ last_drill_date: e.target.value })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, color: '#9ca3af' }}>Résultats test</label>
                  <select
                    value={permitData.drill_results || ''}
                    onChange={(e) => updatePermitData({ drill_results: e.target.value })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
                  >
                    <option value="">Sélectionner</option>
                    <option value="successful">✅ Réussi - Plan efficace</option>
                    <option value="needs_improvement">⚠️ À améliorer</option>
                    <option value="failed">❌ Échec - Révision requise</option>
                    <option value="not_tested">🔄 Pas encore testé</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ ...styles.label, color: '#9ca3af' }}>Notes sur l'efficacité du plan</label>
                <textarea
                  placeholder="Observations des exercices, améliorations identifiées, temps de réponse mesuré..."
                  value={permitData.drill_notes || ''}
                  onChange={(e) => updatePermitData({ drill_notes: e.target.value })}
                  style={{ 
                    ...styles.input, 
                    height: '80px', 
                    resize: 'vertical',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid #6b7280'
                  }}
                />
              </div>
            </div>
            
            {/* Validation finale */}
            <div style={{ 
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              border: '1px solid #10b981'
            }}>
              <input
                type="checkbox"
                id="rescue_plan_validated"
                checked={permitData.rescue_plan_validated || false}
                onChange={(e) => updatePermitData({ rescue_plan_validated: e.target.checked })}
                style={{
                  width: '24px',
                  height: '24px',
                  accentColor: '#10b981'
                }}
                required
              />
              <label 
                htmlFor="rescue_plan_validated"
                style={{
                  color: '#86efac',
                  fontSize: isMobile ? '15px' : '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                ✅ <strong>CONFIRMATION</strong> : Je certifie que le plan de sauvetage est en place, l'équipe est formée et les équipements sont disponibles sur site pour intervention immédiate. *
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        
        {/* Boutons d'action optimisés mobile */}
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
        {activeTab === 'personnel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
            {/* Section Superviseur */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <UserCheck style={{ width: '20px', height: '20px' }} />
                👨‍💼 Superviseur d'Entrée (Obligatoire)
              </h3>
              
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: '20px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '15px',
                  lineHeight: 1.6,
                  margin: '0 0 12px 0',
                  fontWeight: '600'
                }}>
                  ⚠️ <strong>OBLIGATION RÉGLEMENTAIRE</strong> : Le superviseur d'entrée doit avoir les compétences et l'autorité pour contrôler l'accès à l'espace clos et ordonner l'évacuation (Art. 308 RSST).
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  🎓 <strong>Formation requise</strong> : Personne qualifiée selon CSA Z1006 avec formation supervision espace clos, premiers soins niveau 2, RCR.
                </p>
              </div>
              
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
              
              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Date de signature *</label>
                  <input
                    type="date"
                    value={permitData.supervisor_signature_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updatePermitData({ supervisor_signature_date: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>Heure de signature *</label>
                  <input
                    type="time"
                    value={permitData.supervisor_signature_time || new Date().toTimeString().slice(0, 5)}
                    onChange={(e) => updatePermitData({ supervisor_signature_time: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              
              {/* Signature électronique superviseur */}
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
                          <strong>Je certifie par la présente que :</strong>
                          <br />• J'ai pris connaissance de tous les risques et dangers identifiés dans cet espace clos
                          <br />• Je possède les qualifications, l'autorité et la formation requises pour superviser cette entrée
                          <br />• Tous les contrôles de sécurité ont été vérifiés et sont conformes aux réglementations
                          <br />• J'autorise l'entrée dans cet espace clos sous les conditions spécifiées dans ce permis
                          <br />• Je m'engage à maintenir la supervision et à ordonner l'évacuation si nécessaire
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
                              supervisor_signature_time_precise: now.toLocaleString('fr-CA', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short'
                              })
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
                        {permitData.supervisor_certified ? 'Signer Électroniquement' : 'Certification Requise Avant Signature'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        border: '2px solid #10b981',
                        marginBottom: '16px'
                      }}>
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
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          ✅ SUPERVISEUR CERTIFIÉ ET AUTORISÉ
                        </div>
                        <div style={{ 
                          color: '#6ee7b7', 
                          fontSize: '14px',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          📅 Signé le {permitData.supervisor_signature_time_precise}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir annuler cette signature? Cette action est irréversible.')) {
                            updatePermitData({ 
                              supervisor_signature: '',
                              supervisor_signature_timestamp: '',
                              supervisor_signature_time_precise: '',
                              supervisor_certified: false
                            });
                          }
                        }}
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          width: 'auto',
                          padding: '8px 16px',
                          fontSize: '14px',
                          minHeight: 'auto'
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                        Annuler Signature
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Surveillants d'Espace Clos */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <Eye style={{ width: '20px', height: '20px' }} />
                👁️ Surveillants d'Espace Clos
                <button
                  onClick={() => {
                    const newAttendant = {
                      id: `attendant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      name: '',
                      company: '',
                      signature_date: new Date().toISOString().split('T')[0],
                      signature_time: new Date().toTimeString().slice(0, 5),
                      signature: '',
                      signature_timestamp: '',
                      training_valid: false,
                      certification_expiry: '',
                      training_certificates: []
                    };
                    const currentAttendants = permitData.attendants || [];
                    updatePermitData({ attendants: [...currentAttendants, newAttendant] });
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: 'auto',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    fontSize: '14px',
                    minHeight: 'auto',
                    marginLeft: 'auto'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Ajouter Surveillant
                </button>
              </h3>
              
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: '20px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '15px',
                  lineHeight: 1.6,
                  margin: '0 0 12px 0',
                  fontWeight: '600'
                }}>
                  👁️ <strong>RÔLE CRITIQUE</strong> : Surveillance continue, communication bidirectionnelle, autorité d'évacuation immédiate, ne doit jamais quitter son poste.
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  📋 <strong>Minimum requis</strong> : 1 surveillant obligatoire, certains provinces exigent 1 surveillant + 1 assistant (NB: 3 personnes minimum).
                </p>
              </div>
              
              {(permitData.attendants || []).length === 0 ? (
                <div style={{
                  padding: isMobile ? '40px 20px' : '56px 32px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderRadius: '12px',
                  border: '2px dashed #6b7280'
                }}>
                  <Eye style={{ 
                    width: isMobile ? '56px' : '72px', 
                    height: isMobile ? '56px' : '72px', 
                    margin: '0 auto 20px', 
                    color: '#6b7280'
                  }} />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: isMobile ? '18px' : '20px', 
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    Aucun surveillant assigné
                  </p>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '15px',
                    lineHeight: 1.5,
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    Au moins un surveillant certifié est obligatoire selon les réglementations canadiennes.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(permitData.attendants || []).map((attendant: any, index: number) => (
                    <div key={attendant.id} style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      border: '1px solid rgba(107, 114, 128, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                      }}>
                        <h4 style={{ 
                          color: '#d1d5db', 
                          fontSize: isMobile ? '16px' : '18px', 
                          fontWeight: '700',
                          margin: 0
                        }}>
                          👁️ Surveillant #{index + 1}
                        </h4>
                        <button
                          onClick={() => {
                            const updatedAttendants = (permitData.attendants || []).filter((a: any) => a.id !== attendant.id);
                            updatePermitData({ attendants: updatedAttendants });
                          }}
                          style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.8)',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            minHeight: '32px',
                            color: 'white'
                          }}
                          title="Supprimer ce surveillant"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                      
                      <div style={styles.grid2}>
                        <div>
                          <label style={styles.label}>Nom complet *</label>
                          <input
                            type="text"
                            placeholder="Ex: Marie Dubois"
                            value={attendant.name}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, name: e.target.value } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                        <div>
                          <label style={styles.label}>Compagnie/Organisation *</label>
                          <input
                            type="text"
                            placeholder="Ex: Sécurité XYZ Ltée"
                            value={attendant.company}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, company: e.target.value } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                      </div>
                      
                      <div style={styles.grid2}>
                        <div>
                          <label style={styles.label}>Date de signature *</label>
                          <input
                            type="date"
                            value={attendant.signature_date}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, signature_date: e.target.value } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                        <div>
                          <label style={styles.label}>Heure de signature *</label>
                          <input
                            type="time"
                            value={attendant.signature_time}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, signature_time: e.target.value } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Formation et certification */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: attendant.training_valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          borderRadius: '8px',
                          border: `1px solid ${attendant.training_valid ? '#10b981' : '#f59e0b'}`
                        }}>
                          <input
                            type="checkbox"
                            id={`training_${attendant.id}`}
                            checked={attendant.training_valid || false}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, training_valid: e.target.checked } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: '#10b981'
                            }}
                          />
                          <label 
                            htmlFor={`training_${attendant.id}`}
                            style={{
                              color: attendant.training_valid ? '#86efac' : '#fde047',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              flex: 1
                            }}
                          >
                            🎓 <strong>FORMATION À JOUR</strong> : Surveillant espace clos certifié (CSA Z1006), premiers soins, RCR *
                          </label>
                        </div>
                        
                        <div style={{ marginTop: '12px' }}>
                          <label style={styles.label}>Expiration certification</label>
                          <input
                            type="date"
                            value={attendant.certification_expiry || ''}
                            onChange={(e) => {
                              const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                a.id === attendant.id ? { ...a, certification_expiry: e.target.value } : a
                              );
                              updatePermitData({ attendants: updatedAttendants });
                            }}
                            style={styles.input}
                          />
                        </div>
                      </div>
                      
                      {/* Signature électronique */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>Certification et Signature Électronique *</label>
                        <div style={{
                          border: '2px solid #059669',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: 'rgba(5, 150, 105, 0.05)'
                        }}>
                          {!attendant.signature ? (
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '6px'
                              }}>
                                <input
                                  type="checkbox"
                                  id={`attendant_cert_${attendant.id}`}
                                  checked={attendant.certified || false}
                                  onChange={(e) => {
                                    const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                      a.id === attendant.id ? { ...a, certified: e.target.checked } : a
                                    );
                                    updatePermitData({ attendants: updatedAttendants });
                                  }}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    marginTop: '2px',
                                    accentColor: '#059669'
                                  }}
                                />
                                <label 
                                  htmlFor={`attendant_cert_${attendant.id}`}
                                  style={{
                                    color: '#d1d5db',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                    cursor: 'pointer',
                                    flex: 1
                                  }}
                                >
                                  <strong>Je certifie :</strong> Posséder la formation surveillant espace clos, maintenir la surveillance continue, 
                                  utiliser la communication bidirectionnelle, et ordonner l'évacuation si nécessaire.
                                </label>
                              </div>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!attendant.certified) {
                                    alert('⚠️ Vous devez d\'abord cocher la case de certification.');
                                    return;
                                  }
                                  const signature = prompt('Veuillez taper votre nom complet pour signer:');
                                  if (signature && signature.trim()) {
                                    const now = new Date();
                                    const updatedAttendants = (permitData.attendants || []).map((a: any) =>
                                      a.id === attendant.id ? { 
                                        ...a, 
                                        signature: signature.trim(),
                                        signature_timestamp: now.toISOString(),
                                        signature_time_precise: now.toLocaleString('fr-CA', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                          timeZoneName: 'short'
                                        })
                                      } : a
                                    );
                                    updatePermitData({ attendants: updatedAttendants });
                                  }
                                }}
                                disabled={!attendant.certified}
                                style={{
                                  ...styles.button,
                                  ...(attendant.certified ? styles.buttonSuccess : styles.buttonSecondary),
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  opacity: attendant.certified ? 1 : 0.5,
                                  cursor: attendant.certified ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <PenTool style={{ width: '16px', height: '16px' }} />
                                {attendant.certified ? 'Signer' : 'Certification Requise'}
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center' }}>
                              <CheckCircle style={{ 
                                width: '32px', 
                                height: '32px', 
                                color: '#10b981', 
                                margin: '0 auto 8px'
                              }} />
                              <div style={{ 
                                fontSize: '18px', 
                                fontFamily: 'cursive', 
                                color: '#10b981', 
                                marginBottom: '4px',
                                fontWeight: '600'
                              }}>
                                {attendant.signature}
                              </div>
                              <div style={{ 
                                color: '#86efac', 
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '4px'
                              }}>
                                ✅ SURVEILLANT CERTIFIÉ
                              </div>
                              <div style={{ 
                                color: '#6ee7b7', 
                                fontSize: '11px',
                                fontFamily: 'JetBrains Mono, monospace'
                              }}>
                                {attendant.signature_time_precise}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section Entrants */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <LogIn style={{ width: '20px', height: '20px' }} />
                👷 Personnel Entrant
                <button
                  onClick={() => {
                    const newEntrant = {
                      id: `entrant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      name: '',
                      company: '',
                      signature_date: new Date().toISOString().split('T')[0],
                      signature_time: new Date().toTimeString().slice(0, 5),
                      signature: '',
                      signature_timestamp: '',
                      entry_time: '',
                      exit_time: '',
                      status: 'outside', // 'inside' or 'outside'
                      training_valid: false,
                      certification_expiry: ''
                    };
                    const currentEntrants = permitData.entrants || [];
                    updatePermitData({ entrants: [...currentEntrants, newEntrant] });
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    width: 'auto',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    fontSize: '14px',
                    minHeight: 'auto',
                    marginLeft: 'auto'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Ajouter Entrant
                </button>
              </h3>
              
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: '20px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '15px',
                  lineHeight: 1.6,
                  margin: '0 0 12px 0',
                  fontWeight: '600'
                }}>
                  👷 <strong>RESTRICTIONS</strong> : Âge minimum 18 ans, formation obligatoire, harnais de sécurité classe E, communication bidirectionnelle.
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  ⏱️ <strong>Suivi temporel</strong> : Horodatage automatique entrée/sortie, durée maximale selon province (généralement 8h).
                </p>
              </div>
              
              {(permitData.entrants || []).length === 0 ? (
                <div style={{
                  padding: isMobile ? '40px 20px' : '56px 32px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderRadius: '12px',
                  border: '2px dashed #6b7280'
                }}>
                  <LogIn style={{ 
                    width: isMobile ? '56px' : '72px', 
                    height: isMobile ? '56px' : '72px', 
                    margin: '0 auto 20px', 
                    color: '#6b7280'
                  }} />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: isMobile ? '18px' : '20px', 
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    Aucun entrant enregistré
                  </p>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '15px',
                    lineHeight: 1.5,
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    Ajoutez le personnel autorisé à entrer dans l'espace clos.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(permitData.entrants || []).map((entrant: any, index: number) => (
                    <div key={entrant.id} style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      border: `2px solid ${entrant.status === 'inside' ? '#ef4444' : '#10b981'}`,
                      boxShadow: entrant.status === 'inside' ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '12px' : '0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h4 style={{ 
                            color: '#d1d5db', 
                            fontSize: isMobile ? '16px' : '18px', 
                            fontWeight: '700',
                            margin: 0
                          }}>
                            👷 Entrant #{index + 1}
                          </h4>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: entrant.status === 'inside' ? '#ef4444' : '#10b981',
                            color: 'white',
                            animation: entrant.status === 'inside' ? 'pulse 2s infinite' : 'none'
                          }}>
                            {entrant.status === 'inside' ? '🔴 À L\'INTÉRIEUR' : '🟢 À L\'EXTÉRIEUR'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const updatedEntrants = (permitData.entrants || []).filter((e: any) => e.id !== entrant.id);
                            updatePermitData({ entrants: updatedEntrants });
                          }}
                          style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.8)',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            minHeight: '32px',
                            color: 'white'
                          }}
                          title="Supprimer cet entrant"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                      
                      <div style={styles.grid2}>
                        <div>
                          <label style={styles.label}>Nom complet *</label>
                          <input
                            type="text"
                            placeholder="Ex: Pierre Lavoie"
                            value={entrant.name}
                            onChange={(e) => {
                              const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                ent.id === entrant.id ? { ...ent, name: e.target.value } : ent
                              );
                              updatePermitData({ entrants: updatedEntrants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                        <div>
                          <label style={styles.label}>Compagnie/Organisation *</label>
                          <input
                            type="text"
                            placeholder="Ex: Construction DEF Inc."
                            value={entrant.company}
                            onChange={(e) => {
                              const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                ent.id === entrant.id ? { ...ent, company: e.target.value } : ent
                              );
                              updatePermitData({ entrants: updatedEntrants });
                            }}
                            style={styles.input}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Contrôles d'entrée/sortie */}
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        border: '1px solid rgba(107, 114, 128, 0.3)'
                      }}>
                        <h5 style={{
                          color: '#d1d5db',
                          fontSize: '16px',
                          fontWeight: '700',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Timer style={{ width: '18px', height: '18px' }} />
                          Contrôle Entrée/Sortie
                        </h5>
                        
                        <div style={styles.grid2}>
                          <button
                            onClick={() => {
                              const now = new Date();
                              const timeString = now.toTimeString().slice(0, 5);
                              const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                ent.id === entrant.id ? { 
                                  ...ent, 
                                  entry_time: timeString,
                                  status: 'inside'
                                } : ent
                              );
                              updatePermitData({ entrants: updatedEntrants });
                            }}
                            style={{
                              ...styles.button,
                              backgroundColor: entrant.status === 'inside' ? '#6b7280' : '#059669',
                              color: 'white',
                              padding: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: entrant.status === 'inside' ? 'not-allowed' : 'pointer'
                            }}
                            disabled={entrant.status === 'inside'}
                          >
                            <LogIn style={{ width: '16px', height: '16px' }} />
                            {entrant.entry_time ? `Entré: ${entrant.entry_time}` : 'Marquer Entrée'}
                          </button>
                          
                          <button
                            onClick={() => {
                              const now = new Date();
                              const timeString = now.toTimeString().slice(0, 5);
                              const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                ent.id === entrant.id ? { 
                                  ...ent, 
                                  exit_time: timeString,
                                  status: 'outside'
                                } : ent
                              );
                              updatePermitData({ entrants: updatedEntrants });
                            }}
                            style={{
                              ...styles.button,
                              backgroundColor: entrant.status === 'outside' ? '#6b7280' : '#dc2626',
                              color: 'white',
                              padding: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: entrant.status === 'outside' ? 'not-allowed' : 'pointer'
                            }}
                            disabled={entrant.status === 'outside'}
                          >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            {entrant.exit_time ? `Sorti: ${entrant.exit_time}` : 'Marquer Sortie'}
                          </button>
                        </div>
                        
                        {entrant.entry_time && entrant.exit_time && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            border: '1px solid #3b82f6',
                            textAlign: 'center'
                          }}>
                            <span style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '600' }}>
                              ⏱️ Durée totale: {(() => {
                                const entry = new Date(`2000-01-01T${entrant.entry_time}:00`);
                                const exit = new Date(`2000-01-01T${entrant.exit_time}:00`);
                                const diffMs = exit.getTime() - entry.getTime();
                                const diffMins = Math.floor(diffMs / (1000 * 60));
                                const hours = Math.floor(diffMins / 60);
                                const minutes = diffMins % 60;
                                return `${hours}h ${minutes}min`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Formation et certification entrant */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: entrant.training_valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          borderRadius: '8px',
                          border: `1px solid ${entrant.training_valid ? '#10b981' : '#f59e0b'}`
                        }}>
                          <input
                            type="checkbox"
                            id={`entrant_training_${entrant.id}`}
                            checked={entrant.training_valid || false}
                            onChange={(e) => {
                              const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                ent.id === entrant.id ? { ...ent, training_valid: e.target.checked } : ent
                              );
                              updatePermitData({ entrants: updatedEntrants });
                            }}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: '#10b981'
                            }}
                          />
                          <label 
                            htmlFor={`entrant_training_${entrant.id}`}
                            style={{
                              color: entrant.training_valid ? '#86efac' : '#fde047',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              flex: 1
                            }}
                          >
                            🎓 <strong>FORMATION À JOUR</strong> : Entrant espace clos certifié, EPI, communication d'urgence *
                          </label>
                        </div>
                      </div>
                      
                      {/* Signature électronique entrant */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={styles.label}>Certification et Signature Électronique *</label>
                        <div style={{
                          border: '2px solid #3b82f6',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: 'rgba(59, 130, 246, 0.05)'
                        }}>
                          {!entrant.signature ? (
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '6px'
                              }}>
                                <input
                                  type="checkbox"
                                  id={`entrant_cert_${entrant.id}`}
                                  checked={entrant.certified || false}
                                  onChange={(e) => {
                                    const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                      ent.id === entrant.id ? { ...ent, certified: e.target.checked } : ent
                                    );
                                    updatePermitData({ entrants: updatedEntrants });
                                  }}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    marginTop: '2px',
                                    accentColor: '#3b82f6'
                                  }}
                                />
                                <label 
                                  htmlFor={`entrant_cert_${entrant.id}`}
                                  style={{
                                    color: '#d1d5db',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                    cursor: 'pointer',
                                    flex: 1
                                  }}
                                >
                                  <strong>Je certifie :</strong> Avoir reçu la formation entrant espace clos, porter l'équipement de protection requis, 
                                  maintenir la communication avec le surveillant, et évacuer immédiatement si ordonné.
                                </label>
                              </div>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!entrant.certified) {
                                    alert('⚠️ Vous devez d\'abord cocher la case de certification.');
                                    return;
                                  }
                                  const signature = prompt('Veuillez taper votre nom complet pour signer:');
                                  if (signature && signature.trim()) {
                                    const now = new Date();
                                    const updatedEntrants = (permitData.entrants || []).map((ent: any) =>
                                      ent.id === entrant.id ? { 
                                        ...ent, 
                                        signature: signature.trim(),
                                        signature_timestamp: now.toISOString(),
                                        signature_time_precise: now.toLocaleString('fr-CA', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                          timeZoneName: 'short'
                                        })
                                      } : ent
                                    );
                                    updatePermitData({ entrants: updatedEntrants });
                                  }
                                }}
                                disabled={!entrant.certified}
                                style={{
                                  ...styles.button,
                                  ...(entrant.certified ? styles.buttonPrimary : styles.buttonSecondary),
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  opacity: entrant.certified ? 1 : 0.5,
                                  cursor: entrant.certified ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <PenTool style={{ width: '16px', height: '16px' }} />
                                {entrant.certified ? 'Signer' : 'Certification Requise'}
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center' }}>
                              <CheckCircle style={{ 
                                width: '32px', 
                                height: '32px', 
                                color: '#3b82f6', 
                                margin: '0 auto 8px'
                              }} />
                              <div style={{ 
                                fontSize: '18px', 
                                fontFamily: 'cursive', 
                                color: '#3b82f6', 
                                marginBottom: '4px',
                                fontWeight: '600'
                              }}>
                                {entrant.signature}
                              </div>
                              <div style={{ 
                                color: '#93c5fd', 
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '4px'
                              }}>
                                ✅ ENTRANT CERTIFIÉ
                              </div>
                              <div style={{ 
                                color: '#bfdbfe', 
                                fontSize: '11px',
                                fontFamily: 'JetBrains Mono, monospace'
                              }}>
                                {entrant.signature_time_precise}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section Équipements - Check-list */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <Shield style={{ width: '20px', height: '20px' }} />
                🛠️ Contrôle Équipements Obligatoires
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedEquipment = PREDEFINED_EQUIPMENT.find(eq => eq.id === e.target.value);
                        if (selectedEquipment) {
                          const newEquipment = {
                            id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: selectedEquipment.name,
                            required: selectedEquipment.required,
                            checked_in: false,
                            checked_out: false,
                            condition: 'good',
                            serial_number: '',
                            last_inspection: '',
                            category: selectedEquipment.category
                          };
                          const currentEquipments = permitData.equipment_checklist || [];
                          updatePermitData({ equipment_checklist: [...currentEquipments, newEquipment] });
                        }
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    style={{
                      ...styles.input,
                      width: 'auto',
                      minWidth: isMobile ? '200px' : '250px',
                      fontSize: '14px',
                      padding: isMobile ? '8px 10px' : '10px 12px'
                    }}
                  >
                    <option value="">+ Ajouter équipement prédéfini</option>
                    <optgroup label="🔍 Détection et Mesure">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'detection').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🦺 Protection Individuelle">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'protection').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🚨 Sauvetage et Urgence">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'rescue').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💨 Ventilation et Air">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'ventilation').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📻 Communication">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'communication').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💡 Éclairage et Outils">
                      {PREDEFINED_EQUIPMENT.filter(eq => eq.category === 'tools').map(equipment => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <button
                    onClick={() => {
                      const newEquipment = {
                        id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: '',
                        required: false,
                        checked_in: false,
                        checked_out: false,
                        condition: 'good',
                        serial_number: '',
                        last_inspection: '',
                        category: 'custom'
                      };
                      const currentEquipments = permitData.equipment_checklist || [];
                      updatePermitData({ equipment_checklist: [...currentEquipments, newEquipment] });
                    }}
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      width: 'auto',
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      fontSize: '14px',
                      minHeight: 'auto'
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    {isMobile ? 'Custom' : 'Personnalisé'}
                  </button>
                </div>
              </h3>
              
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: '20px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <p style={{ 
                  color: '#d1d5db', 
                  fontSize: '15px',
                  lineHeight: 1.6,
                  margin: '0 0 12px 0',
                  fontWeight: '600'
                }}>
                  🛠️ <strong>ÉQUIPEMENTS OBLIGATOIRES</strong> : Détecteur 4 gaz, harnais classe E, ligne de vie, ARA, communication bidirectionnelle.
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  ✅ <strong>Contrôle d'état</strong> : Inspection avant/après utilisation, certification à jour, traçabilité des équipements.
                </p>
              </div>
              
              {/* Équipements ajoutés par l'utilisateur */}
              {(permitData.equipment_checklist || []).length === 0 ? (
                <div style={{
                  padding: isMobile ? '40px 20px' : '56px 32px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  borderRadius: '12px',
                  border: '2px dashed #6b7280'
                }}>
                  <Shield style={{ 
                    width: isMobile ? '56px' : '72px', 
                    height: isMobile ? '56px' : '72px', 
                    margin: '0 auto 20px', 
                    color: '#6b7280'
                  }} />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: isMobile ? '18px' : '20px', 
                    marginBottom: '12px',
                    fontWeight: '600'
                  }}>
                    Aucun équipement ajouté
                  </p>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '15px',
                    lineHeight: 1.5,
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    Utilisez la liste déroulante ci-dessus pour ajouter les équipements nécessaires selon vos besoins.
                  </p>
                </div>
              ) : (
                      <div key={equipment.id} style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        padding: '16px',
                        border: `1px solid ${equipment.category === 'custom' ? '#6b7280' : getCategoryColor(equipment.category)}`
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px',
                          flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}>
                          <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                            <input
                              type="text"
                              placeholder="Nom de l'équipement"
                              value={equipment.name}
                              onChange={(e) => {
                                const updatedEquipments = (permitData.equipment_checklist || []).map((eq: any) =>
                                  eq.id === equipment.id ? { ...eq, name: e.target.value } : eq
                                );
                                updatePermitData({ equipment_checklist: updatedEquipments });
                              }}
                              style={{ ...styles.input, margin: 0 }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {equipment.category !== 'custom' && (
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: getCategoryColor(equipment.category),
                                color: 'white',
                                whiteSpace: 'nowrap'
                              }}>
                                {getCategoryLabel(equipment.category)}
                              </span>
                            )}
                            {equipment.required && (
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: '#dc2626',
                                color: 'white'
                              }}>
                                OBLIGATOIRE
                              </span>
                            )}
                            <button
                              onClick={() => {
                                const updatedEquipments = (permitData.equipment_checklist || []).filter((eq: any) => eq.id !== equipment.id);
                                updatePermitData({ equipment_checklist: updatedEquipments });
                              }}
                              style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '32px',
                                minHeight: '32px',
                                color: 'white'
                              }}
                              title="Supprimer cet équipement"
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                const updatedEquipments = (permitData.equipment_checklist || []).map((eq: any) =>
                                  eq.id === equipment.id ? { ...eq, checked_in: !eq.checked_in } : eq
                                );
                                updatePermitData({ equipment_checklist: updatedEquipments });
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: equipment.checked_in ? '#059669' : '#6b7280',
                                color: 'white'
                              }}
                            >
                              {equipment.checked_in ? '✅ Entré' : '⬇️ Entrée'}
                            </button>
                            <button
                              onClick={() => {
                                const updatedEquipments = (permitData.equipment_checklist || []).map((eq: any) =>
                                  eq.id === equipment.id ? { ...eq, checked_out: !eq.checked_out } : eq
                                );
                                updatePermitData({ equipment_checklist: updatedEquipments });
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: equipment.checked_out ? '#dc2626' : '#6b7280',
                                color: 'white'
                              }}
                            >
                              {equipment.checked_out ? '✅ Sorti' : '⬆️ Sortie'}
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            placeholder="N° série / ID"
                            value={equipment.serial_number || ''}
                            onChange={(e) => {
                              const updatedEquipments = (permitData.equipment_checklist || []).map((eq: any) =>
                                eq.id === equipment.id ? { ...eq, serial_number: e.target.value } : eq
                              );
                              updatePermitData({ equipment_checklist: updatedEquipments });
                            }}
                            style={{ 
                              ...styles.input, 
                              fontSize: '12px', 
                              padding: '6px 8px',
                              minWidth: '120px',
                              margin: 0
                            }}
                          />
                          
                          <select
                            value={equipment.condition || 'good'}
                            onChange={(e) => {
                              const updatedEquipments = (permitData.equipment_checklist || []).map((eq: any) =>
                                eq.id === equipment.id ? { ...eq, condition: e.target.value } : eq
                              );
                              updatePermitData({ equipment_checklist: updatedEquipments });
                            }}
                            style={{ 
                              ...styles.input, 
                              fontSize: '12px', 
                              padding: '6px 8px',
                              minWidth: '120px',
                              margin: 0
                            }}
                          >
                            <option value="good">🟢 Bon état</option>
                            <option value="fair">🟡 État acceptable</option>
                            <option value="poor">🔴 À remplacer</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        
        /* Optimisations tactiles */
        button, input, select, textarea {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3);
          touch-action: manipulation;
        }
        
        /* Scrollbar personnalisée */
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
        
        /* Amélioration de la lisibilité sur mobile */
        @media (max-width: 767px) {
          body {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Empêche le zoom lors du focus sur les inputs sur iOS */
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
          
          /* Navigation par onglets mobile */
          .mobile-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .mobile-tabs::-webkit-scrollbar {
            display: none;
          }
        }
        
        /* Optimisation pour les écrans très petits */
        @media (max-width: 320px) {
          .container {
            padding: 4px !important;
          }
        }
        
        /* Animation pour les éléments interactifs */
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
