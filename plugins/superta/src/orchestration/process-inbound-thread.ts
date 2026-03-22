import type { NormalizedThread } from '../gmail/normalize.js';
import { defaultCourseRouteConfig, resolveCourseRoute, type CourseRouteConfig } from '../routing/course-resolver.js';
import { retrieveCourseFacts } from '../retrieval/retrieve-course-facts.js';
import { applyPolicy } from '../routing/policy-engine.js';
import { createReviewQueueItem } from '../actions/review-queue.js';
import { logAudit } from '../audit/logger.js';
import { draftReply } from '../drafting/draft-reply.js';
import type { Classification } from '../routing/classify.js';

export type ProcessInboundOptions = {
  routeConfig?: CourseRouteConfig;
  classify?: (input: {
    thread: NormalizedThread;
    courseId?: string;
  }) => Classification;
};

export type ProcessInboundResult = {
  route: ReturnType<typeof resolveCourseRoute>;
  evidenceCount: number;
  classification: Classification;
  audit: ReturnType<typeof logAudit>['record'];
  outcome:
    | { type: 'queue'; item: ReturnType<typeof createReviewQueueItem> }
    | { type: 'escalate'; reason: string }
    | { type: 'needs_more_info'; reason: string };
};

const fallbackClassifier = (): Classification => ({
  category: 'other',
  action: 'needs_more_info',
  confidence: 0,
  riskTier: 1,
  requiredSources: [],
  shouldUpdateFaq: false,
  shouldNotifyProfessor: false,
  reason: 'No classifier provided.',
});

export async function processInboundThread(
  thread: NormalizedThread,
  courseRootResolver: (courseId: string) => string,
  options: ProcessInboundOptions = {},
): Promise<ProcessInboundResult> {
  const route = resolveCourseRoute(thread.to, thread.subject, options.routeConfig ?? defaultCourseRouteConfig);
  const courseRoot = route.courseId ? courseRootResolver(route.courseId) : '';
  const evidence = route.courseId ? await retrieveCourseFacts(courseRoot) : [];

  const classify = options.classify ?? fallbackClassifier;
  const initialClassification = classify({ thread, courseId: route.courseId });
  const classification = applyPolicy(route, initialClassification, evidence);

  if (classification.action === 'escalate_now') {
    const audit = logAudit({
      threadId: thread.threadId,
      messageId: thread.messageId,
      courseId: route.courseId,
      route,
      classification,
      evidence,
      outcome: 'escalate',
      outcomeReason: classification.reason,
    }).record;

    return {
      route,
      evidenceCount: evidence.length,
      classification,
      audit,
      outcome: { type: 'escalate', reason: classification.reason },
    };
  }

  if (classification.action === 'needs_more_info') {
    const audit = logAudit({
      threadId: thread.threadId,
      messageId: thread.messageId,
      courseId: route.courseId,
      route,
      classification,
      evidence,
      outcome: 'needs_more_info',
      outcomeReason: classification.reason,
    }).record;

    return {
      route,
      evidenceCount: evidence.length,
      classification,
      audit,
      outcome: { type: 'needs_more_info', reason: classification.reason },
    };
  }

  const drafted = draftReply({
    courseId: route.courseId,
    originalSubject: thread.subject,
    classification,
    evidence,
  });

  const queueItem = createReviewQueueItem({
    id: `${thread.threadId}:${thread.messageId}`,
    threadId: thread.threadId,
    messageId: thread.messageId,
    courseId: route.courseId,
    classification,
    evidence,
    draftSubject: `${drafted.subjectPrefix} ${thread.subject}`,
    draftBody: drafted.body,
  });

  const audit = logAudit({
    threadId: thread.threadId,
    messageId: thread.messageId,
    courseId: route.courseId,
    route,
    classification,
    evidence,
    outcome: 'queue',
    outcomeReason: 'Queued for professor review.',
  }).record;

  return {
    route,
    evidenceCount: evidence.length,
    classification,
    audit,
    outcome: { type: 'queue', item: queueItem },
  };
}
