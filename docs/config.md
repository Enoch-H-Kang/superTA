# SuperTA Config

SuperTA uses a central config object with these main sections:

- `professorId`
- `gmail`
- `routing`
- `courseRoots`
- `privacy`
- `localModel`

## Example

```json
{
  "professorId": "prof-enoch",
  "gmail": {
    "webhookPath": "/webhooks/gmail",
    "allowedProfessorSenders": ["prof@example.edu"]
  },
  "routing": {
    "professorId": "prof-enoch",
    "courses": [
      {
        "courseId": "cs101-sp26",
        "termId": "sp26",
        "aliases": ["cs101@school.edu"],
        "subjectHints": ["cs101"]
      }
    ]
  },
  "courseRoots": {
    "cs101-sp26": "/path/to/cs101-sp26"
  },
  "privacy": {
    "ferpaSafeMode": true,
    "allowExternalClassifier": false,
    "allowSend": false,
    "redactOperatorViews": true,
    "storeEvidenceSnippets": false
  },
  "localModel": {
    "required": true,
    "provider": "ollama",
    "endpoint": "http://127.0.0.1:11434"
  }
}
```

## Local model policy

The `localModel` block declares the only supported model posture for student-email workflows:

- `required`: if `true`, SuperTA refuses non-local model workflows
- `provider`: `stub`, `ollama`, `lm-studio`, `vllm`, or `custom-local`
- `endpoint`: required for non-`stub` providers and must point to a localhost/private HTTP(S) endpoint

## Privacy

The `privacy` block controls the conservative default posture:

- `ferpaSafeMode`: enables privacy-conscious defaults
- `allowExternalClassifier`: legacy/internal flag; external hosted classification is outside the supported student-data workflow
- `allowSend`: legacy/internal flag; supported workflow remains manual-send from Gmail
- `redactOperatorViews`: redacts inspection output
- `storeEvidenceSnippets`: stores raw evidence snippets in state

Recommended posture for real student data:
- keep `allowExternalClassifier: false`
- keep `allowSend: false`
- keep `redactOperatorViews: true`
- keep `storeEvidenceSnippets: false`

## Operational note

SuperTA may still persist structured student case records for legitimate course operations.
Prefer:
- structured facts
- workflow state
- thread/message linkage

over broad raw copied email persistence.

## Loading

Config is loaded through:
- `loadConfigFromFile(path)`

Missing fields fall back to `defaultConfig`.
