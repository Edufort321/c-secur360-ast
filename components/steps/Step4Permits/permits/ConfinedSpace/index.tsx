"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye,
  Thermometer, Activity, Volume2, FileText, Phone, Plus, Trash2,
  User, UserCheck, Timer, LogIn, LogOut, Edit3, Copy
} from 'lucide-react';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  province?: ProvinceCode;
  language?: 'fr' | 'en';
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

interface AtmosphericReading {
  id: string;
  timestamp: string;
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature: number;
  humidity: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  location?: string;
  taken_by: string;
}

interface PersonnelEntry {
  id: string;
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor' | 'rescue';
  employee_id: string;
  company: string;
  certification: string;
  certification_expiry: string;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
  signature?: string;
  signature_timestamp?: string;
  entry_time?: string;
  exit_time?: string;
  is_inside: boolean;
  training_records: string[];
  // Nouvelles propriétés pour formations
  training_up_to_date: boolean;
  training_declaration: boolean;
  training_verification_date: string;
  training_verified_by: string;
  formation_espace_clos: boolean;
  formation_sauvetage: boolean;
  formation_premiers_soins: boolean;
  formation_expiry_dates: {
    [key: string]: string | undefined;
    espace_clos?: string;
    sauvetage?: string;
    premiers_soins?: string;
  };
}

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'documentation';
  gps_location?: { lat: number; lng: number };
  taken_by: string;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
}

interface EquipmentCheck {
  id: string;
  equipment_name: string;
  serial_number: string;
  last_inspection: string;
  condition: 'good' | 'fair' | 'poor' | 'defective';
  notes: string;
  checked_by: string;
  check_timestamp: string;
}

interface HazardAssessment {
  id: string;
  hazard_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  control_measures: string[];
  responsible_person: string;
  verification_required: boolean;
}

// =================== RÉGLEMENTATIONS PROVINCIALES ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    code: 'RSST Art. 302-317, s. 2.1, r. 13',
    url: 'https://www.legisquebec.gouv.qc.ca/en/document/cr/s-2.1,%20r.%2013',
    atmospheric_testing: {
      frequency_minutes: 30,
      continuous_required: true,
      pre_entry_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical: 16.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel: {
      attendant_required: true,
      rescue_team_standby: true,
      max_entrants: 'selon évaluation',
      qualified_person_required: true
    },
    documentation: [
      'Permis d\'entrée signé obligatoire',
      'Tests atmosphériques continus documentés',
      'Plan de sauvetage approuvé et testé',
      'Équipements vérifiés et certifiés',
      'Formation personnel documentée'
    ],
    emergency_contacts: [
      { name: '911', role: 'Urgences', phone: '911', available_24h: true },
      { name: 'CNESST Urgence', role: 'Accidents travail', phone: '1-844-838-0808', available_24h: true },
      { name: 'Centre Anti-Poison QC', role: 'Intoxications', phone: '1-800-463-5060', available_24h: true }
    ]
  }
  // Autres provinces...
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "Confined Space Entry Permit",
      permitNumber: "Permit Number",
      location: "Location/Site",
      contractor: "Contractor",
      spaceDescription: "Space Description",
      workDescription: "Work Description",
      hazardsIdentified: "Hazards Identified",
      controlMeasures: "Control Measures",
      personnel: "Personnel Management",
      addEntrant: "Add Entrant",
      addAttendant: "Add Attendant",
      entryTime: "Entry Time",
      exitTime: "Exit Time",
      currentlyInside: "Currently Inside",
      atmospheric: "Atmospheric Testing",
      equipment: "Equipment Verification",
      emergency: "Emergency Procedures",
      signatures: "Electronic Signatures",
      photos: "Photo Documentation",
      submitPermit: "Submit Permit",
      savePermit: "Save Permit",
      cancel: "Cancel",
      emergencyEvacuation: "EMERGENCY EVACUATION"
    };
  }
  
  return {
    title: "Permis d'Entrée en Espace Clos",
    permitNumber: "Numéro de Permis",
    location: "Lieu/Site",
    contractor: "Contracteur",
    spaceDescription: "Description de l'Espace",
    workDescription: "Description du Travail",
    hazardsIdentified: "Dangers Identifiés",
    controlMeasures: "Moyens de Contrôle",
    personnel: "Gestion du Personnel",
    addEntrant: "Ajouter Entrant",
    addAttendant: "Ajouter Surveillant",
    entryTime: "Heure d'Entrée",
    exitTime: "Heure de Sortie",
    currentlyInside: "Actuellement à l'Intérieur",
    atmospheric: "Tests Atmosphériques",
    equipment: "Vérification Équipements",
    emergency: "Procédures d'Urgence",
    signatures: "Signatures Électroniques",
    photos: "Documentation Photo",
    submitPermit: "Soumettre Permis",
    savePermit: "Sauvegarder Permis",
    cancel: "Annuler",
    emergencyEvacuation: "ÉVACUATION D'URGENCE"
  };
};

// =================== COMPOSANT SIGNATURE ÉLECTRONIQUE ===================
const SignatureCanvas: React.FC<{
  onSignature: (signature: string) => void;
  label: string;
  required?: boolean;
  existingSignature?: string;
}> = ({ onSignature, label, required = false, existingSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!existingSignature);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      const signatureData = canvas.toDataURL();
      onSignature(signatureData);
    }
  };

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">
          {label} {required && <span className="text-red-400">*</span>}
        </span>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleString()}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="w-full border-2 border-slate-600 rounded bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ minHeight: '100px' }}
      />
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearSignature}
          className="premium-button-secondary text-sm"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Effacer
        </button>
        <button
          onClick={saveSignature}
          disabled={isEmpty}
          className="premium-button text-sm"
        >
          <Save className="w-3 h-3 mr-1" />
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

// =================== COMPOSANT VÉRIFICATION FORMATION ===================
const TrainingVerification: React.FC<{
  person: PersonnelEntry;
  onUpdate: (field: keyof PersonnelEntry, value: any) => void;
  role: 'entrant' | 'attendant' | 'supervisor';
}> = ({ person, onUpdate, role }) => {

  const getRequiredTrainings = () => {
    switch (role) {
      case 'entrant':
        return [
          { key: 'formation_espace_clos', label: 'Formation Espace Clos (obligatoire)', required: true },
          { key: 'formation_premiers_soins', label: 'Premiers Soins/RCR', required: true },
        ];
      case 'attendant':
        return [
          { key: 'formation_espace_clos', label: 'Formation Espace Clos - Surveillant (obligatoire)', required: true },
          { key: 'formation_sauvetage', label: 'Formation Sauvetage (obligatoire)', required: true },
          { key: 'formation_premiers_soins', label: 'Premiers Soins/RCR (obligatoire)', required: true },
        ];
      case 'supervisor':
        return [
          { key: 'formation_espace_clos', label: 'Formation Superviseur Espace Clos (obligatoire)', required: true },
          { key: 'formation_sauvetage', label: 'Formation Sauvetage', required: false },
        ];
      default:
        return [];
    }
  };

  const requiredTrainings = getRequiredTrainings();
  const allRequiredCompleted = requiredTrainings
    .filter(t => t.required)
    .every(t => person[t.key as keyof PersonnelEntry]);

  const updateFormationDate = (formationType: string, date: string) => {
    const newDates = { ...person.formation_expiry_dates, [formationType]: date };
    onUpdate('formation_expiry_dates', newDates);
  };

  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
      <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Vérification des Formations - {role === 'entrant' ? 'Entrant' : role === 'attendant' ? 'Surveillant' : 'Superviseur'}
      </h4>

      <div className="space-y-3">
        {requiredTrainings.map(training => (
          <div key={training.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={person[training.key as keyof PersonnelEntry] as boolean}
                onChange={(e) => onUpdate(training.key as keyof PersonnelEntry, e.target.checked)}
                className="w-4 h-4 rounded border-2 border-blue-500 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-white">
                {training.label}
                {training.required && <span className="text-red-400 ml-1">*</span>}
              </label>
            </div>
            
            {person[training.key as keyof PersonnelEntry] && (
              <input
                type="date"
                placeholder="Date d'expiration"
                value={person.formation_expiry_dates[training.key.replace('formation_', '')] || ''}
                onChange={(e) => updateFormationDate(training.key.replace('formation_', ''), e.target.value)}
                className="premium-input text-xs"
                style={{ width: '140px', padding: '6px 8px' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* DÉCLARATION DE CONFORMITÉ */}
      <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={person.training_declaration}
            onChange={(e) => onUpdate('training_declaration', e.target.checked)}
            className="w-4 h-4 mt-1 rounded border-2 border-green-500 text-green-600 focus:ring-green-500"
            required
          />
          <div className="flex-1">
            <label className="text-sm text-green-200 font-medium">
              Déclaration de Conformité des Formations <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-green-300 mt-1">
              Je déclare que toutes les formations ci-dessus sont à jour, conformes aux exigences réglementaires 
              {role === 'entrant' && ' (RSST Art. 302-317)'}
              {role === 'attendant' && ' (RSST Art. 302-317, Formation Surveillant)'}
              {role === 'supervisor' && ' (RSST Art. 302-317, Personne Qualifiée)'}
              , et que les documents de certification peuvent être fournis sur demande.
            </p>
          </div>
        </div>
      </div>

      {/* VÉRIFICATION FINALE */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="date"
          placeholder="Date de vérification"
          value={person.training_verification_date}
          onChange={(e) => onUpdate('training_verification_date', e.target.value)}
          className="premium-input text-sm"
        />
        <input
          type="text"
          placeholder="Vérifié par (nom)"
          value={person.training_verified_by}
          onChange={(e) => onUpdate('training_verified_by', e.target.value)}
          className="premium-input text-sm"
        />
      </div>

      {/* INDICATEUR DE CONFORMITÉ */}
      <div className="mt-3 text-center">
        {allRequiredCompleted && person.training_declaration ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
            <CheckCircle className="w-4 h-4" />
            Formations Conformes ✓
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">
            <XCircle className="w-4 h-4" />
            Formations Incomplètes ⚠️
          </div>
        )}
      </div>
    </div>
  );
};
// =================== COMPOSANT PERSONNEL ===================
const PersonnelManager: React.FC<{
  personnel: PersonnelEntry[];
  onPersonnelChange: (personnel: PersonnelEntry[]) => void;
  texts: any;
}> = ({ personnel, onPersonnelChange, texts }) => {
  
  const addPerson = (role: 'entrant' | 'attendant' | 'supervisor') => {
    const newPerson: PersonnelEntry = {
      id: `person_${Date.now()}`,
      name: '',
      role,
      employee_id: '',
      company: '',
      certification: '',
      certification_expiry: '',
      phone: '',
      emergency_contact: '',
      emergency_phone: '',
      is_inside: false,
      training_records: [],
      // Nouvelles propriétés formations
      training_up_to_date: false,
      training_declaration: false,
      training_verification_date: '',
      training_verified_by: '',
      formation_espace_clos: false,
      formation_sauvetage: false,
      formation_premiers_soins: false,
      formation_expiry_dates: {} as { [key: string]: string | undefined }
    };
    onPersonnelChange([...personnel, newPerson]);
  };

  const updatePerson = (id: string, field: keyof PersonnelEntry, value: any) => {
    const updated = personnel.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    );
    onPersonnelChange(updated);
  };

  const removePerson = (id: string) => {
    onPersonnelChange(personnel.filter(p => p.id !== id));
  };

  const recordEntry = (id: string) => {
    const now = new Date().toISOString();
    updatePerson(id, 'entry_time', now);
    updatePerson(id, 'is_inside', true);
  };

  const recordExit = (id: string) => {
    const now = new Date().toISOString();
    updatePerson(id, 'exit_time', now);
    updatePerson(id, 'is_inside', false);
  };

  const entrants = personnel.filter(p => p.role === 'entrant');
  const attendants = personnel.filter(p => p.role === 'attendant');
  const supervisors = personnel.filter(p => p.role === 'supervisor');

  return (
    <div className="space-y-6">
      
      {/* SECTION ENTRANTS */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            <User className="w-5 h-5" />
            Entrants ({entrants.length})
          </h3>
          <button
            onClick={() => addPerson('entrant')}
            className="premium-button text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {texts.addEntrant}
          </button>
        </div>

        <div className="space-y-4">
          {entrants.map(person => (
            <div key={person.id} className="premium-card border-l-4 border-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  className="premium-input"
                  required
                />
                <input
                  type="text"
                  placeholder="ID Employé"
                  value={person.employee_id}
                  onChange={(e) => updatePerson(person.id, 'employee_id', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="text"
                  placeholder="Compagnie"
                  value={person.company}
                  onChange={(e) => updatePerson(person.id, 'company', e.target.value)}
                  className="premium-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Certification"
                  value={person.certification}
                  onChange={(e) => updatePerson(person.id, 'certification', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="date"
                  placeholder="Expiration cert."
                  value={person.certification_expiry}
                  onChange={(e) => updatePerson(person.id, 'certification_expiry', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={person.phone}
                  onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                  className="premium-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Contact d'urgence"
                  value={person.emergency_contact}
                  onChange={(e) => updatePerson(person.id, 'emergency_contact', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="tel"
                  placeholder="Tél. contact urgence"
                  value={person.emergency_phone}
                  onChange={(e) => updatePerson(person.id, 'emergency_phone', e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* VÉRIFICATION FORMATION */}
              <TrainingVerification
                person={person}
                onUpdate={(field, value) => updatePerson(person.id, field, value)}
                role="entrant"
              />

              {/* CONTRÔLES ENTRÉE/SORTIE */}
              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${person.is_inside ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span className="text-sm font-medium">
                    {person.is_inside ? '🔴 À L\'INTÉRIEUR' : '🟢 À L\'EXTÉRIEUR'}
                  </span>
                  
                  {person.entry_time && (
                    <span className="text-xs text-slate-400">
                      Entrée: {new Date(person.entry_time).toLocaleTimeString()}
                    </span>
                  )}
                  
                  {person.exit_time && (
                    <span className="text-xs text-slate-400">
                      Sortie: {new Date(person.exit_time).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => recordEntry(person.id)}
                    disabled={person.is_inside}
                    className="premium-button text-xs"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Entrée
                  </button>
                  
                  <button
                    onClick={() => recordExit(person.id)}
                    disabled={!person.is_inside}
                    className="premium-button text-xs"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Sortie
                  </button>
                  
                  <button
                    onClick={() => removePerson(person.id)}
                    className="premium-button-secondary text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SIGNATURE AVEC VALIDATION FORMATION */}
              <div className="mt-4">
                {/* Vérification avant signature */}
                {!(person.training_declaration && 
                   person.formation_espace_clos && 
                   person.formation_premiers_soins) && (
                  <div className="mb-3 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                    ⚠️ La signature ne sera possible qu'après validation complète des formations obligatoires.
                  </div>
                )}
                
                <SignatureCanvas
                  label={`Signature - ${person.name || 'Entrant'} - Formations Conformes`}
                  required
                  onSignature={(sig) => {
                    if (person.training_declaration && person.formation_espace_clos && person.formation_premiers_soins) {
                      updatePerson(person.id, 'signature', sig);
                      updatePerson(person.id, 'signature_timestamp', new Date().toISOString());
                    } else {
                      alert('⚠️ Veuillez d\'abord valider toutes les formations obligatoires avant de signer.');
                    }
                  }}
                />
                
                {person.signature && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-500/50 rounded text-green-200 text-xs">
                    ✅ Signé le {person.signature_timestamp ? new Date(person.signature_timestamp).toLocaleString() : ''} 
                    - Formations validées et conformes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION SURVEILLANTS */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            <UserCheck className="w-5 h-5" />
            Surveillants ({attendants.length})
          </h3>
          <button
            onClick={() => addPerson('attendant')}
            className="premium-button text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {texts.addAttendant}
          </button>
        </div>

        <div className="space-y-4">
          {attendants.map(person => (
            <div key={person.id} className="premium-card border-l-4 border-yellow-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  className="premium-input"
                  required
                />
                <input
                  type="text"
                  placeholder="ID Employé"
                  value={person.employee_id}
                  onChange={(e) => updatePerson(person.id, 'employee_id', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="text"
                  placeholder="Compagnie"
                  value={person.company}
                  onChange={(e) => updatePerson(person.id, 'company', e.target.value)}
                  className="premium-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Certification surveillance"
                  value={person.certification}
                  onChange={(e) => updatePerson(person.id, 'certification', e.target.value)}
                  className="premium-input"
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={person.phone}
                  onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* VÉRIFICATION FORMATION SURVEILLANT */}
              <TrainingVerification
                person={person}
                onUpdate={(field, value) => updatePerson(person.id, field, value)}
                role="attendant"
              />

              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={() => removePerson(person.id)}
                  className="premium-button-secondary text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Retirer
                </button>
              </div>

              {/* SIGNATURE SURVEILLANT AVEC VALIDATION FORMATION */}
              <div className="mt-4">
                {/* Vérification avant signature */}
                {!(person.training_declaration && 
                   person.formation_espace_clos && 
                   person.formation_sauvetage &&
                   person.formation_premiers_soins) && (
                  <div className="mb-3 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                    ⚠️ La signature ne sera possible qu'après validation complète des formations obligatoires de surveillant.
                  </div>
                )}
                
                <SignatureCanvas
                  label={`Signature - ${person.name || 'Surveillant'} - Formations Surveillant Conformes`}
                  required
                  onSignature={(sig) => {
                    if (person.training_declaration && 
                        person.formation_espace_clos && 
                        person.formation_sauvetage &&
                        person.formation_premiers_soins) {
                      updatePerson(person.id, 'signature', sig);
                      updatePerson(person.id, 'signature_timestamp', new Date().toISOString());
                    } else {
                      alert('⚠️ Veuillez d\'abord valider toutes les formations obligatoires de surveillant avant de signer.');
                    }
                  }}
                />
                
                {person.signature && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-500/50 rounded text-green-200 text-xs">
                    ✅ Signé le {person.signature_timestamp ? new Date(person.signature_timestamp).toLocaleString() : ''} 
                    - Formations surveillant validées et conformes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION SUPERVISEUR */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            <Shield className="w-5 h-5" />
            Superviseur d'Entrée
          </h3>
          {supervisors.length === 0 && (
            <button
              onClick={() => addPerson('supervisor')}
              className="premium-button text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter Superviseur
            </button>
          )}
        </div>

        {supervisors.map(person => (
          <div key={person.id} className="premium-card border-l-4 border-green-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nom complet *"
                value={person.name}
                onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                className="premium-input"
                required
              />
              <input
                type="text"
                placeholder="Titre/Position"
                value={person.employee_id}
                onChange={(e) => updatePerson(person.id, 'employee_id', e.target.value)}
                className="premium-input"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={person.phone}
                onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                className="premium-input"
              />
            </div>

            {/* VÉRIFICATION FORMATION SUPERVISEUR */}
            <TrainingVerification
              person={person}
              onUpdate={(field, value) => updatePerson(person.id, field, value)}
              role="supervisor"
            />

            {/* SIGNATURE SUPERVISEUR AVEC VALIDATION FORMATION */}
            <div className="mt-4">
              {!(person.training_declaration && person.formation_espace_clos) && (
                <div className="mb-3 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                  ⚠️ La signature ne sera possible qu'après validation des formations de superviseur.
                </div>
              )}
              
              <SignatureCanvas
                label={`Signature Superviseur - ${person.name || 'Superviseur'} - Personne Qualifiée`}
                required
                onSignature={(sig) => {
                  if (person.training_declaration && person.formation_espace_clos) {
                    updatePerson(person.id, 'signature', sig);
                    updatePerson(person.id, 'signature_timestamp', new Date().toISOString());
                  } else {
                    alert('⚠️ Veuillez d\'abord valider les formations de superviseur avant de signer.');
                  }
                }}
              />
              
              {person.signature && (
                <div className="mt-2 p-2 bg-green-900/30 border border-green-500/50 rounded text-green-200 text-xs">
                  ✅ Signé le {person.signature_timestamp ? new Date(person.signature_timestamp).toLocaleString() : ''} 
                  - Qualifications superviseur validées
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpacePermit: React.FC<ConfinedSpacePermitProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData
}) => {
  const texts = getTexts(language);
  const regulations = PROVINCIAL_REGULATIONS[province];

  // =================== ÉTAT PRINCIPAL ===================
  const [permitData, setPermitData] = useState({
    // En-tête légal
    permit_number: initialData?.permit_number || `CS-${province}-${Date.now().toString().slice(-6)}`,
    issue_date: initialData?.issue_date || new Date().toISOString().split('T')[0],
    issue_time: initialData?.issue_time || new Date().toTimeString().slice(0, 5),
    expiry_date: initialData?.expiry_date || '',
    expiry_time: initialData?.expiry_time || '',
    
    // Identification du site
    site_name: initialData?.site_name || '',
    site_address: initialData?.site_address || '',
    gps_coordinates: initialData?.gps_coordinates || '',
    
    // Description de l'espace
    space_location: initialData?.space_location || '',
    space_description: initialData?.space_description || '',
    space_dimensions: initialData?.space_dimensions || '',
    access_points: initialData?.access_points || '',
    
    // Travail à effectuer
    work_description: initialData?.work_description || '',
    contractor_company: initialData?.contractor_company || '',
    work_supervisor: initialData?.work_supervisor || '',
    estimated_duration: initialData?.estimated_duration || '',
    
    // Évaluation des dangers
    hazards_identified: initialData?.hazards_identified || [] as HazardAssessment[],
    
    // Personnel
    personnel: initialData?.personnel || [] as PersonnelEntry[],
    
    // Tests atmosphériques
    atmospheric_readings: initialData?.atmospheric_readings || [] as AtmosphericReading[],
    
    // Vérification équipements
    equipment_checks: initialData?.equipment_checks || [] as EquipmentCheck[],
    
    // Documentation
    photos: initialData?.photos || [] as PhotoRecord[],
    
    // Conditions spéciales
    special_conditions: initialData?.special_conditions || '',
    rescue_plan: initialData?.rescue_plan || '',
    emergency_procedures: initialData?.emergency_procedures || '',
    
    // Autorisation finale
    authorized_by: initialData?.authorized_by || '',
    authorization_timestamp: initialData?.authorization_timestamp || '',
    final_signature: initialData?.final_signature || ''
  });

  // =================== TIMER ET MONITORING ===================
  const [timerState, setTimerState] = useState({
    elapsed: 0,
    isRunning: false
  });

  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [currentReading, setCurrentReading] = useState<AtmosphericReading | null>(null);

  // =================== SIMULATION TESTS ATMOSPHÉRIQUES ===================
  const simulateAtmosphericReading = useCallback(() => {
    const reading: AtmosphericReading = {
      id: `reading_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oxygen: Math.random() * 2 + 20.5,
      lel: Math.random() * 5,
      h2s: Math.random() * 5,
      co: Math.random() * 15,
      temperature: Math.random() * 10 + 20,
      humidity: Math.random() * 20 + 40,
      status: 'safe',
      device_id: 'BW-GasAlert-001',
      location: permitData.space_location,
      taken_by: 'Système automatique'
    };

    // Déterminer le statut selon les limites
    const limits = regulations.atmospheric_testing.limits;
    if (reading.oxygen < limits.oxygen.critical || 
        reading.lel > limits.lel.critical ||
        reading.h2s > limits.h2s.critical ||
        reading.co > limits.co.critical) {
      reading.status = 'danger';
    } else if (reading.oxygen < limits.oxygen.min ||
               reading.lel > limits.lel.max ||
               reading.h2s > limits.h2s.max ||
               reading.co > limits.co.max) {
      reading.status = 'warning';
    }

    setCurrentReading(reading);
    setPermitData(prev => ({
      ...prev,
      atmospheric_readings: [...prev.atmospheric_readings, reading]
    }));
  }, [permitData.space_location, regulations.atmospheric_testing.limits]);

  // =================== HANDLERS ===================
  const handleInputChange = (field: string, value: any) => {
    setPermitData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonnelChange = (personnel: PersonnelEntry[]) => {
    setPermitData(prev => ({
      ...prev,
      personnel
    }));
  };

  const connectBluetoothDevice = async () => {
    setBluetoothDevice({
      id: 'BW-GasAlert-001',
      name: 'BW GasAlert Quattro',
      connected: true,
      battery: 85,
      signal: 95
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effet
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  // =================== RENDU ===================
  return (
    <>
      {/* CSS PREMIUM */}
      <style jsx>{`
        .premium-container {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .premium-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }
        
        .premium-card:hover {
          transform: translateY(-2px);
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 12px 40px rgba(251, 191, 36, 0.15);
        }
        
        .premium-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(100, 116, 139, 0.3);
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .premium-input:focus {
          outline: none;
          border-color: #f59e0b;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }
        
        .premium-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .premium-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
        }
        
        .premium-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .premium-button-secondary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #64748b, #475569);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .premium-button-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(100, 116, 139, 0.4);
        }
        
        .section-title {
          color: #f59e0b;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .timer-display {
          font-family: 'Courier New', monospace;
          font-size: 28px;
          font-weight: bold;
          color: #22c55e;
          text-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        .status-safe { color: #22c55e; }
        .status-warning { color: #f59e0b; }
        .status-danger { color: #ef4444; }
        
        @media (max-width: 768px) {
          .premium-container { padding: 12px; }
          .premium-card { padding: 16px; margin-bottom: 16px; }
          .timer-display { font-size: 20px; }
        }
      `}</style>

      <div className="premium-container">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER LÉGAL */}
          <div className="glass-effect p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{texts.title}</h1>
                <p className="text-slate-300">{regulations.name} - {regulations.code}</p>
              </div>
              <div className="text-right">
                <div className="timer-display">{formatTime(timerState.elapsed)}</div>
                <div className="text-sm text-slate-400">Temps permis actif</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">{texts.permitNumber}</label>
                <input
                  type="text"
                  value={permitData.permit_number}
                  onChange={(e) => handleInputChange('permit_number', e.target.value)}
                  className="premium-input"
                  style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Date d'émission</label>
                <input
                  type="date"
                  value={permitData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  className="premium-input"
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Heure d'émission</label>
                <input
                  type="time"
                  value={permitData.issue_time}
                  onChange={(e) => handleInputChange('issue_time', e.target.value)}
                  className="premium-input"
                />
              </div>
              
              <div className="premium-card">
                <label className="block text-sm text-slate-300 mb-2">Valide jusqu'à</label>
                <input
                  type="datetime-local"
                  value={permitData.expiry_date + 'T' + (permitData.expiry_time || '23:59')}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split('T');
                    handleInputChange('expiry_date', date);
                    handleInputChange('expiry_time', time);
                  }}
                  className="premium-input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              
              {/* IDENTIFICATION DU SITE */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <MapPin className="w-5 h-5" />
                  Identification du Site
                </h2>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du site/projet *"
                    value={permitData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="premium-input"
                    required
                  />
                  
                  <textarea
                    placeholder="Adresse complète du site *"
                    value={permitData.site_address}
                    onChange={(e) => handleInputChange('site_address', e.target.value)}
                    className="premium-input"
                    rows={2}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Coordonnées GPS (optionnel)"
                    value={permitData.gps_coordinates}
                    onChange={(e) => handleInputChange('gps_coordinates', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>

              {/* DESCRIPTION DE L'ESPACE */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <Home className="w-5 h-5" />
                  Description de l'Espace Clos
                </h2>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Localisation exacte de l'espace *"
                    value={permitData.space_location}
                    onChange={(e) => handleInputChange('space_location', e.target.value)}
                    className="premium-input"
                    required
                  />
                  
                  <textarea
                    placeholder="Description détaillée de l'espace clos *"
                    value={permitData.space_description}
                    onChange={(e) => handleInputChange('space_description', e.target.value)}
                    className="premium-input"
                    rows={3}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Dimensions approximatives"
                    value={permitData.space_dimensions}
                    onChange={(e) => handleInputChange('space_dimensions', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Points d'accès/sorties"
                    value={permitData.access_points}
                    onChange={(e) => handleInputChange('access_points', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>

              {/* TRAVAIL À EFFECTUER */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <FileText className="w-5 h-5" />
                  Travail à Effectuer
                </h2>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Description détaillée du travail *"
                    value={permitData.work_description}
                    onChange={(e) => handleInputChange('work_description', e.target.value)}
                    className="premium-input"
                    rows={3}
                    required
                  />
                  
                  <input
                    type="text"
                    placeholder="Compagnie contracteur"
                    value={permitData.contractor_company}
                    onChange={(e) => handleInputChange('contractor_company', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Superviseur des travaux"
                    value={permitData.work_supervisor}
                    onChange={(e) => handleInputChange('work_supervisor', e.target.value)}
                    className="premium-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Durée estimée"
                    value={permitData.estimated_duration}
                    onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                    className="premium-input"
                  />
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              
              {/* TESTS ATMOSPHÉRIQUES */}
              <div className="premium-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">
                    <Wind className="w-5 h-5" />
                    Tests Atmosphériques
                  </h2>
                  
                  <div className="flex gap-2">
                    {!bluetoothDevice ? (
                      <button
                        onClick={connectBluetoothDevice}
                        className="premium-button text-sm"
                      >
                        <Bluetooth className="w-3 h-3 mr-1" />
                        Connecter 4-Gaz
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                        <Bluetooth className="w-3 h-3" />
                        <span>{bluetoothDevice.name}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={simulateAtmosphericReading}
                      className="premium-button text-sm"
                      style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                    >
                      Test Manuel
                    </button>
                  </div>
                </div>

                {/* Lecture actuelle */}
                {currentReading && (
                  <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">Lecture Actuelle</span>
                      <span className={`text-sm font-bold status-${currentReading.status}`}>
                        {currentReading.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-cyan-400">
                          {currentReading.oxygen.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Oxygène (O₂)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">
                          {currentReading.lel.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">LEL</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-400">
                          {currentReading.h2s.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">H₂S (ppm)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">
                          {currentReading.co.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">CO (ppm)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historique */}
                <div className="max-h-40 overflow-y-auto">
                  <h4 className="text-sm font-medium text-white mb-2">Historique ({permitData.atmospheric_readings.length})</h4>
                  <div className="space-y-1">
                    {permitData.atmospheric_readings.slice(-5).reverse().map((reading) => (
                      <div key={reading.id} className="flex items-center justify-between text-xs p-2 bg-slate-900/50 rounded">
                        <span className="text-slate-400">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex gap-2">
                          <span>O₂:{reading.oxygen.toFixed(1)}</span>
                          <span>LEL:{reading.lel.toFixed(1)}</span>
                          <span>H₂S:{reading.h2s.toFixed(1)}</span>
                          <span>CO:{reading.co.toFixed(1)}</span>
                        </div>
                        <span className={`status-${reading.status} font-medium`}>
                          {reading.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONDITIONS SPÉCIALES */}
              <div className="premium-card">
                <h2 className="section-title mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Conditions Spéciales & Sécurité
                </h2>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Conditions spéciales, restrictions, précautions particulières..."
                    value={permitData.special_conditions}
                    onChange={(e) => handleInputChange('special_conditions', e.target.value)}
                    className="premium-input"
                    rows={3}
                  />
                  
                  <textarea
                    placeholder="Plan de sauvetage d'urgence..."
                    value={permitData.rescue_plan}
                    onChange={(e) => handleInputChange('rescue_plan', e.target.value)}
                    className="premium-input"
                    rows={3}
                  />
                  
                  <textarea
                    placeholder="Procédures d'urgence spécifiques..."
                    value={permitData.emergency_procedures}
                    onChange={(e) => handleInputChange('emergency_procedures', e.target.value)}
                    className="premium-input"
                    rows={2}
                  />
                </div>
              </div>

              {/* CONTACTS D'URGENCE */}
              <div className="premium-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <h2 className="section-title mb-4" style={{ color: '#ef4444' }}>
                  <Phone className="w-5 h-5" />
                  Contacts d'Urgence
                </h2>
                
                <div className="space-y-3">
                  {regulations.emergency_contacts?.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-800/20 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{contact.name}</div>
                        <div className="text-sm text-red-200">{contact.role}</div>
                      </div>
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="text-lg font-bold text-red-400 hover:text-red-300"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION PERSONNEL */}
          <div className="mt-6">
            <PersonnelManager
              personnel={permitData.personnel}
              onPersonnelChange={handlePersonnelChange}
              texts={texts}
            />
          </div>

          {/* AUTORISATION FINALE */}
          <div className="premium-card mt-6">
            <h2 className="section-title mb-4">
              <Shield className="w-5 h-5" />
              Autorisation Finale
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Autorisé par (nom complet) *"
                value={permitData.authorized_by}
                onChange={(e) => handleInputChange('authorized_by', e.target.value)}
                className="premium-input"
                required
              />
              <input
                type="datetime-local"
                value={permitData.authorization_timestamp}
                onChange={(e) => handleInputChange('authorization_timestamp', e.target.value)}
                className="premium-input"
              />
            </div>

            <SignatureCanvas
              label="Signature d'autorisation finale"
              required
              onSignature={(sig) => handleInputChange('final_signature', sig)}
            />
          </div>

          {/* ACTIONS FINALES */}
          <div className="premium-card">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }));
                  }}
                  className={`premium-button ${timerState.isRunning ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ 
                    background: timerState.isRunning 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #22c55e, #16a34a)' 
                  }}
                >
                  {timerState.isRunning ? (
                    <><Pause className="w-4 h-4 mr-2" /> Suspendre Permis</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Activer Permis</>
                  )}
                </button>
                
                <button
                  onClick={() => onSave?.(permitData)}
                  className="premium-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {texts.savePermit}
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => alert('🚨 ÉVACUATION D\'URGENCE ACTIVÉE')}
                  className="premium-button"
                  style={{ 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    animation: 'pulse 2s infinite',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {texts.emergencyEvacuation}
                </button>
                
                <button
                  onClick={() => onSubmit?.(permitData)}
                  className="premium-button"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {texts.submitPermit}
                </button>
                
                <button
                  onClick={onCancel}
                  className="premium-button-secondary"
                >
                  {texts.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfinedSpacePermit;
