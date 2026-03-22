export type EvidenceItem = {
  type: 'syllabus' | 'faq' | 'policy' | 'schedule' | 'template';
  path: string;
  snippet: string;
};

export function buildEvidenceBundle(items: EvidenceItem[]) {
  return { sources: items };
}
