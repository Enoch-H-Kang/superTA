# Contributing to SuperTA

## Development loop

From the `superta/` directory:

```bash
npm install
npm run build
npm test
```

## Principles

When contributing, preserve these priorities:
- safety before autonomy
- explicit contracts before clever prompts
- deterministic guardrails around model output
- per-course isolation
- auditability for important actions

## Good places to contribute

- improve tests around routing/policy/drafting
- deepen provider integration scaffolds
- improve proposal application logic
- improve Gmail threading semantics
- tighten docs and onboarding

## Before opening a PR

Make sure:
- `npm run build` passes
- `npm test` passes
- docs are updated if behavior changed
- new logic has tests when practical
