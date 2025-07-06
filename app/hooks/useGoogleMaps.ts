// hooks/useGoogleMaps.ts
import { useState, useEffect } from 'react';

export interface GoogleMapsConfig {
  apiKey?: string;
  libraries?: string[];
  region?: string;
  language?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
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
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY',
    libraries: ['places', 'geometry'],
    region: 'CA',
    language: 'fr',
    ...config
  };

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Vérifier si Google Maps est déjà chargé
      if (typeof window !== 'undefined' && window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Vérifier si le script est déjà en cours de chargement
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
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
      } catch (err) {
        setError('Erreur lors de l\'initialisation de Google Maps');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Fonction pour géocoder une adresse
  const geocodeAddress = async (address: string): Promise<PlaceResult | null> => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps n\'est pas chargé');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { address, region: defaultConfig.region },
        (results, status) => {
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

  // Fonction pour géocodage inverse (coordonnées vers adresse)
  const reverseGeocode = async (coordinates: Coordinates): Promise<PlaceResult | null> => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps n\'est pas chargé');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      geocoder.geocode(
        { location: latLng },
        (results, status) => {
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

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps n\'est pas chargé');
    }

    const latLng1 = new google.maps.LatLng(point1.lat, point1.lng);
    const latLng2 = new google.maps.LatLng(point2.lat, point2.lng);
    
    return google.maps.geometry.spherical.computeDistanceBetween(latLng1, latLng2);
  };

  // Fonction pour obtenir la position actuelle
  const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
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
          reject(new Error(`Erreur de géolocalisation: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Fonction pour créer une carte
  const createMap = (element: HTMLElement, options?: google.maps.MapOptions) => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps n\'est pas chargé');
    }

    const defaultOptions: google.maps.MapOptions = {
      center: { lat: 45.5017, lng: -73.5673 }, // Montréal par défaut
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      ...options
    };

    return new google.maps.Map(element, defaultOptions);
  };

  // Fonction pour créer un marqueur
  const createMarker = (map: google.maps.Map, position: Coordinates, options?: google.maps.MarkerOptions) => {
    if (!isLoaded || !window.google) {
      throw new Error('Google Maps n\'est pas chargé');
    }

    const defaultOptions: google.maps.MarkerOptions = {
      position: new google.maps.LatLng(position.lat, position.lng),
      map,
      draggable: true,
      ...options
    };

    return new google.maps.Marker(defaultOptions);
  };

  return {
    isLoaded,
    isLoading,
    error,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    getCurrentPosition,
    createMap,
    createMarker,
    google: typeof window !== 'undefined' ? window.google : undefined
  };
};

export default useGoogleMaps;
