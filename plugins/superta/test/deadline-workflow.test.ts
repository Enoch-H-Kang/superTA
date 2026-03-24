import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { createMockGmailClient } from '../src/gmail/client.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import { runDeadlineEmailWorkflow } from '../src/demo/deadline-workflow.js';
import type { SuperTAConfig } from '../src/config.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';

async function makeCourseRoot(name: string) {
  const root = await mkdtemp(join(tmpdir(), `superta-demo-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

function buildConfig(courseRoot: string): SuperTAConfig {
  return {
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
}

function buildThread(subject: string): NormalizedThread {
  return {
    threadId: 'thread-1',
    messageId: 'msg-1',
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject,
    bodyText: 'Can I submit late?',
    attachments: [],
    isProfessorCommand: false,
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
  };
}

export async function runDeadlineWorkflowTests() {
  const courseRoot = await makeCourseRoot('cs101');
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-demo-state-'));

  try {
    const store = createFileStore(defaultFileStorePaths(stateRoot));
    const gmail = createMockGmailClient();
    const classifier = createStubClassifierProvider();
    const config = buildConfig(courseRoot);

    const result = await runDeadlineEmailWorkflow(
      config,
      store,
      gmail,
      classifier,
      'prof@example.edu',
      buildThread('CS101 late policy question'),
    );

    assert.ok(result.queuedReviewItemId);
    assert.equal(result.approveResult.type, 'approve');
    if (result.approveResult.type === 'approve') {
      assert.equal(result.approveResult.ok, true);
    }
    const savedItem = await store.getReviewItem(result.queuedReviewItemId ?? '');
    assert.equal(savedItem?.status, 'approved');

    const audits = await store.listAuditRecords();
    assert.equal(audits.length, 1);

    const gradeResult = await runDeadlineEmailWorkflow(
      config,
      store,
      gmail,
      classifier,
      'prof@example.edu',
      buildThread('Question about my grade'),
    );
    assert.equal(gradeResult.approveResult.type, 'ignored');
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
