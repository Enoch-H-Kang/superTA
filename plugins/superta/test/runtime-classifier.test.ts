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
  const stubConfig = resolveRuntimeClassifierConfig({});
  assert.equal(stubConfig.provider, 'stub');

  const responsesConfig = resolveRuntimeClassifierConfig({
    SUPERTA_CLASSIFIER_PROVIDER: 'responses',
    SUPERTA_RESPONSES_MODEL: 'gpt-5.4-mini',
    SUPERTA_RESPONSES_SYSTEM_PROMPT: 'Classify email.',
    SUPERTA_RESPONSES_API_KEY_ENV: 'OPENAI_API_KEY',
    SUPERTA_RESPONSES_ENDPOINT: 'https://api.openai.com/v1/responses',
  });
  assert.equal(responsesConfig.provider, 'responses');
  assert.equal(responsesConfig.responses?.model, 'gpt-5.4-mini');

  const stubProvider = createRuntimeClassifierProvider({ provider: 'stub' });
  const stubResult = await stubProvider.classify(input);
  assert.equal(stubResult.category, 'deadline');

  process.env.OPENAI_API_KEY = 'test-key';
  const responsesProvider = createRuntimeClassifierProvider(
    {
      provider: 'responses',
      responses: {
        model: 'gpt-5.4-mini',
        systemPrompt: 'Classify email.',
        apiKeyEnvVar: 'OPENAI_API_KEY',
        endpoint: 'https://api.openai.com/v1/responses',
      },
    },
    (async () => ({
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          output: [
            {
              content: [
                {
                  text: JSON.stringify({
                    category: 'deadline',
                    action: 'draft_for_professor',
                    confidence: 0.91,
                    riskTier: 1,
                    requiredSources: ['policy'],
                    shouldUpdateFaq: false,
                    shouldNotifyProfessor: false,
                    reason: 'Runtime Responses classification.',
                  }),
                },
              ],
            },
          ],
        });
      },
    })) as any,
  );

  const responsesResult = await responsesProvider.classify(input);
  assert.equal(responsesResult.confidence, 0.91);

  const failedClosed = await classifyWithRuntimeFallback(
    { classify: async () => { throw new Error('boom'); } },
    input,
  );
  assert.equal(failedClosed.action, 'needs_more_info');
  assert.equal(failedClosed.shouldNotifyProfessor, true);

  delete process.env.OPENAI_API_KEY;
}
