import type { Classification } from '../routing/classify.js';
import { validateClassification } from './validate-classification.js';
import { parseOpenAIResponsesOutput } from './parse-openai-responses-output.js';
import type { ResponsesClient, ResponsesRequest } from './responses-adapter.js';

export type ResponsesHttpConfig = {
  apiKeyEnvVar?: string;
  endpoint?: string;
};

export type FetchLike = (input: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export function parseResponsesClassificationResponse(raw: string): Classification {
  const parsed = JSON.parse(raw) as unknown;

  try {
    return validateClassification(parsed);
  } catch {
    return parseOpenAIResponsesOutput(parsed);
  }
}

export function createResponsesHttpClient(
  fetchImpl: FetchLike,
  config: ResponsesHttpConfig = {},
): ResponsesClient {
  const endpoint = config.endpoint ?? 'https://api.openai.com/v1/responses';
  const apiKeyEnvVar = config.apiKeyEnvVar ?? 'OPENAI_API_KEY';

  return {
    async classify(request: ResponsesRequest): Promise<Classification> {
      const apiKey = process.env[apiKeyEnvVar];
      if (!apiKey) {
        throw new Error(`Missing API key in environment variable ${apiKeyEnvVar}.`);
      }

      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(request),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Responses API request failed with status ${response.status}: ${text}`);
      }

      return parseResponsesClassificationResponse(text);
    },
  };
}
