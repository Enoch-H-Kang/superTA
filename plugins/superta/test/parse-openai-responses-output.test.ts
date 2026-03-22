import assert from 'node:assert/strict';
import { parseOpenAIResponsesOutput } from '../src/classifier/parse-openai-responses-output.js';

export function runParseOpenAIResponsesOutputTests() {
  const direct = parseOpenAIResponsesOutput({
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.9,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Direct object.',
  });
  assert.equal(direct.category, 'deadline');

  const nestedText = parseOpenAIResponsesOutput({
    output: [
      {
        content: [
          {
            type: 'output_text',
            text: JSON.stringify({
              category: 'grade-related',
              action: 'escalate_now',
              confidence: 0.97,
              riskTier: 3,
              requiredSources: ['policy'],
              shouldUpdateFaq: false,
              shouldNotifyProfessor: true,
              reason: 'Nested JSON text.',
            }),
          },
        ],
      },
    ],
  });
  assert.equal(nestedText.category, 'grade-related');
  assert.equal(nestedText.action, 'escalate_now');

  const outputTextTopLevel = parseOpenAIResponsesOutput({
    output_text: JSON.stringify({
      category: 'other',
      action: 'needs_more_info',
      confidence: 0.3,
      riskTier: 1,
      requiredSources: [],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: false,
      reason: 'Top-level output_text JSON.',
    }),
  });
  assert.equal(outputTextTopLevel.category, 'other');

  assert.throws(
    () => parseOpenAIResponsesOutput({ output: [{ content: [{ text: 'not json' }] }] }),
    /Could not extract a valid Classification/,
  );
}
