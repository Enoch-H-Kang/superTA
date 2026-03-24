import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { loadConfigFromFile } from '../config/load-config.js';
import { redactAuditRecord, redactOutboundActionRecord, redactReviewQueueItem, redactStudentCaseEvent, redactStudentCaseRecord, summarizePrivacyPosture } from '../privacy.js';

export type InspectStateOptions = {
  stateRoot?: string;
  limit?: number;
  configPath?: string;
};

export async function inspectSuperTAState(options: InspectStateOptions = {}) {
  const stateRoot = options.stateRoot ?? process.cwd();
  const config = await loadConfigFromFile(options.configPath ?? resolve(stateRoot, 'local.config.json')).catch(() => null);
  const store = createFileStore(defaultFileStorePaths(stateRoot));
  const limit = options.limit ?? 10;

  const [reviewItems, outboundActions, mailboxes, audits, studentCases, studentCaseEvents] = await Promise.all([
    store.listReviewItems(),
    store.listOutboundActionRecords(),
    store.listGmailMailboxStates(),
    store.listAuditRecords(),
    store.listStudentCases(),
    store.listStudentCaseEvents(),
  ]);

  const shouldRedact = config?.privacy.redactOperatorViews ?? true;

  return {
    ok: true,
    privacy: config ? summarizePrivacyPosture(config) : null,
    reviewQueue: {
      count: reviewItems.length,
      pending: reviewItems.filter((item) => item.status === 'pending').length,
      approved: reviewItems.filter((item) => item.status === 'approved').length,
      sent: reviewItems.filter((item) => item.status === 'sent').length,
      recent: (shouldRedact ? reviewItems.map(redactReviewQueueItem) : reviewItems).slice(-limit),
    },
    outboundActions: {
      count: outboundActions.length,
      recent: (shouldRedact ? outboundActions.map(redactOutboundActionRecord) : outboundActions).slice(-limit),
    },
    gmailMailboxes: {
      count: mailboxes.length,
      entries: mailboxes.slice(-limit),
    },
    auditLog: {
      count: audits.length,
      recent: (shouldRedact ? audits.map(redactAuditRecord) : audits).slice(-limit),
    },
    studentCases: {
      count: studentCases.length,
      recent: (shouldRedact ? studentCases.map(redactStudentCaseRecord) : studentCases).slice(-limit),
    },
    studentCaseEvents: {
      count: studentCaseEvents.length,
      recent: (shouldRedact ? studentCaseEvents.map(redactStudentCaseEvent) : studentCaseEvents).slice(-limit),
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
