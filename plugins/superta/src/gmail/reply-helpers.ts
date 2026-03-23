export function extractEmailAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim().toLowerCase();
}

export function resolveSelfAddresses(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = [env.GMAIL_ACCOUNT_EMAIL ?? '', env.GMAIL_ACCOUNT_ALIASES ?? '']
    .filter(Boolean)
    .join(',');

  return raw
    .split(',')
    .map((value) => extractEmailAddress(value))
    .filter(Boolean);
}

export function isSelfAddress(value: string, selfAddresses: string[]): boolean {
  const email = extractEmailAddress(value);
  return selfAddresses.includes(email);
}

export function normalizeReplySubject(subject: string): string {
  const trimmed = subject.trim();
  if (/^re\s*:/i.test(trimmed)) {
    return trimmed;
  }
  return `Re: ${trimmed}`;
}

export function filterReplyRecipients(recipients: string[], selfAddresses: string[]): string[] {
  const seen = new Set<string>();
  const filtered: string[] = [];

  for (const recipient of recipients) {
    const email = extractEmailAddress(recipient);
    if (!email || seen.has(email) || selfAddresses.includes(email)) {
      continue;
    }
    seen.add(email);
    filtered.push(recipient);
  }

  return filtered;
}
