// =================== COMPONENTS/FORMS/IDENTIFICATIONSECTION.TSX - SECTION IDENTIFICATION MOBILE-FIRST ===================
// Section identification avec géolocalisation, auto-complétion et validation temps réel mobile

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  Building, 
  Users, 
  AlertCircle,
  CheckCircle,
  Navigation,
  Camera,
  Mic,
  MicOff,
  Volume2,
  X,
  Plus,
  Edit3,
  Save,
  Loader2
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export interface PermitFormData {
  type?: PermitType;
  name?: string;
  location?: string | LocationData;
  site?: string;
  secteur?: string;
  description?: string;
  [key: string]: any;
}

export interface FieldError {
  message: { fr: string; en: string };
  code: string;
}

export interface LocationData {
  address: string;
  coordinates?: { lat: number; lng: number };
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  type?: string;
}

export interface SiteData {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

// =================== INTERFACES SECTION ===================
interface IdentificationSectionProps {
  data: Partial<PermitFormData>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, FieldError>;
  language: 'fr' | 'en';
  touchOptimized?: boolean;
  enableVoiceInput?: boolean;
  enableLocationServices?: boolean;
  enablePhotoCapture?: boolean;
}

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: 'building' | 'site' | 'area' | 'equipment';
  confidence: number;
}

interface VoiceInputState {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

// =================== CONFIGURATION OPTIONS PERMIS ===================
const PERMIT_DROPDOWN_OPTIONS = [
  {
    value: 'espace-clos' as PermitType,
    label: { fr: 'Espace clos', en: 'Confined space' },
    estimatedDuration: 45,
    requiredPersonnel: ['supervisor', 'attendant', 'entrant']
  },
  {
    value: 'travail-chaud' as PermitType,
    label: { fr: 'Travail à chaud', en: 'Hot work' },
    estimatedDuration: 30,
    requiredPersonnel: ['supervisor', 'fire-watch']
  },
  {
    value: 'excavation' as PermitType,
    label: { fr: 'Excavation', en: 'Excavation' },
    estimatedDuration: 35,
    requiredPersonnel: ['supervisor', 'competent-person']
  },
  {
    value: 'levage' as PermitType,
    label: { fr: 'Levage/Grutage', en: 'Lifting/Crane' },
    estimatedDuration: 50,
    requiredPersonnel: ['lift-director', 'crane-operator', 'signal-person']
  },
  {
    value: 'hauteur' as PermitType,
    label: { fr: 'Travail en hauteur', en: 'Work at height' },
    estimatedDuration: 25,
    requiredPersonnel: ['supervisor', 'qualified-person']
  },
  {
    value: 'isolation-energetique' as PermitType,
    label: { fr: 'Isolation énergétique', en: 'Energy isolation' },
    estimatedDuration: 40,
    requiredPersonnel: ['authorized-person', 'electrician']
  },
  {
    value: 'pression' as PermitType,
    label: { fr: 'Équipement sous pression', en: 'Pressure equipment' },
    estimatedDuration: 55,
    requiredPersonnel: ['pressure-specialist', 'supervisor']
  },
  {
    value: 'radiographie' as PermitType,
    label: { fr: 'Radiographie industrielle', en: 'Industrial radiography' },
    estimatedDuration: 60,
    requiredPersonnel: ['radiation-safety-officer', 'radiographer']
  },
  {
    value: 'toiture' as PermitType,
    label: { fr: 'Travaux de toiture', en: 'Roofing work' },
    estimatedDuration: 30,
    requiredPersonnel: ['supervisor', 'roofer']
  },
  {
    value: 'demolition' as PermitType,
    label: { fr: 'Démolition', en: 'Demolition' },
    estimatedDuration: 70,
    requiredPersonnel: ['demolition-supervisor', 'structural-engineer']
  }
];

// =================== FONCTIONS UTILITAIRES ===================
const generatePermitCode = (type: PermitType, date: Date = new Date()): string => {
  const typeCode = type.toUpperCase().slice(0, 3);
  const dateCode = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${typeCode}-${dateCode}-${randomCode}`;
};

const validatePermitName = (name: string, type: PermitType, language: 'fr' | 'en'): FieldError | null => {
  if (!name || name.trim().length < 3) {
    return {
      message: {
        fr: 'Le nom doit contenir au moins 3 caractères',
        en: 'Name must contain at least 3 characters'
      },
      code: 'NAME_TOO_SHORT'
    };
  }
  return null;
};

const validateLocation = (location: string | LocationData, language: 'fr' | 'en'): FieldError | null => {
  const locationStr = typeof location === 'string' ? location : location?.address || '';
  if (!locationStr || locationStr.trim().length < 5) {
    return {
      message: {
        fr: 'La localisation doit être précisée',
        en: 'Location must be specified'
      },
      code: 'LOCATION_REQUIRED'
    };
  }
  return null;
};

// =================== CONSTANTES SECTION ===================
const PERMIT_TYPES_CONFIG = {
  'espace-clos': {
    icon: '🏠',
    color: '#DC2626',
    description: { 
      fr: 'Espaces confinés avec risques atmosphériques', 
      en: 'Confined spaces with atmospheric hazards' 
    },
    examples: { 
      fr: 'Réservoirs, cuves, égouts, tunnels', 
      en: 'Tanks, vessels, sewers, tunnels' 
    }
  },
  'travail-chaud': {
    icon: '🔥',
    color: '#EA580C',
    description: { 
      fr: 'Travaux générant chaleur, étincelles ou flammes', 
      en: 'Work generating heat, sparks or flames' 
    },
    examples: { 
      fr: 'Soudage, découpage, meulage', 
      en: 'Welding, cutting, grinding' 
    }
  },
  'excavation': {
    icon: '⛏️',
    color: '#A16207',
    description: { 
      fr: 'Excavations et tranchées >1.2m profondeur', 
      en: 'Excavations and trenches >1.2m depth' 
    },
    examples: { 
      fr: 'Fondations, services publics, pipelines', 
      en: 'Foundations, utilities, pipelines' 
    }
  },
  'levage': {
    icon: '🏗️',
    color: '#0369A1',
    description: { 
      fr: 'Opérations de levage mécanisé', 
      en: 'Mechanical lifting operations' 
    },
    examples: { 
      fr: 'Grues mobiles, grues tour, palans', 
      en: 'Mobile cranes, tower cranes, hoists' 
    }
  },
  'hauteur': {
    icon: '🪜',
    color: '#7C2D12',
    description: { 
      fr: 'Travail en hauteur >3m avec risque de chute', 
      en: 'Work at height >3m with fall risk' 
    },
    examples: { 
      fr: 'Toitures, échafaudages, structures', 
      en: 'Roofs, scaffolding, structures' 
    }
  },
  'isolation-energetique': {
    icon: '⚡',
    color: '#7C3AED',
    description: { 
      fr: 'Isolation d\'énergie et LOTO électrique', 
      en: 'Energy isolation and electrical LOTO' 
    },
    examples: { 
      fr: 'Maintenance électrique, équipements', 
      en: 'Electrical maintenance, equipment' 
    }
  },
  'pression': {
    icon: '🔧',
    color: '#059669',
    description: { 
      fr: 'Équipements sous pression et vapeur', 
      en: 'Pressure and steam equipment' 
    },
    examples: { 
      fr: 'Chaudières, autoclaves, compresseurs', 
      en: 'Boilers, autoclaves, compressors' 
    }
  },
  'radiographie': {
    icon: '☢️',
    color: '#BE185D',
    description: { 
      fr: 'Radiographie industrielle avec sources', 
      en: 'Industrial radiography with sources' 
    },
    examples: { 
      fr: 'Contrôle soudures, inspection NDT', 
      en: 'Weld inspection, NDT testing' 
    }
  },
  'toiture': {
    icon: '🏠',
    color: '#1F2937',
    description: { 
      fr: 'Travaux de couverture et toiture', 
      en: 'Roofing and covering work' 
    },
    examples: { 
      fr: 'Installation, réparation, maintenance', 
      en: 'Installation, repair, maintenance' 
    }
  },
  'demolition': {
    icon: '🏗️',
    color: '#991B1B',
    description: { 
      fr: 'Démolition structures et amiante', 
      en: 'Structure demolition and asbestos' 
    },
    examples: { 
      fr: 'Bâtiments, ponts, décontamination', 
      en: 'Buildings, bridges, decontamination' 
    }
  }
};

const SITE_TYPES = {
  'industrial': { 
    fr: 'Site industriel', 
    en: 'Industrial site',
    icon: '🏭',
    color: '#374151'
  },
  'construction': { 
    fr: 'Chantier construction', 
    en: 'Construction site',
    icon: '🚧',
    color: '#F59E0B'
  },
  'commercial': { 
    fr: 'Bâtiment commercial', 
    en: 'Commercial building',
    icon: '🏢',
    color: '#3B82F6'
  },
  'institutional': { 
    fr: 'Institution publique', 
    en: 'Public institution',
    icon: '🏛️',
    color: '#059669'
  },
  'residential': { 
    fr: 'Résidentiel', 
    en: 'Residential',
    icon: '🏠',
    color: '#8B5CF6'
  },
  'utility': { 
    fr: 'Services publics', 
    en: 'Utilities',
    icon: '⚡',
    color: '#DC2626'
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const IdentificationSection: React.FC<IdentificationSectionProps> = ({
  data,
  onChange,
  errors,
  language = 'fr',
  touchOptimized = true,
  enableVoiceInput = false,
  enableLocationServices = true,
  enablePhotoCapture = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [showPermitTypeSelector, setShowPermitTypeSelector] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [voiceInput, setVoiceInput] = useState<VoiceInputState>({
    isActive: false,
    isListening: false,
    transcript: '',
    confidence: 0
  });
  const [currentLocationField, setCurrentLocationField] = useState<string | null>(null);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  
  // Refs pour gestion mobile
  const permitTypeRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<SpeechRecognition | null>(null);

  // =================== GÉOLOCALISATION MOBILE ===================
  const getCurrentLocation = useCallback(async () => {
    if (!enableLocationServices || !navigator.geolocation) return;

    setIsLoadingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Mock reverse geocoding pour obtenir adresse
      const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} - Sherbrooke, QC`;
      
      const locationData: LocationData = {
        address: mockAddress,
        coordinates: { lat: latitude, lng: longitude },
        city: 'Sherbrooke',
        province: 'QC',
        postalCode: 'J1K 2R1',
        country: 'Canada'
      };
      
      onChange('location', locationData);
      
      // Feedback haptic succès
      if (navigator.vibrate) {
        navigator.vibrate([50, 25, 50]);
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }, [enableLocationServices, onChange]);

  // =================== VOICE INPUT MOBILE ===================
  const startVoiceInput = useCallback((fieldName: string) => {
    if (!enableVoiceInput || !('webkitSpeechRecognition' in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'fr' ? 'fr-CA' : 'en-CA';

    recognition.onstart = () => {
      setVoiceInput(prev => ({
        ...prev,
        isActive: true,
        isListening: true,
        transcript: '',
        error: undefined
      }));
      setCurrentLocationField(fieldName);
      
      // Feedback haptic début
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let confidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        confidence = result[0].confidence;
      }
      
      setVoiceInput(prev => ({
        ...prev,
        transcript,
        confidence
      }));
      
      // Appliquer transcription si final
      if (event.results[event.resultIndex].isFinal) {
        onChange(fieldName, transcript.trim());
        stopVoiceInput();
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceInput(prev => ({
        ...prev,
        error: event.error,
        isListening: false
      }));
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    recognition.onend = () => {
      stopVoiceInput();
    };

    recognition.start();
    voiceRecognitionRef.current = recognition;
  }, [enableVoiceInput, language, onChange]);

  const stopVoiceInput = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      voiceRecognitionRef.current = null;
    }
    
    setVoiceInput({
      isActive: false,
      isListening: false,
      transcript: '',
      confidence: 0
    });
    setCurrentLocationField(null);
    
    // Feedback haptic fin
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, []);

  // =================== RECHERCHE SUGGESTIONS LOCATION ===================
  const searchLocationSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      // Simulation API suggestions - Remplacer par vraie API
      const mockSuggestions: LocationSuggestion[] = [
        {
          id: '1',
          name: `${query} - Secteur A`,
          address: `123 Rue ${query}, Sherbrooke, QC`,
          coordinates: { lat: 45.4042, lng: -71.8929 },
          type: 'building',
          confidence: 0.95
        },
        {
          id: '2',
          name: `${query} - Zone industrielle`,
          address: `456 Boulevard ${query}, Sherbrooke, QC`,
          coordinates: { lat: 45.4142, lng: -71.9029 },
          type: 'site',
          confidence: 0.87
        }
      ];
      
      setLocationSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Erreur recherche suggestions:', error);
    }
  }, []);

  // =================== VALIDATION TEMPS RÉEL ===================
  const handleFieldChange = useCallback((field: string, value: any) => {
    onChange(field, value);
    
    // Déclencher suggestions pour location
    if (field === 'location' && typeof value === 'string') {
      searchLocationSuggestions(value);
    }
    
    // Validation temps réel
    setTimeout(() => {
      if (field === 'name') {
        validatePermitName(value, data.type as PermitType, language);
      } else if (field === 'location') {
        validateLocation(value, language);
      }
    }, 500);
  }, [onChange, data.type, language, searchLocationSuggestions]);

  // =================== CLEANUP ===================
  useEffect(() => {
    return () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }
    };
  }, []);

  // =================== RENDU COMPOSANT ===================
  const selectedPermitType = data.type ? PERMIT_TYPES_CONFIG[data.type as PermitType] : null;

  return (
    <div className="space-y-6">
      {/* =================== SÉLECTEUR TYPE PERMIS =================== */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          {language === 'fr' ? 'Type de permis' : 'Permit type'} *
        </label>
        
        <div 
          ref={permitTypeRef}
          onClick={() => setShowPermitTypeSelector(true)}
          className={`
            w-full p-4 border rounded-lg cursor-pointer transition-all
            ${errors.type 
              ? 'border-red-300 bg-red-50' 
              : selectedPermitType 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${touchOptimized ? 'min-h-[44px] active:scale-[0.98]' : ''}
          `}
        >
          {selectedPermitType ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPermitType.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {PERMIT_DROPDOWN_OPTIONS.find(opt => opt.value === data.type)?.label[language]}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedPermitType.description[language]}
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-500">
              <FileText className="w-5 h-5" />
              <span>{language === 'fr' ? 'Sélectionner le type de permis' : 'Select permit type'}</span>
            </div>
          )}
        </div>

        {errors.type && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.type.message[language]}</span>
          </div>
        )}
      </div>

      {/* =================== MODAL SÉLECTEUR TYPE PERMIS =================== */}
      <AnimatePresence>
        {showPermitTypeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowPermitTypeSelector(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'fr' ? 'Sélectionner un type de permis' : 'Select permit type'}
                </h3>
                <button
                  onClick={() => setShowPermitTypeSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Liste types permis */}
              <div className="overflow-y-auto max-h-[60vh]">
                {PERMIT_DROPDOWN_OPTIONS.map((option) => {
                  const config = PERMIT_TYPES_CONFIG[option.value as PermitType];
                  const isSelected = data.type === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleFieldChange('type', option.value);
                        setShowPermitTypeSelector(false);
                        
                        // Feedback haptic sélection
                        if (navigator.vibrate) {
                          navigator.vibrate(25);
                        }
                      }}
                      className={`
                        w-full p-4 text-left border-b border-gray-100 transition-all
                        ${isSelected 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50 active:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 mb-1">
                            {option.label[language]}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {config.description[language]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {language === 'fr' ? 'Exemples: ' : 'Examples: '}{config.examples[language]}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{option.estimatedDuration} min</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>{option.requiredPersonnel.length} {language === 'fr' ? 'rôles' : 'roles'}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== NOM DU PERMIS =================== */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          {language === 'fr' ? 'Nom du permis' : 'Permit name'} *
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={language === 'fr' ? 'ex: Maintenance réservoir A-12' : 'ex: Tank A-12 maintenance'}
            className={`
              w-full p-3 border rounded-lg transition-all
              ${errors.name 
                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${touchOptimized ? 'min-h-[44px] text-[16px]' : ''}
              focus:ring-2 focus:outline-none
            `}
            data-field="name"
          />
          
          {/* Voice input button */}
          {enableVoiceInput && (
            <button
              type="button"
              onClick={() => startVoiceInput('name')}
              disabled={voiceInput.isActive}
              className={`
                absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all
                ${voiceInput.isActive && currentLocationField === 'name'
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {voiceInput.isListening && currentLocationField === 'name' ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <Mic className="w-4 h-4" />
                </div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {errors.name && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.name.message[language]}</span>
          </div>
        )}
      </div>

      {/* =================== LOCALISATION =================== */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          {language === 'fr' ? 'Localisation' : 'Location'} *
        </label>
        
        <div className="relative">
          <input
            ref={locationInputRef}
            type="text"
            value={typeof data.location === 'string' ? data.location : data.location?.address || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder={language === 'fr' ? 'Adresse ou description du lieu' : 'Address or location description'}
            className={`
              w-full p-3 pl-10 border rounded-lg transition-all
              ${errors.location 
                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${touchOptimized ? 'min-h-[44px] text-[16px]' : ''}
              focus:ring-2 focus:outline-none
            `}
            data-field="location"
          />
          
          {/* Icon localisation */}
          <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          
          {/* Boutons actions */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* GPS button */}
            {enableLocationServices && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                title={language === 'fr' ? 'Utiliser ma position' : 'Use my location'}
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Voice input button */}
            {enableVoiceInput && (
              <button
                type="button"
                onClick={() => startVoiceInput('location')}
                disabled={voiceInput.isActive}
                className={`
                  p-2 rounded-lg transition-all
                  ${voiceInput.isActive && currentLocationField === 'location'
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {voiceInput.isListening && currentLocationField === 'location' ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Suggestions localisation */}
        <AnimatePresence>
          {locationSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    onChange('location', {
                      address: suggestion.address,
                      coordinates: suggestion.coordinates,
                      name: suggestion.name,
                      type: suggestion.type
                    });
                    setLocationSuggestions([]);
                    
                    // Feedback haptic sélection
                    if (navigator.vibrate) {
                      navigator.vibrate(25);
                    }
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      {suggestion.type === 'building' && <Building className="w-4 h-4 text-blue-600" />}
                      {suggestion.type === 'site' && <MapPin className="w-4 h-4 text-blue-600" />}
                      {suggestion.type === 'area' && <Search className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {suggestion.address}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                          {Math.round(suggestion.confidence * 100)}% {language === 'fr' ? 'fiable' : 'match'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {errors.location && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.location.message[language]}</span>
          </div>
        )}
      </div>

      {/* =================== SITE ET SECTEUR =================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Site */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            {language === 'fr' ? 'Site' : 'Site'}
          </label>
          
          <input
            type="text"
            value={data.site || ''}
            onChange={(e) => handleFieldChange('site', e.target.value)}
            placeholder={language === 'fr' ? 'ex: Usine Nord' : 'ex: North Plant'}
            className={`
              w-full p-3 border rounded-lg transition-all
              ${errors.site 
                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${touchOptimized ? 'min-h-[44px] text-[16px]' : ''}
              focus:ring-2 focus:outline-none
            `}
            data-field="site"
          />
        </div>

        {/* Secteur */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            {language === 'fr' ? 'Secteur' : 'Sector'}
          </label>
          
          <input
            type="text"
            value={data.secteur || ''}
            onChange={(e) => handleFieldChange('secteur', e.target.value)}
            placeholder={language === 'fr' ? 'ex: Production A' : 'ex: Production A'}
            className={`
              w-full p-3 border rounded-lg transition-all
              ${errors.secteur 
                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${touchOptimized ? 'min-h-[44px] text-[16px]' : ''}
              focus:ring-2 focus:outline-none
            `}
            data-field="secteur"
          />
        </div>
      </div>

      {/* =================== DESCRIPTION =================== */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          {language === 'fr' ? 'Description des travaux' : 'Work description'}
        </label>
        
        <div className="relative">
          <textarea
            value={data.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder={language === 'fr' 
              ? 'Décrivez les travaux à effectuer, les risques identifiés et les mesures de sécurité...' 
              : 'Describe the work to be performed, identified risks and safety measures...'
            }
            rows={4}
            className={`
              w-full p-3 border rounded-lg transition-all resize-none
              ${errors.description 
                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${touchOptimized ? 'text-[16px]' : ''}
              focus:ring-2 focus:outline-none
            `}
            data-field="description"
          />
          
          {/* Voice input button */}
          {enableVoiceInput && (
            <button
              type="button"
              onClick={() => startVoiceInput('description')}
              disabled={voiceInput.isActive}
              className={`
                absolute right-3 top-3 p-2 rounded-lg transition-all
                ${voiceInput.isActive && currentLocationField === 'description'
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {voiceInput.isListening && currentLocationField === 'description' ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* =================== MODAL VOICE INPUT =================== */}
      <AnimatePresence>
        {voiceInput.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {voiceInput.isListening ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-6 bg-red-500 rounded animate-pulse" />
                      <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'fr' ? 'Enregistrement vocal' : 'Voice Recording'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {voiceInput.isListening 
                    ? (language === 'fr' ? 'Parlez maintenant...' : 'Speak now...')
                    : (language === 'fr' ? 'Appuyez pour parler' : 'Tap to speak')
                  }
                </p>
                
                {voiceInput.transcript && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">"{voiceInput.transcript}"</p>
                    {voiceInput.confidence > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(voiceInput.confidence * 100)}% {language === 'fr' ? 'confiance' : 'confidence'}
                      </p>
                    )}
                  </div>
                )}
                
                {voiceInput.error && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600">{voiceInput.error}</p>
                  </div>
                )}
                
                <button
                  onClick={stopVoiceInput}
                  className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  {language === 'fr' ? 'Arrêter' : 'Stop'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default IdentificationSection;
