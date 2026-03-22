import type { NormalizedThread } from '../gmail/normalize.js';
import type { Classification } from '../routing/classify.js';
import type { SuperTAConfig } from '../config.js';
import { resolveCourseRoot } from '../config.js';
import { processInboundThread } from './process-inbound-thread.js';

export async function processInboundThreadWithConfig(
  config: SuperTAConfig,
  thread: NormalizedThread,
  options: {
    classify?: (input: { thread: NormalizedThread; courseId?: string }) => Classification;
  } = {},
) {
  return processInboundThread(thread, (courseId) => resolveCourseRoot(config, courseId), {
    routeConfig: config.routing,
    classify: options.classify,
  });
}
