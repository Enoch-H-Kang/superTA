import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';
import type { ReviewStatus } from '../actions/review-queue.js';

export type ListReviewItemsOptions = {
  stateRoot?: string;
  status?: ReviewStatus;
  limit?: number;
};

export async function listReviewItemsCommand(options: ListReviewItemsOptions = {}) {
  const store = createFileStore(defaultFileStorePaths(options.stateRoot ?? process.cwd()));
  const limit = options.limit ?? 20;
  const items = await store.listReviewItems();
  const filtered = options.status ? items.filter((item) => item.status === options.status) : items;

  return {
    ok: true,
    count: filtered.length,
    items: filtered.slice(-limit),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const stateRoot = process.argv[2];
  const status = process.argv[3] as ReviewStatus | undefined;
  const limit = Number(process.argv[4] ?? '20');

  listReviewItemsCommand({
    stateRoot: stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd(),
    status,
    limit,
  })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
