import type { SuperTAConfig } from './config.js';
import type { ReviewQueueItem } from './actions/review-queue.js';
import type { PipelineAuditRecord } from './audit/schemas.js';
import type { EvidenceItem } from './retrieval/build-evidence-bundle.js';
import type { OutboundActionRecord } from './storage/store.js';
import type { StudentCaseEvent, StudentCaseRecord } from './storage/case-ledger.js';

export type PrivacyConfig = {
  ferpaSafeMode: boolean;
  allowExternalClassifier: boolean;
  allowSend: boolean;
  redactOperatorViews: boolean;
  storeEvidenceSnippets: boolean;
};

function maskEmail(value: string) {
  const trimmed = value.trim();
  const at = trimmed.indexOf('@');
  if (at <= 1) {
    return '[redacted-email]';
  }

  return `${trimmed.slice(0, 1)}***${trimmed.slice(at)}`;
}

function truncate(value: string, max = 96) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function redactEvidence(items: EvidenceItem[]): EvidenceItem[] {
  return items.map((item) => ({
    ...item,
    snippet: '[redacted-evidence-snippet]',
  }));
}

export function redactReviewQueueItem(item: ReviewQueueItem): ReviewQueueItem {
  return {
    ...item,
    replyTo: item.replyTo.map(maskEmail),
    draftSubject: '[redacted-subject]',
    draftBody: '[redacted-draft-body]',
    draftSummary: '[redacted-draft-summary]',
    evidence: redactEvidence(item.evidence),
  };
}

export function redactAuditRecord(record: PipelineAuditRecord): PipelineAuditRecord {
  return {
    ...record,
    evidence: redactEvidence(record.evidence),
  };
}

export function redactOutboundActionRecord(record: OutboundActionRecord): OutboundActionRecord {
  return {
    ...record,
    recipients: record.recipients.map(maskEmail),
    subject: '[redacted-subject]',
  };
}

export function redactStudentCaseRecord(record: StudentCaseRecord): StudentCaseRecord {
  return {
    ...record,
    student: {
      ...record.student,
      key: '[redacted-student-key]',
      primaryEmail: maskEmail(record.student.primaryEmail),
      displayName: '[redacted-student]',
      observedEmails: record.student.observedEmails.map(maskEmail),
    },
    subject: '[redacted-subject]',
    requestSummary: '[redacted-request-summary]',
  };
}

export function redactStudentCaseEvent(event: StudentCaseEvent): StudentCaseEvent {
  return {
    ...event,
    reason: truncate(event.reason),
  };
}

export function summarizeBlockedSendReason(config: Pick<SuperTAConfig, 'privacy'>) {
  return config.privacy.allowSend
    ? 'Send is enabled.'
    : 'FERPA-safe mode keeps outbound send disabled by default. Create drafts and have the professor send manually, or explicitly opt in to sending after institutional review.';
}

export function summarizeBlockedClassifierReason(config: Pick<SuperTAConfig, 'privacy'>) {
  return config.privacy.allowExternalClassifier
    ? 'External classifier use is enabled.'
    : 'FERPA-safe mode keeps external classifier/model calls disabled by default. Use the stub/deterministic path unless you have explicit institutional approval.';
}

export function summarizePrivacyPosture(config: Pick<SuperTAConfig, 'privacy'>) {
  return {
    ferpaSafeMode: config.privacy.ferpaSafeMode,
    allowExternalClassifier: config.privacy.allowExternalClassifier,
    allowSend: config.privacy.allowSend,
    redactOperatorViews: config.privacy.redactOperatorViews,
    storeEvidenceSnippets: config.privacy.storeEvidenceSnippets,
  };
}

export function renderRedactedPreview(value: string) {
  return truncate(value);
}
