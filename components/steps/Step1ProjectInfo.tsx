'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, BarChart3,
  TrendingUp, Activity, Shield, Bell, Send, MessageSquare, Hash, Star, Globe
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
}

interface WorkLocation {
  id: string;
  name: string;
  description: string;
  zone: string;
  building?: string;
  floor?: string;
  maxWorkers: number;
  currentWorkers: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  estimatedDuration: string;
  startTime?: string;
  endTime?: string;
  coordinates?: { lat: number; lng: number };
}

interface TeamMember {
  id: string;
  name: string;
  company: string;
  role: 'supervisor' | 'worker' | 'observer' | 'specialist';
  phoneNumber: string;
  email?: string;
  certifications: string[];
  location: string;
  signature?: string;
  signatureTimestamp?: string;
}

interface ProjectInfo {
  // Numéro AST unique
  astNumber: string;
  
  // Client et projet
  clientName: string;
  clientRep: string;
  clientPhone: string;
  clientEmail: string;
  projectNumber: string;
  projectName: string;
  
  // Dates et planning
  startDate: string;
  endDate: string;
  estimatedDuration: string;
  
  // Localisation
  workSite: string;
  workAddress: string;
  workZone: string;
  workBuilding: string;
  workFloor: string;
  
  // Équipe
  supervisor: string;
  supervisorPhone: string;
  supervisorEmail: string;
  teamMembers: TeamMember[];
  
  // Emplacements de travail
  workLocations: WorkLocation[];
  
  // Urgence
  emergencyContact: string;
  emergencyPhone: string;
  
  // Description
  workDescription: string;
  workObjectives: string[];
  specialRequirements: string;
  
  // Météo et conditions
  weatherConditions: string;
  temperature: string;
  visibility: string;
  workingConditions: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Informations du Projet",
    subtitle: "Détails généraux et équipe de travail",
    
    // AST
    astNumber: "Numéro AST",
    generateAst: "Générer nouveau numéro",
    astGenerated: "Numéro généré automatiquement",
    
    // Client
    clientSection: "Informations Client",
    clientName: "Nom du client",
    clientRep: "Représentant client",
    clientPhone: "Téléphone client",
    clientEmail: "Email client",
    
    // Projet
    projectSection: "Détails du Projet",
    projectNumber: "Numéro de projet",
    projectName: "Nom du projet",
    startDate: "Date de début",
    endDate: "Date de fin",
    estimatedDuration: "Durée estimée",
    
    // Localisation
    locationSection: "Localisation des Travaux",
    workSite: "Site de travail",
    workAddress: "Adresse complète",
    workZone: "Zone/Secteur",
    workBuilding: "Bâtiment",
    workFloor: "Étage",
    
    // Équipe
    teamSection: "Équipe de Travail",
    supervisor: "Superviseur",
    supervisorPhone: "Téléphone superviseur",
    supervisorEmail: "Email superviseur",
    teamMembers: "Membres de l'équipe",
    addMember: "Ajouter membre",
    removeMember: "Retirer membre",
    
    // Membre équipe
    memberName: "Nom complet",
    memberCompany: "Entreprise",
    memberRole: "Rôle",
    memberPhone: "Téléphone",
    memberEmail: "Email",
    memberCertifications: "Certifications",
    memberLocation: "Emplacement assigné",
    
    // Rôles
    roles: {
      supervisor: "Superviseur",
      worker: "Travailleur",
      observer: "Observateur",
      specialist: "Spécialiste"
    },
    
    // Emplacements
    workLocationsSection: "Emplacements de Travail",
    addLocation: "Ajouter emplacement",
    locationName: "Nom de l'emplacement",
    locationDescription: "Description",
    locationZone: "Zone",
    locationBuilding: "Bâtiment",
    locationFloor: "Étage",
    maxWorkers: "Nombre max de travailleurs",
    estimatedTime: "Temps estimé",
    locationNotes: "Notes",
    
    // Urgence
    emergencySection: "Contacts d'Urgence",
    emergencyContact: "Contact d'urgence",
    emergencyPhone: "Téléphone d'urgence",
    
    // Description
    descriptionSection: "Description des Travaux",
    workDescription: "Description détaillée",
    workObjectives: "Objectifs de travail",
    addObjective: "Ajouter objectif",
    specialRequirements: "Exigences spéciales",
    
    // Conditions
    conditionsSection: "Conditions de Travail",
    weatherConditions: "Conditions météo",
    temperature: "Température",
    visibility: "Visibilité",
    workingConditions: "Conditions générales",
    
    // Actions
    save: "Sauvegarder",
    next: "Suivant",
    copy: "Copier",
    copied: "Copié!",
    generate: "Générer",
    delete: "Supprimer",
    edit: "Modifier",
    
    // Validation
    required: "Champ requis",
    phoneFormat: "Format: 123-456-7890",
    emailFormat: "Format email valide requis",
    
    // Placeholders
    placeholders: {
      clientName: "ex: Hydro-Québec",
      projectNumber: "ex: HQ-2024-001",
      workSite: "ex: Centrale électrique Beauharnois",
      phoneNumber: "ex: 514-123-4567",
      email: "ex: contact@entreprise.com",
      duration: "ex: 8 heures",
      description: "Décrivez en détail les travaux à effectuer...",
      objective: "ex: Maintenance préventive"
    }
  },
  en: {
    title: "Project Information",
    subtitle: "General details and work team",
    
    // AST
    astNumber: "JSA Number",
    generateAst: "Generate new number",
    astGenerated: "Automatically generated number",
    
    // Client
    clientSection: "Client Information",
    clientName: "Client name",
    clientRep: "Client representative",
    clientPhone: "Client phone",
    clientEmail: "Client email",
    
    // Projet
    projectSection: "Project Details",
    projectNumber: "Project number",
    projectName: "Project name",
    startDate: "Start date",
    endDate: "End date",
    estimatedDuration: "Estimated duration",
    
    // Localisation
    locationSection: "Work Location",
    workSite: "Work site",
    workAddress: "Complete address",
    workZone: "Zone/Sector",
    workBuilding: "Building",
    workFloor: "Floor",
    
    // Équipe
    teamSection: "Work Team",
    supervisor: "Supervisor",
    supervisorPhone: "Supervisor phone",
    supervisorEmail: "Supervisor email",
    teamMembers: "Team members",
    addMember: "Add member",
    removeMember: "Remove member",
    
    // Membre équipe
    memberName: "Full name",
    memberCompany: "Company",
    memberRole: "Role",
    memberPhone: "Phone",
    memberEmail: "Email",
    memberCertifications: "Certifications",
    memberLocation: "Assigned location",
    
    // Rôles
    roles: {
      supervisor: "Supervisor",
      worker: "Worker",
      observer: "Observer",
      specialist: "Specialist"
    },
    
    // Emplacements
    workLocationsSection: "Work Locations",
    addLocation: "Add location",
    locationName: "Location name",
    locationDescription: "Description",
    locationZone: "Zone",
    locationBuilding: "Building",
    locationFloor: "Floor",
    maxWorkers: "Max workers",
    estimatedTime: "Estimated time",
    locationNotes: "Notes",
    
    // Urgence
    emergencySection: "Emergency Contacts",
    emergencyContact: "Emergency contact",
    emergencyPhone: "Emergency phone",
    
    // Description
    descriptionSection: "Work Description",
    workDescription: "Detailed description",
    workObjectives: "Work objectives",
    addObjective: "Add objective",
    specialRequirements: "Special requirements",
    
    // Conditions
    conditionsSection: "Working Conditions",
    weatherConditions: "Weather conditions",
    temperature: "Temperature",
    visibility: "Visibility",
    workingConditions: "General conditions",
    
    // Actions
    save: "Save",
    next: "Next",
    copy: "Copy",
    copied: "Copied!",
    generate: "Generate",
    delete: "Delete",
    edit: "Edit",
    
    // Validation
    required: "Required field",
    phoneFormat: "Format: 123-456-7890",
    emailFormat: "Valid email format required",
    
    // Placeholders
    placeholders: {
      clientName: "e.g: Hydro-Quebec",
      projectNumber: "e.g: HQ-2024-001",
      workSite: "e.g: Beauharnois Power Station",
      phoneNumber: "e.g: 514-123-4567",
      email: "e.g: contact@company.com",
      duration: "e.g: 8 hours",
      description: "Describe in detail the work to be performed...",
      objective: "e.g: Preventive maintenance"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step1ProjectInfo = memo(({ 
  formData, 
  onDataChange, 
  language = 'fr', 
  tenant,
  errors = {},
  userId,
  userRole = 'worker'
}: Step1ProjectInfoProps) => {
  const t = translations[language];
  const [localData, setLocalData] = useState<ProjectInfo>(() => ({
    // Initialisation avec données existantes ou valeurs par défaut
    astNumber: formData?.projectInfo?.astNumber || '',
    clientName: formData?.projectInfo?.clientName || '',
    clientRep: formData?.projectInfo?.clientRep || '',
    clientPhone: formData?.projectInfo?.clientPhone || '',
    clientEmail: formData?.projectInfo?.clientEmail || '',
    projectNumber: formData?.projectInfo?.projectNumber || '',
    projectName: formData?.projectInfo?.projectName || '',
    startDate: formData?.projectInfo?.startDate || '',
    endDate: formData?.projectInfo?.endDate || '',
    estimatedDuration: formData?.projectInfo?.estimatedDuration || '',
    workSite: formData?.projectInfo?.workSite || '',
    workAddress: formData?.projectInfo?.workAddress || '',
    workZone: formData?.projectInfo?.workZone || '',
    workBuilding: formData?.projectInfo?.workBuilding || '',
    workFloor: formData?.projectInfo?.workFloor || '',
    supervisor: formData?.projectInfo?.supervisor || '',
    supervisorPhone: formData?.projectInfo?.supervisorPhone || '',
    supervisorEmail: formData?.projectInfo?.supervisorEmail || '',
    teamMembers: formData?.projectInfo?.teamMembers || [],
    workLocations: formData?.projectInfo?.workLocations || [],
    emergencyContact: formData?.projectInfo?.emergencyContact || '',
    emergencyPhone: formData?.projectInfo?.emergencyPhone || '',
    workDescription: formData?.projectInfo?.workDescription || '',
    workObjectives: formData?.projectInfo?.workObjectives || [],
    specialRequirements: formData?.projectInfo?.specialRequirements || '',
    weatherConditions: formData?.projectInfo?.weatherConditions || '',
    temperature: formData?.projectInfo?.temperature || '',
    visibility: formData?.projectInfo?.visibility || '',
    workingConditions: formData?.projectInfo?.workingConditions || ''
  }));

  const [copied, setCopied] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();
  const stableFormDataRef = useRef(localData);

  // Générer numéro AST unique
  const generateASTNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(Date.now()).slice(-4);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const astNumber = `AST-${year}${month}${day}-${time}-${random}`;
    
    updateField('astNumber', astNumber);
  }, []);

  // Copier numéro AST
  const copyASTNumber = useCallback(async () => {
    if (localData.astNumber) {
      try {
        await navigator.clipboard.writeText(localData.astNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erreur copie:', error);
      }
    }
  }, [localData.astNumber]);

  // Mise à jour de champ avec debounce
  const updateField = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      stableFormDataRef.current = updated;
      return updated;
    });
    
    // Debounce pour éviter trop d'appels
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onDataChange('projectInfo', stableFormDataRef.current);
    }, 300);
  }, [onDataChange]);

  // Ajouter membre d'équipe
  const addTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      company: '',
      role: 'worker',
      phoneNumber: '',
      email: '',
      certifications: [],
      location: ''
    };
    
    updateField('teamMembers', [...localData.teamMembers, newMember]);
  }, [localData.teamMembers, updateField]);

  // Supprimer membre d'équipe
  const removeTeamMember = useCallback((memberId: string) => {
    updateField('teamMembers', localData.teamMembers.filter(m => m.id !== memberId));
  }, [localData.teamMembers, updateField]);

  // Mettre à jour membre d'équipe
  const updateTeamMember = useCallback((memberId: string, field: string, value: any) => {
    const updatedMembers = localData.teamMembers.map(member =>
      member.id === memberId ? { ...member, [field]: value } : member
    );
    updateField('teamMembers', updatedMembers);
  }, [localData.teamMembers, updateField]);

  // Ajouter emplacement de travail
  const addWorkLocation = useCallback(() => {
    const newLocation: WorkLocation = {
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      zone: '',
      building: '',
      floor: '',
      maxWorkers: 1,
      currentWorkers: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: '',
      estimatedDuration: ''
    };
    
    updateField('workLocations', [...localData.workLocations, newLocation]);
  }, [localData.workLocations, updateField]);

  // Supprimer emplacement
  const removeWorkLocation = useCallback((locationId: string) => {
    updateField('workLocations', localData.workLocations.filter(l => l.id !== locationId));
  }, [localData.workLocations, updateField]);

  // Mettre à jour emplacement
  const updateWorkLocation = useCallback((locationId: string, field: string, value: any) => {
    const updatedLocations = localData.workLocations.map(location =>
      location.id === locationId ? { ...location, [field]: value } : location
    );
    updateField('workLocations', updatedLocations);
  }, [localData.workLocations, updateField]);

  // Ajouter objectif
  const addObjective = useCallback(() => {
    if (newObjective.trim()) {
      updateField('workObjectives', [...localData.workObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  }, [newObjective, localData.workObjectives, updateField]);

  // Supprimer objectif
  const removeObjective = useCallback((index: number) => {
    updateField('workObjectives', localData.workObjectives.filter((_, i) => i !== index));
  }, [localData.workObjectives, updateField]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Styles communs
  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid rgba(100, 116, 139, 0.3)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t.title}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>
              {t.subtitle}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onDataChange('projectInfo', localData)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              {t.save}
            </button>
          </div>
        </div>

        {/* Numéro AST */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Hash size={20} style={{ color: '#10b981' }} />
            {t.astNumber}
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={localData.astNumber}
              readOnly
              style={{
                ...inputStyle,
                flex: 1,
                background: 'rgba(15, 23, 42, 0.5)',
                cursor: 'default'
              }}
              placeholder={t.astGenerated}
            />
            
            <button
              onClick={generateASTNumber}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Star size={16} />
              {t.generate}
            </button>
            
            {localData.astNumber && (
              <button
                onClick={copyASTNumber}
                style={{
                  background: copied ? '#10b981' : 'rgba(100, 116, 139, 0.2)',
                  color: copied ? 'white' : '#94a3b8',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.copied : t.copy}
              </button>
            )}
          </div>
        </div>

        {/* Grid principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Informations Client */}
          <div style={cardStyle}>
            <h3 style={{
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building size={20} style={{ color: '#3b82f6' }} />
              {t.clientSection}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t.clientName} *</label>
                <input
                  type="text"
                  value={localData.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.clientName}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.clientRep}</label>
                <input
                  type="text"
                  value={localData.clientRep}
                  onChange={(e) => updateField('clientRep', e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.clientPhone}</label>
                  <input
                    type="tel"
                    value={localData.clientPhone}
                    onChange={(e) => updateField('clientPhone', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.phoneNumber}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.clientEmail}</label>
                  <input
                    type="email"
                    value={localData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.email}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Détails du Projet */}
          <div style={cardStyle}>
            <h3 style={{
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={20} style={{ color: '#8b5cf6' }} />
              {t.projectSection}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.projectNumber} *</label>
                  <input
                    type="text"
                    value={localData.projectNumber}
                    onChange={(e) => updateField('projectNumber', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.projectNumber}
                    required
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.estimatedDuration}</label>
                  <input
                    type="text"
                    value={localData.estimatedDuration}
                    onChange={(e) => updateField('estimatedDuration', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.duration}
                  />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>{t.projectName}</label>
                <input
                  type="text"
                  value={localData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.startDate} *</label>
                  <input
                    type="date"
                    value={localData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.endDate}</label>
                  <input
                    type="date"
                    value={localData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Localisation des Travaux */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={20} style={{ color: '#f59e0b' }} />
            {t.locationSection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.workSite} *</label>
              <input
                type="text"
                value={localData.workSite}
                onChange={(e) => updateField('workSite', e.target.value)}
                style={inputStyle}
                placeholder={t.placeholders.workSite}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workAddress}</label>
              <input
                type="text"
                value={localData.workAddress}
                onChange={(e) => updateField('workAddress', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workZone}</label>
              <input
                type="text"
                value={localData.workZone}
                onChange={(e) => updateField('workZone', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workBuilding}</label>
              <input
                type="text"
                value={localData.workBuilding}
                onChange={(e) => updateField('workBuilding', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workFloor}</label>
              <input
                type="text"
                value={localData.workFloor}
                onChange={(e) => updateField('workFloor', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Équipe de Travail */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={20} style={{ color: '#10b981' }} />
              {t.teamSection}
            </h3>
            
            <button
              onClick={addTeamMember}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Plus size={16} />
              {t.addMember}
            </button>
          </div>
          
          {/* Superviseur */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#10b981' }}>{t.supervisor}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <label style={labelStyle}>{t.supervisor} *</label>
                <input
                  type="text"
                  value={localData.supervisor}
                  onChange={(e) => updateField('supervisor', e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.supervisorPhone}</label>
                <input
                  type="tel"
                  value={localData.supervisorPhone}
                  onChange={(e) => updateField('supervisorPhone', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.phoneNumber}
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.supervisorEmail}</label>
                <input
                  type="email"
                  value={localData.supervisorEmail}
                  onChange={(e) => updateField('supervisorEmail', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.email}
                />
              </div>
            </div>
          </div>
          
          {/* Membres de l'équipe */}
          {localData.teamMembers.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {localData.teamMembers.map((member, index) => (
                <div key={member.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: '#e2e8f0' }}>
                      Membre {index + 1}
                    </h5>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={labelStyle}>{t.memberName} *</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberCompany}</label>
                      <input
                        type="text"
                        value={member.company}
                        onChange={(e) => updateTeamMember(member.id, 'company', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberRole}</label>
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="worker">{t.roles.worker}</option>
                        <option value="supervisor">{t.roles.supervisor}</option>
                        <option value="observer">{t.roles.observer}</option>
                        <option value="specialist">{t.roles.specialist}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberPhone}</label>
                      <input
                        type="tel"
                        value={member.phoneNumber}
                        onChange={(e) => updateTeamMember(member.id, 'phoneNumber', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.phoneNumber}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberEmail}</label>
                      <input
                        type="email"
                        value={member.email || ''}
                        onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.email}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberLocation}</label>
                      <select
                        value={member.location}
                        onChange={(e) => updateTeamMember(member.id, 'location', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Sélectionner...</option>
                        {localData.workLocations.map(location => (
                          <option key={location.id} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emplacements de Travail */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={20} style={{ color: '#ef4444' }} />
              {t.workLocationsSection}
            </h3>
            
            <button
              onClick={addWorkLocation}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Plus size={16} />
              {t.addLocation}
            </button>
          </div>
          
          {localData.workLocations.length > 0 && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {localData.workLocations.map((location, index) => (
                <div key={location.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: '#e2e8f0' }}>
                      Emplacement {index + 1}
                    </h5>
                    <button
                      onClick={() => removeWorkLocation(location.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={labelStyle}>{t.locationName} *</label>
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateWorkLocation(location.id, 'name', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.locationZone}</label>
                      <input
                        type="text"
                        value={location.zone}
                        onChange={(e) => updateWorkLocation(location.id, 'zone', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.maxWorkers}</label>
                      <input
                        type="number"
                        min="1"
                        value={location.maxWorkers}
                        onChange={(e) => updateWorkLocation(location.id, 'maxWorkers', parseInt(e.target.value) || 1)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.estimatedTime}</label>
                      <input
                        type="text"
                        value={location.estimatedDuration}
                        onChange={(e) => updateWorkLocation(location.id, 'estimatedDuration', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.duration}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>{t.locationDescription}</label>
                      <textarea
                        value={location.description}
                        onChange={(e) => updateWorkLocation(location.id, 'description', e.target.value)}
                        style={{
                          ...inputStyle,
                          minHeight: '60px',
                          resize: 'vertical'
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts d'Urgence */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Phone size={20} style={{ color: '#dc2626' }} />
            {t.emergencySection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.emergencyContact} *</label>
              <input
                type="text"
                value={localData.emergencyContact}
                onChange={(e) => updateField('emergencyContact', e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.emergencyPhone} *</label>
              <input
                type="tel"
                value={localData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                style={inputStyle}
                placeholder={t.placeholders.phoneNumber}
                required
              />
            </div>
          </div>
        </div>

        {/* Description des Travaux */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={20} style={{ color: '#8b5cf6' }} />
            {t.descriptionSection}
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t.workDescription} *</label>
              <textarea
                value={localData.workDescription}
                onChange={(e) => updateField('workDescription', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                placeholder={t.placeholders.description}
                rows={5}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workObjectives}</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={t.placeholders.objective}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <button
                  onClick={addObjective}
                  disabled={!newObjective.trim()}
                  style={{
                    background: newObjective.trim() ? 
                      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 
                      'rgba(100, 116, 139, 0.3)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: newObjective.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  {t.addObjective}
                </button>
              </div>
              
              {localData.workObjectives.length > 0 && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {localData.workObjectives.map((objective, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <span style={{ color: '#e2e8f0' }}>{objective}</span>
                      <button
                        onClick={() => removeObjective(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '4px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label style={labelStyle}>{t.specialRequirements}</label>
              <textarea
                value={localData.specialRequirements}
                onChange={(e) => updateField('specialRequirements', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Conditions de Travail */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Globe size={20} style={{ color: '#06b6d4' }} />
            {t.conditionsSection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.weatherConditions}</label>
              <select
                value={localData.weatherConditions}
                onChange={(e) => updateField('weatherConditions', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="sunny">Ensoleillé</option>
                <option value="cloudy">Nuageux</option>
                <option value="rainy">Pluvieux</option>
                <option value="snowy">Neigeux</option>
                <option value="windy">Venteux</option>
                <option value="foggy">Brouillard</option>
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>{t.temperature}</label>
              <input
                type="text"
                value={localData.temperature}
                onChange={(e) => updateField('temperature', e.target.value)}
                style={inputStyle}
                placeholder="ex: 15°C"
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.visibility}</label>
              <select
                value={localData.visibility}
                onChange={(e) => updateField('visibility', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="excellent">Excellente</option>
                <option value="good">Bonne</option>
                <option value="moderate">Modérée</option>
                <option value="poor">Faible</option>
                <option value="very-poor">Très faible</option>
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>{t.workingConditions}</label>
              <select
                value={localData.workingConditions}
                onChange={(e) => updateField('workingConditions', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="normal">Normales</option>
                <option value="difficult">Difficiles</option>
                <option value="extreme">Extrêmes</option>
                <option value="hazardous">Dangereuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          padding: '24px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#94a3b8' }} />
            <span style={{ color: '#94a3b8' }}>Étape 1 sur 5</span>
          </div>
          
          <button
            onClick={() => {
              // Sauvegarder avant de passer à l'étape suivante
              onDataChange('projectInfo', localData);
              // Logique pour passer à l'étape suivante
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {t.next}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

Step1ProjectInfo.displayName = 'Step1ProjectInfo';

export default Step1ProjectInfo;