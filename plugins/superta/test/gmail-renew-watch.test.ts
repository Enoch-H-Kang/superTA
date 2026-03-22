import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { shouldRenewGmailWatch, renewExpiringGmailWatches } from '../src/gmail/renew-watch.js';

export async function runGmailRenewWatchTests() {
  const now = 1_700_000_000_000;
  const root = await mkdtemp(join(tmpdir(), 'superta-renew-watch-'));

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    await store.saveGmailMailboxState({
      emailAddress: 'renew@example.edu',
      historyId: '100',
      watchExpiration: String(now + 30_000),
      updatedAt: new Date(now).toISOString(),
    });
    await store.saveGmailMailboxState({
      emailAddress: 'fresh@example.edu',
      historyId: '200',
      watchExpiration: String(now + 10 * 60 * 60 * 1000),
      updatedAt: new Date(now).toISOString(),
    });

    assert.equal(
      shouldRenewGmailWatch(
        {
          emailAddress: 'renew@example.edu',
          watchExpiration: String(now + 30_000),
          updatedAt: new Date(now).toISOString(),
        },
        60_000,
        now,
      ),
      true,
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string, init?: { method?: string; body?: string }) => {
      if (String(url) === 'https://oauth2.googleapis.com/token') {
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({ access_token: 'fresh-token' });
          },
        } as any;
      }

      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({ historyId: '101', expiration: String(now + 24 * 60 * 60 * 1000) });
        },
      } as any;
    }) as any;

    try {
      process.env.GMAIL_CLIENT_ID = 'cid';
      process.env.GMAIL_CLIENT_SECRET = 'secret';
      process.env.GMAIL_REFRESH_TOKEN = 'refresh';

      const result = await renewExpiringGmailWatches(store, {
        topicName: 'projects/test/topics/gmail',
        thresholdMs: 60_000,
        now,
      });

      assert.equal(result.renewedCount, 1);
      assert.equal(result.skippedCount, 1);
      assert.equal(result.renewed[0]?.emailAddress, 'renew@example.edu');

      const renewedState = await store.getGmailMailboxState('renew@example.edu');
      assert.equal(renewedState?.historyId, '101');
      assert.equal(renewedState?.watchExpiration, String(now + 24 * 60 * 60 * 1000));
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.GMAIL_CLIENT_ID;
      delete process.env.GMAIL_CLIENT_SECRET;
      delete process.env.GMAIL_REFRESH_TOKEN;
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
