# FERPA-Conscious Defaults

SuperTA ships with a conservative, privacy-conscious default posture for student-email workflows.

## Default posture

- local-model or deterministic-only handling
- no supported external API path for student-data processing
- manual send from Gmail
- redacted operator views
- redacted evidence snippets by default
- sensitive categories escalate instead of being casually resolved
- structured student case records instead of broad raw-transcript persistence

## Default privacy config

```json
{
  "privacy": {
    "ferpaSafeMode": true,
    "allowExternalClassifier": false,
    "allowSend": false,
    "redactOperatorViews": true,
    "storeEvidenceSnippets": false
  }
}
```

## What this means in practice

### 1. Local or institution-controlled student-data handling
SuperTA’s supported workflow keeps student-data processing inside local or institution-controlled systems.

Hosted third-party model APIs are not part of the supported student-data path.

### 2. No supported runtime send
SuperTA’s supported posture is:
- create drafts
- review drafts
- professor sends manually from Gmail

### 3. Redacted operator views
Inspection output redacts sensitive student-facing fields by default.

### 4. Structured case storage
SuperTA may store structured operational facts needed for course administration, such as:
- who requested an extension
- who requested an exam time change
- which thread/message the request came from
- current status and sensitivity
- case history/events

The goal is to store **facts and workflow state**, not unnecessary raw transcript copies everywhere.

## Recommended public framing

Good framing:
- privacy-conscious by design
- local or institution-controlled student-data handling
- no supported external API path for student-data processing
- draft/review/manual-send workflow

Avoid overclaiming legal guarantees.
