export type HttpRouteRegistration = {
  path: string;
  auth: 'plugin' | 'gateway';
  match?: 'exact' | 'prefix';
  replaceExisting?: boolean;
  handler: (req: { body?: string }, res: { statusCode: number; end: (body?: string) => void }) => Promise<boolean>;
};

export type PluginApiLike = {
  registerHttpRoute: (route: HttpRouteRegistration) => void;
};

export function registerGmailWebhookRoute(
  api: PluginApiLike,
  path: string,
  handlePayload: (rawBody: string) => Promise<void>,
) {
  api.registerHttpRoute({
    path,
    auth: 'plugin',
    match: 'exact',
    replaceExisting: true,
    handler: async (req, res) => {
      try {
        await handlePayload(req.body ?? '');
        res.statusCode = 200;
        res.end('ok');
        return true;
      } catch (error) {
        res.statusCode = 400;
        res.end(error instanceof Error ? error.message : 'invalid webhook');
        return true;
      }
    },
  });
}
