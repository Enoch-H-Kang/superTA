import { resolve } from 'node:path';
import { createFileStore, defaultFileStorePaths } from '../storage/file-store.js';

export async function getReviewItemCommand(reviewItemId: string, stateRoot?: string) {
  const store = createFileStore(defaultFileStorePaths(stateRoot ?? process.cwd()));
  const item = await store.getReviewItem(reviewItemId);

  return {
    ok: Boolean(item),
    item,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const reviewItemId = process.argv[2];
  const stateRoot = process.argv[3];

  if (!reviewItemId) {
    console.error('Usage: node dist/plugins/superta/src/commands/get-review-item.js <reviewItemId> [stateRoot]');
    process.exit(1);
  }

  getReviewItemCommand(reviewItemId, stateRoot ? resolve(process.cwd(), stateRoot) : process.cwd())
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
