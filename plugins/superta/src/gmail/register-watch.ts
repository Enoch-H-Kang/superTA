import { resolve } from 'node:path';
import { resolveGmailAuthConfig } from './auth-config.js';
import { createGmailWatchClient } from './watch-client.js';
import type { SuperTAStore } from '../storage/store.js';

export type RegisterGmailWatchOptions = {
  topicName: string;
  emailAddress?: string;
  labelIds?: string[];
  labelFilterAction?: 'include' | 'exclude';
};

export async function registerGmailWatch(options: RegisterGmailWatchOptions, store?: SuperTAStore) {
  const client = createGmailWatchClient(fetch as any, resolveGmailAuthConfig());
  const result = await client.watch(options);

  if (store && options.emailAddress) {
    await store.saveGmailMailboxState({
      emailAddress: options.emailAddress,
      historyId: result.historyId,
      watchExpiration: result.expiration,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    ok: true,
    topicName: options.topicName,
    emailAddress: options.emailAddress ?? null,
    historyId: result.historyId ?? null,
    expiration: result.expiration ?? null,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const topicName = process.argv[2];
  const emailAddress = process.argv[3];
  const labelFilterAction = (process.argv[4] as 'include' | 'exclude' | undefined) ?? 'include';
  const labelIds = process.argv.slice(5);

  if (!topicName) {
    console.error('Usage: node dist/plugins/superta/src/gmail/register-watch.js <topicName> [emailAddress] [include|exclude] [labelId ...]');
    process.exit(1);
  }

  registerGmailWatch({
    topicName,
    emailAddress,
    labelFilterAction,
    labelIds: labelIds.length > 0 ? labelIds : undefined,
  })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
