import type { NormalizedThread } from '../gmail/normalize.js';
import type { Classification } from '../routing/classify.js';

export type ClassificationInput = {
  thread: NormalizedThread;
  courseId?: string;
};

export type ClassifierProvider = {
  classify: (input: ClassificationInput) => Promise<Classification>;
};
