import assert from 'node:assert/strict';
import { defaultConfig, resolveCourseRoot } from '../src/config.js';

export function runConfigTests() {
  assert.equal(defaultConfig.professorId, 'prof-placeholder');
  assert.equal(defaultConfig.gmail.webhookPath, '/webhooks/gmail');
  assert.ok(Array.isArray(defaultConfig.gmail.allowedProfessorSenders));
  assert.equal(defaultConfig.privacy.ferpaSafeMode, true);
  assert.equal(defaultConfig.privacy.allowExternalClassifier, false);
  assert.equal(defaultConfig.privacy.allowSend, false);
  assert.equal(defaultConfig.routing.professorId, 'prof-placeholder');
  assert.equal(resolveCourseRoot(defaultConfig, 'cs101-sp26'), '/tmp/cs101-sp26');
  assert.equal(resolveCourseRoot(defaultConfig, 'missing-course'), '');
}
