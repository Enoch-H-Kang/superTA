import assert from 'node:assert/strict';
import { createReviewQueueItem, updateReviewStatus } from '../src/actions/review-queue.js';
import type { Classification } from '../src/routing/classify.js';

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

export function runReviewQueueTests() {
  const item = createReviewQueueItem({
    id: 'rq-1',
    threadId: 'thread-1',
    messageId: 'msg-1',
    courseId: 'cs101-sp26',
    classification: classification(),
    evidence: [],
    draftSubject: 'Re: Question',
    draftBody: 'Draft body',
  });

  assert.equal(item.status, 'pending');
  assert.equal(item.courseId, 'cs101-sp26');

  const approved = updateReviewStatus(item, 'approved');
  assert.equal(approved.status, 'approved');
  assert.equal(item.status, 'pending');
}
