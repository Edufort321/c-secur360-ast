import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  titleKey: string;
  icon: any;
  color: string;
  required?: boolean;
}

interface StepsNavProps {
  isMobile: boolean;
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleStepClick: (step: number) => void;
  getCompletionPercentage: () => number;
  getCurrentCompletedSteps: () => number;
  t: any;
}

const StepsNav: React.FC<StepsNavProps> = ({
  isMobile,
  steps,
  currentStep,
  setCurrentStep,
  handleStepClick,
  getCompletionPercentage,
  getCurrentCompletedSteps,
  t,
}) => {
  if (isMobile) {
    return (
      <div className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-700/20 overflow-x-auto w-full">
        <div className="flex gap-2 w-full">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-md cursor-pointer min-w-[80px] ${
                currentStep === step.id
                  ? 'bg-blue-600/20 border border-blue-500'
                  : 'bg-slate-700/50 border border-slate-600/30'
              }`}
            >
              <div
                className={`w-6 h-6 mb-1 rounded-full flex items-center justify-center text-xs ${
                  currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-blue-600/30 text-blue-300'
                }`}
              >
                {getCurrentCompletedSteps() > step.id - 1 ? (
                  <Check size={12} />
                ) : (
                  <step.icon size={12} />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold text-center ${
                  currentStep === step.id ? 'text-white' : 'text-slate-200'
                }`}
              >
                {(t.steps as any)[step.titleKey]?.title}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 w-full">
          <div className="w-full h-1.5 bg-slate-800 rounded">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-1">
            {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/6 •
            {Math.round(getCompletionPercentage())}% {t.completed}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect slide-in desktop-only p-6 mb-6 w-full max-w-screen-lg mx-auto">
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white m-0">{t.progress}</h2>
          <span className="text-sm text-slate-400">{Math.round((currentStep / steps.length) * 100)}% {t.completed}</span>
        </div>
        <div className="bg-slate-900/50 rounded h-2 overflow-hidden">
          <div
            className="h-full rounded bg-gradient-to-r from-blue-500 to-green-500 transition-all"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 w-full">
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`flex-1 min-w-[140px] flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${
              currentStep === step.id
                ? `border-2` : 'border'
            }`}
            style={{
              borderColor:
                currentStep === step.id ? step.color : 'rgba(148,163,184,0.2)',
              background:
                currentStep === step.id
                  ? `linear-gradient(135deg, ${step.color}40, ${step.color}20)`
                  : 'rgba(30,41,59,0.5)',
            }}
          >
            {step.required && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
            <div
              className="w-10 h-10 mb-2 rounded-lg flex items-center justify-center"
              style={{
                background: currentStep === step.id ? step.color : 'rgba(148,163,184,0.2)',
              }}
            >
              <step.icon size={20} color={currentStep === step.id ? '#ffffff' : '#94a3b8'} />
            </div>
            <h3
              className={`text-sm font-semibold mb-1 ${
                currentStep === step.id ? 'text-white' : 'text-slate-400'
              }`}
            >
              {(t.steps as any)[step.titleKey]?.title}
            </h3>
            <p className="text-xs text-slate-500 m-0 text-center">
              {(t.steps as any)[step.titleKey]?.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsNav;

