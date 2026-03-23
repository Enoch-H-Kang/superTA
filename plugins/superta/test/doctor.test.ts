import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initSuperTAConfig } from '../src/setup/init-config.js';
import { addCourseToConfig } from '../src/setup/add-course.js';
import { runSuperTADoctor } from '../src/setup/doctor.js';
import { createFileStore, defaultFileStorePaths } from '../src/storage/file-store.js';

export async function runDoctorTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-doctor-'));
  const configPath = join(root, 'local.config.json');

  const originalAccessToken = process.env.GMAIL_ACCESS_TOKEN;
  const originalPublicBaseUrl = process.env.SUPERTA_PUBLIC_BASE_URL;
  const originalPubsubTopic = process.env.GMAIL_PUBSUB_TOPIC;
  const originalProductionMode = process.env.SUPERTA_PRODUCTION_MODE;

  try {
    await initSuperTAConfig({
      configPath,
      professorId: 'prof-enoch',
      allowedProfessorSenders: ['prof@example.edu'],
    });
    await addCourseToConfig({
      configPath,
      courseId: 'cs101-sp26',
      termId: 'sp26',
      aliases: ['cs101@school.edu'],
      subjectHints: ['cs101'],
      courseRoot: join(root, 'courses', 'cs101-sp26'),
      scaffold: true,
    });

    const store = createFileStore(defaultFileStorePaths(root));
    await store.saveGmailMailboxState({
      emailAddress: 'prof@example.edu',
      historyId: '123',
      watchExpiration: String(1_700_000_000_000 + 30_000),
      updatedAt: '2026-03-22T22:00:00.000Z',
    });

    process.env.GMAIL_ACCESS_TOKEN = 'token';
    process.env.SUPERTA_PUBLIC_BASE_URL = 'https://superta.example.edu';
    process.env.GMAIL_PUBSUB_TOPIC = 'projects/demo/topics/gmail';
    process.env.SUPERTA_PRODUCTION_MODE = 'true';

    const result = await runSuperTADoctor({
      configPath,
      stateRoot: root,
      now: 1_700_000_000_000,
      watchThresholdMs: 60_000,
    });

    assert.equal(result.ok, false);
    assert.equal(result.summary.courseCount, 1);
    assert.equal(result.auth.hasAccessToken, true);
    assert.equal(result.production.productionMode, true);
    assert.ok(result.issues.some((issue) => issue.message.includes('nearing expiration')));
    assert.ok(result.issues.some((issue) => issue.level === 'error'));
  } finally {
    if (originalAccessToken === undefined) delete process.env.GMAIL_ACCESS_TOKEN;
    else process.env.GMAIL_ACCESS_TOKEN = originalAccessToken;
    if (originalPublicBaseUrl === undefined) delete process.env.SUPERTA_PUBLIC_BASE_URL;
    else process.env.SUPERTA_PUBLIC_BASE_URL = originalPublicBaseUrl;
    if (originalPubsubTopic === undefined) delete process.env.GMAIL_PUBSUB_TOPIC;
    else process.env.GMAIL_PUBSUB_TOPIC = originalPubsubTopic;
    if (originalProductionMode === undefined) delete process.env.SUPERTA_PRODUCTION_MODE;
    else process.env.SUPERTA_PRODUCTION_MODE = originalProductionMode;
    await rm(root, { recursive: true, force: true });
  }
}
