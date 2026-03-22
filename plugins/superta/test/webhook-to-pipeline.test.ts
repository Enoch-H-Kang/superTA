import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createMockGmailHistoryClient } from '../src/gmail/history-client.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import { processWebhookEventIntoPipeline } from '../src/gmail/webhook-to-pipeline.js';
import type { SuperTAConfig } from '../src/config.js';
import type { GmailClient } from '../src/gmail/client.js';

async function makeCourseRoot() {
  const root = await mkdtemp(join(tmpdir(), 'superta-webhook-pipeline-'));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), '# Course\n');
  await writeFile(join(courseDir, 'faq.md'), '# FAQ\n');
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

function gmailClient(): GmailClient {
  return {
    async fetchThread(threadId) {
      return [
        {
          threadId,
          messageId: 'm1',
          from: 'student@example.edu',
          to: ['course@example.edu'],
          subject: 'Late submission question',
          bodyText: 'Can I submit late?',
          inReplyTo: 'orig-message-id',
          references: ['orig-message-id'],
        },
      ];
    },
    async createDraft() {
      return { id: 'draft-1', status: 'drafted' as const };
    },
    async sendMessage() {
      return { id: 'sent-1', status: 'sent' as const };
    },
    async forwardThread() {
      return { id: 'forward-1', status: 'forwarded' as const };
    },
    async labelThread(request) {
      return { threadId: request.threadId, status: 'labeled' as const, labels: request.labels };
    },
  };
}

export async function runWebhookToPipelineTests() {
  const courseRoot = await makeCourseRoot();
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-webhook-state-'));

  try {
    const store = createFileStore(defaultFileStorePaths(stateRoot));
    const historyClient = createMockGmailHistoryClient({
      history: [
        {
          id: '1',
          messagesAdded: [{ message: { id: 'm1', threadId: 'thread-123' } }],
        },
      ],
      historyId: '1',
    });
    const classifier = createStubClassifierProvider();
    const config: SuperTAConfig = {
      professorId: 'prof-enoch',
      gmail: {
        webhookPath: '/webhooks/gmail',
        allowedProfessorSenders: ['prof@example.edu'],
      },
      routing: {
        professorId: 'prof-enoch',
        courses: [
          {
            courseId: 'cs101-sp26',
            termId: 'sp26',
            aliases: ['course@example.edu'],
            subjectHints: ['late'],
          },
        ],
      },
      courseRoots: {
        'cs101-sp26': courseRoot,
      },
    };

    const results = await processWebhookEventIntoPipeline(
      config,
      store,
      historyClient,
      gmailClient(),
      classifier,
      {
        emailAddress: 'prof@example.edu',
        historyId: '1',
        receivedAt: new Date().toISOString(),
      },
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.target.threadId, 'thread-123');
    assert.equal(results[0]?.result.outcome.type, 'queue');
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
