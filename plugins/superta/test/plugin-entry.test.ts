import assert from 'node:assert/strict';
import supertaPlugin from '../src/plugin/index.js';

export async function runPluginEntryTests() {
  const routes: Array<{ path: string; methods?: string[]; auth?: string }> = [];
  const originalCwd = process.cwd();
  const configPath = `${originalCwd}/config.example.json`;

  await supertaPlugin({
    registerHttpRoute(route) {
      routes.push({ path: route.path, methods: route.methods, auth: route.auth });
    },
    logger: {
      info() {},
    },
    config: {
      get(key: string) {
        return key === 'superta.configPath' ? configPath : undefined;
      },
    },
  });

  assert.ok(routes.some((route) => route.path));
}
