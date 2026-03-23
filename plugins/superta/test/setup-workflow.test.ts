import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initSuperTAConfig } from '../src/setup/init-config.js';
import { addCourseToConfig } from '../src/setup/add-course.js';
import { validateSuperTASetup } from '../src/setup/validate-setup.js';
import { listConfiguredCourses } from '../src/setup/list-courses.js';

export async function runSetupWorkflowTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-setup-'));
  const configPath = join(root, 'local.config.json');

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

    await addCourseToConfig({
      configPath,
      courseId: 'econ201-sp26',
      termId: 'sp26',
      aliases: ['econ201@school.edu'],
      subjectHints: ['econ201'],
      courseRoot: join(root, 'courses', 'econ201-sp26'),
      scaffold: true,
    });

    await addCourseToConfig({
      configPath,
      courseId: 'stat301-sp26',
      termId: 'sp26',
      aliases: ['stat301@school.edu'],
      subjectHints: ['stat301'],
      courseRoot: join(root, 'courses', 'stat301-sp26'),
      scaffold: true,
    });

    const listed = await listConfiguredCourses(configPath);
    assert.equal(listed.count, 3);

    const validation = await validateSuperTASetup(configPath);
    assert.equal(validation.ok, true);
    assert.equal(validation.courseCount, 3);

    const raw = JSON.parse(await readFile(configPath, 'utf8')) as { routing: { courses: unknown[] } };
    assert.equal(raw.routing.courses.length, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
