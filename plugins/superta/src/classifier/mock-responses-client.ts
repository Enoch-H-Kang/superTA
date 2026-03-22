import type { Classification } from '../routing/classify.js';
import type { ResponsesClient, ResponsesRequest } from './responses-adapter.js';

export function createMockResponsesClient(response: Classification): ResponsesClient {
  return {
    async classify(_request: ResponsesRequest) {
      return response;
    },
  };
}
