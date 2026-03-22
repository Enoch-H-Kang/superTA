import assert from 'node:assert/strict';
import { parseGmailWebhookEnvelope } from '../src/gmail/webhook.js';
import { handleGmailWebhookBody } from '../src/gmail/webhook-handler.js';

function encode(obj: unknown) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

export async function runGmailWebhookTests() {
  const parsed = parseGmailWebhookEnvelope({
    message: {
      data: encode({ emailAddress: 'prof@example.edu', historyId: '12345' }),
    },
  });
  assert.equal(parsed.emailAddress, 'prof@example.edu');
  assert.equal(parsed.historyId, '12345');

  const handled = await handleGmailWebhookBody(
    JSON.stringify({
      message: {
        data: encode({ emailAddress: 'prof@example.edu', historyId: '67890' }),
      },
    }),
  );
  assert.equal(handled.emailAddress, 'prof@example.edu');
  assert.equal(handled.historyId, '67890');
  assert.ok(handled.receivedAt);

  await assert.rejects(() => handleGmailWebhookBody(''), /Empty webhook body/);
}
