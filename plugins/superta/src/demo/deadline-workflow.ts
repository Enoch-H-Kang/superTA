import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import type { GmailClient } from '../gmail/client.js';
import type { ClassifierProvider } from '../classifier/provider.js';
import type { NormalizedThread } from '../gmail/normalize.js';
import { processInboundThreadWithClassifier } from '../orchestration/process-with-classifier.js';
import { executeProfessorCommand } from '../commands/execute-professor-command.js';
import { executeApprovedSend } from '../commands/execute-professor-send.js';

export type DeadlineWorkflowResult = {
  queuedReviewItemId?: string;
  approveResult: Awaited<ReturnType<typeof executeProfessorCommand>>;
  sendResult?: Awaited<ReturnType<typeof executeApprovedSend>>;
};

export async function runDeadlineEmailWorkflow(
  config: SuperTAConfig,
  store: SuperTAStore,
  gmailClient: GmailClient,
  classifier: ClassifierProvider,
  professorSender: string,
  thread: NormalizedThread,
): Promise<DeadlineWorkflowResult> {
  const inbound = await processInboundThreadWithClassifier(config, store, classifier, thread);

  if (inbound.outcome.type !== 'queue') {
    return {
      approveResult: {
        type: 'ignored',
        reason: `Inbound workflow did not queue a review item; outcome was ${inbound.outcome.type}.`,
      },
    };
  }

  const reviewItemId = inbound.outcome.item.id;
  const approveResult = await executeProfessorCommand(
    config,
    store,
    professorSender,
    `[SUPERTA APPROVE] ${reviewItemId}`,
  );

  if (approveResult.type !== 'approve' || !approveResult.ok) {
    return {
      queuedReviewItemId: reviewItemId,
      approveResult,
    };
  }

  const sendResult = await executeApprovedSend(store, gmailClient, reviewItemId);

  return {
    queuedReviewItemId: reviewItemId,
    approveResult,
    sendResult,
  };
}
