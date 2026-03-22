import type { GmailHistoryClient } from './history-client.js';
import type { GmailClient } from './client.js';
import type { GmailWebhookEvent } from './webhook-handler.js';
import type { ClassifierProvider } from '../classifier/provider.js';
import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import { deriveFetchTargetsFromWebhook } from './webhook-to-fetch.js';
import { fetchAndProcessThreadTarget } from './fetch-and-process.js';

export async function processWebhookEventIntoPipeline(
  config: SuperTAConfig,
  store: SuperTAStore,
  historyClient: GmailHistoryClient,
  gmailClient: GmailClient,
  classifier: ClassifierProvider,
  event: GmailWebhookEvent,
) {
  const targets = await deriveFetchTargetsFromWebhook(historyClient, event);
  const results = [];

  for (const target of targets) {
    const result = await fetchAndProcessThreadTarget(config, store, gmailClient, classifier, target);
    results.push({ target, result });
  }

  return results;
}
