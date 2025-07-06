// app/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

type SerializableValue = string | number | boolean | object | null;

interface LocalStorageHookResult<T> {
  value: T | null;
  setValue: (value: T) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour gérer le stockage local avec type safety
 * ATTENTION: Ne peut pas être utilisé dans les artifacts Claude.ai
 * Ce hook est fourni pour usage dans votre environnement de développement local
 */
export function useLocalStorage<T extends SerializableValue>(
  key: string,
  defaultValue?: T
): LocalStorageHookResult<T> {
  const [value, setValue] = useState<T | null>(defaultValue || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour lire depuis localStorage
  const readFromStorage = useCallback((): T | null => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue || null;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }

      return JSON.parse(item) as T;
    } catch (err) {
      console.error(`Erreur lecture localStorage pour clé "${key}":`, err);
      setError(`Erreur lecture: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      return defaultValue || null;
    }
  }, [key, defaultValue]);

  // Fonction pour écrire dans localStorage
  const writeToStorage = useCallback((newValue: T) => {
    try {
      if (typeof window === 'undefined') {
        console.warn('localStorage non disponible côté serveur');
        return;
      }

      if (newValue === null || newValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      
      setValue(newValue);
      setError(null);
    } catch (err) {
      console.error(`Erreur écriture localStorage pour clé "${key}":`, err);
      setError(`Erreur écriture: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }, [key]);

  // Fonction pour supprimer de localStorage
  const removeFromStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setValue(null);
      setError(null);
    } catch (err) {
      console.error(`Erreur suppression localStorage pour clé "${key}":`, err);
      setError(`Erreur suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }, [key]);

  // Charger la valeur initiale
  useEffect(() => {
    setIsLoading(true);
    const initialValue = readFromStorage();
    setValue(initialValue);
    setIsLoading(false);
  }, [readFromStorage]);

  // Écouter les changements de localStorage (autres onglets)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setValue(newValue);
        } catch (err) {
          console.error('Erreur parsing changement storage:', err);
        }
      } else if (e.key === key && e.newValue === null) {
        setValue(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return {
    value,
    setValue: writeToStorage,
    removeValue: removeFromStorage,
    isLoading,
    error
  };
}

/**
 * Hook spécialisé pour les brouillons AST
 * Gère automatiquement la sauvegarde et récupération des formulaires en cours
 */
export function useASTDraft(astId?: string) {
  const key = astId ? `ast_draft_${astId}` : 'ast_draft_new';
  
  return useLocalStorage(key, {
    projectInfo: {},
    selectedHazards: [],
    selectedEquipment: [],
    controlMeasures: [],
    lastSaved: new Date().toISOString()
  });
}

/**
 * Hook pour les préférences utilisateur
 */
export function useUserPreferences() {
  return useLocalStorage('user_preferences', {
    language: 'fr',
    theme: 'light',
    autoSave: true,
    notifications: true,
    defaultClient: '',
    recentProjects: []
  });
}

/**
 * Hook pour le cache des données
 * Utile pour éviter de recharger les données fréquemment utilisées
 */
export function useDataCache<T>(key: string, expirationMinutes: number = 60) {
  const cacheKey = `cache_${key}`;
  const { value, setValue, removeValue } = useLocalStorage<{
    data: T;
    timestamp: number;
    expiresAt: number;
  }>(cacheKey);

  const isExpired = useCallback(() => {
    if (!value) return true;
    return Date.now() > value.expiresAt;
  }, [value]);

  const getCachedData = useCallback((): T | null => {
    if (!value || isExpired()) {
      removeValue();
      return null;
    }
    return value.data;
  }, [value, isExpired, removeValue]);

  const setCachedData = useCallback((data: T) => {
    const now = Date.now();
    setValue({
      data,
      timestamp: now,
      expiresAt: now + (expirationMinutes * 60 * 1000)
    });
  }, [setValue, expirationMinutes]);

  return {
    data: getCachedData(),
    setData: setCachedData,
    clearData: removeValue,
    isExpired: isExpired()
  };
}
