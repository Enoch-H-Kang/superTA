export type AuditRecord = {
  threadId: string;
  messageId: string;
  action: string;
  note?: string;
};

export function logAudit(record: AuditRecord) {
  return {
    status: 'logged',
    record,
  };
}
