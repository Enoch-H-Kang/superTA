import assert from 'node:assert/strict';
import { runClassifierFixtureEvals } from '../../../evals/run-classifier-fixtures.js';

export async function runClassifierFixtureTests() {
  const results = await runClassifierFixtureEvals();
  assert.ok(results.length >= 5);
  assert.ok(results.every((result: { ok: boolean }) => result.ok));
}
