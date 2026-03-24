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
          privacy: {
            ferpaSafeMode: true,
            allowExternalClassifier: false,
            allowSend: true,
            redactOperatorViews: true,
            storeEvidenceSnippets: false,
          },
          localModel: {
            required: true,
            provider: 'ollama',
            endpoint: 'http://127.0.0.1:11434',
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
    assert.equal(loadedFull.privacy.allowSend, true);
    assert.equal(loadedFull.privacy.storeEvidenceSnippets, false);
    assert.equal(loadedFull.localModel.provider, 'ollama');
    assert.equal(loadedFull.localModel.endpoint, 'http://127.0.0.1:11434');

    const partialPath = join(root, 'config-partial.json');
    await writeFile(partialPath, JSON.stringify({ professorId: 'prof-partial' }, null, 2));
    const loadedPartial = await loadConfigFromFile(partialPath);
    assert.equal(loadedPartial.professorId, 'prof-partial');
    assert.equal(loadedPartial.gmail.webhookPath, '/webhooks/gmail');
    assert.ok(Array.isArray(loadedPartial.gmail.allowedProfessorSenders));
    assert.equal(loadedPartial.privacy.ferpaSafeMode, true);
    assert.equal(loadedPartial.privacy.allowSend, false);
    assert.equal(loadedPartial.localModel.required, true);
    assert.equal(loadedPartial.localModel.provider, 'stub');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
