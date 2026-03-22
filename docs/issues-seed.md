# SuperTA Starter GitHub Issues

Copy-paste these as your first issue backlog.

## 1. Initialize SuperTA repo scaffold
Create the initial repository structure with folders for plugin code, skills, templates, docs, and evals.

**Acceptance criteria**
- base directory structure exists
- README and AGENTS docs exist
- docs folder contains architecture and milestones docs

## 2. Add plugin package scaffold
Create the initial npm package structure for the OpenClaw plugin.

**Acceptance criteria**
- `package.json` exists
- plugin entrypoint file exists
- build/test placeholders exist

## 3. Implement Gmail ingestion endpoint
Add the first Gmail webhook/PubSub ingestion path.

**Acceptance criteria**
- endpoint receives events
- invalid events fail safely
- events are persisted or queued for normalization

## 4. Normalize Gmail thread schema
Define and implement the normalized internal thread/message schema.

**Acceptance criteria**
- normalized object captures thread, sender, recipients, subject, body, attachments, and course hints
- normalization tests exist

## 5. Implement multi-course alias routing
Route inbound messages to the correct live course offering.

**Acceptance criteria**
- alias-based routing works
- ambiguous routing is detected
- wrong-course silent routing is blocked

## 6. Load course knowledge files
Load `syllabus.md`, `faq.md`, `policy.yaml`, and `schedule.yaml` into retrieval.

**Acceptance criteria**
- file loaders exist
- retrieval bundle includes evidence snippets
- missing file paths fail gracefully

## 7. Define structured classification contract
Create the schema for LLM decision outputs.

**Acceptance criteria**
- schema covers category, action, confidence, sources, and notification flags
- schema validation exists

## 8. Implement deterministic policy engine
Create the validator/override layer that constrains model outputs.

**Acceptance criteria**
- sensitive categories are always escalated
- missing evidence blocks definitive answers
- route ambiguity forces clarification or escalation

## 9. Implement draft reply generator
Generate grounded draft replies for routine cases.

**Acceptance criteria**
- routine drafts are grounded in evidence
- “needs more info” drafts are supported
- escalation summaries are supported

## 10. Implement review queue and approve/send flow
Create the professor-facing workflow for reviewing and sending drafts.

**Acceptance criteria**
- drafts can be approved, edited, rejected, or escalated
- send actions are auditable

## 11. Implement audit logging schema
Define and store the audit trail for all message handling.

**Acceptance criteria**
- source email, evidence, classification, final action, and sent output are logged
- logs are queryable or at least structurally consistent

## 12. Implement daily digest aggregation
Create a single digest summarizing all active course agents.

**Acceptance criteria**
- digest includes handled threads, pending drafts, escalations, and upcoming deadlines
- digest aggregates across live course offerings
