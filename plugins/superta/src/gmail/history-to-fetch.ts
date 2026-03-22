import type { GmailHistoryResponse } from './history-client.js';

export type GmailFetchTarget = {
  threadId: string;
  messageId?: string;
};

export function extractFetchTargetsFromHistory(response: GmailHistoryResponse): GmailFetchTarget[] {
  const seen = new Set<string>();
  const targets: GmailFetchTarget[] = [];

  for (const entry of response.history ?? []) {
    for (const added of entry.messagesAdded ?? []) {
      const threadId = added.message?.threadId;
      const messageId = added.message?.id;
      if (!threadId || seen.has(threadId)) continue;
      seen.add(threadId);
      targets.push({ threadId, messageId });
    }
  }

  return targets;
}
