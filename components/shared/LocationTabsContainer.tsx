'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle, AlertCircle, Settings, Wrench } from 'lucide-react';

interface WorkLocation {
  id: string;
  name: string;
  description: string;
  zone: string;
  building?: string;
  floor?: string;
  maxWorkers: number;
  currentWorkers: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  estimatedDuration: string;
  startTime?: string;
  endTime?: string;
  coordinates?: { lat: number; lng: number };
}

interface Equipment {
  id: string;
  name: string;
  category: 'ppe' | 'tool' | 'safety_device' | 'other';
  required: boolean;
  quantity?: number;
  notes?: string;
}

interface ControlMeasure {
  id: string;
  name: string;
  type: 'preventive' | 'protective' | 'corrective';
  description: string;
  responsible?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface LocationTabsContainerProps {
  workLocations: WorkLocation[];
  equipmentControlMode: 'global' | 'by_location';
  locationBasedConfig?: {
    [locationId: string]: {
      equipment: Equipment[];
      controlMeasures: ControlMeasure[];
      assignedTeamLeader?: string;
      completionStatus?: 'pending' | 'in_progress' | 'completed';
    }
  };
  step: 2 | 3; // Step 2 = Equipment, Step 3 = Hazards/Controls
  onLocationDataChange: (locationId: string, section: 'equipment' | 'controlMeasures', data: any) => void;
  language?: 'fr' | 'en';
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
  children?: (activeLocationId: string, locationConfig: any) => React.ReactNode;
}

const translations = {
  fr: {
    globalMode: "Mode global actif",
    globalModeDesc: "Configuration définie par le chargé de projet",
    byLocationMode: "Configuration par emplacement",
    locationNotConfigured: "Emplacement non configuré",
    configuredByTeamLeader: "Configuré par le chef d'équipe",
    assignedTeamLeader: "Chef d'équipe assigné",
    completionStatus: "Statut",
    pending: "En attente",
    in_progress: "En cours",
    completed: "Terminé",
    noLocationsAvailable: "Aucun emplacement de travail défini",
    defineLocationsInStep1: "Veuillez définir les emplacements de travail dans l'Étape 1",
    equipment: "Équipements",
    hazards: "Dangers et Contrôles",
    workers: "Travailleurs",
    zone: "Zone",
    building: "Bâtiment",
    floor: "Étage",
    maxWorkers: "Max travailleurs"
  },
  en: {
    globalMode: "Global mode active",
    globalModeDesc: "Configuration defined by project manager",
    byLocationMode: "Configuration by location",
    locationNotConfigured: "Location not configured",
    configuredByTeamLeader: "Configured by team leader",
    assignedTeamLeader: "Assigned team leader",
    completionStatus: "Status",
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
    noLocationsAvailable: "No work locations defined",
    defineLocationsInStep1: "Please define work locations in Step 1",
    equipment: "Equipment",
    hazards: "Hazards & Controls",
    workers: "Workers",
    zone: "Zone",
    building: "Building",
    floor: "Floor",
    maxWorkers: "Max workers"
  }
};

export default function LocationTabsContainer({
  workLocations,
  equipmentControlMode,
  locationBasedConfig = {},
  step,
  onLocationDataChange,
  language = 'fr',
  userRole = 'worker',
  children
}: LocationTabsContainerProps) {
  const t = translations[language];
  const [activeLocationId, setActiveLocationId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Détection responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialiser l'emplacement actif
  useEffect(() => {
    if (workLocations.length > 0 && !activeLocationId) {
      setActiveLocationId(workLocations[0].id);
    }
  }, [workLocations, activeLocationId]);

  // Si mode global, afficher message explicatif
  if (equipmentControlMode === 'global') {
    return (
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: '#3b82f6',
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: '600'
        }}>
          <Settings size={20} />
          {t.globalMode}
        </div>
        <div style={{
          fontSize: isMobile ? '14px' : '16px',
          color: '#94a3b8',
          lineHeight: '1.5'
        }}>
          {t.globalModeDesc}
        </div>
      </div>
    );
  }

  // Si pas d'emplacements définis
  if (!workLocations || workLocations.length === 0) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.05)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: '#ef4444',
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: '600'
        }}>
          <AlertCircle size={20} />
          {t.noLocationsAvailable}
        </div>
        <div style={{
          fontSize: isMobile ? '14px' : '16px',
          color: '#94a3b8',
          lineHeight: '1.5'
        }}>
          {t.defineLocationsInStep1}
        </div>
      </div>
    );
  }

  const getCompletionColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#f59e0b';
      case 'pending': 
      default: return '#6b7280';
    }
  };

  const getCompletionIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'in_progress': return <Settings size={14} className="animate-spin" />;
      case 'pending':
      default: return <AlertCircle size={14} />;
    }
  };

  const activeLocationConfig = locationBasedConfig[activeLocationId] || {
    equipment: [],
    controlMeasures: [],
    assignedTeamLeader: '',
    completionStatus: 'pending'
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      margin: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={20} style={{ color: '#f59e0b' }} />
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#e2e8f0'
          }}>
            {t.byLocationMode}
          </h3>
        </div>
        
        {/* Step indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {step === 2 ? <Wrench size={14} /> : <Settings size={14} />}
          {step === 2 ? t.equipment : t.hazards}
        </div>
      </div>

      {/* Onglets des emplacements */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        overflowX: 'auto',
        marginBottom: '24px',
        paddingBottom: '8px'
      }}>
        {workLocations.map((location) => {
          const locationConfig = locationBasedConfig[location.id];
          const isActive = activeLocationId === location.id;
          const completionStatus = locationConfig?.completionStatus || 'pending';
          
          return (
            <button
              key={location.id}
              onClick={() => setActiveLocationId(location.id)}
              style={{
                minWidth: isMobile ? '140px' : '180px',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '8px',
                border: `2px solid ${isActive ? '#f59e0b' : 'rgba(100, 116, 139, 0.3)'}`,
                background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                color: isActive ? '#f59e0b' : '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: isMobile ? '13px' : '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {location.name}
                </div>
                <div style={{ color: getCompletionColor(completionStatus) }}>
                  {getCompletionIcon(completionStatus)}
                </div>
              </div>
              
              <div style={{
                fontSize: '11px',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                {location.zone && `${t.zone}: ${location.zone}`}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                opacity: 0.6
              }}>
                <Users size={10} />
                {location.currentWorkers}/{location.maxWorkers}
              </div>
              
              {/* Statut de completion */}
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getCompletionColor(completionStatus)
              }} />
            </button>
          );
        })}
      </div>

      {/* Informations de l'emplacement actif */}
      {activeLocationId && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            {workLocations.find(l => l.id === activeLocationId) && (() => {
              const activeLocation = workLocations.find(l => l.id === activeLocationId)!;
              return (
                <>
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: '500' }}>Description: </span>
                    <span style={{ color: '#e2e8f0' }}>{activeLocation.description || 'N/A'}</span>
                  </div>
                  {activeLocation.building && (
                    <div>
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{t.building}: </span>
                      <span style={{ color: '#e2e8f0' }}>{activeLocation.building}</span>
                    </div>
                  )}
                  {activeLocation.floor && (
                    <div>
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{t.floor}: </span>
                      <span style={{ color: '#e2e8f0' }}>{activeLocation.floor}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#94a3b8', fontWeight: '500' }}>{t.completionStatus}: </span>
                    <span style={{ 
                      color: getCompletionColor(activeLocationConfig.completionStatus),
                      fontWeight: '600'
                    }}>
                      {activeLocationConfig.completionStatus === 'completed' && t.completed}
                      {activeLocationConfig.completionStatus === 'in_progress' && t.in_progress}
                      {(!activeLocationConfig.completionStatus || activeLocationConfig.completionStatus === 'pending') && t.pending}
                    </span>
                  </div>
                  {activeLocationConfig.assignedTeamLeader && (
                    <div>
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{t.assignedTeamLeader}: </span>
                      <span style={{ color: '#e2e8f0' }}>{activeLocationConfig.assignedTeamLeader}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Contenu spécifique à l'emplacement (rendu par les enfants) */}
      {children && activeLocationId && (
        <div>
          {children(activeLocationId, activeLocationConfig)}
        </div>
      )}
    </div>
  );
}