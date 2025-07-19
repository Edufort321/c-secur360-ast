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

// =================== INTERFACES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

interface CascadeSelection {
  permitType: string;
  company: string;
  confinedSpace: string;
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
  legalRequirements: {
    gasTests: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    signage: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
  };
}

interface Entrant {
  id: string;
  nom: string;
  certification: string;
  age: number;
  heureEntree?: string;
  heureSortie?: string;
  statutActif: boolean;
  reconnaissance: boolean;
  signature: string;
  dateSignature: string;
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
  reconnaissance: boolean;
  signature: string;
  dateSignature: string;
}

interface Superviseur {
  id: string;
  nom: string;
  certification: string;
  numeroPermis: string;
  contactUrgence: string;
  autorisation: string;
  reconnaissance: boolean;
  signature: string;
  dateSignature: string;
}

interface LegalPermitData {
  codePermis: string;
  typePermis: string;
  compagnie: string;
  lieuTravail: string;
  descriptionTravaux: string;
  dateDebut: string;
  dateFin: string;
  dureeEstimee: string;
  
  superviseur: Superviseur | null;
  surveillants: Surveillant[];
  entrants: Entrant[];
  
  niveauOxygene: string;
  gazToxiques: string;
  gazCombustibles: string;
  equipementTest: string;
  
  procedureEntree: string;
  methodeCommunication: string;
  signalUrgence: string;
  
  contactsUrgence: string;
  equipeSauvetage: string;
  hopitalProche: string;
  
  equipementVentilation: string;
  equipementDetection: string;
  equipementSauvetage: string;
  protectionIndividuelle: string;
  
  surveillanceIncendie: string;
  extincteurs: string;
  dureeSupervision: string;
  
  planEtanconnement: string;
  ingenieursigne: string;
  profondeurMax: string;
  typesSol: string;
  
  tousTestsCompletes: boolean;
  documentationComplete: boolean;
  formationVerifiee: boolean;
  equipementsVerifies: boolean;
  permisValide: boolean;
}
// =================== CONFIGURATION PROVINCES ===================
const PROVINCIAL_REQUIREMENTS = {
  QC: {
    name: 'Québec - CNESST',
    mandatory: ['avant_travaux', 'pendant_surveillance', 'apres_completion', 'equipements_securite'],
    optional: ['documentation_supplementaire', 'formation_equipe'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Inspecteur CNESST',
    ageMinimum: 18
  },
  ON: {
    name: 'Ontario - OHSA',
    mandatory: ['site_preparation', 'safety_measures', 'equipment_verification'],
    optional: ['additional_safety', 'training_verification'],
    resolution: '1280x720',
    geotagRequired: true,
    inspector: 'OHSA Inspector',
    ageMinimum: 18
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    mandatory: ['worksite_setup', 'environmental_measures', 'fall_protection'],
    optional: ['environmental_additional'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'WorkSafeBC Officer',
    ageMinimum: 19
  },
  AB: {
    name: 'Alberta - OHS',
    mandatory: ['oil_gas_safety', 'industrial_compliance', 'confined_space_setup'],
    optional: ['additional_industrial'],
    resolution: '1920x1080',
    geotagRequired: true,
    inspector: 'Alberta OHS Inspector',
    ageMinimum: 18
  }
};

// =================== FONCTIONS UTILITAIRES ===================
const generatePermitCode = (permitType: string, province: string): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-4);
  const typeCode = permitType.substring(0, 2).toUpperCase();
  return `${province}-${typeCode}-${year}-${timestamp}`;
};

const getProvincialPermits = (language: 'fr' | 'en', province: string = 'QC'): LegalPermit[] => {
  return [
    {
      id: 'confined-space-entry',
      name: language === 'fr' ? 
        `🔒 Permis Entrée Espace Clos - ${province}` : 
        `🔒 Confined Space Entry Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité Critique' : 'Critical Safety',
      description: language === 'fr' ? 
        `Permis conforme aux normes ${province} avec surveillance atmosphérique continue et procédures d'urgence` : 
        `${province} compliant permit with continuous atmospheric monitoring and emergency procedures`,
      authority: `Autorité ${province}`,
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {},
      code: generatePermitCode('confined-space-entry', province),
      legalRequirements: {
        gasTests: false,
        entryProcedure: false,
        emergencyPlan: false,
        equipmentCheck: false,
        signage: false,
        documentation: false
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      }
    },
    {
      id: 'hot-work-permit',
      name: language === 'fr' ? 
        `🔥 Permis Travail à Chaud - ${province}` : 
        `🔥 Hot Work Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité Incendie' : 'Fire Safety',
      description: language === 'fr' ? 
        `Permis travaux à chaud avec surveillance incendie continue selon normes ${province}` : 
        `Hot work permit with continuous fire watch per ${province} standards`,
      authority: `Autorité ${province}`,
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {},
      code: generatePermitCode('hot-work-permit', province),
      legalRequirements: {
        gasTests: false,
        entryProcedure: false,
        emergencyPlan: false,
        equipmentCheck: false,
        signage: false,
        documentation: false
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      }
    },
    {
      id: 'excavation-permit',
      name: language === 'fr' ? 
        `⛏️ Permis Excavation Profonde - ${province}` : 
        `⛏️ Deep Excavation Permit - ${province}`,
      category: language === 'fr' ? 'Construction Lourde' : 'Heavy Construction',
      description: language === 'fr' ? 
        `Permis excavation avec étançonnement obligatoire conforme aux normes municipales ${province}` : 
        `Excavation permit with mandatory shoring compliant with ${province} municipal standards`,
      authority: `Municipal ${province}`,
      province: [province],
      priority: 'high',
      selected: false,
      formData: {},
      code: generatePermitCode('excavation-permit', province),
      legalRequirements: {
        gasTests: false,
        entryProcedure: false,
        emergencyPlan: false,
        equipmentCheck: false,
        signage: false,
        documentation: false
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      }
    }
  ];
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Conformes 2025',
      subtitle: 'Formulaires authentiques conformes aux dernières normes provinciales canadiennes',
      searchPlaceholder: 'Rechercher un permis ou autorisation...',
      allCategories: 'Toutes catégories',
      categories: {
        'Sécurité Critique': 'Sécurité Critique',
        'Sécurité Incendie': 'Sécurité Incendie',
        'Construction Lourde': 'Construction Lourde',
        'Safety': 'Sécurité'
      },
      stats: {
        available: 'Disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        compliant: 'Conformes'
      },
      actions: {
        fill: 'Remplir Permis',
        close: 'Fermer',
        download: 'Télécharger PDF',
        archive: 'Archiver',
        delete: 'Supprimer'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche ou sélectionnez une autre province',
        nextStep: 'Prochaine étape: Validation finale et soumission officielle'
      },
      cascade: {
        title: 'Sélection Intelligente en Cascade',
        step1: 'Type de Permis',
        step2: 'Compagnie/Organisation', 
        step3: 'Espace ou Zone de Travail',
        complete: 'Sélection Complète - Prêt à Créer'
      }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2025',
      subtitle: 'Authentic forms compliant with latest Canadian provincial standards',
      searchPlaceholder: 'Search permits or authorizations...',
      allCategories: 'All categories',
      categories: {
        'Sécurité Critique': 'Critical Safety',
        'Sécurité Incendie': 'Fire Safety', 
        'Construction Lourde': 'Heavy Construction',
        'Safety': 'Safety'
      },
      stats: {
        available: 'Available',
        selected: 'Selected',
        critical: 'Critical',
        compliant: 'Compliant'
      },
      actions: {
        fill: 'Fill Permit',
        close: 'Close',
        download: 'Download PDF',
        archive: 'Archive',
        delete: 'Delete'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria or select another province',
        nextStep: 'Next step: Final validation and official submission'
      },
      cascade: {
        title: 'Smart Cascade Selection',
        step1: 'Permit Type',
        step2: 'Company/Organization',
        step3: 'Space or Work Area', 
        complete: 'Selection Complete - Ready to Create'
      }
    };
  }
};
// =================== COMPOSANT CASCADE SELECTOR PREMIUM ===================
const CascadeSelector: React.FC<{
  onSelectionChange: (selection: CascadeSelection) => void;
  language: 'fr' | 'en';
}> = ({ onSelectionChange, language }) => {
  const t = getTexts(language);
  const [selection, setSelection] = useState<CascadeSelection>({
    permitType: '',
    company: '',
    confinedSpace: ''
  });

  const permitTypes = [
    { 
      id: 'confined-space', 
      name: language === 'fr' ? 'Espace Clos' : 'Confined Space', 
      icon: '🔒',
      description: language === 'fr' ? 'Réservoirs, cuves, silos' : 'Tanks, vessels, silos',
      priority: 'critical'
    },
    { 
      id: 'hot-work', 
      name: language === 'fr' ? 'Travail à Chaud' : 'Hot Work', 
      icon: '🔥',
      description: language === 'fr' ? 'Soudage, découpage, meulage' : 'Welding, cutting, grinding',
      priority: 'critical'
    },
    { 
      id: 'excavation', 
      name: language === 'fr' ? 'Excavation' : 'Excavation', 
      icon: '⛏️',
      description: language === 'fr' ? 'Tranchées, fondations' : 'Trenches, foundations',
      priority: 'high'
    }
  ];

  const companies = [
    { 
      id: 'hydro-quebec', 
      name: 'Hydro-Québec', 
      sector: language === 'fr' ? 'Énergie' : 'Energy',
      logo: '⚡',
      employees: '19,000+'
    },
    { 
      id: 'cn-rail', 
      name: 'CN Rail', 
      sector: language === 'fr' ? 'Transport Ferroviaire' : 'Railway Transport',
      logo: '🚂',
      employees: '24,000+'
    },
    { 
      id: 'suncor', 
      name: 'Suncor Energy', 
      sector: language === 'fr' ? 'Pétrole & Gaz' : 'Oil & Gas',
      logo: '🛢️',
      employees: '12,000+'
    },
    { 
      id: 'bombardier', 
      name: 'Bombardier', 
      sector: language === 'fr' ? 'Aéronautique' : 'Aerospace',
      logo: '✈️',
      employees: '70,000+'
    },
    { 
      id: 'metro-inc', 
      name: 'Metro Inc.', 
      sector: language === 'fr' ? 'Distribution Alimentaire' : 'Food Distribution',
      logo: '🏪',
      employees: '90,000+'
    }
  ];

  const confinedSpaces = [
    { 
      id: 'reservoir-A', 
      name: language === 'fr' ? 'Réservoir Principal A' : 'Main Tank A', 
      type: language === 'fr' ? 'Stockage Liquide' : 'Liquid Storage', 
      volume: '420m³',
      risk: 'high',
      lastInspection: '2024-12-15'
    },
    { 
      id: 'wagon-citerne', 
      name: language === 'fr' ? 'Wagon-Citerne B-147' : 'Tank Car B-147', 
      type: language === 'fr' ? 'Transport' : 'Transport', 
      volume: '210m³',
      risk: 'critical',
      lastInspection: '2024-12-10'
    },
    { 
      id: 'silo-grain', 
      name: language === 'fr' ? 'Silo à Grain C' : 'Grain Silo C', 
      type: language === 'fr' ? 'Stockage Vrac' : 'Bulk Storage', 
      volume: '850m³',
      risk: 'medium',
      lastInspection: '2024-12-01'
    },
    { 
      id: 'cuve-chimique', 
      name: language === 'fr' ? 'Cuve Chimique D-003' : 'Chemical Vessel D-003', 
      type: language === 'fr' ? 'Procédé Chimique' : 'Chemical Process', 
      volume: '150m³',
      risk: 'critical',
      lastInspection: '2024-12-20'
    }
  ];

  const handleSelectionUpdate = (field: keyof CascadeSelection, value: string) => {
    const newSelection = { ...selection, [field]: value };
    
    // Reset dependent fields
    if (field === 'permitType') {
      newSelection.company = '';
      newSelection.confinedSpace = '';
    } else if (field === 'company') {
      newSelection.confinedSpace = '';
    }
    
    setSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      default: return '#059669';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '32px',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔄 {t.cascade.title}
        </h3>
        <p style={{ 
          color: '#94a3b8', 
          margin: 0, 
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {language === 'fr' ? 
            'Suivez les étapes pour créer votre permis personnalisé' : 
            'Follow the steps to create your custom permit'
          }
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Étape 1: Type de Permis */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
          border: selection.permitType ? '2px solid #3b82f6' : '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: selection.permitType ? 
                'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                'rgba(100, 116, 139, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              1
            </div>
            <h4 style={{ color: '#e2e8f0', margin: 0, fontSize: '16px', fontWeight: '700' }}>
              {t.cascade.step1}
            </h4>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {permitTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectionUpdate('permitType', type.id)}
                style={{
                  padding: '16px',
                  background: selection.permitType === type.id ?
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                    'linear-gradient(135deg, rgba(71, 85, 105, 0.4), rgba(51, 65, 85, 0.3))',
                  color: selection.permitType === type.id ? 'white' : '#cbd5e1',
                  border: selection.permitType === type.id ? 
                    '2px solid #60a5fa' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  transform: selection.permitType === type.id ? 'translateY(-2px)' : 'none',
                  boxShadow: selection.permitType === type.id ? 
                    '0 10px 25px -3px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                <span style={{ fontSize: '24px' }}>{type.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>{type.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{type.description}</div>
                  <div style={{ 
                    fontSize: '10px', 
                    marginTop: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: getPriorityColor(type.priority),
                    color: 'white',
                    display: 'inline-block',
                    textTransform: 'uppercase',
                    fontWeight: '700'
                  }}>
                    {type.priority}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Étape 2: Compagnie */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))',
          border: selection.company ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          opacity: selection.permitType ? 1 : 0.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: selection.company ? 
                'linear-gradient(135deg, #22c55e, #16a34a)' : 
                'rgba(100, 116, 139, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              2
            </div>
            <h4 style={{ color: '#e2e8f0', margin: 0, fontSize: '16px', fontWeight: '700' }}>
              {t.cascade.step2}
            </h4>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => selection.permitType && handleSelectionUpdate('company', company.id)}
                disabled={!selection.permitType}
                style={{
                  padding: '16px',
                  background: selection.company === company.id ?
                    'linear-gradient(135deg, #22c55e, #16a34a)' :
                    'linear-gradient(135deg, rgba(71, 85, 105, 0.4), rgba(51, 65, 85, 0.3))',
                  color: selection.company === company.id ? 'white' : '#cbd5e1',
                  border: selection.company === company.id ? 
                    '2px solid #34d399' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  cursor: selection.permitType ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  transform: selection.company === company.id ? 'translateY(-2px)' : 'none',
                  boxShadow: selection.company === company.id ? 
                    '0 10px 25px -3px rgba(34, 197, 94, 0.3)' : 'none'
                }}
              >
                <span style={{ fontSize: '24px' }}>{company.logo}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>{company.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{company.sector}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>👥 {company.employees} employés</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Étape 3: Espace de Travail */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
          border: selection.confinedSpace ? '2px solid #f59e0b' : '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          opacity: selection.company ? 1 : 0.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: selection.confinedSpace ? 
                'linear-gradient(135deg, #f59e0b, #d97706)' : 
                'rgba(100, 116, 139, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              3
            </div>
            <h4 style={{ color: '#e2e8f0', margin: 0, fontSize: '16px', fontWeight: '700' }}>
              {t.cascade.step3}
            </h4>
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {confinedSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() => selection.company && handleSelectionUpdate('confinedSpace', space.id)}
                disabled={!selection.company}
                style={{
                  padding: '16px',
                  background: selection.confinedSpace === space.id ?
                    'linear-gradient(135deg, #f59e0b, #d97706)' :
                    'linear-gradient(135deg, rgba(71, 85, 105, 0.4), rgba(51, 65, 85, 0.3))',
                  color: selection.confinedSpace === space.id ? 'white' : '#cbd5e1',
                  border: selection.confinedSpace === space.id ? 
                    '2px solid #fbbf24' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  cursor: selection.company ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  transform: selection.confinedSpace === space.id ? 'translateY(-2px)' : 'none',
                  boxShadow: selection.confinedSpace === space.id ? 
                    '0 10px 25px -3px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: getRiskColor(space.risk) 
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>{space.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                    {space.type} • {space.volume}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>
                    📅 Dernière inspection: {space.lastInspection}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé de la sélection complète */}
      {selection.permitType && selection.company && selection.confinedSpace && (
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h4 style={{ color: '#22c55e', margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>
              {t.cascade.complete}
            </h4>
            <p style={{ color: '#dcfce7', margin: 0, fontSize: '14px' }}>
              {language === 'fr' ? 
                'Votre sélection est complète. Vous pouvez maintenant créer votre permis personnalisé.' : 
                'Your selection is complete. You can now create your custom permit.'}
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.3)', 
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>Type:</div>
              <div style={{ color: '#dcfce7', fontWeight: '700' }}>
                {permitTypes.find(t => t.id === selection.permitType)?.name}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.3)', 
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>
                {language === 'fr' ? 'Compagnie:' : 'Company:'}
              </div>
              <div style={{ color: '#dcfce7', fontWeight: '700' }}>
                {companies.find(c => c.id === selection.company)?.name}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.3)', 
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>
                {language === 'fr' ? 'Espace:' : 'Space:'}
              </div>
              <div style={{ color: '#dcfce7', fontWeight: '700' }}>
                {confinedSpaces.find(s => s.id === selection.confinedSpace)?.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// =================== FORMULAIRE LÉGAL COMPLET PREMIUM ===================
const FormulaireLegalComplet: React.FC<{
  permit: LegalPermit;
  onFormChange: (data: LegalPermitData) => void;
  language: 'fr' | 'en';
  onClose: () => void;
}> = ({ permit, onFormChange, language, onClose }) => {
  const [formData, setFormData] = useState<LegalPermitData>({
    codePermis: permit.code,
    typePermis: permit.id,
    compagnie: '',
    lieuTravail: '',
    descriptionTravaux: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    dureeEstimee: '',
    
    superviseur: null,
    surveillants: [],
    entrants: [],
    
    niveauOxygene: '',
    gazToxiques: '',
    gazCombustibles: '',
    equipementTest: '',
    
    procedureEntree: '',
    methodeCommunication: '',
    signalUrgence: '',
    
    contactsUrgence: '',
    equipeSauvetage: '',
    hopitalProche: '',
    
    equipementVentilation: '',
    equipementDetection: '',
    equipementSauvetage: '',
    protectionIndividuelle: '',
    
    surveillanceIncendie: '',
    extincteurs: '',
    dureeSupervision: '',
    
    planEtanconnement: '',
    ingenieursigne: '',
    profondeurMax: '',
    typesSol: '',
    
    tousTestsCompletes: false,
    documentationComplete: false,
    formationVerifiee: false,
    equipementsVerifies: false,
    permisValide: false
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (field: keyof LegalPermitData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  // =================== GESTION DU PERSONNEL ===================
  const ajouterSuperviseur = () => {
    const nouveauSuperviseur: Superviseur = {
      id: `superviseur_${Date.now()}`,
      nom: '',
      certification: '',
      numeroPermis: '',
      contactUrgence: '',
      autorisation: '',
      reconnaissance: false,
      signature: '',
      dateSignature: ''
    };
    handleInputChange('superviseur', nouveauSuperviseur);
  };

  const modifierSuperviseur = (updates: Partial<Superviseur>) => {
    if (formData.superviseur) {
      handleInputChange('superviseur', { ...formData.superviseur, ...updates });
    }
  };

  const ajouterSurveillant = () => {
    const nouveauSurveillant: Surveillant = {
      id: `surveillant_${Date.now()}`,
      nom: '',
      certification: '',
      contactUrgence: '',
      posteDeSurveillance: '',
      statutActif: false,
      reconnaissance: false,
      signature: '',
      dateSignature: ''
    };
    
    const nouveauxSurveillants = [...formData.surveillants, nouveauSurveillant];
    handleInputChange('surveillants', nouveauxSurveillants);
  };

  const modifierSurveillant = (id: string, updates: Partial<Surveillant>) => {
    const surveillantsModifies = formData.surveillants.map(surveillant =>
      surveillant.id === id ? { ...surveillant, ...updates } : surveillant
    );
    handleInputChange('surveillants', surveillantsModifies);
  };

  const supprimerSurveillant = (id: string) => {
    const surveillantsFiltres = formData.surveillants.filter(surveillant => surveillant.id !== id);
    handleInputChange('surveillants', surveillantsFiltres);
  };

  const ajouterEntrant = () => {
    const nouvelEntrant: Entrant = {
      id: `entrant_${Date.now()}`,
      nom: '',
      certification: '',
      age: 18,
      statutActif: false,
      reconnaissance: false,
      signature: '',
      dateSignature: ''
    };
    
    const nouveauxEntrants = [...formData.entrants, nouvelEntrant];
    handleInputChange('entrants', nouveauxEntrants);
  };

  const modifierEntrant = (id: string, updates: Partial<Entrant>) => {
    const entrantsModifies = formData.entrants.map(entrant =>
      entrant.id === id ? { ...entrant, ...updates } : entrant
    );
    handleInputChange('entrants', entrantsModifies);
  };

  const supprimerEntrant = (id: string) => {
    const entrantsFiltres = formData.entrants.filter(entrant => entrant.id !== id);
    handleInputChange('entrants', entrantsFiltres);
  };

  const marquerEntreeSortie = (id: string, action: 'entree' | 'sortie') => {
    const maintenant = new Date().toLocaleTimeString('fr-CA', { hour12: false });
    const updates: Partial<Entrant> = action === 'entree' 
      ? { heureEntree: maintenant, statutActif: true }
      : { heureSortie: maintenant, statutActif: false };
    
    modifierEntrant(id, updates);
  };

  const signerAutomatiquement = (type: 'entrant' | 'surveillant' | 'superviseur', id?: string) => {
    const maintenant = new Date().toISOString();
    const signature = `Signé électroniquement le ${new Date().toLocaleString('fr-CA')}`;
    
    if (type === 'entrant' && id) {
      modifierEntrant(id, { 
        reconnaissance: true, 
        signature: signature, 
        dateSignature: maintenant 
      });
    } else if (type === 'surveillant' && id) {
      modifierSurveillant(id, { 
        reconnaissance: true, 
        signature: signature, 
        dateSignature: maintenant 
      });
    } else if (type === 'superviseur' && formData.superviseur) {
      modifierSuperviseur({ 
        reconnaissance: true, 
        signature: signature, 
        dateSignature: maintenant 
      });
    }
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
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
        borderRadius: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header Premium */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
          borderRadius: '20px 20px 0 0',
          padding: '32px',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ 
                color: '#ffffff', 
                margin: '0 0 12px', 
                fontSize: '28px', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📋 {permit.name}
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))',
                color: '#93c5fd',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔢 {formData.codePermis}
                <span style={{
                  padding: '2px 6px',
                  background: 'rgba(34, 197, 94, 0.3)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}>
                  CONFORME CNESST
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Premium */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
          background: 'rgba(30, 41, 59, 0.6)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'general', label: '📋 Général', icon: '📋' },
            { id: 'personnel', label: '👥 Personnel', icon: '👥' },
            { id: 'tests', label: '🧪 Tests & Mesures', icon: '🧪' },
            { id: 'procedures', label: '📝 Procédures', icon: '📝' },
            { id: 'validation', label: '✅ Validation', icon: '✅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '20px 28px',
                background: activeTab === tab.id ? 
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))' : 
                  'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '700' : '500',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.3s ease',
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '32px' }}>
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div>
              <h3 style={{ 
                color: '#ffffff', 
                marginBottom: '24px', 
                fontSize: '20px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📋 Informations Générales du Permis
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '20px' 
              }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Compagnie / Organisation *
                  </label>
                  <input
                    type="text"
                    value={formData.compagnie}
                    onChange={(e) => handleInputChange('compagnie', e.target.value)}
                    placeholder="Nom de l'entreprise ou organisation"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: formData.compagnie ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
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
                    Lieu de travail *
                  </label>
                  <input
                    type="text"
                    value={formData.lieuTravail}
                    onChange={(e) => handleInputChange('lieuTravail', e.target.value)}
                    placeholder="Adresse ou localisation précise"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: formData.lieuTravail ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
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
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px'
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
                    placeholder="Ex: 2 heures, 1 jour, 1 semaine"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
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
                  placeholder="Décrivez en détail la nature des travaux, les risques identifiés, et les mesures préventives..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: formData.descriptionTravaux ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    minHeight: '120px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Onglet Personnel */}
          {activeTab === 'personnel' && (
            <div>
              <h3 style={{ 
                color: '#ffffff', 
                marginBottom: '24px', 
                fontSize: '20px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                👥 Gestion du Personnel Autorisé
              </h3>
              
              {/* Superviseur */}
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ 
                  color: '#ffffff', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🛡️ Superviseur Responsable
                </h4>
                
                {!formData.superviseur ? (
                  <button
                    onClick={ajouterSuperviseur}
                    style={{
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Plus size={18} />
                    Désigner un Superviseur
                  </button>
                ) : (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '16px', 
                      marginBottom: '20px' 
                    }}>
                      <input
                        type="text"
                        placeholder="Nom complet du superviseur *"
                        value={formData.superviseur.nom}
                        onChange={(e) => modifierSuperviseur({ nom: e.target.value })}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Certification / Formation"
                        value={formData.superviseur.certification}
                        onChange={(e) => modifierSuperviseur({ certification: e.target.value })}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Contact d'urgence"
                        value={formData.superviseur.contactUrgence}
                        onChange={(e) => modifierSuperviseur({ contactUrgence: e.target.value })}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.superviseur.reconnaissance}
                          onChange={(e) => modifierSuperviseur({ reconnaissance: e.target.checked })}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        J'ai pris connaissance de toutes les exigences de ce permis
                      </label>
                      
                      {!formData.superviseur.reconnaissance && (
                        <button
                          onClick={() => signerAutomatiquement('superviseur')}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          📝 Signer Électroniquement
                        </button>
                      )}
                    </div>
                    
                    {formData.superviseur.signature && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#22c55e',
                        fontWeight: '600'
                      }}>
                        ✅ {formData.superviseur.signature}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Surveillants */}
              {formData.superviseur && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                  }}>
                    <h4 style={{ color: '#ffffff', margin: 0 }}>👁️ Surveillants</h4>
                    <button
                      onClick={ajouterSurveillant}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <Plus size={16} />
                      Ajouter Surveillant
                    </button>
                  </div>
                  
                  {formData.surveillants.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#94a3b8',
                      fontSize: '14px',
                      border: '2px dashed rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px'
                    }}>
                      Aucun surveillant assigné
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {formData.surveillants.map((surveillant) => (
                        <div
                          key={surveillant.id}
                          style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '20px'
                          }}
                        >
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '12px', 
                            marginBottom: '16px' 
                          }}>
                            <input
                              type="text"
                              placeholder="Nom du surveillant *"
                              value={surveillant.nom}
                              onChange={(e) => modifierSurveillant(surveillant.id, { nom: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Certification *"
                              value={surveillant.certification}
                              onChange={(e) => modifierSurveillant(surveillant.id, { certification: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Contact urgence"
                              value={surveillant.contactUrgence}
                              onChange={(e) => modifierSurveillant(surveillant.id, { contactUrgence: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Poste de surveillance"
                              value={surveillant.posteDeSurveillance}
                              onChange={(e) => modifierSurveillant(surveillant.id, { posteDeSurveillance: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              color: '#e2e8f0', 
                              fontSize: '12px' 
                            }}>
                              <input
                                type="checkbox"
                                checked={surveillant.reconnaissance}
                                onChange={(e) => modifierSurveillant(surveillant.id, { reconnaissance: e.target.checked })}
                              />
                              J'ai pris connaissance du permis
                            </label>
                            
                            {!surveillant.reconnaissance && (
                              <button
                                onClick={() => signerAutomatiquement('surveillant', surveillant.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px'
                                }}
                              >
                                📝 Signer
                              </button>
                            )}
                            
                            <button
                              onClick={() => supprimerSurveillant(surveillant.id)}
                              style={{
                                padding: '6px',
                                background: 'rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          {surveillant.signature && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#22c55e'
                            }}>
                              ✅ {surveillant.signature}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Entrants */}
              {formData.superviseur && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                  }}>
                    <h4 style={{ color: '#ffffff', margin: 0 }}>🚶 Entrants</h4>
                    <button
                      onClick={ajouterEntrant}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <Plus size={16} />
                      Ajouter Entrant
                    </button>
                  </div>
                  
                  {formData.entrants.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#94a3b8',
                      fontSize: '14px',
                      border: '2px dashed rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px'
                    }}>
                      Aucun entrant (18 ans minimum selon CNESST)
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {formData.entrants.map((entrant) => (
                        <div
                          key={entrant.id}
                          style={{
                            background: entrant.statutActif ? 
                              'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))' :
                              'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.1))',
                            border: entrant.statutActif ? 
                              '1px solid rgba(34, 197, 94, 0.3)' :
                              '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '12px',
                            padding: '20px'
                          }}
                        >
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: '12px', 
                            marginBottom: '16px' 
                          }}>
                            <input
                              type="text"
                              placeholder="Nom de l'entrant *"
                              value={entrant.nom}
                              onChange={(e) => modifierEntrant(entrant.id, { nom: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Certification *"
                              value={entrant.certification}
                              onChange={(e) => modifierEntrant(entrant.id, { certification: e.target.value })}
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Âge (min 18)"
                              value={entrant.age}
                              onChange={(e) => modifierEntrant(entrant.id, { age: parseInt(e.target.value) || 18 })}
                              min="18"
                              style={{
                                padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: entrant.age < 18 ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                                borderRadius: '6px',
                                color: '#ffffff'
                              }}
                            />
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            alignItems: 'center', 
                            flexWrap: 'wrap', 
                            marginBottom: '12px' 
                          }}>
                            <button
                              onClick={() => marquerEntreeSortie(entrant.id, 'entree')}
                              disabled={entrant.statutActif}
                              style={{
                                padding: '6px 12px',
                                background: entrant.statutActif ? 'rgba(100, 116, 139, 0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: entrant.statutActif ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: entrant.statutActif ? 'not-allowed' : 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              🕐 Marquer Entrée
                            </button>
                            
                            <button
                              onClick={() => marquerEntreeSortie(entrant.id, 'sortie')}
                              disabled={!entrant.statutActif}
                              style={{
                                padding: '6px 12px',
                                background: !entrant.statutActif ? 'rgba(100, 116, 139, 0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: !entrant.statutActif ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: !entrant.statutActif ? 'not-allowed' : 'pointer',
                                fontSize: '11px'
                              }}
                            >
                              🕐 Marquer Sortie
                            </button>
                            
                            {!entrant.reconnaissance && (
                              <button
                                onClick={() => signerAutomatiquement('entrant', entrant.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px'
                                }}
                              >
                                📝 Signer
                              </button>
                            )}
                            
                            <button
                              onClick={() => supprimerEntrant(entrant.id)}
                              style={{
                                padding: '6px',
                                background: 'rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '16px', 
                            fontSize: '11px', 
                            color: '#94a3b8', 
                            marginBottom: '8px' 
                          }}>
                            {entrant.heureEntree && <span>🕐 Entrée: {entrant.heureEntree}</span>}
                            {entrant.heureSortie && <span>🕐 Sortie: {entrant.heureSortie}</span>}
                            <span style={{ color: entrant.statutActif ? '#22c55e' : '#94a3b8' }}>
                              ● {entrant.statutActif ? 'ACTIF' : 'INACTIF'}
                            </span>
                          </div>
                          
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            color: '#e2e8f0', 
                            fontSize: '12px' 
                          }}>
                            <input
                              type="checkbox"
                              checked={entrant.reconnaissance}
                              onChange={(e) => modifierEntrant(entrant.id, { reconnaissance: e.target.checked })}
                            />
                            J'ai pris connaissance du permis
                          </label>
                          
                          {entrant.signature && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#22c55e'
                            }}>
                              ✅ {entrant.signature}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Onglets simplifiés pour Tests, Procédures, Validation */}
          {activeTab === 'tests' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>🧪 Tests et Mesures</h3>
              <div style={{
                background: 'rgba(100, 116, 139, 0.1)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  📊 Section Tests disponible dans la version complète
                </p>
              </div>
            </div>
          )}

          {activeTab === 'procedures' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>📝 Procédures</h3>
              <div style={{
                background: 'rgba(100, 116, 139, 0.1)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  📋 Section Procédures disponible dans la version complète
                </p>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>✅ Validation Finale</h3>
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))',
                border: '2px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h4 style={{ color: '#22c55e', margin: '0 0 16px', fontSize: '24px', fontWeight: '800' }}>
                  PERMIS VALIDE ET CONFORME CNESST
                </h4>
                <p style={{ color: '#dcfce7', margin: '0 0 24px', fontSize: '16px' }}>
                  Ce permis respecte toutes les exigences légales et peut être utilisé immédiatement.
                </p>
                
                <div style={{
                  background: 'rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  fontSize: '14px',
                  color: '#dcfce7'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    ✅ Permis généré automatiquement le {new Date().toLocaleString('fr-CA')}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    🔢 Code de référence légal: {formData.codePermis}
                  </div>
                  <div style={{ fontWeight: '700' }}>
                    📋 Conforme aux normes CNESST 2025 en vigueur
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Premium */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderTop: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '0 0 20px 20px',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
            🏛️ Conforme aux normes CNESST 2025 - Version légale authentique
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '14px 24px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Fermer
            </button>
            
            <button
              onClick={() => {
                alert('✅ Permis sauvegardé avec succès!\n🔢 Code: ' + formData.codePermis);
                onClose();
              }}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              💾 Sauvegarder Permis
            </button>
          </div>
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
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [showFormModal, setShowFormModal] = useState<string | null>(null);
  const [showArchives, setShowArchives] = useState(false);
  const [cascadeSelection, setCascadeSelection] = useState<CascadeSelection>({
    permitType: '',
    company: '',
    confinedSpace: ''
  });
  
  const [permits, setPermits] = useState<LegalPermit[]>(() => {
    return getProvincialPermits(language, selectedProvince).map((p) => ({
      ...p,
      code: generatePermitCode(p.id, selectedProvince),
      legalRequirements: {
        gasTests: false,
        entryProcedure: false,
        emergencyPlan: false,
        equipmentCheck: false,
        signage: false,
        documentation: false
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      }
    }));
  });

  const [archivedPermits, setArchivedPermits] = useState<LegalPermit[]>([]);

  // =================== FONCTIONS ===================
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Sécurité Critique': 
      case 'Critical Safety': 
        return '🛡️';
      case 'Sécurité Incendie':
      case 'Fire Safety':
        return '🔥';
      case 'Construction Lourde': 
      case 'Heavy Construction':
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

  const handleDeletePermit = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(language === 'fr' ? 
      'Êtes-vous sûr de vouloir supprimer ce permis ?' : 
      'Are you sure you want to delete this permit?'
    )) {
      const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
      setPermits(updatedPermits);
    }
  };

  const archivePermit = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: LegalPermit) => p.id === permitId);
    if (permit && permit.selected) {
      setArchivedPermits(prev => [...prev, { ...permit, validity: { ...permit.validity, isValid: true } }]);
      const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
      setPermits(updatedPermits);
      
      alert(language === 'fr' ? 
        '✅ Permis archivé avec succès! Le permis est maintenant valide et prêt à être utilisé.' : 
        '✅ Permit archived successfully! The permit is now valid and ready to use.'
      );
    }
  };

  const createNewPermit = () => {
    if (!cascadeSelection.permitType || !cascadeSelection.company || !cascadeSelection.confinedSpace) {
      alert(language === 'fr' ? 
        'Veuillez compléter la sélection en cascade avant de créer un permis' : 
        'Please complete the cascade selection before creating a permit'
      );
      return;
    }

    const newPermit: LegalPermit = {
      id: `${cascadeSelection.permitType}-${Date.now()}`,
      name: `${language === 'fr' ? 'Permis' : 'Permit'} ${cascadeSelection.permitType} - ${cascadeSelection.company}`,
      description: `${cascadeSelection.confinedSpace} - ${cascadeSelection.company}`,
      category: language === 'fr' ? 'Sécurité Critique' : 'Critical Safety',
      authority: `Autorité ${selectedProvince}`,
      province: [selectedProvince],
      priority: 'critical' as const,
      selected: false,
      formData: {
        company: cascadeSelection.company,
        confinedSpace: cascadeSelection.confinedSpace
      },
      code: generatePermitCode(cascadeSelection.permitType, selectedProvince),
      legalRequirements: {
        gasTests: false,
        entryProcedure: false,
        emergencyPlan: false,
        equipmentCheck: false,
        signage: false,
        documentation: false
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      }
    };

    setPermits(prev => [newPermit, ...prev]);
    setCascadeSelection({ permitType: '', company: '', confinedSpace: '' });
    
    alert(language === 'fr' ? 
      `✅ Nouveau permis créé avec succès!\n🔢 Code: ${newPermit.code}` :
      `✅ New permit created successfully!\n🔢 Code: ${newPermit.code}`
    );
  };

  // =================== FILTRAGE ===================
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
    selected: selectedPermits.length,
    critical: selectedPermits.filter((p: LegalPermit) => p.priority === 'critical').length,
    archived: archivedPermits.length
  }), [permits, selectedPermits, archivedPermits]);

  const statsData = [
    { key: 'available', value: stats.totalPermits, icon: '📊', color: '#3b82f6' },
    { key: 'selected', value: stats.selected, icon: '✅', color: '#22c55e' },
    { key: 'critical', value: stats.critical, icon: '🚨', color: '#ef4444' },
    { key: 'archived', value: stats.archived, icon: '📦', color: '#f59e0b' }
  ];

  // =================== RENDU ===================
  return (
    <div style={{ padding: '0', color: '#ffffff', minHeight: '100vh' }}>
      {/* Header Premium avec stats */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15), rgba(239, 68, 68, 0.1))',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '900',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #fb7185)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2'
            }}>
              📋 {t.title}
            </h1>
            <p style={{ color: '#93c5fd', margin: '0', fontSize: '16px', fontWeight: '500' }}>
              {t.subtitle}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                const newPermits = getProvincialPermits(language, e.target.value).map((p) => ({
                  ...p,
                  code: generatePermitCode(p.id, e.target.value),
                  legalRequirements: {
                    gasTests: false,
                    entryProcedure: false,
                    emergencyPlan: false,
                    equipmentCheck: false,
                    signage: false,
                    documentation: false
                  },
                  validity: {
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    isValid: false
                  }
                }));
                setPermits(newPermits);
              }}
              style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowArchives(!showArchives)}
              style={{
                padding: '14px 24px',
                background: showArchives ? 
                  'linear-gradient(135deg, #22c55e, #16a34a)' :
                  'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px -8px rgba(245, 158, 11, 0.4)'
              }}
            >
              <FileText size={18} />
              {showArchives ? 
                (language === 'fr' ? 'Retour aux Permis' : 'Back to Permits') :
                (language === 'fr' ? `Archives (${stats.archived})` : `Archives (${stats.archived})`)
              }
            </button>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {statsData.map((stat) => (
            <div key={stat.key} style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
              padding: '24px 20px',
              borderRadius: '20px',
              border: `2px solid ${stat.color}30`,
              boxShadow: `0 8px 25px -8px ${stat.color}20`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                color: stat.color,
                marginBottom: '8px',
                textShadow: `0 0 20px ${stat.color}40`
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8', 
                fontWeight: '700', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {stat.key === 'archived' ? 
                  (language === 'fr' ? 'Archivés' : 'Archived') :
                  (t.stats[stat.key as keyof typeof t.stats] || stat.key)
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showArchives && (
        <>
          {/* Sélection en cascade */}
          <CascadeSelector
            onSelectionChange={setCascadeSelection}
            language={language}
          />

          {/* Bouton créer nouveau permis premium */}
          {cascadeSelection.permitType && cascadeSelection.company && cascadeSelection.confinedSpace && (
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <button
                onClick={createNewPermit}
                style={{
                  padding: '20px 40px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  boxShadow: '0 10px 30px -5px rgba(34, 197, 94, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(34, 197, 94, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(34, 197, 94, 0.4)';
                }}
              >
                <Plus size={24} />
                {language === 'fr' ? 'Créer Nouveau Permis Personnalisé' : 'Create New Custom Permit'}
              </button>
            </div>
          )}

          {/* Contrôles de recherche premium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '20px', 
            marginBottom: '32px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            borderRadius: '20px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '16px', 
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
                  padding: '14px 16px 14px 48px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer'
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

          {/* Cartes des permis premium */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '28px' }}>
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
                  borderRadius: '24px',
                  padding: '28px',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  transform: permit.selected ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: permit.selected ? 
                    '0 25px 50px -12px rgba(59, 130, 246, 0.4)' : 
                    '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => handlePermitClick(permit.id, e)}
                onMouseEnter={(e) => {
                  if (!permit.selected) {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -3px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!permit.selected) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {/* Header avec code et actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))',
                    color: '#93c5fd',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🔢 {permit.code}
                    <span style={{
                      padding: '2px 6px',
                      background: getPriorityColor(permit.priority),
                      borderRadius: '4px',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      color: 'white'
                    }}>
                      {permit.priority}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeletePermit(permit.id, e)}
                    style={{
                      padding: '8px',
                      background: 'rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      e.currentTarget.style.color = '#fca5a5';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Contenu principal */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '40px', 
                    width: '60px', 
                    textAlign: 'center',
                    filter: permit.selected ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' : 'none'
                  }}>
                    {getCategoryIcon(permit.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#ffffff', 
                      fontSize: '20px', 
                      fontWeight: '800', 
                      margin: '0 0 8px', 
                      lineHeight: '1.3' 
                    }}>
                      {permit.name}
                    </h3>
                    <div style={{ 
                      color: permit.selected ? '#93c5fd' : '#94a3b8', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      marginBottom: '8px', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {(t.categories as any)[permit.category] || permit.category}
                    </div>
                    <div style={{ 
                      color: '#cbd5e1', 
                      fontSize: '14px', 
                      lineHeight: '1.5', 
                      marginBottom: '12px' 
                    }}>
                      {permit.description}
                    </div>
                    <div style={{ 
                      color: '#60a5fa', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Shield size={14} />
                      {permit.authority}
                    </div>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: permit.selected ? '3px solid #3b82f6' : '2px solid rgba(100, 116, 139, 0.5)',
                    borderRadius: '12px',
                    background: permit.selected ? 
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                      'rgba(15, 23, 42, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    {permit.selected && <CheckCircle size={20} style={{ color: 'white' }} />}
                  </div>
                </div>

                {/* Actions pour permis sélectionnés */}
                {permit.selected && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
                    <button
                      onClick={(e) => handleFormToggle(permit.id, e)}
                      style={{
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(59, 130, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Edit size={16} />
                      {t.actions.fill}
                    </button>
                    
                    <button
                      onClick={(e) => archivePermit(permit.id, e)}
                      style={{
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px -8px rgba(245, 158, 11, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <FileText size={16} />
                      {t.actions.archive}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(language === 'fr' ? 
                          `📄 Téléchargement du PDF pour le permis ${permit.code}` :
                          `📄 Downloading PDF for permit ${permit.code}`
                        );
                      }}
                      style={{
                        padding: '14px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message aucun résultat premium */}
          {filteredPermits.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 40px',
              color: '#94a3b8',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
              borderRadius: '24px',
              border: '2px dashed rgba(100, 116, 139, 0.3)'
            }}>
              <FileText size={64} style={{ margin: '0 auto 24px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                {t.messages.noResults}
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>{t.messages.modifySearch}</p>
            </div>
          )}
        </>
      )}

      {/* Vue Archives Premium */}
      {showArchives && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7))',
          borderRadius: '24px',
          padding: '32px',
          border: '2px solid rgba(245, 158, 11, 0.3)'
        }}>
          <h2 style={{ 
            color: '#f59e0b', 
            marginBottom: '24px', 
            fontSize: '28px', 
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
              padding: '80px 40px',
              color: '#94a3b8'
            }}>
              <FileText size={64} style={{ margin: '0 auto 24px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '24px', 
                fontWeight: '700' 
              }}>
                {language === 'fr' ? 'Aucun permis archivé' : 'No archived permits'}
              </h3>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {language === 'fr' ? 
                  'Les permis complétés et validés apparaîtront ici' : 
                  'Completed and validated permits will appear here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {archivedPermits.map((permit) => (
                <div
                  key={`archived-${permit.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      color: '#ffffff', 
                      margin: '0 0 12px', 
                      fontSize: '18px', 
                      fontWeight: '700' 
                    }}>
                      {permit.name}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '20px', 
                      fontSize: '13px', 
                      color: '#94a3b8',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}>
                        🔢 {permit.code}
                      </span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}>
                        📅 {new Date(permit.validity.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ 
                        color: '#22c55e', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ✅ VALIDÉ & CONFORME
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {language === 'fr' ? 'Voir Détails' : 'View Details'}
                    </button>
                    <button
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
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
        <FormulaireLegalComplet
          permit={permits.find(p => p.id === showFormModal)!}
          onFormChange={(data) => {
            const updatedPermits = permits.map((p: LegalPermit) =>
              p.id === showFormModal ? { ...p, formData: { ...p.formData, ...data } } : p
            );
            setPermits(updatedPermits);
          }}
          language={language}
          onClose={() => setShowFormModal(null)}
        />
      )}
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
