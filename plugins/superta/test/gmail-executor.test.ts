import assert from 'node:assert/strict';
import { createMockGmailClient } from '../src/gmail/client.js';
import { draftFromReviewItem, forwardReviewThread, labelReviewThread, sendApprovedReviewItem } from '../src/gmail/executor.js';
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
    classification: classification(),
    evidence: [],
    draftSubject: 'Re: Question',
    draftBody: 'Draft body',
  });
}

export async function runGmailExecutorTests() {
  const client = createMockGmailClient();
  const pending = baseItem();

  const drafted = await draftFromReviewItem(client, pending);
  assert.equal(drafted.status, 'drafted');

  await assert.rejects(() => sendApprovedReviewItem(client, pending, ['student@example.edu']), /Only approved review items/);

  const approved = updateReviewStatus(pending, 'approved');
  const sent = await sendApprovedReviewItem(client, approved, ['student@example.edu']);
  assert.equal(sent.status, 'sent');

  const forwarded = await forwardReviewThread(client, pending, ['prof@example.edu'], 'Please review');
  assert.equal(forwarded.status, 'forwarded');

  const labeled = await labelReviewThread(client, pending, ['needs-review']);
  assert.equal(labeled.status, 'labeled');
  assert.deepEqual(labeled.labels, ['needs-review']);
}
