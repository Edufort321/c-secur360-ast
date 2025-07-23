"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye,
  Thermometer, Activity, Volume2, FileText, Phone
} from 'lucide-react';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  province: ProvinceCode;
  language: 'fr' | 'en';
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
}

interface PersonnelRecord {
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor' | 'rescue';
  certification: string;
  certification_expiry: string;
  signature?: string;
  entry_time?: string;
  exit_time?: string;
}

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard';
  gps_location?: { lat: number; lng: number };
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
}

// =================== RÉGLEMENTATIONS PROVINCIALES ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    code: 'RSST Art. 302-317',
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel: {
      attendant_required: true,
      rescue_team_standby: true,
      max_entrants: 2
    },
    documentation: [
      'Permis d\'entrée signé',
      'Tests atmosphériques documentés',
      'Plan de sauvetage approuvé',
      'Équipements vérifiés'
    ]
  },
  ON: {
    name: 'Ontario',
    authority: 'MOL',
    code: 'O. Reg. 632/05',
    atmospheric_testing: {
      frequency_minutes: 10,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    }
  },
  BC: {
    name: 'British Columbia',
    authority: 'WorkSafeBC',
    code: 'Part 9 - Confined Spaces',
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    }
  }
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "Confined Space Entry Permit",
      identification: "Identification",
      personnel: "Personnel",
      atmospheric: "Atmospheric Testing",
      equipment: "Equipment & Safety",
      emergency: "Emergency Procedures",
      signatures: "Electronic Signatures",
      photos: "Photo Documentation",
      projectName: "Project Name",
      location: "Location",
      contractor: "Contractor",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration (hours)",
      spaceDescription: "Space Description",
      hazardsIdentified: "Hazards Identified",
      workDescription: "Work Description",
      entrant: "Entrant",
      attendant: "Attendant", 
      supervisor: "Entry Supervisor",
      rescue: "Rescue Team",
      name: "Name",
      certification: "Certification",
      expiry: "Expiry Date",
      signature: "Electronic Signature",
      currentReading: "Current Reading",
      lastReading: "Last Reading",
      status: "Status",
      safe: "SAFE",
      warning: "WARNING",
      danger: "DANGER",
      oxygen: "Oxygen (O₂)",
      lel: "LEL",
      h2s: "H₂S",
      co: "CO",
      temperature: "Temperature",
      humidity: "Humidity",
      deviceConnected: "Device Connected",
      batteryLevel: "Battery",
      signalStrength: "Signal",
      startTimer: "Start Timer",
      pauseTimer: "Pause Timer",
      resetTimer: "Reset Timer",
      emergencyEvacuation: "EMERGENCY EVACUATION",
      savePermit: "Save Permit",
      submitPermit: "Submit Permit",
      cancel: "Cancel"
    };
  }
  
  return {
    title: "Permis d'Entrée en Espace Clos",
    identification: "Identification",
    personnel: "Personnel",
    atmospheric: "Tests Atmosphériques", 
    equipment: "Équipements & Sécurité",
    emergency: "Procédures d'Urgence",
    signatures: "Signatures Électroniques",
    photos: "Documentation Photo",
    projectName: "Nom du Projet",
    location: "Emplacement",
    contractor: "Contracteur",
    startTime: "Heure de Début",
    endTime: "Heure de Fin",
    duration: "Durée (heures)",
    spaceDescription: "Description de l'Espace",
    hazardsIdentified: "Dangers Identifiés",
    workDescription: "Description du Travail",
    entrant: "Entrant",
    attendant: "Surveillant",
    supervisor: "Superviseur d'Entrée",
    rescue: "Équipe de Sauvetage",
    name: "Nom",
    certification: "Certification",
    expiry: "Date d'Expiration",
    signature: "Signature Électronique",
    currentReading: "Lecture Actuelle",
    lastReading: "Dernière Lecture",
    status: "Statut",
    safe: "SÉCURITAIRE",
    warning: "ATTENTION",
    danger: "DANGER",
    oxygen: "Oxygène (O₂)",
    lel: "LEL",
    h2s: "H₂S", 
    co: "CO",
    temperature: "Température",
    humidity: "Humidité",
    deviceConnected: "Appareil Connecté",
    batteryLevel: "Batterie",
    signalStrength: "Signal",
    startTimer: "Démarrer Timer",
    pauseTimer: "Pause Timer",
    resetTimer: "Reset Timer",
    emergencyEvacuation: "ÉVACUATION D'URGENCE",
    savePermit: "Sauvegarder Permis",
    submitPermit: "Soumettre Permis",
    cancel: "Annuler"
  };
};

// =================== COMPOSANT SIGNATURE ÉLECTRONIQUE ===================
const SignatureCanvas: React.FC<{
  onSignature: (signature: string) => void;
  role: string;
  required?: boolean;
}> = ({ onSignature, role, required = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

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
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">
          {role} {required && <span className="text-red-400">*</span>}
        </span>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleString()}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="w-full border border-slate-600 rounded bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearSignature}
          className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-500"
        >
          <RotateCcw className="w-3 h-3 mr-1 inline" />
          Effacer
        </button>
        <button
          onClick={saveSignature}
          disabled={isEmpty}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-3 h-3 mr-1 inline" />
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

// =================== COMPOSANT CAPTURE PHOTO ===================
const PhotoCapture: React.FC<{
  onPhoto: (photo: PhotoRecord) => void;
  category: PhotoRecord['category'];
  photos: PhotoRecord[];
}> = ({ onPhoto, category, photos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = async (file: File) => {
    const url = URL.createObjectURL(file);
    
    // Géolocalisation si disponible
    const location = await new Promise<{ lat: number; lng: number } | undefined>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          () => resolve(undefined),
          { timeout: 5000 }
        );
      } else {
        resolve(undefined);
      }
    });

    const photo: PhotoRecord = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      caption: `Photo ${category} - ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      category,
      gps_location: location
    };

    onPhoto(photo);
  };

  const categoryPhotos = photos.filter(p => p.category === category);

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white capitalize">
          Photos - {category}
        </span>
        <span className="text-xs text-slate-400">
          {categoryPhotos.length}/5
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) capturePhoto(file);
        }}
        className="hidden"
      />

      {categoryPhotos.length < 5 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3 border-2 border-dashed border-slate-600 rounded hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
        >
          <Camera className="w-5 h-5 mx-auto mb-1" />
          Prendre une photo
        </button>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3">
        {categoryPhotos.map(photo => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-16 object-cover rounded border border-slate-600"
            />
            {photo.gps_location && (
              <MapPin className="absolute top-1 right-1 w-3 h-3 text-green-400" />
            )}
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
    // Identification
    project_name: initialData?.project_name || '',
    location: initialData?.location || '',
    contractor: initialData?.contractor || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    duration: initialData?.duration || 8,
    space_description: initialData?.space_description || '',
    hazards_identified: initialData?.hazards_identified || '',
    work_description: initialData?.work_description || '',
    
    // Personnel
    personnel: initialData?.personnel || {
      entrant: { name: '', certification: '', certification_expiry: '', signature: '' },
      attendant: { name: '', certification: '', certification_expiry: '', signature: '' },
      supervisor: { name: '', certification: '', certification_expiry: '', signature: '' }
    },
    
    // Tests atmosphériques
    atmospheric_readings: initialData?.atmospheric_readings || [] as AtmosphericReading[],
    
    // Photos
    photos: initialData?.photos || [] as PhotoRecord[]
  });

  // =================== TIMER ET MONITORING ===================
  const [timerState, setTimerState] = useState({
    elapsed: 0,
    isRunning: false,
    lastTestTime: 0
  });

  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [currentReading, setCurrentReading] = useState<AtmosphericReading | null>(null);

  // Timer principal
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState(prev => {
        const newElapsed = prev.elapsed + 1;
        const testInterval = regulations.atmospheric_testing.frequency_minutes * 60;
        
        // Notification de test requis
        if (newElapsed % testInterval === 0 && newElapsed > 0) {
          alert(`🌬️ Test atmosphérique requis (${regulations.atmospheric_testing.frequency_minutes}min)`);
        }

        return { ...prev, elapsed: newElapsed };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, regulations.atmospheric_testing.frequency_minutes]);

  // =================== SIMULATION BLUETOOTH 4-GAZ ===================
  const simulateBluetoothReading = useCallback(() => {
    const reading: AtmosphericReading = {
      id: `reading_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oxygen: Math.random() * 2 + 20.5, // 20.5-22.5%
      lel: Math.random() * 5, // 0-5%
      h2s: Math.random() * 5, // 0-5 ppm
      co: Math.random() * 15, // 0-15 ppm
      temperature: Math.random() * 10 + 20, // 20-30°C
      humidity: Math.random() * 20 + 40, // 40-60%
      status: 'safe',
      device_id: 'BW-GasAlert-001',
      location: permitData.location
    };

    // Déterminer le statut
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
  }, [permitData.location, regulations.atmospheric_testing.limits]);

  // =================== HANDLERS ===================
  const handleInputChange = (section: string, field: string, value: any) => {
    setPermitData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handlePersonnelChange = (role: string, field: string, value: string) => {
    setPermitData(prev => ({
      ...prev,
      personnel: {
        ...prev.personnel,
        [role]: {
          ...prev.personnel[role],
          [field]: value
        }
      }
    }));
  };

  const handleSignature = (role: string, signature: string) => {
    handlePersonnelChange(role, 'signature', signature);
  };

  const handlePhoto = (photo: PhotoRecord) => {
    setPermitData(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  const connectBluetoothDevice = async () => {
    // Simulation connexion Bluetooth
    setBluetoothDevice({
      id: 'BW-GasAlert-001',
      name: 'BW GasAlert Quattro',
      connected: true,
      battery: 85,
      signal: 95
    });
    
    // Démarrer les lectures automatiques
    const readingInterval = setInterval(simulateBluetoothReading, 30000); // Toutes les 30s
    
    return () => clearInterval(readingInterval);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // =================== RENDU ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER AVEC TIMER */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{texts.title}</h1>
                <p className="text-red-200">{regulations.name} - {regulations.code}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-mono text-green-400">
                {formatTime(timerState.elapsed)}
              </div>
              <div className="text-sm text-slate-400">Temps écoulé</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white">{province}</div>
              <div className="text-xs text-slate-400">Province</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-blue-400">
                {regulations.atmospheric_testing.frequency_minutes}min
              </div>
              <div className="text-xs text-slate-400">Fréq. Tests</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {permitData.atmospheric_readings.length}
              </div>
              <div className="text-xs text-slate-400">Tests Effectués</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    timerState.isRunning 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {timerState.isRunning ? (
                    <><Pause className="w-3 h-3 mr-1 inline" /> Pause</>
                  ) : (
                    <><Play className="w-3 h-3 mr-1 inline" /> Start</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLONNE GAUCHE */}
          <div className="space-y-6">
            
            {/* SECTION IDENTIFICATION */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {texts.identification}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.projectName} *
                  </label>
                  <input
                    type="text"
                    value={permitData.project_name}
                    onChange={(e) => handleInputChange('project_name', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.location} *
                  </label>
                  <input
                    type="text"
                    value={permitData.location}
                    onChange={(e) => handleInputChange('location', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.contractor}
                  </label>
                  <input
                    type="text"
                    value={permitData.contractor}
                    onChange={(e) => handleInputChange('contractor', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {texts.startTime}
                    </label>
                    <input
                      type="datetime-local"
                      value={permitData.start_time}
                      onChange={(e) => handleInputChange('start_time', '', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {texts.duration}
                    </label>
                    <input
                      type="number"
                      value={permitData.duration}
                      onChange={(e) => handleInputChange('duration', '', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      min="1"
                      max="24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.spaceDescription}
                  </label>
                  <textarea
                    value={permitData.space_description}
                    onChange={(e) => handleInputChange('space_description', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.hazardsIdentified}
                  </label>
                  <textarea
                    value={permitData.hazards_identified}
                    onChange={(e) => handleInputChange('hazards_identified', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* SECTION PERSONNEL */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {texts.personnel}
              </h2>

              <div className="space-y-6">
                {['entrant', 'attendant', 'supervisor'].map((role) => (
                  <div key={role}>
                    <h3 className="text-lg font-medium text-white mb-3">
                      {texts[role as keyof typeof texts]}
                      {role !== 'supervisor' && <span className="text-red-400 ml-1">*</span>}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">{texts.name}</label>
                        <input
                          type="text"
                          value={permitData.personnel[role]?.name || ''}
                          onChange={(e) => handlePersonnelChange(role, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                          required={role !== 'supervisor'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">{texts.certification}</label>
                        <input
                          type="text"
                          value={permitData.personnel[role]?.certification || ''}
                          onChange={(e) => handlePersonnelChange(role, 'certification', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <SignatureCanvas
                      role={texts[role as keyof typeof texts]}
                      onSignature={(sig) => handleSignature(role, sig)}
                      required={role !== 'supervisor'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-6">
            
            {/* SECTION TESTS ATMOSPHÉRIQUES */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  {texts.atmospheric}
                </h2>
                
                <div className="flex gap-2">
                  {!bluetoothDevice ? (
                    <button
                      onClick={connectBluetoothDevice}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Bluetooth className="w-3 h-3 mr-1 inline" />
                      Connecter 4-Gaz
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      <Bluetooth className="w-3 h-3" />
                      <span>{bluetoothDevice.name}</span>
                      <Battery className="w-3 h-3" />
                      <span>{bluetoothDevice.battery}%</span>
                    </div>
                  )}
                  
                  <button
                    onClick={simulateBluetoothReading}
                    className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                  >
                    Test Manuel
                  </button>
                </div>
              </div>

              {/* Lecture actuelle */}
              {currentReading && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{texts.currentReading}</span>
                    <span className={`text-sm font-bold ${getStatusColor(currentReading.status)}`}>
                      {texts[currentReading.status as keyof typeof texts]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {currentReading.oxygen.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.oxygen}</div>
                      <div className="text-xs text-slate-500">
                        {regulations.atmospheric_testing.limits.oxygen.min}-{regulations.atmospheric_testing.limits.oxygen.max}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {currentReading.lel.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.lel}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.lel.max}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {currentReading.h2s.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{texts.h2s}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.h2s.max}ppm
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {currentReading.co.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{texts.co}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.co.max}ppm
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {currentReading.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-slate-400">{texts.temperature}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {currentReading.humidity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.humidity}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique des lectures */}
              <div className="max-h-60 overflow-y-auto">
                <h3 className="text-lg font-medium text-white mb-3">Historique des Tests</h3>
                <div className="space-y-2">
                  {permitData.atmospheric_readings.slice(-10).reverse().map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <span className="text-xs text-slate-400">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span>O₂: {reading.oxygen.toFixed(1)}%</span>
                        <span>LEL: {reading.lel.toFixed(1)}%</span>
                        <span>H₂S: {reading.h2s.toFixed(1)}</span>
                        <span>CO: {reading.co.toFixed(1)}</span>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(reading.status)}`}>
                        {reading.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION PHOTOS */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {texts.photos}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="before"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="equipment"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="during"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="after"
                  photos={permitData.photos}
                />
              </div>
            </div>

            {/* CONTACTS D'URGENCE */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacts d'Urgence
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">Services d'Urgence</div>
                    <div className="text-sm text-red-200">Police, Ambulance, Pompiers</div>
                  </div>
                  <a href="tel:911" className="text-2xl font-bold text-red-400">911</a>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">CNESST Urgence</div>
                    <div className="text-sm text-red-200">Accidents de travail</div>
                  </div>
                  <a href="tel:1-844-838-0808" className="text-lg font-bold text-red-400">1-844-838-0808</a>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">Centre Anti-Poison</div>
                    <div className="text-sm text-red-200">Intoxications</div>
                  </div>
                  <a href="tel:1-800-463-5060" className="text-lg font-bold text-red-400">1-800-463-5060</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS FINALES */}
        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => onSave?.(permitData)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {texts.savePermit}
              </button>
              
              <button
                onClick={() => onSubmit?.(permitData)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {texts.submitPermit}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => alert('🚨 ÉVACUATION IMMÉDIATE ACTIVÉE')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                {texts.emergencyEvacuation}
              </button>
              
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                {texts.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpacePermit;
