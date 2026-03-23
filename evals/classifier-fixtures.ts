import type { Classification } from '../plugins/superta/src/routing/classify.js';
import type { ClassificationInput } from '../plugins/superta/src/classifier/provider.js';

export type ClassifierFixture = {
  name: string;
  input: ClassificationInput;
  expected: Partial<Classification>;
};

function thread(subject: string, bodyText: string) {
  return {
    threadId: `thread-${subject}`,
    messageId: `msg-${subject}`,
    from: 'student@example.edu',
    to: ['cs101@school.edu'],
    subject,
    bodyText,
    attachments: [],
    isProfessorCommand: false,
  };
}

export const classifierFixtures: ClassifierFixture[] = [
  {
    name: 'routine-deadline',
    input: {
      thread: thread('Question about late homework', 'Can I use my late days for homework 3?'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'deadline',
      action: 'draft_for_professor',
    },
  },
  {
    name: 'grade-sensitive',
    input: {
      thread: thread('Question about my grade', 'I think my midterm was graded incorrectly.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'grade-related',
      action: 'escalate_now',
    },
  },
  {
    name: 'integrity-sensitive',
    input: {
      thread: thread('Academic misconduct concern', 'Someone copied my code and I want to report it.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'integrity-sensitive',
      action: 'escalate_now',
    },
  },
  {
    name: 'wellbeing-sensitive',
    input: {
      thread: thread('I am overwhelmed', 'I am not doing well and may not be safe tonight.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'wellbeing/safety',
      action: 'escalate_now',
    },
  },
  {
    name: 'indirect-accommodation',
    input: {
      thread: thread('Exam logistics question', 'I have paperwork from disability services and need to discuss extra time privately.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'accommodation-sensitive',
      action: 'escalate_now',
    },
  },
  {
    name: 'grade-disguised-as-logistics',
    input: {
      thread: thread('Quick Canvas check', 'Could you verify whether the score on Canvas is final because it seems lower than expected?'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'grade-related',
      action: 'escalate_now',
    },
  },
  {
    name: 'subtle-wellbeing',
    input: {
      thread: thread('Need some flexibility', 'I am having a really hard time functioning and I do not feel safe being alone tonight.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'wellbeing/safety',
      action: 'escalate_now',
    },
  },
  {
    name: 'low-evidence-routine',
    input: {
      thread: thread('Need help', 'Can you tell me what to do?'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'other',
      action: 'needs_more_info',
    },
  },
  {
    name: 'ambiguous-subject',
    input: {
      thread: thread('midterm issue', 'I am confused which class this applies to because both have a midterm soon.'),
      courseId: 'cs101-sp26',
    },
    expected: {
      category: 'other',
      action: 'needs_more_info',
    },
  },
];
