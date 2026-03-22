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

## Auth behavior

The live HTTP client now supports two paths:

1. **Direct access token**
   - use `GMAIL_ACCESS_TOKEN` when you want quick manual testing

2. **Refresh-token flow**
   - if `GMAIL_ACCESS_TOKEN` is absent, SuperTA will use:
     - `GMAIL_CLIENT_ID`
     - `GMAIL_CLIENT_SECRET`
     - `GMAIL_REFRESH_TOKEN`
   - it will request a fresh access token from `https://oauth2.googleapis.com/token`
   - the refreshed access token is then used for Gmail API calls

## Why this matters

This moves SuperTA from one-off manual Gmail access toward a more sustainable live integration path.
