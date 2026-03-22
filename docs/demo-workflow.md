# SuperTA Demo Workflow

This repo now contains a first vertical-slice demo workflow for a routine deadline email.

## Covered path

1. student sends a deadline-related email
2. SuperTA routes it to the correct course offering
3. course facts are retrieved
4. classifier marks it as a routine deadline issue
5. policy engine allows a draft/review path
6. review item is stored
7. professor approves with `[SUPERTA APPROVE] <review-item-id>`
8. approved item is sent through the Gmail send path
9. review item is persisted as `sent`

## Code

- `plugins/superta/src/demo/deadline-workflow.ts`
- `plugins/superta/test/deadline-workflow.test.ts`

## Why this matters

This is the first concrete end-to-end workflow in the scaffold that demonstrates a believable product slice rather than only isolated modules.

## Caveat

The Gmail and classifier integrations are still scaffolded/mocked, but the orchestration path is now explicit and test-covered.
