import type { GmailThreadMessage } from './client.js';
import type { NormalizedThread } from './normalize.js';
import { isSelfAddress, resolveSelfAddresses } from './reply-helpers.js';

function pickLatestExternalMessage(messages: GmailThreadMessage[], selfAddresses: string[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index];
    if (candidate && !isSelfAddress(candidate.from, selfAddresses)) {
      return candidate;
    }
  }
  return messages[messages.length - 1];
}

export function normalizeGmailThread(messages: GmailThreadMessage[]): NormalizedThread {
  if (messages.length === 0) {
    throw new Error('Cannot normalize an empty Gmail thread.');
  }

  const selfAddresses = resolveSelfAddresses();
  const latest = pickLatestExternalMessage(messages, selfAddresses);
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
