import { resolve } from 'node:path';
import { loadConfigFromFile } from '../config/load-config.js';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import { executeProfessorCommand } from './execute-professor-command.js';

export type RuntimeApproveSendOptions = {
  configPath: string;
  stateRoot?: string;
  sender: string;
  reviewItemId: string;
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

  const item = await store.getReviewItem(options.reviewItemId);
  return {
    ok: true,
    step: 'approve' as const,
    reviewItemId: options.reviewItemId,
    status: item?.status ?? null,
    reason: `${approval.reason} Runtime send has been removed; send manually from Gmail if desired.`,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const reviewItemId = process.argv[2];
  const sender = process.argv[3];
  const configPath = process.argv[4] ?? 'local.config.json';
  const stateRoot = process.argv[5];

  if (!reviewItemId || !sender) {
    console.error('Usage: node dist/plugins/superta/src/commands/runtime-approve-send.js <reviewItemId> <sender> [configPath] [stateRoot]');
    process.exit(1);
  }

  runRuntimeApproveSend({
    reviewItemId,
    sender,
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
