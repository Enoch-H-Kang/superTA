# SuperTA Gmail Thread Fetch Scaffold

SuperTA now includes the next bridge from Gmail events into the main agent pipeline.

## Included

- thread normalization from Gmail thread messages
- fetch-and-process helper for a single thread target
- webhook-event to pipeline orchestration helper

## Intended flow

1. Gmail webhook arrives
2. history lookup derives changed thread targets
3. each target is fetched from Gmail
4. Gmail thread is normalized into SuperTA's internal thread shape
5. existing classifier/policy/queue pipeline runs

## Current limitation

The Gmail client is still mocked, so this is a realistic scaffold rather than a live Gmail integration.
