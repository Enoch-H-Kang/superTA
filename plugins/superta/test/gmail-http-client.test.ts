import assert from 'node:assert/strict';
import { createGmailHttpClient } from '../src/gmail/http-client.js';
import { buildMimeMessage, encodeBase64Url } from '../src/gmail/mime.js';

export async function runGmailHttpClientTests() {
  const calls: Array<{ url: string; init?: any }> = [];
  const client = createGmailHttpClient(
    async (url, init) => {
      calls.push({ url, init });

      if (String(url) === 'https://oauth2.googleapis.com/token') {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ access_token: 'refreshed-token' });
          },
        };
      }

      if (String(url).includes('/threads/thread-123')) {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({
              messages: [
                {
                  id: 'm1',
                  threadId: 'thread-123',
                  snippet: 'Can I submit late?',
                  payload: {
                    headers: [
                      { name: 'From', value: 'student@example.edu' },
                      { name: 'To', value: 'cs101@school.edu' },
                      { name: 'Subject', value: 'Late question' },
                      { name: 'In-Reply-To', value: 'orig-message-id' },
                      { name: 'References', value: 'orig-message-id older-message-id' },
                    ],
                  },
                },
              ],
            });
          },
        };
      }

      if (String(url).includes('/users/me/drafts')) {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: 'draft-xyz', message: { id: 'msg-draft-xyz' } });
          },
        };
      }

      if (String(url).includes('/users/me/messages/send')) {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ id: 'sent-xyz' });
          },
        };
      }

      return {
        ok: true,
        status: 200,
        async text() {
          return '{}';
        },
      };
    },
    { accessToken: 'token', apiBaseUrl: 'https://gmail.test/v1' },
  );

  const mime = buildMimeMessage({
    to: ['student@example.edu'],
    subject: 'Re: Late question',
    body: 'Hello',
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
  });
  assert.match(mime, /^To: student@example.edu/m);
  assert.match(mime, /^Subject: Re: Late question/m);
  assert.match(mime, /^In-Reply-To: orig-message-id/m);
  assert.match(mime, /^References: orig-message-id/m);
  assert.ok(encodeBase64Url(mime).length > 0);

  const thread = await client.fetchThread('thread-123');
  assert.equal(thread.length, 1);
  assert.equal(thread[0]?.from, 'student@example.edu');
  assert.deepEqual(thread[0]?.to, ['cs101@school.edu']);
  assert.equal(thread[0]?.subject, 'Late question');
  assert.equal(thread[0]?.inReplyTo, 'orig-message-id');
  assert.deepEqual(thread[0]?.references, ['orig-message-id', 'older-message-id']);

  const draft = await client.createDraft({
    to: ['student@example.edu'],
    subject: 'Re: Late question',
    body: 'Draft',
    threadId: 'thread-123',
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
  });
  assert.equal(draft.id, 'draft-xyz');

  const sent = await client.sendMessage({
    to: ['student@example.edu'],
    subject: 'Re: Late question',
    body: 'Reply',
    threadId: 'thread-123',
    inReplyTo: 'orig-message-id',
    references: ['orig-message-id'],
  });
  assert.equal(sent.id, 'sent-xyz');

  await client.labelThread({ threadId: 'thread-123', labels: ['needs-review'] });

  const draftCall = calls.find((call) => call.url.includes('/users/me/drafts'));
  assert.ok(draftCall);
  assert.match(draftCall?.init?.body ?? '', /"message"/);
  assert.match(draftCall?.init?.body ?? '', /"raw"/);

  const sendCall = calls.find((call) => call.url.includes('/users/me/messages/send'));
  assert.ok(sendCall);
  assert.match(sendCall?.init?.body ?? '', /"raw"/);

  const oauthClient = createGmailHttpClient(
    async (url, init) => {
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
          return JSON.stringify({ messages: [] });
        },
      };
    },
    { clientId: 'cid', clientSecret: 'secret', refreshToken: 'refresh', apiBaseUrl: 'https://gmail.test/v1' },
  );

  await oauthClient.fetchThread('thread-123');

  const failingClient = createGmailHttpClient(
    async () => ({
      ok: false,
      status: 401,
      async text() {
        return 'unauthorized';
      },
    }),
    { accessToken: 'token', apiBaseUrl: 'https://gmail.test/v1' },
  );

  await assert.rejects(() => failingClient.fetchThread('thread-123'), /Gmail API request failed/);
}
