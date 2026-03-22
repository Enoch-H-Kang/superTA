import type { GmailHistoryClient } from './history-client.js';
import type { GmailClient } from './client.js';
import type { GmailWebhookEvent } from './webhook-handler.js';
import type { ClassifierProvider } from '../classifier/provider.js';
import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import { deriveFetchTargetsFromWebhook } from './webhook-to-fetch.js';
import { fetchAndProcessThreadTarget } from './fetch-and-process.js';

function buildEventCheckpointKey(event: GmailWebhookEvent) {
  return `${event.emailAddress ?? 'unknown-email'}:${event.historyId ?? 'unknown-history'}`;
}

export async function processWebhookEventIntoPipeline(
  config: SuperTAConfig,
  store: SuperTAStore,
  historyClient: GmailHistoryClient,
  gmailClient: GmailClient,
  classifier: ClassifierProvider,
  event: GmailWebhookEvent,
) {
  const checkpointKey = buildEventCheckpointKey(event);
  if (await store.hasProcessedGmailEvent(checkpointKey)) {
    return {
      skipped: true,
      checkpointKey,
      results: [],
    };
  }

  const targets = await deriveFetchTargetsFromWebhook(historyClient, event);
  const results = [];

  for (const target of targets) {
    const result = await fetchAndProcessThreadTarget(config, store, gmailClient, classifier, target);
    results.push({ target, result });
  }

  if (event.emailAddress) {
    const prior = await store.getGmailMailboxState(event.emailAddress);
    await store.saveGmailMailboxState({
      emailAddress: event.emailAddress,
      historyId: event.historyId ?? prior?.historyId,
      watchExpiration: prior?.watchExpiration,
      updatedAt: new Date().toISOString(),
    });
  }

  await store.markProcessedGmailEvent(checkpointKey);

  return {
    skipped: false,
    checkpointKey,
    results,
  };
}
