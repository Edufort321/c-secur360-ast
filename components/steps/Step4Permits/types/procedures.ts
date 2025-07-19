// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/PROCEDURES.TS ===================
// Types TypeScript pour procédures standardisées et instructions de travail sécuritaire
"use client";

import type { ProvinceCode } from '../constants/provinces';
import type { PersonnelRole } from './personnel';
import type { GasType, MeasurementUnit } from './atmospheric';
import type { Timestamped, BilingualText, GeoCoordinates, PriorityLevel } from './index';

// =================== TYPES DE BASE ===================

export type ProcedureType = 
  | 'work_instruction'         // Instruction de travail
  | 'safety_procedure'         // Procédure sécurité
  | 'emergency_procedure'      // Procédure urgence
  | 'operating_procedure'      // Procédure opérationnelle
  | 'maintenance_procedure'    // Procédure maintenance
  | 'inspection_procedure'     // Procédure inspection
  | 'testing_procedure'        // Procédure test
  | 'calibration_procedure'    // Procédure calibration
  | 'training_procedure'       // Procédure formation
  | 'audit_procedure'          // Procédure audit
  | 'investigation_procedure'  // Procédure enquête
  | 'decontamination_procedure'; // Procédure décontamination

export type ProcedureStatus = 
  | 'draft'                    // Brouillon
  | 'under_review'             // Sous révision
  | 'approved'                 // Approuvé
  | 'active'                   // Actif
  | 'suspended'                // Suspendu
  | 'obsolete'                 // Obsolète
  | 'archived';                // Archivé

export type ProcedureComplexity = 
  | 'simple'                   // Simple (1-5 étapes)
  | 'moderate'                 // Modéré (6-15 étapes)
  | 'complex'                  // Complexe (16-30 étapes)
  | 'very_complex';            // Très complexe (30+ étapes)

export type StepType = 
  | 'action'                   // Action à effectuer
  | 'verification'             // Vérification
  | 'measurement'              // Mesure
  | 'inspection'               // Inspection
  | 'decision'                 // Point décision
  | 'warning'                  // Avertissement
  | 'note'                     // Note informative
  | 'reference'                // Référence
  | 'checkpoint';              // Point contrôle

export type HazardLevel = 
  | 'minimal'                  // Risque minimal
  | 'low'                      // Risque faible
  | 'moderate'                 // Risque modéré
  | 'high'                     // Risque élevé
  | 'severe'                   // Risque sévère
  | 'critical';                // Risque critique

// =================== INTERFACES PRINCIPALES ===================

export interface StandardProcedure extends Timestamped {
  id: string;                              // ID unique procédure
  code: string;                            // Code procédure (ex: SP-001)
  title: BilingualText;                    // Titre bilingue
  description: BilingualText;              // Description bilingue
  type: ProcedureType;                     // Type procédure
  category: string;                        // Catégorie (confined_space, hot_work, etc.)
  status: ProcedureStatus;                 // Statut
  complexity: ProcedureComplexity;         // Complexité
  priority: PriorityLevel;                 // Priorité
  version: {                              // Versioning
    current: string;                       // Version actuelle (ex: 2.1)
    previous?: string;                     // Version précédente
    nextScheduled?: string;                // Prochaine version planifiée
    changelog: Array<{                     // Journal modifications
      version: string;
      date: string;
      changes: BilingualText[];
      author: string;
      reason: string;
    }>;
  };
  scope: {                                // Portée
    applicability: BilingualText;          // Applicabilité
    limitations: BilingualText[];          // Limitations
    exclusions: BilingualText[];           // Exclusions
    jurisdiction: ProvinceCode[];          // Juridictions
    workTypes: string[];                   // Types travaux
    environments: string[];                // Environnements
    equipmentTypes: string[];              // Types équipements
  };
  prerequisites: {                        // Prérequis
    personnel: Array<{                     // Personnel requis
      role: PersonnelRole;
      minCount: number;
      maxCount?: number;
      qualifications: string[];            // Qualifications requises
      certifications: string[];           // Certifications requises
      experience: {                       // Expérience
        minYears: number;
        specificExperience?: string;
      };
    }>;
    equipment: Array<{                     // Équipement requis
      name: BilingualText;
      type: string;
      specifications: string;
      quantity: number;
      condition: string;                   // État requis
      calibration?: {                     // Calibration
        required: boolean;
        maxAge: number;                    // Jours max depuis calibration
        standard: string;
      };
    }>;
    conditions: Array<{                    // Conditions requises
      name: BilingualText;
      description: BilingualText;
      measurable: boolean;
      threshold?: {                       // Seuil si mesurable
        min?: number;
        max?: number;
        unit: MeasurementUnit;
      };
      verification: string;                // Méthode vérification
    }>;
    documentation: Array<{                 // Documentation requise
      name: BilingualText;
      type: 'permit' | 'certificate' | 'plan' | 'drawing' | 'specification' | 'other';
      mandatory: boolean;
      version?: string;
      source: string;
    }>;
  };
  steps: ProcedureStep[];                  // Étapes procédure
  checkpoints: ProcedureCheckpoint[];      // Points contrôle
  hazards: Array<{                        // Dangers identifiés
    id: string;
    name: BilingualText;
    description: BilingualText;
    level: HazardLevel;
    probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    severity: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
    riskRating: number;                    // Score risque (1-25)
    controls: Array<{                      // Contrôles
      type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
      description: BilingualText;
      effectiveness: number;               // Efficacité (0-100%)
      implementation: string;
      responsibility: PersonnelRole;
    }>;
    residualRisk: number;                  // Risque résiduel
  });
  quality: {                              // Assurance qualité
    reviewCycle: number;                   // Cycle révision (mois)
    lastReview: string;                    // Dernière révision
    nextReview: string;                    // Prochaine révision
    reviewers: Array<{                     // Réviseurs
      name: string;
      role: string;
      department: string;
      expertise: string[];
    }>;
    approvals: Array<{                     // Approbations
      level: 'technical' | 'management' | 'regulatory' | 'executive';
      approver: string;
      date: string;
      signature?: string;                  // URL signature
      conditions?: string[];               // Conditions approbation
    }>;
    effectiveness: {                       // Efficacité
      measured: boolean;
      metrics: string[];                   // Métriques utilisées
      lastAssessment?: string;             // Dernière évaluation
      score?: number;                      // Score efficacité (0-100)
      improvements: string[];              // Améliorations identifiées
    };
  };
  compliance: {                           // Conformité
    regulatoryRequirements: Array<{        // Exigences réglementaires
      standard: string;                    // Standard (RSST, OHSA, etc.)
      section: string;                     // Section spécifique
      requirement: BilingualText;          // Exigence
      compliance: boolean;                 // Conforme
      evidence?: string;                   // Preuve conformité
    }>;
    industryStandards: Array<{             // Standards industrie
      organization: string;                // Organisation (CSA, NFPA, etc.)
      standard: string;                    // Standard
      version: string;                     // Version
      applicableSections: string[];        // Sections applicables
    }>;
    auditTrail: Array<{                    // Piste audit
      date: string;
      auditor: string;
      findings: BilingualText[];
      nonConformities: Array<{
        description: BilingualText;
        severity: 'minor' | 'major' | 'critical';
        correctiveAction: BilingualText;
        targetDate: string;
        status: 'open' | 'in_progress' | 'closed';
      }>;
      overallRating: number;               // Note globale (0-100)
    }>;
  };
  performance: {                          // Performance
    usage: {                              // Utilisation
      timesUsed: number;                   // Fois utilisé
      averageDuration: number;             // Durée moyenne (minutes)
      successRate: number;                 // Taux succès (%)
      userFeedback: Array<{               // Rétroaction utilisateurs
        userId: string;
        rating: number;                    // Note (1-5)
        comments: string;
        date: string;
        improvements: string[];            // Suggestions amélioration
      }>;
    };
    incidents: {                          // Incidents liés
      total: number;                       // Total incidents
      byType: Record<string, number>;      // Par type
      bySeverity: Record<string, number>;  // Par sévérité
      trends: Array<{                     // Tendances
        period: string;
        count: number;
        severity: string;
        analysis: string;
      }>;
      preventiveActions: string[];         // Actions préventives
    };
    metrics: Array<{                      // Métriques performance
      name: string;
      value: number;
      unit: string;
      target?: number;
      trend: 'improving' | 'stable' | 'declining';
      lastMeasured: string;
    }>;
  };
  references: {                           // Références
    relatedProcedures: string[];           // Procédures liées
    supportingDocuments: Array<{           // Documents support
      name: BilingualText;
      type: string;
      url?: string;
      version: string;
      relevance: 'essential' | 'helpful' | 'reference';
    }>;
    externalReferences: Array<{            // Références externes
      title: BilingualText;
      source: string;
      url?: string;
      accessDate?: string;
      reliability: 'high' | 'medium' | 'low';
    }>;
    expertContacts: Array<{               // Contacts experts
      name: string;
      organization: string;
      expertise: string[];
      contactInfo: {
        phone?: string;
        email?: string;
      };
      availability: string;
    }>;
  };
  training: {                            // Formation
    required: boolean;                     // Formation requise
    frequency: number;                     // Fréquence (mois)
    duration: number;                      // Durée (heures)
    methods: Array<{                      // Méthodes formation
      type: 'classroom' | 'hands_on' | 'simulation' | 'online' | 'mentoring';
      duration: number;
      description: BilingualText;
      materials: string[];
    }>;
    competencyAssessment: {               // Évaluation compétences
      required: boolean;
      criteria: BilingualText[];
      passingScore: number;
      reassessmentPeriod: number;          // Mois
    };
    records: Array<{                      // Dossiers formation
      sessionId: string;
      date: string;
      participants: string[];
      instructor: string;
      effectiveness: number;               // Efficacité (0-100)
      feedback: string[];
    }>;
  };
  multimedia: {                          // Contenu multimédia
    diagrams: Array<{                     // Diagrammes
      title: BilingualText;
      type: 'flowchart' | 'layout' | 'schematic' | 'photo' | 'video';
      url: string;
      description: BilingualText;
      relevantSteps: number[];             // Étapes concernées
    }>;
    videos: Array<{                       // Vidéos
      title: BilingualText;
      url: string;
      duration: number;                    // Secondes
      language: 'fr' | 'en' | 'both';
      subtitles: boolean;
      type: 'demonstration' | 'training' | 'safety' | 'inspection';
    }>;
    animations: Array<{                   // Animations
      title: BilingualText;
      url: string;
      type: '3d' | '2d' | 'interactive';
      description: BilingualText;
      complexity: 'simple' | 'moderate' | 'complex';
    }>;
  };
}

export interface ProcedureStep {
  id: string;                             // ID étape
  sequenceNumber: number;                 // Numéro séquence
  title: BilingualText;                   // Titre étape
  description: BilingualText;             // Description détaillée
  type: StepType;                         // Type étape
  mandatory: boolean;                     // Obligatoire
  duration: {                            // Durée
    estimated: number;                    // Estimée (minutes)
    minimum?: number;                     // Minimale
    maximum?: number;                     // Maximale
    factors: string[];                    // Facteurs influence
  };
  prerequisites: {                       // Prérequis étape
    previousSteps: number[];              // Étapes précédentes requises
    conditions: BilingualText[];          // Conditions
    verifications: BilingualText[];       // Vérifications
  };
  instructions: {                        // Instructions
    action: BilingualText;                // Action à effectuer
    method: BilingualText;                // Méthode
    tools: string[];                      // Outils requis
    materials: string[];                  // Matériaux
    safety: BilingualText[];              // Consignes sécurité
    quality: BilingualText[];             // Critères qualité
  };
  verification: {                        // Vérification
    required: boolean;                    // Vérification requise
    method: string;                       // Méthode vérification
    criteria: BilingualText[];            // Critères
    tolerance?: {                        // Tolérance (si mesurable)
      min?: number;
      max?: number;
      unit: MeasurementUnit;
    };
    frequency: 'each_time' | 'periodic' | 'sample_based' | 'risk_based';
    documentation: boolean;               // Documentation requise
  };
  responsibilities: {                    // Responsabilités
    performer: PersonnelRole;             // Exécutant
    verifier?: PersonnelRole;             // Vérificateur
    supervisor?: PersonnelRole;           // Superviseur
    specialist?: PersonnelRole;           // Spécialiste si requis
  };
  riskFactors: Array<{                   // Facteurs risque
    factor: BilingualText;
    level: HazardLevel;
    mitigation: BilingualText;
    monitoring: string;
  }>;
  alternatives: Array<{                  // Alternatives
    condition: BilingualText;             // Condition d'usage
    alternativeSteps: BilingualText[];    // Étapes alternatives
    approval: PersonnelRole;              // Approbation requise
  }>;
  troubleshooting: Array<{               // Dépannage
    problem: BilingualText;               // Problème
    possibleCauses: BilingualText[];      // Causes possibles
    solutions: BilingualText[];           // Solutions
    escalation?: PersonnelRole;           // Escalade si nécessaire
  }>;
  documentation: {                       // Documentation
    recordRequired: boolean;              // Enregistrement requis
    formTemplate?: string;                // Modèle formulaire
    dataToRecord: string[];               // Données à enregistrer
    retentionPeriod: number;              // Période conservation (années)
    distribution: PersonnelRole[];        // Distribution
  };
  multimedia: {                          // Support multimédia
    images: string[];                     // URLs images
    videos: string[];                     // URLs vidéos
    animations: string[];                 // URLs animations
    audio: string[];                      // URLs audio (instructions vocales)
  };
}

export interface ProcedureCheckpoint {
  id: string;                             // ID checkpoint
  name: BilingualText;                    // Nom checkpoint
  description: BilingualText;             // Description
  type: 'safety' | 'quality' | 'compliance' | 'progress' | 'decision';
  timing: {                              // Timing
    afterStep?: number;                   // Après étape #
    beforeStep?: number;                  // Avant étape #
    timeInterval?: number;                // Intervalle temps (minutes)
    eventTriggered?: string;              // Déclenché par événement
  };
  criteria: Array<{                      // Critères validation
    criterion: BilingualText;
    type: 'boolean' | 'numeric' | 'text' | 'selection';
    required: boolean;
    acceptableValues?: any[];             // Valeurs acceptables
    threshold?: {                        // Seuil si numérique
      min?: number;
      max?: number;
      unit: MeasurementUnit;
    };
    verification: string;                 // Méthode vérification
  }>;
  actions: {                             // Actions
    onPass: BilingualText[];              // Si réussi
    onFail: BilingualText[];              // Si échec
    escalation?: {                       // Escalade
      level: PersonnelRole;
      timeframe: number;                  // Minutes
      procedure: string;
    };
    documentation: boolean;               // Documentation requise
  };
  responsibilities: {                    // Responsabilités
    checker: PersonnelRole;               // Vérificateur
    approver?: PersonnelRole;             // Approbateur
    fallback?: PersonnelRole;             // Suppléant
  };
  metrics: {                             // Métriques
    tracked: boolean;                     // Suivi activé
    kpis: string[];                       // KPIs mesurés
    targets: Record<string, number>;      // Cibles
    alerts: Array<{                      // Alertes
      condition: string;
      threshold: number;
      notification: PersonnelRole[];
    }>;
  };
}

export interface WorkInstruction extends StandardProcedure {
  taskSpecific: {                        // Spécifique à la tâche
    workType: string;                     // Type travail
    skillLevel: 'entry' | 'intermediate' | 'advanced' | 'expert';
    physicalDemands: Array<{             // Exigences physiques
      type: 'lifting' | 'climbing' | 'crawling' | 'standing' | 'repetitive';
      intensity: 'light' | 'moderate' | 'heavy';
      duration: 'intermittent' | 'continuous';
      restrictions?: string[];
    }>;
    environmentalFactors: Array<{        // Facteurs environnementaux
      factor: 'temperature' | 'humidity' | 'noise' | 'vibration' | 'lighting' | 'air_quality';
      condition: string;
      impact: 'low' | 'medium' | 'high';
      mitigation: string[];
    }>;
    toolsAndEquipment: Array<{           // Outils et équipement
      name: BilingualText;
      type: 'hand_tool' | 'power_tool' | 'measuring_device' | 'safety_equipment' | 'specialty';
      specifications: string;
      inspection: {
        required: boolean;
        frequency: string;
        criteria: string[];
      };
      maintenance: {
        schedule: string;
        procedures: string[];
        responsible: PersonnelRole;
      };
    }>;
  };
  qualityStandards: {                    // Standards qualité
    specifications: Array<{              // Spécifications
      parameter: string;
      target: number;
      tolerance: {
        upper: number;
        lower: number;
      };
      unit: MeasurementUnit;
      measurement: string;                // Méthode mesure
    }>;
    inspectionPoints: Array<{            // Points inspection
      stage: string;                      // Étape
      what: BilingualText;                // Quoi inspecter
      how: BilingualText;                 // Comment inspecter
      frequency: string;                  // Fréquence
      acceptanceCriteria: BilingualText[];// Critères acceptation
    }>;
    documentation: {                     // Documentation qualité
      required: boolean;
      forms: string[];                    // Formulaires
      records: string[];                  // Enregistrements
      retention: number;                  // Conservation (années)
    };
  };
}

export interface SafetyGuideline extends StandardProcedure {
  safetySpecific: {                      // Spécifique sécurité
    hazardAnalysis: Array<{              // Analyse dangers
      hazard: BilingualText;
      source: string;
      exposure: 'continuous' | 'frequent' | 'occasional' | 'remote';
      consequences: BilingualText[];
      likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
      riskMatrix: {                      // Matrice risque
        probability: number;              // 1-5
        severity: number;                 // 1-5
        riskScore: number;                // 1-25
        acceptability: 'acceptable' | 'tolerable' | 'unacceptable';
      };
    }>;
    protectiveMeasures: Array<{          // Mesures protection
      hierarchy: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
      measure: BilingualText;
      effectiveness: number;              // 0-100%
      implementation: {
        responsible: PersonnelRole;
        timeline: string;
        resources: string[];
        verification: string;
      };
      maintenance: {
        required: boolean;
        frequency: string;
        procedure: string;
      };
    }>;
    emergencyProcedures: Array<{         // Procédures urgence
      scenario: BilingualText;
      triggers: BilingualText[];
      immediateActions: BilingualText[];
      notifications: Array<{
        who: string;
        when: string;
        how: string;
        information: string[];
      }>;
      evacuation: {
        required: boolean;
        routes: string[];
        assemblyPoints: string[];
        accountability: string;
      };
      medicalResponse: {
        firstAid: BilingualText[];
        medicalAttention: boolean;
        transportation: string;
        documentation: string[];
      };
    }>;
    trainingRequirements: {              // Exigences formation
      initial: {
        duration: number;                 // Heures
        content: BilingualText[];
        competencies: string[];
        assessment: boolean;
      };
      refresher: {
        frequency: number;                // Mois
        duration: number;                 // Heures
        triggers: string[];               // Déclencheurs
      };
      specialized: Array<{               // Spécialisée
        topic: string;
        audience: PersonnelRole[];
        duration: number;
        prerequisites: string[];
      }>;
    };
  };
}

export interface EmergencyProcedure extends StandardProcedure {
  emergencySpecific: {                   // Spécifique urgence
    emergencyType: string;                // Type urgence
    severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
    scope: 'local' | 'facility' | 'community' | 'regional';
    triggers: Array<{                    // Déclencheurs
      condition: BilingualText;
      indicators: BilingualText[];
      threshold?: {
        value: number;
        unit: MeasurementUnit;
      };
      detection: string;                  // Méthode détection
    }>;
    responseTeam: Array<{                // Équipe réponse
      role: string;
      primary: string;                    // Titulaire principal
      backup: string;                     // Suppléant
      qualifications: string[];
      responsibilities: BilingualText[];
      contactInfo: {
        phone: string;
        radio?: string;
        pager?: string;
      };
      availability: '24/7' | 'business_hours' | 'on_call';
    }>;
    communicationPlan: {                 // Plan communication
      internalNotifications: Array<{
        audience: string;
        method: 'phone' | 'radio' | 'pa_system' | 'alarm' | 'app';
        message: BilingualText;
        timing: string;
        responsibility: string;
      }>;
      externalNotifications: Array<{
        organization: string;
        contact: string;
        trigger: string;
        information: string[];
        method: string;
      }>;
      publicCommunication: {
        required: boolean;
        channels: string[];
        spokesperson: string;
        keyMessages: BilingualText[];
      };
    };
    resources: {                         // Ressources
      equipment: Array<{
        item: BilingualText;
        location: string;
        quantity: number;
        condition: string;
        lastInspection: string;
      }>;
      personnel: Array<{
        function: string;
        count: number;
        qualifications: string[];
        source: 'internal' | 'external' | 'mutual_aid';
      }>;
      facilities: Array<{
        type: string;
        capacity: number;
        location: string;
        contactInfo: string;
        availability: string;
      }>;
    };
    recovery: {                          // Récupération
      priorities: BilingualText[];
      phases: Array<{
        name: string;
        objectives: BilingualText[];
        duration: string;
        responsible: string;
        resources: string[];
      }>;
      continuityPlanning: {
        criticalFunctions: string[];
        alternativeFacilities: string[];
        dataBackup: string;
        staffing: string;
      };
    };
  };
}

// =================== CONFORMITÉ ET AUDIT ===================

export interface ProcedureCompliance {
  procedureId: string;                    // ID procédure
  complianceAssessment: {                // Évaluation conformité
    date: string;                         // Date évaluation
    assessor: string;                     // Évaluateur
    methodology: string;                  // Méthodologie
    scope: string[];                      // Portée
    criteria: Array<{                    // Critères
      requirement: string;
      status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
      evidence: string[];
      gaps?: string[];
      recommendations?: string[];
    }>;
    overallRating: number;                // Note globale (0-100)
    certification: {                     // Certification
      achieved: boolean;
      body?: string;                      // Organisme certificateur
      certificate?: string;               // Numéro certificat
      validUntil?: string;                // Valide jusqu'à
    };
  };
  auditHistory: Array<{                  // Historique audits
    date: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer';
    auditor: string;
    findings: Array<{
      type: 'major' | 'minor' | 'observation' | 'opportunity';
      description: BilingualText;
      evidence: string[];
      requirement: string;
      recommendation: BilingualText;
    }>;
    correctiveActions: Array<{
      finding: string;
      action: BilingualText;
      responsible: string;
      targetDate: string;
      status: 'planned' | 'in_progress' | 'completed' | 'overdue';
      effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'pending';
    }>;
    followUp: {
      required: boolean;
      date?: string;
      results?: string;
    };
  }>;
}

export interface ProcedureAudit extends Timestamped {
  id: string;                             // ID audit
  procedureId: string;                    // ID procédure auditée
  type: 'scheduled' | 'triggered' | 'follow_up' | 'complaint_driven';
  scope: {                               // Portée audit
    elements: string[];                   // Éléments audités
    locations: string[];                  // Lieux
    personnel: string[];                  // Personnel audité
    timeframe: {                         // Période
      start: string;
      end: string;
    };
  };
  methodology: {                         // Méthodologie
    approach: 'document_review' | 'observation' | 'interview' | 'testing' | 'sampling';
    standards: string[];                  // Standards référence
    checklists: string[];                 // Listes vérification
    sampling: {                          // Échantillonnage
      method: string;
      size: number;
      criteria: string;
    };
  };
  team: Array<{                          // Équipe audit
    name: string;
    role: 'lead_auditor' | 'auditor' | 'technical_expert' | 'observer';
    qualifications: string[];
    experience: string;
    independence: boolean;
  }>;
  findings: Array<{                      // Constatations
    id: string;
    category: 'conformity' | 'non_conformity' | 'observation' | 'best_practice';
    severity: 'critical' | 'major' | 'minor' | 'informational';
    title: BilingualText;
    description: BilingualText;
    evidence: string[];
    requirements: string[];               // Exigences non respectées
    impact: BilingualText;
    rootCause?: BilingualText;
    recommendation: BilingualText;
  }>;
  metrics: {                             // Métriques audit
    conformityRate: number;               // Taux conformité (%)
    findingsByCategory: Record<string, number>;
    findingsBySeverity: Record<string, number>;
    trends: Array<{
      metric: string;
      current: number;
      previous?: number;
      trend: 'improving' | 'stable' | 'declining';
    }>;
  };
  actionPlan: Array<{                    // Plan d'action
    findingId: string;
    action: BilingualText;
    type: 'immediate' | 'corrective' | 'preventive' | 'improvement';
    responsible: string;
    targetDate: string;
    resources: string[];
    success: string[];                    // Critères succès
    monitoring: string;                   // Suivi
  }>;
  report: {                              // Rapport
    summary: BilingualText;
    conclusions: BilingualText[];
    recommendations: BilingualText[];
    distribution: string[];               // Distribution
    confidentiality: 'public' | 'internal' | 'restricted' | 'confidential';
    followUpRequired: boolean;
    followUpDate?: string;
  };
}

export interface ComplianceReport extends Timestamped {
  id: string;                             // ID rapport
  title: BilingualText;                   // Titre rapport
  period: {                              // Période couverte
    start: string;
    end: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  };
  scope: {                               // Portée
    procedures: string[];                 // Procédures incluses
    departments: string[];                // Départements
    locations: string[];                  // Lieux
    regulations: string[];                // Réglementations
  };
  metrics: {                             // Métriques conformité
    overallCompliance: number;            // Conformité globale (%)
    byProcedure: Record<string, number>;  // Par procédure
    byDepartment: Record<string, number>; // Par département
    byRegulation: Record<string, number>; // Par réglementation
    trends: Array<{
      period: string;
      compliance: number;
      incidents: number;
      improvements: number;
    }>;
  };
  incidents: Array<{                     // Incidents conformité
    date: string;
    type: 'violation' | 'near_miss' | 'deviation' | 'gap';
    procedure: string;
    description: BilingualText;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: BilingualText;
    rootCause: BilingualText;
    corrective: BilingualText;
    status: 'open' | 'in_progress' | 'closed';
  }>;
  improvements: Array<{                  // Améliorations
    area: string;
    description: BilingualText;
    benefit: BilingualText;
    implementation: {
      plan: BilingualText;
      timeline: string;
      resources: string[];
      responsible: string;
    };
    measurement: {
      metrics: string[];
      targets: Record<string, number>;
      review: string;
    };
  }>;
  recommendations: Array<{               // Recommandations
    priority: PriorityLevel;
    category: 'procedure_update' | 'training' | 'resource' | 'system' | 'culture';
    recommendation: BilingualText;
    justification: BilingualText;
    implementation: BilingualText;
    timeline: string;
    responsible: string;
    cost?: number;
    benefit: BilingualText;
  }>;
  distribution: {                        // Distribution
    recipients: Array<{
      name: string;
      role: string;
      department: string;
      deliveryMethod: 'email' | 'portal' | 'meeting' | 'presentation';
    }>;
    publicationDate: string;
    confidentiality: 'public' | 'internal' | 'restricted';
    retention: number;                    // Années
  };
}

// =================== RÉVISION ET AMÉLIORATION ===================

export interface ProcedureRevision extends Timestamped {
  id: string;                             // ID révision
  procedureId: string;                    // ID procédure
  version: {                             // Version
    from: string;                         // Version source
    to: string;                           // Version cible
    type: 'minor' | 'major' | 'emergency' | 'scheduled';
  };
  initiator: {                           // Initiateur
    userId: string;
    name: string;
    role: string;
    reason: BilingualText;
  };
  scope: {                               // Portée révision
    sections: string[];                   // Sections affectées
    impact: 'content' | 'format' | 'process' | 'safety' | 'compliance';
    urgency: PriorityLevel;
  };
  changes: Array<{                       // Changements
    section: string;
    type: 'addition' | 'modification' | 'deletion' | 'restructure';
    current: BilingualText;               // Contenu actuel
    proposed: BilingualText;              // Contenu proposé
    justification: BilingualText;         // Justification
    impact: BilingualText;                // Impact
    validation: {                        // Validation
      required: boolean;
      method: string;
      criteria: string[];
    };
  }>;
  reviewProcess: {                       // Processus révision
    stages: Array<{
      name: string;
      responsible: PersonnelRole;
      duration: number;                   // Jours
      criteria: string[];
      status: 'pending' | 'in_progress' | 'completed' | 'rejected';
      feedback?: BilingualText;
    }>;
    currentStage: number;
    timeline: {
      start: string;
      target: string;
      actual?: string;
    };
  };
  stakeholders: Array<{                  // Parties prenantes
    name: string;
    role: string;
    department: string;
    involvement: 'reviewer' | 'approver' | 'implementer' | 'informed';
    feedback?: {
      provided: boolean;
      date?: string;
      comments?: BilingualText;
      approval?: boolean;
    };
  }>;
  validation: {                          // Validation
    testing: {
      required: boolean;
      method?: string;
      participants?: string[];
      results?: BilingualText;
    };
    pilot: {
      required: boolean;
      scope?: string;
      duration?: number;
      results?: BilingualText;
    };
    training: {
      required: boolean;
      audience?: PersonnelRole[];
      method?: string;
      completion?: number;                // % complété
    };
  };
  implementation: {                      // Implémentation
    plan: BilingualText;
    phases: Array<{
      name: string;
      activities: BilingualText[];
      duration: number;
      responsible: string;
      dependencies: string[];
    }>;
    communication: {
      strategy: BilingualText;
      channels: string[];
      timeline: string;
      responsible: string;
    };
    monitoring: {
      metrics: string[];
      frequency: string;
      duration: number;                   // Mois
      responsible: string;
    };
  };
  outcome: {                             // Résultat
    status: 'approved' | 'rejected' | 'deferred' | 'withdrawn';
    effectiveDate?: string;
    decision: BilingualText;
    conditions?: BilingualText[];
    nextReview?: string;
  };
}

export interface ProcedureUpdate extends Timestamped {
  id: string;                             // ID mise à jour
  procedureId: string;                    // ID procédure
  updateType: 'content' | 'format' | 'reference' | 'metadata' | 'translation';
  urgency: 'routine' | 'expedited' | 'emergency';
  description: BilingualText;             // Description mise à jour
  changes: Array<{                       // Changements détaillés
    field: string;                        // Champ modifié
    oldValue: any;                        // Ancienne valeur
    newValue: any;                        // Nouvelle valeur
    reason: BilingualText;                // Raison changement
  }>;
  impact: {                              // Impact
    safety: boolean;                      // Impact sécurité
    compliance: boolean;                  // Impact conformité
    operations: boolean;                  // Impact opérations
    training: boolean;                    // Impact formation
    assessment: BilingualText;            // Évaluation impact
  };
  approval: {                            // Approbation
    required: boolean;
    level: 'supervisor' | 'manager' | 'director' | 'executive';
    approver?: string;
    date?: string;
    conditions?: BilingualText[];
  };
  implementation: {                      // Implémentation
    immediate: boolean;                   // Immédiate
    scheduled?: string;                   // Planifiée
    notification: {                      // Notification
      required: boolean;
      recipients: PersonnelRole[];
      method: string[];
      message: BilingualText;
    };
    training: {                          // Formation
      required: boolean;
      affected: PersonnelRole[];
      deadline?: string;
    };
  };
  tracking: {                            // Suivi
    distributed: boolean;                 // Distribué
    acknowledged: string[];               // Accusés réception
    implemented: boolean;                 // Implémenté
    effectiveness: {                     // Efficacité
      measured: boolean;
      date?: string;
      results?: BilingualText;
    };
  };
}

export interface ChangeRequest extends Timestamped {
  id: string;                             // ID demande changement
  title: BilingualText;                   // Titre demande
  description: BilingualText;             // Description
  requestor: {                           // Demandeur
    userId: string;
    name: string;
    department: string;
    contactInfo: string;
  };
  category: 'safety_improvement' | 'efficiency' | 'compliance' | 'cost_reduction' | 'quality' | 'other';
  priority: PriorityLevel;                // Priorité
  scope: {                               // Portée
    procedures: string[];                 // Procédures affectées
    departments: string[];                // Départements
    personnel: number;                    // Nombre personnes affectées
    systems: string[];                    // Systèmes affectés
  };
  justification: {                       // Justification
    problem: BilingualText;               // Problème actuel
    solution: BilingualText;              // Solution proposée
    benefits: BilingualText[];            // Bénéfices attendus
    risks: BilingualText[];               // Risques identifiés
    alternatives: BilingualText[];        // Alternatives considérées
  };
  impact: {                              // Impact
    safety: {
      positive: boolean;
      neutral: boolean;
      negative: boolean;
      assessment: BilingualText;
    };
    operational: {
      efficiency: number;                 // % amélioration efficacité
      quality: number;                    // % amélioration qualité
      cost: number;                       // Impact coût ($)
      timeline: string;                   // Échéancier
    };
    compliance: {
      improves: boolean;
      maintains: boolean;
      risks: boolean;
      details: BilingualText;
    };
    training: {
      required: boolean;
      audience: PersonnelRole[];
      duration: number;                   // Heures
      cost?: number;
    };
  };
  evaluation: {                          // Évaluation
    committee: string[];                  // Comité évaluation
    criteria: Array<{
      criterion: string;
      weight: number;                     // Poids (0-100)
      score?: number;                     // Score (1-5)
      comments?: BilingualText;
    }>;
    recommendation: 'approve' | 'reject' | 'defer' | 'modify';
    conditions?: BilingualText[];         // Conditions si approbation
    timeline?: string;                    // Échéancier si approuvé
  };
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'deferred' | 'implemented';
  outcome: {                             // Résultat
    decision: BilingualText;
    decisionDate?: string;
    decisionBy?: string;
    implementation?: {
      plan: BilingualText;
      responsible: string;
      timeline: string;
      budget?: number;
      success?: BilingualText[];          // Critères succès
    };
    followUp?: {
      required: boolean;
      date?: string;
      metrics?: string[];
    };
  };
}

// =================== EXPORT TYPES ===================

export type {
  ProcedureType,
  ProcedureStatus,
  ProcedureComplexity,
  StepType,
  HazardLevel,
  StandardProcedure,
  ProcedureStep,
  ProcedureCheckpoint,
  WorkInstruction,
  SafetyGuideline,
  EmergencyProcedure,
  ProcedureCompliance,
  ProcedureAudit,
  ComplianceReport,
  ProcedureRevision,
  ProcedureUpdate,
  ChangeRequest
};
