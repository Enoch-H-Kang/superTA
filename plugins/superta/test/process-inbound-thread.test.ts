import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { processInboundThread } from '../src/orchestration/process-inbound-thread.js';
import type { Classification } from '../src/routing/classify.js';
import type { NormalizedThread } from '../src/gmail/normalize.js';
import type { CourseRouteConfig } from '../src/routing/course-resolver.js';

const config: CourseRouteConfig = {
  professorId: 'prof-enoch',
  courses: [
    {
      courseId: 'cs101-sp26',
      termId: 'sp26',
      aliases: ['cs101@school.edu'],
      subjectHints: ['cs101'],
    },
    {
      courseId: 'econ201-sp26',
      termId: 'sp26',
      aliases: ['econ201@school.edu'],
      subjectHints: ['econ201'],
    },
  ],
};

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
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
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
  const root = await mkdtemp(join(tmpdir(), `superta-${name}-`));
  const courseDir = join(root, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeFile(join(courseDir, 'syllabus.md'), `# ${name} Syllabus\n`);
  await writeFile(join(courseDir, 'faq.md'), `# ${name} FAQ\n`);
  await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
  await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');
  return root;
}

export async function runProcessInboundThreadTests() {
  const cs101Root = await makeCourseRoot('cs101');
  const econ201Root = await makeCourseRoot('econ201');
  const roots: Record<string, string> = {
    'cs101-sp26': cs101Root,
    'econ201-sp26': econ201Root,
  };

  try {
    const queued = await processInboundThread(thread(), (courseId) => roots[courseId] ?? '', {
      routeConfig: config,
      classify: () => classification(),
    });
    assert.equal(queued.route.ambiguous, false);
    assert.equal(queued.route.courseId, 'cs101-sp26');
    assert.equal(queued.evidenceCount, 4);
    assert.equal(queued.outcome.type, 'queue');
    assert.equal(queued.audit.outcome, 'queue');
    if (queued.outcome.type === 'queue') {
      assert.equal(queued.outcome.item.status, 'pending');
      assert.equal(queued.outcome.item.courseId, 'cs101-sp26');
      assert.deepEqual(queued.outcome.item.replyTo, ['student@example.edu']);
      assert.equal(queued.outcome.item.inReplyTo, 'orig-message-id');
      assert.deepEqual(queued.outcome.item.references, ['orig-message-id']);
      assert.match(queued.outcome.item.draftSubject, /^Re:/);
      assert.match(queued.outcome.item.draftBody, /Course: cs101-sp26/);
      assert.match(queued.outcome.item.draftBody, /Grounding evidence:/);
    }

    const econQueued = await processInboundThread(
      thread({ to: ['econ201@school.edu'], subject: 'Econ201 extension question', from: 'econ-student@example.edu' }),
      (courseId) => roots[courseId] ?? '',
      {
        routeConfig: config,
        classify: () => classification(),
      },
    );
    assert.equal(econQueued.route.courseId, 'econ201-sp26');
    assert.equal(econQueued.outcome.type, 'queue');
    if (econQueued.outcome.type === 'queue') {
      assert.deepEqual(econQueued.outcome.item.replyTo, ['econ-student@example.edu']);
    }

    const escalated = await processInboundThread(thread(), (courseId) => roots[courseId] ?? '', {
      routeConfig: config,
      classify: () => classification({ category: 'grade-related', action: 'draft_for_professor' }),
    });
    assert.equal(escalated.outcome.type, 'escalate');
    assert.equal(escalated.audit.outcome, 'escalate');
    assert.match(escalated.audit.outcomeReason, /Sensitive category/);

    const needsInfo = await processInboundThread(
      thread({ to: ['unknown@school.edu'], subject: 'Question' }),
      (courseId) => roots[courseId] ?? '',
      { routeConfig: config, classify: () => classification() },
    );
    assert.equal(needsInfo.route.ambiguous, true);
    assert.equal(needsInfo.outcome.type, 'needs_more_info');
    assert.equal(needsInfo.audit.outcome, 'needs_more_info');
  } finally {
    await rm(cs101Root, { recursive: true, force: true });
    await rm(econ201Root, { recursive: true, force: true });
  }
}
