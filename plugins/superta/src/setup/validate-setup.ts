import { access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadConfigFromFile } from '../config/load-config.js';

export type ValidationIssue = {
  level: 'error' | 'warning';
  message: string;
};

export async function validateSuperTASetup(configPath: string) {
  const config = await loadConfigFromFile(resolve(configPath));
  const issues: ValidationIssue[] = [];

  const courseIds = new Set<string>();
  const aliases = new Set<string>();

  for (const course of config.routing.courses) {
    if (courseIds.has(course.courseId)) {
      issues.push({ level: 'error', message: `Duplicate courseId: ${course.courseId}` });
    }
    courseIds.add(course.courseId);

    for (const alias of course.aliases) {
      const normalized = alias.toLowerCase();
      if (aliases.has(normalized)) {
        issues.push({ level: 'error', message: `Duplicate alias: ${alias}` });
      }
      aliases.add(normalized);
    }

    const courseRoot = config.courseRoots[course.courseId];
    if (!courseRoot) {
      issues.push({ level: 'error', message: `Missing courseRoot for ${course.courseId}` });
      continue;
    }

    for (const filename of ['syllabus.md', 'faq.md', 'policy.yaml', 'schedule.yaml']) {
      try {
        await access(join(courseRoot, 'course', filename));
      } catch {
        issues.push({ level: 'warning', message: `Missing ${filename} for ${course.courseId} at ${courseRoot}` });
      }
    }
  }

  if (config.gmail.allowedProfessorSenders.length === 0) {
    issues.push({ level: 'warning', message: 'No allowedProfessorSenders configured.' });
  }

  return {
    ok: !issues.some((issue) => issue.level === 'error'),
    courseCount: config.routing.courses.length,
    issues,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'local.config.json';
  validateSuperTASetup(configPath)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
