// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USEGEOLOCATION.TS ===================
// Hook React pour géolocalisation GPS native - Focus géolocalisation pure
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// =================== INTERFACES GÉOLOCALISATION ===================

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // en mètres
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number; // direction en degrés
  speed?: number; // vitesse en m/s
  timestamp: Date;
}

export interface GeolocationAddress {
  streetNumber?: string;
  streetName?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  formattedAddress: string;
  placeId?: string;
  confidence: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  timestamp: Date;
}

export interface GeolocationConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  watchPosition: boolean;
  reverseGeocode: boolean;
  autoUpdate: boolean;
  minUpdateDistance: number; // mètres minimum pour déclencher une mise à jour
  minUpdateTime: number; // millisecondes minimum entre les mises à jour
  geocodingProvider: 'bigdatacloud' | 'nominatim' | 'google';
  retryAttempts: number;
  retryDelay: number;
}

export interface GeolocationState {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  isWatching: boolean;
  position: GeolocationPosition | null;
  address: GeolocationAddress | null;
  error: GeolocationError | null;
  lastUpdate: Date | null;
  attempts: number;
}

export interface LocationHistory {
  id: string;
  position: GeolocationPosition;
  address: GeolocationAddress | null;
  timestamp: Date;
  source: 'manual' | 'watch' | 'auto';
  accuracy: 'high' | 'medium' | 'low';
}

// =================== CONFIGURATION PAR DÉFAUT ===================

const DEFAULT_CONFIG: GeolocationConfig = {
  enableHighAccuracy: true,
  timeout: 15000, // 15 secondes
  maximumAge: 300000, // 5 minutes
  watchPosition: false,
  reverseGeocode: true,
  autoUpdate: false,
  minUpdateDistance: 10, // 10 mètres
  minUpdateTime: 30000, // 30 secondes
  geocodingProvider: 'bigdatacloud',
  retryAttempts: 3,
  retryDelay: 2000 // 2 secondes
};

// Configuration des providers de géocodage
const GEOCODING_PROVIDERS = {
  bigdatacloud: {
    name: 'BigDataCloud',
    url: (lat: number, lng: number) => 
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`,
    free: true,
    rateLimit: '10000/month'
  },
  nominatim: {
    name: 'OpenStreetMap Nominatim',
    url: (lat: number, lng: number) => 
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`,
    free: true,
    rateLimit: '1/second'
  },
  google: {
    name: 'Google Maps Geocoding',
    url: (lat: number, lng: number) => 
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=fr&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    free: false,
    rateLimit: 'Selon plan'
  }
} as const;

// =================== HOOK PRINCIPAL ===================

export function useGeolocation(config: Partial<GeolocationConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // État principal
  const [state, setState] = useState<GeolocationState>({
    isSupported: false,
    isEnabled: false,
    isLoading: false,
    isWatching: false,
    position: null,
    address: null,
    error: null,
    lastUpdate: null,
    attempts: 0
  });

  // Historique des positions
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  
  // Références pour le nettoyage
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =================== FONCTIONS UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    console.log(`[Geolocation] ${message}`, data || '');
  }, []);

  const setError = useCallback((code: number, message: string) => {
    const error: GeolocationError = {
      code,
      message,
      timestamp: new Date()
    };
    setState(prev => ({ 
      ...prev, 
      error, 
      isLoading: false,
      attempts: prev.attempts + 1
    }));
    log(`Error: ${message}`, { code, attempts: state.attempts + 1 });
  }, [log, state.attempts]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, attempts: 0 }));
  }, []);

  // Vérification du support géolocalisation
  const checkGeolocationSupport = useCallback(() => {
    const isSupported = 'geolocation' in navigator;
    setState(prev => ({ ...prev, isSupported }));
    
    if (!isSupported) {
      setError(0, 'Géolocalisation non supportée dans ce navigateur');
    }
    
    log('Support géolocalisation vérifié', { supported: isSupported });
    return isSupported;
  }, [setError, log]);

  // Calcul de distance entre deux positions (formule Haversine)
  const calculateDistance = useCallback((pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = pos1.latitude * Math.PI / 180;
    const φ2 = pos2.latitude * Math.PI / 180;
    const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  }, []);

  // Calcul de la vitesse entre deux positions
  const calculateSpeed = useCallback((pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
    const distance = calculateDistance(pos1, pos2);
    const timeDiff = (pos2.timestamp.getTime() - pos1.timestamp.getTime()) / 1000; // secondes
    return timeDiff > 0 ? distance / timeDiff : 0; // m/s
  }, [calculateDistance]);

  // Évaluation de la précision GPS
  const evaluateAccuracy = useCallback((accuracy: number): 'high' | 'medium' | 'low' => {
    if (accuracy <= 5) return 'high';
    if (accuracy <= 20) return 'medium';
    return 'low';
  }, []);

  // =================== GÉOLOCALISATION ===================

  const getCurrentPosition = useCallback((retryCount = 0): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!state.isSupported) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true }));
      clearError();

      const options: PositionOptions = {
        enableHighAccuracy: finalConfig.enableHighAccuracy,
        timeout: finalConfig.timeout,
        maximumAge: finalConfig.maximumAge
      };

      log(`Tentative ${retryCount + 1}/${finalConfig.retryAttempts + 1} de géolocalisation`);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: new Date(position.timestamp)
          };

          // Calculer la vitesse si position précédente disponible
          if (lastPositionRef.current) {
            const calculatedSpeed = calculateSpeed(lastPositionRef.current, geoPosition);
            if (!geoPosition.speed && calculatedSpeed > 0) {
              geoPosition.speed = calculatedSpeed;
            }
          }

          setState(prev => ({
            ...prev,
            position: geoPosition,
            isLoading: false,
            lastUpdate: new Date(),
            isEnabled: true,
            attempts: 0
          }));

          // Ajouter à l'historique
          const historyEntry: LocationHistory = {
            id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            position: geoPosition,
            address: null,
            timestamp: new Date(),
            source: 'manual',
            accuracy: evaluateAccuracy(geoPosition.accuracy)
          };

          setLocationHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Garder 50 dernières

          lastPositionRef.current = geoPosition;
          log('Position obtenue', { 
            ...geoPosition, 
            accuracy: evaluateAccuracy(geoPosition.accuracy)
          });
          resolve(geoPosition);

          // Géocodage inverse si activé
          if (finalConfig.reverseGeocode) {
            reverseGeocode(geoPosition).then(address => {
              if (address) {
                // Mettre à jour l'entrée d'historique avec l'adresse
                setLocationHistory(prev => 
                  prev.map(entry => 
                    entry.id === historyEntry.id 
                      ? { ...entry, address }
                      : entry
                  )
                );
              }
            });
          }
        },
        (error) => {
          let message = 'Erreur de géolocalisation inconnue';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permission de géolocalisation refusée par l\'utilisateur';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Position GPS indisponible (vérifiez votre connexion)';
              break;
            case error.TIMEOUT:
              message = `Timeout de géolocalisation (${finalConfig.timeout}ms dépassé)`;
              break;
          }

          // Retry logic
          if (retryCount < finalConfig.retryAttempts && error.code !== error.PERMISSION_DENIED) {
            log(`Retry dans ${finalConfig.retryDelay}ms (tentative ${retryCount + 1})`);
            retryTimeoutRef.current = setTimeout(() => {
              getCurrentPosition(retryCount + 1).then(resolve).catch(reject);
            }, finalConfig.retryDelay);
          } else {
            setError(error.code, message);
            reject(new Error(message));
          }
        },
        options
      );
    });
  }, [
    state.isSupported, 
    finalConfig, 
    clearError, 
    setError, 
    log, 
    calculateSpeed, 
    evaluateAccuracy
  ]);

  const startWatching = useCallback(() => {
    if (!state.isSupported || state.isWatching) return;

    const options: PositionOptions = {
      enableHighAccuracy: finalConfig.enableHighAccuracy,
      timeout: finalConfig.timeout,
      maximumAge: finalConfig.maximumAge
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const geoPosition: GeolocationPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date(position.timestamp)
        };

        // Vérifier si la mise à jour est nécessaire
        const shouldUpdate = !lastPositionRef.current ||
          calculateDistance(lastPositionRef.current, geoPosition) >= finalConfig.minUpdateDistance ||
          (Date.now() - lastPositionRef.current.timestamp.getTime()) >= finalConfig.minUpdateTime;

        if (shouldUpdate) {
          // Calculer la vitesse
          if (lastPositionRef.current) {
            const calculatedSpeed = calculateSpeed(lastPositionRef.current, geoPosition);
            if (!geoPosition.speed && calculatedSpeed > 0) {
              geoPosition.speed = calculatedSpeed;
            }
          }

          setState(prev => ({
            ...prev,
            position: geoPosition,
            lastUpdate: new Date()
          }));

          // Ajouter à l'historique
          const historyEntry: LocationHistory = {
            id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            position: geoPosition,
            address: null,
            timestamp: new Date(),
            source: 'watch',
            accuracy: evaluateAccuracy(geoPosition.accuracy)
          };

          setLocationHistory(prev => [historyEntry, ...prev.slice(0, 49)]);

          lastPositionRef.current = geoPosition;
          log('Position mise à jour (watch)', {
            distance: lastPositionRef.current ? calculateDistance(lastPositionRef.current, geoPosition) : 0,
            accuracy: evaluateAccuracy(geoPosition.accuracy)
          });

          if (finalConfig.reverseGeocode) {
            reverseGeocode(geoPosition).then(address => {
              if (address) {
                setLocationHistory(prev => 
                  prev.map(entry => 
                    entry.id === historyEntry.id 
                      ? { ...entry, address }
                      : entry
                  )
                );
              }
            });
          }
        }
      },
      (error) => {
        let message = 'Erreur de surveillance de position';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation révoquée';
            stopWatching(); // Arrêter la surveillance si permission révoquée
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position devenue indisponible';
            break;
          case error.TIMEOUT:
            message = 'Timeout de surveillance GPS';
            break;
        }
        setError(error.code, message);
      },
      options
    );

    setState(prev => ({ ...prev, isWatching: true }));
    log('Surveillance de position démarrée');
  }, [
    state.isSupported, 
    state.isWatching, 
    finalConfig, 
    calculateDistance, 
    calculateSpeed,
    evaluateAccuracy,
    setError, 
    log
  ]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isWatching: false }));
    log('Surveillance de position arrêtée');
  }, [log]);

  // =================== GÉOCODAGE INVERSE ===================

  const reverseGeocode = useCallback(async (
    position: GeolocationPosition,
    provider: GeolocationConfig['geocodingProvider'] = finalConfig.geocodingProvider
  ): Promise<GeolocationAddress | null> => {
    try {
      const providerConfig = GEOCODING_PROVIDERS[provider];
      const url = providerConfig.url(position.latitude, position.longitude);
      
      log(`Géocodage inverse via ${providerConfig.name}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PermitsApp/1.0 (Contact: support@permits.ca)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      let address: GeolocationAddress;

      // Parser selon le provider
      switch (provider) {
        case 'bigdatacloud':
          address = {
            streetNumber: data.streetNumber || '',
            streetName: data.streetName || '',
            city: data.city || data.locality || 'Ville inconnue',
            province: data.principalSubdivision || 'Province inconnue',
            postalCode: data.postcode || '',
            country: data.countryName || 'Canada',
            formattedAddress: data.localityInfo?.administrative?.[2]?.name || 
                             `${data.locality || 'Position GPS'}, ${data.principalSubdivision || 'QC'}`,
            confidence: Math.min(data.confidence || 0.8, 1.0)
          };
          break;

        case 'nominatim':
          const addr = data.address || {};
          address = {
            streetNumber: addr.house_number || '',
            streetName: addr.road || '',
            city: addr.city || addr.town || addr.village || 'Ville inconnue',
            province: addr.state || addr.province || 'Province inconnue',
            postalCode: addr.postcode || '',
            country: addr.country || 'Canada',
            formattedAddress: data.display_name || `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
            confidence: 0.85 // Nominatim ne fournit pas de score de confiance
          };
          break;

        case 'google':
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components.reduce((acc: any, comp: any) => {
              comp.types.forEach((type: string) => {
                acc[type] = comp;
              });
              return acc;
            }, {});

            address = {
              streetNumber: components.street_number?.short_name || '',
              streetName: components.route?.long_name || '',
              city: components.locality?.long_name || components.administrative_area_level_3?.long_name || 'Ville inconnue',
              province: components.administrative_area_level_1?.short_name || 'Province inconnue',
              postalCode: components.postal_code?.short_name || '',
              country: components.country?.long_name || 'Canada',
              formattedAddress: result.formatted_address,
              placeId: result.place_id,
              confidence: 0.95 // Google a généralement une haute précision
            };
          } else {
            throw new Error('Aucun résultat de géocodage Google');
          }
          break;

        default:
          throw new Error(`Provider de géocodage non supporté: ${provider}`);
      }

      setState(prev => ({ ...prev, address }));
      log(`Adresse obtenue via ${providerConfig.name}`, {
        address: address.formattedAddress,
        confidence: address.confidence
      });
      
      return address;
      
    } catch (error: any) {
      log(`Erreur géocodage inverse (${provider})`, error.message);
      
      // Fallback vers un autre provider si disponible
      if (provider !== 'bigdatacloud') {
        log('Tentative fallback vers BigDataCloud');
        return reverseGeocode(position, 'bigdatacloud');
      }
      
      // Retourner une adresse basique avec coordonnées GPS
      const fallbackAddress: GeolocationAddress = {
        city: 'Position GPS',
        province: 'QC',
        country: 'Canada',
        formattedAddress: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
        confidence: 1.0
      };
      
      setState(prev => ({ ...prev, address: fallbackAddress }));
      return fallbackAddress;
    }
  }, [finalConfig.geocodingProvider, log]);

  // =================== UTILITAIRES HISTORIQUE ===================

  const getLocationHistory = useCallback((limit = 10): LocationHistory[] => {
    return locationHistory.slice(0, limit);
  }, [locationHistory]);

  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
    log('Historique des positions effacé');
  }, [log]);

  const getDistanceTraveled = useCallback(): number => {
    if (locationHistory.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < locationHistory.length - 1; i++) {
      totalDistance += calculateDistance(
        locationHistory[i + 1].position,
        locationHistory[i].position
      );
    }
    return totalDistance;
  }, [locationHistory, calculateDistance]);

  const getAverageAccuracy = useCallback(): number => {
    if (locationHistory.length === 0) return 0;
    
    const totalAccuracy = locationHistory.reduce((sum, entry) => sum + entry.position.accuracy, 0);
    return totalAccuracy / locationHistory.length;
  }, [locationHistory]);

  // =================== EFFETS ===================

  // Initialisation
  useEffect(() => {
    checkGeolocationSupport();
  }, [checkGeolocationSupport]);

  // Auto-démarrage si configuré
  useEffect(() => {
    if (finalConfig.autoUpdate && state.isSupported) {
      getCurrentPosition().catch(() => {
        // Ignore les erreurs d'auto-démarrage
      });
    }
  }, [finalConfig.autoUpdate, state.isSupported, getCurrentPosition]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // =================== RETOUR DU HOOK ===================

  return {
    // État principal
    ...state,
    
    // Actions principales
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearError,
    reverseGeocode,
    
    // Historique
    locationHistory: getLocationHistory(),
    clearLocationHistory,
    
    // Utilitaires
    calculateDistance,
    calculateSpeed,
    evaluateAccuracy,
    
    // Statistiques
    distanceTraveled: getDistanceTraveled(),
    averageAccuracy: getAverageAccuracy(),
    
    // Données calculées
    hasPosition: !!state.position,
    hasAddress: !!state.address,
    isHighAccuracy: state.position ? evaluateAccuracy(state.position.accuracy) === 'high' : false,
    currentSpeed: state.position?.speed || 0,
    
    // Providers disponibles
    availableProviders: Object.keys(GEOCODING_PROVIDERS),
    currentProvider: finalConfig.geocodingProvider,
    
    // Configuration
    config: finalConfig
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseGeolocationReturn = ReturnType<typeof useGeolocation>;

// Export des types pour utilisation dans d'autres hooks
export type {
  GeolocationPosition,
  GeolocationAddress,
  GeolocationError,
  GeolocationConfig,
  LocationHistory
};

export default useGeolocation;
