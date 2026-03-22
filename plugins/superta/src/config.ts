import type { CourseRouteConfig } from './routing/course-resolver.js';

export type SuperTAConfig = {
  professorId: string;
  gmail: {
    webhookPath: string;
    allowedProfessorSenders: string[];
  };
  routing: CourseRouteConfig;
  courseRoots: Record<string, string>;
};

export const defaultConfig: SuperTAConfig = {
  professorId: 'prof-placeholder',
  gmail: {
    webhookPath: '/webhooks/gmail',
    allowedProfessorSenders: [],
  },
  routing: {
    professorId: 'prof-placeholder',
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
    'cs101-sp26': '/tmp/cs101-sp26',
  },
};

export function resolveCourseRoot(config: SuperTAConfig, courseId: string): string {
  return config.courseRoots[courseId] ?? '';
}
