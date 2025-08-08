'use client';

import React, { useState, useCallback } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, User, Briefcase,
  Copy, Check, Plus, X
} from 'lucide-react';

// =================== INTERFACES SIMPLES ===================
interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
}

// =================== TRADUCTIONS BASIQUES ===================
const translations = {
  fr: {
    clientInfo: "🏢 Informations Client",
    projectDetails: "📋 Détails du Projet", 
    clientName: "Nom du Client",
    projectNumber: "Numéro de Projet",
    addLocation: "Ajouter Emplacement",
    locationName: "Nom de l'Emplacement",
    cancel: "Annuler",
    add: "Ajouter"
  },
  en: {
    clientInfo: "🏢 Client Information",
    projectDetails: "📋 Project Details",
    clientName: "Client Name", 
    projectNumber: "Project Number",
    addLocation: "Add Location",
    locationName: "Location Name",
    cancel: "Cancel",
    add: "Add"
  }
};

// =================== COMPOSANT ULTRA-SIMPLE - ÉTATS SÉPARÉS ===================
function Step1ProjectInfo({ formData, onDataChange, language, tenant }: Step1ProjectInfoProps) {
  
  const t = translations[language];
  
  // =================== 🔥 ÉTATS COMPLÈTEMENT SÉPARÉS ===================
  const [clientName, setClientName] = useState(formData?.projectInfo?.clientName || '');
  const [projectNumber, setProjectNumber] = useState(formData?.projectInfo?.projectNumber || '');
  const [locations, setLocations] = useState<string[]>([]);
  
  // États modal séparés
  const [showModal, setShowModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  
  // =================== HANDLERS ULTRA-SIMPLES SÉPARÉS ===================
  const updateClientName = useCallback((value: string) => {
    console.log('🔥 Client Name:', value);
    setClientName(value);
    
    // Sync parent
    setTimeout(() => {
      onDataChange('projectInfo', { 
        clientName: value,
        projectNumber: projectNumber 
      });
    }, 0);
  }, [projectNumber, onDataChange]);
  
  const updateProjectNumber = useCallback((value: string) => {
    console.log('🔥 Project Number:', value);
    setProjectNumber(value);
    
    // Sync parent
    setTimeout(() => {
      onDataChange('projectInfo', { 
        clientName: clientName,
        projectNumber: value 
      });
    }, 0);
  }, [clientName, onDataChange]);
  
  // =================== HANDLERS MODAL SIMPLES ===================
  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setShowModal(false);
    setNewLocationName('');
  }, []);
  
  const addLocation = useCallback(() => {
    if (newLocationName.trim()) {
      console.log('✅ Location ajoutée:', newLocationName);
      setLocations(prev => [...prev, newLocationName.trim()]);
      setNewLocationName('');
      setShowModal(false);
    }
  }, [newLocationName]);

  console.log('🔥 Step1 Ultra-Simple - clientName:', clientName, 'projectNumber:', projectNumber);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step1-container { 
            padding: 20px; 
            max-width: 600px; 
            margin: 0 auto;
            color: #ffffff;
          }
          
          .form-section { 
            background: rgba(30, 41, 59, 0.7); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            padding: 24px; 
            margin-bottom: 20px;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          }
          
          .section-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          
          .form-field { 
            margin-bottom: 16px; 
          }
          
          .field-label { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            color: #e2e8f0; 
            font-size: 14px; 
            font-weight: 500; 
            margin-bottom: 8px;
          }
          
          .form-input { 
            width: 100%; 
            padding: 12px 16px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 8px; 
            color: #ffffff; 
            font-size: 14px; 
            transition: border-color 0.3s ease;
            box-sizing: border-box;
          }
          
          .form-input:focus { 
            outline: none; 
            border-color: #3b82f6; 
          }
          
          .btn-primary {
            background: #3b82f6;
            border: none;
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.3s ease;
          }
          
          .btn-primary:hover {
            background: #2563eb;
          }
          
          .btn-secondary {
            background: rgba(100, 116, 139, 0.3);
            border: 1px solid rgba(100, 116, 139, 0.5);
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          
          .btn-secondary:hover {
            background: rgba(100, 116, 139, 0.5);
          }
          
          /* =================== MODAL SIMPLE =================== */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .modal-content {
            background: rgba(30, 41, 59, 0.95);
            border: 2px solid #3b82f6;
            border-radius: 16px;
            padding: 24px;
            width: 100%;
            max-width: 400px;
            z-index: 999999;
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .modal-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          
          .modal-close {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .modal-footer {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            justify-content: flex-end;
          }
          
          .location-item {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 8px 12px;
            margin: 4px 0;
            color: #ffffff;
            fontSize: 13px;
          }
        `
      }} />
      
      <div className="step1-container">
        
        {/* ✅ SECTION CLIENT - 1 SEUL CHAMP */}
        <div className="form-section">
          <div className="section-header">
            <Building size={20} color="#3b82f6" />
            <h3 className="section-title">{t.clientInfo}</h3>
          </div>
          
          <div className="form-field">
            <label className="field-label">
              <Building size={16} />
              {t.clientName}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Hydro-Québec..."
              value={clientName}
              onChange={(e) => updateClientName(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ SECTION PROJET - 1 SEUL CHAMP */}
        <div className="form-section">
          <div className="section-header">
            <Briefcase size={20} color="#3b82f6" />
            <h3 className="section-title">{t.projectDetails}</h3>
          </div>
          
          <div className="form-field">
            <label className="field-label">
              <Briefcase size={16} />
              {t.projectNumber}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: PRJ-2025-001"
              value={projectNumber}
              onChange={(e) => updateProjectNumber(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ SECTION EMPLACEMENTS SIMPLE */}
        <div className="form-section">
          <button className="btn-primary" onClick={openModal}>
            <Plus size={16} />
            {t.addLocation}
          </button>
          
          {/* Liste des locations */}
          {locations.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>
                Emplacements ajoutés ({locations.length}):
              </h4>
              {locations.map((location, index) => (
                <div key={index} className="location-item">
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ MODAL ULTRA-SIMPLE */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{t.addLocation}</h3>
                <button className="modal-close" onClick={closeModal}>
                  <X size={16} />
                </button>
              </div>
              
              <div className="form-field">
                <label className="field-label">
                  <MapPin size={16} />
                  {t.locationName}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Bâtiment A"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeModal}>
                  {t.cancel}
                </button>
                <button className="btn-primary" onClick={addLocation}>
                  <Plus size={16} />
                  {t.add}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Step1ProjectInfo;
