# SuperTA Gmail Auth and HTTP Client Scaffold

SuperTA now includes a live-capable Gmail auth/config scaffold and an HTTP client boundary.

## Included

- env-based Gmail auth config loading
- auth config validation
- Gmail HTTP client scaffold for:
  - fetch thread
  - create draft
  - send message
  - label thread
- MIME message construction for Gmail draft/send payloads
- base64url encoding for Gmail raw message transport

## Environment variables

Currently supported:
- `GMAIL_ACCESS_TOKEN`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_API_BASE_URL` (optional override)

## Current limitation

The live HTTP client currently requires `GMAIL_ACCESS_TOKEN` for actual API calls.

The OAuth trio (`clientId`, `clientSecret`, `refreshToken`) is recognized and validated, but token refresh flow is not implemented yet.

## Why this matters

This is the first serious step toward connecting a real Gmail account for live testing.
