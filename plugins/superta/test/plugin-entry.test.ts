import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

  const root = await mkdtemp(join(tmpdir(), 'superta-plugin-entry-'));
  const badConfigPath = join(root, 'bad-config.json');
  await writeFile(
    badConfigPath,
    JSON.stringify({
      professorId: 'prof-enoch',
      gmail: { webhookPath: '/webhooks/gmail', allowedProfessorSenders: ['prof@example.edu'] },
      routing: { professorId: 'prof-enoch', courses: [] },
      courseRoots: {},
      privacy: {
        ferpaSafeMode: true,
        allowExternalClassifier: false,
        allowSend: false,
        redactOperatorViews: true,
        storeEvidenceSnippets: false,
      },
      localModel: {
        required: true,
        provider: 'custom-local',
        endpoint: 'https://api.openai.com/v1',
      },
    }),
  );

  await assert.rejects(
    () =>
      supertaPlugin({
        registerHttpRoute() {},
        config: {
          get(key: string) {
            return key === 'superta.configPath' ? badConfigPath : undefined;
          },
        },
      }),
    /only allows local\/private model endpoints/i,
  );

  await rm(root, { recursive: true, force: true });
}
