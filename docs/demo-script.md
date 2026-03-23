# SuperTA 5-Minute Demo Script

This is a short public-facing demo script for presenting SuperTA as an experimental OpenClaw plugin.

## Goal

Show, in one coherent flow, that SuperTA can:
1. onboard multiple courses
2. validate setup
3. process an inbound workflow
4. preserve state and operator visibility

## Framing

Open with:

> SuperTA is an experimental Gmail-backed OpenClaw plugin for one professor across multiple live courses. It is draft-first, human-in-the-loop, and does not require any extra model API for the default setup.

## Demo steps

### 1. Show recommended onboarding
Run:

```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
```

Say:
- this is the default onboarding path
- it scaffolds a multi-course setup
- it is meant to reduce manual JSON editing

### 2. Show doctor report
Run:

```bash
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

Say:
- this summarizes readiness, warnings, and suggested next steps
- operator visibility is part of the design, not an afterthought

### 3. Show configured courses
Run:

```bash
node dist/plugins/superta/src/setup/list-courses.js local.config.json
```

Say:
- SuperTA is built around one professor with multiple live offerings
- course isolation matters for safety and correctness

### 4. Show inbound/runtime path
Safer demo option:
- describe the flow using `docs/public-demo-walkthrough.md`
- or run a previously prepared inbound example

If using a real thread:

```bash
node dist/plugins/superta/src/gmail/live-inbound-runner.js <threadId> local.config.json .
```

Say:
- the system routes the thread
- applies deterministic policy
- and persists review/audit state

### 5. Show state inspection
Run:

```bash
node dist/plugins/superta/src/commands/inspect-state.js . 20
```

Optional focused views:

```bash
node dist/plugins/superta/src/commands/list-review-items.js . pending 20
node dist/plugins/superta/src/commands/list-outbound-actions.js . send 20
```

Say:
- there is explicit operator visibility into queue, outbound actions, mailbox state, and audits

## Closing line

> The point of SuperTA is not full autonomy. The point is a careful OpenClaw plugin with course-aware routing, bounded policy, draft-first workflows, and enough operator visibility to be useful without pretending to be magic.

## Do not overclaim

Do not say:
- production-ready
- turnkey Gmail deployment
- autonomous grading/accommodation/integrity resolution

Do say:
- experimental prototype
- technical early-adopter tool
- OpenClaw plugin
- no extra model API required by default
