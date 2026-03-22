import type { SuperTAStore } from '../storage/store.js';
import type { ProposalStatus } from '../proposals/types.js';
import { updateProposalStatus } from '../proposals/review-proposal.js';

export async function reviewStoredProposal(
  store: SuperTAStore,
  proposalId: string,
  status: Extract<ProposalStatus, 'approved' | 'rejected'>,
) {
  const proposal = await store.getProposal(proposalId);
  if (!proposal) {
    return {
      ok: false,
      reason: 'Proposal not found.',
    };
  }

  const updated = updateProposalStatus(proposal, status);
  await store.saveProposal(updated);
  return {
    ok: true,
    proposal: updated,
    reason: `Proposal marked as ${status}.`,
  };
}
