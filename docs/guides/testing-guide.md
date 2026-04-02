# Testing Guide

## Who This Serves

- contributors adding logic
- reviewers assessing coverage quality
- agents making changes safely

## Current Test Stack

- `vitest`
- fixture package in `packages/test-fixtures`

## What Is Covered Today

- WXR parsing
- REST normalization
- shortcode detection
- difficulty scoring
- transform fallback behavior
- artifact generation

## Run Tests

```bash
corepack pnpm test
corepack pnpm typecheck
```

## When To Add A Test

Add or update tests when you change:

- a parser
- a detector
- scoring
- transform behavior
- artifact shape
- CLI behavior that changes observable output

## Fixture Guidance

Prefer:

- small but realistic fixtures
- one fixture reused across several related tests
- explicit risky content samples when testing warnings/fallbacks

Avoid:

- micro-fixtures that do not resemble real WordPress data
- tests that only assert implementation details without user-visible impact

