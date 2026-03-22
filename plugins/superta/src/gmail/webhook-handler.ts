import { parseGmailWebhookEnvelope, type GmailWebhookEnvelope } from './webhook.js';

export type GmailWebhookEvent = {
  emailAddress?: string;
  historyId?: string;
  receivedAt: string;
};

export async function handleGmailWebhookBody(rawBody: string): Promise<GmailWebhookEvent> {
  if (!rawBody.trim()) {
    throw new Error('Empty webhook body.');
  }

  const envelope = JSON.parse(rawBody) as GmailWebhookEnvelope;
  const parsed = parseGmailWebhookEnvelope(envelope);

  return {
    emailAddress: parsed.emailAddress,
    historyId: parsed.historyId,
    receivedAt: new Date().toISOString(),
  };
}
