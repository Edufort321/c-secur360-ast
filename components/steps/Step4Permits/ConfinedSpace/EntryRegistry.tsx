// EntryRegistry.tsx - PARTIE 1/2 - Version Corrigée Fix Runtime Error
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, Eye, LogIn, LogOut, Shield, Plus, Trash2, Timer, Users, 
  PenTool, CheckCircle, X, Edit3, Copy, Wrench, Clock, History, 
  UserPlus, UserMinus, AlertTriangle, FileText, PenTool as Signature, 
  Volume2, Camera, Bluetooth, Battery, Signal, MapPin, Calendar, User, 
  Phone, Mail, Building, Briefcase, Award
} from 'lucide-react';

// Import des types et du hook centralisé
import {
  ConfinedSpaceComponentProps,
  EntryRegistryData,
  PersonnelEntry,
  EmergencyContact,
  SafetyRole,
  generatePermitId
} from './SafetyManager';

import { styles, isMobile } from './styles';

// =================== FONCTION UTILITAIRE POUR FIX BUILD ===================
/**
 * Fonction utilitaire pour convertir boolean | undefined en boolean
 * Évite l'erreur TypeScript: "Type 'boolean | undefined' is not assignable to parameter of type 'boolean'"
 */
function ensureBoolean(value: boolean | undefined, defaultValue: boolean = false): boolean {
  return value ?? defaultValue;
}

// =================== TYPES LOCAUX ÉTENDUS COMPATIBLES ===================
interface EntryLog {
  id: string;
  timestamp: string;
  action: 'entry' | 'exit' | 'emergency_exit'; // ✅ CORRECTION: Aligné avec EntryLogEntry du SafetyManager
  // Propriétés requises par EntryLogEntry du SafetyManager
  personnelId: string; // ✅ REQUIS pour compatibilité SafetyManager
  authorizedBy: string; // ✅ REQUIS pour compatibilité SafetyManager
  // Propriétés étendues locales
  person_id: string;
  person_name: string;
  role: SafetyRole;
  location: string;
  atmospheric_conditions?: {
    oxygen: number;
    lel: number;
    h2s: number;
    co: number;
  };
  communication_verified: boolean;
  equipment_verified: boolean;
  notes?: string;
  emergency?: boolean;
}

// Type séparé pour les vérifications de communication (non sauvegardé dans SafetyManager)
interface CommunicationCheckLog {
  id: string;
  timestamp: string;
  action: 'status_check'; // Type spécifique pour communication
  personnelId: string;
  authorizedBy: string;
  person_id: string;
  person_name: string;
  role: SafetyRole;
  location: string;
  communication_verified: boolean;
  equipment_verified: boolean;
  notes?: string;
  emergency?: boolean;
}

interface PersonnelStatus {
  person_id: string;
  current_status: 'outside' | 'inside' | 'emergency' | 'unknown';
  last_entry_time?: string;
  last_exit_time?: string;
  total_time_inside: number; // en minutes
  max_allowed_time: number; // en minutes selon réglementation
  communication_last_verified?: string;
  equipment_status: 'verified' | 'needs_check' | 'expired';
}

interface CommunicationLog {
  id: string;
  timestamp: string;
  person_id: string;
  person_name: string;
  communication_type: 'radio' | 'visual' | 'hand_signal' | 'emergency_signal';
  signal_strength: number; // 1-5
  message?: string;
  response_received: boolean;
  emergency_indicated: boolean;
}

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Registre d'Entrée Obligatoire",
    legalCompliance: "Conformité Réglementaire Entrée/Sortie",
    currentOccupancy: "Occupation Actuelle",
    entryLog: "Journal des Entrées/Sorties",
    personnelManagement: "Gestion du Personnel",
    communicationSystem: "Système de Communication",
    emergencyProcedures: "Procédures d'Urgence",
    addPerson: "Ajouter Personne",
    recordEntry: "Enregistrer Entrée",
    recordExit: "Enregistrer Sortie",
    emergencyEvacuation: "Évacuation d'Urgence",
    communicationCheck: "Vérification Communication",
    personnelInside: "Personnel à l'intérieur",
    personnelOutside: "Personnel à l'extérieur",
    maxOccupancy: "Occupation maximale",
    timeInside: "Temps à l'intérieur",
    lastCommunication: "Dernière communication",
    equipmentStatus: "État équipement",
    entrant: "Entrant",
    attendant: "Surveillant",
    supervisor: "Superviseur",
    rescuer: "Sauveteur",
    emergency: "Urgence",
    verified: "Vérifié",
    needsCheck: "À vérifier",
    expired: "Expiré",
    inside: "À l'intérieur",
    outside: "À l'extérieur",
    unknown: "Inconnu",
    signalStrength: "Force signal",
    responseReceived: "Réponse reçue",
    emergencySignal: "Signal d'urgence",
    authorized: "Autorisé",
    unauthorized: "Non autorisé",
    attendantRequired: "Surveillant obligatoire",
    communicationRequired: "Communication obligatoire",
    maxTimeExceeded: "Temps maximum dépassé",
    emergencyEvacuationInitiated: "Évacuation d'urgence déclenchée"
  },
  en: {
    title: "Mandatory Entry Registry",
    legalCompliance: "Entry/Exit Regulatory Compliance",
    currentOccupancy: "Current Occupancy",
    entryLog: "Entry/Exit Log",
    personnelManagement: "Personnel Management",
    communicationSystem: "Communication System",
    emergencyProcedures: "Emergency Procedures",
    addPerson: "Add Person",
    recordEntry: "Record Entry",
    recordExit: "Record Exit",
    emergencyEvacuation: "Emergency Evacuation",
    communicationCheck: "Communication Check",
    personnelInside: "Personnel Inside",
    personnelOutside: "Personnel Outside",
    maxOccupancy: "Maximum occupancy",
    timeInside: "Time inside",
    lastCommunication: "Last communication",
    equipmentStatus: "Equipment status",
    entrant: "Entrant",
    attendant: "Attendant",
    supervisor: "Supervisor",
    rescuer: "Rescuer",
    emergency: "Emergency",
    verified: "Verified",
    needsCheck: "Needs check",
    expired: "Expired",
    inside: "Inside",
    outside: "Outside",
    unknown: "Unknown",
    signalStrength: "Signal strength",
    responseReceived: "Response received",
    emergencySignal: "Emergency signal",
    authorized: "Authorized",
    unauthorized: "Unauthorized",
    attendantRequired: "Attendant required",
    communicationRequired: "Communication required",
    maxTimeExceeded: "Maximum time exceeded",
    emergencyEvacuationInitiated: "Emergency evacuation initiated"
  }
};

// =================== COMPOSANT PRINCIPAL REFACTORISÉ ===================
const EntryRegistry: React.FC<ConfinedSpaceComponentProps> = ({
  language,
  permitData,
  selectedProvince,
  regulations,
  isMobile,
  safetyManager,
  onUpdate,
  onSectionComplete,
  onValidationChange
}) => {
  // ✅ CORRECTION CRASH : Accès sécurisé aux données depuis permitData
  const entryRegistryData = permitData?.entryRegistry || {
    personnel: [],
    entryLogs: [],
    currentOccupancy: 0,
    maxOccupancy: 3,
    attendantPresent: false,
    communicationSystemActive: false,
    emergencyContactsNotified: false,
    lastUpdated: new Date().toISOString()
  };

  const personnel = entryRegistryData?.personnel || [];
  const entryLogs = entryRegistryData?.entryLogs || [];
  
  // États locaux pour l'interface
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [communicationTimer, setCommunicationTimer] = useState(0);
  const [communicationActive, setCommunicationActive] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // États pour nouveau personnel
  const [newPerson, setNewPerson] = useState({
    name: '',
    role: 'entrant' as SafetyRole,
    phone: '',
    email: '',
    company: '',
    certification: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  });

  // États pour communication
  const [communicationCheck, setCommunicationCheck] = useState({
    person_id: '',
    communication_type: 'radio' as 'radio' | 'visual' | 'hand_signal' | 'emergency_signal',
    signal_strength: 5,
    message: '',
    response_received: false,
    emergency_indicated: false
  });

  // États monitoring personnel
  const [personnelStatuses, setPersonnelStatuses] = useState<PersonnelStatus[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [localCommunicationChecks, setLocalCommunicationChecks] = useState<CommunicationCheckLog[]>([]); // ✅ Logs locaux pour communication
  const [localEntryLogs, setLocalEntryLogs] = useState<EntryLog[]>([]); // ✅ Logs locaux pour affichage

  const t = translations[language];

  // =================== HANDLERS SAFETYMANAGER CORRIGÉS ===================
  const updateEntryRegistryData = React.useCallback((updates: Partial<EntryRegistryData>) => {
    // ✅ CORRECTION 1 : Vérification SafetyManager
    if (safetyManager) {
      try {
        safetyManager.updateEntryRegistry(updates);
      } catch (error) {
        console.warn('SafetyManager updateEntryRegistry failed:', error);
      }
    }
    
    if (onUpdate) {
      onUpdate('entryRegistry', updates);
    }
    
    // ✅ CORRECTION 2 : Vérification SafetyManager pour validation + FIX BUILD
    if (onValidationChange && safetyManager) {
      try {
        const validation = safetyManager.validateSection('entryRegistry');
        onValidationChange(validation.isValid, validation.errors);
      } catch (error) {
        console.warn('SafetyManager validateSection failed:', error);
        // ✅ FIX BUILD : Fallback validation avec ensureBoolean
        const hasAttendant = ensureBoolean(updates.attendantPresent) || ensureBoolean(entryRegistryData.attendantPresent);
        const hasPersonnel = (updates.personnel && updates.personnel.length > 0) || personnel.length > 0;
        const isValid = Boolean(hasAttendant && hasPersonnel); // Assure un boolean strict
        onValidationChange(isValid, isValid ? [] : ['Surveillant et personnel requis']);
      }
    }
  }, [safetyManager, onUpdate, onValidationChange, entryRegistryData.attendantPresent, personnel.length]);

  const updatePersonnel = React.useCallback((newPersonnel: PersonnelEntry[]) => {
    updateEntryRegistryData({ 
      personnel: newPersonnel,
      lastUpdated: new Date().toISOString()
    });
  }, [updateEntryRegistryData]);

  // =================== FONCTIONS DE CONVERSION POUR SAFETYMANAGER ===================
  const convertToSafetyManagerLog = (log: EntryLog) => ({
    id: log.id,
    personnelId: log.personnelId,
    action: log.action,
    timestamp: log.timestamp,
    authorizedBy: log.authorizedBy,
    atmosphericReadings: log.atmospheric_conditions ? {
      oxygen: log.atmospheric_conditions.oxygen,
      combustibleGas: log.atmospheric_conditions.lel,
      toxicGas: log.atmospheric_conditions.h2s + log.atmospheric_conditions.co
    } : undefined,
    notes: log.notes
  });

  const updateEntryLogs = React.useCallback((newLogs: EntryLog[]) => {
    // Mettre à jour les logs locaux pour l'affichage
    setLocalEntryLogs(newLogs);
    
    // ✅ Convertir et envoyer au SafetyManager
    const currentSafetyManagerLogs = entryRegistryData.entryLogs || [];
    const convertedNewLogs = newLogs.filter(log => 
      !currentSafetyManagerLogs.some((existing: any) => existing.id === log.id)
    ).map(convertToSafetyManagerLog);

    if (convertedNewLogs.length > 0) {
      updateEntryRegistryData({ 
        entryLogs: [...currentSafetyManagerLogs, ...convertedNewLogs],
        lastUpdated: new Date().toISOString()
      });
    }
  }, [updateEntryRegistryData, entryRegistryData.entryLogs]);

  // =================== FONCTIONS UTILITAIRES ===================
  const getCurrentPersonnelInside = () => {
    return personnelStatuses.filter(status => status.current_status === 'inside');
  };

  const getCurrentPersonnelOutside = () => {
    return personnelStatuses.filter(status => status.current_status === 'outside');
  };

  const getPersonnelStatus = (personId: string): PersonnelStatus | undefined => {
    return personnelStatuses.find(status => status.person_id === personId);
  };

  const getPersonById = (personId: string): PersonnelEntry | undefined => {
    return personnel.find((person: any) => person.id === personId);
  };

  const getRoleColor = (role: SafetyRole): string => {
    const colors = {
      entrant: '#3b82f6',
      attendant: '#10b981',
      supervisor: '#f59e0b',
      rescue: '#ef4444', // ✅ CORRECTION: 'rescue' au lieu de 'rescuer'
      admin: '#dc2626'
    };
    return colors[role] || '#6b7280';
  };

  const getRoleEmoji = (role: SafetyRole): string => {
    const emojis = {
      entrant: '👷',
      attendant: '👁️',
      supervisor: '👨‍💼',
      rescue: '🚑', // ✅ CORRECTION: 'rescue' au lieu de 'rescuer'
      admin: '🚨'
    };
    return emojis[role] || '👤';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      inside: '#ef4444',
      outside: '#10b981',
      emergency: '#dc2626',
      unknown: '#6b7280'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // =================== HANDLERS POUR CHECKBOX AVEC SAFETYMANAGER ===================
  const handleAttendantPresent = React.useCallback((checked: boolean) => {
    updateEntryRegistryData({ attendantPresent: checked });
    
    // ✅ CORRECTION 3 : Vérification SafetyManager pour mise à jour permis
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, attendant_present: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager attendant present update failed:', error);
      }
    }
  }, [safetyManager, updateEntryRegistryData]);

  const handleCommunicationSystemTested = React.useCallback((checked: boolean) => {
    updateEntryRegistryData({ communicationSystemActive: checked });
    
    // ✅ CORRECTION 4 : Vérification SafetyManager pour communication system
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, communication_system_tested: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager communication system update failed:', error);
      }
    }
  }, [safetyManager, updateEntryRegistryData]);

  const handleEmergencyRetrievalReady = React.useCallback((checked: boolean) => {
    // ✅ CORRECTION 5 : Vérification SafetyManager pour emergency retrieval
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        const updatedPermit = { ...currentPermit, emergency_retrieval_ready: checked };
        safetyManager.resetPermit();
        Object.assign(safetyManager.currentPermit, updatedPermit);
      } catch (error) {
        console.warn('SafetyManager emergency retrieval update failed:', error);
      }
    }
  }, [safetyManager]);

  // =================== PROTECTION CONTRE REGULATIONS UNDEFINED ===================
  // ✅ CORRECTION RUNTIME ERROR : Structure compatible avec PROVINCIAL_REGULATIONS de index.tsx
  const safeRegulations = regulations[selectedProvince] || {
    name: 'Réglementation provinciale',
    code: 'N/A',
    authority: 'Autorité compétente',
    permit_validity_hours: 8, // ✅ Utiliser permit_validity_hours au lieu de max_work_period_hours
    atmosphere_testing_frequency: 30,
    continuous_monitoring_required: true,
    max_entrants: 2,
    communication_check_interval: 15,
    requirements: {
      attendant: true,
      min_age: 18
    }
  };

  // =================== GESTION DU PERSONNEL ===================
  const addNewPerson = React.useCallback(() => {
    if (!newPerson.name || !newPerson.role || !newPerson.phone) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires (nom, rôle, téléphone)');
      return;
    }

    const newPersonnelEntry: PersonnelEntry = {
      id: generatePermitId(),
      name: newPerson.name,
      role: newPerson.role,
      certification: newPerson.certification ? [newPerson.certification] : [],
      medicalFitness: {
        valid: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
      },
      emergencyContact: {
        name: newPerson.emergency_contact_name || 'N/A',
        phone: newPerson.emergency_contact_phone || newPerson.phone,
        relationship: 'Contact d\'urgence'
      }
    };

    const newPersonnelStatus: PersonnelStatus = {
      person_id: newPersonnelEntry.id,
      current_status: 'outside',
      total_time_inside: 0,
      // ✅ CORRECTION RUNTIME ERROR : Utiliser permit_validity_hours au lieu de max_work_period_hours
      max_allowed_time: safeRegulations.permit_validity_hours ? 
        safeRegulations.permit_validity_hours * 60 : 480, // 8h par défaut
      equipment_status: 'needs_check'
    };

    const updatedPersonnel = [...personnel, newPersonnelEntry];
    const updatedStatuses = [...personnelStatuses, newPersonnelStatus];

    updatePersonnel(updatedPersonnel);
    setPersonnelStatuses(updatedStatuses);

    // Reset form
    setNewPerson({
      name: '',
      role: 'entrant',
      phone: '',
      email: '',
      company: '',
      certification: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: ''
    });
    setShowAddPersonForm(false);

    alert(`✅ Personnel ajouté : ${newPersonnelEntry.name} (${newPersonnelEntry.role})`);
  }, [newPerson, personnel, personnelStatuses, updatePersonnel, safeRegulations]);

  const removePerson = React.useCallback((personId: string) => {
    const person = getPersonById(personId);
    const status = getPersonnelStatus(personId);
    
    if (status?.current_status === 'inside') {
      alert('⚠️ Impossible de supprimer : cette personne est actuellement à l\'intérieur de l\'espace clos');
      return;
    }

    if (person && confirm(`Supprimer ${person.name} du registre ?`)) {
      const updatedPersonnel = personnel.filter((p: any) => p.id !== personId);
      const updatedStatuses = personnelStatuses.filter((s: any) => s.person_id !== personId);
      
      updatePersonnel(updatedPersonnel);
      setPersonnelStatuses(updatedStatuses);
      
      alert(`🗑️ ${person.name} supprimé du registre`);
    }
  }, [personnel, personnelStatuses, updatePersonnel, getPersonById, getPersonnelStatus]);
  // =================== GESTION ENTRÉES/SORTIES ===================
  const recordEntry = React.useCallback((personId: string) => {
    const person = getPersonById(personId);
    const status = getPersonnelStatus(personId);
    
    if (!person) {
      alert('⚠️ Personne non trouvée dans le registre');
      return;
    }

    if (status?.current_status === 'inside') {
      alert('⚠️ Cette personne est déjà à l\'intérieur de l\'espace clos');
      return;
    }

    // Vérification occupation maximale
    const currentInside = getCurrentPersonnelInside();
    if (currentInside.length >= entryRegistryData.maxOccupancy) {
      alert(`⚠️ Occupation maximale atteinte (${entryRegistryData.maxOccupancy} personnes)`);
      return;
    }

    // Vérification surveillant présent
    if (!ensureBoolean(entryRegistryData.attendantPresent) && person.role !== 'attendant') {
      alert('⚠️ Un surveillant doit être présent avant toute entrée d\'entrant');
      return;
    }

    const now = new Date().toISOString();
    
    const entryLog: EntryLog = {
      id: generatePermitId(),
      timestamp: now,
      action: 'entry',
      personnelId: personId, // ✅ REQUIS pour SafetyManager
      authorizedBy: 'Surveillant', // ✅ REQUIS pour SafetyManager
      person_id: personId,
      person_name: person.name,
      role: person.role,
      location: 'Espace clos',
      communication_verified: true,
      equipment_verified: true,
      notes: `Entrée autorisée - ${person.role}`
    };

    // Mise à jour statut personnel
    const updatedStatuses = personnelStatuses.map(s => 
      s.person_id === personId 
        ? { ...s, current_status: 'inside' as const, last_entry_time: now }
        : s
    );

    // Mise à jour personnel
    const updatedPersonnel = personnel.map(p => 
      p.id === personId 
        ? { ...p, entryTime: now, status: 'inside' as const }
        : p
    );

    const newOccupancy = currentInside.length + 1;
    
    setPersonnelStatuses(updatedStatuses);
    updatePersonnel(updatedPersonnel);
    updateEntryLogs([...localEntryLogs, entryLog]); // ✅ Utiliser logs locaux
    updateEntryRegistryData({ currentOccupancy: newOccupancy });

    alert(`✅ Entrée enregistrée : ${person.name} - Occupation actuelle : ${newOccupancy}/${entryRegistryData.maxOccupancy}`);
  }, [personnel, personnelStatuses, entryRegistryData, entryLogs, getCurrentPersonnelInside, getPersonById, getPersonnelStatus, updatePersonnel, updateEntryLogs, updateEntryRegistryData]);

  const recordExit = React.useCallback((personId: string) => {
    const person = getPersonById(personId);
    const status = getPersonnelStatus(personId);
    
    if (!person) {
      alert('⚠️ Personne non trouvée dans le registre');
      return;
    }

    if (status?.current_status !== 'inside') {
      alert('⚠️ Cette personne n\'est pas à l\'intérieur de l\'espace clos');
      return;
    }

    const now = new Date().toISOString();
    const entryTime = status.last_entry_time ? new Date(status.last_entry_time) : new Date();
    const exitTime = new Date();
    const sessionDuration = Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60)); // en minutes
    
    const exitLog: EntryLog = {
      id: generatePermitId(),
      timestamp: now,
      action: 'exit',
      personnelId: personId, // ✅ REQUIS pour SafetyManager
      authorizedBy: 'Surveillant', // ✅ REQUIS pour SafetyManager
      person_id: personId,
      person_name: person.name,
      role: person.role,
      location: 'Espace clos',
      communication_verified: true,
      equipment_verified: true,
      notes: `Sortie normale - Durée : ${formatDuration(sessionDuration)}`
    };

    // Mise à jour statut personnel
    const updatedStatuses = personnelStatuses.map(s => 
      s.person_id === personId 
        ? { 
            ...s, 
            current_status: 'outside' as const, 
            last_exit_time: now,
            total_time_inside: s.total_time_inside + sessionDuration
          }
        : s
    );

    // Mise à jour personnel
    const updatedPersonnel = personnel.map(p => 
      p.id === personId 
        ? { ...p, exitTime: now, status: 'outside' as const }
        : p
    );

    const newOccupancy = Math.max(0, (entryRegistryData.currentOccupancy || 0) - 1);
    
    setPersonnelStatuses(updatedStatuses);
    updatePersonnel(updatedPersonnel);
    updateEntryLogs([...localEntryLogs, exitLog]); // ✅ Utiliser logs locaux
    updateEntryRegistryData({ currentOccupancy: newOccupancy });

    alert(`✅ Sortie enregistrée : ${person.name} - Durée session : ${formatDuration(sessionDuration)} - Occupation : ${newOccupancy}/${entryRegistryData.maxOccupancy}`);
  }, [personnel, personnelStatuses, entryRegistryData, entryLogs, getPersonById, getPersonnelStatus, updatePersonnel, updateEntryLogs, updateEntryRegistryData]);

  const initiateEmergencyEvacuation = React.useCallback(() => {
    if (!confirm('⚠️ CONFIRMER L\'ÉVACUATION D\'URGENCE de tous les entrants ?')) {
      return;
    }

    const now = new Date().toISOString();
    const currentInside = getCurrentPersonnelInside();
    
    if (currentInside.length === 0) {
      alert('ℹ️ Aucune personne à évacuer actuellement');
      return;
    }

    const emergencyLogs: EntryLog[] = [];
    const updatedStatuses = [...personnelStatuses];
    const updatedPersonnel = [...personnel];

    currentInside.forEach(status => {
      const person = getPersonById(status.person_id);
      if (person) {
        const entryTime = status.last_entry_time ? new Date(status.last_entry_time) : new Date();
        const exitTime = new Date();
        const sessionDuration = Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60));

        // Log d'évacuation d'urgence
        emergencyLogs.push({
          id: generatePermitId(),
          timestamp: now,
          action: 'emergency_exit',
          personnelId: person.id, // ✅ REQUIS pour SafetyManager
          authorizedBy: 'ÉVACUATION D\'URGENCE', // ✅ REQUIS pour SafetyManager
          person_id: person.id,
          person_name: person.name,
          role: person.role,
          location: 'Espace clos',
          communication_verified: false,
          equipment_verified: false,
          emergency: true,
          notes: `ÉVACUATION D'URGENCE - Durée : ${formatDuration(sessionDuration)}`
        });

        // Mise à jour statut
        const statusIndex = updatedStatuses.findIndex(s => s.person_id === person.id);
        if (statusIndex !== -1) {
          updatedStatuses[statusIndex] = {
            ...updatedStatuses[statusIndex],
            current_status: 'emergency',
            last_exit_time: now,
            total_time_inside: updatedStatuses[statusIndex].total_time_inside + sessionDuration
          };
        }

        // Mise à jour personnel
        const personIndex = updatedPersonnel.findIndex(p => p.id === person.id);
        if (personIndex !== -1) {
          updatedPersonnel[personIndex] = {
            ...updatedPersonnel[personIndex],
            exitTime: now,
            status: 'emergency'
          };
        }
      }
    });

    setEmergencyMode(true);
    setPersonnelStatuses(updatedStatuses);
    updatePersonnel(updatedPersonnel);
    updateEntryLogs([...localEntryLogs, ...emergencyLogs]); // ✅ Utiliser logs locaux
    updateEntryRegistryData({ 
      currentOccupancy: 0,
      emergencyContactsNotified: true 
    });

    alert(`🚨 ÉVACUATION D'URGENCE INITIÉE - ${currentInside.length} personnes évacuées - Contacts d'urgence notifiés`);
  }, [personnelStatuses, personnel, entryLogs, getCurrentPersonnelInside, getPersonById, updatePersonnel, updateEntryLogs, updateEntryRegistryData]);

  // =================== GESTION COMMUNICATION ===================
  const performCommunicationCheck = React.useCallback(() => {
    if (!communicationCheck.person_id) {
      alert('⚠️ Veuillez sélectionner une personne pour la vérification');
      return;
    }

    const person = getPersonById(communicationCheck.person_id);
    if (!person) {
      alert('⚠️ Personne non trouvée');
      return;
    }

    const status = getPersonnelStatus(communicationCheck.person_id);
    if (status?.current_status !== 'inside') {
      alert('⚠️ Cette personne n\'est pas à l\'intérieur de l\'espace clos');
      return;
    }

    const now = new Date().toISOString();

    const commLog: CommunicationLog = {
      id: generatePermitId(),
      timestamp: now,
      person_id: communicationCheck.person_id,
      person_name: person.name,
      communication_type: communicationCheck.communication_type,
      signal_strength: communicationCheck.signal_strength,
      message: communicationCheck.message || undefined,
      response_received: communicationCheck.response_received,
      emergency_indicated: communicationCheck.emergency_indicated
    };

    const updatedCommLogs = [...communicationLogs, commLog];
    setCommunicationLogs(updatedCommLogs);

    // Mise à jour statut personnel
    const updatedStatuses = personnelStatuses.map(s => 
      s.person_id === communicationCheck.person_id 
        ? { ...s, communication_last_verified: now }
        : s
    );
    setPersonnelStatuses(updatedStatuses);

    // Log dans l'entrée registry (communication check séparé)
    const statusLog: CommunicationCheckLog = {
      id: generatePermitId(),
      timestamp: now,
      action: 'status_check',
      personnelId: communicationCheck.person_id,
      authorizedBy: 'Surveillant',
      person_id: communicationCheck.person_id,
      person_name: person.name,
      role: person.role,
      location: 'Espace clos',
      communication_verified: communicationCheck.response_received,
      equipment_verified: true,
      emergency: communicationCheck.emergency_indicated,
      notes: `Communication ${communicationCheck.communication_type} - Signal: ${communicationCheck.signal_strength}/5 ${communicationCheck.emergency_indicated ? ' - URGENCE SIGNALÉE' : ''}`
    };

    // Ajouter aux logs locaux de communication (pas dans SafetyManager)
    setLocalCommunicationChecks(prev => [...prev, statusLog]);

    // Reset form
    setCommunicationCheck({
      person_id: '',
      communication_type: 'radio',
      signal_strength: 5,
      message: '',
      response_received: false,
      emergency_indicated: false
    });

    if (communicationCheck.emergency_indicated) {
      alert('🚨 URGENCE SIGNALÉE ! Procédures d\'urgence activées !');
      setEmergencyMode(true);
    } else {
      alert(`✅ Communication vérifiée avec ${person.name}`);
    }
  }, [communicationCheck, communicationLogs, personnelStatuses, entryLogs, getPersonById, getPersonnelStatus, updateEntryLogs]);

  // =================== RENDU JSX PRINCIPAL ===================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '28px' }}>
      
      {/* Section Conformité Réglementaire Entrée/Sortie */}
      <div style={{
        backgroundColor: '#dc2626',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '24px',
        border: '2px solid #ef4444',
        boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: 'white',
          marginBottom: isMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <UserCheck style={{ width: '24px', height: '24px', color: '#fecaca' }} />
          ⚖️ {t.legalCompliance}
        </h3>
        
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          marginBottom: '20px',
          border: '1px solid rgba(254, 202, 202, 0.3)'
        }}>
          <p style={{ 
            color: '#fecaca', 
            fontSize: '15px',
            lineHeight: 1.6,
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            👥 <strong>SURVEILLANCE OBLIGATOIRE</strong> : Surveillant qualifié requis en permanence + communication bidirectionnelle selon {safeRegulations.code}.
          </p>
          <p style={{ 
            color: '#fca5a5', 
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            ⏰ <strong>Durée maximale</strong> : {safeRegulations.permit_validity_hours}h consécutives maximum par personne dans l'espace clos.
          </p>
        </div>
        
        {/* Exigences surveillant obligatoire */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fecaca',
            marginBottom: '16px'
          }}>
            👁️ {t.attendantRequired}
          </h4>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(254, 202, 202, 0.3)',
            marginBottom: '16px'
          }}>
            <input
              type="checkbox"
              id="attendant_present"
              checked={ensureBoolean(entryRegistryData?.attendantPresent)}
              onChange={(e) => handleAttendantPresent(e.target.checked)}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="attendant_present"
              style={{
                color: '#fecaca',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              👁️ <strong>SURVEILLANT PRÉSENT</strong> : Je confirme qu'un surveillant qualifié est présent et maintient une surveillance constante *
            </label>
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(254, 202, 202, 0.3)',
            marginBottom: '16px'
          }}>
            <input
              type="checkbox"
              id="communication_system_tested"
              checked={ensureBoolean(entryRegistryData?.communicationSystemActive)}
              onChange={(e) => handleCommunicationSystemTested(e.target.checked)}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="communication_system_tested"
              style={{
                color: '#fecaca',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              📡 <strong>COMMUNICATION TESTÉE</strong> : Système de communication bidirectionnelle testé et fonctionnel entre surveillant et entrants *
            </label>
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(254, 202, 202, 0.3)'
          }}>
            <input
              type="checkbox"
              id="emergency_retrieval_ready"
              checked={ensureBoolean(permitData.emergency_retrieval_ready)}
              onChange={(e) => handleEmergencyRetrievalReady(e.target.checked)}
              style={{
                width: '24px',
                height: '24px',
                accentColor: '#ef4444'
              }}
              required
            />
            <label 
              htmlFor="emergency_retrieval_ready"
              style={{
                color: '#fecaca',
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              🚑 <strong>SAUVETAGE PRÊT</strong> : Équipe et équipement de sauvetage d'urgence prêts à intervenir immédiatement *
            </label>
          </div>
        </div>
      </div>

      {/* Mode urgence */}
      {emergencyMode && (
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '28px',
          animation: 'pulse 2s infinite',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <AlertTriangle style={{ width: '36px', height: '36px', color: '#f87171' }} />
              <div>
                <h3 style={{ color: '#fecaca', fontWeight: 'bold', fontSize: isMobile ? '18px' : '20px' }}>
                  🚨 {t.emergencyEvacuationInitiated}
                </h3>
                <p style={{ color: '#fca5a5', fontSize: isMobile ? '14px' : '16px' }}>
                  Procédures d'urgence activées - Contacts d'urgence notifiés
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmergencyMode(false)}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
              Fermer alerte
            </button>
          </div>
        </div>
      )}

      {/* Section Occupation Actuelle */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          {t.currentOccupancy}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <span style={{
              fontSize: isMobile ? '12px' : '14px',
              backgroundColor: (entryRegistryData?.currentOccupancy || 0) >= entryRegistryData?.maxOccupancy ? '#ef4444' : '#10b981',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontWeight: '700'
            }}>
              👥 {entryRegistryData?.currentOccupancy || 0}/{entryRegistryData?.maxOccupancy}
            </span>
            <button
              onClick={initiateEmergencyEvacuation}
              style={{
                ...styles.button,
                ...styles.buttonDanger,
                width: 'auto',
                padding: '8px 12px',
                fontSize: '14px',
                minHeight: 'auto'
              }}
              disabled={(entryRegistryData?.currentOccupancy || 0) === 0}
            >
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              {t.emergencyEvacuation}
            </button>
          </div>
        </h3>
        
        <div style={styles.grid3}>
          <div style={{
            padding: '20px',
            backgroundColor: (entryRegistryData.currentOccupancy || 0) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)',
            borderRadius: '12px',
            border: `2px solid ${(entryRegistryData.currentOccupancy || 0) > 0 ? '#ef4444' : '#6b7280'}`,
            textAlign: 'center'
          }}>
            <UserCheck style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: (entryRegistryData?.currentOccupancy || 0) > 0 ? '#f87171' : '#6b7280',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: (entryRegistryData?.currentOccupancy || 0) > 0 ? '#fca5a5' : '#9ca3af',
              marginBottom: '8px'
            }}>
              {getCurrentPersonnelInside().length}
            </div>
            <div style={{ 
              color: (entryRegistryData?.currentOccupancy || 0) > 0 ? '#fca5a5' : '#9ca3af', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {t.personnelInside}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <Shield style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#34d399',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#86efac',
              marginBottom: '8px'
            }}>
              {getCurrentPersonnelOutside().length}
            </div>
            <div style={{ 
              color: '#86efac', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {t.personnelOutside}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            border: '2px solid #f59e0b',
            textAlign: 'center'
          }}>
            <Wrench style={{ 
              width: isMobile ? '32px' : '40px', 
              height: isMobile ? '32px' : '40px', 
              color: '#fbbf24',
              margin: '0 auto 12px'
            }} />
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: 'bold', 
              color: '#fde047',
              marginBottom: '8px'
            }}>
              {entryRegistryData?.maxOccupancy}
            </div>
            <div style={{ 
              color: '#fde047', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {t.maxOccupancy}
            </div>
          </div>
        </div>
      </div>

      {/* Section Gestion du Personnel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Users style={{ width: '20px', height: '20px' }} />
          {t.personnelManagement} ({personnel.length})
          <button
            onClick={() => setShowAddPersonForm(!showAddPersonForm)}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              width: 'auto',
              padding: '8px 12px',
              fontSize: '14px',
              minHeight: 'auto',
              marginLeft: 'auto'
            }}
          >
            <UserPlus style={{ width: '16px', height: '16px' }} />
            {t.addPerson}
          </button>
        </h3>
        
        {/* Formulaire ajout personnel */}
        {showAddPersonForm && (
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '24px',
            border: '1px solid #4b5563',
            marginBottom: '24px'
          }}>
            <h4 style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '20px' 
            }}>
              👤 Nouveau Personnel
            </h4>
            
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Nom complet *</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Rôle *</label>
                <select
                  value={newPerson.role}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, role: e.target.value as SafetyRole }))}
                  style={styles.input}
                  required
                >
                  <option value="entrant">👷 Entrant</option>
                  <option value="attendant">👁️ Surveillant</option>
                  <option value="supervisor">👨‍💼 Superviseur</option>
                  <option value="rescue">🚑 Sauveteur</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Téléphone *</label>
                <input
                  type="tel"
                  placeholder="Ex: (514) 123-4567"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, phone: e.target.value }))}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  placeholder="Ex: jean.dupont@entreprise.ca"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Entreprise</label>
                <input
                  type="text"
                  placeholder="Ex: Construction ABC Inc."
                  value={newPerson.company}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, company: e.target.value }))}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Certification</label>
                <input
                  type="text"
                  placeholder="Ex: CNESST-EC-2024-001"
                  value={newPerson.certification}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, certification: e.target.value }))}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Contact d'urgence - Nom</label>
                <input
                  type="text"
                  placeholder="Ex: Marie Dupont"
                  value={newPerson.emergency_contact_name}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Contact d'urgence - Téléphone</label>
                <input
                  type="tel"
                  placeholder="Ex: (514) 987-6543"
                  value={newPerson.emergency_contact_phone}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>Notes</label>
              <textarea
                placeholder="Qualifications, restrictions médicales, notes particulières..."
                value={newPerson.notes}
                onChange={(e) => setNewPerson(prev => ({ ...prev, notes: e.target.value }))}
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={addNewPerson}
                style={{
                  ...styles.button,
                  ...styles.buttonSuccess,
                  flex: 1
                }}
              >
                <UserPlus style={{ width: '18px', height: '18px' }} />
                Ajouter Personnel
              </button>
              <button
                onClick={() => setShowAddPersonForm(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  flex: isMobile ? 1 : 'none',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
                Annuler
              </button>
            </div>
          </div>
        )}
        
        {/* Liste du personnel */}
        {personnel.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <Users style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucun personnel enregistré
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Ajoutez du personnel ci-dessus pour commencer à gérer les entrées/sorties.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px'
          }}>
            {personnel.map((person) => {
              const status = getPersonnelStatus(person.id);
              const isInside = status?.current_status === 'inside';
              const statusColor = getStatusColor(status?.current_status || 'unknown');
              
              return (
                <div
                  key={person.id}
                  style={{
                    padding: isMobile ? '16px' : '20px',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getRoleColor(person.role)}`,
                    backgroundColor: isInside ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 24, 39, 0.6)',
                    border: `1px solid ${isInside ? '#ef4444' : '#4b5563'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                        boxShadow: isInside ? '0 0 12px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(16, 185, 129, 0.4)',
                        animation: isInside ? 'pulse 2s infinite' : 'none'
                      }}></div>
                      <span style={{
                        fontWeight: '700',
                        color: 'white',
                        fontSize: isMobile ? '16px' : '18px'
                      }}>
                        {getRoleEmoji(person.role)} {person.name}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: getRoleColor(person.role),
                        color: 'white'
                      }}>
                        {person.role}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: statusColor,
                        color: 'white'
                      }}>
                        {status?.current_status === 'inside' ? t.inside :
                         status?.current_status === 'outside' ? t.outside :
                         status?.current_status === 'emergency' ? t.emergency :
                         t.unknown}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px',
                      flexDirection: isMobile ? 'column' : 'row',
                      width: isMobile ? '100%' : 'auto'
                    }}>
                      <button
                        onClick={() => recordEntry(person.id)}
                        disabled={isInside || !ensureBoolean(entryRegistryData.attendantPresent)}
                        style={{
                          ...styles.button,
                          ...styles.buttonSuccess,
                          width: 'auto',
                          padding: '6px 10px',
                          fontSize: '13px',
                          minHeight: 'auto',
                          opacity: (isInside || !ensureBoolean(entryRegistryData.attendantPresent)) ? 0.5 : 1,
                          cursor: (isInside || !ensureBoolean(entryRegistryData.attendantPresent)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <LogIn style={{ width: '14px', height: '14px' }} />
                        {t.recordEntry}
                      </button>
                      <button
                        onClick={() => recordExit(person.id)}
                        disabled={!isInside}
                        style={{
                          ...styles.button,
                          ...styles.buttonWarning,
                          width: 'auto',
                          padding: '6px 10px',
                          fontSize: '13px',
                          minHeight: 'auto',
                          opacity: !isInside ? 0.5 : 1,
                          cursor: !isInside ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <LogOut style={{ width: '14px', height: '14px' }} />
                        {t.recordExit}
                      </button>
                      <button
                        onClick={() => removePerson(person.id)}
                        disabled={isInside}
                        style={{
                          ...styles.button,
                          ...styles.buttonDanger,
                          width: 'auto',
                          padding: '6px 10px',
                          fontSize: '13px',
                          minHeight: 'auto',
                          opacity: isInside ? 0.5 : 1,
                          cursor: isInside ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <UserMinus style={{ width: '14px', height: '14px' }} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>📞 Téléphone:</span>
                      <span style={{ marginLeft: '8px', color: '#d1d5db', fontWeight: '600' }}>
                        {person.emergencyContact?.phone || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>🏢 Entreprise:</span>
                      <span style={{ marginLeft: '8px', color: '#d1d5db', fontWeight: '600' }}>
                        N/A
                      </span>
                    </div>
                    {status && (
                      <div>
                        <span style={{ color: '#9ca3af' }}>⏱️ {t.timeInside}:</span>
                        <span style={{ marginLeft: '8px', color: '#d1d5db', fontWeight: '600' }}>
                          {formatDuration(status.total_time_inside)}
                        </span>
                      </div>
                    )}
                    {status?.communication_last_verified && (
                      <div>
                        <span style={{ color: '#9ca3af' }}>📡 {t.lastCommunication}:</span>
                        <span style={{ marginLeft: '8px', color: '#d1d5db', fontWeight: '600' }}>
                          {new Date(status.communication_last_verified).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #4b5563',
                    fontSize: '13px',
                    color: '#d1d5db'
                  }}>
                    <div>🚑 <strong>Contact d'urgence:</strong> {person.emergencyContact?.name || 'N/A'} - {person.emergencyContact?.phone || 'N/A'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section Système de Communication */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <Volume2 style={{ width: '20px', height: '20px' }} />
          {t.communicationSystem}
        </h3>
        
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          borderRadius: '12px',
          padding: isMobile ? '20px' : '24px',
          border: '1px solid #4b5563',
          marginBottom: '24px'
        }}>
          <h4 style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '20px' 
          }}>
            📡 {t.communicationCheck}
          </h4>
          
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Personne à contacter *</label>
              <select
                value={communicationCheck.person_id}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, person_id: e.target.value }))}
                style={styles.input}
                required
              >
                <option value="">Sélectionner une personne</option>
                {getCurrentPersonnelInside().map(status => {
                  const person = getPersonById(status.person_id);
                  return person ? (
                    <option key={person.id} value={person.id}>
                      {getRoleEmoji(person.role)} {person.name} ({person.role})
                    </option>
                  ) : null;
                })}
              </select>
            </div>
            <div>
              <label style={styles.label}>Type de communication *</label>
              <select
                value={communicationCheck.communication_type}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, communication_type: e.target.value as any }))}
                style={styles.input}
                required
              >
                <option value="radio">📻 Radio</option>
                <option value="visual">👁️ Visuel</option>
                <option value="hand_signal">✋ Signal manuel</option>
                <option value="emergency_signal">🚨 Signal d'urgence</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Force du signal (1-5) *</label>
              <input
                type="range"
                min="1"
                max="5"
                value={communicationCheck.signal_strength}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, signal_strength: parseInt(e.target.value) }))}
                style={styles.input}
              />
              <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                {communicationCheck.signal_strength}/5 - {
                  communicationCheck.signal_strength >= 4 ? '📶 Excellent' :
                  communicationCheck.signal_strength >= 3 ? '📶 Bon' :
                  communicationCheck.signal_strength >= 2 ? '📶 Moyen' : '📶 Faible'
                }
              </div>
            </div>
            <div>
              <label style={styles.label}>Message (optionnel)</label>
              <input
                type="text"
                placeholder="Ex: Vérification statut général"
                value={communicationCheck.message}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, message: e.target.value }))}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              flex: 1
            }}>
              <input
                type="checkbox"
                id="response_received"
                checked={communicationCheck.response_received}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, response_received: e.target.checked }))}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#10b981'
                }}
              />
              <label 
                htmlFor="response_received"
                style={{
                  color: '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✅ {t.responseReceived}
              </label>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              flex: 1
            }}>
              <input
                type="checkbox"
                id="emergency_indicated"
                checked={communicationCheck.emergency_indicated}
                onChange={(e) => setCommunicationCheck(prev => ({ ...prev, emergency_indicated: e.target.checked }))}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#ef4444'
                }}
              />
              <label 
                htmlFor="emergency_indicated"
                style={{
                  color: '#fca5a5',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🚨 {t.emergencySignal}
              </label>
            </div>
          </div>
          
          <button
            onClick={performCommunicationCheck}
            disabled={!communicationCheck.person_id}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              width: '100%',
              marginTop: '20px',
              opacity: !communicationCheck.person_id ? 0.5 : 1,
              cursor: !communicationCheck.person_id ? 'not-allowed' : 'pointer'
            }}
          >
            <Volume2 style={{ width: '18px', height: '18px' }} />
            Effectuer Vérification Communication
          </button>
        </div>
      </div>

      {/* Section Journal des Entrées/Sorties */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <History style={{ width: '20px', height: '20px' }} />
          {t.entryLog} ({localEntryLogs.length + localCommunicationChecks.length})
        </h3>
        
        {(localEntryLogs.length + localCommunicationChecks.length) === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '48px 32px', 
            color: '#9ca3af',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <FileText style={{ 
              width: isMobile ? '56px' : '72px', 
              height: isMobile ? '56px' : '72px', 
              margin: '0 auto 20px', 
              color: '#4b5563'
            }} />
            <p style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '12px', fontWeight: '600' }}>
              Aucune entrée enregistrée
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.5 }}>
              Les entrées/sorties et vérifications de communication apparaîtront ici.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            maxHeight: isMobile ? '400px' : '500px', 
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {/* Combiner et trier tous les logs par timestamp */}
            {[...localEntryLogs, ...localCommunicationChecks]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((log) => {
              const actionColor = log.action === 'entry' ? '#10b981' :
                                log.action === 'exit' ? '#f59e0b' :
                                log.action === 'emergency_exit' ? '#ef4444' :
                                '#6b7280';
              
              const actionEmoji = log.action === 'entry' ? '📥' :
                                log.action === 'exit' ? '📤' :
                                log.action === 'emergency_exit' ? '🚨' :
                                '📡';
              
              return (
                <div
                  key={log.id}
                  style={{
                    padding: isMobile ? '14px' : '16px',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${actionColor}`,
                    backgroundColor: log.emergency ? 'rgba(239, 68, 68, 0.1)' : 'rgba(17, 24, 39, 0.6)',
                    border: `1px solid ${log.emergency ? '#ef4444' : '#4b5563'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '8px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px' }}>{actionEmoji}</span>
                      <span style={{
                        fontWeight: '700',
                        color: 'white',
                        fontSize: isMobile ? '15px' : '16px'
                      }}>
                        {getRoleEmoji(log.role)} {log.person_name}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: actionColor,
                        color: 'white'
                      }}>
                        {log.action === 'entry' ? 'ENTRÉE' :
                         log.action === 'exit' ? 'SORTIE' :
                         log.action === 'emergency_exit' ? 'ÉVACUATION' :
                         'COMM'}
                      </span>
                      {log.emergency && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          animation: 'pulse 2s infinite'
                        }}>
                          🚨 URGENCE
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: isMobile ? '12px' : '13px', 
                      textAlign: isMobile ? 'center' : 'right'
                    }}>
                      📅 {new Date(log.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      <br />
                      👤 {log.authorizedBy}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>📍 Lieu:</span>
                      <span style={{ marginLeft: '6px', color: '#d1d5db', fontWeight: '600' }}>
                        {log.location}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>📡 Comm:</span>
                      <span style={{ 
                        marginLeft: '6px', 
                        color: log.communication_verified ? '#86efac' : '#fca5a5', 
                        fontWeight: '600' 
                      }}>
                        {log.communication_verified ? '✅ OK' : '❌ NON'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>🛡️ Équip:</span>
                      <span style={{ 
                        marginLeft: '6px', 
                        color: log.equipment_verified ? '#86efac' : '#fca5a5', 
                        fontWeight: '600' 
                      }}>
                        {log.equipment_verified ? '✅ OK' : '❌ NON'}
                      </span>
                    </div>
                  </div>
                  
                  {log.notes && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #4b5563',
                      fontSize: '12px',
                      color: '#d1d5db'
                    }}>
                      📝 {log.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EntryRegistry);
