'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Settings,
  Zap,
  Award,
  Target
} from 'lucide-react';

// Import des steps
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Controls from './steps/Step4Controls';
import Step5Permits from './steps/Step5Permits';
import Step6Validation from './steps/Step6Validation';
import Step7TeamShare from './steps/Step7TeamShare';
import Step8Finalization from './steps/Step8Finalization';

interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
}

const steps = [
  { 
    id: 1, 
    icon: FileText, 
    title: 'Informations Projet', 
    subtitle: 'Détails du projet et localisation',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  { 
    id: 2, 
    icon: Shield, 
    title: 'Équipements', 
    subtitle: 'Équipements de sécurité requis',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  },
  { 
    id: 3, 
    icon: AlertTriangle, 
    title: 'Dangers', 
    subtitle: 'Identification des risques',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  },
  { 
    id: 4, 
    icon: Target, 
    title: 'Contrôles', 
    subtitle: 'Mesures de protection',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  { 
    id: 5, 
    icon: FileText, 
    title: 'Permis', 
    subtitle: 'Autorisations requises',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  { 
    id: 6, 
    icon: CheckCircle, 
    title: 'Validation', 
    subtitle: 'Approbation équipe',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  { 
    id: 7, 
    icon: Users, 
    title: 'Partage', 
    subtitle: 'Partage avec équipe',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  { 
    id: 8, 
    icon: Award, 
    title: 'Finalisation', 
    subtitle: 'Publication finale',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  }
];

export default function ASTForm({ tenant, language }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Animation d'entrée et suivi de souris
  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDataChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    const stepProps = {
      formData,
      onDataChange: handleDataChange,
      language,
      tenant,
      errors: {} // Ajout de la prop errors manquante
    };

    switch (currentStep) {
      case 1: return <Step1ProjectInfo {...stepProps} />;
      case 2: return <Step2Equipment {...stepProps} />;
      case 3: return <Step3Hazards {...stepProps} />;
      case 4: return <Step4Controls {...stepProps} />;
      case 5: return <Step5Permits {...stepProps} />;
      case 6: return <Step6Validation {...stepProps} />;
      case 7: return <Step7TeamShare {...stepProps} />;
      case 8: return <Step8Finalization {...stepProps} />;
      default: return null;
    }
  };

  const saveAST = async () => {
    setIsSaving(true);
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
  };

  const currentStepData = steps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <>
      {/* CSS Animations Global - IDENTIQUE AU DASHBOARD */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0%, 100% { 
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
              background-size: 400% 400%;
              background-position: 0% 50%;
            }
            50% { 
              background-position: 100% 50%;
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes slideInUp {
            from { 
              opacity: 0; 
              transform: translateY(60px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes slideInRight {
            from { 
              opacity: 0; 
              transform: translateX(-60px); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0); 
            }
          }
          
          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15);
            }
            50% { 
              box-shadow: 0 0 70px rgba(245, 158, 11, 0.8), inset 0 0 40px rgba(245, 158, 11, 0.25);
            }
          }
          
          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          
          @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--progress, 0%); }
          }
          
          @keyframes logoGlow {
            0%, 100% { 
              filter: brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(245, 158, 11, 0.4));
            }
            50% { 
              filter: brightness(1.5) contrast(1.3) drop-shadow(0 0 25px rgba(245, 158, 11, 0.7));
            }
          }
          
          .ast-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
          }
          
          .float-animation { 
            animation: float 6s ease-in-out infinite; 
          }
          
          .pulse-animation { 
            animation: pulse 3s ease-in-out infinite; 
          }
          
          .slide-in-up { 
            animation: slideInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          }
          
          .slide-in-right { 
            animation: slideInRight 0.6s ease-out; 
          }
          
          .glow-effect {
            animation: glow 4s ease-in-out infinite;
          }
          
          .logo-glow {
            animation: logoGlow 3s ease-in-out infinite;
          }
          
          .card-hover {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
          }
          
          .card-hover:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(251, 191, 36, 0.3);
          }
          
          .progress-bar {
            animation: progressFill 2s ease-out;
          }
          
          .glass-effect {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .btn-premium {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
            background-size: 200% 200%;
            border: none;
            border-radius: 16px;
            padding: 14px 28px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
          }
          
          .btn-premium:hover {
            transform: translateY(-2px);
            background-position: 100% 0;
            box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
          }
          
          .btn-secondary {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 14px 28px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .btn-secondary:hover {
            transform: translateY(-2px);
            background: rgba(51, 65, 85, 0.9);
            border-color: rgba(255, 255, 255, 0.2);
          }
          
          .interactive-bg {
            position: absolute;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
            pointer-events: none;
            transition: all 0.3s ease;
            z-index: 0;
          }
          
          .step-indicator {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .step-indicator.active {
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
          
          .step-indicator.completed {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
          }
          
          @media (max-width: 768px) {
            .ast-container { padding: 12px; }
            .mobile-hidden { display: none !important; }
            .mobile-full { width: 100% !important; }
            .mobile-text { font-size: 14px !important; }
            .mobile-title { font-size: 24px !important; }
          }
        `
      }} />

      <div className="ast-container">
        {/* Fond interactif qui suit la souris */}
        <div 
          className="interactive-bg"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />

        {/* Pattern overlay pour texture */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Header Ultra Premium IDENTIQUE - Style C-Secur360 */}
        <header style={{
          background: 'linear-gradient(135deg, #1e2a3a 0%, #2d3748 50%, #1a202c 100%)',
          borderBottom: '4px solid transparent',
          borderImage: 'linear-gradient(90deg, #3b82f6, #f59e0b, #22c55e) 1',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 10,
          padding: '20px 0'
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '0 20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s ease'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              
              {/* Logo C-Secur360 IDENTIQUE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Logo Container avec effet glow orange */}
                <div 
                  className="float-animation glow-effect"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '4px solid #f59e0b',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.6), inset 0 0 20px rgba(245, 158, 11, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Logo C-Secur360 */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: '900',
                    fontSize: '20px',
                    color: '#1e293b',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    C🛡️
                  </div>
                  
                  {/* Effet brillance animé RENFORCÉ */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6), transparent)',
                    animation: 'shine 2s ease-in-out infinite'
                  }} />
                  
                  {/* Pulse Border Effect */}
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    border: '2px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '32px',
                    animation: 'pulse 3s ease-in-out infinite'
                  }} />
                </div>
                
                {/* Texte Header */}
                <div className="slide-in-right">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <h1 style={{
                      color: 'white',
                      fontSize: '28px',
                      margin: 0,
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '24px' }}>🛡️</span>
                      C-Secur360
                    </h1>
                  </div>
                  <p style={{
                    color: '#f59e0b',
                    fontSize: '16px',
                    margin: '0 0 4px 0',
                    fontWeight: '600'
                  }}>
                    Analyse Sécuritaire du Travail • Étape {currentStep} sur {steps.length}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '14px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#22c55e'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#22c55e'
                      }} className="pulse-animation" />
                      <span style={{ fontWeight: '600' }}>Système opérationnel</span>
                    </div>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#f59e0b',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      VERSION AST
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contrôles Premium */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                {/* Sélecteur de temps stylé */}
                <select 
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '180px'
                  }}
                >
                  <option>Étape courante</option>
                  <option>Toutes les étapes</option>
                  <option>Étapes complétées</option>
                </select>
                
                {/* Bouton Sauvegarder */}
                <button 
                  onClick={saveAST}
                  disabled={isSaving}
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(10px)',
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  {isSaving ? (
                    <Clock style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <Save style={{ width: '16px', height: '16px' }} />
                  )}
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                
                {/* Bouton Rapport Exécutif */}
                <button 
                  className="btn-premium"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)',
                    backgroundSize: '200% 200%',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Rapport AST
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Container principal */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '32px 20px', 
          position: 'relative',
          zIndex: 5
        }}>

          {/* Indicateur de progression stylé - COULEURS VIVES */}
          <div className="glass-effect slide-in-up" style={{ 
            padding: '32px', 
            marginBottom: '40px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            border: '2px solid rgba(59, 130, 246, 0.4)'
          }}>
            {/* Barre de progression COLORÉE */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '6px 6px 0 0'
            }}>
              <div 
                className="progress-bar"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #f59e0b 50%, #22c55e 75%, #ec4899 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  '--progress': `${progressPercentage}%`
                } as any}
              />
            </div>

            <h2 style={{
              fontSize: '32px',
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontWeight: '800',
              color: '#ffffff', // BLANC ÉCLATANT
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              <currentStepData.icon 
                className="pulse-animation" 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  color: currentStepData.color,
                  filter: 'brightness(1.2) saturate(1.3)'
                }} 
              />
              {currentStepData.title}
              <span style={{
                background: currentStepData.gradient,
                color: 'white',
                padding: '8px 16px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: `0 4px 15px ${currentStepData.color}40`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Étape {currentStep}/{steps.length}
              </span>
            </h2>

            <p style={{
              color: '#e2e8f0', // BLANC CASSÉ au lieu de gris
              fontSize: '18px',
              margin: '0 0 32px 0',
              fontWeight: '600'
            }}>
              {currentStepData.subtitle}
            </p>

            {/* Steps navigation ULTRA CONTRASTÉS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    style={{
                      padding: '20px 16px',
                      background: isActive ? step.gradient : 
                                 isCompleted ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                 'rgba(15, 23, 42, 0.8)',
                      border: `3px solid ${isActive ? step.color : 
                                          isCompleted ? '#22c55e' : 
                                          'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(15px)',
                      boxShadow: isActive ? `0 8px 25px ${step.color}40` : 
                                isCompleted ? '0 8px 25px rgba(34, 197, 94, 0.3)' :
                                '0 4px 15px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <StepIcon style={{
                      width: '28px',
                      height: '28px',
                      margin: '0 auto 12px auto',
                      color: isActive || isCompleted ? 'white' : '#94a3b8',
                      filter: isActive || isCompleted ? 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
                    }} />
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: isActive || isCompleted ? 'white' : '#cbd5e1', // PLUS CLAIR
                      lineHeight: 1.3,
                      textShadow: isActive || isCompleted ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}>
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progression textuelle ULTRA VISIBLE */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '15px',
              color: '#e2e8f0', // BLANC CASSÉ
              fontWeight: '600'
            }}>
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                Progression: {Math.round(progressPercentage)}%
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.2)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                {currentStep - 1} sur {steps.length} étapes complétées
              </span>
            </div>
          </div>

          {/* Contenu de l'étape courante - CONTRASTE MAXIMUM */}
          <div className="glass-effect slide-in-up" style={{
            padding: '40px',
            marginBottom: '40px',
            minHeight: '600px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            border: `2px solid ${currentStepData.color}60`,
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${currentStepData.color}20`
          }}>
            {/* Header de l'étape avec couleur vive */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              background: `linear-gradient(135deg, ${currentStepData.color}20 0%, ${currentStepData.color}10 100%)`,
              borderRadius: '16px',
              border: `2px solid ${currentStepData.color}40`
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#ffffff',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <currentStepData.icon 
                  style={{ 
                    width: '28px', 
                    height: '28px', 
                    color: currentStepData.color,
                    filter: 'brightness(1.2)'
                  }} 
                />
                {currentStepData.title}
              </h3>
              <p style={{
                color: '#e2e8f0',
                fontSize: '16px',
                margin: 0,
                fontWeight: '500'
              }}>
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Contenu du step avec styles pour meilleure visibilité */}
            <div style={{
              '& input, & textarea, & select': {
                background: 'rgba(15, 23, 42, 0.8) !important',
                border: `2px solid ${currentStepData.color}40 !important`,
                color: '#ffffff !important',
                borderRadius: '12px !important',
                padding: '12px 16px !important',
                fontSize: '14px !important',
                fontWeight: '500 !important'
              },
              '& label': {
                color: '#e2e8f0 !important',
                fontSize: '14px !important',
                fontWeight: '600 !important',
                marginBottom: '8px !important',
                display: 'block !important'
              },
              '& .glass-effect': {
                background: 'rgba(15, 23, 42, 0.6) !important',
                border: `1px solid ${currentStepData.color}30 !important'
              }
            } as any}>
              {getCurrentStepComponent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="glass-effect" style={{
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary"
              style={{
                opacity: currentStep === 1 ? 0.4 : 1,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Précédent
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <Clock style={{ width: '16px', height: '16px' }} />
              Sauvegarde automatique activée
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length}
              className="btn-premium"
              style={{
                opacity: currentStep === steps.length ? 0.4 : 1,
                cursor: currentStep === steps.length ? 'not-allowed' : 'pointer'
              }}
            >
              {currentStep === steps.length ? 'Terminé' : 'Suivant'}
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
            </button>
          </div>
        </div>

        {/* Footer Premium */}
        <footer style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          marginTop: '60px',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '24px 20px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '16px' 
            }}>
              <div>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '14px', 
                  margin: '0 0 4px 0',
                  fontWeight: '500'
                }}>
                  🏛️ Conforme CNESST • CSA Z1000 • C-Secur360 © 2024
                </p>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '12px', 
                  margin: 0 
                }}>
                  Plateforme certifiée pour la sécurité au travail
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                fontSize: '14px', 
                color: '#94a3b8',
                flexWrap: 'wrap'
              }}>
                <span className="mobile-hidden">AST en cours • {tenant}</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#22c55e'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#22c55e' 
                  }} className="pulse-animation" />
                  Système opérationnel
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
