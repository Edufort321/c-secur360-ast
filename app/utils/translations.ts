// utils/translations.ts - Système de traduction multi-langue

// =================== INTERFACES TRADUCTION ===================
export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  supported: boolean;
}

export interface TranslationContext {
  tenant?: string;
  module?: string;
  region?: string;
  industry?: string;
}

export interface PluralizationRule {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface TranslationMetadata {
  lastUpdated: Date;
  version: string;
  translator?: string;
  approved: boolean;
  context?: string;
  notes?: string;
}

// =================== CONFIGURATION DES LANGUES ===================
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: '$'
    },
    supported: true
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$'
    },
    supported: true
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '$'
    },
    supported: false // Pour extension future
  }
};

export const DEFAULT_LANGUAGE = 'fr';
export const FALLBACK_LANGUAGE = 'en';

// =================== RESSOURCES DE TRADUCTION ===================
export const TRANSLATIONS: Record<string, TranslationResource> = {
  fr: {
    // Navigation et interface
    nav: {
      dashboard: 'Tableau de bord',
      ast: 'AST',
      astList: 'Liste des AST',
      astNew: 'Nouvelle AST',
      clients: 'Clients',
      equipment: 'Équipements',
      reports: 'Rapports',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
      help: 'Aide',
      notifications: 'Notifications'
    },
    
    // Actions courantes
    actions: {
      create: 'Créer',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      download: 'Télécharger',
      upload: 'Téléverser',
      view: 'Voir',
      print: 'Imprimer',
      share: 'Partager',
      copy: 'Copier',
      duplicate: 'Dupliquer',
      archive: 'Archiver',
      restore: 'Restaurer',
      approve: 'Approuver',
      reject: 'Rejeter',
      submit: 'Soumettre',
      reset: 'Réinitialiser',
      refresh: 'Actualiser',
      load: 'Charger',
      loadMore: 'Charger plus',
      close: 'Fermer',
      open: 'Ouvrir',
      expand: 'Développer',
      collapse: 'Réduire',
      select: 'Sélectionner',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      next: 'Suivant',
      previous: 'Précédent',
      back: 'Retour',
      continue: 'Continuer',
      skip: 'Ignorer',
      finish: 'Terminer'
    },

    // États et statuts
    status: {
      draft: 'Brouillon',
      underReview: 'En révision',
      approved: 'Approuvé',
      inProgress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      suspended: 'Suspendu',
      pending: 'En attente',
      active: 'Actif',
      inactive: 'Inactif',
      archived: 'Archivé',
      expired: 'Expiré',
      valid: 'Valide',
      invalid: 'Invalide',
      available: 'Disponible',
      unavailable: 'Indisponible',
      online: 'En ligne',
      offline: 'Hors ligne'
    },

    // Niveaux de risque
    risk: {
      veryLow: 'Très faible',
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
      level: 'Niveau de risque',
      assessment: 'Évaluation des risques',
      matrix: 'Matrice de risque',
      analysis: 'Analyse de risque',
      management: 'Gestion des risques',
      mitigation: 'Atténuation des risques',
      residual: 'Risque résiduel',
      initial: 'Risque initial',
      acceptable: 'Acceptable',
      tolerable: 'Tolérable',
      unacceptable: 'Inacceptable'
    },

    // Formulaires AST
    ast: {
      title: 'Analyse Sécuritaire de Tâches',
      number: 'Numéro AST',
      project: 'Projet',
      client: 'Client',
      location: 'Localisation',
      workType: 'Type de travail',
      team: 'Équipe',
      teamLeader: 'Chef d\'équipe',
      teamMember: 'Membre d\'équipe',
      estimatedDuration: 'Durée estimée',
      plannedStartDate: 'Date de début prévue',
      plannedEndDate: 'Date de fin prévue',
      actualStartDate: 'Date de début réelle',
      actualEndDate: 'Date de fin réelle',
      description: 'Description',
      notes: 'Notes',
      attachments: 'Pièces jointes',
      revision: 'Révision',
      version: 'Version',
      createdBy: 'Créé par',
      createdAt: 'Créé le',
      updatedBy: 'Modifié par',
      updatedAt: 'Modifié le',
      approvedBy: 'Approuvé par',
      approvedAt: 'Approuvé le',
      completionPercentage: 'Pourcentage d\'achèvement',
      
      // Étapes du formulaire
      steps: {
        basicInfo: 'Informations de base',
        locationTeam: 'Localisation et équipe',
        workPlanning: 'Planification du travail',
        hazardAnalysis: 'Analyse des dangers',
        safetyMeasures: 'Mesures de sécurité',
        validation: 'Validation et approbation'
      }
    },

    // Dangers et sécurité
    hazards: {
      electrical: 'Électriques',
      mechanical: 'Mécaniques',
      physical: 'Physiques',
      chemical: 'Chimiques',
      biological: 'Biologiques',
      environmental: 'Environnementaux',
      workplace: 'Milieu de travail',
      ergonomic: 'Ergonomiques',
      radiological: 'Radiologiques',
      psychosocial: 'Psychosociaux',
      
      identification: 'Identification des dangers',
      assessment: 'Évaluation des dangers',
      control: 'Contrôle des dangers',
      monitoring: 'Surveillance des dangers',
      
      severity: 'Sévérité',
      probability: 'Probabilité',
      exposure: 'Exposition',
      frequency: 'Fréquence',
      
      severityLevels: {
        negligible: 'Négligeable',
        minor: 'Mineur',
        moderate: 'Modéré',
        major: 'Majeur',
        catastrophic: 'Catastrophique'
      },
      
      probabilityLevels: {
        veryUnlikely: 'Très improbable',
        unlikely: 'Improbable',
        possible: 'Possible',
        likely: 'Probable',
        veryLikely: 'Très probable'
      }
    },

    // Équipements de sécurité
    equipment: {
      ppe: 'Équipements de protection individuelle',
      headProtection: 'Protection de la tête',
      eyeProtection: 'Protection des yeux',
      handProtection: 'Protection des mains',
      footProtection: 'Protection des pieds',
      bodyProtection: 'Protection du corps',
      respiratory: 'Protection respiratoire',
      fallProtection: 'Protection contre les chutes',
      electrical: 'Équipements électriques',
      detection: 'Détection et surveillance',
      
      required: 'Équipement requis',
      optional: 'Équipement optionnel',
      available: 'Disponible',
      unavailable: 'Indisponible',
      quantity: 'Quantité',
      condition: 'État',
      inspection: 'Inspection',
      certification: 'Certification',
      expiry: 'Expiration',
      maintenance: 'Maintenance',
      
      conditions: {
        excellent: 'Excellent',
        good: 'Bon',
        fair: 'Acceptable',
        poor: 'Mauvais',
        defective: 'Défectueux'
      }
    },

    // Mesures de contrôle
    controls: {
      hierarchy: 'Hiérarchie des contrôles',
      elimination: 'Élimination',
      substitution: 'Substitution',
      engineering: 'Contrôles d\'ingénierie',
      administrative: 'Contrôles administratifs',
      ppe: 'Équipements de protection individuelle',
      
      implementation: 'Mise en œuvre',
      verification: 'Vérification',
      effectiveness: 'Efficacité',
      monitoring: 'Surveillance',
      review: 'Révision',
      
      status: {
        notStarted: 'Non commencé',
        inProgress: 'En cours',
        completed: 'Terminé',
        verified: 'Vérifié',
        nonApplicable: 'Non applicable'
      },
      
      effectiveness: {
        ineffective: 'Inefficace',
        partiallyEffective: 'Partiellement efficace',
        moderatelyEffective: 'Modérément efficace',
        highlyEffective: 'Très efficace',
        fullyEffective: 'Complètement efficace'
      }
    },

    // Conformité réglementaire
    compliance: {
      regulatory: 'Conformité réglementaire',
      standards: 'Normes',
      requirements: 'Exigences',
      certification: 'Certification',
      audit: 'Audit',
      inspection: 'Inspection',
      
      score: 'Score de conformité',
      status: 'Statut de conformité',
      report: 'Rapport de conformité',
      action: 'Action corrective',
      deadline: 'Échéance',
      responsible: 'Responsable',
      
      csaStandards: {
        z462: 'CSA Z462 - Sécurité électrique en milieu de travail',
        z94_3: 'CSA Z94.3 - Protection respiratoire',
        z259: 'CSA Z259 - Protection contre les chutes',
        z96: 'CSA Z96 - Vêtements haute visibilité'
      },
      
      rsstArticles: {
        article_2_9_1: 'RSST Article 2.9.1 - Espaces clos',
        article_2_10: 'RSST Article 2.10 - Travail en hauteur',
        article_2_11: 'RSST Article 2.11 - Excavation'
      }
    },

    // Urgences et procédures
    emergency: {
      procedures: 'Procédures d\'urgence',
      evacuation: 'Évacuation',
      firstAid: 'Premiers secours',
      contacts: 'Contacts d\'urgence',
      assembly: 'Point de rassemblement',
      communication: 'Communication',
      response: 'Intervention d\'urgence',
      
      types: {
        fire: 'Incendie',
        medical: 'Urgence médicale',
        chemicalSpill: 'Déversement chimique',
        electrical: 'Urgence électrique',
        confinedSpace: 'Espace clos',
        fallFromHeight: 'Chute de hauteur',
        equipmentFailure: 'Défaillance d\'équipement',
        severeWeather: 'Conditions météo sévères',
        evacuation: 'Évacuation générale'
      }
    },

    // Permis et autorisations
    permits: {
      workPermit: 'Permis de travail',
      hotWork: 'Travaux à chaud',
      confinedSpace: 'Espace clos',
      electrical: 'Travaux électriques',
      excavation: 'Excavation',
      workingAtHeight: 'Travail en hauteur',
      craneOperation: 'Opération de grue',
      hazardousChemicals: 'Produits chimiques dangereux',
      radiation: 'Radiation',
      
      required: 'Permis requis',
      issued: 'Émis',
      expired: 'Expiré',
      pending: 'En attente',
      cancelled: 'Annulé',
      
      issuingAuthority: 'Autorité émettrice',
      validFrom: 'Valide du',
      validTo: 'Valide jusqu\'au',
      conditions: 'Conditions',
      restrictions: 'Restrictions'
    },

    // Rapports et analytics
    reports: {
      dashboard: 'Tableau de bord',
      summary: 'Résumé',
      detailed: 'Détaillé',
      analytics: 'Analyses',
      statistics: 'Statistiques',
      trends: 'Tendances',
      performance: 'Performance',
      kpi: 'Indicateurs clés',
      
      types: {
        astSummary: 'Résumé des AST',
        riskAnalysis: 'Analyse des risques',
        equipmentUsage: 'Utilisation des équipements',
        complianceStatus: 'Statut de conformité',
        performanceMetrics: 'Métriques de performance',
        monthlySummary: 'Résumé mensuel',
        clientActivity: 'Activité client'
      },
      
      periods: {
        today: 'Aujourd\'hui',
        yesterday: 'Hier',
        thisWeek: 'Cette semaine',
        lastWeek: 'Semaine dernière',
        thisMonth: 'Ce mois',
        lastMonth: 'Mois dernier',
        thisQuarter: 'Ce trimestre',
        lastQuarter: 'Trimestre dernier',
        thisYear: 'Cette année',
        lastYear: 'Année dernière',
        custom: 'Période personnalisée'
      }
    },

    // Messages et notifications
    messages: {
      success: {
        saved: 'Sauvegardé avec succès',
        created: 'Créé avec succès',
        updated: 'Mis à jour avec succès',
        deleted: 'Supprimé avec succès',
        approved: 'Approuvé avec succès',
        submitted: 'Soumis avec succès',
        uploaded: 'Téléversé avec succès',
        exported: 'Exporté avec succès',
        shared: 'Partagé avec succès'
      },
      
      error: {
        generic: 'Une erreur s\'est produite',
        notFound: 'Élément non trouvé',
        unauthorized: 'Non autorisé',
        forbidden: 'Accès interdit',
        validationFailed: 'Échec de validation',
        networkError: 'Erreur de réseau',
        serverError: 'Erreur serveur',
        timeout: 'Délai d\'attente dépassé',
        insufficientPermissions: 'Permissions insuffisantes'
      },
      
      warning: {
        unsavedChanges: 'Modifications non sauvegardées',
        highRisk: 'Risque élevé détecté',
        expiringSoon: 'Expire bientôt',
        incompleteData: 'Données incomplètes',
        requiresApproval: 'Nécessite une approbation'
      },
      
      info: {
        loading: 'Chargement en cours...',
        processing: 'Traitement en cours...',
        noData: 'Aucune donnée disponible',
        selectItems: 'Sélectionner des éléments',
        dragAndDrop: 'Glisser-déposer les fichiers ici'
      }
    },

    // Validation et erreurs
    validation: {
      required: 'Ce champ est requis',
      email: 'Adresse email invalide',
      phone: 'Numéro de téléphone invalide',
      date: 'Date invalide',
      number: 'Nombre invalide',
      minLength: 'Longueur minimale: {min} caractères',
      maxLength: 'Longueur maximale: {max} caractères',
      min: 'Valeur minimale: {min}',
      max: 'Valeur maximale: {max}',
      pattern: 'Format invalide',
      unique: 'Cette valeur doit être unique',
      match: 'Les valeurs ne correspondent pas',
      future: 'La date doit être dans le futur',
      past: 'La date doit être dans le passé'
    },

    // Formats et unités
    formats: {
      date: 'dd/MM/yyyy',
      time: 'HH:mm',
      datetime: 'dd/MM/yyyy HH:mm',
      currency: '$ {amount}',
      percentage: '{value}%',
      duration: '{hours}h {minutes}m'
    },

    // Unités de mesure
    units: {
      hours: 'heures',
      minutes: 'minutes',
      days: 'jours',
      weeks: 'semaines',
      months: 'mois',
      years: 'années',
      meters: 'mètres',
      kilometers: 'kilomètres',
      celsius: '°C',
      fahrenheit: '°F',
      percentage: '%',
      currency: '$',
      pieces: 'pièces',
      units: 'unités'
    },

    // Interface utilisateur
    ui: {
      loading: 'Chargement...',
      noResults: 'Aucun résultat',
      showMore: 'Afficher plus',
      showLess: 'Afficher moins',
      expand: 'Développer',
      collapse: 'Réduire',
      sortBy: 'Trier par',
      groupBy: 'Grouper par',
      filterBy: 'Filtrer par',
      searchPlaceholder: 'Rechercher...',
      selectOption: 'Sélectionner une option',
      dragHere: 'Glisser ici',
      uploadFile: 'Téléverser un fichier',
      chooseFile: 'Choisir un fichier',
      removeFile: 'Supprimer le fichier',
      previewFile: 'Aperçu du fichier',
      downloadFile: 'Télécharger le fichier'
    }
  },

  en: {
    // Navigation and interface
    nav: {
      dashboard: 'Dashboard',
      ast: 'JSA',
      astList: 'JSA List',
      astNew: 'New JSA',
      clients: 'Clients',
      equipment: 'Equipment',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      help: 'Help',
      notifications: 'Notifications'
    },

    // Common actions
    actions: {
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      view: 'View',
      print: 'Print',
      share: 'Share',
      copy: 'Copy',
      duplicate: 'Duplicate',
      archive: 'Archive',
      restore: 'Restore',
      approve: 'Approve',
      reject: 'Reject',
      submit: 'Submit',
      reset: 'Reset',
      refresh: 'Refresh',
      load: 'Load',
      loadMore: 'Load more',
      close: 'Close',
      open: 'Open',
      expand: 'Expand',
      collapse: 'Collapse',
      select: 'Select',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      next: 'Next',
      previous: 'Previous',
      back: 'Back',
      continue: 'Continue',
      skip: 'Skip',
      finish: 'Finish'
    },

    // Status and states
    status: {
      draft: 'Draft',
      underReview: 'Under Review',
      approved: 'Approved',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      suspended: 'Suspended',
      pending: 'Pending',
      active: 'Active',
      inactive: 'Inactive',
      archived: 'Archived',
      expired: 'Expired',
      valid: 'Valid',
      invalid: 'Invalid',
      available: 'Available',
      unavailable: 'Unavailable',
      online: 'Online',
      offline: 'Offline'
    },

    // Risk levels
    risk: {
      veryLow: 'Very Low',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      level: 'Risk Level',
      assessment: 'Risk Assessment',
      matrix: 'Risk Matrix',
      analysis: 'Risk Analysis',
      management: 'Risk Management',
      mitigation: 'Risk Mitigation',
      residual: 'Residual Risk',
      initial: 'Initial Risk',
      acceptable: 'Acceptable',
      tolerable: 'Tolerable',
      unacceptable: 'Unacceptable'
    },

    // JSA forms
    ast: {
      title: 'Job Safety Analysis',
      number: 'JSA Number',
      project: 'Project',
      client: 'Client',
      location: 'Location',
      workType: 'Work Type',
      team: 'Team',
      teamLeader: 'Team Leader',
      teamMember: 'Team Member',
      estimatedDuration: 'Estimated Duration',
      plannedStartDate: 'Planned Start Date',
      plannedEndDate: 'Planned End Date',
      actualStartDate: 'Actual Start Date',
      actualEndDate: 'Actual End Date',
      description: 'Description',
      notes: 'Notes',
      attachments: 'Attachments',
      revision: 'Revision',
      version: 'Version',
      createdBy: 'Created By',
      createdAt: 'Created At',
      updatedBy: 'Updated By',
      updatedAt: 'Updated At',
      approvedBy: 'Approved By',
      approvedAt: 'Approved At',
      completionPercentage: 'Completion Percentage',
      
      // Form steps
      steps: {
        basicInfo: 'Basic Information',
        locationTeam: 'Location and Team',
        workPlanning: 'Work Planning',
        hazardAnalysis: 'Hazard Analysis',
        safetyMeasures: 'Safety Measures',
        validation: 'Validation and Approval'
      }
    },

    // Messages and notifications
    messages: {
      success: {
        saved: 'Successfully saved',
        created: 'Successfully created',
        updated: 'Successfully updated',
        deleted: 'Successfully deleted',
        approved: 'Successfully approved',
        submitted: 'Successfully submitted',
        uploaded: 'Successfully uploaded',
        exported: 'Successfully exported',
        shared: 'Successfully shared'
      },
      
      error: {
        generic: 'An error occurred',
        notFound: 'Not found',
        unauthorized: 'Unauthorized',
        forbidden: 'Access forbidden',
        validationFailed: 'Validation failed',
        networkError: 'Network error',
        serverError: 'Server error',
        timeout: 'Timeout exceeded',
        insufficientPermissions: 'Insufficient permissions'
      },
      
      warning: {
        unsavedChanges: 'Unsaved changes',
        highRisk: 'High risk detected',
        expiringSoon: 'Expiring soon',
        incompleteData: 'Incomplete data',
        requiresApproval: 'Requires approval'
      },
      
      info: {
        loading: 'Loading...',
        processing: 'Processing...',
        noData: 'No data available',
        selectItems: 'Select items',
        dragAndDrop: 'Drag and drop files here'
      }
    },

    // Validation and errors
    validation: {
      required: 'This field is required',
      email: 'Invalid email address',
      phone: 'Invalid phone number',
      date: 'Invalid date',
      number: 'Invalid number',
      minLength: 'Minimum length: {min} characters',
      maxLength: 'Maximum length: {max} characters',
      min: 'Minimum value: {min}',
      max: 'Maximum value: {max}',
      pattern: 'Invalid format',
      unique: 'This value must be unique',
      match: 'Values do not match',
      future: 'Date must be in the future',
      past: 'Date must be in the past'
    },

    // Formats and units
    formats: {
      date: 'MM/dd/yyyy',
      time: 'HH:mm',
      datetime: 'MM/dd/yyyy HH:mm',
      currency: '${amount}',
      percentage: '{value}%',
      duration: '{hours}h {minutes}m'
    }
  }
};

// =================== RÈGLES DE PLURALISATION ===================
export const PLURALIZATION_RULES: Record<string, (count: number) => keyof PluralizationRule> = {
  fr: (count: number) => {
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    return 'other';
  },
  
  en: (count: number) => {
    if (count === 1) return 'one';
    return 'other';
  }
};

// =================== CLASSE PRINCIPALE DE TRADUCTION ===================
class TranslationEngine {
  private currentLanguage: string = DEFAULT_LANGUAGE;
  private fallbackLanguage: string = FALLBACK_LANGUAGE;
  private context: TranslationContext = {};
  private cache: Map<string, string> = new Map();

  constructor(language?: string, context?: TranslationContext) {
    if (language && this.isLanguageSupported(language)) {
      this.currentLanguage = language;
    }
    if (context) {
      this.context = context;
    }
  }

  /**
   * Traduit une clé avec interpolation de variables
   */
  t(key: string, variables?: Record<string, any>, options?: {
    language?: string;
    count?: number;
    context?: string;
  }): string {
    const language = options?.language || this.currentLanguage;
    const cacheKey = `${language}:${key}:${JSON.stringify(variables)}:${JSON.stringify(options)}`;
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let translation = this.getTranslation(key, language);
    
    // Gestion de la pluralisation
    if (typeof options?.count === 'number' && typeof translation === 'object') {
      const pluralRule = PLURALIZATION_RULES[language];
      if (pluralRule) {
        const pluralKey = pluralRule(options.count);
        const pluralTranslation = (translation as any)[pluralKey];
        if (pluralTranslation) {
          translation = pluralTranslation;
        }
      }
    }

    // Si pas de traduction trouvée, essayer la langue de fallback
    if (!translation || translation === key) {
      if (language !== this.fallbackLanguage) {
        translation = this.getTranslation(key, this.fallbackLanguage);
      }
    }

    // Si toujours pas de traduction, retourner la clé
    if (!translation || typeof translation !== 'string') {
      translation = key;
    }

    // Interpolation des variables
    if (variables) {
      translation = this.interpolate(translation, variables);
    }

    // Mettre en cache
    this.cache.set(cacheKey, translation);
    
    return translation;
  }

  /**
   * Récupère une traduction depuis les ressources
   */
  private getTranslation(key: string, language: string): any {
    const keys = key.split('.');
    let current = TRANSLATIONS[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Interpole les variables dans le texte
   */
  private interpolate(text: string, variables: Record<string, any>): string {
    return text.replace(/{(\w+)}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        return match;
      }
      
      // Formatage selon le type
      if (typeof value === 'number') {
        return this.formatNumber(value);
      }
      
      if (value instanceof Date) {
        return this.formatDate(value);
      }
      
      return String(value);
    });
  }

  /**
   * Formate un nombre selon la locale
   */
  private formatNumber(value: number): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage];
    if (!config) return value.toString();
    
    return value.toLocaleString(this.currentLanguage, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /**
   * Formate une date selon la locale
   */
  private formatDate(date: Date): string {
    const config = SUPPORTED_LANGUAGES[this.currentLanguage];
    if (!config) return date.toLocaleDateString();
    
    return date.toLocaleDateString(this.currentLanguage);
  }

  /**
   * Change la langue courante
   */
  setLanguage(language: string): void {
    if (this.isLanguageSupported(language)) {
      this.currentLanguage = language;
      this.cache.clear(); // Vider le cache
    }
  }

  /**
   * Obtient la langue courante
   */
  getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Vérifie si une langue est supportée
   */
  isLanguageSupported(language: string): boolean {
    return language in SUPPORTED_LANGUAGES && SUPPORTED_LANGUAGES[language].supported;
  }

  /**
   * Obtient la liste des langues supportées
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.supported);
  }

  /**
   * Définit le contexte de traduction
   */
  setContext(context: TranslationContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Vide le cache de traductions
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// =================== INSTANCE GLOBALE ===================
let translationEngine: TranslationEngine;

/**
 * Initialise le moteur de traduction
 */
export function initTranslations(language?: string, context?: TranslationContext): void {
  translationEngine = new TranslationEngine(language, context);
}

/**
 * Fonction de traduction globale
 */
export function t(key: string, variables?: Record<string, any>, options?: {
  language?: string;
  count?: number;
  context?: string;
}): string {
  if (!translationEngine) {
    initTranslations();
  }
  return translationEngine.t(key, variables, options);
}

/**
 * Change la langue courante
 */
export function setLanguage(language: string): void {
  if (!translationEngine) {
    initTranslations();
  }
  translationEngine.setLanguage(language);
}

/**
 * Obtient la langue courante
 */
export function getCurrentLanguage(): string {
  if (!translationEngine) {
    initTranslations();
  }
  return translationEngine.getLanguage();
}

/**
 * Obtient les langues supportées
 */
export function getSupportedLanguages(): LanguageConfig[] {
  if (!translationEngine) {
    initTranslations();
  }
  return translationEngine.getSupportedLanguages();
}

/**
 * Hook pour utiliser les traductions dans React
 */
export function useTranslation(context?: TranslationContext) {
  if (!translationEngine) {
    initTranslations();
  }
  
  if (context) {
    translationEngine.setContext(context);
  }
  
  return {
    t: translationEngine.t.bind(translationEngine),
    language: translationEngine.getLanguage(),
    setLanguage: translationEngine.setLanguage.bind(translationEngine),
    supportedLanguages: translationEngine.getSupportedLanguages()
  };
}

// =================== FONCTIONS UTILITAIRES MULTI-TENANT ===================

/**
 * Charge les traductions personnalisées d'un tenant
 */
export async function loadTenantTranslations(
  tenantId: string,
  language: string
): Promise<void> {
  try {
    // Dans un vrai système, charger depuis l'API
    // const response = await fetch(`/api/tenants/${tenantId}/translations/${language}`);
    // const customTranslations = await response.json();
    
    // Merger avec les traductions par défaut
    // TRANSLATIONS[language] = { ...TRANSLATIONS[language], ...customTranslations };
    
    console.log(`Traductions tenant ${tenantId} chargées pour ${language}`);
  } catch (error) {
    console.error('Erreur chargement traductions tenant:', error);
  }
}

/**
 * Génère des clés de traduction manquantes
 */
export function generateMissingTranslationKeys(
  sourceLanguage: string = 'fr',
  targetLanguage: string = 'en'
): Record<string, string> {
  const missing: Record<string, string> = {};
  
  function traverse(obj: any, path: string = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'string') {
        const targetValue = translationEngine?.getTranslation(currentPath, targetLanguage);
        if (!targetValue) {
          missing[currentPath] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, currentPath);
      }
    }
  }
  
  traverse(TRANSLATIONS[sourceLanguage]);
  return missing;
}

/**
 * Valide les traductions pour cohérence
 */
export function validateTranslations(): {
  missingKeys: Record<string, string[]>;
  inconsistentPlurals: string[];
  unusedKeys: string[];
} {
  const languages = Object.keys(TRANSLATIONS);
  const missingKeys: Record<string, string[]> = {};
  const inconsistentPlurals: string[] = [];
  const unusedKeys: string[] = [];
  
  // Collecter toutes les clés depuis toutes les langues
  const allKeys = new Set<string>();
  
  function collectKeys(obj: any, path: string = '', language: string) {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'string') {
        allKeys.add(currentPath);
      } else if (typeof value === 'object' && value !== null) {
        collectKeys(value, currentPath, language);
      }
    }
  }
  
  languages.forEach(lang => {
    collectKeys(TRANSLATIONS[lang], '', lang);
  });
  
  // Vérifier les clés manquantes
  allKeys.forEach(key => {
    languages.forEach(lang => {
      const translation = translationEngine?.getTranslation(key, lang);
      if (!translation) {
        if (!missingKeys[lang]) {
          missingKeys[lang] = [];
        }
        missingKeys[lang].push(key);
      }
    });
  });
  
  return {
    missingKeys,
    inconsistentPlurals,
    unusedKeys
  };
}

// =================== EXPORT PAR DÉFAUT ===================
export default {
  t,
  setLanguage,
  getCurrentLanguage,
  getSupportedLanguages,
  useTranslation,
  initTranslations,
  loadTenantTranslations,
  generateMissingTranslationKeys,
  validateTranslations,
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE
};
