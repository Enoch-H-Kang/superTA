import { resolveGmailAuthConfig } from './auth-config.js';
import { createGmailHttpClient } from './http-client.js';
import { normalizeGmailThread } from './thread-to-normalized.js';

export async function runLiveGmailDraftSmokeTest(threadId: string) {
  const client = createGmailHttpClient(fetch as any, resolveGmailAuthConfig());
  const thread = await client.fetchThread(threadId);
  const normalized = normalizeGmailThread(thread);

  const draft = await client.createDraft({
    to: [normalized.from],
    subject: `Re: ${normalized.subject}`,
    body: `Hi,\n\nThis is a SuperTA live draft smoke test reply for thread ${threadId}.\n\nBest,\nSuperTA`,
    threadId: normalized.threadId,
    inReplyTo: normalized.inReplyTo ?? normalized.messageId,
    references: normalized.references,
  });

  return {
    ok: true,
    threadId,
    draftId: draft.id,
    replyTo: normalized.from,
    subject: `Re: ${normalized.subject}`,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const threadId = process.argv[2];
  if (!threadId) {
    console.error('Usage: node dist/plugins/superta/src/gmail/live-draft-smoke-test.js <threadId>');
    process.exit(1);
  }

  runLiveGmailDraftSmokeTest(threadId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
