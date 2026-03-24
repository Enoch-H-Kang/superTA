import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import type { Classification } from '../src/routing/classify.js';
import type { CourseRoute } from '../src/routing/course-resolver.js';
import { createReviewQueueItem } from '../src/actions/review-queue.js';
import { createProposal } from '../src/proposals/create-proposal.js';

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

function route(): CourseRoute {
  return {
    professorId: 'prof-enoch',
    courseId: 'cs101-sp26',
    termId: 'sp26',
    routeConfidence: 1,
    ambiguous: false,
  };
}

export async function runFileStoreTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-store-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    const reviewItem = createReviewQueueItem({
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
      draftSummary: 'Draft summary',
    });

    await store.saveReviewItem(reviewItem);
    const loaded = await store.getReviewItem('rq-1');
    assert.equal(loaded?.id, 'rq-1');
    assert.deepEqual(loaded?.replyTo, ['student@example.edu']);
    assert.equal(loaded?.inReplyTo, 'orig-message-id');
    assert.deepEqual(loaded?.references, ['orig-message-id']);

    const listedItems = await store.listReviewItems();
    assert.equal(listedItems.length, 1);

    await store.appendAuditRecord({
      threadId: 'thread-1',
      messageId: 'msg-1',
      courseId: 'cs101-sp26',
      route: route(),
      classification: classification(),
      evidence: [],
      outcome: 'queue',
      outcomeReason: 'Queued for review.',
    });

    const audits = await store.listAuditRecords();
    assert.equal(audits.length, 1);
    assert.equal(audits[0]?.outcome, 'queue');

    const proposal = createProposal('faq', 'Add late policy FAQ', 'prof@example.edu');
    await store.saveProposal(proposal);
    const loadedProposal = await store.getProposal(proposal.id);
    assert.equal(loadedProposal?.kind, 'faq');
    const proposals = await store.listProposals();
    assert.equal(proposals.length, 1);

    assert.equal(await store.hasProcessedGmailEvent('prof@example.edu:1'), false);
    await store.markProcessedGmailEvent('prof@example.edu:1');
    assert.equal(await store.hasProcessedGmailEvent('prof@example.edu:1'), true);
    const checkpoints = await store.listProcessedGmailEvents();
    assert.deepEqual(checkpoints, ['prof@example.edu:1']);

    await store.saveGmailMailboxState({
      emailAddress: 'prof@example.edu',
      historyId: '123',
      watchExpiration: '9999999999999',
      updatedAt: '2026-03-22T22:00:00.000Z',
    });
    const mailbox = await store.getGmailMailboxState('prof@example.edu');
    assert.equal(mailbox?.historyId, '123');
    assert.equal(mailbox?.watchExpiration, '9999999999999');
    const mailboxes = await store.listGmailMailboxStates();
    assert.equal(mailboxes.length, 1);

    await store.appendOutboundActionRecord({
      type: 'send',
      reviewItemId: 'rq-1',
      threadId: 'thread-1',
      messageId: 'sent-1',
      recipients: ['student@example.edu'],
      subject: 'Re: Question',
      recordedAt: '2026-03-22T22:05:00.000Z',
    });
    const outbound = await store.listOutboundActionRecords();
    assert.equal(outbound.length, 1);
    assert.equal(outbound[0]?.messageId, 'sent-1');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
