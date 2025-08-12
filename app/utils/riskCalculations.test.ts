import { describe, it, expect } from 'vitest';
import {
  calculateRiskWithExposure,
  EXPOSURE_ADJUSTED_MATRIX,
  ExposureFrequency,
  ProbabilityLevel,
} from './riskCalculations';
import { SeverityLevel, RiskLevel } from '../types/index';

// Helper to map score to risk level as implemented in scoreToRiskLevel
function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 6) return RiskLevel.LOW;
  if (score <= 12) return RiskLevel.MEDIUM;
  if (score <= 18) return RiskLevel.HIGH;
  return RiskLevel.CRITICAL;
}

describe('calculateRiskWithExposure', () => {
  const severityLevels = [1, 2, 3, 4, 5] as const;
  const probabilityLevels = [
    ProbabilityLevel.VERY_LOW,
    ProbabilityLevel.LOW,
    ProbabilityLevel.MEDIUM,
    ProbabilityLevel.HIGH,
    ProbabilityLevel.VERY_HIGH,
  ];

  const exposureFrequencies = [
    ExposureFrequency.CONTINUOUS,
    ExposureFrequency.FREQUENT,
    ExposureFrequency.OCCASIONAL,
    ExposureFrequency.INFREQUENT,
    ExposureFrequency.RARE,
  ];

  exposureFrequencies.forEach((frequency) => {
    it(`matches exposure matrix for ${frequency}`, () => {
      probabilityLevels.forEach((prob, pIndex) => {
        severityLevels.forEach((sev, sIndex) => {
          const result = calculateRiskWithExposure(
            sev as unknown as SeverityLevel,
            prob,
            frequency,
            1
          );
          const expectedScore =
            EXPOSURE_ADJUSTED_MATRIX[frequency][pIndex][sIndex];
          expect(result.riskScore).toBe(expectedScore);
          expect(result.initialRisk).toBe(scoreToRiskLevel(expectedScore));
        });
      });
    });
  });
});

