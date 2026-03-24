# SuperTA Plugin Publish Checklist

Use this checklist before publishing SuperTA publicly as an OpenClaw plugin.

## Core plugin checks
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] plugin smoke test passes
- [ ] plugin entrypoint loads and registers routes cleanly

## Default no-extra-API story
- [ ] default docs do **not** require OpenAI/API keys
- [ ] interactive setup works without extra model API
- [ ] doctor report works without extra model API
- [ ] README clearly says the supported workflow does not use external model-backed classification

## Setup/onboarding
- [ ] interactive setup path works
- [ ] doctor/doctor-report output is readable
- [ ] multi-course onboarding docs are understandable

## Gmail/runtime
- [ ] Gmail auth path is documented
- [ ] watch registration/renewal paths are documented
- [ ] production caveats are explicit

## Safety/evals
- [ ] safety evals pass
- [ ] classifier fixture evals pass
- [ ] fail-closed behavior is tested

## Advanced optional mode
- [ ] Responses/OpenAI path is documented as optional
- [ ] live comparison mode is documented as optional

## Public messaging
- [ ] README frames SuperTA as an experimental OpenClaw plugin
- [ ] no copy implies turnkey production Gmail deployment
- [ ] no copy implies autonomous academic decision-making
