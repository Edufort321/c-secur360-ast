"use client";

import React from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, 
  Users, PenTool, CheckCircle, X, Edit3, Copy, Wrench
} from 'lucide-react';

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
}

// =================== COMPOSANT ENTRY REGISTRY ===================
const EntryRegistry: React.FC<EntryRegistryProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  styles
}) => {

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
      delete: "Supprimer"
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
      delete: "Delete"
    }
  })[language];

  const texts = getTexts(language);

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

      {/* Section Superviseur d'Entrée */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <UserCheck style={{ width: '20px', height: '20px' }} />
          👨‍💼 {texts.supervisor}
        </h3>
        
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '20px',
          border: '1px solid rgba(107, 114, 128, 0.3)'
        }}>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            👨‍💼 <strong>{texts.supervisorRole}</strong> : {texts.supervisorText}
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            🎓 <strong>Formation requise</strong> : Personne qualifiée selon CSA Z1006 avec formation supervision espace clos, premiers soins niveau 2, RCR.
          </p>
        </div>
        
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>{texts.fullName} *</label>
            <input
              type="text"
              placeholder="Ex: Jean Tremblay"
              value={permitData.supervisor_name || ''}
              onChange={(e) => updatePermitData({ supervisor_name: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.company} *</label>
            <input
              type="text"
              placeholder="Ex: Entreprises ABC Inc."
              value={permitData.supervisor_company || ''}
              onChange={(e) => updatePermitData({ supervisor_company: e.target.value })}
              style={styles.input}
              required
            />
          </div>
        </div>
        
        {/* Qualifications superviseur */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#d1d5db',
            marginBottom: '16px'
          }}>
            🎓 Qualifications Réglementaires Superviseur
          </h4>
          
          <div style={styles.grid2}>
            {[
              { 
                id: 'age_verified', 
                label: '🆔 Âge ≥18 ans vérifié', 
                required: true,
                field: 'age_verified'
              },
              { 
                id: 'confined_space_training', 
                label: '🏅 Formation supervision espace clos (CSA Z1006)', 
                required: true,
                field: 'confined_space_training'
              },
              { 
                id: 'competent_person_designated', 
                label: '👨‍🏫 Personne compétente désignée par l\'employeur', 
                required: true,
                field: 'competent_person_designated'
              },
              { 
                id: 'authority_to_evacuate', 
                label: '🚨 Autorité d\'ordonner l\'évacuation immédiate', 
                required: true,
                field: 'authority_to_evacuate'
              }
            ].map((qual) => (
              <div key={qual.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id={qual.id}
                  checked={permitData.attendant_qualifications?.[qual.field] || false}
                  onChange={(e) => updatePermitData({ 
                    attendant_qualifications: { 
                      ...permitData.attendant_qualifications, 
                      [qual.field]: e.target.checked 
                    }
                  })}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#3b82f6'
                  }}
                  required={qual.required}
                />
                <label 
                  htmlFor={qual.id}
                  style={{
                    color: '#d1d5db',
                    fontSize: '14px',
                    fontWeight: qual.required ? '600' : '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {qual.label}
                  {qual.required && <span style={{ color: '#60a5fa' }}> *</span>}
                </label>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Expiration formation supervision *</label>
            <input
              type="date"
              value={permitData.attendant_qualifications?.training_expiry_date || ''}
              onChange={(e) => updatePermitData({ 
                attendant_qualifications: { 
                  ...permitData.attendant_qualifications, 
                  training_expiry_date: e.target.value 
                }
              })}
              style={styles.input}
              required
            />
          </div>
        </div>
        
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>{texts.signatureDate} *</label>
            <input
              type="date"
              value={permitData.supervisor_signature_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => updatePermitData({ supervisor_signature_date: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div>
            <label style={styles.label}>{texts.signatureTime} *</label>
            <input
              type="time"
              value={permitData.supervisor_signature_time || new Date().toTimeString().slice(0, 5)}
              onChange={(e) => updatePermitData({ supervisor_signature_time: e.target.value })}
              style={styles.input}
              required
            />
          </div>
        </div>
        
        {/* Signature électronique superviseur */}
        <div style={{ marginTop: '20px' }}>
          <label style={styles.label}>{texts.certification} *</label>
          <div style={{
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '24px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            transition: 'all 0.3s ease'
          }}>
            {!permitData.supervisor_signature ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}>
                  <input
                    type="checkbox"
                    id="supervisor_certification"
                    checked={permitData.supervisor_certified || false}
                    onChange={(e) => updatePermitData({ supervisor_certified: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <label 
                    htmlFor="supervisor_certification"
                    style={{
                      color: '#d1d5db',
                      fontSize: isMobile ? '14px' : '15px',
                      lineHeight: 1.6,
                      cursor: 'pointer',
                      flex: 1,
                      fontWeight: '500'
                    }}
                  >
                    <strong>Je certifie par la présente que :</strong>
                    <br />• J'ai pris connaissance de tous les risques et dangers identifiés dans cet espace clos
                    <br />• Je possède les qualifications, l'autorité et la formation requises pour superviser cette entrée
                    <br />• Tous les contrôles de sécurité ont été vérifiés et sont conformes aux réglementations
                    <br />• J'autorise l'entrée dans cet espace clos sous les conditions spécifiées dans ce permis
                    <br />• Je m'engage à maintenir la supervision et à ordonner l'évacuation si nécessaire
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!permitData.supervisor_certified) {
                      alert('⚠️ Vous devez d\'abord cocher la case de certification avant de signer.');
                      return;
                    }
                    const name = prompt('Veuillez taper votre nom complet pour signer électroniquement:');
                    if (name && name.trim()) {
                      const now = new Date();
                      updatePermitData({ 
                        supervisor_signature: name.trim(),
                        supervisor_signature_timestamp: now.toISOString(),
                        supervisor_signature_time_precise: now.toLocaleString('fr-CA', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          timeZoneName: 'short'
                        })
                      });
                    }
                  }}
                  disabled={!permitData.supervisor_certified}
                  style={{
                    ...styles.button,
                    ...(permitData.supervisor_certified ? styles.buttonPrimary : styles.buttonSecondary),
                    justifyContent: 'center',
                    fontSize: isMobile ? '15px' : '16px',
                    cursor: permitData.supervisor_certified ? 'pointer' : 'not-allowed',
                    opacity: permitData.supervisor_certified ? 1 : 0.5
                  }}
                >
                  <PenTool style={{ width: '18px', height: '18px' }} />
                  {permitData.supervisor_certified ? 'Signer Électroniquement' : 'Certification Requise Avant Signature'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  border: '2px solid #10b981',
                  marginBottom: '16px'
                }}>
                  <CheckCircle style={{ 
                    width: '48px', 
                    height: '48px', 
                    color: '#10b981', 
                    margin: '0 auto 12px'
                  }} />
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '28px', 
                    fontFamily: 'cursive', 
                    color: '#10b981', 
                    marginBottom: '12px',
                    fontWeight: '700'
                  }}>
                    {permitData.supervisor_signature}
                  </div>
                  <div style={{ 
                    color: '#86efac', 
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    ✅ SUPERVISEUR CERTIFIÉ ET AUTORISÉ
                  </div>
                  <div style={{ 
                    color: '#6ee7b7', 
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    📅 Signé le {permitData.supervisor_signature_time_precise}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir annuler cette signature? Cette action est irréversible.')) {
                      updatePermitData({ 
                        supervisor_signature: '',
                        supervisor_signature_timestamp: '',
                        supervisor_signature_time_precise: '',
                        supervisor_certified: false
                      });
                    }
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    width: 'auto',
                    padding: '8px 16px',
                    fontSize: '14px',
                    minHeight: 'auto'
                  }}
                >
                  <X style={{
