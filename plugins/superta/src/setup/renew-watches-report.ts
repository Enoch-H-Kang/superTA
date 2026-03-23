import { resolve } from 'node:path';
import { runRenewWatchesCommand } from './renew-watches.js';

export function formatRenewWatchesReport(result: Awaited<ReturnType<typeof runRenewWatchesCommand>>) {
  const lines = [
    `Watch renewal: ${result.ok ? 'OK' : 'CHECK REQUIRED'}`,
    `- Renewed: ${result.renewedCount}`,
    `- Skipped: ${result.skippedCount}`,
  ];

  if (result.renewed.length > 0) {
    lines.push('Renewed mailboxes:');
    for (const mailbox of result.renewed) {
      lines.push(`- ${mailbox.emailAddress} (historyId=${mailbox.historyId ?? 'unknown'}, expiration=${mailbox.watchExpiration ?? 'unknown'})`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped mailboxes:');
    for (const email of result.skipped) {
      lines.push(`- ${email}`);
    }
  }

  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const thresholdMs = Number(process.argv[3] ?? `${1000 * 60 * 60}`);
  const emailAddress = process.argv[4];

  runRenewWatchesCommand({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    thresholdMs,
    emailAddress,
  })
    .then((result) => console.log(formatRenewWatchesReport(result)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
