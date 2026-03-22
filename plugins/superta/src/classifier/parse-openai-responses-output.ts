import type { Classification } from '../routing/classify.js';
import { validateClassification } from './validate-classification.js';

function tryParseJsonString(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractTextChunks(response: unknown): string[] {
  if (!response || typeof response !== 'object') return [];
  const root = response as Record<string, unknown>;
  const output = Array.isArray(root.output) ? root.output : [];
  const chunks: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as unknown[])
      : [];

    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const rec = part as Record<string, unknown>;
      if (typeof rec.text === 'string') {
        chunks.push(rec.text);
      }
      if (typeof rec.output_text === 'string') {
        chunks.push(rec.output_text);
      }
    }
  }

  if (typeof root.output_text === 'string') {
    chunks.push(root.output_text);
  }

  return chunks;
}

export function parseOpenAIResponsesOutput(response: unknown): Classification {
  if (response && typeof response === 'object') {
    try {
      return validateClassification(response);
    } catch {
      // fall through to nested parsing
    }
  }

  const chunks = extractTextChunks(response);
  for (const chunk of chunks) {
    const parsed = tryParseJsonString(chunk);
    if (!parsed) continue;
    try {
      return validateClassification(parsed);
    } catch {
      // keep trying other chunks
    }
  }

  throw new Error('Could not extract a valid Classification from OpenAI Responses output.');
}
