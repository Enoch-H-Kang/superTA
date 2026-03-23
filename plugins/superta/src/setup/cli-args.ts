export function parseFlags(argv: string[]) {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token?.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
      continue;
    }
    flags[key] = next;
    i += 1;
  }
  return flags;
}

export function getStringFlag(flags: Record<string, string | boolean>, key: string) {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

export function getBooleanFlag(flags: Record<string, string | boolean>, key: string, fallback = false) {
  const value = flags[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value !== 'false';
  return fallback;
}
