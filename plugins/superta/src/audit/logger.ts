import type { PipelineAuditRecord } from './schemas.js';

export type AuditRecord = PipelineAuditRecord & {
  loggedAt?: string;
};

export function logAudit(record: PipelineAuditRecord) {
  return {
    status: 'logged' as const,
    record: {
      ...record,
      loggedAt: new Date().toISOString(),
    },
  };
}
