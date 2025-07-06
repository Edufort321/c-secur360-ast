// app/hooks/useGoogleMaps.ts
import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  address: string;
  coordinates: Coordinates;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

interface GoogleMapsHookResult {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  geocodeAddress: (address: string) => Promise<LocationData | null>;
  reverseGeocode: (coordinates: Coordinates) => Promise<LocationData | null>;
  calculateDistance: (from: Coordinates, to: Coordinates) => number;
}

export function useGoogleMaps(): GoogleMapsHookResult {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simuler Google Maps API (remplacer par vraie API en production)
  const mockGeocoding = {
    // Données simulées pour la région de Québec
    mockAddresses: [
      {
        address: "1234 Rue de la Paix, Québec, QC",
        coordinates: { lat: 46.8139, lng: -71.2080 },
        city: "Québec",
        province: "QC",
        postalCode: "G1R 2L5",
        country: "Canada"
      },
      {
        address: "5678 Boulevard des Érables, Sherbrooke, QC", 
        coordinates: { lat: 45.4042, lng: -71.8929 },
        city: "Sherbrooke",
        province: "QC", 
        postalCode: "J1H 4K5",
        country: "Canada"
      },
      {
        address: "999 Avenue du Parc, Montréal, QC",
        coordinates: { lat: 45.5017, lng: -73.5673 },
        city: "Montréal",
        province: "QC",
        postalCode: "H2X 3A4", 
        country: "Canada"
      }
    ]
  };

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Géolocalisation non supportée par ce navigateur');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const coordinates: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Utiliser reverse geocoding pour obtenir l'adresse
      const locationData = await reverseGeocode(coordinates);
      setCurrentLocation(locationData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géolocalisation';
      setError(errorMessage);
      
      // Fallback: utiliser une position par défaut (Sherbrooke, QC)
      const fallbackLocation: LocationData = {
        address: "Sherbrooke, QC, Canada",
        coordinates: { lat: 45.4042, lng: -71.8929 },
        city: "Sherbrooke",
        province: "QC",
        country: "Canada"
      };
      setCurrentLocation(fallbackLocation);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulation: rechercher dans les adresses mockées
      const found = mockGeocoding.mockAddresses.find(item => 
        item.address.toLowerCase().includes(address.toLowerCase()) ||
        item.city?.toLowerCase().includes(address.toLowerCase())
      );

      if (found) {
        return found;
      }

      // Si pas trouvé, générer une position approximative
      const mockResult: LocationData = {
        address: `${address}, QC, Canada`,
        coordinates: { 
          lat: 45.4042 + (Math.random() - 0.5) * 0.1, 
          lng: -71.8929 + (Math.random() - 0.5) * 0.1 
        },
        city: address.split(',')[0],
        province: "QC",
        country: "Canada"
      };

      return mockResult;

    } catch (err) {
      setError('Erreur lors du géocodage');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (coordinates: Coordinates): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulation: trouver l'adresse la plus proche
      let closest = mockGeocoding.mockAddresses[0];
      let minDistance = calculateDistance(coordinates, closest.coordinates);

      mockGeocoding.mockAddresses.forEach(item => {
        const distance = calculateDistance(coordinates, item.coordinates);
        if (distance < minDistance) {
          minDistance = distance;
          closest = item;
        }
      });

      // Si très proche d'une adresse connue, la retourner
      if (minDistance < 10) { // moins de 10km
        return {
          ...closest,
          coordinates // utiliser les coordonnées exactes fournies
        };
      }

      // Sinon, générer une adresse approximative
      const mockResult: LocationData = {
        address: `Approximatif: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
        coordinates,
        city: "Secteur",
        province: "QC",
        country: "Canada"
      };

      return mockResult;

    } catch (err) {
      setError('Erreur lors du géocodage inverse');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateDistance = useCallback((from: Coordinates, to: Coordinates): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  }, []);

  // Initialiser la position au chargement
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    currentLocation,
    isLoading,
    error,
    getCurrentLocation,
    geocodeAddress,
    reverseGeocode,
    calculateDistance
  };
}
