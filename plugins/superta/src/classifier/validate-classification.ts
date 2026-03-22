import type { Classification, ClassificationAction, ClassificationCategory, RequiredSource } from '../routing/classify.js';

const validCategories = new Set<ClassificationCategory>([
  'logistics',
  'deadline',
  'technical/setup',
  'office-hours/admin',
  'policy',
  'grade-related',
  'accommodation-sensitive',
  'integrity-sensitive',
  'wellbeing/safety',
  'other',
]);

const validActions = new Set<ClassificationAction>([
  'draft_for_professor',
  'needs_more_info',
  'escalate_now',
]);

const validSources = new Set<RequiredSource>(['syllabus', 'faq', 'policy', 'schedule', 'template']);

export function validateClassification(value: unknown): Classification {
  if (!value || typeof value !== 'object') {
    throw new Error('Classification must be an object.');
  }

  const candidate = value as Record<string, unknown>;

  if (!validCategories.has(candidate.category as ClassificationCategory)) {
    throw new Error('Invalid classification category.');
  }

  if (!validActions.has(candidate.action as ClassificationAction)) {
    throw new Error('Invalid classification action.');
  }

  if (typeof candidate.confidence !== 'number') {
    throw new Error('Classification confidence must be a number.');
  }

  if (![0, 1, 2, 3].includes(candidate.riskTier as number)) {
    throw new Error('Classification riskTier must be 0, 1, 2, or 3.');
  }

  if (!Array.isArray(candidate.requiredSources)) {
    throw new Error('Classification requiredSources must be an array.');
  }

  for (const source of candidate.requiredSources) {
    if (!validSources.has(source as RequiredSource)) {
      throw new Error('Invalid required source.');
    }
  }

  if (typeof candidate.shouldUpdateFaq !== 'boolean') {
    throw new Error('Classification shouldUpdateFaq must be a boolean.');
  }

  if (typeof candidate.shouldNotifyProfessor !== 'boolean') {
    throw new Error('Classification shouldNotifyProfessor must be a boolean.');
  }

  if (typeof candidate.reason !== 'string') {
    throw new Error('Classification reason must be a string.');
  }

  return candidate as Classification;
}
