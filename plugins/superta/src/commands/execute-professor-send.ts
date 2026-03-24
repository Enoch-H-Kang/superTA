import type { SuperTAStore } from '../storage/store.js';
import type { GmailClient } from '../gmail/client.js';
import type { SuperTAConfig } from '../config.js';

export type ProfessorSendResult =
  | { type: 'send'; ok: false; reviewItemId: string; reason: string };

export async function executeApprovedSend(
  _store: SuperTAStore,
  _gmailClient: GmailClient,
  reviewItemId: string,
  _config?: Pick<SuperTAConfig, 'privacy'>,
): Promise<ProfessorSendResult> {
  return {
    type: 'send',
    ok: false,
    reviewItemId,
    reason: 'Runtime sending has been removed. SuperTA is draft/review only; send manually from Gmail.',
  };
}
