# SuperTA GitHub Issues Pack

Use these as copy-paste GitHub issues.

---

## Issue 1 — Initialize repository foundation
**Labels:** `type:infra`, `P0`

### Summary
Establish the core repository structure for SuperTA, including plugin code, docs, templates, skills, and eval scaffolding.

### Why
This creates the project stem for all future engineering work and ensures the repo reflects the architecture plan.

### Tasks
- verify top-level repo structure
- keep README aligned with current MVP scope
- keep AGENTS.md aligned with safety constraints
- verify docs, templates, plugin, skills, and eval folders exist

### Acceptance criteria
- repository structure is coherent and documented
- README explains product boundary and MVP
- AGENTS.md documents engineering and safety constraints
- docs folder contains architecture and milestones docs

---

## Issue 2 — Add plugin package and TypeScript tooling
**Labels:** `type:infra`, `area:plugins`, `P0`

### Summary
Set up the TypeScript package, build pipeline, and entrypoint structure for the OpenClaw plugin.

### Why
The plugin package is the runtime heart of SuperTA and needs a stable build/test foundation.

### Tasks
- maintain package metadata and scripts
- keep tsconfig aligned with plugin layout
- verify plugin entrypoint exports the expected modules
- prepare for future packaging as an npm plugin

### Acceptance criteria
- `npm run build` succeeds
- plugin entrypoint compiles cleanly
- package structure is ready for iterative module additions

---

## Issue 3 — Implement Gmail ingestion contract
**Labels:** `type:feature`, `area:gmail`, `P0`, `risk:privacy`

### Summary
Define and implement the first Gmail ingestion contract for SuperTA.

### Why
Reliable intake is the first operational requirement for a teaching delegate.

### Tasks
- define Gmail event schema
- define ingestion handler shape
- document idempotency expectations
- prepare for webhook/PubSub integration

### Acceptance criteria
- ingestion module accepts a typed Gmail event
- invalid or incomplete events fail safely
- ingestion path is documented for later integration work

---

## Issue 4 — Normalize Gmail thread/message schema
**Labels:** `type:feature`, `area:gmail`, `P0`

### Summary
Create a normalized internal schema for inbound Gmail messages and threads.

### Why
Downstream routing, classification, drafting, and audit logic all depend on a stable internal message format.

### Tasks
- define normalized thread type
- capture thread id, message id, sender, recipients, subject, body, attachments
- include course hint and professor-command flag
- add normalization defaults

### Acceptance criteria
- normalized thread schema covers all required fields
- normalization helper produces stable objects from partial inputs
- schema is suitable for routing and audit layers

---

## Issue 5 — Implement multi-course course routing
**Labels:** `type:feature`, `area:routing`, `P0`, `risk:routing`

### Summary
Route inbound email to the correct live course offering for a single professor with multiple active courses.

### Why
Wrong-course routing is one of the most dangerous failure modes in a multi-course teaching delegate.

### Tasks
- define course route output schema
- support alias-based routing first
- include route confidence and ambiguity flag
- fail closed when no reliable route is found

### Acceptance criteria
- routing returns course id or explicit ambiguity
- route confidence is recorded
- ambiguous routing does not silently produce a definitive answer

---

## Issue 6 — Define structured classification contract
**Labels:** `type:feature`, `area:routing`, `P0`, `risk:safety`

### Summary
Create the structured decision schema used by the model for inbox triage.

### Why
Bounded structured outputs are critical for safe delegation and deterministic enforcement.

### Tasks
- define categories for logistics, deadline, technical/setup, office-hours/admin, policy, grade-related, accommodation-sensitive, integrity-sensitive, wellbeing/safety, other
- define allowed actions: `draft_for_professor`, `needs_more_info`, `escalate_now`
- include confidence in the result

### Acceptance criteria
- classification contract is typed and documented
- action space is narrow and safe
- schema is suitable for policy-engine validation

---

## Issue 7 — Build deterministic policy engine
**Labels:** `type:feature`, `area:policy-engine`, `P0`, `risk:safety`, `risk:policy`

### Summary
Implement the deterministic policy layer that validates or overrides model recommendations.

### Why
The policy engine is the trust boundary between LLM outputs and real side effects.

### Tasks
- escalate grade-related, accommodation-sensitive, integrity-sensitive, and wellbeing/safety categories
- override actions when route is ambiguous
- define fail-closed behavior for low-confidence or unsupported states
- keep policy logic explicit and testable

### Acceptance criteria
- sensitive categories always escalate
- ambiguous routing never yields a definitive answer
- policy engine can override unsafe model actions deterministically

---

## Issue 8 — Implement course evidence bundle builder
**Labels:** `type:feature`, `area:retrieval`, `P1`

### Summary
Create the retrieval/evidence bundle structure for course-grounded drafting.

### Why
Drafts should be supported by explicit course facts, not vibes.

### Tasks
- define evidence item types
- represent source path and snippet
- build a compact evidence bundle for downstream consumers

### Acceptance criteria
- evidence bundle accepts syllabus/faq/policy/schedule/template items
- output format is simple and stable
- evidence bundle can be attached to audit records later

---

## Issue 9 — Implement draft reply scaffold
**Labels:** `type:feature`, `area:drafting`, `P1`

### Summary
Build the first grounded reply draft helper using classification output plus evidence.

### Why
Drafting is the visible product surface, but it should sit on top of routing and policy constraints.

### Tasks
- accept classification and evidence inputs
- produce a draft body and subject prefix
- keep the function simple and deterministic at first

### Acceptance criteria
- draft generator returns a stable output object
- draft includes enough structure for future review/send workflows
- implementation is compatible with evidence-backed drafting expansion

---

## Issue 10 — Implement audit logging contract
**Labels:** `type:feature`, `area:audit`, `P1`, `risk:privacy`

### Summary
Define the first audit record schema and logging helper.

### Why
Auditability is mandatory for trust, debugging, and safe rollout.

### Tasks
- define minimal audit record schema
- log thread id, message id, action, and note
- keep the interface easy to expand later with evidence, drafts, and final sends

### Acceptance criteria
- audit logging module accepts typed records
- output is stable and machine-readable
- schema is extensible for future fields

---

## Issue 11 — Implement draft email tool contract
**Labels:** `type:feature`, `area:tools`, `P1`

### Summary
Define the first email draft tool contract used by the action executor.

### Why
SuperTA should separate decision-making from side-effect execution.

### Tasks
- accept recipient list, subject, and body
- return a draft object with explicit status
- keep tool contract narrow and email-specific

### Acceptance criteria
- draft email helper is typed
- output is suitable for later integration with Gmail draft APIs
- no direct send side effect occurs in this layer

---

## Issue 12 — Add evaluation scaffold sanity check
**Labels:** `type:test`, `area:evals`, `P1`

### Summary
Keep a minimal evaluation runner in place so the repo can exercise compiled output.

### Why
Even a thin scaffold benefits from a repeatable sanity test path.

### Tasks
- ensure eval runner imports built plugin code
- ensure it executes after build
- document current placeholder behavior

### Acceptance criteria
- `npm test` succeeds after build
- eval runner verifies the compiled module graph is healthy
- scaffold is ready for future fixture-based evals

---

## Issue 13 — Add real tests for routing and policy engine
**Labels:** `type:test`, `area:routing`, `area:policy-engine`, `P1`, `risk:safety`

### Summary
Add the first real tests around course routing and deterministic policy behavior.

### Why
Routing and policy are core safety-critical logic and should be test-driven early.

### Tasks
- test known route case
- test ambiguous route case
- test grade-related escalation
- test accommodation/integrity/wellbeing escalation

### Acceptance criteria
- safety-critical routing and policy cases are covered by tests
- tests fail if deterministic safeguards regress

---

## Issue 14 — Add course file loaders
**Labels:** `type:feature`, `area:retrieval`, `P1`

### Summary
Implement file loaders for `syllabus.md`, `faq.md`, `policy.yaml`, and `schedule.yaml`.

### Why
The retrieval layer should be grounded in local structured course materials.

### Tasks
- define loader interfaces
- load markdown and yaml files from a course-run workspace
- fail safely when files are missing or malformed

### Acceptance criteria
- file loaders return typed content or explicit failure states
- retrieval layer can consume the results cleanly

---

## Issue 15 — Expand README into operator-facing setup guide
**Labels:** `type:docs`, `P1`

### Summary
Turn the README from a conceptual overview into a practical setup and usage guide.

### Why
A repo that cannot onboard a human operator is hard to pilot or share.

### Tasks
- add repository overview
- add setup instructions
- add architecture summary
- add repo map
- add near-term roadmap section

### Acceptance criteria
- a new collaborator can understand the repo layout and next steps from README alone
- README stays aligned with actual scaffold contents
