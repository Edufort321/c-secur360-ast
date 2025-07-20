// =================== COMPONENTS/FORMS/SHARED/EQUIPMENTSECTION.TSX - SECTION ÉQUIPEMENTS RÉUTILISABLE ===================
// Section équipements avec QR scan, inventaire temps réel et vérifications automatiques

"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Minus,
  Search, 
  Filter,
  QrCode,
  Camera,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  User,
  Package,
  Shield,
  Zap,
  Wrench,
  HardHat,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Battery,
  Signal,
  Wifi,
  Bluetooth,
  Activity,
  Gauge
} from 'lucide-react';
import { StatusBadge } from '../../StatusBadge';

// =================== TYPES ===================
export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assetTag?: string;
  description?: string;
  
  // Status et condition
  status: 'available' | 'in-use' | 'maintenance' | 'defective' | 'missing' | 'retired';
  condition: 'excellent' | 'good' | 'acceptable' | 'poor' | 'defective';
  
  // Dates importantes
  purchaseDate?: Date;
  lastInspection: Date;
  nextInspection: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  warrantyExpiry?: Date;
  
  // Certifications et conformité
  certifications: string[];
  standards: string[];
  certificationExpiry?: Date;
  
  // Utilisation et assignation
  assignedTo?: string;
  location: string;
  department?: string;
  project?: string;
  
  // Specifications techniques
  specifications: Record<string, any>;
  attachments: string[];
  photos: string[];
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastCheckedBy?: string;
  lastCheckedAt?: Date;
  
  // Mobile/IoT features
  hasQRCode: boolean;
  hasGPS: boolean;
  hasBluetooth: boolean;
  batteryLevel?: number;
  lastSignal?: Date;
}

export type EquipmentCategory = 
  | 'safety' 
  | 'detection' 
  | 'protection' 
  | 'rescue'
  | 'communication'
  | 'ventilation'
  | 'lifting'
  | 'electrical'
  | 'hand-tools'
  | 'power-tools'
  | 'ppe'
  | 'rigging'
  | 'scaffolding'
  | 'access'
  | 'testing'
  | 'monitoring'
  | 'emergency';

export interface EquipmentFilter {
  categories: EquipmentCategory[];
  statuses: EquipmentItem['status'][];
  conditions: EquipmentItem['condition'][];
  assignedTo: string[];
  locations: string[];
  manufacturers: string[];
  searchQuery: string;
  inspectionDue: boolean;
  maintenanceDue: boolean;
  certificationExpiring: boolean;
}

export interface EquipmentSectionProps {
  data: {
    [key: string]: EquipmentItem[];
  };
  onChange: (field: string, value: EquipmentItem[]) => void;
  errors: Record<string, string>;
  language: 'fr' | 'en';
  permitType: string;
  province: string;
  readOnly?: boolean;
  touchOptimized?: boolean;
  compactMode?: boolean;
  enableQRScan?: boolean;
  enableInventoryTracking?: boolean;
}

// =================== CONFIGURATION CATÉGORIES ===================
const EQUIPMENT_CATEGORIES = {
  'safety': {
    icon: Shield,
    title: { fr: 'Équipement de sécurité', en: 'Safety equipment' },
    color: '#DC2626',
    required: true
  },
  'detection': {
    icon: Activity,
    title: { fr: 'Détection', en: 'Detection' },
    color: '#F59E0B',
    required: true
  },
  'protection': {
    icon: HardHat,
    title: { fr: 'Protection', en: 'Protection' },
    color: '#059669',
    required: true
  },
  'rescue': {
    icon: Plus,
    title: { fr: 'Sauvetage', en: 'Rescue' },
    color: '#EF4444',
    required: false
  },
  'communication': {
    icon: Wifi,
    title: { fr: 'Communication', en: 'Communication' },
    color: '#3B82F6',
    required: false
  },
  'ventilation': {
    icon: RefreshCw,
    title: { fr: 'Ventilation', en: 'Ventilation' },
    color: '#06B6D4',
    required: false
  },
  'lifting': {
    icon: Wrench,
    title: { fr: 'Levage', en: 'Lifting' },
    color: '#8B5CF6',
    required: false
  },
  'electrical': {
    icon: Zap,
    title: { fr: 'Électrique', en: 'Electrical' },
    color: '#F59E0B',
    required: false
  },
  'hand-tools': {
    icon: Wrench,
    title: { fr: 'Outils manuels', en: 'Hand tools' },
    color: '#6B7280',
    required: false
  },
  'power-tools': {
    icon: Settings,
    title: { fr: 'Outils électriques', en: 'Power tools' },
    color: '#DC2626',
    required: false
  },
  'ppe': {
    icon: HardHat,
    title: { fr: 'EPI', en: 'PPE' },
    color: '#059669',
    required: true
  },
  'rigging': {
    icon: Package,
    title: { fr: 'Élingage', en: 'Rigging' },
    color: '#7C3AED',
    required: false
  },
  'scaffolding': {
    icon: Package,
    title: { fr: 'Échafaudage', en: 'Scaffolding' },
    color: '#0891B2',
    required: false
  },
  'access': {
    icon: Package,
    title: { fr: 'Accès', en: 'Access' },
    color: '#059669',
    required: false
  },
  'testing': {
    icon: Gauge,
    title: { fr: 'Test et mesure', en: 'Testing' },
    color: '#7C2D12',
    required: false
  },
  'monitoring': {
    icon: Activity,
    title: { fr: 'Surveillance', en: 'Monitoring' },
    color: '#0891B2',
    required: false
  },
  'emergency': {
    icon: AlertTriangle,
    title: { fr: 'Urgence', en: 'Emergency' },
    color: '#EF4444',
    required: true
  }
} as const;

// =================== CONFIGURATION PAR TYPE PERMIS ===================
const PERMIT_EQUIPMENT_REQUIREMENTS = {
  'espace-clos': {
    required: ['safety', 'detection', 'protection', 'rescue', 'communication', 'ppe'],
    optional: ['ventilation', 'emergency', 'testing']
  },
  'travail-chaud': {
    required: ['safety', 'detection', 'protection', 'ppe', 'emergency'],
    optional: ['communication', 'testing', 'ventilation']
  },
  'excavation': {
    required: ['safety', 'detection', 'protection', 'ppe'],
    optional: ['scaffolding', 'access', 'communication', 'emergency']
  },
  'levage': {
    required: ['safety', 'lifting', 'rigging', 'protection', 'ppe', 'communication'],
    optional: ['testing', 'emergency']
  },
  'hauteur': {
    required: ['safety', 'protection', 'access', 'ppe', 'rescue'],
    optional: ['communication', 'emergency', 'scaffolding']
  },
  'electrique': {
    required: ['safety', 'electrical', 'protection', 'ppe', 'testing'],
    optional: ['communication', 'emergency', 'hand-tools']
  }
} as const;

// =================== EXEMPLES ÉQUIPEMENTS ===================
const EQUIPMENT_TEMPLATES = {
  'safety': [
    { type: 'gas-detector', name: 'Détecteur 4 gaz', standards: ['CSA', 'ATEX'] },
    { type: 'safety-harness', name: 'Harnais de sécurité', standards: ['CSA Z259.10'] },
    { type: 'safety-line', name: 'Ligne de vie', standards: ['CSA Z259.2.2'] }
  ],
  'detection': [
    { type: 'gas-monitor', name: 'Moniteur atmosphérique', standards: ['CSA C22.2'] },
    { type: 'leak-detector', name: 'Détecteur de fuites', standards: ['NFPA 70E'] }
  ],
  'protection': [
    { type: 'fire-extinguisher', name: 'Extincteur', standards: ['ULC'] },
    { type: 'fire-blanket', name: 'Couverture anti-feu', standards: ['NFPA'] },
    { type: 'barrier', name: 'Barrière de protection', standards: ['CSA'] }
  ],
  'ppe': [
    { type: 'hard-hat', name: 'Casque de sécurité', standards: ['CSA Z94.1'] },
    { type: 'safety-glasses', name: 'Lunettes de sécurité', standards: ['CSA Z94.3'] },
    { type: 'gloves', name: 'Gants de protection', standards: ['CSA Z195'] },
    { type: 'boots', name: 'Bottes de sécurité', standards: ['CSA Z195'] }
  ]
} as const;

// =================== COMPOSANT PRINCIPAL ===================
export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  data,
  onChange,
  errors,
  language,
  permitType,
  province,
  readOnly = false,
  touchOptimized = true,
  compactMode = false,
  enableQRScan = true,
  enableInventoryTracking = true
}) => {
  // =================== STATE ===================
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('safety');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EquipmentFilter>({
    categories: [],
    statuses: [],
    conditions: [],
    assignedTo: [],
    locations: [],
    manufacturers: [],
    searchQuery: '',
    inspectionDue: false,
    maintenanceDue: false,
    certificationExpiring: false
  });
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<EquipmentItem>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // =================== COMPUTED VALUES ===================
  const permitRequirements = PERMIT_EQUIPMENT_REQUIREMENTS[permitType as keyof typeof PERMIT_EQUIPMENT_REQUIREMENTS] || { required: [], optional: [] };
  
  const allEquipment = useMemo(() => {
    return Object.values(data).flat();
  }, [data]);

  const equipmentByCategory = useMemo(() => {
    const result: Record<string, EquipmentItem[]> = {};
    Object.entries(data).forEach(([category, items]) => {
      result[category] = items || [];
    });
    return result;
  }, [data]);

  const filteredEquipment = useMemo(() => {
    let filtered = allEquipment;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.serialNumber.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(item => filters.categories.includes(item.category));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(item => filters.statuses.includes(item.status));
    }

    if (filters.conditions.length > 0) {
      filtered = filtered.filter(item => filters.conditions.includes(item.condition));
    }

    if (filters.inspectionDue) {
      const now = new Date();
      const warningPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
      filtered = filtered.filter(item => 
        item.nextInspection.getTime() - now.getTime() <= warningPeriod
      );
    }

    if (filters.maintenanceDue) {
      const now = new Date();
      const warningPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
      filtered = filtered.filter(item => 
        item.nextMaintenance && item.nextMaintenance.getTime() - now.getTime() <= warningPeriod
      );
    }

    return filtered;
  }, [allEquipment, searchQuery, filters]);

  // =================== ACTIONS CRUD ===================
  const addEquipment = useCallback((category: EquipmentCategory, equipment: Partial<EquipmentItem>) => {
    const newEquipment: EquipmentItem = {
      id: `eq_${Date.now()}`,
      name: equipment.name || '',
      type: equipment.type || '',
      category,
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      status: 'available',
      condition: 'good',
      lastInspection: new Date(),
      nextInspection: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
      certifications: equipment.certifications || [],
      standards: equipment.standards || [],
      location: equipment.location || '',
      specifications: equipment.specifications || {},
      attachments: [],
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      hasQRCode: true,
      hasGPS: false,
      hasBluetooth: false,
      ...equipment
    };

    const currentItems = data[category] || [];
    const updatedItems = [...currentItems, newEquipment];
    onChange(category, updatedItems);
  }, [data, onChange]);

  const updateEquipment = useCallback((category: EquipmentCategory, equipmentId: string, updates: Partial<EquipmentItem>) => {
    const currentItems = data[category] || [];
    const updatedItems = currentItems.map(item => 
      item.id === equipmentId 
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    );
    onChange(category, updatedItems);
  }, [data, onChange]);

  const removeEquipment = useCallback((category: EquipmentCategory, equipmentId: string) => {
    const currentItems = data[category] || [];
    const updatedItems = currentItems.filter(item => item.id !== equipmentId);
    onChange(category, updatedItems);
  }, [data, onChange]);

  // =================== QR CODE SCANNING ===================
  const startQRScan = useCallback(async () => {
    if (!enableQRScan) return;
    
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Simulation QR scan après 3 secondes
      setTimeout(() => {
        const mockEquipment = {
          name: 'Détecteur BW-4',
          type: 'gas-detector',
          manufacturer: 'BW Technologies',
          model: 'GasAlert Quattro',
          serialNumber: 'BW240001',
          certifications: ['CSA', 'ATEX'],
          location: 'Magasin principal'
        };
        
        addEquipment(selectedCategory, mockEquipment);
        stopQRScan();
        
        // Feedback haptic succès
        if (touchOptimized && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      setIsScanning(false);
    }
  }, [enableQRScan, selectedCategory, addEquipment, touchOptimized]);

  const stopQRScan = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // =================== PHOTO CAPTURE ===================
  const capturePhoto = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handlePhotoCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      console.log('Photo capturée:', photoUrl);
      // Ici on ajouterait la photo à l'équipement
    };
    reader.readAsDataURL(file);
  }, []);

  // =================== DÉTECTION MAINTENANCE DUE ===================
  const getMaintenanceStatus = useCallback((item: EquipmentItem) => {
    const now = new Date();
    const inspectionTime = item.nextInspection.getTime() - now.getTime();
    const maintenanceTime = item.nextMaintenance ? item.nextMaintenance.getTime() - now.getTime() : Infinity;
    const certificationTime = item.certificationExpiry ? item.certificationExpiry.getTime() - now.getTime() : Infinity;

    const dayMs = 24 * 60 * 60 * 1000;

    if (inspectionTime < 0 || maintenanceTime < 0 || certificationTime < 0) {
      return { status: 'overdue', priority: 'critical' };
    }
    
    if (inspectionTime <= 7 * dayMs || maintenanceTime <= 7 * dayMs || certificationTime <= 7 * dayMs) {
      return { status: 'due-soon', priority: 'high' };
    }
    
    if (inspectionTime <= 30 * dayMs || maintenanceTime <= 30 * dayMs || certificationTime <= 30 * dayMs) {
      return { status: 'upcoming', priority: 'medium' };
    }

    return { status: 'current', priority: 'low' };
  }, []);

  // =================== RENDU CARTE ÉQUIPEMENT ===================
  const renderEquipmentCard = useCallback((item: EquipmentItem) => {
    const categoryConfig = EQUIPMENT_CATEGORIES[item.category];
    const maintenanceStatus = getMaintenanceStatus(item);
    const Icon = categoryConfig.icon;

    return (
      <motion.div
        key={item.id}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        layout
      >
        <div className="p-4">
          {/* Header avec status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${categoryConfig.color}20` }}
              >
                <Icon 
                  size={20} 
                  style={{ color: categoryConfig.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-600 truncate">
                  {item.manufacturer} {item.model}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <StatusBadge
                status={
                  item.status === 'available' ? 'active' :
                  item.status === 'in-use' ? 'pending' :
                  item.status === 'defective' ? 'expired' : 'suspended'
                }
                language={language}
                size="sm"
              />
              
              {maintenanceStatus.priority !== 'low' && (
                <StatusBadge
                  status={
                    maintenanceStatus.status === 'overdue' ? 'expired' :
                    maintenanceStatus.status === 'due-soon' ? 'expiring-soon' : 'pending'
                  }
                  language={language}
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Informations principales */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{language === 'fr' ? 'Série' : 'Serial'}</span>
              <span className="font-mono text-gray-900">{item.serialNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{language === 'fr' ? 'Lieu' : 'Location'}</span>
              <span className="text-gray-900 truncate ml-2">{item.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{language === 'fr' ? 'Inspection' : 'Inspection'}</span>
              <span className="text-gray-900">
                {item.nextInspection.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Badges certifications */}
          {item.certifications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.certifications.slice(0, 3).map(cert => (
                <span 
                  key={cert}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                >
                  {cert}
                </span>
              ))}
              {item.certifications.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  +{item.certifications.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {!readOnly && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingItem(item)}
                className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Edit3 size={16} className="inline mr-1" />
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </button>
              
              <button
                onClick={() => removeEquipment(item.category, item.id)}
                className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Indicateurs IoT */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            {item.hasQRCode && (
              <div className="flex items-center gap-1">
                <QrCode size={12} />
                <span>QR</span>
              </div>
            )}
            {item.hasBluetooth && (
              <div className="flex items-center gap-1">
                <Bluetooth size={12} />
                {item.batteryLevel && (
                  <span>{item.batteryLevel}%</span>
                )}
              </div>
            )}
            {item.hasGPS && (
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>GPS</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [language, readOnly, getMaintenanceStatus, removeEquipment]);

  // =================== RENDU CATÉGORIES ===================
  const renderCategoryTabs = () => (
    <div className="flex overflow-x-auto gap-2 pb-2">
      {Object.entries(EQUIPMENT_CATEGORIES).map(([categoryKey, config]) => {
        const category = categoryKey as EquipmentCategory;
        const items = equipmentByCategory[category] || [];
        const isRequired = permitRequirements.required.includes(category as any);
        const hasItems = items.length > 0;
        const Icon = config.icon;

        return (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all min-h-[44px]
              ${selectedCategory === category
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${isRequired && !hasItems ? 'ring-2 ring-red-300' : ''}
            `}
          >
            <Icon size={18} />
            <span className="font-medium">{config.title[language]}</span>
            {items.length > 0 && (
              <span className="bg-white bg-opacity-50 text-xs px-2 py-1 rounded-full">
                {items.length}
              </span>
            )}
            {isRequired && (
              <span className="text-red-500 text-xs">*</span>
            )}
          </button>
        );
      })}
    </div>
  );

  // =================== RENDU HEADER ===================
  const renderHeader = () => (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'fr' ? 'Équipements et matériel' : 'Equipment and materials'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'fr' ? 'Gestion inventaire et vérifications' : 'Inventory management and verifications'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enableQRScan && (
            <button
              onClick={startQRScan}
              disabled={readOnly}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
            >
              <QrCode size={20} />
              <span className="hidden sm:inline">{language === 'fr' ? 'Scanner QR' : 'Scan QR'}</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={readOnly}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px]"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{language === 'fr' ? 'Ajouter' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'fr' ? 'Rechercher équipement...' : 'Search equipment...'}
            className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px]"
        >
          <Filter size={20} />
          <span className="hidden sm:inline">{language === 'fr' ? 'Filtres' : 'Filters'}</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-900">{allEquipment.length}</div>
          <div className="text-sm text-gray-600">{language === 'fr' ? 'Total' : 'Total'}</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {allEquipment.filter(item => item.status === 'available').length}
          </div>
          <div className="text-sm text-gray-600">{language === 'fr' ? 'Disponible' : 'Available'}</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-600">
            {allEquipment.filter(item => getMaintenanceStatus(item).priority !== 'low').length}
          </div>
          <div className="text-sm text-gray-600">{language === 'fr' ? 'Maintenance' : 'Maintenance'}</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-600">
            {allEquipment.filter(item => item.status === 'defective').length}
          </div>
          <div className="text-sm text-gray-600">{language === 'fr' ? 'Défectueux' : 'Defective'}</div>
        </div>
      </div>

      {/* Onglets catégories */}
      {renderCategoryTabs()}
    </div>
  );

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="space-y-6">
      {renderHeader()}

      {/* Liste équipements de la catégorie sélectionnée */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">
            {EQUIPMENT_CATEGORIES[selectedCategory].title[language]}
          </h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {viewMode === 'grid' ? <Package size={20} /> : <Package size={20} />}
            </button>
          </div>
        </div>

        {equipmentByCategory[selectedCategory]?.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
            }
          `}>
            {equipmentByCategory[selectedCategory].map(renderEquipmentCard)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'fr' ? 'Aucun équipement' : 'No equipment'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? 'Ajoutez des équipements pour cette catégorie'
                : 'Add equipment for this category'
              }
            </p>
            {!readOnly && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                <span>{language === 'fr' ? 'Ajouter équipement' : 'Add equipment'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal QR Scanner */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'fr' ? 'Scanner QR Code' : 'Scan QR Code'}
                </h3>
                <p className="text-gray-600">
                  {language === 'fr' ? 'Pointez vers le QR code de l\'équipement' : 'Point camera at equipment QR code'}
                </p>
              </div>
              
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-100 rounded-lg mb-4"
                playsInline
              />
              
              <div className="flex gap-3">
                <button
                  onClick={stopQRScan}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input caméra caché */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {/* Erreurs de validation */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-800">
              {language === 'fr' ? 'Erreurs à corriger' : 'Errors to fix'}
            </h4>
          </div>
          <div className="space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <p key={field} className="text-sm text-red-700">• {error}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =================== EXPORT ===================
export default EquipmentSection;
