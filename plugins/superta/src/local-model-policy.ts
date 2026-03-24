import type { SuperTAConfig } from './config.js';

export type LocalModelPolicy = SuperTAConfig['localModel'];

function isPrivateIpv4(hostname: string) {
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true;
  if (/^127\./.test(hostname)) return true;
  return false;
}

function isAllowedHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    isPrivateIpv4(normalized)
  );
}

export function assertLocalModelPolicy(policy: LocalModelPolicy) {
  if (!policy.required) {
    return;
  }

  if (policy.provider === 'stub') {
    return;
  }

  const endpoint = policy.endpoint?.trim();
  if (!endpoint) {
    throw new Error(
      `SuperTA requires a local model endpoint when localModel.provider="${policy.provider}".`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error(`Invalid local model endpoint: ${endpoint}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Local model endpoint must be HTTP(S), got ${parsed.protocol}`);
  }

  if (!isAllowedHostname(parsed.hostname)) {
    throw new Error(
      `SuperTA only allows local/private model endpoints. Refusing endpoint host "${parsed.hostname}".`,
    );
  }
}

export function summarizeLocalModelPolicy(policy: LocalModelPolicy) {
  return {
    required: policy.required,
    provider: policy.provider,
    endpoint: policy.provider === 'stub' ? null : policy.endpoint,
  };
}
