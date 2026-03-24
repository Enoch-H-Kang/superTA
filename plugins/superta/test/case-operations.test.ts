import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { addStudentCaseNote, getStudentCaseWithEvents, listStudentCases, mutateStudentCase } from '../src/cases/operations.js';

export async function runCaseOperationsTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-case-ops-'));
  const store = createFileStore(defaultFileStorePaths(root));

  try {
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
      subject: 'Need extension',
      caseType: 'extension-request',
      category: 'deadline',
      sensitivity: 'routine',
      status: 'queued',
      requestSummary: 'Asked for an extension.',
      requestedAt: '2026-03-24T00:00:00.000Z',
      updatedAt: '2026-03-24T00:00:00.000Z',
      source: {
        threadId: 'thread-1',
        messageId: 'msg-1',
      },
    });

    const listed = await listStudentCases(store, { courseId: 'cs101-sp26', query: 'extension' });
    assert.equal(listed.length, 1);

    const noted = await addStudentCaseNote(store, 'case-1', 'Professor approved one-time exception.');
    assert.equal(noted.ok, true);

    const approved = await mutateStudentCase(store, 'case-1', 'approve', 'Approved extension.');
    assert.equal(approved.ok, true);
    if (approved.ok) {
      assert.equal(approved.record.status, 'approved');
    }

    const loaded = await getStudentCaseWithEvents(store, 'case-1');
    assert.ok(loaded);
    assert.equal(loaded?.events.length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
