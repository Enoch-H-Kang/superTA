import type { Classification } from '../routing/classify.js';
import type { EvidenceItem } from '../retrieval/build-evidence-bundle.js';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'sent' | 'escalated';

export type ReviewQueueItem = {
  id: string;
  threadId: string;
  messageId: string;
  courseId?: string;
  classification: Classification;
  evidence: EvidenceItem[];
  draftSubject: string;
  draftBody: string;
  status: ReviewStatus;
};

export function createReviewQueueItem(input: Omit<ReviewQueueItem, 'status'>): ReviewQueueItem {
  return {
    ...input,
    status: 'pending',
  };
}

export function updateReviewStatus(item: ReviewQueueItem, status: ReviewStatus): ReviewQueueItem {
  return {
    ...item,
    status,
  };
}
