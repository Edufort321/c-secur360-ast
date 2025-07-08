'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Building, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Briefcase,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';

interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
}

// Générateur de numéro AST
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

export default function Step1ProjectInfo({ 
  formData, 
  onDataChange, 
  language, 
  tenant, 
  errors 
}: Step1ProjectInfoProps) {
  const [astNumber, setAstNumber] = useState(formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);

  const projectInfo = formData?.projectInfo || {};

  const updateProjectInfo = (field: string, value: any) => {
    onDataChange('projectInfo', {
      ...projectInfo,
      [field]: value
    });
  };

  const copyASTNumber = async () => {
    try {
      await navigator.clipboard.writeText(astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const regenerateASTNumber = () => {
    const newNumber = generateASTNumber();
    setAstNumber(newNumber);
    onDataChange('astNumber', newNumber);
  };

  return (
    <>
      {/* CSS Premium pour Step 1 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step1-container {
            padding: 0;
          }

          .premium-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
          }

          .form-section {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s ease;
          }

          .form-section:hover {
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          }

          .section-icon {
            width: 24px;
            height: 24px;
            color: #3b82f6;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }

          .section-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }

          .form-field {
            margin-bottom: 20px;
          }

          .field-label {
            display: block;
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .field-label .required {
            color: #ef4444;
            font-weight: 700;
          }

          .premium-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .premium-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: rgba(15, 23, 42, 0.9);
          }

          .premium-input::placeholder {
            color: #64748b;
            font-weight: 400;
          }

          .premium-select {
            width: 100%;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }

          .premium-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .premium-textarea {
            width: 100%;
            min-height: 120px;
            padding: 14px 16px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #ffffff;
            font-size: 15px;
            font-weight: 500;
            resize: vertical;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-family: inherit;
          }

          .premium-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .premium-textarea::placeholder {
            color: #64748b;
            font-weight: 400;
          }

          .ast-number-card {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
            border: 2px solid #22c55e;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
          }

          .ast-number-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
          }

          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }

          .ast-number-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .ast-number-title {
            color: #22c55e;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ast-number-value {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 24px;
            font-weight: 800;
            color: #22c55e;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 12px;
          }

          .ast-actions {
            display: flex;
            gap: 12px;
          }

          .btn-icon {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid #22c55e;
            color: #22c55e;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-icon:hover {
            background: rgba(34, 197, 94, 0.2);
            transform: translateY(-2px);
          }

          .btn-icon.copied {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }

          .field-help {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            font-style: italic;
          }

          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .span-full {
            grid-column: 1 / -1;
          }

          .required-indicator {
            color: #ef4444;
            margin-left: 4px;
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .premium-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .form-section {
              padding: 16px;
            }

            .two-column {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .ast-number-value {
              font-size: 18px;
            }

            .section-title {
              font-size: 16px;
            }

            .premium-input,
            .premium-select,
            .premium-textarea {
              font-size: 16px; /* Évite zoom iOS */
            }
          }

          @media (max-width: 480px) {
            .form-section {
              padding: 12px;
            }

            .ast-number-card {
              padding: 16px;
            }

            .ast-actions {
              flex-direction: column;
            }
          }
        `
      }} />

      <div className="step1-container">
        {/* Carte Numéro AST Premium */}
        <div className="ast-number-card">
          <div className="ast-number-header">
            <div className="ast-number-title">
              <FileText style={{ width: '20px', height: '20px' }} />
              🔢 Numéro AST Unique
            </div>
            <div className="ast-actions">
              <button 
                className={`btn-icon ${copied ? 'copied' : ''}`}
                onClick={copyASTNumber}
                title="Copier le numéro"
              >
                {copied ? (
                  <Check style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Copy style={{ width: '16px', height: '16px' }} />
                )}
              </button>
              <button 
                className="btn-icon"
                onClick={regenerateASTNumber}
                title="Générer un nouveau numéro"
              >
                <FileText style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          
          <div className="ast-number-value">
            {astNumber}
          </div>
          
          <div className="field-help">
            Numéro généré automatiquement - Usage unique pour cette AST
          </div>
        </div>

        {/* Grille Premium des Sections - AUTO-SIZING OPTIMISÉ */}
        <div className="premium-grid">
          
          {/* Sections Client et Projet - Desktop 2 colonnes, Mobile empilé */}
          <div className="desktop-two-column">
            {/* Section Client */}
            <div className="form-section">
              <div className="section-header">
                <Building className="section-icon" />
                <h3 className="section-title">🏢 Informations Client</h3>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Building style={{ width: '18px', height: '18px' }} />
                  Nom du Client
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Ex: Hydro-Québec, Bell Canada..."
                  value={projectInfo.client || ''}
                  onChange={(e) => updateProjectInfo('client', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />
                  Téléphone Client
                </label>
                <input
                  type="tel"
                  className="premium-input"
                  placeholder="Ex: (514) 555-0123"
                  value={projectInfo.clientPhone || ''}
                  onChange={(e) => updateProjectInfo('clientPhone', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <User style={{ width: '18px', height: '18px' }} />
                  Représentant Client
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Nom du responsable projet"
                  value={projectInfo.clientRepresentative || ''}
                  onChange={(e) => updateProjectInfo('clientRepresentative', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />
                  Téléphone Représentant
                </label>
                <input
                  type="tel"
                  className="premium-input"
                  placeholder="Ex: (514) 555-0456"
                  value={projectInfo.clientRepresentativePhone || ''}
                  onChange={(e) => updateProjectInfo('clientRepresentativePhone', e.target.value)}
                />
              </div>
            </div>

            {/* Section Projet */}
            <div className="form-section">
              <div className="section-header">
                <Briefcase className="section-icon" />
                <h3 className="section-title">📋 Détails du Projet</h3>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Briefcase style={{ width: '18px', height: '18px' }} />
                  Numéro de Projet
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Ex: PRJ-2025-001"
                  value={projectInfo.projectNumber || ''}
                  onChange={(e) => updateProjectInfo('projectNumber', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FileText style={{ width: '18px', height: '18px' }} />
                  # AST Client (Optionnel)
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Numéro fourni par le client"
                  value={projectInfo.astClientNumber || ''}
                  onChange={(e) => updateProjectInfo('astClientNumber', e.target.value)}
                />
                <div className="field-help">
                  Numéro de référence du client (si applicable)
                </div>
              </div>

              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    <Calendar style={{ width: '18px', height: '18px' }} />
                    Date
                  </label>
                  <input
                    type="date"
                    className="premium-input"
                    value={projectInfo.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateProjectInfo('date', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <Clock style={{ width: '18px', height: '18px' }} />
                    Heure
                  </label>
                  <input
                    type="time"
                    className="premium-input"
                    value={projectInfo.time || new Date().toTimeString().substring(0, 5)}
                    onChange={(e) => updateProjectInfo('time', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sections Localisation et Équipe - Desktop 2 colonnes, Mobile empilé */}
          <div className="desktop-two-column">
            {/* Section Localisation */}
            <div className="form-section">
              <div className="section-header">
                <MapPin className="section-icon" />
                <h3 className="section-title">📍 Localisation</h3>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <MapPin style={{ width: '18px', height: '18px' }} />
                  Lieu des Travaux
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Adresse complète du site de travail"
                  value={projectInfo.workLocation || ''}
                  onChange={(e) => updateProjectInfo('workLocation', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Briefcase style={{ width: '18px', height: '18px' }} />
                  Type d'Industrie
                </label>
                <select
                  className="premium-select"
                  value={projectInfo.industry || 'electrical'}
                  onChange={(e) => updateProjectInfo('industry', e.target.value)}
                >
                  <option value="electrical">⚡ Électrique</option>
                  <option value="construction">🏗️ Construction</option>
                  <option value="industrial">🏭 Industriel</option>
                  <option value="manufacturing">⚙️ Manufacturier</option>
                  <option value="office">🏢 Bureau/Administratif</option>
                  <option value="other">🔧 Autre</option>
                </select>
              </div>
            </div>

            {/* Section Équipe */}
            <div className="form-section">
              <div className="section-header">
                <Users className="section-icon" />
                <h3 className="section-title">👥 Équipe de Travail</h3>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Users style={{ width: '18px', height: '18px' }} />
                  Nombre de Personnes
                  <span className="required-indicator">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="premium-input"
                  placeholder="Ex: 5"
                  value={projectInfo.workerCount || 1}
                  onChange={(e) => updateProjectInfo('workerCount', parseInt(e.target.value) || 1)}
                />
                <div className="field-help">
                  Ce nombre sera comparé aux approbations d'équipe
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Clock style={{ width: '18px', height: '18px' }} />
                  Durée Estimée
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Ex: 4 heures, 2 jours, 1 semaine"
                  value={projectInfo.estimatedDuration || ''}
                  onChange={(e) => updateProjectInfo('estimatedDuration', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section Contacts d'Urgence - Pleine largeur avec 2 colonnes internes */}
          <div className="form-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" />
              <h3 className="section-title">🚨 Contacts d'Urgence</h3>
            </div>

            <div className="two-column">
              <div className="form-field">
                <label className="field-label">
                  <AlertTriangle style={{ width: '18px', height: '18px' }} />
                  Contact d'Urgence
                </label>
                <input
                  type="text"
                  className="premium-input"
                  placeholder="Nom du contact d'urgence"
                  value={projectInfo.emergencyContact || ''}
                  onChange={(e) => updateProjectInfo('emergencyContact', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />
                  Téléphone d'Urgence
                </label>
                <input
                  type="tel"
                  className="premium-input"
                  placeholder="911 ou numéro spécifique"
                  value={projectInfo.emergencyPhone || ''}
                  onChange={(e) => updateProjectInfo('emergencyPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section Description - PLEINE LARGEUR OPTIMISÉE */}
          <div className="form-section full-width-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3 className="section-title">📝 Description Détaillée des Travaux</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                Description Complète
                <span className="required-indicator">*</span>
              </label>
              <textarea
                className="premium-textarea"
                style={{
                  width: '100%',
                  minHeight: '200px',
                  maxWidth: 'none',
                  resize: 'vertical'
                }}
                placeholder="Décrivez en détail les travaux à effectuer :&#10;&#10;• Méthodes utilisées&#10;• Équipements impliqués&#10;• Zones d'intervention&#10;• Procédures spéciales&#10;• Conditions particulières&#10;&#10;Plus la description est détaillée, plus l'analyse de sécurité sera précise."
                value={projectInfo.workDescription || ''}
                onChange={(e) => updateProjectInfo('workDescription', e.target.value)}
              />
              <div className="field-help">
                Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
