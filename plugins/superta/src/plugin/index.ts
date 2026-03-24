import { loadConfigFromFile } from '../config/load-config.js';
import { assertLocalModelPolicy, summarizeLocalModelPolicy } from '../local-model-policy.js';
import { registerGmailWebhookRoute } from './register-gmail-webhook.js';

export type SuperTAPluginApi = {
  registerHttpRoute: (route: {
    path: string;
    methods?: string[];
    auth?: string;
    handler: (request: { body?: string; rawBody?: string }) => Promise<unknown> | unknown;
  }) => void;
  logger?: {
    info?: (message: string, meta?: unknown) => void;
    warn?: (message: string, meta?: unknown) => void;
    error?: (message: string, meta?: unknown) => void;
  };
  config?: {
    get?: (key: string) => unknown;
  };
};

export default async function supertaPlugin(api: SuperTAPluginApi) {
  const configuredPath = typeof api.config?.get === 'function' ? api.config.get('superta.configPath') : undefined;
  const configPath = typeof configuredPath === 'string' && configuredPath.length > 0 ? configuredPath : 'local.config.json';
  const config = await loadConfigFromFile(configPath);
  assertLocalModelPolicy(config.localModel);

  registerGmailWebhookRoute(api as never, config.gmail.webhookPath, async () => {
    api.logger?.info?.('SuperTA received Gmail webhook payload.', {
      webhookPath: config.gmail.webhookPath,
    });
  });
  api.logger?.info?.('SuperTA plugin initialized.', {
    webhookPath: config.gmail.webhookPath,
    professorId: config.professorId,
    courseCount: config.routing.courses.length,
    localModel: summarizeLocalModelPolicy(config.localModel),
  });
}
