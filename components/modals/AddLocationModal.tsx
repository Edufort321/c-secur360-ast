'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Location } from '../../app/types/ast';

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
  const [loc, setLoc] = useState<Location>({
    site: '',
    building: '',
    floor: '',
    room: '',
    specificArea: '',
  });

  useEffect(() => { setMounted(true); }, []);
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
      });
    }
  }, [initial]);

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

        <div style={footer}>
          <button onClick={onCancel}
            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', color: 'white',
                     border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10 }}>
            Annuler
          </button>
          <button onClick={() => onSave(loc)}
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
