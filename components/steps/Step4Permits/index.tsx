"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight
} from 'lucide-react';

// =================== IMPORTS POUR QR CODE ET SUPABASE ===================
// Note: Dans votre projet réel, ajoutez ces dépendances :
// npm install qrcode html2canvas jspdf @supabase/supabase-js

// Types pour l'intégration Supabase
interface SupabasePermitRecord {
  id: string;
  permit_number: string;
  permit_type: string;
  site_address: string;
  responsible_person: string;
  supervisor: string;
  status: PermitStatus;
  issue_date: string;
  expiry_date: string;
  province: ProvinceCode;
  qr_code_data: string;
  legal_requirements: any;
  authorized_personnel: any;
  time_logs: any;
  measurements: any;
  photos: any;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

interface QRCodeData {
  permitId: string;
  permitNumber: string;
  type: string;
  siteAddress: string;
  issueDate: string;
  expiryDate: string;
  responsiblePerson: string;
  supervisor: string;
  emergencyPhone: string;
  verificationUrl: string;
}
// =================== MOCKS TEMPORAIRES POUR LES HOOKS ===================
const usePermitData = (initialData: any, onUpdate: (permits: any) => void) => ({
  permits: initialData || [],
  loading: false,
  error: null,
  addPermit: () => {},
  updatePermit: () => {},
  deletePermit: () => {},
  setPermits: () => {}
});

const usePermitValidation = () => ({
  validatePermit: () => Promise.resolve({ valid: true }),
  validationResults: {},
  isValidating: false
});

const useNotifications = () => ({
  notifications: [] as Array<{
    id: string;
    type: 'error' | 'warning' | 'success' | 'info';
    message: string;
    timestamp?: string;
  }>,
  addNotification: (notification: any) => {}
});

// =================== INTÉGRATION SUPABASE POUR PRODUCTION ===================
// Configuration Supabase (à remplacer par vos vraies clés)
const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
};

// Service Supabase pour les permis
class PermitSupabaseService {
  private static instance: PermitSupabaseService;
  
  static getInstance(): PermitSupabaseService {
    if (!PermitSupabaseService.instance) {
      PermitSupabaseService.instance = new PermitSupabaseService();
    }
    return PermitSupabaseService.instance;
  }

  // Sauvegarder un permis dans Supabase
  async savePermit(permit: CanadianPermit): Promise<string> {
    try {
      // Dans votre implémentation réelle :
      // const { data, error } = await supabase
      //   .from('work_permits')
      //   .insert([this.convertToSupabaseRecord(permit)])
      //   .select();
      
      // Pour la démo, simulation :
      console.log('🔄 Saving permit to Supabase:', permit.permitNumber);
      
      // Simulation d'un ID retourné par Supabase
      const savedId = `sb_${permit.id}_${Date.now()}`;
      
      // Générer le QR Code avec les données du permis
      const qrData = await this.generateQRCodeData(permit, savedId);
      
      console.log('✅ Permit saved to Supabase with ID:', savedId);
      console.log('📱 QR Code generated:', qrData);
      
      return savedId;
    } catch (error) {
      console.error('❌ Error saving permit to Supabase:', error);
      throw error;
    }
  }

  // Récupérer un permis par QR Code
  async getPermitByQR(qrData: string): Promise<CanadianPermit | null> {
    try {
      // Parse QR data
      const qrInfo = JSON.parse(qrData) as QRCodeData;
      
      // Dans votre implémentation réelle :
      // const { data, error } = await supabase
      //   .from('work_permits')
      //   .select('*')
      //   .eq('permit_number', qrInfo.permitNumber)
      //   .single();
      
      console.log('🔍 Looking up permit by QR:', qrInfo.permitNumber);
      
      // Pour la démo, retourner null (pas trouvé)
      return null;
    } catch (error) {
      console.error('❌ Error fetching permit by QR:', error);
      return null;
    }
  }

  // Générer les données du QR Code
  private async generateQRCodeData(permit: CanadianPermit, supabaseId: string): Promise<QRCodeData> {
    const qrData: QRCodeData = {
      permitId: supabaseId,
      permitNumber: permit.permitNumber,
      type: permit.type,
      siteAddress: permit.worksite.address,
      issueDate: permit.issueDate,
      expiryDate: permit.expiryDate,
      responsiblePerson: permit.responsiblePerson.name,
      supervisor: permit.supervisor.name,
      emergencyPhone: permit.emergencyContacts.find(c => c.phone === '911')?.phone || '911',
      verificationUrl: `${window.location.origin}/verify-permit/${supabaseId}`
    };
    
    return qrData;
  }

  // Convertir un permis vers le format Supabase
  private convertToSupabaseRecord(permit: CanadianPermit): SupabasePermitRecord {
    return {
      id: permit.id,
      permit_number: permit.permitNumber,
      permit_type: permit.type,
      site_address: permit.worksite.address,
      responsible_person: permit.responsiblePerson.name,
      supervisor: permit.supervisor.name,
      status: permit.status,
      issue_date: permit.issueDate,
      expiry_date: permit.expiryDate,
      province: permit.province,
      qr_code_data: '', // Sera rempli après génération
      legal_requirements: permit.legalRequirements,
      authorized_personnel: permit.authorizedPersonnel,
      time_logs: permit.timeLogs,
      measurements: permit.measurements,
      photos: permit.photos,
      completion_rate: permit.completionRate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Rechercher des permis similaires pour réutilisation
  async findSimilarPermits(siteAddress: string, permitType: string): Promise<CanadianPermit[]> {
    try {
      // Dans votre implémentation réelle :
      // const { data, error } = await supabase
      //   .from('work_permits')
      //   .select('*')
      //   .eq('permit_type', permitType)
      //   .ilike('site_address', `%${siteAddress}%`)
      //   .order('created_at', { ascending: false })
      //   .limit(5);
      
      console.log('🔍 Searching similar permits for:', { siteAddress, permitType });
      
      // Pour la démo, retourner un tableau vide
      return [];
    } catch (error) {
      console.error('❌ Error searching similar permits:', error);
      return [];
    }
  }
}

// Service QR Code pour génération
class QRCodeService {
  static async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      // Dans votre implémentation réelle avec la librairie qrcode :
      // const QRCode = require('qrcode');
      // const qrDataString = JSON.stringify(data);
      // const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      //   width: 256,
      //   margin: 2,
      //   color: {
      //     dark: '#000000',
      //     light: '#FFFFFF'
      //   }
      // });
      
      // Pour la démo, générer un QR code simulé
      const qrDataString = JSON.stringify(data);
      const mockQRCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="white"/>
          <rect x="20" y="20" width="216" height="216" fill="black" opacity="0.1"/>
          <text x="128" y="140" text-anchor="middle" font-family="monospace" font-size="10" fill="black">
            QR CODE
          </text>
          <text x="128" y="160" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
            ${data.permitNumber}
          </text>
          <text x="128" y="180" text-anchor="middle" font-family="monospace" font-size="6" fill="black">
            Scan for verification
          </text>
        </svg>
      `)}`;
      
      console.log('📱 QR Code generated for permit:', data.permitNumber);
      return mockQRCode;
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      throw error;
    }
  }

  static async generatePDF(permit: CanadianPermit, qrCodeDataURL: string): Promise<Blob> {
    try {
      // Dans votre implémentation réelle avec jsPDF :
      // const jsPDF = require('jspdf');
      // const pdf = new jsPDF();
      // 
      // // En-tête du permis
      // pdf.setFontSize(20);
      // pdf.text('PERMIS DE TRAVAIL', 20, 30);
      // pdf.setFontSize(12);
      // pdf.text(`${permit.name.fr}`, 20, 50);
      // 
      // // QR Code
      // pdf.addImage(qrCodeDataURL, 'PNG', 150, 20, 40, 40);
      // 
      // // Informations du permis
      // pdf.text(`Numéro: ${permit.permitNumber}`, 20, 70);
      // pdf.text(`Site: ${permit.worksite.address}`, 20, 85);
      // // ... autres informations
      // 
      // return pdf.output('blob');
      
      // Pour la démo, créer un blob simulé
      const pdfContent = `
        PERMIS DE TRAVAIL - ${permit.name.fr}
        
        Numéro: ${permit.permitNumber}
        Type: ${permit.type}
        Site: ${permit.worksite.address}
        Responsable: ${permit.responsiblePerson.name}
        Superviseur: ${permit.supervisor.name}
        
        Date d'émission: ${new Date(permit.issueDate).toLocaleDateString()}
        Date d'expiration: ${new Date(permit.expiryDate).toLocaleDateString()}
        
        Taux de completion: ${permit.completionRate}%
        
        Ce document est généré automatiquement.
        Scannez le QR code pour vérification.
      `;
      
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    }
  }
}

// Types de base
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== INTERFACES RÉELLES POUR CANADA ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
}

interface BilingualText {
  fr: string;
  en: string;
}

export type PermitStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'active' | 'completed';
export type PermitTypeEnum = 'confined_space' | 'hot_work' | 'excavation' | 'lifting' | 'height_work' | 'electrical';

// =================== STRUCTURE LÉGALE CANADIENNE COMPLÈTE ===================
interface LegalRequirement {
  id: string;
  requirement: BilingualText;
  regulation: string; // Ex: "RSST Art. 302", "OHS Regulation 851"
  mandatory: boolean;
  completed: boolean;
  evidence?: string; // Preuve de conformité
  inspector?: string;
  dateCompleted?: string;
  notes?: string;
  photos?: string[]; // URLs des photos de preuve
}

interface WorkerEntry {
  id: string;
  name: string;
  role: string;
  certification: string;
  certificationExpiry: string;
  entryTime?: string;
  exitTime?: string;
  signature?: string; // Signature numérique base64
  photo?: string; // Photo du travailleur
  respiratoryFit?: boolean;
  medicalClearance?: boolean;
}

interface TimeLog {
  id: string;
  workerId: string;
  workerName: string;
  action: 'entry' | 'exit' | 'break_start' | 'break_end';
  timestamp: string;
  location?: { lat: number; lng: number };
  notes?: string;
  witnessSignature?: string;
}

interface SafetyMeasurement {
  id: string;
  parameter: string; // 'oxygen', 'carbon_monoxide', 'hydrogen_sulfide', 'lel'
  value: number;
  unit: string;
  acceptable: boolean;
  timestamp: string;
  measuredBy: string;
  deviceSerial?: string;
  calibrationDate?: string;
}

interface PermitPhoto {
  id: string;
  type: 'site_overview' | 'hazard_identification' | 'equipment_setup' | 'safety_measures' | 'completion';
  url: string;
  caption: BilingualText;
  timestamp: string;
  takenBy: string;
  location?: { lat: number; lng: number };
}

interface EmergencyContact {
  role: BilingualText;
  name: string;
  phone: string;
  email?: string;
  available24h: boolean;
}

interface CanadianPermit {
  // Identification
  id: string;
  permitNumber: string; // Numéro officiel du permis
  type: PermitTypeEnum;
  name: BilingualText;
  description: BilingualText;
  
  // Statut légal
  status: PermitStatus;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string; // CNESST, WorkSafeBC, etc.
  province: ProvinceCode;
  
  // Réglementations applicables
  regulations: string[]; // ["RSST Art. 302-317", "CSA Z1006"]
  
  // Exigences légales obligatoires
  legalRequirements: LegalRequirement[];
  
  // Responsabilités DÉTAILLÉES
  responsiblePerson: {
    name: string;
    title: string;
    phone: string;
    email: string;
    signature?: string;
    signatureDate?: string;
  };
  
  supervisor: {
    name: string;
    certification: string;
    certificationExpiry: string;
    phone: string;
    signature?: string;
    signatureDate?: string;
  };
  
  safetyOfficer?: {
    name: string;
    certification: string;
    phone: string;
    signature?: string;
  };
  
  // Site et travaux DÉTAILLÉS
  worksite: {
    address: string;
    coordinates?: { lat: number; lng: number };
    description: BilingualText;
    hazards: string[];
    photos: PermitPhoto[];
    weatherConditions?: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      conditions: string;
      timestamp: string;
    };
  };
  
  // Équipe autorisée avec HORODATAGE
  authorizedPersonnel: WorkerEntry[];
  
  // Logs d'entrée/sortie TEMPS RÉEL
  timeLogs: TimeLog[];
  
  // Équipements requis avec PHOTOS
  requiredEquipment: {
    item: BilingualText;
    specification: string;
    inspectionDate?: string;
    certified: boolean;
    serialNumber?: string;
    photos?: string[];
  }[];
  
  // Contacts d'urgence COMPLETS
  emergencyContacts: EmergencyContact[];
  
  // Monitoring et mesures TEMPS RÉEL
  measurements: SafetyMeasurement[];
  
  // Photos du permis
  photos: PermitPhoto[];
  
  // Documents attachés
  attachedDocuments: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadDate: string;
  }[];
  
  // Progression réelle basée sur completion
  completionRate: number; // Calculé automatiquement
  
  // État d'expansion dans l'UI
  expanded: boolean;
}

// =================== TRADUCTIONS LÉGALES ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "📄 Work Permits & Legal Authorizations",
      subtitle: "Mandatory permits according to Canadian occupational health and safety regulations",
      searchPlaceholder: "Search permits by type, regulation...",
      allCategories: "All permit types",
      expandPermit: "Click to view requirements",
      collapsePermit: "Click to collapse",
      permitNumber: "Permit #",
      issuingAuthority: "Issuing Authority",
      validUntil: "Valid Until",
      completionRate: "Completion Rate",
      legalRequirements: "Legal Requirements",
      authorizedPersonnel: "Authorized Personnel",
      requiredEquipment: "Required Equipment",
      emergencyProcedures: "Emergency Procedures",
      worksite: "Worksite Information",
      measurements: "Measurements & Monitoring",
      responsiblePerson: "Responsible Person",
      supervisor: "Supervisor",
      safetyOfficer: "Safety Officer",
      regulation: "Regulation",
      mandatory: "Mandatory",
      optional: "Optional",
      completed: "Completed",
      pending: "Pending",
      evidence: "Evidence",
      inspector: "Inspector",
      dateCompleted: "Date Completed",
      noPermitsSelected: "No permits selected. Please select required permits for your work.",
      permitExpired: "⚠️ Permit Expired",
      permitValid: "✅ Valid Permit",
      permitPending: "⏳ Pending Approval"
    };
  }
  
  return {
    title: "📄 Permis de Travail & Autorisations Légales",
    subtitle: "Permis obligatoires selon les réglementations SST canadiennes",
    searchPlaceholder: "Rechercher par type, réglementation...",
    allCategories: "Tous les types de permis",
    expandPermit: "Cliquer pour voir les exigences",
    collapsePermit: "Cliquer pour fermer",
    permitNumber: "Permis #",
    issuingAuthority: "Autorité Émettrice",
    validUntil: "Valide Jusqu'au",
    completionRate: "Taux de Completion",
    legalRequirements: "Exigences Légales",
    authorizedPersonnel: "Personnel Autorisé",
    requiredEquipment: "Équipement Requis",
    emergencyProcedures: "Procédures d'Urgence",
    worksite: "Informations du Site",
    measurements: "Mesures & Surveillance",
    responsiblePerson: "Responsable",
    supervisor: "Superviseur",
    safetyOfficer: "Agent de Sécurité",
    regulation: "Réglementation",
    mandatory: "Obligatoire",
    optional: "Optionnel",
    completed: "Complété",
    pending: "En Attente",
    evidence: "Preuve",
    inspector: "Inspecteur",
    dateCompleted: "Date de Completion",
    noPermitsSelected: "Aucun permis sélectionné. Veuillez sélectionner les permis requis pour vos travaux.",
    permitExpired: "⚠️ Permis Expiré",
    permitValid: "✅ Permis Valide",
    permitPending: "⏳ En Attente d'Approbation"
  };
};

// =================== DONNÉES RÉELLES CANADIENNES ===================
const generateCanadianPermits = (province: ProvinceCode, language: 'fr' | 'en'): CanadianPermit[] => {
  const texts = getTexts(language);
  const issuingAuthorities: Record<ProvinceCode, string> = {
    'QC': 'CNESST',
    'ON': 'Ministry of Labour, Immigration, Training and Skills Development',
    'BC': 'WorkSafeBC',
    'AB': 'Alberta Occupational Health and Safety',
    'SK': 'Saskatchewan Labour Relations and Workplace Safety',
    'MB': 'Workplace Safety and Health Manitoba',
    'NB': 'WorkSafeNB',
    'NS': 'Nova Scotia Labour and Advanced Education',
    'PE': 'PEI Workers Compensation Board',
    'NL': 'Workplace Health, Safety and Compensation Commission',
    'NT': 'Northwest Territories Workers Safety and Compensation Commission',
    'NU': 'Nunavut Workers Safety and Compensation Commission',
    'YT': 'Yukon Workers Compensation Health and Safety Board'
  };

  const authority = issuingAuthorities[province];
  const now = new Date();
  
  return [
    // =================== ESPACE CLOS ===================
    {
      id: 'confined_space_001',
      permitNumber: `CS-${province}-${new Date().getFullYear()}-001`,
      type: 'confined_space',
      name: {
        fr: 'Permis d\'Entrée en Espace Clos',
        en: 'Confined Space Entry Permit'
      },
      description: {
        fr: 'Permis obligatoire pour l\'entrée dans tout espace clos selon les réglementations provinciales',
        en: 'Mandatory permit for entry into any confined space according to provincial regulations'
      },
      status: 'draft',
      issueDate: now.toISOString(),
      expiryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      issuingAuthority: authority,
      province: province,
      regulations: province === 'QC' 
        ? ['RSST Art. 302-317', 'CSA Z1006-16'] 
        : province === 'ON'
        ? ['O. Reg. 851 s. 202-217', 'CSA Z1006-16']
        : ['Provincial OHS Regulation', 'CSA Z1006-16'],
      
      legalRequirements: [
        {
          id: 'atmospheric_test',
          requirement: {
            fr: 'Test atmosphérique obligatoire (O₂: 19.5-23.5%, Gaz toxiques < LES)',
            en: 'Mandatory atmospheric testing (O₂: 19.5-23.5%, Toxic gases < OEL)'
          },
          regulation: province === 'QC' ? 'RSST Art. 304' : 'OHS Regulation',
          mandatory: true,
          completed: false
        },
        {
          id: 'entry_supervisor',
          requirement: {
            fr: 'Surveillant d\'entrée formé et désigné présent en permanence',
            en: 'Trained and designated entry supervisor present at all times'
          },
          regulation: province === 'QC' ? 'RSST Art. 306' : 'OHS Regulation',
          mandatory: true,
          completed: false
        },
        {
          id: 'rescue_plan',
          requirement: {
            fr: 'Plan de sauvetage écrit et équipe de sauvetage disponible',
            en: 'Written rescue plan and rescue team available'
          },
          regulation: province === 'QC' ? 'RSST Art. 315' : 'OHS Regulation',
          mandatory: true,
          completed: false
        },
        {
          id: 'communication_system',
          requirement: {
            fr: 'Système de communication entre l\'intérieur et l\'extérieur',
            en: 'Communication system between inside and outside'
          },
          regulation: province === 'QC' ? 'RSST Art. 312' : 'OHS Regulation',
          mandatory: true,
          completed: false
        }
      ],
      
      // Responsabilités DÉTAILLÉES
      responsiblePerson: {
        name: '',
        title: '',
        phone: '',
        email: '',
        signature: undefined,
        signatureDate: undefined
      },
      
      supervisor: {
        name: '',
        certification: '',
        certificationExpiry: '',
        phone: '',
        signature: undefined,
        signatureDate: undefined
      },
      
      safetyOfficer: {
        name: '',
        certification: '',
        phone: '',
        signature: undefined
      },
      
      worksite: {
        address: '',
        description: {
          fr: 'Description détaillée de l\'espace clos et des dangers identifiés',
          en: 'Detailed description of confined space and identified hazards'
        },
        hazards: [],
        photos: [],
        weatherConditions: {
          temperature: 0,
          humidity: 0,
          windSpeed: 0,
          conditions: '',
          timestamp: now.toISOString()
        }
      },
      
      authorizedPersonnel: [],
      timeLogs: [],
      
      requiredEquipment: [
        {
          item: { fr: 'Détecteur 4 gaz certifié', en: 'Certified 4-gas detector' },
          specification: 'O₂, LEL, CO, H₂S - Calibré dans les 30 derniers jours',
          certified: false,
          serialNumber: '',
          photos: []
        },
        {
          item: { fr: 'Équipement de ventilation', en: 'Ventilation equipment' },
          specification: 'Ventilateur certifié et conduits appropriés',
          certified: false,
          serialNumber: '',
          photos: []
        },
        {
          item: { fr: 'Équipement de sauvetage', en: 'Rescue equipment' },
          specification: 'Treuil, harnais, cordes conformes CSA',
          certified: false,
          serialNumber: '',
          photos: []
        }
      ],
      
      emergencyContacts: [
        {
          role: { fr: 'Services d\'urgence', en: 'Emergency services' },
          name: '911',
          phone: '911',
          available24h: true
        },
        {
          role: { fr: 'Superviseur de site', en: 'Site supervisor' },
          name: '',
          phone: '',
          available24h: false
        }
      ],
      
      measurements: [],
      photos: [],
      attachedDocuments: [],
      
      completionRate: 0,
      expanded: false
    },

    // =================== TRAVAIL À CHAUD ===================
    {
      id: 'hot_work_001',
      permitNumber: `HW-${province}-${new Date().getFullYear()}-001`,
      type: 'hot_work',
      name: {
        fr: 'Permis de Travail à Chaud',
        en: 'Hot Work Permit'
      },
      description: {
        fr: 'Permis obligatoire pour soudage, coupage, meulage et autres travaux générateurs d\'étincelles',
        en: 'Mandatory permit for welding, cutting, grinding and other spark-generating work'
      },
      status: 'draft',
      issueDate: now.toISOString(),
      expiryDate: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8h
      issuingAuthority: authority,
      province: province,
      regulations: province === 'QC' 
        ? ['RSST Art. 323-327', 'NFPA 51B'] 
        : ['Provincial Fire Code', 'NFPA 51B'],
      
      legalRequirements: [
        {
          id: 'fire_watch',
          requirement: {
            fr: 'Surveillant incendie formé présent pendant et 60 min après les travaux',
            en: 'Trained fire watch present during and 60 min after work'
          },
          regulation: 'NFPA 51B Section 4.3',
          mandatory: true,
          completed: false
        },
        {
          id: 'area_inspection',
          requirement: {
            fr: 'Inspection de la zone dans un rayon de 11 mètres',
            en: 'Area inspection within 35 feet radius'
          },
          regulation: 'NFPA 51B Section 4.2',
          mandatory: true,
          completed: false
        },
        {
          id: 'fire_extinguisher',
          requirement: {
            fr: 'Extincteur approprié à portée immédiate (< 3 mètres)',
            en: 'Appropriate fire extinguisher within immediate reach (< 10 feet)'
          },
          regulation: 'NFPA 51B Section 4.4',
          mandatory: true,
          completed: false
        }
      ],
      
      responsiblePerson: '',
      supervisor: '',
      
      worksite: {
        address: '',
        description: {
          fr: 'Zone de travail à chaud et matériaux inflammables environnants',
          en: 'Hot work area and surrounding combustible materials'
        },
        hazards: []
      },
      
      authorizedPersonnel: [],
      
      requiredEquipment: [
        {
          item: { fr: 'Extincteur classe appropriée', en: 'Appropriate class fire extinguisher' },
          specification: 'Classe ABC ou D selon les matériaux',
          certified: false
        },
        {
          item: { fr: 'Couvertures anti-feu', en: 'Fire blankets' },
          specification: 'Couvertures ignifuges pour protection',
          certified: false
        }
      ],
      
      emergencyProcedures: [
        {
          procedure: {
            fr: 'Alarme incendie',
            en: 'Fire alarm'
          },
          contact: 'Service incendie',
          phone: '911'
        }
      ],
      
      completionRate: 0,
      expanded: false
    },

    // =================== EXCAVATION ===================
    {
      id: 'excavation_001',
      permitNumber: `EX-${province}-${new Date().getFullYear()}-001`,
      type: 'excavation',
      name: {
        fr: 'Permis d\'Excavation',
        en: 'Excavation Permit'
      },
      description: {
        fr: 'Permis obligatoire pour excavations de plus de 1.2 mètre de profondeur',
        en: 'Mandatory permit for excavations deeper than 4 feet'
      },
      status: 'draft',
      issueDate: now.toISOString(),
      expiryDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      issuingAuthority: authority,
      province: province,
      regulations: province === 'QC' 
        ? ['RSST Art. 3.20', 'CSA Z271'] 
        : ['Provincial OHS Regulation', 'CSA Z271'],
      
      legalRequirements: [
        {
          id: 'utility_locate',
          requirement: {
            fr: 'Localisation obligatoire des services publics (Info-Excavation)',
            en: 'Mandatory utility locate (Call Before You Dig)'
          },
          regulation: 'Loi provinciale',
          mandatory: true,
          completed: false
        },
        {
          id: 'slope_protection',
          requirement: {
            fr: 'Protection contre l\'effondrement (talutage ou blindage)',
            en: 'Cave-in protection (sloping or shoring)'
          },
          regulation: province === 'QC' ? 'RSST Art. 3.20.3' : 'OHS Regulation',
          mandatory: true,
          completed: false
        },
        {
          id: 'competent_person',
          requirement: {
            fr: 'Personne compétente désignée pour superviser',
            en: 'Competent person designated to supervise'
          },
          regulation: province === 'QC' ? 'RSST Art. 3.20.1' : 'OHS Regulation',
          mandatory: true,
          completed: false
        }
      ],
      
      responsiblePerson: '',
      supervisor: '',
      
      worksite: {
        address: '',
        description: {
          fr: 'Site d\'excavation, profondeur et type de sol',
          en: 'Excavation site, depth and soil type'
        },
        hazards: []
      },
      
      authorizedPersonnel: [],
      
      requiredEquipment: [
        {
          item: { fr: 'Système de blindage', en: 'Shoring system' },
          specification: 'Blindage certifié selon CSA Z271',
          certified: false
        },
        {
          item: { fr: 'Échelles d\'accès', en: 'Access ladders' },
          specification: 'Échelles aux 7.5 mètres maximum',
          certified: false
        }
      ],
      
      emergencyProcedures: [
        {
          procedure: {
            fr: 'Évacuation en cas d\'effondrement',
            en: 'Evacuation in case of cave-in'
          },
          contact: 'Services d\'urgence',
          phone: '911'
        }
      ],
      
      completionRate: 0,
      expanded: false
    }

    // Note: J'ai créé 3 types principaux. Les 3 autres (levage, hauteur, électrique) 
    // suivent la même structure avec leurs réglementations spécifiques.
  ];
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province = 'QC',
  userRole,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  const texts = getTexts(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Hooks existants
  const {
    permits: hookPermits,
    loading: dataLoading,
    error: dataError
  } = usePermitData(formData.permits?.list || [], (permits) => {
    onDataChange('permits', { list: permits, selected: permits.filter((p: any) => p.selected) });
  });
  
  const { notifications } = useNotifications();
  
  // =================== SERVICES PRODUCTION ===================
  const permitService = PermitSupabaseService.getInstance();
  
  // =================== FONCTIONS QR CODE & SAUVEGARDE ===================
  const savePermitToSupabase = async (permit: CanadianPermit) => {
    try {
      console.log('💾 Saving permit to Supabase...');
      
      // Sauvegarder dans Supabase
      const supabaseId = await permitService.savePermit(permit);
      
      // Générer QR Code
      const qrData = {
        permitId: supabaseId,
        permitNumber: permit.permitNumber,
        type: permit.type,
        siteAddress: permit.worksite.address,
        issueDate: permit.issueDate,
        expiryDate: permit.expiryDate,
        responsiblePerson: permit.responsiblePerson.name,
        supervisor: permit.supervisor.name,
        emergencyPhone: '911',
        verificationUrl: `${window.location.origin}/verify-permit/${supabaseId}`
      } as QRCodeData;
      
      const qrCodeDataURL = await QRCodeService.generateQRCode(qrData);
      
      // Mettre à jour le permis avec le QR code
      const updatedPermits = permits.map(p => 
        p.id === permit.id 
          ? { 
              ...p, 
              qrCode: qrCodeDataURL,
              supabaseId: supabaseId,
              qrData: JSON.stringify(qrData)
            }
          : p
      );
      
      setPermits(updatedPermits);
      
      console.log('✅ Permit saved successfully with QR code');
      
      // Notification de succès
      alert(`✅ Permis sauvegardé!\n\nNuméro: ${permit.permitNumber}\nID Supabase: ${supabaseId}\n\n📱 QR Code généré pour vérification mobile.`);
      
    } catch (error) {
      console.error('❌ Error saving permit:', error);
      alert('❌ Erreur lors de la sauvegarde du permis. Vérifiez la connexion.');
    }
  };

  const generatePermitPDF = async (permit: CanadianPermit) => {
    try {
      console.log('📄 Generating PDF for permit:', permit.permitNumber);
      
      // Générer QR Code si pas déjà fait
      let qrCodeDataURL = (permit as any).qrCode;
      if (!qrCodeDataURL) {
        const qrData = {
          permitId: permit.id,
          permitNumber: permit.permitNumber,
          type: permit.type,
          siteAddress: permit.worksite.address,
          issueDate: permit.issueDate,
          expiryDate: permit.expiryDate,
          responsiblePerson: permit.responsiblePerson.name,
          supervisor: permit.supervisor.name,
          emergencyPhone: '911',
          verificationUrl: `${window.location.origin}/verify-permit/${permit.id}`
        } as QRCodeData;
        
        qrCodeDataURL = await QRCodeService.generateQRCode(qrData);
      }
      
      // Générer PDF
      const pdfBlob = await QRCodeService.generatePDF(permit, qrCodeDataURL);
      
      // Télécharger le PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Permis_${permit.permitNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF generated and downloaded');
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('❌ Erreur lors de la génération du PDF.');
    }
  };

  const searchSimilarPermits = async (permit: CanadianPermit) => {
    try {
      console.log('🔍 Searching similar permits...');
      
      const similarPermits = await permitService.findSimilarPermits(
        permit.worksite.address,
        permit.type
      );
      
      if (similarPermits.length > 0) {
        const message = `📋 ${similarPermits.length} permis similaires trouvés pour ce site.\n\nVoulez-vous réutiliser les données d'un permis précédent?`;
        if (confirm(message)) {
          // Logique de réutilisation à implémenter
          console.log('📋 User chose to reuse previous permit data');
        }
      } else {
        alert('ℹ️ Aucun permis similaire trouvé pour ce site.');
      }
      
    } catch (error) {
      console.error('❌ Error searching similar permits:', error);
    }
  };
  const [permits, setPermits] = useState<CanadianPermit[]>(() => {
    console.log('🍁 Generating Canadian permits for province:', province);
    return generateCanadianPermits(province as ProvinceCode, language);
  });
  
  // =================== CALCUL AUTOMATIQUE DU TAUX DE COMPLETION ===================
  const calculateCompletionRate = (permit: CanadianPermit): number => {
    const totalRequirements = permit.legalRequirements.length;
    const completedRequirements = permit.legalRequirements.filter(req => req.completed).length;
    
    // Ajout des autres éléments obligatoires
    let totalElements = totalRequirements;
    let completedElements = completedRequirements;
    
    // Responsables (plus détaillés)
    if (permit.responsiblePerson.name && permit.responsiblePerson.phone) completedElements++;
    if (permit.supervisor.name && permit.supervisor.certification) completedElements++;
    totalElements += 2;
    
    // Personnel autorisé avec formations
    if (permit.authorizedPersonnel.length > 0) {
      const validPersonnel = permit.authorizedPersonnel.filter(p => 
        p.name && p.certification && p.certificationExpiry
      );
      if (validPersonnel.length > 0) completedElements++;
    }
    totalElements += 1;
    
    // Site de travail avec photos
    if (permit.worksite.address) completedElements++;
    if (permit.worksite.photos.length > 0) completedElements++;
    totalElements += 2;
    
    // Mesures de sécurité
    if (permit.measurements.length > 0) completedElements++;
    totalElements += 1;
    
    return Math.round((completedElements / totalElements) * 100);
  };

  // =================== FONCTIONS UTILITAIRES PHOTOS & TEMPS ===================
  const addWorkerEntry = (permitId: string) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const newWorker: WorkerEntry = {
          id: `worker_${Date.now()}`,
          name: '',
          role: '',
          certification: '',
          certificationExpiry: '',
          photo: undefined,
          respiratoryFit: false,
          medicalClearance: false
        };
        return { 
          ...permit, 
          authorizedPersonnel: [...permit.authorizedPersonnel, newWorker]
        };
      }
      return permit;
    });
    setPermits(updatedPermits);
  };

  const logWorkerEntry = (permitId: string, workerId: string, action: 'entry' | 'exit') => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const worker = permit.authorizedPersonnel.find(w => w.id === workerId);
        if (worker) {
          const newLog: TimeLog = {
            id: `log_${Date.now()}`,
            workerId: workerId,
            workerName: worker.name,
            action: action,
            timestamp: new Date().toISOString(),
            location: undefined, // Géolocalisation à implémenter
            notes: ''
          };
          
          // Mettre à jour aussi le temps d'entrée/sortie du travailleur
          const updatedPersonnel = permit.authorizedPersonnel.map(p => {
            if (p.id === workerId) {
              return {
                ...p,
                [action === 'entry' ? 'entryTime' : 'exitTime']: new Date().toISOString()
              };
            }
            return p;
          });
          
          return {
            ...permit,
            timeLogs: [...permit.timeLogs, newLog],
            authorizedPersonnel: updatedPersonnel
          };
        }
      }
      return permit;
    });
    setPermits(updatedPermits);
  };

  const addSafetyMeasurement = (permitId: string, measurement: Omit<SafetyMeasurement, 'id'>) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const newMeasurement: SafetyMeasurement = {
          ...measurement,
          id: `measure_${Date.now()}`
        };
        return {
          ...permit,
          measurements: [...permit.measurements, newMeasurement]
        };
      }
      return permit;
    });
    setPermits(updatedPermits);
  };

  const addPhoto = (permitId: string, photoType: PermitPhoto['type'], file: File) => {
    // Simulation d'upload - dans la vraie vie, uploadez vers votre serveur
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedPermits = permits.map(permit => {
        if (permit.id === permitId) {
          const newPhoto: PermitPhoto = {
            id: `photo_${Date.now()}`,
            type: photoType,
            url: e.target?.result as string,
            caption: { fr: '', en: '' },
            timestamp: new Date().toISOString(),
            takenBy: permit.responsiblePerson.name || 'Utilisateur'
          };
          return {
            ...permit,
            photos: [...permit.photos, newPhoto]
          };
        }
        return permit;
      });
      setPermits(updatedPermits);
    };
    reader.readAsDataURL(file);
  };

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, expanded: !permit.expanded }
        : permit
    );
    setPermits(updatedPermits);
  };
  
  const handleRequirementToggle = (permitId: string, requirementId: string) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const updatedRequirements = permit.legalRequirements.map(req =>
          req.id === requirementId 
            ? { 
                ...req, 
                completed: !req.completed,
                dateCompleted: !req.completed ? new Date().toISOString() : undefined
              }
            : req
        );
        const updatedPermit = { 
          ...permit, 
          legalRequirements: updatedRequirements 
        };
        updatedPermit.completionRate = calculateCompletionRate(updatedPermit);
        return updatedPermit;
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updatePermitField = (permitId: string, field: string, value: any) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const updatedPermit = { ...permit, [field]: value };
        updatedPermit.completionRate = calculateCompletionRate(updatedPermit);
        return updatedPermit;
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateWorker = (permitId: string, workerId: string, field: string, value: any) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const updatedPersonnel = permit.authorizedPersonnel.map(worker =>
          worker.id === workerId ? { ...worker, [field]: value } : worker
        );
        const updatedPermit = { ...permit, authorizedPersonnel: updatedPersonnel };
        updatedPermit.completionRate = calculateCompletionRate(updatedPermit);
        return updatedPermit;
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: CanadianPermit[]) => {
    const activePermits = updatedPermits.filter(p => p.status !== 'draft');
    
    const permitsData = {
      list: updatedPermits,
      active: activePermits,
      stats: {
        total: updatedPermits.length,
        active: activePermits.length,
        avgCompletion: Math.round(updatedPermits.reduce((sum, p) => sum + p.completionRate, 0) / updatedPermits.length)
      }
    };
    
    onDataChange('permits', permitsData);
    
    if (onPermitChange) {
      onPermitChange(activePermits);
    }
  };

  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter(permit => {
      const matchesSearch = permit.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.regulations.some(reg => reg.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [permits, searchTerm, language]);

  // =================== RENDU ===================
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
          
          .header { 
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); 
            border: 1px solid rgba(239, 68, 68, 0.3); 
            border-radius: 16px; 
            padding: 24px; 
            margin-bottom: 24px;
          }
          
          .header-title { 
            color: #ef4444; 
            font-size: 20px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            display: flex; 
            align-items: center; 
            gap: 12px;
          }
          
          .header-subtitle {
            color: #dc2626;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .search-section { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 24px; 
          }
          
          .search-input-wrapper { 
            position: relative; 
            max-width: 400px;
          }
          
          .search-icon { 
            position: absolute; 
            left: 12px; 
            top: 50%; 
            transform: translateY(-50%); 
            color: #94a3b8; 
            z-index: 10; 
          }
          
          .search-field { 
            width: 100%; 
            padding: 12px 12px 12px 40px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 14px; 
            transition: all 0.3s ease;
          }
          
          .search-field:focus { 
            outline: none; 
            border-color: #ef4444; 
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          
          .permits-list { 
            display: flex;
            flex-direction: column;
            gap: 16px; 
          }
          
          .permit-card { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            overflow: hidden;
            transition: all 0.3s ease; 
          }
          
          .permit-card:hover { 
            border-color: rgba(239, 68, 68, 0.5); 
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); 
          }
          
          .permit-header { 
            padding: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          }
          
          .permit-header:hover {
            background: rgba(30, 41, 59, 0.3);
          }
          
          .permit-icon { 
            font-size: 32px; 
            width: 48px; 
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 12px;
          }
          
          .permit-main-info { 
            flex: 1; 
          }
          
          .permit-name { 
            color: #ffffff; 
            font-size: 18px; 
            font-weight: 600; 
            margin: 0 0 8px; 
          }
          
          .permit-number { 
            color: #94a3b8; 
            font-size: 12px; 
            font-weight: 500; 
            margin-bottom: 4px; 
          }
          
          .permit-authority { 
            color: #60a5fa; 
            font-size: 12px; 
            font-weight: 500; 
          }
          
          .permit-status-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }
          
          .permit-status { 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-draft { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
          .status-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
          .status-approved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
          .status-expired { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
          
          .completion-rate {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #ef4444;
          }
          
          .completion-bar {
            width: 100px;
            height: 6px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 3px;
            overflow: hidden;
          }
          
          .completion-fill {
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #22c55e);
            transition: width 0.3s ease;
          }
          
          .expand-icon {
            color: #94a3b8;
            transition: transform 0.3s ease;
          }
          
          .expand-icon.expanded {
            transform: rotate(90deg);
          }
          
          .permit-details { 
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .permit-details.expanded {
            max-height: 2000px;
            padding: 24px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
          }
          
          .detail-section {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 12px;
            padding: 16px;
          }
          
          .section-title {
            color: #ef4444;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .legal-requirements {
            grid-column: 1 / -1;
          }
          
          .requirement-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 8px;
            margin-bottom: 8px;
            transition: all 0.3s ease;
          }
          
          .requirement-item:hover {
            background: rgba(30, 41, 59, 0.8);
          }
          
          .requirement-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(100, 116, 139, 0.5);
            border-radius: 4px;
            background: rgba(15, 23, 42, 0.8);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            margin-top: 2px;
            flex-shrink: 0;
          }
          
          .requirement-checkbox.checked {
            background: #22c55e;
            border-color: #22c55e;
            color: white;
          }
          
          .requirement-content {
            flex: 1;
          }
          
          .requirement-text {
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
            margin-bottom: 4px;
          }
          
          .requirement-regulation {
            color: #60a5fa;
            font-size: 12px;
            font-weight: 500;
          }
          
          .requirement-mandatory {
            color: #ef4444;
            font-size: 11px;
            font-weight: 600;
            background: rgba(239, 68, 68, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 8px;
          }
          
          .form-group {
            margin-bottom: 12px;
          }
          
          .form-label {
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
            display: block;
          }
          
          .form-input {
            width: 100%;
            padding: 8px 12px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 6px;
            color: #ffffff;
            font-size: 14px;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
          }
          
          .regulations-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .regulation-badge {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .no-permits {
            text-align: center;
            padding: 60px 20px;
            color: #94a3b8;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 16px;
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
          
          @media (max-width: 768px) {
            .details-grid {
              grid-template-columns: 1fr;
            }
            
            .permit-header {
              padding: 16px;
            }
            
            .permit-details.expanded {
              padding: 16px;
            }
          }
        `
      }} />

      <div className="step4-container">
        {/* En-tête */}
        <div className="header">
          <div className="header-title">
            <Shield size={28} />
            {texts.title}
          </div>
          <p className="header-subtitle">
            {texts.subtitle}
          </p>
        </div>

        {/* Section de recherche */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={texts.searchPlaceholder}
              className="search-field"
            />
          </div>
        </div>

        {/* Liste des permis */}
        <div className="permits-list">
          {filteredPermits.map(permit => (
            <div key={permit.id} className="permit-card">
              {/* En-tête du permis */}
              <div className="permit-header" onClick={() => handlePermitToggle(permit.id)}>
                <div className="permit-icon">
                  {permit.type === 'confined_space' && '🏠'}
                  {permit.type === 'hot_work' && '🔥'}
                  {permit.type === 'excavation' && '🏗️'}
                  {permit.type === 'lifting' && '🏗️'}
                  {permit.type === 'height_work' && '🏢'}
                  {permit.type === 'electrical' && '⚡'}
                </div>
                
                <div className="permit-main-info">
                  <h3 className="permit-name">{permit.name[language]}</h3>
                  <div className="permit-number">{texts.permitNumber} {permit.permitNumber}</div>
                  <div className="permit-authority">{permit.issuingAuthority}</div>
                </div>
                
                <div className="permit-status-section">
                  <div className={`permit-status status-${permit.status}`}>
                    {permit.status}
                  </div>
                  <div className="completion-rate">
                    <span>{permit.completionRate}%</span>
                    <div className="completion-bar">
                      <div 
                        className="completion-fill" 
                        style={{ width: `${permit.completionRate}%` }}
                      />
                    {/* Personnel autorisé avec horodatage */}
                    <div className="detail-section">
                      <div className="section-title">
                        <Users size={16} />
                        Personnel Autorisé & Horodatage
                        <button
                          onClick={() => addWorkerEntry(permit.id)}
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 8px',
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          + Ajouter
                        </button>
                        {/* QR Code si généré */}
                      {(permit as any).qrCode && (
                        <div className="detail-section">
                          <div className="section-title">
                            <Target size={16} />
                            📱 QR Code de Vérification
                          </div>
                          
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div>
                              <img 
                                src={(permit as any).qrCode} 
                                alt="QR Code du permis"
                                style={{ 
                                  width: '128px', 
                                  height: '128px',
                                  border: '2px solid #60a5fa',
                                  borderRadius: '8px'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#60a5fa' }}>Instructions de vérification :</strong>
                              </div>
                              <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.4' }}>
                                1. Scannez ce QR code avec votre téléphone<br/>
                                2. Vérifiez les informations du permis<br/>
                                3. Confirmez la validité et l'autorisation<br/>
                                4. Contactez le responsable en cas de doute
                              </div>
                              
                              <div style={{ 
                                marginTop: '12px', 
                                padding: '8px', 
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '6px',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                              }}>
                                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '600' }}>
                                  📋 Données du QR Code :
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                  • Permis: {permit.permitNumber}<br/>
                                  • Site: {permit.worksite.address || 'Non spécifié'}<br/>
                                  • Responsable: {permit.responsiblePerson.name || 'Non spécifié'}<br/>
                                  • Urgence: 911<br/>
                                  • ID: {(permit as any).supabaseId || permit.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message pour générer QR Code */}
                      {!(permit as any).qrCode && permit.responsiblePerson.name && permit.worksite.address && (
                        <div style={{
                          background: 'rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          margin: '16px 0',
                          textAlign: 'center'
                        }}>
                          <div style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '4px' }}>
                            📱 Prêt pour la sauvegarde
                          </div>
                          <div style={{ fontSize: '13px', color: '#f59e0b' }}>
                            Cliquez sur "💾 Sauvegarder" pour générer le QR code et enregistrer dans l'historique
                          </div>
                        </div>
                      )}
                      
                      {permit.authorizedPersonnel.map(worker => (
                        <div key={worker.id} style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={worker.name}
                              onChange={(e) => updateWorker(permit.id, worker.id, 'name', e.target.value)}
                              placeholder="Nom du travailleur"
                              className="form-input"
                              style={{ fontSize: '12px' }}
                            />
                            <input
                              type="text"
                              value={worker.role}
                              onChange={(e) => updateWorker(permit.id, worker.id, 'role', e.target.value)}
                              placeholder="Rôle/Fonction"
                              className="form-input"
                              style={{ fontSize: '12px' }}
                            />
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={worker.certification}
                              onChange={(e) => updateWorker(permit.id, worker.id, 'certification', e.target.value)}
                              placeholder="Certification"
                              className="form-input"
                              style={{ fontSize: '12px' }}
                            />
                            <input
                              type="date"
                              value={worker.certificationExpiry}
                              onChange={(e) => updateWorker(permit.id, worker.id, 'certificationExpiry', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '12px' }}
                            />
                          </div>
                          
                          {/* Horodatage entrée/sortie */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => logWorkerEntry(permit.id, worker.id, 'entry')}
                              disabled={!!worker.entryTime}
                              style={{
                                padding: '4px 8px',
                                background: worker.entryTime ? '#6b7280' : '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: worker.entryTime ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {worker.entryTime ? '✓ Entré' : '→ Entrée'}
                            </button>
                            
                            {worker.entryTime && (
                              <span style={{ fontSize: '11px', color: '#22c55e' }}>
                                Entré: {new Date(worker.entryTime).toLocaleTimeString()}
                              </span>
                            )}
                            
                            {worker.entryTime && !worker.exitTime && (
                              <button
                                onClick={() => logWorkerEntry(permit.id, worker.id, 'exit')}
                                style={{
                                  padding: '4px 8px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                ← Sortie
                              </button>
                            )}
                            
                            {worker.exitTime && (
                              <span style={{ fontSize: '11px', color: '#ef4444' }}>
                                Sorti: {new Date(worker.exitTime).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {permit.authorizedPersonnel.length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#94a3b8',
                          fontSize: '14px'
                        }}>
                          Aucun travailleur autorisé. Cliquez sur "Ajouter" pour commencer.
                        </div>
                      )}
                    </div>

                    {/* Mesures de sécurité en temps réel */}
                    <div className="detail-section">
                      <div className="section-title">
                        <Activity size={16} />
                        Mesures de Sécurité
                        <button
                          onClick={() => {
                            const parameter = prompt('Paramètre (oxygen, carbon_monoxide, hydrogen_sulfide, lel):');
                            const value = prompt('Valeur mesurée:');
                            const unit = prompt('Unité (%, ppm, etc.):');
                            if (parameter && value && unit) {
                              addSafetyMeasurement(permit.id, {
                                parameter,
                                value: parseFloat(value),
                                unit,
                                acceptable: parameter === 'oxygen' ? (parseFloat(value) >= 19.5 && parseFloat(value) <= 23.5) : parseFloat(value) < 10,
                                timestamp: new Date().toISOString(),
                                measuredBy: permit.responsiblePerson.name || 'Utilisateur'
                              });
                            }
                          }}
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 8px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          + Mesure
                        </button>
                      </div>
                      
                      {permit.measurements.map(measurement => (
                        <div key={measurement.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: measurement.acceptable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${measurement.acceptable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: '6px',
                          marginBottom: '6px'
                        }}>
                          <div>
                            <span style={{ fontWeight: '600', color: '#ffffff' }}>
                              {measurement.parameter.replace('_', ' ').toUpperCase()}
                            </span>
                            <span style={{ marginLeft: '8px', color: measurement.acceptable ? '#22c55e' : '#ef4444' }}>
                              {measurement.value} {measurement.unit}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {new Date(measurement.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                      
                      {permit.measurements.length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#94a3b8',
                          fontSize: '14px'
                        }}>
                          Aucune mesure enregistrée. Tests atmosphériques requis pour espaces clos.
                        </div>
                      )}
                    </div>

                    {/* Photos du permis */}
                    <div className="detail-section">
                      <div className="section-title">
                        <Target size={16} />
                        Photos du Site
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              addPhoto(permit.id, 'site_overview', e.target.files[0]);
                            }
                          }}
                          style={{ display: 'none' }}
                          id={`photo-upload-${permit.id}`}
                        />
                        <label
                          htmlFor={`photo-upload-${permit.id}`}
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 8px',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📷 Photo
                        </label>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '8px'
                      }}>
                        {permit.photos.map(photo => (
                          <div key={photo.id} style={{
                            position: 'relative',
                            borderRadius: '6px',
                            overflow: 'hidden'
                          }}>
                            <img
                              src={photo.url}
                              alt={photo.caption[language] || 'Photo du site'}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              right: '0',
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              padding: '2px 4px',
                              fontSize: '10px'
                            }}>
                              {new Date(photo.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {permit.photos.length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#94a3b8',
                          fontSize: '14px'
                        }}>
                          Aucune photo. Ajoutez des photos du site, des équipements et des mesures de sécurité.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <ChevronRight 
                  className={`expand-icon ${permit.expanded ? 'expanded' : ''}`} 
                  size={20} 
                />
              </div>

              {/* Détails du permis */}
              <div className={`permit-details ${permit.expanded ? 'expanded' : ''}`}>
                {permit.expanded && (
                  <>
                    {/* Grille des détails */}
                    <div className="details-grid">
                      {/* Informations générales */}
                      <div className="detail-section">
                        <div className="section-title">
                          <FileText size={16} />
                          Informations Générales
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => searchSimilarPermits(permit)}
                              style={{
                                padding: '4px 8px',
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                              title="Rechercher des permis similaires pour réutilisation"
                            >
                              🔍 Historique
                            </button>
                            <button
                              onClick={() => savePermitToSupabase(permit)}
                              disabled={!permit.responsiblePerson.name || !permit.worksite.address}
                              style={{
                                padding: '4px 8px',
                                background: permit.responsiblePerson.name && permit.worksite.address ? '#22c55e' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: permit.responsiblePerson.name && permit.worksite.address ? 'pointer' : 'not-allowed'
                              }}
                              title="Sauvegarder et générer QR Code"
                            >
                              💾 Sauvegarder
                            </button>
                            <button
                              onClick={() => generatePermitPDF(permit)}
                              style={{
                                padding: '4px 8px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                              title="Générer PDF officiel"
                            >
                              📄 PDF
                            </button>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">{texts.responsiblePerson}</label>
                          <input
                            type="text"
                            value={permit.responsiblePerson.name}
                            onChange={(e) => updatePermitField(permit.id, 'responsiblePerson', {
                              ...permit.responsiblePerson,
                              name: e.target.value
                            })}
                            className="form-input"
                            placeholder="Nom du responsable"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Téléphone responsable</label>
                          <input
                            type="tel"
                            value={permit.responsiblePerson.phone}
                            onChange={(e) => updatePermitField(permit.id, 'responsiblePerson', {
                              ...permit.responsiblePerson,
                              phone: e.target.value
                            })}
                            className="form-input"
                            placeholder="(xxx) xxx-xxxx"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">{texts.supervisor}</label>
                          <input
                            type="text"
                            value={permit.supervisor.name}
                            onChange={(e) => updatePermitField(permit.id, 'supervisor', {
                              ...permit.supervisor,
                              name: e.target.value
                            })}
                            className="form-input"
                            placeholder="Nom du superviseur"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Certification superviseur</label>
                          <input
                            type="text"
                            value={permit.supervisor.certification}
                            onChange={(e) => updatePermitField(permit.id, 'supervisor', {
                              ...permit.supervisor,
                              certification: e.target.value
                            })}
                            className="form-input"
                            placeholder="Type de certification"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Adresse du site</label>
                          <input
                            type="text"
                            value={permit.worksite.address}
                            onChange={(e) => updatePermitField(permit.id, 'worksite', { 
                              ...permit.worksite, 
                              address: e.target.value 
                            })}
                            className="form-input"
                            placeholder="Adresse complète"
                          />
                        </div>
                      </div>

                      {/* Réglementations */}
                      <div className="detail-section">
                        <div className="section-title">
                          <Settings size={16} />
                          Réglementations Applicables
                        </div>
                        
                        <div className="regulations-list">
                          {permit.regulations.map((regulation, index) => (
                            <div key={index} className="regulation-badge">
                              {regulation}
                            </div>
                          ))}
                        </div>
                        
                        <div className="form-group" style={{ marginTop: '16px' }}>
                          <label className="form-label">Valide jusqu'au</label>
                          <input
                            type="datetime-local"
                            value={permit.expiryDate.slice(0, 16)}
                            onChange={(e) => updatePermitField(permit.id, 'expiryDate', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Exigences légales */}
                    <div className="detail-section legal-requirements">
                      <div className="section-title">
                        <AlertTriangle size={16} />
                        {texts.legalRequirements}
                      </div>
                      
                      {permit.legalRequirements.map(requirement => (
                        <div key={requirement.id} className="requirement-item">
                          <div 
                            className={`requirement-checkbox ${requirement.completed ? 'checked' : ''}`}
                            onClick={() => handleRequirementToggle(permit.id, requirement.id)}
                          >
                            {requirement.completed && <CheckCircle size={14} />}
                          </div>
                          
                          <div className="requirement-content">
                            <div className="requirement-text">
                              {requirement.requirement[language]}
                              {requirement.mandatory && (
                                <span className="requirement-mandatory">
                                  {texts.mandatory}
                                </span>
                              )}
                            </div>
                            <div className="requirement-regulation">
                              {texts.regulation}: {requirement.regulation}
                            </div>
                            
                            {requirement.completed && (
                              <div style={{ marginTop: '8px', fontSize: '12px', color: '#22c55e' }}>
                                ✅ {texts.completed} {requirement.dateCompleted && 
                                  `le ${new Date(requirement.dateCompleted).toLocaleDateString()}`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun permis */}
        {filteredPermits.length === 0 && (
          <div className="no-permits">
            <Shield size={48} />
            <h3 style={{ margin: '16px 0 8px', fontSize: '18px', color: '#e2e8f0' }}>
              Aucun permis trouvé
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Modifiez vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;
