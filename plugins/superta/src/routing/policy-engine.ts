import type { Classification } from './classify.js';
import type { CourseRoute } from './course-resolver.js';
import type { EvidenceItem } from '../retrieval/build-evidence-bundle.js';

function evidenceTypesPresent(evidence: EvidenceItem[]) {
  return new Set(evidence.map((item) => item.type));
}

export function applyPolicy(
  route: CourseRoute,
  classification: Classification,
  evidence: EvidenceItem[] = [],
): Classification {
  if (route.ambiguous) {
    return {
      ...classification,
      action: 'needs_more_info',
      shouldNotifyProfessor: true,
      reason: 'Ambiguous course routing requires clarification or escalation.',
    };
  }

  if (
    classification.category === 'grade-related' ||
    classification.category === 'accommodation-sensitive' ||
    classification.category === 'integrity-sensitive' ||
    classification.category === 'wellbeing/safety'
  ) {
    return {
      ...classification,
      action: 'escalate_now',
      shouldNotifyProfessor: true,
      riskTier: 3,
      reason: 'Sensitive category requires immediate escalation.',
    };
  }

  if (classification.confidence < 0.5) {
    return {
      ...classification,
      action: 'needs_more_info',
      shouldNotifyProfessor: true,
      reason: 'Low-confidence classification cannot produce a definitive routine action.',
    };
  }

  const present = evidenceTypesPresent(evidence);
  const missingRequiredSources = classification.requiredSources.filter((source) => !present.has(source));
  if (missingRequiredSources.length > 0) {
    return {
      ...classification,
      action: 'needs_more_info',
      shouldNotifyProfessor: true,
      reason: `Missing required evidence sources: ${missingRequiredSources.join(', ')}`,
    };
  }

  return classification;
}
