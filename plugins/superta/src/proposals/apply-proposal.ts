import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProposalRecord } from './types.js';

async function readText(path: string) {
  return readFile(path, 'utf8');
}

async function writeText(path: string, content: string) {
  await writeFile(path, content);
}

function appendFaqBullet(existing: string, payload: string) {
  const bullet = `- ${payload}`;
  if (existing.includes(bullet)) {
    return existing;
  }

  const trimmed = existing.trimEnd();
  if (!trimmed) {
    return `${bullet}\n`;
  }
  return `${trimmed}\n\n${bullet}\n`;
}

function appendPolicyEntry(existing: string, payload: string) {
  const sanitizedKey = payload
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'proposed_policy';

  const entry = `${sanitizedKey}: "${payload.replace(/"/g, '\\"')}"`;
  if (existing.includes(entry)) {
    return existing;
  }

  const trimmed = existing.trimEnd();
  if (!trimmed) {
    return `${entry}\n`;
  }
  return `${trimmed}\n${entry}\n`;
}

export async function applyProposalToCourseFiles(courseRoot: string, proposal: ProposalRecord): Promise<{ ok: boolean; path: string; reason: string }> {
  if (proposal.status !== 'approved') {
    return {
      ok: false,
      path: '',
      reason: 'Only approved proposals may be applied to course files.',
    };
  }

  if (proposal.kind === 'faq') {
    const path = join(courseRoot, 'course', 'faq.md');
    const current = await readText(path);
    const next = appendFaqBullet(current, proposal.payload);
    await writeText(path, next);
    return {
      ok: true,
      path,
      reason: next === current ? 'FAQ proposal already present; no duplicate added.' : 'Approved FAQ proposal merged into faq.md',
    };
  }

  const path = join(courseRoot, 'course', 'policy.yaml');
  const current = await readText(path);
  const next = appendPolicyEntry(current, proposal.payload);
  await writeText(path, next);
  return {
    ok: true,
    path,
    reason: next === current ? 'Policy proposal already present; no duplicate added.' : 'Approved policy proposal merged into policy.yaml',
  };
}
