import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { shouldRenewGmailWatch } from '../gmail/renew-watch.js';

export type ListExpiringMailboxesOptions = {
  stateRoot?: string;
  thresholdMs?: number;
  now?: number;
};

export async function listExpiringMailboxesCommand(options: ListExpiringMailboxesOptions = {}) {
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const thresholdMs = options.thresholdMs ?? 1000 * 60 * 60;
  const now = options.now ?? Date.now();
  const mailboxes = await store.listGmailMailboxStates();
  const expiring = mailboxes.filter((state) => shouldRenewGmailWatch(state, thresholdMs, now));

  return {
    ok: true,
    count: expiring.length,
    entries: expiring,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const thresholdMs = Number(process.argv[3] ?? `${1000 * 60 * 60}`);

  listExpiringMailboxesCommand({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    thresholdMs,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
