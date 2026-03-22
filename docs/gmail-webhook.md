# SuperTA Gmail Webhook Scaffold

SuperTA now includes an OpenClaw-style plugin webhook scaffold for Gmail push events.

## Included

- Gmail webhook envelope parsing
- base64 JSON decode for push payloads
- webhook body handler
- plugin-style HTTP route registration helper

## Intended use

This is the first step toward a real plugin-managed Gmail ingestion path.

Planned flow:
1. plugin registers `/superta/gmail/webhook`
2. Gmail push event hits the route
3. webhook payload is decoded
4. account/mailbox context is identified
5. handler triggers thread fetch + SuperTA pipeline work

## Current limitation

The scaffold currently parses and acknowledges webhook payloads, but does not yet fetch Gmail thread data automatically.
