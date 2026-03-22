import type { ClassifierProvider, ClassificationInput } from './provider.js';
import type { Classification } from '../routing/classify.js';

function classifyFromInput(input: ClassificationInput): Classification {
  const subject = input.thread.subject.toLowerCase();

  if (subject.includes('grade')) {
    return {
      category: 'grade-related',
      action: 'draft_for_professor',
      confidence: 0.9,
      riskTier: 3,
      requiredSources: ['policy'],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: true,
      reason: 'Subject suggests a grade-related inquiry.',
    };
  }

  if (subject.includes('late') || subject.includes('extension')) {
    return {
      category: 'deadline',
      action: 'draft_for_professor',
      confidence: 0.85,
      riskTier: 1,
      requiredSources: ['policy'],
      shouldUpdateFaq: false,
      shouldNotifyProfessor: false,
      reason: 'Subject suggests a routine deadline or extension question.',
    };
  }

  return {
    category: 'other',
    action: 'needs_more_info',
    confidence: 0.4,
    riskTier: 1,
    requiredSources: [],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'Stub classifier could not confidently classify the message.',
  };
}

export function createStubClassifierProvider(): ClassifierProvider {
  return {
    async classify(input) {
      return classifyFromInput(input);
    },
  };
}
