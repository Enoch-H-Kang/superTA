import assert from 'node:assert/strict';
import { createStubClassifierProvider } from '../src/classifier/stub-provider.js';

export async function runStubClassifierTests() {
  const provider = createStubClassifierProvider();

  const deadline = await provider.classify({
    thread: {
      threadId: 't1',
      messageId: 'm1',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Late submission question',
      bodyText: 'Can I submit late?',
      attachments: [],
      isProfessorCommand: false,
    },
    courseId: 'cs101-sp26',
  });
  assert.equal(deadline.category, 'deadline');
  assert.equal(deadline.action, 'draft_for_professor');
  assert.deepEqual(deadline.requiredSources, ['policy']);

  const grade = await provider.classify({
    thread: {
      threadId: 't2',
      messageId: 'm2',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Question about my grade',
      bodyText: 'I think there is a mistake.',
      attachments: [],
      isProfessorCommand: false,
    },
    courseId: 'cs101-sp26',
  });
  assert.equal(grade.category, 'grade-related');
  assert.equal(grade.shouldNotifyProfessor, true);

  const unknown = await provider.classify({
    thread: {
      threadId: 't3',
      messageId: 'm3',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Hello',
      bodyText: 'Hi',
      attachments: [],
      isProfessorCommand: false,
    },
    courseId: 'cs101-sp26',
  });
  assert.equal(unknown.category, 'other');
  assert.equal(unknown.action, 'needs_more_info');
}
