export type GmailThreadMessage = {
  threadId: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  bodyText: string;
};

export type GmailDraftRequest = {
  to: string[];
  subject: string;
  body: string;
};

export type GmailSendRequest = GmailDraftRequest & {
  threadId?: string;
};

export type GmailForwardRequest = {
  threadId: string;
  to: string[];
  note?: string;
};

export type GmailLabelRequest = {
  threadId: string;
  labels: string[];
};

export type GmailClient = {
  fetchThread: (threadId: string) => Promise<GmailThreadMessage[]>;
  createDraft: (request: GmailDraftRequest) => Promise<{ id: string; status: 'drafted' }>;
  sendMessage: (request: GmailSendRequest) => Promise<{ id: string; status: 'sent' }>;
  forwardThread: (request: GmailForwardRequest) => Promise<{ id: string; status: 'forwarded' }>;
  labelThread: (request: GmailLabelRequest) => Promise<{ threadId: string; status: 'labeled'; labels: string[] }>;
};

export function createMockGmailClient(): GmailClient {
  return {
    async fetchThread(threadId) {
      return [
        {
          threadId,
          messageId: 'mock-message-1',
          from: 'student@example.edu',
          to: ['course@example.edu'],
          subject: 'Mock subject',
          bodyText: 'Mock body',
        },
      ];
    },
    async createDraft() {
      return { id: 'draft-1', status: 'drafted' };
    },
    async sendMessage() {
      return { id: 'sent-1', status: 'sent' };
    },
    async forwardThread() {
      return { id: 'forward-1', status: 'forwarded' };
    },
    async labelThread(request) {
      return { threadId: request.threadId, status: 'labeled', labels: request.labels };
    },
  };
}
