import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInteractiveSetupWithAnswers } from '../src/setup/interactive-setup.js';

export async function runInteractiveSetupTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-interactive-setup-'));
  const configPath = join(root, 'local.config.json');

  try {
    const result = await runInteractiveSetupWithAnswers({
      configPath,
      professorId: 'prof-enoch',
      allowedProfessorSender: 'prof@example.edu',
      webhookPath: '/webhooks/gmail',
      courseCount: 2,
      courses: [
        {
          courseId: 'cs101-sp26',
          termId: 'sp26',
          aliases: ['cs101@school.edu'],
          subjectHints: ['cs101'],
          courseRoot: join(root, 'courses', 'cs101-sp26'),
          scaffold: true,
        },
        {
          courseId: 'econ201-sp26',
          termId: 'sp26',
          aliases: ['econ201@school.edu'],
          subjectHints: ['econ201'],
          courseRoot: join(root, 'courses', 'econ201-sp26'),
          scaffold: true,
        },
      ],
    });

    assert.equal(result.ok, true);
    assert.equal(result.courseCount, 2);
    assert.match(result.report, /SuperTA Doctor:/);
    assert.match(result.report, /Summary:/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
