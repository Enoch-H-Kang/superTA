import assert from 'node:assert/strict';
import { resolveProductionEnv } from '../src/setup/production-env.js';

export function runProductionEnvTests() {
  const env = resolveProductionEnv({
    SUPERTA_PUBLIC_BASE_URL: 'https://superta.example.edu',
    GMAIL_PUBSUB_TOPIC: 'projects/demo/topics/gmail',
    SUPERTA_PRODUCTION_MODE: 'true',
  });

  assert.equal(env.publicBaseUrl, 'https://superta.example.edu');
  assert.equal(env.gmailPubsubTopic, 'projects/demo/topics/gmail');
  assert.equal(env.productionMode, true);
}
