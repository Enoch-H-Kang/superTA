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

But note:
- token refresh is not implemented yet
- live calls currently rely on `GMAIL_ACCESS_TOKEN`

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

## What these do
- load Gmail auth from env
- create a live-capable Gmail API path
- verify that Gmail connectivity works

## Note
These are connectivity tests, not yet full live workflow runners.
