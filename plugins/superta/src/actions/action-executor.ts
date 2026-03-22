import type { ReviewQueueItem } from './review-queue.js';

export type ExecutionAction =
  | { type: 'create_draft' }
  | { type: 'approve_draft' }
  | { type: 'reject_draft' }
  | { type: 'mark_escalated' }
  | { type: 'send_approved' };

export type ExecutionResult = {
  ok: boolean;
  nextStatus?: ReviewQueueItem['status'];
  sideEffect: 'none' | 'draft' | 'send';
  reason: string;
};

export function executeReviewAction(item: ReviewQueueItem, action: ExecutionAction): ExecutionResult {
  switch (action.type) {
    case 'create_draft':
      return {
        ok: item.status === 'pending',
        nextStatus: 'pending',
        sideEffect: 'draft',
        reason: item.status === 'pending' ? 'Draft is available for review.' : 'Draft can only be created from pending state.',
      };
    case 'approve_draft':
      return {
        ok: item.status === 'pending',
        nextStatus: item.status === 'pending' ? 'approved' : item.status,
        sideEffect: 'none',
        reason: item.status === 'pending' ? 'Draft approved for send.' : 'Only pending drafts can be approved.',
      };
    case 'reject_draft':
      return {
        ok: item.status === 'pending' || item.status === 'approved',
        nextStatus: item.status === 'pending' || item.status === 'approved' ? 'rejected' : item.status,
        sideEffect: 'none',
        reason: 'Draft rejected.',
      };
    case 'mark_escalated':
      return {
        ok: item.status !== 'sent',
        nextStatus: item.status !== 'sent' ? 'escalated' : item.status,
        sideEffect: 'none',
        reason: item.status !== 'sent' ? 'Thread escalated to professor/staff.' : 'Sent items cannot be escalated retroactively here.',
      };
    case 'send_approved':
      return {
        ok: item.status === 'approved',
        nextStatus: item.status === 'approved' ? 'sent' : item.status,
        sideEffect: item.status === 'approved' ? 'send' : 'none',
        reason: item.status === 'approved' ? 'Approved draft sent.' : 'Only approved drafts may be sent.',
      };
  }
}
