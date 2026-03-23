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
      }),
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string) => {
      if (String(url).includes('/users/me/messages/send')) {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: 'sent-live-1' });
          },
        } as any;
      }

      return {
        ok: true,
        status: 200,
        async text() {
          return '{}';
        },
      } as any;
    }) as any;

    try {
      process.env.GMAIL_ACCESS_TOKEN = 'token';
      const result = await runRuntimeApproveSend({
        configPath,
        stateRoot: root,
        sender: 'prof@example.edu',
        reviewItemId: 'rq-1',
        mode: 'approve-and-send',
      });

      assert.equal(result.ok, true);
      if (result.ok && result.step === 'send') {
        assert.equal(result.messageId, 'sent-live-1');
        assert.deepEqual(result.recipients, ['student@example.edu']);
      }

      const stored = await store.getReviewItem('rq-1');
      assert.equal(stored?.status, 'sent');
      const outbound = await store.listOutboundActionRecords();
      assert.equal(outbound.length, 1);
      assert.equal(outbound[0]?.messageId, 'sent-live-1');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.GMAIL_ACCESS_TOKEN;
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
