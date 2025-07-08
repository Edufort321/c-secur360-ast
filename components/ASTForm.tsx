'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Copy,
  Building,
  Phone,
  User,
  Briefcase,
  Sparkles,
  Star,
  Hexagon,
  Triangle,
  Circle,
  Square
} from 'lucide-react';

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
    color: '#00D2FF',
    gradient: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
    particles: '⚡🏢📋'
  },
  { 
    id: 2, 
    icon: MessageSquare, 
    title: 'Discussion Équipe', 
    subtitle: 'Consultation et briefing équipe',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    particles: '💬👥🎯'
  },
  { 
    id: 3, 
    icon: Shield, 
    title: 'Équipements', 
    subtitle: 'Équipements de sécurité requis',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
    particles: '🛡️⚙️🔧'
  },
  { 
    id: 4, 
    icon: AlertTriangle, 
    title: 'Dangers', 
    subtitle: 'Identification des risques',
    color: '#A8E6CF',
    gradient: 'linear-gradient(135deg, #A8E6CF 0%, #88D8A3 100%)',
    particles: '⚠️🔥💥'
  },
  { 
    id: 5, 
    icon: Settings, 
    title: 'Contrôles', 
    subtitle: 'Mesures de protection',
    color: '#FFD93D',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
    particles: '⚙️🔒🛠️'
  },
  { 
    id: 6, 
    icon: Users, 
    title: 'Équipe', 
    subtitle: 'Validation équipe',
    color: '#6C5CE7',
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    particles: '👥✅🏆'
  },
  { 
    id: 7, 
    icon: Camera, 
    title: 'Documentation', 
    subtitle: 'Photos et documentation',
    color: '#FD79A8',
    gradient: 'linear-gradient(135deg, #FD79A8 0%, #FDCB6E 100%)',
    particles: '📸📄🎨'
  },
  { 
    id: 8, 
    icon: Award, 
    title: 'Finalisation', 
    subtitle: 'Validation finale',
    color: '#00B894',
    gradient: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)',
    particles: '🏆✨🎉'
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

export default function ASTFormUltraWow({ tenant, language }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectInfo: {
      client: '',
      clientPhone: '',
      clientRepresentative: '',
      clientRepresentativePhone: '',
      projectNumber: '',
      astClientNumber: '',
      workLocation: '',
      industry: 'electrical',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      workerCount: 1,
      estimatedDuration: '',
      emergencyContact: '',
      emergencyPhone: '',
      workDescription: ''
    },
    team: {
      members: []
    }
  });
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, emoji: string, speed: number}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [astNumber] = useState(generateASTNumber());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation d'entrée et suivi de souris
  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Système de particules interactif
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      const currentStepData = steps[currentStep - 1];
      const emojis = currentStepData.particles.split('');
      
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          speed: Math.random() * 2 + 1
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y > window.innerHeight ? -50 : particle.y + particle.speed,
        x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.5
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep]);

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
    if (currentStep === 1) {
      return null; // Le contenu est géré dans le JSX principal
    }

    const StepPlaceholder = ({ stepNumber }: { stepNumber: number }) => (
      <div style={{
        padding: '80px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de brillance animé */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          animation: 'shimmer 3s ease-in-out infinite'
        }} />
        
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 20px currentColor)',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          🚀
        </div>
        
        <h3 style={{ 
          color: 'white', 
          fontSize: '32px', 
          marginBottom: '16px',
          fontWeight: '800',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          ✨ Step {stepNumber} Ultra Premium
        </h3>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '18px',
          fontWeight: '500',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          Interface révolutionnaire en développement
        </p>
        
        <div style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.6)',
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`
            }} />
          ))}
        </div>
      </div>
    );

    return <StepPlaceholder stepNumber={currentStep} />;
  };

  const saveAST = async () => {
    setSaveStatus('saving');
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSaveStatus('saved');
    setIsSaving(false);
    
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const currentStepData = steps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const onJobCount = formData.projectInfo?.workerCount || 1;
  const approvedCount = formData.team?.members?.filter((m: any) => m.validationStatus === 'approved').length || 0;
  const approvalRate = Math.round((approvedCount / onJobCount) * 100);

  return (
    <>
      {/* CSS ULTRA WOW RÉVOLUTIONNAIRE */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
          }

          @keyframes cosmicFlow {
            0%, 100% { 
              background: radial-gradient(ellipse at 20% 50%, #6366f1 0%, transparent 50%),
                         radial-gradient(ellipse at 80% 20%, #8b5cf6 0%, transparent 50%),
                         radial-gradient(ellipse at 40% 80%, #ec4899 0%, transparent 50%),
                         linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            }
            25% { 
              background: radial-gradient(ellipse at 60% 30%, #06b6d4 0%, transparent 50%),
                         radial-gradient(ellipse at 30% 70%, #10b981 0%, transparent 50%),
                         radial-gradient(ellipse at 70% 60%, #f59e0b 0%, transparent 50%),
                         linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            }
            50% { 
              background: radial-gradient(ellipse at 80% 80%, #ef4444 0%, transparent 50%),
                         radial-gradient(ellipse at 20% 20%, #3b82f6 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 50%, #8b5cf6 0%, transparent 50%),
                         linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            }
            75% { 
              background: radial-gradient(ellipse at 40% 20%, #22c55e 0%, transparent 50%),
                         radial-gradient(ellipse at 60% 80%, #f97316 0%, transparent 50%),
                         radial-gradient(ellipse at 80% 40%, #a855f7 0%, transparent 50%),
                         linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            }
          }
          
          @keyframes infiniteFloat {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            25% { 
              transform: translateY(-20px) rotate(90deg) scale(1.1);
            }
            50% { 
              transform: translateY(-10px) rotate(180deg) scale(0.9);
            }
            75% { 
              transform: translateY(-30px) rotate(270deg) scale(1.05);
            }
          }
          
          @keyframes hologramGlow {
            0%, 100% { 
              box-shadow: 
                0 0 50px currentColor,
                0 0 100px currentColor,
                inset 0 0 50px rgba(255, 255, 255, 0.1);
              filter: brightness(1) hue-rotate(0deg);
            }
            25% { 
              box-shadow: 
                0 0 80px currentColor,
                0 0 150px currentColor,
                inset 0 0 80px rgba(255, 255, 255, 0.2);
              filter: brightness(1.3) hue-rotate(90deg);
            }
            50% { 
              box-shadow: 
                0 0 120px currentColor,
                0 0 200px currentColor,
                inset 0 0 100px rgba(255, 255, 255, 0.3);
              filter: brightness(1.5) hue-rotate(180deg);
            }
            75% { 
              box-shadow: 
                0 0 100px currentColor,
                0 0 180px currentColor,
                inset 0 0 90px rgba(255, 255, 255, 0.25);
              filter: brightness(1.2) hue-rotate(270deg);
            }
          }
          
          @keyframes quantumPulse {
            0%, 100% { 
              transform: scale(1) rotate(0deg);
              opacity: 1;
              filter: blur(0px) brightness(1);
            }
            25% { 
              transform: scale(1.1) rotate(90deg);
              opacity: 0.8;
              filter: blur(2px) brightness(1.3);
            }
            50% { 
              transform: scale(1.2) rotate(180deg);
              opacity: 0.6;
              filter: blur(4px) brightness(1.5);
            }
            75% { 
              transform: scale(1.05) rotate(270deg);
              opacity: 0.9;
              filter: blur(1px) brightness(1.1);
            }
          }
          
          @keyframes neuralNetwork {
            0% { 
              background-position: 0% 0%, 50% 50%, 100% 100%;
              filter: hue-rotate(0deg);
            }
            25% { 
              background-position: 25% 25%, 75% 25%, 25% 75%;
              filter: hue-rotate(90deg);
            }
            50% { 
              background-position: 50% 50%, 0% 100%, 100% 0%;
              filter: hue-rotate(180deg);
            }
            75% { 
              background-position: 75% 75%, 25% 75%, 75% 25%;
              filter: hue-rotate(270deg);
            }
            100% { 
              background-position: 100% 100%, 50% 50%, 0% 0%;
              filter: hue-rotate(360deg);
            }
          }
          
          @keyframes waveDistortion {
            0%, 100% { 
              transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
              filter: contrast(1) saturate(1);
            }
            25% { 
              transform: perspective(1000px) rotateX(5deg) rotateY(2deg);
              filter: contrast(1.2) saturate(1.3);
            }
            50% { 
              transform: perspective(1000px) rotateX(0deg) rotateY(5deg);
              filter: contrast(1.4) saturate(1.5);
            }
            75% { 
              transform: perspective(1000px) rotateX(-3deg) rotateY(-2deg);
              filter: contrast(1.1) saturate(1.2);
            }
          }
          
          @keyframes hyperGlow {
            0%, 100% { 
              filter: 
                brightness(1.2) 
                contrast(1.1) 
                drop-shadow(0 0 20px currentColor)
                drop-shadow(0 0 40px currentColor)
                drop-shadow(0 0 60px currentColor);
              transform: scale(1);
            }
            50% { 
              filter: 
                brightness(2) 
                contrast(1.5) 
                drop-shadow(0 0 40px currentColor)
                drop-shadow(0 0 80px currentColor)
                drop-shadow(0 0 120px currentColor);
              transform: scale(1.05);
            }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes glow {
            from { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
            to { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px currentColor; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes stepTransition {
            0% { 
              opacity: 0; 
              transform: translateY(100px) scale(0.8) rotateX(45deg);
              filter: blur(20px);
            }
            50% { 
              opacity: 0.7; 
              transform: translateY(0) scale(1.05) rotateX(0deg);
              filter: blur(5px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0) scale(1) rotateX(0deg);
              filter: blur(0px);
            }
          }
          
          @keyframes particleFloat {
            0%, 100% { 
              transform: translateY(0) rotate(0deg) scale(1);
              opacity: 0.7;
            }
            25% { 
              transform: translateY(-50px) rotate(90deg) scale(1.2);
              opacity: 1;
            }
            50% { 
              transform: translateY(-100px) rotate(180deg) scale(0.8);
              opacity: 0.5;
            }
            75% { 
              transform: translateY(-75px) rotate(270deg) scale(1.1);
              opacity: 0.9;
            }
          }
          
          .ultra-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: cosmicFlow 20s ease infinite;
            position: relative;
            overflow: hidden;
          }
          
          .neural-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
            background-size: 300px 300px, 250px 250px, 200px 200px;
            animation: neuralNetwork 15s linear infinite;
            pointer-events: none;
          }
          
          .quantum-field {
            position: absolute;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
            animation: quantumPulse 8s ease-in-out infinite;
            pointer-events: none;
          }
          
          .glass-morphism {
            background: rgba(15, 23, 42, 0.1);
            backdrop-filter: blur(40px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            box-shadow: 
              0 40px 80px rgba(0, 0, 0, 0.5),
              inset 0 2px 0 rgba(255, 255, 255, 0.1),
              0 0 100px rgba(99, 102, 241, 0.2);
            position: relative;
            overflow: hidden;
          }
          
          .glass-morphism::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: shimmer 3s ease-in-out infinite;
          }
          
          .hologram-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
            border-radius: 30px;
            border: 4px solid;
            border-color: currentColor;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: hologramGlow 4s ease-in-out infinite;
            position: relative;
            overflow: hidden;
          }
          
          .hologram-logo::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(from 0deg, transparent, currentColor, transparent);
            animation: infiniteFloat 6s linear infinite;
            opacity: 0.3;
          }
          
          .step-indicator-ultra {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin: 40px 0;
          }
          
          .step-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            padding: 30px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            animation: waveDistortion 10s ease-in-out infinite;
          }
          
          .step-card:hover {
            transform: translateY(-15px) scale(1.05);
            border-color: currentColor;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px currentColor;
          }
          
          .step-card.active {
            background: rgba(255, 255, 255, 0.15);
            border-color: currentColor;
            transform: scale(1.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px currentColor;
            animation: hologramGlow 3s ease-in-out infinite;
          }
          
          .step-card.completed {
            background: rgba(34, 197, 94, 0.2);
            border-color: #22c55e;
            color: #22c55e;
          }
          
          .step-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: infiniteFloat 4s ease-in-out infinite;
            filter: drop-shadow(0 0 20px currentColor);
          }
          
          .step-particles {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 12px;
            opacity: 0.7;
            animation: particleFloat 3s ease-in-out infinite;
          }
          
          .form-content {
            animation: stepTransition 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .input-field {
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 18px 24px;
            color: white;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
          }
          
          .input-field:focus {
            outline: none;
            border-color: currentColor;
            box-shadow: 
              0 0 0 4px rgba(99, 102, 241, 0.2),
              inset 0 2px 10px rgba(0, 0, 0, 0.2),
              0 0 30px currentColor;
            transform: translateY(-2px);
          }
          
          .btn-quantum {
            background: linear-gradient(135deg, currentColor 0%, transparent 50%, currentColor 100%);
            background-size: 200% 200%;
            border: 2px solid currentColor;
            border-radius: 20px;
            padding: 16px 32px;
            color: white;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
            animation: hyperGlow 3s ease-in-out infinite;
          }
          
          .btn-quantum:hover {
            transform: translateY(-5px) scale(1.05);
            background-position: 100% 0;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 50px currentColor;
          }
          
          .btn-quantum::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.5s ease;
          }
          
          .btn-quantum:hover::before {
            left: 100%;
          }
          
          .progress-cosmic {
            height: 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .progress-fill-cosmic {
            height: 100%;
            background: linear-gradient(90deg, 
              #00D2FF 0%, 
              #FF6B6B 20%, 
              #4ECDC4 40%, 
              #A8E6CF 60%, 
              #FFD93D 80%, 
              #6C5CE7 100%);
            border-radius: 10px;
            transition: width 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
            animation: hyperGlow 2s ease-in-out infinite;
          }
          
          .floating-particle {
            position: fixed;
            font-size: 24px;
            pointer-events: none;
            z-index: 1000;
            animation: particleFloat 4s ease-in-out infinite;
            filter: drop-shadow(0 0 10px currentColor);
          }
          
          /* Mobile Ultra Responsive */
          @media (max-width: 768px) {
            .step-indicator-ultra {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .step-card {
              padding: 20px 15px;
            }
            
            .hologram-logo {
              width: 80px;
              height: 80px;
            }
            
            .glass-morphism {
              border-radius: 20px;
              padding: 20px;
            }
          }
        `
      }} />

      <div className="ultra-container">
        {/* Grille neurale animée */}
        <div className="neural-grid" />
        
        {/* Champ quantique interactif */}
        <div 
          className="quantum-field"
          style={{
            left: mousePosition.x - 250,
            top: mousePosition.y - 250,
          }}
        />
        
        {/* Particules flottantes */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: particle.x,
              top: particle.y,
              color: currentStepData.color
            }}
          >
            {particle.emoji}
          </div>
        ))}

        {/* Header Ultra Premium */}
        <header style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(40px)',
          borderBottom: `2px solid ${currentStepData.color}`,
          boxShadow: `0 10px 50px rgba(0, 0, 0, 0.3), 0 0 100px ${currentStepData.color}30`,
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            padding: '30px 20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-50px)',
            transition: 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '30px'
            }}>
              
              {/* Logo Hologramme Ultra Premium */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div 
                  className="hologram-logo"
                  style={{ color: currentStepData.color }}
                >
                  <img 
                    src="/c-secur360-logo.png" 
                    alt="C-Secur360"
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      objectFit: 'contain',
                      filter: 'brightness(1.5) contrast(1.2)',
                      animation: 'hyperGlow 3s ease-in-out infinite'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    width: '90px',
                    height: '90px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: '900'
                  }}>
                    🛡️
                  </div>
                </div>
                
                <div>
                  <h1 style={{
                    fontSize: '48px',
                    margin: 0,
                    lineHeight: 1.2,
                    fontWeight: '900',
                    letterSpacing: '-0.025em',
                    background: `linear-gradient(135deg, white 0%, ${currentStepData.color} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'glow 3s ease-in-out infinite alternate'
                  }}>
                    ⚡ C-Secur360 AST Ultra
                  </h1>
                  <p style={{
                    color: currentStepData.color,
                    fontSize: '22px',
                    margin: '10px 0 0 0',
                    fontWeight: '600',
                    textShadow: `0 0 20px ${currentStepData.color}50`
                  }}>
                    Interface Révolutionnaire • {currentStepData.title}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginTop: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        animation: 'quantumPulse 2s ease-in-out infinite',
                        boxShadow: '0 0 20px #22c55e'
                      }} />
                      <span style={{
                        color: '#22c55e',
                        fontSize: '18px',
                        fontWeight: '700',
                        textShadow: '0 0 10px #22c55e50'
                      }}>
                        Système Ultra Actif
                      </span>
                    </div>
                    <span style={{
                      background: `linear-gradient(135deg, ${currentStepData.color}40, ${currentStepData.color}20)`,
                      color: currentStepData.color,
                      padding: '8px 16px',
                      borderRadius: '15px',
                      fontSize: '14px',
                      fontWeight: '700',
                      border: `1px solid ${currentStepData.color}50`,
                      backdropFilter: 'blur(10px)',
                      textShadow: `0 0 10px ${currentStepData.color}50`
                    }}>
                      {currentStepData.particles}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Numéro AST Cosmique */}
              <div style={{
                background: `linear-gradient(135deg, ${currentStepData.color}20, transparent)`,
                border: `2px solid ${currentStepData.color}`,
                borderRadius: '20px',
                padding: '20px 30px',
                backdropFilter: 'blur(20px)',
                animation: 'hologramGlow 4s ease-in-out infinite',
                textAlign: 'center'
              }}>
                <div style={{
                  color: currentStepData.color,
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  textShadow: `0 0 10px ${currentStepData.color}50`
                }}>
                  🔢 NUMÉRO AST ULTRA
                </div>
                <div style={{
                  fontFamily: 'Monaco, Menlo, Courier New, monospace',
                  fontSize: '20px',
                  fontWeight: '900',
                  color: 'white',
                  letterSpacing: '2px',
                  textShadow: `0 0 20px ${currentStepData.color}`,
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}>
                  {astNumber}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Container principal */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '40px 20px', 
          position: 'relative',
          zIndex: 5
        }}>

          {/* Barre de progression cosmique */}
          <div className="progress-cosmic">
            <div 
              className="progress-fill-cosmic"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Indicateur d'étapes ultra premium */}
          <div className="step-indicator-ultra">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`step-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{
                    color: isActive ? step.color : isCompleted ? '#22c55e' : 'rgba(255, 255, 255, 0.7)',
                    borderColor: isActive ? step.color : isCompleted ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="step-particles">
                    {step.particles}
                  </div>
                  
                  <div 
                    className="step-icon"
                    style={{
                      background: isActive ? step.gradient : isCompleted ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  >
                    <Icon style={{ width: '28px', height: '28px' }} />
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '800', 
                    margin: '0 0 8px 0',
                    textShadow: isActive ? `0 0 20px ${step.color}50` : 'none'
                  }}>
                    {step.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '14px', 
                    margin: '0',
                    opacity: 0.8,
                    fontWeight: '500'
                  }}>
                    {step.subtitle}
                  </p>
                  
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      color: '#22c55e',
                      animation: 'quantumPulse 2s ease-in-out infinite'
                    }}>
                      <CheckCircle style={{ width: '24px', height: '24px' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contenu de l'étape courante */}
          <div 
            className="glass-morphism form-content"
            style={{
              padding: '50px',
              marginBottom: '40px',
              borderColor: `${currentStepData.color}50`
            }}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '50px'
            }}>
              <h2 style={{
                fontSize: '40px',
                fontWeight: '900',
                margin: '0 0 15px 0',
                background: `linear-gradient(135deg, white 0%, ${currentStepData.color} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'glow 3s ease-in-out infinite alternate'
              }}>
                {currentStepData.particles} {currentStepData.title}
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '20px',
                fontWeight: '500',
                margin: '0'
              }}>
                {currentStepData.subtitle}
              </p>
            </div>

            {/* ÉTAPE 1: Layout Ultra Premium */}
            {currentStep === 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '30px'
              }}>
                {/* Client */}
                <div className="glass-morphism" style={{ padding: '30px' }}>
                  <h3 style={{
                    color: currentStepData.color,
                    fontSize: '22px',
                    fontWeight: '700',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textShadow: `0 0 15px ${currentStepData.color}50`
                  }}>
                    🏢 Informations Client
                  </h3>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      Nom du Client *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%', color: currentStepData.color }}
                      placeholder="Ex: Hydro-Québec, Bell Canada..."
                      value={formData.projectInfo.client}
                      onChange={(e) => handleDataChange('projectInfo', {
                        ...formData.projectInfo,
                        client: e.target.value
                      })}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      Téléphone Client
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      style={{ width: '100%', color: currentStepData.color }}
                      placeholder="(514) 555-0123"
                      value={formData.projectInfo.clientPhone}
                      onChange={(e) => handleDataChange('projectInfo', {
                        ...formData.projectInfo,
                        clientPhone: e.target.value
                      })}
                    />
                  </div>
                </div>

                {/* Localisation */}
                <div className="glass-morphism" style={{ padding: '30px' }}>
                  <h3 style={{
                    color: currentStepData.color,
                    fontSize: '22px',
                    fontWeight: '700',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textShadow: `0 0 15px ${currentStepData.color}50`
                  }}>
                    📍 Localisation
                  </h3>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      Lieu des Travaux *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%', color: currentStepData.color }}
                      placeholder="Adresse complète du site de travail"
                      value={formData.projectInfo.workLocation}
                      onChange={(e) => handleDataChange('projectInfo', {
                        ...formData.projectInfo,
                        workLocation: e.target.value
                      })}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      Type d'Industrie
                    </label>
                    <select
                      className="input-field"
                      style={{ width: '100%', color: currentStepData.color }}
                      value={formData.projectInfo.industry}
                      onChange={(e) => handleDataChange('projectInfo', {
                        ...formData.projectInfo,
                        industry: e.target.value
                      })}
                    >
                      <option value="electrical">⚡ Électrique</option>
                      <option value="construction">🏗️ Construction</option>
                      <option value="industrial">🏭 Industriel</option>
                      <option value="manufacturing">⚙️ Manufacturier</option>
                      <option value="office">🏢 Bureau</option>
                      <option value="other">🔧 Autre</option>
                    </select>
                  </div>
                </div>

                {/* Description Ultra Large */}
                <div className="glass-morphism" style={{ 
                  padding: '30px',
                  gridColumn: '1 / -1'
                }}>
                  <h3 style={{
                    color: currentStepData.color,
                    fontSize: '22px',
                    fontWeight: '700',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textShadow: `0 0 15px ${currentStepData.color}50`
                  }}>
                    📝 Description Ultra Détaillée
                  </h3>

                  <textarea
                    className="input-field"
                    style={{ 
                      width: '100%', 
                      minHeight: '200px',
                      color: currentStepData.color,
                      resize: 'vertical'
                    }}
                    placeholder="Décrivez en détail les travaux à effectuer :

⚡ Méthodes utilisées
🔧 Équipements impliqués  
📍 Zones d'intervention
🛡️ Procédures spéciales
⚠️ Conditions particulières

Plus la description est détaillée, plus l'analyse de sécurité sera précise et efficace."
                    value={formData.projectInfo.workDescription}
                    onChange={(e) => handleDataChange('projectInfo', {
                      ...formData.projectInfo,
                      workDescription: e.target.value
                    })}
                  />
                </div>
              </div>
            )}

            {/* Autres étapes */}
            {currentStep !== 1 && (
              <div>
                {getCurrentStepComponent()}
              </div>
            )}
          </div>

          {/* Navigation Ultra Premium */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(30px)',
            borderRadius: '25px',
            padding: '25px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: `2px solid ${currentStepData.color}30`,
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px ${currentStepData.color}20`
          }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-quantum"
              style={{ 
                color: currentStep === 1 ? '#64748b' : currentStepData.color,
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '10px' }} />
              Précédent Ultra
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: currentStepData.color }} />
              Interface Ultra Premium Activée
              <div style={{
                background: `linear-gradient(135deg, ${currentStepData.color}40, transparent)`,
                padding: '8px 16px',
                borderRadius: '12px',
                border: `1px solid ${currentStepData.color}50`,
                color: currentStepData.color,
                fontWeight: '700'
              }}>
                {currentStep}/{steps.length}
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length}
              className="btn-quantum"
              style={{ 
                color: currentStep === steps.length ? '#64748b' : currentStepData.color,
                opacity: currentStep === steps.length ? 0.5 : 1
              }}
            >
              {currentStep === steps.length ? 'Terminé Ultra' : 'Suivant Ultra'}
              <ArrowRight style={{ width: '20px', height: '20px', marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
