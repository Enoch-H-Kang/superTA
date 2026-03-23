# SuperTA Gmail Production Ops

This document describes the minimum operational expectations for running SuperTA with live Gmail inbound processing in a production-like environment.

## Scope

SuperTA can already do meaningful live Gmail development work, but production-style inbound email handling requires more than just an access token.

You need to think about:
- Gmail watch registration
- Pub/Sub topic setup
- webhook reachability
- watch renewal
- mailbox state persistence
- recovery / doctor checks

## Minimum production prerequisites

### 1. Stable Gmail auth
Provide either:
- `GMAIL_ACCESS_TOKEN` for temporary testing only, or preferably
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

For sustained operation, prefer the refresh-token path.

### 2. Public webhook reachability
Your deployed OpenClaw/SuperTA environment must expose a webhook route that Gmail-triggered Pub/Sub delivery can ultimately reach.

At minimum, document for yourself:
- public base URL
- actual webhook path
- TLS/HTTPS endpoint

Suggested env to track operational intent:
- `SUPERTA_PUBLIC_BASE_URL`

### 3. Pub/Sub topic readiness
A production-like deployment should have a stable Pub/Sub topic ready for Gmail watch notifications.

Suggested env to track operational intent:
- `GMAIL_PUBSUB_TOPIC`

Example value:
```text
projects/your-project/topics/gmail
```

### 4. Mailbox watch state
SuperTA should have mailbox watch state persisted under:
- `state/gmail-mailboxes.json`

And webhook dedupe state under:
- `state/gmail-checkpoints.json`

### 5. Watch renewal plan
Gmail watches expire.

SuperTA now has helper support for renewal, but production operation still requires a plan for:
- when renewal runs
- where failures are observed
- how operator intervention happens

## Recommended production-ish workflow

1. configure Gmail auth env
2. configure/publicize webhook URL
3. configure Pub/Sub topic name
4. register Gmail watch
5. confirm mailbox watch state exists
6. run doctor
7. periodically renew watches
8. inspect mailbox/outbound/audit state regularly

## Suggested commands

### Doctor report
```bash
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

### Register watch
```bash
node dist/plugins/superta/src/gmail/register-watch.js <topicName> <emailAddress> include INBOX
```

### Inspect state
```bash
node dist/plugins/superta/src/commands/inspect-state.js . 20
```

### List expiring mailboxes
```bash
node dist/plugins/superta/src/commands/list-expiring-mailboxes.js . 3600000
```

### Renew watches (JSON)
```bash
node dist/plugins/superta/src/setup/renew-watches.js . 3600000
```

### Renew watches (human-readable report)
```bash
node dist/plugins/superta/src/setup/renew-watches-report.js . 3600000
```

## Current limitation

SuperTA still does **not** provide a fully managed production deployment stack for:
- Pub/Sub IAM provisioning
- hosted webhook deployment
- watch-renewal scheduling/orchestration
- secrets management beyond environment variables

Treat this as a serious prototype with meaningful ops scaffolding, not a turnkey managed service.
