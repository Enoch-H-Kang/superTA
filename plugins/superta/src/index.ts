import { defaultConfig } from './config.js';
export { defaultConfig, resolveCourseRoot } from './config.js';
export { loadConfigFromFile } from './config/load-config.js';
export type { ClassifierProvider, ClassificationInput } from './classifier/provider.js';
export { createStubClassifierProvider } from './classifier/stub-provider.js';
export { validateClassification } from './classifier/validate-classification.js';
export { parseOpenAIResponsesOutput } from './classifier/parse-openai-responses-output.js';
export type { ResponsesClassifierConfig, ResponsesClient, ResponsesRequest } from './classifier/responses-adapter.js';
export { buildResponsesRequest, createResponsesClassifierProvider } from './classifier/responses-adapter.js';
export { createMockResponsesClient } from './classifier/mock-responses-client.js';
export { createResponsesHttpClient, parseResponsesClassificationResponse } from './classifier/responses-http-client.js';
export type { ProfessorCommand, ParsedProfessorCommand } from './commands/parse-professor-command.js';
export { parseProfessorCommand } from './commands/parse-professor-command.js';
export { executeProfessorCommand } from './commands/execute-professor-command.js';
export { executeApprovedSend } from './commands/execute-professor-send.js';
export { reviewStoredProposal } from './commands/review-proposal-command.js';
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
export type { ProposalRecord } from './proposals/types.js';
export { createProposal } from './proposals/create-proposal.js';
export { updateProposalStatus } from './proposals/review-proposal.js';
export { applyProposalToCourseFiles } from './proposals/apply-proposal.js';
export { runDeadlineEmailWorkflow } from './demo/deadline-workflow.js';
export { processInboundThread } from './orchestration/process-inbound-thread.js';
export { processInboundThreadWithConfig } from './orchestration/process-with-config.js';
export { processInboundThreadAndStore } from './orchestration/process-and-store.js';
export { processInboundThreadWithClassifier } from './orchestration/process-with-classifier.js';
export { processProfessorCommand } from './orchestration/process-professor-command.js';
export type { PipelineAuditRecord } from './audit/schemas.js';
export { logAudit } from './audit/logger.js';
export { draftReply } from './drafting/draft-reply.js';
export { createDraftEmail } from './tools/draft-email.js';
export type { SuperTAStore } from './storage/store.js';
export { createFileStore, defaultFileStorePaths } from './storage/file-store.js';

export function pluginEntry() {
  return {
    name: 'superta',
    status: 'scaffold',
    config: defaultConfig,
  };
}
