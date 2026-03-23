import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bootstrapThreeCourses } from '../src/setup/bootstrap-three-courses.js';
import { runSuperTADoctor } from '../src/setup/doctor.js';
import { formatDoctorReport } from '../src/setup/doctor-report.js';
import { parseFlags } from '../src/setup/cli-args.js';

export async function runSetupUxTests() {
  const root = await mkdtemp(join(tmpdir(), 'superta-setup-ux-'));
  const configPath = join(root, 'local.config.json');

  try {
    const result = await bootstrapThreeCourses({
      configPath,
      professorId: 'prof-enoch',
      allowedProfessorSender: 'prof@example.edu',
      courses: [
        { courseId: 'cs101-sp26', termId: 'sp26', alias: 'cs101@school.edu', subjectHint: 'cs101', courseRoot: join(root, 'courses', 'cs101-sp26') },
        { courseId: 'econ201-sp26', termId: 'sp26', alias: 'econ201@school.edu', subjectHint: 'econ201', courseRoot: join(root, 'courses', 'econ201-sp26') },
        { courseId: 'stat301-sp26', termId: 'sp26', alias: 'stat301@school.edu', subjectHint: 'stat301', courseRoot: join(root, 'courses', 'stat301-sp26') },
      ],
    });
    assert.equal(result.courseCount, 3);

    const doctor = await runSuperTADoctor({ configPath, stateRoot: root });
    const report = formatDoctorReport(doctor);
    assert.match(report, /SuperTA Doctor:/);
    assert.match(report, /Courses: 3/);

    const flags = parseFlags(['--config', 'local.config.json', '--course-id', 'cs101-sp26', '--scaffold', 'false']);
    assert.equal(flags.config, 'local.config.json');
    assert.equal(flags['course-id'], 'cs101-sp26');
    assert.equal(flags.scaffold, 'false');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
