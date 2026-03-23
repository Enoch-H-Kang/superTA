# SuperTA Release Readiness

## Current recommendation

SuperTA is ready to present as a:
- **public GitHub project**
- **OpenClaw plugin prototype**
- **developer preview / technical early-adopter tool**

## Default release story

The default public story should be:
- SuperTA is an **OpenClaw plugin**
- it is **Gmail-backed**
- it uses **local course files** and **deterministic policy logic**
- it is **draft-first** and **human-in-the-loop**
- it does **not require any extra model API** for the core install story

## Optional advanced story

An experimental Responses/OpenAI-backed classifier path exists, but it should be presented as:
- optional
- advanced
- not required for the core plugin promise

## Strong points

- plugin boundary is explicit
- setup/onboarding is much better than before
- doctor and inspection commands exist
- Gmail plumbing is real enough for credible technical use
- safety evals and classifier fixture evals exist
- operator visibility is much better than before

## Remaining caveats

### 1. Gmail inbound ops are not turnkey production infrastructure
Still missing:
- managed Pub/Sub IAM provisioning
- fully hosted webhook deployment story
- automated watch-renewal scheduling/orchestration

### 2. Production support posture is still prototype-grade
Still missing:
- polished packaging/release flow
- stronger deployment automation
- broader production hardening

### 3. Optional live classifier hardening is still incomplete
Still missing:
- more live mismatch review
- more prompt hardening on tricky cases

## Public wording recommendation

Reasonable public language:

> SuperTA is an experimental Gmail-backed OpenClaw plugin for one professor across multiple live courses. It supports local-file grounding, deterministic safety controls, multi-course onboarding, Gmail integration plumbing, and human-in-the-loop draft/review workflows. No extra model API is required for the default setup. Optional advanced model-backed classification exists for experimentation.
