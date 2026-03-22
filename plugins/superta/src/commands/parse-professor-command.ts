import type { SuperTAConfig } from '../config.js';

export type ProfessorCommand =
  | { type: 'approve'; payload: string }
  | { type: 'policy'; payload: string }
  | { type: 'task'; payload: string }
  | { type: 'faq'; payload: string }
  | { type: 'rollover'; payload: string };

export type ParsedProfessorCommand = {
  authorized: boolean;
  command: ProfessorCommand | null;
  reason: string;
};

function normalizeSender(sender: string) {
  return sender.trim().toLowerCase();
}

function parseCommand(body: string): ProfessorCommand | null {
  const trimmed = body.trim();
  const patterns: Array<{ prefix: string; type: ProfessorCommand['type'] }> = [
    { prefix: '[SUPERTA APPROVE]', type: 'approve' },
    { prefix: '[SUPERTA POLICY]', type: 'policy' },
    { prefix: '[SUPERTA TASK]', type: 'task' },
    { prefix: '[SUPERTA FAQ]', type: 'faq' },
    { prefix: '[SUPERTA ROLLOVER]', type: 'rollover' },
  ];

  for (const pattern of patterns) {
    if (trimmed.toUpperCase().startsWith(pattern.prefix)) {
      const payload = trimmed.slice(pattern.prefix.length).trim();
      return {
        type: pattern.type,
        payload,
      } as ProfessorCommand;
    }
  }

  return null;
}

export function parseProfessorCommand(
  config: SuperTAConfig,
  sender: string,
  body: string,
): ParsedProfessorCommand {
  const normalizedSender = normalizeSender(sender);
  const allowlisted = config.gmail.allowedProfessorSenders.map(normalizeSender);

  if (!allowlisted.includes(normalizedSender)) {
    return {
      authorized: false,
      command: null,
      reason: 'Sender is not allowlisted for professor commands.',
    };
  }

  const command = parseCommand(body);
  if (!command) {
    return {
      authorized: true,
      command: null,
      reason: 'No recognized professor command found.',
    };
  }

  return {
    authorized: true,
    command,
    reason: 'Professor command parsed successfully.',
  };
}
