import assert from 'node:assert/strict';
import { processProfessorCommand } from '../src/orchestration/process-professor-command.js';
import type { SuperTAConfig } from '../src/config.js';

const config: SuperTAConfig = {
  professorId: 'prof-enoch',
  gmail: {
    webhookPath: '/webhooks/gmail',
    allowedProfessorSenders: ['prof@example.edu'],
  },
  routing: {
    professorId: 'prof-enoch',
    courses: [],
  },
  courseRoots: {},
};

export function runProcessProfessorCommandTests() {
  const approve = processProfessorCommand(config, 'prof@example.edu', '[SUPERTA APPROVE] rq-1');
  assert.equal(approve.type, 'approve');
  if (approve.type === 'approve') {
    assert.equal(approve.payload, 'rq-1');
  }

  const rollover = processProfessorCommand(config, 'prof@example.edu', '[SUPERTA ROLLOVER] cs101-sp26');
  assert.equal(rollover.type, 'rollover');

  const ignoredUnauthorized = processProfessorCommand(config, 'student@example.edu', '[SUPERTA TASK] do thing');
  assert.equal(ignoredUnauthorized.type, 'ignored');

  const ignoredUnknown = processProfessorCommand(config, 'prof@example.edu', 'No command here');
  assert.equal(ignoredUnknown.type, 'ignored');

  const faq = processProfessorCommand(config, 'prof@example.edu', '[SUPERTA FAQ] add late policy');
  assert.equal(faq.type, 'faq');
}
