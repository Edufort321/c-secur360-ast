// =================== BASE DE DONNÉES MULTI-SITES ===================

export interface DatabaseRecord {
  id: string;
  clientId: string;
  siteId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Structure des AST multi-sites
export interface MultiSiteAST extends DatabaseRecord {
  astNumber: string;
  projectName: string;
  workType: string;
  location: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: { lat: number; lng: number; };
  };
  status: 'draft' | 'active' | 'approved' | 'expired' | 'archived';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assignedUsers: string[];
  hazards: Hazard[];
  controlMeasures: ControlMeasure[];
  complianceScore: number;
  completionRate: number;
  validFrom: Date;
  validUntil: Date;
  lastReviewDate?: Date;
  nextReviewDate: Date;
}

// Structure des accidents/incidents
export interface AccidentIncident extends DatabaseRecord {
  incidentNumber: string;
  type: 'accident' | 'near_miss' | 'property_damage' | 'environmental';
  severity: 'minor' | 'moderate' | 'serious' | 'fatal';
  reportedDate: Date;
  incidentDate: Date;
  location: {
    building?: string;
    floor?: string;
    area: string;
    coordinates?: { lat: number; lng: number; };
  };
  description: string;
  injuredPerson?: {
    name: string;
    age: number;
    position: string;
    experience: string; // années d'expérience
    trainingCompleted: boolean;
  };
  witnesses: string[];
  immediateActions: string;
  rootCause: string;
  correctiveActions: {
    action: string;
    responsible: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  workDaysLost: number;
  medicalTreatment: boolean;
  costs: {
    medical: number;
    property: number;
    production: number;
    total: number;
  };
  relatedAST?: string[]; // IDs des AST liées
  status: 'reported' | 'investigating' | 'closed';
  investigationComplete: boolean;
}

// Structure des inspections
export interface Inspection extends DatabaseRecord {
  inspectionNumber: string;
  type: 'safety' | 'equipment' | 'environmental' | 'fire_safety' | 'ergonomic';
  equipmentId?: string;
  equipmentType?: string;
  inspectorName: string;
  inspectorCertifications: string[];
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  findings: {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    photo?: string;
    correctiveAction?: string;
    dueDate?: Date;
    responsible?: string;
    status: 'open' | 'resolved';
  }[];
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  nextInspectionDate: Date;
  certificateIssued: boolean;
  certificateNumber?: string;
}

// Structure des formations
export interface Training extends DatabaseRecord {
  trainingId: string;
  title: string;
  type: 'safety_orientation' | 'equipment_training' | 'emergency_procedures' | 'compliance' | 'certification';
  category: string;
  instructorName: string;
  duration: number; // en heures
  trainingDate: Date;
  expirationDate?: Date;
  attendees: {
    userId: string;
    name: string;
    position: string;
    attended: boolean;
    score?: number;
    passed: boolean;
    certificateNumber?: string;
  }[];
  materials: string[];
  evaluationRequired: boolean;
  passingScore?: number;
  refresherRequired: boolean;
  refresherInterval?: number; // en mois
}

// Structure des équipements
export interface Equipment extends DatabaseRecord {
  equipmentId: string;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiration?: Date;
  location: {
    building?: string;
    floor?: string;
    room?: string;
  };
  status: 'operational' | 'maintenance' | 'out_of_service' | 'retired';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate: Date;
  maintenanceInterval: number; // en jours
  inspections: string[]; // IDs des inspections
  certifications: {
    type: string;
    number: string;
    issuedDate: Date;
    expirationDate: Date;
    issuingAuthority: string;
  }[];
  operatorTrainingRequired: boolean;
  requiredCertifications: string[];
}

// Interfaces pour les hazards et mesures de contrôle
export interface Hazard {
  id: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  severity: number;
  riskScore: number;
  affectedBodyParts: string[];
  potentialInjuries: string[];
}

export interface ControlMeasure {
  id: string;
  hazardId: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  responsible: string;
  implementationDate: Date;
  effectiveness: number;
  verificationMethod: string;
  residualRisk: number;
}

// Classe pour les requêtes multi-sites
export class MultiSiteDatabase {
  
  // Recherche d'accidents à travers tous les sites
  static async getAccidentStatistics(
    clientId: string,
    filters?: {
      siteIds?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      severity?: string[];
      type?: string[];
    }
  ) {
    // Simulation de requête - À remplacer par vraie requête Supabase
    const mockData = {
      totalAccidents: 23,
      byType: {
        accident: 15,
        near_miss: 6,
        property_damage: 2,
        environmental: 0
      },
      bySeverity: {
        minor: 12,
        moderate: 8,
        serious: 3,
        fatal: 0
      },
      bySite: [
        { siteId: 'site_1', siteName: 'Siège Social', accidents: 8, rate: 2.1 },
        { siteId: 'site_2', siteName: 'Chantier Laval', accidents: 12, rate: 4.8 },
        { siteId: 'site_3', siteName: 'Bureau Québec', accidents: 3, rate: 1.2 }
      ],
      monthlyTrend: [
        { month: 'Jan', accidents: 2, near_miss: 1 },
        { month: 'Fév', accidents: 3, near_miss: 2 },
        { month: 'Mar', accidents: 4, near_miss: 1 },
        { month: 'Avr', accidents: 1, near_miss: 3 },
        { month: 'Mai', accidents: 3, near_miss: 0 },
        { month: 'Jui', accidents: 2, near_miss: 2 }
      ],
      workDaysLostTotal: 145,
      totalCosts: {
        medical: 12500,
        property: 8200,
        production: 45000,
        total: 65700
      },
      topCauses: [
        { cause: 'Chute de hauteur', count: 6, percentage: 26 },
        { cause: 'Contact avec équipement', count: 4, percentage: 17 },
        { cause: 'Manipulation manuelle', count: 3, percentage: 13 },
        { cause: 'Glissade/Trébuchement', count: 3, percentage: 13 }
      ],
      complianceRate: 87.3,
      investigationRate: 95.7
    };
    
    return mockData;
  }
  
  // Recherche d'AST à travers tous les sites
  static async searchAST(
    clientId: string,
    searchParams: {
      query?: string;
      siteIds?: string[];
      status?: string[];
      riskLevel?: string[];
      workType?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      assignedTo?: string[];
      complianceScoreMin?: number;
      completionRateMin?: number;
      sortBy?: 'date' | 'risk' | 'compliance' | 'completion';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
  ) {
    // Simulation de recherche - À remplacer par vraie requête Supabase
    const mockResults = {
      total: 156,
      results: [
        {
          id: 'ast_001',
          astNumber: 'AST-2024-001',
          projectName: 'Maintenance Turbine #3',
          siteName: 'Centrale Manic-5',
          workType: 'Maintenance électrique',
          status: 'approved',
          riskLevel: 'high',
          complianceScore: 95,
          completionRate: 100,
          assignedUsers: ['Jean Tremblay', 'Marie Dubois'],
          createdAt: new Date('2024-08-01'),
          nextReviewDate: new Date('2025-08-01')
        },
        {
          id: 'ast_002',
          astNumber: 'AST-2024-002',
          projectName: 'Construction Pont Section A',
          siteName: 'Chantier Laval',
          workType: 'Construction civile',
          status: 'active',
          riskLevel: 'critical',
          complianceScore: 88,
          completionRate: 85,
          assignedUsers: ['Pierre Martin', 'Sophie Gagnon'],
          createdAt: new Date('2024-08-10'),
          nextReviewDate: new Date('2024-11-10')
        }
      ],
      aggregations: {
        byStatus: {
          draft: 12,
          active: 45,
          approved: 78,
          expired: 15,
          archived: 6
        },
        byRiskLevel: {
          low: 34,
          medium: 67,
          high: 42,
          critical: 13
        },
        bySite: [
          { siteId: 'site_1', siteName: 'Siège Social', count: 45 },
          { siteId: 'site_2', siteName: 'Chantier Laval', count: 78 },
          { siteId: 'site_3', siteName: 'Bureau Québec', count: 33 }
        ],
        averageComplianceScore: 87.2,
        averageCompletionRate: 92.5
      }
    };
    
    return mockResults;
  }
  
  // Recherche d'inspections à travers tous les sites
  static async getInspectionOverview(
    clientId: string,
    filters?: {
      siteIds?: string[];
      type?: string[];
      status?: string[];
      overdue?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const mockData = {
      totalInspections: 287,
      byStatus: {
        scheduled: 45,
        in_progress: 12,
        completed: 198,
        overdue: 32
      },
      byType: {
        safety: 98,
        equipment: 125,
        environmental: 34,
        fire_safety: 23,
        ergonomic: 7
      },
      bySite: [
        { siteId: 'site_1', siteName: 'Siège Social', total: 89, overdue: 8 },
        { siteId: 'site_2', siteName: 'Chantier Laval', total: 145, overdue: 18 },
        { siteId: 'site_3', siteName: 'Bureau Québec', total: 53, overdue: 6 }
      ],
      upcomingInspections: [
        {
          id: 'insp_001',
          equipmentName: 'Grue Tour GT-150',
          siteName: 'Chantier Laval',
          type: 'equipment',
          scheduledDate: new Date('2024-08-25'),
          inspector: 'Marc Leblanc'
        },
        {
          id: 'insp_002',
          equipmentName: 'Système ventilation Bureau 4',
          siteName: 'Siège Social',
          type: 'environmental',
          scheduledDate: new Date('2024-08-27'),
          inspector: 'Sophie Gagnon'
        }
      ],
      criticalFindings: 8,
      averageRating: 'good',
      complianceRate: 94.2
    };
    
    return mockData;
  }
  
  // Tableau de bord consolidé multi-sites
  static async getConsolidatedDashboard(
    clientId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ) {
    const mockDashboard = {
      summary: {
        totalSites: 3,
        totalUsers: 156,
        totalAST: 287,
        activeAST: 198,
        expiredAST: 32,
        totalAccidents: 23,
        totalInspections: 287,
        overdueInspections: 32,
        averageComplianceScore: 87.3,
        totalTrainingHours: 1450
      },
      riskMetrics: {
        highRiskAST: 42,
        criticalRiskAST: 13,
        incidentRate: 2.8, // par 100 employés
        lostTimeInjuryRate: 1.2,
        nearMissReportingRate: 78.5,
        safetyMeetingAttendance: 92.1
      },
      complianceMetrics: {
        astComplianceRate: 87.3,
        inspectionComplianceRate: 94.2,
        trainingComplianceRate: 89.7,
        certificationExpiryAlerts: 15,
        regulatoryNonCompliances: 3
      },
      trends: {
        accidentTrend: [
          { month: 'Jan', total: 2, sites: { site_1: 1, site_2: 1, site_3: 0 } },
          { month: 'Fév', total: 3, sites: { site_1: 1, site_2: 2, site_3: 0 } },
          { month: 'Mar', total: 4, sites: { site_1: 2, site_2: 2, site_3: 0 } },
          { month: 'Avr', total: 1, sites: { site_1: 0, site_2: 1, site_3: 0 } },
          { month: 'Mai', total: 3, sites: { site_1: 1, site_2: 1, site_3: 1 } },
          { month: 'Jui', total: 2, sites: { site_1: 0, site_2: 1, site_3: 1 } }
        ],
        astCreationTrend: [
          { month: 'Jan', total: 15, approved: 12 },
          { month: 'Fév', total: 18, approved: 16 },
          { month: 'Mar', total: 22, approved: 19 },
          { month: 'Avr', total: 25, approved: 23 },
          { month: 'Mai', total: 28, approved: 25 },
          { month: 'Jui', total: 31, approved: 28 }
        ]
      },
      alerts: [
        {
          type: 'critical',
          message: '8 inspections critiques en retard sur le site Chantier Laval',
          siteId: 'site_2',
          actionRequired: true
        },
        {
          type: 'warning',
          message: '15 certifications expirent dans les 30 prochains jours',
          siteId: 'all',
          actionRequired: true
        },
        {
          type: 'info',
          message: 'Nouveau record mensuel: 28 AST créées ce mois',
          siteId: 'all',
          actionRequired: false
        }
      ],
      topPerformingSites: [
        { siteId: 'site_1', siteName: 'Siège Social', complianceScore: 94.2, incidentRate: 1.2 },
        { siteId: 'site_3', siteName: 'Bureau Québec', complianceScore: 91.8, incidentRate: 1.8 },
        { siteId: 'site_2', siteName: 'Chantier Laval', complianceScore: 79.6, incidentRate: 4.8 }
      ]
    };
    
    return mockDashboard;
  }
  
  // Recherche full-text à travers tous les types de données
  static async globalSearch(
    clientId: string,
    query: string,
    options?: {
      siteIds?: string[];
      dataTypes?: ('ast' | 'accidents' | 'inspections' | 'training' | 'equipment')[];
      limit?: number;
    }
  ) {
    // Simulation de recherche globale
    const mockResults = {
      totalResults: 45,
      resultsByType: {
        ast: 18,
        accidents: 3,
        inspections: 12,
        training: 8,
        equipment: 4
      },
      results: [
        {
          type: 'ast',
          id: 'ast_001',
          title: 'Maintenance Turbine #3',
          snippet: 'Maintenance électrique haute tension sur turbine principale...',
          siteName: 'Centrale Manic-5',
          relevanceScore: 0.95,
          lastUpdated: new Date('2024-08-15')
        },
        {
          type: 'accident',
          id: 'acc_005',
          title: 'Chute lors maintenance échelle',
          snippet: 'Accident lors de la maintenance d\'une échelle d\'accès...',
          siteName: 'Chantier Laval',
          relevanceScore: 0.87,
          lastUpdated: new Date('2024-07-22')
        },
        {
          type: 'inspection',
          id: 'insp_012',
          title: 'Inspection équipement de levage',
          snippet: 'Inspection mensuelle des équipements de levage et manutention...',
          siteName: 'Siège Social',
          relevanceScore: 0.82,
          lastUpdated: new Date('2024-08-10')
        }
      ]
    };
    
    return mockResults;
  }
  
  // Rapports comparatifs entre sites
  static async generateComparativeReport(
    clientId: string,
    reportType: 'safety' | 'compliance' | 'productivity',
    siteIds: string[],
    period: { from: Date; to: Date }
  ) {
    const mockReport = {
      reportId: `report_${Date.now()}`,
      type: reportType,
      generatedAt: new Date(),
      period,
      sites: [
        {
          siteId: 'site_1',
          siteName: 'Siège Social',
          metrics: {
            accidentRate: 1.2,
            complianceScore: 94.2,
            astCompleted: 45,
            inspectionsOnTime: 89,
            trainingCompletion: 97
          },
          rank: 1,
          trend: 'improving'
        },
        {
          siteId: 'site_2',
          siteName: 'Chantier Laval',
          metrics: {
            accidentRate: 4.8,
            complianceScore: 79.6,
            astCompleted: 78,
            inspectionsOnTime: 67,
            trainingCompletion: 82
          },
          rank: 3,
          trend: 'declining'
        },
        {
          siteId: 'site_3',
          siteName: 'Bureau Québec',
          metrics: {
            accidentRate: 1.8,
            complianceScore: 91.8,
            astCompleted: 33,
            inspectionsOnTime: 95,
            trainingCompletion: 93
          },
          rank: 2,
          trend: 'stable'
        }
      ],
      benchmarks: {
        industryAverage: {
          accidentRate: 3.2,
          complianceScore: 85.0,
          inspectionsOnTime: 78
        },
        bestInClass: {
          accidentRate: 0.8,
          complianceScore: 96.5,
          inspectionsOnTime: 98
        }
      },
      recommendations: [
        {
          siteId: 'site_2',
          priority: 'high',
          recommendation: 'Améliorer la formation sécurité et renforcer les procédures de verrouillage',
          expectedImprovement: '30% réduction accidents'
        },
        {
          siteId: 'all',
          priority: 'medium',
          recommendation: 'Standardiser les meilleures pratiques du Siège Social',
          expectedImprovement: '15% amélioration conformité'
        }
      ]
    };
    
    return mockReport;
  }
}

// Configuration pour les requêtes optimisées
export const MULTI_SITE_CONFIG = {
  // Index de base de données recommandés
  indexes: [
    'client_id, site_id, created_at',
    'client_id, type, status',
    'client_id, site_id, risk_level',
    'client_id, incident_date, severity',
    'client_id, equipment_type, next_maintenance_date'
  ],
  
  // Vues materialisées pour les rapports
  materializedViews: [
    'monthly_accident_statistics_by_site',
    'ast_compliance_dashboard',
    'equipment_maintenance_alerts',
    'training_expiry_calendar'
  ],
  
  // Cache settings
  cacheSettings: {
    dashboardData: { ttl: 300 }, // 5 minutes
    statisticsData: { ttl: 900 }, // 15 minutes
    searchResults: { ttl: 60 }    // 1 minute
  }
};