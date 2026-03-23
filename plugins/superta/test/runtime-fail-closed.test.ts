import assert from 'node:assert/strict';
import { classifyWithRuntimeFallback } from '../src/classifier/runtime.js';

export async function runRuntimeFailClosedTests() {
  const result = await classifyWithRuntimeFallback(
    {
      async classify() {
        throw new Error('simulated failure');
      },
    },
    {
      thread: {
        threadId: 'thread-1',
        messageId: 'msg-1',
        from: 'student@example.edu',
        to: ['cs101@school.edu'],
        subject: 'Question',
        bodyText: 'Body',
        attachments: [],
        isProfessorCommand: false,
      },
      courseId: 'cs101-sp26',
    },
  );

  assert.equal(result.action, 'needs_more_info');
  assert.equal(result.shouldNotifyProfessor, true);
  assert.match(result.reason, /Classifier failed closed/);
}
