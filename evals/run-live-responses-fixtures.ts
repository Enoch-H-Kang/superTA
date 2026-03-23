import { createRuntimeClassifierProvider, resolveRuntimeClassifierConfig, classifyWithRuntimeFallback } from '../plugins/superta/src/classifier/runtime.js';
import { classifierFixtures } from './classifier-fixtures.js';

export async function runLiveResponsesFixtureComparison() {
  const config = resolveRuntimeClassifierConfig();
  if (config.provider !== 'responses') {
    throw new Error('Live Responses fixture comparison requires SUPERTA_CLASSIFIER_PROVIDER=responses.');
  }

  const provider = createRuntimeClassifierProvider(config, fetch as any);
  const results = [];
  let mismatchCount = 0;

  for (const fixture of classifierFixtures) {
    const classification = await classifyWithRuntimeFallback(provider, fixture.input);
    const mismatches = Object.entries(fixture.expected)
      .filter(([key, value]) => (classification as any)[key] !== value)
      .map(([key, value]) => ({ key, expected: value, actual: (classification as any)[key] }));

    if (mismatches.length > 0) {
      mismatchCount += 1;
    }

    results.push({
      fixture: fixture.name,
      ok: mismatches.length === 0,
      expected: fixture.expected,
      actual: {
        category: classification.category,
        action: classification.action,
        confidence: classification.confidence,
        reason: classification.reason,
      },
      mismatches,
    });
  }

  return {
    ok: mismatchCount === 0,
    provider: 'responses-live',
    mismatchCount,
    results,
  };
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  runLiveResponsesFixtureComparison()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
