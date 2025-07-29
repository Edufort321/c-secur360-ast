"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// Imports des composants segmentés
import SiteInformation from './SiteInformation';
import RescuePlan from './RescuePlan';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';

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

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface AtmosphericReading {
  id: string;
  timestamp: string;
  level: 'top' | 'middle' | 'bottom';
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
  retest_required?: boolean;
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
  emergency_contacts: Array<{
    name: string;
    role: string;
    phone: string;
    available_24h: boolean;
  }>;
}

interface ConfinedSpaceProps {
  province: ProvinceCode;
  language: 'fr' | 'en';
  onSave: (data: any) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// =================== DONNÉES RÉGLEMENTAIRES PROVINCIALES ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808",
    code: "RSST Art. 302-317",
    url: "https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013",
    atmospheric_testing: {
      frequency_minutes: 30,
      continuous_monitoring_required: true,
      documentation_required: true,
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 20 },
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
      { name: "CNESST Urgence", role: "Inspection d'urgence", phone: "1-844-838-0808", available_24h: true },
      { name: "Info-Santé 811", role: "Urgence médicale", phone: "811", available_24h: true },
      { name: "Services d'urgence", role: "Pompiers/Ambulance", phone: "911", available_24h: true }
    ]
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008",
    code: "O.Reg 632/05",
    url: "https://www.ontario.ca/laws/regulation/632",
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
      { name: "MOL Emergency", role: "Labour Inspector", phone: "1-877-202-0008", available_24h: true },
      { name: "Telehealth Ontario", role: "Medical Emergency", phone: "1-866-797-0000", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  BC: {
    name: "Workers Compensation Act - Part 3, Division 8",
    authority: "WorkSafeBC",
    authority_phone: "1-888-621-7233",
    code: "WCA Part 3 Div 8",
    url: "https://www.worksafebc.com/en/law/ohs-regulation/searchable-ohs-regulation",
    atmospheric_testing: {
      frequency_minutes: 10,
      continuous_monitoring_required: true,
      documentation_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
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
      { name: "WorkSafeBC Emergency", role: "Safety Inspector", phone: "1-888-621-7233", available_24h: true },
      { name: "HealthLink BC", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  AB: {
    name: "Occupational Health and Safety Code - Part 5",
    authority: "Alberta Labour",
    authority_phone: "1-866-415-8690",
    code: "OHS Code Part 5",
    url: "https://www.alberta.ca/ohs-code",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "Alberta Labour Emergency", role: "OHS Inspector", phone: "1-866-415-8690", available_24h: true },
      { name: "HealthLink Alberta", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  SK: {
    name: "Saskatchewan Employment Act - Part III",
    authority: "Ministry of Labour Relations",
    authority_phone: "1-800-567-7233",
    code: "SEA Part III",
    url: "https://www.saskatchewan.ca/business/safety-in-the-workplace",
    atmospheric_testing: {
      frequency_minutes: 25,
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
      { name: "SK Labour Emergency", role: "Safety Inspector", phone: "1-800-567-7233", available_24h: true },
      { name: "HealthLine 811", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  MB: {
    name: "Workplace Safety and Health Act",
    authority: "Manitoba Labour",
    authority_phone: "1-855-957-7233",
    code: "WSH Act",
    url: "https://web2.gov.mb.ca/laws/statutes/ccsm/w210e.php",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "MB Labour Emergency", role: "WSH Inspector", phone: "1-855-957-7233", available_24h: true },
      { name: "Health Links", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  NB: {
    name: "General Regulation - Occupational Health and Safety Act",
    authority: "WorkSafeNB",
    authority_phone: "1-800-222-9775",
    code: "OHSA General Reg",
    url: "https://www.worksafenb.ca/safety-topics/confined-spaces/",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "WorkSafeNB Emergency", role: "Safety Inspector", phone: "1-800-222-9775", available_24h: true },
      { name: "Tele-Care 811", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  NS: {
    name: "Occupational Health and Safety Act",
    authority: "Nova Scotia Labour",
    authority_phone: "1-800-952-2687",
    code: "OHSA",
    url: "https://novascotia.ca/lae/healthandsafety/",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "NS Labour Emergency", role: "OHS Inspector", phone: "1-800-952-2687", available_24h: true },
      { name: "811 HealthLine", role: "Medical Emergency", phone: "811", available_24h: true },   
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  PE: {
    name: "Occupational Health and Safety Act",
    authority: "PEI Workers Compensation Board",
    authority_phone: "1-800-237-5049",
    code: "OHSA",
    url: "https://www.wcb.pe.ca/OccupationalHealthSafety",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "PEI WCB Emergency", role: "Safety Inspector", phone: "1-800-237-5049", available_24h: true },
      { name: "HealthPEI", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  },
  NL: {
    name: "Occupational Health and Safety Regulations",
    authority: "Workplace NL",
    authority_phone: "1-800-563-9000",
    code: "OHS Regulations",
    url: "https://workplacenl.ca/injury-prevention/occupational-health-safety/",
    atmospheric_testing: {
      frequency_minutes: 20,
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
      { name: "WorkplaceNL Emergency", role: "Safety Inspector", phone: "1-800-563-9000", available_24h: true },
      { name: "811 HealthLine", role: "Medical Emergency", phone: "811", available_24h: true },
      { name: "Emergency Services", role: "Fire/Ambulance", phone: "911", available_24h: true }
    ]
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData = {}
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province);
  const [atmosphericReadings, setAtmosphericReadings] = useState<AtmosphericReading[]>(initialData.atmosphericReadings || []);
  const [permitData, setPermitData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Permis d'Entrée en Espace Clos",
      subtitle: "Document légal obligatoire selon les réglementations provinciales canadiennes",
      sections: {
        site: "Information du Site",
        rescue: "Plan de Sauvetage",
        atmospheric: "Tests Atmosphériques",
        registry: "Registre d'Entrée"
      },
      navigation: {
        previous: "Précédent",
        next: "Suivant",
        save: "Enregistrer",
        export: "Exporter PDF",
        cancel: "Annuler",
        submit: "Soumettre le Permis"
      },
      status: {
        draft: "Brouillon",
        inProgress: "En cours",
        completed: "Complété",
        saving: "Sauvegarde...",
        saved: "Sauvegardé",
        error: "Erreur"
      },
      validation: {
        incomplete: "Section incomplète",
        complete: "Section complète",
        required: "Champs obligatoires manquants"
      }
    },
    en: {
      title: "Confined Space Entry Permit",
      subtitle: "Mandatory legal document according to Canadian provincial regulations",
      sections: {
        site: "Site Information",
        rescue: "Rescue Plan",
        atmospheric: "Atmospheric Testing",
        registry: "Entry Registry"
      },
      navigation: {
        previous: "Previous",
        next: "Next",
        save: "Save",
        export: "Export PDF",
        cancel: "Cancel",
        submit: "Submit Permit"
      },
      status: {
        draft: "Draft",
        inProgress: "In Progress",
        completed: "Completed",
        saving: "Saving...",
        saved: "Saved",
        error: "Error"
      },
      validation: {
        incomplete: "Incomplete section",
        complete: "Complete section",
        required: "Missing required fields"
      }
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
  // Génération automatique du numéro de permis
  useEffect(() => {
    if (!permitData.permit_number) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      updatePermitData({ 
        permit_number: `CS-${selectedProvince}-${timestamp}-${random}`,
        issue_date: new Date().toISOString().slice(0, 16),
        selected_province: selectedProvince
      });
    }
  }, [selectedProvince]);

  // Mise à jour des données de permis
  const updatePermitData = useCallback((updates: any) => {
    setPermitData((prev: any) => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Synchronisation données avec parent
  const updateParentData = useCallback((section: string, data: any) => {
    updatePermitData({ [section]: data });
  }, [updatePermitData]);

  // Validation des sections
  const validateSection = (section: string): boolean => {
    switch (section) {
      case 'site':
        return !!(permitData.site_name && permitData.space_location && permitData.space_description);
      case 'rescue':
        return !!(permitData.rescue_plan_type && permitData.rescue_plan_responsible && permitData.rescue_plan_validated);
      case 'atmospheric':
        return !!(permitData.gas_detector_calibrated && permitData.multi_level_testing_completed && atmosphericReadings.length > 0);
      case 'registry':
        return !!(permitData.supervisor_name && permitData.attendants && permitData.entrants);
      default:
        return false;
    }
  };

  // Navigation entre sections
  const navigateToSection = (section: 'site' | 'rescue' | 'atmospheric' | 'registry') => {
    setCurrentSection(section);
  };

  // Sauvegarde des données
  const savePermitData = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      const dataToSave = {
        ...permitData,
        atmosphericReadings,
        currentSection,
        selectedProvince
      };
      
      await onSave(dataToSave);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Soumission finale du permis
  const submitPermit = async () => {
    const allSectionsValid = ['site', 'rescue', 'atmospheric', 'registry'].every(validateSection);
    
    if (!allSectionsValid) {
      alert(language === 'fr' ? 'Veuillez compléter toutes les sections avant la soumission.' : 'Please complete all sections before submission.');
      return;
    }

    setIsLoading(true);
    
    try {
      const finalData = {
        ...permitData,
        atmosphericReadings,
        status: 'completed',
        submitted_at: new Date().toISOString(),
        selectedProvince
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul du statut global
  const getOverallStatus = (): 'draft' | 'inProgress' | 'completed' => {
    const sectionsValidated = [
      validateSection('site'),
      validateSection('rescue'),
      validateSection('atmospheric'),
      validateSection('registry')
    ];
    
    const completedSections = sectionsValidated.filter(Boolean).length;
    
    if (completedSections === 0) return 'draft';
    if (completedSections === 4) return 'completed';
    return 'inProgress';
  };
  // =================== RENDU DES SECTIONS ===================
  const renderSectionContent = () => {
    const commonProps = {
      permitData,
      updatePermitData,
      selectedProvince,
      PROVINCIAL_REGULATIONS,
      isMobile,
      language,
      styles,
      updateParentData
    };

    switch (currentSection) {
      case 'site':
        return (
          <SiteInformation
            {...commonProps}
          />
        );
      case 'rescue':
        return (
          <RescuePlan
            formData={permitData}
            onDataChange={(section: string, data: any) => {
              updatePermitData({ [section]: data });
              updateParentData(section, data);
            }}
            tenant={selectedProvince || 'QC'}
            errors={{}}
            language={language}
          />
        );
      case 'atmospheric':
        return (
          <AtmosphericTesting
            {...commonProps}
            atmosphericReadings={atmosphericReadings}
            setAtmosphericReadings={setAtmosphericReadings}
          />
        );
      case 'registry':
        return (
          <EntryRegistry
            {...commonProps}
            atmosphericReadings={atmosphericReadings}
          />
        );
      default:
        return null;
    }
  };

  // Icônes des sections
  const getSectionIcon = (section: string) => {
    const iconMap = {
      site: Building,
      rescue: Shield,
      atmospheric: Gauge,
      registry: Users
    };
    return iconMap[section as keyof typeof iconMap] || FileText;
  };

  // Couleur de statut des sections
  const getSectionStatusColor = (section: string): string => {
    return validateSection(section) ? '#10b981' : '#6b7280';
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '20px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px'
    }}>
      
      {/* En-tête principal */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '20px',
        padding: isMobile ? '24px' : '32px',
        border: '2px solid #374151',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Gradient de fond */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '0'
          }}>
            <div>
              <h1 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '900',
                color: 'white',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Shield style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#3b82f6' }} />
                {texts.title}
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: isMobile ? '14px' : '16px',
                margin: 0,
                maxWidth: isMobile ? 'none' : '600px'
              }}>
                {texts.subtitle}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Statut global */}
              <div style={{
                padding: '12px 20px',
                borderRadius: '12px',
                backgroundColor: getOverallStatus() === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                getOverallStatus() === 'inProgress' ? 'rgba(245, 158, 11, 0.2)' : 
                                'rgba(107, 114, 128, 0.2)',
                border: `2px solid ${getOverallStatus() === 'completed' ? '#10b981' : 
                                    getOverallStatus() === 'inProgress' ? '#f59e0b' : 
                                    '#6b7280'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getOverallStatus() === 'completed' ? (
                  <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                ) : getOverallStatus() === 'inProgress' ? (
                  <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                ) : (
                  <FileText style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                )}
                <span style={{
                  color: getOverallStatus() === 'completed' ? '#86efac' : 
                        getOverallStatus() === 'inProgress' ? '#fde047' : 
                        '#9ca3af',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {texts.status[getOverallStatus()]}
                </span>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  onClick={savePermitData}
                  disabled={isLoading}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    padding: '12px 20px',
                    fontSize: '14px',
                    minWidth: '120px',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    width: 'auto'
                  }}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {texts.status.saving}
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <CheckCircle style={{ width: '16px', height: '16px' }} />
                      {texts.status.saved}
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      {texts.status.error}
                    </>
                  ) : (
                    <>
                      <Save style={{ width: '16px', height: '16px' }} />
                      {texts.navigation.save}
                    </>
                  )}
                </button>

                {getOverallStatus() === 'completed' && (
                  <button
                    onClick={submitPermit}
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      padding: '12px 20px',
                      fontSize: '14px',
                      minWidth: '140px',
                      width: 'auto'
                    }}
                  >
                    <Upload style={{ width: '16px', height: '16px' }} />
                    {texts.navigation.submit}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Informations permis */}
          {permitData.permit_number && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
                gap: '16px',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? 'Numéro de permis' : 'Permit Number'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {permitData.permit_number}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? 'Province' : 'Province'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {PROVINCIAL_REGULATIONS[selectedProvince].authority} ({selectedProvince})
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? "Date d'émission" : 'Issue Date'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {permitData.issue_date ? new Date(permitData.issue_date).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CSS pour l'animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Navigation des sections */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        border: '2px solid #374151',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px'
        }}>
          {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => {
            const Icon = getSectionIcon(section);
            const isActive = currentSection === section;
            const isCompleted = validateSection(section);
            
            return (
              <button
                key={section}
                onClick={() => navigateToSection(section)}
                style={{
                  padding: isMobile ? '16px 12px' : '20px 16px',
                  backgroundColor: isActive ? '#3b82f6' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(75, 85, 99, 0.3)',
                  border: `2px solid ${isActive ? '#60a5fa' : isCompleted ? '#10b981' : '#6b7280'}`,
                  borderRadius: '12px',
                  color: isActive ? 'white' : isCompleted ? '#86efac' : '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                {/* Indicateur de progression */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10b981' : 'rgba(107, 114, 128, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCompleted ? (
                    <CheckCircle style={{ width: '12px', height: '12px', color: 'white' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <Icon style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px' }} />
                <span style={{ textAlign: 'center', lineHeight: 1.2 }}>
                  {texts.sections[section]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de la section active */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        border: '2px solid #374151',
        minHeight: '600px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ padding: isMobile ? '20px' : '28px' }}>
          {renderSectionContent()}
        </div>
      </div>

      {/* Navigation bas de page */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px' : '20px',
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        border: '2px solid #374151'
      }}>
        <button
          onClick={() => {
            const sections = ['site', 'rescue', 'atmospheric', 'registry'] as const;
            const currentIndex = sections.indexOf(currentSection);
            if (currentIndex > 0) {
              navigateToSection(sections[currentIndex - 1]);
            }
          }}
          disabled={currentSection === 'site'}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            opacity: currentSection === 'site' ? 0.5 : 1,
            cursor: currentSection === 'site' ? 'not-allowed' : 'pointer',
            width: 'auto'
          }}
        >
          <ChevronRight style={{ width: '18px', height: '18px', transform: 'rotate(180deg)' }} />
          {texts.navigation.previous}
        </button>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => (
            <div
              key={section}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: currentSection === section ? '#3b82f6' : validateSection(section) ? '#10b981' : '#6b7280',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              width: 'auto',
              padding: '12px 16px'
            }}
          >
            <XCircle style={{ width: '16px', height: '16px' }} />
            {texts.navigation.cancel}
          </button>
          
          <button
            onClick={() => {
              const sections = ['site', 'rescue', 'atmospheric', 'registry'] as const;
              const currentIndex = sections.indexOf(currentSection);
              if (currentIndex < sections.length - 1) {
                navigateToSection(sections[currentIndex + 1]);
              }
            }}
            disabled={currentSection === 'registry'}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: currentSection === 'registry' ? 0.5 : 1,
              cursor: currentSection === 'registry' ? 'not-allowed' : 'pointer',
              width: 'auto'
            }}
          >
            {texts.navigation.next}
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
