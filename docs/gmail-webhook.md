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

## Current state

The scaffold now covers more of the full inbound chain:
- webhook route registration
- webhook envelope/body parsing
- history lookup → fetch-target derivation
- thread fetch → normalize → pipeline bridge
- idempotent checkpointing for repeated webhook deliveries
- Gmail watch registration helper for the upstream mailbox watch step

## Remaining limitation

Production Pub/Sub and deployed webhook setup still need environment-specific configuration. The repo now has the API/helper layer, but not a turnkey deployment story.
