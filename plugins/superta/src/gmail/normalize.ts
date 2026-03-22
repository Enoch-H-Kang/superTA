export type NormalizedThread = {
  threadId: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  bodyText: string;
  attachments: Array<{ name: string; mimeType?: string }>;
  courseHint?: string;
  isProfessorCommand: boolean;
  inReplyTo?: string;
  references?: string[];
};

export function normalizeThread(input: Partial<NormalizedThread>): NormalizedThread {
  return {
    threadId: input.threadId ?? '',
    messageId: input.messageId ?? '',
    from: input.from ?? '',
    to: input.to ?? [],
    subject: input.subject ?? '',
    bodyText: input.bodyText ?? '',
    attachments: input.attachments ?? [],
    courseHint: input.courseHint,
    isProfessorCommand: input.isProfessorCommand ?? false,
    inReplyTo: input.inReplyTo,
    references: input.references ?? [],
  };
}
