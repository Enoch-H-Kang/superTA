import { resolve } from 'node:path';
import { loadConfigFromFile } from '../config/load-config.js';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { executeProfessorCommand } from './execute-professor-command.js';
import { executeApprovedSend } from './execute-professor-send.js';
import { resolveGmailAuthConfig } from '../gmail/auth-config.js';
import { createGmailHttpClient } from '../gmail/http-client.js';

export type RuntimeApproveSendOptions = {
  configPath: string;
  stateRoot?: string;
  sender: string;
  reviewItemId: string;
  mode?: 'approve' | 'approve-and-send';
};

export async function runRuntimeApproveSend(options: RuntimeApproveSendOptions) {
  const config = await loadConfigFromFile(options.configPath);
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));

  const approval = await executeProfessorCommand(
    config,
    store,
    options.sender,
    `[SUPERTA APPROVE] ${options.reviewItemId}`,
  );

  if (approval.type !== 'approve' || !approval.ok) {
    return {
      ok: false,
      step: 'approve' as const,
      reviewItemId: options.reviewItemId,
      reason: approval.type === 'approve' ? approval.reason : 'Approval command was ignored.',
    };
  }

  if (options.mode !== 'approve-and-send') {
    const item = await store.getReviewItem(options.reviewItemId);
    return {
      ok: true,
      step: 'approve' as const,
      reviewItemId: options.reviewItemId,
      status: item?.status ?? null,
      reason: approval.reason,
    };
  }

  const gmailClient = createGmailHttpClient(fetch as any, resolveGmailAuthConfig());
  const sent = await executeApprovedSend(store, gmailClient, options.reviewItemId);
  if (!sent.ok) {
    return {
      ok: false,
      step: 'send' as const,
      reviewItemId: options.reviewItemId,
      reason: sent.reason,
    };
  }

  const item = await store.getReviewItem(options.reviewItemId);
  return {
    ok: true,
    step: 'send' as const,
    reviewItemId: options.reviewItemId,
    status: item?.status ?? null,
    messageId: sent.messageId,
    recipients: sent.recipients,
    reason: sent.reason,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const reviewItemId = process.argv[2];
  const sender = process.argv[3];
  const mode = (process.argv[4] as 'approve' | 'approve-and-send' | undefined) ?? 'approve-and-send';
  const configPath = process.argv[5] ?? 'local.config.json';
  const stateRoot = process.argv[6];

  if (!reviewItemId || !sender) {
    console.error('Usage: node dist/plugins/superta/src/commands/runtime-approve-send.js <reviewItemId> <sender> [approve|approve-and-send] [configPath] [stateRoot]');
    process.exit(1);
  }

  runRuntimeApproveSend({
    reviewItemId,
    sender,
    mode,
    configPath: resolve(process.cwd(), configPath),
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
  })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
