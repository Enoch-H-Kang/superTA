# Getting Started

## Recommended first-run path

SuperTA’s recommended default path does **not** require any additional model API.

Run:

```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

That is the main onboarding story.

## What this gives you

With the default setup, you get:
- an OpenClaw plugin
- Gmail integration plumbing
- local course-file grounding
- deterministic policy controls
- human review/approval workflow

without needing OpenAI or another model API.

## After setup

Useful next commands:

```bash
node dist/plugins/superta/src/setup/list-courses.js local.config.json
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
node dist/plugins/superta/src/commands/inspect-state.js . 20
```

## Advanced optional mode

If you want to experiment with model-backed classification later, see:
- `docs/responses-classifier.md`

That path is optional and not required for the default plugin story.

## Manual alternatives

For lower-level setup commands and multi-course manual workflows, see:
- `docs/multi-course-setup.md`

## Read next

Start with:
- `docs/public-demo-walkthrough.md`
- `docs/demo-script.md`
- `docs/launch-checklist.md`
- `docs/announcement-draft.md`
- `docs/release-readiness.md`
- `docs/gmail-production-ops.md`
- `docs/architecture.md`
