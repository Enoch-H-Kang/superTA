export type ProductionEnvStatus = {
  publicBaseUrl?: string;
  gmailPubsubTopic?: string;
  productionMode: boolean;
};

export function resolveProductionEnv(env: NodeJS.ProcessEnv = process.env): ProductionEnvStatus {
  return {
    publicBaseUrl: env.SUPERTA_PUBLIC_BASE_URL,
    gmailPubsubTopic: env.GMAIL_PUBSUB_TOPIC,
    productionMode: env.SUPERTA_PRODUCTION_MODE === '1' || env.SUPERTA_PRODUCTION_MODE === 'true',
  };
}
