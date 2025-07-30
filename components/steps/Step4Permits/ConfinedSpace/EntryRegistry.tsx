"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, 
  Users, PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock,
  History, UserPlus, UserMinus
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
  buttonWarning: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
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
  };
  personnel_requirements: {
    min_age: number;
    attendant_required: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
}

interface SurveillantShift {
  id: string;
  name: string;
  company: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  status: 'active' | 'completed';
}

interface EntrySession {
  id: string;
  entry_time: string;
  exit_time?: string;
  duration?: number;
  status: 'inside' | 'completed';
}

interface Entrant {
  id: string;
  name: string;
  company: string;
  total_entries: number;
  total_duration: number;
  current_status: 'outside' | 'inside';
  entry_sessions: EntrySession[];
  added_time: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  condition: 'good' | 'fair' | 'poor';
  checked_in: boolean;
  checked_out: boolean;
  assigned_to?: string;
  notes?: string;
}

interface EntryRegistryProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
  atmosphericReadings?: any[];
  setAtmosphericReadings?: (readings: any[] | ((prev: any[]) => any[])) => void;
}

// =================== COMPOSANT ENTRY REGISTRY ===================
const EntryRegistry: React.FC<EntryRegistryProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles: originalStyles,
  updateParentData,
  atmosphericReadings = [],
  setAtmosphericReadings
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [surveillantHistory, setSurveillantHistory] = useState<SurveillantShift[]>(permitData.surveillant_history || []);
  const [entrants, setEntrants] = useState<Entrant[]>(permitData.entrants || []);
  const [equipment, setEquipment] = useState<Equipment[]>(permitData.equipment || []);
  const [currentSurveillant, setCurrentSurveillant] = useState<SurveillantShift | null>(
    surveillantHistory.find(s => s.status === 'active') || null
  );
  
  const [newSurveillant, setNewSurveillant] = useState({
    name: '',
    company: ''
  });
  
  const [newEntrant, setNewEntrant] = useState({
    name: '',
    company: ''
  });
  
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serial_number: '',
    condition: 'good' as 'good' | 'fair' | 'poor'
  });

  // =================== FONCTIONS UTILITAIRES ===================
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('fr-CA');
  };

  // =================== FONCTIONS SURVEILLANT ===================
  const startSurveillance = () => {
    if (!newSurveillant.name || !newSurveillant.company) {
      alert('⚠️ Veuillez remplir tous les champs du surveillant');
      return;
    }

    if (currentSurveillant) {
      alert('⚠️ Un surveillant est déjà en service. Terminez sa surveillance avant d\'en commencer une nouvelle.');
      return;
    }

    const surveillant: SurveillantShift = {
      id: `surveillant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newSurveillant.name,
      company: newSurveillant.company,
      start_time: new Date().toISOString(),
      status: 'active'
    };

    const updatedHistory = [...surveillantHistory, surveillant];
    setSurveillantHistory(updatedHistory);
    setCurrentSurveillant(surveillant);
    updateParentData('surveillant_history', updatedHistory);
    
    setNewSurveillant({ name: '', company: '' });
  };

  const endSurveillance = () => {
    if (!currentSurveillant) return;

    const now = new Date();
    const startTime = new Date(currentSurveillant.start_time);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    const updatedSurveillant: SurveillantShift = {
      ...currentSurveillant,
      end_time: now.toISOString(),
      duration,
      status: 'completed'
    };

    const updatedHistory = surveillantHistory.map(s => 
      s.id === currentSurveillant.id ? updatedSurveillant : s
    );

    setSurveillantHistory(updatedHistory);
    setCurrentSurveillant(null);
    updateParentData('surveillant_history', updatedHistory);
  };

  const replaceSurveillant = () => {
    if (!newSurveillant.name || !newSurveillant.company) {
      alert('⚠️ Veuillez remplir tous les champs du nouveau surveillant');
      return;
    }

    if (currentSurveillant) {
      endSurveillance();
    }

    setTimeout(() => {
      startSurveillance();
    }, 100);
  };

  // =================== FONCTIONS ENTRANTS ===================
  const addEntrant = () => {
    if (!newEntrant.name || !newEntrant.company) {
      alert('⚠️ Veuillez remplir tous les champs de l\'entrant');
      return;
    }

    const entrant: Entrant = {
      id: `entrant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEntrant.name,
      company: newEntrant.company,
      total_entries: 0,
      total_duration: 0,
      current_status: 'outside',
      entry_sessions: [],
      added_time: new Date().toISOString()
    };

    const updatedEntrants = [...entrants, entrant];
    setEntrants(updatedEntrants);
    updateParentData('entrants', updatedEntrants);
    
    setNewEntrant({ name: '', company: '' });
  };

  const toggleEntrantEntry = (entrantId: string) => {
    if (!currentSurveillant) {
      alert('⚠️ Un surveillant doit être en service avant qu\'un entrant puisse entrer dans l\'espace clos.');
      return;
    }

    const updatedEntrants = entrants.map(entrant => {
      if (entrant.id === entrantId) {
        const now = new Date();
        
        if (entrant.current_status === 'outside') {
          // Entrée dans l'espace clos
          const newSession: EntrySession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entry_time: now.toISOString(),
            status: 'inside'
          };

          return {
            ...entrant,
            current_status: 'inside' as const,
            entry_sessions: [...entrant.entry_sessions, newSession]
          };
        } else {
          // Sortie de l'espace clos
          const activeSession = entrant.entry_sessions.find(s => s.status === 'inside');
          if (!activeSession) return entrant;

          const entryTime = new Date(activeSession.entry_time);
          const duration = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

          const completedSession: EntrySession = {
            ...activeSession,
            exit_time: now.toISOString(),
            duration,
            status: 'completed'
          };

          const updatedSessions = entrant.entry_sessions.map(s => 
            s.id === activeSession.id ? completedSession : s
          );

          return {
            ...entrant,
            current_status: 'outside' as const,
            total_entries: entrant.total_entries + 1,
            total_duration: entrant.total_duration + duration,
            entry_sessions: updatedSessions
          };
        }
      }
      return entrant;
    });

    setEntrants(updatedEntrants);
    updateParentData('entrants', updatedEntrants);
  };

  const deleteEntrant = (entrantId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet entrant du registre?')) {
      const updatedEntrants = entrants.filter(e => e.id !== entrantId);
      setEntrants(updatedEntrants);
      updateParentData('entrants', updatedEntrants);
    }
  };

  // =================== FONCTIONS ÉQUIPEMENT (IDENTIQUES) ===================
  const addEquipmentItem = () => {
    if (!newEquipment.name || !newEquipment.serial_number) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const equipmentItem: Equipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEquipment.name,
      serial_number: newEquipment.serial_number,
      condition: newEquipment.condition,
      checked_in: false,
      checked_out: false
    };

    const updatedEquipment = [...equipment, equipmentItem];
    setEquipment(updatedEquipment);
    updateParentData('equipment', updatedEquipment);
    
    setNewEquipment({ name: '', serial_number: '', condition: 'good' });
  };

  const toggleEquipmentCheck = (equipmentId: string, type: 'in' | 'out') => {
    const updatedEquipment = equipment.map(item => {
      if (item.id === equipmentId) {
        if (type === 'in') {
          return { ...item, checked_in: !item.checked_in };
        } else {
          return { ...item, checked_out: !item.checked_out };
        }
      }
      return item;
    });
    
    setEquipment(updatedEquipment);
    updateParentData('equipment', updatedEquipment);
  };

  const deleteEquipment = (equipmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement?')) {
      const updatedEquipment = equipment.filter(e => e.id !== equipmentId);
      setEquipment(updatedEquipment);
      updateParentData('equipment', updatedEquipment);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return '#10b981';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Statistiques en temps réel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Timer style={{ width: '20px', height: '20px' }} />
          📊 Statistiques en Temps Réel
        </h3>
        
        <div style={styles.grid4}>
          <div style={{
            padding: '20px',
            backgroundColor: currentSurveillant ? 'rgba(34, 197, 94, 0.2)' : 'rgba(220, 38, 38, 0.2)',
            borderRadius: '12px',
            border: `2px solid ${currentSurveillant ? '#22c55e' : '#dc2626'}`,
            textAlign: 'center'
          }}>
            <Eye style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: currentSurveillant ? '#4ade80' : '#f87171',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: 'bold', 
              color: currentSurveillant ? '#86efac' : '#fca5a5',
              marginBottom: '8px'
            }}>
              {currentSurveillant ? 'ACTIF' : 'INACTIF'}
            </div>
            <div style={{ 
              color: currentSurveillant ? '#86efac' : '#fca5a5', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Surveillant
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            border: '2px solid #3b82f6',
            textAlign: 'center'
          }}>
            <Users style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#60a5fa',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#93c5fd',
              marginBottom: '8px'
            }}>
              {entrants.length}
            </div>
            <div style={{ 
              color: '#93c5fd', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Entrants
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: entrants.filter(e => e.current_status === 'inside').length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '12px',
            border: `2px solid ${entrants.filter(e => e.current_status === 'inside').length > 0 ? '#f59e0b' : '#6b7280'}`,
            textAlign: 'center'
          }}>
            <LogIn style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: entrants.filter(e => e.current_status === 'inside').length > 0 ? '#fbbf24' : '#9ca3af',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: entrants.filter(e => e.current_status === 'inside').length > 0 ? '#fde047' : '#9ca3af',
              marginBottom: '8px'
            }}>
              {entrants.filter(e => e.current_status === 'inside').length}
            </div>
            <div style={{ 
              color: entrants.filter(e => e.current_status === 'inside').length > 0 ? '#fde047' : '#9ca3af', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              À l'intérieur
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <Wrench style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#34d399',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#86efac',
              marginBottom: '8px'
            }}>
              {equipment.length}
            </div>
            <div style={{ 
              color: '#86efac', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Équipements
            </div>
          </div>
        </div>
      </div>

      {/* Section Surveillant */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Eye style={{ width: '20px', height: '20px' }} />
          👁️ Surveillant d'Espace Clos
        </h3>
        
        {/* Surveillant actuel */}
        {currentSurveillant ? (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            border: '2px solid #22c55e',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : '0'
            }}>
              <div>
                <div style={{ 
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#22c55e',
                  marginBottom: '8px'
                }}>
                  🟢 SURVEILLANT ACTIF
                </div>
                <div style={{ 
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  👤 {currentSurveillant.name}
                </div>
                <div style={{ 
                  color: '#9ca3af',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  🏢 {currentSurveillant.company}
                </div>
                <div style={{ 
                  color: '#86efac',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  🕐 Début surveillance: {formatTime(currentSurveillant.start_time)}
                </div>
              </div>
              
              <button
                onClick={endSurveillance}
                style={{
                  ...styles.button,
                  ...styles.buttonDanger,
                  width: 'auto',
                  padding: '12px 20px'
                }}
              >
                <LogOut style={{ width: '18px', height: '18px' }} />
                Terminer Surveillance
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            border: '2px solid #dc2626',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: '#ef4444',
              marginBottom: '8px'
            }}>
              ⚠️ AUCUN SURVEILLANT ACTIF
            </div>
            <div style={{ 
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              Un surveillant doit être en service avant que des entrants puissent accéder à l'espace clos.
            </div>
          </div>
        )}
        
        {/* Formulaire nouveau surveillant / remplacement */}
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>Nom du surveillant *</label>
            <input
              type="text"
              placeholder="Ex: Marie Dubois"
              value={newSurveillant.name}
              onChange={(e) => setNewSurveillant(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>Compagnie *</label>
            <input
              type="text"
              placeholder="Ex: Sécurité ABC Inc."
              value={newSurveillant.company}
              onChange={(e) => setNewSurveillant(prev => ({ ...prev, company: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            {currentSurveillant ? (
              <button
                onClick={replaceSurveillant}
                style={{
                  ...styles.button,
                  ...styles.buttonWarning
                }}
              >
                <UserCheck style={{ width: '18px', height: '18px' }} />
                Remplacer Surveillant
              </button>
            ) : (
              <button
                onClick={startSurveillance}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess
                }}
              >
                <Eye style={{ width: '18px', height: '18px' }} />
                Débuter Surveillance
              </button>
            )}
          </div>
        </div>
        
        {/* Historique des surveillants */}
        {surveillantHistory.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#d1d5db',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <History style={{ width: '18px', height: '18px' }} />
              📋 Historique des Surveillances
            </h4>
            
            <div style={{ 
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {surveillantHistory.slice().reverse().map((shift) => (
                <div
                  key={shift.id}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.6)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: `1px solid ${shift.status === 'active' ? '#22c55e' : '#6b7280'}`
                  }}
                >
                  <div style={styles.grid3}>
                    <div>
                      <div style={{ 
                        color: 'white',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        👤 {shift.name}
                      </div>
                      <div style={{ 
                        color: '#9ca3af',
                        fontSize: '13px'
                      }}>
                        🏢 {shift.company}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        color: '#d1d5db',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>
                        🕐 {formatTime(shift.start_time)}
                      </div>
                      {shift.end_time && (
                        <div style={{ 
                          color: '#d1d5db',
                          fontSize: '14px'
                        }}>
                          🕓 {formatTime(shift.end_time)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: shift.status === 'active' ? '#22c55e' : '#6b7280',
                        color: 'white'
                      }}>
                        {shift.status === 'active' ? '🟢 ACTIF' : '⚫ TERMINÉ'}
                      </span>
                      {shift.duration && (
                        <div style={{ 
                          color: '#9ca3af',
                          fontSize: '13px',
                          marginTop: '4px'
                        }}>
                          ⏱️ {formatDuration(shift.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Entrants */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          👷 Personnel Entrant ({entrants.length})
        </h3>
        
        {/* Formulaire ajout entrant */}
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>Nom de l'entrant *</label>
            <input
              type="text"
              placeholder="Ex: Pierre Martin"
              value={newEntrant.name}
              onChange={(e) => setNewEntrant(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>Compagnie *</label>
            <input
              type="text"
              placeholder="Ex: Construction XYZ"
              value={newEntrant.company}
              onChange={(e) => setNewEntrant(prev => ({ ...prev, company: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={addEntrant}
              style={{
                ...styles.button,
                ...styles.buttonSuccess
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              Ajouter Entrant
            </button>
          </div>
        </div>
        
        {/* Liste des entrants */}
        {entrants.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151',
            marginTop: '20px'
          }}>
            <Users style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucun entrant enregistré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez des entrants ci-dessus pour commencer le registre d'entrée.
            </p>
          </div>
        ) : (
          <div style={{ 
            marginTop: '20px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            {entrants.map((entrant) => (
              <div
                key={entrant.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: `2px solid ${entrant.current_status === 'inside' ? '#f59e0b' : '#4b5563'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '16px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '12px' : '0'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: 'white', 
                      fontSize: isMobile ? '16px' : '18px',
                      marginBottom: '4px'
                    }}>
                      👷 {entrant.name}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      🏢 {entrant.company}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: entrant.current_status === 'inside' ? '#f59e0b' : '#6b7280',
                        color: 'white'
                      }}>
                        {entrant.current_status === 'inside' ? '🟡 À L\'INTÉRIEUR' : '⚫ À L\'EXTÉRIEUR'}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}>
                        📊 {entrant.total_entries} entrées
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#10b981',
                        color: 'white'
                      }}>
                        ⏱️ {formatDuration(entrant.total_duration)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <button
                      onClick={() => toggleEntrantEntry(entrant.id)}
                      disabled={!currentSurveillant}
                      style={{
                        ...styles.button,
                        ...(entrant.current_status === 'outside' ? styles.buttonSuccess : styles.buttonDanger),
                        width: 'auto',
                        padding: '8px 12px',
                        fontSize: '14px',
                        minHeight: 'auto',
                        opacity: !currentSurveillant ? 0.5 : 1,
                        cursor: !currentSurveillant ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {entrant.current_status === 'outside' ? (
                        <>
                          <LogIn style={{ width: '16px', height: '16px' }} />
                          Marquer Entrée
                        </>
                      ) : (
                        <>
                          <LogOut style={{ width: '16px', height: '16px' }} />
                          Marquer Sortie
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => deleteEntrant(entrant.id)}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        width: 'auto',
                        padding: '8px 12px',
                        fontSize: '14px',
                        minHeight: 'auto'
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                      Supprimer
                    </button>
                  </div>
                </div>
                
                {/* Historique des sessions d'entrée */}
                {entrant.entry_sessions.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#d1d5db',
                      marginBottom: '12px'
                    }}>
                      📋 Historique des entrées:
                    </h5>
                    
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {entrant.entry_sessions.slice().reverse().map((session, index) => (
                        <div
                          key={session.id}
                          style={{
                            padding: '12px',
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            borderRadius: '6px',
                            border: `1px solid ${session.status === 'inside' ? '#f59e0b' : '#6b7280'}`
                          }}
                        >
                          <div style={styles.grid3}>
                            <div>
                              <div style={{ color: '#d1d5db', fontSize: '13px' }}>
                                🕐 Entrée: {formatTime(session.entry_time)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#d1d5db', fontSize: '13px' }}>
                                {session.exit_time ? 
                                  `🕓 Sortie: ${formatTime(session.exit_time)}` : 
                                  '🟡 En cours...'
                                }
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#d1d5db', fontSize: '13px' }}>
                                {session.duration ? 
                                  `⏱️ ${formatDuration(session.duration)}` : 
                                  '⏱️ En cours...'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Équipements (identique à l'original) */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          🔧 Ajouter Équipement
        </h3>
        
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>Nom de l'équipement *</label>
            <input
              type="text"
              placeholder="Ex: Détecteur 4 gaz portable"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>N° série / Identification *</label>
            <input
              type="text"
              placeholder="Ex: MSA-001234"
              value={newEquipment.serial_number}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>État *</label>
            <select
              value={newEquipment.condition}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, condition: e.target.value as any }))}
              style={styles.input}
              required
            >
              <option value="good">✅ Bon état</option>
              <option value="fair">⚠️ État acceptable</option>
              <option value="poor">❌ À remplacer</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={addEquipmentItem}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            marginTop: '16px',
            justifyContent: 'center'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Ajouter Équipement
        </button>
      </div>

      {/* Section Contrôle Équipements */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Wrench style={{ width: '20px', height: '20px' }} />
          🔧 Contrôle Équipements Obligatoires ({equipment.length})
        </h3>
        
        {equipment.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Wrench style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucun équipement enregistré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez les équipements obligatoires ci-dessus pour assurer la traçabilité.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            maxHeight: isMobile ? '500px' : '600px',
            overflowY: 'auto'
          }}>
            {equipment.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: `2px solid ${getConditionColor(item.condition)}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '16px',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '12px' : '0'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: 'white', 
                      fontSize: isMobile ? '16px' : '18px',
                      marginBottom: '4px'
                    }}>
                      🔧 {item.name}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      📟 {item.serial_number}
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: getConditionColor(item.condition),
                      color: 'white'
                    }}>
                      {item.condition === 'good' ? '✅ Bon état' :
                       item.condition === 'fair' ? '⚠️ État acceptable' :
                       '❌ À remplacer'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <button
                      onClick={() => toggleEquipmentCheck(item.id, 'in')}
                      style={{
                        ...styles.button,
                        ...(item.checked_in ? styles.buttonSuccess : styles.buttonSecondary),
                        width: 'auto',
                        padding: '6px 10px',
                        fontSize: '12px',
                        minHeight: 'auto'
                      }}
                    >
                      <LogIn style={{ width: '14px', height: '14px' }} />
                      Entrée
                      {item.checked_in && <CheckCircle style={{ width: '14px', height: '14px' }} />}
                    </button>
                    
                    <button
                      onClick={() => toggleEquipmentCheck(item.id, 'out')}
                      style={{
                        ...styles.button,
                        ...(item.checked_out ? styles.buttonDanger : styles.buttonSecondary),
                        width: 'auto',
                        padding: '6px 10px',
                        fontSize: '12px',
                        minHeight: 'auto'
                      }}
                    >
                      <LogOut style={{ width: '14px', height: '14px' }} />
                      Sortie
                      {item.checked_out && <CheckCircle style={{ width: '14px', height: '14px' }} />}
                    </button>
                    
                    <button
                      onClick={() => deleteEquipment(item.id)}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        width: 'auto',
                        padding: '6px 10px',
                        fontSize: '12px',
                        minHeight: 'auto'
                      }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryRegistry;
