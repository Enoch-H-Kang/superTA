# SuperTA

![Status](https://img.shields.io/badge/status-prototype-blue)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**SuperTA** is a Gmail-backed OpenClaw teaching delegate for a single professor across multiple live course offerings.

It is designed to help with:
- routine course email triage and drafting
- escalation of sensitive student cases
- syllabus/policy-grounded responses
- course-by-course isolation of facts and workflows
- human-in-the-loop approval before important actions

> Current state: **prototype scaffold with a working vertical slice**. Useful for development, demos, and architecture exploration — not production-ready yet.

---

## Why SuperTA

Professors get buried in repetitive course email.

SuperTA is meant to act like a careful teaching delegate that can:
- understand which course an email belongs to
- retrieve the right local policy/syllabus context
- classify the issue into a bounded action schema
- draft low-risk responses
- escalate risky or judgment-heavy cases
- preserve a professor’s preferred communication patterns over time

The goal is **not** “fully autonomous AI professor.”

The goal is a **safe, auditable, course-aware inbox delegate**.

---

## What it does today

This repo already includes:
- central config + config loading from disk
- multi-course routing
- retrieval from course files
- bounded classification + deterministic policy enforcement
- draft generation
- review queue + persistence
- audit logging
- Gmail client/executor boundaries
- professor command parsing
- FAQ/policy proposal lifecycle
- Responses-style classifier scaffolding
- richer Gmail reply metadata preservation
- a tested deadline-email vertical slice

---

## Who this is for

Right now, SuperTA is scoped for:
- **one professor-owned OpenClaw install**
- **multiple active courses for that professor**
- **one course agent per live offering**
- **draft-first operation by default**

It is **not** currently intended for:
- multi-tenant shared deployment across unrelated faculty
- autonomous grading, accommodation, or integrity decisions
- unrestricted external tool execution from inbound email

---

## Quick start

### Requirements
- Node.js 20+ recommended
- npm

### 1) Install dependencies
```bash
cd superta
npm install
```

### 2) Build
```bash
npm run build
```

### 3) Run tests
```bash
npm test
```

If build and tests pass, the prototype is in a healthy state.

---

## Configuration

A sample config is included here:
- `config.example.json`

### Create a local config
```bash
cp config.example.json local.config.json
```

Then edit it for your local environment.

### Current config fields
- `professorId`
- `gmail.webhookPath`
- `gmail.allowedProfessorSenders`
- `routing`
- `courseRoots`

### Load config from code
The scaffold currently supports:
- `loadConfigFromFile(path)`

For more detail, see:
- `docs/config.md`
- `docs/getting-started.md`

---

## First demo workflow

The clearest end-to-end demo right now is the **deadline email workflow**.

### Demo path
1. student sends a deadline-related email
2. SuperTA routes it to the correct live course
3. course facts are retrieved from local files
4. classifier marks it as a routine deadline case
5. a review item is created and persisted
6. professor approves the draft
7. send flow runs
8. review item is persisted as `sent`

Relevant files:
- `plugins/superta/src/demo/deadline-workflow.ts`
- `plugins/superta/test/deadline-workflow.test.ts`
- `docs/demo-workflow.md`

---

## Architecture at a glance

```text
Inbound Email
    ↓
Normalize + Route
    ↓
Retrieve Course Facts
    ↓
Classifier Provider
    ↓
Deterministic Policy Engine
    ↓
Queue / Escalate / Needs More Info
    ↓
Professor Approval
    ↓
Send + Persist + Audit
```

Core design principles:
- model outputs are bounded
- policy decisions are deterministic
- course knowledge stays isolated by live offering
- important actions are auditable
- human approval remains central

For the deeper architecture writeup, see:
- `docs/architecture.md`

---

## Usage today

This is still a prototype, so “usage” currently means:
- running the test suite
- exploring the vertical slice
- extending the plugin scaffold
- experimenting with local configs and mocked providers

This is **not yet** a polished installable OpenClaw plugin release.

---

## Repository layout

```text
superta/
  plugins/
    superta/
      src/
      test/
  templates/
  skills/
  docs/
  evals/
  config.example.json
```

Important paths:
- `plugins/superta/src/` — core plugin/runtime code
- `plugins/superta/test/` — test suite
- `docs/architecture.md` — technical architecture
- `docs/milestones.md` — milestone/issues plan
- `docs/github-issues.md` — GitHub issue seed pack
- `docs/demo-workflow.md` — vertical-slice demo explanation
- `docs/proposals.md` — FAQ/policy proposal behavior
- `docs/responses-classifier.md` — classifier adapter overview
- `docs/responses-http-client.md` — HTTP client scaffold notes

---

## Recommended developer workflow

From the `superta/` directory:

```bash
npm install
npm run build
npm test
```

Start reading here if you want to extend the repo:
- `docs/getting-started.md`
- `docs/architecture.md`
- `plugins/superta/src/index.ts`
- `plugins/superta/src/demo/deadline-workflow.ts`
- `plugins/superta/test/run-tests.ts`

---

## Safety model

SuperTA is built around a few hard constraints:
- **draft-first by default**
- **sensitive categories must escalate**
- **model outputs are bounded by a deterministic policy layer**
- **inbound email must not trigger arbitrary tool execution**
- **important actions should be auditable**
- **course knowledge should stay isolated by live offering**

---

## What works vs. what is still scaffolded

### Already in place
- config loading
- routing
- retrieval
- classification boundary
- policy enforcement
- draft generation
- queue persistence
- audit persistence
- professor command parsing
- proposal review/apply flow
- reply metadata preservation
- demo vertical slice

### Still scaffolded / incomplete
- real live Gmail integration
- real live OpenAI Responses integration
- production-grade policy/file mutation logic
- packaging/install flow for real OpenClaw plugin release
- polished operator UI/admin surface

---

## Contributing

See:
- `CONTRIBUTING.md`

Short version:
- keep safety and bounded execution first
- preserve deterministic controls around model output
- add tests when changing routing, policy, drafting, persistence, or provider boundaries
- update docs when behavior changes

---

## Near-term roadmap

Strong next directions include:
- real provider wiring for OpenAI Responses
- richer Gmail integration and reply semantics
- more polished FAQ/policy merge behavior
- packaging for actual OpenClaw plugin usage
- additional vertical slices beyond deadline-email handling

---

## License

MIT
