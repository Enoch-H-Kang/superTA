# Getting Started

## Recommended first-run path

SuperTA’s supported onboarding story is:
- OpenClaw plugin
- Gmail-backed
- local course files
- local-model or deterministic-only handling
- draft/review/manual-send workflow

Run:

```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

## What this gives you

With the supported default setup, you get:
- an OpenClaw plugin
- Gmail integration plumbing
- local course-file grounding
- deterministic policy controls
- local-model policy boundary
- human review before outbound communication
- structured student case tracking
- redacted operator views by default

## Useful next commands

```bash
node dist/plugins/superta/src/setup/list-courses.js local.config.json
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
node dist/plugins/superta/src/commands/inspect-state.js . 20
```

## Privacy note

For real student data:
- keep the local/institution-controlled deployment posture
- do not use hosted external APIs for student-data processing
- use local deterministic logic or local models only
- keep the draft/review/manual-send workflow

## Read next

Start with:
- `docs/privacy-and-deployment.md`
- `docs/ferpa-safe-defaults.md`
- `docs/public-demo-walkthrough.md`
- `docs/release-readiness.md`
- `docs/announcement-draft.md`
