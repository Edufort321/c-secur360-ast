'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Timer, Flame, AlertTriangle, CheckCircle, Users, MapPin, 
  Phone, Thermometer, Wind, Eye, Camera, Save, Play, 
  Pause, Square, Bell, Clock, Shield, Zap, Settings
} from 'lucide-react';

// =================== INTERFACES ===================

interface HotWorkFireWatchProps {
  permitId: string;
  workLocation: string;
  language: 'fr' | 'en';
  onTimerUpdate?: (stage: FireWatchStage, elapsed: number) => void;
  onFireDetected?: () => void;
  onComplianceCheck?: (compliant: boolean) => void;
  editable?: boolean;
}

interface FireWatchData {
  id: string;
  permitId: string;
  fireWatchPersonnel: FireWatchPerson[];
  workStartTime?: string;
  workEndTime?: string;
  fireWatchStartTime?: string;
  fireWatchEndTime?: string;
  extendedMonitoringEndTime?: string;
  currentStage: FireWatchStage;
  environmentalConditions: EnvironmentalConditions;
  incidents: FireIncident[];
  complianceChecks: ComplianceCheck[];
  equipmentChecks: EquipmentCheck[];
  isActive: boolean;
  nfpa51bCompliant: boolean;
}

interface FireWatchPerson {
  id: string;
  name: string;
  certification: string;
  phone: string;
  role: 'primary' | 'backup' | 'supervisor';
  isActive: boolean;
  assignedTime: string;
}

interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: 'excellent' | 'good' | 'moderate' | 'poor';
  weatherConditions: string;
  lastUpdated: string;
}

interface FireIncident {
  id: string;
  timestamp: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  actionTaken: string;
  reportedBy: string;
  resolved: boolean;
  photos: string[];
}

interface ComplianceCheck {
  id: string;
  checkType: string;
  timestamp: string;
  compliant: boolean;
  notes?: string;
  performedBy: string;
}

interface EquipmentCheck {
  id: string;
  equipmentType: 'extinguisher' | 'hose' | 'blanket' | 'alarm' | 'communication';
  location: string;
  condition: 'excellent' | 'good' | 'needs_attention' | 'defective';
  lastChecked: string;
  checkedBy: string;
  notes?: string;
}

type FireWatchStage = 'pre_work' | 'during_work' | 'fire_watch' | 'extended_monitoring' | 'completed';

// =================== TRADUCTIONS ===================

const translations = {
  fr: {
    title: "🔥 Surveillance Feu - Permis à Chaud",
    subtitle: "Surveillance NFPA 51B conforme",
    
    stages: {
      pre_work: "Pré-travaux",
      during_work: "Pendant travaux",
      fire_watch: "Surveillance feu (60 min)",
      extended_monitoring: "Surveillance prolongée (3h)",
      completed: "Terminé"
    },
    
    nfpaCompliance: {
      title: "Conformité NFPA 51B-2019",
      fireWatch60Min: "Surveillance feu obligatoire: 60 minutes minimum",
      extendedMonitoring: "Surveillance prolongée optionnelle: jusqu'à 3 heures",
      continuousObservation: "Observation continue pendant les travaux",
      trainedPersonnel: "Personnel qualifié requis",
      fireSuppressionReady: "Équipement d'extinction prêt"
    },
    
    personnel: {
      title: "Personnel de Surveillance",
      primary: "Surveillant principal",
      backup: "Surveillant secondaire", 
      supervisor: "Superviseur",
      addPerson: "Ajouter surveillant",
      certification: "Certification",
      phone: "Téléphone",
      active: "Actif",
      inactive: "Inactif"
    },
    
    timers: {
      workDuration: "Durée des travaux",
      fireWatchRemaining: "Surveillance feu restante",
      extendedRemaining: "Surveillance prolongée restante",
      totalElapsed: "Temps total écoulé",
      startWork: "Démarrer travaux",
      endWork: "Terminer travaux",
      startFireWatch: "Démarrer surveillance",
      endFireWatch: "Terminer surveillance",
      pause: "Pause",
      resume: "Reprendre",
      reset: "Remettre à zéro"
    },
    
    environment: {
      title: "Conditions Environnementales",
      temperature: "Température",
      humidity: "Humidité",
      windSpeed: "Vitesse du vent", 
      visibility: "Visibilité",
      weather: "Conditions météo",
      lastUpdated: "Dernière mise à jour",
      update: "Mettre à jour"
    },
    
    incidents: {
      title: "Incidents de Feu",
      reportIncident: "Signaler incident",
      severity: "Gravité",
      description: "Description",
      actionTaken: "Action prise",
      resolved: "Résolu",
      addPhotos: "Ajouter photos",
      minor: "Mineur",
      moderate: "Modéré", 
      major: "Majeur",
      critical: "Critique"
    },
    
    equipment: {
      title: "Vérification Équipement",
      extinguisher: "Extincteur",
      hose: "Boyau d'incendie",
      blanket: "Couverture anti-feu",
      alarm: "Alarme incendie",
      communication: "Communication",
      condition: "Condition",
      excellent: "Excellente",
      good: "Bonne",
      needs_attention: "Attention requise",
      defective: "Défectueux",
      lastChecked: "Dernière vérification"
    },
    
    compliance: {
      title: "Vérifications de Conformité",
      preWorkInspection: "Inspection pré-travaux",
      personnelTraining: "Formation du personnel",
      equipmentAvailability: "Disponibilité équipement",
      clearanceCheck: "Vérification dégagement",
      weatherAssessment: "Évaluation météo",
      compliant: "Conforme",
      nonCompliant: "Non conforme",
      notes: "Notes"
    },
    
    alerts: {
      fireDetected: "🔥 FEU DÉTECTÉ!",
      timerExpired: "Temps de surveillance écoulé",
      equipmentIssue: "Problème d'équipement",
      personnelChange: "Changement de personnel",
      weatherChange: "Changement de conditions météo",
      complianceIssue: "Problème de conformité"
    },
    
    actions: {
      save: "Sauvegarder",
      export: "Exporter rapport",
      print: "Imprimer",
      notify: "Notifier équipe",
      escalate: "Escalader",
      complete: "Terminer surveillance"
    }
  },
  
  en: {
    title: "🔥 Fire Watch - Hot Work Permit",
    subtitle: "NFPA 51B Compliant Monitoring",
    
    stages: {
      pre_work: "Pre-work",
      during_work: "During work",
      fire_watch: "Fire watch (60 min)",
      extended_monitoring: "Extended monitoring (3h)",
      completed: "Completed"
    },
    
    nfpaCompliance: {
      title: "NFPA 51B-2019 Compliance",
      fireWatch60Min: "Mandatory fire watch: 60 minutes minimum",
      extendedMonitoring: "Optional extended monitoring: up to 3 hours",
      continuousObservation: "Continuous observation during work",
      trainedPersonnel: "Qualified personnel required",
      fireSuppressionReady: "Fire suppression equipment ready"
    },
    
    personnel: {
      title: "Fire Watch Personnel",
      primary: "Primary watch",
      backup: "Backup watch",
      supervisor: "Supervisor",
      addPerson: "Add personnel",
      certification: "Certification",
      phone: "Phone",
      active: "Active",
      inactive: "Inactive"
    },
    
    timers: {
      workDuration: "Work duration",
      fireWatchRemaining: "Fire watch remaining",
      extendedRemaining: "Extended monitoring remaining",
      totalElapsed: "Total elapsed",
      startWork: "Start work",
      endWork: "End work",
      startFireWatch: "Start fire watch",
      endFireWatch: "End fire watch",
      pause: "Pause",
      resume: "Resume",
      reset: "Reset"
    },
    
    environment: {
      title: "Environmental Conditions",
      temperature: "Temperature",
      humidity: "Humidity",
      windSpeed: "Wind speed",
      visibility: "Visibility",
      weather: "Weather conditions",
      lastUpdated: "Last updated",
      update: "Update"
    },
    
    incidents: {
      title: "Fire Incidents",
      reportIncident: "Report incident",
      severity: "Severity",
      description: "Description",
      actionTaken: "Action taken",
      resolved: "Resolved",
      addPhotos: "Add photos",
      minor: "Minor",
      moderate: "Moderate",
      major: "Major",
      critical: "Critical"
    },
    
    equipment: {
      title: "Equipment Check",
      extinguisher: "Fire extinguisher",
      hose: "Fire hose",
      blanket: "Fire blanket",
      alarm: "Fire alarm",
      communication: "Communication",
      condition: "Condition",
      excellent: "Excellent",
      good: "Good",
      needs_attention: "Needs attention",
      defective: "Defective",
      lastChecked: "Last checked"
    },
    
    compliance: {
      title: "Compliance Checks",
      preWorkInspection: "Pre-work inspection",
      personnelTraining: "Personnel training",
      equipmentAvailability: "Equipment availability",
      clearanceCheck: "Clearance check",
      weatherAssessment: "Weather assessment",
      compliant: "Compliant",
      nonCompliant: "Non-compliant",
      notes: "Notes"
    },
    
    alerts: {
      fireDetected: "🔥 FIRE DETECTED!",
      timerExpired: "Monitoring time expired",
      equipmentIssue: "Equipment issue",
      personnelChange: "Personnel change",
      weatherChange: "Weather conditions changed",
      complianceIssue: "Compliance issue"
    },
    
    actions: {
      save: "Save",
      export: "Export report",
      print: "Print",
      notify: "Notify team",
      escalate: "Escalate",
      complete: "Complete monitoring"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================

const HotWorkFireWatch: React.FC<HotWorkFireWatchProps> = ({
  permitId,
  workLocation,
  language = 'fr',
  onTimerUpdate,
  onFireDetected,
  onComplianceCheck,
  editable = true
}) => {
  // États
  const [fireWatchData, setFireWatchData] = useState<FireWatchData>(() => ({
    id: `firewatch_${Date.now()}`,
    permitId,
    fireWatchPersonnel: [],
    currentStage: 'pre_work',
    environmentalConditions: {
      temperature: 20,
      humidity: 50,
      windSpeed: 0,
      visibility: 'excellent',
      weatherConditions: 'clear',
      lastUpdated: new Date().toISOString()
    },
    incidents: [],
    complianceChecks: [],
    equipmentChecks: [],
    isActive: false,
    nfpa51bCompliant: false
  }));
  
  const [timers, setTimers] = useState({
    workElapsed: 0,
    fireWatchElapsed: 0,
    extendedElapsed: 0,
    isRunning: false,
    isPaused: false
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<FireIncident>>({});
  
  const timerRef = useRef<NodeJS.Timeout>();
  const t = translations[language];
  
  // =================== TIMER LOGIC ===================
  
  useEffect(() => {
    if (timers.isRunning && !timers.isPaused) {
      timerRef.current = setInterval(() => {
        setTimers(prev => {
          const newState = { ...prev };
          
          switch (fireWatchData.currentStage) {
            case 'during_work':
              newState.workElapsed += 1;
              break;
            case 'fire_watch':
              newState.fireWatchElapsed += 1;
              // NFPA 51B: Alerter après 60 minutes
              if (newState.fireWatchElapsed >= 3600) { // 60 minutes
                alert(t.alerts.timerExpired);
                // Transition automatique vers surveillance prolongée si configurée
              }
              break;
            case 'extended_monitoring':
              newState.extendedElapsed += 1;
              // Alerter après 3 heures supplémentaires  
              if (newState.extendedElapsed >= 10800) { // 3 heures
                alert(t.alerts.timerExpired);
              }
              break;
          }
          
          // Notifier les mises à jour du timer
          onTimerUpdate?.(fireWatchData.currentStage, 
            fireWatchData.currentStage === 'during_work' ? newState.workElapsed :
            fireWatchData.currentStage === 'fire_watch' ? newState.fireWatchElapsed :
            newState.extendedElapsed
          );
          
          return newState;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timers.isRunning, timers.isPaused, fireWatchData.currentStage, onTimerUpdate, t.alerts.timerExpired]);
  
  // =================== STAGE MANAGEMENT ===================
  
  const startWork = useCallback(() => {
    setFireWatchData(prev => ({
      ...prev,
      currentStage: 'during_work',
      workStartTime: new Date().toISOString(),
      isActive: true
    }));
    
    setTimers(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);
  
  const endWork = useCallback(() => {
    setFireWatchData(prev => ({
      ...prev,
      currentStage: 'fire_watch',
      workEndTime: new Date().toISOString(),
      fireWatchStartTime: new Date().toISOString()
    }));
    
    setTimers(prev => ({ 
      ...prev, 
      workElapsed: prev.workElapsed, // Garder le temps de travail
      fireWatchElapsed: 0 // Réinitialiser le timer de surveillance
    }));
  }, []);
  
  const startFireWatch = useCallback(() => {
    setFireWatchData(prev => ({
      ...prev,
      currentStage: 'fire_watch',
      fireWatchStartTime: new Date().toISOString()
    }));
    
    setTimers(prev => ({ ...prev, fireWatchElapsed: 0 }));
  }, []);
  
  const completeFireWatch = useCallback(() => {
    const shouldExtend = window.confirm(language === 'fr' ? 
      'Étendre la surveillance pour 3 heures supplémentaires (recommandé NFPA 51B)?' :
      'Extend monitoring for additional 3 hours (NFPA 51B recommended)?'
    );
    
    if (shouldExtend) {
      setFireWatchData(prev => ({
        ...prev,
        currentStage: 'extended_monitoring',
        extendedMonitoringEndTime: new Date(Date.now() + 10800000).toISOString() // +3 heures
      }));
      setTimers(prev => ({ ...prev, extendedElapsed: 0 }));
    } else {
      setFireWatchData(prev => ({
        ...prev,
        currentStage: 'completed',
        fireWatchEndTime: new Date().toISOString(),
        isActive: false
      }));
      setTimers(prev => ({ ...prev, isRunning: false }));
    }
  }, [language]);
  
  // =================== INCIDENT REPORTING ===================
  
  const reportIncident = useCallback(() => {
    if (!newIncident.description || !newIncident.severity) return;
    
    const incident: FireIncident = {
      id: `incident_${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: newIncident.severity as FireIncident['severity'],
      description: newIncident.description,
      actionTaken: newIncident.actionTaken || '',
      reportedBy: 'Surveillant de feu', // En production, récupérer l'utilisateur actuel
      resolved: false,
      photos: []
    };
    
    setFireWatchData(prev => ({
      ...prev,
      incidents: [...prev.incidents, incident]
    }));
    
    setNewIncident({});
    setShowIncidentForm(false);
    
    // Alerter si incident critique
    if (incident.severity === 'critical') {
      onFireDetected?.();
      alert(t.alerts.fireDetected);
    }
  }, [newIncident, onFireDetected, t.alerts.fireDetected]);
  
  // =================== UTILITY FUNCTIONS ===================
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };
  
  const getStageProgress = (): number => {
    switch (fireWatchData.currentStage) {
      case 'pre_work': return 0;
      case 'during_work': return 25;
      case 'fire_watch': return Math.min(75, 50 + (timers.fireWatchElapsed / 3600) * 25); // 25% base + 25% pour 60min
      case 'extended_monitoring': return Math.min(100, 75 + (timers.extendedElapsed / 10800) * 25); // 75% base + 25% pour 3h
      case 'completed': return 100;
      default: return 0;
    }
  };
  
  // =================== RENDU ===================
  
  return (
    <>
      {/* Styles CSS intégrés pour éviter les dépendances externes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .fire-watch-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(239, 68, 68, 0.3);
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .fire-watch-header {
            background: rgba(239, 68, 68, 0.1);
            border-bottom: 1px solid rgba(239, 68, 68, 0.3);
            padding: 20px;
          }
          
          .fire-watch-title {
            color: #ef4444;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .fire-watch-subtitle {
            color: #dc2626;
            margin: 0 0 16px 0;
            font-size: 14px;
          }
          
          .stage-progress {
            background: rgba(15, 23, 42, 0.8);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          
          .progress-bar {
            height: 8px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 4px;
            overflow: hidden;
            margin: 8px 0;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            transition: width 0.3s ease;
            border-radius: 4px;
          }
          
          .timer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 16px 0;
          }
          
          .timer-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }
          
          .timer-value {
            font-size: 24px;
            font-weight: 800;
            color: #ef4444;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
          }
          
          .timer-label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .nfpa-compliance {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
          }
          
          .compliance-title {
            color: #3b82f6;
            font-weight: 600;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .compliance-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0;
            color: #94a3b8;
            font-size: 14px;
          }
          
          .compliance-check {
            color: #22c55e;
          }
          
          .fire-watch-tabs {
            display: flex;
            background: rgba(15, 23, 42, 0.8);
            border-bottom: 1px solid rgba(100, 116, 139, 0.3);
            overflow-x: auto;
          }
          
          .fire-watch-tab {
            padding: 12px 16px;
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid transparent;
          }
          
          .fire-watch-tab.active {
            color: #ef4444;
            border-bottom-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .fire-watch-content {
            padding: 20px;
            min-height: 400px;
          }
          
          .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }
          
          .btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid;
            background: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-primary {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
          
          .btn-primary:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-success {
            border-color: #22c55e;
            color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
          }
          
          .btn-warning {
            border-color: #f59e0b;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
          
          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .incident-form {
            background: rgba(239, 68, 68, 0.05);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
          }
          
          .form-group {
            margin: 12px 0;
          }
          
          .form-label {
            display: block;
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 6px;
          }
          
          .form-input,
          .form-select,
          .form-textarea {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid rgba(100, 116, 139, 0.3);
            background: rgba(15, 23, 42, 0.8);
            color: white;
            font-size: 14px;
            box-sizing: border-box;
          }
          
          .form-textarea {
            min-height: 80px;
            resize: vertical;
          }
          
          .equipment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
          }
          
          .equipment-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
          }
          
          .equipment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .equipment-title {
            color: #e2e8f0;
            font-weight: 600;
            margin: 0;
          }
          
          .condition-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .condition-excellent {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }
          
          .condition-good {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
          }
          
          .condition-needs-attention {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
          }
          
          .condition-defective {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
          }
          
          .incident-list {
            display: grid;
            gap: 12px;
          }
          
          .incident-item {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 12px;
          }
          
          .incident-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          
          .incident-severity {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .severity-critical {
            background: rgba(239, 68, 68, 0.3);
            color: #ef4444;
          }
          
          .severity-major {
            background: rgba(245, 158, 11, 0.3);
            color: #f59e0b;
          }
          
          .severity-moderate {
            background: rgba(59, 130, 246, 0.3);
            color: #3b82f6;
          }
          
          .severity-minor {
            background: rgba(34, 197, 94, 0.3);
            color: #22c55e;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .timer-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .equipment-grid {
              grid-template-columns: 1fr;
            }
            
            .action-buttons {
              justify-content: center;
            }
            
            .fire-watch-tabs {
              justify-content: flex-start;
            }
          }
        `
      }} />

      <div className="fire-watch-container">
        {/* Header */}
        <div className="fire-watch-header">
          <h3 className="fire-watch-title">
            <Flame size={24} />
            {t.title}
          </h3>
          <p className="fire-watch-subtitle">{t.subtitle}</p>
          
          {/* Progression des étapes */}
          <div className="stage-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                {t.stages[fireWatchData.currentStage]}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                {Math.round(getStageProgress())}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getStageProgress()}%` }}
              />
            </div>
          </div>
          
          {/* Timers principaux */}
          <div className="timer-grid">
            <div className="timer-card">
              <div className="timer-label">{t.timers.workDuration}</div>
              <div className="timer-value">{formatTime(timers.workElapsed)}</div>
            </div>
            
            {fireWatchData.currentStage === 'fire_watch' && (
              <div className="timer-card">
                <div className="timer-label">{t.timers.fireWatchRemaining}</div>
                <div className="timer-value" style={{ color: timers.fireWatchElapsed >= 3600 ? '#ef4444' : '#22c55e' }}>
                  {formatTime(Math.max(0, 3600 - timers.fireWatchElapsed))}
                </div>
              </div>
            )}
            
            {fireWatchData.currentStage === 'extended_monitoring' && (
              <div className="timer-card">
                <div className="timer-label">{t.timers.extendedRemaining}</div>
                <div className="timer-value" style={{ color: timers.extendedElapsed >= 10800 ? '#ef4444' : '#f59e0b' }}>
                  {formatTime(Math.max(0, 10800 - timers.extendedElapsed))}
                </div>
              </div>
            )}
            
            <div className="timer-card">
              <div className="timer-label">{t.timers.totalElapsed}</div>
              <div className="timer-value">
                {formatTime(timers.workElapsed + timers.fireWatchElapsed + timers.extendedElapsed)}
              </div>
            </div>
          </div>
        </div>

        {/* Conformité NFPA 51B */}
        <div style={{ padding: '20px' }}>
          <div className="nfpa-compliance">
            <h4 className="compliance-title">
              <Shield size={16} />
              {t.nfpaCompliance.title}
            </h4>
            
            <div className="compliance-item">
              <CheckCircle size={14} className="compliance-check" />
              {t.nfpaCompliance.fireWatch60Min}
            </div>
            
            <div className="compliance-item">
              <CheckCircle size={14} className="compliance-check" />
              {t.nfpaCompliance.extendedMonitoring}
            </div>
            
            <div className="compliance-item">
              <CheckCircle size={14} className="compliance-check" />
              {t.nfpaCompliance.continuousObservation}
            </div>
            
            <div className="compliance-item">
              <CheckCircle size={14} className="compliance-check" />
              {t.nfpaCompliance.trainedPersonnel}
            </div>
            
            <div className="compliance-item">
              <CheckCircle size={14} className="compliance-check" />
              {t.nfpaCompliance.fireSuppressionReady}
            </div>
          </div>

          {/* Actions principales */}
          <div className="action-buttons">
            {fireWatchData.currentStage === 'pre_work' && editable && (
              <button className="btn btn-success" onClick={startWork}>
                <Play size={16} />
                {t.timers.startWork}
              </button>
            )}
            
            {fireWatchData.currentStage === 'during_work' && editable && (
              <button className="btn btn-warning" onClick={endWork}>
                <Square size={16} />
                {t.timers.endWork}
              </button>
            )}
            
            {fireWatchData.currentStage === 'fire_watch' && editable && (
              <button className="btn btn-primary" onClick={completeFireWatch}>
                <CheckCircle size={16} />
                {t.timers.endFireWatch}
              </button>
            )}
            
            {timers.isRunning && (
              <button 
                className="btn btn-warning" 
                onClick={() => setTimers(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              >
                {timers.isPaused ? <Play size={16} /> : <Pause size={16} />}
                {timers.isPaused ? t.timers.resume : t.timers.pause}
              </button>
            )}
            
            <button className="btn btn-primary" onClick={() => setShowIncidentForm(true)}>
              <AlertTriangle size={16} />
              {t.incidents.reportIncident}
            </button>
            
            <button className="btn btn-success" onClick={() => console.log('Export rapport', fireWatchData)}>
              <Save size={16} />
              {t.actions.export}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="fire-watch-tabs">
          {[
            { id: 'overview', icon: Timer, label: 'Vue d\'ensemble' },
            { id: 'personnel', icon: Users, label: t.personnel.title },
            { id: 'equipment', icon: Shield, label: t.equipment.title },
            { id: 'incidents', icon: AlertTriangle, label: t.incidents.title },
            { id: 'environment', icon: Thermometer, label: t.environment.title }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`fire-watch-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu */}
        <div className="fire-watch-content">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 12px 0' }}>Statut Actuel</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Timer size={16} style={{ color: '#ef4444' }} />
                    <span style={{ color: '#ef4444' }}>
                      {t.stages[fireWatchData.currentStage]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <MapPin size={16} style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>{workLocation}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} style={{ color: fireWatchData.nfpa51bCompliant ? '#22c55e' : '#f59e0b' }} />
                    <span style={{ color: fireWatchData.nfpa51bCompliant ? '#22c55e' : '#f59e0b', fontSize: '14px' }}>
                      {fireWatchData.nfpa51bCompliant ? 'NFPA 51B Conforme' : 'Vérification en cours'}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 12px 0' }}>Statistiques</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Personnel actif:</span>
                    <span style={{ color: '#22c55e', fontWeight: '600' }}>
                      {fireWatchData.fireWatchPersonnel.filter(p => p.isActive).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Incidents signalés:</span>
                    <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                      {fireWatchData.incidents.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Temps écoulé:</span>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      {formatTime(timers.workElapsed + timers.fireWatchElapsed + timers.extendedElapsed)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire d'incident */}
          {showIncidentForm && (
            <div className="incident-form">
              <h4 style={{ color: '#ef4444', margin: '0 0 16px 0' }}>
                <AlertTriangle size={16} style={{ marginRight: '8px' }} />
                {t.incidents.reportIncident}
              </h4>
              
              <div className="form-group">
                <label className="form-label">{t.incidents.severity}</label>
                <select 
                  className="form-select"
                  value={newIncident.severity || ''}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as FireIncident['severity'] }))}
                >
                  <option value="">Sélectionner...</option>
                  <option value="minor">{t.incidents.minor}</option>
                  <option value="moderate">{t.incidents.moderate}</option>
                  <option value="major">{t.incidents.major}</option>
                  <option value="critical">{t.incidents.critical}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.incidents.description}</label>
                <textarea 
                  className="form-textarea"
                  value={newIncident.description || ''}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'incident observé..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.incidents.actionTaken}</label>
                <textarea 
                  className="form-textarea"
                  value={newIncident.actionTaken || ''}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, actionTaken: e.target.value }))}
                  placeholder="Actions prises pour résoudre l'incident..."
                />
              </div>
              
              <div className="action-buttons">
                <button className="btn btn-success" onClick={reportIncident}>
                  <Save size={16} />
                  Signaler incident
                </button>
                <button className="btn btn-warning" onClick={() => setShowIncidentForm(false)}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des incidents */}
          {activeTab === 'incidents' && (
            <div>
              <h4 style={{ color: '#e2e8f0', marginBottom: '16px' }}>
                {t.incidents.title} ({fireWatchData.incidents.length})
              </h4>
              
              {fireWatchData.incidents.length > 0 ? (
                <div className="incident-list">
                  {fireWatchData.incidents.map(incident => (
                    <div key={incident.id} className="incident-item">
                      <div className="incident-header">
                        <span style={{ color: '#e2e8f0', fontSize: '12px' }}>
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                        <span className={`incident-severity severity-${incident.severity}`}>
                          {t.incidents[incident.severity as keyof typeof t.incidents]}
                        </span>
                      </div>
                      
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                        {incident.description}
                      </div>
                      
                      {incident.actionTaken && (
                        <div style={{ 
                          background: 'rgba(34, 197, 94, 0.1)',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#94a3b8'
                        }}>
                          <strong style={{ color: '#22c55e' }}>Action: </strong>
                          {incident.actionTaken}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  <AlertTriangle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Aucun incident signalé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HotWorkFireWatch;