'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye, 
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Building,
  Phone,
  User,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';

interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
}

interface FormData {
  projectInfo?: any;
  teamDiscussion?: any;
  equipment?: any[];
  hazards?: any[];
  controls?: any[];
  teamValidation?: any;
  documentation?: any;
  finalization?: any;
}

export default function ASTForm({ tenant, language }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Génération du numéro AST légal
  const astNumber = `AST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  // Gestion des données
  const handleDataChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Copie du numéro AST
  const handleCopyAST = () => {
    navigator.clipboard.writeText(astNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Steps avec contenu légal
  const steps = [
    { 
      id: 1, 
      title: 'Informations Projet', 
      subtitle: 'Identification légale du chantier',
      icon: FileText, 
      color: '#3b82f6',
      required: true
    },
    { 
      id: 2, 
      title: 'Discussion Équipe', 
      subtitle: 'Consultation préalable obligatoire',
      icon: Users, 
      color: '#10b981',
      required: true
    },
    { 
      id: 3, 
      title: 'Équipements', 
      subtitle: 'Équipements de sécurité requis',
      icon: Shield, 
      color: '#f59e0b',
      required: true
    },
    { 
      id: 4, 
      title: 'Dangers & Risques', 
      subtitle: 'Identification des dangers selon RSST',
      icon: AlertTriangle, 
      color: '#ef4444',
      required: true
    },
    { 
      id: 5, 
      title: 'Contrôles', 
      subtitle: 'Mesures de protection hiérarchiques',
      icon: CheckCircle, 
      color: '#8b5cf6',
      required: true
    },
    { 
      id: 6, 
      title: 'Validation Équipe', 
      subtitle: 'Approbation par les travailleurs',
      icon: Users, 
      color: '#06b6d4',
      required: true
    },
    { 
      id: 7, 
      title: 'Documentation', 
      subtitle: 'Photos et documents légaux',
      icon: Camera, 
      color: '#84cc16',
      required: false
    },
    { 
      id: 8, 
      title: 'Finalisation', 
      subtitle: 'Signature et validation finale',
      icon: CheckCircle, 
      color: '#059669',
      required: true
    }
  ];

  const getCurrentStepComponent = () => {
    if (currentStep === 1) {
      return null; // Géré dans le JSX principal
    }

    // Placeholders pour les autres steps
    const stepTitles = {
      2: 'Discussion Équipe',
      3: 'Équipements de Sécurité',
      4: 'Identification des Dangers',
      5: 'Mesures de Contrôle',
      6: 'Validation par l\'Équipe',
      7: 'Documentation',
      8: 'Finalisation'
    };

    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, ${steps[currentStep - 1]?.color}40, ${steps[currentStep - 1]?.color}20)`,
          borderRadius: '20px',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${steps[currentStep - 1]?.color}60`
        }}>
          {React.createElement(steps[currentStep - 1]?.icon || FileText, {
            size: 32,
            color: steps[currentStep - 1]?.color
          })}
        </div>
        <h3 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '12px' }}>
          {stepTitles[currentStep as keyof typeof stepTitles]}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>
          {steps[currentStep - 1]?.subtitle}
        </p>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          color: '#60a5fa'
        }}>
          <Clock size={20} style={{ marginBottom: '8px' }} />
          <span>Section en développement</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      {/* Styles CSS intégrés */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes shine {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-animation { animation: pulse 4s ease-in-out infinite; }
        
        .shine-effect {
          background: linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
          background-size: 200px 100%;
          animation: shine 2.5s infinite;
        }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
        }
        
        .step-card {
          transition: all 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .step-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          
          .glass-effect {
            padding: 24px !important;
            margin: 16px !important;
          }
          
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>

      {/* Header Premium */}
      <header style={{
        background: 'linear-gradient(135deg, #1e2a3a 0%, #2d3748 50%, #1a202c 100%)',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, #3b82f6, #f59e0b, #10b981, #ef4444, #8b5cf6) 1',
        padding: '24px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Logo et info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {/* Logo C-Secur360 */}
            <div 
              className="float-animation"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                borderRadius: '20px',
                border: '3px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="shine-effect" style={{ position: 'absolute', inset: 0 }} />
              <img 
                src="/c-secur360-logo.png" 
                alt="C-Secur360"
                style={{ 
                  width: '64px', 
                  height: '64px',
                  filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color: #f59e0b; font-size: 28px; font-weight: 900;">C🛡️</span>';
                }}
              />
            </div>
            
            {/* Titre */}
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                margin: 0, 
                background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                C-Secur360
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#94a3b8', 
                margin: 0,
                fontWeight: '500'
              }}>
                Analyse Sécuritaire du Travail • Étape {currentStep} sur {steps.length}
              </p>
            </div>
          </div>

          {/* Numéro AST */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Shield size={20} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>
                NUMÉRO AST OFFICIEL
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#ffffff',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {astNumber}
                <button
                  onClick={handleCopyAST}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#10b981' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ padding: '40px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Progress bar */}
        <div className="glass-effect" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
              Progression de l'AST
            </h2>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: `linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6)`,
                height: '100%',
                width: `${(currentStep / steps.length) * 100}%`,
                transition: 'width 0.5s ease',
                borderRadius: '12px'
              }} />
            </div>
          </div>

          {/* Steps navigation */}
          <div className="step-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {steps.map((step) => (
              <div
                key={step.id}
                className="step-card"
                onClick={() => setCurrentStep(step.id)}
                style={{
                  background: currentStep === step.id 
                    ? `linear-gradient(135deg, ${step.color}20, ${step.color}10)`
                    : 'rgba(30, 41, 59, 0.5)',
                  border: currentStep === step.id 
                    ? `2px solid ${step.color}` 
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {step.required && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    background: '#ef4444',
                    borderRadius: '50%'
                  }} />
                )}
                
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: currentStep === step.id ? step.color : 'rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <step.icon size={24} color={currentStep === step.id ? '#ffffff' : '#94a3b8'} />
                </div>
                
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentStep === step.id ? '#ffffff' : '#94a3b8',
                  margin: '0 0 4px',
                  lineHeight: '1.2'
                }}>
                  {step.title}
                </h3>
                
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {step.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="glass-effect" style={{ padding: '40px', marginBottom: '40px' }}>
          
          {/* ÉTAPE 1: Informations Projet avec contenu légal */}
          {currentStep === 1 && (
            <div>
              {/* En-tête de section */}
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#ffffff',
                  marginBottom: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Informations du Projet
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                  Identification légale complète du chantier selon les exigences du RSST
                </p>
              </div>

              {/* Formulaire avec contenu légal */}
              <div className="form-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px'
              }}>
                
                {/* Section Client */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Building size={24} color="#3b82f6" />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                      Informations Client
                    </h3>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Nom du Client *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Hydro-Québec, Bell Canada..."
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Téléphone Client
                    </label>
                    <input
                      type="tel"
                      placeholder="(514) 555-0123"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Personne-ressource
                    </label>
                    <input
                      type="text"
                      placeholder="Nom du responsable client"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Section Localisation */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '20px',
                  padding: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <MapPin size={24} color="#10b981" />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                      Localisation
                    </h3>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Lieu des Travaux *
                    </label>
                    <input
                      type="text"
                      placeholder="Adresse complète du site de travail"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Type d'Industrie
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      outline: 'none'
                    }}>
                      <option value="">Sélectionner...</option>
                      <option value="construction">Construction</option>
                      <option value="industriel">Industriel</option>
                      <option value="commercial">Commercial</option>
                      <option value="residentiel">Résidentiel</option>
                      <option value="telecommunications">Télécommunications</option>
                      <option value="energie">Énergie</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Coordonnées GPS
                    </label>
                    <input
                      type="text"
                      placeholder="45.5017, -73.5673 (optionnel)"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Section Projet */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '20px',
                  padding: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Briefcase size={24} color="#f59e0b" />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                      Détails du Projet
                    </h3>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Nom du Projet *
                    </label>
                    <input
                      type="text"
                      placeholder="Titre descriptif du projet"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                        Date Début
                      </label>
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                        Date Fin Estimée
                      </label>
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Nombre de Travailleurs
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Section Responsable AST */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <User size={24} color="#8b5cf6" />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                      Responsable AST
                    </h3>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Nom Complet *
                    </label>
                    <input
                      type="text"
                      placeholder="Prénom et nom du responsable"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Fonction/Titre
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Superviseur, Chef d'équipe"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '8px' }}>
                      Téléphone/Contact
                    </label>
                    <input
                      type="tel"
                      placeholder="Numéro d'urgence"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* Description détaillée */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                padding: '32px',
                marginTop: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <FileText size={24} color="#6366f1" />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                    Description Détaillée des Travaux
                  </h3>
                </div>
                
                <textarea
                  placeholder="Décrivez en détail les travaux à effectuer selon les exigences légales du RSST :

• Méthodes utilisées et procédures spéciales
• Équipements impliqués et zones d'intervention  
• Conditions particulières et contraintes du site
• Interactions avec d'autres corps de métier

Plus la description est détaillée, plus l'analyse de sécurité sera précise et efficace. Cette information est essentielle en cas de réclamation ou d'enquête."
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '20px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#a5b4fc'
                }}>
                  💡 <strong>Conseil légal:</strong> Une description précise protège votre entreprise en cas d'accident et facilite les enquêtes de la CNESST.
                </div>
              </div>

            </div>
          )}

          {/* Autres steps */}
          {currentStep !== 1 && getCurrentStepComponent()}
        </div>

        {/* Navigation */}
        <div className="glass-effect" style={{ 
          padding: '24px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          bottom: '20px'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: currentStep === 1 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(59, 130, 246, 0.2)',
              border: currentStep === 1 ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              color: currentStep === 1 ? '#9ca3af' : '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
            Précédent
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} />
              <span>Sauvegarde automatique</span>
            </div>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: currentStep === steps.length ? 'rgba(75, 85, 99, 0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: currentStep === steps.length ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Suivant
            <ArrowRight size={20} />
          </button>
        </div>

      </main>
    </div>
  );
}
