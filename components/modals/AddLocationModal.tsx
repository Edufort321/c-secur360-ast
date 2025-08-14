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
 * Modal d'ajout/modification d'emplacement.
 * Utilise un React Portal pour rester hors du flux DOM parent (plus de décalage).
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
  const [loc, setLoc] = useState<Location & { address?: string; needsValidation?: boolean }>({
    site: '',
    building: '',
    floor: '',
    room: '',
    specificArea: '',
    address: '',
    needsValidation: !hasApiKey,
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    console.log('[LocationModal] open', isOpen);
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
        needsValidation: (initial as any).needsValidation ?? !hasApiKey,
      });
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

  if (!isOpen || !mounted) return null;

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  };

  const panel: React.CSSProperties = {
    width: 'min(720px, 100%)',
    background: '#0b1220', color: 'white',
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: 20,
  };

  const header: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  };

  const grid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  };

  const label: React.CSSProperties = { fontSize: 12, opacity: 0.8, marginBottom: 6 };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)', color: 'white',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, outline: 'none',
  };

  const footer: React.CSSProperties = {
    display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16,
  };

  const badgeStyle: React.CSSProperties = {
    background: '#fef3c7',
    color: '#a16207',
    borderRadius: 8,
    padding: '2px 6px',
    fontSize: 10,
    marginLeft: 8,
  };

  const handleSave = () => {
    console.log('[LocationModal] submitting', { address: loc.address, useGeocode });
    onSave({ ...loc, needsValidation });
  };

  return createPortal(
    <div style={overlay} role="dialog" aria-modal>
      <div style={panel}>
        <div style={header}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ajouter Emplacement</h3>
          <button onClick={onCancel} aria-label="Fermer" style={{ background: 'transparent', color: 'white' }}>
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
              onChange={(e) => setLoc({ ...loc, address: e.target.value })}
              onBlur={handleAddressBlur}
              placeholder="Rechercher une adresse"
            />
          </div>
          <div>
            <div style={label}>Nom du site</div>
            <input style={input} value={loc.site}
              onChange={(e) => setLoc({ ...loc, site: e.target.value })}
              placeholder="Ex.: Usine A" />
          </div>
          <div>
            <div style={label}>Bâtiment</div>
            <input style={input} value={loc.building ?? ''}
              onChange={(e) => setLoc({ ...loc, building: e.target.value })}
              placeholder="Ex.: Bloc B" />
          </div>
          <div>
            <div style={label}>Étage</div>
            <input style={input} value={loc.floor ?? ''}
              onChange={(e) => setLoc({ ...loc, floor: e.target.value })}
              placeholder="Ex.: SS1" />
          </div>
          <div>
            <div style={label}>Salle</div>
            <input style={input} value={loc.room ?? ''}
              onChange={(e) => setLoc({ ...loc, room: e.target.value })}
              placeholder="Ex.: Atelier Électrique" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={label}>Zone spécifique</div>
            <input style={input} value={loc.specificArea ?? ''}
              onChange={(e) => setLoc({ ...loc, specificArea: e.target.value })}
              placeholder="Ex.: Cellule 6, section disjoncteurs" />
          </div>
        </div>

        {hasApiKey ? (
          <div ref={mapRef} style={{ width: '100%', height: 200, marginTop: 12, borderRadius: 10 }} />
        ) : (
          <div style={{ marginTop: 12, textAlign: 'center', color: 'white', opacity: 0.8 }}>
            Valider plus tard
          </div>
        )}

        <div style={footer}>
          <button onClick={onCancel}
            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', color: 'white',
                     border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
            Annuler
          </button>
          <button onClick={handleSave}
            style={{ padding: '10px 14px', background: '#22c55e', color: '#04111a',
                     border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontWeight: 700 }}>
            Ajouter
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
