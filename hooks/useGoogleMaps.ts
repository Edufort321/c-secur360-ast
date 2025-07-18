// hooks/useGoogleMaps.ts
import { useState, useEffect } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GoogleMapsConfig {
  apiKey?: string;
  libraries?: string[];
  region?: string;
  language?: string;
}

export interface PlaceResult {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
  types?: string[];
}

export const useGoogleMaps = (config?: GoogleMapsConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultConfig: GoogleMapsConfig = {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo-key',
    libraries: ['places', 'geometry'],
    region: 'CA',
    language: 'fr',
    ...config
  };

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Vérifier si Google Maps est déjà chargé
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Vérifier si le script est déjà en cours de chargement
      if (typeof document !== 'undefined' && document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (typeof document !== 'undefined') {
          const script = document.createElement('script');
          const libraries = defaultConfig.libraries?.join(',') || 'places,geometry';
          
          script.src = `https://maps.googleapis.com/maps/api/js?key=${defaultConfig.apiKey}&libraries=${libraries}&region=${defaultConfig.region}&language=${defaultConfig.language}`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            setIsLoaded(true);
            setIsLoading(false);
          };

          script.onerror = () => {
            setError('Erreur lors du chargement de Google Maps');
            setIsLoading(false);
          };

          document.head.appendChild(script);
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation de Google Maps');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Fonction pour géocoder une adresse
  const geocodeAddress = async (address: string): Promise<PlaceResult | null> => {
    if (!isLoaded || typeof window === 'undefined' || !(window as any).google) {
      // Version mock pour le développement
      return {
        address,
        coordinates: { lat: 45.5017, lng: -73.5673 },
        placeId: 'mock-place-id'
      };
    }

    return new Promise((resolve, reject) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      
      geocoder.geocode(
        { address, region: defaultConfig.region },
        (results: any, status: string) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            resolve({
              address: result.formatted_address,
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              placeId: result.place_id,
              types: result.types
            });
          } else {
            reject(new Error(`Géocodage échoué: ${status}`));
          }
        }
      );
    });
  };

  // Fonction pour géocodage inverse
  const reverseGeocode = async (coordinates: Coordinates): Promise<PlaceResult | null> => {
    if (!isLoaded || typeof window === 'undefined' || !(window as any).google) {
      return {
        address: 'Adresse simulée',
        coordinates,
        placeId: 'mock-place-id'
      };
    }

    return new Promise((resolve, reject) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      const latLng = new (window as any).google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      geocoder.geocode(
        { location: latLng },
        (results: any, status: string) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const location = result.geometry.location;
            
            resolve({
              address: result.formatted_address,
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              placeId: result.place_id,
              types: result.types
            });
          } else {
            reject(new Error(`Géocodage inverse échoué: ${status}`));
          }
        }
      );
    });
  };

  // Fonction pour obtenir la position actuelle
  const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({ lat: 45.5017, lng: -73.5673 }); // Montréal par défaut
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn(`Erreur de géolocalisation: ${error.message}`);
          resolve({ lat: 45.5017, lng: -73.5673 }); // Fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  // Fonction pour créer une carte
  const createMap = (element: HTMLElement, options?: any) => {
    if (!isLoaded || typeof window === 'undefined' || !(window as any).google) {
      return {
        setCenter: () => {},
        setZoom: () => {},
        addListener: () => {},
      };
    }

    const defaultOptions = {
      center: { lat: 45.5017, lng: -73.5673 },
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      ...options
    };

    return new (window as any).google.maps.Map(element, defaultOptions);
  };

  // Fonction pour créer un marqueur
  const createMarker = (map: any, position: Coordinates, options?: any) => {
    if (!isLoaded || typeof window === 'undefined' || !(window as any).google) {
      return {
        setPosition: () => {},
        setMap: () => {},
      };
    }

    const defaultOptions = {
      position: new (window as any).google.maps.LatLng(position.lat, position.lng),
      map,
      draggable: true,
      ...options
    };

    return new (window as any).google.maps.Marker(defaultOptions);
  };

  return {
    isLoaded,
    isLoading,
    error,
    geocodeAddress,
    reverseGeocode,
    getCurrentPosition,
    createMap,
    createMarker,
    google: typeof window !== 'undefined' ? (window as any).google : undefined
  };
};

export default useGoogleMaps;
