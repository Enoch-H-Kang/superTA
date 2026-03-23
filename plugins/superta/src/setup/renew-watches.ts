import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { renewExpiringGmailWatches } from '../gmail/renew-watch.js';
import { resolveProductionEnv } from './production-env.js';

export type RenewWatchesCommandOptions = {
  stateRoot?: string;
  thresholdMs?: number;
  emailAddress?: string;
  labelIds?: string[];
  labelFilterAction?: 'include' | 'exclude';
  now?: number;
};

export async function runRenewWatchesCommand(options: RenewWatchesCommandOptions = {}) {
  const stateRoot = options.stateRoot ?? process.cwd();
  const production = resolveProductionEnv();
  if (!production.gmailPubsubTopic) {
    throw new Error('GMAIL_PUBSUB_TOPIC is required to renew Gmail watches.');
  }

  const store = createFileStore(defaultFileStorePaths(stateRoot));
  return renewExpiringGmailWatches(store, {
    topicName: production.gmailPubsubTopic,
    thresholdMs: options.thresholdMs,
    emailAddress: options.emailAddress,
    labelIds: options.labelIds,
    labelFilterAction: options.labelFilterAction,
    now: options.now,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const thresholdMs = Number(process.argv[3] ?? `${1000 * 60 * 60}`);
  const emailAddress = process.argv[4];

  runRenewWatchesCommand({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    thresholdMs,
    emailAddress,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
