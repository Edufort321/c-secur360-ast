'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { AST, ProjectInfo, Location } from '@/types/ast';
import AddLocationModal from '@/components/modals/AddLocationModal';

interface Step1Props {
  formData: Partial<AST>;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
  onDataChange: (section: string, data: any) => void;
}

const translations = {
  fr: {
    title: 'Informations Projet',
    projectDetails: 'Détails du projet',
    workType: 'Type de Travail',
    location: 'Localisation',
    openLocation: 'Ajouter / Modifier l’emplacement',
    estimatedDuration: 'Durée estimée',
    description: 'Description complète des travaux',
    saveHint: 'Sauvegarde automatique (brouillon)…',
  },
  en: {
    title: 'Project Information',
    projectDetails: 'Project Details',
    workType: 'Work Type',
    location: 'Location',
    openLocation: 'Add / Edit location',
    estimatedDuration: 'Estimated duration',
    description: 'Full job description',
    saveHint: 'Autosaving draft…',
  },
};

export default function Step1ProjectInfo({
  formData,
  language = 'fr',
  tenant,
  errors = {},
  onDataChange,
}: Step1Props) {
  const t = translations[language];

  // ------- ÉTAT LOCAL : ne se réinitialise pas pendant la frappe -------
  const initial = formData.projectInfo ?? {
    workType: '',
    location: { site: '', building: '', floor: '', room: '', specificArea: '' } as Location,
    estimatedDuration: '',
    equipmentRequired: [],
    environmentalConditions: {},
  };

  const [localData, setLocalData] = useState<ProjectInfo>(initial as ProjectInfo);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ------- DÉBOUNCE pour la sync parent (évite re-render agressif) -------
  const debounceRef = useRef<number | null>(null);
  const pushParent = useCallback((data: ProjectInfo) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => onDataChange('projectInfo', data), 400);
  }, [onDataChange]);

  // Si des données externes arrivent (chargement), synchroniser une fois
  useEffect(() => {
    if (formData.projectInfo) {
      setLocalData(prev => ({ ...prev, ...formData.projectInfo! }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectInfo]);

  // ------- Handlers -------
  const setField = useCallback(<K extends keyof ProjectInfo>(key: K, value: ProjectInfo[K]) => {
    setLocalData(prev => {
      const next = { ...prev, [key]: value };
      pushParent(next);
      return next;
    });
  }, [pushParent]);

  const handleLocationSave = (loc: Location) => {
    setField('location', loc);
    setShowLocationModal(false);
  };

  // ------- UI -------
  const card: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    background: 'rgba(10,20,35,0.8)',
  };
  const label: React.CSSProperties = { fontSize: 12, opacity: 0.8, marginBottom: 6, display: 'block' };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.06)', color: 'white',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, outline: 'none',
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Détails du projet */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <span style={label}>{t.workType}</span>
            <input
              style={input}
              value={localData.workType ?? ''}
              onChange={(e) => setField('workType', e.target.value)}
              placeholder="Ex.: Électrique - Manœuvre disjoncteur"
            />
          </div>
          <div>
            <span style={label}>{t.estimatedDuration}</span>
            <input
              style={input}
              value={localData.estimatedDuration ?? ''}
              onChange={(e) => setField('estimatedDuration', e.target.value)}
              placeholder="Ex.: 3h"
            />
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <MapPin size={16} />
            <strong>{t.location}</strong>
          </div>
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
            }}
          >
            {t.openLocation}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
          <ReadOnlyField label="Site" value={localData.location?.site ?? ''} />
          <ReadOnlyField label="Bâtiment" value={localData.location?.building ?? ''} />
          <ReadOnlyField label="Étage" value={localData.location?.floor ?? ''} />
          <ReadOnlyField label="Salle" value={localData.location?.room ?? ''} />
          <ReadOnlyField label="Zone" value={localData.location?.specificArea ?? ''} />
        </div>
      </div>

      {/* Description (optionnelle selon ta structure) */}
      <div style={card}>
        <span style={label}>{t.description}</span>
        <textarea
          style={{ ...input, minHeight: 120, resize: 'vertical' }}
          value={(formData as any)?.workDescription ?? ''}
          onChange={(e) => {
            // on propage via projectInfo (rétrocompatibilité simple)
            setLocalData(prev => {
              const next = { ...prev } as any;
              next.workDescription = e.target.value;
              pushParent(next);
              return next as ProjectInfo;
            });
          }}
          placeholder="Décris les travaux à effectuer…"
        />
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{t.saveHint}</div>
      </div>

      {/* MODAL PORTAL */}
      <AddLocationModal
        isOpen={showLocationModal}
        initial={localData.location ?? null}
        onCancel={() => setShowLocationModal(false)}
        onSave={handleLocationSave}
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const labelStyle: React.CSSProperties = { fontSize: 12, opacity: 0.6, marginBottom: 4, display: 'block' };
  const box: React.CSSProperties = {
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    minHeight: 40,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <div style={box}>{value || '—'}</div>
    </div>
  );
}
