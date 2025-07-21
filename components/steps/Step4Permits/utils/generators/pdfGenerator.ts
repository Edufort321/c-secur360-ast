// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/GENERATORS/PDFGENERATOR.TS ===================
// Générateur PDF avancé pour permis de travail avec templates sophistiqués
"use client";

// Import des types depuis les bons fichiers
import type { LegalPermit } from '../../types/permits';

// =================== TYPES LOCAUX POUR PDF GENERATOR ===================

export interface LocalPermitFormData {
  permitId?: string;
  id?: string;
  supervisor?: {
    name: string;
    email: string;
    phone: string;
  };
  entrants?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  location?: {
    description: string;
    address: string;
  };
  hazards?: Array<{
    id: string;
    type: string;
    severity: string;
  }>;
}

export interface LocalAtmosphericReading {
  id: string;
  timestamp: number;
  gasType: string;
  value: number;
  unit: string;
  alarmLevel: string;
}

export interface LocalElectronicSignature {
  id: string;
  signerId: string;
  signerName: string;
  timestamp: number;
  status: string;
}

export interface LocalBilingualText {
  fr: string;
  en: string;
}

export interface LocalPersonnelData {
  id: string;
  name: string;
  role: string;
  certifications?: string[];
}

// =================== INTERFACES PDF GENERATOR ===================

export interface PDFTemplate {
  id: string;
  name: LocalBilingualText;
  type: 'permit' | 'report' | 'certificate' | 'form';
  layout: PDFLayout;
  sections: PDFSection[];
  styling: PDFStyling;
  watermark?: PDFWatermark;
  header?: PDFHeader;
  footer?: PDFFooter;
  metadata: PDFMetadata;
}

export interface PDFLayout {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  columns?: number;
  pageBreaks?: string[];
}

export interface PDFSection {
  id: string;
  type: 'header' | 'content' | 'table' | 'chart' | 'signature' | 'qr' | 'barcode';
  title?: LocalBilingualText;
  content: any;
  styling?: Partial<PDFStyling>;
  conditions?: PDFCondition[];
}

export interface PDFStyling {
  fonts: {
    default: string;
    header: string;
    monospace: string;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    border: string;
  };
  sizes: {
    title: number;
    header: number;
    body: number;
    small: number;
  };
}

export interface PDFCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  value: any;
}

export interface PDFWatermark {
  text: string;
  opacity: number;
  angle: number;
  fontSize: number;
  color: string;
}

export interface PDFHeader {
  height: number;
  content: any;
}

export interface PDFFooter {
  height: number;
  content: any;
}

export interface PDFMetadata {
  title: LocalBilingualText;
  author: string;
  subject: LocalBilingualText;
  keywords: string[];
  creator: string;
  producer: string;
}

export interface PDFGenerationOptions {
  template: string;
  language: 'fr' | 'en';
  includeSignatures: boolean;
  includeQRCode: boolean;
  password?: string;
  watermark?: PDFWatermark;
  customData?: Record<string, any>;
}

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  filename: string;
  pages: number;
  size: number;
  metadata: {
    generationTime: number;
    template: string;
    language: string;
    dataPoints: number;
  };
  errors?: string[];
  warnings?: string[];
}

// =================== CLASSE PRINCIPALE PDFGENERATOR ===================

export class PDFGenerator {
  private templates: Map<string, PDFTemplate> = new Map();
  private defaultStyling: PDFStyling;

  constructor() {
    this.defaultStyling = this.createDefaultStyling();
    this.initializeStandardTemplates();
  }

  // =================== MÉTHODES PUBLIQUES PRINCIPALES ===================

  /**
   * Générer PDF permit complet
   */
  async generatePermitPDF(
    permit: LegalPermit,
    formData: LocalPermitFormData,
    atmosphericData: LocalAtmosphericReading[],
    signatures: LocalElectronicSignature[],
    options: PDFGenerationOptions
  ): Promise<PDFGenerationResult> {
    const startTime = performance.now();
    
    try {
      const template = this.getTemplate(options.template);
      if (!template) {
        throw new Error(`Template not found: ${options.template}`);
      }

      const data = this.preparePermitData(permit, formData, atmosphericData, signatures);
      const document = this.buildDocument(template, data, options);
      const blob = await this.generatePDFBlob(document);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob),
        filename: this.generateFilename('permit', permit.id, options),
        pages: this.countPages(document),
        size: blob.size,
        metadata: {
          generationTime: performance.now() - startTime,
          template: options.template,
          language: options.language,
          dataPoints: this.countDataPoints(data)
        }
      };
    } catch (error) {
      return {
        success: false,
        filename: `permit_error_${Date.now()}.pdf`,
        pages: 0,
        size: 0,
        metadata: {
          generationTime: performance.now() - startTime,
          template: options.template,
          language: options.language,
          dataPoints: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Générer rapport sécurité PDF
   */
  async generateSafetyReportPDF(
    permits: LegalPermit[],
    incidents: any[],
    personnel: LocalPersonnelData[],
    options: PDFGenerationOptions
  ): Promise<PDFGenerationResult> {
    const data = this.prepareSafetyReportData(permits, incidents, personnel);
    return this.generateFromTemplate('safety_report', data, options);
  }

  /**
   * Générer certificat PDF
   */
  async generateCertificatePDF(
    personnel: LocalPersonnelData,
    certification: any,
    options: PDFGenerationOptions
  ): Promise<PDFGenerationResult> {
    const data = this.prepareCertificateData(personnel, certification);
    return this.generateFromTemplate('certificate', data, options);
  }

  // =================== MÉTHODES TEMPLATE ===================

  createTemplate(template: Omit<PDFTemplate, 'metadata'>): PDFTemplate {
    const fullTemplate: PDFTemplate = {
      ...template,
      metadata: {
        title: { fr: 'Document PDF', en: 'PDF Document' },
        author: 'System',
        subject: { fr: 'Document généré automatiquement', en: 'Auto-generated document' },
        keywords: [],
        creator: 'PDF Generator',
        producer: 'C-Secur360 AST'
      }
    };

    this.templates.set(template.id, fullTemplate);
    return fullTemplate;
  }

  getTemplate(id: string): PDFTemplate | undefined {
    return this.templates.get(id);
  }

  // =================== MÉTHODES PRIVÉES ===================

  private async generateFromTemplate(
    templateId: string,
    data: any,
    options: PDFGenerationOptions
  ): Promise<PDFGenerationResult> {
    const startTime = performance.now();
    
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const document = this.buildDocument(template, data, options);
      const blob = await this.generatePDFBlob(document);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob),
        filename: this.generateFilename(templateId, 'generated', options),
        pages: this.countPages(document),
        size: blob.size,
        metadata: {
          generationTime: performance.now() - startTime,
          template: templateId,
          language: options.language,
          dataPoints: this.countDataPoints(data)
        }
      };
    } catch (error) {
      return {
        success: false,
        filename: `${templateId}_error_${Date.now()}.pdf`,
        pages: 0,
        size: 0,
        metadata: {
          generationTime: performance.now() - startTime,
          template: templateId,
          language: options.language,
          dataPoints: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private preparePermitData(
    permit: LegalPermit,
    formData: LocalPermitFormData,
    atmospheric: LocalAtmosphericReading[],
    signatures: LocalElectronicSignature[]
  ): any {
    return {
      permit: {
        id: permit.id,
        name: permit.name,
        type: permit.category,
        status: permit.status,
        priority: permit.priority
      },
      supervisor: formData.supervisor?.name || '',
      location: formData.location?.description || '',
      entrants: formData.entrants?.length || 0,
      atmospheric: atmospheric.map(reading => ({
        timestamp: new Date(reading.timestamp).toLocaleString(),
        gasType: reading.gasType,
        value: reading.value,
        unit: reading.unit,
        level: reading.alarmLevel
      })),
      signatures: signatures.map(sig => ({
        signer: sig.signerName,
        timestamp: new Date(sig.timestamp).toLocaleString(),
        status: sig.status
      }))
    };
  }

  private prepareSafetyReportData(
    permits: LegalPermit[],
    incidents: any[],
    personnel: LocalPersonnelData[]
  ): any {
    return {
      permits: permits.length,
      incidents: incidents.length,
      personnel: personnel.length,
      summary: {
        totalPermits: permits.length,
        activePermits: permits.filter(p => p.status === 'approved').length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical').length
      }
    };
  }

  private prepareCertificateData(
    personnel: LocalPersonnelData,
    certification: any
  ): any {
    return {
      recipient: personnel.name,
      role: personnel.role,
      certification: certification.name || 'Safety Certification',
      issueDate: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
  }

  private buildDocument(template: PDFTemplate, data: any, options: PDFGenerationOptions): any {
    // Construction du document PDF basé sur le template
    const document: any = {
      pageSize: template.layout.pageSize,
      pageOrientation: template.layout.orientation,
      pageMargins: [
        template.layout.margins.left,
        template.layout.margins.top,
        template.layout.margins.right,
        template.layout.margins.bottom
      ],
      content: this.buildContent(template.sections, data, options),
      styles: this.buildStyles(template.styling),
      defaultStyle: {
        font: template.styling.fonts.default,
        fontSize: template.styling.sizes.body
      }
    };

    if (options.watermark) {
      document.watermark = options.watermark;
    }

    return document;
  }

  private buildContent(sections: PDFSection[], data: any, options: PDFGenerationOptions): any[] {
    const content = [];

    for (const section of sections) {
      if (this.shouldIncludeSection(section, data)) {
        const sectionContent = this.buildSectionContent(section, data, options);
        if (sectionContent) {
          content.push(sectionContent);
        }
      }
    }

    return content;
  }

  private shouldIncludeSection(section: PDFSection, data: any): boolean {
    if (!section.conditions) return true;

    return section.conditions.every(condition => {
      const value = this.getDataValue(data, condition.field);
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'contains':
          return String(value).includes(condition.value);
        case 'exists':
          return value !== undefined && value !== null;
        default:
          return true;
      }
    });
  }

  private buildSectionContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    switch (section.type) {
      case 'header':
        return this.buildHeaderContent(section, data, options);
      case 'content':
        return this.buildTextContent(section, data, options);
      case 'table':
        return this.buildTableContent(section, data, options);
      case 'signature':
        return this.buildSignatureContent(section, data, options);
      case 'qr':
        return this.buildQRContent(section, data, options);
      default:
        return null;
    }
  }

  private buildHeaderContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    const title = section.title?.[options.language] || 'Header';
    return {
      text: this.processTemplate(title, data),
      style: 'header',
      margin: [0, 0, 0, 20]
    };
  }

  private buildTextContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    return {
      text: this.processTemplate(section.content, data),
      style: 'body',
      margin: [0, 0, 0, 10]
    };
  }

  private buildTableContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    return {
      table: {
        headerRows: 1,
        body: this.processTableData(section.content, data)
      },
      margin: [0, 0, 0, 15]
    };
  }

  private buildSignatureContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    if (!options.includeSignatures) return null;

    return {
      columns: [
        { text: 'Signature:', style: 'label' },
        { text: '_'.repeat(30), style: 'signature' },
        { text: 'Date:', style: 'label' },
        { text: '_'.repeat(15), style: 'signature' }
      ],
      margin: [0, 20, 0, 0]
    };
  }

  private buildQRContent(section: PDFSection, data: any, options: PDFGenerationOptions): any {
    if (!options.includeQRCode) return null;

    return {
      qr: data.permit?.id || 'PERMIT_ID',
      fit: 100,
      margin: [0, 10, 0, 10]
    };
  }

  private buildStyles(styling: PDFStyling): any {
    return {
      header: {
        fontSize: styling.sizes.header,
        bold: true,
        color: styling.colors.primary
      },
      body: {
        fontSize: styling.sizes.body,
        color: styling.colors.text
      },
      label: {
        fontSize: styling.sizes.small,
        bold: true
      },
      signature: {
        fontSize: styling.sizes.body,
        decoration: 'underline'
      }
    };
  }

  private processTemplate(template: string, data: any): string {
    return String(template).replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getDataValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  private processTableData(tableConfig: any, data: any): any[][] {
    // Placeholder pour traitement données table
    return [['Header 1', 'Header 2'], ['Data 1', 'Data 2']];
  }

  private getDataValue(data: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private async generatePDFBlob(document: any): Promise<Blob> {
    // Placeholder pour génération PDF réelle avec pdfmake
    return new Blob([], { type: 'application/pdf' });
  }

  private countPages(document: any): number {
    // Placeholder pour compter pages
    return 1;
  }

  private countDataPoints(data: any): number {
    return JSON.stringify(data).length;
  }

  private generateFilename(type: string, id: string, options: PDFGenerationOptions): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${type}_${id}_${timestamp}_${options.language}.pdf`;
  }

  private createDefaultStyling(): PDFStyling {
    return {
      fonts: {
        default: 'Helvetica',
        header: 'Helvetica-Bold',
        monospace: 'Courier'
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#64748b',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e2e8f0'
      },
      sizes: {
        title: 18,
        header: 14,
        body: 10,
        small: 8
      }
    };
  }

  private initializeStandardTemplates(): void {
    // Template permit standard
    this.createTemplate({
      id: 'standard_permit',
      name: { fr: 'Permis Standard', en: 'Standard Permit' },
      type: 'permit',
      layout: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: { fr: 'PERMIS DE TRAVAIL', en: 'WORK PERMIT' },
          content: ''
        },
        {
          id: 'permit_info',
          type: 'content',
          content: 'Permit ID: {{permit.id}}\nType: {{permit.type}}\nStatus: {{permit.status}}'
        },
        {
          id: 'signatures',
          type: 'signature',
          content: {}
        }
      ],
      styling: this.defaultStyling
    });

    // Template rapport sécurité
    this.createTemplate({
      id: 'safety_report',
      name: { fr: 'Rapport de Sécurité', en: 'Safety Report' },
      type: 'report',
      layout: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: { fr: 'RAPPORT DE SÉCURITÉ', en: 'SAFETY REPORT' },
          content: ''
        },
        {
          id: 'summary',
          type: 'content',
          content: 'Total Permits: {{permits}}\nIncidents: {{incidents}}\nPersonnel: {{personnel}}'
        }
      ],
      styling: this.defaultStyling
    });

    // Template certificat
    this.createTemplate({
      id: 'certificate',
      name: { fr: 'Certificat', en: 'Certificate' },
      type: 'certificate',
      layout: {
        pageSize: 'A4',
        orientation: 'landscape',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
      },
      sections: [
        {
          id: 'header',
          type: 'header',
          title: { fr: 'CERTIFICAT DE FORMATION', en: 'TRAINING CERTIFICATE' },
          content: ''
        },
        {
          id: 'recipient',
          type: 'content',
          content: 'This certifies that {{recipient}} has completed {{certification}}'
        }
      ],
      styling: this.defaultStyling
    });
  }
}

// =================== FONCTIONS UTILITAIRES ===================

export async function generateQuickPermitPDF(
  permit: LegalPermit,
  options?: Partial<PDFGenerationOptions>
): Promise<PDFGenerationResult> {
  const generator = new PDFGenerator();
  const defaultOptions: PDFGenerationOptions = {
    template: 'standard_permit',
    language: 'fr',
    includeSignatures: true,
    includeQRCode: true,
    ...options
  };

  return generator.generatePermitPDF(permit, {}, [], [], defaultOptions);
}

export async function generateQuickSafetyReport(
  permits: LegalPermit[],
  options?: Partial<PDFGenerationOptions>
): Promise<PDFGenerationResult> {
  const generator = new PDFGenerator();
  const defaultOptions: PDFGenerationOptions = {
    template: 'safety_report',
    language: 'fr',
    includeSignatures: false,
    includeQRCode: false,
    ...options
  };

  return generator.generateSafetyReportPDF(permits, [], [], defaultOptions);
}

// =================== EXPORTS SANS CONFLIT ===================
export default PDFGenerator;
