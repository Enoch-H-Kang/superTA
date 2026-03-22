import assert from 'node:assert/strict';
import { resolveCourseRoute, type CourseRouteConfig } from '../src/routing/course-resolver.js';

const config: CourseRouteConfig = {
  professorId: 'prof-enoch',
  courses: [
    {
      courseId: 'cs101-sp26',
      termId: 'sp26',
      aliases: ['cs101@school.edu'],
      subjectHints: ['cs101'],
    },
    {
      courseId: 'econ201-sp26',
      termId: 'sp26',
      aliases: ['econ201@school.edu'],
      subjectHints: ['econ201'],
    },
  ],
};

export function runRoutingTests() {
  const direct = resolveCourseRoute(['cs101@school.edu'], 'Question about homework', config);
  assert.equal(direct.ambiguous, false);
  assert.equal(direct.courseId, 'cs101-sp26');
  assert.equal(direct.termId, 'sp26');
  assert.equal(direct.professorId, 'prof-enoch');
  assert.equal(direct.routeConfidence, 1);

  const subjectHint = resolveCourseRoute(['random@school.edu'], 'Econ201 question about lecture', config);
  assert.equal(subjectHint.ambiguous, false);
  assert.equal(subjectHint.courseId, 'econ201-sp26');
  assert.equal(subjectHint.routeConfidence, 0.8);

  const unknown = resolveCourseRoute(['random@school.edu'], 'Question about lecture', config);
  assert.equal(unknown.ambiguous, true);
  assert.equal(unknown.courseId, undefined);
  assert.equal(unknown.routeConfidence, 0);

  const conflictingAliases = resolveCourseRoute(['cs101@school.edu', 'econ201@school.edu'], 'Question', config);
  assert.equal(conflictingAliases.ambiguous, true);
  assert.equal(conflictingAliases.courseId, undefined);
}
