// RescuePlan.tsx - Version Complète Corrigée Compatible SafetyManager Build Ready
"use client";

import React from 'react';
import { 
  Shield, Wrench, Users, Clock, Plus, Trash2
} from 'lucide-react';

// Import SafetyManager et styles unifiés
import { ConfinedSpaceComponentProps } from './SafetyManager';
import { styles } from './styles';

// =================== TYPES ET INTERFACES ===================
interface LegalRescueData {
  // Certification équipe
  rescue_team_certifications: {
    csa_z1006_certified: boolean;
    certification_expiry: string;
    first_aid_level2: boolean;
    cpr_certified: boolean;
    rescue_training_hours: number;
  };
  
  // Équipements certifiés
  equipment_certifications: {
    harness_inspection_date: string;
    scba_certification: string;
    mechanical_recovery_cert: string;
    last_equipment_inspection: string;
    equipment_serial_numbers: string[];
  };
  
  // Tests réglementaires
  annual_drill_required: boolean;
  last_effectiveness_test: string;
  regulatory_compliance_verified: boolean;
  response_time_verified: boolean;
}

// ✅ TYPE GUARD FUNCTIONS POUR CORRIGER L'ERREUR BUILD
function isRescueEquipmentRecord(equipment: Record<string, boolean> | {} | undefined): equipment is Record<string, boolean> {
  return equipment != null && typeof equipment === 'object' && Object.keys(equipment).length >= 0;
}

function getRescueEquipmentValue(equipment: Record<string, boolean> | {} | undefined, key: string): boolean {
  if (equipment != null && typeof equipment === 'object' && key in equipment) {
    return (equipment as Record<string, boolean>)[key] || false;
  }
  return false;
}

function getRescueTrainingValue(training: Record<string, boolean> | {} | undefined, key: string): boolean {
  if (training != null && typeof training === 'object' && key in training) {
    return (training as Record<string, boolean>)[key] || false;
  }
  return false;
}

// ✅ TYPE GUARDS POUR LES CERTIFICATIONS
function getRescueTeamCertificationValue(certifications: any, key: string): boolean {
  if (certifications != null && typeof certifications === 'object' && key in certifications) {
    return Boolean(certifications[key]);
  }
  return false;
}

function getEquipmentCertificationValue(certifications: any, key: string): string {
  if (certifications != null && typeof certifications === 'object' && key in certifications) {
    return String(certifications[key] || '');
  }
  return '';
}

// =================== COMPOSANT RESCUE PLAN ===================
const RescuePlan: React.FC<ConfinedSpaceComponentProps> = ({
  language = 'fr',
  permitData,
  selectedProvince = 'QC',
  regulations,
  isMobile: propIsMobile = false,
  safetyManager
}) => {
  const currentIsMobile = propIsMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  // =================== FONCTIONS UTILITAIRES CORRIGÉES ===================
  // ✅ CORRECTION 1 : Handler updatePermitData avec vérifications SafetyManager
  const updatePermitData = React.useCallback((updates: any) => {
    // Vérification SafetyManager disponible
    if (safetyManager) {
      try {
        safetyManager.updateRescuePlan(updates);
      } catch (error) {
        console.warn('SafetyManager updateRescuePlan failed:', error);
      }
    }
    
    // Fallback : si pas de SafetyManager, log les données
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour updateRescuePlan:', updates);
    }
  }, [safetyManager]);

  // ✅ CORRECTION 2 : Accès sécurisé aux données rescueData avec fallbacks
  const rescueData = React.useMemo(() => {
    // Essai avec permitData fourni en props
    if (permitData?.rescuePlan) {
      return permitData.rescuePlan;
    }
    
    // Essai avec SafetyManager currentPermit
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        if (currentPermit?.rescuePlan) {
          return currentPermit.rescuePlan;
        }
      } catch (error) {
        console.warn('SafetyManager currentPermit.rescuePlan access failed:', error);
      }
    }
    
    // Fallback : objet vide avec structure par défaut
    return {
      rescue_plan_type: '',
      rescue_plan_responsible: '',
      rescue_team_phone: '',
      rescue_response_time: '',
      rescue_plan: '',
      rescue_equipment: {},
      rescue_equipment_validated: false,
      rescue_steps: [],
      rescue_team_certifications: {
        csa_z1006_certified: false,
        certification_expiry: '',
        first_aid_level2: false,
        cpr_certified: false,
        rescue_training_hours: 0
      },
      equipment_certifications: {
        harness_inspection_date: '',
        scba_certification: '',
        mechanical_recovery_cert: '',
        last_equipment_inspection: '',
        equipment_serial_numbers: []
      },
      rescue_training: {},
      annual_drill_required: false,
      last_effectiveness_test: '',
      regulatory_compliance_verified: false,
      response_time_verified: false,
      last_drill_date: '',
      drill_results: '',
      drill_notes: '',
      rescue_plan_validated: false
    };
  }, [permitData, safetyManager]);

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Plan de Sauvetage Obligatoire (Art. 309 RSST)",
      legalObligation: "OBLIGATION LÉGALE",
      obligationText: "Un plan de sauvetage personnalisé avec personnel et équipements requis doit être disponible sur place pour intervention rapide (réglementation 25 juillet 2023).",
      criticalStatistic: "Statistique critique",
      statisticText: "Plus de 60% des victimes d'accidents fatals en espace clos sont des personnes ayant tenté un sauvetage sans formation adéquate.",
      rescuePlanType: "Type de plan de sauvetage *",
      selectType: "Sélectionner le type de sauvetage",
      internalTeam: "Équipe de sauvetage interne",
      externalSpecialist: "Firme spécialisée externe", 
      fireDepartment: "Service incendie municipal",
      contractor: "Contracteur externe",
      planResponsible: "Responsable du plan *",
      emergencyPhone: "Téléphone d'urgence équipe *",
      maxResponseTime: "Temps de réponse maximum",
      immediate: "Immédiat (sur place)",
      minutes2: "2 minutes",
      minutes5: "5 minutes", 
      minutes10: "10 minutes",
      minutes15: "15 minutes",
      generalDescription: "Description générale du plan de sauvetage",
      generalDescriptionPlaceholder: "Décrivez le plan de sauvetage général, les procédures d'accès, les points de rassemblement...",
      requiredEquipment: "Équipements de Sauvetage Requis",
      equipmentValidation: "VALIDATION ÉQUIPEMENTS",
      equipmentValidationText: "Je certifie que tous les équipements de sauvetage obligatoires sont disponibles, inspectés et en bon état de fonctionnement sur le site. *",
      rescueTraining: "Formation Équipe de Sauvetage",
      testValidation: "Test et Validation du Plan",
      lastDrillDate: "Date dernier exercice",
      drillResults: "Résultats test",
      selectResult: "Sélectionner",
      successful: "Réussi - Plan efficace",
      needsImprovement: "À améliorer",
      failed: "Échec - Révision requise",
      notTested: "Pas encore testé",
      planEffectiveness: "Notes sur l'efficacité du plan",
      effectivenessPlaceholder: "Observations des exercices, améliorations identifiées, temps de réponse mesuré...",
      finalConfirmation: "CONFIRMATION",
      confirmationText: "Je certifie que le plan de sauvetage est en place, l'équipe est formée et les équipements sont disponibles sur site pour intervention immédiate. *",
      detailedProcedures: "Procédures détaillées de sauvetage *",
      addStep: "Ajouter étape",
      noStepsDefined: "Aucune étape définie. Cliquez sur \"Ajouter étape\" pour commencer.",
      stepDescription: "Description de l'action",
      deleteStep: "Supprimer cette étape",
      shortDescription: "Description courte",
      noText: "Aucun texte",
      characters: "caractères"
    },
    en: {
      title: "Mandatory Rescue Plan (Art. 309 RSST)",
      legalObligation: "LEGAL OBLIGATION",
      obligationText: "A personalized rescue plan with required personnel and equipment must be available on site for rapid intervention (regulation July 25, 2023).",
      criticalStatistic: "Critical statistic",
      statisticText: "More than 60% of victims of fatal accidents in confined spaces are people who attempted rescue without adequate training.",
      rescuePlanType: "Rescue plan type *",
      selectType: "Select rescue type",
      internalTeam: "Internal rescue team",
      externalSpecialist: "External specialist firm",
      fireDepartment: "Municipal fire department", 
      contractor: "External contractor",
      planResponsible: "Plan responsible *",
      emergencyPhone: "Team emergency phone *",
      maxResponseTime: "Maximum response time",
      immediate: "Immediate (on site)",
      minutes2: "2 minutes",
      minutes5: "5 minutes",
      minutes10: "10 minutes", 
      minutes15: "15 minutes",
      generalDescription: "General rescue plan description",
      generalDescriptionPlaceholder: "Describe the general rescue plan, access procedures, assembly points...",
      requiredEquipment: "Required Rescue Equipment",
      equipmentValidation: "EQUIPMENT VALIDATION",
      equipmentValidationText: "I certify that all mandatory rescue equipment is available, inspected and in good working condition on site. *",
      rescueTraining: "Rescue Team Training",
      testValidation: "Plan Test and Validation",
      lastDrillDate: "Last drill date",
      drillResults: "Test results",
      selectResult: "Select",
      successful: "Successful - Effective plan",
      needsImprovement: "Needs improvement",
      failed: "Failed - Revision required",
      notTested: "Not yet tested",
      planEffectiveness: "Notes on plan effectiveness",
      effectivenessPlaceholder: "Exercise observations, identified improvements, measured response time...",
      finalConfirmation: "CONFIRMATION",
      confirmationText: "I certify that the rescue plan is in place, the team is trained and the equipment is available on site for immediate intervention. *",
      detailedProcedures: "Detailed rescue procedures *",
      addStep: "Add step",
      noStepsDefined: "No steps defined. Click \"Add step\" to start.",
      stepDescription: "Action description",
      deleteStep: "Delete this step", 
      shortDescription: "Short description",
      noText: "No text",
      characters: "characters"
    }
  })[language];

  const texts = getTexts(language);

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: currentIsMobile ? '20px' : '28px' }}>
      
      {/* Section Plan de Sauvetage Obligatoire */}
      <div style={{
        backgroundColor: '#374151',
        borderRadius: '16px',
        padding: currentIsMobile ? '20px' : '24px',
        border: '2px solid #4b5563',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <h3 style={{
          fontSize: currentIsMobile ? '18px' : '20px',
          fontWeight: '700',
          color: 'white',
          marginBottom: currentIsMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
          🚨 {texts.title}
        </h3>
        
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: currentIsMobile ? '16px' : '20px',
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
            ⚠️ <strong>{texts.legalObligation}</strong> : {texts.obligationText}
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            📊 <strong>{texts.criticalStatistic}</strong> : {texts.statisticText}
          </p>
        </div>
        
        <div style={styles.grid2}>
          <div>
            <label style={{ ...styles.label, color: '#fecaca' }}>{texts.rescuePlanType}</label>
            <select
              value={rescueData.rescue_plan_type || ''}
              onChange={(e) => updatePermitData({ rescue_plan_type: e.target.value })}
              style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
              required
            >
              <option value="">{texts.selectType}</option>
              <option value="internal_team">{texts.internalTeam}</option>
              <option value="external_specialist">{texts.externalSpecialist}</option>
              <option value="fire_department">{texts.fireDepartment}</option>
              <option value="contractor">{texts.contractor}</option>
            </select>
          </div>
          <div>
            <label style={{ ...styles.label, color: '#fecaca' }}>{texts.planResponsible}</label>
            <input
              type="text"
              placeholder="Nom et titre du responsable"
              value={rescueData.rescue_plan_responsible || ''}
              onChange={(e) => updatePermitData({ rescue_plan_responsible: e.target.value })}
              style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
              required
            />
          </div>
        </div>
        
        <div style={styles.grid2}>
          <div>
            <label style={{ ...styles.label, color: '#fecaca' }}>{texts.emergencyPhone}</label>
            <input
              type="tel"
              placeholder="Ex: 1-800-XXX-XXXX"
              value={rescueData.rescue_team_phone || ''}
              onChange={(e) => updatePermitData({ rescue_team_phone: e.target.value })}
              style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
              required
            />
          </div>
          <div>
            <label style={{ ...styles.label, color: '#fecaca' }}>{texts.maxResponseTime}</label>
            <select
              value={rescueData.rescue_response_time || ''}
              onChange={(e) => updatePermitData({ rescue_response_time: e.target.value })}
              style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
            >
              <option value="">{texts.selectResult}</option>
              <option value="immediate">{texts.immediate}</option>
              <option value="2_minutes">{texts.minutes2}</option>
              <option value="5_minutes">{texts.minutes5}</option>
              <option value="10_minutes">{texts.minutes10}</option>
              <option value="15_minutes">{texts.minutes15}</option>
            </select>
          </div>
        </div>
        
        {/* Description générale du plan de sauvetage */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ ...styles.label, color: '#9ca3af' }}>{texts.generalDescription}</label>
          <textarea
            placeholder={texts.generalDescriptionPlaceholder}
            value={rescueData.rescue_plan || ''}
            onChange={(e) => updatePermitData({ rescue_plan: e.target.value })}
            style={{ 
              ...styles.input, 
              height: currentIsMobile ? '100px' : '120px', 
              resize: 'vertical',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #6b7280'
            }}
          />
        </div>
        
        {/* Équipements de sauvetage obligatoires */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{
            fontSize: currentIsMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#d1d5db',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Wrench style={{ width: '20px', height: '20px' }} />
            {texts.requiredEquipment}
          </h4>
          
          <div style={styles.grid2}>
            {[
              { id: 'harness_class_e', label: '🦺 Harnais classe E et ligne de vie', required: true },
              { id: 'mechanical_recovery', label: '⛓️ Dispositif de récupération mécanique', required: true },
              { id: 'scba_equipment', label: '🫁 Appareil respiratoire autonome (ARA)', required: true },
              { id: 'first_aid_kit', label: '🏥 Trousse premiers soins et RCR', required: true },
              { id: 'atmospheric_monitor', label: '📊 Détecteur multi-gaz portable', required: true },
              { id: 'communication_device', label: '📻 Équipement communication bidirectionnel', required: true },
              { id: 'ventilation_equipment', label: '💨 Équipement de ventilation d\'urgence', required: false },
              { id: 'lighting_equipment', label: '💡 Éclairage d\'urgence étanche', required: false }
            ].map((equipment) => (
              <div key={equipment.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(107, 114, 128, 0.2)'
              }}>
                <input
                  type="checkbox"
                  id={equipment.id}
                  // ✅ LIGNE 388 CORRIGÉE - Utilisation de getRescueEquipmentValue
                  checked={getRescueEquipmentValue(rescueData.rescue_equipment || {}, equipment.id)}
                  onChange={(e) => updatePermitData({ 
                    rescue_equipment: { 
                      // ✅ LIGNE 412 CORRIGÉE - Gestion du cas undefined
                      ...(isRescueEquipmentRecord(rescueData.rescue_equipment || {}) ? (rescueData.rescue_equipment || {}) : {}),
                      [equipment.id]: e.target.checked 
                    }
                  })}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#10b981'
                  }}
                />
                <label 
                  htmlFor={equipment.id}
                  style={{
                    color: equipment.required ? '#d1d5db' : '#9ca3af',
                    fontSize: '14px',
                    fontWeight: equipment.required ? '600' : '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {equipment.label}
                  {equipment.required && <span style={{ color: '#f87171' }}> *</span>}
                </label>
              </div>
            ))}
          </div>
          
          {/* Validation des équipements de sauvetage */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            border: '1px solid #10b981'
          }}>
            <input
              type="checkbox"
              id="rescue_equipment_validated"
              checked={rescueData.rescue_equipment_validated || false}
              onChange={(e) => updatePermitData({ rescue_equipment_validated: e.target.checked })}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#10b981'
              }}
              required
            />
            <label 
              htmlFor="rescue_equipment_validated"
              style={{
                color: '#86efac',
                fontSize: currentIsMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              ✅ <strong>{texts.equipmentValidation}</strong> : {texts.equipmentValidationText}
            </label>
          </div>
        </div>
        
        {/* Procédures de sauvetage avec système d'étapes dynamiques */}
        <div style={{ marginTop: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <label style={{ ...styles.label, color: '#9ca3af', margin: 0 }}>
              {texts.detailedProcedures}
            </label>
            <button
              type="button"
              onClick={() => {
                const currentSteps = rescueData.rescue_steps || [];
                const newStep = {
                  id: Date.now(),
                  step: currentSteps.length + 1,
                  description: ''
                };
                updatePermitData({ 
                  rescue_steps: [...currentSteps, newStep]
                });
              }}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                width: 'auto',
                padding: '8px 12px',
                fontSize: '14px',
                minHeight: 'auto'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              {texts.addStep}
            </button>
          </div>
          
          {/* Affichage des étapes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(rescueData.rescue_steps || []).length === 0 ? (
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '2px dashed #6b7280',
                textAlign: 'center'
              }}>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
                  {texts.noStepsDefined}
                </p>
              </div>
            ) : (
              (rescueData.rescue_steps || []).map((step: any, index: number) => (
                <div key={step.id} style={{
                  display: 'flex',
                  flexDirection: currentIsMobile ? 'column' : 'row',
                  alignItems: currentIsMobile ? 'stretch' : 'flex-start',
                  gap: currentIsMobile ? '12px' : '12px',
                  padding: currentIsMobile ? '16px' : '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* En-tête avec numéro et bouton supprimer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    ...(currentIsMobile ? { width: '100%' } : { flexDirection: 'column' })
                  }}>
                    <div style={{
                      minWidth: currentIsMobile ? '40px' : '32px',
                      height: currentIsMobile ? '40px' : '32px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: currentIsMobile ? '16px' : '14px',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      ...(currentIsMobile ? {} : { marginBottom: '8px' })
                    }}>
                      {step.step}
                    </div>
                    
                    {currentIsMobile && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          color: '#9ca3af',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          Étape {step.step}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSteps = (rescueData.rescue_steps || [])
                              .filter((s: any) => s.id !== step.id)
                              .map((s: any, idx: number) => ({ ...s, step: idx + 1 }));
                            updatePermitData({ rescue_steps: updatedSteps });
                          }}
                          style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.8)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '40px',
                            minHeight: '40px',
                            color: 'white',
                            transition: 'all 0.2s ease'
                          }}
                          title={texts.deleteStep}
                          onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(220, 38, 38, 1)';
                            (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
                            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    )}
                    
                    {!currentIsMobile && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSteps = (rescueData.rescue_steps || [])
                            .filter((s: any) => s.id !== step.id)
                            .map((s: any, idx: number) => ({ ...s, step: idx + 1 }));
                          updatePermitData({ rescue_steps: updatedSteps });
                        }}
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.8)',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          minHeight: '32px',
                          color: 'white'
                        }}
                        title={texts.deleteStep}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                  
                  {/* Zone de texte optimisée */}
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {currentIsMobile && (
                      <label style={{
                        color: '#9ca3af',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {texts.stepDescription}
                      </label>
                    )}
                    <textarea
                      placeholder={currentIsMobile 
                        ? `Décrire l'action à effectuer pour l'étape ${step.step}...` 
                        : `Étape ${step.step}: Décrire l'action à effectuer...`
                      }
                      value={step.description}
                      onChange={(e) => {
                        const updatedSteps = (rescueData.rescue_steps || []).map((s: any) =>
                          s.id === step.id ? { ...s, description: e.target.value } : s
                        );
                        updatePermitData({ rescue_steps: updatedSteps });
                      }}
                      style={{
                        ...styles.input,
                        height: currentIsMobile ? '80px' : '60px',
                        resize: 'vertical',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid #6b7280',
                        fontSize: currentIsMobile ? '16px' : '14px',
                        lineHeight: '1.5',
                        padding: currentIsMobile ? '12px' : '10px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLTextAreaElement).style.borderColor = '#3b82f6';
                        (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLTextAreaElement).style.borderColor = '#6b7280';
                        (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                      }}
                    />
                    {/* Compteur de caractères pour mobile */}
                    {currentIsMobile && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <span>
                          {step.description ? `${step.description.length} ${texts.characters}` : texts.noText}
                        </span>
                        {step.description && step.description.length < 20 && (
                          <span style={{ color: '#f59e0b' }}>
                            ⚠️ {texts.shortDescription}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Certification Réglementaire de l'Équipe */}
        <div style={{
          backgroundColor: '#dc2626',
          borderRadius: '16px',
          padding: currentIsMobile ? '20px' : '24px',
          border: '2px solid #ef4444',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
          marginTop: '20px'
        }}>
          <h4 style={{
            fontSize: currentIsMobile ? '18px' : '20px',
            fontWeight: '700',
            color: 'white',
            marginBottom: currentIsMobile ? '16px' : '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Users style={{ width: '24px', height: '24px', color: '#fecaca' }} />
            🎓 Certification Réglementaire de l'Équipe de Sauvetage
          </h4>
          
          <div style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: currentIsMobile ? '16px' : '20px',
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
              🎓 <strong>CERTIFICATION OBLIGATOIRE</strong> : L'équipe de sauvetage doit posséder les certifications réglementaires CSA Z1006-2023 et formations de premiers soins niveau 2.
            </p>
            <p style={{ 
              color: '#fca5a5', 
              fontSize: '14px',
              margin: 0,
              fontStyle: 'italic'
            }}>
              ⏰ <strong>Validité limitée</strong> : Certifications à renouveler selon les échéances réglementaires (généralement 2-3 ans).
            </p>
          </div>
          
          {/* Certifications de l'équipe */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{
              color: '#fecaca',
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              Certifications Obligatoires de l'Équipe
            </h5>
            
            <div style={styles.grid2}>
              {[
                { 
                  id: 'csa_z1006_certified', 
                  label: '🏅 Certification CSA Z1006 - Gestion travail espace clos', 
                  required: true,
                  field: 'csa_z1006_certified'
                },
                { 
                  id: 'first_aid_level2', 
                  label: '🏥 Premiers soins niveau 2 (16h minimum)', 
                  required: true,
                  field: 'first_aid_level2'
                },
                { 
                  id: 'cpr_certified', 
                  label: '💗 RCR/DEA certifié par organisme reconnu', 
                  required: true,
                  field: 'cpr_certified'
                },
                { 
                  id: 'response_time_verified', 
                  label: '⏱️ Temps de réponse ≤4 minutes vérifié', 
                  required: true,
                  field: 'response_time_verified'
                }
              ].map((cert) => (
                <div key={cert.id} style={{
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
                    id={cert.id}
                    // ✅ LIGNE 821 CORRIGÉE - Utilisation de getRescueTeamCertificationValue
                    checked={getRescueTeamCertificationValue(rescueData.rescue_team_certifications, cert.field)}
                    onChange={(e) => updatePermitData({ 
                      rescue_team_certifications: { 
                        ...rescueData.rescue_team_certifications, 
                        [cert.field]: e.target.checked 
                      }
                    })}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#ef4444'
                    }}
                    required={cert.required}
                  />
                  <label 
                    htmlFor={cert.id}
                    style={{
                      color: '#fecaca',
                      fontSize: '14px',
                      fontWeight: cert.required ? '600' : '500',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {cert.label}
                    {cert.required && <span style={{ color: '#fca5a5' }}> *</span>}
                  </label>
                </div>
              ))}
            </div>
            
            {/* Dates d'expiration des certifications */}
            <div style={{ marginTop: '16px' }}>
              <div style={styles.grid2}>
                <div>
                  <label style={{ ...styles.label, color: '#fca5a5' }}>Expiration certification CSA Z1006 *</label>
                  <input
                    type="date"
                    value={rescueData.rescue_team_certifications?.certification_expiry || ''}
                    onChange={(e) => updatePermitData({ 
                      rescue_team_certifications: { 
                        ...rescueData.rescue_team_certifications, 
                        certification_expiry: e.target.value 
                      }
                    })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, color: '#fca5a5' }}>Heures formation sauvetage *</label>
                  <input
                    type="number"
                    placeholder="Ex: 40"
                    min="16"
                    max="200"
                    value={rescueData.rescue_team_certifications?.rescue_training_hours || ''}
                    onChange={(e) => updatePermitData({ 
                      rescue_team_certifications: { 
                        ...rescueData.rescue_team_certifications, 
                        rescue_training_hours: parseInt(e.target.value) || 0
                      }
                    })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Certification des équipements */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{
              color: '#fecaca',
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              🔧 Certification des Équipements de Sauvetage
            </h5>
            
            <div style={styles.grid2}>
              <div>
                <label style={{ ...styles.label, color: '#fca5a5' }}>Dernière inspection harnais *</label>
                <input
                  type="date"
                  value={rescueData.equipment_certifications?.harness_inspection_date || ''}
                  onChange={(e) => updatePermitData({ 
                    equipment_certifications: { 
                      ...rescueData.equipment_certifications, 
                      harness_inspection_date: e.target.value 
                    }
                  })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                  required
                />
              </div>
              <div>
                <label style={{ ...styles.label, color: '#fca5a5' }}>Certification ARA/SCBA *</label>
                <input
                  type="text"
                  placeholder="Ex: CSA-Z94.4-18"
                  value={rescueData.equipment_certifications?.scba_certification || ''}
                  onChange={(e) => updatePermitData({ 
                    equipment_certifications: { 
                      ...rescueData.equipment_certifications, 
                      scba_certification: e.target.value 
                    }
                  })}
                  style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                  required
                />
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <div style={styles.grid2}>
                <div>
                  <label style={{ ...styles.label, color: '#fca5a5' }}>Cert. récupération mécanique *</label>
                  <input
                    type="text"
                    placeholder="Ex: Treuil DBI-SALA 8518590"
                    value={rescueData.equipment_certifications?.mechanical_recovery_cert || ''}
                    onChange={(e) => updatePermitData({ 
                      equipment_certifications: { 
                        ...rescueData.equipment_certifications, 
                        mechanical_recovery_cert: e.target.value 
                      }
                    })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ ...styles.label, color: '#fca5a5' }}>Dernière inspection générale *</label>
                  <input
                    type="date"
                    value={rescueData.equipment_certifications?.last_equipment_inspection || ''}
                    onChange={(e) => updatePermitData({ 
                      equipment_certifications: { 
                        ...rescueData.equipment_certifications, 
                        last_equipment_inspection: e.target.value 
                      }
                    })}
                    style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tests réglementaires annuels */}
          <div style={{ 
            marginTop: '20px',
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
              id="annual_drill_required"
              checked={rescueData.annual_drill_required || false}
              onChange={(e) => updatePermitData({ annual_drill_required: e.target.checked })}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="annual_drill_required"
              style={{
                color: '#fecaca',
                fontSize: currentIsMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              📅 <strong>EXERCICE ANNUEL OBLIGATOIRE</strong> : Test d'efficacité du plan de sauvetage effectué dans les 12 derniers mois *
            </label>
          </div>
          
          {rescueData.annual_drill_required && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ ...styles.label, color: '#fca5a5' }}>Date dernier test d'efficacité *</label>
              <input
                type="date"
                value={rescueData.last_effectiveness_test || ''}
                onChange={(e) => updatePermitData({ last_effectiveness_test: e.target.value })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #fca5a5' }}
                required={rescueData.annual_drill_required}
              />
            </div>
          )}
          
          {/* Conformité réglementaire finale */}
          <div style={{ 
            marginTop: '20px',
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
              id="regulatory_compliance_verified"
              checked={rescueData.regulatory_compliance_verified || false}
              onChange={(e) => updatePermitData({ regulatory_compliance_verified: e.target.checked })}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="regulatory_compliance_verified"
              style={{
                color: '#fecaca',
                fontSize: currentIsMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              ⚖️ <strong>CONFORMITÉ RÉGLEMENTAIRE</strong> : Je certifie la conformité du plan de sauvetage aux exigences réglementaires de {selectedProvince} *
            </label>
          </div>
        </div>
        
        {/* Formation équipe de sauvetage */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{
            fontSize: currentIsMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#d1d5db',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Users style={{ width: '20px', height: '20px' }} />
            {texts.rescueTraining}
          </h4>
          
          <div style={styles.grid2}>
            {[
              { id: 'confined_space_rescue', label: '🚨 Sauvetage en espace clos', required: true },
              { id: 'first_aid_cpr', label: '🏥 Premiers soins et RCR', required: true },
              { id: 'respiratory_protection', label: '🫁 Protection respiratoire', required: true },
              { id: 'vertical_rescue', label: '🧗 Sauvetage vertical', required: false },
              { id: 'hazmat_awareness', label: '☢️ Sensibilisation matières dangereuses', required: false },
              { id: 'fire_safety', label: '🔥 Sécurité incendie', required: false }
            ].map((training) => (
              <div key={training.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(107, 114, 128, 0.2)'
              }}>
                <input
                  type="checkbox"
                  id={training.id}
                  // ✅ CORRECTION PRÉVENTIVE - Utilisation de getRescueTrainingValue
                  checked={getRescueTrainingValue(rescueData.rescue_training || {}, training.id)}
                  onChange={(e) => updatePermitData({ 
                    rescue_training: { 
                      // ✅ CORRECTION PRÉVENTIVE - Gestion du cas undefined pour rescue_training
                      ...(isRescueEquipmentRecord(rescueData.rescue_training || {}) ? (rescueData.rescue_training || {}) : {}),
                      [training.id]: e.target.checked 
                    }
                  })}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#10b981'
                  }}
                />
                <label 
                  htmlFor={training.id}
                  style={{
                    color: training.required ? '#93c5fd' : '#d1d5db',
                    fontSize: '14px',
                    fontWeight: training.required ? '600' : '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {training.label}
                  {training.required && <span style={{ color: '#60a5fa' }}> *</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Test du plan de sauvetage */}
        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '2px dashed #fca5a5'
        }}>
          <h4 style={{
            fontSize: currentIsMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#d1d5db',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock style={{ width: '20px', height: '20px' }} />
            📋 {texts.testValidation}
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={{ ...styles.label, color: '#9ca3af' }}>{texts.lastDrillDate}</label>
              <input
                type="date"
                value={rescueData.last_drill_date || ''}
                onChange={(e) => updatePermitData({ last_drill_date: e.target.value })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
              />
            </div>
            <div>
              <label style={{ ...styles.label, color: '#9ca3af' }}>{texts.drillResults}</label>
              <select
                value={rescueData.drill_results || ''}
                onChange={(e) => updatePermitData({ drill_results: e.target.value })}
                style={{ ...styles.input, backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid #6b7280' }}
              >
                <option value="">{texts.selectResult}</option>
                <option value="successful">✅ {texts.successful}</option>
                <option value="needs_improvement">⚠️ {texts.needsImprovement}</option>
                <option value="failed">❌ {texts.failed}</option>
                <option value="not_tested">🔄 {texts.notTested}</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label style={{ ...styles.label, color: '#9ca3af' }}>{texts.planEffectiveness}</label>
            <textarea
              placeholder={texts.effectivenessPlaceholder}
              value={rescueData.drill_notes || ''}
              onChange={(e) => updatePermitData({ drill_notes: e.target.value })}
              style={{ 
                ...styles.input, 
                height: '80px', 
                resize: 'vertical',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #6b7280'
              }}
            />
          </div>
        </div>
        
        {/* Validation finale */}
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderRadius: '12px',
          border: '1px solid #10b981'
        }}>
          <input
            type="checkbox"
            id="rescue_plan_validated"
            checked={rescueData.rescue_plan_validated || false}
            onChange={(e) => updatePermitData({ rescue_plan_validated: e.target.checked })}
            style={{
              width: '24px',
              height: '24px',
              accentColor: '#10b981'
            }}
            required
          />
          <label 
            htmlFor="rescue_plan_validated"
            style={{
              color: '#86efac',
              fontSize: currentIsMobile ? '15px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ✅ <strong>{texts.finalConfirmation}</strong> : {texts.confirmationText}
          </label>
        </div>
      </div>
    </div>
  );
};

export default RescuePlan;
