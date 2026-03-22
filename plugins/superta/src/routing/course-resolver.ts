export type CourseRoute = {
  professorId: string;
  courseId?: string;
  termId?: string;
  routeConfidence: number;
  ambiguous: boolean;
};

export function resolveCourseRoute(to: string[], subject: string): CourseRoute {
  const hint = [...to, subject].join(' ').toLowerCase();
  if (hint.includes('cs101')) {
    return {
      professorId: 'prof-placeholder',
      courseId: 'cs101-sp26',
      termId: 'sp26',
      routeConfidence: 0.8,
      ambiguous: false,
    };
  }

  return {
    professorId: 'prof-placeholder',
    routeConfidence: 0.0,
    ambiguous: true,
  };
}
