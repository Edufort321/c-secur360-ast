"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Satellite,
  Map as MapIcon,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';

// =================== INTERFACES ===================
interface GoogleMapsProps {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  markers?: MapMarker[];
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  enableLocationPicker?: boolean;
  enableSearch?: boolean;
  enableMyLocation?: boolean;
  enableMapControls?: boolean;
  showTrafficLayer?: boolean;
  restrictToCountry?: string;
  language?: 'fr' | 'en';
  className?: string;
  placeholder?: string;
  errorMessage?: string;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  description?: string;
  icon?: string;
  type?: 'worksite' | 'emergency' | 'equipment' | 'hazard' | 'custom';
  data?: any;
}

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  name: string;
  types: string[];
}

// =================== CONFIGURATION ===================
const SHERBROOKE_CENTER = { lat: 45.4042, lng: -71.8929 };

const markerIcons = {
  worksite: '🏗️',
  emergency: '🚨',
  equipment: '🛠️',
  hazard: '⚠️',
  custom: '📍'
};

const mapStyles = {
  default: [],
  // Style personnalisé pour les sites industriels
  industrial: [
    {
      featureType: "poi.business",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }]
    }
  ]
};

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    searchPlaceholder: 'Rechercher une adresse ou un lieu...',
    myLocation: 'Ma position',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    satellite: 'Vue satellite',
    roadmap: 'Plan',
    traffic: 'Trafic',
    loading: 'Chargement de la carte...',
    locationDenied: 'Géolocalisation refusée',
    searchError: 'Erreur de recherche',
    clickToSelect: 'Cliquez sur la carte pour sélectionner un emplacement',
    locationSelected: 'Emplacement sélectionné',
    invalidApiKey: 'Clé API Google Maps invalide',
    networkError: 'Erreur de connexion'
  },
  en: {
    searchPlaceholder: 'Search for an address or place...',
    myLocation: 'My location',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    satellite: 'Satellite view',
    roadmap: 'Map',
    traffic: 'Traffic',
    loading: 'Loading map...',
    locationDenied: 'Geolocation denied',
    searchError: 'Search error',
    clickToSelect: 'Click on the map to select a location',
    locationSelected: 'Location selected',
    invalidApiKey: 'Invalid Google Maps API key',
    networkError: 'Network error'
  }
};

// =================== HOOKS ===================
const useGoogleMapsAPI = (apiKey?: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Vérifier si Google Maps est déjà chargé
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    if (!apiKey) {
      // Mode démo sans API key
      setError('API Key required for full functionality');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=fr`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps API');

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  return { isLoaded, error };
};

// =================== COMPOSANT PRINCIPAL ===================
const GoogleMaps: React.FC<GoogleMapsProps> = ({
  apiKey,
  center = SHERBROOKE_CENTER,
  zoom = 12,
  height = '400px',
  width = '100%',
  mapTypeId = 'roadmap',
  markers = [],
  onLocationSelect,
  onMarkerClick,
  enableLocationPicker = false,
  enableSearch = true,
  enableMyLocation = true,
  enableMapControls = true,
  showTrafficLayer = false,
  restrictToCountry = 'ca',
  language = 'fr',
  className = '',
  placeholder,
  errorMessage
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentMapType, setCurrentMapType] = useState<string>(mapTypeId);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded, error } = useGoogleMapsAPI(apiKey);
  const t = translations[language];

  // =================== INITIALISATION DE LA CARTE ===================
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      mapTypeId: currentMapType as google.maps.MapTypeId,
      disableDefaultUI: !enableMapControls,
      zoomControl: enableMapControls,
      streetViewControl: enableMapControls,
      fullscreenControl: enableMapControls,
      mapTypeControl: false, // On crée nos propres contrôles
      styles: mapStyles.default,
      clickableIcons: false
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Traffic layer
    if (showTrafficLayer) {
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }

    // Click listener pour sélection de lieu
    if (enableLocationPicker) {
      map.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          setSelectedLocation({ lat, lng });
          
          // Géocodage inverse pour obtenir l'adresse
          const geocoder = new google.maps.Geocoder();
          try {
            const result = await geocoder.geocode({ location: { lat, lng } });
            const address = result.results[0]?.formatted_address || '';
            
            if (onLocationSelect) {
              onLocationSelect({ lat, lng, address });
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            if (onLocationSelect) {
              onLocationSelect({ lat, lng });
            }
          }
        }
      });
    }

    // Ajouter les marqueurs
    addMarkers(map);

  }, [center, zoom, currentMapType, enableMapControls, enableLocationPicker, showTrafficLayer, onLocationSelect]);

  // =================== GESTION DES MARQUEURS ===================
  const addMarkers = useCallback((map: google.maps.Map) => {
    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createMarkerSVG(markerData.type || 'custom'))}`,
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      if (markerData.title || markerData.description) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; color: #333;">${markerData.title || 'Marqueur'}</h4>
              ${markerData.description ? `<p style="margin: 0; color: #666;">${markerData.description}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });
      }

      markersRef.current.push(marker);
    });

    // Marqueur de sélection
    if (selectedLocation) {
      const selectionMarker = new google.maps.Marker({
        position: selectedLocation,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createMarkerSVG('custom', '#ff4444'))}`,
          scaledSize: new google.maps.Size(32, 32)
        },
        title: t.locationSelected
      });
      markersRef.current.push(selectionMarker);
    }
  }, [markers, selectedLocation, onMarkerClick, t.locationSelected]);

  // =================== UTILITAIRES ===================
  const createMarkerSVG = (type: string, color: string = '#4285f4') => {
    const icon = markerIcons[type as keyof typeof markerIcons] || '📍';
    return `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" font-size="14">${icon}</text>
      </svg>
    `;
  };

  const handleLocationSearch = useCallback(async () => {
    if (!searchValue.trim() || !window.google) return;

    setIsSearching(true);
    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);
    
    const request = {
      query: searchValue,
      fields: ['place_id', 'formatted_address', 'geometry', 'name'],
      locationBias: mapInstanceRef.current!.getCenter()
    };

    service.textSearch(request, (results, status) => {
      setIsSearching(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        const location = place.geometry!.location!;
        const lat = location.lat();
        const lng = location.lng();
        
        mapInstanceRef.current!.setCenter({ lat, lng });
        mapInstanceRef.current!.setZoom(16);
        
        setSelectedLocation({ lat, lng });
        if (onLocationSelect) {
          onLocationSelect({ 
            lat, 
            lng, 
            address: place.formatted_address 
          });
        }
      }
    });
  }, [searchValue, onLocationSelect]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setUserLocation({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
        }
        
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }, [onLocationSelect]);

  // =================== EFFETS ===================
  useEffect(() => {
    if (isLoaded) {
      initializeMap();
    }
  }, [isLoaded, initializeMap]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      addMarkers(mapInstanceRef.current);
    }
  }, [markers, selectedLocation, addMarkers]);

  // =================== RENDU ===================
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`} style={{ height, width }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{errorMessage || error}</p>
            <p className="text-red-600 text-sm mt-2">{t.networkError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`} style={{ height, width }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`} style={{ height, width }}>
      {/* Barre de recherche */}
      {enableSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                placeholder={placeholder || t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" />}
            </div>
            <button
              onClick={handleLocationSearch}
              disabled={!searchValue.trim() || isSearching}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Contrôles de carte */}
      {enableMapControls && (
        <div className="absolute top-4 right-4 z-10 space-y-2">
          {/* Type de carte */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => {
                setCurrentMapType('roadmap');
                mapInstanceRef.current?.setMapTypeId('roadmap');
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentMapType === 'roadmap' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMapType('satellite');
                mapInstanceRef.current?.setMapTypeId('satellite');
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentMapType === 'satellite' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Satellite className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 10) + 1)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title={t.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 10) - 1)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              title={t.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Ma position */}
          {enableMyLocation && (
            <button
              onClick={getCurrentLocation}
              className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              title={t.myLocation}
            >
              <Crosshair className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Instructions pour la sélection */}
      {enableLocationPicker && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{t.clickToSelect}</span>
              {selectedLocation && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.locationSelected}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Container de la carte */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMaps;
