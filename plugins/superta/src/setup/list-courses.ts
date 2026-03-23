import { resolve } from 'node:path';
import { loadConfigFromFile } from '../config/load-config.js';

export async function listConfiguredCourses(configPath: string) {
  const config = await loadConfigFromFile(resolve(configPath));
  return {
    ok: true,
    count: config.routing.courses.length,
    courses: config.routing.courses.map((course) => ({
      courseId: course.courseId,
      termId: course.termId,
      aliases: course.aliases,
      subjectHints: course.subjectHints ?? [],
      courseRoot: config.courseRoots[course.courseId] ?? null,
    })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'local.config.json';
  listConfiguredCourses(configPath)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
