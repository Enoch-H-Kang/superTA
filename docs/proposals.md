# SuperTA Proposal Application

SuperTA currently supports a lightweight proposal lifecycle for FAQ and policy changes.

## Current behavior

### FAQ proposals
Approved FAQ proposals are merged into `course/faq.md` as bullet items.
- duplicate entries are not re-added
- application is idempotent for the same payload

### Policy proposals
Approved policy proposals are merged into `course/policy.yaml` as simple YAML-style entries.
- payload text is converted into a sanitized key
- duplicate entries are not re-added
- this is still a scaffold, not a full semantic policy merge

## Review flow
1. proposal is created from `[SUPERTA FAQ]` or `[SUPERTA POLICY]`
2. proposal is reviewed and marked approved/rejected
3. approved proposal may be applied to the course files

## Caveat
This is safer and cleaner than append-only comments, but it is still a simplified merge strategy.
