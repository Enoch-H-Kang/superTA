# Live Gmail Testing

A minimal set of smoke tests is available for verifying live Gmail API connectivity.

## Requirements
Set these environment variables first:
- `GMAIL_ACCESS_TOKEN`
- optionally `GMAIL_API_BASE_URL`

The scaffold also recognizes:
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

Auth behavior:
- if `GMAIL_ACCESS_TOKEN` is present, it is used directly
- otherwise SuperTA will attempt refresh-token exchange using the OAuth trio above

## Build
```bash
cd superta
npm run build
```

## Option 1: List recent threads
```bash
node dist/plugins/superta/src/gmail/list-threads-smoke-test.js 10
```

This fetches a small list of recent Gmail threads and prints a JSON summary.

## Option 2: Fetch one specific thread
```bash
node dist/plugins/superta/src/gmail/live-smoke-test.js <threadId>
```

This fetches one specific Gmail thread and prints a small JSON summary.

## Option 3: Create a draft reply for one thread
```bash
node dist/plugins/superta/src/gmail/live-draft-smoke-test.js <threadId>
```

This fetches the thread, builds a simple reply draft, and asks Gmail to create a draft.

## Option 4: Run one live Gmail thread through the real SuperTA pipeline
```bash
node dist/plugins/superta/src/gmail/live-inbound-runner.js <threadId> [configPath] [stateRoot]
```

Example:
```bash
node dist/plugins/superta/src/gmail/live-inbound-runner.js 19d175ec1f41f58a local.config.json .
```

This does more than a smoke test:
- loads SuperTA config from disk
- fetches a real Gmail thread
- normalizes it
- runs routing, retrieval, classification, and policy
- persists review-queue and audit-log state

Notes:
- the current runner uses the stub classifier by default
- state is written under `<stateRoot>/state/`
- you must configure `courseRoots` and routing aliases in your config for the thread to route usefully

## What these do
- load Gmail auth from env
- create a live-capable Gmail API path
- verify that Gmail connectivity works
- optionally exercise the real SuperTA persistence pipeline

## Note
Options 1-3 are connectivity tests. Option 4 is the first bridge into the real workflow runner.
