// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/PERSONNEL.TS ===================
// Types TypeScript pour personnel, certifications et qualifications de sécurité
"use client";

import type { ProvinceCode } from '../constants/provinces';
import type { Timestamped, BilingualText, GeoCoordinates } from './index';

// =================== TYPES DE BASE ===================

export type PersonnelRole = 
  | 'supervisor'               // Superviseur général
  | 'safety_officer'           // Agent de sécurité
  | 'safety_manager'           // Gestionnaire sécurité
  | 'entrant'                  // Entrant espace clos
  | 'attendant'                // Surveillant extérieur
  | 'fire_watch'               // Surveillant incendie
  | 'rescue_team'              // Équipe sauvetage
  | 'competent_person'         // Personne compétente
  | 'qualified_person'         // Personne qualifiée
  | 'authorized_person'        // Personne autorisée
  | 'crane_operator'           // Opérateur grue
  | 'rigger'                   // Gréeur
  | 'signaller'                // Signaleur
  | 'electrician'              // Électricien
  | 'welder'                   // Soudeur
  | 'inspector'                // Inspecteur
  | 'engineer'                 // Ingénieur
  | 'medical_officer'          // Officier médical
  | 'emergency_coordinator'    // Coordinateur urgence
  | 'contractor'               // Entrepreneur
  | 'visitor'                  // Visiteur
  | 'observer';                // Observateur

export type CertificationLevel = 
  | 'basic'                    // Niveau de base
  | 'intermediate'             // Niveau intermédiaire
  | 'advanced'                 // Niveau avancé
  | 'expert'                   // Niveau expert
  | 'instructor'               // Instructeur
  | 'assessor';                // Évaluateur

export type CertificationStatus = 
  | 'valid'                    // Valide
  | 'expired'                  // Expiré
  | 'suspended'                // Suspendu
  | 'revoked'                  // Révoqué
  | 'pending'                  // En attente
  | 'under_review'             // Sous révision
  | 'provisional';             // Provisoire

export type MedicalStatus = 
  | 'fit'                      // Apte
  | 'fit_with_restrictions'    // Apte avec restrictions
  | 'temporarily_unfit'        // Temporairement inapte
  | 'permanently_unfit'        // Définitivement inapte
  | 'under_evaluation'         // Sous évaluation
  | 'expired';                 // Expiré

export type TrainingStatus = 
  | 'not_started'              // Non commencée
  | 'in_progress'              // En cours
  | 'completed'                // Terminée
  | 'passed'                   // Réussie
  | 'failed'                   // Échouée
  | 'expired'                  // Expirée
  | 'refresher_required';      // Mise à jour requise

// =================== INTERFACES PRINCIPALES ===================

export interface Personnel extends Timestamped {
  id: string;                               // ID unique
  employeeNumber: string;                   // Numéro employé
  personalInfo: {                          // Informations personnelles
    firstName: string;                      // Prénom
    lastName: string;                       // Nom de famille
    preferredName?: string;                 // Nom préféré
    dateOfBirth: string;                   // Date naissance (YYYY-MM-DD)
    age: number;                           // Âge calculé
    gender?: 'M' | 'F' | 'X' | 'prefer_not_to_say';
    languages: string[];                    // Langues parlées ['fr', 'en', 'es']
    preferredLanguage: 'fr' | 'en';        // Langue préférée
  };
  contactInfo: {                           // Coordonnées
    email: string;                          // Email principal
    alternateEmail?: string;                // Email secondaire
    phone: string;                          // Téléphone principal
    alternatePhone?: string;                // Téléphone secondaire
    address: {                             // Adresse
      street: string;
      city: string;
      province: ProvinceCode;
      postalCode: string;
      country: string;
    };
    emergencyContacts: EmergencyContact[];  // Contacts urgence
  };
  employment: {                            // Emploi
    company: string;                        // Entreprise
    department: string;                     // Département
    position: string;                       // Poste
    hireDate: string;                      // Date embauche
    employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'volunteer';
    shift: 'day' | 'evening' | 'night' | 'rotating' | 'on_call';
    supervisorId?: string;                  // ID superviseur
    location: string;                       // Lieu travail
    worksite?: string;                      // Chantier actuel
  };
  roles: PersonnelRole[];                  // Rôles assignés
  primaryRole: PersonnelRole;              // Rôle principal
  certifications: Certification[];         // Certifications
  training: Training[];                    // Formations
  medicalClearance: MedicalClearance;      // Habilitation médicale
  competencies: Competency[];              // Compétences
  qualifications: Qualification[];         // Qualifications
  experience: {                           // Expérience
    totalYears: number;                    // Années totales
    relevantYears: number;                 // Années pertinentes
    specializations: string[];             // Spécialisations
    previousEmployers: Array<{             // Employeurs précédents
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      responsibilities: string[];
    }>;
    majorProjects: Array<{                 // Projets majeurs
      name: string;
      description: string;
      role: string;
      duration: string;
      achievements: string[];
    }>;
  };
  performance: {                          // Performance
    overallRating: number;                 // Note globale (1-5)
    lastEvaluation: string;                // Dernière évaluation
    strengths: string[];                   // Forces
    areasForImprovement: string[];         // Axes amélioration
    goals: Array<{                        // Objectifs
      description: string;
      targetDate: string;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  safetyRecord: {                         // Dossier sécurité
    incidentCount: number;                 // Nombre incidents
    lastIncident?: string;                 // Dernier incident
    safetyScore: number;                   // Score sécurité (0-100)
    recognitions: Array<{                 // Reconnaissances
      type: string;
      description: string;
      date: string;
      issuer: string;
    }>;
    restrictions: Array<{                 // Restrictions
      type: string;
      description: string;
      startDate: string;
      endDate?: string;
      severity: 'minor' | 'moderate' | 'major';
    }>;
  };
  availability: {                         // Disponibilité
    status: 'available' | 'unavailable' | 'limited' | 'on_leave';
    schedule: Array<{                     // Horaire
      dayOfWeek: number;                  // 0=dimanche, 6=samedi
      startTime: string;                  // HH:MM
      endTime: string;                    // HH:MM
      available: boolean;
    }>;
    timeOff: Array<{                      // Congés
      startDate: string;
      endDate: string;
      type: 'vacation' | 'sick' | 'personal' | 'training' | 'other';
      approved: boolean;
    }>;
    currentAssignments: Array<{           // Affectations actuelles
      projectId: string;
      role: PersonnelRole;
      startDate: string;
      estimatedEndDate: string;
      workload: number;                   // Pourcentage (0-100)
    }>;
  };
  preferences: {                          // Préférences
    communicationMethod: 'email' | 'phone' | 'sms' | 'app';
    notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    workPreferences: {
      preferredShift: string;
      willingToTravel: boolean;
      maxTravelDistance: number;          // km
      preferredRoles: PersonnelRole[];
      avoidedRoles?: PersonnelRole[];
    };
  };
  status: 'active' | 'inactive' | 'suspended' | 'terminated' | 'on_leave';
  metadata: {
    profilePhoto?: string;                // URL photo profil
    notes: string;                        // Notes administratives
    tags: string[];                       // Tags classification
    customFields: Record<string, any>;    // Champs personnalisés
    lastLoginAt?: number;                 // Dernière connexion
    lastActiveAt?: number;                // Dernière activité
  };
}

export interface EmergencyContact {
  id: string;                             // ID contact
  name: string;                           // Nom complet
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'colleague' | 'other';
  phone: string;                          // Téléphone principal
  alternatePhone?: string;                // Téléphone alternatif
  email?: string;                         // Email
  address?: string;                       // Adresse
  isPrimary: boolean;                     // Contact principal
  canPickup: boolean;                     // Peut récupérer en urgence
  medicalInfo?: string;                   // Infos médicales pertinentes
  notes?: string;                         // Notes additionnelles
}

// =================== CERTIFICATIONS ===================

export interface Certification extends Timestamped {
  id: string;                             // ID certification
  name: BilingualText;                    // Nom bilingue
  code: string;                           // Code certification
  type: string;                           // Type (safety, technical, medical)
  category: string;                       // Catégorie
  level: CertificationLevel;              // Niveau
  status: CertificationStatus;            // Statut
  issuingOrganization: {                  // Organisme émetteur
    name: BilingualText;
    code: string;
    country: string;
    province?: ProvinceCode;
    accreditation: string[];              // Accréditations
    website?: string;
    contactInfo?: {
      phone: string;
      email: string;
      address: string;
    };
  };
  validity: {                            // Validité
    issueDate: string;                    // Date émission
    expiryDate: string;                   // Date expiration
    isValid: boolean;                     // Valide actuellement
    daysUntilExpiry: number;              // Jours avant expiration
    renewalPeriod: number;                // Période renouvellement (jours)
    gracePeriod?: number;                 // Période grâce (jours)
    autoRenewal: boolean;                 // Renouvellement automatique
  };
  requirements: {                        // Exigences
    prerequisites: string[];              // Prérequis
    minimumAge: number;                   // Âge minimum
    medicalExam: boolean;                 // Examen médical requis
    trainingHours: number;                // Heures formation
    practicalExam: boolean;               // Examen pratique
    writtenExam: boolean;                 // Examen écrit
    continuingEducation: {               // Formation continue
      required: boolean;
      hoursPerPeriod: number;
      periodMonths: number;
    };
  };
  verification: {                        // Vérification
    certificateNumber: string;            // Numéro certificat
    verificationCode?: string;            // Code vérification
    digitalSignature?: string;            // Signature numérique
    qrCode?: string;                      // QR code vérification
    verificationUrl?: string;             // URL vérification
    lastVerified: string;                 // Dernière vérification
    verifiedBy: string;                   // Vérifié par
    isAuthentic: boolean;                 // Authentique
  };
  scope: {                               // Portée
    applicableRoles: PersonnelRole[];     // Rôles applicables
    workTypes: string[];                  // Types travaux
    equipmentTypes: string[];             // Types équipements
    hazardTypes: string[];                // Types dangers
    restrictions: string[];               // Restrictions
    geographicScope: {                   // Portée géographique
      provinces: ProvinceCode[];
      countries: string[];
      international: boolean;
    };
  };
  attachments: {                         // Pièces jointes
    certificate?: string;                 // URL certificat
    transcript?: string;                  // URL relevé
    photos?: string[];                    // URLs photos
    additionalDocs?: Array<{             // Documents additionnels
      name: string;
      type: string;
      url: string;
      uploadDate: string;
    }>;
  };
  costs: {                               // Coûts
    initialCost: number;                  // Coût initial
    renewalCost: number;                  // Coût renouvellement
    currency: string;                     // Devise
    paidBy: 'employee' | 'employer' | 'shared';
    reimbursementPolicy?: string;         // Politique remboursement
  };
  tracking: {                            // Suivi
    remindersSent: number;                // Rappels envoyés
    lastReminderDate?: string;            // Dernier rappel
    renewalStatus: 'not_due' | 'upcoming' | 'overdue' | 'in_progress' | 'completed';
    renewalApplicationDate?: string;      // Date demande renouvellement
    renewalApprovalDate?: string;         // Date approbation renouvellement
  };
}

// =================== FORMATIONS ===================

export interface Training extends Timestamped {
  id: string;                             // ID formation
  title: BilingualText;                   // Titre bilingue
  code: string;                           // Code formation
  type: 'mandatory' | 'optional' | 'refresher' | 'advanced' | 'specialized';
  category: string;                       // Catégorie
  status: TrainingStatus;                 // Statut
  provider: {                            // Fournisseur
    name: BilingualText;
    code: string;
    accreditation: string[];
    instructors: Array<{
      name: string;
      qualifications: string[];
      experience: string;
    }>;
    contactInfo: {
      phone: string;
      email: string;
      website?: string;
    };
  };
  schedule: {                            // Horaire
    startDate: string;                    // Date début
    endDate: string;                      // Date fin
    duration: {                          // Durée
      hours: number;
      days: number;
      sessions: number;
    };
    format: 'in_person' | 'online' | 'hybrid' | 'self_paced';
    location?: {                         // Lieu (si présentiel)
      name: string;
      address: string;
      coordinates?: GeoCoordinates;
    };
    sessions: Array<{                    // Séances
      date: string;
      startTime: string;
      endTime: string;
      topic: string;
      instructor: string;
      attendance?: 'present' | 'absent' | 'partial';
    }>;
  };
  content: {                             // Contenu
    objectives: BilingualText[];          // Objectifs
    modules: Array<{                     // Modules
      title: BilingualText;
      description: BilingualText;
      duration: number;                   // minutes
      materials: string[];                // Matériaux requis
      assessment?: {                     // Évaluation
        type: 'quiz' | 'practical' | 'presentation' | 'assignment';
        passingScore: number;
        maxAttempts: number;
      };
    }>;
    materials: Array<{                   // Matériaux
      name: string;
      type: 'manual' | 'video' | 'presentation' | 'document' | 'tool';
      url?: string;
      required: boolean;
    }>;
    prerequisites: string[];             // Prérequis
  };
  assessment: {                          // Évaluation
    written: {                          // Écrit
      required: boolean;
      passingScore: number;
      score?: number;
      attempts: number;
      maxAttempts: number;
      lastAttemptDate?: string;
    };
    practical: {                        // Pratique
      required: boolean;
      passingScore: number;
      score?: number;
      attempts: number;
      maxAttempts: number;
      assessor?: string;
      lastAttemptDate?: string;
    };
    overall: {                          // Global
      finalScore?: number;
      grade?: 'A' | 'B' | 'C' | 'D' | 'F' | 'Pass' | 'Fail';
      passed: boolean;
      completionDate?: string;
      certificate?: string;              // URL certificat
    };
  };
  validity: {                            // Validité
    expiryDate?: string;                 // Date expiration
    refresherRequired: boolean;           // Mise à jour requise
    refresherInterval?: number;           // Intervalle mise à jour (mois)
    lastRefresher?: string;              // Dernière mise à jour
    nextRefresherDue?: string;           // Prochaine mise à jour
  };
  compliance: {                          // Conformité
    regulatoryRequirement: boolean;       // Exigence réglementaire
    standards: string[];                  // Standards respectés
    jurisdiction: ProvinceCode[];         // Juridictions
    auditTrail: Array<{                  // Piste audit
      date: string;
      action: string;
      user: string;
      details: string;
    }>;
  };
  costs: {                               // Coûts
    tuition: number;                      // Frais scolarité
    materials: number;                    // Matériaux
    travel?: number;                      // Voyage
    accommodation?: number;               // Hébergement
    total: number;                        // Total
    currency: string;                     // Devise
    funding: {                           // Financement
      source: 'employer' | 'employee' | 'government' | 'union' | 'other';
      amount: number;
      percentage: number;
    }[];
  };
  feedback: {                            // Rétroaction
    traineeRating?: number;               // Note stagiaire (1-5)
    traineeComments?: string;             // Commentaires stagiaire
    instructorRating?: number;            // Note instructeur (1-5)
    instructorComments?: string;          // Commentaires instructeur
    improvementSuggestions?: string[];    // Suggestions amélioration
  };
}

// =================== HABILITATION MÉDICALE ===================

export interface MedicalClearance extends Timestamped {
  id: string;                             // ID habilitation
  personnelId: string;                    // ID personnel
  status: MedicalStatus;                  // Statut médical
  examinations: Array<{                   // Examens
    id: string;
    type: 'general' | 'respiratory' | 'cardiovascular' | 'vision' | 'hearing' | 'musculoskeletal' | 'psychological';
    date: string;                         // Date examen
    result: 'fit' | 'fit_with_restrictions' | 'unfit';
    restrictions?: string[];              // Restrictions spécifiques
    notes?: string;                       // Notes médicales
    physician: {                         // Médecin
      name: string;
      license: string;
      specialization?: string;
      contactInfo: {
        phone: string;
        email?: string;
        clinic: string;
      };
    };
    nextExamDue?: string;                // Prochain examen
    certificate?: string;                 // URL certificat
  }>;
  restrictions: Array<{                   // Restrictions médicales
    id: string;
    type: string;                         // Type restriction
    description: BilingualText;           // Description
    severity: 'minor' | 'moderate' | 'major' | 'absolute';
    startDate: string;                    // Date début
    endDate?: string;                     // Date fin (si temporaire)
    reviewDate?: string;                  // Date révision
    affectedActivities: string[];         // Activités affectées
    accommodations: string[];             // Accommodements requis
  }>;
  validUntil: string;                     // Valide jusqu'à
  renewalDue: string;                     // Renouvellement dû
  compliance: {                          // Conformité
    regulatoryRequirements: string[];     // Exigences réglementaires
    workplaceStandards: string[];         // Standards milieu travail
    lastAudit?: string;                   // Dernier audit
    auditResults?: string;                // Résultats audit
  };
  emergencyInfo: {                       // Info urgence
    medicalConditions: string[];          // Conditions médicales
    medications: Array<{                 // Médicaments
      name: string;
      dosage: string;
      frequency: string;
      sideEffects?: string[];
    }>;
    allergies: Array<{                   // Allergies
      allergen: string;
      severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
      symptoms: string[];
      treatment: string;
    }>;
    emergencyContacts: EmergencyContact[]; // Contacts urgence médicale
    bloodType?: string;                   // Groupe sanguin
    organDonor?: boolean;                 // Donneur organes
  };
  confidentiality: {                     // Confidentialité
    accessLevel: 'public' | 'restricted' | 'confidential' | 'top_secret';
    authorizedPersonnel: string[];        // Personnel autorisé
    dataRetentionPeriod: number;          // Période conservation (années)
    consentForms: Array<{                // Formulaires consentement
      type: string;
      signed: boolean;
      date?: string;
      witnessId?: string;
    }>;
  };
}

// =================== COMPÉTENCES ===================

export interface Competency {
  id: string;                             // ID compétence
  name: BilingualText;                    // Nom bilingue
  category: string;                       // Catégorie
  level: 'novice' | 'competent' | 'proficient' | 'expert' | 'master';
  assessment: {                          // Évaluation
    method: 'observation' | 'test' | 'simulation' | 'peer_review' | 'self_assessment';
    score: number;                        // Score (0-100)
    assessor: string;                     // Évaluateur
    date: string;                         // Date évaluation
    validUntil?: string;                  // Valide jusqu'à
    evidence: Array<{                    // Preuves
      type: 'certificate' | 'observation' | 'project' | 'reference';
      description: string;
      url?: string;
      date: string;
    }>;
  };
  requirements: {                        // Exigences
    minExperience: number;                // Expérience minimale (mois)
    requiredTraining: string[];           // Formations requises
    requiredCertifications: string[];     // Certifications requises
    prerequisites: string[];              // Prérequis
  };
  applications: {                        // Applications
    roles: PersonnelRole[];               // Rôles applicables
    tasks: string[];                      // Tâches spécifiques
    equipment: string[];                  // Équipements
    environments: string[];               // Environnements
  };
  developmentPlan: {                     // Plan développement
    currentLevel: string;                 // Niveau actuel
    targetLevel: string;                  // Niveau cible
    targetDate?: string;                  // Date cible
    actions: Array<{                     // Actions
      type: 'training' | 'practice' | 'mentoring' | 'project';
      description: string;
      deadline: string;
      status: 'planned' | 'in_progress' | 'completed';
    }>;
    mentor?: string;                      // Mentor assigné
  };
}

// =================== QUALIFICATIONS ===================

export interface Qualification {
  id: string;                             // ID qualification
  name: BilingualText;                    // Nom bilingue
  type: 'education' | 'professional' | 'trade' | 'license' | 'permit';
  level: string;                          // Niveau
  institution: {                         // Institution
    name: string;
    type: 'university' | 'college' | 'trade_school' | 'professional_body' | 'government';
    location: string;
    accreditation: string[];
  };
  details: {                             // Détails
    fieldOfStudy?: string;                // Domaine étude
    specialization?: string;              // Spécialisation
    graduationDate?: string;              // Date graduation
    gpa?: number;                         // Moyenne
    honors?: string[];                    // Distinctions
    thesis?: string;                      // Thèse
  };
  verification: {                        // Vérification
    verified: boolean;                    // Vérifié
    verificationDate?: string;            // Date vérification
    verifiedBy?: string;                  // Vérifié par
    verificationMethod?: string;          // Méthode vérification
    documentUrl?: string;                 // URL document
  };
  relevance: {                           // Pertinence
    roles: PersonnelRole[];               // Rôles pertinents
    weight: number;                       // Poids (0-100)
    required: boolean;                    // Requis
    preferred: boolean;                   // Préféré
  };
}

// =================== ÉVALUATION PERSONNEL ===================

export interface PersonnelEvaluation extends Timestamped {
  id: string;                             // ID évaluation
  personnelId: string;                    // ID personnel
  evaluatorId: string;                    // ID évaluateur
  period: {                              // Période
    startDate: string;                    // Date début
    endDate: string;                      // Date fin
    type: 'annual' | 'semi_annual' | 'quarterly' | 'probationary' | 'special';
  };
  categories: Array<{                     // Catégories
    name: string;                         // Nom catégorie
    weight: number;                       // Poids (0-100)
    criteria: Array<{                    // Critères
      name: string;
      description: string;
      score: number;                      // Score (1-5)
      comments?: string;
    }>;
    overallScore: number;                 // Score global catégorie
  }>;
  overallRating: number;                  // Note globale (1-5)
  strengths: string[];                    // Forces
  areasForImprovement: string[];          // Axes amélioration
  goals: Array<{                         // Objectifs
    description: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    progress?: number;                    // Progrès (0-100)
  }>;
  developmentPlan: {                     // Plan développement
    trainingNeeds: string[];              // Besoins formation
    mentoring: boolean;                   // Mentorat requis
    jobRotation: boolean;                 // Rotation postes
    timeline: string;                     // Échéancier
    budget?: number;                      // Budget alloué
  };
  careerDiscussion: {                    // Discussion carrière
    currentSatisfaction: number;          // Satisfaction actuelle (1-5)
    careerAspirations: string[];          // Aspirations carrière
    promotionReadiness: boolean;          // Prêt promotion
    lateralMoveInterest: boolean;         // Intérêt mouvement latéral
    retentionRisk: 'low' | 'medium' | 'high';
  };
  signatures: {                          // Signatures
    employee: {                          // Employé
      signed: boolean;
      date?: string;
      comments?: string;
    };
    evaluator: {                         // Évaluateur
      signed: boolean;
      date?: string;
      comments?: string;
    };
    reviewer?: {                         // Réviseur
      signed: boolean;
      date?: string;
      comments?: string;
    };
  };
  followUp: {                            // Suivi
    nextReviewDate: string;               // Prochaine révision
    midYearCheckIn?: string;              // Point mi-parcours
    actionItems: Array<{                 // Éléments action
      description: string;
      owner: 'employee' | 'supervisor' | 'hr';
      deadline: string;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
}

// =================== MÉTRIQUES PERFORMANCE ===================

export interface PerformanceMetrics {
  personnelId: string;                    // ID personnel
  period: {                              // Période
    startDate: string;
    endDate: string;
  };
  productivity: {                        // Productivité
    tasksCompleted: number;               // Tâches terminées
    tasksAssigned: number;                // Tâches assignées
    completionRate: number;               // Taux completion (%)
    averageTaskTime: number;              // Temps moyen tâche (heures)
    qualityScore: number;                 // Score qualité (0-100)
  };
  safety: {                             // Sécurité
    incidentCount: number;                // Nombre incidents
    nearMissCount: number;                // Nombre quasi-accidents
    safetyObservations: number;           // Observations sécurité
    safetyScore: number;                  // Score sécurité (0-100)
    complianceRate: number;               // Taux conformité (%)
  };
  attendance: {                         // Assiduité
    workDays: number;                     // Jours travaillés
    scheduledDays: number;                // Jours planifiés
    attendanceRate: number;               // Taux présence (%)
    lateArrivals: number;                 // Retards
    earlyDepartures: number;              // Départs anticipés
    absences: number;                     // Absences
  };
  quality: {                            // Qualité
    errorRate: number;                    // Taux erreur (%)
    reworkRate: number;                   // Taux reprise (%)
    customerSatisfaction?: number;        // Satisfaction client (1-5)
    peerRating?: number;                  // Note pairs (1-5)
    supervisorRating: number;             // Note superviseur (1-5)
  };
  development: {                        // Développement
    trainingHours: number;                // Heures formation
    certificationsEarned: number;         // Certifications obtenues
    skillsAcquired: string[];             // Compétences acquises
    knowledgeSharing: number;             // Partage connaissances
    mentoring: {                         // Mentorat
      asMentor: number;                   // Comme mentor
      asMentee: number;                   // Comme mentoré
    };
  };
  engagement: {                         // Engagement
    initiativesTaken: number;             // Initiatives prises
    improvementSuggestions: number;       // Suggestions amélioration
    volunteerActivities: number;          // Activités bénévoles
    teamParticipation: number;            // Participation équipe (1-5)
    leadershipDemonstrated: boolean;      // Leadership démontré
  };
}

// =================== HISTORIQUE INCIDENTS ===================

export interface IncidentHistory {
  personnelId: string;                    // ID personnel
  incidents: Array<{                     // Incidents
    id: string;                          // ID incident
    date: string;                        // Date incident
    type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security' | 'quality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;                  // Description
    location: string;                     // Lieu
    witnesses: string[];                  // Témoins
    injuryDetails?: {                    // Détails blessure
      bodyPart: string;
      injuryType: string;
      treatment: string;
      daysLost: number;
      restrictedDuty: boolean;
    };
    investigation: {                     // Enquête
      completed: boolean;
      investigator: string;
      rootCause: string;
      contributingFactors: string[];
      correctiveActions: Array<{
        description: string;
        responsible: string;
        deadline: string;
        status: 'pending' | 'in_progress' | 'completed';
      }>;
    };
    followUp: {                         // Suivi
      medicalFollowUp: boolean;
      returnToWork?: string;
      modificationsRequired: string[];
      lessonsLearned: string[];
    };
    impact: {                           // Impact
      personnelAffected: number;
      operationalImpact: string;
      financialCost?: number;
      reputationalImpact?: string;
    };
  }>;
  summary: {                            // Résumé
    totalIncidents: number;               // Total incidents
    byType: Record<string, number>;       // Par type
    bySeverity: Record<string, number>;   // Par sévérité
    trendAnalysis: {                     // Analyse tendance
      improving: boolean;
      stableRate: boolean;
      deteriorating: boolean;
      keyFactors: string[];
    };
    preventiveActions: string[];          // Actions préventives
  };
}

// =================== EXPORT TYPES ===================

export type {
  PersonnelRole,
  CertificationLevel,
  CertificationStatus,
  MedicalStatus,
  TrainingStatus,
  Personnel,
  EmergencyContact,
  Certification,
  Training,
  MedicalClearance,
  Competency,
  Qualification,
  PersonnelEvaluation,
  PerformanceMetrics,
  IncidentHistory
};
