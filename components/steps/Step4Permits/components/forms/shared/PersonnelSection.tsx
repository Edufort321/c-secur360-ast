// =================== COMPONENTS/FORMS/PERSONNELSECTION.TSX - SECTION PERSONNEL MOBILE-FIRST ===================
// Section personnel avec gestion équipe, certifications, rôles spécialisés et validation temps réel mobile

"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield, 
  Award, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Camera,
  QrCode,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Copy,
  Star,
  Zap,
  HardHat,
  Wrench,
  Activity,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Settings
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export interface PermitFormData {
  [key: string]: any;
}

export interface FieldError {
  message: { fr: string; en: string };
  code: string;
}

export interface CertificationData {
  id: string;
  name: { fr: string; en: string };
  issuer: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  isValid: boolean;
}

export interface Entrant {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  certifications: CertificationData[];
}

export interface Surveillant {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  certifications: CertificationData[];
}

export interface Superviseur {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  certifications: CertificationData[];
}

export interface PersonneCompetente {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  certifications: CertificationData[];
}

export interface PersonnelSpecialise {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  certifications: CertificationData[];
}

// =================== FONCTIONS UTILITAIRES ===================
const generatePersonnelId = (): string => {
  return `personnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validatePersonnelData = (personnel: PersonnelFormData, roleConfig: RoleConfig): FieldError | null => {
  if (personnel.age < roleConfig.minAge) {
    return {
      message: {
        fr: `Âge minimum requis: ${roleConfig.minAge} ans`,
        en: `Minimum age required: ${roleConfig.minAge} years`
      },
      code: 'AGE_TOO_LOW'
    };
  }
  
  if (!personnel.nom || !personnel.prenom) {
    return {
      message: {
        fr: 'Nom et prénom requis',
        en: 'First and last name required'
      },
      code: 'NAME_REQUIRED'
    };
  }
  
  return null;
};

// =================== CONSTANTES RÉGLEMENTATIONS ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    minAge: 18,
    maxWorkHours: 12,
    certificationRequired: true,
    authority: 'CNESST'
  },
  ON: {
    minAge: 18,
    maxWorkHours: 12,
    certificationRequired: true,
    authority: 'Ministry of Labour'
  },
  AB: {
    minAge: 18,
    maxWorkHours: 12,
    certificationRequired: true,
    authority: 'Alberta Labour'
  },
  BC: {
    minAge: 18,
    maxWorkHours: 12,
    certificationRequired: true,
    authority: 'WorkSafeBC'
  }
};

// =================== INTERFACES SECTION ===================
interface PersonnelSectionProps {
  data: Partial<PermitFormData>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, FieldError>;
  language: 'fr' | 'en';
  permitType: PermitType;
  province: string;
  touchOptimized?: boolean;
  enableQRScan?: boolean;
  enablePhotoCapture?: boolean;
}

interface PersonnelFormData {
  id?: string;
  nom: string;
  prenom: string;
  age: number;
  telephone?: string;
  email?: string;
  entreprise: string;
  poste: string;
  experience: number; // années
  certifications: CertificationData[];
  formation: string[];
  dateFormation?: Date;
  photo?: string;
  signature?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
}

interface RoleConfig {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  icon: React.ReactNode;
  color: string;
  required: boolean;
  minAge: number;
  maxPersons: number;
  requiredCertifications: string[];
  responsibilities: { fr: string[]; en: string[] };
  competencies: { fr: string[]; en: string[] };
}

// =================== CONFIGURATION RÔLES PAR TYPE PERMIS ===================
const PERSONNEL_ROLES: Record<PermitType, Record<string, RoleConfig>> = {
  'espace-clos': {
    'superviseur': {
      id: 'superviseur',
      title: { fr: 'Superviseur d\'entrée', en: 'Entry Supervisor' },
      description: { fr: 'Responsable global de l\'opération', en: 'Overall operation supervisor' },
      icon: <Shield className="w-5 h-5" />,
      color: '#DC2626',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['espace-clos-superviseur', 'premiers-secours'],
      responsibilities: {
        fr: ['Autoriser l\'entrée', 'Coordonner les équipes', 'Gérer les urgences'],
        en: ['Authorize entry', 'Coordinate teams', 'Manage emergencies']
      },
      competencies: {
        fr: ['5+ ans expérience', 'Formation supervision', 'Certification espace clos'],
        en: ['5+ years experience', 'Supervision training', 'Confined space certification']
      }
    },
    'surveillant': {
      id: 'surveillant',
      title: { fr: 'Surveillant extérieur', en: 'External Attendant' },
      description: { fr: 'Surveillance continue depuis l\'extérieur', en: 'Continuous monitoring from outside' },
      icon: <Eye className="w-5 h-5" />,
      color: '#EA580C',
      required: true,
      minAge: 18,
      maxPersons: 2,
      requiredCertifications: ['espace-clos-surveillant', 'communication'],
      responsibilities: {
        fr: ['Surveiller en continu', 'Maintenir communication', 'Déclencher évacuation'],
        en: ['Continuous monitoring', 'Maintain communication', 'Trigger evacuation']
      },
      competencies: {
        fr: ['Formation surveillance', 'Procédures urgence', 'Équipements communication'],
        en: ['Monitoring training', 'Emergency procedures', 'Communication equipment']
      }
    },
    'entrants': {
      id: 'entrants',
      title: { fr: 'Entrants autorisés', en: 'Authorized Entrants' },
      description: { fr: 'Personnel autorisé à entrer dans l\'espace', en: 'Personnel authorized to enter space' },
      icon: <Users className="w-5 h-5" />,
      color: '#0369A1',
      required: true,
      minAge: 18,
      maxPersons: 6,
      requiredCertifications: ['espace-clos-entrant', 'equipements-protection'],
      responsibilities: {
        fr: ['Effectuer les travaux', 'Respecter procédures', 'Signaler dangers'],
        en: ['Perform work', 'Follow procedures', 'Report hazards']
      },
      competencies: {
        fr: ['Formation entrant', 'Équipements sécurité', 'Procédures évacuation'],
        en: ['Entrant training', 'Safety equipment', 'Evacuation procedures']
      }
    }
  },
  'travail-chaud': {
    'superviseur': {
      id: 'superviseur',
      title: { fr: 'Superviseur travail à chaud', en: 'Hot Work Supervisor' },
      description: { fr: 'Responsable opérations de soudage/découpage', en: 'Welding/cutting operations supervisor' },
      icon: <Zap className="w-5 h-5" />,
      color: '#DC2626',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['travail-chaud-superviseur', 'prevention-incendie'],
      responsibilities: {
        fr: ['Évaluer risques incendie', 'Autoriser travaux', 'Superviser sécurité'],
        en: ['Assess fire risks', 'Authorize work', 'Supervise safety']
      },
      competencies: {
        fr: ['Expertise soudage', 'Prévention incendie', 'Gestion permis'],
        en: ['Welding expertise', 'Fire prevention', 'Permit management']
      }
    },
    'surveillant-incendie': {
      id: 'surveillant-incendie',
      title: { fr: 'Surveillant incendie', en: 'Fire Watch' },
      description: { fr: 'Surveillance incendie pendant et après travaux', en: 'Fire monitoring during and after work' },
      icon: <Activity className="w-5 h-5" />,
      color: '#EA580C',
      required: true,
      minAge: 18,
      maxPersons: 2,
      requiredCertifications: ['surveillant-incendie', 'utilisation-extincteurs'],
      responsibilities: {
        fr: ['Surveiller 30min post-travaux', 'Utiliser extincteurs', 'Donner alerte'],
        en: ['Monitor 30min post-work', 'Use extinguishers', 'Sound alarms']
      },
      competencies: {
        fr: ['Formation incendie', 'Équipements extinction', 'Procédures urgence'],
        en: ['Fire training', 'Extinguishing equipment', 'Emergency procedures']
      }
    },
    'operateurs': {
      id: 'operateurs',
      title: { fr: 'Opérateurs qualifiés', en: 'Qualified Operators' },
      description: { fr: 'Soudeurs et opérateurs certifiés', en: 'Certified welders and operators' },
      icon: <Wrench className="w-5 h-5" />,
      color: '#0369A1',
      required: true,
      minAge: 18,
      maxPersons: 4,
      requiredCertifications: ['soudage-certifie', 'securite-generale'],
      responsibilities: {
        fr: ['Effectuer soudage/découpage', 'Respecter procédures', 'Maintenir équipements'],
        en: ['Perform welding/cutting', 'Follow procedures', 'Maintain equipment']
      },
      competencies: {
        fr: ['Certification soudage', 'Sécurité travail chaud', 'Équipements protection'],
        en: ['Welding certification', 'Hot work safety', 'Protection equipment']
      }
    }
  },
  'levage': {
    'operateur-grue': {
      id: 'operateur-grue',
      title: { fr: 'Opérateur de grue', en: 'Crane Operator' },
      description: { fr: 'Opérateur certifié équipements levage', en: 'Certified lifting equipment operator' },
      icon: <HardHat className="w-5 h-5" />,
      color: '#DC2626',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['operateur-grue-certifie', 'inspection-equipements'],
      responsibilities: {
        fr: ['Opérer équipements', 'Inspecter avant usage', 'Respecter capacités'],
        en: ['Operate equipment', 'Inspect before use', 'Respect capacities']
      },
      competencies: {
        fr: ['Licence opérateur', 'Calculs charges', 'Procédures sécurité'],
        en: ['Operator license', 'Load calculations', 'Safety procedures']
      }
    },
    'signaleur': {
      id: 'signaleur',
      title: { fr: 'Signaleur certifié', en: 'Certified Signaler' },
      description: { fr: 'Communication visuelle avec opérateur', en: 'Visual communication with operator' },
      icon: <Users className="w-5 h-5" />,
      color: '#EA580C',
      required: true,
      minAge: 18,
      maxPersons: 2,
      requiredCertifications: ['signaleur-certifie', 'communication-visuelle'],
      responsibilities: {
        fr: ['Guider opérateur', 'Signaler dangers', 'Coordonner mouvements'],
        en: ['Guide operator', 'Signal hazards', 'Coordinate movements']
      },
      competencies: {
        fr: ['Formation signaleur', 'Codes gestuels', 'Évaluation risques'],
        en: ['Signaler training', 'Hand signals', 'Risk assessment']
      }
    },
    'riggers': {
      id: 'riggers',
      title: { fr: 'Riggers qualifiés', en: 'Qualified Riggers' },
      description: { fr: 'Préparation et arrimage charges', en: 'Load preparation and rigging' },
      icon: <Wrench className="w-5 h-5" />,
      color: '#0369A1',
      required: true,
      minAge: 18,
      maxPersons: 4,
      requiredCertifications: ['rigging-certifie', 'calculs-charges'],
      responsibilities: {
        fr: ['Préparer charges', 'Sélectionner élingues', 'Calculer points levage'],
        en: ['Prepare loads', 'Select slings', 'Calculate lift points']
      },
      competencies: {
        fr: ['Certification rigging', 'Calculs mécaniques', 'Équipements levage'],
        en: ['Rigging certification', 'Mechanical calculations', 'Lifting equipment']
      }
    }
  },
  'excavation': {
    'personne-competente': {
      id: 'personne-competente',
      title: { fr: 'Personne compétente', en: 'Competent Person' },
      description: { fr: 'Expert sécurité excavation certifié', en: 'Certified excavation safety expert' },
      icon: <Shield className="w-5 h-5" />,
      color: '#DC2626',
      required: true,
      minAge: 25,
      maxPersons: 1,
      requiredCertifications: ['personne-competente-excavation', 'sols-stabilite'],
      responsibilities: {
        fr: ['Évaluer stabilité sols', 'Classifier excavation', 'Superviser sécurité'],
        en: ['Assess soil stability', 'Classify excavation', 'Supervise safety']
      },
      competencies: {
        fr: ['Formation sols', 'Classification risques', 'Systèmes protection'],
        en: ['Soil training', 'Risk classification', 'Protection systems']
      }
    }
  },
  'hauteur': {
    'superviseur-hauteur': {
      id: 'superviseur-hauteur',
      title: { fr: 'Superviseur travail hauteur', en: 'Work at Height Supervisor' },
      description: { fr: 'Expert sécurité travail en hauteur', en: 'Work at height safety expert' },
      icon: <HardHat className="w-5 h-5" />,
      color: '#DC2626',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['travail-hauteur-superviseur', 'protection-chutes'],
      responsibilities: {
        fr: ['Évaluer systèmes protection', 'Former équipes', 'Superviser travaux'],
        en: ['Assess protection systems', 'Train teams', 'Supervise work']
      },
      competencies: {
        fr: ['Systèmes antichute', 'Formation sécurité', 'Équipements hauteur'],
        en: ['Fall protection systems', 'Safety training', 'Height equipment']
      }
    }
  },
  'isolation-energetique': {
    'electricien-qualifie': {
      id: 'electricien-qualifie',
      title: { fr: 'Électricien qualifié', en: 'Qualified Electrician' },
      description: { fr: 'Expert isolation énergétique LOTO', en: 'Energy isolation LOTO expert' },
      icon: <Zap className="w-5 h-5" />,
      color: '#7C3AED',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['electricien-certifie', 'loto-procedure'],
      responsibilities: {
        fr: ['Appliquer LOTO', 'Vérifier isolation', 'Former personnel'],
        en: ['Apply LOTO', 'Verify isolation', 'Train personnel']
      },
      competencies: {
        fr: ['Licence électricien', 'Procédures LOTO', 'Sécurité électrique'],
        en: ['Electrician license', 'LOTO procedures', 'Electrical safety']
      }
    }
  },
  'pression': {
    'inspecteur-pression': {
      id: 'inspecteur-pression',
      title: { fr: 'Inspecteur équipements pression', en: 'Pressure Equipment Inspector' },
      description: { fr: 'Expert équipements sous pression', en: 'Pressure equipment expert' },
      icon: <Settings className="w-5 h-5" />,
      color: '#059669',
      required: true,
      minAge: 25,
      maxPersons: 1,
      requiredCertifications: ['inspecteur-pression-certifie', 'csab51'],
      responsibilities: {
        fr: ['Inspecter équipements', 'Valider conformité', 'Certifier sécurité'],
        en: ['Inspect equipment', 'Validate compliance', 'Certify safety']
      },
      competencies: {
        fr: ['Certification CSA B51', 'Inspection équipements', 'Normes pression'],
        en: ['CSA B51 certification', 'Equipment inspection', 'Pressure standards']
      }
    }
  },
  'radiographie': {
    'operateur-radio': {
      id: 'operateur-radio',
      title: { fr: 'Opérateur radiographie', en: 'Radiography Operator' },
      description: { fr: 'Opérateur certifié sources radioactives', en: 'Certified radioactive sources operator' },
      icon: <AlertTriangle className="w-5 h-5" />,
      color: '#BE185D',
      required: true,
      minAge: 21,
      maxPersons: 1,
      requiredCertifications: ['operateur-radio-certifie', 'licence-ccsn'],
      responsibilities: {
        fr: ['Manipuler sources', 'Contrôler exposition', 'Gérer radioprotection'],
        en: ['Handle sources', 'Control exposure', 'Manage radiation protection']
      },
      competencies: {
        fr: ['Licence CCSN', 'Radioprotection', 'Procédures urgence'],
        en: ['CNSC license', 'Radiation protection', 'Emergency procedures']
      }
    }
  },
  'toiture': {
    'couvreur-certifie': {
      id: 'couvreur-certifie',
      title: { fr: 'Couvreur certifié', en: 'Certified Roofer' },
      description: { fr: 'Expert travaux toiture et couverture', en: 'Roofing and covering work expert' },
      icon: <HardHat className="w-5 h-5" />,
      color: '#1F2937',
      required: true,
      minAge: 18,
      maxPersons: 4,
      requiredCertifications: ['couvreur-certifie', 'travail-hauteur'],
      responsibilities: {
        fr: ['Installer couvertures', 'Sécuriser périmètre', 'Respecter normes'],
        en: ['Install covering', 'Secure perimeter', 'Follow standards']
      },
      competencies: {
        fr: ['Certification couvreur', 'Protection chutes', 'Matériaux toiture'],
        en: ['Roofer certification', 'Fall protection', 'Roofing materials']
      }
    }
  },
  'demolition': {
    'demolisseur-certifie': {
      id: 'demolisseur-certifie',
      title: { fr: 'Démolisseur certifié', en: 'Certified Demolition Worker' },
      description: { fr: 'Expert démolition et décontamination', en: 'Demolition and decontamination expert' },
      icon: <Wrench className="w-5 h-5" />,
      color: '#991B1B',
      required: true,
      minAge: 21,
      maxPersons: 3,
      requiredCertifications: ['demolition-certifie', 'amiante-formation'],
      responsibilities: {
        fr: ['Démolir structures', 'Gérer amiante', 'Contrôler sécurité'],
        en: ['Demolish structures', 'Handle asbestos', 'Control safety']
      },
      competencies: {
        fr: ['Formation démolition', 'Gestion amiante', 'Équipements protection'],
        en: ['Demolition training', 'Asbestos management', 'Protection equipment']
      }
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const PersonnelSection: React.FC<PersonnelSectionProps> = ({
  data,
  onChange,
  errors,
  language = 'fr',
  permitType,
  province,
  touchOptimized = true,
  enableQRScan = true,
  enablePhotoCapture = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelFormData | null>(null);
  const [showPersonnelDetails, setShowPersonnelDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isValidatingCertification, setIsValidatingCertification] = useState(false);

  // Refs pour navigation mobile
  const personnelFormRef = useRef<HTMLDivElement>(null);
  const qrScannerRef = useRef<HTMLDivElement>(null);

  // =================== CONFIGURATION RÔLES SELON TYPE PERMIS ===================
  const availableRoles = useMemo(() => {
    return PERSONNEL_ROLES[permitType] || {};
  }, [permitType]);

  const provincialRegs = useMemo(() => {
    return PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS];
  }, [province]);

  // =================== GESTION PERSONNEL ===================
  const addPersonnelToRole = useCallback((roleId: string, personnel: PersonnelFormData) => {
    const currentRoleData = data[roleId as keyof typeof data] as any[] || [];
    const updatedRoleData = [...currentRoleData, {
      ...personnel,
      id: generatePersonnelId(),
      dateAjout: new Date(),
      roleId
    }];
    
    onChange(roleId, updatedRoleData);
    setShowAddPersonnel(false);
    setActiveRole(null);
    
    // Feedback haptic succès
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }
  }, [data, onChange]);

  const removePersonnelFromRole = useCallback((roleId: string, personnelId: string) => {
    const currentRoleData = data[roleId as keyof typeof data] as any[] || [];
    const updatedRoleData = currentRoleData.filter((p: any) => p.id !== personnelId);
    
    onChange(roleId, updatedRoleData);
    
    // Feedback haptic suppression
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [data, onChange]);

  const updatePersonnelInRole = useCallback((roleId: string, personnelId: string, updates: Partial<PersonnelFormData>) => {
    const currentRoleData = data[roleId as keyof typeof data] as any[] || [];
    const updatedRoleData = currentRoleData.map((p: any) => 
      p.id === personnelId ? { ...p, ...updates, dateModification: new Date() } : p
    );
    
    onChange(roleId, updatedRoleData);
  }, [data, onChange]);

  // =================== VALIDATION CERTIFICATIONS ===================
  const validateCertification = useCallback(async (certification: string, personnelData: PersonnelFormData) => {
    setIsValidatingCertification(true);
    
    try {
      // Simulation validation API - Remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValid = Math.random() > 0.2; // 80% chance valide
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      
      return {
        isValid,
        expiryDate,
        details: {
          issuer: 'CNESST',
          number: `CERT-${Date.now()}`,
          level: 'Expert'
        }
      };
    } catch (error) {
      console.error('Erreur validation certification:', error);
      return { isValid: false, error: 'Erreur validation' };
    } finally {
      setIsValidatingCertification(false);
    }
  }, []);

  // =================== QR CODE SCANNING ===================
  const startQRScan = useCallback((roleId: string) => {
    if (!enableQRScan) return;
    
    // Simulation scan QR - Remplacer par vraie implementation
    setActiveRole(roleId);
    
    // Mock data personnel depuis QR
    setTimeout(() => {
      const mockPersonnel: PersonnelFormData = {
        nom: 'Dupont',
        prenom: 'Jean',
        age: 32,
        telephone: '418-555-0123',
        email: 'jean.dupont@example.com',
        entreprise: 'Construction ABC',
        poste: 'Soudeur certifié',
        experience: 8,
        certifications: [
          {
            id: 'soudage-certifie',
            name: { fr: 'Soudage certifié', en: 'Certified Welding' },
            issuer: 'CWB',
            number: 'CWB-2024-001',
            issueDate: new Date('2024-01-15'),
            expiryDate: new Date('2026-01-15'),
            isValid: true
          }
        ],
        formation: ['Sécurité générale', 'Travail à chaud'],
        statut: 'actif'
      };
      
      addPersonnelToRole(roleId, mockPersonnel);
    }, 2000);
  }, [enableQRScan, addPersonnelToRole]);

  // =================== RENDU COMPOSANT ===================
  return (
    <div className="space-y-6">
      {/* =================== HEADER SECTION =================== */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {language === 'fr' ? 'Équipe et responsabilités' : 'Team and responsibilities'}
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              {language === 'fr' 
                ? `Configuration requise pour ${permitType} selon réglementations ${province}`
                : `Required configuration for ${permitType} according to ${province} regulations`
              }
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {Object.keys(availableRoles).length} {language === 'fr' ? 'rôles requis' : 'required roles'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {provincialRegs?.minAge || 18}+ {language === 'fr' ? 'ans minimum' : 'years minimum'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================== RÔLES PERSONNEL PAR TYPE PERMIS =================== */}
      <div className="space-y-4">
        {Object.entries(availableRoles).map(([roleId, roleConfig]) => {
          const currentPersonnel = data[roleId as keyof typeof data] as any[] || [];
          const isComplete = currentPersonnel.length >= (roleConfig.required ? 1 : 0);
          const hasErrors = errors[roleId];
          
          return (
            <div
              key={roleId}
              className={`
                border rounded-lg transition-all
                ${hasErrors 
                  ? 'border-red-300 bg-red-50' 
                  : isComplete 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              {/* Header rôle */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${roleConfig.color}20` }}
                    >
                      <span style={{ color: roleConfig.color }}>
                        {roleConfig.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {roleConfig.title[language]}
                        </h4>
                        {roleConfig.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            {language === 'fr' ? 'Requis' : 'Required'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {roleConfig.description[language]}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Min {roleConfig.minAge} ans</span>
                        <span>Max {roleConfig.maxPersons} personnes</span>
                        <span>{roleConfig.requiredCertifications.length} certifications</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status et actions */}
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : hasErrors ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    
                    <span className="text-sm font-medium text-gray-600">
                      {currentPersonnel.length}/{roleConfig.maxPersons}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste personnel assigné */}
              <div className="p-4">
                {currentPersonnel.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {currentPersonnel.map((personnel: any, index: number) => (
                      <PersonnelCard
                        key={personnel.id || index}
                        personnel={personnel}
                        roleConfig={roleConfig}
                        language={language}
                        onEdit={() => {
                          setSelectedPersonnel(personnel);
                          setShowPersonnelDetails(true);
                        }}
                        onRemove={() => removePersonnelFromRole(roleId, personnel.id)}
                        touchOptimized={touchOptimized}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {language === 'fr' 
                        ? 'Aucun personnel assigné à ce rôle' 
                        : 'No personnel assigned to this role'
                      }
                    </p>
                  </div>
                )}

                {/* Boutons actions */}
                {currentPersonnel.length < roleConfig.maxPersons && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveRole(roleId);
                        setShowAddPersonnel(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Ajouter personnel' : 'Add personnel'}</span>
                    </button>
                    
                    {enableQRScan && (
                      <button
                        onClick={() => startQRScan(roleId)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-lg font-medium transition-all active:bg-gray-700"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Scanner QR' : 'Scan QR'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Erreurs rôle */}
                {hasErrors && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{hasErrors.message[language]}</span>
                  </div>
                )}
              </div>

              {/* Détails rôle expandable */}
              <motion.div
                initial={false}
                animate={{ height: activeRole === roleId ? 'auto' : 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Responsabilités */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {language === 'fr' ? 'Responsabilités' : 'Responsibilities'}
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {roleConfig.responsibilities[language].map((resp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Compétences requises */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        {language === 'fr' ? 'Compétences requises' : 'Required competencies'}
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {roleConfig.competencies[language].map((comp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* =================== MODAL AJOUT PERSONNEL =================== */}
      <AnimatePresence>
        {showAddPersonnel && activeRole && (
          <PersonnelFormModal
            roleId={activeRole}
            roleConfig={availableRoles[activeRole]}
            language={language}
            province={province}
            onSave={(personnel: PersonnelFormData) => addPersonnelToRole(activeRole, personnel)}
            onCancel={() => {
              setShowAddPersonnel(false);
              setActiveRole(null);
            }}
            enablePhotoCapture={enablePhotoCapture}
            touchOptimized={touchOptimized}
          />
        )}
      </AnimatePresence>

      {/* =================== MODAL DÉTAILS PERSONNEL =================== */}
      <AnimatePresence>
        {showPersonnelDetails && selectedPersonnel && (
          <PersonnelDetailsModal
            personnel={selectedPersonnel}
            language={language}
            onSave={(updates) => {
              // Update personnel logic
              setShowPersonnelDetails(false);
              setSelectedPersonnel(null);
            }}
            onCancel={() => {
              setShowPersonnelDetails(false);
              setSelectedPersonnel(null);
            }}
            touchOptimized={touchOptimized}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// =================== COMPOSANT CARTE PERSONNEL ===================
const PersonnelCard: React.FC<{
  personnel: any;
  roleConfig: RoleConfig;
  language: 'fr' | 'en';
  onEdit: () => void;
  onRemove: () => void;
  touchOptimized: boolean;
}> = ({ personnel, roleConfig, language, onEdit, onRemove, touchOptimized }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start gap-3">
        {/* Photo/Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {personnel.photo ? (
            <img 
              src={personnel.photo} 
              alt={`${personnel.prenom} ${personnel.nom}`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <Users className="w-6 h-6 text-gray-400" />
          )}
        </div>
        
        {/* Info personnel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 truncate">
                {personnel.prenom} {personnel.nom}
              </h5>
              <p className="text-sm text-gray-600 truncate">
                {personnel.poste} • {personnel.entreprise}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{personnel.age} ans</span>
                <span>{personnel.experience} ans exp.</span>
                <span className={`
                  px-2 py-0.5 rounded-full
                  ${personnel.statut === 'actif' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                  }
                `}>
                  {personnel.statut}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={language === 'fr' ? 'Modifier' : 'Edit'}
              >
                <Edit3 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={onRemove}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title={language === 'fr' ? 'Supprimer' : 'Remove'}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="flex flex-wrap gap-1 mt-2">
            {personnel.certifications?.slice(0, 2).map((cert: any, index: number) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
              >
                <Award className="w-3 h-3" />
                {cert.name[language]}
              </span>
            ))}
            {personnel.certifications?.length > 2 && (
              <span className="text-xs text-gray-500">
                +{personnel.certifications.length - 2} {language === 'fr' ? 'autres' : 'others'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== MODAL FORMULAIRE PERSONNEL (PLACEHOLDER) ===================
const PersonnelFormModal: React.FC<any> = (props) => {
  return <div>Modal Formulaire Personnel - À implémenter</div>;
};

const PersonnelDetailsModal: React.FC<any> = (props) => {
  return <div>Modal Détails Personnel - À implémenter</div>;
};

// =================== EXPORT DEFAULT ===================
export default PersonnelSection;
