import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import type { OutboundActionRecord } from '../storage/store.js';

export type ListOutboundActionsOptions = {
  stateRoot?: string;
  type?: OutboundActionRecord['type'];
  limit?: number;
};

export async function listOutboundActionsCommand(options: ListOutboundActionsOptions = {}) {
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const limit = options.limit ?? 20;
  const records = await store.listOutboundActionRecords();
  const filtered = options.type ? records.filter((record) => record.type === options.type) : records;

  return {
    ok: true,
    count: filtered.length,
    records: filtered.slice(-limit),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const type = process.argv[3] as OutboundActionRecord['type'] | undefined;
  const limit = Number(process.argv[4] ?? '20');

  listOutboundActionsCommand({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    type,
    limit,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
