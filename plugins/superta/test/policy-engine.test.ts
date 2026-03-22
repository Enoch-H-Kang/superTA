import assert from 'node:assert/strict';
import { applyPolicy } from '../src/routing/policy-engine.js';
import type { CourseRoute } from '../src/routing/course-resolver.js';
import type { Classification } from '../src/routing/classify.js';
import type { EvidenceItem } from '../src/retrieval/build-evidence-bundle.js';

function baseRoute(): CourseRoute {
  return {
    professorId: 'prof-placeholder',
    courseId: 'cs101-sp26',
    termId: 'sp26',
    routeConfidence: 0.9,
    ambiguous: false,
  };
}

function classification(
  category: Classification['category'],
  action: Classification['action'] = 'draft_for_professor',
  overrides: Partial<Classification> = {},
): Classification {
  return {
    category,
    action,
    confidence: 0.9,
    riskTier: 1,
    requiredSources: [],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'test fixture',
    ...overrides,
  };
}

function evidence(types: EvidenceItem['type'][]): EvidenceItem[] {
  return types.map((type) => ({
    type,
    path: `/tmp/${type}`,
    snippet: `${type} evidence`,
  }));
}

export function runPolicyEngineTests() {
  const ambiguousRoute = { ...baseRoute(), ambiguous: true };
  const ambiguousResult = applyPolicy(ambiguousRoute, classification('logistics', 'draft_for_professor'));
  assert.equal(ambiguousResult.action, 'needs_more_info');
  assert.equal(ambiguousResult.shouldNotifyProfessor, true);

  const grade = applyPolicy(baseRoute(), classification('grade-related', 'draft_for_professor'));
  assert.equal(grade.action, 'escalate_now');
  assert.equal(grade.riskTier, 3);

  const accommodation = applyPolicy(baseRoute(), classification('accommodation-sensitive', 'draft_for_professor'));
  assert.equal(accommodation.action, 'escalate_now');

  const integrity = applyPolicy(baseRoute(), classification('integrity-sensitive', 'draft_for_professor'));
  assert.equal(integrity.action, 'escalate_now');

  const wellbeing = applyPolicy(baseRoute(), classification('wellbeing/safety', 'draft_for_professor'));
  assert.equal(wellbeing.action, 'escalate_now');

  const lowConfidence = applyPolicy(
    baseRoute(),
    classification('deadline', 'draft_for_professor', { confidence: 0.2, requiredSources: ['policy'] }),
    evidence(['policy']),
  );
  assert.equal(lowConfidence.action, 'needs_more_info');
  assert.equal(lowConfidence.shouldNotifyProfessor, true);

  const missingEvidence = applyPolicy(
    baseRoute(),
    classification('deadline', 'draft_for_professor', { requiredSources: ['policy', 'faq'] }),
    evidence(['policy']),
  );
  assert.equal(missingEvidence.action, 'needs_more_info');
  assert.match(missingEvidence.reason, /faq/);

  const routine = applyPolicy(
    baseRoute(),
    classification('deadline', 'draft_for_professor', { requiredSources: ['policy'] }),
    evidence(['policy']),
  );
  assert.equal(routine.action, 'draft_for_professor');
}
