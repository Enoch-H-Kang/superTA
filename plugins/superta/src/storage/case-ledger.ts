import type { Classification, ClassificationCategory } from '../routing/classify.js';
import type { ProcessInboundResult } from '../orchestration/process-inbound-thread.js';
import type { NormalizedThread } from '../gmail/normalize.js';
import type { ReviewStatus } from '../actions/review-queue.js';

export type StudentCaseType =
  | 'exam-time-change'
  | 'extension-request'
  | 'grade-question'
  | 'accommodation'
  | 'integrity'
  | 'wellbeing'
  | 'logistics'
  | 'policy-question'
  | 'technical-issue'
  | 'other';

export type StudentCaseSensitivity = 'routine' | 'sensitive' | 'restricted';
export type StudentCaseStatus = 'pending_review' | 'queued' | 'approved' | 'rejected' | 'escalated' | 'needs_more_info';

export type NormalizedStudentIdentity = {
  key: string;
  primaryEmail: string;
  displayName: string;
  observedEmails: string[];
};

export type StudentCaseRecord = {
  id: string;
  threadId: string;
  messageId: string;
  courseId?: string;
  student: NormalizedStudentIdentity;
  subject: string;
  caseType: StudentCaseType;
  category: ClassificationCategory;
  sensitivity: StudentCaseSensitivity;
  status: StudentCaseStatus;
  requestSummary: string;
  requestedAt: string;
  updatedAt: string;
  source: {
    threadId: string;
    messageId: string;
  };
};

export type StudentCaseEvent = {
  id: string;
  caseId: string;
  type: 'email_received' | 'queued_for_review' | 'approved' | 'rejected' | 'escalated' | 'needs_more_info' | 'merged_followup';
  recordedAt: string;
  threadId: string;
  messageId: string;
  status: StudentCaseStatus;
  reason: string;
};

function normalizeEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim().toLowerCase();
}

function displayFromEmail(value: string) {
  return value.includes('<') ? value.split('<')[0]?.trim() || normalizeEmailAddress(value) : normalizeEmailAddress(value);
}

export function normalizeStudentIdentity(value: string): NormalizedStudentIdentity {
  const primaryEmail = normalizeEmailAddress(value);
  return {
    key: primaryEmail,
    primaryEmail,
    displayName: displayFromEmail(value),
    observedEmails: [primaryEmail],
  };
}

function inferCaseType(thread: NormalizedThread, classification: Classification): StudentCaseType {
  const haystack = `${thread.subject} ${thread.bodyText}`.toLowerCase();
  if (/exam|midterm|final|quiz/.test(haystack) && /time|resched|move|conflict|change/.test(haystack)) {
    return 'exam-time-change';
  }
  if (/extend|extension|late|deadline/.test(haystack)) {
    return 'extension-request';
  }

  switch (classification.category) {
    case 'grade-related':
      return 'grade-question';
    case 'accommodation-sensitive':
      return 'accommodation';
    case 'integrity-sensitive':
      return 'integrity';
    case 'wellbeing/safety':
      return 'wellbeing';
    case 'technical/setup':
      return 'technical-issue';
    case 'policy':
      return 'policy-question';
    case 'logistics':
    case 'office-hours/admin':
      return 'logistics';
    default:
      return 'other';
  }
}

function inferSensitivity(category: ClassificationCategory): StudentCaseSensitivity {
  if (category === 'grade-related' || category === 'accommodation-sensitive') {
    return 'sensitive';
  }
  if (category === 'integrity-sensitive' || category === 'wellbeing/safety') {
    return 'restricted';
  }
  return 'routine';
}

function inferStatus(result: ProcessInboundResult): StudentCaseStatus {
  switch (result.outcome.type) {
    case 'queue':
      return 'queued';
    case 'escalate':
      return 'escalated';
    case 'needs_more_info':
      return 'needs_more_info';
  }
}

function summarizeRequest(thread: NormalizedThread, classification: Classification) {
  const compactBody = thread.bodyText.replace(/\s+/g, ' ').trim();
  const base = compactBody.length > 160 ? `${compactBody.slice(0, 160)}…` : compactBody;
  return base || classification.reason;
}

export function buildStudentCaseRecord(thread: NormalizedThread, result: ProcessInboundResult, recordedAt = new Date().toISOString()): StudentCaseRecord {
  return {
    id: `${thread.threadId}:${thread.messageId}`,
    threadId: thread.threadId,
    messageId: thread.messageId,
    courseId: result.route.courseId,
    student: normalizeStudentIdentity(thread.from),
    subject: thread.subject,
    caseType: inferCaseType(thread, result.classification),
    category: result.classification.category,
    sensitivity: inferSensitivity(result.classification.category),
    status: inferStatus(result),
    requestSummary: summarizeRequest(thread, result.classification),
    requestedAt: recordedAt,
    updatedAt: recordedAt,
    source: {
      threadId: thread.threadId,
      messageId: thread.messageId,
    },
  };
}

export function buildStudentCaseEvent(record: StudentCaseRecord, result: ProcessInboundResult, recordedAt = new Date().toISOString()): StudentCaseEvent {
  const eventType = result.outcome.type === 'queue'
    ? 'queued_for_review'
    : result.outcome.type === 'escalate'
      ? 'escalated'
      : 'needs_more_info';

  return {
    id: `${record.id}:${eventType}:${recordedAt}`,
    caseId: record.id,
    type: eventType,
    recordedAt,
    threadId: record.threadId,
    messageId: record.messageId,
    status: record.status,
    reason: result.classification.reason,
  };
}

function mapReviewStatus(status: ReviewStatus): StudentCaseStatus {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'escalated':
      return 'escalated';
    default:
      return 'queued';
  }
}

function mapReviewEventType(status: ReviewStatus): StudentCaseEvent['type'] {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'escalated':
      return 'escalated';
    default:
      return 'queued_for_review';
  }
}

export function transitionStudentCase(record: StudentCaseRecord, status: ReviewStatus, recordedAt = new Date().toISOString()): StudentCaseRecord {
  return {
    ...record,
    status: mapReviewStatus(status),
    updatedAt: recordedAt,
  };
}

export function buildStudentCaseTransitionEvent(record: StudentCaseRecord, status: ReviewStatus, reason: string, recordedAt = new Date().toISOString()): StudentCaseEvent {
  return {
    id: `${record.id}:${mapReviewEventType(status)}:${recordedAt}`,
    caseId: record.id,
    type: mapReviewEventType(status),
    recordedAt,
    threadId: record.threadId,
    messageId: record.messageId,
    status: record.status,
    reason,
  };
}

export function isOpenStudentCase(record: StudentCaseRecord) {
  return !['approved', 'rejected'].includes(record.status);
}

export function mergeStudentCaseRecord(existing: StudentCaseRecord, incoming: StudentCaseRecord, recordedAt = new Date().toISOString()): StudentCaseRecord {
  return {
    ...existing,
    threadId: incoming.threadId,
    messageId: incoming.messageId,
    subject: incoming.subject,
    status: incoming.status,
    sensitivity: incoming.sensitivity,
    requestSummary: incoming.requestSummary,
    updatedAt: recordedAt,
    source: incoming.source,
    student: {
      ...existing.student,
      displayName: incoming.student.displayName || existing.student.displayName,
      observedEmails: Array.from(new Set([...existing.student.observedEmails, ...incoming.student.observedEmails])),
    },
  };
}

export function buildStudentCaseMergedEvent(record: StudentCaseRecord, reason: string, recordedAt = new Date().toISOString()): StudentCaseEvent {
  return {
    id: `${record.id}:merged_followup:${recordedAt}`,
    caseId: record.id,
    type: 'merged_followup',
    recordedAt,
    threadId: record.threadId,
    messageId: record.messageId,
    status: record.status,
    reason,
  };
}
