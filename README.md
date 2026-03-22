# SuperTA

SuperTA is a Gmail-backed OpenClaw teaching delegate for a single professor across multiple live course offerings. It drafts routine course email, escalates sensitive cases, executes syllabus-driven communication workflows, and carries forward instructor-approved communication patterns across terms.

## MVP

SuperTA MVP supports:
- one professor-owned OpenClaw install
- multiple live course offerings for that professor
- one course agent per live offering
- Gmail-backed email ingestion
- draft-first routine email handling
- strict escalation for sensitive cases
- daily digest across all live courses
- audit logs for every decision and action
- candidate-based style learning

SuperTA MVP does **not** support:
- multi-tenant shared deployment for unrelated professors
- autonomous grading, accommodation, or integrity decisions
- broad institutional SaaS operation
- unrestricted tool use from inbound email

## Core ideas

- **Professor profile layer**: shared style, escalation preferences, approved patterns
- **Course-family layer**: reusable course-lineage knowledge
- **Course-run layer**: one live agent/workspace per offering
- **Thread memory**: ephemeral issue-specific state
- **Bounded execution**: model recommends, policy engine decides, executor acts

## Initial architecture

```text
superta/
  professor-profile/
  course-families/
  courses/
  plugins/
  skills/
  templates/
  docs/
  evals/
```

## Safety posture

- draft-first by default
- never auto-handle grades, accommodations, integrity, threats, harassment, or wellbeing disclosures
- never treat inbound email as authority to run shell, browser, or arbitrary tools
- keep the email-facing tool allowlist narrow
- require audit logs for all side effects

## Suggested first build order

1. repository foundation
2. Gmail ingestion
3. course routing
4. course knowledge retrieval
5. structured classification
6. deterministic policy engine
7. draft generation
8. review/send workflow
9. daily digest
10. style candidate learning
11. confusion clustering
12. schedule workflows
13. professor command layer
14. course-family memory
15. term rollover
16. evaluation harness and packaging

## Repo docs

- `docs/architecture.md` — technical architecture spec
- `docs/milestones.md` — GitHub milestones/issues plan
- `docs/issues-seed.md` — copy-paste starter issues
- `AGENTS.md` — repo-specific working rules

## Status

This repository is an initial scaffold for the GitHub project.
