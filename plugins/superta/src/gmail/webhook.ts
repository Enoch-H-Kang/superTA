export type GmailWebhookEnvelope = {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
};

export type DecodedGmailPushMessage = {
  emailAddress?: string;
  historyId?: string;
};

export function decodeBase64Json<T>(input: string): T {
  const decoded = Buffer.from(input, 'base64').toString('utf8');
  return JSON.parse(decoded) as T;
}

export function parseGmailWebhookEnvelope(envelope: GmailWebhookEnvelope): DecodedGmailPushMessage {
  const data = envelope.message?.data;
  if (!data) {
    throw new Error('Missing Gmail webhook message data.');
  }

  return decodeBase64Json<DecodedGmailPushMessage>(data);
}
