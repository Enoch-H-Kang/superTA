import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { PipelineAuditRecord } from '../audit/schemas.js';
import type { ReviewQueueItem } from '../actions/review-queue.js';
import type { ProposalRecord } from '../proposals/types.js';
import type { GmailMailboxState, OutboundActionRecord, SuperTAStore } from './store.js';

async function ensureParent(path: string) {
  await mkdir(dirname(path), { recursive: true });
}

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(path: string, value: unknown) {
  await ensureParent(path);
  await writeFile(path, JSON.stringify(value, null, 2));
}

export type FileStorePaths = {
  reviewQueuePath: string;
  auditLogPath: string;
  proposalsPath: string;
  gmailCheckpointPath: string;
  gmailMailboxStatePath: string;
  outboundActionsPath: string;
};

export function createFileStore(paths: FileStorePaths): SuperTAStore {
  return {
    async saveReviewItem(item: ReviewQueueItem) {
      const items = await readJsonFile<ReviewQueueItem[]>(paths.reviewQueuePath, []);
      const next = items.filter((existing) => existing.id !== item.id);
      next.push(item);
      await writeJsonFile(paths.reviewQueuePath, next);
    },

    async getReviewItem(id: string) {
      const items = await readJsonFile<ReviewQueueItem[]>(paths.reviewQueuePath, []);
      return items.find((item) => item.id === id) ?? null;
    },

    async listReviewItems() {
      return readJsonFile<ReviewQueueItem[]>(paths.reviewQueuePath, []);
    },

    async appendAuditRecord(record: PipelineAuditRecord) {
      const records = await readJsonFile<PipelineAuditRecord[]>(paths.auditLogPath, []);
      records.push(record);
      await writeJsonFile(paths.auditLogPath, records);
    },

    async listAuditRecords() {
      return readJsonFile<PipelineAuditRecord[]>(paths.auditLogPath, []);
    },

    async saveProposal(proposal: ProposalRecord) {
      const records = await readJsonFile<ProposalRecord[]>(paths.proposalsPath, []);
      const next = records.filter((existing) => existing.id !== proposal.id);
      next.push(proposal);
      await writeJsonFile(paths.proposalsPath, next);
    },

    async getProposal(id: string) {
      const records = await readJsonFile<ProposalRecord[]>(paths.proposalsPath, []);
      return records.find((proposal) => proposal.id === id) ?? null;
    },

    async listProposals() {
      return readJsonFile<ProposalRecord[]>(paths.proposalsPath, []);
    },

    async hasProcessedGmailEvent(key: string) {
      const keys = await readJsonFile<string[]>(paths.gmailCheckpointPath, []);
      return keys.includes(key);
    },

    async markProcessedGmailEvent(key: string) {
      const keys = await readJsonFile<string[]>(paths.gmailCheckpointPath, []);
      if (!keys.includes(key)) {
        keys.push(key);
        await writeJsonFile(paths.gmailCheckpointPath, keys);
      }
    },

    async listProcessedGmailEvents() {
      return readJsonFile<string[]>(paths.gmailCheckpointPath, []);
    },

    async saveGmailMailboxState(state: GmailMailboxState) {
      const states = await readJsonFile<GmailMailboxState[]>(paths.gmailMailboxStatePath, []);
      const next = states.filter((existing) => existing.emailAddress !== state.emailAddress);
      next.push(state);
      await writeJsonFile(paths.gmailMailboxStatePath, next);
    },

    async getGmailMailboxState(emailAddress: string) {
      const states = await readJsonFile<GmailMailboxState[]>(paths.gmailMailboxStatePath, []);
      return states.find((state) => state.emailAddress === emailAddress) ?? null;
    },

    async listGmailMailboxStates() {
      return readJsonFile<GmailMailboxState[]>(paths.gmailMailboxStatePath, []);
    },

    async appendOutboundActionRecord(record: OutboundActionRecord) {
      const records = await readJsonFile<OutboundActionRecord[]>(paths.outboundActionsPath, []);
      records.push(record);
      await writeJsonFile(paths.outboundActionsPath, records);
    },

    async listOutboundActionRecords() {
      return readJsonFile<OutboundActionRecord[]>(paths.outboundActionsPath, []);
    },
  };
}

export function defaultFileStorePaths(root: string): FileStorePaths {
  return {
    reviewQueuePath: join(root, 'state', 'review-queue.json'),
    auditLogPath: join(root, 'state', 'audit-log.json'),
    proposalsPath: join(root, 'state', 'proposals.json'),
    gmailCheckpointPath: join(root, 'state', 'gmail-checkpoints.json'),
    gmailMailboxStatePath: join(root, 'state', 'gmail-mailboxes.json'),
    outboundActionsPath: join(root, 'state', 'outbound-actions.json'),
  };
}
