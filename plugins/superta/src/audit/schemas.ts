import type { Classification } from '../routing/classify.js';
import type { CourseRoute } from '../routing/course-resolver.js';
import type { EvidenceItem } from '../retrieval/build-evidence-bundle.js';

export type AuditOutcome = 'queue' | 'escalate' | 'needs_more_info';

export type PipelineAuditRecord = {
  threadId: string;
  messageId: string;
  courseId?: string;
  route: CourseRoute;
  classification: Classification;
  evidence: EvidenceItem[];
  outcome: AuditOutcome;
  outcomeReason: string;
};
