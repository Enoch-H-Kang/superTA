import { resolve } from 'node:path';
import { loadConfigFromFile } from '../config/load-config.js';
import { resolveRuntimeClassifierConfig, createRuntimeClassifierProvider, classifyWithRuntimeFallback } from '../classifier/runtime.js';
import { resolveGmailAuthConfig } from './auth-config.js';
import { createGmailHttpClient } from './http-client.js';
import { normalizeGmailThread } from './thread-to-normalized.js';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { processInboundThreadAndStore } from '../orchestration/process-and-store.js';

export type LiveInboundRunnerOptions = {
  configPath: string;
  threadId: string;
  stateRoot?: string;
};

export async function runLiveInboundThread(options: LiveInboundRunnerOptions) {
  const config = await loadConfigFromFile(options.configPath);
  const gmailClient = createGmailHttpClient(fetch as any, resolveGmailAuthConfig());
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const classifierProvider = createRuntimeClassifierProvider(resolveRuntimeClassifierConfig(), fetch as any);

  const gmailThread = await gmailClient.fetchThread(options.threadId);
  const normalized = normalizeGmailThread(gmailThread);
  const result = await processInboundThreadAndStore(config, store, normalized, {
    classify: (input) => classifyWithRuntimeFallback(classifierProvider, input),
  });

  const reviewItems = await store.listReviewItems();
  const auditRecords = await store.listAuditRecords();

  return {
    ok: true,
    threadId: options.threadId,
    classifierProvider: resolveRuntimeClassifierConfig().provider,
    normalized: {
      from: normalized.from,
      to: normalized.to,
      subject: normalized.subject,
      messageId: normalized.messageId,
    },
    route: result.route,
    classification: result.classification,
    outcome: result.outcome,
    persisted: {
      reviewQueueCount: reviewItems.length,
      auditLogCount: auditRecords.length,
      latestReviewItemId: reviewItems[reviewItems.length - 1]?.id ?? null,
      latestAuditThreadId: auditRecords[auditRecords.length - 1]?.threadId ?? null,
    },
  };
}

const currentFile = new URL(import.meta.url).pathname;
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  const threadId = process.argv[2];
  const configPath = process.argv[3] ?? 'local.config.json';
  const stateRoot = process.argv[4];

  if (!threadId) {
    console.error('Usage: node dist/plugins/superta/src/gmail/live-inbound-runner.js <threadId> [configPath] [stateRoot]');
    process.exit(1);
  }

  runLiveInboundThread({
    threadId,
    configPath: resolve(process.cwd(), configPath),
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
