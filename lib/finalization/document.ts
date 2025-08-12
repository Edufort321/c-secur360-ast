import { ASTData, ASTStatistics, ValidationSummary, ReportType, GeneratedReport } from './types';

export const generatePdfContent = (
  astData: ASTData,
  stats: ASTStatistics,
  sections: ValidationSummary[],
  language: 'fr' | 'en',
  reportType: ReportType
): string => {
  const title = language === 'en' ? 'Complete JSA Report' : 'Rapport AST Complet';
  return `<!DOCTYPE html><html lang="${language}"><head><meta charset="UTF-8" /></head><body><h1>${title} - ${astData.projectInfo.client}</h1></body></html>`;
};

export const createReportEntry = (
  astNumber: string,
  reportType: ReportType,
  url: string
): GeneratedReport => ({
  id: Date.now().toString(),
  type: reportType,
  url,
  generatedAt: new Date().toISOString(),
  fileSize: '2.5 MB',
  astNumber
});
