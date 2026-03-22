export type MimeMessageInput = {
  to: string[];
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string[];
};

function escapeHeader(value: string) {
  return value.replace(/\r?\n/g, ' ').trim();
}

export function buildMimeMessage(input: MimeMessageInput): string {
  const headers = [
    `To: ${input.to.map(escapeHeader).join(', ')}`,
    `Subject: ${escapeHeader(input.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
  ];

  if (input.inReplyTo) {
    headers.push(`In-Reply-To: ${escapeHeader(input.inReplyTo)}`);
  }

  if (input.references && input.references.length > 0) {
    headers.push(`References: ${input.references.map(escapeHeader).join(' ')}`);
  }

  return `${headers.join('\r\n')}\r\n\r\n${input.body}`;
}

export function encodeBase64Url(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
