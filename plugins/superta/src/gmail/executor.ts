import type { GmailClient, GmailDraftRequest, GmailForwardRequest, GmailLabelRequest, GmailSendRequest } from './client.js';
import type { ReviewQueueItem } from '../actions/review-queue.js';

export async function draftFromReviewItem(client: GmailClient, item: ReviewQueueItem) {
  const request: GmailDraftRequest = {
    to: item.replyTo,
    subject: item.draftSubject,
    body: item.draftBody,
    threadId: item.threadId,
    inReplyTo: item.inReplyTo,
    references: item.references,
  };

  return client.createDraft(request);
}

export async function sendApprovedReviewItem(client: GmailClient, item: ReviewQueueItem, to: string[]) {
  if (item.status !== 'approved') {
    throw new Error('Only approved review items may be sent.');
  }

  const request: GmailSendRequest = {
    to,
    subject: item.draftSubject,
    body: item.draftBody,
    threadId: item.threadId,
    inReplyTo: item.inReplyTo,
    references: item.references,
  };

  return client.sendMessage(request);
}

export async function forwardReviewThread(client: GmailClient, item: ReviewQueueItem, to: string[], note?: string) {
  const request: GmailForwardRequest = {
    threadId: item.threadId,
    to,
    note,
  };

  return client.forwardThread(request);
}

export async function labelReviewThread(client: GmailClient, item: ReviewQueueItem, labels: string[]) {
  const request: GmailLabelRequest = {
    threadId: item.threadId,
    labels,
  };

  return client.labelThread(request);
}
