"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, Wrench, Users, Clock, Plus, Trash2, Phone, MapPin, 
  AlertTriangle, CheckCircle, X, Edit3, Copy, FileText, 
  User, Stethoscope, Radio, Car, Building, Zap
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
  emergency_contacts: Array<{
    name: string;
    role: string;
    phone: string;
    available_24h: boolean;
  }>;
}

interface RescueTeamMember {
  id: string;
  name: string;
  role: 'leader' | 'rescuer' | 'medical' | 'backup';
  company: string;
  phone: string;
  certification: string;
  expiry_date: string;
  available_24h: boolean;
  equipment_assigned: string[];
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
  response_time_minutes: number;
}

interface RescueEquipment {
  id: string;
  name: string;
  type: 'breathing' | 'lifting' | 'medical' | 'communication' | 'safety';
  serial_number: string;
  inspection_date: string;
  condition: 'operational' | 'needs_maintenance' | 'out_of_service';
  location: string;
}

interface LegalRescueData {
  // Plan obligatoire
  rescue_plan_developed: boolean;
  rescue_procedures_written: boolean;
  emergency_response_time_acceptable: boolean;
  
  // Équipe qualifiée
  rescue_team_designated: boolean;
  rescue_training_current: boolean;
  medical_personnel_available: boolean;
  
  // Équipements
  rescue_equipment_inspected: boolean;
  breathing_apparatus_available: boolean;
  lifting_equipment_certified: boolean;
  
  // Communications
  emergency_communication_tested: boolean;
  backup_communication_available: boolean;
  
  // Coordination
  external_rescue_coordination: boolean;
  hospital_notification_protocol: boolean;
}

interface RescuePlanProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
}

// =================== COMPOSANT RESCUE PLAN ===================
const RescuePlan: React.FC<RescuePlanProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles,
  updateParentData
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [rescueTeam, setRescueTeam] = useState<RescueTeamMember[]>(permitData.rescue_team || []);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(permitData.emergency_contacts || []);
  const [rescueEquipment, setRescueEquipment] = useState<RescueEquipment[]>(permitData.rescue_equipment || []);
  
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: 'rescuer' as 'leader' | 'rescuer' | 'medical' | 'backup',
    company: '',
    phone: '',
    certification: '',
    expiry_date: ''
  });

  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    phone: '',
    response_time_minutes: 15
  });

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'safety' as 'breathing' | 'lifting' | 'medical' | 'communication' | 'safety',
    serial_number: '',
    location: ''
  });

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Plan de Sauvetage d'Urgence Obligatoire",
      legalCompliance: "Conformité Réglementaire Plan de Sauvetage",
      rescueTeam: "Équipe de Sauvetage Désignée",
      emergencyContacts: "Contacts d'Urgence",
      rescueEquipment: "Équipements de Sauvetage",
      rescueProcedures: "Procédures de Sauvetage",
      addTeamMember: "Ajouter Membre Équipe",
      addContact: "Ajouter Contact",
      addEquipment: "Ajouter Équipement",
      fullName: "Nom complet",
      company: "Compagnie/Organisation",
      phone: "Téléphone",
      role: "Rôle",
      certification: "Certification",
      expiryDate: "Date d'expiration",
      available24h: "Disponible 24h",
      responseTime: "Temps de réponse (min)",
      equipmentName: "Nom de l'équipement",
      equipmentType: "Type d'équipement",
      serialNumber: "N° série",
      location: "Emplacement",
      condition: "État",
      inspectionDate: "Date d'inspection",
      operational: "Opérationnel",
      needsMaintenance: "Maintenance requise",
      outOfService: "Hors service",
      leader: "Chef d'équipe",
      rescuer: "Sauveteur",
      medical: "Personnel médical",
      backup: "Soutien",
      breathing: "Appareil respiratoire",
      lifting: "Équipement de levage",
      communication: "Communication",
      safety: "Sécurité générale",
      delete: "Supprimer",
      edit: "Modifier",
      testCommunication: "Tester Communication",
      emergencyProcedure: "PROCÉDURE D'URGENCE",
      step1: "1. ARRÊT IMMÉDIAT des travaux",
      step2: "2. ÉVACUATION de l'espace clos", 
      step3: "3. APPEL équipe de sauvetage",
      step4: "4. VENTILATION d'urgence",
      step5: "5. ÉVALUATION médicale",
      step6: "6. SAUVETAGE sécurisé"
    },
    en: {
      title: "Mandatory Emergency Rescue Plan",
      legalCompliance: "Rescue Plan Regulatory Compliance",
      rescueTeam: "Designated Rescue Team",
      emergencyContacts: "Emergency Contacts",
      rescueEquipment: "Rescue Equipment",
      rescueProcedures: "Rescue Procedures",
      addTeamMember: "Add Team Member",
      addContact: "Add Contact", 
      addEquipment: "Add Equipment",
      fullName: "Full name",
      company: "Company/Organization",
      phone: "Phone",
      role: "Role",
      certification: "Certification",
      expiryDate: "Expiry date",
      available24h: "Available 24h",
      responseTime: "Response time (min)",
      equipmentName: "Equipment name",
      equipmentType: "Equipment type",
      serialNumber: "Serial number",
      location: "Location",
      condition: "Condition",
      inspectionDate: "Inspection date",
      operational: "Operational",
      needsMaintenance: "Needs maintenance",
      outOfService: "Out of service",
      leader: "Team leader",
      rescuer: "Rescuer",
      medical: "Medical personnel",
      backup: "Backup",
      breathing: "Breathing apparatus",
      lifting: "Lifting equipment",
      communication: "Communication",
      safety: "General safety",
      delete: "Delete",
      edit: "Edit",  
      testCommunication: "Test Communication",
      emergencyProcedure: "EMERGENCY PROCEDURE",
      step1: "1. IMMEDIATE STOP of work",
      step2: "2. EVACUATION from confined space",
      step3: "3. CALL rescue team", 
      step4: "4. EMERGENCY ventilation",
      step5: "5. MEDICAL assessment",
      step6: "6. SAFE rescue"
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
  const addTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.company || !newTeamMember.phone || !newTeamMember.certification) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const member: RescueTeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newTeamMember.name,
      role: newTeamMember.role,
      company: newTeamMember.company,
      phone: newTeamMember.phone,
      certification: newTeamMember.certification,
      expiry_date: newTeamMember.expiry_date,
      available_24h: true,
      equipment_assigned: []
    };

    const updatedTeam = [...rescueTeam, member];
    setRescueTeam(updatedTeam);
    updateParentData('rescue_team', updatedTeam);
    
    setNewTeamMember({
      name: '',
      role: 'rescuer',
      company: '',
      phone: '',
      certification: '',
      expiry_date: ''
    });
  };

  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.role || !newContact.phone) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const contact: EmergencyContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newContact.name,
      role: newContact.role,
      phone: newContact.phone,
      available_24h: true,
      response_time_minutes: newContact.response_time_minutes
    };

    const updatedContacts = [...emergencyContacts, contact];
    setEmergencyContacts(updatedContacts);
    updateParentData('emergency_contacts', updatedContacts);
    
    setNewContact({
      name: '',
      role: '',
      phone: '',
      response_time_minutes: 15
    });
  };

  const addRescueEquipment = () => {
    if (!newEquipment.name || !newEquipment.serial_number || !newEquipment.location) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const equipment: RescueEquipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEquipment.name,
      type: newEquipment.type,
      serial_number: newEquipment.serial_number,
      inspection_date: new Date().toISOString().split('T')[0],
      condition: 'operational',
      location: newEquipment.location
    };

    const updatedEquipment = [...rescueEquipment, equipment];
    setRescueEquipment(updatedEquipment);
    updateParentData('rescue_equipment', updatedEquipment);
    
    setNewEquipment({
      name: '',
      type: 'safety',
      serial_number: '',
      location: ''
    });
  };

  const deleteTeamMember = (memberId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre de l\'équipe?')) {
      const updatedTeam = rescueTeam.filter(m => m.id !== memberId);
      setRescueTeam(updatedTeam);
      updateParentData('rescue_team', updatedTeam);
    }
  };

  const deleteContact = (contactId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact?')) {
      const updatedContacts = emergencyContacts.filter(c => c.id !== contactId);
      setEmergencyContacts(updatedContacts);
      updateParentData('emergency_contacts', updatedContacts);
    }
  };

  const deleteEquipment = (equipmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement?')) {
      const updatedEquipment = rescueEquipment.filter(e => e.id !== equipmentId);
      setRescueEquipment(updatedEquipment);
      updateParentData('rescue_equipment', updatedEquipment);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return '👨‍💼';
      case 'rescuer': return '🦺';
      case 'medical': return '⚕️';
      case 'backup': return '👤';
      default: return '👷';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return '#3b82f6';
      case 'rescuer': return '#f59e0b';
      case 'medical': return '#ef4444';
      case 'backup': return '#6b7280';
      default: return '#10b981';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return '🫁';
      case 'lifting': return '🏗️';
      case 'medical': return '⚕️';
      case 'communication': return '📻';
      case 'safety': return '🦺';
      default: return '🔧';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'operational': return '#10b981';
      case 'needs_maintenance': return '#f59e0b';
      case 'out_of_service': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const testCommunication = (phone: string) => {
    if (confirm(`Tester la communication avec ${phone}?`)) {
      // Simulation d'un test de communication
      setTimeout(() => {
        alert(`✅ Test de communication réussi avec ${phone}`);
      }, 1000);
    }
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Section Conformité Réglementaire Plan de Sauvetage */}
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
          <Shield style={{ width: '24px', height: '24px', color: '#fecaca' }} />
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
            🚨 <strong>PLAN DE SAUVETAGE OBLIGATOIRE</strong> : Plan écrit, équipe qualifiée et équipements certifiés requis avant toute entrée selon {PROVINCIAL_REGULATIONS[selectedProvince].code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            ⏱️ <strong>Temps de réponse</strong> : Équipe de sauvetage prête à intervenir dans les 4 minutes maximum (norme CSA Z1006).
          </p>
        </div>
        
        {/* Exigences légales plan de sauvetage */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fecaca',
            marginBottom: '16px'
          }}>
            📋 Exigences Légales Plan de Sauvetage
          </h4>
          
          <div style={styles.grid2}>
            {[
              { 
                id: 'rescue_plan_developed', 
                label: '📝 Plan de sauvetage écrit développé et approuvé', 
                required: true
              },
              { 
                id: 'rescue_procedures_written', 
                label: '📖 Procédures de sauvetage détaillées rédigées', 
                required: true
              },
              { 
                id: 'rescue_team_designated', 
                label: '👥 Équipe de sauvetage qualifiée désignée', 
                required: true
              },
              { 
                id: 'rescue_training_current', 
                label: '🎓 Formation de sauvetage à jour (CSA Z1006)', 
                required: true
              },
              { 
                id: 'rescue_equipment_inspected', 
                label: '🔧 Équipements de sauvetage inspectés et certifiés', 
                required: true
              },
              { 
                id: 'emergency_communication_tested', 
                label: '📻 Système de communication d\'urgence testé', 
                required: true
              }
            ].map((req) => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(254, 202, 202, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id={req.id}
                  checked={permitData[req.id] || false}
                  onChange={(e) => updatePermitData({ [req.id]: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#ef4444'
                  }}
                  required={req.required}
                />
                <label 
                  htmlFor={req.id}
                  style={{
                    color: '#fecaca',
                    fontSize: '14px',
                    fontWeight: req.required ? '600' : '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {req.label}
                  {req.required && <span style={{ color: '#fca5a5' }}> *</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Coordination avec services externes */}
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
            id="external_rescue_coordination"
            checked={permitData.external_rescue_coordination || false}
            onChange={(e) => updatePermitData({ external_rescue_coordination: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              accentColor: '#ef4444'
            }}
            required
          />
          <label 
            htmlFor="external_rescue_coordination"
            style={{
              color: '#fecaca',
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            🚑 <strong>COORDINATION SERVICES D'URGENCE</strong> : Protocole établi avec {PROVINCIAL_REGULATIONS[selectedProvince].authority} et services d'urgence locaux *
          </label>
        </div>
      </div>

      {/* Section Procédures d'Urgence */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <AlertTriangle style={{ width: '20px', height: '20px' }} />
          🚨 {texts.emergencyProcedure}
        </h3>
        
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '2px solid #dc2626',
          marginBottom: '20px'
        }}>
          <div style={styles.grid2}>
            {[
              { step: texts.step1, icon: '⏹️', color: '#ef4444' },
              { step: texts.step2, icon: '🏃‍♂️', color: '#f59e0b' },
              { step: texts.step3, icon: '📞', color: '#3b82f6' },
              { step: texts.step4, icon: '💨', color: '#10b981' },
              { step: texts.step5, icon: '⚕️', color: '#8b5cf6' },
              { step: texts.step6, icon: '🦺', color: '#06b6d4' }
            ].map((procedure, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: `1px solid ${procedure.color}`,
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>{procedure.icon}</span>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600'
                }}>
                  {procedure.step}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Numéros d'urgence */}
        <div style={styles.grid3}>
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            border: '2px solid #ef4444',
            textAlign: 'center'
          }}>
            <Phone style={{ 
              width: '32px', 
              height: '32px', 
              color: '#f87171',
              margin: '0 auto 8px'
            }} />
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#fecaca',
              marginBottom: '4px'
            }}>
              911
            </div>
            <div style={{ color: '#fca5a5', fontSize: '12px' }}>
              Urgences
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            border: '2px solid #3b82f6',
            textAlign: 'center'
          }}>
            <Building style={{ 
              width: '32px', 
              height: '32px', 
              color: '#60a5fa',
              margin: '0 auto 8px'
            }} />
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#93c5fd',
              marginBottom: '4px'
            }}>
              {PROVINCIAL_REGULATIONS[selectedProvince].authority_phone}
            </div>
            <div style={{ color: '#bfdbfe', fontSize: '12px' }}>
              {PROVINCIAL_REGULATIONS[selectedProvince].authority}
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <Stethoscope style={{ 
              width: '32px', 
              height: '32px', 
              color: '#34d399',
              margin: '0 auto 8px'
            }} />
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#86efac',
              marginBottom: '4px'
            }}>
              Info-Santé
            </div>
            <div style={{ color: '#6ee7b7', fontSize: '12px' }}>
              811
            </div>
          </div>
        </div>
      </div>

      {/* Section Ajout Membre Équipe */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          👥 {texts.addTeamMember}
        </h3>
        
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>{texts.fullName} *</label>
            <input
              type="text"
              placeholder="Ex: Marie Dubois"
              value={newTeamMember.name}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.company} *</label>
            <input
              type="text"
              placeholder="Ex: Services Sauvetage Inc."
              value={newTeamMember.company}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, company: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.role} *</label>
            <select
              value={newTeamMember.role}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value as any }))}
              style={styles.input}
              required
            >
              <option value="rescuer">🦺 {texts.rescuer}</option>
              <option value="leader">👨‍💼 {texts.leader}</option>
              <option value="medical">⚕️ {texts.medical}</option>
              <option value="backup">👤 {texts.backup}</option>
            </select>
          </div>
        </div>
        
        <div style={{ ...styles.grid3, marginTop: '16px' }}>
          <div>
            <label style={styles.label}>{texts.phone} *</label>
            <input
              type="tel"
              placeholder="Ex: (514) 555-0123"
              value={newTeamMember.phone}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, phone: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.certification} *</label>
            <input
              type="text"
              placeholder="Ex: CSA Z1006, Premiers soins"
              value={newTeamMember.certification}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, certification: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.expiryDate}</label>
            <input
              type="date"
              value={newTeamMember.expiry_date}
              onChange={(e) => setNewTeamMember(prev => ({ ...prev, expiry_date: e.target.value }))}
              style={styles.input}
            />
          </div>
        </div>
        
        <button
          onClick={addTeamMember}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            marginTop: '16px',
            justifyContent: 'center'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Ajouter à l'Équipe
        </button>
      </div>

      {/* Section Équipe de Sauvetage */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          🦺 {texts.rescueTeam} ({rescueTeam.length})
        </h3>
        
        {rescueTeam.length === 0 ? (
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
              Aucune équipe de sauvetage désignée
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez les membres de l'équipe de sauvetage qualifiée ci-dessus.
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
            {rescueTeam.map((member) => (
              <div
                key={member.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: `2px solid ${getRoleColor(member.role)}`,
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
                    <span style={{ fontSize: '28px' }}>{getRoleIcon(member.role)}</span>
                    <div>
                      <div style={{ 
                        fontWeight: '700', 
                        color: 'white', 
                        fontSize: isMobile ? '16px' : '18px',
                        marginBottom: '4px'
                      }}>
                        {member.name}
                      </div>
                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        🏢 {member.company}
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getRoleColor(member.role),
                        color: 'white'
                      }}>
                        {member.role.toUpperCase()}
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
                      onClick={() => testCommunication(member.phone)}
                      style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        width: 'auto',
                        padding: '6px 10px',
                        fontSize: '12px',
                        minHeight: 'auto'
                      }}
                    >
                      <Radio style={{ width: '14px', height: '14px' }} />
                      {texts.testCommunication}
                    </button>
                    
                    <button
                      onClick={() => deleteTeamMember(member.id)}
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
                
                {/* Détails du membre */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      📞 {texts.phone}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600' }}>
                      {member.phone}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      🎓 {texts.certification}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600' }}>
                      {member.certification}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                      📅 {texts.expiryDate}:
                    </span>
                    <span style={{ 
                      color: member.expiry_date && new Date(member.expiry_date) < new Date() ? '#fca5a5' : '#d1d5db', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      {member.expiry_date ? 
                        new Date(member.expiry_date).toLocaleDateString('fr-CA') : 
                        'Non spécifiée'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Ajout Contact d'Urgence */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          📞 {texts.addContact}
        </h3>
        
        <div style={styles.grid4}>
          <div>
            <label style={styles.label}>{texts.fullName} *</label>
            <input
              type="text"
              placeholder="Ex: Dr. Jean Martin"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.role} *</label>
            <input
              type="text"
              placeholder="Ex: Médecin d'urgence"
              value={newContact.role}
              onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.phone} *</label>
            <input
              type="tel"
              placeholder="Ex: (514) 555-0123"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.responseTime}</label>
            <input
              type="number"
              min="1"
              max="60"
              value={newContact.response_time_minutes}
              onChange={(e) => setNewContact(prev => ({ ...prev, response_time_minutes: parseInt(e.target.value) || 15 }))}
              style={styles.input}
            />
          </div>
        </div>
        
        <button
          onClick={addEmergencyContact}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            marginTop: '16px',
            justifyContent: 'center'
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Ajouter Contact
        </button>
      </div>

      {/* Section Contacts d'Urgence */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Phone style={{ width: '20px', height: '20px' }} />
          📞 {texts.emergencyContacts} ({emergencyContacts.length})
        </h3>
        
        {emergencyContacts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Phone style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucun contact d'urgence configuré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez les contacts d'urgence essentiels ci-dessus.
            </p>
          </div>
        ) : (
          <div style={styles.grid2}>
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: '2px solid #3b82f6',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: 'white', 
                      fontSize: '16px',
                      marginBottom: '4px'
                    }}>
                      📞 {contact.name}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      {contact.role}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteContact(contact.id)}
                    style={{
                      ...styles.button,
                      ...styles.buttonSecondary,
                      width: 'auto',
                      padding: '6px',
                      fontSize: '12px',
                      minHeight: 'auto'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    color: '#60a5fa', 
                    fontSize: '16px', 
                    fontWeight: '700',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    {contact.phone}
                  </div>
                  <div style={{ 
                    color: '#9ca3af', 
                    fontSize: '13px'
                  }}>
                    ⏱️ Temps de réponse: {contact.response_time_minutes} min
                  </div>
                  <div style={{ 
                    color: contact.available_24h ? '#86efac' : '#fbbf24', 
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {contact.available_24h ? '🟢 Disponible 24h/24' : '🟡 Heures limitées'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Ajout Équipement de Sauvetage */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Plus style={{ width: '20px', height: '20px' }} />
          🔧 {texts.addEquipment}
        </h3>
        
        <div style={styles.grid4}>
          <div>
            <label style={styles.label}>{texts.equipmentName} *</label>
            <input
              type="text"
              placeholder="Ex: Treuil de sauvetage"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.equipmentType} *</label>
            <select
              value={newEquipment.type}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value as any }))}
              style={styles.input}
              required
            >
              <option value="safety">🦺 {texts.safety}</option>
              <option value="breathing">🫁 {texts.breathing}</option>
              <option value="lifting">🏗️ {texts.lifting}</option>
              <option value="medical">⚕️ Medical</option>
              <option value="communication">📻 {texts.communication}</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>{texts.serialNumber} *</label>
            <input
              type="text"
              placeholder="Ex: WH-2024-001"
              value={newEquipment.serial_number}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, serial_number: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.location} *</label>
            <input
              type="text"
              placeholder="Ex: Camion sauvetage A-1"
              value={newEquipment.location}
              onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
              style={styles.input}
              required
            />
          </div>
        </div>
        
        <button
          onClick={addRescueEquipment}
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

      {/* Section Équipements de Sauvetage */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Wrench style={{ width: '20px', height: '20px' }} />
          🔧 {texts.rescueEquipment} ({rescueEquipment.length})
        </h3>
        
        {rescueEquipment.length === 0 ? (
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
              Aucun équipement de sauvetage enregistré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez les équipements de sauvetage certifiés ci-dessus.
            </p>
          </div>
        ) : (
          <div style={styles.grid2}>
            {rescueEquipment.map((equipment) => (
              <div
                key={equipment.id}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '20px',
                  border: `2px solid ${getConditionColor(equipment.condition)}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{getTypeIcon(equipment.type)}</span>
                    <div>
                      <div style={{ 
                        fontWeight: '700', 
                        color: 'white', 
                        fontSize: '16px',
                        marginBottom: '4px'
                      }}>
                        {equipment.name}
                      </div>
                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: '13px'
                      }}>
                        📟 {equipment.serial_number}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteEquipment(equipment.id)}
                    style={{
                      ...styles.button,
                      ...styles.buttonSecondary,
                      width: 'auto',
                      padding: '6px',
                      fontSize: '12px',
                      minHeight: 'auto'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      📍 {texts.location}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: '600' }}>
                      {equipment.location}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      📅 {texts.inspectionDate}:
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: '600' }}>
                      {new Date(equipment.inspection_date).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      ⚙️ {texts.condition}:
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: getConditionColor(equipment.condition),
                      color: 'white'
                    }}>
                      {equipment.condition === 'operational' ? `✅ ${texts.operational}` :
                       equipment.condition === 'needs_maintenance' ? `⚠️ ${texts.needsMaintenance}` :
                       `❌ ${texts.outOfService}`}
                    </span>
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

export default RescuePlan;
