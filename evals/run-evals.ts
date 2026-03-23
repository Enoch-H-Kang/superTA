import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../plugins/superta/src/storage/file-store.js';
import { processInboundThreadWithClassifier } from '../plugins/superta/src/orchestration/process-with-classifier.js';
import type { ClassifierProvider } from '../plugins/superta/src/classifier/provider.js';
import { classifyWithRuntimeFallback } from '../plugins/superta/src/classifier/runtime.js';
import type { SuperTAConfig } from '../plugins/superta/src/config.js';
import type { NormalizedThread } from '../plugins/superta/src/gmail/normalize.js';
import type { Classification } from '../plugins/superta/src/routing/classify.js';
import { runClassifierFixtureEvals } from './run-classifier-fixtures.js';

function thread(subject: string, bodyText = 'Body'): NormalizedThread {
  return {
    threadId: `thread-${subject}`,
    messageId: `msg-${subject}`,
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject,
    bodyText,
    attachments: [],
    isProfessorCommand: false,
  };
}

function classification(category: Classification['category'], overrides: Partial<Classification> = {}): Classification {
  return {
    category,
    action: 'draft_for_professor',
    confidence: 0.95,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: `Eval classification for ${category}.`,
    ...overrides,
  };
}

async function makeCourseRoot(name: string) {
  const root = await mkdtemp(join(tmpdir(), `superta-evals-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

async function baseSetup() {
  const courseRoot = await makeCourseRoot('cs101');
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-evals-state-'));
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
          subjectHints: ['cs101', 'midterm'],
        },
        {
          courseId: 'econ201-sp26',
          termId: 'sp26',
          aliases: ['econ201@school.edu'],
          subjectHints: ['midterm'],
        },
      ],
    },
    courseRoots: {
      'cs101-sp26': courseRoot,
      'econ201-sp26': courseRoot,
    },
  };

  return { courseRoot, stateRoot, store, config };
}

async function runSensitiveEscalationEval(category: Classification['category']) {
  const { courseRoot, stateRoot, store, config } = await baseSetup();
  try {
    const provider: ClassifierProvider = {
      async classify() {
        return classification(category);
      },
    };

    const result = await processInboundThreadWithClassifier(config, store, provider, thread(`cs101 ${category}`));
    assert.equal(result.outcome.type, 'escalate');
    assert.equal(result.classification.action, 'escalate_now');
    assert.equal(result.classification.shouldNotifyProfessor, true);
    return { name: `sensitive:${category}`, ok: true };
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}

async function runAmbiguousRoutingEval() {
  const { courseRoot, stateRoot, store, config } = await baseSetup();
  try {
    const provider: ClassifierProvider = {
      async classify() {
        return classification('deadline');
      },
    };

    const result = await processInboundThreadWithClassifier(
      config,
      store,
      provider,
      {
        ...thread('midterm question'),
        to: ['unknown@example.edu'],
      },
    );

    assert.equal(result.outcome.type, 'needs_more_info');
    assert.equal(result.classification.shouldNotifyProfessor, true);
    assert.match(result.classification.reason, /Ambiguous course routing/);
    return { name: 'ambiguous-routing', ok: true };
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}

async function runClassifierFailClosedEval() {
  const failedClosed = await classifyWithRuntimeFallback(
    {
      async classify() {
        throw new Error('simulated classifier failure');
      },
    },
    {
      thread: thread('cs101 help'),
      courseId: 'cs101-sp26',
    },
  );

  assert.equal(failedClosed.action, 'needs_more_info');
  assert.equal(failedClosed.shouldNotifyProfessor, true);
  assert.match(failedClosed.reason, /Classifier failed closed/);
  return { name: 'classifier-fail-closed', ok: true };
}

export async function runEvals() {
  const results = [];
  results.push(await runSensitiveEscalationEval('grade-related'));
  results.push(await runSensitiveEscalationEval('accommodation-sensitive'));
  results.push(await runSensitiveEscalationEval('integrity-sensitive'));
  results.push(await runSensitiveEscalationEval('wellbeing/safety'));
  results.push(await runAmbiguousRoutingEval());
  results.push(await runClassifierFailClosedEval());
  results.push(...(await runClassifierFixtureEvals()));

  console.log(JSON.stringify({ ok: true, evals: results }, null, 2));
}

runEvals().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
