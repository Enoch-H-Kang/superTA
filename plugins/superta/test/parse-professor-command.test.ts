import assert from 'node:assert/strict';
import { parseProfessorCommand } from '../src/commands/parse-professor-command.js';
import type { SuperTAConfig } from '../src/config.js';

const config: SuperTAConfig = {
  professorId: 'prof-enoch',
  gmail: {
    webhookPath: '/webhooks/gmail',
    allowedProfessorSenders: ['prof@example.edu', 'ta@example.edu'],
  },
  routing: {
    professorId: 'prof-enoch',
    courses: [],
  },
  courseRoots: {},
  privacy: {
    ferpaSafeMode: true,
    allowExternalClassifier: false,
    allowSend: false,
    redactOperatorViews: true,
    storeEvidenceSnippets: false,
  },
  localModel: {
    required: true,
    provider: 'stub',
  },
};

export function runProfessorCommandParserTests() {
  const approve = parseProfessorCommand(config, 'prof@example.edu', '[SUPERTA APPROVE] rq-1');
  assert.equal(approve.authorized, true);
  assert.equal(approve.command?.type, 'approve');
  assert.equal(approve.command?.payload, 'rq-1');

  const policy = parseProfessorCommand(config, 'TA@example.edu', '[SUPERTA POLICY] extensions require staff approval');
  assert.equal(policy.authorized, true);
  assert.equal(policy.command?.type, 'policy');

  const faq = parseProfessorCommand(config, 'prof@example.edu', '[SUPERTA FAQ] Add late-day explanation');
  assert.equal(faq.command?.type, 'faq');

  const unauthorized = parseProfessorCommand(config, 'student@example.edu', '[SUPERTA APPROVE] rq-1');
  assert.equal(unauthorized.authorized, false);
  assert.equal(unauthorized.command, null);

  const noCommand = parseProfessorCommand(config, 'prof@example.edu', 'Hello there');
  assert.equal(noCommand.authorized, true);
  assert.equal(noCommand.command, null);
}
