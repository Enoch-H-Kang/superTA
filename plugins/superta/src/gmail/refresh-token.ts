import type { GmailAuthConfig } from './auth-config.js';

export type FetchLike = (input: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export type GmailTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export async function refreshGmailAccessToken(fetchImpl: FetchLike, config: GmailAuthConfig): Promise<string> {
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error(
      'Missing Gmail auth configuration. Provide GMAIL_ACCESS_TOKEN or GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN.',
    );
  }

  const response = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Gmail token refresh failed with status ${response.status}: ${text}`);
  }

  const payload = text ? (JSON.parse(text) as GmailTokenResponse) : {};
  if (!payload.access_token) {
    throw new Error('Gmail token refresh response did not include access_token.');
  }

  return payload.access_token;
}
