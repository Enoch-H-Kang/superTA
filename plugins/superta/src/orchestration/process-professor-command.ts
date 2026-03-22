import type { SuperTAConfig } from '../config.js';
import { parseProfessorCommand } from '../commands/parse-professor-command.js';

export type ProfessorCommandResult =
  | { type: 'ignored'; reason: string }
  | { type: 'approve'; payload: string }
  | { type: 'policy'; payload: string }
  | { type: 'task'; payload: string }
  | { type: 'faq'; payload: string }
  | { type: 'rollover'; payload: string };

export function processProfessorCommand(
  config: SuperTAConfig,
  sender: string,
  body: string,
): ProfessorCommandResult {
  const parsed = parseProfessorCommand(config, sender, body);

  if (!parsed.authorized || !parsed.command) {
    return {
      type: 'ignored',
      reason: parsed.reason,
    };
  }

  return parsed.command;
}
