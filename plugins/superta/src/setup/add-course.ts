import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { SuperTAConfig } from '../config.js';
import { loadConfigFromFile } from '../config/load-config.js';

export type AddCourseOptions = {
  configPath: string;
  courseId: string;
  termId: string;
  aliases: string[];
  subjectHints?: string[];
  courseRoot: string;
  scaffold?: boolean;
};

async function writeIfMissing(path: string, content: string) {
  try {
    await readFile(path, 'utf8');
  } catch {
    await writeFile(path, content);
  }
}

async function scaffoldCourseRoot(courseRoot: string, courseId: string, termId: string) {
  const courseDir = join(courseRoot, 'course');
  await mkdir(courseDir, { recursive: true });
  await writeIfMissing(join(courseDir, 'syllabus.md'), `# ${courseId} Syllabus\n\nAdd syllabus notes here.\n`);
  await writeIfMissing(join(courseDir, 'faq.md'), `# ${courseId} FAQ\n\nAdd frequently asked questions here.\n`);
  await writeIfMissing(join(courseDir, 'policy.yaml'), `late_days: 0\nattendance: required\n`);
  await writeIfMissing(join(courseDir, 'schedule.yaml'), `term: "${termId}"\n`);
}

export async function addCourseToConfig(options: AddCourseOptions) {
  const config = await loadConfigFromFile(resolve(options.configPath));
  if (config.routing.courses.some((course) => course.courseId === options.courseId)) {
    throw new Error(`Course ${options.courseId} already exists in config.`);
  }

  const next: SuperTAConfig = {
    ...config,
    routing: {
      ...config.routing,
      courses: [
        ...config.routing.courses,
        {
          courseId: options.courseId,
          termId: options.termId,
          aliases: options.aliases,
          subjectHints: options.subjectHints ?? [],
        },
      ],
    },
    courseRoots: {
      ...config.courseRoots,
      [options.courseId]: resolve(options.courseRoot),
    },
  };

  await writeFile(resolve(options.configPath), JSON.stringify(next, null, 2));
  if (options.scaffold) {
    await scaffoldCourseRoot(resolve(options.courseRoot), options.courseId, options.termId);
  }

  return { ok: true, configPath: resolve(options.configPath), courseId: options.courseId, courseRoot: resolve(options.courseRoot) };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [configPath, courseId, termId, aliasesRaw, subjectHintsRaw, courseRoot, scaffoldRaw] = process.argv.slice(2);
  if (!configPath || !courseId || !termId || !aliasesRaw || !subjectHintsRaw || !courseRoot) {
    console.error('Usage: node dist/plugins/superta/src/setup/add-course.js <configPath> <courseId> <termId> <aliasesCsv> <subjectHintsCsv> <courseRoot> [scaffold=true|false]');
    process.exit(1);
  }

  addCourseToConfig({
    configPath,
    courseId,
    termId,
    aliases: aliasesRaw.split(',').map((value) => value.trim()).filter(Boolean),
    subjectHints: subjectHintsRaw.split(',').map((value) => value.trim()).filter(Boolean),
    courseRoot,
    scaffold: scaffoldRaw !== 'false',
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
