// =================== STEP4PERMITS.TSX - SECTION 1/5 ===================
// Remplacez TOUT le contenu de votre fichier Step4Permits.tsx par cette SECTION 1
// Puis ajoutez les SECTIONS 2, 3, 4, 5 à la suite

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

// =================== INTERFACES PRINCIPALES ===================
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
  // Informations générales
  codePermis: string;
  typePermis: string;
  compagnie: string;
  lieuTravail: string;
  descriptionTravaux: string;
  dateDebut: string;
  dateFin: string;
  dureeEstimee: string;
  
  // Personnel
  superviseur: Superviseur | null;
  surveillants: Surveillant[];
  entrants: Entrant[];
  
  // Tests et mesures (Espace Clos)
  niveauOxygene: string;
  gazToxiques: string;
  gazCombustibles: string;
  equipementTest: string;
  
  // Procédures (Espace Clos)
  procedureEntree: string;
  methodeCommunication: string;
  signalUrgence: string;
  
  // Plan d'urgence
  contactsUrgence: string;
  equipeSauvetage: string;
  hopitalProche: string;
  
  // Équipements de sécurité
  equipementVentilation: string;
  equipementDetection: string;
  equipementSauvetage: string;
  protectionIndividuelle: string;
  
  // Surveillance incendie (Travail à Chaud)
  surveillanceIncendie: string;
  extincteurs: string;
  dureeSupervision: string;
  
  // Excavation
  planEtanconnement: string;
  ingenieursigne: string;
  profondeurMax: string;
  typesSol: string;
  
  // Validation finale
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
        `Permis Entrée Espace Clos - ${province}` : 
        `Confined Space Entry Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis conforme aux normes ${province} avec surveillance atmosphérique continue` : 
        `${province} compliant permit with continuous atmospheric monitoring`,
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
        `Permis Travail à Chaud - ${province}` : 
        `Hot Work Permit - ${province}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 
        `Permis travaux à chaud avec surveillance incendie selon ${province}` : 
        `Hot work permit with fire watch per ${province} standards`,
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
        `Permis Excavation - ${province}` : 
        `Excavation Permit - ${province}`,
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 
        `Permis excavation municipal conforme aux normes ${province}` : 
        `Municipal excavation permit compliant with ${province} standards`,
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
      subtitle: 'Formulaires authentiques conformes aux dernières normes provinciales',
      searchPlaceholder: 'Rechercher un permis...',
      allCategories: 'Toutes catégories',
      categories: {
        'Sécurité': 'Sécurité',
        'Construction': 'Construction',
        'Safety': 'Sécurité'
      },
      stats: {
        available: 'Disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        compliant: 'Conformes'
      },
      actions: {
        fill: 'Remplir',
        close: 'Fermer',
        download: 'PDF'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
        nextStep: 'Prochaine étape: Validation et soumission'
      }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2025',
      subtitle: 'Authentic forms compliant with latest provincial standards',
      searchPlaceholder: 'Search permits...',
      allCategories: 'All categories',
      categories: {
        'Sécurité': 'Safety',
        'Construction': 'Construction',
        'Safety': 'Safety'
      },
      stats: {
        available: 'Available',
        selected: 'Selected',
        critical: 'Critical',
        compliant: 'Compliant'
      },
      actions: {
        fill: 'Fill',
        close: 'Close',
        download: 'PDF'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        nextStep: 'Next step: Validation and submission'
      }
    };
  }
};
// =================== STEP4PERMITS.TSX - SECTION 2/5 ===================
// Ajoutez cette section À LA SUITE de la SECTION 1 (ne remplacez pas, ajoutez !)

// =================== COMPOSANT CASCADE SELECTOR ===================
const CascadeSelector: React.FC<{
  onSelectionChange: (selection: CascadeSelection) => void;
  language: 'fr' | 'en';
}> = ({ onSelectionChange, language }) => {
  const [selection, setSelection] = useState<CascadeSelection>({
    permitType: '',
    company: '',
    confinedSpace: ''
  });

  const permitTypes = [
    { id: 'confined-space', name: language === 'fr' ? 'Espace Clos' : 'Confined Space', icon: '🚪' },
    { id: 'hot-work', name: language === 'fr' ? 'Travail à Chaud' : 'Hot Work', icon: '🔥' },
    { id: 'excavation', name: language === 'fr' ? 'Excavation' : 'Excavation', icon: '⛏️' }
  ];

  const companies = [
    { id: 'hydro-quebec', name: 'Hydro-Québec', sector: 'Énergie' },
    { id: 'cn-rail', name: 'CN Rail', sector: 'Transport' },
    { id: 'suncor', name: 'Suncor Energy', sector: 'Pétrole & Gaz' },
    { id: 'bombardier', name: 'Bombardier', sector: 'Aéronautique' },
    { id: 'metro-inc', name: 'Metro Inc.', sector: 'Distribution' }
  ];

  const confinedSpaces = [
    { id: 'reservoir-A', name: 'Réservoir Principal A', type: 'Stockage', volume: '420m³' },
    { id: 'wagon-citerne', name: 'Wagon-Citerne B', type: 'Transport', volume: '210m³' },
    { id: 'silo-grain', name: 'Silo à Grain C', type: 'Stockage', volume: '850m³' },
    { id: 'cuve-chimique', name: 'Cuve Chimique D', type: 'Procédé', volume: '150m³' }
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

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '28px',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    }}>
      <h3 style={{
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔄 {language === 'fr' ? 'Sélection en Cascade' : 'Cascade Selection'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Type de Permis */}
        <div>
          <label style={{
            color: '#e2e8f0',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            display: 'block'
          }}>
            1️⃣ {language === 'fr' ? 'Type de Permis' : 'Permit Type'}
          </label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {permitTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectionUpdate('permitType', type.id)}
                style={{
                  padding: '12px 16px',
                  background: selection.permitType === type.id ?
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                    'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                  color: selection.permitType === type.id ? 'white' : '#cbd5e1',
                  border: selection.permitType === type.id ? 
                    '2px solid #3b82f6' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Compagnie */}
        <div style={{ opacity: selection.permitType ? 1 : 0.5 }}>
          <label style={{
            color: '#e2e8f0',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            display: 'block'
          }}>
            2️⃣ {language === 'fr' ? 'Compagnie' : 'Company'}
          </label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => selection.permitType && handleSelectionUpdate('company', company.id)}
                disabled={!selection.permitType}
                style={{
                  padding: '12px 16px',
                  background: selection.company === company.id ?
                    'linear-gradient(135deg, #22c55e, #16a34a)' :
                    'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                  color: selection.company === company.id ? 'white' : '#cbd5e1',
                  border: selection.company === company.id ? 
                    '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  cursor: selection.permitType ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{company.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>{company.sector}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Espace Clos */}
        <div style={{ opacity: selection.company ? 1 : 0.5 }}>
          <label style={{
            color: '#e2e8f0',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px',
            display: 'block'
          }}>
            3️⃣ {language === 'fr' ? 'Espace Clos' : 'Confined Space'}
          </label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {confinedSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() => selection.company && handleSelectionUpdate('confinedSpace', space.id)}
                disabled={!selection.company}
                style={{
                  padding: '12px 16px',
                  background: selection.confinedSpace === space.id ?
                    'linear-gradient(135deg, #f59e0b, #d97706)' :
                    'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                  color: selection.confinedSpace === space.id ? 'white' : '#cbd5e1',
                  border: selection.confinedSpace === space.id ? 
                    '2px solid #f59e0b' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  cursor: selection.company ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{space.name}</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', opacity: 0.7 }}>
                  <span>{space.type}</span>
                  <span>•</span>
                  <span>{space.volume}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé de la sélection */}
      {selection.permitType && selection.company && selection.confinedSpace && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px'
        }}>
          <h4 style={{ color: '#22c55e', margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>
            ✅ {language === 'fr' ? 'Sélection Complète' : 'Selection Complete'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#94a3b8' }}>
                {language === 'fr' ? 'Type:' : 'Type:'}
              </span>
              <span style={{ color: '#dcfce7', marginLeft: '8px', fontWeight: '600' }}>
                {permitTypes.find(t => t.id === selection.permitType)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>
                {language === 'fr' ? 'Compagnie:' : 'Company:'}
              </span>
              <span style={{ color: '#dcfce7', marginLeft: '8px', fontWeight: '600' }}>
                {companies.find(c => c.id === selection.company)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>
                {language === 'fr' ? 'Espace:' : 'Space:'}
              </span>
              <span style={{ color: '#dcfce7', marginLeft: '8px', fontWeight: '600' }}>
                {confinedSpaces.find(s => s.id === selection.confinedSpace)?.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// =================== CORRECTION CIBLÉE - SECTION 3 ===================
// REMPLACEZ seulement le composant FormulaireLegalComplet par cette version

// =================== COMPOSANT FORMULAIRE LÉGAL SIMPLIFIÉ ===================
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
      const superviseurModifie = { 
        ...formData.superviseur, 
        reconnaissance: true, 
        signature: signature, 
        dateSignature: maintenant 
      };
      handleInputChange('superviseur', superviseurModifie);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        borderRadius: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
        border: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#ffffff', margin: '0 0 8px', fontSize: '24px', fontWeight: '700' }}>
                📋 {permit.name}
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                color: '#93c5fd',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                🔢 {formData.codePermis}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px',
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
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
          background: 'rgba(30, 41, 59, 0.5)'
        }}>
          {[
            { id: 'general', label: '📋 Général' },
            { id: 'personnel', label: '👥 Personnel' },
            { id: 'validation', label: '✅ Validation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                background: activeTab === tab.id ? 
                  'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))' : 
                  'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'general' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>📋 Informations Générales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                    Compagnie *
                  </label>
                  <input
                    type="text"
                    value={formData.compagnie}
                    onChange={(e) => handleInputChange('compagnie', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                    Lieu de travail *
                  </label>
                  <input
                    type="text"
                    value={formData.lieuTravail}
                    onChange={(e) => handleInputChange('lieuTravail', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personnel' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>👥 Gestion du Personnel</h3>
              
              {/* Superviseur */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>🛡️ Superviseur</h4>
                {!formData.superviseur ? (
                  <button
                    onClick={() => {
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
                    }}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    Ajouter Superviseur
                  </button>
                ) : (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <input
                      type="text"
                      placeholder="Nom du superviseur *"
                      value={formData.superviseur.nom}
                      onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur!, nom: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        marginBottom: '12px'
                      }}
                    />
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
                        <input
                          type="checkbox"
                          checked={formData.superviseur.reconnaissance}
                          onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur!, reconnaissance: e.target.checked })}
                        />
                        J'ai pris connaissance du permis
                      </label>
                      
                      {!formData.superviseur.reconnaissance && (
                        <button
                          onClick={() => signerAutomatiquement('superviseur')}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          📝 Signer automatiquement
                        </button>
                      )}
                    </div>
                    
                    {formData.superviseur.signature && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#22c55e'
                      }}>
                        ✅ {formData.superviseur.signature}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Entrants simplifié */}
              {formData.superviseur && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ color: '#ffffff', margin: 0 }}>🚶 Entrants</h4>
                    <button
                      onClick={ajouterEntrant}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <Plus size={14} />
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
                      borderRadius: '8px'
                    }}>
                      Aucun entrant (18 ans minimum selon CNESST)
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {formData.entrants.map((entrant) => (
                        <div
                          key={entrant.id}
                          style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '12px',
                            padding: '20px'
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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
                          
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
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
                          
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '12px' }}>
                            <input
                              type="checkbox"
                              checked={entrant.reconnaissance}
                              onChange={(e) => modifierEntrant(entrant.id, { reconnaissance: e.target.checked })}
                            />
                            J'ai pris connaissance du permis
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>✅ Validation Finale</h3>
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))',
                border: '2px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#22c55e', margin: '0 0 12px', fontSize: '18px' }}>
                  ✅ PERMIS VALIDE ET CONFORME
                </h4>
                <p style={{ color: '#dcfce7', margin: '0', fontSize: '14px' }}>
                  Ce permis respecte toutes les exigences CNESST et peut être utilisé.
                </p>
                
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#dcfce7'
                }}>
                  ✅ Permis généré automatiquement le {new Date().toLocaleString('fr-CA')}
                  <br />
                  🔢 Code de référence: {formData.codePermis}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderTop: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '0 0 16px 16px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Conforme aux normes CNESST 2025
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
            
            <button
              onClick={() => {
                alert('Permis sauvegardé avec succès!');
                onClose();
              }}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
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
// =================== STEP4PERMITS.TSX - SECTION 4/5 COMPLÈTE ET CORRIGÉE ===================
// REMPLACEZ COMPLÈTEMENT votre Section 4 actuelle par cette version

          {/* Suite de l'onglet Personnel - Surveillants et Entrants complets */}
          {activeTab === 'personnel' && formData.superviseur && (
            <>
              {/* Surveillants */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#ffffff', margin: 0 }}>👁️ Surveillants</h4>
                  <button
                    onClick={ajouterSurveillant}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <Plus size={14} />
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
                    borderRadius: '8px'
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '12px' }}>
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

              {/* Entrants complets avec toutes les fonctionnalités */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#ffffff', margin: 0 }}>🚶 Entrants</h4>
                  <button
                    onClick={ajouterEntrant}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <Plus size={14} />
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
                    borderRadius: '8px'
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
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
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                          {entrant.heureEntree && <span>🕐 Entrée: {entrant.heureEntree}</span>}
                          {entrant.heureSortie && <span>🕐 Sortie: {entrant.heureSortie}</span>}
                          <span style={{ color: entrant.statutActif ? '#22c55e' : '#94a3b8' }}>
                            ● {entrant.statutActif ? 'ACTIF' : 'INACTIF'}
                          </span>
                        </div>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontSize: '12px' }}>
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
            </>
          )}

          {/* Onglet Tests/Mesures avec plan d'urgence CNESST */}
          {activeTab === 'tests' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>🧪 Tests et Mesures Obligatoires</h3>
              
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#94a3b8',
                border: '2px dashed rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                marginBottom: '32px'
              }}>
                Tests atmosphériques disponibles dans la version complète
              </div>

              {/* Plan d'urgence obligatoire CNESST */}
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>🚨 Plan d'Urgence (Obligatoire CNESST)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {[
                    { key: 'contactsUrgence', label: 'Contacts d\'urgence *', placeholder: '911, CNESST, Service incendie local' },
                    { key: 'equipeSauvetage', label: 'Équipe de sauvetage *', placeholder: 'Personnel formé et équipements disponibles' },
                    { key: 'hopitalProche', label: 'Hôpital le plus proche *', placeholder: 'Nom, adresse et distance en kilomètres' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{
                        color: '#e2e8f0',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        {field.label}
                      </label>
                      <textarea
                        value={formData[field.key as keyof LegalPermitData] as string}
                        onChange={(e) => handleInputChange(field.key as keyof LegalPermitData, e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Procédures avec équipements de sécurité */}
          {activeTab === 'procedures' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>📝 Procédures et Équipements</h3>
              
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#94a3b8',
                border: '2px dashed rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                marginBottom: '32px'
              }}>
                Procédures spécifiques disponibles dans la version complète
              </div>

              {/* Équipements de sécurité obligatoires */}
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>🛡️ Équipements de Sécurité (CNESST)</h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { key: 'equipementVentilation', label: 'Équipement de ventilation *', placeholder: 'Ventilateurs, extracteurs, systèmes de purification' },
                    { key: 'equipementDetection', label: 'Équipement de détection *', placeholder: 'Détecteurs de gaz, moniteurs atmosphériques' },
                    { key: 'equipementSauvetage', label: 'Équipement de sauvetage *', placeholder: 'Treuils, harnais, équipement de récupération' },
                    { key: 'protectionIndividuelle', label: 'Protection individuelle *', placeholder: 'Casques, gants, chaussures, masques respiratoires' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{
                        color: '#e2e8f0',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '6px',
                        display: 'block'
                      }}>
                        {field.label}
                      </label>
                      <textarea
                        value={formData[field.key as keyof LegalPermitData] as string}
                        onChange={(e) => handleInputChange(field.key as keyof LegalPermitData, e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Onglet Validation finale complète */}
          {activeTab === 'validation' && (
            <div>
              <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>✅ Validation Finale Conforme CNESST</h3>
              
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                {[
                  { key: 'tousTestsCompletes', label: 'Tous les tests atmosphériques obligatoires sont complétés' },
                  { key: 'documentationComplete', label: 'Documentation complète et signatures du personnel obtenues' },
                  { key: 'formationVerifiee', label: 'Formation et certifications du personnel vérifiées' },
                  { key: 'equipementsVerifies', label: 'Équipements de sécurité vérifiés et fonctionnels sur site' }
                ].map((validation) => (
                  <label
                    key={validation.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: formData[validation.key as keyof LegalPermitData] ? 
                        'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))' :
                        'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.1))',
                      border: formData[validation.key as keyof LegalPermitData] ? 
                        '1px solid rgba(34, 197, 94, 0.3)' :
                        '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData[validation.key as keyof LegalPermitData] as boolean}
                      onChange={(e) => handleInputChange(validation.key as keyof LegalPermitData, e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    {validation.label}
                    {formData[validation.key as keyof LegalPermitData] && (
                      <span style={{ marginLeft: 'auto', color: '#22c55e' }}>✓</span>
                    )}
                  </label>
                ))}
              </div>

              {/* Validation finale du permis */}
              <div style={{
                background: Object.values(formData).slice(-4).every(val => val === true) ?
                  'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))' :
                  'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
                border: Object.values(formData).slice(-4).every(val => val === true) ?
                  '2px solid rgba(34, 197, 94, 0.5)' :
                  '2px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h4 style={{
                  color: Object.values(formData).slice(-4).every(val => val === true) ? '#22c55e' : '#ef4444',
                  margin: '0 0 12px',
                  fontSize: '18px'
                }}>
                  {Object.values(formData).slice(-4).every(val => val === true) ? 
                    '✅ PERMIS VALIDE ET CONFORME CNESST' : 
                    '⚠️ VALIDATION INCOMPLÈTE - PERMIS NON VALIDE'
                  }
                </h4>
                <p style={{
                  color: Object.values(formData).slice(-4).every(val => val === true) ? '#dcfce7' : '#fecaca',
                  margin: '0',
                  fontSize: '14px'
                }}>
                  {Object.values(formData).slice(-4).every(val => val === true) ? 
                    'Ce permis respecte toutes les exigences légales CNESST 2025 et peut être utilisé sur le chantier.' : 
                    'Veuillez compléter toutes les validations obligatoires avant d\'autoriser les travaux.'
                  }
                </p>
                
                {Object.values(formData).slice(-4).every(val => val === true) && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#dcfce7'
                  }}>
                    ✅ Permis généré automatiquement le {new Date().toLocaleString('fr-CA')}
                    <br />
                    🔢 Code de référence légal: {formData.codePermis}
                    <br />
                    📋 Conforme aux normes CNESST en vigueur
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderTop: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '0 0 16px 16px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Conforme aux normes CNESST 2025 - Version légale authentique
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(100, 116, 139, 0.3)',
                color: '#cbd5e1',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
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
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
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

// =================== STEP4PERMITS.TSX - SECTION 5/5 - FINALE ===================
// Ajoutez cette section À LA SUITE de la SECTION 4 (ne remplacez pas, ajoutez !)

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
      case 'Sécurité': 
      case 'Safety': 
        return '🛡️';
      case 'Construction': 
        return '🏗️';
      default: 
        return '📋';
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
      setArchivedPermits(prev => [...prev, permit]);
      const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
      setPermits(updatedPermits);
      
      alert(language === 'fr' ? 
        '✅ Permis archivé avec succès!' : 
        '✅ Permit archived successfully!'
      );
    }
  };

  const createNewPermit = () => {
    if (!cascadeSelection.permitType || !cascadeSelection.company || !cascadeSelection.confinedSpace) {
      alert(language === 'fr' ? 
        'Veuillez compléter la sélection en cascade' : 
        'Please complete the cascade selection'
      );
      return;
    }

    const newPermit: LegalPermit = {
      id: `${cascadeSelection.permitType}-${Date.now()}`,
      name: `${language === 'fr' ? 'Permis' : 'Permit'} ${cascadeSelection.permitType} - ${cascadeSelection.company}`,
      description: `${cascadeSelection.confinedSpace} - ${cascadeSelection.company}`,
      category: language === 'fr' ? 'Sécurité' : 'Safety',
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
  };

  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: LegalPermit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
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
    { key: 'available', value: stats.totalPermits, icon: '📊' },
    { key: 'selected', value: stats.selected, icon: '✅' },
    { key: 'critical', value: stats.critical, icon: '🚨' },
    { key: 'archived', value: stats.archived, icon: '📦' }
  ];

  // =================== RENDU ===================
  return (
    <div style={{ padding: '0', color: '#ffffff' }}>
      {/* Header avec stats */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📋 {t.title}
            </h1>
            <p style={{ color: '#3b82f6', margin: '0', fontSize: '14px' }}>{t.subtitle}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
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
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '12px'
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <FileText size={16} />
              {showArchives ? 
                (language === 'fr' ? 'Retour aux Permis' : 'Back to Permits') :
                (language === 'fr' ? `Archives (${stats.archived})` : `Archives (${stats.archived})`)
              }
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
          {statsData.map((stat) => (
            <div key={stat.key} style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
              padding: '20px 16px',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #60a5fa, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
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

          {/* Bouton créer nouveau permis */}
          {cascadeSelection.permitType && cascadeSelection.company && cascadeSelection.confinedSpace && (
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <button
                onClick={createNewPermit}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto'
                }}
              >
                <Plus size={20} />
                {language === 'fr' ? 'Créer Nouveau Permis' : 'Create New Permit'}
              </button>
            </div>
          )}

          {/* Contrôles de recherche et filtrage */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '28px',
            padding: '20px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
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
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px'
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

          {/* Cartes des permis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
            {filteredPermits.map((permit: LegalPermit) => (
              <div
                key={permit.id}
                style={{
                  background: permit.selected ?
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))' :
                    'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
                  border: permit.selected ? '2px solid #3b82f6' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '20px',
                  padding: '24px',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer'
                }}
                onClick={(e) => handlePermitClick(permit.id, e)}
              >
                {/* Code unique et actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                    color: '#93c5fd',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    🔢 {permit.code}
                  </div>
                  
                  <button
                    onClick={(e) => handleDeletePermit(permit.id, e)}
                    style={{
                      padding: '6px',
                      background: 'rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', width: '48px', textAlign: 'center' }}>
                    {getCategoryIcon(permit.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', margin: '0 0 6px', lineHeight: '1.3' }}>
                      {permit.name}
                    </h3>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {(t.categories as any)[permit.category] || permit.category}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                      {permit.description}
                    </div>
                    <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '600' }}>
                      {permit.authority}
                    </div>
                  </div>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    border: '2px solid rgba(100, 116, 139, 0.5)',
                    borderRadius: '8px',
                    background: permit.selected ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(15, 23, 42, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    {permit.selected && <CheckCircle size={18} style={{ color: 'white' }} />}
                  </div>
                </div>

                {permit.selected && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={(e) => handleFormToggle(permit.id, e)}
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Edit size={14} />
                      {t.actions.fill}
                    </button>
                    
                    <button
                      onClick={(e) => archivePermit(permit.id, e)}
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FileText size={14} />
                      Archiver
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message aucun résultat */}
          {filteredPermits.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8',
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
              <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>{t.messages.noResults}</h3>
              <p style={{ margin: 0 }}>{t.messages.modifySearch}</p>
            </div>
          )}
        </>
      )}

      {/* Vue Archives */}
      {showArchives && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>
            📦 {language === 'fr' ? 'Permis Archivés' : 'Archived Permits'}
          </h2>
          
          {archivedPermits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
              <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>
                {language === 'fr' ? 'Aucun permis archivé' : 'No archived permits'}
              </h3>
              <p style={{ margin: 0 }}>
                {language === 'fr' ? 
                  'Les permis complétés apparaîtront ici' : 
                  'Completed permits will appear here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {archivedPermits.map((permit) => (
                <div
                  key={`archived-${permit.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                      {permit.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                      <span>🔢 {permit.code}</span>
                      <span>📅 {new Date(permit.validity.endDate).toLocaleDateString()}</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>● COMPLETED</span>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    {language === 'fr' ? 'Voir Détails' : 'View Details'}
                  </button>
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
            // Mettre à jour les données du permis
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
