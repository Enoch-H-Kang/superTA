import type { Classification } from '../routing/classify.js';
import type { EvidenceItem } from '../retrieval/build-evidence-bundle.js';

export type DraftReplyInput = {
  courseId?: string;
  originalSubject: string;
  classification: Classification;
  evidence: EvidenceItem[];
};

export type DraftReplyResult = {
  subjectPrefix: string;
  body: string;
  evidenceSummary: string[];
};

function summarizeEvidence(evidence: EvidenceItem[]) {
  return evidence.map((item) => `${item.type}: ${item.path}`);
}

function buildBody(input: DraftReplyInput) {
  const lines = [
    `Course: ${input.courseId ?? 'unknown-course'}`,
    `Category: ${input.classification.category}`,
    `Action: ${input.classification.action}`,
    `Reason: ${input.classification.reason}`,
  ];

  if (input.evidence.length > 0) {
    lines.push('', 'Grounding evidence:');
    for (const item of input.evidence) {
      lines.push(`- [${item.type}] ${item.snippet}`);
    }
  } else {
    lines.push('', 'Grounding evidence: none available');
  }

  if (input.classification.shouldNotifyProfessor) {
    lines.push('', 'Professor notification recommended.');
  }

  return lines.join('\n');
}

export function draftReply(input: DraftReplyInput): DraftReplyResult {
  return {
    subjectPrefix: 'Re:',
    body: buildBody(input),
    evidenceSummary: summarizeEvidence(input.evidence),
  };
}
