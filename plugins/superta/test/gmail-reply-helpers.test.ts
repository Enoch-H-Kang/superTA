import assert from 'node:assert/strict';
import { extractEmailAddress, filterReplyRecipients, isSelfAddress, normalizeReplySubject, resolveSelfAddresses } from '../src/gmail/reply-helpers.js';

export function runGmailReplyHelpersTests() {
  assert.equal(extractEmailAddress('User <person@example.edu>'), 'person@example.edu');
  assert.equal(extractEmailAddress('person@example.edu'), 'person@example.edu');

  const selfAddresses = resolveSelfAddresses({
    GMAIL_ACCOUNT_EMAIL: 'prof@example.edu',
    GMAIL_ACCOUNT_ALIASES: 'alias@example.edu, Prof <second@example.edu>',
  });
  assert.deepEqual(selfAddresses, ['prof@example.edu', 'alias@example.edu', 'second@example.edu']);
  assert.equal(isSelfAddress('Prof <prof@example.edu>', selfAddresses), true);
  assert.equal(isSelfAddress('student@example.edu', selfAddresses), false);

  assert.equal(normalizeReplySubject('Question'), 'Re: Question');
  assert.equal(normalizeReplySubject('Re: Question'), 'Re: Question');
  assert.equal(normalizeReplySubject('re: Question'), 're: Question');

  assert.deepEqual(
    filterReplyRecipients(
      ['student@example.edu', 'Prof <prof@example.edu>', 'student@example.edu', 'ta@example.edu'],
      ['prof@example.edu'],
    ),
    ['student@example.edu', 'ta@example.edu'],
  );
}
