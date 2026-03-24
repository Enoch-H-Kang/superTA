import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { processInboundThreadAndStore } from '../src/orchestration/process-and-store.js';
import type { Classification } from '../src/routing/classify.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';
import type { SuperTAConfig } from '../src/config.js';

function thread(overrides: Partial<NormalizedThread> = {}): NormalizedThread {
  return {
    threadId: 'thread-1',
    messageId: 'msg-1',
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject: 'CS101 late policy question',
    bodyText: 'Can I submit late?',
    attachments: [],
    isProfessorCommand: false,
    ...overrides,
  };
}

function classification(overrides: Partial<Classification> = {}): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.9,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Routine deadline question.',
    ...overrides,
  };
}

async function makeCourseRoot(name: string) {
  const root = await mkdtemp(join(tmpdir(), `superta-store-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

export async function runProcessAndStoreTests() {
  const courseRoot = await makeCourseRoot('cs101');
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-state-'));
  const store = createFileStore(defaultFileStorePaths(stateRoot));

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
    const queued = await processInboundThreadAndStore(config, store, thread(), {
      classify: () => classification(),
    });
    assert.equal(queued.outcome.type, 'queue');

    const reviewItems = await store.listReviewItems();
    const auditRecords = await store.listAuditRecords();
    const studentCases = await store.listStudentCases();
    const studentCaseEvents = await store.listStudentCaseEvents();
    assert.equal(reviewItems.length, 1);
    assert.equal(auditRecords.length, 1);
    assert.equal(studentCases.length, 1);
    assert.equal(studentCaseEvents.length, 1);
    assert.equal(studentCases[0]?.caseType, 'extension-request');
    assert.equal(studentCases[0]?.student.key, 'student@example.edu');
    assert.equal(studentCases[0]?.status, 'queued');
    assert.equal(reviewItems[0]?.draftSummary.length ? true : false, true);
    assert.equal(auditRecords[0]?.outcome, 'queue');

    const escalated = await processInboundThreadAndStore(
      config,
      store,
      thread({
        messageId: 'msg-2',
        subject: 'Question about my grade',
        bodyText: 'I think my midterm grade was entered incorrectly.',
      }),
      {
        classify: () => classification({ category: 'grade-related', action: 'draft_for_professor' }),
      },
    );
    assert.equal(escalated.outcome.type, 'escalate');

    const reviewItemsAfterEscalation = await store.listReviewItems();
    const auditRecordsAfterEscalation = await store.listAuditRecords();
    const studentCasesAfterEscalation = await store.listStudentCases();
    const studentCaseEventsAfterEscalation = await store.listStudentCaseEvents();
    assert.equal(reviewItemsAfterEscalation.length, 1);
    assert.equal(auditRecordsAfterEscalation.length, 2);
    assert.equal(studentCasesAfterEscalation.length, 2);
    assert.equal(studentCaseEventsAfterEscalation.length, 2);
    assert.equal(studentCasesAfterEscalation[1]?.status, 'escalated');
    assert.equal(studentCasesAfterEscalation[1]?.sensitivity, 'sensitive');
    assert.equal(auditRecordsAfterEscalation[1]?.outcome, 'escalate');

    const merged = await processInboundThreadAndStore(config, store, thread({ messageId: 'msg-3', subject: 'Another late policy question' }), {
      classify: () => classification(),
    });
    assert.equal(merged.outcome.type, 'queue');

    const studentCasesAfterMerge = await store.listStudentCases();
    const studentCaseEventsAfterMerge = await store.listStudentCaseEvents();
    const mergedExtensionCase = studentCasesAfterMerge.find((item) => item.caseType === 'extension-request');
    assert.equal(studentCasesAfterMerge.length, 2);
    assert.equal(studentCaseEventsAfterMerge.length, 3);
    assert.equal(mergedExtensionCase?.messageId, 'msg-3');
    assert.equal(studentCaseEventsAfterMerge[2]?.type, 'merged_followup');
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
