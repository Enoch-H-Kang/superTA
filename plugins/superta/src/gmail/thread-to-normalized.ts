import type { GmailThreadMessage } from './client.js';
import type { NormalizedThread } from './normalize.js';

export function normalizeGmailThread(messages: GmailThreadMessage[]): NormalizedThread {
  if (messages.length === 0) {
    throw new Error('Cannot normalize an empty Gmail thread.');
  }

  const latest = messages[messages.length - 1];
  if (!latest) {
    throw new Error('Missing latest Gmail thread message.');
  }

  return {
    threadId: latest.threadId,
    messageId: latest.messageId,
    from: latest.from,
    to: latest.to,
    subject: latest.subject,
    bodyText: latest.bodyText,
    attachments: [],
    isProfessorCommand: false,
    inReplyTo: latest.inReplyTo,
    references: latest.references ?? [],
  };
}
