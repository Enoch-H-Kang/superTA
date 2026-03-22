export type ClassificationCategory =
  | 'logistics'
  | 'deadline'
  | 'technical/setup'
  | 'office-hours/admin'
  | 'policy'
  | 'grade-related'
  | 'accommodation-sensitive'
  | 'integrity-sensitive'
  | 'wellbeing/safety'
  | 'other';

export type ClassificationAction = 'draft_for_professor' | 'needs_more_info' | 'escalate_now';

export type RequiredSource = 'syllabus' | 'faq' | 'policy' | 'schedule' | 'template';

export type Classification = {
  category: ClassificationCategory;
  action: ClassificationAction;
  confidence: number;
  riskTier: 0 | 1 | 2 | 3;
  requiredSources: RequiredSource[];
  shouldUpdateFaq: boolean;
  shouldNotifyProfessor: boolean;
  reason: string;
};

export function classifyMessage(): Classification {
  return {
    category: 'other',
    action: 'needs_more_info',
    confidence: 0,
    riskTier: 1,
    requiredSources: [],
    shouldUpdateFaq: false,
    shouldNotifyProfessor: false,
    reason: 'No classifier implementation yet.',
  };
}
