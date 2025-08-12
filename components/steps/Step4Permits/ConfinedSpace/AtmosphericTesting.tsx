// AtmosphericTesting.tsx - PARTIE 1/2 - Version Corrigée Fix Runtime Error
"use client";

import { logger } from '@/lib/logger';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Wind, Activity, Shield, Plus, AlertTriangle, FileText, Thermometer,
  Volume2, Gauge, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock
} from 'lucide-react';

// Import des types et du hook centralisé
import {
  ConfinedSpaceComponentProps,
  AtmosphericTestingData,
  AtmosphericReading,
  AlarmSettings,
  generatePermitId
} from './SafetyManager';

import { styles, isMobile } from './styles';

// =================== TYPES LOCAUX ÉTENDUS ===================
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
  // ✅ CORRECTION RUNTIME ERROR : Utiliser les propriétés qui existent réellement
  permit_validity_hours: number; // ✅ Cette propriété existe dans PROVINCIAL_REGULATIONS
  atmosphere_testing_frequency: number; // ✅ Cette propriété existe
  continuous_monitoring_required: boolean; // ✅ Cette propriété existe
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

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
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
};

// =================== COMPOSANT PRINCIPAL REFACTORISÉ ===================
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
  // Accès direct aux données depuis SafetyManager plutôt que permitData
  const atmosphericData = useMemo(() => (
    safetyManager?.currentPermit?.atmosphericTesting || {
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
    }
  ), [safetyManager?.currentPermit?.atmosphericTesting, safetyManager?.lastUpdateTime]);

  const atmosphericReadings = useMemo(
    () => atmosphericData.readings || [],
    [atmosphericData]
  );
  
  // États locaux pour l'interface
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

  const t = translations[language];

  // =================== HANDLERS SAFETYMANAGER CORRIGÉS ===================
  const updateAtmosphericData = useCallback((updates: Partial<AtmosphericTestingData>) => {
    // ✅ CORRECTION 1 : Vérification SafetyManager
    if (safetyManager) {
      try {
        safetyManager.updateAtmosphericTesting(updates);
      } catch (error) {
        logger.warn('SafetyManager updateAtmosphericTesting failed:', error);
      }
    }
    
    if (onUpdate) {
      onUpdate('atmosphericTesting', updates);
    }
    
    // ✅ CORRECTION 2 : Vérification SafetyManager pour validation
    if (onValidationChange && safetyManager) {
      try {
        const validation = safetyManager.validateSection('atmosphericTesting');
        onValidationChange(validation.isValid, validation.errors);
      } catch (error) {
        logger.warn('SafetyManager validateSection failed:', error);
        // Fallback validation basique
        const isValid = (updates.readings && updates.readings.length > 0) || atmosphericReadings.length > 0;
        onValidationChange(isValid, isValid ? [] : ['Tests atmosphériques requis']);
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
      return 'safe'; // Fallback si pas de réglementation
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
      top: '⬆️',
      middle: '↔️',
      bottom: '⬇️'
    };
    return emojis[level as keyof typeof emojis] || '📍';
  };

  // =================== GESTION DES TIMERS ===================
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

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (continuousActive && continuousTimer > 0) {
      interval = setInterval(() => {
        setContinuousTimer(prev => {
          if (prev <= 1) {
            // ✅ CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
            const frequencyMinutes = regulations[selectedProvince]?.atmosphere_testing_frequency || 30;
            alert(`⏰ SURVEILLANCE CONTINUE: ${frequencyMinutes} minutes écoulées. Nouveau test atmosphérique requis selon ${regulations[selectedProvince]?.code || 'réglementation'}!`);
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
      // ✅ CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
      const frequencyMinutes = regulations[selectedProvince]?.atmosphere_testing_frequency || 30;
      setContinuousTimer(frequencyMinutes * 60);
      setContinuousActive(true);
    }
  }, [atmosphericReadings.length, selectedProvince, regulations, continuousActive]);

  // =================== FONCTIONS DE GESTION ===================
  const addManualReading = useCallback(() => {
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
      testedBy: 'Opérateur Manuel',
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
      alert('🚨 DANGER CRITIQUE: Les valeurs atmosphériques sont dangereuses! Évacuation immédiate requise!');
    } else if (overallStatus === 'caution') {
      alert('⚠️ ATTENTION: Certaines valeurs sont hors limites acceptables. Surveillance renforcée requise.');
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
      // ✅ CORRECTION RUNTIME ERROR : Utiliser atmosphere_testing_frequency qui existe
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
    
    // ✅ CORRECTION 3 : Vérification SafetyManager pour mise à jour permis
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, gas_detector_calibrated: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        logger.warn('SafetyManager permit update failed:', error);
      }
    }
  }, [safetyManager, atmosphericData.equipment, updateAtmosphericData]);

  const handleMultiLevelTestingCompleted = useCallback((checked: boolean) => {
    // ✅ CORRECTION 4 : Vérification SafetyManager pour multi-level testing
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, multi_level_testing_completed: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        logger.warn('SafetyManager multi-level testing update failed:', error);
      }
    }
  }, [safetyManager]);

  const handleAtmosphericStabilityConfirmed = useCallback((checked: boolean) => {
    // ✅ CORRECTION 5 : Vérification SafetyManager pour atmospheric stability
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, atmospheric_stability_confirmed: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        logger.warn('SafetyManager atmospheric stability update failed:', error);
      }
    }
  }, [safetyManager]);

  // =================== PROTECTION CONTRE REGULATIONS UNDEFINED ===================
  // ✅ CORRECTION RUNTIME ERROR : Structure compatible avec PROVINCIAL_REGULATIONS de index.tsx
  const safeRegulations = regulations[selectedProvince] || {
    name: 'Réglementation provinciale',
    code: 'N/A',
    authority: 'Autorité compétente',
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
          ⚖️ {t.legalCompliance}
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
            🌬️ <strong>TESTS OBLIGATOIRES</strong> : Tests atmosphériques multi-niveaux requis avant entrée + surveillance continue selon {safeRegulations.code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            ⏰ <strong>Fréquence réglementaire</strong> : Nouveau test toutes les {safeRegulations.atmosphere_testing_frequency} minutes + retest immédiat si valeurs critiques.
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
            🔧 {t.deviceCalibration}
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Date calibration détecteur *</label>
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
            📊 <strong>TESTS MULTI-NIVEAUX</strong> : Tests atmosphériques effectués aux niveaux supérieur, moyen et inférieur de l'espace clos *
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
            ✅ <strong>STABILITÉ ATMOSPHÉRIQUE</strong> : Je confirme que l'atmosphère est stable et conforme aux limites de {safeRegulations.authority} *
          </label>
        </div>
      </div>

      {/* Section Limites Réglementaires */}
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
            ⏱️ {safeRegulations.atmosphere_testing_frequency} min
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
              Tests effectués
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
                  ⏰ {t.retestRequired}
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
        
        {/* Sélection niveau */}
        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>{t.level} *</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { value: 'top', label: t.topLevel, emoji: '⬆️' },
              { value: 'middle', label: t.middleLevel, emoji: '↔️' },
              { value: 'bottom', label: t.bottomLevel, emoji: '⬇️' }
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
        
        {/* Valeurs supplémentaires */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: '20px', 
          marginTop: '20px' 
        }}>
          <div>
            <label style={styles.label}>{t.temperature} (°C)</label>
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
                        {reading.status === 'danger' ? `🚨 ${t.danger}` :
                         reading.status === 'caution' ? `⚠️ ${t.warning}` :
                         `✅ ${t.safe}`}
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
                      📅 {new Date(reading.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      <br />
                      👤 {reading.testedBy}
                    </div>
                  </div>
                  
                  <div style={styles.grid4}>
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>O₂:</span>
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
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>H₂S:</span>
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
                      {reading.readings.temperature && <span>🌡️ {reading.readings.temperature}°C </span>}
                      {reading.readings.humidity && <span>💧 {reading.readings.humidity}% </span>}
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

export default React.memo(AtmosphericTesting);
