// app/utils/translations.ts - Système de traduction multilingue

import { MultiLanguageText } from '../types/index';

// =================== INTERFACES DE TRADUCTION ===================
export interface TranslationConfig {
  defaultLanguage: 'fr' | 'en';
  supportedLanguages: ('fr' | 'en')[];
  fallbackLanguage: 'fr' | 'en';
  autoDetectBrowser: boolean;
}

export interface TranslationKey {
  key: string;
  namespace: string;
  defaultValue?: string;
  interpolations?: Record<string, string | number>;
}

export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

export interface LanguageResources {
  fr: TranslationResource;
  en: TranslationResource;
}

// =================== DICTIONNAIRE DE TRADUCTIONS ===================
export const TRANSLATIONS: LanguageResources = {
  fr: {
    // Navigation et interface
    nav: {
      dashboard: 'Tableau de bord',
      ast: 'AST',
      hazards: 'Dangers',
      equipment: 'Équipements',
      reports: 'Rapports',
      settings: 'Paramètres',
      logout: 'Déconnexion'
    },
    
    // Actions communes
    actions: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      add: 'Ajouter',
      create: 'Créer',
      update: 'Mettre à jour',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      print: 'Imprimer',
      download: 'Télécharger',
      upload: 'Téléverser',
      submit: 'Soumettre',
      approve: 'Approuver',
      reject: 'Rejeter',
      close: 'Fermer',
      open: 'Ouvrir'
    },
    
    // Statuts
    status: {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      active: 'Actif',
      inactive: 'Inactif',
      completed: 'Terminé',
      cancelled: 'Annulé',
      overdue: 'En retard'
    },
    
    // Niveaux de risque
    risk: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
      acceptable: 'Acceptable',
      tolerable: 'Tolérable',
      unacceptable: 'Inacceptable'
    },
    
    // Priorités
    priority: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente',
      critical: 'Critique'
    },

    // Tableau de bord
    dashboard: {
      incidents: 'Incidents',
      incidentTypes: "Types d'Incidents",
      photoDocumentation: 'Photos Documentation',
      totalPhotos: 'Photos totales',
      thisWeek: 'cette semaine'
    },

    // AST spécifique
    ast: {
      title: 'Analyse Sécuritaire de Tâches',
      shortTitle: 'AST',
      steps: 'Étapes',
      hazards: 'Dangers identifiés',
      controls: 'Mesures de contrôle',
      equipment: 'Équipements requis',
      team: 'Équipe',
      duration: 'Durée estimée',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      location: 'Lieu',
      project: 'Projet',
      client: 'Client',
      supervisor: 'Superviseur',
      approval: 'Approbation',
      validation: 'Validation',
      revision: 'Révision'
    },
    
    // Dangers
    hazards: {
      title: 'Dangers',
      category: 'Catégorie',
      biological: 'Biologique',
      chemical: 'Chimique',
      electrical: 'Électrique',
      environmental: 'Environnemental',
      ergonomic: 'Ergonomique',
      gas: 'Gaz',
      mechanical: 'Mécanique',
      physical: 'Physique',
      workplace: 'Milieu de travail',
      severity: 'Gravité',
      likelihood: 'Probabilité',
      exposure: 'Exposition',
      consequences: 'Conséquences',
      prevention: 'Prévention'
    },
    
    // Équipements
    equipment: {
      title: 'Équipements de sécurité',
      ppe: 'EPI',
      category: 'Catégorie',
      bodyProtection: 'Protection corporelle',
      eyeProtection: 'Protection oculaire',
      headProtection: 'Protection de la tête',
      handProtection: 'Protection des mains',
      footProtection: 'Protection des pieds',
      hearingProtection: 'Protection auditive',
      fallProtection: 'Protection antichute',
      respiratory: 'Protection respiratoire',
      electrical: 'Électrique',
      detection: 'Détection',
      emergency: 'Urgence',
      tools: 'Outils',
      certification: 'Certification',
      expiry: 'Expiration',
      inspection: 'Inspection',
      maintenance: 'Entretien'
    },
    
    // Conformité
    compliance: {
      title: 'Conformité réglementaire',
      score: 'Score de conformité',
      standards: 'Normes applicables',
      requirements: 'Exigences',
      gaps: 'Lacunes',
      actions: 'Actions requises',
      deadline: 'Échéance',
      responsible: 'Responsable',
      status: 'Statut',
      evidence: 'Preuves',
      audit: 'Audit',
      certification: 'Certification'
    },
    
    // Rapports
    reports: {
      title: 'Rapports',
      generate: 'Générer un rapport',
      summary: 'Résumé',
      detailed: 'Détaillé',
      dashboard: 'Tableau de bord',
      statistics: 'Statistiques',
      trends: 'Tendances',
      analysis: 'Analyse',
      recommendations: 'Recommandations',
      period: 'Période',
      dateRange: 'Plage de dates',
      from: 'Du',
      to: 'Au'
    },
    
    // Messages
    messages: {
      success: {
        saved: 'Enregistré avec succès',
        updated: 'Mis à jour avec succès',
        deleted: 'Supprimé avec succès',
        created: 'Créé avec succès',
        approved: 'Approuvé avec succès',
        rejected: 'Rejeté avec succès'
      },
      error: {
        general: 'Une erreur est survenue',
        notFound: 'Élément non trouvé',
        unauthorized: 'Non autorisé',
        validation: 'Erreur de validation',
        network: 'Erreur de réseau',
        server: 'Erreur serveur'
      },
      warning: {
        unsavedChanges: 'Modifications non sauvegardées',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ?',
        highRisk: 'Attention : Risque élevé détecté',
        expiringSoon: 'Expire bientôt',
        incompleteData: 'Données incomplètes'
      },
      info: {
        loading: 'Chargement...',
        noData: 'Aucune donnée disponible',
        emptyList: 'Liste vide',
        selectItem: 'Sélectionnez un élément',
        helpText: 'Cliquez sur ? pour obtenir de l\'aide'
      }
    },
    
    // Validation
    validation: {
      required: 'Ce champ est requis',
      email: 'Format d\'email invalide',
      minLength: 'Longueur minimale: {{min}} caractères',
      maxLength: 'Longueur maximale: {{max}} caractères',
      numeric: 'Doit être un nombre',
      positive: 'Doit être positif',
      date: 'Format de date invalide',
      phone: 'Format de téléphone invalide',
      url: 'Format d\'URL invalide'
    },
    
    // Dates et temps
    time: {
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      tomorrow: 'Demain',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      thisYear: 'Cette année',
      minutes: 'minutes',
      hours: 'heures',
      days: 'jours',
      weeks: 'semaines',
      months: 'mois',
      years: 'années',
      ago: 'il y a',
      in: 'dans',
      duration: 'Durée'
    },
    
    // Unités
    units: {
      meters: 'mètres',
      kilometers: 'kilomètres',
      kilograms: 'kilogrammes',
      tons: 'tonnes',
      liters: 'litres',
      degrees: 'degrés',
      percent: 'pourcent',
      currency: 'CAD',
      ppm: 'ppm',
      decibels: 'dB'
    }
  },
  
  en: {
    // Navigation and interface
    nav: {
      dashboard: 'Dashboard',
      ast: 'JSA',
      hazards: 'Hazards',
      equipment: 'Equipment',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout'
    },
    
    // Common actions
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      download: 'Download',
      upload: 'Upload',
      submit: 'Submit',
      approve: 'Approve',
      reject: 'Reject',
      close: 'Close',
      open: 'Open'
    },
    
    // Status
    status: {
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      active: 'Active',
      inactive: 'Inactive',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue'
    },
    
    // Risk levels
    risk: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      acceptable: 'Acceptable',
      tolerable: 'Tolerable',
      unacceptable: 'Unacceptable'
    },
    
    // Priorities
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      critical: 'Critical'
    },

    // Dashboard
    dashboard: {
      incidents: 'Incidents',
      incidentTypes: 'Incident Types',
      photoDocumentation: 'Photo Documentation',
      totalPhotos: 'Total Photos',
      thisWeek: 'this week'
    },

    // AST specific
    ast: {
      title: 'Job Safety Analysis',
      shortTitle: 'JSA',
      steps: 'Steps',
      hazards: 'Identified hazards',
      controls: 'Control measures',
      equipment: 'Required equipment',
      team: 'Team',
      duration: 'Estimated duration',
      startDate: 'Start date',
      endDate: 'End date',
      location: 'Location',
      project: 'Project',
      client: 'Client',
      supervisor: 'Supervisor',
      approval: 'Approval',
      validation: 'Validation',
      revision: 'Revision'
    },
    
    // Hazards
    hazards: {
      title: 'Hazards',
      category: 'Category',
      biological: 'Biological',
      chemical: 'Chemical',
      electrical: 'Electrical',
      environmental: 'Environmental',
      ergonomic: 'Ergonomic',
      gas: 'Gas',
      mechanical: 'Mechanical',
      physical: 'Physical',
      workplace: 'Workplace',
      severity: 'Severity',
      likelihood: 'Likelihood',
      exposure: 'Exposure',
      consequences: 'Consequences',
      prevention: 'Prevention'
    },
    
    // Equipment
    equipment: {
      title: 'Safety equipment',
      ppe: 'PPE',
      category: 'Category',
      bodyProtection: 'Body protection',
      eyeProtection: 'Eye protection',
      headProtection: 'Head protection',
      handProtection: 'Hand protection',
      footProtection: 'Foot protection',
      hearingProtection: 'Hearing protection',
      fallProtection: 'Fall protection',
      respiratory: 'Respiratory protection',
      electrical: 'Electrical',
      detection: 'Detection',
      emergency: 'Emergency',
      tools: 'Tools',
      certification: 'Certification',
      expiry: 'Expiry',
      inspection: 'Inspection',
      maintenance: 'Maintenance'
    },
    
    // Compliance
    compliance: {
      title: 'Regulatory compliance',
      score: 'Compliance score',
      standards: 'Applicable standards',
      requirements: 'Requirements',
      gaps: 'Gaps',
      actions: 'Required actions',
      deadline: 'Deadline',
      responsible: 'Responsible',
      status: 'Status',
      evidence: 'Evidence',
      audit: 'Audit',
      certification: 'Certification'
    },
    
    // Reports
    reports: {
      title: 'Reports',
      generate: 'Generate report',
      summary: 'Summary',
      detailed: 'Detailed',
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      trends: 'Trends',
      analysis: 'Analysis',
      recommendations: 'Recommendations',
      period: 'Period',
      dateRange: 'Date range',
      from: 'From',
      to: 'To'
    },
    
    // Messages
    messages: {
      success: {
        saved: 'Successfully saved',
        updated: 'Successfully updated',
        deleted: 'Successfully deleted',
        created: 'Successfully created',
        approved: 'Successfully approved',
        rejected: 'Successfully rejected'
      },
      error: {
        general: 'An error occurred',
        notFound: 'Item not found',
        unauthorized: 'Unauthorized',
        validation: 'Validation error',
        network: 'Network error',
        server: 'Server error'
      },
      warning: {
        unsavedChanges: 'Unsaved changes',
        deleteConfirm: 'Are you sure you want to delete?',
        highRisk: 'Warning: High risk detected',
        expiringSoon: 'Expires soon',
        incompleteData: 'Incomplete data'
      },
      info: {
        loading: 'Loading...',
        noData: 'No data available',
        emptyList: 'Empty list',
        selectItem: 'Select an item',
        helpText: 'Click ? for help'
      }
    },
    
    // Validation
    validation: {
      required: 'This field is required',
      email: 'Invalid email format',
      minLength: 'Minimum length: {{min}} characters',
      maxLength: 'Maximum length: {{max}} characters',
      numeric: 'Must be a number',
      positive: 'Must be positive',
      date: 'Invalid date format',
      phone: 'Invalid phone format',
      url: 'Invalid URL format'
    },
    
    // Time and dates
    time: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      thisMonth: 'This month',
      thisYear: 'This year',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      weeks: 'weeks',
      months: 'months',
      years: 'years',
      ago: 'ago',
      in: 'in',
      duration: 'Duration'
    },
    
    // Units
    units: {
      meters: 'meters',
      kilometers: 'kilometers',
      kilograms: 'kilograms',
      tons: 'tons',
      liters: 'liters',
      degrees: 'degrees',
      percent: 'percent',
      currency: 'CAD',
      ppm: 'ppm',
      decibels: 'dB'
    }
  }
};

// =================== CONFIGURATION PAR DÉFAUT ===================
export const DEFAULT_CONFIG: TranslationConfig = {
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  fallbackLanguage: 'fr',
  autoDetectBrowser: true
};

// =================== CLASSE DE TRADUCTION ===================
export class TranslationService {
  private currentLanguage: 'fr' | 'en';
  private config: TranslationConfig;
  private translations: LanguageResources;

  constructor(config: Partial<TranslationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentLanguage = this.config.defaultLanguage;
    this.translations = TRANSLATIONS;
    
    if (this.config.autoDetectBrowser && typeof navigator !== 'undefined') {
      this.detectBrowserLanguage();
    }
  }

  /**
   * Détecte la langue du navigateur
   */
  private detectBrowserLanguage(): void {
    const browserLang = navigator.language.slice(0, 2) as 'fr' | 'en';
    if (this.config.supportedLanguages.includes(browserLang)) {
      this.currentLanguage = browserLang;
    }
  }

  /**
   * Change la langue courante
   */
  setLanguage(language: 'fr' | 'en'): void {
    if (this.config.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
    }
  }

  /**
   * Obtient la langue courante
   */
  getCurrentLanguage(): 'fr' | 'en' {
    return this.currentLanguage;
  }

  /**
   * Traduit une clé
   */
  t(key: string, interpolations?: Record<string, string | number>): string {
    const translation = this.getTranslation(key, this.currentLanguage);
    
    if (!translation) {
      // Fallback sur la langue par défaut
      const fallbackTranslation = this.getTranslation(key, this.config.fallbackLanguage);
      if (fallbackTranslation) {
        return this.interpolate(fallbackTranslation, interpolations);
      }
      // Retourne la clé si aucune traduction trouvée
      return key;
    }
    
    return this.interpolate(translation, interpolations);
  }

  /**
   * Obtient une traduction pour une langue spécifique
   */
  private getTranslation(key: string, language: 'fr' | 'en'): string | null {
    const keys = key.split('.');
    let current: any = this.translations[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }

  /**
   * Interpole les variables dans une traduction
   */
  private interpolate(
    text: string, 
    interpolations?: Record<string, string | number>
  ): string {
    if (!interpolations) return text;
    
    return text.replace(/{{(\w+)}}/g, (match, key) => {
      return interpolations[key]?.toString() || match;
    });
  }

  /**
   * Traduit un objet MultiLanguageText
   */
  translateMultiLang(multiLangText: MultiLanguageText): string {
    return multiLangText[this.currentLanguage] || 
           multiLangText[this.config.fallbackLanguage] || 
           Object.values(multiLangText)[0] || '';
  }

  /**
   * Créer un objet MultiLanguageText à partir d'une clé
   */
  createMultiLang(key: string): MultiLanguageText {
    return {
      fr: this.getTranslation(key, 'fr') || key,
      en: this.getTranslation(key, 'en') || key
    };
  }

  /**
   * Formate une date selon la langue courante
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
  }

  /**
   * Formate un nombre selon la langue courante
   */
  formatNumber(
    number: number, 
    options?: Intl.NumberFormatOptions
  ): string {
    const locale = this.currentLanguage === 'fr' ? 'fr-CA' : 'en-CA';
    return number.toLocaleString(locale, options);
  }

  /**
   * Formate une devise
   */
  formatCurrency(amount: number): string {
    return this.formatNumber(amount, {
      style: 'currency',
      currency: 'CAD'
    });
  }

  /**
   * Formate un pourcentage
   */
  formatPercent(value: number): string {
    return this.formatNumber(value / 100, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
  }

  /**
   * Obtient la liste des langues supportées
   */
  getSupportedLanguages(): Array<{ code: 'fr' | 'en'; name: string }> {
    return [
      { code: 'fr', name: 'Français' },
      { code: 'en', name: 'English' }
    ];
  }
}

// =================== INSTANCE GLOBALE ===================
export const translationService = new TranslationService();

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Fonction de traduction rapide
 */
export const t = (key: string, interpolations?: Record<string, string | number>): string => {
  return translationService.t(key, interpolations);
};

/**
 * Change la langue globale
 */
export const setLanguage = (language: 'fr' | 'en'): void => {
  translationService.setLanguage(language);
};

/**
 * Obtient la langue courante
 */
export const getCurrentLanguage = (): 'fr' | 'en' => {
  return translationService.getCurrentLanguage();
};

/**
 * Traduit un objet MultiLanguageText
 */
export const translateMultiLang = (multiLangText: MultiLanguageText): string => {
  return translationService.translateMultiLang(multiLangText);
};

/**
 * Formate une date
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  return translationService.formatDate(date, options);
};

/**
 * Formate un nombre
 */
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  return translationService.formatNumber(number, options);
};

/**
 * Formate une devise
 */
export const formatCurrency = (amount: number): string => {
  return translationService.formatCurrency(amount);
};

/**
 * Formate un pourcentage
 */
export const formatPercent = (value: number): string => {
  return translationService.formatPercent(value);
};

// =================== HOOKS REACT (SI UTILISÉ AVEC REACT) ===================

/**
 * Hook pour utiliser les traductions dans les composants React
 */
export const useTranslation = () => {
  return {
    t,
    setLanguage,
    currentLanguage: getCurrentLanguage(),
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    translateMultiLang
  };
};

export default {
  TranslationService,
  translationService,
  t,
  setLanguage,
  getCurrentLanguage,
  translateMultiLang,
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercent,
  useTranslation,
  TRANSLATIONS,
  DEFAULT_CONFIG
};
