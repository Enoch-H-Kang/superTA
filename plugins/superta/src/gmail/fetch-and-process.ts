import type { GmailClient } from './client.js';
import type { ClassifierProvider } from '../classifier/provider.js';
import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import type { GmailFetchTarget } from './history-to-fetch.js';
import { normalizeGmailThread } from './thread-to-normalized.js';
import { processInboundThreadWithClassifier } from '../orchestration/process-with-classifier.js';

export async function fetchAndProcessThreadTarget(
  config: SuperTAConfig,
  store: SuperTAStore,
  gmailClient: GmailClient,
  classifier: ClassifierProvider,
  target: GmailFetchTarget,
) {
  const thread = await gmailClient.fetchThread(target.threadId);
  const normalized = normalizeGmailThread(thread);
  return processInboundThreadWithClassifier(config, store, classifier, normalized);
}
