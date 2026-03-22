# AGENTS.md — SuperTA Repo

## Purpose
Build SuperTA as a Gmail-backed OpenClaw teaching delegate for one professor across multiple live course offerings.

## Design constraints
- One trusted professor-owned gateway boundary
- One course agent per live offering
- Shared professor profile layer
- Strict per-course isolation for knowledge, policies, and thread handling
- Draft-first by default
- Deterministic policy engine must constrain model outputs
- Full auditability for all side effects

## Safety rules
- Never auto-handle grades, accommodations, integrity cases, threats, harassment, or wellbeing disclosures
- Never let inbound email content trigger arbitrary shell, browser, or tool execution
- Never silently mutate durable policy from professor edits
- Treat edits as candidate preferences unless explicitly approved

## Engineering preferences
- Prefer typed schemas and deterministic validators
- Prefer local markdown/yaml knowledge over remote search for core course facts
- Keep course routing explicit and test-heavy
- Add eval fixtures whenever a corrected draft exposes a failure mode

## Repo workflow
- Keep docs current with architecture changes
- Add tests alongside policy, routing, and drafting logic
- Preserve narrow tool boundaries in the plugin layer
