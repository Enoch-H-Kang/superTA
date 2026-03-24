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
      draftSummary: 'Draft summary',
    });
    await store.saveReviewItem(pending);

    const blockedPending = await executeApprovedSend(store, gmail, 'rq-pending');
    assert.equal(blockedPending.ok, false);

    const approved = updateReviewStatus({ ...pending, id: 'rq-approved' }, 'approved');
    await store.saveReviewItem(approved);

    const blockedApproved = await executeApprovedSend(store, gmail, 'rq-approved');
    assert.equal(blockedApproved.ok, false);
    assert.match(blockedApproved.reason, /removed/i);

    const loaded = await store.getReviewItem('rq-approved');
    assert.equal(loaded?.status, 'approved');
    const outbound = await store.listOutboundActionRecords();
    assert.equal(outbound.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
