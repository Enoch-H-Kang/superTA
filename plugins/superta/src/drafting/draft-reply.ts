import type { Classification } from '../routing/classify.js';
import type { EvidenceItem } from '../retrieval/build-evidence-bundle.js';

export function draftReply(classification: Classification, evidence: EvidenceItem[]) {
  return {
    subjectPrefix: 'Re:',
    body: `Draft action: ${classification.action}\nEvidence count: ${evidence.length}`,
  };
}
