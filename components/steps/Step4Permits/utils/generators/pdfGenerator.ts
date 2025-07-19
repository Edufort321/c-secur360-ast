// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/GENERATORS/PDFGENERATOR.TS ===================
// Générateur PDF pour permis de travail avec templates professionnels et QR codes
"use client";

import type { 
  PermitFormData, 
  LegalPermit, 
  AtmosphericReading,
  ElectronicSignature,
  BilingualText 
} from '../../types';
import type { ProvinceCode } from '../../constants/provinces';

// =================== TYPES PDF ===================

export interface PDFOptions {
  format: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  language: 'fr' | 'en' | 'both';
  template: 'standard' | 'compact' | 'detailed' | 'emergency' | 'archive';
  branding: {
    logo?: string;                        // URL logo entreprise
    company: string;                      // Nom entreprise
    colors: {
      primary: string;                    // Couleur primaire
      secondary: string;                  // Couleur secondaire
      accent: string;                     // Couleur accent
    };
  };
  features: {
    qrCode: boolean;                      // Inclure QR code
    watermark: boolean;                   // Filigrane
    signatures: boolean;                  // Signatures électroniques
    attachments: boolean;                 // Pièces jointes
    barcode: boolean;                     // Code-barres
    timestamps: boolean;                  // Horodatage
    encryption: boolean;                  // Chiffrement PDF
  };
  security: {
    password?: string;                    // Mot de passe
    permissions: {
      print: boolean;
      copy: boolean;
      edit: boolean;
      annotate: boolean;
    };
    digitalSignature?: {
      certificate: string;               // Certificat numérique
      reason: string;                     // Raison signature
      location: string;                   // Lieu signature
    };
  };
}

export interface PDFTemplate {
  id: string;                             // ID template
  name: BilingualText;                    // Nom template
  description: BilingualText;             // Description
  type: 'permit' | 'inspection' | 'incident' | 'training' | 'audit';
  applicablePermits: string[];            // Types permis applicables
  layout: {
    header: PDFSection;                   // En-tête
    body: PDFSection[];                   // Corps sections
    footer: PDFSection;                   // Pied de page
    watermark?: PDFWatermark;             // Filigrane
  };
  styling: {
    fonts: {
      primary: string;                    // Police principale
      secondary: string;                  // Police secondaire
      monospace: string;                  // Police monospace
    };
    colors: {
      text: string;                       // Couleur texte
      headings: string;                   // Couleur titres
      borders: string;                    // Couleur bordures
      background: string;                 // Couleur fond
      highlight: string;                  // Couleur surbrillance
    };
    spacing: {
      lineHeight: number;                 // Hauteur ligne
      paragraphSpacing: number;           // Espacement paragraphes
      sectionSpacing: number;             // Espacement sections
    };
  };
  metadata: {
    version: string;                      // Version template
    author: string;                       // Auteur
    lastModified: string;                 // Dernière modification
    compliance: string[];                 // Standards conformité
  };
}

export interface PDFSection {
  id: string;                             // ID section
  title?: BilingualText;                  // Titre section
  type: 'header' | 'footer' | 'content' | 'table' | 'signature' | 'qr' | 'image' | 'spacer';
  layout: 'single' | 'two_column' | 'three_column' | 'grid';
  content: PDFContent[];                  // Contenu
  styling?: {
    background?: string;                  // Couleur fond
    border?: string;                      // Bordure
    padding?: number;                     // Espacement interne
    margin?: number;                      // Marge externe
  };
  conditions?: {                         // Conditions affichage
    showIf: string;                       // Condition affichage
    hideEmpty: boolean;                   // Masquer si vide
    pageBreakBefore?: boolean;            // Saut page avant
    pageBreakAfter?: boolean;             // Saut page après
  };
}

export interface PDFContent {
  type: 'text' | 'table' | 'image' | 'qr' | 'barcode' | 'signature' | 'chart' | 'list';
  data: any;                              // Données contenu
  formatting?: {
    font?: string;                        // Police
    size?: number;                        // Taille
    color?: string;                       // Couleur
    weight?: 'normal' | 'bold' | 'light';
    alignment?: 'left' | 'center' | 'right' | 'justify';
    indent?: number;                      // Indentation
  };
  position?: {
    x?: number;                          // Position X
    y?: number;                          // Position Y
    width?: number;                       // Largeur
    height?: number;                      // Hauteur
  };
}

export interface PDFWatermark {
  type: 'text' | 'image';
  content: string;                        // Texte ou URL image
  opacity: number;                        // Opacité 0-1
  rotation: number;                       // Rotation degrés
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;                          // Taille
  color?: string;                         // Couleur (texte)
}

export interface PDFGenerationResult {
  success: boolean;                       // Succès génération
  blob?: Blob;                           // Blob PDF
  url?: string;                          // URL téléchargement
  filename: string;                       // Nom fichier
  size: number;                          // Taille fichier (octets)
  pages: number;                         // Nombre pages
  metadata: {                            // Métadonnées
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    creator: string;
    producer: string;
    creationDate: Date;
    modificationDate: Date;
  };
  security?: {                           // Sécurité appliquée
    encrypted: boolean;
    signed: boolean;
    permissions: string[];
  };
  qrCode?: {                             // QR code généré
    url: string;
    data: string;
    position: { x: number; y: number; };
  };
  error?: string;                        // Erreur si échec
  warnings?: string[];                   // Avertissements
}

// =================== GÉNÉRATEUR PRINCIPAL ===================

export class PDFGenerator {
  private options: PDFOptions;
  private template: PDFTemplate;
  
  constructor(options: Partial<PDFOptions> = {}) {
    this.options = this.mergeDefaultOptions(options);
    this.template = this.getDefaultTemplate();
  }

  // =================== MÉTHODES PUBLIQUES ===================

  /**
   * Génère un PDF pour un permis de travail
   */
  async generatePermitPDF(
    permit: LegalPermit,
    formData: PermitFormData,
    signatures?: ElectronicSignature[],
    atmosphericData?: AtmosphericReading[]
  ): Promise<PDFGenerationResult> {
    try {
      // Initialiser le document PDF
      const doc = await this.initializePDF();
      
      // Ajouter les métadonnées
      this.addMetadata(doc, permit, formData);
      
      // Générer le contenu par sections
      await this.generateHeader(doc, permit, formData);
      await this.generatePermitInfo(doc, permit, formData);
      await this.generatePersonnelSection(doc, formData);
      await this.generateHazardAnalysis(doc, formData);
      
      if (atmosphericData?.length) {
        await this.generateAtmosphericData(doc, atmosphericData);
      }
      
      await this.generateEquipmentSection(doc, formData);
      await this.generateProceduresSection(doc, formData);
      
      if (signatures?.length) {
        await this.generateSignaturesSection(doc, signatures);
      }
      
      // Ajouter QR code si activé
      if (this.options.features.qrCode) {
        await this.addQRCode(doc, permit);
      }
      
      // Ajouter le pied de page
      await this.generateFooter(doc, permit);
      
      // Appliquer la sécurité
      if (this.options.security.password) {
        this.applySecuritySettings(doc);
      }
      
      // Générer le blob final
      const blob = await this.finalizePDF(doc);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob),
        filename: this.generateFilename(permit),
        size: blob.size,
        pages: this.getPageCount(doc),
        metadata: this.generateMetadata(permit, formData),
        security: this.options.security.password ? {
          encrypted: true,
          signed: !!this.options.security.digitalSignature,
          permissions: Object.keys(this.options.security.permissions)
            .filter(key => this.options.security.permissions[key as keyof typeof this.options.security.permissions])
        } : undefined,
        qrCode: this.options.features.qrCode ? {
          url: this.generateQRCodeURL(permit),
          data: this.generateQRCodeData(permit),
          position: { x: 500, y: 50 }
        } : undefined
      };
      
    } catch (error) {
      return {
        success: false,
        filename: this.generateFilename(permit),
        size: 0,
        pages: 0,
        metadata: this.generateMetadata(permit, formData),
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération PDF'
      };
    }
  }

  /**
   * Génère un PDF d'inspection
   */
  async generateInspectionPDF(
    inspectionData: any,
    atmosphericReadings: AtmosphericReading[]
  ): Promise<PDFGenerationResult> {
    // Implementation similaire pour inspections
    return this.generateGenericPDF('inspection', inspectionData);
  }

  /**
   * Génère un PDF de rapport d'incident
   */
  async generateIncidentPDF(incidentData: any): Promise<PDFGenerationResult> {
    return this.generateGenericPDF('incident', incidentData);
  }

  /**
   * Génère un PDF de formation
   */
  async generateTrainingPDF(trainingData: any): Promise<PDFGenerationResult> {
    return this.generateGenericPDF('training', trainingData);
  }

  // =================== MÉTHODES PRIVÉES ===================

  private mergeDefaultOptions(options: Partial<PDFOptions>): PDFOptions {
    return {
      format: 'A4',
      orientation: 'portrait',
      margins: { top: 50, right: 50, bottom: 50, left: 50 },
      language: 'fr',
      template: 'standard',
      branding: {
        company: 'Votre Entreprise',
        colors: {
          primary: '#1e3a8a',
          secondary: '#64748b',
          accent: '#ef4444'
        }
      },
      features: {
        qrCode: true,
        watermark: false,
        signatures: true,
        attachments: false,
        barcode: false,
        timestamps: true,
        encryption: false
      },
      security: {
        permissions: {
          print: true,
          copy: false,
          edit: false,
          annotate: false
        }
      },
      ...options
    };
  }

  private getDefaultTemplate(): PDFTemplate {
    return {
      id: 'standard-permit',
      name: {
        fr: 'Modèle Standard de Permis',
        en: 'Standard Permit Template'
      },
      description: {
        fr: 'Modèle standard pour tous types de permis de travail',
        en: 'Standard template for all work permit types'
      },
      type: 'permit',
      applicablePermits: ['all'],
      layout: {
        header: {
          id: 'header',
          type: 'header',
          layout: 'single',
          content: []
        },
        body: [],
        footer: {
          id: 'footer',
          type: 'footer',
          layout: 'single',
          content: []
        }
      },
      styling: {
        fonts: {
          primary: 'Arial',
          secondary: 'Times New Roman',
          monospace: 'Courier New'
        },
        colors: {
          text: '#1f2937',
          headings: '#1e3a8a',
          borders: '#d1d5db',
          background: '#ffffff',
          highlight: '#fef3c7'
        },
        spacing: {
          lineHeight: 1.4,
          paragraphSpacing: 12,
          sectionSpacing: 20
        }
      },
      metadata: {
        version: '1.0',
        author: 'Système de Permis',
        lastModified: new Date().toISOString(),
        compliance: ['CNESST', 'OHSA', 'WorkSafeBC']
      }
    };
  }

  private async initializePDF(): Promise<any> {
    // Simulation d'initialisation PDF (remplacer par vraie bibliothèque PDF)
    return {
      pages: [],
      metadata: {},
      security: {},
      content: []
    };
  }

  private addMetadata(doc: any, permit: LegalPermit, formData: PermitFormData): void {
    doc.metadata = {
      title: `Permis de Travail - ${permit.name}`,
      author: formData.personnel.superviseur?.nom || 'Système de Permis',
      subject: `${permit.category} - ${permit.code}`,
      keywords: [
        permit.category,
        permit.code,
        formData.identification.province,
        'sécurité',
        'travail'
      ],
      creator: 'Système de Gestion des Permis v1.0',
      producer: 'PDF Generator v1.0',
      creationDate: new Date(),
      modificationDate: new Date()
    };
  }

  private async generateHeader(doc: any, permit: LegalPermit, formData: PermitFormData): Promise<void> {
    const headerContent = {
      logo: this.options.branding.logo,
      title: {
        fr: `PERMIS DE TRAVAIL - ${permit.name.toUpperCase()}`,
        en: `WORK PERMIT - ${permit.name.toUpperCase()}`
      },
      subtitle: {
        fr: `${permit.category} - Province: ${formData.identification.province}`,
        en: `${permit.category} - Province: ${formData.identification.province}`
      },
      permitNumber: permit.code,
      date: new Date().toLocaleDateString(this.options.language === 'fr' ? 'fr-CA' : 'en-CA'),
      urgency: permit.priority === 'critical' || permit.priority === 'high'
    };

    // Ajouter le contenu de l'en-tête au document
    doc.content.push({
      type: 'header',
      data: headerContent,
      styling: {
        background: this.options.branding.colors.primary,
        color: '#ffffff',
        padding: 20
      }
    });
  }

  private async generatePermitInfo(doc: any, permit: LegalPermit, formData: PermitFormData): Promise<void> {
    const permitInfo = {
      identification: formData.identification,
      validity: permit.validity,
      legalRequirements: permit.legalRequirements,
      compliance: permit.compliance,
      status: permit.status,
      priority: permit.priority
    };

    doc.content.push({
      type: 'section',
      title: {
        fr: 'INFORMATIONS GÉNÉRALES',
        en: 'GENERAL INFORMATION'
      },
      data: permitInfo,
      layout: 'two_column'
    });
  }

  private async generatePersonnelSection(doc: any, formData: PermitFormData): Promise<void> {
    const personnelData = {
      superviseur: formData.personnel.superviseur,
      surveillants: formData.personnel.surveillants,
      entrants: formData.personnel.entrants,
      specialisedPersonnel: formData.personnel.specialisedPersonnel
    };

    doc.content.push({
      type: 'section',
      title: {
        fr: 'PERSONNEL ASSIGNÉ',
        en: 'ASSIGNED PERSONNEL'
      },
      data: personnelData,
      layout: 'table',
      tableConfig: {
        headers: {
          fr: ['Nom', 'Rôle', 'Certification', 'Signature', 'Date'],
          en: ['Name', 'Role', 'Certification', 'Signature', 'Date']
        },
        columnWidths: [25, 20, 25, 20, 10]
      }
    });
  }

  private async generateHazardAnalysis(doc: any, formData: PermitFormData): Promise<void> {
    // Analyser les dangers selon le type de permis
    const hazards = this.analyzeHazards(formData);
    
    doc.content.push({
      type: 'section',
      title: {
        fr: 'ANALYSE DES DANGERS',
        en: 'HAZARD ANALYSIS'
      },
      data: hazards,
      layout: 'grid',
      styling: {
        highlight: true,
        border: '2px solid ' + this.options.branding.colors.accent
      }
    });
  }

  private async generateAtmosphericData(doc: any, readings: AtmosphericReading[]): Promise<void> {
    const atmosphericTable = {
      readings: readings.map(reading => ({
        timestamp: new Date(reading.timestamp).toLocaleString(),
        gasType: reading.gasType,
        value: reading.value,
        unit: reading.unit,
        alarmLevel: reading.alarmLevel,
        operator: reading.metadata.operator,
        location: reading.location.point
      })),
      summary: {
        totalReadings: readings.length,
        criticalAlerts: readings.filter(r => r.alarmLevel === 'critical').length,
        lastReading: readings[readings.length - 1]?.timestamp
      }
    };

    doc.content.push({
      type: 'section',
      title: {
        fr: 'DONNÉES ATMOSPHÉRIQUES',
        en: 'ATMOSPHERIC DATA'
      },
      data: atmosphericTable,
      layout: 'table',
      tableConfig: {
        headers: {
          fr: ['Heure', 'Gaz', 'Valeur', 'Unité', 'Niveau', 'Opérateur', 'Lieu'],
          en: ['Time', 'Gas', 'Value', 'Unit', 'Level', 'Operator', 'Location']
        },
        columnWidths: [15, 15, 10, 10, 15, 20, 15],
        conditionalFormatting: {
          alarmLevel: {
            'critical': { background: '#fef2f2', color: '#dc2626' },
            'danger': { background: '#fef3c7', color: '#d97706' },
            'warning': { background: '#fefce8', color: '#ca8a04' }
          }
        }
      }
    });
  }

  private async generateEquipmentSection(doc: any, formData: PermitFormData): Promise<void> {
    const equipment = {
      protection: formData.equipements.protection,
      detection: formData.equipements.detection,
      sauvetage: formData.equipements.sauvetage,
      communication: formData.equipements.communication
    };

    doc.content.push({
      type: 'section',
      title: {
        fr: 'ÉQUIPEMENTS DE SÉCURITÉ',
        en: 'SAFETY EQUIPMENT'
      },
      data: equipment,
      layout: 'grid'
    });
  }

  private async generateProceduresSection(doc: any, formData: PermitFormData): Promise<void> {
    const procedures = formData.procedures;

    doc.content.push({
      type: 'section',
      title: {
        fr: 'PROCÉDURES SPÉCIALISÉES',
        en: 'SPECIALIZED PROCEDURES'
      },
      data: procedures,
      layout: 'single'
    });
  }

  private async generateSignaturesSection(doc: any, signatures: ElectronicSignature[]): Promise<void> {
    const signatureData = signatures.map(sig => ({
      signer: sig.signer.name,
      role: sig.signer.role,
      type: sig.signatureType,
      timestamp: new Date(sig.createdAt).toLocaleString(),
      verified: sig.validation.technical.signatureValid,
      image: sig.signatureData.canvas?.base64
    }));

    doc.content.push({
      type: 'section',
      title: {
        fr: 'SIGNATURES ÉLECTRONIQUES',
        en: 'ELECTRONIC SIGNATURES'
      },
      data: signatureData,
      layout: 'signature_grid',
      validation: {
        hashVerification: true,
        timestampVerification: true,
        certificateVerification: true
      }
    });
  }

  private async addQRCode(doc: any, permit: LegalPermit): Promise<void> {
    const qrData = {
      url: this.generateQRCodeURL(permit),
      data: this.generateQRCodeData(permit),
      size: 100,
      position: { x: 500, y: 50 }
    };

    doc.content.push({
      type: 'qr',
      data: qrData,
      instructions: {
        fr: 'Scannez ce code QR pour accéder à la fiche en ligne',
        en: 'Scan this QR code to access the online record'
      }
    });
  }

  private async generateFooter(doc: any, permit: LegalPermit): Promise<void> {
    const footerContent = {
      company: this.options.branding.company,
      timestamp: new Date().toISOString(),
      pageNumbers: true,
      watermark: this.options.features.watermark,
      legalNotice: {
        fr: 'Document confidentiel - Usage autorisé seulement',
        en: 'Confidential document - Authorized use only'
      }
    };

    doc.content.push({
      type: 'footer',
      data: footerContent
    });
  }

  private applySecuritySettings(doc: any): void {
    if (this.options.security.password) {
      doc.security = {
        userPassword: this.options.security.password,
        ownerPassword: this.generateOwnerPassword(),
        permissions: this.options.security.permissions
      };
    }

    if (this.options.security.digitalSignature) {
      doc.digitalSignature = this.options.security.digitalSignature;
    }
  }

  private async finalizePDF(doc: any): Promise<Blob> {
    // Simulation de finalisation PDF (remplacer par vraie bibliothèque)
    const pdfContent = JSON.stringify(doc);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private generateFilename(permit: LegalPermit): string {
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = permit.name.replace(/[^a-zA-Z0-9]/g, '_');
    return `Permis_${sanitizedName}_${permit.code}_${date}.pdf`;
  }

  private getPageCount(doc: any): number {
    // Simulation calcul nombre de pages
    return Math.ceil(doc.content.length / 5);
  }

  private generateMetadata(permit: LegalPermit, formData: PermitFormData): any {
    return {
      title: `Permis de Travail - ${permit.name}`,
      author: formData.personnel.superviseur?.nom || 'Système de Permis',
      subject: `${permit.category} - ${permit.code}`,
      keywords: [permit.category, permit.code, 'sécurité'],
      creator: 'Système de Gestion des Permis',
      producer: 'PDF Generator',
      creationDate: new Date(),
      modificationDate: new Date()
    };
  }

  private generateQRCodeURL(permit: LegalPermit): string {
    return `https://app.permits.ca/confined-spaces/${permit.id}?utm_source=qr&utm_medium=print&utm_campaign=space_access`;
  }

  private generateQRCodeData(permit: LegalPermit): string {
    return JSON.stringify({
      id: permit.id,
      code: permit.code,
      type: permit.category,
      created: Date.now()
    });
  }

  private generateOwnerPassword(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private analyzeHazards(formData: PermitFormData): any {
    // Analyse des dangers selon le type de permis
    const hazards = [];
    
    if (formData.testsEtMesures.atmospherique) {
      hazards.push({
        type: 'Atmosphérique',
        level: formData.testsEtMesures.atmospherique.oxygene.conformeCNESST ? 'Faible' : 'Élevé',
        controls: ['Tests continus', 'Ventilation', 'Évacuation d\'urgence']
      });
    }

    return hazards;
  }

  private async generateGenericPDF(type: string, data: any): Promise<PDFGenerationResult> {
    // Implémentation générique pour autres types de documents
    try {
      const doc = await this.initializePDF();
      
      doc.content.push({
        type: 'header',
        data: { title: `Document ${type}`, date: new Date() }
      });
      
      doc.content.push({
        type: 'content',
        data: data
      });
      
      const blob = await this.finalizePDF(doc);
      
      return {
        success: true,
        blob,
        filename: `${type}_${Date.now()}.pdf`,
        size: blob.size,
        pages: 1,
        metadata: {
          title: `Document ${type}`,
          author: 'Système de Permis',
          subject: type,
          keywords: [type],
          creator: 'PDF Generator',
          producer: 'PDF Generator',
          creationDate: new Date(),
          modificationDate: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        filename: `${type}_error.pdf`,
        size: 0,
        pages: 0,
        metadata: {} as any,
        error: error instanceof Error ? error.message : 'Erreur génération PDF'
      };
    }
  }
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Crée une instance du générateur PDF avec options par défaut
 */
export function createPDFGenerator(options?: Partial<PDFOptions>): PDFGenerator {
  return new PDFGenerator(options);
}

/**
 * Génère rapidement un PDF de permis avec options minimales
 */
export async function generateQuickPermitPDF(
  permit: LegalPermit,
  formData: PermitFormData,
  language: 'fr' | 'en' = 'fr'
): Promise<PDFGenerationResult> {
  const generator = createPDFGenerator({
    language,
    template: 'standard',
    features: {
      qrCode: true,
      signatures: true,
      timestamps: true,
      watermark: false,
      attachments: false,
      barcode: false,
      encryption: false
    }
  });
  
  return generator.generatePermitPDF(permit, formData);
}

/**
 * Génère un PDF sécurisé avec mot de passe
 */
export async function generateSecurePDF(
  permit: LegalPermit,
  formData: PermitFormData,
  password: string,
  signatures?: ElectronicSignature[]
): Promise<PDFGenerationResult> {
  const generator = createPDFGenerator({
    security: {
      password,
      permissions: {
        print: true,
        copy: false,
        edit: false,
        annotate: false
      }
    },
    features: {
      qrCode: true,
      signatures: true,
      timestamps: true,
      watermark: true,
      attachments: false,
      barcode: true,
      encryption: true
    }
  });
  
  return generator.generatePermitPDF(permit, formData, signatures);
}

/**
 * Génère un PDF d'urgence avec template compact
 */
export async function generateEmergencyPDF(
  permit: LegalPermit,
  formData: PermitFormData
): Promise<PDFGenerationResult> {
  const generator = createPDFGenerator({
    template: 'emergency',
    orientation: 'portrait',
    features: {
      qrCode: true,
      signatures: false,
      timestamps: true,
      watermark: false,
      attachments: false,
      barcode: false,
      encryption: false
    },
    branding: {
      company: formData.identification.lieuTravail.fr,
      colors: {
        primary: '#dc2626',  // Rouge urgence
        secondary: '#991b1b',
        accent: '#fca5a5'
      }
    }
  });
  
  return generator.generatePermitPDF(permit, formData);
}

/**
 * Génère un PDF d'archive avec toutes les données
 */
export async function generateArchivePDF(
  permit: LegalPermit,
  formData: PermitFormData,
  signatures: ElectronicSignature[],
  atmosphericData: AtmosphericReading[],
  attachments?: string[]
): Promise<PDFGenerationResult> {
  const generator = createPDFGenerator({
    template: 'archive',
    orientation: 'portrait',
    language: 'both',
    features: {
      qrCode: true,
      signatures: true,
      timestamps: true,
      watermark: true,
      attachments: !!attachments?.length,
      barcode: true,
      encryption: false
    }
  });
  
  return generator.generatePermitPDF(permit, formData, signatures, atmosphericData);
}

// =================== EXPORT ===================

export {
  PDFGenerator,
  type PDFOptions,
  type PDFTemplate,
  type PDFSection,
  type PDFContent,
  type PDFGenerationResult
};
