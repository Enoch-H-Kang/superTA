import { resolve } from 'node:path';
import { bootstrapThreeCourses } from './bootstrap-three-courses.js';
import { getStringFlag, parseFlags } from './cli-args.js';

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const flags = parseFlags(process.argv.slice(2));
  const configPath = getStringFlag(flags, 'config') ?? 'local.config.json';
  const professorId = getStringFlag(flags, 'professor-id');
  const sender = getStringFlag(flags, 'sender');
  const courseSpecs = [getStringFlag(flags, 'course1'), getStringFlag(flags, 'course2'), getStringFlag(flags, 'course3')].filter(Boolean) as string[];

  if (!professorId || !sender || courseSpecs.length !== 3) {
    console.error('Usage: node dist/plugins/superta/src/setup/bootstrap-three-courses-flags.js --config local.config.json --professor-id prof-enoch --sender prof@example.edu --course1 "courseId|termId|alias|subjectHint|courseRoot" --course2 ... --course3 ...');
    process.exit(1);
  }

  const parseCourse = (spec: string) => {
    const [courseId, termId, alias, subjectHint, courseRoot] = spec.split('|');
    if (!courseId || !termId || !alias || !subjectHint || !courseRoot) throw new Error(`Invalid course spec: ${spec}`);
    return { courseId, termId, alias, subjectHint, courseRoot };
  };

  bootstrapThreeCourses({
    configPath,
    professorId,
    allowedProfessorSender: sender,
    courses: courseSpecs.map(parseCourse),
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
