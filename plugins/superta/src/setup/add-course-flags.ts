import { resolve } from 'node:path';
import { addCourseToConfig } from './add-course.js';
import { getBooleanFlag, getStringFlag, parseFlags } from './cli-args.js';

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const flags = parseFlags(process.argv.slice(2));
  const configPath = getStringFlag(flags, 'config') ?? 'local.config.json';
  const courseId = getStringFlag(flags, 'course-id');
  const termId = getStringFlag(flags, 'term-id');
  const aliases = (getStringFlag(flags, 'aliases') ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  const subjectHints = (getStringFlag(flags, 'subject-hints') ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  const courseRoot = getStringFlag(flags, 'course-root');
  const scaffold = getBooleanFlag(flags, 'scaffold', true);

  if (!courseId || !termId || aliases.length === 0 || !courseRoot) {
    console.error('Usage: node dist/plugins/superta/src/setup/add-course-flags.js --config local.config.json --course-id cs101-sp26 --term-id sp26 --aliases cs101@school.edu --subject-hints cs101 --course-root ./courses/cs101-sp26 [--scaffold true]');
    process.exit(1);
  }

  addCourseToConfig({ configPath, courseId, termId, aliases, subjectHints, courseRoot, scaffold })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
