import type { NormalizedThread } from '../gmail/normalize.js';
import type { SuperTAConfig } from '../config.js';
import type { Classification } from '../routing/classify.js';
import type { SuperTAStore } from '../storage/store.js';
import { processInboundThreadWithConfig } from './process-with-config.js';

export async function processInboundThreadAndStore(
  config: SuperTAConfig,
  store: SuperTAStore,
  thread: NormalizedThread,
  options: {
    classify?: (input: { thread: NormalizedThread; courseId?: string }) => Classification | Promise<Classification>;
  } = {},
) {
  const result = await processInboundThreadWithConfig(config, thread, options);

  await store.appendAuditRecord({
    threadId: result.audit.threadId,
    messageId: result.audit.messageId,
    courseId: result.audit.courseId,
    route: result.audit.route,
    classification: result.audit.classification,
    evidence: result.audit.evidence,
    outcome: result.audit.outcome,
    outcomeReason: result.audit.outcomeReason,
  });

  if (result.outcome.type === 'queue') {
    await store.saveReviewItem(result.outcome.item);
  }

  return result;
}
