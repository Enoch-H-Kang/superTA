# SuperTA Responses HTTP Client Scaffold

This layer adds a more realistic path from SuperTA's classifier adapter to an HTTP-based Responses API client.

## Included

- `validateClassification(value)`
- `parseOpenAIResponsesOutput(response)`
- `parseResponsesClassificationResponse(raw)`
- `createResponsesHttpClient(fetchImpl, config)`

## Current behavior

- accepts either a direct `Classification` JSON object or a plausible nested Responses-style payload
- validates the extracted structure before passing it back into SuperTA
- throws on missing API key or non-OK HTTP responses

## Not yet included

- extraction from every possible real OpenAI Responses output variant
- retries / backoff
- rate-limit handling
- richer observability/logging

## Why this matters

It creates the seam for swapping the current mock client with a real API-backed classifier while preserving SuperTA's internal contract.
