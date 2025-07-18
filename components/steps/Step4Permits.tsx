// =================== STEP4PERMITS.TSX - SECTION 1/4 ===================
// Remplacez TOUT le contenu de votre fichier Step4Permits.tsx par cette SECTION 1
// Puis ajoutez les SECTIONS 2, 3, 4 à la suite

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer, ChevronLeft,
  ChevronRight, Upload, Trash2, UserPlus, UserCheck, Grid, List
} from 'lucide-react';

// =================== INTERFACES PRINCIPALES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

interface PhotoCarouselEntry {
  id: string;
  url: string;
  name: string;
  timestamp: string;
  description: string;
  provinceCompliance: {
    [key: string]: boolean;
  };
  required: boolean;
  gpsLocation?: string;
  inspectorApproval?: boolean;
  safetyCompliant?: boolean;
}

interface WorkerEntryQuick {
  id: string;
  name: string;
  age: number;
  certification: string;
  entryTime: string;
  exitTime?: string;
  provinceVerified: boolean;
  supervisorApproval: boolean;
  gasLevelAtEntry?: number;
  isActive: boolean;
}

interface SupervisorQuick {
  id: string;
  name: string;
  certification: string;
  province: string;
  contactInfo: string;
  authorizations: string[];
  isActive: boolean;
}

interface Permit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData?: any;
}

interface ConfinedSpaceDatabase {
  id: string;
  company: string;
  equipmentNumber: string;
  spaceNumber: string;
  spaceName: string;
  location: string;
  description: string;
  hazards: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    volume: number;
  };
  accessPoints: Array<{
    type: string;
    size: string;
    location: string;
  }>;
  lastInspection: string;
  nextInspection: string;
  permits: string[];
  photos: string[];
  workers: string[];
  supervisors: string[];
  province: string;
  status: 'active' | 'inactive' | 'maintenance';
  compliance: { [province: string]: boolean };
  createdAt: string;
  updatedAt: string;
  tenant: string;
}

// =================== CONFIGURATION PROVINCES ===================
const PROVINCIAL_REQUIREMENTS = {
  QC: {
    name: 'Québec - CNESST',
    mandatory: ['avant_travaux', 'pendant_surveillance', 'apres_completion', 'equipements_securite'],
    optional: ['documentation_supplementaire', 'formation_equipe'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Inspecteur CNESST',
    ageMinimum: 18
  },
  ON: {
    name: 'Ontario - OHSA',
    mandatory: ['site_preparation', 'safety_measures', 'equipment_verification'],
    optional: ['additional_safety', 'training_verification'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'OHSA Inspector',
    ageMinimum: 18
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    mandatory: ['worksite_setup', 'environmental_measures', 'fall_protection'],
    optional: ['environmental_additional'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'WorkSafeBC Officer',
    ageMinimum: 19
  },
  AB: {
    name: 'Alberta - OHS',
    mandatory: ['oil_gas_safety', 'industrial_compliance', 'confined_space_setup'],
    optional: ['additional_industrial'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Alberta OHS Inspector',
    ageMinimum: 18
  }
};

// =================== DONNÉES PERMIS ===================
const getProvincialPermits = (language: 'fr' | 'en', province: string = 'QC'): Permit[] => {
  return [
    {
      id: 'confined-space-entry',
      name: language === 'fr' ? 
        `Permis Entrée Espace Clos - ${province}` : 
        `Confined Space Entry Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis conforme aux normes ${province} avec surveillance atmosphérique continue` : 
        `${province} compliant permit with continuous atmospheric monitoring`,
      authority: `Autorité ${province}`,
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {}
    },
    {
      id: 'hot-work-permit',
      name: language === 'fr' ? 
        `Permis Travail à Chaud - ${province}` : 
        `Hot Work Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis travaux à chaud avec surveillance incendie selon ${province}` : 
        `Hot work permit with fire watch per ${province} standards`,
      authority: `Autorité ${province}`,
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {}
    },
    {
      id: 'excavation-permit',
      name: language === 'fr' ? 
        `Permis Excavation - ${province}` : 
        `Excavation Permit - ${province}`,
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 
        `Permis excavation municipal conforme aux normes ${province}` : 
        `Municipal excavation permit compliant with ${province} standards`,
      authority: `Municipal ${province}`,
      province: [province],
      priority: 'high',
      selected: false,
      formData: {}
    }
  ];
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Conformes 2025',
      subtitle: 'Formulaires authentiques conformes aux dernières normes provinciales',
      searchPlaceholder: 'Rechercher un permis...',
      allCategories: 'Toutes catégories',
      categories: {
        'Sécurité': 'Sécurité',
        'Construction': 'Construction',
        'Safety': 'Sécurité'
      },
      stats: {
        available: 'Disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        compliant: 'Conformes'
      },
      actions: {
        fill: 'Remplir',
        close: 'Fermer',
        download: 'PDF'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
        nextStep: 'Prochaine étape: Validation et soumission'
      },
      worker: {
        title: 'Gestion Rapide des Travailleurs',
        addWorker: 'Ajouter Travailleur',
        name: 'Nom complet',
        age: 'Âge',
        certification: 'Certification SST',
        entryTime: 'Heure d\'entrée',
        exitSite: 'Sortir du site',
        enterSite: 'Entrer sur site',
        ageWarning: 'ATTENTION: Âge minimum requis selon province',
        save: 'Sauvegarder',
        cancel: 'Annuler',
        noWorkers: 'Aucun travailleur enregistré'
      },
      supervisor: {
        title: 'Superviseurs et Responsables',
        addSupervisor: 'Ajouter Superviseur',
        name: 'Nom du superviseur',
        certification: 'Certification principale',
        contact: 'Contact (tél/email)',
        save: 'Sauvegarder',
        cancel: 'Annuler',
        noSupervisors: 'Aucun superviseur assigné'
      },
      photo: {
        addPhotos: 'Ajouter Photos Conformes',
        dragDrop: 'Glissez vos photos ou cliquez',
        compliant: 'Conforme',
        nonCompliant: 'Non conforme'
      }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2025',
      subtitle: 'Authentic forms compliant with latest provincial standards',
      searchPlaceholder: 'Search permits...',
      allCategories: 'All categories',
      categories: {
        'Sécurité': 'Safety',
        'Construction': 'Construction',
        'Safety': 'Safety'
      },
      stats: {
        available: 'Available',
        selected: 'Selected',
        critical: 'Critical',
        compliant: 'Compliant'
      },
      actions: {
        fill: 'Fill',
        close: 'Close',
        download: 'PDF'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        nextStep: 'Next step: Validation and submission'
      },
      worker: {
        title: 'Quick Worker Management',
        addWorker: 'Add Worker',
        name: 'Full name',
        age: 'Age',
        certification: 'HSE Certification',
        entryTime: 'Entry time',
        exitSite: 'Exit site',
        enterSite: 'Enter site',
        ageWarning: 'WARNING: Minimum age required by province',
        save: 'Save',
        cancel: 'Cancel',
        noWorkers: 'No workers registered'
      },
      supervisor: {
        title: 'Supervisors and Managers',
        addSupervisor: 'Add Supervisor',
        name: 'Supervisor name',
        certification: 'Primary certification',
        contact: 'Contact (phone/email)',
        save: 'Save',
        cancel: 'Cancel',
        noSupervisors: 'No supervisors assigned'
      },
      photo: {
        addPhotos: 'Add Compliant Photos',
        dragDrop: 'Drag photos or click',
        compliant: 'Compliant',
        nonCompliant: 'Non-compliant'
      }
    };
  }
};

// CONTINUEZ AVEC LA SECTION 2...
// =================== SECTION 2/4 - COMPOSANTS PHOTOS + WORKERS ===================
// Ajoutez cette section À LA SUITE de la SECTION 1 (ne remplacez pas, ajoutez !)

// =================== COMPOSANT CARROUSEL PHOTOS ===================
const AdvancedPhotoCarousel: React.FC<{
  permitId: string;
  province: string;
  photos: PhotoCarouselEntry[];
  onPhotosChange: (photos: PhotoCarouselEntry[]) => void;
  language: 'fr' | 'en';
}> = ({ permitId, province, photos, onPhotosChange, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const provinceConfig = PROVINCIAL_REQUIREMENTS[province as keyof typeof PROVINCIAL_REQUIREMENTS] || PROVINCIAL_REQUIREMENTS.QC;
  const t = getTexts(language);

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoCarouselEntry = {
          id: `${permitId}_${Date.now()}_${index}`,
          url: e.target?.result as string,
          name: file.name,
          timestamp: new Date().toISOString(),
          description: '',
          provinceCompliance: { [province]: true },
          required: index < provinceConfig.mandatory.length,
          gpsLocation: '',
          inspectorApproval: false,
          safetyCompliant: true
        };
        
        const updatedPhotos = [...photos, newPhoto];
        onPhotosChange(updatedPhotos);
      };
      reader.readAsDataURL(file);
    });
    setUploadMode(false);
  };

  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    onPhotosChange(updatedPhotos);
    if (currentIndex >= updatedPhotos.length) {
      setCurrentIndex(Math.max(0, updatedPhotos.length - 1));
    }
  };

  if (photos.length === 0 && !uploadMode) {
    return (
      <div style={{
        border: '2px dashed rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.02))',
        cursor: 'pointer'
      }} onClick={() => setUploadMode(true)}>
        <Camera size={48} style={{ color: '#60a5fa', marginBottom: '16px' }} />
        <h3 style={{ color: '#ffffff', margin: '0 0 8px' }}>📸 {t.photo.addPhotos}</h3>
        <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: '14px' }}>{t.photo.dragDrop}</p>
        
        <div style={{ marginTop: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.2))',
            color: '#fbbf24',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            🍁 {provinceConfig.name}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
            <span>📋 Obligatoires: {provinceConfig.mandatory.length}</span>
            <span>📄 Optionnelles: {provinceConfig.optional.length}</span>
            <span>📐 Résolution: {provinceConfig.resolution}</span>
            <span>📍 {provinceConfig.geotagRequired ? 'GPS requis' : 'GPS optionnel'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (uploadMode) {
    return (
      <div style={{
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Upload size={40} style={{ color: '#60a5fa', marginBottom: '12px' }} />
          <h3 style={{ color: '#ffffff', margin: '0 0 8px' }}>Ajouter Photos - {provinceConfig.name}</h3>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Camera size={16} />
            Sélectionner fichiers
          </button>
          <button
            onClick={() => setUploadMode(false)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
              color: '#cbd5e1',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '12px', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '16px' }}>
            📸 Photos Conformes ({photos.length})
          </h4>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            🍁 {provinceConfig.name}
          </div>
        </div>
        <button
          onClick={() => setUploadMode(true)}
          style={{
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      {/* Image principale */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          height: '300px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'rgba(30, 41, 59, 0.6)'
        }}>
          <img
            src={currentPhoto?.url}
            alt={currentPhoto?.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'zoom-in'
            }}
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: currentIndex === 0 ? 0.3 : 1
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
                disabled={currentIndex === photos.length - 1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: currentIndex === photos.length - 1 ? 0.3 : 1
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
          {/* Actions photo */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '6px'
          }}>
            <button
              onClick={() => deletePhoto(currentPhoto.id)}
              style={{
                background: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: '60px',
                height: '45px',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal plein écran */}
      {isFullscreen && currentPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
          <img
            src={currentPhoto.url}
            alt={currentPhoto.name}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT GESTION WORKERS ===================
const EasyWorkerManager: React.FC<{
  permitId: string;
  province: string;
  workers: WorkerEntryQuick[];
  onWorkersChange: (workers: WorkerEntryQuick[]) => void;
  language: 'fr' | 'en';
}> = ({ permitId, province, workers, onWorkersChange, language }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    age: '',
    certification: '',
    entryTime: ''
  });

  const t = getTexts(language);
  const provinceConfig = PROVINCIAL_REQUIREMENTS[province as keyof typeof PROVINCIAL_REQUIREMENTS] || PROVINCIAL_REQUIREMENTS.QC;

  const handleAddWorker = () => {
    const age = parseInt(newWorker.age);
    if (age < provinceConfig.ageMinimum) {
      alert(`${t.worker.ageWarning} (${provinceConfig.ageMinimum} ans pour ${province})`);
      return;
    }

    const worker: WorkerEntryQuick = {
      id: `${permitId}_worker_${Date.now()}`,
      name: newWorker.name,
      age: age,
      certification: newWorker.certification,
      entryTime: newWorker.entryTime || new Date().toLocaleTimeString(),
      provinceVerified: true,
      supervisorApproval: false,
      isActive: true
    };

    onWorkersChange([...workers, worker]);
    setNewWorker({ name: '', age: '', certification: '', entryTime: '' });
    setShowAddForm(false);
  };

  const toggleWorkerStatus = (workerId: string) => {
    const updatedWorkers = workers.map(worker => {
      if (worker.id === workerId) {
        return {
          ...worker,
          isActive: !worker.isActive,
          exitTime: worker.isActive ? new Date().toLocaleTimeString() : undefined
        };
      }
      return worker;
    });
    onWorkersChange(updatedWorkers);
  };

  const removeWorker = (workerId: string) => {
    const updatedWorkers = workers.filter(w => w.id !== workerId);
    onWorkersChange(updatedWorkers);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 {t.worker.title}
          </h4>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {workers.length} travailleurs • {workers.filter(w => w.isActive).length} actifs • Min: {provinceConfig.ageMinimum} ans ({province})
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <UserPlus size={16} />
          {t.worker.addWorker}
        </button>
      </div>

      {/* Formulaire ajout */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h5 style={{ color: '#22c55e', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            ⚡ Ajout Rapide
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder={t.worker.name}
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <input
              type="number"
              placeholder={`${t.worker.age} (min: ${provinceConfig.ageMinimum})`}
              value={newWorker.age}
              onChange={(e) => setNewWorker({ ...newWorker, age: e.target.value })}
              min={provinceConfig.ageMinimum}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: parseInt(newWorker.age) < provinceConfig.ageMinimum && newWorker.age ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder={t.worker.certification}
              value={newWorker.certification}
              onChange={(e) => setNewWorker({ ...newWorker, certification: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <input
              type="time"
              value={newWorker.entryTime}
              onChange={(e) => setNewWorker({ ...newWorker, entryTime: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
          </div>

          {parseInt(newWorker.age) < provinceConfig.ageMinimum && newWorker.age && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))',
              color: '#fee2e2',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={14} />
              {t.worker.ageWarning} ({provinceConfig.ageMinimum} ans minimum pour {province})
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddWorker}
              disabled={!newWorker.name || !newWorker.age || parseInt(newWorker.age) < provinceConfig.ageMinimum || !newWorker.certification}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                opacity: (!newWorker.name || !newWorker.age || parseInt(newWorker.age) < provinceConfig.ageMinimum || !newWorker.certification) ? 0.5 : 1
              }}
            >
              {t.worker.save}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '8px 16px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {t.worker.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Liste des travailleurs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {workers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <Users size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>{t.worker.noWorkers}</p>
          </div>
        ) : (
          workers.map((worker) => (
            <div
              key={worker.id}
              style={{
                background: worker.isActive ? 
                  'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))' :
                  'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                border: worker.isActive ? 
                  '1px solid rgba(34, 197, 94, 0.3)' :
                  '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>
                    {worker.name}
                  </span>
                  <span style={{
                    background: worker.age >= provinceConfig.ageMinimum ? '#22c55e' : '#ef4444',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    {worker.age} ans
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                    {province} (min: {provinceConfig.ageMinimum})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                  <span>📋 {worker.certification}</span>
                  <span>🕐 Entrée: {worker.entryTime}</span>
                  {worker.exitTime && <span>🕐 Sortie: {worker.exitTime}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleWorkerStatus(worker.id)}
                  style={{
                    padding: '6px 12px',
                    background: worker.isActive ?
                      'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))' :
                      'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: worker.isActive ? '#fca5a5' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  {worker.isActive ? t.worker.exitSite : t.worker.enterSite}
                </button>
                <button
                  onClick={() => removeWorker(worker.id)}
                  style={{
                    padding: '6px',
                    background: 'rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// CONTINUEZ AVEC LA SECTION 3...
// =================== SECTION 3/4 - SUPERVISORS + BASE DE DONNÉES ===================
// Ajoutez cette section À LA SUITE des SECTIONS 1 et 2 (ne remplacez pas, ajoutez !)

// =================== COMPOSANT GESTION SUPERVISORS ===================
const EasySupervisorManager: React.FC<{
  permitId: string;
  province: string;
  supervisors: SupervisorQuick[];
  onSupervisorsChange: (supervisors: SupervisorQuick[]) => void;
  language: 'fr' | 'en';
}> = ({ permitId, province, supervisors, onSupervisorsChange, language }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    certification: '',
    contactInfo: '',
    authorizations: [] as string[]
  });

  const provincialCertifications = {
    QC: ['CNESST Superviseur', 'ASP Construction', 'Formation Espace Clos'],
    ON: ['OHSA Supervisor', 'MOL Certified', 'Confined Space Supervisor'],
    BC: ['WorkSafeBC Supervisor', 'OHS Certified', 'Safety Supervisor'],
    AB: ['Alberta OHS Supervisor', 'Energy Safety', 'Industrial Supervisor']
  };

  const t = getTexts(language);
  const availableCerts = provincialCertifications[province as keyof typeof provincialCertifications] || provincialCertifications.QC;

  const handleAddSupervisor = () => {
    const supervisor: SupervisorQuick = {
      id: `${permitId}_supervisor_${Date.now()}`,
      name: newSupervisor.name,
      certification: newSupervisor.certification,
      province: province,
      contactInfo: newSupervisor.contactInfo,
      authorizations: newSupervisor.authorizations,
      isActive: true
    };

    onSupervisorsChange([...supervisors, supervisor]);
    setNewSupervisor({ name: '', certification: '', contactInfo: '', authorizations: [] });
    setShowAddForm(false);
  };

  const toggleSupervisorStatus = (supervisorId: string) => {
    const updatedSupervisors = supervisors.map(supervisor =>
      supervisor.id === supervisorId ? { ...supervisor, isActive: !supervisor.isActive } : supervisor
    );
    onSupervisorsChange(updatedSupervisors);
  };

  const removeSupervisor = (supervisorId: string) => {
    const updatedSupervisors = supervisors.filter(s => s.id !== supervisorId);
    onSupervisorsChange(updatedSupervisors);
  };

  const toggleAuthorization = (auth: string) => {
    const newAuths = newSupervisor.authorizations.includes(auth)
      ? newSupervisor.authorizations.filter(a => a !== auth)
      : [...newSupervisor.authorizations, auth];
    setNewSupervisor({ ...newSupervisor, authorizations: newAuths });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h4 style={{ color: '#ffffff', margin: '0 0 4px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛡️ {t.supervisor.title}
          </h4>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {supervisors.length} superviseurs • {supervisors.filter(s => s.isActive).length} actifs • {province}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <Shield size={16} />
          {t.supervisor.addSupervisor}
        </button>
      </div>

      {/* Formulaire ajout */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h5 style={{ color: '#3b82f6', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            ⚡ Ajout Rapide Superviseur
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder={t.supervisor.name}
              value={newSupervisor.name}
              onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <select
              value={newSupervisor.certification}
              onChange={(e) => setNewSupervisor({ ...newSupervisor, certification: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="">Sélectionner certification...</option>
              {availableCerts.map(cert => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t.supervisor.contact}
              value={newSupervisor.contactInfo}
              onChange={(e) => setNewSupervisor({ ...newSupervisor, contactInfo: e.target.value })}
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Autorisations */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Autorisations:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Espace Clos', 'Travail à Chaud', 'Excavation', 'Hauteur', 'Équipements'].map(auth => (
                <button
                  key={auth}
                  onClick={() => toggleAuthorization(auth)}
                  style={{
                    padding: '4px 8px',
                    background: newSupervisor.authorizations.includes(auth) ?
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                      'rgba(100, 116, 139, 0.3)',
                    color: newSupervisor.authorizations.includes(auth) ? 'white' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  {auth}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddSupervisor}
              disabled={!newSupervisor.name || !newSupervisor.certification || !newSupervisor.contactInfo}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                opacity: (!newSupervisor.name || !newSupervisor.certification || !newSupervisor.contactInfo) ? 0.5 : 1
              }}
            >
              {t.supervisor.save}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '8px 16px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {t.supervisor.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Liste des superviseurs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {supervisors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <Shield size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>{t.supervisor.noSupervisors}</p>
          </div>
        ) : (
          supervisors.map((supervisor) => (
            <div
              key={supervisor.id}
              style={{
                background: supervisor.isActive ? 
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))' :
                  'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                border: supervisor.isActive ? 
                  '1px solid rgba(59, 130, 246, 0.3)' :
                  '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>
                    {supervisor.name}
                  </span>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    {supervisor.certification}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                    🍁 {supervisor.province}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>📞 {supervisor.contactInfo}</span>
                </div>
                {supervisor.authorizations.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {supervisor.authorizations.map(auth => (
                      <span
                        key={auth}
                        style={{
                          background: 'rgba(59, 130, 246, 0.3)',
                          color: '#93c5fd',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '9px'
                        }}
                      >
                        {auth}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleSupervisorStatus(supervisor.id)}
                  style={{
                    padding: '6px 12px',
                    background: supervisor.isActive ?
                      'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))' :
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: supervisor.isActive ? '#fca5a5' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  {supervisor.isActive ? 'Inactif' : 'Actif'}
                </button>
                <button
                  onClick={() => removeSupervisor(supervisor.id)}
                  style={{
                    padding: '6px',
                    background: 'rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =================== COMPOSANT BASE DONNÉES SUPABASE ===================
const ConfinedSpaceManager: React.FC<{
  tenant: string;
  onSpaceSelected: (space: ConfinedSpaceDatabase) => void;
  language: 'fr' | 'en';
}> = ({ tenant, onSpaceSelected, language }) => {
  const [spaces, setSpaces] = useState<ConfinedSpaceDatabase[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newSpace, setNewSpace] = useState({
    company: '',
    equipmentNumber: '',
    spaceNumber: '',
    spaceName: '',
    location: '',
    description: '',
    length: '',
    width: '',
    height: ''
  });

  const texts = {
    fr: {
      title: 'Base de Données Espaces Clos (Supabase)',
      addSpace: 'Ajouter Espace Clos',
      company: 'Compagnie',
      equipmentNumber: 'N° Équipement',
      spaceNumber: 'N° Espace Clos',
      spaceName: 'Nom de l\'espace',
      location: 'Localisation',
      description: 'Description',
      save: 'Sauvegarder vers Supabase',
      cancel: 'Annuler',
      selectSpace: 'Sélectionner cet espace',
      saving: 'Sauvegarde en cours...',
      success: 'Espace ajouté avec succès dans Supabase'
    },
    en: {
      title: 'Confined Spaces Database (Supabase)',
      addSpace: 'Add Confined Space',
      company: 'Company',
      equipmentNumber: 'Equipment #',
      spaceNumber: 'Confined Space #',
      spaceName: 'Space name',
      location: 'Location',
      description: 'Description',
      save: 'Save to Supabase',
      cancel: 'Cancel',
      selectSpace: 'Select this space',
      saving: 'Saving...',
      success: 'Space successfully added to Supabase'
    }
  };

  const t = texts[language];

  const saveToSupabase = async (spaceData: any): Promise<ConfinedSpaceDatabase> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation réseau
    
    const newSpace: ConfinedSpaceDatabase = {
      id: `cs_${Date.now()}`,
      company: spaceData.company,
      equipmentNumber: spaceData.equipmentNumber,
      spaceNumber: spaceData.spaceNumber,
      spaceName: spaceData.spaceName,
      location: spaceData.location,
      description: spaceData.description,
      hazards: ['Oxygène déficient', 'Gaz toxiques'],
      dimensions: {
        length: parseFloat(spaceData.length) || 0,
        width: parseFloat(spaceData.width) || 0,
        height: parseFloat(spaceData.height) || 0,
        volume: (parseFloat(spaceData.length) || 0) * (parseFloat(spaceData.width) || 0) * (parseFloat(spaceData.height) || 0)
      },
      accessPoints: [{ type: 'Ouverture', size: '600mm', location: 'Dessus' }],
      lastInspection: new Date().toISOString(),
      nextInspection: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      permits: [], photos: [], workers: [], supervisors: [],
      province: 'QC', status: 'active',
      compliance: { QC: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenant: tenant
    };
    
    setLoading(false);
    return newSpace;
  };

  const handleAddSpace = async () => {
    try {
      const savedSpace = await saveToSupabase(newSpace);
      setSpaces(prev => [savedSpace, ...prev]);
      setNewSpace({ company: '', equipmentNumber: '', spaceNumber: '', spaceName: '', location: '', description: '', length: '', width: '', height: '' });
      setShowAddForm(false);
      alert(t.success);
    } catch (error) {
      console.error('Erreur Supabase:', error);
    }
  };

  useEffect(() => {
    const mockSpaces: ConfinedSpaceDatabase[] = [
      {
        id: 'cs_demo_1',
        company: 'Hydro-Québec',
        equipmentNumber: 'HQ-2024-001',
        spaceNumber: 'EC-001',
        spaceName: 'Réservoir principal A',
        location: 'Centrale Beauharnois',
        description: 'Réservoir de stockage principal',
        hazards: ['Noyade', 'Oxygène déficient'],
        dimensions: { length: 12.5, width: 8.0, height: 4.2, volume: 420 },
        accessPoints: [{ type: 'Trappe', size: '600mm', location: 'Dessus' }],
        lastInspection: '2024-12-15',
        nextInspection: '2025-12-15',
        permits: [], photos: [], workers: [], supervisors: [],
        province: 'QC', status: 'active',
        compliance: { QC: true },
        createdAt: '2024-01-15', updatedAt: '2024-12-15',
        tenant: tenant
      },
      {
        id: 'cs_demo_2',
        company: 'CN Rail',
        equipmentNumber: 'CN-2024-002',
        spaceNumber: 'EC-002',
        spaceName: 'Wagon-citerne B',
        location: 'Yard Montréal',
        description: 'Wagon-citerne pour transport chimique',
        hazards: ['Vapeurs toxiques', 'Espace confiné'],
        dimensions: { length: 15.0, width: 3.5, height: 4.0, volume: 210 },
        accessPoints: [{ type: 'Trappe', size: '500mm', location: 'Dessus' }],
        lastInspection: '2024-11-20',
        nextInspection: '2025-11-20',
        permits: [], photos: [], workers: [], supervisors: [],
        province: 'QC', status: 'active',
        compliance: { QC: true },
        createdAt: '2024-02-10', updatedAt: '2024-11-20',
        tenant: tenant
      }
    ];
    setSpaces(mockSpaces);
  }, [tenant]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ color: '#ffffff', margin: '0 0 8px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🗄️ {t.title}
          </h3>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            {spaces.length} espaces • Tenant: {tenant} • Sync Supabase
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Plus size={16} />
          {t.addSpace}
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ color: '#6366f1', margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>
            ➕ {t.addSpace}
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {(['company', 'equipmentNumber', 'spaceNumber', 'spaceName', 'location'] as const).map(field => (
              <input
                key={field}
                type="text"
                placeholder={t[field] as string}
                value={newSpace[field]}
                onChange={(e) => setNewSpace({ ...newSpace, [field]: e.target.value })}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            ))}
            <textarea
              placeholder={t.description}
              value={newSpace.description}
              onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                minHeight: '80px',
                gridColumn: 'span 2'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddSpace}
              disabled={loading || !newSpace.company || !newSpace.equipmentNumber}
              style={{
                padding: '10px 16px',
                background: loading ? 'rgba(100, 116, 139, 0.3)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                opacity: (!newSpace.company || !newSpace.equipmentNumber) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? '⏳' : '💾'} {loading ? t.saving : t.save}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '10px 16px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {spaces.map(space => (
          <div
            key={space.id}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onSpaceSelected(space)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#ffffff', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                  {space.spaceName}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  <span>🏢 {space.company}</span>
                  <span>🔧 {space.equipmentNumber}</span>
                  <span>🏷️ {space.spaceNumber}</span>
                  <span>📍 {space.location}</span>
                  <span>📐 {space.dimensions.volume.toFixed(1)} m³</span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '0', lineHeight: '1.4' }}>
                  {space.description}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpaceSelected(space);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle size={12} />
                {t.selectSpace}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// =================== SECTION 4/4 FINALE CORRIGÉE - COMPOSANT PRINCIPAL + EXPORT ===================
// Remplacez ENTIÈREMENT votre SECTION 4 par cette version sans duplication

// =================== INTERFACE ARCHIVE ===================
interface ArchivedPermit extends Permit {
  archivedDate: string;
  completedBy: string;
  status: 'completed' | 'expired' | 'cancelled';
}

// =================== COMPOSANT PRINCIPAL STEP4PERMITS ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ 
  formData, 
  onDataChange, 
  language = 'fr', 
  tenant, 
  errors 
}) => {
  const t = getTexts(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [selectedConfinedSpace, setSelectedConfinedSpace] = useState<ConfinedSpaceDatabase | null>(null);
  const [showArchives, setShowArchives] = useState(false);
  
  const [permitPhotos, setPermitPhotos] = useState<{ [permitId: string]: PhotoCarouselEntry[] }>({});
  const [permitWorkers, setPermitWorkers] = useState<{ [permitId: string]: WorkerEntryQuick[] }>({});
  const [permitSupervisors, setPermitSupervisors] = useState<{ [permitId: string]: SupervisorQuick[] }>({});
  const [archivedPermits, setArchivedPermits] = useState<ArchivedPermit[]>([]);
  
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return getProvincialPermits(language, selectedProvince);
  });

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Sécurité': 
      case 'Safety': 
        return '🛡️';
      case 'Construction': 
        return '🏗️';
      default: 
        return '📋';
    }
  };

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map((permit: Permit) => 
      permit.id === permitId ? { ...permit, selected: !permit.selected } : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
    const selectedList = updatedPermits.filter((p: Permit) => p.selected);
    onDataChange('permits', {
      list: updatedPermits,
      selected: selectedList,
      province: selectedProvince,
      selectedConfinedSpace: selectedConfinedSpace,
      photos: permitPhotos,
      workers: permitWorkers,
      supervisors: permitSupervisors,
      archived: archivedPermits,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter((p: Permit) => p.priority === 'critical').length
      }
    });
  };

  // CORRECTION: Fonction pour ouvrir/fermer les formulaires
  const handleFormToggle = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêche la propagation vers la carte parent
    setExpandedForms(prev => ({ ...prev, [permitId]: !prev[permitId] }));
  };

  const handleConfinedSpaceSelected = (space: ConfinedSpaceDatabase) => {
    setSelectedConfinedSpace(space);
    
    // Pré-remplir les permis avec les infos de l'espace
    const updatedPermits = permits.map((permit: Permit) => {
      if (permit.id.includes('confined-space') && permit.selected) {
        return {
          ...permit,
          formData: {
            ...permit.formData,
            company: space.company,
            equipment_number: space.equipmentNumber,
            space_number: space.spaceNumber,
            location: space.location,
            description: space.description
          }
        };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  // NOUVELLE FONCTION: Archiver un permis
  const archivePermit = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: Permit) => p.id === permitId);
    if (permit && permit.selected) {
      const archivedPermit: ArchivedPermit = {
        ...permit,
        archivedDate: new Date().toISOString(),
        completedBy: 'Utilisateur actuel', // À remplacer par l'utilisateur connecté
        status: 'completed'
      };
      
      setArchivedPermits(prev => [archivedPermit, ...prev]);
      
      // Désélectionner le permis
      const updatedPermits = permits.map(p => 
        p.id === permitId ? { ...p, selected: false } : p
      );
      setPermits(updatedPermits);
      updateFormData(updatedPermits);
      
      // Fermer le formulaire
      setExpandedForms(prev => ({ ...prev, [permitId]: false }));
      
      alert(language === 'fr' ? 
        '✅ Permis archivé avec succès!' : 
        '✅ Permit archived successfully!'
      );
    }
  };

  // =================== FILTRAGE AVEC TYPES CORRECTS ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  // CORRECTION TYPESCRIPT : Typage explicite des catégories
  const categories: string[] = useMemo(() => 
    Array.from(new Set(permits.map((p: Permit) => p.category))), 
    [permits]
  );
  
  const provinces: string[] = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  const selectedPermits = useMemo(() => permits.filter((p: Permit) => p.selected), [permits]);

  const stats = useMemo(() => ({
    totalPermits: permits.length,
    selected: selectedPermits.length,
    critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
    compliant: selectedPermits.length,
    archived: archivedPermits.length
  }), [permits, selectedPermits, archivedPermits]);

  // =================== EFFETS ===================
  useEffect(() => {
    // Mise à jour des permis quand la province change
    const newPermits = getProvincialPermits(language, selectedProvince);
    setPermits(newPermits);
  }, [selectedProvince, language]);

  // =================== INTERFACE DE RENDU ===================
  interface StatItem {
    key: string;
    value: string | number;
    icon: string;
  }

  const statsData: StatItem[] = [
    { key: 'available', value: stats.totalPermits, icon: '📊' },
    { key: 'selected', value: stats.selected, icon: '✅' },
    { key: 'critical', value: stats.critical, icon: '🚨' },
    { key: 'archived', value: stats.archived, icon: '📦' }
  ];

  // =================== RENDU ===================
  return (
    <div style={{ padding: '0', color: '#ffffff' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '28px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📋 {t.title}
            </h1>
            <p style={{ color: '#3b82f6', margin: '0', fontSize: '14px' }}>{t.subtitle}</p>
          </div>
          
          {/* Bouton Archives */}
          <button
            onClick={() => setShowArchives(!showArchives)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <FileText size={16} />
            {showArchives ? 
              (language === 'fr' ? 'Retour aux Permis' : 'Back to Permits') :
              (language === 'fr' ? `Archives (${stats.archived})` : `Archives (${stats.archived})`)
            }
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
          {statsData.map((stat: StatItem) => (
            <div key={stat.key} style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
              padding: '20px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #60a5fa, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                {stat.key === 'archived' ? 
                  (language === 'fr' ? 'Archivés' : 'Archived') :
                  (t.stats[stat.key as keyof typeof t.stats] || stat.key)
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vue Archives */}
      {showArchives ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
            📦 {language === 'fr' ? 'Permis Archivés' : 'Archived Permits'}
          </h2>
          
          {archivedPermits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
              <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>
                {language === 'fr' ? 'Aucun permis archivé' : 'No archived permits'}
              </h3>
              <p style={{ margin: 0 }}>
                {language === 'fr' ? 
                  'Les permis complétés apparaîtront ici' : 
                  'Completed permits will appear here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {archivedPermits.map((permit) => (
                <div
                  key={`archived-${permit.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                      {permit.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                      <span>📅 {new Date(permit.archivedDate).toLocaleDateString()}</span>
                      <span>👤 {permit.completedBy}</span>
                      <span style={{
                        color: permit.status === 'completed' ? '#22c55e' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        ● {permit.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    {language === 'fr' ? 'Voir Détails' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Base de données espaces clos */}
          <ConfinedSpaceManager
            tenant={tenant}
            onSpaceSelected={handleConfinedSpaceSelected}
            language={language}
          />

          {/* Espace sélectionné */}
          {selectedConfinedSpace && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ color: '#22c55e', margin: '0 0 8px', fontSize: '14px', fontWeight: '700' }}>
                ✅ Espace Clos Sélectionné
              </h4>
              <p style={{ color: '#dcfce7', margin: '0', fontSize: '13px' }}>
                {selectedConfinedSpace.company} - {selectedConfinedSpace.equipmentNumber} - {selectedConfinedSpace.spaceName}
              </p>
            </div>
          )}

          {/* Recherche */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  minWidth: '180px'
                }}
              >
                <option value="all">{t.allCategories}</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {(t.categories as any)[category] || category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  minWidth: '180px'
                }}
              >
                {provinces.map((province: string) => (
                  <option key={province} value={province}>🍁 {province}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cartes des permis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
            {filteredPermits.map((permit: Permit) => (
              <div
                key={permit.id}
                style={{
                  background: permit.selected ?
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))' :
                    'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
                  border: permit.selected ? '2px solid #3b82f6' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '20px',
                  padding: '24px',
                  transition: 'all 0.4s ease'
                }}
              >
                <div
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '16px', 
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePermitToggle(permit.id)}
                >
                  <div style={{ fontSize: '32px', width: '48px', textAlign: 'center' }}>
                    {getCategoryIcon(permit.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: '0 0 6px', lineHeight: '1.3' }}>
                      {permit.name}
                    </h3>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {(t.categories as any)[permit.category] || permit.category}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                      {permit.description}
                    </div>
                    <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '600' }}>
                      {permit.authority}
                    </div>
                  </div>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    border: '2px solid rgba(100, 116, 139, 0.5)',
                    borderRadius: '8px',
                    background: permit.selected ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(15, 23, 42, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    {permit.selected && <CheckCircle size={18} style={{ color: 'white' }} />}
                  </div>
                </div>

                {permit.selected && (
                  <div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <button
                        onClick={(e) => handleFormToggle(permit.id, e)}
                        style={{
                          padding: '12px 16px',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Edit size={14} />
                        {expandedForms[permit.id] ? t.actions.close : t.actions.fill}
                      </button>
                      
                      {expandedForms[permit.id] && (
                        <button
                          onClick={(e) => archivePermit(permit.id, e)}
                          style={{
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <FileText size={14} />
                          {language === 'fr' ? 'Archiver' : 'Archive'}
                        </button>
                      )}
                      
                      <button
                        style={{
                          padding: '12px 16px',
                          background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                          color: '#cbd5e1',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download size={14} />
                        {t.actions.download}
                      </button>
                    </div>

                    {expandedForms[permit.id] && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                        borderRadius: '12px',
                        padding: '20px',
                        marginTop: '16px'
                      }}>
                        <h4 style={{ color: '#3b82f6', margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>
                          📝 Formulaire Intégré - {permit.name}
                        </h4>

                        {/* Carrousel Photos */}
                        <div style={{ marginBottom: '20px' }}>
                          <AdvancedPhotoCarousel
                            permitId={permit.id}
                            province={selectedProvince}
                            photos={permitPhotos[permit.id] || []}
                            onPhotosChange={(photos) => setPermitPhotos(prev => ({ ...prev, [permit.id]: photos }))}
                            language={language}
                          />
                        </div>

                        {/* Workers Manager */}
                        <div style={{ marginBottom: '20px' }}>
                          <EasyWorkerManager
                            permitId={permit.id}
                            province={selectedProvince}
                            workers={permitWorkers[permit.id] || []}
                            onWorkersChange={(workers) => setPermitWorkers(prev => ({ ...prev, [permit.id]: workers }))}
                            language={language}
                          />
                        </div>

                        {/* Supervisors Manager */}
                        <div style={{ marginBottom: '20px' }}>
                          <EasySupervisorManager
                            permitId={permit.id}
                            province={selectedProvince}
                            supervisors={permitSupervisors[permit.id] || []}
                            onSupervisorsChange={(supervisors) => setPermitSupervisors(prev => ({ ...prev, [permit.id]: supervisors }))}
                            language={language}
                          />
                        </div>

                        {/* Status final */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <p style={{ color: '#22c55e', margin: '0', fontSize: '12px', fontWeight: '600' }}>
                            ✅ {t.messages.nextStep}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message aucun résultat */}
          {filteredPermits.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8',
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
              <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>{t.messages.noResults}</h3>
              <p style={{ margin: 0 }}>{t.messages.modifySearch}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
