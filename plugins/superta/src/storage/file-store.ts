import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { PipelineAuditRecord } from '../audit/schemas.js';
import type { ReviewQueueItem } from '../actions/review-queue.js';
import type { ProposalRecord } from '../proposals/types.js';
import type { SuperTAStore } from './store.js';

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
  };
}

export function defaultFileStorePaths(root: string): FileStorePaths {
  return {
    reviewQueuePath: join(root, 'state', 'review-queue.json'),
    auditLogPath: join(root, 'state', 'audit-log.json'),
    proposalsPath: join(root, 'state', 'proposals.json'),
  };
}
