import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import { processProfessorCommand } from '../orchestration/process-professor-command.js';
import { executeReviewAction } from '../actions/action-executor.js';
import { updateReviewStatus } from '../actions/review-queue.js';
import { buildStudentCaseTransitionEvent, transitionStudentCase } from '../storage/case-ledger.js';
import { createProposal } from '../proposals/create-proposal.js';

export type ProfessorCommandExecutionResult =
  | { type: 'ignored'; reason: string }
  | { type: 'approve'; ok: boolean; reason: string; reviewItemId: string }
  | { type: 'policy'; ok: true; payload: string; proposalId: string; reason: string }
  | { type: 'task'; ok: true; payload: string; reason: string }
  | { type: 'faq'; ok: true; payload: string; proposalId: string; reason: string }
  | { type: 'rollover'; ok: true; payload: string; reason: string };

export async function executeProfessorCommand(
  config: SuperTAConfig,
  store: SuperTAStore,
  sender: string,
  body: string,
): Promise<ProfessorCommandExecutionResult> {
  const parsed = processProfessorCommand(config, sender, body);

  if (parsed.type === 'ignored') {
    return parsed;
  }

  if (parsed.type === 'approve') {
    const reviewItemId = parsed.payload;
    const item = await store.getReviewItem(reviewItemId);
    if (!item) {
      return {
        type: 'approve',
        ok: false,
        reviewItemId,
        reason: 'Review item not found.',
      };
    }

    const approval = executeReviewAction(item, { type: 'approve_draft' });
    if (!approval.ok || approval.nextStatus !== 'approved') {
      return {
        type: 'approve',
        ok: false,
        reviewItemId,
        reason: approval.reason,
      };
    }

    const updated = updateReviewStatus(item, 'approved');
    await store.saveReviewItem(updated);

    const existingCase = await store.getStudentCase(reviewItemId);
    if (existingCase) {
      const transitionedCase = transitionStudentCase(existingCase, 'approved');
      await store.saveStudentCase(transitionedCase);
      await store.appendStudentCaseEvent(
        buildStudentCaseTransitionEvent(transitionedCase, 'approved', 'Professor approved review item.'),
      );
    }

    return {
      type: 'approve',
      ok: true,
      reviewItemId,
      reason: 'Review item approved and persisted.',
    };
  }

  if (parsed.type === 'policy') {
    const proposal = createProposal('policy', parsed.payload, sender);
    await store.saveProposal(proposal);
    return {
      type: 'policy',
      ok: true,
      payload: parsed.payload,
      proposalId: proposal.id,
      reason: 'Policy proposal stored for later review/application.',
    };
  }

  if (parsed.type === 'task') {
    return {
      type: 'task',
      ok: true,
      payload: parsed.payload,
      reason: 'Task command accepted but no task runner is wired yet.',
    };
  }

  if (parsed.type === 'faq') {
    const proposal = createProposal('faq', parsed.payload, sender);
    await store.saveProposal(proposal);
    return {
      type: 'faq',
      ok: true,
      payload: parsed.payload,
      proposalId: proposal.id,
      reason: 'FAQ proposal stored for later review/application.',
    };
  }

  return {
    type: 'rollover',
    ok: true,
    payload: parsed.payload,
    reason: 'Rollover command accepted but rollover execution is not yet wired.',
  };
}
