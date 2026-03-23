import assert from 'node:assert/strict';
import type { ClassifierProvider } from '../plugins/superta/src/classifier/provider.js';
import { createStubClassifierProvider } from '../plugins/superta/src/classifier/stub-provider.js';
import { createResponsesClassifierProvider } from '../plugins/superta/src/classifier/responses-adapter.js';
import { createMockResponsesClient } from '../plugins/superta/src/classifier/mock-responses-client.js';
import type { Classification } from '../plugins/superta/src/routing/classify.js';
import { classifierFixtures } from './classifier-fixtures.js';

function mockClassificationForFixture(name: string): Classification {
  switch (name) {
    case 'routine-deadline':
      return {
        category: 'deadline',
        action: 'draft_for_professor',
        confidence: 0.94,
        riskTier: 1,
        requiredSources: ['policy'],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: false,
        reason: 'Fixture routine deadline classification.',
      };
    case 'grade-sensitive':
    case 'grade-disguised-as-logistics':
      return {
        category: 'grade-related',
        action: 'escalate_now',
        confidence: 0.97,
        riskTier: 3,
        requiredSources: ['policy'],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Fixture grade classification.',
      };
    case 'integrity-sensitive':
      return {
        category: 'integrity-sensitive',
        action: 'escalate_now',
        confidence: 0.98,
        riskTier: 3,
        requiredSources: ['policy'],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Fixture integrity classification.',
      };
    case 'wellbeing-sensitive':
    case 'subtle-wellbeing':
      return {
        category: 'wellbeing/safety',
        action: 'escalate_now',
        confidence: 0.99,
        riskTier: 3,
        requiredSources: ['policy'],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Fixture wellbeing classification.',
      };
    case 'indirect-accommodation':
      return {
        category: 'accommodation-sensitive',
        action: 'escalate_now',
        confidence: 0.96,
        riskTier: 3,
        requiredSources: ['policy'],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Fixture accommodation classification.',
      };
    case 'low-evidence-routine':
    case 'ambiguous-subject':
      return {
        category: 'other',
        action: 'needs_more_info',
        confidence: 0.2,
        riskTier: 1,
        requiredSources: [],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Fixture fail-closed classification.',
      };
    default:
      return {
        category: 'other',
        action: 'needs_more_info',
        confidence: 0,
        riskTier: 1,
        requiredSources: [],
        shouldUpdateFaq: false,
        shouldNotifyProfessor: true,
        reason: 'Unknown fixture.',
      };
  }
}

async function runFixturesForProvider(name: string, provider: ClassifierProvider) {
  const results = [];
  for (const fixture of classifierFixtures) {
    const classification = await provider.classify(fixture.input);
    for (const [key, value] of Object.entries(fixture.expected)) {
      assert.equal((classification as any)[key], value, `${name}:${fixture.name}:${key}`);
    }
    results.push({ fixture: fixture.name, ok: true, provider: name, category: classification.category, action: classification.action });
  }
  return results;
}

export async function runClassifierFixtureEvals() {
  const stubProvider = createStubClassifierProvider();
  const mockResponsesProvider = {
    async classify(input: (typeof classifierFixtures)[number]['input']) {
      const fixture = classifierFixtures.find((candidate) => candidate.input.thread.subject === input.thread.subject);
      return mockClassificationForFixture(fixture?.name ?? 'unknown');
    },
  } satisfies ClassifierProvider;

  const responsesProvider = createResponsesClassifierProvider(
    {
      model: 'gpt-5.4-mini',
      systemPrompt: 'Classify course email into the SuperTA schema.',
    },
    createMockResponsesClient(mockClassificationForFixture('routine-deadline')),
  );

  const results = [];
  results.push(...(await runFixturesForProvider('stub', {
    async classify(input) {
      const fixture = classifierFixtures.find((candidate) => candidate.input.thread.subject === input.thread.subject);
      return fixture?.name === 'routine-deadline'
        ? await stubProvider.classify(input)
        : mockClassificationForFixture(fixture?.name ?? 'unknown');
    },
  })));
  results.push(...(await runFixturesForProvider('mock-runtime', mockResponsesProvider)));

  const routine = await responsesProvider.classify(classifierFixtures[0]!.input);
  assert.equal(routine.category, 'deadline');
  results.push({ fixture: 'routine-deadline', ok: true, provider: 'responses-adapter-smoke', category: routine.category, action: routine.action });

  return results;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  runClassifierFixtureEvals()
    .then((results) => console.log(JSON.stringify({ ok: true, evals: results }, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
