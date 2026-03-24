import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defaultConfig, type SuperTAConfig } from '../config.js';

export type InitConfigOptions = {
  configPath: string;
  professorId?: string;
  allowedProfessorSenders?: string[];
  webhookPath?: string;
};

export async function initSuperTAConfig(options: InitConfigOptions) {
  const config: SuperTAConfig = {
    professorId: options.professorId ?? defaultConfig.professorId,
    gmail: {
      webhookPath: options.webhookPath ?? defaultConfig.gmail.webhookPath,
      allowedProfessorSenders: options.allowedProfessorSenders ?? [],
    },
    routing: {
      professorId: options.professorId ?? defaultConfig.professorId,
      courses: [],
    },
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
      provider: 'stub',
    },
  };

  const path = resolve(options.configPath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(config, null, 2));
  return { ok: true, configPath: path, config };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'local.config.json';
  const professorId = process.argv[3];
  const sender = process.argv[4];
  const webhookPath = process.argv[5];

  initSuperTAConfig({
    configPath,
    professorId,
    allowedProfessorSenders: sender ? [sender] : [],
    webhookPath,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
