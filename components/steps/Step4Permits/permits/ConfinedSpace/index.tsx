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
    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700">
      {[
        { id: 'site', label: '🏢 Site', icon: <Home className="w-4 h-4" /> },
        { id: 'atmospheric', label: '🌬️ Atmosphère', icon: <Wind className="w-4 h-4" /> },
        { id: 'personnel', label: '👥 Personnel', icon: <Users className="w-4 h-4" /> },
        { id: 'photos', label: '📸 Photos', icon: <Camera className="w-4 h-4" /> },
        { id: 'emergency', label: '🚨 Urgence', icon: <Phone className="w-4 h-4" /> }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white border-b-2 border-blue-400'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );

  // Rendu section site
  const renderSiteSection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{texts.title}</h2>
            <p className="text-gray-400 mb-4">{texts.subtitle}</p>
            <div className="text-sm text-blue-300">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                📍 Province: {PROVINCIAL_REGULATIONS[selectedProvince].name}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" />
                Réglementation: {PROVINCIAL_REGULATIONS[selectedProvince].code}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority} - {PROVINCIAL_REGULATIONS[selectedProvince].authority_phone}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">N° Permis</label>
                <div className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 font-mono text-lg font-bold">
                  {permitData.permit_number}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode)}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PROVINCIAL_REGULATIONS).map(([code, reg]) => (
                    <option key={code} value={code}>
                      {reg.name} ({code})
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Autorité: {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_date: e.target.value }))}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_time: e.target.value }))}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Date d'expiration</label>
                <input
                  type="date"
                  value={permitData.expiry_date}
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Heure d'expiration</label>
                <input
                  type="time"
                  value={permitData.expiry_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_time: e.target.value }))}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <MapPin className="w-5 h-5" />
          {texts.siteIdentification}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Nom du site *</label>
              <input
                type="text"
                placeholder="Ex: Usine Pétrochimique Nord"
                value={permitData.site_name}
                onChange={(e) => setPermitData(prev => ({ ...prev, site_name: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Adresse complète</label>
              <input
                type="text"
                placeholder="Ex: 123 Rue Industrielle, Ville, Province, Code postal"
                value={permitData.site_address}
                onChange={(e) => setPermitData(prev => ({ ...prev, site_address: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Localisation précise de l'espace clos *</label>
            <input
              type="text"
              placeholder="Ex: Réservoir T-101, Niveau sous-sol, Section B"
              value={permitData.space_location}
              onChange={(e) => setPermitData(prev => ({ ...prev, space_location: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description de l'espace clos *</label>
            <textarea
              placeholder="Ex: Réservoir cylindrique de 5m de diamètre et 8m de hauteur, utilisé pour stockage de produits chimiques"
              value={permitData.space_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, space_description: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description des travaux à effectuer *</label>
            <textarea
              placeholder="Ex: Inspection visuelle, nettoyage des parois, réparation de soudures, maintenance préventive"
              value={permitData.work_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, work_description: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              rows={3}
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
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Shield className="w-5 h-5" />
            Limites Réglementaires - {currentRegulations.name}
            <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
              Tests aux {currentRegulations.atmospheric_testing.frequency_minutes} min
            </span>
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(currentRegulations.atmospheric_testing.limits).map(([gas, limits]) => (
              <div key={gas} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-2">
                  {gas === 'oxygen' ? '🫁 O₂' : 
                   gas === 'lel' ? '🔥 LEL' : 
                   gas === 'h2s' ? '☠️ H₂S' : 
                   '💨 CO'}
                </h4>
                <div className="space-y-1 text-sm">
                  {gas === 'oxygen' ? (
                    <>
                      <div className="text-green-300">✅ {(limits as AtmosphericLimits['oxygen']).min}-{(limits as AtmosphericLimits['oxygen']).max}%</div>
                      <div className="text-red-300">🚨 ≤{(limits as AtmosphericLimits['oxygen']).critical_low}% ou ≥{(limits as AtmosphericLimits['oxygen']).critical_high}%</div>
                    </>
                  ) : (
                    <>
                      <div className="text-green-300">✅ ≤{(limits as AtmosphericLimits['lel']).max} {gas === 'lel' ? '%' : 'ppm'}</div>
                      <div className="text-red-300">🚨 ≥{(limits as AtmosphericLimits['lel']).critical} {gas === 'lel' ? '%' : 'ppm'}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {retestActive && (
          <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <h3 className="text-red-200 font-bold text-lg">⏰ RETEST OBLIGATOIRE</h3>
                  <p className="text-red-300">Valeurs critiques détectées - Nouveau test requis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-400">{formatTime(retestTimer)}</div>
                <div className="text-red-300 text-sm">Temps restant</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Activity className="w-5 h-5" />
            Nouvelle Mesure Atmosphérique
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">O₂ (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                placeholder="20.9"
                value={manualReading.oxygen}
                onChange={(e) => setManualReading(prev => ({ ...prev, oxygen: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">LEL (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0"
                value={manualReading.lel}
                onChange={(e) => setManualReading(prev => ({ ...prev, lel: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">H₂S (ppm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="0"
                value={manualReading.h2s}
                onChange={(e) => setManualReading(prev => ({ ...prev, h2s: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">CO (ppm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="0"
                value={manualReading.co}
                onChange={(e) => setManualReading(prev => ({ ...prev, co: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Température (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="20"
                value={manualReading.temperature}
                onChange={(e) => setManualReading(prev => ({ ...prev, temperature: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Humidité (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="50"
                value={manualReading.humidity}
                onChange={(e) => setManualReading(prev => ({ ...prev, humidity: e.target.value }))}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addManualReading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all w-full flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                {texts.addManualReading}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Notes (optionnel)</label>
            <textarea
              placeholder="Observations, conditions particulières, appareil utilisé..."
              value={manualReading.notes}
              onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 w-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <FileText className="w-5 h-5" />
            Historique des Mesures ({atmosphericReadings.length})
          </h3>
          
          {atmosphericReadings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg mb-2">Aucune mesure enregistrée</p>
              <p className="text-sm">Effectuez votre première mesure atmosphérique ci-dessus.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {atmosphericReadings.slice().reverse().map((reading) => (
                <div
                  key={reading.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    reading.status === 'danger' ? 'bg-red-900/20 border-red-500' :
                    reading.status === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-green-900/20 border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        reading.status === 'danger' ? 'bg-red-500 animate-pulse' :
                        reading.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className={`font-semibold ${
                        reading.status === 'danger' ? 'text-red-300' :
                        reading.status === 'warning' ? 'text-yellow-300' :
                        'text-green-300'
                      }`}>
                        {reading.status === 'danger' ? '🚨 DANGER' :
                         reading.status === 'warning' ? '⚠️ ATTENTION' :
                         '✅ SÉCURITAIRE'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(reading.timestamp).toLocaleString('fr-CA')} - {reading.taken_by}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">O₂:</span>
                      <span className={`ml-2 font-medium ${
                        validateAtmosphericValue('oxygen', reading.oxygen) === 'danger' ? 'text-red-300' :
                        validateAtmosphericValue('oxygen', reading.oxygen) === 'warning' ? 'text-yellow-300' :
                        'text-green-300'
                      }`}>
                        {reading.oxygen}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">LEL:</span>
                      <span className={`ml-2 font-medium ${
                        validateAtmosphericValue('lel', reading.lel) === 'danger' ? 'text-red-300' :
                        validateAtmosphericValue('lel', reading.lel) === 'warning' ? 'text-yellow-300' :
                        'text-green-300'
                      }`}>
                        {reading.lel}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">H₂S:</span>
                      <span className={`ml-2 font-medium ${
                        validateAtmosphericValue('h2s', reading.h2s) === 'danger' ? 'text-red-300' :
                        validateAtmosphericValue('h2s', reading.h2s) === 'warning' ? 'text-yellow-300' :
                        'text-green-300'
                      }`}>
                        {reading.h2s} ppm
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">CO:</span>
                      <span className={`ml-2 font-medium ${
                        validateAtmosphericValue('co', reading.co) === 'danger' ? 'text-red-300' :
                        validateAtmosphericValue('co', reading.co) === 'warning' ? 'text-yellow-300' :
                        'text-green-300'
                      }`}>
                        {reading.co} ppm
                      </span>
                    </div>
                  </div>
                  
                  {(reading.temperature || reading.humidity || reading.notes) && (
                    <div className="mt-2 pt-2 border-t border-gray-600 text-sm text-gray-300">
                      {reading.temperature && <span>🌡️ {reading.temperature}°C </span>}
                      {reading.humidity && <span>💧 {reading.humidity}% </span>}
                      {reading.notes && <div className="mt-1">📝 {reading.notes}</div>}
                    </div>
                  )}
                </div>
              ))}
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
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Phone className="w-5 h-5" />
            {texts.emergencyContacts} - {currentRegulations.name}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentRegulations.emergency_contacts.map((contact, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                contact.name === '911' ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-blue-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{contact.name}</h4>
                  {contact.available_24h && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">24h/7j</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-2">{contact.role}</p>
                <a href={`tel:${contact.phone}`} className="text-blue-400 hover:text-blue-300 font-mono text-lg transition-colors">
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <h4 className="text-red-200 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Procédure d'Évacuation d'Urgence
            </h4>
            <ol className="text-red-200 text-sm space-y-1 ml-4">
              <li>1. <strong>ARRÊT IMMÉDIAT</strong> de tous les travaux</li>
              <li>2. <strong>ÉVACUATION</strong> immédiate de tous les entrants</li>
              <li>3. <strong>APPEL</strong> au 911 et contacts d'urgence</li>
              <li>4. <strong>INTERDICTION</strong> de re-entrée jusqu'à autorisation</li>
              <li>5. <strong>RAPPORT</strong> d'incident obligatoire</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{texts.title}</h1>
            <p className="text-gray-400">{texts.subtitle}</p>
            <div className="text-sm text-blue-300 mt-2">
              <span className="font-mono bg-gray-800 px-2 py-1 rounded border">
                {permitData.permit_number}
              </span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            isPermitValid() 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all">
            <AlertTriangle className="w-5 h-5" />
            {texts.emergencyEvacuation}
          </button>
          <button
            onClick={() => onSave?.({})}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />
            {texts.savePermit}
          </button>
          {isPermitValid() && (
            <button
              onClick={() => onSubmit?.({})}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              {texts.submitPermit}
            </button>
          )}
        </div>
      </div>

      {renderTabs()}

      <div className="space-y-8">
        {activeTab === 'site' && renderSiteSection()}
        {activeTab === 'atmospheric' && renderAtmosphericSection()}
        {activeTab === 'personnel' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <Users className="w-5 h-5" />
              {texts.personnelManagement}
            </h3>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">Section Personnel en cours de développement</p>
              <p className="text-gray-500 text-sm">
                Fonctionnalités: signatures électroniques, horodatage entrée/sortie, validation formations.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'photos' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <Camera className="w-5 h-5" />
              {texts.photoDocumentation}
            </h3>
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">Section Photos en cours de développement</p>
              <p className="text-gray-500 text-sm">
                Fonctionnalités: capture mobile, géolocalisation GPS, métadonnées, carousel.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'emergency' && renderEmergencySection()}
      </div>
    </div>
  );
};

export default ConfinedSpacePermit;
