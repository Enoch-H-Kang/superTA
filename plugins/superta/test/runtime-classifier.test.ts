import assert from 'node:assert/strict';
import { createRuntimeClassifierProvider, resolveRuntimeClassifierConfig, classifyWithRuntimeFallback } from '../src/classifier/runtime.js';

const input = {
  thread: {
    threadId: 'thread-1',
    messageId: 'msg-1',
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject: 'Need help with late submission',
    bodyText: 'Can I submit late?',
    attachments: [],
    isProfessorCommand: false,
  },
  courseId: 'cs101-sp26',
};

export async function runRuntimeClassifierTests() {
  const runtimeConfig = resolveRuntimeClassifierConfig({
    SUPERTA_CLASSIFIER_PROVIDER: 'responses',
    OPENAI_API_KEY: 'should-be-ignored',
  });
  assert.equal(runtimeConfig.provider, 'stub');

  const stubProvider = createRuntimeClassifierProvider(runtimeConfig);
  const stubResult = await stubProvider.classify(input);
  assert.equal(stubResult.category, 'deadline');

  const failedClosed = await classifyWithRuntimeFallback(
    { classify: async () => { throw new Error('boom'); } },
    input,
  );
  assert.equal(failedClosed.action, 'needs_more_info');
  assert.equal(failedClosed.shouldNotifyProfessor, true);
}
