import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProposal } from '../src/proposals/create-proposal.js';
import { updateProposalStatus } from '../src/proposals/review-proposal.js';
import { applyProposalToCourseFiles } from '../src/proposals/apply-proposal.js';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';
import { reviewStoredProposal } from '../src/commands/review-proposal-command.js';

export async function runProposalReviewAndApplyTests() {
  const courseRoot = await mkdtemp(join(tmpdir(), 'superta-proposal-course-'));
  const stateRoot = await mkdtemp(join(tmpdir(), 'superta-proposal-state-'));

  try {
    const courseDir = join(courseRoot, 'course');
    await mkdir(courseDir, { recursive: true });
    await writeFile(join(courseDir, 'faq.md'), '# FAQ\n');
    await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');

    const faqProposal = createProposal('faq', 'Clarify late-day usage', 'prof@example.edu');
    const approvedFaq = updateProposalStatus(faqProposal, 'approved');
    const faqApply = await applyProposalToCourseFiles(courseRoot, approvedFaq);
    assert.equal(faqApply.ok, true);
    const faqText = await readFile(join(courseDir, 'faq.md'), 'utf8');
    assert.match(faqText, /- Clarify late-day usage/);

    const faqApplyAgain = await applyProposalToCourseFiles(courseRoot, approvedFaq);
    assert.equal(faqApplyAgain.ok, true);
    const faqTextAgain = await readFile(join(courseDir, 'faq.md'), 'utf8');
    const faqMatches = faqTextAgain.match(/Clarify late-day usage/g) ?? [];
    assert.equal(faqMatches.length, 1);

    const policyProposal = createProposal('policy', 'Extensions require TA approval', 'prof@example.edu');
    const approvedPolicy = updateProposalStatus(policyProposal, 'approved');
    const policyApply = await applyProposalToCourseFiles(courseRoot, approvedPolicy);
    assert.equal(policyApply.ok, true);
    const policyText = await readFile(join(courseDir, 'policy.yaml'), 'utf8');
    assert.match(policyText, /extensions_require_ta_approval:/);
    assert.match(policyText, /Extensions require TA approval/);

    const policyApplyAgain = await applyProposalToCourseFiles(courseRoot, approvedPolicy);
    assert.equal(policyApplyAgain.ok, true);
    const policyTextAgain = await readFile(join(courseDir, 'policy.yaml'), 'utf8');
    const policyMatches = policyTextAgain.match(/Extensions require TA approval/g) ?? [];
    assert.equal(policyMatches.length, 1);

    const pendingProposal = createProposal('faq', 'Pending item', 'prof@example.edu');
    const pendingApply = await applyProposalToCourseFiles(courseRoot, pendingProposal);
    assert.equal(pendingApply.ok, false);

    const store = createFileStore(defaultFileStorePaths(stateRoot));
    await store.saveProposal(faqProposal);
    const reviewed = await reviewStoredProposal(store, faqProposal.id, 'approved');
    assert.equal(reviewed.ok, true);
    if (!('proposal' in reviewed) || !reviewed.proposal) {
      throw new Error('Expected proposal payload in successful review result');
    }
    assert.equal(reviewed.proposal.status, 'approved');

    const missing = await reviewStoredProposal(store, 'proposal-missing', 'rejected');
    assert.equal(missing.ok, false);
  } finally {
    await rm(courseRoot, { recursive: true, force: true });
    await rm(stateRoot, { recursive: true, force: true });
  }
}
