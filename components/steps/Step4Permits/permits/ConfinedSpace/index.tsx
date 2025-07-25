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
  
  // Formations obligatoires par rôle
  formation_espace_clos: boolean;
  formation_sauvetage: boolean;
  formation_premiers_soins: boolean;
  formation_superviseur?: boolean;
  
  // Déclarations conformité
  training_declaration: boolean;
  age_declaration: boolean;
  
  // Signatures électroniques
  signature?: string;
  signature_timestamp?: string;
  
  // Horodatage entrée/sortie
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

// =================== MESURES CORRECTIVES ET RECOMMANDATIONS ===================
const CORRECTIVE_MEASURES_DATABASE = {
  atmospheric_issues: {
    low_oxygen: {
      condition: 'Oxygène < 19.5% (ou < 20.5% au QC)',
      immediate_actions: [
        '🚨 ÉVACUATION IMMÉDIATE de tous les entrants',
        '🚫 INTERDICTION d\'entrée jusqu\'à correction',
        '📞 Notification du superviseur et autorité compétente'
      ],
      corrective_measures: [
        {
          type: 'Ventilation forcée',
          description: 'Installation de ventilateurs mécaniques pour apport d\'air frais',
          specifications: {
            flow_rate: 'Minimum 6-10 changements d\'air par heure (ACH)',
            cfm_calculation: 'CFM = (Volume espace en pi³ × ACH souhaité) ÷ 60 min',
            example: 'Espace 20×10×8 pi = 1600 pi³, besoin 10 ACH = 267 CFM minimum',
            safety_margin: 'Ajouter 25% pour résistance conduits (334 CFM final)'
          },
          equipment: [
            'Ventilateur centrifuge 8-12 pouces pour espaces moyens',
            'Conduits flexibles diamètre 8-12 pouces',
            'Prévoir séparation entrée/sortie air (min 3 mètres)',
            'Alarme de défaillance ventilation obligatoire'
          ]
        },
        {
          type: 'Ouvertures additionnelles',
          description: 'Création d\'ouvertures pour circulation d\'air naturelle',
          specifications: {
            size: 'Minimum 1% de la surface au sol pour entrée d\'air',
            location: 'Ouverture basse pour entrée, haute pour sortie',
            requirement: 'Au moins 2 ouvertures opposées pour circulation croisée'
          }
        },
        {
          type: 'Purge à l\'azote (si applicable)',
          description: 'Élimination des gaz inertes par purge contrôlée',
          warning: '⚠️ Ne JAMAIS utiliser d\'oxygène pur - risque explosion'
        }
      ]
    },
    high_lel: {
      condition: 'LEL > 5% (QC) ou > 10% (autres provinces)',
      immediate_actions: [
        '🚨 ÉVACUATION IMMÉDIATE - Atmosphère explosive',
        '🚫 ÉLIMINATION de toutes sources d\'ignition',
        '⚡ COUPER alimentation électrique si sécuritaire'
      ],
      corrective_measures: [
        {
          type: 'Purge d\'air forcée',
          description: 'Élimination des vapeurs inflammables par dilution',
          specifications: {
            flow_rate: 'Minimum 20 changements d\'air par heure',
            duration: 'Purge continue jusqu\'à LEL < 1%',
            monitoring: 'Test atmosphérique continu pendant purge'
          }
        },
        {
          type: 'Isolation des sources',
          description: 'Arrêt des sources de vapeurs inflammables',
          methods: [
            'Fermeture et cadenassage des valves en amont',
            'Installation de brides aveugles si nécessaire',
            'Vidange des résidus liquides inflammables'
          ]
        }
      ]
    },
    toxic_gases: {
      condition: 'H₂S > 10 ppm ou CO > 35 ppm',
      immediate_actions: [
        '🚨 ÉVACUATION IMMÉDIATE',
        '😷 Port d\'ARI (Appareil Respiratoire Isolant) obligatoire',
        '🚑 Surveillance médicale si exposition'
      ],
      corrective_measures: [
        {
          type: 'Ventilation par aspiration',
          description: 'Extraction directe des gaz toxiques à la source',
          specifications: {
            velocity: 'Vitesse aspiration: 100-200 pi/min à la source',
            cfm_calculation: 'CFM = Surface ouverture (pi²) × Vitesse (pi/min)',
            location: 'Aspiration au point le plus bas (H₂S) ou niveau travail (CO)'
          }
        },
        {
          type: 'Neutralisation chimique',
          description: 'Traitement des gaz selon leur nature',
          methods: [
            'H₂S: Injection d\'air ou oxydants contrôlés',
            'CO: Ventilation et élimination source combustion',
            'Lavage à l\'eau pour gaz solubles'
          ]
        }
      ]
    }
  },
  ventilation_systems: {
    natural_ventilation: {
      description: 'Ventilation par ouvertures naturelles',
      limitations: [
        '❌ Interdite en espace clos selon CSA et CNESST',
        '❌ Inefficace pour élimination contaminants',
        '❌ Non contrôlable en cas d\'urgence'
      ],
      acceptable_use: 'Uniquement comme complément à ventilation mécanique'
    },
    mechanical_ventilation: {
      description: 'Ventilation forcée par ventilateurs',
      types: [
        {
          name: 'Soufflage (Air Supply)',
          usage: 'Apport d\'air frais dans l\'espace',
          cfm_calc: 'Volume espace × 6-10 ACH ÷ 60',
          placement: 'Entrée air par point bas, sortie naturelle point haut'
        },
        {
          name: 'Extraction (Exhaust)',
          usage: 'Évacuation air vicié de l\'espace',
          cfm_calc: 'Volume espace × 8-12 ACH ÷ 60',
          placement: 'Aspiration point haut pour vapeurs légères, bas pour lourdes'
        },
        {
          name: 'Combiné (Push-Pull)',
          usage: 'Soufflage + extraction simultanés',
          cfm_calc: 'Soufflage légèrement > extraction (90-95%)',
          advantage: 'Contrôle optimal circulation air'
        }
      ],
      equipment_specs: {
        fans: [
          'Centrifuge: 200-2000 CFM, pression moyenne/élevée',
          'Axial: 1000-10000 CFM, débit élevé, pression faible',
          'Explosion-proof: Obligatoire si atmosphère inflammable'
        ],
        ducting: [
          'Flexible: 4-12 pouces, installation rapide',
          'Rigide: Meilleure efficacité, pertes charges réduites',
          'Longueur max: 100 pieds pour maintenir débit'
        ]
      }
    },
    ventilation_calculations: {
      cfm_formula: 'CFM = (L × W × H × ACH) ÷ 60',
      ach_requirements: {
        'Espace normal': '6-8 ACH',
        'Présence toxiques': '10-15 ACH',
        'Atmosphère explosive': '20+ ACH',
        'Travail à chaud': '15-20 ACH'
      },
      pressure_loss: [
        'Conduit droit: 0.1 pouce H₂O par 100 pieds',
        'Coude 90°: +0.25 pouce H₂O',
        'Réduction diamètre: +0.5 pouce H₂O',
        'Filtre standard: +0.2-0.5 pouce H₂O'
      ]
    }
  },
  monitoring_systems: {
    continuous_monitoring: {
      description: 'Surveillance atmosphérique continue obligatoire',
      equipment: [
        'Détecteurs 4 gaz (O₂, LEL, H₂S, CO) fixes',
        'Alarmes visuelles et sonores',
        'Transmission données temps réel',
        'Alimentation secours (batterie 24h min)'
      ],
      alarm_settings: {
        oxygen: 'Bas: 19.5% (18% QC), Haut: 23.5%',
        lel: 'Alarme: 10% LEL, Évacuation: 25% LEL',
        h2s: 'Alarme: 10 ppm, Danger: 20 ppm',
        co: 'Alarme: 35 ppm, Danger: 200 ppm'
      }
    },
    portable_monitoring: {
      description: 'Tests ponctuels par appareils portatifs',
      frequency: 'Toutes les 30 minutes ou selon réglementation provinciale',
      calibration: 'Étalonnage quotidien avant utilisation obligatoire'
    }
  },
  emergency_procedures: {
    ventilation_failure: {
      immediate_response: [
        '1. ÉVACUATION immédiate tous entrants',
        '2. ARRÊT travaux et équipements électriques',
        '3. ACTIVATION procédures sauvetage',
        '4. INTERDICTION re-entrée sans correction'
      ],
      backup_systems: [
        'Ventilateur de secours automatique',
        'Alimentation électrique redondante',
        'Détection panne avec alarme',
        'Procédure manuelle démarrage secours'
      ]
    },
    gas_leak: {
      response_matrix: {
        'Fuite mineure': [
          'Augmentation ventilation × 2',
          'Surveillance renforcée 15 min',
          'Identification et colmatage source'
        ],
        'Fuite majeure': [
          'Évacuation immédiate',
          'Isolement source (valves, brides)',
          'Ventilation purge maximale',
          'Re-test avant re-entrée'
        ]
      }
    }
  }
};

// =================== CALCULS DE VENTILATION ===================
const calculateVentilationRequirements = (
  length: number, // pieds
  width: number,  // pieds  
  height: number, // pieds
  ach: number = 10, // changements d'air par heure
  safetyMargin: number = 25 // % marge sécurité
) => {
  const volume = length * width * height; // pi³
  const baseCFM = (volume * ach) / 60;
  const finalCFM = baseCFM * (1 + safetyMargin / 100);
  
  return {
    volume,
    baseCFM: Math.round(baseCFM),
    finalCFM: Math.round(finalCFM),
    ach,
    recommendation: `Ventilateur minimum ${Math.round(finalCFM)} CFM pour ${ach} changements d'air/heure`
  };
};

// =================== RÉGLEMENTATIONS CANADIENNES 2023 ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, any> = {
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
        // NOUVELLES LIMITES 2023 - Plus strictes
        oxygen: { min: 20.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 5, critical: 25 }, // NOUVEAU: 5% au lieu de 10%
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel_requirements: {
      min_age: 18, // NOUVEAU 2023
      attendant_required: true,
      bidirectional_communication_required: true, // NOUVEAU 2023
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
    url: 'https://www.alberta.ca/ohs-code-part-46.aspx',
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
  SK: { name: 'Saskatchewan', authority: 'Saskatchewan Employment Standards', authority_phone: '1-800-567-7233', code: 'Part XVIII', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] },
  MB: { name: 'Manitoba', authority: 'Workplace Safety & Health', authority_phone: '1-855-957-7233', code: 'Part 13', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] },
  NB: { name: 'New Brunswick', authority: 'WorkSafeNB', authority_phone: '1-800-222-9775', code: 'Reg 91-191', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] },
  NS: { name: 'Nova Scotia', authority: 'Labour Standards', authority_phone: '1-800-952-2687', code: 'OHS Regulations', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] },
  PE: { name: 'Prince Edward Island', authority: 'WCB PEI', authority_phone: '1-800-237-5049', code: 'OHS Regulations', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] },
  NL: { name: 'Newfoundland and Labrador', authority: 'Workplace Health, Safety & Compensation Commission', authority_phone: '1-800-563-9000', code: 'OHS Regulations', atmospheric_testing: { frequency_minutes: 30, limits: { oxygen: { min: 19.5, max: 23.0, critical_low: 16.0 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } } }, personnel_requirements: { min_age: 18, attendant_required: true }, emergency_contacts: [{ name: '911', role: 'Emergency', phone: '911', available_24h: true }] }
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

// =================== COMPOSANT CANVAS SIGNATURE ===================
const SignatureCanvas: React.FC<{
  onSave: (signature: string) => void;
  width?: number;
  height?: number;
  personName: string;
}> = ({ onSave, width = 400, height = 120, personName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setIsEmpty(false);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  return (
    <div className="signature-container">
      <div className="text-sm text-slate-600 mb-2">
        Signature électronique - {personName} - {new Date().toLocaleString()}
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-slate-300 rounded-lg bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearCanvas}
          className="text-xs px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
        >
          🗑️ Effacer
        </button>
        <button
          onClick={saveSignature}
          disabled={isEmpty}
          className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✅ Sauvegarder Signature
        </button>
      </div>
    </div>
  );
};

// =================== COMPOSANT GALERIE PHOTOS AVANCÉE ===================
const AdvancedPhotoGallery: React.FC<{
  photos: PhotoRecord[];
  onPhotoAdd: (photo: PhotoRecord) => void;
  onPhotoRemove: (photoId: string) => void;
  onPhotoUpdate: (photoId: string, updates: Partial<PhotoRecord>) => void;
}> = ({ photos, onPhotoAdd, onPhotoRemove, onPhotoUpdate }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<PhotoRecord['category']>('documentation');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'before', label: '📋 Avant travaux', color: 'blue' },
    { value: 'during', label: '⚒️ Pendant travaux', color: 'yellow' },
    { value: 'after', label: '✅ Après travaux', color: 'green' },
    { value: 'equipment', label: '🛠️ Équipements', color: 'purple' },
    { value: 'hazard', label: '⚠️ Dangers', color: 'red' },
    { value: 'documentation', label: '📄 Documentation', color: 'gray' }
  ] as const;

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('📸 La photo est trop volumineuse (max 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      
      // Tentative géolocalisation avec timeout
      const getLocation = (): Promise<GeolocationPosition | null> => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          
          const timeoutId = setTimeout(() => resolve(null), 5000); // 5 sec timeout
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timeoutId);
              resolve(position);
            },
            () => {
              clearTimeout(timeoutId);
              resolve(null);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 5000, 
              maximumAge: 300000 
            }
          );
        });
      };

      const position = await getLocation();
      
      const newPhoto: PhotoRecord = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        caption: '',
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        taken_by: 'Opérateur Mobile',
        file_size: file.size,
        file_name: file.name,
        gps_location: position ? {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        } : undefined
      };

      onPhotoAdd(newPhoto);
    };
    
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openModal = (photo: PhotoRecord, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setShowModal(true);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, photos.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const updatePhotoCaption = (caption: string) => {
    if (selectedPhoto) {
      onPhotoUpdate(selectedPhoto.id, { caption });
      setSelectedPhoto({ ...selectedPhoto, caption });
    }
  };

  const getCategoryColor = (category: PhotoRecord['category']) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const photosByCategory = categories.map(cat => ({
    ...cat,
    photos: photos.filter(p => p.category === cat.value)
  }));

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-3">
          <Camera className="w-5 h-5" />
          Documentation Photos ({photos.length})
        </h3>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PhotoRecord['category'])}
            className="text-xs bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Prendre Photo
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {/* Photos par catégorie */}
      <div className="space-y-6">
        {photosByCategory.map(category => {
          if (category.photos.length === 0) return null;
          
          return (
            <div key={category.value} className="category-section">
              <h4 className={`text-sm font-semibold mb-3 ${
                category.color === 'blue' ? 'text-blue-300' :
                category.color === 'yellow' ? 'text-yellow-300' :
                category.color === 'green' ? 'text-green-300' :
                category.color === 'purple' ? 'text-purple-300' :
                category.color === 'red' ? 'text-red-300' :
                'text-gray-300'
              }`}>
                {category.label} ({category.photos.length})
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.photos.map((photo, index) => (
                  <div key={photo.id} className="relative group cursor-pointer">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${category.label}`}
                      className={`w-full h-24 object-cover rounded-lg border-2 ${
                        category.color === 'blue' ? 'border-blue-500/30 hover:border-blue-400' :
                        category.color === 'yellow' ? 'border-yellow-500/30 hover:border-yellow-400' :
                        category.color === 'green' ? 'border-green-500/30 hover:border-green-400' :
                        category.color === 'purple' ? 'border-purple-500/30 hover:border-purple-400' :
                        category.color === 'red' ? 'border-red-500/30 hover:border-red-400' :
                        'border-gray-500/30 hover:border-gray-400'
                      } transition-all transform hover:scale-105`}
                      onClick={() => openModal(photo, photos.indexOf(photo))}
                    />
                    
                    {/* Overlay avec infos */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                      <div className="text-white text-xs">
                        <div className="font-medium truncate">{photo.caption || 'Sans description'}</div>
                        <div className="text-slate-300">{new Date(photo.timestamp).toLocaleString()}</div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        {photo.gps_location && (
                          <div className="text-green-300 text-xs">📍 GPS</div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhotoRemove(photo.id);
                          }}
                          className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Badge catégorie */}
                    <div className={`absolute top-1 left-1 text-xs px-2 py-1 ${
                      category.color === 'blue' ? 'bg-blue-600' :
                      category.color === 'yellow' ? 'bg-yellow-600' :
                      category.color === 'green' ? 'bg-green-600' :
                      category.color === 'purple' ? 'bg-purple-600' :
                      category.color === 'red' ? 'bg-red-600' :
                      'bg-gray-600'
                    } text-white rounded-full opacity-90`}>
                      {category.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal carousel avancé */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="max-w-6xl max-h-full p-6 relative w-full">
            <div className="bg-slate-800 rounded-xl p-6 max-h-full overflow-y-auto">
              
              {/* Header modal */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Photo {currentIndex + 1} sur {photos.length}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {categories.find(c => c.value === selectedPhoto.category)?.label}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              {/* Image container */}
              <div className="relative mb-6">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Photo'}
                  className="max-w-full max-h-96 object-contain mx-auto rounded-lg shadow-lg"
                />
                
                {/* Navigation carousel */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => navigatePhoto('prev')}
                      disabled={currentIndex === 0}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => navigatePhoto('next')}
                      disabled={currentIndex === photos.length - 1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Métadonnées détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-slate-400">📅 Date:</span>
                    <span className="text-white ml-2">{new Date(selectedPhoto.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-slate-400">👤 Prise par:</span>
                    <span className="text-white ml-2">{selectedPhoto.taken_by}</span>
                  </div>
                  
                  {selectedPhoto.file_size && (
                    <div className="text-sm">
                      <span className="text-slate-400">💾 Taille:</span>
                      <span className="text-white ml-2">{(selectedPhoto.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {selectedPhoto.gps_location && (
                    <div className="text-sm">
                      <span className="text-slate-400">📍 GPS:</span>
                      <div className="text-white ml-2 font-mono text-xs">
                        <div>Lat: {selectedPhoto.gps_location.lat.toFixed(6)}</div>
                        <div>Lng: {selectedPhoto.gps_location.lng.toFixed(6)}</div>
                        {selectedPhoto.gps_location.accuracy && (
                          <div>Précision: ±{selectedPhoto.gps_location.accuracy.toFixed(0)}m</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedPhoto.file_name && (
                    <div className="text-sm">
                      <span className="text-slate-400">📄 Fichier:</span>
                      <span className="text-white ml-2 text-xs">{selectedPhoto.file_name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description éditable */}
              <div className="space-y-3">
                <label className="block text-slate-400 text-sm font-medium">
                  📝 Description / Notes:
                </label>
                <textarea
                  placeholder="Ajouter une description détaillée de cette photo..."
                  value={selectedPhoto.caption}
                  onChange={(e) => updatePhotoCaption(e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT PERSONNEL AVANCÉ ===================
const AdvancedPersonnelManager: React.FC<{
  personnel: PersonnelEntry[];
  onPersonnelChange: (personnel: PersonnelEntry[]) => void;
  texts: any;
  minAge: number;
  regulations: any;
}> = ({ personnel, onPersonnelChange, texts, minAge, regulations }) => {
  
  const addPerson = (role: PersonnelEntry['role']) => {
    const newPerson: PersonnelEntry = {
      id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      role,
      company: '',
      phone: '',
      age: 18,
      employee_id: '',
      certification: '',
      certification_expiry: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      formation_espace_clos: false,
      formation_sauvetage: false,
      formation_premiers_soins: false,
      formation_superviseur: role === 'supervisor',
      training_declaration: false,
      age_declaration: false,
      is_inside: false,
      entry_exit_history: []
    };
    onPersonnelChange([...personnel, newPerson]);
  };

  const updatePerson = (id: string, field: keyof PersonnelEntry, value: any) => {
    const updated = personnel.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    );
    onPersonnelChange(updated);
  };

  const removePerson = (id: string) => {
    onPersonnelChange(personnel.filter(p => p.id !== id));
  };

  const recordEntryExit = (id: string, type: 'entry' | 'exit', authorizedBy: string = 'Superviseur') => {
    const now = new Date().toISOString();
    const person = personnel.find(p => p.id === id);
    if (!person) return;

    const historyEntry = {
      type,
      timestamp: now,
      authorized_by: authorizedBy
    };

    if (type === 'entry') {
      updatePerson(id, 'entry_time', now);
      updatePerson(id, 'is_inside', true);
    } else {
      updatePerson(id, 'exit_time', now);
      updatePerson(id, 'is_inside', false);
    }

    const newHistory = [...person.entry_exit_history, historyEntry];
    updatePerson(id, 'entry_exit_history', newHistory);
  };

  const canSign = (person: PersonnelEntry) => {
    const baseRequirements = 
      person.name.trim() && 
      person.company.trim() && 
      person.phone.trim() && 
      person.age >= minAge &&
      person.age_declaration &&
      person.training_declaration &&
      person.formation_espace_clos &&
      person.formation_premiers_soins;

    if (person.role === 'attendant') {
      return baseRequirements && person.formation_sauvetage;
    }
    
    if (person.role === 'supervisor') {
      return baseRequirements && person.formation_superviseur;
    }
    
    return baseRequirements;
  };

  const getRequiredFormations = (role: PersonnelEntry['role']) => {
    const base = [
      { key: 'formation_espace_clos', label: 'Formation Espace Clos', required: true },
      { key: 'formation_premiers_soins', label: 'Premiers Soins/RCR', required: true }
    ];

    if (role === 'attendant') {
      base.push({ key: 'formation_sauvetage', label: 'Formation Sauvetage', required: true });
    }
    
    if (role === 'supervisor') {
      base.push({ key: 'formation_superviseur', label: 'Formation Superviseur', required: true });
    }

    return base;
  };

  const entrants = personnel.filter(p => p.role === 'entrant');
  const attendants = personnel.filter(p => p.role === 'attendant');
  const supervisors = personnel.filter(p => p.role === 'supervisor');

  const PersonCard: React.FC<{ person: PersonnelEntry; borderColor: string; icon: React.ReactNode }> = ({ person, borderColor, icon }) => (
    <div className={`bg-slate-800 rounded-xl p-6 border border-slate-700 border-l-4 ${borderColor} mb-6`}>
      
      {/* Header avec statut */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h4 className="text-white font-semibold">{person.name || `${person.role} sans nom`}</h4>
            <p className="text-slate-400 text-sm">{person.company || 'Compagnie non spécifiée'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            person.is_inside 
              ? 'bg-red-900/50 border border-red-500 text-red-200' 
              : 'bg-green-900/50 border border-green-500 text-green-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${person.is_inside ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
            {person.is_inside ? '🔴 À L\'INTÉRIEUR' : '🟢 À L\'EXTÉRIEUR'}
          </div>
          
          <button
            onClick={() => removePerson(person.id)}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors text-xs p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nom complet *"
          value={person.name}
          onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="Compagnie *"
          value={person.company}
          onChange={(e) => updatePerson(person.id, 'company', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Téléphone *"
          value={person.phone}
          onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="number"
          placeholder={`Âge (min ${minAge}) *`}
          value={person.age || ''}
          onChange={(e) => updatePerson(person.id, 'age', parseInt(e.target.value) || 18)}
          className={`bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${person.age && person.age < minAge ? 'border-red-500' : ''}`}
          min={minAge}
          required
        />
        <input
          type="text"
          placeholder="ID Employé"
          value={person.employee_id}
          onChange={(e) => updatePerson(person.id, 'employee_id', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Certification"
          value={person.certification}
          onChange={(e) => updatePerson(person.id, 'certification', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="date"
          placeholder="Expiration"
          value={person.certification_expiry}
          onChange={(e) => updatePerson(person.id, 'certification_expiry', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Contacts d'urgence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Contact d'urgence - Nom *"
          value={person.emergency_contact_name}
          onChange={(e) => updatePerson(person.id, 'emergency_contact_name', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Contact d'urgence - Téléphone *"
          value={person.emergency_contact_phone}
          onChange={(e) => updatePerson(person.id, 'emergency_contact_phone', e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Formations spécifiques au rôle */}
      <div className={`rounded-lg p-4 mb-4 ${
        person.role === 'entrant' ? 'bg-blue-900/20 border border-blue-500/30' :
        person.role === 'attendant' ? 'bg-yellow-900/20 border border-yellow-500/30' :
        'bg-green-900/20 border border-green-500/30'
      }`}>
        <h4 className={`font-semibold mb-3 ${
          person.role === 'entrant' ? 'text-blue-300' :
          person.role === 'attendant' ? 'text-yellow-300' :
          'text-green-300'
        }`}>
          Formations Obligatoires - {person.role === 'entrant' ? 'Entrant' : person.role === 'attendant' ? 'Surveillant' : 'Superviseur'}
        </h4>
        
        <div className="space-y-3">
          {getRequiredFormations(person.role).map(formation => (
            <label key={formation.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={person[formation.key as keyof PersonnelEntry] as boolean}
                onChange={(e) => updatePerson(person.id, formation.key as keyof PersonnelEntry, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-white text-sm">
                {formation.label} {formation.required && '*'}
              </span>
            </label>
          ))}
          
          {/* Déclarations obligatoires */}
          <div className="border-t border-slate-600 pt-3 mt-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={person.age_declaration}
                onChange={(e) => updatePerson(person.id, 'age_declaration', e.target.checked)}
                className="w-4 h-4 mt-1"
              />
              <span className="text-orange-200 text-sm font-medium">
                Je déclare avoir {minAge} ans ou plus (Obligatoire) *
              </span>
            </label>
            
            <label className="flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                checked={person.training_declaration}
                onChange={(e) => updatePerson(person.id, 'training_declaration', e.target.checked)}
                className="w-4 h-4 mt-1"
              />
              <span className="text-green-200 text-sm font-medium">
                Je déclare que mes formations sont à jour et conformes aux exigences réglementaires {regulations.code} *
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Contrôles entrée/sortie avec historique */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-white font-medium">Contrôle Entrée/Sortie</h5>
          
          <div className="flex gap-2">
            <button
              onClick={() => recordEntryExit(person.id, 'entry')}
              disabled={person.is_inside || !canSign(person)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all text-xs px-3 py-2 disabled:opacity-50 flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              📥 Entrée
            </button>
            
            <button
              onClick={() => recordEntryExit(person.id, 'exit')}
              disabled={!person.is_inside}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all text-xs px-3 py-2 disabled:opacity-50 flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              📤 Sortie
            </button>
          </div>
        </div>

        {/* Historique horodaté */}
        {person.entry_exit_history.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <h6 className="text-slate-400 text-xs font-medium">Historique:</h6>
            {person.entry_exit_history.slice(-5).reverse().map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  entry.type === 'entry' 
                    ? 'bg-red-900/20 border border-red-500/30' 
                    : 'bg-green-900/20 border border-green-500/30'
                }`}
              >
                <span className={entry.type === 'entry' ? 'text-red-300' : 'text-green-300'}>
                  {entry.type === 'entry' ? '📥 Entrée' : '📤 Sortie'} - Autorisé par {entry.authorized_by}
                </span>
                <span className={`font-mono ${entry.type === 'entry' ? 'text-red-200' : 'text-green-200'}`}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature électronique */}
      <div className="mt-4">
        {!canSign(person) && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
            ⚠️ <strong>Signature bloquée:</strong> Complétez toutes les informations obligatoires (*) et cochez toutes les formations requises.
          </div>
        )}
        
        {person.signature ? (
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-green-300 text-sm font-medium">
                ✅ Signé par {person.name} - {person.signature_timestamp ? new Date(person.signature_timestamp).toLocaleString() : 'Date inconnue'}
              </div>
              <button
                onClick={() => {
                  updatePerson(person.id, 'signature', undefined);
                  updatePerson(person.id, 'signature_timestamp', undefined);
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                🗑️ Effacer signature
              </button>
            </div>
            <img src={person.signature} alt="Signature" className="max-h-20 border border-slate-600 rounded" />
          </div>
        ) : (
          canSign(person) && (
            <SignatureCanvas
              onSave={(signature) => {
                updatePerson(person.id, 'signature', signature);
                updatePerson(person.id, 'signature_timestamp', new Date().toISOString());
              }}
              personName={person.name || person.role}
              width={350}
              height={100}
            />
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* ENTRANTS */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            <User className="w-5 h-5" />
            Entrants ({entrants.length})
          </h3>
          <button
            onClick={() => addPerson('entrant')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {texts.addEntrant}
          </button>
        </div>

        {entrants.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucun entrant ajouté. Cliquez sur "Ajouter Entrant" pour commencer.
          </div>
        ) : (
          entrants.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              borderColor="border-blue-500"
              icon={<User className="w-5 h-5 text-blue-400" />}
            />
          ))
        )}
      </div>

      {/* SURVEILLANTS */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            <UserCheck className="w-5 h-5" />
            Surveillants ({attendants.length}) - Communication Bidirectionnelle Obligatoire
          </h3>
          <button
            onClick={() => addPerson('attendant')}
            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {texts.addAttendant}
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
          ⚠️ <strong>Exigence réglementaire:</strong> Un surveillant qualifié doit être présent en permanence et maintenir une communication bidirectionnelle avec les entrants.
        </div>

        {attendants.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucun surveillant ajouté. Au moins un surveillant est OBLIGATOIRE selon {regulations.code}.
          </div>
        ) : (
          attendants.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              borderColor="border-yellow-500"
              icon={<UserCheck className="w-5 h-5 text-yellow-400" />}
            />
          ))
        )}
      </div>

      {/* SUPERVISEURS */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            <Shield className="w-5 h-5" />
            Superviseur d'Entrée ({supervisors.length})
          </h3>
          {supervisors.length === 0 && (
            <button
              onClick={() => addPerson('supervisor')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {texts.addSupervisor}
            </button>
          )}
        </div>

        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
          ℹ️ <strong>Rôle du superviseur:</strong> Autoriser l'entrée, valider la conformité du permis et les conditions de sécurité avant le début des travaux.
        </div>

        {supervisors.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucun superviseur désigné. Un superviseur d'entrée est fortement recommandé.
          </div>
        ) : (
          supervisors.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              borderColor="border-green-500"
              icon={<Shield className="w-5 h-5 text-green-400" />}
            />
          ))
        )}
      </div>
    </div>
  );
};

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
  const [permitData, setPermitData] = useState({
    permit_number: initialData?.permit_number || `CS-${province}-${Date.now().toString().slice(-6)}`,
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

  // Validation des limites atmosphériques
  const validateAtmosphericValue = (type: keyof typeof regulations.atmospheric_testing.limits, value: number) => {
    const limits = regulations.atmospheric_testing.limits[type];
    
    if (type === 'oxygen') {
      if (value <= limits.critical_low || value >= (limits.critical_high || 25)) return 'danger';
      if (value < limits.min || value > limits.max) return 'warning';
    } else {
      if (value >= limits.critical) return 'danger';
      if (value > limits.max) return 'warning';
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
    // Validation des champs obligatoires
    if (!manualReading.oxygen || !manualReading.lel || !manualReading.h2s || !manualReading.co) {
      alert('⚠️ Veuillez saisir toutes les valeurs obligatoires (O₂, LEL, H₂S, CO)');
      return;
    }

    const oxygen = parseFloat(manualReading.oxygen);
    const lel = parseFloat(manualReading.lel);
    const h2s = parseFloat(manualReading.h2s);
    const co = parseFloat(manualReading.co);

    // Validation des plages
    if (oxygen < 0 || oxygen > 30 || lel < 0 || lel > 100 || h2s < 0 || h2s > 1000 || co < 0 || co > 1000) {
      alert('⚠️ Valeurs hors plage acceptable. Vérifiez vos mesures.');
      return;
    }

    // Détermination du statut global
    const oxygenStatus = validateAtmosphericValue('oxygen', oxygen);
    const lelStatus = validateAtmosphericValue('lel', lel);
    const h2sStatus = validateAtmosphericValue('h2s', h2s);
    const coStatus = validateAtmosphericValue('co', co);

    const statuses = [oxygenStatus, lelStatus, h2sStatus, coStatus];
    const overallStatus: 'safe' | 'warning' | 'danger' = 
      statuses.includes('danger') ? 'danger' :
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

    // Reset du formulaire
    setManualReading({ 
      oxygen: '', 
      lel: '', 
      h2s: '', 
      co: '', 
      temperature: '', 
      humidity: '',
      notes: ''
    });

    // Alerte si valeurs critiques
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
      new Date().getTime() - new Date(atmosphericReadings[atmosphericReadings.length - 1].timestamp).getTime() < 30 * 60 * 1000; // 30 min
    const lastReadingSafe = atmosphericReadings.length > 0 && 
      atmosphericReadings[atmosphericReadings.length - 1].status === 'safe';

    return hasEntrants && hasAttendants && allSignedOff && hasRecentReading && lastReadingSafe && 
           permitData.site_name && permitData.space_description && permitData.work_description;
  };

  // Rendu des onglets
  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-700">
      {[
        { id: 'site', label: '🏢 Site', icon: <Home className="w-4 h-4" /> },
        { id: 'atmospheric', label: '🌬️ Atmosphère', icon: <Wind className="w-4 h-4" /> },
        { id: 'corrective', label: '🔧 Mesures Correctives', icon: <Activity className="w-4 h-4" /> },
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
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
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
      {/* En-tête du permis */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{texts.title}</h2>
            <p className="text-slate-400 mb-4">{texts.subtitle}</p>
            <div className="text-sm text-blue-300">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                Réglementation: {regulations.code}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Autorité: {regulations.authority} - {regulations.authority_phone}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">N° Permis</label>
                <input
                  type="text"
                  value={permitData.permit_number}
                  onChange={(e) => setPermitData(prev => ({ ...prev, permit_number: e.target.value }))}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Province</label>
                <select
                  value={province}
                  onChange={() => {}} // Contrôlé par le parent
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                  disabled
                >
                  <option value={province}>{regulations.name}</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_date: e.target.value }))}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, issue_time: e.target.value }))}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Date d'expiration</label>
                <input
                  type="date"
                  value={permitData.expiry_date}
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Heure d'expiration</label>
                <input
                  type="time"
                  value={permitData.expiry_time}
                  onChange={(e) => setPermitData(prev => ({ ...prev, expiry_time: e.target.value }))}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du site */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <MapPin className="w-5 h-5" />
          {texts.siteIdentification}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Nom du site *</label>
              <input
                type="text"
                placeholder="Ex: Usine Pétrochimique Nord"
                value={permitData.site_name}
                onChange={(e) => setPermitData(prev => ({ ...prev, site_name: e.target.value }))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Adresse complète</label>
              <input
                type="text"
                placeholder="Ex: 123 Rue Industrielle, Ville, Province, Code postal"
                value={permitData.site_address}
                onChange={(e) => setPermitData(prev => ({ ...prev, site_address: e.target.value }))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Localisation précise de l'espace clos *</label>
            <input
              type="text"
              placeholder="Ex: Réservoir T-101, Niveau sous-sol, Section B"
              value={permitData.space_location}
              onChange={(e) => setPermitData(prev => ({ ...prev, space_location: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Description de l'espace clos *</label>
            <textarea
              placeholder="Ex: Réservoir cylindrique de 5m de diamètre et 8m de hauteur, utilisé pour stockage de produits chimiques"
              value={permitData.space_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, space_description: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Description des travaux à effectuer *</label>
            <textarea
              placeholder="Ex: Inspection visuelle, nettoyage des parois, réparation de soudures, maintenance préventive"
              value={permitData.work_description}
              onChange={(e) => setPermitData(prev => ({ ...prev, work_description: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Plan de sauvetage et procédures d'urgence *</label>
            <textarea
              placeholder="Ex: Équipe de sauvetage sur site, équipements de levage disponibles, procédure d'évacuation, contacts d'urgence"
              value={permitData.rescue_plan}
              onChange={(e) => setPermitData(prev => ({ ...prev, rescue_plan: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Conditions spéciales et précautions additionnelles</label>
            <textarea
              placeholder="Ex: Port d'équipements de protection spéciaux, surveillance médicale, restrictions d'accès"
              value={permitData.special_conditions}
              onChange={(e) => setPermitData(prev => ({ ...prev, special_conditions: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu section atmosphérique
  const renderAtmosphericSection = () => (
    <div className="space-y-6">
      {/* Limites réglementaires */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <Shield className="w-5 h-5" />
          Limites Réglementaires - {regulations.name}
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(regulations.atmospheric_testing.limits).map(([gas, limits]) => (
            <div key={gas} className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">
                {gas === 'oxygen' ? '🫁 O₂' : 
                 gas === 'lel' ? '🔥 LEL' : 
                 gas === 'h2s' ? '☠️ H₂S' : 
                 '💨 CO'}
              </h4>
              <div className="space-y-1 text-sm">
                {gas === 'oxygen' ? (
                  <>
                    <div className="text-green-300">✅ {limits.min}-{limits.max}%</div>
                    <div className="text-red-300">🚨 ≤{limits.critical_low}% ou ≥{limits.critical_high}%</div>
                  </>
                ) : (
                  <>
                    <div className="text-green-300">✅ ≤{limits.max} ppm</div>
                    <div className="text-red-300">🚨 ≥{limits.critical} ppm</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
          ℹ️ <strong>Fréquence des tests:</strong> Obligatoire chaque {regulations.atmospheric_testing.frequency_minutes} minutes selon {regulations.code}
        </div>
      </div>

      {/* Timer de retest critique */}
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

      {/* Formulaire de saisie manuelle */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <Activity className="w-5 h-5" />
          Nouvelle Mesure Atmosphérique
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">O₂ (%) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              placeholder="20.9"
              value={manualReading.oxygen}
              onChange={(e) => setManualReading(prev => ({ ...prev, oxygen: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">LEL (%) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0"
              value={manualReading.lel}
              onChange={(e) => setManualReading(prev => ({ ...prev, lel: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">H₂S (ppm) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1000"
              placeholder="0"
              value={manualReading.h2s}
              onChange={(e) => setManualReading(prev => ({ ...prev, h2s: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">CO (ppm) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1000"
              placeholder="0"
              value={manualReading.co}
              onChange={(e) => setManualReading(prev => ({ ...prev, co: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Température (°C)</label>
            <input
              type="number"
              step="0.1"
              placeholder="20"
              value={manualReading.temperature}
              onChange={(e) => setManualReading(prev => ({ ...prev, temperature: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Humidité (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="50"
              value={manualReading.humidity}
              onChange={(e) => setManualReading(prev => ({ ...prev, humidity: e.target.value }))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addManualReading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {texts.addManualReading}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-2">Notes (optionnel)</label>
          <textarea
            placeholder="Observations, conditions particulières, appareil utilisé..."
            value={manualReading.notes}
            onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full placeholder-slate-400"
            rows={2}
          />
        </div>
      </div>

      {/* Historique des mesures */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <FileText className="w-5 h-5" />
          Historique des Mesures ({atmosphericReadings.length})
        </h3>
        
        {atmosphericReadings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucune mesure enregistrée. Effectuez votre première mesure atmosphérique.
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
                  <div className="text-slate-400 text-sm">
                    {new Date(reading.timestamp).toLocaleString()} - {reading.taken_by}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">O₂:</span>
                    <span className={`ml-2 font-medium ${
                      validateAtmosphericValue('oxygen', reading.oxygen) === 'danger' ? 'text-red-300' :
                      validateAtmosphericValue('oxygen', reading.oxygen) === 'warning' ? 'text-yellow-300' :
                      'text-green-300'
                    }`}>
                      {reading.oxygen}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">LEL:</span>
                    <span className={`ml-2 font-medium ${
                      validateAtmosphericValue('lel', reading.lel) === 'danger' ? 'text-red-300' :
                      validateAtmosphericValue('lel', reading.lel) === 'warning' ? 'text-yellow-300' :
                      'text-green-300'
                    }`}>
                      {reading.lel}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">H₂S:</span>
                    <span className={`ml-2 font-medium ${
                      validateAtmosphericValue('h2s', reading.h2s) === 'danger' ? 'text-red-300' :
                      validateAtmosphericValue('h2s', reading.h2s) === 'warning' ? 'text-yellow-300' :
                      'text-green-300'
                    }`}>
                      {reading.h2s} ppm
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">CO:</span>
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
                  <div className="mt-2 pt-2 border-t border-slate-600 text-sm text-slate-300">
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

  // Rendu section mesures correctives
  const renderCorrectiveMeasuresSection = () => {
    const latestReading = atmosphericReadings[atmosphericReadings.length - 1];
    const hasIssues = latestReading && latestReading.status !== 'safe';
    
    // États pour calcul ventilation
    const [spaceLength, setSpaceLength] = useState('20');
    const [spaceWidth, setSpaceWidth] = useState('10');
    const [spaceHeight, setSpaceHeight] = useState('8');
    const [desiredACH, setDesiredACH] = useState('10');
    
    const ventilationCalc = calculateVentilationRequirements(
      parseFloat(spaceLength) || 20,
      parseFloat(spaceWidth) || 10,
      parseFloat(spaceHeight) || 8,
      parseFloat(desiredACH) || 10
    );

    // Analyse des problèmes détectés
    const getDetectedIssues = () => {
      if (!latestReading) return [];
      
      const issues = [];
      const limits = regulations.atmospheric_testing.limits;
      
      if (latestReading.oxygen < limits.oxygen.min || latestReading.oxygen > limits.oxygen.max) {
        issues.push({
          type: 'oxygen',
          severity: latestReading.oxygen <= limits.oxygen.critical_low || 
                   latestReading.oxygen >= (limits.oxygen.critical_high || 25) ? 'critical' : 'warning',
          value: latestReading.oxygen,
          measures: CORRECTIVE_MEASURES_DATABASE.atmospheric_issues.low_oxygen
        });
      }
      
      if (latestReading.lel > limits.lel.max) {
        issues.push({
          type: 'lel',
          severity: latestReading.lel >= limits.lel.critical ? 'critical' : 'warning',
          value: latestReading.lel,
          measures: CORRECTIVE_MEASURES_DATABASE.atmospheric_issues.high_lel
        });
      }
      
      if (latestReading.h2s > limits.h2s.max || latestReading.co > limits.co.max) {
        issues.push({
          type: 'toxic',
          severity: latestReading.h2s >= limits.h2s.critical || 
                   latestReading.co >= limits.co.critical ? 'critical' : 'warning',
          values: { h2s: latestReading.h2s, co: latestReading.co },
          measures: CORRECTIVE_MEASURES_DATABASE.atmospheric_issues.toxic_gases
        });
      }
      
      return issues;
    };

    const detectedIssues = getDetectedIssues();

    return (
      <div className="space-y-6">
        
        {/* Section calcul ventilation */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Wind className="w-5 h-5" />
            Calcul des Exigences de Ventilation
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-blue-300">Dimensions de l'Espace Clos</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Longueur (pieds)</label>
                  <input
                    type="number"
                    value={spaceLength}
                    onChange={(e) => setSpaceLength(e.target.value)}
                    className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Largeur (pieds)</label>
                  <input
                    type="number"
                    value={spaceWidth}
                    onChange={(e) => setSpaceWidth(e.target.value)}
                    className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Hauteur (pieds)</label>
                  <input
                    type="number"
                    value={spaceHeight}
                    onChange={(e) => setSpaceHeight(e.target.value)}
                    className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Changements d'air souhaités/heure (ACH)</label>
                <select
                  value={desiredACH}
                  onChange={(e) => setDesiredACH(e.target.value)}
                  className="bg-slate-700 text-white border border-slate-600 rounded-lg p-3 w-full"
                >
                  <option value="6">6 ACH - Espace normal, air propre</option>
                  <option value="8">8 ACH - Présence légère de contaminants</option>
                  <option value="10">10 ACH - Standard espace clos (recommandé)</option>
                  <option value="12">12 ACH - Présence modérée de toxiques</option>
                  <option value="15">15 ACH - Travail à chaud, soudage</option>
                  <option value="20">20 ACH - Atmosphère explosive ou très toxique</option>
                </select>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="font-medium text-green-300 mb-3">📊 Résultats de Calcul</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume total:</span>
                  <span className="text-white font-mono">{ventilationCalc.volume.toLocaleString()} pi³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CFM de base:</span>
                  <span className="text-white font-mono">{ventilationCalc.baseCFM} CFM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CFM final (+25%):</span>
                  <span className="text-green-300 font-mono font-bold">{ventilationCalc.finalCFM} CFM</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <div className="text-blue-200 text-sm">
                  <strong>📋 Recommandation:</strong><br />
                  {ventilationCalc.recommendation}
                </div>
              </div>
              
              <div className="mt-3 text-xs text-slate-400">
                <strong>Formule:</strong> CFM = (L × W × H × ACH) ÷ 60<br />
                <strong>Marge sécurité:</strong> +25% pour résistance conduits
              </div>
            </div>
          </div>
        </div>

        {/* Problèmes détectés et mesures correctives */}
        {detectedIssues.length > 0 && (
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6">
            <h3 className="text-red-300 font-bold text-lg mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              🚨 PROBLÈMES ATMOSPHÉRIQUES DÉTECTÉS - MESURES CORRECTIVES REQUISES
            </h3>
            
            {detectedIssues.map((issue, index) => (
              <div key={index} className="mb-6 bg-slate-800/50 rounded-lg p-4">
                <div className={`font-semibold mb-3 ${
                  issue.severity === 'critical' ? 'text-red-300' : 'text-yellow-300'
                }`}>
                  {issue.severity === 'critical' ? '🚨 CRITIQUE' : '⚠️ ATTENTION'}: {issue.measures.condition}
                </div>
                
                {/* Actions immédiates */}
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Actions Immédiates:</h4>
                  <ul className="space-y-1">
                    {issue.measures.immediate_actions.map((action, idx) => (
                      <li key={idx} className="text-red-200 text-sm flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Mesures correctives */}
                <div>
                  <h4 className="text-white font-medium mb-3">Mesures Correctives Recommandées:</h4>
                  {issue.measures.corrective_measures.map((measure, idx) => (
                    <div key={idx} className="mb-4 bg-slate-700/50 rounded-lg p-3">
                      <h5 className="text-blue-300 font-medium mb-2">{measure.type}</h5>
                      <p className="text-slate-300 text-sm mb-2">{measure.description}</p>
                      
                      {measure.specifications && (
                        <div className="bg-slate-900/50 rounded p-3 text-sm">
                          <div className="text-green-300 font-medium mb-1">Spécifications techniques:</div>
                          {Object.entries(measure.specifications).map(([key, value]) => (
                            <div key={key} className="text-slate-300">
                              <strong>{key.replace('_', ' ')}:</strong> {value}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {measure.equipment && (
                        <div className="mt-2">
                          <div className="text-purple-300 font-medium mb-1">Équipements requis:</div>
                          <ul className="text-slate-300 text-sm space-y-1">
                            {measure.equipment.map((item, eqIdx) => (
                              <li key={eqIdx} className="flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {measure.methods && (
                        <div className="mt-2">
                          <div className="text-orange-300 font-medium mb-1">Méthodes:</div>
                          <ul className="text-slate-300 text-sm space-y-1">
                            {measure.methods.map((method, mIdx) => (
                              <li key={mIdx} className="flex items-start gap-2">
                                <span className="text-orange-400">•</span>
                                {method}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {measure.warning && (
                        <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                          {measure.warning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Systèmes de ventilation recommandés */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Wind className="w-5 h-5" />
            Systèmes de Ventilation Recommandés
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CORRECTIVE_MEASURES_DATABASE.ventilation_systems.mechanical_ventilation.types.map((system, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-2">{system.name}</h4>
                <p className="text-slate-300 text-sm mb-3">{system.usage}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">Calcul CFM:</span>
                    <span className="text-white ml-2 font-mono">{system.cfm_calc}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Placement:</span>
                    <span className="text-white ml-2">{system.placement}</span>
                  </div>
                  {system.advantage && (
                    <div className="text-green-300 text-sm">
                      ✓ {system.advantage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-3">🛠️ Spécifications Équipements</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-medium mb-2">Ventilateurs:</h5>
                <ul className="space-y-1 text-sm text-slate-300">
                  {CORRECTIVE_MEASURES_DATABASE.ventilation_systems.mechanical_ventilation.equipment_specs.fans.map((fan, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {fan}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-2">Conduits:</h5>
                <ul className="space-y-1 text-sm text-slate-300">
                  {CORRECTIVE_MEASURES_DATABASE.ventilation_systems.mechanical_ventilation.equipment_specs.ducting.map((duct, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {duct}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Surveillance continue */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Activity className="w-5 h-5" />
            Surveillance et Monitoring Continu
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-green-300 font-semibold mb-3">Monitoring Continu (Obligatoire)</h4>
              
              <div className="space-y-3">
                <div>
                  <h5 className="text-white font-medium mb-2">Équipements requis:</h5>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {CORRECTIVE_MEASURES_DATABASE.monitoring_systems.continuous_monitoring.equipment.map((eq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {eq}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-medium mb-2">Seuils d'alarme:</h5>
                  <div className="space-y-1 text-sm">
                    {Object.entries(CORRECTIVE_MEASURES_DATABASE.monitoring_systems.continuous_monitoring.alarm_settings).map(([gas, settings]) => (
                      <div key={gas} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{gas}:</span>
                        <span className="text-white font-mono">{settings}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-yellow-300 font-semibold mb-3">Procédures d'Urgence</h4>
              
              <div className="space-y-3">
                <div>
                  <h5 className="text-white font-medium mb-2">Panne de ventilation:</h5>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {CORRECTIVE_MEASURES_DATABASE.emergency_procedures.ventilation_failure.immediate_response.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">{step.split('.')[0]}.</span>
                        <span>{step.split('.').slice(1).join('.')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-medium mb-2">Systèmes de secours:</h5>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {CORRECTIVE_MEASURES_DATABASE.emergency_procedures.ventilation_failure.backup_systems.map((system, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {system}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exigences réglementaires */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <Shield className="w-5 h-5" />
            Exigences Réglementaires - {regulations.name}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">🌬️ Ventilation</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <div>• Continue pendant présence entrants</div>
                <div>• Tests chaque {regulations.atmospheric_testing.frequency_minutes} min</div>
                <div>• Alarme défaillance obligatoire</div>
                <div>• Backup système requis</div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-yellow-300 font-medium mb-2">👁️ Surveillance</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <div>• Surveillant qualifié obligatoire</div>
                <div>• Communication bidirectionnelle</div>
                <div>• Monitoring atmosphérique continu</div>
                <div>• Procédures sauvetage définies</div>
              </div>
            </div>
            
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2">📋 Documentation</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <div>• Permis d'entrée valide</div>
                <div>• Plan de sauvetage écrit</div>
                <div>• Formation personnel documentée</div>
                <div>• Registre interventions tenu</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-sm text-slate-300">
            <strong>Référence légale:</strong> {regulations.code}<br />
            <strong>Autorité:</strong> {regulations.authority}<br />
            <strong>Contact urgence:</strong> {regulations.authority_phone}
          </div>
        </div>
      </div>
    );
  };
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          <Phone className="w-5 h-5" />
          {texts.emergencyContacts} - {regulations.name}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {regulations.emergency_contacts.map((contact: EmergencyContact, index: number) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              contact.name === '911' ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-blue-900/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{contact.name}</h4>
                {contact.available_24h && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">24h/7j</span>
                )}
              </div>
              <p className="text-slate-300 text-sm mb-2">{contact.role}</p>
              <a href={`tel:${contact.phone}`} className="text-blue-400 hover:text-blue-300 font-mono text-lg">
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 min-h-screen">
      {/* En-tête avec statut global */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{texts.title}</h1>
            <p className="text-slate-400">{texts.subtitle}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            isPermitValid() 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        </div>
        
        {/* Boutons d'urgence */}
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

      {/* Navigation par onglets */}
      {renderTabs()}

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 min-h-screen">
      {/* En-tête avec statut global */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{texts.title}</h1>
            <p className="text-slate-400">{texts.subtitle}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            isPermitValid() 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            {isPermitValid() ? '✅ Permis Valide' : '⚠️ Permis Incomplet'}
          </div>
        </div>
        
        {/* Boutons d'urgence */}
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

      {/* Navigation par onglets */}
      {renderTabs()}

      {/* Contenu selon l'onglet actif */}
      <div className="space-y-8">
        {activeTab === 'site' && renderSiteSection()}
        {activeTab === 'atmospheric' && renderAtmosphericSection()}
        {activeTab === 'corrective' && renderCorrectiveMeasuresSection()}
        {activeTab === 'personnel' && (
          <AdvancedPersonnelManager
            personnel={personnel}
            onPersonnelChange={setPersonnel}
            texts={texts}
            minAge={regulations.personnel_requirements.min_age}
            regulations={regulations}
          />
        )}
        {activeTab === 'photos' && (
          <AdvancedPhotoGallery
            photos={photos}
            onPhotoAdd={(photo) => setPhotos(prev => [...prev, photo])}
            onPhotoRemove={(photoId) => setPhotos(prev => prev.filter(p => p.id !== photoId))}
            onPhotoUpdate={(photoId, updates) => 
              setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updates } : p))
            }
          />
        )}
        {activeTab === 'emergency' && renderEmergencySection()}
      </div>
    </div>
  );
};
