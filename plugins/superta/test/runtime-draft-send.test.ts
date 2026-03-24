import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createReviewQueueItem } from '../src/actions/review-queue.js';
import type { Classification } from '../src/routing/classify.js';
import { runRuntimeDraft } from '../src/commands/runtime-draft-send.js';

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

export async function runRuntimeDraftSendTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-runtime-draft-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    await store.saveReviewItem(
      createReviewQueueItem({
        id: 'rq-draft',
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

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string) => {
      if (String(url).includes('/users/me/drafts')) {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: 'draft-live-1' });
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
      const result = await runRuntimeDraft({
        reviewItemId: 'rq-draft',
        stateRoot: root,
      });

      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.draftId, 'draft-live-1');
      }

      const outbound = await store.listOutboundActionRecords();
      assert.equal(outbound.length, 1);
      assert.equal(outbound[0]?.type, 'draft');
      assert.equal(outbound[0]?.messageId, 'draft-live-1');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.GMAIL_ACCESS_TOKEN;
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
