import { defaultConfig } from './config.js';
export { defaultConfig, resolveCourseRoot } from './config.js';
export { createMockGmailClient } from './gmail/client.js';
export { ingestGmailEvent } from './gmail/ingest.js';
export { normalizeThread } from './gmail/normalize.js';
export { draftFromReviewItem, sendApprovedReviewItem, forwardReviewThread, labelReviewThread } from './gmail/executor.js';
export { resolveCourseRoute } from './routing/course-resolver.js';
export { classifyMessage } from './routing/classify.js';
export { applyPolicy } from './routing/policy-engine.js';
export { buildEvidenceBundle } from './retrieval/build-evidence-bundle.js';
export { loadCourseFiles } from './retrieval/load-course-files.js';
export { retrieveCourseFacts } from './retrieval/retrieve-course-facts.js';
export { createReviewQueueItem, updateReviewStatus } from './actions/review-queue.js';
export { executeReviewAction } from './actions/action-executor.js';
export { processInboundThread } from './orchestration/process-inbound-thread.js';
export { processInboundThreadWithConfig } from './orchestration/process-with-config.js';
export type { PipelineAuditRecord } from './audit/schemas.js';
export { logAudit } from './audit/logger.js';
export { draftReply } from './drafting/draft-reply.js';
export { createDraftEmail } from './tools/draft-email.js';

export function pluginEntry() {
  return {
    name: 'superta',
    status: 'scaffold',
    config: defaultConfig,
  };
}
