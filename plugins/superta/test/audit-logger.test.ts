import assert from 'node:assert/strict';
import { logAudit } from '../src/audit/logger.js';
import type { Classification } from '../src/routing/classify.js';
import type { CourseRoute } from '../src/routing/course-resolver.js';

function route(): CourseRoute {
  return {
    professorId: 'prof-placeholder',
    courseId: 'cs101-sp26',
    termId: 'sp26',
    routeConfidence: 0.9,
    ambiguous: false,
  };
}

function classification(): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.9,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'test fixture',
  };
}

export function runAuditLoggerTests() {
  const logged = logAudit({
    threadId: 'thread-1',
    messageId: 'msg-1',
    courseId: 'cs101-sp26',
    route: route(),
    classification: classification(),
    evidence: [],
    outcome: 'queue',
    outcomeReason: 'Queued for review.',
  });

  assert.equal(logged.status, 'logged');
  assert.equal(logged.record.outcome, 'queue');
  assert.equal(logged.record.route.courseId, 'cs101-sp26');
  assert.ok(logged.record.loggedAt);
}
