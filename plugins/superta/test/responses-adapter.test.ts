import assert from 'node:assert/strict';
import { buildResponsesRequest, createResponsesClassifierProvider } from '../src/classifier/responses-adapter.js';
import { createMockResponsesClient } from '../src/classifier/mock-responses-client.js';
import type { Classification } from '../src/routing/classify.js';

function classification(): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.92,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Mock Responses adapter classification.',
  };
}

export async function runResponsesAdapterTests() {
  const config = {
    model: 'gpt-5.4-mini',
    systemPrompt: 'Classify course email into the SuperTA schema.',
  };

  const request = buildResponsesRequest(config, {
    thread: {
      threadId: 'thread-1',
      messageId: 'msg-1',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Late policy question',
      bodyText: 'Can I submit late?',
      attachments: [],
      isProfessorCommand: false,
    },
    courseId: 'cs101-sp26',
  });

  assert.equal(request.model, 'gpt-5.4-mini');
  assert.equal(request.input[0]?.role, 'system');
  assert.equal(request.input[1]?.role, 'user');
  assert.match(request.input[1]?.content ?? '', /Late policy question/);

  const provider = createResponsesClassifierProvider(config, createMockResponsesClient(classification()));
  const result = await provider.classify({
    thread: {
      threadId: 'thread-1',
      messageId: 'msg-1',
      from: 'student@example.edu',
      to: ['cs101@school.edu'],
      subject: 'Late policy question',
      bodyText: 'Can I submit late?',
      attachments: [],
      isProfessorCommand: false,
    },
    courseId: 'cs101-sp26',
  });

  assert.equal(result.category, 'deadline');
  assert.equal(result.action, 'draft_for_professor');
  assert.equal(result.confidence, 0.92);
}
