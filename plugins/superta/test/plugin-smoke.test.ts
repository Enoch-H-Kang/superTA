import assert from 'node:assert/strict';
import { runPluginSmokeTest } from '../src/plugin/smoke-test.js';

export async function runPluginSmokeTests() {
  const result = await runPluginSmokeTest('../../../config.example.json');
  assert.equal(result.ok, true);
  assert.ok(result.routeCount >= 1);
  assert.ok(result.registeredRoutes.some((route) => typeof route.path === 'string' && route.path.length > 0));
}
