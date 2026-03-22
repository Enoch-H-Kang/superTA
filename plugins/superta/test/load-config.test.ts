import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfigFromFile } from '../src/config/load-config.js';

export async function runLoadConfigTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-config-load-'));

  try {
    const fullPath = join(root, 'config-full.json');
    await writeFile(
      fullPath,
      JSON.stringify(
        {
          professorId: 'prof-enoch',
          gmail: {
            webhookPath: '/gmail/webhook',
            allowedProfessorSenders: ['prof@example.edu'],
          },
          routing: {
            professorId: 'prof-enoch',
            courses: [
              {
                courseId: 'cs101-sp26',
                termId: 'sp26',
                aliases: ['cs101@school.edu'],
                subjectHints: ['cs101'],
              },
            ],
          },
          courseRoots: {
            'cs101-sp26': '/tmp/cs101',
          },
        },
        null,
        2,
      ),
    );

    const loadedFull = await loadConfigFromFile(fullPath);
    assert.equal(loadedFull.professorId, 'prof-enoch');
    assert.equal(loadedFull.gmail.webhookPath, '/gmail/webhook');
    assert.deepEqual(loadedFull.gmail.allowedProfessorSenders, ['prof@example.edu']);
    assert.equal(loadedFull.routing.courses.length, 1);
    assert.equal(loadedFull.courseRoots['cs101-sp26'], '/tmp/cs101');

    const partialPath = join(root, 'config-partial.json');
    await writeFile(partialPath, JSON.stringify({ professorId: 'prof-partial' }, null, 2));
    const loadedPartial = await loadConfigFromFile(partialPath);
    assert.equal(loadedPartial.professorId, 'prof-partial');
    assert.equal(loadedPartial.gmail.webhookPath, '/webhooks/gmail');
    assert.ok(Array.isArray(loadedPartial.gmail.allowedProfessorSenders));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
