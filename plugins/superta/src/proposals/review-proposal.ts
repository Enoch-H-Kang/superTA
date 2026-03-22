import type { ProposalRecord, ProposalStatus } from './types.js';

export function updateProposalStatus(proposal: ProposalRecord, status: ProposalStatus): ProposalRecord {
  return {
    ...proposal,
    status,
  };
}
