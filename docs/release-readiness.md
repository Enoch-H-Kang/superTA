# SuperTA Release Readiness

## Current recommendation

SuperTA is ready to present as a:
- **public GitHub project**
- **OpenClaw plugin prototype / developer preview**
- **privacy-conscious professor email operations tool**

## Recommended public story

The public story should be:
- SuperTA is an **OpenClaw plugin**
- it is **Gmail-backed**
- it uses **local course files**
- it keeps student-data handling **local or institution-controlled**
- it supports **local-model or deterministic-only** processing
- it is **draft/review/manual-send**
- it tracks student requests through a **structured case ledger**

## Strong points

- privacy-conscious architecture story is much clearer
- local-model policy boundary exists
- runtime send is removed from the supported workflow
- structured student case tracking exists
- case dedup/linking exists
- internal case operations API exists for OpenClaw-driven conversational flows
- setup/onboarding is credible
- tests/evals are real

## Remaining caveats

### 1. Still a prototype/developer preview
This is not yet a polished managed product.

### 2. Gmail inbound ops still require operator competence
Webhook reachability, auth, and watch lifecycle still need competent setup.

### 3. Legal/compliance language should stay careful
Do not overclaim legal certification.

## Public wording recommendation

Reasonable public wording:

> SuperTA is an experimental OpenClaw plugin for professor email workflows across multiple courses. It keeps student-data handling in local or institution-controlled systems, uses local models or deterministic logic instead of hosted external APIs, supports draft/review/manual-send workflows, and maintains structured student case records for operational follow-through.
