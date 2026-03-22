# SuperTA Gmail History Fetch Scaffold

SuperTA now includes a scaffold for turning Gmail push history events into thread fetch targets.

## Included

- Gmail history client interface
- mock history client
- extraction of thread/message targets from Gmail history responses
- webhook-event to fetch-target derivation

## Intended flow

1. Gmail webhook arrives with `historyId`
2. SuperTA asks Gmail history for changes since that point
3. changed messages are mapped to thread fetch targets
4. thread fetch can then feed the existing SuperTA pipeline

## Current behavior

This layer now supports a first idempotent inbound path:
- webhook event → history lookup → unique thread targets → thread fetch/process pipeline
- repeated deliveries of the same `emailAddress + historyId` event can be skipped via file-backed checkpoints

## Watch setup support

SuperTA now also includes a Gmail watch registration helper so the upstream mailbox watch can be established programmatically.

See:
- `plugins/superta/src/gmail/watch-client.ts`
- `plugins/superta/src/gmail/register-watch.ts`
- `docs/gmail-watch.md`

## Remaining limitation

This is still a local/runtime scaffold. Production Pub/Sub IAM/topic setup and deployed webhook environment details still need to be completed.
