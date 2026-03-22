import assert from 'node:assert/strict';
import { createProposal } from '../src/proposals/create-proposal.js';

export function runProposalTests() {
  const faq = createProposal('faq', 'Add office-hours clarification', 'prof@example.edu');
  assert.equal(faq.kind, 'faq');
  assert.equal(faq.payload, 'Add office-hours clarification');
  assert.equal(faq.status, 'pending');
  assert.equal(faq.createdBy, 'prof@example.edu');
  assert.ok(faq.id.startsWith('faq:'));

  const policy = createProposal('policy', 'Extensions require TA approval', 'prof@example.edu');
  assert.equal(policy.kind, 'policy');
  assert.ok(policy.id.startsWith('policy:'));
}
