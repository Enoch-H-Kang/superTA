import assert from 'node:assert/strict';
import { assertGmailAuthConfig, resolveGmailAuthConfig } from '../src/gmail/auth-config.js';

export function runGmailAuthConfigTests() {
  const resolved = resolveGmailAuthConfig({
    GMAIL_CLIENT_ID: 'cid',
    GMAIL_CLIENT_SECRET: 'secret',
    GMAIL_REFRESH_TOKEN: 'refresh',
    GMAIL_API_BASE_URL: 'https://example.test',
  });
  assert.equal(resolved.clientId, 'cid');
  assert.equal(resolved.apiBaseUrl, 'https://example.test');

  const accessTokenOnly = assertGmailAuthConfig({ accessToken: 'token' });
  assert.equal(accessTokenOnly.accessToken, 'token');

  const oauthSet = assertGmailAuthConfig({
    clientId: 'cid',
    clientSecret: 'secret',
    refreshToken: 'refresh',
  });
  assert.equal(oauthSet.clientId, 'cid');

  assert.throws(() => assertGmailAuthConfig({}), /Missing Gmail auth configuration/);
}
