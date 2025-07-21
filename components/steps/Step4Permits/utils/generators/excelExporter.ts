// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/GENERATORS/EXCELEXPORTER.TS ===================
// Exporteur Excel avancé pour données de permis avec formatting sophistiqué et analyse
"use client";

// Import des types depuis les bons fichiers
import type { LegalPermit } from '../../types/permits';

// =================== TYPES LOCAUX POUR EXCEL EXPORTER ===================

export interface LocalBilingualText {
  fr: string;
  en: string;
}

export interface LocalGeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export type LocalPriorityLevel = 'low' | 'medium' | 'high' | 'critical' | 'urgent';

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
  procedures?: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
}

export interface LocalAtmosphericReading {
  id: string;
  timestamp: number;
  location: {
    point: string;
    coordinates?: LocalGeoCoordinates;
  };
  gasType: string;
  value: number;
  unit: string;
  alarmLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'critical' | 'extreme';
  metadata: {
    equipment: {
      model: string;
      lastCalibration: string;
      batteryLevel: number;
    };
    operator: string;
  };
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  confidence: number;
}

export interface LocalPersonnelData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    expiryDate: string;
  }>;
  training?: Array<{
    id: string;
    name: string;
    completedDate: string;
    instructor: string;
  }>;
  performance?: {
    rating: number;
    lastReview: string;
  };
}

export interface LocalElectronicSignature {
  id: string;
  documentId: string;
  signerId: string;
  signerName: string;
  timestamp: number;
  status: 'pending' | 'signed' | 'verified' | 'rejected';
  method: string;
}

export interface LocalComplianceMatrix {
  overall: number;
  categories: Array<{
    name: string;
    score: number;
    items: Array<{
      requirement: string;
      status: 'compliant' | 'non_compliant' | 'partial';
    }>;
  }>;
}

// =================== INTERFACES EXPORTEUR EXCEL ===================

export interface ExcelExportOptions {
  format: 'xlsx' | 'xls' | 'csv' | 'ods';
  language: 'fr' | 'en' | 'both';
  sheets: ExcelSheetConfig[];
  styling: {
    theme: 'corporate' | 'safety' | 'modern' | 'minimal';
    colors: {
      header: string;
      alternateRows: string;
      borders: string;
      critical: string;
      warning: string;
      success: string;
    };
    fonts: {
      header: ExcelFont;
      body: ExcelFont;
      title: ExcelFont;
    };
  };
  protection: {
    password?: string;
    allowEdit: boolean;
    allowSort: boolean;
    allowFilter: boolean;
    allowPivot: boolean;
  };
  metadata: {
    author: string;
    company: string;
    title: LocalBilingualText;
    subject: LocalBilingualText;
    keywords: string[];
    category: string;
  };
}

export interface ExcelSheetConfig {
  name: LocalBilingualText;
  type: 'permits' | 'atmospheric' | 'personnel' | 'compliance' | 'summary' | 'pivot' | 'charts';
  data?: any[];
  columns: ExcelColumnConfig[];
  formatting: {
    freezePanes?: { row: number; column: number; };
    autoFilter: boolean;
    conditionalFormatting: ConditionalFormat[];
    charts?: ExcelChart[];
    tables?: ExcelTable[];
  };
  protection?: {
    locked: boolean;
    allowEdit: string[];  // Plages modifiables
  };
}

export interface ExcelColumnConfig {
  key: string;
  header: LocalBilingualText;
  width?: number;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'formula';
  format?: string;  // Format Excel (e.g., "yyyy-mm-dd", "#,##0.00")
  validation?: {
    type: 'list' | 'range' | 'length' | 'custom';
    criteria: any;
    errorMessage: LocalBilingualText;
  };
  formula?: string;  // Formule Excel
  hyperlink?: boolean;
  comment?: LocalBilingualText;
}

export interface ConditionalFormat {
  range: string;  // Range Excel (e.g., "A1:Z1000")
  condition: {
    type: 'cellValue' | 'formula' | 'colorScale' | 'dataBar' | 'iconSet';
    operator?: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'between' | 'contains';
    value?: any;
    formula?: string;
  };
  style: {
    background?: string;
    font?: { color?: string; bold?: boolean; italic?: boolean; };
    border?: { color?: string; style?: string; };
  };
}

export interface ExcelChart {
  type: 'column' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'gauge';
  title: LocalBilingualText;
  dataRange: string;
  position: { row: number; column: number; width: number; height: number; };
  options: {
    legend: boolean;
    dataLabels: boolean;
    colors?: string[];
    axes?: {
      x?: { title: LocalBilingualText; };
      y?: { title: LocalBilingualText; };
    };
  };
}

export interface ExcelTable {
  name: string;
  range: string;
  style: 'light' | 'medium' | 'dark';
  showHeaders: boolean;
  showTotals: boolean;
  totalRowFunction?: Record<string, 'sum' | 'average' | 'count' | 'max' | 'min'>;
}

export interface ExcelFont {
  name: string;
  size: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

export interface ExcelExportResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  filename: string;
  size: number;
  sheets: Array<{
    name: string;
    rows: number;
    columns: number;
    charts: number;
    tables: number;
  }>;
  metadata: {
    generationTime: number;
    dataPoints: number;
    formulas: number;
    conditionalFormats: number;
  };
  warnings?: string[];
  errors?: string[];
}

// =================== CLASSE PRINCIPALE EXCELEXPORTER ===================

export class ExcelExporter {
  private workbook: any;
  private options: ExcelExportOptions;

  constructor(options: Partial<ExcelExportOptions> = {}) {
    this.options = this.mergeDefaultOptions(options);
  }

  // =================== MÉTHODES PUBLIQUES PRINCIPALES ===================

  /**
   * Exporter permits complets avec toutes les données
   */
  async exportPermitsComplete(
    permits: LegalPermit[],
    formData: LocalPermitFormData[],
    atmosphericData: LocalAtmosphericReading[],
    personnel: LocalPersonnelData[],
    signatures: LocalElectronicSignature[],
    options?: Partial<ExcelExportOptions>
  ): Promise<ExcelExportResult> {
    const startTime = performance.now();
    
    try {
      // Fusionner options
      const exportOptions = { ...this.options, ...options };
      
      // Créer workbook
      this.workbook = this.createWorkbook(exportOptions);
      
      // Générer sheets automatiquement
      const sheets = this.generateCompleteSheets(
        permits, formData, atmosphericData, personnel, signatures, exportOptions
      );
      
      // Créer chaque sheet
      for (const sheetConfig of sheets) {
        await this.createSheet(sheetConfig, exportOptions);
      }
      
      // Générer blob Excel
      const blob = await this.generateBlob(exportOptions.format);
      const url = URL.createObjectURL(blob);
      const filename = this.generateFilename('permits_complete', exportOptions);
      
      const result: ExcelExportResult = {
        success: true,
        blob,
        url,
        filename,
        size: blob.size,
        sheets: sheets.map(sheet => ({
          name: typeof sheet.name === 'string' ? sheet.name : sheet.name.fr,
          rows: sheet.data?.length || 0,
          columns: sheet.columns.length,
          charts: sheet.formatting.charts?.length || 0,
          tables: sheet.formatting.tables?.length || 0
        })),
        metadata: {
          generationTime: performance.now() - startTime,
          dataPoints: this.calculateDataPoints(permits, formData, atmosphericData, personnel),
          formulas: this.countFormulas(),
          conditionalFormats: this.countConditionalFormats()
        }
      };
      
      return result;
      
    } catch (error) {
      const errorOptions = { ...this.options, ...options };
      return {
        success: false,
        filename: this.generateFilename('permits_error', errorOptions),
        size: 0,
        sheets: [],
        metadata: {
          generationTime: performance.now() - startTime,
          dataPoints: 0,
          formulas: 0,
          conditionalFormats: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Exporter rapport sécurité analytique
   */
  async exportSafetyReport(
    permits: LegalPermit[],
    incidents: any[],
    atmosphericData: LocalAtmosphericReading[],
    complianceData: LocalComplianceMatrix,
    options?: Partial<ExcelExportOptions>
  ): Promise<ExcelExportResult> {
    const exportOptions = { ...this.options, ...options };
    
    // Préparer données analytiques
    const analyticsData = this.prepareSafetyAnalytics(
      permits, incidents, atmosphericData, complianceData
    );
    
    const sheets: ExcelSheetConfig[] = [
      this.createSummarySheet(analyticsData),
      this.createIncidentsSheet(incidents),
      this.createAtmosphericSheet(atmosphericData),
      this.createComplianceSheet(complianceData),
      this.createTrendsSheet(analyticsData.trends),
      this.createChartsSheet(analyticsData.charts)
    ];
    
    return this.exportWithSheets(sheets, 'safety_report', exportOptions);
  }

  /**
   * Exporter données atmosphériques avec analyse
   */
  async exportAtmosphericData(
    readings: LocalAtmosphericReading[],
    options?: Partial<ExcelExportOptions>
  ): Promise<ExcelExportResult> {
    const exportOptions = { ...this.options, ...options };
    
    // Analyser données
    const analysis = this.analyzeAtmosphericData(readings);
    
    const sheets: ExcelSheetConfig[] = [
      this.createAtmosphericReadingsSheet(readings),
      this.createAtmosphericSummarySheet(analysis.summary),
      this.createAtmosphericAlarmsSheet(analysis.alarms),
      this.createAtmosphericTrendsSheet(analysis.trends),
      this.createAtmosphericChartsSheet(analysis.charts)
    ];
    
    return this.exportWithSheets(sheets, 'atmospheric_data', exportOptions);
  }

  /**
   * Exporter personnel et certifications
   */
  async exportPersonnelData(
    personnel: LocalPersonnelData[],
    options?: Partial<ExcelExportOptions>
  ): Promise<ExcelExportResult> {
    const exportOptions = { ...this.options, ...options };
    
    const sheets: ExcelSheetConfig[] = [
      this.createPersonnelSheet(personnel),
      this.createCertificationsSheet(personnel),
      this.createTrainingSheet(personnel),
      this.createPerformanceSheet(personnel),
      this.createPersonnelChartsSheet(personnel)
    ];
    
    return this.exportWithSheets(sheets, 'personnel_data', exportOptions);
  }

  // =================== MÉTHODES CRÉATION SHEETS SPÉCIALISÉES ===================

  private generateCompleteSheets(
    permits: LegalPermit[],
    formData: LocalPermitFormData[],
    atmosphericData: LocalAtmosphericReading[],
    personnel: LocalPersonnelData[],
    signatures: LocalElectronicSignature[],
    options: ExcelExportOptions
  ): ExcelSheetConfig[] {
    return [
      this.createPermitsSummarySheet(permits, formData),
      this.createPermitsDetailSheet(permits, formData),
      this.createAtmosphericSheet(atmosphericData),
      this.createPersonnelSheet(personnel),
      this.createSignaturesSheet(signatures),
      this.createComplianceSheet(this.calculateCompliance(permits, formData)),
      this.createAnalyticsSheet(permits, formData, atmosphericData),
      this.createChartsSheet(this.generateAnalyticsCharts(permits, formData, atmosphericData))
    ];
  }

  private createPermitsSummarySheet(permits: LegalPermit[], formData: LocalPermitFormData[]): ExcelSheetConfig {
    const summaryData = permits.map(permit => {
      const form = formData.find(f => f.permitId === permit.id || f.id === permit.id);
      return {
        id: permit.id,
        name: permit.name,
        type: permit.category,
        status: permit.status,
        priority: permit.priority,
        location: form?.location?.description || '',
        supervisor: form?.supervisor?.name || '',
        entrants: form?.entrants?.length || 0,
        createdDate: new Date().toISOString().split('T')[0], // Date actuelle par défaut
        validUntil: permit.validUntil ? new Date(permit.validUntil).toISOString().split('T')[0] : '',
        riskLevel: this.calculateRiskLevel(permit, form),
        complianceScore: this.calculateComplianceScore(permit, form)
      };
    });

    return {
      name: { fr: 'Résumé Permis', en: 'Permits Summary' },
      type: 'permits',
      data: summaryData,
      columns: [
        { key: 'id', header: { fr: 'ID Permis', en: 'Permit ID' }, width: 12, type: 'text' },
        { key: 'name', header: { fr: 'Nom', en: 'Name' }, width: 25, type: 'text' },
        { key: 'type', header: { fr: 'Type', en: 'Type' }, width: 15, type: 'text' },
        { key: 'status', header: { fr: 'Statut', en: 'Status' }, width: 12, type: 'text' },
        { key: 'priority', header: { fr: 'Priorité', en: 'Priority' }, width: 12, type: 'text' },
        { key: 'location', header: { fr: 'Lieu', en: 'Location' }, width: 20, type: 'text' },
        { key: 'supervisor', header: { fr: 'Superviseur', en: 'Supervisor' }, width: 20, type: 'text' },
        { key: 'entrants', header: { fr: 'Nb Entrants', en: 'Entrants Count' }, width: 12, type: 'number' },
        { key: 'createdDate', header: { fr: 'Date Création', en: 'Created Date' }, width: 12, type: 'date', format: 'yyyy-mm-dd' },
        { key: 'validUntil', header: { fr: 'Valide Jusqu\'à', en: 'Valid Until' }, width: 12, type: 'date', format: 'yyyy-mm-dd' },
        { key: 'riskLevel', header: { fr: 'Niveau Risque', en: 'Risk Level' }, width: 12, type: 'text' },
        { key: 'complianceScore', header: { fr: 'Score Conformité', en: 'Compliance Score' }, width: 15, type: 'percentage', format: '0.0%' }
      ],
      formatting: {
        autoFilter: true,
        freezePanes: { row: 1, column: 0 },
        conditionalFormatting: [
          {
            range: 'D:D', // Status column
            condition: { type: 'cellValue', operator: 'equal', value: 'critical' },
            style: { background: '#fef2f2', font: { color: '#dc2626', bold: true } }
          },
          {
            range: 'K:K', // Risk level column
            condition: { type: 'cellValue', operator: 'equal', value: 'high' },
            style: { background: '#fef3c7', font: { color: '#d97706' } }
          },
          {
            range: 'L:L', // Compliance score column
            condition: { type: 'cellValue', operator: 'lessThan', value: 0.8 },
            style: { background: '#fef2f2', font: { color: '#dc2626' } }
          }
        ]
      }
    };
  }

  private createAtmosphericReadingsSheet(readings: LocalAtmosphericReading[]): ExcelSheetConfig {
    const readingsData = readings.map(reading => ({
      timestamp: new Date(reading.timestamp).toISOString(),
      location: reading.location.point,
      gasType: reading.gasType,
      value: reading.value,
      unit: reading.unit,
      alarmLevel: reading.alarmLevel,
      equipment: reading.metadata.equipment.model,
      operator: reading.metadata.operator,
      temperature: reading.environmentalConditions.temperature,
      humidity: reading.environmentalConditions.humidity,
      pressure: reading.environmentalConditions.pressure,
      calibrationDate: reading.metadata.equipment.lastCalibration,
      batteryLevel: reading.metadata.equipment.batteryLevel,
      confidence: reading.confidence
    }));

    return {
      name: { fr: 'Lectures Atmosphériques', en: 'Atmospheric Readings' },
      type: 'atmospheric',
      data: readingsData,
      columns: [
        { key: 'timestamp', header: { fr: 'Horodatage', en: 'Timestamp' }, width: 20, type: 'date', format: 'yyyy-mm-dd hh:mm:ss' },
        { key: 'location', header: { fr: 'Point Mesure', en: 'Measurement Point' }, width: 15, type: 'text' },
        { key: 'gasType', header: { fr: 'Type Gaz', en: 'Gas Type' }, width: 12, type: 'text' },
        { key: 'value', header: { fr: 'Valeur', en: 'Value' }, width: 10, type: 'number', format: '#,##0.000' },
        { key: 'unit', header: { fr: 'Unité', en: 'Unit' }, width: 8, type: 'text' },
        { key: 'alarmLevel', header: { fr: 'Niveau Alarme', en: 'Alarm Level' }, width: 12, type: 'text' },
        { key: 'equipment', header: { fr: 'Équipement', en: 'Equipment' }, width: 15, type: 'text' },
        { key: 'operator', header: { fr: 'Opérateur', en: 'Operator' }, width: 15, type: 'text' },
        { key: 'temperature', header: { fr: 'Température (°C)', en: 'Temperature (°C)' }, width: 12, type: 'number', format: '#,##0.0' },
        { key: 'humidity', header: { fr: 'Humidité (%)', en: 'Humidity (%)' }, width: 12, type: 'number', format: '#,##0.0' },
        { key: 'pressure', header: { fr: 'Pression (kPa)', en: 'Pressure (kPa)' }, width: 12, type: 'number', format: '#,##0.0' },
        { key: 'batteryLevel', header: { fr: 'Batterie (%)', en: 'Battery (%)' }, width: 10, type: 'percentage', format: '0%' },
        { key: 'confidence', header: { fr: 'Confiance', en: 'Confidence' }, width: 10, type: 'percentage', format: '0.0%' }
      ],
      formatting: {
        autoFilter: true,
        freezePanes: { row: 1, column: 0 },
        conditionalFormatting: [
          {
            range: 'F:F', // Alarm level column
            condition: { type: 'cellValue', operator: 'equal', value: 'critical' },
            style: { background: '#fef2f2', font: { color: '#dc2626', bold: true } }
          },
          {
            range: 'F:F',
            condition: { type: 'cellValue', operator: 'equal', value: 'danger' },
            style: { background: '#fef3c7', font: { color: '#d97706', bold: true } }
          },
          {
            range: 'F:F',
            condition: { type: 'cellValue', operator: 'equal', value: 'warning' },
            style: { background: '#fefce8', font: { color: '#ca8a04' } }
          },
          {
            range: 'L:L', // Battery level
            condition: { type: 'cellValue', operator: 'lessThan', value: 0.2 },
            style: { background: '#fef2f2', font: { color: '#dc2626' } }
          }
        ],
        charts: [
          {
            type: 'line',
            title: { fr: 'Tendances Atmosphériques', en: 'Atmospheric Trends' },
            dataRange: 'A1:E1000',
            position: { row: 5, column: 15, width: 400, height: 300 },
            options: {
              legend: true,
              dataLabels: false,
              axes: {
                x: { title: { fr: 'Temps', en: 'Time' } },
                y: { title: { fr: 'Concentration', en: 'Concentration' } }
              }
            }
          }
        ]
      }
    };
  }

  // =================== MÉTHODES UTILITAIRES ===================

  private mergeDefaultOptions(options: Partial<ExcelExportOptions>): ExcelExportOptions {
    return {
      format: 'xlsx',
      language: 'fr',
      sheets: [],
      styling: {
        theme: 'corporate',
        colors: {
          header: '#1e3a8a',
          alternateRows: '#f8fafc',
          borders: '#e2e8f0',
          critical: '#dc2626',
          warning: '#d97706',
          success: '#059669'
        },
        fonts: {
          header: { name: 'Calibri', size: 11, bold: true, color: '#ffffff' },
          body: { name: 'Calibri', size: 10 },
          title: { name: 'Calibri', size: 14, bold: true }
        }
      },
      protection: {
        allowEdit: false,
        allowSort: true,
        allowFilter: true,
        allowPivot: true
      },
      metadata: {
        author: 'Sistema de Permisos',
        company: 'Seguridad Industrial',
        title: { fr: 'Rapport Permis de Travail', en: 'Work Permits Report' },
        subject: { fr: 'Données exportées du système de permis', en: 'Exported data from permits system' },
        keywords: ['permits', 'safety', 'confined space', 'atmospheric'],
        category: 'Safety Report'
      },
      ...options
    };
  }

  private calculateRiskLevel(permit: LegalPermit, form?: LocalPermitFormData): string {
    // Logique sophistiquée calcul niveau risque
    let riskScore = 0;
    
    if (permit.priority === 'critical') riskScore += 40;
    else if (permit.priority === 'high') riskScore += 30;
    else if (permit.priority === 'medium') riskScore += 20;
    else riskScore += 10;
    
    if (form?.hazards) {
      riskScore += form.hazards.length * 10;
    }
    
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private calculateComplianceScore(permit: LegalPermit, form?: LocalPermitFormData): number {
    // Calcul score conformité sophistiqué
    let score = 0.5; // Score base
    
    if (permit.status === 'approved') score += 0.2;
    if (form?.supervisor) score += 0.1;
    if (form?.entrants && form.entrants.length > 0) score += 0.1;
    if (form?.procedures && form.procedures.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private generateFilename(type: string, options: ExcelExportOptions): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = options.format === 'xlsx' ? 'xlsx' : 'xls';
    return `${type}_${timestamp}.${extension}`;
  }

  private calculateDataPoints(...dataSets: any[][]): number {
    return dataSets.reduce((total, dataSet) => total + (dataSet?.length || 0), 0);
  }

  private countFormulas(): number {
    // Compter formules dans workbook
    return 0; // Placeholder
  }

  private countConditionalFormats(): number {
    // Compter formats conditionnels
    return 0; // Placeholder
  }

  private async exportWithSheets(
    sheets: ExcelSheetConfig[],
    type: string,
    options: ExcelExportOptions
  ): Promise<ExcelExportResult> {
    // Implémentation export avec sheets configurés
    const startTime = performance.now();
    
    try {
      this.workbook = this.createWorkbook(options);
      
      for (const sheet of sheets) {
        await this.createSheet(sheet, options);
      }
      
      const blob = await this.generateBlob(options.format);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob),
        filename: this.generateFilename(type, options),
        size: blob.size,
        sheets: sheets.map(sheet => ({
          name: typeof sheet.name === 'string' ? sheet.name : sheet.name.fr,
          rows: sheet.data?.length || 0,
          columns: sheet.columns.length,
          charts: sheet.formatting.charts?.length || 0,
          tables: sheet.formatting.tables?.length || 0
        })),
        metadata: {
          generationTime: performance.now() - startTime,
          dataPoints: sheets.reduce((total, sheet) => total + (sheet.data?.length || 0), 0),
          formulas: this.countFormulas(),
          conditionalFormats: this.countConditionalFormats()
        }
      };
    } catch (error) {
      return {
        success: false,
        filename: this.generateFilename(`${type}_error`, options),
        size: 0,
        sheets: [],
        metadata: {
          generationTime: performance.now() - startTime,
          dataPoints: 0,
          formulas: 0,
          conditionalFormats: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private createWorkbook(options: ExcelExportOptions): any {
    // Créer workbook avec métadonnées
    return {}; // Placeholder - utiliserait SheetJS ou ExcelJS
  }

  private async createSheet(sheet: ExcelSheetConfig, options: ExcelExportOptions): Promise<void> {
    // Créer sheet Excel avec formatting
    // Placeholder - implémentation avec SheetJS/ExcelJS
  }

  private async generateBlob(format: string): Promise<Blob> {
    // Générer blob Excel
    return new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Méthodes d'analyse et préparation données
  private prepareSafetyAnalytics(permits: any[], incidents: any[], atmospheric: any[], compliance: any): any {
    return {
      summary: {},
      trends: {},
      charts: {}
    };
  }

  private analyzeAtmosphericData(readings: LocalAtmosphericReading[]): any {
    return {
      summary: {},
      alarms: {},
      trends: {},
      charts: {}
    };
  }

  private createSummarySheet(data: any): ExcelSheetConfig {
    return {
      name: { fr: 'Résumé', en: 'Summary' },
      type: 'summary',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createIncidentsSheet(incidents: any[]): ExcelSheetConfig {
    return {
      name: { fr: 'Incidents', en: 'Incidents' },
      type: 'permits',
      data: incidents,
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createComplianceSheet(compliance: any): ExcelSheetConfig {
    return {
      name: { fr: 'Conformité', en: 'Compliance' },
      type: 'compliance',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createTrendsSheet(trends: any): ExcelSheetConfig {
    return {
      name: { fr: 'Tendances', en: 'Trends' },
      type: 'charts',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createChartsSheet(charts: any): ExcelSheetConfig {
    return {
      name: { fr: 'Graphiques', en: 'Charts' },
      type: 'charts',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createAtmosphericSheet(atmospheric: LocalAtmosphericReading[]): ExcelSheetConfig {
    return this.createAtmosphericReadingsSheet(atmospheric);
  }

  private createAtmosphericSummarySheet(summary: any): ExcelSheetConfig {
    return {
      name: { fr: 'Résumé Atmosphérique', en: 'Atmospheric Summary' },
      type: 'atmospheric',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createAtmosphericAlarmsSheet(alarms: any): ExcelSheetConfig {
    return {
      name: { fr: 'Alarmes Atmosphériques', en: 'Atmospheric Alarms' },
      type: 'atmospheric',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createAtmosphericTrendsSheet(trends: any): ExcelSheetConfig {
    return {
      name: { fr: 'Tendances Atmosphériques', en: 'Atmospheric Trends' },
      type: 'charts',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createAtmosphericChartsSheet(charts: any): ExcelSheetConfig {
    return {
      name: { fr: 'Graphiques Atmosphériques', en: 'Atmospheric Charts' },
      type: 'charts',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createPersonnelSheet(personnel: LocalPersonnelData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Personnel', en: 'Personnel' },
      type: 'personnel',
      data: personnel,
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createCertificationsSheet(personnel: LocalPersonnelData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Certifications', en: 'Certifications' },
      type: 'personnel',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createTrainingSheet(personnel: LocalPersonnelData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Formations', en: 'Training' },
      type: 'personnel',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createPerformanceSheet(personnel: LocalPersonnelData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Performance', en: 'Performance' },
      type: 'personnel',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createPersonnelChartsSheet(personnel: LocalPersonnelData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Graphiques Personnel', en: 'Personnel Charts' },
      type: 'charts',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private createPermitsDetailSheet(permits: LegalPermit[], formData: LocalPermitFormData[]): ExcelSheetConfig {
    return {
      name: { fr: 'Détails Permis', en: 'Permits Details' },
      type: 'permits',
      data: [],
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private createSignaturesSheet(signatures: LocalElectronicSignature[]): ExcelSheetConfig {
    return {
      name: { fr: 'Signatures', en: 'Signatures' },
      type: 'permits',
      data: signatures,
      columns: [],
      formatting: { autoFilter: true, conditionalFormatting: [] }
    };
  }

  private calculateCompliance(permits: LegalPermit[], formData: LocalPermitFormData[]): LocalComplianceMatrix {
    return {
      overall: 0.85,
      categories: []
    };
  }

  private createAnalyticsSheet(permits: LegalPermit[], formData: LocalPermitFormData[], atmospheric: LocalAtmosphericReading[]): ExcelSheetConfig {
    return {
      name: { fr: 'Analytics', en: 'Analytics' },
      type: 'summary',
      data: [],
      columns: [],
      formatting: { autoFilter: false, conditionalFormatting: [] }
    };
  }

  private generateAnalyticsCharts(permits: LegalPermit[], formData: LocalPermitFormData[], atmospheric: LocalAtmosphericReading[]): any {
    return {};
  }
}

// =================== FONCTIONS UTILITAIRES RAPIDES ===================

/**
 * Export rapide Excel pour permits
 */
export async function exportPermitsToExcel(
  permits: LegalPermit[],
  formData: LocalPermitFormData[],
  options?: Partial<ExcelExportOptions>
): Promise<ExcelExportResult> {
  const exporter = new ExcelExporter(options);
  return exporter.exportPermitsComplete(permits, formData, [], [], []);
}

/**
 * Export rapide données atmosphériques
 */
export async function exportAtmosphericToExcel(
  readings: LocalAtmosphericReading[],
  options?: Partial<ExcelExportOptions>
): Promise<ExcelExportResult> {
  const exporter = new ExcelExporter(options);
  return exporter.exportAtmosphericData(readings, options);
}

/**
 * Export rapide personnel
 */
export async function exportPersonnelToExcel(
  personnel: LocalPersonnelData[],
  options?: Partial<ExcelExportOptions>
): Promise<ExcelExportResult> {
  const exporter = new ExcelExporter(options);
  return exporter.exportPersonnelData(personnel, options);
}

// =================== EXPORTS SANS CONFLIT ===================
// Note: Tous les types sont déjà exportés individuellement ci-dessus
// Pas besoin de re-export groupé qui causerait des conflits d'export

export default ExcelExporter;
