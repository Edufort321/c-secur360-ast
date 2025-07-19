// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/SIGNATURES.TS ===================
// Types TypeScript pour signatures électroniques légales avec conformité PIPEDA et eIDAS
"use client";

import type { ProvinceCode } from '../constants/provinces';
import type { PersonnelRole } from './personnel';
import type { Timestamped, BilingualText, GeoCoordinates } from './index';

// =================== TYPES DE BASE ===================

export type SignatureType = 
  | 'approval'                 // Approbation
  | 'acknowledgment'           // Accusé réception
  | 'witness'                  // Témoin
  | 'verification'             // Vérification
  | 'completion'               // Achèvement
  | 'inspection'               // Inspection
  | 'emergency'                // Urgence
  | 'modification'             // Modification
  | 'cancellation'             // Annulation
  | 'renewal'                  // Renouvellement
  | 'delegation'               // Délégation
  | 'escalation';              // Escalade

export type SignatureStatus = 
  | 'pending'                  // En attente
  | 'signed'                   // Signé
  | 'verified'                 // Vérifié
  | 'rejected'                 // Rejeté
  | 'expired'                  // Expiré
  | 'revoked'                  // Révoqué
  | 'disputed'                 // Contesté
  | 'archived';                // Archivé

export type SignatureMethod = 
  | 'digital_canvas'           // Canevas numérique
  | 'biometric'                // Biométrique
  | 'certificate_based'        // Basé certificat
  | 'pin_code'                 // Code PIN
  | 'sms_verification'         // Vérification SMS
  | 'voice_verification'       // Vérification vocale
  | 'facial_recognition'       // Reconnaissance faciale
  | 'fingerprint'              // Empreinte digitale
  | 'retinal_scan'             // Scan rétinien
  | 'hardware_token'           // Jeton matériel
  | 'smart_card'               // Carte à puce
  | 'multi_factor';            // Multi-facteurs

export type AuthenticationLevel = 
  | 'basic'                    // De base (1 facteur)
  | 'enhanced'                 // Amélioré (2 facteurs)
  | 'high'                     // Élevé (3 facteurs)
  | 'supreme'                  // Suprême (4+ facteurs)
  | 'government'               // Gouvernemental
  | 'military';                // Militaire

export type LegalFramework = 
  | 'pipeda'                   // PIPEDA (Canada)
  | 'eidas'                    // eIDAS (Europe)
  | 'esign'                    // E-SIGN Act (US)
  | 'ueta'                     // UETA (US)
  | 'uncitral'                 // UNCITRAL (ONU)
  | 'provincial'               // Lois provinciales
  | 'common_law';              // Common law

export type CryptographicStandard = 
  | 'rsa_2048'                 // RSA 2048-bit
  | 'rsa_4096'                 // RSA 4096-bit
  | 'ecdsa_p256'               // ECDSA P-256
  | 'ecdsa_p384'               // ECDSA P-384
  | 'ed25519'                  // Ed25519
  | 'sha256'                   // SHA-256
  | 'sha512'                   // SHA-512
  | 'pbkdf2'                   // PBKDF2
  | 'aes_256'                  // AES-256
  | 'aes_512';                 // AES-512

// =================== INTERFACES PRINCIPALES ===================

export interface ElectronicSignature extends Timestamped {
  id: string;                              // ID unique signature
  documentId: string;                      // ID document signé
  documentType: string;                    // Type document (permit, form, etc.)
  signatureType: SignatureType;           // Type signature
  status: SignatureStatus;                 // Statut
  method: SignatureMethod;                 // Méthode signature
  authenticationLevel: AuthenticationLevel;// Niveau authentification
  signer: {                               // Signataire
    id: string;                           // ID utilisateur
    name: string;                         // Nom complet
    email: string;                        // Email
    role: PersonnelRole;                  // Rôle
    title: string;                        // Titre/fonction
    organization: string;                 // Organisation
    department?: string;                  // Département
    employeeNumber?: string;              // Numéro employé
    certifications: string[];             // Certifications
    delegatedBy?: string;                 // Délégué par (si applicable)
    delegationExpiry?: string;            // Expiration délégation
  };
  signatureData: {                        // Données signature
    canvas?: {                           // Signature canevas
      svg: string;                        // Données SVG
      base64: string;                     // Image Base64
      width: number;                      // Largeur
      height: number;                     // Hauteur
      strokeCount: number;                // Nombre traits
      pressure?: number[];                // Données pression
      velocity?: number[];                // Données vélocité
      acceleration?: number[];            // Données accélération
      duration: number;                   // Durée signature (ms)
      complexity: number;                 // Score complexité (0-100)
    };
    biometric?: BiometricData;            // Données biométriques
    certificate?: {                      // Certificat numérique
      issuer: string;                     // Émetteur
      subject: string;                    // Sujet
      serialNumber: string;               // Numéro série
      algorithm: CryptographicStandard;   // Algorithme
      validFrom: string;                  // Valide depuis
      validTo: string;                    // Valide jusqu'à
      thumbprint: string;                 // Empreinte
      keyUsage: string[];                 // Usage clé
      crlDistribution?: string;           // Distribution CRL
      ocspUrl?: string;                   // URL OCSP
    };
    hash: string;                         // Hash signature
    encryption: CryptographicStandard;    // Standard cryptographique
    keyFingerprint: string;               // Empreinte clé
    signature: string;                    // Signature cryptographique
  };
  metadata: SignatureMetadata;            // Métadonnées
  validation: SignatureValidation;        // Validation
  legal: LegalConsent;                    // Consentement légal
  audit: SignatureAudit;                  // Audit trail
  compliance: SignatureCompliance;        // Conformité
  retention: RetentionPolicy;             // Politique conservation
  witness?: Array<{                       // Témoins (si requis)
    id: string;
    name: string;
    role: PersonnelRole;
    timestamp: number;
    signature?: string;                   // Signature témoin
    statement: BilingualText;             // Déclaration témoin
  }>;
  notarization?: {                        // Notarisation (si requis)
    notaryId: string;
    notaryName: string;
    notaryCommission: string;
    notaryExpiry: string;
    notarySignature: string;
    notaryStatement: BilingualText;
    digitalSeal?: string;                 // Sceau numérique
  };
  revocation?: {                          // Révocation (si applicable)
    reason: BilingualText;
    revokedBy: string;
    revokedAt: number;
    newSignatureRequired: boolean;
    replacementSignatureId?: string;
  };
}

export interface BiometricData {
  fingerprint?: {                         // Empreinte digitale
    template: string;                     // Template ISO 19794-2
    quality: number;                      // Qualité (0-100)
    minutiae: Array<{                    // Points caractéristiques
      x: number;
      y: number;
      angle: number;
      type: 'ridge_ending' | 'bifurcation';
    }>;
    confidence: number;                   // Confiance (0-100)
    sensor: string;                       // Type capteur
  };
  facial?: {                             // Reconnaissance faciale
    template: string;                     // Template ISO 19794-5
    landmarks: Array<{                   // Points faciaux
      x: number;
      y: number;
      type: string;
    }>;
    quality: number;                      // Qualité image
    confidence: number;                   // Confiance reconnaissance
    age?: number;                         // Âge estimé
    gender?: 'M' | 'F' | 'U';            // Genre estimé
    emotion?: string;                     // Émotion détectée
  };
  voice?: {                              // Empreinte vocale
    template: string;                     // Template vocal
    duration: number;                     // Durée (ms)
    frequency: {                         // Analyse fréquentielle
      fundamental: number;                // Fréquence fondamentale
      formants: number[];                 // Formants
      harmonics: number[];                // Harmoniques
    };
    quality: number;                      // Qualité audio
    confidence: number;                   // Confiance reconnaissance
    language: string;                     // Langue détectée
    text?: string;                        // Texte prononcé
  };
  retinal?: {                            // Scan rétinien
    template: string;                     // Template rétinien
    bloodVessels: Array<{                // Vaisseaux sanguins
      coordinates: number[][];
      width: number;
      type: 'artery' | 'vein';
    }>;
    quality: number;                      // Qualité scan
    confidence: number;                   // Confiance
    eye: 'left' | 'right';               // Œil scanné
  };
  iris?: {                               // Scan iris
    template: string;                     // Template iris
    patterns: Array<{                    // Motifs iris
      type: string;
      coordinates: number[];
      intensity: number;
    }>;
    quality: number;                      // Qualité
    confidence: number;                   // Confiance
    eye: 'left' | 'right';               // Œil scanné
    pupilDilation: number;                // Dilatation pupille
  };
  keystroke?: {                          // Dynamique frappe
    timings: number[];                    // Temps entre touches
    dwellTimes: number[];                 // Temps pression touches
    pressure?: number[];                  // Pression touches
    rhythm: number;                       // Score rythme
    confidence: number;                   // Confiance
    text: string;                         // Texte tapé
  };
  gait?: {                               // Démarche
    pattern: number[];                    // Motif démarche
    velocity: number;                     // Vélocité
    cadence: number;                      // Cadence
    stepLength: number;                   // Longueur pas
    confidence: number;                   // Confiance
    duration: number;                     // Durée analyse (ms)
  };
}

export interface SignatureMetadata {
  device: {                              // Appareil
    type: 'desktop' | 'tablet' | 'mobile' | 'kiosk' | 'specialized';
    manufacturer: string;                 // Fabricant
    model: string;                        // Modèle
    os: string;                          // Système exploitation
    browser?: string;                     // Navigateur
    app?: string;                         // Application
    version: string;                      // Version
    screenResolution: string;             // Résolution écran
    touchCapable: boolean;                // Tactile
    pressureCapable: boolean;             // Pression
    fingerprint: string;                  // Empreinte appareil
    securityLevel: 'basic' | 'enhanced' | 'hardware' | 'tee' | 'secure_element';
  };
  environment: {                         // Environnement
    timestamp: number;                    // Horodatage précis
    timezone: string;                     // Fuseau horaire
    location?: GeoCoordinates;            // Position GPS
    address?: BilingualText;              // Adresse géocodée
    network: {                           // Réseau
      ipAddress: string;                  // Adresse IP
      ipType: 'ipv4' | 'ipv6';           // Type IP
      country: string;                    // Pays
      region: string;                     // Région/Province
      city: string;                       // Ville
      isp: string;                        // Fournisseur
      vpn: boolean;                       // VPN détecté
      proxy: boolean;                     // Proxy détecté
      tor: boolean;                       // Tor détecté
    };
    session: {                           // Session
      sessionId: string;                  // ID session
      duration: number;                   // Durée session (ms)
      previousActivity: number;           // Dernière activité (ms)
      userAgent: string;                  // User agent
      referrer?: string;                  // Référent
      language: string;                   // Langue navigateur
    };
  };
  context: {                             // Contexte
    documentName: BilingualText;          // Nom document
    documentVersion: string;              // Version document
    signatureReason: BilingualText;       // Raison signature
    signatureLocation: BilingualText;     // Lieu signature
    workflowStage: string;                // Étape workflow
    requiredBy?: string;                  // Requis par
    deadline?: number;                    // Échéance
    urgency: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
    consequences: BilingualText[];        // Conséquences non-signature
  };
  behavior: {                            // Comportement
    hesitationCount: number;              // Hésitations
    correctionCount: number;              // Corrections
    avgStrokeSpeed: number;               // Vitesse moyenne trait
    totalTime: number;                    // Temps total (ms)
    activeTime: number;                   // Temps actif (ms)
    pauseTime: number;                    // Temps pause (ms)
    mouseMovements?: number[];            // Mouvements souris
    clickPattern?: number[];              // Motif clics
    scrollBehavior?: number[];            // Comportement défilement
    focusEvents?: Array<{                // Événements focus
      type: 'focus' | 'blur';
      timestamp: number;
      element: string;
    }>;
  };
  quality: {                             // Qualité
    signatureQuality: number;             // Qualité signature (0-100)
    biometricQuality?: number;            // Qualité biométrique (0-100)
    environmentalFactors: Array<{        // Facteurs environnementaux
      factor: string;
      impact: 'positive' | 'neutral' | 'negative';
      score: number;                      // Impact score
    }>;
    riskFactors: Array<{                 // Facteurs risque
      factor: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      description: BilingualText;
    }>;
    confidenceScore: number;              // Score confiance global (0-100)
    fraudRisk: number;                    // Risque fraude (0-100)
  };
}

export interface SignatureValidation {
  technical: {                           // Validation technique
    hashIntegrity: boolean;               // Intégrité hash
    timestampValid: boolean;              // Horodatage valide
    certificateValid: boolean;            // Certificat valide
    signatureValid: boolean;              // Signature valide
    biometricMatch?: number;              // Correspondance biométrique (0-100)
    deviceTrusted: boolean;               // Appareil de confiance
    locationConsistent: boolean;          // Localisation cohérente
    behaviorConsistent: boolean;          // Comportement cohérent
    noTampering: boolean;                 // Aucune altération
  };
  legal: {                              // Validation légale
    consentGiven: boolean;                // Consentement donné
    capacityVerified: boolean;            // Capacité vérifiée
    authorityVerified: boolean;           // Autorité vérifiée
    witnessRequired: boolean;             // Témoin requis
    witnessPresent?: boolean;             // Témoin présent
    notarizationRequired: boolean;        // Notarisation requise
    notarizationComplete?: boolean;       // Notarisation complète
    complianceChecked: boolean;           // Conformité vérifiée
    fraudCheck: boolean;                  // Vérification fraude
  };
  business: {                           // Validation métier
    roleAuthorized: boolean;              // Rôle autorisé
    delegationValid?: boolean;            // Délégation valide
    timelyExecution: boolean;             // Exécution dans délais
    workflowCompliant: boolean;           // Conforme workflow
    prerequisitesMet: boolean;            // Prérequis satisfaits
    conflictOfInterest: boolean;          // Conflit d'intérêts
    duressCheck: boolean;                 // Vérification contrainte
    fraudIndicators: string[];            // Indicateurs fraude
  };
  regulatory: {                         // Validation réglementaire
    jurisdiction: ProvinceCode[];         // Juridictions applicables
    legalFrameworks: LegalFramework[];    // Cadres légaux
    dataProtectionCompliant: boolean;     // Conforme protection données
    recordKeepingCompliant: boolean;      // Conforme conservation
    auditTrailComplete: boolean;          // Piste audit complète
    retentionPolicyApplied: boolean;      // Politique conservation appliquée
    crossBorderCompliant?: boolean;       // Conforme transfrontalier
    sectorialCompliant: boolean;          // Conforme sectoriel
  };
  verification: {                       // Vérification
    verifiedBy: string;                   // Vérifié par
    verificationDate: number;             // Date vérification
    verificationMethod: string[];         // Méthodes vérification
    verificationScore: number;            // Score vérification (0-100)
    exceptions: Array<{                  // Exceptions
      type: string;
      description: BilingualText;
      severity: 'minor' | 'major' | 'critical';
      resolution?: BilingualText;
    }>;
    overrides: Array<{                   // Dérogations
      reason: BilingualText;
      authorizedBy: string;
      timestamp: number;
      documentation: string;
    }>;
  };
}

export interface LegalConsent {
  consentVersion: string;                 // Version consentement
  consentText: BilingualText;             // Texte consentement
  consentGiven: boolean;                  // Consentement donné
  consentTimestamp: number;               // Moment consentement
  consentMethod: 'explicit' | 'implied' | 'opt_in' | 'opt_out';
  consentScope: string[];                 // Portée consentement
  dataProcessing: {                      // Traitement données
    purposes: BilingualText[];            // Finalités
    dataTypes: string[];                  // Types données
    recipients: string[];                 // Destinataires
    retention: {                         // Conservation
      period: number;                     // Période (années)
      criteria: BilingualText;            // Critères
      disposal: BilingualText;            // Destruction
    };
    transfers: Array<{                   // Transferts
      recipient: string;
      country: string;
      safeguards: BilingualText[];
      purpose: BilingualText;
    }>;
    rights: {                           // Droits
      access: boolean;                    // Accès
      rectification: boolean;             // Rectification
      erasure: boolean;                   // Effacement
      portability: boolean;               // Portabilité
      objection: boolean;                 // Opposition
      restriction: boolean;               // Limitation
      complaint: BilingualText;           // Plainte
    };
  };
  biometricConsent?: {                   // Consentement biométrique
    specific: boolean;                    // Spécifique
    informed: boolean;                    // Éclairé
    freely_given: boolean;                // Libre
    withdrawal: BilingualText;            // Retrait
    sensitive_data: boolean;              // Données sensibles
    special_categories: string[];         // Catégories spéciales
  };
  minorProtection?: {                    // Protection mineurs
    ageVerification: boolean;             // Vérification âge
    parentalConsent: boolean;             // Consentement parental
    guardianSignature?: string;           // Signature tuteur
    specialProtections: BilingualText[];  // Protections spéciales
  };
  compliance: {                         // Conformité
    pipeda: boolean;                      // PIPEDA (Canada)
    gdpr?: boolean;                       // RGPD (EU)
    ccpa?: boolean;                       // CCPA (Californie)
    provincial: Record<ProvinceCode, boolean>; // Lois provinciales
    sectorial: string[];                  // Lois sectorielles
  };
  documentation: {                       // Documentation
    consentRecord: string;                // Enregistrement consentement
    proofOfConsent: string[];             // Preuves consentement
    consentHistory: Array<{              // Historique
      version: string;
      timestamp: number;
      changes: BilingualText[];
      reason: BilingualText;
    }>;
    auditTrail: string[];                 // Piste audit
  };
}

export interface SignatureAudit {
  events: Array<{                        // Événements
    id: string;                          // ID événement
    type: 'creation' | 'signing' | 'verification' | 'validation' | 'revocation' | 'access' | 'modification' | 'deletion';
    timestamp: number;                   // Horodatage
    actor: {                            // Acteur
      id: string;
      name: string;
      role: PersonnelRole;
      ip: string;
      device: string;
    };
    action: BilingualText;               // Action
    details: Record<string, any>;        // Détails
    result: 'success' | 'failure' | 'partial';
    evidence: string[];                   // Preuves
    hash: string;                        // Hash événement
    previousHash?: string;                // Hash précédent (chaînage)
  }>;
  integrity: {                          // Intégrité
    chainValid: boolean;                 // Chaîne valide
    hashAlgorithm: CryptographicStandard;// Algorithme hash
    merkleRoot?: string;                 // Racine Merkle
    blockchainAnchored?: {               // Ancrage blockchain
      network: string;
      transactionId: string;
      blockNumber: number;
      confirmations: number;
    };
    timestampService?: {                 // Service horodatage
      provider: string;
      timestamp: string;
      certificate: string;
      response: string;
    };
  };
  access: {                             // Accès
    accessLog: Array<{                   // Journal accès
      timestamp: number;
      user: string;
      purpose: BilingualText;
      granted: boolean;
      duration?: number;                  // Durée accès (ms)
      documentsAccessed: string[];
      actionsPerformed: string[];
    }>;
    permissions: Array<{                 // Permissions
      user: string;
      role: PersonnelRole;
      permissions: string[];
      granted: number;                    // Timestamp octroi
      expires?: number;                   // Expiration
      grantor: string;                    // Accordé par
    }>;
    restrictions: Array<{                // Restrictions
      type: 'time' | 'location' | 'device' | 'purpose';
      description: BilingualText;
      active: boolean;
      expires?: number;
    }>;
  };
  compliance: {                         // Conformité
    auditStandards: string[];            // Standards audit
    retentionCompliant: boolean;         // Conforme conservation
    accessControlCompliant: boolean;     // Conforme contrôle accès
    dataIntegrityMaintained: boolean;    // Intégrité données maintenue
    regulatoryCompliant: boolean;        // Conforme réglementaire
    lastAudit?: {                       // Dernier audit
      date: number;
      auditor: string;
      findings: BilingualText[];
      score: number;                      // Score (0-100)
    };
  };
}

export interface SignatureCompliance {
  frameworks: Array<{                    // Cadres réglementaires
    framework: LegalFramework;
    version: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review';
    assessment: {                       // Évaluation
      date: number;
      assessor: string;
      score: number;                      // Score (0-100)
      findings: BilingualText[];
      recommendations: BilingualText[];
    };
    requirements: Array<{               // Exigences
      requirement: BilingualText;
      status: 'met' | 'not_met' | 'partial' | 'n_a';
      evidence: string[];
      notes?: BilingualText;
    }>;
    exceptions?: Array<{                // Exceptions
      requirement: string;
      reason: BilingualText;
      mitigation: BilingualText;
      approved_by: string;
      expires?: number;
    }>;
  }>;
  jurisdictional: Array<{               // Conformité juridictionnelle
    jurisdiction: ProvinceCode | 'CA' | 'INTL';
    applicable: boolean;
    laws: string[];                      // Lois applicables
    compliance_level: 'full' | 'partial' | 'non_compliant' | 'exempt';
    last_review: number;
    next_review: number;
    local_counsel?: {                   // Conseil juridique local
      firm: string;
      lawyer: string;
      opinion: BilingualText;
      date: number;
    };
  }>;
  industry: Array<{                     // Standards industrie
    standard: string;                    // Standard industrie
    version: string;
    mandatory: boolean;
    compliance: 'full' | 'partial' | 'non_compliant';
    certification?: {                   // Certification
      body: string;
      certificate: string;
      issued: number;
      expires: number;
      scope: BilingualText;
    };
  }>;
  technical: {                          // Conformité technique
    encryption: {                       // Chiffrement
      algorithms: CryptographicStandard[];
      key_lengths: number[];
      compliance: 'current' | 'legacy' | 'deprecated' | 'non_compliant';
      fips_140: '1' | '2' | '3' | '4' | 'none';
      common_criteria?: string;           // Niveau Common Criteria
    };
    pki: {                              // Infrastructure clés publiques
      ca_trusted: boolean;              // AC de confiance
      certificate_valid: boolean;       // Certificat valide
      revocation_checked: boolean;      // Révocation vérifiée
      path_validation: boolean;         // Validation chemin
      time_stamping: boolean;           // Horodatage
    };
    storage: {                          // Stockage
      encrypted: boolean;               // Chiffré
      access_controlled: boolean;       // Contrôle accès
      backup_encrypted: boolean;        // Sauvegarde chiffrée
      geographic_restrictions: string[];// Restrictions géographiques
      cloud_compliance?: string[];      // Conformité cloud
    };
  };
  privacy: {                            // Confidentialité
    data_minimization: boolean;          // Minimisation données
    purpose_limitation: boolean;         // Limitation finalité
    storage_limitation: boolean;         // Limitation conservation
    accuracy: boolean;                   // Exactitude
    security: boolean;                   // Sécurité
    accountability: boolean;             // Responsabilité
    transparency: boolean;               // Transparence
    data_protection_impact?: {          // Analyse impact
      conducted: boolean;
      date?: number;
      assessor?: string;
      findings?: BilingualText[];
      mitigation?: BilingualText[];
    };
  };
  continuous_monitoring: {              // Surveillance continue
    enabled: boolean;
    frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
    metrics: string[];                   // Métriques surveillées
    alerts: Array<{                     // Alertes
      condition: string;
      threshold: number;
      recipients: string[];
      actions: BilingualText[];
    }>;
    reports: {                          // Rapports
      frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
      recipients: string[];
      format: 'summary' | 'detailed' | 'executive';
      last_generated?: number;
    };
  };
}

export interface RetentionPolicy {
  policy_id: string;                      // ID politique
  policy_name: BilingualText;             // Nom politique
  version: string;                        // Version
  effective_date: number;                 // Date entrée vigueur
  categories: Array<{                     // Catégories
    category: string;                     // Catégorie document
    retention_period: {                  // Période conservation
      duration: number;                   // Durée
      unit: 'days' | 'months' | 'years';
      trigger: 'creation' | 'completion' | 'expiry' | 'last_access';
    };
    legal_hold?: {                      // Conservation judiciaire
      active: boolean;
      reason: BilingualText;
      authority: string;
      case_number?: string;
      contact: string;
      expires?: number;
    };
    disposition: {                       // Sort final
      method: 'secure_deletion' | 'anonymization' | 'archival' | 'transfer';
      criteria: BilingualText[];
      responsible: PersonnelRole;
      verification: boolean;
      certificate?: boolean;              // Certificat destruction
    };
    exceptions: Array<{                  // Exceptions
      condition: BilingualText;
      extension: number;                  // Prolongation (jours)
      reason: BilingualText;
      authority: string;
    }>;
  }>;
  triggers: Array<{                      // Déclencheurs
    event: string;                       // Événement
    action: 'extend' | 'reduce' | 'hold' | 'release' | 'review';
    automatic: boolean;                  // Automatique
    notification: {                     // Notification
      required: boolean;
      recipients: PersonnelRole[];
      advance_notice: number;             // Préavis (jours)
      reminder_frequency: number;         // Fréquence rappel (jours)
    };
  }>;
  compliance: {                          // Conformité
    regulatory_basis: string[];          // Base réglementaire
    business_justification: BilingualText;// Justification métier
    risk_assessment: {                   // Évaluation risque
      over_retention: number;             // Risque sur-conservation (1-5)
      under_retention: number;            // Risque sous-conservation (1-5)
      data_breach: number;                // Risque violation (1-5)
      compliance_violation: number;       // Risque non-conformité (1-5)
      mitigation: BilingualText[];        // Mesures atténuation
    };
    audit_trail: {                      // Piste audit
      retention_events: Array<{          // Événements conservation
        type: 'creation' | 'extension' | 'disposal' | 'hold' | 'release';
        timestamp: number;
        actor: string;
        reason: BilingualText;
        evidence: string[];
      }>;
      reviews: Array<{                   // Révisions
        date: number;
        reviewer: string;
        findings: BilingualText[];
        changes: BilingualText[];
        next_review: number;
      }>;
    };
  };
  implementation: {                      // Implémentation
    automated: boolean;                  // Automatisé
    manual_review: boolean;              // Révision manuelle
    approval_required: boolean;          // Approbation requise
    monitoring: {                       // Surveillance
      frequency: 'daily' | 'weekly' | 'monthly';
      metrics: string[];
      reporting: boolean;
    };
    training: {                         // Formation
      required: boolean;
      frequency: number;                  // Mois
      audience: PersonnelRole[];
      materials: string[];
    };
  };
}

// =================== TYPES SPÉCIALISÉS ===================

export interface MultiFactorAuthentication {
  factors: Array<{                       // Facteurs
    type: 'knowledge' | 'possession' | 'inherence' | 'location' | 'time';
    method: SignatureMethod;
    required: boolean;                   // Obligatoire
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    implementation: {                   // Implémentation
      provider: string;
      service: string;
      algorithm?: CryptographicStandard;
      parameters?: Record<string, any>;
    };
    validation: {                       // Validation
      validated: boolean;
      timestamp: number;
      confidence: number;                 // Confiance (0-100)
      attempts: number;                   // Tentatives
      failures: number;                   // Échecs
    };
  }>;
  overall: {                            // Global
    level: AuthenticationLevel;
    confidence: number;                   // Confiance globale (0-100)
    risk_score: number;                   // Score risque (0-100)
    passed: boolean;                      // Réussi
    backup_methods: SignatureMethod[];    // Méthodes secours
  };
}

export interface TamperEvidence {
  detection: Array<{                     // Détection
    timestamp: number;
    type: 'content_modification' | 'metadata_change' | 'hash_mismatch' | 'signature_invalid' | 'time_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: BilingualText;
    evidence: string[];                   // Preuves altération
    hash_before?: string;                 // Hash avant
    hash_after?: string;                  // Hash après
    changed_fields?: string[];            // Champs modifiés
    detector: string;                     // Détecteur
  }>;
  integrity: {                          // Intégrité
    original_hash: string;               // Hash original
    current_hash: string;                // Hash actuel
    match: boolean;                      // Correspondance
    algorithm: CryptographicStandard;    // Algorithme
    verification_date: number;           // Date vérification
    verifier: string;                    // Vérificateur
  };
  protection: {                         // Protection
    mechanisms: string[];                // Mécanismes protection
    effectiveness: number;               // Efficacité (0-100)
    vulnerabilities?: BilingualText[];   // Vulnérabilités
    recommendations: BilingualText[];    // Recommandations
  };
  response: {                           // Réponse
    automatic: BilingualText[];          // Actions automatiques
    manual: BilingualText[];             // Actions manuelles
    notifications: string[];             // Notifications envoyées
    investigation: {                    // Enquête
      required: boolean;
      initiated: boolean;
      investigator?: string;
      status?: 'open' | 'in_progress' | 'closed';
      findings?: BilingualText[];
    };
  };
}

export interface IntegrityHash {
  algorithm: CryptographicStandard;       // Algorithme hash
  value: string;                          // Valeur hash
  salt?: string;                          // Sel (si applicable)
  iterations?: number;                    // Itérations (si PBKDF2)
  timestamp: number;                      // Horodatage calcul
  input_size: number;                     // Taille entrée (octets)
  computation_time: number;               // Temps calcul (ms)
  verification: Array<{                   // Vérifications
    timestamp: number;
    verifier: string;
    result: boolean;
    evidence?: string;
  }>;
  chain?: {                              // Chaînage (blockchain/Merkle)
    previous_hash?: string;
    merkle_path?: string[];
    block_number?: number;
    transaction_id?: string;
  };
}

export interface SecurityContext {
  threat_model: {                        // Modèle menaces
    assets: BilingualText[];             // Actifs protégés
    threats: Array<{                    // Menaces
      threat: BilingualText;
      likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
      impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      mitigation: BilingualText[];
    }>;
    attack_vectors: BilingualText[];     // Vecteurs attaque
    countermeasures: BilingualText[];    // Contre-mesures
  };
  security_controls: Array<{             // Contrôles sécurité
    control: string;
    type: 'preventive' | 'detective' | 'corrective' | 'compensating';
    implementation: 'technical' | 'administrative' | 'physical';
    effectiveness: number;               // Efficacité (0-100)
    coverage: BilingualText[];           // Couverture
    gaps?: BilingualText[];              // Lacunes
  }>;
  risk_assessment: {                     // Évaluation risque
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    residual_risk: number;               // Risque résiduel (0-100)
    acceptable_risk: number;             // Risque acceptable (0-100)
    risk_appetite: BilingualText;        // Appétit risque
    last_assessment: number;             // Dernière évaluation
    next_review: number;                 // Prochaine révision
  };
  incident_response: {                   // Réponse incidents
    plan_exists: boolean;
    contacts: Array<{                   // Contacts
      role: string;
      name: string;
      phone: string;
      email: string;
      escalation_level: number;
    }>;
    procedures: BilingualText[];         // Procédures
    tools: string[];                     // Outils
    testing: {                          // Tests
      last_test: number;
      frequency: number;                  // Mois
      results?: BilingualText[];
    };
  };
}

export interface AuthenticationFactor {
  factor_id: string;                      // ID facteur
  type: 'knowledge' | 'possession' | 'inherence' | 'location' | 'time' | 'behavior';
  method: SignatureMethod;                // Méthode
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  implementation: {                      // Implémentation
    technology: string;                  // Technologie
    provider: string;                    // Fournisseur
    version: string;                     // Version
    configuration: Record<string, any>;  // Configuration
    security_level: 'basic' | 'enhanced' | 'high' | 'fips' | 'cc_eal';
  };
  enrollment: {                          // Inscription
    enrolled: boolean;
    enrollment_date?: number;
    enrollment_method?: string;
    verification_level?: 'self' | 'remote' | 'in_person';
    backup_enrolled?: boolean;
  };
  usage: {                              // Utilisation
    last_used?: number;
    usage_count: number;
    failure_count: number;
    success_rate: number;                // Taux succès (0-100)
    average_time: number;                // Temps moyen (ms)
  };
  lifecycle: {                          // Cycle de vie
    status: 'active' | 'inactive' | 'suspended' | 'revoked' | 'expired';
    created: number;
    expires?: number;
    last_updated: number;
    renewal_required?: boolean;
    replacement_due?: number;
  };
  risk: {                               // Risque
    compromise_indicators: string[];      // Indicateurs compromission
    risk_score: number;                  // Score risque (0-100)
    last_assessment: number;             // Dernière évaluation
    mitigation: BilingualText[];         // Mesures atténuation
  };
}

// =================== EXPORT TYPES ===================

export type {
  SignatureType,
  SignatureStatus,
  SignatureMethod,
  AuthenticationLevel,
  LegalFramework,
  CryptographicStandard,
  ElectronicSignature,
  BiometricData,
  SignatureMetadata,
  SignatureValidation,
  LegalConsent,
  SignatureAudit,
  SignatureCompliance,
  RetentionPolicy,
  MultiFactorAuthentication,
  TamperEvidence,
  IntegrityHash,
  SecurityContext,
  AuthenticationFactor
};
