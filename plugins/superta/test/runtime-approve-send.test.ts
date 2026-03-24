import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createReviewQueueItem } from '../src/actions/review-queue.js';
import type { Classification } from '../src/routing/classify.js';
import { runRuntimeApproveSend } from '../src/commands/runtime-approve-send.js';

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

export async function runRuntimeApproveSendTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-runtime-send-'));
  const configPath = join(root, 'local.config.json');

  try {
    await writeFile(
      configPath,
      JSON.stringify({
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
        privacy: {
          ferpaSafeMode: true,
          allowExternalClassifier: false,
          allowSend: false,
          redactOperatorViews: true,
          storeEvidenceSnippets: false,
        },
      }),
    );

    const store = createFileStore(defaultFileStorePaths(root));
    await store.saveReviewItem(
      createReviewQueueItem({
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
      }),
    );

    const result = await runRuntimeApproveSend({
      configPath,
      stateRoot: root,
      sender: 'prof@example.edu',
      reviewItemId: 'rq-1',
    });

    assert.equal(result.ok, true);
    assert.equal(result.step, 'approve');

    const stored = await store.getReviewItem('rq-1');
    assert.equal(stored?.status, 'approved');
    const outbound = await store.listOutboundActionRecords();
    assert.equal(outbound.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
