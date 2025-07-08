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
  Target,
  MessageSquare,
  Camera,
  Plus,
  X,
  Check,
  Copy
} from 'lucide-react';

// Import des steps (vous devrez créer ces composants)
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
    icon: MessageSquare, 
    title: 'Discussion Équipe', 
    subtitle: 'Consultation et briefing équipe',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  },
  { 
    id: 3, 
    icon: Shield, 
    title: 'Équipements', 
    subtitle: 'Équipements de sécurité requis',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  },
  { 
    id: 4, 
    icon: AlertTriangle, 
    title: 'Dangers', 
    subtitle: 'Identification des risques',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  { 
    id: 5, 
    icon: Settings, 
    title: 'Contrôles', 
    subtitle: 'Mesures de protection',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  { 
    id: 6, 
    icon: Users, 
    title: 'Équipe', 
    subtitle: 'Validation équipe',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  { 
    id: 7, 
    icon: Camera, 
    title: 'Documentation', 
    subtitle: 'Photos et documentation',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  { 
    id: 8, 
    icon: Award, 
    title: 'Finalisation', 
    subtitle: 'Validation finale',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  }
];

// Générateur de numéro AST
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

export default function ASTForm({ tenant, language }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [astNumber] = useState(generateASTNumber());
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
    // Force l'utilisation du code intégré pour Step 1
    if (currentStep === 1) {
      return null; // Le contenu est déjà géré dans le JSX principal
    }

    const stepProps = {
      formData,
      onDataChange: handleDataChange,
      language,
      tenant,
      errors: {}
    };

    switch (currentStep) {
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
    setSaveStatus('saving');
    setIsSaving(true);
    
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSaveStatus('saved');
    setIsSaving(false);
    
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const currentStepData = steps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Données fictives pour les compteurs
  const onJobCount = 8;
  const approvedCount = 6;
  const approvalRate = Math.round((approvedCount / onJobCount) * 100);

  return (
    <>
      {/* CSS PREMIUM STYLES - RESTAURÉ COMPLET */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .form-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            position: relative;
            overflow-x: hidden;
          }

          @keyframes gradientShift {
            0%, 100% { 
              background-position: 0% 50%;
            }
            50% { 
              background-position: 100% 50%;
            }
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

          .glass-effect {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 5;
          }

          .save-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
            transition: all 0.3s ease;
          }

          .save-indicator.saving {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            animation: pulse 2s infinite;
          }

          .save-indicator.saved {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          .save-indicator.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }

          .header-counters {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 20px;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 16px;
            border: 1px solid rgba(100, 116, 139, 0.3);
          }

          .company-info {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .company-logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 20px;
            animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .counters-grid {
            display: flex;
            gap: 24px;
          }

          .counter-item {
            text-align: center;
            padding: 16px 24px;
            background: rgba(15, 23, 42, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(100, 116, 139, 0.3);
            min-width: 100px;
          }

          .counter-number {
            display: block;
            font-size: 28px;
            font-weight: 800;
            color: #3b82f6;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }

          .counter-label {
            display: block;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 600;
          }

          .counter-item.approval-rate .counter-number {
            color: #10b981;
          }

          .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 4px;
            margin-bottom: 24px;
            overflow: hidden;
            border: 1px solid rgba(100, 116, 139, 0.3);
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #f59e0b 50%, #22c55e 75%, #ec4899 100%);
            border-radius: 4px;
            transition: width 1s ease;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }

          .step-indicator {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
          }

          .step-item {
            padding: 20px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            color: #94a3b8;
            backdrop-filter: blur(10px);
          }

          .step-item:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.1);
          }

          .step-item.active {
            background: var(--step-gradient);
            color: white;
            border-color: var(--step-color);
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(var(--step-color-rgb), 0.4);
          }

          .step-item.completed {
            background: rgba(34, 197, 94, 0.1);
            border-color: #22c55e;
            color: #22c55e;
          }

          .step-icon {
            width: 28px;
            height: 28px;
            margin-bottom: 8px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }

          .step-title {
            font-size: 13px;
            font-weight: 700;
            line-height: 1.3;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          }

          .step-content {
            min-height: 600px;
            padding: 40px;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
            border-radius: 24px;
            border: 2px solid var(--step-color);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(var(--step-color-rgb), 0.2);
            margin-bottom: 32px;
            animation: slideInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

          .step-header {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, rgba(var(--step-color-rgb), 0.2) 0%, rgba(var(--step-color-rgb), 0.1) 100%);
            border-radius: 16px;
            border: 2px solid rgba(var(--step-color-rgb), 0.4);
          }

          .step-header h3 {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }

          .step-header p {
            color: #e2e8f0;
            font-size: 16px;
            margin: 0;
            font-weight: 500;
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
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-premium:hover {
            transform: translateY(-2px);
            background-position: 100% 0;
            box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
          }

          .btn-premium:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
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

          .btn-secondary:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
          }

          .navigation-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            background: rgba(15, 23, 42, 0.8);
            border-radius: 20px;
            border: 1px solid rgba(100, 116, 139, 0.3);
            backdrop-filter: blur(20px);
          }

          .progress-info {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
          }

          .ast-number-display {
            background: rgba(34, 197, 94, 0.1);
            border: 2px solid #22c55e;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .ast-number {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 18px;
            font-weight: 700;
            color: #22c55e;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }

          @keyframes logoGlow {
            0%, 100% { 
              filter: brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(245, 158, 11, 0.4));
            }
            50% { 
              filter: brightness(1.5) contrast(1.3) drop-shadow(0 0 25px rgba(245, 158, 11, 0.7));
            }
          }

          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }

          .logo-glow {
            animation: logoGlow 3s ease-in-out infinite;
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .form-container {
              padding: 12px;
            }

            .glass-effect {
              padding: 16px;
              border-radius: 16px;
            }

            .header-counters {
              flex-direction: column;
              gap: 16px;
              padding: 16px;
            }

            .company-info {
              flex-direction: column;
              text-align: center;
            }

            .counters-grid {
              width: 100%;
              justify-content: space-around;
            }

            .step-indicator {
              grid-template-columns: 1fr;
              max-height: 300px;
              overflow-y: auto;
            }

            .step-item {
              padding: 12px 16px;
              flex-direction: row;
              justify-content: flex-start;
              text-align: left;
            }

            .step-icon {
              width: 20px;
              height: 20px;
              margin-bottom: 0;
              margin-right: 8px;
            }

            .step-content {
              padding: 20px;
              min-height: 400px;
            }

            .step-header {
              padding: 16px;
            }

            .step-header h3 {
              font-size: 20px;
            }

            .navigation-bar {
              padding: 16px;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              margin: 0;
              border-radius: 0;
              border-bottom: none;
              z-index: 1000;
            }

            .form-container {
              padding-bottom: 100px;
            }
          }
        `
      }} />

      <div className="form-container">
        {/* Fond interactif qui suit la souris */}
        <div 
          className="interactive-bg"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />

        {/* Indicateur de sauvegarde */}
        {saveStatus !== 'idle' && (
          <div className={`save-indicator ${saveStatus}`}>
            {saveStatus === 'saving' && (
              <>
                <Clock style={{ width: '16px', height: '16px' }} />
                Sauvegarde en cours...
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check style={{ width: '16px', height: '16px' }} />
                ✅ Sauvegardé avec succès
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <X style={{ width: '16px', height: '16px' }} />
                Erreur de sauvegarde
              </>
            )}
          </div>
        )}

        <div className="glass-effect">
          {/* Header avec compteurs */}
          <div className="header-counters">
              {/* Logo Premium Ultra Grossi - IDENTIQUE AU DASHBOARD */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div 
                  className="float-animation glow-effect"
                  style={{
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                    padding: '32px',
                    borderRadius: '32px',
                    border: '4px solid #f59e0b',
                    boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '96px',
                    height: '96px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <img 
                      src="/c-secur360-logo.png" 
                      alt="C-Secur360"
                      className="logo-glow"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'contain',
                        filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback identique au dashboard */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                      borderRadius: '20px',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '32px',
                      color: '#f59e0b',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      C🛡️
                    </div>
                  </div>
                  
                  {/* Effet brillance animé renforcé - IDENTIQUE DASHBOARD */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
                    animation: 'shine 2.5s ease-in-out infinite'
                  }} />
                  
                  {/* Effet de pulse en arrière-plan - IDENTIQUE DASHBOARD */}
                  <div style={{
                    position: 'absolute',
                    inset: '-10px',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '40px',
                    animation: 'pulse 3s ease-in-out infinite'
                  }} />
                </div>
                <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', margin: '0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  🛡️ Analyse Sécuritaire du Travail
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', margin: '8px 0 0 0', fontWeight: '500' }}>
                  Étape {currentStep} sur {steps.length} • {currentStepData.title}
                </p>
              </div>
            </div>

            <div className="counters-grid">
              <div className="counter-item">
                <span className="counter-number">{onJobCount}</span>
                <span className="counter-label">Sur la job</span>
              </div>
              <div className="counter-item">
                <span className="counter-number">{approvedCount}</span>
                <span className="counter-label">Approuvé AST</span>
              </div>
              <div className="counter-item approval-rate">
                <span className="counter-number">{approvalRate}%</span>
                <span className="counter-label">Taux d'approbation</span>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Indicateur d'étapes */}
          <div className="step-indicator">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{
                    '--step-color': step.color,
                    '--step-gradient': step.gradient,
                    '--step-color-rgb': step.color === '#3b82f6' ? '59, 130, 246' :
                                       step.color === '#22c55e' ? '34, 197, 94' :
                                       step.color === '#f97316' ? '249, 115, 22' :
                                       step.color === '#8b5cf6' ? '139, 92, 246' :
                                       step.color === '#f59e0b' ? '245, 158, 11' :
                                       step.color === '#10b981' ? '16, 185, 129' :
                                       step.color === '#6366f1' ? '99, 102, 241' :
                                       '236, 72, 153'
                  } as any}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <Icon className="step-icon" />
                  <div className="step-title">
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Affichage du numéro AST */}
          <div className="ast-number-display">
            <div>
              <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                🔢 Numéro AST Généré
              </div>
              <div className="ast-number">
                {astNumber}
              </div>
            </div>
            <button 
              style={{
                background: 'none',
                border: '1px solid #22c55e',
                color: '#22c55e',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title="Copier le numéro AST"
            >
              <Copy style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Contenu de l'étape courante */}
          <div 
            className="step-content"
            style={{
              '--step-color': currentStepData.color,
              '--step-color-rgb': currentStepData.color === '#3b82f6' ? '59, 130, 246' :
                                 currentStepData.color === '#22c55e' ? '34, 197, 94' :
                                 currentStepData.color === '#f97316' ? '249, 115, 22' :
                                 currentStepData.color === '#8b5cf6' ? '139, 92, 246' :
                                 currentStepData.color === '#f59e0b' ? '245, 158, 11' :
                                 currentStepData.color === '#10b981' ? '16, 185, 129' :
                                 currentStepData.color === '#6366f1' ? '99, 102, 241' :
                                 '236, 72, 153'
            } as any}
          >
            {/* Header de l'étape avec couleur dynamique */}
            <div className="step-header">
              <h3>
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
              <p>
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Contenu du step */}
            <div>
              {/* Step 1 utilise le code intégré, autres steps utilisent les composants */}
              {currentStep !== 1 && getCurrentStepComponent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="navigation-bar">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary"
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Précédent
            </button>

            <div className="progress-info">
              <Clock style={{ width: '16px', height: '16px' }} />
              Sauvegarde automatique activée
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length}
              className="btn-premium"
            >
              {currentStep === steps.length ? 'Terminé' : 'Suivant'}
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
