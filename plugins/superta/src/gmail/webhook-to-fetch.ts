import type { GmailHistoryClient } from './history-client.js';
import type { GmailWebhookEvent } from './webhook-handler.js';
import { extractFetchTargetsFromHistory, type GmailFetchTarget } from './history-to-fetch.js';

export async function deriveFetchTargetsFromWebhook(
  client: GmailHistoryClient,
  event: GmailWebhookEvent,
): Promise<GmailFetchTarget[]> {
  const history = await client.listHistory({
    emailAddress: event.emailAddress,
    startHistoryId: event.historyId,
  });

  return extractFetchTargetsFromHistory(history);
}
