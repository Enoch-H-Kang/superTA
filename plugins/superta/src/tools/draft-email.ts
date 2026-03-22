export function createDraftEmail(to: string[], subject: string, body: string) {
  return { to, subject, body, status: 'drafted' };
}
