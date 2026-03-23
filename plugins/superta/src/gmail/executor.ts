import type { GmailClient, GmailDraftRequest, GmailForwardRequest, GmailLabelRequest, GmailSendRequest } from './client.js';
import type { ReviewQueueItem } from '../actions/review-queue.js';
import { filterReplyRecipients, normalizeReplySubject, resolveSelfAddresses } from './reply-helpers.js';

function buildReplyRecipients(item: ReviewQueueItem) {
  const filtered = filterReplyRecipients(item.replyTo, resolveSelfAddresses());
  return filtered.length > 0 ? filtered : item.replyTo;
}

export async function draftFromReviewItem(client: GmailClient, item: ReviewQueueItem) {
  const request: GmailDraftRequest = {
    to: buildReplyRecipients(item),
    subject: normalizeReplySubject(item.draftSubject),
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
    to: filterReplyRecipients(to, resolveSelfAddresses()),
    subject: normalizeReplySubject(item.draftSubject),
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
