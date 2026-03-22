import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createReviewQueueItem } from '../src/actions/review-queue.js';
import { executeProfessorCommand } from '../src/commands/execute-professor-command.js';
import type { SuperTAConfig } from '../src/config.js';
import type { Classification } from '../src/routing/classify.js';

const config: SuperTAConfig = {
  professorId: 'prof-enoch',
  gmail: {
    webhookPath: '/webhooks/gmail',
    allowedProfessorSenders: ['prof@example.edu'],
  },
  routing: {
    professorId: 'prof-enoch',
    courses: [],
  },
  courseRoots: {},
};

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

export async function runExecuteProfessorCommandTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-exec-cmd-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    const item = createReviewQueueItem({
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
    await store.saveReviewItem(item);

    const approved = await executeProfessorCommand(config, store, 'prof@example.edu', '[SUPERTA APPROVE] rq-1');
    assert.equal(approved.type, 'approve');
    if (approved.type === 'approve') {
      assert.equal(approved.ok, true);
      assert.equal(approved.reviewItemId, 'rq-1');
    }

    const loaded = await store.getReviewItem('rq-1');
    assert.equal(loaded?.status, 'approved');
    assert.deepEqual(loaded?.replyTo, ['student@example.edu']);
    assert.equal(loaded?.inReplyTo, 'orig-message-id');
    assert.deepEqual(loaded?.references, ['orig-message-id']);

    const missing = await executeProfessorCommand(config, store, 'prof@example.edu', '[SUPERTA APPROVE] rq-404');
    assert.equal(missing.type, 'approve');
    if (missing.type === 'approve') {
      assert.equal(missing.ok, false);
    }

    const unauthorized = await executeProfessorCommand(config, store, 'student@example.edu', '[SUPERTA APPROVE] rq-1');
    assert.equal(unauthorized.type, 'ignored');

    const policy = await executeProfessorCommand(config, store, 'prof@example.edu', '[SUPERTA POLICY] new late-day policy');
    assert.equal(policy.type, 'policy');
    if (policy.type === 'policy') {
      assert.ok(policy.proposalId);
    }

    const faq = await executeProfessorCommand(config, store, 'prof@example.edu', '[SUPERTA FAQ] add late policy');
    assert.equal(faq.type, 'faq');
    if (faq.type === 'faq') {
      assert.ok(faq.proposalId);
    }

    const proposals = await store.listProposals();
    assert.equal(proposals.length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
