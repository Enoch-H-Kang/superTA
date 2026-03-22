import type { GmailClient, GmailDraftRequest, GmailForwardRequest, GmailLabelRequest, GmailSendRequest, GmailThreadMessage } from './client.js';
import type { GmailAuthConfig } from './auth-config.js';
import { assertGmailAuthConfig } from './auth-config.js';
import { buildMimeMessage, encodeBase64Url } from './mime.js';

export type FetchLike = (input: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

async function requestJson(fetchImpl: FetchLike, url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) {
  const response = await fetchImpl(url, init);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Gmail API request failed with status ${response.status}: ${text}`);
  }

  return text ? (JSON.parse(text) as any) : {};
}

function authHeaders(config: GmailAuthConfig) {
  const accessToken = config.accessToken;
  if (!accessToken) {
    throw new Error('Live Gmail HTTP client currently requires GMAIL_ACCESS_TOKEN for API calls.');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

function mapThreadResponseToMessages(payload: any): GmailThreadMessage[] {
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  return messages.map((message: any) => {
    const headers = Array.isArray(message?.payload?.headers) ? message.payload.headers : [];
    const header = (name: string) => headers.find((h: any) => String(h?.name).toLowerCase() === name.toLowerCase())?.value ?? '';

    return {
      threadId: message?.threadId ?? '',
      messageId: message?.id ?? '',
      from: header('From'),
      to: String(header('To') || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      subject: header('Subject'),
      bodyText: message?.snippet ?? '',
      inReplyTo: header('In-Reply-To') || undefined,
      references: String(header('References') || '')
        .split(/\s+/)
        .map((v) => v.trim())
        .filter(Boolean),
    } satisfies GmailThreadMessage;
  });
}

function buildRawMessage(request: GmailDraftRequest | GmailSendRequest) {
  const mime = buildMimeMessage({
    to: request.to,
    subject: request.subject,
    body: request.body,
    inReplyTo: request.inReplyTo,
    references: request.references,
  });

  return {
    raw: encodeBase64Url(mime),
    threadId: request.threadId,
  };
}

export function createGmailHttpClient(fetchImpl: FetchLike, rawConfig: GmailAuthConfig): GmailClient {
  const config = assertGmailAuthConfig(rawConfig);
  const baseUrl = config.apiBaseUrl ?? 'https://gmail.googleapis.com/gmail/v1';

  return {
    async fetchThread(threadId: string) {
      const payload = await requestJson(fetchImpl, `${baseUrl}/users/me/threads/${threadId}`, {
        method: 'GET',
        headers: authHeaders(config),
      });
      return mapThreadResponseToMessages(payload);
    },

    async createDraft(request: GmailDraftRequest) {
      const payload = await requestJson(fetchImpl, `${baseUrl}/users/me/drafts`, {
        method: 'POST',
        headers: authHeaders(config),
        body: JSON.stringify({ message: buildRawMessage(request) }),
      });
      return { id: payload?.id ?? payload?.message?.id ?? 'live-draft', status: 'drafted' as const };
    },

    async sendMessage(request: GmailSendRequest) {
      const payload = await requestJson(fetchImpl, `${baseUrl}/users/me/messages/send`, {
        method: 'POST',
        headers: authHeaders(config),
        body: JSON.stringify(buildRawMessage(request)),
      });
      return { id: payload?.id ?? 'live-sent', status: 'sent' as const };
    },

    async forwardThread(request: GmailForwardRequest) {
      await requestJson(fetchImpl, `${baseUrl}/users/me/threads/${request.threadId}/forward`, {
        method: 'POST',
        headers: authHeaders(config),
        body: JSON.stringify(request),
      });
      return { id: 'live-forward', status: 'forwarded' as const };
    },

    async labelThread(request: GmailLabelRequest) {
      await requestJson(fetchImpl, `${baseUrl}/users/me/threads/${request.threadId}/modify`, {
        method: 'POST',
        headers: authHeaders(config),
        body: JSON.stringify({ addLabelIds: request.labels }),
      });
      return { threadId: request.threadId, status: 'labeled' as const, labels: request.labels };
    },
  };
}
