// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/REGULATIONS.TS ===================
// Types TypeScript pour réglementations provinciales et conformité réglementaire canadienne
"use client";

import type { ProvinceCode } from '../constants/provinces';
import type { PersonnelRole } from './personnel';
import type { ProcedureType } from './procedures';
import type { Timestamped, BilingualText, PriorityLevel } from './index';

// =================== TYPES DE BASE ===================

export type RegulatoryAuthority = 
  | 'federal'                  // Fédéral
  | 'provincial'               // Provincial
  | 'territorial'              // Territorial
  | 'municipal'                // Municipal
  | 'international'            // International
  | 'industry';                // Industrie/Association

export type StandardType = 
  | 'mandatory'                // Obligatoire
  | 'recommended'              // Recommandé
  | 'voluntary'                // Volontaire
  | 'best_practice'            // Meilleure pratique
  | 'guidance'                 // Guide
  | 'technical';               // Technique

export type ComplianceStatus = 
  | 'compliant'                // Conforme
  | 'non_compliant'            // Non conforme
  | 'partially_compliant'      // Partiellement conforme
  | 'under_review'             // Sous révision
  | 'pending'                  // En attente
  | 'not_applicable'           // Non applicable
  | 'exempted';                // Exempté

export type EnforcementLevel = 
  | 'advisory'                 // Avisoire
  | 'administrative'           // Administratif
  | 'financial'                // Financier
  | 'operational'              // Opérationnel
  | 'criminal'                 // Criminel
  | 'civil';                   // Civil

export type JurisdictionCode = ProvinceCode | 'CA' | 'US' | 'INTL';

// =================== INTERFACES PRINCIPALES ===================

export interface RegulatoryStandard extends Timestamped {
  id: string;                              // ID unique standard
  code: string;                            // Code officiel (ex: RSST Art. 297)
  title: BilingualText;                    // Titre officiel bilingue
  shortTitle: BilingualText;               // Titre abrégé
  description: BilingualText;              // Description détaillée
  type: StandardType;                      // Type standard
  authority: {                            // Autorité émettrice
    type: RegulatoryAuthority;
    name: BilingualText;                  // Nom officiel
    acronym: string;                      // Acronyme (CNESST, OHSA, etc.)
    jurisdiction: JurisdictionCode[];     // Juridictions
    website: string;                      // Site web officiel
    contactInfo: {                       // Coordonnées
      phone: string;
      email: string;
      address: BilingualText;
      emergencyLine?: string;
    };
    mandate: BilingualText;               // Mandat
    powers: BilingualText[];              // Pouvoirs
  };
  hierarchy: {                            // Hiérarchie réglementaire
    parent?: string;                      // Standard parent
    children?: string[];                  // Standards enfants
    level: number;                        // Niveau hiérarchique
    section: string;                      // Section/Article
    subsection?: string;                  // Sous-section
    paragraph?: string;                   // Paragraphe
    references: string[];                 // Références croisées
  };
  scope: {                               // Portée d'application
    applicability: BilingualText;         // Applicabilité
    workplaces: string[];                 // Types milieux travail
    activities: string[];                 // Activités visées
    equipment: string[];                  // Équipements concernés
    substances: string[];                 // Substances réglementées
    personnel: PersonnelRole[];           // Personnel visé
    exclusions: BilingualText[];          // Exclusions
    thresholds: Array<{                  // Seuils déclencheurs
      parameter: string;
      value: number;
      unit: string;
      condition: BilingualText;
    }>;
  };
  requirements: Array<{                   // Exigences
    id: string;
    category: string;                     // Catégorie exigence
    requirement: BilingualText;           // Exigence détaillée
    mandatory: boolean;                   // Obligatoire
    measurable: boolean;                  // Mesurable
    criteria: BilingualText[];            // Critères conformité
    verification: {                      // Méthodes vérification
      methods: string[];
      frequency: string;
      responsible: PersonnelRole[];
      documentation: string[];
    };
    deadlines: Array<{                   // Échéances
      description: BilingualText;
      date: string;
      type: 'implementation' | 'compliance' | 'reporting' | 'renewal';
      grace_period?: number;              // Période grâce (jours)
    }>;
    penalties: Array<{                   // Pénalités non-conformité
      type: 'warning' | 'fine' | 'order' | 'prosecution' | 'closure';
      description: BilingualText;
      amount?: {                        // Montant si amende
        min: number;
        max: number;
        currency: string;
      };
      conditions: BilingualText[];
    }>;
  }>;
  compliance: {                          // Conformité
    assessmentMethods: Array<{           // Méthodes évaluation
      method: string;
      description: BilingualText;
      frequency: string;
      cost?: number;
      duration?: number;                  // Minutes
      expertise: string[];
    }>;
    documentation: Array<{               // Documentation requise
      document: BilingualText;
      type: 'record' | 'certificate' | 'report' | 'plan' | 'log';
      retention: number;                  // Années conservation
      accessibility: string[];           // Qui doit y avoir accès
      format: 'paper' | 'electronic' | 'both';
    }>;
    reporting: {                        // Rapports obligatoires
      required: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'event_driven';
      format: string;
      recipients: string[];
      deadline: string;                   // Délai soumission
      consequences: BilingualText[];      // Conséquences retard
    };
    auditing: {                         // Audit/inspection
      frequency: string;
      notice: number;                     // Préavis (heures)
      scope: string[];
      inspector_powers: BilingualText[];
      cooperation_required: boolean;
      obstruction_penalties: BilingualText[];
    };
  };
  updates: {                             // Mises à jour
    version: string;                      // Version actuelle
    effectiveDate: string;                // Date entrée vigueur
    lastRevision: string;                 // Dernière révision
    nextReview?: string;                  // Prochaine révision prévue
    changeHistory: Array<{               // Historique changements
      version: string;
      date: string;
      type: 'amendment' | 'clarification' | 'correction' | 'addition';
      summary: BilingualText;
      impact: 'major' | 'minor' | 'administrative';
      transitionPeriod?: number;          // Période transition (mois)
    }>;
    notifications: {                     // Notifications changements
      subscription: boolean;              // Abonnement disponible
      channels: string[];                 // Canaux notification
      advance_notice: number;             // Préavis (jours)
    };
  };
  interpretation: {                      // Interprétation
    guidelines: Array<{                  // Guides d'interprétation
      title: BilingualText;
      document: string;                   // URL document
      summary: BilingualText;
      examples: BilingualText[];
    }>;
    precedents: Array<{                  // Précédents juridiques
      case: string;                       // Référence cause
      court: string;                      // Tribunal
      date: string;
      ruling: BilingualText;              // Décision
      impact: BilingualText;              // Impact sur interprétation
    }>;
    clarifications: Array<{              // Clarifications officielles
      question: BilingualText;
      answer: BilingualText;
      source: string;                     // Source clarification
      date: string;
      binding: boolean;                   // Caractère contraignant
    }>;
  };
  enforcement: {                         // Application
    inspectorPowers: BilingualText[];     // Pouvoirs inspecteurs
    violationTypes: Array<{              // Types violations
      type: string;
      description: BilingualText;
      severity: 'minor' | 'moderate' | 'major' | 'critical';
      typical_penalty: BilingualText;
    }>;
    appealProcess: {                     // Processus appel
      available: boolean;
      timeLimit: number;                  // Délai (jours)
      authority: string;                  // Autorité d'appel
      procedure: BilingualText;
      costs: BilingualText;
    };
    statistics: {                        // Statistiques application
      inspections_per_year: number;
      violations_found: number;
      penalties_issued: number;
      average_fine: number;
      compliance_rate: number;            // Taux conformité %
    };
  };
  resources: {                           // Ressources
    training: Array<{                    // Formations disponibles
      provider: string;
      course: BilingualText;
      duration: number;                   // Heures
      cost?: number;
      certification: boolean;
      online: boolean;
    }>;
    tools: Array<{                       // Outils conformité
      name: BilingualText;
      type: 'checklist' | 'calculator' | 'template' | 'software' | 'app';
      url?: string;
      cost: 'free' | 'paid' | 'subscription';
      description: BilingualText;
    }>;
    consultants: Array<{                 // Consultants spécialisés
      organization: string;
      services: BilingualText[];
      certification: string[];
      contact: string;
      coverage: ProvinceCode[];
    }>;
  };
  relatedStandards: Array<{              // Standards connexes
    standardId: string;
    relationship: 'references' | 'referenced_by' | 'complements' | 'supersedes' | 'superseded_by';
    description: BilingualText;
    relevance: 'high' | 'medium' | 'low';
  }>;
}

export interface ComplianceRequirement extends Timestamped {
  id: string;                             // ID exigence
  standardId: string;                     // ID standard parent
  code: string;                           // Code exigence
  title: BilingualText;                   // Titre exigence
  description: BilingualText;             // Description détaillée
  category: string;                       // Catégorie
  mandatory: boolean;                     // Caractère obligatoire
  applicability: {                       // Applicabilité
    workplaces: string[];                 // Milieux travail
    activities: string[];                 // Activités
    conditions: BilingualText[];          // Conditions d'application
    exemptions: BilingualText[];          // Exemptions
    thresholds: Array<{                  // Seuils déclencheurs
      parameter: string;
      operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
      value: number;
      unit: string;
    }>;
  };
  specifications: {                      // Spécifications techniques
    technical: BilingualText[];           // Exigences techniques
    performance: Array<{                 // Critères performance
      metric: string;
      target: number;
      tolerance: number;
      unit: string;
      measurement: string;
    }>;
    qualitative: BilingualText[];         // Critères qualitatifs
    standards_referenced: string[];       // Standards référencés
  };
  implementation: {                      // Implémentation
    timeline: Array<{                    // Échéancier
      milestone: BilingualText;
      deadline: string;
      critical: boolean;
    }>;
    resources: Array<{                   // Ressources requises
      type: 'personnel' | 'equipment' | 'training' | 'documentation' | 'financial';
      description: BilingualText;
      quantity?: number;
      cost?: number;
    }>;
    responsibilities: Array<{            // Responsabilités
      role: PersonnelRole;
      tasks: BilingualText[];
      authority: BilingualText[];
      accountability: BilingualText[];
    }>;
    dependencies: Array<{                // Dépendances
      requirement: string;
      type: 'prerequisite' | 'concurrent' | 'subsequent';
      description: BilingualText;
    }>;
  };
  verification: {                        // Vérification conformité
    methods: Array<{                     // Méthodes vérification
      method: string;
      description: BilingualText;
      frequency: string;
      responsible: PersonnelRole;
      tools: string[];
      cost?: number;
    }>;
    evidence: Array<{                    // Preuves requises
      type: 'document' | 'record' | 'measurement' | 'observation' | 'testimony';
      description: BilingualText;
      format: string;
      retention: number;                  // Années
      access: PersonnelRole[];
    }>;
    nonCompliance: {                     // Non-conformité
      indicators: BilingualText[];        // Indicateurs
      consequences: BilingualText[];      // Conséquences
      corrective_actions: BilingualText[];// Actions correctives
      timeframes: Array<{                // Délais correction
        action: BilingualText;
        deadline: number;                 // Jours
        escalation?: BilingualText;
      }>;
    };
  };
  monitoring: {                          // Surveillance continue
    indicators: Array<{                  // Indicateurs performance
      name: string;
      description: BilingualText;
      measurement: string;
      frequency: string;
      target?: number;
      alert_threshold?: number;
    }>;
    reporting: {                         // Rapports
      frequency: string;
      format: string;
      recipients: PersonnelRole[];
      content: BilingualText[];
    };
    review: {                           // Révision périodique
      frequency: string;
      triggers: BilingualText[];          // Déclencheurs révision
      scope: BilingualText[];             // Portée révision
      participants: PersonnelRole[];
    };
  };
}

export interface SafetyStandard extends RegulatoryStandard {
  safetySpecific: {                      // Spécifique sécurité
    hazardCategories: Array<{            // Catégories dangers
      category: string;
      description: BilingualText;
      examples: BilingualText[];
      controls: BilingualText[];
      monitoring: string[];
    }>;
    riskAssessment: {                    // Évaluation risques
      required: boolean;
      methodology: string[];
      frequency: string;
      qualifications: string[];
      documentation: boolean;
      review_triggers: BilingualText[];
    };
    incidentReporting: {                 // Signalement incidents
      mandatory: boolean;
      timeframe: number;                  // Heures
      authorities: string[];
      investigation: {
        required: boolean;
        timeline: number;                 // Jours
        qualifications: string[];
        report_deadline: number;          // Jours
      };
    };
    emergencyPreparedness: {             // Préparation urgence
      planRequired: boolean;
      components: BilingualText[];
      testing_frequency: string;
      training_requirements: BilingualText[];
      communication_systems: string[];
    };
    personalProtection: {                // Protection individuelle
      required: string[];                 // EPI requis
      standards: string[];                // Normes EPI
      maintenance: BilingualText[];       // Entretien
      replacement: BilingualText[];       // Remplacement
      training: boolean;                  // Formation utilisation
    };
  };
}

export interface IndustryStandard extends RegulatoryStandard {
  industrySpecific: {                    // Spécifique industrie
    sector: string;                       // Secteur industrie
    applicableIndustries: string[];       // Industries applicables
    technicalCommittee: {               // Comité technique
      organization: string;
      members: string[];
      expertise: string[];
      meeting_frequency: string;
    };
    consensusProcess: {                  // Processus consensus
      development_stages: BilingualText[];
      public_review: boolean;
      comment_period: number;             // Jours
      balloting: boolean;
      appeals_process: boolean;
    };
    adoption: {                          // Adoption
      voluntary: boolean;
      regulatory_reference: string[];     // Références réglementaires
      certification_schemes: string[];    // Schémas certification
      market_adoption: number;            // % adoption marché
    };
    maintenance: {                       // Maintenance standard
      review_cycle: number;               // Années
      update_triggers: BilingualText[];
      backward_compatibility: boolean;
      transition_periods: Array<{
        version: string;
        duration: number;                 // Mois
        support_level: string;
      }>;
    };
  };
}

export interface InternationalStandard extends RegulatoryStandard {
  internationalSpecific: {               // Spécifique international
    organization: 'ISO' | 'IEC' | 'ITU' | 'CODEX' | 'WHO' | 'ILO' | 'IMO' | 'ICAO' | 'other';
    adoptionStatus: {                    // Statut adoption
      canada: 'adopted' | 'modified' | 'referenced' | 'under_consideration' | 'rejected';
      provinces: Record<ProvinceCode, 'adopted' | 'modified' | 'referenced' | 'under_consideration' | 'rejected'>;
      modifications: BilingualText[];     // Modifications canadiennes
    };
    harmonization: {                     // Harmonisation
      regions: string[];                  // Régions harmonisées
      trade_agreements: string[];         // Accords commerciaux
      mutual_recognition: string[];       // Reconnaissance mutuelle
      barriers: BilingualText[];          // Obstacles commerciaux
    };
    implementation: {                    // Implémentation
      national_body: string;              // Organisme national
      local_adaptation: boolean;
      support_documents: BilingualText[];
      training_available: boolean;
      certification_available: boolean;
    };
  };
}

// =================== CONFORMITÉ ET AUDIT ===================

export interface ComplianceMatrix {
  organizationId: string;                 // ID organisation
  facilityId?: string;                    // ID installation
  assessmentDate: string;                 // Date évaluation
  assessor: {                            // Évaluateur
    name: string;
    qualifications: string[];
    organization: string;
    certification: string[];
  };
  scope: {                               // Portée évaluation
    standards: string[];                  // Standards évalués
    departments: string[];                // Départements
    activities: string[];                 // Activités
    personnel: number;                    // Nombre employés
  };
  results: Array<{                       // Résultats par standard
    standardId: string;
    requirements: Array<{                // Exigences évaluées
      requirementId: string;
      status: ComplianceStatus;
      evidence: string[];                 // Preuves conformité
      gaps: BilingualText[];              // Écarts identifiés
      recommendations: BilingualText[];   // Recommandations
      priority: PriorityLevel;
      deadline?: string;                  // Échéance correction
    }>;
    overallCompliance: number;            // Conformité globale %
    riskRating: 'low' | 'medium' | 'high' | 'critical';
  }>;
  summary: {                             // Résumé global
    totalRequirements: number;            // Total exigences
    compliantCount: number;               // Conformes
    nonCompliantCount: number;            // Non conformes
    partiallyCompliantCount: number;      // Partiellement conformes
    overallComplianceRate: number;        // Taux conformité global %
    riskProfile: {                       // Profil risque
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  actionPlan: Array<{                    // Plan d'action
    priority: PriorityLevel;
    action: BilingualText;
    responsible: string;
    deadline: string;
    resources: string[];
    success_criteria: BilingualText[];
    dependencies: string[];
    status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  }>;
  followUp: {                            // Suivi
    nextAssessment: string;               // Prochaine évaluation
    milestoneReviews: Array<{            // Révisions jalons
      date: string;
      scope: string[];
      responsible: string;
    }>;
    continuousMonitoring: {              // Surveillance continue
      indicators: string[];
      frequency: string;
      reporting: string;
    };
  };
}

export interface RegulatoryAudit extends Timestamped {
  id: string;                             // ID audit
  type: 'regulatory' | 'compliance' | 'certification' | 'surveillance' | 'special';
  initiator: {                          // Initiateur
    type: 'regulator' | 'organization' | 'third_party' | 'complaint';
    name: string;
    authority?: string;
    mandate?: BilingualText;
  };
  scope: {                               // Portée audit
    standards: string[];                  // Standards audités
    facilities: string[];                // Installations
    timeframe: {                         // Période
      start: string;
      end: string;
      coverage: string;                   // Période couverte
    };
    sampling: {                          // Échantillonnage
      method: string;
      size: number;
      criteria: BilingualText;
    };
  };
  methodology: {                         // Méthodologie
    approach: string[];                   // Approches utilisées
    standards: string[];                  // Standards audit
    tools: string[];                      // Outils utilisés
    interviews: {                        // Entrevues
      conducted: number;
      roles: PersonnelRole[];
      duration: number;                   // Heures totales
    };
    documentation: {                     // Révision documentaire
      documents_reviewed: number;
      categories: string[];
      completeness: number;               // % complétude
    };
    observations: {                      // Observations terrain
      sites_visited: number;
      duration: number;                   // Heures
      activities_observed: string[];
    };
  };
  team: Array<{                          // Équipe audit
    name: string;
    role: 'lead_auditor' | 'auditor' | 'technical_specialist' | 'observer';
    qualifications: string[];
    experience: string;
    independence: boolean;
    conflicts?: BilingualText[];
  }>;
  findings: Array<{                      // Constatations
    id: string;
    type: 'violation' | 'non_conformity' | 'deficiency' | 'best_practice' | 'recommendation';
    severity: 'critical' | 'major' | 'minor' | 'observation';
    standard: string;                     // Standard concerné
    requirement: string;                  // Exigence
    description: BilingualText;           // Description constatation
    evidence: BilingualText[];            // Preuves
    location?: string;                    // Lieu
    personnel?: string[];                 // Personnel impliqué
    immediate_risk: boolean;              // Risque immédiat
    regulatory_consequence: BilingualText;// Conséquence réglementaire
    recommendation: BilingualText;        // Recommandation
  }>;
  enforcement: Array<{                   // Mesures d'application
    findingId: string;                    // Constatation liée
    action: 'warning' | 'order' | 'fine' | 'prosecution' | 'closure' | 'license_suspension';
    description: BilingualText;           // Description mesure
    amount?: number;                      // Montant si amende
    deadline?: string;                    // Échéance
    appeal_rights: BilingualText;         // Droits d'appel
    compliance_verification: {           // Vérification conformité
      required: boolean;
      method: string;
      deadline?: string;
    };
  }>;
  report: {                              // Rapport audit
    executive_summary: BilingualText;     // Résumé exécutif
    methodology_summary: BilingualText;   // Résumé méthodologie
    key_findings: BilingualText[];        // Constatations clés
    recommendations: Array<{             // Recommandations
      priority: PriorityLevel;
      recommendation: BilingualText;
      timeline: string;
      responsible: string[];
      resources?: BilingualText;
    }>;
    distribution: {                      // Distribution
      recipients: string[];
      confidentiality: 'public' | 'restricted' | 'confidential';
      publication_date?: string;
    };
  };
  followUp: {                            // Suivi
    corrective_actions: Array<{          // Actions correctives
      action: BilingualText;
      responsible: string;
      deadline: string;
      status: 'planned' | 'in_progress' | 'completed' | 'overdue';
      verification: {                    // Vérification
        method: string;
        date?: string;
        result?: BilingualText;
      };
    }>;
    monitoring: {                        // Surveillance
      frequency: string;
      indicators: string[];
      reporting: string;
      duration: string;                   // Durée surveillance
    };
    next_audit: {                        // Prochain audit
      scheduled: boolean;
      date?: string;
      scope?: string[];
      triggers?: BilingualText[];
    };
  };
}

export interface ViolationRecord extends Timestamped {
  id: string;                             // ID violation
  organizationId: string;                 // ID organisation
  facilityId?: string;                    // ID installation
  violation: {                           // Violation
    standard: string;                     // Standard violé
    requirement: string;                  // Exigence
    description: BilingualText;           // Description violation
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    category: string;                     // Catégorie violation
    discovery: {                         // Découverte
      method: 'inspection' | 'audit' | 'complaint' | 'incident' | 'self_report';
      date: string;
      discoverer: string;
      circumstances: BilingualText;
    };
  };
  investigation: {                       // Enquête
    investigator: string;                 // Enquêteur
    start_date: string;                   // Début enquête
    completion_date?: string;             // Fin enquête
    methodology: BilingualText;           // Méthodologie
    evidence: Array<{                    // Preuves
      type: 'document' | 'photo' | 'video' | 'testimony' | 'measurement';
      description: BilingualText;
      source: string;
      date: string;
      reliability: 'high' | 'medium' | 'low';
    }>;
    root_cause: BilingualText;            // Cause racine
    contributing_factors: BilingualText[];// Facteurs contributeurs
  };
  enforcement: {                         // Application
    actions: Array<{                     // Mesures prises
      type: 'warning' | 'order' | 'fine' | 'prosecution' | 'administrative';
      description: BilingualText;
      date: string;
      amount?: number;                    // Montant si applicable
      deadline?: string;                  // Échéance
      authority: string;                  // Autorité
    }>;
    appeals: Array<{                     // Appels
      date: string;
      grounds: BilingualText;             // Motifs
      authority: string;                  // Instance d'appel
      status: 'pending' | 'upheld' | 'overturned' | 'modified';
      decision?: BilingualText;
    }>;
  };
  remediation: {                         // Correction
    immediate_actions: BilingualText[];   // Actions immédiates
    corrective_plan: {                   // Plan correctif
      actions: Array<{
        action: BilingualText;
        responsible: string;
        deadline: string;
        status: 'planned' | 'in_progress' | 'completed' | 'overdue';
        verification: {
          required: boolean;
          method?: string;
          date?: string;
          result?: BilingualText;
        };
      }>;
      completion_date?: string;
      effectiveness: {                   // Efficacité
        assessed: boolean;
        date?: string;
        result?: BilingualText;
        follow_up?: BilingualText[];
      };
    };
    preventive_measures: BilingualText[]; // Mesures préventives
  };
  impact: {                              // Impact
    operational: BilingualText;           // Impact opérationnel
    financial: {                         // Impact financier
      fines: number;
      remediation_costs: number;
      lost_production: number;
      legal_costs: number;
      total: number;
    };
    reputational: BilingualText;          // Impact réputationnel
    regulatory: BilingualText;            // Impact réglementaire
  };
  lessons_learned: BilingualText[];       // Leçons apprises
  status: 'open' | 'under_remediation' | 'closed' | 'appealed';
}

// =================== MISES À JOUR RÉGLEMENTAIRES ===================

export interface RegulatoryUpdate extends Timestamped {
  id: string;                             // ID mise à jour
  type: 'new_regulation' | 'amendment' | 'clarification' | 'repeal' | 'consolidation';
  priority: PriorityLevel;                // Priorité
  source: {                              // Source
    authority: string;                    // Autorité
    document: string;                     // Document source
    reference: string;                    // Référence officielle
    publication_date: string;             // Date publication
    effective_date: string;               // Date entrée vigueur
  };
  affected_standards: Array<{            // Standards affectés
    standardId: string;
    change_type: 'new' | 'modified' | 'deleted' | 'superseded';
    sections: string[];                   // Sections affectées
    impact: 'major' | 'minor' | 'technical';
    summary: BilingualText;
  }>;
  changes: {                             // Changements
    summary: BilingualText;               // Résumé changements
    detailed: Array<{                    // Détails par section
      section: string;
      old_text?: BilingualText;          // Ancien texte
      new_text?: BilingualText;          // Nouveau texte
      change_type: 'addition' | 'modification' | 'deletion';
      rationale: BilingualText;          // Justification
    }>;
    technical_changes: BilingualText[];   // Changements techniques
    procedural_changes: BilingualText[];  // Changements procéduraux
  };
  impact_assessment: {                   // Évaluation impact
    affected_organizations: number;       // Organisations affectées
    implementation_cost: {               // Coût implémentation
      low_estimate: number;
      high_estimate: number;
      currency: string;
      basis: BilingualText;
    };
    compliance_timeline: {               // Échéancier conformité
      immediate: BilingualText[];         // Actions immédiates
      short_term: Array<{                // Court terme (3-6 mois)
        action: BilingualText;
        deadline: string;
      }>;
      medium_term: Array<{               // Moyen terme (6-18 mois)
        action: BilingualText;
        deadline: string;
      }>;
      long_term: Array<{                 // Long terme (18+ mois)
        action: BilingualText;
        deadline: string;
      }>;
    };
    benefits: BilingualText[];            // Bénéfices attendus
    challenges: BilingualText[];          // Défis identifiés
  };
  implementation_support: {              // Support implémentation
    guidance_documents: Array<{          // Documents guide
      title: BilingualText;
      url?: string;
      summary: BilingualText;
      audience: string[];
    }>;
    training_available: boolean;
    webinars: Array<{                    // Webinaires
      title: BilingualText;
      date: string;
      duration: number;                   // Minutes
      registration_url?: string;
      recording_url?: string;
    }>;
    consultation_available: boolean;
    transition_period: {                 // Période transition
      duration: number;                   // Mois
      provisions: BilingualText[];        // Dispositions transitoires
      enforcement_approach: BilingualText;
    };
  };
  notification: {                        // Notification
    channels: string[];                   // Canaux utilisés
    audiences: string[];                  // Audiences cibles
    languages: string[];                  // Langues disponibles
    timeline: {                          // Échéancier notification
      advance_notice: number;             // Préavis (jours)
      reminders: number[];                // Rappels (jours avant)
      follow_up: number;                  // Suivi (jours après)
    };
  };
  feedback: {                            // Rétroaction
    consultation_period?: {              // Période consultation
      start: string;
      end: string;
      methods: string[];
    };
    comments_received: number;            // Commentaires reçus
    major_concerns: BilingualText[];      // Préoccupations majeures
    modifications_made: BilingualText[];  // Modifications apportées
  };
  tracking: {                            // Suivi
    awareness_rate: number;               // Taux sensibilisation %
    compliance_rate: number;              // Taux conformité %
    implementation_challenges: BilingualText[];
    success_stories: BilingualText[];
    lessons_learned: BilingualText[];
  };
}

export interface StandardRevision extends Timestamped {
  id: string;                             // ID révision
  standardId: string;                     // ID standard
  revision_type: 'periodic' | 'triggered' | 'emergency' | 'harmonization';
  trigger: {                             // Déclencheur
    type: 'scheduled' | 'incident' | 'technology' | 'best_practice' | 'stakeholder_request';
    description: BilingualText;
    date: string;
    urgency: PriorityLevel;
  };
  revision_process: {                    // Processus révision
    committee: {                         // Comité révision
      chair: string;
      members: Array<{
        name: string;
        organization: string;
        expertise: string[];
        role: string;
      }>;
      secretariat: string;
    };
    methodology: {                       // Méthodologie
      research_methods: string[];
      consultation_methods: string[];
      validation_methods: string[];
      consensus_threshold: number;        // % consensus requis
    };
    timeline: {                          // Échéancier
      phases: Array<{
        name: string;
        start_date: string;
        end_date: string;
        deliverables: BilingualText[];
        milestones: BilingualText[];
      }>;
      total_duration: number;             // Mois
    };
  };
  stakeholder_engagement: {              // Engagement parties prenantes
    identification: Array<{              // Identification
      stakeholder: string;
      type: 'regulator' | 'industry' | 'labor' | 'academic' | 'public' | 'international';
      interest: BilingualText;
      influence: 'high' | 'medium' | 'low';
    }>;
    consultation: Array<{                // Consultation
      method: 'survey' | 'workshop' | 'interview' | 'focus_group' | 'public_hearing';
      participants: number;
      date: string;
      key_input: BilingualText[];
    }>;
    feedback_analysis: {                 // Analyse rétroaction
      themes: BilingualText[];
      consensus_areas: BilingualText[];
      contentious_issues: BilingualText[];
      resolution_approach: BilingualText[];
    };
  };
  research_findings: {                   // Résultats recherche
    literature_review: {                 // Revue littérature
      sources: number;
      key_findings: BilingualText[];
      gaps_identified: BilingualText[];
    };
    comparative_analysis: {              // Analyse comparative
      jurisdictions: string[];
      approaches: BilingualText[];
      best_practices: BilingualText[];
      lessons_learned: BilingualText[];
    };
    case_studies: Array<{                // Études de cas
      title: BilingualText;
      organization: string;
      methodology: string;
      findings: BilingualText[];
      implications: BilingualText[];
    }>;
    expert_input: Array<{                // Avis experts
      expert: string;
      credentials: string;
      opinion: BilingualText;
      evidence: BilingualText[];
    }>;
  };
  proposed_changes: Array<{              // Changements proposés
    section: string;
    change_type: 'addition' | 'modification' | 'deletion' | 'restructure';
    current_provision: BilingualText;
    proposed_provision: BilingualText;
    justification: BilingualText;
    impact_assessment: {
      operational: BilingualText;
      financial: BilingualText;
      safety: BilingualText;
      compliance: BilingualText;
    };
    stakeholder_support: {
      supporters: string[];
      opponents: string[];
      neutral: string[];
      key_arguments: BilingualText[];
    };
  }>;
  validation: {                          // Validation
    pilot_testing: {                     // Tests pilotes
      conducted: boolean;
      sites?: number;
      duration?: number;                  // Mois
      results?: BilingualText[];
    };
    peer_review: {                       // Révision par pairs
      reviewers: string[];
      methodology: string;
      findings: BilingualText[];
      recommendations: BilingualText[];
    };
    regulatory_review: {                 // Révision réglementaire
      authority: string;
      scope: BilingualText;
      approval_status: 'pending' | 'approved' | 'conditional' | 'rejected';
      conditions?: BilingualText[];
    };
  };
  finalization: {                        // Finalisation
    consensus_achieved: boolean;
    final_vote: {                        // Vote final
      date: string;
      participants: number;
      in_favor: number;
      against: number;
      abstentions: number;
      result: 'adopted' | 'rejected' | 'deferred';
    };
    publication: {                       // Publication
      date: string;
      version: string;
      distribution: string[];
      languages: string[];
    };
    implementation: {                    // Implémentation
      effective_date: string;
      transition_period: number;          // Mois
      support_materials: BilingualText[];
      training_plan: BilingualText;
    };
  };
  post_implementation: {                 // Post-implémentation
    monitoring: {                        // Surveillance
      indicators: string[];
      frequency: string;
      responsible: string;
      reporting: string;
    };
    evaluation: {                        // Évaluation
      schedule: string;
      criteria: BilingualText[];
      methodology: string;
      stakeholders: string[];
    };
    continuous_improvement: {            // Amélioration continue
      feedback_mechanisms: string[];
      review_triggers: BilingualText[];
      update_process: BilingualText;
    };
  };
}

export interface ComplianceAlert extends Timestamped {
  id: string;                             // ID alerte
  type: 'regulatory_change' | 'deadline_approaching' | 'non_compliance' | 'audit_required' | 'training_due';
  priority: PriorityLevel;                // Priorité
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  scope: {                               // Portée
    organizations: string[];              // Organisations affectées
    standards: string[];                  // Standards concernés
    jurisdictions: JurisdictionCode[];    // Juridictions
    activities: string[];                 // Activités affectées
  };
  message: {                             // Message
    title: BilingualText;                 // Titre alerte
    summary: BilingualText;               // Résumé
    details: BilingualText;               // Détails complets
    implications: BilingualText[];        // Implications
    recommendations: BilingualText[];     // Recommandations
  };
  timeline: {                            // Échéancier
    effective_date?: string;              // Date entrée vigueur
    deadline?: string;                    // Échéance action
    grace_period?: number;                // Période grâce (jours)
    milestone_dates: Array<{             // Dates jalons
      milestone: BilingualText;
      date: string;
      critical: boolean;
    }>;
  };
  actions_required: Array<{              // Actions requises
    action: BilingualText;
    responsible: PersonnelRole[];
    deadline: string;
    priority: PriorityLevel;
    estimated_effort: string;
    dependencies: string[];
    resources: BilingualText[];
  }>;
  resources: {                           // Ressources
    guidance_documents: Array<{
      title: BilingualText;
      url?: string;
      type: 'guide' | 'checklist' | 'template' | 'faq';
    }>;
    training_available: boolean;
    expert_contacts: Array<{
      name: string;
      organization: string;
      expertise: string[];
      contact: string;
    }>;
    tools_available: Array<{
      name: BilingualText;
      type: 'software' | 'calculator' | 'checklist';
      url?: string;
      cost: 'free' | 'paid';
    }>;
  };
  tracking: {                            // Suivi
    acknowledgment: {                    // Accusé réception
      required: boolean;
      deadline?: string;
      acknowledged_by: string[];
    };
    progress: {                          // Progrès
      tracked: boolean;
      milestones: Array<{
        description: BilingualText;
        target_date: string;
        status: 'pending' | 'in_progress' | 'completed' | 'overdue';
        completion_date?: string;
      }>;
    };
    escalation: {                        // Escalade
      triggers: BilingualText[];
      levels: Array<{
        level: string;
        responsible: PersonnelRole;
        actions: BilingualText[];
        timeframe: number;                // Heures
      }>;
    };
  };
  distribution: {                        // Distribution
    channels: string[];                   // Canaux diffusion
    audiences: PersonnelRole[];           // Audiences cibles
    delivery_confirmation: boolean;       // Confirmation livraison
    read_receipts: boolean;               // Accusés lecture
  };
  follow_up: {                           // Suivi
    reminders: Array<{                   // Rappels
      date: string;
      type: 'gentle' | 'firm' | 'urgent';
      message: BilingualText;
    }>;
    status_updates: Array<{              // Mises à jour statut
      date: string;
      status: BilingualText;
      details: BilingualText;
      next_steps: BilingualText[];
    }>;
    closure: {                           // Fermeture
      criteria: BilingualText[];
      verification: string;
      documentation: boolean;
    };
  };
}

// =================== EXPORT TYPES ===================

export type {
  RegulatoryAuthority,
  StandardType,
  ComplianceStatus,
  EnforcementLevel,
  JurisdictionCode,
  RegulatoryStandard,
  ComplianceRequirement,
  SafetyStandard,
  IndustryStandard,
  InternationalStandard,
  ComplianceMatrix,
  RegulatoryAudit,
  ViolationRecord,
  RegulatoryUpdate,
  StandardRevision,
  ComplianceAlert
};
