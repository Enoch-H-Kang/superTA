import { resolveGmailAuthConfig } from './auth-config.js';
import { createGmailHttpClient } from './http-client.js';

export async function runLiveGmailSmokeTest(threadId: string) {
  const client = createGmailHttpClient(fetch as any, resolveGmailAuthConfig());
  const thread = await client.fetchThread(threadId);

  return {
    ok: true,
    threadId,
    messageCount: thread.length,
    latestMessageId: thread[thread.length - 1]?.messageId ?? null,
    latestSubject: thread[thread.length - 1]?.subject ?? null,
    latestFrom: thread[thread.length - 1]?.from ?? null,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const threadId = process.argv[2];
  if (!threadId) {
    console.error('Usage: node dist/plugins/superta/src/gmail/live-smoke-test.js <threadId>');
    process.exit(1);
  }

  runLiveGmailSmokeTest(threadId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
