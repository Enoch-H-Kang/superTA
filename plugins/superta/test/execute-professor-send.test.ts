import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createReviewQueueItem, updateReviewStatus } from '../src/actions/review-queue.js';
import { executeApprovedSend } from '../src/commands/execute-professor-send.js';
import { createMockGmailClient } from '../src/gmail/client.js';
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

export async function runExecuteProfessorSendTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-send-cmd-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    const gmail = createMockGmailClient();

    const pending = createReviewQueueItem({
      id: 'rq-pending',
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
    await store.saveReviewItem(pending);

    const rejectPending = await executeApprovedSend(store, gmail, 'rq-pending');
    assert.equal(rejectPending.ok, false);

    const approved = updateReviewStatus({ ...pending, id: 'rq-approved' }, 'approved');
    await store.saveReviewItem(approved);

    const sent = await executeApprovedSend(store, gmail, 'rq-approved');
    assert.equal(sent.ok, true);
    if (sent.ok) {
      assert.equal(sent.messageId, 'sent-1');
      assert.deepEqual(sent.recipients, ['student@example.edu']);
    }

    const loaded = await store.getReviewItem('rq-approved');
    assert.equal(loaded?.status, 'sent');
    const outbound = await store.listOutboundActionRecords();
    assert.equal(outbound.length, 1);
    assert.equal(outbound[0]?.type, 'send');
    assert.equal(outbound[0]?.messageId, 'sent-1');

    const missing = await executeApprovedSend(store, gmail, 'rq-missing');
    assert.equal(missing.ok, false);

    const noRecipients = updateReviewStatus({ ...pending, id: 'rq-noreply', replyTo: [] }, 'approved');
    await store.saveReviewItem(noRecipients);
    const noRecipientsResult = await executeApprovedSend(store, gmail, 'rq-noreply');
    assert.equal(noRecipientsResult.ok, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
