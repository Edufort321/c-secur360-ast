// =================== SECTION 1: INTERFACES PHOTO CONFORMES PROVINCES CANADIENNES ===================
// À ajouter dans votre fichier Step4Permits.tsx après les interfaces existantes

// =================== IMPORTS SUPPLÉMENTAIRES ===================
import { ChevronLeft, ChevronRight, Upload, X, Camera, MapPin, Calendar, AlertCircle, CheckCircle, Eye, Download, Trash2, Grid, List } from 'lucide-react';

// =================== INTERFACE PHOTO CONFORME CANADA ===================
interface CanadianCompliancePhoto {
  id: string;
  url: string;
  name: string;
  timestamp: string;
  description: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    province: string;
    municipalityCode?: string;
    postalCode?: string;
  };
  compliance: {
    // === EXIGENCES FÉDÉRALES CANADA ===
    federalCompliant: boolean;
    workplaceSafetyAct: boolean; // Loi fédérale santé et sécurité au travail
    transportCanada: boolean; // Si transport de matières dangereuses
    environmentCanada: boolean; // Évaluations environnementales
    
    // === EXIGENCES PROVINCIALES SPÉCIFIQUES ===
    provincial: {
      QC: {
        CNESST_compliant: boolean; // Commission des normes, de l'équité, de la santé et de la sécurité du travail
        RSST_documentation: boolean; // Règlement sur la santé et la sécurité du travail
        municipal_permit_photo: boolean; // Photos permis municipaux obligatoires
        excavation_photo_required: boolean; // Photos excavation avant/pendant/après
        confined_space_documentation: boolean; // Documentation espace clos
        hot_work_safety_photos: boolean; // Photos sécurité travail à chaud
      };
      ON: {
        OHSA_compliant: boolean; // Occupational Health and Safety Act Ontario
        WSIB_documentation: boolean; // Workplace Safety and Insurance Board
        municipal_compliance: boolean; // Conformité municipale Ontario
        construction_safety_photos: boolean; // Photos sécurité construction
        electrical_safety_documentation: boolean; // Documentation sécurité électrique
      };
      BC: {
        WorkSafeBC_compliant: boolean; // WorkSafeBC exigences
        OHS_regulation_compliance: boolean; // Occupational Health and Safety Regulation
        environmental_permit_photo: boolean; // Photos permis environnementaux BC
        mining_safety_documentation: boolean; // Documentation sécurité minière
        forestry_safety_photos: boolean; // Photos sécurité forestière
      };
      AB: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act Alberta
        WCB_Alberta_compliance: boolean; // Workers' Compensation Board Alberta
        AER_documentation: boolean; // Alberta Energy Regulator documentation
        oil_gas_safety_photos: boolean; // Photos sécurité pétrole et gaz
        industrial_safety_compliance: boolean; // Conformité sécurité industrielle
      };
      SK: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act Saskatchewan
        WCB_Saskatchewan_compliance: boolean; // Workers' Compensation Board Saskatchewan
        environmental_compliance: boolean; // Conformité environnementale SK
        mining_potash_safety: boolean; // Sécurité mines de potasse
        agricultural_safety_documentation: boolean; // Documentation sécurité agricole
      };
      MB: {
        WSCC_compliant: boolean; // Workplace Safety and Health Manitoba
        WCB_Manitoba_compliance: boolean; // Workers Compensation Board Manitoba
        municipal_documentation: boolean; // Documentation municipale MB
        hydro_safety_compliance: boolean; // Conformité sécurité Manitoba Hydro
        mining_safety_photos: boolean; // Photos sécurité minière MB
      };
      NB: {
        OHSA_compliant: boolean; // Occupational Health and Safety Act New Brunswick
        WorkSafeNB_compliance: boolean; // WorkSafeNB compliance
        municipal_permit_compliance: boolean; // Conformité permis municipaux NB
        forestry_safety_documentation: boolean; // Documentation sécurité forestière
        fishing_industry_safety: boolean; // Sécurité industrie de la pêche
      };
      NS: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act Nova Scotia
        WCB_NovaScotia_compliance: boolean; // Workers' Compensation Board Nova Scotia
        environmental_documentation: boolean; // Documentation environnementale NS
        offshore_safety_compliance: boolean; // Conformité sécurité offshore
        mining_safety_documentation: boolean; // Documentation sécurité minière NS
      };
      PE: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act PEI
        WCB_PEI_compliance: boolean; // Workers Compensation Board PEI
        municipal_compliance: boolean; // Conformité municipale PEI
        agricultural_safety_photos: boolean; // Photos sécurité agricole
        tourism_safety_documentation: boolean; // Documentation sécurité tourisme
      };
      NL: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act Newfoundland
        WorkplaceNL_compliance: boolean; // WorkplaceNL compliance
        offshore_safety_compliance: boolean; // Conformité sécurité offshore Terre-Neuve
        fishing_industry_documentation: boolean; // Documentation industrie de la pêche
        oil_gas_offshore_safety: boolean; // Sécurité pétrole et gaz offshore
      };
      YT: {
        OHS_Act_compliant: boolean; // Occupational Health and Safety Act Yukon
        WSCC_compliance: boolean; // Workers' Safety and Compensation Commission
        territorial_documentation: boolean; // Documentation territoriale YT
        mining_safety_compliance: boolean; // Conformité sécurité minière Yukon
        environmental_protection_photos: boolean; // Photos protection environnementale
      };
      NT: {
        Safety_Act_compliant: boolean; // Safety Act Northwest Territories
        WSCC_compliance: boolean; // Workers' Safety and Compensation Commission
        territorial_environmental: boolean; // Environnemental territorial TNO
        mining_diamond_safety: boolean; // Sécurité mines de diamants
        arctic_conditions_documentation: boolean; // Documentation conditions arctiques
      };
      NU: {
        Safety_Act_compliant: boolean; // Safety Act Nunavut
        WSCC_compliance: boolean; // Workers' Safety and Compensation Commission
        territorial_compliance: boolean; // Conformité territoriale NU
        arctic_safety_documentation: boolean; // Documentation sécurité arctique
        inuit_traditional_safety: boolean; // Sécurité traditionnelle inuite
      };
    };
  };
  metadata: {
    fileSize: number;
    resolution: string;
    format: string;
    cameraInfo?: string;
    inspector?: string;
    permitNumber?: string;
    workOrderNumber?: string;
    gpsAccuracy?: string;
    weatherConditions?: string;
    lightingConditions?: string;
    safetyOfficer?: string;
  };
  required: boolean;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending-review' | 'requires-action';
  tags: string[]; // Tags pour faciliter la recherche
}

// =================== CONFIGURATION EXIGENCES PROVINCIALES ===================
const PROVINCIAL_PHOTO_REQUIREMENTS = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    mandatoryPhotos: [
      'before_work_site_condition',
      'during_work_safety_measures',
      'after_work_completion',
      'confined_space_entry_setup',
      'excavation_depth_measurement',
      'hot_work_fire_precautions'
    ],
    minimumResolution: '1920x1080',
    geotagging: true,
    inspector: true,
    documentation: 'Photos obligatoires selon RSST Art. 297-312 modifié 2023'
  },
  ON: {
    name: 'Ontario',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    mandatoryPhotos: [
      'workplace_hazard_identification',
      'safety_equipment_verification',
      'construction_safety_compliance',
      'electrical_safety_measures'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under OHSA Regulation 851'
  },
  BC: {
    name: 'Colombie-Britannique',
    authority: 'WorkSafeBC',
    mandatoryPhotos: [
      'worksite_safety_setup',
      'environmental_protection_measures',
      'fall_protection_systems',
      'machinery_safety_guards'
    ],
    minimumResolution: '1920x1080',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under WorkSafeBC Regulation'
  },
  AB: {
    name: 'Alberta',
    authority: 'Alberta Labour and Immigration',
    mandatoryPhotos: [
      'oil_gas_safety_measures',
      'industrial_safety_compliance',
      'confined_space_safety',
      'hazardous_material_handling'
    ],
    minimumResolution: '1920x1080',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Alberta OHS Act and AER regulations'
  },
  SK: {
    name: 'Saskatchewan',
    authority: 'Ministry of Labour Relations and Workplace Safety',
    mandatoryPhotos: [
      'mining_safety_measures',
      'agricultural_safety_compliance',
      'workplace_hazard_control'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Saskatchewan OHS Act'
  },
  MB: {
    name: 'Manitoba',
    authority: 'Workplace Safety and Health Division',
    mandatoryPhotos: [
      'workplace_safety_setup',
      'hydro_electrical_safety',
      'mining_safety_measures'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Manitoba Workplace Safety and Health Act'
  },
  NB: {
    name: 'Nouveau-Brunswick',
    authority: 'WorkSafeNB',
    mandatoryPhotos: [
      'forestry_safety_measures',
      'fishing_industry_safety',
      'general_workplace_safety'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under New Brunswick OHS Act'
  },
  NS: {
    name: 'Nouvelle-Écosse',
    authority: 'Labour Standards and Workplace Safety',
    mandatoryPhotos: [
      'offshore_safety_measures',
      'mining_safety_compliance',
      'workplace_hazard_identification'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Nova Scotia OHS Act'
  },
  PE: {
    name: 'Île-du-Prince-Édouard',
    authority: 'Workers Compensation Board of PEI',
    mandatoryPhotos: [
      'agricultural_safety_measures',
      'tourism_safety_compliance',
      'general_workplace_safety'
    ],
    minimumResolution: '1280x720',
    geotagging: false,
    inspector: true,
    documentation: 'Photos required under PEI OHS Act'
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador',
    authority: 'WorkplaceNL',
    mandatoryPhotos: [
      'offshore_oil_gas_safety',
      'fishing_industry_safety',
      'workplace_safety_measures'
    ],
    minimumResolution: '1920x1080',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Newfoundland OHS Act and offshore regulations'
  },
  YT: {
    name: 'Yukon',
    authority: 'Yukon Workers\' Safety and Compensation Commission',
    mandatoryPhotos: [
      'mining_safety_measures',
      'environmental_protection',
      'arctic_conditions_safety'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Yukon OHS Act'
  },
  NT: {
    name: 'Territoires du Nord-Ouest',
    authority: 'Workers\' Safety and Compensation Commission',
    mandatoryPhotos: [
      'diamond_mining_safety',
      'arctic_conditions_documentation',
      'environmental_protection_measures'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under NWT Safety Act'
  },
  NU: {
    name: 'Nunavut',
    authority: 'Workers\' Safety and Compensation Commission',
    mandatoryPhotos: [
      'arctic_safety_documentation',
      'traditional_safety_practices',
      'environmental_protection'
    ],
    minimumResolution: '1280x720',
    geotagging: true,
    inspector: true,
    documentation: 'Photos required under Nunavut Safety Act'
  }
};
// =================== SECTION 2: COMPOSANT CARROUSEL PHOTO PREMIUM ===================
// À ajouter après la Section 1

// =================== PROPS INTERFACE ===================
interface CanadianPhotoCarouselProps {
  photos: CanadianCompliancePhoto[];
  currentIndex: number;
  province: string;
  permitType: string;
  onNavigate: (index: number) => void;
  onPhotoUpload: (files: FileList) => void;
  onPhotoRemove: (photoId: string) => void;
  onPhotoUpdate: (photoId: string, updates: Partial<CanadianCompliancePhoto>) => void;
  onComplianceCheck: (photoId: string) => void;
  viewMode: 'carousel' | 'grid' | 'list';
  onViewModeChange: (mode: 'carousel' | 'grid' | 'list') => void;
  language: 'fr' | 'en';
}

// =================== COMPOSANT CARROUSEL PRINCIPAL ===================
const CanadianPhotoCarousel: React.FC<CanadianPhotoCarouselProps> = ({
  photos,
  currentIndex,
  province,
  permitType,
  onNavigate,
  onPhotoUpload,
  onPhotoRemove,
  onPhotoUpdate,
  onComplianceCheck,
  viewMode,
  onViewModeChange,
  language
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'compliant' | 'non-compliant' | 'pending'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // =================== CONFIGURATION PROVINCIALE ===================
  const provinceConfig = PROVINCIAL_PHOTO_REQUIREMENTS[province as keyof typeof PROVINCIAL_PHOTO_REQUIREMENTS];
  const currentPhoto = photos[currentIndex];

  // =================== TRADUCTIONS ===================
  const texts = {
    fr: {
      title: 'Galerie Photos Conformes',
      addPhotos: 'Ajouter Photos',
      dragDrop: 'Glissez vos photos ici ou cliquez pour parcourir',
      viewModes: {
        carousel: 'Carrousel',
        grid: 'Grille',
        list: 'Liste'
      },
      filters: {
        all: 'Toutes',
        compliant: 'Conformes',
        nonCompliant: 'Non conformes',
        pending: 'En attente'
      },
      compliance: {
        federal: 'Fédéral',
        provincial: 'Provincial',
        municipal: 'Municipal',
        status: 'Statut de conformité',
        inspector: 'Inspecteur',
        required: 'Obligatoire',
        optional: 'Optionnel'
      },
      actions: {
        download: 'Télécharger',
        remove: 'Supprimer',
        edit: 'Modifier',
        check: 'Vérifier conformité',
        fullscreen: 'Plein écran'
      },
      metadata: {
        location: 'Localisation',
        timestamp: 'Horodatage',
        fileSize: 'Taille fichier',
        resolution: 'Résolution',
        format: 'Format'
      }
    },
    en: {
      title: 'Compliant Photo Gallery',
      addPhotos: 'Add Photos',
      dragDrop: 'Drag your photos here or click to browse',
      viewModes: {
        carousel: 'Carousel',
        grid: 'Grid',
        list: 'List'
      },
      filters: {
        all: 'All',
        compliant: 'Compliant',
        nonCompliant: 'Non-compliant',
        pending: 'Pending'
      },
      compliance: {
        federal: 'Federal',
        provincial: 'Provincial',
        municipal: 'Municipal',
        status: 'Compliance Status',
        inspector: 'Inspector',
        required: 'Required',
        optional: 'Optional'
      },
      actions: {
        download: 'Download',
        remove: 'Remove',
        edit: 'Edit',
        check: 'Check Compliance',
        fullscreen: 'Fullscreen'
      },
      metadata: {
        location: 'Location',
        timestamp: 'Timestamp',
        fileSize: 'File Size',
        resolution: 'Resolution',
        format: 'Format'
      }
    }
  };

  const t = texts[language];

  // =================== FONCTIONS UTILITAIRES ===================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onPhotoUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onPhotoUpload(files);
    }
  };

  const getComplianceStatus = (photo: CanadianCompliancePhoto) => {
    const federalCompliant = photo.compliance.federalCompliant;
    const provincialCompliant = photo.compliance.provincial[province as keyof typeof photo.compliance.provincial];
    
    if (federalCompliant && provincialCompliant) {
      return 'compliant';
    } else if (!federalCompliant || !provincialCompliant) {
      return 'non-compliant';
    }
    return 'pending';
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#22c55e';
      case 'non-compliant': return '#ef4444';
      case 'pending': return '#eab308';
      default: return '#6b7280';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  // =================== NAVIGATION CLAVIER ===================
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (photos.length === 0) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate(Math.max(0, currentIndex - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate(Math.min(photos.length - 1, currentIndex + 1));
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
          }
          break;
      }
    };

    if (isFullscreen || viewMode === 'carousel') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [currentIndex, photos.length, isFullscreen, viewMode, onNavigate]);

  // =================== FILTRAGE PHOTOS ===================
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const matchesTag = !filterTag || photo.tags.some(tag => 
        tag.toLowerCase().includes(filterTag.toLowerCase())
      );
      
      const status = getComplianceStatus(photo);
      const matchesCompliance = complianceFilter === 'all' || 
        (complianceFilter === 'compliant' && status === 'compliant') ||
        (complianceFilter === 'non-compliant' && status === 'non-compliant') ||
        (complianceFilter === 'pending' && status === 'pending');
      
      return matchesTag && matchesCompliance;
    });
  }, [photos, filterTag, complianceFilter]);

  // =================== RENDU ZONE UPLOAD ===================
  const renderUploadZone = () => (
    <div 
      className={`photo-upload-zone ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload size={48} className="upload-icon" />
      <h3 className="upload-title">{t.addPhotos}</h3>
      <p className="upload-subtitle">{t.dragDrop}</p>
      
      {/* Exigences provinciales */}
      {provinceConfig && (
        <div className="provincial-requirements">
          <div className="requirement-badge">
            📍 {provinceConfig.name}
          </div>
          <div className="requirement-details">
            <span>🏛️ {provinceConfig.authority}</span>
            <span>📐 Min: {provinceConfig.minimumResolution}</span>
            {provinceConfig.geotagging && <span>📍 Géolocalisation requise</span>}
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );

  // =================== RENDU HEADER CONTRÔLES ===================
  const renderHeader = () => (
    <div className="carousel-header">
      <div className="header-left">
        <h2 className="gallery-title">
          📸 {t.title} ({filteredPhotos.length})
        </h2>
        <div className="province-badge">
          🍁 {provinceConfig?.name || province}
        </div>
      </div>
      
      <div className="header-controls">
        {/* Filtres */}
        <div className="filter-group">
          <input
            type="text"
            placeholder="🏷️ Filtrer par tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-input"
          />
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">{t.filters.all}</option>
            <option value="compliant">{t.filters.compliant}</option>
            <option value="non-compliant">{t.filters.nonCompliant}</option>
            <option value="pending">{t.filters.pending}</option>
          </select>
        </div>
        
        {/* Modes d'affichage */}
        <div className="view-mode-group">
          {(['carousel', 'grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`view-mode-btn ${viewMode === mode ? 'active' : ''}`}
              title={t.viewModes[mode]}
            >
              {mode === 'carousel' && '🎠'}
              {mode === 'grid' && <Grid size={16} />}
              {mode === 'list' && <List size={16} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // =================== RENDU CARROUSEL ===================
  const renderCarousel = () => {
    if (filteredPhotos.length === 0) {
      return renderUploadZone();
    }

    const photo = filteredPhotos[currentIndex];
    if (!photo) return null;

    const complianceStatus = getComplianceStatus(photo);
    const complianceColor = getComplianceColor(complianceStatus);

    return (
      <div className="carousel-container" ref={carouselRef}>
        {/* Navigation */}
        <button
          className="nav-btn nav-prev"
          onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          className="nav-btn nav-next"
          onClick={() => onNavigate(Math.min(filteredPhotos.length - 1, currentIndex + 1))}
          disabled={currentIndex === filteredPhotos.length - 1}
        >
          <ChevronRight size={24} />
        </button>

        {/* Image principale */}
        <div className="main-image-container">
          <img
            src={photo.url}
            alt={photo.description}
            className="main-image"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Overlay conformité */}
          <div className="compliance-overlay">
            <div 
              className="compliance-indicator"
              style={{ backgroundColor: complianceColor }}
            >
              {complianceStatus === 'compliant' && <CheckCircle size={16} />}
              {complianceStatus === 'non-compliant' && <AlertCircle size={16} />}
              {complianceStatus === 'pending' && <Clock size={16} />}
              <span>{t.filters[complianceStatus as keyof typeof t.filters]}</span>
            </div>
            
            {photo.required && (
              <div className="required-indicator">
                ⚠️ {t.compliance.required}
              </div>
            )}
          </div>
          
          {/* Contrôles zoom */}
          <div className="zoom-controls">
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            >
              -
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button
              className="zoom-btn"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
            >
              +
            </button>
          </div>
        </div>

        {/* Métadonnées photo */}
        <div className="photo-metadata">
          <div className="metadata-section">
            <h4>📋 {photo.name}</h4>
            <p>{photo.description}</p>
            
            <div className="metadata-grid">
              <div className="metadata-item">
                <MapPin size={14} />
                <span>{photo.location.address || `${photo.location.latitude}, ${photo.location.longitude}`}</span>
              </div>
              <div className="metadata-item">
                <Calendar size={14} />
                <span>{new Date(photo.timestamp).toLocaleString()}</span>
              </div>
              <div className="metadata-item">
                <Eye size={14} />
                <span>{photo.metadata.resolution} • {formatFileSize(photo.metadata.fileSize)}</span>
              </div>
            </div>
          </div>
          
          {/* Conformité détaillée */}
          <div className="compliance-section">
            <h5>🛡️ {t.compliance.status}</h5>
            <div className="compliance-details">
              <div className={`compliance-item ${photo.compliance.federalCompliant ? 'compliant' : 'non-compliant'}`}>
                🇨🇦 {t.compliance.federal}
                {photo.compliance.federalCompliant ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              </div>
              <div className={`compliance-item ${complianceStatus === 'compliant' ? 'compliant' : 'non-compliant'}`}>
                🏛️ {t.compliance.provincial}
                {complianceStatus === 'compliant' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              </div>
            </div>
          </div>
        </div>

        {/* Actions photo */}
        <div className="photo-actions">
          <button 
            className="action-btn primary"
            onClick={() => onComplianceCheck(photo.id)}
          >
            <Shield size={16} />
            {t.actions.check}
          </button>
          <button className="action-btn secondary">
            <Download size={16} />
            {t.actions.download}
          </button>
          <button className="action-btn secondary">
            <Edit size={16} />
            {t.actions.edit}
          </button>
          <button 
            className="action-btn danger"
            onClick={() => onPhotoRemove(photo.id)}
          >
            <Trash2 size={16} />
            {t.actions.remove}
          </button>
        </div>

        {/* Miniatures */}
        <div className="thumbnails-container">
          {filteredPhotos.map((thumb, index) => (
            <div
              key={thumb.id}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onNavigate(index)}
            >
              <img src={thumb.url} alt={thumb.name} />
              <div 
                className="thumbnail-status"
                style={{ backgroundColor: getComplianceColor(getComplianceStatus(thumb)) }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="canadian-photo-carousel">
      {renderHeader()}
      {renderCarousel()}
      
      {/* Modal plein écran */}
      {isFullscreen && currentPhoto && (
        <div className="fullscreen-modal" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
            <button 
              className="fullscreen-close"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={24} />
            </button>
            <img 
              src={currentPhoto.url} 
              alt={currentPhoto.description}
              className="fullscreen-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};
// =================== SECTION 3: STYLES CSS PREMIUM + INTÉGRATION ===================
// À ajouter après la Section 2

// =================== STYLES CSS GLASSMORPHISME PREMIUM ===================
const CAROUSEL_STYLES = `
  /* =================== CONTENEUR PRINCIPAL =================== */
  .canadian-photo-carousel {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 24px;
    padding: 24px;
    margin: 20px 0;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .canadian-photo-carousel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6);
    border-radius: 24px 24px 0 0;
  }

  /* =================== HEADER PREMIUM =================== */
  .carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(100, 116, 139, 0.3);
    position: relative;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gallery-title {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .province-badge {
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2));
    color: #4ade80;
    border-radius: 12px;
    border: 1px solid rgba(34, 197, 94, 0.3);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  }

  .header-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* =================== FILTRES PREMIUM =================== */
  .filter-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-input {
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
    border: 2px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    min-width: 200px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
  }

  .filter-select {
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
    border: 2px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    min-width: 140px;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  /* =================== MODES D'AFFICHAGE =================== */
  .view-mode-group {
    display: flex;
    gap: 4px;
    background: rgba(15, 23, 42, 0.8);
    padding: 4px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(100, 116, 139, 0.3);
  }

  .view-mode-btn {
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
  }

  .view-mode-btn:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    transform: translateY(-1px);
  }

  .view-mode-btn.active {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  /* =================== ZONE UPLOAD PREMIUM =================== */
  .photo-upload-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.02));
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .photo-upload-zone::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }

  .photo-upload-zone:hover::before {
    left: 100%;
  }

  .photo-upload-zone:hover {
    border-color: rgba(59, 130, 246, 0.5);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
  }

  .photo-upload-zone.drag-over {
    border-color: #22c55e;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
    transform: scale(1.02);
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.3);
  }

  .upload-icon {
    color: #60a5fa;
    margin-bottom: 16px;
    filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
  }

  .upload-title {
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .upload-subtitle {
    color: #94a3b8;
    font-size: 14px;
    margin: 0 0 20px;
    text-align: center;
  }

  .provincial-requirements {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin-top: 20px;
  }

  .requirement-badge {
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.2));
    color: #fbbf24;
    border-radius: 12px;
    border: 1px solid rgba(245, 158, 11, 0.3);
    font-size: 13px;
    font-weight: 700;
  }

  .requirement-details {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .requirement-details span {
    color: #cbd5e1;
    font-size: 12px;
    padding: 4px 8px;
    background: rgba(100, 116, 139, 0.2);
    border-radius: 6px;
  }

  /* =================== CARROUSEL PRINCIPAL =================== */
  .carousel-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
    backdrop-filter: blur(20px);
    border: 2px solid rgba(100, 116, 139, 0.3);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .nav-btn:hover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(15, 23, 42, 0.9));
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: translateY(-50%) scale(0.9);
  }

  .nav-prev {
    left: -25px;
  }

  .nav-next {
    right: -25px;
  }

  /* =================== IMAGE PRINCIPALE =================== */
  .main-image-container {
    position: relative;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid rgba(100, 116, 139, 0.3);
    backdrop-filter: blur(10px);
    cursor: zoom-in;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  }

  .main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    cursor: zoom-in;
  }

  .main-image:hover {
    filter: brightness(1.1);
  }

  /* =================== OVERLAYS CONFORMITÉ =================== */
  .compliance-overlay {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .compliance-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 12px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .required-indicator {
    padding: 6px 10px;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8));
    color: white;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(239, 68, 68, 0.5);
    animation: pulse-warning 2s infinite;
  }

  @keyframes pulse-warning {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* =================== CONTRÔLES ZOOM =================== */
  .zoom-controls {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    padding: 8px 12px;
  }

  .zoom-btn {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #60a5fa;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .zoom-btn:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.3));
    transform: scale(1.1);
  }

  .zoom-level {
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    min-width: 50px;
    text-align: center;
  }

  /* =================== MÉTADONNÉES PHOTO =================== */
  .photo-metadata {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 16px;
    padding: 20px;
  }

  .metadata-section h4 {
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .metadata-section p {
    color: #cbd5e1;
    font-size: 14px;
    margin: 0 0 16px;
    line-height: 1.5;
  }

  .metadata-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .metadata-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 13px;
  }

  .compliance-section h5 {
    color: #3b82f6;
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px;
  }

  .compliance-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .compliance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .compliance-item.compliant {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1));
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .compliance-item.non-compliant {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  /* =================== ACTIONS PHOTO =================== */
  .photo-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 12px 16px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  .action-btn.secondary {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2));
    color: #cbd5e1;
    border: 1px solid rgba(100, 116, 139, 0.3);
  }

  .action-btn.secondary:hover {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.4), rgba(71, 85, 105, 0.3));
    transform: translateY(-2px);
  }

  .action-btn.danger {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2));
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .action-btn.danger:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.3));
    transform: translateY(-2px);
  }

  /* =================== MINIATURES =================== */
  .thumbnails-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
  }

  .thumbnails-container::-webkit-scrollbar {
    height: 6px;
  }

  .thumbnails-container::-webkit-scrollbar-track {
    background: rgba(100, 116, 139, 0.1);
    border-radius: 3px;
  }

  .thumbnails-container::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.5);
    border-radius: 3px;
  }

  .thumbnail {
    position: relative;
    flex-shrink: 0;
    width: 80px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .thumbnail:hover {
    transform: scale(1.1);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .thumbnail.active {
    border-color: #3b82f6;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-status {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
  }

  /* =================== MODAL PLEIN ÉCRAN =================== */
  .fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .fullscreen-content {
    position: relative;
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fullscreen-close {
    position: absolute;
    top: -50px;
    right: 0;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2));
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fca5a5;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(20px);
  }

  .fullscreen-close:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(220, 38, 38, 0.3));
    transform: scale(1.1);
  }

  .fullscreen-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  /* =================== RESPONSIVE DESIGN =================== */
  @media (max-width: 768px) {
    .canadian-photo-carousel {
      padding: 16px;
      margin: 16px 0;
    }

    .carousel-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .header-controls {
      justify-content: space-between;
    }

    .filter-group {
      flex-direction: column;
      gap: 8px;
    }

    .filter-input {
      min-width: auto;
    }

    .photo-metadata {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .photo-actions {
      grid-template-columns: repeat(2, 1fr);
    }

    .nav-btn {
      width: 40px;
      height: 40px;
    }

    .nav-prev {
      left: -20px;
    }

    .nav-next {
      right: -20px;
    }

    .thumbnail {
      width: 60px;
      height: 45px;
    }

    .gallery-title {
      font-size: 20px;
    }

    .requirement-details {
      flex-direction: column;
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .carousel-header {
      padding-bottom: 16px;
    }

    .filter-group,
    .view-mode-group {
      width: 100%;
    }

    .photo-actions {
      grid-template-columns: 1fr;
    }

    .thumbnails-container {
      justify-content: center;
    }
  }
`;

// =================== INTÉGRATION DANS VOTRE COMPOSANT EXISTANT ===================
// Fonction à ajouter dans votre Step4Permits pour intégrer le carrousel

const renderPhotoCarousel = (permit: Permit) => {
  // État pour gérer les photos du carrousel
  const [carouselPhotos, setCarouselPhotos] = useState<CanadianCompliancePhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselViewMode, setCarouselViewMode] = useState<'carousel' | 'grid' | 'list'>('carousel');

  // Fonction pour convertir vos photos existantes en format conforme
  const convertToCanadianFormat = (photos: PhotoEntry[]): CanadianCompliancePhoto[] => {
    return photos.map(photo => ({
      id: photo.id?.toString() || Date.now().toString(),
      url: photo.url,
      name: photo.name,
      timestamp: photo.timestamp || new Date().toISOString(),
      description: photo.description || '',
      location: {
        latitude: 0, // À récupérer via géolocalisation
        longitude: 0,
        address: photo.gpsLocation || '',
        province: formData.province || 'QC',
        postalCode: ''
      },
      compliance: {
        federalCompliant: true,
        workplaceSafetyAct: true,
        transportCanada: false,
        environmentCanada: false,
        provincial: {
          QC: {
            CNESST_compliant: permit.id === 'confined-space-entry-2025',
            RSST_documentation: permit.id === 'confined-space-entry-2025',
            municipal_permit_photo: permit.id === 'excavation-permit-municipal-2024',
            excavation_photo_required: permit.id === 'excavation-permit-municipal-2024',
            confined_space_documentation: permit.id === 'confined-space-entry-2025',
            hot_work_safety_photos: permit.id === 'hot-work-permit-nfpa2019'
          },
          // ... autres provinces avec valeurs par défaut
          ON: {
            OHSA_compliant: true,
            WSIB_documentation: true,
            municipal_compliance: true,
            construction_safety_photos: true,
            electrical_safety_documentation: false
          },
          // Continuer pour toutes les provinces...
        } as any
      },
      metadata: {
        fileSize: photo.size || 0,
        resolution: '1920x1080', // Valeur par défaut
        format: 'JPEG',
        cameraInfo: '',
        inspector: '',
        permitNumber: permit.id,
        workOrderNumber: ''
      },
      required: permit.priority === 'critical',
      complianceStatus: 'compliant',
      tags: [permit.category, permit.priority, 'safety']
    }));
  };

  // Handlers pour le carrousel
  const handlePhotoUpload = (files: FileList) => {
    // Votre logique d'upload existante + conversion format canadien
    const newPhotos: CanadianCompliancePhoto[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = Date.now().toString() + i;
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        id: photoId,
        url: url,
        name: file.name,
        timestamp: new Date().toISOString(),
        description: '',
        location: {
          province: formData.province || 'QC',
          address: ''
        },
        compliance: {
          federalCompliant: false, // À valider
          workplaceSafetyAct: false,
          transportCanada: false,
          environmentCanada: false,
          provincial: {} as any // À compléter selon la province
        },
        metadata: {
          fileSize: file.size,
          resolution: '1920x1080', // À détecter
          format: file.type.split('/')[1].toUpperCase(),
          permitNumber: permit.id
        },
        required: permit.priority === 'critical',
        complianceStatus: 'pending-review',
        tags: ['new', permit.category]
      });
    }
    
    setCarouselPhotos(prev => [...prev, ...newPhotos]);
  };

  const handlePhotoRemove = (photoId: string) => {
    setCarouselPhotos(prev => prev.filter(p => p.id !== photoId));
    if (currentPhotoIndex >= carouselPhotos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, carouselPhotos.length - 2));
    }
  };

  const handlePhotoUpdate = (photoId: string, updates: Partial<CanadianCompliancePhoto>) => {
    setCarouselPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updates } : p));
  };

  const handleComplianceCheck = (photoId: string) => {
    // Votre logique de vérification de conformité
    console.log('Vérification conformité pour photo:', photoId);
    // Mettre à jour le statut de conformité
    handlePhotoUpdate(photoId, { complianceStatus: 'compliant' });
  };

  // Initialiser les photos du carrousel depuis vos photos existantes
  useEffect(() => {
    const existingPhotos = photos[permit.id] || [];
    if (existingPhotos.length > 0) {
      setCarouselPhotos(convertToCanadianFormat(existingPhotos));
    }
  }, [photos, permit.id]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_STYLES }} />
      <CanadianPhotoCarousel
        photos={carouselPhotos}
        currentIndex={currentPhotoIndex}
        province={formData.province || 'QC'}
        permitType={permit.id}
        onNavigate={setCurrentPhotoIndex}
        onPhotoUpload={handlePhotoUpload}
        onPhotoRemove={handlePhotoRemove}
        onPhotoUpdate={handlePhotoUpdate}
        onComplianceCheck={handleComplianceCheck}
        viewMode={carouselViewMode}
        onViewModeChange={setCarouselViewMode}
        language={language}
      />
    </>
  );
};
