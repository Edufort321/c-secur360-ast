import { useState, useEffect, useCallback } from 'react';

// =================== INTERFACES ===================

export interface WorkerExportData {
  astId: string;
  astTitle: string;
  tenant: string;
  workers: any[];
  stats: any;
  lastUpdated: string;
}

export interface HRModuleData {
  workerId: string;
  employeeName: string;
  employeeNumber: string;
  company: string;
  workLocation: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalWorkTime: number; // en minutes
  consentAST: boolean;
  consentSignatureDate: string;
  lockStatus: 'applied' | 'removed' | 'n/a';
  certifications: string[];
  lastActivity: string;
}

export interface DashboardSummary {
  totalActiveProjects: number;
  totalActiveWorkers: number;
  totalWorkHours: number;
  locksStatusSummary: {
    applied: number;
    removed: number;
    na: number;
  };
  complianceRate: number; // % signatures AST
  averageProjectTime: number;
  alertsCount: number;
}

// =================== HOOK PRINCIPAL ===================

interface WorkerRegistryHook {
  // Données actuelles
  workersData: WorkerExportData | null;
  hrData: HRModuleData[];
  dashboardSummary: DashboardSummary | null;
  
  // État de connexion
  isConnected: boolean;
  lastUpdate: string;
  
  // Fonctions utilitaires
  getWorkerById: (id: string) => HRModuleData | null;
  getWorkersByLocation: (location: string) => HRModuleData[];
  getActiveWorkers: () => HRModuleData[];
  getComplianceReport: () => {
    total: number;
    compliant: number;
    nonCompliant: number;
    percentage: number;
  };
  
  // Filtres pour le module RH
  getAttendanceData: (dateFrom?: string, dateTo?: string) => HRModuleData[];
  getTimeReport: () => {
    totalHours: number;
    averageHours: number;
    longestSession: number;
    shortestSession: number;
  };
  
  // Export pour intégrations externes
  exportToCSV: () => string;
  exportToJSON: () => string;
}

export const useWorkerRegistry = (): WorkerRegistryHook => {
  // =================== ÉTATS ===================
  
  const [workersData, setWorkersData] = useState<WorkerExportData | null>(null);
  const [hrData, setHRData] = useState<HRModuleData[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  // =================== CALLBACKS POUR RECEVOIR LES DONNÉES ===================
  
  const handleWorkersExport = useCallback((data: WorkerExportData) => {
    setWorkersData(data);
    setLastUpdate(data.lastUpdated);
    setIsConnected(true);
  }, []);

  const handleHRDataExport = useCallback((data: HRModuleData[]) => {
    setHRData(data);
  }, []);

  const handleDashboardSummaryExport = useCallback((summary: DashboardSummary) => {
    setDashboardSummary(summary);
  }, []);

  // =================== FONCTIONS UTILITAIRES ===================
  
  const getWorkerById = useCallback((id: string): HRModuleData | null => {
    return hrData.find(worker => worker.workerId === id) || null;
  }, [hrData]);

  const getWorkersByLocation = useCallback((location: string): HRModuleData[] => {
    return hrData.filter(worker => worker.workLocation === location);
  }, [hrData]);

  const getActiveWorkers = useCallback((): HRModuleData[] => {
    return hrData.filter(worker => worker.clockInTime && !worker.clockOutTime);
  }, [hrData]);

  const getComplianceReport = useCallback(() => {
    const total = hrData.length;
    const compliant = hrData.filter(worker => worker.consentAST).length;
    const nonCompliant = total - compliant;
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;

    return { total, compliant, nonCompliant, percentage };
  }, [hrData]);

  const getAttendanceData = useCallback((dateFrom?: string, dateTo?: string): HRModuleData[] => {
    if (!dateFrom && !dateTo) return hrData;

    return hrData.filter(worker => {
      const workerDate = worker.clockInTime ? new Date(worker.clockInTime) : null;
      if (!workerDate) return false;

      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from && workerDate < from) return false;
      if (to && workerDate > to) return false;

      return true;
    });
  }, [hrData]);

  const getTimeReport = useCallback(() => {
    const workTimes = hrData.map(worker => worker.totalWorkTime).filter(time => time > 0);
    
    const totalHours = Math.round(workTimes.reduce((sum, time) => sum + time, 0) / 60);
    const averageHours = workTimes.length > 0 ? Math.round((totalHours / workTimes.length)) : 0;
    const longestSession = Math.round(Math.max(...workTimes, 0) / 60);
    const shortestSession = Math.round(Math.min(...workTimes.filter(t => t > 0), 0) / 60);

    return { totalHours, averageHours, longestSession, shortestSession };
  }, [hrData]);

  const exportToCSV = useCallback((): string => {
    if (hrData.length === 0) return '';

    const headers = [
      'ID Travailleur', 'Nom', 'Numéro Employé', 'Entreprise', 'Emplacement',
      'Début Travaux', 'Fin Travaux', 'Temps Total (min)', 'Consentement AST',
      'Date Signature', 'Statut Cadenas', 'Certifications', 'Dernière Activité'
    ];

    const rows = hrData.map(worker => [
      worker.workerId,
      worker.employeeName,
      worker.employeeNumber,
      worker.company,
      worker.workLocation,
      worker.clockInTime || '',
      worker.clockOutTime || '',
      worker.totalWorkTime.toString(),
      worker.consentAST ? 'Oui' : 'Non',
      worker.consentSignatureDate,
      worker.lockStatus,
      worker.certifications.join('; '),
      worker.lastActivity
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }, [hrData]);

  const exportToJSON = useCallback((): string => {
    return JSON.stringify({
      workersData,
      hrData,
      dashboardSummary,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }, [workersData, hrData, dashboardSummary]);

  // =================== EFFET DE NETTOYAGE ===================
  
  useEffect(() => {
    // Nettoyer les données obsolètes après 5 minutes d'inactivité
    const cleanup = setTimeout(() => {
      if (lastUpdate && new Date().getTime() - new Date(lastUpdate).getTime() > 5 * 60 * 1000) {
        setIsConnected(false);
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(cleanup);
  }, [lastUpdate]);

  // =================== RETOUR DU HOOK ===================
  
  return {
    // Données
    workersData,
    hrData,
    dashboardSummary,
    
    // État
    isConnected,
    lastUpdate,
    
    // Fonctions utilitaires
    getWorkerById,
    getWorkersByLocation,
    getActiveWorkers,
    getComplianceReport,
    getAttendanceData,
    getTimeReport,
    exportToCSV,
    exportToJSON,
    
    // Callbacks (pour être passés aux composants WorkerRegistry)
    handleWorkersExport,
    handleHRDataExport,
    handleDashboardSummaryExport
  } as WorkerRegistryHook & {
    handleWorkersExport: (data: WorkerExportData) => void;
    handleHRDataExport: (data: HRModuleData[]) => void;
    handleDashboardSummaryExport: (summary: DashboardSummary) => void;
  };
};

// =================== EXPORT D'UTILITAIRES ===================

export const WorkerRegistryUtils = {
  // Formater le temps de travail
  formatWorkTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  },

  // Obtenir le statut de présence
  getPresenceStatus: (worker: HRModuleData): 'present' | 'absent' | 'completed' => {
    if (worker.clockInTime && !worker.clockOutTime) return 'present';
    if (worker.clockInTime && worker.clockOutTime) return 'completed';
    return 'absent';
  },

  // Calculer la conformité
  calculateComplianceScore: (workers: HRModuleData[]): number => {
    if (workers.length === 0) return 100;
    const compliant = workers.filter(w => w.consentAST && w.lockStatus !== 'n/a').length;
    return Math.round((compliant / workers.length) * 100);
  },

  // Générer un rapport de sécurité
  generateSafetyReport: (workers: HRModuleData[]) => ({
    totalWorkers: workers.length,
    locksApplied: workers.filter(w => w.lockStatus === 'applied').length,
    locksRemoved: workers.filter(w => w.lockStatus === 'removed').length,
    consentRate: workers.filter(w => w.consentAST).length,
    criticalAlerts: workers.filter(w => !w.consentAST || w.lockStatus === 'n/a').length
  })
};