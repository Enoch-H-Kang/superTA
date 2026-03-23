import { resolve } from 'node:path';
import { runSuperTADoctor } from './doctor.js';

function extractSuggestedFix(message: string) {
  const marker = 'Suggested fix:';
  const index = message.indexOf(marker);
  if (index === -1) return null;
  return message.slice(index + marker.length).trim();
}

export function formatDoctorReport(result: Awaited<ReturnType<typeof runSuperTADoctor>>) {
  const lines = [
    `SuperTA Doctor: ${result.ok ? 'OK' : 'CHECK REQUIRED'}`,
    '',
    'Summary:',
    `- Courses: ${result.summary.courseCount}`,
    `- Pending review items: ${result.summary.pendingReviewCount}`,
    `- Outbound actions: ${result.summary.outboundActionCount}`,
    `- Mailboxes: ${result.summary.mailboxCount}`,
    `- Audit records: ${result.summary.auditCount}`,
    `- Gmail auth: accessToken=${result.auth.hasAccessToken} refreshConfig=${result.auth.hasRefreshConfig}`,
  ];

  const errors = result.issues.filter((issue) => issue.level === 'error');
  const warnings = result.issues.filter((issue) => issue.level === 'warning');

  lines.push('');
  if (errors.length === 0 && warnings.length === 0) {
    lines.push('Status: no issues detected.');
  } else {
    if (errors.length > 0) {
      lines.push('Errors:');
      for (const issue of errors) {
        lines.push(`- ${issue.message}`);
      }
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push('Warnings:');
      for (const issue of warnings) {
        lines.push(`- ${issue.message}`);
      }
      lines.push('');
    }

    const suggestedFixes = result.issues
      .map((issue) => extractSuggestedFix(issue.message))
      .filter((value): value is string => Boolean(value));

    if (suggestedFixes.length > 0) {
      lines.push('Suggested next steps:');
      for (const fix of suggestedFixes) {
        lines.push(`- ${fix}`);
      }
    }
  }

  return lines.join('\n').trimEnd();
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const configPath = process.argv[2] ?? 'local.config.json';
  const stateRoot = process.argv[3];
  const watchThresholdMs = Number(process.argv[4] ?? `${1000 * 60 * 60}`);

  runSuperTADoctor({
    configPath,
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    watchThresholdMs,
  })
    .then((result) => console.log(formatDoctorReport(result)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
