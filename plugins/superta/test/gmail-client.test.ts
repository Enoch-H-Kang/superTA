import assert from 'node:assert/strict';
import { createMockGmailClient } from '../src/gmail/client.js';

export async function runGmailClientTests() {
  const client = createMockGmailClient();

  const thread = await client.fetchThread('thread-123');
  assert.equal(thread.length, 1);
  assert.equal(thread[0]?.threadId, 'thread-123');

  const draft = await client.createDraft({
    to: ['student@example.edu'],
    subject: 'Draft',
    body: 'Hello',
  });
  assert.equal(draft.status, 'drafted');

  const sent = await client.sendMessage({
    to: ['student@example.edu'],
    subject: 'Sent',
    body: 'Hello',
  });
  assert.equal(sent.status, 'sent');

  const forwarded = await client.forwardThread({
    threadId: 'thread-123',
    to: ['prof@example.edu'],
  });
  assert.equal(forwarded.status, 'forwarded');

  const labeled = await client.labelThread({
    threadId: 'thread-123',
    labels: ['needs-review'],
  });
  assert.equal(labeled.status, 'labeled');
  assert.deepEqual(labeled.labels, ['needs-review']);
}
