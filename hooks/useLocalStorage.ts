// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export interface StorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  syncAcrossTabs?: boolean;
}

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  version: string;
  metadata?: Record<string, any>;
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = false
  } = options;

  // State pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      const parsed = deserialize(item) as StorageItem<T>;
      
      // Vérifier si l'item a une structure valide
      if (parsed && typeof parsed === 'object' && 'value' in parsed) {
        return parsed.value;
      }
      
      // Fallback pour les anciennes données
      return parsed as T;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  // State pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // Fonction pour sauvegarder dans localStorage
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    try {
      setError(null);
      
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      const storageItem: StorageItem<T> = {
        value: valueToStore,
        timestamp: Date.now(),
        version: '1.0',
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        }
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(storageItem));
      }
      
      setStoredValue(valueToStore);

      // Dispatch custom event pour sync entre tabs si activé
      if (syncAcrossTabs && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors de la sauvegarde: ${errorMessage}`);
      console.error(`Erreur localStorage pour la clé "${key}":`, error);
    }
  }, [key, serialize, storedValue, syncAcrossTabs]);

  // Fonction pour supprimer de localStorage
  const removeValue = useCallback(() => {
    try {
      setError(null);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      
      setStoredValue(initialValue);

      if (syncAcrossTabs && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors de la suppression: ${errorMessage}`);
      console.error(`Erreur suppression localStorage pour la clé "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Fonction pour vérifier si la clé existe
  const hasValue = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Fonction pour obtenir les métadonnées
  const getMetadata = useCallback((): Record<string, any> | null => {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return null;

      const parsed = deserialize(item) as StorageItem<T>;
      return parsed && typeof parsed === 'object' && 'metadata' in parsed 
        ? parsed.metadata || null 
        : null;
    } catch (error) {
      console.warn(`Erreur lors de la lecture des métadonnées pour "${key}":`, error);
      return null;
    }
  }, [key, deserialize]);

  // Fonction pour obtenir la taille en bytes
  const getSize = useCallback((): number => {
    if (typeof window === 'undefined') return 0;

    try {
      const item = window.localStorage.getItem(key);
      return item ? new Blob([item]).size : 0;
    } catch (error) {
      return 0;
    }
  }, [key]);

  // Effet pour écouter les changements cross-tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = deserialize(e.newValue) as StorageItem<T>;
          const newValue = parsed && typeof parsed === 'object' && 'value' in parsed 
            ? parsed.value 
            : parsed as T;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Erreur sync cross-tab pour "${key}":`, error);
        }
      }
    };

    const handleCustomChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value || initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomChange as EventListener);
    };
  }, [key, deserialize, initialValue, syncAcrossTabs]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    hasValue,
    getMetadata,
    getSize,
    error
  };
};

// Hook spécialisé pour les données AST
export const useASTLocalStorage = () => {
  // ✅ CORRECTION : Utiliser l'objet retourné au lieu de déstructurer
  const draftsStorage = useLocalStorage('ast_drafts', [], {
    syncAcrossTabs: true
  });
  const drafts = draftsStorage.value;
  const setDrafts = draftsStorage.setValue;

  const preferencesStorage = useLocalStorage('ast_preferences', {
    language: 'fr' as 'fr' | 'en',
    autoSave: true,
    notifications: true,
    theme: 'dark' as 'light' | 'dark'
  });
  const preferences = preferencesStorage.value;
  const setPreferences = preferencesStorage.setValue;

  const recentProjectsStorage = useLocalStorage('ast_recent_projects', []);
  const recentProjects = recentProjectsStorage.value;
  const setRecentProjects = recentProjectsStorage.setValue;

  // Fonction pour sauvegarder un brouillon AST
  const saveDraft = useCallback((astData: any) => {
    const draft = {
      id: astData.id || `draft_${Date.now()}`,
      data: astData,
      savedAt: new Date().toISOString(),
      title: astData.projectInfo?.projectName || 'AST sans titre'
    };

    setDrafts((prevDrafts: any[]) => {
      const existingIndex = prevDrafts.findIndex(d => d.id === draft.id);
      if (existingIndex >= 0) {
        const newDrafts = [...prevDrafts];
        newDrafts[existingIndex] = draft;
        return newDrafts;
      }
      return [...prevDrafts, draft];
    });
  }, [setDrafts]);

  // Fonction pour charger un brouillon
  const loadDraft = useCallback((draftId: string) => {
    const draft = (drafts as any[]).find(d => d.id === draftId);
    return draft ? draft.data : null;
  }, [drafts]);

  // Fonction pour supprimer un brouillon
  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((prevDrafts: any[]) => prevDrafts.filter(d => d.id !== draftId));
  }, [setDrafts]);

  // Fonction pour ajouter aux projets récents
  const addToRecentProjects = useCallback((project: any) => {
    const recentProject = {
      id: project.id,
      title: project.projectInfo?.projectName || 'Projet sans titre',
      client: project.projectInfo?.client || 'Client inconnu',
      lastAccessed: new Date().toISOString()
    };

    setRecentProjects((prevRecent: any[]) => {
      const filtered = prevRecent.filter(p => p.id !== project.id);
      return [recentProject, ...filtered].slice(0, 10); // Garder max 10 projets récents
    });
  }, [setRecentProjects]);

  // Fonction pour nettoyer les vieux brouillons
  const cleanupOldDrafts = useCallback((daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    setDrafts((prevDrafts: any[]) => 
      prevDrafts.filter(draft => 
        new Date(draft.savedAt) > cutoffDate
      )
    );
  }, [setDrafts]);

  return {
    drafts,
    preferences,
    recentProjects,
    saveDraft,
    loadDraft,
    deleteDraft,
    addToRecentProjects,
    cleanupOldDrafts,
    setPreferences
  };
};

// Hook pour les statistiques localStorage
export const useLocalStorageStats = () => {
  const [stats, setStats] = useState({
    totalSize: 0,
    itemCount: 0,
    availableSpace: 0
  });

  const calculateStats = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      let totalSize = 0;
      let itemCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([key + value]).size;
            itemCount++;
          }
        }
      }

      // Estimation de l'espace disponible (5MB est la limite courante)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const availableSpace = maxSize - totalSize;

      setStats({
        totalSize,
        itemCount,
        availableSpace
      });
    } catch (error) {
      console.error('Erreur calcul stats localStorage:', error);
    }
  }, []);

  useEffect(() => {
    calculateStats();
    
    // Recalculer les stats toutes les minutes
    const interval = setInterval(calculateStats, 60000);
    return () => clearInterval(interval);
  }, [calculateStats]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    ...stats,
    formatSize,
    refreshStats: calculateStats,
    isNearLimit: stats.availableSpace < 500000 // Alerte si moins de 500KB
  };
};

export default useLocalStorage;
