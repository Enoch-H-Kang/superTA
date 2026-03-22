# SuperTA Config

SuperTA uses a central config object with four main sections:

- `professorId`
- `gmail`
- `routing`
- `courseRoots`

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
  }
}
```

## Loading

The scaffold currently supports JSON config loading through:
- `loadConfigFromFile(path)`

Missing fields fall back to defaults from `defaultConfig`.
