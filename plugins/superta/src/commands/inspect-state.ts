import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';

export type InspectStateOptions = {
  stateRoot?: string;
  limit?: number;
};

export async function inspectSuperTAState(options: InspectStateOptions = {}) {
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const limit = options.limit ?? 10;

  const [reviewItems, outboundActions, mailboxes, audits] = await Promise.all([
    store.listReviewItems(),
    store.listOutboundActionRecords(),
    store.listGmailMailboxStates(),
    store.listAuditRecords(),
  ]);

  return {
    ok: true,
    reviewQueue: {
      count: reviewItems.length,
      pending: reviewItems.filter((item) => item.status === 'pending').length,
      approved: reviewItems.filter((item) => item.status === 'approved').length,
      sent: reviewItems.filter((item) => item.status === 'sent').length,
      recent: reviewItems.slice(-limit),
    },
    outboundActions: {
      count: outboundActions.length,
      recent: outboundActions.slice(-limit),
    },
    gmailMailboxes: {
      count: mailboxes.length,
      entries: mailboxes.slice(-limit),
    },
    auditLog: {
      count: audits.length,
      recent: audits.slice(-limit),
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const limit = Number(process.argv[3] ?? '10');

  inspectSuperTAState({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    limit,
  })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
