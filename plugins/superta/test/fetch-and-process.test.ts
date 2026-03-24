import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import { fetchAndProcessThreadTarget } from '../src/gmail/fetch-and-process.js';
import type { SuperTAConfig } from '../src/config.js';
import type { GmailClient } from '../src/gmail/client.js';

async function makeCourseRoot() {
  const root = await mkdtemp(join(tmpdir(), 'superta-fetch-process-'));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), '# CS101 Syllabus\n');
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
          to: ['cs101@school.edu'],
          subject: 'Late policy question',
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

export async function runFetchAndProcessTests() {
  const courseRoot = await makeCourseRoot();
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-fetch-state-'));

  try {
    const store = createFileStore(defaultFileStorePaths(stateRoot));
    const gmail = gmailClient();
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
            aliases: ['cs101@school.edu'],
            subjectHints: ['cs101'],
          },
        ],
      },
      courseRoots: {
        'cs101-sp26': courseRoot,
      },
      privacy: {
        ferpaSafeMode: true,
        allowExternalClassifier: false,
        allowSend: false,
        redactOperatorViews: true,
        storeEvidenceSnippets: false,
      },
      localModel: {
        required: true,
        provider: 'stub',
      },
    };

    const result = await fetchAndProcessThreadTarget(config, store, gmail, classifier, {
      threadId: 'thread-123',
      messageId: 'm1',
    });

    assert.equal(result.outcome.type, 'queue');
    assert.equal(result.route.courseId, 'cs101-sp26');
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
