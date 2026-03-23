import type { ClassifierProvider } from './provider.js';
import { createStubClassifierProvider } from './stub-provider.js';
import { createResponsesClassifierProvider, type ResponsesClassifierConfig } from './responses-adapter.js';
import { createResponsesHttpClient } from './responses-http-client.js';

export type RuntimeClassifierConfig = {
  provider?: 'stub' | 'responses';
  responses?: ResponsesClassifierConfig & {
    apiKeyEnvVar?: string;
    endpoint?: string;
  };
};

export function resolveRuntimeClassifierConfig(env: NodeJS.ProcessEnv = process.env): RuntimeClassifierConfig {
  const provider = env.SUPERTA_CLASSIFIER_PROVIDER === 'responses' ? 'responses' : 'stub';

  return {
    provider,
    responses: {
      model: env.SUPERTA_RESPONSES_MODEL ?? 'gpt-5.4-mini',
      systemPrompt:
        env.SUPERTA_RESPONSES_SYSTEM_PROMPT ??
        'Classify the inbound course email into the SuperTA classification schema. Return only valid structured classification output.',
      apiKeyEnvVar: env.SUPERTA_RESPONSES_API_KEY_ENV ?? 'OPENAI_API_KEY',
      endpoint: env.SUPERTA_RESPONSES_ENDPOINT ?? 'https://api.openai.com/v1/responses',
    },
  };
}

export function createRuntimeClassifierProvider(
  config: RuntimeClassifierConfig = resolveRuntimeClassifierConfig(),
  fetchImpl: typeof fetch = fetch,
): ClassifierProvider {
  if (config.provider === 'responses') {
    const responses = config.responses;
    if (!responses) {
      throw new Error('Missing Responses classifier runtime configuration.');
    }

    return createResponsesClassifierProvider(
      {
        model: responses.model,
        systemPrompt: responses.systemPrompt,
      },
      createResponsesHttpClient(fetchImpl as any, {
        apiKeyEnvVar: responses.apiKeyEnvVar,
        endpoint: responses.endpoint,
      }),
    );
  }

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
