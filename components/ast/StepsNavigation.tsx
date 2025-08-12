import React from 'react';
import clsx from 'clsx';

interface Step {
  id: number;
  titleKey: string;
  icon: React.ComponentType<any>;
  color: string;
  required: boolean;
}

interface StepsNavigationProps {
  isMobile: boolean;
  steps: Step[];
  currentStep: number;
  t: any;
  handleStepClick: (step: number) => void;
  getCurrentCompletedSteps: () => number;
  getCompletionPercentage: () => number;
}

const StepsNavigation: React.FC<StepsNavigationProps> = ({
  isMobile,
  steps,
  currentStep,
  t,
  handleStepClick,
  getCurrentCompletedSteps,
  getCompletionPercentage
}) => {
  if (isMobile) {
    return (
      <div className="p-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-600/20">
        <div className="grid grid-cols-3 gap-1 mb-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={clsx(
                'rounded-md p-2 text-center text-[9px] font-semibold transition-all flex flex-col items-center justify-center',
                currentStep === step.id
                  ? 'bg-blue-500/20 border border-blue-500'
                  : 'bg-slate-800/60 border border-slate-600/30'
              )}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                {getCurrentCompletedSteps() > step.id - 1 ? '✓' : <step.icon size={12} />}
              </div>
              <span className={clsx(currentStep === step.id ? 'text-white' : 'text-slate-200')}>{t.steps[step.titleKey]?.title}</span>
            </button>
          ))}
        </div>
        <div className="mt-2">
          <div className="w-full h-1 bg-slate-800 rounded">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <div className="text-center text-slate-400 text-[10px] mt-1">
            {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/6 • {Math.round(getCompletionPercentage())}% {t.completed}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect slide-in desktop-only p-6 mb-6 max-w-[1200px] mx-auto">
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white m-0">{t.progress}</h2>
          <span className="text-sm text-slate-400">{Math.round((currentStep / steps.length) * 100)}% {t.completed}</span>
        </div>
        <div className="bg-slate-900/50 rounded-lg h-2 overflow-hidden">
          <div
            className="h-full rounded-lg transition-all"
            style={{
              background: `linear-gradient(90deg, ${steps[0]?.color}, ${steps[Math.min(currentStep - 1, steps.length - 1)]?.color})`,
              width: `${(currentStep / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            className={clsx(
              'rounded-xl p-4 cursor-pointer text-center relative transition-all mobile-touch flex flex-col items-center justify-center min-h-[120px]',
              currentStep === step.id
                ? 'border-2'
                : 'border border-slate-400/20',
              currentStep === step.id ? '' : ''
            )}
            style={{
              background:
                currentStep === step.id
                  ? `linear-gradient(135deg, ${step.color}25, ${step.color}15)`
                  : 'rgba(30,41,59,0.5)',
              borderColor: currentStep === step.id ? step.color : undefined
            }}
          >
            {step.required && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />}
            <div
              className="w-10 h-10 mb-2 rounded-lg flex items-center justify-center"
              style={{ background: currentStep === step.id ? step.color : 'rgba(148,163,184,0.2)' }}
            >
              <step.icon size={20} color={currentStep === step.id ? '#fff' : '#94a3b8'} />
            </div>
            <h3 className={clsx('text-sm font-semibold m-0 mb-1', currentStep === step.id ? 'text-white' : 'text-slate-400')}>
              {t.steps[step.titleKey]?.title}
            </h3>
            <p className="text-[11px] text-slate-500 m-0">{t.steps[step.titleKey]?.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepsNavigation;
