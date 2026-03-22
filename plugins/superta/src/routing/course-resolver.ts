export type CourseRoute = {
  professorId: string;
  courseId?: string;
  termId?: string;
  routeConfidence: number;
  ambiguous: boolean;
};

export type CourseRouteConfigEntry = {
  courseId: string;
  termId: string;
  aliases: string[];
  subjectHints?: string[];
};

export type CourseRouteConfig = {
  professorId: string;
  courses: CourseRouteConfigEntry[];
};

export const defaultCourseRouteConfig: CourseRouteConfig = {
  professorId: 'prof-placeholder',
  courses: [
    {
      courseId: 'cs101-sp26',
      termId: 'sp26',
      aliases: ['cs101@school.edu'],
      subjectHints: ['cs101'],
    },
  ],
};

export function resolveCourseRoute(to: string[], subject: string, config: CourseRouteConfig = defaultCourseRouteConfig): CourseRoute {
  const normalizedTo = to.map((value) => value.toLowerCase());
  const normalizedSubject = subject.toLowerCase();

  const aliasMatches = config.courses.filter((course) =>
    course.aliases.some((alias) => normalizedTo.includes(alias.toLowerCase())),
  );

  if (aliasMatches.length === 1) {
    const course = aliasMatches[0];
    return {
      professorId: config.professorId,
      courseId: course?.courseId,
      termId: course?.termId,
      routeConfidence: 1,
      ambiguous: false,
    };
  }

  if (aliasMatches.length > 1) {
    return {
      professorId: config.professorId,
      routeConfidence: 0,
      ambiguous: true,
    };
  }

  const hintMatches = config.courses.filter((course) =>
    (course.subjectHints ?? []).some((hint) => normalizedSubject.includes(hint.toLowerCase())),
  );

  if (hintMatches.length === 1) {
    const course = hintMatches[0];
    return {
      professorId: config.professorId,
      courseId: course?.courseId,
      termId: course?.termId,
      routeConfidence: 0.8,
      ambiguous: false,
    };
  }

  return {
    professorId: config.professorId,
    routeConfidence: 0,
    ambiguous: true,
  };
}
