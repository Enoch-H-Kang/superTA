import assert from 'node:assert/strict';
import { createResponsesHttpClient, parseResponsesClassificationResponse } from '../src/classifier/responses-http-client.js';

export async function runResponsesHttpClientTests() {
  const parsed = parseResponsesClassificationResponse(
    JSON.stringify({
      category: 'deadline',
      action: 'draft_for_professor',
      confidence: 0.93,
      riskTier: 1,
      requiredSources: ['policy'],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: false,
      reason: 'Parsed from HTTP response.',
    }),
  );
  assert.equal(parsed.category, 'deadline');

  const parsedNested = parseResponsesClassificationResponse(
    JSON.stringify({
      output: [
        {
          content: [
            {
              text: JSON.stringify({
                category: 'grade-related',
                action: 'escalate_now',
                confidence: 0.98,
                riskTier: 3,
                requiredSources: ['policy'],
                shouldUpdateFaq: false,
                shouldNotifyProfessor: true,
                reason: 'Nested HTTP response.',
              }),
            },
          ],
        },
      ],
    }),
  );
  assert.equal(parsedNested.category, 'grade-related');

  process.env.OPENAI_API_KEY = 'test-key';

  const client = createResponsesHttpClient(async (_url, init) => {
    assert.equal(init?.method, 'POST');
    assert.match(init?.headers?.Authorization ?? '', /^Bearer test-key$/);
    return {
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
                    confidence: 0.88,
                    riskTier: 1,
                    requiredSources: ['policy'],
                    shouldUpdateFaq: false,
                    shouldNotifyProfessor: false,
                    reason: 'Mock HTTP classification.',
                  }),
                },
              ],
            },
          ],
        });
      },
    };
  });

  const classification = await client.classify({
    model: 'gpt-5.4-mini',
    input: [
      { role: 'system', content: 'system' },
      { role: 'user', content: 'user' },
    ],
  });
  assert.equal(classification.confidence, 0.88);

  const failingClient = createResponsesHttpClient(async () => ({
    ok: false,
    status: 500,
    async text() {
      return 'server error';
    },
  }));

  await assert.rejects(
    () =>
      failingClient.classify({
        model: 'gpt-5.4-mini',
        input: [
          { role: 'system', content: 'system' },
          { role: 'user', content: 'user' },
        ],
      }),
    /Responses API request failed/,
  );
}
