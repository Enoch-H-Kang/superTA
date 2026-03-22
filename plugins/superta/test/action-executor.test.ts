import assert from 'node:assert/strict';
import { executeReviewAction } from '../src/actions/action-executor.js';
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

function baseItem() {
  return createReviewQueueItem({
    id: 'rq-1',
    threadId: 'thread-1',
    messageId: 'msg-1',
    courseId: 'cs101-sp26',
    replyTo: ['student@example.edu'],
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
    classification: classification(),
    evidence: [],
    draftSubject: 'Re: Question',
    draftBody: 'Draft body',
  });
}

export function runActionExecutorTests() {
  const pending = baseItem();

  const createDraft = executeReviewAction(pending, { type: 'create_draft' });
  assert.equal(createDraft.ok, true);
  assert.equal(createDraft.sideEffect, 'draft');

  const approvePending = executeReviewAction(pending, { type: 'approve_draft' });
  assert.equal(approvePending.ok, true);
  assert.equal(approvePending.nextStatus, 'approved');
  assert.equal(approvePending.sideEffect, 'none');

  const sendPending = executeReviewAction(pending, { type: 'send_approved' });
  assert.equal(sendPending.ok, false);
  assert.equal(sendPending.sideEffect, 'none');

  const approved = updateReviewStatus(pending, 'approved');
  const sendApproved = executeReviewAction(approved, { type: 'send_approved' });
  assert.equal(sendApproved.ok, true);
  assert.equal(sendApproved.nextStatus, 'sent');
  assert.equal(sendApproved.sideEffect, 'send');

  const sent = updateReviewStatus(approved, 'sent');
  const escalateSent = executeReviewAction(sent, { type: 'mark_escalated' });
  assert.equal(escalateSent.ok, false);

  const rejectApproved = executeReviewAction(approved, { type: 'reject_draft' });
  assert.equal(rejectApproved.ok, true);
  assert.equal(rejectApproved.nextStatus, 'rejected');
}
