import type { NormalizedThread } from '../gmail/normalize.js';
import type { SuperTAConfig } from '../config.js';
import type { SuperTAStore } from '../storage/store.js';
import type { ClassifierProvider } from '../classifier/provider.js';
import { processInboundThreadAndStore } from './process-and-store.js';

export async function processInboundThreadWithClassifier(
  config: SuperTAConfig,
  store: SuperTAStore,
  classifier: ClassifierProvider,
  thread: NormalizedThread,
) {
  return processInboundThreadAndStore(config, store, thread, {
    classify: (input) => classifier.classify(input),
  });
}
