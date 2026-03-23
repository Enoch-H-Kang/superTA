# SuperTA Announcement Draft

## Short version

SuperTA is an experimental Gmail-backed OpenClaw plugin for one professor across multiple live courses.

It supports:
- local course-file grounding
- deterministic safety controls
- multi-course onboarding
- draft-first human-in-the-loop workflows
- Gmail integration plumbing

The default setup does **not** require any extra model API.

SuperTA is currently best suited for:
- technical early adopters
- contributors
- people who want to explore a careful teaching-delegate workflow inside OpenClaw

It is **not yet** a polished production release.

## Slightly longer version

I’ve been building **SuperTA**, an experimental OpenClaw plugin for handling teaching-related email for a single professor across multiple live course offerings.

The goal is not “fully autonomous AI TA.”
The goal is a bounded, safer system that can:
- route emails by course
- ground responses in local course files
- escalate sensitive categories
- generate draft-first responses
- preserve audit/review state

It now includes:
- multi-course setup helpers
- interactive onboarding
- Gmail read/fetch/draft/send plumbing
- doctor and operator inspection commands
- safety/eval coverage
- an OpenClaw plugin boundary

Default story:
- OpenClaw plugin
- Gmail-backed
- no extra model API required by default

Optional advanced model-backed classification exists, but it is secondary and experimental.

## Suggested links
- repo root README
- getting started guide
- public demo walkthrough
- release readiness notes
