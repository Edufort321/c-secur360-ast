import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface Step {
  id: number;
  titleKey: string;
  icon: React.ComponentType<any>;
  color: string;
  required: boolean;
}

interface FooterProps {
  isMobile: boolean;
  currentStep: number;
  steps: Step[];
  t: any;
  handlePrevious: () => void;
  handleNext: () => void;
  canNavigateToNext: () => boolean;
  hasUnsavedChanges: boolean;
}

const Footer: React.FC<FooterProps> = ({
  isMobile,
  currentStep,
  steps,
  t,
  handlePrevious,
  handleNext,
  canNavigateToNext,
  hasUnsavedChanges
}) => {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-600/30 p-4 z-50">
        <div className="flex gap-3 max-w-[500px] mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold bg-slate-700 text-slate-300 disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            {t.previous}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length || !canNavigateToNext()}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{
              background:
                currentStep === steps.length || !canNavigateToNext()
                  ? 'rgba(100,116,139,0.3)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
            }}
          >
            {currentStep === steps.length ? t.finished : t.next}
            {currentStep !== steps.length && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect desktop-only p-6 flex justify-between items-center sticky bottom-4 gap-4 max-w-[1200px] mx-auto">
      <button
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="mobile-touch flex items-center gap-2 px-5 py-3 rounded-lg text-base font-medium"
        style={{
          background: currentStep === 1 ? 'rgba(75,85,99,0.3)' : 'rgba(59,130,246,0.2)',
          border: currentStep === 1 ? '1px solid rgba(75,85,99,0.5)' : '1px solid rgba(59,130,246,0.5)',
          color: currentStep === 1 ? '#9ca3af' : '#ffffff'
        }}
      >
        <ArrowLeft size={18} />
        {t.previous}
      </button>
      <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap justify-center">
        <div className="flex items-center gap-1">
          <Save size={14} />
          <span>{t.autoSave}</span>
        </div>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: hasUnsavedChanges ? '#f59e0b' : '#10b981',
            animation: hasUnsavedChanges ? 'pulse 2s infinite' : 'none'
          }}
        />
        <span className="text-xs" style={{ color: hasUnsavedChanges ? '#f59e0b' : '#10b981' }}>
          {hasUnsavedChanges ? t.saving : t.saved}
        </span>
      </div>
      <button
        onClick={handleNext}
        disabled={currentStep === steps.length}
        className="mobile-touch flex items-center gap-2 px-5 py-3 rounded-lg text-base font-medium text-white"
        style={{
          background:
            currentStep === steps.length
              ? 'rgba(75,85,99,0.3)'
              : `linear-gradient(135deg, ${steps[currentStep]?.color || '#10b981'}, ${steps[currentStep]?.color || '#059669'}CC)`,
          border: `1px solid ${steps[currentStep]?.color || '#10b981'}80`
        }}
      >
        {t.next}
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default Footer;
