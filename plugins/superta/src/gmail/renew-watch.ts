import { resolve } from 'node:path';
import { resolveGmailAuthConfig } from './auth-config.js';
import { createGmailWatchClient } from './watch-client.js';
import type { GmailMailboxState, SuperTAStore } from '../storage/store.js';

export type RenewGmailWatchOptions = {
  topicName: string;
  thresholdMs?: number;
  emailAddress?: string;
  labelIds?: string[];
  labelFilterAction?: 'include' | 'exclude';
  now?: number;
};

function expirationToNumber(value?: string) {
  if (!value) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function shouldRenewGmailWatch(state: GmailMailboxState, thresholdMs = 1000 * 60 * 60, now = Date.now()) {
  const expiration = expirationToNumber(state.watchExpiration);
  if (!Number.isFinite(expiration)) {
    return true;
  }

  return expiration - now <= thresholdMs;
}

export async function renewExpiringGmailWatches(store: SuperTAStore, options: RenewGmailWatchOptions) {
  const client = createGmailWatchClient(fetch as any, resolveGmailAuthConfig());
  const states = await store.listGmailMailboxStates();
  const now = options.now ?? Date.now();
  const thresholdMs = options.thresholdMs ?? 1000 * 60 * 60;
  const candidates = options.emailAddress
    ? states.filter((state) => state.emailAddress === options.emailAddress)
    : states;

  const renewed: GmailMailboxState[] = [];
  const skipped: GmailMailboxState[] = [];

  for (const state of candidates) {
    if (!shouldRenewGmailWatch(state, thresholdMs, now)) {
      skipped.push(state);
      continue;
    }

    const response = await client.watch({
      topicName: options.topicName,
      labelIds: options.labelIds,
      labelFilterAction: options.labelFilterAction,
    });

    const nextState: GmailMailboxState = {
      emailAddress: state.emailAddress,
      historyId: response.historyId ?? state.historyId,
      watchExpiration: response.expiration ?? state.watchExpiration,
      updatedAt: new Date(now).toISOString(),
    };

    await store.saveGmailMailboxState(nextState);
    renewed.push(nextState);
  }

  return {
    ok: true,
    renewedCount: renewed.length,
    skippedCount: skipped.length,
    renewed,
    skipped: skipped.map((state) => state.emailAddress),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.error('renew-watch.js is intended for programmatic use with a configured store.');
  process.exit(1);
}
