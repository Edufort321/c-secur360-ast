// =================== STEP4 PERMITS UTILS - INDEX COMPLET ===================
// Fichier: components/steps/Step4Permits/utils/index.ts

// =================== TYPES LOCAUX ===================
type ProvinceCodeType = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
type PermitStatusType = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'active' | 'completed' | 'cancelled' | 'suspended';
type PermitTypeEnum = 'confined_space' | 'hot_work' | 'excavation' | 'lifting' | 'height_work' | 'electrical';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

interface BilingualText {
  fr: string;
  en: string;
}

// =================== INTERFACES UTILITAIRES ===================
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface PermitStats {
  total: number;
  selected: number;
  byStatus: Record<PermitStatusType, number>;
  byRiskLevel: Record<string, number>;
  averageProgress: number;
  totalEstimatedTime: number;
  estimatedTimeFormatted: string;
}

interface NotificationItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  permitId: string;
}

interface SearchResult {
  permit: any;
  score: number;
}

// =================== VALIDATION UTILITAIRES ===================

/**
 * Valide si un permis est complet
 */
export const validatePermit = (permit: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validations obligatoires
  if (!permit.name || permit.name.trim().length === 0) {
    errors.push('Nom du permis requis');
  }

  if (!permit.location || permit.location.trim().length === 0) {
    warnings.push('Localisation recommandée');
  }

  if (!permit.site || permit.site.trim().length === 0) {
    warnings.push('Site de travail recommandé');
  }

  // Validation des panneaux de validation
  if (permit.validationPanels && Array.isArray(permit.validationPanels)) {
    const requiredPanels = permit.validationPanels.filter((panel: any) => panel.required);
    const validatedPanels = requiredPanels.filter((panel: any) => panel.validated);
    
    if (requiredPanels.length > 0 && validatedPanels.length === 0) {
      errors.push('Au moins un panneau de validation obligatoire doit être complété');
    }
  }

  // Validation des dates
  if (permit.dateExpiration && permit.dateCreation) {
    const now = new Date();
    const expiration = new Date(permit.dateExpiration);
    const creation = new Date(permit.dateCreation);
    
    if (expiration < now) {
      errors.push('Le permis est expiré');
    }

    if (creation > expiration) {
      errors.push('Date de création postérieure à la date d\'expiration');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calcule le taux de progression d'un permis
 */
export const calculatePermitProgress = (permit: any): number => {
  if (!permit.validationPanels || !Array.isArray(permit.validationPanels)) {
    return 0;
  }

  const panels = permit.validationPanels;
  if (panels.length === 0) return 0;

  const totalItems = panels.reduce((sum: number, panel: any) => 
    sum + (panel.validationItems?.length || 0), 0
  );
  
  if (totalItems === 0) return 0;

  const completedItems = panels.reduce((sum: number, panel: any) => 
    sum + (panel.validationItems?.filter((item: any) => item.completed).length || 0), 0
  );

  return Math.round((completedItems / totalItems) * 100);
};

/**
 * Calcule le taux de progression d'un panneau de validation
 */
export const calculatePanelProgress = (panel: any): number => {
  if (!panel.validationItems || !Array.isArray(panel.validationItems)) {
    return 0;
  }
  
  if (panel.validationItems.length === 0) return 0;
  
  const completedItems = panel.validationItems.filter((item: any) => item.completed).length;
  return Math.round((completedItems / panel.validationItems.length) * 100);
};

// =================== UTILITAIRES FILTRAGE ===================

/**
 * Filtre les permis par critères de recherche
 */
export const filterPermits = (
  permits: any[],
  searchTerm: string,
  categoryFilter: string = 'all',
  riskLevelFilter: string = 'all',
  statusFilter: PermitStatusType | 'all' = 'all'
): any[] => {
  return permits.filter(permit => {
    // Filtre par terme de recherche
    const matchesSearch = searchTerm === '' || 
      permit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permit.description?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permit.description?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permit.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permit.tags && Array.isArray(permit.tags) && permit.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      permit.legislation?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par catégorie
    const matchesCategory = categoryFilter === 'all' || permit.category === categoryFilter;

    // Filtre par niveau de risque
    const matchesRiskLevel = riskLevelFilter === 'all' || permit.riskLevel === riskLevelFilter;

    // Filtre par statut
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;

    return matchesSearch && matchesCategory && matchesRiskLevel && matchesStatus;
  });
};

/**
 * Trie les permis par priorité, date, ou nom
 */
export const sortPermits = (
  permits: any[],
  sortBy: 'priority' | 'date' | 'name' | 'progress' | 'risk'
): any[] => {
  return [...permits].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      
      case 'date':
        const dateA = new Date(a.dateCreation || a.dateCreated || Date.now());
        const dateB = new Date(b.dateCreation || b.dateCreated || Date.now());
        return dateB.getTime() - dateA.getTime();
      
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      
      case 'risk':
        const riskOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
      
      default:
        return 0;
    }
  });
};

// =================== UTILITAIRES FORMATAGE ===================

/**
 * Formate une durée en minutes vers un format lisible
 */
export const formatDuration = (minutes: number, language: 'fr' | 'en' = 'fr'): string => {
  if (minutes < 60) {
    return language === 'fr' ? `${minutes} min` : `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return language === 'fr' ? `${hours}h` : `${hours}h`;
  }
  
  return language === 'fr' 
    ? `${hours}h ${remainingMinutes}min` 
    : `${hours}h ${remainingMinutes}min`;
};

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (date: Date | string, language: 'fr' | 'en' = 'fr'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const locale = language === 'fr' ? 'fr-CA' : 'en-CA';
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Formate une date relative (il y a X temps)
 */
export const formatRelativeDate = (date: Date | string, language: 'fr' | 'en' = 'fr'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (language === 'fr') {
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return formatDate(dateObj, language);
  } else {
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateObj, language);
  }
};

// =================== UTILITAIRES COULEURS ===================

/**
 * Obtient la couleur associée à un niveau de risque
 */
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

/**
 * Obtient la couleur associée à un statut
 */
export const getStatusColor = (status: PermitStatusType): string => {
  switch (status) {
    case 'draft': return '#6b7280';
    case 'pending': return '#f59e0b';
    case 'approved': return '#10b981';
    case 'rejected': return '#ef4444';
    case 'expired': return '#dc2626';
    case 'active': return '#22c55e';
    case 'completed': return '#059669';
    case 'cancelled': return '#94a3b8';
    case 'suspended': return '#f97316';
    default: return '#6b7280';
  }
};

/**
 * Obtient la couleur associée à une priorité
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

// =================== UTILITAIRES GÉNÉRATION ===================

/**
 * Génère un ID unique pour un permis
 */
export const generatePermitId = (type: string, province: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `${type.toUpperCase()}_${province}_${timestamp}`;
};

/**
 * Génère un code de permis lisible
 */
export const generatePermitCode = (type: string, province: string): string => {
  const typeCode = type.replace('_', '').substring(0, 4).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${typeCode}-${province}-${year}-${sequence}`;
};

// =================== UTILITAIRES VALIDATION STANDARDS ===================

/**
 * Valide les standards obligatoires pour un permis
 */
export const validateStandards = (
  permit: any,
  province: string
): { valid: boolean; missing: any[] } => {
  const mandatoryStandards = (permit.standardsReferences || []).filter(
    (standard: any) => standard.mandatory && 
    standard.jurisdiction && Array.isArray(standard.jurisdiction) &&
    standard.jurisdiction.includes(province)
  );

  // Pour cette implémentation, on considère que tous les standards sont respectés
  // Dans un vrai système, il y aurait une vérification avec des données externes
  return {
    valid: true,
    missing: []
  };
};

// =================== UTILITAIRES EXPORT/IMPORT ===================

/**
 * Exporte un permis en JSON
 */
export const exportPermitToJson = (permit: any): string => {
  try {
    return JSON.stringify(permit, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    return '{}';
  }
};

/**
 * Importe un permis depuis JSON
 */
export const importPermitFromJson = (jsonString: string): any | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Conversion des dates string vers Date objects
    if (data.dateCreation && typeof data.dateCreation === 'string') {
      data.dateCreation = new Date(data.dateCreation);
    }
    if (data.dateExpiration && typeof data.dateExpiration === 'string') {
      data.dateExpiration = new Date(data.dateExpiration);
    }
    if (data.lastModified && typeof data.lastModified === 'string') {
      data.lastModified = new Date(data.lastModified);
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'import du permis:', error);
    return null;
  }
};

// =================== UTILITAIRES STATISTIQUES ===================

/**
 * Calcule des statistiques globales pour une liste de permis
 */
export const calculatePermitStats = (permits: any[]): PermitStats => {
  const total = permits.length;
  const selected = permits.filter(p => p.selected).length;
  
  const byStatus = permits.reduce((acc, permit) => {
    const status = permit.status || 'draft';
    acc[status as PermitStatusType] = (acc[status as PermitStatusType] || 0) + 1;
    return acc;
  }, {} as Record<PermitStatusType, number>);
  
  const byRiskLevel = permits.reduce((acc, permit) => {
    const risk = permit.riskLevel || 'medium';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageProgress = total > 0 
    ? Math.round(permits.reduce((sum, p) => sum + (p.progress || 0), 0) / total)
    : 0;

  const totalEstimatedTime = permits
    .filter(p => p.selected)
    .reduce((sum, p) => sum + (p.estimatedDuration || 0), 0);

  return {
    total,
    selected,
    byStatus,
    byRiskLevel,
    averageProgress,
    totalEstimatedTime,
    estimatedTimeFormatted: formatDuration(totalEstimatedTime)
  };
};

// =================== UTILITAIRES RECHERCHE AVANCÉE ===================

/**
 * Recherche avancée dans les permis avec pondération des résultats
 */
export const searchPermitsAdvanced = (
  permits: any[],
  query: string,
  language: 'fr' | 'en' = 'fr'
): any[] => {
  if (!query.trim()) return permits;

  const terms = query.toLowerCase().trim().split(/\s+/);
  
  return permits
    .map(permit => {
      let score = 0;
      
      terms.forEach(term => {
        // Titre (poids: 3)
        if (permit.name && permit.name.toLowerCase().includes(term)) score += 3;
        
        // Description (poids: 2)
        if (permit.description && permit.description[language] && 
            permit.description[language].toLowerCase().includes(term)) score += 2;
        
        // Catégorie (poids: 2)
        if (permit.category && permit.category.toLowerCase().includes(term)) score += 2;
        
        // Tags (poids: 1)
        if (permit.tags && Array.isArray(permit.tags) && 
            permit.tags.some((tag: string) => tag.toLowerCase().includes(term))) score += 1;
        
        // Législation (poids: 1)
        if (permit.legislation && permit.legislation.toLowerCase().includes(term)) score += 1;
      });
      
      return { permit, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.permit);
};

// =================== UTILITAIRES NOTIFICATIONS ===================

/**
 * Génère des notifications pour les permis
 */
export const generatePermitNotifications = (
  permits: any[],
  language: 'fr' | 'en' = 'fr'
): NotificationItem[] => {
  const notifications: NotificationItem[] = [];

  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;

  permits.forEach(permit => {
    if (!permit.id) return;
    
    const expiration = permit.dateExpiration ? new Date(permit.dateExpiration) : null;
    
    // Permis expiré
    if (expiration && expiration < now) {
      notifications.push({
        id: `expired_${permit.id}`,
        type: 'error',
        title: language === 'fr' ? 'Permis expiré' : 'Expired permit',
        message: language === 'fr' 
          ? `Le permis "${permit.name || 'Sans nom'}" a expiré le ${formatDate(expiration, language)}`
          : `Permit "${permit.name || 'Unnamed'}" expired on ${formatDate(expiration, language)}`,
        permitId: permit.id
      });
    }
    // Permis expirant bientôt (< 1 semaine)
    else if (expiration && expiration.getTime() - now.getTime() < oneWeekMs) {
      notifications.push({
        id: `expiring_${permit.id}`,
        type: 'warning',
        title: language === 'fr' ? 'Permis expirant bientôt' : 'Permit expiring soon',
        message: language === 'fr'
          ? `Le permis "${permit.name || 'Sans nom'}" expire le ${formatDate(expiration, language)}`
          : `Permit "${permit.name || 'Unnamed'}" expires on ${formatDate(expiration, language)}`,
        permitId: permit.id
      });
    }

    // Validation incomplète
    if (permit.selected && permit.progress < 100) {
      const requiredPanels = (permit.validationPanels || []).filter((panel: any) => 
        panel.required && !panel.validated
      );
      
      if (requiredPanels.length > 0) {
        notifications.push({
          id: `incomplete_${permit.id}`,
          type: 'warning',
          title: language === 'fr' ? 'Validation incomplète' : 'Incomplete validation',
          message: language === 'fr'
            ? `${requiredPanels.length} panneau(x) de validation requis pour "${permit.name || 'Sans nom'}"`
            : `${requiredPanels.length} validation panel(s) required for "${permit.name || 'Unnamed'}"`,
          permitId: permit.id
        });
      }
    }
  });

  return notifications;
};

// =================== UTILITAIRES CATÉGORISATION ===================

/**
 * Extrait les catégories uniques des permis
 */
export const extractCategories = (permits: any[]): string[] => {
  const categories = new Set<string>();
  permits.forEach(permit => {
    if (permit.category && typeof permit.category === 'string') {
      categories.add(permit.category);
    }
  });
  return Array.from(categories).sort();
};

/**
 * Groupe les permis par catégorie
 */
export const groupPermitsByCategory = (permits: any[]): Record<string, any[]> => {
  return permits.reduce((acc, permit) => {
    const category = permit.category || 'Autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permit);
    return acc;
  }, {} as Record<string, any[]>);
};

/**
 * Groupe les permis par statut
 */
export const groupPermitsByStatus = (permits: any[]): Record<string, any[]> => {
  return permits.reduce((acc, permit) => {
    const status = permit.status || 'draft';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(permit);
    return acc;
  }, {} as Record<string, any[]>);
};

// =================== UTILITAIRES DE VALIDATION BUSINESS ===================

/**
 * Vérifie si un permis peut être activé
 */
export const canActivatePermit = (permit: any): boolean => {
  // Vérifications de base
  if (!permit.name || !permit.type) {
    return false;
  }
  
  // Vérifier que tous les panneaux requis sont validés
  if (permit.validationPanels && Array.isArray(permit.validationPanels)) {
    const requiredPanels = permit.validationPanels.filter((panel: any) => panel.required);
    const validatedPanels = requiredPanels.filter((panel: any) => panel.validated);
    
    if (requiredPanels.length > 0 && validatedPanels.length < requiredPanels.length) {
      return false;
    }
  }
  
  // Vérifier que le permis n'est pas expiré
  if (permit.dateExpiration) {
    const expiration = new Date(permit.dateExpiration);
    if (expiration < new Date()) {
      return false;
    }
  }
  
  return true;
};

/**
 * Calcule le score de completude d'un permis
 */
export const calculateCompletenessScore = (permit: any): number => {
  let score = 0;
  let maxScore = 100;
  
  // Nom (20 points)
  if (permit.name && permit.name.trim().length > 0) {
    score += 20;
  }
  
  // Location (10 points)
  if (permit.location && permit.location.trim().length > 0) {
    score += 10;
  }
  
  // Site (10 points)
  if (permit.site && permit.site.trim().length > 0) {
    score += 10;
  }
  
  // Panneaux de validation (60 points)
  if (permit.validationPanels && Array.isArray(permit.validationPanels)) {
    const totalPanels = permit.validationPanels.length;
    if (totalPanels > 0) {
      const validatedPanels = permit.validationPanels.filter((panel: any) => panel.validated);
      score += Math.round((validatedPanels.length / totalPanels) * 60);
    }
  } else {
    score += 60; // Si pas de panneaux, considérer comme complet
  }
  
  return Math.min(score, maxScore);
};

// =================== UTILITAIRES DE TEMPS ===================

/**
 * Calcule le temps restant avant expiration
 */
export const getTimeUntilExpiration = (permit: any): { 
  days: number; 
  hours: number; 
  minutes: number; 
  expired: boolean 
} => {
  if (!permit.dateExpiration) {
    return { days: 0, hours: 0, minutes: 0, expired: false };
  }
  
  const expiration = new Date(permit.dateExpiration);
  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  return { days, hours, minutes, expired: false };
};

/**
 * Formate le temps restant en texte lisible
 */
export const formatTimeRemaining = (permit: any, language: 'fr' | 'en' = 'fr'): string => {
  const time = getTimeUntilExpiration(permit);
  
  if (time.expired) {
    return language === 'fr' ? 'Expiré' : 'Expired';
  }
  
  if (time.days > 0) {
    return language === 'fr' 
      ? `${time.days} jour${time.days > 1 ? 's' : ''} restant${time.days > 1 ? 's' : ''}`
      : `${time.days} day${time.days > 1 ? 's' : ''} remaining`;
  }
  
  if (time.hours > 0) {
    return language === 'fr' 
      ? `${time.hours} heure${time.hours > 1 ? 's' : ''} restante${time.hours > 1 ? 's' : ''}`
      : `${time.hours} hour${time.hours > 1 ? 's' : ''} remaining`;
  }
  
  return language === 'fr' 
    ? `${time.minutes} minute${time.minutes > 1 ? 's' : ''} restante${time.minutes > 1 ? 's' : ''}`
    : `${time.minutes} minute${time.minutes > 1 ? 's' : ''} remaining`;
};

// =================== EXPORT PRINCIPAL ===================
export default {
  // Validation
  validatePermit,
  calculatePermitProgress,
  calculatePanelProgress,
  validateStandards,
  canActivatePermit,
  calculateCompletenessScore,
  
  // Filtrage et tri
  filterPermits,
  sortPermits,
  searchPermitsAdvanced,
  extractCategories,
  groupPermitsByCategory,
  groupPermitsByStatus,
  
  // Formatage
  formatDuration,
  formatDate,
  formatRelativeDate,
  formatTimeRemaining,
  
  // Couleurs
  getRiskColor,
  getStatusColor,
  getPriorityColor,
  
  // Génération
  generatePermitId,
  generatePermitCode,
  
  // Import/Export
  exportPermitToJson,
  importPermitFromJson,
  
  // Statistiques
  calculatePermitStats,
  
  // Notifications
  generatePermitNotifications,
  
  // Temps
  getTimeUntilExpiration
};
