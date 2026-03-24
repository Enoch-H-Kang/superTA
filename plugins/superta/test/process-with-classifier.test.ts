import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { processInboundThreadWithClassifier } from '../src/orchestration/process-with-classifier.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';
import type { SuperTAConfig } from '../src/config.js';

function thread(subject: string): NormalizedThread {
  return {
    threadId: 'thread-1',
    messageId: 'msg-1',
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject,
    bodyText: 'Body',
    attachments: [],
    isProfessorCommand: false,
  };
}

async function makeCourseRoot(name: string) {
  const root = await mkdtemp(join(tmpdir(), `superta-classifier-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

export async function runProcessWithClassifierTests() {
  const courseRoot = await makeCourseRoot('cs101');
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-classifier-state-'));
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

  try {
    const queued = await processInboundThreadWithClassifier(config, store, classifier, thread('Late policy question'));
    assert.equal(queued.outcome.type, 'queue');

    const escalated = await processInboundThreadWithClassifier(config, store, classifier, thread('Question about my grade'));
    assert.equal(escalated.outcome.type, 'escalate');

    const secondQueued = await processInboundThreadWithClassifier(
      config,
      store,
      classifier,
      thread('Need help with late submission'),
    );
    assert.equal(secondQueued.outcome.type, 'queue');

    const storedAudits = await store.listAuditRecords();
    assert.equal(storedAudits.length, 3);
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
