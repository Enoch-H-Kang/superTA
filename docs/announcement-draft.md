# SuperTA Announcement Draft

## Short version

I’ve been building **SuperTA**, an experimental **OpenClaw plugin** for professor email workflows across multiple live courses.

The design goal is simple:
- keep student-data handling in **local or institution-controlled systems**
- avoid **external API processing** of student email content
- use **local models or deterministic logic only**
- keep a **draft/review/manual-send** workflow
- track student requests with a **structured case ledger**

It’s a developer preview / technical early-adopter project, not a polished managed product.

## Slightly longer version

I’ve been working on **SuperTA**, an OpenClaw plugin for handling teaching-related email for a single professor across multiple live course offerings.

This is **not** “fully autonomous AI TA.”
It’s meant to be a bounded operations layer for course email:
- route messages by course
- ground work in local course files
- escalate sensitive issues instead of casually resolving them
- generate reviewable drafts
- track operational student cases like extension requests, exam time changes, and follow-ups

The privacy posture is a core part of the design:
- no supported external API path for student-data processing
- no supported hosted third-party model path for student email content
- local-model or deterministic-only handling
- manual send from Gmail

Current release posture:
- public GitHub project
- OpenClaw plugin prototype / developer preview
- intended for technical early adopters and contributors

## Suggested close

If you’re interested in privacy-conscious OpenClaw workflows for education, I’d love feedback.

## Suggested links

- `README.md`
- `docs/getting-started.md`
- `docs/privacy-and-deployment.md`
- `docs/release-readiness.md`
