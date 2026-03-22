import assert from 'node:assert/strict';
import { extractFetchTargetsFromHistory } from '../src/gmail/history-to-fetch.js';
import { createMockGmailHistoryClient } from '../src/gmail/history-client.js';
import { deriveFetchTargetsFromWebhook } from '../src/gmail/webhook-to-fetch.js';

export async function runGmailHistoryTests() {
  const history = {
    history: [
      {
        id: '1',
        messagesAdded: [
          { message: { id: 'm1', threadId: 't1' } },
          { message: { id: 'm2', threadId: 't2' } },
        ],
      },
      {
        id: '2',
        messagesAdded: [
          { message: { id: 'm3', threadId: 't1' } },
        ],
      },
    ],
    historyId: '2',
  };

  const targets = extractFetchTargetsFromHistory(history);
  assert.equal(targets.length, 2);
  assert.deepEqual(targets[0], { threadId: 't1', messageId: 'm1' });
  assert.deepEqual(targets[1], { threadId: 't2', messageId: 'm2' });

  const client = createMockGmailHistoryClient(history);
  const derived = await deriveFetchTargetsFromWebhook(client, {
    emailAddress: 'prof@example.edu',
    historyId: '2',
    receivedAt: new Date().toISOString(),
  });
  assert.equal(derived.length, 2);
}
