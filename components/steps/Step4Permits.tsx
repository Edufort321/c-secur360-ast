// =================== SECTION 1: INTERFACES + CARROUSEL PHOTOS ===================
// À coller au début de votre fichier Step4Permits.tsx

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

// =================== INTERFACES PHOTOS CONFORMES PROVINCES CANADIENNES ===================
interface PhotoCarouselEntry {
  id: string;
  url: string;
  name: string;
  timestamp: string;
  description: string;
  provinceCompliance: {
    [key: string]: boolean; // QC, ON, BC, etc.
  };
  required: boolean;
  gpsLocation?: string;
  inspectorApproval?: boolean;
  safetyCompliant?: boolean;
}

interface ProvincialPhotoRequirements {
  [province: string]: {
    name: string;
    mandatory: string[];
    optional: string[];
    resolution: string;
    geotagRequired: boolean;
    inspector: string;
  };
}

// =================== INTERFACES WORKERS + SUPERVISORS ===================
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

// =================== CONFIGURATION PROVINCES CANADIENNES ===================
const PROVINCIAL_REQUIREMENTS: ProvincialPhotoRequirements = {
  QC: {
    name: 'Québec - CNESST',
    mandatory: ['avant_travaux', 'pendant_surveillance', 'apres_completion', 'equipements_securite', 'acces_espace_clos'],
    optional: ['documentation_supplementaire', 'formation_equipe'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Inspecteur CNESST'
  },
  ON: {
    name: 'Ontario - OHSA',
    mandatory: ['site_preparation', 'safety_measures', 'equipment_verification', 'hazard_identification'],
    optional: ['additional_safety', 'training_verification'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'OHSA Inspector'
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    mandatory: ['worksite_setup', 'environmental_measures', 'fall_protection', 'machinery_guards'],
    optional: ['environmental_additional'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'WorkSafeBC Officer'
  },
  AB: {
    name: 'Alberta - OHS',
    mandatory: ['oil_gas_safety', 'industrial_compliance', 'confined_space_setup', 'hazmat_handling'],
    optional: ['additional_industrial'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Alberta OHS Inspector'
  },
  SK: {
    name: 'Saskatchewan - OHS',
    mandatory: ['mining_safety', 'agricultural_compliance', 'workplace_hazards'],
    optional: ['additional_mining'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'SK OHS Officer'
  },
  MB: {
    name: 'Manitoba - WSH',
    mandatory: ['workplace_setup', 'hydro_safety', 'mining_measures'],
    optional: ['additional_measures'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'MB WSH Inspector'
  },
  NB: {
    name: 'Nouveau-Brunswick - WorkSafeNB',
    mandatory: ['forestry_safety', 'fishing_industry', 'general_workplace'],
    optional: ['additional_forestry'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'WorkSafeNB Officer'
  },
  NS: {
    name: 'Nouvelle-Écosse - Labour',
    mandatory: ['offshore_safety', 'mining_compliance', 'workplace_hazards'],
    optional: ['additional_offshore'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'NS Labour Inspector'
  },
  PE: {
    name: 'Île-du-Prince-Édouard - WCB',
    mandatory: ['agricultural_safety', 'tourism_compliance', 'general_workplace'],
    optional: ['additional_tourism'],
    resolution: '1280x720',
    geotagRequired: false,
    inspector: 'PEI WCB Officer'
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador - WorkplaceNL',
    mandatory: ['offshore_oil_gas', 'fishing_industry', 'workplace_measures'],
    optional: ['additional_offshore'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'WorkplaceNL Inspector'
  },
  YT: {
    name: 'Yukon - WSCC',
    mandatory: ['mining_safety', 'environmental_protection', 'arctic_conditions'],
    optional: ['additional_mining'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'Yukon WSCC Officer'
  },
  NT: {
    name: 'Territoires du Nord-Ouest - WSCC',
    mandatory: ['diamond_mining', 'arctic_documentation', 'environmental_protection'],
    optional: ['additional_arctic'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'NWT WSCC Inspector'
  },
  NU: {
    name: 'Nunavut - WSCC',
    mandatory: ['arctic_safety', 'traditional_practices', 'environmental_protection'],
    optional: ['additional_traditional'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'Nunavut WSCC Officer'
  }
};

// =================== COMPOSANT CARROUSEL PHOTOS PROVINCIAL ===================
const ProvincialPhotoCarousel: React.FC<{
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
  
  const provinceConfig = PROVINCIAL_REQUIREMENTS[province] || PROVINCIAL_REQUIREMENTS.QC;
  
  const texts = {
    fr: {
      addPhotos: 'Ajouter Photos Conformes',
      mandatory: 'Obligatoires',
      optional: 'Optionnelles',
      dragDrop: 'Glissez vos photos ou cliquez',
      compliant: 'Conforme',
      nonCompliant: 'Non conforme',
      inspector: 'Inspecteur',
      gpsRequired: 'GPS requis',
      resolution: 'Résolution min'
    },
    en: {
      addPhotos: 'Add Compliant Photos',
      mandatory: 'Mandatory',
      optional: 'Optional',
      dragDrop: 'Drag photos or click',
      compliant: 'Compliant',
      nonCompliant: 'Non-compliant',
      inspector: 'Inspector',
      gpsRequired: 'GPS required',
      resolution: 'Min resolution'
    }
  };
  
  const t = texts[language];

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
          gpsLocation: '', // À implémenter avec géolocalisation
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

  const updatePhotoDescription = (photoId: string, description: string) => {
    const updatedPhotos = photos.map(p => 
      p.id === photoId ? { ...p, description } : p
    );
    onPhotosChange(updatedPhotos);
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
        <h3 style={{ color: '#ffffff', margin: '0 0 8px' }}>📸 {t.addPhotos}</h3>
        <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: '14px' }}>{t.dragDrop}</p>
        
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
            <span>📋 {t.mandatory}: {provinceConfig.mandatory.length}</span>
            <span>📄 {t.optional}: {provinceConfig.optional.length}</span>
            <span>📐 {t.resolution}: {provinceConfig.resolution}</span>
            <span>📍 {provinceConfig.geotagRequired ? t.gpsRequired : 'GPS optionnel'}</span>
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
      {/* Header carrousel */}
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
          
          {/* Indicateurs conformité */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {currentPhoto?.required && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8))',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                ⚠️ OBLIGATOIRE
              </div>
            )}
            <div style={{
              background: currentPhoto?.provinceCompliance[province] ? 
                'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.8))' :
                'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8))',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {currentPhoto?.provinceCompliance[province] ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              {currentPhoto?.provinceCompliance[province] ? t.compliant : t.nonCompliant}
            </div>
          </div>
          
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

      {/* Description et métadonnées */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          value={currentPhoto?.description || ''}
          onChange={(e) => updatePhotoDescription(currentPhoto.id, e.target.value)}
          placeholder="Ajouter une description à cette photo..."
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            minHeight: '60px',
            resize: 'vertical'
          }}
        />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px',
          marginTop: '8px',
          fontSize: '10px',
          color: '#94a3b8'
        }}>
          <span>📅 {new Date(currentPhoto?.timestamp).toLocaleDateString()}</span>
          <span>📝 {currentPhoto?.name}</span>
          <span>🏛️ {provinceConfig.inspector}</span>
          {currentPhoto?.gpsLocation && <span>📍 GPS: {currentPhoto.gpsLocation}</span>}
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
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: photo.provinceCompliance[province] ? '#22c55e' : '#ef4444'
              }} />
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
// =================== SECTION 2: MODES FACILES WORKERS + SUPERVISORS ===================
// À coller après la Section 1

// =================== COMPOSANT MODE FACILE WORKERS ===================
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

  const texts = {
    fr: {
      title: 'Gestion Rapide des Travailleurs',
      addWorker: 'Ajouter Travailleur',
      name: 'Nom complet',
      age: 'Âge',
      certification: 'Certification SST',
      entryTime: 'Heure d\'entrée',
      active: 'Actif',
      exited: 'Sorti',
      enterSite: 'Entrer sur site',
      exitSite: 'Sortir du site',
      ageWarning: 'ATTENTION: Âge minimum 18 ans requis',
      certRequired: 'Certification requise selon province',
      quickAdd: 'Ajout Rapide',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      entryLog: 'Journal des entrées/sorties',
      noWorkers: 'Aucun travailleur enregistré',
      gasLevel: 'Niveau gaz',
      supervisor: 'Superviseur',
      contact: 'Contact'
    },
    en: {
      title: 'Quick Worker Management',
      addWorker: 'Add Worker',
      name: 'Full name',
      age: 'Age',
      certification: 'HSE Certification',
      entryTime: 'Entry time',
      active: 'Active',
      exited: 'Exited',
      enterSite: 'Enter site',
      exitSite: 'Exit site',
      ageWarning: 'WARNING: Minimum age 18 years required',
      certRequired: 'Certification required by province',
      quickAdd: 'Quick Add',
      cancel: 'Cancel',
      save: 'Save',
      entryLog: 'Entry/exit log',
      noWorkers: 'No workers registered',
      gasLevel: 'Gas level',
      supervisor: 'Supervisor',
      contact: 'Contact'
    }
  };

  const t = texts[language];

  const handleAddWorker = () => {
    const age = parseInt(newWorker.age);
    if (age < 18) {
      alert(t.ageWarning);
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

  const approveBySupervisor = (workerId: string) => {
    const updatedWorkers = workers.map(worker =>
      worker.id === workerId ? { ...worker, supervisorApproval: !worker.supervisorApproval } : worker
    );
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
            👥 {t.title}
          </h4>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {workers.length} travailleurs • {workers.filter(w => w.isActive).length} actifs
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
          {t.addWorker}
        </button>
      </div>

      {/* Formulaire ajout rapide */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h5 style={{ color: '#22c55e', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            ⚡ {t.quickAdd}
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder={t.name}
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
              placeholder={t.age}
              value={newWorker.age}
              onChange={(e) => setNewWorker({ ...newWorker, age: e.target.value })}
              min="18"
              style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: parseInt(newWorker.age) < 18 && newWorker.age ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder={t.certification}
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

          {parseInt(newWorker.age) < 18 && newWorker.age && (
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
              {t.ageWarning}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddWorker}
              disabled={!newWorker.name || !newWorker.age || parseInt(newWorker.age) < 18 || !newWorker.certification}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                opacity: (!newWorker.name || !newWorker.age || parseInt(newWorker.age) < 18 || !newWorker.certification) ? 0.5 : 1
              }}
            >
              {t.save}
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
              {t.cancel}
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
            <p style={{ margin: 0 }}>{t.noWorkers}</p>
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
                    background: worker.age >= 18 ? '#22c55e' : '#ef4444',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    {worker.age} ans
                  </span>
                  {worker.supervisorApproval && (
                    <span style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      ✓ Superviseur
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                  <span>📋 {worker.certification}</span>
                  <span>🕐 Entrée: {worker.entryTime}</span>
                  {worker.exitTime && <span>🕐 Sortie: {worker.exitTime}</span>}
                  {worker.gasLevelAtEntry && <span>🌬️ Gaz: {worker.gasLevelAtEntry}%</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => approveBySupervisor(worker.id)}
                  style={{
                    padding: '6px 8px',
                    background: worker.supervisorApproval ?
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                      'rgba(100, 116, 139, 0.3)',
                    color: worker.supervisorApproval ? 'white' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                  title="Approbation superviseur"
                >
                  <UserCheck size={12} />
                </button>
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
                  {worker.isActive ? t.exitSite : t.enterSite}
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

// =================== COMPOSANT MODE FACILE SUPERVISORS ===================
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
    AB: ['Alberta OHS Supervisor', 'Energy Safety', 'Industrial Supervisor'],
    SK: ['Saskatchewan OHS', 'Mining Supervisor', 'Safety Officer'],
    MB: ['Manitoba WSH', 'Supervisor Certified', 'Safety Leader'],
    NB: ['WorkSafeNB Supervisor', 'Forestry Safety', 'General Supervisor'],
    NS: ['Nova Scotia Labour', 'Offshore Supervisor', 'Mining Safety'],
    PE: ['PEI WCB Supervisor', 'Agricultural Safety', 'Tourism Safety'],
    NL: ['WorkplaceNL Supervisor', 'Offshore Safety', 'Fishing Industry'],
    YT: ['Yukon WSCC', 'Mining Supervisor', 'Arctic Safety'],
    NT: ['NWT WSCC', 'Diamond Mining', 'Arctic Supervisor'],
    NU: ['Nunavut WSCC', 'Traditional Safety', 'Arctic Conditions']
  };

  const texts = {
    fr: {
      title: 'Superviseurs et Responsables',
      addSupervisor: 'Ajouter Superviseur',
      name: 'Nom du superviseur',
      certification: 'Certification principale',
      contact: 'Contact (tél/email)',
      authorizations: 'Autorisations',
      active: 'Actif',
      inactive: 'Inactif',
      quickAdd: 'Ajout Rapide Superviseur',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      noSupervisors: 'Aucun superviseur assigné',
      toggleStatus: 'Changer statut',
      certRequired: 'Certification provinciale requise',
      selectCert: 'Sélectionner certification...'
    },
    en: {
      title: 'Supervisors and Managers',
      addSupervisor: 'Add Supervisor',
      name: 'Supervisor name',
      certification: 'Primary certification',
      contact: 'Contact (phone/email)',
      authorizations: 'Authorizations',
      active: 'Active',
      inactive: 'Inactive',
      quickAdd: 'Quick Add Supervisor',
      save: 'Save',
      cancel: 'Cancel',
      noSupervisors: 'No supervisors assigned',
      toggleStatus: 'Toggle status',
      certRequired: 'Provincial certification required',
      selectCert: 'Select certification...'
    }
  };

  const t = texts[language];
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
            🛡️ {t.title}
          </h4>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {supervisors.length} superviseurs • {supervisors.filter(s => s.isActive).length} actifs
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
          {t.addSupervisor}
        </button>
      </div>

      {/* Formulaire ajout rapide */}
      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h5 style={{ color: '#3b82f6', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            ⚡ {t.quickAdd}
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder={t.name}
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
              <option value="">{t.selectCert}</option>
              {availableCerts.map(cert => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t.contact}
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
              {t.authorizations}:
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
              {t.save}
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
              {t.cancel}
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
            <p style={{ margin: 0 }}>{t.noSupervisors}</p>
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
                  {supervisor.isActive ? t.inactive : t.active}
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
// =================== SECTION 3: PERMIS CONFORMES PROVINCES CANADIENNES ===================
// À coller après la Section 2

// =================== INTERFACES PERMIS PROVINCIAUX ===================
interface Permit {
  id: string;
  name: string;
  category: string;
  description: string;
  authority: string;
  province: string[];
  required: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  cost: string;
  processingTime: string;
  renewalRequired: boolean;
  renewalPeriod?: string;
  legislation: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  selected: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  formData?: any;
  formFields?: FormField[];
  complianceLevel: 'basic' | 'standard' | 'enhanced' | 'critical';
  lastUpdated: string;
  provincialVariations?: {
    [province: string]: {
      authority: string;
      legislation: string;
      specificRequirements: string[];
      contactInfo?: any;
    };
  };
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature' | 'workers_tracking' | 'time_picker' | 'photo_gallery' | 'gas_meter' | 'calculation' | 'compliance_check' | 'alert_indicator';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  section?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    critical?: boolean;
    legalRequirement?: boolean;
  };
  complianceRef?: string;
  calculation?: {
    formula?: string;
    dependencies?: string[];
    autoCalculate?: boolean;
  };
  alert?: {
    level: 'info' | 'warning' | 'danger' | 'critical';
    condition?: string;
    message?: string;
  };
  provincialVariations?: {
    [province: string]: {
      label?: string;
      required?: boolean;
      validation?: any;
      options?: string[];
    };
  };
}

interface WorkerEntry {
  id: number;
  name: string;
  age: number;
  certification: string;
  entryTime: string;
  exitTime: string | null;
  date: string;
  oxygenLevel?: number;
  gasLevel?: number;
}

interface PhotoEntry {
  id: number;
  url: string;
  name: string;
  timestamp: string;
  description: string;
  gpsLocation?: string;
  compliance?: boolean;
}

interface SignatureMetadata {
  name: string;
  title: string;
  certification: string;
  date: string;
  time: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  legalBinding: boolean;
}

interface GasReading {
  timestamp: string;
  oxygen: number;
  combustibleGas: number;
  carbonMonoxide: number;
  hydrogenSulfide: number;
  temperature: number;
  calibrationValid: boolean;
}

interface ComplianceCheck {
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  reference: string;
}

// =================== CONFIGURATION AUTORITÉS PROVINCIALES ===================
const PROVINCIAL_AUTHORITIES = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    fullName: 'Commission des normes, de l\'équité, de la santé et de la sécurité du travail',
    legislation: 'RSST (Règlement sur la santé et la sécurité du travail)',
    contact: {
      phone: '1-844-838-0808',
      website: 'https://www.cnesst.gouv.qc.ca',
      email: 'info@cnesst.gouv.qc.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Formation obligatoire espace clos',
      documentation: 'Permis en français obligatoire',
      inspection: 'Inspection CNESST requise'
    }
  },
  ON: {
    name: 'Ontario',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    fullName: 'Ministère du Travail, de l\'Immigration, de la Formation et du Développement des compétences',
    legislation: 'OHSA (Occupational Health and Safety Act)',
    contact: {
      phone: '1-877-202-0008',
      website: 'https://www.ontario.ca/page/ministry-labour-training-skills-development',
      email: 'MOL.INFO@ontario.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'OHSA training mandatory',
      documentation: 'English documentation required',
      inspection: 'MOL inspection may be required'
    }
  },
  BC: {
    name: 'Colombie-Britannique',
    authority: 'WorkSafeBC',
    fullName: 'Workers\' Compensation Board of British Columbia',
    legislation: 'Workers Compensation Act & OHS Regulation',
    contact: {
      phone: '1-888-621-7233',
      website: 'https://www.worksafebc.com',
      email: 'info@worksafebc.com'
    },
    specificRequirements: {
      age: 19, // BC a 19 ans comme âge de majorité
      training: 'WorkSafeBC certification required',
      documentation: 'Bilingual documentation accepted',
      inspection: 'WorkSafeBC officer inspection'
    }
  },
  AB: {
    name: 'Alberta',
    authority: 'Alberta Labour and Immigration',
    fullName: 'Alberta Occupational Health and Safety',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-877-641-4764',
      website: 'https://www.alberta.ca/ohs',
      email: 'ohs@gov.ab.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Alberta OHS training',
      documentation: 'English documentation',
      inspection: 'OHS inspection required for energy sector'
    }
  },
  SK: {
    name: 'Saskatchewan',
    authority: 'Ministry of Labour Relations and Workplace Safety',
    fullName: 'Saskatchewan Labour Relations and Workplace Safety',
    legislation: 'Saskatchewan Employment Act',
    contact: {
      phone: '1-800-567-7233',
      website: 'https://www.saskatchewan.ca/business/safety-in-the-workplace',
      email: 'labour.safety@gov.sk.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Saskatchewan safety training',
      documentation: 'English documentation',
      inspection: 'Ministry inspection for mining'
    }
  },
  MB: {
    name: 'Manitoba',
    authority: 'Workplace Safety and Health Division',
    fullName: 'Manitoba Workplace Safety and Health',
    legislation: 'Workplace Safety and Health Act',
    contact: {
      phone: '1-855-957-7233',
      website: 'https://www.gov.mb.ca/labour/safety',
      email: 'wsh@gov.mb.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Manitoba WSH training',
      documentation: 'English/French documentation',
      inspection: 'WSH inspection required'
    }
  },
  NB: {
    name: 'Nouveau-Brunswick',
    authority: 'WorkSafeNB',
    fullName: 'Commission de la santé, de la sécurité et de l\'indemnisation des accidents au travail',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-800-222-9775',
      website: 'https://www.worksafenb.ca',
      email: 'info@worksafenb.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'WorkSafeNB certification',
      documentation: 'Bilingual documentation required',
      inspection: 'WorkSafeNB inspection'
    }
  },
  NS: {
    name: 'Nouvelle-Écosse',
    authority: 'Labour Standards and Workplace Safety',
    fullName: 'Nova Scotia Labour Standards and Workplace Safety',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-800-952-2687',
      website: 'https://novascotia.ca/lae/healthandsafety',
      email: 'ohsdivision@novascotia.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'NS safety training',
      documentation: 'English documentation',
      inspection: 'Labour inspection for offshore'
    }
  },
  PE: {
    name: 'Île-du-Prince-Édouard',
    authority: 'Workers Compensation Board of PEI',
    fullName: 'Workers Compensation Board of Prince Edward Island',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-800-237-5049',
      website: 'https://www.wcb.pe.ca',
      email: 'wcb@wcb.pe.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'PEI safety training',
      documentation: 'English documentation',
      inspection: 'WCB inspection'
    }
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador',
    authority: 'WorkplaceNL',
    fullName: 'Workplace Health, Safety and Compensation Commission',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-800-563-9000',
      website: 'https://www.workplacenl.ca',
      email: 'info@workplacenl.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'WorkplaceNL certification',
      documentation: 'English documentation',
      inspection: 'WorkplaceNL inspection for offshore'
    }
  },
  YT: {
    name: 'Yukon',
    authority: 'Yukon Workers\' Safety and Compensation Commission',
    fullName: 'Yukon Workers\' Safety and Compensation Commission',
    legislation: 'Occupational Health and Safety Act',
    contact: {
      phone: '1-867-667-5645',
      website: 'https://www.wscc.yk.ca',
      email: 'info@wscc.yk.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Yukon safety training',
      documentation: 'English/French documentation',
      inspection: 'WSCC inspection for mining'
    }
  },
  NT: {
    name: 'Territoires du Nord-Ouest',
    authority: 'Workers\' Safety and Compensation Commission',
    fullName: 'Northwest Territories Workers\' Safety and Compensation Commission',
    legislation: 'Safety Act',
    contact: {
      phone: '1-800-661-0792',
      website: 'https://www.wscc.nt.ca',
      email: 'info@wscc.nt.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'NWT safety training',
      documentation: 'English/French documentation',
      inspection: 'WSCC inspection for mining'
    }
  },
  NU: {
    name: 'Nunavut',
    authority: 'Workers\' Safety and Compensation Commission',
    fullName: 'Nunavut Workers\' Safety and Compensation Commission',
    legislation: 'Safety Act',
    contact: {
      phone: '1-877-404-4407',
      website: 'https://www.wscc.nu.ca',
      email: 'info@wscc.nu.ca'
    },
    specificRequirements: {
      age: 18,
      training: 'Nunavut safety training',
      documentation: 'English/French/Inuktitut documentation',
      inspection: 'WSCC inspection'
    }
  }
};

// =================== BASE DE DONNÉES PERMIS ADAPTÉS PAR PROVINCE ===================
const getProvincialPermitsDatabase = (language: 'fr' | 'en', selectedProvince: string = 'QC'): Permit[] => {
  const provinceConfig = PROVINCIAL_AUTHORITIES[selectedProvince as keyof typeof PROVINCIAL_AUTHORITIES] || PROVINCIAL_AUTHORITIES.QC;
  
  return [
    // 1. PERMIS ESPACE CLOS ADAPTÉ PAR PROVINCE
    {
      id: 'confined-space-entry-provincial',
      name: language === 'fr' ? 
        `Permis Entrée Espace Clos - ${provinceConfig.name}` : 
        `Confined Space Entry Permit - ${provinceConfig.name}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis conforme à ${provinceConfig.legislation} avec surveillance atmosphérique continue selon ${provinceConfig.authority}` : 
        `Permit compliant with ${provinceConfig.legislation} including continuous atmospheric monitoring per ${provinceConfig.authority}`,
      authority: provinceConfig.authority,
      province: [selectedProvince],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? 'Maximum 8 heures selon province' : 'Maximum 8 hours per province',
      cost: language === 'fr' ? 'Variable selon province' : 'Variable by province',
      processingTime: language === 'fr' ? 'Immédiat avec tests gaz' : 'Immediate with gas testing',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien' : 'Daily',
      legislation: provinceConfig.legislation,
      contactInfo: provinceConfig.contact,
      selected: false,
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      provincialVariations: {
        [selectedProvince]: {
          authority: provinceConfig.authority,
          legislation: provinceConfig.legislation,
          specificRequirements: [
            `Âge minimum: ${provinceConfig.specificRequirements.age} ans`,
            provinceConfig.specificRequirements.training,
            provinceConfig.specificRequirements.documentation,
            provinceConfig.specificRequirements.inspection
          ],
          contactInfo: provinceConfig.contact
        }
      },
      formFields: [
        // SECTION IDENTIFICATION PROVINCIALE
        { 
          id: 'space_identification_provincial', 
          type: 'text', 
          label: language === 'fr' ? `Identification espace clos (${provinceConfig.name})` : `Confined space ID (${provinceConfig.name})`, 
          required: true, 
          section: 'identification',
          validation: { legalRequirement: true }, 
          complianceRef: provinceConfig.legislation
        },
        { 
          id: 'provincial_permit_number', 
          type: 'text', 
          label: language === 'fr' ? `Numéro permis ${provinceConfig.authority}` : `${provinceConfig.authority} permit number`, 
          required: true, 
          section: 'identification',
          validation: { legalRequirement: true }
        },
        { 
          id: 'provincial_inspector', 
          type: 'text', 
          label: language === 'fr' ? `Inspecteur ${provinceConfig.authority} assigné` : `Assigned ${provinceConfig.authority} inspector`, 
          required: selectedProvince === 'QC' || selectedProvince === 'BC', 
          section: 'identification'
        },
        
        // SECTION GAZ SELON PROVINCE
        { 
          id: 'oxygen_level_provincial', 
          type: 'gas_meter', 
          label: language === 'fr' ? `Oxygène (%) - Standard ${provinceConfig.name}` : `Oxygen (%) - ${provinceConfig.name} Standard`, 
          required: true, 
          section: 'gas_monitoring',
          validation: { 
            min: 19.5, 
            max: 23.5, 
            critical: true, 
            legalRequirement: true,
            message: language === 'fr' ? 
              `CRITIQUE ${provinceConfig.name}: O2 entre 19.5% et 23.5%` : 
              `CRITICAL ${provinceConfig.name}: O2 between 19.5% and 23.5%`
          }, 
          complianceRef: provinceConfig.legislation
        },
        { 
          id: 'combustible_gas_provincial', 
          type: 'gas_meter', 
          label: language === 'fr' ? `Gaz combustibles (% LIE) - ${provinceConfig.authority}` : `Combustible gas (% LEL) - ${provinceConfig.authority}`, 
          required: true, 
          section: 'gas_monitoring',
          validation: { 
            min: 0, 
            max: 10, 
            critical: true, 
            legalRequirement: true
          }
        },
        
        // SECTION ÂGE SELON PROVINCE
        { 
          id: 'worker_age_verification_provincial', 
          type: 'compliance_check', 
          label: language === 'fr' ? 
            `VÉRIFICATION: Tous travailleurs ≥ ${provinceConfig.specificRequirements.age} ans (${provinceConfig.name})` : 
            `VERIFICATION: All workers ≥ ${provinceConfig.specificRequirements.age} years (${provinceConfig.name})`, 
          required: true, 
          section: 'access',
          validation: { critical: true, legalRequirement: true },
          complianceRef: `${provinceConfig.legislation} - Âge minimum`
        },
        
        // SECTION FORMATION PROVINCIALE
        { 
          id: 'provincial_training_verification', 
          type: 'compliance_check', 
          label: language === 'fr' ? 
            `Formation ${provinceConfig.specificRequirements.training} complétée` : 
            `${provinceConfig.specificRequirements.training} completed`, 
          required: true, 
          section: 'access',
          validation: { legalRequirement: true }
        },
        
        // SECTION DOCUMENTATION LANGUE
        { 
          id: 'language_documentation', 
          type: 'select', 
          label: language === 'fr' ? 'Langue de documentation' : 'Documentation language', 
          required: true, 
          section: 'documents',
          options: selectedProvince === 'QC' ? ['Français'] :
                  selectedProvince === 'NB' || selectedProvince === 'MB' || selectedProvince === 'YT' || selectedProvince === 'NT' ? ['English', 'Français'] :
                  selectedProvince === 'NU' ? ['English', 'Français', 'Inuktitut'] :
                  ['English'],
          validation: { legalRequirement: true },
          complianceRef: `${provinceConfig.specificRequirements.documentation}`
        },
        
        // SECTION PHOTOS CONFORMES PROVINCE
        { 
          id: 'photos_provincial_compliance', 
          type: 'photo_gallery', 
          label: language === 'fr' ? 
            `Photos conformes ${provinceConfig.authority}` : 
            `${provinceConfig.authority} compliant photos`, 
          required: true, 
          section: 'atmosphere',
          validation: { legalRequirement: true }
        },
        
        // SECTION TRAVAILLEURS PROVINCE
        { 
          id: 'workers_provincial_tracking', 
          type: 'workers_tracking', 
          label: language === 'fr' ? 
            `Registre travailleurs ${provinceConfig.name}` : 
            `${provinceConfig.name} workers registry`, 
          required: true, 
          section: 'signatures',
          validation: { legalRequirement: true }
        },
        
        // SIGNATURES AUTORITÉ PROVINCIALE
        { 
          id: 'provincial_authority_signature', 
          type: 'signature', 
          label: language === 'fr' ? 
            `Signature représentant ${provinceConfig.authority}` : 
            `${provinceConfig.authority} representative signature`, 
          required: selectedProvince === 'QC' || selectedProvince === 'BC', 
          section: 'signatures',
          validation: { legalRequirement: selectedProvince === 'QC' || selectedProvince === 'BC' }
        }
      ]
    },

    // 2. PERMIS TRAVAIL À CHAUD ADAPTÉ PAR PROVINCE
    {
      id: 'hot-work-permit-provincial',
      name: language === 'fr' ? 
        `Permis Travail à Chaud - ${provinceConfig.name}` : 
        `Hot Work Permit - ${provinceConfig.name}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis conforme ${provinceConfig.legislation} avec surveillance incendie selon ${provinceConfig.authority}` : 
        `${provinceConfig.legislation} compliant permit with fire watch per ${provinceConfig.authority}`,
      authority: provinceConfig.authority,
      province: [selectedProvince],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? '24h avec surveillance post-travaux' : '24h with post-work monitoring',
      cost: language === 'fr' ? 'Variable selon municipalité provinciale' : 'Variable by provincial municipality',
      processingTime: language === 'fr' ? 'Immédiat à 24h selon province' : 'Immediate to 24h by province',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien' : 'Daily',
      legislation: `${provinceConfig.legislation} + NFPA 51B-2019`,
      contactInfo: provinceConfig.contact,
      selected: false,
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      formFields: [
        // IDENTIFICATION AVEC AUTORITÉ PROVINCIALE
        { 
          id: 'provincial_hot_work_number', 
          type: 'text', 
          label: language === 'fr' ? 
            `Numéro permis ${provinceConfig.authority}` : 
            `${provinceConfig.authority} permit number`, 
          required: true, 
          section: 'identification',
          validation: { legalRequirement: true }
        },
        
        // SURVEILLANCE INCENDIE SELON PROVINCE
        { 
          id: 'fire_watch_provincial_duration', 
          type: 'select', 
          label: language === 'fr' ? 
            `Durée surveillance incendie (${provinceConfig.name})` : 
            `Fire watch duration (${provinceConfig.name})`, 
          required: true, 
          section: 'fire_watch',
          options: selectedProvince === 'QC' ? ['1 heure (NFPA + QC)', '2 heures', 'Plus de 2 heures'] :
                   selectedProvince === 'BC' ? ['30 minutes (WorkSafeBC)', '1 heure', '2 heures'] :
                   selectedProvince === 'AB' ? ['1 heure (Alberta OHS)', '2 heures', 'Continue'] :
                   ['1 heure (NFPA)', '2 heures', 'Plus de 2 heures'],
          validation: { legalRequirement: true },
          provincialVariations: {
            QC: { options: ['1 heure (NFPA + CNESST)', '2 heures', 'Plus de 2 heures'] },
            BC: { options: ['30 minutes (WorkSafeBC)', '1 heure', '2 heures'] },
            AB: { options: ['1 heure (Alberta OHS)', '2 heures', 'Continue'] }
          }
        },
        
        // EXTINCTEURS SELON PROVINCE
        { 
          id: 'extinguisher_provincial_type', 
          type: 'checkbox', 
          label: language === 'fr' ? 
            `Types extincteurs requis ${provinceConfig.name}` : 
            `Required extinguisher types ${provinceConfig.name}`, 
          required: true, 
          section: 'precautions',
          options: selectedProvince === 'QC' ? ['Classe A (étiquetage français)', 'Classe B', 'Classe C', 'CO2'] :
                   ['Class A', 'Class B', 'Class C', 'CO2'],
          validation: { legalRequirement: true }
        },
        
        // AUTORISATION MUNICIPALE PROVINCIALE
        { 
          id: 'municipal_provincial_approval', 
          type: 'checkbox', 
          label: language === 'fr' ? 
            `Autorisation municipale ${provinceConfig.name} obtenue` : 
            `${provinceConfig.name} municipal authorization obtained`, 
          required: selectedProvince === 'QC' || selectedProvince === 'ON' || selectedProvince === 'BC', 
          section: 'municipal_requirements',
          validation: { legalRequirement: selectedProvince === 'QC' || selectedProvince === 'ON' || selectedProvince === 'BC' }
        },
        
        // CONTACT URGENCE PROVINCIAL
        { 
          id: 'provincial_emergency_contact', 
          type: 'text', 
          label: language === 'fr' ? 
            `Contact urgence ${provinceConfig.authority}` : 
            `${provinceConfig.authority} emergency contact`, 
          required: true, 
          section: 'rescue_plan',
          placeholder: provinceConfig.contact.phone,
          validation: { legalRequirement: true }
        }
      ]
    },

    // 3. PERMIS EXCAVATION MUNICIPAL ADAPTÉ PAR PROVINCE
    {
      id: 'excavation-permit-provincial',
      name: language === 'fr' ? 
        `Permis Excavation Municipal - ${provinceConfig.name}` : 
        `Municipal Excavation Permit - ${provinceConfig.name}`,
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 
        `Permis excavation conforme aux règlements municipaux ${provinceConfig.name} avec ${provinceConfig.authority}` : 
        `Excavation permit compliant with ${provinceConfig.name} municipal regulations with ${provinceConfig.authority}`,
      authority: `Municipal + ${provinceConfig.authority}`,
      province: [selectedProvince],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux selon province' : 'Work duration per province',
      cost: language === 'fr' ? 'Variable selon municipalité provinciale' : 'Variable by provincial municipality',
      processingTime: language === 'fr' ? '2-4 semaines selon province' : '2-4 weeks per province',
      renewalRequired: false,
      legislation: `Règlements municipaux ${provinceConfig.name} + ${provinceConfig.legislation}`,
      contactInfo: {
        phone: '311',
        website: language === 'fr' ? 'Bureau des permis municipal' : 'Municipal permit office',
        email: language === 'fr' ? 'permis@municipalite.ca' : 'permits@municipality.ca'
      },
      selected: false,
      status: 'pending',
      complianceLevel: 'enhanced',
      lastUpdated: '2025-01-20',
      formFields: [
        // INGÉNIEUR SELON PROVINCE
        { 
          id: 'provincial_engineer', 
          type: 'text', 
          label: language === 'fr' ? 
            `Ingénieur responsable (${selectedProvince === 'QC' ? 'OIQ' : selectedProvince === 'ON' ? 'PEO' : selectedProvince === 'BC' ? 'EGBC' : 'Provincial Order'})` : 
            `Responsible engineer (${selectedProvince === 'QC' ? 'OIQ' : selectedProvince === 'ON' ? 'PEO' : selectedProvince === 'BC' ? 'EGBC' : 'Provincial Order'})`, 
          required: true, 
          section: 'applicant',
          validation: { legalRequirement: true },
          complianceRef: `Ordre des ingénieurs ${provinceConfig.name}`
        },
        
        // CALCULS PROFONDEUR SELON PROVINCE
        { 
          id: 'excavation_depth_provincial', 
          type: 'calculation', 
          label: language === 'fr' ? 
            `Profondeur excavation (standard ${provinceConfig.name})` : 
            `Excavation depth (${provinceConfig.name} standard)`, 
          required: true, 
          section: 'excavation',
          validation: { 
            min: 0, 
            legalRequirement: true,
            message: selectedProvince === 'QC' ? 'Permis requis si > 1.2m selon Code de construction QC' :
                     selectedProvince === 'ON' ? 'Permit required if > 1.5m per Ontario Building Code' :
                     selectedProvince === 'BC' ? 'Permit required if > 1m per BC Building Code' :
                     'Permit required per provincial building code'
          }
        },
        
        // ASSURANCES SELON PROVINCE
        { 
          id: 'insurance_provincial_amount', 
          type: 'calculation', 
          label: language === 'fr' ? 
            `Assurance obligatoire ${provinceConfig.name}` : 
            `Mandatory insurance ${provinceConfig.name}`, 
          required: true, 
          section: 'municipal_requirements',
          validation: { legalRequirement: true },
          calculation: { 
            formula: selectedProvince === 'QC' ? 'if(depth <= 2) then 1000000 else 2000000' :
                     selectedProvince === 'ON' ? 'if(depth <= 1.5) then 500000 else 1000000' :
                     selectedProvince === 'BC' ? 'if(depth <= 1) then 750000 else 1500000' :
                     'if(depth <= 2) then 1000000 else 2000000',
            dependencies: ['excavation_depth_provincial'],
            autoCalculate: true
          }
        },
        
        // INFO-EXCAVATION SELON PROVINCE
        { 
          id: 'info_excavation_provincial', 
          type: 'compliance_check', 
          label: language === 'fr' ? 
            `Info-Excavation ${provinceConfig.name} (ou équivalent provincial)` : 
            `Info-Excavation ${provinceConfig.name} (or provincial equivalent)`, 
          required: true, 
          section: 'safety',
          validation: { legalRequirement: true, critical: true },
          complianceRef: selectedProvince === 'QC' ? 'Info-Excavation Québec' :
                         selectedProvince === 'ON' ? 'Ontario One Call' :
                         selectedProvince === 'BC' ? 'BC One Call' :
                         selectedProvince === 'AB' ? 'Alberta One Call' :
                         'Provincial One Call System'
        },
        
        // INSPECTION PROVINCIALE
        { 
          id: 'provincial_inspection_required', 
          type: 'compliance_check', 
          label: language === 'fr' ? 
            `Inspection ${provinceConfig.authority} planifiée` : 
            `${provinceConfig.authority} inspection scheduled`, 
          required: selectedProvince === 'QC' || selectedProvince === 'BC' || selectedProvince === 'AB', 
          section: 'municipal_requirements',
          validation: { legalRequirement: selectedProvince === 'QC' || selectedProvince === 'BC' || selectedProvince === 'AB' }
        },
        
        // DOCUMENTATION LANGUE PROVINCIALE
        { 
          id: 'excavation_language_docs', 
          type: 'select', 
          label: language === 'fr' ? 'Langue des documents techniques' : 'Technical documents language', 
          required: selectedProvince === 'QC' || selectedProvince === 'NB', 
          section: 'documents',
          options: selectedProvince === 'QC' ? ['Français obligatoire'] :
                   selectedProvince === 'NB' ? ['English', 'Français'] :
                   ['English'],
          validation: { legalRequirement: selectedProvince === 'QC' || selectedProvince === 'NB' }
        }
      ]
    }
  ];
};

// =================== FONCTION DE VALIDATION CONFORMITÉ PROVINCIALE ===================
const validateProvincialCompliance = (permits: Permit[], selectedProvince: string): ComplianceCheck[] => {
  const checks: ComplianceCheck[] = [];
  const provinceConfig = PROVINCIAL_AUTHORITIES[selectedProvince as keyof typeof PROVINCIAL_AUTHORITIES];
  
  if (!provinceConfig) return checks;

  permits.forEach(permit => {
    if (permit.selected && permit.formData) {
      
      // Validation âge selon province
      if (permit.formData.workers_provincial_tracking) {
        const workers = permit.formData.workers_provincial_tracking || [];
        workers.forEach((worker: any) => {
          if (worker.age < provinceConfig.specificRequirements.age) {
            checks.push({
              requirement: `Âge minimum ${provinceConfig.specificRequirements.age} ans - ${provinceConfig.name}`,
              status: 'non-compliant',
              details: `Travailleur ${worker.name}: ${worker.age} ans (< ${provinceConfig.specificRequirements.age})`,
              reference: `${provinceConfig.legislation} - Âge minimum`
            });
          }
        });
      }
      
      // Validation formation provinciale
      if (permit.formData.provincial_training_verification === false) {
        checks.push({
          requirement: `Formation ${provinceConfig.specificRequirements.training}`,
          status: 'non-compliant',
          details: 'Formation provinciale non complétée',
          reference: `${provinceConfig.authority} - Formation obligatoire`
        });
      }
      
      // Validation documentation langue
      if (selectedProvince === 'QC' && permit.formData.language_documentation !== 'Français') {
        checks.push({
          requirement: 'Documentation en français - Québec',
          status: 'non-compliant',
          details: 'Documentation doit être en français au Québec',
          reference: 'Charte de la langue française'
        });
      }
      
      // Validation gaz selon province
      if (permit.id.includes('confined-space') && permit.formData.oxygen_level_provincial) {
        const o2Level = parseFloat(permit.formData.oxygen_level_provincial);
        if (o2Level < 19.5 || o2Level > 23.5) {
          checks.push({
            requirement: `Niveau oxygène conforme - ${provinceConfig.name}`,
            status: 'non-compliant',
            details: `O2: ${o2Level}% (doit être 19.5-23.5%)`,
            reference: `${provinceConfig.legislation} - Surveillance atmosphérique`
          });
        }
      }
      
      // Validation excavation selon province
      if (permit.id.includes('excavation') && permit.formData.excavation_depth_provincial) {
        const depth = parseFloat(permit.formData.excavation_depth_provincial);
        const minDepth = selectedProvince === 'QC' ? 1.2 : 
                        selectedProvince === 'ON' ? 1.5 : 
                        selectedProvince === 'BC' ? 1.0 : 1.2;
        
        if (depth > minDepth && !permit.formData.info_excavation_provincial) {
          checks.push({
            requirement: `Info-Excavation obligatoire - ${provinceConfig.name}`,
            status: 'non-compliant',
            details: `Profondeur ${depth}m > ${minDepth}m`,
            reference: `Système provincial de localisation`
          });
        }
      }
    }
  });
  
  return checks;
};
// =================== SECTION 4A: COMPOSANT PRINCIPAL + INTÉGRATION ===================
// À coller après la Section 3

// =================== INTERFACE BASE DONNÉES ESPACE CLOS ===================
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
  accessPoints: {
    type: string;
    size: string;
    location: string;
  }[];
  lastInspection: string;
  nextInspection: string;
  permits: string[];
  photos: PhotoCarouselEntry[];
  workers: WorkerEntryQuick[];
  supervisors: SupervisorQuick[];
  province: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  compliance: {
    [province: string]: boolean;
  };
  createdAt: string;
  updatedAt: string;
  tenant: string;
}

// =================== FONCTION TRADUCTION COMPLÈTE ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Conformes 2024-2025',
      subtitle: 'Formulaires authentiques conformes aux dernières normes CNESST, NFPA et municipales',
      searchPlaceholder: 'Rechercher un permis...',
      allCategories: 'Toutes catégories',
      allProvinces: 'Toutes provinces',
      categories: {
        'Sécurité': 'Sécurité',
        'Construction': 'Construction',
        'Radioprotection': 'Radioprotection',
        'Équipements': 'Équipements'
      },
      priorities: {
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevé',
        critical: 'Critique'
      },
      statuses: {
        pending: 'En attente',
        submitted: 'Soumis',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        expired: 'Expiré'
      },
      complianceLevels: {
        basic: 'Basique',
        standard: 'Standard',
        enhanced: 'Renforcé',
        critical: 'Critique'
      },
      sections: {
        identification: 'Identification',
        applicant: 'Demandeur',
        access: 'Accès',
        atmosphere: 'Atmosphère',
        signatures: 'Signatures',
        work_type: 'Type de travaux',
        precautions: 'Précautions',
        project: 'Projet',
        excavation: 'Excavation',
        safety: 'Sécurité',
        documents: 'Documents',
        compliance: 'Conformité',
        gas_monitoring: 'Surveillance Gaz',
        rescue_plan: 'Plan de Sauvetage',
        fire_watch: 'Surveillance Incendie',
        municipal_requirements: 'Exigences Municipales'
      },
      stats: {
        available: 'Permis disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        pending: 'En attente',
        compliant: 'Conformes',
        nonCompliant: 'Non conformes'
      },
      actions: {
        fill: 'Remplir',
        close: 'Fermer',
        preview: 'Aperçu',
        download: 'PDF',
        save: 'Sauvegarder',
        print: 'Imprimer',
        submit: 'Soumettre',
        validate: 'Valider conformité',
        calculate: 'Calculer automatiquement'
      },
      alerts: {
        critical: 'CRITIQUE - Action immédiate requise',
        warning: 'ATTENTION - Vérification nécessaire',
        info: 'Information importante',
        danger: 'DANGER - Conditions non sécuritaires'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche pour voir plus de permis',
        spaceDatabase: 'Base de Données Espaces Clos',
        selectSpace: 'Sélectionner un espace clos existant',
        noSpaceSelected: 'Aucun espace sélectionné - Utilisez la base de données ci-dessus',
        nextStep: 'Prochaine étape: Validation et soumission'
      }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2024-2025',
      subtitle: 'Authentic forms compliant with latest CNESST, NFPA and municipal standards',
      searchPlaceholder: 'Search permits...',
      allCategories: 'All categories',
      allProvinces: 'All provinces',
      categories: {
        'Sécurité': 'Safety',
        'Construction': 'Construction',
        'Radioprotection': 'Radiation Protection',
        'Équipements': 'Equipment'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      statuses: {
        pending: 'Pending',
        submitted: 'Submitted',
        approved: 'Approved',
        rejected: 'Rejected',
        expired: 'Expired'
      },
      complianceLevels: {
        basic: 'Basic',
        standard: 'Standard',
        enhanced: 'Enhanced',
        critical: 'Critical'
      },
      sections: {
        identification: 'Identification',
        applicant: 'Applicant',
        access: 'Access',
        atmosphere: 'Atmosphere',
        signatures: 'Signatures',
        work_type: 'Work Type',
        precautions: 'Precautions',
        project: 'Project',
        excavation: 'Excavation',
        safety: 'Safety',
        documents: 'Documents',
        compliance: 'Compliance',
        gas_monitoring: 'Gas Monitoring',
        rescue_plan: 'Rescue Plan',
        fire_watch: 'Fire Watch',
        municipal_requirements: 'Municipal Requirements'
      },
      stats: {
        available: 'Available permits',
        selected: 'Selected',
        critical: 'Critical',
        pending: 'Pending',
        compliant: 'Compliant',
        nonCompliant: 'Non-compliant'
      },
      actions: {
        fill: 'Fill',
        close: 'Close',
        preview: 'Preview',
        download: 'PDF',
        save: 'Save',
        print: 'Print',
        submit: 'Submit',
        validate: 'Validate compliance',
        calculate: 'Auto-calculate'
      },
      alerts: {
        critical: 'CRITICAL - Immediate action required',
        warning: 'WARNING - Verification needed',
        info: 'Important information',
        danger: 'DANGER - Unsafe conditions'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria to see more permits',
        spaceDatabase: 'Confined Spaces Database',
        selectSpace: 'Select an existing confined space',
        noSpaceSelected: 'No space selected - Use database above',
        nextStep: 'Next step: Validation and submission'
      }
    };
  }
};

// =================== COMPOSANT PRINCIPAL STEP4PERMITS ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = getTexts(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: ComplianceCheck[] }>({});
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  const [selectedConfinedSpace, setSelectedConfinedSpace] = useState<ConfinedSpaceDatabase | null>(null);
  
  // États pour les nouveaux composants
  const [permitPhotos, setPermitPhotos] = useState<{ [permitId: string]: PhotoCarouselEntry[] }>({});
  const [permitWorkers, setPermitWorkers] = useState<{ [permitId: string]: WorkerEntryQuick[] }>({});
  const [permitSupervisors, setPermitSupervisors] = useState<{ [permitId: string]: SupervisorQuick[] }>({});
  
  // =================== GESTION DES DONNÉES ===================
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return getProvincialPermitsDatabase(language, selectedProvince);
  });

  // =================== VALIDATION CONFORMITÉ ===================
  useEffect(() => {
    validateCompliance();
  }, [permits, selectedProvince, permitWorkers]);

  const validateCompliance = () => {
    const alerts: string[] = [];
    const provincialChecks = validateProvincialCompliance(permits, selectedProvince);
    const checks: { [key: string]: ComplianceCheck[] } = {};

    permits.forEach((permit: Permit) => {
      if (permit.selected && permit.formData) {
        const permitChecks: ComplianceCheck[] = [];

        // Validation espace clos
        if (permit.id.includes('confined-space')) {
          const o2Level = parseFloat(permit.formData.oxygen_level_provincial);
          if (o2Level < 19.5 || o2Level > 23.5) {
            alerts.push(`CRITIQUE ${selectedProvince}: Niveau O2 non conforme (${o2Level}%) - ARRÊT TRAVAUX REQUIS`);
          }
          
          // Validation âge selon province
          const workers = permitWorkers[permit.id] || [];
          const provinceConfig = PROVINCIAL_AUTHORITIES[selectedProvince as keyof typeof PROVINCIAL_AUTHORITIES];
          if (provinceConfig) {
            workers.forEach(worker => {
              if (worker.age < provinceConfig.specificRequirements.age) {
                alerts.push(`CRITIQUE ${selectedProvince}: Travailleur ${worker.name} âgé de ${worker.age} ans (minimum ${provinceConfig.specificRequirements.age} ans)`);
              }
            });
          }
        }

        checks[permit.id] = permitChecks.concat(provincialChecks.filter(check => 
          check.reference.includes(permit.id) || check.requirement.includes('provincial')
        ));
      }
    });

    setCriticalAlerts(alerts);
    setComplianceChecks(checks);
  };

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map((permit: Permit) => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
    const selectedList = updatedPermits.filter((p: Permit) => p.selected);
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter((p: Permit) => p.priority === 'critical').length,
        pending: selectedList.filter((p: Permit) => p.status === 'pending').length
      },
      compliance: {
        criticalAlerts: criticalAlerts,
        checks: complianceChecks
      },
      province: selectedProvince,
      selectedConfinedSpace: selectedConfinedSpace,
      photos: permitPhotos,
      workers: permitWorkers,
      supervisors: permitSupervisors
    };
    onDataChange('permits', permitsData);
  };

  const toggleFormExpansion = (permitId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [permitId]: !prev[permitId]
    }));
  };

  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.authority.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories = useMemo(() => 
    Array.from(new Set(permits.map((p: Permit) => p.category))), 
    [permits]
  );
  
  const provinces = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  
  const selectedPermits = useMemo(() => 
    permits.filter((p: Permit) => p.selected), 
    [permits]
  );

  const stats = useMemo(() => {
    const compliantCount = selectedPermits.filter((p: Permit) => {
      const checks = complianceChecks[p.id] || [];
      return checks.length === 0 || checks.every(check => check.status === 'compliant');
    }).length;

    return {
      totalPermits: permits.length,
      selected: selectedPermits.length,
      critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
      pending: selectedPermits.filter((p: Permit) => p.status === 'pending').length,
      compliant: compliantCount,
      nonCompliant: selectedPermits.length - compliantCount
    };
  }, [permits, selectedPermits, complianceChecks]);

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sécurité': case 'Safety': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': case 'Radiation Protection': return '☢️';
      case 'Équipements': case 'Equipment': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'enhanced': return '#059669';
      case 'standard': return '#2563eb';
      case 'basic': return '#64748b';
      default: return '#6b7280';
    }
  };

  // =================== RENDU HEADER ===================
  const renderHeader = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1))',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '28px',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
        borderRadius: '20px 20px 0 0'
      }} />
      
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
      
      <p style={{ color: '#3b82f6', margin: '0 0 20px', fontSize: '14px' }}>
        {t.subtitle}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '20px'
      }}>
        {[
          { key: 'available', value: stats.totalPermits, icon: '📊', color: '#3b82f6' },
          { key: 'selected', value: stats.selected, icon: '✅', color: '#22c55e' },
          { key: 'critical', value: stats.critical, icon: '🚨', color: '#ef4444' },
          { key: 'compliant', value: `${stats.compliant}/${stats.selected}`, icon: '🛡️', color: '#8b5cf6' }
        ].map(stat => (
          <div key={stat.key} style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
            padding: '20px 16px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s ease'
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
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {t.stats[stat.key as keyof typeof t.stats]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // =================== RENDU ALERTES ===================
  const renderCriticalAlerts = () => {
    if (criticalAlerts.length === 0) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
        border: '2px solid #ef4444',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
      }}>
        <h3 style={{
          color: '#ff6b6b',
          margin: '0 0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          <AlertTriangle size={20} />
          {t.alerts.critical}
        </h3>
        {criticalAlerts.map((alert, index) => (
          <div key={index} style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '10px',
            color: '#fee2e2',
            fontSize: '14px',
            fontWeight: '500',
            borderLeft: '4px solid #ef4444'
          }}>
            {alert}
          </div>
        ))}
      </div>
    );
  };

  // =================== RENDU RECHERCHE ===================
  const renderSearchSection = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '28px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: '16px',
        alignItems: 'end'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            zIndex: 10
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
              fontSize: '16px',
              transition: 'all 0.3s ease'
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
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          <option value="all">{t.allCategories}</option>
          {categories.map((category: any) => (
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
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          {provinces.map((province: string) => (
            <option key={province} value={province}>
              🍁 {province}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0', color: '#ffffff' }}>
      {renderHeader()}
      {renderCriticalAlerts()}
      {renderSearchSection()}
      
      {/* Placeholder pour les autres sections qui seront dans 4B */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h3 style={{ color: '#60a5fa', margin: '0 0 8px' }}>
          Section 4B à venir...
        </h3>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Base de données Supabase + Cartes permis + Formulaires intégrés
        </p>
      </div>
    </div>
  );
};

export default Step4Permits;
// =================== SECTION 4B FINALE: BASE DONNÉES + CARTES PERMIS + EXPORT ===================
// À coller après la Section 4A pour compléter le fichier

// =================== COMPOSANT BASE DONNÉES SUPABASE ===================
const ConfinedSpaceManager: React.FC<{
  tenant: string;
  onSpaceSelected: (space: ConfinedSpaceDatabase) => void;
  language: 'fr' | 'en';
}> = ({ tenant, onSpaceSelected, language }) => {
  const [spaces, setSpaces] = useState<ConfinedSpaceDatabase[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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
      dimensions: 'Dimensions (L x l x H)',
      save: 'Sauvegarder vers Supabase',
      cancel: 'Annuler',
      search: 'Rechercher espaces...',
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
      dimensions: 'Dimensions (L x W x H)',
      save: 'Save to Supabase',
      cancel: 'Cancel',
      search: 'Search spaces...',
      selectSpace: 'Select this space',
      saving: 'Saving...',
      success: 'Space successfully added to Supabase'
    }
  };

  const t = texts[language];

  // =================== SIMULATION SUPABASE ===================
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
      permits: [],
      photos: [],
      workers: [],
      supervisors: [],
      province: 'QC',
      status: 'active',
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

  // Données de démonstration
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
            {spaces.length} espaces • Tenant: {tenant}
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
            {['company', 'equipmentNumber', 'spaceNumber', 'spaceName', 'location'].map(field => (
              <input
                key={field}
                type="text"
                placeholder={t[field as keyof typeof t] as string}
                value={newSpace[field as keyof typeof newSpace]}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              📐 {t.dimensions}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              {['length', 'width', 'height'].map(dim => (
                <input
                  key={dim}
                  type="number"
                  step="0.1"
                  placeholder={dim === 'length' ? 'Longueur' : dim === 'width' ? 'Largeur' : 'Hauteur'}
                  value={newSpace[dim as keyof typeof newSpace]}
                  onChange={(e) => setNewSpace({ ...newSpace, [dim]: e.target.value })}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              ))}
              <div style={{
                color: '#22c55e',
                fontSize: '12px',
                fontWeight: '600',
                padding: '10px 12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '6px',
                minWidth: '100px',
                textAlign: 'center'
              }}>
                {newSpace.length && newSpace.width && newSpace.height ?
                  `${(parseFloat(newSpace.length) * parseFloat(newSpace.width) * parseFloat(newSpace.height)).toFixed(1)} m³` :
                  '0 m³'
                }
              </div>
            </div>
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

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8'
        }} />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px'
          }}
        />
      </div>

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

// =================== MISE À JOUR STEP4PERMITS AVEC TOUTES LES INTÉGRATIONS ===================
// Remplacer le placeholder dans Section 4A par ce code complet :

const Step4PermitsComplete: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  const t = getTexts(language);
  
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: ComplianceCheck[] }>({});
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  const [selectedConfinedSpace, setSelectedConfinedSpace] = useState<ConfinedSpaceDatabase | null>(null);
  
  const [permitPhotos, setPermitPhotos] = useState<{ [permitId: string]: PhotoCarouselEntry[] }>({});
  const [permitWorkers, setPermitWorkers] = useState<{ [permitId: string]: WorkerEntryQuick[] }>({});
  const [permitSupervisors, setPermitSupervisors] = useState<{ [permitId: string]: SupervisorQuick[] }>({});
  
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return getProvincialPermitsDatabase(language, selectedProvince);
  });

  // Handlers
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
      supervisors: permitSupervisors
    });
  };

  const toggleFormExpansion = (permitId: string) => {
    setExpandedForms(prev => ({ ...prev, [permitId]: !prev[permitId] }));
  };

  const handleConfinedSpaceSelected = (space: ConfinedSpaceDatabase) => {
    setSelectedConfinedSpace(space);
    
    // Pré-remplir les permis avec les infos de l'espace
    const updatedPermits = permits.map(permit => {
      if (permit.id.includes('confined-space') && permit.selected) {
        return {
          ...permit,
          formData: {
            ...permit.formData,
            space_identification_provincial: `${space.company} - ${space.equipmentNumber} - ${space.spaceNumber}`,
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

  // Filtrage
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories = useMemo(() => Array.from(new Set(permits.map((p: Permit) => p.category))), [permits]);
  const provinces = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  const selectedPermits = useMemo(() => permits.filter((p: Permit) => p.selected), [permits]);

  const stats = useMemo(() => ({
    totalPermits: permits.length,
    selected: selectedPermits.length,
    critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
    compliant: selectedPermits.length
  }), [permits, selectedPermits]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sécurité': case 'Safety': return '🛡️';
      case 'Construction': return '🏗️';
      default: return '📋';
    }
  };

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
        <p style={{ color: '#3b82f6', margin: '0 0 20px', fontSize: '14px' }}>{t.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
          {[
            { key: 'available', value: stats.totalPermits, icon: '📊' },
            { key: 'selected', value: stats.selected, icon: '✅' },
            { key: 'critical', value: stats.critical, icon: '🚨' },
            { key: 'compliant', value: `${stats.compliant}/${stats.selected}`, icon: '🛡️' }
          ].map(stat => (
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
                {t.stats[stat.key as keyof typeof t.stats]}
              </div>
            </div>
          ))}
        </div>
      </div>

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
            {categories.map(category => (
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
            {provinces.map(province => (
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
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}
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
                    onClick={() => toggleFormExpansion(permit.id)}
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
                      📝 Formulaire Intégré
                    </h4>

                    {/* Carrousel Photos */}
                    <ProvincialPhotoCarousel
                      permitId={permit.id}
                      province={selectedProvince}
                      photos={permitPhotos[permit.id] || []}
                      onPhotosChange={(photos) => setPermitPhotos(prev => ({ ...prev, [permit.id]: photos }))}
                      language={language}
                    />

                    {/* Gestion Workers */}
                    <EasyWorkerManager
                      permitId={permit.id}
                      province={selectedProvince}
                      workers={permitWorkers[permit.id] || []}
                      onWorkersChange={(workers) => setPermitWorkers(prev => ({ ...prev, [permit.id]: workers }))}
                      language={language}
                    />

                    {/* Gestion Supervisors */}
                    <EasySupervisorManager
                      permitId={permit.id}
                      province={selectedProvince}
                      supervisors={permitSupervisors[permit.id] || []}
                      onSupervisorsChange={(supervisors) => setPermitSupervisors(prev => ({ ...prev, [permit.id]: supervisors }))}
                      language={language}
                    />

                    <div style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '16px',
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
    </div>
  );
};

export default Step4PermitsComplete;
