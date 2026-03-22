import type { GmailAuthConfig } from './auth-config.js';
import { assertGmailAuthConfig } from './auth-config.js';
import { refreshGmailAccessToken } from './refresh-token.js';

export type FetchLike = (input: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export type GmailWatchRequest = {
  topicName: string;
  labelIds?: string[];
  labelFilterAction?: 'include' | 'exclude';
};

export type GmailWatchResponse = {
  historyId?: string;
  expiration?: string;
};

async function resolveAccessToken(fetchImpl: FetchLike, config: GmailAuthConfig) {
  if (config.accessToken) {
    return config.accessToken;
  }

  return refreshGmailAccessToken(fetchImpl, config);
}

export function createGmailWatchClient(fetchImpl: FetchLike, rawConfig: GmailAuthConfig) {
  const config = assertGmailAuthConfig(rawConfig);
  const baseUrl = config.apiBaseUrl ?? 'https://gmail.googleapis.com/gmail/v1';

  return {
    async watch(request: GmailWatchRequest): Promise<GmailWatchResponse> {
      const accessToken = await resolveAccessToken(fetchImpl, config);
      const response = await fetchImpl(`${baseUrl}/users/me/watch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName: request.topicName,
          labelIds: request.labelIds,
          labelFilterAction: request.labelFilterAction,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Gmail watch registration failed with status ${response.status}: ${text}`);
      }

      return text ? (JSON.parse(text) as GmailWatchResponse) : {};
    },
  };
}
