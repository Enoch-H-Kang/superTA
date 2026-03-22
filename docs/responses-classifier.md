# SuperTA Responses Classifier Scaffold

This scaffold adds a model-adapter boundary for future Responses API integration.

## Current pieces

- `buildResponsesRequest(config, input)`
- `createResponsesClassifierProvider(config, client)`
- `createMockResponsesClient(response)`

## Purpose

The goal is to keep the classifier pipeline stable while swapping in a real model-backed client later.

## Current status

- request shape is defined
- provider interface is compatible with the async classifier boundary
- tests use a mock client
- no live API calls are made yet

## Next likely step

Implement a real client that maps Responses API output into the `Classification` schema.
