import assert from 'node:assert/strict';
import { normalizeGmailThread } from '../src/gmail/thread-to-normalized.js';

export function runThreadToNormalizedTests() {
  const normalized = normalizeGmailThread([
    {
      threadId: 't1',
      messageId: 'm1',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Question',
      bodyText: 'First',
      inReplyTo: 'orig-0',
      references: ['orig-0'],
    },
    {
      threadId: 't1',
      messageId: 'm2',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Question',
      bodyText: 'Latest',
      inReplyTo: 'm1',
      references: ['orig-0', 'm1'],
    },
  ]);

  assert.equal(normalized.threadId, 't1');
  assert.equal(normalized.messageId, 'm2');
  assert.equal(normalized.bodyText, 'Latest');
  assert.equal(normalized.inReplyTo, 'm1');
  assert.deepEqual(normalized.references, ['orig-0', 'm1']);

  assert.throws(() => normalizeGmailThread([]), /empty Gmail thread/);
}
