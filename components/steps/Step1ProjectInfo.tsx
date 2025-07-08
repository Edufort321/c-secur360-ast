'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Building, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Briefcase,
  Copy,
  Check,
  AlertTriangle,
  Camera,
  Upload,
  X,
  Lock,
  Zap,
  Settings,
  Wrench,
  Droplets,
  Wind,
  Flame,
  Eye,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
}

interface LockoutPoint {
  id: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'chemical' | 'thermal' | 'gravity';
  equipmentName: string;
  location: string;
  lockType: string;
  tagNumber: string;
  isLocked: boolean;
  verifiedBy: string;
  verificationTime: string;
  photos: string[];
  notes: string;
  completedProcedures: number[];
}

interface LockoutPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before_lockout' | 'during_lockout' | 'lockout_device' | 'client_form' | 'verification';
  timestamp: string;
  lockoutPointId?: string;
}

// Générateur de numéro AST
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

// Types d'énergie avec icônes et couleurs
const ENERGY_TYPES = {
  electrical: { 
    name: 'Électrique', 
    icon: Zap, 
    color: '#fbbf24',
    procedures: [
      'Identifier le disjoncteur principal',
      'Couper l\'alimentation électrique', 
      'Verrouiller le disjoncteur',
      'Tester l\'absence de tension',
      'Poser les étiquettes de sécurité',
      'Installation des mises à la terre'
    ]
  },
  mechanical: { 
    name: 'Mécanique', 
    icon: Settings, 
    color: '#6b7280',
    procedures: [
      'Arrêter les équipements mécaniques',
      'Bloquer les parties mobiles',
      'Verrouiller les commandes',
      'Vérifier l\'immobilisation',
      'Signaler la zone',
      'Installer les dispositifs de blocage'
    ]
  },
  hydraulic: { 
    name: 'Hydraulique', 
    icon: Droplets, 
    color: '#3b82f6',
    procedures: [
      'Fermer les vannes principales',
      'Purger la pression résiduelle',
      'Verrouiller les vannes',
      'Vérifier la dépressurisation',
      'Installer des bouchons de sécurité',
      'Tester l\'étanchéité du système'
    ]
  },
  pneumatic: { 
    name: 'Pneumatique', 
    icon: Wind, 
    color: '#10b981',
    procedures: [
      'Couper l\'alimentation en air',
      'Purger les réservoirs d\'air',
      'Verrouiller les vannes',
      'Vérifier la dépressurisation',
      'Isoler les circuits',
      'Contrôler l\'absence de pression'
    ]
  },
  chemical: { 
    name: 'Chimique', 
    icon: AlertTriangle, 
    color: '#f59e0b',
    procedures: [
      'Fermer les vannes d\'alimentation',
      'Purger les conduites',
      'Neutraliser les résidus',
      'Verrouiller les accès',
      'Installer la signalisation',
      'Vérifier l\'absence de vapeurs'
    ]
  },
  thermal: { 
    name: 'Thermique', 
    icon: Flame, 
    color: '#ef4444',
    procedures: [
      'Couper l\'alimentation de chauffage',
      'Laisser refroidir les équipements',
      'Isoler les sources de chaleur',
      'Vérifier la température',
      'Signaler les zones chaudes',
      'Installer les protections thermiques'
    ]
  },
  gravity: { 
    name: 'Gravité', 
    icon: Wrench, 
    color: '#8b5cf6',
    procedures: [
      'Supporter les charges suspendues',
      'Bloquer les mécanismes de levage',
      'Installer des supports de sécurité',
      'Vérifier la stabilité',
      'Baliser la zone',
      'Contrôler les points d\'ancrage'
    ]
  }
};

export default function Step1ProjectInfo({ 
  formData, 
  onDataChange, 
  language, 
  tenant, 
  errors 
}: Step1ProjectInfoProps) {
  const [astNumber, setAstNumber] = useState(formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectInfo = formData?.projectInfo || {};
  const lockoutPoints = projectInfo?.lockoutPoints || [];
  const lockoutPhotos = projectInfo?.lockoutPhotos || [];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentLockoutPhotoIndex, setCurrentLockoutPhotoIndex] = useState<{[key: string]: number}>({});

  const updateProjectInfo = (field: string, value: any) => {
    onDataChange('projectInfo', {
      ...projectInfo,
      [field]: value
    });
  };

  const copyASTNumber = async () => {
    try {
      await navigator.clipboard.writeText(astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const regenerateASTNumber = () => {
    const newNumber = generateASTNumber();
    setAstNumber(newNumber);
    onDataChange('astNumber', newNumber);
  };

  // =================== GESTION PHOTOS ===================
  const handlePhotoCapture = async (category: string, lockoutPointId?: string) => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment'; // Caméra arrière par défaut
        fileInputRef.current.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            processPhoto(file, category, lockoutPointId);
          }
        };
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  };

  const processPhoto = async (file: File, category: string, lockoutPointId?: string) => {
    try {
      // Créer une URL locale pour preview immédiat
      const photoUrl = URL.createObjectURL(file);
      
      const newPhoto: LockoutPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString('fr-CA')}`,
        category: category as any,
        timestamp: new Date().toISOString(),
        lockoutPointId
      };

      const updatedPhotos = [...lockoutPhotos, newPhoto];
      updateProjectInfo('lockoutPhotos', updatedPhotos);

      // TODO: Upload vers serveur/Supabase ici
      console.log('Photo à uploader:', file.name, category);
      
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      'before_lockout': 'Avant verrouillage',
      'during_lockout': 'Pendant verrouillage', 
      'lockout_device': 'Dispositif de verrouillage',
      'client_form': 'Fiche client',
      'verification': 'Vérification'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = lockoutPhotos.filter((photo: LockoutPhoto) => photo.id !== photoId);
    updateProjectInfo('lockoutPhotos', updatedPhotos);
  };

  // =================== GESTION POINTS DE VERROUILLAGE ===================
  const addLockoutPoint = () => {
    const newPoint: LockoutPoint = {
      id: `lockout_${Date.now()}`,
      energyType: 'electrical',
      equipmentName: '',
      location: '',
      lockType: '',
      tagNumber: `TAG-${Date.now().toString().slice(-6)}`,
      isLocked: false,
      verifiedBy: '',
      verificationTime: '',
      photos: [],
      notes: '',
      completedProcedures: []
    };

    const updatedPoints = [...lockoutPoints, newPoint];
    updateProjectInfo('lockoutPoints', updatedPoints);
  };

  const updateLockoutPoint = (pointId: string, field: string, value: any) => {
    const updatedPoints = lockoutPoints.map((point: LockoutPoint) => 
      point.id === pointId ? { ...point, [field]: value } : point
    );
    updateProjectInfo('lockoutPoints', updatedPoints);
  };

  const toggleProcedureComplete = (pointId: string, procedureIndex: number) => {
    const point = lockoutPoints.find((p: LockoutPoint) => p.id === pointId);
    if (!point) return;

    const completedProcedures = point.completedProcedures || [];
    const isCompleted = completedProcedures.includes(procedureIndex);
    
    const updatedCompleted = isCompleted 
      ? completedProcedures.filter((index: number) => index !== procedureIndex)
      : [...completedProcedures, procedureIndex];

    updateLockoutPoint(pointId, 'completedProcedures', updatedCompleted);
  };

  const getProcedureProgress = (point: LockoutPoint): { completed: number; total: number; percentage: number } => {
    const energyType = ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES];
    const total = energyType?.procedures.length || 0;
    const completed = (point.completedProcedures || []).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const deleteLockoutPoint = (pointId: string) => {
    const updatedPoints = lockoutPoints.filter((point: LockoutPoint) => point.id !== pointId);
    updateProjectInfo('lockoutPoints', updatedPoints);
    
    // Supprimer aussi les photos associées
    const updatedPhotos = lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId !== pointId);
    updateProjectInfo('lockoutPhotos', updatedPhotos);
  };

  // =================== CARROUSEL PHOTOS ===================
  const PhotoCarousel = ({ photos, onAddPhoto, lockoutPointId }: {
    photos: LockoutPhoto[];
    onAddPhoto: () => void;
    lockoutPointId?: string;
  }) => {
    const currentIndex = lockoutPointId ? (currentLockoutPhotoIndex[lockoutPointId] || 0) : currentPhotoIndex;
    const totalSlides = photos.length + 1; // +1 pour le slide "Ajouter photo"

    const setCurrentIndex = (index: number) => {
      if (lockoutPointId) {
        setCurrentLockoutPhotoIndex(prev => ({
          ...prev,
          [lockoutPointId]: index
        }));
      } else {
        setCurrentPhotoIndex(index);
      }
    };

    const nextSlide = () => {
      setCurrentIndex((currentIndex + 1) % totalSlides);
    };

    const prevSlide = () => {
      setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    };

    const goToSlide = (index: number) => {
      setCurrentIndex(index);
    };

    return (
      <div className="photo-carousel">
        <div className="carousel-container">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {/* Slides des photos existantes */}
            {photos.map((photo: LockoutPhoto, index: number) => (
              <div key={photo.id} className="carousel-slide">
                <img src={photo.url} alt={photo.caption} />
                <div className="photo-info">
                  <div className="photo-caption">
                    <h4>{getCategoryLabel(photo.category)}</h4>
                    <p>{new Date(photo.timestamp).toLocaleString('fr-CA')}</p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="photo-action-btn delete"
                      onClick={() => deletePhoto(photo.id)}
                      title="Supprimer cette photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slide "Ajouter photo" */}
            <div className="carousel-slide add-photo" onClick={onAddPhoto}>
              <div className="add-photo-content">
                <div className="add-photo-icon">
                  <Camera size={24} />
                </div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  Ajouter une photo
                </h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textAlign: 'center' }}>
                  Documentez cette étape avec une photo
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {totalSlides > 1 && (
            <>
              <button 
                className="carousel-nav prev"
                onClick={prevSlide}
                disabled={totalSlides <= 1}
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                className="carousel-nav next"
                onClick={nextSlide}
                disabled={totalSlides <= 1}
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}

          {/* Indicateurs */}
          {totalSlides > 1 && (
            <div className="carousel-indicators">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div
                  key={index}
                  className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* CSS Premium pour Step 1 avec Verrouillage */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step1-container {
            padding: 0;
          }

          .premium-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
          }

          .form-section {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s ease;
          }

          .form-section:hover {
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          }

          .lockout-section {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
          }

          .lockout-section:hover {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          }

          .section-icon {
            width: 24px;
            height: 24px;
            color: #3b82f6;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }

          .lockout-icon {
            color: #ef4444 !important;
          }

          .section-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }

          .form-field {
            margin-bottom: 20px;
          }

          .field-label {
            display: block;
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .field-label .required {
            color: #ef4444;
            font-weight: 700;
          }

          .premium-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .premium-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: rgba(15, 23, 42, 0.9);
          }

          .premium-input::placeholder {
            color: #64748b;
            font-weight: 400;
          }

          .premium-select {
            width: 100%;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .premium-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .premium-textarea {
            width: 100%;
            min-height: 120px;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            resize: vertical;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-family: inherit;
          }

          .premium-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .premium-textarea::placeholder {
            color: #64748b;
            font-weight: 400;
          }

          .ast-number-card {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px solid #22c55e;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
          }

          .ast-number-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
          }

          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }

          .ast-number-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .ast-number-title {
            color: #22c55e;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ast-number-value {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 24px;
            font-weight: 800;
            color: #22c55e;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 12px;
          }

          .ast-actions {
            display: flex;
            gap: 12px;
          }

          .btn-icon {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid #22c55e;
            color: #22c55e;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-icon:hover {
            background: rgba(34, 197, 94, 0.2);
            transform: translateY(-2px);
          }

          .btn-icon.copied {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }

          .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          }

          .btn-danger {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
          }

          .btn-danger:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          }

          .energy-type-selector {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }

          .energy-type-option {
            padding: 12px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .energy-type-option.selected {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .energy-type-option:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .lockout-point {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            position: relative;
          }

          .lockout-point-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(239, 68, 68, 0.2);
          }

          .photo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
            margin-top: 16px;
          }

          .photo-carousel {
            position: relative;
            margin-top: 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 16px;
            overflow: hidden;
          }

          .carousel-container {
            position: relative;
            width: 100%;
            height: 300px;
            overflow: hidden;
          }

          .carousel-track {
            display: flex;
            transition: transform 0.3s ease;
            height: 100%;
          }

          .carousel-slide {
            min-width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .carousel-slide img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
          }

          .carousel-slide.add-photo {
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed rgba(59, 130, 246, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            flex-direction: column;
            gap: 16px;
          }

          .carousel-slide.add-photo:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.5);
          }

          .add-photo-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: #60a5fa;
          }

          .add-photo-icon {
            width: 48px;
            height: 48px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .carousel-slide.add-photo:hover .add-photo-icon {
            transform: scale(1.1);
            background: rgba(59, 130, 246, 0.3);
          }

          .carousel-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.7);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
          }

          .carousel-nav:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: translateY(-50%) scale(1.1);
          }

          .carousel-nav:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .carousel-nav.prev {
            left: 16px;
          }

          .carousel-nav.next {
            right: 16px;
          }

          .carousel-indicators {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 10;
          }

          .carousel-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .carousel-indicator.active {
            background: rgba(255, 255, 255, 0.9);
            transform: scale(1.2);
          }

          .photo-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            color: white;
            padding: 20px 16px 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .photo-caption {
            flex: 1;
            margin-right: 12px;
          }

          .photo-caption h4 {
            margin: 0 0 4px;
            font-size: 14px;
            font-weight: 600;
          }

          .photo-caption p {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
          }

          .photo-actions {
            display: flex;
            gap: 8px;
          }

          .photo-action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .photo-action-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .photo-action-btn.delete:hover {
            background: rgba(239, 68, 68, 0.8);
            border-color: #ef4444;
          }

          .photo-item {
            position: relative;
            aspect-ratio: 1;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .photo-item:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .photo-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .photo-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            color: white;
            padding: 8px;
            font-size: 12px;
            font-weight: 500;
          }

          .photo-delete {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(239, 68, 68, 0.9);
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            font-size: 12px;
          }

          .photo-capture-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }

          .photo-capture-btn {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 500;
          }

          .photo-capture-btn:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-1px);
          }

          .field-help {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            font-style: italic;
          }

          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .span-full {
            grid-column: 1 / -1;
          }

          .required-indicator {
            color: #ef4444;
            margin-left: 4px;
          }

          .procedures-list {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-top: 12px;
          }

          .procedures-list h4 {
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 12px 0;
          }

          .procedures-checklist {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .procedure-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .procedure-item:hover {
            background: rgba(59, 130, 246, 0.1);
          }

          .procedure-item.completed {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
          }

          .procedure-checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(100, 116, 139, 0.5);
            border-radius: 4px;
            background: rgba(15, 23, 42, 0.8);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .procedure-checkbox.checked {
            background: #22c55e;
            border-color: #22c55e;
            color: white;
          }

          .procedure-checkbox:hover {
            border-color: #3b82f6;
            transform: scale(1.05);
          }

          .procedure-text {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
            flex: 1;
          }

          .procedure-item.completed .procedure-text {
            color: #a7f3d0;
          }

          .procedures-progress {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(100, 116, 139, 0.2);
          }

          .progress-bar {
            background: rgba(15, 23, 42, 0.8);
            border-radius: 8px;
            height: 6px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            transition: width 0.5s ease;
            border-radius: 8px;
          }

          .progress-text {
            font-size: 12px;
            color: #64748b;
            text-align: center;
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .premium-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .form-section {
              padding: 16px;
            }

            .two-column {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .ast-number-value {
              font-size: 18px;
            }

            .section-title {
              font-size: 16px;
            }

            .premium-input,
            .premium-select,
            .premium-textarea {
              font-size: 16px; /* Évite zoom iOS */
            }

            .energy-type-selector {
              grid-template-columns: repeat(2, 1fr);
            }

            .photo-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .photo-capture-buttons {
              flex-direction: column;
            }
          }

          @media (max-width: 480px) {
            .form-section {
              padding: 12px;
            }

            .ast-number-card {
              padding: 16px;
            }

            .ast-actions {
              flex-direction: column;
            }

            .energy-type-selector {
              grid-template-columns: 1fr;
            }

            .photo-grid {
              grid-template-columns: 1fr;
            }
          }
        `
      }} />

      {/* Input caché pour capture photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      <div className="step1-container">
        {/* Carte Numéro AST Premium */}
        <div className="ast-number-card">
          <div className="ast-number-header">
            <div className="ast-number-title">
              <FileText style={{ width: '20px', height: '20px' }} />
              🔢 Numéro AST Unique
            </div>
            <div className="ast-actions">
              <button 
                className={`btn-icon ${copied ? 'copied' : ''}`}
                onClick={copyASTNumber}
                title="Copier le numéro"
              >
                {copied ? (
                  <Check style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px' }} />
                )}
              </button>
              <button 
                className="btn-icon"
                onClick={regenerateASTNumber}
                title="Générer un nouveau numéro"
              >
                <FileText style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          
          <div className="ast-number-value">
            {astNumber}
          </div>
          
          <div className="field-help">
            Numéro généré automatiquement - Usage unique pour cette AST
          </div>
        </div>

        {/* Grille Premium des Sections */}
        <div className="premium-grid">
          
          {/* Section Client */}
          <div className="form-section">
            <div className="section-header">
              <Building className="section-icon" />
              <h3 className="section-title">🏢 Informations Client</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Building style={{ width: '18px', height: '18px' }} />
                Nom du Client
                <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Ex: Hydro-Québec, Bell Canada..."
                value={projectInfo.client || ''}
                onChange={(e) => updateProjectInfo('client', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Phone style={{ width: '18px', height: '18px' }} />
                Téléphone Client
              </label>
              <input
                type="tel"
                className="premium-input"
                placeholder="Ex: (514) 555-0123"
                value={projectInfo.clientPhone || ''}
                onChange={(e) => updateProjectInfo('clientPhone', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />
                Représentant Client
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Nom du responsable projet"
                value={projectInfo.clientRepresentative || ''}
                onChange={(e) => updateProjectInfo('clientRepresentative', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Phone style={{ width: '18px', height: '18px' }} />
                Téléphone Représentant
              </label>
              <input
                type="tel"
                className="premium-input"
                placeholder="Ex: (514) 555-0456"
                value={projectInfo.clientRepresentativePhone || ''}
                onChange={(e) => updateProjectInfo('clientRepresentativePhone', e.target.value)}
              />
            </div>
          </div>

          {/* Section Projet */}
          <div className="form-section">
            <div className="section-header">
              <Briefcase className="section-icon" />
              <h3 className="section-title">📋 Détails du Projet</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Briefcase style={{ width: '18px', height: '18px' }} />
                Numéro de Projet
                <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Ex: PRJ-2025-001"
                value={projectInfo.projectNumber || ''}
                onChange={(e) => updateProjectInfo('projectNumber', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                # AST Client (Optionnel)
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Numéro fourni par le client"
                value={projectInfo.astClientNumber || ''}
                onChange={(e) => updateProjectInfo('astClientNumber', e.target.value)}
              />
              <div className="field-help">
                Numéro de référence du client (si applicable)
              </div>
            </div>

            <div className="two-column">
              <div className="form-field">
                <label className="field-label">
                  <Calendar style={{ width: '18px', height: '18px' }} />
                  Date
                </label>
                <input
                  type="date"
                  className="premium-input"
                  value={projectInfo.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateProjectInfo('date', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Clock style={{ width: '18px', height: '18px' }} />
                  Heure
                </label>
                <input
                  type="time"
                  className="premium-input"
                  value={projectInfo.time || new Date().toTimeString().substring(0, 5)}
                  onChange={(e) => updateProjectInfo('time', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="form-section">
            <div className="section-header">
              <MapPin className="section-icon" />
              <h3 className="section-title">📍 Localisation</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <MapPin style={{ width: '18px', height: '18px' }} />
                Lieu des Travaux
                <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Adresse complète du site de travail"
                value={projectInfo.workLocation || ''}
                onChange={(e) => updateProjectInfo('workLocation', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Briefcase style={{ width: '18px', height: '18px' }} />
                Type d'Industrie
              </label>
              <select
                className="premium-select"
                value={projectInfo.industry || 'electrical'}
                onChange={(e) => updateProjectInfo('industry', e.target.value)}
              >
                <option value="electrical">⚡ Électrique</option>
                <option value="construction">🏗️ Construction</option>
                <option value="industrial">🏭 Industriel</option>
                <option value="manufacturing">⚙️ Manufacturier</option>
                <option value="office">🏢 Bureau/Administratif</option>
                <option value="other">🔧 Autre</option>
              </select>
            </div>
          </div>

          {/* Section Équipe */}
          <div className="form-section">
            <div className="section-header">
              <Users className="section-icon" />
              <h3 className="section-title">👥 Équipe de Travail</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Users style={{ width: '18px', height: '18px' }} />
                Nombre de Personnes
                <span className="required-indicator">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="premium-input"
                placeholder="Ex: 5"
                value={projectInfo.workerCount || 1}
                onChange={(e) => updateProjectInfo('workerCount', parseInt(e.target.value) || 1)}
              />
              <div className="field-help">
                Ce nombre sera comparé aux approbations d'équipe
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Clock style={{ width: '18px', height: '18px' }} />
                Durée Estimée
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder="Ex: 4 heures, 2 jours, 1 semaine"
                value={projectInfo.estimatedDuration || ''}
                onChange={(e) => updateProjectInfo('estimatedDuration', e.target.value)}
              />
            </div>
          </div>

          {/* Section Contacts d'Urgence */}
          <div className="form-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" />
              <h3 className="section-title">🚨 Contacts d'Urgence</h3>
            </div>

            <div className="two-column">
              <div className="form-field">
                <label className="field-label">
                  <AlertTriangle style={{ width: '18px', height: '18px' }} />
                  Contact d'Urgence
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Nom du contact d'urgence"
                  value={projectInfo.emergencyContact || ''}
                  onChange={(e) => updateProjectInfo('emergencyContact', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />
                  Téléphone d'Urgence
                </label>
                <input
                  type="tel"
                  className="premium-input"
                  placeholder="911 ou numéro spécifique"
                  value={projectInfo.emergencyPhone || ''}
                  onChange={(e) => updateProjectInfo('emergencyPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="form-section full-width-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3 className="section-title">📝 Description Détaillée des Travaux</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                Description Complète
                <span className="required-indicator">*</span>
              </label>
              <textarea
                className="premium-textarea"
                style={{
                  width: '100%',
                  minHeight: '200px',
                  maxWidth: 'none',
                  resize: 'vertical'
                }}
                placeholder="Décrivez en détail les travaux à effectuer :&#10;&#10;• Méthodes utilisées&#10;• Équipements impliqués&#10;• Zones d'intervention&#10;• Procédures spéciales&#10;• Conditions particulières&#10;&#10;Plus la description est détaillée, plus l'analyse de sécurité sera précise."
                value={projectInfo.workDescription || ''}
                onChange={(e) => updateProjectInfo('workDescription', e.target.value)}
              />
              <div className="field-help">
                Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.
              </div>
            </div>
          </div>
        </div>

        {/* =================== SECTION VERROUILLAGE/CADENASSAGE =================== */}
        <div className="form-section lockout-section span-full" style={{ marginTop: '32px' }}>
          <div className="section-header">
            <Lock className="section-icon lockout-icon" />
            <h3 className="section-title">🔒 Verrouillage / Cadenassage (LOTO)</h3>
          </div>

          <div className="field-help" style={{ marginBottom: '24px' }}>
            Documentation des procédures de verrouillage/étiquetage des énergies dangereuses selon les normes RSST. 
            Photographiez chaque étape pour assurer une traçabilité complète.
          </div>

          {/* Photos générales de verrouillage */}
          <div className="form-field">
            <label className="field-label">
              <Camera style={{ width: '18px', height: '18px' }} />
              Photos Générales de Verrouillage
            </label>
            
            <div className="photo-capture-buttons">
              <button 
                className="photo-capture-btn"
                onClick={() => handlePhotoCapture('before_lockout')}
              >
                <Camera size={14} />
                Avant verrouillage
              </button>
              <button 
                className="photo-capture-btn"
                onClick={() => handlePhotoCapture('client_form')}
              >
                <FileText size={14} />
                Fiche client
              </button>
              <button 
                className="photo-capture-btn"
                onClick={() => handlePhotoCapture('verification')}
              >
                <Eye size={14} />
                Vérification finale
              </button>
            </div>

            {/* Affichage des photos générales */}
            {lockoutPhotos.filter((photo: LockoutPhoto) => !photo.lockoutPointId).length > 0 ? (
              <PhotoCarousel 
                photos={lockoutPhotos.filter((photo: LockoutPhoto) => !photo.lockoutPointId)}
                onAddPhoto={() => handlePhotoCapture('verification')}
              />
            ) : (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handlePhotoCapture('before_lockout')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              >
                <Camera size={32} color="#60a5fa" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 8px', color: '#60a5fa' }}>Aucune photo</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                  Cliquez pour prendre votre première photo de verrouillage
                </p>
              </div>
            )}
          </div>

          {/* Bouton ajouter point de verrouillage */}
          <div style={{ marginBottom: '24px' }}>
            <button className="btn-primary" onClick={addLockoutPoint}>
              <Plus size={20} />
              Ajouter Point de Verrouillage
            </button>
          </div>

          {/* Liste des points de verrouillage */}
          {lockoutPoints.map((point: LockoutPoint, index: number) => (
            <div key={point.id} className="lockout-point">
              <div className="lockout-point-header">
                <h4 style={{ color: '#ef4444', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  🔒 Point de Verrouillage #{index + 1}
                </h4>
                <button 
                  className="btn-danger"
                  onClick={() => deleteLockoutPoint(point.id)}
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>

              {/* Type d'énergie */}
              <div className="form-field">
                <label className="field-label">
                  Type d'Énergie
                  <span className="required-indicator">*</span>
                </label>
                <div className="energy-type-selector">
                  {Object.entries(ENERGY_TYPES).map(([key, type]) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={key}
                        className={`energy-type-option ${point.energyType === key ? 'selected' : ''}`}
                        onClick={() => updateLockoutPoint(point.id, 'energyType', key)}
                        style={{ 
                          borderColor: point.energyType === key ? type.color : undefined,
                          backgroundColor: point.energyType === key ? `${type.color}20` : undefined 
                        }}
                      >
                        <IconComponent size={20} color={type.color} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#e2e8f0' }}>
                          {type.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Procédures recommandées */}
                {point.energyType && ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES] && (
                  <div className="procedures-list">
                    <h4>🔧 Procédures à Suivre:</h4>
                    <ul className="procedures-checklist">
                      {ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES].procedures.map((procedure, idx) => {
                        const isCompleted = (point.completedProcedures || []).includes(idx);
                        return (
                          <li 
                            key={idx} 
                            className={`procedure-item ${isCompleted ? 'completed' : ''}`}
                            onClick={() => toggleProcedureComplete(point.id, idx)}
                          >
                            <div className={`procedure-checkbox ${isCompleted ? 'checked' : ''}`}>
                              {isCompleted && <Check size={12} />}
                            </div>
                            <span className="procedure-text">
                              {procedure}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    
                    {/* Barre de progression */}
                    <div className="procedures-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProcedureProgress(point).percentage}%` }}
                        />
                      </div>
                      <div className="progress-text">
                        {getProcedureProgress(point).completed} / {getProcedureProgress(point).total} étapes complétées 
                        ({getProcedureProgress(point).percentage}%)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Détails du point */}
              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    <Settings style={{ width: '18px', height: '18px' }} />
                    Nom de l'Équipement
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Ex: Disjoncteur principal"
                    value={point.equipmentName}
                    onChange={(e) => updateLockoutPoint(point.id, 'equipmentName', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <MapPin style={{ width: '18px', height: '18px' }} />
                    Localisation
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Ex: Panneau électrique B-2"
                    value={point.location}
                    onChange={(e) => updateLockoutPoint(point.id, 'location', e.target.value)}
                  />
                </div>
              </div>

              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    <Lock style={{ width: '18px', height: '18px' }} />
                    Type de Cadenas/Dispositif
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Ex: Cadenas rouge C-Secur360"
                    value={point.lockType}
                    onChange={(e) => updateLockoutPoint(point.id, 'lockType', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    Numéro d'Étiquette
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="TAG-123456"
                    value={point.tagNumber}
                    onChange={(e) => updateLockoutPoint(point.id, 'tagNumber', e.target.value)}
                  />
                </div>
              </div>

              {/* Status et vérification */}
              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    <User style={{ width: '18px', height: '18px' }} />
                    Vérifié par
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Nom de la personne"
                    value={point.verifiedBy}
                    onChange={(e) => updateLockoutPoint(point.id, 'verifiedBy', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <Clock style={{ width: '18px', height: '18px' }} />
                    Heure de Vérification
                  </label>
                  <input
                    type="time"
                    className="premium-input"
                    value={point.verificationTime}
                    onChange={(e) => updateLockoutPoint(point.id, 'verificationTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-field">
                <label className="field-label">
                  <FileText style={{ width: '18px', height: '18px' }} />
                  Notes et Observations
                </label>
                <textarea
                  className="premium-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Observations particulières, difficultés rencontrées, modifications apportées..."
                  value={point.notes}
                  onChange={(e) => updateLockoutPoint(point.id, 'notes', e.target.value)}
                />
              </div>

              {/* Photos spécifiques à ce point */}
              <div className="form-field">
                <label className="field-label">
                  <Camera style={{ width: '18px', height: '18px' }} />
                  Photos de ce Point de Verrouillage
                </label>
                
                {lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId === point.id).length > 0 ? (
                  <PhotoCarousel 
                    photos={lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId === point.id)}
                    onAddPhoto={() => handlePhotoCapture('lockout_device', point.id)}
                    lockoutPointId={point.id}
                  />
                ) : (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px dashed rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handlePhotoCapture('during_lockout', point.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                  >
                    <Lock size={32} color="#f87171" style={{ marginBottom: '12px' }} />
                    <h4 style={{ margin: '0 0 8px', color: '#f87171' }}>Aucune photo</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                      Documentez ce point de verrouillage avec une photo
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Message si aucun point */}
          {lockoutPoints.length === 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              color: '#60a5fa'
            }}>
              <Lock size={32} style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#60a5fa' }}>Aucun Point de Verrouillage</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Cliquez sur "Ajouter Point de Verrouillage" pour documenter les procédures LOTO
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
