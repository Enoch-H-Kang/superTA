import assert from 'node:assert/strict';
import { classifyMessage } from '../src/routing/classify.js';

export function runClassificationContractTests() {
  const result = classifyMessage();
  assert.equal(result.category, 'other');
  assert.equal(result.action, 'needs_more_info');
  assert.equal(result.confidence, 0);
  assert.equal(result.riskTier, 1);
  assert.deepEqual(result.requiredSources, []);
  assert.equal(result.shouldUpdateFaq, false);
  assert.equal(result.shouldNotifyProfessor, false);
  assert.match(result.reason, /No classifier implementation yet/);
}
