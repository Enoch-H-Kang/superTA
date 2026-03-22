import assert from 'node:assert/strict';
import { createGmailWatchClient } from '../src/gmail/watch-client.js';

export async function runGmailWatchClientTests() {
  const calls: Array<{ url: string; init?: any }> = [];

  const client = createGmailWatchClient(
    async (url, init) => {
      calls.push({ url: String(url), init });

      if (String(url) === 'https://oauth2.googleapis.com/token') {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ access_token: 'fresh-token' });
          },
        };
      }

      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({ historyId: '12345', expiration: '9999999999999' });
        },
      };
    },
    {
      clientId: 'cid',
      clientSecret: 'secret',
      refreshToken: 'refresh',
      apiBaseUrl: 'https://gmail.test/v1',
    },
  );

  const result = await client.watch({
    topicName: 'projects/test/topics/gmail',
    labelFilterAction: 'include',
    labelIds: ['INBOX'],
  });

  assert.equal(result.historyId, '12345');
  assert.equal(result.expiration, '9999999999999');

  const watchCall = calls.find((call) => call.url.includes('/users/me/watch'));
  assert.ok(watchCall);
  assert.equal(watchCall?.init?.method, 'POST');
  assert.match(watchCall?.init?.body ?? '', /projects\/test\/topics\/gmail/);
  assert.match(watchCall?.init?.body ?? '', /INBOX/);

  const failingClient = createGmailWatchClient(
    async () => ({
      ok: false,
      status: 400,
      async text() {
        return 'bad request';
      },
    }),
    { accessToken: 'token', apiBaseUrl: 'https://gmail.test/v1' },
  );

  await assert.rejects(() => failingClient.watch({ topicName: 'projects/test/topics/gmail' }), /Gmail watch registration failed/);
}
