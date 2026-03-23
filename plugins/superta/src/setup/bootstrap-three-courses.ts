import { resolve } from 'node:path';
import { initSuperTAConfig } from './init-config.js';
import { addCourseToConfig } from './add-course.js';
import { runSuperTADoctor } from './doctor.js';

export type BootstrapCourse = {
  courseId: string;
  termId: string;
  alias: string;
  subjectHint: string;
  courseRoot: string;
};

export type BootstrapThreeCoursesOptions = {
  configPath: string;
  professorId: string;
  allowedProfessorSender: string;
  webhookPath?: string;
  courses: BootstrapCourse[];
};

export async function bootstrapThreeCourses(options: BootstrapThreeCoursesOptions) {
  await initSuperTAConfig({
    configPath: options.configPath,
    professorId: options.professorId,
    allowedProfessorSenders: [options.allowedProfessorSender],
    webhookPath: options.webhookPath,
  });

  for (const course of options.courses) {
    await addCourseToConfig({
      configPath: options.configPath,
      courseId: course.courseId,
      termId: course.termId,
      aliases: [course.alias],
      subjectHints: [course.subjectHint],
      courseRoot: course.courseRoot,
      scaffold: true,
    });
  }

  const doctor = await runSuperTADoctor({
    configPath: options.configPath,
    stateRoot: resolve(process.cwd()),
  });

  return {
    ok: true,
    configPath: resolve(options.configPath),
    courseCount: options.courses.length,
    doctor,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [configPath, professorId, allowedProfessorSender, c1, c2, c3] = process.argv.slice(2);
  if (!configPath || !professorId || !allowedProfessorSender || !c1 || !c2 || !c3) {
    console.error('Usage: node dist/plugins/superta/src/setup/bootstrap-three-courses.js <configPath> <professorId> <allowedProfessorSender> <course1Spec> <course2Spec> <course3Spec>');
    console.error('courseSpec format: courseId|termId|alias|subjectHint|courseRoot');
    process.exit(1);
  }

  const parseCourse = (spec: string): BootstrapCourse => {
    const [courseId, termId, alias, subjectHint, courseRoot] = spec.split('|');
    if (!courseId || !termId || !alias || !subjectHint || !courseRoot) {
      throw new Error(`Invalid course spec: ${spec}`);
    }
    return { courseId, termId, alias, subjectHint, courseRoot };
  };

  bootstrapThreeCourses({
    configPath,
    professorId,
    allowedProfessorSender,
    courses: [parseCourse(c1), parseCourse(c2), parseCourse(c3)],
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
