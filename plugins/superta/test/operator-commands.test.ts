import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createReviewQueueItem, updateReviewStatus } from '../src/actions/review-queue.js';
import { listReviewItemsCommand } from '../src/commands/list-review-items.js';
import { getReviewItemCommand } from '../src/commands/get-review-item.js';
import { listOutboundActionsCommand } from '../src/commands/list-outbound-actions.js';
import { listExpiringMailboxesCommand } from '../src/commands/list-expiring-mailboxes.js';
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

export async function runOperatorCommandTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-operator-cmds-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    const pending = createReviewQueueItem({
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
    const approved = updateReviewStatus({ ...pending, id: 'rq-2' }, 'approved');
    await store.saveReviewItem(pending);
    await store.saveReviewItem(approved);
    await store.appendOutboundActionRecord({
      type: 'draft',
      reviewItemId: 'rq-1',
      threadId: 'thread-1',
      messageId: 'draft-1',
      recipients: ['student@example.edu'],
      subject: 'Re: Question',
      recordedAt: '2026-03-22T22:20:00.000Z',
    });
    await store.appendOutboundActionRecord({
      type: 'send',
      reviewItemId: 'rq-2',
      threadId: 'thread-2',
      messageId: 'sent-1',
      recipients: ['student@example.edu'],
      subject: 'Re: Question',
      recordedAt: '2026-03-22T22:21:00.000Z',
    });
    await store.saveGmailMailboxState({
      emailAddress: 'expiring@example.edu',
      historyId: '101',
      watchExpiration: String(1_700_000_000_000 + 30_000),
      updatedAt: '2026-03-22T22:00:00.000Z',
    });
    await store.saveGmailMailboxState({
      emailAddress: 'fresh@example.edu',
      historyId: '102',
      watchExpiration: String(1_700_000_000_000 + 10 * 60 * 60 * 1000),
      updatedAt: '2026-03-22T22:00:00.000Z',
    });

    const pendingOnly = await listReviewItemsCommand({ stateRoot: root, status: 'pending', limit: 10 });
    assert.equal(pendingOnly.count, 1);
    assert.equal(pendingOnly.items[0]?.id, 'rq-1');

    const oneItem = await getReviewItemCommand('rq-2', root);
    assert.equal(oneItem.ok, true);
    assert.equal(oneItem.item?.status, 'approved');

    const sendOnly = await listOutboundActionsCommand({ stateRoot: root, type: 'send', limit: 10 });
    assert.equal(sendOnly.count, 1);
    assert.equal(sendOnly.records[0]?.messageId, 'sent-1');

    const expiring = await listExpiringMailboxesCommand({
      stateRoot: root,
      thresholdMs: 60_000,
      now: 1_700_000_000_000,
    });
    assert.equal(expiring.count, 1);
    assert.equal(expiring.entries[0]?.emailAddress, 'expiring@example.edu');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
