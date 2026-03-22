import { defaultConfig } from './config.js';
export { ingestGmailEvent } from './gmail/ingest.js';
export { normalizeThread } from './gmail/normalize.js';
export { resolveCourseRoute } from './routing/course-resolver.js';
export { classifyMessage } from './routing/classify.js';
export { applyPolicy } from './routing/policy-engine.js';
export { buildEvidenceBundle } from './retrieval/build-evidence-bundle.js';
export { draftReply } from './drafting/draft-reply.js';
export { logAudit } from './audit/logger.js';
export { createDraftEmail } from './tools/draft-email.js';

export function pluginEntry() {
  return {
    name: 'superta',
    status: 'scaffold',
    config: defaultConfig,
  };
}
