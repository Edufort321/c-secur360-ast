'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, Lock, Unlock, MapPin, Clock, CheckCircle, AlertTriangle,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download,
  X, Plus, Edit, Save, Eye, Navigation, Upload, Trash2
} from 'lucide-react';

// =================== INTERFACES ===================

interface LOTOPhotoCarouselProps {
  lotoProcedure: LOTOProcedure;
  onUpdateProcedure: (procedure: LOTOProcedure) => void;
  language: 'fr' | 'en';
  editable?: boolean;
  compactMode?: boolean;
  maxPhotosPerPoint?: number;
}

interface LOTOProcedure {
  id: string;
  points: LOTOPoint[];
  sequence: string[];
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  metadata: {
    projectNumber: string;
    location: string;
    supervisor: string;
    startTime: string;
    estimatedDuration: number;
  };
}

interface LOTOPoint {
  id: string;
  equipmentName: string;
  location: string;
  energyType: EnergyType;
  isolationMethod: string;
  lockNumber?: string;
  appliedBy?: string;
  verifiedBy?: string;
  status: LOTOStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  photos: LOTOPhoto[];
  coordinates?: Coordinates;
  notes?: string;
  timestamp?: string;
}

interface LOTOPhoto {
  id: string;
  url: string;
  thumbnail: string;
  lockState: LockState;
  photoType: PhotoType;
  timestamp: string;
  gpsLocation?: Coordinates;
  description: { fr: string; en: string };
  mandatory: boolean;
  validated: boolean;
  validatedBy?: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  deviceInfo?: string;
  cameraSettings?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    flash?: boolean;
  };
  quality: number; // 0-100
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
}

type EnergyType = 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical' | 'gravitational';
type LOTOStatus = 'pending' | 'isolated' | 'verified' | 'completed' | 'removed';
type LockState = 'before_isolation' | 'during_isolation' | 'isolated' | 'verification' | 'removal' | 'completed';
type PhotoType = 'isolation' | 'verification' | 'lock_application' | 'energy_test' | 'completion' | 'incident';

// =================== TRADUCTIONS ===================

const translations = {
  fr: {
    title: "🔒 Carrousel Photo LOTO",
    subtitle: "Documentation photographique des procédures de verrouillage",
    
    // États LOTO
    lotoStatus: {
      pending: "En attente",
      isolated: "Isolé", 
      verified: "Vérifié",
      completed: "Complété",
      removed: "Retiré"
    },
    
    // États de verrouillage
    lockStates: {
      before_isolation: "Avant isolation",
      during_isolation: "Pendant isolation", 
      isolated: "Isolé",
      verification: "Vérification",
      removal: "Retrait",
      completed: "Terminé"
    },
    
    // Types de photos
    photoTypes: {
      isolation: "Isolation",
      verification: "Vérification",
      lock_application: "Application cadenas",
      energy_test: "Test énergétique",
      completion: "Finalisation",
      incident: "Incident"
    },
    
    // Types d'énergie
    energyTypes: {
      electrical: "⚡ Électrique",
      mechanical: "⚙️ Mécanique", 
      hydraulic: "🔧 Hydraulique",
      pneumatic: "💨 Pneumatique",
      thermal: "🔥 Thermique",
      chemical: "🧪 Chimique",
      gravitational: "⬇️ Gravitationnelle"
    },
    
    // Priorités
    priorities: {
      critical: "🔴 Critique",
      high: "🟠 Élevée",
      medium: "🟡 Moyenne", 
      low: "🟢 Faible"
    },
    
    // Actions
    actions: {
      takePhoto: "Prendre Photo",
      uploadPhoto: "Télécharger Photo",
      validatePhoto: "Valider Photo",
      deletePhoto: "Supprimer Photo",
      viewDetails: "Voir Détails",
      editPhoto: "Modifier Photo",
      downloadPhoto: "Télécharger Photo",
      rotatePhoto: "Faire Pivoter",
      zoomIn: "Agrandir",
      zoomOut: "Réduire",
      previousPhoto: "Photo Précédente",
      nextPhoto: "Photo Suivante",
      closeViewer: "Fermer Visionneuse",
      addPoint: "Ajouter Point",
      editPoint: "Modifier Point",
      deletePoint: "Supprimer Point",
      validateProcedure: "Valider Procédure",
      startProcedure: "Démarrer Procédure",
      completeProcedure: "Finaliser Procédure"
    },
    
    // Informations
    info: {
      equipmentName: "Nom Équipement",
      location: "Emplacement",
      energyType: "Type Énergie",
      isolationMethod: "Méthode Isolation",
      lockNumber: "No. Cadenas",
      appliedBy: "Appliqué par",
      verifiedBy: "Vérifié par",
      status: "Statut",
      priority: "Priorité",
      timestamp: "Horodatage",
      gpsLocation: "Localisation GPS",
      description: "Description",
      notes: "Notes",
      mandatory: "Obligatoire",
      optional: "Optionnel",
      validated: "Validée",
      pending: "En attente",
      sequence: "Séquence",
      metadata: "Métadonnées",
      fileSize: "Taille Fichier",
      resolution: "Résolution",
      quality: "Qualité"
    },
    
    // Messages
    messages: {
      noPhotos: "Aucune photo disponible",
      noPointsSelected: "Aucun point LOTO sélectionné",
      photoRequired: "Photo requise pour continuer",
      procedureIncomplete: "Procédure incomplète",
      allPhotosValidated: "Toutes les photos validées",
      gpsNotAvailable: "GPS non disponible",
      cameraPermissionDenied: "Permission caméra refusée",
      uploadSuccess: "Photo téléchargée avec succès",
      uploadError: "Erreur lors du téléchargement",
      validationSuccess: "Photo validée",
      procedureCompleted: "Procédure LOTO complétée",
      confirmDelete: "Confirmer la suppression de cette photo ?",
      confirmDeletePoint: "Confirmer la suppression de ce point LOTO ?"
    },
    
    // Navigation
    navigation: {
      overview: "Vue d'ensemble",
      points: "Points LOTO",
      photos: "Photos",
      sequence: "Séquence",
      validation: "Validation"
    }
  },
  
  en: {
    title: "🔒 LOTO Photo Carousel",
    subtitle: "Photographic documentation of lockout procedures",
    
    // LOTO status
    lotoStatus: {
      pending: "Pending",
      isolated: "Isolated",
      verified: "Verified", 
      completed: "Completed",
      removed: "Removed"
    },
    
    // Lock states
    lockStates: {
      before_isolation: "Before isolation",
      during_isolation: "During isolation",
      isolated: "Isolated",
      verification: "Verification",
      removal: "Removal",
      completed: "Completed"
    },
    
    // Photo types
    photoTypes: {
      isolation: "Isolation",
      verification: "Verification",
      lock_application: "Lock application",
      energy_test: "Energy test",
      completion: "Completion",
      incident: "Incident"
    },
    
    // Energy types
    energyTypes: {
      electrical: "⚡ Electrical",
      mechanical: "⚙️ Mechanical",
      hydraulic: "🔧 Hydraulic", 
      pneumatic: "💨 Pneumatic",
      thermal: "🔥 Thermal",
      chemical: "🧪 Chemical",
      gravitational: "⬇️ Gravitational"
    },
    
    // Priorities
    priorities: {
      critical: "🔴 Critical",
      high: "🟠 High",
      medium: "🟡 Medium",
      low: "🟢 Low"
    },
    
    // Actions
    actions: {
      takePhoto: "Take Photo",
      uploadPhoto: "Upload Photo", 
      validatePhoto: "Validate Photo",
      deletePhoto: "Delete Photo",
      viewDetails: "View Details",
      editPhoto: "Edit Photo",
      downloadPhoto: "Download Photo",
      rotatePhoto: "Rotate Photo",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      previousPhoto: "Previous Photo",
      nextPhoto: "Next Photo",
      closeViewer: "Close Viewer",
      addPoint: "Add Point",
      editPoint: "Edit Point",
      deletePoint: "Delete Point",
      validateProcedure: "Validate Procedure",
      startProcedure: "Start Procedure",
      completeProcedure: "Complete Procedure"
    },
    
    // Information
    info: {
      equipmentName: "Equipment Name",
      location: "Location",
      energyType: "Energy Type",
      isolationMethod: "Isolation Method",
      lockNumber: "Lock Number",
      appliedBy: "Applied by",
      verifiedBy: "Verified by",
      status: "Status",
      priority: "Priority",
      timestamp: "Timestamp",
      gpsLocation: "GPS Location",
      description: "Description",
      notes: "Notes",
      mandatory: "Mandatory",
      optional: "Optional",
      validated: "Validated",
      pending: "Pending",
      sequence: "Sequence",
      metadata: "Metadata",
      fileSize: "File Size",
      resolution: "Resolution",
      quality: "Quality"
    },
    
    // Messages
    messages: {
      noPhotos: "No photos available",
      noPointsSelected: "No LOTO points selected",
      photoRequired: "Photo required to continue",
      procedureIncomplete: "Procedure incomplete",
      allPhotosValidated: "All photos validated",
      gpsNotAvailable: "GPS not available",
      cameraPermissionDenied: "Camera permission denied",
      uploadSuccess: "Photo uploaded successfully",
      uploadError: "Error uploading photo",
      validationSuccess: "Photo validated",
      procedureCompleted: "LOTO procedure completed",
      confirmDelete: "Confirm deletion of this photo?",
      confirmDeletePoint: "Confirm deletion of this LOTO point?"
    },
    
    // Navigation
    navigation: {
      overview: "Overview",
      points: "LOTO Points",
      photos: "Photos",
      sequence: "Sequence",
      validation: "Validation"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================

const LOTOPhotoCarousel: React.FC<LOTOPhotoCarouselProps> = ({
  lotoProcedure,
  onUpdateProcedure,
  language = 'fr',
  editable = true,
  compactMode = false,
  maxPhotosPerPoint = 10
}) => {
  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoViewerRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language];
  
  // =================== CALCULS ===================
  const totalPhotos = lotoProcedure.points.reduce((sum, point) => sum + point.photos.length, 0);
  const validatedPhotos = lotoProcedure.points.reduce((sum, point) => 
    sum + point.photos.filter(photo => photo.validated).length, 0
  );
  const mandatoryPhotos = lotoProcedure.points.reduce((sum, point) => 
    sum + point.photos.filter(photo => photo.mandatory).length, 0
  );
  const completedPoints = lotoProcedure.points.filter(point => point.status === 'completed').length;
  
  // Point sélectionné
  const currentPoint = selectedPoint ? lotoProcedure.points.find(p => p.id === selectedPoint) : null;
  const currentPhotos = currentPoint?.photos || [];
  
  // =================== HANDLERS ===================
  
  const handlePhotoCapture = useCallback(async () => {
    if (!currentPoint || !editable) return;
    
    try {
      setIsUploading(true);
      
      // Demander permission caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Caméra arrière préférée
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Créer élément video temporaire
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Attendre que la vidéo soit prête
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      // Créer canvas pour capture
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Capturer frame
      ctx.drawImage(video, 0, 0);
      
      // Arrêter stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convertir en blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
      });
      
      if (!blob) throw new Error('Failed to create image blob');
      
      // Obtenir géolocalisation
      const coordinates = await getCurrentLocation();
      
      // Créer nouvelle photo
      const newPhoto: LOTOPhoto = {
        id: `photo-${Date.now()}`,
        url: URL.createObjectURL(blob),
        thumbnail: URL.createObjectURL(blob), // En production, créer vraie miniature
        lockState: determineLockState(currentPoint.status),
        photoType: 'isolation', // À déterminer selon contexte
        timestamp: new Date().toISOString(),
        gpsLocation: coordinates,
        description: { fr: `Photo ${currentPoint.equipmentName}`, en: `Photo ${currentPoint.equipmentName}` },
        mandatory: true,
        validated: false,
        metadata: {
          fileName: `loto-${currentPoint.id}-${Date.now()}.jpg`,
          fileSize: blob.size,
          mimeType: 'image/jpeg',
          deviceInfo: navigator.userAgent,
          quality: 80
        }
      };
      
      // Mettre à jour point
      const updatedPoints = lotoProcedure.points.map(point =>
        point.id === currentPoint.id
          ? { ...point, photos: [...point.photos, newPhoto] }
          : point
      );
      
      onUpdateProcedure({
        ...lotoProcedure,
        points: updatedPoints
      });
      
      setIsUploading(false);
      
    } catch (error) {
      console.error('Erreur capture photo:', error);
      setIsUploading(false);
      alert(t.messages.cameraPermissionDenied);
    }
  }, [currentPoint, editable, lotoProcedure, onUpdateProcedure, t.messages.cameraPermissionDenied]);
  
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!currentPoint || !editable || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = files[0];
      
      // Validation
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        throw new Error('File too large');
      }
      
      // Créer URL
      const url = URL.createObjectURL(file);
      
      // Obtenir géolocalisation
      const coordinates = await getCurrentLocation();
      
      // Créer photo
      const newPhoto: LOTOPhoto = {
        id: `photo-${Date.now()}`,
        url,
        thumbnail: url,
        lockState: determineLockState(currentPoint.status),
        photoType: 'isolation',
        timestamp: new Date().toISOString(),
        gpsLocation: coordinates,
        description: { fr: `Photo téléchargée`, en: `Uploaded photo` },
        mandatory: false,
        validated: false,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          quality: 90
        }
      };
      
      // Mettre à jour
      const updatedPoints = lotoProcedure.points.map(point =>
        point.id === currentPoint.id
          ? { ...point, photos: [...point.photos, newPhoto] }
          : point
      );
      
      onUpdateProcedure({
        ...lotoProcedure,
        points: updatedPoints
      });
      
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(t.messages.uploadError);
    } finally {
      setIsUploading(false);
    }
  }, [currentPoint, editable, lotoProcedure, onUpdateProcedure, t.messages.uploadError]);
  
  const validatePhoto = (photoId: string) => {
    if (!currentPoint || !editable) return;
    
    const updatedPoints = lotoProcedure.points.map(point =>
      point.id === currentPoint.id
        ? {
            ...point,
            photos: point.photos.map(photo =>
              photo.id === photoId
                ? { ...photo, validated: true, validatedBy: 'Current User' }
                : photo
            )
          }
        : point
    );
    
    onUpdateProcedure({
      ...lotoProcedure,
      points: updatedPoints
    });
  };
  
  const deletePhoto = (photoId: string) => {
    if (!currentPoint || !editable) return;
    
    if (!confirm(t.messages.confirmDelete)) return;
    
    const updatedPoints = lotoProcedure.points.map(point =>
      point.id === currentPoint.id
        ? {
            ...point,
            photos: point.photos.filter(photo => photo.id !== photoId)
          }
        : point
    );
    
    onUpdateProcedure({
      ...lotoProcedure,
      points: updatedPoints
    });
  };
  
  const openPhotoViewer = (photoId: string) => {
    const photoIndex = currentPhotos.findIndex(p => p.id === photoId);
    setCurrentPhotoIndex(photoIndex);
    setSelectedPhoto(photoId);
    setShowPhotoViewer(true);
    setZoom(1);
    setRotation(0);
  };
  
  const navigatePhotos = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else if (direction === 'next' && currentPhotoIndex < currentPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };
  
  // =================== UTILITAIRES ===================
  
  const getCurrentLocation = (): Promise<Coordinates | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined
          });
        },
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };
  
  const determineLockState = (pointStatus: LOTOStatus): LockState => {
    switch (pointStatus) {
      case 'pending': return 'before_isolation';
      case 'isolated': return 'isolated';
      case 'verified': return 'verification';
      case 'completed': return 'completed';
      case 'removed': return 'removal';
      default: return 'before_isolation';
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatCoordinates = (coords?: Coordinates): string => {
    if (!coords) return 'N/A';
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };
  
  // =================== RENDU ===================
  
  return (
    <>
      {/* Styles CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .loto-carousel-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(100, 116, 139, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .loto-header {
            background: rgba(239, 68, 68, 0.1);
            border-bottom: 1px solid rgba(239, 68, 68, 0.3);
            padding: 20px;
          }
          
          .loto-title {
            color: #ef4444;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .loto-subtitle {
            color: #dc2626;
            margin: 0 0 16px 0;
            font-size: 14px;
          }
          
          .loto-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
          }
          
          .loto-stat {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            border: 1px solid rgba(239, 68, 68, 0.2);
          }
          
          .loto-stat-value {
            font-size: 18px;
            font-weight: 800;
            color: #ef4444;
            margin-bottom: 4px;
          }
          
          .loto-stat-label {
            font-size: 10px;
            color: #dc2626;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .loto-tabs {
            display: flex;
            background: rgba(15, 23, 42, 0.8);
            border-bottom: 1px solid rgba(100, 116, 139, 0.3);
            overflow-x: auto;
          }
          
          .loto-tab {
            padding: 12px 16px;
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid transparent;
          }
          
          .loto-tab.active {
            color: #ef4444;
            border-bottom-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .loto-tab:hover {
            color: #f87171;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .loto-content {
            padding: 20px;
            min-height: 400px;
          }
          
          .points-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
          }
          
          .point-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .point-card:hover {
            border-color: rgba(239, 68, 68, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.1);
          }
          
          .point-card.selected {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .point-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          
          .point-name {
            color: #e2e8f0;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          .point-location {
            color: #94a3b8;
            font-size: 13px;
            margin: 0;
          }
          
          .point-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .point-status.pending {
            background: rgba(107, 114, 128, 0.2);
            color: #6b7280;
          }
          
          .point-status.isolated {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
          }
          
          .point-status.verified {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
          }
          
          .point-status.completed {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }
          
          .point-photos-preview {
            display: flex;
            gap: 4px;
            margin-top: 12px;
            overflow-x: auto;
          }
          
          .photo-thumbnail {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            object-fit: cover;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
          
          .photo-thumbnail:hover {
            transform: scale(1.1);
            border-color: #ef4444;
          }
          
          .photo-thumbnail.validated {
            border-color: #22c55e;
            box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.3);
          }
          
          .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }
          
          .photo-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .photo-card:hover {
            border-color: rgba(239, 68, 68, 0.5);
            transform: translateY(-2px);
          }
          
          .photo-card.validated {
            border-color: #22c55e;
          }
          
          .photo-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
            cursor: pointer;
          }
          
          .photo-info {
            padding: 12px;
          }
          
          .photo-title {
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 8px 0;
          }
          
          .photo-metadata {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .photo-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 12px;
          }
          
          .photo-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .photo-viewer {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          
          .photo-viewer-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .photo-viewer-image {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
          
          .photo-viewer-controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
          }
          
          .photo-viewer-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .photo-viewer-nav:hover {
            background: rgba(0, 0, 0, 0.8);
            border-color: rgba(255, 255, 255, 0.4);
          }
          
          .photo-viewer-nav.prev {
            left: 20px;
          }
          
          .photo-viewer-nav.next {
            right: 20px;
          }
          
          .photo-viewer-info {
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            max-width: 400px;
          }
          
          .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }
          
          .btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid;
            background: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-primary {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
          
          .btn-primary:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-success {
            border-color: #22c55e;
            color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
          }
          
          .btn-success:hover {
            background: rgba(34, 197, 94, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-warning {
            border-color: #f59e0b;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
          
          .btn-danger {
            border-color: #dc2626;
            color: #dc2626;
            background: rgba(220, 38, 38, 0.1);
          }
          
          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .file-drop-zone {
            border: 2px dashed rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .file-drop-zone:hover {
            border-color: rgba(239, 68, 68, 0.5);
            background: rgba(239, 68, 68, 0.1);
          }
          
          .file-drop-zone.dragover {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .loto-stats {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .points-grid {
              grid-template-columns: 1fr;
            }
            
            .photos-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }
            
            .photo-viewer-controls {
              position: static;
              margin-bottom: 16px;
            }
            
            .action-buttons {
              justify-content: center;
            }
          }
        `
      }} />

      <div className="loto-carousel-container">
        {/* Header */}
        <div className="loto-header">
          <h3 className="loto-title">
            <Lock size={24} />
            {t.title}
          </h3>
          <p className="loto-subtitle">{t.subtitle}</p>
          
          <div className="loto-stats">
            <div className="loto-stat">
              <div className="loto-stat-value">{lotoProcedure.points.length}</div>
              <div className="loto-stat-label">Points</div>
            </div>
            <div className="loto-stat">
              <div className="loto-stat-value">{totalPhotos}</div>
              <div className="loto-stat-label">Photos</div>
            </div>
            <div className="loto-stat">
              <div className="loto-stat-value">{validatedPhotos}/{mandatoryPhotos}</div>
              <div className="loto-stat-label">Validées</div>
            </div>
            <div className="loto-stat">
              <div className="loto-stat-value">{completedPoints}</div>
              <div className="loto-stat-label">Complétés</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="loto-tabs">
          {[
            { id: 'overview', icon: Eye, label: t.navigation.overview },
            { id: 'points', icon: Lock, label: t.navigation.points },
            { id: 'photos', icon: Camera, label: t.navigation.photos },
            { id: 'sequence', icon: CheckCircle, label: t.navigation.sequence }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`loto-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu */}
        <div className="loto-content">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div>
              <div className="action-buttons">
                {editable && (
                  <>
                    <button className="btn btn-primary" onClick={handlePhotoCapture} disabled={isUploading}>
                      <Camera size={16} />
                      {t.actions.takePhoto}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload size={16} />
                      {t.actions.uploadPhoto}
                    </button>
                  </>
                )}
              </div>
              
              <div className="points-grid">
                {lotoProcedure.points.map(point => (
                  <div 
                    key={point.id}
                    className={`point-card ${selectedPoint === point.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPoint(point.id)}
                  >
                    <div className="point-header">
                      <div>
                        <h4 className="point-name">{point.equipmentName}</h4>
                        <p className="point-location">
                          <MapPin size={12} />
                          {point.location}
                        </p>
                      </div>
                      <div className={`point-status ${point.status}`}>
                        {t.lotoStatus[point.status]}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#94a3b8',
                        background: 'rgba(100, 116, 139, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {t.energyTypes[point.energyType]}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        color: point.priority === 'critical' ? '#ef4444' : point.priority === 'high' ? '#f59e0b' : '#22c55e',
                        background: `rgba(${point.priority === 'critical' ? '239, 68, 68' : point.priority === 'high' ? '245, 158, 11' : '34, 197, 94'}, 0.2)`,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {t.priorities[point.priority]}
                      </span>
                    </div>
                    
                    {point.photos.length > 0 && (
                      <div className="point-photos-preview">
                        {point.photos.slice(0, 5).map(photo => (
                          <img
                            key={photo.id}
                            src={photo.thumbnail}
                            alt={photo.description[language]}
                            className={`photo-thumbnail ${photo.validated ? 'validated' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPoint(point.id);
                              openPhotoViewer(photo.id);
                            }}
                          />
                        ))}
                        {point.photos.length > 5 && (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            background: 'rgba(100, 116, 139, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#94a3b8',
                            fontWeight: '600'
                          }}>
                            +{point.photos.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Points LOTO */}
          {activeTab === 'points' && currentPoint && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#e2e8f0', margin: '0 0 8px 0' }}>
                  {currentPoint.equipmentName}
                </h4>
                <p style={{ color: '#94a3b8', margin: '0 0 16px 0' }}>
                  {currentPoint.location} • {t.energyTypes[currentPoint.energyType]}
                </p>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{t.info.status}: </span>
                    <span className={`point-status ${currentPoint.status}`}>
                      {t.lotoStatus[currentPoint.status]}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{t.info.priority}: </span>
                    <span style={{ color: '#e2e8f0', fontSize: '12px' }}>
                      {t.priorities[currentPoint.priority]}
                    </span>
                  </div>
                  {currentPoint.lockNumber && (
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{t.info.lockNumber}: </span>
                      <span style={{ color: '#e2e8f0', fontSize: '12px' }}>
                        {currentPoint.lockNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="action-buttons">
                {editable && (
                  <>
                    <button className="btn btn-primary" onClick={handlePhotoCapture} disabled={isUploading}>
                      <Camera size={16} />
                      {t.actions.takePhoto}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload size={16} />
                      {t.actions.uploadPhoto}
                    </button>
                  </>
                )}
              </div>
              
              <div className="photos-grid">
                {currentPhotos.map(photo => (
                  <div key={photo.id} className={`photo-card ${photo.validated ? 'validated' : ''}`}>
                    <img
                      src={photo.url}
                      alt={photo.description[language]}
                      className="photo-image"
                      onClick={() => openPhotoViewer(photo.id)}
                    />
                    <div className="photo-info">
                      <h5 className="photo-title">
                        {photo.description[language]}
                      </h5>
                      
                      <div className="photo-metadata">
                        <div className="photo-meta-item">
                          <Clock size={12} />
                          {new Date(photo.timestamp).toLocaleString()}
                        </div>
                        {photo.gpsLocation && (
                          <div className="photo-meta-item">
                            <MapPin size={12} />
                            {formatCoordinates(photo.gpsLocation)}
                          </div>
                        )}
                        <div className="photo-meta-item">
                          <Camera size={12} />
                          {formatFileSize(photo.metadata.fileSize)}
                        </div>
                        <div className="photo-meta-item">
                          {photo.validated ? (
                            <>
                              <CheckCircle size={12} style={{ color: '#22c55e' }} />
                              <span style={{ color: '#22c55e' }}>{t.info.validated}</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
                              <span style={{ color: '#f59e0b' }}>{t.info.pending}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {editable && (
                        <div className="photo-actions">
                          {!photo.validated && (
                            <button 
                              className="btn btn-success"
                              onClick={() => validatePhoto(photo.id)}
                            >
                              <CheckCircle size={12} />
                              {t.actions.validatePhoto}
                            </button>
                          )}
                          <button 
                            className="btn btn-danger"
                            onClick={() => deletePhoto(photo.id)}
                          >
                            <Trash2 size={12} />
                            {t.actions.deletePhoto}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {currentPhotos.length === 0 && (
                  <div style={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280'
                  }}>
                    <Camera size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>{t.messages.noPhotos}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {activeTab === 'photos' && (
            <div>
              <div className="photos-grid">
                {lotoProcedure.points.flatMap(point => 
                  point.photos.map(photo => ({ ...photo, pointName: point.equipmentName, pointId: point.id }))
                ).map(photo => (
                  <div key={photo.id} className={`photo-card ${photo.validated ? 'validated' : ''}`}>
                    <img
                      src={photo.url}
                      alt={photo.description[language]}
                      className="photo-image"
                      onClick={() => {
                        setSelectedPoint(photo.pointId);
                        openPhotoViewer(photo.id);
                      }}
                    />
                    <div className="photo-info">
                      <h5 className="photo-title">
                        {photo.pointName}
                      </h5>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 8px 0' }}>
                        {photo.description[language]}
                      </p>
                      
                      <div className="photo-metadata">
                        <div className="photo-meta-item">
                          <Clock size={12} />
                          {new Date(photo.timestamp).toLocaleString()}
                        </div>
                        <div className="photo-meta-item">
                          {photo.validated ? (
                            <>
                              <CheckCircle size={12} style={{ color: '#22c55e' }} />
                              <span style={{ color: '#22c55e' }}>{t.info.validated}</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
                              <span style={{ color: '#f59e0b' }}>{t.info.pending}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {totalPhotos === 0 && (
                  <div style={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280'
                  }}>
                    <Camera size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>{t.messages.noPhotos}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Séquence */}
          {activeTab === 'sequence' && (
            <div>
              <h4 style={{ color: '#e2e8f0', marginBottom: '20px' }}>
                {t.navigation.sequence}
              </h4>
              
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <CheckCircle size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} />
                <h4 style={{ color: '#3b82f6', margin: '0 0 8px 0' }}>
                  {t.navigation.sequence}
                </h4>
                <p style={{ color: '#2563eb', margin: 0, fontSize: '14px' }}>
                  La séquence LOTO automatique sera disponible dans la prochaine mise à jour.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />

        {/* Visionneuse photo */}
        {showPhotoViewer && currentPhotos[currentPhotoIndex] && (
          <div className="photo-viewer">
            <div className="photo-viewer-content">
              <div className="photo-viewer-controls">
                <button 
                  className="btn btn-primary"
                  onClick={() => setZoom(zoom * 1.2)}
                  disabled={zoom >= 3}
                >
                  <ZoomIn size={16} />
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setZoom(zoom / 1.2)}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut size={16} />
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setRotation(rotation + 90)}
                >
                  <RotateCw size={16} />
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPhotoViewer(false)}
                >
                  <X size={16} />
                </button>
              </div>
              
              {currentPhotoIndex > 0 && (
                <button 
                  className="photo-viewer-nav prev"
                  onClick={() => navigatePhotos('prev')}
                >
                  <ChevronLeft size={24} color="white" />
                </button>
              )}
              
              {currentPhotoIndex < currentPhotos.length - 1 && (
                <button 
                  className="photo-viewer-nav next"
                  onClick={() => navigatePhotos('next')}
                >
                  <ChevronRight size={24} color="white" />
                </button>
              )}
              
              <img
                src={currentPhotos[currentPhotoIndex].url}
                alt={currentPhotos[currentPhotoIndex].description[language]}
                className="photo-viewer-image"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`
                }}
              />
              
              <div className="photo-viewer-info">
                <h4 style={{ color: 'white', margin: '0 0 8px 0' }}>
                  {currentPhotos[currentPhotoIndex].description[language]}
                </h4>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  <div>
                    {t.info.timestamp}: {new Date(currentPhotos[currentPhotoIndex].timestamp).toLocaleString()}
                  </div>
                  {currentPhotos[currentPhotoIndex].gpsLocation && (
                    <div>
                      {t.info.gpsLocation}: {formatCoordinates(currentPhotos[currentPhotoIndex].gpsLocation)}
                    </div>
                  )}
                  <div>
                    {t.info.fileSize}: {formatFileSize(currentPhotos[currentPhotoIndex].metadata.fileSize)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LOTOPhotoCarousel;