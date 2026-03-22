import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { processInboundThreadWithClassifier } from '../src/orchestration/process-with-classifier.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import { normalizeGmailThread } from '../src/gmail/thread-to-normalized.js';
import type { GmailThreadMessage } from '../src/gmail/client.js';
import type { SuperTAConfig } from '../src/config.js';

async function makeCourseRoot(name: string) {
  const root = await mkdtemp(join(tmpdir(), `superta-live-inbound-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

export async function runLiveInboundRunnerTests() {
  const courseRoot = await makeCourseRoot('cs101');
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-live-inbound-state-'));
  const store = createFileStore(defaultFileStorePaths(stateRoot));
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
  };

  const thread: GmailThreadMessage[] = [
    {
      threadId: 'thread-123',
      messageId: 'message-123',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Late policy question for cs101',
      bodyText: 'Can I submit late?',
      references: ['message-122'],
      inReplyTo: 'message-122',
    },
  ];

  try {
    const normalized = normalizeGmailThread(thread);
    const result = await processInboundThreadWithClassifier(config, store, classifier, normalized);
    assert.equal(result.outcome.type, 'queue');

    const reviewItems = await store.listReviewItems();
    const auditRecords = await store.listAuditRecords();

    assert.equal(reviewItems.length, 1);
    assert.equal(auditRecords.length, 1);
    assert.equal(reviewItems[0]?.threadId, 'thread-123');
    assert.equal(reviewItems[0]?.courseId, 'cs101-sp26');
    assert.equal(auditRecords[0]?.outcome, 'queue');
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
