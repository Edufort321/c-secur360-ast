"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, 
  Users, PenTool, CheckCircle, X, Edit3, Copy, Wrench
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

interface PersonnelEntry {
  id: string;
  name: string;
  company: string;
  role: 'supervisor' | 'attendant' | 'entrant';
  entry_time?: string;
  exit_time?: string;
  status: 'outside' | 'inside';
  signature: string;
  signature_time: string;
  total_duration?: number;
  qualifications?: {
    age_verified: boolean;
    training_completed: boolean;
    medical_fitness: boolean;
    ppe_verified: boolean;
  };
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

interface LegalPersonnelData {
  // Surveillant qualifié
  attendant_qualifications: {
    age_verified: boolean;              // ≥18 ans
    confined_space_training: boolean;
    training_expiry_date: string;
    competent_person_designated: boolean;
    authority_to_evacuate: boolean;
  };
  
  // Entrants certifiés
  entrant_qualifications: {
    medical_fitness_confirmed: boolean;
    ppe_training_verified: boolean;
    emergency_procedures_trained: boolean;
    max_work_hours_respected: boolean;
  };
  
  // Communication obligatoire
  communication_system: {
    bidirectional_confirmed: boolean;
    system_type: string;              // Radio, interphone, etc.
    backup_communication: boolean;
    continuous_contact_maintained: boolean;
  };
  
  // Traçabilité légale
  legal_entry_log: boolean;
  regulatory_witness_present: boolean;
  permit_readily_available: boolean;
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
  atmosphericReadings?: AtmosphericReading[];
  setAtmosphericReadings?: (readings: AtmosphericReading[] | ((prev: AtmosphericReading[]) => AtmosphericReading[])) => void;
}

// =================== COMPOSANT ENTRY REGISTRY ===================
const EntryRegistry: React.FC<EntryRegistryProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles,
  updateParentData,
  atmosphericReadings = [],
  setAtmosphericReadings
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>(permitData.personnel || []);
  const [equipment, setEquipment] = useState<Equipment[]>(permitData.equipment || []);
  const [newPerson, setNewPerson] = useState({
    name: '',
    company: '',
    role: 'entrant' as 'supervisor' | 'attendant' | 'entrant'
  });
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serial_number: '',
    condition: 'good' as 'good' | 'fair' | 'poor'
  });

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Registre d'Entrée et Personnel Autorisé",
      supervisor: "Superviseur d'Entrée (Obligatoire)",
      attendants: "Surveillants d'Espace Clos",  
      entrants: "Personnel Entrant",
      equipment: "Contrôle Équipements Obligatoires",
      legalCompliance: "Conformité Réglementaire Personnel",
      supervisorRole: "RÔLE CRITIQUE",
      supervisorText: "Le superviseur d'entrée doit avoir les compétences et l'autorité pour contrôler l'accès à l'espace clos et ordonner l'évacuation (Art. 308 RSST).",
      attendantRole: "SURVEILLANCE CONTINUE",
      attendantText: "Surveillance continue, communication bidirectionnelle, autorité d'évacuation immédiate, ne doit jamais quitter son poste.",
      entrantRestrictions: "RESTRICTIONS",
      entrantText: "Âge minimum 18 ans, formation obligatoire, harnais de sécurité classe E, communication bidirectionnelle.",
      equipmentRequirements: "ÉQUIPEMENTS OBLIGATOIRES",
      equipmentText: "Détecteur 4 gaz, harnais classe E, ligne de vie, ARA, communication bidirectionnelle.",
      addSupervisor: "Ajouter Superviseur",
      addAttendant: "Ajouter Surveillant", 
      addEntrant: "Ajouter Entrant",
      addEquipment: "Ajouter Équipement",
      fullName: "Nom complet",
      company: "Compagnie/Organisation",
      signatureDate: "Date de signature",
      signatureTime: "Heure de signature", 
      certification: "Certification et Signature Électronique",
      entryTime: "Heure d'entrée",
      exitTime: "Heure de sortie",
      inside: "À L'INTÉRIEUR",
      outside: "À L'EXTÉRIEUR",
      markEntry: "Marquer Entrée",
      markExit: "Marquer Sortie",
      totalDuration: "Durée totale",
      equipmentName: "Nom de l'équipement",
      serialNumber: "N° série / Identification",
      condition: "État",
      goodCondition: "Bon état",
      fairCondition: "État acceptable", 
      poorCondition: "À remplacer",
      checkIn: "Entrée",
      checkOut: "Sortie",
      delete: "Supprimer",
      role: "Rôle",
      status: "Statut",
      duration: "Durée",
      actions: "Actions",
      personnelCount: "Personnel total",
      insideCount: "À l'intérieur",
      equipmentCount: "Équipements"
    },
    en: {
      title: "Entry Registry and Authorized Personnel",
      supervisor: "Entry Supervisor (Mandatory)",
      attendants: "Confined Space Attendants",
      entrants: "Entering Personnel", 
      equipment: "Mandatory Equipment Control",
      legalCompliance: "Personnel Regulatory Compliance",
      supervisorRole: "CRITICAL ROLE",
      supervisorText: "The entry supervisor must have the competence and authority to control access to the confined space and order evacuation (Art. 308 RSST).",
      attendantRole: "CONTINUOUS MONITORING",
      attendantText: "Continuous surveillance, bidirectional communication, immediate evacuation authority, must never leave their post.",
      entrantRestrictions: "RESTRICTIONS", 
      entrantText: "Minimum age 18 years, mandatory training, class E safety harness, bidirectional communication.",
      equipmentRequirements: "MANDATORY EQUIPMENT",
      equipmentText: "4-gas detector, class E harness, lifeline, SCBA, bidirectional communication.",
      addSupervisor: "Add Supervisor",
      addAttendant: "Add Attendant",
      addEntrant: "Add Entrant", 
      addEquipment: "Add Equipment",
      fullName: "Full name",
      company: "Company/Organization",
      signatureDate: "Signature date",
      signatureTime: "Signature time",
      certification: "Certification and Electronic Signature", 
      entryTime: "Entry time",
      exitTime: "Exit time",
      inside: "INSIDE",
      outside: "OUTSIDE",
      markEntry: "Mark Entry",
      markExit: "Mark Exit",
      totalDuration: "Total duration",
      equipmentName: "Equipment name",
      serialNumber: "Serial number / Identification",
      condition: "Condition",
      goodCondition: "Good condition",
      fairCondition: "Acceptable condition",
      poorCondition: "To replace",
      checkIn: "Check In",
      checkOut: "Check Out", 
      delete: "Delete",
      role: "Role",
      status: "Status",
      duration: "Duration",
      actions: "Actions",
      personnelCount: "Total personnel",
      insideCount: "Inside",
      equipmentCount: "Equipment"
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const addPerson = () => {
    if (!newPerson.name || !newPerson.company) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const person: PersonnelEntry = {
      id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newPerson.name,
      company: newPerson.company,
      role: newPerson.role,
      status: 'outside',
      signature: '',
      signature_time: new Date().toISOString()
    };

    const updatedPersonnel = [...personnel, person];
    setPersonnel(updatedPersonnel);
    updateParentData('personnel', updatedPersonnel);
    
    setNewPerson({ name: '', company: '', role: 'entrant' });
  };

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

  const toggleEntry = (personId: string) => {
    const updatedPersonnel = personnel.map(person => {
      if (person.id === personId) {
        const now = new Date();
        const currentTime = now.toISOString();
        
        if (person.status === 'outside') {
          return {
            ...person,
            status: 'inside' as const,
            entry_time: currentTime
          };
        } else {
          const entryTime = person.entry_time ? new Date(person.entry_time) : now;
          const duration = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
          
          return {
            ...person,
            status: 'outside' as const,
            exit_time: currentTime,
            total_duration: (person.total_duration || 0) + duration
          };
        }
      }
      return person;
    });
    
    setPersonnel(updatedPersonnel);
    updateParentData('personnel', updatedPersonnel);
  };

  const deletePerson = (personId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne du registre?')) {
      const updatedPersonnel = personnel.filter(p => p.id !== personId);
      setPersonnel(updatedPersonnel);
      updateParentData('personnel', updatedPersonnel);
    }
  };

  const deleteEquipment = (equipmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement?')) {
      const updatedEquipment = equipment.filter(e => e.id !== equipmentId);
      setEquipment(updatedEquipment);
      updateParentData('equipment', updatedEquipment);
    }
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supervisor': return '👨‍💼';
      case 'attendant': return '👁️';
      case 'entrant': return '👷';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor': return '#3b82f6';
      case 'attendant': return '#f59e0b';
      case 'entrant': return '#10b981';
      default: return '#6b7280';
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
      
      {/* Section Conformité Réglementaire Personnel */}
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
          <Users style={{ width: '24px', height: '24px', color: '#fecaca' }} />
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
            👥 <strong>PERSONNEL QUALIFIÉ OBLIGATOIRE</strong> : Toutes les personnes impliquées doivent respecter les exigences d'âge, formation et certification selon {PROVINCIAL_REGULATIONS[selectedProvince].code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            📋 <strong>Registre légal</strong> : Ce registre constitue une preuve légale d'entrée/sortie exigée lors d'inspections de {PROVINCIAL_REGULATIONS[selectedProvince].authority}.
          </p>
        </div>
        
        {/* Systèmes de communication obligatoires */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fecaca',
            marginBottom: '16px'
          }}>
            📻 Système de Communication Bidirectionnelle Obligatoire
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Type de système *</label>
              <select
                value={permitData.communication_system?.system_type || ''}
                onChange={(e) => updatePermitData({ 
                  communication_system: { 
                    ...permitData.communication_system, 
                    system_type: e.target.value 
                  }
                })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                required
              >
                <option value="">Sélectionner système</option>
                <option value="radio_uhf">📻 Radio UHF/VHF</option>
                <option value="intercom">🎤 Système interphone</option>
                <option value="cell_phone">📱 Téléphone cellulaire</option>
                <option value="hardwired">☎️ Ligne téléphonique filaire</option>
                <option value="satellite">🛰️ Communication satellite</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(254, 202, 202, 0.3)',
                width: '100%'
              }}>
                <input
                  type="checkbox"
                  id="backup_communication"
                  checked={permitData.communication_system?.backup_communication || false}
                  onChange={(e) => updatePermitData({ 
                    communication_system: { 
                      ...permitData.communication_system, 
                      backup_communication: e.target.checked 
                    }
                  })}
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#ef4444'
                  }}
                  required
                />
                <label 
                  htmlFor="backup_communication"
                  style={{
                    color: '#fecaca',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  🔄 <strong>Système de sauvegarde</strong> disponible *
                </label>
              </div>
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
              id="bidirectional_confirmed"
              checked={permitData.communication_system?.bidirectional_confirmed || false}
              onChange={(e) => updatePermitData({ 
                communication_system: { 
                  ...permitData.communication_system, 
                  bidirectional_confirmed: e.target.checked 
                }
              })}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="bidirectional_confirmed"
              style={{
                color: '#fecaca',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              📻 <strong>COMMUNICATION BIDIRECTIONNELLE CONFIRMÉE</strong> : Communication continue entre surveillant et entrants vérifiée *
            </label>
          </div>
        </div>
        
        {/* Traçabilité légale */}
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
            id="permit_readily_available"
            checked={permitData.permit_readily_available || false}
            onChange={(e) => updatePermitData({ permit_readily_available: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              accentColor: '#ef4444'
            }}
            required
          />
          <label 
            htmlFor="permit_readily_available"
            style={{
              color: '#fecaca',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            📋 <strong>PERMIS ACCESSIBLE</strong> : Ce permis est disponible à tous les intervenants sur le site de travail *
          </label>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Timer style={{ width: '20px', height: '20px' }} />
          📊 Statistiques en Temps Réel
        </h3>
        
        <div style={styles.grid3}>
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
              {personnel.length}
            </div>
            <div style={{ 
              color: '#93c5fd', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {texts.personnelCount}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: personnel.filter(p => p.status === 'inside').length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '12px',
            border: `2px solid ${personnel.filter(p => p.status === 'inside').length > 0 ? '#f59e0b' : '#6b7280'}`,
            textAlign: 'center'
          }}>
            <Eye style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: personnel.filter(p => p.status === 'inside').length > 0 ? '#fbbf24' : '#9ca3af',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: personnel.filter(p => p.status === 'inside').length > 0 ? '#fde047' : '#9ca3af',
              marginBottom: '8px'
            }}>
              {personnel.filter(p => p.status === 'inside').length}
            </div>
            <div style={{ 
              color: personnel.filter(p => p.status === 'inside').length > 0 ? '#fde047' : '#9ca3af', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {texts.insideCount}
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
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {texts.equipmentCount}
            </div>
          </div>
        </div>
      </div>

      {/* Section Ajout Personnel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          👥 Ajouter Personnel Autorisé
        </h3>
        
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>{texts.fullName} *</label>
            <input
              type="text"
              placeholder="Ex: Jean Tremblay"
              value={newPerson.name}
              onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.company} *</label>
            <input
              type="text"
              placeholder="Ex: Entreprises ABC Inc."
              value={newPerson.company}
              onChange={(e) => setNewPerson(prev => ({ ...prev, company: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.role} *</label>
            <select
              value={newPerson.role}
              onChange={(e) => setNewPerson(prev => ({ ...prev, role: e.target.value as any }))}
              style={styles.input}
              required
            >
              <option value="entrant">👷 Entrant</option>
              <option value="attendant">👁️ Surveillant</option>
              <option value="supervisor">👨‍💼 Superviseur</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={addPerson}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            marginTop: '16px',
            justifyContent: 'center'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Ajouter au Registre
        </button>
      </div>

      {/* Section Registre Personnel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          📋 {texts.title} ({personnel.length})
        </h3>
        
        {personnel.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Users style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucun personnel enregistré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez du personnel autorisé ci-dessus pour commencer le registre d'entrée.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            maxHeight: isMobile ? '600px' : '700px',
            overflowY: 'auto'
          }}>
            {personnel.map((person) => (
              <div
                key={person.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: `2px solid ${person.status === 'inside' ? '#f59e0b' : '#4b5563'}`,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{getRoleIcon(person.role)}</span>
                    <div>
                      <div style={{ 
                        fontWeight: '700', 
                        color: 'white', 
                        fontSize: isMobile ? '16px' : '18px',
                        marginBottom: '4px'
                      }}>
                        {person.name}
                      </div>
                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        🏢 {person.company}
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getRoleColor(person.role),
                        color: 'white'
                      }}>
                        {person.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      backgroundColor: person.status === 'inside' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: person.status === 'inside' ? '#fbbf24' : '#9ca3af',
                      border: `2px solid ${person.status === 'inside' ? '#f59e0b' : '#6b7280'}`
                    }}>
                      {person.status === 'inside' ? `🟡 ${texts.inside}` : `🔘 ${texts.outside}`}
                    </span>
                    
                    <button
                      onClick={() => toggleEntry(person.id)}
                      style={{
                        ...styles.button,
                        ...(person.status === 'outside' ? styles.buttonSuccess : styles.buttonDanger),
                        width: 'auto',
                        padding: '8px 12px',
                        fontSize: '14px',
                        minHeight: 'auto'
                      }}
                    >
                      {person.status === 'outside' ? (
                        <>
                          <LogIn style={{ width: '16px', height: '16px' }} />
                          {texts.markEntry}
                        </>
                      ) : (
                        <>
                          <LogOut style={{ width: '16px', height: '16px' }} />
                          {texts.markExit}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => deletePerson(person.id)}
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
                      {texts.delete}
                    </button>
                  </div>
                </div>
                
                {/* Détails temporels */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '16px',
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      {texts.entryTime}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600' }}>
                      {person.entry_time ? 
                        new Date(person.entry_time).toLocaleTimeString('fr-CA') : 
                        '---'
                      }
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      {texts.exitTime}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600' }}>
                      {person.exit_time ? 
                        new Date(person.exit_time).toLocaleTimeString('fr-CA') : 
                        person.status === 'inside' ? 'En cours...' : '---'
                      }
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      {texts.totalDuration}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600' }}>
                      {person.total_duration ? 
                        formatDuration(person.total_duration) : 
                        '0h 0m'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Ajout Équipement */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          🔧 {texts.addEquipment}
        </h3>
        
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>{texts.equipmentName} *</label>
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
            <label style={styles.label}>{texts.serialNumber} *</label>
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
            <label style={styles.label}>{texts.condition} *</label>
            <select
              value={newEquipment.condition}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, condition: e.target.value as any }))}
              style={styles.input}
              required
            >
              <option value="good">✅ {texts.goodCondition}</option>
              <option value="fair">⚠️ {texts.fairCondition}</option>
              <option value="poor">❌ {texts.poorCondition}</option>
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
          🔧 {texts.equipment} ({equipment.length})
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
                      {item.condition === 'good' ? `✅ ${texts.goodCondition}` :
                       item.condition === 'fair' ? `⚠️ ${texts.fairCondition}` :
                       `❌ ${texts.poorCondition}`}
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
                      {texts.checkIn}
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
                      {texts.checkOut}
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
                      {texts.delete}
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
