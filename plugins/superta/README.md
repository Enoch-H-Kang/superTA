# @openclaw/superta

SuperTA is an **OpenClaw plugin** for one professor across multiple live course offerings.

## Core promise

The default plugin story does **not** require any extra model API.

The core plugin is meant to work with:
- OpenClaw
- Gmail
- local course files
- deterministic policy logic
- human review workflows

## Optional advanced mode

An experimental Responses/OpenAI-backed classifier path exists in the repo, but it is optional and not required for the core plugin install story.

## What the plugin does

At the plugin boundary, SuperTA currently focuses on:
- loading SuperTA config
- registering the Gmail webhook route
- connecting the plugin runtime shell to the larger SuperTA core

## Config

The plugin currently expects a SuperTA config file path through:
- `superta.configPath`

If that is not provided, it falls back to:
- `local.config.json`

## Smoke test

After building from the repo root, you can smoke-test the plugin boundary with:

```bash
cd superta
node dist/plugins/superta/src/plugin/smoke-test.js config.example.json
```

## Related docs
- `../../README.md`
- `../../docs/getting-started.md`
- `../../docs/plugin-publish-checklist.md`
- `../../docs/responses-classifier.md`
