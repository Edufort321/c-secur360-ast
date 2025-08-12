'use client';

import React from 'react';
import { Save, QrCode, Printer, Database, Copy, Check, Lock, Unlock, Zap } from 'lucide-react';
import type { ReportType, ViewType } from './Step6Finalization';

interface FinalizationActionsProps {
  t: any;
  language: 'fr' | 'en';
  isSaving: boolean;
  isGeneratingQR: boolean;
  isGeneratingPDF: boolean;
  copySuccess: boolean;
  isLocked: boolean;
  handleSaveToSupabase: () => void;
  handleGenerateQR: () => void;
  handleGeneratePDF: (type: ReportType) => void;
  setCurrentView: (view: ViewType) => void;
  handleCopyLink: () => void;
  setShowLockConfirm: (show: boolean) => void;
}

const FinalizationActions: React.FC<FinalizationActionsProps> = ({
  t,
  language,
  isSaving,
  isGeneratingQR,
  isGeneratingPDF,
  copySuccess,
  isLocked,
  handleSaveToSupabase,
  handleGenerateQR,
  handleGeneratePDF,
  setCurrentView,
  handleCopyLink,
  setShowLockConfirm,
}) => (
  <div className="ast-section">
    <h2 className="section-title">
      <Zap size={24} />
      {t.tabs.actions}
    </h2>
    <div className="buttons-grid">
      <button
        onClick={handleSaveToSupabase}
        disabled={isSaving}
        className={`ast-button button-success ${isSaving ? 'button-disabled' : ''}`}
      >
        {isSaving ? (
          <div
            className="spinning"
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%'
            }}
          />
        ) : (
          <Save size={20} />
        )}
        {isSaving ? t.saving : t.saveAST}
      </button>

      <button
        onClick={handleGenerateQR}
        disabled={isGeneratingQR}
        className={`ast-button button-primary ${isGeneratingQR ? 'button-disabled' : ''}`}
      >
        {isGeneratingQR ? (
          <div
            className="spinning"
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%'
            }}
          />
        ) : (
          <QrCode size={20} />
        )}
        {t.generateQR}
      </button>

      <button
        onClick={() => handleGeneratePDF('standard')}
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
              borderRadius: '50%'
            }}
          />
        ) : (
          <Printer size={20} />
        )}
        {t.printPDF}
      </button>

      <button
        onClick={() => setCurrentView('database')}
        className="ast-button button-secondary"
      >
        <Database size={20} />
        {t.searchDatabase}
      </button>

      <button
        onClick={handleCopyLink}
        className={`ast-button ${copySuccess ? 'button-success' : 'button-secondary'}`}
      >
        {copySuccess ? <Check size={20} /> : <Copy size={20} />}
        {copySuccess ? (language === 'fr' ? 'Copié!' : 'Copied!') : t.copy}
      </button>

      <button
        onClick={() => setShowLockConfirm(true)}
        disabled={isLocked}
        className={`ast-button ${isLocked ? 'button-disabled' : 'button-danger'}`}
      >
        {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        {isLocked ? t.locked : t.lockAST}
      </button>
    </div>
  </div>
);

export default FinalizationActions;
