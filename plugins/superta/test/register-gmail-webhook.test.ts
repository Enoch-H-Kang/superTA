import assert from 'node:assert/strict';
import { registerGmailWebhookRoute } from '../src/plugin/register-gmail-webhook.js';

export async function runRegisterGmailWebhookTests() {
  let registered: any;

  const api = {
    registerHttpRoute(route: unknown) {
      registered = route;
    },
  };

  let handledBody = '';
  registerGmailWebhookRoute(api, '/superta/gmail/webhook', async (rawBody) => {
    handledBody = rawBody;
  });

  assert.equal(registered.path, '/superta/gmail/webhook');
  assert.equal(registered.auth, 'plugin');
  assert.equal(registered.match, 'exact');

  let responseBody = '';
  const handled = await registered.handler(
    { body: '{"ok":true}' },
    {
      statusCode: 0,
      end(body?: string) {
        responseBody = body ?? '';
      },
    },
  );

  assert.equal(handled, true);
  assert.equal(handledBody, '{"ok":true}');
  assert.equal(responseBody, 'ok');
}
