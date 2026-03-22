export type ProposalKind = 'faq' | 'policy';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export type ProposalRecord = {
  id: string;
  kind: ProposalKind;
  payload: string;
  status: ProposalStatus;
  createdBy: string;
  createdAt: string;
};
