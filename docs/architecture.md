# SuperTA Technical Architecture Spec

## Purpose
SuperTA is a Gmail-backed OpenClaw teaching delegate for one professor across multiple live course offerings. It drafts routine course email, escalates sensitive cases, drives syllabus-based communication workflows, and preserves instructor-approved communication patterns across terms.

## System boundaries

### In scope
- one professor-owned OpenClaw install
- multiple live course agents under that install
- Gmail-based course email ingestion
- draft/review/send workflow
- per-course retrieval from syllabus, FAQ, policy, and schedule files
- daily digest and reminder workflows
- term rollover support

### Out of scope
- shared multi-tenant deployment for unrelated professors
- autonomous grade/accommodation/integrity adjudication
- general-purpose email automation platform
- unrestricted tool use from inbound email

## Core principles
1. **One professor, many course agents**
2. **Layered memory, not blended memory**
3. **LLM recommends, policy engine decides**
4. **Draft-first by default**
5. **Evidence-backed outputs**

## High-level flow

```text
Gmail Inbox / Aliases
        |
        v
Email Ingestion Layer
        |
        v
Thread Normalization + Routing
        |
        +---------------------> Audit Log
        |
        v
Course Resolver
        |
        v
Per-Course Agent Context
        |
        +--> Retrieval Layer
        |
        +--> Thread Memory
        |
        v
LLM Decision Layer
        |
        v
Deterministic Policy Engine
        |
        +--> Escalate
        +--> Draft Queue
        +--> Reminder Queue
        +--> Digest Queue
        |
        v
Action Executor
```

## Memory layers

### Professor profile layer
Shared across all courses and terms.

Stores:
- tone preferences
- greeting/signoff habits
- style rules
- escalation preferences
- approved communication patterns
- "never say this" constraints

### Course-family layer
Reusable knowledge for a recurring course lineage.

Stores:
- evergreen FAQ seeds
- recurring confusion patterns
- stable norms
- reusable templates for that course family

### Course-run layer
Specific to a live offering.

Stores:
- syllabus
- FAQ
- policy.yaml
- schedule.yaml
- staff roster
- announcements
- course-run memory
- audit records

### Thread memory
Short-lived state for a specific email thread.

Stores:
- sender role
- missing attachment state
- prior office-hours referral
- escalation status
- unresolved ambiguity

## Email ingestion

Responsibilities:
- receive Gmail events
- fetch thread/message metadata
- normalize message content
- detect sender identity
- extract attachment metadata
- dedupe processed events
- map the message to a course context if possible

### Normalized thread object
```json
{
  "thread_id": "gmail-thread-123",
  "message_id": "gmail-msg-456",
  "received_at": "2026-03-22T19:05:00Z",
  "from": "student@uw.edu",
  "sender_role": "student",
  "to": ["cs101@school.edu"],
  "subject": "Question about HW3 late policy",
  "body_text": "...",
  "attachments": [],
  "course_hint": "cs101-sp26",
  "is_professor_command": false
}
```

## Course routing
Course routing is safety-critical.

Resolution sources:
- destination alias/mailbox
- course mapping rules
- explicit course code in subject/body
- prior thread association

If routing is ambiguous:
- do not issue a definitive answer
- request clarification or escalate

## Retrieval layer
Sources:
- `syllabus.md`
- `faq.md`
- `policy.yaml`
- `schedule.yaml`
- approved templates
- course-family memory
- professor style rules

Principles:
- retrieve local structured files first
- prefer explicit policy over inferred prose
- keep evidence attached to downstream actions

## LLM decision layer
The model performs:
- classification
- risk estimation
- action recommendation
- draft generation
- FAQ/update suggestion
- digest summarization

### Example output
```json
{
  "category": "deadline",
  "risk_tier": 1,
  "action": "draft_for_professor",
  "confidence": 0.89,
  "required_sources": ["policy", "faq"],
  "should_update_faq": false,
  "should_notify_professor": false,
  "draft_reply": "Hi ...",
  "reason": "Routine late-policy question answered in course policy."
}
```

## Deterministic policy engine
Responsibilities:
- validate model output
- override unsafe actions
- apply hard-coded escalation rules
- block unsupported sends
- enforce evidence requirements
- enforce course isolation

Example rules:
- escalate grades, accommodations, integrity, and wellbeing/safety
- if route confidence is too low, ask for clarification or escalate
- if required evidence is missing, forbid definitive answer
- if professor-command sender is not allowlisted, ignore command semantics

## Action executor
Allowed actions:
- create draft
- send approved email
- forward thread
- apply Gmail label
- queue digest
- queue reminder
- notify professor

Not allowed:
- arbitrary shell execution
- arbitrary browser automation
- policy mutation from student content
- unrestricted external actions

## Draft/review/send workflow
1. inbound email arrives
2. route to course agent
3. retrieve evidence
4. model generates recommendation + draft
5. policy engine validates or overrides
6. outcome goes to draft queue or escalation
7. professor reviews and sends

Audit stores:
- source email
- evidence bundle
- classifier output
- final action
- draft text
- human edits
- final sent email

## Professor commands
Examples:
- `[SUPERTA APPROVE]`
- `[SUPERTA POLICY]`
- `[SUPERTA TASK]`
- `[SUPERTA ROLLOVER]`
- `[SUPERTA FAQ]`

Only allowlisted professor/staff senders may invoke them.

## Reminder and digest layer
Inputs:
- `schedule.yaml`
- `syllabus.md`
- prior announcement state

Outputs:
- reminder drafts
- weekly preview drafts
- digest summaries across all live course agents

## Style learning
Professor edits become candidate style rules.

Promote only after:
- repeated pattern across multiple edits, or
- explicit approval

Never auto-promote:
- grading stance
- integrity language
- accommodation handling
- policy changes
- exception rules

## Rollover engine
Carries forward:
- approved templates
- evergreen FAQ seeds
- stable course-family memory
- professor style preferences

Archives:
- due dates
- thread history
- run-specific announcements
- temporary exceptions

Outputs:
- new course-run scaffold
- diff report
- refreshed reminder plan

## Security model
Trust boundary: one professor-owned gateway.

Hard constraints:
- student content cannot trigger tool execution
- model cannot bypass policy engine
- sensitive categories must escalate
- all actions are logged

## Recommended repo structure
```text
superta/
  README.md
  AGENTS.md
  package.json
  plugins/
    superta/
      src/
  skills/
  templates/
  docs/
  evals/
```
