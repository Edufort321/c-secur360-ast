import assert from 'node:assert/strict';
import { checkTriggerConditions, TriggerCondition } from '../app/utils/documentGeneration';
import { RiskLevel } from '../app/types';

const conditions: TriggerCondition[] = [
  { field: 'riskLevel', operator: 'in', value: [RiskLevel.HIGH, RiskLevel.CRITICAL] }
];

assert.strictEqual(checkTriggerConditions(conditions, { riskLevel: RiskLevel.HIGH }), true);
assert.strictEqual(checkTriggerConditions(conditions, { riskLevel: RiskLevel.CRITICAL }), true);
assert.strictEqual(checkTriggerConditions(conditions, { riskLevel: RiskLevel.LOW }), false);

console.log('checkTriggerConditions tests passed');
