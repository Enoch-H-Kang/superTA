import type { ReviewQueueItem } from '../actions/review-queue.js';
import type { PipelineAuditRecord } from '../audit/schemas.js';
import type { ProposalRecord } from '../proposals/types.js';

export type ReviewQueueStore = {
  saveReviewItem: (item: ReviewQueueItem) => Promise<void>;
  getReviewItem: (id: string) => Promise<ReviewQueueItem | null>;
  listReviewItems: () => Promise<ReviewQueueItem[]>;
};

export type AuditStore = {
  appendAuditRecord: (record: PipelineAuditRecord) => Promise<void>;
  listAuditRecords: () => Promise<PipelineAuditRecord[]>;
};

export type ProposalStore = {
  saveProposal: (proposal: ProposalRecord) => Promise<void>;
  getProposal: (id: string) => Promise<ProposalRecord | null>;
  listProposals: () => Promise<ProposalRecord[]>;
};

export type SuperTAStore = ReviewQueueStore & AuditStore & ProposalStore;
