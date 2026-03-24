import type { SuperTAStore } from '../storage/store.js';
import type { StudentCaseEvent, StudentCaseRecord, StudentCaseStatus } from '../storage/case-ledger.js';

export type CaseFilters = {
  courseId?: string;
  studentKey?: string;
  status?: StudentCaseStatus;
  caseType?: StudentCaseRecord['caseType'];
  sensitivity?: StudentCaseRecord['sensitivity'];
  query?: string;
};

export type CaseMutationAction = 'approve' | 'deny' | 'close' | 'followup_sent';

function now() {
  return new Date().toISOString();
}

function matchesQuery(record: StudentCaseRecord, query?: string) {
  if (!query) return true;
  const haystack = [
    record.student.key,
    record.student.primaryEmail,
    record.student.displayName,
    record.subject,
    record.requestSummary,
    record.caseType,
    record.courseId ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function eventTypeForAction(action: CaseMutationAction): StudentCaseEvent['type'] {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'deny':
      return 'rejected';
    case 'close':
      return 'needs_more_info';
    case 'followup_sent':
      return 'merged_followup';
  }
}

function statusForAction(action: CaseMutationAction): StudentCaseStatus {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'deny':
      return 'rejected';
    case 'close':
      return 'approved';
    case 'followup_sent':
      return 'approved';
  }
}

export async function listStudentCases(store: SuperTAStore, filters: CaseFilters = {}) {
  const records = await store.listStudentCases();
  return records.filter((record) => {
    if (filters.courseId && record.courseId !== filters.courseId) return false;
    if (filters.studentKey && record.student.key !== filters.studentKey) return false;
    if (filters.status && record.status !== filters.status) return false;
    if (filters.caseType && record.caseType !== filters.caseType) return false;
    if (filters.sensitivity && record.sensitivity !== filters.sensitivity) return false;
    if (!matchesQuery(record, filters.query)) return false;
    return true;
  });
}

export async function getStudentCaseWithEvents(store: SuperTAStore, caseId: string) {
  const record = await store.getStudentCase(caseId);
  if (!record) {
    return null;
  }

  const events = (await store.listStudentCaseEvents()).filter((event) => event.caseId === caseId);
  return {
    record,
    events,
  };
}

export async function addStudentCaseNote(store: SuperTAStore, caseId: string, note: string) {
  const record = await store.getStudentCase(caseId);
  if (!record) {
    return { ok: false as const, reason: 'Case not found.', caseId };
  }

  const event: StudentCaseEvent = {
    id: `${caseId}:note:${now()}`,
    caseId,
    type: 'merged_followup',
    recordedAt: now(),
    threadId: record.threadId,
    messageId: record.messageId,
    status: record.status,
    reason: note,
  };
  await store.appendStudentCaseEvent(event);
  return { ok: true as const, caseId, event };
}

export async function mutateStudentCase(store: SuperTAStore, caseId: string, action: CaseMutationAction, note?: string) {
  const record = await store.getStudentCase(caseId);
  if (!record) {
    return { ok: false as const, reason: 'Case not found.', caseId };
  }

  const updated: StudentCaseRecord = {
    ...record,
    status: statusForAction(action),
    updatedAt: now(),
  };

  const event: StudentCaseEvent = {
    id: `${caseId}:${eventTypeForAction(action)}:${now()}`,
    caseId,
    type: eventTypeForAction(action),
    recordedAt: now(),
    threadId: updated.threadId,
    messageId: updated.messageId,
    status: updated.status,
    reason: note ?? `Case action applied: ${action}`,
  };

  await store.saveStudentCase(updated);
  await store.appendStudentCaseEvent(event);
  return { ok: true as const, caseId, record: updated, event };
}
