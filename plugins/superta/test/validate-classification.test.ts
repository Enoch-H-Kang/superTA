import assert from 'node:assert/strict';
import { validateClassification } from '../src/classifier/validate-classification.js';

export function runValidateClassificationTests() {
  const valid = validateClassification({
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.91,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Valid classification.',
  });
  assert.equal(valid.category, 'deadline');

  assert.throws(
    () => validateClassification({
      category: 'not-real',
      action: 'draft_for_professor',
      confidence: 0.91,
      riskTier: 1,
      requiredSources: ['policy'],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: false,
      reason: 'Bad category.',
    }),
    /Invalid classification category/,
  );

  assert.throws(
    () => validateClassification({
      category: 'deadline',
      action: 'draft_for_professor',
      confidence: 0.91,
      riskTier: 1,
      requiredSources: ['bad-source'],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: false,
      reason: 'Bad source.',
    }),
    /Invalid required source/,
  );
}
