import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCourseFiles } from '../src/retrieval/load-course-files.js';

export async function runLoadCourseFilesTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-course-'));

  try {
    const courseDir = join(root, 'course');
    await mkdir(courseDir, { recursive: true });

    await writeFile(join(courseDir, 'syllabus.md'), '# Syllabus\n\nCourse overview\n');
    await writeFile(join(courseDir, 'faq.md'), '# FAQ\n\nQ: Where?\nA: Canvas\n');
    await writeFile(
      join(courseDir, 'policy.yaml'),
      'late_days: 2\nintegrity_escalation: true\nextension_policy: "case-by-case"\n',
    );
    await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\nmilestones: []\n');

    const loaded = await loadCourseFiles(root);
    assert.equal(loaded.ok, true);

    if (loaded.ok) {
      assert.match(loaded.files.syllabus, /Syllabus/);
      assert.match(loaded.files.faq, /Canvas/);
      assert.equal(loaded.files.policy.late_days, 2);
      assert.equal(loaded.files.policy.integrity_escalation, true);
      assert.equal(loaded.files.policy.extension_policy, 'case-by-case');
      assert.equal(loaded.files.schedule.term, 'sp26');
      assert.deepEqual(loaded.files.schedule.milestones, []);
    }

    const missing = await loadCourseFiles(join(root, 'missing-course-root'));
    assert.equal(missing.ok, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
