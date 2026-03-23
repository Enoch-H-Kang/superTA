import { resolve } from 'node:path';
import supertaPlugin from './index.js';

export async function runPluginSmokeTest(configPath = 'config.example.json') {
  const registeredRoutes: Array<{ path: string; methods?: string[]; auth?: string }> = [];
  const logs: Array<{ level: string; message: string; meta?: unknown }> = [];

  await supertaPlugin({
    registerHttpRoute(route) {
      registeredRoutes.push({ path: route.path, methods: route.methods, auth: route.auth });
    },
    logger: {
      info(message, meta) {
        logs.push({ level: 'info', message, meta });
      },
      warn(message, meta) {
        logs.push({ level: 'warn', message, meta });
      },
      error(message, meta) {
        logs.push({ level: 'error', message, meta });
      },
    },
    config: {
      get(key: string) {
        return key === 'superta.configPath' ? resolve(process.cwd(), configPath) : undefined;
      },
    },
  });

  return {
    ok: registeredRoutes.length > 0,
    routeCount: registeredRoutes.length,
    registeredRoutes,
    logs,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'config.example.json';
  runPluginSmokeTest(configPath)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
