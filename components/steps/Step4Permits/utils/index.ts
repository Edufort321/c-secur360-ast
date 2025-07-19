// components/steps/Step4Permits/utils/index.ts

import { BilingualText, Jurisdiction, PermitStatus, Priority } from '../types';

// =================== HELPERS BILINGUES ===================
export const getText = (text: BilingualText | string, language: 'fr' | 'en'): string => {
  if (typeof text === 'string') return text;
  return text[language] || text.fr || text.en || '';
};

export const createBilingualText = (fr: string, en: string): BilingualText => ({
  fr,
  en
});

// =================== FORMATTERS ===================
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('fr-CA');
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('fr-CA');
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

// =================== VALIDATION HELPERS ===================
export const validateRequired = (value: any, fieldName: string, language: 'fr' | 'en'): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return language === 'fr' 
      ? `Le champ ${fieldName} est requis`
      : `Field ${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string, language: 'fr' | 'en'): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return language === 'fr' 
      ? 'Adresse email invalide'
      : 'Invalid email address';
  }
  return null;
};

export const validatePhoneNumber = (phone: string, language: 'fr' | 'en'): string | null => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return language === 'fr' 
      ? 'Numéro de téléphone invalide'
      : 'Invalid phone number';
  }
  return null;
};

export const validateDate = (date: string | Date, language: 'fr' | 'en'): string | null => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return language === 'fr' 
      ? 'Date invalide'
      : 'Invalid date';
  }
  return null;
};

export const validateTimeRange = (startTime: string, endTime: string, language: 'fr' | 'en'): string | null => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  if (start >= end) {
    return language === 'fr' 
      ? 'L\'heure de fin doit être après l\'heure de début'
      : 'End time must be after start time';
  }
  return null;
};

// =================== STATUS HELPERS ===================
export const getStatusColor = (status: string): string => {
  const colors = {
    'draft': 'gray',
    'pending': 'yellow',
    'approved': 'green',
    'active': 'blue',
    'completed': 'green',
    'expired': 'red',
    'suspended': 'orange',
    'cancelled': 'gray'
  };
  return colors[status as keyof typeof colors] || 'gray';
};

export const getStatusIcon = (status: string): string => {
  const icons = {
    'draft': '📝',
    'pending': '⏳',
    'approved': '✅',
    'active': '🔄',
    'completed': '✅',
    'expired': '❌',
    'suspended': '⚠️',
    'cancelled': '🚫'
  };
  return icons[status as keyof typeof icons] || '📄';
};

export const getPriorityColor = (priority: string): string => {
  const colors = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'orange',
    'critical': 'red'
  };
  return colors[priority as keyof typeof colors] || 'gray';
};

export const getPriorityIcon = (priority: string): string => {
  const icons = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🟠',
    'critical': '🔴'
  };
  return icons[priority as keyof typeof icons] || '⚪';
};

// =================== ID GENERATORS ===================
export const generatePermitId = (type: string, province: string): string => {
  const timestamp = Date.now().toString();
  const typeCode = type.toUpperCase().slice(0, 3);
  const provinceCode = province.toUpperCase();
  return `${provinceCode}-${typeCode}-${timestamp.slice(-8)}`;
};

export const generateFormNumber = (permitId: string): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequence = permitId.slice(-4);
  return `F${year}${month}${day}-${sequence}`;
};

// =================== PERMIT HELPERS ===================
export const isPermitExpired = (permit: any): boolean => {
  if (!permit.dateExpiration) return false;
  const expirationDate = new Date(permit.dateExpiration);
  return expirationDate < new Date();
};

export const isPermitExpiringSoon = (permit: any, hoursThreshold: number = 24): boolean => {
  if (!permit.dateExpiration) return false;
  const expirationDate = new Date(permit.dateExpiration);
  const now = new Date();
  const timeDiff = expirationDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff > 0 && hoursDiff <= hoursThreshold;
};

export const getPermitRemainingTime = (permit: any): string => {
  if (!permit.dateExpiration) return '';
  
  const expirationDate = new Date(permit.dateExpiration);
  const now = new Date();
  const timeDiff = expirationDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) return 'Expiré';
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

// =================== SEARCH HELPERS ===================
export const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

export const searchInText = (searchTerm: string, text: string): boolean => {
  const normalizedSearch = normalizeSearchText(searchTerm);
  const normalizedText = normalizeSearchText(text);
  return normalizedText.includes(normalizedSearch);
};

export const highlightSearchText = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// =================== STORAGE HELPERS ===================
export const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
};

// =================== MOBILE HELPERS ===================
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTabletDevice = (): boolean => {
  return /iPad|Android.*(?!Mobile)/i.test(navigator.userAgent) || 
         (window.screen.width >= 768 && window.screen.width <= 1024);
};

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getViewportSize = (): { width: number; height: number } => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export const isKeyboardOpen = (): boolean => {
  if (window.visualViewport) {
    return window.visualViewport.height < window.innerHeight * 0.75;
  }
  return false;
};

// =================== URL HELPERS ===================
export const createShareableUrl = (permitId: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/permits/${permitId}`;
};

export const generateQRCodeUrl = (text: string, size: number = 200): string => {
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
};

// =================== PERFORMANCE HELPERS ===================
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

// =================== ERROR HELPERS ===================
export const formatError = (error: any, language: 'fr' | 'en'): string => {
  if (typeof error === 'string') return error;
  
  if (error?.message) {
    return error.message;
  }
  
  return language === 'fr' 
    ? 'Une erreur inattendue s\'est produite'
    : 'An unexpected error occurred';
};

export const logError = (error: any, context?: string): void => {
  console.error(`[${context || 'App'}]`, error);
  
  // En production, envoyer à un service de logging
  if (process.env.NODE_ENV === 'production') {
    // TODO: Intégrer avec Sentry ou autre service
  }
};

// =================== EXPORTS DEFAULT ===================
export default {
  getText,
  createBilingualText,
  formatDate,
  formatDateTime,
  formatDuration,
  validateRequired,
  validateEmail,
  validatePhoneNumber,
  validateDate,
  validateTimeRange,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  getPriorityIcon,
  generatePermitId,
  generateFormNumber,
  isPermitExpired,
  isPermitExpiringSoon,
  getPermitRemainingTime,
  normalizeSearchText,
  searchInText,
  highlightSearchText,
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  getViewportSize,
  isKeyboardOpen,
  createShareableUrl,
  generateQRCodeUrl,
  debounce,
  throttle,
  formatError,
  logError
};
