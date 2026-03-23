import type { SuperTAStore } from '../storage/store.js';
import type { GmailClient } from '../gmail/client.js';
import { sendApprovedReviewItem } from '../gmail/executor.js';
import { updateReviewStatus } from '../actions/review-queue.js';
import { filterReplyRecipients, resolveSelfAddresses } from '../gmail/reply-helpers.js';

export type ProfessorSendResult =
  | { type: 'send'; ok: true; reviewItemId: string; messageId: string; recipients: string[]; reason: string }
  | { type: 'send'; ok: false; reviewItemId: string; reason: string };

export async function executeApprovedSend(
  store: SuperTAStore,
  gmailClient: GmailClient,
  reviewItemId: string,
): Promise<ProfessorSendResult> {
  const item = await store.getReviewItem(reviewItemId);
  if (!item) {
    return {
      type: 'send',
      ok: false,
      reviewItemId,
      reason: 'Review item not found.',
    };
  }

  if (item.status !== 'approved') {
    return {
      type: 'send',
      ok: false,
      reviewItemId,
      reason: 'Only approved review items may be sent.',
    };
  }

  if (!item.replyTo.length) {
    return {
      type: 'send',
      ok: false,
      reviewItemId,
      reason: 'No reply recipients preserved on the review item.',
    };
  }

  const recipients = filterReplyRecipients(item.replyTo, resolveSelfAddresses());
  const finalRecipients = recipients.length > 0 ? recipients : item.replyTo;
  const sent = await sendApprovedReviewItem(gmailClient, item, finalRecipients);
  const updated = updateReviewStatus(item, 'sent');
  await store.saveReviewItem(updated);
  await store.appendOutboundActionRecord({
    type: 'send',
    reviewItemId,
    threadId: item.threadId,
    messageId: sent.id,
    recipients: finalRecipients,
    subject: item.draftSubject,
    recordedAt: new Date().toISOString(),
  });

  return {
    type: 'send',
    ok: true,
    reviewItemId,
    messageId: sent.id,
    recipients: finalRecipients,
    reason: 'Approved review item sent to filtered recipients and persisted.',
  };
}
