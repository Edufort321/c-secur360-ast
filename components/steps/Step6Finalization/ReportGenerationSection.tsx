'use client';

import React from 'react';
import { BarChart3, FileText, Award, Cog, Smartphone, Clock, Eye, Download } from 'lucide-react';
import type { FinalizationData, DocumentGeneration, Translations, ReportType, ASTStatistics } from '../Step6Finalization';

interface ReportGenerationSectionProps {
  finalizationData: FinalizationData;
  t: Translations;
  language: 'fr' | 'en';
  isMobile: boolean;
  toggleDocumentOption: (key: keyof DocumentGeneration) => void;
  handleGeneratePDF: (type: ReportType) => void;
  isGeneratingPDF: boolean;
  stats: ASTStatistics;
}

const ReportGenerationSection: React.FC<ReportGenerationSectionProps> = ({
  finalizationData,
  t,
  language,
  isMobile,
  toggleDocumentOption,
  handleGeneratePDF,
  isGeneratingPDF,
  stats,
}) => (
  <>
    <div className="ast-section">
      <h2 className="section-title">
        <BarChart3 size={24} />
        {t.reportOptions}
      </h2>

      <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
        <h3
          style={{
            color: '#d1d5db',
            fontSize: isMobile ? '14px' : '16px',
            marginBottom: isMobile ? '12px' : '16px',
          }}
        >
          {language === 'fr' ? "Options d'inclusion:" : 'Inclusion options:'}
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: isMobile ? '8px' : '12px',
          }}
        >
          {Object.entries({
            includePhotos: t.includePhotos,
            includeSignatures: t.includeSignatures,
            includeQRCode: t.includeQRCode,
            includeBranding: t.includeBranding,
            includeTimestamps: t.includeTimestamps,
            includeComments: t.includeComments,
            includeStatistics: t.includeStatistics,
            includeValidation: t.includeValidation,
            includePermits: t.includePermits,
            includeHazards: t.includeHazards,
            includeEquipment: t.includeEquipment,
          }).map(([key, label]) => (
            <div
              key={key}
              className={`checkbox-field ${
                finalizationData.documentGeneration[key as keyof DocumentGeneration] ? 'checked' : ''
              }`}
              onClick={() => toggleDocumentOption(key as keyof DocumentGeneration)}
            >
              <input
                type="checkbox"
                checked={
                  finalizationData.documentGeneration[key as keyof DocumentGeneration] as boolean
                }
                onChange={() => toggleDocumentOption(key as keyof DocumentGeneration)}
                style={{ pointerEvents: 'none' }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="buttons-grid">
        <button
          onClick={() => handleGeneratePDF('standard')}
          disabled={isGeneratingPDF}
          className={`ast-button button-primary ${isGeneratingPDF ? 'button-disabled' : ''}`}
        >
          {isGeneratingPDF ? (
            <div
              className="spinning"
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
              }}
            />
          ) : (
            <FileText size={20} />
          )}
          {language === 'fr' ? 'Rapport Standard' : 'Standard Report'}
        </button>

        <button
          onClick={() => handleGeneratePDF('executive')}
          disabled={isGeneratingPDF}
          className={`ast-button button-warning ${isGeneratingPDF ? 'button-disabled' : ''}`}
        >
          {isGeneratingPDF ? (
            <div
              className="spinning"
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
              }}
            />
          ) : (
            <Award size={20} />
          )}
          {language === 'fr' ? 'Résumé Exécutif' : 'Executive Summary'}
        </button>

        <button
          onClick={() => handleGeneratePDF('technical')}
          disabled={isGeneratingPDF}
          className={`ast-button button-success ${isGeneratingPDF ? 'button-disabled' : ''}`}
        >
          {isGeneratingPDF ? (
            <div
              className="spinning"
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
              }}
            />
          ) : (
            <Cog size={20} />
          )}
          {language === 'fr' ? 'Rapport Technique' : 'Technical Report'}
        </button>

        <button
          onClick={() => handleGeneratePDF('compact')}
          disabled={isGeneratingPDF}
          className={`ast-button button-secondary ${isGeneratingPDF ? 'button-disabled' : ''}`}
        >
          <Smartphone size={20} />
          {language === 'fr' ? 'Version Compacte' : 'Compact Version'}
        </button>
      </div>

      <div
        style={{
          marginTop: isMobile ? '16px' : '20px',
          background: 'rgba(100, 116, 139, 0.1)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: isMobile ? '8px' : '12px',
          padding: isMobile ? '12px' : '16px',
        }}
      >
        <h4
          style={{
            margin: '0 0 8px 0',
            color: '#94a3b8',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '700',
          }}
        >
          📋 {language === 'fr' ? 'Aperçu du format sélectionné:' : 'Selected format preview:'}
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '8px' : '12px',
            fontSize: isMobile ? '11px' : '13px',
            color: '#d1d5db',
          }}
        >
          <div>📄 {language === 'fr' ? 'Pages estimées:' : 'Estimated pages:'} <strong>8-12</strong></div>
          <div>📊 {language === 'fr' ? 'Graphiques:' : 'Charts:'} <strong>{finalizationData.documentGeneration.includeStatistics ? '✅' : '❌'}</strong></div>
          <div>📷 {language === 'fr' ? 'Photos:' : 'Photos:'} <strong>{finalizationData.documentGeneration.includePhotos ? `✅ ${stats.photosCount}` : '❌'}</strong></div>
          <div>🔗 {language === 'fr' ? 'Code QR:' : 'QR Code:'} <strong>{finalizationData.documentGeneration.includeQRCode ? '✅' : '❌'}</strong></div>
        </div>
      </div>
    </div>

    <div className="ast-section">
      <h2 className="section-title">
        <Clock size={24} />
        {language === 'fr' ? '📋 Historique des Rapports' : '📋 Report History'}
      </h2>

      {finalizationData.generatedReports.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
          {finalizationData.generatedReports.map((report, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isMobile ? '10px' : '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: isMobile ? '6px' : '8px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '600',
                    color: '#60a5fa',
                    marginBottom: '2px',
                  }}
                >
                  📄 {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#9ca3af',
                  }}
                >
                  🕒 {new Date(report.generatedAt).toLocaleDateString()} {new Date(report.generatedAt).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px' }}>
                <button
                  onClick={() => window.open(report.url, '_blank')}
                  className="ast-button button-secondary"
                  style={{
                    padding: isMobile ? '6px 10px' : '8px 12px',
                    fontSize: isMobile ? '11px' : '12px',
                    minHeight: 'auto',
                  }}
                >
                  <Eye size={14} />
                  {language === 'fr' ? 'Voir' : 'View'}
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = report.url;
                    link.download = `AST-${stats.astNumber}-${report.type}-${new Date(report.generatedAt).toISOString().split('T')[0]}.pdf`;
                    link.click();
                  }}
                  className="ast-button button-primary"
                  style={{
                    padding: isMobile ? '6px 10px' : '8px 12px',
                    fontSize: isMobile ? '11px' : '12px',
                    minHeight: 'auto',
                  }}
                >
                  <Download size={14} />
                  {language === 'fr' ? 'Télécharger' : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: isMobile ? '24px' : '32px',
            color: '#9ca3af',
          }}
        >
          <FileText size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px' }}>
            {language === 'fr'
              ? "Aucun rapport généré pour le moment. Utilisez les boutons ci-dessus pour créer votre premier rapport."
              : 'No reports generated yet. Use the buttons above to create your first report.'}
          </p>
        </div>
      )}
    </div>
  </>
);

export default ReportGenerationSection;
