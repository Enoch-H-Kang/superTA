# SuperTA

![Status](https://img.shields.io/badge/status-developer--preview-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**SuperTA** is an **OpenClaw plugin** for privacy-conscious professor email workflows across multiple live courses.

It helps a professor triage course email, ground responses in local course materials, keep sensitive issues escalated, and track student requests in a structured case ledger — while keeping student-data handling in local or institution-controlled systems.

## Example uses

SuperTA is meant for workflows like:

- **Extension requests**
  - a student asks for more time on an assignment
  - SuperTA routes the email to the right course
  - checks local policy/course files
  - creates a reviewable draft or escalates if needed
  - records the request as a structured case

- **Exam time changes**
  - a student asks to move a midterm because of a conflict
  - SuperTA tracks the request as an exam-time-change case
  - preserves follow-up history across multiple emails
  - helps the professor avoid losing track of unresolved requests

- **Routine logistics questions**
  - office hours, due dates, course procedures
  - SuperTA uses local course materials as grounding
  - drafts a response for review instead of improvising from nowhere

- **Sensitive categories that should not be casually answered**
  - grade-related issues
  - accommodations
  - integrity concerns
  - wellbeing/safety signals
  - these are escalated instead of treated like routine automation

## Why SuperTA exists

Professor email is full of repeated, operationally important requests:
- extension requests
- exam time changes
- logistics questions
- grade-related follow-ups
- policy clarifications

Most of these need structure, consistency, and follow-through more than they need “autonomous AI.”

SuperTA is built around that idea.

It is designed to:
- route email by course
- use local course files as grounding
- keep humans in control of final outbound communication
- track student issues as cases instead of losing context across threads

## What makes it different

### Local or institution-controlled student-data handling
SuperTA is intended for workflows where student-data handling stays inside local or institution-controlled systems.

### No supported external API path for student-data processing
The supported student-data workflow does not rely on external API processing of student email content.

### Local-model or deterministic-only handling
SuperTA supports local deterministic logic and local-model workflows, rather than hosted third-party model inference on student email.

### Draft / review / manual-send
SuperTA creates a workflow where the professor reviews and sends manually from Gmail.

### Structured student case ledger
SuperTA can track requests like extensions and exam conflicts as structured cases with history, status, and follow-up, instead of treating each email as an isolated event.

## How it works

At a high level, SuperTA:
1. ingests Gmail-backed course email
2. routes each thread to the right course context
3. grounds reasoning in local course files
4. escalates sensitive categories
5. drafts reviewable responses for routine cases
6. records structured case state for ongoing follow-through

## Current feature set

- OpenClaw plugin entrypoint
- Gmail integration plumbing
- multi-course routing
- local course-file grounding
- deterministic policy controls
- local-model policy boundary
- review queue + draft workflow
- structured student case ledger
- case dedup/linking for repeated requests
- internal case operations API for OpenClaw-driven conversational flows
- operator inspection commands
- interactive setup + doctor output
- tests and eval coverage

## Quickstart

```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

Then read:
- `docs/getting-started.md`
- `docs/privacy-and-deployment.md`
- `docs/public-demo-walkthrough.md`

## Privacy and deployment

SuperTA is built for a careful deployment posture:
- local or institution-controlled infrastructure
- local-model or deterministic-only handling for student-data workflows
- no supported external API path for student-data processing
- manual send from Gmail
- redacted operator views by default
- structured operational records instead of broad transcript-style persistence everywhere

More here:
- `docs/privacy-and-deployment.md`
- `docs/ferpa-safe-defaults.md`

## Who it is for

SuperTA is currently best suited for:
- OpenClaw users
- technical early adopters
- builders exploring privacy-conscious educational workflows
- professors or labs willing to run a local/institution-controlled setup

## Current scope

SuperTA currently focuses on:
- professor email triage
- grounded draft generation
- sensitive-case escalation
- structured student case tracking

It does **not** aim to be:
- autonomous grading or academic decision-making
- a hosted AI email service
- a turnkey institutional SaaS platform

## Project status

SuperTA is a **developer preview**.

It is ready to share publicly as an experimental project and as an OpenClaw plugin prototype. It is not yet a polished managed product.

## Docs

Start at:
- `docs/README.md`

Key pages:
- `docs/getting-started.md`
- `docs/privacy-and-deployment.md`
- `docs/ferpa-safe-defaults.md`
- `docs/public-demo-walkthrough.md`
- `docs/release-readiness.md`
- `docs/announcement-draft.md`
- `docs/launch-checklist.md`

## Repository layout

```text
superta/
  plugins/
    superta/
      src/
      test/
  docs/
  evals/
  config.example.json
```

## Verification

```bash
npm run build
npm test
node dist/evals/run-evals.js
```

## License

MIT
