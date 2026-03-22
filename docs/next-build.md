# Next Build Targets

After the current scaffold, the most sensible implementation order is:

1. real tests for routing and policy engine
2. course file loaders for syllabus/faq/policy/schedule
3. richer typed schemas for audit, routing, and classification
4. Gmail integration boundary design
5. review queue and action executor contracts

## Why this order
- routing and policy are the safety-critical core
- retrieval should be grounded before fancy drafting
- Gmail side effects should come after internal contracts are stable
