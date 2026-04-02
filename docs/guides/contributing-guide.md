# Contributing Guide

## Who This Serves

- new contributors
- maintainers reviewing changes
- AI agents preparing a clean handoff

## Working Style

Contributions should preserve these project values:

- honest migration behavior
- structured-content-first design
- explicit fallbacks over silent loss
- narrow module boundaries

## Before You Change Code

- read the relevant shared types first
- identify downstream consumers
- inspect nearby tests
- inspect docs that describe the same behavior

## Expected Verification

Run:

```bash
corepack pnpm build
corepack pnpm typecheck
corepack pnpm test
```

If you changed CLI behavior, also run at least one CLI smoke test.

## Documentation Expectation

If your change affects behavior, update the docs in the same pull request or handoff batch.

Especially update:

- architecture docs if flow or contracts change
- agent docs if safe/risky edit zones change
- audit docs if the risk profile changes

## Review Mindset

Prefer asking:

- does this preserve semantics?
- does this preserve recovery data?
- does this widen or narrow blast radius?
- does the documentation still match the code?

