import assert from 'node:assert/strict';
import { normalizeGmailThread } from '../src/gmail/thread-to-normalized.js';

export function runThreadToNormalizedTests() {
  const originalAccountEmail = process.env.GMAIL_ACCOUNT_EMAIL;

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

  process.env.GMAIL_ACCOUNT_EMAIL = 'prof@example.edu';
  const externalPreferred = normalizeGmailThread([
    {
      threadId: 't2',
      messageId: 'm10',
      from: 'student@example.edu',
      to: ['prof@example.edu'],
      subject: 'Re: Question',
      bodyText: 'Student message',
      inReplyTo: 'm9',
      references: ['m9'],
    },
    {
      threadId: 't2',
      messageId: 'm11',
      from: 'Prof <prof@example.edu>',
      to: ['student@example.edu'],
      subject: 'Re: Question',
      bodyText: 'Professor draft',
      inReplyTo: 'm10',
      references: ['m9', 'm10'],
    },
  ]);
  assert.equal(externalPreferred.messageId, 'm10');
  assert.equal(externalPreferred.from, 'student@example.edu');

  if (originalAccountEmail === undefined) {
    delete process.env.GMAIL_ACCOUNT_EMAIL;
  } else {
    process.env.GMAIL_ACCOUNT_EMAIL = originalAccountEmail;
  }

  assert.throws(() => normalizeGmailThread([]), /empty Gmail thread/);
}
