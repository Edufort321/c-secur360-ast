'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, UserCheck, UserX, AlertTriangle, Clock, MapPin, 
  QrCode, Search, Filter, Download, RefreshCw, Bell,
  Smartphone, Wifi, WifiOff, Battery, Signal, Eye,
  Calendar, BarChart3, TrendingUp, Activity, Shield, Lock
} from 'lucide-react';

// =================== INTERFACES ===================

interface Worker {
  id: string;
  name: string;
  employeeNumber: string;
  role: string;
  department: string;
  certification: string[];
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  status: WorkerStatus;
  location: {
    zone: string;
    building?: string;
    floor?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  presence: {
    isOnSite: boolean;
    checkInTime?: string;
    checkOutTime?: string;
    lastActivity: string;
    method: 'qr_code' | 'manual' | 'geofence' | 'nfc' | 'mobile_app';
  };
  device: {
    connected: boolean;
    batteryLevel?: number;
    signalStrength?: number;
    lastPing: string;
  };
  workAssignments: string[]; // AST IDs
  permits: string[]; // Permit IDs
  // LOTO Padlock tracking
  assignedLocks: LOTOLock[];
}

interface LOTOLock {
  id: string;
  lockNumber: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical';
  equipment: string;
  location: string;
  status: 'applied' | 'verified' | 'removed';
  appliedTime: string;
  verifiedTime?: string;
  removedTime?: string;
}

interface WorkerPresenceStats {
  totalWorkers: number;
  onSite: number;
  offSite: number;
  unknown: number;
  byDepartment: Record<string, number>;
  byZone: Record<string, number>;
  byRole: Record<string, number>;
  criticalAlerts: number;
  lastUpdate: string;
  // LOTO Padlock tracking
  totalLocks: number;
  activeLocks: number;
  locksByType: Record<string, number>;
  locksByWorker: Record<string, number>;
}

interface PresenceAlert {
  id: string;
  type: 'missing_checkout' | 'emergency_contact' | 'device_offline' | 'unauthorized_zone' | 'permit_expired';
  workerId: string;
  workerName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

type WorkerStatus = 'active' | 'break' | 'lunch' | 'meeting' | 'emergency' | 'offline' | 'unknown';

interface WorkerPresenceDashboardProps {
  siteId: string;
  language: 'fr' | 'en';
  refreshInterval?: number; // en secondes
  onWorkerSelected?: (worker: Worker) => void;
  onEmergencyAlert?: (alert: PresenceAlert) => void;
  compactMode?: boolean;
}

// =================== TRADUCTIONS ===================

const translations = {
  fr: {
    title: "👥 Tableau de Bord - Présence des Travailleurs",
    subtitle: "Suivi en temps réel du personnel sur site",
    
    stats: {
      totalWorkers: "Total Travailleurs",
      onSite: "Sur Site",
      offSite: "Hors Site", 
      unknown: "Statut Inconnu",
      criticalAlerts: "Alertes Critiques",
      lastUpdate: "Dernière MAJ",
      totalLocks: "Total Cadenas",
      activeLocks: "Cadenas Actifs",
      locksByType: "Par Type d'Énergie",
      locksByWorker: "Par Travailleur"
    },
    
    status: {
      active: "Actif",
      break: "Pause",
      lunch: "Dîner", 
      meeting: "Réunion",
      emergency: "Urgence",
      offline: "Hors ligne",
      unknown: "Inconnu"
    },
    
    presence: {
      checkIn: "Arrivée",
      checkOut: "Départ",
      onSite: "Sur site",
      offSite: "Hors site",
      lastActivity: "Dernière activité",
      duration: "Durée sur site"
    },
    
    methods: {
      qr_code: "Code QR",
      manual: "Manuel",
      geofence: "Géo-clôture",
      nfc: "NFC",
      mobile_app: "App mobile"
    },
    
    filters: {
      all: "Tous",
      onSite: "Sur site seulement",
      offSite: "Hors site seulement",
      alerts: "Avec alertes",
      department: "Département",
      role: "Rôle",
      zone: "Zone"
    },
    
    alerts: {
      title: "Alertes de Présence",
      missing_checkout: "Oubli de pointage sortie",
      emergency_contact: "Contact d'urgence requis",
      device_offline: "Appareil hors ligne",
      unauthorized_zone: "Zone non autorisée",
      permit_expired: "Permis expiré",
      acknowledge: "Acquitter",
      resolve: "Résoudre"
    },
    
    actions: {
      refresh: "Actualiser",
      export: "Exporter",
      search: "Rechercher",
      filter: "Filtrer",
      emergency: "Urgence",
      viewWorker: "Voir détails",
      contactWorker: "Contacter",
      locate: "Localiser"
    },
    
    device: {
      connected: "Connecté",
      disconnected: "Déconnecté", 
      battery: "Batterie",
      signal: "Signal",
      lastPing: "Dernier ping"
    },
    
    emergency: {
      evacuationMode: "Mode Évacuation",
      accountingMode: "Mode Comptabilisation",
      allWorkersFound: "Tous les travailleurs localisés",
      missingWorkers: "Travailleurs manquants",
      emergencyContacts: "Contacts d'urgence"
    },
    
    loto: {
      title: "Cadenas LOTO",
      energyTypes: {
        electrical: "⚡ Électrique",
        mechanical: "⚙️ Mécanique", 
        hydraulic: "🔧 Hydraulique",
        pneumatic: "💨 Pneumatique",
        thermal: "🔥 Thermique",
        chemical: "🧪 Chimique"
      },
      status: {
        applied: "Appliqué",
        verified: "Vérifié",
        removed: "Retiré"
      },
      lockNumber: "Numéro de cadenas",
      equipment: "Équipement",
      appliedTime: "Appliqué à",
      verifiedTime: "Vérifié à"
    }
  },
  
  en: {
    title: "👥 Worker Presence Dashboard", 
    subtitle: "Real-time personnel tracking on site",
    
    stats: {
      totalWorkers: "Total Workers",
      onSite: "On Site",
      offSite: "Off Site",
      unknown: "Unknown Status", 
      criticalAlerts: "Critical Alerts",
      lastUpdate: "Last Update",
      totalLocks: "Total Locks",
      activeLocks: "Active Locks",
      locksByType: "By Energy Type",
      locksByWorker: "By Worker"
    },
    
    status: {
      active: "Active",
      break: "Break",
      lunch: "Lunch",
      meeting: "Meeting", 
      emergency: "Emergency",
      offline: "Offline",
      unknown: "Unknown"
    },
    
    presence: {
      checkIn: "Check In",
      checkOut: "Check Out",
      onSite: "On site", 
      offSite: "Off site",
      lastActivity: "Last activity",
      duration: "Time on site"
    },
    
    methods: {
      qr_code: "QR Code",
      manual: "Manual",
      geofence: "Geofence",
      nfc: "NFC", 
      mobile_app: "Mobile app"
    },
    
    filters: {
      all: "All",
      onSite: "On site only",
      offSite: "Off site only",
      alerts: "With alerts",
      department: "Department",
      role: "Role",
      zone: "Zone"
    },
    
    alerts: {
      title: "Presence Alerts",
      missing_checkout: "Missing checkout",
      emergency_contact: "Emergency contact required", 
      device_offline: "Device offline",
      unauthorized_zone: "Unauthorized zone",
      permit_expired: "Permit expired",
      acknowledge: "Acknowledge",
      resolve: "Resolve"
    },
    
    actions: {
      refresh: "Refresh",
      export: "Export",
      search: "Search",
      filter: "Filter",
      emergency: "Emergency",
      viewWorker: "View details",
      contactWorker: "Contact",
      locate: "Locate"
    },
    
    device: {
      connected: "Connected",
      disconnected: "Disconnected",
      battery: "Battery", 
      signal: "Signal",
      lastPing: "Last ping"
    },
    
    emergency: {
      evacuationMode: "Evacuation Mode",
      accountingMode: "Accounting Mode",
      allWorkersFound: "All workers located",
      missingWorkers: "Missing workers",
      emergencyContacts: "Emergency contacts"
    },
    
    loto: {
      title: "LOTO Locks",
      energyTypes: {
        electrical: "⚡ Electrical",
        mechanical: "⚙️ Mechanical",
        hydraulic: "🔧 Hydraulic",
        pneumatic: "💨 Pneumatic",
        thermal: "🔥 Thermal",
        chemical: "🧪 Chemical"
      },
      status: {
        applied: "Applied",
        verified: "Verified",
        removed: "Removed"
      },
      lockNumber: "Lock Number",
      equipment: "Equipment",
      appliedTime: "Applied at",
      verifiedTime: "Verified at"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================

const WorkerPresenceDashboard: React.FC<WorkerPresenceDashboardProps> = ({
  siteId,
  language = 'fr',
  refreshInterval = 30,
  onWorkerSelected,
  onEmergencyAlert,
  compactMode = false
}) => {
  // États
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [alerts, setAlerts] = useState<PresenceAlert[]>([]);
  const [stats, setStats] = useState<WorkerPresenceStats>({
    totalWorkers: 0,
    onSite: 0,
    offSite: 0,
    unknown: 0,
    byDepartment: {},
    byZone: {},
    byRole: {},
    criticalAlerts: 0,
    lastUpdate: new Date().toISOString(),
    // LOTO statistics
    totalLocks: 0,
    activeLocks: 0,
    locksByType: {},
    locksByWorker: {}
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'onSite' | 'offSite' | 'alerts'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  const t = translations[language];
  
  // =================== DATA SIMULATION ===================
  
  const generateMockWorkers = useCallback((): Worker[] => {
    const departments = ['Production', 'Maintenance', 'Sécurité', 'Supervision', 'Qualité'];
    const roles = ['Opérateur', 'Technicien', 'Superviseur', 'Contremaître', 'Inspecteur'];
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Bureaux', 'Entrepôt'];
    const statuses: WorkerStatus[] = ['active', 'break', 'lunch', 'meeting', 'offline'];
    const energyTypes: ('electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical')[] = 
      ['electrical', 'mechanical', 'hydraulic', 'pneumatic', 'thermal', 'chemical'];
    
    return Array.from({ length: 47 }, (_, i) => {
      const isOnSite = Math.random() > 0.3; // 70% chance d'être sur site
      const status = isOnSite ? statuses[Math.floor(Math.random() * 4)] : 'offline';
      const checkInTime = isOnSite ? new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000) : undefined;
      
      return {
        id: `worker_${i + 1}`,
        name: `Travailleur ${i + 1}`,
        employeeNumber: `EMP${String(i + 1).padStart(3, '0')}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        certification: ['Formation base', 'SIMDUT'],
        phone: `+1-514-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        emergencyContact: {
          name: `Contact ${i + 1}`,
          phone: `+1-514-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          relation: 'Époux/Épouse'
        },
        status,
        location: {
          zone: zones[Math.floor(Math.random() * zones.length)],
          building: isOnSite ? `Bâtiment ${Math.floor(Math.random() * 3) + 1}` : undefined,
          floor: isOnSite ? `Étage ${Math.floor(Math.random() * 5) + 1}` : undefined
        },
        presence: {
          isOnSite,
          checkInTime: checkInTime?.toISOString(),
          checkOutTime: !isOnSite && Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString() : undefined,
          lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
          method: ['qr_code', 'mobile_app', 'geofence'][Math.floor(Math.random() * 3)] as any
        },
        device: {
          connected: isOnSite && Math.random() > 0.1,
          batteryLevel: isOnSite ? Math.floor(Math.random() * 100) : undefined,
          signalStrength: isOnSite ? Math.floor(Math.random() * 100) : undefined,
          lastPing: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString()
        },
        workAssignments: [`AST-${Math.floor(Math.random() * 100)}`],
        permits: Math.random() > 0.7 ? [`PERMIT-${Math.floor(Math.random() * 50)}`] : [],
        // Generate LOTO locks for workers (especially maintenance and electrical)
        assignedLocks: isOnSite && (roles[Math.floor(Math.random() * roles.length)] === 'Technicien' || 
                       departments[Math.floor(Math.random() * departments.length)] === 'Maintenance') && 
                       Math.random() > 0.6 ? 
          Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, lockIndex) => ({
            id: `lock_${i}_${lockIndex}`,
            lockNumber: `LOT-${String(i + 1).padStart(3, '0')}-${String(lockIndex + 1).padStart(2, '0')}`,
            energyType: energyTypes[Math.floor(Math.random() * energyTypes.length)],
            equipment: `Équipement-${Math.floor(Math.random() * 20) + 1}`,
            location: zones[Math.floor(Math.random() * zones.length)],
            status: ['applied', 'verified'][Math.floor(Math.random() * 2)] as 'applied' | 'verified',
            appliedTime: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
            verifiedTime: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString() : undefined
          })) : []
      };
    });
  }, []);
  
  const generateMockAlerts = useCallback((workers: Worker[]): PresenceAlert[] => {
    const alertTypes: PresenceAlert['type'][] = ['missing_checkout', 'device_offline', 'permit_expired'];
    const severities: PresenceAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    return workers
      .filter(() => Math.random() > 0.85) // 15% chance d'alerte
      .map((worker, i) => ({
        id: `alert_${worker.id}_${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        workerId: worker.id,
        workerName: worker.name,
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: `Alerte pour ${worker.name}`,
        timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        acknowledged: Math.random() > 0.7,
        resolvedAt: Math.random() > 0.8 ? new Date().toISOString() : undefined
      }));
  }, []);
  
  // =================== CALCULS ET FILTRES ===================
  
  const calculateStats = useCallback((workers: Worker[], alerts: PresenceAlert[]): WorkerPresenceStats => {
    const onSite = workers.filter(w => w.presence.isOnSite).length;
    const offSite = workers.filter(w => !w.presence.isOnSite).length;
    const unknown = workers.filter(w => w.status === 'unknown').length;
    
    const byDepartment = workers.reduce((acc, worker) => {
      acc[worker.department] = (acc[worker.department] || 0) + (worker.presence.isOnSite ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
    
    const byZone = workers.reduce((acc, worker) => {
      if (worker.presence.isOnSite) {
        acc[worker.location.zone] = (acc[worker.location.zone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const byRole = workers.reduce((acc, worker) => {
      acc[worker.role] = (acc[worker.role] || 0) + (worker.presence.isOnSite ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
    
    const criticalAlerts = alerts.filter(a => !a.acknowledged && (a.severity === 'high' || a.severity === 'critical')).length;
    
    // Calculate LOTO lock statistics
    const allLocks = workers.flatMap(w => w.assignedLocks || []);
    const totalLocks = allLocks.length;
    const activeLocks = allLocks.filter(l => l.status === 'applied' || l.status === 'verified').length;
    
    const locksByType = allLocks.reduce((acc, lock) => {
      acc[lock.energyType] = (acc[lock.energyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const locksByWorker = workers.reduce((acc, worker) => {
      if (worker.assignedLocks && worker.assignedLocks.length > 0) {
        acc[worker.name] = worker.assignedLocks.length;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalWorkers: workers.length,
      onSite,
      offSite,
      unknown,
      byDepartment,
      byZone,
      byRole,
      criticalAlerts,
      lastUpdate: new Date().toISOString(),
      // LOTO statistics
      totalLocks,
      activeLocks,
      locksByType,
      locksByWorker
    };
  }, []);
  
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      // Filtre de recherche
      if (searchTerm && !worker.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !worker.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre de département
      if (filterDepartment !== 'all' && worker.department !== filterDepartment) {
        return false;
      }
      
      // Filtre de statut
      if (filterStatus === 'onSite' && !worker.presence.isOnSite) return false;
      if (filterStatus === 'offSite' && worker.presence.isOnSite) return false;
      if (filterStatus === 'alerts') {
        const hasAlert = alerts.some(alert => alert.workerId === worker.id && !alert.acknowledged);
        if (!hasAlert) return false;
      }
      
      return true;
    });
  }, [workers, searchTerm, filterDepartment, filterStatus, alerts]);
  
  // =================== EFFETS ===================
  
  // Chargement initial et refresh périodique
  useEffect(() => {
    const loadData = () => {
      setIsRefreshing(true);
      const mockWorkers = generateMockWorkers();
      const mockAlerts = generateMockAlerts(mockWorkers);
      
      setWorkers(mockWorkers);
      setAlerts(mockAlerts);
      setStats(calculateStats(mockWorkers, mockAlerts));
      setIsRefreshing(false);
    };
    
    loadData();
    const interval = setInterval(loadData, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [generateMockWorkers, generateMockAlerts, calculateStats, refreshInterval]);
  
  // =================== GESTIONNAIRES D'ÉVÉNEMENTS ===================
  
  const handleRefresh = useCallback(() => {
    const mockWorkers = generateMockWorkers();
    const mockAlerts = generateMockAlerts(mockWorkers);
    
    setWorkers(mockWorkers);
    setAlerts(mockAlerts);
    setStats(calculateStats(mockWorkers, mockAlerts));
  }, [generateMockWorkers, generateMockAlerts, calculateStats]);
  
  const handleWorkerClick = useCallback((worker: Worker) => {
    setSelectedWorker(worker);
    onWorkerSelected?.(worker);
  }, [onWorkerSelected]);
  
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);
  
  const formatDuration = (checkInTime: string): string => {
    const duration = Date.now() - new Date(checkInTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  const getStatusColor = (status: WorkerStatus): string => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'break': return '#f59e0b';
      case 'lunch': return '#3b82f6';
      case 'meeting': return '#8b5cf6';
      case 'emergency': return '#ef4444';
      case 'offline': return '#6b7280';
      default: return '#9ca3af';
    }
  };
  
  const getAlertColor = (severity: PresenceAlert['severity']): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#6b7280';
    }
  };
  
  // =================== RENDU ===================
  
  return (
    <>
      {/* Styles CSS intégrés */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .presence-dashboard {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(100, 116, 139, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .dashboard-header {
            background: rgba(59, 130, 246, 0.1);
            border-bottom: 1px solid rgba(59, 130, 246, 0.3);
            padding: 20px;
          }
          
          .dashboard-title {
            color: #3b82f6;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
            margin: 20px 0;
          }
          
          .stat-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: transform 0.2s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-2px);
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 800;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
          }
          
          .stat-label {
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .controls-section {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
            margin: 20px 0;
            padding: 16px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
          }
          
          .search-input,
          .filter-select {
            padding: 8px 12px;
            border-radius: 8px;
            border: 2px solid rgba(100, 116, 139, 0.3);
            background: rgba(15, 23, 42, 0.8);
            color: white;
            font-size: 14px;
          }
          
          .search-input:focus,
          .filter-select:focus {
            outline: none;
            border-color: #3b82f6;
          }
          
          .action-btn {
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
            border-color: #3b82f6;
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
          }
          
          .btn-primary:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-emergency {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
          
          .workers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
            padding: 20px;
          }
          
          .worker-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .worker-card:hover {
            transform: translateY(-2px);
            border-color: #3b82f6;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
          }
          
          .worker-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          
          .worker-name {
            color: #e2e8f0;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          .worker-role {
            color: #94a3b8;
            font-size: 12px;
          }
          
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            border: 1px solid;
          }
          
          .worker-details {
            display: grid;
            gap: 8px;
            margin-top: 12px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .detail-label {
            color: #94a3b8;
          }
          
          .detail-value {
            color: #e2e8f0;
            font-weight: 500;
          }
          
          .alerts-section {
            margin-top: 20px;
            padding: 20px;
          }
          
          .alert-item {
            background: rgba(15, 23, 42, 0.8);
            border-left: 4px solid;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .alert-content {
            flex: 1;
          }
          
          .alert-title {
            color: #e2e8f0;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          .alert-message {
            color: #94a3b8;
            font-size: 12px;
          }
          
          .alert-actions {
            display: flex;
            gap: 8px;
          }
          
          .compact-mode {
            max-height: 400px;
            overflow-y: auto;
          }
          
          .emergency-banner {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 16px 20px;
            text-align: center;
            font-weight: 600;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          .device-status {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
          }
          
          .device-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 4px;
          }
          
          .connected {
            background: #22c55e;
          }
          
          .disconnected {
            background: #ef4444;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .workers-grid {
              grid-template-columns: 1fr;
              padding: 10px;
            }
            
            .controls-section {
              flex-direction: column;
              align-items: stretch;
            }
            
            .controls-section > * {
              width: 100%;
            }
          }
        `
      }} />

      <div className={`presence-dashboard ${compactMode ? 'compact-mode' : ''}`}>
        {/* Banner d'urgence */}
        {emergencyMode && (
          <div className="emergency-banner">
            🚨 MODE URGENCE ACTIVÉ - COMPTABILISATION DES TRAVAILLEURS EN COURS 🚨
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <h3 className="dashboard-title">
            <Users size={24} />
            {t.title}
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            {t.subtitle}
          </p>
          
          {/* Statistiques principales */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">{t.stats.totalWorkers}</div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>
                {stats.totalWorkers}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">{t.stats.onSite}</div>
              <div className="stat-value" style={{ color: '#22c55e' }}>
                {stats.onSite}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">{t.stats.offSite}</div>
              <div className="stat-value" style={{ color: '#6b7280' }}>
                {stats.offSite}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">{t.stats.criticalAlerts}</div>
              <div className="stat-value" style={{ color: stats.criticalAlerts > 0 ? '#ef4444' : '#22c55e' }}>
                {stats.criticalAlerts}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">🔒 {t.stats.totalLocks}</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {stats.totalLocks}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">🔓 {t.stats.activeLocks}</div>
              <div className="stat-value" style={{ color: stats.activeLocks > 0 ? '#ef4444' : '#22c55e' }}>
                {stats.activeLocks}
              </div>
            </div>
            
            {!compactMode && (
              <div className="stat-card">
                <div className="stat-label">{t.stats.lastUpdate}</div>
                <div className="stat-value" style={{ color: '#f59e0b', fontSize: '14px' }}>
                  {new Date(stats.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contrôles */}
        <div className="controls-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t.actions.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ minWidth: '200px' }}
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t.filters.all} - {t.filters.department}</option>
            {Object.keys(stats.byDepartment).map(dept => (
              <option key={dept} value={dept}>{dept} ({stats.byDepartment[dept]})</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">{t.filters.all}</option>
            <option value="onSite">{t.filters.onSite}</option>
            <option value="offSite">{t.filters.offSite}</option>
            <option value="alerts">{t.filters.alerts}</option>
          </select>
          
          <button
            className="action-btn btn-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {t.actions.refresh}
          </button>
          
          <button
            className="action-btn btn-emergency"
            onClick={() => setEmergencyMode(!emergencyMode)}
          >
            <Bell size={14} />
            {t.actions.emergency}
          </button>
          
          <button className="action-btn btn-primary">
            <Download size={14} />
            {t.actions.export}
          </button>
        </div>

        {/* Liste des travailleurs */}
        <div className="workers-grid">
          {filteredWorkers.map((worker) => {
            const workerAlerts = alerts.filter(alert => alert.workerId === worker.id && !alert.acknowledged);
            
            return (
              <div
                key={worker.id}
                className="worker-card"
                onClick={() => handleWorkerClick(worker)}
                style={{
                  borderLeftColor: worker.presence.isOnSite ? '#22c55e' : '#6b7280',
                  borderLeftWidth: '4px'
                }}
              >
                <div className="worker-header">
                  <div>
                    <h4 className="worker-name">{worker.name}</h4>
                    <p className="worker-role">{worker.role} • {worker.department}</p>
                  </div>
                  
                  <div className="status-badge" style={{
                    backgroundColor: `${getStatusColor(worker.status)}20`,
                    borderColor: getStatusColor(worker.status),
                    color: getStatusColor(worker.status)
                  }}>
                    {t.status[worker.status]}
                  </div>
                </div>
                
                <div className="worker-details">
                  <div className="detail-row">
                    <span className="detail-label">
                      <MapPin size={12} style={{ marginRight: '4px' }} />
                      Zone:
                    </span>
                    <span className="detail-value">{worker.location.zone}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">
                      <Clock size={12} style={{ marginRight: '4px' }} />
                      {worker.presence.isOnSite ? t.presence.duration : t.presence.lastActivity}:
                    </span>
                    <span className="detail-value">
                      {worker.presence.isOnSite && worker.presence.checkInTime
                        ? formatDuration(worker.presence.checkInTime)
                        : new Date(worker.presence.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">
                      <QrCode size={12} style={{ marginRight: '4px' }} />
                      Méthode:
                    </span>
                    <span className="detail-value">{t.methods[worker.presence.method]}</span>
                  </div>
                  
                  {worker.assignedLocks && worker.assignedLocks.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">
                        <Lock size={12} style={{ marginRight: '4px' }} />
                        Cadenas LOTO:
                      </span>
                      <span className="detail-value" style={{ color: '#f59e0b', fontWeight: '600' }}>
                        {worker.assignedLocks.length} actif{worker.assignedLocks.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Statut de l'appareil */}
                <div className="device-status">
                  <div className={`device-indicator ${worker.device.connected ? 'connected' : 'disconnected'}`} />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {worker.device.connected ? t.device.connected : t.device.disconnected}
                  </span>
                  
                  {worker.device.connected && worker.device.batteryLevel && (
                    <>
                      <Battery size={12} style={{ marginLeft: '8px', color: '#94a3b8' }} />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {worker.device.batteryLevel}%
                      </span>
                    </>
                  )}
                </div>
                
                {/* Alertes */}
                {workerAlerts.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {workerAlerts.slice(0, 2).map(alert => (
                      <div
                        key={alert.id}
                        style={{
                          fontSize: '11px',
                          color: getAlertColor(alert.severity),
                          background: `${getAlertColor(alert.severity)}20`,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <AlertTriangle size={10} />
                        {t.alerts[alert.type]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section des alertes */}
        {!compactMode && alerts.filter(a => !a.acknowledged).length > 0 && (
          <div className="alerts-section">
            <h4 style={{ color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              {t.alerts.title} ({alerts.filter(a => !a.acknowledged).length})
            </h4>
            
            {alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className="alert-item"
                style={{ borderLeftColor: getAlertColor(alert.severity) }}
              >
                <div className="alert-content">
                  <h5 className="alert-title">{alert.workerName}</h5>
                  <p className="alert-message">
                    {t.alerts[alert.type]} • {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="alert-actions">
                  <button
                    className="action-btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeAlert(alert.id);
                    }}
                    style={{ fontSize: '10px', padding: '4px 8px' }}
                  >
                    {t.alerts.acknowledge}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Résumé en mode compact */}
        {compactMode && (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(100, 116, 139, 0.3)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              {filteredWorkers.length} travailleurs affichés • 
              Dernière MAJ: {new Date(stats.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkerPresenceDashboard;