import type { Classification } from './classify.js';
import type { CourseRoute } from './course-resolver.js';

export function applyPolicy(route: CourseRoute, classification: Classification): Classification {
  if (route.ambiguous) {
    return { ...classification, action: 'needs_more_info' };
  }

  if (
    classification.category === 'grade-related' ||
    classification.category === 'accommodation-sensitive' ||
    classification.category === 'integrity-sensitive' ||
    classification.category === 'wellbeing/safety'
  ) {
    return { ...classification, action: 'escalate_now' };
  }

  return classification;
}
