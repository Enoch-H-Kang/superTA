# Privacy and Deployment

This page describes the **supported privacy-preserving deployment posture** for SuperTA.

## Core rule

For workflows involving student email or student-record-derived content:

- **keep processing local or institution-controlled**
- **do not use external APIs to process student data**
- **do not use hosted third-party model APIs for student email content**

SuperTA is designed around that boundary.

## Supported posture

For real student data, the supported posture is:

- OpenClaw runs on local or institution-controlled infrastructure
- email handling stays inside local or institution-controlled systems
- model-based handling is **local-model only**
- deterministic local logic is also supported
- outbound responses are **manual-send from Gmail**
- operator-facing state is redacted by default
- structured case records are preferred over raw transcript-style persistence

## Not supported for student-data workflows

These are outside the supported privacy-preserving path:

- hosted third-party model APIs on student email content
- external classification APIs on student email content
- external logging/analytics receiving student message content
- automatic outbound sending from SuperTA runtime
- broad persistence of raw copied student emails everywhere

## What SuperTA stores

SuperTA may store operational records needed for course administration, such as:

- student request type
- student identity in normalized form
- course and thread linkage
- status and sensitivity
- case history/events
- review state
- audit metadata

The design goal is:

> **store operational facts and workflow state, not unnecessary raw transcript copies**

## Student case ledger

SuperTA maintains structured student cases for issues like:
- extension requests
- exam time change requests
- grade-related issues
- logistics/admin matters

Cases can accumulate multiple related emails and events over time.

This lets the professor and OpenClaw work from a structured record instead of treating each message as a totally separate incident.

## Outbound communication

SuperTA’s supported communication posture is:

- create drafts
- review drafts
- professor sends manually from Gmail

That keeps the final outbound action in human hands.

## Public claims we can responsibly make

Good claims:
- local-model or deterministic-only student-data handling
- no supported external API path for student-data processing
- draft/review/manual-send workflow
- structured student case tracking
- privacy-conscious by design

Claims to avoid unless separately reviewed and justified:
- blanket “FERPA compliant” guarantees
- unconditional “FERPA safe” legal language
- claims that no student data is ever stored

## Simple summary

If you want one sentence:

> SuperTA is intended to keep student email handling inside local or institution-controlled systems, avoid external API processing of student data, and preserve human control over outbound communication.
