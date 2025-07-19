// components/steps/Step4Permits/utils/generators/index.ts - SANS EXPORTS EN DOUBLE

// =================== EXPORTS COMMENTÉS POUR ÉVITER LES CONFLITS ===================

// Ne pas exporter directement les fichiers existants qui ont des exports en double
// export * from './emailTemplates';
// export * from './excelExporter';
// export * from './pdfGenerator';
// export * from './qrGenerator';
// export * from './reportGenerator';

// =================== INTERFACES POUR USEPERMITS ===================

// Interface pour les options de génération PDF
export interface PDFGenerationOptions {
  language: 'fr' | 'en';
  includeQRCode?: boolean;
  mobileOptimized?: boolean;
  includePhotos?: boolean;
  includeSignatures?: boolean;
}

// Interface pour les options d'export
export interface ExportOptions {
  format: 'pdf' | 'json' | 'excel';
  includeAttachments?: boolean;
  compressImages?: boolean;
  mobileShare?: boolean;
  emailIntegration?: boolean;
}

// Interface pour le résultat de génération PDF
export interface PDFGenerationResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  fileName?: string;
}

// Interface pour le résultat d'export
export interface ExportResult {
  success: boolean;
  exportUrl?: string;
  fileName?: string;
  mobileShareData?: {
    title: string;
    text: string;
    url?: string;
    files?: File[];
  };
  error?: string;
}

// =================== FONCTIONS POUR USEPERMITS ===================

// Fonction generatePermitPDF pour usePermits
export const generatePermitPDF = async (
  permit: any, 
  formData: any, 
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> => {
  try {
    // Simulation de génération PDF
    // TODO: Implémenter avec vraie génération PDF
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simule traitement
    
    const fileName = `${permit.name || 'Permis'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Simuler URL de téléchargement
    const downloadUrl = `/api/permits/${permit.id}/pdf?lang=${options.language}`;
    
    return {
      success: true,
      downloadUrl,
      fileName
    };
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    return {
      success: false,
      error: 'Échec de la génération PDF'
    };
  }
};

// Fonction exportPermitData pour usePermits
export const exportPermitData = async (
  permit: any, 
  formData: any, 
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    // Simulation d'export
    // TODO: Implémenter avec vrai export
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simule traitement
    
    const fileName = `${permit.name || 'Permis'}_export_${new Date().toISOString().split('T')[0]}.${options.format}`;
    const exportUrl = `/api/permits/${permit.id}/export?format=${options.format}`;
    
    // Données pour partage mobile si demandé
    let mobileShareData = undefined;
    if (options.mobileShare) {
      mobileShareData = {
        title: `Permis: ${permit.name}`,
        text: `Export du permis ${permit.name} en format ${options.format}`,
        url: exportUrl
      };
    }
    
    return {
      success: true,
      exportUrl,
      fileName,
      mobileShareData
    };
    
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      error: 'Échec de l\'export'
    };
  }
};

// Fonction generateQRCode simple
export const generateQRCode = async (
  data: string, 
  options: { size?: number; format?: 'png' | 'svg' } = {}
): Promise<string> => {
  try {
    const { size = 200, format = 'png' } = options;
    
    // Service externe pour QR codes
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=${format}`;
    
  } catch (error) {
    console.error('QR generation failed:', error);
    throw new Error('Échec de la génération QR');
  }
};

// Fonction generatePermitReport simple
export const generatePermitReport = async (
  permits: any[], 
  options: {
    format: 'pdf' | 'excel';
    dateRange?: { start: Date; end: Date };
    includeCharts?: boolean;
    language?: 'fr' | 'en';
  }
): Promise<ExportResult> => {
  try {
    // Simulation de génération de rapport
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileName = `Rapport_Permis_${new Date().toISOString().split('T')[0]}.${options.format}`;
    const exportUrl = `/api/reports/permits?format=${options.format}`;
    
    return {
      success: true,
      exportUrl,
      fileName
    };
    
  } catch (error) {
    console.error('Report generation failed:', error);
    return {
      success: false,
      error: 'Échec de la génération du rapport'
    };
  }
};

// =================== UTILITAIRES ===================
export const formatPermitData = (permit: any, formData: any) => {
  return {
    ...permit,
    formData,
    exportTimestamp: new Date().toISOString(),
    version: '1.0'
  };
};

export const generateShareableLink = (permitId: string, expiresIn: number = 24): string => {
  const expirationTime = Date.now() + (expiresIn * 60 * 60 * 1000);
  const token = btoa(`${permitId}:${expirationTime}`);
  return `/shared/permit/${permitId}?token=${token}`;
};

// =================== EXPORTS PAR DÉFAUT ===================
export default {
  generatePermitPDF,
  exportPermitData,
  generateQRCode,
  generatePermitReport,
  formatPermitData,
  generateShareableLink
};
