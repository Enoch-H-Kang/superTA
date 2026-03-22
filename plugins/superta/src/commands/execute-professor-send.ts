import type { SuperTAStore } from '../storage/store.js';
import type { GmailClient } from '../gmail/client.js';
import { sendApprovedReviewItem } from '../gmail/executor.js';
import { updateReviewStatus } from '../actions/review-queue.js';

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

  const sent = await sendApprovedReviewItem(gmailClient, item, item.replyTo);
  const updated = updateReviewStatus(item, 'sent');
  await store.saveReviewItem(updated);

  return {
    type: 'send',
    ok: true,
    reviewItemId,
    messageId: sent.id,
    recipients: item.replyTo,
    reason: 'Approved review item sent to preserved recipients and persisted.',
  };
}
