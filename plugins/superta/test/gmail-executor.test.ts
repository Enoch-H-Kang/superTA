import assert from 'node:assert/strict';
import { createMockGmailClient } from '../src/gmail/client.js';
import { draftFromReviewItem, forwardReviewThread, labelReviewThread } from '../src/gmail/executor.js';
import { createReviewQueueItem } from '../src/actions/review-queue.js';
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
    replyTo: ['student@example.edu', 'Prof <prof@example.edu>'],
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id', 'older-message-id'],
    classification: classification(),
    evidence: [],
    draftSubject: 'Re: Question',
    draftBody: 'Draft body',
      draftSummary: 'Draft summary',
  });
}

export async function runGmailExecutorTests() {
  const originalAccountEmail = process.env.GMAIL_ACCOUNT_EMAIL;
  process.env.GMAIL_ACCOUNT_EMAIL = 'prof@example.edu';

  const client = createMockGmailClient();
  const pending = baseItem();

  const drafted = await draftFromReviewItem(client, pending);
  assert.equal(drafted.status, 'drafted');

  const forwarded = await forwardReviewThread(client, pending, ['prof@example.edu'], 'Please review');
  assert.equal(forwarded.status, 'forwarded');

  const labeled = await labelReviewThread(client, pending, ['needs-review']);
  assert.equal(labeled.status, 'labeled');
  assert.deepEqual(labeled.labels, ['needs-review']);

  if (originalAccountEmail === undefined) {
    delete process.env.GMAIL_ACCOUNT_EMAIL;
  } else {
    process.env.GMAIL_ACCOUNT_EMAIL = originalAccountEmail;
  }
}
