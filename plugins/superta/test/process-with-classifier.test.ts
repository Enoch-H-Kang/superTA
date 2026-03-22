import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { processInboundThreadWithClassifier } from '../src/orchestration/process-with-classifier.js';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';
import { createResponsesClassifierProvider } from '../src/classifier/responses-adapter.js';
import { createMockResponsesClient } from '../src/classifier/mock-responses-client.js';
import { createResponsesHttpClient } from '../src/classifier/responses-http-client.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';
import type { SuperTAConfig } from '../src/config.js';
import type { Classification } from '../src/routing/classify.js';

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

function responsesClassification(): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.95,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Responses adapter mock result.',
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
  };

  try {
    const queued = await processInboundThreadWithClassifier(config, store, classifier, thread('Late policy question'));
    assert.equal(queued.outcome.type, 'queue');

    const escalated = await processInboundThreadWithClassifier(config, store, classifier, thread('Question about my grade'));
    assert.equal(escalated.outcome.type, 'escalate');

    const responsesProvider = createResponsesClassifierProvider(
      {
        model: 'gpt-5.4-mini',
        systemPrompt: 'Classify course email into the SuperTA schema.',
      },
      createMockResponsesClient(responsesClassification()),
    );

    const queuedViaResponses = await processInboundThreadWithClassifier(
      config,
      store,
      responsesProvider,
      thread('Need help with late submission'),
    );
    assert.equal(queuedViaResponses.outcome.type, 'queue');
    assert.equal(queuedViaResponses.classification.confidence, 0.95);

    process.env.OPENAI_API_KEY = 'test-key';
    const httpProvider = createResponsesClassifierProvider(
      {
        model: 'gpt-5.4-mini',
        systemPrompt: 'Classify course email into the SuperTA schema.',
      },
      createResponsesHttpClient(async () => ({
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify(responsesClassification());
        },
      })),
    );

    const queuedViaHttp = await processInboundThreadWithClassifier(
      config,
      store,
      httpProvider,
      thread('Need extension help'),
    );
    assert.equal(queuedViaHttp.outcome.type, 'queue');
    assert.equal(queuedViaHttp.classification.confidence, 0.95);

    const storedAudits = await store.listAuditRecords();
    assert.equal(storedAudits.length, 4);
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
