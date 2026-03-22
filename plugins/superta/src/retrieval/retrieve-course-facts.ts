import { loadCourseFiles } from './load-course-files.js';
import type { EvidenceItem } from './build-evidence-bundle.js';

export async function retrieveCourseFacts(courseRoot: string): Promise<EvidenceItem[]> {
  const loaded = await loadCourseFiles(courseRoot);
  if (!loaded.ok) {
    return [];
  }

  const evidence: EvidenceItem[] = [
    {
      type: 'syllabus',
      path: `${courseRoot}/course/syllabus.md`,
      snippet: loaded.files.syllabus.slice(0, 200),
    },
    {
      type: 'faq',
      path: `${courseRoot}/course/faq.md`,
      snippet: loaded.files.faq.slice(0, 200),
    },
    {
      type: 'policy',
      path: `${courseRoot}/course/policy.yaml`,
      snippet: JSON.stringify(loaded.files.policy).slice(0, 200),
    },
    {
      type: 'schedule',
      path: `${courseRoot}/course/schedule.yaml`,
      snippet: JSON.stringify(loaded.files.schedule).slice(0, 200),
    },
  ];

  return evidence;
}
