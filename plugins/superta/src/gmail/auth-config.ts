export type GmailAuthConfig = {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  apiBaseUrl?: string;
};

export function resolveGmailAuthConfig(env: NodeJS.ProcessEnv = process.env): GmailAuthConfig {
  return {
    clientId: env.GMAIL_CLIENT_ID,
    clientSecret: env.GMAIL_CLIENT_SECRET,
    refreshToken: env.GMAIL_REFRESH_TOKEN,
    accessToken: env.GMAIL_ACCESS_TOKEN,
    apiBaseUrl: env.GMAIL_API_BASE_URL ?? 'https://gmail.googleapis.com/gmail/v1',
  };
}

export function assertGmailAuthConfig(config: GmailAuthConfig): GmailAuthConfig {
  if (!config.accessToken && !(config.clientId && config.clientSecret && config.refreshToken)) {
    throw new Error(
      'Missing Gmail auth configuration. Provide GMAIL_ACCESS_TOKEN or GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN.',
    );
  }

  return config;
}
