import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type CourseFiles = {
  syllabus: string;
  faq: string;
  policy: Record<string, unknown>;
  schedule: Record<string, unknown>;
};

export type LoadCourseFilesResult =
  | { ok: true; files: CourseFiles }
  | { ok: false; error: string };

async function readUtf8(path: string) {
  return readFile(path, 'utf8');
}

function parseSimpleYamlObject(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = input.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;

    const [, keyRaw, valueRaw] = match;
    const key = keyRaw.trim();
    const value = valueRaw.trim();

    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      result[key] = Number(value);
    } else if (value === '[]') {
      result[key] = [];
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      result[key] = value.slice(1, -1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function loadCourseFiles(courseRoot: string): Promise<LoadCourseFilesResult> {
  try {
    const courseDir = join(courseRoot, 'course');
    const [syllabus, faq, policyRaw, scheduleRaw] = await Promise.all([
      readUtf8(join(courseDir, 'syllabus.md')),
      readUtf8(join(courseDir, 'faq.md')),
      readUtf8(join(courseDir, 'policy.yaml')),
      readUtf8(join(courseDir, 'schedule.yaml')),
    ]);

    return {
      ok: true,
      files: {
        syllabus,
        faq,
        policy: parseSimpleYamlObject(policyRaw),
        schedule: parseSimpleYamlObject(scheduleRaw),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown file loading error',
    };
  }
}
