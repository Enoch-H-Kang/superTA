# SuperTA

![Status](https://img.shields.io/badge/status-developer--preview-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**SuperTA** is an **OpenClaw plugin** for professor email operations across multiple live courses.

It is designed for a privacy-conscious workflow:
- **student email stays in local or institution-controlled systems**
- **no supported external API processing of student data**
- **local-model or deterministic-only handling**
- **draft/review/manual-send workflow**
- **structured case tracking for student requests**

## What SuperTA does

SuperTA helps a professor:
- triage course email across multiple offerings
- route messages to the right course context
- ground decisions in local course files
- escalate sensitive categories instead of casually resolving them
- create draft replies for professor review
- track operational student cases like:
  - extension requests
  - exam time change requests
  - grade-related issues
  - logistics/admin follow-ups

This is **not** a promise of autonomous academic decision-making.

## Privacy and deployment stance

SuperTA is built around a strict student-data boundary:
- **no supported hosted third-party model API path for student email content**
- **no supported external API path for student-data processing**
- **manual send from Gmail** rather than automatic outbound send
- **redacted operator views** by default
- **structured case records** instead of broad raw-transcript persistence everywhere

Supported posture for real student data:
- OpenClaw on local or institution-controlled infrastructure
- local model only, or deterministic local logic only
- draft/review/manual-send workflow
- institution-controlled storage

See:
- `docs/privacy-and-deployment.md`
- `docs/ferpa-safe-defaults.md`

## Current release posture

Today, the honest framing is:
- **public GitHub project**
- **OpenClaw plugin prototype / developer preview**
- **privacy-conscious teaching operations tool**

It is ready to share publicly as an experimental project.
It is **not** a polished managed production SaaS.

## Recommended first-run path

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
- `docs/release-readiness.md`

## What the plugin already includes

- OpenClaw plugin entrypoint
- Gmail integration plumbing
- local course-file grounding
- deterministic policy controls
- local-model policy boundary
- review queue + draft workflow
- structured student case ledger
- case dedup/linking for repeated requests
- internal case operations API for OpenClaw-driven conversational flows
- operator inspection commands
- interactive setup + doctor output
- evals and test coverage

## What it does not promise

SuperTA should **not** be presented as:
- autonomous grading/accommodation/integrity decision-making
- a hosted AI email service
- a generic external-API orchestration layer for student data
- turnkey institutional Gmail infrastructure
- a legal certification or blanket FERPA guarantee

A better public claim is:

> SuperTA is a privacy-conscious OpenClaw plugin for professor email workflows that keeps student-data handling in local or institution-controlled systems, uses local models or deterministic logic only, and keeps humans in the loop for outbound communication.

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

## Quick checks

```bash
npm run build
npm test
node dist/evals/run-evals.js
```

## Key docs

- `docs/getting-started.md`
- `docs/privacy-and-deployment.md`
- `docs/ferpa-safe-defaults.md`
- `docs/public-demo-walkthrough.md`
- `docs/release-readiness.md`
- `docs/announcement-draft.md`
- `docs/launch-checklist.md`

## License

MIT
