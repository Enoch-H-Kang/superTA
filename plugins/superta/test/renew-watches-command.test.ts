import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { runRenewWatchesCommand } from '../src/setup/renew-watches.js';
import { formatRenewWatchesReport } from '../src/setup/renew-watches-report.js';

export async function runRenewWatchesCommandTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-renew-command-'));
  const now = 1_700_000_000_000;

  const originalTopic = process.env.GMAIL_PUBSUB_TOPIC;
  const originalFetch = globalThis.fetch;
  const originalClientId = process.env.GMAIL_CLIENT_ID;
  const originalClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const originalRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  try {
    const store = createFileStore(defaultFileStorePaths(root));
    await store.saveGmailMailboxState({
      emailAddress: 'renew@example.edu',
      historyId: '100',
      watchExpiration: String(now + 30_000),
      updatedAt: new Date(now).toISOString(),
    });

    process.env.GMAIL_PUBSUB_TOPIC = 'projects/demo/topics/gmail';
    process.env.GMAIL_CLIENT_ID = 'cid';
    process.env.GMAIL_CLIENT_SECRET = 'secret';
    process.env.GMAIL_REFRESH_TOKEN = 'refresh';

    globalThis.fetch = (async (url: string) => {
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
          return JSON.stringify({ historyId: '101', expiration: String(now + 86_400_000) });
        },
      } as any;
    }) as any;

    const result = await runRenewWatchesCommand({ stateRoot: root, thresholdMs: 60_000, now });
    assert.equal(result.renewedCount, 1);
    const report = formatRenewWatchesReport(result);
    assert.match(report, /Watch renewal: OK/);
    assert.match(report, /renew@example.edu/);
  } finally {
    if (originalTopic === undefined) delete process.env.GMAIL_PUBSUB_TOPIC; else process.env.GMAIL_PUBSUB_TOPIC = originalTopic;
    if (originalClientId === undefined) delete process.env.GMAIL_CLIENT_ID; else process.env.GMAIL_CLIENT_ID = originalClientId;
    if (originalClientSecret === undefined) delete process.env.GMAIL_CLIENT_SECRET; else process.env.GMAIL_CLIENT_SECRET = originalClientSecret;
    if (originalRefreshToken === undefined) delete process.env.GMAIL_REFRESH_TOKEN; else process.env.GMAIL_REFRESH_TOKEN = originalRefreshToken;
    globalThis.fetch = originalFetch;
    await rm(root, { recursive: true, force: true });
  }
}
