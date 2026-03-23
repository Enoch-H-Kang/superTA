import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { resolve } from 'node:path';
import { initSuperTAConfig } from './init-config.js';
import { addCourseToConfig } from './add-course.js';
import { runSuperTADoctor } from './doctor.js';
import { formatDoctorReport } from './doctor-report.js';
import { formatSetupNextSteps } from './next-steps.js';

export type InteractiveCourseInput = {
  courseId: string;
  termId: string;
  aliases: string[];
  subjectHints: string[];
  courseRoot: string;
  scaffold: boolean;
};

export type InteractiveSetupAnswers = {
  configPath: string;
  professorId: string;
  allowedProfessorSender: string;
  webhookPath: string;
  courseCount: number;
  courses: InteractiveCourseInput[];
};

export async function runInteractiveSetupWithAnswers(answers: InteractiveSetupAnswers) {
  await initSuperTAConfig({
    configPath: answers.configPath,
    professorId: answers.professorId,
    allowedProfessorSenders: [answers.allowedProfessorSender],
    webhookPath: answers.webhookPath,
  });

  for (const course of answers.courses) {
    await addCourseToConfig({
      configPath: answers.configPath,
      courseId: course.courseId,
      termId: course.termId,
      aliases: course.aliases,
      subjectHints: course.subjectHints,
      courseRoot: course.courseRoot,
      scaffold: course.scaffold,
    });
  }

  const doctor = await runSuperTADoctor({
    configPath: answers.configPath,
    stateRoot: resolve(process.cwd()),
  });

  return {
    ok: true,
    configPath: resolve(answers.configPath),
    courseCount: answers.courses.length,
    doctor,
    report: formatDoctorReport(doctor),
  };
}

async function askCourse(rl: readline.Interface, index: number): Promise<InteractiveCourseInput> {
  const courseId = (await rl.question(`Course ${index} id: `)).trim();
  const termId = (await rl.question(`Course ${index} term id: `)).trim();
  const aliases = (await rl.question(`Course ${index} aliases (comma-separated): `))
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const subjectHints = (await rl.question(`Course ${index} subject hints (comma-separated): `))
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const courseRoot = (await rl.question(`Course ${index} course root: `)).trim();
  const scaffoldAnswer = (await rl.question(`Scaffold starter files for course ${index}? [Y/n]: `)).trim().toLowerCase();

  return {
    courseId,
    termId,
    aliases,
    subjectHints,
    courseRoot,
    scaffold: scaffoldAnswer !== 'n' && scaffoldAnswer !== 'no',
  };
}

export async function runInteractiveSetup() {
  const rl = readline.createInterface({ input, output });
  try {
    const configPath = (await rl.question('Config path [local.config.json]: ')).trim() || 'local.config.json';
    const professorId = (await rl.question('Professor id [prof-enoch]: ')).trim() || 'prof-enoch';
    const allowedProfessorSender = (await rl.question('Allowed professor sender email: ')).trim();
    const webhookPath = (await rl.question('Webhook path [/webhooks/gmail]: ')).trim() || '/webhooks/gmail';
    const courseCountRaw = (await rl.question('How many courses do you want to add? [3]: ')).trim() || '3';
    const courseCount = Math.max(1, Number(courseCountRaw) || 3);

    const courses: InteractiveCourseInput[] = [];
    for (let i = 1; i <= courseCount; i += 1) {
      courses.push(await askCourse(rl, i));
    }

    const result = await runInteractiveSetupWithAnswers({
      configPath,
      professorId,
      allowedProfessorSender,
      webhookPath,
      courseCount,
      courses,
    });

    console.log('\nSetup complete.');
    console.log(result.report);
    console.log('');
    console.log(formatSetupNextSteps(configPath));
    return result;
  } finally {
    rl.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  runInteractiveSetup().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
