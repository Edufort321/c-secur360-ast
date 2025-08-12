import React, { useMemo } from 'react';
import Step1ProjectInfo from '@/components/steps/Step1ProjectInfo';
import Step2Equipment from '@/components/steps/Step2Equipment';
import Step3Hazards from '@/components/steps/Step3Hazards';
import Step4Permits from '@/components/steps/Step4Permits';
import Step5Validation from '@/components/steps/Step5Validation';
import Step6Finalization from '@/components/steps/Step6Finalization';
import { ASTFormData } from '@/types/astForm';

interface StepContentProps {
  currentStep: number;
  currentLanguage: 'fr' | 'en';
  tenant: string;
  stableHandlerRef: React.MutableRefObject<(section: string, data: any) => void>;
  stableFormDataRef: React.MutableRefObject<ASTFormData>;
}

const MemoizedStep1 = React.memo(Step1ProjectInfo);
const MemoizedStep2 = React.memo(Step2Equipment);
const MemoizedStep3 = React.memo(Step3Hazards);
const MemoizedStep4 = React.memo(Step4Permits);
const MemoizedStep5 = React.memo(Step5Validation);
const MemoizedStep6 = React.memo(Step6Finalization);

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  currentLanguage,
  tenant,
  stableHandlerRef,
  stableFormDataRef
}) => {
  const stepProps = useMemo(
    () => ({
      formData: stableFormDataRef.current,
      language: currentLanguage,
      tenant,
      errors: {},
      onDataChange: stableHandlerRef.current
    }),
    [currentLanguage, tenant, stableHandlerRef, stableFormDataRef]
  );

  switch (currentStep) {
    case 1:
      return <MemoizedStep1 {...stepProps} />;
    case 2:
      return <MemoizedStep2 {...stepProps} />;
    case 3:
      return <MemoizedStep3 {...stepProps} />;
    case 4:
      return (
        <MemoizedStep4
          {...stepProps}
          province={'QC'}
          userRole={'worker'}
          touchOptimized
          compactMode={false}
          onPermitChange={(permits) => {
            stableHandlerRef.current('permits', permits);
          }}
          initialPermits={[]}
        />
      );
    case 5:
      return <MemoizedStep5 {...(stepProps as any)} />;
    case 6:
      return <MemoizedStep6 {...(stepProps as any)} />;
    default:
      return null;
  }
};

export default React.memo(StepContent);
