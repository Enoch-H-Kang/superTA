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
    privacy: {
      ferpaSafeMode: parsed.privacy?.ferpaSafeMode ?? defaultConfig.privacy.ferpaSafeMode,
      allowExternalClassifier: parsed.privacy?.allowExternalClassifier ?? defaultConfig.privacy.allowExternalClassifier,
      allowSend: parsed.privacy?.allowSend ?? defaultConfig.privacy.allowSend,
      redactOperatorViews: parsed.privacy?.redactOperatorViews ?? defaultConfig.privacy.redactOperatorViews,
      storeEvidenceSnippets: parsed.privacy?.storeEvidenceSnippets ?? defaultConfig.privacy.storeEvidenceSnippets,
    },
    localModel: {
      required: parsed.localModel?.required ?? defaultConfig.localModel.required,
      provider: parsed.localModel?.provider ?? defaultConfig.localModel.provider,
      endpoint: parsed.localModel?.endpoint ?? defaultConfig.localModel.endpoint,
    },
  };
}
