import assert from 'node:assert/strict';
import { assertLocalModelPolicy } from '../src/local-model-policy.js';

export async function runLocalModelPolicyTests() {
  assert.doesNotThrow(() =>
    assertLocalModelPolicy({
      required: true,
      provider: 'stub',
    }),
  );

  assert.doesNotThrow(() =>
    assertLocalModelPolicy({
      required: true,
      provider: 'ollama',
      endpoint: 'http://127.0.0.1:11434',
    }),
  );

  assert.doesNotThrow(() =>
    assertLocalModelPolicy({
      required: true,
      provider: 'custom-local',
      endpoint: 'http://192.168.1.20:8000/v1',
    }),
  );

  assert.throws(
    () =>
      assertLocalModelPolicy({
        required: true,
        provider: 'custom-local',
        endpoint: 'https://api.openai.com/v1',
      }),
    /only allows local\/private model endpoints/i,
  );
}
