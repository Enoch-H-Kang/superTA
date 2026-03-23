# SuperTA

![Status](https://img.shields.io/badge/status-prototype-blue)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**SuperTA** is a Gmail-backed **OpenClaw plugin** for a single professor across multiple live course offerings.

**Default promise:** SuperTA does **not** require any additional model API to get started.

The default setup uses:
- OpenClaw
- Gmail integration
- local course files
- deterministic policy logic
- human review/approval

Optional advanced model-backed classification exists, but it is **not required** for the core plugin story.

---

## What SuperTA is

SuperTA is an OpenClaw plugin that helps a professor:
- triage routine course email
- keep course facts isolated by offering
- draft low-risk responses
- escalate sensitive cases instead of auto-resolving them
- maintain an auditable review/send trail

This is **not** a promise of autonomous academic decision-making.

It is a **draft-first, bounded, human-in-the-loop teaching delegate**.

---

## No-extra-API default story

By default, SuperTA can be presented as:

> a Gmail-backed OpenClaw plugin that works with local course files, deterministic policy controls, and human review — without requiring any extra model API.

That is the public-facing default.

## Optional advanced mode

SuperTA also contains an **optional experimental Responses/OpenAI integration** for model-backed classification.

That path is:
- secondary
- advanced
- not required for normal plugin installation
- not part of the core “no extra API required” promise

See:
- `docs/responses-classifier.md`

---

## Recommended onboarding path

If you are trying SuperTA for the first time, use this path:

```bash
cd superta
npm install
npm run build
node dist/plugins/superta/src/setup/interactive-setup.js
node dist/plugins/superta/src/setup/doctor-report.js local.config.json . 3600000
```

For a detailed walkthrough, see:
- `docs/getting-started.md`
- `docs/public-demo-walkthrough.md`
- `docs/demo-script.md`
- `docs/launch-checklist.md`
- `docs/announcement-draft.md`

For advanced/manual setup commands, see:
- `docs/multi-course-setup.md`

---

## What the plugin already includes

- OpenClaw plugin entrypoint
- multi-course routing
- local file-grounded retrieval
- deterministic policy enforcement
- draft generation
- review queue + persistence
- audit logging
- Gmail read/fetch/draft/send plumbing
- Gmail webhook/history/watch scaffolding
- watch renewal helpers + operational commands
- operator inspection commands
- multi-course onboarding commands
- interactive setup + doctor output
- safety evals and classifier fixture evals

---

## What it does *not* promise yet

SuperTA should **not** be presented today as:
- a polished production SaaS
- turnkey production Gmail infrastructure
- autonomous grading/accommodation/integrity decision-making
- a fully managed deployment product

See:
- `docs/release-readiness.md`
- `docs/gmail-production-ops.md`
- `docs/plugin-publish-checklist.md`

---

## Quick health checks

### Run tests
```bash
npm test
```

### Run evals
```bash
node dist/evals/run-evals.js
```

Current evals check:
- sensitive-category escalation
- ambiguous course routing
- classifier fail-closed behavior
- fixture-based classifier expectations
- harder edge cases like indirect accommodations and low-evidence fail-closed cases

---

## Gmail setup note

SuperTA’s Gmail path is real enough for development and technical early adoption, but production-like inbound operation still requires explicit operator setup for:
- auth
- webhook reachability
- Pub/Sub topic readiness
- watch lifecycle handling

See:
- `docs/gmail-production-ops.md`

---

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

Important docs:
- `docs/getting-started.md`
- `docs/public-demo-walkthrough.md`
- `docs/multi-course-setup.md`
- `docs/release-readiness.md`
- `docs/gmail-production-ops.md`
- `docs/plugin-publish-checklist.md`
- `docs/responses-classifier.md`

---

## Release posture

Today, the honest public framing is:
- **public GitHub project**
- **OpenClaw plugin prototype**
- **developer preview / technical early-adopter tool**

That is strong enough to share publicly.
It is **not yet** a polished mass-market production release.

---

## License

MIT
