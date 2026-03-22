export type SuperTAConfig = {
  professorId: string;
  gmail: {
    webhookPath: string;
    allowedProfessorSenders: string[];
  };
};

export const defaultConfig: SuperTAConfig = {
  professorId: 'prof-placeholder',
  gmail: {
    webhookPath: '/webhooks/gmail',
    allowedProfessorSenders: [],
  },
};
