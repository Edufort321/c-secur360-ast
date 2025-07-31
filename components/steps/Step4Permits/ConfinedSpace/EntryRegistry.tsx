"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, 
  Users, PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock,
  History, UserPlus, UserMinus, AlertTriangle, FileText, PenTool as Signature
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
  },
  signatureSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    marginTop: '20px'
  },
  signatureConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid rgba(16, 185, 129, 0.3)'
  },
  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
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
  training_requirements: {
    surveillant: string[];
    entrant: string[];
    annual_recertification: boolean;
    practical_training_required: boolean;
  };
}

interface LegalSignature {
  person_name: string;
  signature_text: string;
  timestamp: string;
  ip_address?: string;
  legal_declaration: string;
  training_confirmed: boolean;
  formation_details: {
    espace_clos_formation: boolean;
    formation_expiry?: string;
    csaz1006_compliant: boolean;
    practical_training: boolean;
    rescue_procedures: boolean;
    emergency_response: boolean;
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
  legal_signature: LegalSignature;
  forced_evacuations: Array<{
    timestamp: string;
    reason: string;
    evacuated_personnel: string[];
  }>;
}

interface EntrySession {
  id: string;
  entry_time: string;
  exit_time?: string;
  duration?: number;
  status: 'inside' | 'completed';
  forced_exit?: {
    timestamp: string;
    reason: string;
    new_surveillant: string;
  };
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
  legal_signature: LegalSignature;
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

interface PermitValidation {
  team_validation: {
    validated: boolean;
    validated_by: string;
    validation_time?: string;
    validation_signature?: string;
  };
  final_approval: {
    approved: boolean;
    approved_by: string;
    approval_time?: string;
    approval_signature?: string;
  };
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
  retestTimer?: number;
}

// =================== EXIGENCES DE FORMATION PAR PROVINCE ===================
const getTrainingRequirements = (province: ProvinceCode) => {
  const requirements = {
    QC: {
      surveillant: [
        "Formation en espace clos selon CSA Z1006",
        "Formation en surveillance d'espace clos par la CNESST", 
        "Formation en procédures d'urgence et de sauvetage",
        "Formation en communication bidirectionnelle",
        "Compétences en identification des dangers atmosphériques",
        "Autorité d'ordonner l'évacuation immédiate"
      ],
      entrant: [
        "Formation générale en espace clos selon RSST Art. 302-317",
        "Formation sur l'utilisation des EPI requis",
        "Formation sur les procédures d'entrée/sortie", 
        "Formation sur les systèmes de communication",
        "Formation en reconnaissance des dangers",
        "Âge minimum 18 ans confirmé"
      ],
      annual_recertification: true,
      practical_training_required: true
    },
    ON: {
      surveillant: [
        "Formation adéquate selon le Règlement concernant les espaces clos",
        "Connaissances en identification et évaluation des risques",
        "Formation sur l'équipement de ventilation et de surveillance",
        "Formation en procédures de sauvetage et premiers soins",
        "Compétences en communication d'urgence",
        "Formation pratique obligatoire"
      ],
      entrant: [
        "Formation sur les pratiques de travail sécuritaires",
        "Formation sur l'identification des risques",
        "Formation sur l'équipement de protection individuelle",
        "Formation sur les méthodes d'entrée/sortie",
        "Formation sur les procédures d'urgence",
        "Formation pratique avec équipement de sécurité"
      ],
      annual_recertification: true,
      practical_training_required: true
    },
    BC: {
      surveillant: [
        "Formation conforme aux exigences de WorkSafeBC",
        "Certification en surveillance d'espace clos",
        "Formation en procédures d'urgence et de sauvetage",
        "Formation sur l'utilisation des équipements de surveillance",
        "Compétences en évaluation des risques atmosphériques",
        "Formation en communication d'urgence"
      ],
      entrant: [
        "Formation générale en espace clos selon WorkSafeBC",
        "Formation sur l'utilisation sécuritaire des équipements",
        "Formation en reconnaissance des dangers",
        "Formation sur les procédures de travail",
        "Formation en procédures d'urgence",
        "Certification valide en sécurité au travail"
      ],
      annual_recertification: true,
      practical_training_required: true
    },
    AB: {
      surveillant: [
        "Formation selon Alberta Occupational Health and Safety",
        "Certification en surveillance d'espace clos",
        "Formation en identification des dangers",
        "Formation en procédures de sauvetage", 
        "Compétences en surveillance atmosphérique",
        "Formation en autorité d'évacuation"
      ],
      entrant: [
        "Formation générale en espace clos selon Alberta OHS",
        "Formation sur l'équipement de protection",
        "Formation en procédures de travail sécuritaires",
        "Formation en communication d'urgence",
        "Formation en reconnaissance des risques",
        "Âge minimum et aptitudes physiques confirmés"
      ],
      annual_recertification: true,
      practical_training_required: true
    }
  };

  return requirements[province] || requirements.QC;
};

// =================== COMPOSANT SIGNATURE LÉGALE ===================
const LegalSignatureForm = ({ 
  role, 
  personData, 
  setPersonData, 
  onConfirm, 
  onCancel,
  selectedProvince,
  PROVINCIAL_REGULATIONS 
}: { 
  role: 'surveillant' | 'entrant';
  personData: any;
  setPersonData: (data: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
}) => {
  const trainingRequirements = getTrainingRequirements(selectedProvince);
  const requirements = role === 'surveillant' ? trainingRequirements.surveillant : trainingRequirements.entrant;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '2px solid #3b82f6'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '22px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📝 Signature Légale - {role === 'surveillant' ? 'Surveillant' : 'Entrant'}
        </h3>

        <div style={{ 
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          border: '2px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#fca5a5', fontWeight: '600', marginBottom: '12px' }}>
            ⚖️ Déclaration Légale - {PROVINCIAL_REGULATIONS[selectedProvince].authority}
          </h4>
          <p style={{ color: '#fecaca', fontSize: '14px', lineHeight: 1.6 }}>
            En signant ce document, je certifie que j'ai reçu une formation adéquate selon les exigences de {PROVINCIAL_REGULATIONS[selectedProvince].authority} pour travailler comme {role} en espace clos. Je confirme posséder les compétences requises selon les normes en vigueur et m'engage à respecter toutes les procédures de sécurité.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '12px' }}>
            📚 Formations Requises ({selectedProvince}):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requirements.map((req, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '13px',
                color: '#d1d5db'
              }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                {req}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>Date d'expiration de la formation</label>
          <input
            type="date"
            value={personData.formation_details?.formation_expiry || ''}
            onChange={(e) => setPersonData(prev => ({
              ...prev,
              formation_details: {
                ...prev.formation_details,
                formation_expiry: e.target.value
              }
            }))}
            style={styles.input}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'espace_clos_formation', label: 'Formation en espace clos complétée' },
              { key: 'csaz1006_compliant', label: 'Formation conforme CSA Z1006' },
              { key: 'practical_training', label: 'Formation pratique effectuée' },
              { key: 'rescue_procedures', label: 'Formation en procédures de sauvetage' },
              { key: 'emergency_response', label: 'Formation en réponse d\'urgence' }
            ].map((item) => (
              <div key={item.key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id={item.key}
                  checked={personData.formation_details?.[item.key] || false}
                  onChange={(e) => setPersonData(prev => ({
                    ...prev,
                    formation_details: {
                      ...prev.formation_details,
                      [item.key]: e.target.checked
                    }
                  }))}
                  style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                  required
                />
                <label 
                  htmlFor={item.key}
                  style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  {item.label} *
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={styles.label}>Signature électronique *</label>
          <input
            type="text"
            placeholder="Tapez votre nom complet pour signer"
            value={personData.signature || ''}
            onChange={(e) => setPersonData(prev => ({ ...prev, signature: e.target.value }))}
            style={styles.input}
            required
          />
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '20px'
        }}>
          <input
            type="checkbox"
            id="training_confirmed"
            checked={personData.training_confirmed || false}
            onChange={(e) => setPersonData(prev => ({ ...prev, training_confirmed: e.target.checked }))}
            style={{ width: '24px', height: '24px', accentColor: '#10b981' }}
            required
          />
          <label 
            htmlFor="training_confirmed"
            style={{ 
              color: '#86efac', 
              fontSize: '15px', 
              fontWeight: '600', 
              cursor: 'pointer',
              flex: 1
            }}
          >
            ✅ Je certifie avoir reçu toutes les formations requises et je m'engage légalement à respecter les procédures de sécurité *
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              flex: 1
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!personData.signature || !personData.training_confirmed}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              flex: 1,
              opacity: (!personData.signature || !personData.training_confirmed) ? 0.5 : 1
            }}
          >
            <Signature style={{ width: '18px', height: '18px' }} />
            Confirmer Signature
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== COMPOSANT ENTRY REGISTRY - DÉBUT ===================
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
  setAtmosphericReadings,
  retestTimer = 0
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [surveillantHistory, setSurveillantHistory] = useState<SurveillantShift[]>(permitData.surveillant_history || []);
  const [entrants, setEntrants] = useState<Entrant[]>(permitData.entrants || []);
  const [equipment, setEquipment] = useState<Equipment[]>(permitData.equipment || []);
  const [permitValidation, setPermitValidation] = useState<PermitValidation>(permitData.permit_validation || {
    team_validation: { validated: false, validated_by: '' },
    final_approval: { approved: false, approved_by: '' }
  });
  
  const [currentSurveillant, setCurrentSurveillant] = useState<SurveillantShift | null>(
    surveillantHistory.find(s => s.status === 'active') || null
  );
  
  // États pour signature légale
  const [showSurveillantSignature, setShowSurveillantSignature] = useState(false);
  const [showEntrantSignature, setShowEntrantSignature] = useState(false);
  const [currentSigningEntrant, setCurrentSigningEntrant] = useState<string | null>(null);
  
  const [newSurveillant, setNewSurveillant] = useState({
    name: '',
    company: '',
    signature: '',
    training_confirmed: false,
    formation_details: {
      espace_clos_formation: false,
      formation_expiry: '',
      csaz1006_compliant: false,
      practical_training: false,
      rescue_procedures: false,
      emergency_response: false
    }
  });
  
  const [newEntrant, setNewEntrant] = useState({
    name: '',
    company: '',
    signature: '',
    training_confirmed: false,
    formation_details: {
      espace_clos_formation: false,
      formation_expiry: '',
      csaz1006_compliant: false,
      practical_training: false,
      rescue_procedures: false,
      emergency_response: false
    }
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

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createLegalSignature = (personData: any, role: 'surveillant' | 'entrant'): LegalSignature => {
    const trainingRequirements = getTrainingRequirements(selectedProvince);
    const authority = PROVINCIAL_REGULATIONS[selectedProvince].authority;
    
    return {
      person_name: personData.name,
      signature_text: personData.signature,
      timestamp: new Date().toISOString(),
      ip_address: 'LOCAL_SYSTEM',
      legal_declaration: `Je certifie par la présente que j'ai reçu une formation adéquate selon les exigences de ${authority} pour travailler comme ${role} en espace clos. Je confirme posséder les compétences requises selon les normes en vigueur et m'engage à respecter toutes les procédures de sécurité.`,
      training_confirmed: personData.training_confirmed,
      formation_details: personData.formation_details
    };
  };

  // Demander à confirmer notifications browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // =================== RENDU JSX - SECTION 1 ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Modal de signature légale pour surveillant */}
      {showSurveillantSignature && (
        <LegalSignatureForm
          role="surveillant"
          personData={newSurveillant}
          setPersonData={setNewSurveillant}
          onConfirm={() => {
            setShowSurveillantSignature(false);
          }}
          onCancel={() => {
            setShowSurveillantSignature(false);
            setNewSurveillant(prev => ({ 
              ...prev, 
              signature: '', 
              training_confirmed: false 
            }));
          }}
          selectedProvince={selectedProvince}
          PROVINCIAL_REGULATIONS={PROVINCIAL_REGULATIONS}
        />
      )}

      {/* Modal de signature légale pour entrant */}
      {showEntrantSignature && (
        <LegalSignatureForm
          role="entrant"
          personData={newEntrant}
          setPersonData={setNewEntrant}
          onConfirm={() => {
            setShowEntrantSignature(false);
            setCurrentSigningEntrant(null);
          }}
          onCancel={() => {
            setShowEntrantSignature(false);
            setCurrentSigningEntrant(null);
            setNewEntrant(prev => ({ 
              ...prev, 
              signature: '', 
              training_confirmed: false 
            }));
          }}
          selectedProvince={selectedProvince}
          PROVINCIAL_REGULATIONS={PROVINCIAL_REGULATIONS}
        />
      )}

      {/* Affichage du timer de retest dans la section surveillant */}
      {retestTimer > 0 && currentSurveillant && (
        <div style={styles.emergencyCard}>
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
                  ⏰ RETEST ATMOSPHÉRIQUE OBLIGATOIRE
                </h3>
                <p style={{ color: '#fca5a5', fontSize: isMobile ? '14px' : '16px' }}>
                  Valeurs critiques détectées - Nouveau test requis avant expiration
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
                {formatTimeRemaining(retestTimer)}
              </div>
              <div style={{ color: '#fca5a5', fontSize: '16px' }}>Temps restant</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques en temps réel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Timer style={{ width: '20px', height: '20px' }} />
          📊 Statistiques en Temps Réel
          {retestTimer > 0 && (
            <span style={{
              marginLeft: 'auto',
              padding: '8px 12px',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fca5a5',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              ⏰ Retest: {formatTimeRemaining(retestTimer)}
            </span>
          )}
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

      {/* Section Validation du Permis */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FileText style={{ width: '20px', height: '20px' }} />
          📋 Validation et Approbation du Permis
        </h3>
        
        <div style={styles.grid2}>
          <div style={{
            padding: '20px',
            backgroundColor: permitValidation.team_validation.validated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            borderRadius: '12px',
            border: `2px solid ${permitValidation.team_validation.validated ? '#10b981' : '#6b7280'}`
          }}>
            <h4 style={{ 
              color: permitValidation.team_validation.validated ? '#86efac' : '#9ca3af',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              👥 Validation Équipe
            </h4>
            {permitValidation.team_validation.validated ? (
              <div>
                <div style={{ color: '#86efac', fontSize: '14px', marginBottom: '8px' }}>
                  ✅ Validé par: {permitValidation.team_validation.validated_by}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {permitValidation.team_validation.validation_time && formatTime(permitValidation.team_validation.validation_time)}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  const validatorName = prompt('Nom du validateur de l\'équipe:');
                  if (!validatorName) return;
                  const validatorSignature = prompt('Signature électronique du validateur:');
                  if (!validatorSignature) return;
                  const updatedValidation = {
                    ...permitValidation,
                    team_validation: {
                      validated: true,
                      validated_by: validatorName,
                      validation_time: new Date().toISOString(),
                      validation_signature: validatorSignature
                    }
                  };
                  setPermitValidation(updatedValidation);
                  updateParentData('permit_validation', updatedValidation);
                  alert('✅ Validation équipe confirmée');
                }}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  fontSize: '14px'
                }}
              >
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                Valider avec l'Équipe
              </button>
            )}
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: permitValidation.final_approval.approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
            borderRadius: '12px',
            border: `2px solid ${permitValidation.final_approval.approved ? '#10b981' : '#6b7280'}`
          }}>
            <h4 style={{ 
              color: permitValidation.final_approval.approved ? '#86efac' : '#9ca3af',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              ✅ Approbation Finale
            </h4>
            {permitValidation.final_approval.approved ? (
              <div>
                <div style={{ color: '#86efac', fontSize: '14px', marginBottom: '8px' }}>
                  ✅ Approuvé par: {permitValidation.final_approval.approved_by}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {permitValidation.final_approval.approval_time && formatTime(permitValidation.final_approval.approval_time)}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!permitValidation.team_validation.validated) {
                    alert('⚠️ La validation de l\'équipe doit être effectuée avant l\'approbation finale');
                    return;
                  }
                  const approverName = prompt('Nom de l\'approbateur final:');
                  if (!approverName) return;
                  const approverSignature = prompt('Signature électronique de l\'approbateur:');
                  if (!approverSignature) return;
                  const updatedValidation = {
                    ...permitValidation,
                    final_approval: {
                      approved: true,
                      approved_by: approverName,
                      approval_time: new Date().toISOString(),
                      approval_signature: approverSignature
                    }
                  };
                  setPermitValidation(updatedValidation);
                  updateParentData('permit_validation', updatedValidation);
                  alert('✅ Approbation finale confirmée - Permis validé');
                }}
                disabled={!permitValidation.team_validation.validated}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess,
                  fontSize: '14px',
                  opacity: !permitValidation.team_validation.validated ? 0.5 : 1
                }}
              >
                <Shield style={{ width: '16px', height: '16px' }} />
                Approuver le Permis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cette partie continue dans la section 2 avec les sections Surveillant et Entrants... */}
    </div>
  );
};

export default EntryRegistry;
// =================== SUITE DU COMPOSANT ENTRY REGISTRY - SECTION 2 COMPLÈTE ===================
// Cette section continue directement après la Section 1

  // =================== FONCTIONS SURVEILLANT ===================
  const startSurveillance = () => {
    if (!newSurveillant.name || !newSurveillant.company || !newSurveillant.signature) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires et signer');
      return;
    }

    if (!newSurveillant.training_confirmed) {
      alert('⚠️ Le surveillant doit confirmer sa formation avant de commencer la surveillance');
      return;
    }

    if (currentSurveillant) {
      alert('⚠️ Un surveillant est déjà en service. Terminez sa surveillance avant d\'en commencer une nouvelle.');
      return;
    }

    const legalSignature = createLegalSignature(newSurveillant, 'surveillant');

    const surveillant: SurveillantShift = {
      id: `surveillant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newSurveillant.name,
      company: newSurveillant.company,
      start_time: new Date().toISOString(),
      status: 'active',
      legal_signature: legalSignature,
      forced_evacuations: []
    };

    const updatedHistory = [...surveillantHistory, surveillant];
    setSurveillantHistory(updatedHistory);
    setCurrentSurveillant(surveillant);
    updateParentData('surveillant_history', updatedHistory);
    
    setNewSurveillant({
      name: '',
      company: '',
      signature: '',
      training_confirmed: false,
      formation_details: {
        espace_clos_formation: false,
        formation_expiry: '',
        csaz1006_compliant: false,
        practical_training: false,
        rescue_procedures: false,
        emergency_response: false
      }
    });
    setShowSurveillantSignature(false);
  };

  const endSurveillance = () => {
    if (!currentSurveillant) return;

    // Forcer la sortie de tous les entrants
    const personnelInside = entrants.filter(e => e.current_status === 'inside');
    if (personnelInside.length > 0) {
      const evacuationRecord = {
        timestamp: new Date().toISOString(),
        reason: 'Changement de surveillant - Évacuation obligatoire',
        evacuated_personnel: personnelInside.map(p => p.name)
      };

      // Forcer la sortie avec notification
      const updatedEntrants = entrants.map(entrant => {
        if (entrant.current_status === 'inside') {
          const activeSession = entrant.entry_sessions.find(s => s.status === 'inside');
          if (activeSession) {
            const now = new Date();
            const entryTime = new Date(activeSession.entry_time);
            const duration = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

            const forcedExitSession = {
              ...activeSession,
              exit_time: now.toISOString(),
              duration,
              status: 'completed' as const,
              forced_exit: {
                timestamp: now.toISOString(),
                reason: 'Changement de surveillant',
                new_surveillant: 'En attente'
              }
            };

            const updatedSessions = entrant.entry_sessions.map(s => 
              s.id === activeSession.id ? forcedExitSession : s
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

      // Notification d'alerte
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🚨 ÉVACUATION FORCÉE - Changement de Surveillant', {
            body: `${personnelInside.length} personne(s) évacuée(s) automatiquement`,
            icon: '/c-secur360-logo.png',
            tag: 'evacuation-alert'
          });
        }
      }

      alert(`🚨 ÉVACUATION FORCÉE: ${personnelInside.length} personne(s) évacuée(s) en raison du changement de surveillant. Un nouveau surveillant doit être en place avant toute nouvelle entrée.`);
    }

    const now = new Date();
    const startTime = new Date(currentSurveillant.start_time);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    const updatedSurveillant: SurveillantShift = {
      ...currentSurveillant,
      end_time: now.toISOString(),
      duration,
      status: 'completed',
      forced_evacuations: personnelInside.length > 0 ? 
        [...currentSurveillant.forced_evacuations, {
          timestamp: new Date().toISOString(),
          reason: 'Changement de surveillant - Évacuation obligatoire',
          evacuated_personnel: personnelInside.map(p => p.name)
        }] : currentSurveillant.forced_evacuations
    };

    const updatedHistory = surveillantHistory.map(s => 
      s.id === currentSurveillant.id ? updatedSurveillant : s
    );

    setSurveillantHistory(updatedHistory);
    setCurrentSurveillant(null);
    updateParentData('surveillant_history', updatedHistory);
  };

  const replaceSurveillant = () => {
    if (!newSurveillant.name || !newSurveillant.company || !newSurveillant.signature) {
      alert('⚠️ Veuillez remplir tous les champs du nouveau surveillant et signer');
      return;
    }

    if (!newSurveillant.training_confirmed) {
      alert('⚠️ Le nouveau surveillant doit confirmer sa formation');
      return;
    }

    if (currentSurveillant) {
      endSurveillance();
    }

    setTimeout(() => {
      startSurveillance();
    }, 100);
  };

  // =================== FONCTIONS ENTRANTS AVEC ALERTES ===================
  const addEntrant = () => {
    if (!newEntrant.name || !newEntrant.company || !newEntrant.signature) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires et signer');
      return;
    }

    if (!newEntrant.training_confirmed) {
      alert('⚠️ L\'entrant doit confirmer sa formation avant d\'être ajouté au registre');
      return;
    }

    const legalSignature = createLegalSignature(newEntrant, 'entrant');

    const entrant: Entrant = {
      id: `entrant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEntrant.name,
      company: newEntrant.company,
      total_entries: 0,
      total_duration: 0,
      current_status: 'outside',
      entry_sessions: [],
      added_time: new Date().toISOString(),
      legal_signature: legalSignature
    };

    const updatedEntrants = [...entrants, entrant];
    setEntrants(updatedEntrants);
    updateParentData('entrants', updatedEntrants);
    
    setNewEntrant({
      name: '',
      company: '',
      signature: '',
      training_confirmed: false,
      formation_details: {
        espace_clos_formation: false,
        formation_expiry: '',
        csaz1006_compliant: false,
        practical_training: false,
        rescue_procedures: false,
        emergency_response: false
      }
    });
    setShowEntrantSignature(false);
    setCurrentSigningEntrant(null);
  };

  const toggleEntrantEntry = (entrantId: string) => {
    if (!currentSurveillant) {
      alert('⚠️ Un surveillant doit être en service avant qu\'un entrant puisse entrer dans l\'espace clos.');
      return;
    }

    const entrant = entrants.find(e => e.id === entrantId);
    if (!entrant) return;

    const updatedEntrants = entrants.map(ent => {
      if (ent.id === entrantId) {
        const now = new Date();
        
        if (ent.current_status === 'outside') {
          // Entrée dans l'espace clos
          const newSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entry_time: now.toISOString(),
            status: 'inside' as const
          };

          // Notification d'entrée
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('🟡 ENTRÉE EN ESPACE CLOS', {
                body: `${ent.name} entre dans l'espace clos - Surveillance active: ${currentSurveillant.name}`,
                icon: '/c-secur360-logo.png',
                tag: 'entry-alert'
              });
            }
          }

          return {
            ...ent,
            current_status: 'inside' as const,
            entry_sessions: [...ent.entry_sessions, newSession]
          };
        } else {
          // Sortie de l'espace clos
          const activeSession = ent.entry_sessions.find(s => s.status === 'inside');
          if (!activeSession) return ent;

          const entryTime = new Date(activeSession.entry_time);
          const duration = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

          const completedSession = {
            ...activeSession,
            exit_time: now.toISOString(),
            duration,
            status: 'completed' as const
          };

          const updatedSessions = ent.entry_sessions.map(s => 
            s.id === activeSession.id ? completedSession : s
          );

          // Notification de sortie avec alerte
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('🔴 SORTIE D\'ESPACE CLOS - ALERTE', {
                body: `${ent.name} sort de l'espace clos après ${formatDuration(duration)} - Vérification requise`,
                icon: '/c-secur360-logo.png',
                tag: 'exit-alert',
                requireInteraction: true
              });
            }
          }

          // Alerte sonore dans le navigateur
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR');
            audio.play().catch(() => {}); // Ignore les erreurs d'autoplay
          } catch (e) {}

          return {
            ...ent,
            current_status: 'outside' as const,
            total_entries: ent.total_entries + 1,
            total_duration: ent.total_duration + duration,
            entry_sessions: updatedSessions
          };
        }
      }
      return ent;
    });

    setEntrants(updatedEntrants);
    updateParentData('entrants', updatedEntrants);
  };

  const deleteEntrant = (entrantId: string) => {
    const entrant = entrants.find(e => e.id === entrantId);
    if (entrant?.current_status === 'inside') {
      alert('⚠️ Impossible de supprimer un entrant qui est actuellement dans l\'espace clos. Effectuez d\'abord sa sortie.');
      return;
    }

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

  // =================== CONTINUATION DU RENDU JSX - SECTIONS PRINCIPALES ===================
  
      {/* Section Surveillant avec signature légale */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Eye style={{ width: '20px', height: '20px' }} />
          👁️ Surveillant d'Espace Clos (Signature Légale Obligatoire)
          {retestTimer > 0 && (
            <span style={{
              marginLeft: 'auto',
              padding: '6px 10px',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fca5a5',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              ⏰ Retest: {formatTimeRemaining(retestTimer)}
            </span>
          )}
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
                <div style={{ 
                  color: '#86efac',
                  fontSize: '13px',
                  marginTop: '4px'
                }}>
                  ✍️ Signé le: {formatTime(currentSurveillant.legal_signature.timestamp)}
                </div>
                <div style={{ 
                  color: '#86efac',
                  fontSize: '13px',
                  marginTop: '4px'
                }}>
                  🛡️ Personnel surveillé: {entrants.filter(e => e.current_status === 'inside').length} à l'intérieur
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
            
            {/* Affichage des détails de formation du surveillant */}
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <h5 style={{ color: '#86efac', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                📚 Formation Certifiée ({selectedProvince}):
              </h5>
              <div style={{ fontSize: '12px', color: '#d1d5db' }}>
                Formation expire: {currentSurveillant.legal_signature.formation_details.formation_expiry || 'Non renseigné'}
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '8px',
                flexWrap: 'wrap'
              }}>
                {Object.entries(currentSurveillant.legal_signature.formation_details).map(([key, value]) => {
                  if (key === 'formation_expiry' || !value) return null;
                  return (
                    <span key={key} style={{
                      padding: '2px 6px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      ✓ {key.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Affichage des évacuations forcées */}
            {currentSurveillant.forced_evacuations.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '12px',
                border: '1px solid rgba(220, 38, 38, 0.3)'
              }}>
                <h5 style={{ color: '#fca5a5', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  🚨 Évacuations Forcées:
                </h5>
                {currentSurveillant.forced_evacuations.map((evacuation, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#fecaca', marginBottom: '4px' }}>
                    {formatTime(evacuation.timestamp)} - {evacuation.reason} - {evacuation.evacuated_personnel.length} personne(s)
                  </div>
                ))}
              </div>
            )}
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
              Un surveillant doit signer légalement et être en service avant que des entrants puissent accéder à l'espace clos.
            </div>
          </div>
        )}
        
        {/* Formulaire nouveau surveillant avec signature légale */}
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
            <button
              onClick={() => setShowSurveillantSignature(true)}
              disabled={!newSurveillant.name || !newSurveillant.company}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: (!newSurveillant.name || !newSurveillant.company) ? 0.5 : 1
              }}
            >
              <Signature style={{ width: '18px', height: '18px' }} />
              Signer et Certifier
            </button>
          </div>
        </div>
        
        {/* Affichage signature confirmée */}
        {newSurveillant.signature && newSurveillant.training_confirmed && (
          <div style={{
            ...styles.signatureSection,
            ...styles.signatureConfirmed,
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
              <span style={{ color: '#86efac', fontWeight: '600' }}>
                Signature légale confirmée
              </span>
            </div>
            <div style={{ color: '#d1d5db', fontSize: '14px' }}>
              Signé par: {newSurveillant.signature}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
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
        )}
        
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
                      {shift.forced_evacuations.length > 0 && (
                        <div style={{ 
                          color: '#fca5a5',
                          fontSize: '12px',
                          marginTop: '4px'
                        }}>
                          🚨 {shift.forced_evacuations.length} évacuation(s)
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

      {/* Section Entrants avec signatures légales et alertes */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          👷 Personnel Entrant avec Surveillance Multiple ({entrants.length})
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
              onClick={() => setShowEntrantSignature(true)}
              disabled={!newEntrant.name || !newEntrant.company}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: (!newEntrant.name || !newEntrant.company) ? 0.5 : 1
              }}
            >
              <Signature style={{ width: '18px', height: '18px' }} />
              Signer et Certifier
            </button>
          </div>
        </div>

        {/* Affichage signature confirmée entrant */}
        {newEntrant.signature && newEntrant.training_confirmed && (
          <div style={{
            ...styles.signatureSection,
            ...styles.signatureConfirmed,
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
              <span style={{ color: '#86efac', fontWeight: '600' }}>
                Signature légale confirmée - Entrant
              </span>
            </div>
            <div style={{ color: '#d1d5db', fontSize: '14px' }}>
              Signé par: {newEntrant.signature}
            </div>
            
            <button
              onClick={addEntrant}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                marginTop: '16px'
              }}
            >
              <UserPlus style={{ width: '18px', height: '18px' }} />
              Ajouter Entrant au Registre
            </button>
          </div>
        )}
        
        {/* Liste des entrants avec surveillance multiple */}
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
              Ajoutez des entrants ci-dessus pour commencer le registre d'entrée avec surveillance.
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
                    
                    {/* Affichage de la formation de l'entrant */}
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#86efac'
                    }}>
                      ✍️ Signé: {formatTime(entrant.legal_signature.timestamp)} | 
                      📚 Formation: {entrant.legal_signature.formation_details.formation_expiry || 'N/A'}
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
                      disabled={entrant.current_status === 'inside'}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        width: 'auto',
                        padding: '8px 12px',
                        fontSize: '14px',
                        minHeight: 'auto',
                        opacity: entrant.current_status === 'inside' ? 0.5 : 1
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                      Supprimer
                    </button>
                  </div>
                </div>
                
                {/* Historique des sessions d'entrée avec alertes */}
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
                      📋 Historique des entrées ({entrant.entry_sessions.length}):
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
                          
                          {/* Affichage des sorties forcées */}
                          {session.forced_exit && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: 'rgba(220, 38, 38, 0.2)',
                              borderRadius: '4px',
                              border: '1px solid #ef4444'
                            }}>
                              <div style={{ color: '#fca5a5', fontSize: '12px', fontWeight: '600' }}>
                                🚨 SORTIE FORCÉE: {session.forced_exit.reason}
                              </div>
                              <div style={{ color: '#fecaca', fontSize: '11px' }}>
                                {formatTime(session.forced_exit.timestamp)}
                              </div>
                            </div>
                          )}
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

      {/* Section Équipements - Ajouter */}
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
