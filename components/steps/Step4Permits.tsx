"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer, ChevronLeft,
  ChevronRight, Upload, Trash2, UserPlus, UserCheck, Grid, List
} from 'lucide-react';

// =================== INTERFACES LÉGALES CONFORMES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

interface LegalPermit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData?: any;
  code: string;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
    approvedBy?: string;
  };
  compliance: {
    cnesst?: boolean;
    ohsa?: boolean;
    worksafebc?: boolean;
    ohs?: boolean;
  };
}

// =================== TYPES PERSONNEL CONFORMES CNESST/OHSA ===================
interface Entrant {
  id: string;
  nom: string;
  certification: string;
  age: number; // Minimum 18 ans selon CNESST 2025
  heureEntree?: string;
  heureSortie?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  equipementProtection: string[];
  medicaleClearance: boolean;
}

interface Surveillant {
  id: string;
  nom: string;
  certification: string;
  contactUrgence: string;
  posteDeSurveillance: string;
  heureDebut?: string;
  heureFin?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  communicationMethod: string;
  emergencyProcedure: string;
}

interface Superviseur {
  id: string;
  nom: string;
  certification: string;
  numeroPermis: string;
  contactUrgence: string;
  autorisation: string;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  responsabilites: string[];
  experienceAnnees: number;
}

// =================== DONNÉES ATMOSPHÉRIQUES CONFORMES 2025 ===================
interface AtmosphericData {
  oxygene: {
    niveau: number;
    conformeCNESST: boolean; // 20.5% - 23% selon nouvelle norme 2025
    heureTest: string;
    equipementUtilise: string;
  };
  gazToxiques: {
    detection: string[];
    niveaux: Record<string, number>;
    seuils: Record<string, number>;
    conforme: boolean;
  };
  gazCombustibles: {
    pourcentageLIE: number;
    conformeReglement: boolean; // ≤ 5% LIE selon CNESST 2025
    typeGaz: string;
    equipementTest: string;
  };
  ventilation: {
    active: boolean;
    debitAir: string;
    directionFlux: string;
    efficacite: string;
  };
}

// =================== CONFIGURATION PROVINCIALE RÉELLE ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec - CNESST',
    regulation: 'RSST Section XXVI (2023)',
    oxygenRange: { min: 20.5, max: 23.0 }, // Nouvelle norme 2025
    flammableGasLimit: 5, // % LIE - Nouvelle norme stricte
    minimumAge: 18,
    mandatoryDocuments: [
      'Permis d\'entrée en espace clos',
      'Analyse atmosphérique continue',
      'Plan d\'intervention d\'urgence',
      'Formation du personnel certifiée',
      'Équipements de sauvetage vérifiés'
    ],
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois'
  },
  ON: {
    name: 'Ontario - OHSA',
    regulation: 'Règl. de l\'Ont. 632/05 - Espaces clos',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10, // % LIE
    minimumAge: 18,
    mandatoryDocuments: [
      'Programme écrit sur les espaces clos',
      'Permis d\'entrée obligatoire',
      'Évaluation des risques',
      'Formation des travailleurs',
      'Procédures de sauvetage'
    ],
    authority: 'Ministère du Travail de l\'Ontario',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois'
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 19, // BC spécifique
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment',
      'Entry Procedures',
      'Emergency Response Plan',
      'Worker Training Records'
    ],
    authority: 'Workers\' Compensation Board of British Columbia',
    penalties: 'Administrative penalties and prosecution'
  },
  AB: {
    name: 'Alberta - OHS',
    regulation: 'OHS Code Part 4 - Confined Spaces',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment and Control',
      'Emergency Response Procedures',
      'Training and Competency',
      'Atmospheric Testing'
    ],
    authority: 'Alberta Occupational Health and Safety',
    penalties: 'Fines up to $500,000 for corporations'
  }
};

// =================== VRAIS PERMIS GOUVERNEMENTAUX ===================
const OFFICIAL_PERMITS = {
  QC_CONFINED_SPACE: {
    id: 'qc-espace-clos-cnesst',
    officialName: 'Permis d\'entrée en espace clos - CNESST',
    regulation: 'RSST Section XXVI, articles 296.1 à 312',
    formNumber: 'CNESST-EC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    lastUpdated: '2023-07-25', // Date d'entrée en vigueur nouvelle réglementation
    requiredFields: [
      'Identification de l\'espace clos',
      'Description du travail',
      'Analyse atmosphérique (O2: 20.5-23%, Gaz inflammables ≤5% LIE)',
      'Procédures d\'entrée et de sortie',
      'Équipements de protection requis',
      'Surveillant désigné (18+ ans)',
      'Plan d\'intervention d\'urgence',
      'Signatures autorisées'
    ]
  },
  QC_HOT_WORK: {
    id: 'qc-travail-chaud-cnesst',
    officialName: 'Permis de travail à chaud - CNESST',
    regulation: 'RSST Section relative aux travaux à chaud',
    formNumber: 'CNESST-TC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    requiredFields: [
      'Description des travaux à chaud (soudage, découpage, meulage)',
      'Évaluation des risques d\'incendie',
      'Mesures de prévention incendie',
      'Surveillance continue obligatoire',
      'Équipements d\'extinction à proximité',
      'Autorisations de supervision',
      'Durée et horaires des travaux'
    ]
  },
  ON_CONFINED_SPACE: {
    id: 'on-confined-space-ohsa',
    officialName: 'Confined Space Entry Permit - OHSA',
    regulation: 'O. Reg. 632/05 under OHSA',
    formNumber: 'OHSA-CS-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    requiredFields: [
      'Confined space identification and location',
      'Work description and duration',
      'Atmospheric testing results',
      'Entry and exit procedures',
      'Attendant designation',
      'Emergency rescue procedures',
      'Equipment checklist and verification',
      'Authorized signatures'
    ]
  },
  BC_CONFINED_SPACE: {
    id: 'bc-confined-space-wsbc',
    officialName: 'Confined Space Entry Permit - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces',
    formNumber: 'WSBC-CS-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    requiredFields: [
      'Confined space identification',
      'Hazard assessment and controls',
      'Atmospheric monitoring (19+ age requirement)',
      'Entry procedures and training',
      'Emergency response plan',
      'Equipment verification',
      'Competent person authorization'
    ]
  }
};

// =================== FONCTION GÉNÉRATION CODE PERMIS LÉGAL ===================
const generateLegalPermitCode = (permitType: string, province: string): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  // Format conforme: PROVINCE-TYPE-YYYYMMDD-XXXXXX
  const typeCode = permitType.split('-')[0].toUpperCase().substring(0, 3);
  return `${province}-${typeCode}-${year}${month}${day}-${timestamp}`;
};

// =================== TRADUCTIONS CONFORMES ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis de Travail Officiels 2025',
      subtitle: 'Formulaires gouvernementaux conformes aux dernières réglementations provinciales',
      searchPlaceholder: 'Rechercher un permis officiel...',
      allCategories: 'Tous les permis',
      categories: {
        'Espaces Clos': 'Espaces Clos',
        'Travail à Chaud': 'Travail à Chaud',
        'Excavation': 'Excavation',
        'Hauteur': 'Travail en Hauteur'
      },
      stats: {
        available: 'Disponibles',
        submitted: 'Soumis',
        approved: 'Approuvés', 
        archived: 'Archivés'
      },
      actions: {
        fill: 'Remplir Permis',
        submit: 'Soumettre',
        approve: 'Approuver',
        archive: 'Archiver',
        download: 'Télécharger PDF',
        duplicate: 'Dupliquer'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
        selectProvince: 'Sélectionnez votre province pour voir les permis applicables'
      },
      compliance: {
        cnesst: 'Conforme CNESST 2025',
        ohsa: 'Conforme OHSA',
        worksafebc: 'Conforme WorkSafeBC',
        ohs: 'Conforme OHS Alberta'
      }
    };
  } else {
    return {
      title: 'Official Work Permits 2025',
      subtitle: 'Government forms compliant with latest provincial regulations',
      searchPlaceholder: 'Search official permit...',
      allCategories: 'All permits',
      categories: {
        'Espaces Clos': 'Confined Spaces',
        'Travail à Chaud': 'Hot Work',
        'Excavation': 'Excavation',
        'Hauteur': 'Work at Height'
      },
      stats: {
        available: 'Available',
        submitted: 'Submitted', 
        approved: 'Approved',
        archived: 'Archived'
      },
      actions: {
        fill: 'Fill Permit',
        submit: 'Submit',
        approve: 'Approve',
        archive: 'Archive',
        download: 'Download PDF',
        duplicate: 'Duplicate'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        selectProvince: 'Select your province to see applicable permits'
      },
      compliance: {
        cnesst: 'CNESST 2025 Compliant',
        ohsa: 'OHSA Compliant',
        worksafebc: 'WorkSafeBC Compliant',
        ohs: 'Alberta OHS Compliant'
      }
    };
  }
};
// =================== SECTION 2 - FORMULAIRE COMPLET CORRIGÉ ===================
// Cette section REMPLACE complètement la Section 2 existante dans Step4Permits.tsx

// =================== COMPOSANT FORMULAIRE SCROLL MOBILE ===================
const FormulaireLegalScrollable: React.FC<{
  permit: LegalPermit;
  onFormChange: (data: any) => void;
  language: 'fr' | 'en';
  onClose: () => void;
}> = ({ permit, onFormChange, language, onClose }) => {
  const t = getTexts(language);
  const regulation = PROVINCIAL_REGULATIONS[permit.province[0] as keyof typeof PROVINCIAL_REGULATIONS];
  
  // États pour mode scroll
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Section 1: Identification
    codePermis: permit.code,
    lieuTravail: '',
    descriptionTravaux: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    dureeEstimee: '',
    
    // Section 2: Personnel (conforme réglementations)
    superviseur: null as Superviseur | null,
    surveillants: [] as Surveillant[],
    entrants: [] as Entrant[],
    
    // Section 3: Tests atmosphériques (conformes CNESST 2025)
    atmospherique: {
      oxygene: { 
        niveau: 0, 
        conformeCNESST: false, 
        heureTest: '', 
        equipementUtilise: '' 
      },
      gazToxiques: { 
        detection: [] as string[], 
        niveaux: {} as Record<string, number>, 
        seuils: {} as Record<string, number>,
        conforme: false 
      },
      gazCombustibles: { 
        pourcentageLIE: 0, 
        conformeReglement: false, 
        typeGaz: '',
        equipementTest: '' 
      },
      ventilation: { 
        active: false, 
        debitAir: '', 
        directionFlux: '',
        efficacite: ''
      }
    } as AtmosphericData,
    
    // Section 4: Équipements réglementaires
    equipements: {
      protection: [] as string[],
      detection: [] as string[],
      sauvetage: [] as string[],
      communication: [] as string[]
    },
    
    // Section 5: Procédures d'urgence obligatoires
    urgence: {
      planIntervention: '',
      contactsUrgence: '',
      equipeSauvetage: '',
      hopitalProche: '',
      procedureEvacuation: ''
    },
    
    // Section 6: Validation finale et conformité
    validation: {
      tousTestsCompletes: false,
      documentationComplete: false,
      formationVerifiee: false,
      equipementsVerifies: false,
      conformeReglementation: false,
      signatureResponsable: '',
      dateValidation: ''
    }
  });

  const sections = [
    { 
      id: 'identification', 
      title: language === 'fr' ? 'Identification du Projet' : 'Project Identification',
      icon: '📋',
      required: true
    },
    { 
      id: 'personnel', 
      title: language === 'fr' ? 'Personnel Autorisé' : 'Authorized Personnel',
      icon: '👥',
      required: true
    },
    { 
      id: 'atmospherique', 
      title: language === 'fr' ? 'Tests Atmosphériques' : 'Atmospheric Testing',
      icon: '🧪',
      required: permit.legalRequirements.atmosphericTesting
    },
    { 
      id: 'equipements', 
      title: language === 'fr' ? 'Équipements Sécurité' : 'Safety Equipment',
      icon: '🛡️',
      required: true
    },
    { 
      id: 'urgence', 
      title: language === 'fr' ? 'Procédures Urgence' : 'Emergency Procedures',
      icon: '🚨',
      required: true
    },
    { 
      id: 'validation', 
      title: language === 'fr' ? 'Validation Conformité' : 'Compliance Validation',
      icon: '✅',
      required: true
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionProgress = () => {
    return ((currentSection + 1) / sections.length) * 100;
  };

  // Fonction pour ajouter personnel conforme aux réglementations
  const ajouterSuperviseur = () => {
    const nouveauSuperviseur: Superviseur = {
      id: `superviseur_${Date.now()}`,
      nom: '',
      certification: '',
      numeroPermis: '',
      contactUrgence: '',
      autorisation: permit.province[0] === 'QC' ? 'CNESST' : permit.province[0] === 'ON' ? 'OHSA' : 'Provincial',
      formationVerifiee: false,
      signature: '',
      dateSignature: '',
      responsabilites: ['Supervision entrée/sortie', 'Tests atmosphériques', 'Procédures urgence'],
      experienceAnnees: 0
    };
    handleInputChange('superviseur', nouveauSuperviseur);
  };

  const ajouterEntrant = () => {
    const nouvelEntrant: Entrant = {
      id: `entrant_${Date.now()}`,
      nom: '',
      certification: '',
      age: regulation?.minimumAge || 18, // Conforme à l'âge minimum provincial
      statutActif: false,
      formationVerifiee: false,
      signature: '',
      dateSignature: '',
      equipementProtection: [],
      medicaleClearance: false
    };
    
    handleInputChange('entrants', [...formData.entrants, nouvelEntrant]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
        minHeight: '100vh',
        color: '#ffffff'
      }}>
        {/* Header fixe avec navigation mobile */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
          padding: '16px 20px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ 
                color: '#ffffff', 
                margin: '0 0 4px', 
                fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                fontWeight: '800'
              }}>
                {permit.name}
              </h2>
              <div style={{
                fontSize: '12px',
                color: '#93c5fd',
                fontWeight: '600'
              }}>
                {permit.code} • {regulation?.name}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Barre de progression */}
          <div style={{
            background: 'rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            height: '8px',
            marginBottom: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              height: '100%',
              width: `${getSectionProgress()}%`,
              borderRadius: '8px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Indicateur section actuelle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '20px' }}>{sections[currentSection].icon}</span>
            <span>{sections[currentSection].title}</span>
            <span style={{ color: '#94a3b8' }}>
              ({currentSection + 1}/{sections.length})
            </span>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div style={{ padding: '24px 20px 120px' }}>
          
          {/* Section 1: Identification */}
          {currentSection === 0 && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
                📋 Identification du Projet
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Lieu de travail exact *
                  </label>
                  <input
                    type="text"
                    value={formData.lieuTravail}
                    onChange={(e) => handleInputChange('lieuTravail', e.target.value)}
                    placeholder="Adresse complète avec coordonnées GPS si possible"
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: formData.lieuTravail ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Description détaillée des travaux *
                  </label>
                  <textarea
                    value={formData.descriptionTravaux}
                    onChange={(e) => handleInputChange('descriptionTravaux', e.target.value)}
                    placeholder="Décrivez précisément les travaux, les risques identifiés et les mesures préventives..."
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: formData.descriptionTravaux ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      minHeight: '120px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Durée estimée
                    </label>
                    <input
                      type="text"
                      value={formData.dureeEstimee}
                      onChange={(e) => handleInputChange('dureeEstimee', e.target.value)}
                      placeholder="Ex: 4 heures, 2 jours"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Info réglementaire */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#60a5fa', margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                    📋 Exigences Réglementaires - {regulation?.name}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Réglementation:</strong> {regulation?.regulation}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Âge minimum:</strong> {regulation?.minimumAge} ans
                    </div>
                    {permit.legalRequirements.atmosphericTesting && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Tests atmosphériques:</strong> O₂ {regulation?.oxygenRange.min}-{regulation?.oxygenRange.max}%, 
                        Gaz inflammables ≤{regulation?.flammableGasLimit}% LIE
                      </div>
                    )}
                    <div>
                      <strong>Autorité:</strong> {regulation?.authority}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Personnel conforme aux réglementations */}
          {currentSection === 1 && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
                👥 Personnel Autorisé
              </h3>
              
              {/* Superviseur obligatoire */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                  🛡️ Superviseur Responsable (Obligatoire)
                </h4>
                
                {!formData.superviseur ? (
                  <button
                    onClick={ajouterSuperviseur}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    <Plus size={20} />
                    Désigner un Superviseur
                  </button>
                ) : (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="Nom complet du superviseur *"
                        value={formData.superviseur.nom}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, nom: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Certification ${permit.province[0]} requise`}
                        value={formData.superviseur.certification}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, certification: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Contact d'urgence"
                        value={formData.superviseur.contactUrgence}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, contactUrgence: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.superviseur.formationVerifiee}
                          onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, formationVerifiee: e.target.checked })}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Formation conforme aux exigences {regulation?.name} vérifiée
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Entrants avec âge minimum conforme */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <h4 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    🚶 Entrants (Âge min: {regulation?.minimumAge} ans)
                  </h4>
                  <button
                    onClick={ajouterEntrant}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    Ajouter Entrant
                  </button>
                </div>
                
                {formData.entrants.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    border: '2px dashed rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px'
                  }}>
                    Aucun entrant - Âge minimum {regulation?.minimumAge} ans selon {regulation?.name}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {formData.entrants.map((entrant, index) => (
                      <div
                        key={entrant.id}
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '12px',
                          padding: '16px'
                        }}
                      >
                        <div style={{ display: 'grid', gap: '12px' }}>
                          <input
                            type="text"
                            placeholder="Nom complet de l'entrant *"
                            value={entrant.nom}
                            onChange={(e) => {
                              const newEntrants = [...formData.entrants];
                              newEntrants[index] = { ...entrant, nom: e.target.value };
                              handleInputChange('entrants', newEntrants);
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '16px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input
                              type="text"
                              placeholder="Certification requise"
                              value={entrant.certification}
                              onChange={(e) => {
                                const newEntrants = [...formData.entrants];
                                newEntrants[index] = { ...entrant, certification: e.target.value };
                                handleInputChange('entrants', newEntrants);
                              }}
                              style={{
                                padding: '12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '16px'
                              }}
                            />
                            <input
                              type="number"
                              placeholder={`Âge (min ${regulation?.minimumAge})`}
                              value={entrant.age}
                              onChange={(e) => {
                                const age = parseInt(e.target.value) || regulation?.minimumAge || 18;
                                const newEntrants = [...formData.entrants];
                                newEntrants[index] = { ...entrant, age };
                                handleInputChange('entrants', newEntrants);
                              }}
                              min={regulation?.minimumAge}
                              style={{
                                padding: '12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: entrant.age < (regulation?.minimumAge || 18) ? 
                                  '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '16px'
                              }}
                            />
                          </div>
                          
                          {entrant.age < (regulation?.minimumAge || 18) && (
                            <div style={{
                              padding: '8px 12px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              borderRadius: '6px',
                              color: '#fca5a5',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              ⚠️ Non conforme: Âge minimum {regulation?.minimumAge} ans requis selon {regulation?.name}
                            </div>
                          )}
                          
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            color: '#e2e8f0',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={entrant.formationVerifiee}
                              onChange={(e) => {
                                const newEntrants = [...formData.entrants];
                                newEntrants[index] = { ...entrant, formationVerifiee: e.target.checked };
                                handleInputChange('entrants', newEntrants);
                              }}
                            />
                            Formation sécurité espaces clos complétée et vérifiée
                          </label>
                          
                          <button
                            onClick={() => {
                              const newEntrants = formData.entrants.filter((_, i) => i !== index);
                              handleInputChange('entrants', newEntrants);
                            }}
                            style={{
                              padding: '8px',
                              background: 'rgba(239, 68, 68, 0.3)',
                              color: '#fca5a5',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              alignSelf: 'flex-start'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Tests atmosphériques conformes TOUTES LES SECTIONS ICI */}
          {currentSection === 2 && permit.legalRequirements.atmosphericTesting && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
                🧪 Tests Atmosphériques Obligatoires
              </h3>
              
              {/* Alerte réglementaire */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ color: '#fca5a5', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                  ⚠️ EXIGENCES CRITIQUES - {regulation?.name}
                </h4>
                <div style={{ fontSize: '13px', color: '#fecaca', lineHeight: '1.5' }}>
                  <div>• Oxygène: {regulation?.oxygenRange.min}% - {regulation?.oxygenRange.max}%</div>
                  <div>• Gaz inflammables: ≤ {regulation?.flammableGasLimit}% LIE</div>
                  <div>• Tests obligatoires avant entrée et en continu</div>
                  <div>• Équipement étalonné selon fabricant requis</div>
                </div>
              </div>

              {/* Tests Oxygène */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🫁 Test Oxygène (O₂)
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                  border: formData.atmospherique.oxygene.conformeCNESST ? 
                    '2px solid rgba(34, 197, 94, 0.5)' : 
                    '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                          Niveau O₂ mesuré (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.atmospherique.oxygene.niveau || ''}
                          onChange={(e) => {
                            const niveau = parseFloat(e.target.value) || 0;
                            const conformeCNESST = niveau >= (regulation?.oxygenRange.min || 19.5) && 
                                           niveau <= (regulation?.oxygenRange.max || 23.0);
                            handleInputChange('atmospherique', {
                              ...formData.atmospherique,
                              oxygene: { ...formData.atmospherique.oxygene, niveau, conformeCNESST }
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: formData.atmospherique.oxygene.conformeCNESST ? 
                              '2px solid #22c55e' : 
                              formData.atmospherique.oxygene.niveau > 0 ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                          Heure du test
                        </label>
                        <input
                          type="time"
                          value={formData.atmospherique.oxygene.heureTest}
                          onChange={(e) => handleInputChange('atmospherique', {
                            ...formData.atmospherique,
                            oxygene: { ...formData.atmospherique.oxygene, heureTest: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Équipement utilisé (marque, modèle, étalonnage)"
                      value={formData.atmospherique.oxygene.equipementUtilise}
                      onChange={(e) => handleInputChange('atmospherique', {
                        ...formData.atmospherique,
                        oxygene: { ...formData.atmospherique.oxygene, equipementUtilise: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    
                    {/* Indicateur conformité */}
                    <div style={{
                      padding: '12px',
                      background: formData.atmospherique.oxygene.conformeCNESST ? 
                        'rgba(34, 197, 94, 0.2)' : 
                        formData.atmospherique.oxygene.niveau > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        color: formData.atmospherique.oxygene.conformeCNESST ? '#22c55e' : 
                               formData.atmospherique.oxygene.niveau > 0 ? '#ef4444' : '#94a3b8',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {formData.atmospherique.oxygene.conformeCNESST ? 
                          `✅ CONFORME ${regulation?.name}` : 
                          formData.atmospherique.oxygene.niveau > 0 ? 
                            `❌ NON CONFORME - Requis: ${regulation?.oxygenRange.min}%-${regulation?.oxygenRange.max}%` :
                            `⏳ En attente de mesure`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tests Gaz Combustibles */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🔥 Test Gaz Combustibles
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                  border: formData.atmospherique.gazCombustibles.conformeReglement ? 
                    '2px solid rgba(245, 158, 11, 0.5)' : 
                    '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                          % LIE (Limite Inférieure Explosion)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.atmospherique.gazCombustibles.pourcentageLIE || ''}
                          onChange={(e) => {
                            const pourcentageLIE = parseFloat(e.target.value) || 0;
                            const conformeReglement = pourcentageLIE <= (regulation?.flammableGasLimit || 10);
                            handleInputChange('atmospherique', {
                              ...formData.atmospherique,
                              gazCombustibles: { ...formData.atmospherique.gazCombustibles, pourcentageLIE, conformeReglement }
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: formData.atmospherique.gazCombustibles.conformeReglement ? 
                              '2px solid #f59e0b' : 
                              formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                          Type de gaz détecté
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Méthane, Propane, Hydrogène"
                          value={formData.atmospherique.gazCombustibles.typeGaz}
                          onChange={(e) => handleInputChange('atmospherique', {
                            ...formData.atmospherique,
                            gazCombustibles: { ...formData.atmospherique.gazCombustibles, typeGaz: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Équipement de détection (étalonné selon fabricant)"
                      value={formData.atmospherique.gazCombustibles.equipementTest}
                      onChange={(e) => handleInputChange('atmospherique', {
                        ...formData.atmospherique,
                        gazCombustibles: { ...formData.atmospherique.gazCombustibles, equipementTest: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    
                    <div style={{
                      padding: '12px',
                      background: formData.atmospherique.gazCombustibles.conformeReglement ? 
                        'rgba(245, 158, 11, 0.2)' : 
                        formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        color: formData.atmospherique.gazCombustibles.conformeReglement ? '#f59e0b' : 
                               formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? '#ef4444' : '#94a3b8',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {formData.atmospherique.gazCombustibles.conformeReglement ? 
                          `✅ SÉCURITAIRE - Limite: ≤${regulation?.flammableGasLimit}% LIE` : 
                          formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? 
                            `🚨 DANGER - Dépassement limite ${regulation?.flammableGasLimit}% LIE` :
                            `⏳ Test requis avant entrée`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ventilation obligatoire */}
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  💨 Système de Ventilation
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.atmospherique.ventilation.active}
                        onChange={(e) => handleInputChange('atmospherique', {
                          ...formData.atmospherique,
                          ventilation: { ...formData.atmospherique.ventilation, active: e.target.checked }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Ventilation mécanique active et continue
                    </label>
                  </div>
                  
                  {formData.atmospherique.ventilation.active && (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="Débit d'air (CFM ou m³/min)"
                        value={formData.atmospherique.ventilation.debitAir}
                        onChange={(e) => handleInputChange('atmospherique', {
                          ...formData.atmospherique,
                          ventilation: { ...formData.atmospherique.ventilation, debitAir: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <select
                        value={formData.atmospherique.ventilation.directionFlux}
                        onChange={(e) => handleInputChange('atmospherique', {
                          ...formData.atmospherique,
                          ventilation: { ...formData.atmospherique.ventilation, directionFlux: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Sélectionner direction du flux</option>
                        <option value="extraction">Extraction (aspiration)</option>
                        <option value="insufflation">Insufflation (refoulement)</option>
                        <option value="mixte">Mixte (extraction + insufflation)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Autres sections placeholder */}
          {currentSection >= 3 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 12px' }}>
                Section {currentSection + 1} en développement
              </h3>
              <p style={{ margin: 0 }}>
                {sections[currentSection].title} sera implémentée dans la prochaine itération
              </p>
            </div>
          )}
        </div>

        {/* Navigation fixe en bas - Style mobile */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))',
          borderTop: '1px solid rgba(100, 116, 139, 0.3)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            style={{
              padding: '12px 20px',
              background: currentSection === 0 ? 
                'rgba(100, 116, 139, 0.3)' : 
                'linear-gradient(135deg, #374151, #4b5563)',
              color: currentSection === 0 ? '#9ca3af' : '#e5e7eb',
              border: 'none',
              borderRadius: '8px',
              cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '80px'
            }}
          >
            <ChevronLeft size={16} />
            Précédent
          </button>

          <div style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '12px',
            color: '#94a3b8',
            fontWeight: '600'
          }}>
            {currentSection + 1} / {sections.length}
          </div>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={nextSection}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '80px'
              }}
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                alert('✅ Permis sauvegardé avec succès!\n🔢 Code: ' + formData.codePermis);
                onClose();
              }}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
// =================== COMPOSANT PRINCIPAL STEP4PERMITS ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ 
  formData, 
  onDataChange, 
  language = 'fr', 
  tenant, 
  errors 
}) => {
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [showFormModal, setShowFormModal] = useState<string | null>(null);
  const [showArchives, setShowArchives] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPermit, setSavingPermit] = useState<string | null>(null);
  
  // =================== GESTION PERMIS ET SUPABASE ===================
  const [permits, setPermits] = useState<LegalPermit[]>([]);
  const [archivedPermits, setArchivedPermits] = useState<LegalPermit[]>([]);

  // Initialisation des permis selon province
  useEffect(() => {
    const initializePermits = () => {
      setLoading(true);
      try {
        const provincialPermits = generateCompliantPermits(language, selectedProvince);
        setPermits(provincialPermits);
        
        // Simuler chargement des permis existants depuis Supabase
        // Dans l'implémentation réelle, remplacer par appel Supabase
        loadExistingPermitsFromStorage();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des permis:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePermits();
  }, [language, selectedProvince]);

  // Fonction pour charger les permis existants (simulée pour Supabase)
  const loadExistingPermitsFromStorage = async () => {
    try {
      // Simulation d'appel Supabase - Remplacer par vraie logique
      const storedPermits = localStorage.getItem(`permits_${tenant}_${selectedProvince}`);
      const storedArchived = localStorage.getItem(`archived_permits_${tenant}_${selectedProvince}`);
      
      if (storedPermits) {
        const existingPermits = JSON.parse(storedPermits);
        setPermits(prev => [...prev, ...existingPermits]);
      }
      
      if (storedArchived) {
        const existingArchived = JSON.parse(storedArchived);
        setArchivedPermits(existingArchived);
      }

      // TODO: Remplacer par appel Supabase réel
      /*
      const { data: permits, error } = await supabase
        .from('legal_permits')
        .select('*')
        .eq('tenant', tenant)
        .eq('province', selectedProvince)
        .order('dateModified', { ascending: false });
      
      if (error) throw error;
      if (permits) setPermits(prev => [...prev, ...permits]);
      */
    } catch (error) {
      console.error('Erreur lors du chargement des permis:', error);
    }
  };

  // Sauvegarde dans Supabase (simulée)
  const savePermitToSupabase = async (permit: LegalPermit, formData: any) => {
    setSavingPermit(permit.id);
    try {
      // Simulation sauvegarde - Remplacer par Supabase
      const permitData = {
        ...permit,
        formData,
        dateModified: new Date().toISOString(),
        status: 'submitted'
      };

      // Sauvegarde locale temporaire
      const existingPermits = JSON.parse(localStorage.getItem(`permits_${tenant}_${selectedProvince}`) || '[]');
      const updatedPermits = existingPermits.filter((p: LegalPermit) => p.id !== permit.id);
      updatedPermits.push(permitData);
      localStorage.setItem(`permits_${tenant}_${selectedProvince}`, JSON.stringify(updatedPermits));

      // TODO: Remplacer par appel Supabase réel
      /*
      const { data, error } = await supabase
        .from('legal_permits')
        .upsert({
          id: permit.id,
          tenant: tenant,
          province: selectedProvince,
          code: permit.code,
          name: permit.name,
          category: permit.category,
          form_data: formData,
          status: 'submitted',
          date_created: permit.dateCreated,
          date_modified: new Date().toISOString(),
          compliance: permit.compliance,
          legal_requirements: permit.legalRequirements
        })
        .select();

      if (error) throw error;
      */

      // Mettre à jour l'état local
      setPermits(prev => prev.map(p => 
        p.id === permit.id ? { ...p, formData, status: 'submitted' as const, dateModified: new Date().toISOString() } : p
      ));

      return { success: true, message: 'Permis sauvegardé avec succès' };
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    } finally {
      setSavingPermit(null);
    }
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Espaces Clos': 
      case 'Confined Spaces': 
        return '🔒';
      case 'Travail à Chaud':
      case 'Hot Work':
        return '🔥';
      case 'Excavation': 
        return '⛏️';
      case 'Hauteur':
      case 'Work at Height':
        return '🏗️';
      default: 
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'submitted': return '#3b82f6';
      case 'approved': return '#22c55e';
      case 'archived': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      fr: {
        draft: 'Brouillon',
        submitted: 'Soumis',
        approved: 'Approuvé',
        archived: 'Archivé'
      },
      en: {
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved',
        archived: 'Archived'
      }
    };
    return labels[language][status as keyof typeof labels.fr] || status;
  };

  // =================== GESTION ACTIONS PERMIS ===================
  const handlePermitClick = (permitId: string, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    const updatedPermits = permits.map((permit: LegalPermit) => 
      permit.id === permitId ? { ...permit, selected: !permit.selected } : permit
    );
    setPermits(updatedPermits);
  };

  const handleFormToggle = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFormModal(permitId);
  };

  const handleDeletePermit = async (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(language === 'fr' ? 
      'Êtes-vous sûr de vouloir supprimer ce permis définitivement ?' : 
      'Are you sure you want to permanently delete this permit?'
    )) {
      try {
        // TODO: Supprimer de Supabase
        /*
        const { error } = await supabase
          .from('legal_permits')
          .delete()
          .eq('id', permitId);
        
        if (error) throw error;
        */

        // Supprimer localement
        const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
        setPermits(updatedPermits);
        
        // Mettre à jour le storage local
        const existingPermits = JSON.parse(localStorage.getItem(`permits_${tenant}_${selectedProvince}`) || '[]');
        const filteredPermits = existingPermits.filter((p: LegalPermit) => p.id !== permitId);
        localStorage.setItem(`permits_${tenant}_${selectedProvince}`, JSON.stringify(filteredPermits));

        alert(language === 'fr' ? 'Permis supprimé avec succès' : 'Permit deleted successfully');
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert(language === 'fr' ? 'Erreur lors de la suppression' : 'Error during deletion');
      }
    }
  };

  const archivePermit = async (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: LegalPermit) => p.id === permitId);
    
    if (!permit || !permit.selected) {
      alert(language === 'fr' ? 
        'Le permis doit être sélectionné et rempli avant d\'être archivé' : 
        'Permit must be selected and filled before archiving'
      );
      return;
    }

    try {
      const archivedPermit = { 
        ...permit, 
        status: 'archived' as const,
        validity: { ...permit.validity, isValid: true, approvedBy: formData.superviseur?.nom || 'System' },
        dateModified: new Date().toISOString()
      };

      // TODO: Mettre à jour Supabase
      /*
      const { error } = await supabase
        .from('legal_permits')
        .update({ status: 'archived', validity: archivedPermit.validity })
        .eq('id', permitId);
      
      if (error) throw error;
      */

      setArchivedPermits(prev => [...prev, archivedPermit]);
      const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
      setPermits(updatedPermits);
      
      // Mettre à jour storage local
      const existingArchived = JSON.parse(localStorage.getItem(`archived_permits_${tenant}_${selectedProvince}`) || '[]');
      existingArchived.push(archivedPermit);
      localStorage.setItem(`archived_permits_${tenant}_${selectedProvince}`, JSON.stringify(existingArchived));

      alert(language === 'fr' ? 
        '✅ Permis archivé avec succès! Le permis est maintenant valide et prêt à être utilisé sur le terrain.' : 
        '✅ Permit archived successfully! The permit is now valid and ready for field use.'
      );
    } catch (error) {
      console.error('Erreur archivage:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'archivage' : 'Error during archiving');
    }
  };

  const duplicatePermit = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: LegalPermit) => p.id === permitId);
    
    if (permit) {
      const duplicatedPermit: LegalPermit = {
        ...permit,
        id: `${permit.id}-copy-${Date.now()}`,
        code: generateLegalPermitCode(permit.id.split('-')[0], selectedProvince),
        name: permit.name + (language === 'fr' ? ' (Copie)' : ' (Copy)'),
        selected: false,
        status: 'draft',
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      setPermits(prev => [duplicatedPermit, ...prev]);
      alert(language === 'fr' ? 
        `✅ Permis dupliqué avec succès!\n🔢 Nouveau code: ${duplicatedPermit.code}` :
        `✅ Permit duplicated successfully!\n🔢 New code: ${duplicatedPermit.code}`
      );
    }
  };

  // =================== FILTRAGE ET RECHERCHE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: LegalPermit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories: string[] = useMemo(() => 
    Array.from(new Set(permits.map((p: LegalPermit) => p.category))), 
    [permits]
  );

  const provinces: string[] = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  const selectedPermits = useMemo(() => permits.filter((p: LegalPermit) => p.selected), [permits]);

  const stats = useMemo(() => ({
    totalPermits: permits.length,
    submitted: permits.filter(p => p.status === 'submitted').length,
    approved: permits.filter(p => p.status === 'approved').length,
    archived: archivedPermits.length
  }), [permits, archivedPermits]);

  const statsData = [
    { key: 'available', value: stats.totalPermits, icon: '📊', color: '#3b82f6' },
    { key: 'submitted', value: stats.submitted, icon: '📤', color: '#f59e0b' },
    { key: 'approved', value: stats.approved, icon: '✅', color: '#22c55e' },
    { key: 'archived', value: stats.archived, icon: '📦', color: '#8b5cf6' }
  ];

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ padding: '0', color: '#ffffff', minHeight: '100vh' }}>
      {/* Header Premium avec stats gouvernementales */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15), rgba(239, 68, 68, 0.1))',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: window.innerWidth <= 768 ? '24px' : '32px',
              fontWeight: '900',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #fb7185)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2'
            }}>
              🏛️ {t.title}
            </h1>
            <p style={{ color: '#93c5fd', margin: '0', fontSize: '14px', fontWeight: '500' }}>
              {t.subtitle}
            </p>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'inline-block',
              marginTop: '8px'
            }}>
              {PROVINCIAL_REGULATIONS[selectedProvince as keyof typeof PROVINCIAL_REGULATIONS]?.name} - {PROVINCIAL_REGULATIONS[selectedProvince as keyof typeof PROVINCIAL_REGULATIONS]?.regulation}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                onDataChange('province', e.target.value);
              }}
              style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowArchives(!showArchives)}
              style={{
                padding: '12px 20px',
                background: showArchives ? 
                  'linear-gradient(135deg, #22c55e, #16a34a)' :
                  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}
            >
              <FileText size={16} />
              {showArchives ? 
                (language === 'fr' ? 'Permis Actifs' : 'Active Permits') :
                (language === 'fr' ? `Archives (${stats.archived})` : `Archives (${stats.archived})`)
              }
            </button>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
          {statsData.map((stat) => (
            <div key={stat.key} style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
              padding: '20px 16px',
              borderRadius: '16px',
              border: `2px solid ${stat.color}30`,
              boxShadow: `0 8px 25px -8px ${stat.color}20`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: window.innerWidth <= 768 ? '24px' : '28px',
                fontWeight: '900',
                color: stat.color,
                marginBottom: '6px',
                textShadow: `0 0 20px ${stat.color}40`
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                fontWeight: '700', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {(t.stats as any)[stat.key] || stat.key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showArchives && (
        <>
          {/* Contrôles de recherche premium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px', 
            marginBottom: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8' 
              }} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {(t.categories as any)[category] || category}
                </option>
              ))}
            </select>
          </div>

          {/* Indicateur de chargement */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(59, 130, 246, 0.3)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {language === 'fr' ? 'Chargement des permis...' : 'Loading permits...'}
              </p>
            </div>
          )}

          {/* Cartes des permis premium */}
          {!loading && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: '24px' 
            }}>
              {filteredPermits.map((permit: LegalPermit) => (
                <div
                  key={permit.id}
                  style={{
                    background: permit.selected ?
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 41, 59, 0.9))' :
                      'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7))',
                    border: permit.selected ? 
                      '3px solid #3b82f6' : 
                      '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '20px',
                    padding: '24px',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    transform: permit.selected ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                    boxShadow: permit.selected ? 
                      '0 20px 40px -12px rgba(59, 130, 246, 0.4)' : 
                      '0 8px 25px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={(e) => handlePermitClick(permit.id, e)}
                >
                  {/* Header avec statut et actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))',
                        color: '#93c5fd',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'inline-block'
                      }}>
                        🔢 {permit.code}
                      </div>
                      <div style={{
                        background: getStatusColor(permit.status),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        display: 'inline-block'
                      }}>
                        {getStatusLabel(permit.status)}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => duplicatePermit(permit.id, e)}
                        style={{
                          padding: '6px',
                          background: 'rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Dupliquer' : 'Duplicate'}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeletePermit(permit.id, e)}
                        style={{
                          padding: '6px',
                          background: 'rgba(239, 68, 68, 0.3)',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '32px', 
                      width: '50px', 
                      textAlign: 'center',
                      filter: permit.selected ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' : 'none'
                    }}>
                      {getCategoryIcon(permit.category)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        color: '#ffffff', 
                        fontSize: '16px', 
                        fontWeight: '800', 
                        margin: '0 0 8px', 
                        lineHeight: '1.3' 
                      }}>
                        {permit.name}
                      </h3>
                      <div style={{ 
                        color: permit.selected ? '#93c5fd' : '#94a3b8', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        marginBottom: '8px', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {(t.categories as any)[permit.category] || permit.category}
                      </div>
                      <div style={{ 
                        color: '#cbd5e1', 
                        fontSize: '13px', 
                        lineHeight: '1.4', 
                        marginBottom: '8px' 
                      }}>
                        {permit.description}
                      </div>
                      <div style={{ 
                        color: '#60a5fa', 
                        fontSize: '11px', 
                        fontWeight: '600'
                      }}>
                        🏛️ {permit.authority}
                      </div>
                    </div>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      border: permit.selected ? '3px solid #3b82f6' : '2px solid rgba(100, 116, 139, 0.5)',
                      borderRadius: '10px',
                      background: permit.selected ? 
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                        'rgba(15, 23, 42, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {permit.selected && <CheckCircle size={16} style={{ color: 'white' }} />}
                    </div>
                  </div>

                  {/* Actions pour permis sélectionnés */}
                  {permit.selected && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr auto',
                      gap: '10px' 
                    }}>
                      <button
                        onClick={(e) => handleFormToggle(permit.id, e)}
                        disabled={savingPermit === permit.id}
                        style={{
                          padding: '12px 16px',
                          background: savingPermit === permit.id ?
                            'rgba(100, 116, 139, 0.3)' :
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: savingPermit === permit.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {savingPermit === permit.id ? (
                          <>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <Edit size={14} />
                            {t.actions.fill}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => archivePermit(permit.id, e)}
                        style={{
                          padding: '12px 16px',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FileText size={14} />
                        {t.actions.archive}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(language === 'fr' ? 
                            `📄 Génération du PDF pour le permis ${permit.code}` :
                            `📄 Generating PDF for permit ${permit.code}`
                          );
                        }}
                        style={{
                          padding: '12px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message aucun résultat */}
          {!loading && filteredPermits.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
              borderRadius: '20px',
              border: '2px dashed rgba(100, 116, 139, 0.3)'
            }}>
              <FileText size={48} style={{ margin: '0 auto 20px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '20px', 
                fontWeight: '700' 
              }}>
                {t.messages.noResults}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '14px' }}>{t.messages.modifySearch}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{t.messages.selectProvince}</p>
            </div>
          )}
        </>
      )}

      {/* Vue Archives Premium */}
      {showArchives && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7))',
          borderRadius: '20px',
          padding: '28px',
          border: '2px solid rgba(139, 92, 246, 0.3)'
        }}>
          <h2 style={{ 
            color: '#a78bfa', 
            marginBottom: '24px', 
            fontSize: '24px', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📦 {language === 'fr' ? 'Permis Archivés & Validés' : 'Archived & Validated Permits'}
          </h2>
          
          {archivedPermits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <FileText size={48} style={{ margin: '0 auto 20px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '20px', 
                fontWeight: '700' 
              }}>
                {language === 'fr' ? 'Aucun permis archivé' : 'No archived permits'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {language === 'fr' ? 
                  'Les permis complétés et validés apparaîtront ici' : 
                  'Completed and validated permits will appear here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {archivedPermits.map((permit) => (
                <div
                  key={`archived-${permit.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{ 
                      color: '#ffffff', 
                      margin: '0 0 8px', 
                      fontSize: '16px', 
                      fontWeight: '700' 
                    }}>
                      {permit.name}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      fontSize: '12px', 
                      color: '#94a3b8',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        🔢 {permit.code}
                      </span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        📅 {new Date(permit.validity.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ 
                        color: '#a78bfa', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ✅ {language === 'fr' ? 'VALIDÉ & CONFORME' : 'VALIDATED & COMPLIANT'}
                      </span>
                      {permit.validity.approvedBy && (
                        <span style={{ 
                          color: '#60a5fa', 
                          fontSize: '11px'
                        }}>
                          👤 {permit.validity.approvedBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {language === 'fr' ? 'Voir Détails' : 'View Details'}
                    </button>
                    <button
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulaire */}
      {showFormModal && (
        <FormulaireLegalScrollable
          permit={permits.find(p => p.id === showFormModal)!}
          onFormChange={async (data) => {
            const permit = permits.find(p => p.id === showFormModal);
            if (permit) {
              const result = await savePermitToSupabase(permit, data);
              if (!result.success) {
                alert(result.message);
              }
            }
          }}
          language={language}
          onClose={() => setShowFormModal(null)}
        />
      )}

      {/* Animation CSS pour les loaders */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
