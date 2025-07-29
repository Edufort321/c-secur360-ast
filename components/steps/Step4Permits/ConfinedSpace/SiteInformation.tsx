'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home,
  Ruler, Thermometer, Activity, Shield, Volume2, Gauge, Info, Search,
  Heart, RotateCcw, Layers, Square, Circle, Triangle, Zap
} from 'lucide-react';

// =================== INTERFACES TYPESCRIPT ===================
interface SiteInformationProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
}

interface ConfinedSpaceDetails {
  // Identification
  spaceType: string;
  spaceCategory: string;
  spaceClassification: string;
  entryMethod: string;
  accessType: string;
  
  // Dimensions
  dimensions: {
    length: number;
    width: number;
    height: number;
    diameter?: number;
    volume: number;
  };

  // =================== RENDU DU COMPOSANT ===================
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .glass-header {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .confined-space-card {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(59, 130, 246, 0.05));
          border: 2px solid rgba(34, 197, 94, 0.2);
        }
        
        .hazard-card {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(245, 101, 101, 0.05));
          border: 2px solid rgba(239, 68, 68, 0.2);
        }
        
        .safety-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
          border: 2px solid rgba(16, 185, 129, 0.2);
        }
        
        .input-field {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        
        .input-field.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          transition: all 0.3s ease;
          transform: translateY(0);
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
          transform: translateY(-1px);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transition: all 0.3s ease;
        }
        
        .btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }
        
        .grid-responsive {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        
        .grid-2 {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .grid-3 {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        
        .grid-4 {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        
        .hazard-selector {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        
        .hazard-item {
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .hazard-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .hazard-item.selected {
          border-color: #ef4444;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 101, 101, 0.1));
        }
        
        .volume-calculator {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border: 2px solid rgba(16, 185, 129, 0.2);
        }
        
        .entry-point-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(124, 58, 237, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr;
          }
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          .grid-4 {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .photo-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        
        .photo-item {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .photo-item:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* =================== EN-TÊTE PRINCIPAL =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t.siteInformationTitle}
            </h1>
            <p className="text-gray-600">{t.siteInformationSubtitle}</p>
          </div>

      {/* =================== DIMENSIONS ET VOLUME =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Ruler className="w-7 h-7 text-blue-600" />
            {t.spaceDimensions}
          </h2>
        </div>
        
        <div className="volume-calculator rounded-xl p-6">
          <div className="grid-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.length}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={confinedSpaceDetails.dimensions.length || ''}
                onChange={(e) => handleConfinedSpaceChange('dimensions', {
                  ...confinedSpaceDetails.dimensions,
                  length: parseFloat(e.target.value) || 0
                })}
                className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.width}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={confinedSpaceDetails.dimensions.width || ''}
                onChange={(e) => handleConfinedSpaceChange('dimensions', {
                  ...confinedSpaceDetails.dimensions,
                  width: parseFloat(e.target.value) || 0
                })}
                className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.height}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={confinedSpaceDetails.dimensions.height || ''}
                onChange={(e) => handleConfinedSpaceChange('dimensions', {
                  ...confinedSpaceDetails.dimensions,
                  height: parseFloat(e.target.value) || 0
                })}
                className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
              />
            </div>

            {(confinedSpaceDetails.spaceType === 'tank' || confinedSpaceDetails.spaceType === 'vessel' || confinedSpaceDetails.spaceType === 'silo') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.diameter}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={confinedSpaceDetails.dimensions.diameter || ''}
                  onChange={(e) => handleConfinedSpaceChange('dimensions', {
                    ...confinedSpaceDetails.dimensions,
                    diameter: parseFloat(e.target.value) || 0
                  })}
                  className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={calculateVolume}
              className="btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <Gauge className="w-4 h-4" />
              {t.calculateVolume}
            </button>
            
            {confinedSpaceDetails.dimensions.volume > 0 && (
              <div className="bg-white/80 px-4 py-2 rounded-lg border border-green-300">
                <span className="text-sm font-medium text-gray-700">
                  {t.volume}: <span className="font-bold text-green-600">
                    {confinedSpaceDetails.dimensions.volume} {t.volumeUnit}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================== POINTS D'ENTRÉE ET ACCÈS =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Layers className="w-7 h-7 text-purple-600" />
            {t.entryPoints}
          </h2>
        </div>

        <div className="space-y-4">
          {confinedSpaceDetails.entryPoints.map((entryPoint, index) => (
            <div key={entryPoint.id} className="entry-point-card rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                {t.entryPoint}{index + 1}
              </h4>
              
              <div className="grid-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.entryType}
                  </label>
                  <select
                    value={entryPoint.type}
                    onChange={(e) => {
                      const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                      updatedEntryPoints[index] = { ...entryPoint, type: e.target.value };
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                  >
                    <option value="circular">Circulaire</option>
                    <option value="rectangular">Rectangulaire</option>
                    <option value="square">Carré</option>
                    <option value="oval">Ovale</option>
                    <option value="irregular">Irrégulière</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.entryDimensions}
                  </label>
                  <input
                    type="text"
                    value={entryPoint.dimensions}
                    onChange={(e) => {
                      const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                      updatedEntryPoints[index] = { ...entryPoint, dimensions: e.target.value };
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                    placeholder="Ex: 60cm x 80cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.entryLocation}
                  </label>
                  <input
                    type="text"
                    value={entryPoint.location}
                    onChange={(e) => {
                      const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                      updatedEntryPoints[index] = { ...entryPoint, location: e.target.value };
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                    placeholder="Ex: Sommet ouest"
                  />
                </div>
              </div>

              <div className="grid-2 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.entryCondition}
                  </label>
                  <select
                    value={entryPoint.condition}
                    onChange={(e) => {
                      const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                      updatedEntryPoints[index] = { ...entryPoint, condition: e.target.value };
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                  >
                    <option value="good">Bon état</option>
                    <option value="rust">Rouille présente</option>
                    <option value="damage">Endommagé</option>
                    <option value="stuck">Coincé/Bloqué</option>
                    <option value="missing_parts">Pièces manquantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.entryAccessibility}
                  </label>
                  <select
                    value={entryPoint.accessibility}
                    onChange={(e) => {
                      const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                      updatedEntryPoints[index] = { ...entryPoint, accessibility: e.target.value };
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                  >
                    <option value="normal">Accès normal</option>
                    <option value="difficult">Accès difficile</option>
                    <option value="ladder_required">Échelle requise</option>
                    <option value="crane_required">Grue requise</option>
                    <option value="confined">Accès confiné</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handlePhotoCapture('entry_point')}
                  className="btn-secondary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {t.entryPhotos} ({entryPoint.photos.length})
                </button>

                <button
                  onClick={() => {
                    const updatedEntryPoints = confinedSpaceDetails.entryPoints.filter(ep => ep.id !== entryPoint.id);
                    handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                  }}
                  className="btn-danger px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.remove}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addEntryPoint}
            className="w-full border-2 border-dashed border-purple-300 rounded-xl p-6 text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t.addEntryPoint}
          </button>
        </div>
      </div>

      {/* =================== ÉVALUATION DES DANGERS =================== */}
      <div className="hazard-card glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl bg-gradient-to-r from-red-50 to-orange-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            {t.hazardAssessment}
          </h2>
          <p className="text-sm text-gray-600 mt-2">{t.selectHazards}</p>
        </div>

        <div className="grid-2 gap-8">
          {/* Dangers atmosphériques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-600" />
              {t.atmosphericHazards}
            </h3>
            <div className="hazard-selector">
              {Object.entries(t.atmosphericHazardTypes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    const current = confinedSpaceDetails.atmosphericHazards;
                    const updated = current.includes(key)
                      ? current.filter(h => h !== key)
                      : [...current, key];
                    handleConfinedSpaceChange('atmosphericHazards', updated);
                  }}
                  className={`hazard-item p-3 rounded-lg text-sm text-left border-2 ${
                    confinedSpaceDetails.atmosphericHazards.includes(key)
                      ? 'selected border-red-500 bg-red-50'
                      : 'bg-white/50 border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="font-medium">{value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dangers physiques */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              {t.physicalHazards}
            </h3>
            <div className="hazard-selector">
              {Object.entries(t.physicalHazardTypes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    const current = confinedSpaceDetails.physicalHazards;
                    const updated = current.includes(key)
                      ? current.filter(h => h !== key)
                      : [...current, key];
                    handleConfinedSpaceChange('physicalHazards', updated);
                  }}
                  className={`hazard-item p-3 rounded-lg text-sm text-left border-2 ${
                    confinedSpaceDetails.physicalHazards.includes(key)
                      ? 'selected border-red-500 bg-red-50'
                      : 'bg-white/50 border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="font-medium">{value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================== CONDITIONS ENVIRONNEMENTALES =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Thermometer className="w-7 h-7 text-green-600" />
            {t.environmentalConditions}
          </h2>
        </div>

        <div className="grid-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.ventilationRequired}
            </label>
            <div className="flex gap-4">
              {[
                { value: true, label: t.yes },
                { value: false, label: t.no }
              ].map((option) => (
                <button
                  key={option.value.toString()}
                  onClick={() => handleEnvironmentalChange('ventilationRequired', option.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    confinedSpaceDetails.environmentalConditions.ventilationRequired === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white/50 hover:border-green-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.ventilationType}
            </label>
            <select
              value={confinedSpaceDetails.environmentalConditions.ventilationType}
              onChange={(e) => handleEnvironmentalChange('ventilationType', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
            >
              <option value="">{t.select}</option>
              <option value="natural">Ventilation naturelle</option>
              <option value="forced_air">Air forcé</option>
              <option value="exhaust">Extraction</option>
              <option value="combination">Combinaison</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.lightingConditions}
            </label>
            <select
              value={confinedSpaceDetails.environmentalConditions.lightingConditions}
              onChange={(e) => handleEnvironmentalChange('lightingConditions', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
            >
              <option value="">{t.select}</option>
              <option value="adequate">Éclairage adéquat</option>
              <option value="poor">Éclairage faible</option>
              <option value="none">Aucun éclairage</option>
              <option value="artificial_required">Éclairage artificiel requis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.temperatureRange}
            </label>
            <input
              type="text"
              value={confinedSpaceDetails.environmentalConditions.temperatureRange}
              onChange={(e) => handleEnvironmentalChange('temperatureRange', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              placeholder="Ex: 15-25°C"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.moistureLevel}
            </label>
            <select
              value={confinedSpaceDetails.environmentalConditions.moistureLevel}
              onChange={(e) => handleEnvironmentalChange('moistureLevel', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
            >
              <option value="">{t.select}</option>
              <option value="dry">Sec</option>
              <option value="normal">Normal</option>
              <option value="humid">Humide</option>
              <option value="wet">Mouillé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.noiseLevel}
            </label>
            <select
              value={confinedSpaceDetails.environmentalConditions.noiseLevel}
              onChange={(e) => handleEnvironmentalChange('noiseLevel', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
            >
              <option value="">{t.select}</option>
              <option value="low">Faible (&lt;80 dB)</option>
              <option value="moderate">Modéré (80-90 dB)</option>
              <option value="high">Élevé (&gt;90 dB)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.weatherConditions}
          </label>
          <textarea
            value={confinedSpaceDetails.environmentalConditions.weatherConditions}
            onChange={(e) => handleEnvironmentalChange('weatherConditions', e.target.value)}
            className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-20 resize-none"
            placeholder="Conditions météorologiques actuelles et prévues"
          />
        </div>
      </div>

      {/* =================== CONTENU ET HISTORIQUE =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            {t.spaceContent}
          </h2>
        </div>

        <div className="grid-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.contents}
            </label>
            <textarea
              value={confinedSpaceDetails.spaceContent.contents}
              onChange={(e) => handleContentChange('contents', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-24 resize-none"
              placeholder="Description du contenu actuel de l'espace"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.residues}
            </label>
            <textarea
              value={confinedSpaceDetails.spaceContent.residues}
              onChange={(e) => handleContentChange('residues', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-24 resize-none"
              placeholder="Résidus, substances chimiques, dépôts..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.previousUse}
            </label>
            <textarea
              value={confinedSpaceDetails.spaceContent.previousUse}
              onChange={(e) => handleContentChange('previousUse', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-20 resize-none"
              placeholder="Usage antérieur de l'espace"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.lastEntry}
            </label>
            <input
              type="text"
              value={confinedSpaceDetails.spaceContent.lastEntry}
              onChange={(e) => handleContentChange('lastEntry', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              placeholder="Date et détails de la dernière entrée"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.cleaningStatus}
          </label>
          <select
            value={confinedSpaceDetails.spaceContent.cleaningStatus}
            onChange={(e) => handleContentChange('cleaningStatus', e.target.value)}
            className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
          >
            <option value="">{t.select}</option>
            <option value="clean">Nettoyé et inspecté</option>
            <option value="partial">Partiellement nettoyé</option>
            <option value="not_cleaned">Non nettoyé</option>
            <option value="cleaning_required">Nettoyage requis</option>
          </select>
        </div>
      </div>

      {/* =================== MESURES DE SÉCURITÉ =================== */}
      <div className="safety-card glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-7 h-7 text-green-600" />
            {t.safetyMeasures}
          </h2>
        </div>

        <div className="grid-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.emergencyEgress}
            </label>
            <textarea
              value={confinedSpaceDetails.safetyMeasures.emergencyEgress}
              onChange={(e) => handleSafetyChange('emergencyEgress', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-20 resize-none"
              placeholder="Plan de sortie d'urgence et procédures d'évacuation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.communicationMethod}
            </label>
            <select
              value={confinedSpaceDetails.safetyMeasures.communicationMethod}
              onChange={(e) => handleSafetyChange('communicationMethod', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
            >
              <option value="">{t.select}</option>
              <option value="radio">Radio bidirectionnelle</option>
              <option value="phone">Téléphone</option>
              <option value="visual">Signaux visuels</option>
              <option value="rope">Signaux par corde</option>
              <option value="combination">Combinaison de méthodes</option>
            </select>
          </div>
        </div>

        <div className="grid-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.monitoringEquipment}
            </label>
            <div className="space-y-2">
              {[
                'Détecteur d\'oxygène',
                'Détecteur de gaz combustibles',
                'Détecteur de H2S',
                'Détecteur de CO',
                'Détecteur multigaz',
                'Moniteur atmosphérique continu'
              ].map((equipment) => (
                <label key={equipment} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confinedSpaceDetails.safetyMeasures.monitoringEquipment.includes(equipment)}
                    onChange={(e) => {
                      const current = confinedSpaceDetails.safetyMeasures.monitoringEquipment;
                      const updated = e.target.checked
                        ? [...current, equipment]
                        : current.filter(item => item !== equipment);
                      handleSafetyChange('monitoringEquipment', updated);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{equipment}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.ventilationEquipment}
            </label>
            <div className="space-y-2">
              {[
                'Ventilateur d\'extraction',
                'Ventilateur de soufflage',
                'Conduits flexibles',
                'Filtres à air',
                'Système de ventilation portable'
              ].map((equipment) => (
                <label key={equipment} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confinedSpaceDetails.safetyMeasures.ventilationEquipment.includes(equipment)}
                    onChange={(e) => {
                      const current = confinedSpaceDetails.safetyMeasures.ventilationEquipment;
                      const updated = e.target.checked
                        ? [...current, equipment]
                        : current.filter(item => item !== equipment);
                      handleSafetyChange('ventilationEquipment', updated);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{equipment}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.emergencyEquipment}
            </label>
            <div className="space-y-2">
              {[
                'Trousse de premiers soins',
                'Équipement de sauvetage',
                'Harnais et cordes',
                'Équipement de communication',
                'Éclairage d\'urgence',
                'Équipement de protection respiratoire'
              ].map((equipment) => (
                <label key={equipment} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confinedSpaceDetails.safetyMeasures.emergencyEquipment.includes(equipment)}
                    onChange={(e) => {
                      const current = confinedSpaceDetails.safetyMeasures.emergencyEquipment;
                      const updated = e.target.checked
                        ? [...current, equipment]
                        : current.filter(item => item !== equipment);
                      handleSafetyChange('emergencyEquipment', updated);
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{equipment}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================== DOCUMENTATION PHOTOGRAPHIQUE =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Camera className="w-7 h-7 text-indigo-600" />
            {t.photoDocumentation}
          </h2>
        </div>

        <div className="grid-4">
          {[
            { key: 'space_exterior', label: t.spaceExterior, icon: Home },
            { key: 'space_interior', label: t.spaceInterior, icon: Eye },
            { key: 'entry_point', label: t.entryPointPhoto, icon: Layers },
            { key: 'hazard_identification', label: t.hazardIdentification, icon: AlertTriangle },
            { key: 'equipment_staging', label: t.equipmentStaging, icon: Settings },
            { key: 'atmospheric_testing', label: t.atmosphericTesting, icon: Activity },
            { key: 'safety_equipment', label: t.safetyEquipment, icon: Shield },
            { key: 'ventilation_system', label: t.ventilationSystem, icon: Wind }
          ].map(({ key, label, icon: IconComponent }) => {
            const categoryPhotos = spacePhotos.filter(photo => photo.category === key);
            return (
              <button
                key={key}
                onClick={() => handlePhotoCapture(key)}
                className="p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 text-center"
              >
                <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-medium text-gray-800">{label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {categoryPhotos.length} photo{categoryPhotos.length !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>

        {/* Affichage des photos récentes */}
        {spacePhotos.length > 0 && (
          <div className="mt-6 p-4 bg-white/50 rounded-xl">
            <h4 className="font-medium text-gray-800 mb-3">
              Photos Récentes ({spacePhotos.length})
            </h4>
            <div className="photo-grid">
              {spacePhotos.slice(-12).map((photo) => (
                <div
                  key={photo.id}
                  className="photo-item"
                  onClick={() => {
                    setCurrentPhotoIndex(spacePhotos.findIndex(p => p.id === photo.id));
                    setShowPhotos(true);
                  }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      backgroundImage: `url(${photo.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =================== CARROUSEL PHOTOS =================== */}
      {showPhotos && spacePhotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPhotos(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative">
              <img
                src={spacePhotos[currentPhotoIndex]?.url}
                alt={spacePhotos[currentPhotoIndex]?.caption}
                className="max-w-full max-h-[80vh] rounded-lg"
              />

              {spacePhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex(prev => 
                      prev === 0 ? spacePhotos.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setCurrentPhotoIndex(prev => 
                      prev === spacePhotos.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-white text-center">
              <h3 className="text-lg font-medium">{spacePhotos[currentPhotoIndex]?.caption}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {spacePhotos[currentPhotoIndex]?.timestamp} • {spacePhotos[currentPhotoIndex]?.location}
              </p>
              {spacePhotos[currentPhotoIndex]?.measurements && (
                <p className="text-sm text-gray-300 mt-1">
                  📏 {spacePhotos[currentPhotoIndex]?.measurements}
                </p>
              )}
            </div>

            {spacePhotos.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {spacePhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== BOUTON DE SAUVEGARDE =================== */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => onDataChange('save', confinedSpaceDetails)}
          className="btn-primary px-8 py-4 rounded-xl text-white font-bold text-lg flex items-center gap-3 shadow-lg"
        >
          <Check className="w-6 h-6" />
          {t.save} - Informations du Site
        </button>
      </div>
    </div>
  );
};

export default SiteInformation;
        </div>
      </div>

      {/* =================== INFORMATIONS DU PROJET =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Building className="w-7 h-7 text-blue-600" />
            {t.projectInfo}
          </h2>
        </div>

        <div className="grid-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.projectNumber}
              </label>
              <input
                type="text"
                value={formData.projectNumber || ''}
                onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder="Ex: CS-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.workLocation}
              </label>
              <textarea
                value={formData.workLocation || ''}
                onChange={(e) => handleInputChange('workLocation', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-20 resize-none"
                placeholder="Adresse complète du site de travail"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.contractor}
              </label>
              <input
                type="text"
                value={formData.contractor || ''}
                onChange={(e) => handleInputChange('contractor', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder="Nom de l'entrepreneur"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.supervisor}
              </label>
              <input
                type="text"
                value={formData.supervisor || ''}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder="Nom du superviseur"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t.entryDate}
                </label>
                <input
                  type="date"
                  value={formData.entryDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  className="input-field w-full px-3 py-3 rounded-lg bg-white/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t.duration}
                </label>
                <input
                  type="text"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="input-field w-full px-3 py-3 rounded-lg bg-white/50 text-sm"
                  placeholder="Ex: 4 heures"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                {t.workerCount}
              </label>
              <input
                type="number"
                min="1"
                value={formData.workerCount || ''}
                onChange={(e) => handleInputChange('workerCount', parseInt(e.target.value) || 0)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder="Nombre de personnes"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.workDescription}
          </label>
          <textarea
            value={formData.workDescription || ''}
            onChange={(e) => handleInputChange('workDescription', e.target.value)}
            className="input-field w-full px-4 py-4 rounded-lg bg-white/50 h-32 resize-none"
            placeholder="Description détaillée des travaux à effectuer dans l'espace clos"
          />
        </div>
      </div>

      {/* =================== IDENTIFICATION DE L'ESPACE CLOS =================== */}
      <div className="confined-space-card glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Home className="w-7 h-7 text-green-600" />
            {t.spaceIdentification}
          </h2>
        </div>

        <div className="grid-2 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t.spaceType}
            </label>
            <div className="grid-responsive">
              {Object.entries(t.spaceTypes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleConfinedSpaceChange('spaceType', key)}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                    confinedSpaceDetails.spaceType === key
                      ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-green-300'
                  }`}
                >
                  <div className="text-sm font-medium">{value}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.spaceClassification}
              </label>
              <select
                value={confinedSpaceDetails.spaceClassification}
                onChange={(e) => handleConfinedSpaceChange('spaceClassification', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              >
                <option value="">{t.select}</option>
                {Object.entries(t.spaceClassifications).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.entryMethod}
              </label>
              <select
                value={confinedSpaceDetails.entryMethod}
                onChange={(e) => handleConfinedSpaceChange('entryMethod', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              >
                <option value="">{t.select}</option>
                <option value="top">Par le haut</option>
                <option value="side">Par le côté</option>
                <option value="bottom">Par le bas</option>
                <option value="multiple">Entrées multiples</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.accessType}
              </label>
              <select
                value={confinedSpaceDetails.accessType}
                onChange={(e) => handleConfinedSpaceChange('accessType', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              >
                <option value="">{t.select}</option>
                <option value="manhole">Trou d'homme</option>
                <option value="hatch">Trappe</option>
                <option value="door">Porte</option>
                <option value="removable_cover">Couvercle amovible</option>
                <option value="cut_opening">Ouverture découpée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.spaceLocation}
              </label>
              <input
                type="text"
                value={formData.spaceLocation || ''}
                onChange={(e) => handleInputChange('spaceLocation', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder="Localisation précise de l'espace"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.spaceDescription}
          </label>
          <textarea
            value={formData.spaceDescription || ''}
            onChange={(e) => handleInputChange('spaceDescription', e.target.value)}
            className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-24 resize-none"
            placeholder="Description détaillée de l'espace clos, sa fonction, son état..."
          />
        </div>
      </div>

// =================== COMPOSANT PRINCIPAL ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== ÉTATS DU COMPOSANT ===================
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotos, setShowPhotos] = useState(false);
  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>(formData.spacePhotos || []);
  const [confinedSpaceDetails, setConfinedSpaceDetails] = useState<ConfinedSpaceDetails>(
    formData.confinedSpaceDetails || {
      // Identification
      spaceType: '',
      spaceCategory: '',
      spaceClassification: '',
      entryMethod: '',
      accessType: '',
      
      // Dimensions
      dimensions: { length: 0, width: 0, height: 0, diameter: 0, volume: 0 },
      
      // Points d'entrée
      entryPoints: [],
      
      // Dangers
      atmosphericHazards: [],
      physicalHazards: [],
      
      // Conditions environnementales
      environmentalConditions: {
        ventilationRequired: false,
        ventilationType: '',
        lightingConditions: '',
        temperatureRange: '',
        moistureLevel: '',
        noiseLevel: '',
        weatherConditions: ''
      },
      
      // Contenu
      spaceContent: {
        contents: '',
        residues: '',
        previousUse: '',
        lastEntry: '',
        cleaningStatus: ''
      },
      
      // Mesures de sécurité
      safetyMeasures: {
        emergencyEgress: '',
        communicationMethod: '',
        monitoringEquipment: [],
        ventilationEquipment: [],
        emergencyEquipment: []
      },
      
      // Documentation
      photos: [],
      inspectionReports: [],
      testResults: []
    }
  );

  // =================== FONCTIONS UTILITAIRES ===================
  
  // Calculer le volume selon la géométrie
  const calculateVolume = () => {
    const { length, width, height, diameter } = confinedSpaceDetails.dimensions;
    let volume = 0;
    
    if ((confinedSpaceDetails.spaceType === 'tank' || confinedSpaceDetails.spaceType === 'vessel' || confinedSpaceDetails.spaceType === 'silo') && diameter && diameter > 0 && height > 0) {
      // Volume cylindrique: π × r² × h
      const radius = diameter / 2;
      volume = Math.PI * radius * radius * height;
    } else if (length > 0 && width > 0 && height > 0) {
      // Volume rectangulaire: l × w × h
      volume = length * width * height;
    }
    
    setConfinedSpaceDetails(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, volume: Math.round(volume * 100) / 100 }
    }));
  };

  // Ajouter un point d'entrée
  const addEntryPoint = () => {
    const newEntryPoint = {
      id: `entry_${Date.now()}`,
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    };
    
    const updatedDetails = {
      ...confinedSpaceDetails,
      entryPoints: [...confinedSpaceDetails.entryPoints, newEntryPoint]
    };
    
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  // Gestion des photos
  const handlePhotoCapture = (category: string) => {
    const newPhoto: SpacePhoto = {
      id: `photo_${Date.now()}`,
      url: `https://via.placeholder.com/400x300?text=Photo+${Date.now()}`,
      caption: `Photo ${category} - ${new Date().toLocaleString()}`,
      category: category as any,
      timestamp: new Date().toISOString(),
      location: 'GPS: 45.5017, -73.5673',
      measurements: category.includes('space') ? 'L:2.5m W:1.8m H:2.1m' : undefined
    };

    const updatedPhotos = [...spacePhotos, newPhoto];
    setSpacePhotos(updatedPhotos);
    onDataChange('spacePhotos', updatedPhotos);
  };

  // Gestion des modifications de données
  const handleInputChange = (field: string, value: any) => {
    onDataChange(field, value);
  };

  const handleConfinedSpaceChange = (field: string, value: any) => {
    const updatedDetails = { ...confinedSpaceDetails, [field]: value };
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  const handleEnvironmentalChange = (field: string, value: any) => {
    const updatedDetails = {
      ...confinedSpaceDetails,
      environmentalConditions: { ...confinedSpaceDetails.environmentalConditions, [field]: value }
    };
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  const handleContentChange = (field: string, value: any) => {
    const updatedDetails = {
      ...confinedSpaceDetails,
      spaceContent: { ...confinedSpaceDetails.spaceContent, [field]: value }
    };
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  const handleSafetyChange = (field: string, value: any) => {
    const updatedDetails = {
      ...confinedSpaceDetails,
      safetyMeasures: { ...confinedSpaceDetails.safetyMeasures, [field]: value }
    };
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };
  
  // Points d'entrée
  entryPoints: Array<{
    id: string;
    type: string;
    dimensions: string;
    location: string;
    condition: string;
    accessibility: string;
    photos: string[];
  }>;
  
  // Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];
  
  // Conditions environnementales
  environmentalConditions: {
    ventilationRequired: boolean;
    ventilationType: string;
    lightingConditions: string;
    temperatureRange: string;
    moistureLevel: string;
    noiseLevel: string;
    weatherConditions: string;
  };
  
  // Contenu et historique
  spaceContent: {
    contents: string;
    residues: string;
    previousUse: string;
    lastEntry: string;
    cleaningStatus: string;
  };
  
  // Mesures de sécurité
  safetyMeasures: {
    emergencyEgress: string;
    communicationMethod: string;
    monitoringEquipment: string[];
    ventilationEquipment: string[];
    emergencyEquipment: string[];
  };
  
  // Documentation
  photos: string[];
  inspectionReports: string[];
  testResults: string[];
}

interface SpacePhoto {
  id: string;
  url: string;
  caption: string;
  category: 'space_exterior' | 'space_interior' | 'entry_point' | 'hazard_identification' | 'equipment_staging' | 'atmospheric_testing' | 'safety_equipment' | 'ventilation_system';
  timestamp: string;
  location?: string;
  measurements?: string;
}

// =================== SYSTÈME DE TRADUCTIONS COMPLET ===================
const translations = {
  fr: {
    // Titre principal
    siteInformationTitle: "📋 Informations du Site - Permis d'Espace Clos",
    siteInformationSubtitle: "Documentation complète pour l'entrée sécuritaire en espace clos",
    
    // Sections principales
    projectInfo: "🏢 Informations du Projet",
    spaceIdentification: "🏠 Identification de l'Espace Clos",
    spaceDimensions: "📏 Dimensions et Volume",
    entryPoints: "🚪 Points d'Entrée et Accès",
    hazardAssessment: "⚠️ Évaluation des Dangers",
    environmentalConditions: "🌡️ Conditions Environnementales",
    spaceContent: "📦 Contenu et Historique",
    safetyMeasures: "🛡️ Mesures de Sécurité",
    photoDocumentation: "📸 Documentation Photographique",
    
    // Informations projet
    projectNumber: "Numéro de Projet",
    workLocation: "Lieu des Travaux",
    workDescription: "Description des Travaux",
    contractor: "Entrepreneur",
    supervisor: "Superviseur",
    entryDate: "Date d'Entrée Prévue",
    duration: "Durée Estimée",
    workerCount: "Nombre de Travailleurs",
    
    // Identification de l'espace
    spaceType: "Type d'Espace Clos",
    spaceCategory: "Catégorie",
    spaceClassification: "Classification CSA",
    entryMethod: "Méthode d'Entrée",
    accessType: "Type d'Accès",
    spaceLocation: "Localisation de l'Espace",
    spaceDescription: "Description de l'Espace",
    
    // Dimensions
    length: "Longueur (m)",
    width: "Largeur (m)",
    height: "Hauteur (m)",
    diameter: "Diamètre (m)",
    volume: "Volume Calculé",
    volumeUnit: "m³",
    calculateVolume: "Calculer Volume",
    
    // Points d'entrée
    addEntryPoint: "Ajouter Point d'Entrée",
    entryPoint: "Point d'Entrée #",
    entryType: "Type d'Ouverture",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "État/Condition",
    entryAccessibility: "Accessibilité",
    entryPhotos: "Photos du Point",
    
    // Dangers
    atmosphericHazards: "Dangers Atmosphériques",
    physicalHazards: "Dangers Physiques",
    selectHazards: "Sélectionner les dangers identifiés",
    
    // Conditions environnementales
    ventilationRequired: "Ventilation Requise",
    ventilationType: "Type de Ventilation",
    lightingConditions: "Conditions d'Éclairage",
    temperatureRange: "Plage de Température",
    moistureLevel: "Niveau d'Humidité",
    noiseLevel: "Niveau de Bruit",
    weatherConditions: "Conditions Météorologiques",
    
    // Contenu
    contents: "Contenu de l'Espace",
    residues: "Résidus/Substances",
    previousUse: "Usage Antérieur",
    lastEntry: "Dernière Entrée",
    cleaningStatus: "État de Nettoyage",
    
    // Mesures de sécurité
    emergencyEgress: "Sortie d'Urgence",
    communicationMethod: "Méthode de Communication",
    monitoringEquipment: "Équipement de Surveillance",
    ventilationEquipment: "Équipement de Ventilation",
    emergencyEquipment: "Équipement d'Urgence",
    
    // Documentation photo
    spaceExterior: "Extérieur de l'espace",
    spaceInterior: "Intérieur de l'espace",
    entryPointPhoto: "Point d'entrée",
    hazardIdentification: "Identification des dangers",
    equipmentStaging: "Mise en place équipements",
    atmosphericTesting: "Tests atmosphériques",
    safetyEquipment: "Équipement de sécurité",
    ventilationSystem: "Système de ventilation",
    
    // Actions
    yes: "Oui",
    no: "Non",
    select: "Sélectionner",
    add: "Ajouter",
    remove: "Supprimer",
    save: "Sauvegarder",
    
    // Types d'espaces
    spaceTypes: {
      tank: "🛢️ Réservoir/Citerne",
      vessel: "🏺 Récipient sous pression",
      vault: "🏛️ Voûte/Caveau",
      pit: "🕳️ Fosse/Puits",
      sewer: "🚰 Égout/Conduite",
      silo: "🌾 Silo",
      tunnel: "🚇 Tunnel/Galerie",
      basement: "🏠 Sous-sol/Cave",
      boiler: "🔥 Chaudière",
      duct: "📦 Conduit/Gaine",
      manhole: "🔍 Regard/Puisard",
      bin: "📦 Bac/Conteneur",
      other: "🔧 Autre"
    },
    
    // Classifications CSA
    spaceClassifications: {
      class1: "Classe 1 - Danger immédiat",
      class2: "Classe 2 - Danger potentiel", 
      class3: "Classe 3 - Aucun danger identifié"
    },
    
    // Dangers atmosphériques
    atmosphericHazardTypes: {
      oxygen_deficiency: "Déficience en oxygène (<19.5%)",
      oxygen_enrichment: "Enrichissement en oxygène (>23%)",
      flammable_gases: "Gaz inflammables",
      toxic_gases: "Gaz toxiques",
      hydrogen_sulfide: "Sulfure d'hydrogène (H2S)",
      carbon_monoxide: "Monoxyde de carbone (CO)",
      methane: "Méthane (CH4)",
      carbon_dioxide: "Dioxyde de carbone (CO2)",
      ammonia: "Ammoniac (NH3)",
      chlorine: "Chlore (Cl2)",
      welding_fumes: "Fumées de soudage",
      solvent_vapors: "Vapeurs de solvants",
      dust_particles: "Particules de poussière"
    },
    
    // Dangers physiques
    physicalHazardTypes: {
      engulfment: "Ensevelissement",
      crushing: "Écrasement",
      electrical: "Électriques",
      mechanical: "Mécaniques",
      temperature: "Températures extrêmes",
      noise: "Bruit excessif",
      radiation: "Radiations",
      falling_objects: "Chute d'objets",
      slips_falls: "Glissades/Chutes",
      confined_layout: "Configuration confinée",
      poor_visibility: "Visibilité réduite",
      structural_collapse: "Effondrement structural",
      chemical_burns: "Brûlures chimiques",
      biological: "Dangers biologiques"
    }
  },
  
  en: {
    // Main title
    siteInformationTitle: "📋 Site Information - Confined Space Permit",
    siteInformationSubtitle: "Complete documentation for safe confined space entry",
    
    // Main sections
    projectInfo: "🏢 Project Information",
    spaceIdentification: "🏠 Confined Space Identification",
    spaceDimensions: "📏 Dimensions and Volume",
    entryPoints: "🚪 Entry Points and Access",
    hazardAssessment: "⚠️ Hazard Assessment",
    environmentalConditions: "🌡️ Environmental Conditions",
    spaceContent: "📦 Content and History",
    safetyMeasures: "🛡️ Safety Measures",
    photoDocumentation: "📸 Photo Documentation",
    
    // Project information
    projectNumber: "Project Number",
    workLocation: "Work Location",
    workDescription: "Work Description",
    contractor: "Contractor",
    supervisor: "Supervisor",
    entryDate: "Planned Entry Date",
    duration: "Estimated Duration",
    workerCount: "Number of Workers",
    
    // Space identification
    spaceType: "Confined Space Type",
    spaceCategory: "Category",
    spaceClassification: "CSA Classification",
    entryMethod: "Entry Method",
    accessType: "Access Type",
    spaceLocation: "Space Location",
    spaceDescription: "Space Description",
    
    // Dimensions
    length: "Length (m)",
    width: "Width (m)",
    height: "Height (m)",
    diameter: "Diameter (m)",
    volume: "Calculated Volume",
    volumeUnit: "m³",
    calculateVolume: "Calculate Volume",
    
    // Entry points
    addEntryPoint: "Add Entry Point",
    entryPoint: "Entry Point #",
    entryType: "Opening Type",
    entryDimensions: "Dimensions",
    entryLocation: "Location",
    entryCondition: "State/Condition",
    entryAccessibility: "Accessibility",
    entryPhotos: "Point Photos",
    
    // Hazards
    atmosphericHazards: "Atmospheric Hazards",
    physicalHazards: "Physical Hazards",
    selectHazards: "Select identified hazards",
    
    // Environmental conditions
    ventilationRequired: "Ventilation Required",
    ventilationType: "Ventilation Type",
    lightingConditions: "Lighting Conditions",
    temperatureRange: "Temperature Range",
    moistureLevel: "Moisture Level",
    noiseLevel: "Noise Level",
    weatherConditions: "Weather Conditions",
    
    // Content
    contents: "Space Contents",
    residues: "Residues/Substances",
    previousUse: "Previous Use",
    lastEntry: "Last Entry",
    cleaningStatus: "Cleaning Status",
    
    // Safety measures
    emergencyEgress: "Emergency Egress",
    communicationMethod: "Communication Method",
    monitoringEquipment: "Monitoring Equipment",
    ventilationEquipment: "Ventilation Equipment",
    emergencyEquipment: "Emergency Equipment",
    
    // Photo documentation
    spaceExterior: "Space exterior",
    spaceInterior: "Space interior",
    entryPointPhoto: "Entry point",
    hazardIdentification: "Hazard identification",
    equipmentStaging: "Equipment staging",
    atmosphericTesting: "Atmospheric testing",
    safetyEquipment: "Safety equipment",
    ventilationSystem: "Ventilation system",
    
    // Actions
    yes: "Yes",
    no: "No",
    select: "Select",
    add: "Add",
    remove: "Remove",
    save: "Save",
    
    // Space types
    spaceTypes: {
      tank: "🛢️ Tank/Cistern",
      vessel: "🏺 Pressure Vessel",
      vault: "🏛️ Vault/Chamber",
      pit: "🕳️ Pit/Well",
      sewer: "🚰 Sewer/Pipe",
      silo: "🌾 Silo",
      tunnel: "🚇 Tunnel/Gallery",
      basement: "🏠 Basement/Cellar",
      boiler: "🔥 Boiler",
      duct: "📦 Duct/Vent",
      manhole: "🔍 Manhole/Sump",
      bin: "📦 Bin/Container",
      other: "🔧 Other"
    },
    
    // CSA Classifications
    spaceClassifications: {
      class1: "Class 1 - Immediate danger",
      class2: "Class 2 - Potential danger",
      class3: "Class 3 - No identified danger"
    },
    
    // Atmospheric hazards
    atmosphericHazardTypes: {
      oxygen_deficiency: "Oxygen deficiency (<19.5%)",
      oxygen_enrichment: "Oxygen enrichment (>23%)",
      flammable_gases: "Flammable gases",
      toxic_gases: "Toxic gases",
      hydrogen_sulfide: "Hydrogen sulfide (H2S)",
      carbon_monoxide: "Carbon monoxide (CO)",
      methane: "Methane (CH4)",
      carbon_dioxide: "Carbon dioxide (CO2)",
      ammonia: "Ammonia (NH3)",
      chlorine: "Chlorine (Cl2)",
      welding_fumes: "Welding fumes",
      solvent_vapors: "Solvent vapors",
      dust_particles: "Dust particles"
    },
    
    // Physical hazards
    physicalHazardTypes: {
      engulfment: "Engulfment",
      crushing: "Crushing",
      electrical: "Electrical",
      mechanical: "Mechanical",
      temperature: "Extreme temperatures",
      noise: "Excessive noise",
      radiation: "Radiation",
      falling_objects: "Falling objects",
      slips_falls: "Slips/Falls",
      confined_layout: "Confined layout",
      poor_visibility: "Poor visibility",
      structural_collapse: "Structural collapse",
      chemical_burns: "Chemical burns",
      biological: "Biological hazards"
    }
  }
};
