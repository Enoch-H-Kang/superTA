import type { ProposalKind, ProposalRecord } from './types.js';

export function createProposal(kind: ProposalKind, payload: string, createdBy: string): ProposalRecord {
  return {
    id: `${kind}:${Date.now()}`,
    kind,
    payload,
    status: 'pending',
    createdBy,
    createdAt: new Date().toISOString(),
  };
}
