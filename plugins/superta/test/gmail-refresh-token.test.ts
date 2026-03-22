import assert from 'node:assert/strict';
import { refreshGmailAccessToken } from '../src/gmail/refresh-token.js';

export async function runGmailRefreshTokenTests() {
  const token = await refreshGmailAccessToken(
    async (url, init) => {
      assert.equal(url, 'https://oauth2.googleapis.com/token');
      assert.equal(init?.method, 'POST');
      assert.match(init?.body ?? '', /grant_type=refresh_token/);
      assert.match(init?.body ?? '', /client_id=cid/);
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({ access_token: 'refreshed-token', expires_in: 3600, token_type: 'Bearer' });
        },
      };
    },
    {
      clientId: 'cid',
      clientSecret: 'secret',
      refreshToken: 'refresh',
    },
  );
  assert.equal(token, 'refreshed-token');

  await assert.rejects(
    () => refreshGmailAccessToken(async () => ({ ok: true, status: 200, async text() { return '{}'; } }), { clientId: 'cid', clientSecret: 'secret', refreshToken: 'refresh' }),
    /did not include access_token/,
  );

  await assert.rejects(
    () => refreshGmailAccessToken(async () => ({ ok: false, status: 401, async text() { return 'nope'; } }), { clientId: 'cid', clientSecret: 'secret', refreshToken: 'refresh' }),
    /Gmail token refresh failed/,
  );

  await assert.rejects(
    () => refreshGmailAccessToken(async () => ({ ok: true, status: 200, async text() { return '{}'; } }), {}),
    /Missing Gmail auth configuration/,
  );
}
