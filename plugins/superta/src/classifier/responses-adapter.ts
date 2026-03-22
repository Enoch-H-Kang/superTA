import type { ClassifierProvider, ClassificationInput } from './provider.js';
import type { Classification } from '../routing/classify.js';

export type ResponsesClassifierConfig = {
  model: string;
  systemPrompt: string;
};

export type ResponsesRequest = {
  model: string;
  input: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
};

export type ResponsesClient = {
  classify: (request: ResponsesRequest) => Promise<Classification>;
};

export function buildResponsesRequest(
  config: ResponsesClassifierConfig,
  input: ClassificationInput,
): ResponsesRequest {
  return {
    model: config.model,
    input: [
      {
        role: 'system',
        content: config.systemPrompt,
      },
      {
        role: 'user',
        content: JSON.stringify({
          thread: input.thread,
          courseId: input.courseId,
        }),
      },
    ],
  };
}

export function createResponsesClassifierProvider(
  config: ResponsesClassifierConfig,
  client: ResponsesClient,
): ClassifierProvider {
  return {
    async classify(input) {
      const request = buildResponsesRequest(config, input);
      return client.classify(request);
    },
  };
}
