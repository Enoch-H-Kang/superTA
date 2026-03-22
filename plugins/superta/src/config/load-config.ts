import { readFile } from 'node:fs/promises';
import type { SuperTAConfig } from '../config.js';
import { defaultConfig } from '../config.js';

export async function loadConfigFromFile(path: string): Promise<SuperTAConfig> {
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as Partial<SuperTAConfig>;

  return {
    professorId: parsed.professorId ?? defaultConfig.professorId,
    gmail: {
      webhookPath: parsed.gmail?.webhookPath ?? defaultConfig.gmail.webhookPath,
      allowedProfessorSenders:
        parsed.gmail?.allowedProfessorSenders ?? defaultConfig.gmail.allowedProfessorSenders,
    },
    routing: parsed.routing ?? defaultConfig.routing,
    courseRoots: parsed.courseRoots ?? defaultConfig.courseRoots,
  };
}
