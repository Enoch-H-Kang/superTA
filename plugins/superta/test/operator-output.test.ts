import assert from 'node:assert/strict';
import { formatDoctorReport } from '../src/setup/doctor-report.js';
import { formatSetupNextSteps } from '../src/setup/next-steps.js';

export function runOperatorOutputTests() {
  const report = formatDoctorReport({
    ok: true,
    summary: {
      courseCount: 3,
      reviewQueueCount: 1,
      outboundActionCount: 2,
      auditCount: 4,
      mailboxCount: 1,
      pendingReviewCount: 1,
    },
    auth: {
      hasAccessToken: true,
      hasRefreshConfig: false,
      apiBaseUrl: undefined,
    },
    production: {
      publicBaseUrl: 'https://superta.example.edu',
      gmailPubsubTopic: 'projects/demo/topics/gmail',
      productionMode: true,
    },
    issues: [
      { level: 'warning', message: 'No Gmail mailbox watch state recorded yet. Suggested fix: run register-watch.js after Gmail auth is working.' },
    ],
  });

  assert.match(report, /Summary:/);
  assert.match(report, /Warnings:/);
  assert.match(report, /Suggested next steps:/);

  const nextSteps = formatSetupNextSteps('local.config.json');
  assert.match(nextSteps, /Next useful commands:/);
  assert.match(nextSteps, /doctor-report/);
}
