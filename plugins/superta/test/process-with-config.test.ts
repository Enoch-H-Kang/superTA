import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { processInboundThreadWithConfig } from '../src/orchestration/process-with-config.js';
import type { Classification } from '../src/routing/classify.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';
import type { SuperTAConfig } from '../src/config.js';

function thread(overrides: Partial<NormalizedThread> = {}): NormalizedThread {
  return {
    threadId: 'thread-1',
    messageId: 'msg-1',
    from: 'student@example.edu',
    to: ['econ201@school.edu'],
    subject: 'Econ201 late policy question',
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
  const root = await mkdtemp(join(tmpdir(), `superta-config-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

export async function runProcessWithConfigTests() {
  const econRoot = await makeCourseRoot('econ201');
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
          courseId: 'econ201-sp26',
          termId: 'sp26',
          aliases: ['econ201@school.edu'],
          subjectHints: ['econ201'],
        },
      ],
    },
    courseRoots: {
      'econ201-sp26': econRoot,
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
    const result = await processInboundThreadWithConfig(config, thread(), {
      classify: () => classification(),
    });
    assert.equal(result.route.professorId, 'prof-enoch');
    assert.equal(result.route.courseId, 'econ201-sp26');
    assert.equal(result.outcome.type, 'queue');
    assert.equal(result.audit.courseId, 'econ201-sp26');
  } finally {
    await rm(econRoot, { recursive: true, force: true });
  }
}
