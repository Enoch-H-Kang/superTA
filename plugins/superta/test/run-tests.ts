import { runConfigTests } from './config.test.js';
import { runRoutingTests } from './routing.test.js';
import { runClassificationContractTests } from './classify.test.js';
import { runPolicyEngineTests } from './policy-engine.test.js';
import { runLoadCourseFilesTests } from './load-course-files.test.js';
import { runRetrieveCourseFactsTests } from './retrieve-course-facts.test.js';
import { runDraftReplyTests } from './draft-reply.test.js';
import { runReviewQueueTests } from './review-queue.test.js';
import { runActionExecutorTests } from './action-executor.test.js';
import { runGmailClientTests } from './gmail-client.test.js';
import { runGmailExecutorTests } from './gmail-executor.test.js';
import { runAuditLoggerTests } from './audit-logger.test.js';
import { runProcessInboundThreadTests } from './process-inbound-thread.test.js';
import { runProcessWithConfigTests } from './process-with-config.test.js';

async function main() {
  runConfigTests();
  runRoutingTests();
  runClassificationContractTests();
  runPolicyEngineTests();
  await runLoadCourseFilesTests();
  await runRetrieveCourseFactsTests();
  runDraftReplyTests();
  runReviewQueueTests();
  runActionExecutorTests();
  await runGmailClientTests();
  await runGmailExecutorTests();
  runAuditLoggerTests();
  await runProcessInboundThreadTests();
  await runProcessWithConfigTests();
  console.log('plugin tests passed');
}

await main();
