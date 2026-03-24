import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReviewQueueItem, updateReviewStatus } from '../src/actions/review-queue.js';
import { inspectSuperTAState } from '../src/commands/inspect-state.js';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import type { Classification } from '../src/routing/classify.js';
import type { CourseRoute } from '../src/routing/course-resolver.js';

function classification(): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.9,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'test fixture',
  };
}

function route(): CourseRoute {
  return {
    professorId: 'prof-enoch',
    courseId: 'cs101-sp26',
    termId: 'sp26',
    routeConfidence: 1,
    ambiguous: false,
  };
}

export async function runInspectStateTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-inspect-'));

  try {
    await writeFile(
      join(root, 'local.config.json'),
      JSON.stringify({
        professorId: 'prof-enoch',
        gmail: {
          webhookPath: '/webhooks/gmail',
          allowedProfessorSenders: ['prof@example.edu'],
        },
        routing: {
          professorId: 'prof-enoch',
          courses: [],
        },
        courseRoots: {},
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
      }),
    );

    const store = createFileStore(defaultFileStorePaths(root));
    const pending = createReviewQueueItem({
      id: 'rq-1',
      threadId: 'thread-1',
      messageId: 'msg-1',
      courseId: 'cs101-sp26',
      replyTo: ['student@example.edu'],
      inReplyTo: 'orig-message-id',
      references: ['orig-message-id'],
      classification: classification(),
      evidence: [],
      draftSubject: 'Re: Question',
      draftBody: 'Draft body',
      draftSummary: 'Draft summary',
    });
    const sent = updateReviewStatus({ ...pending, id: 'rq-2' }, 'sent');

    await store.saveReviewItem(pending);
    await store.saveReviewItem(sent);
    await store.appendOutboundActionRecord({
      type: 'send',
      reviewItemId: 'rq-2',
      threadId: 'thread-2',
      messageId: 'sent-1',
      recipients: ['student@example.edu'],
      subject: 'Re: Question',
      recordedAt: '2026-03-22T22:10:00.000Z',
    });
    await store.saveGmailMailboxState({
      emailAddress: 'prof@example.edu',
      historyId: '123',
      watchExpiration: '9999999999999',
      updatedAt: '2026-03-22T22:00:00.000Z',
    });
    await store.appendAuditRecord({
      threadId: 'thread-1',
      messageId: 'msg-1',
      courseId: 'cs101-sp26',
      route: route(),
      classification: classification(),
      evidence: [],
      outcome: 'queue',
      outcomeReason: 'Queued for review.',
    });
    await store.saveStudentCase({
      id: 'case-1',
      threadId: 'thread-1',
      messageId: 'msg-1',
      courseId: 'cs101-sp26',
      student: {
        key: 'student@example.edu',
        primaryEmail: 'student@example.edu',
        displayName: 'Student Example',
        observedEmails: ['student@example.edu'],
      },
      subject: 'Need midterm time change',
      caseType: 'exam-time-change',
      category: 'deadline',
      sensitivity: 'routine',
      status: 'queued',
      requestSummary: 'Student requested a midterm time change.',
      requestedAt: '2026-03-22T21:58:00.000Z',
      updatedAt: '2026-03-22T22:00:00.000Z',
      source: {
        threadId: 'thread-1',
        messageId: 'msg-1',
      },
    });
    await store.appendStudentCaseEvent({
      id: 'case-1:queued_for_review',
      caseId: 'case-1',
      type: 'queued_for_review',
      recordedAt: '2026-03-22T22:00:00.000Z',
      threadId: 'thread-1',
      messageId: 'msg-1',
      status: 'queued',
      reason: 'Queued for review.',
    });

    const result = await inspectSuperTAState({ stateRoot: root, limit: 5 });
    assert.equal(result.ok, true);
    assert.equal(result.reviewQueue.count, 2);
    assert.equal(result.reviewQueue.pending, 1);
    assert.equal(result.reviewQueue.sent, 1);
    assert.equal(result.outboundActions.count, 1);
    assert.equal(result.gmailMailboxes.count, 1);
    assert.equal(result.auditLog.count, 1);
    assert.equal(result.studentCases.count, 1);
    assert.equal(result.studentCaseEvents.count, 1);
    assert.equal(result.privacy?.ferpaSafeMode, true);
    assert.equal(result.reviewQueue.recent[0]?.replyTo[0], 's***@example.edu');
    assert.equal(result.reviewQueue.recent[0]?.draftBody, '[redacted-draft-body]');
    assert.equal(result.reviewQueue.recent[0]?.draftSummary, '[redacted-draft-summary]');
    assert.equal(result.outboundActions.recent[0]?.subject, '[redacted-subject]');
    assert.equal(result.studentCases.recent[0]?.student.primaryEmail, 's***@example.edu');
    assert.equal(result.studentCases.recent[0]?.student.key, '[redacted-student-key]');
    assert.equal(result.studentCases.recent[0]?.requestSummary, '[redacted-request-summary]');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
