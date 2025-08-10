'use client';

import React, { useState, useCallback } from 'react';
import { Building, Phone, MapPin, Calendar, User, Briefcase, Plus, Trash2, Camera } from 'lucide-react';
import { AST, ProjectInfo } from '@/types/ast';

// Interface pour Step1 adaptée à ton AST
interface Step1Props {
  formData: Partial<AST>;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
  onDataChange: (section: string, data: any) => void;
}

// Traductions pour Step1
const translations = {
  fr: {
    title: "Informations du Projet",
    subtitle: "Identification et détails du projet",
    workType: "Type de Travail",
    workTypeDetails: "Détails du Travail",
    complexity: "Complexité",
    frequency: "Fréquence",
    criticality: "Criticité",
    location: "Emplacement",
    site: "Site",
    building: "Bâtiment",
    floor: "Étage", 
    room: "Salle",
    specificArea: "Zone Spécifique",
    estimatedDuration: "Durée Estimée",
    actualDuration: "Durée Réelle",
    equipmentRequired: "Équipement Requis",
    environmentalConditions: "Conditions Environnementales",
    temperature: "Température",
    humidity: "Humidité",
    lighting: "Éclairage",
    noise: "Bruit",
    airQuality: "Qualité de l'Air",
    weather: "Météo",
    required: "Obligatoire",
    optional: "Optionnel",
    simple: "Simple",
    moderate: "Modéré", 
    complex: "Complexe",
    highly_complex: "Très Complexe",
    routine: "Routine",
    periodic: "Périodique",
    occasional: "Occasionnel",
    rare: "Rare",
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    critical: "Critique"
  },
  en: {
    title: "Project Information",
    subtitle: "Identification and project details",
    workType: "Work Type",
    workTypeDetails: "Work Details", 
    complexity: "Complexity",
    frequency: "Frequency",
    criticality: "Criticality",
    location: "Location",
    site: "Site",
    building: "Building",
    floor: "Floor",
    room: "Room", 
    specificArea: "Specific Area",
    estimatedDuration: "Estimated Duration",
    actualDuration: "Actual Duration",
    equipmentRequired: "Required Equipment",
    environmentalConditions: "Environmental Conditions",
    temperature: "Temperature",
    humidity: "Humidity",
    lighting: "Lighting",
    noise: "Noise",
    airQuality: "Air Quality",
    weather: "Weather",
    required: "Required",
    optional: "Optional",
    simple: "Simple",
    moderate: "Moderate",
    complex: "Complex", 
    highly_complex: "Highly Complex",
    routine: "Routine",
    periodic: "Periodic",
    occasional: "Occasional",
    rare: "Rare",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical"
  }
};

export default function Step1ProjectInfo({ 
  formData, 
  language = 'fr', 
  tenant, 
  errors = {}, 
  onDataChange 
}: Step1Props) {
  
  const t = translations[language];
  
  // État local adapté à ta structure ProjectInfo
  const [localData, setLocalData] = useState(() => {
    const projectInfo = formData.projectInfo || {};
    return {
      workType: projectInfo.workType || '',
      workTypeDetails: projectInfo.workTypeDetails || {
        category: '',
        subcategory: '',
        complexity: 'simple' as const,
        frequency: 'routine' as const,
        criticality: 'low' as const
      },
      location: projectInfo.location || {
        site: '',
        building: '',
        floor: '',
        room: '',
        specificArea: ''
      },
      estimatedDuration: projectInfo.estimatedDuration || '',
      actualDuration: projectInfo.actualDuration || '',
      equipmentRequired: projectInfo.equipmentRequired || [],
      environmentalConditions: projectInfo.environmentalConditions || {
        temperature: { min: 20, max: 25, units: 'celsius' as const },
        humidity: 50,
        lighting: { 
          type: 'artificial' as const, 
          adequacy: 'good' as const, 
          requiresSupplemental: false 
        },
        noise: { level: 0, requiresProtection: false },
        airQuality: { 
          quality: 'good' as const, 
          requiresVentilation: false, 
          requiresRespiratory: false 
        },
        weather: { 
          condition: 'clear' as const, 
          impactsWork: false 
        }
      }
    };
  });

  // Handler pour les champs simples
  const updateField = useCallback((section: string, field: string, value: any) => {
    setLocalData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      };
      
      // Sync avec le parent après un délai
      setTimeout(() => {
        onDataChange('projectInfo', newData);
      }, 0);
      
      return newData;
    });
  }, [onDataChange]);

  // Handler pour les champs de premier niveau
  const updateTopLevelField = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev, [field]: value };
      
      setTimeout(() => {
        onDataChange('projectInfo', newData);
      }, 0);
      
      return newData;
    });
  }, [onDataChange]);

  // Styles communs
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: '6px'
  };

  const fieldStyle = {
    marginBottom: '20px'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#ffffff',
          marginBottom: '8px'
        }}>
          {t.title}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Type de Travail */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Briefcase size={20} color="#3b82f6" />
          {t.workType}
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              {t.workType} <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="text"
              value={localData.workType}
              onChange={(e) => updateTopLevelField('workType', e.target.value)}
              placeholder={t.workType}
              style={{
                ...inputStyle,
                borderColor: errors.workType ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.complexity}</label>
            <select
              value={localData.workTypeDetails.complexity}
              onChange={(e) => updateField('workTypeDetails', 'complexity', e.target.value)}
              style={selectStyle}
            >
              <option value="simple">{t.simple}</option>
              <option value="moderate">{t.moderate}</option>
              <option value="complex">{t.complex}</option>
              <option value="highly_complex">{t.highly_complex}</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.frequency}</label>
            <select
              value={localData.workTypeDetails.frequency}
              onChange={(e) => updateField('workTypeDetails', 'frequency', e.target.value)}
              style={selectStyle}
            >
              <option value="routine">{t.routine}</option>
              <option value="periodic">{t.periodic}</option>
              <option value="occasional">{t.occasional}</option>
              <option value="rare">{t.rare}</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.criticality}</label>
            <select
              value={localData.workTypeDetails.criticality}
              onChange={(e) => updateField('workTypeDetails', 'criticality', e.target.value)}
              style={selectStyle}
            >
              <option value="low">{t.low}</option>
              <option value="medium">{t.medium}</option>
              <option value="high">{t.high}</option>
              <option value="critical">{t.critical}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emplacement */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={20} color="#10b981" />
          {t.location}
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              {t.site} <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="text"
              value={localData.location.site}
              onChange={(e) => updateField('location', 'site', e.target.value)}
              placeholder={t.site}
              style={{
                ...inputStyle,
                borderColor: errors.site ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.building}</label>
            <input
              type="text"
              value={localData.location.building || ''}
              onChange={(e) => updateField('location', 'building', e.target.value)}
              placeholder={t.building}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.floor}</label>
            <input
              type="text"
              value={localData.location.floor || ''}
              onChange={(e) => updateField('location', 'floor', e.target.value)}
              placeholder={t.floor}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.room}</label>
            <input
              type="text"
              value={localData.location.room || ''}
              onChange={(e) => updateField('location', 'room', e.target.value)}
              placeholder={t.room}
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.specificArea}</label>
            <input
              type="text"
              value={localData.location.specificArea || ''}
              onChange={(e) => updateField('location', 'specificArea', e.target.value)}
              placeholder={t.specificArea}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Durée */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Calendar size={20} color="#f59e0b" />
          Durée du Travail
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              {t.estimatedDuration} <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="text"
              value={localData.estimatedDuration}
              onChange={(e) => updateTopLevelField('estimatedDuration', e.target.value)}
              placeholder="Ex: 4 heures, 2 jours"
              style={{
                ...inputStyle,
                borderColor: errors.estimatedDuration ? '#ef4444' : 'rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.actualDuration}</label>
            <input
              type="text"
              value={localData.actualDuration || ''}
              onChange={(e) => updateTopLevelField('actualDuration', e.target.value)}
              placeholder="Ex: 3.5 heures"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Conditions Environnementales */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Camera size={20} color="#8b5cf6" />
          {t.environmentalConditions}
        </h3>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>{t.temperature} (°C)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={localData.environmentalConditions.temperature?.min || 20}
                onChange={(e) => updateField('environmentalConditions', 'temperature', {
                  ...localData.environmentalConditions.temperature,
                  min: parseInt(e.target.value)
                })}
                placeholder="Min"
                style={{ ...inputStyle, width: '50%' }}
              />
              <input
                type="number"
                value={localData.environmentalConditions.temperature?.max || 25}
                onChange={(e) => updateField('environmentalConditions', 'temperature', {
                  ...localData.environmentalConditions.temperature,
                  max: parseInt(e.target.value)
                })}
                placeholder="Max"
                style={{ ...inputStyle, width: '50%' }}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.humidity} (%)</label>
            <input
              type="number"
              value={localData.environmentalConditions.humidity || 50}
              onChange={(e) => updateField('environmentalConditions', 'humidity', parseInt(e.target.value))}
              placeholder="50"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.lighting}</label>
            <select
              value={localData.environmentalConditions.lighting?.adequacy || 'good'}
              onChange={(e) => updateField('environmentalConditions', 'lighting', {
                ...localData.environmentalConditions.lighting,
                adequacy: e.target.value
              })}
              style={selectStyle}
            >
              <option value="excellent">Excellent</option>
              <option value="good">Bon</option>
              <option value="adequate">Adéquat</option>
              <option value="poor">Pauvre</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>{t.airQuality}</label>
            <select
              value={localData.environmentalConditions.airQuality?.quality || 'good'}
              onChange={(e) => updateField('environmentalConditions', 'airQuality', {
                ...localData.environmentalConditions.airQuality,
                quality: e.target.value
              })}
              style={selectStyle}
            >
              <option value="excellent">Excellente</option>
              <option value="good">Bonne</option>
              <option value="moderate">Modérée</option>
              <option value="poor">Pauvre</option>
              <option value="hazardous">Dangereuse</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}cements Additionnels */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={20} color="#10b981" />
            {t.locations}
          </h3>
          
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} />
            {t.addLocation}
          </button>
        </div>

        {localData.locations.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {localData.locations.map((location) => (
              <div
                key={location.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    margin: '0 0 4px 0'
                  }}>
                    {location.name}
                  </h4>
                  {location.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      margin: 0
                    }}>
                      {location.description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => removeLocation(location.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '6px',
                    padding: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajouter Emplacement */}
      {showLocationModal && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2147483647,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="modal-content"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(148, 163, 184, 0.3)'
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              {t.addLocation}
            </h3>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nom de l'emplacement</label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom de l'emplacement"
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Description (optionnel)</label>
              <textarea
                value={newLocation.description}
                onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'emplacement"
                rows={3}
                style={{...inputStyle, resize: 'vertical'}}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowLocationModal(false)}
                style={{
                  background: 'rgba(100, 116, 139, 0.3)',
                  border: '1px solid rgba(100, 116, 139, 0.5)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              
              <button
                onClick={addLocation}
                disabled={!newLocation.name.trim()}
                style={{
                  background: newLocation.name.trim() 
                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                    : 'rgba(100, 116, 139, 0.3)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newLocation.name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
