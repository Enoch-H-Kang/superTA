import assert from 'node:assert/strict';
import { draftReply } from '../src/drafting/draft-reply.js';
import type { Classification } from '../src/routing/classify.js';
import type { EvidenceItem } from '../src/retrieval/build-evidence-bundle.js';

function classification(overrides: Partial<Classification> = {}): Classification {
  return {
    category: 'deadline',
    action: 'draft_for_professor',
    confidence: 0.9,
    riskTier: 1,
    requiredSources: ['policy'],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Routine deadline question.',
    ...overrides,
  };
}

function evidence(): EvidenceItem[] {
  return [
    {
      type: 'policy',
      path: 'courses/cs101-sp26/course/policy.yaml',
      snippet: 'late_days: 2',
    },
    {
      type: 'faq',
      path: 'courses/cs101-sp26/course/faq.md',
      snippet: 'Homework can be submitted within the late window.',
    },
  ];
}

export function runDraftReplyTests() {
  const draft = draftReply({
    courseId: 'cs101-sp26',
    originalSubject: 'Question about late work',
    classification: classification(),
    evidence: evidence(),
  });

  assert.equal(draft.subjectPrefix, 'Re:');
  assert.equal(draft.subject, 'Re: Question about late work');
  assert.equal(draft.evidenceSummary.length, 2);
  assert.match(draft.body, /Course: cs101-sp26/);
  assert.match(draft.body, /Category: deadline/);
  assert.match(draft.body, /late_days: 2/);

  const alreadyReply = draftReply({
    courseId: 'cs101-sp26',
    originalSubject: 'Re: Question',
    classification: classification(),
    evidence: [],
  });
  assert.equal(alreadyReply.subjectPrefix, '');
  assert.equal(alreadyReply.subject, 'Re: Question');

  const notifyDraft = draftReply({
    courseId: 'cs101-sp26',
    originalSubject: 'Question',
    classification: classification({ shouldNotifyProfessor: true }),
    evidence: [],
  });
  assert.match(notifyDraft.body, /Professor notification recommended/);
  assert.match(notifyDraft.body, /Grounding evidence: none available/);
}
