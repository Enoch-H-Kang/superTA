import { resolveGmailAuthConfig } from './auth-config.js';

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

export async function listRecentThreads(limit = 10) {
  const config = resolveGmailAuthConfig();
  if (!config.accessToken) {
    throw new Error('Missing GMAIL_ACCESS_TOKEN in environment.');
  }

  const baseUrl = config.apiBaseUrl ?? 'https://gmail.googleapis.com/gmail/v1';
  const payload = await requestJson(fetch as any, `${baseUrl}/users/me/threads?maxResults=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const threads = Array.isArray(payload?.threads) ? payload.threads : [];
  return {
    ok: true,
    resultSizeEstimate: payload?.resultSizeEstimate ?? null,
    threads: threads.map((t: any) => ({
      id: t?.id ?? null,
      snippet: t?.snippet ?? null,
      historyId: t?.historyId ?? null,
    })),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const limit = Number(process.argv[2] ?? '10');
  listRecentThreads(limit)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
