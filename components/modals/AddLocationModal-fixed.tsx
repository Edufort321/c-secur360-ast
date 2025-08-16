'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Location } from '../../app/types/ast';
import useGoogleMaps from '../../hooks/useGoogleMaps';

interface Props {
  isOpen: boolean;
  initial?: Location | null;
  onCancel: () => void;
  onSave: (loc: Location) => void;
}

/**
 * 🔥 MODAL FIXÉ - Z-INDEX MAXIMUM + FOCUS STABLE
 * Utilise un React Portal avec z-index absolu pour éviter les problèmes de superposition
 */
export default function AddLocationModal({ isOpen, initial, onCancel, onSave }: Props) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const { getCurrentPosition, createMap, createMarker, geocodeAddress, isLoaded } = useGoogleMaps();
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [useGeocode, setUseGeocode] = useState(hasApiKey);
  const [needsValidation, setNeedsValidation] = useState(!hasApiKey);
  
  // 🔥 FIX FOCUS - État local stable sans re-renders excessifs
  const [loc, setLoc] = useState<Location & { address?: string }>({
    site: '',
    building: '',
    floor: '',
    room: '',
    specificArea: '',
    address: '',
    needsValidation: !hasApiKey,
  });

  // 🔥 FIX CRITIQUE - Cleanup au démontage
  useEffect(() => {
    setMounted(true);
    
    return () => {
      // Cleanup Google Maps
      if (markerRef.current) {
        markerRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('[LocationModal] open', isOpen);
    
    // 🔥 FIX BODY SCROLL - Gestion propre du scroll
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    
    return () => {
      // Cleanup au démontage
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (initial) {
      setLoc({
        site: initial.site ?? '',
        building: initial.building ?? '',
        floor: initial.floor ?? '',
        room: initial.room ?? '',
        specificArea: initial.specificArea ?? '',
        coordinates: initial.coordinates,
        accessRestrictions: initial.accessRestrictions,
        emergencyExits: initial.emergencyExits,
        address: (initial as any).address ?? '',
        needsValidation: initial.needsValidation ?? !hasApiKey,
      });
      setNeedsValidation(initial.needsValidation ?? !hasApiKey);
    }
  }, [initial, hasApiKey]);

  useEffect(() => {
    if (!isOpen || !mounted || !hasApiKey) return;

    const initMap = async () => {
      let pos = { lat: 45.5017, lng: -73.5673 };
      try {
        pos = initial?.coordinates
          ? { lat: initial.coordinates.latitude, lng: initial.coordinates.longitude }
          : await getCurrentPosition();
      } catch (e) {
        console.warn(e);
      }

      setLoc((prev) => ({
        ...prev,
        coordinates: { latitude: pos.lat, longitude: pos.lng },
      }));

      if (mapRef.current) {
        mapInstance.current = createMap(mapRef.current, { center: pos, zoom: 14 });
        markerRef.current = createMarker(mapInstance.current, pos);
        if (markerRef.current.addListener) {
          markerRef.current.addListener('dragend', (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLoc((prev) => ({
              ...prev,
              coordinates: { latitude: lat, longitude: lng },
            }));
          });
        }
      }
    };

    initMap();
  }, [isOpen, mounted, initial, getCurrentPosition, createMap, createMarker, hasApiKey]);

  useEffect(() => {
    if (!isOpen || !isLoaded || !addressInputRef.current || !hasApiKey) return;

    const google = (window as any).google;
    let autocomplete: any;

    if (google?.maps?.places) {
      autocomplete = new google.maps.places.Autocomplete(addressInputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLoc((prev) => ({
          ...prev,
          address: place.formatted_address,
          coordinates: { latitude: lat, longitude: lng },
        }));
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat, lng });
        }
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else if (mapInstance.current) {
          markerRef.current = createMarker(mapInstance.current, { lat, lng });
        }
      });
    }

    return () => {
      if (autocomplete && google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isOpen, isLoaded, createMarker, hasApiKey]);

  const handleAddressBlur = async () => {
    const value = addressInputRef.current?.value;
    if (!value) return;
    if (!hasApiKey) {
      setNeedsValidation(true);
      setUseGeocode(false);
      return;
    }
    try {
      const result = await Promise.race([
        geocodeAddress(value),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      if (result) {
        const { address, coordinates } = result as any;
        setLoc((prev) => ({
          ...prev,
          address,
          coordinates: { latitude: coordinates.lat, longitude: coordinates.lng },
          needsValidation: false,
        }));
        setNeedsValidation(false);
        setUseGeocode(true);
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat: coordinates.lat, lng: coordinates.lng });
        }
        if (markerRef.current) {
          markerRef.current.setPosition({ lat: coordinates.lat, lng: coordinates.lng });
        } else if (mapInstance.current) {
          markerRef.current = createMarker(mapInstance.current, { lat: coordinates.lat, lng: coordinates.lng });
        }
      }
    } catch (err) {
      console.error(err);
      setNeedsValidation(true);
      setUseGeocode(false);
    }
  };

  // 🔥 FIX HANDLERS - Éviter les re-renders
  const handleInputChange = (field: keyof typeof loc, value: string) => {
    setLoc(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('[LocationModal] submitting', { address: loc.address, useGeocode });
    onSave({ ...loc, needsValidation });
  };

  const handleCancel = () => {
    // Reset form
    setLoc({
      site: '',
      building: '',
      floor: '',
      room: '',
      specificArea: '',
      address: '',
      needsValidation: !hasApiKey,
    });
    onCancel();
  };

  if (!isOpen || !mounted) return null;

  // 🔥 STYLES AVEC Z-INDEX MAXIMUM ABSOLU
  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 2147483647, // Z-INDEX MAXIMUM ABSOLU
    backgroundColor: 'rgba(0,0,0,0.95)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    // 🔥 FORCE SUPRÊME
    transform: 'translateZ(999999px)',
    willChange: 'transform',
  };

  const panel: React.CSSProperties = {
    width: 'min(720px, 100%)',
    background: 'rgba(15, 23, 42, 0.98)',
    backdropFilter: 'blur(30px)',
    color: 'white',
    borderRadius: 16,
    border: '3px solid rgba(59, 130, 246, 0.8)',
    boxShadow: '0 50px 100px rgba(0,0,0,0.95)',
    padding: 20,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    // 🔥 Z-INDEX CRITIQUE
    position: 'relative',
    zIndex: 2147483647,
    transform: 'translateZ(999999px)',
    willChange: 'transform',
  };

  const header: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
  };

  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 6,
    color: '#e2e8f0',
    fontWeight: '600',
  };

  const input: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(15, 23, 42, 1)', // Background forcé
    color: 'white',
    border: '2px solid rgba(100, 116, 139, 0.5)',
    borderRadius: 10,
    outline: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    // 🔥 Z-INDEX INPUTS
    position: 'relative',
    zIndex: 2147483647,
  };

  const inputFocus: React.CSSProperties = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    background: 'rgba(15, 23, 42, 1)',
  };

  const footer: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid rgba(100, 116, 139, 0.3)',
  };

  const badgeStyle: React.CSSProperties = {
    background: '#fef3c7',
    color: '#a16207',
    borderRadius: 8,
    padding: '2px 6px',
    fontSize: 10,
    marginLeft: 8,
  };

  const buttonPrimary: React.CSSProperties = {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    zIndex: 2147483647,
  };

  const buttonSecondary: React.CSSProperties = {
    padding: '12px 20px',
    background: 'rgba(100, 116, 139, 0.6)',
    color: 'white',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: 10,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    zIndex: 2147483647,
  };

  return createPortal(
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={panel}>
        <div style={header}>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Ajouter Emplacement
          </h3>
          <button
            onClick={handleCancel}
            aria-label="Fermer"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              padding: 10,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2147483647,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={grid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={label}>
              Adresse
              {needsValidation && <span style={badgeStyle}>à valider</span>}
            </div>
            <input
              ref={addressInputRef}
              style={input}
              value={loc.address ?? ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => {
                Object.assign(e.target.style, input);
                handleAddressBlur();
              }}
              placeholder="Rechercher une adresse"
            />
          </div>
          <div>
            <div style={label}>Nom du site</div>
            <input
              style={input}
              value={loc.site}
              onChange={(e) => handleInputChange('site', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, input)}
              placeholder="Ex.: Usine A"
            />
          </div>
          <div>
            <div style={label}>Bâtiment</div>
            <input
              style={input}
              value={loc.building ?? ''}
              onChange={(e) => handleInputChange('building', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, input)}
              placeholder="Ex.: Bloc B"
            />
          </div>
          <div>
            <div style={label}>Étage</div>
            <input
              style={input}
              value={loc.floor ?? ''}
              onChange={(e) => handleInputChange('floor', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, input)}
              placeholder="Ex.: SS1"
            />
          </div>
          <div>
            <div style={label}>Salle</div>
            <input
              style={input}
              value={loc.room ?? ''}
              onChange={(e) => handleInputChange('room', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, input)}
              placeholder="Ex.: Atelier Électrique"
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={label}>Zone spécifique</div>
            <input
              style={input}
              value={loc.specificArea ?? ''}
              onChange={(e) => handleInputChange('specificArea', e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, input)}
              placeholder="Ex.: Cellule 6, section disjoncteurs"
            />
          </div>
        </div>

        {hasApiKey ? (
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: 200,
              marginTop: 12,
              borderRadius: 10,
              border: '1px solid rgba(100, 116, 139, 0.3)',
            }}
          />
        ) : (
          <div
            style={{
              marginTop: 12,
              textAlign: 'center',
              color: 'white',
              opacity: 0.8,
              padding: 20,
              background: 'rgba(100, 116, 139, 0.1)',
              borderRadius: 10,
              border: '1px solid rgba(100, 116, 139, 0.3)',
            }}
          >
            Carte non disponible - Valider plus tard
          </div>
        )}

        <div style={footer}>
          <button onClick={handleCancel} style={buttonSecondary}>
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={buttonPrimary}
            disabled={!loc.site.trim()}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
