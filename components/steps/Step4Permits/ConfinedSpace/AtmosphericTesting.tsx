// AtmosphericTesting.tsx - PARTIE 1/2 - Version CorrigÃ©e Fix Runtime Error
"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Wind, Activity, Shield, Plus, AlertTriangle, FileText, Thermometer,
  Volume2, Gauge, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock
} from 'lucide-react';

// Import des types et du hook centralisÃ©
import {
  ConfinedSpaceComponentProps,
  AtmosphericTestingData,
  AtmosphericReading,
  AlarmSettings,
  generatePermitId
} from './SafetyManager';

import { styles, isMobile } from './styles';

// =================== TYPES LOCAUX Ã‰TENDUS ===================
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
  };
  // âœ… CORRECTION RUNTIME ERROR : Utiliser les propriÃ©tÃ©s qui existent rÃ©ellement
  permit_validity_hours: number; // âœ… Cette propriÃ©tÃ© existe dans PROVINCIAL_REGULATIONS
  atmosphere_testing_frequency: number; // âœ… Cette propriÃ©tÃ© existe
  continuous_monitoring_required: boolean; // âœ… Cette propriÃ©tÃ© existe
  emergency_contacts: Array<{
    name: string;
    role: string;
    phone: string;
    available_24h: boolean;
  }>;
}

interface LegalAtmosphericData {
  initial_testing_completed: boolean;
  continuous_monitoring_required: boolean;
  testing_frequency_minutes: number;
  provincial_limits: AtmosphericLimits;
  gas_detector_calibrated: boolean;
  calibration_date: string;
  calibration_certificate: string;
  test_results_signed: boolean;
  qualified_tester_name: string;
  multi_level_testing_completed: boolean;
  atmospheric_stability_confirmed: boolean;
}

// =================== TRADUCTIONS COMPLÃˆTES ===================
const translations = {
  fr: {
    title: "Tests AtmosphÃ©riques Obligatoires",
    legalCompliance: "ConformitÃ© RÃ©glementaire Tests AtmosphÃ©riques",
    limits: "Limites RÃ©glementaires",
    newReading: "Nouvelle Mesure AtmosphÃ©rique",
    readingHistory: "Historique des Mesures",
    continuousMonitoring: "Surveillance Continue Obligatoire",
    multiLevelTesting: "Tests Multi-Niveaux Obligatoires",
    deviceCalibration: "Calibration Ã‰quipement de Mesure",
    addReading: "Ajouter Mesure",
    level: "Niveau dans l'espace",
    topLevel: "Niveau supÃ©rieur",
    middleLevel: "Niveau moyen", 
    bottomLevel: "Niveau infÃ©rieur",
    oxygen: "OxygÃ¨ne (Oâ‚‚)",
    lel: "Limite explosive (LEL)",
    h2s: "Sulfure d'hydrogÃ¨ne (Hâ‚‚S)",
    co: "Monoxyde de carbone (CO)",
    temperature: "TempÃ©rature",
    humidity: "HumiditÃ©",
    deviceId: "ID Appareil",
    notes: "Notes",
    safe: "SÃ‰CURITAIRE",
    warning: "ATTENTION", 
    danger: "DANGER",
    criticalValues: "VALEURS CRITIQUES",
    retestRequired: "RETEST OBLIGATOIRE",
    evacuationRequired: "Ã‰VACUATION REQUISE",
    startMonitoring: "DÃ©marrer Surveillance",
    stopMonitoring: "ArrÃªter Surveillance",
    resetTimer: "RÃ©initialiser Timer",
    timeRemaining: "Temps restant",
    frequencyMinutes: "FrÃ©quence rÃ©glementaire",
    calibrated: "CalibrÃ©",
    certified: "CertifiÃ©",
    validated: "ValidÃ©"
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
    oxygen: "Oxygen (Oâ‚‚)",
    lel: "Lower Explosive Limit (LEL)",
    h2s: "Hydrogen Sulfide (Hâ‚‚S)",
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
};

// =================== COMPOSANT PRINCIPAL REFACTORISÃ‰ ===================
const AtmosphericTesting: React.FC<ConfinedSpaceComponentProps> = ({
  language,
  permitData,
  selectedProvince,
  regulations,
  isMobile,
  safetyManager,
  onUpdate,
  onSectionComplete,
  onValidationChange
}) => {
  // AccÃ¨s direct aux donnÃ©es depuis permitData
  const atmosphericData = permitData.atmosphericTesting || {
    equipment: {
      deviceModel: '',
      serialNumber: '',
      calibrationDate: '',
      nextCalibration: ''
    },
    readings: [],
    continuousMonitoring: false,
    alarmSettings: {
      oxygen: { min: 19.5, max: 23.0 },
      combustibleGas: { max: 10 },
      hydrogenSulfide: { max: 10 },
      carbonMonoxide: { max: 35 }
    },
    lastUpdated: new Date().toISOString()
  };

  const atmosphericReadings = atmosphericData.readings || [];
  
  // Ã‰tats locaux pour l'interface
  const [retestTimer, setRetestTimer] = useState(0);
  const [retestActive, setRetestActive] = useState(false);
  const [continuousTimer, setContinuousTimer] = useState(0);
  const [continuousActive, setContinuousActive] = useState(false);
  const [lastDangerReading, setLastDangerReading] = useState<AtmosphericReading | null>(null);
  
  // Ã‰tats saisie manuelle
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

  // Ã‰tat monitoring continu
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];

  // =================== HANDLERS SAFETYMANAGER CORRIGÃ‰S ===================
  const updateAtmosphericData = useCallback((updates: Partial<AtmosphericTestingData>) => {
    // âœ… CORRECTION 1 : VÃ©rification SafetyManager
    if (safetyManager) {
      try {
        safetyManager.updateAtmosphericTesting(updates);
      } catch (error) {
        console.warn('SafetyManager updateAtmosphericTesting failed:', error);
      }
    }
    
    if (onUpdate) {
      onUpdate('atmosphericTesting', updates);
    }
    
    // âœ… CORRECTION 2 : VÃ©rification SafetyManager pour validation
    if (onValidationChange && safetyManager) {
      try {
        const validation = safetyManager.validateSection('atmosphericTesting');
        onValidationChange(validation.isValid, validation.errors);
      } catch (error) {
        console.warn('SafetyManager validateSection failed:', error);
        // Fallback validation basique
        const isValid = (updates.readings && updates.readings.length > 0) || atmosphericReadings.length > 0;
        onValidationChange(isValid, isValid ? [] : ['Tests atmosphÃ©riques requis']);
      }
    }
  }, [safetyManager, onUpdate, onValidationChange, atmosphericReadings.length]);

  const updateReadings = useCallback((newReadings: AtmosphericReading[]) => {
    updateAtmosphericData({ 
      readings: newReadings,
      lastUpdated: new Date().toISOString()
    });
  }, [updateAtmosphericData]);

  // =================== FONCTIONS UTILITAIRES ===================
  const validateAtmosphericValue = (type: keyof AtmosphericLimits, value: number): 'safe' | 'warning' | 'danger' => {
    const currentRegulations = regulations[selectedProvince];
    if (!currentRegulations?.limits?.[type]) {
      return 'safe'; // Fallback si pas de rÃ©glementation
    }
    
    const limits = currentRegulations.limits[type];
    
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: string): string => {
    const colors = {
      top: '#3b82f6',
      middle: '#f59e0b', 
      bottom: '#ef4444'
    };
    return colors[level as keyof typeof colors] || '#6b7280';
  };

  const getLevelEmoji = (level: string): string => {
    const emojis = {
      top: 'â¬†ï¸',
      middle: 'â†”ï¸',
      bottom: 'â¬‡ï¸'
    };
    return emojis[level as keyof typeof emojis] || 'ðŸ“';
  };

  // =================== GESTION DES TIMERS ===================
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (retestActive && retestTimer > 0) {
      interval = setInterval(() => {
        setRetestTimer(prev => {
          if (prev <= 1) {
            setRetestActive(false);
            alert('ðŸš¨ RETEST OBLIGATOIRE: 15 minutes Ã©coulÃ©es. Effectuez immÃ©diatement de nouveaux tests atmosphÃ©riques!');
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

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (continuousActive && continuousTimer > 0) {
      interval = setInterval(() => {
        setContinuousTimer(prev => {
          if (prev <= 1) {
            // âœ… CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
            const frequencyMinutes = regulations[selectedProvince]?.atmosphere_testing_frequency || 30;
            alert(`â° SURVEILLANCE CONTINUE: ${frequencyMinutes} minutes Ã©coulÃ©es. Nouveau test atmosphÃ©rique requis selon ${regulations[selectedProvince]?.code || 'rÃ©glementation'}!`);
            return frequencyMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [continuousActive, continuousTimer, selectedProvince, regulations]);

  useEffect(() => {
    const latestReading = atmosphericReadings[atmosphericReadings.length - 1];
    if (latestReading && latestReading.status === 'danger') {
      setLastDangerReading(latestReading);
      setRetestTimer(15 * 60);
      setRetestActive(true);
    }
  }, [atmosphericReadings]);

  useEffect(() => {
    if (atmosphericReadings.length > 0 && !continuousActive) {
      // âœ… CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
      const frequencyMinutes = regulations[selectedProvince]?.atmosphere_testing_frequency || 30;
      setContinuousTimer(frequencyMinutes * 60);
      setContinuousActive(true);
    }
  }, [atmosphericReadings.length, selectedProvince, regulations, continuousActive]);

  // =================== FONCTIONS DE GESTION ===================
  const addManualReading = useCallback(() => {
    if (!manualReading.oxygen || !manualReading.lel || !manualReading.h2s || !manualReading.co) {
      alert('âš ï¸ Veuillez saisir toutes les valeurs obligatoires (Oâ‚‚, LEL, Hâ‚‚S, CO)');
      return;
    }

    const oxygen = parseFloat(manualReading.oxygen);
    const lel = parseFloat(manualReading.lel);
    const h2s = parseFloat(manualReading.h2s);
    const co = parseFloat(manualReading.co);

    if (oxygen < 0 || oxygen > 30 || lel < 0 || lel > 100 || h2s < 0 || h2s > 1000 || co < 0 || co > 1000) {
      alert('âš ï¸ Valeurs hors plage acceptable. VÃ©rifiez vos mesures.');
      return;
    }

    const oxygenStatus = validateAtmosphericValue('oxygen', oxygen);
    const lelStatus = validateAtmosphericValue('lel', lel);
    const h2sStatus = validateAtmosphericValue('h2s', h2s);
    const coStatus = validateAtmosphericValue('co', co);

    const statuses = [oxygenStatus, lelStatus, h2sStatus, coStatus];
    const overallStatus: 'safe' | 'caution' | 'danger' = statuses.includes('danger') ? 'danger' :
      statuses.includes('warning') ? 'caution' : 'safe';

    const newReading: AtmosphericReading = {
      id: generatePermitId(),
      timestamp: new Date().toISOString(),
      location: `${t.level} ${manualReading.level}`,
      readings: {
        oxygen,
        combustibleGas: lel,
        hydrogenSulfide: h2s,
        carbonMonoxide: co,
        temperature: manualReading.temperature ? parseFloat(manualReading.temperature) : 20,
        humidity: manualReading.humidity ? parseFloat(manualReading.humidity) : 50
      },
      status: overallStatus,
      testedBy: 'OpÃ©rateur Manuel',
      notes: manualReading.notes || undefined
    };

    const newReadings = [...atmosphericReadings, newReading];
    updateReadings(newReadings);

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
      alert('ðŸš¨ DANGER CRITIQUE: Les valeurs atmosphÃ©riques sont dangereuses! Ã‰vacuation immÃ©diate requise!');
    } else if (overallStatus === 'caution') {
      alert('âš ï¸ ATTENTION: Certaines valeurs sont hors limites acceptables. Surveillance renforcÃ©e requise.');
    }
  }, [manualReading, atmosphericReadings, updateReadings, t, validateAtmosphericValue]);

  const toggleContinuousMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsMonitoring(true);
      setContinuousActive(true);
      // âœ… CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
      const frequencyMinutes = regulations[selectedProvince]?.atmosphere_testing_frequency || 30;
      setContinuousTimer(frequencyMinutes * 60);
    }
  }, [isMonitoring, regulations, selectedProvince]);

  const updateEquipmentData = useCallback((field: string, value: any) => {
    const currentEquipment = atmosphericData.equipment || {
      deviceModel: '',
      serialNumber: '',
      calibrationDate: '',
      nextCalibration: ''
    };
    const updatedEquipment = { ...currentEquipment, [field]: value };
    updateAtmosphericData({ equipment: updatedEquipment });
  }, [atmosphericData.equipment, updateAtmosphericData]);

  // =================== HANDLERS POUR CHECKBOX AVEC SAFETYMANAGER ===================
  const handleGasDetectorCalibrated = useCallback((checked: boolean) => {
    updateAtmosphericData({ 
      equipment: { 
        ...atmosphericData.equipment, 
        calibrationDate: atmosphericData.equipment?.calibrationDate || '',
        serialNumber: atmosphericData.equipment?.serialNumber || '',
        deviceModel: atmosphericData.equipment?.deviceModel || '',
        nextCalibration: atmosphericData.equipment?.nextCalibration || ''
      }
    });
    
    // âœ… CORRECTION 3 : VÃ©rification SafetyManager pour mise Ã  jour permis
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, gas_detector_calibrated: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager permit update failed:', error);
      }
    }
  }, [safetyManager, atmosphericData.equipment, updateAtmosphericData]);

  const handleMultiLevelTestingCompleted = useCallback((checked: boolean) => {
    // âœ… CORRECTION 4 : VÃ©rification SafetyManager pour multi-level testing
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, multi_level_testing_completed: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager multi-level testing update failed:', error);
      }
    }
  }, [safetyManager]);

  const handleAtmosphericStabilityConfirmed = useCallback((checked: boolean) => {
    // âœ… CORRECTION 5 : VÃ©rification SafetyManager pour atmospheric stability
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, atmospheric_stability_confirmed: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager atmospheric stability update failed:', error);
      }
    }
  }, [safetyManager]);

  // =================== PROTECTION CONTRE REGULATIONS UNDEFINED ===================
  // âœ… CORRECTION RUNTIME ERROR : Structure compatible avec PROVINCIAL_REGULATIONS de index.tsx
  const safeRegulations = regulations[selectedProvince] || {
    name: 'RÃ©glementation provinciale',
    code: 'N/A',
    authority: 'AutoritÃ© compÃ©tente',
    atmosphere_testing_frequency: 30,
    continuous_monitoring_required: true,
    permit_validity_hours: 8,
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 }
    }
  };
  // =================== RENDU JSX PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Section ConformitÃ© RÃ©glementaire Tests AtmosphÃ©riques */}
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
          âš–ï¸ {t.legalCompliance}
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
            ðŸŒ¬ï¸ <strong>TESTS OBLIGATOIRES</strong> : Tests atmosphÃ©riques multi-niveaux requis avant entrÃ©e + surveillance continue selon {safeRegulations.code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            â° <strong>FrÃ©quence rÃ©glementaire</strong> : Nouveau test toutes les {safeRegulations.atmosphere_testing_frequency} minutes + retest immÃ©diat si valeurs critiques.
          </p>
        </div>
        
        {/* Calibration Ã©quipement obligatoire */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fecaca',
            marginBottom: '16px'
          }}>
            ðŸ”§ {t.deviceCalibration}
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Date calibration dÃ©tecteur *</label>
              <input
                type="date"
                value={atmosphericData.equipment?.calibrationDate || ''}
                onChange={(e) => updateEquipmentData('calibrationDate', e.target.value)}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                required
              />
            </div>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Certificat de calibration *</label>
              <input
                type="text"
                placeholder="Ex: CAL-2024-001234"
                value={atmosphericData.equipment?.serialNumber || ''}
                onChange={(e) => updateEquipmentData('serialNumber', e.target.value)}
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
              onChange={(e) => handleGasDetectorCalibrated(e.target.checked)}
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
              ðŸ”§ <strong>DÃ‰TECTEUR CALIBRÃ‰</strong> : Je certifie que le dÃ©tecteur multi-gaz est calibrÃ© dans les 24h selon les spÃ©cifications du fabricant *
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
          border: '1px solid rgba(254, 202, 202, 0.3)',
          marginBottom: '16px'
        }}>
          <input
            type="checkbox"
            id="multi_level_testing_completed"
            checked={permitData.multi_level_testing_completed || false}
            onChange={(e) => handleMultiLevelTestingCompleted(e.target.checked)}
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
            ðŸ“Š <strong>TESTS MULTI-NIVEAUX</strong> : Tests atmosphÃ©riques effectuÃ©s aux niveaux supÃ©rieur, moyen et infÃ©rieur de l'espace clos *
          </label>
        </div>
        
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
            id="atmospheric_stability_confirmed"
            checked={permitData.atmospheric_stability_confirmed || false}
            onChange={(e) => handleAtmosphericStabilityConfirmed(e.target.checked)}
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
            âœ… <strong>STABILITÃ‰ ATMOSPHÃ‰RIQUE</strong> : Je confirme que l'atmosphÃ¨re est stable et conforme aux limites de {safeRegulations.authority} *
          </label>
        </div>
      </div>

      {/* Section Limites RÃ©glementaires */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Shield style={{ width: '20px', height: '20px' }} />
          {t.limits} - {safeRegulations.name}
          <span style={{
            fontSize: isMobile ? '12px' : '14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontWeight: '700'
          }}>
            â±ï¸ {safeRegulations.atmosphere_testing_frequency} min
          </span>
        </h3>
        
        <div style={styles.grid4}>
          {Object.entries(safeRegulations.limits).map(([gas, limits]) => (
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
                {gas === 'oxygen' ? 'ðŸ« Oâ‚‚' : 
                 gas === 'lel' ? 'ðŸ”¥ LEL' : 
                 gas === 'h2s' ? 'â˜ ï¸ Hâ‚‚S' : 
                 'ðŸ’¨ CO'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: isMobile ? '13px' : '14px' }}>
                {gas === 'oxygen' ? (
                  <>
                    <div style={{ color: '#86efac', fontWeight: '600' }}>
                      âœ… {(limits as AtmosphericLimits['oxygen']).min}-{(limits as AtmosphericLimits['oxygen']).max}%
                    </div>
                    <div style={{ color: '#fca5a5', fontWeight: '600' }}>
                      ðŸš¨ â‰¤{(limits as AtmosphericLimits['oxygen']).critical_low}% ou â‰¥{(limits as AtmosphericLimits['oxygen']).critical_high}%
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: '#86efac', fontWeight: '600' }}>
                      âœ… â‰¤{(limits as AtmosphericLimits['lel']).max} {gas === 'lel' ? '%' : 'ppm'}
                    </div>
                    <div style={{ color: '#fca5a5', fontWeight: '600' }}>
                      ðŸš¨ â‰¥{(limits as AtmosphericLimits['lel']).critical} {gas === 'lel' ? '%' : 'ppm'}
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
          {t.continuousMonitoring}
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
              {isMonitoring ? t.stopMonitoring : t.startMonitoring}
            </button>
            <button
              onClick={() => {
                setContinuousTimer(safeRegulations.atmosphere_testing_frequency * 60);
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
              {t.resetTimer}
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
              {t.timeRemaining}
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
              {safeRegulations.atmosphere_testing_frequency} min
            </div>
            <div style={{ 
              color: '#93c5fd', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {t.frequencyMinutes}
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
              Tests effectuÃ©s
            </div>
          </div>
        </div>
      </div>

      {/* Alerte retest obligatoire */}
      {retestActive && (
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '28px',
          animation: 'pulse 2s infinite',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
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
                  â° {t.retestRequired}
                </h3>
                <p style={{ color: '#fca5a5', fontSize: isMobile ? '14px' : '16px' }}>
                  {t.criticalValues} - {t.evacuationRequired}
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
              <div style={{ color: '#fca5a5', fontSize: '16px' }}>{t.timeRemaining}</div>
            </div>
          </div>
        </div>
      )}

      {/* Section Nouvelle Mesure */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Activity style={{ width: '20px', height: '20px' }} />
          {t.newReading}
        </h3>
        
        {/* SÃ©lection niveau */}
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>{t.level} *</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { value: 'top', label: t.topLevel, emoji: 'â¬†ï¸' },
              { value: 'middle', label: t.middleLevel, emoji: 'â†”ï¸' },
              { value: 'bottom', label: t.bottomLevel, emoji: 'â¬‡ï¸' }
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
        
        {/* Valeurs atmosphÃ©riques */}
        <div style={styles.grid4}>
          <div>
            <label style={styles.label}>{t.oxygen} (%) *</label>
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
            <label style={styles.label}>{t.lel} (%) *</label>
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
            <label style={styles.label}>{t.h2s} (ppm) *</label>
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
            <label style={styles.label}>{t.co} (ppm) *</label>
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
        
        {/* Valeurs supplÃ©mentaires */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: '20px', 
          marginTop: '20px' 
        }}>
          <div>
            <label style={styles.label}>{t.temperature} (Â°C)</label>
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
            <label style={styles.label}>{t.humidity} (%)</label>
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
            <label style={styles.label}>{t.deviceId}</label>
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
              {t.addReading}
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <label style={styles.label}>{t.notes}</label>
          <textarea
            placeholder="Observations, conditions particuliÃ¨res..."
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
          {t.readingHistory} ({atmosphericReadings.length})
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
              Aucune mesure enregistrÃ©e
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Effectuez votre premiÃ¨re mesure atmosphÃ©rique ci-dessus pour commencer la surveillance.
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
                                 reading.status === 'caution' ? styles.readingWarning :
                                 styles.readingSafe;
              
              return (
                <div
                  key={reading.id}
                  style={{
                    padding: isMobile ? '14px' : '18px',
                    borderRadius: '12px',
                    borderLeft: '4px solid',
                    transition: 'all 0.2s ease',
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
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        marginRight: '8px',
                        flexShrink: 0,
                        backgroundColor: reading.status === 'danger' ? '#ef4444' :
                                       reading.status === 'caution' ? '#f59e0b' : '#10b981',
                        boxShadow: reading.status === 'danger' ? '0 0 12px rgba(239, 68, 68, 0.6)' :
                                  reading.status === 'caution' ? '0 0 8px rgba(245, 158, 11, 0.4)' :
                                  '0 0 8px rgba(16, 185, 129, 0.4)',
                        animation: reading.status === 'danger' ? 'pulse 2s infinite' : 'none'
                      }}></div>
                      <span style={{
                        fontWeight: '700',
                        color: reading.status === 'danger' ? '#fca5a5' :
                              reading.status === 'caution' ? '#fde047' :
                              '#86efac',
                        fontSize: isMobile ? '15px' : '17px'
                      }}>
                        {reading.status === 'danger' ? `ðŸš¨ ${t.danger}` :
                         reading.status === 'caution' ? `âš ï¸ ${t.warning}` :
                         `âœ… ${t.safe}`}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: getLevelColor(reading.location),
                        color: 'white'
                      }}>
                        {getLevelEmoji(reading.location)} {reading.location}
                      </span>
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: isMobile ? '13px' : '14px', 
                      textAlign: isMobile ? 'center' : 'right'
                    }}>
                      ðŸ“… {new Date(reading.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      <br />
                      ðŸ‘¤ {reading.testedBy}
                    </div>
                  </div>
                  
                  <div style={styles.grid4}>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Oâ‚‚:</span>
                      <span style={{
                        marginLeft: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        color: validateAtmosphericValue('oxygen', reading.readings.oxygen) === 'danger' ? '#fca5a5' :
                              validateAtmosphericValue('oxygen', reading.readings.oxygen) === 'warning' ? '#fde047' :
                              '#86efac'
                      }}>
                        {reading.readings.oxygen}%
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>LEL:</span>
                      <span style={{
                        marginLeft: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        color: validateAtmosphericValue('lel', reading.readings.combustibleGas) === 'danger' ? '#fca5a5' :
                              validateAtmosphericValue('lel', reading.readings.combustibleGas) === 'warning' ? '#fde047' :
                              '#86efac'
                      }}>
                        {reading.readings.combustibleGas}%
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Hâ‚‚S:</span>
                      <span style={{
                        marginLeft: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        color: validateAtmosphericValue('h2s', reading.readings.hydrogenSulfide) === 'danger' ? '#fca5a5' :
                              validateAtmosphericValue('h2s', reading.readings.hydrogenSulfide) === 'warning' ? '#fde047' :
                              '#86efac'
                      }}>
                        {reading.readings.hydrogenSulfide} ppm
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>CO:</span>
                      <span style={{
                        marginLeft: '8px',
                        fontWeight: '600',
                        fontSize: '15px',
                        color: validateAtmosphericValue('co', reading.readings.carbonMonoxide) === 'danger' ? '#fca5a5' :
                              validateAtmosphericValue('co', reading.readings.carbonMonoxide) === 'warning' ? '#fde047' :
                              '#86efac'
                      }}>
                        {reading.readings.carbonMonoxide} ppm
                      </span>
                    </div>
                  </div>
                  
                  {(reading.readings.temperature || reading.readings.humidity || reading.notes) && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #4b5563',
                      fontSize: '14px',
                      color: '#d1d5db'
                    }}>
                      {reading.readings.temperature && <span>ðŸŒ¡ï¸ {reading.readings.temperature}Â°C </span>}
                      {reading.readings.humidity && <span>ðŸ’§ {reading.readings.humidity}% </span>}
                      {reading.notes && <div style={{ marginTop: '6px' }}>ðŸ“ {reading.notes}</div>}
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

export default memo(AtmosphericTesting);
