# Next Build Targets

After the current live Gmail smoke-test milestone, the most sensible implementation order is:

1. real Gmail runtime integration
2. Gmail OAuth token refresh support
3. Gmail webhook/watch/idempotent inbound processing
4. live classifier provider wiring
5. reply-correctness fixes and richer live Gmail metadata
6. additional end-to-end vertical slices
7. pilot-ready packaging and onboarding

## Why this order
- the repo has already crossed the provider boundary for live Gmail read/fetch/draft
- the highest-value gap is turning that into actual plugin/runtime behavior instead of standalone smoke tests
- token refresh is the biggest blocker to a sustainable Gmail integration
- inbound webhook/watch processing is what turns the system from manual testing into an actual delegate
- classifier/runtime wiring should come after transport is dependable and auditable
- polishing reply correctness matters, but it is not as strategically important as sustainable auth + inbound delivery
