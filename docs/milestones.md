# SuperTA GitHub Milestones / Issues Plan

## Milestone 0 — Repository foundation
Goal: create the base repo structure and engineering scaffolding.

Issues:
- Initialize `superta` repository structure
- Add plugin package scaffold
- Add `README.md` with MVP scope and safety constraints
- Add top-level `AGENTS.md` for repo-specific instructions
- Add templates for professor profile, course family, and course run
- Add linting, formatting, and test runner
- Add initial architecture and safety docs

## Milestone 1 — Gmail ingestion
Goal: ingest and normalize inbound Gmail threads.

Issues:
- Implement Gmail auth/config flow
- Implement Gmail webhook/PubSub ingestion endpoint
- Add email dedupe/idempotency handling
- Normalize inbound Gmail messages into internal thread schema
- Extract attachment metadata
- Detect sender role candidates
- Add tests for ingestion + normalization

## Milestone 2 — Course routing
Goal: safely map inbound mail to the correct live course offering.

Issues:
- Implement alias-based routing
- Implement prior-thread routing memory
- Implement fallback subject/body heuristic routing
- Add route confidence scoring
- Add ambiguous-route handling path
- Add routing tests for multi-course professor scenarios

## Milestone 3 — Course knowledge retrieval
Goal: ground replies in explicit course data.

Issues:
- Implement loader for `syllabus.md`
- Implement loader for `faq.md`
- Implement loader for `policy.yaml`
- Implement loader for `schedule.yaml`
- Build retrieval/evidence bundle builder
- Add evidence serialization to audit layer
- Add tests for policy-first retrieval behavior

## Milestone 4 — Structured classification
Goal: classify inbound emails into bounded decision outputs.

Issues:
- Define classification schema
- Implement LLM prompt and structured output contract
- Add categories for logistics, deadline, technical/setup, office-hours/admin, policy, grade-related, accommodation-sensitive, integrity-sensitive, wellbeing/safety, and other
- Add confidence scoring
- Add tests with fixed fixtures

## Milestone 5 — Deterministic policy engine
Goal: enforce safety independent of model behavior.

Issues:
- Implement hard escalation rules for sensitive categories
- Implement evidence-required checks
- Implement low-confidence fallback behavior
- Implement route-ambiguity override behavior
- Implement allowlisted professor-command validation
- Add tests for all fail-closed paths

## Milestone 6 — Draft reply generation
Goal: produce useful, grounded draft replies.

Issues:
- Implement routine reply drafting
- Implement “needs more info” drafting
- Implement escalation-summary drafting for professor
- Inject professor style rules into drafting layer
- Add source-grounding metadata to every draft
- Add tests on factual correctness and template behavior

## Milestone 7 — Review queue and sending workflow
Goal: enable safe professor review and execution.

Issues:
- Implement draft queue
- Implement approve-and-send action
- Implement edit-and-send support
- Implement reject / mark-for-follow-up actions
- Implement Gmail send/reply/forward actions
- Add end-to-end audit logging
- Add tests for send approval flow

## Milestone 8 — Daily digest
Goal: summarize cross-course operational status for the professor.

Issues:
- Aggregate handled threads across course agents
- Aggregate pending drafts and escalations
- Summarize repeated confusion topics
- Summarize upcoming deadlines from schedules
- Generate digest email draft
- Add digest quality tests / snapshot tests

## Milestone 9 — Style learning as candidate preferences
Goal: improve drafting style without silent drift.

Issues:
- Implement draft-to-final diff extractor
- Implement candidate style rule store
- Implement candidate template extraction
- Implement promotion scoring across repeated examples
- Implement explicit approval path for promotion
- Add tests preventing unsafe category auto-promotion

## Milestone 10 — Confusion clustering and FAQ suggestions
Goal: surface repeated student confusion without auto-mutating course knowledge.

Issues:
- Cluster recent threads by question theme
- Detect frequency spikes
- Generate FAQ candidate suggestions
- Generate suggested broadcast clarification drafts
- Add cluster summaries to daily digest
- Add tests with repeated-question fixtures

## Milestone 11 — Reminder and schedule workflows
Goal: support syllabus-driven communication workflows.

Issues:
- Parse `schedule.yaml`
- Generate upcoming milestone reminder candidates
- Generate weekly preview drafts
- Generate “grades posted” style reminder drafts
- Add reminder scheduling queue
- Add tests for date parsing and reminder generation

## Milestone 12 — Professor email command layer
Goal: allow lightweight control through email.

Issues:
- Define command grammar for `[SUPERTA APPROVE]`
- Define command grammar for `[SUPERTA POLICY]`
- Define command grammar for `[SUPERTA TASK]`
- Define command grammar for `[SUPERTA FAQ]`
- Restrict command execution to allowlisted addresses
- Add tests for spoofed/invalid commands

## Milestone 13 — Course-family memory
Goal: separate reusable course lineage knowledge from run-specific memory.

Issues:
- Implement course-family memory store
- Add inheritance logic into retrieval layer
- Add workflow for approving reusable FAQ seeds
- Prevent run-specific dates/staff from entering family layer
- Add tests for family/run separation

## Milestone 14 — Term rollover scaffold
Goal: bootstrap the next offering from prior course structure.

Issues:
- Archive completed course-run state
- Clone forward approved reusable materials
- Require new `syllabus.md` and `schedule.yaml`
- Generate rollover diff report
- Create new course-run workspace scaffold
- Add rollover tests for correct carry-forward behavior

## Milestone 15 — Evaluation harness
Goal: continuously measure quality and safety.

Issues:
- Create anonymized fixtures for routine cases
- Create fixtures for sensitive cases
- Create classification rubric
- Create escalation correctness rubric
- Create draft usefulness rubric
- Build evaluation runner
- Integrate evals into CI

## Milestone 16 — Packaging and pilot readiness
Goal: make SuperTA installable and demo-ready.

Issues:
- Prepare npm plugin packaging
- Prepare ClawHub skill pack packaging
- Write operator install guide
- Write professor onboarding guide
- Write sample course setup guide
- Add demo fixture and walkthrough
- Run pilot-readiness checklist

## Milestone update — current highest-priority gaps

The repo has now validated live Gmail development access for:
- listing recent threads
- fetching a real thread
- creating a real draft reply

That shifts the highest-priority gaps to:
- wiring live Gmail into actual plugin/runtime flows instead of standalone smoke tests
- implementing refresh-token-based access token renewal
- completing inbound Gmail watch/history/webhook handling with idempotency
- connecting the live classifier path while keeping deterministic policy as the final gate
