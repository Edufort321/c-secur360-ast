"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Activity, Shield, Plus, AlertTriangle, FileText, Thermometer,
  Volume2, Gauge, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock
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
  cardTitle: {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: isMobile ? '12px' : '20px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '12px'
  }
};

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface AtmosphericReading {
  id: string;
  timestamp: string;
  level: 'top' | 'middle' | 'bottom'; // Niveaux dans l'espace clos
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

interface LegalAtmosphericData {
  // Tests réglementaires
  initial_testing_completed: boolean;
  continuous_monitoring_required: boolean;
  testing_frequency_minutes: number;    // 30 min QC, 15 min ON, 10 min BC
  
  // Limites légales par province
  provincial_limits: AtmosphericLimits;
  
  // Certification équipements
  gas_detector_calibrated: boolean;
  calibration_date: string;
  calibration_certificate: string;
  
  // Documentation légale
  test_results_signed: boolean;
  qualified_tester_name: string;
  multi_level_testing_completed: boolean;
  atmospheric_stability_confirmed: boolean;
}

interface AtmosphericTestingProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  atmosphericReadings: AtmosphericReading[];
  setAtmosphericReadings: (readings: AtmosphericReading[] | ((prev: AtmosphericReading[]) => AtmosphericReading[])) => void;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
}

// =================== COMPOSANT ATMOSPHERIC TESTING ===================
const AtmosphericTesting: React.FC<AtmosphericTestingProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  atmosphericReadings,
  setAtmosphericReadings,
  isMobile,
  language,
  styles,
  updateParentData
}) => {

  // =================== ÉTATS LOCAUX ===================
  // États contrôles et timers
  const [retestTimer, setRetestTimer] = useState(0);
  const [retestActive, setRetestActive] = useState(false);
  const [continuousTimer, setContinuousTimer] = useState(0);
  const [continuousActive, setContinuousActive] = useState(false);
  const [lastDangerReading, setLastDangerReading] = useState<AtmosphericReading | null>(null);
  
  // États saisie manuelle
  const [manualReading, setManualReading] = useState({ 
    level: 'top' as 'top' | 'middle' | 'bottom',
    oxygen: '', 
    lel: '', 
    h2s: '', 
    co: '', 
    temperature: '', 
    humidity: '',
    device_id: '',
    notes: ''
  });

  // État monitoring continu
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Tests Atmosphériques Obligatoires",
      legalCompliance: "Conformité Réglementaire Tests Atmosphériques",
      limits: "Limites Réglementaires",
      newReading: "Nouvelle Mesure Atmosphérique",
      readingHistory: "Historique des Mesures",
      continuousMonitoring: "Surveillance Continue Obligatoire",
      multiLevelTesting: "Tests Multi-Niveaux Obligatoires",
      deviceCalibration: "Calibration Équipement de Mesure",
      addReading: "Ajouter Mesure",
      level: "Niveau dans l'espace",
      topLevel: "Niveau supérieur",
      middleLevel: "Niveau moyen", 
      bottomLevel: "Niveau inférieur",
      oxygen: "Oxygène (O₂)",
      lel: "Limite explosive (LEL)",
      h2s: "Sulfure d'hydrogène (H₂S)",
      co: "Monoxyde de carbone (CO)",
      temperature: "Température",
      humidity: "Humidité",
      deviceId: "ID Appareil",
      notes: "Notes",
      safe: "SÉCURITAIRE",
      warning: "ATTENTION", 
      danger: "DANGER",
      criticalValues: "VALEURS CRITIQUES",
      retestRequired: "RETEST OBLIGATOIRE",
      evacuationRequired: "ÉVACUATION REQUISE",
      startMonitoring: "Démarrer Surveillance",
      stopMonitoring: "Arrêter Surveillance",
      resetTimer: "Réinitialiser Timer",
      timeRemaining: "Temps restant",
      frequencyMinutes: "Fréquence réglementaire",
      calibrated: "Calibré",
      certified: "Certifié",
      validated: "Validé"
    },
    en: {
      title: "Mandatory Atmospheric Testing",
      legalCompliance: "Atmospheric Testing Regulatory Compliance",
      limits: "Regulatory Limits",
      newReading: "New Atmospheric Reading",
      readingHistory: "Reading History",
      continuousMonitoring: "Mandatory Continuous Monitoring",
      multiLevelTesting: "Mandatory Multi-Level Testing",
      deviceCalibration: "Measuring Equipment Calibration",
      addReading: "Add Reading",
      level: "Level in space",
      topLevel: "Top level",
      middleLevel: "Middle level",
      bottomLevel: "Bottom level", 
      oxygen: "Oxygen (O₂)",
      lel: "Lower Explosive Limit (LEL)",
      h2s: "Hydrogen Sulfide (H₂S)",
      co: "Carbon Monoxide (CO)",
      temperature: "Temperature",
      humidity: "Humidity",
      deviceId: "Device ID",
      notes: "Notes",
      safe: "SAFE",
      warning: "WARNING",
      danger: "DANGER", 
      criticalValues: "CRITICAL VALUES",
      retestRequired: "RETEST REQUIRED",
      evacuationRequired: "EVACUATION REQUIRED",
      startMonitoring: "Start Monitoring",
      stopMonitoring: "Stop Monitoring", 
      resetTimer: "Reset Timer",
      timeRemaining: "Time remaining",
      frequencyMinutes: "Regulatory frequency",
      calibrated: "Calibrated",
      certified: "Certified",
      validated: "Validated"
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
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

  // Format du timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // =================== GESTION DES TIMERS ===================
  // Timer de retest automatique (15 minutes après danger)
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

  // Timer de surveillance continue selon fréquence provinciale
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (continuousActive && continuousTimer > 0) {
      interval = setInterval(() => {
        setContinuousTimer(prev => {
          if (prev <= 1) {
            alert(`⏰ SURVEILLANCE CONTINUE: ${PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} minutes écoulées. Nouveau test atmosphérique requis selon ${PROVINCIAL_REGULATIONS[selectedProvince].code}!`);
            return PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes * 60; // Reset
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [continuousActive, continuousTimer, selectedProvince]);

  // Déclenchement automatique du timer de retest
  useEffect(() => {
    const latestReading = atmosphericReadings[atmosphericReadings.length - 1];
    if (latestReading && latestReading.status === 'danger') {
      setLastDangerReading(latestReading);
      setRetestTimer(15 * 60); // 15 minutes en secondes
      setRetestActive(true);
    }
  }, [atmosphericReadings]);

  // Démarrage automatique surveillance continue
  useEffect(() => {
    if (atmosphericReadings.length > 0 && !continuousActive) {
      setContinuousTimer(PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes * 60);
      setContinuousActive(true);
    }
  }, [atmosphericReadings.length, selectedProvince]);

  // =================== FONCTIONS DE GESTION ===================
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
      level: manualReading.level,
      oxygen,
      lel,
      h2s,
      co,
      temperature: manualReading.temperature ? parseFloat(manualReading.temperature) : undefined,
      humidity: manualReading.humidity ? parseFloat(manualReading.humidity) : undefined,
      status: overallStatus,
      device_id: manualReading.device_id || 'Manuel',
      taken_by: 'Opérateur Manuel',
      notes: manualReading.notes || undefined,
      retest_required: overallStatus === 'danger'
    };

    setAtmosphericReadings(prev => {
      const newReadings = [...prev, newReading];
      updateParentData('atmospheric_readings', newReadings);
      return newReadings;
    });

    setManualReading({ 
      level: 'top',
      oxygen: '', 
      lel: '', 
      h2s: '', 
      co: '', 
      temperature: '', 
      humidity: '',
      device_id: '',
      notes: ''
    });

    if (overallStatus === 'danger') {
      alert('🚨 DANGER CRITIQUE: Les valeurs atmosphériques sont dangereuses! Évacuation immédiate requise!');
    } else if (overallStatus === 'warning') {
      alert('⚠️ ATTENTION: Certaines valeurs sont hors limites acceptables. Surveillance renforcée requise.');
    }
  };

  // Démarrage/arrêt surveillance continue
  const toggleContinuousMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsMonitoring(true);
      setContinuousActive(true);
      setContinuousTimer(PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes * 60);
    }
  };

  // Obtenir la couleur selon le niveau
  const getLevelColor = (level: string): string => {
    const colors = {
      top: '#3b82f6',
      middle: '#f59e0b', 
      bottom: '#ef4444'
    };
    return colors[level as keyof typeof colors] || '#6b7280';
  };

  // Obtenir l'emoji selon le niveau
  const getLevelEmoji = (level: string): string => {
    const emojis = {
      top: '⬆️',
      middle: '↔️',
      bottom: '⬇️'
    };
    return emojis[level as keyof typeof emojis] || '📍';
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Section Conformité Réglementaire Tests Atmosphériques */}
      <div style={{
        backgroundColor: '#dc2626',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '24px',
        border: '2px solid #ef4444',
        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: 'white',
          marginBottom: isMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Gauge style={{ width: '24px', height: '24px', color: '#fecaca' }} />
          ⚖️ {texts.legalCompliance}
        </h3>
        
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '20px',
          border: '1px solid rgba(254, 202, 202, 0.3)'
        }}>
          <p style={{ 
            color: '#fecaca', 
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            🌬️ <strong>TESTS OBLIGATOIRES</strong> : Tests atmosphériques multi-niveaux requis avant entrée + surveillance continue selon {PROVINCIAL_REGULATIONS[selectedProvince].code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            ⏰ <strong>Fréquence réglementaire</strong> : Nouveau test toutes les {PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} minutes + retest immédiat si valeurs critiques.
          </p>
        </div>
        
        {/* Calibration équipement obligatoire */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fecaca',
            marginBottom: '16px'
          }}>
            🔧 {texts.deviceCalibration}
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Date calibration détecteur *</label>
              <input
                type="date"
                value={permitData.calibration_date || ''}
                onChange={(e) => updatePermitData({ calibration_date: e.target.value })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                required
              />
            </div>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Certificat de calibration *</label>
              <input
                type="text"
                placeholder="Ex: CAL-2024-001234"
                value={permitData.calibration_certificate || ''}
                onChange={(e) => updatePermitData({ calibration_certificate: e.target.value })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                required
              />
            </div>
          </div>
          
          <div style={{ 
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(254, 202, 202, 0.3)'
          }}>
            <input
              type="checkbox"
              id="gas_detector_calibrated"
              checked={permitData.gas_detector_calibrated || false}
              onChange={(e) => updatePermitData({ gas_detector_calibrated: e.target.checked })}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="gas_detector_calibrated"
              style={{
                color: '#fecaca',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              🔧 <strong>DÉTECTEUR CALIBRÉ</strong> : Je certifie que le détecteur multi-gaz est calibré dans les 24h selon les spécifications du fabricant *
            </label>
          </div>
        </div>
        
        {/* Tests multi-niveaux obligatoires */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(254, 202, 202, 0.3)'
        }}>
          <input
            type="checkbox"
            id="multi_level_testing_completed"
            checked={permitData.multi_level_testing_completed || false}
            onChange={(e) => updatePermitData({ multi_level_testing_completed: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              accentColor: '#ef4444'
            }}
            required
          />
          <label 
            htmlFor="multi_level_testing_completed"
            style={{
              color: '#fecaca',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            📊 <strong>TESTS MULTI-NIVEAUX</strong> : Tests atmosphériques effectués aux niveaux supérieur, moyen et inférieur de l'espace clos *
          </label>
        </div>
        
        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(254, 202, 202, 0.3)'
        }}>
          <input
            type="checkbox"
            id="atmospheric_stability_confirmed"
            checked={permitData.atmospheric_stability_confirmed || false}
            onChange={(e) => updatePermitData({ atmospheric_stability_confirmed: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              accentColor: '#ef4444'
            }}
            required
          />
          <label 
            htmlFor="atmospheric_stability_confirmed"
            style={{
              color: '#fecaca',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ✅ <strong>STABILITÉ ATMOSPHÉRIQUE</strong> : Je confirme que l'atmosphère est stable et conforme aux limites de {PROVINCIAL_REGULATIONS[selectedProvince].authority} *
          </label>
        </div>
      </div>

      {/* Section Limites Réglementaires */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Shield style={{ width: '20px', height: '20px' }} />
          {texts.limits} - {PROVINCIAL_REGULATIONS[selectedProvince].name}
          <span style={{
            fontSize: isMobile ? '12px' : '14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontWeight: '700'
          }}>
            ⏱️ {PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} min
          </span>
        </h3>
        
        <div style={styles.grid4}>
          {Object.entries(PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.limits).map(([gas, limits]) => (
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

      {/* Section Surveillance Continue */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Activity style={{ width: '20px', height: '20px' }} />
          {texts.continuousMonitoring}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={toggleContinuousMonitoring}
              style={{
                ...styles.button,
                ...(isMonitoring ? styles.buttonDanger : styles.buttonSuccess),
                width: 'auto',
                padding: '8px 12px',
                fontSize: '14px',
                minHeight: 'auto'
              }}
            >
              {isMonitoring ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
              {isMonitoring ? texts.stopMonitoring : texts.startMonitoring}
            </button>
            <button
              onClick={() => {
                setContinuousTimer(PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes * 60);
                setContinuousActive(true);
              }}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: '8px 12px',
                fontSize: '14px',
                minHeight: 'auto'
              }}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              {texts.resetTimer}
            </button>
          </div>
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: continuousActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '12px',
            border: `2px solid ${continuousActive ? '#10b981' : '#6b7280'}`,
            textAlign: 'center'
          }}>
            <Clock style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: continuousActive ? '#10b981' : '#6b7280',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: continuousActive ? '#86efac' : '#9ca3af',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '8px'
            }}>
              {formatTime(continuousTimer)}
            </div>
            <div style={{ 
              color: continuousActive ? '#86efac' : '#9ca3af', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {texts.timeRemaining}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            border: '2px solid #3b82f6',
            textAlign: 'center'
          }}>
            <Gauge style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#60a5fa',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: 'bold', 
              color: '#93c5fd',
              marginBottom: '8px'
            }}>
              {PROVINCIAL_REGULATIONS[selectedProvince].atmospheric_testing.frequency_minutes} min
            </div>
            <div style={{ 
              color: '#93c5fd', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {texts.frequencyMinutes}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            border: '2px solid #f59e0b',
            textAlign: 'center'
          }}>
            <FileText style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#fbbf24',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: 'bold', 
              color: '#fde047',
              marginBottom: '8px'
            }}>
              {atmosphericReadings.length}
            </div>
            <div style={{ 
              color: '#fde047', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Tests effectués
            </div>
          </div>
        </div>
      </div>

      {/* Alerte retest obligatoire */}
      {retestActive && (
        <div style={{
          ...styles.emergencyCard,
          animation: 'pulse 2s infinite'
        }}>
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
                  ⏰ {texts.retestRequired}
                </h3>
                <p style={{ color: '#fca5a5', fontSize: isMobile ? '14px' : '16px' }}>
                  {texts.criticalValues} - {texts.evacuationRequired}
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
              <div style={{ color: '#fca5a5', fontSize: '16px' }}>{texts.timeRemaining}</div>
            </div>
          </div>
        </div>
      )}

      {/* Section Nouvelle Mesure */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Activity style={{ width: '20px', height: '20px' }} />
          {texts.newReading}
        </h3>
        
        {/* Sélection niveau */}
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>{texts.level} *</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { value: 'top', label: texts.topLevel, emoji: '⬆️' },
              { value: 'middle', label: texts.middleLevel, emoji: '↔️' },
              { value: 'bottom', label: texts.bottomLevel, emoji: '⬇️' }
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => setManualReading(prev => ({ ...prev, level: level.value as any }))}
                style={{
                  ...styles.button,
                  backgroundColor: manualReading.level === level.value ? getLevelColor(level.value) : '#4b5563',
                  color: 'white',
                  border: `2px solid ${manualReading.level === level.value ? getLevelColor(level.value) : '#6b7280'}`,
                  width: 'auto',
                  padding: '12px 16px',
                  flex: isMobile ? '1' : 'none'
                }}
              >
                {level.emoji} {level.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Valeurs atmosphériques */}
        <div style={styles.grid4}>
          <div>
            <label style={styles.label}>{texts.oxygen} (%) *</label>
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
            <label style={styles.label}>{texts.lel} (%) *</label>
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
            <label style={styles.label}>{texts.h2s} (ppm) *</label>
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
            <label style={styles.label}>{texts.co} (ppm) *</label>
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
        
        {/* Valeurs supplémentaires */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: '20px', 
          marginTop: '20px' 
        }}>
          <div>
            <label style={styles.label}>{texts.temperature} (°C)</label>
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
            <label style={styles.label}>{texts.humidity} (%)</label>
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
          <div>
            <label style={styles.label}>{texts.deviceId}</label>
            <input
              type="text"
              placeholder="Ex: DET-001"
              value={manualReading.device_id}
              onChange={(e) => setManualReading(prev => ({ ...prev, device_id: e.target.value }))}
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
              {texts.addReading}
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <label style={styles.label}>{texts.notes}</label>
          <textarea
            placeholder="Observations, conditions particulières..."
            value={manualReading.notes}
            onChange={(e) => setManualReading(prev => ({ ...prev, notes: e.target.value }))}
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Section Historique des Mesures */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FileText style={{ width: '20px', height: '20px' }} />
          {texts.readingHistory} ({atmosphericReadings.length})
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
                        {reading.status === 'danger' ? `🚨 ${texts.danger}` :
                         reading.status === 'warning' ? `⚠️ ${texts.warning}` :
                         `✅ ${texts.safe}`}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: getLevelColor(reading.level),
                        color: 'white'
                      }}>
                        {getLevelEmoji(reading.level)} {reading.level}
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
                      {reading.device_id && (
                        <>
                          <br />
                          🔧 {reading.device_id}
                        </>
                      )}
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
                  
                  {reading.retest_required && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(220, 38, 38, 0.3)',
                      borderRadius: '6px',
                      border: '1px solid #ef4444',
                      textAlign: 'center'
                    }}>
                      <span style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '600' }}>
                        ⏰ RETEST OBLIGATOIRE DANS 15 MINUTES
                      </span>
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

export default AtmosphericTesting;
