import type { ClassifierProvider } from './provider.js';
import { createStubClassifierProvider } from './stub-provider.js';

export type RuntimeClassifierConfig = {
  provider: 'stub';
};

export function resolveRuntimeClassifierConfig(_env: NodeJS.ProcessEnv = process.env): RuntimeClassifierConfig {
  return {
    provider: 'stub',
  };
}

export function createRuntimeClassifierProvider(
  _config: RuntimeClassifierConfig = resolveRuntimeClassifierConfig(),
  _fetchImpl: typeof fetch = fetch,
): ClassifierProvider {
  return createStubClassifierProvider();
}

export async function classifyWithRuntimeFallback(
  provider: ClassifierProvider,
  input: Parameters<ClassifierProvider['classify']>[0],
) {
  try {
    return await provider.classify(input);
  } catch (error) {
    return {
      category: 'other' as const,
      action: 'needs_more_info' as const,
      confidence: 0,
      riskTier: 1 as const,
      requiredSources: [],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: true,
      reason: `Classifier failed closed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
