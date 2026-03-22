export type GmailEvent = {
  messageId: string;
  threadId: string;
  historyId?: string;
};

export function ingestGmailEvent(event: GmailEvent) {
  return {
    status: 'received',
    event,
  };
}
