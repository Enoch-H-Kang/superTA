import { resolve } from 'node:path';
import { validateSuperTASetup, type ValidationIssue } from './validate-setup.js';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { resolveGmailAuthConfig } from '../gmail/auth-config.js';
import { shouldRenewGmailWatch } from '../gmail/renew-watch.js';
import { resolveProductionEnv } from './production-env.js';

export type DoctorOptions = {
  configPath: string;
  stateRoot?: string;
  now?: number;
  watchThresholdMs?: number;
};

export async function runSuperTADoctor(options: DoctorOptions) {
  const validation = await validateSuperTASetup(options.configPath);
  const stateRoot = options.stateRoot ?? process.cwd();
  const store = createFileStore(defaultFileStorePaths(stateRoot));
  const auth = resolveGmailAuthConfig();
  const production = resolveProductionEnv();
  const now = options.now ?? Date.now();
  const watchThresholdMs = options.watchThresholdMs ?? 1000 * 60 * 60;

  const [mailboxes, reviewItems, outboundActions, audits] = await Promise.all([
    store.listGmailMailboxStates(),
    store.listReviewItems(),
    store.listOutboundActionRecords(),
    store.listAuditRecords(),
  ]);

  const issues: ValidationIssue[] = [...validation.issues];

  if (!auth.accessToken && !(auth.clientId && auth.clientSecret && auth.refreshToken)) {
    issues.push({
      level: production.productionMode ? 'error' : 'warning',
      message:
        'Gmail auth env is incomplete. Provide GMAIL_ACCESS_TOKEN or the OAuth refresh-token trio. Suggested fix: export GMAIL_ACCESS_TOKEN=... for quick testing, or set GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET/GMAIL_REFRESH_TOKEN for sustainable auth.',
    });
  }

  if (!production.publicBaseUrl) {
    issues.push({
      level: production.productionMode ? 'error' : 'warning',
      message: 'SUPERTA_PUBLIC_BASE_URL is missing. Suggested fix: set SUPERTA_PUBLIC_BASE_URL to the deployed HTTPS base URL for webhook operations.',
    });
  }

  if (!production.gmailPubsubTopic) {
    issues.push({
      level: production.productionMode ? 'error' : 'warning',
      message: 'GMAIL_PUBSUB_TOPIC is missing. Suggested fix: set GMAIL_PUBSUB_TOPIC to your production Pub/Sub topic name.',
    });
  }

  if (mailboxes.length === 0) {
    issues.push({
      level: production.productionMode ? 'error' : 'warning',
      message: 'No Gmail mailbox watch state recorded yet. Suggested fix: run register-watch.js after Gmail auth is working.',
    });
  }

  for (const mailbox of mailboxes) {
    if (shouldRenewGmailWatch(mailbox, watchThresholdMs, now)) {
      issues.push({
        level: production.productionMode ? 'error' : 'warning',
        message: `Mailbox watch is missing or nearing expiration for ${mailbox.emailAddress}. Suggested fix: renew the watch or rerun register-watch.js for this mailbox.`,
      });
    }
  }

  return {
    ok: !issues.some((issue) => issue.level === 'error'),
    summary: {
      courseCount: validation.courseCount,
      reviewQueueCount: reviewItems.length,
      outboundActionCount: outboundActions.length,
      auditCount: audits.length,
      mailboxCount: mailboxes.length,
      pendingReviewCount: reviewItems.filter((item) => item.status === 'pending').length,
    },
    auth: {
      hasAccessToken: Boolean(auth.accessToken),
      hasRefreshConfig: Boolean(auth.clientId && auth.clientSecret && auth.refreshToken),
      apiBaseUrl: auth.apiBaseUrl,
    },
    production,
    issues,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'local.config.json';
  const stateRoot = process.argv[3];
  const watchThresholdMs = Number(process.argv[4] ?? `${1000 * 60 * 60}`);

  runSuperTADoctor({
    configPath,
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    watchThresholdMs,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
