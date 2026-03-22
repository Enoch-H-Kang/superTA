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

export type GmailWebhookCheckpointStore = {
  hasProcessedGmailEvent: (key: string) => Promise<boolean>;
  markProcessedGmailEvent: (key: string) => Promise<void>;
  listProcessedGmailEvents: () => Promise<string[]>;
};

export type GmailMailboxState = {
  emailAddress: string;
  historyId?: string;
  watchExpiration?: string;
  updatedAt: string;
};

export type GmailMailboxStateStore = {
  saveGmailMailboxState: (state: GmailMailboxState) => Promise<void>;
  getGmailMailboxState: (emailAddress: string) => Promise<GmailMailboxState | null>;
  listGmailMailboxStates: () => Promise<GmailMailboxState[]>;
};

export type SuperTAStore = ReviewQueueStore & AuditStore & ProposalStore & GmailWebhookCheckpointStore & GmailMailboxStateStore;
