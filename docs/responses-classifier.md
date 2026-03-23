# SuperTA Responses Classifier

This is the **optional advanced** classifier path.

## Important

SuperTA’s default public/plugin story does **not** require OpenAI or any extra model API.

The Responses-backed classifier is:
- optional
- advanced
- experimental
- useful for prompt hardening and classifier experimentation

## What exists

- runtime classifier selection (`stub` or `responses`)
- Responses adapter
- Responses HTTP client
- fixture-based classifier evals
- live comparison mode for fixture mismatches

## When to use this

Use this path if you want to:
- experiment with model-backed classification
- compare live model outputs to the fixture corpus
- harden prompts against tricky cases

## What you need

Typical env:
- `SUPERTA_CLASSIFIER_PROVIDER=responses`
- `OPENAI_API_KEY=...`

Optional overrides:
- `SUPERTA_RESPONSES_MODEL`
- `SUPERTA_RESPONSES_SYSTEM_PROMPT`
- `SUPERTA_RESPONSES_API_KEY_ENV`
- `SUPERTA_RESPONSES_ENDPOINT`

## Live comparison mode

```bash
export SUPERTA_CLASSIFIER_PROVIDER=responses
export OPENAI_API_KEY='...'
node dist/evals/run-live-responses-fixtures.js
```

This reports fixture-by-fixture mismatches so you can inspect drift and refine prompts.

## Recommendation

Treat this as an experimental extension.
Do **not** make it the default requirement for installing or trying SuperTA.
