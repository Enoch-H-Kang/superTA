# SuperTA Public Demo Walkthrough

This is the shortest public-facing walkthrough for demonstrating SuperTA as an **experimental prototype**.

## Goal

Show one coherent path:
1. set up courses
2. confirm setup health
3. process one inbound thread
4. approve/send or draft
5. inspect resulting state

## Recommended demo path

### 1) Set up SuperTA
```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
```

### 2) Confirm setup health
```bash
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

### 3) Run one inbound thread through the pipeline
```bash
node dist/plugins/superta/src/gmail/live-inbound-runner.js <threadId> local.config.json .
```

If you do not have live Gmail handy, explain the expected outcome instead and use fixture/demo paths.

### 4) Approve and create a draft
Approve the queued item:
```bash
node dist/plugins/superta/src/commands/runtime-approve-send.js <reviewItemId> prof@example.edu local.config.json .
```

Then create the Gmail draft:
```bash
node dist/plugins/superta/src/commands/runtime-draft-send.js <reviewItemId> .
```

### 5) Inspect resulting state
```bash
node dist/plugins/superta/src/commands/inspect-state.js . 20
```

Optional focused views:
```bash
node dist/plugins/superta/src/commands/list-review-items.js . pending 20
node dist/plugins/superta/src/commands/list-outbound-actions.js . send 20
```

## What to say publicly

Recommended framing:
- SuperTA is an **experimental prototype**
- it is designed for **one professor across multiple live offerings**
- it is **draft-first by default**
- sensitive categories **escalate instead of auto-resolving**
- it is **not yet a polished production release**

## What not to imply

Avoid implying:
- turnkey production Gmail deployment
- production-ready Pub/Sub/webhook operations
- fully hardened live classifier behavior
- broad non-technical plug-and-play readiness
ss
