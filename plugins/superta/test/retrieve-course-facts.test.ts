import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { retrieveCourseFacts } from '../src/retrieval/retrieve-course-facts.js';

export async function runRetrieveCourseFactsTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-retrieve-'));

  try {
    const courseDir = join(root, 'course');
    await mkdir(courseDir, { recursive: true });

    await writeFile(join(courseDir, 'syllabus.md'), '# Syllabus\n\nWelcome\n');
    await writeFile(join(courseDir, 'faq.md'), '# FAQ\n\nAnswer\n');
    await writeFile(join(courseDir, 'policy.yaml'), 'late_days: 2\n');
    await writeFile(join(courseDir, 'schedule.yaml'), 'term: "sp26"\n');

    const evidence = await retrieveCourseFacts(root);
    assert.equal(evidence.length, 4);
    assert.equal(evidence[0]?.type, 'syllabus');
    assert.equal(evidence[1]?.type, 'faq');
    assert.equal(evidence[2]?.type, 'policy');
    assert.equal(evidence[3]?.type, 'schedule');
    assert.match(evidence[2]?.snippet ?? '', /late_days/);
    assert.match(evidence[3]?.snippet ?? '', /sp26/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
