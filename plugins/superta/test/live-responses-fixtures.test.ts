import assert from 'node:assert/strict';
import { runLiveResponsesFixtureComparison } from '../../../evals/run-live-responses-fixtures.js';

export async function runLiveResponsesFixtureTests() {
  await assert.rejects(
    () => runLiveResponsesFixtureComparison(),
    /no longer part of the supported SuperTA workflow/i,
  );
}
