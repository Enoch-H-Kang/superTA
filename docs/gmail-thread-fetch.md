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

## Current behavior

This layer now sits on top of a live-capable Gmail client boundary.

It also includes basic reply-correctness behavior during normalization:
- prefer the latest external message over the assistant/professor's own latest message when possible
- preserve thread/reply metadata for downstream draft/send behavior

## Remaining limitation

This still depends on surrounding runtime/config scaffolds for full production behavior.
