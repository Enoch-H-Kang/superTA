import type { NormalizedThread } from '../gmail/normalize.js';
import type { SuperTAConfig } from '../config.js';
import type { Classification } from '../routing/classify.js';
import type { SuperTAStore } from '../storage/store.js';
import {
  buildStudentCaseEvent,
  buildStudentCaseMergedEvent,
  buildStudentCaseRecord,
  isOpenStudentCase,
  mergeStudentCaseRecord,
} from '../storage/case-ledger.js';
import { processInboundThreadWithConfig } from './process-with-config.js';

export async function processInboundThreadAndStore(
  config: SuperTAConfig,
  store: SuperTAStore,
  thread: NormalizedThread,
  options: {
    classify?: (input: { thread: NormalizedThread; courseId?: string }) => Classification | Promise<Classification>;
  } = {},
) {
  const result = await processInboundThreadWithConfig(config, thread, options);

  await store.appendAuditRecord({
    threadId: result.audit.threadId,
    messageId: result.audit.messageId,
    courseId: result.audit.courseId,
    route: result.audit.route,
    classification: result.audit.classification,
    evidence: result.audit.evidence,
    outcome: result.audit.outcome,
    outcomeReason: result.audit.outcomeReason,
  });

  if (result.outcome.type === 'queue') {
    await store.saveReviewItem(result.outcome.item);
  }

  const incomingStudentCase = buildStudentCaseRecord(thread, result);
  const existingCases = await store.listStudentCases();
  const matchedOpenCase = existingCases.find(
    (record) =>
      isOpenStudentCase(record)
      && record.courseId === incomingStudentCase.courseId
      && record.caseType === incomingStudentCase.caseType
      && record.student.key === incomingStudentCase.student.key,
  );

  if (matchedOpenCase) {
    const mergedCase = mergeStudentCaseRecord(matchedOpenCase, incomingStudentCase);
    await store.saveStudentCase(mergedCase);
    await store.appendStudentCaseEvent(
      buildStudentCaseMergedEvent(mergedCase, 'Merged follow-up email into existing open case.'),
    );
  } else {
    const studentCaseEvent = buildStudentCaseEvent(incomingStudentCase, result);
    await store.saveStudentCase(incomingStudentCase);
    await store.appendStudentCaseEvent(studentCaseEvent);
  }

  return result;
}
