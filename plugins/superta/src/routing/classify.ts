export type Classification = {
  category:
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
  action: 'draft_for_professor' | 'needs_more_info' | 'escalate_now';
  confidence: number;
};

export function classifyMessage(): Classification {
  return {
    category: 'other',
    action: 'needs_more_info',
    confidence: 0,
  };
}
