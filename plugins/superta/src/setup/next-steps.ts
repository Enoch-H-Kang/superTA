export function formatSetupNextSteps(configPath: string) {
  return [
    'Next useful commands:',
    `- node dist/plugins/superta/src/setup/list-courses.js ${configPath}`,
    `- node dist/plugins/superta/src/setup/doctor-report.js ${configPath} . 3600000`,
    `- node dist/plugins/superta/src/commands/inspect-state.js . 20`,
    `- node dist/plugins/superta/src/gmail/register-watch.js <topicName> <emailAddress> include INBOX`,
  ].join('\n');
}
