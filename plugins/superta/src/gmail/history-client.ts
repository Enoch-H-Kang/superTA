export type GmailHistoryEntry = {
  id: string;
  messagesAdded?: Array<{
    message?: {
      id?: string;
      threadId?: string;
    };
  }>;
};

export type GmailHistoryResponse = {
  history?: GmailHistoryEntry[];
  historyId?: string;
};

export type GmailHistoryClient = {
  listHistory: (input: { emailAddress?: string; startHistoryId?: string }) => Promise<GmailHistoryResponse>;
};

export function createMockGmailHistoryClient(response: GmailHistoryResponse): GmailHistoryClient {
  return {
    async listHistory() {
      return response;
    },
  };
}
