# SuperTA Gmail Watch State

SuperTA now includes a first file-backed mailbox state layer for Gmail watch-based ingestion.

## Included

- Gmail watch registration client
- Gmail watch registration CLI/helper
- file-backed mailbox state persistence
- persisted fields for:
  - `emailAddress`
  - `historyId`
  - `watchExpiration`
  - `updatedAt`

## Why it exists

A Gmail watch setup is not just a one-time API call.

To operate safely, SuperTA needs to remember mailbox-specific state such as:
- the latest known Gmail `historyId`
- the watch expiration returned by Gmail
- when the mailbox state was last updated

## Storage

File-backed stores now persist mailbox state under:
- `state/gmail-mailboxes.json`

## Current behavior

- watch registration can save mailbox watch state when an `emailAddress` is provided
- webhook processing updates the mailbox `historyId`
- repeated webhook deliveries can still be skipped via `state/gmail-checkpoints.json`
- expiring mailbox watches can be detected and renewed programmatically

Key helper:
- `plugins/superta/src/gmail/renew-watch.ts`

## Remaining limitation

This is still local persistence plus renewal helpers, not a full production watch-renewal daemon or scheduled renewal workflow.
