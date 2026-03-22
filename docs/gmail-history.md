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

## Current limitation

This layer derives fetch targets, but does not yet fetch and normalize the changed Gmail threads automatically.
