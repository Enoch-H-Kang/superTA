import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { resolveGmailAuthConfig } from '../gmail/auth-config.js';
import { createGmailHttpClient } from '../gmail/http-client.js';
import { draftFromReviewItem } from '../gmail/executor.js';

export type RuntimeDraftOptions = {
  stateRoot?: string;
  reviewItemId: string;
};

export async function runRuntimeDraft(options: RuntimeDraftOptions) {
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const item = await store.getReviewItem(options.reviewItemId);
  if (!item) {
    return {
      ok: false,
      reviewItemId: options.reviewItemId,
      reason: 'Review item not found.',
    };
  }

  const gmailClient = createGmailHttpClient(fetch as any, resolveGmailAuthConfig());
  const drafted = await draftFromReviewItem(gmailClient, item);
  await store.appendOutboundActionRecord({
    type: 'draft',
    reviewItemId: item.id,
    threadId: item.threadId,
    messageId: drafted.id,
    recipients: item.replyTo,
    subject: item.draftSubject,
    recordedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    reviewItemId: item.id,
    draftId: drafted.id,
    recipients: item.replyTo,
    reason: 'Draft created and outbound action recorded.',
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const reviewItemId = process.argv[2];
  const stateRoot = process.argv[3];

  if (!reviewItemId) {
    console.error('Usage: node dist/plugins/superta/src/commands/runtime-draft-send.js <reviewItemId> [stateRoot]');
    process.exit(1);
  }

  runRuntimeDraft({
    reviewItemId,
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
  })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
